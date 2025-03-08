// js/profile.js
export async function loadProfileFromDynamo(userEmail) {
  try {
    console.log("Loading student profile for:", userEmail);
    const apiUrl = `https://18ygiad1a8.execute-api.us-east-1.amazonaws.com/dev/updateProfile?Email=${encodeURIComponent(
      userEmail
    )}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch student profile");
    }
    const studentData = await response.json();
    console.log("Dynamo student data:", studentData);
    sessionStorage.setItem("userData", JSON.stringify(studentData));
    // Update "About" section
    const bioEl = document.querySelector(".user-bio");
    if (bioEl && studentData.Bio) {
      bioEl.textContent = studentData.Bio;
    }
    // Update all "Name" elements
    const nameEls = document.querySelectorAll(".user-name");
    nameEls.forEach((el) => {
      el.textContent = studentData.Name || "Default Name";
    });
    // Update Email
    const emailEl = document.querySelector(".user-email");
    if (emailEl) {
      emailEl.textContent = studentData.Email || userEmail;
    }
    // Update Phone
    const phoneEl = document.querySelector(".user-phone");
    if (phoneEl && studentData.phone) {
      phoneEl.textContent = studentData.phone;
    }
    // Update LinkedIn
    const linkedinContainer = document.querySelector(".user-linkedin");
    if (linkedinContainer) {
      const anchor = linkedinContainer.querySelector("a");
      if (anchor) {
        anchor.href = studentData["linkedin profile"] || "#";
        anchor.textContent = studentData["linkedin profile"] || "";
      }
    }
    // Update dropdown span
    const dropdownNameEl = document.querySelector(
      ".d-none.d-md-block.dropdown-toggle.ps-2"
    );
    if (dropdownNameEl && studentData.Name) {
      dropdownNameEl.textContent = studentData.Name;
    }
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
    // Populate Bio
    const bioInput = document.getElementById("about");
    if (bioInput) bioInput.value = userData.Bio || "";
    // Populate Phone
    const phoneInput = document.getElementById("phone");
    if (phoneInput) {
      phoneInput.value = userData.phone || "";
      console.log("phoneInput found:", phoneInput);
      console.log("Setting phone to:", userData.phone || "");
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
