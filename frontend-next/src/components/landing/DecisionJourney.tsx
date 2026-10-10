'use client';

import Link from 'next/link';
import { ArrowRight, Bug, CloudSun, Landmark, ScanLine, ShoppingBasket, Sparkles, Sprout, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/lib/language';

const tools = [
  { href: '/disease', icon: ScanLine, tone: 'bg-rose-500/10 text-rose-700', en: 'Check crop health', hi: 'फसल की जांच' },
  { href: '/weather', icon: CloudSun, tone: 'bg-sky-500/10 text-sky-700', en: 'Plan for weather', hi: 'मौसम के अनुसार योजना' },
  { href: '/mandi', icon: TrendingUp, tone: 'bg-amber-500/10 text-amber-700', en: 'Compare mandi prices', hi: 'मंडी भाव देखें' },
  { href: '/schemes', icon: Landmark, tone: 'bg-violet-500/10 text-violet-700', en: 'Find useful schemes', hi: 'काम की योजनाएं खोजें' },
];

export function DecisionJourney() {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  return (
    <section className="border-y border-border/70 bg-card py-14 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.82fr_1.18fr] lg:items-center lg:px-8">
        <div>
          <p className="eyebrow"><Sparkles className="h-3.5 w-3.5" />{isHi ? 'खेती के लिए निर्णय प्रणाली' : 'A decision system for your farm'}</p>
          <h2 className="mt-3 max-w-md text-3xl font-bold tracking-[-.04em] text-foreground sm:text-4xl">
            {isHi ? 'सिर्फ जानकारी नहीं। आगे क्या करना है, वह भी।' : 'Not just information. A clear way forward.'}
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            {isHi ? 'KisaanBuddy हर सिग्नल को आपके खेत के लिए एक उपयोगी कदम से जोड़ता है—ताकि आप कम अनुमान लगाएं और बेहतर तैयारी करें।' : 'KisaanBuddy connects every signal to a useful step for your farm—so you can spend less time guessing and more time preparing.'}
          </p>
          <Link href="/dashboard" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-primary/80">
            {isHi ? 'मेरा फार्म डैशबोर्ड खोलें' : 'Open my farm dashboard'} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative rounded-[1.5rem] border border-border bg-[#f8faf5] p-4 sm:p-6 dark:bg-card">
          <div className="absolute bottom-7 left-[15%] top-7 hidden border-l border-dashed border-primary/30 sm:block" />
          <div className="relative grid gap-3">
            {[
              { icon: Sprout, number: '01', title: isHi ? 'खेत की जानकारी' : 'Farm data', body: isHi ? 'आपकी फसल, जगह और खेती की स्थिति' : 'Your crops, location and farm conditions' },
              { icon: Sparkles, number: '02', title: isHi ? 'AI की समझ' : 'AI insight', body: isHi ? 'मौसम, सेहत और बाजार को एक साथ समझें' : 'Weather, crop health and market context together' },
              { icon: Bug, number: '03', title: isHi ? 'स्पष्ट सलाह' : 'Clear recommendation', body: isHi ? 'क्या करें, कब करें और किस बात पर नजर रखें' : 'What to do, when to do it and what to watch' },
              { icon: ShoppingBasket, number: '04', title: isHi ? 'बेहतर परिणाम' : 'Better outcomes', body: isHi ? 'कम जोखिम, बेहतर तैयारी और स्मार्ट बिक्री' : 'Lower risk, better preparation and smarter selling' },
            ].map(({ icon: Icon, number, title, body }) => (
              <div key={number} className="relative z-10 grid grid-cols-[42px_1fr] gap-3 rounded-2xl border border-border/70 bg-card p-3.5 shadow-xs sm:grid-cols-[42px_72px_1fr] sm:items-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-sm">{number}</span>
                <span className="hidden h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex"><Icon className="h-4 w-4" /></span>
                <div><p className="text-xs font-bold text-foreground">{title}</p><p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{body}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-7xl grid-cols-2 gap-3 px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
        {tools.map(({ href, icon: Icon, tone, en, hi }) => (
          <Link key={href} href={href} className="group rounded-2xl border border-border bg-background p-4 transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-sm">
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}><Icon className="h-4 w-4" /></span>
            <p className="mt-3 text-xs font-bold text-foreground group-hover:text-primary">{isHi ? hi : en}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
