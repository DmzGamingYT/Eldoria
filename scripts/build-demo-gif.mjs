// ════════════════════════════════════════════════════════════════
//  Démo GIF pour le README GitHub & la landing page Eldoria
// ════════════════════════════════════════════════════════════════
//  Assemble 4 screenshots statiques (1280×720) en un GIF/WebM
//  animé de ~6-7s (480×270) avec :
//    • zoom progressif Ken Burns (1.0 → 1.10) par scène
//    • fondus enchaînés (xfade fade, 0.4s) entre les scènes
//    • couleurs optimisées via palettegen/paletteuse (GIF)
//
//  Prérequis : ffmpeg en PATH (8.x testé).
//
//  Usage :  node scripts/build-demo-gif.mjs
//     ou :  bun run build:demo
// ════════════════════════════════════════════════════════════════

import { execSync } from "node:child_process";
import { mkdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";

const TMP_DIR = "./tmp/demo-build";
const OUT_DIR = "./public/illustrations";
const OUT_MP4 = path.join(TMP_DIR, "demo.mp4");
const OUT_GIF = path.join(OUT_DIR, "demo.gif");
const OUT_WEBM = path.join(OUT_DIR, "demo.webm");

// ── Sources : 4 scènes clés du jeu (ordre chronologique d'une partie) ──
const SCENES = [
  { file: "public/screenshots/01-main-menu.png",      label: "Menu principal cinematic" },
  { file: "public/screenshots/02-intro-sequence.png", label: "Cinematique d'intro" },
  { file: "public/screenshots/03-game-world.png",     label: "Monde 3D explose" },
  { file: "public/screenshots/04-gameplay-hud.png",   label: "Combat en temps reel + HUD" },
];

// ── Paramètres d'encodage ──
const W = 480;          // largeur cible du GIF (pixel budget raisonnable)
const H = 270;          // 16:9
const SCENE_DUR = 2;    // secondes par scène
const XFADE_DUR = 0.4;  // durée du fondu entre scènes
const FPS = 12;
const ZOOM_MAX = 1.10;  // zoom Ken Burns max (subtil)
const ZOOM_STEP = 0.0025; // incrément par frame (≈ 0.05/s)

// ── Helpers ──
const step  = (n, total, msg) => console.log(`\n\x1b[36m[${n}/${total}]\x1b[0m  ${msg}`);
const ok    = (msg) => console.log(`   \x1b[32m✓\x1b[0m  ${msg}`);
const warn  = (msg) => console.log(`   \x1b[33m⚠\x1b[0m  ${msg}`);
const info  = (msg) => console.log(`\x1b[36m🎬\x1b[0m  ${msg}`);
const fatal = (msg) => { console.error(`\n\x1b[31m❌\x1b[0m  ${msg}`); process.exit(1); };

const SIZE_MB = (b) => `${(b / 1024 / 1024).toFixed(2)} MB`;

// ── 1. Vérifications préalables ──
info("Verification des prerequis…");

try { execSync("ffmpeg -version", { stdio: "ignore" }); }
catch { fatal("ffmpeg introuvable dans le PATH. Installe-le avant de relancer."); }

// Vérifier que toutes les sources existent
for (const s of SCENES) {
  try { statSync(s.file); }
  catch { fatal(`Source manquante : ${s.file}`); }
}
ok(`${SCENES.length} screenshots trouves`);

// Nettoyer + préparer les dossiers
rmSync(TMP_DIR, { recursive: true, force: true });
mkdirSync(TMP_DIR, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

// ── 2. Calcul automatique des offsets xfade ──
// xfade chainé : source k est ajoutée à un offset = (k-1)*(SCENE_DUR - XFADE_DUR).
//   k=0 → seul (pas de xfade)
//   k=1 → offset = 1*(2-0.4) = 1.6s
//   k=2 → offset = 2*(2-0.4) = 3.2s
//   k=3 → offset = 3*(2-0.4) = 4.8s
// Durée totale finale = N*SCENE_DUR - (N-1)*XFADE_DUR = 4*2 - 3*0.4 = 6.8s
const SCENE_FRAMES = Math.round(SCENE_DUR * FPS); // 24 frames / scène
const XFADE_OFFSETS = SCENES.slice(1).map((_, i) => {
  const offset = (i + 1) * (SCENE_DUR - XFADE_DUR);
  return offset.toFixed(2);
});
const TOTAL_DUR = (SCENES.length * SCENE_DUR - (SCENES.length - 1) * XFADE_DUR).toFixed(2);
ok(`Duree totale : ${TOTAL_DUR}s (${Math.round(TOTAL_DUR * FPS)} frames @ ${FPS} fps)`);
ok(`Offsets xfade : [${XFADE_OFFSETS.join(", ")}]s`);

// ── 3. Construction du filter_complex ──
// Chaque input passe par zoompan (zoom progressif) puis format yuv420p ([vN]).
// Les scènes sont concaténées par xfade successifs.
step(1, 4, "Generation du MP4 intermediaire (ffmpeg zoompan + xfade)…");

// Pré-filtrage par scène : scale up avant zoompan (meilleure qualité du zoom)
const zoomFilters = SCENES.map((s, i) => {
  const srcW = W * 2; // upscale source avant zoom pour eviter pixels
  const srcH = H * 2;
  return (
    `[${i}:v]scale=${srcW}:${srcH}:flags=lanczos,` +
    `zoompan=z='min(zoom+${ZOOM_STEP},${ZOOM_MAX})':` +
    `d=${SCENE_FRAMES}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':` +
    `s=${W}x${H},fps=${FPS},format=yuv420p[v${i}];`
  );
}).join("\n  ");

// Chaîne xfade : v0 → xfade → v1 → ... → vN-1
let xfadeChain = `[v0][v1]xfade=transition=fade:duration=${XFADE_DUR}:offset=${XFADE_OFFSETS[0]}[x01]`;
let prevLabel = "x01";
for (let i = 2; i < SCENES.length; i++) {
  const outLabel = i === SCENES.length - 1 ? "outv" : `x${"0".repeat(i-1)}${i}`;
  xfadeChain += `;\n  [${prevLabel}][v${i}]xfade=transition=fade:duration=${XFADE_DUR}:offset=${XFADE_OFFSETS[i-1]}[${outLabel}]`;
  prevLabel = outLabel;
}

const filterComplex = `\n  ${zoomFilters}\n  ${xfadeChain}\n`;

// Inputs : -loop 1 -t D pour chaque source, le reste fait par xfade
const inputArgs = SCENES.map(s => `-loop 1 -t ${SCENE_DUR} -i "${s.file}"`).join(" ");

// Encas d'echec d'une des etapes 3-4-5, on garantit la suppression du tmp via finally.
let gifSize = 0;
let webmSize = 0;
try {

  // ── 3. Encode MP4 intermediaire (ffmpeg zoompan + xfade) ──
  step(1, 4, "Generation du MP4 intermediaire (ffmpeg zoompan + xfade)…");

  const mp4Cmd = [
    "ffmpeg -y",
    inputArgs,
    `-filter_complex "${filterComplex}"`,
    `-map "[outv]"`,
    `-c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p`,
    `-t ${TOTAL_DUR}`,
    `"${OUT_MP4}"`,
  ].join(" ");

  try {
    execSync(mp4Cmd, { stdio: ["ignore", "inherit", "pipe"] });
  } catch (err) {
    // Affiche le stderr complet si filter_complex pète (debug rapide)
    console.error("\n" + (err.stderr?.toString() ?? err.message));
    throw err;
  }
  ok(`MP4 encode → ${OUT_MP4} (${SIZE_MB(statSync(OUT_MP4).size)})`);

  // ── 4. Encodage GIF optimise (palettegen + paletteuse bayer dither) ──
  step(2, 4, "Encodage GIF optimise (palettegen + paletteuse)…");
  const gifCmd = [
    `ffmpeg -y -i "${OUT_MP4}"`,
    `-vf "fps=${FPS},scale=${W}:-1:flags=lanczos,` +
      `split[s0][s1];[s0]palettegen=stats_mode=full[p];` +
      `[s1][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle"`,
    `-loop 0`,
    `"${OUT_GIF}"`,
  ].join(" ");
  execSync(gifCmd, { stdio: ["ignore", "inherit", "pipe"] });
  gifSize = statSync(OUT_GIF).size;
  ok(`GIF encode → ${OUT_GIF} (${SIZE_MB(gifSize)})`);

  if (gifSize > 4 * 1024 * 1024) {
    warn(`Le GIF depasse 4 MB (${SIZE_MB(gifSize)}). Il sera peut-etre lent a charger sur mobile.`);
    warn(`Astuce : baisse W a 360 ou nombre de scenes pour alleger.`);
  }

  // Validation d'integrite : decode le GIF via ffmpeg null sink (detecte palette off, codec off, etc.)
  try {
    execSync(`ffmpeg -v error -i "${OUT_GIF}" -f null -`, { stdio: "pipe" });
    ok("GIF integre (decode OK)");
  } catch (err) {
    warn("Le GIF a produit un warning au decode — peut-etre un artefact de palette :");
    console.error("  " + (err.stderr?.toString().split("\n").filter(Boolean).slice(0, 3).join("\n  ") ?? ""));
  }

  // ── 5. Encodage WebM (qualite superieure, poids leger) ──
  step(3, 4, "Encodage WebM (VP9, qualite superieure, poids leger)…");
  const webmCmd = [
    `ffmpeg -y -i "${OUT_MP4}"`,
    `-c:v libvpx-vp9 -pix_fmt yuv420p -b:v 600k -deadline good -cpu-used 2`,
    `"${OUT_WEBM}"`,
  ].join(" ");
  execSync(webmCmd, { stdio: ["ignore", "inherit", "pipe"] });
  webmSize = statSync(OUT_WEBM).size;
  ok(`WebM encode → ${OUT_WEBM} (${SIZE_MB(webmSize)})`);

  // ── 6. Recap intermediaire ──
  step(4, 4, "Sortie + recap final…");
  ok("OK");
} finally {
  // Garantit la suppression du tmp meme en cas d'echec d'une etape (gif/webm/mp4).
  // Idempotent grace a `{ force: true }`, donc on peut l'appeler sans verifier l'existence.
  rmSync(TMP_DIR, { recursive: true, force: true });
}

// ── 7. Récapitulatif ──
console.log(`\n\x1b[32m🎉 Demo GIF prete :\x1b[0m`);
console.log(`   • GIF  : ${OUT_GIF} (${SIZE_MB(gifSize)})`);
console.log(`   • WebM : ${OUT_WEBM} (${SIZE_MB(webmSize)})`);
console.log(`   • Specs: 480x270 px, ${TOTAL_DUR}s, ${FPS} fps, loop infini\n`);
console.log(`\x1b[36m📌 Insertion suggeree :\x1b[0m`);
console.log(`   Markdown (README + landing premium) :`);
console.log(`     ![Demo Eldoria](./public/illustrations/demo.gif)`);
console.log(`   HTML progressif (meilleur rendu GitHub) :`);
console.log(`     <picture>`);
console.log(`       <source srcset="./public/illustrations/demo.webm" type="video/webm">`);
console.log(`       <img src="./public/illustrations/demo.gif" alt="Demo Eldoria" width="480">`);
console.log(`     </picture>\n`);
