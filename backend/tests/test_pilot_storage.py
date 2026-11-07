import os
import sys
import tempfile
import unittest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from services.pilot_storage_service import PilotStorageService, StorageError


class TestPilotStorageService(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.storage = PilotStorageService(backend="local", base_path=self.temp_dir.name)

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_save_and_retrieve_image(self):
        """Image bytes are stored under UUID filename and retrieved intact."""
        dummy_data = b"\xFF\xD8\xFF\xE0" + b"TEST_IMAGE_PAYLOAD" * 50
        res = self.storage.save_image(dummy_data, "sample_leaf.jpg")

        self.assertIn("stored_filename", res)
        self.assertTrue(res["stored_filename"].endswith(".jpg"))
        self.assertIn("/api/disease/images/", res["relative_url"])
        self.assertEqual(res["file_size"], len(dummy_data))

        # Retrieve
        retrieved = self.storage.get_image(res["stored_filename"])
        self.assertIsNotNone(retrieved)
        path_or_bytes, media_type = retrieved
        self.assertEqual(media_type, "image/jpeg")

        with open(path_or_bytes, "rb") as f:
            content = f.read()
        self.assertEqual(content, dummy_data)

    def test_missing_image_returns_none(self):
        """Retrieving non-existent image returns None without crashing."""
        retrieved = self.storage.get_image("non_existent_uuid.jpg")
        self.assertIsNone(retrieved)

    def test_delete_image(self):
        """Deleting stored image removes file and updates existence check."""
        dummy_data = b"\x89PNG\r\n\x1a\n" + b"PNG_TEST_PAYLOAD"
        res = self.storage.save_image(dummy_data, "leaf.png")
        filename = res["stored_filename"]

        self.assertTrue(self.storage.image_exists(filename))
        deleted = self.storage.delete_image(filename)
        self.assertTrue(deleted)
        self.assertFalse(self.storage.image_exists(filename))
        self.assertIsNone(self.storage.get_image(filename))

    def test_path_traversal_rejected(self):
        """Directory traversal attempts are rejected with StorageError."""
        malicious_filenames = [
            "../../etc/passwd",
            "..\\windows\\win.ini",
            "../secret.txt",
            "/etc/shadow",
            "file name with spaces?.jpg",
        ]
        for bad_name in malicious_filenames:
            with self.assertRaises(StorageError):
                self.storage.sanitize_filename(bad_name)

    def test_zero_byte_upload_rejected(self):
        """Zero-byte files are rejected with StorageError."""
        with self.assertRaises(StorageError):
            self.storage.save_image(b"", "empty.jpg")

    def test_s3_fallback_when_credentials_missing(self):
        """S3 backend falls back safely to persistent filesystem when credentials are unset."""
        s3_storage = PilotStorageService(
            backend="s3",
            base_path=self.temp_dir.name,
            bucket_name=None,
            access_key_id=None,
            secret_access_key=None,
        )
        self.assertFalse(s3_storage.s3_available)
        # Verify it still functions via filesystem fallback
        res = s3_storage.save_image(b"FALLBACK_DATA", "fallback.jpg")
        self.assertEqual(res["storage_backend"], "filesystem")
        self.assertTrue(os.path.exists(res["storage_key"]))


if __name__ == "__main__":
    unittest.main()
