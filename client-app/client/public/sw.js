/* ═══════════════════════════════════════════════════════════════
   Mithra Life OS — Service Worker
   Handles push notifications for task reminders and habit streaks.
   ═══════════════════════════════════════════════════════════════ */

const CACHE_NAME = 'mithra-v1';

/* ─── Install ─── */
self.addEventListener('install', (event) => {
    self.skipWaiting();
    console.log('[SW] Installed');
});

/* ─── Activate ─── */
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
