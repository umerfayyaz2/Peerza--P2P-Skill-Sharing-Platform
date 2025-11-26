import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import PeerScheduler from "../components/PeerScheduler";

function PeerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [peer, setPeer] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await api.get(`users/${id}/`, {
          signal: controller.signal,
        });

        // Match backend shape { user: {...}, skills: [...] }
        setPeer(res.data?.user || null);
        setSkills(res.data?.skills || []);
      } catch (err) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
          return;
        }

        const status = err?.response?.status;
        if (status === 401) {
          alert("Your session expired. Please log in again.");
          navigate("/login");
        } else if (status === 404) {
          alert("That profile does not exist.");
          navigate("/dashboard");
        } else {
          console.error("PeerProfile load error:", err);
          alert("Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="w-full flex justify-center mt-20">
        <div className="animate-pulse text-gray-500">Loading Profile…</div>
      </div>
    );
  }

  if (!peer) {
    return (
      <div className="w-full flex flex-col items-center mt-16">
        <p className="text-gray-600 mb-4">No profile data available.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  const teaching = skills.filter((s) => s.skill_type === "TEACH");
  const learning = skills.filter((s) => s.skill_type === "LEARN");

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-indigo-50 text-center">
        <div className="w-24 h-24 bg-indigo-100 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-indigo-600 mb-4">
          {(peer.username || "?").charAt(0).toUpperCase()}
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {peer.username}
        </h1>
        <p className="text-gray-500 max-w-md mx-auto">
          {peer.bio || "This user hasn't written a bio yet."}
        </p>

        {/* ✅ Updated: Replaced old button section with Add Friend + Start Class */}
        <div className="mt-3 flex gap-3 justify-center">
          <button
            onClick={async () => {
              await api.post(`friends/request/${peer.id}/`);
              alert("Friend request sent!");
            }}
            className="bg-emerald-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-emerald-700"
          >
            Add Friend
          </button>

          <button
            onClick={() => navigate(`/room/${peer.id}`)}
            className="bg-indigo-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-indigo-700"
          >
            Start Class 🎥
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Teaching 👨‍🏫</h2>
          <div className="flex flex-wrap gap-2">
            {teaching.length > 0 ? (
              teaching.map((item) => (
                <span
                  key={item.id}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {item.skill?.name ?? "Unknown"}
                </span>
              ))
            ) : (
              <p className="text-gray-400">No skills listed.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-yellow-500">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Learning 📚</h2>
          <div className="flex flex-wrap gap-2">
            {learning.length > 0 ? (
              learning.map((item) => (
                <span
                  key={item.id}
                  className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {item.skill?.name ?? "Unknown"}
                </span>
              ))
            ) : (
              <p className="text-gray-400">No learning goals listed.</p>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Peer Availability Calendar */}
      <PeerScheduler peerId={peer.id} />
    </div>
  );
}

export default PeerProfile;
