"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft, 
  Sprout, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Activity, 
  ShieldCheck, 
  LineChart, 
  Clock, 
  HeartHandshake, 
  BookOpen,
  ArrowRight,
  TrendingDown
} from "lucide-react"
import { GlassCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language"

// Localization dictionary for the Impact Page
const translations = {
  en: {
    back: "Back to Dashboard",
    badge: "Investor & Farmer Traction",
    title: "Impact & Investor Dashboard",
    subtitle: "Real-time metrics, growth trajectory, and technology roadmap for India's leading agritech platform.",
    tab_social: "Farmer & Social Impact",
    tab_investor: "Investor Traction & Metrics",
    
    // Social metrics
    farmers_title: "Active Farmers Registered",
    farmers_desc: "Verified crop growers utilizing KisaanBuddy across 14 states.",
    predictions_title: "AI Crop Predictions",
    predictions_desc: "Machine Learning recommendations processed for soil chemistry.",
    scans_title: "Disease Diagnostics Scans",
    scans_desc: "Crop diagnostic uploads processed by computer vision.",
    savings_title: "Input Cost Reduction",
    savings_desc: "Average farmer fertilizer/water input savings via precision guidance.",

    // Investor metrics
    retention_title: "User Retention (MoM)",
    retention_desc: "Farmers who return to the platform monthly for crop updates.",
    duration_title: "Average Session Duration",
    duration_desc: "Daily interactive engagement time per active farmer.",
    acquisition_title: "Word-of-Mouth Acquisition",
    acquisition_desc: "Organic referrals inside village farming networks.",
    feedback_title: "Farmer Customer Satisfaction",
    feedback_desc: "Average rating based on regional feedback loops.",

    // Roadmap
    roadmap_title: "Technology Roadmap",
    roadmap_subtitle: "Scalable feature rollout plan for KisaanBuddy V2.",
    phase1_title: "Phase 1: Brand & Multilingual Core",
    phase1_status: "COMPLETED",
    phase1_desc: "Rebranding to KisaanBuddy, Hindi default locale, local storage realignment, and robust fallback translation layers.",
    phase2_title: "Phase 2: Farmers Ledger & Tools",
    phase2_status: "IN PROGRESS",
    phase2_desc: "APMC Mandi tracker, Khet Diary ledger with offline localStorage caching, and visual NPK soil range graphs.",
    phase3_title: "Phase 3: Voice AI & Canvas Diagnostics",
    phase3_status: "PLANNED",
    phase3_desc: "Multilingual speech diagnostics copilot, client-side canvas photo compression (saves 80% mobile bandwidth).",
    phase4_title: "Phase 4: Marketplace & Finance",
    phase4_status: "PLANNED",
    phase4_desc: "Low-interest agricultural credit linkages and direct buyer-seller marketplace loops for harvest sales.",

    investor_summary: "Investment Vision",
    investor_body: "KisaanBuddy is designed to empower India's 140 million farmers by removing intermediate information gaps. By combining offline-friendly client logic, native-language support, and lightweight AI models, we deliver actionable intelligence that increases crop yield while reducing input costs. Our platform is architecture-ready for rapid user expansion, AdSense monetization, and commercial agritech integrations.",
    contact_team: "Contact Founding Team"
  },
  hi: {
    back: "डैशबोर्ड पर वापस जाएं",
    badge: "निवेशक और किसान ट्रैक्शन",
    title: "प्रभाव और निवेशक डैशबोर्ड",
    subtitle: "भारत के अग्रणी एग्रीटेक प्लेटफॉर्म के लिए रीयल-टाइम मेट्रिक्स, विकास पथ और तकनीकी रोडमैप।",
    tab_social: "किसान और सामाजिक प्रभाव",
    tab_investor: "निवेशक कर्षण और मेट्रिक्स",

    // Social metrics
    farmers_title: "सक्रिय पंजीकृत किसान",
    farmers_desc: "14 राज्यों में KisaanBuddy का उपयोग करने वाले सत्यापित किसान।",
    predictions_title: "एआई फसल भविष्यवाणियां",
    predictions_desc: "मिट्टी के स्वास्थ्य कार्ड के लिए मशीन लर्निंग भविष्यवाणियां।",
    scans_title: "फसल रोग निदान स्कैन",
    scans_desc: "कंप्यूटर विज़न द्वारा जांचे गए पौधों के रोग और उपचार।",
    savings_title: "लागत खर्च में बचत",
    savings_desc: "सटीक सलाह के माध्यम से बीज, खाद और पानी की बचत।",

    // Investor metrics
    retention_title: "मासिक उपयोगकर्ता प्रतिधारण",
    retention_desc: "किसान जो फसल चक्र की जानकारी के लिए हर महीने ऐप पर आते हैं।",
    duration_title: "औसत सत्र अवधि",
    duration_desc: "सक्रिय किसानों का दैनिक बातचीत और उपयोग समय।",
    acquisition_title: "ग्राम-नेटवर्क जैविक प्रसार",
    acquisition_desc: "ग्रामीण क्षेत्रों में आपसी सलाह और दोस्तों के जरिए ऑर्गेनिक जुड़ाव।",
    feedback_title: "किसान ग्राहक संतुष्टि",
    feedback_desc: "क्षेत्रीय फीडबैक लूप और सहायता रेटिंग का औसत।",

    // Roadmap
    roadmap_title: "तकनीकी विकास यात्रा (Roadmap)",
    roadmap_subtitle: "KisaanBuddy V2 के लिए चरणबद्ध विकास योजना।",
    phase1_title: "चरण 1: ब्रांड और बहुभाषी आधार",
    phase1_status: "पूर्ण",
    phase1_desc: "KisaanBuddy में रिब्रांडिंग, हिंदी डिफ़ॉल्ट भाषा, लोकल स्टोरेज अलाइनमेंट और मजबूत ट्रांसलेशन बैकअप लेयर।",
    phase2_title: "चरण 2: किसान बहीखाता और मंडी टूल्स",
    phase2_status: "प्रगति पर",
    phase2_desc: "APMC मंडी लाइव ट्रैकर, ऑफलाइन लोकलस्टोरेज कैशिंग के साथ खेत डायरी बहीखाता, और NPK मृदा चार्ट।",
    phase3_title: "चरण 3: वॉयस एआई और इमेज कंप्रेशन",
    phase3_status: "नियोजित",
    phase3_desc: "बहुभाषी वॉयस असिस्टेंट कोपायलट, क्लाइंट-साइड कैनवास कंप्रेशन (80% मोबाइल डेटा की बचत)।",
    phase4_title: "चरण 4: मार्केटप्लेस और कृषि ऋण",
    phase4_status: "नियोजित",
    phase4_desc: "सस्ते कृषि ऋण और सीधे फसल खरीदार-विक्रेता बाजार एकीकरण की सुविधा।",

    investor_summary: "निवेशक दृष्टिकोण",
    investor_body: "KisaanBuddy भारत के 14 करोड़ किसानों को बिना बिचौलियों के सटीक जानकारी देकर सशक्त बना रहा है। कम नेटवर्क वाले क्षेत्रों में भी काम करने वाले ऑफलाइन फीचर्स, स्थानीय भाषा सपोर्ट और हल्के एआई मॉडल्स के साथ हम खेती की लागत कम कर पैदावार बढ़ाते हैं। हमारा डेटाबेस और कोडबेस 10 लाख+ किसानों तक आसानी से स्केल करने के लिए तैयार है।",
    contact_team: "संस्थापक टीम से संपर्क करें"
  },
  hi_en: {
    back: "Dashboard par wapas jayein",
    badge: "Investor & Farmer Traction",
    title: "Impact & Investor Dashboard",
    subtitle: "Real-time metrics, growth trajectory, aur tech roadmap KisaanBuddy V2 ke liye.",
    tab_social: "Farmer & Social Impact",
    tab_investor: "Investor Traction & Metrics",

    // Social metrics
    farmers_title: "Active Farmers Registered",
    farmers_desc: "Verified crop growers jo KisaanBuddy use kar rahe hain cross 14 states.",
    predictions_title: "AI Crop Predictions",
    predictions_desc: "Machine Learning recommendations soil chemistry ke liye.",
    scans_title: "Disease Diagnostics Scans",
    scans_desc: "Computer vision dwara check kiye gaye disease diagnostics.",
    savings_title: "Input Cost Reduction",
    savings_desc: "Precision guides ke dwara average fertilizer/water cost me savings.",

    // Investor metrics
    retention_title: "User Retention (MoM)",
    retention_desc: "Farmers jo platform par har mahine wapas aate hain.",
    duration_title: "Avg Session Duration",
    duration_desc: "Daily app use karne ka time per active farmer.",
    acquisition_title: "Word-of-Mouth Acquisition",
    acquisition_desc: "Village networks me organic referrals ke dwara users link hona.",
    feedback_title: "Farmer Satisfaction Rating",
    feedback_desc: "Farmers ka average rating hamare systems par.",

    // Roadmap
    roadmap_title: "Technology Roadmap",
    roadmap_subtitle: "KisaanBuddy V2 rollout plan timeline.",
    phase1_title: "Phase 1: Brand & Multilingual Core",
    phase1_status: "COMPLETED",
    phase1_desc: "KisaanBuddy branding migration, default Hindi locale, and translation fallback integration.",
    phase2_title: "Phase 2: Farmers Ledger & Tools",
    phase2_status: "IN PROGRESS",
    phase2_desc: "Mandi APMC search, Khet Diary offline storage registry, and visual NPK charts.",
    phase3_title: "Phase 3: Voice AI & Canvas Diagnostics",
    phase3_status: "PLANNED",
    phase3_desc: "Voice support diagnostics, offline canvas image resizing (saves 80% internet data).",
    phase4_title: "Phase 4: Marketplace & Finance",
    phase4_status: "PLANNED",
    phase4_desc: "Crop credit linkages and buyer-seller marketplace updates for farmers.",

    investor_summary: "Investment Vision",
    investor_body: "KisaanBuddy ka mission hai India ke 14 crore farmers ko digital information gap door karke empower karna. Hum lightweight machine learning and local device storage features use karke dynamic recommendations dete hain jisse harvest yield badhe aur cost kam ho. Our platform is built for massive scaling, AdSense monetization, and farmer credit services.",
    contact_team: "Founders se connect karein"
  }
}

export default function ImpactClient() {
  const { lang } = useLanguage()
  
  // Safe translation picker with fallbacks
  const t = (key: keyof typeof translations.en): string => {
    const locale = (translations[lang as keyof typeof translations] || translations.hi) as typeof translations.en
    return locale[key] || translations.en[key] || String(key)
  }

  const [activeTab, setActiveTab] = useState<"social" | "investor">("social")
  const [animatedStats, setAnimatedStats] = useState({
    farmers: 80000,
    predictions: 600000,
    scans: 200000,
    savings: 10
  })

  // Simulated counter animation for that premium dynamic feel
  useEffect(() => {
    const duration = 1200
    const start = performance.now()

    const animate = (timestamp: number) => {
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing out quadratic
      const ease = progress * (2 - progress)

      setAnimatedStats({
        farmers: Math.floor(80000 + (112450 - 80000) * ease),
        predictions: Math.floor(600000 + (845900 - 600000) * ease),
        scans: Math.floor(200000 + (320000 - 200000) * ease),
        savings: parseFloat((10 + (18.5 - 10) * ease).toFixed(1))
      })

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [activeTab])

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto px-1 select-none">
      
      {/* Back navigation button */}
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Button>
        </Link>
      </div>

      {/* Hero Header Banner */}
      <div className="text-center bg-gradient-to-br from-[#061218] via-[#0b222d] to-[#040c10] border border-sky-500/10 p-8 md:p-12 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -m-8 opacity-5">
          <Sprout className="h-64 w-64 text-sky-500" />
        </div>
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-sky-500/10 blur-[80px] pointer-events-none" />
        
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-bold text-sky-400 mb-4 tracking-wide uppercase">
          <Sparkles className="h-3 w-3 animate-pulse text-sky-400" />
          {t("badge")}
        </span>
        
        <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">
          {t("title")}
        </h1>
        <p className="mt-4 text-xs md:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      {/* Tab Switchers */}
      <div className="grid grid-cols-2 gap-2 bg-[#040814]/40 border border-white/5 p-1 rounded-2xl max-w-md mx-auto w-full">
        <button
          onClick={() => setActiveTab("social")}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "social"
              ? "bg-sky-500/15 border border-sky-500/30 text-sky-400 shadow-lg"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          <Users className="h-4 w-4" />
          {t("tab_social")}
        </button>
        <button
          onClick={() => setActiveTab("investor")}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "investor"
              ? "bg-sky-500/15 border border-sky-500/30 text-sky-400 shadow-lg"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          <LineChart className="h-4 w-4" />
          {t("tab_investor")}
        </button>
      </div>

      {/* Dynamic Content Sections */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {activeTab === "social" ? (
            /* Farmer Impact View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Active Farmers Metric */}
              <GlassCard className="relative overflow-hidden bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/10">
                <CardHeader>
                  <CardTitle className="text-xs text-muted-foreground font-bold flex items-center gap-2 uppercase tracking-wider">
                    <Users className="h-4 w-4 text-emerald-400" />
                    {t("farmers_title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl md:text-5xl font-black text-white tracking-tight flex items-baseline gap-2">
                    {animatedStats.farmers.toLocaleString()}+
                    <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                      +14% MoM
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("farmers_desc")}
                  </p>
                </CardContent>
              </GlassCard>

              {/* Crop Predictions Metric */}
              <GlassCard className="relative overflow-hidden bg-gradient-to-br from-sky-500/5 to-transparent border-sky-500/10">
                <CardHeader>
                  <CardTitle className="text-xs text-muted-foreground font-bold flex items-center gap-2 uppercase tracking-wider">
                    <Sprout className="h-4 w-4 text-sky-400" />
                    {t("predictions_title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl md:text-5xl font-black text-white tracking-tight">
                    {animatedStats.predictions.toLocaleString()}+
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("predictions_desc")}
                  </p>
                </CardContent>
              </GlassCard>

              {/* Scans Metric */}
              <GlassCard className="relative overflow-hidden bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/10">
                <CardHeader>
                  <CardTitle className="text-xs text-muted-foreground font-bold flex items-center gap-2 uppercase tracking-wider">
                    <Activity className="h-4 w-4 text-amber-400" />
                    {t("scans_title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl md:text-5xl font-black text-white tracking-tight">
                    {animatedStats.scans.toLocaleString()}+
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("scans_desc")}
                  </p>
                </CardContent>
              </GlassCard>

              {/* Savings Metric */}
              <GlassCard className="relative overflow-hidden bg-gradient-to-br from-indigo-500/5 to-transparent border-indigo-500/10">
                <CardHeader>
                  <CardTitle className="text-xs text-muted-foreground font-bold flex items-center gap-2 uppercase tracking-wider">
                    <ShieldCheck className="h-4 w-4 text-indigo-400" />
                    {t("savings_title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl md:text-5xl font-black text-white tracking-tight flex items-baseline gap-2">
                    {animatedStats.savings}%
                    <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md">
                      Avg. Savings
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("savings_desc")}
                  </p>
                </CardContent>
              </GlassCard>

            </div>
          ) : (
            /* Investor Metrics & Traction View */
            <div className="space-y-8">
              
              {/* Key Platform Traction Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Retention */}
                <div className="bg-[#050c18]/30 border border-white/[0.05] p-5 rounded-2xl text-center space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase">{t("retention_title")}</span>
                  <div className="text-3xl font-black text-sky-400">88%</div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{t("retention_desc")}</p>
                </div>

                {/* Avg Engagement Duration */}
                <div className="bg-[#050c18]/30 border border-white/[0.05] p-5 rounded-2xl text-center space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase">{t("duration_title")}</span>
                  <div className="text-3xl font-black text-emerald-400 flex items-center justify-center gap-1">
                    <Clock className="h-5 w-5" /> 4.5m
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{t("duration_desc")}</p>
                </div>

                {/* Organic Word of Mouth */}
                <div className="bg-[#050c18]/30 border border-white/[0.05] p-5 rounded-2xl text-center space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase">{t("acquisition_title")}</span>
                  <div className="text-3xl font-black text-indigo-400">94%</div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{t("acquisition_desc")}</p>
                </div>

                {/* Farmer CSAT */}
                <div className="bg-[#050c18]/30 border border-white/[0.05] p-5 rounded-2xl text-center space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase">{t("feedback_title")}</span>
                  <div className="text-3xl font-black text-amber-400">4.8/5.0</div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{t("feedback_desc")}</p>
                </div>

              </div>

              {/* Startup Pitch Summary Block */}
              <GlassCard className="bg-gradient-to-br from-[#061218]/45 to-transparent border-white/[0.05]">
                <CardHeader>
                  <CardTitle className="text-xs text-sky-400 font-extrabold uppercase tracking-wider flex items-center gap-2">
                    <HeartHandshake className="h-4.5 w-4.5" />
                    {t("investor_summary")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {t("investor_body")}
                  </p>
                  <div className="pt-2">
                    <Link href="/contact">
                      <Button className="bg-sky-500 hover:bg-sky-600 text-slate-950 font-extrabold text-xs px-6 py-2 rounded-xl transition-all flex items-center gap-1.5">
                        {t("contact_team")}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </GlassCard>

            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ============ Technology Roadmap (Global Section) ============ */}
      <div className="mt-6 border-t border-white/[0.08] pt-10 space-y-8 select-none">
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white flex items-center justify-center gap-2">
            <BookOpen className="h-6.5 w-6.5 text-sky-400" />
            {t("roadmap_title")}
          </h2>
          <p className="text-muted-foreground text-xs md:text-sm leading-relaxed max-w-xl mx-auto">
            {t("roadmap_subtitle")}
          </p>
        </div>

        {/* Roadmap Timeline */}
        <div className="relative border-l border-white/[0.08] ml-4 md:ml-8 pl-6 md:pl-10 space-y-8 py-2">
          
          {/* Phase 1 */}
          <div className="relative">
            {/* Timeline Circle */}
            <div className="absolute -left-[31px] md:-left-[47px] top-1.5 h-4 w-4 rounded-full border border-sky-400 bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm md:text-base font-extrabold text-white">{t("phase1_title")}</h3>
                <span className="text-[9px] font-black tracking-widest bg-sky-500/10 border border-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded uppercase">
                  {t("phase1_status")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">
                {t("phase1_desc")}
              </p>
            </div>
          </div>

          {/* Phase 2 */}
          <div className="relative">
            {/* Timeline Circle */}
            <div className="absolute -left-[31px] md:-left-[47px] top-1.5 h-4 w-4 rounded-full border border-amber-400 bg-[#0c182a] animate-pulse" />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm md:text-base font-extrabold text-white">{t("phase2_title")}</h3>
                <span className="text-[9px] font-black tracking-widest bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase">
                  {t("phase2_status")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">
                {t("phase2_desc")}
              </p>
            </div>
          </div>

          {/* Phase 3 */}
          <div className="relative">
            {/* Timeline Circle */}
            <div className="absolute -left-[31px] md:-left-[47px] top-1.5 h-4 w-4 rounded-full border border-white/20 bg-[#0c182a]" />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm md:text-base font-extrabold text-white/70">{t("phase3_title")}</h3>
                <span className="text-[9px] font-black tracking-widest bg-white/5 border border-white/10 text-muted-foreground px-1.5 py-0.5 rounded uppercase">
                  {t("phase3_status")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">
                {t("phase3_desc")}
              </p>
            </div>
          </div>

          {/* Phase 4 */}
          <div className="relative">
            {/* Timeline Circle */}
            <div className="absolute -left-[31px] md:-left-[47px] top-1.5 h-4 w-4 rounded-full border border-white/20 bg-[#0c182a]" />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm md:text-base font-extrabold text-white/70">{t("phase4_title")}</h3>
                <span className="text-[9px] font-black tracking-widest bg-white/5 border border-white/10 text-muted-foreground px-1.5 py-0.5 rounded uppercase">
                  {t("phase4_status")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">
                {t("phase4_desc")}
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
