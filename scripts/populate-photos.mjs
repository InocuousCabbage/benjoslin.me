/**
 * Phase 4 populate pipeline. One-off (re-runnable) script that reads
 * source JPGs from Ben's KB Personal drive folder, dedupes by content
 * hash, generates srcSet variants + blurDataURL via sharp+mozjpeg,
 * strips EXIF from served files, and emits lib/photos.generated.ts
 * with a Photo[] literal ordered by EXIF DateTimeOriginal desc.
 *
 * Invoke: node scripts/populate-photos.mjs
 *
 * Ben-directed via weemeemee dispatch. Not part of the build pipeline;
 * runs manually when new photos land + emits versioned artifacts under
 * public/photos/ + lib/photos.generated.ts that ARE checked in.
 */
import { readdir, mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, basename, extname } from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";
import exifr from "exifr";

const SOURCE_DIR =
  "/Users/chiveschamoy/Library/CloudStorage/GoogleDrive-benjoslin52@gmail.com/My Drive/Knowledge Base/Personal/Best photos";
const PUBLIC_DIR = join(process.cwd(), "public", "photos");
const OUTPUT_TS = join(process.cwd(), "lib", "photos.generated.ts");
const WIDTHS = [640, 828, 1200, 1920];
const JPEG_QUALITY = 82;
const BLUR_WIDTH = 12;

function slug(name) {
  return basename(name, extname(name))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function contentHash(path) {
  const buf = await readFile(path);
  return createHash("sha256").update(buf).digest("hex");
}

async function main() {
  await mkdir(PUBLIC_DIR, { recursive: true });

  const entries = (await readdir(SOURCE_DIR))
    .filter((f) => /\.jpe?g$/i.test(f))
    .sort();

  const seen = new Map();
  const items = [];

  for (const filename of entries) {
    const src = join(SOURCE_DIR, filename);
    const hash = await contentHash(src);
    if (seen.has(hash)) {
      console.log(`[dup] ${filename} <- ${seen.get(hash)}, skipping`);
      continue;
    }
    seen.set(hash, filename);

    const meta = await sharp(src).metadata();
    if (!meta.width || !meta.height) {
      console.warn(`[skip] ${filename}: no metadata`);
      continue;
    }

    let date;
    try {
      const exif = await exifr.parse(src, { pick: ["DateTimeOriginal"] });
      if (exif?.DateTimeOriginal instanceof Date) {
        date = exif.DateTimeOriginal.toISOString().slice(0, 10);
      }
    } catch {
      // exifr can throw on malformed EXIF; leave date undefined.
    }

    const stem = slug(filename);

    const rotated = sharp(src).rotate();
    const oriented = await rotated.toBuffer({ resolveWithObject: true });
    const srcW = oriented.info.width;
    const srcH = oriented.info.height;

    const srcSet = [];
    for (const w of WIDTHS) {
      if (w > srcW) continue;
      const dstFile = `${stem}-w${w}.jpg`;
      const dstPath = join(PUBLIC_DIR, dstFile);
      await sharp(oriented.data)
        .resize({ width: w, withoutEnlargement: true })
        .jpeg({
          quality: JPEG_QUALITY,
          mozjpeg: true,
          progressive: true,
        })
        .withMetadata({ exif: {} })
        .toFile(dstPath);
      srcSet.push({ w, path: `/photos/${dstFile}` });
    }
    if (srcSet.length === 0) {
      // Source narrower than smallest target; emit a single unresized
      // stripped variant so the tile still renders.
      const dstFile = `${stem}.jpg`;
      const dstPath = join(PUBLIC_DIR, dstFile);
      await sharp(oriented.data)
        .jpeg({
          quality: JPEG_QUALITY,
          mozjpeg: true,
          progressive: true,
        })
        .withMetadata({ exif: {} })
        .toFile(dstPath);
      srcSet.push({ w: srcW, path: `/photos/${dstFile}` });
    }

    const blurBuf = await sharp(oriented.data)
      .resize({ width: BLUR_WIDTH })
      .jpeg({ quality: 40 })
      .toBuffer();
    const blurDataURL = `data:image/jpeg;base64,${blurBuf.toString("base64")}`;

    const largest = srcSet[srcSet.length - 1];
    const srcSetAttr = srcSet
      .map((v) => `${v.path} ${v.w}w`)
      .join(", ");

    items.push({
      src: largest.path,
      srcSet: srcSetAttr,
      alt: `Photograph by Ben Joslin`,
      width: srcW,
      height: srcH,
      blurDataURL,
      date,
      _sortKey: date || "0000-00-00",
      _stem: stem,
    });

    console.log(
      `[ok] ${filename} -> ${stem} (${srcW}x${srcH}, ${srcSet.length} variants, date=${date ?? "none"})`,
    );
  }

  // EXIF-date-descending with filename fallback (stable sort on stem).
  items.sort((a, b) => {
    if (a._sortKey !== b._sortKey) return b._sortKey.localeCompare(a._sortKey);
    return a._stem.localeCompare(b._stem);
  });

  const literals = items.map((p) => {
    const parts = [
      `    src: ${JSON.stringify(p.src)}`,
      `    srcSet: ${JSON.stringify(p.srcSet)}`,
      `    alt: ${JSON.stringify(p.alt)}`,
      `    width: ${p.width}`,
      `    height: ${p.height}`,
      `    blurDataURL: ${JSON.stringify(p.blurDataURL)}`,
    ];
    if (p.date) parts.push(`    date: ${JSON.stringify(p.date)}`);
    return `  {\n${parts.join(",\n")},\n  }`;
  });

  const banner = `/**
 * AUTO-GENERATED by scripts/populate-photos.mjs. DO NOT EDIT.
 *
 * Regenerate with: node scripts/populate-photos.mjs
 *
 * Source: KB Personal / Best photos folder (Ben-curated).
 * Pipeline: sharp + mozjpeg, srcSet widths 640/828/1200/1920, EXIF
 * stripped, blurDataURL embedded, ordered by DateTimeOriginal desc.
 */
import type { Photo } from "@/lib/content";
`;

  const body = `\nexport const photos: Photo[] = [\n${literals.join(",\n")},\n];\n`;

  await writeFile(OUTPUT_TS, banner + body);
  console.log(`\nWrote ${items.length} photos to ${OUTPUT_TS}`);
  console.log(`Public assets in ${PUBLIC_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
