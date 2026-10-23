import unittest
import json
from unittest.mock import MagicMock
from db.models import Scheme
from schemas.scheme import SchemeFinderInput
from services.scheme_matching_service import evaluate_scheme_eligibility
from services.providers.schemes_provider import list_schemes, get_scheme_by_id


class TestSchemeMatchingEngine(unittest.TestCase):
    def setUp(self):
        # Create a mock Central PM-KISAN scheme
        self.pm_kisan = Scheme(
            id=1,
            scheme_id="pm-kisan",
            name="PM-Kisan Samman Nidhi",
            short_name="PM-KISAN",
            jurisdiction="Central",
            state="All",
            department="MoA&FW",
            category="income_support",
            overview="Direct income support of Rs 6,000/year to landholding farmer families.",
            benefits_summary="Rs 6,000 per year via DBT",
            benefits_details="Three installments of Rs 2,000 each directly transferred to Aadhaar linked bank account.",
            eligibility_criteria_text="Landholding farmer family with cultivable land in official land records.",
            eligibility_rules_json=json.dumps({
                "min_land_acres": 0.01,
                "requires_land_ownership": True,
                "categories": ["general", "obc", "sc", "st", "women", "any"]
            }),
            required_documents_json=json.dumps([
                {"name": "Aadhaar Card", "code": "aadhaar"},
                {"name": "Land Record", "code": "land_record"}
            ]),
            application_steps_json=json.dumps([
                {"step": 1, "title": "Portal registration", "description": "Apply on pmkisan.gov.in"}
            ]),
            source_url="https://pmkisan.gov.in",
            application_url="https://pmkisan.gov.in/RegistrationFormNew.aspx",
            application_window_status="open_all_year",
            deadline_text="Open All Year",
            helpline_details=json.dumps({"toll_free": "155261"}),
            faqs_json=json.dumps([]),
            verification_status="verified_official",
            data_source="pmkisan.gov.in official portal",
            is_active=True
        )

        # Create a mock State-Specific Scheme (UP Free Borewell - Small & Marginal Only)
        self.up_borewell = Scheme(
            id=2,
            scheme_id="up-borewell",
            name="UP Free Borewell Scheme",
            short_name="UP Free Boring",
            jurisdiction="State",
            state="Uttar Pradesh",
            department="Minor Irrigation Department UP",
            category="irrigation",
            overview="Free shallow boring for small and marginal farmers.",
            benefits_summary="100% free boring + pump grant",
            eligibility_criteria_text="Small & Marginal farmers with holding under 5 acres residing in UP.",
            eligibility_rules_json=json.dumps({
                "min_land_acres": 0.2,
                "max_land_acres": 5.0,
                "requires_land_ownership": True,
                "states": ["Uttar Pradesh"],
                "categories": ["general", "obc", "sc", "st"]
            }),
            required_documents_json=json.dumps([
                {"name": "Aadhaar Card", "code": "aadhaar"},
                {"name": "UP Khatauni", "code": "land_record"}
            ]),
            application_steps_json=json.dumps([]),
            source_url="http://upagripardarshi.gov.in",
            application_url="http://upagripardarshi.gov.in",
            application_window_status="open",
            deadline_text="Annual allocations",
            helpline_details="{}",
            faqs_json="[]",
            verification_status="verified_official",
            data_source="UP Minor Irrigation Department",
            is_active=True
        )

    def test_pm_kisan_matches_landowning_farmer(self):
        """Owner cultivator in any state with landholding should be a Potential Match for PM-KISAN."""
        finder_input = SchemeFinderInput(
            state="Bihar",
            district="Patna",
            landholding_acres=2.5,
            tenure_type="owner",
            farmer_category="general"
        )
        result = evaluate_scheme_eligibility(self.pm_kisan, finder_input)
        self.assertEqual(result.match_status, "Potential Match")
        self.assertGreaterEqual(result.score, 90)
        self.assertTrue(any("Central scheme applicable" in r for r in result.reasons))

    def test_pm_kisan_rejects_tenant_farmer(self):
        """Tenant farmer without legal landownership should be marked as Appears Not to Match for PM-KISAN."""
        finder_input = SchemeFinderInput(
            state="Punjab",
            landholding_acres=3.0,
            tenure_type="tenant",
            farmer_category="general"
        )
        result = evaluate_scheme_eligibility(self.pm_kisan, finder_input)
        self.assertEqual(result.match_status, "Appears Not to Match Published Criteria")
        self.assertTrue(any("legal land ownership" in r for r in result.reasons))

    def test_state_specific_scheme_jurisdiction_check(self):
        """UP Free Borewell scheme must reject a farmer located in Bihar or Karnataka."""
        bihar_farmer = SchemeFinderInput(
            state="Bihar",
            landholding_acres=2.0,
            tenure_type="owner"
        )
        result = evaluate_scheme_eligibility(self.up_borewell, bihar_farmer)
        self.assertEqual(result.match_status, "Appears Not to Match Published Criteria")
        self.assertTrue(any("jurisdiction mismatch" in r for r in result.reasons))

    def test_state_specific_scheme_acreage_ceiling(self):
        """UP farmer with 10 acres should be rejected because UP Free Borewell has a 5-acre ceiling."""
        large_farmer = SchemeFinderInput(
            state="Uttar Pradesh",
            landholding_acres=10.0,
            tenure_type="owner"
        )
        result = evaluate_scheme_eligibility(self.up_borewell, large_farmer)
        self.assertEqual(result.match_status, "Appears Not to Match Published Criteria")
        self.assertTrue(any("5.0 acres" in r or "5 acres" in r for r in result.reasons))

    def test_up_borewell_qualifies_small_up_farmer(self):
        """UP farmer with 2 acres must be a Potential Match."""
        small_up_farmer = SchemeFinderInput(
            state="Uttar Pradesh",
            landholding_acres=2.0,
            tenure_type="owner",
            farmer_category="obc"
        )
        result = evaluate_scheme_eligibility(self.up_borewell, small_up_farmer)
        self.assertEqual(result.match_status, "Potential Match")
        self.assertEqual(result.score, 95)

    def test_schemes_provider_returns_grounded_data(self):
        """Schemes provider must return verified schemes with official URLs and no hallucinated links."""
        schemes = list_schemes(state="All")
        self.assertGreater(len(schemes), 0)
        first = schemes[0]
        self.assertTrue(first["url"].startswith("http"))
        self.assertIn("benefits", first)
        self.assertIn("eligibility", first)


if __name__ == "__main__":
    unittest.main()
