"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import {
  X,
  Linkedin,
  Mail,
  GraduationCap,
  MapPin,
  CheckCircle2,
  Sparkles,
  Quote,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import type { FounderProfile } from "@/lib/data/founders-data";

interface FounderModalProps {
  founder: FounderProfile | null;
  onClose: () => void;
}

export function FounderModal({ founder, onClose }: FounderModalProps) {
  useEffect(() => {
    if (!founder) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [founder, onClose]);

  if (!founder) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="founder-modal-title"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-stone-950/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Click outside backdrop */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl overflow-hidden my-auto z-10 max-h-[92vh] flex flex-col">
        {/* Top Gradient Stripe */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${founder.gradient}`} />

        {/* Header with Close */}
        <div className="p-4 sm:p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between gap-4 bg-stone-50/70 dark:bg-stone-900/70">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Founder Profile
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close founder profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {/* Top Section: Portrait & Essential Info */}
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            {/* 4:5 Aspect Ratio Portrait */}
            <div className="relative w-36 sm:w-44 aspect-[4/5] rounded-2xl overflow-hidden border-2 border-emerald-500/30 bg-stone-100 dark:bg-stone-800 shadow-md shrink-0 mx-auto sm:mx-0">
              <img
                src={founder.image}
                alt={founder.name}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  // Fallback if webp fails
                  (e.target as HTMLImageElement).src = founder.imageFallback;
                }}
              />
            </div>

            {/* Profile Overview */}
            <div className="flex-1 space-y-2 text-center sm:text-left w-full">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800">
                {founder.badge}
              </div>

              <h2
                id="founder-modal-title"
                className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-50 font-display tracking-tight"
              >
                {founder.name}
              </h2>

              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                {founder.role}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-stone-600 dark:text-stone-300 pt-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  {founder.institution}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  {founder.location}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-3">
                {founder.linkedin && (
                  <a
                    href={founder.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${founder.name}'s verified LinkedIn profile (opens in new tab)`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0077b5] hover:bg-[#006097] text-white text-xs font-bold shadow-sm transition-all hover:scale-102 active:scale-98"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>Verified LinkedIn</span>
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </a>
                )}

                <a
                  href={`mailto:${founder.email}`}
                  aria-label={`Send email to ${founder.name}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold border border-stone-200 dark:border-stone-700 transition-all hover:scale-102 active:scale-98"
                >
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span>{founder.email}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Vision Quote Banner */}
          <div className="relative rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50/50 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200/80 dark:border-emerald-800/60 p-4 sm:p-5">
            <Quote className="absolute top-3 left-3 h-5 w-5 text-emerald-600/30 -scale-x-100" />
            <p className="text-xs sm:text-sm font-medium italic text-emerald-950 dark:text-emerald-200 pl-6 leading-relaxed">
              "{founder.quote}"
            </p>
          </div>

          {/* Full Biography */}
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Background & Mission</span>
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-stone-600 dark:text-stone-300">
              {founder.fullBio}
            </p>
          </div>

          {/* Technical / Professional Expertise Tags */}
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-800 dark:text-stone-200">
              Technical & Professional Expertise
            </h3>
            <div className="flex flex-wrap gap-2">
              {founder.expertiseTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold border border-stone-200 dark:border-stone-700"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Verified Contributions */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-800 dark:text-stone-200">
              Key Platform Contributions
            </h3>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {founder.verifiedContributions.map((contrib, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 text-xs text-stone-700 dark:text-stone-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{contrib}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Core Responsibilities */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-800 dark:text-stone-200">
              Current Leadership Responsibilities
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {founder.responsibilities.map((resp, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-700 dark:text-stone-300 font-medium"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>{resp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Authenticity Guarantee Footer */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Authenticity Guarantee:</strong> Founder credentials, biographies, and actual photographs are authentic, verified project records of KisaanBuddy.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80 flex items-center justify-between">
          <span className="text-xs text-stone-500 dark:text-stone-400 hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 font-mono text-[10px]">ESC</kbd> to close
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all ml-auto"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
