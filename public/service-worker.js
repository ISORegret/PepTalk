// Service worker for the PepTalk PWA. All URLs are resolved from this file so
// the same build works at /PepTalk/, /PepTalk/PepTalk/, or another base path.
const CACHE_NAME = 'peptalk-shell-v3';
const RUNTIME_CACHE = 'peptalk-runtime-v3';
const APP_ROOT = new URL('./', self.location.href);
const appUrl = (path = '') => new URL(path, APP_ROOT).href;

// Files to cache immediately on install
const PRECACHE_URLS = [
  appUrl(),
  appUrl('index.html'),
  appUrl('manifest.json'),
  appUrl('icon-192.png'),
  appUrl('icon-512.png')
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Precaching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('peptalk-') && name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => {
              console.log('Service Worker: Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Always try the network first for page navigations so a newly deployed
  // version is picked up promptly. Fall back to the cached app shell offline.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(appUrl('index.html'), copy));
          }
          return response;
        })
        .catch(async () =>
          (await caches.match(appUrl('index.html'))) || caches.match(appUrl())
        )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME_CACHE)
          .then((cache) => {
            return fetch(event.request)
              .then((response) => {
                // Don't cache non-successful responses
                if (!response || response.status !== 200 || response.type === 'error') {
                  return response;
                }

                // Clone the response
                const responseToCache = response.clone();

                // Cache the fetched response
                cache.put(event.request, responseToCache);

                return response;
              });
          });
      })
      .catch(() => {
        // If both cache and network fail, return offline page if available
        return caches.match(appUrl('index.html'));
      })
  );
});

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
