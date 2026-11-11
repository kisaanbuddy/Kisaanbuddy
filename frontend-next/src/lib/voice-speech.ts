/**
 * Multilingual Voice AI Engine for KisaanBuddy.
 *
 * Provides:
 * - Low-latency client Speech-To-Text (Web Speech API) with regional accents
 * - Resilient server-side audio recording & STT fallback (/api/chat/stt)
 * - Authentic neural Text-To-Speech with local caching (/api/chat/tts) + browser fallback
 * - Interruptible playback controls
 */

export type VoiceLanguage =
  | "auto"
  | "hi"
  | "kn"
  | "te"
  | "ta"
  | "mr"
  | "bn"
  | "gu"
  | "pa"
  | "ml"
  | "en"
  | "hi_en";

export interface VoiceLangMeta {
  code: VoiceLanguage;
  label: string;
  nativeLabel: string;
  bcp47: string;
  ttsVoiceName?: string;
  welcome: string;
  placeholder: string;
}

export const SUPPORTED_VOICE_LANGUAGES: Record<VoiceLanguage, VoiceLangMeta> = {
  auto: {
    code: "auto",
    label: "Auto-Detect",
    nativeLabel: "स्वचालित (Auto)",
    bcp47: "hi-IN",
    welcome: "नमस्ते! Speak naturally in Hindi, Kannada, Telugu, Tamil, Marathi, Bengali, or English.",
    placeholder: "माइक दबाकर बोलें या सवाल टाइप करें..."
  },
  hi: {
    code: "hi",
    label: "Hindi",
    nativeLabel: "हिन्दी (Hindi)",
    bcp47: "hi-IN",
    welcome: "नमस्ते! मैं आपका किसान मित्र एआई सहायक हूँ। अपनी फसल, रोग या योजना के बारे में बोलकर पूछें।",
    placeholder: "बोलने के लिए माइक दबाएं..."
  },
  kn: {
    code: "kn",
    label: "Kannada",
    nativeLabel: "ಕನ್ನಡ (Kannada)",
    bcp47: "kn-IN",
    welcome: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕಿಸಾನ್ ಮಿತ್ರ ಎಐ ಸಹಾಯಕ. ನಿಮ್ಮ ಬೆಳೆ, ರೋಗ ಅಥವಾ ಯೋಜನೆ ಬಗ್ಗೆ ಮಾತನಾಡಿ.",
    placeholder: "ಮಾತನಾಡಲು ಮೈಕ್ರೋಫೋನ್ ಒತ್ತಿರಿ..."
  },
  te: {
    code: "te",
    label: "Telugu",
    nativeLabel: "తెలుగు (Telugu)",
    bcp47: "te-IN",
    welcome: "నమస్తే! నేను మీ కిసాన్ మిత్ర AI సహాయకుడిని. మీ పంట, తెగులు లేదా పథకాల గురించి మాట్లాడండి.",
    placeholder: "మాట్లాడటానికి మైక్రోఫోన్ నొక్కండి..."
  },
  ta: {
    code: "ta",
    label: "Tamil",
    nativeLabel: "தமிழ் (Tamil)",
    bcp47: "ta-IN",
    welcome: "வணக்கம்! நான் உங்கள் கிசான் மித்ரா AI உதவியாளர். உங்கள் பயிர் அல்லது திட்டம் பற்றி பேசவும்.",
    placeholder: "பேச மைக்ரோஃபோனைத் தட்டவும்..."
  },
  mr: {
    code: "mr",
    label: "Marathi",
    nativeLabel: "मराठी (Marathi)",
    bcp47: "mr-IN",
    welcome: "नमस्कार! मी तुमचा किसान मित्र AI सहाय्यक आहे. आपल्या पिकाविषयी किंवा योजनांविषयी बोला.",
    placeholder: "बोलण्यासाठी माइक दाबा..."
  },
  bn: {
    code: "bn",
    label: "Bengali",
    nativeLabel: "বাংলা (Bengali)",
    bcp47: "bn-IN",
    welcome: "নমস্কার! আমি আপনার কিষাণ মিত্র AI সহকারী। আপনার ফসল বা সরকারি যোজনা সম্পর্কে বলুন।",
    placeholder: "কথা বলতে মাইক টিপুন..."
  },
  gu: {
    code: "gu",
    label: "Gujarati",
    nativeLabel: "ગુજરાતી (Gujarati)",
    bcp47: "gu-IN",
    welcome: "નમસ્તે! હું તમારો કિસાન મિત્ર AI સહાયક છું. તમારા પાક કે યોજના વિશે બોલીને પૂછો.",
    placeholder: "બોલવા માટે માઇક દબાવો..."
  },
  pa: {
    code: "pa",
    label: "Punjabi",
    nativeLabel: "ਪੰਜਾਬੀ (Punjabi)",
    bcp47: "pa-IN",
    welcome: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਕਿਸਾਨ ਮਿੱਤਰ AI ਸਹਾਇਕ ਹਾਂ। ਆਪਣੀ ਫ਼ਸਲ ਜਾਂ ਖਾਦ ਬਾਰੇ ਪੁੱਛੋ।",
    placeholder: "ਬੋਲਣ ਲਈ ਮਾਈਕ ਦਬਾਓ..."
  },
  ml: {
    code: "ml",
    label: "Malayalam",
    nativeLabel: "മലയാളം (Malayalam)",
    bcp47: "ml-IN",
    welcome: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ കിസാൻബഡ്ഡി AI കൃഷി സഹായകനാണ്. വിളകളെക്കുറിച്ചോ വളപ്രയോഗത്തെക്കുറിച്ചോ ചോദിക്കൂ.",
    placeholder: "സംസാരിക്കാൻ മൈക്ക് അമർത്തുക..."
  },
  en: {
    code: "en",
    label: "English",
    nativeLabel: "English",
    bcp47: "en-IN",
    welcome: "Hello! I am your KisaanBuddy AI Farming Assistant. Tap microphone to speak or type your question.",
    placeholder: "Tap microphone to speak or type..."
  },
  hi_en: {
    code: "hi_en",
    label: "Hinglish",
    nativeLabel: "Hinglish",
    bcp47: "hi-IN",
    welcome: "Namaste Kisan Bhai! Aap Hindi ya English mix karke bol sakte hain. Boliye, aaj kya madad chahiye?",
    placeholder: "Hinglish me bolne ke liye mic dabayein..."
  }
};

const TTS_CACHE_NAME = "kisaanbuddy-tts-v2-cache";

class VoiceService {
  private currentAudio: HTMLAudioElement | null = null;
  private isSynthesizing = false;
  private paused = false;

  public pauseSpeaking(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      try {
        this.currentAudio.pause();
        this.paused = true;
      } catch {
        // ignore
      }
    } else if (typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.speaking) {
      try {
        window.speechSynthesis.pause();
        this.paused = true;
      } catch {
        // ignore
      }
    }
  }

  public resumeSpeaking(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      void this.currentAudio.play().catch(() => {});
      this.paused = false;
    } else if (typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.paused) {
      try {
        window.speechSynthesis.resume();
        this.paused = false;
      } catch {
        // ignore
      }
    }
  }

  public isPausedState(): boolean {
    return this.paused;
  }

  public stopSpeaking(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudio = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    this.isSynthesizing = false;
    this.paused = false;
  }

  public async speakText(
    text: string,
    language: VoiceLanguage = "hi",
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): Promise<void> {
    this.stopSpeaking();
    if (!text || !text.trim()) return;

    const cleanedText = text
      .replace(/[#*`_~]/g, "")
      .replace(/\[FARMER LOCAL CONTEXT:.*?\]/g, "")
      .trim();

    if (!cleanedText) return;

    const langConfig = SUPPORTED_VOICE_LANGUAGES[language] || SUPPORTED_VOICE_LANGUAGES.hi;

    // 1. Try Server TTS
    try {
      let audioBlob: Blob | null = null;
      const cacheKey = `/api/chat/tts?text=${encodeURIComponent(cleanedText.slice(0, 1000))}&lang=${language}`;

      if (typeof window !== "undefined" && "caches" in window) {
        try {
          const cache = await window.caches.open(TTS_CACHE_NAME);
          const cachedRes = await cache.match(cacheKey);
          if (cachedRes && cachedRes.ok) {
            audioBlob = await cachedRes.blob();
          }
        } catch {
          // ignore cache error
        }
      }

      if (!audioBlob) {
        const res = await fetch("/api/chat/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: cleanedText.slice(0, 1000),
            language: language || "auto",
            prefer_browser: false
          })
        });

        if (res.ok) {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("audio")) {
            audioBlob = await res.blob();
            // Cache audio for replay
            if (typeof window !== "undefined" && "caches" in window && audioBlob) {
              try {
                const cache = await window.caches.open(TTS_CACHE_NAME);
                const cachedRes = new Response(audioBlob, {
                  headers: { "Content-Type": contentType }
                });
                await cache.put(cacheKey, cachedRes);
              } catch {
                // ignore
              }
            }
          }
        }
      }

      if (audioBlob) {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        this.currentAudio = audio;

        audio.onplay = () => {
          this.isSynthesizing = true;
          onStart?.();
        };
        audio.onended = () => {
          this.isSynthesizing = false;
          this.currentAudio = null;
          URL.revokeObjectURL(audioUrl);
          onEnd?.();
        };
        audio.onerror = (e) => {
          this.isSynthesizing = false;
          this.currentAudio = null;
          URL.revokeObjectURL(audioUrl);
          // Fallback to browser TTS
          this.speakWithBrowserSynthesis(cleanedText, langConfig.bcp47, onStart, onEnd, onError);
        };

        await audio.play();
        return;
      }
    } catch {
      // Fallback to browser
    }

    // 2. Fallback: Browser Web SpeechSynthesis
    this.speakWithBrowserSynthesis(cleanedText, langConfig.bcp47, onStart, onEnd, onError);
  }

  private speakWithBrowserSynthesis(
    text: string,
    bcp47: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): void {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      onError?.(new Error("Speech synthesis not supported in this browser."));
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = bcp47;
      utterance.rate = 0.95; // Slightly slower for clear agricultural comprehension

      // Pick matching Indian voice if present
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find((v) => v.lang === bcp47 || v.lang.replace("_", "-") === bcp47);
      if (match) utterance.voice = match;

      utterance.onstart = () => {
        this.isSynthesizing = true;
        onStart?.();
      };
      utterance.onend = () => {
        this.isSynthesizing = false;
        onEnd?.();
      };
      utterance.onerror = (e) => {
        this.isSynthesizing = false;
        onError?.(e);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      this.isSynthesizing = false;
      onError?.(e);
    }
  }

  public isSpeaking(): boolean {
    return this.isSynthesizing;
  }
}

export const voiceService = new VoiceService();
