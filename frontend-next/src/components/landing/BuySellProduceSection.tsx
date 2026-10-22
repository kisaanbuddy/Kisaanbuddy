'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Store, ArrowRight, CheckCircle2, ShieldCheck, MapPin,
  Calendar, Package, Sparkles, Building2, Tag, PlusCircle, Search
} from 'lucide-react';
import { produceListingsApi, buyerRequirementsApi, ProduceListingItem, BuyerRequirementItem } from '@/lib/farmer-api';
import { useLanguage } from '@/lib/language';
import { getHomepageI18n } from '@/lib/homepage-i18n';
import { slideInLeft, slideInRight, pressFeedback, MOTION_DURATIONS, MOTION_EASINGS } from '@/lib/motion';

export function BuySellProduceSection() {
  const { lang } = useLanguage();
  const t = getHomepageI18n(lang).buySell;

  const [activeTab, setActiveTab] = useState<'seller' | 'buyer'>('seller');
  const [produceItems, setProduceItems] = useState<ProduceListingItem[]>([]);
  const [buyerItems, setBuyerItems] = useState<BuyerRequirementItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      produceListingsApi.list({ limit: 4 }).catch(() => ({ items: [] })),
      buyerRequirementsApi.list({ limit: 4 }).catch(() => ({ items: [] })),
    ]).then(([prodRes, buyerRes]) => {
      if (isMounted) {
        setProduceItems(prodRes.items || []);
        setBuyerItems(buyerRes.items || []);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  return (
    <section id="buy-sell-marketplace" className="w-full py-12 sm:py-16 bg-stone-50/70 dark:bg-stone-950/50 border-b border-stone-200 dark:border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-emerald-950 dark:text-white tracking-tight">
            {t.title}
          </h2>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300">
            {t.subtitle}
          </p>
        </div>

        {/* 2 Clearly Separated Pathways Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          
          {/* ======================================================== */}
          {/* PATHWAY A: SELL YOUR PRODUCE (FOR FARMERS & FPOs) */}
          {/* ======================================================== */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: MOTION_DURATIONS.reveal, ease: MOTION_EASINGS.gentle }}
            className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-500/20">
                  {t.sellerTab}
                </span>
                <span className="text-xs text-stone-500 font-medium">Direct Farm-Gate Sales</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
                {t.sellerTitle}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                {t.sellerDesc}
              </p>

              {/* Key Features Bullet List */}
              <div className="space-y-2.5 pt-2 text-xs text-stone-700 dark:text-stone-300 font-medium">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{t.sellerPoint1}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{t.sellerPoint2}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{t.sellerPoint3}</span>
                </div>
              </div>

              {/* Active Farmer Listings Preview */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                  {t.recentListingsTitle}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {produceItems.slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 space-y-1 hover:border-emerald-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-stone-900 dark:text-white">{item.crop_name}</span>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                          {item.quantity} {item.quantity_unit}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 truncate">{item.variety || 'Commercial Grade'}</p>
                      <p className="text-[10px] text-stone-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                        <span>{item.district}, {item.state}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Primary Action Button: List Your Crop */}
            <div className="pt-2">
              <Link
                href="/marketplace?action=sell"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t.sellerCta}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </motion.div>

          {/* ======================================================== */}
          {/* PATHWAY B: FIND PRODUCE & BUYERS (FOR TRADERS & FPOs) */}
          {/* ======================================================== */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: MOTION_DURATIONS.reveal, ease: MOTION_EASINGS.gentle }}
            className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-500/20">
                  {t.buyerTab}
                </span>
                <span className="text-xs text-stone-500 font-medium">Verified Institutional Sourcing</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
                {t.buyerTitle}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                {t.buyerDesc}
              </p>

              {/* Key Features Bullet List */}
              <div className="space-y-2.5 pt-2 text-xs text-stone-700 dark:text-stone-300 font-medium">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{t.buyerPoint1}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{t.buyerPoint2}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{t.buyerPoint3}</span>
                </div>
              </div>

              {/* Active Buyer Requirements Preview */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                  {t.recentRequirementsTitle}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {buyerItems.slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 space-y-1 hover:border-emerald-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-stone-900 dark:text-white">{item.commodity}</span>
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
                          Need: {item.required_quantity} {item.quantity_unit}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 dark:text-stone-400 truncate font-medium">
                        {item.buyer_name}
                      </p>
                      <p className="text-[10px] text-stone-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                        <span>{item.buyer_location_district || 'District'}, {item.buyer_location_state || 'India'}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Primary Action Button: Explore Market */}
            <div className="pt-2">
              <Link
                href="/marketplace"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-900 dark:bg-stone-700 dark:hover:bg-stone-600 text-white font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
              >
                <Search className="w-4 h-4" />
                <span>{t.buyerCta}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </motion.div>

        </div>

        {/* Commercial Integrity & Distinction Banner */}
        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-stone-800 dark:text-stone-200">Independent Agricultural Commerce</span>
          </div>
          <p className="text-[11px] leading-relaxed max-w-2xl">
            {t.disclaimer}
          </p>
        </div>

      </div>
    </section>
  );
}
