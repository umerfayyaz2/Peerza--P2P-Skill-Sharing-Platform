import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import api from "../api";
import BookSessionModal from "./BookSessionModal";

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
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await api.get(`availability/${peerId}/`);

        // Map backend weekday strings to actual dates in the current week
        const dayMap = {
          SUNDAY: 0,
          MONDAY: 1,
          TUESDAY: 2,
          WEDNESDAY: 3,
          THURSDAY: 4,
          FRIDAY: 5,
          SATURDAY: 6,
        };

        const today = new Date();
        const currentWeekStart = new Date(
          today.setDate(today.getDate() - today.getDay())
        ); // start from this week's Sunday

        const formatted = res.data.map((slot) => {
          const eventDate = new Date(currentWeekStart);
          eventDate.setDate(
            currentWeekStart.getDate() + dayMap[slot.day_of_week]
          );

          const [startHour, startMin] = slot.start_time.split(":").map(Number);
          const [endHour, endMin] = slot.end_time.split(":").map(Number);

          const start = new Date(eventDate);
          start.setHours(startHour, startMin, 0);

          const end = new Date(eventDate);
          end.setHours(endHour, endMin, 0);

          return {
            title: "Available",
            start,
            end,
          };
        });

        setSlots(formatted);
      } catch (err) {
        console.error("Failed to fetch availability:", err);
      }
    };

    fetchAvailability();
  }, [peerId]);

  return (
    <div className="bg-white shadow rounded-2xl p-4 mt-6">
      <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
        📅 Availability
      </h3>

      <Calendar
        localizer={localizer}
        events={slots}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 400 }}
        views={["week", "day"]}
        defaultView="week"
        toolbar={false}
        onSelectEvent={(event) => setSelectedSlot(event)} // ✅ clickable event
        eventPropGetter={() => ({
          style: {
            backgroundColor: "#22c55e",
            borderRadius: "8px",
            color: "white",
            border: "none",
            padding: "4px",
            cursor: "pointer",
          },
        })}
      />

      {/* Modal appears when a slot is clicked */}
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
