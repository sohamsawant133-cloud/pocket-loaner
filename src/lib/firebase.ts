import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import firebaseConfig from "../../firebase-applet-config.json";

export const IS_DUMMY_MODE = 
  firebaseConfig.apiKey === "YOUR_API_KEY" || 
  !firebaseConfig.apiKey || 
  firebaseConfig.apiKey.includes("YOUR_");

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
