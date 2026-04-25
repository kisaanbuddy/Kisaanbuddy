"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

export type TempUnit = "C" | "F"

interface UnitContextValue {
  unit: TempUnit
  toggle: () => void
  setUnit: (u: TempUnit) => void
}

const UnitContext = createContext<UnitContextValue | null>(null)

const STORAGE_KEY = "krishiai.weather.unit"

export function UnitProvider({ children }: { children: ReactNode }) {
  const [unit, setUnitState] = useState<TempUnit>("C")

  // Restore from localStorage once on the client.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved === "C" || saved === "F") setUnitState(saved)
    } catch {
      /* ignore */
    }
  }, [])

  const setUnit = (u: TempUnit) => {
    setUnitState(u)
    try {
      window.localStorage.setItem(STORAGE_KEY, u)
    } catch {
      /* ignore */
    }
  }

  const toggle = () => setUnit(unit === "C" ? "F" : "C")

  return (
    <UnitContext.Provider value={{ unit, toggle, setUnit }}>{children}</UnitContext.Provider>
  )
}

export function useUnit() {
  const ctx = useContext(UnitContext)
  if (!ctx) {
    // Sensible fallback so components don't crash if used without provider.
    return { unit: "C" as TempUnit, toggle: () => {}, setUnit: () => {} }
  }
  return ctx
}

/** Picks the right field on a unified weather response for the active unit. */
export function pickTemp(c: number, f: number, unit: TempUnit): number {
  return unit === "C" ? c : f
}
