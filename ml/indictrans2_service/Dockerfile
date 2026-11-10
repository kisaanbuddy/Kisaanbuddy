# AI4Bharat IndicTrans2 Dedicated Inference Microservice
# Multi-stage Docker build supporting NVIDIA GPU (CUDA 12) & CPU fallback

FROM nvidia/cuda:12.1.1-runtime-ubuntu22.04 AS base

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8001 \
    HOST=0.0.0.0

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3.11 \
    python3.11-venv \
    python3-pip \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

RUN ln -sf /usr/bin/python3.11 /usr/bin/python

COPY requirements.txt .

# Install PyTorch with CUDA 12.1 support, then remaining requirements
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cu121 && \
    pip install --no-cache-dir -r requirements.txt

# Pre-download distilled IndicTrans2 weights (en-indic 200M) for instant cold starts
RUN python -c "from transformers import AutoTokenizer, AutoModelForSeq2SeqLM; \
    AutoTokenizer.from_pretrained('ai4bharat/indictrans2-en-indic-dist-200M', trust_remote_code=True); \
    AutoModelForSeq2SeqLM.from_pretrained('ai4bharat/indictrans2-en-indic-dist-200M', trust_remote_code=True)" || true

COPY . /app

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

CMD ["python", "server.py"]
