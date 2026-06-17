'use client';

import { useLanguage } from '@/lib/language';
import { Mail, Linkedin, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/card';

type Founder = {
  name: string;
  role: string;
  email: string;
  linkedin: string;
  bio: string;
  initials: string;
  gradient: string;
  image: string;
};

export function Founders() {
  const { t } = useLanguage();

  const founders: Founder[] = [
    {
      name: "Aditya Ishwar",
      role: t("founders.founder_ceo_chief_architect"),
      email: "info@kisaanbuddy.com",
      linkedin: "https://www.linkedin.com/in/aditya-ishwar",
      bio: t("founders.drives_the_technical_vision"),
      initials: "AI",
      gradient: "from-[#00C896] to-[#0F5132]",
      image: "/aditya.png",
    },
    {
      name: "Utkarsh Sinha",
      role: t("founders.co_founder_managing_director"),
      email: "info@kisaanbuddy.com",
      linkedin: "https://www.linkedin.com/in/utkarsh-sinha",
      bio: t("founders.owns_the_ml_pipeline"),
      initials: "US",
      gradient: "from-emerald-400 to-teal-600",
      image: "/utkarsh.png",
    },
    {
      name: "Sanidhya Sharma",
      role: t("founders.co_founder_cto"),
      email: "info@kisaanbuddy.com",
      linkedin: "https://www.linkedin.com/in/sanidhya-sharma",
      bio: t("founders.steers_krishiai_s_technical"),
      initials: "SS",
      gradient: "from-[#2ECC71] to-[#0F5132]",
      image: "",
    },
    {
      name: "Yash Singh",
      role: t("founders.co_founder_cmo"),
      email: "info@kisaanbuddy.com",
      linkedin: "https://www.linkedin.com/in/yash-singh",
      bio: t("founders.co_founder_and_chief"),
      initials: "YS",
      gradient: "from-emerald-300 to-green-500",
      image: "/yash.png",
    },
  ];

  return (
    <section className="py-20 bg-muted/5 relative border-b border-border/20">
      {/* Visual background accents */}
      <div className="absolute inset-x-0 bottom-1/4 h-[30%] bg-[#00C896] opacity-[0.015] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-4 py-1 text-xs font-bold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {t("founders.meet_the_team")}
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground">
            {t("founders.the_minds_behind")}{' '}
            <span className="bg-gradient-to-r from-primary to-[#0F5132] dark:to-[#2ECC71] bg-clip-text text-transparent">
              Kisaan Buddy
            </span>
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground/80 max-w-lg mx-auto leading-relaxed font-semibold">
            {t("founders.we_are_a_group")}
          </p>
        </div>

        {/* Founders Cards Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {founders.map((f, i) => (
            <motion.div
              key={f.email}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="h-full"
            >
              <GlassCard className="h-full flex flex-col justify-between group overflow-hidden relative border border-border/40 bg-card/45 hover:border-primary/30 hover:-translate-y-1.5 backdrop-blur-md shadow-lg hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 p-6 rounded-2xl text-center">
                {/* Stripe/Linear style top gradient bar */}
                <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${f.gradient}`} />

                {/* Ambient glow on card hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center">
                  
                  {/* Large Circular Profile Photo */}
                  <div className="relative mt-2 mb-5">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-primary to-[#2ECC71] opacity-10 blur-sm group-hover:opacity-35 transition-opacity duration-500" />
                    <div className="relative h-28 w-28 rounded-full overflow-hidden border border-border/60 group-hover:border-primary/50 shadow-md transition-all duration-300 bg-background/50 flex items-center justify-center">
                      {f.image ? (
                        <img
                          src={f.image}
                          alt={f.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${f.gradient} text-2xl font-black text-white`}>
                          {f.initials}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name + Role */}
                  <h3 className="text-base font-bold tracking-tight text-foreground font-display group-hover:text-primary transition-colors duration-300">
                    {f.name}
                  </h3>
                  <p className="mt-1 text-[9px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-primary to-[#0F5132] dark:to-[#2ECC71] bg-clip-text text-transparent">
                    {f.role}
                  </p>

                  {/* Bio */}
                  <p className="mt-3.5 text-[11px] leading-relaxed text-muted-foreground/90 font-medium min-h-[84px] max-w-[220px]">
                    {f.bio}
                  </p>
                </div>

                {/* Action Row */}
                <div className="mt-5 pt-3.5 border-t border-border/20 flex gap-2 relative z-10">
                  <a
                    href={f.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex h-9 items-center justify-center gap-1.5 rounded-xl bg-muted/40 border border-border/30 hover:border-primary/30 hover:bg-primary/5 text-[11px] font-bold text-muted-foreground hover:text-primary active:scale-[0.98] transition-all duration-200"
                  >
                    <Linkedin className="h-3.5 w-3.5 text-primary" />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href={`mailto:${f.email}`}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/40 border border-border/30 hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-primary active:scale-[0.98] transition-all duration-200"
                    title={`Email ${f.name.split(" ")[0]}`}
                  >
                    <Mail className="h-3.5 w-3.5" />
                  </a>
                </div>

              </GlassCard>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
