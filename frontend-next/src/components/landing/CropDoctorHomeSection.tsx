'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bug,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileText,
  Phone,
} from 'lucide-react';
import { useLanguage, type Lang } from '@/lib/language';

interface DoctorHomeI18n {
  badge: string;
  title: string;
  subtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  limitationTitle: string;
  limitationDesc: string;
  ctaUpload: string;
  ctaKvk: string;
}

const DOCTOR_HOME_I18N: Record<string, DoctorHomeI18n> = {
  hi: {
    badge: 'फसल स्वास्थ्य निदान',
    title: 'क्रॉप डॉक्टर: पत्ती की फोटो से रोग पहचान',
    subtitle: 'झुलसा, रतुआ, पत्ती धब्बा या कीट प्रकोप को शुरुआती चरण में पहचानें और सही समय पर फसल बचाएं।',
    step1Title: '1. पत्ती की साफ फोटो लें',
    step1Desc: 'खेत में बीमार पौधे की पत्ती, तने या फल की नजदीकी और स्पष्ट तस्वीर अपने फोन से खींचें।',
    step2Title: '2. तुरंत रोग पहचान',
    step2Desc: 'सिस्टम भारतीय फसलों में पाए जाने वाले सामान्य फफूंद, बैक्टीरिया व कीट लक्षणों का विश्लेषण करता है।',
    step3Title: '3. तीन चरणों में सरल उपचार',
    step3Desc: 'तुरंत करने योग्य कार्य, नीम तेल जैसे जैविक विकल्प, और अनुमोदित दवाओं की प्रति एकड़ सही खुराक।',
    limitationTitle: 'संदेह की स्थिति में विशेषज्ञ सहायता (KVK)',
    limitationDesc: 'यदि रोग का लक्षण अस्पष्ट हो या गंभीर प्रकोप हो, तो सीधे अपने जिले के कृषि विज्ञान केंद्र (KVK) वैज्ञानिकों से संपर्क करें।',
    ctaUpload: 'पत्ती की फोटो अपलोड करें',
    ctaKvk: 'KVK वैज्ञानिक निर्देशिका देखें',
  },
  en: {
    badge: 'CROP HEALTH & PROTECTION',
    title: 'Crop Doctor: Diagnose Disease in Simple Steps',
    subtitle: 'Catch fungal blights, rusts, leaf spots, and insect infestations early before they spread across your field.',
    step1Title: '1. Take a Clear Photo',
    step1Desc: 'Capture a close-up photo of the affected leaf, stem, or fruit using your phone camera in good natural light.',
    step2Title: '2. Instant Symptom Analysis',
    step2Desc: 'The system matches visual symptoms against Indian agronomic disease databases and regional crop patterns.',
    step3Title: '3. Readable Treatment Steps',
    step3Desc: 'Clear guidance covering immediate physical sanitation, organic biological remedies, and approved chemical sprays with exact per-acre dosages.',
    limitationTitle: 'Important Limitations & Expert Escalation',
    limitationDesc: 'Visual screening is an advisory aid. For severe, ambiguous, or multi-pest outbreaks, connect directly with verified Krishi Vigyan Kendra (KVK) extension scientists.',
    ctaUpload: 'Upload Photo & Diagnose',
    ctaKvk: 'Explore KVK Directory',
  },
  kn: {
    badge: 'ಬೆಳೆ ಆರೋಗ್ಯ ರಕ್ಷಣೆ',
    title: 'ಕ್ರಾಪ್ ಡಾಕ್ಟರ್: ಎಲೆಯ ಫೋಟೋ ಮೂಲಕ ಸುಲಭ ರೋಗ ಪತ್ತೆ',
    subtitle: 'ಬೆಂಕಿ ರೋಗ, ತುಕ್ಕು ರೋಗ, ಎಲೆ ಚುಕ್ಕೆ ಮತ್ತು ಕೀಟ ಬಾಧೆಯನ್ನು ಆರಂಭಿಕ ಹಂತದಲ್ಲೇ ಪತ್ತೆಹಚ್ಚಿ ನಿಮ್ಮ ಇಳುವರಿ ರಕ್ಷಿಸಿ.',
    step1Title: '1. ಸ್ಪಷ್ಟ ಫೋಟೋ ತೆಗೆಯಿರಿ',
    step1Desc: 'ಬಾಧಿತ ಎಲೆ, ಕಾಂಡ ಅಥವಾ ಹಣ್ಣಿನ ಹತ್ತಿರದ ಸ್ಪಷ್ಟ ಫೋಟೋವನ್ನು ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾದಲ್ಲಿ ತೆಗೆಯಿರಿ.',
    step2Title: '2. ತ್ವರಿತ ರೋಗ ವಿಶ್ಲೇಷಣೆ',
    step2Desc: 'ಭಾರತೀಯ ಕೃಷಿ ಪದ್ಧತಿ ಮತ್ತು ರೋಗಗಳ ದಾಖಲೆಯೊಂದಿಗೆ ರೋಗ ಲಕ್ಷಣಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ.',
    step3Title: '3. ಹಂತ-ಹಂತದ ಚಿಕಿತ್ಸಾ ಕ್ರಮಗಳು',
    step3Desc: 'ತಕ್ಷಣದ ನಿರ್ವಹಣೆ, ಬೇವಿನ ಎಣ್ಣೆಯಂತಹ ಸಾವಯವ ಪರಿಹಾರಗಳು ಮತ್ತು ಶಿಫಾರಸು ಮಾಡಿದ ಔಷಧಿಗಳ ನಿಖರ ಪ್ರಮಾಣ.',
    limitationTitle: 'ತಜ್ಞರ ನೆರವು ಮತ್ತು ಕೆವಿಕೆ (KVK) ಸಂಪರ್ಕ',
    limitationDesc: 'ರೋಗ ಲಕ್ಷಣ ಗಂಭೀರವಾಗಿದ್ದರೆ ಅಥವಾ ಅಸ್ಪಷ್ಟವಾಗಿದ್ದರೆ ನಿಮ್ಮ ಜಿಲ್ಲೆಯ ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರದ (KVK) ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    ctaUpload: 'ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಪರೀಕ್ಷಿಸಿ',
    ctaKvk: 'KVK ವಿಜ್ಞಾನಿಗಳ ಡೈರೆಕ್ಟರಿ',
  },
};

DOCTOR_HOME_I18N.hi_en = DOCTOR_HOME_I18N.en;
DOCTOR_HOME_I18N.mr = DOCTOR_HOME_I18N.hi;
DOCTOR_HOME_I18N.te = DOCTOR_HOME_I18N.en;
DOCTOR_HOME_I18N.ta = DOCTOR_HOME_I18N.en;

export function CropDoctorHomeSection() {
  const { lang } = useLanguage();
  const t = DOCTOR_HOME_I18N[lang] || DOCTOR_HOME_I18N.en;

  return (
    <section className="w-full py-16 sm:py-20 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#174B35]/10 dark:bg-[#78B957]/10 text-[#174B35] dark:text-[#78B957] text-xs font-bold uppercase tracking-wider border border-[#174B35]/20 dark:border-[#78B957]/20">
            <Bug className="w-3.5 h-3.5 text-[#27834A]" />
            <span>{t.badge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-[#174B35] dark:text-white tracking-tight leading-[1.18]">
            {t.title}
          </h2>

          <p className="text-base text-[#68766C] dark:text-stone-300 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Step 1 */}
          <div className="rounded-3xl p-6 sm:p-7 bg-[#F7F9F4] dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-[#174B35] dark:text-[#78B957] shadow-xs">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#174B35] dark:text-white">
                {t.step1Title}
              </h3>
              <p className="text-xs sm:text-sm text-[#68766C] dark:text-stone-300 leading-relaxed">
                {t.step1Desc}
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-[#27834A] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Camera or Gallery Upload</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-3xl p-6 sm:p-7 bg-[#F7F9F4] dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-[#174B35] dark:text-[#78B957] shadow-xs">
                <Bug className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#174B35] dark:text-white">
                {t.step2Title}
              </h3>
              <p className="text-xs sm:text-sm text-[#68766C] dark:text-stone-300 leading-relaxed">
                {t.step2Desc}
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-[#27834A] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Identifies Fungal, Bacterial & Pest Damage</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-3xl p-6 sm:p-7 bg-[#F7F9F4] dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-[#174B35] dark:text-[#78B957] shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#174B35] dark:text-white">
                {t.step3Title}
              </h3>
              <p className="text-xs sm:text-sm text-[#68766C] dark:text-stone-300 leading-relaxed">
                {t.step3Desc}
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-[#27834A] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Organic Remedies + Approved Sprays</span>
            </div>
          </div>

        </div>

        {/* Limitation & Expert Escalation Callout */}
        <div className="p-5 sm:p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-900 dark:text-amber-200 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-amber-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#174B35] dark:text-white">
                {t.limitationTitle}
              </h4>
              <p className="text-xs text-[#68766C] dark:text-stone-300 mt-1 max-w-2xl">
                {t.limitationDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href="/disease"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#27834A] text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>{t.ctaUpload}</span>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
