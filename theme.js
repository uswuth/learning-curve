/* ============================================================
   theme.js — fully self-contained theme system.
   Drop ONE <script src="theme.js"></script> on any page and it:
     1. Injects themes.css (only once, ever)
     2. Applies the persisted theme from localStorage
     3. Creates the switcher DOM (if it doesn't exist)
     4. Builds the switcher UI
   No per-page HTML wiring needed — just the script tag.
   ============================================================ */

(function () {
  "use strict";

  var THEMES = ["nord", "misty", "onedark"];
  var DEFAULT_THEME = "nord";
  var STORAGE_KEY = "lc-theme";
  var CSS_PATH = "themes.css";
  var SWITCHER_ID = "theme-switcher";

  /* ---- persistence ---- */
  function getStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (_) { return null; }
  }
  function store(v) {
    try { localStorage.setItem(STORAGE_KEY, v); } catch (_) {}
  }
  function getPreferred() {
    var s = getStored();
    if (s && THEMES.indexOf(s) !== -1) return s;
    return DEFAULT_THEME;
  }
  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    store(theme);
  }

  /* ---- dynamic stylesheet injection ---- */
  function ensureCss() {
    if (document.querySelector('link[rel="stylesheet"][href="' + CSS_PATH + '"]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = CSS_PATH;
    // Set crossOrigin for robustness
    link.setAttribute("data-theme-css", "1");
    var head = document.head || document.getElementsByTagName("head")[0];
    if (head) head.appendChild(link);
    else document.documentElement.appendChild(link);
  }

  /* ---- switcher DOM creation ---- */
  function getOrCreateSwitcher() {
    var el = document.getElementById(SWITCHER_ID);
    if (el) return el;
    el = document.createElement("div");
    el.id = SWITCHER_ID;
    document.body.appendChild(el);
    return el;
  }

  function buildSwitcher(container) {
    container.className = "theme-switcher";
    var current = document.documentElement.getAttribute("data-theme") || DEFAULT_THEME;
    THEMES.forEach(function (t) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "theme-btn";
      btn.setAttribute("data-theme", t);
      if (t === current) btn.classList.add("active");
      btn.setAttribute("aria-label", "Switch to " + t + " theme");
      btn.innerHTML =
        '<span class="dot"></span><span class="label">' + labelFor(t) + "</span>";
      (function (btn, t) {
        btn.addEventListener("click", function () {
          apply(t);
          refreshSwitcher(container);
        });
      })(btn, t);
      container.appendChild(btn);
    });
  }

  function refreshSwitcher(container) {
    var current = document.documentElement.getAttribute("data-theme") || DEFAULT_THEME;
    var btns = container.querySelectorAll(".theme-btn");
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle("active", btns[i].getAttribute("data-theme") === current);
    }
  }

  function labelFor(t) {
    return ({ nord: "Nord", misty: "Misty", onedark: "One Dark" })[t] || t;
  }

  /* ---- boot ---- */
  function boot() {
    ensureCss();
    apply(getPreferred());
    // Only render the switcher on the root/index page.
    // Topic/detail pages just inherit the theme — no switcher UI needed.
    var path = location.pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '');
    if (path === '' || path === '/') {
      var container = getOrCreateSwitcher();
      buildSwitcher(container);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    // Body may not exist yet for early script tags — retry briefly
    if (document.body) boot();
    else setTimeout(boot, 50);
  }
})();
