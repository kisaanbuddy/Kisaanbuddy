'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CircularGaugeProps {
  value: number;
  label: string;
  unit: string;
  max?: number;
  icon?: LucideIcon;
  iconColor?: string;
  strokeColor?: string;
  glowColor?: string;
  color?: string;
  advice?: string;
  adviceClass?: string;
}

export function CircularGauge({
  value,
  label,
  unit,
  max = 100,
  icon: Icon,
  iconColor = "text-emerald-500",
  strokeColor = "stroke-emerald-500",
  color,
  advice,
  adviceClass = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
}: CircularGaugeProps) {
  const radius = 48;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  // Map value against max
  const effectiveMax = max > 0 ? max : 100;
  const percentage = Math.min(Math.max((value / effectiveMax) * 100, 0), 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between h-full shadow-xs transition-all duration-200 hover:border-border/80 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        {Icon && (
          <div className={`p-1.5 rounded-lg bg-muted/60 ${iconColor}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* SVG Circular Dial Gauge */}
      <div className="flex items-center justify-center my-3 relative">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background track circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              className="stroke-muted/60"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Active progress track circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              className={`transition-all duration-700 ease-out ${strokeColor}`}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          {/* Central Value */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold font-display text-foreground tracking-tight">
              {value}
              <span className="text-xs font-semibold text-muted-foreground ml-0.5">{unit}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Advice Pill */}
      {advice && (
        <div className={`rounded-lg border px-3 py-2 text-xs text-center font-medium leading-snug mt-1 ${adviceClass}`}>
          {advice}
        </div>
      )}
    </div>
  );
}
