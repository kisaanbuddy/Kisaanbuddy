import logging
from .provider_interface import SMSProvider

log = logging.getLogger("krishiai.sms_provider.twilio")

class TwilioProvider(SMSProvider):
    def send_otp(self, phone_number: str, otp: str) -> bool:
        log.info("Twilio Provider SMS triggered for +91%s (Stub)", phone_number)
        return True

    def send_message(self, phone_number: str, message: str) -> bool:
        log.info("Twilio Provider Text Alert dispatched for +91%s: %s", phone_number, message)
        return True
