/**
 * KrishiAI Service Worker — offline-first cache strategy
 * Caches static pages + assets; falls back gracefully.
 */
const CACHE = "krishiai-v1"
const OFFLINE_URL = "/"

// Pages to pre-cache
const PRECACHE = [
  "/",
  "/dashboard",
  "/mandi",
  "/weather",
  "/disease",
  "/worker-connect",
  "/schemes",
  "/khet-diary",
  "/soil-health",
  "/crop-predictor",
  "/manifest.json",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  // Only handle GET requests for same-origin or CDN
  if (event.request.method !== "GET") return
  const url = new URL(event.request.url)

  // API calls → network-only (never cache live data)
  if (url.pathname.startsWith("/api/")) return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          // Cache fresh responses
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE).then((c) => c.put(event.request, clone))
          }
          return response
        })
        .catch(() => cached || caches.match(OFFLINE_URL))
      // Return cache immediately if available, update in background
      return cached || networkFetch
    })
  )
})
