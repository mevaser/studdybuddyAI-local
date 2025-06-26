import { parseJwt, isTokenValid, redirectToCognito } from "./auth.js";
import { escapeHTML } from "./utils.js";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/+esm";

// Ensures chat access only for logged-in users with filled About field
export async function checkBioBeforeChat() {
  if (sessionStorage.getItem("redirectedToProfile") === "true") {
    console.warn("⛔ Preventing redirect loop to profile.");
    return;
  }

  const idToken = sessionStorage.getItem("idToken_defaultUser");
  if (!idToken || !isTokenValid(idToken)) {
    const confirmed = confirm(
      "👋 Hello! To use the chat, please log in first. Click OK to proceed to the login page."
    );
    if (confirmed) {
      redirectToCognito();
    }
    return;
  }

  const userData = sessionStorage.getItem("userData");
  if (userData) {
    const parsedData = JSON.parse(userData);
    if (parsedData.About && parsedData.About.trim() !== "") {
      if (!window.location.href.includes("pages-chat.html")) {
        window.location.assign("pages-chat.html");
      }
      return;
    }
  }

  try {
    console.log("🔍 Checking profile from API...");
    const decodedToken = parseJwt(idToken);
    const userEmail = decodedToken?.email;
    if (!userEmail) {
      alert("⚠ Email not found in token.");
      return;
    }
    const apiUrl = `https://18ygiad1a8.execute-api.us-east-1.amazonaws.com/dev/checkProfile?email=${encodeURIComponent(
      userEmail
    )}`;
    const response = await fetch(apiUrl, { method: "GET" });
    if (!response.ok) throw new Error("Failed to check profile.");
    const result = await response.json();
    const responseBody =
      typeof result.body === "string" ? JSON.parse(result.body) : result.body;
    if (responseBody.missing_fields?.includes("About")) {
      alert(
        "⚠ You need to fill out your About section before using the chat. Redirecting to profile page..."
      );
      sessionStorage.setItem("redirectedToProfile", "true");
      window.location.assign(
        "https://studybudybucket.s3.us-east-1.amazonaws.com/studdybuddyAI-local/users-profile.html"
      );
    } else {
      console.log("✅ About is set, allowing access.");
      if (!window.location.href.includes("pages-chat.html")) {
        window.location.assign("pages-chat.html");
      }
    }
  } catch (error) {
    console.error("❌ Error checking profile:", error);
    alert("An error occurred while checking your profile.");
  }
}

export function initChat() {
  const chatWindow = document.getElementById("chat-window");
  const chatInput = document.getElementById("chat-input");
  const sendButton = document.getElementById("send-btn");
  if (!chatWindow || !chatInput || !sendButton) {
    console.log("One or more required chat elements are missing.");
    return;
  }

  // ✅ Enhanced message renderer with markdown support for GPT (api) responses
  function addMessage(content, sender = "user") {
    const message = document.createElement("div");
    message.className = `message ${sender}`;

    // GPT replies in markdown format → render using marked.js
    const rendered =
      sender === "api"
        ? marked.parse(content)
        : escapeHTML(content).replace(/\n/g, "<br>");

    message.innerHTML = rendered;
    chatWindow.appendChild(message);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  sendButton.addEventListener("click", async () => {
    const message = chatInput.value.trim();
    if (!message) return;
    addMessage(message, "user");
    chatInput.value = "";
    chatInput.focus();
    try {
      const idToken = sessionStorage.getItem("idToken_defaultUser");
      if (!idToken || !isTokenValid(idToken)) {
        addMessage(
          "Authentication failed or token expired. Please log in again.",
          "api"
        );
        return;
      }
      const decodedToken = parseJwt(idToken);
      const userEmail = decodedToken && decodedToken.email;
      if (!userEmail) {
        addMessage("Email not found in token.", "api");
        return;
      }
      const response = await fetch(
        "https://18ygiad1a8.execute-api.us-east-1.amazonaws.com/dev/AskGPT",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Origin: window.location.origin,
          },
          body: JSON.stringify({ email: userEmail, question: message }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to get a response from the server");
      }
      const result = await response.json();
      let parsedBody =
        typeof result.body === "string" ? JSON.parse(result.body) : result.body;
      if (parsedBody.answer) {
        addMessage(parsedBody.answer, "api");
      } else {
        addMessage("Sorry, something went wrong. Please try again.", "api");
      }
    } catch (error) {
      console.error("Chat error:", error);
      addMessage(
        "An error occurred while fetching the answer. Please try again.",
        "api"
      );
    }
  });

  chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendButton.click();
    }
  });
}
