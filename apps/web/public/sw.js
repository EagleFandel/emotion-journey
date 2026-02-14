const CACHE_NAME = "emotion-journey-v2";
const CORE_ASSETS = ["/landing", "/manifest.webmanifest"];

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isApiRequest(url) {
  return url.pathname.startsWith("/api/");
}

function isNavigationRequest(request) {
  return request.mode === "navigate" || request.destination === "document";
}

function isStaticAssetRequest(url, request) {
  return (
    url.pathname.startsWith("/_next/") ||
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "image" ||
    request.destination === "font"
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => keys.filter((key) => key !== CACHE_NAME))
      .then((oldKeys) => Promise.all(oldKeys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (!isSameOrigin(url)) return;

  if (isApiRequest(url)) {
    event.respondWith(fetch(request));
    return;
  }

  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request).catch(() => caches.match("/landing").then((cached) => cached || Response.error())),
    );
    return;
  }

  if (!isStaticAssetRequest(url, request)) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkPromise = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const cloned = response.clone();
            void caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          }
          return response;
        })
        .catch(() => cached || Response.error());

      return cached || networkPromise;
    }),
  );
});
