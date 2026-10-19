/**
 * Typed client for KisaanBuddy Worker Connect — rural job marketplace.
 *
 * All calls go through the Next.js rewrite (/api/worker-connect/* -> :8000).
 * Mirrors backend/schemas/worker_connect.py.
 */

// ---------- Types ----------

export type WorkType =
  | "harvesting"
  | "sowing"
  | "weeding"
  | "spraying"
  | "tractor"
  | "ploughing"
  | "irrigation"
  | "general"
  | "transport"
  | "post_harvest"
  | "other"

export type WageUnit = "per_day" | "per_hour" | "per_task"
export type JobStatus = "open" | "filled" | "closed"
export type Language = "auto" | "en" | "hi" | "kn" | "ta" | "te" | "mr" | "gu" | "bn" | "pa" | "ml" | "hi_en"

export interface JobLocation {
  village?: string | null
  district: string
  state: string
  lat?: number | null
  lon?: number | null
}

export interface JobPostIn {
  work_type: WorkType
  work_type_detail?: string | null
  location: JobLocation
  workers_needed: number
  wage_amount: number
  wage_unit?: WageUnit
  duration_days?: number
  start_date?: string | null
  contact_name: string
  contact_phone: string
  notes?: string | null
  language?: Language
}

export interface Job extends JobPostIn {
  id: string
  status: JobStatus
  created_at: string
  updated_at: string
  wage_unit: WageUnit
  duration_days: number
}

export interface JobSearchQuery {
  state?: string
  district?: string
  work_type?: WorkType
  lat?: number
  lon?: number
  radius_km?: number
  min_wage?: number
  limit?: number
}

export interface JobMatch {
  job: Job
  distance_km?: number | null
  match_score: number
}

export interface JobSearchResponse {
  matches: JobMatch[]
  total: number
}

export interface WageSuggestion {
  work_type: WorkType
  state?: string | null
  suggested_min: number
  suggested_max: number
  wage_unit: WageUnit
  note: string
}

// ---------- Errors ----------

export class JobsAPIError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "JobsAPIError"
    this.status = status
  }
}

async function readDetail(res: Response, fallback: string): Promise<string> {
  try {
    const j = await res.json()
    if (j?.detail) {
      return typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail)
    }
  } catch {
    /* ignore */
  }
  return fallback
}

const BASE = "/api/worker-connect"

// ---------- Endpoints ----------

export async function postJob(payload: JobPostIn, signal?: AbortSignal): Promise<Job> {
  const r = await fetch(`${BASE}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  })
  if (!r.ok) throw new JobsAPIError(await readDetail(r, "Failed to post job"), r.status)
  return r.json()
}

export async function listJobs(
  filters: {
    state?: string
    district?: string
    work_type?: WorkType
    status?: JobStatus
    limit?: number
  } = {},
  signal?: AbortSignal
): Promise<Job[]> {
  const qs = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, String(v))
  })
  const r = await fetch(`${BASE}/jobs?${qs.toString()}`, { signal, cache: "no-store" })
  if (!r.ok) throw new JobsAPIError(await readDetail(r, "Failed to list jobs"), r.status)
  return r.json()
}

export async function getJob(jobId: string, signal?: AbortSignal): Promise<Job> {
  const r = await fetch(`${BASE}/jobs/${encodeURIComponent(jobId)}`, { signal })
  if (!r.ok) throw new JobsAPIError(await readDetail(r, "Job not found"), r.status)
  return r.json()
}

export async function searchJobs(
  query: JobSearchQuery,
  signal?: AbortSignal
): Promise<JobSearchResponse> {
  const r = await fetch(`${BASE}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
    signal,
  })
  if (!r.ok) throw new JobsAPIError(await readDetail(r, "Search failed"), r.status)
  return r.json()
}

export async function suggestWage(
  work_type: WorkType,
  state?: string,
  signal?: AbortSignal
): Promise<WageSuggestion> {
  const qs = new URLSearchParams({ work_type })
  if (state) qs.append("state", state)
  const r = await fetch(`${BASE}/suggest-wage?${qs.toString()}`, { signal })
  if (!r.ok) throw new JobsAPIError(await readDetail(r, "Wage suggestion failed"), r.status)
  return r.json()
}

export async function updateJobStatus(
  jobId: string,
  status: JobStatus,
  signal?: AbortSignal
): Promise<Job> {
  const qs = new URLSearchParams({ status })
  const r = await fetch(`${BASE}/jobs/${encodeURIComponent(jobId)}/status?${qs.toString()}`, {
    method: "POST",
    signal,
  })
  if (!r.ok) throw new JobsAPIError(await readDetail(r, "Status update failed"), r.status)
  return r.json()
}

export async function deleteJob(jobId: string, signal?: AbortSignal): Promise<void> {
  const r = await fetch(`${BASE}/jobs/${encodeURIComponent(jobId)}`, {
    method: "DELETE",
    signal,
  })
  if (!r.ok && r.status !== 204) {
    throw new JobsAPIError(await readDetail(r, "Delete failed"), r.status)
  }
}

// ---------- Display helpers ----------

export const WORK_TYPE_LABEL: Record<WorkType, Record<string, string>> = {
  harvesting:   { en: "Harvesting",     hi: "कटाई",          kn: "ಕಟಾವು",         te: "కోత",           ta: "அறுவடை",        mr: "कापणी",         gu: "લણણી",         bn: "ফসল কাটা",      pa: "ਵਾਢੀ",          ml: "വിളവെടുപ്പ്",   hi_en: "Harvesting" },
  sowing:       { en: "Sowing",         hi: "बुवाई",         kn: "ಬಿತ್ತನೆ",        te: "విత్తనం నాటడం", ta: "விதைத்தல்",     mr: "पेरणी",          gu: "વાવણી",        bn: "বীজ বপন",       pa: "ਬਿਜਾਈ",         ml: "വിത്ത് വിതയ്ക്കൽ", hi_en: "Sowing" },
  weeding:      { en: "Weeding",        hi: "खरपतवार",       kn: "ಕಳೆ ಕೀಳುವುದು",   te: "కలుపు తీత",     ta: "களை எடுத்தல்",   mr: "खुरपणी",         gu: "નીંદણ",        bn: "আগাছা নিড়ানো", pa: "ਗੋਡੀ",          ml: "കള പറിക്കൽ",    hi_en: "Weeding" },
  spraying:     { en: "Spraying",       hi: "छिड़काव",        kn: "ಸಿಂಪಡಿಕೆ",       te: "స్ప్రేయింగ్",   ta: "தெளித்தல்",     mr: "फवारणी",        gu: "છંટકાવ",       bn: "স্প্রে করা",    pa: "ਸਪਰੇਅ",         ml: "തളിക്കൽ",       hi_en: "Spraying" },
  tractor:      { en: "Tractor work",   hi: "ट्रैक्टर",       kn: "ಟ್ರ್ಯಾಕ್ಟರ್",    te: "ట్రాక్టర్ పని", ta: "டிராக்டர் வேலை",mr: "ट्रॅक्टर काम",  gu: "ટ્રેક્ટર કામ", bn: "ট্রাক্টর কাজ",  pa: "ਟਰੈਕਟਰ ਕੰਮ",    ml: "ട്രാക്ടർ പണി",   hi_en: "Tractor work" },
  ploughing:    { en: "Ploughing",      hi: "जुताई",         kn: "ಉಳುಮೆ",         te: "దుక్కి దున్నడం", ta: "உഴുதல்",        mr: "नांगरणी",        gu: "ખેડવું",       bn: "হাল চাষ",       pa: "ਹਲ ਵਾਹੁਣਾ",     ml: "ഉഴവ്",          hi_en: "Ploughing" },
  irrigation:   { en: "Irrigation",     hi: "सिंचाई",        kn: "ನೀರಾವರಿ",       te: "నీటిపారుదల",    ta: "நீர்ப்பாசனம்",   mr: "पाणी देणे",      gu: "પિયત",         bn: "সেচ",           pa: "ਸਿੰਚਾਈ",        ml: "നനയ്ക്കൽ",      hi_en: "Irrigation" },
  general:      { en: "General labour", hi: "मजदूरी",        kn: "ಸಾಮಾನ್ಯ ಕೆಲಸ",  te: "సాధారణ కూలీ",   ta: "பொது வேலை",     mr: "मजुरी",          gu: "મજૂરી",        bn: "সাধারণ কাজ",    pa: "ਮਜ਼ਦੂਰੀ",        ml: "സാധാരണ പണി",   hi_en: "General labour" },
  transport:    { en: "Transport",      hi: "ढुलाई",         kn: "ಸಾಗಣೆ",         te: "రవాణా",         ta: "போக்குவரத்து",  mr: "वाहतूक",        gu: "વાહન વ્યવહાર", bn: "পরিবহন",       pa: "ਢੋਆ-ਢੁਆਈ",      ml: "ഗതാഗതം",        hi_en: "Transport" },
  post_harvest: { en: "Post-harvest",   hi: "कटाई के बाद",   kn: "ಕಟಾವು ನಂತರ",    te: "కోత అనంతర పనులు", ta: "அறுவடைக்கு பின்", mr: "कापणीनंतरची कामे", gu: "લણણી પછી",     bn: "ফসল তোলার পর",  pa: "ਵਾਢੀ ਤੋਂ ਬਾਅਦ", ml: "വിളവെടുപ്പിന് ശേഷം", hi_en: "Post-harvest" },
  other:        { en: "Other",          hi: "अन्य",          kn: "ಇತರೆ",          te: "ఇతర",           ta: "மற்றவை",        mr: "इतर",           gu: "અન્ય",         bn: "অন্যান্য",      pa: "ਹੋਰ",           ml: "മറ്റുള്ളവ",     hi_en: "Other" },
}

export const WORK_TYPES: WorkType[] = [
  "harvesting", "sowing", "weeding", "spraying",
  "tractor", "ploughing", "irrigation", "general",
  "transport", "post_harvest", "other",
]
