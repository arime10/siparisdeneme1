// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA1vwH10RRmVxMk5GjowGLk_Za2dx9ip-k",
  authDomain: "garson-e8fe9.firebaseapp.com",
  projectId: "garson-e8fe9",
  storageBucket: "garson-e8fe9.firebasestorage.app",
  messagingSenderId: "695044062362",
  appId: "1:695044062362:android:9feb3680c58376f995b323",
  measurementId: "G-0VMMN28CKG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
