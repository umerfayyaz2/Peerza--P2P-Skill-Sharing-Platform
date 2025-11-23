// src/components/chat/CalendarModal.jsx
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { submitMeeting } from "../../utils/chat"; // adjust path if needed
import useChat from "../../context/useChat";

function CalendarModal({ isOpen, onClose, guest }) {
  const { djangoUser } = useChat(); // current user
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !topic) {
      alert("Pick a start date and topic");
      return;
    }
    setLoading(true);
    try {
      const startISO = startDate.toISOString();
      const endISO = endDate ? endDate.toISOString() : null;
      // host = current user
      await submitMeeting(djangoUser.id, guest.id, startISO, endISO, topic);
      alert("Meeting requested — a system message was posted into the chat.");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Could not create meeting. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <h3 className="text-lg font-bold mb-2">
          Schedule Meeting with {guest.username}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Topic</label>
            <input
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="Eg. Python tutoring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Start</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              showTimeSelect
              timeIntervals={15}
              dateFormat="Pp"
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              End (optional)
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              showTimeSelect
              timeIntervals={15}
              dateFormat="Pp"
              className="w-full border px-3 py-2 rounded"
              minDate={startDate}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-indigo-600 text-white"
              disabled={loading}
            >
              {loading ? "Requesting..." : "Request Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CalendarModal;
