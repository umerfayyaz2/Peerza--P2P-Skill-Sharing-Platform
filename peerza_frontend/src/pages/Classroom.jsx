import { useParams, useNavigate } from "react-router-dom";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { useState, useEffect } from "react";
import api from "../api";

function Classroom() {
  const { peerId } = useParams(); // The ID of the person we are calling
  const navigate = useNavigate();
  const [myProfile, setMyProfile] = useState(null);

  useEffect(() => {
    // Fetch my own ID so we can generate a unique room name
    api
      .get("profile/")
      .then((res) => setMyProfile(res.data))
      .catch((err) => alert(err));
  }, []);

  if (!myProfile)
    return <div className="text-center mt-20">Loading Classroom...</div>;

  // LOGIC: Create a consistent Room Name based on both IDs
  // We sort the IDs so "1 calling 5" and "5 calling 1" produce the SAME room name.
  const ids = [myProfile.id, parseInt(peerId)].sort((a, b) => a - b);
  const roomName = `Peerza-Class-${ids[0]}-${ids[1]}`;

  return (
    <div className="h-screen w-screen bg-gray-900 flex flex-col">
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Peerza Classroom 🎓</h1>
        <button
          onClick={() => navigate("/")}
          className="bg-red-500 px-4 py-1 rounded hover:bg-red-600 text-sm"
        >
          Leave Class
        </button>
      </div>

      <div className="flex-1">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={roomName}
          configOverwrite={{
            startWithAudioMuted: true,
            disableThirdPartyRequests: true,
            prejoinPageEnabled: false,
          }}
          interfaceConfigOverwrite={{
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "closedcaptions",
              "desktop",
              "fullscreen",
              "fodeviceselection",
              "hangup",
              "profile",
              "chat",
              "recording",
              "livestreaming",
              "etherpad",
              "sharedvideo",
              "settings",
              "raisehand",
              "videoquality",
              "filmstrip",
              "feedback",
              "stats",
              "shortcuts",
              "tileview",
              "videobackgroundblur",
              "download",
              "help",
              "mute-everyone",
              "security",
            ],
          }}
          userInfo={{
            displayName: myProfile.username,
          }}
          onApiReady={() => {
            // Here you can attach custom event listeners
          }}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = "100%";
          }}
        />
      </div>
    </div>
  );
}

export default Classroom;
