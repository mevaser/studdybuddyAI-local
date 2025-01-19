/**

* Template URL: https://bootstrapmade.com/nice-admin-bootstrap-admin-html-template/
* Updated: Apr 20 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    if (all) {
      select(el, all).forEach(e => e.addEventListener(type, listener))
    } else {
      select(el, all).addEventListener(type, listener)
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Sidebar toggle
   */
  if (select('.toggle-sidebar-btn')) {
    on('click', '.toggle-sidebar-btn', function(e) {
      select('body').classList.toggle('toggle-sidebar')
    })
  }

  /**
   * Search bar toggle
   */
  if (select('.search-bar-toggle')) {
    on('click', '.search-bar-toggle', function(e) {
      select('.search-bar').classList.toggle('search-bar-show')
    })
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return
      let section = select(navbarlink.hash)
      if (!section) return
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active')
      } else {
        navbarlink.classList.remove('active')
      }
    })
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = select('#header')
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled')
      } else {
        selectHeader.classList.remove('header-scrolled')
      }
    }
    window.addEventListener('load', headerScrolled)
    onscroll(document, headerScrolled)
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Initiate tooltips
   */
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  })

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
          [{
            font: []
          }, {
            size: []
          }],
          ["bold", "italic", "underline", "strike"],
          [{
              color: []
            },
            {
              background: []
            }
          ],
          [{
              script: "super"
            },
            {
              script: "sub"
            }
          ],
          [{
              list: "ordered"
            },
            {
              list: "bullet"
            },
            {
              indent: "-1"
            },
            {
              indent: "+1"
            }
          ],
          ["direction", {
            align: []
          }],
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
  var needsValidation = document.querySelectorAll('.needs-validation')

  Array.prototype.slice.call(needsValidation)
    .forEach(function(form) {
      form.addEventListener('submit', function(event) {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }

        form.classList.add('was-validated')
      }, false)
    })

  /**
   * Initiate Datatables
   */
  const datatables = select('.datatable', true)
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
  })
    document.addEventListener('DOMContentLoaded', () => {
        const loginForm = document.getElementById('loginForm');

        if (loginForm) {
            loginForm.addEventListener('submit', async (event) => {
                event.preventDefault(); // Prevent the form from reloading the page

                const email = document.getElementById('yourUsername').value;
                const password = document.getElementById('yourPassword').value;

                // Display a message while processing
                const loginButton = loginForm.querySelector('button');
                loginButton.textContent = 'Logging in...';
                loginButton.disabled = true;

                try {
                    // Replace this with your actual API Gateway URL
                    const response = await fetch('YOUR_API_GATEWAY_URL', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                    });

                    const result = await response.json();

                    if (response.ok) {
                        alert(`Welcome, ${result.name}!`);
                        window.location.href = 'dashboard.html'; // Redirect to the dashboard page
                    } else {
                        alert(result.error || 'Login failed. Please check your credentials.');
                    }
                } catch (error) {
                    alert('Error logging in: ' + error.message);
                } finally {
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
      new ResizeObserver(function() {
        select('.echart', true).forEach(getEchart => {
          echarts.getInstanceByDom(getEchart).resize();
        })
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
        console.error("One or more required elements are missing!");
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
    sendButton.addEventListener('click', () => {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add the user's message to the chat
        addMessage(message, 'user');
        chatInput.value = ''; // Clear input field
        chatInput.focus(); // Refocus the input field

        // Simulate an API response
        setTimeout(() => {
            addMessage("This is a response from GPT!", 'api');
        }, 1000);
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

const Amplify = window.Amplify;

Amplify.configure({
    Auth: {
        region: 'us-east-1', // AWS region
        userPoolId: 'us-east-1yfkzkrdrk', // Replace with the User Pool ID (inferred from domain)
        userPoolWebClientId: '6q9dfaem3aaobkec9fs0p2n07e', // Your App Client ID
        oauth: {
            domain: 'us-east-1yfkzkrdrk.auth.us-east-1.amazoncognito.com', // Cognito domain
            scope: ['email', 'openid', 'profile'], // Scopes for authentication
            redirectSignIn: 'http://studybuddy-website.s3-website-us-east-1.amazonaws.com', // Redirect after login
            redirectSignOut: 'http://studybuddy-website.s3-website-us-east-1.amazonaws.com', // Redirect after logout
            responseType: 'code', // Authorization code grant
        },
    },
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
    const clientId = '6q9dfaem3aaobkec9fs0p2n07e';
    const domain = 'us-east-1yfkzkrdrk.auth.us-east-1.amazoncognito.com';
    const redirectUri = 'http://studybuddy-website.s3-website-us-east-1.amazonaws.com';

    try {
        const response = await fetch(`https://${domain}/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: clientId,
                code: authCode,
                redirect_uri: redirectUri,
            }),
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('accessToken', data.access_token);
            localStorage.setItem('idToken', data.id_token);
            return data;
        } else {
            console.error('Error exchanging code for token:', data);
            alert('Failed to log in. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during login.');
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
        window.history.replaceState({}, document.title, '/'); // Remove code from URL
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
