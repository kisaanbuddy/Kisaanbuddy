# KisaanBuddy Backend V2 — Object Storage Architecture

---

## 1. STORAGE ARCHITECTURE & DECOUPLING

All binary media (user profile photos, owner CMS images, crop leaf disease upload photos) are stored outside the relational database using `StorageService` (`backend/services/storage.py`).

---

## 2. DUAL-STORAGE DRIVER MODEL

1. **Local Persistent Volume Driver (`STORAGE_PROVIDER=local`):**
   - Files stored in `data/uploads/` with UUID filename generation (`local://{uuid}.ext`).
   - Served via public endpoint `/api/media/file/{filename}`.

2. **Cloud Object Storage Driver (`STORAGE_PROVIDER=s3`):**
   - Direct S3 bucket upload (`s3://{bucket}/uploads/{uuid}.ext`).
   - Public CDN / S3 URLs (`https://{bucket}.s3.amazonaws.com/...`).

---

## 3. METADATA RECORD IN POSTGRESQL

```sql
SELECT id, filename, content_type, storage_path, public_url, size_bytes 
FROM media_assets;
```
Relational DB retains metadata & indexing without storing binary payloads.
