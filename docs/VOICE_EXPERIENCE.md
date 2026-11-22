# Voice experience

The global controller uses the existing Next.js providers, routes, theme tokens,
FastAPI advisor `/api/chat/message`, and translation `/api/translate`.
Navigation, theme selection, page reading and form targeting do not call an LLM.
The existing homepage voice controls share the same engine as the floating panel.

## Technology and availability

- Recognition: feature-detected `SpeechRecognition` / `webkitSpeechRecognition`.
  No application speech API key or paid STT dependency. Browser vendors can send
  audio to their speech service; availability, network access and language support
  vary. HTTPS and explicit user microphone permission are required.
- Optional local-only mode checks `SpeechRecognition.available` and uses
  `processLocally` only with an already installed language pack. It does not silently
  download large models or fall back to remote recognition when local-only fails.
- Output: `SpeechSynthesis`, dynamic `getVoices` / `voiceschanged`, matching device
  language, preferred voice, speed, volume, pause/resume/repeat/stop. Missing voices
  are reported. Only playback preferences are persisted; transcripts are not.
- Language tags offered: Hindi, English, Hindi recognition for Hinglish, Marathi,
  Bengali, Tamil, Telugu, Kannada, Gujarati, Punjabi, Malayalam and experimental
  device-dependent Odia recognition. This is not a claim of tested recognition
  accuracy for every language/browser. Local command grammar emphasizes Hindi,
  English and common Hinglish with selected regional navigation aliases.
- Bhojpuri and Maithili are explicitly unavailable as website language modes.
  Users can choose Hindi themselves; dialect accuracy is not promised. Browser
  speech automatic language identification is not implemented or advertised.
- Website language choices remain the existing locale registry. Odia advisor
  output is explicitly unavailable; it is never silently labelled as Hindi output.

## Interaction and safeguards

Use the floating microphone panel to start recognition, enable foreground hands-free
mode, type commands, read the main page, or select translation mode and a target.
Examples: `Open dashboard`, `मुझे मौसम बताओ`, `डार्क मोड चालू करो`,
`ये पेज पढ़कर सुनाओ`, `मेरा नाम राम कुमार है`, `my village is Patna`.
Natural questions go to the existing advisor and its available data tools. No
fallback market prices, weather readings or answers are invented by the client.
Advisor/translation require configured backend services and internet; these may
have hosting/provider costs and are not advertised as permanently free.

Form filling only targets visible, editable text fields by their labels/name.
Users review the values before saving. A single visible non-sensitive form can
request confirmation; it still goes through native validation and the existing
submit handler. Saving is described as a request, never as confirmed persistence.
Credentials, OTPs and payment fields are excluded; account/security/purchase
submissions are manual. Voice does not call the legacy simulated cart order flow.
Page reading skips forms, navigation, hidden elements and private-marked content,
and is disabled on account/admin pages. Audio is stopped before recognition and
recognition is aborted before playback. Stop, unmount and tab hiding cancel work.
There is no wake word, background listening or automatic permission acquisition.

## Verification

Run `node --test scripts/test-voice.cjs`, `npx tsc --noEmit`, `npm run lint`,
and `npm run build` from `frontend-next`. Tests use controlled browser mocks for
navigation, questions, denied permission, unsupported browsers, duplicate starts,
cancellation, playback isolation and visibility cleanup. They do not verify a
physical microphone, dialect accuracy, production AI answers, SMS delivery,
mobile browser audio permissions, or device-installed voices.

Manual acceptance: allow microphone on a supported desktop/mobile browser; test
Hindi/English commands, theme and language, valid/invalid OTP login, dashboard
refresh, slow/offline API handling, translation pairs, form review/confirmation,
no-speech and permission denial, hands-free stop, and audio playback interruption.
Unavailable providers must show errors rather than demo answers.

### Verification run (2026-11-22)

- 26 voice parser/engine tests passed with controlled browser mocks.
- 26 backend authentication/OTP tests passed against the test setup.
- TypeScript and production Next.js build passed; existing unrelated lint warnings remain.
- Local production browser: first-visit language selection appeared; typed commands
  in the voice panel navigated to weather and switched dark/light themes. No
  console errors were captured during this flow. This does not validate actual
  microphone recognition, mobile audio, production OTP delivery or AI providers.

## Optional self-hosted speech

No additional server model is deployed by this change. whisper.cpp or Vosk may
be evaluated later behind an authenticated bounded-upload endpoint with retention
disabled. They require persistent model storage and an always-running host,
not a short-lived Vercel frontend function. CPU latency must be benchmarked on
the chosen host; compute, RAM, storage and bandwidth are not free by implication.
Vosk lists a 42 MB small Hindi model. Whisper model sizes and memory requirements
vary substantially; budget from the selected model's published requirements.

References checked for this implementation:
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/available_static
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/processLocally
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices
- https://github.com/ggml-org/whisper.cpp
- https://alphacephei.com/vosk/models
