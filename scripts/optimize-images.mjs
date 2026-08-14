// Runs before every build. Scans public/galleries + public/covers and shrinks
// any oversized image IN PLACE, so Jacob can upload full-res straight from his
// camera and the live site stays fast. Idempotent: already-small files are skipped.
import sharp from "sharp";
import { readdir, stat, rename, unlink } from "node:fs/promises";
import { join, extname } from "node:path";

const ROOTS = ["public/galleries", "public/covers", "public/about"];
const MAX_EDGE = 2000;      // longest side, px — plenty for web, even full-screen
const MAX_BYTES = 600 * 1024; // only touch files over ~600KB
const QUALITY = 82;

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return; // dir doesn't exist yet — fine
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

let optimized = 0;
let skipped = 0;

for (const root of ROOTS) {
  for await (const file of walk(root)) {
    const ext = extname(file).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) continue;

    try {
      const { size } = await stat(file);
      const meta = await sharp(file).metadata();
      const tooBig = size > MAX_BYTES;
      const tooWide = (meta.width || 0) > MAX_EDGE || (meta.height || 0) > MAX_EDGE;
      if (!tooBig && !tooWide) {
        skipped++;
        continue;
      }

      const tmp = file + ".tmp";
      const pipeline = sharp(file).rotate().resize(MAX_EDGE, MAX_EDGE, {
        fit: "inside",
        withoutEnlargement: true,
      });
      // keep PNGs as PNG (transparency), everything else → optimized jpeg
      if (ext === ".png") {
        await pipeline.png({ compressionLevel: 9, palette: true }).toFile(tmp);
      } else {
        await pipeline.jpeg({ quality: QUALITY, mozjpeg: true }).toFile(tmp);
      }
      // Only keep the re-encode if it's a real win. A detailed photo can sit
      // just over MAX_BYTES while already being at MAX_EDGE and well compressed
      // — re-encoding it buys ~2% and costs a generation of quality. Without
      // this guard that photo gets recompressed on every single run, forever.
      const { size: newSize } = await stat(tmp);
      if (newSize > size * 0.9) {
        await unlink(tmp);
        skipped++;
        continue;
      }

      await rename(tmp, file);
      optimized++;
      console.log(`  optimized ${file}`);
    } catch (err) {
      console.warn(`  skipped ${file} (${err.message})`);
      skipped++;
    }
  }
}

console.log(`[optimize-images] done — ${optimized} optimized, ${skipped} already fine.`);
