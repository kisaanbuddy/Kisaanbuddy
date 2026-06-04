'use client';

import { FileText, Cpu, Lightbulb, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const STEPS = [
  {
    step: "01",
    icon: FileText,
    title: "Enter Farm Details",
    desc: "Input soil NPK statistics, enter location parameters, or upload a photo of your crop leaf for diagnostic assessments.",
    gradient: "from-emerald-400 to-emerald-600",
  },
  {
    step: "02",
    icon: Cpu,
    title: "AI Analysis",
    desc: "Our localized neural networks and agricultural data layers process your coordinates and inputs to diagnose issues.",
    gradient: "from-teal-400 to-teal-600",
  },
  {
    step: "03",
    icon: Lightbulb,
    title: "Smart Recommendations",
    desc: "Receive exact organic remedies, chemical dosages, crop matches, weather tips, and subsidy eligibility alerts.",
    gradient: "from-amber-400 to-amber-600",
  },
  {
    step: "04",
    icon: TrendingUp,
    title: "Better Yield & Profit",
    desc: "Implement automated recommendations to double soil efficiency, minimize crop loss, and sell at the best mandi rates.",
    gradient: "from-green-400 to-green-600",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-background relative overflow-hidden border-b border-border/20">
      
      {/* Decorative background glow */}
      <div className="absolute bottom-0 right-0 w-[30%] h-[30%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Title */}
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground">
            Simple Process, <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">Powerful Outcomes</span>
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground/80 max-w-md mx-auto leading-relaxed font-semibold">
            Follow four simple steps to fully integrate AI decision support into your daily farming operations.
          </p>
        </div>

        {/* Steps Wrapper */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 relative">
          
          {/* Connecting line (Desktop) */}
          <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-green-500/20 -z-10" />

          {STEPS.map((s, idx) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex flex-col items-center text-center group"
            >
              {/* Icon Container with Badge */}
              <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-card border border-border/40 hover:border-emerald-500/30 shadow-lg group-hover:scale-105 transition-all duration-300">
                <s.icon className="h-6 w-6 text-emerald-500" />
                <span className={`absolute -top-2.5 -right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r ${s.gradient} text-[10px] font-black text-white shadow shadow-emerald-500/10`}>
                  {s.step}
                </span>
              </div>

              <h3 className="text-base font-bold text-foreground font-display mb-2">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs font-medium">{s.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
