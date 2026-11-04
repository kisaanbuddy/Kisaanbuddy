"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  ALL_SERVICES,
  SERVICE_CATEGORIES,
  type ServiceCategoryKey,
  type ServiceItem,
} from "./farmerServicesData";
import { FarmerFeatureCard } from "./FarmerFeatureCard";
import type { Lang } from "@/lib/language";
import type { RedesignCopy } from "@/lib/homepage-redesign-i18n";

interface MoreFarmingServicesSectionProps {
  lang: Lang;
  copy: RedesignCopy["moreServices"];
}

export function MoreFarmingServicesSection({
  lang,
  copy,
}: MoreFarmingServicesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryKey | "all">("all");

  // Filter services by category if selected
  const visibleServices = useMemo(() => {
    let list = ALL_SERVICES;
    if (selectedCategory !== "all") {
      list = ALL_SERVICES.filter((s) => s.category === selectedCategory);
    }
    // If not expanded, show only initial 6 cards
    if (!isExpanded && selectedCategory === "all") {
      return list.slice(0, 6);
    }
    return list;
  }, [selectedCategory, isExpanded]);

  // Safe localized text resolution helper
  const resolveLang = (textObj: { hi: string; en: string; kn: string }): string => {
    if (lang === "kn") return textObj.kn || textObj.en;
    if (lang === "en") return textObj.en;
    return textObj.hi || textObj.en;
  };

  return (
    <section
      id="more-services-section"
      aria-labelledby="more-services-heading"
      className="w-full space-y-6 pt-4"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-1 text-xs font-bold text-stone-600 dark:text-stone-300 mb-2">
            <Layers className="h-3.5 w-3.5 text-[#174F34] dark:text-emerald-400" />
            <span>24 Farming Tools</span>
          </div>
          <h2
            id="more-services-heading"
            className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1E293B] dark:text-stone-50 tracking-tight"
          >
            {copy.heading}
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-medium text-[#64748B] dark:text-stone-400">
            {copy.subtitle}
          </p>
        </div>

        {/* View All / Collapse Button */}
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#174F34] hover:bg-[#247A45] text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <span>{isExpanded ? copy.showLess : `${copy.viewAll} (${ALL_SERVICES.length})`}</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* 5 Existing Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`shrink-0 rounded-2xl px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            selectedCategory === "all"
              ? "bg-[#174F34] text-white shadow-xs"
              : "border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700"
          }`}
        >
          {copy.allFilter} ({ALL_SERVICES.length})
        </button>

        {SERVICE_CATEGORIES.map((cat) => {
          const count = ALL_SERVICES.filter((s) => s.category === cat.id).length;
          const CatIcon = cat.icon;
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                setIsExpanded(true); // Automatically expand when a specific category is chosen
              }}
              className={`shrink-0 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#174F34] text-white shadow-xs"
                  : "border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700"
              }`}
            >
              <CatIcon className="h-4 w-4 shrink-0" />
              <span>{resolveLang(cat.title)}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Services Grid (Responsive: 1-col on small phones, 2-col on tablets, 3-col on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 md:gap-5">
        {visibleServices.map((service) => (
          <FarmerFeatureCard
            key={service.id}
            title={resolveLang(service.title)}
            description={resolveLang(service.description)}
            icon={service.icon}
            href={service.href}
            iconColor={service.iconColor}
            badge={service.badge ? resolveLang(service.badge) : undefined}
          />
        ))}
      </div>

      {/* Bottom Expander Toggle if currently collapsed */}
      {!isExpanded && selectedCategory === "all" && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 px-6 py-3 text-xs sm:text-sm font-extrabold text-[#174F34] dark:text-emerald-400 shadow-xs transition-all cursor-pointer"
          >
            <span>{copy.viewAll} ({ALL_SERVICES.length - 6} more)</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}
