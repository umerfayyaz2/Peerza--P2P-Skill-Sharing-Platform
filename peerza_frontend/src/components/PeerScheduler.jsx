import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import api from "../api";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function PeerScheduler({ peerId }) {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await api.get(`availability/${peerId}/`);
        const formatted = res.data.map((slot) => ({
          title: "Available",
          start: new Date(`2024-01-01T${slot.start_time}`),
          end: new Date(`2024-01-01T${slot.end_time}`),
        }));
        setSlots(formatted);
      } catch (err) {
        console.error("Failed to fetch availability:", err);
      }
    };
    fetchAvailability();
  }, [peerId]);

  return (
    <div className="bg-white shadow rounded-2xl p-4 mt-6">
      <h3 className="font-semibold mb-3 text-gray-800">📅 Availability</h3>
      <Calendar
        localizer={localizer}
        events={slots}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 400 }}
        views={["week", "day"]}
        defaultView="week"
        toolbar={false}
        eventPropGetter={() => ({
          style: {
            backgroundColor: "#22c55e", // green
            borderRadius: "8px",
            color: "white",
            border: "none",
            padding: "4px",
          },
        })}
      />
    </div>
  );
}
