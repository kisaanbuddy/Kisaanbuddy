"use client";

import React, { useState } from "react";
import { Mic, Sparkles, Volume2 } from "lucide-react";
import { openVoiceAssistant } from "@/components/assistant/VoiceAssistantModal";
import type { RedesignCopy } from "@/lib/homepage-redesign-i18n";

interface FarmerVoiceAssistantCardProps {
  copy: RedesignCopy["voice"];
}

export function FarmerVoiceAssistantCard({ copy }: FarmerVoiceAssistantCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMicClick = () => {
    // Activates the existing full KisaanBuddy voice assistant flow
    openVoiceAssistant();
  };

  const handlePromptClick = (promptText: string) => {
    openVoiceAssistant(promptText);
  };

  return (
    <div
      className="relative w-full rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 md:p-10 shadow-lg transition-all duration-300"
      aria-label="KisaanBuddy Voice Assistant"
    >
      <div className="flex flex-col items-center text-center">
        {/* Subtle Assistant Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 px-3 py-1 text-xs font-bold text-[#174F34] dark:text-emerald-300 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Voice AI Assistant</span>
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] dark:text-stone-50 tracking-tight">
          {copy.title}
        </h2>
        <p className="mt-1 text-sm sm:text-base font-medium text-[#64748B] dark:text-stone-400">
          {copy.subtitle}
        </p>

        {/* Large Recognizable Microphone Button inside Circular Green Container */}
        <div className="my-6 sm:my-8 relative flex items-center justify-center">
          {/* Subtle Outer Wave Ring Animation */}
          <span
            className="absolute -inset-3 rounded-full bg-[#247A45]/20 dark:bg-emerald-500/20 animate-ping opacity-75 motion-reduce:hidden"
            aria-hidden="true"
          />
          <span
            className="absolute -inset-1.5 rounded-full bg-[#174F34]/25 dark:bg-emerald-600/30"
            aria-hidden="true"
          />

          <button
            type="button"
            onClick={handleMicClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label={`${copy.title}: ${copy.buttonText}`}
            className="relative z-10 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#174F34] to-[#247A45] hover:from-[#1C5B3D] hover:to-[#2E9454] text-white shadow-xl shadow-emerald-950/25 active:scale-95 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/40"
          >
            <Mic className="h-10 w-10 sm:h-12 sm:w-12 stroke-[2.3] text-white" />
          </button>
        </div>

        {/* Clearly Identifiable Primary Action Button */}
        <button
          type="button"
          onClick={handleMicClick}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#174F34] hover:bg-[#247A45] active:scale-98 px-6 py-3 text-sm sm:text-base font-extrabold text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
          <Volume2 className="h-4.5 w-4.5 shrink-0" />
          <span>{copy.buttonText}</span>
        </button>

        {/* Example Suggestion Chips */}
        <div className="mt-7 w-full max-w-2xl border-t border-stone-100 dark:border-stone-800 pt-5">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
            बोलकर पूछें / Try asking:
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {copy.prompts.map((promptText, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePromptClick(promptText)}
                className="group inline-flex items-center gap-2 rounded-full border border-stone-200 dark:border-stone-700 bg-stone-50/80 dark:bg-stone-800/80 hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-emerald-950/50 dark:hover:border-emerald-700 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-[#174F34] dark:hover:text-emerald-300 shadow-2xs transition-all duration-150 cursor-pointer text-left"
              >
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">💬</span>
                <span>&ldquo;{promptText}&rdquo;</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
