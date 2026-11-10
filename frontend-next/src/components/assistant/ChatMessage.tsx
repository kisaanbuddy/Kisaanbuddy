"use client";
/**
 * World-Class Animated Chat Bubble (user or assistant).
 *
 * Renders:
 *   - Staggered spring entrance
 *   - Role-coloured bubble with avatar glyph
 *   - Tool-call chips above assistant messages that used tools
 *   - A typing cursor while still streaming
 */
import React, { useState, useRef } from "react";
import { Bot, Loader2, User, Volume2, VolumeX, Wrench } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import type { AssistantMessage } from "./useAssistant";
import { synthesizeSpeech } from "@/lib/assistant-api";

const TOOL_LABEL: Record<string, string> = {
  get_weather: "Weather Diagnostics",
  get_forecast: "Mausam Forecast",
  recommend_crop: "Crop Advisory",
  list_schemes: "Government Schemes",
};

export function ChatMessage({ msg }: { msg: AssistantMessage }) {
  const isUser = msg.role === "user";
  const isSystem = msg.role === "system" || msg.role === "tool";
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prefersReduced = useReducedMotion();

  if (isSystem) return null;

  const handleSpeak = async () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      return;
    }
    setIsLoading(true);
    try {
      const textToSpeak = msg.content
        .replace(/[#*`_-]/g, " ")
        .replace(/\s+/g, " ")
        .slice(0, 1500);
      const result = await synthesizeSpeech(textToSpeak, msg.language ?? "auto");
      if (result.kind !== "audio" || !result.blob.size) throw new Error("Neural TTS unavailable");
      const blob = result.blob;
      const url = URL.createObjectURL(blob);
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      await audio.play();
      setIsPlaying(true);
    } catch (e) {
      console.warn("TTS error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={`flex w-full gap-2.5 will-change-transform ${isUser ? "justify-end flex-row-reverse" : "justify-start"}`}
    >
      {/* Avatar Icon */}
      <div
        className={`flex-shrink-0 h-8 w-8 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 border relative ${
          isUser
            ? "bg-teal-500/10 border-teal-500/20 text-teal-400"
            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        {!isUser && (
          <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 border border-slate-950 animate-pulse" />
        )}
      </div>

      {/* Bubble Container */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs whitespace-pre-wrap break-words transition-all duration-300 ${
          isUser
            ? "bg-gradient-to-tr from-emerald-600 to-teal-600 text-white rounded-tr-sm font-semibold shadow-md shadow-emerald-500/10"
            : "bg-card dark:bg-card/90 text-foreground rounded-tl-sm border border-border shadow-xs backdrop-blur-sm"
        }`}
      >
        {/* Tool Call Badges */}
        {msg.tools && msg.tools.length > 0 && !isUser && (
          <div className="mb-2 flex flex-wrap gap-1">
            {Array.from(new Set(msg.tools)).map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-tight"
              >
                <Wrench className="h-2.5 w-2.5" />
                <span>{TOOL_LABEL[t] ?? t}</span>
              </span>
            ))}
          </div>
        )}

        {/* Message Content */}
        <div className="prose prose-sm dark:prose-invert max-w-none text-current">
          {msg.content}
          {msg.streaming && (
            <span className="inline-block h-3.5 w-1.5 ml-1 bg-emerald-500 animate-pulse align-middle rounded-full" />
          )}
        </div>

        {/* Footer Actions (Assistant Only) */}
        {!isUser && !msg.streaming && msg.content.length > 0 && (
          <div className="mt-2.5 flex items-center justify-between border-t border-border/40 pt-2 text-[10px] text-muted-foreground">
            <span className="opacity-60">{((msg as any).timestamp ?? (msg as any).created_at) ?? "Just now"}</span>
            <button
              type="button"
              onClick={handleSpeak}
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-lg bg-muted/60 hover:bg-muted px-2 py-1 transition-colors text-foreground font-medium disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin text-emerald-500" />
                  <span>Loading voice...</span>
                </>
              ) : isPlaying ? (
                <>
                  <VolumeX className="h-3 w-3 text-rose-500" />
                  <span className="text-rose-500">Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3 w-3" />
                  <span>Listen</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
