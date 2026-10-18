'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileSpreadsheet, MapPin, ShieldCheck, Sparkles, Sprout, TestTube2, Tractor } from 'lucide-react';
import { useLanguage } from '@/lib/language';

export function FarmerProfileSection() {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  const highlights = [
    {
      icon: MapPin,
      title: isHi ? 'खेत और प्लॉट मैपिंग' : 'Multi-Plot Land Mapping',
      desc: isHi 
        ? 'अपने प्रत्येक खेत (रकबा, मिट्टी प्रकार, सिंचाई साधन) का अलग रिकॉर्ड रखें।' 
        : 'Organize your farmland into distinct plots with precise acreage, soil type, and water source.'
    },
    {
      icon: TestTube2,
      title: isHi ? 'मृदा स्वास्थ्य कार्ड (NPK & pH)' : 'Soil Health & NPK Records',
      desc: isHi 
        ? 'प्रयोगशाला जांच या अनुमानित डेटा दर्ज करें। AI उसी अनुसार खाद की सही मात्रा बताएगा।' 
        : 'Track lab-tested or estimated pH, Nitrogen, Phosphorus, and Potassium for exact fertilizer dosing.'
    },
    {
      icon: Sprout,
      title: isHi ? 'फसल व बुवाई की तारीखें' : 'Crop Stage & Harvest Tracking',
      desc: isHi 
        ? 'गेहूं, धान, सरसों या दलहन—बुवाई से लेकर कटाई तक हर चरण की तारीख दर्ज करें।' 
        : 'Log sowing dates and crop varieties to get stage-specific agronomic alerts from tillering to maturity.'
    },
    {
      icon: Tractor,
      title: isHi ? 'सिंचाई और उपकरण प्रोफाइल' : 'Irrigation & Machinery Registry',
      desc: isHi 
        ? 'ड्रिप, ट्यूबवेल या नहर—उपलब्ध संसाधनों के आधार पर ही पानी देने का सुझाव।' 
        : 'Personalize weather-smart irrigation advisories based on whether you use drip, canal, or tube-well.'
    }
  ];

  return (
    <section id="farmer-profile" className="py-16 sm:py-24 bg-background relative border-b border-border/60 overflow-hidden">
      {/* Background Subtle Accent */}
      <div className="absolute right-0 top-1/4 w-[450px] h-[450px] bg-emerald-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Eyebrow & Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs mb-4">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{isHi ? 'डिजिटल किसान पहचान' : 'PERMANENT DIGITAL FARM PROFILE'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-foreground leading-[1.15]">
            {isHi ? 'आपके खेत की अपनी डिजिटल पहचान।' : 'Your Farm Has Its Own Digital Identity.'}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
            {isHi 
              ? 'सामान्य सलाह किसी काम की नहीं होती। KisaanBuddy आपके खेत के रकबे, मिट्टी के परीक्षण, फसल की किस्म और बुवाई की तारीख को याद रखता है—ताकि AI आपको वही सलाह दे जो आपके खेत के लिए 100% सही हो।'
              : 'Generic advice rarely works in the field. KisaanBuddy creates a permanent digital memory of your soil health, crop varieties, sowing dates, and irrigation methods—delivering advice tuned to your exact reality.'}
          </p>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Interactive Feature Highlight Cards */}
          <div className="lg:col-span-6 space-y-4">
            {highlights.map((h, i) => (
              <div 
                key={i}
                className="p-5 rounded-2xl border border-border/80 bg-card hover:border-emerald-500/40 hover:shadow-md transition-all duration-200 flex items-start gap-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                  <h.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-foreground font-display flex items-center gap-2">
                    {h.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                    {h.desc}
                  </p>
                </div>
              </div>
            ))}

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link 
                href="/signup" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-900/20 transition-all active:scale-[0.98]"
              >
                <span>{isHi ? 'अपना फार्म प्रोफाइल बनाएं' : 'Build Your Farm Profile'}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link 
                href="/profile" 
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold text-sm transition-colors"
              >
                <span>{isHi ? 'प्रोफाइल डेमो देखें' : 'View Sample Profile'}</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Authentic UI Showcase & Real Photo */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Real Photography Header Banner */}
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-md">
              <img 
                src="/images/soil/soil-ph-testing.jpg" 
                alt="Agricultural specialist evaluating soil sample and testing nutrients"
                className="w-full h-48 sm:h-56 object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-4 sm:p-5">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider mb-1">
                    {isHi ? 'प्रमाणित वैज्ञानिक आधार' : 'Scientific Soil Diagnostics'}
                  </span>
                  <p className="text-white text-xs sm:text-sm font-semibold">
                    {isHi 
                      ? 'मृदा स्वास्थ्य प्रयोगशाला परीक्षण डेटा के साथ सीधा जुड़ाव' 
                      : 'Direct integration with ICAR soil health parameters and laboratory reports'}
                  </p>
                </div>
              </div>
            </div>

            {/* Live Profile Card Representation */}
            <div className="rounded-2xl border border-border/90 bg-card p-5 sm:p-6 shadow-lg relative">
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shadow-inner">
                    KB
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">Chandra Shekhar</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        {isHi ? 'सत्यापित किसान' : 'Verified Farmer'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">Village Rampur, Shamli, Uttar Pradesh</span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                  ID: #KB-8241
                </span>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-xs border-b border-border/60">
                <div className="bg-muted/40 p-2.5 rounded-xl border border-border/50">
                  <span className="text-muted-foreground text-[10px] block uppercase font-bold tracking-wider">{isHi ? 'कुल रकबा' : 'Land Size'}</span>
                  <span className="font-bold text-foreground text-sm mt-0.5 block">4.2 Acres</span>
                  <span className="text-[10px] text-muted-foreground">Owned (पुश्तैनी)</span>
                </div>
                <div className="bg-muted/40 p-2.5 rounded-xl border border-border/50">
                  <span className="text-muted-foreground text-[10px] block uppercase font-bold tracking-wider">{isHi ? 'सक्रिय फसल' : 'Active Crop'}</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm mt-0.5 block">Wheat HD-3086</span>
                  <span className="text-[10px] text-muted-foreground">Plot 1 • 2.5 Ac</span>
                </div>
                <div className="bg-muted/40 p-2.5 rounded-xl border border-border/50">
                  <span className="text-muted-foreground text-[10px] block uppercase font-bold tracking-wider">{isHi ? 'मिट्टी का pH' : 'Soil pH & NPK'}</span>
                  <span className="font-bold text-foreground text-sm mt-0.5 block">6.8 (Medium N)</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Lab Verified ✓</span>
                </div>
                <div className="bg-muted/40 p-2.5 rounded-xl border border-border/50">
                  <span className="text-muted-foreground text-[10px] block uppercase font-bold tracking-wider">{isHi ? 'सिंचाई' : 'Irrigation'}</span>
                  <span className="font-bold text-foreground text-sm mt-0.5 block">Tube-well</span>
                  <span className="text-[10px] text-muted-foreground">Electric Pump</span>
                </div>
              </div>

              {/* AI Context Engine Note */}
              <div className="pt-3 flex items-start gap-2.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-foreground">{isHi ? 'गोपनीय और सुरक्षित: ' : 'Private & Protected: '}</strong>
                  {isHi 
                    ? 'आपका कृषि डेटा केवल आपके व्यक्तिगत सुझावों के लिए सुरक्षित रहता है। इसे कभी किसी बाहरी कंपनी को नहीं बेचा जाता।' 
                    : 'Your farm data is encrypted and used strictly to personalize your agronomic recommendations.'}
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
