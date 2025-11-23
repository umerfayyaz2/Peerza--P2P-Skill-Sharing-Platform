import { useState, useEffect, useRef } from "react";
import useChat from "../../../context/useChat";
import { database } from "../../../firebaseConfig";
import { ref, push, onValue, serverTimestamp, set } from "firebase/database";
import api from "../../../api";
import { Send, ArrowLeft, Calendar } from "lucide-react";
import { roomIdForPair } from "../../../utils/chat";

function ChatWindow() {
  const { activeChatPeer, setActiveChatPeer } = useChat();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [myProfile, setMyProfile] = useState(null);
  const [isPeerOnline, setIsPeerOnline] = useState(false);

  const messagesEndRef = useRef(null);

  // ----------------------------------------
  // FETCH PROFILE ONCE
  // ----------------------------------------
  useEffect(() => {
    api.get("profile/").then((res) => setMyProfile(res.data));
  }, []);

  // compute room id safely
  const roomId =
    myProfile && activeChatPeer
      ? roomIdForPair(myProfile.id, activeChatPeer.id)
      : null;

  // ----------------------------------------
  // MAIN EFFECT: MESSAGES + PRESENCE LISTENERS
  // ----------------------------------------
  useEffect(() => {
    if (!roomId || !activeChatPeer) return;

    const chatRef = ref(database, `chats/${roomId}/messages`);
    const presenceRef = ref(database, `status/${activeChatPeer.id}`);

    const unsubMsg = onValue(chatRef, (snapshot) => {
      const data = snapshot.val() || {};
      const loaded = Object.entries(data).map(([key, msg]) => ({
        id: key,
        ...msg,
      }));
      setMessages(loaded);
    });

    const unsubPresence = onValue(presenceRef, (snapshot) => {
      const val = snapshot.val();
      setIsPeerOnline(val?.online === true || val === "online");
    });

    // CLEANUP — React-safe: clears messages ONLY during unmount or peer switch
    return () => {
      unsubMsg();
      unsubPresence();
      setMessages([]); // SAFE HERE — cleanup is allowed to use setState
    };
  }, [roomId, activeChatPeer]);

  // ----------------------------------------
  // AUTO SCROLL
  // ----------------------------------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ----------------------------------------
  // SEND MESSAGE
  // ----------------------------------------
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !myProfile) return;

    const msgData = {
      senderId: myProfile.id,
      text: newMessage,
      timestamp: serverTimestamp(),
    };

    await push(ref(database, `chats/${roomId}/messages`), msgData);

    // Update conversation lists
    await set(
      ref(database, `users/${myProfile.id}/conversations/${activeChatPeer.id}`),
      {
        id: activeChatPeer.id,
        username: activeChatPeer.username,
        lastMessage: newMessage,
        timestamp: serverTimestamp(),
      }
    );

    await set(
      ref(database, `users/${activeChatPeer.id}/conversations/${myProfile.id}`),
      {
        id: myProfile.id,
        username: myProfile.username,
        lastMessage: newMessage,
        timestamp: serverTimestamp(),
      }
    );

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-indigo-600 p-3 flex items-center justify-between text-white shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveChatPeer(null)}
            className="hover:bg-white/20 p-1 rounded"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h3 className="font-bold text-sm">{activeChatPeer.username}</h3>
            <p className="text-xs flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  isPeerOnline ? "bg-green-400" : "bg-gray-400"
                }`}
              ></span>
              {isPeerOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <button
          className="bg-white/20 p-1.5 rounded hover:bg-white/30"
          title="Schedule Meeting"
        >
          <Calendar size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.senderId === myProfile?.id;

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 text-sm rounded-2xl shadow-sm ${
                  isMe
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="p-3 border-t border-gray-200 flex gap-2"
      >
        <input
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Type a message…"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />

        <button
          type="submit"
          className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;
