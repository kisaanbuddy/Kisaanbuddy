"use client"
/**
 * Compact language picker for the assistant widget.
 * Persists via useAssistant (which writes to localStorage).
 */
import type { Language } from "@/lib/assistant-api"

const OPTIONS: { value: Language; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "en", label: "EN" },
  { value: "hi", label: "हिं" },
  { value: "kn", label: "ಕನ್ನ" },
]

export function LanguagePicker({
  value,
  onChange,
}: {
  value: Language
  onChange: (v: Language) => void
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-full bg-black/5 dark:bg-white/10 p-0.5 text-[11px] font-medium">
      {OPTIONS.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`px-2 py-0.5 rounded-full transition-colors ${
              active
                ? "bg-green-500 text-white shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={active}
            aria-label={`Language: ${o.label}`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
