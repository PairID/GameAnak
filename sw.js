// sw.js - Service Worker for Petualangan Spidey Cilik
// Cache-First strategy ensuring 100% offline capability for toddler educational gameplay

const CACHE_NAME = 'spidey-cilik-v1';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './audio.js',
  './engines.js',
  './illustrations.js',
  './levels.js',
  './mascot.js',
  './manifest.webmanifest',
  './icons/favicon.svg',
  './icons/icon-192.svg',
  './icons/icon-512.svg',
  './icons/icon-maskable.svg'
];

// Install Event: pre-cache all static shell and game assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate Event: clean up any legacy / outdated caches and claim active clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch Event: Cache-First strategy with network fallback and dynamic caching
self.addEventListener('fetch', (event) => {
  // Only process GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // Fallback to network
        return fetch(event.request)
          .then((networkResponse) => {
            // Cache valid basic responses
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch((err) => {
            // Offline fallback for HTML navigation
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
            throw err;
          });
      })
  );
});
