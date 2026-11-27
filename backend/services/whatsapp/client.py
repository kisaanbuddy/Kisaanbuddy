"""Official Meta WhatsApp Cloud API HTTP Client."""
from __future__ import annotations

import asyncio
import hashlib
import base64
import hmac
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
                if resp.status_code == 429 and attempt < max_retries - 1:
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
                if isinstance(exc, (httpx.ConnectError, httpx.ConnectTimeout)) and attempt < max_retries - 1:
                    log.warning("Meta connection failed before delivery; retrying in %.1fs", delay)
                    await asyncio.sleep(delay)
                    delay *= 2
                    continue
                raise WhatsAppAPIError("Meta transport failure; delivery may be uncertain", details={"delivery_uncertain": True}) from exc

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

        if not is_whatsapp_configured() or not resolved_phone_id or not effective_token:
            raise WhatsAppAPIError("WhatsApp sender credentials are not configured", status_code=503)

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

        if not is_whatsapp_configured() or not resolved_phone_id or not effective_token:
            raise WhatsAppAPIError("WhatsApp sender credentials are not configured", status_code=503)

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

        if not is_whatsapp_configured() or not resolved_phone_id or not effective_token:
            raise WhatsAppAPIError("WhatsApp sender credentials are not configured", status_code=503)

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

        if not is_whatsapp_configured() or not resolved_phone_id or not effective_token:
            raise WhatsAppAPIError("WhatsApp sender credentials are not configured", status_code=503)

        url = self._get_messages_url(resolved_phone_id)
        headers = self._get_headers(effective_token)
        return await self._post_with_retry(url, payload, headers=headers)

    async def upload_media(
        self,
        media_bytes: bytes,
        mime_type: str = "audio/mpeg",
        filename: str = "reply.mp3",
        sender_phone_number_id: Optional[str] = None,
        access_token: Optional[str] = None,
    ) -> Optional[str]:
        """Uploads media bytes to Meta Graph API and returns media_id."""
        resolved_phone_id, resolved_token = resolve_whatsapp_credentials(sender_phone_number_id)
        effective_token = access_token or resolved_token
        if not is_whatsapp_configured() or not resolved_phone_id or not effective_token:
            return None
        version = settings.WHATSAPP_API_VERSION or "v21.0"
        url = f"{GRAPH_API_BASE}/{version}/{resolved_phone_id}/media"
        client = await self._get_client()
        resp = await client.post(
            url,
            headers={"Authorization": f"Bearer {effective_token}"},
            data={"messaging_product": "whatsapp", "type": mime_type},
            files={"file": (filename, media_bytes, mime_type)},
        )
        if resp.status_code >= 400:
            log.warning("Meta media upload failed (%d): %s", resp.status_code, resp.text[:200])
            return None
        return resp.json().get("id")

    async def send_audio_message(
        self,
        to_phone: str,
        media_id: str,
        sender_phone_number_id: Optional[str] = None,
        access_token: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Sends an audio/voice note message using a Meta media_id."""
        clean_phone = normalize_phone_number(to_phone).lstrip("+")
        resolved_phone_id, resolved_token = resolve_whatsapp_credentials(sender_phone_number_id)
        effective_token = access_token or resolved_token
        if not is_whatsapp_configured() or not resolved_phone_id or not effective_token:
            raise WhatsAppAPIError("WhatsApp sender credentials are not configured", status_code=503)
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": clean_phone,
            "type": "audio",
            "audio": {"id": media_id},
        }
        return await self._post_with_retry(
            self._get_messages_url(resolved_phone_id),
            payload,
            headers=self._get_headers(effective_token),
        )

    async def send_location_request(
        self,
        to_phone: str,
        body_text: str,
        sender_phone_number_id: Optional[str] = None,
        access_token: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Sends a native WhatsApp interactive location request message."""
        clean_phone = normalize_phone_number(to_phone).lstrip("+")
        resolved_phone_id, resolved_token = resolve_whatsapp_credentials(sender_phone_number_id)
        effective_token = access_token or resolved_token
        if not is_whatsapp_configured() or not resolved_phone_id or not effective_token:
            raise WhatsAppAPIError("WhatsApp sender credentials are not configured", status_code=503)
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": clean_phone,
            "type": "interactive",
            "interactive": {
                "type": "location_request_message",
                "body": {"text": body_text[:1024]},
                "action": {"name": "send_location"},
            },
        }
        return await self._post_with_retry(
            self._get_messages_url(resolved_phone_id),
            payload,
            headers=self._get_headers(effective_token),
        )

    async def send_cta_url_button(
        self,
        to_phone: str,
        body_text: str,
        button_text: str,
        url_link: str,
        header_text: Optional[str] = None,
        sender_phone_number_id: Optional[str] = None,
        access_token: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Sends an interactive Call-To-Action URL button message."""
        clean_phone = normalize_phone_number(to_phone).lstrip("+")
        resolved_phone_id, resolved_token = resolve_whatsapp_credentials(sender_phone_number_id)
        effective_token = access_token or resolved_token
        if not is_whatsapp_configured() or not resolved_phone_id or not effective_token:
            raise WhatsAppAPIError("WhatsApp sender credentials are not configured", status_code=503)
        interactive: Dict[str, Any] = {
            "type": "cta_url",
            "body": {"text": body_text[:1024]},
            "action": {
                "name": "cta_url",
                "parameters": {
                    "display_text": button_text[:20],
                    "url": url_link,
                },
            },
        }
        if header_text:
            interactive["header"] = {"type": "text", "text": header_text[:60]}
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": clean_phone,
            "type": "interactive",
            "interactive": interactive,
        }
        return await self._post_with_retry(
            self._get_messages_url(resolved_phone_id),
            payload,
            headers=self._get_headers(effective_token),
        )

    async def send_template_message(
        self,
        to_phone: str,
        template_name: str,
        language_code: str = "en",
        components: Optional[List[Dict[str, Any]]] = None,
        sender_phone_number_id: Optional[str] = None,
        access_token: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Sends an approved Meta WhatsApp message template."""
        clean_phone = normalize_phone_number(to_phone).lstrip("+")
        resolved_phone_id, resolved_token = resolve_whatsapp_credentials(sender_phone_number_id)
        effective_token = access_token or resolved_token
        if not is_whatsapp_configured() or not resolved_phone_id or not effective_token:
            raise WhatsAppAPIError("WhatsApp sender credentials are not configured", status_code=503)
        template_obj: Dict[str, Any] = {
            "name": template_name,
            "language": {"code": language_code},
        }
        if components:
            template_obj["components"] = components
        payload = {
            "messaging_product": "whatsapp",
            "to": clean_phone,
            "type": "template",
            "template": template_obj,
        }
        return await self._post_with_retry(
            self._get_messages_url(resolved_phone_number_id),
            payload,
            headers=self._get_headers(effective_token),
        )

    async def mark_message_as_read(
        self,
        message_id: str,
        sender_phone_number_id: Optional[str] = None,
        access_token: Optional[str] = None,
    ) -> bool:
        """Marks an incoming message as read by sending status=read to Meta."""
        if not is_whatsapp_configured() or not message_id:
            return False

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
            raise WhatsAppAPIError("WhatsApp credentials are not configured", status_code=503)

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
        mime_type = metadata.get("mime_type")
        if not mime_type:
            raise WhatsAppAPIError("Media type unavailable from Meta metadata")

        if not download_url:
            raise WhatsAppAPIError(f"No download URL provided in media metadata for {media_id}")

        # Strict SSRF domain validation
        if not is_safe_media_url(download_url):
            raise WhatsAppAPIError(f"Rejected unsafe media URL domain (SSRF protection): {download_url}")

        if not is_whatsapp_configured():
            raise WhatsAppAPIError("WhatsApp credentials are not configured", status_code=503)

        _, resolved_token = resolve_whatsapp_credentials(sender_phone_number_id)
        effective_token = access_token or resolved_token

        client = await self._get_client()
        headers = self._get_headers(effective_token)
        limit = 16 * 1024 * 1024
        if int(metadata.get("file_size") or 0) > limit:
            raise WhatsAppAPIError("Media exceeds 16 MB limit")
        async with client.stream("GET", download_url, headers=headers, follow_redirects=False) as resp:
            if resp.status_code != 200:
                raise WhatsAppAPIError("Media download failed", status_code=resp.status_code)
            data = bytearray()
            async for chunk in resp.aiter_bytes():
                data.extend(chunk)
                if len(data) > limit:
                    raise WhatsAppAPIError("Media exceeds 16 MB limit")
        expected_hash = metadata.get("sha256")
        if expected_hash:
            digest = hashlib.sha256(data).digest()
            if not any(hmac.compare_digest(str(expected_hash), value) for value in
                       (digest.hex(), base64.b64encode(digest).decode("ascii"))):
                raise WhatsAppAPIError("Media integrity check failed")
        return bytes(data), mime_type


whatsapp_client = WhatsAppClient()
