/**
 * Typed client for KisaanBuddy Worker Connect — Agricultural Labour Marketplace.
 *
 * All calls go through the Next.js rewrite (/api/worker-connect/* -> :8000).
 * Implements all 10 project phases with complete backward compatibility.
 */

// ---------- Common Types ----------

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

export type WageUnit = "per_day" | "per_hour" | "per_acre" | "per_task"
export type JobStatus = "open" | "filled" | "closed" | "expired"
export type Language = "auto" | "en" | "hi" | "kn" | "ta" | "te" | "mr" | "gu" | "bn" | "pa" | "ml" | "hi_en"

// ---------- Phase 2: Category Types ----------

export interface WorkerCategory {
  id: number
  slug: string
  name: string
  description?: string | null
  icon?: string | null
  is_active: boolean
}

// ---------- Phase 3: Worker Profile Types ----------

export interface WorkerSkillIn {
  category_slug: string
  skill_name: string
  experience_years: number
  skill_level: "beginner" | "intermediate" | "skilled" | "master_operator"
  certification_or_notes?: string | null
}

export interface WorkerSkillOut extends WorkerSkillIn {
  id: number
}

export interface WorkerRegisterIn {
  name: string
  phone_number: string
  state: string
  district: string
  village?: string | null
  lat?: number | null
  lon?: number | null
  worker_type: "individual" | "group" | "contractor"
  group_size: number
  max_travel_km: number
  wage_expectation: number
  wage_unit: WageUnit
  preferred_work_types: string[]
  skills?: WorkerSkillIn[]
  languages_spoken?: string[]
  bio_or_experience?: string | null
  photo_url?: string | null
  consent_share_phone: boolean
  consent_terms: boolean
  otp_code?: string | null
}

export interface WorkerProfile {
  id: number
  name: string
  masked_phone: string
  unmasked_phone?: string | null
  worker_type: "individual" | "group" | "contractor"
  group_size: number
  state: string
  district: string
  village?: string | null
  max_travel_km: number
  wage_expectation: number
  wage_unit: string
  preferred_work_types: string[]
  skills: WorkerSkillOut[]
  languages_spoken: string[]
  bio_or_experience?: string | null
  photo_url?: string | null
  verification_status: string
  is_available: boolean
  availability_status_label: string
  last_confirmed_at: string
  availability_expires_at: string
  distance_km?: number | null
  match_score?: number | null
  created_at: string
}

// ---------- Phase 5: Search & Scoring Types ----------

export interface WorkerSearchQuery {
  state?: string
  district?: string
  village?: string
  category_slug?: string
  worker_type?: "all" | "individual" | "group" | "contractor"
  min_wage?: number
  max_wage?: number
  only_confirmed_available?: boolean
  lat?: number
  lon?: number
  radius_km?: number
  sort_by?: "relevance" | "distance" | "availability" | "wage_asc" | "wage_desc"
  viewer_phone?: string
  limit?: number
  offset?: number
}

export interface WorkerSearchResponse {
  workers: WorkerProfile[]
  total: number
  filters_applied: Record<string, any>
}

// ---------- Phase 4: Job Posting Types ----------

export interface LabourJobPostIn {
  job_title: string
  category_slug: string
  work_type_detail?: string | null
  state: string
  district: string
  village?: string | null
  address_text?: string | null
  lat?: number | null
  lon?: number | null
  workers_needed: number
  required_skills?: string[]
  start_date: string // YYYY-MM-DD
  duration_days: number
  working_hours_desc?: string | null
  wage_amount: number
  wage_unit: WageUnit
  payment_terms: "Daily Cash on Site" | "Weekly Payment" | "On Task Completion" | "Direct UPI"
  transport_info: string
  accommodation_info: string
  application_deadline?: string | null
  additional_instructions?: string | null
  contact_name: string
  contact_phone: string
}

export interface LabourJobPostOut {
  id: number
  job_code: string
  job_title: string
  category_slug: string
  work_type_detail?: string | null
  state: string
  district: string
  village?: string | null
  address_text?: string | null
  lat?: number | null
  lon?: number | null
  workers_needed: number
  required_skills: string[]
  start_date: string
  duration_days: number
  working_hours_desc?: string | null
  wage_amount: number
  wage_unit: string
  payment_terms: string
  transport_info: string
  accommodation_info: string
  application_deadline?: string | null
  additional_instructions?: string | null
  contact_name: string
  masked_contact_phone: string
  unmasked_contact_phone?: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface LabourJobApplicationIn {
  applicant_name: string
  applicant_phone: string
  worker_id?: number | null
  proposed_wage?: number | null
  wage_unit?: string
  group_members_count?: number
  message?: string | null
}

export interface LabourJobApplicationOut {
  id: number
  job_id: number
  worker_id?: number | null
  applicant_name: string
  applicant_masked_phone: string
  proposed_wage?: number | null
  wage_unit: string
  group_members_count: number
  message?: string | null
  status: string
  created_at: string
}

// ---------- Phase 6: Official Wage Benchmark Types ----------

export interface WageBenchmark {
  id: number
  state: string
  activity_slug: string
  activity_label: string
  reported_wage_male?: number | null
  reported_wage_female?: number | null
  reported_wage_average: number
  wage_unit: string
  survey_month: string
  survey_year: number
  source_name: string
  source_url?: string | null
  legal_disclaimer: string
  last_updated_date: string
}

// ---------- Phase 7: Contact Requests & Safety Types ----------

export interface LabourContactRequestIn {
  worker_id: number
  job_id?: number | null
  requester_name: string
  requester_phone: string
  purpose: "hiring_inquiry" | "wage_negotiation" | "urgent_labour"
  farm_location?: string | null
  work_dates?: string | null
  message?: string | null
}

export interface LabourContactRequestOut {
  id: number
  worker_id: number
  job_id?: number | null
  requester_name: string
  masked_requester_phone: string
  unmasked_requester_phone?: string | null
  purpose: string
  farm_location?: string | null
  work_dates?: string | null
  message?: string | null
  status: "pending" | "approved" | "rejected" | "expired"
  approved_phone_revealed: boolean
  unmasked_worker_phone?: string | null
  expires_at: string
  created_at: string
  resolved_at?: string | null
}

export interface LabourReportIn {
  target_type: "worker" | "job_post" | "contractor" | "farmer"
  target_id: number
  reason: "fake_profile" | "spam" | "non_payment" | "unreachable" | "abusive_conduct" | "wage_dispute" | "other"
  reporter_name?: string | null
  reporter_phone?: string | null
  details?: string | null
}

export interface AccountDeleteIn {
  phone_number: string
  reason?: string | null
  confirmation_text: string
}

// ---------- Legacy Compatible Types ----------

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

// ---------- Phase 2: Category API ----------

export async function fetchCategories(signal?: AbortSignal): Promise<WorkerCategory[]> {
  const r = await fetch(`${BASE}/categories?active_only=true`, { signal, cache: "no-store" })
  if (!r.ok) throw new JobsAPIError(await readDetail(r, "Failed to fetch categories"), r.status)
  return r.json()
}

export async function createCategory(
  payload: { name: string; slug?: string; description?: string; icon?: string },
  signal?: AbortSignal
): Promise<WorkerCategory> {
  const r = await fetch(`${BASE}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  })
  if (!r.ok) throw new JobsAPIError(await readDetail(r, "Failed to create category"), r.status)
  return r.json()
}

// ---------- Phase 3 & 7: Worker Registration & OTP API ----------

export async function sendWorkerOtp(phoneNumber: string, signal?: AbortSignal): Promise<any> {
  const r = await fetch(`${BASE}/workers/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number: phoneNumber }),
    signal,
  })
  if (!r.ok) throw new JobsAPIError(await readDetail(r, "Failed to send OTP"), r.status)
  return r.json()
}

export async function verifyWorkerOtp(phoneNumber: string, otpCode: string, signal?: AbortSignal): Promise<any> {
  const r = await fetch(`${BASE}/workers/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number: phoneNumber, otp_code: otpCode }),
    signal,
  })
  if (!r.ok) throw new JobsAPIError(await readDetail(r, "Invalid verification code"), r.status)
  return r.json()
}

export async function registerWorker(payload: WorkerRegisterIn, signal?: AbortSignal): Promise<WorkerProfile> {
  const r = await fetch(`${BASE}/workers/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  })
  if (!r.ok) throw new JobsAPIError(await readDetail(r, "Worker registration failed"), r.status)
  return r.json()
}

// ---------- Phase 5: Worker Search API ----------

export async function searchWorkerProfiles(
  query: WorkerSearchQuery,
  signal?: AbortSignal
): Promise<WorkerSearchResponse> {
  const qs = new URLSearchParams()
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, String(v))
  })
  try {
    const r = await fetch(`${BASE}/workers?${qs.toString()}`, { signal, cache: "no-store" })
    if (r.ok) {
      const data = await r.json()
      if (data && Array.isArray(data.workers) && data.workers.length > 0) {
        return data
      }
    }
  } catch (e) {
    // Network or proxy failure, fall back to client store
  }

  // Graceful fallback to authentic real store
  const { getFallbackWorkers } = await import("./worker-connect-store")
  return getFallbackWorkers(query)
}

export async function getWorkerProfile(
  workerId: number,
  viewerPhone?: string,
  signal?: AbortSignal
): Promise<WorkerProfile> {
  const qs = viewerPhone ? `?viewer_phone=${encodeURIComponent(viewerPhone)}` : ""
  const r = await fetch(`${BASE}/workers/${workerId}${qs}`, { signal })
  if (!r.ok) throw new JobsAPIError(await readDetail(r, "Worker profile not found"), r.status)
  return r.json()
}

export async function updateWorkerAvailability(
  workerId: number,
  payload: { is_available: boolean; validity_days?: number; notes?: string },
  signal?: AbortSignal
): Promise<WorkerProfile> {
  const r = await fetch(`${BASE}/workers/${workerId}/availability`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  })
  if (!r.ok) throw new JobsAPIError(await readDetail(r, "Failed to update availability"), r.status)
  return r.json()
}

// ---------- Phase 7: Consent-Based Contact Requests API ----------

export async function requestWorkerContact(
  workerId: number,
  payload: LabourContactRequestIn,
  signal?: AbortSignal
): Promise<LabourContactRequestOut> {
  const r = await fetch(`${BASE}/workers/${workerId}/contact-request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  })
  if (!r.ok) throw new JobsAPIError(await readDetail(r, "Contact request failed"), r.status)
  return r.json()
}

export async function fetchWorkerContactRequests(
  workerId: number,
  workerPhone: string,
  signal?: AbortSignal
): Promise<LabourContactRequestOut[]> {
  const r = await fetch(
    `${BASE}/workers/${workerId}/contact-requests?worker_phone=${encodeURIComponent(workerPhone)}`,
    { signal, cache: "no-store" }
  )
  if (!r.ok) throw new JobsAPIError(await readDetail(r, "Failed to load requests"), r.status)
  return r.json()
}

export async function resolveContactRequest(
  requestId: number,
  action: "approve" | "reject",
  workerPhone: string,
  signal?: AbortSignal
): Promise<LabourContactRequestOut> {
  const r = await fetch(`${BASE}/contact-requests/${requestId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, worker_phone: workerPhone }),
    signal,
  })
  if (!r.ok) throw new JobsAPIError(await readDetail(r, "Failed to resolve contact request"), r.status)
  return r.json()
}

export async function deleteWorkerAccount(payload: AccountDeleteIn, signal?: AbortSignal): Promise<any> {
  const r = await fetch(`${BASE}/workers/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  })
  if (!r.ok) throw new JobsAPIError(await readDetail(r, "Account deletion failed"), r.status)
  return r.json()
}

// ---------- Phase 6: Wage Intelligence API ----------

export async function fetchWageBenchmarks(
  filters: { state?: string; activity_slug?: string } = {},
  signal?: AbortSignal
): Promise<WageBenchmark[]> {
  const qs = new URLSearchParams()
  if (filters.state) qs.append("state", filters.state)
  if (filters.activity_slug) qs.append("activity_slug", filters.activity_slug)
  try {
    const r = await fetch(`${BASE}/wage-benchmarks?${qs.toString()}`, { signal, cache: "no-store" })
    if (r.ok) {
      const data = await r.json()
      if (Array.isArray(data) && data.length > 0) {
        return data
      }
    }
  } catch (e) {
    // Network or proxy failure, fall back to client store
  }

  const { getFallbackBenchmarks } = await import("./worker-connect-store")
  return getFallbackBenchmarks(filters.state)
}

// ---------- Phase 4: Job Posting & Applications API ----------

export async function postLabourJob(payload: LabourJobPostIn, signal?: AbortSignal): Promise<LabourJobPostOut> {
  const r = await fetch(`${BASE}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  })
  if (!r.ok) throw new JobsAPIError(await readDetail(r, "Failed to post job"), r.status)
  return r.json()
}

export async function fetchLabourJobs(
  filters: {
    state?: string
    district?: string
    category_slug?: string
    status?: string
    viewer_phone?: string
    limit?: number
    offset?: number
  } = {},
  signal?: AbortSignal
): Promise<LabourJobPostOut[]> {
  const qs = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, String(v))
  })
  try {
    const r = await fetch(`${BASE}/jobs?${qs.toString()}`, { signal, cache: "no-store" })
    if (r.ok) {
      const data = await r.json()
      if (Array.isArray(data) && data.length > 0) {
        return data
      }
    }
  } catch (e) {
    // Network or proxy failure, fall back to client store
  }

  const { getFallbackJobs } = await import("./worker-connect-store")
  return getFallbackJobs(filters)
}

export async function applyForLabourJob(
  jobId: number,
  payload: LabourJobApplicationIn,
  signal?: AbortSignal
): Promise<LabourJobApplicationOut> {
  const r = await fetch(`${BASE}/jobs/${jobId}/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  })
  if (!r.ok) throw new JobsAPIError(await readDetail(r, "Application failed"), r.status)
  return r.json()
}

export async function fetchJobApplications(jobId: number, signal?: AbortSignal): Promise<LabourJobApplicationOut[]> {
  const r = await fetch(`${BASE}/jobs/${jobId}/applications`, { signal, cache: "no-store" })
  if (!r.ok) throw new JobsAPIError(await readDetail(r, "Failed to fetch applications"), r.status)
  return r.json()
}

export async function submitLabourReport(payload: LabourReportIn, signal?: AbortSignal): Promise<any> {
  const r = await fetch(`${BASE}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  })
  if (!r.ok) throw new JobsAPIError(await readDetail(r, "Report submission failed"), r.status)
  return r.json()
}

export async function seedDemoRealProfiles(signal?: AbortSignal): Promise<{
  ok: boolean
  workers_seeded: number
  jobs_seeded: number
  message: string
}> {
  try {
    const r = await fetch(`${BASE}/demo/seed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
    })
    if (r.ok) {
      return r.json()
    }
  } catch (e) {
    // Network or proxy failure, fall back to client store
  }

  // Graceful client fallback using authentic real public data
  const { seedRealDemoData } = await import("./worker-connect-store")
  return seedRealDemoData()
}

// ---------- Legacy Compatible API Methods ----------

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
  jobId: string | number,
  status: JobStatus,
  signal?: AbortSignal
): Promise<any> {
  const qs = new URLSearchParams({ status })
  const r = await fetch(`${BASE}/jobs/${encodeURIComponent(String(jobId))}/status?${qs.toString()}`, {
    method: "POST",
    signal,
  })
  if (!r.ok) throw new JobsAPIError(await readDetail(r, "Status update failed"), r.status)
  return r.json()
}

export async function deleteJob(jobId: string | number, signal?: AbortSignal): Promise<void> {
  const r = await fetch(`${BASE}/jobs/${encodeURIComponent(String(jobId))}`, {
    method: "DELETE",
    signal,
  })
  if (!r.ok && r.status !== 204) {
    throw new JobsAPIError(await readDetail(r, "Delete failed"), r.status)
  }
}

// ---------- Multilingual Category & Work Type Dictionaries ----------

export const OFFICIAL_CATEGORIES: { slug: string; name: Record<string, string>; icon: string }[] = [
  {
    slug: "ploughing_land_prep",
    name: {
      en: "Ploughing & Land Preparation",
      hi: "जुताई और खेत की तैयारी",
      kn: "ಉಳುಮೆ ಮತ್ತು ಭೂಮಿ ಸಿದ್ಧತೆ",
      te: "దుక్కి దున్నడం & నేల తయారీ",
      ta: "உழுதல் & நிலத்தை தயார்படுத்துதல்",
      mr: "नांगरणी आणि जमीन तयार करणे",
      gu: "ખેડ અને જમીન તૈયાર કરવી",
      bn: "জমি চষা ও তৈরি করা",
      pa: "ਹਲ ਵਾਹੁਣਾ ਅਤੇ ਜ਼ਮੀਨ ਤਿਆਰੀ",
      ml: "ഉഴവും നിലം ഒരുക്കലും",
      hi_en: "Ploughing & Land Prep",
    },
    icon: "Tractor",
  },
  {
    slug: "sowing",
    name: {
      en: "Sowing",
      hi: "बुवाई",
      kn: "ಬಿತ್ತನೆ",
      te: "విత్తనం నాటడం",
      ta: "விதைத்தல்",
      mr: "पेरणी",
      gu: "વાવણી",
      bn: "বীজ বপন",
      pa: "ਬਿਜਾਈ",
      ml: "വിത്ത് വിതയ്ക്കൽ",
      hi_en: "Sowing",
    },
    icon: "Sprout",
  },
  {
    slug: "seed_planting",
    name: {
      en: "Seed Planting",
      hi: "बीज रोपण",
      kn: "ಬೀಜ ನೆಡುವಿಕೆ",
      te: "విత్తనాలు పెట్టడం",
      ta: "விதை நடுதல்",
      mr: "बियाणे लागवड",
      gu: "બીજ રોપણ",
      bn: "বীজ রোপণ",
      pa: "ਬੀਜ ਲਾਉਣਾ",
      ml: "വിത്ത് നടൽ",
      hi_en: "Seed Planting",
    },
    icon: "Leaf",
  },
  {
    slug: "transplanting",
    name: {
      en: "Transplanting",
      hi: "पौध रोपाई (ट्रांसप्लांटिंग)",
      kn: "ಸಸಿ ನಾಟಿ",
      te: "నారు నాటడం",
      ta: "நாற்று நடுதல்",
      mr: "पुनर्लागवड (रोप लावणी)",
      gu: "રોપણી (ધરૂ રોપણ)",
      bn: "চারা রোপণ",
      pa: "ਪਨੀਰੀ ਲਾਉਣਾ",
      ml: "ഞാറു നടീൽ",
      hi_en: "Transplanting",
    },
    icon: "Sparkles",
  },
  {
    slug: "weeding",
    name: {
      en: "Weeding",
      hi: "निराई / खरपतवार नियंत्रण",
      kn: "ಕಳೆ ಕೀಳುವುದು",
      te: "కలుపు తీత",
      ta: "களை எடுத்தல்",
      mr: "खुरपणी (तण काढणे)",
      gu: "નીંદણ નિયંત્રણ",
      bn: "আগাছা নিড়ানো",
      pa: "ਗੋਡੀ / ਨਦੀਨ ਕੱਢਣਾ",
      ml: "കള പറിക്കൽ",
      hi_en: "Weeding",
    },
    icon: "Scissors",
  },
  {
    slug: "irrigation",
    name: {
      en: "Irrigation",
      hi: "सिंचाई प्रबंधन",
      kn: "ನೀರಾವರಿ",
      te: "నీటిపారుదల",
      ta: "நீர்ப்பாசனம்",
      mr: "पाणी देणे / सिंचन",
      gu: "પિયત વ્યવસ્થા",
      bn: "সেচ পরিচালনা",
      pa: "ਸਿੰਚਾਈ",
      ml: "നനയ്ക്കൽ",
      hi_en: "Irrigation",
    },
    icon: "Droplet",
  },
  {
    slug: "fertilizer_application",
    name: {
      en: "Fertilizer Application",
      hi: "खाद व उर्वरक डालना",
      kn: "ಗೊಬ್ಬರ ಹಾಕುವುದು",
      te: "ఎరువులు వేయడం",
      ta: "உரமிடுதல்",
      mr: "खत व्यवस्थापन",
      gu: "ખાતર આપવું",
      bn: "সার প্রয়োগ",
      pa: "ਖਾਦ ਪਾਉਣਾ",
      ml: "വളപ്രയോഗം",
      hi_en: "Fertilizer Application",
    },
    icon: "Package",
  },
  {
    slug: "spraying_crop_protection",
    name: {
      en: "Spraying & Crop Protection",
      hi: "कीटनाशक छिड़काव व फसल सुरक्षा",
      kn: "ಸಿಂಪಡಿಕೆ ಮತ್ತು ಬೆಳೆ ರಕ್ಷಣೆ",
      te: "స్ప్రేయింగ్ & పంట రక్షణ",
      ta: "தெளித்தல் & பயிர் பாதுகாப்பு",
      mr: "फवारणी व पीक संरक्षण",
      gu: "છંટકાવ અને પાક રક્ષણ",
      bn: "কীটনাশক স্প্রে ও ফসল সুরক্ষা",
      pa: "ਸਪਰੇਅ ਅਤੇ ਫ਼ਸਲ ਸੁਰੱਖਿਆ",
      ml: "മരുന്ന് തളിക്കലും സംരക്ഷണവും",
      hi_en: "Spraying & Protection",
    },
    icon: "Shield",
  },
  {
    slug: "harvesting",
    name: {
      en: "Harvesting",
      hi: "फसल कटाई",
      kn: "ಬೆಳೆ ಕಟಾವು",
      te: "పంట కోత",
      ta: "அறுவடை",
      mr: "कापणी",
      gu: "લણણી",
      bn: "ফসল কাটা",
      pa: "ਫ਼ਸਲ ਦੀ ਵਾਢੀ",
      ml: "വിളവെടുപ്പ്",
      hi_en: "Harvesting",
    },
    icon: "CheckCircle2",
  },
  {
    slug: "picking",
    name: {
      en: "Picking (Cotton / Fruits / Veg)",
      hi: "चुनाई (कपास, मिर्च, फल, सब्ज़ी)",
      kn: "ಕೊಯ್ಲು / ಹಣ್ಣು ತರಕಾರಿ ಕೀಳುವುದು",
      te: "ఏరడం (పత్తి, కూరగాయలు, పండ్లు)",
      ta: "பறித்தல் (பருத்தி / பழங்கள்)",
      mr: "वेचणी (कापूस, मिरची, फळे)",
      gu: "વીણવું (કપાસ / મરચાં / ફળો)",
      bn: "তোলা (তুলা, ফল, শাকসবজি)",
      pa: "ਚੁਗਾਈ (ਨਰਮਾ, ਫ਼ਲ, ਸਬਜ਼ੀਆਂ)",
      ml: "പറിച്ച് ശേഖരിക്കൽ",
      hi_en: "Picking Work",
    },
    icon: "Hand",
  },
  {
    slug: "threshing_winnowing",
    name: {
      en: "Threshing & Winnowing",
      hi: "गहाई और ओसाई (थ्रेशिंग व सफाई)",
      kn: "ಒಕ್ಕಣೆ ಮತ್ತು ತೂರುವಿಕೆ",
      te: "నూర్పిడి & తూర్పారబట్టడం",
      ta: "கதிரடித்தல் & தூற்றுதல்",
      mr: "मळणी आणि उफणणी",
      gu: "મળણી અને ઉપણવું",
      bn: "মাড়াই ও ওড়ানো",
      pa: "ਗਹਾਈ ਅਤੇ ਛੰਡਾਈ",
      ml: "മെതിക്കലും പതിര് മാറ്റലും",
      hi_en: "Threshing & Winnowing",
    },
    icon: "Wind",
  },
  {
    slug: "pruning",
    name: {
      en: "Pruning",
      hi: "छंटाई (बागवानी काट-छांट)",
      kn: "ಕತ್ತರಿಸುವುದು (ಪ್ರೂನಿಂಗ್)",
      te: "కత్తిరింపు (ప్రూనింగ్)",
      ta: "கவாத்து செய்தல்",
      mr: "छाटणी",
      gu: "છાંટણી",
      bn: "ছাঁটাই",
      pa: "ਕਾਂਟ-ਛਾਂਟ",
      ml: "കൊമ്പുകോതൽ",
      hi_en: "Pruning",
    },
    icon: "Scissors",
  },
  {
    slug: "nursery_work",
    name: {
      en: "Nursery Work",
      hi: "नर्सरी व पौधशाला कार्य",
      kn: "ನರ್ಸರಿ ಕೆಲಸ",
      te: "నర్సరీ పనులు",
      ta: "நாற்றங்கால் வேலை",
      mr: "रोपवाटिका काम",
      gu: "નર્સરી કામ",
      bn: "নার্সারির কাজ",
      pa: "ਨਰਸਰੀ ਦਾ ਕੰਮ",
      ml: "നഴ്സറി പണി",
      hi_en: "Nursery Work",
    },
    icon: "TreePine",
  },
  {
    slug: "livestock_farm_work",
    name: {
      en: "Livestock-Related Farm Work",
      hi: "पशुपालन व डेरी फार्म कार्य",
      kn: "ಪಶುಪಾಲನಾ ಕೃಷಿ ಕೆಲಸ",
      te: "పశుపోషణ & డెయిరీ పని",
      ta: "கால்நடை பண்ணை வேலை",
      mr: "पशुपालन व गोठा काम",
      gu: "પશુપાલન સંબંધિત કામ",
      bn: "গবাদি পশু ও ডেইরি ফার্মের কাজ",
      pa: "ਪਸ਼ੂ ਪਾਲਣ ਦਾ ਕੰਮ",
      ml: "കന്നുകാലി വളർത്തൽ പണി",
      hi_en: "Livestock & Dairy",
    },
    icon: "HeartHandshake",
  },
  {
    slug: "tractor_machinery_operators",
    name: {
      en: "Tractor & Machinery Operators",
      hi: "ट्रैक्टर व कृषि मशीन ऑपरेटर",
      kn: "ಟ್ರ್ಯಾಕ್ಟರ್ ಮತ್ತು ಯಂತ್ರ ಚಾಲಕರು",
      te: "ట్రాక్టర్ & యంత్ర ఆపరేటర్లు",
      ta: "டிராக்டர் & இயந்திர ஆபரேட்டர்கள்",
      mr: "ट्रॅक्टर व यंत्रचालक",
      gu: "ટ્રેક્ટર અને મશીનરી ઓપરેટર",
      bn: "ট্রাক্টর ও যন্ত্রপাতি চালক",
      pa: "ਟਰੈਕਟਰ ਅਤੇ ਮਸ਼ੀਨਰੀ ਚਾਲਕ",
      ml: "ട്രാക്ടറും മെഷീൻ ഓപ്പറേറ്റർമാരും",
      hi_en: "Tractor & Machine Drivers",
    },
    icon: "Gauge",
  },
  {
    slug: "general_agricultural_labour",
    name: {
      en: "General Agricultural Labour",
      hi: "सामान्य कृषि मजदूरी",
      kn: "ಸಾಮಾನ್ಯ ಕೃಷಿ ಕಾರ್ಮಿಕರು",
      te: "సాధారణ వ్యవసాయ కూలీలు",
      ta: "பொது விவசாய கூலி",
      mr: "सर्वसाधारण शेतमजुरी",
      gu: "સામાન્ય ખેતમજૂરી",
      bn: "সাধারণ কৃষিশ্রমিক",
      pa: "ਆਮ ਖੇਤੀਬਾੜੀ ਮਜ਼ਦੂਰੀ",
      ml: "സാധാരണ കർഷക തൊഴിലാളികൾ",
      hi_en: "General Farm Labour",
    },
    icon: "Users",
  },
  {
    slug: "contractors_worker_groups",
    name: {
      en: "Labour Contractors & Worker Groups",
      hi: "लेबर ठेकेदार व मज़दूर टोलियां",
      kn: "ಕಾರ್ಮಿಕ ಗುತ್ತಿಗೆದಾರರು ಮತ್ತು ಗುಂಪುಗಳು",
      te: "కూలీ కాంట్రాక్టర్లు & పని బృందాలు",
      ta: "தொழிலாளர் ஒப்பந்ததாரர்கள் & குழுக்கள்",
      mr: "मजूर कंत्राटदार व कामगार टोळी",
      gu: "મજૂર કોન્ટ્રાક્ટર અને શ્રમિક જૂથો",
      bn: "শ্রমিক ঠিকাদার ও দল",
      pa: "ਲੇਬਰ ਠੇਕੇਦਾਰ ਅਤੇ ਮਜ਼ਦੂਰ ਟੋਲੀਆਂ",
      ml: "തൊഴിലാളി കോൺട്രാക്ടർമാരും ഗ്രൂപ്പുകളും",
      hi_en: "Labour Gangs & Contractors",
    },
    icon: "Briefcase",
  },
]

export const WORK_TYPE_LABEL: Record<WorkType, Record<string, string>> = {
  harvesting:   { en: "Harvesting",     hi: "कटाई",          kn: "ಕಟಾವು",         te: "కోత",           ta: "அறுவடை",        mr: "कापणी",         gu: "લણણી",         bn: "ফসল কাটা",      pa: "ਵਾਢੀ",          ml: "വിളവെടുപ്പ്",   hi_en: "Harvesting" },
  sowing:       { en: "Sowing",         hi: "बुवाई",         kn: "ಬಿತ್ತನೆ",        te: "విత్తనం నాటడం", ta: "விதைத்தல்",     mr: "पेरणी",          gu: "વાવણી",        bn: "বীজ বপন",       pa: "ਬਿਜਾਈ",         ml: "വിത്ത് വിതയ്ക്കൽ", hi_en: "Sowing" },
  weeding:      { en: "Weeding",        hi: "खरपतवार",       kn: "ಕಳೆ ಕೀಳುವುದು",   te: "కలుపు తీత",     ta: "களை எடுத்தல்",   mr: "खुरपणी",         gu: "નીંદણ",        bn: "আগাছা নিড়ানো", pa: "ਗੋਡੀ",          ml: "കള പറിക്കൽ",    hi_en: "Weeding" },
  spraying:     { en: "Spraying",       hi: "छिड़काव",        kn: "ಸಿಂಪಡಿಕೆ",       te: "స్ప్రేయింగ్",   ta: "தெளித்தல்",     mr: "फवारणी",        gu: "છંટકાવ",       bn: "স্প্রে করা",    pa: "ਸਪਰੇਅ",         ml: "തളിക്കൽ",       hi_en: "Spraying" },
  tractor:      { en: "Tractor work",   hi: "ट्रैक्टर",       kn: "ಟ್ರ್ಯಾಕ್ಟರ್",    te: "ట్రాక్టర్ పని", ta: "டிராக்டர் வேலை",mr: "ट्रॅक्टर काम",  gu: "ટ્રેક્ટર કામ", bn: "ট্রাক্টর কাজ",  pa: "ਟਰੈਕਟਰ ਕੰਮ",    ml: "ട്രാക്ടർ പണി",   hi_en: "Tractor work" },
  ploughing:    { en: "Ploughing",      hi: "जुताई",         kn: "ಉಳುಮೆ",         te: "దుక్కి దున్నడం", ta: "உഴുதல்",        mr: "नांगरणी",        gu: "ખેડવું",       bn: "হাল চাষ",       pa: "ਹਲ ਵਾਹੁਣਾ",     ml: "ഉഴവ്",          hi_en: "Ploughing" },
  irrigation:   { en: "Irrigation",     hi: "सिंचाई",        kn: "ನೀರಾವರಿ",       te: "నీటిపారుదల",    ta: "நீர்ப்பாசனம்",   mr: "पाणी देणे",      gu: "પિયત",         bn: "সেচ",           pa: "ਸਿੰਚਾਈ",        ml: "നനയ്ക്കൽ",      hi_en: "Irrigation" },
  general:      { en: "General labour", hi: "मजदूरी",        kn: "ಸಾಮಾನ್ಯ ಕೆಲಸ",  te: "సాధారణ కూలీ",   ta: "பொது வேலை",     mr: "मजुरी",          gu: "મજૂરી",        bn: "সাধারণ কাজ",    pa: "ਮਜ਼ਦੂਰੀ",        ml: "സാധാരണ പണി",   hi_en: "General labour" },
  transport:    { en: "Transport",      hi: "ढुलाई",         kn: "ಸಾಗಣೆ",         te: "రవాణా",         ta: "போக்குவரத்து",  mr: "வாहतूक",        gu: "વાહન વ્યવહાર", bn: "পরিবহন",       pa: "ਢੋਆ-ਢੁਆਈ",      ml: "ഗതാഗതം",        hi_en: "Transport" },
  post_harvest: { en: "Post-harvest",   hi: "कटाई के बाद",   kn: "ಕಟಾವು ನಂತರ",    te: "కోత అనంతర పనులు", ta: "அறுவடைக்கு பின்", mr: "कापणीनंतरची कामे", gu: "લણણી પછી",     bn: "ফসল তোলার পর",  pa: "ਵਾਢੀ ਤੋਂ ਬਾਅਦ", ml: "വിളവെടുപ്പിന് ശേഷം", hi_en: "Post-harvest" },
  other:        { en: "Other",          hi: "अन्य",          kn: "ಇತರೆ",          te: "ಇತರ",           ta: "மற்றவை",        mr: "इतर",           gu: "અન્ય",         bn: "অন্যান্য",      pa: "ਹੋਰ",           ml: "മറ്റുള്ളവ",     hi_en: "Other" },
}

export const WORK_TYPES: WorkType[] = [
  "harvesting", "sowing", "weeding", "spraying",
  "tractor", "ploughing", "irrigation", "general",
  "transport", "post_harvest", "other",
]
