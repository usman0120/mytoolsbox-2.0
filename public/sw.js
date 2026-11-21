/* MyToolsBox service worker (blueprint section 17).
 * - App shell and visited tool pages work offline (network first, cache fallback, /offline page).
 * - Hashed build assets, pdf.js and fonts are cache-first (they never change under the same URL).
 * - Files shared from the phone's share sheet go straight into the File Tray (IndexedDB) on this device.
 * Bump VERSION to drop old caches on deploy. */
const VERSION = "v1";
const SHELL = `mtb-shell-${VERSION}`;
const PAGES = `mtb-pages-${VERSION}`;
const ASSETS = `mtb-assets-${VERSION}`;
const PRECACHE = ["/", "/offline", "/icons/icon-192.png", "/icons/icon-512.png"];
const MAX_PAGES = 60;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("mtb-") && !k.endsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - max))) await cache.delete(key);
}

async function networkFirstPage(request) {
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      const copy = response.clone();
      caches.open(PAGES).then((c) => c.put(request, copy).then(() => trim(PAGES, MAX_PAGES)));
    }
    return response;
  } catch {
    return (await caches.match(request, { ignoreSearch: true })) || (await caches.match("/offline")) || Response.error();
  }
}

async function cacheFirst(request) {
  const hit = await caches.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) {
    const copy = response.clone();
    caches.open(ASSETS).then((c) => c.put(request, copy));
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(ASSETS);
  const hit = await cache.match(request);
  const fresh = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => hit);
  return hit || fresh;
}

// --- Share target: store shared files in the Tray's IndexedDB, then open the app. -----------------
function openTrayDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("mytoolsbox-tray", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("files", { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function handleShare(request) {
  let count = 0;
  try {
    const form = await request.formData();
    const files = form.getAll("files").filter((f) => f instanceof File && f.size > 0 && f.size <= 500 * 1024 * 1024);
    const db = await openTrayDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction("files", "readwrite");
      const store = tx.objectStore("files");
      for (const file of files.slice(0, 20)) {
        store.put({
          id: crypto.randomUUID(),
          name: file.name || "shared-file",
          mime: file.type || "application/octet-stream",
          size: file.size,
          origin: "share",
          kind: "input",
          createdAt: Date.now(),
          pinned: false,
          blob: file,
        });
        count++;
      }
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    const text = [form.get("title"), form.get("text"), form.get("url")].filter(Boolean).join(" ").slice(0, 200);
    if (!count && text) return Response.redirect(`/?open=ask&q=${encodeURIComponent(text)}`, 303);
  } catch {
    // fall through: open the app anyway
  }
  return Response.redirect(`/?open=tray&shared=${count}`, 303);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.method === "POST" && url.pathname === "/share-target") {
    event.respondWith(handleShare(request));
    return;
  }
  if (request.method !== "GET" || url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/pdfjs/") || url.pathname.startsWith("/icons/") || /\.(woff2?|wasm)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (url.pathname === "/search-index.json") {
    event.respondWith(staleWhileRevalidate(request));
  }
});
