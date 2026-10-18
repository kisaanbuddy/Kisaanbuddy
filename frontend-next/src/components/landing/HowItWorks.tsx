'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Cpu, FileText, Lightbulb, Sparkles, Sprout, TrendingUp, UserCheck } from 'lucide-react';
import { useLanguage } from '@/lib/language';

export function HowItWorks() {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  const steps = [
    {
      step: '01',
      title: isHi ? 'अपना खेत प्रोफाइल दर्ज करें' : 'Set Up Your Farm Profile',
      subtitle: isHi ? 'भूमि, मिट्टी व फसल की जानकारी' : 'Land, Soil & Crop Identity',
      desc: isHi 
        ? 'अपने खेतों का रकबा, मिट्टी का प्रकार (काली, दोमट, बलुई), उपलब्ध सिंचाई और बोई गई फसल की किस्म जोड़ें। सिर्फ 2 मिनट का समय लगता है।'
        : 'Enter your plot sizes, soil characteristics, irrigation sources, and current crop varieties. Takes under two minutes on mobile.',
      points: [
        isHi ? 'प्लॉट-वार रकबा और स्वामित्व' : 'Plot-wise acreage and land tenure',
        isHi ? 'मृदा स्वास्थ्य कार्ड या अनुमानित pH' : 'Soil test metrics or estimated texture',
        isHi ? 'बुवाई की तारीख और वर्तमान चरण' : 'Sowing date and active growth stage'
      ]
    },
    {
      step: '02',
      title: isHi ? 'खेत-विशिष्ट AI सलाह पाएं' : 'Get Context-Aware Guidance',
      subtitle: isHi ? 'मौसम, खाद व रोग का सटीक तालमेल' : 'Weather, Nutrients & Crop Doctor',
      desc: isHi 
        ? 'हमारा AI आपके खेत के डेटा को मौसम पूर्वानुमान, मिट्टी की जरूरत और ICAR कृषि पद्धतियों से जोड़कर सटीक सिफारिशें तैयार करता है।'
        : 'The platform correlates your farm parameters with live satellite weather, nutrient deficit models, and ICAR-backed agronomic guidelines.',
      points: [
        isHi ? 'पत्ती की फोटो से तुरंत रोग पहचान' : 'Instant visual disease identification',
        isHi ? 'छिड़काव और सिंचाई के लिए सुरक्षित खिड़की' : 'Safe spraying & irrigation windows',
        isHi ? 'यूरिया और डीएपी की संतुलित खुराक' : 'Stage-specific NPK fertilizer dosage'
      ]
    },
    {
      step: '03',
      title: isHi ? 'सही निर्णय लें और समय पर बेचें' : 'Execute & Maximize Value',
      subtitle: isHi ? 'कम लागत, बेहतर पैदावार और उचित मूल्य' : 'Field Actions & Mandi Realization',
      desc: isHi 
        ? 'खेत में समय पर सही कदम उठाएं, फसल का नुकसान बचाएं, और पास की मंडियों के भाव तुलना करके अपनी फसल का अधिकतम मूल्य पाएं।'
        : 'Take prompt field action to protect yields, control disease outbreaks early, and compare nearby mandi trends to sell profitably.',
      points: [
        isHi ? 'खेत डायरी में खाद-दवा का खर्च दर्ज' : 'Track input costs in Khet Diary',
        isHi ? '1,000+ मंडियों के ताज़ा भाव तुलना' : 'Compare 1,000+ APMC & eNAM rates',
        isHi ? 'मार्केटप्लेस में सीधे खरीदारों से जुड़ें' : 'Connect directly with buyers on marketplace'
      ]
    }
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-card relative border-b border-border/60 overflow-hidden">
      
      {/* Background radial glow */}
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[700px] h-[300px] bg-emerald-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs mb-4">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{isHi ? 'सरल 3 चरणों में काम' : 'SIMPLE 3-STEP WORKFLOW'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-foreground leading-[1.15]">
            {isHi ? 'KisaanBuddy कैसे काम करता है।' : 'How KisaanBuddy Works.'}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
            {isHi 
              ? 'बिना किसी जटिलता के, आपके मोबाइल फोन पर उपलब्ध 3 आसान चरण जो आपकी खेती के हर फैसले को मजबूत बनाते हैं।'
              : 'A transparent, reliable pathway from setting up your digital plot to taking profitable decisions on harvest day.'}
          </p>
        </div>

        {/* 3 Step Process Cards */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 relative">
          
          {steps.map((s, idx) => (
            <div
              key={s.step}
              className="relative rounded-2xl border border-border/80 bg-background p-6 sm:p-7 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-lg transition-all duration-300"
            >
              <div>
                {/* Step Pill & Step Number */}
                <div className="flex items-center justify-between mb-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-800 text-white font-mono font-bold text-base shadow-md shadow-emerald-950/20">
                    {s.step}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    {s.subtitle}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold font-display text-foreground mb-3 leading-snug">
                  {s.title}
                </h3>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6 font-normal">
                  {s.desc}
                </p>

                {/* Bullet Points */}
                <div className="space-y-2.5 pt-4 border-t border-border/50 mb-6">
                  {s.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2.5 text-xs text-foreground/80">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="font-medium leading-tight">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Micro Indicator */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  {idx === 0 && (isHi ? 'चरण 1: 2 मिनट में सेटअप' : 'Step 1: Free 2-minute registration')}
                  {idx === 1 && (isHi ? 'चरण 2: 24/7 AI निगरानी' : 'Step 2: Continuous agronomic sync')}
                  {idx === 2 && (isHi ? 'चरण 3: वास्तविक मुनाफा' : 'Step 3: Measurable harvest value')}
                </span>
              </div>
            </div>
          ))}

        </div>

        {/* Bottom CTA to start */}
        <div className="mt-12 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-lg shadow-emerald-950/20 transition-all active:scale-[0.98]"
          >
            <span>{isHi ? 'निःशुल्क शुरुआत करें' : 'Get Started For Free'}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
