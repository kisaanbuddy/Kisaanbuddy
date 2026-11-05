"use client";

import React from "react";

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
  if (!active) return null;

  // 7 balanced waveform bars with subtle, varied heights
  const bars = [
    { height: "h-3", delay: "0.1s", dur: "1.1s" },
    { height: "h-5", delay: "0.25s", dur: "0.95s" },
    { height: "h-7", delay: "0.15s", dur: "1.2s" },
    { height: "h-9", delay: "0.3s", dur: "1.05s" },
    { height: "h-7", delay: "0.2s", dur: "1.15s" },
    { height: "h-5", delay: "0.35s", dur: "0.9s" },
    { height: "h-3", delay: "0.12s", dur: "1.25s" },
  ];

  return (
    <div
      aria-label="Sound wave listening visualizer"
      className={`flex items-center justify-center gap-1.5 h-10 px-3 ${className}`}
    >
      {bars.map((bar, i) => (
        <span
          key={i}
          style={{
            animationDelay: bar.delay,
            animationDuration: bar.dur,
          }}
          className={`w-1 rounded-full ${bar.height} ${color} voice-wave-bar motion-reduce:animate-none`}
        />
      ))}
    </div>
  );
}

export default VoiceWaveform;
