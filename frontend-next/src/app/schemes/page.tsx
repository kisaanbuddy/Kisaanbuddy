"use client"
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight, CheckCircle2, ChevronDown, Filter,
  IndianRupee, Landmark, RefreshCw, X,
} from "lucide-react"
import { GlassCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
    badge:"Most Popular", badgeColor:"bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300", central:true },
  { id:"pmfby", name:"Pradhan Mantri Fasal Bima Yojana",
    description:"Crop insurance covering pre-sowing to post-harvest losses due to natural calamities, pests, and diseases.",
    benefit:"Crop insurance", eligibility:{ categories:[] }, link:"https://pmfby.gov.in",
    badge:"Insurance", badgeColor:"bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300", central:true },
  { id:"kcc", name:"Kisan Credit Card (KCC)",
    description:"Short-term credit for crop production, post-harvest expenses, and farm assets at 4% interest.",
    benefit:"Credit @ 4% p.a.", eligibility:{ categories:[] }, link:"https://www.nabard.org/content1.aspx?id=572",
    badge:"Credit", badgeColor:"bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300", central:true },
  { id:"pmksy", name:"PM Krishi Sinchayee Yojana",
    description:"Har Khet Ko Pani -- irrigation infrastructure for every farm, promoting water-use efficiency.",
    benefit:"Irrigation subsidy", eligibility:{ categories:[] }, link:"https://pmksy.gov.in", central:true },
  { id:"smam", name:"Sub-Mission on Agricultural Mechanisation (SMAM)",
    description:"Subsidies up to 50% on farm machinery for small and marginal farmers.",
    benefit:"Up to 50% subsidy", eligibility:{ maxLandAcres:10, categories:["sc","st","women","obc","general"] },
    link:"https://farmech.dac.gov.in", badge:"Machinery",
    badgeColor:"bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300", central:true },
  { id:"nfsm", name:"National Food Security Mission",
    description:"Promotes rice, wheat, coarse cereals, and pulses production through demonstration and input distribution.",
    benefit:"Free inputs + training", eligibility:{ categories:[] }, link:"https://nfsm.gov.in", central:true },
  { id:"pkvy", name:"Paramparagat Krishi Vikas Yojana (PKVY)",
    description:"Rs 50,000/hectare over 3 years for organic farming conversion and certification.",
    benefit:"Rs 50,000/hectare", eligibility:{ categories:[] }, link:"https://pgsindia-ncof.gov.in",
    badge:"Organic", badgeColor:"bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300", central:true },
  { id:"nhm", name:"National Horticulture Mission (NHM)",
    description:"Subsidies for vegetables, fruits, spices -- nursery development, protected cultivation, post-harvest.",
    benefit:"Horticulture subsidies", eligibility:{ categories:[] }, link:"https://nhm.nic.in",
    badge:"Horticulture", badgeColor:"bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300", central:true },
  { id:"sc-margin", name:"SC/ST Farmer Margin Money Scheme",
    description:"Interest-free loans for SC/ST farmers with no collateral requirement for agricultural investments.",
    benefit:"Interest-free loans", eligibility:{ categories:["sc","st"] }, link:"https://www.nabard.org",
    badge:"SC/ST", badgeColor:"bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300", central:true },
  { id:"mahila-kisan", name:"Mahila Kisan Sashaktikaran Pariyojana",
    description:"Empowers women farmers through training, resources, and credit linkages -- priority for BPL women.",
    benefit:"Training + credit linkage", eligibility:{ categories:["women"] }, link:"https://aajeevika.gov.in",
    badge:"Women", badgeColor:"bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300", central:true },
  { id:"enam", name:"eNAM -- National Agriculture Market",
    description:"Online trading platform for agricultural commodities -- transparent price discovery and better market access.",
    benefit:"Better selling price", eligibility:{ categories:[] }, link:"https://enam.gov.in",
    badge:"Market", badgeColor:"bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300", central:true },
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
  const [filter, setFilter] = useState<EligFilter>({ landAcres:"", category:"any", age:"", checked:false })
  const [showChecker, setShowChecker] = useState(false)
  const visible = useMemo(() => ALL_SCHEMES.filter((s) => checkEligibility(s, filter)), [filter])
  const upd = (k: keyof EligFilter, v: string | boolean) => setFilter((f) => ({ ...f, [k]: v }))
  const reset = () => setFilter({ landAcres:"", category:"any", age:"", checked:false })

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 flex items-center gap-3">
          <Landmark className="text-blue-500 h-10 w-10 shrink-0" />
          Sarkari Yojnayein
        </h1>
        <p className="text-muted-foreground text-lg mt-2">
          {ALL_SCHEMES.length} central schemes &middot; Check eligibility and apply directly.
        </p>
      </motion.div>

      <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        className="rounded-2xl border border-blue-200/60 dark:border-blue-500/30 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 dark:from-blue-500/10 dark:to-indigo-500/5 p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
              <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-semibold text-blue-900 dark:text-blue-200">Eligibility Checker</div>
              <div className="text-xs text-blue-700/70 dark:text-blue-300/70">
                {filter.checked ? `${visible.length} of ${ALL_SCHEMES.length} schemes match` : "Apni details bharo -- sirf relevant schemes dikhenge"}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {filter.checked && (
              <button onClick={reset} className="text-xs rounded-lg border border-blue-300/60 px-3 py-1.5 text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <RefreshCw className="h-3 w-3" /> Reset
              </button>
            )}
            <button onClick={() => setShowChecker(!showChecker)}
              className="text-xs rounded-lg bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 flex items-center gap-1.5">
              {showChecker ? <X className="h-3 w-3" /> : <Filter className="h-3 w-3" />}
              {showChecker ? "Close" : "Check Eligibility"}
              {!showChecker && <ChevronDown className="h-3 w-3" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showChecker && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} className="overflow-hidden">
              <div className="mt-4 pt-4 border-t border-blue-200/60 dark:border-blue-500/30 grid grid-cols-2 md:grid-cols-3 gap-3">
                <label className="block">
                  <span className="text-xs uppercase tracking-wider text-blue-700/70 dark:text-blue-300/70 block mb-1">Land (acres)</span>
                  <input type="number" min={0} value={filter.landAcres} onChange={(e) => upd("landAcres", e.target.value)}
                    placeholder="e.g. 2.5" className="w-full rounded-lg border border-blue-200/60 dark:border-blue-500/30 bg-white/60 dark:bg-blue-500/10 px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground" />
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-wider text-blue-700/70 dark:text-blue-300/70 block mb-1">Category</span>
                  <select value={filter.category} onChange={(e) => upd("category", e.target.value)}
                    className="w-full rounded-lg border border-blue-200/60 dark:border-blue-500/30 bg-white/60 dark:bg-blue-500/10 px-3 py-1.5 text-sm text-foreground">
                    <option value="any">Any</option>
                    <option value="general">General</option>
                    <option value="obc">OBC</option>
                    <option value="sc">SC</option>
                    <option value="st">ST</option>
                    <option value="women">Women Farmer</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-wider text-blue-700/70 dark:text-blue-300/70 block mb-1">Age</span>
                  <input type="number" min={18} max={100} value={filter.age} onChange={(e) => upd("age", e.target.value)}
                    placeholder="e.g. 35" className="w-full rounded-lg border border-blue-200/60 dark:border-blue-500/30 bg-white/60 dark:bg-blue-500/10 px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground" />
                </label>
              </div>
              <button onClick={() => { upd("checked", true); setShowChecker(false) }}
                className="mt-3 w-full rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Mere Liye Schemes Dikhao
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {filter.checked && (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 px-3 py-1">
            {visible.length} matching schemes
          </span>
          {filter.landAcres && <span className="rounded-full bg-card border border-border px-3 py-1 text-muted-foreground">{filter.landAcres} acres</span>}
          {filter.category !== "any" && <span className="rounded-full bg-card border border-border px-3 py-1 text-muted-foreground capitalize">{filter.category}</span>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <AnimatePresence mode="popLayout">
          {visible.map((scheme, i) => (
            <motion.div key={scheme.id} layout initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }} transition={{ delay:i*0.04 }}>
              <GlassCard className="h-full flex flex-col justify-between group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    {scheme.badge && <span className={"text-[10px] font-semibold rounded-full px-2 py-0.5 " + (scheme.badgeColor || "")}>{scheme.badge}</span>}
                    <span className="text-[10px] text-muted-foreground ml-auto">{scheme.central ? "Central" : "State"}</span>
                  </div>
                  <CardTitle className="text-lg leading-snug group-hover:text-blue-500 transition-colors">{scheme.name}</CardTitle>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                    <IndianRupee className="h-3.5 w-3.5" />{scheme.benefit}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-muted-foreground text-sm flex-1 mb-4 leading-relaxed flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />{scheme.description}
                  </p>
                  <SchemeVideo url={scheme.youtubeLink} title={scheme.name} />
                  <a href={scheme.link} target="_blank" rel="noreferrer" className="mt-3 block">
                    <Button variant="outline" className="w-full group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 transition-all font-semibold">
                      Apply Now <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </a>
                </CardContent>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {visible.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-muted-foreground">Aapki details ke liye koi matching scheme nahi mili.</p>
          <button onClick={reset} className="mt-3 text-sm text-blue-500 hover:underline">Filters clear karein</button>
        </div>
      )}
    </div>
  )
}
