// TeachMate Service Worker with Push Notifications
const CACHE_NAME = 'teachmate-v2';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// Handle push events - works even when app is closed
self.addEventListener('push', e => {
  let data = { title: 'TeachMate', body: 'You have a new notification' };
  try {
    if (e.data) {
      const parsed = e.data.json();
      data = { ...data, ...parsed };
    }
  } catch (err) {
    if (e.data) {
      data.body = e.data.text();
    }
  }
  
  const options = {
    body: data.body || '',
    icon: '/teachmate/teachmate-icon.png',
    badge: '/teachmate/teachmate-icon.png',
    tag: data.tag || 'tm-push-' + Date.now(),
    data: data.url || '/',
    vibrate: [200, 100, 200],
    actions: data.actions || []
  };
  
  e.waitUntil(
    self.registration.showNotification(data.title || 'TeachMate', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('/teachmate') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(e.notification.data || '/teachmate/');
    })
  );
});

// Periodic sync for background checks (if supported)
self.addEventListener('periodicsync', e => {
  if (e.tag === 'check-reminders') {
    e.waitUntil(checkAndNotify());
  }
});

async function checkAndNotify() {
  // This would check Firebase for upcoming exams/alerts
  // For now, handled by the main app when it's open
}
