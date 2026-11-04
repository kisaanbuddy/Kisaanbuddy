"use client";

import React from "react";
import { Linkedin, Mail, ArrowRight, ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import type { FounderProfile } from "@/lib/data/founders-data";

interface FounderCardProps {
  founder: FounderProfile;
  onViewProfile: (founder: FounderProfile) => void;
}

export function FounderCard({ founder, onViewProfile }: FounderCardProps) {
  return (
    <div className="group relative h-full flex flex-col justify-between rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm hover:shadow-2xl hover:border-emerald-500/50 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden text-left">
      {/* Top Subtle Gradient Stripe */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${founder.gradient}`} />

      {/* Card Content Wrapper */}
      <div className="p-5 sm:p-6 flex flex-col flex-1">
        {/* 4:5 Aspect Ratio Portrait Container */}
        <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-stone-200/80 dark:border-stone-800 bg-stone-100 dark:bg-stone-800/60 shadow-inner mb-5">
          <img
            src={founder.image}
            alt={`Official portrait of ${founder.name}, ${founder.role}`}
            className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
            onError={(e) => {
              // Fallback to original image if needed
              (e.target as HTMLImageElement).src = founder.imageFallback;
            }}
          />

          {/* Top Left Verified Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-500/25 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Founder</span>
          </div>

          {/* Top Right Stake Pill */}
          <div className="absolute top-3 right-3 rounded-full bg-stone-900/80 dark:bg-stone-950/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs">
            {founder.badge}
          </div>
        </div>

        {/* Founder Identity */}
        <div className="space-y-1.5">
          <h3 className="text-xl sm:text-2xl font-black font-display text-stone-900 dark:text-stone-50 tracking-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
            {founder.name}
          </h3>

          <p className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 leading-snug">
            {founder.role}
          </p>
        </div>

        {/* Technical / Professional Expertise Badge */}
        <div className="mt-3.5 pt-3 border-t border-stone-100 dark:border-stone-800/80">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Core Expertise</span>
          </div>
          <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 leading-relaxed">
            {founder.expertise}
          </p>
        </div>

        {/* Short Description */}
        <p className="mt-3 text-xs sm:text-[13px] text-stone-600 dark:text-stone-300 leading-relaxed font-normal flex-1">
          {founder.shortBio}
        </p>

        {/* Verified Institution Tag */}
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
          <span className="truncate">{founder.institution}</span>
          <span className="shrink-0 font-medium text-emerald-700 dark:text-emerald-400">Bengaluru</span>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 sm:p-5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60 flex items-center justify-between gap-2.5 shrink-0">
        {/* Social / Contact Icons */}
        <div className="flex items-center gap-1.5">
          {founder.linkedin && (
            <a
              href={founder.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${founder.name}'s verified LinkedIn profile (opens in new tab)`}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-white hover:bg-[#0077b5] hover:border-[#0077b5] transition-all duration-200 shadow-2xs hover:scale-105 active:scale-95"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          )}

          <a
            href={`mailto:${founder.email}`}
            aria-label={`Email ${founder.name} at ${founder.email}`}
            title={`Email ${founder.name.split(" ")[0]}`}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-white hover:bg-emerald-600 hover:border-emerald-600 transition-all duration-200 shadow-2xs hover:scale-105 active:scale-95"
          >
            <Mail className="h-4 w-4" />
          </a>
        </div>

        {/* View Full Profile Button */}
        <button
          type="button"
          onClick={() => onViewProfile(founder)}
          aria-label={`View full profile and credentials for ${founder.name}`}
          className="flex-1 flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-600 text-emerald-800 dark:text-emerald-300 hover:text-white border border-emerald-300/80 dark:border-emerald-800 font-bold text-xs shadow-2xs transition-all duration-200 group/btn active:scale-98 cursor-pointer"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Full Profile</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
