"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDD49nlENFPmd0ngm4YqFc1Q1KmsuiKgpY",
  authDomain: "bubblecall-94fb4.firebaseapp.com",
  projectId: "bubblecall-94fb4",
  storageBucket: "bubblecall-94fb4.appspot.com",
  messagingSenderId: "319291188245",
  appId: "1:319291188245:web:cc156edfea8b3675651a1c"
};

// Initialize Firebase
export function initializeFirebase() {
  // Check if Firebase has already been initialized
  if (getApps().length === 0) {
    const app = initializeApp(firebaseConfig);
    return {
      app,
      auth: getAuth(app),
      db: getFirestore(app),
      rtdb: getDatabase(app)
    };
  } else {
    const app = getApp();
    return {
      app,
      auth: getAuth(app),
      db: getFirestore(app),
      rtdb: getDatabase(app)
    };
  }
}