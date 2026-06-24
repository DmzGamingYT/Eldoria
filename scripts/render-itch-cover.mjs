// sharp-based SVG -> PNG cover for itch.io (1260x1000 high-DPI + 630x500 fallback).
// carte-monde.svg has intrinsic viewBox 1100x720 (ratio 1.52:1) — wider than target
// 315:250 (1.26:1). Cropping would amputate the parchment borders; auto-letterbox
// would squash the central map medallion. Solution: explicit resize to fit
// inside the violet canvas with margins, then composite centered on a 1260x1000
// #1a0e2e backdrop, drop it to 1x as fallback.
import sharp from "sharp";

const SVG = "public/banner/carte-monde.svg";
const VIOLET = { r: 0x1a, g: 0x0e, b: 0x2e, alpha: 1 };
const W2 = 1260, H2 = 1000;       // 2x for retina
const W1 = 630,  H1 = 500;        // 1x standard
const MARGIN = 80;

// 1. Render the SVG at high quality and explicitly resize to fit inside
//    (1260-2M)x(1000-2M) = 1100 x 840. SVG ratio 1.52 > 1.31, so width binds.
const svgRendered = await sharp(SVG, { density: 192 })
  .resize({ width: W2 - MARGIN * 2, height: H2 - MARGIN * 2, fit: "inside", background: VIOLET })
  .png()
  .toBuffer();

const m0 = await sharp(svgRendered).metadata();
console.log("resized SVG render:", m0.width, "x", m0.height);

// 2. Composite onto the violet canvas.
await sharp({
  create: { width: W2, height: H2, channels: 4, background: VIOLET },
})
  .composite([{ input: svgRendered, gravity: "center" }])
  .png()
  .toFile("release/cover-1260x1000.png");

// 3. 1x fallback
await sharp("release/cover-1260x1000.png")
  .resize({ width: W1, height: H1, fit: "cover", position: "center" })
  .png()
  .toFile("release/cover-630x500.png");

const m1 = await sharp("release/cover-1260x1000.png").metadata();
const m2 = await sharp("release/cover-630x500.png").metadata();
console.log("OK cover 2x:", m1.width, "x", m1.height, ":", "release/cover-1260x1000.png");
console.log("OK cover 1x:", m2.width, "x", m2.height, ":", "release/cover-630x500.png");
