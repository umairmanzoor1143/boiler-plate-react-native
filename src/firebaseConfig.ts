import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLogLevel } from "firebase/firestore";

// Reduce noisy logs
setLogLevel('error');

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_APP_ID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with settings
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  localCache: persistentLocalCache({
    cacheSizeBytes: 50 * 1024 * 1024, // 50 MB
  }),
});


// const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { app, auth, db };
