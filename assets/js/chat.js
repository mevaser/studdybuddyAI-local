// js/chat.js
import { parseJwt, isTokenValid, redirectToCognito } from "./auth.js";
import { escapeHTML } from "./utils.js";

export async function checkBioBeforeChat() {
  const idToken = sessionStorage.getItem("idToken_defaultUser");
  if (!idToken || !isTokenValid(idToken)) {
    alert("⚠ You must be logged in to access the chat.");
    redirectToCognito();
    return;
  }
  const userData = sessionStorage.getItem("userData");
  if (userData) {
    const parsedData = JSON.parse(userData);
    if (parsedData.Bio && parsedData.Bio.trim() !== "") {
      window.location.assign("pages-chat.html");
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
    const responseBody = JSON.parse(result.body);
    if (responseBody.missing_fields?.includes("Bio")) {
      alert("⚠ You must add a Bio before accessing the chat.");
      window.location.assign("users-profile.html");
    } else {
      console.log("✅ Bio is set, allowing access.");
      window.location.assign("pages-chat.html");
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
  function addMessage(content, sender = "user") {
    const message = document.createElement("div");
    message.className = `message ${sender}`;
    message.innerHTML = escapeHTML(content).replace(/\n/g, "<br>");
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
        addMessage("Authentication failed or token expired. Please log in again.", "api");
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
      let parsedBody = {};
      if (result.body) {
        parsedBody = JSON.parse(result.body);
      }
      if (parsedBody.answer) {
        addMessage(parsedBody.answer, "api");
      } else {
        addMessage("Sorry, something went wrong. Please try again.", "api");
      }
    } catch (error) {
      console.error("Chat error:", error);
      addMessage("An error occurred while fetching the answer. Please try again.", "api");
    }
  });
  chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendButton.click();
    }
  });
}
