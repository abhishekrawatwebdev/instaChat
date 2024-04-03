import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/storage';
import '@react-native-firebase/database';
import '@react-native-firebase/firestore';

// Initialize Firebase (replace with your Firebase config)
const firebaseConfig = {
  apiKey: process.env.REACT_NATIVE_FIREBASE_API_KEY,
  authDomain: process.env.REACT_NATIVE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_NATIVE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_NATIVE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_NATIVE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_NATIVE_FIREBASE_APP_ID,
  measurementId: process.env.REACT_NATIVE_FIREBASE_MEASUREMENT_ID
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Export Firebase services
export const auth = firebase.auth();
export const storage = firebase.storage();
export const database = firebase.database();
export const firestore = firebase.firestore();

export default firebase;
