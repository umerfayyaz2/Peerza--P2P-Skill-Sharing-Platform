import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Classroom from "./pages/Classroom";

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
        {/* If user is NOT logged in, ProtectedRoute kicks them to /login */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* 2. Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />

        {/* --- NEW VIDEO CLASSROOM ROUTE --- */}
        <Route
          path="/room/:peerId"
          element={
            <ProtectedRoute>
              <Classroom />
            </ProtectedRoute>
          }
        />

        {/* 3. Fallback: If 404, go home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
