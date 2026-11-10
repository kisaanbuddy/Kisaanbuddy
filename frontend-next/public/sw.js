/**
 * KisaanBuddy Service Worker — network-first for navigation, cache-first for static assets
 */
const CACHE = "KisaanBuddy-v5"
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

  // Navigation requests (HTML pages) → Network-First so users always see latest deployments
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE).then((c) => c.put(event.request, clone))
          }
          return response
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match(OFFLINE_URL)))
    )
    return
  }

  // Static assets (CSS, JS, images, fonts) → Cache first, fallback to network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE).then((c) => c.put(event.request, clone))
          }
          return response
        })
        .catch(() => cached)
      return cached || networkFetch
    })
  )
})
