import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Home() {
  const [skills, setSkills] = useState([]);
  const [skillName, setSkillName] = useState("");
  const [skillType, setSkillType] = useState("TEACH");
  const [profile, setProfile] = useState(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // To track if user has tried searching

  const navigate = useNavigate();

  // --- 1. API CALLS ---
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

  useEffect(() => {
    getSkills();
    getProfile();
  }, []);

  const teaching = skills.filter((s) => s.skill_type === "TEACH");
  const learning = skills.filter((s) => s.skill_type === "LEARN");

  return (
    <div className="max-w-7xl mx-auto mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* --- LEFT SIDEBAR (User Skills) --- */}
      <div className="lg:col-span-4 space-y-6">
        {/* 1. Profile Summary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Hi, <span className="text-indigo-600">{profile?.username}</span> 👋
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Ready to learn something new today?
          </p>
        </div>

        {/* 2. My Skills Widget */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center">
            <span>My Skills</span>
            <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              {skills.length} / 2
            </span>
          </h3>

          {/* Teaching List */}
          <div className="mb-6">
            <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">
              I Teach
            </p>
            <div className="flex flex-wrap gap-2">
              {teaching.length > 0 ? (
                teaching.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm border border-green-100"
                  >
                    {item.skill.name}
                    <button
                      onClick={() => deleteSkill(item.id)}
                      className="ml-2 text-green-400 hover:text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm italic">
                  Nothing yet.
                </span>
              )}
            </div>
          </div>

          {/* Learning List */}
          <div className="mb-6">
            <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-2">
              I Learn
            </p>
            <div className="flex flex-wrap gap-2">
              {learning.length > 0 ? (
                learning.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center bg-yellow-50 text-yellow-700 px-3 py-1 rounded-lg text-sm border border-yellow-100"
                  >
                    {item.skill.name}
                    <button
                      onClick={() => deleteSkill(item.id)}
                      className="ml-2 text-yellow-500 hover:text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm italic">
                  Nothing yet.
                </span>
              )}
            </div>
          </div>

          {/* Add Skill Mini-Form */}
          <form
            onSubmit={addSkill}
            className="mt-6 pt-6 border-t border-gray-100"
          >
            <p className="text-sm font-bold text-gray-700 mb-2">
              Add New Skill
            </p>
            <input
              type="text"
              placeholder="e.g. React Native"
              required
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded mb-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <div className="flex gap-2 mb-2">
              <select
                value={skillType}
                onChange={(e) => setSkillType(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="TEACH">Teach</option>
                <option value="LEARN">Learn</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded text-sm font-bold hover:bg-indigo-700 transition"
            >
              + Add to Profile
            </button>
          </form>
        </div>
      </div>

      {/* --- RIGHT MAIN CONTENT (Search & Discovery) --- */}
      <div className="lg:col-span-8">
        {/* Hero Search Bar */}
        <div className="bg-indigo-600 rounded-2xl p-8 text-center shadow-lg mb-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Find your next tutor</h1>
          <p className="text-indigo-100 mb-6">
            Search for any skill you want to learn.
          </p>

          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="What do you want to learn? (e.g. Python)"
              className="w-full p-4 pl-6 rounded-full text-gray-800 focus:ring-4 focus:ring-indigo-300 outline-none shadow-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bg-indigo-800 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-900 transition"
            >
              {searching ? "..." : "Search"}
            </button>
          </form>
        </div>

        {/* Search Results Area */}
        <div>
          {hasSearched && (
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {searchResults.length}{" "}
              {searchResults.length === 1 ? "Peer" : "Peers"} Found
            </h2>
          )}

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                      {result.user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {result.user.username}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Level: {result.proficiency}
                      </p>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">
                    {result.skill.name}
                  </span>
                </div>

                <button
                  onClick={() => navigate(`/peer/${result.user.id}`)}
                  className="mt-auto w-full py-2 border border-indigo-600 text-indigo-600 rounded-lg font-bold text-sm hover:bg-indigo-50 transition"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {hasSearched && searchResults.length === 0 && !searching && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
              <div className="text-4xl mb-2">🤔</div>
              <h3 className="text-lg font-bold text-gray-600">
                No tutors found
              </h3>
              <p className="text-gray-400">
                Try searching for a different skill or keyword.
              </p>
            </div>
          )}

          {/* Initial State */}
          {!hasSearched && (
            <div className="text-center py-12">
              <p className="text-gray-400">
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
