"""Official Meta WhatsApp Cloud API HTTP Client."""
from __future__ import annotations

import asyncio
import logging
from typing import Any, Dict, List, Optional, Tuple

import httpx

from core.config import is_whatsapp_configured, settings
from services.whatsapp.security import is_safe_media_url, normalize_phone_number

log = logging.getLogger(__name__)

GRAPH_API_BASE = "https://graph.facebook.com"


class WhatsAppAPIError(Exception):
    def __init__(self, message: str, status_code: Optional[int] = None, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.status_code = status_code
        self.details = details or {}


class WhatsAppRoutingError(ValueError):
    """Raised when an unknown phone_number_id is used or cross-number delivery is detected."""
    pass


def resolve_whatsapp_credentials(sender_phone_number_id: Optional[str] = None) -> Tuple[str, str]:
    """Resolves (phone_number_id, access_token) ensuring strict isolation between prod and test numbers.

    Rules:
    - If sender_phone_number_id matches WHATSAPP_TEST_PHONE_NUMBER_ID:
        Uses test phone number ID and test token (falling back to primary access token if test token not set).
    - If sender_phone_number_id matches WHATSAPP_PHONE_NUMBER_ID:
        Uses production phone number ID and primary access token.
    - If sender_phone_number_id does not match either configured ID when IDs are configured:
        Raises WhatsAppRoutingError to strictly block cross-number message delivery.
    - If sender_phone_number_id is None:
        Falls back to primary production ID (or test ID if only test is set) for backward compatibility.
    """
    prod_id = (settings.WHATSAPP_PHONE_NUMBER_ID or "").strip()
    test_id = (settings.WHATSAPP_TEST_PHONE_NUMBER_ID or "").strip()
    prod_token = (settings.WHATSAPP_ACCESS_TOKEN or "").strip()
    test_token = (settings.WHATSAPP_TEST_ACCESS_TOKEN or "").strip() or prod_token

    if sender_phone_number_id:
        target_id = sender_phone_number_id.strip()
        # 1. Matches configured test phone number ID
        if test_id and target_id == test_id:
            return test_id, test_token

        # 2. Matches configured production phone number ID
        if prod_id and target_id == prod_id:
            return prod_id, prod_token

        # 3. Known configurations exist, but target_id matches neither -> strict rejection
        if prod_id or test_id:
            raise WhatsAppRoutingError(
                f"Unknown sender_phone_number_id '{target_id}' does not match configured "
                f"production ({prod_id or 'not set'}) or test ({test_id or 'not set'}) phone number ID. "
                f"Cross-number delivery blocked."
            )

        # 4. If neither prod nor test is configured in environment (mock/local mode)
        return target_id, prod_token

    # sender_phone_number_id is None -> backward-compatible default
    if prod_id:
        return prod_id, prod_token
    if test_id:
        return test_id, test_token
    return "", prod_token


class WhatsAppClient:
    """Production client for Meta WhatsApp Business Cloud API."""

    def __init__(self) -> None:
        self._http_client: Optional[httpx.AsyncClient] = None
        self._lock = asyncio.Lock()

    async def _get_client(self) -> httpx.AsyncClient:
        if self._http_client is None or self._http_client.is_closed:
            async with self._lock:
                if self._http_client is None or self._http_client.is_closed:
                    self._http_client = httpx.AsyncClient(
                        timeout=httpx.Timeout(settings.API_TIMEOUT * 4, connect=5.0),
                    )
        return self._http_client

    def _get_headers(self, access_token: Optional[str] = None) -> Dict[str, str]:
        token = (access_token or settings.WHATSAPP_ACCESS_TOKEN or "").strip()
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

    def _get_messages_url(self, phone_number_id: Optional[str] = None) -> str:
        version = settings.WHATSAPP_API_VERSION or "v21.0"
        phone_id = (
            phone_number_id
            or settings.WHATSAPP_PHONE_NUMBER_ID
            or settings.WHATSAPP_TEST_PHONE_NUMBER_ID
            or ""
        ).strip()
        return f"{GRAPH_API_BASE}/{version}/{phone_id}/messages"

    async def _post_with_retry(
        self,
        url: str,
        payload: Dict[str, Any],
        headers: Optional[Dict[str, str]] = None,
        max_retries: int = 3,
    ) -> Dict[str, Any]:
        """Executes POST request with exponential backoff for transient HTTP errors."""
        client = await self._get_client()
        req_headers = headers if headers is not None else self._get_headers()

        delay = 0.5
        last_error = None

        for attempt in range(max_retries):
            try:
                resp = await client.post(url, json=payload, headers=req_headers)
                if resp.status_code in (200, 201):
                    return resp.json()

                # Handle rate limiting (429) or transient Meta 5xx errors
                if resp.status_code in (429, 500, 502, 503, 504) and attempt < max_retries - 1:
                    log.warning("Meta API returned %d; retrying in %.1fs (attempt %d/%d)", resp.status_code, delay, attempt + 1, max_retries)
                    await asyncio.sleep(delay)
                    delay *= 2
                    continue

                error_data = {}
                try:
                    error_data = resp.json()
                except Exception:
                    error_data = {"raw_text": resp.text}

                raise WhatsAppAPIError(
                    f"Meta API error ({resp.status_code}): {error_data}",
                    status_code=resp.status_code,
                    details=error_data,
                )
            except httpx.RequestError as exc:
                last_error = exc
                if attempt < max_retries - 1:
                    log.warning("Network error calling Meta API: %s; retrying in %.1fs", exc, delay)
                    await asyncio.sleep(delay)
                    delay *= 2
                    continue
                raise WhatsAppAPIError(f"Network error contacting Meta API: {last_error}") from exc

        raise WhatsAppAPIError(f"Request failed after {max_retries} retries: {last_error}")

    async def send_text_message(
        self,
        recipient_phone: str,
        body: str,
        preview_url: bool = True,
        sender_phone_number_id: Optional[str] = None,
        access_token: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Sends a standard text message to a WhatsApp recipient."""
        normalized = normalize_phone_number(recipient_phone)
        to_number = normalized.lstrip("+")

        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to_number,
            "type": "text",
            "text": {
                "preview_url": preview_url,
                "body": body,
            },
        }

        resolved_phone_id, resolved_token = resolve_whatsapp_credentials(sender_phone_number_id)
        effective_token = access_token or resolved_token

        if not is_whatsapp_configured():
            log.info("[MOCK] Outbound WhatsApp text to %s (via %s): %s", normalized, resolved_phone_id, body[:60])
            import uuid
            return {
                "messaging_product": "whatsapp",
                "contacts": [{"input": to_number, "wa_id": to_number}],
                "messages": [{"id": f"wamid.mock.{uuid.uuid4().hex}"}],
            }

        url = self._get_messages_url(resolved_phone_id)
        headers = self._get_headers(effective_token)
        return await self._post_with_retry(url, payload, headers=headers)

    async def send_interactive_buttons(
        self,
        recipient_phone: str,
        body_text: str,
        buttons: List[Dict[str, str]],
        header_text: Optional[str] = None,
        footer_text: Optional[str] = None,
        sender_phone_number_id: Optional[str] = None,
        access_token: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Sends an interactive button message (max 3 buttons)."""
        normalized = normalize_phone_number(recipient_phone)
        to_number = normalized.lstrip("+")

        btn_elements = []
        for b in buttons[:3]:
            btn_elements.append({
                "type": "reply",
                "reply": {
                    "id": b["id"],
                    "title": b["title"][:20],
                },
            })

        interactive: Dict[str, Any] = {
            "type": "button",
            "body": {"text": body_text},
            "action": {"buttons": btn_elements},
        }

        if header_text:
            interactive["header"] = {"type": "text", "text": header_text[:60]}
        if footer_text:
            interactive["footer"] = {"text": footer_text[:60]}

        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to_number,
            "type": "interactive",
            "interactive": interactive,
        }

        resolved_phone_id, resolved_token = resolve_whatsapp_credentials(sender_phone_number_id)
        effective_token = access_token or resolved_token

        if not is_whatsapp_configured():
            log.info("[MOCK] Outbound WhatsApp buttons to %s (via %s): %d buttons", normalized, resolved_phone_id, len(buttons))
            import uuid
            return {
                "messaging_product": "whatsapp",
                "contacts": [{"input": to_number, "wa_id": to_number}],
                "messages": [{"id": f"wamid.mock.{uuid.uuid4().hex}"}],
            }

        url = self._get_messages_url(resolved_phone_id)
        headers = self._get_headers(effective_token)
        return await self._post_with_retry(url, payload, headers=headers)

    async def send_interactive_list(
        self,
        recipient_phone: str,
        body_text: str,
        button_label: str,
        sections: List[Dict[str, Any]],
        header_text: Optional[str] = None,
        footer_text: Optional[str] = None,
        sender_phone_number_id: Optional[str] = None,
        access_token: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Sends an interactive list message."""
        normalized = normalize_phone_number(recipient_phone)
        to_number = normalized.lstrip("+")

        interactive: Dict[str, Any] = {
            "type": "list",
            "body": {"text": body_text},
            "action": {
                "button": button_label[:20],
                "sections": sections,
            },
        }

        if header_text:
            interactive["header"] = {"type": "text", "text": header_text[:60]}
        if footer_text:
            interactive["footer"] = {"text": footer_text[:60]}

        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to_number,
            "type": "interactive",
            "interactive": interactive,
        }

        resolved_phone_id, resolved_token = resolve_whatsapp_credentials(sender_phone_number_id)
        effective_token = access_token or resolved_token

        if not is_whatsapp_configured():
            log.info("[MOCK] Outbound WhatsApp list to %s (via %s): %s", normalized, resolved_phone_id, button_label)
            import uuid
            return {
                "messaging_product": "whatsapp",
                "contacts": [{"input": to_number, "wa_id": to_number}],
                "messages": [{"id": f"wamid.mock.{uuid.uuid4().hex}"}],
            }

        url = self._get_messages_url(resolved_phone_id)
        headers = self._get_headers(effective_token)
        return await self._post_with_retry(url, payload, headers=headers)

    async def send_image_message(
        self,
        recipient_phone: str,
        image_url: str,
        caption: Optional[str] = None,
        sender_phone_number_id: Optional[str] = None,
        access_token: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Sends an image message with optional caption."""
        normalized = normalize_phone_number(recipient_phone)
        to_number = normalized.lstrip("+")

        image_obj: Dict[str, Any] = {"link": image_url}
        if caption:
            image_obj["caption"] = caption

        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to_number,
            "type": "image",
            "image": image_obj,
        }

        resolved_phone_id, resolved_token = resolve_whatsapp_credentials(sender_phone_number_id)
        effective_token = access_token or resolved_token

        if not is_whatsapp_configured():
            log.info("[MOCK] Outbound WhatsApp image to %s (via %s): %s", normalized, resolved_phone_id, image_url)
            import uuid
            return {
                "messaging_product": "whatsapp",
                "contacts": [{"input": to_number, "wa_id": to_number}],
                "messages": [{"id": f"wamid.mock.{uuid.uuid4().hex}"}],
            }

        url = self._get_messages_url(resolved_phone_id)
        headers = self._get_headers(effective_token)
        return await self._post_with_retry(url, payload, headers=headers)

    async def mark_message_as_read(
        self,
        message_id: str,
        sender_phone_number_id: Optional[str] = None,
        access_token: Optional[str] = None,
    ) -> bool:
        """Marks an incoming message as read by sending status=read to Meta."""
        if not is_whatsapp_configured() or not message_id:
            return True

        resolved_phone_id, resolved_token = resolve_whatsapp_credentials(sender_phone_number_id)
        effective_token = access_token or resolved_token

        url = self._get_messages_url(resolved_phone_id)
        headers = self._get_headers(effective_token)
        payload = {
            "messaging_product": "whatsapp",
            "status": "read",
            "message_id": message_id,
        }
        try:
            await self._post_with_retry(url, payload, headers=headers)
            return True
        except Exception as e:
            log.warning("Failed to mark message %s as read: %s", message_id, e)
            return False

    async def get_media_metadata(
        self,
        media_id: str,
        sender_phone_number_id: Optional[str] = None,
        access_token: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Fetches media URL and metadata using media_id from Meta Graph API."""
        if not is_whatsapp_configured():
            return {
                "url": f"https://lookaside.fbsbx.com/whatsapp_business/attachments/?mid={media_id}",
                "mime_type": "image/jpeg",
                "file_size": 1024,
                "id": media_id,
            }

        _, resolved_token = resolve_whatsapp_credentials(sender_phone_number_id)
        effective_token = access_token or resolved_token

        version = settings.WHATSAPP_API_VERSION or "v21.0"
        url = f"{GRAPH_API_BASE}/{version}/{media_id}"
        client = await self._get_client()
        headers = self._get_headers(effective_token)

        resp = await client.get(url, headers=headers)
        if resp.status_code != 200:
            raise WhatsAppAPIError(f"Failed to fetch media metadata for {media_id}: {resp.text}", status_code=resp.status_code)

        return resp.json()

    async def download_media(
        self,
        media_id: str,
        sender_phone_number_id: Optional[str] = None,
        access_token: Optional[str] = None,
    ) -> Tuple[bytes, str]:
        """Securely retrieves and downloads binary media from Meta Cloud API.

        Validates the download URL domain to strictly prevent SSRF vulnerabilities.
        """
        metadata = await self.get_media_metadata(
            media_id,
            sender_phone_number_id=sender_phone_number_id,
            access_token=access_token,
        )
        download_url = metadata.get("url")
        mime_type = metadata.get("mime_type", "image/jpeg")

        if not download_url:
            raise WhatsAppAPIError(f"No download URL provided in media metadata for {media_id}")

        # Strict SSRF domain validation
        if not is_safe_media_url(download_url):
            raise WhatsAppAPIError(f"Rejected unsafe media URL domain (SSRF protection): {download_url}")

        if not is_whatsapp_configured():
            # Return synthetic test image bytes (minimal 1x1 JPEG) for mock testing
            test_jpeg = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9"
            return test_jpeg, mime_type

        _, resolved_token = resolve_whatsapp_credentials(sender_phone_number_id)
        effective_token = access_token or resolved_token

        client = await self._get_client()
        headers = self._get_headers(effective_token)
        resp = await client.get(download_url, headers=headers)
        if resp.status_code != 200:
            raise WhatsAppAPIError(f"Failed to download media binary from {download_url}: status {resp.status_code}")

        return resp.content, mime_type


whatsapp_client = WhatsAppClient()
