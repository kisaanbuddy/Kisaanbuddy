"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  XCircle, CheckCircle2, Sprout, CloudSun, TrendingUp,
  BookOpen, Globe2, Camera, Brain, Lightbulb,
  ArrowRight, Shield, Zap, Users, MessageSquare, Bug,
  ChevronRight, Mic, MicOff, FlaskConical, Landmark, Wheat,
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useLanguage } from "@/lib/language"
import { motion, useInView } from "framer-motion"
import { HardwareShowcase } from "@/components/HardwareShowcase"

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >{children}</motion.div>
  )
}

export default function LandingPage() {
  const { user, ready } = useAuth()
  const router = useRouter()
  const { t, lang } = useLanguage()

  const [isListening, setIsListening] = useState(false)
  const [voiceText, setVoiceText] = useState("")
  const voiceLang = lang === "kn" ? "kn-IN" : lang === "en" ? "en-IN" : "hi-IN"

  useEffect(() => {
    if (ready && user) router.replace("/dashboard")
  }, [ready, user, router])

  const startVoiceDemo = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { setVoiceText(lang === "hi" ? "Aapka browser voice support nahi karta. Chrome use karein." : "Voice not supported. Please use Chrome."); return }
    const rec = new SR()
    rec.lang = voiceLang
    rec.interimResults = true
    rec.onstart = () => { setIsListening(true); setVoiceText("") }
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join("")
      setVoiceText(transcript)
    }
    rec.onend = () => setIsListening(false)
    rec.onerror = () => setIsListening(false)
    rec.start()
  }, [voiceLang, lang])

  const featureIcons = [
    <Bug       className="h-6 w-6 text-red-400" />,
    <Mic       className="h-6 w-6 text-emerald-400" />,
    <TrendingUp className="h-6 w-6 text-amber-400" />,
    <FlaskConical className="h-6 w-6 text-teal-400" />,
    <BookOpen  className="h-6 w-6 text-purple-400" />,
    <CloudSun  className="h-6 w-6 text-sky-400" />,
    <Landmark  className="h-6 w-6 text-indigo-400" />,
    <Wheat     className="h-6 w-6 text-emerald-400" />,
    <Users     className="h-6 w-6 text-pink-400" />,
  ]
  const featureHrefs = ["/disease","/chatbot","/mandi","/soil-health","/khet-diary","/weather","/schemes","/crop-predictor","/worker-connect"]
  
  const featureAccents = [
    "hover:border-red-500/30 hover:shadow-red-950/5 dark:hover:shadow-red-950/20",
    "hover:border-emerald-500/30 hover:shadow-emerald-950/5 dark:hover:shadow-emerald-950/20",
    "hover:border-amber-500/30 hover:shadow-amber-950/5 dark:hover:shadow-amber-950/20",
    "hover:border-teal-500/30 hover:shadow-teal-950/5 dark:hover:shadow-teal-950/20",
    "hover:border-purple-500/30 hover:shadow-purple-950/5 dark:hover:shadow-purple-950/20",
    "hover:border-sky-500/30 hover:shadow-sky-950/5 dark:hover:shadow-sky-950/20",
    "hover:border-indigo-500/30 hover:shadow-indigo-950/5 dark:hover:shadow-indigo-950/20",
    "hover:border-emerald-500/30 hover:shadow-emerald-950/5 dark:hover:shadow-emerald-950/20",
    "hover:border-pink-500/30 hover:shadow-pink-950/5 dark:hover:shadow-pink-950/20",
  ]
  const featureHighlighted = [false, true, false, true, true, false, false, false, false]
  const featureNew = [false, true, false, true, true, false, false, false, false]

  const howIcons = [<Mic className="h-6 w-6 text-white" />, <Brain className="h-6 w-6 text-white" />, <Lightbulb className="h-6 w-6 text-white" />]

  const features = t("features") as Array<{ title: string; body: string }>
  const problems = t("problems") as Array<{ p: string; s: string }>
  const howSteps = t("howSteps") as Array<{ title: string; body: string }>
  const voiceHints = t("voiceHints") as string[]

  return (
    <div className="flex flex-col gap-0 -mt-10 md:-mt-14 -mx-4 md:-mx-8 overflow-x-hidden">

      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-b from-[#040814] via-[#060e22] to-[#040814] border-b border-border/10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#10b981] opacity-[0.06] rounded-full blur-[120px] animate-blob-morph" />
          <div className="absolute bottom-[20%] right-[-10%] w-[55%] h-[55%] bg-[#14b8a6] opacity-[0.05] rounded-full blur-[130px] animate-blob-morph" style={{ animationDelay: '4s' }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.06),transparent_50%)]" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 md:px-12 lg:grid-cols-2 lg:py-32">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 backdrop-blur-md hover:border-emerald-500/30 transition-all select-none">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {t("heroBadge")}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold leading-[1.08] tracking-tight text-white">
              {t("heroTitle1")}
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                {t("heroTitle2")}
              </span>
            </h1>

            <p className="text-sm md:text-base text-muted-foreground/90 max-w-md leading-relaxed">{t("heroSubtitle")}</p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/disease">
                <button className="btn-primary flex items-center gap-2 group">
                  {t("tryNow")} 
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </Link>
              <Link href="/signup">
                <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-glass-shadow active:scale-95">
                  {t("createAccount")}
                </button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-5 pt-3">
              {([
                { icon: Shield, key: "noAccountNeeded" },
                { icon: Zap,    key: "hindiVoiceSupport" },
                { icon: Globe2, key: "multiLang" },
              ] as const).map(({ icon: Icon, key }) => (
                <div key={key} className="flex items-center gap-2 text-xs font-medium text-muted-foreground/80">
                  <Icon className="h-4 w-4 text-emerald-400 shrink-0" />
                  {t(key)}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }} className="relative select-none">
            {/* Glowing border card wrap */}
            <div className="relative rounded-3xl p-1 bg-gradient-to-br from-white/10 to-white/0 dark:from-emerald-500/20 dark:to-teal-500/5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl">
                <Image src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=900&q=80" alt="Healthy crops" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover brightness-[0.85] contrast-[1.05]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040814]/70 via-transparent to-transparent" />
              </div>
            </div>
            
            {/* Float tags */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="absolute -top-3 -right-2 md:-right-4 rounded-2xl glass-panel px-4 py-2.5 shadow-xl border-emerald-500/10">
              <div className="text-2xl font-display font-extrabold text-emerald-500">{t("freeBadge")}</div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{t("freeForever")}</div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="absolute -bottom-4 -left-2 md:-left-4 rounded-2xl glass-panel px-4 py-2.5 shadow-xl border-emerald-500/10">
              <div className="text-xl font-display font-extrabold text-teal-400">9+</div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{t("aiFeatures")}</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.75 }} className="absolute bottom-5 right-5 flex items-center gap-2 rounded-xl bg-[#040814]/85 backdrop-blur-md px-3.5 py-2 text-xs border border-emerald-500/20 text-white font-medium shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              AI Analysis Active
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* VOICE SECTION */}
      <section className="bg-background px-6 md:px-12 py-24 md:py-32 relative border-b border-border/30">
        <div className="mx-auto max-w-5xl">
          <FadeUp className="text-center mb-14">
            <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-500 mb-3">{t("voiceBadge")}</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground">
              {t("voiceTitle1")}<br />
              <span className="text-emerald-500 dark:text-emerald-400 font-black">{t("voiceTitle2")}</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">{t("voiceSubtitle")}</p>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="relative mx-auto max-w-xl rounded-3xl glass-panel p-6 md:p-8 text-center shadow-xl border-emerald-500/10 dark:bg-card/50">
              <div className="flex flex-col items-center gap-5">
                <button onClick={startVoiceDemo} disabled={isListening}
                  className={"relative flex h-24 w-24 items-center justify-center rounded-full transition-all duration-300 shadow-2xl " + (isListening ? "bg-red-500 scale-105 shadow-red-500/20" : "bg-gradient-to-br from-emerald-400 to-emerald-600 hover:scale-105 hover:shadow-glow-primary")}>
                  {isListening && <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-25" />}
                  {isListening ? <MicOff className="h-8 w-8 text-white" /> : <Mic className="h-8 w-8 text-white" />}
                </button>
                <p className="text-xs font-semibold text-muted-foreground">
                  {isListening ? (lang === "hi" ? "Sun raha hoon... bolein" : lang === "kn" ? "Kekuttiddene..." : "Listening...") : t("clickAndSpeak")}
                </p>
                {voiceText && (
                  <div className="w-full rounded-2xl bg-[#040814]/30 border border-emerald-500/15 p-4 text-left shadow-inner backdrop-blur-sm animate-fade-in">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">{t("youSaid")}</p>
                    <p className="text-sm font-semibold text-foreground leading-relaxed">{voiceText}</p>
                    <button onClick={() => router.push("/chatbot?q=" + encodeURIComponent(voiceText.trim()))}
                      className="mt-3 w-full rounded-xl btn-primary font-semibold py-2.5 flex items-center justify-center gap-2 text-xs">
                      {t("askAI")} <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs">
                {voiceHints.map((hint: string) => (
                  <button key={hint} onClick={() => setVoiceText(hint)}
                    className="rounded-xl border border-border/40 bg-background/30 px-3 py-1.5 text-muted-foreground/80 hover:text-foreground hover:bg-muted/40 transition-colors">{hint}</button>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* HARDWARE SHOWCASE */}
      <HardwareShowcase />

      {/* PROBLEMS */}
      <section className="bg-background px-6 md:px-12 py-24 md:py-32 relative border-b border-border/30">
        <div className="mx-auto max-w-6xl">
          <FadeUp className="text-center mb-16">
            <span className="inline-block rounded-full bg-red-500/10 px-4 py-1.5 text-xs font-semibold text-red-500 mb-3">{t("problemBadge")}</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground">{t("problemTitle1")}<br />{t("problemTitle2")}</h2>
          </FadeUp>
          <div className="grid gap-5 md:grid-cols-2">
            {problems.map(({ p, s }, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <div className="rounded-2xl border border-border/40 bg-card/30 p-6 hover:shadow-lg hover:border-border/60 transition-all duration-300 backdrop-blur-sm">
                  <div className="flex items-start gap-3.5 mb-4">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-red-500/10 mt-0.5"><XCircle className="h-4.5 w-4.5 text-red-400" /></div>
                    <p className="font-medium text-xs md:text-sm text-muted-foreground/90 leading-relaxed">{p}</p>
                  </div>
                  <div className="flex items-start gap-3.5 pl-11">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 mt-0.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /></div>
                    <p className="font-bold text-xs md:text-sm text-emerald-500 dark:text-emerald-400 leading-relaxed">{s}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-gradient-to-b from-background via-emerald-500/2 to-background dark:via-emerald-500/2 px-6 md:px-12 py-24 md:py-32 relative border-b border-border/30">
        <div className="pointer-events-none absolute inset-x-0 top-1/4 h-[30%] bg-[#10b981] opacity-[0.015] rounded-full blur-[100px]" />
        <div className="mx-auto max-w-6xl relative z-10">
          <FadeUp className="text-center mb-16">
            <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-500 mb-3">{t("featuresBadge")}</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground">{t("featuresTitle1")}<br />{t("featuresTitle2")}</h2>
          </FadeUp>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ title, body }, i) => (
              <FadeUp key={i} delay={i * 0.05}>
                <Link href={featureHrefs[i]} className="block h-full group">
                  <div className={"h-full rounded-2xl border border-border/40 bg-card/45 backdrop-blur-sm p-6 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between " + featureAccents[i] + (featureHighlighted[i] ? " ring-1 ring-emerald-500/15" : "")}>
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/50 border border-border/30 shadow-inner group-hover:scale-105 transition-transform duration-300">
                          {featureIcons[i]}
                        </div>
                        {featureNew[i] && <span className="rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-bold px-2 py-0.5 select-none">{t("newBadge")}</span>}
                      </div>
                      <h3 className="mb-2 text-base font-display font-bold text-foreground">{title}</h3>
                      <p className="text-xs text-muted-foreground/80 leading-relaxed mb-6">{body}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">{t("useIt")} <ChevronRight className="h-3 w-3" /></span>
                  </div>
                </Link>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative overflow-hidden px-6 md:px-12 py-24 md:py-32 border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-[#051c11] via-[#04100b] to-[#052115]" />
        <div className="absolute inset-0 opacity-[0.015] [background-image:linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:30px_30px]" />
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-emerald-500 opacity-10 rounded-full blur-[100px] animate-pulse-glow" />
        
        <div className="relative z-10 mx-auto max-w-5xl">
          <FadeUp className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white">{t("howTitle")}</h2>
            <p className="mt-3 text-emerald-100/60 text-sm max-w-md mx-auto leading-relaxed">{t("howSubtitle")}</p>
          </FadeUp>
          <div className="grid gap-8 md:grid-cols-3">
            {howSteps.map(({ title, body }, i) => (
              <FadeUp key={i} delay={i * 0.12} className="text-center text-white flex flex-col items-center">
                <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
                  {howIcons[i]}
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white shadow shadow-emerald-500/20">0{i+1}</span>
                </div>
                <h3 className="text-lg font-display font-bold mb-2 text-white">{title}</h3>
                <p className="text-emerald-100/60 text-xs leading-relaxed max-w-xs">{body}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* EARLY ACCESS */}
      <section className="bg-background px-6 md:px-12 py-24 md:py-32 relative">
        <div className="mx-auto max-w-4xl">
          <FadeUp>
            <div className="rounded-3xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/5 to-teal-500/2 p-8 md:p-14 text-center backdrop-blur-sm">
              <div className="text-4xl mb-4 select-none">🌱</div>
              <span className="inline-block rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-3 py-1 mb-4 select-none">{t("betaBadge")}</span>
              <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-4 text-foreground">{t("betaTitle")}</h2>
              <p className="text-muted-foreground/80 text-sm max-w-xl mx-auto mb-8 leading-relaxed">{t("betaSubtitle")}</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/signup">
                  <button className="btn-primary flex items-center gap-2 group">
                    {t("createFreeAccount")} <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </Link>
                <Link href="/disease">
                  <button className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-2.5 text-xs font-semibold text-emerald-500 hover:bg-emerald-500/10 transition-all duration-200">
                    {t("tryWithoutAccount")}
                  </button>
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  )
}
