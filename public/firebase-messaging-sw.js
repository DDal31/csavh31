importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCikvgzPhOwUymoB5LrX2LgT1_8T8Pq9tc",
  authDomain: "csavh31.firebaseapp.com",
  projectId: "csavh31",
  storageBucket: "csavh31.firebasestorage.app",
  messagingSenderId: "917694935396",
  appId: "1:917694935396:web:2f39c9de2754ca65d28a71"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  // Gestion du format iOS
  const notificationTitle = payload.notification?.title || payload.aps?.alert?.title;
  const notificationBody = payload.notification?.body || payload.aps?.alert?.body;
  
  const notificationOptions = {
    body: notificationBody,
    icon: 'https://kzahxvazbthyjjzugxsy.supabase.co/storage/v1/object/public/site-assets/app-icon-192.png',
    badge: 'https://kzahxvazbthyjjzugxsy.supabase.co/storage/v1/object/public/site-assets/app-icon-192.png',
    // Options spécifiques iOS
    sound: 'default',
    timestamp: new Date().getTime(),
    renotify: true,
    tag: 'default'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});