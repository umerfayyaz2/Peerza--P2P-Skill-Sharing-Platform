import { useEffect, useState } from "react";
import api from "../api";

export default function Friends() {
  const [inbox, setInbox] = useState([]);
  const [friends, setFriends] = useState([]);

  // ✅ Safe async loader with proper effect cleanup
  useEffect(() => {
    let isMounted = true; // avoids setting state after unmount

    const load = async () => {
      try {
        const [i, f] = await Promise.all([
          api.get("friends/requests/"),
          api.get("friends/"),
        ]);
        if (isMounted) {
          setInbox(i.data || []);
          setFriends(f.data || []);
        }
      } catch (err) {
        console.error("Failed to load friends:", err);
      }
    };

    load();
    return () => {
      isMounted = false; // cleanup flag
    };
  }, []);

  // ✅ Respond to friend requests
  const respond = async (id, action) => {
    try {
      await api.post(`friends/request/respond/${id}/`, { action });
      const [i, f] = await Promise.all([
        api.get("friends/requests/"),
        api.get("friends/"),
      ]);
      setInbox(i.data || []);
      setFriends(f.data || []);
    } catch (err) {
      console.error("Friend respond failed:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Friend Requests</h1>

      {inbox.length === 0 && (
        <p className="text-gray-500 mb-6">No pending requests</p>
      )}

      {inbox.map((r) => (
        <div
          key={r.id}
          className="p-3 border rounded-lg flex items-center justify-between mb-2"
        >
          <div>{r.from_user?.username}</div>
          <div className="flex gap-2">
            <button
              onClick={() => respond(r.id, "ACCEPT")}
              className="px-3 py-1 bg-emerald-600 text-white rounded"
            >
              Accept
            </button>
            <button
              onClick={() => respond(r.id, "DECLINE")}
              className="px-3 py-1 bg-gray-300 rounded"
            >
              Decline
            </button>
          </div>
        </div>
      ))}

      <h2 className="text-lg font-bold mt-8 mb-3">Your Friends</h2>

      {friends.length === 0 && <p className="text-gray-500">No friends yet</p>}

      <ul className="space-y-2">
        {friends.map((f) => (
          <li
            key={f.id}
            className="p-3 border rounded-lg flex items-center justify-between"
          >
            <span>{f.friend?.username}</span>
            <button
              className="px-3 py-1 bg-pink-600 text-white rounded"
              onClick={() => window.location.assign(`/peer/${f.friend.id}`)}
            >
              View Profile
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
