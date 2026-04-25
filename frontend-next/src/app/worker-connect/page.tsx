"use client"
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
  Phone,
  Search,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"

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

// ============================================================================
// Page
// ============================================================================
export default function JobsPage() {
  const [language, setLanguage] = useState<Language>("auto")
  const [mode, setMode] = useState<Mode>("hire")

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          KrishiAI · Rural Job Marketplace
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {HEADING[language]}
            </h1>
            <p className="text-muted-foreground max-w-2xl mt-1">{SUBHEADING[language]}</p>
          </div>
          <LanguagePicker language={language} onChange={setLanguage} />
        </div>
      </header>

      {/* Tabs */}
      <div className="inline-flex rounded-xl border border-border bg-card/40 p-1">
        {(["hire", "find"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors " +
              (mode === m
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            {m === "hire" ? "👷 " : "🔎 "}
            {TAB_LABEL[m][language]}
          </button>
        ))}
      </div>

      {/* Trust banner */}
      <div className="rounded-xl border border-amber-200/60 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-500/10 px-4 py-3 text-sm flex items-start gap-2">
        <ShieldAlert className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
        <span>{SAFETY_TIP[language]}</span>
      </div>

      {mode === "hire" ? (
        <HireTab language={language} />
      ) : (
        <FindTab language={language} />
      )}
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
    <div className="inline-flex rounded-lg border border-border bg-card/40 p-0.5 text-xs">
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onChange(it.id)}
          className={
            "rounded-md px-2 py-1 transition-colors " +
            (language === it.id
              ? "bg-emerald-500 text-white"
              : "text-muted-foreground hover:text-foreground")
          }
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

  if (posted) {
    return (
      <div className="rounded-2xl border border-emerald-300/60 bg-emerald-50/70 dark:bg-emerald-500/10 p-6 space-y-4">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
          <CheckCircle2 className="h-5 w-5" />
          {language === "hi"
            ? "आपका जॉब पोस्ट हो गया!"
            : language === "kn"
            ? "ನಿಮ್ಮ ಕೆಲಸ ಪೋಸ್ಟ್ ಆಗಿದೆ!"
            : "Your job is posted!"}
        </div>
        <JobCard job={posted} language={language} />
        <div className="flex gap-3">
          <button
            onClick={() => setPosted(null)}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
          >
            {language === "hi" ? "एक और पोस्ट करो" : "Post another"}
          </button>
        </div>
      </div>
    )
  }

  const lblEn = (en: string, hi: string, kn: string) =>
    language === "hi" ? hi : language === "kn" ? kn : en

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,0.8fr)]">
      {/* Left — form */}
      <section className="rounded-2xl border border-border bg-card/40 backdrop-blur p-5 space-y-4">
        {/* Work type */}
        <Field label={lblEn("Type of work", "काम का प्रकार", "ಕೆಲಸದ ಪ್ರಕಾರ")}>
          <select
            className="select-base"
            value={form.work_type}
            onChange={(e) => update("work_type", e.target.value as WorkType)}
          >
            {WORK_TYPES.map((wt) => (
              <option key={wt} value={wt}>
                {workTypeLabel(wt, language)}
              </option>
            ))}
          </select>
        </Field>

        {/* Location */}
        <div className="grid grid-cols-2 gap-3">
          <Field label={lblEn("Village", "गाँव", "ಗ್ರಾಮ")}>
            <input
              className="input-base"
              placeholder={lblEn("Optional", "वैकल्पिक", "ಐಚ್ಛಿಕ")}
              value={form.location.village ?? ""}
              onChange={(e) => updateLoc("village", e.target.value)}
            />
          </Field>
          <Field label={lblEn("District *", "ज़िला *", "ಜಿಲ್ಲೆ *")}>
            <input
              className="input-base"
              placeholder={lblEn("e.g. Tumkur", "जैसे तुमकूर", "ಉದಾ. ತುಮಕೂರು")}
              value={form.location.district}
              onChange={(e) => updateLoc("district", e.target.value)}
            />
          </Field>
        </div>
        <Field label={lblEn("State *", "राज्य *", "ರಾಜ್ಯ *")}>
          <input
            className="input-base"
            placeholder={lblEn("e.g. Karnataka", "जैसे कर्नाटक", "ಉದಾ. ಕರ್ನಾಟಕ")}
            value={form.location.state}
            onChange={(e) => updateLoc("state", e.target.value)}
          />
        </Field>

        {/* Workers + duration */}
        <div className="grid grid-cols-2 gap-3">
          <Field label={lblEn("Workers needed", "मज़दूर चाहिए", "ಕೆಲಸಗಾರರು")}>
            <input
              type="number"
              min={1}
              max={200}
              className="input-base"
              value={form.workers_needed}
              onChange={(e) => update("workers_needed", Math.max(1, Number(e.target.value) || 1))}
            />
          </Field>
          <Field label={lblEn("Duration (days)", "अवधि (दिन)", "ಅವಧಿ (ದಿನಗಳು)")}>
            <input
              type="number"
              min={1}
              max={60}
              className="input-base"
              value={form.duration_days ?? 1}
              onChange={(e) =>
                update("duration_days", Math.max(1, Number(e.target.value) || 1))
              }
            />
          </Field>
        </div>

        {/* Wage */}
        <Field
          label={lblEn(
            "Wage (₹ per day)",
            "मज़दूरी (₹ प्रतिदिन)",
            "ಕೂಲಿ (₹ ದಿನಕ್ಕೆ)"
          )}
        >
          <input
            type="number"
            min={50}
            max={10000}
            className="input-base"
            value={form.wage_amount}
            onChange={(e) => update("wage_amount", Number(e.target.value) || 0)}
          />
          {wageHint && (
            <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              💡 {lblEn("Normal range", "सामान्य रेंज", "ಸಾಮಾನ್ಯ ಶ್ರೇಣಿ")}: ₹
              {wageHint.suggested_min}–₹{wageHint.suggested_max}/day
            </p>
          )}
        </Field>

        {/* Start date */}
        <Field label={lblEn("Start date (optional)", "शुरू तारीख़ (वैकल्पिक)", "ಪ್ರಾರಂಭ ದಿನಾಂಕ (ಐಚ್ಛಿಕ)")}>
          <input
            type="date"
            className="input-base"
            value={form.start_date ?? ""}
            onChange={(e) => update("start_date", e.target.value || null)}
          />
        </Field>

        {/* Contact */}
        <div className="grid grid-cols-2 gap-3">
          <Field label={lblEn("Your name *", "आपका नाम *", "ನಿಮ್ಮ ಹೆಸರು *")}>
            <input
              className="input-base"
              placeholder={lblEn("e.g. Ramesh", "जैसे रमेश", "ಉದಾ. ರಮೇಶ")}
              value={form.contact_name}
              onChange={(e) => update("contact_name", e.target.value)}
            />
          </Field>
          <Field label={lblEn("Phone *", "फ़ोन *", "ಫೋನ್ *")}>
            <input
              className="input-base"
              inputMode="tel"
              placeholder="+91 9876543210"
              value={form.contact_phone}
              onChange={(e) => update("contact_phone", e.target.value)}
            />
          </Field>
        </div>

        <Field label={lblEn("Notes (optional)", "नोट्स (वैकल्पिक)", "ಟಿಪ್ಪಣಿ (ಐಚ್ಛಿಕ)")}>
          <textarea
            rows={2}
            className="input-base resize-none"
            placeholder={lblEn(
              "Anything else workers should know",
              "मज़दूरों के लिए कोई और जानकारी",
              "ಕೆಲಸಗಾರರಿಗೆ ಯಾವುದೇ ಮಾಹಿತಿ"
            )}
            value={form.notes ?? ""}
            onChange={(e) => update("notes", e.target.value || null)}
          />
        </Field>

        {error && (
          <div className="rounded-md border border-red-300/60 bg-red-50/60 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <button
          onClick={submit}
          disabled={busy}
          className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-4 py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Briefcase className="h-4 w-4" />
          )}
          {lblEn("Post this job", "जॉब पोस्ट करें", "ಕೆಲಸ ಪೋಸ್ಟ್ ಮಾಡಿ")}
        </button>
      </section>

      {/* Right — preview */}
      <section className="rounded-2xl border border-dashed border-border bg-card/30 backdrop-blur p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          {lblEn("Live preview", "लाइव प्रीव्यू", "ಲೈವ್ ಪೂರ್ವವೀಕ್ಷಣೆ")}
        </div>
        <PreviewCard form={form} language={language} />
      </section>
    </div>
  )
}

function PreviewCard({ form, language }: { form: JobPostIn; language: Language }) {
  const loc = [form.location.village, form.location.district, form.location.state]
    .filter(Boolean)
    .join(", ")
  return (
    <div className="rounded-xl border border-border bg-background/60 p-4 space-y-2 text-sm">
      <div className="font-semibold text-base">
        🌾 {workTypeLabel(form.work_type, language)}
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <MapPin className="h-4 w-4" />
        {loc || (language === "hi" ? "जगह डालें" : "Add location")}
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Users className="h-4 w-4" />
        {form.workers_needed}{" "}
        {language === "hi" ? "मज़दूर चाहिए" : language === "kn" ? "ಕೆಲಸಗಾರರು" : "workers needed"}
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        💰 ₹{form.wage_amount}/day · {form.duration_days}d
      </div>
      {form.contact_name && form.contact_phone && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4" />
          {form.contact_name} – {form.contact_phone}
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
    <div className="space-y-5">
      {/* Filter bar */}
      <section className="rounded-2xl border border-border bg-card/40 backdrop-blur p-4 grid gap-3 md:grid-cols-5">
        <Field label={lblEn("State", "राज्य", "ರಾಜ್ಯ")}>
          <input
            className="input-base"
            placeholder={lblEn("Karnataka", "कर्नाटक", "ಕರ್ನಾಟಕ")}
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        </Field>
        <Field label={lblEn("District", "ज़िला", "ಜಿಲ್ಲೆ")}>
          <input
            className="input-base"
            placeholder={lblEn("Tumkur", "तुमकूर", "ತುಮಕೂರು")}
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
        </Field>
        <Field label={lblEn("Work type", "काम", "ಕೆಲಸ")}>
          <select
            className="select-base"
            value={workType}
            onChange={(e) => setWorkType(e.target.value as WorkType | "")}
          >
            <option value="">{lblEn("Any", "कोई भी", "ಯಾವುದಾದರೂ")}</option>
            {WORK_TYPES.map((wt) => (
              <option key={wt} value={wt}>
                {workTypeLabel(wt, language)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={lblEn("Min wage", "न्यूनतम मज़दूरी", "ಕನಿಷ್ಠ ಕೂಲಿ")}>
          <input
            type="number"
            min={0}
            className="input-base"
            placeholder="₹"
            value={minWage}
            onChange={(e) => setMinWage(e.target.value)}
          />
        </Field>
        <div className="flex items-end">
          <button
            onClick={runSearch}
            disabled={busy}
            className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-4 py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {lblEn("Search", "ढूँढो", "ಹುಡುಕಿ")}
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-md border border-red-300/60 bg-red-50/60 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Results */}
      <section className="space-y-3">
        <div className="text-sm text-muted-foreground">
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
          <div className="rounded-2xl border border-dashed border-border bg-card/30 p-8 text-center text-sm text-muted-foreground">
            {lblEn(
              "No open jobs yet — be the first to post one!",
              "अभी कोई जॉब नहीं — पहले बनें!",
              "ಯಾವುದೇ ಕೆಲಸಗಳಿಲ್ಲ — ಮೊದಲು ಪೋಸ್ಟ್ ಮಾಡಿ!"
            )}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
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
// Reusable bits
// ============================================================================
function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">
        {label}
      </span>
      {children}
    </label>
  )
}

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
    <div className="rounded-xl border border-border bg-background/60 p-4 space-y-2 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="font-semibold text-base">
          🌾 {workTypeLabel(job.work_type, language)}
        </div>
        {match_score != null && (
          <div className="text-[10px] rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5">
            {Math.round(match_score * 100)}% match
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <MapPin className="h-4 w-4 shrink-0" />
        <span>
          {[job.location.village, job.location.district, job.location.state]
            .filter(Boolean)
            .join(", ")}
          {distance_km != null && (
            <span className="ml-1 text-emerald-600 dark:text-emerald-300">
              · ~{distance_km} km
            </span>
          )}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4" /> {job.workers_needed}
        </span>
        <span>💰 ₹{job.wage_amount}/{job.wage_unit.replace("per_", "")}</span>
        <span>📅 {job.duration_days}d</span>
      </div>
      {job.notes && (
        <div className="text-xs text-muted-foreground border-l-2 border-border pl-2 italic">
          {job.notes}
        </div>
      )}
      <div className="pt-1 border-t border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2 text-foreground">
          <Phone className="h-4 w-4 text-emerald-500" />
          <span className="font-medium">{job.contact_name}</span>
          <span className="text-muted-foreground">– {job.contact_phone}</span>
        </div>
        <a
          href={`tel:${job.contact_phone}`}
          className="text-xs rounded-md bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-2.5 py-1"
        >
          {lblEn("Call", "कॉल", "ಕರೆ")}
        </a>
      </div>
    </div>
  )
}
