// pages-teacher.js

let dataTable;
let activeCharts = {};

// Helper: Destroy existing chart
const destroyChart = (id) => {
  if (activeCharts[id]) {
    activeCharts[id].destroy();
    delete activeCharts[id];
  }
};

// Helper: Split label into multiple lines by words
function splitLabelByWords(label, wordsPerLine = 2) {
  const words = label.split(" ");
  let lines = [];
  for (let i = 0; i < words.length; i += wordsPerLine) {
    lines.push(words.slice(i, i + wordsPerLine).join(" "));
  }
  return lines;
}

// Helper: Setup full legend popup for detailed breakdown
// פונקציה ל־popup legend
function setupFullLegendPopup(allSubtopics, colorMap, subtopicTotals) {
  const legendBtn = document.getElementById("legendBtn");
  const legendPopup = document.getElementById("legendPopup");
  if (!legendBtn || !legendPopup) return;

  function positionPopup() {
    const rect = legendBtn.getBoundingClientRect();
    legendPopup.style.top = rect.bottom + 8 + "px"; // 8px below button
    // Try to keep within screen:
    let left = rect.left;
    if (left + legendPopup.offsetWidth > window.innerWidth - 16) {
      left = window.innerWidth - legendPopup.offsetWidth - 16;
    }
    legendPopup.style.left = left + "px";
    legendPopup.style.right = "auto";
  }

  legendBtn.onclick = function (e) {
    e.stopPropagation();
    const legendHtml = allSubtopics
      .sort((a, b) => subtopicTotals[b] - subtopicTotals[a])
      .map(
        (sub) =>
          `<div class="legend-row">
            <span class="legend-color" style="background:${
              colorMap[sub] || "#eee"
            }"></span>
            <span>${sub}</span>
            <span style="color:#888; font-size:11px; margin-left:8px;">(${
              subtopicTotals[sub]
            })</span>
          </div>`
      )
      .join("");
    legendPopup.innerHTML = legendHtml;
    legendPopup.style.display =
      legendPopup.style.display === "block" ? "none" : "block";
    if (legendPopup.style.display === "block") {
      positionPopup();
      // Stay positioned when scrolling/resizing
      window.addEventListener("scroll", positionPopup);
      window.addEventListener("resize", positionPopup);
    } else {
      window.removeEventListener("scroll", positionPopup);
      window.removeEventListener("resize", positionPopup);
    }
    // Hide on click outside
    document.addEventListener("click", function docListener(ev) {
      if (!legendPopup.contains(ev.target) && ev.target !== legendBtn) {
        legendPopup.style.display = "none";
        window.removeEventListener("scroll", positionPopup);
        window.removeEventListener("resize", positionPopup);
        document.removeEventListener("click", docListener);
      }
    });
  };
}

// Helper: Show error messages clearly
const showError = (msg) => {
  const errorBox = document.getElementById("error-box");
  errorBox.textContent = msg;
  errorBox.style.display = "block";
};

// Helper: Hide error messages
const hideError = () => {
  const errorBox = document.getElementById("error-box");
  errorBox.style.display = "none";
};

// Helper: Toggle loading spinner
function toggleLoader(show) {
  const loader = document.getElementById("loader");
  loader.hidden = !show;
  // Optionally hide other stats content while loading
  document.querySelectorAll(".stats-content").forEach((el) => {
    el.hidden = show;
  });
}

// Fetch students and render table
async function fetchStudents() {
  const table = document.querySelector("#students-table");
  const totalEl = document.getElementById("total-students");
  const tbody =
    table.querySelector("tbody") ||
    table.appendChild(document.createElement("tbody"));

  toggleLoader(true);
  hideError();

  try {
    const resp = await fetch(
      "https://18ygiad1a8.execute-api.us-east-1.amazonaws.com/dev/getAllStudents"
    );
    if (!resp.ok) throw new Error(`API error ${resp.status}`);

    const payload = await resp.json();
    const students = Array.isArray(payload)
      ? payload
      : JSON.parse(payload.body || payload);

    tbody.innerHTML = students
      .map(
        (s, i) => `
      <tr>
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
      </tr>
    `
      )
      .join("");

    if (dataTable) dataTable.destroy();
    dataTable = new simpleDatatables.DataTable(table, {
      perPageSelect: [5, 10, 15, ["All", -1]],
    });

    totalEl.textContent = students.length;
  } catch (err) {
    console.error(err);
    showError("Unable to load students. Please try again later.");
  } finally {
    toggleLoader(false);
  }
}

// Render a bar chart given data
function renderBarChart(chartId, labels, values, label, indexAxis = "x") {
  destroyChart(chartId);
  const ctx = document.getElementById(chartId).getContext("2d");

  activeCharts[chartId] = new Chart(ctx, {
    type: "bar",
    data: { labels, datasets: [{ label, data: values }] },
    options: {
      indexAxis,
      responsive: true,
      plugins: { legend: { position: "bottom" } },
    },
  });
}

// Render a line chart
function renderLineChart(chartId, labels, data) {
  destroyChart(chartId);
  const ctx = document.getElementById(chartId).getContext("2d");

  activeCharts[chartId] = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          data,
          borderWidth: 2,
          tension: 0.3,
          fill: false,
          borderColor: "rgba(54, 162, 235, 1)",
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { x: { ticks: { maxRotation: 45 } }, y: { beginAtZero: true } },
    },
  });
}

// Render frequent questions chart
function renderFrequentQuestionsChart(chartId, frequentQuestions) {
  destroyChart(chartId);
  const ctx = document.getElementById(chartId).getContext("2d");

  activeCharts[chartId] = new Chart(ctx, {
    type: "bar",
    data: {
      labels: frequentQuestions.map(() => ""), // Hide labels completely
      datasets: [
        {
          label: "Occurrences",
          data: frequentQuestions.map((q) => q.count),
          backgroundColor: "#90caf9",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            title: (context) =>
              frequentQuestions[context[0].dataIndex].question || "N/A",
          },
        },
      },
      scales: { x: { ticks: { display: false } } }, // Hide ticks explicitly
    },
  });
}

function renderQuestionsOverTimeByStudentChart(
  studentData,
  chartId = "studentChart"
) {
  destroyChart(chartId);
  const ctx = document.getElementById(chartId).getContext("2d");
  const labels = studentData.map((d) => d.date);
  const data = studentData.map((d) => d.count);

  activeCharts[chartId] = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Questions",
          data,
          borderWidth: 2,
          tension: 0.3,
          fill: false,
          borderColor: "rgba(255, 99, 132, 1)",
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { maxRotation: 45, minRotation: 45 } },
        y: { beginAtZero: true },
      },
    },
  });
}

// Render topic breakdown chart as a stacked bar (only top 7 subtopics overall + "Other" in legend)
function renderTopicBreakdownChart(chartId, breakdownData) {
  destroyChart(chartId);
  const ctx = document.getElementById(chartId).getContext("2d");

  // Step 1: Top 5 topics with most questions
  const topics = Object.entries(breakdownData)
    .map(([topic, subtopics]) => ({
      topic,
      total: Object.values(subtopics).reduce((sum, val) => sum + val, 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((x) => x.topic);

  // Step 2: For each topic, get its top 7 subtopics, others to "Other"
  const subtopicSet = new Set();
  const topicToTopSubs = {};
  const topicToOtherCount = {};
  topics.forEach((topic) => {
    const subtopicCounts = Object.entries(breakdownData[topic] || {}).sort(
      (a, b) => b[1] - a[1]
    );
    const topSubs = subtopicCounts.slice(0, 7).map(([sub]) => sub);
    topSubs.forEach((sub) => subtopicSet.add(sub));
    topicToTopSubs[topic] = topSubs;
    topicToOtherCount[topic] = subtopicCounts
      .slice(7)
      .reduce((sum, [, count]) => sum + count, 0);
  });
  const allTopSubs = Array.from(subtopicSet);

  // Step 3: Calculate totals per subtopic (for legend and popup)
  const subtopicTotals = {};
  topics.forEach((topic) => {
    Object.entries(breakdownData[topic] || {}).forEach(([sub, count]) => {
      subtopicTotals[sub] = (subtopicTotals[sub] || 0) + count;
    });
  });

  // Step 4: Select the 10 most common subtopics overall for the legend
  const legendSubs = Object.entries(subtopicTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([sub]) => sub);

  // Step 5: Assign colors, reusing palette if needed
  const palette = [
    "#4dc9f6",
    "#f67019",
    "#f53794",
    "#537bc4",
    "#acc236",
    "#166a8f",
    "#00a950",
    "#58595b",
    "#8549ba",
    "#e8c3b9",
    "#d4a6c8",
    "#c6e377",
    "#ffd166",
    "#33b679",
    "#ff6d00",
  ];
  const colorMap = {};
  allTopSubs.forEach((sub, i) => (colorMap[sub] = palette[i % palette.length]));
  colorMap["Other"] = "#cccccc";

  // Step 6: Datasets for each unique subtopic (if in any top7)
  const datasets = allTopSubs.map((sub, i) => ({
    label: sub,
    data: topics.map((topic) =>
      topicToTopSubs[topic].includes(sub) ? breakdownData[topic][sub] || 0 : 0
    ),
    backgroundColor: colorMap[sub],
    stack: "stack-1",
  }));
  // Add "Other"
  datasets.push({
    label: "Other",
    data: topics.map((topic) => topicToOtherCount[topic] || 0),
    backgroundColor: "#cccccc",
    stack: "stack-1",
  });

  // Step 7: Render the chart, legend shows only top 10 most common subtopics (and "Other")
  activeCharts[chartId] = new Chart(ctx, {
    type: "bar",
    data: { labels: topics, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 14,
            padding: 8,
            font: { size: 10 },
            // Only show top 10 + "Other" in legend under chart
            filter: function (legendItem, chartData) {
              return (
                legendSubs.includes(legendItem.text) ||
                legendItem.text === "Other"
              );
            },
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
          filter: function (tooltipItem) {
            // Show only bars with value > 0 (or change to >1 או מה שתרצה)
            return tooltipItem.raw > 0;
          },
        },
      },
      scales: { x: { stacked: true }, y: { stacked: true } },
    },
  });

  // Step 8: Full legend popup with all subtopics and totals
  const allSubtopics = Object.keys(subtopicTotals);
  allSubtopics.forEach((sub) => {
    if (!colorMap[sub]) colorMap[sub] = "#eee";
  });
  setupFullLegendPopup(allSubtopics, colorMap, subtopicTotals);
}

// Load lecturer statistics from API
async function loadLecturerStats() {
  const payload = {
    startDate: document.getElementById("start-date").value,
    endDate: document.getElementById("end-date").value,
    includeTop5: document.getElementById("includeTop5").checked,
    includeInactive: document.getElementById("includeInactive").checked,
    includeRecommendations: document.getElementById("includeRecommendations")
      .checked,
  };

  if (!payload.startDate || !payload.endDate) {
    return alert("Please select both start and end dates.");
  }

  toggleLoader(true);
  hideError();

  try {
    const resp = await fetch(
      "https://18ygiad1a8.execute-api.us-east-1.amazonaws.com/dev/LecturerReport",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const result = await resp.json();
    const data = result.body ? JSON.parse(result.body) : result;

    // אחרי שקיבלת data מה-API
    const questionsByStudent = data.questionsOverTimeByStudent || {};
    const studentSelect = document.getElementById("studentSelect");

    // Populate dropdown
    studentSelect.innerHTML = Object.keys(questionsByStudent)
      .map((email) => `<option value="${email}">${email}</option>`)
      .join("");

    // Set default selection (prefer mevaser, fallback to first)
    let defaultEmail = "mevaser1995@gmail.com";
    if (!questionsByStudent[defaultEmail]) {
      // fallback to first in list
      defaultEmail = Object.keys(questionsByStudent)[0];
    }
    studentSelect.value = defaultEmail;

    // Update the student chart when a new student is selected
    function updateStudentChart() {
      const selectedEmail = studentSelect.value;
      const studentData = questionsByStudent[selectedEmail] || [];
      renderQuestionsOverTimeByStudentChart(studentData, "studentChart");
    }

    // Event Listener - רנדור דיפולטי והרנדור בעת שינוי
    studentSelect.addEventListener("change", updateStudentChart);
    updateStudentChart(); // Always show default selection on load

    // Render charts
    renderBarChart(
      "chart-topics-networking",
      data.topTopicsPerCourse.Networking.map((x) => splitLabelByWords(x[0], 2)),
      data.topTopicsPerCourse.Networking.map((x) => x[1]),
      "Networking"
    );
    renderBarChart(
      "chart-topics-csharp",
      data.topTopicsPerCourse["C#"].map((x) => splitLabelByWords(x[0], 2)),
      data.topTopicsPerCourse["C#"].map((x) => x[1]),
      "C#"
    );

    renderBarChart(
      "chart-top5",
      data.top5.map((s) => s.name),
      data.top5.map((s) => s.count),
      "Top 5 Students"
    );
    renderBarChart(
      "chart-inactive",
      data.inactiveUsers.map((s) => s.name),
      data.inactiveUsers.map((s) => s.count),
      "Inactive Users",
      "y"
    );
    // Frequent Questions Chart
    renderFrequentQuestionsChart(
      "chart-frequent-questions",
      data.frequentQuestions
    );

    // Topic Breakdown Chart (Stacked)
    renderTopicBreakdownChart("chart-breakdown", data.topicSubtopicBreakdown);

    // Questions Over Time Line Chart
    renderLineChart(
      "chart-questions-time",
      data.questionsOverTime.map((d) => d.date),
      data.questionsOverTime.map((d) => d.count)
    );

    // Recommendations
    const recBox = document.getElementById("recommendations-box");
    recBox.textContent = data.recommendations || "No recommendations";
    document
      .getElementById("card-recommendations")
      .classList.toggle("d-none", !data.recommendations);
  } catch (err) {
    console.error(err);
    showError("Unable to load lecturer stats. Check console for details.");
  } finally {
    toggleLoader(false);
  }
}

// Initialize page on load
document.addEventListener("DOMContentLoaded", () => {
  fetchStudents();

  // Set default date range
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("start-date").value = "2025-04-01";
  document.getElementById("end-date").value = today;

  loadLecturerStats();

  document
    .getElementById("load-stats")
    .addEventListener("click", loadLecturerStats);
});
