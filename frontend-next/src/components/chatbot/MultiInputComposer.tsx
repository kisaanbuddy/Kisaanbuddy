"use client";

import React, { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import {
  Mic,
  MicOff,
  Image as ImageIcon,
  Camera,
  FileAudio,
  Send,
  X,
  Square,
  Sparkles,
  Loader2,
  Paperclip
} from "lucide-react";
import { VoiceLanguage, SUPPORTED_VOICE_LANGUAGES } from "@/lib/voice-speech";

interface MultiInputComposerProps {
  onSendMessage: (payload: {
    text: string;
    imageBase64?: string;
    audioFile?: File;
    cropHint?: string;
  }) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  selectedLanguage: VoiceLanguage;
  onChangeLanguage: (lang: VoiceLanguage) => void;
}

export function MultiInputComposer({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  selectedLanguage,
  onChangeLanguage
}: MultiInputComposerProps) {
  const [inputText, setInputText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [cropHint, setCropHint] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [voiceTranscript, setVoiceTranscript] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const langConfig = SUPPORTED_VOICE_LANGUAGES[selectedLanguage] || SUPPORTED_VOICE_LANGUAGES.auto;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [inputText]);

  // Speech Recognition (Web Speech API)
  const startSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback to MediaRecorder audio upload
      startMediaRecording();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = langConfig.bcp47;

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingDuration(0);
        timerRef.current = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }
        const text = (finalTranscript || interimTranscript).trim();
        if (text) {
          setVoiceTranscript(text);
          setInputText((prev) => (prev ? prev + " " + text : text));
        }
      };

      recognition.onerror = () => {
        stopRecording();
      };

      recognition.onend = () => {
        stopRecording();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      startMediaRecording();
    }
  };

  // MediaRecorder Fallback
  const startMediaRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        // Send to backend /api/chat/stt
        try {
          const form = new FormData();
          form.append("audio", audioBlob, "recording.webm");
          form.append("language", selectedLanguage === "auto" ? "hi" : selectedLanguage);
          const res = await fetch("/api/chat/stt", {
            method: "POST",
            body: form
          });
          if (res.ok) {
            const data = await res.json();
            if (data.transcript) {
              setInputText((prev) => (prev ? prev + " " + data.transcript : data.transcript));
            }
          }
        } catch {
          // ignore
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch {
      alert("Microphone permission was denied. Please allow microphone access in your browser settings.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
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
      mediaRecorderRef.current = null;
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startSpeechRecognition();
    }
  };

  // Handle Image Selection
  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid crop photograph (JPEG, PNG, WebP).");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert("Image file size exceeds 15 MB limit. Please take a lighter photograph.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Handle Audio File Selection
  const handleAudioFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioFile(file);
    e.target.value = "";
  };

  // Submit
  const handleSend = () => {
    if (isStreaming) {
      onStopStreaming();
      return;
    }

    const trimmed = inputText.trim();
    if (!trimmed && !imageBase64 && !audioFile) return;

    if (isRecording) {
      stopRecording();
    }

    onSendMessage({
      text: trimmed || (imageBase64 ? "Please diagnose the plant disease or pest symptoms on this crop foliage." : "Agricultural enquiry"),
      imageBase64: imageBase64 || undefined,
      audioFile: audioFile || undefined,
      cropHint: cropHint || undefined
    });

    setInputText("");
    setImagePreview(null);
    setImageBase64(null);
    setAudioFile(null);
    setCropHint("");
    setVoiceTranscript("");

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

  return (
    <div className="w-full bg-card border-t border-border/60 p-3 md:p-4 shadow-lg select-none">
      <div className="max-w-4xl mx-auto space-y-2.5">
        {/* Attachment Previews */}
        {(imagePreview || audioFile) && (
          <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-muted/40 border border-border/50 animate-in fade-in">
            {imagePreview && (
              <div className="relative group rounded-lg overflow-hidden border border-emerald-500/40 w-16 h-16 bg-black/5 shrink-0">
                <img src={imagePreview} alt="Crop sample" className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setImageBase64(null);
                  }}
                  className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {imagePreview && (
              <div className="flex flex-col gap-1 min-w-[140px] flex-1">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  Crop Leaf Attached — Select Crop Type:
                </span>
                <select
                  value={cropHint}
                  onChange={(e) => setCropHint(e.target.value)}
                  className="text-xs py-1 px-2 rounded-md border border-border/60 bg-background text-foreground focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Auto Detect Crop</option>
                  <option value="Wheat">Wheat (गेहूं)</option>
                  <option value="Rice">Rice / Paddy (धान)</option>
                  <option value="Tomato">Tomato (टमाटर)</option>
                  <option value="Potato">Potato (आलू)</option>
                  <option value="Cotton">Cotton (कपास)</option>
                  <option value="Maize">Corn / Maize (मक्का)</option>
                  <option value="Chilli">Chilli / Pepper (मिर्च)</option>
                  <option value="Sugarcane">Sugarcane (गन्ना)</option>
                  <option value="Soybean">Soybean (सोयाबीन)</option>
                  <option value="Mustard">Mustard (सरसों)</option>
                </select>
              </div>
            )}

            {audioFile && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-background border border-border/60 text-xs">
                <FileAudio className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-medium text-foreground truncate max-w-[160px]">
                  {audioFile.name}
                </span>
                <button
                  onClick={() => setAudioFile(null)}
                  className="p-0.5 text-muted-foreground hover:text-red-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Live Recording Waveform Bar */}
        {isRecording && (
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 text-xs animate-pulse">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
              </span>
              <span className="font-bold">Listening in {langConfig.label}...</span>
              <span className="text-[10px] text-muted-foreground font-mono">
                00:{recordingDuration < 10 ? `0${recordingDuration}` : recordingDuration}
              </span>
            </div>

            {/* Simulated Audio Waveform Bars */}
            <div className="flex items-center gap-1 h-4">
              <span className="w-1 bg-emerald-600 rounded-full animate-[bounce_0.6s_infinite_100ms] h-2" />
              <span className="w-1 bg-emerald-600 rounded-full animate-[bounce_0.5s_infinite_200ms] h-4" />
              <span className="w-1 bg-emerald-600 rounded-full animate-[bounce_0.7s_infinite_50ms] h-3" />
              <span className="w-1 bg-emerald-600 rounded-full animate-[bounce_0.6s_infinite_150ms] h-4" />
              <span className="w-1 bg-emerald-600 rounded-full animate-[bounce_0.5s_infinite_300ms] h-2" />
            </div>

            <button
              onClick={stopRecording}
              className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline px-2 py-0.5"
            >
              Done Speaking
            </button>
          </div>
        )}

        {/* Primary Input Container */}
        <div className="flex items-end gap-2 bg-background border border-border/80 focus-within:border-emerald-500 rounded-2xl p-1.5 md:p-2 shadow-xs transition-colors">
          {/* Action Attachment Tools */}
          <div className="flex items-center gap-1 shrink-0 pb-1">
            {/* 1. Camera Capture */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="p-2 rounded-xl text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors"
              title="Take Photo of Crop Leaf"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageFileChange}
              className="hidden"
            />

            {/* 2. Image File Upload */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors"
              title="Upload Crop Photograph"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="hidden"
            />

            {/* 3. Audio File Upload */}
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              className="hidden sm:inline-flex p-2 rounded-xl text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors"
              title="Upload Voice Note"
            >
              <FileAudio className="w-4 h-4" />
            </button>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioFileChange}
              className="hidden"
            />
          </div>

          {/* Text Area Input */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={langConfig.placeholder}
              className="w-full resize-none bg-transparent py-1.5 px-2 text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none max-h-32 leading-relaxed"
            />
          </div>

          {/* Right Controls: Mic & Send */}
          <div className="flex items-center gap-1.5 shrink-0 pb-1">
            {/* Voice Recording Button */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-2.5 rounded-xl font-bold transition-all ${
                isRecording
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20"
              }`}
              title={isRecording ? "Stop Recording" : "Speak Query"}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send or Stop Button */}
            {isStreaming ? (
              <button
                type="button"
                onClick={onStopStreaming}
                className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-transform active:scale-95"
                title="Stop response"
              >
                <Square className="w-4 h-4 fill-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={!inputText.trim() && !imageBase64 && !audioFile}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white shadow-xs transition-transform active:scale-95"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Input Footer Note */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
          <div className="flex items-center gap-2">
            <span>Powered by ICAR Knowledge Engine</span>
            <span>•</span>
            <span className="text-emerald-600 font-medium">Shift + Enter for new line</span>
          </div>

          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => onChangeLanguage(e.target.value as VoiceLanguage)}
              className="bg-transparent text-[10px] font-bold text-foreground focus:outline-none cursor-pointer border-b border-border/60 pb-0.5"
            >
              {Object.values(SUPPORTED_VOICE_LANGUAGES).map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeLabel}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
