importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCikvgzPhOwUymoB5LrX2LgT1_8T8Pq9tc",
  authDomain: "csavh31.firebaseapp.com",
  projectId: "csavh31",
  storageBucket: "csavh31.firebasestorage.app",
  messagingSenderId: "917694935396",
  appId: "1:917694935396:web:2f39c9de2754ca65d28a71",
  measurementId: "G-CVDSC1ZV03"
});

const messaging = firebase.messaging();

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(self.clients.claim());
});

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/app-icon-192.png',
    badge: '/app-icon-192.png',
    vibrate: [200, 100, 200],
    sound: 'default',
    data: payload.data,
    tag: 'notification-' + Date.now(),
    renotify: true,
    actions: [
      {
        action: 'open',
        title: 'Ouvrir',
      }
    ]
  };

  if ('setAppBadge' in navigator) {
    navigator.setAppBadge(1).catch((error) => {
      console.log('Error setting app badge:', error);
    });
  }

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification click received.');
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({type: 'window'}).then(windowClients => {
        // Vérifier si une fenêtre est déjà ouverte
        for (let client of windowClients) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Si aucune fenêtre n'est ouverte, en ouvrir une nouvelle
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});