# AI and ML Pipelines

This document details the voice assistant, language processing, and plant pathology pipelines.

---

## 🗣️ Voice and Chat Assistant Pipeline

The AI assistant follows an asynchronous tool-calling loop integrated with Server-Sent Events (SSE).

```
[User Input (Audio / Text)]
            |
            v
[Whisper STT (if audio)] --> [Language Detection (Regex + langdetect)]
            |
            v
[ChatOrchestrator] <---> [RAG Knowledge Context (Lightweight Vector Search)]
            |
            v
[LLM Tool Execution Loop (Max 3 Rounds)]
  - get_weather(lat, lon)
  - get_forecast(lat, lon)
  - recommend_crop(soil/weather specs)
  - list_schemes()
            |
            v
[Streaming SSE Response Generator] ---> [TTS Synth (Sarvam/Google/OpenAI)] ---> [Audio playback in browser]
```

### Language Contract
The system prompt contains strict instructions forcing the assistant to reply in the detected language (Hindi/Kannada/English). Transliterated Hinglish and Kanglish keywords are dynamically intercepted to prevent language drift.

---

## 📷 Vision Pathology (Disease Diagnosis)

When a farmer uploads an image of a damaged leaf:
1. The assistant bypasses standard tool calls to avoid distracting context.
2. The model switches to a low temperature (`0.1`) and high token count to ensure deterministic, highly detailed pathological analysis.
3. The response is formatted into a strict, user-friendly 10-section layout, including details on symptoms, pathogen, immediate organic remedies, and chemical spray safety precautions (with PPE warnings).
