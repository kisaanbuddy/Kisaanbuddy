'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles, Sprout, Send, CheckCheck } from 'lucide-react';
import { useLanguage, type Lang } from '@/lib/language';

interface HowItWorksI18n {
  tag: string;
  title: string;
  desc: string;
  step1: {
    number: string;
    title: string;
    subtitle: string;
    desc: string;
    points: string[];
  };
  step2: {
    number: string;
    title: string;
    subtitle: string;
    desc: string;
    points: string[];
  };
  step3: {
    number: string;
    title: string;
    subtitle: string;
    desc: string;
    points: string[];
  };
  cta: string;
}

const HOW_I18N: Record<string, HowItWorksI18n> = {
  hi: {
    tag: 'सरल 3 चरणों में काम',
    title: 'KisaanBuddy का उपयोग कैसे करें',
    desc: 'बिना किसी परेशानी के अपने मोबाइल फोन से खेती के फैसले लें और जरूरी सेवाओं से सीधे जुड़ें।',
    step1: {
      number: '01',
      title: '1. अपनी जरूरत की सेवा चुनें',
      subtitle: 'फसल डॉक्टर, मंडी भाव, मजदूर या सरकारी योजना',
      desc: 'आपको जिस सेवा की आवश्यकता है उसे चुनें—बीमार पत्ती की जांच, आज के मंडी भाव, मजदूर दल की खोज या फसल बेचने का अवसर।',
      points: [
        'फसल डॉक्टर (रोग पहचान)',
        'दैनिक मंडी भाव व भाव तुलना',
        'खेत मजदूर या फसल खरीदार खोज',
      ],
    },
    step2: {
      number: '02',
      title: '2. अपने खेत या जरूरत की जानकारी दर्ज करें',
      subtitle: 'तस्वीर, फसल का नाम या जरूरत बताएं',
      desc: 'पत्ती की तस्वीर अपलोड करें, अपनी फसल और राज्य चुनें, या मजदूर व फसल बेचने की सरल जानकारी दर्ज करें।',
      points: [
        'कैमरे से पत्ती की साफ फोटो लें',
        'फसल का नाम और जिला चुनें',
        'मजदूरों की संख्या या बिक्री मात्रा दर्ज करें',
      ],
    },
    step3: {
      number: '03',
      title: '3. सटीक सलाह पाएं या सीधे सेवा से जुड़ें',
      subtitle: 'तुरंत समाधान व संपर्क',
      desc: 'उपचार के व्यावहारिक कदम देखें, मंडी भावों की तुलना करें, या बिना किसी दलाली के खरीदारों व मजदूरों से सीधा फोन संपर्क करें।',
      points: [
        'जैविक व अनुशंसित दवा की सही खुराक',
        'अधिकतम भाव वाली नजदीकी मंडी का चयन',
        'खरीदारों और मजदूरों से सीधा फोन संपर्क',
      ],
    },
    cta: 'निःशुल्क शुरुआत करें',
  },
  en: {
    tag: 'SIMPLE 3-STEP PROCESS',
    title: 'How KisaanBuddy Works for Farmers',
    desc: 'A straightforward, practical workflow designed for rural Indian farmers on any mobile phone.',
    step1: {
      number: '01',
      title: '1. Choose the Service You Need',
      subtitle: 'Crop Doctor, Mandi Prices, Workers or Schemes',
      desc: 'Select the exact farming assistance you need—diagnosing leaf symptoms, checking daily market rates, hiring farm labour, or selling your crop.',
      points: [
        'Crop Doctor for disease screening',
        'Mandi prices across 1,000+ APMCs',
        'Workers Connect or Crop Selling',
      ],
    },
    step2: {
      number: '02',
      title: '2. Enter Your Farm Details or Request',
      subtitle: 'Photo, crop variety, or labour requirement',
      desc: 'Upload a leaf photograph, pick your commodity and market state, or post your requirement in a few simple taps.',
      points: [
        'Capture clear leaf photo on mobile',
        'Choose commodity and state filter',
        'Specify harvest quantity or dates',
      ],
    },
    step3: {
      number: '03',
      title: '3. Receive Guidance or Connect Directly',
      subtitle: 'Actionable treatment or direct contact',
      desc: 'Get actionable ICAR-aligned treatment steps, compare neighboring mandi rates, or connect directly with buyers and workers with zero commission.',
      points: [
        'Specific organic and approved sprays',
        'Compare district rates before harvesting',
        'Direct phone connection with no cut',
      ],
    },
    cta: 'Get Started for Free',
  },
  kn: {
    tag: 'ಸರಳ 3 ಹಂತಗಳ ಪ್ರಕ್ರಿಯೆ',
    title: 'KisaanBuddy ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ',
    desc: 'ಯಾವುದೇ ಗೊಂದಲವಿಲ್ಲದೆ ನಿಮ್ಮ ಮೊಬೈಲ್ ಮೂಲಕ ಕೃಷಿ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ ಮತ್ತು ಸೇವೆಗಳನ್ನು ಪಡೆಯಿರಿ.',
    step1: {
      number: '01',
      title: '1. ನಿಮಗೆ ಬೇಕಾದ ಸೇವೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
      subtitle: 'ಬೆಳೆ ರಕ್ಷಣೆ, ಮಂಡಿ ದರ, ಕಾರ್ಮಿಕರು ಅಥವಾ ಯೋಜನೆಗಳು',
      desc: 'ನಿಮ್ಮ ಅಗತ್ಯಕ್ಕೆ ತಕ್ಕ ಸೇವೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ—ಎಲೆ ರೋಗ ತಪಾಸಣೆ, ಮಂಡಿ ದರ ವೀಕ್ಷಣೆ, ಕಾರ್ಮಿಕರ ಹುಡುಕಾಟ ಅಥವಾ ಬೆಳೆ ಮಾರಾಟ.',
      points: [
        'ಕ್ರಾಪ್ ಡಾಕ್ಟರ್ ರೋಗ ತಪಾಸಣೆ',
        '1,000+ ಮಂಡಿಗಳ ನೇರ ಮಾರುಕಟ್ಟೆ ದರ',
        'ಕೃಷಿ ಕಾರ್ಮಿಕರ ಜಾಲ ಮತ್ತು ಬೆಳೆ ಮಾರಾಟ',
      ],
    },
    step2: {
      number: '02',
      title: '2. ಜಮೀನಿನ ವಿವರ ಅಥವಾ ಅಗತ್ಯತೆಯನ್ನು ನಮೂದಿಸಿ',
      subtitle: 'ಫೋಟೋ, ಬೆಳೆಯ ಹೆಸರು ಅಥವಾ ವಿವರ',
      desc: 'ಬಾಧಿತ ಎಲೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, ಬೆಳೆ ಮತ್ತು ರಾಜ್ಯ ಆಯ್ಕೆಮಾಡಿ, ಅಥವಾ ಕಾರ್ಮಿಕರ ಅಗತ್ಯತೆಯ ವಿವರ ದಾಖಲಿಸಿ.',
      points: [
        'ಮೊಬೈಲ್‌ನಲ್ಲಿ ಎಲೆಯ ಸ್ಪಷ್ಟ ಫೋಟೋ ತೆಗೆಯಿರಿ',
        'ಬೆಳೆಯ ಹೆಸರು ಮತ್ತು ಜಿಲ್ಲೆ ನಮೂದಿಸಿ',
        'ಮಾರಾಟದ ಪ್ರಮಾಣ ಅಥವಾ ದಿನಾಂಕ ತಿಳಿಸಿ',
      ],
    },
    step3: {
      number: '03',
      title: '3. ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ ಅಥವಾ ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ',
      subtitle: 'ತಕ್ಷಣದ ಪರಿಹಾರ ಮತ್ತು ನೇರ ಸಂಪರ್ಕ',
      desc: 'ಹಂತ-ಹಂತದ ಚಿಕಿತ್ಸಾ ಕ್ರಮಗಳನ್ನು ವೀಕ್ಷಿಸಿ, ಮಂಡಿ ದರಗಳನ್ನು ಹೋಲಿಕೆ ಮಾಡಿ ಅಥವಾ ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲದೆ ಖರೀದಿದಾರರು ಮತ್ತು ಕಾರ್ಮಿಕರೊಂದಿಗೆ ಮಾತನಾಡಿ.',
      points: [
        'ಸಾವಯವ ಮತ್ತು ಶಿಫಾರಸು ಮಾಡಿದ ಔಷಧಿಗಳು',
        'ಉತ್ತಮ ಬೆಲೆಗೆ ಸೂಕ್ತ ಮಂಡಿಯ ಆಯ್ಕೆ',
        'ನೇರ ಫೋನ್ ಸಂಖ್ಯೆಯೊಂದಿಗೆ ಸಂಪರ್ಕ',
      ],
    },
    cta: 'ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ',
  },
};

HOW_I18N.hi_en = HOW_I18N.en;
HOW_I18N.mr = HOW_I18N.hi;
HOW_I18N.te = HOW_I18N.en;
HOW_I18N.ta = HOW_I18N.en;

export function HowItWorks() {
  const { lang } = useLanguage();
  const t = HOW_I18N[lang] || HOW_I18N.en;

  const steps = [t.step1, t.step2, t.step3];

  return (
    <section id="how-it-works" className="w-full py-16 sm:py-20 bg-stone-50/70 dark:bg-stone-950/60 border-b border-stone-200 dark:border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#174B35]/10 dark:bg-[#78B957]/10 text-[#174B35] dark:text-[#78B957] text-xs font-bold uppercase tracking-wider border border-[#174B35]/20 dark:border-[#78B957]/20">
            <Sparkles className="w-3.5 h-3.5 text-[#27834A]" />
            <span>{t.tag}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-[#174B35] dark:text-white tracking-tight leading-[1.18]">
            {t.title}
          </h2>

          <p className="text-base text-[#68766C] dark:text-stone-300 max-w-2xl mx-auto">
            {t.desc}
          </p>
        </div>

        {/* 3 Simple Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((st, idx) => (
            <div
              key={idx}
              className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-[0_4px_20px_rgba(23,75,53,0.04)] hover:shadow-[0_12px_32px_rgba(23,75,53,0.09)] transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-[#174B35] dark:text-[#78B957]">
                    {st.number}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F7F9F4] dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                    Step {idx + 1}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#174B35] dark:text-white leading-snug">
                  {st.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#68766C] dark:text-stone-300 leading-relaxed">
                  {st.desc}
                </p>

                <ul className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs text-[#1D2B22] dark:text-stone-200">
                  {st.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#27834A] shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-4">
          <Link
            href="/mandi"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#174B35] hover:bg-[#27834A] text-white font-bold text-sm sm:text-base shadow-md transition-all active:scale-95 group"
          >
            <span>{t.cta}</span>
            <ArrowRight className="w-4 h-4 text-[#78B957] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
}
