# Farmer-First Reviews & Suggestions System ("Your Voice Matters")

## 1. Overview & Vision
The **“Your Voice Matters”** system is a production-quality, accessible, and respectful feedback mechanism designed for Indian farmers with varying literacy, language, and digital proficiencies. It allows any farmer to share suggestions, ideas, or issues without having to read English, navigate complex menus, or create an account.

### Core Non-Negotiable UX Principles
- **Voice-First, Never Voice-Only**: Prominent microphone input with live elapsed duration, stop, listen-back, re-record, and deletion before sending. Graceful fallback to visual choices and text if microphone permissions are denied.
- **Visual Choices**: 5 large, recognizable visual options with localized text and clear agricultural iconography:
  1. *I like it* (Positive feedback)
  2. *Make it better* (Improvement suggestion)
  3. *Something is not working* (Problem/bug report)
  4. *I have an idea* (New feature/idea request)
  5. *I need help* (Assistance request)
- **Zero Decisional Overload**: No forced star ratings, no long survey questionnaires, no compulsory phone numbers or emails.
- **Contextual & Respectful**: Lightweight 1-tap quick review cards (*Helpful*, *Could be better*, *Not helpful*) frequency-capped via `localStorage` (max once every 7 days per feature), never blocking sensitive farming workflows.
- **Trust & Closed Loop**: Genuine *“You Suggested, We Improved”* public showcase with no personally identifiable information (PII) or private voice recordings exposed.

---

## 2. Architecture & Data Flow

```
   [Farmer / Visitor]
           │
           ├── Voice Recording (WebM / WAV / MP4 via MediaRecorder)
           ├── Guided Visual Choice (Mandi, Weather, Disease, Marketplace, etc.)
           └── Optional Note / Photo
           │
           ▼
[Next.js App Router (/api/feedback)]
           │
           ▼
[FastAPI Backend (/api/feedback)] ──► Rate Limiting & Input Sanitization
           │
           ├── Save Metadata & Private Audio to `farmer_feedback` Table
           │
           ▼
[Admin Review Portal (/admin)] ──► Protected by `require_admin`
           │
           ├── List & Filter by Status, Topic, Priority, Audio
           ├── Stream Private Audio (/api/feedback/admin/{id}/audio)
           ├── Staff Notes & Status (Received, Under Review, Planned, Completed, Declined)
           └── Curate for Public Showcase ("You Suggested, We Improved")
```

---

## 3. Database Schema & Migration

### SQLAlchemy Model: `FarmerFeedback` (`backend/db/models.py`)
- `id`: String(36), primary key (UUID)
- `feedback_ref`: String(20), unique index (e.g. `KB-FB-72910`)
- `feedback_type`: String(50), index (`positive`, `improvement`, `issue`, `idea`, `help`, `quick_review`)
- `category`: String(50), index (`mandi`, `weather`, `disease`, `marketplace`, `workers`, `schemes`, `general`)
- `quick_rating`: String(20), nullable (`helpful`, `neutral`, `unhelpful`)
- `guided_option`: String(120), nullable
- `content_text`: Text, nullable (max 2000 chars)
- `has_audio`: Boolean, default False
- `audio_data`: LargeBinary, nullable (private audio recording)
- `audio_mimetype`: String(50), nullable (`audio/webm`, `audio/mp4`, etc.)
- `audio_duration_seconds`: Integer, nullable (max 90 seconds enforced in UI, 300 in backend)
- `has_image`: Boolean, default False
- `image_data`: LargeBinary, nullable (max 5MB)
- `image_mimetype`: String(50), nullable
- `language`: String(10), default "en", index (e.g. `hi`, `kn`, `mr`, `ta`, `te`, `pa`, `bn`, `gu`, `ml`, `en`, `hi_en`)
- `source_page`: String(255), nullable
- `user_id`: Integer, ForeignKey("users.id"), nullable
- `is_anonymous`: Boolean, default True
- `contact_consent`: Boolean, default False
- `contact_info`: String(100), nullable
- `status`: String(30), default "received", index (`received`, `under_review`, `planned`, `completed`, `declined`)
- `priority`: String(20), default "normal", index (`low`, `normal`, `high`, `urgent`)
- `internal_notes`: Text, nullable
- `assigned_to`: String(100), nullable
- `is_spam`: Boolean, default False, index
- `is_public_showcase`: Boolean, default False, index
- `public_improvement_summary`: Text, nullable
- `created_at`: DateTime, default UTC
- `updated_at`: DateTime, default UTC, onupdate UTC

### Alembic Migration
- File: `backend/alembic/versions/005_add_farmer_feedback.py`
- Down revision: `004_farm_context_diary`

---

## 4. API Specification

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/feedback` | Public / Anonymous | Submit feedback (Form data with audio/photo or JSON) |
| `POST` | `/api/feedback/quick` | Public / Anonymous | 1-tap quick review (*Helpful* / *Could be better* / *Not helpful*) |
| `GET` | `/api/feedback/public-improvements` | Public | Curated improvements showcase (PII stripped) |
| `GET` | `/api/feedback/admin/list` | Admin Only | Paginated list with filtering (status, topic, priority, audio, search) |
| `GET` | `/api/feedback/admin/{id}` | Admin Only | Detailed submission review |
| `GET` | `/api/feedback/admin/{id}/audio` | Admin Only | Private audio stream (`Cache-Control: private, no-store`) |
| `GET` | `/api/feedback/admin/{id}/image` | Admin Only | Private attached photo stream |
| `PATCH` | `/api/feedback/admin/{id}` | Admin Only | Update status, priority, staff notes, showcase flag |
| `DELETE` | `/api/feedback/admin/{id}` | Admin Only | Retention purge |

---

## 5. Security & Privacy Controls
1. **Private Audio & Media Isolation**: Audio and uploaded images are never served through unauthenticated or public CDN routes. Endpoints require `require_admin` dependency and set `no-store` headers.
2. **Server-Side Validation**: Request limits, audio duration (max 300s), audio byte size (max 10MB), image size (max 5MB), and text limits (max 2000 chars) are enforced in Pydantic and route handlers.
3. **Spam & Abuse Protection**: Validated against acceptable MIME types. Built-in rate limiting and staff spam toggle.
4. **Data Minimization**: Zero compulsory registration, email, or telephone fields.
5. **No Client Trust**: Client cannot forge user identity, admin flags, or moderation statuses.

---

## 6. Supported Languages & Speech Accessibility
Full typed localization dictionaries are implemented in `frontend-next/src/lib/feedback-i18n.ts`:
- **Hindi (हिंदी)**: "आपकी बात, हमारा सुधार"
- **Kannada (ಕನ್ನಡ)**: "ನಿಮ್ಮ ಧ್ವನಿ ನಮ್ಮ ಬಲ"
- **Tamil (தமிழ்)**: "உங்கள் குரல் முக்கியமானது"
- **Telugu (తెలుగు)**: "మీ అభిప్రాయం ముఖ్యం"
- **Marathi (मराठी)**: "तुमचा आवाज आमची ताकद"
- **Gujarati (ગુજરાતી)**: "તમારો અવાજ મહત્વનો છે"
- **Bengali (বাংলা)**: "আপনার মতামত মূল্যবান"
- **Punjabi (ਪੰਜਾਬੀ)**: "ਤੁਹਾਡੀ ਆਵਾਜ਼ ਮਹੱਤਵਪੂਰਨ ਹੈ"
- **Malayalam (മലയാളം)**: "നിങ്ങളുടെ അഭിപ്രായം വിലപ്പെട്ടതാണ്"
- **English & Hinglish**: Fully supported with automatic fallback to English.

---

## 7. Verification & Test Suite
- **Backend Tests**: `backend/tests/test_farmer_feedback.py` (9 tests passing: anonymous visual submission, voice submission, empty input rejection, unsupported media rejection, quick review, admin authorization enforcement, staff review/patch/delete workflow, and public showcase data sanitation).
- **Regression Tests**: `test_admin.py`, `test_auth.py`, `test_mandi_marketplace_suite.py` passing.
- **Frontend Build**: `next build` compiled with 47 static/dynamic pages verified.
- **ESLint & TypeScript**: Zero errors.
