// pages-teacher.js

let dataTable;
let activeCharts = {};

// 🔄 Reset chart helper
function destroyChart(id) {
  if (activeCharts[id]) {
    activeCharts[id].destroy();
    delete activeCharts[id];
  }
}

/**
 * Fetches students from Lambda, renders them
 * into the table, and updates the total counter.
 */
async function fetchStudents() {
  let table = document.getElementById("students-table");
  if (!table) {
    console.debug("📋 #students-table not found, trying .datatable selector…");
    table = document.querySelector("table.datatable");
  }

  const totalEl = document.getElementById("total-students");

  if (!table || !totalEl) {
    console.warn("⚠️ Table or total counter not found—skipping student fetch.");
    return;
  }

  let tbody = table.querySelector("tbody");
  if (!tbody) {
    console.debug("🛠️ <tbody> missing—creating one.");
    tbody = document.createElement("tbody");
    table.appendChild(tbody);
  }

  const apiUrl =
    "https://18ygiad1a8.execute-api.us-east-1.amazonaws.com/dev/getAllStudents";

  try {
    const resp = await fetch(apiUrl);
    if (!resp.ok) throw new Error(`API error ${resp.status}`);

    const payload = await resp.json();
    let students = Array.isArray(payload)
      ? payload
      : typeof payload.body === "string"
      ? JSON.parse(payload.body)
      : payload.body;
    if (!Array.isArray(students))
      throw new Error("Expected an array of students");

    tbody.innerHTML = "";
    students.forEach((s, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${s.Name || "N/A"}</td>
        <td>${s.Email || "N/A"}</td>
        <td>${s.Phone || "N/A"}</td>
        <td>${s.About || "N/A"}</td>
        <td>${
          s["linkedin profile"]
            ? `<a href="${s["linkedin profile"]}" target="_blank">LinkedIn</a>`
            : "N/A"
        }</td>
      `;
      tbody.appendChild(tr);
    });

    if (dataTable) dataTable.destroy();
    dataTable = new simpleDatatables.DataTable(table, {
      perPageSelect: [5, 10, 15, ["All", -1]],
    });

    totalEl.textContent = students.length;
  } catch (err) {
    console.error("Error fetching students:", err);
  }
}

/**
 * Load lecturer stats and render charts based on selected filters.
 */
async function loadLecturerStats() {
  const start = document.getElementById("start-date").value;
  const end = document.getElementById("end-date").value;
  const includeTop5 = document.getElementById("includeTop5").checked;
  const includeInactive = document.getElementById("includeInactive").checked;
  const includeRecommendations = document.getElementById(
    "includeRecommendations"
  ).checked;

  if (!start || !end) return alert("Please select both start and end dates.");

  const apiUrl =
    "https://18ygiad1a8.execute-api.us-east-1.amazonaws.com/dev/LecturerReport";
  const payload = {
    startDate: start,
    endDate: end,
    includeTop5,
    includeInactive,
    includeRecommendations,
  };

  try {
    const resp = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    let result = await resp.json();
    if (typeof result === "string") {
      result = JSON.parse(result); // אם השרת החזיר מחרוזת – נפרש ידנית
    } else if (typeof result.body === "string") {
      result = JSON.parse(result.body);
    } else if (typeof result.body === "object") {
      result = result.body;
    }

    console.log("📊 Raw LecturerReport result:", result);

    // ✅ Top Topics per Course
    const topicsData = result.topTopicsPerCourse || {
      Networking: [],
      "C#": [],
    };
    const topLabels = [];
    const networking = [];
    const csharp = [];
    const allTopics = new Set();

    topicsData.Networking.forEach(([topic, count]) => {
      allTopics.add(topic);
    });
    topicsData["C#"].forEach(([topic, count]) => {
      allTopics.add(topic);
    });

    allTopics.forEach((topic) => {
      topLabels.push(topic);
      const net = topicsData.Networking.find(([t]) => t === topic);
      const csh = topicsData["C#"].find(([t]) => t === topic);
      networking.push(net ? net[1] : 0);
      csharp.push(csh ? csh[1] : 0);
    });

    destroyChart("chart-topics");
    const ctxTopics = document.getElementById("chart-topics").getContext("2d");
    activeCharts["chart-topics"] = new Chart(ctxTopics, {
      type: "bar",
      data: {
        labels: topLabels,
        datasets: [
          { label: "Networking", data: networking },
          { label: "C#", data: csharp },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } },
      },
    });

    // ✅ Frequent Questions
    const fq = result.frequentQuestions;
    destroyChart("chart-frequent-questions");
    const ctxFreq = document
      .getElementById("chart-frequent-questions")
      .getContext("2d");
    activeCharts["chart-frequent-questions"] = new Chart(ctxFreq, {
      type: "bar",
      data: {
        labels: fq.map((x) => x.question),
        datasets: [{ label: "Occurrences", data: fq.map((x) => x.count) }],
      },
    });

    // ✅ Top 5 Students
    const top5 = result.top5 || [];
    const cardTop5 = document.getElementById("card-top5");
    if (top5.length > 0) {
      destroyChart("chart-top5");
      const ctxTop5 = document.getElementById("chart-top5").getContext("2d");
      activeCharts["chart-top5"] = new Chart(ctxTop5, {
        type: "bar",
        data: {
          labels: top5.map((x) => x.name),
          datasets: [{ label: "Questions", data: top5.map((x) => x.count) }],
        },
      });
      cardTop5.classList.remove("d-none");
    } else cardTop5.classList.add("d-none");

    // ✅ Inactive Users
    const inactive = result.inactiveUsers || [];
    const cardInactive = document.getElementById("card-inactive");
    if (inactive.length > 0) {
      destroyChart("chart-inactive");
      const ctxInact = document
        .getElementById("chart-inactive")
        .getContext("2d");
      activeCharts["chart-inactive"] = new Chart(ctxInact, {
        type: "bar",
        data: {
          labels: inactive.map((x) => x.name),
          datasets: [
            { label: "Questions (<5)", data: inactive.map((x) => x.count) },
          ],
        },
        options: { indexAxis: "y" },
      });
      cardInactive.classList.remove("d-none");
    } else cardInactive.classList.add("d-none");

    // ✅ Recommendations
    const recBox = document.getElementById("recommendations-box");
    const recCard = document.getElementById("card-recommendations");
    if (result.recommendations) {
      recBox.textContent = result.recommendations;
      recCard.classList.remove("d-none");
    } else recCard.classList.add("d-none");
  } catch (err) {
    console.error("Failed to load lecturer stats:", err);
    alert("Error loading stats. See console.");
  }
}

window.addEventListener("load", () => {
  fetchStudents();

  // 📅 Set default date range: last 30 days
  const today = new Date();
  const endDate = today.toISOString().split("T")[0];

  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const startDate = lastMonth.toISOString().split("T")[0];

  document.getElementById("start-date").value = startDate;
  document.getElementById("end-date").value = endDate;

  // 🔄 Load initial stats automatically
  loadLecturerStats();

  // 🧠 Allow refresh via button
  document
    .getElementById("load-stats")
    ?.addEventListener("click", loadLecturerStats);
});
