// src/pages/AdminPage.jsx
import { useEffect, useState } from "react";
import { getAdminUsers, updateUserRole, deleteUser, getAdminStats, createUser } from "../services/api";
import toast, { Toaster } from "react-hot-toast";

const ROLE_COLORS = {
  admin:   { bg: "rgba(248,113,113,0.15)", text: "#fca5a5",  border: "rgba(248,113,113,0.3)"  },
  doctor:  { bg: "rgba(56,189,248,0.15)",  text: "#7dd3fc",  border: "rgba(56,189,248,0.3)"   },
  patient: { bg: "rgba(52,211,153,0.15)",  text: "#6ee7b7",  border: "rgba(52,211,153,0.3)"   },
};

function StatCard({ label, value, color, icon }) {
  return (
    <div className="rounded-2xl p-5 flex items-center gap-4"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-white leading-none">{value ?? "—"}</p>
        <p className="text-[11px] text-white/30 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function CreateUserModal({ onClose, onCreated }) {
  const [form, setForm]       = useState({ name: "", email: "", password: "", role: "patient" });
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!form.email || !form.password) {
      toast.error("Email and password required");
      return;
    }
    setCreating(true);
    try {
      await createUser(form.name, form.email, form.password, form.role);
      toast.success(`✅ ${form.role} created successfully`);
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
    setCreating(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f2942 0%, #0d3d56 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Top strip */}
        <div className="h-0.5" style={{ background: "linear-gradient(90deg, #38bdf8, #34d399, #818cf8)" }} />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[16px] font-bold text-white">Create New User</h2>
              <p className="text-[12px] text-white/30 mt-0.5">Add a new user to the system</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">

            {/* Role selector */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Role</p>
              <div className="flex gap-2">
                {["patient", "doctor", "admin"].map(r => (
                  <button
                    key={r}
                    onClick={() => setForm(p => ({ ...p, role: r }))}
                    className="flex-1 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all"
                    style={{
                      background: form.role === r ? ROLE_COLORS[r]?.bg : "rgba(255,255,255,0.04)",
                      color:      form.role === r ? ROLE_COLORS[r]?.text : "rgba(255,255,255,0.3)",
                      border:     form.role === r
                        ? `1px solid ${ROLE_COLORS[r]?.border}`
                        : "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Full Name</p>
              <input
                type="text"
                placeholder="Dr. John Doe"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-[13px] text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-sky-500/30 transition-all"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
            </div>

            {/* Email */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Email</p>
              <input
                type="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                className="w-full px-4 py-2.5 rounded-xl text-[13px] text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-sky-500/30 transition-all"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
            </div>

            {/* Password */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Password</p>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                className="w-full px-4 py-2.5 rounded-xl text-[13px] text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-sky-500/30 transition-all"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleCreate}
              disabled={creating}
              className="w-full py-3 rounded-2xl font-bold text-[13px] text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 mt-2"
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #0d9488)",
                boxShadow: "0 4px 20px rgba(14,165,233,0.3)",
              }}
            >
              {creating ? "Creating..." : `Create ${form.role}`}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [users,      setUsers]      = useState([]);
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("all");
  const [confirm,    setConfirm]    = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const loadData = () => {
    Promise.all([getAdminUsers(), getAdminStats()])
      .then(([u, s]) => {
        setUsers(Array.isArray(u) ? u : []);
        setStats(s);
      })
      .catch((err) => {
        console.error("Admin load error:", err);
        setError("Failed to load admin data — check your role and connection");
        toast.error("Failed to load admin data");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleRoleChange = async (email, newRole) => {
    try {
      await updateUserRole(email, newRole);
      setUsers(prev => prev.map(u => u.email === email ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${newRole}`);
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleDelete = async (email) => {
    try {
      await deleteUser(email);
      setUsers(prev => prev.filter(u => u.email !== email));
      setConfirm(null);
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const filtered = users.filter(u => {
    const matchFilter = filter === "all" || u.role === filter;
    const matchSearch = search.trim() === "" ||
      (u.name  || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="min-h-screen text-white"
      style={{ background: "linear-gradient(135deg, #0f2942 0%, #0d3d56 50%, #0a4a4a 100%)" }}>
      <Toaster position="top-right" />

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={loadData}
        />
      )}

      <div className="fixed top-[-100px] left-[-100px] w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(56,189,248,0.07), transparent 70%)" }} />

      <div className="relative max-w-5xl mx-auto px-6 py-10">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span className="text-red-300 text-[10px] font-bold uppercase tracking-widest">Admin Panel</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              User{" "}
              <span style={{ background: "linear-gradient(90deg,#f87171,#fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Management
              </span>
            </h1>
            <p className="text-white/30 text-[12px] mt-1">
              Manage users, roles and system statistics
            </p>
          </div>

          {/* Create User Button */}
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:brightness-110 active:scale-95 mt-1"
            style={{
              background: "linear-gradient(135deg, #0ea5e9, #0d9488)",
              boxShadow: "0 4px 15px rgba(14,165,233,0.3)",
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create User
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mb-6 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
            <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-[12px] text-red-300">{error}</p>
          </div>
        )}

        {/* ── Stats ── */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Users" value={stats.total_users} color="#38bdf8"
              icon={<svg className="w-5 h-5 text-sky-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
            />
            <StatCard label="Doctors" value={stats.total_doctors} color="#38bdf8"
              icon={<svg className="w-5 h-5 text-sky-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
            />
            <StatCard label="Predictions Today" value={stats.preds_today} color="#34d399"
              icon={<svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>}
            />
            <StatCard label="Total Predictions" value={stats.total_preds} color="#a78bfa"
              icon={<svg className="w-5 h-5 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>}
            />
          </div>
        )}

        {/* ── Search + Filter ── */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <svg className="w-4 h-4 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="flex-1 bg-transparent text-[13px] text-white placeholder-white/25 outline-none"
            />
          </div>
          {["all", "admin", "doctor", "patient"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all"
              style={{
                background: filter === f ? ROLE_COLORS[f]?.bg || "rgba(56,189,248,0.2)" : "rgba(255,255,255,0.04)",
                color:      filter === f ? ROLE_COLORS[f]?.text || "#7dd3fc" : "rgba(255,255,255,0.3)",
                border:     filter === f ? `1px solid ${ROLE_COLORS[f]?.border || "rgba(56,189,248,0.4)"}` : "1px solid rgba(255,255,255,0.07)",
              }}>
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>

        {/* ── Users Table ── */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-2xl h-16 animate-pulse"
                style={{ background: "rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}>

            {/* Table Header */}
            <div className="grid grid-cols-12 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white/30"
              style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="col-span-1">#</div>
              <div className="col-span-4">User</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-12 text-white/30 text-[13px]">
                {users.length === 0 ? "No users in database" : "No users match your search"}
              </div>
            ) : (
              filtered.map((u, i) => (
                <div key={u.email}
                  className="grid grid-cols-12 px-5 py-4 items-center transition-all hover:bg-white/5"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>

                  <div className="col-span-1 text-[12px] text-white/20">{i + 1}</div>

                  <div className="col-span-4 flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
                      style={{ background: ROLE_COLORS[u.role]?.bg || "linear-gradient(135deg, #0ea5e9, #0d9488)", border: `1px solid ${ROLE_COLORS[u.role]?.border || "transparent"}` }}
                    >
                      {(u.name || u.email || "U")[0].toUpperCase()}
                    </div>
                    <p className="text-[13px] font-semibold text-white truncate">
                      {u.name || "—"}
                    </p>
                  </div>

                  <div className="col-span-3 text-[12px] text-white/40 truncate">{u.email}</div>

                  <div className="col-span-2">
                    <select
                      value={u.role || "patient"}
                      onChange={e => handleRoleChange(u.email, e.target.value)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold outline-none cursor-pointer transition-all"
                      style={{
                        background: ROLE_COLORS[u.role]?.bg || "rgba(255,255,255,0.05)",
                        color:      ROLE_COLORS[u.role]?.text || "#fff",
                        border:     `1px solid ${ROLE_COLORS[u.role]?.border || "rgba(255,255,255,0.1)"}`,
                      }}
                    >
                      <option value="patient" style={{ background: "#0d3d56" }}>Patient</option>
                      <option value="doctor"  style={{ background: "#0d3d56" }}>Doctor</option>
                      <option value="admin"   style={{ background: "#0d3d56" }}>Admin</option>
                    </select>
                  </div>

                  <div className="col-span-2 flex justify-end">
                    {confirm === u.email ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDelete(u.email)}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-red-300 transition-all hover:bg-red-500/20"
                          style={{ border: "1px solid rgba(248,113,113,0.3)" }}>
                          Confirm
                        </button>
                        <button onClick={() => setConfirm(null)}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white/30 transition-all hover:bg-white/5"
                          style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirm(u.email)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        style={{ border: "1px solid transparent" }}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <p className="text-center text-[10px] text-white/15 uppercase tracking-widest mt-8">
          NephroAI · Admin Panel · XGBoost ✦
        </p>
      </div>
    </div>
  );
}