// Loads gallery photos + cover from src/data/galleries/<slug>.json (managed by the CMS).
// Each JSON looks like: { "cover": "/galleries/x/cover.jpg", "images": [ { "src": "...", "alt": "" } ] }
//
// IMPORTANT: the JSON is not the only source of truth. Uploading a photo in the CMS
// commits the FILE to public/galleries/<slug>/ straight away, but the photo only lands
// in this JSON if you also add it to the "Photos" list and hit Save. Jacob kept doing
// the first half only, so photos sat in the repo but never showed on the site.
// So: we read the folder too, and append any image that isn't already listed.
// Upload alone is now enough. The JSON still wins for ORDER and CAPTIONS.

import { readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

export interface GalleryImage {
  src: string;
  alt?: string;
}

const files = import.meta.glob<{ cover?: string; images?: GalleryImage[] }>(
  "../data/galleries/*.json",
  { eager: true }
);

// Astro bundles this module, so import.meta.url can point into a build chunk rather
// than src/lib — resolve against the real project root instead and fall back.
const CANDIDATE_ROOTS = [
  `${process.cwd()}/public/galleries`,
  fileURLToPath(new URL("../../public/galleries", import.meta.url)),
];
const GALLERIES_DIR = CANDIDATE_ROOTS.find((d) => existsSync(d)) ?? CANDIDATE_ROOTS[0];
const IMAGE_EXT = /\.(jpe?g|png|webp|avif)$/i;

// Compare paths loosely — the CMS sometimes URL-encodes, and Windows/camera files
// vary in case (.jpg vs .JPG), so a strict === would double up photos.
const key = (src: string) => {
  try {
    return decodeURIComponent(src).toLowerCase();
  } catch {
    return src.toLowerCase();
  }
};

/** Every image file actually sitting in public/galleries/<slug>/, natural-sorted. */
function filesOnDisk(slug: string): string[] {
  const dir = `${GALLERIES_DIR}/${slug}`;
  if (!existsSync(dir)) return [];
  try {
    return readdirSync(dir)
      .filter((name) => IMAGE_EXT.test(name))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
      .map((name) => `/galleries/${slug}/${name}`);
  } catch {
    return [];
  }
}

const imagesBySlug: Record<string, GalleryImage[]> = {};
const coverBySlug: Record<string, string> = {};
const autoIncluded: string[] = [];

for (const path in files) {
  const slug = path.split("/").pop()!.replace(".json", "");
  const data = files[path] as { cover?: string; images?: GalleryImage[] };

  // 1. Curated entries from the CMS — these keep their order and captions.
  const listed = (data.images ?? []).filter((i) => i && i.src);
  const seen = new Set(listed.map((i) => key(i.src)));

  // 2. Anything uploaded to the folder but never added to the list — appended.
  const extras = filesOnDisk(slug)
    .filter((src) => !seen.has(key(src)))
    .map((src) => ({ src, alt: "" }));

  imagesBySlug[slug] = [...listed, ...extras];
  if (data.cover) coverBySlug[slug] = data.cover;
  if (extras.length) autoIncluded.push(`${slug} +${extras.length}`);
}

// Shows up in the Netlify build log — handy proof that uploads were picked up.
if (autoIncluded.length) {
  console.log(`[galleries] auto-included uploaded photos: ${autoIncluded.join(", ")}`);
}

export function getGalleryImages(slug: string): GalleryImage[] {
  return imagesBySlug[slug] ?? [];
}

// CMS-set cover wins; fall back to the hardcoded `fallback` (from categories.ts)
export function getCover(slug: string, fallback?: string): string | undefined {
  return coverBySlug[slug] || fallback;
}

// Total real photos across every gallery — for the live "moments captured" counter.
export function getTotalPhotos(): number {
  return Object.values(imagesBySlug).reduce((sum, imgs) => sum + imgs.length, 0);
}
