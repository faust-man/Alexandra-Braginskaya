/**node scripts/generate-previews.mjs */

import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = path.join(process.cwd(), "public");

const galleryPath = path.join(projectRoot, "gallery.json");
const sourceDirectory = path.join(projectRoot, "img");
const previewDirectory = path.join(sourceDirectory, "preview");

await mkdir(previewDirectory, {
  recursive: true,
});

const galleryContent = await readFile(galleryPath, "utf8");
const paintingIds = JSON.parse(galleryContent);

for (const id of paintingIds) {
  const sourcePath = path.join(sourceDirectory, `${id}.jpg`);

  const smallPreviewPath = path.join(previewDirectory, `${id}-480.webp`);

  const largePreviewPath = path.join(previewDirectory, `${id}-900.webp`);

  try {
    await sharp(sourcePath)
      .resize({
        width: 480,
        height: 480,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: 65,
        effort: 5,
      })
      .toFile(smallPreviewPath);

    await sharp(sourcePath)
      .resize({
        width: 900,
        height: 900,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: 72,
        effort: 5,
      })
      .toFile(largePreviewPath);

    console.log(`Созданы превью: ${id}`);
  } catch (error) {
    console.error(`Ошибка обработки картины "${id}":`, error);
    process.exitCode = 1;
  }
}

console.log("Готово");
