// Cache only this portfolio's images; never intercept HTML or application code.
const imageRoot = new URL("img/", self.registration.scope);
const cachePrefix = `portfolio-images:${imageRoot.pathname}:`;
const cacheName = `${cachePrefix}v1`;
const maxEntries = 80;

function isLocalImage(value) {
  const url = new URL(value, self.registration.scope);
  return (
    url.origin === imageRoot.origin &&
    url.pathname.startsWith(imageRoot.pathname) &&
    /\.(jpe?g|png|webp|svg)$/i.test(url.pathname)
  );
}

async function remember(cache, request, response) {
  if (
    !response.ok ||
    !response.headers.get("content-type")?.startsWith("image/")
  )
    return;
  try {
    await cache.put(request, response.clone());
    const keys = await cache.keys();
    await Promise.all(
      keys
        .slice(0, Math.max(0, keys.length - maxEntries))
        .map((key) => cache.delete(key)),
    );
  } catch {
    // Storage can be unavailable or full. The network response still works.
  }
}

self.addEventListener("install", (event) =>
  event.waitUntil(self.skipWaiting()),
);
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith(cachePrefix) && name !== cacheName)
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || !isLocalImage(event.request.url))
    return;
  // Start both operations synchronously so waitUntil covers background updates.
  const cache = caches.open(cacheName);
  const cached = cache
    .then((store) => store.match(event.request))
    .catch(() => undefined);
  const fresh = fetch(event.request, { cache: "no-cache" });
  event.waitUntil(
    Promise.all([cache, fresh])
      .then(([store, response]) => remember(store, event.request, response))
      .catch(() => {}),
  );
  event.respondWith(cached.then((response) => response || fresh));
});

// On the first visit, images may finish before the worker gains control.
// Warm only images that have already loaded, using the browser HTTP cache.
self.addEventListener("message", (event) => {
  if (
    event.data?.type !== "CACHE_LOADED_IMAGES" ||
    !Array.isArray(event.data.urls)
  )
    return;
  event.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      for (const url of event.data.urls.slice(0, maxEntries)) {
        if (
          typeof url !== "string" ||
          !isLocalImage(url) ||
          (await cache.match(url))
        )
          continue;
        try {
          await remember(cache, url, await fetch(url));
        } catch {
          /* Offline: keep existing entries. */
        }
      }
    })().catch(() => {}),
  );
});
