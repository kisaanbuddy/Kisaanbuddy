'use client';

import { ShieldCheck, Database, Cpu, WifiOff, FileCheck2, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/language';

export function TrustSection() {
  const { lang } = useLanguage();
  const isKn = lang === 'kn';
  const isHi = lang === 'hi';

  const pillars = [
    {
      icon: Database,
      title: isKn ? 'ಸಾಂಸ್ಥಿಕ ಮತ್ತು ಅಧಿಕೃತ ಡೇಟಾ' : isHi ? 'संस्थागत व सरकारी डेटा' : 'Institutional Data Feeds',
      desc: isKn 
        ? 'ICAR (ಭಾರತೀಯ ಕೃಷಿ ಸಂಶೋಧನಾ ಮಂಡಳಿ) ಪದ್ಧತಿಗಳು, AGMARKNET/eNAM ದೈನಂದಿನ ಮಂಡಿ ದರಗಳು ಮತ್ತು IMD/ಉಪಗ್ರಹ ಹವಾಮಾನ ಡೇಟಾದಿಂದ ನೇರವಾಗಿ ನಿಯಂತ್ರಿಸಲ್ಪಡುತ್ತದೆ.' 
        : isHi 
        ? 'ICAR (भारतीय कृषि अनुसंधान परिषद) पद्धतियां, AGMARKNET/eNAM दैनिक मंडी भाव, और IMD/उपग्रह मौसम डेटा से सीधे संचालित।' 
        : 'Grounded in ICAR agronomic research, official AGMARKNET mandi feeds, and satellite-verified meteorological models.'
    },
    {
      icon: Cpu,
      title: isKn ? 'ಪಾರದರ್ಶಕ AI ಶಿಫಾರಸುಗಳು' : isHi ? 'पारदर्शी AI सिफारिशें' : 'Explainable AI Recommendations',
      desc: isKn 
        ? 'ನಾವು ಕೇವಲ ಔಷಧ ಅಥವಾ ಗೊಬ್ಬರದ ಹೆಸರನ್ನು ಮಾತ್ರ ಹೇಳುವುದಿಲ್ಲ, ಬದಲಾಗಿ ಕಾರಣವನ್ನು ವಿವರಿಸುತ್ತೇವೆ: ಮಣ್ಣಿನ pH ಎಷ್ಟಿತ್ತು, ಹವಾಮಾನ ಹೇಗಿದೆ ಮತ್ತು ಈ ಪ್ರಮಾಣ ಏಕೆ ಅಗತ್ಯ.' 
        : isHi 
        ? 'हम सिर्फ दवा या खाद का नाम नहीं बताते, बल्कि कारण समझाते हैं: मिट्टी का pH क्या था, मौसम कैसा है और यह मात्रा क्यों जरूरी है।' 
        : 'Every alert clearly explains WHY: citing your soil test levels, the active crop stage, and prevailing humidity conditions.'
    },
    {
      icon: ShieldCheck,
      title: isKn ? '100% ರೈತರ ಡೇಟಾ ಗೌಪ್ಯತೆ' : isHi ? '100% किसान डेटा गोपनीयता' : 'Strict Farmer Data Privacy',
      desc: isKn 
        ? 'ನಿಮ್ಮ ಜಮೀನಿನ ಮಾಹಿತಿ ಮತ್ತು ಬೆಳೆ ದಾಖಲೆಗಳು ಸಂಪೂರ್ಣವಾಗಿ ಖಾಸಗಿಯಾಗಿರುತ್ತವೆ. ಇದನ್ನು ಎಂದಿಗೂ ಯಾವುದೇ ಬಾಹ್ಯ ಜಾಹೀರಾತುದಾರರಿಗೆ ಅಥವಾ ಬ್ರೋಕರ್‌ಗಳಿಗೆ ಮಾರಾಟ ಮಾಡಲಾಗುವುದಿಲ್ಲ.' 
        : isHi 
        ? 'आपके खेत की जानकारी और फसल रिकॉर्ड पूरी तरह निजी हैं। इसे कभी किसी बाहरी विज्ञापनदाता या ब्रोकर को नहीं बेचा जाता।' 
        : 'Your farm coordinates, plot sizes, and yield records remain strictly yours. Never sold to commercial aggregators or advertisers.'
    },
    {
      icon: WifiOff,
      title: isKn ? 'ಕಡಿಮೆ ಇಂಟರ್ನೆಟ್‌ನಲ್ಲೂ ಸಶಕ್ತ' : isHi ? 'कमजोर इंटरनेट में भी सक्षम' : 'Low-Bandwidth Resilience',
      desc: isKn 
        ? 'ಗ್ರಾಮೀಣ 2G/3G ನೆಟ್‌ವರ್ಕ್ ಮತ್ತು ಸಾಮಾನ್ಯ ಬಜೆಟ್ ಸ್ಮಾರ್ಟ್‌ಫೋನ್‌ಗಳಲ್ಲಿ ವೇಗವಾಗಿ ಲೋಡ್ ಆಗುವಂತೆ ವಿಶೇಷವಾಗಿ ಆಪ್ಟಿಮೈಸ್ ಮಾಡಲಾಗಿದೆ.' 
        : isHi 
        ? 'ग्रामीण 2G/3G नेटवर्क और साधारण बजट स्मार्टफोन पर तेजी से लोड होने के लिए विशेष रूप से ऑप्टिमाइज किया गया।' 
        : 'Lightweight payloads and offline caching ensure the platform functions seamlessly even on patchy 2G/3G village connections.'
    }
  ];

  return (
    <section id="trust-science" className="py-16 sm:py-24 bg-card border-b border-border/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs mb-4">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>
              {isKn ? 'ವೈಜ್ಞಾನಿಕ ವಿಶ್ವಾಸಾರ್ಹತೆ ಮತ್ತು ಸುರಕ್ಷತೆ' : isHi ? 'वैज्ञानिक विश्वसनीयता व सुरक्षा' : 'TRANSPARENCY & DATA INTEGRITY'}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-foreground leading-[1.15]">
            {isKn
              ? 'ಕೃಷಿ ವಿಜ್ಞಾನದ ಆಧಾರ. ರೈತರ ನಂಬಿಕೆಯ ಮೇಲೆ ನಿರ್ಮಿತ.'
              : isHi
              ? 'विज्ञान पर आधारित। किसानों के विश्वास पर निर्मित।'
              : 'Built on Agricultural Science. Engineered for Trust.'}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
            {isKn
              ? 'ಕೃಷಿಯು ಕೇವಲ ಪ್ರಯೋಗವಲ್ಲ — ಇದು ಲಕ್ಷಾಂತರ ಕುಟುಂಬಗಳ ಜೀವನೋಪಾಯ. ಆದ್ದರಿಂದ KisaanBuddy ಯಲ್ಲಿ ಯಾವುದೇ ಉತ್ಪ್ರೇಕ್ಷೆಯಿಲ್ಲ, ಕೇವಲ ದೃಢೀಕೃತ ಡೇಟಾ ಮತ್ತು ಸಂಪೂರ್ಣ ಪಾರದರ್ಶಕತೆ.'
              : isHi 
              ? 'खेती कोई प्रयोग नहीं है—यह लाखों परिवारों की आजीविका है। इसलिए KisaanBuddy में कोई मनगढ़ंत दावे नहीं हैं, केवल सत्यापित डेटा और पूर्ण पारदर्शिता है।'
              : 'Farming is a livelihood, not a playground for ungrounded AI hallucinations. We hold every advisory to rigorous agronomic standards.'}
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-border/80 bg-background p-6 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-md transition-all duration-200"
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 mb-5 border border-emerald-500/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold font-display text-foreground mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Institutional Attribution Footnote */}
        <div className="mt-12 p-4 rounded-xl border border-border/60 bg-muted/30 text-center max-w-4xl mx-auto">
          <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">{isKn ? 'ಸಾಂಸ್ಥಿಕ ಮೂಲ ಪ್ರಕಟಣೆ: ' : isHi ? 'संस्थागत स्रोत घोषणा: ' : 'Data Attributions: '}</strong>
            {isKn
              ? 'ಮಂಡಿ ದರಗಳು AGMARKNET / eNAM ಪೋರ್ಟಲ್‌ನಿಂದ ಪಡೆಯಲಾಗಿದೆ. ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯು IMD ಮತ್ತು ಮುಕ್ತ ಹವಾಮಾನ ಮಾದರಿಗಳನ್ನು ಆಧರಿಸಿದೆ. ಬೆಳೆ ಸಂರಕ್ಷಣಾ ಪದ್ಧತಿಗಳು ICAR ಮಾನದಂಡಗಳಿಗೆ ಅನುಗುಣವಾಗಿವೆ.'
              : isHi 
              ? 'मंडी भाव AGMARKNET / eNAM पोर्टल से लिए गए हैं। मौसम पूर्वानुमान IMD व ओपन मेटियोलॉजिकल मॉडलों पर आधारित है। फसल पैकेज ICAR संस्तुतियों के अनुरूप हैं।' 
              : 'Mandi pricing powered by AGMARKNET / eNAM portals. Meteorological feeds calibrated with IMD & open weather grids. Crop protection practices conform to ICAR standard packages.'}
          </p>
        </div>

      </div>
    </section>
  );
}
