self.addEventListener('push', event => {
  console.log('Push event received');
  try {
    const data = event.data.json();
    console.log('Push data received:', data);
    
    const options = {
      body: data.body,
      icon: '/app-icon-192.png',
      badge: '/app-icon-192.png',
      data: data.url,
      actions: data.actions,
      vibrate: [200, 100, 200]
    };

    console.log('Showing notification with options:', options);
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('Error handling push event:', error);
  }
});

self.addEventListener('notificationclick', event => {
  console.log('Notification clicked');
  event.notification.close();
  
  if (event.action) {
    console.log('Notification action clicked:', event.action);
    return;
  }
  
  console.log('Opening URL:', event.notification.data || '/');
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});