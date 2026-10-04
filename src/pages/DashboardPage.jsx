import { useEffect, useRef, useState } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale,
  BarElement, PointElement, LineElement,
  Filler,
} from "chart.js";
import { getStats } from "../services/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale,
  BarElement, PointElement, LineElement,
  Filler
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 animate-pulse"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="h-2.5 w-24 rounded-full bg-white/10 mb-3" />
      <div className="h-8 w-16 rounded-lg bg-white/10 mb-2" />
      <div className="h-2 w-20 rounded-full bg-white/10" />
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="rounded-2xl p-5 animate-pulse"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="h-3 w-32 rounded-full bg-white/10 mb-2" />
      <div className="h-2 w-48 rounded-full bg-white/10 mb-6" />
      <div className="h-48 rounded-xl bg-white/5" />
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
const ACCENTS = {
  sky:     { bg: "rgba(56,189,248,0.1)",  border: "rgba(56,189,248,0.2)",  text: "#7dd3fc" },
  emerald: { bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.2)",  text: "#6ee7b7" },
  red:     { bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.2)", text: "#fca5a5" },
  violet:  { bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.2)", text: "#c4b5fd" },
};

function StatCard({ label, value, sub, accent }) {
  const a = ACCENTS[accent];
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-1"
      style={{ background: a.bg, border: `1px solid ${a.border}` }}>
      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: a.text }}>{label}</p>
      <p className="text-3xl font-extrabold text-white leading-none mt-1">{value}</p>
      {sub && <p className="text-[11px] text-white/35 mt-1">{sub}</p>}
    </div>
  );
}

function Panel({ title, sub, children }) {
  return (
    <div className="rounded-2xl p-5"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="text-[13px] font-bold text-white">{title}</p>
      {sub && <p className="text-[11px] text-white/30 mt-0.5 mb-4">{sub}</p>}
      {!sub && <div className="mb-4" />}
      {children}
    </div>
  );
}

function ExportButton({ onClick, icon, label, color, disabled }) {
  const colors = {
    red:   { bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)", text: "#fca5a5", hover: "rgba(248,113,113,0.2)" },
    green: { bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.3)",  text: "#6ee7b7", hover: "rgba(52,211,153,0.2)" },
  };
  const c = colors[color];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.background = c.hover)}
      onMouseLeave={e => !disabled && (e.currentTarget.style.background = c.bg)}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Chart options ────────────────────────────────────────────────────────────
const gridColor    = "rgba(255,255,255,0.06)";
const tickColor    = "rgba(255,255,255,0.3)";
const tooltipStyle = {
  titleColor: "#fff", bodyColor: "rgba(255,255,255,0.7)",
  backgroundColor: "#0f2942", borderColor: "rgba(255,255,255,0.1)", borderWidth: 1,
};
const legendOpts = {
  labels: { color: "rgba(255,255,255,0.4)", font: { size: 11 }, boxWidth: 12, padding: 16 },
};
const axisStyle = {
  ticks: { color: tickColor, font: { size: 10 } },
  grid:  { color: gridColor },
  border: { display: false },
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [exporting, setExporting] = useState(false);
  const dashboardRef = useRef(null);

  useEffect(() => {
    getStats()
      .then((raw) => {
        setData({
          total_records:            raw.total_records            ?? 0,
          high_risk:                raw.high_risk                ?? 0,
          low_risk:                 raw.low_risk                 ?? 0,
          model_accuracy:           raw.model_accuracy           ?? 0,
          features_count:           raw.features_count           ?? 12,
          age_distribution:         raw.age_distribution         ?? [],
          risk_factors:             raw.risk_factors             ?? [],
          creatinine_distribution:  raw.creatinine_distribution  ?? [],
          gfr_distribution:         raw.gfr_distribution         ?? [],
          gender_distribution:      raw.gender_distribution      ?? [],
        });
      })
      .catch(() => setError("Failed to load stats — is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  // ── Export PDF ──────────────────────────────────────────────────────────────
  const handleExportPDF = () => {
    if (!data) return;
    setExporting(true);
    try {
      const pdf   = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const C = {
        dark: [10,30,50], sky: [56,189,248], emerald: [52,211,153],
        red: [248,113,113], violet: [167,139,250],
        white: [255,255,255], muted: [120,160,190], card: [18,50,78],
      };

      pdf.setFillColor(...C.dark);
      pdf.rect(0, 0, pageW, 38, "F");
      pdf.setFillColor(...C.sky);   pdf.rect(0, 0, pageW/3, 1.5, "F");
      pdf.setFillColor(...C.emerald); pdf.rect(pageW/3, 0, pageW/3, 1.5, "F");
      pdf.setFillColor(...C.violet);  pdf.rect((pageW/3)*2, 0, pageW/3, 1.5, "F");

      pdf.setFillColor(76, 209, 248);
      pdf.roundedRect(14, 8, 10, 10, 2, 2, "F");
      pdf.setTextColor(...C.dark); pdf.setFontSize(9); pdf.setFont("helvetica","bold");
      pdf.text("N", 17.5, 15);

      pdf.setTextColor(...C.white); pdf.setFontSize(18); pdf.setFont("helvetica","bold");
      pdf.text("NephroAI", 27, 14);
      pdf.setTextColor(...C.sky); pdf.setFontSize(7); pdf.setFont("helvetica","normal");
      pdf.text("KIDNEY DISEASE CLINICAL DASHBOARD", 27, 19);

      pdf.setTextColor(...C.muted); pdf.setFontSize(7);
      pdf.text(`Generated: ${new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"})}`, pageW-14, 10, {align:"right"});
      pdf.text(`Model: XGBoost  |  Accuracy: ${data.model_accuracy}%`, pageW-14, 15, {align:"right"});
      pdf.text(`Dataset: ${data.total_records} records`, pageW-14, 20, {align:"right"});

      pdf.setDrawColor(...C.sky); pdf.setLineWidth(0.3);
      pdf.line(14, 30, pageW-14, 30);
      pdf.setTextColor(...C.muted); pdf.setFontSize(7);
      pdf.text("Chronic Kidney Disease · AI-Powered Clinical Decision Support · PFA 2025–2026", 14, 35);

      let y = 48;

      // KPIs
      pdf.setTextColor(...C.sky); pdf.setFontSize(8); pdf.setFont("helvetica","bold");
      pdf.text("▸  KEY PERFORMANCE INDICATORS", 14, y); y += 5;
      const kpis = [
        {label:"TOTAL RECORDS", value:String(data.total_records), color:C.sky,     sub:"CKD dataset"},
        {label:"HIGH RISK",     value:String(data.high_risk),     color:C.red,     sub:`${Math.round(data.high_risk/data.total_records*100)}% of total`},
        {label:"LOW RISK",      value:String(data.low_risk),      color:C.emerald, sub:`${Math.round(data.low_risk/data.total_records*100)}% of total`},
        {label:"ACCURACY",      value:`${data.model_accuracy}%`,  color:C.violet,  sub:"XGBoost model"},
      ];
      const cardW = (pageW-28-9)/4;
      kpis.forEach((k,i) => {
        const x = 14 + i*(cardW+3);
        pdf.setFillColor(...C.card); pdf.roundedRect(x, y, cardW, 24, 3, 3, "F");
        pdf.setFillColor(...k.color); pdf.roundedRect(x, y, 2, 24, 1, 1, "F");
        pdf.setTextColor(...k.color); pdf.setFontSize(6); pdf.setFont("helvetica","bold");
        pdf.text(k.label, x+5, y+7);
        pdf.setTextColor(...C.white); pdf.setFontSize(14); pdf.setFont("helvetica","bold");
        pdf.text(k.value, x+5, y+16);
        pdf.setTextColor(...C.muted); pdf.setFontSize(6); pdf.setFont("helvetica","normal");
        pdf.text(k.sub, x+5, y+21);
      });
      y += 32;

      // Risk Factors
      pdf.setTextColor(...C.sky); pdf.setFontSize(8); pdf.setFont("helvetica","bold");
      pdf.text("▸  RISK FACTOR ANALYSIS", 14, y); y += 4;
      if (data.risk_factors?.length) {
        autoTable(pdf, {
          startY: y,
          head: [["Risk Factor","Impact %","Risk Level","Visual Bar"]],
          body: data.risk_factors.map(rf => {
            const level = rf.impact>=80?"🔴 HIGH":rf.impact>=60?"🟠 MEDIUM":"🟢 LOW";
            const bar = "█".repeat(Math.round(rf.impact/5))+"░".repeat(20-Math.round(rf.impact/5));
            return [rf.factor, `${rf.impact}%`, level, bar];
          }),
          headStyles: {fillColor:C.dark, textColor:C.sky, fontStyle:"bold", fontSize:8, cellPadding:3},
          bodyStyles: {fillColor:C.card, textColor:C.white, fontSize:8, cellPadding:3},
          alternateRowStyles: {fillColor:[15,41,66]},
          columnStyles: {
            0:{cellWidth:50}, 1:{cellWidth:22,halign:"center",fontStyle:"bold"},
            2:{cellWidth:30,halign:"center"}, 3:{cellWidth:"auto",font:"courier",fontSize:6,textColor:C.emerald},
          },
          didParseCell: h => {
            if (h.section==="body" && h.column.index===1) {
              const v = parseFloat(h.cell.raw);
              h.cell.styles.textColor = v>=80?C.red:v>=60?[251,146,60]:C.emerald;
            }
          },
          margin:{left:14,right:14}, tableLineColor:[30,60,90], tableLineWidth:0.1,
        });
        y = pdf.lastAutoTable.finalY + 8;
      }

      // Age Distribution
      if (y > 200) { pdf.addPage(); y = 20; }
      pdf.setTextColor(...C.sky); pdf.setFontSize(8); pdf.setFont("helvetica","bold");
      pdf.text("▸  AGE DISTRIBUTION", 14, y); y += 4;
      if (data.age_distribution?.length) {
        autoTable(pdf, {
          startY: y,
          head: [["Age Group","High Risk","Low Risk","Total","High Risk %"]],
          body: data.age_distribution.map(d => {
            const total = (d.high??0)+(d.low??0);
            return [d.age, d.high, d.low, total, `${total>0?Math.round(d.high/total*100):0}%`];
          }),
          headStyles: {fillColor:C.dark, textColor:C.sky, fontStyle:"bold", fontSize:8, cellPadding:3},
          bodyStyles: {fillColor:C.card, textColor:C.white, fontSize:8, cellPadding:3},
          alternateRowStyles: {fillColor:[15,41,66]},
          columnStyles: {
            0:{cellWidth:30,halign:"center"}, 1:{cellWidth:30,halign:"center",textColor:C.red,fontStyle:"bold"},
            2:{cellWidth:30,halign:"center",textColor:C.emerald,fontStyle:"bold"},
            3:{cellWidth:30,halign:"center"}, 4:{cellWidth:"auto",halign:"center",fontStyle:"bold"},
          },
          didParseCell: h => {
            if (h.section==="body" && h.column.index===4) {
              const v = parseFloat(h.cell.raw);
              h.cell.styles.textColor = v>=90?C.red:v>=70?[251,146,60]:C.emerald;
            }
          },
          margin:{left:14,right:14}, tableLineColor:[30,60,90], tableLineWidth:0.1,
        });
        y = pdf.lastAutoTable.finalY + 8;
      }

      // GFR Stages
      if (y > 200) { pdf.addPage(); y = 20; }
      pdf.setTextColor(...C.sky); pdf.setFontSize(8); pdf.setFont("helvetica","bold");
      pdf.text("▸  GFR STAGES (Kidney Function)", 14, y); y += 4;
      if (data.gfr_distribution?.length) {
        autoTable(pdf, {
          startY: y,
          head: [["GFR Stage","High Risk","Low Risk","Total","CKD Risk %"]],
          body: data.gfr_distribution.map(d => {
            const total = (d.high??0)+(d.low??0);
            return [d.stage, d.high, d.low, total, `${total>0?Math.round(d.high/total*100):0}%`];
          }),
          headStyles: {fillColor:C.dark, textColor:C.sky, fontStyle:"bold", fontSize:8, cellPadding:3},
          bodyStyles: {fillColor:C.card, textColor:C.white, fontSize:8, cellPadding:3},
          alternateRowStyles: {fillColor:[15,41,66]},
          columnStyles: {
            0:{cellWidth:45}, 1:{cellWidth:25,halign:"center",textColor:C.red,fontStyle:"bold"},
            2:{cellWidth:25,halign:"center",textColor:C.emerald,fontStyle:"bold"},
            3:{cellWidth:25,halign:"center"}, 4:{cellWidth:"auto",halign:"center",fontStyle:"bold"},
          },
          margin:{left:14,right:14}, tableLineColor:[30,60,90], tableLineWidth:0.1,
        });
        y = pdf.lastAutoTable.finalY + 8;
      }

      // Disclaimer
      if (y > 240) { pdf.addPage(); y = 20; }
      pdf.setFillColor(...C.card); pdf.roundedRect(14, y, pageW-28, 22, 3, 3, "F");
      pdf.setDrawColor(...C.violet); pdf.setLineWidth(0.3);
      pdf.roundedRect(14, y, pageW-28, 22, 3, 3, "S");
      pdf.setFillColor(...C.violet); pdf.roundedRect(14, y, 2, 22, 1, 1, "F");
      pdf.setTextColor(...C.violet); pdf.setFontSize(7); pdf.setFont("helvetica","bold");
      pdf.text("CLINICAL DISCLAIMER", 19, y+6);
      pdf.setTextColor(...C.muted); pdf.setFontSize(6.5); pdf.setFont("helvetica","normal");
      pdf.text("This report is generated by an AI-powered system for clinical decision support only.", 19, y+11);
      pdf.text("Results do not replace professional medical diagnosis. Always consult a qualified nephrologist.", 19, y+16);
      pdf.text(`Model: XGBoost  |  Accuracy: ${data.model_accuracy}%  |  Features: ${data.features_count}  |  Dataset: ${data.total_records} records`, 19, y+21);

      // Footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i=1; i<=totalPages; i++) {
        pdf.setPage(i);
        pdf.setFillColor(10,30,50); pdf.rect(0, pageH-12, pageW, 12, "F");
        pdf.setDrawColor(...C.sky); pdf.setLineWidth(0.2);
        pdf.line(14, pageH-12, pageW-14, pageH-12);
        pdf.setTextColor(...C.muted); pdf.setFontSize(6.5); pdf.setFont("helvetica","normal");
        pdf.text("NephroAI · Nephrology AI Module · PFA 2025–2026", 14, pageH-4);
        pdf.text(`Page ${i} / ${totalPages}`, pageW-14, pageH-4, {align:"right"});
      }

      pdf.save(`NephroAI_Dashboard_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  // ── Export Excel ────────────────────────────────────────────────────────────
  const handleExportExcel = () => {
    if (!data) return;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ["Metric","Value"],
      ["Total Records", data.total_records],
      ["High Risk", data.high_risk],
      ["Low Risk", data.low_risk],
      ["Model Accuracy", `${data.model_accuracy}%`],
      ["Features Count", data.features_count],
      ["Export Date", new Date().toLocaleDateString()],
    ]), "Summary");

    if (data.age_distribution?.length)
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ["Age Group","High Risk","Low Risk","Total"],
        ...data.age_distribution.map(d=>[d.age,d.high,d.low,(d.high??0)+(d.low??0)]),
      ]), "Age Distribution");

    if (data.risk_factors?.length)
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ["Factor","Impact (%)"],
        ...data.risk_factors.map(d=>[d.factor,d.impact]),
      ]), "Risk Factors");

    if (data.creatinine_distribution?.length)
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ["Range","High Risk","Low Risk","Total"],
        ...data.creatinine_distribution.map(d=>[d.range,d.high,d.low,(d.high??0)+(d.low??0)]),
      ]), "Creatinine");

    if (data.gfr_distribution?.length)
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ["GFR Stage","High Risk","Low Risk","Total"],
        ...data.gfr_distribution.map(d=>[d.stage,d.high,d.low,(d.high??0)+(d.low??0)]),
      ]), "GFR Stages");

    if (data.gender_distribution?.length)
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ["Gender","High Risk","Low Risk"],
        ...data.gender_distribution.map(d=>[d.gender,d.high,d.low]),
      ]), "Gender");

    XLSX.writeFile(wb, `CKD_Dashboard_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // ── Chart data ──────────────────────────────────────────────────────────────
  const ageDist     = data?.age_distribution        ?? [];
  const riskFactors = data?.risk_factors            ?? [];
  const creatDist   = data?.creatinine_distribution ?? [];
  const gfrDist     = data?.gfr_distribution        ?? [];
  const genderDist  = data?.gender_distribution     ?? [];

  const pieData = data ? {
    labels: ["High Risk","Low Risk"],
    datasets: [{
      data: [data.high_risk, data.low_risk],
      backgroundColor: ["#f87171","#34d399"],
      borderColor: ["#0f2942","#0f2942"],
      borderWidth: 3, hoverOffset: 6,
    }],
  } : null;

  const ageData = ageDist.length ? {
    labels: ageDist.map(d => d.age),
    datasets: [
      {label:"High Risk", data:ageDist.map(d=>d.high), backgroundColor:"rgba(248,113,113,0.8)", borderRadius:6},
      {label:"Low Risk",  data:ageDist.map(d=>d.low),  backgroundColor:"rgba(52,211,153,0.8)",  borderRadius:6},
    ],
  } : null;

  const factorsData = riskFactors.length ? {
    labels: riskFactors.map(d => d.factor),
    datasets: [{
      label: "Impact %",
      data: riskFactors.map(d => d.impact),
      backgroundColor: riskFactors.map(d =>
        d.impact>=80?"rgba(248,113,113,0.85)":d.impact>=60?"rgba(251,146,60,0.8)":"rgba(56,189,248,0.8)"
      ),
      borderRadius: 6,
    }],
  } : null;

  // ── Creatinine Chart ────────────────────────────────────────────────────────
  const creatData = creatDist.length ? {
    labels: creatDist.map(d => d.range),
    datasets: [
      {label:"High Risk", data:creatDist.map(d=>d.high), backgroundColor:"rgba(248,113,113,0.8)", borderRadius:6},
      {label:"Low Risk",  data:creatDist.map(d=>d.low),  backgroundColor:"rgba(52,211,153,0.8)",  borderRadius:6},
    ],
  } : null;

  // ── GFR Chart ───────────────────────────────────────────────────────────────
  const gfrData = gfrDist.length ? {
    labels: gfrDist.map(d => d.stage),
    datasets: [
      {label:"High Risk", data:gfrDist.map(d=>d.high), backgroundColor:"rgba(248,113,113,0.8)", borderRadius:6},
      {label:"Low Risk",  data:gfrDist.map(d=>d.low),  backgroundColor:"rgba(52,211,153,0.8)",  borderRadius:6},
    ],
  } : null;

  // ── Gender Chart ────────────────────────────────────────────────────────────
  const genderData = genderDist.length ? {
    labels: genderDist.map(d => d.gender),
    datasets: [
      {label:"High Risk", data:genderDist.map(d=>d.high), backgroundColor:"rgba(248,113,113,0.8)", borderRadius:6},
      {label:"Low Risk",  data:genderDist.map(d=>d.low),  backgroundColor:"rgba(52,211,153,0.8)",  borderRadius:6},
    ],
  } : null;

  const pieOpts  = {responsive:true, cutout:"62%", plugins:{legend:legendOpts, tooltip:tooltipStyle}};
  const barOpts  = {responsive:true, plugins:{legend:legendOpts, tooltip:tooltipStyle}, scales:{x:axisStyle, y:axisStyle}};
  const hBarOpts = {
    indexAxis:"y", responsive:true,
    plugins:{legend:{display:false}, tooltip:tooltipStyle},
    scales:{x:{...axisStyle,min:0,max:100}, y:{...axisStyle,grid:{display:false}}},
  };

  const canExport = !loading && !!data;

  return (
    <div className="min-h-screen text-white"
      style={{ background: "linear-gradient(135deg, #0f2942 0%, #0d3d56 50%, #0a4a4a 100%)" }}>

      <div className="fixed top-[-100px] left-[-100px] w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(56,189,248,0.07), transparent 70%)" }} />

      <div ref={dashboardRef} className="relative max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span className="text-sky-300 text-[10px] font-bold uppercase tracking-widest">BI Dashboard</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Clinical{" "}
              <span style={{background:"linear-gradient(90deg,#38bdf8,#34d399)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>
                Statistics
              </span>
            </h1>
            <p className="text-white/30 text-[12px] mt-1">
              Live data · CKD Dataset · {data ? `${data.total_records} records` : "..."}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-1 shrink-0">
            <ExportButton onClick={handleExportExcel} disabled={!canExport} color="green" label="Export Excel"
              icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18"/></svg>}
            />
            <ExportButton onClick={handleExportPDF} disabled={!canExport||exporting} color="red" label={exporting?"Generating...":"Export PDF"}
              icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9l-5-6H7a2 2 0 00-2 2v14a2 2 0 002 2z"/><path strokeLinecap="round" strokeLinejoin="round" d="M14 3v6h6M9 13h6M9 17h4"/></svg>}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
            <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-[12px] text-red-300">{error}</p>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {loading ? [1,2,3,4].map(i=><SkeletonCard key={i}/>) : data ? (
            <>
              <StatCard label="Total Records"  value={data.total_records} sub="CKD dataset" accent="sky"/>
              <StatCard label="High Risk"      value={data.high_risk}
                sub={`${Math.round(data.high_risk/data.total_records*100)}% of total`} accent="red"/>
              <StatCard label="Low Risk"       value={data.low_risk}
                sub={`${Math.round(data.low_risk/data.total_records*100)}% of total`} accent="emerald"/>
              <StatCard label="Model Accuracy" value={`${data.model_accuracy}%`} sub="XGBoost ✦" accent="violet"/>
            </>
          ) : null}
        </div>

        {/* Row 1 — Pie + Risk Factors */}
        <div className="grid grid-cols-2 gap-5 mb-5">
          {loading ? <><SkeletonChart/><SkeletonChart/></> : data ? (
            <>
              <Panel title="Risk Distribution" sub="High Risk vs Low Risk patients">
                {pieData && <Doughnut data={pieData} options={pieOpts}/>}
              </Panel>
              <Panel title="Risk Factor Impact" sub="% of high-risk cases per factor">
                {factorsData && <Bar data={factorsData} options={hBarOpts}/>}
              </Panel>
            </>
          ) : null}
        </div>

        {/* Row 2 — Creatinine + GFR */}
        <div className="grid grid-cols-2 gap-5 mb-5">
          {loading ? <><SkeletonChart/><SkeletonChart/></> : data ? (
            <>
              <Panel title="Creatinine Levels" sub="High Risk vs Low Risk by Creatinine range (mg/dL)">
                {creatData && <Bar data={creatData} options={barOpts}/>}
              </Panel>
              <Panel title="GFR Stages" sub="Kidney function stages — High Risk vs Low Risk">
                {gfrData && <Bar data={gfrData} options={barOpts}/>}
              </Panel>
            </>
          ) : null}
        </div>

        {/* Row 3 — Age + Gender */}
        <div className="grid grid-cols-2 gap-5 mb-6">
          {loading ? <><SkeletonChart/><SkeletonChart/></> : data ? (
            <>
              <Panel title="Age Distribution" sub="High Risk vs Low Risk by age group">
                {ageData && <Bar data={ageData} options={barOpts}/>}
              </Panel>
              <Panel title="Gender Distribution" sub="Risk distribution by gender">
                {genderData && <Bar data={genderData} options={barOpts}/>}
              </Panel>
            </>
          ) : null}
        </div>

        <p className="text-center text-[10px] text-white/15 uppercase tracking-widest">
          Nephrology AI Module · PFA 2025–2026 · XGBoost ✦
        </p>
      </div>
    </div>
  );
}