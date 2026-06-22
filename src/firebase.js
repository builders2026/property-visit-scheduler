import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB7-rLdLq5hWCZRjKhX07buk9lzEINn9dI",
  authDomain: "property-visits-ee21f.firebaseapp.com",
  projectId: "property-visits-ee21f",
  storageBucket: "property-visits-ee21f.firebasestorage.app",
  messagingSenderId: "733225973484",
  appId: "1:733225973484:web:9d78c4c9356fc9a9b7d7c9",
  measurementId: "G-D0VYDQ3DTQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
