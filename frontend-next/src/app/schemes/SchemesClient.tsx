"use client"

import { useLanguage } from '@/lib/language'
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight, CheckCircle2, ChevronDown, Filter,
  IndianRupee, Landmark, RefreshCw, X, Sparkles, HelpCircle,
  Search, Calendar, CheckSquare
} from "lucide-react"
import { GlassCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SchemeVideo } from "@/components/SchemeVideo"
import ALL_SCHEMES_DATA from "@/lib/schemes-data.json"

type Category = "general" | "sc" | "st" | "obc" | "women" | "any"

interface Scheme {
  id: string
  name: string
  description: string
  benefit: string
  eligibility: { maxLandAcres?: number; categories: Category[] }
  link: string
  youtubeLink?: string
  badge?: string
  badgeColor?: string
  central: boolean
  state: string
  verifiedAt: string
  lastDate: string
}

interface EligFilter {
  landAcres: string
  category: Category
  age: string
  state: string
  search: string
  checked: boolean
}

function checkEligibility(scheme: Scheme, filter: EligFilter): boolean {
  // Search query filter
  if (filter.search.trim()) {
    const q = filter.search.toLowerCase().trim()
    const matchesName = scheme.name.toLowerCase().includes(q)
    const matchesDesc = scheme.description.toLowerCase().includes(q)
    const matchesBenefit = scheme.benefit.toLowerCase().includes(q)
    if (!matchesName && !matchesDesc && !matchesBenefit) return false
  }

  // State filter
  if (filter.state !== "all" && scheme.state !== "All" && scheme.state.toLowerCase() !== filter.state.toLowerCase()) {
    return false
  }

  if (!filter.checked) return true

  // Landholding limit filter
  const land = parseFloat(filter.landAcres) || 0
  if (scheme.eligibility.maxLandAcres !== undefined && land > scheme.eligibility.maxLandAcres && land > 0) {
    return false
  }

  // Category filter
  if (scheme.eligibility.categories.length > 0 && filter.category !== "any") {
    if (!scheme.eligibility.categories.includes(filter.category)) {
      return false
    }
  }

  return true
}

export default function SchemesPage() {
  const searchParams = useSearchParams()
  const { t, lang } = useLanguage()
  const dict = SCHEMES_I18N[(lang as Lang) || "en"] || SCHEMES_I18N.en
  const [filter, setFilter] = useState<EligFilter>({
    landAcres: "",
    category: "any",
    age: "",
    state: "all",
    search: "",
    checked: false
  })
  const [showChecker, setShowChecker] = useState(false)

  useEffect(() => {
    if (searchParams.get("voice") !== "1") return
    const state = searchParams.get("state") || "all"
    setFilter((current) => ({ ...current, state, search: searchParams.get("crop") || current.search }))
  }, [searchParams])

  const schemes = ALL_SCHEMES_DATA as Scheme[]

  const visible = useMemo(() => schemes.filter((s) => checkEligibility(s, filter)), [filter, schemes])
  const upd = (k: keyof EligFilter, v: string | boolean) => setFilter((f) => ({ ...f, [k]: v }))
  const reset = () => setFilter({ landAcres: "", category: "any", age: "", state: "all", search: "", checked: false })

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-12 relative">

      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 md:p-8 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-3">
              <Landmark className="h-3.5 w-3.5" />
              {dict.tag}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-foreground flex items-center gap-3">
              {dict.headingPrefix} <span className="text-emerald-600 dark:text-emerald-400">{t("schemes.schemes")}</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
              {dict.description}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search and State Quick Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
          <input
            type="text"
            placeholder={dict.searchPlaceholder}
            value={filter.search}
            onChange={(e) => upd("search", e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border/50 bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-foreground font-medium h-11"
          />
        </div>

        <select
          value={filter.state}
          onChange={(e) => upd("state", e.target.value)}
          className="h-11 rounded-xl border border-border/50 bg-card px-4 text-xs text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer min-w-[160px]"
        >
          <option value="all">{dict.allStates}</option>
          <option value="uttar pradesh">{dict.stateUttarPradesh}</option>
          <option value="karnataka">{dict.stateKarnataka}</option>
        </select>
      </div>

      {/* Eligibility Checker Trigger Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Filter className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="font-bold text-foreground text-sm font-display">{t("schemes.targeted_eligibility_search")}</div>
              <div className="text-xs text-muted-foreground">
                {filter.checked ? dict.criteriaMatched(visible.length, schemes.length) : dict.fillParamsHint}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {filter.checked && (
              <Button 
                onClick={reset} 
                variant="outline"
                className="text-xs rounded-xl border border-border/50 px-4 py-2 font-semibold flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" /> {dict.resetFilterBtn}
              </Button>
            )}
            <Button 
              onClick={() => setShowChecker(!showChecker)}
              className="text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 flex items-center gap-1.5 shadow-sm transition-all"
            >
              {showChecker ? <X className="h-3.5 w-3.5" /> : <Filter className="h-3.5 w-3.5" />}
              <span>{showChecker ? dict.closeFilterBtn : t("checkEligibility")}</span>
              {!showChecker && <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showChecker && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: "auto", opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }} 
              className="overflow-hidden"
            >
              <div className="mt-5 pt-5 border-t border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold block">{t("schemes.land_holding_acres")}</Label>
                  <Input 
                    type="number" 
                    min={0} 
                    value={filter.landAcres} 
                    onChange={(e) => upd("landAcres", e.target.value)}
                    placeholder={t("schemes.e_g_2_5")} 
                    className="h-10 rounded-xl border-border/50 bg-background px-4 text-xs font-semibold focus-visible:ring-emerald-500/20 text-foreground" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold block">{dict.categoryGroupLabel}</Label>
                  <select 
                    value={filter.category} 
                    onChange={(e) => upd("category", e.target.value as Category)}
                    className="w-full h-10 rounded-xl border border-border/50 bg-background px-3.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                  >
                    <option value="any">{t("schemes.any_category")}</option>
                    <option value="general">{t("schemes.general")}</option>
                    <option value="obc">{t("schemes.obc")}</option>
                    <option value="sc">{t("schemes.sc")}</option>
                    <option value="st">{t("schemes.st")}</option>
                    <option value="women">{t("schemes.women_farmer")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold block">{t("schemes.farmer_age")}</Label>
                  <Input 
                    type="number" 
                    min={18} 
                    max={100} 
                    value={filter.age} 
                    onChange={(e) => upd("age", e.target.value)}
                    placeholder={t("schemes.e_g_35")} 
                    className="h-10 rounded-xl border-border/50 bg-background px-4 text-xs font-semibold focus-visible:ring-emerald-500/20 text-foreground" 
                  />
                </div>
              </div>
              <Button 
                onClick={() => { upd("checked", true); setShowChecker(false) }}
                className="mt-5 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 flex items-center justify-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="h-4.5 w-4.5" /> {dict.showMatchingSchemesBtn}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Selected Filters Meta */}
      {filter.checked && (
        <div className="flex flex-wrap gap-2.5 items-center pl-1">
          <span className="text-[10px] font-bold rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1">
            {dict.matchingGrantsBadge(visible.length)}
          </span>
          {filter.landAcres && <span className="text-[10px] font-bold rounded-full bg-card border border-border/50 px-3 py-1 text-muted-foreground">{filter.landAcres} {dict.acresLand}</span>}
          {filter.category !== "any" && <span className="text-[10px] font-bold rounded-full bg-card border border-border/50 px-3 py-1 text-muted-foreground capitalize">{filter.category} {dict.groupSuffix}</span>}
        </div>
      )}

      {/* Schemes Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {visible.map((scheme, i) => (
            <motion.div 
              key={scheme.id} 
              layout 
              initial={{ opacity: 0, scale: 0.96 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.96 }} 
              transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.3 }}
              className="h-full"
            >
              <div className="h-full flex flex-col justify-between group overflow-hidden relative border border-border/50 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all duration-200 bg-card p-6 rounded-2xl">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-border/50">
                    {scheme.badge ? (
                      <span className={`text-[9px] font-bold rounded-full px-2.5 py-0.5 uppercase tracking-wide ${scheme.badgeColor || "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"}`}>
                        {scheme.badge}
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 uppercase tracking-wide">
                        {dict.headingPrefix + " " + t("schemes.schemes")}
                      </span>
                    )}
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      {scheme.state === "All" ? dict.centralScheme : scheme.state}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors font-display">
                    {scheme.name}
                  </h3>

                  {/* Freshness Badge Indicators */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckSquare className="h-3 w-3 shrink-0" />
                      {dict.verifiedToday}
                    </span>
                    <span className="text-[10px] font-medium text-sky-700 dark:text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Calendar className="h-3 w-3 shrink-0" />
                      {dict.applyBy(scheme.lastDate)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-3.5">
                    <IndianRupee className="h-4 w-4 shrink-0" />
                    <span>{scheme.benefit}</span>
                  </div>
                  
                  <p className="text-muted-foreground text-xs leading-relaxed mt-3 flex items-start gap-2 font-normal">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{scheme.description}</span>
                  </p>
                </div>

                <div className="mt-5 space-y-3 pt-4 border-t border-border/50">
                  {scheme.youtubeLink && (
                    <SchemeVideo url={scheme.youtubeLink} title={scheme.name} />
                  )}
                  <a href={scheme.link} target="_blank" rel="noreferrer" className="block w-full">
                    <Button variant="outline" className="w-full font-semibold h-10 rounded-xl transition-all flex items-center justify-center gap-2 group/btn hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30">
                      <span>{t("schemes.apply_directly")}</span>
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {visible.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-12 text-center">
          <HelpCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-muted-foreground text-sm font-semibold">{t("schemes.no_government_schemes_matched")}</p>
          <button onClick={reset} className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline">{t("schemes.clear_search_parameters")}</button>
        </div>
      )}
    </div>
  )
}
