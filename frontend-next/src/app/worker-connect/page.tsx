"use client"
import { useLanguage } from "@/lib/language"
/**
 * KrishiAI — Worker Connect portal
 *
 * Two modes side-by-side via tabs:
 *   1. "Hire workers" (farmer)  — form to post a job
 *   2. "Find jobs"   (worker)   — search + listing
 *
 * Reuses the typed /api/worker-connect client in @/lib/jobs-api.
 * UI labels in Hinglish/Hindi/Kannada/English depending on the picker.
 */
import {
  Briefcase,
  CheckCircle2,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
  Calendar,
  IndianRupee,
  ChevronRight,
  User,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

import {
  type Job,
  type JobMatch,
  type JobPostIn,
  type Language,
  type WageSuggestion,
  type WorkType,
  WORK_TYPES,
  WORK_TYPE_LABEL,
  listJobs,
  postJob,
  searchJobs,
  suggestWage,
} from "@/lib/jobs-api"
import { Card, GlassCard, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Mode = "hire" | "find"

const TAB_LABEL: Record<Mode, Record<Language, string>> = {
  hire: { auto: "Mazdoor chahiye", en: "Hire workers", hi: "मज़दूर चाहिए", kn: "ಕೆಲಸಗಾರ ಬೇಕು" },
  find: { auto: "Kaam dhundo",     en: "Find jobs",    hi: "काम ढूँढो",     kn: "ಕೆಲಸ ಹುಡುಕಿ" },
}

const SAFETY_TIP: Record<Language, string> = {
  auto: "⚠️ Bina verification ke advance payment mat dena. Pehli baar mile to public jagah pe milein.",
  en: "⚠️ Don't pay any advance without verifying. Meet for the first time in a public place.",
  hi: "⚠️ बिना सत्यापन के कोई एडवांस मत देना। पहली बार सार्वजनिक जगह पर मिलें।",
  kn: "⚠️ ಪರಿಶೀಲನೆ ಇಲ್ಲದೆ ಅಡ್ವಾನ್ಸ್ ನೀಡಬೇಡಿ. ಮೊದಲ ಬಾರಿ ಸಾರ್ವಜನಿಕ ಸ್ಥಳದಲ್ಲಿ ಭೇಟಿಯಾಗಿ.",
}

const HEADING: Record<Language, string> = {
  auto: "Worker Connect",
  en: "Worker Connect",
  hi: "वर्कर कनेक्ट",
  kn: "ವರ್ಕರ್ ಕನೆಕ್ಟ್",
}

const SUBHEADING: Record<Language, string> = {
  auto: "Farm pe mazdoor hire karo ya kaam dhundo — WhatsApp jaise simple.",
  en: "Hire farm workers or find work — as simple as WhatsApp.",
  hi: "खेत पर मज़दूर रखें या काम ढूँढें — WhatsApp जैसे आसान।",
  kn: "ಹೊಲಕ್ಕೆ ಕೆಲಸಗಾರರನ್ನು ನೇಮಿಸಿಕೊಳ್ಳಿ ಅಥವಾ ಕೆಲಸ ಹುಡುಕಿ — WhatsApp ರೀತಿಯಲ್ಲಿ ಸುಲಭ.",
}

function workTypeLabel(wt: WorkType, lang: Language): string {
  const key = lang === "auto" ? "en" : lang
  return WORK_TYPE_LABEL[wt][key]
}

export default function JobsPage() {
  const { t, lang } = useLanguage()
  const [language, setLanguage] = useState<Language>(lang)
  const [mode, setMode] = useState<Mode>("hire")

  useEffect(() => {
    setLanguage(lang)
  }, [lang])

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 relative">
      {/* Decorative Blob */}
      <div className="absolute top-[-10%] left-[25%] w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] rounded-full bg-teal-500/5 blur-[100px] pointer-events-none -z-10" />

      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-r from-emerald-950/20 via-slate-950 to-teal-950/15 p-6 md:p-8 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-3">
              <Users className="h-3.5 w-3.5" />
              Rural Marketplace · ग्रामीण बाजार
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white">
              Worker <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Connect</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
              {SUBHEADING[language]}
            </p>
          </div>
          <LanguagePicker language={language} onChange={setLanguage} />
        </div>
      </motion.div>

      {/* Navigation Tabs & Security Tips */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Tabs */}
        <div className="inline-flex rounded-2xl border border-white/[0.08] bg-slate-950/40 p-1 backdrop-blur-sm">
          {(["hire", "find"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
                mode === m
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/15"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <span>{m === "hire" ? "👷" : "🔎"}</span>
              <span>{TAB_LABEL[m][language]}</span>
            </button>
          ))}
        </div>

        {/* Trust Banner */}
        <div className="flex-1 md:max-w-xl rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-400 flex items-start gap-2.5 backdrop-blur-sm">
          <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 text-amber-400" />
          <span className="font-semibold leading-relaxed">{SAFETY_TIP[language]}</span>
        </div>
      </div>

      {/* Main Tab Views */}
      <AnimatePresence mode="wait">
        {mode === "hire" ? (
          <motion.div 
            key="hire-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <HireTab language={language} />
          </motion.div>
        ) : (
          <motion.div 
            key="find-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <FindTab language={language} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// Language picker
// ============================================================================
function LanguagePicker({
  language,
  onChange,
}: {
  language: Language
  onChange: (l: Language) => void
}) {
  const items: { id: Language; label: string }[] = [
    { id: "auto", label: "Auto" },
    { id: "hi", label: "हिन्दी" },
    { id: "en", label: "EN" },
    { id: "kn", label: "ಕನ್ನಡ" },
  ]
  return (
    <div className="inline-flex rounded-xl border border-white/[0.08] bg-slate-950/40 p-1 backdrop-blur-sm">
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onChange(it.id)}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-300 ${
            language === it.id
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/10"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}

// ============================================================================
// HIRE TAB — farmer posts a job
// ============================================================================
function HireTab({ language }: { language: Language }) {
  const [form, setForm] = useState<JobPostIn>({
    work_type: "harvesting",
    location: { district: "", state: "" },
    workers_needed: 1,
    wage_amount: 500,
    wage_unit: "per_day",
    duration_days: 1,
    contact_name: "",
    contact_phone: "",
    language,
  })
  const [wageHint, setWageHint] = useState<WageSuggestion | null>(null)
  const [busy, setBusy] = useState(false)
  const [posted, setPosted] = useState<Job | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Refresh wage hint when work_type or state changes.
  useEffect(() => {
    let cancelled = false
    suggestWage(form.work_type, form.location.state || undefined)
      .then((s) => !cancelled && setWageHint(s))
      .catch(() => !cancelled && setWageHint(null))
    return () => { cancelled = true }
  }, [form.work_type, form.location.state])

  const update = useCallback(<K extends keyof JobPostIn>(k: K, v: JobPostIn[K]) => {
    setForm((f) => ({ ...f, [k]: v }))
  }, [])

  const updateLoc = useCallback(
    <K extends keyof JobPostIn["location"]>(k: K, v: JobPostIn["location"][K]) => {
      setForm((f) => ({ ...f, location: { ...f.location, [k]: v } }))
    },
    []
  )

  const submit = useCallback(async () => {
    setError(null)
    if (!form.location.district || !form.location.state) {
      setError(language === "hi" ? "ज़िला और राज्य ज़रूरी है।" : "District and state are required.")
      return
    }
    if (!form.contact_name || !form.contact_phone) {
      setError(language === "hi" ? "नाम और फ़ोन नंबर ज़रूरी है।" : "Name and phone are required.")
      return
    }
    setBusy(true)
    try {
      const job = await postJob({ ...form, language })
      setPosted(job)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }, [form, language])

  const lblEn = (en: string, hi: string, kn: string) =>
    language === "hi" ? hi : language === "kn" ? kn : en

  if (posted) {
    return (
      <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md p-6 space-y-6 max-w-2xl mx-auto shadow-xl">
        <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-md font-display pb-3 border-b border-white/[0.04]">
          <CheckCircle2 className="h-5.5 w-5.5 text-emerald-400" />
          <span>
            {language === "hi"
              ? "आपका जॉब पोस्ट हो गया!"
              : language === "kn"
              ? "ನಿಮ್ಮ ಕೆಲಸ ಪೋಸ್ಟ್ ಆಗಿದೆ!"
              : "Your job is posted!"}
          </span>
        </div>
        <JobCard job={posted} language={language} />
        <div className="flex justify-end pt-2">
          <Button
            onClick={() => setPosted(null)}
            className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-11 px-5 shadow-lg shadow-emerald-500/15"
          >
            {language === "hi" ? "एक और पोस्ट करो" : "Post Another"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] items-start">
      {/* Left — form */}
      <GlassCard className="border border-white/[0.08] backdrop-blur-md p-6 space-y-5 shadow-xl bg-slate-950/20">
        <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Briefcase className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-md font-bold text-white font-display">Job Specifications</h2>
            <p className="text-[11px] text-muted-foreground">Complete criteria to dispatch notification matching algorithm</p>
          </div>
        </div>

        {/* Work type */}
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold">
            {lblEn("Type of work", "काम का प्रकार", "ಕೆಲಸದ ಪ್ರಕಾರ")}
          </Label>
          <select
            className="w-full rounded-xl border border-white/[0.08] bg-slate-950/40 px-3.5 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all cursor-pointer"
            value={form.work_type}
            onChange={(e) => update("work_type", e.target.value as WorkType)}
          >
            {WORK_TYPES.map((wt) => (
              <option key={wt} value={wt} className="bg-slate-900">
                {workTypeLabel(wt, language)}
              </option>
            ))}
          </select>
        </div>

        {/* Location village, district */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold">
              {lblEn("Village", "गाँव", "ಗ್ರಾಮ")}
            </Label>
            <Input
              className="h-[46px] rounded-xl border-white/[0.08] bg-slate-950/40 text-foreground px-4 text-sm font-semibold focus-visible:ring-emerald-500/30"
              placeholder={lblEn("Optional", "वैकल्पिक", "ಐಚ್ಛಿಕ")}
              value={form.location.village ?? ""}
              onChange={(e) => updateLoc("village", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold">
              {lblEn("District *", "ज़िला *", "ಜಿಲ್ಲೆ *")}
            </Label>
            <Input
              className="h-[46px] rounded-xl border-white/[0.08] bg-slate-950/40 text-foreground px-4 text-sm font-semibold focus-visible:ring-emerald-500/30"
              placeholder={lblEn("e.g. Tumkur", "जैसे तुमकूर", "ಉದಾ. ತುಮಕೂರು")}
              value={form.location.district}
              onChange={(e) => updateLoc("district", e.target.value)}
            />
          </div>
        </div>

        {/* State */}
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold">
            {lblEn("State *", "राज्य *", "ರಾಜ್ಯ *")}
          </Label>
          <Input
            className="h-[46px] rounded-xl border-white/[0.08] bg-slate-950/40 text-foreground px-4 text-sm font-semibold focus-visible:ring-emerald-500/30"
            placeholder={lblEn("e.g. Karnataka", "जैसे कर्नाटक", "ಉದಾ. ಕರ್ನಾಟಕ")}
            value={form.location.state}
            onChange={(e) => updateLoc("state", e.target.value)}
          />
        </div>

        {/* Workers + duration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold">
              {lblEn("Workers needed", "मज़दूर चाहिए", "ಕೆಲಸಗಾರರು")}
            </Label>
            <Input
              type="number"
              min={1}
              max={200}
              className="h-[46px] rounded-xl border-white/[0.08] bg-slate-950/40 text-foreground px-4 text-sm font-semibold focus-visible:ring-emerald-500/30"
              value={form.workers_needed}
              onChange={(e) => update("workers_needed", Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold">
              {lblEn("Duration (days)", "अवधि (दिन)", "ಅವಧಿ (ದಿನಗಳು)")}
            </Label>
            <Input
              type="number"
              min={1}
              max={60}
              className="h-[46px] rounded-xl border-white/[0.08] bg-slate-950/40 text-foreground px-4 text-sm font-semibold focus-visible:ring-emerald-500/30"
              value={form.duration_days ?? 1}
              onChange={(e) =>
                update("duration_days", Math.max(1, Number(e.target.value) || 1))
              }
            />
          </div>
        </div>

        {/* Wage input */}
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold">
            {lblEn("Wage (₹ per day)", "मज़दूरी (₹ प्रतिदिन)", "ಕೂಲಿ (₹ ದಿನಕ್ಕೆ)")}
          </Label>
          <Input
            type="number"
            min={50}
            max={10000}
            className="h-[46px] rounded-xl border-white/[0.08] bg-slate-950/40 text-foreground px-4 text-sm font-semibold focus-visible:ring-emerald-500/30"
            value={form.wage_amount}
            onChange={(e) => update("wage_amount", Number(e.target.value) || 0)}
          />
          {wageHint && (
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>
                {lblEn("Normal range", "सामान्य रेंज", "ಸಾಮಾನ್ಯ ಶ್ರೇಣಿ")}: ₹{wageHint.suggested_min}–₹{wageHint.suggested_max}/day
              </span>
            </div>
          )}
        </div>

        {/* Start date */}
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold">
            {lblEn("Start date (optional)", "शुरू तारीख़ (वैकल्पिक)", "ಪ್ರಾರಂಭ ದಿನಾಂಕ (ಐಚ್ಛಿಕ)")}
          </Label>
          <Input
            type="date"
            className="h-[46px] rounded-xl border-white/[0.08] bg-slate-950/40 text-foreground px-4 text-sm font-semibold focus-visible:ring-emerald-500/30 cursor-pointer"
            value={form.start_date ?? ""}
            onChange={(e) => update("start_date", e.target.value || null)}
          />
        </div>

        {/* Contact info name, phone */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold">
              {lblEn("Your name *", "आपका नाम *", "ನಿಮ್ಮ ಹೆಸರು *")}
            </Label>
            <Input
              className="h-[46px] rounded-xl border-white/[0.08] bg-slate-950/40 text-foreground px-4 text-sm font-semibold focus-visible:ring-emerald-500/30"
              placeholder={lblEn("e.g. Ramesh", "जैसे रमेश", "ಉದಾ. ರಮೇಶ")}
              value={form.contact_name}
              onChange={(e) => update("contact_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold">
              {lblEn("Phone *", "फ़ोन *", "ಫೋನ್ *")}
            </Label>
            <Input
              className="h-[46px] rounded-xl border-white/[0.08] bg-slate-950/40 text-foreground px-4 text-sm font-semibold focus-visible:ring-emerald-500/30"
              inputMode="tel"
              placeholder="+91 9876543210"
              value={form.contact_phone}
              onChange={(e) => update("contact_phone", e.target.value)}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold">
            {lblEn("Notes (optional)", "नोट्स (वैकल्पिक)", "ಟಿಪ್ಪಣಿ (ಐಚ್ಛಿಕ)")}
          </Label>
          <textarea
            rows={2}
            className="w-full rounded-xl border border-white/[0.08] bg-slate-950/40 px-3.5 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none placeholder:text-muted-foreground/60"
            placeholder={lblEn(
              "Anything else workers should know",
              "मज़दूरों के लिए कोई और जानकारी",
              "ಕೆಲಸಗಾರರಿಗೆ ಯಾವುದೇ ಮಾಹಿತಿ"
            )}
            value={form.notes ?? ""}
            onChange={(e) => update("notes", e.target.value || null)}
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <Button
          onClick={submit}
          disabled={busy}
          className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-12 flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/15"
        >
          {busy ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
          ) : (
            <Briefcase className="h-4.5 w-4.5" />
          )}
          {lblEn("Post this job", "जॉब पोस्ट करें", "ಕೆಲಸ ಪೋಸ್ಟ್ ಮಾಡಿ")}
        </Button>
      </GlassCard>

      {/* Right — live preview */}
      <section className="h-full">
        <GlassCard className="border border-white/[0.08] backdrop-blur-md p-6 h-full shadow-xl bg-slate-950/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06] mb-6">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-md font-bold text-white font-display">Live Card Preview</h2>
                <p className="text-[11px] text-muted-foreground">Real-time update of matching marketplace card</p>
              </div>
            </div>
            <PreviewCard form={form} language={language} />
          </div>

          <div className="pt-6 mt-6 border-t border-white/[0.04] text-[10px] text-muted-foreground/60 leading-relaxed text-center">
            Once posted, this will be dispatched to matches in a ~15km radius.
          </div>
        </GlassCard>
      </section>
    </div>
  )
}

function PreviewCard({ form, language }: { form: JobPostIn; language: Language }) {
  const loc = [form.location.village, form.location.district, form.location.state]
    .filter(Boolean)
    .join(", ")
  
  const lblEn = (en: string, hi: string, kn: string) =>
    language === "hi" ? hi : language === "kn" ? kn : en

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-slate-950/40 p-5 space-y-4 shadow-inner relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3">
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          Draft Preview
        </span>
      </div>

      <div className="space-y-3">
        <div className="font-extrabold text-white text-base font-display flex items-center gap-2">
          <span>🌾</span>
          <span>{workTypeLabel(form.work_type, language)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
          <MapPin className="h-4 w-4 shrink-0 text-emerald-400/80" />
          <span>{loc || (language === "hi" ? "जगह डालें" : "Add location")}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <Users className="h-4 w-4 text-emerald-400/80 shrink-0" />
            <div>
              <div className="text-[9px] uppercase text-muted-foreground font-bold tracking-wider">Required</div>
              <div className="text-white mt-0.5">
                {form.workers_needed}{" "}
                {lblEn("workers", "मज़दूर", "ಕೆಲಸಗಾರರು")}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <Calendar className="h-4 w-4 text-teal-400/80 shrink-0" />
            <div>
              <div className="text-[9px] uppercase text-muted-foreground font-bold tracking-wider">Duration</div>
              <div className="text-white mt-0.5">{form.duration_days} Days</div>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase text-muted-foreground font-bold tracking-wider block">Estimated Wage</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-black text-emerald-400 font-display">₹{form.wage_amount}</span>
              <span className="text-[10px] text-muted-foreground font-semibold">/day</span>
            </div>
          </div>
        </div>
      </div>

      {form.contact_name && form.contact_phone && (
        <div className="pt-3 border-t border-white/[0.04] space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-4 w-4 text-emerald-400/80 shrink-0" />
            <span>
              Employer: <span className="font-bold text-white">{form.contact_name}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-4 w-4 text-emerald-400/80 shrink-0" />
            <span>Contact: {form.contact_phone}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// FIND TAB — worker searches
// ============================================================================
function FindTab({ language }: { language: Language }) {
  const [state, setState] = useState("")
  const [district, setDistrict] = useState("")
  const [workType, setWorkType] = useState<WorkType | "">("")
  const [minWage, setMinWage] = useState<string>("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [matches, setMatches] = useState<JobMatch[] | null>(null)
  const [allOpen, setAllOpen] = useState<Job[]>([])

  // On first mount — show all open jobs.
  useEffect(() => {
    listJobs({ status: "open", limit: 30 })
      .then(setAllOpen)
      .catch(() => setAllOpen([]))
  }, [])

  const runSearch = useCallback(async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await searchJobs({
        state: state || undefined,
        district: district || undefined,
        work_type: workType || undefined,
        min_wage: minWage ? Number(minWage) : undefined,
        limit: 25,
      })
      setMatches(res.matches)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }, [state, district, workType, minWage])

  const lblEn = (en: string, hi: string, kn: string) =>
    language === "hi" ? hi : language === "kn" ? kn : en

  const list: { job: Job; distance_km?: number | null; match_score?: number }[] =
    matches ?? allOpen.map((j) => ({ job: j }))

  return (
    <div className="space-y-6">
      {/* Filter search parameters */}
      <GlassCard className="border border-white/[0.08] backdrop-blur-md p-5 grid gap-4 md:grid-cols-5 bg-slate-950/20 shadow-xl">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold">
            {lblEn("State", "राज्य", "ರಾಜ್ಯ")}
          </Label>
          <Input
            className="h-10 rounded-xl border-white/[0.08] bg-slate-950/40 text-foreground px-4 text-xs font-semibold focus-visible:ring-emerald-500/30"
            placeholder={lblEn("State", "राज्य", "ರಾಜ್ಯ")}
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold">
            {lblEn("District", "ज़िला", "ಜಿಲ್ಲೆ")}
          </Label>
          <Input
            className="h-10 rounded-xl border-white/[0.08] bg-slate-950/40 text-foreground px-4 text-xs font-semibold focus-visible:ring-emerald-500/30"
            placeholder={lblEn("District", "ज़िला", "ಜಿಲ್ಲೆ")}
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold">
            {lblEn("Work type", "काम", "ಕೆಲಸ")}
          </Label>
          <select
            className="w-full h-10 rounded-xl border border-white/[0.08] bg-slate-950/40 px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all cursor-pointer"
            value={workType}
            onChange={(e) => setWorkType(e.target.value as WorkType | "")}
          >
            <option value="" className="bg-slate-900">{lblEn("Any / कोई भी", "कोई भी", "ಯಾವುದಾದರೂ")}</option>
            {WORK_TYPES.map((wt) => (
              <option key={wt} value={wt} className="bg-slate-900">
                {workTypeLabel(wt, language)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold">
            {lblEn("Min wage", "न्यूनतम मज़दूरी", "ಕನಿಷ್ಠ ಕೂಲಿ")}
          </Label>
          <Input
            type="number"
            min={0}
            className="h-10 rounded-xl border-white/[0.08] bg-slate-950/40 text-foreground px-4 text-xs font-semibold focus-visible:ring-emerald-500/30"
            placeholder="₹"
            value={minWage}
            onChange={(e) => setMinWage(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button
            onClick={runSearch}
            disabled={busy}
            className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-10 flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md shadow-emerald-500/10"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {lblEn("Search", "ढूँढो", "ಹುಡುಕಿ")}
          </Button>
        </div>
      </GlassCard>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Results grid list */}
      <section className="space-y-4">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
          🔎 {list.length}{" "}
          {language === "hi"
            ? "जॉब मिले"
            : language === "kn"
            ? "ಕೆಲಸಗಳು ಸಿಕ್ಕಿವೆ"
            : list.length === 1
            ? "job found"
            : "jobs found"}
        </div>
        {list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.08] bg-slate-950/20 p-12 text-center text-sm text-muted-foreground">
            {lblEn(
              "No open jobs yet — be the first to post one!",
              "अभी कोई जॉब नहीं — पहले बनें!",
              "ಯಾವುದೇ ಕೆಲಸಗಳಿಲ್ಲ — ಮೊದಲು ಪೋಸ್ಟ್ ಮಾಡಿ!"
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {list.map(({ job, distance_km, match_score }) => (
              <JobCard
                key={job.id}
                job={job}
                language={language}
                distance_km={distance_km ?? undefined}
                match_score={match_score}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// ============================================================================
// Job Card
// ============================================================================
function JobCard({
  job,
  language,
  distance_km,
  match_score,
}: {
  job: Job
  language: Language
  distance_km?: number
  match_score?: number
}) {
  const lblEn = (en: string, hi: string, kn: string) =>
    language === "hi" ? hi : language === "kn" ? kn : en

  return (
    <GlassCard className="border border-white/[0.08] backdrop-blur-md p-5 space-y-4 shadow-lg bg-slate-950/20 hover:border-emerald-500/20 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2 pb-2 border-b border-white/[0.04]">
          <div className="font-extrabold text-white text-base font-display flex items-center gap-2">
            <span>🌾</span>
            <span>{workTypeLabel(job.work_type, language)}</span>
          </div>
          {match_score != null && (
            <div className="text-[10px] font-bold rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5">
              {Math.round(match_score * 100)}% match
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold">
          <MapPin className="h-4 w-4 shrink-0 text-emerald-400/80" />
          <span>
            {[job.location.village, job.location.district, job.location.state]
              .filter(Boolean)
              .join(", ")}
            {distance_km != null && (
              <span className="ml-1.5 text-emerald-400">
                · ~{distance_km} km away
              </span>
            )}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-emerald-400/80" />
            <span>{job.workers_needed} Required</span>
          </span>
          <span className="flex items-center gap-1.5">
            <IndianRupee className="h-4 w-4 text-teal-400/80" />
            <span className="text-white">₹{job.wage_amount}</span>
            <span>/{job.wage_unit.replace("per_", "")}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-amber-400/80" />
            <span>{job.duration_days} Days</span>
          </span>
        </div>

        {job.notes && (
          <div className="text-xs text-muted-foreground/80 border-l-2 border-emerald-500/40 pl-3 italic py-0.5">
            {job.notes}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-white/[0.04] space-y-3">
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground pl-0.5">
          <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
            <User className="h-3 w-3" />
          </div>
          <span>
            Contact: <span className="font-bold text-white">{job.contact_name}</span>
          </span>
        </div>
        <div className="flex gap-2">
          <a
            href={"tel:" + job.contact_phone}
            className="flex-1 text-xs rounded-xl bg-slate-900 border border-white/[0.08] hover:bg-white/[0.03] text-white font-bold h-9 flex items-center justify-center gap-1.5 transition-all"
          >
            <Phone className="h-3.5 w-3.5 text-emerald-400" />
            <span>{lblEn("Call", "कॉल", "ಕರೆ")}</span>
          </a>
          <a
            href={"https://wa.me/" + job.contact_phone.replace(/\D/g, "").replace(/^0/, "91")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-xs rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 text-[#25D366] font-bold h-9 flex items-center justify-center gap-1.5 transition-all"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </GlassCard>
  )
}
