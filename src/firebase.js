import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBKQD_OqCCLTspPd6Z7ZahfhvtV8sQ4TV4",
  authDomain: "edupass-a2db8.firebaseapp.com",
  projectId: "edupass-a2db8",
  storageBucket: "edupass-a2db8.firebasestorage.app",
  messagingSenderId: "1029355929868",
  appId: "1:1029355929868:web:aee2091954297cb9494929",
  measurementId: "G-LYBTWVLKE0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);