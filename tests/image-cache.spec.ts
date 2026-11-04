import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";

test("image cache: first visit, instant repeat, background update, offline and subpath scope", async ({
  page,
  context,
}) => {
  const image = await readFile("public/img/preview/put_k_sebe-480.webp");
  let version = "1";
  let release: (() => void) | undefined;
  let pause = false;
  let hits = 0;
  const server = createServer(async (req, res) => {
    const path = new URL(req.url!, "http://localhost").pathname;
    if (path === "/portfolio/img/probe.webp") {
      hits++;
      const current = version;
      if (pause)
        await new Promise<void>((resolve) => {
          release = resolve;
        });
      res.writeHead(200, {
        "content-type": "image/webp",
        "x-image-version": current,
        "cache-control": "no-store",
      });
      res.end(image);
      return;
    }
    if (!path.startsWith("/portfolio/")) {
      res.writeHead(404).end();
      return;
    }
    try {
      const filename = path.slice("/portfolio/".length) || "index.html";
      const data = await readFile(join(process.cwd(), "dist", filename));
      const types: Record<string, string> = {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".webp": "image/webp",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".json": "application/json",
      };
      res.writeHead(200, {
        "content-type": types[extname(filename)] || "application/octet-stream",
      });
      res.end(data);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as { port: number };
  const base = `http://127.0.0.1:${address.port}/portfolio/`;
  try {
    await page.goto(base);
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
      if (!navigator.serviceWorker.controller)
        await new Promise<void>((resolve) =>
          navigator.serviceWorker.addEventListener(
            "controllerchange",
            () => resolve(),
            { once: true },
          ),
        );
    });
    const url = base + "img/probe.webp";
    const cachedVersion = () =>
      page.evaluate(async (url) => {
        for (const key of await caches.keys()) {
          const response = await (await caches.open(key)).match(url);
          if (response) return response.headers.get("x-image-version");
        }
        return null;
      }, url);
    expect(
      await page.evaluate(
        async (url) => (await fetch(url)).headers.get("x-image-version"),
        url,
      ),
    ).toBe("1");
    await expect.poll(cachedVersion).toBe("1");
    // Delay the network refresh: cached responses must not wait for it.
    version = "2";
    pause = true;
    expect(
      await page.evaluate(
        async (url) =>
          Promise.race([
            fetch(url).then((r) => r.headers.get("x-image-version")),
            new Promise((resolve) =>
              setTimeout(() => resolve("timeout"), 1500),
            ),
          ]),
        url,
      ),
    ).toBe("1");
    await expect.poll(() => hits).toBe(2);
    await expect.poll(() => Boolean(release)).toBe(true);
    pause = false;
    release?.();
    await expect.poll(cachedVersion).toBe("2");
    // Reload the page before going offline: cache persists across visits.
    await page.reload();
    await context.setOffline(true);
    expect(
      await page.evaluate(
        async (url) => (await fetch(url)).headers.get("x-image-version"),
        url,
      ),
    ).toBe("2");
    await context.setOffline(false);
    const missing = base + "img/not-found.webp";
    expect(
      await page.evaluate(async (url) => (await fetch(url)).status, missing),
    ).toBe(404);
    expect(
      await page.evaluate(async (url) => {
        for (const key of await caches.keys())
          if (await (await caches.open(key)).match(url)) return true;
        return false;
      }, missing),
    ).toBe(false);
    expect(
      await page.evaluate(async () => {
        const urls = await Promise.all(
          (await caches.keys()).map(async (key) =>
            (await (await caches.open(key)).keys()).map(
              (request) => request.url,
            ),
          ),
        );
        return urls
          .flat()
          .every((url) => new URL(url).pathname.startsWith("/portfolio/img/"));
      }),
    ).toBe(true);
  } finally {
    pause = false;
    release?.();
    await context.setOffline(false);
    await page.goto("about:blank");
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
