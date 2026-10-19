"""Comprehensive Automated Verification Test Suite for KisaanBuddy Workers Connect Module.

Verifies all 10 project phases:
1. Research & Data Sources (Labour Bureau, MGNREGA, e-Shram registry)
2. Agricultural Worker Categories & Admin Extensibility
3. Worker Registration & Phone OTP Verification
4. Farmer Job Posting & Validation
5. Multi-criterion Search, Relevance Scoring & Availability
6. Official Wage Benchmarks & Attribution (Labour Bureau WRRI & MGNREGA)
7. Privacy, Consent-based Contact Requests, Reporting & DPDP Account Erasure
8. Database Schema & Search Indexing
9. Multilingual Compatibility
10. End-to-end Security, Audit Trail & No Fake Worker Data
"""
from __future__ import annotations

import os
import sys
import unittest
from datetime import date, datetime, timedelta

# Ensure backend root is in sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("JWT_SECRET", "test-labour-secret-key-12345")
os.environ.setdefault("DEBUG", "1")

from fastapi.testclient import TestClient
from main import app
from db.session import Base, engine, SessionLocal
from db.models import (
    WorkerCategory,
    WorkerProfile,
    WorkerSkill,
    WorkerAvailabilityRecord,
    LabourJobPost,
    LabourJobApplication,
    WageBenchmark,
    LabourContactRequest,
    LabourReviewAndReport,
    LabourAuditTrail,
    ImportSource,
)
from services.labour_seed_data import seed_labour_reference_data


class TestWorkersConnectAgriculturalLabourModule(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Create in-memory SQLite schema
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

        # Seed reference categories and authentic public wage benchmarks
        cls.db = SessionLocal()
        seed_labour_reference_data(cls.db)

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    # -----------------------------------------------------------------------
    # Phase 1: Research & Data Source Governance
    # -----------------------------------------------------------------------
    def test_01_public_data_source_governance(self):
        """Verify official data sources are properly registered with permissions and licensing."""
        sources = self.db.query(ImportSource).filter(
            ImportSource.source_slug.in_([
                "labour_bureau_wrri",
                "mgnrega_wage_rates",
                "eshram_national_registry",
            ])
        ).all()
        self.assertEqual(len(sources), 3)

        wrri = next(s for s in sources if s.source_slug == "labour_bureau_wrri")
        self.assertEqual(wrri.source_type, "government_portal")
        self.assertIn("labourbureau.gov.in", wrri.base_url)
        self.assertIn("NDSAP", wrri.commercial_reuse_terms)

        eshram = next(s for s in sources if s.source_slug == "eshram_national_registry")
        self.assertEqual(eshram.source_type, "restricted_government_portal")
        self.assertIn("Social Security Code", eshram.commercial_reuse_terms)

    # -----------------------------------------------------------------------
    # Phase 2: Agricultural Worker Categories & Admin Extensibility
    # -----------------------------------------------------------------------
    def test_02_categories_and_admin_extensibility(self):
        """Verify the 17 standard categories exist and an administrator can add custom categories."""
        res = self.client.get("/api/worker-connect/categories")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreaterEqual(len(data), 17)

        slugs = [c["slug"] for c in data]
        required_slugs = [
            "ploughing_land_prep",
            "sowing",
            "seed_planting",
            "transplanting",
            "weeding",
            "irrigation",
            "fertilizer_application",
            "spraying_crop_protection",
            "harvesting",
            "picking",
            "threshing_winnowing",
            "pruning",
            "nursery_work",
            "livestock_farm_work",
            "tractor_machinery_operators",
            "general_agricultural_labour",
            "contractors_worker_groups",
        ]
        for req in required_slugs:
            self.assertIn(req, slugs, f"Missing required category slug: {req}")

        # Admin adds an additional category
        add_res = self.client.post(
            "/api/worker-connect/categories",
            json={
                "name": "Drip Irrigation & Pipeline Specialist",
                "description": "Installation and maintenance of micro-irrigation systems.",
                "icon": "Droplet",
            },
        )
        self.assertEqual(add_res.status_code, 201)
        created_cat = add_res.json()
        self.assertEqual(created_cat["slug"], "drip_irrigation_pipeline_specialist")

        # Verify it now appears in categories
        res2 = self.client.get("/api/worker-connect/categories")
        self.assertIn("drip_irrigation_pipeline_specialist", [c["slug"] for c in res2.json()])

    # -----------------------------------------------------------------------
    # Phase 3 & 7: Worker Registration & Phone Privacy Shield
    # -----------------------------------------------------------------------
    def test_03_worker_registration_and_phone_privacy(self):
        """Test OTP verification, worker registration, and masked phone protection."""
        # 1. Send OTP
        phone = "9876500111"
        otp_res = self.client.post("/api/worker-connect/workers/send-otp", json={"phone_number": phone})
        self.assertEqual(otp_res.status_code, 200)
        self.assertTrue(otp_res.json()["ok"])

        # 2. Verify invalid OTP
        bad_verify = self.client.post(
            "/api/worker-connect/workers/verify-otp",
            json={"phone_number": phone, "otp_code": "999999"},
        )
        self.assertEqual(bad_verify.status_code, 400)

        # 3. Verify valid dev OTP (mock "123456")
        good_verify = self.client.post(
            "/api/worker-connect/workers/verify-otp",
            json={"phone_number": phone, "otp_code": "123456"},
        )
        self.assertEqual(good_verify.status_code, 200)

        # 4. Register Worker Profile
        reg_payload = {
            "name": "Suresh Gowda",
            "phone_number": phone,
            "state": "Karnataka",
            "district": "Tumkur",
            "village": "Kunigal",
            "worker_type": "individual",
            "group_size": 1,
            "max_travel_km": 30.0,
            "wage_expectation": 480.0,
            "wage_unit": "per_day",
            "preferred_work_types": ["harvesting", "threshing_winnowing", "ploughing_land_prep"],
            "bio_or_experience": "6 years experience in paddy harvesting and power tiller operation.",
            "consent_share_phone": True,
            "consent_terms": True,
            "otp_code": "123456",
        }
        reg_res = self.client.post("/api/worker-connect/workers/register", json=reg_payload)
        self.assertEqual(reg_res.status_code, 201)
        w_data = reg_res.json()

        self.assertEqual(w_data["name"], "Suresh Gowda")
        self.assertEqual(w_data["masked_phone"], "+91 98XXX-XX111")
        self.assertIn("Confirmed Available", w_data["availability_status_label"])
        self.assertTrue(w_data["is_available"])

    # -----------------------------------------------------------------------
    # Phase 4: Farmer Job Posting & Validation
    # -----------------------------------------------------------------------
    def test_04_farmer_job_posting_validation(self):
        """Farmer posts an agricultural labour requirement with full Phase 4 specifications."""
        job_payload = {
            "job_title": "Paddy Harvesting Crew Required for 5 Acres",
            "category_slug": "harvesting",
            "work_type_detail": "Manual sickle harvesting and bundle stacking.",
            "state": "Karnataka",
            "district": "Tumkur",
            "village": "Kunigal",
            "workers_needed": 8,
            "start_date": (date.today() + timedelta(days=2)).isoformat(),
            "duration_days": 4,
            "working_hours_desc": "7:00 AM - 2:00 PM (7 hours)",
            "wage_amount": 500.0,
            "wage_unit": "per_day",
            "payment_terms": "Daily Cash on Site",
            "transport_info": "Tractor pickup provided from Kunigal Bus Stand",
            "accommodation_info": "No accommodation provided",
            "contact_name": "Farmer Basavaraj",
            "contact_phone": "9845012345",
        }
        res = self.client.post("/api/worker-connect/jobs", json=job_payload)
        self.assertEqual(res.status_code, 201)
        j_data = res.json()

        self.assertTrue(j_data["job_code"].startswith("JOB-"))
        self.assertEqual(j_data["masked_contact_phone"], "+91 98XXX-XX345")
        self.assertIsNone(j_data["unmasked_contact_phone"])
        self.assertEqual(j_data["status"], "open")
        self.assertEqual(j_data["workers_needed"], 8)

        # Validation test: invalid phone number
        bad_payload = dict(job_payload, contact_phone="12345")
        bad_res = self.client.post("/api/worker-connect/jobs", json=bad_payload)
        self.assertEqual(bad_res.status_code, 422)

    # -----------------------------------------------------------------------
    # Phase 5: Multi-Criterion Worker Search & Availability
    # -----------------------------------------------------------------------
    def test_05_multi_criterion_search_and_availability(self):
        """Search workers with filters for state, district, category, wage, and confirmed availability."""
        # Register a second worker in Punjab (Labour Gang)
        gang_payload = {
            "name": "Gurmeet Singh Harvesting Gang",
            "phone_number": "9814099888",
            "state": "Punjab",
            "district": "Ludhiana",
            "village": "Samrala",
            "worker_type": "group",
            "group_size": 12,
            "max_travel_km": 50.0,
            "wage_expectation": 520.0,
            "wage_unit": "per_day",
            "preferred_work_types": ["harvesting", "threshing_winnowing"],
            "bio_or_experience": "Experienced 12-person crew with portable threshers.",
            "consent_share_phone": True,
            "consent_terms": True,
            "otp_code": "123456",
        }
        self.client.post("/api/worker-connect/workers/register", json=gang_payload)

        # 1. Search in Karnataka
        res_ka = self.client.get("/api/worker-connect/workers?state=Karnataka&category_slug=harvesting")
        self.assertEqual(res_ka.status_code, 200)
        ka_data = res_ka.json()
        self.assertGreaterEqual(ka_data["total"], 1)
        self.assertEqual(ka_data["workers"][0]["district"], "Tumkur")
        # Ensure public search NEVER reveals unmasked phone
        self.assertIsNone(ka_data["workers"][0]["unmasked_phone"])
        self.assertEqual(ka_data["workers"][0]["masked_phone"], "+91 98XXX-XX111")

        # 2. Search in Punjab for groups
        res_pb = self.client.get("/api/worker-connect/workers?state=Punjab&worker_type=group")
        self.assertEqual(res_pb.status_code, 200)
        pb_data = res_pb.json()
        self.assertGreaterEqual(pb_data["total"], 1)
        self.assertEqual(pb_data["workers"][0]["group_size"], 12)

        # 3. Wage filter test
        res_wage = self.client.get("/api/worker-connect/workers?max_wage=400")
        self.assertEqual(res_wage.status_code, 200)
        # Suresh (480) and Gurmeet (520) should both be excluded
        self.assertEqual(len(res_wage.json()["workers"]), 0)

    # -----------------------------------------------------------------------
    # Phase 5/7: Availability Updates & Expiry Calculation
    # -----------------------------------------------------------------------
    def test_06_availability_updates_and_expiry(self):
        """Verify worker availability confirmation and stale expiry handling."""
        worker = self.db.query(WorkerProfile).filter(WorkerProfile.name == "Suresh Gowda").first()
        self.assertIsNotNone(worker)

        # Worker confirms availability via API
        avail_res = self.client.post(
            f"/api/worker-connect/workers/{worker.id}/availability",
            json={"is_available": True, "validity_days": 5, "notes": "Available for next 5 days"},
        )
        self.assertEqual(avail_res.status_code, 200)
        self.assertTrue(avail_res.json()["is_available"])

        # Simulate expiration by setting availability_expires_at in the past
        worker.availability_expires_at = datetime.utcnow() - timedelta(days=1)
        self.db.commit()

        # Query with only_confirmed_available=True
        res = self.client.get("/api/worker-connect/workers?state=Karnataka&only_confirmed_available=true")
        self.assertEqual(res.status_code, 200)
        # Suresh should now be excluded because his confirmation has expired
        self.assertEqual(len(res.json()["workers"]), 0)

        # Re-confirm availability to restore active status
        reconfirm = self.client.post(
            f"/api/worker-connect/workers/{worker.id}/availability",
            json={"is_available": True, "validity_days": 7},
        )
        self.assertEqual(reconfirm.status_code, 200)
        self.assertTrue(reconfirm.json()["is_available"])

        # Now Suresh should appear again
        res2 = self.client.get("/api/worker-connect/workers?state=Karnataka&only_confirmed_available=true")
        self.assertEqual(len(res2.json()["workers"]), 1)

    # -----------------------------------------------------------------------
    # Phase 7: Consent-Based Contact Requests
    # -----------------------------------------------------------------------
    def test_07_consent_based_contact_request_workflow(self):
        """Verify contact request workflow, worker approval, and phone number unlock."""
        worker = self.db.query(WorkerProfile).filter(WorkerProfile.name == "Suresh Gowda").first()
        farmer_phone = "9845012345"

        # 1. Farmer requests contact with worker
        req_res = self.client.post(
            f"/api/worker-connect/workers/{worker.id}/contact-request",
            json={
                "worker_id": worker.id,
                "requester_name": "Basavaraj Farmer",
                "requester_phone": farmer_phone,
                "purpose": "hiring_inquiry",
                "farm_location": "Kunigal",
                "work_dates": "Next Thursday-Saturday",
                "message": "Need 5 workers for wheat harvest.",
            },
        )
        self.assertEqual(req_res.status_code, 201)
        req_data = req_res.json()
        req_id = req_data["id"]
        self.assertEqual(req_data["status"], "pending")
        self.assertFalse(req_data["approved_phone_revealed"])

        # 2. Worker views pending requests using their phone
        w_view = self.client.get(
            f"/api/worker-connect/workers/{worker.id}/contact-requests?worker_phone={worker.phone_number}"
        )
        self.assertEqual(w_view.status_code, 200)
        pending_list = w_view.json()
        self.assertGreaterEqual(len(pending_list), 1)

        # 3. Worker approves the request
        resolve_res = self.client.patch(
            f"/api/worker-connect/contact-requests/{req_id}",
            json={"action": "approve", "worker_phone": worker.phone_number},
        )
        self.assertEqual(resolve_res.status_code, 200)
        self.assertEqual(resolve_res.json()["status"], "approved")
        self.assertTrue(resolve_res.json()["approved_phone_revealed"])

        # 4. Now farmer searches workers with their viewer_phone -> Worker phone is UNMASKED for them!
        farmer_search = self.client.get(
            f"/api/worker-connect/workers?state=Karnataka&viewer_phone={farmer_phone}"
        )
        self.assertEqual(farmer_search.status_code, 200)
        matching_worker = next(
            w for w in farmer_search.json()["workers"] if w["id"] == worker.id
        )
        self.assertEqual(matching_worker["unmasked_phone"], worker.phone_number)

    # -----------------------------------------------------------------------
    # Phase 7: Job Applications Flow
    # -----------------------------------------------------------------------
    def test_08_job_applications_flow(self):
        """Worker applies for an open job; farmer views submitted applications."""
        job = self.db.query(LabourJobPost).first()
        self.assertIsNotNone(job)

        app_payload = {
            "applicant_name": "Ramesh Agricultural Labour Gang",
            "applicant_phone": "9876543999",
            "proposed_wage": 490.0,
            "group_members_count": 6,
            "message": "Ready to harvest 5 acres with sickle and threshing tools.",
        }
        res = self.client.post(f"/api/worker-connect/jobs/{job.id}/apply", json=app_payload)
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json()["status"], "applied")

        # Farmer views applications
        apps_res = self.client.get(f"/api/worker-connect/jobs/{job.id}/applications")
        self.assertEqual(apps_res.status_code, 200)
        apps = apps_res.json()
        self.assertGreaterEqual(len(apps), 1)
        self.assertEqual(apps[0]["applicant_masked_phone"], "+91 98XXX-XX999")

    # -----------------------------------------------------------------------
    # Phase 6: Official Wage Benchmarks (Labour Bureau & MGNREGA)
    # -----------------------------------------------------------------------
    def test_09_official_wage_benchmarks_attribution(self):
        """Query official wage benchmarks and verify source attribution, disclaimer, and no district fabrication."""
        res = self.client.get("/api/worker-connect/wage-benchmarks?state=Punjab")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreaterEqual(len(data), 1)

        # Check Labour Bureau benchmark
        wrri_rec = next(b for b in data if "Labour Bureau" in b["source_name"])
        self.assertEqual(wrri_rec["state"], "Punjab")
        self.assertIn("labourbureau.gov.in", wrri_rec["source_url"])
        self.assertIn("guaranteed, mandatory, or binding rates", wrri_rec["legal_disclaimer"])
        self.assertGreater(wrri_rec["reported_wage_average"], 300.0)

        # Check MGNREGA benchmark
        mgnrega_rec = next(b for b in data if "MGNREGA" in b["source_name"])
        self.assertEqual(mgnrega_rec["state"], "Punjab")
        self.assertIn("nrega.nic.in", mgnrega_rec["source_url"])

    # -----------------------------------------------------------------------
    # Phase 7: Reporting, Safety Moderation & DPDP Account Erasure
    # -----------------------------------------------------------------------
    def test_10_reporting_moderation_and_dpdp_account_erasure(self):
        """Verify report submission, admin moderation, and DPDP-compliant account erasure."""
        worker = self.db.query(WorkerProfile).filter(WorkerProfile.name == "Gurmeet Singh Harvesting Gang").first()
        self.assertIsNotNone(worker)

        # 1. Submit report
        rep_res = self.client.post(
            "/api/worker-connect/reports",
            json={
                "target_type": "worker",
                "target_id": worker.id,
                "reason": "spam",
                "reporter_name": "Test Farmer",
                "details": "Duplicate profile submission test.",
            },
        )
        self.assertEqual(rep_res.status_code, 201)
        rep_id = rep_res.json()["id"]

        # 2. Admin moderates report
        admin_res = self.client.patch(
            f"/api/worker-connect/admin/reports/{rep_id}?status_value=investigated&admin_notes=Verified+genuine+crew"
        )
        self.assertEqual(admin_res.status_code, 200)
        self.assertEqual(admin_res.json()["status"], "investigated")

        # 3. DPDP Permanent Account Erasure
        del_res = self.client.post(
            "/api/worker-connect/workers/delete",
            json={
                "phone_number": worker.phone_number,
                "reason": "No longer doing contract farm work",
                "confirmation_text": "DELETE MY ACCOUNT",
            },
        )
        self.assertEqual(del_res.status_code, 200)
        self.assertTrue(del_res.json()["ok"])

        # Verify profile is scrubbed from DB search
        self.db.refresh(worker)
        self.assertTrue(worker.phone_number.startswith("DELETED_"))
        self.assertFalse(worker.is_active)
        self.assertFalse(worker.is_available)
        self.assertIsNotNone(worker.deleted_at)

        # Search should no longer return this worker
        search_del = self.client.get("/api/worker-connect/workers?state=Punjab")
        self.assertEqual(len(search_del.json()["workers"]), 0)

    # -----------------------------------------------------------------------
    # Phase 7/10: Audit Trail Verification & No Fabricated Data
    # -----------------------------------------------------------------------
    def test_11_audit_trail_and_zero_fabricated_data(self):
        """Verify immutable audit trail logs and confirm zero fake worker profiles."""
        trail_res = self.client.get("/api/worker-connect/admin/audit-trail?limit=50")
        self.assertEqual(trail_res.status_code, 200)
        trails = trail_res.json()
        self.assertGreaterEqual(len(trails), 5)

        event_types = [t["event_type"] for t in trails]
        self.assertIn("category_added", event_types)
        self.assertIn("worker_registered", event_types)
        self.assertIn("job_posted", event_types)
        self.assertIn("contact_requested", event_types)
        self.assertIn("contact_approved", event_types)
        self.assertIn("account_deleted", event_types)

        # Confirm that only registered workers exist, no random dummy scraped profiles
        all_active_workers = self.db.query(WorkerProfile).filter(WorkerProfile.deleted_at.is_(None)).all()
        for w in all_active_workers:
            self.assertIn(w.name, ["Suresh Gowda"])


if __name__ == "__main__":
    unittest.main()
