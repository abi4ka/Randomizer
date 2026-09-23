/**
 * Randomizer PWA Service Worker
 * Provides reliable offline capabilities and instant updates.
 */

const CACHE_NAME = 'randomizer-v3';

const STATIC_ASSETS = [
    './',
    'index.html',
    'style.css',
    'script.js',
    'manifest.json',
    'assets/icons/icon.svg',
    'assets/icons/icon-192.png',
    'assets/icons/icon-512.png',
    'assets/icons/icon-maskable-512.png'
];

// Install: Pre-cache application shell assets and activate immediately
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// Activate: Delete all previous cache versions immediately and claim all clients
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch handler: Network-First for HTML navigation, Stale-While-Revalidate for assets
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    if (!url.protocol.startsWith('http')) return;

    // Navigation requests (HTML pages): Network-First with cache fallback for offline
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                return caches.match(event.request, { ignoreSearch: true })
                    .then((cached) => cached || caches.match('./', { ignoreSearch: true }))
                    .then((cached) => cached || caches.match('index.html', { ignoreSearch: true }));
            })
        );
        return;
    }

    // Static assets: Stale-While-Revalidate with search param tolerance
    event.respondWith(
        caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => null);

            if (cachedResponse) {
                return cachedResponse;
            }

            return fetchPromise.then((networkResponse) => {
                if (networkResponse) {
                    return networkResponse;
                }
                return new Response('Network error occurred and asset is not cached', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: { 'Content-Type': 'text/plain' }
                });
            });
        })
    );
});
