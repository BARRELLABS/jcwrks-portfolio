/**
 * Makes each gallery's JSON mirror what's actually in its folder, so every
 * photo shows up as a real entry in the CMS that Jacob can drag to reorder,
 * caption, or remove.
 *
 * The problem this solves: uploading a photo in the CMS commits the FILE but
 * doesn't add it to the gallery's Photos list. src/lib/galleries.ts covers for
 * that at build time by appending anything it finds on disk — so nothing is
 * ever invisible — but those appended photos aren't list entries, which means
 * they can't be reordered. This writes them in properly.
 *
 * The model, in one line:
 *   the FOLDER decides which photos exist; the JSON decides their ORDER and CAPTIONS.
 *
 * So this does two things:
 *   - appends photos that are in the folder but not yet in the JSON
 *   - drops JSON entries whose file is gone (i.e. Jacob deleted the photo)
 * Existing entries keep their position and caption either way.
 *
 * Keep the merge rules here in step with src/lib/galleries.ts — same natural
 * sort, same case/URL-encoding-insensitive dedupe.
 *
 * Run: npm run sync   (also runs automatically in .github/workflows/shrink-photos.yml)
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const GALLERIES_DIR = "public/galleries";
const DATA_DIR = "src/data/galleries";
const IMAGE_EXT = /\.(jpe?g|png|webp|avif)$/i;

// The CMS URL-encodes some names and camera files vary in case (.jpg vs .JPG),
// so a strict === would duplicate photos.
const key = (src) => {
  try {
    return decodeURIComponent(src).toLowerCase();
  } catch {
    return src.toLowerCase();
  }
};

let added = 0;
let removed = 0;
let touched = 0;

for (const jsonName of await readdir(DATA_DIR)) {
  if (!jsonName.endsWith(".json")) continue;

  const slug = jsonName.replace(/\.json$/, "");
  const jsonPath = join(DATA_DIR, jsonName);
  const data = JSON.parse(await readFile(jsonPath, "utf8"));

  // sports.json is cover-only — Sports is a group tile, not a gallery.
  if (!Array.isArray(data.images)) continue;

  const dir = join(GALLERIES_DIR, slug);
  const onDisk = existsSync(dir)
    ? (await readdir(dir))
        .filter((name) => IMAGE_EXT.test(name))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
        .map((name) => `/galleries/${slug}/${name}`)
    : [];

  const diskKeys = new Set(onDisk.map(key));
  const prefix = `/galleries/${slug}/`;

  // Keep entries that still have a file. Only judge entries pointing into this
  // gallery's own folder — anything else isn't ours to prune.
  const kept = (data.images ?? []).filter((img) => {
    if (!img || !img.src) return false;
    if (!img.src.startsWith(prefix)) return true;
    return diskKeys.has(key(img.src));
  });
  const droppedHere = (data.images ?? []).length - kept.length;

  const seen = new Set(kept.map((i) => key(i.src)));
  const extras = onDisk.filter((src) => !seen.has(key(src))).map((src) => ({ src, alt: "" }));

  if (!extras.length && !droppedHere) continue;

  data.images = [...kept, ...extras];
  await writeFile(jsonPath, JSON.stringify(data, null, 2) + "\n");

  const bits = [];
  if (extras.length) bits.push(`+${extras.length}`);
  if (droppedHere) bits.push(`-${droppedHere}`);
  console.log(`  ${slug}: ${bits.join(" ")}`);

  added += extras.length;
  removed += droppedHere;
  touched++;
}

console.log(
  touched
    ? `[sync-galleries] ${added} added, ${removed} removed across ${touched} gallery/galleries.`
    : "[sync-galleries] already in sync."
);
