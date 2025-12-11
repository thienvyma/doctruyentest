// Service Worker for PWA
// DISABLED in development - Auto-update system handles cache clearing
const CACHE_NAME = 'novel-reader-v5';
const DEV_MODE = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

// Install
self.addEventListener('install', (event) => {
    if (DEV_MODE) {
        // Skip waiting in dev mode - always use new version
        self.skipWaiting();
        return;
    }
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                // Only cache in production
                return Promise.resolve();
            })
    );
});

// Fetch
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // In dev mode, always fetch from network (no cache)
    if (DEV_MODE) {
        event.respondWith(fetch(event.request));
        return;
    }
    
    // In production, cache strategy
    // Always fetch from network for HTML, JS, CSS files
    if (url.pathname.endsWith('.html') || 
        url.pathname.endsWith('.js') || 
        url.pathname.endsWith('.css') ||
        url.pathname === '/' ||
        url.pathname.includes('/js/')) {
        event.respondWith(fetch(event.request));
        return;
    }
    
    // For other files, try cache first, then network
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});

// Activate
self.addEventListener('activate', (event) => {
    if (DEV_MODE) {
        // In dev mode, clear all caches and take control immediately
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        console.log('[SW] Deleting cache:', cacheName);
                        return caches.delete(cacheName);
                    })
                );
            }).then(() => {
                // Take control of all clients immediately
                return self.clients.claim();
            })
        );
        return;
    }
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

