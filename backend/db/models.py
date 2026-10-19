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
        pin_code = Column(String(10), nullable=True)
        gps_lat = Column(Float, nullable=True)
        gps_lon = Column(Float, nullable=True)
        land_ownership = Column(String(50), nullable=True)  # owned, leased, both
        equipment_list = Column(Text, nullable=True)  # comma-separated list
        preferred_language = Column(String(10), nullable=True)
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


    class SoilTest(Base):  # type: ignore[misc]
        """Soil test record for a specific field."""
        __tablename__ = "soil_tests"
        id = Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
        field_id = Column(Integer, ForeignKey("farmer_fields.id"), nullable=True, index=True)
        test_date = Column(Date, nullable=False, index=True)
        lab_name = Column(String(150), nullable=True)
        soil_type = Column(String(100), nullable=True)
        soil_ph = Column(Float, nullable=True)  # 0.0-14.0
        nitrogen_kg_ha = Column(Float, nullable=True)  # kg/ha
        phosphorus_kg_ha = Column(Float, nullable=True)  # kg/ha
        potassium_kg_ha = Column(Float, nullable=True)  # kg/ha
        organic_carbon_pct = Column(Float, nullable=True)  # %
        ec_ds_m = Column(Float, nullable=True)  # electrical conductivity dS/m
        is_verified = Column(Boolean, default=False)  # lab-verified vs farmer-estimated
        notes = Column(Text, nullable=True)
        created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
        updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


    class Recommendation(Base):  # type: ignore[misc]
        """AI-generated farming recommendation for a specific farmer."""
        __tablename__ = "recommendations"
        id = Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
        field_id = Column(Integer, ForeignKey("farmer_fields.id"), nullable=True, index=True)
        title = Column(String(255), nullable=False)
        explanation = Column(Text, nullable=False)
        crop_name = Column(String(100), nullable=True)
        reason = Column(Text, nullable=True)
        data_used = Column(Text, nullable=True)  # JSON string of data points used
        recommended_action = Column(Text, nullable=False)
        date_window = Column(String(100), nullable=True)  # e.g. "15-20 Nov 2026"
        confidence = Column(String(50), nullable=True)  # e.g. "High", "Moderate"
        source = Column(String(255), nullable=True)  # e.g. "ICAR guidelines"
        category = Column(String(50), nullable=False, index=True)  # irrigation, fertilizer, pest, disease, harvest, next_season
        status = Column(String(30), default="pending", nullable=False, index=True)  # pending, completed, not_applicable, postponed
        status_updated_at = Column(DateTime, nullable=True)
        created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)


    class FarmTask(Base):  # type: ignore[misc]
        """Farm task and work planner item."""
        __tablename__ = "farm_tasks"
        id = Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
        field_id = Column(Integer, ForeignKey("farmer_fields.id"), nullable=True, index=True)
        title = Column(String(255), nullable=False)
        description = Column(Text, nullable=True)
        category = Column(String(50), default="general", nullable=False, index=True)  # irrigation, fertilizer, pesticide, soil_test, harvest, scouting, buyer_followup, general
        priority = Column(String(20), default="medium", nullable=False)  # low, medium, high, urgent
        status = Column(String(30), default="pending", nullable=False, index=True)  # pending, completed, skipped
        due_date = Column(Date, nullable=False, index=True)
        completed_at = Column(DateTime, nullable=True)
        is_ai_recommended = Column(Boolean, default=False)
        created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
        updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


    class MarketplaceListing(Base):  # type: ignore[misc]
        """Agricultural marketplace listing for finding harvest buyers or input sellers."""
        __tablename__ = "marketplace_listings"
        id = Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
        listing_type = Column(String(20), nullable=False, index=True)  # "buy" (buyer requirement), "sell" (input seller or farmer selling produce)
        category = Column(String(50), nullable=False, index=True)  # produce, seeds, fertilizer, equipment, wholesale, institutional
        crop_or_item = Column(String(120), nullable=False, index=True)  # e.g. "Wheat", "Mushroom", "Tomato", "Paddy", "Organic Compost"
        variety = Column(String(100), nullable=True)
        quantity = Column(Float, nullable=True)
        quantity_unit = Column(String(50), default="Quintal", nullable=True)  # Quintal, Ton, Kg, Bags, Units
        price = Column(Float, nullable=True)
        price_unit = Column(String(50), default="per Quintal", nullable=True)  # per Quintal, per Kg, per Bag
        organization_name = Column(String(200), nullable=False)  # e.g. "Bhopal Agro Processors", "Malwa Kisan FPO"
        contact_person = Column(String(120), nullable=True)
        contact_phone = Column(String(30), nullable=True)
        district = Column(String(100), nullable=False, index=True)
        state = Column(String(100), nullable=False, index=True)
        pincode = Column(String(10), nullable=True)
        verification_status = Column(String(50), default="verified", nullable=False)  # verified, fpo_certified, registered
        delivery_terms = Column(String(150), nullable=True)  # "Farm Gate Pickup", "Mandi Delivery", "Direct Dispatch"
        notes = Column(Text, nullable=True)
        is_active = Column(Boolean, default=True, nullable=False, index=True)
        created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
        updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


    class EquipmentCatalog(Base):  # type: ignore[misc]
        """Reference technical specifications for farm machinery & implements from official FMTTI / manufacturer test data."""
        __tablename__ = "equipment_catalog"
        id = Column(Integer, primary_key=True, index=True)
        manufacturer = Column(String(150), nullable=False)
        brand = Column(String(100), nullable=False, index=True)
        model_name = Column(String(150), nullable=False, index=True)
        category = Column(String(50), nullable=False, index=True)  # tractors, harvesters, rotavators, seed_drills, cultivators, ploughs, sprayers, threshers, agricultural_trailers, irrigation_equipment, other_implements
        subcategory = Column(String(100), nullable=True)
        hp_rating = Column(Float, nullable=True, index=True)
        working_width_mm = Column(Float, nullable=True)
        capacity = Column(String(100), nullable=True)
        fuel_type = Column(String(50), nullable=True)
        pto_hp = Column(Float, nullable=True)
        pto_rpm = Column(Integer, nullable=True)
        lifting_capacity_kg = Column(Float, nullable=True)
        weight_kg = Column(Float, nullable=True)
        compatible_tractor_hp = Column(String(50), nullable=True)
        specifications_json = Column(Text, nullable=True)  # JSON dictionary of detailed technical specs
        description = Column(Text, nullable=True)
        official_source_url = Column(String(500), nullable=True)
        source_verification_date = Column(Date, nullable=True)
        image_url = Column(String(500), nullable=True)
        indicative_price = Column(Float, nullable=True)  # Verified product price from supplier, if available
        supplier_name = Column(String(100), nullable=True)  # e.g., "MachinePoint", "OEM Direct"
        provenance_source = Column(String(255), nullable=False)  # e.g., "CFMTTI Budni Test Report No. T-1244/2021"
        provenance_license = Column(String(255), nullable=False)  # e.g., "National Data Sharing & Accessibility Policy (NDSAP) - Public Domain"
        is_verified = Column(Boolean, default=True, nullable=False)
        is_reference_only = Column(Boolean, default=True, nullable=False)  # Explicitly flag reference-only specs
        is_active = Column(Boolean, default=True, nullable=False, index=True)
        created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
        updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


    class EquipmentListing(Base):  # type: ignore[misc]
        """Actual farm equipment actively offered for rent or sale by a farmer, owner, or authorized custom hiring center."""
        __tablename__ = "equipment_listings"
        id = Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
        catalog_id = Column(Integer, ForeignKey("equipment_catalog.id"), nullable=True, index=True)
        listing_type = Column(String(20), nullable=False, index=True)  # "rent" or "sale"
        title = Column(String(255), nullable=False)
        brand = Column(String(100), nullable=False, index=True)
        model_name = Column(String(150), nullable=False)
        category = Column(String(50), nullable=False, index=True)
        hp_rating = Column(Float, nullable=True)
        condition = Column(String(50), default="good", nullable=False)  # new, excellent, good, fair
        year_of_manufacture = Column(Integer, nullable=True)
        operating_hours = Column(Float, nullable=True)
        price = Column(Float, nullable=False)
        price_unit = Column(String(50), nullable=False)  # "per hour", "per day", "per acre", "total price"
        security_deposit = Column(Float, nullable=True)
        includes_operator = Column(Boolean, default=False, nullable=False)
        owner_name = Column(String(150), nullable=False)
        owner_phone = Column(String(30), nullable=True)
        owner_consent_shared = Column(Boolean, default=True, nullable=False)
        state = Column(String(100), nullable=False, index=True)
        district = Column(String(100), nullable=False, index=True)
        tehsil_or_block = Column(String(100), nullable=True)
        village = Column(String(150), nullable=True)
        pincode = Column(String(10), nullable=True)
        availability_status = Column(String(50), default="available", nullable=False, index=True)  # available, booked, under_maintenance, sold, inactive
        notes = Column(Text, nullable=True)
        created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
        updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


    class ProduceListing(Base):  # type: ignore[misc]
        """Actual agricultural harvest produce actively offered for sale by verified farmers or FPOs."""
        __tablename__ = "produce_listings"
        id = Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
        crop_name = Column(String(120), nullable=False, index=True)
        variety = Column(String(100), nullable=True, index=True)
        category = Column(String(50), default="cereal", nullable=False, index=True)  # cereal, pulse, oilseed, vegetable, fruit, cash_crop
        quantity = Column(Float, nullable=False)
        quantity_unit = Column(String(50), default="Quintal", nullable=False)
        asking_price = Column(Float, nullable=False)
        price_unit = Column(String(50), default="per Quintal", nullable=False)
        is_negotiable = Column(Boolean, default=True, nullable=False)
        harvest_date = Column(Date, nullable=True)
        expected_dispatch_date = Column(Date, nullable=True)
        grade_or_quality = Column(String(100), default="Grade A FAQ", nullable=False)
        moisture_pct = Column(Float, nullable=True)
        farmer_name = Column(String(150), nullable=False)
        farmer_phone = Column(String(30), nullable=True)
        contact_consent_verified = Column(Boolean, default=True, nullable=False)
        state = Column(String(100), nullable=False, index=True)
        district = Column(String(100), nullable=False, index=True)
        mandi_nearby = Column(String(120), nullable=True)
        delivery_option = Column(String(100), default="Farm Gate Pickup", nullable=False)  # Farm Gate Pickup, Mandi Delivery, Direct Dispatch
        village_or_tehsil = Column(String(150), nullable=True)
        photo_urls = Column(Text, nullable=True)  # JSON-encoded array or comma-separated image URLs
        last_confirmation_date = Column(Date, nullable=True)  # Seller confirmation of stock and price
        source_origin = Column(String(100), default="kisaanbuddy_farmer", nullable=False)  # kisaanbuddy_farmer, fpo_partner, external_partner
        availability_status = Column(String(50), default="available", nullable=False, index=True)  # available, under_negotiation, sold_out, inactive, flagged
        verification_status = Column(String(50), default="verified", nullable=False)  # verified, fpo_member, self_declared
        notes = Column(Text, nullable=True)
        created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
        updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


    class MarketPriceRecord(Base):  # type: ignore[misc]
        """Benchmark market price observation from AGMARKNET / data.gov.in. Used strictly as market context."""
        __tablename__ = "market_price_records"
        id = Column(Integer, primary_key=True, index=True)
        commodity = Column(String(100), nullable=False, index=True)
        variety = Column(String(100), nullable=True)
        state = Column(String(100), nullable=False, index=True)
        district = Column(String(100), nullable=False, index=True)
        market_center = Column(String(150), nullable=False, index=True)
        arrival_date = Column(Date, nullable=False, index=True)
        arrival_quantity = Column(Float, nullable=True)
        arrival_unit = Column(String(50), default="Tonnes", nullable=True)
        min_price = Column(Float, nullable=False)
        max_price = Column(Float, nullable=False)
        modal_price = Column(Float, nullable=False)
        source_name = Column(String(255), default="AGMARKNET / Directorate of Marketing & Inspection", nullable=False)
        source_url = Column(String(500), nullable=True)
        data_retrieval_timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
        created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


    class BuyerRequirement(Base):  # type: ignore[misc]
        """Dedicated buyer requirement for agricultural produce from processors, millers, wholesalers, and exporters."""
        __tablename__ = "buyer_requirements"
        id = Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
        commodity = Column(String(120), nullable=False, index=True)
        variety = Column(String(100), nullable=True)
        required_quantity = Column(Float, nullable=False)
        quantity_unit = Column(String(50), default="Quintal", nullable=False)
        buyer_name = Column(String(150), nullable=False)
        buyer_type = Column(String(50), default="Wholesale Trader", nullable=False)  # Food Processor, Mill Owner, Exporter, FPO Aggregator, Wholesale Trader
        buyer_location = Column(String(150), nullable=False)
        state = Column(String(100), nullable=False, index=True)
        district = Column(String(100), nullable=False, index=True)
        delivery_destination = Column(String(200), nullable=True)
        expected_price_min = Column(Float, nullable=True)
        expected_price_max = Column(Float, nullable=True)
        expected_price = Column(Float, nullable=True)
        price_unit = Column(String(50), default="per Quintal", nullable=False)
        quality_requirements = Column(Text, nullable=True)  # e.g., "Moisture < 12%, Foreign matter < 1%, FAQ Grade"
        offer_expiry_date = Column(Date, nullable=False, index=True)
        verification_status = Column(String(50), default="verified", nullable=False)  # verified, enterprise_partner, fpo_certified, self_declared
        source = Column(String(150), default="KisaanBuddy verified buyer requirement", nullable=False)
        original_offer_url = Column(String(500), nullable=True)
        contact_person = Column(String(120), nullable=True)
        contact_phone = Column(String(30), nullable=True)
        contact_consent_verified = Column(Boolean, default=True, nullable=False)
        status = Column(String(30), default="active", nullable=False, index=True)  # active, expired, fulfilled, cancelled
        created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
        updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


    class GovernmentProcurement(Base):  # type: ignore[misc]
        """Official government procurement centre information, seasons, and MSP benchmarks."""
        __tablename__ = "government_procurements"
        id = Column(Integer, primary_key=True, index=True)
        crop_name = Column(String(120), nullable=False, index=True)
        variety = Column(String(100), nullable=True)
        procurement_season = Column(String(100), nullable=False, index=True)  # e.g., "Rabi Marketing Season (RMS) 2026-27"
        msp_rate = Column(Float, nullable=False)  # Minimum Support Price per quintal
        price_unit = Column(String(50), default="per Quintal", nullable=False)
        state = Column(String(100), nullable=False, index=True)
        district = Column(String(100), nullable=False, index=True)
        procurement_center = Column(String(200), nullable=False, index=True)
        nodal_agency = Column(String(150), nullable=False)  # FCI, NAFED, State Civil Supplies Corporation, HAFED
        faq_specifications = Column(Text, nullable=True)  # Fair Average Quality parameters
        registration_requirements = Column(Text, nullable=True)  # Khasra land verification, Aadhaar-linked DBT account
        start_date = Column(Date, nullable=True)
        end_date = Column(Date, nullable=True)
        status = Column(String(30), default="active", nullable=False, index=True)  # active, upcoming, closed
        official_portal_url = Column(String(500), nullable=False)
        source_name = Column(String(255), default="Food Corporation of India / State Civil Supplies", nullable=False)
        source_url = Column(String(500), nullable=True)
        last_updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
        disclaimer = Column(Text, nullable=True)


    class TradeInquiry(Base):  # type: ignore[misc]
        """User quotation or expression of interest on a produce listing or buyer requirement."""
        __tablename__ = "trade_inquiries"
        id = Column(Integer, primary_key=True, index=True)
        listing_type = Column(String(30), nullable=False, index=True)  # "produce_listing" or "buyer_requirement"
        listing_id = Column(Integer, nullable=False, index=True)
        sender_user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
        sender_name = Column(String(120), nullable=False)
        sender_phone = Column(String(30), nullable=False)
        sender_type = Column(String(50), default="farmer", nullable=False)  # farmer, buyer, fpo, trader
        proposed_quantity = Column(Float, nullable=True)
        quantity_unit = Column(String(50), default="Quintal", nullable=True)
        proposed_price = Column(Float, nullable=True)
        price_unit = Column(String(50), default="per Quintal", nullable=True)
        message = Column(Text, nullable=True)
        status = Column(String(30), default="submitted", nullable=False, index=True)  # submitted, in_discussion, accepted, rejected, closed
        created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
        updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


    class ListingReport(Base):  # type: ignore[misc]
        """Audit report for misleading, fraudulent, or inaccurate listings."""
        __tablename__ = "listing_reports"
        id = Column(Integer, primary_key=True, index=True)
        target_type = Column(String(50), nullable=False, index=True)  # "produce_listing", "buyer_requirement", "market_price"
        target_id = Column(Integer, nullable=False, index=True)
        reporter_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
        reporter_name = Column(String(120), nullable=True)
        reporter_phone = Column(String(30), nullable=True)
        reason = Column(String(100), nullable=False)  # misleading_price, fake_stock, unreachable_contact, fraudulent, duplicate, other
        details = Column(Text, nullable=True)
        status = Column(String(30), default="pending_review", nullable=False, index=True)  # pending_review, investigated, dismissed, action_taken
        admin_notes = Column(Text, nullable=True)
        created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
        resolved_at = Column(DateTime, nullable=True)


    class ImportSource(Base):  # type: ignore[misc]
        """Registered external agricultural data sources with licensing, permissions, and update status."""
        __tablename__ = "import_sources"
        id = Column(Integer, primary_key=True, index=True)
        source_name = Column(String(200), nullable=False)
        source_slug = Column(String(100), unique=True, nullable=False, index=True)
        source_type = Column(String(50), nullable=False)  # government_portal, open_data_api, manufacturer_spec, csv_dataset, ondc_feed
        base_url = Column(String(500), nullable=True)
        auth_type = Column(String(50), default="none", nullable=False)
        commercial_reuse_terms = Column(Text, nullable=True)
        update_frequency = Column(String(50), default="monthly", nullable=False)
        last_imported_at = Column(DateTime, nullable=True)
        records_count = Column(Integer, default=0, nullable=False)
        is_active = Column(Boolean, default=True, nullable=False)


    class ImportJob(Base):  # type: ignore[misc]
        """Execution audit for data import runs from external sources."""
        __tablename__ = "import_jobs"
        id = Column(Integer, primary_key=True, index=True)
        source_slug = Column(String(100), nullable=False, index=True)
        target_type = Column(String(50), nullable=False)  # equipment_catalog, market_prices, produce_reference
        status = Column(String(30), default="pending", nullable=False, index=True)  # pending, running, completed, failed
        records_read = Column(Integer, default=0)
        records_inserted = Column(Integer, default=0)
        records_updated = Column(Integer, default=0)
        records_skipped = Column(Integer, default=0)
        error_summary = Column(Text, nullable=True)
        started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
        completed_at = Column(DateTime, nullable=True)


    class ImportLog(Base):  # type: ignore[misc]
        """Detailed audit log entry for failed, skipped, or warning records during an import job."""
        __tablename__ = "import_logs"
        id = Column(Integer, primary_key=True, index=True)
        job_id = Column(Integer, ForeignKey("import_jobs.id"), nullable=False, index=True)
        log_level = Column(String(20), default="INFO", nullable=False)  # INFO, WARNING, ERROR
        record_identifier = Column(String(255), nullable=True)
        message = Column(Text, nullable=False)
        timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)


