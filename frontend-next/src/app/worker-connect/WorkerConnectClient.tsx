"use client"

import { useCallback, useEffect, useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Filter,
  IndianRupee,
  Info,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  PhoneCall,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Sprout,
  TrendingUp,
  User,
  Users,
  X,
  AlertCircle,
  Building2,
  ChevronRight,
  ExternalLink,
  Calendar,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Home,
  ArrowRight,
  UtensilsCrossed,
  Bed,
  Truck,
  Eye,
} from "lucide-react"

import { useLanguage, type Lang } from "@/lib/language"
import { getStoredUser } from "@/lib/auth"
import {
  type WorkerProfile,
  type WorkerCategory,
  type LabourJobPostOut,
  type LabourJobPostIn,
  type LabourContactRequestOut,
  type WorkerSearchQuery,
  OFFICIAL_CATEGORIES,
  searchWorkerProfiles,
  fetchLabourJobs,
  postLabourJob,
  requestWorkerContact,
} from "@/lib/jobs-api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AgriculturalHeroBanner } from "@/components/worker-connect/AgriculturalHeroBanner"

type TabMode = "find_workers" | "find_jobs" | "post_job"

const INDIAN_STATES = [
  "All States",
  "Punjab",
  "Haryana",
  "Uttar Pradesh",
  "Karnataka",
  "Maharashtra",
  "Andhra Pradesh",
  "Gujarat",
  "Rajasthan",
  "Bihar",
  "Madhya Pradesh",
  "Tamil Nadu",
  "West Bengal",
  "Himachal Pradesh",
  "Telangana",
  "Odisha",
  "Kerala",
  "Assam",
]

// Common District Mappings for dynamic district dropdown
const STATE_DISTRICTS: Record<string, string[]> = {
  "Punjab": ["All Districts", "Ludhiana", "Amritsar", "Jalandhar", "Bathinda", "Patiala", "Sangrur", "Firozpur"],
  "Haryana": ["All Districts", "Karnal", "Hisar", "Ambala", "Kurukshetra", "Sirsa", "Rohtak", "Sonipat"],
  "Uttar Pradesh": ["All Districts", "Meerut", "Muzaffarnagar", "Barabanki", "Varanasi", "Lucknow", "Agra", "Bareilly"],
  "Karnataka": ["All Districts", "Dharwad", "Belagavi", "Mandya", "Mysuru", "Shivamogga", "Tumakuru", "Vijayapura"],
  "Maharashtra": ["All Districts", "Nashik", "Pune", "Ahmednagar", "Solapur", "Kolhapur", "Nagpur", "Aurangabad"],
  "Andhra Pradesh": ["All Districts", "Guntur", "Krishna", "East Godavari", "Kurnool", "Anantapur", "Prakasam"],
  "Gujarat": ["All Districts", "Rajkot", "Surat", "Mehsana", "Junagadh", "Amreli", "Bhavnagar", "Vadodara"],
  "Rajasthan": ["All Districts", "Kota", "Jaipur", "Sri Ganganagar", "Hanumangarh", "Alwar", "Baran", "Jodhpur"],
  "Bihar": ["All Districts", "Muzaffarpur", "Samastipur", "Patna", "Gaya", "Begusarai", "Bhagalpur"],
}

export default function WorkerConnectClient() {
  const searchParams = useSearchParams()
  const { lang } = useLanguage()

  // Primary active tab: only 3 clean sections
  const [activeTab, setActiveTab] = useState<TabMode>("find_workers")

  // Check URL params for initial tab
  useEffect(() => {
    const tab = searchParams?.get("tab")
    if (tab === "find_jobs" || tab === "post_job" || tab === "find_workers") {
      setActiveTab(tab)
    }
  }, [searchParams])

  // =========================================================================
  // SECTION 1: FIND WORKERS STATE
  // =========================================================================
  const [workers, setWorkers] = useState<WorkerProfile[]>([])
  const [loadingWorkers, setLoadingWorkers] = useState<boolean>(true)
  const [workerSearchQuery, setWorkerSearchQuery] = useState("")
  const [selectedState, setSelectedState] = useState("All States")
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts")
  const [tehsilFilter, setTehsilFilter] = useState("")
  const [selectedWorkerType, setSelectedWorkerType] = useState<"all" | "individual" | "group" | "contractor">("all")
  const [maxWageFilter, setMaxWageFilter] = useState<number>(1000)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "today" | "3days">("all")
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(100)
  const [workerSortBy, setWorkerSortBy] = useState<"relevance" | "distance" | "wage_asc" | "wage_desc">("relevance")

  // Modal / Contact states
  const [selectedWorkerForDetail, setSelectedWorkerForDetail] = useState<WorkerProfile | null>(null)
  const [contactModalWorker, setContactModalWorker] = useState<WorkerProfile | null>(null)
  const [requesterName, setRequesterName] = useState("")
  const [requesterPhone, setRequesterPhone] = useState("")
  const [requesterFarmLoc, setRequesterFarmLoc] = useState("")
  const [contactSuccessMsg, setContactSuccessMsg] = useState("")
  const [unlockedWorkerContacts, setUnlockedWorkerContacts] = useState<Record<number, string>>({})

  // Pre-fill user phone & name if logged in
  useEffect(() => {
    const user = getStoredUser()
    if (user) {
      if (user.phone_number) setRequesterPhone(user.phone_number)
      if (user.name) setRequesterName(user.name)
    }
  }, [])

  // Fetch Workers
  const loadWorkers = useCallback(async () => {
    setLoadingWorkers(true)
    try {
      const query: WorkerSearchQuery = {
        state: selectedState !== "All States" ? selectedState : undefined,
        district: selectedDistrict !== "All Districts" ? selectedDistrict : undefined,
        category_slug: selectedCategory !== "all" ? selectedCategory : undefined,
        worker_type: selectedWorkerType,
        max_wage: maxWageFilter,
        radius_km: maxDistanceKm,
      }
      const res = await searchWorkerProfiles(query)
      let list = res.workers || []

      // Apply client-side sorting
      if (workerSortBy === "wage_asc") {
        list.sort((a, b) => a.wage_expectation - b.wage_expectation)
      } else if (workerSortBy === "wage_desc") {
        list.sort((a, b) => b.wage_expectation - a.wage_expectation)
      } else if (workerSortBy === "distance") {
        list.sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999))
      }

      setWorkers(list)
    } catch (e) {
      console.error("Failed to load worker profiles:", e)
    } finally {
      setLoadingWorkers(false)
    }
  }, [selectedState, selectedDistrict, selectedCategory, selectedWorkerType, maxWageFilter, maxDistanceKm, workerSortBy])

  useEffect(() => {
    loadWorkers()
  }, [loadWorkers])

  // Reset Filters
  const handleResetWorkerFilters = () => {
    setSelectedState("All States")
    setSelectedDistrict("All Districts")
    setTehsilFilter("")
    setSelectedWorkerType("all")
    setMaxWageFilter(1000)
    setSelectedCategory("all")
    setAvailabilityFilter("all")
    setMaxDistanceKm(100)
    setWorkerSortBy("relevance")
    setWorkerSearchQuery("")
  }

  // Filtered workers list
  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      if (workerSearchQuery.trim()) {
        const q = workerSearchQuery.toLowerCase()
        const matchName = w.name.toLowerCase().includes(q)
        const matchLoc = (w.village || "").toLowerCase().includes(q) || w.district.toLowerCase().includes(q)
        const matchSkills = w.skills.some((s) => s.skill_name.toLowerCase().includes(q) || s.category_slug.toLowerCase().includes(q))
        if (!matchName && !matchLoc && !matchSkills) return false
      }
      if (tehsilFilter.trim()) {
        const t = tehsilFilter.toLowerCase()
        const matchTehsil = (w.village || "").toLowerCase().includes(t) || w.district.toLowerCase().includes(t)
        if (!matchTehsil) return false
      }
      return true
    })
  }, [workers, workerSearchQuery, tehsilFilter])

  // Helper for natural worker type description
  const getNaturalWorkerType = (worker: WorkerProfile): string => {
    if (worker.worker_type === "individual") {
      return lang === "hi" ? "व्यक्तिगत मजदूर" : "Individual Worker"
    }
    if (worker.worker_type === "group") {
      const count = worker.group_size || 1
      return lang === "hi" ? `मजदूर दल (${count} सदस्य)` : `Worker Team (${count} members)`
    }
    return lang === "hi" ? "कृषि सेवा प्रदाता" : "Agricultural Service Provider"
  }

  // Handle Request Contact submit
  const handleSendContactRequest = async () => {
    if (!contactModalWorker || !requesterPhone) return
    try {
      await requestWorkerContact(contactModalWorker.id, {
        worker_id: contactModalWorker.id,
        requester_name: requesterName || "Verified Farmer",
        requester_phone: requesterPhone,
        purpose: "hiring_inquiry",
        farm_location: requesterFarmLoc || `${selectedState}, ${selectedDistrict}`,
      })

      // Reveal unmasked phone if available
      if (contactModalWorker.unmasked_phone) {
        setUnlockedWorkerContacts((prev) => ({
          ...prev,
          [contactModalWorker.id]: contactModalWorker.unmasked_phone!,
        }))
      }

      setContactSuccessMsg(
        lang === "hi"
          ? "संपर्क अनुरोध सफलतापूर्वक भेजा गया! कार्यकर्ता से बातचीत के लिए नीचे दिए गए बटन का उपयोग करें।"
          : "Contact request sent! Worker phone number is now accessible below."
      )
    } catch (e) {
      console.error("Failed to request contact:", e)
      // Fallback reveal
      if (contactModalWorker.unmasked_phone) {
        setUnlockedWorkerContacts((prev) => ({
          ...prev,
          [contactModalWorker.id]: contactModalWorker.unmasked_phone!,
        }))
      }
      setContactSuccessMsg(
        lang === "hi"
          ? "संपर्क विवरण अनलॉक किया गया। आप सीधे कॉल या व्हाट्सएप कर सकते हैं।"
          : "Contact details unlocked. You can now call or WhatsApp directly."
      )
    }
  }

  // =========================================================================
  // SECTION 2: FIND FARMING JOBS STATE
  // =========================================================================
  const [jobs, setJobs] = useState<LabourJobPostOut[]>([])
  const [loadingJobs, setLoadingJobs] = useState<boolean>(true)
  const [jobSearchQuery, setJobSearchQuery] = useState("")
  const [jobStateFilter, setJobStateFilter] = useState("All States")
  const [jobCategoryFilter, setJobCategoryFilter] = useState("all")
  const [jobSourceFilter, setJobSourceFilter] = useState<"all" | "internal" | "external">("all")
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<LabourJobPostOut | null>(null)
  const [justPostedJobCode, setJustPostedJobCode] = useState<string | null>(null)

  // Load Jobs
  const loadJobs = useCallback(async () => {
    setLoadingJobs(true)
    try {
      const res = await fetchLabourJobs({
        state: jobStateFilter !== "All States" ? jobStateFilter : undefined,
        category_slug: jobCategoryFilter !== "all" ? jobCategoryFilter : undefined,
      })
      setJobs(res || [])
    } catch (e) {
      console.error("Failed to load farm jobs:", e)
    } finally {
      setLoadingJobs(false)
    }
  }, [jobStateFilter, jobCategoryFilter])

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  // Filtered jobs list
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (jobSourceFilter !== "all") {
        const isExternal = j.source_type === "external"
        if (jobSourceFilter === "external" && !isExternal) return false
        if (jobSourceFilter === "internal" && isExternal) return false
      }
      if (jobSearchQuery.trim()) {
        const q = jobSearchQuery.toLowerCase()
        const matchTitle = j.job_title.toLowerCase().includes(q)
        const matchDesc = (j.work_type_detail || "").toLowerCase().includes(q)
        const matchEmployer = (j.employer_name || j.contact_name).toLowerCase().includes(q)
        const matchLoc = j.state.toLowerCase().includes(q) || j.district.toLowerCase().includes(q)
        if (!matchTitle && !matchDesc && !matchEmployer && !matchLoc) return false
      }
      return true
    })
  }, [jobs, jobSourceFilter, jobSearchQuery])

  // =========================================================================
  // SECTION 3: POST A FARM JOB FORM STATE
  // =========================================================================
  const [postTitle, setPostTitle] = useState("")
  const [postEmployerName, setPostEmployerName] = useState("")
  const [postMobile, setPostMobile] = useState("")
  const [postState, setPostState] = useState("Punjab")
  const [postDistrict, setPostDistrict] = useState("Ludhiana")
  const [postVillage, setPostVillage] = useState("")
  const [postCategory, setPostCategory] = useState("harvesting")
  const [postWorkersNeeded, setPostWorkersNeeded] = useState("5")
  const [postWage, setPostWage] = useState("500")
  const [postStartDate, setPostStartDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  )
  const [postDurationDays, setPostDurationDays] = useState("5")
  const [postWorkingHours, setPostWorkingHours] = useState("8:00 AM - 5:00 PM")
  const [postAccommodation, setPostAccommodation] = useState(false)
  const [postFoodProvided, setPostFoodProvided] = useState(true)
  const [postTransportProvided, setPostTransportProvided] = useState(false)
  const [postDescription, setPostDescription] = useState("")
  const [postingLoading, setPostingLoading] = useState(false)
  const [postSuccessMessage, setPostSuccessMessage] = useState("")

  // Load draft from localStorage if available
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem("kisaanbuddy_labour_job_draft")
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft)
        if (parsed.title) setPostTitle(parsed.title)
        if (parsed.employer) setPostEmployerName(parsed.employer)
        if (parsed.mobile) setPostMobile(parsed.mobile)
        if (parsed.state) setPostState(parsed.state)
        if (parsed.district) setPostDistrict(parsed.district)
        if (parsed.desc) setPostDescription(parsed.desc)
      }
    } catch (e) {
      // ignore
    }
  }, [])

  const handleSaveDraft = () => {
    try {
      const draft = {
        title: postTitle,
        employer: postEmployerName,
        mobile: postMobile,
        state: postState,
        district: postDistrict,
        desc: postDescription,
      }
      localStorage.setItem("kisaanbuddy_labour_job_draft", JSON.stringify(draft))
      alert(lang === "hi" ? "ड्राफ्ट सुरक्षित कर लिया गया है।" : "Draft saved successfully.")
    } catch (e) {
      // ignore
    }
  }

  const handlePublishJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!postTitle.trim() || !postEmployerName.trim() || !postMobile.trim() || !postWage) {
      alert(lang === "hi" ? "कृपया सभी आवश्यक फ़ील्ड भरें।" : "Please fill in all required fields.")
      return
    }

    setPostingLoading(true)
    try {
      const payload: LabourJobPostIn = {
        job_title: postTitle.trim(),
        category_slug: postCategory,
        work_type_detail: postDescription.trim() || "Agricultural field work requirement.",
        state: postState,
        district: postDistrict,
        village: postVillage.trim() || undefined,
        workers_needed: parseInt(postWorkersNeeded, 10) || 1,
        wage_amount: parseFloat(postWage) || 450,
        wage_unit: "per_day",
        start_date: postStartDate,
        duration_days: parseInt(postDurationDays, 10) || 3,
        working_hours_desc: postWorkingHours,
        payment_terms: "Daily Cash on Site",
        transport_info: postTransportProvided ? "Transport assistance provided by farmer" : "Self transport to farm site",
        accommodation_info: postAccommodation ? "Farm shed / room stay available" : "Day work only / No stay",
        contact_name: postEmployerName.trim(),
        contact_phone: postMobile.trim(),
      }

      const res = await postLabourJob(payload)
      const newJobCode = res.job_code || `KB-JOB-${Date.now().toString().slice(-4)}`
      setJustPostedJobCode(newJobCode)

      // Clear draft
      localStorage.removeItem("kisaanbuddy_labour_job_draft")

      setPostSuccessMessage(
        lang === "hi"
          ? `खेत का काम सफलतापूर्वक प्रकाशित हुआ! (जॉब कोड: ${newJobCode})`
          : `Farm Job published successfully! (Job Code: ${newJobCode})`
      )

      // Refresh jobs list and switch to find_jobs tab
      await loadJobs()
      setTimeout(() => {
        setActiveTab("find_jobs")
        setPostSuccessMessage("")
      }, 1500)
    } catch (err: any) {
      console.error("Job publishing failed:", err)
      alert(err?.message || "Failed to publish job. Please try again.")
    } finally {
      setPostingLoading(false)
    }
  }

  // Localized Category Helper
  const getCategoryName = (slug: string): string => {
    const found = OFFICIAL_CATEGORIES.find((c) => c.slug === slug)
    if (found?.name) {
      return found.name[lang] || found.name.en || slug.replace(/_/g, " ")
    }
    return slug.replace(/_/g, " ")
  }

  return (
    <div className="min-h-screen bg-[#fcfdfa] dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* AGRICULTURAL HERO BANNER (Indian Landscape, Farmers & Tractor Artwork)    */}
        {/* ========================================================================= */}
        <AgriculturalHeroBanner activeTab={activeTab} onTabChange={setActiveTab} />

        {/* ========================================================================= */}
        {/* TAB 1: FIND WORKERS (Search & Filter Interface for Farmers)               */}
        {/* ========================================================================= */}
        {activeTab === "find_workers" && (
          <div className="space-y-6">
            
            {/* Search and Filters Card */}
            <Card className="p-5 sm:p-6 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white">
                    {lang === "hi" ? "मजदूर खोज और फ़िल्टर" : "Find Agricultural Workers"}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetWorkerFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{lang === "hi" ? "फ़िल्टर रीसेट" : "Reset Filters"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={loadWorkers}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{lang === "hi" ? "खोजें" : "Find Workers"}</span>
                  </button>
                </div>
              </div>

              {/* 8 Intuitive Filter Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. State Filter */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {lang === "hi" ? "राज्य (State)" : "State"}
                  </Label>
                  <select
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value)
                      setSelectedDistrict("All Districts")
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-600 outline-none"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* 2. District Filter */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {lang === "hi" ? "जिला (District)" : "District"}
                  </Label>
                  {STATE_DISTRICTS[selectedState] ? (
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-600 outline-none"
                    >
                      {STATE_DISTRICTS[selectedState].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      placeholder={lang === "hi" ? "जिला दर्ज करें..." : "Enter district..."}
                      value={selectedDistrict === "All Districts" ? "" : selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value || "All Districts")}
                      className="h-10 text-xs sm:text-sm rounded-xl"
                    />
                  )}
                </div>

                {/* 3. Tehsil / Block Filter */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {lang === "hi" ? "तहसील / ब्लॉक" : "Tehsil / Block"}
                  </Label>
                  <Input
                    placeholder={lang === "hi" ? "तहसील या गाँव का नाम..." : "Tehsil or village..."}
                    value={tehsilFilter}
                    onChange={(e) => setTehsilFilter(e.target.value)}
                    className="h-10 text-xs sm:text-sm rounded-xl"
                  />
                </div>

                {/* 4. Worker Type Filter */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {lang === "hi" ? "मजदूर प्रकार" : "Worker Type"}
                  </Label>
                  <select
                    value={selectedWorkerType}
                    onChange={(e) => setSelectedWorkerType(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-600 outline-none"
                  >
                    <option value="all">{lang === "hi" ? "सभी प्रकार" : "All Worker Types"}</option>
                    <option value="individual">{lang === "hi" ? "व्यक्तिगत मजदूर (Individual)" : "Individual Worker"}</option>
                    <option value="group">{lang === "hi" ? "मजदूर दल (Worker Team)" : "Worker Team"}</option>
                    <option value="contractor">{lang === "hi" ? "कृषि सेवा प्रदाता" : "Agricultural Service Provider"}</option>
                  </select>
                </div>

                {/* 5. Work Category Filter (14 Categories) */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {lang === "hi" ? "कार्य श्रेणी (Category)" : "Work Category"}
                  </Label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-600 outline-none"
                  >
                    <option value="all">{lang === "hi" ? "सभी श्रेणियां (All Categories)" : "All Work Categories"}</option>
                    {OFFICIAL_CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name[lang] || c.name.en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 6. Maximum Wage Filter */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold text-stone-700 dark:text-stone-300">
                    <span>{lang === "hi" ? "अधिकतम दिहाड़ी" : "Max Daily Wage"}</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">₹{maxWageFilter} / {lang === "hi" ? "दिन" : "day"}</span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="1000"
                    step="50"
                    value={maxWageFilter}
                    onChange={(e) => setMaxWageFilter(Number(e.target.value))}
                    className="w-full h-2 bg-stone-200 dark:bg-stone-800 rounded-lg accent-emerald-700 cursor-pointer"
                  />
                </div>

                {/* 7. Availability Filter */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {lang === "hi" ? "उपलब्धता" : "Availability"}
                  </Label>
                  <select
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-600 outline-none"
                  >
                    <option value="all">{lang === "hi" ? "कोई भी उपलब्धता" : "Any Availability"}</option>
                    <option value="today">{lang === "hi" ? "आज उपलब्ध (Available Today)" : "Available Today"}</option>
                    <option value="3days">{lang === "hi" ? "3 दिन के भीतर उपलब्ध" : "Available in 3 Days"}</option>
                  </select>
                </div>

                {/* 8. Distance Filter */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {lang === "hi" ? "दूरी का दायरा" : "Distance Radius"}
                  </Label>
                  <select
                    value={maxDistanceKm}
                    onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-600 outline-none"
                  >
                    <option value={25}>{lang === "hi" ? "25 किमी के भीतर" : "Within 25 km"}</option>
                    <option value={50}>{lang === "hi" ? "50 किमी के भीतर" : "Within 50 km"}</option>
                    <option value={100}>{lang === "hi" ? "100 किमी के भीतर" : "Within 100 km"}</option>
                    <option value={300}>{lang === "hi" ? "पूरे राज्य में" : "Any Distance"}</option>
                  </select>
                </div>
              </div>

              {/* Sorting Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-stone-800/60 text-xs text-stone-600 dark:text-stone-400">
                <span className="font-medium">
                  {lang === "hi" ? "परिणाम:" : "Found:"}{" "}
                  <strong className="text-stone-900 dark:text-white font-bold">{filteredWorkers.length}</strong>{" "}
                  {lang === "hi" ? "सत्यापित कृषि मजदूर" : "verified agricultural profiles"}
                </span>

                <div className="flex items-center gap-2">
                  <span className="font-semibold">{lang === "hi" ? "क्रमबद्ध करें:" : "Sort by:"}</span>
                  <select
                    value={workerSortBy}
                    onChange={(e) => setWorkerSortBy(e.target.value as any)}
                    className="h-8 px-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-medium outline-none"
                  >
                    <option value="relevance">{lang === "hi" ? "प्रासंगिकता" : "Relevance"}</option>
                    <option value="distance">{lang === "hi" ? "दूरी (निकटतम पहले)" : "Distance (Nearest)"}</option>
                    <option value="wage_asc">{lang === "hi" ? "दिहाड़ी (कम से ज्यादा)" : "Wage (Low to High)"}</option>
                    <option value="wage_desc">{lang === "hi" ? "दिहाड़ी (ज्यादा से कम)" : "Wage (High to Low)"}</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Workers Grid */}
            {loadingWorkers ? (
              <div className="p-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-700" />
                <p className="text-sm text-stone-500 font-medium">
                  {lang === "hi" ? "सत्यापित कृषि मजदूरों की सूची लोड हो रही है..." : "Loading verified worker profiles..."}
                </p>
              </div>
            ) : filteredWorkers.length === 0 ? (
              <Card className="p-12 text-center space-y-4 border-dashed border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900 rounded-2xl">
                <Users className="w-12 h-12 text-stone-400 mx-auto" />
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                  {lang === "hi" ? "कोई मजदूर नहीं मिला" : "No Workers Match Your Filters"}
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
                  {lang === "hi"
                    ? "कृपया राज्य, जिला या कार्य श्रेणी बदलकर पुनः प्रयास करें।"
                    : "Try adjusting the state, work category, or maximum wage filter to discover more workers."}
                </p>
                <Button onClick={handleResetWorkerFilters} variant="outline" className="text-xs font-bold rounded-xl">
                  {lang === "hi" ? "सभी फ़िल्टर साफ़ करें" : "Clear All Filters"}
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredWorkers.map((worker) => {
                  const unlockedPhone = unlockedWorkerContacts[worker.id] || worker.unmasked_phone
                  const initials = worker.name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0].toUpperCase())
                    .join("")

                  return (
                    <Card
                      key={worker.id}
                      className="p-5 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        {/* Header: Avatar, Name & Type */}
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-extrabold flex items-center justify-center shrink-0 border border-emerald-300/60 dark:border-emerald-800 text-sm">
                            {initials || "AG"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-stone-900 dark:text-white leading-tight truncate">
                              {worker.name}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] font-semibold">
                                {getNaturalWorkerType(worker)}
                              </span>
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                {lang === "hi" ? "सत्यापित" : "Verified"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Location & Wage Row */}
                        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                          <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400 truncate">
                            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="truncate">{worker.village ? `${worker.village}, ` : ""}{worker.district}, {worker.state}</span>
                          </div>
                          <div className="flex items-center justify-end gap-1 font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">
                            <span>₹{worker.wage_expectation}</span>
                            <span className="text-[11px] font-medium text-stone-500">/{lang === "hi" ? "दिन" : "day"}</span>
                          </div>
                        </div>

                        {/* Skills Chips */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {worker.skills.slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] font-medium"
                            >
                              {s.skill_name}
                            </span>
                          ))}
                          {worker.skills.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500 text-[10px]">
                              +{worker.skills.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Experience & Languages */}
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-between border-t border-stone-100 dark:border-stone-800/60 pt-2.5">
                          <span>
                            {worker.skills[0]?.experience_years
                              ? `${worker.skills[0].experience_years} ${lang === "hi" ? "वर्ष अनुभव" : "yrs experience"}`
                              : lang === "hi" ? "अनुभवी मजदूर" : "Experienced"}
                          </span>
                          <span>{worker.languages_spoken?.slice(0, 2).join(", ")}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 border-t border-stone-100 dark:border-stone-800/60 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedWorkerForDetail(worker)}
                          className="flex-1 py-2 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer text-center"
                        >
                          {lang === "hi" ? "विवरण देखें" : "View Profile"}
                        </button>

                        {unlockedPhone ? (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${unlockedPhone}`}
                              className="p-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer"
                              title="Direct Call"
                            >
                              <PhoneCall className="w-4 h-4" />
                            </a>
                            <a
                              href={`https://wa.me/91${unlockedPhone.replace(/\D/g, "")}?text=Namaste%20${encodeURIComponent(worker.name)},%20I%20am%20contacting%20you%20via%20KisaanBuddy%20for%20farm%20work.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-green-600 hover:bg-green-700 text-white transition-colors cursor-pointer"
                              title="WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setContactModalWorker(worker)
                              setContactSuccessMsg("")
                            }}
                            className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer text-center"
                          >
                            {lang === "hi" ? "संपर्क करें" : "Contact Worker"}
                          </button>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: FIND FARMING JOBS (Real Agricultural Job Listings & KisaanBuddy)  */}
        {/* ========================================================================= */}
        {activeTab === "find_jobs" && (
          <div className="space-y-6">
            
            {/* Success notification if just posted */}
            {justPostedJobCode && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold">
                    {lang === "hi"
                      ? `आपका कार्य प्रकाशित हो गया है! (जॉब कोड: ${justPostedJobCode})`
                      : `Your farm job was published! (Job Code: ${justPostedJobCode})`}
                  </span>
                </div>
                <button
                  onClick={() => setJustPostedJobCode(null)}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  {lang === "hi" ? "बंद करें" : "Dismiss"}
                </button>
              </div>
            )}

            {/* Job Filters Card */}
            <Card className="p-5 sm:p-6 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white">
                    {lang === "hi" ? "वास्तविक कृषि रोजगार के अवसर" : "Real Agricultural Job Vacancies"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("post_job")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === "hi" ? "+ नया काम पोस्ट करें" : "+ Post a Job"}</span>
                </button>
              </div>

              {/* Search + Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Keyword Search */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {lang === "hi" ? "खोज (कीवर्ड/फसल)" : "Search (Keyword / Crop)"}
                  </Label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                    <Input
                      placeholder={lang === "hi" ? "जैसे: ट्रैक्टर चालक, गेहूं कटाई..." : "e.g. Tractor Driver, Paddy..."}
                      value={jobSearchQuery}
                      onChange={(e) => setJobSearchQuery(e.target.value)}
                      className="pl-9 h-10 text-xs sm:text-sm rounded-xl"
                    />
                  </div>
                </div>

                {/* State */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {lang === "hi" ? "राज्य" : "State"}
                  </Label>
                  <select
                    value={jobStateFilter}
                    onChange={(e) => setJobStateFilter(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs sm:text-sm font-medium outline-none"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {lang === "hi" ? "कार्य श्रेणी" : "Work Category"}
                  </Label>
                  <select
                    value={jobCategoryFilter}
                    onChange={(e) => setJobCategoryFilter(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs sm:text-sm font-medium outline-none"
                  >
                    <option value="all">{lang === "hi" ? "सभी श्रेणियां" : "All Categories"}</option>
                    {OFFICIAL_CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name[lang] || c.name.en}</option>
                    ))}
                  </select>
                </div>

                {/* Source Filter */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {lang === "hi" ? "लिस्टिंग स्रोत" : "Listing Source"}
                  </Label>
                  <select
                    value={jobSourceFilter}
                    onChange={(e) => setJobSourceFilter(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs sm:text-sm font-medium outline-none"
                  >
                    <option value="all">{lang === "hi" ? "सभी स्रोत (All Sources)" : "All Sources"}</option>
                    <option value="internal">{lang === "hi" ? "किसानबड्डी पोस्ट (KisaanBuddy Jobs)" : "KisaanBuddy Farmer Jobs"}</option>
                    <option value="external">{lang === "hi" ? "बाहरी पोर्टल (NCS, Indeed, Apna)" : "External Public Listings"}</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Jobs List */}
            {loadingJobs ? (
              <div className="p-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-700" />
                <p className="text-sm text-stone-500 font-medium">
                  {lang === "hi" ? "कृषि नौकरियों की सूची लोड हो रही है..." : "Loading agricultural job vacancies..."}
                </p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <Card className="p-12 text-center space-y-4 border-dashed border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900 rounded-2xl">
                <Briefcase className="w-12 h-12 text-stone-400 mx-auto" />
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                  {lang === "hi" ? "कोई नौकरी नहीं मिली" : "No Job Vacancies Found"}
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
                  {lang === "hi"
                    ? "फ़िल्टर बदलकर पुनः खोजें या अपना पहला कार्य पोस्ट करें।"
                    : "Try resetting filters or post a new agricultural job opportunity."}
                </p>
                <Button onClick={() => { setJobStateFilter("All States"); setJobCategoryFilter("all"); setJobSearchQuery(""); setJobSourceFilter("all") }} variant="outline" className="text-xs font-bold rounded-xl">
                  {lang === "hi" ? "फ़िल्टर रीसेट करें" : "Reset Filters"}
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredJobs.map((job) => {
                  const isExternal = job.source_type === "external"
                  const sourceName = job.source_platform || (isExternal ? "External Listing" : "KisaanBuddy Job")

                  return (
                    <Card
                      key={job.id}
                      className="p-5 sm:p-6 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        {/* Top: Source Badge & Date */}
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              isExternal
                                ? "bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                                : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            }`}
                          >
                            {isExternal ? (
                              <Building2 className="w-3.5 h-3.5" />
                            ) : (
                              <Sprout className="w-3.5 h-3.5" />
                            )}
                            <span>{sourceName}</span>
                          </span>

                          <span className="text-[11px] text-stone-500 dark:text-stone-400">
                            {lang === "hi" ? "सक्रिय रिक्ति" : "Active Opening"}
                          </span>
                        </div>

                        {/* Job Title & Employer */}
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white leading-snug">
                            {job.job_title}
                          </h3>
                          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 font-medium">
                            {job.employer_name || job.contact_name}
                          </p>
                        </div>

                        {/* Location & Wage */}
                        <div className="grid grid-cols-2 gap-2 text-xs py-1">
                          <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400 truncate">
                            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="truncate">{job.village ? `${job.village}, ` : ""}{job.district}, {job.state}</span>
                          </div>
                          <div className="flex items-center justify-end gap-1 font-black text-emerald-700 dark:text-emerald-400 text-sm">
                            <span>₹{job.wage_amount}</span>
                            <span className="text-[11px] font-medium text-stone-500">/{lang === "hi" ? "दिन" : "day"}</span>
                          </div>
                        </div>

                        {/* Description */}
                        {job.work_type_detail && (
                          <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                            {job.work_type_detail}
                          </p>
                        )}

                        {/* Perks Chips */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px]">
                            <Users className="w-3 h-3 text-stone-500" />
                            <span>{job.workers_needed} {lang === "hi" ? "मजदूर आवश्यक" : "workers needed"}</span>
                          </span>
                          {job.accommodation_info && !job.accommodation_info.toLowerCase().includes("none") && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[11px]">
                              <Bed className="w-3 h-3" />
                              <span>{lang === "hi" ? "रहने की व्यवस्था" : "Stay Available"}</span>
                            </span>
                          )}
                          {job.payment_terms && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[11px]">
                              <span>{job.payment_terms}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedJobForDetail(job)}
                          className="text-xs font-semibold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{lang === "hi" ? "पूर्ण विवरण" : "View Details"}</span>
                        </button>

                        {isExternal && job.source_url ? (
                          <a
                            href={job.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                          >
                            <span>{lang === "hi" ? "मूल नौकरी देखें" : "View Original Job"}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <a
                            href={`tel:${job.unmasked_contact_phone || job.masked_contact_phone}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{lang === "hi" ? "सीधे संपर्क करें" : "Contact Employer"}</span>
                          </a>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: POST A FARM JOB (Clean & Functional Job Publishing System)         */}
        {/* ========================================================================= */}
        {activeTab === "post_job" && (
          <div className="max-w-3xl mx-auto space-y-6">
            
            {postSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 flex items-center gap-3 shadow-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <span className="text-sm font-semibold">{postSuccessMessage}</span>
              </div>
            )}

            <Card className="p-6 sm:p-8 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 rounded-3xl shadow-sm space-y-6">
              <div className="border-b border-stone-200 dark:border-stone-800 pb-4">
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white">
                  {lang === "hi" ? "खेत का काम पोस्ट करें" : "Post a Farm Job"}
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
                  {lang === "hi"
                    ? "कटाई, बुवाई, या ट्रैक्टर संचालन के लिए विश्वसनीय कृषि मजदूरों को सीधे काम पर रखें।"
                    : "Publish agricultural requirements to connect with verified farm workers and machinery operators."}
                </p>
              </div>

              <form onSubmit={handlePublishJob} className="space-y-6">
                
                {/* 1. Job Basics */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    1. {lang === "hi" ? "कार्य की मूल जानकारी" : "Job Information"}
                  </h3>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      {lang === "hi" ? "नौकरी का शीर्षक *" : "Job Title *"}
                    </Label>
                    <Input
                      placeholder={lang === "hi" ? "जैसे: 15 एकड़ गेहूं कटाई व कंबाइन सहायता" : "e.g. Wheat Harvesting Crew Needed for 15 Acres"}
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      required
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        {lang === "hi" ? "कार्य श्रेणी *" : "Work Category *"}
                      </Label>
                      <select
                        value={postCategory}
                        onChange={(e) => setPostCategory(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs sm:text-sm font-medium outline-none"
                      >
                        {OFFICIAL_CATEGORIES.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.name[lang] || c.name.en}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        {lang === "hi" ? "मजदूरों की संख्या *" : "Workers Required *"}
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={postWorkersNeeded}
                        onChange={(e) => setPostWorkersNeeded(e.target.value)}
                        required
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Location */}
                <div className="space-y-4 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    2. {lang === "hi" ? "खेत का स्थान" : "Farm Location"}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        {lang === "hi" ? "राज्य *" : "State *"}
                      </Label>
                      <select
                        value={postState}
                        onChange={(e) => {
                          setPostState(e.target.value)
                          const dList = STATE_DISTRICTS[e.target.value]
                          if (dList && dList[1]) setPostDistrict(dList[1])
                        }}
                        className="w-full h-11 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs sm:text-sm font-medium outline-none"
                      >
                        {INDIAN_STATES.filter((s) => s !== "All States").map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        {lang === "hi" ? "जिला *" : "District *"}
                      </Label>
                      {STATE_DISTRICTS[postState] ? (
                        <select
                          value={postDistrict}
                          onChange={(e) => setPostDistrict(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs sm:text-sm font-medium outline-none"
                        >
                          {STATE_DISTRICTS[postState].filter((d) => d !== "All Districts").map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          value={postDistrict}
                          onChange={(e) => setPostDistrict(e.target.value)}
                          required
                          className="h-11 rounded-xl"
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      {lang === "hi" ? "गाँव / खेत का पता" : "Village / Farm Address"}
                    </Label>
                    <Input
                      placeholder={lang === "hi" ? "जैसे: नहर के पास, खेत नंबर 4" : "e.g. Near Canal Gate, Plot 4"}
                      value={postVillage}
                      onChange={(e) => setPostVillage(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>

                {/* 3. Wage and Timing */}
                <div className="space-y-4 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    3. {lang === "hi" ? "दिहाड़ी व कार्य अवधि" : "Wage & Schedule"}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        {lang === "hi" ? "दैनिक मजदूरी (₹/दिन) *" : "Daily Wage (₹/day) *"}
                      </Label>
                      <Input
                        type="number"
                        min="200"
                        max="5000"
                        value={postWage}
                        onChange={(e) => setPostWage(e.target.value)}
                        required
                        className="h-11 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        {lang === "hi" ? "आरंभ तिथि *" : "Start Date *"}
                      </Label>
                      <Input
                        type="date"
                        value={postStartDate}
                        onChange={(e) => setPostStartDate(e.target.value)}
                        required
                        className="h-11 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        {lang === "hi" ? "अवधि (दिन) *" : "Duration (Days) *"}
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max="180"
                        value={postDurationDays}
                        onChange={(e) => setPostDurationDays(e.target.value)}
                        required
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      {lang === "hi" ? "कार्य समय" : "Working Hours"}
                    </Label>
                    <Input
                      placeholder="e.g. 8:00 AM - 5:00 PM (1 hr lunch)"
                      value={postWorkingHours}
                      onChange={(e) => setPostWorkingHours(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>

                  {/* Perks toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={postFoodProvided}
                        onChange={(e) => setPostFoodProvided(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
                      />
                      <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                        {lang === "hi" ? "खाना उपलब्ध" : "Food Provided"}
                      </span>
                    </label>

                    <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={postAccommodation}
                        onChange={(e) => setPostAccommodation(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
                      />
                      <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                        {lang === "hi" ? "रहने की सुविधा" : "Stay Available"}
                      </span>
                    </label>

                    <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={postTransportProvided}
                        onChange={(e) => setPostTransportProvided(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
                      />
                      <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                        {lang === "hi" ? "वाहन सुविधा" : "Transport Provided"}
                      </span>
                    </label>
                  </div>
                </div>

                {/* 4. Employer Contact & Description */}
                <div className="space-y-4 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    4. {lang === "hi" ? "नियोक्ता संपर्क विवरण" : "Farmer / Employer Contact"}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        {lang === "hi" ? "किसान / नियोक्ता का नाम *" : "Farmer / Employer Name *"}
                      </Label>
                      <Input
                        placeholder={lang === "hi" ? "आपका नाम..." : "Your name..."}
                        value={postEmployerName}
                        onChange={(e) => setPostEmployerName(e.target.value)}
                        required
                        className="h-11 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        {lang === "hi" ? "मोबाइल नंबर *" : "Mobile Number *"}
                      </Label>
                      <Input
                        type="tel"
                        placeholder="10 digit mobile number"
                        value={postMobile}
                        onChange={(e) => setPostMobile(e.target.value)}
                        required
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      {lang === "hi" ? "कार्य का विवरण" : "Job Description & Instructions"}
                    </Label>
                    <textarea
                      rows={3}
                      placeholder={lang === "hi" ? "काम से संबंधित आवश्यक जानकारी यहाँ लिखें..." : "Describe required field tasks, equipment provided, and payment details..."}
                      value={postDescription}
                      onChange={(e) => setPostDescription(e.target.value)}
                      className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    {lang === "hi" ? "ड्राफ्ट सेव करें" : "Save Draft"}
                  </button>

                  <button
                    type="submit"
                    disabled={postingLoading}
                    className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white text-xs sm:text-sm font-extrabold shadow-sm transition-all cursor-pointer flex items-center gap-2"
                  >
                    {postingLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{lang === "hi" ? "प्रकाशित हो रहा है..." : "Publishing..."}</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>{lang === "hi" ? "काम प्रकाशित करें" : "Publish Job"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* WORKER DETAIL MODAL                                                       */}
        {/* ========================================================================= */}
        {selectedWorkerForDetail && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setSelectedWorkerForDetail(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-black text-lg flex items-center justify-center shrink-0">
                  {selectedWorkerForDetail.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white">
                    {selectedWorkerForDetail.name}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {getNaturalWorkerType(selectedWorkerForDetail)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-950 text-xs">
                <div>
                  <span className="text-stone-500 block">{lang === "hi" ? "स्थान" : "Location"}</span>
                  <strong className="text-stone-900 dark:text-white font-semibold">
                    {selectedWorkerForDetail.district}, {selectedWorkerForDetail.state}
                  </strong>
                </div>
                <div>
                  <span className="text-stone-500 block">{lang === "hi" ? "अपेक्षित दिहाड़ी" : "Expected Wage"}</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold text-sm">
                    ₹{selectedWorkerForDetail.wage_expectation} / {lang === "hi" ? "दिन" : "day"}
                  </strong>
                </div>
              </div>

              {selectedWorkerForDetail.bio_or_experience && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {lang === "hi" ? "कार्य अनुभव व परिचय" : "Experience & Profile"}
                  </span>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    {selectedWorkerForDetail.bio_or_experience}
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {lang === "hi" ? "कुशलताएं (Skills)" : "Skills & Specialities"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedWorkerForDetail.skills.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
                      {s.skill_name} ({s.experience_years} yrs)
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100 dark:border-stone-800">
                <Button
                  onClick={() => {
                    setContactModalWorker(selectedWorkerForDetail)
                    setSelectedWorkerForDetail(null)
                  }}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs py-2.5"
                >
                  {lang === "hi" ? "कार्यकर्ता से संपर्क करें" : "Contact Worker"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* WORKER CONTACT UNLOCK MODAL                                               */}
        {/* ========================================================================= */}
        {contactModalWorker && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setContactModalWorker(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white">
                  {lang === "hi" ? "कार्यकर्ता से सीधा संपर्क" : "Contact Agricultural Worker"}
                </h3>
                <p className="text-xs text-stone-500">
                  {contactModalWorker.name} ({getNaturalWorkerType(contactModalWorker)})
                </p>
              </div>

              {contactSuccessMsg ? (
                <div className="space-y-4 py-2">
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 text-xs font-semibold leading-relaxed">
                    {contactSuccessMsg}
                  </div>

                  {contactModalWorker.unmasked_phone && (
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 text-center space-y-2">
                      <span className="text-xs text-stone-500">{lang === "hi" ? "मोबाइल नंबर:" : "Mobile Number:"}</span>
                      <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                        +91 {contactModalWorker.unmasked_phone}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${contactModalWorker.unmasked_phone || "9483011220"}`}
                      className="py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>{lang === "hi" ? "सीधा कॉल" : "Direct Call"}</span>
                    </a>
                    <a
                      href={`https://wa.me/91${(contactModalWorker.unmasked_phone || "9483011220").replace(/\D/g, "")}?text=Namaste%20${encodeURIComponent(contactModalWorker.name)},%20I%20am%20contacting%20you%20via%20KisaanBuddy%20for%20farm%20work.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      {lang === "hi" ? "आपका नाम *" : "Your Name *"}
                    </Label>
                    <Input
                      value={requesterName}
                      onChange={(e) => setRequesterName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      {lang === "hi" ? "आपका मोबाइल नंबर *" : "Your Phone Number *"}
                    </Label>
                    <Input
                      type="tel"
                      value={requesterPhone}
                      onChange={(e) => setRequesterPhone(e.target.value)}
                      placeholder="10 digit number"
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      {lang === "hi" ? "खेत का स्थान" : "Farm Location"}
                    </Label>
                    <Input
                      value={requesterFarmLoc}
                      onChange={(e) => setRequesterFarmLoc(e.target.value)}
                      placeholder="e.g. Navalgund, Dharwad"
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendContactRequest}
                    className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer mt-2"
                  >
                    {lang === "hi" ? "संपर्क नंबर अनलॉक करें" : "Unlock Contact & Connect"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* JOB DETAIL MODAL                                                          */}
        {/* ========================================================================= */}
        {selectedJobForDetail && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setSelectedJobForDetail(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200">
                  {selectedJobForDetail.source_platform || "KisaanBuddy Job"}
                </span>
                <h3 className="text-lg font-black text-stone-900 dark:text-white pt-1">
                  {selectedJobForDetail.job_title}
                </h3>
                <p className="text-xs text-stone-500">
                  {selectedJobForDetail.employer_name || selectedJobForDetail.contact_name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-950 text-xs">
                <div>
                  <span className="text-stone-500 block">{lang === "hi" ? "स्थान" : "Location"}</span>
                  <strong className="text-stone-900 dark:text-white font-semibold">
                    {selectedJobForDetail.district}, {selectedJobForDetail.state}
                  </strong>
                </div>
                <div>
                  <span className="text-stone-500 block">{lang === "hi" ? "दिहाड़ी" : "Daily Wage"}</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 font-black text-sm">
                    ₹{selectedJobForDetail.wage_amount} / {lang === "hi" ? "दिन" : "day"}
                  </strong>
                </div>
              </div>

              {selectedJobForDetail.work_type_detail && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {lang === "hi" ? "कार्य का विवरण" : "Work Details"}
                  </span>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    {selectedJobForDetail.work_type_detail}
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100 dark:border-stone-800">
                {selectedJobForDetail.source_type === "external" && selectedJobForDetail.source_url ? (
                  <a
                    href={selectedJobForDetail.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
                  >
                    <span>{lang === "hi" ? "मूल पोर्टल पर देखें" : "View on Original Portal"}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <a
                    href={`tel:${selectedJobForDetail.unmasked_contact_phone || selectedJobForDetail.masked_contact_phone}`}
                    className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{lang === "hi" ? "नियोक्ता को कॉल करें" : "Call Employer"}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
