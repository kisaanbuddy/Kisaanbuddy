"use client";

import React, { useState } from "react";
import { Sparkles, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language";
import { FOUNDERS_DATA, type FounderProfile } from "@/lib/data/founders-data";
import { FounderCard } from "@/components/founders/FounderCard";
import { FounderModal } from "@/components/founders/FounderModal";

const FOUNDERS_I18N: Record<
  string,
  {
    prefix: string;
    highlight: string;
    subheading: string;
  }
> = {
  en: {
    prefix: "Built by RVCE Engineers for ",
    highlight: "Indian Farmers 🇮🇳",
    subheading:
      "A dedicated founding team combining full-stack systems architecture, agronomic machine learning, and grassroots farmer outreach to build technology that understands rural India.",
  },
  hi: {
    prefix: "भारतीय किसानों के लिए ",
    highlight: "RVCE इंजीनियर्स द्वारा निर्मित 🇮🇳",
    subheading:
      "सिस्टम आर्किटेक्चर, कृषि मशीन लर्निंग और जमीनी किसान जुड़ाव को मिलाकर ग्रामीण भारत के लिए प्रामाणिक तकनीक का निर्माण।",
  },
  kn: {
    prefix: "ಭಾರತೀಯ ರೈತರಿಗಾಗಿ ",
    highlight: "RVCE ಇಂಜಿನಿಯರ್‌ಗಳಿಂದ ನಿರ್ಮಿಸಲಾಗಿದೆ 🇮🇳",
    subheading:
      "ಪೂರ್ಣ-ಸ್ಟ್ಯಾಕ್ ಸಿಸ್ಟಮ್ಸ್ ಆರ್ಕಿಟೆಕ್ಚರ್, ಕೃಷಿ ಯಂತ್ರ ಕಲಿಕೆ ಮತ್ತು ತಳಮಟ್ಟದ ರೈತರ ಸಂಪರ್ಕವನ್ನು ಒಗ್ಗೂಡಿಸಿ ಗ್ರಾಮೀಣ ಭಾರತಕ್ಕಾಗಿ ತಂತ್ರಜ್ಞಾನ.",
  },
  mr: {
    prefix: "भारतीय शेतकऱ्यांसाठी ",
    highlight: "RVCE इंजिनिअर्सद्वारे निर्मित 🇮🇳",
    subheading:
      "सिस्टम आर्किटेक्चर, ऍग्रोनॉमिक मशीन लर्निंग आणि थेट शेतकरी संवाद यांच्याद्वारे ग्रामीण भारतासाठी तंत्रज्ञान.",
  },
  te: {
    prefix: "భారతీయ రైతుల కోసం ",
    highlight: "RVCE ఇంజనీర్లచే నిర్మితం 🇮🇳",
    subheading:
      "సిస్టమ్స్ ఆర్కిటెక్చర్, వ్యవసాయ మెషిన్ లెర్నింగ్ మరియు క్షేత్రస్థాయి రైతు అనుసంధానంతో గ్రామీణ భారతదేశం కోసం సాంకేతికత.",
  },
  ta: {
    prefix: "இந்திய விவசாயிகளுக்காக ",
    highlight: "RVCE பொறியாளர்களால் உருவாக்கப்பட்டது 🇮🇳",
    subheading:
      "கட்டமைப்பு, வேளாண் இயந்திர கற்றல் மற்றும் நேரடி விவசாயி தொடர்புடன் கிராமப்புற இந்தியாவிற்கான தொழில்நுட்பம்.",
  },
  gu: {
    prefix: "ભારતીય ખેડૂતો માટે ",
    highlight: "RVCE એન્જિનિયરો દ્વારા નિર્મિત 🇮🇳",
    subheading:
      "સિસ્ટમ્સ આર્કિટેક્ચર, કૃષિ મશીન લર્નિંગ અને ગ્રામીણ ખેડૂત સંપર્ક દ્વારા વાસ્તવિક કૃષિ ટેકનોલોજી.",
  },
  bn: {
    prefix: "ভারতীয় কৃষকদের জন্য ",
    highlight: "RVCE ইঞ্জিনিয়ারদের দ্বারা তৈরি 🇮🇳",
    subheading:
      "সিস্টেম আর্কিটেকচার, কৃষি মেশিন লার্নিং এবং সরাসরি কৃষক সংযোগের মাধ্যমে গ্রামীণ ভারতের জন্য প্রযুক্তি.",
  },
  pa: {
    prefix: "ਭਾਰਤੀ ਕਿਸਾਨਾਂ ਲਈ ",
    highlight: "RVCE ਇੰਜੀਨੀਅਰਾਂ ਵੱਲੋਂ ਤਿਆਰ ਕੀਤਾ ਗਿਆ 🇮🇳",
    subheading:
      "ਸਿਸਟਮ ਆਰਕੀਟੈਕਚਰ, ਖੇਤੀਬਾੜੀ ਮਸ਼ੀਨ ਲਰਨਿੰਗ ਅਤੇ ਜ਼ਮੀਨੀ ਕਿਸਾਨ ਸੰਪਰਕ ਰਾਹੀਂ ਪੇਂਡੂ ਭਾਰਤ ਲਈ ਭਰੋਸੇਯੋਗ ਤਕਨਾਲੋਜੀ.",
  },
  ml: {
    prefix: "ഇന്ത്യൻ കർഷകർക്കായി ",
    highlight: "RVCE എഞ്ചിനീയർമാർ നിർമ്മിച്ചത് 🇮🇳",
    subheading:
      "ഫുൾ-സ്റ്റാക്ക് ആർക്കിടെക്ചർ, അഗ്രോണമിക് മെഷീൻ ലേണിംഗ്, കർഷക പങ്കാളിത്തം എന്നിവയിലൂടെ വികസിപ്പിച്ച സാങ്കേതികവിദ്യ.",
  },
  hi_en: {
    prefix: "Indian Farmers ke liye ",
    highlight: "RVCE Engineers dwara Built 🇮🇳",
    subheading:
      "Full-stack architecture, agronomic machine learning, aur grassroots farmer outreach dwara rural India ke liye banayi gayi authentic technology.",
  },
};

export function Founders() {
  const { lang } = useLanguage();
  const c = FOUNDERS_I18N[lang] || FOUNDERS_I18N.en;
  const [selectedFounder, setSelectedFounder] = useState<FounderProfile | null>(null);

  return (
    <section id="founders" className="py-20 md:py-28 bg-muted/20 dark:bg-[#070c14] relative border-b border-border/50">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero_farmer.png')] bg-cover bg-center opacity-[0.02] dark:opacity-[0.04] mix-blend-luminosity" />
        <div className="absolute inset-x-0 bottom-1/4 h-[40%] bg-emerald-500/[0.03] rounded-full blur-[140px]" />
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 shadow-xs select-none">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Meet The Founders</span>
            <span className="text-stone-300 dark:text-stone-700">&bull;</span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-3 h-3" />
              Verified Profiles
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-foreground leading-tight">
            <span>
              {c.prefix}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-400 bg-clip-text text-transparent">
                {c.highlight}
              </span>
            </span>
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed font-medium">
            {c.subheading}
          </p>
        </div>

        {/* 3 Founders Equal Width Cards Grid */}
        <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {FOUNDERS_DATA.map((founder, i) => (
            <motion.div
              key={founder.id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="h-full flex"
            >
              <FounderCard
                founder={founder}
                onViewProfile={(f) => setSelectedFounder(f)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Interactive Detail Modal */}
      <FounderModal
        founder={selectedFounder}
        onClose={() => setSelectedFounder(null)}
      />
    </section>
  );
}
