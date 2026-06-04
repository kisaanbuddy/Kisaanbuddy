'use client';

import Link from 'next/link';
import { Sprout, Bug, CloudSun, TrendingUp, Landmark, MessageSquare, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const FEATURES = [
  {
    icon: Sprout,
    title: "Crop Prediction",
    desc: "Leverage soil chemistry (NPK, pH, OC) and hyperlocal weather forecasts to determine the absolute best crop choice for your upcoming cycle.",
    href: "/crop-predictor",
    accent: "hover:border-emerald-500/30 hover:shadow-emerald-950/5 dark:hover:shadow-emerald-950/20",
    color: "text-emerald-500 bg-emerald-500/10",
  },
  {
    icon: Bug,
    title: "Disease Detection",
    desc: "Take a picture of infected plant leaves. Our neural network scans and diagnoses diseases instantly, delivering immediate organic and chemical cures.",
    href: "/disease",
    accent: "hover:border-red-500/30 hover:shadow-red-950/5 dark:hover:shadow-red-950/20",
    color: "text-red-500 bg-red-500/10",
  },
  {
    icon: CloudSun,
    title: "Weather Intelligence",
    desc: "Real-time, hyper-local farm conditions with crop-specific recommendations and alerts for heavy precipitation or temperature anomalies.",
    href: "/weather",
    accent: "hover:border-sky-500/30 hover:shadow-sky-950/5 dark:hover:shadow-sky-950/20",
    color: "text-sky-500 bg-sky-500/10",
  },
  {
    icon: TrendingUp,
    title: "Market Price Analysis",
    desc: "Review daily APMC mandi rates across India. Monitor crop price trends and configure personalized target price notifications.",
    href: "/mandi",
    accent: "hover:border-amber-500/30 hover:shadow-amber-950/5 dark:hover:shadow-amber-950/20",
    color: "text-amber-500 bg-amber-500/10",
  },
  {
    icon: Landmark,
    title: "Government Schemes",
    desc: "Identify eligibility guidelines for schemes (PM-Kisan, PMFBY, KCC). Apply directly through verified government portals.",
    href: "/schemes",
    accent: "hover:border-indigo-500/30 hover:shadow-indigo-950/5 dark:hover:shadow-indigo-950/20",
    color: "text-indigo-500 bg-indigo-500/10",
  },
  {
    icon: MessageSquare,
    title: "AI Farming Assistant",
    desc: "Ask agricultural queries or request advice in English, Hindi, and Kannada. Voice commands enabled for hands-free operations.",
    href: "/chatbot",
    accent: "hover:border-teal-500/30 hover:shadow-teal-950/5 dark:hover:shadow-teal-950/20",
    color: "text-teal-500 bg-teal-500/10",
  },
];

export function Features() {
  return (
    <section className="py-20 bg-muted/10 relative border-b border-border/20">
      
      {/* Visual Accents */}
      <div className="absolute inset-x-0 top-1/4 h-[30%] bg-[#10b981] opacity-[0.01] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Title Block */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            Platform Intelligence
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground">
            Everything a Farmer Needs,<br />
            <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
              All in One Unified Platform
            </span>
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground/80 max-w-lg mx-auto leading-relaxed font-semibold">
            Cut down hours of searching. Access highly accurate agricultural metrics and machine learning services instantly.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Link href={f.href} className="block h-full group">
                <div className={`h-full rounded-2xl border border-border/40 bg-card/45 backdrop-blur-sm p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer ${f.accent}`}>
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border border-border/30 shadow-inner group-hover:scale-105 transition-transform duration-300 ${f.color}`}>
                        <f.icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-bold px-2 py-0.5 select-none opacity-0 group-hover:opacity-100 transition-opacity">
                        Launch Tool
                      </span>
                    </div>
                    <h3 className="mb-2 text-base font-display font-bold text-foreground">{f.title}</h3>
                    <p className="text-xs text-muted-foreground/85 leading-relaxed mb-6 font-medium">{f.desc}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform mt-auto">
                    Try Now <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
