"""KrishiAI chat orchestrator — the brain.

Pipeline:
  1. Resolve session + language (script/keyword first, then langdetect).
  2. Inject KrishiAI agri system prompt + language contract + (if present)
     a user-location hint the model can use when calling weather tools.
  3. Call the LLM with tool schemas attached.
  4. If the LLM requests tools, execute them in parallel, append results,
     and loop (bounded by MAX_TOOL_ROUNDS).
  5. Stream the final textual content back as Server-Sent Events.
  6. Persist the final user+assistant turn into the session store.

Non-streaming callers use `chat_once(...)` and get one JSON reply.
The existing POST /api/chat/ legacy endpoint is kept elsewhere (backward
compatibility for the old /chatbot page).
"""
from __future__ import annotations

import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, AsyncIterator, Dict, List, Optional

from core.config import settings
from schemas.chatbot import (
    AssistantReply,
    AssistantRequest,
    LocationHint,
    Message,
    SessionState,
)
from services.chat.knowledge import format_knowledge_context
from services.chat.language_detect import resolve_language
from services.chat.memory import sessions, SessionStore
from services.chat.prompts import TOOL_SCHEMAS, build_system_messages
from services.chat.tools import enabled_tools, run_tool

log = logging.getLogger(__name__)

MAX_TOOL_ROUNDS = 3          # safety net — prevents infinite tool loops
TOOL_PARALLEL = True
STREAM_CHUNK_YIELD_MS = 20   # tiny pacing so front-end renders smoothly


class ChatError(Exception):
    pass


# ---------------------------------------------------------------------------
# Main orchestrator
# ---------------------------------------------------------------------------
class ChatOrchestrator:
    def __init__(self) -> None:
        self._client = None
        self._client_lock = asyncio.Lock()
        self._effective_model: str = settings.OPENAI_CHAT_MODEL or "gemini-2.0-flash"
        self._is_gemini_direct: bool = False  # set in _client_ready()
        # Fallback chain for Gemini direct — broad list ordered by general
        # availability across both free-tier and older API keys. The orchestrator
        # auto-rotates on NOT_FOUND so whatever your key has access to wins.
        self._gemini_model_fallbacks: List[str] = [
            "gemini-2.0-flash",
            "gemini-2.0-flash-001",
            "gemini-2.0-flash-exp",
            "gemini-2.0-flash-lite",
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash-8b",
            "gemini-1.5-flash-002",
            "gemini-1.5-pro-latest",
            "gemini-2.5-flash",
            "gemini-pro",
        ]

    async def _client_ready(self):
        if self._client is not None:
            return self._client
        async with self._client_lock:
            if self._client is not None:
                return self._client

            # Smart routing: prefer GEMINI_API_KEY when set, but auto-detect
            # whether it's a direct Google key (AIza...) or an OpenRouter key.
            gemini_key = (settings.GEMINI_API_KEY or "").strip()
            openai_key = (settings.OPENAI_API_KEY or "").strip()

            if gemini_key and gemini_key.startswith("AIza"):
                # Direct Google Gemini key → use Google's OpenAI-compatible endpoint
                key = gemini_key
                base_url = "https://generativelanguage.googleapis.com/v1beta/openai/"
                self._is_gemini_direct = True
                # gemini-2.0-flash is the current GA flagship; gemini-1.5-* was
                # retired in April 2025. We try a sensible default but the call
                # site has a NOT_FOUND-aware fallback chain.
                model_setting = settings.OPENAI_CHAT_MODEL or ""
                if (
                    not model_setting
                    or "/" in model_setting
                    or model_setting.startswith("gpt-")
                    or model_setting.startswith("gemini-1.5")
                ):
                    self._effective_model = "gemini-2.0-flash"
                else:
                    self._effective_model = model_setting
                log.info("Chat client → Google Gemini direct (model=%s)", self._effective_model)
            elif openai_key:
                # Standard OpenAI / OpenRouter / compatible
                key = openai_key
                base_url = settings.OPENAI_BASE_URL  # may be None → default OpenAI
                self._effective_model = settings.OPENAI_CHAT_MODEL or "gpt-4o-mini"
                log.info("Chat client → OpenAI-compat endpoint (base=%s, model=%s)",
                         base_url or "default", self._effective_model)
            elif gemini_key:
                # Gemini key but not AIza prefix — assume OpenRouter-style
                key = gemini_key
                base_url = settings.OPENAI_BASE_URL
                self._effective_model = settings.OPENAI_CHAT_MODEL or "google/gemini-2.0-flash-001"
                log.info("Chat client → OpenRouter via GEMINI_API_KEY (model=%s)",
                         self._effective_model)
            else:
                raise ChatError("GEMINI_API_KEY or OPENAI_API_KEY not configured on the server.")

            if len(key) < 20:
                raise ChatError("API key looks invalid (too short).")

            try:
                from openai import AsyncOpenAI  # type: ignore
            except Exception as e:
                raise ChatError(f"openai SDK not installed: {e}") from e

            self._client = AsyncOpenAI(
                api_key=key,
                base_url=base_url,
                timeout=settings.API_TIMEOUT * 5,
            )
            return self._client

    # ------------------------------------------------------------------
    # Public — streaming (SSE) chat
    # ------------------------------------------------------------------
    async def stream_chat(self, req: AssistantRequest) -> AsyncIterator[Dict[str, Any]]:
        """Yield SSE event dicts: {event, data}."""
        session, user_msg = await self._ingest(req)

        try:
            client = await self._client_ready()
        except ChatError as e:
            yield self._evt("error", {"message": str(e)})
            return

        lang = resolve_language(req.language, req.message)
        system_msgs = build_system_messages(
            lang,
            req.location.model_dump() if req.location else (
                session.location.model_dump() if session.location else None
            ),
            user_message=req.message,
            has_image=bool(getattr(req, "image_base64", None)),
        )

        # RAG: pull curated agri facts relevant to this query and inject as a
        # system message. Grounds the model in verified Indian-specific data.
        kb_context = format_knowledge_context(req.message, k=4)
        if kb_context:
            system_msgs.append({"role": "system", "content": kb_context})

        prior = SessionStore.trim_for_prompt(session.messages[:-1])  # exclude the just-appended user msg
        openai_history = self._to_openai_messages(prior)
        # If a leaf/plant image was provided, send it as a vision-style multipart
        # user message so GPT-4o can actually look at the photo.
        if getattr(req, "image_base64", None):
            img = req.image_base64
            if not img.startswith("data:"):
                img = "data:image/jpeg;base64," + img
            openai_history.append({
                "role": "user",
                "content": [
                    {"type": "text", "text": req.message},
                    {"type": "image_url", "image_url": {"url": img}},
                ],
            })
        else:
            openai_history.append({"role": "user", "content": req.message})

        messages = system_msgs + openai_history
        used_tools: List[str] = []
        full_text = ""
        finish_reason: Optional[str] = None

        yield self._evt("session", {"session_id": session.id, "language": lang})

        for round_idx in range(MAX_TOOL_ROUNDS + 1):
            # Non-streaming call when we still might need tools; stream only
            # on the final pass. This is the standard OpenAI pattern and
            # guarantees clean tool-argument JSON.
            need_tools = round_idx < MAX_TOOL_ROUNDS
            if need_tools:
                # Resilient call: try with tools, then no-tools, with model
                # fallback if the current model returns NOT_FOUND.
                resp, last_err = await self._call_with_fallbacks(
                    client, messages, with_tools=True, stream=False
                )
                if resp is None:
                    log.exception("LLM call failed permanently: %s", last_err)
                    yield self._evt("error", {"message": f"LLM error: {last_err}"})
                    return

                choice = resp.choices[0]
                msg = choice.message
                tool_calls = getattr(msg, "tool_calls", None) or []

                if not tool_calls:
                    # No tools needed — emit content and finish.
                    content = (msg.content or "").strip()
                    full_text = content
                    for piece in _chunk_for_ui(content):
                        yield self._evt("token", {"text": piece})
                        await asyncio.sleep(STREAM_CHUNK_YIELD_MS / 1000)
                    finish_reason = choice.finish_reason
                    break

                # Emit tool-use event so UI can show "Fetching weather…".
                for tc in tool_calls:
                    used_tools.append(tc.function.name)
                    yield self._evt("tool_start", {"name": tc.function.name})

                # Execute tools (in parallel).
                messages.append(_assistant_tool_message(msg))  # assistant msg containing tool_calls
                results = await _execute_tools(tool_calls)
                for tc, result in zip(tool_calls, results):
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tc.id,
                        "name": tc.function.name,
                        "content": json.dumps(result, ensure_ascii=False)[:4000],
                    })
                    yield self._evt("tool_end", {"name": tc.function.name, "ok": "error" not in result})
                # Continue to next round.
                continue

            # Final pass — non-streamed (the resilient helper handles model
            # fallback). Then we chunk the output to give a streamy feel.
            resp2, err2 = await self._call_with_fallbacks(
                client, messages, with_tools=False, stream=False
            )
            if resp2 is None:
                log.exception("LLM final call failed: %s", err2)
                yield self._evt("error", {"message": f"LLM error: {err2}"})
                return
            content = (resp2.choices[0].message.content or "").strip()
            full_text = content
            for piece in _chunk_for_ui(content):
                yield self._evt("token", {"text": piece})
                await asyncio.sleep(STREAM_CHUNK_YIELD_MS / 1000)
            finish_reason = "stop"
            break

        # Persist assistant message
        assistant_msg = Message(
            id=uuid.uuid4().hex,
            role="assistant",
            content=full_text,
            language=lang,
            created_at=datetime.now(timezone.utc),
            tool_name=",".join(used_tools) if used_tools else None,
        )
        await sessions.append(session.id, assistant_msg)

        yield self._evt("done", {
            "session_id": session.id,
            "message_id": assistant_msg.id,
            "language": lang,
            "used_tools": used_tools,
            "finish_reason": finish_reason,
        })

    # ------------------------------------------------------------------
    # Public — non-streaming one-shot (also used by the legacy endpoint)
    # ------------------------------------------------------------------
    async def chat_once(self, req: AssistantRequest) -> AssistantReply:
        collected: List[str] = []
        session_id = ""
        message_id = ""
        language = resolve_language(req.language, req.message)
        used_tools: List[str] = []
        finish_reason: Optional[str] = None

        async for evt in self.stream_chat(req):
            et = evt.get("event")
            data = evt.get("data", {})
            if et == "session":
                session_id = data.get("session_id", "")
                language = data.get("language", language)
            elif et == "token":
                collected.append(data.get("text", ""))
            elif et == "tool_start":
                used_tools.append(data.get("name", ""))
            elif et == "done":
                message_id = data.get("message_id", "")
                finish_reason = data.get("finish_reason")
            elif et == "error":
                raise ChatError(data.get("message", "Unknown error"))

        return AssistantReply(
            session_id=session_id,
            message_id=message_id,
            content="".join(collected).strip(),
            language=language,  # type: ignore[arg-type]
            used_tools=used_tools,
            provider=f"openai:{self._effective_model}",
            finish_reason=finish_reason,
        )

    # ------------------------------------------------------------------
    # Internals
    # ------------------------------------------------------------------
    async def _ingest(self, req: AssistantRequest) -> tuple[SessionState, Message]:
        """Load or create session, append user message."""
        session: Optional[SessionState] = None
        if req.session_id:
            session = await sessions.get(req.session_id)
        if not session:
            session = await sessions.create(
                language=req.language,
                location=req.location,
            )
        # Update location if the new request provides one.
        if req.location and (req.location.lat is not None or req.location.city):
            session.location = req.location

        user_msg = Message(
            id=uuid.uuid4().hex,
            role="user",
            content=req.message,
            language=resolve_language(req.language, req.message),  # type: ignore[arg-type]
            created_at=datetime.now(timezone.utc),
        )
        await sessions.append(session.id, user_msg)
        session = await sessions.get(session.id) or session
        return session, user_msg

    async def _call_with_fallbacks(
        self,
        client: Any,
        messages: List[Dict[str, Any]],
        with_tools: bool,
        stream: bool,
    ) -> tuple[Any, Optional[Exception]]:
        """Call the LLM with model + tool fallbacks. Returns (response, last_error).

        Strategy:
          1. Try current model with tools (if requested).
          2. If error mentions NOT_FOUND or 404, switch to next fallback model
             and retry (only when we are on the Gemini direct path).
          3. If error is anything else and tools were requested, retry without tools.
          4. Return None on permanent failure.
        """
        last_err: Optional[Exception] = None
        # Build a model attempt list: current model first, then any fallbacks
        # not yet tried (only meaningful for Gemini direct path).
        attempt_models: List[str] = [self._effective_model]
        if self._is_gemini_direct:
            for m in self._gemini_model_fallbacks:
                if m not in attempt_models:
                    attempt_models.append(m)

        for model_name in attempt_models:
            base_kwargs: Dict[str, Any] = dict(
                model=model_name,
                messages=messages,
                temperature=0.3,
                max_tokens=600,
            )
            if stream:
                base_kwargs["stream"] = True
            attempts: List[tuple[Dict[str, Any], str]] = []
            if with_tools:
                attempts.append((dict(base_kwargs, tools=TOOL_SCHEMAS, tool_choice="auto"), "with-tools"))
            attempts.append((base_kwargs, "no-tools"))

            for kwargs, label in attempts:
                try:
                    resp = await client.chat.completions.create(**kwargs)
                    if model_name != self._effective_model:
                        log.warning("LLM model auto-switched: %s → %s", self._effective_model, model_name)
                        self._effective_model = model_name
                    if label == "no-tools" and with_tools:
                        log.warning("LLM tools dropped for this turn (%s).", model_name)
                    return resp, None
                except Exception as e:
                    last_err = e
                    msg = str(e).lower()
                    log.warning("LLM call failed (model=%s, %s): %s", model_name, label, e)
                    # NOT_FOUND / 404 → break out of inner loop and try next model
                    if "not_found" in msg or "404" in msg or "is not found" in msg:
                        break
                    # other error: keep iterating attempts (will try no-tools next)
                    continue
            # if we reach here for this model_name, all attempts failed; only
            # continue to next model if it's a NOT_FOUND-style error.
            if last_err is not None:
                em = str(last_err).lower()
                if not ("not_found" in em or "404" in em or "is not found" in em):
                    break

        return None, last_err

    @staticmethod
    def _to_openai_messages(messages: List[Message]) -> List[Dict[str, Any]]:
        out: List[Dict[str, Any]] = []
        for m in messages:
            if m.role == "tool":
                continue  # we don't replay past tool results
            out.append({"role": m.role, "content": m.content})
        return out

    @staticmethod
    def _evt(event: str, data: Dict[str, Any]) -> Dict[str, Any]:
        return {"event": event, "data": data}


def _assistant_tool_message(msg: Any) -> Dict[str, Any]:
    """Serialise an OpenAI assistant message containing tool_calls."""
    tcs = []
    for tc in (getattr(msg, "tool_calls", None) or []):
        tcs.append({
            "id": tc.id,
            "type": "function",
            "function": {"name": tc.function.name, "arguments": tc.function.arguments},
        })
    return {"role": "assistant", "content": msg.content or "", "tool_calls": tcs}


async def _execute_tools(tool_calls: List[Any]) -> List[Dict[str, Any]]:
    """Run tool_calls (possibly in parallel) and return the results in order."""
    async def _one(tc: Any) -> Dict[str, Any]:
        try:
            args = json.loads(tc.function.arguments or "{}")
        except json.JSONDecodeError:
            args = {}
        return await run_tool(tc.function.name, args)

    if TOOL_PARALLEL and len(tool_calls) > 1:
        return await asyncio.gather(*(_one(tc) for tc in tool_calls))
    results = []
    for tc in tool_calls:
        results.append(await _one(tc))
    return results


def _chunk_for_ui(text: str, chunk_size: int = 8) -> List[str]:
    """Split a non-streamed answer into small chunks for progressive UI paint."""
    if not text:
        return []
    return [text[i : i + chunk_size] for i in range(0, len(text), chunk_size)]


# ---------------------------------------------------------------------------
# Singleton accessor
# ---------------------------------------------------------------------------
_orchestrator_singleton: Optional[ChatOrchestrator] = None


def get_orchestrator() -> ChatOrchestrator:
    global _orchestrator_singleton
    if _orchestrator_singleton is None:
        _orchestrator_singleton = ChatOrchestrator()
    return _orchestrator_singleton


def health_info() -> Dict[str, Any]:
    orch = get_orchestrator()
    key = (settings.GEMINI_API_KEY or settings.OPENAI_API_KEY or "").strip()
    return {
        "llm_configured": bool(key and len(key) > 20),
        "model": orch._effective_model,
        "memory_backend": sessions.backend_name,
        "tools_enabled": enabled_tools(),
    }
