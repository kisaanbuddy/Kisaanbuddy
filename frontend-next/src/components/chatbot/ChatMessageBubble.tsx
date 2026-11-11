"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Bookmark,
  Check,
  Copy,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sprout,
  Square,
  User,
  Volume2,
  Wrench,
} from "lucide-react";
import { ChatMessage } from "@/lib/conversation-store";
import { AgriMarkdownRenderer } from "./AgriMarkdownRenderer";

const TOOL_LABELS: Record<string, string> = {
  get_weather: "Live Weather",
  get_forecast: "7-Day Forecast",
  recommend_crop: "Crop Predictor",
  list_schemes: "Govt Schemes Registry",
  get_mandi_prices: "AGMARKNET Mandi",
  diagnose_crop_disease: "ICAR Disease KB",
  get_fertilizer_recommendation: "ICAR Nutrient Guide",
  search_marketplace: "Agri Marketplace",
  search_jobs: "AgriLabour",
  post_job: "AgriLabour",
  suggest_wage: "Wage Benchmarks",
};

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isLatestAssistant: boolean;
  activeTool?: string | null;
  isBookmarked: boolean;
  isSpeakingThis: boolean;
  isAudioPaused: boolean;
  isCopied: boolean;
  onToggleSpeak: () => void;
  onPauseResumeSpeak: () => void;
  onStopSpeak: () => void;
  onCopy: () => void;
  onBookmark: () => void;
  onRegenerate: () => void;
  onFollowUpClick: (text: string) => void;
  onOpenDirectory: () => void;
}

function formatMessageTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function ChatMessageBubble({
  message,
  isLatestAssistant,
  activeTool,
  isBookmarked,
  isSpeakingThis,
  isAudioPaused,
  isCopied,
  onToggleSpeak,
  onPauseResumeSpeak,
  onStopSpeak,
  onCopy,
  onBookmark,
  onRegenerate,
  onFollowUpClick,
  onOpenDirectory,
}: ChatMessageBubbleProps) {
  const prefersReduced = useReducedMotion();
  const isUser = message.sender === "user";
  const timeLabel = formatMessageTime(message.timestamp);

  if (isUser) {
    return (
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-start justify-end gap-2.5 sm:gap-3"
      >
        <div className="max-w-[85%] sm:max-w-[75%] flex flex-col items-end gap-1">
          <div className="rounded-3xl rounded-tr-md bg-emerald-700 text-white px-4 py-3 shadow-xs text-[13.5px] sm:text-[14.5px] leading-relaxed">
            {message.imageUrl && (
              <div className="mb-2.5 rounded-2xl overflow-hidden border border-white/20 max-w-xs bg-black/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={message.imageUrl}
                  alt="Uploaded crop leaf photograph"
                  className="w-full max-h-56 object-cover"
                />
                {message.cropHint && (
                  <div className="px-2.5 py-1 bg-black/50 text-white text-[11px] font-semibold">
                    Crop: {message.cropHint}
                  </div>
                )}
              </div>
            )}
            <div className="whitespace-pre-wrap break-words font-normal">
              {message.text}
            </div>
          </div>

          {timeLabel && (
            <span
              suppressHydrationWarning
              className="text-[10px] text-[#5B7062] dark:text-stone-400 px-1.5 font-medium"
            >
              {timeLabel}
            </span>
          )}
        </div>

        <div
          className="w-8 h-8 rounded-full bg-emerald-900/10 dark:bg-emerald-800/40 border border-emerald-900/15 dark:border-emerald-700/50 text-emerald-900 dark:text-emerald-200 flex items-center justify-center shrink-0 mt-0.5"
          aria-hidden="true"
        >
          <User className="w-4 h-4" />
        </div>
      </motion.div>
    );
  }

  // Assistant Message
  const uniqueTools = Array.from(new Set(message.usedTools || []));
  const showTypingSkeleton = message.isStreaming && !message.text;

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start gap-2.5 sm:gap-3.5"
    >
      {/* Advisor Avatar */}
      <div
        className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 relative"
        aria-hidden="true"
      >
        <Sprout className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        {message.isStreaming && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-stone-950 animate-pulse" />
        )}
      </div>

      {/* Assistant Content Column */}
      <div className="flex-1 min-w-0 max-w-full sm:max-w-[90%] space-y-2.5">
        <div
          className={`rounded-3xl rounded-tl-md bg-white dark:bg-stone-900 border px-4 py-3.5 sm:px-5 sm:py-4 shadow-2xs transition-colors ${
            message.isError
              ? "border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20"
              : "border-emerald-900/10 dark:border-stone-800"
          }`}
        >
          {/* Provenance / Tools Header */}
          {(uniqueTools.length > 0 || message.isOfflineFallback) && (
            <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
              {uniqueTools.map((tool) => (
                <span
                  key={tool}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300"
                >
                  <Wrench className="w-2.5 h-2.5" />
                  <span>{TOOL_LABELS[tool] || tool}</span>
                </span>
              ))}
              {message.isOfflineFallback && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-[10px] font-semibold text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  <span>Offline Reference Mode</span>
                </span>
              )}
            </div>
          )}

          {/* Structured Vision / Crop Doctor Diagnosis Card */}
          {message.diagnosisData && (
            <div className="mb-3.5 p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-700 text-white uppercase tracking-wide">
                  <ShieldCheck className="w-3 h-3" />
                  <span>
                    {message.diagnosisData.status === "ok"
                      ? "Crop Doctor Vision Diagnosis"
                      : message.diagnosisData.status === "retake_image"
                      ? "Clearer Photo Needed"
                      : "Probable Diagnosis — Expert Review Advised"}
                  </span>
                </span>
                {typeof message.diagnosisData.confidence === "number" &&
                  message.diagnosisData.confidence > 0 && (
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                      Calibrated Confidence: {Math.round(message.diagnosisData.confidence * 100)}%
                    </span>
                  )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#143325] dark:text-emerald-100">
                  {message.diagnosisData.diseaseName}
                </h4>
                <p className="text-xs text-[#4B5D50] dark:text-stone-400">
                  <strong>Crop:</strong> {message.diagnosisData.crop || "Unspecified"} •{" "}
                  <strong>Source:</strong> {message.diagnosisData.sourceInstitution || "ICAR"}
                </p>
              </div>

              {message.diagnosisData.immediateAction && (
                <p className="text-xs text-foreground/90 leading-relaxed">
                  <strong>Immediate Action:</strong> {message.diagnosisData.immediateAction}
                </p>
              )}

              {message.diagnosisData.dosageGuidelines && (
                <div className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-emerald-900/10 dark:border-stone-700 text-xs space-y-0.5">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                    Verified Dosage Guideline:
                  </span>
                  <span className="text-foreground/90">
                    {message.diagnosisData.dosageGuidelines}
                  </span>
                  {message.diagnosisData.preHarvestIntervalDays ? (
                    <span className="block text-[11px] text-[#4B5D50] dark:text-stone-400 pt-0.5">
                      Pre-Harvest Interval (PHI): {message.diagnosisData.preHarvestIntervalDays} days
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {/* Typing Indicator OR Formatted Markdown Response */}
          {showTypingSkeleton ? (
            <div className="flex items-center gap-2.5 py-1 text-xs sm:text-sm text-[#355343] dark:text-stone-300 font-medium">
              <span className="inline-flex items-center gap-1" aria-hidden="true">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
                <span
                  className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"
                  style={{ animationDelay: "140ms" }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"
                  style={{ animationDelay: "280ms" }}
                />
              </span>
              <span>
                {activeTool
                  ? `Checking ${TOOL_LABELS[activeTool] || activeTool}...`
                  : "कृषि सलाह तैयार की जा रही है... (Preparing advice)"}
              </span>
            </div>
          ) : (
            <AgriMarkdownRenderer
              content={message.text}
              isStreaming={Boolean(message.isStreaming)}
              onOpenDirectory={onOpenDirectory}
            />
          )}
        </div>

        {/* Message Footer: Timestamp, Voice Controls, Copy, Bookmark, Regenerate */}
        {!message.isStreaming && message.text && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2 text-[11px] text-[#5B7062] dark:text-stone-400">
              {timeLabel && (
                <span suppressHydrationWarning className="font-medium">
                  {timeLabel}
                </span>
              )}
              {!message.isOfflineFallback && !message.isError && (
                <>
                  <span aria-hidden="true">•</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    <span>KisaanBuddy AI</span>
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1">
              {/* Voice Playback Controls */}
              {isSpeakingThis ? (
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-semibold shadow-2xs">
                  <button
                    type="button"
                    onClick={onPauseResumeSpeak}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full hover:bg-emerald-700 transition-colors"
                    title={isAudioPaused ? "Resume voice" : "Pause voice"}
                  >
                    {isAudioPaused ? (
                      <Play className="w-3 h-3 fill-white" />
                    ) : (
                      <Pause className="w-3 h-3 fill-white" />
                    )}
                    <span>{isAudioPaused ? "Resume" : "Pause"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onStopSpeak}
                    className="p-1 rounded-full hover:bg-emerald-700 transition-colors"
                    title="Stop voice"
                    aria-label="Stop voice playback"
                  >
                    <Square className="w-2.5 h-2.5 fill-white" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onToggleSpeak}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-emerald-900/10 dark:border-stone-800 hover:border-emerald-600/40 text-xs font-semibold text-emerald-800 dark:text-emerald-300 transition-colors shadow-2xs"
                  title="Listen to response"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>सुनें / Listen</span>
                </button>
              )}

              {/* Copy Response */}
              <button
                type="button"
                onClick={onCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-emerald-950/5 dark:hover:bg-stone-800 text-xs font-medium text-[#4B5D50] dark:text-stone-300 transition-colors"
                title="Copy response"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 dark:text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Copy</span>
                  </>
                )}
              </button>

              {/* Bookmark / Save Answer */}
              <button
                type="button"
                onClick={onBookmark}
                className={`p-1.5 rounded-xl transition-colors ${
                  isBookmarked
                    ? "text-amber-600 bg-amber-50 dark:bg-amber-950/40"
                    : "text-[#4B5D50] dark:text-stone-400 hover:bg-emerald-950/5 dark:hover:bg-stone-800"
                }`}
                title={isBookmarked ? "Remove bookmark" : "Save answer"}
                aria-label={isBookmarked ? "Remove bookmark" : "Save answer"}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-amber-500" : ""}`} />
              </button>

              {/* Regenerate Response */}
              <button
                type="button"
                onClick={onRegenerate}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-emerald-950/5 dark:hover:bg-stone-800 text-xs font-medium text-[#4B5D50] dark:text-stone-300 transition-colors"
                title="Regenerate response"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Regenerate</span>
              </button>
            </div>
          </div>
        )}

        {/* Follow-up Suggestion Chips (only on latest assistant message) */}
        {isLatestAssistant &&
          !message.isStreaming &&
          message.followUps &&
          message.followUps.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {message.followUps.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onFollowUpClick(chip)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-stone-900 border border-emerald-900/15 dark:border-stone-700 hover:border-emerald-600 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 text-xs font-medium text-[#1D2B22] dark:text-stone-200 transition-all shadow-2xs active:scale-95"
                >
                  <span>{chip}</span>
                  <ArrowRight className="w-3 h-3 text-emerald-600 shrink-0" />
                </button>
              ))}
            </div>
          )}
      </div>
    </motion.div>
  );
}
