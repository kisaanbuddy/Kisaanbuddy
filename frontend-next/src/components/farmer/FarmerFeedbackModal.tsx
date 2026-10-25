"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  ThumbsUp,
  Sliders,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  Camera,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
  ChevronLeft,
  Volume2,
  Sparkles,
  CloudSun,
  TrendingUp,
  Sprout,
  Store,
  Users,
  Landmark,
  Layers,
  ArrowRight
} from "lucide-react"

import { useLanguage, type Lang } from "@/lib/language"
import { getFeedbackDict } from "@/lib/feedback-i18n"
import { useFarmerFeedback } from "./FarmerFeedbackContext"

const MAX_RECORDING_SECONDS = 90

interface StepState {
  step: "welcome" | "type_select" | "details" | "confirm" | "success"
  feedbackType: string
  category: string
  guidedOption: string
  contentText: string
  audioBlob: Blob | null
  audioDuration: number
  audioUrl: string | null
  imageFile: File | null
  imagePreview: string | null
  contactConsent: boolean
  contactInfo: string
  referenceId: string
}

export function FarmerFeedbackModal() {
  const { isOpen, options, closeFeedback } = useFarmerFeedback()
  const { lang } = useLanguage()
  const d = getFeedbackDict(lang)

  const [state, setState] = useState<StepState>({
    step: "welcome",
    feedbackType: "",
    category: "general",
    guidedOption: "",
    contentText: "",
    audioBlob: null,
    audioDuration: 0,
    audioUrl: null,
    imageFile: null,
    imagePreview: null,
    contactConsent: false,
    contactInfo: "",
    referenceId: "",
  })

  // Audio Recording states
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [micError, setMicError] = useState<string | null>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [audioPlaybackTime, setAudioPlaybackTime] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [hasCopiedRef, setHasCopiedRef] = useState(false)

  // Reset or configure when opened
  useEffect(() => {
    if (isOpen) {
      const initialCat = options.category || "general"
      const initialType = options.feedbackType || ""
      const initialGuided = options.guidedOption || ""
      
      setState({
        step: initialType ? "details" : "welcome",
        feedbackType: initialType,
        category: initialCat,
        guidedOption: initialGuided,
        contentText: "",
        audioBlob: null,
        audioDuration: 0,
        audioUrl: null,
        imageFile: null,
        imagePreview: null,
        contactConsent: false,
        contactInfo: "",
        referenceId: "",
      })
      setMicError(null)
      setSubmitError(null)
    } else {
      cleanupAudio()
    }
  }, [isOpen, options])

  // Cleanup helper
  const cleanupAudio = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop()
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      } catch {}
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause()
      audioPlayerRef.current = null
    }
    setIsRecording(false)
    setIsPlayingAudio(false)
  }, [])

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        closeFeedback()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, isSubmitting, closeFeedback])

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev + 1 >= MAX_RECORDING_SECONDS) {
            stopRecording()
            return MAX_RECORDING_SECONDS
          }
          return prev + 1
        })
      }, 1000)
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
      }
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    }
  }, [isRecording])

  // --- Voice Handlers ---
  const startRecording = async () => {
    setMicError(null)
    audioChunksRef.current = []

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicError(d.micUnavailable)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : ""

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const finalBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        })
        const finalUrl = URL.createObjectURL(finalBlob)
        setState((prev) => ({
          ...prev,
          audioBlob: finalBlob,
          audioDuration: recordingSeconds,
          audioUrl: finalUrl,
        }))
        stream.getTracks().forEach((track) => track.stop())
      }

      setRecordingSeconds(0)
      recorder.start(250) // collect slice every 250ms
      setIsRecording(true)
    } catch (err: any) {
      console.warn("Microphone access denied or error:", err)
      setMicError(d.micDenied)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
  }

  const deleteRecording = () => {
    cleanupAudio()
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl)
    }
    setState((prev) => ({
      ...prev,
      audioBlob: null,
      audioDuration: 0,
      audioUrl: null,
    }))
    setRecordingSeconds(0)
  }

  const togglePlayAudio = () => {
    if (!state.audioUrl) return
    if (!audioPlayerRef.current) {
      const audio = new Audio(state.audioUrl)
      audioPlayerRef.current = audio
      audio.onended = () => {
        setIsPlayingAudio(false)
        setAudioPlaybackTime(0)
      }
      audio.ontimeupdate = () => {
        setAudioPlaybackTime(Math.floor(audio.currentTime))
      }
    }

    if (isPlayingAudio) {
      audioPlayerRef.current.pause()
      setIsPlayingAudio(false)
    } else {
      audioPlayerRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {})
    }
  }

  // --- Photo Attachment Handlers ---
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (JPG, PNG, WebP).")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image is larger than 5MB. Please choose a smaller photo.")
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setState((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: previewUrl,
    }))
  }

  const removePhoto = () => {
    if (state.imagePreview) {
      URL.revokeObjectURL(state.imagePreview)
    }
    setState((prev) => ({
      ...prev,
      imageFile: null,
      imagePreview: null,
    }))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // --- Submission Handler ---
  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const formData = new FormData()
      formData.append("feedback_type", state.feedbackType || "improvement")
      formData.append("category", state.category || "general")
      if (state.guidedOption) formData.append("guided_option", state.guidedOption)
      if (state.contentText) formData.append("content_text", state.contentText)
      formData.append("language", lang)
      formData.append("source_page", options.sourcePage || "/")
      formData.append("contact_consent", state.contactConsent ? "true" : "false")
      if (state.contactInfo) formData.append("contact_info", state.contactInfo)

      if (state.audioBlob) {
        formData.append("audio_file", state.audioBlob, "farmer_voice.webm")
        formData.append("audio_duration_seconds", String(state.audioDuration || recordingSeconds || 0))
      }

      if (state.imageFile) {
        formData.append("image_file", state.imageFile, state.imageFile.name)
      }

      const res = await fetch("/api/feedback", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.detail || d.errorGeneric)
      }

      const data = await res.json()
      setState((prev) => ({
        ...prev,
        step: "success",
        referenceId: data.feedback_ref || "KB-FB-OK",
      }))
    } catch (err: any) {
      setSubmitError(err.message || d.errorGeneric)
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyRefToClipboard = () => {
    if (!state.referenceId) return
    navigator.clipboard?.writeText(state.referenceId)
    setHasCopiedRef(true)
    setTimeout(() => setHasCopiedRef(false), 2500)
  }

  if (!isOpen) return null

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  // Type definitions
  const FEEDBACK_TYPES = [
    {
      id: "positive",
      icon: ThumbsUp,
      title: d.likeTitle,
      desc: d.likeDesc,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300",
      activeBg: "ring-2 ring-emerald-600 bg-emerald-100/80 dark:bg-emerald-900/40",
    },
    {
      id: "improvement",
      icon: Sliders,
      title: d.betterTitle,
      desc: d.betterDesc,
      color: "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300",
      activeBg: "ring-2 ring-blue-600 bg-blue-100/80 dark:bg-blue-900/40",
    },
    {
      id: "issue",
      icon: AlertTriangle,
      title: d.issueTitle,
      desc: d.issueDesc,
      color: "text-amber-800 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300",
      activeBg: "ring-2 ring-amber-600 bg-amber-100/80 dark:bg-amber-900/40",
    },
    {
      id: "idea",
      icon: Lightbulb,
      title: d.ideaTitle,
      desc: d.ideaDesc,
      color: "text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300",
      activeBg: "ring-2 ring-purple-600 bg-purple-100/80 dark:bg-purple-900/40",
    },
    {
      id: "help",
      icon: HelpCircle,
      title: d.helpTitle,
      desc: d.helpDesc,
      color: "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300",
      activeBg: "ring-2 ring-rose-600 bg-rose-100/80 dark:bg-rose-900/40",
    },
  ]

  // Category definitions
  const CATEGORIES = [
    { id: "general", label: d.catGeneral, icon: Layers },
    { id: "mandi", label: d.catMandi, icon: TrendingUp },
    { id: "weather", label: d.catWeather, icon: CloudSun },
    { id: "disease", label: d.catDisease, icon: Sprout },
    { id: "marketplace", label: d.catMarketplace, icon: Store },
    { id: "workers", label: d.catWorkers, icon: Users },
    { id: "schemes", label: d.catSchemes, icon: Landmark },
  ]

  // Guided tags per category or general
  const GUIDED_TAGS = [
    d.tagWrongPrice,
    d.tagMissingCrop,
    d.tagSlowApp,
    d.tagVoiceHelp,
    d.tagMoreMarkets,
    d.tagEasyLanguage,
    d.tagNeedBuyer,
    d.tagLabourNeed,
  ]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity overflow-y-auto"
    >
      <div
        ref={modalRef}
        className="w-full max-w-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-in fade-in slide-in-from-bottom-4 duration-200"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80">
          <div className="flex items-center gap-2.5">
            {state.step !== "welcome" && state.step !== "success" && (
              <button
                type="button"
                onClick={() => {
                  if (state.step === "confirm") setState((p) => ({ ...p, step: "details" }))
                  else if (state.step === "details") setState((p) => ({ ...p, step: "type_select" }))
                  else if (state.step === "type_select") setState((p) => ({ ...p, step: "welcome" }))
                }}
                className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
                aria-label={d.backBtn}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 id="feedback-modal-title" className="text-base sm:text-lg font-bold text-stone-900 dark:text-white">
                {d.modalTitle}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={closeFeedback}
            className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP: WELCOME */}
          {state.step === "welcome" && (
            <div className="space-y-6 text-center py-2">
              {/* Friendly illustration badge */}
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Volume2 className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                  {d.modalTitle}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  {d.modalSubtitle}
                </p>
              </div>

              {/* Two large, farmer-first starting methods */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Voice first method */}
                <button
                  type="button"
                  onClick={() => {
                    setState((p) => ({ ...p, feedbackType: "improvement", step: "details" }))
                    setTimeout(() => startRecording(), 300)
                  }}
                  className="flex items-center gap-3.5 p-4 rounded-2xl border-2 border-emerald-600/40 bg-emerald-50/80 dark:bg-emerald-950/30 hover:border-emerald-600 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
                    <Mic className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                      {d.methodVoice}
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-snug">
                      {d.methodVoiceDesc}
                    </p>
                  </div>
                </button>

                {/* Visual choices method */}
                <button
                  type="button"
                  onClick={() => setState((p) => ({ ...p, step: "type_select" }))}
                  className="flex items-center gap-3.5 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 hover:border-emerald-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                      {d.methodChoices}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-snug">
                      {d.methodChoicesDesc}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP: TYPE SELECT (5 CLEAR CHOICES) */}
          {state.step === "type_select" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white">
                  {d.step1Heading}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {d.modalSubtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FEEDBACK_TYPES.map((t) => {
                  const Icon = t.icon
                  const isSelected = state.feedbackType === t.id
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setState((p) => ({ ...p, feedbackType: t.id, step: "details" }))
                      }}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                        t.color
                      } ${isSelected ? t.activeBg : "hover:border-current/60"}`}
                    >
                      <div className="p-2 rounded-xl bg-white dark:bg-stone-900/80 shadow-xs shrink-0 mt-0.5">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-stone-900 dark:text-white">
                          {t.title}
                        </div>
                        <div className="text-xs text-stone-600 dark:text-stone-400 leading-snug">
                          {t.desc}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP: DETAILS (VOICE + GUIDED CHOICES + OPTIONAL TEXT) */}
          {state.step === "details" && (
            <div className="space-y-5">
              {/* Selected Type Badge */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                  {d.step2Heading}
                </span>
                {state.feedbackType && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border border-emerald-600/20">
                    {FEEDBACK_TYPES.find((t) => t.id === state.feedbackType)?.title || state.feedbackType}
                  </span>
                )}
              </div>

              {/* 1. VOICE RECORDER CARD (VOICE-FIRST) */}
              <div className="p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-600 text-white">
                      <Mic className="w-4 h-4" />
                    </span>
                    <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                      {d.methodVoice}
                    </h4>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                    {d.maxDuration}
                  </span>
                </div>

                {/* Mic denied warning if any */}
                {micError && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs">
                    {micError}
                  </div>
                )}

                {/* Recording Controls */}
                {!state.audioBlob ? (
                  <div className="flex flex-col items-center justify-center py-2 space-y-3">
                    {isRecording ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <button
                            type="button"
                            onClick={stopRecording}
                            className="relative w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors"
                            aria-label={d.stopRecording}
                          >
                            <Square className="w-6 h-6 fill-current" />
                          </button>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-red-600 dark:text-red-400 animate-pulse">
                            {d.recording} ({formatTime(recordingSeconds)})
                          </p>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400">
                            {d.stopRecording}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <button
                          type="button"
                          onClick={startRecording}
                          className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:bg-emerald-700 active:scale-95 transition-all focus:ring-4 focus:ring-emerald-500/30"
                          aria-label={d.startRecording}
                        >
                          <Mic className="w-7 h-7" />
                        </button>
                        <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                          {d.startRecording}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Audio playback preview */
                  <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-emerald-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={togglePlayAudio}
                          className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs hover:bg-emerald-700 transition-colors"
                          aria-label={isPlayingAudio ? d.pauseAudio : d.playAudio}
                        >
                          {isPlayingAudio ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                        </button>
                        <div>
                          <div className="text-xs font-bold text-stone-900 dark:text-white">
                            {d.playAudio}
                          </div>
                          <div className="text-[11px] text-stone-500 dark:text-stone-400">
                            {isPlayingAudio ? formatTime(audioPlaybackTime) : formatTime(state.audioDuration)} / {formatTime(state.audioDuration)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            deleteRecording()
                            setTimeout(() => startRecording(), 200)
                          }}
                          className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 text-xs font-medium flex items-center gap-1"
                          title={d.reRecord}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{d.reRecord}</span>
                        </button>
                        <button
                          type="button"
                          onClick={deleteRecording}
                          className="p-2 rounded-lg text-destructive hover:bg-destructive/10 text-xs font-medium flex items-center gap-1"
                          title={d.deleteAudio}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{d.deleteAudio}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. CATEGORY SELECTION */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Topic / Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => {
                    const isSelected = state.category === cat.id
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setState((p) => ({ ...p, category: cat.id }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                          isSelected
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-emerald-400"
                        }`}
                      >
                        <cat.icon className="w-3.5 h-3.5" />
                        <span>{cat.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 3. GUIDED QUICK CHIPS */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Quick Suggestion Options (Tap any)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {GUIDED_TAGS.map((tag) => {
                    const isSelected = state.guidedOption === tag
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          setState((p) => ({
                            ...p,
                            guidedOption: isSelected ? "" : tag,
                          }))
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
                          isSelected
                            ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                            : "bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-teal-400"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 4. OPTIONAL TEXT & PHOTO */}
              <div className="space-y-3 pt-2 border-t border-stone-200 dark:border-stone-800">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    {d.textLabel}
                  </label>
                  <textarea
                    value={state.contentText}
                    onChange={(e) => setState((p) => ({ ...p, contentText: e.target.value }))}
                    placeholder={d.textPlaceholder}
                    rows={3}
                    maxLength={2000}
                    className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/40 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Photo upload trigger and preview */}
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />

                  {!state.imagePreview ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-xs font-medium flex items-center gap-1.5 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{d.attachPhoto}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 p-1.5 bg-stone-100 dark:bg-stone-800 rounded-xl">
                      <img
                        src={state.imagePreview}
                        alt="Preview"
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                      <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                        {d.photoAttached}
                      </span>
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="p-1 text-destructive hover:bg-destructive/10 rounded-md"
                        title={d.removePhoto}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 5. OPTIONAL CONTACT PERMISSION */}
              <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-2">
                <label className="flex items-start gap-2.5 text-xs text-stone-600 dark:text-stone-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.contactConsent}
                    onChange={(e) => setState((p) => ({ ...p, contactConsent: e.target.checked }))}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{d.contactConsentLabel}</span>
                </label>

                {state.contactConsent && (
                  <input
                    type="text"
                    value={state.contactInfo}
                    onChange={(e) => setState((p) => ({ ...p, contactInfo: e.target.value }))}
                    placeholder={d.contactInputPlaceholder}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 focus:ring-2 focus:ring-emerald-500"
                  />
                )}
              </div>

              {/* Validation warning if completely empty */}
              {!state.audioBlob && !state.guidedOption && !state.contentText.trim() && (
                <p className="text-[11px] text-amber-700 dark:text-amber-400 italic">
                  * Please record your voice, select an option above, or type a note before sending.
                </p>
              )}

              {/* Action buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setState((p) => ({ ...p, step: "type_select" }))}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  {d.backBtn}
                </button>
                <button
                  type="button"
                  disabled={!state.audioBlob && !state.guidedOption && !state.contentText.trim()}
                  onClick={() => setState((p) => ({ ...p, step: "confirm" }))}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
                >
                  <span>Review & Send</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP: CONFIRM & SUMMARY */}
          {state.step === "confirm" && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  {d.step3Heading}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Please check your suggestion summary below.
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">Feedback Type</span>
                  <span className="font-bold text-stone-900 dark:text-white capitalize">
                    {FEEDBACK_TYPES.find((t) => t.id === state.feedbackType)?.title || state.feedbackType}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">Topic</span>
                  <span className="font-bold text-stone-900 dark:text-white capitalize">
                    {CATEGORIES.find((c) => c.id === state.category)?.label || state.category}
                  </span>
                </div>

                {state.guidedOption && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">Selected Option</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      {state.guidedOption}
                    </span>
                  </div>
                )}

                {state.audioBlob && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-200 dark:border-stone-700">
                    <span className="text-stone-500 flex items-center gap-1">
                      <Mic className="w-3.5 h-3.5 text-emerald-600" />
                      Voice Recording
                    </span>
                    <span className="font-bold text-stone-900 dark:text-white">
                      {formatTime(state.audioDuration)} ({d.voiceRecordedNotice})
                    </span>
                  </div>
                )}

                {state.contentText && (
                  <div className="text-xs pt-1 border-t border-stone-200 dark:border-stone-700">
                    <span className="text-stone-500 block mb-1">Written Note:</span>
                    <p className="text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-900 p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 italic">
                      &ldquo;{state.contentText}&rdquo;
                    </p>
                  </div>
                )}

                {state.imagePreview && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-200 dark:border-stone-700">
                    <span className="text-stone-500">Attached Photo</span>
                    <span className="font-semibold text-stone-900 dark:text-white">Yes</span>
                  </div>
                )}
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  {submitError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setState((p) => ({ ...p, step: "details" }))}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  {d.backBtn}
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md disabled:opacity-50 flex items-center gap-2 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{d.sendingBtn}</span>
                    </>
                  ) : (
                    <span>{d.sendBtn}</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP: SUCCESS */}
          {state.step === "success" && (
            <div className="space-y-6 text-center py-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white">
                  {d.successTitle}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  {d.successDesc}
                </p>
              </div>

              {/* Reference ID card with copy button */}
              {state.referenceId && (
                <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <div className="text-left">
                    <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">
                      {d.refLabel}
                    </span>
                    <span className="font-mono text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                      {state.referenceId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={copyRefToClipboard}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                    title="Copy Reference ID"
                  >
                    {hasCopiedRef ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}

              <div>
                <button
                  type="button"
                  onClick={closeFeedback}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-colors"
                >
                  {d.closeBtn}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
