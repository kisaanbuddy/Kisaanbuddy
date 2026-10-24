'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bug,
  TrendingUp,
  Store,
  Users,
  CloudSun,
  Landmark,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage, type Lang } from '@/lib/language';
import { StaggerList, StaggerItem } from '@/components/motion/MotionComponents';

interface ServiceItem {
  id: string;
  category: string;
  title: string;
  desc: string;
  benefit: string;
  cta: string;
  link: string;
  image: string;
  icon: any;
}

interface QuickActionsI18n {
  eyebrow: string;
  heading: string;
  subtitle: string;
  services: ServiceItem[];
}

const QUICK_ACTIONS_I18N: Record<string, QuickActionsI18n> = {
  hi: {
    eyebrow: 'प्रमुख कृषि सेवाएं',
    heading: 'किसानों के लिए 6 जरूरी सुविधाएं',
    subtitle: 'खेती के हर काम को आसान और फायदेमंद बनाने के लिए व्यावहारिक टूल्स — फसल सुरक्षा से लेकर बाजार में बिक्री तक।',
    services: [
      {
        id: 'crop-doctor',
        category: 'फसल स्वास्थ्य',
        title: 'क्रॉप डॉक्टर (रोग पहचान)',
        desc: 'प्रभावित पत्ती या फल की तस्वीर लेकर तुरंत फसल रोग और कीट प्रकोप की पहचान करें।',
        benefit: 'ICAR-अनुशंसित जैविक व रासायनिक उपचार उपाय',
        cta: 'फसल स्वास्थ्य जांचें',
        link: '/disease',
        image: '/images/crop-doctor/powdery-mildew-leaf.webp',
        icon: Bug,
      },
      {
        id: 'mandi-prices',
        category: 'मंडी भाव',
        title: 'दैनिक मंडी भाव',
        desc: 'देश भर की 1,000+ अधिकृत e-NAM व APMC मंडियों के ताज़ा न्यूनतम, अधिकतम व मॉडल भाव देखें।',
        benefit: 'पास की मंडियों के भावों की तुलना करके सही बाजार चुनें',
        cta: 'मंडी भाव देखें',
        link: '/mandi',
        image: '/images/mandi/grain-market-mandi.webp',
        icon: TrendingUp,
      },
      {
        id: 'sell-crop',
        category: 'फसल बिक्री',
        title: 'अपनी फसल बेचें',
        desc: 'अपनी उपज की जानकारी दर्ज करके सीधे सत्यापित थोक खरीदारों, मिलों व व्यापारियों से जुड़ें।',
        benefit: 'बिना बिचौलियों के शून्य कमीशन पर सीधी बिक्री',
        cta: 'फसल बिक्री लिस्ट करें',
        link: '/marketplace?action=sell',
        image: '/images/crops/punjab-wheat-field.webp',
        icon: Store,
      },
      {
        id: 'worker-connect',
        category: 'खेत मजदूर',
        title: 'वर्कर कनेक्ट (मजदूर खोजें)',
        desc: 'रोपाई, बुवाई, निराई और कटाई के लिए अपने गांव या जिले में कुशल कृषि मजदूर दल खोजें।',
        benefit: 'पारदर्शी दैनिक मजदूरी दर व सीधा फोन संपर्क',
        cta: 'खेत मजदूर खोजें',
        link: '/worker-connect',
        image: '/images/farmers/farmer-field-tending.webp',
        icon: Users,
      },
      {
        id: 'weather-advice',
        category: 'मौसम सलाह',
        title: 'मौसम व कृषि सलाह',
        desc: 'खेत स्तर का वास्तविक तापमान, आगामी 7 दिनों का वर्षा पूर्वानुमान और कृषि मौसम अलर्ट देखें।',
        benefit: 'छिड़काव व सिंचाई के लिए सुरक्षित समय का चुनाव',
        cta: 'मौसम पूर्वानुमान देखें',
        link: '/weather',
        image: '/images/weather/monsoon-farmland.webp',
        icon: CloudSun,
      },
      {
        id: 'schemes',
        category: 'सरकारी योजनाएं',
        title: 'सरकारी योजनाएं व सब्सिडी',
        desc: 'PM-किसान, फसल बीमा (PMFBY), और मृदा स्वास्थ्य कार्ड सहित प्रमुख कृषि सहायता योजनाएं खोजें।',
        benefit: 'स्पष्ट पात्रता शर्तें, समय सीमा व आधिकारिक पोर्टल लिंक',
        cta: 'योजनाएं देखें',
        link: '/schemes',
        image: '/images/hero/hero-indian-farmer.webp',
        icon: Landmark,
      },
    ],
  },
  en: {
    eyebrow: 'CORE AGRICULTURAL SERVICES',
    heading: 'Six Essential Services for Every Farmer',
    subtitle: 'Practical tools engineered to solve real farming needs—from crop health protection to direct market sales.',
    services: [
      {
        id: 'crop-doctor',
        category: 'PLANT HEALTH & DIAGNOSIS',
        title: 'Crop Doctor',
        desc: 'Upload a photo of distressed leaves or stems to identify fungal, bacterial, and pest damage within seconds.',
        benefit: 'Step-by-step ICAR-approved organic & chemical remedies',
        cta: 'Diagnose Crop Health',
        link: '/disease',
        image: '/images/crop-doctor/powdery-mildew-leaf.webp',
        icon: Bug,
      },
      {
        id: 'mandi-prices',
        category: 'DAILY MARKET RATES',
        title: 'Mandi Prices',
        desc: 'Access verified daily commodity rates from 1,000+ government APMC and e-NAM regulated markets across India.',
        benefit: 'Compare neighboring district rates to pick the best mandi',
        cta: 'Check Mandi Prices',
        link: '/mandi',
        image: '/images/mandi/grain-market-mandi.webp',
        icon: TrendingUp,
      },
      {
        id: 'sell-crop',
        category: 'DIRECT CROP TRADING',
        title: 'Sell Your Crop',
        desc: 'Post your harvested produce directly to verified wholesale buyers, food processors, and traders with zero commission.',
        benefit: 'Direct buyer negotiations with zero middleman cuts',
        cta: 'List Harvest for Sale',
        link: '/marketplace?action=sell',
        image: '/images/crops/punjab-wheat-field.webp',
        icon: Store,
      },
      {
        id: 'worker-connect',
        category: 'FARM LABOUR NETWORK',
        title: 'Find Farm Workers',
        desc: 'Connect with agricultural labour crews for seasonal sowing, paddy transplantation, weeding, and harvesting.',
        benefit: 'Transparent daily wages with direct telephone contacts',
        cta: 'Find Farm Workers',
        link: '/worker-connect',
        image: '/images/farmers/farmer-field-tending.webp',
        icon: Users,
      },
      {
        id: 'weather-advice',
        category: 'METEOROLOGY & TIMING',
        title: 'Weather & Farm Advice',
        desc: 'Hyper-local field forecasts with 7-day rainfall outlooks to plan safe pesticide spraying and field operations.',
        benefit: 'Farming-relevant alerts for irrigation and chemical sprays',
        cta: 'View Weather Forecast',
        link: '/weather',
        image: '/images/weather/monsoon-farmland.webp',
        icon: CloudSun,
      },
      {
        id: 'schemes',
        category: 'OFFICIAL SUBSIDIES',
        title: 'Government Schemes',
        desc: 'Discover central and state programs including PM-KISAN, PMFBY crop insurance, and Soil Health Cards.',
        benefit: 'Clear eligibility criteria, deadlines & official portal links',
        cta: 'Explore Govt Schemes',
        link: '/schemes',
        image: '/images/hero/hero-indian-farmer.webp',
        icon: Landmark,
      },
    ],
  },
  kn: {
    eyebrow: 'ಪ್ರಮುಖ ಕೃಷಿ ಸೇವೆಗಳು',
    heading: 'ರೈತರಿಗಾಗಿ 6 ಅಗತ್ಯ ಕೃಷಿ ಸೇವೆಗಳು',
    subtitle: 'ಬೆಳೆ ರಕ್ಷಣೆಯಿಂದ ಮಾರುಕಟ್ಟೆ ಮಾರಾಟದವರೆಗೆ ಕೃಷಿಯ ಪ್ರತಿಯೊಂದು ಹಂತದಲ್ಲೂ ರೈತರಿಗೆ ನೆರವಾಗುವ ನೈಜ ಕೃಷಿ ಪರಿಕರಗಳು.',
    services: [
      {
        id: 'crop-doctor',
        category: 'ಬೆಳೆ ಆರೋಗ್ಯ',
        title: 'ಕ್ರಾಪ್ ಡಾಕ್ಟರ್ (ರೋಗ ಪತ್ತೆ)',
        desc: 'ಬಾಧಿತ ಎಲೆ ಅಥವಾ ಹಣ್ಣಿನ ಫೋಟೋ ತೆಗೆದು ತಕ್ಷಣವೇ ರೋಗ ಮತ್ತು ಕೀಟ ಬಾಧೆಯನ್ನು ನಿಖರವಾಗಿ ಗುರುತಿಸಿ.',
        benefit: 'ಐಸಿಎಆರ್ ಅನುಮೋದಿತ ಸಾವಯವ ಮತ್ತು ರಾಸಾಯನಿಕ ಚಿಕಿತ್ಸಾ ಕ್ರಮಗಳು',
        cta: 'ಬೆಳೆ ಆರೋಗ್ಯ ತಪಾಸಿಸಿ',
        link: '/disease',
        image: '/images/crop-doctor/powdery-mildew-leaf.webp',
        icon: Bug,
      },
      {
        id: 'mandi-prices',
        category: 'ಮಂಡಿ ದರಗಳು',
        title: 'ದೈನಂದಿನ ಮಂಡಿ ದರಗಳು',
        desc: 'ದೇಶದ 1,000+ ಎಪಿಎಂಸಿ ಮತ್ತು ಇ-ನ್ಯಾಮ್ ಮಾರುಕಟ್ಟೆಗಳ ದೈನಂದಿನ ಕನಿಷ್ಠ, ಗರಿಷ್ಠ ಮತ್ತು ಮಾದರಿ ಬೆಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.',
        benefit: 'ಉತ್ತಮ ಬೆಲೆಗೆ ಮಾರಾಟ ಮಾಡಲು ನೆರೆಯ ಮಂಡಿ ದರಗಳ ಹೋಲಿಕೆ',
        cta: 'ಮಂಡಿ ದರ ವೀಕ್ಷಿಸಿ',
        link: '/mandi',
        image: '/images/mandi/grain-market-mandi.webp',
        icon: TrendingUp,
      },
      {
        id: 'sell-crop',
        category: 'ಬೆಳೆ ಮಾರಾಟ',
        title: 'ನಿಮ್ಮ ಬೆಳೆ ಮಾರಿ',
        desc: 'ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲದೆ ನೇರವಾಗಿ ಧಾನ್ಯ ವ್ಯಾಪಾರಿಗಳು, ಗಿರಣಿ ಮಾಲೀಕರು ಮತ್ತು ಸಗಟು ಖರೀದಿದಾರರಿಗೆ ಬೆಳೆ ಮಾರಿ.',
        benefit: 'ಕಮಿಷನ್ ರಹಿತ ನೇರ ನಗದು ವಹಿವಾಟು',
        cta: 'ಬೆಳೆ ಮಾರಾಟ ದಾಖಲಿಸಿ',
        link: '/marketplace?action=sell',
        image: '/images/crops/punjab-wheat-field.webp',
        icon: Store,
      },
      {
        id: 'worker-connect',
        category: 'ಕೃಷಿ ಕಾರ್ಮಿಕರು',
        title: 'ವರ್ಕರ್ ಕನೆಕ್ಟ್ (ಕಾರ್ಮಿಕರನ್ನು ಹುಡುಕಿ)',
        desc: 'ನಾಟಿ, ಕಳೆ ಕೀಳುವುದು ಮತ್ತು ಕೊಯ್ಲು ಕೆಲಸಗಳಿಗಾಗಿ ಹತ್ತಿರದ ಕೃಷಿ ಕಾರ್ಮಿಕರ ತಂಡಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ.',
        benefit: 'ಪಾರದರ್ಶಕ ದೈನಂದಿನ ಕೂಲಿ ಮತ್ತು ನೇರ ಫೋನ್ ಸಂಖ್ಯೆ',
        cta: 'ಕೃಷಿ ಕಾರ್ಮಿಕರನ್ನು ಹುಡುಕಿ',
        link: '/worker-connect',
        image: '/images/farmers/farmer-field-tending.webp',
        icon: Users,
      },
      {
        id: 'weather-advice',
        category: 'ಹವಾಮಾನ ಸಲಹೆ',
        title: 'ಹವಾಮಾನ ಮತ್ತು ಕೃಷಿ ಸಲಹೆ',
        desc: 'ನಿಮ್ಮ ಜಮೀನಿನ ನೈಜ ತಾಪಮಾನ, 7 ದಿನಗಳ ಮಳೆ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಕೃಷಿ ಸಿಂಪರಣಾ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ.',
        benefit: 'ಸಿಂಪರಣೆ ಮತ್ತು ನೀರಾವರಿಗೆ ಸೂಕ್ತ ಸಮಯದ ಆಯ್ಕೆ',
        cta: 'ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ನೋಡಿ',
        link: '/weather',
        image: '/images/weather/monsoon-farmland.webp',
        icon: CloudSun,
      },
      {
        id: 'schemes',
        category: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು',
        title: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸಬ್ಸಿಡಿ',
        desc: 'ಪಿಎಂ-ಕಿಸಾನ್, ಬೆಳೆ ವಿಮೆ (PMFBY), ಮತ್ತು ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಯೋಜನೆಗಳ ನಿಖರ ಮಾಹಿತಿ ಪಡೆಯಿರಿ.',
        benefit: 'ಸ್ಪಷ್ಟ ಅರ್ಹತಾ ಮಾನದಂಡಗಳು ಮತ್ತು ಅಧಿಕೃತ ಜಾಲತಾಣ ಲಿಂಕ್‌ಗಳು',
        cta: 'ಯೋಜನೆಗಳನ್ನು ನೋಡಿ',
        link: '/schemes',
        image: '/images/hero/hero-indian-farmer.webp',
        icon: Landmark,
      },
    ],
  },
};

QUICK_ACTIONS_I18N.hi_en = QUICK_ACTIONS_I18N.en;
QUICK_ACTIONS_I18N.mr = QUICK_ACTIONS_I18N.hi;
QUICK_ACTIONS_I18N.te = QUICK_ACTIONS_I18N.en;
QUICK_ACTIONS_I18N.ta = QUICK_ACTIONS_I18N.en;

export function QuickActionsSection() {
  const { lang } = useLanguage();
  const t = QUICK_ACTIONS_I18N[lang] || QUICK_ACTIONS_I18N.en;

  return (
    <section
      id="quick-actions"
      className="relative w-full py-16 sm:py-20 bg-[#F7F9F4] dark:bg-stone-950 border-b border-stone-200/80 dark:border-stone-800 scroll-mt-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-stone-900 text-[#174B35] dark:text-[#78B957] text-xs font-bold uppercase tracking-wider border border-[#174B35]/20 dark:border-[#78B957]/30 shadow-xs mb-3">
            <span className="w-2 h-2 rounded-full bg-[#27834A]" />
            <span>{t.eyebrow}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#174B35] dark:text-white tracking-tight leading-[1.15]">
            {t.heading}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#4B5D50] dark:text-stone-300 leading-relaxed font-normal">
            {t.subtitle}
          </p>
        </div>

        {/* 6 Visually Consistent Service Cards Grid */}
        <StaggerList
          staggerDelay={0.06}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {t.services.map((item) => {
            const Icon = item.icon;

            return (
              <StaggerItem key={item.id}>
                <div className="flex flex-col justify-between h-full rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-[0_4px_20px_rgba(23,75,53,0.04)] hover:shadow-[0_12px_32px_rgba(23,75,53,0.09)] hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                  
                  {/* Photo Header with Badge */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                    <img
                      src={item.image}
                      alt={item.title}
                      width={760}
                      height={475}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#174B35]/80 via-transparent to-transparent pointer-events-none" />

                    {/* Category Tag */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-white/95 dark:bg-stone-900/95 text-[#174B35] dark:text-[#78B957] border border-stone-200 shadow-xs backdrop-blur-xs">
                        <Icon className="w-3 h-3 text-[#27834A]" />
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-[#174B35] dark:text-white leading-snug mb-2 group-hover:text-[#27834A] transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#4B5D50] dark:text-stone-300 leading-relaxed mb-4">
                        {item.desc}
                      </p>

                      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#F7F9F4] dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60 mb-5">
                        <CheckCircle2 className="w-4 h-4 text-[#27834A] shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold text-[#1D2B22] dark:text-stone-200">
                          {item.benefit}
                        </span>
                      </div>
                    </div>

                    {/* Clear Next Action CTA */}
                    <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
                      <Link
                        href={item.link}
                        className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-[#174B35]/10 hover:bg-[#174B35] dark:bg-[#78B957]/10 dark:hover:bg-[#78B957] text-[#174B35] hover:text-white dark:text-[#78B957] dark:hover:text-stone-950 font-bold text-xs sm:text-sm transition-all duration-200 group/btn"
                      >
                        <span>{item.cta}</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </div>

                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerList>

      </div>
    </section>
  );
}
