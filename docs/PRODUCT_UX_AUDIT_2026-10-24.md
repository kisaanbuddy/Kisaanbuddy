# KisaanBuddy product UX audit

Date: 24 October 2026

## Scope and method

The primary product is the `frontend-next` Next.js 14 application, with FastAPI services in `backend`. The audit reviewed the App Router route map, shared navigation and mobile navigation, typed API clients, Next route handlers, FastAPI routers and schemas, and the key journeys: weather, Crop Doctor, Mandi and crop selling, Worker Connect, government schemes, authentication, profile and voice assistant.

The older `frontend/` static site is retained as a legacy reference and is not the active product surface.

## Product map

| User goal | Primary route | Supporting services | Assessment |
| --- | --- | --- | --- |
| Start a farm task | `/` | Landing action cards, assistant entry | Good action-first entry; retain concise task grid. |
| Inspect weather | `/weather` | `/api/weather/*` | Working typed client, geolocation fallback and forecast views. |
| Screen crop symptoms | `/disease` | `/api/disease/predict`, assistant streaming, advisory cases | Strong upload workflow and escalation paths; trust language needed correction. |
| Discover mandi prices / sell | `/mandi` | Market-price, produce-listing and buyer-requirement APIs | Clear price, buyer and selling areas; listing trust states needed correction. |
| Find or offer farm work | `/worker-connect` | Worker Connect APIs and protected contact workflow | Broad feature coverage; initial screen should continue to lead with search. |
| Find a scheme | `/schemes` | Scheme data and matching service | Good search, checklist and official-link handoff; freshness labels must use source dates. |
| Ask for help | `/chatbot`, global assistant | Chat, STT and TTS services | Streaming and text fallback are present; availability must always reflect actual provider state. |
| Manage a farm | `/dashboard`, `/profile`, `/farmer-profile`, `/khet-diary`, `/soil-health` | Farm, fields, soil and task services | Existing authenticated workflow remains available through the “More tools” navigation. |

## Findings and disposition

### Critical — fixed

1. **Unverified marketplace submissions could declare themselves verified.** The seller and buyer forms sent a verified status, and the API schemas accepted verified values by default. This conflicts with the product requirement that verification must be real.

   **Fix:** fresh produce and buyer requirements are now forced to `self_declared`; consent sharing is `false` until a dedicated verification/consent process changes it. The in-memory Next route store matches this behaviour, and the selling copy now explains that publishing is not verification.

2. **Crop Doctor displayed unsupported accuracy and coverage claims as product facts.** A fixed 95% figure and 120+/30+ claims appeared independently of the currently selected model and input.

   **Fix:** replaced those claims with a visible screening/confirmation notice. Per-result confidence and uncertainty from the actual diagnosis response are preserved.

### High priority — follow-up work

1. **Marketplace fixtures and legacy seed records:** `backend/api/marketplace.py` contains default benchmark listings and initial buyer requirements. They must be tagged as fixtures and excluded from production, or replaced by imported records with provenance, import time and terms. Do not show them as live availability.
2. **Scheme freshness:** the scheme detail view uses a static “Today” freshness label. It should render `verifiedAt` / source-provided timestamps only, and say “date not supplied” otherwise.
3. **Crop treatment guide:** the long static disease guide includes prescription-like chemical rates outside the API’s source/verification path. It should be moved to reviewed, source-attributed content or reduced to a safety-first escalation guide.
4. **Worker Connect density:** the page contains useful worker, job, registration, wage and safety workflows, but its first viewport can still become information-heavy. Keep “Find workers” as the default task and place data-source detail / advanced options behind an expandable panel.

### Medium priority

1. Add reusable loading, error and empty-state primitives to remaining form-heavy routes instead of route-local variants.
2. Replace hard-coded defaults for district/location in listing forms with either required user input or a saved farm profile value.
3. Defer below-the-fold landing sections and large images; the home route includes many feature sections that are valuable but not needed for first task completion.
4. Add an authenticated moderation workflow for marketplace submissions, with audit logging and a distinct `verified` state set only server-side.

### Lower-priority polish

1. Consolidate repeated landing-page showcase components after visual review; several represent older marketing layouts.
2. Prefer source-specific labels such as “Official market-price data” over generic “live” labels when freshness is not supplied.
3. Continue keyboard and screen-reader checks for modal close buttons, error announcements and focus return after every modal route.

## Design-system and interaction assessment

The active product already uses Tailwind tokens, shared buttons/cards/inputs, shared header/footer, a mobile bottom nav, Framer Motion and reusable assistant/weather components. The implementation direction should preserve this system, not introduce a competing component library. The existing palette of deep green, muted off-white surfaces, charcoal text and alert colours matches the brief; the audit recommends using status colours only to communicate real state.

The global navigation maps the main farmer tasks to Home, Crop Doctor, Mandi & selling, Worker Connect and Government Schemes, while retaining secondary authenticated tools. The mobile navigation keeps core task access at thumb reach. Existing routes were retained; none were removed by this audit.

## Verification performed

- Repository and primary route/component map inspected.
- Next.js API handlers and FastAPI marketplace schemas reviewed for the data-trust flow.
- `frontend-next` TypeScript check (`tsc --noEmit`) passes after correcting the existing marketplace navigation setter typo.
- Changed Python modules pass `py_compile`.
- A production build was attempted with the installed Node runtime. It reached Next.js compilation but could not create `frontend-next/.next/server/app/api/mandi` because that existing output directory is locked (`EPERM`). No files were deleted to work around the lock.
- The focused backend marketplace test suite could not initialise because the configured virtual environment is missing Pillow (`ModuleNotFoundError: PIL`), imported by the disease router at FastAPI startup. `pytest` is also not installed in that environment.

## Release checklist

1. Stop the process holding `frontend-next/.next`, then run the production build.
2. Test the disease upload, uncertain-result and expert-escalation journey with the configured backend.
3. Verify official price source/date labels against the import job before presenting a price as current.
4. Submit a seller and buyer listing: confirm they display as self-declared and that masked contact details remain protected.
5. After a real moderation workflow is added, verify only a server-side action can transition a listing to verified.
