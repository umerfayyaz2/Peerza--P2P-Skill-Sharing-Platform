import { useState, useEffect } from "react";
import { useChat } from "../../context/ChatContext";
import { database } from "../../firebaseConfig";
import { ref, onValue } from "firebase/database";
import api from "../../api"; // To get my ID
import { X, User } from "lucide-react";

function ChatList() {
  const { toggleChat, openChatWith } = useChat();
  const [recentPeers, setRecentPeers] = useState([]);
  //   const [myId, setMyId] = useState(null);

  useEffect(() => {
    api.get("profile/").then((res) => {
      const myId = res.data.id; // local variable, not React state
      const convRef = ref(database, `users/${myId}/conversations`);
      onValue(convRef, (snapshot) => {
        const data = snapshot.val();
        const loaded = [];
        if (data) {
          for (const key in data) {
            loaded.push({ id: key, ...data[key] });
          }
          setRecentPeers(loaded);
        }
      });
    });
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="bg-indigo-600 p-4 flex justify-between items-center text-white shadow-md">
        <h3 className="font-bold">Messages</h3>
        <button onClick={toggleChat}>
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 p-2">
        {recentPeers.length === 0 && (
          <p className="text-center text-gray-400 mt-10 text-sm">
            No conversations yet.
          </p>
        )}
        {recentPeers.map((peer) => (
          <div
            key={peer.id}
            onClick={() => openChatWith(peer)}
            className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition border-b border-gray-100"
          >
            {/* Profile circle with online indicator */}
            <div className="relative w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              {peer.username?.charAt(0).toUpperCase() || <User size={18} />}
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  peer.is_online ? "bg-green-500" : "bg-gray-400"
                }`}
              ></span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="truncate font-semibold text-gray-800 text-sm">
                {peer.username}
              </p>
              <p className="text-xs text-gray-500 truncate w-40">
                {peer.lastMessage || "Start a chat"}
              </p>
            </div>

            {/* Unread message badge */}
            {peer.unread_count > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-bold rounded-full px-2 py-[1px]">
                {peer.unread_count > 9 ? "9+" : peer.unread_count}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatList;
