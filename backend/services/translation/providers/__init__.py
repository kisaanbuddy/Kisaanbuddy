"""Translation Providers Package."""
from services.translation.providers.base import BaseTranslationProvider
from services.translation.providers.indictrans2_provider import IndicTrans2Provider

__all__ = [
    "BaseTranslationProvider",
    "IndicTrans2Provider",
]
