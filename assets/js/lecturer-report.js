// assets/js/lecturer-report.js

async function loadJsPDF() {
  if (window.jsPDF) return window.jsPDF;
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => {
      if (window.jspdf && window.jspdf.jsPDF) {
        window.jsPDF = window.jspdf.jsPDF;
        resolve(window.jsPDF);
      } else {
        reject(new Error("jsPDF object not found"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load jsPDF"));
    document.head.appendChild(script);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const lecturerLink = document.getElementById("lecturerReportLink");
  const modal = document.getElementById("lecturerReportModal");
  const cancelBtn = document.getElementById("cancelReportBtn");
  const generateBtn = document.getElementById("generateReportBtn");

  if (!(lecturerLink && modal && cancelBtn && generateBtn)) return;

  lecturerLink.addEventListener("click", (e) => {
    e.preventDefault();
    modal.style.display = "flex";
  });

  cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  generateBtn.addEventListener("click", async () => {
    const startDate = document.getElementById("reportStartDate").value;
    const endDate = document.getElementById("reportEndDate").value;
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }
    if (startDate > endDate) {
      alert("Start date cannot be after end date");
      return;
    }

    const payload = {
      startDate,
      endDate,
      includeTop5: document.getElementById("includeTop5").checked,
      includeInactive: document.getElementById("includeInactive").checked,
      includeRecommendations: document.getElementById("includeRecommendations").checked,
    };

    console.log("📦 Sending report payload:", payload);

    try {
      const response = await fetch(
        "https://18ygiad1a8.execute-api.us-east-1.amazonaws.com/dev/LecturerReport",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      let rawResult = await response.json();
      let result = rawResult;
      if (typeof rawResult.body === "string") {
        try {
          result = JSON.parse(rawResult.body);
        } catch (e) {
          console.error("❌ Failed to parse Lambda body:", e);
          alert("שגיאה בפענוח תגובת השרת");
          return;
        }
      }

      if (!response.ok) {
        alert(`שגיאה בשרת: ${response.status}`);
        return;
      }

      const jsPDF = await loadJsPDF();
      const doc = new jsPDF();
      let currentY = 15;

      doc.setFont("times", "bold");
      doc.setFontSize(18);
      doc.text("LECTURER REPORT", 105, currentY, { align: "center" });
      currentY += 10;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(`${result.range?.start || 'N/A'} to ${result.range?.end || 'N/A'}`, 105, currentY, { align: "center" });
      currentY += 10;

      if (result.top5?.length) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Top 5 Most Active Students:", 10, currentY);
        currentY += 7;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        result.top5.forEach(u => {
          doc.text(`• ${u.email} — ${u.count} questions`, 10, currentY);
          currentY += 7;
        });
        currentY += 5;
      }

      if (result.inactiveUsers?.length) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Inactive Students (Less than 5 questions):", 10, currentY);
        currentY += 7;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        result.inactiveUsers.forEach(u => {
          doc.text(`• ${u.email} — ${u.count} questions`, 10, currentY);
          currentY += 7;
        });
        currentY += 5;
      }

      if (result.recommendations) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Lecturer Recommendations:", 10, currentY);
        currentY += 7;

        doc.setDrawColor(0);
        doc.line(10, currentY, 200, currentY);
        currentY += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        const lines = doc.splitTextToSize(result.recommendations.trim(), 180);
        lines.forEach(line => {
          doc.text(line, 10, currentY);
          currentY += 7;
        });
      }

      doc.save("lecturer-report.pdf");
      modal.style.display = "none";
      console.log("✅ PDF generated successfully");

    } catch (error) {
      console.error("❌ Error calling LecturerReport API:", error);
      alert("Error calling report API. See console.");
    }
  });
});
