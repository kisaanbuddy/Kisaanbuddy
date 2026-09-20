'use client';

import Link from 'next/link';
import { ArrowRight, CloudSun, Droplets, Leaf, MapPin, ScanLine, Sprout, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/lib/language';

const capabilities = [
  { icon: CloudSun, key: 'weather', href: '/weather' },
  { icon: ScanLine, key: 'disease', href: '/disease' },
  { icon: TrendingUp, key: 'mandi', href: '/mandi' },
];

export function Hero() {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  const label = (key: string) => {
    if (key === 'weather') return isHi ? 'खेत का मौसम' : 'Farm weather';
    if (key === 'disease') return isHi ? 'फसल की जांच' : 'Crop health check';
    return isHi ? 'आज का मंडी भाव' : 'Today’s mandi prices';
  };

  return (
    <section className="relative overflow-hidden border-b border-border bg-[#f7f5ee] py-10 sm:py-16 lg:py-20 dark:bg-background">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_75%_100%,rgba(108,144,78,.14),transparent_58%)]" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-14 lg:px-8">
        <div className="lg:col-span-7">
          <div className="eyebrow mb-5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 normal-case tracking-normal">
            <Leaf className="h-3.5 w-3.5" />
            <span>{isHi ? 'किसानों के रोज़ के फैसलों के लिए' : 'For everyday farm decisions'}</span>
          </div>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.07] tracking-[-.04em] text-foreground sm:text-5xl lg:text-6xl">
            {isHi ? <>हर खेत के लिए<br /><span className="text-primary">साफ़, समय पर सलाह।</span></> : <>Clear, timely advice<br />for <span className="text-primary">every field.</span></>}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {isHi
              ? 'मौसम, फसल की सेहत, मंडी भाव और सरकारी योजनाएं—आपकी भाषा में, एक भरोसेमंद जगह पर।'
              : 'Weather, crop health, mandi prices and government schemes—brought together in one dependable place, in your language.'}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn-primary h-12 px-5 text-sm">
              {isHi ? 'अभी शुरू करें' : 'Get started'} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/disease" className="btn-secondary h-12 px-5 text-sm">
              <ScanLine className="h-4 w-4 text-primary" /> {isHi ? 'फसल की फोटो जांचें' : 'Check a crop photo'}
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">{isHi ? 'मोबाइल पर इस्तेमाल करने के लिए बनाया गया' : 'Made to work beautifully on your phone'}</p>
        </div>

        <div className="lg:col-span-5">
          <div className="overflow-hidden rounded-[1.4rem] border border-[#d8d5c9] bg-card shadow-[0_20px_50px_-30px_rgba(24,57,42,.45)] dark:border-border">
            <div className="flex items-center justify-between border-b border-border bg-[#fbfaf6] px-5 py-4 dark:bg-card">
              <div>
                <p className="text-xs font-bold text-foreground">{isHi ? 'आज का खेत संक्षेप' : 'Today’s farm brief'}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin className="h-3 w-3" /> {isHi ? 'अपना स्थान जोड़ें' : 'Add your location'}</p>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">{isHi ? 'सुबह की जानकारी' : 'Morning update'}</span>
            </div>
            <div className="space-y-3 p-4 sm:p-5">
              <div className="grid grid-cols-[1.1fr_.9fr] gap-3">
                <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
                  <div className="flex items-center justify-between"><CloudSun className="h-5 w-5 text-[#f4c76e]" /><span className="text-[10px] font-medium opacity-80">Weather</span></div>
                  <p className="mt-6 text-3xl font-bold tracking-tight">28°</p>
                  <p className="mt-1 text-xs opacity-85">{isHi ? 'हल्की धूप · हवा शांत' : 'Mild sun · calm wind'}</p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/50 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-700"><Droplets className="h-4 w-4" /></div>
                  <p className="mt-4 text-lg font-bold text-foreground">68%</p>
                  <p className="text-[11px] leading-tight text-muted-foreground">{isHi ? 'मिट्टी की नमी' : 'Soil moisture'}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-[#dce5d7] bg-[#f4f8f0] p-4 dark:border-primary/20 dark:bg-primary/10">
                <div className="flex gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card text-primary shadow-xs"><Sprout className="h-4 w-4" /></span><div><p className="text-xs font-bold text-foreground">{isHi ? 'आज की सलाह' : 'Today’s advice'}</p><p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{isHi ? 'मौसम शांत है—सुबह सिंचाई की योजना बनाने का अच्छा समय है।' : 'Calm weather: a good window to plan morning irrigation.'}</p></div></div>
              </div>
              <div className="divide-y divide-border rounded-xl border border-border bg-card px-4">
                {capabilities.map(({ icon: Icon, key, href }) => <Link key={key} href={href} className="group flex items-center gap-3 py-3"><span className="text-primary"><Icon className="h-4 w-4" /></span><span className="flex-1 text-xs font-semibold text-foreground">{label(key)}</span><ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-1" /></Link>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
