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

    // Consolidated Login Management with Additional Functions

    /**
     * Extract query parameters from URL
     */
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    /**
     * Parse tokens from URL hash
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

    /**
     * Decode JWT token and extract payload
     */
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

    /**
     * Save tokens to localStorage
     */
    function saveTokens(tokens) {
        if (tokens.id_token) localStorage.setItem('idToken', tokens.id_token);
        if (tokens.access_token) localStorage.setItem('accessToken', tokens.access_token);
        if (tokens.refresh_token) localStorage.setItem('refreshToken', tokens.refresh_token);
    }

    /**
     * Retrieve tokens from localStorage
     */
    function getTokensFromStorage() {
        return {
            id_token: localStorage.getItem('idToken'),
            access_token: localStorage.getItem('accessToken'),
            refresh_token: localStorage.getItem('refreshToken')
        };
    }

    /**
     * Handle login process via OAuth2
     */
    async function handleOAuthLogin() {
        let tokens = getTokensFromStorage();

        if (!tokens.id_token) {
            tokens = parseTokens(); // Extract tokens from the URL
            if (tokens.id_token) {
                saveTokens(tokens); // Save tokens to localStorage
                window.history.replaceState({}, document.title, '/'); // Clean up URL
            } else {
                console.error("No ID token found in URL or localStorage.");
                return;
            }
        }

        // Decode user info from the ID token
        try {
            const userInfo = parseJwt(tokens.id_token);
            console.log("User Info:", userInfo);

            // Update the UI with user details
            updateUserInfo(userInfo);
        } catch (error) {
            console.error("Error decoding ID token:", error);
        }
    }

    /**
     * Handle login process via form (email/password)
     */
    async function handleFormLogin(event) {
        event.preventDefault(); // Prevent form reload

        const email = document.getElementById('yourUsername')?.value.trim();
        const password = document.getElementById('yourPassword')?.value.trim();

        if (!email || !password) {
            alert('Please enter both email and password.');
            return;
        }

        const loginButton = event.target.querySelector('button');
        loginButton.textContent = 'Logging in...';
        loginButton.disabled = true;

        try {
            const response = await fetch('https://kzgutwddhk.execute-api.us-east-1.amazonaws.com/askQuestion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (response.ok) {
                alert(`Welcome, ${result.name || 'User'}!`);
                window.location.href = 'dashboard.html';
            } else {
                alert(result.error || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            alert('An error occurred while logging in. Please try again.');
        } finally {
            loginButton.textContent = 'Login';
            loginButton.disabled = false;
        }
    }

    /**
     * Update the UI with user details
     */
    function updateUserInfo(userInfo) {
        document.querySelectorAll('.user-name').forEach(el => {
            el.textContent = userInfo.name || 'Guest';
        });
        document.querySelectorAll('.user-email').forEach(el => {
            el.textContent = userInfo.email || 'No Email';
        });
    }

    /**
     * Save profile changes to the server
     */
    async function saveProfileChanges() {
        const updatedName = document.getElementById('fullName')?.value.trim();
        const updatedBio = document.getElementById('about')?.value.trim();
        const updatedPhone = document.getElementById('Phone')?.value.trim();
        const updatedEmail = document.getElementById('Email')?.value.trim();
        const updatedLinkedin = document.getElementById('Linkedin')?.value.trim();

        if (!updatedEmail) {
            alert("Email is required.");
            return;
        }

        const idToken = localStorage.getItem('idToken');
        if (!idToken) {
            alert("User is not authenticated.");
            return;
        }

        const userEmail = parseJwt(idToken).email || updatedEmail;

        try {
            const apiUrl = `https://3i1nb1t27e.execute-api.us-east-1.amazonaws.com/stage/updateProfile`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': idToken
                },
                body: JSON.stringify({
                    Email: userEmail,
                    Name: updatedName,
                    Bio: updatedBio,
                    phone: updatedPhone,
                    linkedin: updatedLinkedin
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert("Profile updated successfully!");
            } else {
                alert(`Failed to update profile: ${result.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("An error occurred while updating the profile.");
        }
    }

    /**
     * Resize eCharts on container size change
     */
    function handleChartResize() {
        const mainContainer = document.querySelector('#main');
        if (mainContainer) {
            setTimeout(() => {
                new ResizeObserver(() => {
                    document.querySelectorAll('.echart').forEach(chartElement => {
                        const chartInstance = echarts.getInstanceByDom(chartElement);
                        if (chartInstance) chartInstance.resize();
                    });
                }).observe(mainContainer);
            }, 200);
        }
    }

    // Attach event listeners for form login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleFormLogin);
    }

    // Initialize OAuth login and additional features on page load
    document.addEventListener('DOMContentLoaded', () => {
        handleOAuthLogin();
        handleChartResize();
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

        // Event listener for the "Save Changes" button - UpdateBio


        document.addEventListener('DOMContentLoaded', () => {

        });



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
                const response = await fetch('https://3i1nb1t27e.execute-api.us-east-1.amazonaws.com/stage/AskGPT   ', {
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

                console.log(JSON.stringify({
                    email: userEmail, // Use the email from the token
                    question: message
                }));

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


    const saveChangesBtn = document.getElementById('saveChangesBtn');
    console.log("Button Element:", saveChangesBtn);


    if (saveChangesBtn) {
        saveChangesBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            console.log("✅ Save Changes button clicked");

            // Extract updated values from form fields
            const updatedName = document.getElementById('fullName')?.value.trim();
            const updatedBio = document.getElementById('about')?.value.trim();
            const updatedPhone = document.getElementById('Phone')?.value.trim();
            const updatedEmail = document.getElementById('Email')?.value.trim();
            const updatedLinkedin = document.getElementById('Linkedin')?.value.trim();

            // Ensure required fields are provided
            if (!updatedEmail) {
                alert("Email is required.");
                return;
            }

            // Retrieve the ID token from localStorage
            const idToken = localStorage.getItem('idToken');
            if (!idToken) {
                alert("User is not authenticated.");
                return;
            }

            console.log("🔑 ID Token found, extracting user email...");
            const base64Url = idToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const decodedToken = JSON.parse(decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
                    .join('')
            ));

            const userEmail = decodedToken.email || updatedEmail;
            console.log("📧 User Email:", userEmail);

            try {
                // Construct API URL with query parameters
                const apiUrl = `https://3i1nb1t27e.execute-api.us-east-1.amazonaws.com/stage/updateProfile`;

                console.log("🚀 Sending API Request to:", apiUrl);

                // Send update request with JSON body
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': idToken, // Assuming the Lambda expects an Authorization header
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
                console.log("📥 API Response:", result);

                if (response.ok) {
                    alert("Profile updated successfully!");
                } else {
                    alert(`⚠️ Failed to update profile: ${result.error || 'Unknown error'}`);
                }
            } catch (error) {
                console.error("❌ Error updating profile:", error);
                alert("An error occurred while updating the profile.");
            }
        });
    } else {
        console.log("❌ Save Changes button NOT found in the DOM!");
    }
})();