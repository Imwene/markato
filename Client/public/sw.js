// public/sw.js
const CACHE_NAME = 'markato-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/assets/markato-logo.svg'
];

// API routes to cache
const API_ROUTES = [
  '/api/services',
  '/api/config/vehicle-types',
  '/api/config/scents',
  '/api/config/optional-services'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Fetch event - serve from cache, then network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (API_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return fetch(request)
          .then((response) => {
            // Cache only successful responses
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // Return cached response if network fails
            return cache.match(request);
          });
      })
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request);
    })
  );
});