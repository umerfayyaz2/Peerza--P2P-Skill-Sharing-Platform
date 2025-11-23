import { useEffect, useState } from "react";
import api from "../api";

export default function PeerChatWidget() {
  const [open, setOpen] = useState(false);
  const [convos, setConvos] = useState([]);
  const [activePeer, setActivePeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");

  // Poll conversations every 5 seconds
  useEffect(() => {
    let timer;

    const load = async () => {
      try {
        const res = await api.get("chats/");
        setConvos(res.data || []);
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        timer = setTimeout(load, 5000);
      }
    };

    load();
    return () => clearTimeout(timer);
  }, []);

  const openChat = async (peer) => {
    setActivePeer(peer);
    setOpen(true);
    try {
      const res = await api.get(`chats/${peer.id}/messages/`);
      setMessages(res.data || []);
      await api.post(`chats/${peer.id}/read/`);
      const conv = await api.get("chats/");
      setConvos(conv.data || []);
    } catch (e) {
      console.error("load chat failed", e);
    }
  };

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || !activePeer) return;
    setDraft("");
    try {
      const res = await api.post(`chats/${activePeer.id}/send/`, {
        content: text,
      });
      setMessages((prev) => [...prev, res.data]);
    } catch (e) {
      console.error("send failed", e);
    }
  };

  const totalUnread = convos.reduce((s, c) => s + (c.unread_count || 0), 0);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((x) => !x)}
        className="fixed bottom-24 right-5 rounded-full bg-pink-600 text-white w-14 h-14 flex items-center justify-center text-2xl shadow-lg z-[1000]"
      >
        💌
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </button>

      {/* Drawer (anchored below navbar) */}
      {open && (
        <div
          className="fixed right-5 w-[320px] bg-white rounded-2xl shadow-2xl border overflow-hidden z-[1000]"
          style={{ top: 88 }} // Adjust based on navbar height
        >
          <div className="flex h-96">
            {/* Conversation list */}
            <div className="w-36 border-r overflow-y-auto">
              {convos.length === 0 && (
                <div className="p-4 text-xs text-gray-400">No chats yet</div>
              )}
              {convos.map(({ peer, unread_count }) => (
                <button
                  key={peer.id}
                  onClick={() => openChat(peer)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 text-sm"
                >
                  <span>{peer.username}</span>
                  {unread_count > 0 && (
                    <span className="bg-red-500 text-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center">
                      {unread_count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 flex flex-col">
              <div className="px-3 py-2 border-b text-sm font-bold bg-gray-50">
                {activePeer ? activePeer.username : "Chat"}
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                      m.sender?.id === activePeer?.id
                        ? "bg-gray-200 text-gray-800 self-start"
                        : "bg-pink-600 text-white self-end ml-auto"
                    }`}
                  >
                    {m.content}
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="text-xs text-gray-400">No messages yet</div>
                )}
              </div>

              <div className="p-2 border-t flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type..."
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-400 outline-none"
                />
                <button
                  onClick={sendMessage}
                  className="bg-pink-600 text-white px-3 py-2 rounded-lg text-sm font-bold"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
