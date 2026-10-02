"use server";

import { initializeApp, getApps, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getDatabase } from "firebase-admin/database";

// Firebase Admin SDK configuration
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}") as {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

// Initialize Firebase Admin SDK
export function initializeFirebaseAdmin() {
  // Check if Firebase Admin has already been initialized
  if (getApps().length === 0) {
    const app = initializeApp({
      credential: getApps().length === 0 ? admin.credential.cert(serviceAccount) : undefined,
    });
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