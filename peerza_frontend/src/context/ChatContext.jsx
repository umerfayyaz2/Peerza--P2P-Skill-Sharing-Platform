import { createContext, useState, useEffect, useCallback } from "react";

import api from "../api";
import { auth, db } from "../firebaseConfig";
import { ref, set, onDisconnect } from "firebase/database";

const ChatContext = createContext();
export default ChatContext;

// ======================================================
//  PRESENCE HELPER
// ======================================================
function setPresence(firebaseUid, djangoUserId) {
  const presenceRef = ref(db, `status/${djangoUserId}`);

  set(presenceRef, {
    firebase_uid: firebaseUid,
    online: true,
    last_active: Date.now(),
  });

  onDisconnect(presenceRef).set({
    firebase_uid: firebaseUid,
    online: false,
    last_active: Date.now(),
  });
}

// ======================================================
//  CHAT PROVIDER
// ======================================================
export function ChatProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChatPeer, setActiveChatPeer] = useState(null);
  const [firebaseUid, setFirebaseUid] = useState(null);
  const [djangoUser, setDjangoUser] = useState(null);

  // Load Django user
  useEffect(() => {
    api.get("profile/").then((res) => setDjangoUser(res.data));
  }, []);

  // Firebase auth listener
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) setFirebaseUid(user.uid);
    });
    return () => unsub();
  }, []);

  // Activate presence
  useEffect(() => {
    if (firebaseUid && djangoUser?.id) {
      setPresence(firebaseUid, djangoUser.id);
    }
  }, [firebaseUid, djangoUser]);

  // Actions
  const openChatWith = useCallback((peer) => {
    setIsOpen(true);
    setActiveChatPeer(peer);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setActiveChatPeer(null);
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        activeChatPeer,
        openChatWith,
        closeChat,
        toggleChat,
        setActiveChatPeer,
        firebaseUid,
        djangoUser,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
