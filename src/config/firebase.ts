import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCikvgzPhOwUymoB5LrX2LgT1_8T8Pq9tc",
  authDomain: "csavh31.firebaseapp.com",
  projectId: "csavh31",
  storageBucket: "csavh31.firebasestorage.app",
  messagingSenderId: "917694935396",
  appId: "1:917694935396:web:2f39c9de2754ca65d28a71",
  measurementId: "G-CVDSC1ZV03"
};

const app = initializeApp(firebaseConfig);

// Check if the browser supports Firebase Messaging
const isSupported = () => {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers not supported');
    return false;
  }
  return true;
};

let messaging: any = null;
try {
  if (isSupported()) {
    messaging = getMessaging(app);
    console.log('Firebase Messaging initialized successfully');
  }
} catch (err) {
  console.error('Error initializing Firebase Messaging:', err);
}

export const requestNotificationPermission = async () => {
  console.log('Requesting notification permission...');
  
  if (!isSupported()) {
    console.log('Browser does not support notifications');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'BEpTfcfcPXLCo6KKmODVDfZETR_YPcsQJGD8hs_eQRAInu0el6Rz3Df6_7EacaL0CGkxJqZtiB4Sb_n5RM3WpQA'
      });
      console.log('Notification permission granted. Token:', token);
      return token;
    }
    console.log('Notification permission denied');
    return null;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) {
      console.log('Messaging not supported');
      resolve(null);
      return;
    }

    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      resolve(payload);
    });
});

export { messaging };