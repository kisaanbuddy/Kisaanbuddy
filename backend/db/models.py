"""SQLAlchemy ORM models.

Mirrors the schema defined in Blueprint Phase 12:
    users, crops, farmer_fields, disease_detections, chat_interactions
"""
from datetime import datetime

try:
    from sqlalchemy import (
        Column, Integer, String, Float, Text, DateTime, Date, ForeignKey,
    )
    from sqlalchemy.orm import relationship
except ImportError:
    # SQLAlchemy optional; module importable so schema tools can still run.
    Column = Integer = String = Float = Text = DateTime = Date = ForeignKey = None  # type: ignore
    relationship = lambda *a, **k: None  # type: ignore

from db.session import Base


if Column is not None:

    class User(Base):  # type: ignore[misc]
        __tablename__ = "users"
        id = Column(Integer, primary_key=True, index=True)
        phone_number = Column(String(15), unique=True, nullable=False, index=True)
        name = Column(String(100))
        language = Column(String(10), default="en")
        # location stored as lat/lon for MVP; use PostGIS GEOGRAPHY in prod
        lat = Column(Float)
        lon = Column(Float)
        created_at = Column(DateTime, default=datetime.utcnow)

        fields = relationship("FarmerField", back_populates="user")


    class Crop(Base):  # type: ignore[misc]
        __tablename__ = "crops"
        id = Column(Integer, primary_key=True, index=True)
        name = Column(String(100), unique=True, nullable=False)
        scientific_name = Column(String(255))
        description = Column(Text)


    class FarmerField(Base):  # type: ignore[misc]
        __tablename__ = "farmer_fields"
        id = Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, ForeignKey("users.id"))
        field_name = Column(String(255))
        polygon_geojson = Column(Text)  # store GeoJSON string for MVP
        crop_id = Column(Integer, ForeignKey("crops.id"))
        sowing_date = Column(Date)
        soil_type = Column(String(50))

        user = relationship("User", back_populates="fields")
        crop = relationship("Crop")


    class DiseaseDetection(Base):  # type: ignore[misc]
        __tablename__ = "disease_detections"
        id = Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, ForeignKey("users.id"))
        field_id = Column(Integer, ForeignKey("farmer_fields.id"))
        image_url = Column(Text, nullable=False)
        detected_disease = Column(String(255))
        confidence = Column(Float)
        remedy_suggested = Column(Text)
        detected_at = Column(DateTime, default=datetime.utcnow)


    class ChatInteraction(Base):  # type: ignore[misc]
        __tablename__ = "chat_interactions"
        id = Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, ForeignKey("users.id"))
        query_text = Column(Text)
        query_audio_url = Column(Text)
        response_text = Column(Text)
        response_audio_url = Column(Text)
        language = Column(String(10))
        interacted_at = Column(DateTime, default=datetime.utcnow)

    class WorkerJob(Base):  # type: ignore[misc]
        __tablename__ = "worker_jobs"
        id = Column(Integer, primary_key=True, index=True)
        work_type = Column(String(100), nullable=False)
        location = Column(String(255), nullable=False)
        workers_needed = Column(Integer, nullable=False)
        wage = Column(String(100))
        contact_number = Column(String(20), nullable=False)
        created_at = Column(DateTime, default=datetime.utcnow)
