import firebase from 'firebase/app';
import 'firebase/app-check';
import 'firebase/functions';
import 'firebase/firestore';
import 'firebase/auth';

// Configure and initialise Firebase
// Config variables are pulled from the environment at build time
const config = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
};

const functions = firebase.initializeApp(config).functions('europe-west2');
const firestore = firebase.firestore();
const auth = firebase.auth();

if (location.hostname === 'localhost' && process.env.VUE_APP_FIREBASE_USE_EMULATORS == 'true') {
  firestore.useEmulator('localhost', 8080);
  functions.useEmulator('localhost', 5001);
  auth.useEmulator('http://localhost:9099');
}

export { firestore, auth, functions };
export default firebase;
