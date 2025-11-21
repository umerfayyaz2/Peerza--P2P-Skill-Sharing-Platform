import { useState, useEffect, useRef } from "react";
import api from "../api";
import { MessageCircle, X, Send, User } from "lucide-react";

function ChatWidget() {
  // --- 1. STATE ---
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [recentPeers, setRecentPeers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [myId, setMyId] = useState(null);

  const messagesEndRef = useRef(null);

  // --- 2. FUNCTIONS (Moved UP to fix the error) ---

  const fetchRecentChats = () => {
    api
      .get("chats/recent/")
      .then((res) => setRecentPeers(res.data))
      .catch((err) => console.error("Failed to load chats", err));
  };

  const fetchMessages = (peerId) => {
    api
      .get(`messages/?peer_id=${peerId}`)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Failed to load messages", err));
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const tempMsg = {
      id: Date.now(),
      sender: myId,
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    // Optimistic Update (Show message immediately)
    setMessages([...messages, tempMsg]);
    setNewMessage("");

    api
      .post("messages/", { receiver: activeChat.id, content: newMessage })
      .then(() => fetchMessages(activeChat.id))
      .catch(() => alert("Failed to send"));
  };

  // --- 3. EFFECTS (Now they can see the functions above) ---

  // On Load: Get My ID and Recent Chats
  useEffect(() => {
    if (isOpen) {
      api
        .get("profile/")
        .then((res) => {
          if (res.data && res.data.id) {
            setMyId(res.data.id);
          }
        })
        .catch((err) => console.error("Error fetching profile:", err));

      fetchRecentChats(); // Works now because function is defined above!
    }
  }, [isOpen]);

  // Poll for messages if a chat is open (Every 3 seconds)
  useEffect(() => {
    let interval;
    if (activeChat) {
      fetchMessages(activeChat.id);
      interval = setInterval(() => fetchMessages(activeChat.id), 3000);
    }
    return () => clearInterval(interval);
  }, [activeChat]);

  // Scroll to bottom automatically
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- 4. RENDER ---

  // CLOSED STATE (Floating Button)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 z-50 flex items-center gap-2"
      >
        <MessageCircle size={28} />
        <span className="font-bold hidden md:inline">Messages</span>
      </button>
    );
  }

  // OPEN STATE (Window)
  return (
    <div className="fixed bottom-4 right-4 w-80 md:w-96 h-[500px] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-indigo-600 p-4 flex justify-between items-center text-white shadow-md">
        <h3 className="font-bold text-lg flex items-center gap-2">
          {activeChat ? (
            <>
              <button
                onClick={() => setActiveChat(null)}
                className="hover:underline text-sm mr-2 flex items-center"
              >
                ← Back
              </button>
              <span className="truncate max-w-[150px]">
                {activeChat.username}
              </span>
              {activeChat.is_online && (
                <span
                  className="w-2 h-2 bg-green-400 rounded-full"
                  title="Online"
                ></span>
              )}
            </>
          ) : (
            "Recent Chats"
          )}
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:text-indigo-200 transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800">
        {!activeChat ? (
          // LIST VIEW: Recent Conversations
          <div className="p-2">
            {recentPeers.length === 0 && (
              <div className="text-center text-gray-500 mt-10 text-sm flex flex-col items-center">
                <MessageCircle size={40} className="mb-2 opacity-20" />
                <p>No conversations yet.</p>
              </div>
            )}
            {recentPeers.map((peer) => (
              <div
                key={peer.id}
                onClick={() => setActiveChat(peer)}
                className="flex items-center gap-3 p-3 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                {peer.avatar ? (
                  <img
                    src={peer.avatar}
                    className="w-10 h-10 rounded-full object-cover border border-gray-300"
                    alt={peer.username}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold border border-indigo-200">
                    {peer.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold text-gray-800 dark:text-white text-sm">
                    {peer.username}
                  </p>
                  <p className="text-xs text-gray-500">Tap to chat</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // CHAT VIEW: Messages
          <div className="p-4 space-y-3">
            {messages.map((msg, idx) => {
              const isMe = msg.sender === myId;
              return (
                <div
                  key={idx}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                      isMe
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none border border-gray-200 dark:border-gray-600"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area (Only visible when chatting) */}
      {activeChat && (
        <form
          onSubmit={sendMessage}
          className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex gap-2"
        >
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white p-2.5 rounded-full hover:bg-indigo-700 transition shadow-md flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
      )}
    </div>
  );
}

export default ChatWidget;
