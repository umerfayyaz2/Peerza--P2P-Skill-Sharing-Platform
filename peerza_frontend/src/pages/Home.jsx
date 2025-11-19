import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../index.css";

function Home() {
  const [skills, setSkills] = useState([]);
  const [skillName, setSkillName] = useState("");
  const [skillType, setSkillType] = useState("TEACH");
  const [profile, setProfile] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const navigate = useNavigate();

  const getProfile = () => {
    api
      .get("profile/")
      .then((res) => setProfile(res.data))
      .catch((err) => alert(err));
  };

  const getSkills = () => {
    api
      .get("my-skills/")
      .then((res) => setSkills(res.data))
      .catch((err) => alert(err));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearching(true);
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
          alert("Skill Added!");
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
    if (confirm("Are you sure you want to delete this skill?")) {
      api
        .delete(`delete-skill/${id}/`)
        .then((res) => {
          if (res.status === 204) {
            getSkills();
          } else {
            alert("Failed to delete");
          }
        })
        .catch((err) => alert(err));
    }
  };

  useEffect(() => {
    getSkills();
    getProfile();
  }, []);

  const teaching = skills.filter((s) => s.skill_type === "TEACH");
  const learning = skills.filter((s) => s.skill_type === "LEARN");

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Welcome Message */}
      <div className="max-w-4xl mx-auto mb-10">
        <h1 className="text-3xl font-bold text-gray-800">
          Hello, <span className="text-indigo-600">{profile?.username}</span> 👋
        </h1>
        <p className="text-gray-500">Manage your skills and find peers.</p>
      </div>

      {/* SEARCH BAR SECTION */}
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md mb-8 border border-indigo-100">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          🔍 Find a Tutor
        </h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="What do you want to learn? (e.g. Python)"
            className="flex-1 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-3 rounded font-bold hover:bg-indigo-700 transition"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Search Results Area */}
        <div className="mt-6">
          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center hover:shadow-md transition"
                >
                  <div>
                    <h3 className="font-bold text-lg">
                      {result.user.username}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Can teach:{" "}
                      <span className="font-semibold text-green-600">
                        {result.skill.name}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">
                      Level: {result.proficiency}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/peer/${result.user.id}`)} // Changed to /peer/
                    className="bg-white border border-indigo-600 text-indigo-600 px-3 py-1 rounded hover:bg-indigo-50 text-sm font-bold transition"
                  >
                    View Profile 👤
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Skills Grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Add Skill Form */}
        <div className="bg-white p-6 rounded-xl shadow-md h-fit">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Add a Skill</h2>
          <form onSubmit={addSkill}>
            <label className="block text-sm text-gray-600 mb-2">
              Skill Name (e.g. Python)
            </label>
            <input
              type="text"
              required
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              className="w-full p-2 border rounded mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <label className="block text-sm text-gray-600 mb-2">
              I want to...
            </label>
            <select
              value={skillType}
              onChange={(e) => setSkillType(e.target.value)}
              className="w-full p-2 border rounded mb-6 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="TEACH">Teach this (Offer)</option>
              <option value="LEARN">Learn this (Request)</option>
            </select>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700"
            >
              Add to Profile
            </button>
          </form>
        </div>

        {/* Display Skills */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
            <h2 className="text-xl font-bold mb-3 text-gray-800">
              I Can Teach 👨‍🏫
            </h2>
            <div className="flex flex-wrap gap-2">
              {teaching.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  <span>{item.skill.name}</span>
                  <button
                    onClick={() => deleteSkill(item.id)}
                    className="ml-2 text-red-500 hover:text-red-700 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
            <h2 className="text-xl font-bold mb-3 text-gray-800">
              I Want to Learn 📚
            </h2>
            <div className="flex flex-wrap gap-2">
              {learning.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  <span>{item.skill.name}</span>
                  <button
                    onClick={() => deleteSkill(item.id)}
                    className="ml-2 text-red-500 hover:text-red-700 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
