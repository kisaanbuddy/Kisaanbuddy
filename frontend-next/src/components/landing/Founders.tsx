'use client';

import { Mail, Linkedin, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/language';

type Founder = {
  name: string;
  role: string;
  email: string;
  linkedin: string;
  bio: string;
  image: string;
  gradient: string;
};

const FOUNDERS_I18N: Record<string, {
  prefix: string;
  highlight: string;
  emailTitle: (name: string) => string;
}> = {
  en: {
    prefix: 'Built by RVCE Engineers for ',
    highlight: 'Indian Farmers 🇮🇳',
    emailTitle: (name) => `Email ${name}`
  },
  hi: {
    prefix: 'भारतीय किसानों के लिए ',
    highlight: 'RVCE इंजीनियर्स द्वारा निर्मित 🇮🇳',
    emailTitle: (name) => `${name} को ईमेल भेजें`
  },
  kn: {
    prefix: 'ಭಾರತೀಯ ರೈತರಿಗಾಗಿ ',
    highlight: 'RVCE ಇಂಜಿನಿಯರ್‌ಗಳಿಂದ ನಿರ್ಮಿಸಲಾಗಿದೆ 🇮🇳',
    emailTitle: (name) => `${name} ಅವರಿಗೆ ಇಮೇಲ್ ಕಳುಹಿಸಿ`
  },
  mr: {
    prefix: 'भारतीय शेतकऱ्यांसाठी ',
    highlight: 'RVCE इंजिनिअर्सद्वारे निर्मित 🇮🇳',
    emailTitle: (name) => `${name} यांना ईमेल पाठवा`
  },
  te: {
    prefix: 'భారతీయ రైతుల కోసం ',
    highlight: 'RVCE ఇంజనీర్లచే నిర్మితం 🇮🇳',
    emailTitle: (name) => `${name} కి ఈమెయిల్ పంపండి`
  },
  ta: {
    prefix: 'இந்திய விவசாயிகளுக்காக ',
    highlight: 'RVCE பொறியாளர்களால் உருவாக்கப்பட்டது 🇮🇳',
    emailTitle: (name) => `${name} அவர்களுக்கு மின்னஞ்சல் அனுப்பவும்`
  },
  gu: {
    prefix: 'ભારતીય ખેડૂતો માટે ',
    highlight: 'RVCE એન્જિનિયરો દ્વારા નિર્મિત 🇮🇳',
    emailTitle: (name) => `${name} ને ઈમેલ મોકલો`
  },
  bn: {
    prefix: 'ভারতীয় কৃষকদের জন্য ',
    highlight: 'RVCE ইঞ্জিনিয়ারদের দ্বারা তৈরি 🇮🇳',
    emailTitle: (name) => `${name}-কে ইমেল পাঠান`
  },
  pa: {
    prefix: 'ਭਾਰਤੀ ਕਿਸਾਨਾਂ ਲਈ ',
    highlight: 'RVCE ਇੰਜੀਨੀਅਰਾਂ ਵੱਲੋਂ ਤਿਆਰ ਕੀਤਾ ਗਿਆ 🇮🇳',
    emailTitle: (name) => `${name} ਨੂੰ ਈਮੇਲ ਭੇਜੋ`
  },
  ml: {
    prefix: 'ഇന്ത്യൻ കർഷകർക്കായി ',
    highlight: 'RVCE എഞ്ചിനീയർമാർ നിർമ്മിച്ചത് 🇮🇳',
    emailTitle: (name) => `${name}-ന് ഇമെയിൽ അയയ്ക്കുക`
  },
  hi_en: {
    prefix: 'Indian Farmers ke liye ',
    highlight: 'RVCE Engineers dwara Built 🇮🇳',
    emailTitle: (name) => `${name} ko email karein`
  }
};

export function Founders() {
  const { t, lang } = useLanguage();
  const c = FOUNDERS_I18N[lang] || FOUNDERS_I18N.en;

  const founders: Founder[] = [
    {
      name: "Aditya Ishwar",
      role: t("founders.founder_ceo_chief_architect"),
      email: "info@kisaanbuddy.com",
      linkedin: "https://www.linkedin.com/in/aditya-ishwar",
      bio: t("founders.drives_the_technical_vision"),
      image: "/aditya.png",
      gradient: "from-emerald-500 via-teal-500 to-emerald-600",
    },
    {
      name: "Utkarsh Sinha",
      role: t("founders.co_founder_managing_director"),
      email: "info@kisaanbuddy.com",
      linkedin: "https://www.linkedin.com/in/utkarsh-sinha",
      bio: t("founders.owns_the_ml_pipeline"),
      image: "/utkarsh.png",
      gradient: "from-teal-500 via-emerald-500 to-cyan-600",
    },
    {
      name: "Yash Singh",
      role: t("founders.co_founder_cmo"),
      email: "info@kisaanbuddy.com",
      linkedin: "https://www.linkedin.com/in/yash-singh-33553b2a5",
      bio: t("founders.co_founder_and_chief"),
      image: "/yash.png",
      gradient: "from-amber-500 via-orange-500 to-emerald-600",
    },
  ];

  return (
    <section id="founders" className="py-24 bg-muted/20 dark:bg-[#070c14] relative border-b border-border/50">
      
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero_farmer.png')] bg-cover bg-center opacity-[0.02] dark:opacity-[0.04] mix-blend-luminosity" />
        <div className="absolute inset-x-0 bottom-1/4 h-[40%] bg-emerald-500/[0.03] rounded-full blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 shadow-xs select-none">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t("founders.meet_the_team")}</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight text-foreground">
            <span>
              {c.prefix}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-400 bg-clip-text text-transparent">
                {c.highlight}
              </span>
            </span>
          </h2>
          
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed font-medium">
            {t('founders.subheading')}
          </p>
        </div>

        {/* Founders Cards Grid */}
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto">
          {founders.map((f, i) => (
            <motion.div
              key={f.email + f.name}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="h-full"
            >
              <div className="h-full flex flex-col justify-between group overflow-hidden relative rounded-2xl border border-border/70 bg-card/80 dark:bg-card/50 hover:border-emerald-500/40 hover:shadow-2xl hover:-translate-y-1.5 backdrop-blur-md transition-all duration-300 p-6 text-center">
                
                {/* Top decorative gradient stripe */}
                <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${f.gradient}`} />

                {/* Ambient glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center">
                  
                  {/* Avatar with Double Ring */}
                  <div className="relative mt-2 mb-5">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 opacity-20 blur-sm group-hover:opacity-60 transition-opacity duration-500" />
                    <div className="relative h-28 w-28 rounded-full overflow-hidden border-2 border-border group-hover:border-emerald-500/60 shadow-lg transition-all duration-300 bg-muted flex items-center justify-center">
                      <img
                        src={f.image}
                        alt={f.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </div>

                  {/* Name + Role */}
                  <h3 className="text-lg font-bold tracking-tight text-foreground font-display group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                    {f.name}
                  </h3>
                  
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    {f.role}
                  </p>

                  {/* Bio */}
                  <p className="mt-3.5 text-xs leading-relaxed text-muted-foreground font-medium min-h-[64px] max-w-[260px]">
                    {f.bio}
                  </p>
                </div>

                {/* Action Row */}
                <div className="mt-6 pt-4 border-t border-border/50 flex gap-2 relative z-10">
                  <a
                    href={f.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex h-9 items-center justify-center gap-1.5 rounded-xl bg-muted/60 border border-border/70 hover:border-emerald-500/30 hover:bg-emerald-500/10 text-xs font-bold text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-[0.98] transition-all duration-200"
                  >
                    <Linkedin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href={`mailto:${f.email}`}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/60 border border-border/70 hover:border-emerald-500/30 hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-[0.98] transition-all duration-200"
                    title={c.emailTitle(f.name.split(" ")[0])}
                  >
                    <Mail className="h-3.5 w-3.5" />
                  </a>
                </div>

              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
