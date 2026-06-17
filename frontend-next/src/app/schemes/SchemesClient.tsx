"use client"

import { useLanguage } from '@/lib/language'
import { useState, useMemo } from "react"
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
  const { t, lang } = useLanguage()
  const [filter, setFilter] = useState<EligFilter>({
    landAcres: "",
    category: "any",
    age: "",
    state: "all",
    search: "",
    checked: false
  })
  const [showChecker, setShowChecker] = useState(false)

  const schemes = ALL_SCHEMES_DATA as Scheme[]

  const visible = useMemo(() => schemes.filter((s) => checkEligibility(s, filter)), [filter, schemes])
  const upd = (k: keyof EligFilter, v: string | boolean) => setFilter((f) => ({ ...f, [k]: v }))
  const reset = () => setFilter({ landAcres: "", category: "any", age: "", state: "all", search: "", checked: false })

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-12 relative">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-[-10%] left-[20%] w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[10%] w-[250px] h-[250px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none -z-10" />

      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-r from-blue-950/20 via-slate-950 to-indigo-950/15 p-6 md:p-8 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-3">
              <Landmark className="h-3.5 w-3.5" />
              Sarkari Yojana Portal · Government Schemes
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white flex items-center gap-3">
              Government <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-400 bg-clip-text text-transparent">{t("schemes.schemes")}</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
              Browse government agricultural grants, crop subsidies, low-interest microcredit options, and training resources. Filter instantly based on eligibility conditions.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search and State Quick Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/50" />
          <input
            type="text"
            placeholder={lang === "hi" ? "योजना का नाम, लाभ या विवरण खोजें..." : "Search scheme name, benefits, description..."}
            value={filter.search}
            onChange={(e) => upd("search", e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/[0.08] bg-slate-950/40 backdrop-blur-sm text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-white font-medium h-11"
          />
        </div>

        <select
          value={filter.state}
          onChange={(e) => upd("state", e.target.value)}
          className="h-11 rounded-2xl border border-white/[0.08] bg-slate-950/40 px-4 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer min-w-[160px]"
        >
          <option value="all" className="bg-slate-900">{lang === "hi" ? "सभी राज्य" : "All States"}</option>
          <option value="uttar pradesh" className="bg-slate-900">Uttar Pradesh</option>
          <option value="karnataka" className="bg-slate-900">Karnataka</option>
        </select>
      </div>

      {/* Eligibility Checker Trigger Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl border border-white/[0.08] bg-slate-950/40 backdrop-blur-md p-5 shadow-xl relative overflow-hidden"
      >
        <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Filter className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="font-bold text-white text-sm font-display">{t("schemes.targeted_eligibility_search")}</div>
              <div className="text-xs text-muted-foreground">
                {filter.checked ? `${visible.length} of ${schemes.length} schemes matching your criteria` : "Fill profile parameters below to crop check match factors"}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {filter.checked && (
              <Button 
                onClick={reset} 
                variant="outline"
                className="text-xs rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] px-4 py-2 text-white font-semibold flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reset Filter
              </Button>
            )}
            <Button 
              onClick={() => setShowChecker(!showChecker)}
              className="text-xs rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 flex items-center gap-1.5 shadow-lg shadow-blue-500/10 transition-all"
            >
              {showChecker ? <X className="h-3.5 w-3.5" /> : <Filter className="h-3.5 w-3.5" />}
              <span>{showChecker ? "Close Filter" : t("checkEligibility")}</span>
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
              <div className="mt-5 pt-5 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold block">{t("schemes.land_holding_acres")}</Label>
                  <Input 
                    type="number" 
                    min={0} 
                    value={filter.landAcres} 
                    onChange={(e) => upd("landAcres", e.target.value)}
                    placeholder={t("schemes.e_g_2_5")} 
                    className="h-10 rounded-xl border-white/[0.08] bg-slate-950 px-4 text-xs font-semibold focus-visible:ring-blue-500/30 text-white" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold block">Category / श्रेणी</Label>
                  <select 
                    value={filter.category} 
                    onChange={(e) => upd("category", e.target.value as Category)}
                    className="w-full h-10 rounded-xl border border-white/[0.08] bg-slate-950/40 px-3.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
                  >
                    <option value="any" className="bg-slate-900">{t("schemes.any_category")}</option>
                    <option value="general" className="bg-slate-900">{t("schemes.general")}</option>
                    <option value="obc" className="bg-slate-900">{t("schemes.obc")}</option>
                    <option value="sc" className="bg-slate-900">{t("schemes.sc")}</option>
                    <option value="st" className="bg-slate-900">{t("schemes.st")}</option>
                    <option value="women" className="bg-slate-900">{t("schemes.women_farmer")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold block">{t("schemes.farmer_age")}</Label>
                  <Input 
                    type="number" 
                    min={18} 
                    max={100} 
                    value={filter.age} 
                    onChange={(e) => upd("age", e.target.value)}
                    placeholder={t("schemes.e_g_35")} 
                    className="h-10 rounded-xl border-white/[0.08] bg-slate-950 px-4 text-xs font-semibold focus-visible:ring-blue-500/30 text-white" 
                  />
                </div>
              </div>
              <Button 
                onClick={() => { upd("checked", true); setShowChecker(false) }}
                className="mt-5 w-full rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold h-11 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/15"
              >
                <CheckCircle2 className="h-4.5 w-4.5" /> Show Matching Schemes
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Selected Filters Meta */}
      {filter.checked && (
        <div className="flex flex-wrap gap-2.5 items-center pl-1">
          <span className="text-[10px] font-bold rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1">
            {visible.length} Matching Grants
          </span>
          {filter.landAcres && <span className="text-[10px] font-bold rounded-full bg-white/[0.02] border border-white/[0.08] px-3 py-1 text-muted-foreground">{filter.landAcres} acres land</span>}
          {filter.category !== "any" && <span className="text-[10px] font-bold rounded-full bg-white/[0.02] border border-white/[0.08] px-3 py-1 text-muted-foreground capitalize">{filter.category} group</span>}
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
              transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.4 }}
              className="h-full"
            >
              <GlassCard className="h-full flex flex-col justify-between group overflow-hidden relative border border-white/[0.08] backdrop-blur-md shadow-lg hover:shadow-2xl hover:border-blue-500/20 transition-all duration-300 bg-slate-950/20 p-6 rounded-3xl">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-white/[0.04]">
                    {scheme.badge ? (
                      <span className={`text-[9px] font-black rounded-full px-2.5 py-0.5 uppercase tracking-wide ${scheme.badgeColor || "bg-blue-500/10 border border-blue-500/20 text-blue-400"}`}>
                        {scheme.badge}
                      </span>
                    ) : (
                      <span className="text-[9px] font-black rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2.5 py-0.5 uppercase tracking-wide">
                        Sarkari Yojana
                      </span>
                    )}
                    <span className="text-[9px] font-extrabold text-muted-foreground/80 uppercase tracking-wider">
                      {scheme.state === "All" ? (lang === "hi" ? "केंद्र सरकार" : "Central Scheme") : scheme.state}
                    </span>
                  </div>

                  <CardTitle className="text-lg font-extrabold text-white leading-snug group-hover:text-blue-400 transition-colors font-display">
                    {scheme.name}
                  </CardTitle>

                  {/* Freshness Badge Indicators */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                      <CheckSquare className="h-2.5 w-2.5 shrink-0" />
                      {lang === "hi" ? "सत्यापित: आज ही" : `Verified: ${scheme.verifiedAt}`}
                    </span>
                    <span className="text-[9px] font-bold text-sky-400 bg-sky-500/5 border border-sky-500/10 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5 shrink-0" />
                      {lang === "hi" ? "अंतिम तिथि: " + (scheme.lastDate === "Ongoing" || scheme.lastDate === "Open All Year" ? "खुला है" : "30 जून") : `Apply by: ${scheme.lastDate}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-sm font-black text-emerald-400 mt-4 pl-0.5">
                    <IndianRupee className="h-3.5 w-3.5 shrink-0" />
                    <span>{scheme.benefit}</span>
                  </div>
                  
                  <p className="text-muted-foreground text-xs leading-relaxed mt-4 flex items-start gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{scheme.description}</span>
                  </p>
                </div>

                <div className="mt-5 space-y-4 pt-4 border-t border-white/[0.04]">
                  {scheme.youtubeLink && (
                    <SchemeVideo url={scheme.youtubeLink} title={scheme.name} />
                  )}
                  <a href={scheme.link} target="_blank" rel="noreferrer" className="block w-full">
                    <Button className="w-full bg-slate-900 hover:bg-blue-500 border border-white/[0.08] hover:border-blue-500 text-white font-bold h-10 rounded-xl transition-all flex items-center justify-center gap-2 group/btn">
                      <span>{t("schemes.apply_directly")}</span>
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1.5 transition-transform" />
                    </Button>
                  </a>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {visible.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/[0.08] bg-slate-950/20 p-12 text-center">
          <HelpCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm font-semibold">{t("schemes.no_government_schemes_matched")}</p>
          <button onClick={reset} className="mt-3 text-xs text-blue-400 font-bold hover:underline">{t("schemes.clear_search_parameters")}</button>
        </div>
      )}
    </div>
  )
}
