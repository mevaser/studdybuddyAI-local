// js/profile.js
export async function loadProfileFromDynamo(userEmail) {
  try {
    console.log("Loading student profile for:", userEmail);

    // Construct API URL
    const apiUrl = `https://18ygiad1a8.execute-api.us-east-1.amazonaws.com/dev/getStudent?Email=${encodeURIComponent(
      userEmail.toLowerCase()
    )}`;

    // Make the GET request
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // ⚠️ Authorization header removed for now (CORS issue during GET)
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch student profile");
    }

    const result = await response.json();

    // Some APIs wrap JSON in "body" stringified JSON
    const studentData =
      typeof result === "string" ? JSON.parse(result) : result;
    console.log("✅ Dynamo student data:", studentData);

    // Save to session storage
    sessionStorage.setItem("userData", JSON.stringify(studentData));

    // Update UI fields
    const bioEl = document.querySelector(".user-bio");
    if (bioEl && studentData.About) bioEl.textContent = studentData.About;

    document.querySelectorAll(".user-name").forEach((el) => {
      el.textContent = studentData.Name || "Default Name";
    });

    const emailEl = document.querySelector(".user-email");
    if (emailEl) emailEl.textContent = studentData.Email || userEmail;

    const phoneEl = document.querySelector(".user-phone");
    if (phoneEl && studentData.Phone) phoneEl.textContent = studentData.Phone;

    const linkedinContainer = document.querySelector(".user-linkedin");
    if (linkedinContainer) {
      const anchor = linkedinContainer.querySelector("a");
      if (anchor) {
        anchor.href = studentData["linkedin profile"] || "#";
        anchor.textContent = studentData["linkedin profile"] || "";
      }
    }

    const dropdownNameEl = document.querySelector(
      ".d-none.d-md-block.dropdown-toggle.ps-2"
    );
    if (dropdownNameEl && studentData.Name) {
      dropdownNameEl.textContent = studentData.Name;
    }

    populateProfileEditForm();
  } catch (error) {
    console.error("Error loading student profile:", error);
    alert("Could not load profile from Dynamo via GET request.");
  }
}

export function updateUserNameOnPage() {
  try {
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    if (!userData || !userData.Name) {
      console.warn("No user data found in sessionStorage.");
      return;
    }
    const nameEls = document.querySelectorAll(".user-name");
    nameEls.forEach((el) => {
      el.textContent = userData.Name || "Default Name";
    });
    const dropdownNameEl = document.querySelector(
      ".d-none.d-md-block.dropdown-toggle.ps-2"
    );
    if (dropdownNameEl) {
      dropdownNameEl.textContent = userData.Name;
    }
  } catch (error) {
    console.error("Error updating user name on page:", error);
  }
}

export function populateProfileEditForm() {
  const userData = JSON.parse(sessionStorage.getItem("userData"));
  if (userData) {
    console.log("✅ Populating profile form with:", userData);

    // Populate Name
    const nameInput = document.getElementById("fullName");
    if (nameInput) nameInput.value = userData.Name || "";

    // Populate About (was previously 'Bio')
    const bioInput = document.getElementById("about");
    if (bioInput) bioInput.value = userData.About || "";

    // Populate Phone (Ensure correct casing)
    const phoneInput = document.getElementById("phone");
    if (phoneInput) {
      phoneInput.value = userData.Phone || "";
      console.log("phoneInput found:", phoneInput);
      console.log("Setting phone to:", userData.Phone || "");
      console.log("Resulting input value:", phoneInput.value);
    } else {
      console.error("Could not find #phone input in the DOM!");
    }

    // Populate Email (read-only)
    const emailInput = document.getElementById("Email");
    if (emailInput) {
      emailInput.value = userData.Email || "";
      emailInput.setAttribute("readonly", true);
    }

    // Populate LinkedIn
    const linkedinInput = document.getElementById("Linkedin");
    if (linkedinInput) linkedinInput.value = userData["linkedin profile"] || "";
  } else {
    console.warn("⚠ No user data found in sessionStorage.");
  }
}
