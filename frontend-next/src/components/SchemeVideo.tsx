"use client"

/**
 * SchemeVideo — embeds a YouTube tutorial inside a Government Scheme card.
 *
 * Behaviour:
 *   - Returns NULL when `url` is missing or invalid → nothing rendered, no
 *     empty space. Existing scheme cards stay untouched.
 *   - Accepts every common YouTube URL form (watch?v=, youtu.be/, /embed/).
 *   - Renders a 16:9 responsive iframe wrapper that scales on mobile.
 *   - Native browser lazy-load via `loading="lazy"` so off-screen videos
 *     never download. A small spinner placeholder shows while loading.
 *
 * Drop-in usage inside any scheme card:
 *
 *     <SchemeVideo url={scheme.youtubeLink} title={scheme.name} />
 */

import { useState } from "react"
import { Youtube, Loader2 } from "lucide-react"

type Props = {
  /** Raw YouTube URL (any common form) or null/undefined. */
  url?: string | null
  /** Optional title used for accessibility / iframe title attribute. */
  title?: string
}

export function SchemeVideo({ url, title = "Scheme guide video" }: Props) {
  const embedUrl = url ? toEmbedUrl(url) : null
  const [loaded, setLoaded] = useState(false)

  // No URL or unparseable URL → render NOTHING. Important: avoids any layout
  // gap on cards that don't have a video yet.
  if (!embedUrl) return null

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Youtube className="h-3.5 w-3.5 text-red-500" />
        <span>How to apply — video guide</span>
      </div>

      {/* 16:9 responsive wrapper — width 100%, height auto-scales */}
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
          src={embedUrl}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setLoaded(true)}
          className="absolute left-0 top-0 h-full w-full border-0"
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// URL → embed URL converter (handles every common YouTube link form)
// ---------------------------------------------------------------------------
function toEmbedUrl(raw: string): string | null {
  if (!raw || typeof raw !== "string") return null
  try {
    const u = new URL(raw.trim())
    const host = u.hostname.toLowerCase()

    // 1. youtu.be/<id>
    if (host.includes("youtu.be")) {
      const id = u.pathname.replace(/^\//, "").split("/")[0]
      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    // 2. youtube.com/embed/<id> — already an embed URL
    if (host.includes("youtube.com") && u.pathname.startsWith("/embed/")) {
      return raw
    }

    // 3. youtube.com/watch?v=<id>
    if (host.includes("youtube.com")) {
      const v = u.searchParams.get("v")
      if (v) return `https://www.youtube.com/embed/${v}`

      // 4. youtube.com/shorts/<id>
      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.replace("/shorts/", "").split("/")[0]
        return id ? `https://www.youtube.com/embed/${id}` : null
      }
    }

    return null
  } catch {
    return null
  }
}
