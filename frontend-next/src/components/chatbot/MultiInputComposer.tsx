"use client";

import React, {
  ChangeEvent,
  ClipboardEvent,
  KeyboardEvent,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Camera,
  Check,
  FileAudio,
  Globe,
  Image as ImageIcon,
  Mic,
  MicOff,
  Send,
  Square,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { SUPPORTED_VOICE_LANGUAGES, VoiceLanguage } from "@/lib/voice-speech";

export interface ComposerSubmitPayload {
  text: string;
  imageBase64?: string;
  imageFile?: File;
  audioFile?: File;
  cropHint?: string;
}

export interface MultiInputComposerHandle {
  startVoice: () => void;
  openGallery: () => void;
  openCamera: () => void;
  focusInput: () => void;
}

interface MultiInputComposerProps {
  onSendMessage: (payload: ComposerSubmitPayload) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  selectedLanguage: VoiceLanguage;
  onChangeLanguage: (lang: VoiceLanguage) => void;
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
  isTranscribingAudio?: boolean;
}

export const MultiInputComposer = forwardRef<MultiInputComposerHandle, MultiInputComposerProps>(
  function MultiInputComposer(
    {
      onSendMessage,
      isStreaming,
      onStopStreaming,
      selectedLanguage,
      onChangeLanguage,
      autoSpeak,
      onToggleAutoSpeak,
      isTranscribingAudio = false,
    },
    ref
  ) {
    const [inputText, setInputText] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [cropHint, setCropHint] = useState<string>("");
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [interimTranscript, setInterimTranscript] = useState("");
    const [isTranscribingMic, setIsTranscribingMic] = useState(false);
    const [voiceError, setVoiceError] = useState<string | null>(null);
    const [audioBars, setAudioBars] = useState<number[]>([0.25, 0.45, 0.35, 0.6, 0.4, 0.5, 0.3]);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recognitionRef = useRef<any>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const animFrameRef = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const baseTextRef = useRef<string>("");
    const finalTranscriptRef = useRef<string>("");
    const handledTranscriptRef = useRef<boolean>(false);
    const shouldAutoSendOnStopRef = useRef<boolean>(false);
    const cancelledRef = useRef<boolean>(false);

    const langConfig =
      SUPPORTED_VOICE_LANGUAGES[selectedLanguage] || SUPPORTED_VOICE_LANGUAGES.auto;

    // Auto-resize textarea
    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 136)}px`;
      }
    }, [inputText]);

    const cleanupAudioResources = useCallback(() => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        void audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      setAudioBars([0.25, 0.45, 0.35, 0.6, 0.4, 0.5, 0.3]);
    }, []);

    useEffect(() => {
      return () => {
        cancelledRef.current = true;
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch {
            // ignore
          }
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          try {
            mediaRecorderRef.current.stop();
          } catch {
            // ignore
          }
        }
        cleanupAudioResources();
      };
    }, [cleanupAudioResources]);

    const commitVoiceResult = useCallback(
      (transcript: string) => {
        const clean = transcript.trim();
        if (!clean) return;
        const combined = baseTextRef.current ? `${baseTextRef.current} ${clean}`.trim() : clean;
        if (shouldAutoSendOnStopRef.current && !imagePreview && !audioFile) {
          onSendMessage({
            text: combined,
            cropHint: cropHint || undefined,
          });
          setInputText("");
        } else {
          setInputText(combined);
          textareaRef.current?.focus();
        }
      },
      [audioFile, cropHint, imagePreview, onSendMessage]
    );

    const stopRecording = useCallback(
      (autoSend = false) => {
        shouldAutoSendOnStopRef.current = autoSend;
        setIsRecording(false);
        setInterimTranscript("");

        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch {
            // ignore
          }
          recognitionRef.current = null;
        }

        const captured = finalTranscriptRef.current.trim();
        if (captured && !cancelledRef.current) {
          handledTranscriptRef.current = true;
          finalTranscriptRef.current = "";
          commitVoiceResult(captured);
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          try {
            mediaRecorderRef.current.stop();
          } catch {
            // ignore
          }
        }

        cleanupAudioResources();
      },
      [cleanupAudioResources, commitVoiceResult]
    );

    const cancelRecording = useCallback(() => {
      cancelledRef.current = true;
      handledTranscriptRef.current = true;
      finalTranscriptRef.current = "";
      shouldAutoSendOnStopRef.current = false;
      setIsRecording(false);
      setInterimTranscript("");
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // ignore
        }
      }
      cleanupAudioResources();
      setInputText(baseTextRef.current);
    }, [cleanupAudioResources]);

    const startRecording = useCallback(async () => {
      if (isRecording) return;
      setVoiceError(null);
      cancelledRef.current = false;
      handledTranscriptRef.current = false;
      shouldAutoSendOnStopRef.current = false;
      baseTextRef.current = inputText.trim();
      finalTranscriptRef.current = "";
      setInterimTranscript("");

      // Start live mic audio stream for genuine waveform visualizer + server STT fallback
      let micStream: MediaStream | null = null;
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          mediaStreamRef.current = micStream;

          // Web Audio Analyser for responsive audio bars
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            audioContextRef.current = ctx;
            const source = ctx.createMediaStreamSource(micStream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 32;
            analyser.smoothingTimeConstant = 0.7;
            source.connect(analyser);

            const dataArr = new Uint8Array(analyser.frequencyBinCount);
            const tick = () => {
              analyser.getByteFrequencyData(dataArr);
              const bars = [1, 2, 3, 4, 5, 6, 7].map((i) => {
                const v = dataArr[i] ?? 0;
                return Math.max(0.2, Math.min(1, v / 180));
              });
              setAudioBars(bars);
              animFrameRef.current = requestAnimationFrame(tick);
            };
            animFrameRef.current = requestAnimationFrame(tick);
          }
        }
      } catch {
        setVoiceError("माइक की अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग्स में माइक ऑन करें।");
        return;
      }

      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      // 1. Concurrent Web Speech API for live interim captions
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      let webSpeechStarted = false;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = langConfig.bcp47;

          recognition.onresult = (event: any) => {
            let fullFinal = "";
            let interim = "";
            for (let i = 0; i < event.results.length; i++) {
              const piece = event.results[i][0]?.transcript || "";
              if (event.results[i].isFinal) {
                fullFinal += piece + " ";
              } else {
                interim += piece;
              }
            }
            const trimmedFinal = fullFinal.trim();
            finalTranscriptRef.current = trimmedFinal || interim.trim();
            const liveText = `${trimmedFinal} ${interim}`.trim();
            setInterimTranscript(liveText);
            if (liveText) {
              setInputText(
                baseTextRef.current ? `${baseTextRef.current} ${liveText}` : liveText
              );
            }
          };

          recognition.onerror = (ev: any) => {
            if (ev?.error === "not-allowed" || ev?.error === "service-not-allowed") {
              setVoiceError("Microphone access denied.");
            }
          };

          recognitionRef.current = recognition;
          recognition.start();
          webSpeechStarted = true;
        } catch {
          webSpeechStarted = false;
        }
      }

      // 2. Concurrent MediaRecorder fallback -> /api/chat/stt if browser STT didn't capture text
      if (micStream && typeof MediaRecorder !== "undefined") {
        try {
          const recorder = new MediaRecorder(micStream);
          mediaRecorderRef.current = recorder;
          audioChunksRef.current = [];

          recorder.ondataavailable = (ev) => {
            if (ev.data.size > 0) {
              audioChunksRef.current.push(ev.data);
            }
          };

          recorder.onstop = async () => {
            if (cancelledRef.current || handledTranscriptRef.current) return;
            const alreadyCaptured = finalTranscriptRef.current.trim();
            if (alreadyCaptured) return;

            const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
            if (blob.size < 800) return;

            setIsTranscribingMic(true);
            try {
              const form = new FormData();
              form.append("audio", blob, "recording.webm");
              if (selectedLanguage !== "auto") {
                form.append("language", selectedLanguage);
              }
              const res = await fetch("/api/chat/stt", {
                method: "POST",
                credentials: "include",
                body: form,
              });
              if (res.ok) {
                const data = await res.json();
                if (data.transcript) {
                  handledTranscriptRef.current = true;
                  commitVoiceResult(data.transcript);
                } else if (!webSpeechStarted) {
                  setVoiceError("आवाज़ स्पष्ट नहीं थी, कृपया दोबारा बोलें या टाइप करें।");
                }
              } else if (!webSpeechStarted) {
                setVoiceError("Voice transcription unavailable right now. Please type your query.");
              }
            } catch {
              if (!webSpeechStarted) {
                setVoiceError("Voice transcription unavailable right now. Please type your query.");
              }
            } finally {
              setIsTranscribingMic(false);
            }
          };

          recorder.start(250);
        } catch {
          // ignore if MediaRecorder unsupported
        }
      }
    }, [
      commitVoiceResult,
      inputText,
      isRecording,
      langConfig.bcp47,
      selectedLanguage,
    ]);

    useImperativeHandle(
      ref,
      () => ({
        startVoice: () => {
          void startRecording();
        },
        openGallery: () => fileInputRef.current?.click(),
        openCamera: () => cameraInputRef.current?.click(),
        focusInput: () => textareaRef.current?.focus(),
      }),
      [startRecording]
    );

    const processImageFile = (file: File) => {
      const allowedTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
      if (!file.type.startsWith("image/") || (file.type && !allowedTypes.has(file.type.toLowerCase()))) {
        setVoiceError("कृपया एक मान्य फ़सल की फोटो (JPEG, PNG, WebP) चुनें।");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setVoiceError("फोटो 10 MB से कम होनी चाहिए।");
        return;
      }
      setVoiceError(null);
      setImageFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        const rawDataUrl = reader.result as string;
        // Client-side bandwidth/token optimization: downscale huge camera photos >1280px
        if (typeof Image === "undefined") {
          setImagePreview(rawDataUrl);
          return;
        }
        const img = new Image();
        img.onload = () => {
          const maxDim = 1280;
          if (img.width <= maxDim && img.height <= maxDim && file.size <= 1.2 * 1024 * 1024) {
            setImagePreview(rawDataUrl);
            return;
          }
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            setImagePreview(rawDataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setImagePreview(canvas.toDataURL("image/jpeg", 0.84));
        };
        img.onerror = () => setImagePreview(rawDataUrl);
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    };

    const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processImageFile(file);
      e.target.value = "";
    };

    const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processImageFile(file);
            break;
          }
        }
      }
    };

    const handleAudioFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setVoiceError(null);
      setAudioFile(file);
      e.target.value = "";
    };

    const handleSend = () => {
      if (isStreaming) {
        onStopStreaming();
        return;
      }

      if (isRecording) {
        stopRecording(true);
        return;
      }

      const trimmed = inputText.trim();
      if (!trimmed && !imagePreview && !audioFile) return;

      onSendMessage({
        text:
          trimmed ||
          (imagePreview
            ? "Please diagnose any disease, pest, or nutrient issue visible on this crop photograph."
            : "Voice audio enquiry"),
        imageBase64: imagePreview || undefined,
        imageFile: imageFile || undefined,
        audioFile: audioFile || undefined,
        cropHint: cropHint || undefined,
      });

      setInputText("");
      setImagePreview(null);
      setImageFile(null);
      setAudioFile(null);
      setCropHint("");
      setVoiceError(null);
      finalTranscriptRef.current = "";

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    const canSubmit = Boolean(inputText.trim() || imagePreview || audioFile) && !isTranscribingAudio;

    return (
      <div className="shrink-0 w-full bg-gradient-to-t from-[#F4F8F4] via-[#F4F8F4]/95 to-transparent dark:from-stone-950 dark:via-stone-950/95 pt-2 px-3 sm:px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] select-none">
        <div className="max-w-3xl lg:max-w-4xl mx-auto space-y-2">
          {/* Voice Error Toast */}
          {voiceError && (
            <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
              <span>{voiceError}</span>
              <button
                type="button"
                onClick={() => setVoiceError(null)}
                className="p-0.5 hover:opacity-70"
                aria-label="Dismiss alert"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Live Recording Status & Real-Time Audio Bars */}
          {isRecording && (
            <div className="rounded-2xl bg-white dark:bg-stone-900 border border-emerald-500/40 shadow-md px-3.5 py-2.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#143325] dark:text-emerald-200 truncate">
                      Listening in {langConfig.label}...
                    </p>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                    00:{recordingDuration < 10 ? `0${recordingDuration}` : recordingDuration}
                  </span>
                </div>

                {/* Live Audio Waveform Bars */}
                <div className="flex items-center gap-1 h-6 px-1" aria-hidden="true">
                  {audioBars.map((lvl, idx) => (
                    <span
                      key={idx}
                      className="w-1 rounded-full bg-emerald-600 dark:bg-emerald-400 transition-all duration-75"
                      style={{ height: `${Math.round(lvl * 22)}px` }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={cancelRecording}
                    className="px-2.5 py-1 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => stopRecording(true)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Send Voice</span>
                  </button>
                </div>
              </div>

              {interimTranscript && (
                <p className="text-xs text-[#355343] dark:text-stone-300 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl px-3 py-1.5 line-clamp-2">
                  “{interimTranscript}”
                </p>
              )}
            </div>
          )}

          {/* Multimodal Attachment Preview */}
          {(imagePreview || audioFile) && (
            <div className="flex flex-wrap items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-emerald-900/15 dark:border-stone-800 shadow-xs">
              {imagePreview && (
                <>
                  <div className="relative rounded-xl overflow-hidden border border-emerald-500/40 w-16 h-16 shrink-0 bg-stone-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Selected crop photo"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-black/75 text-white hover:bg-black"
                      title="Remove photo"
                      aria-label="Remove photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex-1 min-w-[160px] space-y-1">
                    <label
                      htmlFor="crop-hint-select"
                      className="block text-[11px] font-bold text-emerald-800 dark:text-emerald-300"
                    >
                      Crop Photograph Attached (Optional Crop Name):
                    </label>
                    <select
                      id="crop-hint-select"
                      value={cropHint}
                      onChange={(e) => setCropHint(e.target.value)}
                      className="w-full sm:w-auto text-xs py-1.5 px-2.5 rounded-xl border border-emerald-900/15 dark:border-stone-700 bg-[#F8FBF8] dark:bg-stone-800 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Auto Detect Crop</option>
                      <option value="Wheat">Wheat (गेहूं)</option>
                      <option value="Rice">Rice / Paddy (धान)</option>
                      <option value="Tomato">Tomato (टमाटर)</option>
                      <option value="Potato">Potato (आलू)</option>
                      <option value="Cotton">Cotton (कपास)</option>
                      <option value="Maize">Maize / Corn (मक्का)</option>
                      <option value="Chilli">Chilli (मिर्च)</option>
                      <option value="Sugarcane">Sugarcane (गन्ना)</option>
                      <option value="Soybean">Soybean (सोयाबीन)</option>
                      <option value="Mustard">Mustard (सरसों)</option>
                      <option value="Gram">Gram / Chickpea (चना)</option>
                    </select>
                  </div>
                </>
              )}

              {audioFile && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
                  <FileAudio className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span className="font-medium text-foreground truncate max-w-[180px]">
                    {audioFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAudioFile(null)}
                    className="p-0.5 text-stone-500 hover:text-rose-600"
                    aria-label="Remove audio file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Main Elevated Composer Shell (ChatGPT / Gemini 2-row architecture) */}
          <div className="rounded-3xl bg-white dark:bg-stone-900 border border-emerald-900/15 dark:border-stone-800 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-600/10 shadow-md px-3 py-2.5 sm:px-4 sm:py-3 transition-all">
            {/* Full-Width Expanding Textarea */}
            <div className="w-full">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={
                  isTranscribingAudio || isTranscribingMic
                    ? "Transcribing your voice..."
                    : isRecording
                    ? `सुन रहे हैं... (${langConfig.label})`
                    : langConfig.placeholder
                }
                disabled={isTranscribingAudio || isTranscribingMic}
                className="w-full resize-none bg-transparent px-1 py-1 min-h-[2.25rem] text-sm sm:text-[15px] text-foreground placeholder:text-[#68766C] dark:placeholder:text-stone-400 focus:outline-none max-h-36 leading-relaxed"
              />
            </div>

            {/* Bottom Action Bar: Multimodal, Language, Voice Reply, Large Mic & Send */}
            <div className="mt-1.5 pt-2 border-t border-emerald-900/5 dark:border-stone-800/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-0.5 sm:gap-1 min-w-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-[#355343] dark:text-stone-300 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors shrink-0"
                  title="Capture crop photo with camera"
                  aria-label="Capture crop photo"
                >
                  <Camera className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-[#355343] dark:text-stone-300 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors shrink-0"
                  title="Upload crop image from gallery"
                  aria-label="Upload image from gallery"
                >
                  <ImageIcon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                  className="hidden sm:flex h-10 w-10 rounded-full items-center justify-center text-[#355343] dark:text-stone-300 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors shrink-0"
                  title="Upload voice note audio"
                  aria-label="Upload audio note"
                >
                  <FileAudio className="w-4.5 h-4.5" />
                </button>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileChange}
                  className="hidden"
                />

                <div className="h-5 w-px bg-emerald-900/10 dark:bg-stone-800 mx-0.5 sm:mx-1 shrink-0" />

                <label className="inline-flex items-center gap-1 px-2 py-1 rounded-full hover:bg-emerald-50/70 dark:hover:bg-stone-800 cursor-pointer text-[11px] text-[#355343] dark:text-stone-300">
                  <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <select
                    aria-label="Voice & Reply Language"
                    value={selectedLanguage}
                    onChange={(e) => onChangeLanguage(e.target.value as VoiceLanguage)}
                    className="bg-transparent font-semibold text-[#1D2B22] dark:text-stone-200 focus:outline-none cursor-pointer max-w-[95px] sm:max-w-none truncate"
                  >
                    {Object.values(SUPPORTED_VOICE_LANGUAGES).map((lang) => (
                      <option
                        key={lang.code}
                        value={lang.code}
                        className="bg-white dark:bg-stone-900 text-foreground"
                      >
                        {lang.nativeLabel}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={onToggleAutoSpeak}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[11px] transition-colors shrink-0 ${
                    autoSpeak
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-semibold"
                      : "border-transparent hover:bg-stone-100 dark:hover:bg-stone-800 text-[#5B7062] dark:text-stone-400"
                  }`}
                  title={autoSpeak ? "Auto-read AI replies ON" : "Auto-read AI replies OFF"}
                  aria-label="Toggle voice reply"
                >
                  {autoSpeak ? (
                    <Volume2 className="w-3.5 h-3.5" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden md:inline">
                    {autoSpeak ? "Voice Reply: On" : "Voice Reply: Off"}
                  </span>
                </button>
              </div>

              {/* Right Primary Voice & Send Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => (isRecording ? stopRecording(false) : void startRecording())}
                  className={`relative flex items-center justify-center h-11 w-11 rounded-full transition-all shadow-sm active:scale-95 ${
                    isRecording
                      ? "bg-rose-600 text-white ring-4 ring-rose-500/25"
                      : "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-600/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
                  }`}
                  title={isRecording ? "Stop listening" : "Speak your question"}
                  aria-label={isRecording ? "Stop listening" : "Speak your question"}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {isStreaming ? (
                  <button
                    type="button"
                    onClick={onStopStreaming}
                    className="flex items-center justify-center h-11 w-11 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-transform active:scale-95"
                    title="Stop generating response"
                    aria-label="Stop generating"
                  >
                    <Square className="w-4 h-4 fill-white" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!canSubmit && !isRecording}
                    className="flex items-center justify-center h-11 w-11 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/35 disabled:cursor-not-allowed text-white shadow-sm transition-all active:scale-95"
                    title="Send message"
                    aria-label="Send message"
                  >
                    <Send className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] text-[#5B7062] dark:text-stone-400">
            Verify pesticide doses &amp; government scheme eligibility with your nearest KVK or CSC.
          </p>
        </div>
      </div>
    );
  }
);
