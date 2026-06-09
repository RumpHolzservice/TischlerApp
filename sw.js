const CACHE = "holzservice-v9";
const ASSETS = [
  "/TischlerApp/",
  "/TischlerApp/index.html",
  "/TischlerApp/manifest.json",
];

self.addEventListener("install", e => {
  self.skipWaiting(); // Sofort aktiv werden
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).catch(() => {})
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => {
        console.log("Alter Cache gelöscht:", k);
        return caches.delete(k);
      }))
    )
  );
  self.clients.claim();
});

// Network first – immer frische Version laden, Cache nur als Fallback
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
