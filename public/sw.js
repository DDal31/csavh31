self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/app-icon-192.png',
    badge: '/app-icon-192.png',
    data: data.url,
    actions: data.actions,
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action) {
    // Handle specific actions if needed
    console.log('Notification action clicked:', event.action);
    return;
  }
  
  // Open the main app if no specific action
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});