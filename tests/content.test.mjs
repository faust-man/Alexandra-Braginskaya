import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { formatDate } from "../src/dates.ts";
const json = async (p) =>
  JSON.parse(await readFile(new URL(p, import.meta.url), "utf8"));
test("all gallery and news entries have complete content and local assets", async () => {
  for (const [list, folder, fields] of [
    [
      "gallery.json",
      "",
      ["title", "materials", "size", "price", "description"],
    ],
    ["news.json", "news/", ["title", "description"]],
  ]) {
    const ids = await json("../public/" + list);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of ids) {
      const item = await json(`../public/data/${folder}${id}.json`);
      for (const field of fields) assert.ok(item[field], `${id}: ${field}`);
      await access(
        new URL(`../public/img/${folder}${id}.jpg`, import.meta.url),
      );
      if (!folder)
        for (const size of [480, 900])
          await access(
            new URL(
              `../public/img/preview/${id}-${size}.webp`,
              import.meta.url,
            ),
          );
      if (item.link) assert.equal(new URL(item.link).protocol, "https:");
    }
  }
});
test("dates handle malformed and impossible dates without inventing publication dates", () => {
  assert.equal(formatDate("2026-30-1"), "");
  assert.equal(formatDate("2026-02-30"), "");
  assert.match(formatDate("2026-01-30"), /30 января 2026/);
});
