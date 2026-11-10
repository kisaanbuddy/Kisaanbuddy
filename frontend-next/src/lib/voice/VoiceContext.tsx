"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage, type Lang } from "@/lib/language";
import { useTheme } from "next-themes";
import { useCart } from "@/lib/cart/CartContext";
import { ActionRegistry, type VoiceAction, type ActionExecutionContext } from "./ActionRegistry";
import { interpretLocally } from "./LocalVoiceInterpreter";

export interface VisibleItem {
  id: string | number;
  name: string;
  price?: number;
  brand?: string;
  category?: string;
  index: number;
  [key: string]: any;
}

export interface PendingAction {
  type: string;
  payload: any;
  items_count?: number;
  total_amount?: number;
  prompt?: string;
}

interface VoiceContextType {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  continuousMode: boolean;
  audioVolume: number;
  transcriptLive: string;
  lastReply: string;
  currentRoute: string;
  visibleItems: VisibleItem[];
  selectedItem: any | null;
  pendingConfirmation: PendingAction | null;
  audioMuted: boolean;
  isHudOpen: boolean;
  voiceLanguage: string;
  setVoiceLanguage: (lang: string) => void;
  startListening: () => Promise<boolean>;
  stopListening: () => void;
  cancelListening: () => void;
  toggleContinuousMode: () => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  stopAudio: () => void;
  replayAudio: () => void;
  setAudioMuted: (muted: boolean) => void;
  setIsHudOpen: (open: boolean) => void;
  registerVisibleItems: (items: VisibleItem[]) => void;
  registerSelectedItem: (item: any | null) => void;
  sendVoiceCommand: (text: string) => Promise<void>;
  confirmPendingAction: () => Promise<void>;
  cancelPendingAction: () => void;
}

const VoiceContext = createContext<VoiceContextType | null>(null);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const cartCtx = useCart();

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);
  const [transcriptLive, setTranscriptLive] = useState("");
  const [lastReply, setLastReply] = useState("");
  const [visibleItems, setVisibleItems] = useState<VisibleItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingAction | null>(null);
  const [audioMuted, setAudioMuted] = useState(false);
  const [isHudOpen, setIsHudOpen] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState<string>(lang || "hi");

  // Keep voiceLanguage aligned with platform lang
  useEffect(() => {
    if (lang) setVoiceLanguage(lang);
  }, [lang]);

  // Audio References
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const lastAudioUrlRef = useRef<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const isRecognitionActiveRef = useRef(false);
  const silenceTimerRef = useRef<any>(null);
  const hasSpokenInSessionRef = useRef(false);
  const continuousModeRef = useRef(continuousMode);
  continuousModeRef.current = continuousMode;
  const latestTranscriptRef = useRef<string>("");

  // Interruption killer: stops ongoing AI speech instantly
  const killOngoingSpeech = useCallback(() => {
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      } catch {
        /* ignore */
      }
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // Web Audio Analyser for real sound wave & volume
  const stopAudioAnalysis = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch {
        /* ignore */
      }
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioVolume(0);
  }, []);

  const startAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      analyserRef.current = analyser;

      const buffer = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const avg = sum / buffer.length;
        // Normalize 0-100
        const vol = Math.min(100, Math.round((avg / 128) * 100));
        setAudioVolume(vol);

        // Speech Activity Detection: if user speaks loudly while AI is talking, interrupt AI!
        if (vol > 20) {
          hasSpokenInSessionRef.current = true;
          killOngoingSpeech();
        }

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
      return true;
    } catch (e) {
      console.warn("Audio analysis / mic stream error:", e);
      return false;
    }
  }, [killOngoingSpeech]);

  // Context Manager actions
  const registerVisibleItems = useCallback((items: VisibleItem[]) => {
    setVisibleItems(items);
  }, []);

  const registerSelectedItem = useCallback((item: any | null) => {
    setSelectedItem(item);
  }, []);

  // Execution context for Action Registry
  const executionContext: ActionExecutionContext = {
    navigate: (path) => router.push(path),
    goBack: () => {
      if (typeof window !== "undefined") window.history.back();
    },
    setLanguage: (newLang) => {
      setLang(newLang as Lang);
      setVoiceLanguage(newLang);
    },
    setTheme: (newTheme) => setTheme(newTheme),
    cart: {
      addToCart: (it) => cartCtx.addToCart(it),
      removeFromCart: (id) => cartCtx.removeFromCart(id),
      clearCart: () => cartCtx.clearCart(),
      placeOrder: () => cartCtx.placeOrder(),
    },
    openNotifications: () => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("kisaanbuddy:open-notifications"));
      }
    },
  };

  // Play real TTS audio with browser speech synthesis fallback (never blocks site control)
  const playVoiceAudio = useCallback(
    async (base64Audio?: string | null, textFallback?: string) => {
      if (audioMuted) return;

      killOngoingSpeech();

      if (base64Audio) {
        try {
          const audioUrl = `data:audio/wav;base64,${base64Audio}`;
          lastAudioUrlRef.current = audioUrl;
          const audio = new Audio(audioUrl);
          audioPlayerRef.current = audio;

          audio.onplay = () => setIsSpeaking(true);
          audio.onpause = () => setIsSpeaking(false);
          audio.onended = () => {
            setIsSpeaking(false);
            // Continuous conversation: auto-listen after AI response finishes
            if (continuousModeRef.current) {
              setTimeout(() => {
                void triggerStartListening();
              }, 600);
            }
          };
          audio.onerror = () => {
            setIsSpeaking(false);
          };

          await audio.play();
          return;
        } catch (e) {
          // Gracefully continue; user doesn't require audio to control site
          console.warn("Audio base64 playback skipped:", e);
        }
      }

      // Fallback: try fetching from server TTS route, else Web Speech API
      if (textFallback) {
        try {
          const res = await fetch("/api/chat/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: textFallback,
              language: voiceLanguage || "hi",
            }),
          });
          if (res.ok) {
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            lastAudioUrlRef.current = url;
            const audio = new Audio(url);
            audioPlayerRef.current = audio;
            audio.onplay = () => setIsSpeaking(true);
            audio.onended = () => {
              setIsSpeaking(false);
              URL.revokeObjectURL(url);
              if (continuousModeRef.current) {
                setTimeout(() => void triggerStartListening(), 600);
              }
            };
            audio.onerror = () => setIsSpeaking(false);
            await audio.play();
            return;
          }
        } catch {
          // Ignore server TTS error
        }

        // Web Speech API fallback (silent and graceful if unsupported)
        try {
          if (typeof window !== "undefined" && "speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(textFallback);
            utterance.lang = voiceLanguage === "kn" ? "kn-IN" : voiceLanguage === "en" ? "en-IN" : "hi-IN";
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => {
              setIsSpeaking(false);
              if (continuousModeRef.current) {
                setTimeout(() => void triggerStartListening(), 600);
              }
            };
            utterance.onerror = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
          }
        } catch {
          setIsSpeaking(false);
        }
      }
    },
    [audioMuted, killOngoingSpeech, voiceLanguage]
  );

  // Send command to voice OS: Executes instantaneously via local engine + server fallback
  const sendVoiceCommand = useCallback(
    async (transcript: string) => {
      const clean = transcript.trim();
      if (!clean) return;

      setIsProcessing(true);
      setTranscriptLive(clean);

      const pageSnapshot = {
        current_route: pathname || "/",
        visible_items: visibleItems.slice(0, 15),
        selected_item: selectedItem,
        cart_items: cartCtx.cart,
        cart_total: cartCtx.totalAmount,
        pending_action: pendingConfirmation,
      };

      // ─── 1. INSTANT LOCAL EXECUTION (0ms latency, zero server dependency) ───
      const localResult = interpretLocally(clean, pageSnapshot, voiceLanguage);
      if (localResult) {
        setLastReply(localResult.reply_text);

        if (localResult.action.requires_confirmation) {
          setPendingConfirmation({
            type: localResult.action.payload?.action_to_confirm || localResult.action.action_type,
            payload: localResult.action.payload,
            total_amount: localResult.action.payload?.total_amount || 0,
            prompt: localResult.reply_text,
          });
        } else {
          setPendingConfirmation(null);
          // Execute website action immediately!
          ActionRegistry.execute(localResult.action, executionContext);
        }

        setIsProcessing(false);

        // Optional non-blocking audio output
        if (!audioMuted) {
          void playVoiceAudio(null, localResult.reply_text);
        }
        return;
      }

      // ─── 2. SERVER INTERPRETATION (Complex NLP & conversational queries) ───
      try {
        const payload = {
          transcript: clean,
          page_context: pageSnapshot,
          language: voiceLanguage,
          want_audio: !audioMuted,
        };

        const res = await fetch("/api/voice/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(`Voice server error: HTTP ${res.status}`);
        }

        const data = await res.json();
        setLastReply(data.reply_text || "");

        // Check if action requires confirmation
        if (data.action?.requires_confirmation && data.pending_action) {
          setPendingConfirmation(data.pending_action);
        } else {
          setPendingConfirmation(null);
          // Execute Safe Action immediately
          if (data.action && data.action.action_type !== "NOOP") {
            ActionRegistry.execute(data.action as VoiceAction, executionContext);
          }
        }

        // Play real audio reply non-blockingly
        if (!audioMuted && data.reply_text) {
          void playVoiceAudio(data.reply_audio_base64, data.reply_text);
        }
      } catch (err: any) {
        console.warn("Voice command server interpretation error:", err);
        const fallbackMsg =
          voiceLanguage === "kn"
            ? "ಮಾರುಕಟ್ಟೆ, ಮಂಡಿ ದರ, ಅಥವಾ ಹವಾಮಾನ ನೋಡಲು ನೀವು ಆಜ್ಞೆ ನೀಡಬಹುದು."
            : voiceLanguage === "en"
            ? "You can speak to control the site: 'Open marketplace', 'Mandi prices', or 'Weather'."
            : "वेबसाइट कंट्रोल करने के लिए बोलें: 'मार्केटप्लेस खोलो', 'मंडी भाव', 'मौसम', या 'डार्क मोड'।";
        setLastReply(fallbackMsg);
      } finally {
        setIsProcessing(false);
      }
    },
    [
      pathname,
      visibleItems,
      selectedItem,
      cartCtx.cart,
      cartCtx.totalAmount,
      pendingConfirmation,
      voiceLanguage,
      audioMuted,
      executionContext,
      playVoiceAudio,
    ]
  );

  // Manual Confirmation trigger
  const confirmPendingAction = useCallback(async () => {
    if (!pendingConfirmation) return;
    await sendVoiceCommand("हां, कन्फर्म करो");
  }, [pendingConfirmation, sendVoiceCommand]);

  const cancelPendingAction = useCallback(() => {
    setPendingConfirmation(null);
    setLastReply("कार्य रद्द कर दिया गया है।");
  }, []);

  // Web Speech API / Browser STT Setup with automatic endpointing
  const triggerStartListening = useCallback(async (): Promise<boolean> => {
    killOngoingSpeech();
    setIsHudOpen(true);
    setTranscriptLive("");
    latestTranscriptRef.current = "";
    hasSpokenInSessionRef.current = false;

    // Start mic volume analysis
    const micOk = await startAudioAnalysis();
    if (!micOk) {
      setIsListening(false);
      setLastReply(
        voiceLanguage === "kn"
          ? "ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ದೊರೆತಿಲ್ಲ. ದಯವಿಟ್ಟು ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ ಮೈಕ್ ಆನ್ ಮಾಡಿ."
          : voiceLanguage === "en"
          ? "Microphone access denied. Please enable microphone permissions in your browser."
          : "माइक्रोफ़ोन की अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग्स में माइक की अनुमति दें।"
      );
      return false;
    }

    if (typeof window === "undefined") return false;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      console.warn("Web Speech API not supported on this browser.");
      setIsListening(false);
      setLastReply(
        voiceLanguage === "kn"
          ? "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು Chrome ಅಥವಾ Edge ಬಳಸಿ."
          : voiceLanguage === "en"
          ? "Voice speech recognition is not supported in this browser. Please use Chrome or Edge."
          : "इस ब्राउज़र में वॉइस स्पीच रिकग्निशन समर्थित नहीं है। कृपया Chrome या Edge का उपयोग करें।"
      );
      return false;
    }

    try {
      if (recognitionRef.current && isRecognitionActiveRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          /* ignore */
        }
      }

      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      // Select BCP-47 language tag
      const langTag =
        voiceLanguage === "kn"
          ? "kn-IN"
          : voiceLanguage === "en"
          ? "en-IN"
          : "hi-IN";
      rec.lang = langTag;

      rec.onstart = () => {
        isRecognitionActiveRef.current = true;
        setIsListening(true);
      };

      let finalSoFar = "";

      rec.onresult = (ev: any) => {
        let interim = "";
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const res = ev.results[i];
          const text = res[0]?.transcript || "";
          if (res.isFinal) {
            finalSoFar += " " + text;
          } else {
            interim += " " + text;
          }
        }
        const currentDisplay = (finalSoFar + " " + interim).trim();
        latestTranscriptRef.current = currentDisplay;
        setTranscriptLive(currentDisplay);

        // Natural pause detection: reset timer when user pauses speaking for > 1.4s
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (currentDisplay.length > 2) {
          silenceTimerRef.current = setTimeout(() => {
            try {
              rec.stop();
            } catch {
              /* ignore */
            }
          }, 1400);
        }
      };

      rec.onerror = (ev: any) => {
        if (ev.error !== "no-speech" && ev.error !== "aborted") {
          console.warn("Speech recognition error:", ev.error);
        }
      };

      rec.onend = () => {
        isRecognitionActiveRef.current = false;
        setIsListening(false);
        stopAudioAnalysis();
        const textToCommit = (finalSoFar.trim() || latestTranscriptRef.current || "").trim();
        latestTranscriptRef.current = "";
        if (textToCommit) {
          void sendVoiceCommand(textToCommit);
        }
      };

      recognitionRef.current = rec;
      rec.start();
      return true;
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
      setIsListening(false);
      stopAudioAnalysis();
      return false;
    }
  }, [killOngoingSpeech, startAudioAnalysis, voiceLanguage, stopAudioAnalysis, sendVoiceCommand]);

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current && isRecognitionActiveRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* ignore */
      }
    }
    setIsListening(false);
    stopAudioAnalysis();
  }, [stopAudioAnalysis]);

  const cancelListening = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        /* ignore */
      }
    }
    isRecognitionActiveRef.current = false;
    setIsListening(false);
    setTranscriptLive("");
    stopAudioAnalysis();
  }, [stopAudioAnalysis]);

  const toggleContinuousMode = useCallback(() => {
    setContinuousMode((prev) => !prev);
  }, []);

  // Audio Playback Controls
  const pauseAudio = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsSpeaking(false);
    }
  }, []);

  const resumeAudio = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.play().catch(() => {});
      setIsSpeaking(true);
    }
  }, []);

  const stopAudio = useCallback(() => {
    killOngoingSpeech();
  }, [killOngoingSpeech]);

  const replayAudio = useCallback(() => {
    if (lastAudioUrlRef.current) {
      killOngoingSpeech();
      const audio = new Audio(lastAudioUrlRef.current);
      audioPlayerRef.current = audio;
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.play().catch(() => {});
    } else if (lastReply) {
      void playVoiceAudio(null, lastReply);
    }
  }, [killOngoingSpeech, lastReply, playVoiceAudio]);

  // Global event bridge: listen for 'kisaanbuddy:open-voice' from any button or chip on the website
  useEffect(() => {
    const handleOpenVoice = (e: Event) => {
      const customEvent = e as CustomEvent<{ initialQuery?: string; autoStart?: boolean }>;
      setIsHudOpen(true);
      if (customEvent.detail?.initialQuery) {
        const q = customEvent.detail.initialQuery.trim();
        latestTranscriptRef.current = q;
        setTranscriptLive(q);
        void sendVoiceCommand(q);
      } else {
        void triggerStartListening();
      }
    };

    window.addEventListener("kisaanbuddy:open-voice", handleOpenVoice);
    return () => window.removeEventListener("kisaanbuddy:open-voice", handleOpenVoice);
  }, [sendVoiceCommand, triggerStartListening]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cancelListening();
      killOngoingSpeech();
    };
  }, [cancelListening, killOngoingSpeech]);

  return (
    <VoiceContext.Provider
      value={{
        isListening,
        isProcessing,
        isSpeaking,
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
        startListening: triggerStartListening,
        stopListening,
        cancelListening,
        toggleContinuousMode,
        pauseAudio,
        resumeAudio,
        stopAudio,
        replayAudio,
        setAudioMuted,
        setIsHudOpen,
        registerVisibleItems,
        registerSelectedItem,
        sendVoiceCommand,
        confirmPendingAction,
        cancelPendingAction,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const ctx = useContext(VoiceContext);
  if (!ctx) {
    throw new Error("useVoice must be used within a VoiceProvider");
  }
  return ctx;
}
