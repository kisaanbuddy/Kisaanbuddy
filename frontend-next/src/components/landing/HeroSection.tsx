'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Store,
  Users,
  Bug,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '@/lib/language';
import { motion } from 'framer-motion';
import { StaggerList, StaggerItem } from '@/components/motion/MotionComponents';

interface HeroI18nContent {
  smallBadge: string;
  heading: string;
  supportingText: string;
  ctaExplore: string;
  ctaAi: string;
  trustPoint1: string;
  trustPoint2: string;
  trustPoint3: string;
  trustPoint4: string;
  liveBadge: string;
  farmerTag: string;
}

const HERO_TRANSLATIONS: Record<string, HeroI18nContent> = {
  en: {
    smallBadge: 'PREMIUM AGRICULTURAL TECHNOLOGY',
    heading: 'Your Farm. Your Decisions. Your KisaanBuddy.',
    supportingText:
      'Smart farming advice, live mandi prices, crop protection, and agricultural services—all in one place.',
    ctaExplore: 'Explore Mandi Prices',
    ctaAi: 'Ask KisaanBuddy',
    trustPoint1: 'Official e-NAM & APMC Rates',
    trustPoint2: 'Direct Trade, Zero Cut',
    trustPoint3: 'AI Crop Doctor Diagnosis',
    trustPoint4: 'Hindi, Kannada & 9+ Languages',
    liveBadge: '1,000+ Mandis Live',
    farmerTag: 'Field-Verified Indian Agriculture',
  },
  hi: {
    smallBadge: 'भारतीय किसानों का भरोसेमंद मंच',
    heading: 'आपका खेत। आपके फैसले। आपका KisaanBuddy।',
    supportingText:
      'सटीक खेती सलाह, लाइव मंडी भाव, फसल सुरक्षा और कृषि सेवाएं—सब कुछ एक ही मंच पर।',
    ctaExplore: 'मंडी भाव देखें',
    ctaAi: 'KisaanBuddy से पूछें',
    trustPoint1: 'सरकारी e-NAM व APMC दरें',
    trustPoint2: 'बिना दलाली सीधी बिक्री',
    trustPoint3: 'AI फसल रोग पहचान',
    trustPoint4: 'हिंदी, कन्नड़ और 9+ भाषाओं में',
    liveBadge: '1,000+ मंडियां लाइव',
    farmerTag: 'सत्यापित भारतीय कृषि मंच',
  },
  kn: {
    smallBadge: 'ರೈತರ ನೆಚ್ಚಿನ ಕೃಷಿ ತಂತ್ರಜ್ಞಾನ',
    heading: 'ನಿಮ್ಮ ಜಮೀನು. ನಿಮ್ಮ ನಿರ್ಧಾರ. ನಿಮ್ಮ KisaanBuddy.',
    supportingText:
      'ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಲಹೆ, ನೇರ ಮಂಡಿ ದರಗಳು, ಬೆಳೆ ಸಂರಕ್ಷಣೆ ಮತ್ತು ಕೃಷಿ ಸೇವೆಗಳು—ಎಲ್ಲವೂ ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ.',
    ctaExplore: 'ಮಂಡಿ ದರಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    ctaAi: 'KisaanBuddy ಕೇಳಿ',
    trustPoint1: 'ಸರ್ಕಾರಿ e-NAM & APMC ದರಗಳು',
    trustPoint2: 'ಕಮಿಷನ್ ರಹಿತ ನೇರ ವ್ಯಾಪಾರ',
    trustPoint3: 'AI ಬೆಳೆ ರೋಗ ತಪಾಸಣೆ',
    trustPoint4: 'ಕನ್ನಡ ಸೇರಿ 11 ಭಾಷೆಗಳ ಧ್ವನಿ ಬೆಂಬಲ',
    liveBadge: '1,000+ ಮಂಡಿಗಳು ನೇರ',
    farmerTag: 'ನೈಜ ಭಾರತೀಯ ಕೃಷಿ ವೇದಿಕೆ',
  },
  mr: {
    smallBadge: 'शेतकऱ्यांसाठी आधुनिक व्यासपीठ',
    heading: 'तुमची शेती. तुमचे निर्णय. तुमचा KisaanBuddy.',
    supportingText:
      'स्मार्ट शेती सल्ला, थेट बाजारभाव, पीक संरक्षण आणि कृषी सेवा—सर्व एकाच ठिकाणी.',
    ctaExplore: 'बाजारभाव तपासा',
    ctaAi: 'KisaanBuddy ला विचारा',
    trustPoint1: 'अधिकृत e-NAM व APMC थेट दर',
    trustPoint2: 'दलालांशिवाय थेट खरेदी',
    trustPoint3: 'AI पीक रोग निदान',
    trustPoint4: 'मराठीसह 11 भाषांमध्ये',
    liveBadge: '1,000+ मंडया थेट',
    farmerTag: 'सत्यापित भारतीय कृषी मंच',
  },
  te: {
    smallBadge: 'రైతుల కోసం స్మార్ట్ వ్యవసాయం',
    heading: 'మీ పొలం. మీ నిర్ణయాలు. మీ KisaanBuddy.',
    supportingText:
      'స్మార్ట్ వ్యవసాయ సలహాలు, ప్రత్యక్ష మండి ధరలు, పంట రక్షణ మరియు వ్యవసాయ సేవలు—అన్నీ ఒకే చోట.',
    ctaExplore: 'మండి ధరలను చూడండి',
    ctaAi: 'KisaanBuddy ని అడగండి',
    trustPoint1: 'అధికారిక e-NAM & APMC ధరలు',
    trustPoint2: 'కమిషన్ లేని ప్రత్యక్ష అమ్మకాలు',
    trustPoint3: 'AI పంట వ్యాధి నిర్ధారణ',
    trustPoint4: 'తెలుగు సహా 11 భాషల్లో',
    liveBadge: '1,000+ మార్కెట్లు లైవ్',
    farmerTag: 'భారతీయ రైతుల వేదిక',
  },
  ta: {
    smallBadge: 'விவசாயிகளுக்கான நவீன தளம்',
    heading: 'உங்கள் பண்ணை. உங்கள் முடிவுகள். உங்கள் KisaanBuddy.',
    supportingText:
      'ஸ்மார்ட் விவசாய ஆலோசனை, நேரலை மண்டி விலைகள், பயிர் பாதுகாப்பு மற்றும் விவசாய சேவைகள்—அனைத்தும் ஒரே இடத்தில்.',
    ctaExplore: 'மண்டி விலைகளை காண்க',
    ctaAi: 'KisaanBuddy-யிடம் கேளுங்கள்',
    trustPoint1: 'அதிகாரப்பூர்வ e-NAM & APMC விலைகள்',
    trustPoint2: 'இடைத்தரகர் இல்லாத நேரடி விற்பனை',
    trustPoint3: 'AI பயிர் நோய் கண்டறிதல்',
    trustPoint4: 'தமிழ் உட்பட 11 மொழிகளில்',
    liveBadge: '1,000+ சந்தைகள் நேரலை',
    farmerTag: 'இந்திய விவசாய மேடை',
  },
  hi_en: {
    smallBadge: 'PREMIUM AGRICULTURAL TECHNOLOGY',
    heading: 'Your Farm. Your Decisions. Your KisaanBuddy.',
    supportingText:
      'Smart farming advice, live mandi prices, crop protection, and agricultural services—all in one place.',
    ctaExplore: 'Explore Mandi Prices',
    ctaAi: 'Ask KisaanBuddy',
    trustPoint1: 'Official e-NAM & APMC Rates',
    trustPoint2: 'Direct Trade, Zero Cut',
    trustPoint3: 'AI Crop Doctor Diagnosis',
    trustPoint4: 'Hindi, Kannada & 9+ Languages',
    liveBadge: '1,000+ Mandis Live',
    farmerTag: 'Field-Verified Indian Agriculture',
  },
};

export function HeroSection() {
  const { lang } = useLanguage();
  const t = HERO_TRANSLATIONS[lang] || HERO_TRANSLATIONS.en;

  return (
    <section className="relative w-full overflow-hidden bg-[#F7F9F4] dark:bg-stone-950 pt-8 sm:pt-12 md:pt-16 pb-12 sm:pb-20 border-b border-stone-200/80 dark:border-stone-800">
      {/* Subtle agrarian background mesh */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#78B957]/10 dark:bg-[#27834A]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-[#174B35]/5 dark:bg-[#174B35]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Headline & Actions */}
          <StaggerList className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Small Eyebrow Badge */}
            <StaggerItem>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-stone-900 text-[#174B35] dark:text-[#78B957] text-xs font-bold uppercase tracking-wider border border-[#174B35]/20 dark:border-[#78B957]/30 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#27834A] animate-pulse" />
                <span>{t.smallBadge}</span>
              </div>
            </StaggerItem>

            {/* Main Headline in Deep Forest Green */}
            <StaggerItem>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-black text-[#174B35] dark:text-white tracking-tight leading-[1.12]">
                {t.heading}
              </h1>
            </StaggerItem>

            {/* Supporting Copy */}
            <StaggerItem>
              <p className="text-base sm:text-lg text-[#68766C] dark:text-stone-300 max-w-2xl leading-relaxed mx-auto lg:mx-0 font-medium">
                {t.supportingText}
              </p>
            </StaggerItem>

            {/* Two Primary CTA Buttons */}
            <StaggerItem>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                {/* Primary CTA: Explore Mandi Prices */}
                <Link
                  href="/mandi"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#174B35] hover:bg-[#27834A] text-white font-bold text-sm sm:text-base shadow-md shadow-[#174B35]/20 hover:shadow-lg transition-all duration-200 active:scale-95 group"
                >
                  <span>{t.ctaExplore}</span>
                  <ArrowRight className="w-4 h-4 text-[#78B957] group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Secondary CTA: Ask KisaanBuddy */}
                <Link
                  href="/chatbot"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-[#174B35] dark:text-stone-100 font-bold text-sm sm:text-base border border-stone-300 dark:border-stone-700 shadow-xs hover:border-[#27834A]/50 transition-all duration-200 active:scale-95 group"
                >
                  <Sparkles className="w-4 h-4 text-[#F2B84B] group-hover:scale-110 transition-transform" />
                  <span>{t.ctaAi}</span>
                </Link>
              </div>
            </StaggerItem>

            {/* Small, Elegant Trust Indicator Bar */}
            <StaggerItem>
              <div className="pt-5 border-t border-stone-200 dark:border-stone-800 grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2.5 text-xs font-semibold text-[#68766C] dark:text-stone-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#27834A] shrink-0" />
                  <span>{t.trustPoint1}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#27834A] shrink-0" />
                  <span>{t.trustPoint2}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#27834A] shrink-0" />
                  <span>{t.trustPoint3}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#27834A] shrink-0" />
                  <span>{t.trustPoint4}</span>
                </div>
              </div>
            </StaggerItem>

          </StaggerList>

          {/* Right Column: Real Indian Farming Photography */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative group"
          >
            {/* Soft natural drop shadow */}
            <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-[0_12px_40px_rgba(23,75,53,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              
              {/* Authentic Indian Farmer Photograph */}
              <div className="relative h-72 sm:h-80 md:h-96 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                <img
                  src="/images/hero/hero-indian-farmer.jpg"
                  alt="Authentic Indian Farmer in Agricultural Field"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#174B35]/80 via-[#174B35]/15 to-transparent pointer-events-none" />

                {/* Live Mandis Verified Tag */}
                <div className="absolute top-3.5 left-3.5 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-[#174B35] dark:text-[#78B957] border border-[#27834A]/20 shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#27834A] animate-pulse" />
                  <span>{t.liveBadge}</span>
                </div>

                {/* Bottom Caption */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#F2B84B] text-[#174B35] text-[10px] font-black uppercase tracking-wider mb-1">
                    {t.farmerTag}
                  </div>
                  <p className="text-sm sm:text-base font-bold text-white leading-snug">
                    Empowering farmers with verified market prices & diagnostic tools
                  </p>
                </div>
              </div>

              {/* Bottom Quick Service Shortcut Strip */}
              <div className="p-3 sm:p-4 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <Link
                    href="/mandi"
                    className="p-2 rounded-xl bg-[#F7F9F4] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-[#27834A] transition-all group"
                  >
                    <TrendingUp className="w-4 h-4 mx-auto text-[#174B35] dark:text-[#78B957] group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[11px] font-bold text-[#1D2B22] dark:text-stone-300 block line-clamp-1">
                      Mandi
                    </span>
                  </Link>

                  <Link
                    href="/marketplace"
                    className="p-2 rounded-xl bg-[#F7F9F4] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-[#27834A] transition-all group"
                  >
                    <Store className="w-4 h-4 mx-auto text-[#27834A] dark:text-[#78B957] group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[11px] font-bold text-[#1D2B22] dark:text-stone-300 block line-clamp-1">
                      Sell Crop
                    </span>
                  </Link>

                  <Link
                    href="/worker-connect"
                    className="p-2 rounded-xl bg-[#F7F9F4] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-[#27834A] transition-all group"
                  >
                    <Users className="w-4 h-4 mx-auto text-[#174B35] dark:text-[#78B957] group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[11px] font-bold text-[#1D2B22] dark:text-stone-300 block line-clamp-1">
                      Labour
                    </span>
                  </Link>

                  <Link
                    href="/disease"
                    className="p-2 rounded-xl bg-[#F7F9F4] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-[#27834A] transition-all group"
                  >
                    <Bug className="w-4 h-4 mx-auto text-[#27834A] dark:text-[#78B957] group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[11px] font-bold text-[#1D2B22] dark:text-stone-300 block line-clamp-1">
                      Doctor
                    </span>
                  </Link>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
