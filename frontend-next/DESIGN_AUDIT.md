# KisaanBuddy interface audit

## Scope and product map

The active frontend is the Next.js application in `frontend-next`. The legacy
`frontend` folder is a static prototype and was not altered. All API calls,
authentication helpers, language providers, backend routes, and persisted user
flows remain in place.

| Area | Existing routes | Product purpose |
| --- | --- | --- |
| Public acquisition | `/`, `/about`, `/features`, `/founders`, `/impact`, `/contact` | Explain the platform and route farmers to the right task. |
| Market and operations | `/mandi`, `/marketplace`, `/worker-connect`, `/weather`, `/schemes`, `/crops`, `/crop-predictor` | Check market data, trade, plan work, and make crop decisions. |
| Farm intelligence | `/dashboard`, `/profile`, `/farmer-profile`, `/khet-diary`, `/reports`, `/soil-health`, `/soil-monitor`, `/disease`, `/chatbot`, `/chat` | Manage fields and get AI, crop-health, weather, soil, diary, and reporting support. |
| Account journeys | `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/onboarding`, `/settings` | Authentication, onboarding, and account control. |
| Specialist and admin | `/expert-dashboard`, `/admin` | Expert review and platform administration. |
| Legal | `/privacy`, `/terms`, `/disclaimer`, `/cookie-policy` | Policy and consent information. |

## Shared redesign applied

- Replaced the competing surface values with one calm off-white, charcoal, and
  restrained agricultural-green token set.
- Standardised reusable buttons, cards, form fields, focus rings, panel
  borders, content width, and mobile bottom clearance.
- Made navigation state semantic with `aria-current`, tightened the visual
  rhythm, and removed decorative gradient treatment from the header brand and
  footer.
- Reduced extreme corner radii and visual effects in the homepage hero and
  service cards while retaining real farming imagery and existing routes.
- Kept API-driven loading, error, empty, modal, search, language, session, and
  authentication components intact; no endpoint contracts or data sources were
  changed.

## Page-level redesign progress

Shared styles are not a page redesign. The table below only marks a route as
complete after it receives route-specific implementation and the requested
visual and interaction checks.

| Route / group | Page-specific audit | Implementation | Interaction checks | Visual checks |
| --- | --- | --- | --- | --- |
| `/mandi` | Complete | Complete | Partial: build/type validation complete; browser interaction retest not available | **NOT VERIFIED** after redesign |
| `/marketplace` | Not started | Not started | Not started | Not started |
| `/dashboard` | Not started | Not started | Not started | Not started |
| `/disease` | Not started | Not started | Not started | Not started |
| `/weather` | Not started | Not started | Not started | Not started |
| `/chatbot`, `/chat` | Not started | Not started | Not started | Not started |
| `/profile`, `/farmer-profile` | Not started | Not started | Not started | Not started |
| `/khet-diary`, `/reports` | Not started | Not started | Not started | Not started |
| `/soil-health`, `/soil-monitor` | Not started | Not started | Not started | Not started |
| `/worker-connect`, `/crop-predictor`, `/schemes` | Not started | Not started | Not started | Not started |
| Account, public, legal, admin and expert routes | Not started | Not started | Not started | Not started |

### `/mandi` page-specific changes

- Replaced the marketing hero treatment with a compact operational header and
  a single, data-oriented summary strip.
- Converted the desktop price-card grid to a comparison table with commodity,
  market, modal price, reported range, movement and a direct detail action.
  Cards remain for mobile and tablet widths where table density would hurt
  usability.
- Rebuilt filters with labels, clear state, keyboard-accessible filter pills,
  horizontal mobile scrolling and an explicit zero-result recovery action.
- Made the tab rail horizontal and scrollable instead of turning into a tall
  two-by-two navigation block on narrow screens.
- Reworked price details into sourced price information and market details;
  removed the generated seven-day trend because it was not real historical
  market data.
- Reframed the e-NAM area as a support desk with transparent helpdesk actions;
  it no longer presents a simulated external connection as live trade status.
- Improved alert, loading, error and empty-state hierarchy. Existing buyer,
  seller, procurement, inquiry, report and post-listing modals remain wired to
  their current API functions.

## Verification

- Production compiler: source compilation and TypeScript validation completed
  successfully with Next.js 14.2.3 after the Mandi changes.
- Local route smoke checks returned HTTP 200 for `/`, `/mandi`,
  `/marketplace`, `/disease`, `/weather`, `/login`, `/signup`, `/dashboard`,
  `/chatbot`, and `/worker-connect`.
- `git diff --check` completed without whitespace errors.

## Remaining QA

The Mandi baseline was visually captured and inspected before implementation,
but the in-app browser was then disabled by Work settings before a persistent
after screenshot could be captured. Therefore the before/after screenshot pair
is **NOT AVAILABLE** and all post-redesign viewport checks at 320 px, 375 px,
768 px, 1024 px and 1440 px are **NOT VERIFIED** in this environment. Before
release, run those exact viewports and
exercise the Mandi search, state/category filters, detail drawer, tab changes,
post/inquiry/report modals and e-NAM help links. This is a testing limitation,
not evidence of a build failure.
