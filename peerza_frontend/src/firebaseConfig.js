import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8fIOTMvJKzZjY2D-SRTQL982stfNCESc",
  authDomain: "peerza-chat.firebaseapp.com",
  // 🔴 IMPORTANT: I added this line manually. It is required for Chat.
  databaseURL: "https://peerza-chat-default-rtdb.firebaseio.com",
  projectId: "peerza-chat",
  storageBucket: "peerza-chat.firebasestorage.app",
  messagingSenderId: "1012558457708",
  appId: "1:1012558457708:web:8e347aec0349d4ea14a149",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and export it
export const database = getDatabase(app);
