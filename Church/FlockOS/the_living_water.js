/* ══════════════════════════════════════════════════════════════════════════════
   THE LIVING WATER — FlockOS Service Worker
   "If you knew the gift of God and who it is that asks you for a drink,
    you would have asked him and he would have given you living water."
    — John 4:10

   Caching strategy:
     • Install  → pre-cache app shell (HTML, JS, CSS, images, fonts)
     • Activate → purge stale caches from previous versions
     • Fetch    → cache-first for static assets, network-first for API calls
     • Offline  → serve cached shell; API calls return offline fallback
   ══════════════════════════════════════════════════════════════════════════════ */

const CACHE_VERSION = 'flockos-v3.16';
const API_CACHE     = 'flockos-api-v1';

// ── App Shell: pre-cached on install ────────────────────────────────────────
//
// This SW lives at the project root, so its scope covers the entire app.
// All paths below are relative to the root.
//
const APP_SHELL = [
  // ── Project root ────────────────────────────────────────────────────────
  './',
  './index.html',
  './manifest.json',

  // ── HTML entry points ────────────────────────────────────────
  './FlockOS/Pages/the_good_shepherd.html',
  './FlockOS/Pages/the_wall.html',
  './FlockOS/Pages/the_pentecost.html',
  './FlockOS/Pages/fishing-for-men.html',
  './FlockOS/Pages/the_generations.html',
  './FlockOS/Pages/the_weavers_plan.html',
  './FlockOS/Pages/the_gift_drift.html',
  './FlockOS/Pages/the_anatomy_of_worship.html',
  './FlockOS/Pages/the_call_to_forgive.html',
  './FlockOS/Pages/prayerful_action.html',
  './FlockOS/Pages/the_invitation.html',

  // ── Icons / images ──────────────────────────────────────────────────────
  './FlockOS/Images/FlockOS_Midnight.png',
  './FlockOS/Images/FlockOS_Wide.jpeg',
  './FlockOS/Images/FlockOS_ODCamo.png',

  // ── JS modules ───────────────────────────────────────────────
  './FlockOS/Scripts/firm_foundation.js',
  './FlockOS/Scripts/fine_linen.js',
  './FlockOS/Scripts/the_cornerstone.js',
  './FlockOS/Scripts/the_true_vine.js',
  './FlockOS/Scripts/the_wellspring.js',
  './FlockOS/Scripts/the_well.js',
  './FlockOS/Scripts/the_tabernacle.js',
  './FlockOS/Scripts/the_seasons.js',
  './FlockOS/Scripts/the_way.js',
  './FlockOS/Scripts/the_harvest.js',
  './FlockOS/Scripts/the_life.js',
  './FlockOS/Scripts/the_scrolls.js',
  './FlockOS/Scripts/the_shepherd.js',
  './FlockOS/Scripts/love_in_action.js',
  './FlockOS/Scripts/the_fold.js',
  './FlockOS/Scripts/the_shofar.js',
  './FlockOS/Scripts/the_trumpet.js',
  './FlockOS/Scripts/the_commission.js',
];

// Google Apps Script endpoints (network-first)
const API_HOSTS = ['script.google.com', 'script.googleusercontent.com'];

// ── Install: cache the app shell ────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: clean up old caches ───────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_VERSION && k !== API_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: route by request type ────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET (POST, etc.) — let them go to network
  if (event.request.method !== 'GET') return;

  // ── API calls → network-first, cache fallback ──────────────────────────
  if (API_HOSTS.some(h => url.hostname.includes(h))) {
    event.respondWith(networkFirstAPI(event.request));
    return;
  }

  // ── Google Fonts → cache-first (they rarely change) ────────────────────
  if (url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // ── Static assets → cache-first ────────────────────────────────────────
  event.respondWith(cacheFirst(event.request));
});

// ── Cache-first strategy ────────────────────────────────────────────────────
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch (_) {
    return offlineFallback();
  }
}

// ── Network-first strategy for API calls ────────────────────────────────────
async function networkFirstAPI(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (_) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(
      JSON.stringify({ ok: false, error: 'offline', message: 'You are offline. Data will sync when you reconnect.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ── Offline fallback page ───────────────────────────────────────────────────
function offlineFallback() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FlockOS — Offline</title>
  <style>
    body {
      margin: 0; min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #1a1a2e, #0f2027, #1a1a2e);
      color: #ccc; font-family: 'Noto Sans', sans-serif; text-align: center;
    }
    .offline-card {
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px; padding: 40px 32px; max-width: 380px;
    }
    h1 { font-size: 1.5rem; color: #e8a838; margin-bottom: 8px; }
    p { font-size: 0.95rem; line-height: 1.5; color: #999; }
    button {
      margin-top: 20px; padding: 10px 28px; border: none; border-radius: 8px;
      background: #e8a838; color: #1a1a2e; font-weight: 600; cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="offline-card">
    <h1>You're Offline</h1>
    <p>FlockOS can't reach the server right now. Your data is safe and will sync automatically when you reconnect.</p>
    <button onclick="location.reload()">Try Again</button>
  </div>
</body>
</html>`;
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html' } });
}

// ── Message handler for cache control ───────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  if (event.data === 'clearCache') {
    caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
  }
});
