import logging
from core.config import settings
from .provider_interface import SMSProvider

log = logging.getLogger("krishiai.sms_provider.console")

class ConsoleProvider(SMSProvider):
    def send_otp(self, phone_number: str, otp: str) -> bool:
        # Console provider outputs the OTP to logs and stdout for testing/dev.
        # Allow console dispatch if DEBUG is True or if external SMS provider is not active.
        if not settings.DEBUG and settings.ENABLE_SMS_PROVIDER:
            raise RuntimeError("Console OTP delivery is only available when DEBUG=true or SMS provider is disabled")
        log.info("==========================================")
        log.info(" OTP GENERATED FOR PHONE +91%s: %s (via ConsoleProvider)", phone_number, otp)
        log.info("==========================================")
        print(f"\n[OTP]: {otp} (Sent to +91{phone_number})\n", flush=True)
        return True

    def send_message(self, phone_number: str, message: str) -> bool:
        log.info("==========================================")
        log.info(" SMS ALERT FOR PHONE +91%s: %s (via ConsoleProvider)", phone_number, message)
        log.info("==========================================")
        print(f"\n[SMS ALERT to +91{phone_number}]: {message}\n", flush=True)
        return True
