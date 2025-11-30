import { useState } from "react";
import { X } from "lucide-react";
import api from "../api";

export default function BookSessionModal({ slot, peerId, onClose }) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic!");
      return;
    }
    setLoading(true);
    try {
      await api.post("meetings/", {
        topic,
        guest: peerId, // the person you're meeting with
        start_datetime: slot.start,
        end_datetime: slot.end,
      });
      alert("Meeting request sent!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to schedule meeting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[400px] shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Schedule a Session</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-2">
          Selected Slot:{" "}
          <b>
            {slot.start.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" – "}
            {slot.end.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </b>
        </p>

        <input
          type="text"
          className="w-full border rounded-lg p-2 text-sm mb-4"
          placeholder="Enter session topic..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <button
          disabled={loading}
          onClick={handleConfirm}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg"
        >
          {loading ? "Sending..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}
