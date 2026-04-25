"use client"
/**
 * Browser speech primitives for the KrishiAI voice assistant.
 *
 * Features:
 *   - Browser SpeechRecognition (Web Speech API) for zero-latency mic input
 *     with partial transcripts; falls back gracefully on unsupported browsers.
 *   - MediaRecorder-based server STT (Whisper via backend /api/chat/stt) for
 *     browsers without Web Speech (most Firefox, many mobile Chromium forks).
 *   - SpeechSynthesis for browser TTS with per-language voice selection and
 *     hard-cancel (for voice-interruption: stop TTS instantly when the user
 *     starts speaking again).
 *
 * Everything is decoupled — the widget picks whichever modes are available.
 */

import { useCallback, useEffect, useRef, useState } from "react"

import type { Language } from "@/lib/assistant-api"
import { transcribeAudio } from "@/lib/assistant-api"

// ---------- Typings for Web Speech API (not in lib.dom yet in all TS envs) ----
// Minimal interfaces so we don't drag in @types packages.
interface WebSpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: ArrayLike<{
    readonly isFinal: boolean
    readonly length: number
    [index: number]: { readonly transcript: string; readonly confidence: number }
  }>
}
interface WebSpeechRecognitionErrorEvent extends Event {
  readonly error: string
  readonly message?: string
}
interface WebSpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onstart: ((this: WebSpeechRecognition, ev: Event) => void) | null
  onend: ((this: WebSpeechRecognition, ev: Event) => void) | null
  onresult:
    | ((this: WebSpeechRecognition, ev: WebSpeechRecognitionEvent) => void)
    | null
  onerror:
    | ((this: WebSpeechRecognition, ev: WebSpeechRecognitionErrorEvent) => void)
    | null
}
type WebSpeechRecognitionCtor = new () => WebSpeechRecognition

// ---------- Language -> BCP-47 ----------
export const LANG_TO_BCP47: Record<Exclude<Language, "auto">, string> = {
  en: "en-IN",
  hi: "hi-IN",
  kn: "kn-IN",
}

// ---------- Hook ----------
export interface UseSpeechOptions {
  /** Preferred language for STT/TTS. "auto" falls back to en-IN for speech. */
  language: Language
  /** Called on a final transcript (finished utterance). */
  onFinalTranscript: (text: string) => void
  /** Called on every partial (live) transcript update. */
  onInterim?: (text: string) => void
  /** Called when STT fails for any reason. */
  onError?: (msg: string) => void
}

export interface UseSpeechReturn {
  /** True if either Web Speech or MediaRecorder is usable. */
  speechSupported: boolean
  /** True when the mic is actively listening. */
  listening: boolean
  /** True while browser TTS is speaking. */
  speaking: boolean

  /** Start capturing speech. Returns true if capture actually started. */
  startListening: () => Promise<boolean>
  /** Stop listening immediately and commit any partial as final (if supported). */
  stopListening: () => void
  /** Hard-abort listening without committing. */
  cancelListening: () => void

  /** Speak the given text via browser TTS. */
  speak: (text: string, language: Language) => void
  /** Stop the current utterance. Use as the voice-interruption kill-switch. */
  stopSpeaking: () => void
}

export function useSpeech(opts: UseSpeechOptions): UseSpeechReturn {
  const { language, onFinalTranscript, onInterim, onError } = opts

  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  const recognitionRef = useRef<WebSpeechRecognition | null>(null)
  const recognitionActiveRef = useRef(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaChunksRef = useRef<Blob[]>([])
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const useServerSTTRef = useRef(false)

  // Keep latest callbacks in refs so we don't need to re-bind listeners.
  const onFinalRef = useRef(onFinalTranscript)
  const onInterimRef = useRef(onInterim)
  const onErrorRef = useRef(onError)
  useEffect(() => {
    onFinalRef.current = onFinalTranscript
    onInterimRef.current = onInterim
    onErrorRef.current = onError
  }, [onFinalTranscript, onInterim, onError])

  // ---------- Browser capability probe ----------
  const browserSTTCtor = (): WebSpeechRecognitionCtor | null => {
    if (typeof window === "undefined") return null
    const w = window as unknown as {
      SpeechRecognition?: WebSpeechRecognitionCtor
      webkitSpeechRecognition?: WebSpeechRecognitionCtor
    }
    return w.SpeechRecognition || w.webkitSpeechRecognition || null
  }

  const hasMediaRecorder =
    typeof window !== "undefined" &&
    typeof window.MediaRecorder !== "undefined" &&
    !!navigator?.mediaDevices?.getUserMedia

  const speechSupported = !!browserSTTCtor() || hasMediaRecorder

  // ---------- Browser STT (preferred path) ----------
  const startWebSpeech = useCallback((): boolean => {
    const Ctor = browserSTTCtor()
    if (!Ctor) return false
    try {
      const rec = new Ctor()
      const bcp47 =
        language === "auto" ? "en-IN" : LANG_TO_BCP47[language] ?? "en-IN"
      rec.lang = bcp47
      rec.continuous = false
      rec.interimResults = true
      rec.maxAlternatives = 1

      let finalText = ""

      rec.onstart = () => {
        recognitionActiveRef.current = true
        setListening(true)
      }
      rec.onresult = (ev) => {
        let interim = ""
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const r = ev.results[i]
          const piece = r[0]?.transcript ?? ""
          if (r.isFinal) finalText += piece
          else interim += piece
        }
        if (interim && onInterimRef.current) onInterimRef.current(interim)
      }
      rec.onerror = (ev) => {
        const msg = ev.error || "speech_recognition_error"
        // "no-speech" / "aborted" are common and not really errors we need to surface.
        if (msg !== "no-speech" && msg !== "aborted") {
          onErrorRef.current?.(msg)
        }
      }
      rec.onend = () => {
        recognitionActiveRef.current = false
        setListening(false)
        const text = finalText.trim()
        if (text) onFinalRef.current(text)
      }

      recognitionRef.current = rec
      rec.start()
      return true
    } catch (e: any) {
      onErrorRef.current?.(e?.message || "Failed to start browser STT")
      return false
    }
  }, [language])

  // ---------- Server STT via MediaRecorder + Whisper ----------
  const startServerSTT = useCallback(async (): Promise<boolean> => {
    if (!hasMediaRecorder) return false
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      // Prefer webm/opus — Whisper handles it cleanly.
      const mimeCandidates = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg",
      ]
      const mimeType =
        mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) || ""
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaChunksRef.current = []

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) mediaChunksRef.current.push(e.data)
      }
      mr.onstop = async () => {
        setListening(false)
        stream.getTracks().forEach((t) => t.stop())
        mediaStreamRef.current = null
        const blob = new Blob(mediaChunksRef.current, {
          type: mimeType || "audio/webm",
        })
        if (!blob.size) return
        try {
          const hint =
            language === "auto" ? undefined : (language as "en" | "hi" | "kn")
          const res = await transcribeAudio(blob, hint)
          const text = (res.transcript || "").trim()
          if (text) onFinalRef.current(text)
        } catch (err: any) {
          onErrorRef.current?.(err?.message || "Server STT failed")
        }
      }

      mediaRecorderRef.current = mr
      useServerSTTRef.current = true
      mr.start()
      setListening(true)
      return true
    } catch (e: any) {
      onErrorRef.current?.(e?.message || "Microphone access denied")
      return false
    }
  }, [hasMediaRecorder, language])

  // ---------- Public start/stop ----------
  const startListening = useCallback(async (): Promise<boolean> => {
    if (listening) return true
    // Always hard-stop any TTS first (voice interruption).
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    }
    useServerSTTRef.current = false
    if (startWebSpeech()) return true
    return await startServerSTT()
  }, [listening, startWebSpeech, startServerSTT])

  const stopListening = useCallback(() => {
    if (useServerSTTRef.current && mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop()
      } catch {
        /* ignore */
      }
      return
    }
    if (recognitionActiveRef.current && recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        /* ignore */
      }
    }
  }, [])

  const cancelListening = useCallback(() => {
    if (useServerSTTRef.current && mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop()
      } catch {
        /* ignore */
      }
      mediaChunksRef.current = []
      return
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {
        /* ignore */
      }
    }
    setListening(false)
  }, [])

  // ---------- Browser TTS ----------
  const pickVoice = useCallback(
    (lang: string): SpeechSynthesisVoice | null => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return null
      }
      const voices = window.speechSynthesis.getVoices()
      if (!voices.length) return null
      const prefix = lang.split("-")[0]
      // Prefer exact BCP-47 match; fallback to prefix match; then any.
      const exact = voices.find((v) => v.lang?.toLowerCase() === lang.toLowerCase())
      if (exact) return exact
      const byPrefix = voices.find((v) =>
        v.lang?.toLowerCase().startsWith(prefix.toLowerCase())
      )
      return byPrefix || voices[0]
    },
    []
  )

  const speak = useCallback(
    (text: string, spokenLang: Language) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return
      if (!text?.trim()) return
      // Cancel any ongoing utterance first.
      window.speechSynthesis.cancel()

      const bcp47 =
        spokenLang === "auto"
          ? LANG_TO_BCP47["en"]
          : LANG_TO_BCP47[spokenLang] ?? "en-IN"

      const u = new SpeechSynthesisUtterance(text)
      u.lang = bcp47
      const v = pickVoice(bcp47)
      if (v) u.voice = v
      u.rate = 1.0
      u.pitch = 1.0
      u.volume = 1.0
      u.onstart = () => setSpeaking(true)
      u.onend = () => setSpeaking(false)
      u.onerror = () => setSpeaking(false)

      window.speechSynthesis.speak(u)
    },
    [pickVoice]
  )

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort()
      } catch {
        /* ignore */
      }
      try {
        mediaRecorderRef.current?.stop()
      } catch {
        /* ignore */
      }
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop())
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Warm up voice list (Chrome loads lazily).
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    const ping = () => window.speechSynthesis.getVoices()
    ping()
    window.speechSynthesis.addEventListener?.("voiceschanged", ping)
    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", ping)
    }
  }, [])

  return {
    speechSupported,
    listening,
    speaking,
    startListening,
    stopListening,
    cancelListening,
    speak,
    stopSpeaking,
  }
}
