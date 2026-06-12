"use client"
import { useLanguage } from '@/lib/language'
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
  Sparkles,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, GlassCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  sowing:      { label: "Sowing / Beej", emoji: "🌱", color: "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" },
  irrigation:  { label: "Irrigation / Sinchai", emoji: "💧", color: "bg-blue-500/10 border border-blue-500/20 text-blue-400" },
  fertilizer:  { label: "Fertilizer / Khad", emoji: "🧪", color: "bg-amber-500/10 border border-amber-500/20 text-amber-400" },
  spraying:    { label: "Spraying / Chhidkav", emoji: "🚿", color: "bg-sky-500/10 border border-sky-500/20 text-sky-400" },
  weeding:     { label: "Weeding / Nindai", emoji: "🌿", color: "bg-lime-500/10 border border-lime-500/20 text-lime-400" },
  harvest:     { label: "Harvest / Katai", emoji: "🌾", color: "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400" },
  ploughing:   { label: "Ploughing / Jutai", emoji: "🚜", color: "bg-orange-500/10 border border-orange-500/20 text-orange-400" },
  observation: { label: "Observation / Jaanch", emoji: "🔍", color: "bg-purple-500/10 border border-purple-500/20 text-purple-400" },
  other:       { label: "Other / Anya", emoji: "📋", color: "bg-slate-500/10 border border-white/[0.08] text-muted-foreground" },
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
  const { t } = useLanguage()
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
    <div className="space-y-8 max-w-4xl mx-auto pb-12 relative">
      {/* Decorative Blob */}
      <div className="absolute top-[-10%] right-[10%] w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] left-[5%] w-[300px] h-[300px] rounded-full bg-teal-500/5 blur-[100px] pointer-events-none -z-10" />

      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-r from-emerald-950/20 via-slate-950 to-teal-950/15 p-6 md:p-8 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-3">
              <BookOpen className="h-3.5 w-3.5" />
              Digital Ledger · खेती का हिसाब
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white">
              Khet <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-500 bg-clip-text text-transparent">{t("khet_diary.diary")}</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
              Log daily activities: sowing timelines, irrigation logs, fertilizer doses, harvest quantities, and soil observations. Kept locally in browser context.
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-11 px-5 shadow-lg shadow-emerald-500/15 shrink-0 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>{t("khet_diary.naya_entry")}</span>
          </Button>
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { label: "Total Entries", value: entries.length, icon: <BookOpen className="h-5 w-5 text-emerald-400" />, border: "border-emerald-500/10 bg-emerald-500/5 text-emerald-400" },
          { label: "This Month", value: entries.filter(e => e.date.startsWith(new Date().toISOString().slice(0, 7))).length, icon: <Calendar className="h-5 w-5 text-blue-400" />, border: "border-blue-500/10 bg-blue-500/5 text-blue-400" },
          { label: "Crops Tracked", value: new Set(entries.map(e => e.crop).filter(Boolean)).size, icon: <Sprout className="h-5 w-5 text-amber-400" />, border: "border-amber-500/10 bg-amber-500/5 text-amber-400" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border ${s.border} p-4 backdrop-blur-md shadow-sm`}>
            <div className="mb-1.5">{s.icon}</div>
            <div className="text-2xl font-black text-white font-display">{s.value}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      {entries.length > 0 && (
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={filterActivity}
            onChange={(e) => setFilterActivity(e.target.value as ActivityType | "")}
            className="text-xs rounded-xl border border-white/[0.08] bg-slate-950/40 px-3.5 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all cursor-pointer font-semibold"
          >
            <option value="" className="bg-slate-900">{t("khet_diary.all_activities")}</option>
            {ACTIVITY_TYPES.map((a) => (
              <option key={a} value={a} className="bg-slate-900">{ACTIVITY_LABEL[a].emoji} {ACTIVITY_LABEL[a].label}</option>
            ))}
          </select>
          <Input
            value={filterCrop}
            onChange={(e) => setFilterCrop(e.target.value)}
            placeholder={t("khet_diary.filter_by_crop")}
            className="h-9 w-44 rounded-xl border-white/[0.08] bg-slate-950/40 text-foreground px-4 text-xs font-semibold focus-visible:ring-emerald-500/30 text-white placeholder:text-muted-foreground/60"
          />
          {(filterActivity || filterCrop) && (
            <Button
              onClick={() => { setFilterActivity(""); setFilterCrop("") }}
              variant="outline"
              className="h-9 text-xs rounded-xl border-white/[0.08] hover:bg-white/[0.03] text-muted-foreground hover:text-white px-3.5 font-bold"
            >
              Clear filters
            </Button>
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
          className="rounded-2xl border border-dashed border-white/[0.08] bg-slate-950/20 p-12 text-center"
        >
          <div className="text-4xl mb-3">📔</div>
          <p className="text-muted-foreground text-sm font-semibold">
            {entries.length === 0
              ? "Abhi tak koi diary entry nahi hai. Nayi entry shuru karein!"
              : "No records found matching filters."}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groups)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([month, monthEntries]) => (
              <div key={month} className="space-y-4">
                <div className="text-xs font-black text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-3 py-1 rounded-lg w-fit font-mono">
                  📅 {new Date(month + "-01").toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                </div>
                <div className="relative pl-6 border-l border-white/[0.08] space-y-4 ml-3">
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
        className="w-full max-w-lg rounded-3xl border border-white/[0.08] bg-slate-950 p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <h2 className="text-md font-bold text-white font-display">📔 Khet Diary Entry</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Activity Selection */}
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold block">Select Activity / काम</Label>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value as ActivityType)}
            className="w-full rounded-xl border border-white/[0.08] bg-slate-900/60 px-3.5 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all cursor-pointer"
          >
            {ACTIVITY_TYPES.map((a) => (
              <option key={a} value={a} className="bg-slate-900">{ACTIVITY_LABEL[a].emoji} {ACTIVITY_LABEL[a].label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Crop */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold block">{t("khet_diary.fasal_crop")}</Label>
            <Input
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              placeholder={t("khet_diary.e_g_wheat_paddy")}
              className="h-11 rounded-xl border-white/[0.08] bg-slate-900/60 text-foreground px-4 text-xs font-semibold focus-visible:ring-emerald-500/30 text-white"
            />
          </div>
          {/* Date */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold block">{t("khet_diary.date")}</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-11 rounded-xl border-white/[0.08] bg-slate-900/60 text-foreground px-4 text-xs font-semibold focus-visible:ring-emerald-500/30 text-white cursor-pointer"
            />
          </div>
        </div>

        {/* Weather selection */}
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold block">{t("khet_diary.mausam_weather_optional")}</Label>
          <div className="flex gap-2 flex-wrap">
            {["☀️ Sunny", "🌧️ Rainy", "⛅ Cloudy", "🌬️ Windy"].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWeather(weather === w ? "" : w)}
                className={`text-[11px] font-bold rounded-xl px-3.5 py-1.5 border transition-all ${
                  weather === w
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-white/[0.08] bg-slate-900/40 text-muted-foreground hover:border-emerald-500/20"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold block">{t("khet_diary.notes_description")}</Label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("khet_diary.aaj_kya_kiya_feed")}
            className="w-full rounded-xl border border-white/[0.08] bg-slate-900/60 px-3.5 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none placeholder:text-muted-foreground/60 text-white"
          />
        </div>

        {/* Photo Upload */}
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold block">{t("khet_diary.photo_optional")}</Label>
          {imageDataUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.08]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageDataUrl} alt={t("khet_diary.entry_preview")} className="w-full h-36 object-cover" />
              <button
                onClick={() => setImage(undefined)}
                className="absolute top-2.5 right-2.5 rounded-full bg-slate-950/80 hover:bg-slate-900 p-1.5 text-white transition-colors"
                title={t("khet_diary.remove_image")}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              type="button"
              className="w-full rounded-xl border-2 border-dashed border-white/[0.08] hover:border-emerald-500/20 p-4 text-xs font-semibold text-muted-foreground flex items-center justify-center gap-2 hover:bg-white/[0.01] transition-all"
            >
              <Camera className="h-4.5 w-4.5 text-emerald-400" />
              Photo khichein ya upload karein
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onPick(e.target.files?.[0])} />
          {imgError && <p className="text-[10px] text-rose-400 font-semibold">{imgError}</p>}
        </div>

        <Button
          onClick={submit}
          disabled={!date}
          className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-11 flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/15"
        >
          <CheckCircle2 className="h-4.5 w-4.5" />
          Entry Save Karo
        </Button>
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
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      className="relative"
    >
      {/* Timeline dot decoration */}
      <div className="absolute -left-[1.85rem] top-[18px] h-2.5 w-2.5 rounded-full border border-emerald-500 bg-slate-950 shadow-[0_0_6px_rgba(16,185,129,0.5)] z-10" />

      <div className="rounded-2xl border border-white/[0.08] bg-slate-950/20 backdrop-blur-md p-4.5 shadow-lg hover:border-white/[0.12] transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold rounded-full px-2.5 py-0.5 uppercase tracking-wide ${info.color}`}>
              {info.emoji} {info.label}
            </span>
            {entry.crop && (
              <span className="text-[10px] font-bold rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 uppercase">
                🌱 {entry.crop}
              </span>
            )}
            {entry.weather && (
              <span className="text-[10px] font-bold rounded-full bg-white/[0.04] px-2 py-0.5 text-muted-foreground border border-white/[0.05]">{entry.weather}</span>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-mono font-bold text-muted-foreground">
              {new Date(entry.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
            <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-white transition-colors">
              {expanded ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
            </button>
            <button onClick={() => onDelete(entry.id)} className="text-muted-foreground hover:text-rose-400 transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {entry.notes && !expanded && (
          <p className="text-xs text-muted-foreground/95 leading-relaxed mt-3 line-clamp-2">{entry.notes}</p>
        )}

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-white/[0.04] space-y-3">
                {entry.notes && (
                  <p className="text-xs text-muted-foreground/95 leading-relaxed whitespace-pre-wrap">{entry.notes}</p>
                )}
                {entry.imageDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <div className="rounded-2xl overflow-hidden border border-white/[0.08] max-w-md">
                    <img
                      src={entry.imageDataUrl}
                      alt={t("khet_diary.field_observation_attachment")}
                      className="w-full max-h-52 object-cover"
                    />
                  </div>
                )}
                <div className="text-[9px] font-mono text-muted-foreground/50">
                  Created at: {new Date(entry.createdAt).toLocaleString("en-IN")}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
