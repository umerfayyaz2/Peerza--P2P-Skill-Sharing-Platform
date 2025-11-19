import { useState, useEffect } from "react";
import api from "../api";

function Settings() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch current profile data on load
  useEffect(() => {
    api
      .get("profile/")
      .then((res) => {
        setUsername(res.data.username);
        setBio(res.data.bio || "");
        setLoading(false);
      })
      .catch(() => {
        // <--- FIXED: Removed 'err'
        setError("Failed to load profile data.");
        setLoading(false);
      });
  }, []);

  // 2. Handle form submission (The PATCH request)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.patch("profile/", {
        username: username,
        bio: bio,
      });

      if (res.status === 200) {
        alert("Profile updated successfully!");
      } else {
        setError("Update failed.");
      }
    } catch {
      // <--- FIXED: Removed 'err' here too
      setError("Update failed. Check if username is already taken.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-20 text-indigo-600 font-bold">
        Loading Settings...
      </div>
    );
  }

  // Removed the "if (error) return..." block so the form stays visible

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-2xl border border-indigo-100">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
          My Profile Settings 🛠️
        </h1>

        {/* Display Error HERE instead of hiding the form */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Bio / Headline
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24"
              placeholder="Tell others what you teach or want to learn..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white p-3 rounded font-bold hover:bg-indigo-700 transition duration-200"
            disabled={loading}
          >
            {loading ? "Saving..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Settings;
