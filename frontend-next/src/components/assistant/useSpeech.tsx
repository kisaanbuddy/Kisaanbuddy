"use client"
/**
 * Production-ready voice primitives for KisaanBuddy Voice AI.
 *
 * Capabilities:
 *   - Real microphone recording with Web Audio API (16kHz 16-bit PCM WAV)
 *   - Dual capture pipeline: Web Speech API for instantaneous interim transcription
 *     paired with high-fidelity server STT (Sarvam AI / Google SR)
 *   - Live audio analyser node & real-time volume/frequency data for genuine waveforms
 *   - Voice Activity Detection (VAD) / Silence detection for hands-free auto-commit
 *   - Human-like AI voice playback (Sarvam Bulbul & Indian Neural TTS) with play,
 *     pause, resume, and instant barge-in / interruption controls
 */

import { useCallback, useEffect, useRef, useState } from "react"
import type { Language } from "@/lib/assistant-api"
import { synthesizeSpeech, transcribeAudio } from "@/lib/assistant-api"

// ---------- Typings for Web Speech API ----------
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
  bn: "bn-IN",
  mr: "mr-IN",
  te: "te-IN",
  ta: "ta-IN",
  gu: "gu-IN",
  pa: "pa-IN",
  ml: "ml-IN",
  hi_en: "hi-IN",
  bho: "hi-IN",
  mai: "hi-IN",
}

// Helper: Convert PCM Float32Array to 16-bit Mono WAV Blob
function encodeWAV(samples: Float32Array, sampleRate = 16000): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  writeString(0, "RIFF")
  view.setUint32(4, 36 + samples.length * 2, true)
  writeString(8, "WAVE")
  writeString(12, "fmt ")
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM format
  view.setUint16(22, 1, true) // 1 channel (mono)
  view.setUint32(24, sampleRate, true) // sample rate
  view.setUint32(28, sampleRate * 2, true) // byte rate
  view.setUint16(32, 2, true) // block align
  view.setUint16(34, 16, true) // bits per sample
  writeString(36, "data")
  view.setUint32(40, samples.length * 2, true)

  let offset = 44
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    offset += 2
  }

  return new Blob([buffer], { type: "audio/wav" })
}

// ---------- Hook Types ----------
export interface UseSpeechOptions {
  /** Preferred language for STT/TTS. "auto" defaults to hi-IN / en-IN. */
  language: Language
  /** Called on a final transcript (finished utterance). */
  onFinalTranscript: (text: string) => void
  /** Called on every partial (live) transcript update. */
  onInterim?: (text: string) => void
  /** Called when STT or microphone fails. */
  onError?: (msg: string) => void
  /** Enable automatic silence-based endpoint detection. Defaults to true. */
  autoSilenceCommit?: boolean
  /** Silence duration in milliseconds before auto-committing. Defaults to 2000. */
  silenceDurationMs?: number
}

export interface UseSpeechReturn {
  speechSupported: boolean
  listening: boolean
  speaking: boolean
  isPaused: boolean
  audioLevel: number
  analyserNode: AnalyserNode | null
  getFrequencyData: () => Uint8Array
  startListening: () => Promise<boolean>
  stopListening: () => void
  cancelListening: () => void
  speak: (text: string, language: Language) => void
  pauseSpeaking: () => void
  resumeSpeaking: () => void
  stopSpeaking: () => void
}

export function useSpeech(opts: UseSpeechOptions): UseSpeechReturn {
  const {
    language,
    onFinalTranscript,
    onInterim,
    onError,
    autoSilenceCommit = true,
    silenceDurationMs = 2000,
  } = opts

  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)

  // Web Audio & Recording references
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null)
  const pcmChunksRef = useRef<Float32Array[]>([])
  const totalSamplesRef = useRef(0)

  // Web Speech recognition reference
  const recognitionRef = useRef<WebSpeechRecognition | null>(null)
  const recognitionActiveRef = useRef(false)
  const recognizedTextRef = useRef("")

  // Playback references
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)
  const speakGenerationRef = useRef(0)

  // VAD (Voice Activity Detection) references
  const hasSpokenRef = useRef(false)
  const lastSpeechTimeRef = useRef<number>(0)
  const vadIntervalRef = useRef<any>(null)

  // Keep latest callbacks in refs to avoid re-binding listeners
  const onFinalRef = useRef(onFinalTranscript)
  const onInterimRef = useRef(onInterim)
  const onErrorRef = useRef(onError)
  useEffect(() => {
    onFinalRef.current = onFinalTranscript
    onInterimRef.current = onInterim
    onErrorRef.current = onError
  }, [onFinalTranscript, onInterim, onError])

  // Probe Web Speech constructor
  const browserSTTCtor = (): WebSpeechRecognitionCtor | null => {
    if (typeof window === "undefined") return null
    const w = window as unknown as {
      SpeechRecognition?: WebSpeechRecognitionCtor
      webkitSpeechRecognition?: WebSpeechRecognitionCtor
    }
    return w.SpeechRecognition || w.webkitSpeechRecognition || null
  }

  const hasMediaDevices =
    typeof window !== "undefined" &&
    !!navigator?.mediaDevices?.getUserMedia

  const speechSupported = !!browserSTTCtor() || hasMediaDevices

  // Get live frequency data for genuine visualizer
  const getFrequencyData = useCallback((): Uint8Array => {
    if (!analyserRef.current) return new Uint8Array(32)
    const array = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(array)
    return array
  }, [])

  // Hard stop audio playback (barge-in kill switch)
  const stopSpeaking = useCallback(() => {
    speakGenerationRef.current += 1
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = null
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    setSpeaking(false)
    setIsPaused(false)
  }, [])

  const pauseSpeaking = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
      setIsPaused(true)
    } else if (typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause()
      setIsPaused(true)
    }
  }, [])

  const resumeSpeaking = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      void audioRef.current.play()
      setIsPaused(false)
    } else if (typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
    }
  }, [])

  // Browser TTS fallback
  const speakWithBrowser = useCallback(
    (text: string, spokenLang: Language) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return
      if (!text?.trim()) return

      window.speechSynthesis.cancel()
      const bcp47 =
        spokenLang === "auto"
          ? LANG_TO_BCP47["hi"]
          : LANG_TO_BCP47[spokenLang] ?? "hi-IN"

      const cleaned = text
        .replace(/[*#_~`>]/g, "")
        .replace(/https?:\/\/\S+/g, "")
        .replace(/•\s*/g, ", ")
        .replace(/\n+/g, ". ")
        .trim()

      const utterance = new SpeechSynthesisUtterance(cleaned)
      utterance.lang = bcp47
      utterance.rate = 0.95

      const voices = window.speechSynthesis.getVoices()
      const exact = voices.find((v) => v.lang.toLowerCase() === bcp47.toLowerCase())
      if (exact) utterance.voice = exact

      utterance.onstart = () => {
        setSpeaking(true)
        setIsPaused(false)
      }
      utterance.onend = () => {
        setSpeaking(false)
        setIsPaused(false)
      }
      utterance.onerror = () => {
        setSpeaking(false)
        setIsPaused(false)
      }

      setSpeaking(true)
      window.speechSynthesis.speak(utterance)
    },
    []
  )

  // Primary AI Voice synthesis
  const speak = useCallback(
    (text: string, spokenLang: Language) => {
      if (!text?.trim()) return
      const generation = ++speakGenerationRef.current

      stopSpeaking()
      setSpeaking(true)
      setIsPaused(false)

      void (async () => {
        try {
          // Request real audio bytes from Sarvam / Indian Neural backend
          const response = await synthesizeSpeech(text, spokenLang)
          if (generation !== speakGenerationRef.current) return

          if (response.kind === "audio" && response.blob.size > 0) {
            const url = URL.createObjectURL(response.blob)
            audioUrlRef.current = url
            const audio = new Audio(url)
            audioRef.current = audio

            audio.onplay = () => {
              if (generation === speakGenerationRef.current) {
                setSpeaking(true)
                setIsPaused(false)
              }
            }

            audio.onpause = () => {
              if (generation === speakGenerationRef.current && !audio.ended) {
                setIsPaused(true)
              }
            }

            audio.onended = () => {
              if (generation === speakGenerationRef.current) {
                setSpeaking(false)
                setIsPaused(false)
              }
              URL.revokeObjectURL(url)
              if (audioUrlRef.current === url) audioUrlRef.current = null
            }

            audio.onerror = () => {
              if (generation === speakGenerationRef.current) {
                setSpeaking(false)
                setIsPaused(false)
                speakWithBrowser(text, spokenLang)
              }
            }

            await audio.play()
            return
          }

          // Fallback to browser speech synthesis
          speakWithBrowser(text, spokenLang)
        } catch {
          if (generation !== speakGenerationRef.current) return
          speakWithBrowser(text, spokenLang)
        }
      })()
    },
    [stopSpeaking, speakWithBrowser]
  )

  // Stop listening helper
  const stopListening = useCallback(() => {
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current)
      vadIntervalRef.current = null
    }

    if (recognitionActiveRef.current && recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        /* ignore */
      }
    }

    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect()
      } catch {
        /* ignore */
      }
      scriptProcessorRef.current = null
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      void audioContextRef.current.close()
      audioContextRef.current = null
    }

    analyserRef.current = null
    setListening(false)
    setAudioLevel(0)

    // Process final speech result
    const localTranscript = recognizedTextRef.current.trim()
    if (localTranscript) {
      onFinalRef.current(localTranscript)
      recognizedTextRef.current = ""
      return
    }

    // If local browser transcript was empty, commit recorded PCM WAV to backend STT
    if (totalSamplesRef.current > 4000) {
      const merged = new Float32Array(totalSamplesRef.current)
      let offset = 0
      for (const chunk of pcmChunksRef.current) {
        merged.set(chunk, offset)
        offset += chunk.length
      }

      const wavBlob = encodeWAV(merged, 16000)
      pcmChunksRef.current = []
      totalSamplesRef.current = 0

      void (async () => {
        try {
          const hint = language === "auto" ? undefined : language
          const res = await transcribeAudio(wavBlob, hint)
          const text = (res.transcript || "").trim()
          if (text) {
            onFinalRef.current(text)
          } else {
            onErrorRef.current?.("No speech detected. Please speak clearly.")
          }
        } catch (err: any) {
          onErrorRef.current?.(err?.message || "Speech transcription failed.")
        }
      })()
    } else {
      pcmChunksRef.current = []
      totalSamplesRef.current = 0
    }
  }, [language])

  const cancelListening = useCallback(() => {
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current)
      vadIntervalRef.current = null
    }
    if (recognitionActiveRef.current && recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {
        /* ignore */
      }
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop())
      mediaStreamRef.current = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      void audioContextRef.current.close()
      audioContextRef.current = null
    }
    analyserRef.current = null
    pcmChunksRef.current = []
    totalSamplesRef.current = 0
    recognizedTextRef.current = ""
    setListening(false)
    setAudioLevel(0)
  }, [])

  // Start capturing speech
  const startListening = useCallback(async (): Promise<boolean> => {
    if (listening) return true

    // Voice interruption / barge-in: kill any active audio playback instantly
    stopSpeaking()

    pcmChunksRef.current = []
    totalSamplesRef.current = 0
    recognizedTextRef.current = ""
    hasSpokenRef.current = false
    lastSpeechTimeRef.current = Date.now()

    try {
      // 1. Acquire microphone stream with optimal acoustic preprocessing
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      })
      mediaStreamRef.current = stream

      // 2. Set up Web Audio API pipeline for genuine FFT analysis & PCM capture
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      const ctx = new AudioCtx()
      audioContextRef.current = ctx

      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      analyser.smoothingTimeConstant = 0.5
      source.connect(analyser)
      analyserRef.current = analyser

      // Script processor for PCM buffer collection & real-time RMS monitoring
      const processor = ctx.createScriptProcessor(2048, 1, 1)
      source.connect(processor)
      processor.connect(ctx.destination)
      scriptProcessorRef.current = processor

      processor.onaudioprocess = (e) => {
        const channelData = e.inputBuffer.getChannelData(0)
        pcmChunksRef.current.push(new Float32Array(channelData))
        totalSamplesRef.current += channelData.length

        // Calculate Root Mean Square (RMS) volume
        let sum = 0
        for (let i = 0; i < channelData.length; i++) {
          sum += channelData[i] * channelData[i]
        }
        const rms = Math.sqrt(sum / channelData.length)
        const normalizedLevel = Math.min(1, Math.max(0, rms * 4.5))
        setAudioLevel(normalizedLevel)

        // Voice Activity Detection: detect speech onset & silence pause
        if (rms > 0.025) {
          hasSpokenRef.current = true
          lastSpeechTimeRef.current = Date.now()
        }
      }

      // 3. Start Web Speech recognition concurrently for zero-latency interim transcripts
      const Ctor = browserSTTCtor()
      if (Ctor) {
        try {
          const rec = new Ctor()
          const bcp47 =
            language === "auto" ? "hi-IN" : LANG_TO_BCP47[language] ?? "hi-IN"
          rec.lang = bcp47
          rec.continuous = true
          rec.interimResults = true
          rec.maxAlternatives = 1

          rec.onstart = () => {
            recognitionActiveRef.current = true
          }

          rec.onresult = (ev) => {
            let interim = ""
            let final = ""
            for (let i = ev.resultIndex; i < ev.results.length; i++) {
              const r = ev.results[i]
              const piece = r[0]?.transcript ?? ""
              if (r.isFinal) {
                final += piece
              } else {
                interim += piece
              }
            }
            if (final) {
              recognizedTextRef.current += " " + final
            }
            const live = (recognizedTextRef.current + " " + interim).trim()
            if (live && onInterimRef.current) {
              onInterimRef.current(live)
            }
            hasSpokenRef.current = true
            lastSpeechTimeRef.current = Date.now()
          }

          rec.onerror = (ev) => {
            const err = ev.error || ""
            if (err && err !== "no-speech" && err !== "aborted") {
              logOrNotifyError(err)
            }
          }

          rec.onend = () => {
            recognitionActiveRef.current = false
          }

          recognitionRef.current = rec
          rec.start()
        } catch {
          /* Fall back entirely to server STT via PCM WAV */
        }
      }

      // 4. Silence monitor interval for automatic commit
      if (autoSilenceCommit) {
        vadIntervalRef.current = setInterval(() => {
          if (hasSpokenRef.current && Date.now() - lastSpeechTimeRef.current > silenceDurationMs) {
            stopListening()
          }
        }, 300)
      }

      setListening(true)
      return true
    } catch (e: any) {
      const msg = e?.name === "NotAllowedError"
        ? "Microphone access denied. Please allow microphone permission."
        : e?.message || "Unable to access microphone."
      onErrorRef.current?.(msg)
      setListening(false)
      return false
    }
  }, [listening, stopSpeaking, language, autoSilenceCommit, silenceDurationMs, stopListening])

  const logOrNotifyError = (err: string) => {
    if (err === "not-allowed" || err === "permission-denied") {
      onErrorRef.current?.("Microphone access denied.")
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelListening()
      stopSpeaking()
    }
  }, [cancelListening, stopSpeaking])

  return {
    speechSupported,
    listening,
    speaking,
    isPaused,
    audioLevel,
    analyserNode: analyserRef.current,
    getFrequencyData,
    startListening,
    stopListening,
    cancelListening,
    speak,
    pauseSpeaking,
    resumeSpeaking,
    stopSpeaking,
  }
}
