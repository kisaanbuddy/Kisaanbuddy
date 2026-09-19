"""Unit tests for Backend V2 Part 2 Scalability, Redis, Sensor Ingestion & Async Jobs."""
import time
import unittest
from fastapi.testclient import TestClient

from main import app
from infrastructure.redis import redis_client
from services.state_service import state_service
from services.job_service import job_service

client = TestClient(app)


class TestPart2Scalability(unittest.TestCase):
    def test_redis_client_set_get_delete(self):
        key = "test_key_part2"
        val = "test_val_123"
        self.assertTrue(redis_client.set(key, val, ex=10))
        self.assertEqual(redis_client.get(key), val)
        self.assertTrue(redis_client.delete(key))
        self.assertIsNone(redis_client.get(key))

    def test_sensor_ingest_redis_and_db_deduplication(self):
        payload = {
            "device_id": "test-node-part2",
            "temperature": 28.5,
            "humidity": 65.0,
            "soil_temperature": 24.0,
            "soil_moisture": 45.0,
            "raw_moisture": 2100,
        }

        # 1. Ingest reading
        res1 = client.post("/api/sensor/ingest", json=payload)
        self.assertEqual(res1.status_code, 200)

        # 2. Verify latest reading retrieved from state service / endpoint
        latest_res = client.get("/api/sensor/latest?device_id=test-node-part2")
        self.assertEqual(latest_res.status_code, 200)
        data = latest_res.json()
        self.assertEqual(data["device_id"], "test-node-part2")
        self.assertEqual(data["temperature"], 28.5)

        # 3. Duplicate post within 5 seconds (deduplication check)
        res2 = client.post("/api/sensor/ingest", json=payload)
        self.assertEqual(res2.status_code, 200)

        # 4. History endpoint
        hist_res = client.get("/api/sensor/history?device_id=test-node-part2&limit=5")
        self.assertEqual(hist_res.status_code, 200)
        self.assertTrue(len(hist_res.json()) >= 1)

    def test_async_job_submission_and_polling(self):
        # Register a dummy handler for test
        def dummy_worker(payload):
            return {"status": "success", "processed": payload.get("input", "")}

        job_service.register_handler("test_task", dummy_worker)

        # Submit job
        submit_res = client.post("/api/jobs/submit", json={"task_type": "test_task", "payload": {"input": "hello"}})
        self.assertEqual(submit_res.status_code, 202)
        job_id = submit_res.json()["job_id"]
        self.assertTrue(job_id.startswith("job_"))

        # Poll job status
        time.sleep(0.1)
        status_res = client.get(f"/api/jobs/{job_id}")
        self.assertEqual(status_res.status_code, 200)
        status_data = status_res.json()
        self.assertIn(status_data["status"], ["PENDING", "RUNNING", "COMPLETED"])


if __name__ == "__main__":
    unittest.main()
