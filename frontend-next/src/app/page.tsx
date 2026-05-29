"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  XCircle, CheckCircle2, Sprout, CloudSun, TrendingUp,
  BookOpen, Globe2, Camera, Brain, Lightbulb,
  ArrowRight, Shield, Zap, Users, MessageSquare, Bug,
  ChevronRight, Mic, MicOff, FlaskConical, Landmark,
  Wheat,
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { motion, useInView } from "framer-motion"

/* ── Section animation wrapper ─────────────────────── */
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════ */
export default function LandingPage() {
  const { user, ready } = useAuth()
  const router = useRouter()

  const [isListening, setIsListening] = useState(false)
  const [voiceText, setVoiceText] = useState("")
  const [voiceLang, setVoiceLang] = useState<"hi-IN" | "en-IN">("hi-IN")
  const [voiceSent, setVoiceSent] = useState(false)

  useEffect(() => {
    if (ready && user) router.replace("/dashboard")
  }, [ready, user, router])

  const startVoiceDemo = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      setVoiceText("Aapka browser voice support nahi karta. Chrome use karein.")
      return
    }
    const rec = new SR()
    rec.lang = voiceLang
    rec.interimResults = true
    rec.maxAlternatives = 1

    rec.onstart = () => { setIsListening(true); setVoiceText(""); setVoiceSent(false) }
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join("")
      setVoiceText(transcript)
    }
    rec.onend = () => {
      setIsListening(false)
    }
    rec.onerror = () => setIsListening(false)
    rec.start()
  }, [voiceLang])

  const sendToChat = () => {
    if (!voiceText.trim()) return
    setVoiceSent(true)
    router.push("/chatbot?q=" + encodeURIComponent(voiceText.trim()))
  }

  return (
    <div className="flex flex-col gap-0 -mt-12 md:-mt-16 -mx-4 md:-mx-8 overflow-x-hidden">

      {/* ═══════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden
        bg-gradient-to-br from-emerald-950/60 via-[#030e07] to-emerald-950/40">
        {/* Background layers */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(34,197,94,0.25),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_70%,rgba(20,184,166,0.15),transparent)]" />
          <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:60px_60px]" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 md:px-12 lg:grid-cols-2 lg:py-24">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-semibold text-green-400 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Early Access - Bilkul Free
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight text-white">
              Apni Kheti,
              <br />
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                AI Ki Shakti
              </span>
            </h1>

            <p className="text-lg text-white/60 max-w-md leading-relaxed">
              Fasal ki bimari pakdein, mandi bhav jaanein, soil test karein — sab Hindi mein, sirf ek mic click pe.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/disease">
                <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-green-500/30 transition-all hover:scale-105 hover:shadow-green-500/40 active:scale-95">
                  Abhi Try Karein <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/signup">
                <button className="flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15">
                  Free Account Banao
                </button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-5 pt-2">
              {[
                { icon: Shield, text: "Account zaruri nahi" },
                { icon: Zap,    text: "Hindi Voice Support" },
                { icon: Globe2, text: "Hindi - English - Kannada" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-white/60">
                  <Icon className="h-4 w-4 text-green-400 shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — image card */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10">
              <Image
                src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=900&q=80"
                alt="Healthy crops"
                fill priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Floating badge - real claim */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -top-4 -right-2 md:-right-6 rounded-2xl bg-white/95 dark:bg-slate-800/95 px-5 py-3 shadow-2xl backdrop-blur-sm"
            >
              <div className="text-3xl font-extrabold text-green-600">Free</div>
              <div className="text-xs font-medium text-muted-foreground">Hamesha ke liye</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="absolute -bottom-4 -left-2 md:-left-6 rounded-2xl bg-white/95 dark:bg-slate-800/95 px-5 py-3 shadow-2xl backdrop-blur-sm"
            >
              <div className="text-2xl font-extrabold text-blue-600">9+</div>
              <div className="text-xs font-medium text-muted-foreground">AI Features</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.75 }}
              className="absolute bottom-6 right-4 flex items-center gap-2 rounded-xl bg-black/60 backdrop-blur-md px-3 py-2 text-xs text-white"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              AI Analysis Active
            </motion.div>
          </motion.div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ═══════════════════════════════════════════
          VOICE FEATURE — MAIN HIGHLIGHT
      ═══════════════════════════════════════════ */}
      <section className="bg-background px-6 md:px-12 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <FadeUp className="text-center mb-12">
            <span className="inline-block rounded-full bg-green-500/10 px-4 py-1.5 text-xs font-semibold text-green-600 mb-4">
              Naya Feature
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Hindi mein bolein,
              <br />
              <span className="text-green-600 dark:text-green-400">AI turant jawab dega</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-base max-w-xl mx-auto">
              Type karne ki zarurat nahi. Bas mic dabao aur apni fasal ki samasya batao — AI Hindi mein samajhta hai.
            </p>
          </FadeUp>

          {/* Voice Demo Widget */}
          <FadeUp delay={0.1}>
            <div className="relative mx-auto max-w-2xl rounded-3xl border border-green-500/20 bg-gradient-to-br from-green-50/80 to-emerald-50/40 dark:from-green-950/30 dark:to-emerald-950/20 p-8 text-center shadow-xl">
              {/* Language Toggle */}
              <div className="flex justify-center gap-2 mb-8">
                {(["hi-IN", "en-IN"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setVoiceLang(lang)}
                    className={"px-4 py-1.5 rounded-full text-sm font-semibold transition-all " +
                      (voiceLang === lang
                        ? "bg-green-500 text-white shadow-md"
                        : "border border-green-500/30 text-green-700 dark:text-green-400 hover:bg-green-500/10")}
                  >
                    {lang === "hi-IN" ? "हिंदी" : "English"}
                  </button>
                ))}
              </div>

              {/* Mic Button */}
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={startVoiceDemo}
                  disabled={isListening}
                  className={"relative flex h-28 w-28 items-center justify-center rounded-full transition-all shadow-2xl " +
                    (isListening
                      ? "bg-red-500 scale-110 shadow-red-500/40"
                      : "bg-gradient-to-br from-green-500 to-emerald-600 hover:scale-105 shadow-green-500/30")}
                >
                  {isListening && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-30" />
                  )}
                  {isListening
                    ? <MicOff className="h-10 w-10 text-white" />
                    : <Mic className="h-10 w-10 text-white" />
                  }
                </button>

                <p className="text-sm font-medium text-muted-foreground">
                  {isListening
                    ? "Sun raha hoon... bolein"
                    : voiceLang === "hi-IN"
                      ? "Yahan click karein aur bolein: 'mere gehun ke patte peele ho rahe hain'"
                      : "Click and say: 'my wheat leaves are turning yellow'"}
                </p>

                {voiceText && (
                  <div className="w-full rounded-2xl bg-white dark:bg-slate-800/80 border border-green-500/20 p-4 text-left shadow-sm">
                    <p className="text-xs text-muted-foreground mb-1 font-medium">Aapne kaha:</p>
                    <p className="text-base font-semibold text-foreground">{voiceText}</p>
                    <button
                      onClick={sendToChat}
                      className="mt-3 w-full rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold py-2 flex items-center justify-center gap-2 text-sm"
                    >
                      AI se poochho <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                {["mere tamatar mein kaale dhabe hain", "aaj mandi mein aloo ka bhav kya hai", "gehun ke liye kaunsi khad daalein"].map((hint) => (
                  <button
                    key={hint}
                    onClick={() => setVoiceText(hint)}
                    className="rounded-full border border-border px-3 py-1 hover:bg-muted/60 transition-colors"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PROBLEMS WE SOLVE
      ═══════════════════════════════════════════ */}
      <section className="bg-background px-6 md:px-12 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <FadeUp className="text-center mb-14">
            <span className="inline-block rounded-full bg-red-500/10 px-4 py-1.5 text-xs font-semibold text-red-500 mb-4">
              Kisan ki Takleef
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Ye problems har kisan
              <br />roz face karta hai
            </h2>
          </FadeUp>

          <div className="grid gap-5 md:grid-cols-2">
            {[
              { problem: "Fasal ki bimari samay par pakd nahi aati",       solution: "Photo lo — AI 2 second mein diagnose karega"    },
              { problem: "Mandi mein sahi bhav nahi milta",                 solution: "Live mandi rates + sahi time par becho"         },
              { problem: "Kaunsi khad daalein — kisi ko pata nahi",         solution: "Soil test karein, AI se recommendation lo"      },
              { problem: "Mazdoor dhundhne mein ghante jaate hain",         solution: "Worker Connect se turant mazdoor lo"            },
            ].map(({ problem, solution }, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <div className="rounded-2xl border border-border/60 bg-card/40 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all backdrop-blur-sm">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500/15 mt-0.5">
                      <XCircle className="h-4 w-4 text-red-500" />
                    </div>
                    <p className="font-semibold text-sm text-muted-foreground">{problem}</p>
                  </div>
                  <div className="flex items-start gap-3 pl-10">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    <p className="font-bold text-sm text-green-600 dark:text-green-400">{solution}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ALL FEATURES
      ═══════════════════════════════════════════ */}
      <section className="bg-gradient-to-b from-background via-emerald-50/30 to-background dark:via-emerald-950/15 px-6 md:px-12 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <FadeUp className="text-center mb-14">
            <span className="inline-block rounded-full bg-green-500/10 px-4 py-1.5 text-xs font-semibold text-green-600 mb-4">
              Sab Ek Jagah
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Ek kisan ko jo chahiye,
              <br />sab yahan hai
            </h2>
          </FadeUp>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <Bug       className="h-7 w-7 text-red-500" />,       title: "Fasal Bimari AI",        body: "Photo khicho — AI turant bimari pakdega, organic aur chemical dono treatment batayega",                     href: "/disease",        accent: "border-red-500/20 hover:border-red-500/40" },
              { icon: <Mic       className="h-7 w-7 text-green-500" />,     title: "Hindi Voice AI",         body: "Bolein aur AI sunegi. Hindi, English, Kannada — kisi bhi bhasha mein sawaal poochho",                     href: "/chatbot",        accent: "border-green-500/20 hover:border-green-500/40", highlighted: true, badge: "New" },
              { icon: <TrendingUp className="h-7 w-7 text-orange-500" />,   title: "Live Mandi Bhav",        body: "Aaj ka APMC mandi rate, price alert set karo jab bhav aapki threshold cross kare",                        href: "/mandi",          accent: "border-orange-500/20 hover:border-orange-500/40" },
              { icon: <FlaskConical className="h-7 w-7 text-teal-500" />,   title: "Soil Health AI",         body: "NPK, pH, OC enter karo — AI batayega kaunsi khad kitni daalein, crop-wise recommendation",                href: "/soil-health",    accent: "border-teal-500/20 hover:border-teal-500/40", badge: "New" },
              { icon: <BookOpen  className="h-7 w-7 text-purple-500" />,    title: "Khet Diary",             body: "Har din ki khet activity log karo — photo, weather, notes. Apni kheti ka poora record ek jagah",           href: "/khet-diary",     accent: "border-purple-500/20 hover:border-purple-500/40", badge: "New" },
              { icon: <CloudSun  className="h-7 w-7 text-blue-500" />,      title: "Mausam Alert",           body: "Aapke khet ke liye 7-din ka forecast, fasal-specific advisory. Barsaat se pehle savdhan raho",              href: "/weather",        accent: "border-blue-500/20 hover:border-blue-500/40" },
              { icon: <Landmark  className="h-7 w-7 text-indigo-500" />,    title: "Sarkari Yojnayein",      body: "PM-Kisan, PMFBY, KCC — eligibility check karo aur seedha apply karo. 12+ schemes ek jagah",               href: "/schemes",        accent: "border-indigo-500/20 hover:border-indigo-500/40" },
              { icon: <Wheat     className="h-7 w-7 text-amber-500" />,     title: "Crop Predictor",         body: "Apni mitti, mausam, aur location ke basis par AI batayega kaun si fasal best rahegi agle season mein",     href: "/crop-predictor", accent: "border-amber-500/20 hover:border-amber-500/40" },
              { icon: <Users     className="h-7 w-7 text-pink-500" />,      title: "Worker Connect",         body: "Mazdoor, tractor, harvester — sab nearby workers ek jagah. Call ya WhatsApp pe seedha contact",            href: "/worker-connect", accent: "border-pink-500/20 hover:border-pink-500/40" },
            ].map(({ icon, title, body, href, accent, highlighted, badge }, i) => (
              <FadeUp key={i} delay={i * 0.05}>
                <Link href={href} className="block h-full">
                  <div className={"h-full rounded-2xl border bg-card/50 backdrop-blur-sm p-6 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer " + accent + (highlighted ? " ring-1 ring-green-500/20" : "")}>
                    <div className="mb-3 flex items-center justify-between">
                      {icon}
                      {badge && (
                        <span className="rounded-full bg-green-500/15 text-green-600 dark:text-green-400 text-[10px] font-bold px-2 py-0.5">
                          {badge}
                        </span>
                      )}
                    </div>
                    <h3 className="mb-2 text-lg font-bold">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{body}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                      Use karein <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-6 md:px-12 py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700" />
        <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.3)_1px,transparent_1px)] [background-size:40px_40px]" />

        <div className="relative z-10 mx-auto max-w-5xl">
          <FadeUp className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white">Kaise Kaam Karta Hai?</h2>
            <p className="mt-3 text-emerald-100/70 text-base">3 simple steps — koi technical knowledge nahi chahiye</p>
          </FadeUp>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { num: "01", icon: <Mic className="h-7 w-7" />,        title: "Bolein ya Photo Lo", body: "Hindi mein bolein ya fasal ki photo khicho — dono kaam karte hain"    },
              { num: "02", icon: <Brain className="h-7 w-7" />,       title: "AI Analyse Karta Hai", body: "KrishiAI ka AI aapki baat samajhta hai aur instantly diagnose karta hai" },
              { num: "03", icon: <Lightbulb className="h-7 w-7" />,   title: "Solution Paaiye",    body: "Exact treatment, dose, sarkari yojana — sab Hindi mein milega"          },
            ].map(({ num, icon, title, body }, i) => (
              <FadeUp key={i} delay={i * 0.12} className="text-center text-white">
                <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
                  {icon}
                  <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-black text-green-700 shadow-md">
                    {num}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-emerald-100/70 text-sm leading-relaxed">{body}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          EARLY ACCESS BANNER (replaces fake testimonials)
      ═══════════════════════════════════════════ */}
      <section className="bg-background px-6 md:px-12 py-20 md:py-24">
        <div className="mx-auto max-w-4xl">
          <FadeUp>
            <div className="rounded-3xl border border-dashed border-green-500/40 bg-green-500/5 p-10 md:p-14 text-center">
              <div className="text-5xl mb-4">🌱</div>
              <span className="inline-block rounded-full bg-green-500/15 text-green-600 dark:text-green-400 text-xs font-bold px-4 py-1.5 mb-5">
                Beta Mein Hain
              </span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                Aap humare pehle users mein se ek honge
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
                Hum abhi build kar rahe hain. Aapka feedback hi hamara roadmap hai — features jo aap chahte ho, wahi banayenge.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/signup">
                  <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-green-500/30 transition-all hover:scale-105 active:scale-95">
                    Free Account Banao <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="/disease">
                  <button className="flex items-center gap-2 rounded-full border-2 border-green-500/40 px-8 py-3.5 text-base font-semibold text-green-600 dark:text-green-400 transition-all hover:bg-green-500/5">
                    Bina Account Try Karein
                  </button>
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════ */}
      <footer className="bg-background border-t border-border/50 px-6 md:px-12 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                <Sprout className="h-4 w-4 text-white" />
              </div>
              <span className="font-extrabold text-lg">Krishi<span className="text-green-500">AI</span></span>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground justify-center">
              <Link href="/founders"       className="hover:text-primary transition-colors">Team</Link>
              <Link href="/disease"        className="hover:text-primary transition-colors">Disease Detect</Link>
              <Link href="/mandi"          className="hover:text-primary transition-colors">Mandi Prices</Link>
              <Link href="/chatbot"        className="hover:text-primary transition-colors">AI Chatbot</Link>
              <Link href="/soil-health"    className="hover:text-primary transition-colors">Soil Health</Link>
              <Link href="/khet-diary"     className="hover:text-primary transition-colors">Khet Diary</Link>
              <Link href="/login"          className="hover:text-primary transition-colors">Login</Link>
            </div>
          </div>
          <div className="divider-gradient mb-6" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} KrishiAI &middot; Empowering Indian farmers with AI
            </p>
            <p className="text-xs text-muted-foreground">Made with love in India</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
