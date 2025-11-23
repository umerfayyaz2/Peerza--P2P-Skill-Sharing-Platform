import { useEffect, useState, useRef, useCallback } from "react";
import api from "../api";

export default function NotificationsBell() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [wiggle, setWiggle] = useState(false);
  const dropdownRef = useRef(null);
  const prevCount = useRef(0);

  // --- Load notifications ---
  const load = useCallback(async () => {
    try {
      const res = await api.get("notifications/");
      const data = Array.isArray(res.data) ? res.data : [];

      if (data.length > prevCount.current) {
        setWiggle(true);
        setTimeout(() => setWiggle(false), 800);
      }
      prevCount.current = data.length;

      setItems(data);
      setCount(data.length);
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  }, []);

  // --- Safe polling loop ---
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isMounted) await load();
    };

    // initial fetch
    fetchData();

    // periodic refresh
    const t = setInterval(fetchData, 8000);

    return () => {
      isMounted = false;
      clearInterval(t);
    };
  }, [load]);

  // --- Close dropdown when clicking outside ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // --- Mark notification read ---
  const markRead = async (id) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    setCount((c) => Math.max(0, c - 1));
    try {
      await api.post(`notifications/mark-read/${id}/`);
    } catch (err) {
      console.error("markRead failed:", err);
    }
  };

  // --- Accept/Decline Friend Request ---
  const respondFriend = async (notif, action) => {
    const reqId = notif?.data?.request_id;
    if (!reqId) return;

    setItems((prev) => prev.filter((n) => n.id !== notif.id));
    setCount((c) => Math.max(0, c - 1));

    try {
      await api.post(`friends/request/respond/${reqId}/`, { action });
      await api.post(`notifications/mark-read/${notif.id}/`);
    } catch (err) {
      console.error("respondFriend failed:", err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`relative rounded-full p-2 hover:bg-gray-100 transition ${
          wiggle ? "animate-[wiggle_0.8s_ease]" : ""
        }`}
        title="Notifications"
      >
        <span className="text-xl">🔔</span>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl border rounded-lg overflow-hidden z-[2000]">
          <div className="p-3 border-b text-sm font-semibold bg-gray-50">
            Notifications
          </div>

          <div className="max-h-72 overflow-y-auto">
            {items.length === 0 && (
              <p className="text-center text-gray-500 p-4 text-sm">
                No notifications
              </p>
            )}

            {items.map((n) => (
              <div
                key={n.id}
                className="px-3 py-2 border-b text-sm hover:bg-gray-50 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className="font-medium">{n.actor?.username}</span>{" "}
                    {n.type === "FRIEND_REQUEST" &&
                      "sent you a friend request 💌"}
                    {n.type === "FRIEND_ACCEPTED" &&
                      "accepted your friend request ✅"}
                    {n.type === "FRIEND_DECLINED" &&
                      "declined your friend request ❌"}
                  </div>

                  {n.type !== "FRIEND_REQUEST" && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                </div>

                {n.type === "FRIEND_REQUEST" && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => respondFriend(n, "ACCEPT")}
                      className="px-3 py-1 rounded bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => respondFriend(n, "DECLINE")}
                      className="px-3 py-1 rounded bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wiggle Animation */}
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(-12deg); }
          30% { transform: rotate(12deg); }
          45% { transform: rotate(-8deg); }
          60% { transform: rotate(8deg); }
          75% { transform: rotate(-4deg); }
          90% { transform: rotate(4deg); }
        }
      `}</style>
    </div>
  );
}
