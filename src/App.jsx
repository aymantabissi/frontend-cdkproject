// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar         from "./components/Navbar";
import Chatbot        from "./components/Chatbot";

// Pages
import LandingPage    from "./pages/LandingPage";
import LoginPage      from "./pages/LoginPage";
import RegisterPage   from "./pages/RegisterPage";
import PredictionPage from "./pages/PredictionPage";
import DashboardPage  from "./pages/DashboardPage";
import AboutPage      from "./pages/AboutPage";
import MyResults      from "./pages/MyResults";
import AdminPage      from "./pages/AdminPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";

// ── Unauthorized ───────────────────────────────────────────────────────────────
const Unauthorized = () => (
  <div
    className="min-h-screen flex flex-col items-center justify-center gap-4"
    style={{ background: "linear-gradient(135deg, #0f2942 0%, #0d3d56 50%, #0a4a4a 100%)" }}
  >
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center"
      style={{ background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)" }}
    >
      <svg className="w-8 h-8 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    </div>
    <p className="text-white font-bold text-lg">Access Denied</p>
    <p className="text-white/30 text-sm">You don't have permission to view this page.</p>
  </div>
);

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Chatbot />
      <div className="pt-16">
        <Routes>

          {/* ── Public ── */}
          <Route path="/"             element={<LandingPage />} />
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/register"     element={<RegisterPage />} />
          <Route path="/about"        element={<AboutPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* ── Doctor + Admin ── */}
          <Route path="/predict" element={
            <ProtectedRoute roles={["doctor", "admin"]}>
              <PredictionPage />
            </ProtectedRoute>
          } />

          {/* ── Dashboard — Doctor + Admin ── */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={["admin", "doctor"]}>
              <DashboardPage />
            </ProtectedRoute>
          } />

          {/* ── Admin only ── */}
          <Route path="/admin" element={
            <ProtectedRoute roles={["admin"]}>
              <AdminPage />
            </ProtectedRoute>
          } />

          {/* ── My Results — tous les rôles ── */}
          <Route path="/my-results" element={
            <ProtectedRoute roles={["patient", "doctor", "admin"]}>
              <MyResults />
            </ProtectedRoute>
          } />

          {/* ── Change password — tous les rôles ── */}
          <Route path="/change-password" element={
            <ProtectedRoute roles={["patient", "doctor", "admin"]}>
              <ChangePasswordPage />
            </ProtectedRoute>
          } />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </div>
    </BrowserRouter>
  );
}