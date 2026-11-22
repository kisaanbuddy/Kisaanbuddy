"use client";

import React from "react";
import Link from "next/navigation";
import { useRouter } from "next/navigation";
import { Sparkles, MessageSquare, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/language";

interface AskAIButtonProps {
  prompt: string;
  label?: string;
  subtitle?: string;
  variant?: "pill" | "banner" | "button" | "compact";
  className?: string;
}

export function AskAIButton({
  prompt,
  label,
  subtitle,
  variant = "pill",
  className = "",
}: AskAIButtonProps) {
  const router = useRouter();
  const { lang } = useLanguage();
  const isHindi = lang === "hi" || lang === "hi_en";
  const isKannada = lang === "kn";

  const defaultLabel = isHindi
    ? "AI कृषि सलाहकार से पूछें"
    : isKannada
    ? "AI ಕೃಷಿ ಸಲಹೆಗಾರರನ್ನು ಕೇಳಿ"
    : "Ask KisaanBuddy AI";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/chatbot?prompt=${encodeURIComponent(prompt)}`);
  };

  if (variant === "banner") {
    return (
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick(e as any);
        }}
        className={`group relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-4 sm:p-5 transition-all hover:border-emerald-500/50 hover:shadow-md cursor-pointer ${className}`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                  {label || defaultLabel}
                </h4>
                <span className="rounded-full bg-emerald-600/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Gemini AI
                </span>
              </div>
              {subtitle && (
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 line-clamp-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-colors">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition active:scale-95 ${className}`}
      >
        <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>{label || defaultLabel}</span>
      </button>
    );
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-emerald-700 transition active:scale-95 ${className}`}
      >
        <Sparkles className="h-4 w-4" />
        <span>{label || defaultLabel}</span>
      </button>
    );
  }

  // Default "pill"
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50/90 dark:bg-emerald-950/60 px-4 py-2 text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200 shadow-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/80 transition-all hover:scale-[1.02] active:scale-95 ${className}`}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
        <Sparkles className="h-3 w-3" />
      </span>
      <span>{label || defaultLabel}</span>
      <ArrowRight className="h-3.5 w-3.5 opacity-60" />
    </button>
  );
}
