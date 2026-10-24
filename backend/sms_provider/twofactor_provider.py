import logging
import httpx
from core.config import settings
from .provider_interface import SMSProvider

log = logging.getLogger("krishiai.sms_provider.2factor")

class TwoFactorProvider(SMSProvider):
    def send_otp(self, phone_number: str, otp: str) -> bool:
        api_key = settings.TWOFACTOR_API_KEY
        if not api_key:
            if not settings.DEBUG:
                raise RuntimeError(
                    "TWOFACTOR_API_KEY is not configured. "
                    "Set the key in .env or switch OTP_PROVIDER to 'console' for local development."
                )
            log.warning("2Factor API Key not configured. Falling back to console (DEBUG mode).")
            print(f"\n[2Factor Fallback OTP]: {otp} (Sent to +91{phone_number})\n", flush=True)
            return True
            
        digits = "".join(filter(str.isdigit, phone_number or ""))
        if len(digits) == 12 and digits.startswith("91"):
            digits = digits[2:]
        elif len(digits) == 11 and digits.startswith("0"):
            digits = digits[1:]
        clean_phone = digits
        url = f"https://2factor.in/API/V1/{api_key}/SMS/+91{clean_phone}/{otp}/kisaanbuddy"
        log.info("Sending OTP via 2Factor (template: kisaanbuddy) to +91%s", clean_phone)
        try:
            with httpx.Client(timeout=10.0) as client:
                response = client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("Status") == "Success":
                        log.info("2Factor OTP dispatched successfully to +91%s (session: %s)", clean_phone, data.get("Details"))
                        return True
                    else:
                        log.error("2Factor API returned failure: %s", data)
                        return False
                log.error("2Factor HTTP error %d: %s", response.status_code, response.text)
                return False
        except Exception as e:
            log.error("Failed to send OTP via 2Factor: %s", e)
            return False

    def send_message(self, phone_number: str, message: str) -> bool:
        """Sends transactional inquiry alert."""
        digits = "".join(filter(str.isdigit, phone_number or ""))
        if len(digits) == 12 and digits.startswith("91"):
            digits = digits[2:]
        elif len(digits) == 11 and digits.startswith("0"):
            digits = digits[1:]
        clean_phone = digits

        api_key = settings.TWOFACTOR_API_KEY
        if not api_key or settings.DEBUG:
            log.info("2Factor transactional alert (Console Fallback): +91%s -> %s", clean_phone, message)
            print(f"\n[2Factor Transactional Alert to +91{clean_phone}]: {message}\n", flush=True)
            return True

        # When running with live key in production:
        url = f"https://2factor.in/API/V1/{api_key}/ADDON_SERVICES/SEND/TSMS"
        payload = {
            "From": "KBINQY",
            "To": clean_phone,
            "Msg": message,
        }
        try:
            with httpx.Client(timeout=10.0) as client:
                res = client.post(url, data=payload)
                if res.status_code == 200 and res.json().get("Status") == "Success":
                    log.info("2Factor transactional alert delivered to +91%s", clean_phone)
                    return True
                log.warning("2Factor TSMS response: %s", res.text)
                return False
        except Exception as e:
            log.error("Failed to send 2Factor transactional SMS: %s", e)
            return False
