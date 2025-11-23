// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref as dbRef,
  set as dbSet,
  onDisconnect as dbOnDisconnect,
} from "firebase/database";
import {
  getAuth,
  signInAnonymously as firebaseSignInAnonymously,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA8fIOTMvJKzZjY2D-SRTQL982stfNCESc",
  authDomain: "peerza-chat.firebaseapp.com",
  databaseURL: "https://peerza-chat-default-rtdb.firebaseio.com",
  projectId: "peerza-chat",
  storageBucket: "peerza-chat.firebasestorage.app",
  messagingSenderId: "1012558457708",
  appId: "1:1012558457708:web:8e347aec0349d4ea14a149",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Realtime DB + Auth
const database = getDatabase(app);
const auth = getAuth(app);

// Re-export the DB helper functions
export {
  app,
  database,
  auth,
  firebaseSignInAnonymously as signInAnonymously,
  dbRef as ref,
  dbSet as set,
  dbOnDisconnect as onDisconnect,
};
