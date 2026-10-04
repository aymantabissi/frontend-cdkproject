import jsPDF from "jspdf";

const generatePDF = (prediction, stats, form) => {
  const isHigh = prediction === "high";

  const doc  = new jsPDF();
  const date = new Date().toLocaleDateString("en-GB");
  const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  // ─── HEADER ───────────────────────────────────────────────────────────────
  doc.setFillColor(15, 41, 66);
  doc.rect(0, 0, 210, 40, "F");

  // Gradient strip
  doc.setFillColor(56, 189, 248);
  doc.rect(0, 0, 70, 1.5, "F");
  doc.setFillColor(52, 211, 153);
  doc.rect(70, 0, 70, 1.5, "F");
  doc.setFillColor(124, 58, 237);
  doc.rect(140, 0, 70, 1.5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("NephroAI", 20, 14);

  doc.setFontSize(8);
  doc.setTextColor(125, 211, 252);
  doc.text("Kidney Disease Risk Report", 20, 20);

  doc.setTextColor(150, 180, 200);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${date} at ${time}`, 20, 27);
  doc.text("Model: XGBoost \u2736  |  For clinical decision support only", 20, 33);

  // ─── PATIENT INFO CARD ────────────────────────────────────────────────────
  const patientName = form.patient_name || "N/A";

  doc.setFillColor(18, 50, 78);
  doc.roundedRect(15, 48, 180, 20, 3, 3, "F");

  // left bar color
  doc.setFillColor(isHigh ? 248 : 52, isHigh ? 113 : 211, isHigh ? 113 : 153);
  doc.roundedRect(15, 48, 2, 20, 1, 1, "F");

  doc.setTextColor(150, 180, 200);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("PATIENT", 20, 55);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(patientName, 20, 63);

  // right side — risk badge
  const badgeColor = isHigh ? [248, 113, 113] : [52, 211, 153];
  doc.setFillColor(...badgeColor.map(v => Math.min(255, v * 0.25)));
  doc.roundedRect(140, 52, 50, 12, 3, 3, "F");
  doc.setTextColor(...badgeColor);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(isHigh ? "\u26A0 HIGH RISK" : "\u2713 LOW RISK", 165, 60, { align: "center" });

  // ─── RISK STATS ───────────────────────────────────────────────────────────
  if (stats) {
    doc.setFillColor(18, 50, 78);
    doc.roundedRect(15, 75, 87, 22, 3, 3, "F");
    doc.roundedRect(108, 75, 87, 22, 3, 3, "F");

    doc.setFillColor(isHigh ? 248 : 52, isHigh ? 113 : 211, isHigh ? 113 : 153);
    doc.roundedRect(15, 75, 2, 22, 1, 1, "F");
    doc.roundedRect(108, 75, 2, 22, 1, 1, "F");

    doc.setTextColor(isHigh ? 248 : 52, isHigh ? 113 : 211, isHigh ? 113 : 153);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`${stats.risk_percent}%`, 58,  88, { align: "center" });
    doc.text(`${stats.confidence}%`,   151, 88, { align: "center" });

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 150, 180);
    doc.text("RISK SCORE",  58,  93, { align: "center" });
    doc.text("CONFIDENCE",  151, 93, { align: "center" });
  }

  // ─── CLINICAL DATA TABLE ──────────────────────────────────────────────────
  doc.setFillColor(13, 61, 86);
  doc.rect(15, 104, 180, 8, "F");
  doc.setTextColor(56, 189, 248);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("CLINICAL DATA", 18, 110);

  const fields = [
    ["Age",              (form.age         || "—") + " years"],
    ["Blood Pressure",   (form.bp          || "—") + " mmHg"],
    ["Creatinine",       (form.creatinine  || "—") + " mg/dL"],
    ["Blood Urea",       (form.urea        || "—") + " mg/dL"],
    ["Hemoglobin",       (form.hemoglobin  || "—") + " g/dL"],
    ["Sodium",           (form.sodium      || "—") + " mEq/L"],
    ["Potassium",        (form.potassium   || "—") + " mEq/L"],
    ["Protein in Urine", form.protein      === "1" ? "Positive" : "Negative"],
    ["Glucose in Urine", form.glucose      === "1" ? "Positive" : "Negative"],
    ["RBC in Urine",     form.rbc          === "1" ? "Positive" : "Negative"],
    ["Diabetes History", form.diabetes     === "1" ? "Yes" : "No"],
    ["Hypertension",     form.hypertension === "1" ? "Yes" : "No"],
  ];

  let y = 118;
  fields.forEach(([lbl, val], i) => {
    if (i % 2 === 0) {
      doc.setFillColor(18, 45, 72);
      doc.rect(15, y - 5, 180, 8, "F");
    }
    doc.setTextColor(120, 160, 190);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(lbl, 20, y);

    // color للـ positive values
    const isPositive = ["Positive", "Yes"].includes(val);
    const isNegative = ["Negative", "No"].includes(val);
    doc.setTextColor(
      isPositive ? 248 : isNegative ? 52 : 255,
      isPositive ? 113 : isNegative ? 211 : 255,
      isPositive ? 113 : isNegative ? 153 : 255
    );
    doc.setFont("helvetica", "bold");
    doc.text(String(val), 130, y);
    y += 8;
  });

  // ─── RECOMMENDATION ───────────────────────────────────────────────────────
  y += 4;
  const recText = isHigh
    ? "Further clinical evaluation is strongly recommended. Please consult a nephrologist immediately."
    : "Lab values are within acceptable range. Continue routine monitoring and maintain a healthy lifestyle.";

  doc.setFillColor(18, 50, 78);
  doc.roundedRect(15, y, 180, 26, 3, 3, "F");
  doc.setFillColor(isHigh ? 248 : 52, isHigh ? 113 : 211, isHigh ? 113 : 153);
  doc.roundedRect(15, y, 2, 26, 1, 1, "F");

  doc.setTextColor(isHigh ? 248 : 52, isHigh ? 113 : 211, isHigh ? 113 : 153);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("CLINICAL RECOMMENDATION", 20, y + 8);

  doc.setTextColor(200, 220, 235);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(doc.splitTextToSize(recText, 168), 20, y + 15);

  // ─── FOOTER ───────────────────────────────────────────────────────────────
  doc.setFillColor(10, 30, 50);
  doc.rect(0, 282, 210, 15, "F");
  doc.setDrawColor(56, 189, 248);
  doc.setLineWidth(0.2);
  doc.line(15, 282, 195, 282);
  doc.setTextColor(80, 120, 150);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`Patient: ${patientName}  |  NephroAI \u00B7 XGBoost \u2736  |  PFA 2025\u20132026`, 105, 290, { align: "center" });

  doc.save(`NephroAI_${patientName.replace(/\s+/g, "_")}_${date.replace(/\//g, "-")}.pdf`);
};

export default generatePDF;