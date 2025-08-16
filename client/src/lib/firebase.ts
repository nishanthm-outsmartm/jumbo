import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const VITE_FIREBASE_API_KEY = "AIzaSyAo0hS9IHLUP9gXbZYq8GtlUUXGwOJWrKk";
const VITE_FIREBASE_APP_ID = "1:797827104422:web:e6b002e3d2f7511757fe67";
const VITE_FIREBASE_PROJECT_ID = "sample-9b8aa";

const firebaseConfig = {
  apiKey: VITE_FIREBASE_API_KEY,
  authDomain: `${VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
