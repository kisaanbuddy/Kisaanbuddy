'use client';

import Link from 'next/link';
import { ArrowRight, AudioLines, CheckCircle2, CloudRain, MapPin, ScanLine, Sparkles, Sprout, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/lib/language';

export function Hero() {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  return (
    <section className="relative isolate overflow-hidden bg-[#f7f5ed] pb-12 pt-10 sm:pb-16 sm:pt-16 lg:pb-20 lg:pt-20 dark:bg-background">
      <div className="farm-dot-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#c9df9c]/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-sky-200/45 blur-3xl dark:bg-sky-950/20" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8">
        <div className="lg:col-span-7 lg:pr-6">
          <div className="eyebrow mb-5 rounded-full border border-primary/20 bg-card/75 px-3.5 py-2 shadow-xs normal-case tracking-normal">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isHi ? 'भारत के किसानों के लिए AI खेती साथी' : 'An AI farming companion for India'}</span>
          </div>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {isHi ? (
              <>अपना खेत समझें।<br /><span className="text-primary">बेहतर फैसले लें।</span></>
            ) : (
              <>Know Your Farm.<br /><span className="text-primary">Make Better Decisions.</span></>
            )}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {isHi
              ? "आपके खेत का डेटा, AI फसल मार्गदर्शन, स्थानीय मौसम और बाज़ार भाव—सब एक ही जगह।"
              : "Your farm data, AI-powered crop guidance, local weather, and market insights in one place."}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn-primary h-12 px-6 text-sm font-semibold shadow-md inline-flex items-center justify-center gap-2">
              <span>{isHi ? 'अपना खेत सेटअप करें' : 'Set Up My Farm'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/features" className="btn-secondary h-12 px-6 text-sm font-semibold inline-flex items-center justify-center gap-2">
              <Sprout className="h-4 w-4 text-primary" />
              <span>{isHi ? 'सुविधाएं देखें' : 'Explore KisaanBuddy'}</span>
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" />{isHi ? 'आपकी भाषा में' : 'In your language'}</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" />{isHi ? 'मोबाइल के लिए बनाया गया' : 'Built for your phone'}</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" />{isHi ? 'सरल, काम की सलाह' : 'Practical guidance'}</span>
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div className="absolute -inset-3 rounded-[2rem] bg-primary/10 blur-2xl" />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-[#163d31] p-3 shadow-[0_28px_65px_-28px_rgba(17,57,43,.75)]">
            <img src="/hero-farmer-real.png" alt="Farmer checking a crop with KisaanBuddy in a field" className="h-[420px] w-full rounded-[1.25rem] object-cover object-[72%_center] sm:h-[480px]" />
            <div className="absolute inset-x-3 bottom-3 rounded-b-[1.25rem] bg-gradient-to-t from-[#0d2c22]/95 via-[#0d2c22]/32 to-transparent px-5 pb-5 pt-20 text-white">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.16em] text-emerald-200">{isHi ? 'आज का खेत सारांश' : 'Today’s farm brief'}</p>
                  <p className="mt-1 text-sm font-semibold">{isHi ? 'हर जानकारी से एक बेहतर फैसला' : 'Every signal leads to a decision'}</p>
                </div>
                <span className="rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[10px] font-bold backdrop-blur">AI READY</span>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-5 -left-3 hidden w-52 rounded-2xl border border-border/70 bg-card p-3.5 shadow-lg sm:block">
            <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-700"><CloudRain className="h-4 w-4" /></span><div><p className="text-[10px] font-bold text-foreground">{isHi ? 'कल बारिश' : 'Rain tomorrow'}</p><p className="text-[10px] text-muted-foreground">{isHi ? 'आज सिंचाई रोकें' : 'Hold irrigation today'}</p></div></div>
          </div>
          <div className="absolute -right-3 top-8 hidden w-48 rounded-2xl border border-border/70 bg-card p-3.5 shadow-lg sm:block">
            <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700"><TrendingUp className="h-4 w-4" /></span><div><p className="text-[10px] font-bold text-foreground">{isHi ? 'मंडी संकेत' : 'Mandi signal'}</p><p className="text-[10px] text-primary">{isHi ? 'भाव +6% बढ़ा' : 'Prices up 6%'}</p></div></div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-10 grid max-w-7xl grid-cols-1 gap-3 px-4 sm:grid-cols-3 sm:px-6 lg:mt-14 lg:px-8">
        {[
          { icon: MapPin, title: isHi ? 'आपके खेत का संदर्भ' : 'Your farm context', text: isHi ? 'फसल, खेत और स्थान एक जगह' : 'Crop, field and location in one place' },
          { icon: ScanLine, title: isHi ? 'AI से समझ' : 'AI makes sense of it', text: isHi ? 'डेटा को आसान सलाह में बदलें' : 'Turn data into plain-language advice' },
          { icon: Sprout, title: isHi ? 'आज का अगला कदम' : 'Your next best step', text: isHi ? 'काम को समय और प्राथमिकता दें' : 'See what to do, and when to do it' },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/75 p-3.5 shadow-xs backdrop-blur-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
            <div><p className="text-xs font-bold text-foreground">{title}</p><p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{text}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}
