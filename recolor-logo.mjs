import sharp from "sharp";

const src = "C:/Users/jason/Downloads/jcwrks logo black.png";
const out = "C:/Users/jason/projects/jcwrks-portfolio/public/logo-white.png";

// trim padding to the mark first
const trimmedBuf = await sharp(src).trim({ threshold: 1 }).toBuffer();

// pull raw RGBA pixels
const { data, info } = await sharp(trimmedBuf)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
for (let i = 0; i < data.length; i += channels) {
  const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
  if (a < 10) continue; // transparent — skip
  // "purple" = blue/red high, green lower. "black" = all low.
  const isPurple = b > 90 && r > 70 && b > g + 20;
  if (!isPurple) {
    // recolor the dark (black) strokes to white, keep their alpha for smooth edges
    data[i] = 255; data[i + 1] = 255; data[i + 2] = 255;
  }
  // purple strokes left untouched
}

const recolored = await sharp(data, { raw: { width, height, channels } }).png().toBuffer();

// add a small uniform transparent margin
const pad = Math.round(Math.max(width, height) * 0.08);
await sharp(recolored)
  .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toFile(out);

console.log("RECOLOR_OK content=" + width + "x" + height + " -> public/logo-white.png");
