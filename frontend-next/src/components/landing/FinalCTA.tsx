'use client';

import { useLanguage } from '@/lib/language';
import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FinalCTA() {
  const { t, lang } = useLanguage();

  return (
    <section className="py-20 px-4 md:px-8 text-center bg-background relative overflow-hidden">
      
      {/* Background Graphic Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none -z-10" />

      <div className="mx-auto max-w-4xl rounded-3xl border border-emerald-500/10 bg-gradient-to-r from-emerald-500/[0.04] via-slate-950/[0.02] to-teal-950/[0.04] dark:from-emerald-950/20 dark:via-background dark:to-teal-950/15 p-10 md:p-16 backdrop-blur-sm shadow-2xl relative">
        
        {/* Subtle top decoration */}
        <span className="text-3xl select-none block mb-4">🌱</span>

        <h2 className="text-3xl md:text-5xl font-black font-display tracking-tight text-foreground leading-tight mb-4">
          {lang === "hi" ? "आज ही स्मार्ट खेती शुरू करें" : lang === "kn" ? "ಇಂದೇ ಚುರುಕಾದ ಕೃಷಿಯನ್ನು ಪ್ರಾರಂಭಿಸಿ" : "Start Farming Smarter Today"}
        </h2>
        
        <p className="text-xs md:text-sm text-muted-foreground/80 max-w-md mx-auto leading-relaxed mb-8 font-semibold">
          {lang === "hi" 
            ? "फसलों की सुरक्षा के लिए 9+ उन्नत एआई फीचर्स, लाइव मंडी भाव ट्रैकिंग और पत्ती निदान का लाभ उठाएं। बिल्कुल मुफ्त।" 
            : lang === "kn" 
              ? "ನಿಮ್ಮ ಬೆಳೆಗಳನ್ನು ರಕ್ಷಿಸಲು 9+ ಸುಧಾರಿತ AI ವೈಶಿಷ್ಟ್ಯಗಳು, ಲೈವ್ ಮಂಡಿ ದರಗಳ ಟ್ರ್ಯಾಕಿಂಗ್ ಮತ್ತು ಎಲೆ ರೋಗ ಪತ್ತೆಹಚ್ಚುವಿಕೆಯನ್ನು ಅನ್ಲಾಕ್ ಮಾಡಿ. ಸಂಪೂರ್ಣವಾಗಿ ಉಚಿತ." 
              : "Unlock 9+ advanced AI features, live APMC rates tracking, and leaf diagnostics to protect your crops. Completely free."}
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link href="/signup">
            <Button className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-11 px-6 shadow-lg shadow-emerald-500/15 flex items-center gap-2 group">
              <span>{lang === "hi" ? "KrishiAI शुरू करें" : lang === "kn" ? "KrishiAI ಪ್ರಾರಂಭಿಸಿ" : "Launch KrishiAI"}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" className="rounded-xl border-border/40 hover:bg-white/[0.03] text-foreground font-semibold h-11 px-6 flex items-center gap-2">
              <Mail className="h-4 w-4 text-emerald-500" />
              <span>{t("contactUs")}</span>
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}
