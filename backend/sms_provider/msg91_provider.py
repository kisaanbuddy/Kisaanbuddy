import logging
from .provider_interface import SMSProvider

log = logging.getLogger("kisaanbuddy.sms_provider.msg91")

class Msg91Provider(SMSProvider):
    def send_otp(self, phone_number: str, otp: str) -> bool:
        log.info("MSG91 Provider SMS triggered for +91%s (Stub)", phone_number)
        # Future MSG91 HTTP integration hook goes here
        return True
