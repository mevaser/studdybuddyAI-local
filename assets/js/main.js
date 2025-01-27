// main_fixed.js (Enhanced)
// 1) We unify login logic with AWS Cognito.
// 2) We assume that we have a "GET" or "POST" endpoint to fetch a student's info from DynamoDB by email.
// 3) On page load (or when the user visits the profile), we call loadProfile() if we have a valid token.
// 4) The rest of your UI logic (Quill, TinyMCE, DataTables, ECharts, Chat, etc.) remains unchanged.
// Make sure to adjust the endpoint URL and response fields to match your actual DynamoDB logic.

(function () {
  "use strict";

  /*****************************************************
   * 1. HELPER FUNCTIONS & DOM UTILS
   *****************************************************/

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim();
    if (all) {
      return [...document.querySelectorAll(el)];
    } else {
      return document.querySelector(el);
    }
  };

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    if (all) {
      select(el, all).forEach((e) => e.addEventListener(type, listener));
    } else {
      const element = select(el, all);
      if (element) {
        element.addEventListener(type, listener);
      }
    }
  };

  /**
   * Easy on scroll event listener
   */
  const onscroll = (el, listener) => {
    el.addEventListener("scroll", listener);
  };

  /*****************************************************
   * 2. TOKEN & SESSION MANAGEMENT
   *****************************************************/

  function parseTokensFromHash() {
    const hash = window.location.hash.substring(1);
    const params = {};
    if (!hash) return params;

    hash.split("&").forEach((param) => {
      const [key, value] = param.split("=");
      params[key] = decodeURIComponent(value || "");
    });
    return params;
  }

  function parseJwt(token) {
    if (!token) return null;
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    try {
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error parsing token:", error);
      return null;
    }
  }

  function isTokenValid(idToken) {
    const payload = parseJwt(idToken);
    if (!payload || !payload.exp) return false;
    const now = Date.now();
    const expiry = payload.exp * 1000;
    return now < expiry;
  }

  function saveTokens(userId, tokens) {
    if (tokens.id_token) {
      sessionStorage.setItem(`idToken_${userId}`, tokens.id_token);
    }
    if (tokens.access_token) {
      sessionStorage.setItem(`accessToken_${userId}`, tokens.access_token);
    }
    if (tokens.refresh_token) {
      sessionStorage.setItem(`refreshToken_${userId}`, tokens.refresh_token);
    }
  }

  function getTokensFromStorage(userId) {
    return {
      id_token: sessionStorage.getItem(`idToken_${userId}`) || "",
      access_token: sessionStorage.getItem(`accessToken_${userId}`) || "",
      refresh_token: sessionStorage.getItem(`refreshToken_${userId}`) || "",
    };
  }

  function clearTokens(userId) {
    sessionStorage.removeItem(`idToken_${userId}`);
    sessionStorage.removeItem(`accessToken_${userId}`);
    sessionStorage.removeItem(`refreshToken_${userId}`);
  }

  /*****************************************************
   * 3. UNIFIED LOGIN LOGIC
   *****************************************************/

  function redirectToCognito() {
    const cognitoSignInURL =
      "https://us-east-1yfkzkrdrk.auth.us-east-1.amazoncognito.com/login/continue?client_id=6q9dfaem3aaobkec9fs0p2n07e&redirect_uri=https%3A%2F%2Fstudybuddy-website.s3.us-east-1.amazonaws.com%2Fstudybuddy%2Findex.html&response_type=token";
    console.warn("No valid token. Redirecting to sign-in...");
    window.location.href = cognitoSignInURL;
  }

  function validateSessionAndRedirect(userId = "defaultUser") {
    const tokens = getTokensFromStorage(userId);
    if (!tokens.id_token || !isTokenValid(tokens.id_token)) {
      redirectToCognito();
    } else {
      console.log("User has a valid token.");
    }
  }

  function handleOAuthLogin(userId = "defaultUser") {
    let tokens = getTokensFromStorage(userId);
    if (!tokens.id_token || !isTokenValid(tokens.id_token)) {
      const hashTokens = parseTokensFromHash();
      if (hashTokens.id_token && isTokenValid(hashTokens.id_token)) {
        console.log("Storing tokens from URL hash...");
        saveTokens(userId, hashTokens);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        tokens = getTokensFromStorage(userId);
      } else {
        console.log("No valid token from hash or storage.");
      }
    } else {
      console.log("Valid token already in sessionStorage.");
    }
  }

  async function handleFormLogin(event) {
    event.preventDefault();
    const userId = "defaultUser";
    const emailInput = document.getElementById("yourUsername");
    const passwordInput = document.getElementById("yourPassword");
    if (!emailInput || !passwordInput) {
      console.error("Login form is missing fields.");
      return;
    }
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }
    const loginButton = event.target.querySelector("button");
    if (loginButton) {
      loginButton.textContent = "Logging in...";
      loginButton.disabled = true;
    }
    try {
      // Example call to a custom endpoint
      const response = await fetch(
        "https://kzgutwddhk.execute-api.us-east-1.amazonaws.com/askQuestion",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const result = await response.json();
      if (response.ok && result.tokens && result.tokens.id_token) {
        console.log("Login successful, saving tokens...");
        saveTokens(userId, result.tokens);
        window.location.href = "dashboard.html";
      } else {
        alert(result.error || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("An error occurred while logging in. Please try again.");
    } finally {
      if (loginButton) {
        loginButton.textContent = "Login";
        loginButton.disabled = false;
      }
    }
  }

  function handleLoginFlow() {
    handleOAuthLogin("defaultUser");
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", handleFormLogin);
    }
    const isProtectedPage = !!document.querySelector('[data-protected="true"]');
    if (isProtectedPage) {
      validateSessionAndRedirect("defaultUser");
    }
  }

  /*****************************************************
   * 4. DYNAMO DATA FETCH (STUDENT PROFILE)
   *****************************************************/
  /**
   * loadProfileFromDynamo(userEmail):
   * Fetches the student's Name, Bio, Email, phone, and 'linkedin profile' from Dynamo.
   * Then updates the DOM elements that have .user-name, .user-bio, .user-email, .user-phone, .user-linkedin,
   * and the dropdown span for the user's name.
   */
  async function loadProfileFromDynamo(userEmail) {
    try {
      console.log("Loading student profile for:", userEmail);

      const apiUrl = `https://3i1nb1t27e.execute-api.us-east-1.amazonaws.com/stage/updateProfile?Email=${encodeURIComponent(
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

      // Update ALL "Name" elements
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

      // Update the dropdown span with the Name
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

  /**
   * updateUserNameOnPage():
   * Fetches user data from sessionStorage and updates the .user-name and dropdown span elements globally.
   */
  function updateUserNameOnPage() {
    try {
      const userData = JSON.parse(sessionStorage.getItem("userData"));
      if (!userData || !userData.Name) {
        console.warn("No user data found in sessionStorage.");
        return;
      }

      // Update ALL "Name" elements
      const nameEls = document.querySelectorAll(".user-name");
      nameEls.forEach((el) => {
        el.textContent = userData.Name || "Default Name";
      });

      // Update the dropdown span with the Name
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

  /*****************************************************
   * 5. PAGE-LOAD INITIALIZATION
   *****************************************************/

  document.addEventListener("DOMContentLoaded", () => {
    handleLoginFlow();

    // If we are on the profile overview page, we check #profile-overview
    const profilePage = !!document.querySelector("#profile-overview");
    if (profilePage) {
      // Grab token from session
      const idToken = sessionStorage.getItem("idToken_defaultUser");
      if (idToken && isTokenValid(idToken)) {
        const decoded = parseJwt(idToken);
        const userEmail = decoded && decoded.email;
        if (userEmail) {
          // Load from dynamo and populate fields.
          loadProfileFromDynamo(userEmail);
        }
      }
    } else {
      // For other pages, update user name from sessionStorage
      updateUserNameOnPage();
    }
  });


  /*****************************************************
   * 6. REMAINING UI / EDITOR / CHART LOGIC
   *****************************************************/

  // The rest of your code (Quill, TinyMCE, etc.) remains as in your existing script.

  // -- Sidebar toggle
  if (select(".toggle-sidebar-btn")) {
    on("click", ".toggle-sidebar-btn", function () {
      select("body").classList.toggle("toggle-sidebar");
    });
  }

  // -- Search bar toggle
  if (select(".search-bar-toggle")) {
    on("click", ".search-bar-toggle", function () {
      select(".search-bar").classList.toggle("search-bar-show");
    });
  }

  // -- Navbar links active state
  let navbarlinks = select("#navbar .scrollto", true);
  const navbarlinksActive = () => {
    let position = window.scrollY + 200;
    navbarlinks.forEach((navbarlink) => {
      if (!navbarlink.hash) return;
      let section = select(navbarlink.hash);
      if (!section) return;
      if (
        position >= section.offsetTop &&
        position <= section.offsetTop + section.offsetHeight
      ) {
        navbarlink.classList.add("active");
      } else {
        navbarlink.classList.remove("active");
      }
    });
  };
  window.addEventListener("load", navbarlinksActive);
  onscroll(document, navbarlinksActive);

  // -- Header scrolled
  let selectHeader = select("#header");
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add("header-scrolled");
      } else {
        selectHeader.classList.remove("header-scrolled");
      }
    };
    window.addEventListener("load", headerScrolled);
    onscroll(document, headerScrolled);
  }

  // -- Back to top
  let backtotop = select(".back-to-top");
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add("active");
      } else {
        backtotop.classList.remove("active");
      }
    };
    window.addEventListener("load", toggleBacktotop);
    onscroll(document, toggleBacktotop);
  }

  // -- Quill editors (unchanged)
  if (select(".quill-editor-default")) {
    new Quill(".quill-editor-default", { theme: "snow" });
  }

  if (select(".quill-editor-bubble")) {
    new Quill(".quill-editor-bubble", { theme: "bubble" });
  }

  if (select(".quill-editor-full")) {
    new Quill(".quill-editor-full", {
      modules: {
        toolbar: [
          [{ font: [] }, { size: [] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ script: "super" }, { script: "sub" }],
          [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
          ],
          ["direction", { align: [] }],
          ["link", "image", "video"],
          ["clean"],
        ],
      },
      theme: "snow",
    });
  }

  // -- TinyMCE init
  const useDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  tinymce.init({
    selector: "textarea.tinymce-editor",
    plugins:
      "preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons accordion",
    editimage_cors_hosts: ["picsum.photos"],
    menubar: "file edit view insert format tools table help",
    toolbar:
      "undo redo | accordion accordionremove | blocks fontfamily fontsize | bold italic underline strikethrough | align numlist bullist | link image | table media | lineheight outdent indent| forecolor backcolor removeformat | charmap emoticons | code fullscreen preview | save print | pagebreak anchor codesample | ltr rtl",
    autosave_ask_before_unload: true,
    autosave_interval: "30s",
    autosave_prefix: "{path}{query}-{id}-",
    autosave_restore_when_empty: false,
    autosave_retention: "2m",
    image_advtab: true,
    link_list: [
      { title: "My page 1", value: "https://www.tiny.cloud" },
      { title: "My page 2", value: "http://www.moxiecode.com" },
    ],
    image_list: [
      { title: "My page 1", value: "https://www.tiny.cloud" },
      { title: "My page 2", value: "http://www.moxiecode.com" },
    ],
    image_class_list: [
      { title: "None", value: "" },
      { title: "Some class", value: "class-name" },
    ],
    importcss_append: true,
    file_picker_callback: (callback, value, meta) => {
      if (meta.filetype === "file") {
        callback("https://www.google.com/logos/google.jpg", {
          text: "My text",
        });
      } else if (meta.filetype === "image") {
        callback("https://www.google.com/logos/google.jpg", {
          alt: "My alt text",
        });
      } else if (meta.filetype === "media") {
        callback("movie.mp4", {
          source2: "alt.ogg",
          poster: "https://www.google.com/logos/google.jpg",
        });
      }
    },
    height: 600,
    image_caption: true,
    quickbars_selection_toolbar:
      "bold italic | quicklink h2 h3 blockquote quickimage quicktable",
    noneditable_class: "mceNonEditable",
    toolbar_mode: "sliding",
    contextmenu: "link image table",
    skin: useDarkMode ? "oxide-dark" : "oxide",
    content_css: useDarkMode ? "dark" : "default",
    content_style:
      "body { font-family:Helvetica,Arial,sans-serif; font-size:16px }",
  });

  // -- Bootstrap validation
  const needsValidation = document.querySelectorAll(".needs-validation");
  Array.prototype.slice.call(needsValidation).forEach(function (form) {
    form.addEventListener(
      "submit",
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add("was-validated");
      },
      false
    );
  });

  // -- Datatables
  const datatables = select(".datatable", true);
  datatables.forEach((datatable) => {
    new simpleDatatables.DataTable(datatable, {
      perPageSelect: [5, 10, 15, ["All", -1]],
      columns: [
        { select: 2, sortSequence: ["desc", "asc"] },
        { select: 3, sortSequence: ["desc"] },
        { select: 4, cellClass: "green", headerClass: "red" },
      ],
    });
  });

  // -- ECharts resize
  function handleChartResize() {
    const mainContainer = document.querySelector("#main");
    if (mainContainer) {
      setTimeout(() => {
        new ResizeObserver(() => {
          document.querySelectorAll(".echart").forEach((chartElement) => {
            const chartInstance = echarts.getInstanceByDom(chartElement);
            if (chartInstance) {
              chartInstance.resize();
            }
          });
        }).observe(mainContainer);
      }, 200);
    }
  }

  // -- Chat Handling
  document.addEventListener("DOMContentLoaded", () => {
    const chatWindow = document.getElementById("chat-window");
    const chatInput = document.getElementById("chat-input");
    const sendButton = document.getElementById("send-btn");

    if (!chatWindow || !chatInput || !sendButton) {
      console.log("One or more required chat elements are missing.");
      return;
    }

    function escapeHTML(str) {
      const div = document.createElement("div");
      div.innerText = str;
      return div.innerHTML;
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
          "https://3i1nb1t27e.execute-api.us-east-1.amazonaws.com/stage/AskGPT",
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
  });

  // -- Profile Update
  const saveChangesBtn = document.getElementById("saveChangesBtn");
  if (saveChangesBtn) {
    saveChangesBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      console.log("Save Changes button clicked");

      const updatedName = document.getElementById("fullName")?.value.trim();
      const updatedBio = document.getElementById("about")?.value.trim();
      const updatedPhone = document.getElementById("Phone")?.value.trim();
      const updatedEmail = document.getElementById("Email")?.value.trim();
      const updatedLinkedin = document.getElementById("Linkedin")?.value.trim();

      if (!updatedEmail) {
        alert("Email is required.");
        return;
      }

      const idToken = sessionStorage.getItem("idToken_defaultUser");
      if (!idToken || !isTokenValid(idToken)) {
        alert("User is not authenticated or token is invalid/expired.");
        return;
      }

      const decodedToken = parseJwt(idToken);
      const userEmail = (decodedToken && decodedToken.email) || updatedEmail;
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
        } else {
          alert(`Failed to update profile: ${result.error || "Unknown error"}`);
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("An error occurred while updating the profile.");
      }
    });
  }

  // -- ECharts auto-resize
  document.addEventListener("DOMContentLoaded", () => {
    handleChartResize();
  });

  const mainContainer = select("#main");
  if (mainContainer) {
    setTimeout(() => {
      new ResizeObserver(function () {
        select(".echart", true).forEach((echartEl) => {
          echarts.getInstanceByDom(echartEl)?.resize();
        });
      }).observe(mainContainer);
    }, 200);
  }
})();
