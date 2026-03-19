/* eslint-disable no-undef */
/**
 * Service worker: precache + API network-first + Web Push handlers.
 * Built with vite-plugin-pwa injectManifest; __WB_MANIFEST is injected at build time.
 */
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
  })
);

self.addEventListener('push', (event) => {
  let payload = { title: 'Kamel', body: '', data: { url: '/' } };
  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch {
    try {
      const t = event.data?.text();
      if (t) payload.body = t;
    } catch {
      /* ignore */
    }
  }

  const title = payload.title || 'Kamel';
  const body = payload.body || payload.message || '';
  const data = payload.data && typeof payload.data === 'object' ? payload.data : { url: '/' };
  const tag = data.notificationId ? `kamel-${data.notificationId}` : `kamel-${Date.now()}`;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data,
      tag,
      vibrate: [180, 80, 180],
      renotify: Boolean(data.notificationId),
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const raw = event.notification.data?.url || '/';
  const targetUrl = new URL(raw, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const all = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of all) {
        try {
          if (new URL(client.url).origin === self.location.origin && 'focus' in client) {
            await client.focus();
            return;
          }
        } catch {
          /* ignore */
        }
      }
      if (clients.openWindow) {
        await clients.openWindow(targetUrl);
      }
    })()
  );
});
