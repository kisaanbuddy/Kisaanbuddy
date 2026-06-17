'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CircularGaugeProps {
  value: number;
  label: string;
  unit: string;
  icon: LucideIcon;
  iconColor: string;
  strokeColor: string;
  glowColor: string;
  advice: string;
  adviceClass: string;
}

export function CircularGauge({
  value,
  label,
  unit,
  icon: Icon,
  iconColor,
  strokeColor,
  glowColor,
  advice,
  adviceClass
}: CircularGaugeProps) {
  const radius = 52;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  // Map value (0-100) to gauge stroke dashoffset
  const percentage = Math.min(Math.max(value, 0), 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="rounded-3xl border border-white/[0.06] bg-[#0c0f0a]/50 p-6 flex flex-col justify-between h-full relative overflow-hidden group hover:border-white/10 transition-all duration-300">
      {/* Background radial accent glow */}
      <div className={`absolute -right-10 -top-10 w-24 h-24 rounded-full blur-[40px] opacity-[0.05] pointer-events-none transition-all duration-500 group-hover:scale-110 ${glowColor}`} />

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>

      {/* SVG Circular Dial Gauge */}
      <div className="flex items-center justify-center my-6 relative">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background track circle */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              className="stroke-white/[0.03] dark:stroke-white/[0.02]"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Active progress track circle */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              className={`transition-all duration-1000 ease-out ${strokeColor}`}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          {/* Central Overlay Text */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-white font-display tracking-tight group-hover:scale-105 transition-transform duration-300">
              {value}
              <span className="text-sm font-bold text-muted-foreground ml-0.5">{unit}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Advice Box */}
      <div className={`rounded-xl border p-3.5 text-xs text-center font-bold tracking-wide mt-2 ${adviceClass}`}>
        {advice}
      </div>
    </div>
  );
}
