'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  Sparkles,
  TrendingUp,
  Store,
  Users,
  Bug,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  PhoneCall,
  Globe,
} from 'lucide-react';
import { useLanguage, type Lang } from '@/lib/language';

interface HeroI18nContent {
  smallBadge: string;
  heading: string;
  supportingText: string;
  ctaExplore: string;
  ctaAi: string;
  trustPoint1: string;
  trustPoint2: string;
  trustPoint3: string;
  farmerTag: string;
  liveBadge: string;
  freeTag: string;
}

const HERO_TRANSLATIONS: Record<string, HeroI18nContent> = {
  en: {
    smallBadge: 'YOUR COMPLETE FARMING COMPANION',
    heading: 'Everything You Need to Farm Smarter.',
    supportingText:
      'From checking mandi prices and finding buyers to hiring farm workers, diagnosing crop diseases, and discovering government schemes, KisaanBuddy brings essential farming services together in one place.',
    ctaExplore: 'Explore Farming Services',
    ctaAi: 'Ask KisaanBuddy AI',
    trustPoint1: 'Official e-NAM & APMC Mandi Rates',
    trustPoint2: 'Direct Trade with Zero Middleman Cut',
    trustPoint3: 'Support for 11 Indian Languages & Voice',
    farmerTag: 'Authentic Indian Agriculture',
    liveBadge: '1,000+ Mandis Live',
    freeTag: '100% Free for Farmers',
  },
  hi: {
    smallBadge: 'आपका संपूर्ण खेती साथी',
    heading: 'खेती को बेहतर बनाने के लिए सब कुछ एक जगह।',
    supportingText:
      'मंडी भाव देखने और खरीदार ढूंढने से लेकर खेत मजदूर रखने, फसल रोगों की पहचान करने और सरकारी योजनाओं की जानकारी तक—KisaanBuddy सभी जरूरी कृषि सेवाओं को एक मंच पर लाता है।',
    ctaExplore: 'खेती सेवाएं देखें',
    ctaAi: 'KisaanBuddy AI से पूछें',
    trustPoint1: 'सरकारी e-NAM व APMC अधिकृत मंडी भाव',
    trustPoint2: 'बिना दलाली सीधे खरीदारों से जुड़ें',
    trustPoint3: '11 भारतीय भाषाओं में बोलकर या लिखकर सहायता',
    farmerTag: 'सत्यापित भारतीय कृषि मंच',
    liveBadge: '1,000+ मंडियां लाइव',
    freeTag: 'किसानों के लिए पूर्णतः निःशुल्क',
  },
  kn: {
    smallBadge: 'ನಿಮ್ಮ ಸಂಪೂರ್ಣ ಕೃಷಿ ಒಡನಾಡಿ',
    heading: 'ಸ್ಮಾರ್ಟ್ ಕೃಷಿಗಾಗಿ ನಿಮಗೆ ಬೇಕಾದ ಎಲ್ಲವೂ ಒಂದೇ ಸೂರಿನಡಿ.',
    supportingText:
      'ಮಂಡಿ ದರಗಳನ್ನು ಪರಿಶೀಲಿಸುವುದು ಮತ್ತು ಖರೀದಿದಾರರನ್ನು ಹುಡುಕುವುದರಿಂದ ಹಿಡಿದು ಕೃಷಿ ಕಾರ್ಮಿಕರನ್ನು ನೇಮಿಸಿಕೊಳ್ಳುವುದು, ಬೆಳೆ ರೋಗಗಳನ್ನು ಪತ್ತೆಹಚ್ಚುವುದು ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಕಂಡುಕೊಳ್ಳುವವರೆಗೆ—KisaanBuddy ಎಲ್ಲಾ ಅಗತ್ಯ ಕೃಷಿ ಸೇವೆಗಳನ್ನು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ತರುತ್ತದೆ.',
    ctaExplore: 'ಕೃಷಿ ಸೇವೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ',
    ctaAi: 'KisaanBuddy AI ಕೇಳಿ',
    trustPoint1: 'ಸರ್ಕಾರಿ e-NAM ಮತ್ತು APMC ಅಧಿಕೃತ ಮಂಡಿ ದರಗಳು',
    trustPoint2: 'ಯಾವುದೇ ಕಮಿಷನ್ ಇಲ್ಲದೆ ನೇರ ಸಂಪರ್ಕ',
    trustPoint3: 'ಕನ್ನಡ ಸೇರಿ 11 ಭಾರತೀಯ ಭಾಷೆಗಳಲ್ಲಿ ಧ್ವನಿ ಬೆಂಬಲ',
    farmerTag: 'ನೈಜ ಭಾರತೀಯ ಕೃಷಿ ವೇದಿಕೆ',
    liveBadge: '1,000+ ಮಂಡಿಗಳು ಲೈವ್',
    freeTag: 'ರೈತರಿಗೆ ಸಂಪೂರ್ಣ ಉಚಿತ',
  },
  mr: {
    smallBadge: 'तुमचा संपूर्ण शेती साथीदार',
    heading: 'स्मार्ट शेतीसाठी आवश्यक सर्वकाही एकाच ठिकाणी.',
    supportingText:
      'मंडी भाव तपासणे आणि खरेदीदार शोधण्यापासून ते शेतमजूर मिळवणे, पिकांचे रोग ओळखणे आणि सरकारी योजना शोधण्यापर्यंत—KisaanBuddy सर्व आवश्यक कृषी सेवा एकाच ठिकाणी उपलब्ध करून देतो.',
    ctaExplore: 'कृषी सेवा पहा',
    ctaAi: 'KisaanBuddy AI ला विचारा',
    trustPoint1: 'अधिकृत e-NAM व APMC थेट बाजारभाव',
    trustPoint2: 'मध्यस्थ व कमिशनशिवाय थेट खरेदीदार',
    trustPoint3: 'मराठीसह 11 भारतीय भाषांमध्ये उपलब्ध',
    farmerTag: 'सत्यापित भारतीय कृषी मंच',
    liveBadge: '1,000+ मंडया थेट',
    freeTag: 'शेतकऱ्यांसाठी मोफत',
  },
  te: {
    smallBadge: 'మీ పూర్తి వ్యవసాయ సహచరుడు',
    heading: 'స్మార్ట్ వ్యవసాయం కోసం మీకు అవసరమైనవన్నీ ఒకే చోట.',
    supportingText:
      'మండి ధరలను తనిఖీ చేయడం మరియు కొనుగోలుదారులను కనుగొనడం నుండి వ్యవసాయ కూలీలను నియమించుకోవడం, పంట తెగుళ్లను గుర్తించడం మరియు ప్రభుత్వ పథకాలను తెలుసుకోవడం వరకు—KisaanBuddy అవసరమైన అన్ని సేవలను ఒకే చోట అందిస్తుంది.',
    ctaExplore: 'వ్యవసాయ సేవలను అన్వేషించండి',
    ctaAi: 'KisaanBuddy AI ని అడగండి',
    trustPoint1: 'అధికారిక e-NAM మరియు APMC మార్కెట్ ధరలు',
    trustPoint2: 'ఎలాంటి కమిషన్ లేకుండా ప్రత్యక్ష వ్యాపారం',
    trustPoint3: 'తెలుగుతో సహా 11 భారతీయ భాషల్లో వాయిస్ మద్దతు',
    farmerTag: 'భారతీయ రైతుల వేదిక',
    liveBadge: '1,000+ మార్కెట్లు లైవ్',
    freeTag: 'రైతులకు ఉచితం',
  },
  ta: {
    smallBadge: 'உங்கள் முழுமையான விவசாயத் தோழன்',
    heading: 'புத்திசாலித்தனமான விவசாயத்திற்கு தேவையான அனைத்தும் ஒரே இடத்தில்.',
    supportingText:
      'மண்டி விலைகளை சரிபார்ப்பது மற்றும் வாங்குபவர்களைக் கண்டறிவது முதல் பண்ணைத் தொழிலாளர்களை நியமிப்பது, பயிர் நோய்களைக் கண்டறிவது மற்றும் அரசுத் திட்டங்களை அறிவது வரை—KisaanBuddy அத்தியாவசிய விவசாய சேவைகளை ஒரே இடத்தில் வழங்குகிறது.',
    ctaExplore: 'விவசாய சேவைகளை காண்க',
    ctaAi: 'KisaanBuddy AI-யிடம் கேளுங்கள்',
    trustPoint1: 'அதிகாரப்பூர்வ e-NAM & APMC நேரலை மண்டி விலைகள்',
    trustPoint2: 'இடைத்தரகர்கள் இன்றி நேரடி விற்பனை',
    trustPoint3: 'தமிழ் உட்பட 11 இந்திய மொழிகளில் குரல் ஆதரவு',
    farmerTag: 'இந்திய விவசாய மேடை',
    liveBadge: '1,000+ சந்தைகள் நேரலை',
    freeTag: 'விவசாயிகளுக்கு முற்றிலும் இலவசம்',
  },
  hi_en: {
    smallBadge: 'YOUR COMPLETE FARMING COMPANION',
    heading: 'Everything You Need to Farm Smarter.',
    supportingText:
      'From checking mandi prices and finding buyers to hiring farm workers, diagnosing crop diseases, and discovering government schemes, KisaanBuddy brings essential farming services together in one place.',
    ctaExplore: 'Explore Farming Services',
    ctaAi: 'Ask KisaanBuddy AI',
    trustPoint1: 'Official e-NAM & APMC Mandi Rates',
    trustPoint2: 'Direct Trade with Zero Middleman Cut',
    trustPoint3: 'Support for 11 Indian Languages & Voice',
    farmerTag: 'Authentic Indian Agriculture',
    liveBadge: '1,000+ Mandis Live',
    freeTag: '100% Free for Farmers',
  },
};

export function HeroSection() {
  const { lang } = useLanguage();
  const t = HERO_TRANSLATIONS[lang] || HERO_TRANSLATIONS.en;

  const handleScrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const elem = document.getElementById('features') || document.getElementById('services');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#fbfbf9] via-stone-50/70 to-white dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 pt-8 sm:pt-12 md:pt-16 pb-12 sm:pb-16 border-b border-stone-200/80 dark:border-stone-800">
      {/* Background subtle agrarian pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#05966908_1px,transparent_1px),linear-gradient(to_bottom,#05966908_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Heading, Subtitle & Primary Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Small Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-700/10 text-emerald-900 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-700/20 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>{t.smallBadge}</span>
            </div>

            {/* Main Headline in Dark Navy */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-black text-[#0f241d] dark:text-white tracking-tight leading-[1.12]">
              {t.heading}
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
              {t.supportingText}
            </p>

            {/* Two Primary CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              {/* CTA 1: Explore Farming Services */}
              <a
                href="#features"
                onClick={handleScrollToFeatures}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow transition-all group"
              >
                <span>{t.ctaExplore}</span>
                <ArrowDown className="w-4 h-4 text-emerald-200 group-hover:translate-y-0.5 transition-transform" />
              </a>

              {/* CTA 2: Ask KisaanBuddy AI */}
              <Link
                href="/chatbot"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-[#0f241d] dark:text-stone-100 font-bold text-sm sm:text-base border border-stone-300/90 dark:border-stone-700 shadow-2xs hover:shadow transition-all group"
              >
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>{t.ctaAi}</span>
              </Link>
            </div>

            {/* Three Institutional Trust Pillars */}
            <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2.5 text-xs font-semibold text-stone-600 dark:text-stone-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t.trustPoint1}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t.trustPoint2}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t.trustPoint3}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Authentic Indian Farming Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-md">
              
              {/* Authentic Indian Farmer Photograph */}
              <div className="relative h-64 sm:h-72 md:h-80 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                <img
                  src="/images/hero/hero-indian-farmer.jpg"
                  alt="Authentic Indian Farmer in Agricultural Field"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                {/* Floating Badge: Live Mandis */}
                <div className="absolute top-3 left-3 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-600/20 shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>{t.liveBadge}</span>
                </div>

                {/* Floating Badge: Free for Farmers */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-[11px] font-bold border border-white/20">
                  {t.freeTag}
                </div>

                {/* Bottom Photo Caption */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    KisaanBuddy
                  </p>
                  <p className="text-sm font-extrabold line-clamp-1">
                    Connecting Farmers with Mandis, Buyers & Essential Services
                  </p>
                </div>
              </div>

              {/* Bottom Quick Access Strip */}
              <div className="p-4 bg-stone-50/80 dark:bg-stone-900/80 border-t border-stone-200/70 dark:border-stone-800">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <Link
                    href="/mandi"
                    className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-emerald-500/50 transition-all group"
                  >
                    <TrendingUp className="w-4 h-4 mx-auto text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block line-clamp-1">
                      Mandi Rates
                    </span>
                  </Link>

                  <Link
                    href="/marketplace"
                    className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-emerald-500/50 transition-all group"
                  >
                    <Store className="w-4 h-4 mx-auto text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block line-clamp-1">
                      Marketplace
                    </span>
                  </Link>

                  <Link
                    href="/worker-connect"
                    className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-emerald-500/50 transition-all group"
                  >
                    <Users className="w-4 h-4 mx-auto text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block line-clamp-1">
                      Farm Labour
                    </span>
                  </Link>

                  <Link
                    href="/disease"
                    className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-emerald-500/50 transition-all group"
                  >
                    <Bug className="w-4 h-4 mx-auto text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block line-clamp-1">
                      Crop Health
                    </span>
                  </Link>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
