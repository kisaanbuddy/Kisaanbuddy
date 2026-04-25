/**
 * Typed client + SSE parser for the KrishiAI assistant backend.
 *
 * All calls go through the Next.js rewrite (/api/chat/* -> :8000/api/chat/*).
 * Streaming uses fetch + ReadableStream (EventSource doesn't support POST bodies).
 */

// ---------- Types (mirror backend/schemas/chatbot.py) ----------

export type Language = "auto" | "en" | "hi" | "kn"

export interface LocationHint {
  lat?: number | null
  lon?: number | null
  city?: string | null
}

export interface AssistantRequest {
  session_id?: string | null
  message: string
  language?: Language
  location?: LocationHint | null
  stream?: boolean
  want_audio?: boolean
  /** Optional leaf/plant photo as a base64 data URL — triggers vision diagnosis. */
  image_base64?: string | null
}

export interface AssistantReply {
  session_id: string
  message_id: string
  content: string
  language: Language
  used_tools: string[]
  provider: string
  cached: boolean
  finish_reason?: string | null
}

export interface Message {
  id: string
  role: "user" | "assistant" | "system" | "tool"
  content: string
  language?: Language | null
  created_at: string
  tool_name?: string | null
}

export interface SessionState {
  id: string
  language: Language
  location?: LocationHint | null
  messages: Message[]
  created_at: string
  updated_at: string
}

export interface STTResult {
  transcript: string
  language: Language
  confidence?: number | null
  provider: string
}

export interface AssistantProvider {
  name: string
  role: "llm" | "stt" | "tts"
  configured: boolean
}

export interface AssistantHealth {
  providers: AssistantProvider[]
  memory_backend: string
  tools_enabled: string[]
  rate_limit: string
}

// ---------- Streaming events ----------

export type StreamEvent =
  | { type: "session"; session_id: string; language: Language }
  | { type: "token"; text: string }
  | { type: "tool_start"; name: string }
  | { type: "tool_end"; name: string; ok: boolean }
  | {
      type: "done"
      session_id: string
      message_id: string
      language: Language
      used_tools: string[]
      finish_reason?: string | null
    }
  | { type: "error"; message: string }

class AssistantAPIError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "AssistantAPIError"
    this.status = status
  }
}

async function readDetail(res: Response, fallback: string): Promise<string> {
  try {
    const j = await res.json()
    if (j?.detail) return typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail)
  } catch {
    /* ignore */
  }
  return fallback
}

// ---------- Non-streaming endpoints ----------

export async function getAssistantHealth(signal?: AbortSignal): Promise<AssistantHealth> {
  const r = await fetch("/api/chat/health", { signal, cache: "no-store" })
  if (!r.ok) throw new AssistantAPIError(await readDetail(r, "Health check failed"), r.status)
  return r.json()
}

export async function createSession(
  language: Language = "auto",
  location?: LocationHint,
  signal?: AbortSignal
): Promise<SessionState> {
  const r = await fetch("/api/chat/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language, location: location ?? null }),
    signal,
  })
  if (!r.ok) throw new AssistantAPIError(await readDetail(r, "Session create failed"), r.status)
  return r.json()
}

export async function getSession(
  sessionId: string,
  signal?: AbortSignal
): Promise<SessionState> {
  const r = await fetch(`/api/chat/session/${encodeURIComponent(sessionId)}`, { signal })
  if (!r.ok) throw new AssistantAPIError(await readDetail(r, "Session fetch failed"), r.status)
  return r.json()
}

export async function deleteSession(sessionId: string): Promise<void> {
  await fetch(`/api/chat/session/${encodeURIComponent(sessionId)}`, { method: "DELETE" })
}

export async function sendMessageOnce(
  req: AssistantRequest,
  signal?: AbortSignal
): Promise<AssistantReply> {
  const r = await fetch("/api/chat/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...req, stream: false }),
    signal,
  })
  if (!r.ok) throw new AssistantAPIError(await readDetail(r, "Chat failed"), r.status)
  return r.json()
}

// ---------- STT ----------

export async function transcribeAudio(
  blob: Blob,
  languageHint?: Exclude<Language, "auto">,
  signal?: AbortSignal
): Promise<STTResult> {
  const form = new FormData()
  const fname = blob.type?.includes("wav") ? "audio.wav" : "audio.webm"
  form.append("audio", blob, fname)
  if (languageHint) form.append("language", languageHint)
  const r = await fetch("/api/chat/stt", { method: "POST", body: form, signal })
  if (!r.ok) throw new AssistantAPIError(await readDetail(r, "STT failed"), r.status)
  return r.json()
}

// ---------- TTS ----------

export interface TTSAudio {
  kind: "audio"
  blob: Blob
  provider: string
}
export interface TTSBrowserHint {
  kind: "browser"
  language: Language
  voice_suggestion?: string
}
export type TTSResponse = TTSAudio | TTSBrowserHint

export async function synthesizeSpeech(
  text: string,
  language: Language = "auto",
  preferBrowser = false,
  signal?: AbortSignal
): Promise<TTSResponse> {
  const r = await fetch("/api/chat/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language, prefer_browser: preferBrowser }),
    signal,
  })
  if (!r.ok) throw new AssistantAPIError(await readDetail(r, "TTS failed"), r.status)

  const ctype = r.headers.get("content-type") || ""
  if (ctype.includes("application/json")) {
    const j = await r.json()
    return {
      kind: "browser",
      language: j.language ?? language,
      voice_suggestion: j.voice_suggestion,
    }
  }
  const blob = await r.blob()
  return { kind: "audio", blob, provider: r.headers.get("x-tts-provider") || "server" }
}

// ---------- Streaming ----------

export async function* streamMessage(
  req: AssistantRequest,
  signal?: AbortSignal
): AsyncGenerator<StreamEvent, void, unknown> {
  const r = await fetch("/api/chat/message", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({ ...req, stream: true }),
    signal,
  })
  if (!r.ok || !r.body) {
    throw new AssistantAPIError(await readDetail(r, "Stream failed"), r.status)
  }

  const reader = r.body.getReader()
  const decoder = new TextDecoder("utf-8")
  let buffer = ""

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let idx: number
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const frame = buffer.slice(0, idx)
        buffer = buffer.slice(idx + 2)
        const evt = parseFrame(frame)
        if (evt) yield evt
      }
    }
  } finally {
    reader.releaseLock()
  }
}

function parseFrame(frame: string): StreamEvent | null {
  let event = "message"
  const dataLines: string[] = []
  for (const line of frame.split("\n")) {
    if (line.startsWith(":")) continue
    if (line.startsWith("event:")) event = line.slice(6).trim()
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim())
  }
  const raw = dataLines.join("\n")
  if (!raw) return null
  let data: any = {}
  try {
    data = JSON.parse(raw)
  } catch {
    return null
  }
  switch (event) {
    case "session":
      return { type: "session", session_id: data.session_id, language: data.language }
    case "token":
      return { type: "token", text: data.text ?? "" }
    case "tool_start":
      return { type: "tool_start", name: data.name }
    case "tool_end":
      return { type: "tool_end", name: data.name, ok: !!data.ok }
    case "done":
      return {
        type: "done",
        session_id: data.session_id,
        message_id: data.message_id,
        language: data.language,
        used_tools: data.used_tools ?? [],
        finish_reason: data.finish_reason,
      }
    case "error":
      return { type: "error", message: data.message ?? "Unknown error" }
    default:
      return null
  }
}

export { AssistantAPIError }
