'use client';

import { Mail, Linkedin, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/card';

type Founder = {
  name: string;
  role: string;
  email: string;
  linkedin: string;
  bio: string;
  image: string;
  gradient: string;
};

export function Founders() {
  const founders: Founder[] = [
    {
      name: "Aditya Ishwar",
      role: "Founder & Chief Architect",
      email: "info@kisaanbuddy.com",
      linkedin: "https://www.linkedin.com/in/aditya-ishwar",
      bio: "RVCE Computer Science student driving the platform architecture, multi-language speech pipelines, and Core AI systems.",
      image: "/aditya.png",
      gradient: "from-emerald-500 to-teal-700",
    },
    {
      name: "Utkarsh Sinha",
      role: "Co-Founder & ML Lead",
      email: "info@kisaanbuddy.com",
      linkedin: "https://www.linkedin.com/in/utkarsh-sinha",
      bio: "RVCE student owning the machine learning pipeline, agronomic recommendation systems, and edge IoT integrations.",
      image: "/utkarsh.png",
      gradient: "from-emerald-400 to-emerald-600",
    },
    {
      name: "Yash Singh",
      role: "Co-Founder & CMO",
      email: "info@kisaanbuddy.com",
      linkedin: "https://www.linkedin.com/in/yash-singh",
      bio: "RVCE student spearheading regional community growth, brand partnerships, and rural farmer outreach campaigns.",
      image: "/yash.png",
      gradient: "from-teal-400 to-emerald-600",
    },
  ];

  return (
    <section className="py-20 bg-[#030712] relative border-b border-white/[0.08]">
      
      {/* Background overlay for consistency */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/hero_farmer.png')] bg-cover bg-center opacity-[0.03] mix-blend-luminosity pointer-events-none" />
        <div className="absolute inset-x-0 bottom-1/4 h-[30%] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-xs font-bold text-emerald-400 select-none shadow-lg shadow-emerald-500/5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            Our Vision
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white">
            Meet the{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Founders
            </span>
          </h2>
          <p className="text-xs md:text-sm text-gray-400 max-w-lg mx-auto leading-relaxed font-semibold">
            Confidently building the future of Indian agriculture using state-of-the-art AI technology.
          </p>
        </div>

        {/* Founders Cards Grid */}
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto">
          {founders.map((f, i) => (
            <motion.div
              key={f.email}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="h-full"
            >
              <GlassCard className="h-full flex flex-col justify-between group overflow-hidden relative border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-emerald-500/30 hover:-translate-y-1.5 backdrop-blur-md shadow-2xl transition-all duration-300 p-6 rounded-2xl text-center">
                {/* Stripe/Linear style top gradient bar */}
                <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${f.gradient}`} />

                {/* Ambient glow on card hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center">
                  
                  {/* Large Circular Profile Photo */}
                  <div className="relative mt-2 mb-5">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 opacity-10 blur-sm group-hover:opacity-35 transition-opacity duration-500" />
                    <div className="relative h-28 w-28 rounded-full overflow-hidden border border-white/10 group-hover:border-emerald-500/50 shadow-md transition-all duration-300 bg-slate-900 flex items-center justify-center">
                      <img
                        src={f.image}
                        alt={f.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </div>

                  {/* Name + Role */}
                  <h3 className="text-base font-bold tracking-tight text-white font-display group-hover:text-emerald-400 transition-colors duration-300">
                    {f.name}
                  </h3>
                  <p className="mt-1 text-[9px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    {f.role}
                  </p>

                  {/* Bio */}
                  <p className="mt-3.5 text-xs leading-relaxed text-gray-400 font-medium min-h-[72px] max-w-[240px]">
                    {f.bio}
                  </p>
                </div>

                {/* Action Row */}
                <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex gap-2 relative z-10">
                  <a
                    href={f.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex h-9 items-center justify-center gap-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-emerald-500/30 hover:bg-emerald-500/10 text-[11px] font-bold text-gray-300 hover:text-emerald-400 active:scale-[0.98] transition-all duration-200"
                  >
                    <Linkedin className="h-3.5 w-3.5 text-emerald-400" />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href={`mailto:${f.email}`}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-emerald-500/30 hover:bg-emerald-500/10 text-gray-300 hover:text-emerald-400 active:scale-[0.98] transition-all duration-200"
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
