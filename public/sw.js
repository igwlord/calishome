const CACHE_NAME = 'calis-home-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/calishome.png'
];

// Install SW
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      }).catch(err => console.warn('Cache install error', err))
  );
});

// Activate the SW
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Listen for requests
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones que no sean GET (como las de Firestore)
  if (event.request.method !== 'GET') return;
  
  // Ignorar peticiones a Firebase y APIs de Google
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('firebase') || 
      event.request.url.includes('googleapis')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request).catch((err) => {
          console.warn('Fetch failed for:', event.request.url, err);
        });
      }).catch(err => console.warn('Cache error', err))
  );
});