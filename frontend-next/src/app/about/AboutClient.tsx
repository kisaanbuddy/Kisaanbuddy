'use client';

import Link from 'next/link';
import { Sprout, Sparkles, Brain, CloudSun, TrendingUp, Users, Mail, ArrowRight, Shield, Bug, Landmark, BookOpen, FlaskConical, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language';

type Founder = {
  name: string;
  role: string;
  email: string;
  bio: string;
  initials: string;
  gradient: string;
  image: string;
};

export function AboutClient() {
  const { t, lang } = useLanguage();

  const founders: Founder[] = [
    {
      name: "Aditya Ishwar",
      role: t("about.founder_ceo_chief_architect"),
      email: "info@kisaanbuddy.com",
      bio: t("about.drives_the_technical_vision"),
      initials: "AI",
      gradient: "from-emerald-400 to-green-600",
      image: "/aditya.png",
    },
    {
      name: "Utkarsh Sinha",
      role: t("about.co_founder_managing_director"),
      email: "info@kisaanbuddy.com",
      bio: t("about.owns_the_ml_pipeline"),
      initials: "US",
      gradient: "from-blue-400 to-indigo-600",
      image: "/utkarsh.png",
    },
    {
      name: "Sanidhya Sharma",
      role: t("about.co_founder_cto"),
      email: "info@kisaanbuddy.com",
      bio: t("about.steers_KisaanBuddy_s_technical"),
      initials: "SS",
      gradient: "from-purple-400 to-fuchsia-600",
      image: "",
    },
    {
      name: "Yash Singh",
      role: t("about.co_founder_cmo"),
      email: "info@kisaanbuddy.com",
      bio: t("about.co_founder_and_chief"),
      initials: "YS",
      gradient: "from-rose-400 to-pink-600",
      image: "/yash.png",
    },
  ];

  return (
    <div className="-mt-8 -mx-4 md:-mx-8 flex flex-col relative pb-12 overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-[-10%] left-[20%] w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[40%] right-[10%] w-[250px] h-[250px] rounded-full bg-teal-500/5 blur-[100px] pointer-events-none -z-10" />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden px-6 md:px-12 py-16 md:py-24 border-b border-border/20 bg-card/25 backdrop-blur-md">
        <div className="mx-auto max-w-5xl text-center md:text-left">
          <div className="flex justify-center md:justify-start items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Sprout className="h-5 w-5" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {t("aboutUs")}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-foreground leading-tight">
            {t("about.empowering_agriculture_with")}{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-500 bg-clip-text text-transparent">
              {t("about.KisaanBuddy")}
            </span>
          </h1>
          <p className="mt-4 max-w-3xl text-sm md:text-base text-muted-foreground leading-relaxed">
            {t("about.KisaanBuddy_is_an_ai")}
          </p>
        </div>
      </section>

      {/* PLATFORM MISSION, VISION, VALUES */}
      <section className="px-6 md:px-12 py-16">
        <div className="mx-auto max-w-5xl grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-border/30 bg-card/45 backdrop-blur-sm p-6 flex flex-col gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground font-display">{t("about.our_mission")}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("about.to_deliver_accessible_local")}
            </p>
          </div>

          <div className="rounded-2xl border border-border/30 bg-card/45 backdrop-blur-sm p-6 flex flex-col gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-500">
              <Brain className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground font-display">{t("about.our_vision")}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("about.to_build_a_smart")}
            </p>
          </div>

          <div className="rounded-2xl border border-border/30 bg-card/45 backdrop-blur-sm p-6 flex flex-col gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground font-display">{t("about.our_values")}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("about.farmers_first_we_design")}
            </p>
          </div>
        </div>
      </section>

      {/* CORE FEATURES LIST */}
      <section className="px-6 md:px-12 py-16 bg-muted/10 border-y border-border/20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">{t("about.advanced_agricultural_features")}</h2>
            <p className="text-xs text-muted-foreground mt-2">{t("about.what_makes_KisaanBuddy_the")}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { 
                icon: Bug, 
                title: t("about.crop_disease_ai"), 
                desc: t("about.instantly_diagnose_crop_leaf")},
              { 
                icon: CloudSun, 
                title: t("about.weather_intelligence"), 
                desc: t("about.hyper_local_forecasts_with")},
              { 
                icon: TrendingUp, 
                title: t("about.live_mandi_prices"), 
                desc: t("about.apmc_market_rates_tracked")},
              { 
                icon: Sprout, 
                title: t("about.crop_predictor_ai"), 
                desc: t("about.predicts_the_best_crops")},
              { 
                icon: Landmark, 
                title: t("about.sarkari_yojnayein"), 
                desc: t("about.easy_check_for_pm")}
            ].map((f, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-xl border border-border/20 bg-background/50 hover:border-emerald-500/30 transition-all duration-300">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <f.icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-bold text-foreground font-display">{f.title}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDERS GRID */}
      <section className="px-6 md:px-12 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">{t("about.meet_the_founders")}</h2>
            <p className="text-xs text-muted-foreground mt-2">{t("about.the_development_team_behind")}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {founders.map((f, i) => (
              <motion.div 
                key={f.email}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <GlassCard className="h-full flex flex-col justify-between group overflow-hidden relative border border-border/40 bg-card/25 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/5 hover:-translate-y-2 transition-all duration-300 p-6">
                  {/* Accent Line */}
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${f.gradient}`} />
                  
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-4">
                      {f.image ? (
                        <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-white/[0.15] shadow-md shadow-emerald-500/10 transition-all duration-300 group-hover:scale-105">
                          <img
                            src={f.image}
                            alt={f.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} text-base font-black text-white shadow-md shadow-emerald-500/10`}>
                          {f.initials}
                        </div>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-foreground font-display transition-colors group-hover:text-emerald-400">{f.name}</h3>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent mt-0.5">
                      {f.role}
                    </p>
                    <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground/90 font-medium">
                      {f.bio}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border/20 relative z-10">
                    <a
                      href={`mailto:${f.email}`}
                      className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-background/50 border border-border/30 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 text-xs font-semibold text-foreground transition-all duration-200"
                    >
                      <Mail className="h-3.5 w-3.5 text-emerald-500 group-hover:text-white transition-colors" />
                      <span>
                        {t("about.email_f_role_includes").replace('{role}', f.initials === "AI" ? "Founder" : "Co-Founder")}
                      </span>
                    </a>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="px-6 md:px-12 py-16 bg-muted/5 border-t border-border/20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">
              {lang === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न (FAQ)' : 'Frequently Asked Questions (FAQ)'}
            </h2>
            <p className="text-xs text-muted-foreground mt-2">
              {lang === 'hi' ? 'किसानमित्र के बारे में सामान्य प्रश्न और उत्तर' : 'Common questions and answers about KisaanBuddy'}
            </p>
          </div>

          <div className="space-y-6">
            {(lang === 'hi' ? [
              {
                q: "प्रश्न 1. किसानमित्र (KisaanBuddy) क्या है?",
                a: "उत्तर: किसानमित्र एक एआई-संचालित स्मार्ट कृषि सलाहकार मंच है। यह भारतीय किसानों को फसल के रोगों की पहचान करने, मिट्टी के स्वास्थ्य के अनुसार खाद की सलाह देने, लाइव मंडी भाव जांचने और मौसम के अनुसार कृषि सलाह प्रदान करने में मदद करता है।"
              },
              {
                q: "प्रश्न 2. क्या किसानमित्र का उपयोग करने के लिए कोई शुल्क है?",
                a: "उत्तर: नहीं, किसानमित्र के सभी बुनियादी सलाहकार उपकरण, रोग स्कैनर, मंडी दरें और योजना खोजक उपकरण भारतीय किसानों के लिए पूरी तरह से मुफ्त हैं।"
              },
              {
                q: "प्रश्न 3. किसानमित्र रोगों की पहचान कैसे करता है?",
                a: "उत्तर: हमारा एआई मॉडल फसल की पत्ती की फोटो का विश्लेषण करके संक्रमण (जैसे ब्लास्ट, झुलसा या रतुआ) की तुरंत पहचान करता है और जैविक उपचार व रासायनिक रोकथाम के सटीक उपाय सुझाता है।"
              }
            ] : [
              {
                q: "Q1. What is KisaanBuddy?",
                a: "Answer: KisaanBuddy is an AI-powered smart agriculture advisor platform. It helps Indian farmers identify crop leaf diseases, monitor soil health, check live APMC mandi prices, and receive real-time weather advisories."
              },
              {
                q: "Q2. Is there any fee to use KisaanBuddy?",
                a: "Answer: No, KisaanBuddy's core advisory features, crop scanners, mandi checks, and scheme advisory tools are completely free for farmers across India."
              },
              {
                q: "Q3. How does the disease detection tool work?",
                a: "Answer: Our AI model analyzes uploaded crop leaf photographs to instantly diagnose pathogens (like blight, blast, or rust) and suggest targeted organic remedies and chemical treatments."
              }
            ]).map((faq, idx) => (
              <div key={idx} className="border border-border/20 bg-card/25 p-5 rounded-2xl backdrop-blur-sm">
                <h4 className="text-sm font-bold text-foreground font-display mb-2">{faq.q}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-semibold">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-6 md:px-12 py-10 text-center">
        <div className="mx-auto max-w-xl rounded-2xl border border-emerald-500/10 bg-gradient-to-r from-emerald-950/10 to-teal-950/10 p-8 backdrop-blur-sm">
          <h2 className="text-xl md:text-2xl font-bold font-display text-foreground mb-3">
            {t("about.optimize_your_harvesting_operations")}
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6 leading-relaxed">
            {t("about.register_a_free_account")}
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/signup">
              <Button className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-10 px-5 shadow-lg shadow-emerald-500/15">
                {t("about.join_free")}
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="rounded-xl border-border/40 hover:bg-white/[0.03] text-foreground font-semibold h-10 px-5">
                {t("about.go_to_home")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
