// FlockOS Dev Matrix — Service Worker
// Cache-first for the launcher shell and local assets.
// External URLs (Firebase, GitHub, GAS) are always network-fetched.

const CACHE = 'dev-matrix-v3';

// Derive base path from SW location so this works from any subdirectory
const BASE = self.location.pathname.replace(/\/[^/]*$/, '/');

const PRECACHE = [
  BASE + 'dev-launcher.html',
  BASE + 'dev-launcher.manifest.json',
  BASE + 'dev-launcher-icon-192.png',
  BASE + 'dev-launcher-icon-512.png',
  BASE + 'dev-launcher-icon-180.png',
  BASE + 'Covenant/Courts/TheTabernacle/Images/FlockOS_AppIcon.png',
  BASE + 'Covenant/Courts/TheTabernacle/Images/FlockOS_Pink.png',
  BASE + 'Covenant/Courts/TheTabernacle/Images/FlockOS_Orange.png',
  BASE + 'Covenant/Courts/TheTabernacle/Images/FlockOS_Blue.png',
  BASE + 'Covenant/Courts/TheTabernacle/Images/FlockOS_Green.png',
  BASE + 'Covenant/Courts/TheTabernacle/Images/FlockOS_White.png',
  BASE + 'Covenant/Courts/TheTabernacle/Images/FlockOS_Midnight.png',
  BASE + 'Covenant/Courts/TheTabernacle/Images/FlockOS_Angels.png',
  BASE + 'Covenant/Courts/TheTabernacle/Images/FlockOS_BurntOrange.png'
];

// External origins — always go to network, never cache
const NETWORK_ONLY = [
  'firebase',
  'github.com',
  'script.google.com',
  'analytics.google.com',
  'flockos-comms.web.app'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE).catch(() => {}))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Always network for external services
  if (NETWORK_ONLY.some(host => url.includes(host))) return;
  // Only handle GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
