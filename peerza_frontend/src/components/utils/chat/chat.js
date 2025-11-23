// ======================================================
// 🔥 Utility: Generate a deterministic 1–on–1 Room ID
// ======================================================
export function roomIdForPair(aId, bId) {
  const a = Number(aId);
  const b = Number(bId);

  const [minId, maxId] = a < b ? [a, b] : [b, a];

  return `chat_${minId}_${maxId}`;
}

// ======================================================
// 🔥 Post system messages to a chat room
// Used for meeting requests, accept/decline notifications
// ======================================================
import { db } from "../../firebaseConfig";
import { ref, push, set } from "firebase/database";

/**
 * Pushes a system message into a Firebase chat room.
 * System messages are displayed in chat but not attributed to any user.
 */
export async function postSystemMessageToRoom(roomId, messageText) {
  const sysRef = push(ref(db, `chats/${roomId}/messages`));

  await set(sysRef, {
    system: true,
    text: messageText,
    created_at: Date.now(),
  });
}

// ======================================================
// 🔥 Submit a meeting → integrate with chat automatically
// ======================================================
import api from "../../api";

/**
 * Creates a meeting via Django API
 * and posts a system-notification message in the chat.
 */
export async function submitMeeting(guestId, startDateISO, endDateISO, topic) {
  // A) Call Django backend to create the meeting
  const response = await api.post("/meetings/request/", {
    guest_id: guestId,
    start_datetime: startDateISO,
    end_datetime: endDateISO,
    topic: topic,
  });

  const meeting = response.data;

  // B) Generate chat room ID
  const roomId = roomIdForPair(meeting.host.id, meeting.guest.id);

  // C) Post a system message in the chat room
  await postSystemMessageToRoom(
    roomId,
    `📅 Meeting requested: "${topic}" on ${startDateISO}`
  );

  return meeting;
}
