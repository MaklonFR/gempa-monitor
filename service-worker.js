/* ============================================================
   GEMPA MONITOR — SERVICE WORKER
   ============================================================
   Cache-first untuk aset statis + offline fallback.
   ============================================================ */

const CACHE_NAME = "gempa-monitor-v3";
const APP_SHELL = [
  "./",
  "./index.html",
  "./css/app.css",
  "./js/data.js",
  "./js/ui.js",
  "./js/map.js",
  "./js/realtime.js",
  "./js/supabase-config.js",
  "./js/supabase.js",
  "./js/app.js",
  "./manifest.json",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Hanya GET
  if (request.method !== "GET") return;

  // JANGAN cache request API eksternal (BMKG, Supabase, CDN, dll.)
  // Ini mencegah data lama ditampilkan dari cache browser.
  const isExternalApiRequest =
    request.url.includes("data.bmkg.go.id") ||          // API BMKG
    request.url.includes("supabase.co") ||              // API Supabase
    request.url.includes("cdn.jsdelivr.net") ||         // Supabase JS CDN
    request.url.includes("unpkg.com") ||                // Leaflet CDN
    request.url.includes("fonts.googleapis.com") ||     // Google Fonts
    request.url.includes("fonts.gstatic.com") ||        // Google Fonts static
    request.url.includes("cdn.tailwindcss.com") ||      // Tailwind CDN
    request.url.includes("tile.openstreetmap.org");     // OpenStreetMap tiles

  if (isExternalApiRequest) return;

  // Handle navigate request: network-first (untuk app shell)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then((r) => r || caches.match("./index.html"))
        )
    );
    return;
  }

  // File JS: network-first (selalu ambil versi terbaru, fallback ke cache)
  if (request.url.includes("/js/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Aset statis lain: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
      );
    })
  );
});