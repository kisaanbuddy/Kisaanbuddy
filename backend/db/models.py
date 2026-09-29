"""SQLAlchemy ORM models.

Mirrors the schema defined in Blueprint Phase 12:
    users, crops, farmer_fields, disease_detections, chat_interactions
"""
from datetime import datetime

try:
    from sqlalchemy import (
        Column, Integer, String, Float, Text, DateTime, Date, ForeignKey, Boolean, LargeBinary,
    )
    from sqlalchemy.orm import relationship
except ImportError:
    # SQLAlchemy optional; module importable so schema tools can still run.
    Column = Integer = String = Float = Text = DateTime = Date = ForeignKey = Boolean = LargeBinary = None  # type: ignore
    relationship = lambda *a, **k: None  # type: ignore

from db.session import Base


if Column is not None:

    class User(Base):  # type: ignore[misc]
        __tablename__ = "users"
        id = Column(Integer, primary_key=True, index=True)
        phone_number = Column(String(50), unique=True, nullable=False, index=True)
        name = Column(String(100))
        email = Column(String(255), unique=True, index=True, nullable=True)
        email_verified = Column(Boolean, default=False)
        password_hash = Column(String(255), nullable=True)
        provider = Column(String(50), default="email")
        provider_id = Column(String(255), unique=True, index=True, nullable=True)
        profile_image = Column(Text, nullable=True)
        role = Column(String(50), default="Farmer")
        is_active = Column(Boolean, default=True)
        language = Column(String(10), default="en")
        lat = Column(Float)
        lon = Column(Float)
        created_at = Column(DateTime, default=datetime.utcnow)
        updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
        last_login_at = Column(DateTime, nullable=True)
        last_seen_at = Column(DateTime, nullable=True)

        fields = relationship("FarmerField", back_populates="user")
        farms = relationship("Farm", back_populates="user")


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
        acreage = Column(Float, nullable=True)
        current_crop = Column(String(100), nullable=True)
        irrigation_type = Column(String(100), nullable=True)
        farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True, index=True)
        area_unit = Column(String(20), default="acre")
        location_text = Column(String(255), nullable=True)
        water_source = Column(String(100), nullable=True)
        crop_variety = Column(String(100), nullable=True)
        season = Column(String(50), nullable=True)
        previous_crop = Column(String(100), nullable=True)
        expected_harvest = Column(Date, nullable=True)
        notes = Column(Text, nullable=True)

        user = relationship("User", back_populates="fields")
        crop = relationship("Crop")
        farm = relationship("Farm", back_populates="fields")
        crop_cycles = relationship("FieldCrop", back_populates="field", cascade="all, delete-orphan")
        activities = relationship("FarmActivity", back_populates="field", cascade="all, delete-orphan")


    class Farm(Base):  # type: ignore[misc]
        """A farmer-owned farm. Fields are the operational unit below it."""
        __tablename__ = "farms"
        id = Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
        name = Column(String(150), nullable=False)
        location_text = Column(String(255), nullable=True)
        village_name = Column(String(100), nullable=True)
        district_name = Column(String(100), nullable=True)
        state_name = Column(String(100), nullable=True)
        notes = Column(Text, nullable=True)
        created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
        updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

        user = relationship("User", back_populates="farms")
        fields = relationship("FarmerField", back_populates="farm")


    class FieldCrop(Base):  # type: ignore[misc]
        """A crop cycle belonging to one field; preserves rotation history."""
        __tablename__ = "field_crops"
        id = Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
        field_id = Column(Integer, ForeignKey("farmer_fields.id"), nullable=False, index=True)
        crop_name = Column(String(100), nullable=False)
        variety = Column(String(100), nullable=True)
        season = Column(String(50), nullable=True)
        sowing_date = Column(Date, nullable=True)
        expected_harvest = Column(Date, nullable=True)
        stage_override = Column(String(80), nullable=True)
        is_current = Column(Boolean, default=True, nullable=False, index=True)
        notes = Column(Text, nullable=True)
        created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

        field = relationship("FarmerField", back_populates="crop_cycles")


    class FarmActivity(Base):  # type: ignore[misc]
        """Persistent ledger entry. Amount is a cost or income only when supplied."""
        __tablename__ = "farm_activities"
        id = Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
        field_id = Column(Integer, ForeignKey("farmer_fields.id"), nullable=True, index=True)
        crop_cycle_id = Column(Integer, ForeignKey("field_crops.id"), nullable=True, index=True)
        activity_date = Column(Date, nullable=False, index=True)
        activity_type = Column(String(50), nullable=False, index=True)
        title = Column(String(255), nullable=False)
        category = Column(String(30), nullable=False, default="activity")
        amount = Column(Float, nullable=True)
        quantity = Column(Float, nullable=True)
        unit = Column(String(30), nullable=True)
        labour_count = Column(Integer, nullable=True)
        notes = Column(Text, nullable=True)
        created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
        updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

        field = relationship("FarmerField", back_populates="activities")


    class DiseaseDetection(Base):  # type: ignore[misc]
        __tablename__ = "disease_detections"
        id = Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, ForeignKey("users.id"))
        field_id = Column(Integer, ForeignKey("farmer_fields.id"))
        image_url = Column(Text, nullable=False)
        detected_disease = Column(String(255))
        crop_name = Column(String(100), nullable=True)
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

    class Review(Base):  # type: ignore[misc]
        __tablename__ = "reviews"
        id = Column(String(50), primary_key=True, index=True)
        name = Column(String(100), nullable=False)
        location = Column(String(255), nullable=False)
        crop = Column(String(100), nullable=False)
        text = Column(Text, nullable=False)
        stars = Column(Integer, default=5)
        status = Column(String(50), default="pending")
        created_at = Column(String(50))
        updated_at = Column(String(50))

    class FarmerProfile(Base):
        __tablename__ = "farmer_profiles"
        id = Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)
        village_name = Column(String(100), index=True)
        block_name = Column(String(100))
        district_name = Column(String(100), index=True)
        state_name = Column(String(100), index=True)
        experience_years = Column(Integer, default=0)
        primary_crop = Column(String(100))
        land_holding_acres = Column(Float, default=0.0)
        has_irrigation = Column(Boolean, default=False)
        has_tractor = Column(Boolean, default=False)
        created_at = Column(DateTime, default=datetime.utcnow)
        updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

        user = relationship("User")

    class ActivityLog(Base):
        __tablename__ = "activity_logs"
        id = Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, ForeignKey("users.id"), index=True)
        activity_type = Column(String(100), index=True)
        details = Column(Text)
        ip_address = Column(String(50))
        device_info = Column(String(255))
        logged_at = Column(DateTime, default=datetime.utcnow, index=True)

    class SiteContent(Base):
        """A published, locale-specific override for public site copy."""
        __tablename__ = "site_content"
        id = Column(Integer, primary_key=True, index=True)
        locale = Column(String(10), nullable=False, index=True)
        content_key = Column(String(255), nullable=False, unique=True, index=True)
        value = Column(Text, nullable=False)
        is_published = Column(Boolean, default=True, nullable=False, index=True)
        updated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
        created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
        updated_at = Column(DateTime, default=datetime.utcnow, nullable=False, onupdate=datetime.utcnow)

    class MediaAsset(Base):
        """Owner-uploaded media stored durably with the application database."""
        __tablename__ = "media_assets"
        id = Column(Integer, primary_key=True, index=True)
        filename = Column(String(255), nullable=False)
        content_type = Column(String(100), nullable=False)
        data = Column(LargeBinary, nullable=False)
        size_bytes = Column(Integer, nullable=False)
        is_published = Column(Boolean, default=True, nullable=False, index=True)
        uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
        created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    class Notification(Base):
        __tablename__ = "notifications"
        id = Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, ForeignKey("users.id"), index=True)
        title = Column(String(255))
        message = Column(Text)
        is_read = Column(Boolean, default=False, index=True)
        category = Column(String(50), index=True)
        created_at = Column(DateTime, default=datetime.utcnow, index=True)

    class SavedArticle(Base):
        __tablename__ = "saved_articles"
        id = Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, ForeignKey("users.id"), index=True)
        article_slug = Column(String(255), index=True)
        article_title = Column(String(255))
        saved_at = Column(DateTime, default=datetime.utcnow, index=True)

    class Feedback(Base):
        __tablename__ = "feedback"
        id = Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
        name = Column(String(100))
        email = Column(String(255))
        rating = Column(Integer)
        category = Column(String(50), index=True)
        comment = Column(Text, nullable=False)
        created_at = Column(DateTime, default=datetime.utcnow, index=True)


    class UserOTP(Base):  # type: ignore[misc]
        __tablename__ = "user_otps"
        id = Column(Integer, primary_key=True, index=True)
        phone_number = Column(String(50), nullable=False, index=True)
        hashed_otp = Column(String(255), nullable=False)
        created_at = Column(DateTime, default=datetime.utcnow)
        expires_at = Column(DateTime, nullable=False)
        attempts = Column(Integer, default=0)
        is_verified = Column(Boolean, default=False)


    class OtpRegistrationGrant(Base):  # type: ignore[misc]
        """Single-use handoff between OTP verification and profile completion."""
        __tablename__ = "otp_registration_grants"
        id = Column(Integer, primary_key=True, index=True)
        phone_number = Column(String(50), unique=True, nullable=False, index=True)
        token_hash = Column(String(64), nullable=False)
        expires_at = Column(DateTime, nullable=False)
        used_at = Column(DateTime, nullable=True)
        created_at = Column(DateTime, default=datetime.utcnow)


    class UserSession(Base):  # type: ignore[misc]
        __tablename__ = "user_sessions"
        id = Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
        session_token = Column(String(255), unique=True, nullable=False, index=True)
        created_at = Column(DateTime, default=datetime.utcnow)
        expires_at = Column(DateTime, nullable=False)
        last_active_at = Column(DateTime, default=datetime.utcnow)
        ip_address = Column(String(100), nullable=True)
        user_agent = Column(String(255), nullable=True)
        is_revoked = Column(Boolean, default=False)
        phone_number = Column(String(50), nullable=True)
        device_type = Column(String(50), nullable=True)
        browser = Column(String(50), nullable=True)
        os = Column(String(50), nullable=True)

        user = relationship("User")


    class UserSecurityState(Base):  # type: ignore[misc]
        __tablename__ = "user_security_state"
        id = Column(Integer, primary_key=True, index=True)
        phone_number = Column(String(50), unique=True, nullable=False, index=True)
        failed_attempts = Column(Integer, default=0)
        locked_until = Column(DateTime, nullable=True)
        request_count = Column(Integer, default=0)
        last_request_at = Column(DateTime, nullable=True)
        updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


    class SystemJob(Base):  # type: ignore[misc]
        __tablename__ = "system_jobs"
        job_name = Column(String(100), primary_key=True, index=True)
        last_run_at = Column(DateTime, nullable=False)




