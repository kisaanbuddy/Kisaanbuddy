"""Storage Service Abstraction for Media and Binary Assets.

Decouples binary payload storage from relational databases. Saves files to
local persistent file storage or S3/Cloud Storage and returns storage path + public URL.
"""
from typing import Optional, Tuple
import os
import uuid
import logging

log = logging.getLogger("krishiai.storage")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCAL_STORAGE_DIR = os.getenv("MEDIA_STORAGE_DIR", os.path.join(BASE_DIR, "data", "uploads"))


class StorageService:
    def __init__(self):
        self.provider = os.getenv("STORAGE_PROVIDER", "local").lower()
        self.bucket = os.getenv("S3_BUCKET_NAME")
        if self.provider == "local":
            os.makedirs(LOCAL_STORAGE_DIR, exist_ok=True)

    def save_file(self, filename: str, content_type: str, data: bytes) -> Tuple[str, str]:
        """Saves binary data to storage. Returns (storage_path, public_url)."""
        unique_id = uuid.uuid4().hex
        ext = os.path.splitext(filename)[1] or ".bin"
        safe_filename = f"{unique_id}{ext}"

        if self.provider == "s3" and self.bucket:
            # Scaffold for S3 upload if boto3 / credentials provided
            try:
                import boto3
                s3_client = boto3.client("s3")
                s3_key = f"uploads/{safe_filename}"
                s3_client.put_object(
                    Bucket=self.bucket,
                    Key=s3_key,
                    Body=data,
                    ContentType=content_type
                )
                public_url = f"https://{self.bucket}.s3.amazonaws.com/{s3_key}"
                return s3_key, public_url
            except Exception as e:
                log.warning("S3 upload failed (%s). Falling back to local storage.", e)

        # Local storage fallback
        os.makedirs(LOCAL_STORAGE_DIR, exist_ok=True)
        file_path = os.path.join(LOCAL_STORAGE_DIR, safe_filename)
        with open(file_path, "wb") as f:
            f.write(data)
        
        storage_path = f"local://{safe_filename}"
        public_url = f"/api/media/file/{safe_filename}"
        return storage_path, public_url

    def get_file(self, storage_path: str) -> Optional[bytes]:
        """Reads binary content from storage using storage_path."""
        if storage_path.startswith("local://"):
            filename = storage_path.replace("local://", "")
            file_path = os.path.join(LOCAL_STORAGE_DIR, filename)
            if os.path.exists(file_path):
                with open(file_path, "rb") as f:
                    return f.read()
            return None
        elif self.provider == "s3" and self.bucket:
            try:
                import boto3
                s3_client = boto3.client("s3")
                obj = s3_client.get_object(Bucket=self.bucket, Key=storage_path)
                return obj["Body"].read()
            except Exception as e:
                log.error("Failed to read file from S3 path %s: %s", storage_path, e)
                return None
        
        # Try direct local file path
        if os.path.exists(storage_path):
            with open(storage_path, "rb") as f:
                return f.read()
        return None

    def delete_file(self, storage_path: str) -> bool:
        """Deletes file from storage."""
        if storage_path.startswith("local://"):
            filename = storage_path.replace("local://", "")
            file_path = os.path.join(LOCAL_STORAGE_DIR, filename)
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
        elif self.provider == "s3" and self.bucket:
            try:
                import boto3
                s3_client = boto3.client("s3")
                s3_client.delete_object(Bucket=self.bucket, Key=storage_path)
                return True
            except Exception as e:
                log.error("Failed to delete S3 object %s: %s", storage_path, e)
                return False
        return False


storage_service = StorageService()
