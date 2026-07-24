import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getDatabase, Database } from "firebase/database";
import { FirebaseConfigStatus } from "./types";

// Expected Firebase environment variables
const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const envAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const envDatabaseURL = import.meta.env.VITE_FIREBASE_DATABASE_URL;
const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const envStorageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const envMessagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const envAppId = import.meta.env.VITE_FIREBASE_APP_ID;

export function checkFirebaseConfig(): FirebaseConfigStatus {
  const missing: string[] = [];
  if (!envApiKey) missing.push("VITE_FIREBASE_API_KEY");
  if (!envAuthDomain) missing.push("VITE_FIREBASE_AUTH_DOMAIN");
  if (!envDatabaseURL) missing.push("VITE_FIREBASE_DATABASE_URL");
  if (!envProjectId) missing.push("VITE_FIREBASE_PROJECT_ID");
  if (!envStorageBucket) missing.push("VITE_FIREBASE_STORAGE_BUCKET");
  if (!envMessagingSenderId) missing.push("VITE_FIREBASE_MESSAGING_SENDER_ID");
  if (!envAppId) missing.push("VITE_FIREBASE_APP_ID");

  return {
    isConfigured: missing.length === 0,
    missingVars: missing,
  };
}

export const firebaseStatus = checkFirebaseConfig();

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let rtdb: Database | null = null;
export const googleProvider = new GoogleAuthProvider();

if (firebaseStatus.isConfigured) {
  try {
    const firebaseConfig = {
      apiKey: envApiKey,
      authDomain: envAuthDomain,
      databaseURL: envDatabaseURL,
      projectId: envProjectId,
      storageBucket: envStorageBucket,
      messagingSenderId: envMessagingSenderId,
      appId: envAppId,
    };

    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    auth = getAuth(app);
    db = getFirestore(app);
    rtdb = getDatabase(app);
    console.log("Firebase initialized successfully from environment variables.");
  } catch (error) {
    console.error("Error initializing Firebase from environment variables:", error);
  }
} else {
  console.warn("Firebase environment variables are incomplete or missing:", firebaseStatus.missingVars);
}

export { app, auth, db, rtdb };
