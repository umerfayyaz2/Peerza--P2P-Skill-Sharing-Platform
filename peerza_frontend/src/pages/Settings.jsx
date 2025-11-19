import { useState, useEffect } from "react";
import api from "../api";

function Settings() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch Data
  useEffect(() => {
    api
      .get("profile/")
      .then((res) => {
        setUsername(res.data.username);
        setBio(res.data.bio || "");
        if (res.data.avatar) {
          setPreview(
            res.data.avatar.startsWith("http")
              ? res.data.avatar
              : `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}${
                  res.data.avatar
                }`
          );
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load profile data.");
        setLoading(false);
      });
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // --- NEW: REMOVE AVATAR FUNCTION ---
  const handleRemoveAvatar = async () => {
    if (!confirm("Are you sure you want to remove your profile picture?"))
      return;

    const formData = new FormData();
    formData.append("remove_avatar", "true"); // Send the flag

    try {
      const res = await api.patch("profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.status === 200) {
        setAvatar(null);
        setPreview(null); // Clear preview to show default initial
        alert("Profile picture removed.");
      }
    } catch {
      alert("Failed to remove picture.");
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("bio", bio);
    if (avatar) {
      formData.append("avatar", avatar);
    }

    try {
      const res = await api.patch("profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.status === 200) {
        alert("Profile updated!");
      }
    } catch {
      setError("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("change-password/", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      if (res.status === 200) {
        alert("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
      }
    } catch {
      alert("Failed to change password. Check your old password.");
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* --- PROFILE SETTINGS --- */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Profile Settings 📷
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleProfileUpdate}>
            {/* Avatar Section */}
            <div className="flex items-center gap-6 mb-8">
              {/* Preview Circle */}
              <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border-2 border-indigo-100 flex-shrink-0 shadow-inner flex items-center justify-center">
                {preview ? (
                  <img
                    src={preview}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-3xl font-bold">
                    {username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Controls */}
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Profile Picture
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  {/* NEW REMOVE BUTTON */}
                  {preview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="text-red-500 hover:text-red-700 text-sm font-bold border border-red-200 px-3 py-2 rounded-full hover:bg-red-50 transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 border rounded-lg h-24"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition"
            >
              Save Profile
            </button>
          </form>
        </div>

        {/* --- SECURITY SETTINGS --- */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Security 🔒</h2>
          <form onSubmit={handlePasswordChange}>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <input
                type="password"
                placeholder="Current Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-gray-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-900 transition"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;
