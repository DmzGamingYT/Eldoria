// ═══════════════════════════════════════════════════════════════
// Eldoria — Génération de la "social card" 1280×640
// ═══════════════════════════════════════════════════════════════
//
// Sortie : public/banner/social-card.png (PNG optimisé, ~150 KB)
// Usage : bun run social-card
//         ou  bun scripts/generate-social-card.mjs
//
// L'asset sert d'aperçu partagé sur :
//   • GitHub social preview (Settings → Social preview)
//   • itch.io featured capsule (Uploads section)
//   • Steamworks capsule (capsule_900×600.png resized)
//   • Discord / Twitter / OG cards (2:1 standard)
//
// Pourquoi un script + sharp plutôt qu'un PNG commité directement ?
//   - Le rendu via sharp+librsvg produit un output pixel-perfect à
//     partir du SVG source éditable. Permet aux graphistes de modifier
//     social-card.svg sans rouvrir Photoshop/GIMP.
//   - Compression palette 256 couleurs = tailles < 200 KB même avec
//     le glow gaussian + médaillon détaillé.
//   - Pipeline reproductible et versionnable (pas de binaire opaque).

import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SVG_IN = join(ROOT, "public", "banner", "social-card.svg");
const PNG_OUT = join(ROOT, "public", "banner", "social-card.png");

try {
  const svgBuffer = await readFile(SVG_IN);

  // Le SVG est déjà viewBox="0 0 1280 640". On utilise la density
  // par défaut (72 dpi, 1 user-unit = 1 px) pour produire un PNG
  // EXACTEMENT 1280×640 comme spécifié par la cible OG. On resize
  // explicitement pour être défensif (sharp n'agrandit pas au-delà
  // de la taille du SVG source, mais on garantit le contrat).
  const pngBuffer = await sharp(svgBuffer)
    .resize(1280, 640, { fit: "fill" })
    .png({
      compressionLevel: 9,
      palette: true,
    })
    .toBuffer();

  await writeFile(PNG_OUT, pngBuffer);

  console.log(
    `✅ social-card.png généré (${(pngBuffer.length / 1024).toFixed(1)} KB, 1280×640) → ${PNG_OUT.replace(`${ROOT}/`, "")}`,
  );
} catch (err) {
  console.error("❌ Échec génération social-card.png :", err.message);
  if (err.code === "MODULE_NOT_FOUND" && err.message.includes("sharp")) {
    console.error("   → Lance `bun install` pour installer sharp.");
  }
  process.exit(1);
}
