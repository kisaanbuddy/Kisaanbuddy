"use client"
/**
 * Live interim transcript shown above the composer while the mic is active.
 */
import { Mic } from "lucide-react"

export function TranscriptLive({
  text,
  active,
}: {
  text: string
  active: boolean
}) {
  if (!active) return null
  return (
    <div className="mx-3 mb-2 rounded-xl border border-green-300/60 bg-green-50/80 dark:bg-green-900/20 dark:border-green-800/60 px-3 py-2 text-xs text-green-800 dark:text-green-200 flex items-start gap-2">
      <Mic className="h-3.5 w-3.5 mt-0.5 animate-pulse text-green-600 dark:text-green-400" />
      <div className="min-h-[1rem] flex-1">
        {text || <span className="opacity-60">Listening…</span>}
      </div>
    </div>
  )
}
