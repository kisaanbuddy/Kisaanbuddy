"""KisaanBuddy chat orchestrator — powered by the official Google Gen AI SDK.

Pipeline:
  1. Resolve or create session (optionally bound to authenticated user_id).
  2. Validate & resize any uploaded crop/document image via Pillow (`prepare_crop_image`).
  3. Resolve language (script/keyword detection + explicit choice) & build
     agricultural system instruction + BM25 KB grounding + farmer context.
  4. Check non-personal TTL response cache to reduce redundant paid API calls.
  5. Stream responses via `google-genai` (`client.aio.models.generate_content_stream`)
     with native Gemini function calling (`tools.py`), bounded retries, timeouts,
     and token usage tracking.
  6. Persist conversation turn into SessionStore.
"""
from __future__ import annotations

import asyncio
import json
import logging
import re
import uuid
from datetime import datetime, timezone
from typing import Any, AsyncIterator, Dict, List, Optional, Tuple

from core.config import settings
from schemas.chatbot import (
    AssistantReply,
    AssistantRequest,
    Message,
    SessionState,
)
from services.chat.farmer_context import format_farmer_context
from services.chat.gemini_service import (
    GeminiBadRequestError,
    GeminiConfigError,
    GeminiError,
    build_gemini_tools,
    extract_usage_counts,
    get_model_chain,
    is_gemini_configured,
    prepare_crop_image,
    redact_secrets,
    response_cache,
    stream_with_retry,
    usage_tracker,
)
from services.chat.knowledge import format_knowledge_context
from services.chat.language_detect import resolve_language
from services.chat.memory import SessionStore, sessions
from services.chat.prompts import TOOL_SCHEMAS, build_system_messages
from services.chat.tools import enabled_tools, run_tool

log = logging.getLogger(__name__)

MAX_TOOL_ROUNDS = 3
TOOL_PARALLEL = True

_LIVE_OR_PERSONAL_HINTS = (
    "weather", "mausam", "forecast", "rain", "barish", "ಹವಾಮಾನ", "ಮಳೆ",
    "mandi", "bhav", "rate", "price", "दाम", "भाव", "मंडी", "ಮಂಡಿ", "ದರ",
    "today", "tomorrow", "kal", "parso", "aaj", "आज", "कल", "ಇಂದು", "ನಾಳೆ",
    "job", "mazdoor", "majdoor", "worker", "post_job", "kelasa", "ಮಜ್ದೂರ",
    "my farm", "mere khet", "my field", "soil test", "farmer local context",
)
_LOCAL_CTX_PREFIX_RE = re.compile(r"^\[FARMER LOCAL CONTEXT:[^\]]+\]\s*(?:Farmer Query:\s*)?", re.IGNORECASE)


class ChatError(Exception):
    def __init__(
        self,
        message: str,
        *,
        status_code: int = 503,
        code: str = "chat_error",
    ) -> None:
        super().__init__(redact_secrets(message))
        self.status_code = status_code
        self.code = code


def _strip_farm_context_prefix(text: str) -> str:
    return _LOCAL_CTX_PREFIX_RE.sub("", (text or "").strip()).strip()


def _is_cacheable_query(
    message: str,
    *,
    has_image: bool,
    has_prior: bool,
    has_farmer_context: bool,
    has_location: bool,
) -> bool:
    if has_image or has_prior or has_farmer_context or has_location:
        return False
    clean = _strip_farm_context_prefix(message)
    if not clean or len(clean) > 240:
        return False
    low = clean.lower()
    if any(tok in low for tok in _LIVE_OR_PERSONAL_HINTS):
        return False
    return True


def _chunk_text(text: str, chunk_size: int = 24) -> List[str]:
    if not text:
        return []
    return [text[i : i + chunk_size] for i in range(0, len(text), chunk_size)]


class ChatOrchestrator:
    def __init__(self) -> None:
        self._effective_model: str = settings.GEMINI_MODEL
        self._effective_vision_model: str = settings.GEMINI_VISION_MODEL
        self._gemini_tools = None

    def _get_tools(self):
        if self._gemini_tools is None:
            self._gemini_tools = build_gemini_tools(TOOL_SCHEMAS)
        return self._gemini_tools

    # ------------------------------------------------------------------
    # Public — streaming (SSE) chat
    # ------------------------------------------------------------------
    async def stream_chat(
        self,
        req: AssistantRequest,
        farmer_context: Optional[dict[str, Any]] = None,
        user_id: Optional[int] = None,
    ) -> AsyncIterator[Dict[str, Any]]:
        """Yield SSE event dicts: {event, data}."""
        # 1. Validate & optimize uploaded image BEFORE creating session or calling Gemini
        opt_image: Optional[Tuple[bytes, str, Dict[str, Any]]] = None
        if req.image_base64:
            try:
                opt_image = prepare_crop_image(req.image_base64)
            except GeminiBadRequestError as e:
                yield self._evt(
                    "error",
                    {"message": e.user_message, "code": e.code, "status_code": e.status_code},
                )
                return

        if not is_gemini_configured():
            err = GeminiConfigError()
            yield self._evt(
                "error",
                {"message": err.user_message, "code": err.code, "status_code": err.status_code},
            )
            return

        session, _ = await self._ingest(req, user_id=user_id)
        lang = resolve_language(req.language, _strip_farm_context_prefix(req.message))
        has_image = opt_image is not None

        yield self._evt("session", {"session_id": session.id, "language": lang})

        prior_raw = session.messages[:-1]
        max_history = max(0, int(settings.GEMINI_MAX_HISTORY_TURNS))
        prior = SessionStore.trim_for_prompt(prior_raw, max_turns=max_history)

        loc_dict = (
            req.location.model_dump()
            if req.location
            else (session.location.model_dump() if session.location else None)
        )

        # 2. Cost optimization: serve non-personal general agri queries from cache
        cache_key: Optional[str] = None
        if _is_cacheable_query(
            req.message,
            has_image=has_image,
            has_prior=bool(prior),
            has_farmer_context=bool(farmer_context),
            has_location=bool(loc_dict and (loc_dict.get("lat") is not None or loc_dict.get("city"))),
        ):
            cache_key = response_cache.build_key(
                _strip_farm_context_prefix(req.message),
                lang,
                settings.GEMINI_MODEL,
            )
            cached_payload = await response_cache.get(cache_key)
            if cached_payload and cached_payload.get("content"):
                cached_text = str(cached_payload["content"])
                usage_tracker.record(
                    feature="chat",
                    model=cached_payload.get("model", settings.GEMINI_MODEL),
                    cached=True,
                    status="ok",
                )
                for piece in _chunk_text(cached_text):
                    yield self._evt("token", {"text": piece})
                assistant_msg = Message(
                    id=uuid.uuid4().hex,
                    role="assistant",
                    content=cached_text,
                    language=lang,  # type: ignore[arg-type]
                    created_at=datetime.now(timezone.utc),
                    tool_name=None,
                )
                await sessions.append(session.id, assistant_msg)
                yield self._evt(
                    "done",
                    {
                        "session_id": session.id,
                        "message_id": assistant_msg.id,
                        "language": lang,
                        "used_tools": [],
                        "finish_reason": "stop",
                        "cached": True,
                        "model": cached_payload.get("model", settings.GEMINI_MODEL),
                        "usage": {"prompt_tokens": 0, "output_tokens": 0, "total_tokens": 0},
                    },
                )
                return

        # 3. Build system instruction (agricultural prompt + safety + farmer context + BM25 KB)
        clean_user_text = _strip_farm_context_prefix(req.message) or req.message
        system_msgs = build_system_messages(
            lang,
            loc_dict,
            user_message=clean_user_text,
            has_image=has_image,
            farmer_context=format_farmer_context(farmer_context),
        )
        kb_context = format_knowledge_context(clean_user_text, k=4)
        if kb_context:
            system_msgs.append({"role": "system", "content": kb_context})
        system_instruction = "\n\n".join(m["content"] for m in system_msgs if m.get("content"))

        # 4. Build Gemini Contents from trimmed history + current user turn
        from google.genai import types

        contents: List[types.Content] = self._to_gemini_contents(prior)
        user_parts: List[types.Part] = []
        if opt_image is not None:
            opt_bytes, opt_mime, img_meta = opt_image
            log.info(
                "Optimized crop image %s -> %s (saved %d bytes)",
                img_meta.get("original_dimensions"),
                img_meta.get("final_dimensions"),
                img_meta.get("bytes_saved", 0),
            )
            user_parts.append(types.Part.from_bytes(data=opt_bytes, mime_type=opt_mime))
        user_parts.append(types.Part.from_text(text=req.message))
        contents.append(types.Content(role="user", parts=user_parts))

        used_tools: List[str] = []
        full_text_parts: List[str] = []
        finish_reason: Optional[str] = "stop"
        active_model = settings.GEMINI_VISION_MODEL if has_image else settings.GEMINI_MODEL
        agg_usage = {"prompt_tokens": 0, "output_tokens": 0, "thoughts_tokens": 0, "total_tokens": 0}

        try:
            if has_image:
                # Multimodal vision stream (crop leaf/soil/document image)
                last_chunk_usage: Dict[str, int] = {}
                async for chunk, used_model in stream_with_retry(
                    contents=contents,
                    feature="vision_diagnosis",
                    models=get_model_chain(for_vision=True),
                    system_instruction=system_instruction,
                    temperature=0.15,
                    max_output_tokens=settings.GEMINI_VISION_MAX_OUTPUT_TOKENS,
                    tools=None,
                ):
                    active_model = used_model
                    self._effective_vision_model = used_model
                    c_usage = extract_usage_counts(chunk)
                    if c_usage["total_tokens"] or c_usage["prompt_tokens"]:
                        last_chunk_usage = c_usage
                    txt = getattr(chunk, "text", None)
                    if txt:
                        full_text_parts.append(txt)
                        yield self._evt("token", {"text": txt})
                    cands = getattr(chunk, "candidates", None) or []
                    if cands and getattr(cands[0], "finish_reason", None):
                        finish_reason = str(cands[0].finish_reason).lower()
                agg_usage = last_chunk_usage or agg_usage
                if opt_image is not None and opt_image[2].get("bytes_saved", 0) > 0:
                    usage_tracker.record(
                        feature="vision_image_resize",
                        model=active_model,
                        cached=True,
                        status="ok",
                        image_bytes_saved=opt_image[2]["bytes_saved"],
                    )
            else:
                # Text + native Gemini function calling + streaming
                gemini_tools = self._get_tools()
                for round_idx in range(MAX_TOOL_ROUNDS + 1):
                    allow_tools = round_idx < MAX_TOOL_ROUNDS
                    round_tool_calls: List[Any] = []
                    round_model_parts: List[Any] = []
                    round_text_parts: List[str] = []
                    round_usage: Dict[str, int] = {}

                    async for chunk, used_model in stream_with_retry(
                        contents=contents,
                        feature="chat",
                        models=get_model_chain(for_vision=False),
                        system_instruction=system_instruction,
                        temperature=0.3,
                        max_output_tokens=settings.GEMINI_MAX_OUTPUT_TOKENS,
                        tools=gemini_tools if allow_tools else None,
                    ):
                        active_model = used_model
                        self._effective_model = used_model
                        c_usage = extract_usage_counts(chunk)
                        if c_usage["total_tokens"] or c_usage["prompt_tokens"]:
                            round_usage = c_usage

                        cands = getattr(chunk, "candidates", None) or []
                        if cands:
                            cand = cands[0]
                            if getattr(cand, "finish_reason", None):
                                finish_reason = str(cand.finish_reason).lower()
                            content_obj = getattr(cand, "content", None)
                            for part in getattr(content_obj, "parts", None) or []:
                                if getattr(part, "function_call", None) is not None:
                                    round_model_parts.append(part)
                                    round_tool_calls.append(part.function_call)
                                elif getattr(part, "thought_signature", None) is not None and getattr(part, "text", None) is None:
                                    round_model_parts.append(part)

                        txt = getattr(chunk, "text", None)
                        if txt:
                            round_text_parts.append(txt)
                            full_text_parts.append(txt)
                            yield self._evt("token", {"text": txt})

                    for k in agg_usage:
                        agg_usage[k] += int(round_usage.get(k, 0) or 0)

                    if not round_tool_calls:
                        break

                    # Preserve exact model parts (function_call + thought_signature) in conversation
                    if round_text_parts:
                        round_model_parts.insert(0, types.Part.from_text(text="".join(round_text_parts)))
                    contents.append(types.Content(role="model", parts=round_model_parts))

                    for fc in round_tool_calls:
                        fn_name = getattr(fc, "name", "")
                        if fn_name:
                            used_tools.append(fn_name)
                            yield self._evt("tool_start", {"name": fn_name})

                    results = await _execute_gemini_tools(round_tool_calls)
                    response_parts: List[types.Part] = []
                    for fc, result in zip(round_tool_calls, results):
                        fn_name = getattr(fc, "name", "")
                        yield self._evt("tool_end", {"name": fn_name, "ok": "error" not in result})
                        response_parts.append(
                            types.Part.from_function_response(
                                name=fn_name,
                                response={"result": result},
                            )
                        )
                    contents.append(types.Content(role="user", parts=response_parts))

        except GeminiError as e:
            log.warning("Gemini chat failed (%s): %s", e.code, redact_secrets(str(e)))
            yield self._evt(
                "error",
                {"message": e.user_message, "code": e.code, "status_code": e.status_code},
            )
            return
        except Exception as e:
            log.exception("Unexpected chat orchestrator error: %s", redact_secrets(str(e)))
            yield self._evt(
                "error",
                {
                    "message": "Unable to complete response right now. Please try again.",
                    "code": "internal_error",
                    "status_code": 500,
                },
            )
            return

        full_text = "".join(full_text_parts).strip()

        if cache_key and full_text and not used_tools:
            await response_cache.set(
                cache_key,
                {"content": full_text, "model": active_model},
            )

        assistant_msg = Message(
            id=uuid.uuid4().hex,
            role="assistant",
            content=full_text,
            language=lang,  # type: ignore[arg-type]
            created_at=datetime.now(timezone.utc),
            tool_name=",".join(used_tools) if used_tools else None,
        )
        await sessions.append(session.id, assistant_msg)

        yield self._evt(
            "done",
            {
                "session_id": session.id,
                "message_id": assistant_msg.id,
                "language": lang,
                "used_tools": used_tools,
                "finish_reason": finish_reason,
                "cached": False,
                "model": active_model,
                "usage": agg_usage,
            },
        )

    # ------------------------------------------------------------------
    # Public — non-streaming one-shot
    # ------------------------------------------------------------------
    async def chat_once(
        self,
        req: AssistantRequest,
        farmer_context: Optional[dict[str, Any]] = None,
        user_id: Optional[int] = None,
    ) -> AssistantReply:
        collected: List[str] = []
        session_id = ""
        message_id = ""
        language = resolve_language(req.language, _strip_farm_context_prefix(req.message))
        used_tools: List[str] = []
        finish_reason: Optional[str] = None
        cached = False
        model_used = self._effective_model
        usage_counts: Optional[Dict[str, int]] = None

        async for evt in self.stream_chat(req, farmer_context=farmer_context, user_id=user_id):
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
                cached = bool(data.get("cached", False))
                model_used = data.get("model") or model_used
                usage_counts = data.get("usage")
            elif et == "error":
                raise ChatError(
                    data.get("message", "Unknown error"),
                    status_code=int(data.get("status_code", 503)),
                    code=str(data.get("code", "chat_error")),
                )

        return AssistantReply(
            session_id=session_id,
            message_id=message_id,
            content="".join(collected).strip(),
            language=language,  # type: ignore[arg-type]
            used_tools=used_tools,
            provider=f"google-genai:{model_used}",
            model=model_used,
            usage=usage_counts,
            cached=cached,
            finish_reason=finish_reason,
        )

    # ------------------------------------------------------------------
    # Internals
    # ------------------------------------------------------------------
    async def _ingest(
        self, req: AssistantRequest, *, user_id: Optional[int] = None
    ) -> tuple[SessionState, Message]:
        """Load or create session, append user message."""
        session: Optional[SessionState] = None
        if req.session_id:
            session = await sessions.get(req.session_id)
            if session and session.user_id is not None and user_id != session.user_id:
                # Never allow cross-user hijacking of an authenticated user's server session
                session = None
        if not session:
            session = await sessions.create(
                language=req.language,
                location=req.location,
                user_id=user_id,
            )
        if req.location and (req.location.lat is not None or req.location.city):
            session.location = req.location

        clean_msg = _strip_farm_context_prefix(req.message) or req.message
        user_msg = Message(
            id=uuid.uuid4().hex,
            role="user",
            content=clean_msg,
            language=resolve_language(req.language, clean_msg),  # type: ignore[arg-type]
            created_at=datetime.now(timezone.utc),
        )
        await sessions.append(session.id, user_msg)
        session = await sessions.get(session.id) or session
        return session, user_msg

    @staticmethod
    def _to_gemini_contents(messages: List[Message]):
        from google.genai import types

        out: List[types.Content] = []
        for m in messages:
            if m.role == "tool" or not (m.content or "").strip():
                continue
            role = "model" if m.role == "assistant" else "user"
            cleaned = _strip_farm_context_prefix(m.content) if role == "user" else m.content
            if cleaned:
                out.append(types.Content(role=role, parts=[types.Part.from_text(text=cleaned)]))
        return out

    @staticmethod
    def _evt(event: str, data: Dict[str, Any]) -> Dict[str, Any]:
        return {"event": event, "data": data}


async def _execute_gemini_tools(function_calls: List[Any]) -> List[Dict[str, Any]]:
    """Run Gemini tool calls (in parallel when multiple) and return tool dicts."""

    async def _one(fc: Any) -> Dict[str, Any]:
        name = getattr(fc, "name", "")
        raw_args = getattr(fc, "args", None)
        if isinstance(raw_args, dict):
            args = raw_args
        elif isinstance(raw_args, str):
            try:
                args = json.loads(raw_args)
            except json.JSONDecodeError:
                args = {}
        else:
            args = dict(raw_args) if raw_args else {}
        return await run_tool(name, args)

    if TOOL_PARALLEL and len(function_calls) > 1:
        return await asyncio.gather(*(_one(fc) for fc in function_calls))
    results = []
    for fc in function_calls:
        results.append(await _one(fc))
    return results


# ---------------------------------------------------------------------------
# Singleton accessor & health
# ---------------------------------------------------------------------------
_orchestrator_singleton: Optional[ChatOrchestrator] = None


def get_orchestrator() -> ChatOrchestrator:
    global _orchestrator_singleton
    if _orchestrator_singleton is None:
        _orchestrator_singleton = ChatOrchestrator()
    return _orchestrator_singleton


def health_info() -> Dict[str, Any]:
    orch = get_orchestrator()
    return {
        "llm_configured": is_gemini_configured(),
        "provider": "google-genai",
        "model": orch._effective_model,
        "vision_model": orch._effective_vision_model,
        "memory_backend": sessions.backend_name,
        "tools_enabled": enabled_tools(),
    }
