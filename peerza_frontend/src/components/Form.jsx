import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

// ✅ IMPORTS THAT MATCH firebaseConfig.js EXACTLY
import {
  auth,
  database,
  signInAnonymously,
  ref,
  set,
  onDisconnect,
} from "../firebaseConfig";

function Form({ route, method }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const navigate = useNavigate();
  const name = method === "login" ? "Login" : "Register";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // -----------------------------------------
      // STEP 1: Django Authentication (Login/Register)
      // -----------------------------------------
      const payload =
        method === "register"
          ? { username, email, password }
          : { username, password };

      const res = await api.post(route, payload);

      if (method === "login") {
        console.log("✅ Django response data:", res.data);
        const access = res.data.access;
        const refresh = res.data.refresh;

        // Save JWT tokens
        localStorage.setItem(ACCESS_TOKEN, access);
        localStorage.setItem(REFRESH_TOKEN, refresh);

        // Ensure future requests include Authorization header
        api.defaults.headers.common["Authorization"] = `Bearer ${access}`;

        // -----------------------------------------
        // STEP 2: Firebase Anonymous Login
        // -----------------------------------------
        const firebaseRes = await signInAnonymously(auth);
        const firebaseUid = firebaseRes.user.uid;
        console.log("🔥 Firebase UID:", firebaseUid);

        // -----------------------------------------
        // STEP 3: Send Firebase UID → Django Backend
        // -----------------------------------------
        await api.post("firebase/register-uid/", {
          firebase_uid: firebaseUid,
        });

        console.log("🔥 Firebase UID registered in Django backend");

        // -----------------------------------------
        // STEP 4: Presence System (Realtime Database)
        // -----------------------------------------
        const presenceRef = ref(database, `presence/${firebaseUid}`);

        // Mark user online
        await set(presenceRef, {
          online: true,
          last_active: new Date().toISOString(),
        });

        // Automatically set offline when disconnected
        onDisconnect(presenceRef).set({
          online: false,
          last_active: new Date().toISOString(),
        });

        console.log("🔥 Presence system activated");

        // -----------------------------------------
        // STEP 5: Redirect to dashboard
        // -----------------------------------------
        navigate("/dashboard");
      } else {
        // Registration success → redirect to login page
        navigate("/login");
      }
    } catch (error) {
      // -----------------------------------------
      // ERROR HANDLING
      // -----------------------------------------
      console.error("❌ Login/Register Error:", error);

      if (error.response) {
        console.error("Backend response:", error.response.data);

        if (method === "register") {
          alert(
            `Registration failed: ${
              error.response?.data?.email ||
              error.response?.data?.username ||
              error.response?.data?.detail ||
              "Please try again."
            }`
          );
        } else {
          alert(
            `Login failed: ${
              error.response?.data?.detail || "Invalid credentials"
            }`
          );
        }
      } else {
        alert(
          method === "register"
            ? "Registration failed. Please check your connection."
            : "Login failed. Please check your connection."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // RETURN UI
  // -----------------------------------------
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
        required
      />

      {method === "register" && (
        <input
          className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
      )}

      <input
        className="w-full p-3 mb-6 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700 transition duration-200 font-bold"
      >
        {loading ? "Processing…" : name}
      </button>
    </form>
  );
}

export default Form;
