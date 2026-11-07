"""
Configurable Image Storage Service for Crop Doctor Field Pilot.
Supports:
1. Local filesystem (development)
2. Persistent mounted volume (staging/production container)
3. S3-compatible object storage (AWS S3, Cloudflare R2, MinIO, Supabase S3)
"""

import os
import re
import uuid
import logging
from pathlib import Path
from typing import Dict, Any, Optional, Tuple, Union

log = logging.getLogger("krishiai.storage")

# Default local directories
BASE_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_LOCAL_DIR = os.path.join(BASE_BACKEND_DIR, "data", "field_pilot_images")


class StorageError(Exception):
    """Custom exception raised on storage operation failures."""
    pass


class PilotStorageService:
    def __init__(
        self,
        backend: Optional[str] = None,
        base_path: Optional[str] = None,
        bucket_name: Optional[str] = None,
        endpoint_url: Optional[str] = None,
        region_name: Optional[str] = None,
        access_key_id: Optional[str] = None,
        secret_access_key: Optional[str] = None,
    ):
        self.backend = (backend or os.getenv("STORAGE_BACKEND") or "local").lower()
        
        # Resolve target filesystem path for local/mounted
        env_path = os.getenv("PILOT_STORAGE_PATH") or os.getenv("PILOT_UPLOAD_DIR")
        target_path = base_path or env_path or DEFAULT_LOCAL_DIR
        
        if not os.path.isabs(target_path):
            self.base_dir = os.path.normpath(os.path.join(BASE_BACKEND_DIR, target_path))
        else:
            self.base_dir = os.path.normpath(target_path)
            
        os.makedirs(self.base_dir, exist_ok=True)

        # S3 configuration
        self.bucket_name = bucket_name or os.getenv("S3_BUCKET_NAME")
        self.endpoint_url = endpoint_url or os.getenv("S3_ENDPOINT_URL")
        self.region_name = region_name or os.getenv("S3_REGION_NAME", "ap-south-1")
        self.access_key_id = access_key_id or os.getenv("AWS_ACCESS_KEY_ID")
        self.secret_access_key = secret_access_key or os.getenv("AWS_SECRET_ACCESS_KEY")
        
        self.s3_client = None
        self.s3_available = False

        if self.backend in ["s3", "supabase"]:
            self._init_s3_client()

    def _init_s3_client(self) -> None:
        """Initializes S3 client if credentials exist; otherwise falls back to persistent filesystem."""
        if not (self.bucket_name and self.access_key_id and self.secret_access_key):
            log.warning(
                "S3/Supabase storage configured as '%s' but credentials (S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) "
                "are missing. Falling back to persistent filesystem storage at %s.",
                self.backend,
                self.base_dir,
            )
            self.s3_available = False
            return

        try:
            import boto3
            from botocore.config import Config

            client_kwargs = {
                "service_name": "s3",
                "region_name": self.region_name,
                "aws_access_key_id": self.access_key_id,
                "aws_secret_access_key": self.secret_access_key,
                "config": Config(signature_version="s3v4", s3={"addressing_style": "virtual"}),
            }
            if self.endpoint_url:
                client_kwargs["endpoint_url"] = self.endpoint_url

            self.s3_client = boto3.client(**client_kwargs)
            self.s3_available = True
            log.info("Initialized S3 storage client for bucket: %s", self.bucket_name)
        except ImportError:
            log.warning("boto3 library not installed. Falling back to persistent filesystem storage.")
            self.s3_available = False
        except Exception as e:
            log.error("Failed to initialize S3 storage client: %s. Falling back to filesystem storage.", e)
            self.s3_available = False

    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """Sanitizes filename and rejects directory traversal sequences."""
        if not filename:
            raise StorageError("Filename cannot be empty.")
        if ".." in filename or "/" in filename or "\\" in filename:
            raise StorageError("Invalid filename: directory traversal sequences are forbidden.")
        basename = os.path.basename(filename)
        # Allow only safe characters (alphanumeric, hyphens, underscores, dots)
        if not re.match(r"^[a-zA-Z0-9_\-\.]+$", basename):
            raise StorageError("Invalid characters in filename.")
        return basename

    def save_image(self, file_bytes: bytes, original_filename: str = "") -> Dict[str, Any]:
        """
        Saves image bytes under a secure random UUIDv4 filename.
        Returns metadata including stored_filename, storage_key, and backend.
        """
        if not file_bytes:
            raise StorageError("Cannot store zero-byte file.")

        ext = os.path.splitext(original_filename or "")[1].lower()
        if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
            ext = ".jpg"

        file_uuid = str(uuid.uuid4())
        stored_filename = f"{file_uuid}{ext}"
        storage_key = f"pilot_images/{stored_filename}"

        # 1. Cloud S3 Storage if operational
        if self.backend in ["s3", "supabase"] and self.s3_available and self.s3_client:
            try:
                content_type = "image/jpeg" if ext in [".jpg", ".jpeg"] else f"image/{ext.lstrip('.')}"
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=storage_key,
                    Body=file_bytes,
                    ContentType=content_type,
                    Metadata={"original_filename": original_filename or "leaf.jpg"},
                )
                return {
                    "stored_filename": stored_filename,
                    "storage_key": storage_key,
                    "storage_backend": "s3",
                    "file_size": len(file_bytes),
                    "relative_url": f"/api/disease/images/{stored_filename}",
                }
            except Exception as e:
                log.error("S3 upload failed: %s. Storing to local fallback.", e)

        # 2. Filesystem Storage (Local or Mounted Volume)
        try:
            target_path = os.path.join(self.base_dir, stored_filename)
            with open(target_path, "wb") as f_out:
                f_out.write(file_bytes)

            return {
                "stored_filename": stored_filename,
                "storage_key": target_path,
                "storage_backend": "filesystem",
                "file_size": len(file_bytes),
                "relative_url": f"/api/disease/images/{stored_filename}",
            }
        except OSError as e:
            raise StorageError(f"Failed to write image to storage: {str(e)}") from e

    def get_image(self, filename: str) -> Optional[Tuple[Union[str, bytes], str]]:
        """
        Retrieves image by safe filename.
        Returns tuple of (file_path_or_bytes, media_type) or None if not found.
        """
        safe_name = self.sanitize_filename(filename)
        ext = os.path.splitext(safe_name)[1].lower()
        media_types = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp",
        }
        media_type = media_types.get(ext, "image/jpeg")

        # Check local/mounted filesystem first
        local_path = os.path.join(self.base_dir, safe_name)
        if os.path.exists(local_path):
            return (local_path, media_type)

        # Check S3 if enabled
        if self.backend in ["s3", "supabase"] and self.s3_available and self.s3_client:
            storage_key = f"pilot_images/{safe_name}"
            try:
                response = self.s3_client.get_object(Bucket=self.bucket_name, Key=storage_key)
                content = response["Body"].read()
                return (content, media_type)
            except Exception as e:
                log.debug("S3 object retrieval failed: %s", e)
                return None

        return None

    def delete_image(self, filename: str) -> bool:
        """Permanently erases an image file from storage."""
        try:
            safe_name = self.sanitize_filename(filename)
        except StorageError:
            return False

        deleted = False
        local_path = os.path.join(self.base_dir, safe_name)
        if os.path.exists(local_path):
            try:
                os.remove(local_path)
                deleted = True
            except OSError as e:
                log.error("Failed to remove local file %s: %s", local_path, e)

        if self.backend in ["s3", "supabase"] and self.s3_available and self.s3_client:
            storage_key = f"pilot_images/{safe_name}"
            try:
                self.s3_client.delete_object(Bucket=self.bucket_name, Key=storage_key)
                deleted = True
            except Exception as e:
                log.error("Failed to remove S3 object %s: %s", storage_key, e)

        return deleted

    def image_exists(self, filename: str) -> bool:
        """Returns True if the image exists in active storage."""
        try:
            safe_name = self.sanitize_filename(filename)
        except StorageError:
            return False

        local_path = os.path.join(self.base_dir, safe_name)
        if os.path.exists(local_path):
            return True

        if self.backend in ["s3", "supabase"] and self.s3_available and self.s3_client:
            storage_key = f"pilot_images/{safe_name}"
            try:
                self.s3_client.head_object(Bucket=self.bucket_name, Key=storage_key)
                return True
            except Exception:
                return False

        return False


_global_storage_service: Optional[PilotStorageService] = None


def get_pilot_storage_service() -> PilotStorageService:
    """Returns singleton instance of the PilotStorageService."""
    global _global_storage_service
    if _global_storage_service is None:
        _global_storage_service = PilotStorageService()
    return _global_storage_service
