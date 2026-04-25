"""Chatbot + voice-assistant request/response schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


# ----- LEGACY (unchanged) --------------------------------------------------
class ChatQuery(BaseModel):
    text: Optional[str] = Field(None, description="Farmer's query text")
    language: str = Field("en", description="ISO code: en, hi, kn, mr, ta, te, bn...")
    audio_url: Optional[str] = Field(None, description="Optional pre-uploaded audio")


class ChatResponse(BaseModel):
    response_text: str
    response_audio_url: Optional[str] = None
    language: str = "en"


# ----- ASSISTANT -----------------------------------------------------------
Language = Literal["auto", "en", "hi", "kn"]
Role = Literal["user", "assistant", "system", "tool"]


class Message(BaseModel):
    id: str
    role: Role
    content: str
    language: Optional[Language] = None
    created_at: datetime
    tool_calls: Optional[List[Dict[str, Any]]] = None
    tool_name: Optional[str] = None


class LocationHint(BaseModel):
    lat: Optional[float] = None
    lon: Optional[float] = None
    city: Optional[str] = None


class AssistantRequest(BaseModel):
    session_id: Optional[str] = Field(None, description="Omit on first call.")
    message: str = Field(..., min_length=1, max_length=2000)
    language: Language = "auto"
    location: Optional[LocationHint] = None
    stream: bool = True
    want_audio: bool = False
    image_base64: Optional[str] = Field(
        None,
        description="Optional crop/leaf photo as a base64 data-URL. Triggers disease-diagnosis vision mode.",
    )


class AssistantReply(BaseModel):
    session_id: str
    message_id: str
    content: str
    language: Language
    used_tools: List[str] = []
    provider: str = "openai"
    cached: bool = False
    finish_reason: Optional[str] = None


class SessionCreateRequest(BaseModel):
    language: Language = "auto"
    location: Optional[LocationHint] = None


class SessionState(BaseModel):
    id: str
    language: Language
    location: Optional[LocationHint] = None
    messages: List[Message] = []
    created_at: datetime
    updated_at: datetime


# ----- STT / TTS -----------------------------------------------------------
class STTResult(BaseModel):
    transcript: str
    language: Language
    confidence: Optional[float] = None
    provider: str


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=3000)
    language: Language = "auto"
    voice: Optional[str] = None
    prefer_browser: bool = False


class TTSBrowserHint(BaseModel):
    browser: bool = True
    language: Language
    voice_suggestion: Optional[str] = None


# ----- Health --------------------------------------------------------------
class AssistantProvider(BaseModel):
    name: str
    role: Literal["llm", "stt", "tts"]
    configured: bool


class AssistantHealth(BaseModel):
    providers: List[AssistantProvider]
    memory_backend: str
    tools_enabled: List[str]
    rate_limit: str
