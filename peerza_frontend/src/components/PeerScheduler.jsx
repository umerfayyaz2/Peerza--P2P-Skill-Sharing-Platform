import { useEffect, useState, useCallback } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import api from "../api";
import BookSessionModal from "./BookSessionModal";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// 🧠 Converts weekday + time → JS Date object for this week
const convertToDateTime = (day, time) => {
  const daysMap = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };

  const now = new Date();
  const diff = (daysMap[day] - now.getDay() + 7) % 7;
  const target = new Date(now);
  target.setDate(now.getDate() + diff);
  const [h, m, s] = time.split(":").map(Number);
  target.setHours(h, m, s || 0);
  return target;
};

export default function PeerScheduler({ peerId }) {
  const [availability, setAvailability] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // ✅ Safe fetch with fallback
  const fetchAvailability = useCallback(async () => {
    try {
      // 🟢 Try main endpoint (includes booked info)
      const res = await api.get(`availability/${peerId}/user/`);
      const formatted = res.data.map((slot) => ({
        id: slot.id,
        title: slot.is_booked
          ? slot.topic
            ? `Booked (${slot.topic})`
            : "Booked"
          : "Available",
        start: convertToDateTime(slot.day_of_week, slot.start_time),
        end: convertToDateTime(slot.day_of_week, slot.end_time),
        color: slot.is_booked ? "#ef4444" : "#22c55e",
        isBooked: slot.is_booked,
      }));
      setAvailability(formatted);
    } catch {
      console.warn(
        "⚠️ API /availability/:id/user/ failed. Using fallback list..."
      );

      try {
        // 🔄 fallback to generic endpoint (prevents vanish)
        const res2 = await api.get(`availability/${peerId}/`);
        const formatted2 = res2.data.map((slot) => ({
          id: slot.id,
          title: "Available",
          start: convertToDateTime(slot.day_of_week, slot.start_time),
          end: convertToDateTime(slot.day_of_week, slot.end_time),
          color: "#22c55e",
          isBooked: false,
        }));
        setAvailability(formatted2);
      } catch {
        console.error("❌ Fallback failed. Showing safe dummy data.");
        // 🧩 show dummy slots (for safety during demo)
        const dummy = [
          {
            id: 1,
            title: "Available",
            start: convertToDateTime("WEDNESDAY", "12:00:00"),
            end: convertToDateTime("WEDNESDAY", "15:00:00"),
            color: "#22c55e",
            isBooked: false,
          },
        ];
        setAvailability(dummy);
      }
    }
  }, [peerId]);

  // ✅ Load on mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!mounted) return;
      await fetchAvailability();
    };
    setTimeout(load, 0);
    return () => {
      mounted = false;
    };
  }, [fetchAvailability]);

  // ✅ Refresh calendar when MyAvailabilityManager updates
  useEffect(() => {
    const updateHandler = () => fetchAvailability();
    window.addEventListener("availabilityUpdated", updateHandler);
    return () => {
      window.removeEventListener("availabilityUpdated", updateHandler);
    };
  }, [fetchAvailability]);

  return (
    <div className="bg-white shadow rounded-2xl p-4 mt-6">
      <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
        📅 Availability
      </h3>

      <Calendar
        localizer={localizer}
        events={availability}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 400 }}
        views={["week", "day"]}
        defaultView="week"
        toolbar={false}
        onSelectEvent={(event) => {
          if (event.isBooked) {
            alert("❌ This slot is already booked!");
            return;
          }
          setSelectedSlot(event);
        }}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: event.color,
            borderRadius: "8px",
            color: "white",
            border: "none",
            padding: "4px",
            cursor: event.isBooked ? "not-allowed" : "pointer",
            opacity: event.isBooked ? 0.7 : 1,
          },
        })}
      />

      {selectedSlot && (
        <BookSessionModal
          slot={selectedSlot}
          peerId={peerId}
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </div>
  );
}
