"use client"

import { useUnit } from "./unit-context"

export function UnitToggle({ className = "" }: { className?: string }) {
  const { unit, setUnit } = useUnit()
  return (
    <div
      role="group"
      aria-label="Temperature unit"
      className={`inline-flex items-center rounded-full border border-white/15 bg-white/10 p-0.5 text-sm backdrop-blur-sm dark:bg-black/20 ${className}`}
    >
      {(["C", "F"] as const).map((u) => {
        const active = unit === u
        return (
          <button
            key={u}
            type="button"
            onClick={() => setUnit(u)}
            aria-pressed={active}
            className={`min-w-9 rounded-full px-3 py-1 font-semibold transition ${
              active
                ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            °{u}
          </button>
        )
      })}
    </div>
  )
}
