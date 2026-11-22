"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage, LANG_NAMES, type Lang } from "@/lib/language";
import { useTheme } from "next-themes";
import { parseCommand, VOICE_LANGUAGES } from "./commands";
import { fillField, findField, readablePage, safeFields } from "./pageAccess";

export interface VisibleItem {
  id: string | number;
  name: string;
  index: number;
  [key: string]: any;
}
export interface PendingAction {
  type: string;
  payload: any;
  prompt?: string;
  total_amount?: number;
}
type Phase =
  | "idle"
  | "listening"
  | "processing"
  | "executing"
  | "speaking"
  | "paused"
  | "error";
const VoiceContext = createContext<ReturnType<typeof useVoiceEngine> | null>(
  null,
);

function useVoiceEngine() {
  const router = useRouter(),
    pathname = usePathname();
  const { lang, setLang, openLanguageModal } = useLanguage();
  const { setTheme } = useTheme();
  const [phase, setPhase] = useState<Phase>("idle");
  const [continuousMode, setContinuousMode] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);
  const [transcriptLive, setTranscriptLive] = useState("");
  const [lastReply, setLastReply] = useState("");
  const [error, setError] = useState("");
  const [isHudOpen, setIsHudOpen] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState<string>(lang);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState("");
  const [rate, setRate] = useState(0.95),
    [volume, setVolume] = useState(1);
  const [localOnly, setLocalOnly] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [localSupported, setLocalSupported] = useState(false);
  const [visibleItems, registerVisibleItems] = useState<VisibleItem[]>([]);
  const [selectedItem, registerSelectedItem] = useState<any>(null);
  const [pendingConfirmation, setPendingConfirmation] =
    useState<PendingAction | null>(null);
  const [translationTarget, setTranslationTarget] = useState("hi");
  const [mode, setMode] = useState<"command" | "translate">("command");
  const [translatedText, setTranslatedText] = useState("");
  const rec = useRef<any>(null),
    stream = useRef<MediaStream | null>(null),
    audio = useRef<AudioContext | null>(null);
  const frame = useRef(0),
    timer = useRef<ReturnType<typeof setTimeout>>();
  const restart = useRef<ReturnType<typeof setTimeout>>();
  const operation = useRef(0),
    request = useRef<AbortController | null>(null),
    continuous = useRef(false);
  const alive = useRef(true),
    starting = useRef(false),
    busy = useRef(false);
  const speech = useRef<SpeechSynthesisUtterance | null>(null);
  const pendingForm = useRef<HTMLFormElement | null>(null);
  const latest = useRef({
    start: async () => false,
    send: async (_text: string) => {},
    stop: () => {},
  });
  const hi = voiceLanguage === "hi" || voiceLanguage === "hi_en";
  const say = (en: string, hindi: string) => (hi ? hindi : en);
  const tag =
    (VOICE_LANGUAGES as Record<string, readonly string[]>)[
      voiceLanguage
    ]?.[1] || "hi-IN";

  function cleanupMic() {
    clearTimeout(timer.current);
    cancelAnimationFrame(frame.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    void audio.current?.close().catch(() => {});
    audio.current = null;
    if (alive.current) setAudioVolume(0);
  }
  function cancelListening() {
    starting.current = false;
    const current = rec.current;
    rec.current = null;
    if (current) {
      current.onend = null;
      current.onresult = null;
      current.onerror = null;
      try {
        current.abort();
      } catch {}
    }
    cleanupMic();
    if (alive.current) setPhase("idle");
  }
  function stopAudio() {
    clearTimeout(restart.current);
    if (speech.current) {
      speech.current.onend = null;
      speech.current.onerror = null;
    }
    speech.current = null;
    window.speechSynthesis?.cancel();
    setPhase("idle");
  }
  function stopAll() {
    operation.current++;
    request.current?.abort();
    busy.current = false;
    continuous.current = false;
    setContinuousMode(false);
    cancelListening();
    stopAudio();
    pendingForm.current = null;
    setPendingConfirmation(null);
  }
  function fail(message: string) {
    continuous.current = false;
    setContinuousMode(false);
    cancelListening();
    setError(message);
    setPhase("error");
  }
  function resumeListening() {
    if (continuous.current && !document.hidden)
      restart.current = setTimeout(() => void latest.current.start(), 700);
  }
  function speak(text: string, language = tag) {
    cancelListening();
    stopAudio();
    if (audioMuted || !text) {
      resumeListening();
      return;
    }
    if (!window.speechSynthesis) {
      setError(
        "Speech playback is unavailable; the response is displayed below.",
      );
      return;
    }
    const available = window.speechSynthesis.getVoices();
    const compatible = available.filter(
      (v) =>
        v.lang.toLowerCase().split("-")[0] ===
        language.toLowerCase().split("-")[0],
    );
    const voice =
      compatible.find((v) => v.voiceURI === voiceURI) ||
      compatible.find((v) => v.localService) ||
      compatible[0];
    if (!voice) {
      setError(
        `No ${language} voice is installed on this device. Read the text response or choose another language.`,
      );
      return;
    }
    // Chunk long page readings; some mobile engines stop on long utterances.
    const chunks = text.match(/.{1,220}(?:\s|$)|.{1,220}/g) || [text];
    const id = operation.current;
    const play = (index: number) => {
      if (id !== operation.current || !alive.current) return;
      if (index >= chunks.length) {
        setPhase("idle");
        resumeListening();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      speech.current = utterance;
      utterance.voice = voice;
      utterance.lang = language;
      utterance.rate = rate;
      utterance.volume = volume;
      utterance.onstart = () => setPhase("speaking");
      utterance.onend = () => play(index + 1);
      utterance.onerror = () => {
        speech.current = null;
        fail(
          "Speech playback was interrupted. You can read or replay the response.",
        );
      };
      window.speechSynthesis.speak(utterance);
    };
    play(0);
  }
  function reply(text: string, language?: string) {
    setLastReply(text);
    speak(text, language);
  }
  function cancelPendingAction() {
    pendingForm.current = null;
    setPendingConfirmation(null);
    reply(say("Cancelled.", "रद्द कर दिया।"));
  }
  async function confirmPendingAction() {
    const form = pendingForm.current;
    pendingForm.current = null;
    setPendingConfirmation(null);
    if (!form?.isConnected || !form.checkValidity()) {
      fail(
        say(
          "Review the form and complete required fields before saving.",
          "फॉर्म में जरूरी जानकारी भरें और जांचें।",
        ),
      );
      return;
    }
    form.requestSubmit();
    reply(
      say(
        "Save requested. Check the form for its result.",
        "सेव करने का अनुरोध भेजा। परिणाम फॉर्म पर देखें।",
      ),
    );
  }
  async function sendVoiceCommand(text: string) {
    const clean = text.trim().slice(0, 4000);
    if (!clean) return;
    const command = parseCommand(clean);
    if (command?.type === "cancel") {
      stopAll();
      setLastReply(say("Stopped.", "बंद कर दिया।"));
      return;
    }
    if (command?.type === "pause") {
      window.speechSynthesis?.pause();
      setPhase("paused");
      return;
    }
    if (command?.type === "resume") {
      window.speechSynthesis?.resume();
      setPhase("speaking");
      return;
    }
    if (busy.current) return;
    cancelListening();
    stopAudio();
    busy.current = true;
    const id = ++operation.current;
    setError("");
    setIsHudOpen(true);
    setTranscriptLive(clean);
    setPhase("processing");
    try {
      if (mode === "translate") {
        if (voiceLanguage === "hi_en")
          throw Error(
            "Choose Hindi or English as the translation source; mixed-language translation cannot be guaranteed.",
          );
        if (voiceLanguage === translationTarget) {
          setTranslatedText(clean);
          reply(clean);
          return;
        }
        const result = await api("/api/translate", {
          text: clean,
          source_language: voiceLanguage,
          target_language: translationTarget,
          protect_glossary: true,
          use_cache: false,
        });
        if (id !== operation.current) return;
        if (
          !result.translated_text ||
          /fallback|unavailable|identity/i.test(result.provider || "")
        )
          throw Error("Translation is unavailable for this language pair.");
        setTranslatedText(result.translated_text);
        reply(
          result.translated_text,
          (VOICE_LANGUAGES as any)[translationTarget]?.[1],
        );
        return;
      }
      if (command) {
        setPhase("executing");
        switch (command.type) {
          case "confirm":
            if (pendingForm.current) await confirmPendingAction();
            else
              reply(
                say(
                  "There is no pending form to confirm.",
                  "पुष्टि के लिए कोई फॉर्म नहीं है।",
                ),
              );
            return;
          case "repeat":
            speak(lastReply);
            return;
          case "navigate":
            router.push(command.value!);
            reply(
              say(
                "Opening the requested page. Sign in if required.",
                "पेज खोल रहे हैं। जरूरत हो तो लॉगिन करें।",
              ),
            );
            return;
          case "back":
            router.back();
            reply(say("Going to the previous page.", "पिछले पेज पर जा रहे हैं।"));
            return;
          case "theme":
            setTheme(command.value!);
            reply(
              say(
                `Switching to ${command.value} mode.`,
                `${command.value === "dark" ? "डार्क" : "लाइट"} मोड लगा रहे हैं।`,
              ),
            );
            return;
          case "language":
            if (!command.value) {
              openLanguageModal();
              reply(say("Choose a website language.", "वेबसाइट की भाषा चुनें।"));
              return;
            }
            if (!(command.value in LANG_NAMES)) {
              reply(
                say(
                  "This website language is not available. You can use Hindi or select a supported language.",
                  "यह भाषा अभी उपलब्ध नहीं है। हिन्दी या दूसरी उपलब्ध भाषा चुनें।",
                ),
              );
              return;
            }
            setLang(command.value as Lang);
            setVoiceLanguage(command.value);
            setLastReply("Language selection updated.");
            setPhase("idle");
            return;
          case "read": {
            if (
              /^\/(login|signup|admin|settings|profile|farmer-profile)(\/|$)/.test(
                pathname || "",
              )
            ) {
              reply(
                say(
                  "Page reading is disabled here to protect account information.",
                  "खाते की जानकारी की सुरक्षा के लिए यहां पेज पढ़ना बंद है।",
                ),
              );
              return;
            }
            const content = readablePage();
            if (!content) throw Error("No readable main content is available.");
            reply(content);
            return;
          }
          case "fill": {
            const field = findField(command.field!);
            if (!field)
              throw Error(
                "No matching editable field is visible. Open the appropriate form first.",
              );
            fillField(field, command.value!);
            reply(
              say(
                "Field filled. Please check it before saving.",
                "जानकारी भर दी। सेव करने से पहले जांच लें।",
              ),
            );
            return;
          }
          case "next-field": {
            const fields = safeFields();
            if (!fields.length)
              throw Error("No editable field is visible on this page.");
            const index = fields.indexOf(
              document.activeElement as HTMLInputElement,
            );
            fields[(index + 1) % fields.length]?.focus();
            reply(
              say(
                "Moving to the next available field.",
                "अगले उपलब्ध फील्ड पर जा रहे हैं।",
              ),
            );
            return;
          }
          case "submit": {
            if (
              /^\/(login|signup|admin|settings|orders|reset-password)/.test(
                pathname || "",
              )
            )
              throw Error(
                "Use the form controls for account, security, and purchase actions.",
              );
            const forms = Array.from(
              document.querySelectorAll<HTMLFormElement>("main form"),
            ).filter((f) => f.getClientRects().length > 0);
            if (forms.length !== 1)
              throw Error(
                "Select the form and use its save button; multiple or no forms are visible.",
              );
            if (
              forms[0].querySelector(
                'input[type="password"],input[autocomplete="one-time-code"],input[autocomplete^="cc-"]',
              )
            )
              throw Error(
                "Use the secure form controls to submit credentials or payment details.",
              );
            pendingForm.current = forms[0];
            setPendingConfirmation({
              type: "SUBMIT_FORM",
              payload: {},
              prompt: say(
                "Review all fields. Say confirm or cancel before submitting.",
                "सारी जानकारी जांचें। जमा करने के लिए हाँ या रद्द बोलें।",
              ),
            });
            reply(
              say(
                "Review the form. Confirm to submit, or cancel.",
                "फॉर्म जांचें। जमा करने के लिए हाँ बोलें, या रद्द करें।",
              ),
            );
            return;
          }
        }
      }
      if (
        /^\/(login|signup|reset-password|forgot-password)/.test(pathname || "")
      )
        throw Error(
          "For privacy, use voice navigation here; enter credentials with the secure form controls.",
        );
      if (voiceLanguage === "or")
        throw Error(
          "Odia advisor output is not enabled here. Select Hindi or another supported advisor language.",
        );
      const data = await api("/api/chat/message", {
        message: clean,
        language: voiceLanguage,
        stream: false,
        session_id: session.current || undefined,
      });
      if (id !== operation.current) return;
      if (typeof data.content !== "string" || !data.content.trim())
        throw Error("The agricultural advisor did not return an answer.");
      session.current = data.session_id;
      reply(data.content);
    } catch (e) {
      if (id === operation.current)
        fail(
          e instanceof Error
            ? e.message
            : "Unable to complete this request. Please try again.",
        );
    } finally {
      if (id === operation.current) {
        busy.current = false;
        setPhase((p) => (p === "processing" || p === "executing" ? "idle" : p));
      }
    }
  }
  const session = useRef<string>();
  async function api(url: string, body: unknown) {
    const ctrl = new AbortController();
    request.current = ctrl;
    const timeout = setTimeout(() => ctrl.abort(), 30000);
    try {
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      if (!res.ok)
        throw Error(
          res.status === 401
            ? "Please sign in to continue."
            : `Service unavailable (${res.status}). Please try again; local navigation still works.`,
        );
      return await res.json();
    } finally {
      clearTimeout(timeout);
      if (request.current === ctrl) request.current = null;
    }
  }
  async function startListening(): Promise<boolean> {
    if (starting.current || rec.current || busy.current) return false;
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setIsHudOpen(true);
    setError("");
    if (!window.isSecureContext || !SR) {
      fail(
        say(
          "Voice recognition needs HTTPS and a compatible browser. Type a command below.",
          "वॉइस के लिए सुरक्षित HTTPS और समर्थित ब्राउज़र चाहिए। नीचे कमांड लिख सकते हैं।",
        ),
      );
      return false;
    }
    starting.current = true;
    stopAudio();
    const id = ++operation.current;
    try {
      const recognition = new SR();
      rec.current = recognition;
      recognition.lang = tag;
      recognition.interimResults = true;
      recognition.continuous = false;
      if (localOnly) {
        if (!SR.available || !("processLocally" in recognition))
          throw Error("On-device recognition is unavailable in this browser.");
        if (
          (await SR.available({ langs: [tag], processLocally: true })) !==
          "available"
        )
          throw Error(
            "No installed on-device pack for this language. Choose browser recognition or install a language pack in your browser.",
          );
        recognition.processLocally = true;
      }
      if (id !== operation.current) return false;
      let finalText = "";
      let failed = false;
      recognition.onstart = () => {
        if (id === operation.current) {
          starting.current = false;
          setPhase("listening");
        }
      };
      recognition.onresult = (event: any) => {
        if (id !== operation.current) return;
        let interim = "";
        finalText = "";
        for (let i = 0; i < event.results.length; i++) {
          const part = event.results[i][0]?.transcript || "";
          if (event.results[i].isFinal) finalText += part + " ";
          else interim += part;
        }
        setTranscriptLive((finalText + interim).trim());
      };
      recognition.onerror = (event: any) => {
        if (id !== operation.current) return;
        failed = true;
        const messages: Record<string, string> = {
          "not-allowed":
            "Microphone permission required. Allow it in browser settings, then press the microphone again.",
          "audio-capture": "No microphone is available.",
          network:
            "Speech recognition network connection failed. Try again or type below.",
          "no-speech":
            "No speech detected. Press the microphone and try again.",
          "language-not-supported":
            "Recognition for this language is unavailable. Choose another language.",
        };
        fail(
          messages[event.error] ||
            "Speech recognition was interrupted. Press the microphone to retry.",
        );
      };
      recognition.onend = () => {
        if (id !== operation.current) return;
        rec.current = null;
        starting.current = false;
        cleanupMic();
        if (!failed && finalText.trim())
          void latest.current.send(finalText.trim());
        else if (!failed) {
          setPhase("idle");
          continuous.current = false;
          setContinuousMode(false);
          setError("No final speech result. Please try again.");
        }
      };
      setTranscriptLive("");
      recognition.start();
      timer.current = setTimeout(() => {
        if (id === operation.current) {
          try {
            recognition.stop();
          } catch {
            cancelListening();
          }
        }
      }, 20000);
      // Meter is optional: recognition must not depend on a second audio stream.
      if (navigator.mediaDevices?.getUserMedia)
        void navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((media) => {
            if (id !== operation.current || rec.current !== recognition) {
              media.getTracks().forEach((t) => t.stop());
              return;
            }
            stream.current = media;
            const ctx = new AudioContext();
            audio.current = ctx;
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            ctx.createMediaStreamSource(media).connect(analyser);
            const bytes = new Uint8Array(128);
            const tick = () => {
              analyser.getByteTimeDomainData(bytes);
              let sum = 0;
              for (let i = 0; i < bytes.length; i++)
                sum += (bytes[i] - 128) ** 2;
              setAudioVolume(Math.min(100, Math.sqrt(sum / bytes.length) * 4));
              frame.current = requestAnimationFrame(tick);
            };
            tick();
          })
          .catch(() => {});
      return true;
    } catch (e) {
      cancelListening();
      fail(e instanceof Error ? e.message : "Microphone could not start.");
      return false;
    }
  }
  latest.current = {
    start: startListening,
    send: sendVoiceCommand,
    stop: stopAll,
  };
  useEffect(() => {
    setVoiceLanguage(lang);
  }, [lang]);
  useEffect(() => {
    alive.current = true;
    try {
      const saved = JSON.parse(
        localStorage.getItem("kb_voice_preferences") || "null",
      );
      if (saved) {
        if (typeof saved.voiceURI === "string") setVoiceURI(saved.voiceURI);
        if (Number.isFinite(saved.rate))
          setRate(Math.min(1.4, Math.max(0.6, saved.rate)));
        if (Number.isFinite(saved.volume))
          setVolume(Math.min(1, Math.max(0, saved.volume)));
      }
    } catch {}
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setRecognitionSupported(!!SR);
    setLocalSupported(!!SR?.available);
    const update = () => setVoices(window.speechSynthesis?.getVoices() || []);
    update();
    window.speechSynthesis?.addEventListener("voiceschanged", update);
    const open = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setIsHudOpen(true);
      if (detail?.initialQuery) void latest.current.send(detail.initialQuery);
      else if (detail?.autoStart) void latest.current.start();
    };
    const hidden = () => {
      if (document.hidden) latest.current.stop();
    };
    window.addEventListener("kisaanbuddy:open-voice", open);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      alive.current = false;
      latest.current.stop();
      window.removeEventListener("kisaanbuddy:open-voice", open);
      document.removeEventListener("visibilitychange", hidden);
      window.speechSynthesis?.removeEventListener("voiceschanged", update);
    };
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(
        "kb_voice_preferences",
        JSON.stringify({ voiceURI, rate, volume }),
      );
    } catch {}
  }, [voiceURI, rate, volume]);
  useEffect(() => {
    pendingForm.current = null;
    setPendingConfirmation(null);
    registerVisibleItems([]);
    registerSelectedItem(null);
  }, [pathname]);
  return {
    phase,
    error,
    recognitionSupported,
    localSupported,
    localOnly,
    setLocalOnly,
    voices,
    voiceURI,
    setVoiceURI,
    rate,
    setRate,
    volume,
    setVolume,
    mode,
    setMode,
    translationTarget,
    setTranslationTarget,
    translatedText,
    isListening: phase === "listening",
    isProcessing: phase === "processing" || phase === "executing",
    isSpeaking: phase === "speaking",
    continuousMode,
    audioVolume,
    transcriptLive,
    lastReply,
    currentRoute: pathname || "/",
    visibleItems,
    selectedItem,
    pendingConfirmation,
    audioMuted,
    isHudOpen,
    voiceLanguage,
    setVoiceLanguage,
    setAudioMuted,
    setIsHudOpen,
    registerVisibleItems,
    registerSelectedItem,
    sendVoiceCommand,
    startListening,
    stopListening: () => {
      try {
        rec.current?.stop();
      } catch {
        cancelListening();
      }
    },
    cancelListening: stopAll,
    stopAll,
    toggleContinuousMode: () => {
      continuous.current = !continuous.current;
      setContinuousMode(continuous.current);
      if (continuous.current) void startListening();
      else stopAll();
    },
    pauseAudio: () => {
      if (!window.speechSynthesis?.speaking) return;
      window.speechSynthesis?.pause();
      setPhase("paused");
    },
    resumeAudio: () => {
      if (!window.speechSynthesis?.paused) return;
      window.speechSynthesis?.resume();
      setPhase("speaking");
    },
    stopAudio,
    replayAudio: () => speak(lastReply),
    confirmPendingAction,
    cancelPendingAction,
  };
}
export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const value = useVoiceEngine();
  return (
    <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>
  );
}
export function useVoice() {
  const value = useContext(VoiceContext);
  if (!value) throw Error("useVoice must be used within VoiceProvider");
  return value;
}
