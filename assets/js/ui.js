// js/ui.js
import { select, on, onscroll } from "./utils.js";

export function initSidebarToggle() {
  if (select(".toggle-sidebar-btn")) {
    on("click", ".toggle-sidebar-btn", () => {
      select("body").classList.toggle("toggle-sidebar");
    });
  }
}

export function initSearchBarToggle() {
  if (select(".search-bar-toggle")) {
    on("click", ".search-bar-toggle", () => {
      select(".search-bar").classList.toggle("search-bar-show");
    });
  }
}

export function initNavbarLinksActive() {
  const navbarlinks = select("#navbar .scrollto", true);
  const navbarlinksActive = () => {
    let position = window.scrollY + 200;
    navbarlinks.forEach((navbarlink) => {
      if (!navbarlink.hash) return;
      let section = select(navbarlink.hash);
      if (!section) return;
      if (position >= section.offsetTop && position <= section.offsetTop + section.offsetHeight) {
        navbarlink.classList.add("active");
      } else {
        navbarlink.classList.remove("active");
      }
    });
  };
  window.addEventListener("load", navbarlinksActive);
  onscroll(document, navbarlinksActive);
}

export function initHeaderScrolled() {
  const selectHeader = select("#header");
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
}

export function initBackToTop() {
  const backtotop = select(".back-to-top");
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
}

export function initQuillEditors() {
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
          [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
          ["direction", { align: [] }],
          ["link", "image", "video"],
          ["clean"],
        ],
      },
      theme: "snow",
    });
  }
}

export function initTinyMCE() {
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
        callback("https://www.google.com/logos/google.jpg", { text: "My text" });
      } else if (meta.filetype === "image") {
        callback("https://www.google.com/logos/google.jpg", { alt: "My alt text" });
      } else if (meta.filetype === "media") {
        callback("movie.mp4", { source2: "alt.ogg", poster: "https://www.google.com/logos/google.jpg" });
      }
    },
    height: 600,
    image_caption: true,
    quickbars_selection_toolbar: "bold italic | quicklink h2 h3 blockquote quickimage quicktable",
    noneditable_class: "mceNonEditable",
    toolbar_mode: "sliding",
    contextmenu: "link image table",
    skin: useDarkMode ? "oxide-dark" : "oxide",
    content_css: useDarkMode ? "dark" : "default",
    content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:16px }",
  });
}

export function initBootstrapValidation() {
  const forms = document.querySelectorAll(".needs-validation");
  Array.prototype.slice.call(forms).forEach(function (form) {
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
}

export function initDatatables() {
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
}

export function initEChartsResize() {
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

export function initEChartsAutoResize() {
  const mainContainer = select("#main");
  if (mainContainer) {
    setTimeout(() => {
      new ResizeObserver(() => {
        select(".echart", true).forEach((echartEl) => {
          echarts.getInstanceByDom(echartEl)?.resize();
        });
      }).observe(mainContainer);
    }, 200);
  }
}
