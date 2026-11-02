// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Firestore import

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzyw3OXKIyZ3Gpbrgp9FLV-xu7wMZu7gs",
  authDomain: "counselor-hub.firebaseapp.com",
  projectId: "counselor-hub",
  storageBucket: "counselor-hub.firebasestorage.app",
  messagingSenderId: "724916560626",
  appId: "1:724916560626:web:7a0e6e653240267c4b266b",
  measurementId: "G-EN7CY4H1BE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export Firestore Database
export const db = getFirestore(app);