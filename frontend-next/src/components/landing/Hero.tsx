'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MessageSquare, Shield, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/language';

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-background py-12 border-b border-border/10">
      
      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[140px] dark:bg-emerald-500/[0.04]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-green-500/10 rounded-full blur-[130px] dark:bg-green-500/[0.03]" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 md:px-8 lg:grid-cols-2">
        
        {/* Left Text Column */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
          className="flex flex-col gap-6 text-center lg:text-left"
        >
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/5 px-4 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mx-auto lg:mx-0 select-none shadow-sm animate-pulse-glow">
            <Sparkles className="h-3.5 w-3.5" />
            <span>India&apos;s First AI-Powered Smart Farming Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold leading-[1.08] tracking-tight text-foreground">
            Empowering Agriculture<br />
            <span className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-500 bg-clip-text text-transparent">
              Through AI Intelligence
            </span>
          </h1>

          <p className="text-sm md:text-base text-muted-foreground/90 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            Predict crops, detect diseases, analyze markets, check weather, and access government schemes—all in one place. Powered by custom models tailored for Indian Kisans.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <Link href="/signup">
              <button className="btn-primary flex items-center gap-2 group text-sm h-11 px-6">
                Get Started
                <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>
            <Link href="/chatbot">
              <button className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-6 py-2.5 text-sm font-bold text-foreground backdrop-blur-md transition-all hover:bg-muted/50 hover:border-border/60 active:scale-95 shadow-sm h-11">
                <MessageSquare className="h-4.5 w-4.5 text-emerald-500" />
                Try AI Assistant
              </button>
            </Link>
          </div>

          {/* Quick Stats/Badges */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-5 pt-4 text-xs font-semibold text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
              <span>Free early access</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
              <span>Multi-Language Audio</span>
            </div>
          </div>
        </motion.div>

        {/* Right Illustration Column */}
        <motion.div 
          initial={{ opacity: 0, x: 30, scale: 0.96 }} 
          animate={{ opacity: 1, x: 0, scale: 1 }} 
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }} 
          className="relative select-none w-full max-w-xl mx-auto lg:max-w-none flex justify-center items-center"
        >
          {/* Card Frame with Glow */}
          <div className="relative rounded-3xl p-1 bg-gradient-to-br from-white/10 via-emerald-500/10 to-white/0 dark:from-emerald-500/25 dark:via-teal-500/10 dark:to-transparent shadow-2xl overflow-hidden w-full aspect-[4/3]">
            <Image 
              src="/hero_farmer.png" 
              alt="KrishiAI Futuristic Dashboard" 
              fill
              priority 
              sizes="(max-width: 1024px) 100vw, 50vw" 
              className="object-cover rounded-3xl brightness-[0.98] contrast-[1.02]" 
            />
            
            {/* Glowing morphs inside image */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Floaters */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.6 }} 
            className="absolute -top-4 -right-4 rounded-2xl glass-panel px-4 py-2.5 shadow-xl border-emerald-500/10 bg-background/80"
          >
            <div className="text-xl font-display font-extrabold text-emerald-500">95%</div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Prediction Accuracy</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: -15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.75 }} 
            className="absolute -bottom-4 -left-4 rounded-2xl glass-panel px-4 py-2.5 shadow-xl border-emerald-500/10 bg-background/80"
          >
            <div className="text-lg font-display font-extrabold text-teal-500">9+</div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">AI Intelligence Tools</div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
