import { useState, useEffect } from "react";
import api from "../api";

export default function MyAvailabilityManager() {
  const [slots, setSlots] = useState([]);
  const [day, setDay] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Fetch all slots for the logged-in user ---
  const fetchSlots = async () => {
    try {
      const res = await api.get("availability/");
      setSlots(res.data);
    } catch (err) {
      console.error("Failed to fetch slots:", err);
    }
  };

  // --- Add new availability slot ---
  const handleAdd = async () => {
    if (!day || !start || !end) {
      alert("Please fill all fields!");
      return;
    }
    setLoading(true);
    try {
      await api.post("availability/", {
        day_of_week: day,
        start_time: start,
        end_time: end,
      });
      alert("Slot added successfully!");
      setDay("");
      setStart("");
      setEnd("");
      fetchSlots();

      // 🔥 Notify the PeerScheduler to refresh
      window.dispatchEvent(new Event("availabilityUpdated"));
    } catch (err) {
      console.error("Error adding slot:", err);
      alert("Failed to add slot.");
    } finally {
      setLoading(false);
    }
  };

  // --- Delete an availability slot ---
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this slot?")) return;
    try {
      await api.delete(`availability/${id}/`);
      alert("Slot deleted!");
      fetchSlots();

      // 🔥 Notify the PeerScheduler to refresh
      window.dispatchEvent(new Event("availabilityUpdated"));
    } catch (err) {
      console.error("Failed to delete slot:", err);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-6">
      <h2 className="font-semibold text-lg mb-3">🗓️ My Availability Slots</h2>

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select Day</option>
          {[
            "MONDAY",
            "TUESDAY",
            "WEDNESDAY",
            "THURSDAY",
            "FRIDAY",
            "SATURDAY",
            "SUNDAY",
          ].map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <input
          type="time"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="time"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          onClick={handleAdd}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
        >
          {loading ? "Adding..." : "Add Slot"}
        </button>
      </div>

      {slots.length === 0 ? (
        <p className="text-gray-500 text-sm">No slots added yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Day</th>
              <th>Start</th>
              <th>End</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <tr key={slot.id} className="border-b">
                <td className="py-2">{slot.day_of_week}</td>
                <td>{slot.start_time}</td>
                <td>{slot.end_time}</td>
                <td>
                  <button
                    onClick={() => handleDelete(slot.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
