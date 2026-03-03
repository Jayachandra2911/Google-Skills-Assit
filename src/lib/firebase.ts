import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCzzu5vXtQjvJiEbQaQ9VILCGlndJyrqXY",
  authDomain: "genaiwebsite-c9775.firebaseapp.com",
  projectId: "genaiwebsite-c9775",
  storageBucket: "genaiwebsite-c9775.firebasestorage.app",
  messagingSenderId: "530688964201",
  appId: "1:530688964201:web:6ba00b83aecbbbd3d9d4f8",
  measurementId: "G-69GM3389T3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn("Firestore persistence failed: multiple tabs open");
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the features required to enable persistence
      console.warn("Firestore persistence not supported by browser");
    }
  });
}

export const googleProvider = new GoogleAuthProvider();
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
