// FlockOS Dev Matrix — Service Worker
// Cache-first for the launcher shell and local assets.
// External URLs (Firebase, GitHub, GAS) are always network-fetched.

const CACHE = 'dev-matrix-v2';

const PRECACHE = [
  '/dev-launcher.html',
  '/dev-launcher.manifest.json',
  '/dev-launcher-icon-192.png',
  '/dev-launcher-icon-512.png',
  '/dev-launcher-icon-180.png',
  '/Covenant/Courts/TheTabernacle/Images/FlockOS_AppIcon.png',
  '/Covenant/Courts/TheTabernacle/Images/FlockOS_Pink.png',
  '/Covenant/Courts/TheTabernacle/Images/FlockOS_Orange.png',
  '/Covenant/Courts/TheTabernacle/Images/FlockOS_Blue.png',
  '/Covenant/Courts/TheTabernacle/Images/FlockOS_Green.png',
  '/Covenant/Courts/TheTabernacle/Images/FlockOS_White.png',
  '/Covenant/Courts/TheTabernacle/Images/FlockOS_Midnight.png',
  '/Covenant/Courts/TheTabernacle/Images/FlockOS_Angels.png',
  '/Covenant/Courts/TheTabernacle/Images/FlockOS_BurntOrange.png'
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
