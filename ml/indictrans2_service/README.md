# IndicTrans2 Dedicated Inference Service

Standalone FastAPI inference service running **AI4Bharat IndicTrans2**.

## Quick Start (Local Service)

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run standalone server
python server.py
```

The service boots on `http://0.0.0.0:8001`.

## Endpoints

- `GET /health`: Engine status, loaded models, GPU/CPU device info.
- `POST /translate`: Single sentence translation.
- `POST /translate/batch`: Batch sentences translation.
- `POST /warmup`: Preload specific model directions (`en-indic`, `indic-en`, `indic-indic`).

## Docker Build

```bash
docker build -t kisaanbuddy-indictrans2 .
docker run -p 8001:8001 --gpus all kisaanbuddy-indictrans2
```
