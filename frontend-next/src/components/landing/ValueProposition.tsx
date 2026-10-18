'use client';

import Link from 'next/link';
import { Layers, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/language';

export function ValueProposition() {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  const props = [
    {
      icon: Layers,
      title: isHi ? 'अपने खेत को समझें' : 'Understand Your Farm',
      tag: isHi ? 'डिजिटल पहचान' : 'Structured Farm Data',
      description: isHi
        ? 'अपने खेत, विभिन्न प्लॉट्स, फसल किस्मों, मिट्टी परीक्षणों और गतिविधियों का व्यवस्थित डिजिटल रिकॉर्ड रखें।'
        : 'Maintain a structured, permanent record of your farm acreage, individual plots, crop varieties, soil tests, and seasonal farming activities.',
      link: '/profile',
      linkText: isHi ? 'फार्म प्रोफाइल देखें' : 'View Farm Profile',
    },
    {
      icon: Sparkles,
      title: isHi ? 'सटीक और समय पर फैसले लें' : 'Make Informed Decisions',
      tag: isHi ? 'AI फसल सलाह' : 'Context-Aware Guidance',
      description: isHi
        ? 'सामान्य सलाह के बजाय अपने खेत के डेटा, वास्तविक मौसम पूर्वानुमान और ICAR दिशानिर्देशों पर आधारित मार्गदर्शन पाएं।'
        : 'Replace generic advice with guidance generated from your actual crop variety, sowing timeline, soil nutrient balance, and microclimate.',
      link: '/chatbot',
      linkText: isHi ? 'AI सलाहकार से पूछें' : 'Consult AI Advisor',
    },
    {
      icon: TrendingUp,
      title: isHi ? 'मंडी और बाज़ार के अवसर खोजें' : 'Discover Market Opportunities',
      tag: isHi ? 'पारदर्शी व्यापार' : 'Direct Trade',
      description: isHi
        ? 'सरकारी AGMARKNET मंडियों के लाइव भाव देखें और प्रमाणित खरीदारों व FPO से सीधे जुड़कर बिचौलियों का खर्च बचाएं।'
        : 'Compare real-time AGMARKNET APMC mandi arrival prices and connect your standing harvest directly to institutional buyers and FPOs.',
      link: '/marketplace',
      linkText: isHi ? 'मार्केटप्लेस देखें' : 'Explore Marketplace',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-card border-b border-[#E2E8E2] dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#16845B] dark:text-emerald-400">
            {isHi ? 'एकीकृत कृषि मंच' : 'A Unified Farming Platform'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17231B] dark:text-white tracking-tight">
            {isHi ? 'आपके खेत की हर ज़रूरत। एक सरल मंच पर।' : 'Everything Your Farm Needs. One Intelligent Platform.'}
          </h2>
          <p className="text-base text-[#647067] dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {isHi
              ? 'खेत की जानकारी व्यवस्थित रखें, अपनी फसलों के अनुसार सलाह पाएं, स्थानीय मौसम समझें और फसल बेचने के सही अवसर तलाशें।'
              : 'Keep your farm information organized, get guidance relevant to your crops, understand local conditions, and explore opportunities to sell your produce.'}
          </p>
        </div>

        {/* 3 Value Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {props.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-[#E2E8E2] dark:border-slate-800 bg-[#F8FAF7] dark:bg-slate-900/60 p-7 flex flex-col justify-between hover:border-emerald-600/40 transition duration-200 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-[#14532D] dark:text-emerald-300">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#647067] dark:text-slate-400">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#17231B] dark:text-white mb-2.5">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#647067] dark:text-slate-400 leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <Link
                  href={item.link}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14532D] dark:text-emerald-400 hover:text-[#16845B] transition pt-4 border-t border-[#E2E8E2]/80 dark:border-slate-800"
                >
                  <span>{item.linkText}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
