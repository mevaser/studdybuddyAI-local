// js/main.js
import * as auth from "./auth.js";
import * as profile from "./profile.js";
import * as ui from "./ui.js";
import * as chat from "./chat.js";

// Run when DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Update authentication buttons
  auth.updateAuthButton();

  // Attach event listener for the profile dropdown to ensure sign-out button is updated
  const profileDropdown = document.querySelector(".nav-profile");
  if (profileDropdown) {
    profileDropdown.addEventListener("click", () => {
      auth.ensureSignOutButtonExists();
    });
  }

  // Handle login flow (OAuth and session validation)
  auth.handleLoginFlow();

  // If on the profile overview page, load the profile; otherwise update the displayed user name
  const profilePage = !!document.querySelector("#profile-overview");
  if (profilePage) {
    const idToken = sessionStorage.getItem("idToken_defaultUser");
    if (idToken && auth.isTokenValid(idToken)) {
      const decoded = auth.parseJwt(idToken);
      const userEmail = decoded && decoded.email;
      if (userEmail) {
        profile.loadProfileFromDynamo(userEmail);
      }
    }
  } else {
    profile.updateUserNameOnPage();
  }

  // Initialize UI components
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
      console.log("Save Changes button clicked");
      const updatedName = document.getElementById("fullName")?.value.trim();
      const updatedBio = document.getElementById("about")?.value.trim();
      const updatedPhone = document.getElementById("phone")?.value.trim();
      const updatedLinkedin = document.getElementById("Linkedin")?.value.trim();
      const idToken = sessionStorage.getItem("idToken_defaultUser");
      if (!idToken || !auth.isTokenValid(idToken)) {
        alert("User is not authenticated or token is invalid/expired.");
        return;
      }
      const decodedToken = auth.parseJwt(idToken);
      const userEmail = decodedToken?.email;
      console.log("Updating profile for", userEmail);
      try {
        const apiUrl =
          "https://3i1nb1t27e.execute-api.us-east-1.amazonaws.com/stage/updateProfile";
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: idToken,
          },
          body: JSON.stringify({
            Email: userEmail,
            Name: updatedName,
            Bio: updatedBio,
            phone: updatedPhone,
            linkedin: updatedLinkedin,
          }),
        });
        const result = await response.json();
        console.log("Profile update response:", result);
        if (response.ok) {
          alert("Profile updated successfully!");
          await profile.loadProfileFromDynamo(userEmail);
          profile.updateUserNameOnPage();
        } else {
          alert(`Failed to update profile: ${result.error || "Unknown error"}`);
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("An error occurred while updating the profile.");
      }
    });
  }

  // Trigger ECharts auto-resize after a short delay
  setTimeout(() => {
    ui.initEChartsResize();
  }, 200);
});
