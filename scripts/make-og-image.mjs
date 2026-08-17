// Rebuilds public/og-image.jpg — the 1200x630 preview card shown when the site
// is linked in texts/socials. Run from the repo root: node scripts/make-og-image.mjs
// Kept in the repo because the original recipe was lost and had to be
// reconstructed the first time the role text changed.
import sharp from "sharp";

const ROOT = process.cwd();

const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.35" stop-color="rgba(0,0,0,0)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0.82)"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="64" y="472" width="52" height="3" fill="#a78bfa"/>
  <text x="132" y="481" font-family="Arial, Helvetica, sans-serif" font-size="26" letter-spacing="7"
        fill="#a78bfa" font-weight="600">FREELANCE PHOTOGRAPHER</text>
  <text x="60" y="560" font-family="Arial, Helvetica, sans-serif" font-size="72"
        fill="#ffffff" font-weight="700">Jacob Combs</text>
</svg>`;

await sharp(`${ROOT}/public/covers/sports.jpg`)
  .resize(1200, 630, { fit: "cover", position: "attention" })
  .composite([{ input: Buffer.from(svg) }])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(`${ROOT}/public/og-image.jpg`);

const m = await sharp(`${ROOT}/public/og-image.jpg`).metadata();
console.log(`og-image.jpg rebuilt: ${m.width}x${m.height}`);

