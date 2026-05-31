// Loads gallery photos + cover from src/data/galleries/<slug>.json (managed by the CMS).
// Each JSON looks like: { "cover": "/galleries/x/cover.jpg", "images": [ { "src": "...", "alt": "" } ] }

export interface GalleryImage {
  src: string;
  alt?: string;
}

const files = import.meta.glob<{ cover?: string; images?: GalleryImage[] }>(
  "../data/galleries/*.json",
  { eager: true }
);

const imagesBySlug: Record<string, GalleryImage[]> = {};
const coverBySlug: Record<string, string> = {};
for (const path in files) {
  const slug = path.split("/").pop()!.replace(".json", "");
  const data = files[path] as { cover?: string; images?: GalleryImage[] };
  imagesBySlug[slug] = (data.images ?? []).filter((i) => i && i.src);
  if (data.cover) coverBySlug[slug] = data.cover;
}

export function getGalleryImages(slug: string): GalleryImage[] {
  return imagesBySlug[slug] ?? [];
}

// CMS-set cover wins; fall back to the hardcoded `fallback` (from categories.ts)
export function getCover(slug: string, fallback?: string): string | undefined {
  return coverBySlug[slug] || fallback;
}
