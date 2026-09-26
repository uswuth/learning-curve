/* ============================================================
   sw.js — Theme injection Service Worker.
   Intercepts every navigation request for HTML pages and
   patches the response to include:
     <link rel="stylesheet" href="themes.css">
     <script src="theme.js"></script>
   This means every page on the site gets the theme switcher
   and palette automatically — no per-page wiring needed.
   ============================================================ */

const THEME_CSS = "/themes.css";
const THEME_JS = "/theme.js";

/* Only patch top-level document navigations (HTML pages). */
self.addEventListener("fetch", function (event) {
  var url = event.request.url;
  var mode = event.request.mode;

  // Only intercept document (navigation) requests for our origin
  if (mode !== "navigate") return;
  if (!url.match(/^https?:\/\/[^/]+?\//)) return;

  event.respondWith(
    fetchAndPatch(event.request)
  );
});

async function fetchAndPatch(request) {
  try {
    var response = await fetch(request);
    var contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return response;
    if (response.status !== 200) return response;

    var html = await response.text();
    var patched = injectThemeAssets(html);

    // Rebuild response with patched body, preserving headers
    var newHeaders = new Headers(response.headers);
    newHeaders.set("content-length", String(new Blob([patched]).size));
    return new Response(patched, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  } catch (err) {
    // Fail open — if patching fails, return original response
    console.error("Theme SW patch failed:", err);
    return fetch(request);
  }
}

function injectThemeAssets(html) {
  var result = html;
  // PATH-AGNOSTIC duplicate detection:
  // Check if themes.css and theme.js are already referenced anywhere
  // in the document (any path — relative or absolute).
  var hasCss = /<link[^>]+href\s*=\s*["'][^"']*\bthemes\.css\b/i.test(result);
  var hasJs  = /<script[^>]+src\s*=\s*["'][^"']*\btheme\.js\b/i.test(result);
  // Inject only what's missing
  if (!hasCss) {
    if (result.indexOf('<head>') !== -1) {
      result = result.replace(/<head[^>]*>/, function (m) {
        return m + cssLink;
      });
    } else {
      result = cssLink + result;
    }
  }
  if (!hasJs) {
    if (result.indexOf('</body>') !== -1) {
      result = result.replace(/<\/body>/i, jsScript + '\n</body');
    } else {
      result = result + jsScript;
    }
  }
  return result;
}

/* ---- Install: cache theme assets immediately ---- */
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open("theme-assets-v1").then(function (cache) {
      return cache.addAll([THEME_CSS, THEME_JS]);
    })
  );
  self.skipWaiting();
});

/* ---- Activate: clean old caches ---- */
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== "theme-assets-v1"; })
            .map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

/* ---- Serve cached theme assets offline ---- */
self.addEventListener("fetch", function (event) {
  var url = event.request.url;
  if (url === THEME_CSS || url === THEME_JS) {
    event.respondWith(
      caches.match(event.request).then(function (cached) {
        return cached || fetch(event.request);
      })
    );
  }
});
