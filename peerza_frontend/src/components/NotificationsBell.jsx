import { useEffect, useState, useRef, useCallback } from "react";
import api from "../api";

export default function NotificationsBell() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Safe fetch handler wrapped with useCallback
  const load = useCallback(async () => {
    try {
      const res = await api.get("notifications/");
      const arr = Array.isArray(res.data) ? res.data : [];
      // Only update state if component is still mounted
      setItems(arr);
      setCount(arr.length);
    } catch (err) {
      console.error("Notification load error:", err);
    }
  }, []);

  // ✅ Effect with safe cleanup and interval polling
  useEffect(() => {
    let isMounted = true;

    const fetchNotifications = async () => {
      if (!isMounted) return;
      await load();
    };

    fetchNotifications(); // initial load
    const timer = setInterval(fetchNotifications, 8000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [load]);

  // ✅ Handle outside click for dropdown close
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-full p-2 hover:bg-gray-100 transition"
      >
        <span className="text-xl">🔔</span>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white shadow-xl border rounded-lg overflow-hidden z-[2000]">
          <div className="p-3 border-b text-sm font-semibold bg-gray-50">
            Notifications
          </div>
          <div className="max-h-64 overflow-y-auto">
            {items.length === 0 && (
              <p className="text-center text-gray-500 p-4 text-sm">
                No notifications yet
              </p>
            )}
            {items.map((n) => (
              <div
                key={n.id}
                className="px-3 py-2 border-b text-sm hover:bg-gray-50 transition"
              >
                <span className="font-medium">{n.actor?.username}</span>{" "}
                {n.type === "FRIEND_REQUEST" && "sent you a friend request 💌"}
                {n.type === "FRIEND_ACCEPTED" &&
                  "accepted your friend request ✅"}
                {n.type === "FRIEND_DECLINED" &&
                  "declined your friend request ❌"}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
