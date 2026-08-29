// Service worker for the PepTalk PWA. All URLs are resolved from this file so
// the same build works at /PepTalk/, /PepTalk/PepTalk/, or another base path.
const CACHE_NAME = 'peptalk-shell-v3';
const RUNTIME_CACHE = 'peptalk-runtime-v3';
const APP_ROOT = new URL('./', self.location.href);
const appUrl = (path = '') => new URL(path, APP_ROOT).href;

const PRECACHE_URLS = [
  appUrl(),
  appUrl('index.html'),
  appUrl('manifest.json'),
  appUrl('icon-192.png'),
  appUrl('icon-512.png')
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((name) => name.startsWith('peptalk-') && name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(appUrl('index.html'), copy));
          }
          return response;
        })
        .catch(async () => (await caches.match(appUrl('index.html'))) || caches.match(appUrl()))
    );
    return;
  }

  // Hashed build assets can be cache-first. Non-hashed app shell/config files are
  // network-first so a new PepTalk release is picked up without clearing site data.
  const url = new URL(event.request.url);
  const looksHashed = /\/assets\/.*-[A-Za-z0-9_-]{6,}\.(?:js|css)$/.test(url.pathname);
  if (looksHashed) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }))
    );
    return;
  }

  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match(appUrl('index.html'))))
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
