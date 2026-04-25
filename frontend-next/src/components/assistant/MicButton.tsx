"use client"
/**
 * Press-and-hold-style mic button with visual listening state.
 * Click to toggle in either direction (single click to start, single click to stop).
 */
import { Mic, MicOff } from "lucide-react"

export function MicButton({
  listening,
  disabled,
  onToggle,
}: {
  listening: boolean
  disabled?: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={listening}
      aria-label={listening ? "Stop listening" : "Start voice input"}
      className={`relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all ${
        listening
          ? "bg-red-500 text-white shadow-lg shadow-red-500/40"
          : "bg-green-500 text-white shadow hover:bg-green-600"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      {listening && (
        <span className="absolute inset-0 rounded-full animate-ping bg-red-500/40" />
      )}
    </button>
  )
}
