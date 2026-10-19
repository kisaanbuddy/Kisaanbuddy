'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Shield, Smartphone, Sparkles, Sprout } from 'lucide-react';
import { useLanguage } from '@/lib/language';

export function FinalCTA() {
  const { lang } = useLanguage();
  const isKn = lang === 'kn';
  const isHi = lang === 'hi';

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 text-center bg-background relative overflow-hidden">
      
      {/* Background Graphic Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-emerald-500/[0.04] blur-3xl pointer-events-none -z-10" />

      <div className="mx-auto max-w-4xl rounded-3xl border border-emerald-500/25 bg-gradient-to-b from-card via-card/95 to-emerald-500/[0.04] p-8 sm:p-14 lg:p-16 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        
        {/* Subtle Ambient top bar */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[400px] h-[160px] bg-gradient-to-r from-emerald-500/20 via-amber-500/10 to-teal-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Eyebrow */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs mb-6 select-none">
          <Sprout className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{isKn ? 'ಭಾರತೀಯ ಕೃಷಿಗೆ ಸಮರ್ಪಿತ' : isHi ? 'भारतीय किसानों के लिए समर्पित' : 'DEDICATED TO INDIAN AGRICULTURE'}</span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-foreground leading-[1.15] mb-4">
          {isKn
            ? 'ಕೃಷಿಯಲ್ಲಿ ಹೆಚ್ಚು ಮಾಹಿತಿಯುತ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಲು ಪ್ರಾರಂಭಿಸಿ.'
            : isHi
            ? 'खेती के बेहतर और सुरक्षित फैसले लेना शुरू करें।'
            : 'Start Making More Informed Farming Decisions.'}
        </h2>
        
        {/* Subheading */}
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8 font-medium">
          {isKn
            ? 'ಕೇವಲ 2 ನಿಮಿಷಗಳಲ್ಲಿ ನಿಮ್ಮ ಉಚಿತ ಕೃಷಿ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ. ನಿಮ್ಮ ಜಮೀನಿನ ಮಣ್ಣು, ಹವಾಮಾನ ಮತ್ತು ಬೆಳೆಗೆ ಅನುಗುಣವಾಗಿ ಸ್ಥಳೀಯ ಎಚ್ಚರಿಕೆಗಳು, AI ಬೆಳೆ ರೋಗ ನಿರ್ಣಯ ಮತ್ತು ಮಂಡಿ ದರಗಳನ್ನು ಪಡೆಯಿರಿ.'
            : isHi 
            ? 'सिर्फ 2 मिनट में अपना निःशुल्क फार्म प्रोफाइल बनाएं। अपने खेत की मिट्टी, मौसम, और फसल के अनुसार सटीक सलाह और मंडी भाव पाएं।'
            : 'Create your free Farmer Profile in 2 minutes. Receive localized weather alerts, AI crop diagnosis, soil guidance, and mandi rates tailored specifically to your land.'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center items-center gap-3.5 pt-2">
          <Link href="/signup">
            <button className="rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold h-12 px-8 shadow-lg shadow-emerald-900/25 flex items-center gap-2.5 transition-all duration-200 active:scale-[0.98] text-sm cursor-pointer">
              <span>{isKn ? 'ನನ್ನ ಫಾರ್ಮ್ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ' : isHi ? 'अपना फार्म प्रोफाइल बनाएं' : 'Set Up My Farm Profile'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
          <Link href="/features">
            <button className="rounded-xl border border-border/80 bg-background hover:bg-muted text-foreground font-semibold h-12 px-7 flex items-center gap-2 text-sm shadow-xs transition-all duration-200 active:scale-[0.98] cursor-pointer">
              <span>{isKn ? 'ಎಲ್ಲಾ ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ವೀಕ್ಷಿಸಿ' : isHi ? 'सभी टूल्स देखें' : 'Explore Features'}</span>
            </button>
          </Link>
        </div>

        {/* 3 Real Guarantees (No fake claims) */}
        <div className="flex flex-wrap justify-center items-center gap-6 mt-10 pt-8 border-t border-border/50 text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{isKn ? 'ರೈತರಿಗಾಗಿ 100% ಉಚಿತ' : isHi ? 'किसानों के लिए 100% निःशुल्क' : '100% Free For Farmers'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Smartphone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{isKn ? 'ಪ್ರತಿ ಮೊಬೈಲ್‌ನಲ್ಲೂ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ' : isHi ? 'हर मोबाइल फोन पर समर्थित' : 'Works On Any Mobile Device'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{isKn ? 'ಕನ್ನಡ, ಹಿಂದಿ ಮತ್ತು ಪ್ರಾದೇಶಿಕ ಭಾಷೆಗಳಲ್ಲಿ' : isHi ? 'हिंदी और क्षेत्रीय भाषाओं में' : 'Available In Hindi & English'}</span>
          </div>
        </div>

      </div>
    </section>
  );
}
