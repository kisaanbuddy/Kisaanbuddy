"use client"
import { useLanguage } from '@/lib/language'
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight, CheckCircle2, ChevronDown, Filter,
  IndianRupee, Landmark, RefreshCw, X, Sparkles, HelpCircle,
} from "lucide-react"
import { GlassCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SchemeVideo } from "@/components/SchemeVideo"

type Category = "general" | "sc" | "st" | "obc" | "women" | "any"

interface Scheme {
  id: string; name: string; description: string; benefit: string
  eligibility: { maxLandAcres?: number; categories: Category[] }
  link: string; youtubeLink?: string; badge?: string; badgeColor?: string; central: boolean
}

const ALL_SCHEMES: Scheme[] = [
  { id:"pmkisan", name:"PM-Kisan Samman Nidhi",
    description:"Income support of Rs 6,000/year to all landholding farmer families across India.",
    benefit:"Rs 6,000/year", eligibility:{ categories:[] }, link:"https://pmkisan.gov.in",
    badge:"Most Popular", badgeColor:"bg-amber-500/10 border border-amber-500/20 text-amber-400", central:true },
  { id:"pmfby", name:"Pradhan Mantri Fasal Bima Yojana",
    description:"Crop insurance covering pre-sowing to post-harvest losses due to natural calamities, pests, and diseases.",
    benefit:"Crop insurance", eligibility:{ categories:[] }, link:"https://pmfby.gov.in",
    badge:"Insurance", badgeColor:"bg-blue-500/10 border border-blue-500/20 text-blue-400", central:true },
  { id:"kcc", name:"Kisan Credit Card (KCC)",
    description:"Short-term credit for crop production, post-harvest expenses, and farm assets at 4% interest.",
    benefit:"Credit @ 4% p.a.", eligibility:{ categories:[] }, link:"https://www.nabard.org/content1.aspx?id=572",
    badge:"Credit", badgeColor:"bg-emerald-500/10 border border-emerald-500/20 text-emerald-400", central:true },
  { id:"pmksy", name:"PM Krishi Sinchayee Yojana",
    description:"Har Khet Ko Pani -- irrigation infrastructure for every farm, promoting water-use efficiency.",
    benefit:"Irrigation subsidy", eligibility:{ categories:[] }, link:"https://pmksy.gov.in", central:true },
  { id:"smam", name:"Sub-Mission on Agricultural Mechanisation (SMAM)",
    description:"Subsidies up to 50% on farm machinery for small and marginal farmers.",
    benefit:"Up to 50% subsidy", eligibility:{ maxLandAcres:10, categories:["sc","st","women","obc","general"] },
    link:"https://farmech.dac.gov.in", badge:"Machinery",
    badgeColor:"bg-purple-500/10 border border-purple-500/20 text-purple-400", central:true },
  { id:"nfsm", name:"National Food Security Mission",
    description:"Promotes rice, wheat, coarse cereals, and pulses production through demonstration and input distribution.",
    benefit:"Free inputs + training", eligibility:{ categories:[] }, link:"https://nfsm.gov.in", central:true },
  { id:"pkvy", name:"Paramparagat Krishi Vikas Yojana (PKVY)",
    description:"Rs 50,000/hectare over 3 years for organic farming conversion and certification.",
    benefit:"Rs 50,000/hectare", eligibility:{ categories:[] }, link:"https://pgsindia-ncof.gov.in",
    badge:"Organic", badgeColor:"bg-teal-500/10 border border-teal-500/20 text-teal-400", central:true },
  { id:"nhm", name:"National Horticulture Mission (NHM)",
    description:"Subsidies for vegetables, fruits, spices -- nursery development, protected cultivation, post-harvest.",
    benefit:"Horticulture subsidies", eligibility:{ categories:[] }, link:"https://nhm.nic.in",
    badge:"Horticulture", badgeColor:"bg-pink-500/10 border border-pink-500/20 text-pink-400", central:true },
  { id:"sc-margin", name:"SC/ST Farmer Margin Money Scheme",
    description:"Interest-free loans for SC/ST farmers with no collateral requirement for agricultural investments.",
    benefit:"Interest-free loans", eligibility:{ categories:["sc","st"] }, link:"https://www.nabard.org",
    badge:"SC/ST", badgeColor:"bg-orange-500/10 border border-orange-500/20 text-orange-400", central:true },
  { id:"mahila-kisan", name:"Mahila Kisan Sashaktikaran Pariyojana",
    description:"Empowers women farmers through training, resources, and credit linkages -- priority for BPL women.",
    benefit:"Training + credit linkage", eligibility:{ categories:["women"] }, link:"https://aajeevika.gov.in",
    badge:"Women", badgeColor:"bg-rose-500/10 border border-rose-500/20 text-rose-400", central:true },
  { id:"enam", name:"eNAM -- National Agriculture Market",
    description:"Online trading platform for agricultural commodities -- transparent price discovery and better market access.",
    benefit:"Better selling price", eligibility:{ categories:[] }, link:"https://enam.gov.in",
    badge:"Market", badgeColor:"bg-sky-500/10 border border-sky-500/20 text-sky-400", central:true },
  { id:"atma", name:"ATMA -- Agricultural Technology Management Agency",
    description:"Free training, farm visits, exposure tours, and demonstrations for farmer groups to adopt modern techniques.",
    benefit:"Free training and tours", eligibility:{ categories:[] }, link:"https://dacin.nic.in", central:true },
]

interface EligFilter { landAcres:string; category:Category; age:string; checked:boolean }

function checkEligibility(scheme: Scheme, filter: EligFilter): boolean {
  if (!filter.checked) return true
  const e = scheme.eligibility
  const land = parseFloat(filter.landAcres) || 0
  if (e.maxLandAcres !== undefined && land > e.maxLandAcres && land > 0) return false
  if (e.categories.length > 0 && filter.category !== "any" && !e.categories.includes(filter.category)) return false
  return true
}

export default function SchemesPage() {
  const { t } = useLanguage()
  const [filter, setFilter] = useState<EligFilter>({ landAcres:"", category:"any", age:"", checked:false })
  const [showChecker, setShowChecker] = useState(false)
  const visible = useMemo(() => ALL_SCHEMES.filter((s) => checkEligibility(s, filter)), [filter])
  const upd = (k: keyof EligFilter, v: string | boolean) => setFilter((f) => ({ ...f, [k]: v }))
  const reset = () => setFilter({ landAcres:"", category:"any", age:"", checked:false })

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
              Government <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-400 bg-clip-text text-transparent">Schemes</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
              Browse government agricultural grants, crop subsidies, low-interest microcredit options, and training resources. Filter instantly based on eligibility conditions.
            </p>
          </div>
        </div>
      </motion.div>

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
              <div className="font-bold text-white text-sm font-display">Targeted Eligibility Search</div>
              <div className="text-xs text-muted-foreground">
                {filter.checked ? `${visible.length} of ${ALL_SCHEMES.length} schemes matching your criteria` : "Fill profile parameters below to crop check match factors"}
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
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold block">Land Holding (acres)</Label>
                  <Input 
                    type="number" 
                    min={0} 
                    value={filter.landAcres} 
                    onChange={(e) => upd("landAcres", e.target.value)}
                    placeholder="e.g. 2.5" 
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
                    <option value="any" className="bg-slate-900">Any Category</option>
                    <option value="general" className="bg-slate-900">General</option>
                    <option value="obc" className="bg-slate-900">OBC</option>
                    <option value="sc" className="bg-slate-900">SC</option>
                    <option value="st" className="bg-slate-900">ST</option>
                    <option value="women" className="bg-slate-900">Women Farmer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold block">Farmer Age</Label>
                  <Input 
                    type="number" 
                    min={18} 
                    max={100} 
                    value={filter.age} 
                    onChange={(e) => upd("age", e.target.value)}
                    placeholder="e.g. 35" 
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
              <GlassCard className="h-full flex flex-col justify-between group overflow-hidden relative border border-white/[0.08] backdrop-blur-md shadow-lg hover:shadow-2xl hover:border-blue-500/20 transition-all duration-300 bg-slate-950/20 p-6">
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
                    <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">
                      {scheme.central ? t("central") : "State"} Scheme
                    </span>
                  </div>
                  <CardTitle className="text-lg font-extrabold text-white leading-snug group-hover:text-blue-400 transition-colors font-display">
                    {scheme.name}
                  </CardTitle>
                  <div className="flex items-center gap-1 text-sm font-black text-emerald-400 mt-2">
                    <IndianRupee className="h-3.5 w-3.5 shrink-0" />
                    <span>{scheme.benefit}</span>
                  </div>
                  
                  <p className="text-muted-foreground text-xs leading-relaxed mt-4 flex items-start gap-2">
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
                      <span>Apply Directly</span>
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
          <p className="text-muted-foreground text-sm font-semibold">No government schemes matched your parameters.</p>
          <button onClick={reset} className="mt-3 text-xs text-blue-400 font-bold hover:underline">Clear Search Parameters</button>
        </div>
      )}
    </div>
  )
}
