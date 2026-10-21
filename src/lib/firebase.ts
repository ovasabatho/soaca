import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBlgcH0ZHMaGtKH2vuBmO77SKP_NsgjDmo',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'soacaportal.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'soacaportal',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1091209894989',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1091209894989:web:dccde3ff0a29eb27151004',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { firebaseConfig };
