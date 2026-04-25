"""Pydantic schemas for request/response validation.

Per KrishiAI Blueprint Phase 12.
"""
from .weather import WeatherResponse, ForecastResponse, ForecastDay
from .chatbot import ChatQuery, ChatResponse
from .disease import DiseaseDetectionResponse
from .crop import CropInput, CropRecommendation
from .scheme import Scheme

__all__ = [
    "WeatherResponse",
    "ForecastResponse",
    "ForecastDay",
    "ChatQuery",
    "ChatResponse",
    "DiseaseDetectionResponse",
    "CropInput",
    "CropRecommendation",
    "Scheme",
]
