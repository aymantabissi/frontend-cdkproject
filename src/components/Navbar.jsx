import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/login");
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const links = [
    { to: "/", label: "Home" },
    { to: "/predict", label: "Prediction" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/about", label: "About" },
  ];

  const dropdownItems = [
    {
      label: "My Results",
      to: "/my-results",
      roles: ["patient", "doctor", "admin"],
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: "Prediction",
      to: "/predict",
      roles: ["doctor", "admin"],
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      label: "Dashboard",
      to: "/dashboard",
      roles: ["doctor", "admin"],
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      label: "Admin Panel",
      to: "/admin",
      roles: ["admin"],
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "Change Password",
      to: "/change-password",
      roles: ["patient", "doctor", "admin"],
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
  ];

  const roleColor = {
    admin:   { text: "#fca5a5", dot: "#f87171", bg: "rgba(248,113,113,0.1)" },
    doctor:  { text: "#7dd3fc", dot: "#38bdf8", bg: "rgba(56,189,248,0.1)"  },
    patient: { text: "#6ee7b7", dot: "#34d399", bg: "rgba(52,211,153,0.1)"  },
  };
  const rc = roleColor[user?.role] || roleColor.patient;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-4"
      style={{
        background: "rgba(15, 41, 66, 0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => navigate("/")}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all border border-sky-500/20 shadow-lg shadow-sky-500/10"
          style={{ background: "rgba(14, 165, 233, 0.15)" }}
        >
          <span className="text-xl">🩺</span>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white leading-none">
            Nephro<span className="text-sky-400">AI</span>
          </h1>
          <p className="text-[9px] font-medium text-sky-300/40 uppercase tracking-[0.15em]">
            Kidney Predictor
          </p>
        </div>
      </div>

      {/* ── Nav Links ── */}
      <div className="flex items-center gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `px-5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-300 ${
                isActive
                  ? "text-sky-300 bg-sky-500/10 border border-sky-500/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      {/* ── Auth ── */}
      <div className="flex items-center gap-4">
        {!user ? (
          <>
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-semibold text-white/60 hover:text-white transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-sky-500/20"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #0d9488)" }}
            >
              Register
            </button>
          </>
        ) : (
          <div className="relative" ref={dropdownRef}>

            {/* ── User Button ── */}
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              className="flex items-center gap-3 transition-all hover:opacity-90"
            >
              {/* Name + role */}
              <div className="text-right">
                <p className="text-[13px] font-semibold text-white leading-none">
                  {user.name || user.email}
                </p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: rc.dot }} />
                  <p className="text-[10px] capitalize" style={{ color: rc.text }}>
                    {user.role}
                  </p>
                </div>
              </div>

              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0 transition-all"
                style={{
                  background: "linear-gradient(135deg, #0ea5e9, #0d9488)",
                  boxShadow: dropdownOpen
                    ? "0 0 0 2px rgba(56,189,248,0.4)"
                    : "0 2px 8px rgba(14,165,233,0.3)",
                }}
              >
                {(user.name || user.email || "U")[0].toUpperCase()}
              </div>

              {/* Chevron */}
              <svg
                className="w-3.5 h-3.5 text-white/30 transition-transform duration-200"
                style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* ── Dropdown ── */}
            {dropdownOpen && (
              <div
                className="absolute right-0 top-full mt-3 w-56 rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(13, 35, 58, 0.98)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                  backdropFilter: "blur(20px)",
                }}
              >
                {/* Top strip */}
                <div className="h-0.5" style={{
                  background: "linear-gradient(90deg, #38bdf8, #34d399, #818cf8)"
                }} />

                {/* User info */}
                <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="text-[13px] font-bold text-white leading-none">
                    {user.name || user.email?.split("@")[0]}
                  </p>
                  <p className="text-[10px] text-white/30 mt-0.5 truncate">{user.email}</p>
                  <span
                    className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                    style={{ background: rc.bg, color: rc.text, border: `1px solid ${rc.dot}30` }}
                  >
                    <span className="w-1 h-1 rounded-full" style={{ background: rc.dot }} />
                    {user.role}
                  </span>
                </div>

                {/* Menu Items */}
                <div className="py-1.5">
                  {dropdownItems
                    .filter(item => item.roles.includes(user.role))
                    .map((item, i) => (
                      <button
                        key={i}
                        onClick={() => { navigate(item.to); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 hover:bg-white/5 group"
                      >
                        <span className="text-white/25 group-hover:text-sky-300 transition-colors">
                          {item.icon}
                        </span>
                        <span className="text-[13px] font-medium text-white/50 group-hover:text-white transition-colors">
                          {item.label}
                        </span>
                      </button>
                    ))
                  }
                </div>

                {/* Divider */}
                <div className="mx-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }} />

                {/* Logout */}
                <div className="py-1.5">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 hover:bg-red-500/10 group"
                  >
                    <svg className="w-4 h-4 text-red-400/40 group-hover:text-red-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-[13px] font-medium text-red-400/50 group-hover:text-red-400 transition-colors">
                      Logout
                    </span>
                  </button>
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}