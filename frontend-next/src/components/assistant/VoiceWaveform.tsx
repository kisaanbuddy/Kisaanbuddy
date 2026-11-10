"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface VoiceWaveformProps {
  active: boolean;
  className?: string;
  color?: string;
}

export function VoiceWaveform({
  active,
  className = "",
  color = "bg-emerald-600 dark:bg-emerald-400",
}: VoiceWaveformProps) {
  const prefersReduced = useReducedMotion();

  if (!active) return null;

  // 9 organic audio frequency spectrum bars
  const barConfigs = [
    { minH: 8, maxH: 20, dur: 0.9, delay: 0 },
    { minH: 10, maxH: 28, dur: 1.1, delay: 0.12 },
    { minH: 14, maxH: 36, dur: 0.85, delay: 0.2 },
    { minH: 12, maxH: 42, dur: 1.05, delay: 0.05 },
    { minH: 16, maxH: 46, dur: 0.75, delay: 0.25 },
    { minH: 12, maxH: 40, dur: 1.15, delay: 0.08 },
    { minH: 14, maxH: 32, dur: 0.95, delay: 0.18 },
    { minH: 10, maxH: 26, dur: 1.0, delay: 0.28 },
    { minH: 8, maxH: 18, dur: 0.8, delay: 0.15 },
  ];

  return (
    <div
      aria-label="Sound wave listening visualizer"
      className={`flex items-center justify-center gap-1.5 h-12 px-3 ${className}`}
    >
      {barConfigs.map((bar, i) => (
        <motion.span
          key={i}
          initial={{ height: bar.minH }}
          animate={
            prefersReduced
              ? { height: 16 }
              : {
                  height: [bar.minH, bar.maxH, bar.minH * 1.3, bar.maxH * 0.8, bar.minH],
                }
          }
          transition={{
            duration: bar.dur,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: bar.delay,
          }}
          className={`w-1 rounded-full ${color} shadow-xs will-change-transform`}
        />
      ))}
    </div>
  );
}

export default VoiceWaveform;
