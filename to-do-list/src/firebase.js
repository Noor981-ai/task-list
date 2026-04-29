import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBWtDhkbopmUowVV-zUvWvU7I0rorQF3jI",
  authDomain: "to-do-list-ed2ca.firebaseapp.com",
  projectId: "to-do-list-ed2ca",
  storageBucket: "to-do-list-ed2ca.firebasestorage.app",
  messagingSenderId: "29470444395",
  appId: "1:29470444395:web:a390ebe3fbc51969531a2e"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);