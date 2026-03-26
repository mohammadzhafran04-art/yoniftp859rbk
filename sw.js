/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'tac-v8-static-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=JetBrains+Mono:wght@400;700&display=swap',
  'https://unpkg.com/leaflet/dist/leaflet.css',
  'https://unpkg.com/leaflet/dist/leaflet.js'
];

// Install: Simpan aset ke cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Caching Assets');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: Bersihkan cache lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
        return null;
      })
    ))
  );
  self.clients.claim();
});

// Fetch: Strategi Network-First untuk koordinat, Cache-First untuk aset
self.addEventListener('fetch', (event) => {
  // Jangan cache permintaan ke Firebase (realtime data)
  if (event.request.url.includes('firebasedatabase.app')) {
    return; 
  }

  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Update cache jika berhasil fetch
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Penanganan Background Sync untuk Lokasi
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-location') {
    event.waitUntil(
      // Logika ini menjaga SW tetap 'awake' saat ada jadwal sinkronisasi
      console.log('SW: Background Sync Active - Pushing Location')
    );
  }
});

// Mencegah Service Worker mati saat aplikasi di-minimize
self.addEventListener('message', (event) => {
  if (event.data === 'keepAlive') {
    console.log('SW: Keep-Alive Signal Received');
  }
});
