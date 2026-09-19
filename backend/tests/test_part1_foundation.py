"""Unit tests for Backend V2 Part 1 Foundation: Storage, Database & Health Probes."""
import os
import unittest
from fastapi.testclient import TestClient

from main import app
from services.storage import storage_service, LOCAL_STORAGE_DIR

client = TestClient(app)


class TestPart1Foundation(unittest.TestCase):
    def test_liveness_probe(self):
        response = client.get("/health/liveness")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["service"], "krishiai")

    def test_readiness_probe(self):
        response = client.get("/health/readiness")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "ok")
        self.assertIn("database", data["checks"])
        self.assertEqual(data["checks"]["database"]["status"], "healthy")
        self.assertIn("storage", data["checks"])
        self.assertEqual(data["checks"]["storage"]["status"], "healthy")

    def test_storage_service_local_save_get_delete(self):
        test_filename = "test_crop_leaf.png"
        test_data = b"\x89PNG\r\n\x1a\nfake_image_bytes_for_testing"
        content_type = "image/png"

        storage_path, public_url = storage_service.save_file(test_filename, content_type, test_data)
        self.assertTrue(storage_path.startswith("local://"))
        self.assertTrue(public_url.startswith("/api/media/file/"))

        # Retrieve file via storage_service
        retrieved_data = storage_service.get_file(storage_path)
        self.assertEqual(retrieved_data, test_data)

        # Retrieve file via HTTP endpoint
        filename_only = storage_path.replace("local://", "")
        http_response = client.get(f"/api/media/file/{filename_only}")
        self.assertEqual(http_response.status_code, 200)
        self.assertEqual(http_response.content, test_data)

        # Delete file
        delete_result = storage_service.delete_file(storage_path)
        self.assertTrue(delete_result)
        self.assertIsNone(storage_service.get_file(storage_path))


if __name__ == "__main__":
    unittest.main()
