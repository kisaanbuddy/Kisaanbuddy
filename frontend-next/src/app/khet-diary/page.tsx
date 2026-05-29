"use client"
/**
 * KrishiAI — Khet Diary (Farm Activity Log)
 *
 * Farmers can log daily activities: sowing, irrigation, spraying, harvest,
 * notes, and optional photos. All data stored in localStorage.
 * Timeline sorted newest-first with date + weather context.
 */
import {
  BookOpen,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Droplets,
  Leaf,
  Loader2,
  Plus,
  Sprout,
  Sun,
  Trash2,
  Tractor,
  X,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

// ─── Types ─────────────────────────────────────────────────────────────────

type ActivityType =
  | "sowing"
  | "irrigation"
  | "fertilizer"
  | "spraying"
  | "weeding"
  | "harvest"
  | "ploughing"
  | "observation"
  | "other"

interface DiaryEntry {
  id: string
  date: string           // ISO date string YYYY-MM-DD
  activity: ActivityType
  crop: string
  notes: string
  imageDataUrl?: string
  weather?: string       // optional quick note: sunny / rainy / cloudy
  createdAt: number
}

// ─── Constants ──────────────────────────────────────────────────────────────

const ACTIVITY_LABEL: Record<ActivityType, { label: string; emoji: string; color: string }> = {
  sowing:      { label: "Sowing / Beej", emoji: "🌱", color: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300" },
  irrigation:  { label: "Irrigation / Sinchai", emoji: "💧", color: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300" },
  fertilizer:  { label: "Fertilizer / Khad", emoji: "🧪", color: "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300" },
  spraying:    { label: "Spraying / Chhidkav", emoji: "🚿", color: "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300" },
  weeding:     { label: "Weeding / Nindai", emoji: "🌿", color: "bg-lime-100 dark:bg-lime-500/20 text-lime-700 dark:text-lime-300" },
  harvest:     { label: "Harvest / Katai", emoji: "🌾", color: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300" },
  ploughing:   { label: "Ploughing / Jutai", emoji: "🚜", color: "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300" },
  observation: { label: "Observation / Jaanch", emoji: "🔍", color: "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300" },
  other:       { label: "Other / Anya", emoji: "📋", color: "bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300" },
}

const ACTIVITY_TYPES = Object.keys(ACTIVITY_LABEL) as ActivityType[]
const STORAGE_KEY = "krishiai_khet_diary"
const MAX_IMAGE_SIZE = 4 * 1024 * 1024 // 4 MB

// ─── Storage helpers ─────────────────────────────────────────────────────────

function readEntries(): DiaryEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return (JSON.parse(raw) as DiaryEntry[]).sort((a, b) => b.createdAt - a.createdAt)
  } catch { return [] }
}

function saveEntries(entries: DiaryEntry[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function KhetDiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [showForm, setShowForm] = useState(false)
  const [filterActivity, setFilterActivity] = useState<ActivityType | "">("")
  const [filterCrop, setFilterCrop] = useState("")

  useEffect(() => { setEntries(readEntries()) }, [])

  const addEntry = useCallback((entry: DiaryEntry) => {
    setEntries((prev) => {
      const updated = [entry, ...prev]
      saveEntries(updated)
      return updated
    })
    setShowForm(false)
  }, [])

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const updated = prev.filter((e) => e.id !== id)
      saveEntries(updated)
      return updated
    })
  }, [])

  const filtered = entries.filter((e) => {
    if (filterActivity && e.activity !== filterActivity) return false
    if (filterCrop && !e.crop.toLowerCase().includes(filterCrop.toLowerCase())) return false
    return true
  })

  // Group by month
  const groups = filtered.reduce<Record<string, DiaryEntry[]>>((acc, e) => {
    const month = e.date.slice(0, 7) // YYYY-MM
    if (!acc[month]) acc[month] = []
    acc[month].push(e)
    return acc
  }, {})

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <BookOpen className="h-4 w-4 text-emerald-500" />
            KrishiAI · Farm Diary
          </div>
          <h1 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-400">
            Khet Diary 📔
          </h1>
          <p className="text-muted-foreground mt-1">
            Apne khet ka rozaana record — sowing, irrigation, observation sab kuch.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2.5 transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4" />
          Naya Entry
        </button>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { label: "Total Entries", value: entries.length, icon: <BookOpen className="h-5 w-5" />, color: "from-emerald-500/20 to-teal-500/10" },
          { label: "This Month", value: entries.filter(e => e.date.startsWith(new Date().toISOString().slice(0, 7))).length, icon: <Calendar className="h-5 w-5" />, color: "from-blue-500/20 to-cyan-500/10" },
          { label: "Crops Tracked", value: new Set(entries.map(e => e.crop).filter(Boolean)).size, icon: <Sprout className="h-5 w-5" />, color: "from-amber-500/20 to-orange-500/10" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border border-border/60 bg-gradient-to-br ${s.color} p-4`}>
            <div className="text-muted-foreground mb-1">{s.icon}</div>
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      {entries.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <select
            value={filterActivity}
            onChange={(e) => setFilterActivity(e.target.value as ActivityType | "")}
            className="text-sm rounded-lg border border-border bg-card/60 px-3 py-1.5 text-foreground"
          >
            <option value="">All activities</option>
            {ACTIVITY_TYPES.map((a) => (
              <option key={a} value={a}>{ACTIVITY_LABEL[a].emoji} {ACTIVITY_LABEL[a].label}</option>
            ))}
          </select>
          <input
            value={filterCrop}
            onChange={(e) => setFilterCrop(e.target.value)}
            placeholder="Filter by crop..."
            className="text-sm rounded-lg border border-border bg-card/60 px-3 py-1.5 text-foreground placeholder:text-muted-foreground"
          />
          {(filterActivity || filterCrop) && (
            <button
              onClick={() => { setFilterActivity(""); setFilterCrop("") }}
              className="text-xs rounded-lg border border-border px-3 py-1.5 text-muted-foreground hover:text-foreground"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Entry form modal */}
      <AnimatePresence>
        {showForm && (
          <EntryForm onAdd={addEntry} onClose={() => setShowForm(false)} />
        )}
      </AnimatePresence>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-dashed border-border bg-card/30 p-12 text-center"
        >
          <div className="text-5xl mb-3">📔</div>
          <p className="text-muted-foreground">
            {entries.length === 0
              ? "Abhi koi entry nahi hai. Pehli entry add karo!"
              : "Koi entry filter se match nahi ki."}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groups)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([month, monthEntries]) => (
              <div key={month}>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  📅 {new Date(month + "-01").toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                </div>
                <div className="relative pl-6 border-l-2 border-border/60 space-y-4">
                  {monthEntries.map((entry, i) => (
                    <DiaryCard key={entry.id} entry={entry} onDelete={deleteEntry} index={i} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

// ─── Entry Form ───────────────────────────────────────────────────────────────

function EntryForm({ onAdd, onClose }: { onAdd: (e: DiaryEntry) => void; onClose: () => void }) {
  const [activity, setActivity] = useState<ActivityType>("observation")
  const [crop, setCrop] = useState("")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState("")
  const [weather, setWeather] = useState("")
  const [imageDataUrl, setImage] = useState<string | undefined>()
  const [imgError, setImgError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const onPick = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith("image/")) { setImgError("Only image files allowed"); return }
    if (file.size > MAX_IMAGE_SIZE) { setImgError("Image must be < 4 MB"); return }
    setImgError("")
    const reader = new FileReader()
    reader.onload = () => { if (typeof reader.result === "string") setImage(reader.result) }
    reader.readAsDataURL(file)
  }

  const submit = () => {
    const entry: DiaryEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      date,
      activity,
      crop: crop.trim(),
      notes: notes.trim(),
      weather: weather.trim() || undefined,
      imageDataUrl,
      createdAt: Date.now(),
    }
    onAdd(entry)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-lg rounded-2xl border border-border bg-background p-5 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">📔 Naya Entry</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Activity */}
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Activity</span>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value as ActivityType)}
            className="w-full rounded-lg border border-border bg-card/60 px-3 py-2 text-foreground text-sm"
          >
            {ACTIVITY_TYPES.map((a) => (
              <option key={a} value={a}>{ACTIVITY_LABEL[a].emoji} {ACTIVITY_LABEL[a].label}</option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          {/* Crop */}
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Fasal / Crop</span>
            <input
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              placeholder="e.g. Wheat, Paddy"
              className="w-full rounded-lg border border-border bg-card/60 px-3 py-2 text-foreground text-sm placeholder:text-muted-foreground"
            />
          </label>
          {/* Date */}
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-card/60 px-3 py-2 text-foreground text-sm"
            />
          </label>
        </div>

        {/* Weather */}
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Mausam (optional)</span>
          <div className="flex gap-2 flex-wrap">
            {["☀️ Sunny", "🌧️ Rainy", "⛅ Cloudy", "🌬️ Windy"].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWeather(weather === w ? "" : w)}
                className={`text-xs rounded-full px-3 py-1 border transition-colors ${
                  weather === w
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300"
                    : "border-border text-muted-foreground hover:border-emerald-400"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </label>

        {/* Notes */}
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Notes</span>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Aaj kya kiya? Koi observation? Koi problem?"
            className="w-full rounded-lg border border-border bg-card/60 px-3 py-2 text-foreground text-sm resize-none placeholder:text-muted-foreground"
          />
        </label>

        {/* Photo */}
        <div>
          <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Photo (optional)</span>
          {imageDataUrl ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageDataUrl} alt="entry" className="rounded-xl w-full h-32 object-cover" />
              <button
                onClick={() => setImage(undefined)}
                className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-xl border-2 border-dashed border-border hover:border-emerald-400 p-4 text-sm text-muted-foreground flex items-center justify-center gap-2 transition-colors"
            >
              <Camera className="h-4 w-4" />
              Photo khichein ya upload karein
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onPick(e.target.files?.[0])} />
          {imgError && <p className="text-xs text-red-500 mt-1">{imgError}</p>}
        </div>

        <button
          onClick={submit}
          disabled={!date}
          className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2.5 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
        >
          <CheckCircle2 className="h-4 w-4" />
          Entry Save Karo
        </button>
      </motion.div>
    </motion.div>
  )
}

// ─── Diary Card ───────────────────────────────────────────────────────────────

function DiaryCard({ entry, onDelete, index }: { entry: DiaryEntry; onDelete: (id: string) => void; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const info = ACTIVITY_LABEL[entry.activity]

  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="relative"
    >
      {/* Timeline dot */}
      <div className="absolute -left-[1.85rem] top-4 h-3 w-3 rounded-full border-2 border-emerald-500 bg-background" />

      <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${info.color}`}>
              {info.emoji} {info.label}
            </span>
            {entry.crop && (
              <span className="text-xs rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5">
                🌱 {entry.crop}
              </span>
            )}
            {entry.weather && (
              <span className="text-xs text-muted-foreground">{entry.weather}</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">
              {new Date(entry.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
            <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <button onClick={() => onDelete(entry.id)} className="text-muted-foreground hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {entry.notes && (
          <p className="text-sm text-foreground/80 mt-2 line-clamp-2">{entry.notes}</p>
        )}

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-border/60 space-y-2">
                {entry.notes && (
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap">{entry.notes}</p>
                )}
                {entry.imageDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.imageDataUrl}
                    alt="field photo"
                    className="rounded-xl w-full max-h-48 object-cover"
                  />
                )}
                <p className="text-xs text-muted-foreground">
                  📅 {new Date(entry.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
