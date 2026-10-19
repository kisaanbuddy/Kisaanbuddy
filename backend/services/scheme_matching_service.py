"""Deterministic Scheme Matching Engine for Indian Farmers.

Evaluates structured eligibility criteria against farmer farm profiles and specific inputs.
Rules are grounded in official scheme gazettes. AI models are NOT permitted to invent criteria.

Results are classified into 3 strict tiers:
1. "Potential Match" - Meets all published deterministic eligibility criteria.
2. "More Information Required" - Meets preliminary criteria but requires additional specifics (e.g. cluster size, water source confirmation, caste/tenancy verification).
3. "Appears Not to Match Published Criteria" - Violates a published rule (e.g. state jurisdiction, landholding maximum/minimum, land ownership requirement).

Every classification provides transparent, itemized explanations.
"""
from __future__ import annotations

import json
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
from db.models import Scheme
from schemas.scheme import SchemeFinderInput, SchemeMatchResult, SchemeResponse


def evaluate_scheme_eligibility(
    scheme: Scheme,
    finder_input: SchemeFinderInput
) -> SchemeMatchResult:
    """Deterministically checks farmer eligibility against official criteria."""
    
    # Parse rules JSON
    rules: Dict[str, Any] = {}
    if scheme.eligibility_rules_json:
        try:
            rules = json.loads(scheme.eligibility_rules_json) if isinstance(scheme.eligibility_rules_json, str) else scheme.eligibility_rules_json
        except Exception:
            rules = {}

    reasons: List[str] = []
    missing_criteria: List[str] = []
    hard_disqualifiers: List[str] = []
    soft_requirements: List[str] = []

    # 1. State / Jurisdiction Check
    scheme_state = (scheme.state or "All").strip()
    user_state = (finder_input.state or "All").strip()

    if scheme_state != "All" and user_state != "All":
        if scheme_state.lower() != user_state.lower():
            hard_disqualifiers.append(
                f"State jurisdiction mismatch: Scheme is strictly notified for farmers in '{scheme_state}', while selected farm state is '{user_state}'."
            )
        else:
            reasons.append(f"State eligibility confirmed for {scheme_state}.")
    elif scheme_state == "All":
        reasons.append("Central scheme applicable to eligible farmers nationwide across all States & UTs.")

    # 2. Landholding and Tenure Check
    land_acres = finder_input.landholding_acres
    tenure = finder_input.tenure_type or "owner"

    requires_land_ownership = rules.get("requires_land_ownership", False)
    allowed_tenures = rules.get("tenure_types", ["owner"])

    if requires_land_ownership and tenure != "owner":
        hard_disqualifiers.append(
            "Published criteria require legal land ownership (RoR/Khasra/Patta in farmer family name). "
            f"Current tenure indicated is '{tenure}'."
        )
    elif not requires_land_ownership and tenure in ["tenant", "sharecropper"]:
        if "tenant" in allowed_tenures or "sharecropper" in allowed_tenures:
            reasons.append(f"Tenure type '{tenure}' is recognized under published scheme provisions.")

    # Land Acreage limits
    min_land = rules.get("min_land_acres")
    max_land = rules.get("max_land_acres")

    if land_acres is not None and land_acres > 0:
        if min_land is not None and land_acres < min_land:
            hard_disqualifiers.append(
                f"Published guidelines specify minimum cultivable holding of {min_land} acres (Farmer has {land_acres} acres)."
            )
        elif max_land is not None and float(land_acres) > float(max_land):
            hard_disqualifiers.append(
                f"Scheme benefits are capped at landholding up to {max_land} acres (Small & Marginal farmer criteria; farmer has {land_acres} acres)."
            )
        else:
            if max_land is not None:
                reasons.append(f"Farm landholding ({land_acres} acres) qualifies under the {max_land}-acre ceiling.")
            else:
                reasons.append(f"Farm landholding ({land_acres} acres) meets scale requirements.")
    else:
        if min_land is not None or max_land is not None:
            soft_requirements.append(
                f"Landholding acreage not specified. Scheme applies to holdings between {min_land or 'any'} and {max_land or 'unlimited'} acres."
            )

    # 3. Farmer Category / Social Group Check
    allowed_categories = [c.lower() for c in rules.get("categories", ["general", "obc", "sc", "st", "women", "any"])]
    user_category = (finder_input.farmer_category or "any").lower()
    required_gender = rules.get("gender")

    if required_gender == "women":
        if user_category != "women":
            soft_requirements.append("Scheme is specifically targeted towards women farmers and Women Self Help Groups (SHGs).")
        else:
            reasons.append("Category match: Priority benefits for women farmers.")
    elif user_category != "any" and allowed_categories and "any" not in allowed_categories:
        if user_category not in allowed_categories:
            hard_disqualifiers.append(
                f"Scheme quota is reserved for categories: {', '.join(allowed_categories).upper()} (Farmer category: {user_category.upper()})."
            )
        else:
            reasons.append(f"Eligible category: '{user_category.upper()}' matches scheme reservation criteria.")

    # 4. Water Source / Irrigation Check
    if rules.get("requires_water_source"):
        if finder_input.has_irrigation is False:
            hard_disqualifiers.append(
                "Scheme requires an assured water source (borewell, tubewell, canal, or farm pond) on the field."
            )
        elif finder_input.has_irrigation is None:
            soft_requirements.append(
                "Confirmation needed: Do you have an active water source (borewell/canal/well) on your parcel?"
            )
        else:
            reasons.append("Assured irrigation source present for equipment/pump installation.")

    # 5. Farming Activities / Investment Planned Alignment
    category_slug = scheme.category
    farmer_activities = finder_input.farming_activities

    category_activity_map = {
        "irrigation": ["micro_irrigation", "solar_pump", "borewell", "farm_pond"],
        "machinery": ["machinery", "tractor", "farm_mechanization"],
        "credit": ["credit_loan", "kcc", "working_capital"],
        "crop_insurance": ["crop_insurance", "pmfby"],
        "organic": ["organic_farming", "bio_fertilizer", "natural_farming"],
        "post_harvest": ["warehouse", "cold_storage", "post_harvest", "mandi_trading"],
        "income_support": ["income_support", "direct_benefit"],
        "inputs_subsidies": ["diesel_subsidy", "fertilizer_subsidy", "seeds_subsidy"],
        "women_empowerment": ["women_farmer", "shg_group"]
    }

    matched_activities = [act for act in farmer_activities if act in category_activity_map.get(category_slug, [])]
    if matched_activities:
        reasons.append(f"Matches your planned farm activity: {', '.join(matched_activities).replace('_', ' ').title()}.")

    # 6. Specific Scheme Prerequisites
    if rules.get("requires_bihar_dbt_reg"):
        if "bihar_dbt" in finder_input.existing_registrations:
            reasons.append("Verified 13-digit Bihar DBT Farmer Registration indicated.")
        else:
            soft_requirements.append(
                "Official requirement: Valid 13-digit Bihar DBT Farmer ID (Kisan Panjikaran) is required to submit application."
            )

    if rules.get("requires_karnataka_fruits_id"):
        if "karnataka_fruits" in finder_input.existing_registrations:
            reasons.append("Karnataka FRUITS Farmer ID (FID) indicated.")
        else:
            soft_requirements.append(
                "Official requirement: Karnataka FRUITS portal Farmer ID (FID) and RTC are needed."
            )

    if rules.get("requires_cluster_commitment"):
        soft_requirements.append(
            "Official requirement: Formation of an organic cluster of 20+ farmers (minimum 20 hectares) is required for full grant approval."
        )

    if rules.get("requires_shg_membership"):
        soft_requirements.append(
            "Official requirement: Membership in a registered DAY-NRLM / SRLM Village Self Help Group (SHG) is required."
        )

    # 7. Convert model to SchemeResponse
    # Ensure nested JSON fields are parsed into python types for Pydantic
    scheme_dict = {
        "id": scheme.id,
        "scheme_id": scheme.scheme_id,
        "name": scheme.name,
        "short_name": scheme.short_name,
        "jurisdiction": scheme.jurisdiction,
        "state": scheme.state,
        "department": scheme.department,
        "category": scheme.category,
        "overview": scheme.overview,
        "benefits_summary": scheme.benefits_summary,
        "benefits_details": scheme.benefits_details,
        "eligibility_criteria_text": scheme.eligibility_criteria_text,
        "eligibility_rules": json.loads(scheme.eligibility_rules_json) if isinstance(scheme.eligibility_rules_json, str) else scheme.eligibility_rules_json,
        "required_documents": json.loads(scheme.required_documents_json) if isinstance(scheme.required_documents_json, str) else scheme.required_documents_json,
        "application_steps": json.loads(scheme.application_steps_json) if isinstance(scheme.application_steps_json, str) else scheme.application_steps_json,
        "source_url": scheme.source_url,
        "application_url": scheme.application_url,
        "application_window_status": scheme.application_window_status,
        "application_window_start": scheme.application_window_start,
        "application_deadline": scheme.application_deadline,
        "deadline_text": scheme.deadline_text,
        "helpline_details": json.loads(scheme.helpline_details) if (scheme.helpline_details and isinstance(scheme.helpline_details, str) and scheme.helpline_details.startswith("{")) else (scheme.helpline_details or {}),
        "faqs": json.loads(scheme.faqs_json) if isinstance(scheme.faqs_json, str) else scheme.faqs_json,
        "verification_status": scheme.verification_status,
        "data_source": scheme.data_source,
        "is_active": scheme.is_active,
        "last_verified_at": scheme.last_verified_at or datetime.utcnow(),
        "created_at": scheme.created_at or datetime.utcnow(),
        "updated_at": scheme.updated_at or datetime.utcnow()
    }
    scheme_response = SchemeResponse(**scheme_dict)

    # Classification logic
    if hard_disqualifiers:
        match_status = "Appears Not to Match Published Criteria"
        score = 20
        reasons_final = hard_disqualifiers + reasons
    elif soft_requirements:
        match_status = "More Information Required"
        score = 65
        reasons_final = reasons if reasons else ["Basic profile qualifies, but verification of additional criteria is needed."]
        missing_criteria = soft_requirements
    else:
        match_status = "Potential Match"
        score = 95
        if not reasons:
            reasons.append("Your farm location, landholding, and profile align with published official eligibility criteria.")
        reasons_final = reasons

    return SchemeMatchResult(
        scheme=scheme_response,
        match_status=match_status,
        score=score,
        reasons=reasons_final,
        missing_criteria=missing_criteria
    )
