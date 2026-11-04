export function registerImageCache() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  const register = async () => {
    try {
      await navigator.serviceWorker.register(
        new URL("./image-cache-worker.js", document.baseURI),
        { updateViaCache: "none" },
      );
      const registration = await navigator.serviceWorker.ready;
      registration.active?.postMessage({
        type: "CACHE_LOADED_IMAGES",
        urls: [...document.images]
          .filter((image) => image.complete && image.naturalWidth > 0)
          .map((image) => image.currentSrc),
      });
    } catch {
      // Unsupported/private storage must not prevent the gallery from loading.
    }
  };
  if (document.readyState === "complete") void register();
  else window.addEventListener("load", () => void register(), { once: true });
}
