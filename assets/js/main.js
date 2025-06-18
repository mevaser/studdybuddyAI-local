// js/main.js
import * as auth from "./auth.js";
import * as profile from "./profile.js";
import * as ui from "./ui.js";
import * as chat from "./chat.js";

// Function to wait until the token is stored in sessionStorage
async function waitForToken(retries = 5, delay = 300) {
  for (let i = 0; i < retries; i++) {
    const idToken = sessionStorage.getItem("idToken_defaultUser");
    if (idToken && auth.isTokenValid(idToken)) {
      return idToken;
    }
    console.log(`🔄 Waiting for ID token... Attempt ${i + 1}/${retries}`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  console.warn("⚠ Timed out waiting for token.");
  return null;
}

// Run when DOM is fully loaded
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🌍 DOM fully loaded. Initializing...");

  // Update authentication buttons
  auth.updateAuthButton();

  // Attach event listener for the profile dropdown to ensure sign-out button is updated
  const profileDropdown = document.querySelector(".nav-profile");
  if (profileDropdown) {
    profileDropdown.addEventListener("click", () => {
      auth.ensureSignOutButtonExists();
    });
  }

  try {
    // Handle login flow (OAuth and session validation)
    await auth.handleLoginFlow();
    console.log("✅ Login flow handled.");
  } catch (error) {
    console.error("❌ Error during login flow:", error);
  }

  // ✅ Always initialize UI components (even for guests)
  ui.initSidebarToggle();
  ui.initSearchBarToggle();
  ui.initNavbarLinksActive();
  ui.initHeaderScrolled();
  ui.initBackToTop();
  ui.initQuillEditors();
  ui.initTinyMCE();
  ui.initBootstrapValidation();
  ui.initDatatables();
  ui.initEChartsResize();
  ui.initEChartsAutoResize();

  // Wait for token to be available
  const idToken = await waitForToken();
  if (!idToken) {
    console.warn("⚠ No valid token available after waiting.");
    return;
  }

  console.log("✅ Valid token found. Fetching user profile...");

  const decoded = auth.parseJwt(idToken);
  const userEmail = decoded?.email;
  console.log("📩 User email from token:", userEmail);

  if (userEmail) {
    console.log("🔍 Fetching profile from DynamoDB...");
    try {
      await profile.loadProfileFromDynamo(userEmail.toLowerCase());
      console.log("✅ Profile loaded successfully.");
      profile.updateUserNameOnPage();
    } catch (error) {
      console.error("❌ Error loading profile:", error);
    }
  }

  // Attach event listener to chat link for profile verification before access
  const chatLink = document.querySelector('a[href="pages-chat.html"]');
  if (chatLink) {
    chatLink.addEventListener("click", (event) => {
      event.preventDefault();
      chat.checkBioBeforeChat();
    });
  }

  // Initialize chat if chat elements are present
  if (document.getElementById("chat-window")) {
    chat.initChat();
  }

  // Populate profile edit form (if present)
  profile.populateProfileEditForm();

  // Profile update event listener
  const saveChangesBtn = document.getElementById("saveChangesBtn");
  if (saveChangesBtn) {
    saveChangesBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      console.log("🗒️ Save Changes button clicked");
      const updatedName = document.getElementById("fullName")?.value.trim();
      const updatedAbout = document.getElementById("about")?.value.trim();
      const updatedPhone = document.getElementById("phone")?.value.trim();
      const updatedLinkedin = document.getElementById("Linkedin")?.value.trim();
      const idToken = sessionStorage.getItem("idToken_defaultUser");
      if (!idToken || !auth.isTokenValid(idToken)) {
        alert("⚠ User is not authenticated or token is invalid/expired.");
        return;
      }
      const decodedToken = auth.parseJwt(idToken);
      const userEmail = decodedToken?.email;
      console.log("📩 Updating profile for", userEmail);
      try {
        const apiUrl =
          "https://18ygiad1a8.execute-api.us-east-1.amazonaws.com/dev/updateProfile";
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: idToken,
          },
          body: JSON.stringify({
            Email: userEmail,
            Name: updatedName,
            About: updatedAbout,
            Phone: updatedPhone,
            linkedin: updatedLinkedin,
          }),
        });
        const result = await response.json();
        console.log("✅ Profile update response:", result);
        if (response.ok) {
          alert("✅ Profile updated successfully!");
          await profile.loadProfileFromDynamo(userEmail); // reload & update everything
          profile.updateUserNameOnPage();
        } else {
          alert(
            `❌ Failed to update profile: ${result.error || "Unknown error"}`
          );
        }
      } catch (error) {
        console.error("❌ Error updating profile:", error);
        alert("An error occurred while updating the profile.");
      }
    });
  }

  // Trigger ECharts auto-resize after a short delay
  setTimeout(() => {
    ui.initEChartsResize();
  }, 200);

  // 🎓 Lecturer Report Popup Logic
  const lecturerLink = document.getElementById("lecturerReportLink");
  const modal = document.getElementById("lecturerReportModal");
  const cancelBtn = document.getElementById("cancelReportBtn");

  if (lecturerLink && modal && cancelBtn) {
    lecturerLink.addEventListener("click", (e) => {
      e.preventDefault();
      modal.style.display = "flex";
    });

    cancelBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });

      // 📤 Generate Lecturer Report - call Lambda
    const generateBtn = document.getElementById("generateReportBtn");
    generateBtn?.addEventListener("click", async () => {
    const startDate = document.getElementById("reportStartDate").value;
    const endDate = document.getElementById("reportEndDate").value;
    const includeTop5 = document.getElementById("includeTop5").checked;
    const includeInactive = document.getElementById("includeInactive").checked;

    const payload = {
      startDate,
      endDate,
      includeTop5,
      includeInactive,
    };

    console.log("📦 Sending report payload:", payload);

    try {
      const response = await fetch(
        "https://18ygiad1a8.execute-api.us-east-1.amazonaws.com/dev/LecturerReport",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      console.log("📄 Lambda response:", result);

      alert("✅ Report sent! Check console for details.");
      modal.style.display = "none";
    } catch (error) {
      console.error("❌ Error calling LecturerReport API:", error);
      alert("Error calling report API. See console.");
    }
  });

  }


  console.log("🎉 Initialization completed!");
});
