import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Classroom from "./pages/Classroom";
import Settings from "./pages/Settings"; // <--- 1. IMPORT ADDED HERE
import ProtectedRoute from "./components/ProtectedRoute";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Protected Route: The Dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* --- NEW ROUTE ADDED HERE --- */}
        {/* Protected Route: Settings Page */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* 2. Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />

        {/* 3. Video Classroom Route */}
        <Route
          path="/room/:peerId"
          element={
            <ProtectedRoute>
              <Classroom />
            </ProtectedRoute>
          }
        />

        {/* 4. Fallback: If 404, go home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
