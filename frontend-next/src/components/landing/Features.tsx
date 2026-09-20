'use client';

import { useLanguage } from '@/lib/language';
import { 
  CloudSun, TrendingUp, Bug, FlaskConical, 
  MessageSquare, Landmark, ArrowRight, Sparkles 
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const FEATURE_METADATA = [
  {
    icon: Bug,
    href: "/disease",
    index: 0, // Crop Disease AI
    tag: "Computer Vision",
    accent: "hover:border-rose-500/40 hover:shadow-rose-500/5",
    topGradient: "from-rose-500 to-red-600",
    color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/25",
  },
  {
    icon: TrendingUp,
    href: "/mandi",
    index: 2, // Live Mandi Prices
    tag: "eNAM 1,000+ Mandis",
    accent: "hover:border-amber-500/40 hover:shadow-amber-500/5",
    topGradient: "from-amber-500 to-orange-500",
    color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25",
  },
  {
    icon: CloudSun,
    href: "/weather",
    index: 5, // Weather Alert
    tag: "Hyperlocal Radar",
    accent: "hover:border-sky-500/40 hover:shadow-sky-500/5",
    topGradient: "from-sky-500 to-blue-600",
    color: "text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/25",
  },
  {
    icon: FlaskConical,
    href: "/soil-health",
    index: 3, // Soil Health AI
    tag: "NPK & pH Matrix",
    accent: "hover:border-teal-500/40 hover:shadow-teal-500/5",
    topGradient: "from-teal-500 to-emerald-600",
    color: "text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/25",
  },
  {
    icon: MessageSquare,
    href: "/chatbot",
    index: 1, // Hindi Voice AI
    tag: "Speech & Audio AI",
    accent: "hover:border-emerald-500/40 hover:shadow-emerald-500/5",
    topGradient: "from-emerald-500 to-green-600",
    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  },
  {
    icon: Landmark,
    href: "/schemes",
    index: 6, // Govt Schemes
    tag: "Direct Subsidies",
    accent: "hover:border-indigo-500/40 hover:shadow-indigo-500/5",
    topGradient: "from-indigo-500 to-purple-600",
    color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/25",
  },
];

export function Features() {
  const { t } = useLanguage();
  const featuresList = (t("features") || []) as { title: string; body: string }[];

  return (
    <section id="features" className="py-14 sm:py-24 bg-background relative border-b border-border/50">
      
      {/* Visual Ambient Glow */}
      <div className="absolute inset-x-0 top-1/3 h-[35%] bg-emerald-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Title Block */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 shadow-xs select-none">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t("featuresBadge")}</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight text-foreground">
            {t("featuresTitle1")}{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-400 bg-clip-text text-transparent">
              {t("featuresTitle2")}
            </span>
          </h2>
          
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed font-medium">
            {t("landing_features.access_highly_accurate_agricultural")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_METADATA.map((f, i) => {
            const translation = featuresList[f.index] || { title: "", body: "" };
            return (
              <motion.div
                key={f.index}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <Link href={f.href} className="block h-full group">
                  <div className={`relative h-full rounded-2xl border border-border/70 bg-card/80 dark:bg-card/50 backdrop-blur-md p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden ${f.accent}`}>
                    
                    {/* Top Accent Gradient Line */}
                    <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${f.topGradient} opacity-70 group-hover:opacity-100 transition-opacity`} />

                    <div>
                      {/* Icon & Tag Header */}
                      <div className="mb-5 flex items-center justify-between">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border group-hover:scale-105 transition-transform duration-300 ${f.color}`}>
                          <f.icon className="h-5 w-5" />
                        </div>
                        <span className="rounded-full bg-muted/60 border border-border/60 text-muted-foreground text-[10px] font-bold px-2.5 py-1">
                          {f.tag}
                        </span>
                      </div>

                      <h3 className="mb-2 text-lg font-display font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {translation.title}
                      </h3>
                      
                      <p className="text-xs text-muted-foreground leading-relaxed mb-6 font-medium">
                        {translation.body}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-auto">
                      <span>{t("landing_features.try_now")}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </div>

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
