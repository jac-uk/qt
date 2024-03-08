import { initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore, Timestamp } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { connectDatabaseEmulator, getDatabase } from 'firebase/database';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Configure and initialise Firebase
// Config variables are pulled from the environment at build time
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Module API
 * @see https://firebase.google.com/docs/reference/js
 */
const app = initializeApp(config);
const functions = getFunctions(app, 'europe-west2');
const firestore = getFirestore(app);
const auth = getAuth(app);
const database = getDatabase(app);

if (location.hostname === 'localhost' && import.meta.env.VITE_FIREBASE_USE_EMULATORS == 'true') {
    /**
   * Module API
   * @see https://firebase.google.com/docs/emulator-suite/connect_firestore#web-modular-api
   */
    connectFirestoreEmulator(firestore, 'localhost', 8080);
    connectFunctionsEmulator(functions ,'localhost', 5001);
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectDatabaseEmulator(database ,'localhost', 9000);
}

export { firestore, auth, functions, database, Timestamp };
export default app;
