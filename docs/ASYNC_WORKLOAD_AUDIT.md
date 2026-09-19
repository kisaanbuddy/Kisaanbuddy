# KisaanBuddy Backend V2 — Async Workload & Task Queue Audit

---

## 1. EXPENSIVE & LONG-RUNNING OPERATIONS INVENTORY

| Operation | Current Path | Typical Cost / Latency | Blocks Request Thread? | Target Architecture | Reason |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **Gemini AI Crop & Disease Inference** | `backend/api/ml.py` (`/api/ml/crop-check`) | 1.5 - 4.5 seconds | **YES** | `QUEUE` (Async Redis Task Queue) | Network latency & LLM model execution can exhaust web worker pool. |
| **Sarvam / Google TTS Audio Synthesis** | `backend/api/chatbot.py` (`/api/chat/tts`) | 1.0 - 3.5 seconds | **YES** | `QUEUE` (Async Redis Task Queue) | Heavy binary audio encoding & external API latency. |
| **Whisper Audio Speech-to-Text Processing** | `backend/api/chatbot.py` (`/api/chat/stt`) | 2.0 - 5.0 seconds | **YES** | `QUEUE` (Async Redis Task Queue) | CPU / GPU bound audio decoding and transcription. |
| **PDF Report / Certificate Generation** | Admin export routes | 1.0 - 3.0 seconds | **YES** | `QUEUE` (Async Redis Task Queue) | High memory CPU rendering. |

---

## 2. QUEUE ARCHITECTURE & JOB LIFECYCLE

```
Client               FastAPI               Redis Broker              Async Worker
  │                     │                       │                         │
  ├─► POST /api/jobs ──►│                       │                         │
  │   (Submit Job)      ├─► Enqueue Task ──────►│                         │
  │                     │   (Job ID)            │                         │
  │◄── 202 Accepted ────┤                       ├─► Dequeue Job ─────────►│
  │    (job_id)         │                       │                         ├─► Process Task
  │                     │                       │                         │   (Gemini/TTS)
  │                     │                       │◄── Save Job Result ─────┤
  │                     │                       │    (COMPLETED / FAILED) │
  ├─► GET /api/jobs/{id}│                       │                         │
  │◄── Status Result ───┼─► Fetch Job State ───►│                         │
```

---

## 3. JOB STATES & RETRY POLICY

- **States:** `PENDING`, `RUNNING`, `COMPLETED`, `FAILED`, `CANCELLED`.
- **Max Retries:** 3 attempts.
- **Backoff:** Exponential backoff (2s, 8s, 32s).
- **Timeout:** 30 seconds per task.
