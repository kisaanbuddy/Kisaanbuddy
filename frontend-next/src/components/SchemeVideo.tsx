"use client"

import { useEffect, useRef, useState } from "react"
import { Youtube, Loader2, ExternalLink } from "lucide-react"

type Props = {
  url?: string | null
  title?: string
}

function parseYouTube(url?: string | null): { videoId: string; embedUrl: string } | null {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)
  if (!m) return null
  const videoId = m[1]
  return { videoId, embedUrl: `https://www.youtube.com/embed/${videoId}?enablejsapi=1` }
}

export function SchemeVideo({ url, title = "Scheme guide video" }: Props) {
  const parsed = parseYouTube(url)
  const [loaded, setLoaded] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!parsed) return
    setLoaded(false)
    setUnavailable(false)

    // Embeddable videos fire postMessage from the YT player JS within a few seconds.
    // Embedding-disabled videos show a static "Video unavailable" page — no messages.
    timerRef.current = setTimeout(() => setUnavailable(true), 5000)

    function handleMsg(e: MessageEvent) {
      if (!String(e.origin).includes("youtube.com")) return
      if (iframeRef.current && e.source !== iframeRef.current.contentWindow) return
      clearTimeout(timerRef.current)
      setLoaded(true)
    }

    window.addEventListener("message", handleMsg)
    return () => {
      clearTimeout(timerRef.current)
      window.removeEventListener("message", handleMsg)
    }
  }, [parsed?.videoId])

  if (!parsed) return null

  const { embedUrl, videoId } = parsed
  const watchUrl = url ?? `https://www.youtube.com/watch?v=${videoId}`

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Youtube className="h-3.5 w-3.5 text-red-500" />
        <span>How to apply — video guide</span>
      </div>

      {unavailable ? (
        <a
          href={watchUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-red-500 transition-colors group"
        >
          <Youtube className="h-4 w-4 shrink-0 text-red-500" />
          <span className="flex-1">Watch tutorial on YouTube</span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60 group-hover:opacity-100" />
        </a>
      ) : (
        <div
          className="relative w-full overflow-hidden rounded-lg border border-border bg-muted/30"
          style={{ paddingBottom: "56.25%" }}
        >
          {!loaded && (
            <div
              className="absolute inset-0 flex items-center justify-center text-muted-foreground"
              aria-hidden
            >
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title={title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute left-0 top-0 h-full w-full border-0"
          />
        </div>
      )}
    </div>
  )
}
