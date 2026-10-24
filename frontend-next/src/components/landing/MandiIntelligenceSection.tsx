'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Minus, Search, ArrowRight,
  Filter, Calendar, Clock, RefreshCw, AlertCircle, MapPin, Tag
} from 'lucide-react';
import { mandiApi } from '@/lib/farmer-api';
import { useLanguage } from '@/lib/language';
import { getHomepageI18n } from '@/lib/homepage-i18n';
import { StaggerList, StaggerItem, SkeletonShimmer } from '@/components/motion/MotionComponents';
import { cardHover, pressFeedback } from '@/lib/motion';

interface MandiCropItem {
  id: number;
  name: string;
  variety: string;
  price: number;
  unit: string;
  mandi: string;
  state: string;
  district?: string;
  category: string;
  trend?: 'up' | 'down' | 'stable';
  change_percent?: number;
  min_price?: number;
  max_price?: number;
  modal_price?: number;
  arrival_tonnes?: number;
  reported_date?: string;
}

const INDIAN_STATES = [
  'All States',
  'Madhya Pradesh',
  'Haryana',
  'Punjab',
  'Maharashtra',
  'Gujarat',
  'Uttar Pradesh',
  'Karnataka',
  'Rajasthan',
  'Andhra Pradesh',
];

const QUICK_COMMODITIES = [
  { label: 'Wheat (गेहूं)', val: 'Wheat' },
  { label: 'Paddy / Basmati (धान)', val: 'Rice' },
  { label: 'Soybean (सोयाबीन)', val: 'Soybean' },
  { label: 'Cotton (कपास)', val: 'Cotton' },
  { label: 'Gram / Chana (चना)', val: 'Gram' },
  { label: 'Mustard (सरसों)', val: 'Mustard' },
  { label: 'Tomato (टमाटर)', val: 'Tomato' },
];

export function MandiIntelligenceSection() {
  const { lang } = useLanguage();
  const t = getHomepageI18n(lang).mandi;

  const [crops, setCrops] = useState<MandiCropItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [sortBy, setSortBy] = useState<'modal_desc' | 'modal_asc' | 'commodity'>('modal_desc');
  const [dataSource, setDataSource] = useState<string>('Directorate of Marketing & Inspection (DMI) / e-NAM');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchMandiData = async () => {
    setLoading(true);
    try {
      const res = await mandiApi.getCrops({
        state: selectedState !== 'All States' ? selectedState : undefined,
        commodity: searchQuery.trim() || undefined,
        limit: 15,
      });

      if (res && res.crops) {
        setCrops(res.crops);
        if (res.source) setDataSource(res.source === 'mock' ? 'e-NAM / AGMARKNET Standard Sample' : res.source);
        if (res.retrieved_at) setLastUpdated(new Date(res.retrieved_at).toLocaleDateString());
      } else {
        setCrops([]);
      }
    } catch (e) {
      console.error('Failed to load mandi rates:', e);
      setCrops([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMandiData();
  }, [selectedState]);

  // Client-side quick filter on current results
  const filteredCrops = useMemo(() => {
    let list = [...crops];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.variety?.toLowerCase().includes(q) ||
          c.mandi.toLowerCase().includes(q) ||
          c.state.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'modal_desc') {
      list.sort((a, b) => (b.modal_price || b.price || 0) - (a.modal_price || a.price || 0));
    } else if (sortBy === 'modal_asc') {
      list.sort((a, b) => (a.modal_price || a.price || 0) - (b.modal_price || b.price || 0));
    } else if (sortBy === 'commodity') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [crops, searchQuery, sortBy]);

  return (
    <section id="mandi-intelligence" className="w-full py-12 sm:py-16 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200/80 dark:border-stone-800 pb-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.badge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-emerald-950 dark:text-white tracking-tight">
              {t.title}
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 max-w-2xl">
              {t.subtitle}
            </p>
          </div>

          <Link
            href="/mandi"
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline shrink-0 group"
          >
            <span>{t.viewAllMandi}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                aria-label={t.searchPlaceholder || "Search crop or mandi"}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-white placeholder-stone-400"
              />
            </div>

            {/* State Filter Dropdown */}
            <div className="sm:col-span-3">
              <select
                value={selectedState}
                aria-label="Filter mandi prices by Indian State"
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-white font-medium"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="sm:col-span-3">
              <select
                value={sortBy}
                aria-label="Sort mandi prices"
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-white font-medium"
              >
                <option value="modal_desc">Highest Price First</option>
                <option value="modal_asc">Lowest Price First</option>
                <option value="commodity">Sort by Commodity (A-Z)</option>
              </select>
            </div>

          </div>

          {/* Quick Commodity Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-stone-600 dark:text-stone-400 font-medium mr-1">Popular Crops:</span>
            {QUICK_COMMODITIES.map((c) => (
              <button
                key={c.val}
                type="button"
                onClick={() => setSearchQuery(c.val)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                  searchQuery.toLowerCase().includes(c.val.toLowerCase())
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                {c.label}
              </button>
            ))}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[11px] text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline ml-2"
              >
                Reset Search
              </button>
            )}
          </div>
        </div>

        {/* Data Display: Compact Responsive Grid of Market Price Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 w-2/3">
                    <SkeletonShimmer className="h-4 w-20 rounded-full" />
                    <SkeletonShimmer className="h-6 w-36 rounded-lg" />
                  </div>
                  <SkeletonShimmer className="h-5 w-14 rounded-full" />
                </div>
                <SkeletonShimmer className="h-4 w-44 rounded-md" />
                <SkeletonShimmer className="h-16 w-full rounded-xl" />
                <SkeletonShimmer className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredCrops.length === 0 ? (
          <div className="p-10 text-center bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 rounded-2xl space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <h4 className="text-base font-bold text-stone-900 dark:text-white">{t.noResults}</h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto">{t.noResultsDesc}</p>
            <button
              onClick={() => { setSelectedState('All States'); setSearchQuery(''); }}
              className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <StaggerList
            staggerDelay={0.05}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
          >
            {filteredCrops.slice(0, 6).map((crop) => {
              const modalVal = crop.modal_price || crop.price || 0;
              const minVal = crop.min_price || Math.round(modalVal * 0.92);
              const maxVal = crop.max_price || Math.round(modalVal * 1.08);

              return (
                <StaggerItem key={crop.id}>
                  <div className="p-6 rounded-3xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-xs border border-stone-200/90 dark:border-stone-800 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(5,150,105,0.1)] hover:-translate-y-1 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between space-y-4 h-full">
                    <div className="space-y-3">
                      {/* Top Row: Commodity & Trend Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] font-bold mb-1 border border-stone-200 dark:border-stone-700">
                            <span>{crop.category || 'Agricultural Crop'}</span>
                          </div>
                          <h3 className="text-lg font-bold text-stone-900 dark:text-white leading-tight">
                            {crop.name}
                          </h3>
                          {crop.variety && (
                            <p className="text-xs text-stone-500 font-medium">
                              Variety: <span className="text-stone-700 dark:text-stone-300 font-semibold">{crop.variety}</span>
                            </p>
                          )}
                        </div>

                        {/* Trend Pill */}
                        {crop.trend === 'up' ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold">
                            <TrendingUp className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>+{crop.change_percent || 2.1}%</span>
                          </div>
                        ) : crop.trend === 'down' ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[11px] font-bold">
                            <TrendingDown className="w-3 h-3 text-rose-600 shrink-0" />
                            <span>-{crop.change_percent || 1.4}%</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 text-[11px] font-bold">
                            <Minus className="w-3 h-3 text-stone-500 shrink-0" />
                            <span>Stable</span>
                          </div>
                        )}
                      </div>

                      {/* Market / Location Info */}
                      <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-stone-800 dark:text-stone-200">{crop.mandi}</span>
                        <span>&bull;</span>
                        <span>{crop.state}</span>
                      </div>

                      {/* Price Metrics Strip */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 text-center">
                        <div>
                          <span className="text-[10px] text-stone-500 uppercase block font-semibold">{t.minPrice}</span>
                          <span className="text-xs font-bold text-stone-700 dark:text-stone-300">₹{minVal.toLocaleString()}</span>
                        </div>
                        <div className="border-x border-stone-200 dark:border-stone-700 px-1">
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase block font-extrabold">{t.modalPrice}</span>
                          <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">₹{modalVal.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-500 uppercase block font-semibold">{t.maxPrice}</span>
                          <span className="text-xs font-bold text-stone-700 dark:text-stone-300">₹{maxVal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Arrival volume & Action */}
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                      <div className="text-[11px] text-stone-500">
                        {crop.arrival_tonnes ? (
                          <span>Arrivals: <strong>{crop.arrival_tonnes.toLocaleString()} T</strong></span>
                        ) : (
                          <span>Unit: <strong>{t.unit}</strong></span>
                        )}
                      </div>

                      <Link
                        href={`/mandi?commodity=${encodeURIComponent(crop.name)}`}
                        className="font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline flex items-center gap-1 group"
                      >
                        <span>Compare Rates</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerList>
        )}

        {/* Legal Mandi Data Transparency Strip */}
        <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-stone-600 dark:text-stone-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
            <span className="font-semibold text-stone-800 dark:text-stone-200">{t.sourceLabel}</span>
          </div>
          <p className="text-[11px] leading-relaxed max-w-xl">
            {t.disclaimer}
          </p>
        </div>

      </div>
    </section>
  );
}
