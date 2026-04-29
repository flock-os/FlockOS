/* ══════════════════════════════════════════════════════════════════════════════
   THE LIVING WATER — Service Worker (New Covenant Shell)
   "Whosoever drinketh of the water that I shall give him shall never thirst."
   — John 4:14

   Strategy:
   • APP SHELL   → Cache-first, background refresh (fast loads)
   • NAVIGATION  → Network-first, offline fallback to cached index.html
   • FONTS       → Cache-first (immutable after first fetch)
   • PUSH        → Show notification; click → focus or open app
   ══════════════════════════════════════════════════════════════════════════════ */

const CACHE_NAME = 'flockos-new-covenant-v1.10';

/* Derive base path from SW location (works at root or any subpath) */
const SW_BASE = self.location.pathname.replace(/\/[^\/]+$/, '/');
// e.g. '/FlockOS/New_Covenant/' on GitHub Pages, or '/' at Firebase root

/* App shell — these files are cached on SW install */
const APP_SHELL = [
  SW_BASE,
  SW_BASE + 'index.html',
  SW_BASE + 'Styles/new_covenant.css',
  SW_BASE + 'Scripts/the_ark.js',
  SW_BASE + 'Scripts/the_adornment.js',
  SW_BASE + 'Scripts/the_lampstand.js',
  SW_BASE + 'Scripts/the_oil.js',
  SW_BASE + 'Scripts/the_watchmen.js',
  SW_BASE + 'Scripts/the_living_water_register.js',
  SW_BASE + 'Scripts/the_veil/index.js',
  SW_BASE + 'Scripts/the_veil/the_crown.js',
  SW_BASE + 'Scripts/the_veil/the_pillars.js',
  SW_BASE + 'Scripts/the_veil/the_hem.js',
  SW_BASE + 'Scripts/the_veil/the_courtyard.js',
  SW_BASE + 'Scripts/the_scribes/index.js',
  SW_BASE + 'Scripts/the_priesthood/index.js',
  SW_BASE + 'Images/NewCovenant.png',
  SW_BASE + 'manifest.json',
];

/* ─── Install: cache the app shell ─────────────────────────────────────────── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(APP_SHELL).catch((err) => {
        console.warn('[SW] Precache partial failure — continuing.', err);
      })
    )
  );
  self.skipWaiting();
});

/* ─── Activate: purge old caches ────────────────────────────────────────────── */
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

/* ─── Listen for SKIP_WAITING from the page (forces immediate activation) ──── */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* ─── Fetch: routing strategies ─────────────────────────────────────────────── */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  /* Skip non-GET and cross-origin API calls (Firebase, GAS) */
  if (request.method !== 'GET') return;
  if (!url.origin.includes(self.location.hostname) &&
      !url.hostname.includes('fonts.googleapis.com') &&
      !url.hostname.includes('fonts.gstatic.com')) return;

  /* Google Fonts — cache-first (essentially immutable) */
  if (url.hostname.includes('fonts.gstatic.com') ||
      url.hostname.includes('fonts.googleapis.com')) {
    event.respondWith(_cacheFirst(request));
    return;
  }

  /* Navigation requests (HTML pages) — network-first with offline fallback */
  if (request.mode === 'navigate') {
    event.respondWith(_networkFirstNav(request));
    return;
  }

  /* Static assets (JS, CSS, SVG, images) — stale-while-revalidate */
  if (/\.(js|css|svg|png|jpg|webp|woff2?)$/.test(url.pathname)) {
    event.respondWith(_staleWhileRevalidate(request));
    return;
  }
});

/* ─── Push notifications ────────────────────────────────────────────────────── */
self.addEventListener('push', (event) => {
  let data = { title: 'FlockOS', body: 'You have a new notification.' };
  try { data = { ...data, ...event.data.json() }; } catch (_) {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    '/Images/NewCovenant.png',
      badge:   '/Images/NewCovenant.png',
      data:    data,
      vibrate: [150, 60, 150],
      tag:     data.tag || 'flockos',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(self.location.origin));
      if (existing) return existing.focus().then((c) => c.navigate(target));
      return self.clients.openWindow(target);
    })
  );
});

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

async function _cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const fresh = await fetch(request);
  if (fresh.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, fresh.clone());
  }
  return fresh;
}

async function _staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((fresh) => {
    if (fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  }).catch(() => null);
  return cached || (await fetchPromise) || new Response('Offline', { status: 503 });
}

async function _networkFirstNav(request) {
  try {
    const fresh = await fetch(request);
    if (fresh.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch (_) {
    const cached = await caches.match(request) ||
                   await caches.match(SW_BASE + 'index.html') ||
                   await caches.match(SW_BASE);
    if (cached) return cached;
    return new Response(
      '<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem">' +
      '<h2>You\'re offline.</h2><p>FlockOS will be available when you reconnect.</p>' +
      '</body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}
