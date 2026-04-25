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
  get_weather: "Weather",
  get_forecast: "Forecast",
  recommend_crop: "Crop advisor",
  list_schemes: "Schemes",
}

export function ChatMessage({ msg }: { msg: AssistantMessage }) {
  const isUser = msg.role === "user"
  const isSystem = msg.role === "system" || msg.role === "tool"
  if (isSystem) return null

  return (
    <div
      className={`flex w-full gap-2 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="flex-shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white shadow">
          <Bot className="h-4 w-4" />
        </div>
      )}
      <div
        className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm whitespace-pre-wrap break-words ${
          isUser
            ? "bg-green-500 text-white rounded-br-sm"
            : "bg-white/80 dark:bg-white/5 text-foreground rounded-bl-sm border border-border"
        }`}
      >
        {msg.tools && msg.tools.length > 0 && !isUser && (
          <div className="mb-1.5 flex flex-wrap gap-1">
            {Array.from(new Set(msg.tools)).map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/30 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:text-green-300"
              >
                <Wrench className="h-2.5 w-2.5" />
                {TOOL_LABEL[t] ?? t}
              </span>
            ))}
          </div>
        )}
        <span>{msg.content || (msg.streaming ? "" : "")}</span>
        {msg.streaming && (
          <span className="ml-0.5 inline-block h-3 w-1 animate-pulse bg-green-500 align-middle rounded" />
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-blue-400 to-sky-600 flex items-center justify-center text-white shadow">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  )
}
