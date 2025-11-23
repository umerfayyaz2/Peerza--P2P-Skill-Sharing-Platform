import { useState, useEffect, useRef } from "react";
import { database } from "../firebaseConfig";
import { ref, push, onValue, serverTimestamp } from "firebase/database";
import api from "../api";
import { MessageCircle, X, Send, User } from "lucide-react";

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("Guest");
  const messagesEndRef = useRef(null);

  // 1. Get Current User Info from Django
  useEffect(() => {
    if (isOpen) {
      api
        .get("profile/")
        .then((res) => setUsername(res.data.username))
        .catch((err) => console.error("Error fetching profile:", err));
    }
  }, [isOpen]);

  // 2. Listen for Messages (Real-time!)
  useEffect(() => {
    if (!isOpen) return;

    // For MVP Test: We connect everyone to a "global" room first
    const chatRef = ref(database, "community_chat");

    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      const loadedMessages = [];
      if (data) {
        for (const key in data) {
          loadedMessages.push({ id: key, ...data[key] });
        }
        setMessages(loadedMessages);
      }
    });

    return () => unsubscribe();
  }, [isOpen]);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Send Message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const chatRef = ref(database, "community_chat");
    push(chatRef, {
      user: username,
      text: newMessage,
      createdAt: serverTimestamp(),
    });

    setNewMessage("");
  };

  // --- RENDER ---

  // 1. Closed State (The Floating Button)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 z-50 flex items-center gap-2"
      >
        <MessageCircle size={28} />
        <span className="font-bold hidden md:inline">Community Chat</span>
      </button>
    );
  }

  // 2. Open State (The Window)
  return (
    <div className="fixed bottom-4 right-4 w-80 md:w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden font-sans animate-fade-in-up">
      {/* Header */}
      <div className="bg-indigo-600 p-4 flex justify-between items-center text-white shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-full">
            <User size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm">Peerza Community</h3>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span className="text-xs text-indigo-100">Live</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-indigo-100 hover:text-white hover:bg-white/10 rounded-full p-1 transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10 text-sm">
            <p>No messages yet.</p>
            <p>Say hello! 👋</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 flex ${
              msg.user === username ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                msg.user === username
                  ? "bg-indigo-600 text-white rounded-br-none"
                  : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
              }`}
            >
              {msg.user !== username && (
                <p className="text-xs font-bold text-indigo-600 mb-1">
                  {msg.user}
                </p>
              )}
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={sendMessage}
        className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 border-0 text-gray-800 text-sm rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white p-2.5 rounded-full hover:bg-indigo-700 transition shadow-md disabled:opacity-50"
          disabled={!newMessage.trim()}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

export default ChatWidget;
