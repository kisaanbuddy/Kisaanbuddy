'use client';

import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FinalCTA() {
  return (
    <section className="py-20 px-4 md:px-8 text-center bg-background relative overflow-hidden">
      
      {/* Background Graphic Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none -z-10" />

      <div className="mx-auto max-w-4xl rounded-3xl border border-emerald-500/10 bg-gradient-to-r from-emerald-950/[0.04] via-slate-950/[0.02] to-teal-950/[0.04] dark:from-emerald-950/20 dark:via-background dark:to-teal-950/15 p-10 md:p-16 backdrop-blur-sm shadow-2xl relative">
        
        {/* Subtle top decoration */}
        <span className="text-3xl select-none block mb-4">🌱</span>

        <h2 className="text-3xl md:text-5xl font-black font-display tracking-tight text-foreground leading-tight mb-4">
          Start Farming Smarter Today
        </h2>
        
        <p className="text-xs md:text-sm text-muted-foreground/80 max-w-md mx-auto leading-relaxed mb-8 font-semibold">
          Unlock 9+ advanced AI features, live APMC rates tracking, and leaf diagnostics to protect your crops. Completely free.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link href="/signup">
            <Button className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-11 px-6 shadow-lg shadow-emerald-500/15 flex items-center gap-2 group">
              <span>Launch KrishiAI</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" className="rounded-xl border-border/40 hover:bg-white/[0.03] text-foreground font-semibold h-11 px-6 flex items-center gap-2">
              <Mail className="h-4 w-4 text-emerald-500" />
              <span>Contact Us</span>
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}
