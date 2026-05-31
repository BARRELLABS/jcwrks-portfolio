// Loads gallery photos from src/data/galleries/<slug>.json (managed by the CMS).
// Each JSON looks like: { "images": [ { "src": "/galleries/basketball/x.jpg", "alt": "" } ] }

export interface GalleryImage {
  src: string;
  alt?: string;
}

const files = import.meta.glob<{ images?: GalleryImage[] }>(
  "../data/galleries/*.json",
  { eager: true }
);

// build a { slug: images[] } map from the file paths
const bySlug: Record<string, GalleryImage[]> = {};
for (const path in files) {
  const slug = path.split("/").pop()!.replace(".json", "");
  const data = files[path] as { images?: GalleryImage[] };
  bySlug[slug] = (data.images ?? []).filter((i) => i && i.src);
}

export function getGalleryImages(slug: string): GalleryImage[] {
  return bySlug[slug] ?? [];
}
