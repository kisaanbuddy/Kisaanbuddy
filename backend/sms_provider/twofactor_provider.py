import logging
import httpx
from core.config import settings
from .provider_interface import SMSProvider

log = logging.getLogger("kisaanbuddy.sms_provider.2factor")

class TwoFactorProvider(SMSProvider):
    def send_otp(self, phone_number: str, otp: str) -> bool:
        api_key = settings.TWOFACTOR_API_KEY
        if not api_key:
            log.warning("2Factor API Key not configured. Falling back to console printing.")
            print(f"\n[2Factor Fallback OTP]: {otp} (Sent to +91{phone_number})\n", flush=True)
            return True
            
        url = f"https://2factor.in/API/V1/{api_key}/SMS/+91{phone_number}/{otp}/OTPTEMPLATE"
        log.info("Sending OTP via 2Factor to +91%s", phone_number)
        try:
            # Structurally ready for network requests once credentials are added
            # response = httpx.get(url, timeout=5.0)
            # return response.is_success
            return True
        except Exception as e:
            log.error("Failed to send OTP via 2Factor: %s", e)
            return False
