"""Pydantic schemas for Meta WhatsApp Cloud API webhooks and outbound messaging."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# 1. Incoming Meta Webhook Models
# ---------------------------------------------------------------------------
class WhatsAppProfile(BaseModel):
    name: Optional[str] = None


class WhatsAppContact(BaseModel):
    profile: Optional[WhatsAppProfile] = None
    wa_id: str


class WhatsAppTextMessage(BaseModel):
    body: str


class WhatsAppImageMessage(BaseModel):
    id: str
    mime_type: Optional[str] = None
    sha256: Optional[str] = None
    caption: Optional[str] = None


class WhatsAppAudioMessage(BaseModel):
    id: str
    mime_type: Optional[str] = None
    voice: Optional[bool] = False


class WhatsAppButtonReply(BaseModel):
    id: str
    title: str


class WhatsAppListReply(BaseModel):
    id: str
    title: str
    description: Optional[str] = None


class WhatsAppInteractiveReply(BaseModel):
    type: str  # "button_reply" or "list_reply"
    button_reply: Optional[WhatsAppButtonReply] = None
    list_reply: Optional[WhatsAppListReply] = None


class WhatsAppIncomingMessage(BaseModel):
    from_: str = Field(..., alias="from")
    id: str
    timestamp: str
    type: str  # "text", "image", "audio", "interactive", etc.
    text: Optional[WhatsAppTextMessage] = None
    image: Optional[WhatsAppImageMessage] = None
    audio: Optional[WhatsAppAudioMessage] = None
    interactive: Optional[WhatsAppInteractiveReply] = None


class WhatsAppStatusPricing(BaseModel):
    billable: Optional[bool] = None
    pricing_model: Optional[str] = None
    category: Optional[str] = None


class WhatsAppStatusConversation(BaseModel):
    id: Optional[str] = None
    expiration_timestamp: Optional[str] = None
    origin: Optional[Dict[str, Any]] = None


class WhatsAppStatusUpdate(BaseModel):
    id: str
    status: str  # "sent", "delivered", "read", "failed"
    timestamp: str
    recipient_id: str
    conversation: Optional[WhatsAppStatusConversation] = None
    pricing: Optional[WhatsAppStatusPricing] = None
    errors: Optional[List[Dict[str, Any]]] = None


class WhatsAppWebhookMetadata(BaseModel):
    display_phone_number: Optional[str] = None
    phone_number_id: Optional[str] = None


class WhatsAppWebhookValue(BaseModel):
    messaging_product: str = "whatsapp"
    metadata: Optional[WhatsAppWebhookMetadata] = None
    contacts: Optional[List[WhatsAppContact]] = None
    messages: Optional[List[WhatsAppIncomingMessage]] = None
    statuses: Optional[List[WhatsAppStatusUpdate]] = None
    errors: Optional[List[Dict[str, Any]]] = None


class WhatsAppWebhookChange(BaseModel):
    field: str
    value: WhatsAppWebhookValue


class WhatsAppWebhookEntry(BaseModel):
    id: str
    changes: List[WhatsAppWebhookChange]


class WhatsAppWebhookPayload(BaseModel):
    object: str
    entry: List[WhatsAppWebhookEntry]


# ---------------------------------------------------------------------------
# 2. Outbound Messaging Schemas
# ---------------------------------------------------------------------------
class WhatsAppOutboundText(BaseModel):
    recipient_phone: str
    body: str
    preview_url: bool = True


class InteractiveButton(BaseModel):
    id: str
    title: str = Field(..., max_length=20)


class InteractiveListRow(BaseModel):
    id: str
    title: str = Field(..., max_length=24)
    description: Optional[str] = Field(None, max_length=72)


class InteractiveListSection(BaseModel):
    title: str = Field(..., max_length=24)
    rows: List[InteractiveListRow]


class WhatsAppOutboundInteractiveButtons(BaseModel):
    recipient_phone: str
    body_text: str
    buttons: List[InteractiveButton] = Field(..., max_length=3)
    header_text: Optional[str] = None
    footer_text: Optional[str] = None


class WhatsAppOutboundInteractiveList(BaseModel):
    recipient_phone: str
    body_text: str
    button_label: str = Field(..., max_length=20)
    sections: List[InteractiveListSection] = Field(..., max_length=10)
    header_text: Optional[str] = None
    footer_text: Optional[str] = None


class WhatsAppOutboundImage(BaseModel):
    recipient_phone: str
    image_url: str
    caption: Optional[str] = None


# ---------------------------------------------------------------------------
# 3. Support, Admin & Health Schemas
# ---------------------------------------------------------------------------
class WhatsAppSupportTicketResponse(BaseModel):
    id: int
    ticket_id: str
    phone_number: str
    farmer_name: Optional[str] = None
    query_summary: str
    status: str
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None


class WhatsAppSupportTicketUpdate(BaseModel):
    status: Optional[str] = None  # OPEN, ASSIGNED, IN_PROGRESS, RESOLVED
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None


class WhatsAppIntegrationStats(BaseModel):
    configured: bool
    phone_number_id: Optional[str] = None
    api_version: str
    total_messages_received: int
    total_messages_sent: int
    total_delivery_failures: int
    active_support_tickets: int
    total_diagnoses_via_whatsapp: int
    estimated_cost_inr: float
    monthly_budget_inr: float
    budget_exceeded: bool


class WhatsAppHealthResponse(BaseModel):
    status: str
    configured: bool
    phone_number_id_set: bool
    access_token_set: bool
    app_secret_set: bool
    verify_token_set: bool
    redis_connected: bool
    message_count_24h: int


class WhatsAppTestSendRequest(BaseModel):
    recipient_phone: str
    message: str
    message_type: Literal["text", "menu", "crop_doctor_prompt"] = "text"
