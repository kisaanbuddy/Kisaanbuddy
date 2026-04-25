"use client"
/**
 * Session + streaming orchestration for the KrishiAI assistant.
 *
 * Responsibilities:
 *   - Persist chosen language, session id, and last-known geolocation to
 *     localStorage so the widget feels "sticky" across page navigations.
 *   - Maintain the in-memory chat transcript (user + assistant + tool events).
 *   - Consume the SSE `streamMessage()` generator and expose a partial
 *     `streamingText` string the UI paints in real time.
 *   - Fetch geolocation lazily (only when the user opts into weather tools
 *     or they explicitly share location) to power tool calls with lat/lon.
 */

import { useCallback, useEffect, useRef, useState } from "react"

import {
  AssistantAPIError,
  createSession,
  getSession,
  streamMessage,
  type AssistantRequest,
  type Language,
  type LocationHint,
  type Message,
  type StreamEvent,
} from "@/lib/assistant-api"

// ---------- Types ----------
export interface AssistantMessage extends Message {
  /** Tool names that fired while producing this assistant message. */
  tools?: string[]
  /** Set while tokens are still streaming in. */
  streaming?: boolean
}

export interface UseAssistantOptions {
  /** Auto-restore the previous session from localStorage on mount. */
  restore?: boolean
}

export interface UseAssistantReturn {
  sessionId: string | null
  messages: AssistantMessage[]
  streamingText: string
  activeTool: string | null
  language: Language
  setLanguage: (lang: Language) => void
  location: LocationHint | null
  shareLocation: () => Promise<boolean>
  clearLocation: () => void

  send: (text: string, imageBase64?: string) => Promise<void>
  cancel: () => void
  reset: () => Promise<void>

  isSending: boolean
  lastError: string | null
}

// ---------- Constants ----------
const LS_SESSION = "krishiai.assistant.sessionId"
const LS_LANG = "krishiai.assistant.language"
const LS_LOC = "krishiai.assistant.location"

// ---------- Hook ----------
export function useAssistant(
  options: UseAssistantOptions = { restore: true }
): UseAssistantReturn {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [streamingText, setStreamingText] = useState<string>("")
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [languageState, setLanguageState] = useState<Language>("auto")
  const [location, setLocation] = useState<LocationHint | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const streamingRef = useRef<string>("")
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      abortRef.current?.abort()
    }
  }, [])

  // ---- Restore persisted prefs ----
  useEffect(() => {
    if (!options.restore || typeof window === "undefined") return
    try {
      const lang = localStorage.getItem(LS_LANG)
      if (lang === "en" || lang === "hi" || lang === "kn" || lang === "auto") {
        setLanguageState(lang)
      }
      const loc = localStorage.getItem(LS_LOC)
      if (loc) {
        const parsed = JSON.parse(loc) as LocationHint
        if (parsed && (parsed.lat != null || parsed.city)) setLocation(parsed)
      }
      const sid = localStorage.getItem(LS_SESSION)
      if (sid) {
        ;(async () => {
          try {
            const s = await getSession(sid)
            if (!mountedRef.current) return
            setSessionId(s.id)
            setMessages(
              s.messages.map((m) => ({
                ...m,
                streaming: false,
              }))
            )
          } catch {
            localStorage.removeItem(LS_SESSION)
          }
        })()
      }
    } catch {
      /* ignore malformed ls */
    }
  }, [options.restore])

  // ---- Setters with persistence ----
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(LS_LANG, lang)
    } catch {
      /* ignore */
    }
  }, [])

  const shareLocation = useCallback(async (): Promise<boolean> => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return false
    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const hint: LocationHint = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          }
          setLocation(hint)
          try {
            localStorage.setItem(LS_LOC, JSON.stringify(hint))
          } catch {
            /* ignore */
          }
          resolve(true)
        },
        () => resolve(false),
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 60_000 }
      )
    })
  }, [])

  const clearLocation = useCallback(() => {
    setLocation(null)
    try {
      localStorage.removeItem(LS_LOC)
    } catch {
      /* ignore */
    }
  }, [])

  // ---- Session helpers ----
  const ensureSession = useCallback(async (): Promise<string> => {
    if (sessionId) return sessionId
    const s = await createSession(languageState, location ?? undefined)
    if (!mountedRef.current) return s.id
    setSessionId(s.id)
    try {
      localStorage.setItem(LS_SESSION, s.id)
    } catch {
      /* ignore */
    }
    return s.id
  }, [sessionId, languageState, location])

  const reset = useCallback(async () => {
    abortRef.current?.abort()
    setMessages([])
    setStreamingText("")
    streamingRef.current = ""
    setActiveTool(null)
    setLastError(null)
    setSessionId(null)
    try {
      localStorage.removeItem(LS_SESSION)
    } catch {
      /* ignore */
    }
  }, [])

  // ---- Stream consumer ----
  const send = useCallback(
    async (text: string, imageBase64?: string) => {
      const trimmed = text.trim()
      if ((!trimmed && !imageBase64) || isSending) return
      setLastError(null)

      const now = new Date().toISOString()
      const userMsg: AssistantMessage = {
        id: `local-${Date.now()}`,
        role: "user",
        content: trimmed,
        language: languageState,
        created_at: now,
        streaming: false,
      }
      setMessages((prev) => [...prev, userMsg])
      setStreamingText("")
      streamingRef.current = ""
      setActiveTool(null)

      const placeholderId = `local-${Date.now() + 1}`
      setMessages((prev) => [
        ...prev,
        {
          id: placeholderId,
          role: "assistant",
          content: "",
          language: languageState,
          created_at: new Date().toISOString(),
          streaming: true,
          tools: [],
        },
      ])

      setIsSending(true)
      const ctl = new AbortController()
      abortRef.current = ctl

      try {
        const sid = await ensureSession()
        const req: AssistantRequest = {
          session_id: sid,
          message: trimmed || "Yeh photo dekho aur disease detect karo.",
          language: languageState,
          location: location ?? null,
          stream: true,
          want_audio: false,
          image_base64: imageBase64 ?? null,
        }

        const toolsUsed: string[] = []
        let finalLanguage: Language = languageState

        for await (const evt of streamMessage(req, ctl.signal)) {
          if (!mountedRef.current) break
          handleEvent(evt, {
            onSession: (sidFromServer, lang) => {
              if (sidFromServer && sidFromServer !== sid) {
                setSessionId(sidFromServer)
                try {
                  localStorage.setItem(LS_SESSION, sidFromServer)
                } catch {
                  /* ignore */
                }
              }
              if (lang) finalLanguage = lang
            },
            onToken: (piece) => {
              streamingRef.current += piece
              const text = streamingRef.current
              setStreamingText(text)
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === placeholderId ? { ...m, content: text } : m
                )
              )
            },
            onToolStart: (name) => {
              toolsUsed.push(name)
              setActiveTool(name)
            },
            onToolEnd: () => {
              setActiveTool(null)
            },
            onDone: (payload) => {
              finalLanguage = payload.language ?? finalLanguage
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === placeholderId
                    ? {
                        ...m,
                        id: payload.message_id || m.id,
                        content: streamingRef.current,
                        language: finalLanguage,
                        streaming: false,
                        tools: payload.used_tools.length
                          ? payload.used_tools
                          : toolsUsed,
                      }
                    : m
                )
              )
            },
            onError: (msg) => {
              setLastError(msg)
            },
          })
        }
      } catch (e: any) {
        if (e?.name === "AbortError") {
          // Silent cancel.
        } else if (e instanceof AssistantAPIError) {
          setLastError(e.message)
        } else {
          setLastError(e?.message || "Assistant unavailable")
        }
      } finally {
        if (mountedRef.current) {
          setIsSending(false)
          setActiveTool(null)
          setMessages((prev) =>
            prev.map((m) =>
              m.id === placeholderId && m.streaming
                ? { ...m, streaming: false }
                : m
            )
          )
        }
        abortRef.current = null
      }
    },
    [ensureSession, isSending, languageState, location]
  )

  const cancel = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return {
    sessionId,
    messages,
    streamingText,
    activeTool,
    language: languageState,
    setLanguage,
    location,
    shareLocation,
    clearLocation,
    send,
    cancel,
    reset,
    isSending,
    lastError,
  }
}

// ---------- Helpers ----------
interface EventHandlers {
  onSession: (sessionId: string, language?: Language) => void
  onToken: (text: string) => void
  onToolStart: (name: string) => void
  onToolEnd: (name: string, ok: boolean) => void
  onDone: (payload: {
    session_id: string
    message_id: string
    language: Language
    used_tools: string[]
    finish_reason?: string | null
  }) => void
  onError: (message: string) => void
}

function handleEvent(evt: StreamEvent, h: EventHandlers) {
  switch (evt.type) {
    case "session":
      h.onSession(evt.session_id, evt.language)
      break
    case "token":
      h.onToken(evt.text)
      break
    case "tool_start":
      h.onToolStart(evt.name)
      break
    case "tool_end":
      h.onToolEnd(evt.name, evt.ok)
      break
    case "done":
      h.onDone({
        session_id: evt.session_id,
        message_id: evt.message_id,
        language: evt.language,
        used_tools: evt.used_tools,
        finish_reason: evt.finish_reason,
      })
      break
    case "error":
      h.onError(evt.message)
      break
  }
}
