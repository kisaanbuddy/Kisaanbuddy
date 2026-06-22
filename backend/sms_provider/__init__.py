import logging
from core.config import settings
from .provider_interface import SMSProvider
from .console_provider import ConsoleProvider
from .twofactor_provider import TwoFactorProvider
from .msg91_provider import Msg91Provider
from .twilio_provider import TwilioProvider

log = logging.getLogger("krishiai.sms_provider")

def get_sms_provider() -> SMSProvider:
    # If SMS provider flag is disabled in configuration, always fallback to ConsoleProvider
    if not settings.ENABLE_SMS_PROVIDER:
        log.info("SMS provider integration is disabled. Defaulting to ConsoleProvider.")
        return ConsoleProvider()

    provider_name = settings.OTP_PROVIDER.strip().lower()
    log.info("Initializing SMS provider: %s", provider_name)
    
    if provider_name == "2factor":
        return TwoFactorProvider()
    elif provider_name == "msg91":
        return Msg91Provider()
    elif provider_name == "twilio":
        return TwilioProvider()
    else:
        return ConsoleProvider()
