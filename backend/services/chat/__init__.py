"""KrishiAI multilingual voice assistant services.

Public entry points:
    chat_service.get_orchestrator()   — ChatOrchestrator singleton
    stt_service.transcribe(audio, lang)
    tts_service.synthesize(text, lang)
    memory.sessions                   — SessionStore singleton
    language_detect.detect_language(text)

Callers (api/chatbot.py) should never touch provider SDKs directly — always
go through these services so we can swap models/providers without touching routes.
"""
