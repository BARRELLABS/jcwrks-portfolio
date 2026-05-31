/**
 * Background-removal tool (runs fully offline on this machine).
 *
 * Uses @imgly/background-removal-node — an AI model that runs LOCALLY.
 * The image never leaves your computer; first run downloads the model once.
 *
 * Usage:
 *   node scripts/cutout.mjs "<input image path>" "<output png in /public>"
 * Example:
 *   node scripts/cutout.mjs "C:/Users/jason/Downloads/jacob headshot.jpeg" "public/jacob-hero.png"
 *
 * Defaults (no args) = the hero photo.
 */
import { removeBackground } from "@imgly/background-removal-node";
import sharp from "sharp";
import { readFile } from "node:fs/promises";

const src = process.argv[2] || "C:/Users/jason/Downloads/jacob headshot.jpeg";
const out = process.argv[3] || "C:/Users/jason/projects/jcwrks-portfolio/public/jacob-hero.png";

console.log("Reading:", src);
const buf = await readFile(src);
console.log("Removing background (first run downloads the model, please wait)...");
const resultBlob = await removeBackground(new Blob([buf]));
const cutBuf = Buffer.from(await resultBlob.arrayBuffer());

// trim transparent edges so the subject fills the frame
const trimmed = await sharp(cutBuf).trim({ threshold: 10 }).png().toBuffer();
await sharp(trimmed).toFile(out);

const m = await sharp(out).metadata();
console.log("DONE ->", out, m.width + "x" + m.height, "(transparent:" + m.hasAlpha + ")");
