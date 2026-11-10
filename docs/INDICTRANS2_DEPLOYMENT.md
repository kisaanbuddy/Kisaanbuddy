# AI4Bharat IndicTrans2 Integration & Deployment Guide

## 1. Executive Summary & Objective

This document outlines the architecture, deployment specifications, and operational parameters for self-hosting **AI4Bharat IndicTrans2** as the primary Indian language translation engine for the **KisaanBuddy** agricultural platform.

IndicTrans2 provides state-of-the-art multilingual machine translation across 22 scheduled Indian languages, eliminating reliance on paid external API quotas and maintaining authentic linguistic sovereign execution.

---

## 2. Architecture Overview

To maintain stability and prevent blocking or memory exhaustion on the web tier, IndicTrans2 is isolated into a dedicated microservice:

```
                                  [ Browser / Mobile Client ]
                                               │
                                               ▼
                              ┌─────────────────────────────────┐
                              │    Frontend (Next.js 14 App)    │
                              │  - static dictionary (locales)  │
                              │  - translation-client.ts        │
                              └────────────────┬────────────────┘
                                               │
                                               ▼
                              ┌─────────────────────────────────┐
                              │  FastAPI Backend (Port 8000)    │
                              │  - POST /api/translate          │
                              │  - POST /api/translate/batch    │
                              │  - POST /api/translate/structured│
                              └───────┬──────────────┬──────────┘
                                      │              │
                    ┌─────────────────┘              └────────────────┐
                    ▼                                                 ▼
      ┌───────────────────────────┐                     ┌───────────────────────────┐
      │   TranslationService      │                     │     TranslationCache      │
      │   - LanguageRouter        │                     │   - L1: In-Memory LRU     │
      │   - AgriculturalGlossary  │                     │   - L2: Redis (optional)  │
      │   - Token Protection      │                     │   - L3: SQLite / Postgres │
      └─────────────┬─────────────┘                     └───────────────────────────┘
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│  IndicTrans2     │  │  Sarvam AI       │
│  Primary Engine  │  │  Fallback Engine │
│  (Port 8001)     │  │  (Mayura REST)   │
└──────────────────┘  └──────────────────┘
```

---

## 3. Models Selected

AI4Bharat provides two families of IndicTrans2 checkpoints:

| Direction | Distilled 200M/320M Model (Recommended) | Full 1B Model |
| :--- | :--- | :--- |
| **English to Indic** | `ai4bharat/indictrans2-en-indic-dist-200M` | `ai4bharat/indictrans2-en-indic-1B` |
| **Indic to English** | `ai4bharat/indictrans2-indic-en-dist-200M` | `ai4bharat/indictrans2-indic-en-1B` |
| **Indic to Indic** | `ai4bharat/indictrans2-indic-indic-dist-320M` | `ai4bharat/indictrans2-indic-indic-1B` |

### Primary Model Selection: **Distilled 200M / 320M Suite**
- **Inference Latency:** 35–80ms on GPU; 180–320ms on modern 8-core CPU.
- **Model Checkpoint Size:** ~800 MB (fp16) per checkpoint.
- **VRAM Footprint:** ~1.2 GB per loaded model on CUDA.
- **Accuracy:** Retains >96% of the 1B model's BLEU score while requiring 75% less memory.

---

## 4. Languages Supported & FLORES-200 Codes

IndicTrans2 supports all 22 official Indian languages:

| Language | FLORES-200 Code | Frontend ISO | Native Script |
| :--- | :--- | :--- | :--- |
| **English** | `eng_Latn` | `en` | English |
| **Hindi** | `hin_Deva` | `hi` | हिन्दी |
| **Kannada** | `kan_Knda` | `kn` | ಕನ್ನಡ |
| **Tamil** | `tam_Taml` | `ta` | தமிழ் |
| **Telugu** | `tel_Telu` | `te` | తెలుగు |
| **Marathi** | `mar_Deva` | `mr` | मराठी |
| **Bengali** | `ben_Beng` | `bn` | বাংলা |
| **Gujarati** | `guj_Gujr` | `gu` | ગુજરાતી |
| **Malayalam** | `mal_Mlym` | `ml` | മലയാളം |
| **Punjabi** | `pan_Guru` | `pa` | ਪੰਜਾਬੀ |
| **Odia** | `ory_Orya` | `od` | ଓଡ଼ିଆ |
| **Assamese** | `asm_Beng` | `as` | অসমীয়া |
| **Maithili** | `mai_Deva` | `mai` | मैथिली |
| **Urdu** | `urd_Arab` | `ur` | اردو |
| **Nepali** | `npi_Deva` | `ne` | नेपाली |
| **Sanskrit** | `san_Deva` | `sa` | संस्कृतम् |
| **Konkani** | `gom_Deva` | `kok` | कोंकणी |
| **Sindhi** | `snd_Deva` / `snd_Arab` | `sd` | سنڌي / सिंधी |
| **Santali** | `sat_Olck` | `sat` | ᱥᱟᱱᱛᱟᱲᱤ |
| **Kashmiri** | `kas_Deva` / `kas_Arab` | `ks` | कश्मीरी / كٲشُر |
| **Dogri** | `dgo_Deva` | `doi` | डोगरी |
| **Bodo** | `brx_Deva` | `brx` | बड़ो |
| **Manipuri** | `mni_Mtei` / `mni_Beng` | `mni` | মৈতৈলোন্ |

---

## 5. Agricultural Glossary Protection Engine

Agricultural domain data contains sensitive entities that machine translation must not mangle:
- **Brand Names:** `KisaanBuddy`, `KrishiAI`
- **Tractor Manufacturers:** `Mahindra`, `John Deere`, `Swaraj`, `Sonalika`, `Tafe`, `Escorts`, `Kubota`, `New Holland`, `Eicher`, `Massey Ferguson`, `Farmtrac`, `Powertrac`
- **Tractor Models:** `Mahindra 575 DI`, `Swaraj 744 FE`, `John Deere 5050 D`, `Powertrac 439 Plus`
- **Scientific Binomials:** `Triticum aestivum`, `Oryza sativa`, `Puccinia graminis`, `Magnaporthe oryzae`
- **Government Schemes & Commodities:** `PM-KISAN`, `PMFBY`, `e-NAM`, `APMC`, `MSP`, `KCC`, `IFFCO`, `NABARD`
- **Technical Metrics & Pricing:** `₹ 2,275/quintal`, `50 HP`, `2.5 acres`, `32°C`, `75%`

The `AgriculturalGlossary` replaces these terms with non-translatable tokens (e.g. `__KB_PROT_0__`) before invoking neural translation, and restores them accurately upon completion.

---

## 6. Multi-Tier Translation Cache

Every translation is indexed by `SHA-256(text) + src_lang + tgt_lang`:
- **Tier 1 (L1 In-Memory):** Thread-safe LRU cache storing up to 10,000 entries for zero-latency retrieval.
- **Tier 2 (L2 Redis):** Shared across workers if `REDIS_URL` is set.
- **Tier 3 (L3 Database):** Persistent `translation_cache` table in PostgreSQL / SQLite, recording hit counts and timestamps.

Identical content across weather cards, mandi prices, and crop guides is retrieved in < 1ms without hitting inference workers.

---

## 7. Hardware & Deployment Requirements

### Recommended Production Specification (GPU)
- **Host Instance:** AWS EC2 `g4dn.xlarge` or RunPod / Modal Cloud Container
- **GPU:** 1x NVIDIA T4 (16 GB VRAM) or RTX 3070/4090
- **vCPU:** 4 cores
- **System RAM:** 16 GB
- **Storage:** 50 GB NVMe SSD
- **Throughput:** ~250–400 translated sentences / second (in batches)

### Minimum CPU-Only Specification
- **Host Instance:** 4 vCPUs (Intel Xeon / AMD EPYC / Apple Silicon)
- **System RAM:** 8 GB
- **Throughput:** ~15–35 sentences / second

---

## 8. Deployment Configurations

### A. Docker Compose (Staging / Dedicated Server)
```yaml
services:
  backend:
    environment:
      - INDICTRANS2_SERVICE_URL=http://indictrans2:8001
      - TRANSLATION_PRIMARY_PROVIDER=indictrans2
      - TRANSLATION_FALLBACK_PROVIDER=sarvam

  indictrans2:
    build:
      context: ./ml/indictrans2_service
      dockerfile: Dockerfile
    ports:
      - "8001:8001"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
```

### B. Cloud Serverless / External Endpoint (Modal / RunPod / AWS SageMaker)
Point the backend environment to the deployed external inference URL:
```bash
INDICTRANS2_SERVICE_URL=https://indictrans2-api.kisaanbuddy.com
TRANSLATION_PRIMARY_PROVIDER=indictrans2
TRANSLATION_FALLBACK_PROVIDER=sarvam
```

---

## 9. API Reference

### 1. `POST /api/translate`
Single string or batch translation:
```json
{
  "text": "Wheat requires adequate irrigation.",
  "source_language": "eng_Latn",
  "target_language": "hin_Deva"
}
```
Response:
```json
{
  "translated_text": "गेहूँ को पर्याप्त सिंचाई की आवश्यकता होती है।",
  "source_language": "eng_Latn",
  "target_language": "hin_Deva",
  "provider": "indictrans2",
  "cached": false
}
```

### 2. `POST /api/translate/batch`
Batch list translation for Mandi market data and weather cards.

### 3. `POST /api/translate/structured`
Translates nested JSON dictionaries while preserving numeric IDs, prices, and URLs.

### 4. `GET /api/translate/health`
Returns live status of primary IndicTrans2 worker, fallback Sarvam provider, and cache hit metrics.
