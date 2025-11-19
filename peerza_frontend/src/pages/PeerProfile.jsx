import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

function PeerProfile() {
  const { id } = useParams(); // Get ID from URL
  const navigate = useNavigate();
  const [peer, setPeer] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the public profile data
    api
      .get(`users/${id}/`)
      .then((res) => {
        setPeer(res.data.user);
        setSkills(res.data.skills);
        setLoading(false);
      })
      .catch(() => {
        alert("Failed to load profile");
        navigate("/"); // Go back home on error
      });
  }, [id, navigate]);

  if (loading)
    return <div className="text-center mt-20">Loading Profile...</div>;

  // Separate skills
  const teaching = skills.filter((s) => s.skill_type === "TEACH");
  const learning = skills.filter((s) => s.skill_type === "LEARN");

  return (
    <div className="max-w-3xl mx-auto">
      {/* Profile Header Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-indigo-50 text-center">
        <div className="w-24 h-24 bg-indigo-100 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-indigo-600 mb-4">
          {peer.username.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {peer.username}
        </h1>
        <p className="text-gray-500 max-w-md mx-auto">
          {peer.bio || "This user hasn't written a bio yet."}
        </p>

        <div className="mt-6">
          <button
            onClick={() => navigate(`/room/${peer.id}`)}
            className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-700 hover:scale-105 transition transform duration-200"
          >
            Start Class with {peer.username} 🎥
          </button>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teaching Column */}
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Teaching 👨‍🏫</h2>
          <div className="flex flex-wrap gap-2">
            {teaching.length > 0 ? (
              teaching.map((item) => (
                <span
                  key={item.id}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {item.skill.name}
                </span>
              ))
            ) : (
              <p className="text-gray-400">No skills listed.</p>
            )}
          </div>
        </div>

        {/* Learning Column */}
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-yellow-500">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Learning 📚</h2>
          <div className="flex flex-wrap gap-2">
            {learning.length > 0 ? (
              learning.map((item) => (
                <span
                  key={item.id}
                  className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {item.skill.name}
                </span>
              ))
            ) : (
              <p className="text-gray-400">No learning goals listed.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PeerProfile;
