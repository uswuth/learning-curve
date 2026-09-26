// ============================================================
// Theme switcher — persisted in localStorage.
// Reads/writes [data-theme] on <html>.
// Call initTheme() early, before rendering, on every page.
// ============================================================

const THEMES = ["nord", "misty", "onedark"];
const DEFAULT_THEME = "nord";

function getPreferredTheme() {
  const stored = localStorage.getItem("lc-theme");
  if (stored && THEMES.includes(stored)) return stored;
  return DEFAULT_THEME;
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("lc-theme", theme);
}

function initTheme() {
  applyTheme(getPreferredTheme());
}

// ---------- Dropdown switcher (landing + topic pages) ----------

function buildSwitcher(container) {
  container.classList.add("theme-switcher");

  const current = document.documentElement.getAttribute("data-theme") || DEFAULT_THEME;

  THEMES.forEach((t) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-btn";
    btn.setAttribute("data-theme", t);
    if (t === current) btn.classList.add("active");
    btn.setAttribute("aria-label", "Switch to " + t + " theme");
    btn.innerHTML = `<span class="dot"></span><span class="label">${labelFor(t)}</span>`;
    btn.addEventListener("click", () => {
      applyTheme(t);
      refreshSwitcher(container);
    });
    container.appendChild(btn);
  });
}

function refreshSwitcher(container) {
  const current = document.documentElement.getAttribute("data-theme") || DEFAULT_THEME;
  container.querySelectorAll(".theme-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-theme") === current);
  });
}

function labelFor(t) {
  return ({ nord: "Nord", misty: "Misty", onedark: "One Dark" })[t] || t;
}

// Auto-init on any page that includes theme.js
initTheme();
