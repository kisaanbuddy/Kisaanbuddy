'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Cpu, FileText, Lightbulb, Sparkles, Sprout, TrendingUp, UserCheck } from 'lucide-react';
import { useLanguage } from '@/lib/language';

export function HowItWorks() {
  const { lang } = useLanguage();
  const isKn = lang === 'kn';
  const isHi = lang === 'hi';

  const steps = [
    {
      step: '01',
      title: isKn ? 'ನಿಮ್ಮ ಜಮೀನಿನ ಪ್ರೊಫೈಲ್ ದಾಖಲಿಸಿ' : isHi ? 'अपना खेत प्रोफाइल दर्ज करें' : 'Set Up Your Farm Profile',
      subtitle: isKn ? 'ಭೂಮಿ, ಮಣ್ಣು ಮತ್ತು ಬೆಳೆ ಗುರುತು' : isHi ? 'भूमि, मिट्टी व फसल की जानकारी' : 'Land, Soil & Crop Identity',
      desc: isKn
        ? 'ನಿಮ್ಮ ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ, ಮಣ್ಣಿನ ಗುಣಲಕ್ಷಣಗಳು (ಕಪ್ಪು, ಕೆಂಪು, ಗೋಡು), ನೀರಾವರಿ ಮೂಲಗಳು ಮತ್ತು ಪ್ರಸ್ತುತ ಬೆಳೆ ತಳಿಗಳನ್ನು ನಮೂದಿಸಿ. ಮೊಬೈಲ್‌ನಲ್ಲಿ ಕೇವಲ 2 ನಿಮಿಷ ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ.'
        : isHi 
        ? 'अपने खेतों का रकबा, मिट्टी का प्रकार (काली, दोमट, बलुई), उपलब्ध सिंचाई और बोई गई फसल की किस्म जोड़ें। सिर्फ 2 मिनट का समय लगता है।'
        : 'Enter your plot sizes, soil characteristics, irrigation sources, and current crop varieties. Takes under two minutes on mobile.',
      points: [
        isKn ? 'ಪ್ಲಾಟ್‌ವಾರು ವಿಸ್ತೀರ್ಣ ಮತ್ತು ಮಾಲೀಕತ್ವ' : isHi ? 'प्लॉट-वार रकबा और स्वामित्व' : 'Plot-wise acreage and land tenure',
        isKn ? 'ಮಣ್ಣಿನ ಪರೀಕ್ಷಾ ವರದಿ ಅಥವಾ ಅಂದಾಜು pH' : isHi ? 'मृदा स्वास्थ्य कार्ड या अनुमानित pH' : 'Soil test metrics or estimated texture',
        isKn ? 'ಬಿತ್ತನೆ ದಿನಾಂಕ ಮತ್ತು ಪ್ರಸ್ತುತ ಬೆಳವಣಿಗೆ ಹಂತ' : isHi ? 'बुवाई की तारीख और वर्तमान चरण' : 'Sowing date and active growth stage'
      ]
    },
    {
      step: '02',
      title: isKn ? 'ಜಮೀನು-ನಿರ್ದಿಷ್ಟ AI ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ' : isHi ? 'खेत-विशिष्ट AI सलाह पाएं' : 'Get Context-Aware Guidance',
      subtitle: isKn ? 'ಹವಾಮಾನ, ಪೋಷಕಾಂಶ ಮತ್ತು ಬೆಳೆ ರಕ್ಷಣೆ' : isHi ? 'मौसम, खाद व रोग का सटीक तालमेल' : 'Weather, Nutrients & Crop Doctor',
      desc: isKn
        ? 'ನಮ್ಮ ವೇದಿಕೆಯು ನಿಮ್ಮ ಜಮೀನಿನ ಮಾಹಿತಿಯನ್ನು ಉಪಗ್ರಹ ಹವಾಮಾನ, ಪೋಷಕಾಂಶ ಕೊರತೆ ಮಾದರಿಗಳು ಮತ್ತು ICAR ಕೃಷಿ ಮಾರ್ಗಸೂಚಿಗಳೊಂದಿಗೆ ಜೋಡಿಸಿ ನಿಖರ ಶಿಫಾರಸುಗಳನ್ನು ನೀಡುತ್ತದೆ.'
        : isHi 
        ? 'हमारा AI आपके खेत के डेटा को मौसम पूर्वानुमान, मिट्टी की जरूरत और ICAR कृषि पद्धतियों से जोड़कर सटीक सिफारिशें तैयार करता है।'
        : 'The platform correlates your farm parameters with live satellite weather, nutrient deficit models, and ICAR-backed agronomic guidelines.',
      points: [
        isKn ? 'ಎಲೆಯ ಫೋಟೋ ಮೂಲಕ ತಕ್ಷಣದ ರೋಗ ಪತ್ತೆ' : isHi ? 'पत्ती की फोटो से तुरंत रोग पहचान' : 'Instant visual disease identification',
        isKn ? 'ಸಿಂಪರಣೆ ಮತ್ತು ನೀರಾವರಿಗೆ ಸುರಕ್ಷಿತ ಅವಧಿ' : isHi ? 'छिड़काव और सिंचाई के लिए सुरक्षित खिड़की' : 'Safe spraying & irrigation windows',
        isKn ? 'ಬೆಳೆಯ ಹಂತಕ್ಕೆ ತಕ್ಕಂತೆ NPK ರಸಗೊಬ್ಬರ ಪ್ರಮಾಣ' : isHi ? 'यूरिया और डीएपी की संतुलित खुराक' : 'Stage-specific NPK fertilizer dosage'
      ]
    },
    {
      step: '03',
      title: isKn ? 'ಸರಿಯಾದ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ ಮತ್ತು ಮೌಲ್ಯ ಹೆಚ್ಚಿಸಿ' : isHi ? 'सही निर्णय लें और समय पर बेचें' : 'Execute & Maximize Value',
      subtitle: isKn ? 'ಕಡಿಮೆ ವೆಚ್ಚ, ಉತ್ತಮ ಇಳುವರಿ ಮತ್ತು ಸೂಕ್ತ ಬೆಲೆ' : isHi ? 'कम लागत, बेहतर पैदावार और उचित मूल्य' : 'Field Actions & Mandi Realization',
      desc: isKn
        ? 'ಇಳುವರಿಯನ್ನು ರಕ್ಷಿಸಲು ತಕ್ಷಣ ಜಮೀನಿನಲ್ಲಿ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ, ರೋಗಗಳನ್ನು ಆರಂಭದಲ್ಲೇ ನಿಯಂತ್ರಿಸಿ ಮತ್ತು ಲಾಭದಾಯಕವಾಗಿ ಮಾರಾಟ ಮಾಡಲು ಹತ್ತಿರದ ಮಂಡಿ ದರಗಳನ್ನು ಹೋಲಿಕೆ ಮಾಡಿ.'
        : isHi 
        ? 'खेत में समय पर सही कदम उठाएं, फसल का नुकसान बचाएं, और पास की मंडियों के भाव तुलना करके अपनी फसल का अधिकतम मूल्य पाएं।'
        : 'Take prompt field action to protect yields, control disease outbreaks early, and compare nearby mandi trends to sell profitably.',
      points: [
        isKn ? 'ಖೇತ್ ಡೈರಿಯಲ್ಲಿ ಒಳಹರಿವಿನ ವೆಚ್ಚಗಳ ನಿರ್ವಹಣೆ' : isHi ? 'खेत डायरी में खाद-दवा का खर्च दर्ज' : 'Track input costs in Khet Diary',
        isKn ? '1,000+ APMC & eNAM ಮಂಡಿ ದರಗಳ ಹೋಲಿಕೆ' : isHi ? '1,000+ मंडियों के ताज़ा भाव तुलना' : 'Compare 1,000+ APMC & eNAM rates',
        isKn ? 'ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ನೇರವಾಗಿ ಖರೀದಿದಾರರೊಂದಿಗೆ ಸಂಪರ್ಕ' : isHi ? 'मार्केटप्लेस में सीधे खरीदारों से जुड़ें' : 'Connect directly with buyers on marketplace'
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
            <span>{isKn ? 'ಸರಳ 3 ಹಂತಗಳ ಕಾರ್ಯವಿಧಾನ' : isHi ? 'सरल 3 चरणों में काम' : 'SIMPLE 3-STEP WORKFLOW'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-foreground leading-[1.15]">
            {isKn ? 'KisaanBuddy ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ.' : isHi ? 'KisaanBuddy कैसे काम करता है।' : 'How KisaanBuddy Works.'}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
            {isKn
              ? 'ಯಾವುದೇ ಗೊಂದಲವಿಲ್ಲದೆ, ನಿಮ್ಮ ಮೊಬೈಲ್‌ನಲ್ಲಿ ಲಭ್ಯವಿರುವ 3 ಸುಲಭ ಹಂತಗಳು ನಿಮ್ಮ ಕೃಷಿ ನಿರ್ಧಾರಗಳನ್ನು ಬಲಪಡಿಸುತ್ತವೆ.'
              : isHi 
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
                  {idx === 0 && (isKn ? 'ಹಂತ 1: 2 ನಿಮಿಷಗಳಲ್ಲಿ ಉಚಿತ ನೋಂದಣಿ' : isHi ? 'चरण 1: 2 मिनट में सेटअप' : 'Step 1: Free 2-minute registration')}
                  {idx === 1 && (isKn ? 'ಹಂತ 2: 24/7 ನಿರಂತರ AI ಕೃಷಿ ಮಾರ್ಗದರ್ಶನ' : isHi ? 'चरण 2: 24/7 AI निगरानी' : 'Step 2: Continuous agronomic sync')}
                  {idx === 2 && (isKn ? 'ಹಂತ 3: ಅಳೆಯಬಹುದಾದ ಕಟಾವು ಮೌಲ್ಯ ಮತ್ತು ಲಾಭ' : isHi ? 'चरण 3: वास्तविक मुनाफा' : 'Step 3: Measurable harvest value')}
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
            <span>{isKn ? 'ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ' : isHi ? 'निःशुल्क शुरुआत करें' : 'Get Started For Free'}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
