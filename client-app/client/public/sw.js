/* ═══════════════════════════════════════════════════════════════
   Mithra Life OS — Service Worker
   Handles push notifications, precaching, offline fetch, and
   background sync for offline-first reliability.
   ═══════════════════════════════════════════════════════════════ */

const CACHE_NAME = 'mithra-v2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/assets/logo.png',
];
const BG_SYNC_TAG = 'mithra-bg-sync';
const BG_SYNC_STORE = 'mithra-bg-sync-queue';

/* ─── Install: precache static shell ─── */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) =>
            cache.addAll(STATIC_ASSETS).catch((err) =>
                console.warn('[SW] Precache partial failure (non-blocking):', err)
            )
        )
    );
    self.skipWaiting();
    console.log('[SW] Installed — precached', STATIC_ASSETS.length, 'assets');
});

/* ─── Activate: clean old caches ─── */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) =>
            Promise.all(
                names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
            )
        )
    );
    self.clients.claim();
    console.log('[SW] Activated');
});

/* ─── Fetch: network-first with cache fallback ─── */
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip non-GET and API/Supabase requests (handled by syncEngine)
    if (request.method !== 'GET') return;
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api') || url.hostname.includes('supabase')) return;

    event.respondWith(
        fetch(request)
            .then((response) => {
                // Cache successful responses for offline use
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                }
                return response;
            })
            .catch(() =>
                // Network failed — try cache
                caches.match(request).then((cached) => cached || caches.match('/index.html'))
            )
    );
});

/* ─── Background Sync: retry failed mutations when back online ─── */
self.addEventListener('sync', (event) => {
    if (event.tag === BG_SYNC_TAG) {
        event.waitUntil(processBgSyncQueue());
    }
});

async function processBgSyncQueue() {
    let queue;
    try {
        queue = await getFromIDB(BG_SYNC_STORE);
    } catch {
        return;
    }
    if (!queue || queue.length === 0) return;

    const failed = [];
    for (const item of queue) {
        try {
            const resp = await fetch(item.url, {
                method: item.method,
                headers: item.headers,
                body: item.body,
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        } catch {
            failed.push(item);
        }
    }
    await saveToIDB(BG_SYNC_STORE, failed);
}

/* ─── Minimal IndexedDB helpers for background sync queue ─── */
function openSyncDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open('mithra-sw', 1);
        req.onupgradeneeded = () => req.result.createObjectStore('kv');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function getFromIDB(key) {
    const db = await openSyncDB();
    return new Promise((resolve) => {
        const tx = db.transaction('kv', 'readonly');
        const req = tx.objectStore('kv').get(key);
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
    });
}

async function saveToIDB(key, value) {
    const db = await openSyncDB();
    return new Promise((resolve) => {
        const tx = db.transaction('kv', 'readwrite');
        tx.objectStore('kv').put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
    });
}

/* ─── Push Notification Handler ─── */
self.addEventListener('push', (event) => {
    let data = { title: 'Mithra', body: 'You have a notification!' };

    if (event.data) {
        try {
            data = event.data.json();
        } catch {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body || 'Check your tasks and habits!',
        icon: '/assets/logo.png',
        badge: '/assets/logo.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/#/dashboard',
            type: data.type || 'general',
        },
        actions: data.actions || [
            { action: 'open', title: 'Open Mithra' },
            { action: 'dismiss', title: 'Dismiss' },
        ],
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Mithra Life OS', options)
    );
});

/* ─── Notification Click Handler ─── */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    const url = event.notification.data?.url || '/#/dashboard';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Focus if already open
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin)) {
                    client.focus();
                    client.navigate(url);
                    return;
                }
            }
            // Otherwise open new window
            return clients.openWindow(url);
        })
    );
});
