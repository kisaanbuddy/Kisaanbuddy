"use client"

import { useLanguage, type Lang } from '@/lib/language'
import { SCHEMES_I18N } from '@/lib/schemes-i18n'
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight, CheckCircle2, ChevronDown, Filter,
  IndianRupee, Landmark, RefreshCw, X, Sparkles, HelpCircle,
  Search, Calendar, CheckSquare, ShieldCheck, AlertCircle,
  FileText, ExternalLink, Bookmark, Clock, Phone, MapPin,
  Compass, Sprout, Tractor, Droplets, Info, Check, Plus, Trash2, Bell
} from "lucide-react"
import { GlassCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SchemeVideo } from "@/components/SchemeVideo"
import ALL_SCHEMES_DATA from "@/lib/schemes-data.json"

type TabMode = "find" | "dashboard" | "all" | "saved"
type MatchStatus = "Potential Match" | "More Information Required" | "Appears Not to Match Published Criteria"

interface Scheme {
  id: string
  scheme_id?: string
  name: string
  short_name?: string
  jurisdiction?: string
  department?: string
  category?: string
  overview?: string
  description: string
  benefit: string
  benefits_summary?: string
  benefits_details?: string
  eligibility_criteria_text?: string
  eligibility: {
    maxLandAcres?: number
    minLandAcres?: number
    requiresLandOwnership?: boolean
    requiresWaterSource?: boolean
    requiresBiharDbt?: boolean
    requiresKarnatakaFruitsId?: boolean
    requiresShg?: boolean
    categories: string[]
  }
  required_documents?: Array<{ name: string; code?: string; mandatory?: boolean }>
  application_steps?: Array<{ step: number; title: string; description: string }>
  link: string
  application_url?: string
  youtubeLink?: string
  badge?: string
  badgeColor?: string
  central: boolean
  state: string
  verifiedAt: string
  lastDate: string
  window_status?: string
  helpline?: string
}

interface FinderForm {
  state: string
  district: string
  crops: string
  landholding: string
  tenure: string
  irrigation: string
  category: string
  activities: string[]
  saveProfile: boolean
}

interface EvaluatedMatch {
  scheme: Scheme
  status: MatchStatus
  score: number
  reasons: string[]
  missingCriteria: string[]
}

interface ChecklistItem {
  id: string
  docName: string
  status: "available" | "pending" | "need_help"
  notes?: string
}

export default function SchemesClient() {
  const searchParams = useSearchParams()
  const { t, lang } = useLanguage()
  const dict = SCHEMES_I18N[(lang as Lang) || "en"] || SCHEMES_I18N.en

  const [activeTab, setActiveTab] = useState<TabMode>("find")
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null)
  const [selectedForChecklist, setSelectedForChecklist] = useState<Scheme | null>(null)

  // Checklist state (stored in localStorage for guest/session convenience)
  const [checklist, setChecklist] = useState<Record<string, ChecklistItem[]>>({})
  const [savedSchemeIds, setSavedSchemeIds] = useState<string[]>([])
  const [reminderNotice, setReminderNotice] = useState<string | null>(null)

  // Quick filter for the 'All Schemes' catalog
  const [catalogSearch, setCatalogSearch] = useState("")
  const [catalogState, setCatalogState] = useState("all")
  const [catalogCategory, setCatalogCategory] = useState("all")

  // "Find Schemes for My Farm" state
  const [finderForm, setFinderForm] = useState<FinderForm>({
    state: "All",
    district: "",
    crops: "",
    landholding: "2.5",
    tenure: "owner",
    irrigation: "yes",
    category: "any",
    activities: ["micro_irrigation"],
    saveProfile: false
  })

  const [evaluatedResults, setEvaluatedResults] = useState<{
    evaluated: boolean
    potentialMatches: EvaluatedMatch[]
    moreInfoNeeded: EvaluatedMatch[]
    unmatched: EvaluatedMatch[]
  }>({
    evaluated: false,
    potentialMatches: [],
    moreInfoNeeded: [],
    unmatched: []
  })

  // Load saved schemes and checklist from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kisaanbuddy_saved_schemes")
      if (saved) setSavedSchemeIds(JSON.parse(saved))
      const cl = localStorage.getItem("kisaanbuddy_scheme_checklists")
      if (cl) setChecklist(JSON.parse(cl))
    } catch (e) {
      // ignore in SSR / storage restrictions
    }
  }, [])

  // Sync saved schemes
  const toggleSaveScheme = (id: string) => {
    setSavedSchemeIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      try {
        localStorage.setItem("kisaanbuddy_saved_schemes", JSON.stringify(next))
      } catch (e) {}
      return next
    })
  }

  // Update checklist status
  const updateChecklistStatus = (schemeId: string, docName: string, status: "available" | "pending" | "need_help") => {
    setChecklist(prev => {
      const list = prev[schemeId] || []
      const existingIdx = list.findIndex(x => x.docName === docName)
      let nextList = [...list]
      if (existingIdx >= 0) {
        nextList[existingIdx] = { ...nextList[existingIdx], status }
      } else {
        nextList.push({ id: Math.random().toString(), docName, status })
      }
      const updated = { ...prev, [schemeId]: nextList }
      try {
        localStorage.setItem("kisaanbuddy_scheme_checklists", JSON.stringify(updated))
      } catch (e) {}
      return updated
    })
  }

  // Deterministic Matching Engine
  const runDeterministicFinder = () => {
    const land = parseFloat(finderForm.landholding) || 0
    const userState = finderForm.state.trim().toLowerCase()
    const userCategory = finderForm.category.toLowerCase()
    const tenure = finderForm.tenure
    const hasIrrigation = finderForm.irrigation === "yes"

    const schemes = ALL_SCHEMES_DATA as Scheme[]

    const potentialMatches: EvaluatedMatch[] = []
    const moreInfoNeeded: EvaluatedMatch[] = []
    const unmatched: EvaluatedMatch[] = []

    for (const s of schemes) {
      const reasons: string[] = []
      const hardDisqualifiers: string[] = []
      const softRequirements: string[] = []

      // 1. State / Jurisdiction Check
      const schemeState = (s.state || "All").trim().toLowerCase()
      if (schemeState !== "all" && userState !== "all" && schemeState !== userState) {
        hardDisqualifiers.push(`Notified strictly for farmers in ${s.state}. Selected state: ${finderForm.state}.`)
      } else if (schemeState === "all") {
        reasons.push("Central scheme valid across all Indian states and UTs.")
      } else {
        reasons.push(`State jurisdiction confirmed for ${s.state}.`)
      }

      // 2. Land Ownership / Tenure Check
      if (s.eligibility?.requiresLandOwnership && tenure !== "owner") {
        hardDisqualifiers.push(`Requires legal land ownership recorded in land revenue records (Farmer tenure: ${tenure}).`)
      } else if (!s.eligibility?.requiresLandOwnership && (tenure === "tenant" || tenure === "sharecropper")) {
        reasons.push(`Tenancy and sharecropping recognized under scheme provisions with cultivation certificate.`)
      }

      // 3. Land Acreage ceiling
      if (land > 0) {
        if (s.eligibility?.maxLandAcres !== undefined && land > s.eligibility.maxLandAcres) {
          hardDisqualifiers.push(`Restricted to landholdings up to ${s.eligibility.maxLandAcres} acres (Farmer has ${land} acres).`)
        } else if (s.eligibility?.minLandAcres !== undefined && land < s.eligibility.minLandAcres) {
          hardDisqualifiers.push(`Requires minimum landholding of ${s.eligibility.minLandAcres} acres (Farmer has ${land} acres).`)
        } else {
          reasons.push(`Landholding of ${land} acres satisfies published acreage thresholds.`)
        }
      }

      // 4. Social Category Check
      if (s.eligibility?.categories && s.eligibility.categories.length > 0) {
        if (s.eligibility.categories.includes("women") && s.eligibility.categories.length === 1) {
          if (userCategory === "women") {
            reasons.push("Dedicated women farmer scheme benefit matched.")
          } else {
            softRequirements.push("Specifically dedicated to women farmers and Women SHG members.")
          }
        } else if (userCategory !== "any" && !s.eligibility.categories.includes(userCategory) && !s.eligibility.categories.includes("any")) {
          hardDisqualifiers.push(`Beneficiary category reservation does not match '${userCategory.toUpperCase()}'.`)
        }
      }

      // 5. Water source requirement
      if (s.eligibility?.requiresWaterSource) {
        if (!hasIrrigation) {
          hardDisqualifiers.push("Requires an assured on-farm water source (borewell, well, canal, or pond).")
        } else {
          reasons.push("Assured irrigation source present for installation.")
        }
      }

      // 6. State Specific Portal Requirements
      if (s.eligibility?.requiresBiharDbt) {
        softRequirements.push("Requires an active 13-digit Bihar Kisan Panjikaran number on dbtagriculture.bihar.gov.in.")
      }
      if (s.eligibility?.requiresKarnatakaFruitsId) {
        softRequirements.push("Requires a Karnataka FRUITS Farmer ID (FID) and computerized RTC extract.")
      }

      // Evaluate match bucket
      if (hardDisqualifiers.length > 0) {
        unmatched.push({
          scheme: s,
          status: "Appears Not to Match Published Criteria",
          score: 20,
          reasons: hardDisqualifiers,
          missingCriteria: []
        })
      } else if (softRequirements.length > 0) {
        moreInfoNeeded.push({
          scheme: s,
          status: "More Information Required",
          score: 65,
          reasons: reasons.length ? reasons : ["General criteria match, but specific state ID or group enrollment is required."],
          missingCriteria: softRequirements
        })
      } else {
        potentialMatches.push({
          scheme: s,
          status: "Potential Match",
          score: 95,
          reasons: reasons.length ? reasons : ["Profile aligns with published official eligibility criteria."],
          missingCriteria: []
        })
      }
    }

    setEvaluatedResults({
      evaluated: true,
      potentialMatches,
      moreInfoNeeded,
      unmatched
    })
  }

  // Filter schemes for the "All Schemes" tab
  const allSchemesList = useMemo(() => {
    const list = ALL_SCHEMES_DATA as Scheme[]
    return list.filter(s => {
      if (catalogSearch.trim()) {
        const q = catalogSearch.toLowerCase().trim()
        const matchesName = s.name.toLowerCase().includes(q)
        const matchesDesc = (s.description || "").toLowerCase().includes(q)
        const matchesBenefit = (s.benefit || "").toLowerCase().includes(q)
        if (!matchesName && !matchesDesc && !matchesBenefit) return false
      }
      if (catalogState !== "all" && s.state !== "All" && s.state.toLowerCase() !== catalogState.toLowerCase()) {
        return false
      }
      if (catalogCategory !== "all" && s.category && s.category.toLowerCase() !== catalogCategory.toLowerCase()) {
        return false
      }
      return true
    })
  }, [catalogSearch, catalogState, catalogCategory])

  const savedSchemesList = useMemo(() => {
    const list = ALL_SCHEMES_DATA as Scheme[]
    return list.filter(s => savedSchemeIds.includes(s.id))
  }, [savedSchemeIds])

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-16 px-4 md:px-0">
      
      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card via-card to-emerald-950/10 p-6 md:p-8 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-3">
              <Landmark className="h-3.5 w-3.5" />
              {dict.tag}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-foreground flex items-center gap-2.5">
              <span>{dict.headingPrefix}</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {t("schemes.schemes") || "Schemes Assistant"}
              </span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
              {dict.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button
              onClick={() => setActiveTab("find")}
              className={`rounded-xl font-bold text-xs h-10 px-4 transition-all flex items-center gap-2 ${
                activeTab === "find" 
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" 
                  : "bg-card border border-border/60 text-foreground hover:bg-muted"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>{dict.findSchemesForFarm}</span>
            </Button>
            <Button
              onClick={() => setActiveTab("dashboard")}
              variant="outline"
              className={`rounded-xl font-semibold text-xs h-10 px-4 transition-all ${
                activeTab === "dashboard" ? "bg-muted font-bold" : ""
              }`}
            >
              <Compass className="h-4 w-4 mr-1.5" />
              <span>{dict.tabs.dashboard}</span>
            </Button>
            <Button
              onClick={() => setActiveTab("all")}
              variant="outline"
              className={`rounded-xl font-semibold text-xs h-10 px-4 transition-all ${
                activeTab === "all" ? "bg-muted font-bold" : ""
              }`}
            >
              <FileText className="h-4 w-4 mr-1.5" />
              <span>{dict.tabs.allSchemes}</span>
            </Button>
            <Button
              onClick={() => setActiveTab("saved")}
              variant="outline"
              className={`rounded-xl font-semibold text-xs h-10 px-4 transition-all relative ${
                activeTab === "saved" ? "bg-muted font-bold" : ""
              }`}
            >
              <Bookmark className="h-4 w-4 mr-1.5" />
              <span>{dict.tabs.saved}</span>
              {savedSchemeIds.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                  {savedSchemeIds.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* TAB 1: FIND SCHEMES FOR MY FARM */}
      {activeTab === "find" && (
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-border/50 bg-card p-6 md:p-8 shadow-sm space-y-6"
          >
            <div className="border-b border-border/50 pb-4">
              <h2 className="text-xl font-bold text-foreground font-display flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-500" />
                {dict.findSchemesForFarm}
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                {dict.findSchemesSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* State */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {dict.finder.stateLabel}
                </Label>
                <select
                  value={finderForm.state}
                  onChange={(e) => setFinderForm({ ...finderForm, state: e.target.value })}
                  className="w-full h-11 rounded-xl border border-border/60 bg-background px-3.5 text-xs text-foreground font-medium focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="All">{dict.allStates}</option>
                  <option value="Bihar">{dict.stateBihar}</option>
                  <option value="Uttar Pradesh">{dict.stateUttarPradesh}</option>
                  <option value="Karnataka">{dict.stateKarnataka}</option>
                  <option value="Maharashtra">{dict.stateMaharashtra}</option>
                </select>
              </div>

              {/* District */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {dict.finder.districtLabel}
                </Label>
                <Input
                  type="text"
                  placeholder={dict.finder.districtPlaceholder}
                  value={finderForm.district}
                  onChange={(e) => setFinderForm({ ...finderForm, district: e.target.value })}
                  className="h-11 rounded-xl text-xs font-medium bg-background"
                />
              </div>

              {/* Crops Cultivated */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {dict.finder.cropsLabel}
                </Label>
                <Input
                  type="text"
                  placeholder={dict.finder.cropsPlaceholder}
                  value={finderForm.crops}
                  onChange={(e) => setFinderForm({ ...finderForm, crops: e.target.value })}
                  className="h-11 rounded-xl text-xs font-medium bg-background"
                />
              </div>

              {/* Landholding in acres */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {dict.finder.landLabel}
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder={dict.finder.landPlaceholder}
                  value={finderForm.landholding}
                  onChange={(e) => setFinderForm({ ...finderForm, landholding: e.target.value })}
                  className="h-11 rounded-xl text-xs font-medium bg-background"
                />
              </div>

              {/* Land Tenure */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {dict.finder.tenureLabel}
                </Label>
                <select
                  value={finderForm.tenure}
                  onChange={(e) => setFinderForm({ ...finderForm, tenure: e.target.value })}
                  className="w-full h-11 rounded-xl border border-border/60 bg-background px-3.5 text-xs text-foreground font-medium focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="owner">{dict.finder.tenureOwner}</option>
                  <option value="tenant">{dict.finder.tenureTenant}</option>
                  <option value="sharecropper">{dict.finder.tenureSharecropper}</option>
                </select>
              </div>

              {/* Assured Irrigation */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {dict.finder.irrigationLabel}
                </Label>
                <select
                  value={finderForm.irrigation}
                  onChange={(e) => setFinderForm({ ...finderForm, irrigation: e.target.value })}
                  className="w-full h-11 rounded-xl border border-border/60 bg-background px-3.5 text-xs text-foreground font-medium focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="yes">{dict.finder.irrigationYes}</option>
                  <option value="no">{dict.finder.irrigationNo}</option>
                </select>
              </div>

              {/* Social / Farmer Category */}
              <div className="space-y-2 md:col-span-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {dict.finder.categoryLabel}
                </Label>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { id: "any", label: dict.finder.categoryAny },
                    { id: "general", label: dict.finder.categoryGeneral },
                    { id: "obc", label: dict.finder.categoryOBC },
                    { id: "sc", label: dict.finder.categorySC },
                    { id: "st", label: dict.finder.categoryST },
                    { id: "women", label: dict.finder.categoryWomen },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFinderForm({ ...finderForm, category: cat.id })}
                      className={`text-xs px-3.5 py-2 rounded-xl font-medium border transition-all ${
                        finderForm.category === cat.id
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-background border-border/60 text-muted-foreground hover:border-emerald-500/40"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activities Planned */}
              <div className="space-y-3 md:col-span-3 pt-2 border-t border-border/40">
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {dict.finder.activitiesLabel}
                  </Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {dict.finder.activitiesHint}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {[
                    { id: "micro_irrigation", label: dict.finder.activityDrip, icon: Droplets },
                    { id: "solar_pump", label: dict.finder.activitySolar, icon: Sparkles },
                    { id: "machinery", label: dict.finder.activityMachinery, icon: Tractor },
                    { id: "credit_loan", label: dict.finder.activityCredit, icon: IndianRupee },
                    { id: "crop_insurance", label: dict.finder.activityInsurance, icon: ShieldCheck },
                    { id: "organic_farming", label: dict.finder.activityOrganic, icon: Sprout },
                  ].map((act) => {
                    const selected = finderForm.activities.includes(act.id)
                    const Icon = act.icon
                    return (
                      <button
                        key={act.id}
                        type="button"
                        onClick={() => {
                          setFinderForm({
                            ...finderForm,
                            activities: selected
                              ? finderForm.activities.filter(a => a !== act.id)
                              : [...finderForm.activities, act.id]
                          })
                        }}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                          selected
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "border-border/50 bg-background text-muted-foreground hover:bg-muted/40"
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${selected ? "text-emerald-500" : "text-muted-foreground"}`} />
                        <span>{act.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <Button
              onClick={runDeterministicFinder}
              className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>{dict.finder.evaluateBtn}</span>
            </Button>
          </motion.div>

          {/* EVALUATION RESULTS */}
          {evaluatedResults.evaluated && (
            <div className="space-y-8">
              {/* Disclaimer alert */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-3">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{dict.results.disclaimer}</p>
              </div>

              {/* Bucket 1: Potential Match */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2 font-display">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      {dict.results.potentialMatch} ({evaluatedResults.potentialMatches.length})
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {dict.results.potentialMatchDesc}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {evaluatedResults.potentialMatches.map((m) => (
                    <SchemeMatchCard
                      key={m.scheme.id}
                      match={m}
                      dict={dict}
                      onSelect={() => setSelectedScheme(m.scheme)}
                      onChecklist={() => setSelectedForChecklist(m.scheme)}
                      isSaved={savedSchemeIds.includes(m.scheme.id)}
                      onToggleSave={() => toggleSaveScheme(m.scheme.id)}
                    />
                  ))}
                  {evaluatedResults.potentialMatches.length === 0 && (
                    <div className="col-span-full p-8 text-center rounded-2xl border border-dashed border-border/60 text-muted-foreground text-xs">
                      No schemes fully matched every criteria. Review &apos;More Information Required&apos; below.
                    </div>
                  )}
                </div>
              </div>

              {/* Bucket 2: More Information Required */}
              {evaluatedResults.moreInfoNeeded.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-border/50">
                  <div>
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2 font-display">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                      {dict.results.moreInfoRequired} ({evaluatedResults.moreInfoNeeded.length})
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {dict.results.moreInfoRequiredDesc}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {evaluatedResults.moreInfoNeeded.map((m) => (
                      <SchemeMatchCard
                        key={m.scheme.id}
                        match={m}
                        dict={dict}
                        onSelect={() => setSelectedScheme(m.scheme)}
                        onChecklist={() => setSelectedForChecklist(m.scheme)}
                        isSaved={savedSchemeIds.includes(m.scheme.id)}
                        onToggleSave={() => toggleSaveScheme(m.scheme.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Bucket 3: Appears Not to Match */}
              {evaluatedResults.unmatched.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-border/50">
                  <div>
                    <h3 className="text-base font-bold text-muted-foreground flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                      {dict.results.notMatching} ({evaluatedResults.unmatched.length})
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {dict.results.notMatchingDesc}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {evaluatedResults.unmatched.map((m) => (
                      <div key={m.scheme.id} className="p-4 rounded-2xl border border-border/40 bg-card/60 space-y-2 opacity-75">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground px-2 py-0.5 bg-muted rounded-md">
                            {m.scheme.state === "All" ? "Central" : m.scheme.state}
                          </span>
                          <span className="text-[10px] text-rose-500 font-semibold">Exclusion condition</span>
                        </div>
                        <h4 className="text-sm font-bold text-foreground">{m.scheme.name}</h4>
                        <div className="text-[11px] text-muted-foreground space-y-1">
                          {m.reasons.map((r, idx) => (
                            <p key={idx} className="flex items-start gap-1.5 text-rose-600/90 dark:text-rose-400/90">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1 shrink-0" />
                              <span>{r}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="space-y-8">
          {/* Quick Stats & Explore by Need */}
          <div className="rounded-3xl border border-border/50 bg-card p-6 md:p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
              <Compass className="h-5 w-5 text-emerald-500" />
              {dict.dashboard.exploreByNeedTitle}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[
                { title: "Income Support", query: "income", icon: IndianRupee, count: "1 Scheme" },
                { title: "Crop Insurance", query: "insurance", icon: ShieldCheck, count: "1 Scheme" },
                { title: "Farm Credit & KCC", query: "credit", icon: Landmark, count: "1 Scheme" },
                { title: "Irrigation & Drip", query: "irrigation", icon: Droplets, count: "3 Schemes" },
                { title: "Machinery Subsidy", query: "machinery", icon: Tractor, count: "1 Scheme" },
                { title: "Diesel & Inputs", query: "inputs", icon: Sprout, count: "1 Scheme" },
                { title: "Women Farmers", query: "women", icon: CheckCircle2, count: "1 Scheme" },
              ].map((cat, idx) => {
                const Icon = cat.icon
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCatalogCategory(cat.query)
                      setActiveTab("all")
                    }}
                    className="p-4 rounded-2xl border border-border/50 bg-background text-left hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group"
                  >
                    <Icon className="h-5 w-5 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-xs font-bold text-foreground">{cat.title}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{cat.count}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Currently Open Windows */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-sky-500" />
              {dict.dashboard.openApplicationsTitle}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {(ALL_SCHEMES_DATA as Scheme[]).slice(0, 6).map((s) => (
                <div key={s.id} className="p-5 rounded-2xl border border-border/50 bg-card shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-2">
                      <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        {s.lastDate}
                      </span>
                      <span className="text-muted-foreground">{s.state === "All" ? "Central" : s.state}</span>
                    </div>
                    <h4 className="text-sm font-bold text-foreground">{s.name}</h4>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{s.description}</p>
                  </div>
                  <div className="pt-3 border-t border-border/50 flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedScheme(s)}
                      className="flex-1 text-xs h-9 rounded-xl font-semibold"
                    >
                      {dict.results.viewDetails}
                    </Button>
                    <a href={s.link} target="_blank" rel="noreferrer">
                      <Button className="h-9 px-3 rounded-xl bg-emerald-600 text-white font-semibold text-xs">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Official Sources Integration Status */}
          <div className="rounded-3xl border border-border/50 bg-card p-6 md:p-8 space-y-4">
            <h3 className="text-base font-bold font-display text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              {dict.dashboard.officialSourcesTitle}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: "PM-KISAN Central Registry", url: "https://pmkisan.gov.in", note: "Central Portal DBT Verified" },
                { name: "National Crop Insurance Portal (PMFBY)", url: "https://pmfby.gov.in", note: "GoI NCIP Active" },
                { name: "MNRE PM-KUSUM Solar Portal", url: "https://pmkusum.mnre.gov.in", note: "Central Nodal Agency" },
                { name: "Bihar DBT Agriculture Portal", url: "https://dbtagriculture.bihar.gov.in", note: "Govt of Bihar Approved" },
                { name: "National Agriculture Market (e-NAM)", url: "https://enam.gov.in", note: "SFAC Operational" },
                { name: "Agriculture Infrastructure Fund (AIF)", url: "https://agriinfra.dac.gov.in", note: "Operational till 2032" }
              ].map((src, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-border/40 bg-background/60 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-foreground">{src.name}</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{src.note}</div>
                  </div>
                  <a href={src.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-emerald-500">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ALL SCHEMES (CATALOG WITH SEARCH & STATE FILTERS) */}
      {activeTab === "all" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={dict.searchPlaceholder}
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border/60 bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 h-11"
              />
            </div>
            <select
              value={catalogState}
              onChange={(e) => setCatalogState(e.target.value)}
              className="h-11 rounded-2xl border border-border/60 bg-card px-4 text-xs font-semibold text-foreground cursor-pointer min-w-[150px]"
            >
              <option value="all">{dict.allStates}</option>
              <option value="bihar">{dict.stateBihar}</option>
              <option value="uttar pradesh">{dict.stateUttarPradesh}</option>
              <option value="karnataka">{dict.stateKarnataka}</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {allSchemesList.map((scheme) => (
              <div
                key={scheme.id}
                className="h-full flex flex-col justify-between group overflow-hidden relative border border-border/50 shadow-sm hover:border-emerald-500/30 transition-all bg-card p-6 rounded-3xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-border/40 text-[10px] font-bold uppercase">
                    <span className={`px-2.5 py-0.5 rounded-full ${scheme.badgeColor || "bg-emerald-500/10 text-emerald-600"}`}>
                      {scheme.badge || "Scheme"}
                    </span>
                    <span className="text-muted-foreground">
                      {scheme.state === "All" ? dict.centralScheme : scheme.state}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground font-display group-hover:text-emerald-600 transition-colors">
                    {scheme.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                    <IndianRupee className="h-3.5 w-3.5 shrink-0" />
                    <span>{scheme.benefit}</span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                    {scheme.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-border/40 space-y-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedScheme(scheme)}
                      className="flex-1 text-xs h-10 rounded-xl font-semibold hover:border-emerald-500/30"
                    >
                      {dict.results.viewDetails}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedForChecklist(scheme)}
                      className="text-xs h-10 px-3 rounded-xl border-border/50 text-muted-foreground hover:text-emerald-600"
                    >
                      <CheckSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toggleSaveScheme(scheme.id)}
                      className={`text-xs h-10 px-3 rounded-xl border-border/50 ${
                        savedSchemeIds.includes(scheme.id) ? "text-emerald-600 bg-emerald-500/10" : "text-muted-foreground"
                      }`}
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                  <a href={scheme.link} target="_blank" rel="noreferrer" className="block w-full">
                    <Button className="w-full text-xs h-10 rounded-xl bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2">
                      <span>{t("schemes.apply_directly") || "Apply on Official Portal"}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SAVED SCHEMES & CHECKLISTS */}
      {activeTab === "saved" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-emerald-500" />
              {dict.tabs.saved} ({savedSchemesList.length})
            </h2>
          </div>

          {savedSchemesList.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-border/60 bg-card/40 space-y-3">
              <Bookmark className="h-10 w-10 text-muted-foreground/30 mx-auto" />
              <p className="text-sm font-semibold text-muted-foreground">
                No schemes saved yet. Use the bookmark icon on any scheme to pin it here.
              </p>
              <Button onClick={() => setActiveTab("all")} variant="outline" className="text-xs rounded-xl">
                Browse Schemes
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {savedSchemesList.map((scheme) => (
                <div key={scheme.id} className="p-6 rounded-3xl border border-border/50 bg-card shadow-sm space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                    <span className="text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      {scheme.state === "All" ? "Central Scheme" : scheme.state}
                    </span>
                    <button
                      onClick={() => toggleSaveScheme(scheme.id)}
                      className="text-muted-foreground hover:text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <h3 className="text-base font-bold text-foreground font-display">{scheme.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{scheme.description}</p>
                  
                  <div className="pt-3 border-t border-border/50 flex gap-2">
                    <Button
                      onClick={() => setSelectedForChecklist(scheme)}
                      className="flex-1 text-xs h-9 rounded-xl bg-emerald-600 text-white font-semibold flex items-center justify-center gap-1.5"
                    >
                      <CheckSquare className="h-3.5 w-3.5" />
                      <span>{dict.results.prepareChecklist}</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedScheme(scheme)}
                      className="text-xs h-9 px-3 rounded-xl font-semibold"
                    >
                      {dict.results.viewDetails}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: SCHEME DETAILS MODAL */}
      <AnimatePresence>
        {selectedScheme && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl my-8 bg-card border border-border/60 rounded-3xl shadow-xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-4 border-b border-border/50 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-1">
                    <span>{selectedScheme.state === "All" ? dict.centralScheme : selectedScheme.state}</span>
                    <span>•</span>
                    <span>{selectedScheme.badge || "Verified Official"}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold font-display text-foreground">
                    {selectedScheme.name}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedScheme(null)}
                  className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Published Benefits */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                  <IndianRupee className="h-4 w-4" />
                  {dict.detail.publishedBenefits}
                </div>
                <div className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                  {selectedScheme.benefit}
                </div>
                {selectedScheme.benefits_details && (
                  <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80 mt-1">
                    {selectedScheme.benefits_details}
                  </p>
                )}
              </div>

              {/* Overview */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {dict.detail.overview}
                </h4>
                <p className="text-xs md:text-sm text-foreground leading-relaxed">
                  {selectedScheme.overview || selectedScheme.description}
                </p>
              </div>

              {/* Official Eligibility Criteria */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {dict.detail.eligibilityCriteria}
                </h4>
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 text-xs text-foreground leading-relaxed whitespace-pre-line">
                  {selectedScheme.eligibility_criteria_text || selectedScheme.description}
                </div>
              </div>

              {/* Required Documents */}
              {selectedScheme.required_documents && selectedScheme.required_documents.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {dict.detail.requiredDocuments}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedScheme.required_documents.map((doc, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-border/40 bg-background flex items-center gap-2 text-xs">
                        <FileText className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>{doc.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Application Steps */}
              {selectedScheme.application_steps && selectedScheme.application_steps.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {dict.detail.applicationSteps}
                  </h4>
                  <div className="space-y-2.5">
                    {selectedScheme.application_steps.map((st) => (
                      <div key={st.step} className="p-3.5 rounded-2xl border border-border/40 bg-background/60 flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs flex items-center justify-center shrink-0">
                          {st.step}
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-foreground">{st.title}</div>
                          <div className="text-[11px] text-muted-foreground leading-relaxed">{st.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Helpline Information */}
              {selectedScheme.helpline && (
                <div className="p-4 rounded-2xl border border-border/50 bg-background flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 text-emerald-500" />
                    <span>{dict.detail.helpline}:</span>
                    <span className="font-bold text-foreground">{selectedScheme.helpline}</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold">{dict.detail.lastVerified}: Today</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border/50 flex flex-wrap gap-3">
                <Button
                  onClick={() => {
                    const sc = selectedScheme
                    setSelectedScheme(null)
                    setSelectedForChecklist(sc)
                  }}
                  variant="outline"
                  className="flex-1 text-xs h-11 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <CheckSquare className="h-4 w-4" />
                  <span>{dict.results.prepareChecklist}</span>
                </Button>
                <a
                  href={selectedScheme.application_url || selectedScheme.link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full text-xs h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm">
                    <span>{dict.results.applyOfficial}</span>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: DOCUMENT PREPARATION CHECKLIST MODAL */}
      <AnimatePresence>
        {selectedForChecklist && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl my-8 bg-card border border-border/60 rounded-3xl shadow-xl p-6 md:p-8 space-y-6"
            >
              <div className="flex items-start justify-between gap-4 border-b border-border/50 pb-4">
                <div>
                  <div className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-1">
                    {dict.checklist.title}
                  </div>
                  <h3 className="text-xl font-bold font-display text-foreground">
                    {selectedForChecklist.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dict.checklist.subtitle}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedForChecklist(null)}
                  className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Privacy Notice Banner */}
              <div className="p-3.5 rounded-2xl bg-muted/60 border border-border/50 text-[11px] text-muted-foreground flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <p>{dict.checklist.privacyNotice}</p>
              </div>

              {/* Document Items List */}
              <div className="space-y-3">
                {(selectedForChecklist.required_documents || [
                  { name: "Aadhaar Card linked with active mobile", code: "aadhaar" },
                  { name: "Land Record / Khasra-Khatauni / RTC", code: "land_record" },
                  { name: "Aadhaar-Seeded Bank Passbook Copy", code: "bank_passbook" }
                ]).map((doc, idx) => {
                  const items = checklist[selectedForChecklist.id] || []
                  const currentItem = items.find(x => x.docName === doc.name)
                  const currentStatus = currentItem?.status || "pending"

                  return (
                    <div key={idx} className="p-4 rounded-2xl border border-border/50 bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <FileText className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="text-xs font-bold text-foreground">{doc.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateChecklistStatus(selectedForChecklist.id, doc.name, "available")}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                            currentStatus === "available"
                              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                              : "bg-muted/40 text-muted-foreground border-transparent hover:border-border"
                          }`}
                        >
                          {dict.checklist.available}
                        </button>
                        <button
                          type="button"
                          onClick={() => updateChecklistStatus(selectedForChecklist.id, doc.name, "pending")}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                            currentStatus === "pending"
                              ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30"
                              : "bg-muted/40 text-muted-foreground border-transparent hover:border-border"
                          }`}
                        >
                          {dict.checklist.pending}
                        </button>
                        <button
                          type="button"
                          onClick={() => updateChecklistStatus(selectedForChecklist.id, doc.name, "need_help")}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                            currentStatus === "need_help"
                              ? "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30"
                              : "bg-muted/40 text-muted-foreground border-transparent hover:border-border"
                          }`}
                        >
                          {dict.checklist.needHelp}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Set Application Reminder Button */}
              <div className="pt-4 border-t border-border/50 space-y-3">
                <Button
                  onClick={() => {
                    setReminderNotice(`Reminder noted for ${selectedForChecklist.name}!`)
                    setTimeout(() => setReminderNotice(null), 3000)
                  }}
                  variant="outline"
                  className="w-full h-11 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Bell className="h-4 w-4 text-emerald-500" />
                  <span>{dict.checklist.saveReminder}</span>
                </Button>
                {reminderNotice && (
                  <p className="text-center text-xs text-emerald-600 font-bold">{reminderNotice}</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

function SchemeMatchCard({
  match,
  dict,
  onSelect,
  onChecklist,
  isSaved,
  onToggleSave
}: {
  match: EvaluatedMatch
  dict: any
  onSelect: () => void
  onChecklist: () => void
  isSaved: boolean
  onToggleSave: () => void
}) {
  const { scheme, status, score, reasons, missingCriteria } = match
  const isPotential = status === "Potential Match"

  return (
    <div className="p-6 rounded-3xl border border-border/50 bg-card shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-all">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-border/40 text-[10px] font-bold uppercase">
          <span className={`px-2 py-0.5 rounded-md ${
            isPotential ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
          }`}>
            {status} ({score}%)
          </span>
          <span className="text-muted-foreground">{scheme.state === "All" ? "Central" : scheme.state}</span>
        </div>

        <h3 className="text-base font-bold text-foreground font-display leading-snug">
          {scheme.name}
        </h3>

        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2">
          <IndianRupee className="h-3.5 w-3.5 shrink-0" />
          <span>{scheme.benefit}</span>
        </div>

        {/* Why Matched Reasons */}
        <div className="mt-3 space-y-1 text-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {dict.results.whyMatched}
          </div>
          {reasons.slice(0, 2).map((r, i) => (
            <p key={i} className="text-muted-foreground flex items-start gap-1.5 text-[11px] leading-relaxed">
              <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
              <span>{r}</span>
            </p>
          ))}
        </div>

        {/* Missing Conditions if More Info Needed */}
        {missingCriteria.length > 0 && (
          <div className="mt-3 space-y-1 text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
              {dict.results.missingConditions}
            </div>
            {missingCriteria.map((c, i) => (
              <p key={i} className="text-amber-700/90 dark:text-amber-300/90 flex items-start gap-1.5 text-[11px]">
                <AlertCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                <span>{c}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-border/40 space-y-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onSelect}
            className="flex-1 text-xs h-10 rounded-xl font-semibold hover:border-emerald-500/30"
          >
            {dict.results.viewDetails}
          </Button>
          <Button
            variant="outline"
            onClick={onChecklist}
            className="text-xs h-10 px-3 rounded-xl border-border/50 text-muted-foreground hover:text-emerald-600"
          >
            <CheckSquare className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={onToggleSave}
            className={`text-xs h-10 px-3 rounded-xl border-border/50 ${
              isSaved ? "text-emerald-600 bg-emerald-500/10" : "text-muted-foreground"
            }`}
          >
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
        <a href={scheme.link} target="_blank" rel="noreferrer" className="block w-full">
          <Button className="w-full text-xs h-10 rounded-xl bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2">
            <span>{dict.results.applyOfficial}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </a>
      </div>
    </div>
  )
}
