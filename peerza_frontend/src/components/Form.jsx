import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

function Form({ route, method }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 1. Determine the title based on the method prop
  const name = method === "login" ? "Login" : "Register";

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault(); // Prevent the page from refreshing

    try {
      // 2. Dynamic API Call
      // If method is login, route is "/api/token/"
      // If method is register, route is "/api/register/"
      const res = await api.post(route, { username, password });

      if (method === "login") {
        // 3. Login Success Logic
        // Save the digital ID cards (tokens) to the browser's memory
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/"); // Send user to Dashboard
      } else {
        // 4. Register Success Logic
        // Send user to login page to sign in with new account
        navigate("/login");
      }
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="container mx-auto max-w-sm bg-white p-8 rounded-lg shadow-lg mt-20"
    >
      <h1 className="text-3xl font-bold text-indigo-600 mb-6 text-center">
        {name}
      </h1>

      <input
        className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />

      <input
        className="w-full p-3 mb-6 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />

      <button
        className="w-full bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700 transition duration-200 font-bold"
        type="submit"
        disabled={loading}
      >
        {loading ? "Processing..." : name}
      </button>
    </form>
  );
}

export default Form;
