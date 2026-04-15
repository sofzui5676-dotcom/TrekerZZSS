const CACHE_NAME = 'smart-dashboard-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.js',
  '/src/core/uiContainer.js',
  '/src/core/router.js',
  '/src/modules/tasks/tasks.js',
  '/src/modules/notes/notes.js',
  '/src/modules/tracker/tracker.js',
  '/src/core/authService.js'
];

// Установка
self.addEventListener('install', (e) => {
  console.log('🚀 Service Worker: install');
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Кэшируем assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Активация
self.addEventListener('activate', (e) => {
  console.log('🔄 Service Worker: activate');
  e.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => 
          name !== CACHE_NAME && caches.delete(name)
        )
      )
    )
  );
  self.clients.claim();
});

// Fetch — стратегия Network First + Cache Fallback
self.addEventListener('fetch', (e) => {
  console.log('🟢 SW fetch:', e.request.url);
  
  e.respondWith(
    caches.match(e.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('✅ Cache hit:', e.request.url);
          return cachedResponse;
        }
        
        return fetch(e.request).then(
          networkResponse => {
            // Кэшируем успешные ответы
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(e.request, responseToCache);
              });
            }
            return networkResponse;
          }
        ).catch(() => {
          console.log('🌐 Offline fallback');
          // Fallback для root
          if (e.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Push уведомления (опционально)
self.addEventListener('push', (e) => {
  const options = {
    body: e.data ? e.data.text() : 'Новое уведомление!',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [100, 50, 100],
    data: { date: new Date().toISOString() }
  };
  
  e.waitUntil(
    self.registration.showNotification('Smart Dashboard', options)
  );
});

// Background sync (для оффлайн задач)
self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-tasks') {
    e.waitUntil(syncPendingTasks());
  }
});

async function syncPendingTasks() {
  // Синхронизация оффлайн задач с сервером
  console.log('🔄 Background sync tasks');
}