// js/auth.js

//
// 1) Utility to parse the ?code from the query string
//
function getQueryParam(paramName) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(paramName);
}

//
// 2) Exchange the code for tokens at Cognito's /oauth2/token endpoint
//
async function exchangeCodeForTokens(code) {
  // Replace these with your actual info:
  const cognitoDomain = "us-east-1y40rmapix.auth.us-east-1.amazoncognito.com";
  const clientId = "6vpka0nstf6sd01n224q1o78pf";
  const redirectUri =
    "https://studybudybucket.s3.us-east-1.amazonaws.com/studdybuddyAI-local/index.html";

  const tokenEndpoint = `https://${cognitoDomain}/oauth2/token`;

  // Build the POST body
  const data = new URLSearchParams();
  data.append("grant_type", "authorization_code");
  data.append("client_id", clientId);
  data.append("redirect_uri", redirectUri);
  data.append("code", code);

  // If using PKCE, also do:
  // data.append("code_verifier", myCodeVerifier);

  // Make the request
  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: data.toString(),
  });

  if (!response.ok) {
    // Show response text for debugging
    const errorText = await response.text();
    throw new Error(
      `Failed to exchange code for tokens. Status: ${response.status} - ${errorText}`
    );
  }

  // This should be the JSON with id_token, access_token, refresh_token, etc.
  return await response.json();
}

//
// 3) JWT parsing as in your original code
//
export function parseJwt(token) {
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

export function isTokenValid(idToken) {
  const payload = parseJwt(idToken);
  if (!payload || !payload.exp) return false;
  return Date.now() < payload.exp * 1000;
}

//
// 4) Token storage / retrieval
//
export function saveTokens(userId, tokens) {
  if (tokens.id_token) {
    sessionStorage.setItem(`idToken_${userId}`, tokens.id_token);
    sessionStorage.setItem("groups", getUserGroupsFromToken(tokens.id_token));
  }
  if (tokens.access_token) {
    sessionStorage.setItem(`accessToken_${userId}`, tokens.access_token);
  }
  if (tokens.refresh_token) {
    sessionStorage.setItem(`refreshToken_${userId}`, tokens.refresh_token);
  }
}

export function getTokensFromStorage(userId) {
  return {
    id_token: sessionStorage.getItem(`idToken_${userId}`) || "",
    access_token: sessionStorage.getItem(`accessToken_${userId}`) || "",
    refresh_token: sessionStorage.getItem(`refreshToken_${userId}`) || "",
  };
}

export function clearTokens(userId) {
  sessionStorage.removeItem(`idToken_${userId}`);
  sessionStorage.removeItem("groups");
  sessionStorage.removeItem(`accessToken_${userId}`);
  sessionStorage.removeItem(`refreshToken_${userId}`);
  sessionStorage.removeItem("userData");
  sessionStorage.clear(); // Full session reset
}

export function getUserGroupsFromToken(idToken) {
  if (!idToken) return null;
  const decodedToken = parseJwt(idToken);
  return decodedToken ? decodedToken["cognito:groups"] || null : null;
}

//
// 5) Cognito redirect function (already set to code flow)
//
export function redirectToCognito() {
  // This must match an allowed callback in your Cognito App Client settings
  const cognitoSignInURL =
    "https://us-east-1y40rmapix.auth.us-east-1.amazoncognito.com/login" +
    "?client_id=6vpka0nstf6sd01n224q1o78pf" +
    "&response_type=code" +
    "&scope=email+openid+phone" +
    "&redirect_uri=https://studybudybucket.s3.us-east-1.amazonaws.com/studdybuddyAI-local/index.html";
    
  console.warn("No valid token. Redirecting to sign-in...");
  window.location.href = cognitoSignInURL;
}

//
// 6) UI / Auth button updates
//
export function updateAuthButton() {
  const authButton = document.getElementById("authButton");
  const signOutButton = document.getElementById("signOutButton");

  console.log("🔍 Debugging updateAuthButton...", { authButton, signOutButton });
  const idToken = sessionStorage.getItem("idToken_defaultUser");
  console.log("🔑 Token Found:", idToken);

  if (idToken && isTokenValid(idToken)) {
    console.log("✅ User is logged in. Updating buttons to 'Sign Out'...");
    if (authButton) {
      authButton.innerHTML = `<i class="bi bi-box-arrow-right"></i> <span>Sign Out</span>`;
      authButton.onclick = handleSignOut;
      authButton.style.display = "block";
    }
    if (signOutButton) {
      signOutButton.innerHTML = `<i class="bi bi-box-arrow-right"></i> <span>Sign Out</span>`;
      signOutButton.onclick = handleSignOut;
      signOutButton.style.display = "block";
    }
  } else {
    console.log("❌ User is logged out. Updating buttons to 'Login'...");
    if (authButton) {
      authButton.innerHTML = `<i class="bi bi-box-arrow-in-right"></i> <span>Login</span>`;
      authButton.onclick = redirectToCognito;
    }
    if (signOutButton) {
      signOutButton.innerHTML = `<i class="bi bi-box-arrow-in-right"></i> <span>Login</span>`;
      signOutButton.onclick = redirectToCognito;
      signOutButton.style.display = "none";
    }
  }
}

export function ensureSignOutButtonExists() {
  const signOutButton = document.getElementById("signOutButton");
  if (signOutButton) {
    console.log("✅ signOutButton found! Updating auth buttons...");
    updateAuthButton();
  }
}

export function handleSignOut() {
  clearTokens("defaultUser");
  updateAuthButton();
  window.location.assign("index.html");
}

//
// 7) Profile update call (unchanged)
//
export async function updateUserProfileAfterLogin(email, name) {
  if (!email) {
    console.error("❌ Missing email! Cannot update user profile.");
    return;
  }
  const apiUrl =
    "https://18ygiad1a8.execute-api.us-east-1.amazonaws.com/dev/updateProfileAfterFirstLogin";
  const requestBody = JSON.stringify({
    body: JSON.stringify({ Email: email, Name: name }),
  });
  console.log(`📩 Sending update request for: Email=${email}, Name=${name}`);
  console.log("📝 Request Body:", requestBody);
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody,
    });
    const result = await response.json();
    console.log("✅ User profile update response:", result);
    if (response.ok) {
      console.log("✅ User profile successfully updated in DynamoDB!");
    } else {
      console.warn("⚠ Failed to update user profile in DynamoDB:", result.error);
    }
  } catch (error) {
    console.error("❌ Error updating user profile in DynamoDB:", error);
  }
}

//
// 8) Main login flow
//
export async function handleOAuthLogin(userId = "defaultUser") {
  try {
    // 1) Check if we got a ?code=... in the URL
    const code = getQueryParam("code");
    if (code) {
      console.log("Found code in query string. Exchanging for tokens...");
      // Exchange the code for tokens
      const tokenResult = await exchangeCodeForTokens(code);
      // tokenResult should have { id_token, access_token, refresh_token, ... }

      // 2) Save tokens to sessionStorage
      saveTokens(userId, tokenResult);

      // 3) Remove "?code=..." from the URL (so it doesn't linger in the address bar)
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 4) Now see if we have valid tokens in storage
    const tokens = getTokensFromStorage(userId);
    if (tokens.id_token && isTokenValid(tokens.id_token)) {
      console.log("✅ Valid token in sessionStorage. Updating UI...");
      updateAuthButton();

      // 5) Optionally update user profile in DynamoDB
      const decodedToken = parseJwt(tokens.id_token);
      const userEmail = decodedToken?.email;
      const userName = decodedToken?.name || "Unknown User";
      if (userEmail) {
        console.log("📩 Attempting to update user profile in DynamoDB...");
        updateUserProfileAfterLogin(userEmail, userName);
      } else {
        console.warn("⚠ User email not found in token.");
      }
    } else {
      // No valid token in storage → user is effectively logged out
      console.log("⚠ No valid token found in storage.");
      updateAuthButton(); // This will set the Login button, etc.
    }
  } catch (error) {
    console.error("❌ Error in handleOAuthLogin:", error);
    // Potentially redirect to login again
  }
}

//
// 9) If your page is protected, call handleLoginFlow
//
export function handleLoginFlow() {
  // Attempt the login / token exchange
  handleOAuthLogin("defaultUser")
    .then(() => {
      // After we try to login, check if protected
      const isProtectedPage = !!document.querySelector('[data-protected="true"]');
      if (isProtectedPage) {
        // If still no valid tokens, redirect
        const tokens = getTokensFromStorage("defaultUser");
        if (!tokens.id_token || !isTokenValid(tokens.id_token)) {
          redirectToCognito();
        }
      }
    })
    .catch((err) => {
      console.error("❌ handleLoginFlow error:", err);
      redirectToCognito();
    });
}
