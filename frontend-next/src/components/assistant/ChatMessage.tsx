"use client"
/**
 * A single chat bubble (user or assistant).
 *
 * Renders:
 *   - Role-coloured bubble with avatar glyph
 *   - Tool-call chips above assistant messages that used tools
 *   - A typing cursor while still streaming
 */
import { Bot, User, Wrench } from "lucide-react"

import type { AssistantMessage } from "./useAssistant"

const TOOL_LABEL: Record<string, string> = {
  get_weather: "Weather Diagnostics",
  get_forecast: "Mausam Forecast",
  recommend_crop: "Crop Advisory",
  list_schemes: "Government Schemes",
}

export function ChatMessage({ msg }: { msg: AssistantMessage }) {
  const isUser = msg.role === "user"
  const isSystem = msg.role === "system" || msg.role === "tool"
  if (isSystem) return null

  return (
    <div
      className={`flex w-full gap-2.5 ${isUser ? "justify-end flex-row-reverse" : "justify-start"}`}
    >
      {/* Avatar Icon */}
      <div className={`flex-shrink-0 h-8 w-8 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 border relative ${
        isUser
          ? "bg-teal-500/10 border-teal-500/20 text-teal-400"
          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
      }`}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        {!isUser && (
          <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 border border-slate-950 animate-pulse" />
        )}
      </div>

      {/* Bubble Container */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm whitespace-pre-wrap break-words transition-all duration-300 ${
          isUser
            ? "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-tr-sm font-semibold shadow-md shadow-emerald-500/10"
            : "bg-white/[0.03] dark:bg-white/[0.02] text-white/90 rounded-tl-sm border border-white/[0.05] backdrop-blur-sm"
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
        
        {/* Content text */}
        <span>{msg.content}</span>
        
        {/* Streaming Blink Cursor */}
        {msg.streaming && (
          <span className="ml-1 inline-block h-3.5 w-1.5 animate-pulse bg-emerald-400 align-middle rounded font-bold" />
        )}
      </div>
    </div>
  )
}
