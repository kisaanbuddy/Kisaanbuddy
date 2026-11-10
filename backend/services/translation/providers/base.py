"""Base Translation Provider Abstract Interface."""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import List


class BaseTranslationProvider(ABC):
    """Abstract base class for all machine translation providers."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Provider identifier string (e.g. 'indictrans2', 'sarvam')."""
        pass

    @abstractmethod
    async def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str,
    ) -> str:
        """Translate a single text string.

        Args:
            text: Text to translate
            source_lang: Source FLORES-200 or normalized language code
            target_lang: Target FLORES-200 or normalized language code

        Returns:
            Translated string
        """
        pass

    @abstractmethod
    async def translate_batch(
        self,
        texts: List[str],
        source_lang: str,
        target_lang: str,
    ) -> List[str]:
        """Translate a list of text strings in batch.

        Args:
            texts: List of strings to translate
            source_lang: Source FLORES-200 or normalized language code
            target_lang: Target FLORES-200 or normalized language code

        Returns:
            List of translated strings matching input order
        """
        pass

    @abstractmethod
    async def is_healthy(self) -> bool:
        """Checks if the provider service is reachable and functional."""
        pass
