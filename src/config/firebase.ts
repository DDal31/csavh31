import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCikvgzPhOwUymoB5LrX2LgT1_8T8Pq9tc",
  authDomain: "csavh31.firebaseapp.com",
  projectId: "csavh31",
  storageBucket: "csavh31.firebasestorage.app",
  messagingSenderId: "917694935396",
  appId: "1:917694935396:web:2f39c9de2754ca65d28a71",
  measurementId: "G-CVDSC1ZV03"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const messaging = getMessaging(app);