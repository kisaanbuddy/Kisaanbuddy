"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Search, Loader2, LocateFixed } from "lucide-react"

import { searchLocations, type LocationHit } from "@/lib/weather-api"

interface Props {
  onSelect: (hit: LocationHit) => void
  onUseCurrentLocation?: () => void
  placeholder?: string
  className?: string
}

const DEBOUNCE_MS = 250

export function LocationSearch({
  onSelect,
  onUseCurrentLocation,
  placeholder = "Search city…",
  className = "",
}: Props) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<LocationHit[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const controllerRef = useRef<AbortController | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Debounced search.
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    const timer = setTimeout(async () => {
      controllerRef.current?.abort()
      const ctrl = new AbortController()
      controllerRef.current = ctrl
      try {
        const { results } = await searchLocations(q, 6, ctrl.signal)
        setResults(results)
        setHighlight(0)
        setOpen(true)
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setResults([])
          setError(err?.message || "Search failed")
          setOpen(true)
        }
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [query])

  // Close on outside click.
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener("mousedown", handle)
    return () => window.removeEventListener("mousedown", handle)
  }, [])

  function choose(hit: LocationHit) {
    onSelect(hit)
    setQuery(hit.display_name)
    setOpen(false)
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlight((h) => (h + 1) % results.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlight((h) => (h - 1 + results.length) % results.length)
    } else if (e.key === "Enter") {
      e.preventDefault()
      const hit = results[highlight]
      if (hit) choose(hit)
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapRef} className={`relative w-full ${className}`}>
      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/60 px-4 py-2 shadow-sm backdrop-blur-lg transition focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/25 dark:bg-black/40">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          aria-label="Search for a city"
          autoComplete="off"
        />
        {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
        {onUseCurrentLocation && (
          <button
            type="button"
            onClick={onUseCurrentLocation}
            title="Use my current location"
            className="shrink-0 rounded-full p-1 text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
          >
            <LocateFixed className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (results.length > 0 || error) && (
        <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-white/95 shadow-xl backdrop-blur-xl dark:bg-neutral-900/95">
          {error ? (
            <div className="p-4 text-sm text-red-500">{error}</div>
          ) : (
            <ul role="listbox" className="max-h-72 overflow-y-auto py-1">
              {results.map((hit, i) => (
                <li
                  key={`${hit.lat},${hit.lon},${i}`}
                  role="option"
                  aria-selected={i === highlight}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => choose(hit)}
                  className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition ${
                    i === highlight ? "bg-primary/10 text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-foreground">{hit.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {[hit.region, hit.country].filter(Boolean).join(", ")}
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {hit.lat.toFixed(2)}, {hit.lon.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
