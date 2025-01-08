importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBkkFF0XhNZeWuDmOfEhsgdfX1VBG7WTas",
  projectId: "csavh31-c6a45",
  messagingSenderId: "954580417010",
  appId: "1:954580417010:web:7d4bcd931955f5b7f5e2c6"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/app-icon-192.png',
    badge: '/app-icon-192.png',
    vibrate: [200, 100, 200]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});