"use client";

import Link from "next/link";
import { type LucideIcon, ArrowRight } from "lucide-react";

export type IconColorTheme =
  | "emerald"
  | "amber"
  | "rose"
  | "sky"
  | "indigo"
  | "teal"
  | "orange"
  | "cyan"
  | "lime"
  | "violet"
  | "blue";

export interface FarmerFeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  iconColor?: IconColorTheme | string;
  badge?: string;
  category?: string;
  className?: string;
}

const COLOR_MAP: Record<IconColorTheme, { container: string; icon: string }> = {
  emerald: {
    container:
      "bg-emerald-50 text-emerald-700 border-emerald-200/90 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
    icon: "text-emerald-700 dark:text-emerald-300",
  },
  amber: {
    container:
      "bg-amber-50 text-amber-700 border-amber-200/90 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
    icon: "text-amber-700 dark:text-amber-300",
  },
  rose: {
    container:
      "bg-rose-50 text-rose-700 border-rose-200/90 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60",
    icon: "text-rose-700 dark:text-rose-300",
  },
  sky: {
    container:
      "bg-sky-50 text-sky-700 border-sky-200/90 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60",
    icon: "text-sky-700 dark:text-sky-300",
  },
  indigo: {
    container:
      "bg-indigo-50 text-indigo-700 border-indigo-200/90 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60",
    icon: "text-indigo-700 dark:text-indigo-300",
  },
  teal: {
    container:
      "bg-teal-50 text-teal-700 border-teal-200/90 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60",
    icon: "text-teal-700 dark:text-teal-300",
  },
  orange: {
    container:
      "bg-orange-50 text-orange-700 border-orange-200/90 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/60",
    icon: "text-orange-700 dark:text-orange-300",
  },
  cyan: {
    container:
      "bg-cyan-50 text-cyan-700 border-cyan-200/90 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/60",
    icon: "text-cyan-700 dark:text-cyan-300",
  },
  lime: {
    container:
      "bg-lime-50 text-lime-800 border-lime-200/90 dark:bg-lime-950/40 dark:text-lime-300 dark:border-lime-800/60",
    icon: "text-lime-800 dark:text-lime-300",
  },
  violet: {
    container:
      "bg-violet-50 text-violet-700 border-violet-200/90 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/60",
    icon: "text-violet-700 dark:text-violet-300",
  },
  blue: {
    container:
      "bg-blue-50 text-blue-700 border-blue-200/90 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
    icon: "text-blue-700 dark:text-blue-300",
  },
};

export function FarmerFeatureCard({
  title,
  description,
  icon: Icon,
  href,
  iconColor = "emerald",
  badge,
  className = "",
}: FarmerFeatureCardProps) {
  const theme =
    COLOR_MAP[iconColor as IconColorTheme] || COLOR_MAP.emerald;

  return (
    <Link
      href={href}
      className={`group relative flex min-h-[145px] sm:min-h-[155px] md:min-h-[160px] flex-col justify-between rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900/95 p-4 sm:p-5 shadow-xs transition-all duration-200 hover:border-emerald-600/40 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.985] active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/20 ${className}`}
    >
      {/* Top row: [ ICON ] ... [ BADGE (optional) ] [ ARROW → ] */}
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border ${theme.container} shadow-xs transition-transform duration-200 group-hover:scale-105`}
        >
          <Icon className={`h-6 w-6 sm:h-7 sm:w-7 stroke-[2.2] ${theme.icon}`} aria-hidden="true" />
        </div>

        <div className="flex items-center gap-2 pt-1">
          {badge && (
            <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              {badge}
            </span>
          )}
          <span className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:bg-emerald-50/80 dark:group-hover:bg-emerald-950/40 transition-all duration-200">
            <ArrowRight className="h-4 w-4 sm:h-4.5 sm:w-4.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </div>

      {/* Bottom text block: Title & Simple Description */}
      <div className="mt-3.5 sm:mt-4">
        <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors duration-150">
          {title}
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-snug">
          {description}
        </p>
      </div>
    </Link>
  );
}

export default FarmerFeatureCard;
