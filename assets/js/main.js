/**

* Template URL: https://bootstrapmade.com/nice-admin-bootstrap-admin-html-template/
* Updated: Apr 20 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function () {
    "use strict";

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
            select(el, all).forEach(e => e.addEventListener(type, listener));
        } else {
            select(el, all).addEventListener(type, listener);
        }
    };

    /**
     * Easy on scroll event listener 
     */
    const onscroll = (el, listener) => {
        el.addEventListener('scroll', listener);
    };

    /**
     * Sidebar toggle
     */
    if (select('.toggle-sidebar-btn')) {
        on('click', '.toggle-sidebar-btn', function (e) {
            select('body').classList.toggle('toggle-sidebar');
        });
    }

    /**
     * Search bar toggle
     */
    if (select('.search-bar-toggle')) {
        on('click', '.search-bar-toggle', function (e) {
            select('.search-bar').classList.toggle('search-bar-show');
        });
    }

    /**
     * Navbar links active state on scroll
     */
    let navbarlinks = select('#navbar .scrollto', true);
    const navbarlinksActive = () => {
        let position = window.scrollY + 200;
        navbarlinks.forEach(navbarlink => {
            if (!navbarlink.hash) return;
            let section = select(navbarlink.hash);
            if (!section) return;
            if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
                navbarlink.classList.add('active');
            } else {
                navbarlink.classList.remove('active');
            }
        });
    };
    window.addEventListener('load', navbarlinksActive);
    onscroll(document, navbarlinksActive);

    /**
     * Toggle .header-scrolled class to #header when page is scrolled
     */
    let selectHeader = select('#header');
    if (selectHeader) {
        const headerScrolled = () => {
            if (window.scrollY > 100) {
                selectHeader.classList.add('header-scrolled');
            } else {
                selectHeader.classList.remove('header-scrolled');
            }
        };
        window.addEventListener('load', headerScrolled);
        onscroll(document, headerScrolled);
    }

    /**
     * Back to top button
     */
    let backtotop = select('.back-to-top');
    if (backtotop) {
        const toggleBacktotop = () => {
            if (window.scrollY > 100) {
                backtotop.classList.add('active');
            } else {
                backtotop.classList.remove('active');
            }
        };
        window.addEventListener('load', toggleBacktotop);
        onscroll(document, toggleBacktotop);
    }

    /**
     * Initiate tooltips
     */
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    /**
     * Initiate quill editors
     */
    if (select('.quill-editor-default')) {
        new Quill('.quill-editor-default', {
            theme: 'snow'
        });
    }

    if (select('.quill-editor-bubble')) {
        new Quill('.quill-editor-bubble', {
            theme: 'bubble'
        });
    }

    if (select('.quill-editor-full')) {
        new Quill(".quill-editor-full", {
            modules: {
                toolbar: [
                    [{ font: [] }, { size: [] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ color: [] }, { background: [] }],
                    [{ script: "super" }, { script: "sub" }],
                    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
                    ["direction", { align: [] }],
                    ["link", "image", "video"],
                    ["clean"]
                ]
            },
            theme: "snow"
        });
    }

    /**
     * Initiate TinyMCE Editor
     */

    const useDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isSmallScreen = window.matchMedia('(max-width: 1023.5px)').matches;

    tinymce.init({
        selector: 'textarea.tinymce-editor',
        plugins: 'preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons accordion',
        editimage_cors_hosts: ['picsum.photos'],
        menubar: 'file edit view insert format tools table help',
        toolbar: "undo redo | accordion accordionremove | blocks fontfamily fontsize | bold italic underline strikethrough | align numlist bullist | link image | table media | lineheight outdent indent| forecolor backcolor removeformat | charmap emoticons | code fullscreen preview | save print | pagebreak anchor codesample | ltr rtl",
        autosave_ask_before_unload: true,
        autosave_interval: '30s',
        autosave_prefix: '{path}{query}-{id}-',
        autosave_restore_when_empty: false,
        autosave_retention: '2m',
        image_advtab: true,
        link_list: [{
            title: 'My page 1',
            value: 'https://www.tiny.cloud'
        },
        {
            title: 'My page 2',
            value: 'http://www.moxiecode.com'
        }
        ],
        image_list: [{
            title: 'My page 1',
            value: 'https://www.tiny.cloud'
        },
        {
            title: 'My page 2',
            value: 'http://www.moxiecode.com'
        }
        ],
        image_class_list: [{
            title: 'None',
            value: ''
        },
        {
            title: 'Some class',
            value: 'class-name'
        }
        ],
        importcss_append: true,
        file_picker_callback: (callback, value, meta) => {
            /* Provide file and text for the link dialog */
            if (meta.filetype === 'file') {
                callback('https://www.google.com/logos/google.jpg', {
                    text: 'My text'
                });
            }

            /* Provide image and alt text for the image dialog */
            if (meta.filetype === 'image') {
                callback('https://www.google.com/logos/google.jpg', {
                    alt: 'My alt text'
                });
            }

            /* Provide alternative source and posted for the media dialog */
            if (meta.filetype === 'media') {
                callback('movie.mp4', {
                    source2: 'alt.ogg',
                    poster: 'https://www.google.com/logos/google.jpg'
                });
            }
        },
        height: 600,
        image_caption: true,
        quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
        noneditable_class: 'mceNonEditable',
        toolbar_mode: 'sliding',
        contextmenu: 'link image table',
        skin: useDarkMode ? 'oxide-dark' : 'oxide',
        content_css: useDarkMode ? 'dark' : 'default',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }'
    });

    /**
     * Initiate Bootstrap validation check
     */
    var needsValidation = document.querySelectorAll('.needs-validation');

    Array.prototype.slice.call(needsValidation)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                form.classList.add('was-validated');
            }, false);
        });

    /**
     * Initiate Datatables
     */
    const datatables = select('.datatable', true);
    datatables.forEach(datatable => {
        new simpleDatatables.DataTable(datatable, {
            perPageSelect: [5, 10, 15, ["All", -1]],
            columns: [{
                select: 2,
                sortSequence: ["desc", "asc"]
            },
            {
                select: 3,
                sortSequence: ["desc"]
            },
            {
                select: 4,
                cellClass: "green",
                headerClass: "red"
            }
            ]
        });
    });

    /**
     * Login Form Handling
     */
    document.addEventListener('DOMContentLoaded', () => {
        const loginForm = document.getElementById('loginForm');

        if (loginForm) {
            loginForm.addEventListener('submit', async (event) => {
                event.preventDefault(); // Prevent the form from reloading the page

                // Retrieve user inputs
                const email = document.getElementById('yourUsername')?.value.trim();
                const password = document.getElementById('yourPassword')?.value.trim();

                // Validate user inputs
                if (!email || !password) {
                    alert('Please enter both email and password.');
                    return;
                }

                // Disable the login button and show processing message
                const loginButton = loginForm.querySelector('button');
                loginButton.textContent = 'Logging in...';
                loginButton.disabled = true;

                try {
                    // API Gateway endpoint
                    const response = await fetch('https://kzgutwddhk.execute-api.us-east-1.amazonaws.com/askQuestion', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email,       // User email
                            password,    // User password
                        }),
                    });

                    const result = await response.json();

                    // Handle response
                    if (response.ok) {
                        alert(`Welcome, ${result.name || 'User'}!`);
                        window.location.href = 'dashboard.html'; // Redirect to the dashboard page
                    } else {
                        alert(result.error || 'Login failed. Please check your credentials.');
                    }
                } catch (error) {
                    console.error('Error logging in:', error);
                    alert('An error occurred while logging in. Please try again.');
                } finally {
                    // Re-enable the login button
                    loginButton.textContent = 'Login';
                    loginButton.disabled = false;
                }
            });
        }
    });

    /**
     * Autoresize echart charts
     */
    const mainContainer = select('#main');
    if (mainContainer) {
        setTimeout(() => {
            new ResizeObserver(function () {
                select('.echart', true).forEach(getEchart => {
                    echarts.getInstanceByDom(getEchart).resize();
                });
            }).observe(mainContainer);
        }, 200);
    }

})();



/* Chat Handling */
document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-btn');

    // Check if necessary elements are present
    if (!chatWindow || !chatInput || !sendButton) {
        console.log("One or more required elements are missing!");
        return;
    }

    /**
     * Escape HTML to prevent XSS attacks.
     * @param {string} str - Input string to escape.
     * @returns {string} Escaped HTML string.
     */
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.innerText = str;
        return div.innerHTML;
    }

    /**
     * Add a message to the chat window.
     * @param {string} content - The message content.
     * @param {string} sender - The sender of the message ('user' or 'api').
     */
    function addMessage(content, sender = 'user') {
        const message = document.createElement('div');
        message.className = `message ${sender}`;
        message.innerHTML = escapeHTML(content).replace(/\n/g, '<br>'); // Preserve line breaks
        chatWindow.appendChild(message);
        chatWindow.scrollTop = chatWindow.scrollHeight; // Scroll to the bottom
    }

    // Event listener for the "Send" button
    sendButton.addEventListener('click', async () => {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add the user's message to the chat
        addMessage(message, 'user'); // Corrected variable name
        chatInput.value = ''; // Clear the input field
        chatInput.focus(); // Refocus the input field

        try {
            // Retrieve the ID token from localStorage
            const idToken = localStorage.getItem('idToken');
            if (!idToken) {
                addMessage('Authentication failed. Please log in again.', 'api');
                return;
            }

            // Decode the JWT token to extract the user's email
            const base64Url = idToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const decodedToken = JSON.parse(decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
                    .join('')
            ));

            const userEmail = decodedToken.email;
            if (!userEmail) {
                addMessage('Email not found in token.', 'api');
                return;
            }

            // Call the API Gateway endpoint
            const response = await fetch('https://dqf0c1okf1.execute-api.us-east-1.amazonaws.com/Stage/AskGPT', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Origin': window.location.origin,
                },
                body: JSON.stringify({
                    email: userEmail, // Use the email from the token
                    question: message
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get a response from the server');
            }

            const result = await response.json();
            console.log(result);

            // Parse the `body` string if it exists
            let parsedBody = {};
            if (result.body) {
                parsedBody = JSON.parse(result.body);
            }

            // Add the GPT's answer to the chat
            if (parsedBody.answer) {
                addMessage(parsedBody.answer, 'api');
            } else {
                addMessage('Sorry, something went wrong. Please try again.', 'api');
            }
        } catch (error) {
            console.error('Error:', error);
            addMessage('An error occurred while fetching the answer. Please try again.', 'api');
        }
    });

    // Handle "Enter" key press
    chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent new line
            sendButton.click(); // Trigger the send button
        }
    });
});


/* login handler*/
function getAuthorizationCode() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('code'); // This retrieves the 'code' parameter from the URL
}

// Check if there's an authorization code in the URL
const authCode = getAuthorizationCode();
if (authCode) {
    console.log("Authorization Code:", authCode);
    // Proceed to exchange the code for tokens
}

async function exchangeCodeForToken(authCode) {
    try {
        console.log("Authorization Code:", authCode); // Log the authCode

        const tokenEndpoint = 'https://us-east-1yfkzkrdrk.auth.us-east-1.amazoncognito.com/oauth2/token';
        const clientId = '6q9dfaem3aaobkec9fs0p2n07e';
        const redirectUri = 'http://studybuddy-website.s3-website-us-east-1.amazonaws.com';
        const body = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: clientId,
            redirect_uri: redirectUri,
            code: authCode
        });

        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body
        });

        if (!response.ok) {
            console.error("Failed to exchange code:", response.status, response.statusText);
            return;
        }

        const data = await response.json();
        console.log("Token Exchange Response:", data); // Log the full response

        // Store tokens in localStorage
        localStorage.setItem('idToken', data.id_token);
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        console.log("Tokens saved to localStorage.");
    } catch (error) {
        console.error("Error exchanging code for tokens:", error);
    }
}

async function fetchUserDetails() {
    const idToken = localStorage.getItem('idToken');
    if (!idToken) {
        console.error('ID token not found.');
        return;
    }

    const decodedToken = JSON.parse(atob(idToken.split('.')[1])); // Decode the JWT token
    return decodedToken; // Contains user attributes like email, name, etc.
}
document.addEventListener('DOMContentLoaded', async () => {
    const authCode = getAuthorizationCode();

    if (authCode) {
        await exchangeCodeForToken(authCode);
        window.history.replaceState({}, document.title, '/');
    }

    const userDetails = await fetchUserDetails();
    if (userDetails) {
        document.querySelectorAll('.user-name').forEach((el) => {
            el.textContent = userDetails.name || 'Guest';
        });

        document.querySelectorAll('.user-email').forEach((el) => {
            el.textContent = userDetails.email || 'No email';
        });
    }
});


// Function to extract query parameters from the URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}



// Function to handle login and display user info
// Function to parse tokens from the URL hash
function parseHashParams() {
    const hash = window.location.hash.substring(1); // Remove the leading '#'
    const params = {};
    hash.split('&').forEach(param => {
        const [key, value] = param.split('=');
        params[key] = decodeURIComponent(value);
    });
    return params;
}

/**
 * Parse tokens from URL hash or query parameters
 */
function parseTokens() {
    const hash = window.location.hash.substring(1); // Remove leading '#'
    const params = {};
    hash.split('&').forEach(param => {
        const [key, value] = param.split('=');
        params[key] = decodeURIComponent(value);
    });
    return params;
}

// Function to decode JWT token and get the email
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
            .join('')
    );
    return JSON.parse(jsonPayload);
}

// Function to fetch student profile from the API Gateway
async function fetchStudentProfile() {
    const idToken = localStorage.getItem('idToken'); // Retrieve the ID token
    if (!idToken) {
        alert('User is not authenticated.');
        return;
    }

    // Decode the token to get the email
    const decodedToken = parseJwt(idToken);
    const email = decodedToken.email;

    if (!email) {
        alert('Email not found in token.');
        return;
    }

    console.log('Email being sent:', email); // Log the email

    try {
        // Call the API Gateway to fetch the student profile
        const response = await fetch('https://dqf0c1okf1.execute-api.us-east-1.amazonaws.com/getstudentProfile/updateProfile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ Email: email }), // Ensure this matches the API's expected format
        });

        console.log('API Request:', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Email: email }),
        });

        if (response.ok) {
            const profile = await response.json();
            console.log('API Response:', profile); // Log the full API response
            updateProfileUI(profile); // Update the UI with the fetched profile
        } else {
            const error = await response.json();
            console.error('Failed to fetch profile:', error);
            alert('Failed to fetch profile. Please try again.');
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        alert('An error occurred. Please try again later.');
    }
}

// Function to update the UI with profile data
function updateProfileUI(profile) {
    const fullNameEl = document.getElementById('fullName');
    const aboutEl = document.getElementById('about');
    const phoneEl = document.getElementById('Phone');
    const emailEl = document.getElementById('Email');
    const linkedinEl = document.getElementById('Linkedin');

    // Update the fields in the form
    if (fullNameEl) fullNameEl.value = profile.Name || '';
    if (aboutEl) aboutEl.value = profile.Bio || '';
    if (phoneEl) phoneEl.value = profile.phone || '';
    if (emailEl) emailEl.value = profile.Email || '';
    if (linkedinEl) linkedinEl.value = profile['linkedin profile'] || '';

    // Update the `.user-name` element with the fetched full name
    document.querySelectorAll('.user-name').forEach((el) => {
        el.textContent = profile.Name || 'Guest';
    });
}


// Call fetchStudentProfile on page load
document.addEventListener('DOMContentLoaded', fetchStudentProfile);

/**
 * Function to update user info in the UI
 * @param {Object} userInfo - Object containing user details
 */
function updateUserInfo(userInfo) {
    // Update the HTML elements with the user details
    document.querySelectorAll('.user-name').forEach((el) => {
        el.textContent = userInfo.name || 'Guest';
    });

    document.querySelectorAll('.user-email').forEach((el) => {
        el.textContent = userInfo.email || 'No Email';
    });

    // If there are other elements to update, add them here
}


/**
 * Handle login process
 */
function handleLogin() {
    // Try to get tokens from localStorage first
    let idToken = localStorage.getItem('idToken');
    let accessToken = localStorage.getItem('accessToken');
    let refreshToken = localStorage.getItem('refreshToken');

    if (!idToken) {
        // If tokens are not in localStorage, attempt to parse them from the URL
        const tokens = parseTokens(); // Extract tokens from the URL hash
        if (tokens.id_token) {
            idToken = tokens.id_token;
            accessToken = tokens.access_token;
            refreshToken = tokens.refresh_token;

            // Save tokens to localStorage for future use
            localStorage.setItem('idToken', idToken);
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            // Remove tokens from the URL to clean up the address bar
            window.history.replaceState({}, document.title, '/studybuddy/index.html');
        } else {
            console.error("No ID token found in the URL or localStorage.");
            return; // Exit if no tokens are found
        }
    }

    // Decode user info from the ID token
    try {
        const userInfo = parseJwt(idToken);
        console.log("User Info:", userInfo);

        // Update the page with user details
        updateUserInfo(userInfo);
    } catch (error) {
        console.error("Error decoding ID token:", error);
    }
}


// Call handleLogin on page load
document.addEventListener('DOMContentLoaded', handleLogin);
 