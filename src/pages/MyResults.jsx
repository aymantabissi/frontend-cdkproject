// src/pages/MyResults.jsx
import { useEffect, useState } from "react";
import { getMyHistory } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function RiskBadge({ label }) {
  const isHigh = label === "High Risk";
  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
      isHigh
        ? "bg-red-500/20 text-red-300 border border-red-500/30"
        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
    }`}>
      {isHigh ? "⚠ High Risk" : "✓ Low Risk"}
    </span>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div className="flex flex-col items-center">
      <p className={`text-[18px] font-extrabold leading-none ${color}`}>{value}</p>
      <p className="text-[9px] text-white/30 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}

function PatientAvatar({ name, isHigh }) {
  const initial = (name || "?")[0].toUpperCase();
  return (
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-[15px] font-bold text-white"
      style={{
        background: isHigh
          ? "linear-gradient(135deg, rgba(248,113,113,0.3), rgba(248,113,113,0.1))"
          : "linear-gradient(135deg, rgba(52,211,153,0.3), rgba(52,211,153,0.1))",
        border: isHigh
          ? "1px solid rgba(248,113,113,0.3)"
          : "1px solid rgba(52,211,153,0.3)",
      }}
    >
      {initial}
    </div>
  );
}

export default function MyResults() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("all"); // "all" | "high" | "low"
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getMyHistory()
      .then(setRecords)
      .catch(() => setError("Failed to load history — is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  const highCount = records.filter(r => r.label === "High Risk").length;
  const lowCount  = records.filter(r => r.label === "Low Risk").length;

  // ── Filter + Search ──────────────────────────────────────────────────────────
  const filtered = records.filter(rec => {
    const matchFilter =
      filter === "all"  ? true :
      filter === "high" ? rec.label === "High Risk" :
                          rec.label === "Low Risk";

    const matchSearch = search.trim() === "" ||
      (rec.patient_name || "").toLowerCase().includes(search.toLowerCase());

    return matchFilter && matchSearch;
  });

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: "linear-gradient(135deg, #0f2942 0%, #0d3d56 50%, #0a4a4a 100%)" }}
    >
      {/* Blobs */}
      <div className="fixed top-[-100px] left-[-100px] w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(56,189,248,0.07), transparent 70%)" }} />
      <div className="fixed bottom-[-80px] right-[-80px] w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(52,211,153,0.07), transparent 70%)" }} />

      <div className="relative max-w-4xl mx-auto px-6 py-10">

        {/* ── Header ── */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-sky-300 text-[10px] font-bold uppercase tracking-widest">
              Patient History
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Predictions{" "}
            <span style={{
              background: "linear-gradient(90deg,#38bdf8,#34d399)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              History
            </span>
          </h1>
          <p className="text-white/30 text-[12px] mt-1">
            {user?.name || user?.email} · {records.length} predictions total
          </p>
        </div>

        {/* ── Summary Cards ── */}
        {!loading && records.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total Predictions", value: records.length, color: "text-sky-300",     bg: "rgba(56,189,248,0.1)",  border: "rgba(56,189,248,0.2)"  },
              { label: "High Risk",          value: highCount,      color: "text-red-300",     bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.2)" },
              { label: "Low Risk",           value: lowCount,       color: "text-emerald-300", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.2)"  },
            ].map((c, i) => (
              <div key={i} className="rounded-2xl p-5 flex items-center gap-4"
                style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                <p className={`text-3xl font-extrabold ${c.color}`}>{c.value}</p>
                <p className="text-[11px] text-white/30 leading-tight">{c.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Search + Filter ── */}
        {!loading && records.length > 0 && (
          <div className="flex items-center gap-3 mb-6">
            {/* Search */}
            <div
              className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <svg className="w-4 h-4 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by patient name..."
                className="flex-1 bg-transparent text-[13px] text-white placeholder-white/25 outline-none"
              />
            </div>

            {/* Filter buttons */}
            {["all", "high", "low"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all"
                style={{
                  background: filter === f
                    ? f === "high" ? "rgba(248,113,113,0.2)"
                    : f === "low"  ? "rgba(52,211,153,0.2)"
                    :                "rgba(56,189,248,0.2)"
                    : "rgba(255,255,255,0.04)",
                  border: filter === f
                    ? f === "high" ? "1px solid rgba(248,113,113,0.4)"
                    : f === "low"  ? "1px solid rgba(52,211,153,0.4)"
                    :                "1px solid rgba(56,189,248,0.4)"
                    : "1px solid rgba(255,255,255,0.07)",
                  color: filter === f
                    ? f === "high" ? "#fca5a5"
                    : f === "low"  ? "#6ee7b7"
                    :                "#7dd3fc"
                    : "rgba(255,255,255,0.3)",
                }}
              >
                {f === "all" ? "All" : f === "high" ? "⚠ High" : "✓ Low"}
              </button>
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="mb-6 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
            <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-[12px] text-red-300">{error}</p>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-2xl p-5 animate-pulse"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", height: "120px" }} />
            ))}
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && records.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)" }}>
              <svg className="w-8 h-8 text-sky-300/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-white/40 text-[14px] font-semibold">No predictions yet</p>
            <p className="text-white/20 text-[12px] mt-1">Run a prediction to see your history here</p>
            <button
              onClick={() => navigate("/predict")}
              className="mt-6 px-6 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:brightness-110 active:scale-95"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
            >
              Go to Prediction
            </button>
          </div>
        )}

        {/* ── No search results ── */}
        {!loading && records.length > 0 && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/30 text-[13px]">No results found for "{search}"</p>
            <button onClick={() => { setSearch(""); setFilter("all"); }}
              className="mt-3 text-sky-400 text-[12px] hover:text-sky-300 transition-colors">
              Clear filters
            </button>
          </div>
        )}

        {/* ── Records ── */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((rec, i) => {
              const isHigh = rec.label === "High Risk";
              return (
                <div
                  key={i}
                  className="rounded-2xl p-5 transition-all duration-200 hover:scale-[1.005]"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: isHigh
                      ? "1px solid rgba(248,113,113,0.15)"
                      : "1px solid rgba(52,211,153,0.15)",
                  }}
                >
                  <div className="flex items-start justify-between gap-4">

                    {/* Left — avatar + name + badge + date */}
                    <div className="flex items-center gap-3">
                      <PatientAvatar name={rec.patient_name} isHigh={isHigh} />
                      <div>
                        {/* Patient Name */}
                        <p className="text-[14px] font-bold text-white leading-none mb-1.5">
                          {rec.patient_name || "Unknown Patient"}
                        </p>
                        <RiskBadge label={rec.label} />
                        <p className="text-[10px] text-white/25 mt-1.5 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {rec.date
                            ? new Date(rec.date).toLocaleDateString("en-GB", {
                                day: "2-digit", month: "short", year: "numeric",
                                hour: "2-digit", minute: "2-digit"
                              })
                            : "—"
                          }
                        </p>
                      </div>
                    </div>

                    {/* Right — stats */}
                    <div className="flex items-center gap-5">
                      <StatPill
                        label="Risk Score"
                        value={`${rec.risk_percent ?? "—"}%`}
                        color={isHigh ? "text-red-300" : "text-emerald-300"}
                      />
                      <div className="w-px h-8 bg-white/10" />
                      <StatPill
                        label="Confidence"
                        value={`${rec.confidence ?? "—"}%`}
                        color={isHigh ? "text-red-300" : "text-emerald-300"}
                      />
                      <div className="w-px h-8 bg-white/10" />
                      <StatPill
                        label="Model"
                        value={rec.model_type || "XGBoost"}
                        color="text-violet-300"
                      />
                    </div>
                  </div>

                  {/* ── Details row ── */}
                  <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-6 gap-3">
                    {[
                      { label: "Age",        value: rec.age        ? `${rec.age} yrs`         : "—" },
                      { label: "BP",         value: rec.bp         ? `${rec.bp} mmHg`          : "—" },
                      { label: "Creatinine", value: rec.creatinine ? `${rec.creatinine} mg/dL` : "—" },
                      { label: "Hemoglobin", value: rec.hemoglobin ? `${rec.hemoglobin} g/dL`  : "—" },
                      { label: "Urea",       value: rec.urea       ? `${rec.urea} mg/dL`       : "—" },
                      { label: "Potassium",  value: rec.potassium  ? `${rec.potassium} mEq/L`  : "—" },
                    ].map((item, j) => (
                      <div key={j} className="text-center">
                        <p className="text-[12px] font-semibold text-white/70">{item.value}</p>
                        <p className="text-[9px] text-white/25 uppercase tracking-wider mt-0.5">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* ── Doctor info ── */}
                  {rec.user_name && (
                    <div className="mt-3 flex items-center gap-1.5">
                      <svg className="w-3 h-3 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <p className="text-[10px] text-white/20">
                        By Dr. {rec.user_name}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-[10px] text-white/15 uppercase tracking-widest mt-8">
          NephroAI · Patient History · XGBoost ✦
        </p>

      </div>
    </div>
  );
}