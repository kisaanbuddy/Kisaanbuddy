# WhatsApp agricultural assistant

This extends the existing Meta Cloud API, Gemini, weather-provider, database and
support-ticket infrastructure. It is not a claim of production certification.

## Implemented paths

- Signed webhook → inbound audit and durable inbox job in one database transaction
  → worker → real Meta message ID. Missing credentials cannot generate mock success.
- Jobs are atomically claimed and ordered per farmer. An expired or interrupted
  claim is held as `needs_review`; subsequent jobs for that farmer wait. A network
  read/write failure is not blindly retried because Meta may already have accepted
  the message. Exactly-once external delivery is not claimed.
- Text and authorized, bounded media downloads feed the shared AI conversation.
  Voice transcription uses the existing speech providers. Transcription failures
  ask for another recording or text. Audio bytes are not saved by this adapter.
- Recent turns and an AI-generated summary are persisted in
  `WhatsAppUser.context_data_json`. Each worker restores the database state.
  Redis is not required for WhatsApp AI continuity. Short/numeric replies stay in
  the discussion; use `menu` or an interactive selection to change services.
- Hindi, English, Hinglish, Bhojpuri, Maithili, Bengali, Marathi, Gujarati, Punjabi,
  Tamil, Telugu, Kannada and Odia are accepted conversation preferences. Script
  detection is heuristic; shared Devanagari does not identify a dialect reliably.
  Fixed menus remain English/Hindi/Kannada and disclose the fallback. These are
  supported request paths, not measured language-quality certifications.
- Photos are securely validated and passed to Gemini for visible-symptom discussion.
  This path does not certify a disease or publish confidence percentages. No
  validated field-disease classifier was supplied for this integration.
- WhatsApp exposes only weather, forecast, scheme and market read tools. Legacy
  unsourced dose/economics tools and write tools cannot be invoked by this channel.

## Configuration and deployment

Use the existing environment settings; never put keys in the repository:

- `DATABASE_URL`: production relational database; back up before migration.
- `JWT_SECRET`: strong stable secret, also used for private conversation keys.
- `DEBUG=false`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`,
  `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` and a supported
  `WHATSAPP_API_VERSION` for your Meta application.
- Optional existing test-number settings preserve test/production sender routing.
- `GEMINI_API_KEY` and existing model settings for text, vision and audio.
- Existing weather provider credentials and `DATA_GOV_API_KEY` for AGMARKNET.
  Do not enable demo weather for real farmer communication.

Run migrations using the deployment's normal environment from `backend`:

```sh
python -m alembic upgrade head
```

Migration `009_whatsapp_durable_inbox` adds the inbox table. Do not downgrade while
jobs are pending: its downgrade drops that table. The FastAPI lifespan starts an
inbox worker when WhatsApp is configured. No separate queue broker is required.
Webhook HTTP success means durable acceptance, not that a reply was delivered.
Configure a supervised application process and alert on pending-job age and review
jobs. Run field/load tests with your actual database and deployment topology.

Admin-authenticated endpoints:

- `GET /api/whatsapp/admin/assistant-status`: configuration, topic coverage and job counts.
- `GET /api/whatsapp/admin/inbox`: jobs needing delivery reconciliation.
- `POST /api/whatsapp/admin/inbox/{id}/resolve?action=delivered|discard|retry`.
  Retry also requires `confirmed_not_delivered=true`. Check Meta delivery logs and
  outbound audit records first. Do not replay a partially delivered conversation
  blindly. Confirm the WhatsApp service window before retrying an old job.

History erasure requires the authenticated phone owner or an administrator and
clears inbox, audit, support, persisted context and this worker's conversation cache.
An actively processing message returns a conflict; retry after processing ends.
Set and implement an organization-approved retention period for backups and logs
before launch; this change does not certify legal compliance or erase backups.

## Knowledge governance

Markdown in `backend/data/knowledge` is eligible only with a matching
`<basename>.source.json` audit sidecar. Required fields:

`source_url`, `publisher`, `title`, `publication_date` (or null with
`publication_date_status: "not_reported"`), `geography`, `topics`, `version`,
`reviewed_by`, `reviewed_at`, `review_expires_at`, `sha256`,
`review_status: "approved"`.

The SHA-256 binds the exact UTF-8 Markdown bytes, not the remote publication.
Review timestamps must include a timezone. Changing text invalidates approval;
expired reviews are excluded even in an already-running process. Restart after
adding/versioning documents so the retrieval index reloads. A URL or an approval
field alone does not establish truth: compare each excerpt with its actual source.
Record who reviewed it and the scope of that review. Do not automatically approve
downloaded documents or infer publication dates from copyright footers.

There are three initial TNAU source-text-reviewed notes: rotation, integrated
nutrient management and organic matter. Their metadata explicitly distinguishes
source comparison from agronomist/field validation. Original notes without review
metadata are excluded. This is a small initial corpus, not comprehensive coverage
of ten agricultural domains. Crop diseases, pest treatment, scheme eligibility and
market knowledge require additional reviewed references. Some official sites were
unavailable during this implementation; their content was not fabricated.

Retrieval uses the existing BM25 index plus real-provider query translation for
regional-language queries. Source excerpts include geographic scope and dates.
No-match results instruct the assistant to disclose missing evidence. Prompts are
followed by a second model-based grounding review before WhatsApp delivery. This
review removes unsupported claims and limits follow-up questions. If review fails,
the draft is removed from memory and the farmer gets an unavailable notice.
Neither this review nor prompts are a mathematical guarantee against hallucination: expert evaluation and
adversarial testing remain necessary before rollout.

## Live evidence policies

Weather comes from existing configured providers, never fabricated defaults.
Observation/retrieval timestamps must be within six hours; demo data is rejected.
Forecast dates are checked separately. Missing rainfall remains unavailable.
These are application freshness cutoffs, not an IMD certification. A live IMD
agromet bulletin integration is not implemented by this change.

Mandi uses the actual data.gov.in AGMARKNET endpoint with commodity and state/market
filters. Reporting dates must be parseable, nonfuture and no more than seven days
old. Nonfinite or inconsistent prices are rejected. Responses preserve market,
state, district, reporting date, retrieval time and source. These are reported
market observations, not seller inventory or guaranteed current transaction prices.

Scheme tools include only official-domain records with review timestamps within
30 days. Seed data cannot substitute a string such as “Verified Official” for a
real review date. An empty result means current scheme information is unavailable.

## Validation and release boundary

Automated tests use explicit test doubles for external providers and isolated
databases. They do not demonstrate live Meta delivery, current API-key validity,
multilingual transcription accuracy, disease-model accuracy or agricultural
correctness across regions. Before production rollout, complete a real Meta
test-number exercise, provider connectivity checks, privacy/retention configuration,
agronomist corpus review and regional-language farmer evaluations.

A real configured-Gemini two-turn Hindi evaluation was also run with temporary
in-memory context and no WhatsApp recipient. It retained the wheat/lower-leaf
context and requested crop age after the grounding-review fix. This is one smoke
test, not a language or agronomy benchmark.

Run the WhatsApp suites plus `test_chatbot_advisor.py` and `test_voice_language.py`.
Set `DATABASE_URL` to an isolated test database, not the production database.
The repository's existing tests create/delete test records.
