'use client';

import { useLanguage } from '@/lib/language';
import { CloudSun, TrendingUp, Bug, FlaskConical, MessageSquare, Landmark, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const FEATURE_METADATA = [
  {
    icon: CloudSun,
    href: "/weather",
    index: 5, // Weather Alert
    accent: "hover:border-primary/40 hover:shadow-primary/5 dark:hover:shadow-primary/20",
    color: "text-primary bg-primary/10",
  },
  {
    icon: TrendingUp,
    href: "/mandi",
    index: 2, // Live Mandi Prices
    accent: "hover:border-primary/40 hover:shadow-primary/5 dark:hover:shadow-primary/20",
    color: "text-primary bg-primary/10",
  },
  {
    icon: Bug,
    href: "/disease",
    index: 0, // Crop Disease AI
    accent: "hover:border-[#2ECC71]/40 hover:shadow-[#2ECC71]/5 dark:hover:shadow-[#2ECC71]/20",
    color: "text-[#2ECC71] bg-[#2ECC71]/10",
  },
  {
    icon: FlaskConical,
    href: "/soil-health",
    index: 3, // Soil Health AI
    accent: "hover:border-primary/40 hover:shadow-primary/5 dark:hover:shadow-primary/20",
    color: "text-primary bg-primary/10",
  },
  {
    icon: MessageSquare,
    href: "/chatbot",
    index: 1, // Hindi Voice AI
    accent: "hover:border-[#2ECC71]/40 hover:shadow-[#2ECC71]/5 dark:hover:shadow-[#2ECC71]/20",
    color: "text-[#2ECC71] bg-[#2ECC71]/10",
  },
  {
    icon: Landmark,
    href: "/schemes",
    index: 6, // Govt Schemes
    accent: "hover:border-primary/40 hover:shadow-primary/5 dark:hover:shadow-primary/20",
    color: "text-primary bg-primary/10",
  },
];

import Link from 'next/link';

export function Features() {
  const { t, lang } = useLanguage();
  const featuresList = (t("features") || []) as { title: string; body: string }[];

  return (
    <section id="features" className="py-20 bg-muted/10 relative border-b border-border/20">
      
      {/* Visual Accents */}
      <div className="absolute inset-x-0 top-1/4 h-[30%] bg-[#10b981] opacity-[0.01] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Title Block */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {t("featuresBadge")}
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground">
            {t("featuresTitle1")}<br />
            <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
              {t("featuresTitle2")}
            </span>
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground/80 max-w-lg mx-auto leading-relaxed font-semibold">
            {t("landing_features.access_highly_accurate_agricultural")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_METADATA.map((f, i) => {
            const translation = featuresList[f.index] || { title: "", body: "" };
            return (
              <motion.div
                key={f.index}
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
                          {t("landing_features.launch_tool")}
                        </span>
                      </div>
                      <h3 className="mb-2 text-base font-display font-bold text-foreground">{translation.title}</h3>
                      <p className="text-xs text-muted-foreground/85 leading-relaxed mb-6 font-medium">{translation.body}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform mt-auto">
                      {t("landing_features.try_now")} <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
