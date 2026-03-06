/* ═══════════════════════════════════════════════════════════════
   Mithra Life OS — Self-Destruct Service Worker
   
   This SW exists ONLY to kill the old cached Supabase-era SW.
   On install it deletes ALL caches and unregisters itself,
   then forces every open tab to reload with fresh code.
   
   Once all users have visited once, this file can be replaced
   with a real service worker again.
   ═══════════════════════════════════════════════════════════════ */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    // 1. Delete every cache
    caches.keys()
      .then((names) => Promise.all(names.map((n) => caches.delete(n))))
      .then(() => {
        // 2. Unregister this service worker
        return self.registration.unregister();
      })
      .then(() => {
        // 3. Force all open tabs to reload with fresh network code
        return self.clients.matchAll({ type: 'window' });
      })
      .then((windowClients) => {
        windowClients.forEach((client) => client.navigate(client.url));
      })
  );
});
