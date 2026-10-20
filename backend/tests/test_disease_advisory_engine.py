"""Unit and integration tests for KisaanBuddy Agricultural Knowledge & Advisory Engine."""
import unittest
from services.disease_knowledge_engine import (
    AUTHENTIC_KVK_DIRECTORY,
    AGRICULTURAL_KNOWLEDGE_BASE,
    mask_phone_number,
    generate_advisory_case_id,
    find_matching_expert,
    query_knowledge_base,
    dispatch_advisory_notifications,
)


class TestDiseaseAdvisoryEngine(unittest.TestCase):
    def test_knowledge_base_records(self):
        """Verifies presence of authentic ICAR/CIBRC records."""
        self.assertGreaterEqual(len(AGRICULTURAL_KNOWLEDGE_BASE), 8)
        crops = {r["crop"] for r in AGRICULTURAL_KNOWLEDGE_BASE}
        self.assertIn("Wheat", crops)
        self.assertIn("Rice", crops)
        self.assertIn("Cotton", crops)
        self.assertIn("Tomato", crops)

    def test_safe_treatment_hierarchy(self):
        """Verifies each knowledge record contains cultural, biological, and chemical controls."""
        for rec in AGRICULTURAL_KNOWLEDGE_BASE:
            self.assertTrue(len(rec["cultural_preventive"]) > 10, f"Missing cultural control for {rec['disease_or_pest']}")
            self.assertTrue(len(rec["biological_organic"]) > 10, f"Missing biological control for {rec['disease_or_pest']}")
            self.assertTrue(len(rec["chemical_control"]) > 10, f"Missing chemical control for {rec['disease_or_pest']}")
            self.assertIn("safety_instructions", rec)
            self.assertIn("pre_harvest_interval_days", rec)
            self.assertIn("source_institution", rec)

    def test_kvk_expert_directory(self):
        """Verifies authentic KVK directory entries have valid official contact info."""
        self.assertGreaterEqual(len(AUTHENTIC_KVK_DIRECTORY), 7)
        kcc = next(e for e in AUTHENTIC_KVK_DIRECTORY if e["id"] == 8)
        self.assertEqual(kcc["official_phone"], "1800-180-1551")
        self.assertEqual(kcc["institution_type"], "dept_agri")

        # Verify all KVKs have real phone numbers and districts
        for exp in AUTHENTIC_KVK_DIRECTORY:
            self.assertTrue(len(exp["official_phone"]) >= 10)
            self.assertTrue(len(exp["district"]) > 0)
            self.assertTrue(len(exp["state"]) > 0)
            self.assertIn("specialization", exp)

    def test_geographic_matching(self):
        """Verifies geographic matching by state and district."""
        # Haryana Karnal match
        karnal_exp = find_matching_expert("Haryana", "Karnal", "Wheat")
        self.assertEqual(karnal_exp["district"], "Karnal")
        self.assertIn("Wheat", karnal_exp["crops_supported"])

        # Maharashtra Pune match
        pune_exp = find_matching_expert("Maharashtra", "Pune", "Sugarcane")
        self.assertEqual(pune_exp["district"], "Pune")

        # Unknown state fallback to Kisan Call Centre
        unknown_exp = find_matching_expert("UnmappedState", "UnmappedDistrict", "ExoticCrop")
        self.assertEqual(unknown_exp["id"], 8)
        self.assertEqual(unknown_exp["official_phone"], "1800-180-1551")

    def test_privacy_phone_masking(self):
        """Verifies farmer phone number is masked for privacy."""
        masked = mask_phone_number("+919876543210")
        self.assertEqual(masked, "+9198*** **210")
        self.assertNotIn("76543", masked)

    def test_advisory_case_id_generation(self):
        """Verifies unique structured case ID format ADV-YYYYMMDD-XXXX."""
        case_id = generate_advisory_case_id()
        self.assertTrue(case_id.startswith("ADV-"))
        parts = case_id.split("-")
        self.assertEqual(len(parts), 3)
        self.assertEqual(len(parts[1]), 8)  # YYYYMMDD

    def test_notification_dispatch(self):
        """Verifies notification audit logging generates expected multi-channel logs."""
        expert = AUTHENTIC_KVK_DIRECTORY[0]
        case_id = "ADV-20261020-1234"
        logs = dispatch_advisory_notifications(case_id, expert, "+919876543210")
        channels = [l["channel"] for l in logs]
        self.assertIn("dashboard", channels)
        self.assertIn("sms", channels)


if __name__ == "__main__":
    unittest.main()
