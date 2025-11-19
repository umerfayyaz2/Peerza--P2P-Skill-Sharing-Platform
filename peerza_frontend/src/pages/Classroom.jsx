import { useParams, useNavigate } from "react-router-dom";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { useState, useEffect } from "react";
import api from "../api";

function Classroom() {
  const { peerId } = useParams();
  const navigate = useNavigate();
  const [myProfile, setMyProfile] = useState(null);

  useEffect(() => {
    api
      .get("profile/")
      .then((res) => setMyProfile(res.data))
      .catch(() => alert("Failed to load profile"));
  }, []);

  if (!myProfile)
    return <div className="text-center mt-20">Loading Classroom...</div>;

  // Sort IDs to ensure both users join the exact same room
  const ids = [myProfile.id, parseInt(peerId)].sort((a, b) => a - b);
  const roomName = `Peerza-Class-${ids[0]}-${ids[1]}`;

  return (
    <div className="h-screen w-screen bg-gray-900 flex flex-col">
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-md z-10">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span>🎓</span> Peerza Classroom
        </h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition"
        >
          Leave Class
        </button>
      </div>

      <div className="flex-1 relative">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={roomName}
          configOverwrite={{
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableThirdPartyRequests: true,
            prejoinPageEnabled: false,
            enableWelcomePage: false,
            enableClosePage: false,
            disable1On1Mode: false,
            fileRecordingsEnabled: false,
            liveStreamingEnabled: false,
            // Critical flags to disable lobby
            lobbyModeEnabled: false,
            securityOptionsEnabled: false,
            remoteVideoMenu: {
              disableKick: true,
            },
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
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DEFAULT_BACKGROUND: "#111827",
          }}
          userInfo={{
            displayName: myProfile.username,
            email: myProfile.email, // Adding email sometimes helps Jitsi identify unique users
          }}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = "100%";
            iframeRef.style.border = "none";
          }}
        />
      </div>
    </div>
  );
}

export default Classroom;
