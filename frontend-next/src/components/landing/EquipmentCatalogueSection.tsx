'use client';

import Link from 'next/link';
import { ArrowRight, Wrench, ShieldCheck, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/lib/language';
import { getHomepageI18n } from '@/lib/homepage-i18n';

interface EquipmentItem {
  id: number;
  name: string;
  brand: string;
  category: string;
  hpRating?: string;
  specs: string;
  image: string;
  indicativePrice?: string;
}

const EQUIPMENT_ITEMS: EquipmentItem[] = [
  {
    id: 1,
    name: "575 DI Sarpanch Tractor",
    brand: "Mahindra",
    category: "Tractors",
    hpRating: "45 HP",
    specs: "4-Cylinder ELS DI Engine, 1600 kg Hydraulic Lift, Partial Constant Mesh",
    image: "/images/marketplace/tractors/mahindra-575.webp",
    indicativePrice: "Verified OEM Specs",
  },
  {
    id: 2,
    name: "Multi-Speed Drive Rotavator",
    brand: "Fieldking",
    category: "Tillage & Rotary Tillers",
    hpRating: "40–55 HP Required",
    specs: "Multi-speed gearbox, boron steel L/C blades, heavy-duty side gear drive",
    image: "/images/marketplace/implements/fieldking-rotavator.png",
    indicativePrice: "Verified OEM Specs",
  },
  {
    id: 3,
    name: "9100 Self-Propelled Combine Harvester",
    brand: "Dasmesh",
    category: "Combine Harvesters",
    hpRating: "101 HP Turbo",
    specs: "14ft cutter bar, dual straw walkers, high clearance paddy chassis",
    image: "/images/marketplace/harvesters/dasmesh-9100.png",
    indicativePrice: "Verified OEM Specs",
  },
  {
    id: 4,
    name: "Tractor Trailed Boom Sprayer",
    brand: "ASPEE / Fieldking",
    category: "Crop Protection & Sprayers",
    hpRating: "35+ HP PTO",
    specs: "600 Litre chemical tank, 12m folding boom, brass anti-drip nozzles",
    image: "/images/marketplace/implements/boom-sprayer.png",
    indicativePrice: "Verified OEM Specs",
  },
];

const CATEGORY_CHIPS = [
  "Tractors",
  "Rotavators",
  "Power Weeders",
  "Sprayers",
  "Seed Drills",
  "Harvesters",
  "Irrigation Pumps",
];

export function EquipmentCatalogueSection() {
  const { lang } = useLanguage();
  const t = getHomepageI18n(lang).equipment;

  return (
    <section id="equipment-catalogue" className="w-full py-12 sm:py-16 bg-stone-50/60 dark:bg-stone-950/40 border-b border-stone-200 dark:border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200/80 dark:border-stone-800 pb-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
              <Wrench className="w-3.5 h-3.5 text-emerald-600" />
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
            href="/marketplace?tab=equipment"
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline shrink-0 group"
          >
            <span>{t.cta}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORY_CHIPS.map((cat, i) => (
            <Link
              key={i}
              href={`/marketplace?tab=equipment&category=${encodeURIComponent(cat)}`}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all shadow-2xs"
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Equipment Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {EQUIPMENT_ITEMS.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl p-4 sm:p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Product Image */}
                <div className="w-full h-40 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800/80 border border-stone-200/60 dark:border-stone-700/60 flex items-center justify-center p-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500">
                    <span>{item.brand}</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">{item.hpRating}</span>
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 dark:text-white leading-snug">
                    {item.name}
                  </h3>

                  <p className="text-[11px] text-stone-500 leading-relaxed line-clamp-2 pt-1">
                    {item.specs}
                  </p>
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                <span className="text-[10px] font-medium text-stone-400">{item.indicativePrice}</span>
                <Link
                  href={`/marketplace?tab=equipment&search=${encodeURIComponent(item.brand)}`}
                  className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Equipment Distinction Notice */}
        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center gap-3 text-xs text-stone-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-[11px] leading-relaxed">
            {t.disclaimer}
          </p>
        </div>

      </div>
    </section>
  );
}
