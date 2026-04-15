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
  // API запросы — network first (для auth/data)
  if (e.request.url.includes('/api/')) {
    e.respondWith(
      fetch(e.request).catch(() => {
        console.log('🌐 API offline, возвращаем пустой ответ');
        return new Response(JSON.stringify({offline: true}), {
          headers: {'Content-Type': 'application/json'}
        });
      })
    );
    return;
  }

  // Static assets — cache first
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) {
        console.log('📦 Cache hit:', e.request.url);
        return cached;
      }
      
      return fetch(e.request).then((networkRes) => {
        if (!networkRes || networkRes.status >= 400) {
          return caches.match('/offline.html') || 
                 new Response('Offline', {status: 503});
        }
        
        // Кэшируем новые ресурсы
        const resToCache = networkRes.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, resToCache);
        });
        
        return networkRes;
      });
    }).catch(() => {
      console.log('🌐 Полностью оффлайн');
      return caches.match('/offline.html') || 
             new Response('Похоже, вы оффлайн. Перезагрузите страницу.', {status: 503});
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