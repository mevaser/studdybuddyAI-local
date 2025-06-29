let dataTable;

async function fetchStudents() {
  const apiUrl =
    "https://18ygiad1a8.execute-api.us-east-1.amazonaws.com/dev/getAllStudents"; // ← כבר מעודכן

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const responseBody = await response.json();

    let students = responseBody.body;
    if (typeof students === "string") {
      students = JSON.parse(students);
    }

    if (!Array.isArray(students)) {
      throw new Error("API response is not an array");
    }

    const tableBody = document.querySelector("#students-table tbody");
    tableBody.innerHTML = "";

    students.forEach((student, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${student.Name || "N/A"}</td>
        <td>${student.Email || "N/A"}</td>
        <td>${student.Phone || "N/A"}</td>
        <td>${student.About || "N/A"}</td>
        <td>${
          student["linkedin profile"]
            ? `<a href="${student["linkedin profile"]}" target="_blank">LinkedIn</a>`
            : "N/A"
        }</td>
      `;
      tableBody.appendChild(row);
    });

    if (dataTable) {
      dataTable.destroy();
    }

    dataTable = new simpleDatatables.DataTable("#students-table", {
      perPageSelect: [5, 10, 15, ["All", -1]],
    });

    document.getElementById("total-students").innerText = students.length;
  } catch (error) {
    console.error("Error fetching students:", error);
  }
}

document.addEventListener("DOMContentLoaded", fetchStudents);
