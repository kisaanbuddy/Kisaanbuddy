# Production Deployment & Infrastructure Guide

**Project:** KisaanBuddy Crop Doctor AI Rebuild  
**Stack:** FastAPI Python Backend + Next.js Frontend + PyTorch CPU Runtime  

---

## 1. System Requirements

| Component | Minimum | Recommended |
| :--- | :--- | :--- |
| **CPU Architecture** | x86_64 / arm64, 2 Cores | x86_64 / arm64, 4+ Cores |
| **RAM** | 1.0 GB Free RAM | 2.0+ GB Free RAM |
| **Disk Space** | 200 MB for PyTorch & Model Artifact | 1.0 GB for logs & temp storage |
| **Python Runtime** | Python 3.10 – 3.13 | Python 3.11 / 3.12 |
| **Node.js Runtime** | Node.js 18.x LTS | Node.js 20.x LTS |

---

## 2. Environment Configuration

### Backend (`.env`)
```bash
# Model Inference Configuration
CROP_DOCTOR_MODEL_PATH="ml/crop_doctor/artifacts/mobilenet_v3_small/best_model.pth"
CROP_DOCTOR_DEVICE="cpu"
CROP_DOCTOR_UNCERTAINTY_THRESHOLD=0.60
CROP_DOCTOR_TEMPERATURE=0.9472

# Storage & Uploads
UPLOAD_DIR="backend/data/uploads"
MAX_UPLOAD_SIZE_BYTES=10485760

# Concurrency & Workers
WEB_CONCURRENCY=4
KMP_DUPLICATE_LIB_OK="TRUE"
```

### Frontend (`frontend-next/.env.local`)
```bash
NEXT_PUBLIC_API_URL="http://127.0.0.1:8000"
NEXT_PUBLIC_ENABLE_CROP_DOCTOR=true
```

---

## 3. Step-by-Step Deployment

### 3.1 Backend Service Startup
```bash
# 1. Activate Virtual Environment
source backend/venv/bin/activate  # or .\backend\venv\Scripts\Activate.ps1 on Windows

# 2. Verify Model Artifact & Checksum
python -c "from ml.crop_doctor.inference.service import CropDoctorInferenceService; s = CropDoctorInferenceService.get_instance(); assert s.is_ready; print('Service Ready')"

# 3. Start Uvicorn Server with 4 Workers
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 3.2 Frontend Service Startup
```bash
cd frontend-next

# 1. Build Production Assets
npm run build

# 2. Launch Production Server
npm run start -p 3000
```

---

## 4. Health Check & Monitoring

- **Service Status:** `GET http://localhost:8000/api/v1/disease/model-status`
- **Expected Status Payload:**
```json
{
  "status": "ready",
  "model_version": "crop-doctor-v1.0.0-scratch",
  "taxonomy_version": "1.0.0",
  "artifact_hash": "a335653b9173",
  "temperature": 0.9472,
  "uncertainty_threshold": 0.60,
  "classes_count": 17
}
```
