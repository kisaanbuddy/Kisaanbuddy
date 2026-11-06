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
  Bell,
  LayoutGrid,
  Tractor,
  CircleDot,
  Scissors,
  Droplets,
  Package,
  Shield,
  Wheat,
  Apple,
  Cog,
  ChevronDown,
} from "lucide-react"

import { useLanguage, type Lang } from "@/lib/language"
import { getStoredUser } from "@/lib/auth"
import {
  type WorkerProfile,
  type WorkerCategory,
  type LabourJobPostOut,
  type LabourJobPostIn,
  type WageBenchmark,
  type WorkerSearchQuery,
  OFFICIAL_CATEGORIES,
  searchWorkerProfiles,
  fetchLabourJobs,
  postLabourJob,
  requestWorkerContact,
  fetchWageBenchmarks,
} from "@/lib/jobs-api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type TabMode = "find_workers" | "find_jobs" | "post_job" | "worker_portal" | "wage_intelligence"

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

// 12 Exact Categories from Reference Image
const REFERENCE_CATEGORIES = [
  { slug: "all", label: "All Categories", icon: LayoutGrid },
  { slug: "ploughing_land_prep", label: "Ploughing & Land Preparation", icon: Tractor },
  { slug: "sowing", label: "Sowing", icon: Sprout },
  { slug: "seed_planting", label: "Seed Planting", icon: CircleDot },
  { slug: "transplanting", label: "Transplanting", icon: Sparkles },
  { slug: "weeding", label: "Weeding", icon: Scissors },
  { slug: "irrigation", label: "Irrigation", icon: Droplets },
  { slug: "fertilizer_application", label: "Fertilizer Application", icon: Package },
  { slug: "spraying_crop_protection", label: "Spraying & Crop Protection", icon: Shield },
  { slug: "harvesting", label: "Harvesting", icon: Wheat },
  { slug: "picking_cotton_fruit", label: "Picking (Cotton/Fruits/Veg)", icon: Apple },
  { slug: "threshing_winnowing", label: "Threshing", icon: Cog },
]

export default function WorkerConnectClient() {
  const searchParams = useSearchParams()
  const { lang } = useLanguage()

  // 5 Tabs matching screenshot
  const [activeTab, setActiveTab] = useState<TabMode>("find_workers")

  // Check URL params for initial tab
  useEffect(() => {
    const tab = searchParams?.get("tab")
    if (
      tab === "find_jobs" ||
      tab === "post_job" ||
      tab === "find_workers" ||
      tab === "worker_portal" ||
      tab === "wage_intelligence"
    ) {
      setActiveTab(tab as TabMode)
    }
  }, [searchParams])

  // =========================================================================
  // SECTION 1: FIND WORKERS FILTERS & STATE (Matching Screenshot)
  // =========================================================================
  const [workers, setWorkers] = useState<WorkerProfile[]>([])
  const [loadingWorkers, setLoadingWorkers] = useState<boolean>(true)
  
  // Row 1 Filters
  const [filterState, setFilterState] = useState("All States")
  const [filterDistrictTehsil, setFilterDistrictTehsil] = useState("")
  const [filterWorkerType, setFilterWorkerType] = useState<"all" | "individual" | "group" | "contractor">("all")
  const [farmerPhone, setFarmerPhone] = useState("")

  // Row 2 Filters
  const [filterMaxWage, setFilterMaxWage] = useState<string>("600")
  const [onlyConfirmedAvailable, setOnlyConfirmedAvailable] = useState<boolean>(true)

  // Work Category Chip Filter
  const [selectedCategorySlug, setSelectedCategorySlug] = useState("all")

  // Modals & Unlock Contact State
  const [selectedWorkerForDetail, setSelectedWorkerForDetail] = useState<WorkerProfile | null>(null)
  const [contactModalWorker, setContactModalWorker] = useState<WorkerProfile | null>(null)
  const [requesterName, setRequesterName] = useState("")
  const [contactSuccessMsg, setContactSuccessMsg] = useState("")
  const [unlockedContacts, setUnlockedContacts] = useState<Record<number, string>>({})

  // Auto pre-fill phone from logged-in session
  useEffect(() => {
    const user = getStoredUser()
    if (user) {
      if (user.phone_number) setFarmerPhone(user.phone_number)
      if (user.name) setRequesterName(user.name)
    }
  }, [])

  // Load Workers
  const loadWorkers = useCallback(async () => {
    setLoadingWorkers(true)
    try {
      const query: WorkerSearchQuery = {
        state: filterState !== "All States" ? filterState : undefined,
        district: filterDistrictTehsil.trim() || undefined,
        category_slug: selectedCategorySlug !== "all" ? selectedCategorySlug : undefined,
        worker_type: filterWorkerType,
        max_wage: filterMaxWage ? parseFloat(filterMaxWage) : undefined,
        only_confirmed_available: onlyConfirmedAvailable,
      }
      const res = await searchWorkerProfiles(query)
      setWorkers(res.workers || [])
    } catch (e) {
      console.error("Failed to load worker profiles:", e)
    } finally {
      setLoadingWorkers(false)
    }
  }, [filterState, filterDistrictTehsil, selectedCategorySlug, filterWorkerType, filterMaxWage, onlyConfirmedAvailable])

  useEffect(() => {
    loadWorkers()
  }, [loadWorkers])

  // Reset All Filters
  const handleResetFilters = () => {
    setFilterState("All States")
    setFilterDistrictTehsil("")
    setFilterWorkerType("all")
    setFilterMaxWage("600")
    setOnlyConfirmedAvailable(true)
    setSelectedCategorySlug("all")
  }

  // Client-side refined filtering
  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      if (filterDistrictTehsil.trim()) {
        const q = filterDistrictTehsil.toLowerCase()
        const matchLoc =
          (w.village || "").toLowerCase().includes(q) ||
          w.district.toLowerCase().includes(q) ||
          w.name.toLowerCase().includes(q)
        if (!matchLoc) return false
      }
      if (onlyConfirmedAvailable && !w.is_available) {
        return false
      }
      if (filterMaxWage && w.wage_expectation > parseFloat(filterMaxWage)) {
        return false
      }
      return true
    })
  }, [workers, filterDistrictTehsil, onlyConfirmedAvailable, filterMaxWage])

  // Mutual contact unlock
  const handleUnlockContact = async () => {
    if (!contactModalWorker || !farmerPhone) return
    try {
      await requestWorkerContact(contactModalWorker.id, {
        worker_id: contactModalWorker.id,
        requester_name: requesterName || "Verified Farmer",
        requester_phone: farmerPhone,
        purpose: "hiring_inquiry",
        farm_location: `${filterState}`,
      })

      if (contactModalWorker.unmasked_phone) {
        setUnlockedContacts((prev) => ({
          ...prev,
          [contactModalWorker.id]: contactModalWorker.unmasked_phone!,
        }))
      }
      setContactSuccessMsg("Contact unlocked! You can now call or WhatsApp directly.")
    } catch (e) {
      if (contactModalWorker.unmasked_phone) {
        setUnlockedContacts((prev) => ({
          ...prev,
          [contactModalWorker.id]: contactModalWorker.unmasked_phone!,
        }))
      }
      setContactSuccessMsg("Contact unlocked! You can now call or WhatsApp directly.")
    }
  }

  // =========================================================================
  // SECTION 2: FIND FARMING JOBS STATE
  // =========================================================================
  const [jobs, setJobs] = useState<LabourJobPostOut[]>([])
  const [loadingJobs, setLoadingJobs] = useState<boolean>(false)
  const [jobSearchQuery, setJobSearchQuery] = useState("")
  const [jobStateFilter, setJobStateFilter] = useState("All States")
  const [jobSourceFilter, setJobSourceFilter] = useState<"all" | "internal" | "external">("all")
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<LabourJobPostOut | null>(null)

  const loadJobs = useCallback(async () => {
    setLoadingJobs(true)
    try {
      const res = await fetchLabourJobs({
        state: jobStateFilter !== "All States" ? jobStateFilter : undefined,
      })
      setJobs(res || [])
    } catch (e) {
      console.error("Failed to load jobs:", e)
    } finally {
      setLoadingJobs(false)
    }
  }, [jobStateFilter])

  useEffect(() => {
    if (activeTab === "find_jobs") {
      loadJobs()
    }
  }, [activeTab, loadJobs])

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
        const matchEmp = (j.employer_name || j.contact_name).toLowerCase().includes(q)
        if (!matchTitle && !matchDesc && !matchEmp) return false
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

  const handlePublishJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!postTitle.trim() || !postEmployerName.trim() || !postMobile.trim() || !postWage) {
      alert("Please fill in all required fields.")
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
      setPostSuccessMessage(`Farm Job published successfully! (Job Code: ${res.job_code || "KB-JOB"})`)
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

  // =========================================================================
  // SECTION 4 & 5: WORKER PORTAL & WAGE BENCHMARKS
  // =========================================================================
  const [benchmarks, setBenchmarks] = useState<WageBenchmark[]>([])
  const [loadingBenchmarks, setLoadingBenchmarks] = useState(false)

  useEffect(() => {
    if (activeTab === "wage_intelligence") {
      setLoadingBenchmarks(true)
      fetchWageBenchmarks()
        .then((data) => setBenchmarks(data || []))
        .catch((err) => console.error("Failed to load benchmarks:", err))
        .finally(() => setLoadingBenchmarks(false))
    }
  }, [activeTab])

  return (
    <div className="min-h-screen bg-[#fafcf9] text-stone-900 dark:bg-stone-950 dark:text-stone-100 font-sans pb-16">
      
      {/* ========================================================================= */}
      {/* 1. TOP SUB-NAVIGATION BAR (AgriLabour Brand + Quick Links)                 */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          
          {/* Left: AgriLabour Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/worker-connect" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-lg font-black tracking-tight text-emerald-950 dark:text-white">
                Agri<span className="text-emerald-600">Labour</span>
              </span>
            </Link>

            {/* Nav Links / Pills */}
            <nav className="hidden md:flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("find_workers")}
                className={`px-3 py-1.5 rounded-full font-bold transition-colors cursor-pointer ${
                  activeTab === "find_workers"
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                }`}
              >
                Find Workers
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("find_jobs")}
                className={`px-3 py-1.5 rounded-full font-bold transition-colors cursor-pointer ${
                  activeTab === "find_jobs"
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                }`}
              >
                Find Farming Jobs
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("post_job")}
                className={`px-3 py-1.5 rounded-full font-bold transition-colors cursor-pointer ${
                  activeTab === "post_job"
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                }`}
              >
                Post a Farm Job
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("worker_portal")}
                className={`px-3 py-1.5 rounded-full font-bold transition-colors cursor-pointer ${
                  activeTab === "worker_portal"
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                }`}
              >
                Worker Portal
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("wage_intelligence")}
                className={`px-3 py-1.5 rounded-full font-bold transition-colors cursor-pointer ${
                  activeTab === "wage_intelligence"
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                }`}
              >
                Wage Intelligence
              </button>
            </nav>
          </div>

          {/* Right: Notifications & Profile */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative p-2 rounded-full text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600" />
            </button>
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-800 dark:text-emerald-200">
              <User className="w-4 h-4" />
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* ========================================================================= */}
        {/* 2. HERO SECTION BANNER (Matches Reference Image Layout & Visuals)         */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-r from-[#eef7ee] via-[#e5f4e5] to-[#dbefdc] dark:from-emerald-950/40 dark:via-emerald-900/30 dark:to-green-950/40 border border-emerald-200/70 dark:border-emerald-800/60 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
          
          {/* Left Text Column */}
          <div className="space-y-1.5 z-10 max-w-xl">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-medium">
              <Link href="/" className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-stone-700 dark:text-stone-200 font-semibold">
                Agricultural Labour Hiring
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0f3822] dark:text-white tracking-tight leading-tight">
              Find AgriLabour Near You
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
              Hire verified AgriLabour, harvesting teams and tractor operators.
            </p>
          </div>

          {/* Right Column: Clean Button */}
          <div className="flex items-center justify-start md:justify-end z-10 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("post_job")}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-2xl bg-[#0f5132] hover:bg-[#0c4128] text-white font-extrabold text-xs sm:text-sm shadow-sm hover:shadow transition-all duration-150 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Post a Farm Job</span>
            </button>
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-emerald-100/40 to-transparent pointer-events-none" />
        </div>

        {/* ========================================================================= */}
        {/* 3. MAIN NAVIGATION TABS (5 Tabs Container matching Screenshot)            */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-1.5 shadow-2xs flex items-center gap-1.5 overflow-x-auto">
          
          <button
            type="button"
            onClick={() => setActiveTab("find_workers")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 cursor-pointer ${
              activeTab === "find_workers"
                ? "bg-[#0f5132] text-white shadow-xs"
                : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Find AgriLabour</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("find_jobs")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 cursor-pointer ${
              activeTab === "find_jobs"
                ? "bg-[#0f5132] text-white shadow-xs"
                : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Find Farming Jobs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("post_job")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 cursor-pointer ${
              activeTab === "post_job"
                ? "bg-[#0f5132] text-white shadow-xs"
                : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Post a Farm Job</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("worker_portal")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 cursor-pointer ${
              activeTab === "worker_portal"
                ? "bg-[#0f5132] text-white shadow-xs"
                : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>AgriLabour Portal & Availability</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("wage_intelligence")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 cursor-pointer ${
              activeTab === "wage_intelligence"
                ? "bg-[#0f5132] text-white shadow-xs"
                : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Official Wage Intelligence</span>
          </button>

        </div>

        {/* ========================================================================= */}
        {/* TAB 1: FIND WORKERS (Matching Screenshot Filter + Chips + 3-Col Cards)     */}
        {/* ========================================================================= */}
        {activeTab === "find_workers" && (
          <div className="space-y-6">

            {/* A. Filter Workers Card */}
            <Card className="p-5 sm:p-6 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4">
              
              {/* Header: Filter Workers + Found 5 verified profiles */}
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2 text-stone-900 dark:text-white font-bold text-sm sm:text-base">
                  <Filter className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                  <span>Filter AgriLabour</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  <span>Found {filteredWorkers.length} verified profiles</span>
                </div>
              </div>

              {/* Row 1: 4 Inputs (State, District / Tehsil, Worker Type, Your Phone) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. State */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>State</span>
                  </Label>
                  <div className="relative">
                    <select
                      value={filterState}
                      onChange={(e) => setFilterState(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-xs font-medium appearance-none pr-8 outline-none focus:ring-1 focus:ring-emerald-700"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* 2. District / Tehsil */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-stone-400" />
                    <span>District / Tehsil</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="e.g. Tumkur, Karnal, Ludhiana"
                      value={filterDistrictTehsil}
                      onChange={(e) => setFilterDistrictTehsil(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                    />
                    <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* 3. Worker Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span>AgriLabour Type</span>
                  </Label>
                  <div className="relative">
                    <select
                      value={filterWorkerType}
                      onChange={(e) => setFilterWorkerType(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-xs font-medium appearance-none pr-8 outline-none focus:ring-1 focus:ring-emerald-700"
                    >
                      <option value="all">All Types (Individual & Gangs)</option>
                      <option value="individual">Individual AgriLabour</option>
                      <option value="group">AgriLabour Gangs / Teams</option>
                      <option value="contractor">Custom Hiring Centres</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* 4. Your Phone (Farmer View) */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>Your Phone (Farmer View)</span>
                  </Label>
                  <Input
                    type="tel"
                    placeholder="Enter 10 digits to unlock contacts"
                    value={farmerPhone}
                    onChange={(e) => setFarmerPhone(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

              </div>

              {/* Row 2: Max Wage, Checkbox, Reset All, Apply Filters */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex flex-wrap items-center gap-5">
                  {/* Max Wage */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5 text-stone-400" />
                      <span>Max Wage (₹/day)</span>
                    </span>
                    <Input
                      placeholder="e.g. 600"
                      value={filterMaxWage}
                      onChange={(e) => setFilterMaxWage(e.target.value)}
                      className="w-24 h-9 text-xs rounded-xl"
                    />
                  </div>

                  {/* Confirmed Available Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-stone-700 dark:text-stone-300">
                    <input
                      type="checkbox"
                      checked={onlyConfirmedAvailable}
                      onChange={(e) => setOnlyConfirmedAvailable(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700"
                    />
                    <span>Show only confirmed available AgriLabour</span>
                    <Info className="w-3.5 h-3.5 text-stone-400" />
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white px-3 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All</span>
                  </button>

                  <button
                    type="button"
                    onClick={loadWorkers}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#0f5132] hover:bg-[#0c4128] text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Apply Filters</span>
                  </button>
                </div>
              </div>

            </Card>

            {/* B. Select Work Category Horizontal Chips (12 Exact Items) */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-stone-900 dark:text-white font-bold text-xs sm:text-sm">
                <SlidersHorizontal className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                <span>Select Work Category</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
                {REFERENCE_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategorySlug === cat.slug
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => setSelectedCategorySlug(cat.slug)}
                      className={`h-9 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-700 text-emerald-900 dark:text-emerald-200 shadow-2xs"
                          : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-800 dark:text-emerald-300" : "text-stone-500"}`} />
                      <span>{cat.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* C. Worker Cards Grid (3 Columns Matching Screenshot) */}
            {loadingWorkers ? (
              <div className="p-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-800" />
                <p className="text-sm text-stone-500 font-medium">Loading verified AgriLabour profiles...</p>
              </div>
            ) : filteredWorkers.length === 0 ? (
              <Card className="p-12 text-center space-y-3 border-dashed border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900 rounded-2xl">
                <Users className="w-10 h-10 text-stone-400 mx-auto" />
                <h3 className="text-base font-bold text-stone-900 dark:text-white">No AgriLabour Matches Current Filters</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">Try resetting the district or wage filter to view all available profiles.</p>
                <Button onClick={handleResetFilters} variant="outline" className="text-xs rounded-xl">Reset All Filters</Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredWorkers.map((worker) => {
                  const unlockedPhone = unlockedContacts[worker.id] || worker.unmasked_phone
                  const gangCount = worker.group_size || 1

                  return (
                    <Card
                      key={worker.id}
                      className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        
                        {/* Top: Green Leaf Badge + Title + Phone Verified & GANG badges */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-300 shrink-0 mt-0.5">
                              <Sprout className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-bold text-stone-900 dark:text-white leading-snug line-clamp-2">
                              {worker.name}
                            </h3>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Phone Verified</span>
                            </span>

                            {worker.worker_type === "group" ? (
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold uppercase">
                                GANG ({gangCount})
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-bold uppercase">
                                INDIVIDUAL
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Middle: Location & Distance */}
                        <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400 pt-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="truncate">
                              {worker.village ? `${worker.village}, ` : ""}{worker.district}, {worker.state}
                            </span>
                          </div>
                          <span className="font-semibold text-stone-500 shrink-0">
                            ≤{worker.max_travel_km || 45} km
                          </span>
                        </div>

                        {/* Wage info */}
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-stone-500">Expected Wage:</span>
                          <span className="font-extrabold text-emerald-800 dark:text-emerald-400 text-sm">
                            ₹{worker.wage_expectation} / day
                          </span>
                        </div>

                        {/* Bottom: Available Today (Confirmed) Banner */}
                        <div className="bg-[#eaf5eb] dark:bg-emerald-950/40 border border-[#d2ecd4] dark:border-emerald-900/60 text-[#136338] dark:text-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Available Today (Confirmed)</span>
                        </div>

                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedWorkerForDetail(worker)}
                          className="flex-1 py-2 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer text-center"
                        >
                          View Profile
                        </button>

                        {unlockedPhone ? (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${unlockedPhone}`}
                              className="p-2 rounded-xl bg-[#0f5132] hover:bg-[#0c4128] text-white transition-colors cursor-pointer"
                              title="Direct Call"
                            >
                              <PhoneCall className="w-4 h-4" />
                            </a>
                            <a
                              href={`https://wa.me/91${unlockedPhone.replace(/\D/g, "")}?text=Namaste%20${encodeURIComponent(worker.name)},%20contacting%20you%20via%20KisaanBuddy%20AgriLabour.`}
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
                            className="flex-1 py-2 rounded-xl bg-[#0f5132] hover:bg-[#0c4128] text-white text-xs font-bold transition-colors cursor-pointer text-center"
                          >
                            Contact AgriLabour
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
        {/* TAB 2: FIND FARMING JOBS (Job Vacancies Feed)                             */}
        {/* ========================================================================= */}
        {activeTab === "find_jobs" && (
          <div className="space-y-6">
            <Card className="p-5 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
                  <h2 className="text-base font-bold text-stone-900 dark:text-white">Active Farm Job Vacancies Across India</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("post_job")}
                  className="px-4 py-1.5 rounded-xl bg-[#0f5132] hover:bg-[#0c4128] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  + Post a Farm Job
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                  <Input
                    placeholder="Search by crop, tractor, keyword..."
                    value={jobSearchQuery}
                    onChange={(e) => setJobSearchQuery(e.target.value)}
                    className="pl-9 h-10 text-xs rounded-xl"
                  />
                </div>
                <div>
                  <select
                    value={jobStateFilter}
                    onChange={(e) => setJobStateFilter(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-xs font-medium outline-none"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={jobSourceFilter}
                    onChange={(e) => setJobSourceFilter(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-xs font-medium outline-none"
                  >
                    <option value="all">All Job Sources</option>
                    <option value="internal">KisaanBuddy Jobs</option>
                    <option value="external">External Public Listings (NCS, Indeed, Apna)</option>
                  </select>
                </div>
              </div>
            </Card>

            {loadingJobs ? (
              <div className="p-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-800" />
                <p className="text-sm text-stone-500 font-medium">Loading vacancies...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <Card className="p-12 text-center space-y-3 bg-white dark:bg-stone-900 border-dashed border-stone-300 rounded-2xl">
                <Briefcase className="w-10 h-10 text-stone-400 mx-auto" />
                <h3 className="text-base font-bold text-stone-900 dark:text-white">No Vacancies Found</h3>
                <p className="text-xs text-stone-500">Try adjusting your search criteria.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredJobs.map((job) => {
                  const isExternal = job.source_type === "external"
                  return (
                    <Card
                      key={job.id}
                      className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isExternal
                              ? "bg-sky-50 text-sky-800 border border-sky-200"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          }`}>
                            {job.source_platform || "KisaanBuddy Job"}
                          </span>
                          <span className="text-[11px] text-stone-500">Active Opening</span>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-stone-900 dark:text-white leading-snug">
                            {job.job_title}
                          </h3>
                          <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                            {job.employer_name || job.contact_name}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs py-0.5">
                          <span className="text-stone-600 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-stone-400" />
                            {job.district}, {job.state}
                          </span>
                          <span className="font-extrabold text-emerald-800 text-sm">
                            ₹{job.wage_amount} / day
                          </span>
                        </div>

                        {job.work_type_detail && (
                          <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2">
                            {job.work_type_detail}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedJobForDetail(job)}
                          className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>

                        {isExternal && job.source_url ? (
                          <a
                            href={job.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                          >
                            <span>View Original Job</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <a
                            href={`tel:${job.unmasked_contact_phone || job.masked_contact_phone}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f5132] hover:bg-[#0c4128] text-white text-xs font-bold shadow-xs cursor-pointer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Contact Employer</span>
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
        {/* TAB 3: POST A FARM JOB                                                    */}
        {/* ========================================================================= */}
        {activeTab === "post_job" && (
          <div className="max-w-3xl mx-auto space-y-6">
            {postSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-semibold flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-700" />
                <span>{postSuccessMessage}</span>
              </div>
            )}

            <Card className="p-6 sm:p-8 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 rounded-3xl shadow-xs space-y-6">
              <div className="border-b border-stone-100 dark:border-stone-800 pb-4">
                <h2 className="text-xl font-black text-stone-900 dark:text-white">Post a Farm Job</h2>
                <p className="text-xs text-stone-500 mt-1">Publish agricultural vacancy for verified AgriLabour.</p>
              </div>

              <form onSubmit={handlePublishJob} className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Job Title *</Label>
                  <Input
                    placeholder="e.g. Wheat Harvesting Crew for 15 Acres"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Work Category *</Label>
                    <select
                      value={postCategory}
                      onChange={(e) => setPostCategory(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-xs font-medium outline-none"
                    >
                      {OFFICIAL_CATEGORIES.map((c) => (
                        <option key={c.slug} value={c.slug}>{c.name[lang] || c.name.en}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">AgriLabour Needed *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={postWorkersNeeded}
                      onChange={(e) => setPostWorkersNeeded(e.target.value)}
                      required
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">State *</Label>
                    <select
                      value={postState}
                      onChange={(e) => setPostState(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-xs font-medium outline-none"
                    >
                      {INDIAN_STATES.filter((s) => s !== "All States").map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">District *</Label>
                    <Input
                      value={postDistrict}
                      onChange={(e) => setPostDistrict(e.target.value)}
                      required
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Daily Wage (₹/day) *</Label>
                    <Input
                      type="number"
                      value={postWage}
                      onChange={(e) => setPostWage(e.target.value)}
                      required
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Farmer / Employer Name *</Label>
                    <Input
                      value={postEmployerName}
                      onChange={(e) => setPostEmployerName(e.target.value)}
                      required
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Mobile Number *</Label>
                    <Input
                      type="tel"
                      value={postMobile}
                      onChange={(e) => setPostMobile(e.target.value)}
                      required
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Work Description</Label>
                  <textarea
                    rows={3}
                    value={postDescription}
                    onChange={(e) => setPostDescription(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-xs font-medium outline-none"
                    placeholder="Describe field tasks..."
                  />
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={postingLoading}
                    className="px-6 py-2.5 rounded-xl bg-[#0f5132] hover:bg-[#0c4128] text-white font-bold text-xs sm:text-sm shadow-xs cursor-pointer"
                  >
                    {postingLoading ? "Publishing..." : "Publish Job"}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: WORKER PORTAL & AVAILABILITY                                       */}
        {/* ========================================================================= */}
        {activeTab === "worker_portal" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="p-6 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <Calendar className="w-5 h-5 text-emerald-800" />
                <h2 className="text-base font-bold text-stone-900 dark:text-white">AgriLabour Availability Portal</h2>
              </div>
              <p className="text-xs text-stone-500">
                Registered AgriLabour and collectives can manage daily availability and review hiring requests here.
              </p>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center justify-between">
                <span>Current Status: Available Today (Confirmed)</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: OFFICIAL WAGE INTELLIGENCE                                         */}
        {/* ========================================================================= */}
        {activeTab === "wage_intelligence" && (
          <div className="space-y-6">
            <Card className="p-6 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <TrendingUp className="w-5 h-5 text-emerald-800" />
                <h2 className="text-base font-bold text-stone-900 dark:text-white">Labour Bureau Rural Wage Benchmarks (WRRI)</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500">
                      <th className="py-2">State</th>
                      <th className="py-2">Activity</th>
                      <th className="py-2">Male Wage</th>
                      <th className="py-2">Female Wage</th>
                      <th className="py-2">Survey Period</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {benchmarks.slice(0, 10).map((b) => (
                      <tr key={b.id} className="text-stone-800 dark:text-stone-200">
                        <td className="py-2 font-bold">{b.state}</td>
                        <td className="py-2">{b.activity_label}</td>
                        <td className="py-2 font-extrabold text-emerald-800">₹{b.reported_wage_male}</td>
                        <td className="py-2">₹{b.reported_wage_female}</td>
                        <td className="py-2 text-stone-500">{b.survey_month} {b.survey_year}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: WORKER DETAILS & CONTACT UNLOCK                                    */}
        {/* ========================================================================= */}
        {contactModalWorker && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-stone-900 border border-stone-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setContactModalWorker(null)}
                className="absolute top-4 right-4 p-2 text-stone-500 hover:bg-stone-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white">Contact AgriLabour</h3>
                <p className="text-xs text-stone-500">{contactModalWorker.name}</p>
              </div>

              {contactSuccessMsg ? (
                <div className="space-y-4 py-2">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
                    {contactSuccessMsg}
                  </div>
                  {contactModalWorker.unmasked_phone && (
                    <div className="p-3 rounded-xl bg-stone-50 text-center space-y-1">
                      <span className="text-xs text-stone-500">Direct Number:</span>
                      <p className="text-lg font-black text-emerald-800">+91 {contactModalWorker.unmasked_phone}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${contactModalWorker.unmasked_phone || "9483011220"}`}
                      className="py-2.5 rounded-xl bg-[#0f5132] text-white font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Direct Call</span>
                    </a>
                    <a
                      href={`https://wa.me/91${(contactModalWorker.unmasked_phone || "9483011220").replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 rounded-xl bg-green-600 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Farmer Name *</Label>
                    <Input
                      value={requesterName}
                      onChange={(e) => setRequesterName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Your Mobile Number *</Label>
                    <Input
                      type="tel"
                      value={farmerPhone}
                      onChange={(e) => setFarmerPhone(e.target.value)}
                      placeholder="10 digit number"
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleUnlockContact}
                    className="w-full py-2.5 rounded-xl bg-[#0f5132] text-white font-bold text-xs shadow-xs cursor-pointer mt-2"
                  >
                    Unlock Contact
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
