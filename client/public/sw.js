const CACHE_NAME = 'primavista-v2';
const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/pwa-icon-192.png',
  '/pwa-icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function cachePut(request, response) {
  if (response && response.status === 200 && response.type === 'basic') {
    const copy = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  // Never cache the API — responses can hold personal data and must stay fresh.
  if (url.pathname.startsWith('/api/')) return;

  // Navigations: network-first so a deploy is picked up immediately; offline,
  // fall back to the cached page itself (e.g. /impressum.html), then the shell.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match('/'))
      )
    );
    return;
  }

  // Content-hashed assets are immutable — cache-first is safe and fastest.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request).then((cached) =>
        cached || fetch(event.request).then((response) => cachePut(event.request, response))
      )
    );
    return;
  }

  // Everything else (images, icons, manifest, legal.css) can be replaced in
  // place, so serve cache for speed but revalidate in the background.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => cachePut(event.request, response))
        .catch(() => cached);
      return cached || network;
    })
  );
});
