// Service Worker Minimalis
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
