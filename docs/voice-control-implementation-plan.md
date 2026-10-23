# KisaanBuddy voice-control implementation plan

## Existing architecture audited

- The Next.js frontend already mounts a reusable assistant widget from the root layout.
- `components/assistant/useSpeech.tsx` provides consent-based microphone capture, browser speech recognition, server STT fallback, browser TTS, and interruption.
- `components/assistant/useAssistant.tsx` persists a conversation session, language, location consent, transcript, and server-sent tool status between routes.
- The FastAPI chat service already has a central, allow-listed tool registry for weather, mandi data, schemes, and agricultural advice. Authentication-aware farmer context is built server-side.
- Existing pages already accept selected voice parameters for weather, mandi, crop prediction, soil health, and the diary. Marketplace did not yet consume voice navigation parameters.

## Delivery plan

1. Expand the client-side, allow-listed navigation registry to cover every existing major route; keep server APIs responsible for live data.
2. Add natural language handling for Hindi, English, Hinglish, and Kannada route commands, language switching, contextual follow-ups, and browser back navigation.
3. Make the assistant available throughout the public application while preserving existing protected-route authentication and server authorization.
4. Connect marketplace voice actions to its existing buyer, sourcing, and sell-listing UI without submitting or publishing anything automatically.
5. Build and type-check the frontend; verify route parsing and link the implementation to the existing real backend tools rather than fabricating results.

## Safety constraints

- The microphone is activated only after a user tap.
- Voice navigation can open or prefill existing UI only. Publishing, sending, or changing data remains behind the existing form confirmation/authentication controls.
- No credentials or API keys are moved to the frontend.
- Live data responses continue to come from the existing backend tools and providers.
