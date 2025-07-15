
const CACHE_NAME = 'vigio-system-v1.0.1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Ícones principais
  '/lovable-uploads/3ff36fea-6d51-4fea-a019-d8989718b9cd.png',
  // Outros assets podem ser adicionados dinamicamente
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Cache-first for static, network-first for HTML
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const req = event.request;
  if (req.headers.get('accept')?.includes('text/html')) {
    // Network first for HTML
    event.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req).then((res) => res || caches.match('/')))
    );
  } else {
    // Cache first for static assets
    event.respondWith(
      caches.match(req).then((res) => {
        return res || fetch(req).then((fetchRes) => {
          if (fetchRes.status === 200) {
            const resClone = fetchRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return fetchRes;
        });
      })
    );
  }
});

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    // Implement background sync logic if needed
  }
});

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do Vigio System',
    icon: '/lovable-uploads/3ff36fea-6d51-4fea-a019-d8989718b9cd.png',
    badge: '/lovable-uploads/3ff36fea-6d51-4fea-a019-d8989718b9cd.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir App',
        icon: '/lovable-uploads/3ff36fea-6d51-4fea-a019-d8989718b9cd.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/lovable-uploads/3ff36fea-6d51-4fea-a019-d8989718b9cd.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Vigio System', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/'));
  }
});
