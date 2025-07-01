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
      result = JSON.parse(result);
    } else if (typeof result.body === "string") {
      result = JSON.parse(result.body);
    } else if (typeof result.body === "object") {
      result = result.body;
    }

    console.log("📊 Raw LecturerReport result:", result);

    const topicsData = result.topTopicsPerCourse || {
      Networking: [],
      "C#": [],
    };

    // ✅ Top Topics – Networking
    destroyChart("chart-topics-networking");
    const ctxNetworking = document
      .getElementById("chart-topics-networking")
      .getContext("2d");
    activeCharts["chart-topics-networking"] = new Chart(ctxNetworking, {
      type: "bar",
      data: {
        labels: topicsData.Networking.map(([t]) =>
          t.length > 20 ? t.slice(0, 20) + "…" : t
        ),
        datasets: [
          {
            label: "Networking",
            data: topicsData.Networking.map(([_, count]) => count),
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              title: function (context) {
                const index = context[0].dataIndex;
                return topicsData.Networking[index][0];
              },
            },
          },
        },
      },
    });

    // ✅ Top Topics – C#
    destroyChart("chart-topics-csharp");
    const ctxCsharp = document
      .getElementById("chart-topics-csharp")
      .getContext("2d");
    activeCharts["chart-topics-csharp"] = new Chart(ctxCsharp, {
      type: "bar",
      data: {
        labels: topicsData["C#"].map(([t]) =>
          t.length > 20 ? t.slice(0, 20) + "…" : t
        ),
        datasets: [
          {
            label: "C#",
            data: topicsData["C#"].map(([_, count]) => count),
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              title: function (context) {
                const index = context[0].dataIndex;
                return topicsData["C#"][index][0];
              },
            },
          },
        },
      },
    });

    // ✅ Frequent Questions
    let fq = result.frequentQuestions || [];
    while (fq.length < 5) fq.push({ question: "", count: 0 });

    destroyChart("chart-frequent-questions");
    const ctxFreq = document
      .getElementById("chart-frequent-questions")
      .getContext("2d");

    activeCharts["chart-frequent-questions"] = new Chart(ctxFreq, {
      type: "bar",
      data: {
        labels: fq.map(() => ""),
        datasets: [
          {
            label: "Occurrences",
            data: fq.map((x) => x.count),
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              title: function (context) {
                const index = context[0].dataIndex;
                return fq[index].question || "N/A";
              },
            },
          },
        },
        scales: {
          x: { ticks: { display: false } },
        },
      },
    });

    // ✅ Top 5 Students
    let top5 = result.top5 || [];
    const cardTop5 = document.getElementById("card-top5");
    while (top5.length < 5) top5.push({ name: "", count: 0 });

    destroyChart("chart-top5");
    const ctxTop5 = document.getElementById("chart-top5").getContext("2d");
    activeCharts["chart-top5"] = new Chart(ctxTop5, {
      type: "bar",
      data: {
        labels: top5.map((x) => x.name),
        datasets: [{ label: "Questions", data: top5.map((x) => x.count) }],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } },
      },
    });
    cardTop5.classList.remove("d-none");

    // ✅ Inactive Users
    let inactive = result.inactiveUsers || [];
    const cardInactive = document.getElementById("card-inactive");
    while (inactive.length < 5) inactive.push({ name: "", count: 0 });

    destroyChart("chart-inactive");
    const ctxInact = document.getElementById("chart-inactive").getContext("2d");
    activeCharts["chart-inactive"] = new Chart(ctxInact, {
      type: "bar",
      data: {
        labels: inactive.map((x) => x.name),
        datasets: [
          { label: "Questions (<5)", data: inactive.map((x) => x.count) },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        plugins: { legend: { position: "bottom" } },
      },
    });
    cardInactive.classList.remove("d-none");

    // ✅ Recommendations
    const recBox = document.getElementById("recommendations-box");
    const recCard = document.getElementById("card-recommendations");
    if (result.recommendations) {
      recBox.textContent = result.recommendations;
      recCard.classList.remove("d-none");
    } else {
      recCard.classList.add("d-none");
    }
  } catch (err) {
    console.error("Failed to load lecturer stats:", err);
    alert("Error loading stats. See console.");
  }
}

window.addEventListener("load", () => {
  fetchStudents();

  // 📅 Set default date range: from 01/04/2025 to today
  const today = new Date();
  const endDate = today.toISOString().split("T")[0];
  const startDate = "2025-04-01";

  document.getElementById("start-date").value = startDate;
  document.getElementById("end-date").value = endDate;

  // 🔄 Load initial stats automatically
  loadLecturerStats();

  // 🧠 Allow refresh via button
  document
    .getElementById("load-stats")
    ?.addEventListener("click", loadLecturerStats);
});
