# Crop Doctor implementation status

## Inspected architecture

The production-facing client is Next.js 14 under frontend-next. Disease routes
proxy to a FastAPI backend with SQLAlchemy models and Alembic migrations. Preserve
this architecture; the supplied Supabase-only description does not match this code.
The repository includes Render configuration and a Vercel-oriented frontend.
Actual deployment state must be verified independently of configuration files.

Existing functionality includes photo capture, compression, local PyTorch model
inference, Gemini image fallback, translation/voice infrastructure, advisory cases
and pilot storage. A large Crop Doctor implementation is already present.

## Implemented safety phase

- Require authentication for diagnosis history, detail and feedback; scope farmer
  access to ownership. Associate both prediction endpoints with the current user.
- Forward authentication through the Next.js prediction route and remove its
  independent text fallback that selected an arbitrary disease and treatment.
- Suppress generated confidence, calibration/verification claims, product doses,
  harvest intervals and unverified treatment entries from screening responses.
  This deliberately withholds recommendations until reviewed sources are available.
- Remove the second independent automatic chat diagnosis and show API failures.
- Add cancellation and file-size checks in the client.
- Remove the committed TWOFACTOR_API_KEY value from the Render blueprint.
  The existing exposed credential MUST be rotated by its owner and its replacement
  set in Render. Removing it here does not remove it from Git history or revoke it.
- Make public feedback proxy dynamic with a bounded upstream timeout, avoiding
  a backend dependency during frontend static generation.

## Verification

24 focused backend tests passed, including authorization, advisory, pilot storage
and screening safety. The Next.js production build passed with existing lint warnings.
These checks do not establish agronomic accuracy or live deployment success.

## Remaining work before complete product release

- Persist actual feedback (the old endpoint only acknowledges it), consultation
  answers, image references and follow-up observations with migrations.
- Audit advisory case/image authorization and remove Next.js in-memory example
  cases and simulated referral notifications from real user workflows.
- Verify expert contacts and treatment sources, specific crop/formulation labels,
  provenance, expiry/review dates, and licensing before publishing recommendations.
- Validate model artifacts, crop coverage, calibration and field-domain performance
  against licensed expert-reviewed cases. No accuracy claims are established here.
- Implement contextual questions, consultation chat, complete selected-language
  behavior, optional speech and accessible history/follow-up UI.
- Test real authentication, private uploads, inference and recovery end to end;
  inspect actual hosting environment, deployment logs and live revision.

No production environment variables were changed. This branch is a safety phase,
not a claim that the full product specification has been implemented or deployed.
