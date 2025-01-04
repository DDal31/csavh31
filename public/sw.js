self.addEventListener('push', event => {
  console.log('Push event received');
  try {
    const data = event.data.json();
    console.log('Push data received:', data);
    
    // Handle iOS specific payload structure
    const title = data.aps?.alert?.title || data.title;
    const body = data.aps?.alert?.body || data.body;
    const url = data.fcm_options?.link || data.url;
    
    const options = {
      body,
      icon: 'https://kzahxvazbthyjjzugxsy.supabase.co/storage/v1/object/public/site-assets/app-icon-192.png',
      badge: 'https://kzahxvazbthyjjzugxsy.supabase.co/storage/v1/object/public/site-assets/app-icon-192.png',
      data: url,
      actions: data.actions,
      vibrate: [200, 100, 200],
      // iOS specific options
      timestamp: new Date().getTime(),
      tag: data.tag || 'default',
      renotify: true
    };

    console.log('Showing notification with options:', options);
    event.waitUntil(
      self.registration.showNotification(title, options)
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