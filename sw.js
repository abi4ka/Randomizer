/**
 * Randomizer PWA Service Worker
 * Provides reliable offline capabilities and instant loading.
 */

const CACHE_NAME = 'randomizer-v1';

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

// Install: Pre-cache application shell assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Activate: Clean up old cache versions and claim clients
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

// Fetch: Stale-While-Revalidate strategy with offline fallback
self.addEventListener('fetch', (event) => {
    // Only intercept standard GET requests
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Don't intercept chrome-extension or other protocols
    if (!url.protocol.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                // Update cache if valid response
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Offline fallback for navigation requests
                if (event.request.mode === 'navigate') {
                    return caches.match('./') || caches.match('index.html');
                }
            });

            // Return cached response immediately if available, otherwise wait for network
            return cachedResponse || fetchPromise;
        })
    );
});
