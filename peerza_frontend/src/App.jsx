import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Classroom from "./pages/Classroom";
import Layout from "./components/Layout";
import Settings from "./pages/Settings";
import Landing from "./pages/Landing";
import ProtectedRoute from "./components/ProtectedRoute";
import PeerProfile from "./pages/PeerProfile";

// --- NEW IMPORTS ---
import GetPro from "./pages/GetPro";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

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
        {/* 1. PUBLIC LANDING PAGE (Root) */}
        <Route path="/" element={<Landing />} />

        {/* 2. PROTECTED DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Settings Page */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Peer Profile Page */}
        <Route
          path="/peer/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <PeerProfile />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* --- NEW PAGES (Wrapped in Layout) --- */}
        <Route
          path="/pro"
          element={
            <ProtectedRoute>
              <Layout>
                <GetPro />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <Layout>
              <About />
            </Layout>
          }
        />
        <Route
          path="/privacy"
          element={
            <Layout>
              <Privacy />
            </Layout>
          }
        />
        <Route
          path="/terms"
          element={
            <Layout>
              <Terms />
            </Layout>
          }
        />

        {/* Video Classroom */}
        <Route
          path="/room/:peerId"
          element={
            <ProtectedRoute>
              <Classroom />
            </ProtectedRoute>
          }
        />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
