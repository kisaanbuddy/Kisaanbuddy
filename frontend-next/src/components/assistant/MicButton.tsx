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
      className={`relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
        listening
          ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20 ring-2 ring-rose-500/20"
          : "bg-emerald-500 hover:bg-emerald-600 text-white shadow hover:shadow-emerald-500/10"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {listening ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
      {listening && (
        <span className="absolute inset-0 rounded-xl animate-ping bg-rose-500/30" />
      )}
    </button>
  )
}
