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

  return self.registration.showNotification(notificationTitle, notificationOptions);
});