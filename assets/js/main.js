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

async function loadJsPDF() {
  // אם כבר טעון, החזר אותו
  if (window.jsPDF) {
    return window.jsPDF;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => {
      // jsPDF נטען כ-window.jspdf.jsPDF
      if (window.jspdf && window.jspdf.jsPDF) {
        window.jsPDF = window.jspdf.jsPDF; // יצירת קיצור דרך
        resolve(window.jsPDF);
      } else {
        reject(new Error("jsPDF object not found"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load jsPDF"));
    document.head.appendChild(script);
  });
}

// Run when DOM is fully loaded
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🌍 DOM fully loaded. Initializing...");

  auth.updateUserDropdownLabel();

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
      auth.updateUserDropdownLabel(); // Ensure dropdown label is updated
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
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log("✅ Profile update response:", result);
        if (response.ok) {
          alert("✅ Profile updated successfully!");
          await profile.loadProfileFromDynamo(userEmail);
          profile.updateUserNameOnPage();
          auth.updateUserDropdownLabel(); // Ensure dropdown label is updated
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
  console.log("🎉 Initialization completed!");
});
