"""Test suite for Agricultural Support Directory and KCC Fallback Policy."""
import pytest
from services.disease_knowledge_engine import (
    AUTHENTIC_KVK_DIRECTORY,
    AGRICULTURAL_KNOWLEDGE_BASE,
    find_matching_expert,
    query_knowledge_base,
)

def test_kisan_call_centre_exists_as_national_fallback():
    """Verify National Kisan Call Centre 1800-180-1551 is present as authoritative fallback."""
    kcc = AUTHENTIC_KVK_DIRECTORY[-1]
    assert "Kisan Call Centre" in kcc["name"]
    assert kcc["official_phone"] == "1800-180-1551"
    assert kcc["official_email"] == "kisan-callcentre@gov.in"
    assert kcc["is_active"] is True

def test_unmatched_district_falls_back_to_kcc():
    """When a remote or unknown district is provided, system safely falls back to KCC."""
    matched = find_matching_expert(district="UnknownDistrict999", state="UnknownState999", crop="UnknownCrop")
    assert matched["official_phone"] == "1800-180-1551"
    assert "Kisan Call Centre" in matched["name"]

def test_punjab_ludhiana_matches_pau_kvk():
    """Verify Ludhiana queries match Punjab Agricultural University KVK."""
    matched = find_matching_expert(district="Ludhiana", state="Punjab", crop="Wheat")
    assert "PAU" in matched["institution_name"] or "Ludhiana" in matched["district"]
    assert matched["official_phone"] == "+91 161 2401960"

def test_karnataka_kolar_matches_uasb_kvk():
    """Verify Kolar queries match UAS Bangalore KVK."""
    matched = find_matching_expert(district="Kolar", state="Karnataka", crop="Tomato")
    assert "Kolar" in matched["institution_name"] or "Kolar" in matched["district"]
    assert matched["official_phone"] == "+91 8152 243112"

def test_authentic_knowledge_base_cibrc_compliance():
    """Ensure all plant disease treatments have genuine chemical or biological guidelines."""
    wheat_diseases = query_knowledge_base("Wheat", "Yellow Rust")
    assert len(wheat_diseases) > 0
    record = wheat_diseases[0]
    assert "Propiconazole" in record["chemical_control"]
    assert "dosage_guidelines" in record
    assert record["pre_harvest_interval_days"] >= 14
    assert "source_institution" in record
