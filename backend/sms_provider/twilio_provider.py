import logging
from .provider_interface import SMSProvider

log = logging.getLogger("kisaanbuddy.sms_provider.twilio")

class TwilioProvider(SMSProvider):
    def send_otp(self, phone_number: str, otp: str) -> bool:
        log.info("Twilio Provider SMS triggered for +91%s (Stub)", phone_number)
        # Future Twilio client integration goes here
        return True
