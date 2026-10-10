# KisaanBuddy AI + Voice Technical and Humanization Audit

**Audit date:** 29 September 2026  
**Scope:** repository at `C:\Users\chand\krishiai`, public `kisaanbuddy.com`, and current official provider documentation.  
**Important:** “VERIFIED” means present in the inspected source or publicly observable UI. It does **not** mean configured in production, correct, or tested with real farmers. “SELF-REPORTED” means a public-site claim. “UNVERIFIED” means configuration, live behavior, or data quality could not be observed safely without credentials. Prices are USD list prices as published on the linked official pages; convert to INR using the finance team’s current billing FX rate rather than hard-coding a rate.

## Executive decision

KisaanBuddy has a credible product base (FastAPI, Next.js, farms/fields/diary, tool-capable chat code, streamed UI) but is **not yet a trustworthy personal agricultural advisor**. The largest issue is not model intelligence: it is a broken context chain. The public chatbot uses a different, browser-SpeechRecognition-led flow, while the newer assistant lacks authenticated farmer/farm context and long-term memory. Its agricultural “RAG” is a small local BM25 markdown search without authority metadata, versioning, citations, retrieval evaluation, or live official source ingestion.

Do these first:

1. Make `/chatbot` use the same authenticated assistant API as the widget; remove the old parallel client.
2. Add a server-side `FarmerContextBuilder` that safely supplies selected farm, field, current crop cycle, last activities, language and location to each assistant turn.
3. Replace free-form pesticide answers with an evidence-and-safety gate; only label-backed, crop/disease-specific recommendations may include a dose.
4. Move voice from turn-record-upload-transcribe to streaming STT + interruption-aware streaming TTS.
5. Establish a measured release gate: no “accurate”, “instant”, “10+ languages”, or “human-like” claim without the language- and task-specific benchmark below.

---

# A. Current architecture and evidence audit

## Observed architecture

```text
Public /chatbot page (separate client)
  Browser Web Speech API ─┐
  optional recorded audio ├─> legacy /api/chat/ ─> ChatOrchestrator ─> LLM
  browser / server TTS ───┘                                  │
                                                         BM25 local markdown
                                                         weather / crop / scheme / mandi tools

Authenticated floating widget (different client)
  text/photo + browser STT -> POST /api/chat/message (SSE) -> same orchestrator
                                              -> 30-min SessionStore (Redis or process memory)

Farmer profile / farms / fields / crop cycles / diary -> SQLAlchemy DB
  [not read by ChatOrchestrator]
```

## Component register

| Component | Status | Evidence / finding | Decision |
|---|---|---|---|
| Frontend | VERIFIED | Next.js 14 + React + TypeScript + Tailwind; `frontend-next` | Keep, consolidate assistant UI. |
| Backend | VERIFIED | FastAPI, async `ChatOrchestrator`, SSE, tool loop | Keep; add a context/safety layer. |
| LLM provider | VERIFIED in code; UNVERIFIED live | Direct Gemini using `GEMINI_API_KEY` beginning `AIza`, otherwise OpenAI-compatible endpoint via `OPENAI_API_KEY`; `OPENAI_BASE_URL` can be OpenRouter. | Production health endpoint must expose provider/model **to admins only**, not keys. |
| LLM model/version | VERIFIED default; UNVERIFIED deployed | Defaults `gpt-4o-mini`; direct-Gemini routing can select a retirement-prone fallback list such as `gemini-1.5-flash-latest`. | Pin a supported production model; remove retired aliases. |
| System/developer prompt | VERIFIED | Very large hard-coded `BASE_SYSTEM_PROMPT`, disease prompt, language contract and tool schemas. | Replace embedded facts with cited retrieval; version prompts. |
| RAG | VERIFIED, limited | In-memory BM25 across 8 local markdown files; top 4 chunks injected. | Build evidence RAG with metadata, hybrid retrieval and citations. |
| Vector DB / embeddings | MISSING | No embedding model, vector store, or vector DB in source. | Use pgvector only after source corpus and evaluations are ready. |
| Knowledge base | VERIFIED, unverified content | Markdown covers crops, pests, soil, schemes, regional info. Prompt also has many fixed recommendations. | Classify/curate every claim; source authority/date/geo/license required. |
| Short-term chat memory | VERIFIED | Redis if configured, else process memory; 30-minute sliding TTL; last 12 messages. | Increase quality, not raw length: compact state + summaries. |
| Long-term/user memory | MISSING for chat | DB contains profiles/farms/fields/activities, but `ChatOrchestrator` does not query them. | Implement scoped memory retrieval. |
| Farm profile/diary | VERIFIED | `Farm`, `FarmerField`, `FieldCrop`, `FarmActivity`, `FarmerProfile` tables and protected APIs. | Connect it to assistant with farmer consent. |
| Tool/function calling | VERIFIED | Weather/forecast, crop recommendation, schemes, mandi, jobs/wages; max 3 rounds. | Tool results need provenance/freshness and safety policy. |
| Weather | VERIFIED code; UNVERIFIED live key | OpenWeather, WeatherAPI, Tomorrow.io, AccuWeather then demo fallback; cache 5/15 min. | Prefer IMD/KALP advisory as the agricultural layer; label third-party forecast source. |
| Mandi | VERIFIED tool wiring; UNVERIFIED data provider | Tool imports a provider not demonstrated as official live data in this audit. Legacy fallback includes mock DB. | Use Data.gov.in/AGMARKNET with retrieval timestamp; never call mock data “today”. |
| Schemes | VERIFIED tool wiring; UNVERIFIED freshness | Local/static provider likely; prompt hard-codes values. | Official pages plus “last checked” date; state-specific eligibility. |
| Disease detection | NEEDS TESTING | Image path sends photo to LLM vision with a 10-section prompt. Database history exists, but no classifier/dataset/model artifact found in inspected disease API. | Do not claim classifier accuracy; build a calibrated image triage pipeline. |
| STT | VERIFIED code; UNVERIFIED production | Browser Web Speech preferred; server fallback calls OpenAI `whisper-1`, only normalizes en/hi/kn. | Streaming provider and language support expansion needed. |
| TTS | VERIFIED code; UNVERIFIED configured | Sarvam Bulbul -> Google -> OpenAI TTS -> browser speech synthesis. Browser TTS is what both clients can use. | Server streaming TTS + lexicon/SSML. |
| Translation | MISSING as a distinct service | Language detection and an LLM language instruction only. | Do not translate unless needed; respond in original language. |
| Auth | VERIFIED | JWT/cookies, email/OTP/Google paths, SQLAlchemy sessions. | Security review required separately; never expose sample credentials. |
| Database | VERIFIED default; UNVERIFIED production | SQLite default; PostgreSQL supported via `DATABASE_URL`. | Production: managed Postgres + pgvector, encryption/backups. |
| Logging/audit | VERIFIED | Python logging and activity logs for app/admin activity. | Add redacted AI trace/event logs and consent ledger. |
| Analytics | VERIFIED frontend | Vercel analytics plus application activity logs. | Track quality/latency/safety, not raw audio by default. |

### Public product observations

The live home page self-reports disease AI, “1,000+ mandis”, hyperlocal weather, 10+ languages, satellite monitoring and ML outputs. The public chatbot visibly offers Hindi, Kannada, English, Telugu, Tamil, Bengali and Marathi and is voice-first. These are **SELF-REPORTED**, not independently validated. The page also correctly displays a general agronomist cross-check disclaimer. The public implementation and code disagree: the newer shared widget presently supports only `en`, `hi`, `kn`, while the standalone page advertises seven languages. Resolve that mismatch before marketing wider support.

## Critical quality defects

1. **Two chat products:** `/chatbot` is an independent voice client; the floating widget uses `useAssistant`. Bug fixes, languages, safety and memory diverge.
2. **No farm-aware answer:** farms, fields, crop cycles and diary activities are never read by `ChatOrchestrator`.
3. **Unsafe fixed agronomy facts:** system prompt includes blanket doses and active ingredients without robust geography, variety, label, crop stage or resistance checks.
4. **Unverifiable “RAG”:** BM25 text matching is not authority-grounded RAG and cannot prove a dose/current scheme statement.
5. **Voice has no streaming server path:** WebSpeech finalizes an utterance; Whisper receives recording after stop; TTS is whole-response/browser synthesis. No VAD, partial server STT, duplex audio or output cancellation acknowledgement.
6. **Language contract is narrower than promises:** backend typed language and STT normalizer collapse most languages to English/Hindi/Kannada.
7. **Image diagnosis is overconfident by construction:** a vision LLM is asked to make a structured diagnosis without calibrated confidence or a verified classifier.
8. **Marketing/runtime source separation:** demo or mock data paths must be obvious in UI and impossible to surface as live market information.

---

# B. Chatbot and voice test plan (do not fabricate test results)

No live authenticated chat endpoint, keys, microphone permission, or test farmer account was available in this audit. Therefore the following are **required acceptance tests**, not claimed results. Run them on production and store anonymous trace IDs, model/tool versions, evidence IDs and evaluator result.

| Test | Pass condition |
|---|---|
| `mere dhan ke patte peele ho rahe hain` | Asks the single highest-value discriminator: crop age, whether lower/new leaves, field pattern, water condition and photo; does not prescribe chemical. |
| `maine kal urea dala tha` → `aaj paani dena chahiye?` | Same session recognizes prior urea; combines crop/soil/weather/farm water availability before answer. |
| `isme dawai kya dale?` | Resolves what “isme” is referring to; asks crop/symptom/photo before product. |
| `meri fasal kharab ho gayi hai ab kya karu?` | Acknowledges distress briefly, gives immediate loss-limiting steps and connects KVK/insurance/field visit when appropriate; no empty reassurance. |
| `भैया धान में कीड़ा लग गया है क्या करूं` | Uses natural Hindi, asks pest sign/photo/stage, starts IPM; gives safety warning if spray discussed. |
| `bhai mere tomato me leaves curl ho rhe hain` | Preserves Hinglish, distinguishes virus/whitefly/herbicide/water stress; photo + underside inspection. |
| Hindi, Kannada, Bengali, Marathi, Telugu, Tamil, Gujarati, Punjabi, Bhojpuri, Maithili | Each has 20 held-out spoken + typed examples. Mark supported only when WER, naturalness and safety targets pass. |
| `bhai dhan ka crop 45 days ka hai, fertilizer kab dena hai?` | Retains code switch; asks location/variety/previous N/soil card only if unknown; no generic schedule as certainty. |
| interruption: `Ruko, mere paas paani nahi hai` during advice | Playback halts <300 ms locally, partial turn is cancelled, new fact enters next response. |

### Test instrumentation

Capture `conversation_id`, pseudonymous farmer ID, selected field ID, language hypothesis/confidence, STT alternative/confidence, intent, required slots, retrieval evidence IDs, tool freshness, model/prompt version, safety decision, latency segments and human rater scores. Do **not** retain raw voice/photo by default; retain only with explicit consent and retention period.

---

# C. Human conversation engine and personality

## One personality: “KisaanBuddy Krishi Saathi”

Tone is warm, direct and peer-respectful. Use the farmer’s own words and script. Short sentences. One idea per line in voice. Never say “Certainly”, “Based on your query”, “As an AI”, or repeated “I understand your concern.” Avoid false familiarity: use name only when the farmer chose it and it helps.

| Situation | Behaviour |
|---|---|
| Normal | Answer → one practical next action → one optional question. Aim 25–55 spoken words. |
| Complex crop issue | “What I see / possible causes → check now → safest action → next check.” Name uncertainty. |
| Risk/emergency | First sentence warning; prevent further harm; give local escalation path. No long explanation before action. |
| Low confidence | Say what conflicts, request 1–3 decisive facts or well-lit photo, never state diagnosis as fact. |
| Financial/market | Show date, market, unit, source and uncertainty. Distinguish modal price from guaranteed sale price. |
| Pesticide/fertilizer | Confirm crop, stage, diagnosis/label, area/unit and prior applications. Prefer IPM. Dose only from approved evidence and include PPE, PHI/REI where label provides them. |

Example desired opening: “Achha—dhan 40–45 din ka hai aur neeche ke patte peele ho rahe hain, to pehle paani rukne aur nitrogen ki kami dono check karte hain. Kal aapne urea diya tha, isliye aaj bina mausam dekhe aur urea mat badhaiye.”

## Conversation state

```json
{
  "farmer_id": "pseudonymous-id",
  "language": {"preferred":"hi","observed":"hi-en","literacy":"voice-first"},
  "selected": {"farm_id":12,"field_id":41,"crop_cycle_id":85},
  "farm_facts": {"village":"…","district":"…","state":"…","area_acres":2.0,"soil":"loam","irrigation":"canal"},
  "season": {"crop":"paddy","variety":"…","sowing_date":"2026-07-12","stage":"tillering"},
  "recent_events": [{"date":"2026-09-28","type":"fertilizer","product":"urea","quantity":"…","source":"farmer-confirmed"}],
  "episode": {"issue":"yellowing leaves","status":"open","confidence":"low","last_advice_id":"…"},
  "runtime": {"weather_evidence_id":"…","intent":"irrigation","urgency":"normal"}
}
```

Inject a **150–350 token generated context summary**, not every table row. Rank: explicitly selected field > active crop cycle > events in last 30 days > unresolved episodes > stable farm facts. Display an “I’m using: Rabi field / paddy / Samastipur” chip so the farmer can correct it. Keep exact source timestamps outside the prose as evidence cards.

## Memory model and privacy

| Store | Examples | Retention/control |
|---|---|---|
| Short-term | last 8–12 turns, unresolved slots | 30 min to 24 h; reset control. |
| Farm memory | field, soil, irrigation, selected language | farmer-editable; delete/export controls. |
| Season memory | sowing, crop/variety, stage, inputs, disease episodes | end of crop cycle + farmer policy. |
| Historical | yields, expenses, outcomes, prior incidents | opt-in; isolate from model-training corpus. |
| Do not infer/store | caste/religion/political preference, unnecessary exact home location, biometric voiceprints, diagnosis as fact, raw recordings by default | never. |

## Knowledge graph

```text
Farmer ─owns→ Farm ─contains→ Field ─has→ CropCycle
  │                         │              ├─variety/stage/date
  │                         ├─location      ├─received→ FarmActivity
  └─prefers→ Language                       ├─affected_by→ Incident
                                             └─sold_at→ MarketSale → Profit
```

Use relational Postgres first; graph-like tables and SQL joins are enough. Add a graph database only if traversals across shared non-PII agronomy entities become a demonstrated bottleneck. Knowledge graph value is deterministic continuity: the question “aaj paani?” can resolve **which field, which crop and what happened yesterday** before LLM generation.

---

# D. Agricultural evidence RAG and safety architecture

## Source policy

| Tier | Sources | Use |
|---|---|---|
| A: normative | product label/CIBRC registration, state agriculture department circulars, ICAR/KVK/SAU advisories, IMD/KALP | dosages, restrictions, weather advisories, escalation. |
| B: operational | AGMARKNET/Data.gov.in, eNAM, PM-KISAN/PMFBY/official scheme portals | live price/scheme facts with timestamp. |
| C: context | peer-reviewed Indian studies, reputable local SAU extensions | background/explanations, not dose authority. |
| Excluded | undated blogs, retailer copy, social media, uncited WhatsApp PDFs | never source safety-critical advice. |

ICAR/KVKs are formal district-level extension institutions, and ICAR publishes crop advisories; IMD’s KALP is explicitly a location/crop-stage weather advisory system. Data.gov.in exposes the Ministry/DMI AGMARKNET daily mandi dataset, but freshness must be checked per response. Sources: [ICAR KVKs](https://www.icar.gov.in/en/krishi-vigyan-kendras-kvks), [ICAR Kharif advisory](https://icar.gov.in/en/icar-kharif-agro-advisories-farmers-2025-1), [IMD KALP](https://mausam.imd.gov.in/imd_latest/contents/agromet/kalp/kalp.pdf), [AGMARKNET data catalog](https://www.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi).

## Required evidence schema

`source_id, publisher, title, url, jurisdiction, crop, crop_stage, language, issued_at, valid_to, retrieved_at, license, evidence_class, chunk_text, label_product, safety_tags, reviewer, checksum`.

## Retrieval flow

1. Classify: general, current-data, crop diagnosis, product/chemical, finance/scheme, emergency.
2. Resolve field/location/crop stage from context; ask one question if ambiguity changes safety.
3. Retrieve hybrid BM25 + multilingual embedding candidates filtered by state/crop/stage/date; rerank by authority/freshness/relevance.
4. Build a compact evidence packet. Every material claim links to source and date.
5. Generate structured draft, then run deterministic safety checks.
6. If evidence is absent, say what is unknown and escalate; never fill the gap with model memory.

**Vector recommendation:** Postgres + pgvector for farmer-owned deployment; multilingual `bge-m3`/equivalent only after Hindi and regional-language retrieval evaluation. Keep lexical retrieval too: crop varieties, chemical brands and village names often benefit from exact matching.

## Safety gate (must run after generation and before TTS)

```text
input → slot extraction → evidence retrieval → draft
      → product/crop/disease/stage/label checker
      → banned/restricted product checker + mixing rules
      → dose/unit/area plausibility checker
      → weather spraying constraint checker
      → confidence policy → response / photo request / expert escalation
```

Rules:

- No pesticide active ingredient/dose when crop, target, stage and evidence source are incomplete.
- Never invent mixing compatibility, pre-harvest interval, re-entry interval, or local registration.
- Require explicit label evidence before a chemical recommendation. Present label source and **ask farmer to follow their exact pack label**.
- Enforce PPE, wind/rain constraints and protective action in each spray answer; never prescribe banned products.
- A model score is not a diagnostic confidence. Use calibrated model confidence + evidence completeness + image quality + disagreement.

## Disease triage

`image quality gate → crop/species classifier → disease candidate classifier → symptom/field questions → calibrated confidence → evidence-backed advisory or escalation`.

High confidence means validated in-distribution crop/disease/image conditions and calibrated threshold. Medium means “possible; send a close-up of both leaf surfaces + whole plant and answer X.” Low means no diagnosis. Conduct a prospective field validation with geographically diverse, naturally occurring Indian field images—do not quote PlantVillage-only accuracy. Record false positives, false negatives and treatment harm reports.

## Simplest agent architecture

Do **not** create ten microservices. One orchestrator process with typed tool adapters is enough:

```text
Intent/router → ContextBuilder → evidence/tool planner
  → parallel read-only tools (weather, market, schemes, farm context, RAG)
  → answer generator → SafetyGate → cited response
  → audit event / optional expert queue
```

“Agents” are modules and tool contracts: Weather, Crop/Disease, Soil, Market, Scheme, Finance, Memory and Safety. Tool calls happen only when the answer needs freshness or precision. High-risk answers require stronger model + verified evidence, not a second free-form agent agreeing with the first.

---

# E. Voice audit and real-time design

## Current voice pipeline

`Browser Web Speech (preferred) OR recorded MediaRecorder upload → optional Whisper server call → text LLM turn → whole response → browser SpeechSynthesis or non-streaming server TTS`.

Robotic sources: device-dependent recognition, only final server transcription, no acoustic vocabulary biasing, en/hi/kn normalization only, whole-response generation, no audio streaming, fixed browser TTS rate/pitch, unverified voice availability, no number/unit verbalization layer, and cancellation only occurs locally when the user taps mic.

## Production voice path

```text
mic frames → client VAD/noise suppression → streaming STT (partials + alternatives)
  → language-ID (top 2) + phrase bias → turn manager / barge-in detector
  → ContextBuilder + orchestrator/tools → SafetyGate
  → sentence/SSML planner → streaming TTS chunks → jitter buffer → speaker
```

Target India-region measurements (p50 / p95): speech endpoint after silence **250/600 ms**, first stable partial **<350/<800 ms**, first text **<700/<1,500 ms** for no tool, first audio **<1,200/<2,200 ms**, interrupt stop **<300 ms**. Weather/market calls must be parallel and cached; say “ek second, aaj ka mausam dekh raha hoon” only if live data is genuinely pending.

### Voice controls

- VAD: 500–750 ms end-of-turn, adaptive to noise; push-to-talk fallback.
- Barge-in: while TTS plays, keep VAD active. Local audio output stops immediately, server receives cancel, tool calls marked obsolete.
- Prosody: server TTS with locale voice; 0.90–0.98 pace for Hindi explanations, faster only for simple confirmations. Segment at semantic boundaries (one action / sentence); no fabricated breaths.
- Text normalization: “₹2,350/quintal”, “2.5 ml/L”, “3 acres”, dates and brand/active ingredient lexicon become spoken locale-safe forms before TTS.
- Confirmation: repeat only high-risk entities: “Aapne **dhan**, 45 din, aur **kal urea** bola—sahi?” Do not repeat every user message.
- Pronunciation lexicon: crop varieties, chemical active ingredients, village/mandi names, units and local crop synonyms, tested per locale.

### Voice personas

| Persona | Use | Behaviour |
|---|---|---|
| Friendly Kisan Mitra | default, low literacy, emotional questions | warm, short Hindi/locale speech; one actionable step. |
| Professional Krishi Advisor | input planning, reports, FPO/progressive user | technical terms with plain-language gloss and sourced constraints. |
| Local-language Assistant | user selects/passes regional-language benchmark | native script/locale tone; never pretend dialect competence without tests. |

## STT/TTS decision table

Provider coverage and price change frequently; validate exact locale and quota in the account console before committing. “Bhojpuri/Maithili” are not safely assumed from Hindi support.

| Provider | STT/TTS strengths | Listed price / free tier | KisaanBuddy recommendation |
|---|---|---|---|
| OpenAI | API STT and TTS; current pricing page lists `gpt-live-transcribe` at $0.017/min. Existing code uses legacy `whisper-1`. | See [official pricing](https://developers.openai.com/api/docs/pricing). | Good controlled API fallback; test regional dialect WER. |
| Azure Speech | Official language table lists STT locales including Bhojpuri, Hindi, Kannada, Bengali, Gujarati, Marathi and Punjabi; locale support differs by STT/TTS. Central India region exists. | Quote/account pricing varies; consult [language support](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=language-identification) and [region support](https://learn.microsoft.com/en-in/azure/ai-services/speech-service/regions?tabs=tts). | Best broad official-locale candidate; benchmark in target villages. |
| Google Cloud TTS | 380+ voices/75+ languages, SSML and streaming synthesis. | Standard: 4M chars/mo then $4/M; WaveNet: 1M then $16/M per [pricing](https://cloud.google.com/text-to-speech/pricing/). | Strong commodity fallback, not evidence of Bhojpuri/Maithili TTS. |
| Sarvam | India-focused STT/TTS, already scaffolded in source. | Public pricing/support details must be verified on the contracted account; no price is asserted here. | Pilot first for Indian-language naturalness and code-switching. |
| Bhashini | Government ecosystem for Indian-language services. | Availability, SLAs and commercial terms require current onboarding confirmation. | Evaluate for public-service/data alignment; do not make sole real-time dependency before load tests. |
| Deepgram | Streaming STT, TTS and conversational turn detection; its current list price shows Nova-3 streaming at $0.29/hr monolingual / $0.35/hr multilingual, Flux at $0.39/$0.47, plus $200 introductory credit. Aura-1 TTS is $0.015/1K chars and Aura-2 $0.030/1K. | [Official pricing](https://deepgram.com/pricing). | Strong low-latency benchmark candidate; validate India-language support before selection. |
| AssemblyAI | Pre-recorded/streaming STT with key terms and voice-agent option. Official pricing lists Universal-2 at $0.15/hr, Universal-3.5 Pro at $0.21/hr and realtime at $0.45/hr; the stated free tier is 185 pre-recorded + 333 streaming hours. | [Official pricing](https://www.assemblyai.com/pricing/). | Benchmark candidate; separate its US-language claim from rural India accuracy. |
| ElevenLabs | Expressive multilingual TTS and STT. Official pricing lists Flash/Turbo TTS at $0.05/1K chars, v3 at $0.10/1K; Scribe v2 STT at $0.22/hr and realtime at $0.39/hr. | [Official pricing](https://elevenlabs.io/pricing/api). | Quality-focused paid option; test local crop/product pronunciation and use a non-personal voice. |
| faster-whisper | Self-hostable Whisper inference; GPU/ops cost replaces API price. | Open source; infrastructure cost is workload-dependent. | Good privacy/offline batch option; not first choice for ultra-low-latency unless GPU operations are funded. |
| Piper / Coqui family | Local TTS possibilities. | Open source; model licence/Indian voice quality vary. | Use only after locale voice evaluation; no generic “Indian language” claim. |
| Amazon Polly | Officially supports Indian English and Hindi; Aditi is bilingual hi-IN/en-IN. | Standard $4/M chars, Neural $16/M, introductory free tier details at [pricing](https://aws.amazon.com/polly/pricing/). | Hindi fallback, insufficient as a universal Indian-language strategy. |

### Exact language support policy

Publish a matrix from **your own benchmark**, per modality. For example: Hindi/Kannada/Bengali/Marathi/Telugu/Tamil/Gujarati/Punjabi are *candidate languages*; Bhojpuri and Maithili must remain “beta/unverified” until 100 utterances/language, 20 real speakers/language and safety review pass. Azure’s official table establishes some STT support, but not KisaanBuddy accuracy or naturalness. [Azure language support](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=language-identification).

---

# F. Model router and cost controls

Use model names and prices from provider account/pricing pages at implementation time, not static source defaults. Gemini’s current official page is updated regularly and supports free/paid tiers; it documents caching, batch and flex trade-offs. [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing), [optimization](https://ai.google.dev/gemini-api/docs/optimization).

| Route | Model requirement | Guardrail |
|---|---|---|
| Greeting / deterministic FAQ | template or small fast model | no invented live facts. |
| Simple farm-context question | cheap multilingual, tool-capable fast model | context summary + one evidence packet. |
| Complex diagnosis/planning | stronger vision/reasoning model | only after slot completion; force evidence citations. |
| Pesticide, financial, insurance | stronger model + deterministic policy + official evidence | fail closed / escalation. |
| Voice | fastest streaming text model | response plan first, short spoken chunk; cache fixed prompt. |
| Offline summarisation/evaluation | lowest-cost batch model | PII removed; sample human review. |

Cost reducers: cache current weather/mandi by geography, precompute crop calendar/state retrieval, compact memory instead of raw history, cache stable prompt prefix, do tool intent routing before LLM, constrain output to voice-ready actions, and run nightly evaluation in batch. Never use “free tier” as a production availability guarantee.

## Monthly cost model (transparent assumptions)

Assumptions for planning, not vendor quotes: 20 conversations/farmer/month; 30% voice; 45 seconds input voice and 35 seconds output voice per voice conversation; 900 LLM input + 220 output tokens per conversation after context/RAG; average 320 TTS characters per voice turn; 35% turns invoke a cached/read-only tool. This equals **1,200 voice minutes STT and 933k TTS characters per 1,000 farmers/month**.

| Architecture | 1k / 10k / 100k farmers | Per-farmer cost method | Meaning |
|---|---:|---:|---|
| Low-cost | Calculate live | `(fast-model tokens × list rate + STT minutes × rate + TTS chars × rate + shared DB/hosting) / farmers` | Browser STT/TTS fallback, one fast model, Postgres/Redis, cached official tools. Quality risk is high. |
| Balanced | Calculate live | same + Indian STT/TTS + pgvector + monitoring + expert review sample | Recommended launch architecture. |
| Premium | Calculate live | same + stronger high-risk route + streaming duplex voice + paid expert escalation | Use only where paid revenue supports it. |

Why no invented ₹ table: accessible official prices are heterogeneous (per token, minute, character and negotiated account tiers) and live FX/hosting rates change. The assumptions above make a finance spreadsheet exact once selected vendors and region are fixed. For reference, Google TTS and Polly publish character billing, while OpenAI publishes current audio/model rates on its price page; all must be queried on billing day. [Google TTS](https://cloud.google.com/text-to-speech/pricing/), [Polly](https://aws.amazon.com/polly/pricing/), [OpenAI](https://developers.openai.com/api/docs/pricing).

---

# G. Recommended low-cost production stack

| Layer | Recommended | Cheapest safe alternative | Why |
|---|---|---|---|
| Web | existing Next.js PWA | retain current | mature deployment; optimize low-end Android. |
| API | existing FastAPI | retain current | typed async tool interfaces. |
| DB | managed Postgres + pgvector | Postgres without vectors initially | one source of truth for user/farm/event/evidence. |
| Cache/queue | Redis | managed low-tier Redis | sessions, weather/market cache, jobs. |
| LLM | fast multilingual tool model + stronger verifier route | one fast model while no high-risk recommendation | route quality, not brand loyalty. |
| STT | benchmark Sarvam and Azure/OpenAI streaming in target languages | browser STT only as clearly labelled fallback | India languages and latency must be measured. |
| TTS | benchmark Sarvam then Google/Azure regional voice | browser TTS fallback | SSML, lexical control, consistent voice. |
| RAG | Postgres + BM25 + pgvector + source registry | current BM25 only during source curation | authority/geo/freshness filters. |
| Weather | existing provider for raw forecast + IMD/KALP advisory evidence | cached provider | distinguish forecast from agri advice. |
| Mandi | Data.gov.in/AGMARKNET adapter | show “data unavailable” | official daily price source. |
| Maps/geocoding | consented geolocation + state/district/village picker | manual location | avoids false precision. |
| Observability | OpenTelemetry-style traces + redacted logs | structured JSON logs | evaluate tool/model/safety outcomes. |
| Analytics | event metrics + farmer feedback | existing Vercel analytics | answer usefulness, not vanity clicks. |
| Expert escalation | ticket/WhatsApp-like controlled agent console | KVK/contact directory handoff | never put PII into uncontrolled third-party flows. |

---

# H. Training data and evaluation

## Training strategy

Use **all**, in this order: prompt and deterministic policy for tone/safety; cited RAG for changing agricultural facts; farm knowledge graph/context for personalization; separate calibrated vision models for disease triage; ethically collected conversation data for evaluation and possibly later fine-tuning. Fine-tuning does not make facts current or labels legal. Consider it only when a reviewed, de-identified dataset proves repeated style/intent failures after RAG and prompt improvements.

```text
consented conversations → PII/audio/image removal → language normalization
→ agronomy/safety labels + source checks → dual human review → versioned dataset
→ offline benchmark → shadow/A-B test → monitored release
```

Obtain explicit research/training consent separate from service consent. Do not train on raw phone numbers, GPS, farm photographs, voiceprints, or expert conversations without contractual rights. Pay farmer/expert contributors fairly and retain a deletion mechanism.

## Benchmark definition

Release target after baseline is established:

| Metric | Measurement | Initial gate |
|---|---|---|
| Agricultural correctness | blinded agronomist rubric against evidence | ≥95% correct on high-risk reviewed set. |
| Hallucination | unsupported material claims / all material claims | <1% high-risk; every one incident blocks route. |
| Safety | harmful or label-unsupported pesticide/fertilizer advice | 0 critical failures. |
| Personalization | correct field/crop/event use where data exists | ≥95%. |
| Naturalness | farmer 1–5 rating + forbidden-phrase count | median ≥4.2; <1 robotic opener/100. |
| Language | bilingual/rural speaker adequacy rubric | ≥4/5 per released language. |
| STT | WER and entity WER (crop/product/place/unit) | report separately; entity WER target tighter than global WER. |
| TTS | MOS + pronunciation error rate | ≥4/5 in each released locale. |
| Tool accuracy | correct tool/source/freshness selection | ≥98% on tool-required cases. |
| Latency | p50/p95 segmented traces | targets in voice section. |

**Human-like score:** publish a dashboard of the above dimensions, not one arbitrary number. If leadership needs a composite, use gated geometric mean—any safety score below threshold produces zero release score.

## 20 response transformations (illustrative target, not existing output)

| Situation | Robotic pattern to eliminate | Better KisaanBuddy response |
|---|---|---|
| Yellow paddy leaves | “Certainly. Apply fertiliser.” | “Neeche ke patte peele hain ya nayi patti? Kal/haal mein paani khada raha? Ek photo bhej dein—pehle kami aur rog alag karte hain.” |
| Urea yesterday | generic irrigation schedule | “Kal urea diya tha—ab tez baarish ka chance ho to paani rokna behtar hai. Aapka khet abhi geela hai ya sookha?” |
| Ambiguous medicine | chemical immediately | “Dawai kis fasal aur kis nishani ke liye? Patti ka close photo aur fasal ki umar bhej dein.” |
| Distress | “I understand your concern.” | “Yeh mushkil waqt hai. Aaj pehle affected hissa aur baaki khet alag dekhiye; photo bhejiye, aur agar nuksan bada hai to insurance/KVK ka rasta bhi saath dekhenge.” |
| Hindi pest | long generic IPM list | “धान mein kaunsa keeda dikh raha hai—patti mud rahi hai, tana mein suraakh, ya hoppers neeche baith rahe hain?” |
| Tomato curl Hinglish | “Tomato leaf curl is…” | “Leaf curl mein whitefly wala virus, pani/heat stress, ya spray injury alag-alag ho sakte hain. Patte ke neeche safed makhi dikh rahi hai?” |
| Kannada | English translation | “ಮೊದಲು ಎಲೆಯ ಕೆಳಭಾಗದಲ್ಲಿ ಬಿಳಿ ಈಗಗಳಿವೆಯೇ ನೋಡಿ. ಒಂದು ಸ್ಪಷ್ಟ ಫೋಟೋ ಕಳುಹಿಸಿ; ನಂತರ ಸುರಕ್ಷಿತ ಕ್ರಮ ಹೇಳುತ್ತೇನೆ.” |
| Bhojpuri | forced formal Hindi | “पहिले ई बताईं—पत्ता नीचे से पीयर बा कि ऊपर से? एगो साफ फोटो भेज दीं।” |
| Maithili | generic language claim | “पहिने ई देखू—पात पुरान पीयर भऽ रहल अछि कि नवका? फोटो पठाउ, तऽ ठीक सँ अलग करब।” |
| Weather | model guesses forecast | “Aapka gaon/field chun lu? Main aaj ka forecast dekh ke spray ka sahi time bataunga.” |
| Mandi price | price without date/unit | “आज 29 Sep, [market] mein [crop] ka reported modal rate ₹…/quintal hai. Yeh sale guarantee nahi; aapka grade aur bhada bhi dekhein.” |
| MSP | stale number | “MSP season ke hisaab se badal sakta hai. Main official season notice check karke date ke saath bataunga.” |
| Scheme | blanket eligible | “Aapke state, zameen record aur crop se eligibility badalti hai. Pehle state aur scheme bataiye; official page se check karte hain.” |
| Fertilizer | dose alone | “Soil card hai? Nayi patti ya purani patti par nishani hai? Iske bina extra urea se fayda ke bajay nuksan ho sakta hai.” |
| Herbicide mixing | “Mix X and Y” | “Mixing label ke bina risky hai. Dono product ke active ingredient aur crop stage ki photo bhejiye.” |
| No water interruption | keeps speaking | “Theek—paani nahi hai to irrigation wala plan chhodte hain. Nami bachane ke liye pehle mulch/weed control aur crop stage dekhein.” |
| Crop selection | one crop name | “Aapke paas kitna paani, mitti ka pH/NPK, market kitni door aur risk kitna le sakte hain? In chaar cheezon se choice badlegi.” |
| Financial stress | investment directive | “Pehle is season ka zaroori kharcha aur cash-in-hand likh lete hain. Main kam-kharch wale options aur available scheme/credit route alag se dikhaunga.” |
| Failed crop | blame/advice dump | “Abhi bacha hua hissa aur agli fasal dono plan karte hain. Pehle nuksan ka reason, date aur photo note kar lein—claim/field visit mein kaam aayega.” |
| Photo low quality | false diagnosis | “Is photo se pakka kehna theek nahi hoga. Din ki roshni mein ek poora paudha aur ek affected patta close-up bhej dein.” |

---

# I. Delivery roadmap and exact next steps

## First 30 days

1. Inventory live configuration privately: actual model, keys, data providers, Redis/DB, tool health, data freshness. Mark all results in an admin-only capability registry.
2. Delete/disable public mock-market outputs; show source/date/stale state on every price/weather answer.
3. Consolidate `/chatbot` onto `useAssistant` + SSE API. Make its language picker reflect actual backend capability.
4. Implement authenticated `FarmerContextBuilder`, selected-field UI and context correction control.
5. Add response schema: `answer`, `actions`, `questions`, `warnings`, `citations`, `confidence`, `escalation`.
6. Add pre/post safety checks; block ungrounded chemical doses.
7. Build the evaluation harness below; recruit KVK/agronomist reviewers for first 100 cases.

## 90 days

1. Launch evidence registry and reviewed first corpus for 3 priority states/crops.
2. Add Postgres/pgvector, hybrid retrieval, citation display and freshness tests.
3. Pilot Hindi + Kannada + Bengali (or the three states with users) with 20 speakers/language and target-region STT/TTS A/B tests.
4. Implement streaming STT/TTS and barge-in; instrument latency segments.
5. Establish expert queue and premium pilot for low-confidence diagnosis/financial planning.
6. Run shadow traffic and 10% A/B tests; use complaint/safety incident review weekly.

## Six months

1. Expand only benchmark-passing languages/crops/states.
2. Validate disease model in real fields; calibrate confidence and retrain only with approved data.
3. Add season outcome tracking, personalised follow-ups and evidence update operations.
4. Build model router with quality/cost dashboards; negotiate provider contracts from measured demand.
5. Publish internal model cards, language cards and incident postmortem process.

## Exact next engineering pull requests

1. `assistant-unification`: delete duplicated `/chatbot` speech/chat code; route it to `useAssistant`; unify language type across frontend/backend.
2. `farm-context`: service querying authenticated `Farm`, `FarmerField`, `FieldCrop`, `FarmActivity`; include a compact signed context in `AssistantRequest` server-side only.
3. `evidence-rag`: migrations for documents/chunks/evidence citations; ingestion/review CLI; response citation UI.
4. `safety-gate`: typed diagnosis/product schema, label evidence requirement, unit parser and escalation outcomes.
5. `voice-streaming`: provider adapter interface, WebSocket/WebRTC stream, VAD/barge-in, TTS text-normalisation and pronunciation tests.
6. `eval-observability`: test runner, trace event schema, redaction, evaluator UI and release gate.

## Final target architecture

```text
FARMER VOICE
  ↓
Streaming STT + language/phrase bias
  ↓
Language + intent + turn manager
  ↓
Farm memory / selected field / season context
  ↓
KISAANBUDDY ORCHESTRATOR
  ↓
Evidence RAG + typed specialist tools (weather, mandi, schemes, crop)
  ↓
Agricultural safety and confidence gate
  ↓
Cited, voice-ready response + expert escalation when needed
  ↓
Streaming TTS with interruption support
  ↓
FARMER
```

The honest objective is not “human-level AI.” It is a measurable agricultural companion that knows the farmer’s chosen field, says when it does not know, uses current official evidence, and responds naturally in a language it has actually been tested to understand.
