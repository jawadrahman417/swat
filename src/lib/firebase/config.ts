// src/lib/firebase/config.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
// import { getFirestore, type Firestore } from 'firebase/firestore'; // Example for Firestore
// import { getStorage, type FirebaseStorage } from 'firebase/storage'; // Example for Storage

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
// let db: Firestore; // Example for Firestore
// let storage: FirebaseStorage; // Example for Storage

if (typeof window !== 'undefined' && !getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  // db = getFirestore(app); // Example for Firestore
  // storage = getStorage(app); // Example for Storage
} else if (typeof window !== 'undefined') {
  app = getApp();
  auth = getAuth(app);
  // db = getFirestore(app); // Example for Firestore
  // storage = getStorage(app); // Example for Storage
} else {
  // Handle server-side initialization if necessary, though auth is client-side
  // This basic setup primarily targets client-side auth.
  // For server-side admin tasks, you'd use firebase-admin.
}

export { app, auth /*, db, storage */ };
