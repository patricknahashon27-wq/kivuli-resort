// Kivuli Resort - Service Worker (enables offline support + install as app)
const CACHE = 'kivuli-v1';
const ASSETS = [
  '/', '/menu.html', '/admin.html',
  '/css/style.css', '/css/admin.css',
  '/js/main.js', '/js/admin.js',
  '/manifest.json', '/images/favicon.svg', '/images/logo.png',
  '/images/hero.jpg', '/images/restaurant.jpg', '/images/food.jpg', '/images/garden.jpg', '/images/pool.jpg', '/images/room.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;
  // Network-first for API, cache-first for static assets
  if (request.url.includes('/api/') || request.url.includes('/admin')) return;
  e.respondWith(
    caches.match(request).then(cached =>
      cached || fetch(request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(request, clone));
        }
        return response;
      }).catch(() => cached)
    )
  );
});
