import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../index.css";

function Home() {
  // --- STATE MANAGEMENT ---
  const [skills, setSkills] = useState([]);
  const [skillName, setSkillName] = useState("");
  const [skillType, setSkillType] = useState("TEACH");
  const [profile, setProfile] = useState(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Call State (New!)
  const [incomingCall, setIncomingCall] = useState(null);

  const navigate = useNavigate();

  // --- 1. API CALLS (Data Fetching) ---
  const getProfile = () => {
    api
      .get("profile/")
      .then((res) => setProfile(res.data))
      .catch(() => {});
  };

  const getSkills = () => {
    api
      .get("my-skills/")
      .then((res) => setSkills(res.data))
      .catch(() => {});
  };

  // --- 2. POLLING LOGIC (The "Active Call" Checker) ---
  useEffect(() => {
    // Poll every 3 seconds to see if anyone is calling
    const checkCalls = setInterval(() => {
      api
        .get("call/check/")
        .then((res) => {
          if (res.data.active) {
            setIncomingCall(res.data.caller);
          } else {
            setIncomingCall(null);
          }
        })
        .catch(() => {});
    }, 3000); // 3 seconds

    return () => clearInterval(checkCalls); // Cleanup when leaving page
  }, []);

  // --- 3. ACTION HANDLERS ---

  // Start a call (Caller side)
  const startClass = (peerId) => {
    api
      .post(`call/start/${peerId}/`)
      .then(() => {
        // Navigate to room AFTER telling backend
        navigate(`/room/${peerId}`);
      })
      .catch(() => alert("Could not connect call."));
  };

  // Join a call (Receiver side)
  const joinClass = () => {
    if (incomingCall) {
      // Navigate to the caller's room ID
      navigate(`/room/${incomingCall.id}`);
    }
  };

  // Clean up the notification on the current screen (Ignore button)
  const ignoreCall = () => {
    if (incomingCall && incomingCall.caller) {
      // We use the caller's ID as the "target" to end the call with
      // In our new backend logic, this ID is just a placeholder for the URL,
      // but the backend will automatically find the call involving 'Me' and end it.
      const targetId = incomingCall.caller.id;

      api
        .post(`call/end/${targetId}/`)
        .then(() => {
          console.log("Call rejected successfully");
          setIncomingCall(null); // Clear the notification from the screen instantly
        })
        .catch((err) => console.error("Failed to reject call:", err));
    }
  };

  // --- Existing CRUD/Search Handlers ---
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setHasSearched(true);

    api
      .get(`search/?skill=${searchQuery}`)
      .then((res) => setSearchResults(res.data))
      .catch(() => alert("Search failed"))
      .finally(() => setSearching(false));
  };

  const addSkill = (e) => {
    e.preventDefault();
    api
      .post("my-skills/", { skill_name: skillName, skill_type: skillType })
      .then((res) => {
        if (res.status === 201) {
          setSkillName("");
          getSkills();
        }
      })
      .catch((err) => {
        if (err.response && err.response.data && err.response.data.error) {
          alert(err.response.data.error);
        } else {
          alert("Failed to add skill.");
        }
      });
  };

  const deleteSkill = (id) => {
    if (confirm("Remove this skill?")) {
      api
        .delete(`delete-skill/${id}/`)
        .then((res) => {
          if (res.status === 204) getSkills();
        })
        .catch(() => alert("Failed to delete"));
    }
  };

  // Initial Load
  useEffect(() => {
    getSkills();
    getProfile();
  }, []);

  const teaching = skills.filter((s) => s.skill_type === "TEACH");
  const learning = skills.filter((s) => s.skill_type === "LEARN");

  return (
    <div className="max-w-7xl mx-auto mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* --- INCOMING CALL BANNER (Shows up when someone calls) --- */}
      {incomingCall && (
        <div className="lg:col-span-12 bg-indigo-600 text-white p-4 rounded-xl shadow-lg flex justify-between items-center animate-pulse border-2 border-indigo-400 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📞</span>
            <div>
              <h3 className="font-bold text-lg">
                Incoming Call from {incomingCall.username}
              </h3>
              <p className="text-indigo-100 text-sm">
                They want to start a class with you.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={ignoreCall} // Use the new ignore function
              className="px-4 py-2 rounded-lg text-sm font-bold bg-indigo-800 hover:bg-indigo-900 transition"
            >
              Ignore
            </button>
            <button
              onClick={joinClass}
              className="px-6 py-2 rounded-lg text-sm font-bold bg-white text-indigo-600 hover:bg-gray-100 shadow-lg transition transform hover:scale-105"
            >
              Accept & Join 🎥
            </button>
          </div>
        </div>
      )}

      {/* --- LEFT SIDEBAR (User Skills) --- */}
      <div className="lg:col-span-4 space-y-6">
        {/* Profile Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Hi, <span className="text-indigo-600">{profile?.username}</span> 👋
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Ready to learn something new today?
          </p>
        </div>

        {/* My Skills Widget */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 text-lg">My Skills</h3>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                skills.length >= 2
                  ? "bg-red-100 text-red-600"
                  : "bg-indigo-50 text-indigo-600"
              }`}
            >
              {skills.length} / 2 Slots Used
            </span>
          </div>

          <div className="space-y-4">
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">👨‍🏫</span>
                <h4 className="text-xs font-extrabold text-emerald-800 uppercase tracking-widest">
                  I Teach
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {teaching.length > 0 ? (
                  teaching.map((item) => (
                    <span
                      key={item.id}
                      className="group inline-flex items-center bg-white text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm border border-emerald-200 transition-transform hover:scale-105 cursor-default"
                    >
                      {item.skill.name}
                      <button
                        onClick={() => deleteSkill(item.id)}
                        className="ml-2 text-gray-300 group-hover:text-red-500 font-bold transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm italic pl-1">
                    Add a skill you can teach.
                  </span>
                )}
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📚</span>
                <h4 className="text-xs font-extrabold text-amber-800 uppercase tracking-widest">
                  I Learn
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {learning.length > 0 ? (
                  learning.map((item) => (
                    <span
                      key={item.id}
                      className="group inline-flex items-center bg-white text-amber-700 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm border border-amber-200 transition-transform hover:scale-105 cursor-default"
                    >
                      {item.skill.name}
                      <button
                        onClick={() => deleteSkill(item.id)}
                        className="ml-2 text-gray-300 group-hover:text-red-500 font-bold transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm italic pl-1">
                    Add a skill you want to learn.
                  </span>
                )}
              </div>
            </div>
          </div>

          <form
            onSubmit={addSkill}
            className="mt-8 pt-6 border-t border-gray-100"
          >
            <p className="text-sm font-bold text-gray-800 mb-3">
              Add New Skill
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="e.g. React Native"
                required
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 outline-none transition-all placeholder-gray-400"
              />
              <div className="relative">
                <select
                  value={skillType}
                  onChange={(e) => setSkillType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 outline-none appearance-none cursor-pointer"
                >
                  <option value="TEACH">👨‍🏫 I can Teach</option>
                  <option value="LEARN">📚 I want to Learn</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 mt-2"
              >
                + Add to Profile
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* --- RIGHT MAIN CONTENT (Search & Discovery) --- */}
      <div className="lg:col-span-8">
        {/* Hero Search Bar */}
        <div className="bg-indigo-600 rounded-2xl py-12 px-6 md:px-12 text-center shadow-lg mb-8 text-white flex flex-col items-center justify-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
            Find your next tutor
          </h1>
          <p className="text-indigo-100 mb-8 text-lg max-w-2xl leading-relaxed">
            Search for any skill you want to learn.
          </p>

          <form onSubmit={handleSearch} className="relative w-full max-w-xl">
            <input
              type="text"
              placeholder="What do you want to learn? (e.g. Python)"
              className="w-full p-4 pl-6 pr-32 rounded-full text-gray-800 focus:ring-4 focus:ring-indigo-400 outline-none shadow-2xl text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 bg-indigo-800 text-white px-8 rounded-full font-bold hover:bg-indigo-900 transition-all"
            >
              {searching ? "..." : "Search"}
            </button>
          </form>
        </div>

        {/* Search Results Area */}
        <div>
          {hasSearched && (
            <h2 className="text-xl font-bold text-gray-800 mb-6 pl-2">
              {searchResults.length}{" "}
              {searchResults.length === 1 ? "Peer" : "Peers"} Found
            </h2>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl border border-indigo-100">
                      {result.user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {result.user.username}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Level: {result.proficiency}
                      </p>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-bold border border-green-200">
                    {result.skill.name}
                  </span>
                </div>

                {/* RESTORED VIEW PROFILE AND START CLASS BUTTONS */}
                <div className="mt-auto flex gap-2">
                  <button
                    onClick={() => navigate(`/peer/${result.user.id}`)}
                    className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all"
                  >
                    Profile 👤
                  </button>
                  <button
                    onClick={() => startClass(result.user.id)}
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md"
                  >
                    Class 🎥
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty States */}
          {hasSearched && searchResults.length === 0 && !searching && (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <div className="text-5xl mb-4">🤔</div>
              <h3 className="text-lg font-bold text-gray-700">
                No tutors found
              </h3>
              <p className="text-gray-400 mt-2">
                Try searching for a different skill or keyword.
              </p>
            </div>
          )}
          {!hasSearched && (
            <div className="text-center py-20 opacity-50">
              <p className="text-gray-400 font-medium">
                Start typing to find peers around the world.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
