import { test, expect } from "@playwright/test";
test("home: content, navigation, assets and no runtime errors", async ({
  page,
  isMobile,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const missing: string[] = [];
  page.on("response", (r) => {
    if (r.status() >= 400) missing.push(r.url());
  });
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Александра");
  await expect(page.locator(".work")).toHaveCount(20);
  await expect(page.locator(".news-card")).toHaveCount(6);
  await page.getByRole("link", { name: "Работы", exact: true }).click();
  await expect(page).toHaveURL(/#works/);
  await expect(page.locator(".work:visible")).toHaveCount(isMobile ? 4 : 20);
  if (isMobile) {
    await page.locator("#works button").click();
    await expect(page.locator(".work:visible")).toHaveCount(20);
    await page.locator("#works button").click();
    await expect(page.locator(".work:visible")).toHaveCount(4);
    await page.locator("#news button").click();
    await expect(page.locator(".news-card:visible")).toHaveCount(6);
    await page.locator("#news button").click();
    await expect(page.locator(".news-card:visible")).toHaveCount(2);
  }
  await page.locator("footer").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  expect(errors).toEqual([]);
  expect(missing).toEqual([]);
});
test("carousel moves both ways and remains usable", async ({ page }) => {
  await page.goto("/");
  const first = page.locator(".achievement-card").first();
  await expect(first).toContainText("АРТ РОССИЯ");
  await page.getByRole("button", { name: "Следующая выставка" }).click();
  await expect(first).toContainText("МОРЕ ВНУТРИ");
  await page.getByRole("button", { name: "Предыдущая выставка" }).click();
  await expect(first).toContainText("АРТ РОССИЯ");
});
test("painting navigation, metadata, original and back", async ({
  page,
  isMobile,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.locator(".work a").first().click();
  await expect(page).toHaveURL(/painting.html\?id=vremya_doroje_deneg/);
  await expect(page.locator("h1")).not.toBeEmpty();
  await expect(page.locator(".info")).toContainText("Материал");
  const image = page.locator(".painting-image img");
  await expect(image).toBeVisible();
  await expect
    .poll(() =>
      image.evaluate(
        (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
      ),
    )
    .toBeTruthy();
  if (!isMobile) {
    await image.hover();
    await expect(page.locator(".lens")).toBeVisible();
  }
  await expect(page.locator(".painting-image a")).toHaveAttribute(
    "href",
    /\.jpg$/,
  );
  await page
    .getByRole("link", { name: "Назад к галерее", exact: false })
    .click();
  await expect(page).toHaveURL(/index.html#works/);
  expect(errors).toEqual([]);
});
test("unknown and missing painting id handled", async ({ page }) => {
  for (const url of [
    "/painting.html",
    "/painting.html?id=missing",
    "/painting.html?id=../../secret",
  ]) {
    await page.goto(url);
    await expect(page.locator("h1")).toHaveText("Картина не найдена");
    await expect(
      page.getByRole("link", { name: "Назад к галерее", exact: false }),
    ).toBeVisible();
  }
});
test("responsive resizing and reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".work:visible")).toHaveCount(4);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator(".work:visible")).toHaveCount(20);
  await expect(page.locator("#motionPermissionButton")).toBeHidden();
});
test("every painting deep link renders its content and image", async ({
  page,
}) => {
  const ids = await (await page.request.get("/gallery.json")).json();
  for (const id of ids) {
    await page.goto(`/painting.html?id=${id}`);
    await expect(page.locator(".painting-info h1")).not.toBeEmpty();
    await expect
      .poll(() =>
        page
          .locator(".painting-image img")
          .evaluate(
            (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
          ),
      )
      .toBeTruthy();
  }
});
test("visual captures and narrow screen layout", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: `work_notes/react-migration/${testInfo.project.name}-hero.png`,
  });
  await page.locator("#works").scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page
    .locator(".work img")
    .first()
    .evaluate((img: HTMLImageElement) => img.decode());
  await page.screenshot({
    path: `work_notes/react-migration/${testInfo.project.name}-gallery.png`,
  });
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  }
});
