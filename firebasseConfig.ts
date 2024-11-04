import { initializeAuth,getReactNativePersistence } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyB1hw4yCKG_LMMDaZOl_9Gr4wLhZPnjhcU",
  authDomain: "boilerplateapp-8cea2.firebaseapp.com",
  projectId: "boilerplateapp-8cea2",
  storageBucket: "boilerplateapp-8cea2.appspot.com",
  messagingSenderId: "1038658538848",
  appId: "1:1038658538848:web:595f98bc122e879470e205"
};
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);
