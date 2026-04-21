const CACHE = "holzservice-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "https://unpkg.com/react@18/umd/react.development.js",
  "https://unpkg.com/react-dom@18/umd/react-dom.development.js",
  "https://unpkg.com/@babel/standalone/babel.min.js"
];

// Installation – Assets cachen
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

// Aktivierung – alten Cache löschen
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch – Cache first, dann Netzwerk
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
