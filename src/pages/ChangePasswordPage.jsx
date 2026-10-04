// src/pages/ChangePasswordPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "../services/api";

const inputClass =
  "w-full px-4 py-2.5 rounded-xl text-[13px] text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-sky-500/30 transition-all";
const inputStyle = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" };

export default function ChangePasswordPage() {
  const navigate               = useNavigate();
  const { authHeader }         = useAuth();
  const [loading, setLoading]  = useState(false);
  const [form, setForm]        = useState({ old_password: "", new_password: "", confirm: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.old_password || !form.new_password) {
      toast.error("All fields are required");
      return;
    }
    if (form.new_password.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (form.new_password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/auth/change-password`, {
        method:  "POST",
        headers: authHeader(),
        body:    JSON.stringify({ old_password: form.old_password, new_password: form.new_password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update password");
      } else {
        toast.success("Password updated ✅");
        setTimeout(() => navigate("/my-results"), 1200);
      }
    } catch {
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "old_password", label: "Current password" },
    { name: "new_password", label: "New password" },
    { name: "confirm",      label: "Confirm new password" },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center text-white px-4"
      style={{ background: "linear-gradient(135deg, #0f2942 0%, #0d3d56 50%, #0a4a4a 100%)" }}
    >
      <Toaster position="top-right" />

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-white tracking-tight">Change Password</h1>
          <p className="text-[12px] text-white/30 mt-1">At least 8 characters</p>
        </div>

        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
          }}
        >
          <div className="h-0.5" style={{ background: "linear-gradient(90deg, #38bdf8, #34d399, #818cf8)" }} />

          <div className="p-6 space-y-4">
            {fields.map(({ name, label }) => (
              <div key={name}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{label}</p>
                <input
                  type="password"
                  name={name}
                  placeholder="••••••••"
                  value={form[name]}
                  onChange={handleChange}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 rounded-2xl font-bold text-[13px] text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #0d9488)",
                boxShadow: "0 4px 20px rgba(14,165,233,0.3)",
              }}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
