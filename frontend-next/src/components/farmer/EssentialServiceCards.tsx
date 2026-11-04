"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { RedesignCopy } from "@/lib/homepage-redesign-i18n";

interface EssentialServiceCardsProps {
  copy: RedesignCopy["essential"];
}

interface ServiceCardData {
  id: string;
  title: string;
  description: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  badge?: string;
}

export function EssentialServiceCards({ copy }: EssentialServiceCardsProps) {
  const cards: ServiceCardData[] = [
    {
      id: "crop-disease",
      title: copy.cropDisease.title,
      description: copy.cropDisease.desc,
      href: "/disease",
      imageSrc: "/images/crop-doctor/powdery-mildew-leaf.webp",
      imageAlt: "Plant leaf showing visible disease symptom for diagnosis",
      badge: "AI Doctor",
    },
    {
      id: "mandi-prices",
      title: copy.mandiPrices.title,
      description: copy.mandiPrices.desc,
      href: "/mandi",
      imageSrc: "/images/mandi/grain-market-mandi.webp",
      imageAlt: "Authentic Indian agricultural grain mandi wholesale market",
      badge: "eNAM Rates",
    },
    {
      id: "weather",
      title: copy.weather.title,
      description: copy.weather.desc,
      href: "/weather",
      imageSrc: "/images/weather/monsoon-farmland.webp",
      imageAlt: "Indian agricultural field under natural weather clouds",
      badge: "IMD Forecast",
    },
    {
      id: "sell-crops",
      title: copy.sellCrops.title,
      description: copy.sellCrops.desc,
      href: "/marketplace",
      imageSrc: "/images/marketplace/vegetable-mandi.webp",
      imageAlt: "Indian farmer with harvested crops in agricultural market",
      badge: "Direct Buyers",
    },
  ];

  return (
    <section aria-labelledby="essential-services-heading" className="w-full">
      {/* Section Header */}
      <div className="mb-5 sm:mb-6">
        <h2
          id="essential-services-heading"
          className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1E293B] dark:text-stone-50 tracking-tight"
        >
          {copy.heading}
        </h2>
        <p className="mt-1 text-xs sm:text-sm font-medium text-[#64748B] dark:text-stone-400">
          {copy.subtitle}
        </p>
      </div>

      {/* Exactly 4 Primary Service Cards: 2-col on mobile, 4-col on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {cards.map((card) => (
          <Link
            key={card.id}
            href={card.href}
            className="group flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs hover:shadow-md hover:border-emerald-500/50 active:scale-[0.98] transition-all duration-200 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30"
          >
            {/* Real Photographic Visual (Authentic Indian Agriculture) */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
              <Image
                src={card.imageSrc}
                alt={card.imageAlt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

              {/* Tag / Badge */}
              {card.badge && (
                <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3">
                  <span className="inline-block rounded-lg bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider">
                    {card.badge}
                  </span>
                </div>
              )}

              {/* Clickable indicator */}
              <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/90 dark:bg-stone-900/90 text-stone-900 dark:text-stone-100 shadow-xs group-hover:bg-[#174F34] group-hover:text-white transition-colors">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>

            {/* Card Content */}
            <div className="flex flex-1 flex-col p-3.5 sm:p-4 md:p-5">
              <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-[#1E293B] dark:text-stone-100 leading-snug group-hover:text-[#174F34] dark:group-hover:text-emerald-400 transition-colors">
                {card.title}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-[#64748B] dark:text-stone-400 line-clamp-2 leading-relaxed">
                {card.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
