// ══════════════════════════════════════════════════════════════
//  Cinematic trailer GIF for the Eldoria README
// ══════════════════════════════════════════════════════════════
//  Captures ~10 seconds of gameplay as a sequence of PNG frames
//  (1440×900 @ 12 fps → 120 frames), then uses ffmpeg to encode
//  them into a looping cinematic GIF that auto-plays in the README.
//
//  Prérequis :
//    1) bun install (or bun add -d playwright)
//    2) bunx playwright install chromium
//    3) bun run dev  (in a separate terminal, port 3000)
//
//  Usage :
//    bun run trailer
//      or :  node scripts/capture-trailer.mjs
// ══════════════════════════════════════════════════════════════

import { chromium } from "playwright";
import { execSync } from "node:child_process";
import { mkdirSync, existsSync, rmSync } from "node:fs";
import path from "node:path";

const FRAMES_DIR = "./tmp/trailer-frames";
const OUTPUT_GIF = "./public/illustrations/trailer.gif";
const OUTPUT_WEBM = "./public/illustrations/trailer.webm";
const BASE_URL = process.env.ELDORIA_URL ?? "http://localhost:3000";
const VIEWPORT = { width: 1280, height: 720 };
const FRAME_INTERVAL_MS = 80; // ≈ 12 fps
const TOTAL_SECONDS = 10;
const TOTAL_FRAMES = Math.floor((TOTAL_SECONDS * 1000) / FRAME_INTERVAL_MS);

// `rmSync` with `{ force: true, recursive: true }` is a no-op if the
// directory doesn't exist — so we just call it unconditionally (no
// `existsSync` check, which would be a `no-unused-expressions` lint hit).
rmSync(FRAMES_DIR, { recursive: true, force: true });
mkdirSync(FRAMES_DIR, { recursive: true });
mkdirSync(path.dirname(OUTPUT_GIF), { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ok   = (msg) => console.log(`   \x1b[32m✓\x1b[0m ${msg}`);
const info = (msg) => console.log(`\n\x1b[36m🎬\x1b[0m ${msg}`);

async function clickIfVisible(page, regex, timeout = 5000) {
  try {
    const loc = page.locator("button", { hasText: regex }).first();
    await loc.waitFor({ state: "visible", timeout });
    await loc.click();
    return true;
  } catch {
    return false;
  }
}

async function captureTrailer() {
  info(`Lancement du cinematic trailer  →  ${BASE_URL}`);
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=swiftshader", "--enable-webgl"],
  });
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1, locale: "fr-FR" });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("   ⚠️  Page error:", e.message));

  // ── 1. Menu principal : pose statique 1.5 s
  info(`[1/4] Pose statique du menu principal…`);
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await sleep(1500);
  await page.screenshot({ path: `${FRAMES_DIR}/frame_0000.png` });

  // ── 2. Lancement d'une partie
  info(`[2/4] Démarrage partie + skip de l'intro…`);
  await clickIfVisible(page, /Commencer une nouvelle quête/i);
  await sleep(1200);
  // Skipper l'intro en appuyant sur Entrée plusieurs fois
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press("Enter").catch(() => {});
    await page.mouse.click(640, 360).catch(() => {});
    await sleep(200);
  }
  await sleep(1500);

  // ── 3. Capture des frames de gameplay
  info(`[3/4] Capture de ${TOTAL_FRAMES} frames (${TOTAL_SECONDS}s @ ~12 fps)…`);
  // Séquence chorégraphiée : mouvement + rotation + combats
  const choreography = [
    { t: 0,    keys: [["w", 2400]] },        // avance
    { t: 2.4,  keys: [["d", 600], ["w", 600]] }, // tourne droite + avance
    { t: 3.6,  keys: [["Space", 100], ["w", 500]] }, // attaque + avance
    { t: 4.2,  keys: [["Space", 100], ["Space", 100], ["w", 600]] }, // combo
    { t: 5.2,  keys: [["a", 800], ["w", 800]] }, // pivote + avance
    { t: 6.4,  keys: [["Space", 100], ["d", 400], ["Space", 100]] }, // attaque + rotation
    { t: 7.2,  keys: [["w", 1200], ["Space", 100]] }, // longue avancée + coup
    { t: 8.4,  keys: [["s", 600], ["Space", 100]] }, // recule + coup final
  ];

  const start = Date.now();
  let choreoIdx = 0;
  const pressedAt = new Map();

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const t = (Date.now() - start) / 1000;
    // Démarrer les touches selon la chorégraphie
    while (choreoIdx < choreography.length && t >= choreography[choreoIdx].t) {
      const step = choreography[choreoIdx++];
      for (const [key, ms] of step.keys) {
        await page.keyboard.down(key).catch(() => {});
        pressedAt.set(key, Date.now() + ms);
      }
    }
    // Relâcher les touches dont la durée est écoulée (snapshot pour éviter mutation pendant iteration)
    for (const [key, until] of Array.from(pressedAt.entries())) {
      if (Date.now() >= until) {
        await page.keyboard.up(key).catch(() => {});
        pressedAt.delete(key);
      }
    }
    // Rotation caméra lente (touches [ ])
    if (i % 3 === 0) await page.keyboard.press("]").catch(() => {});
    if (i % 5 === 0) await page.keyboard.press("[").catch(() => {});

    await page.screenshot({
      path: `${FRAMES_DIR}/frame_${String(i).padStart(4, "0")}.png`,
      fullPage: false,
      type: "png",
    });
    await sleep(FRAME_INTERVAL_MS);
  }

  // Relâcher toute touche encore active avant de fermer
  for (const key of pressedAt.keys()) await page.keyboard.up(key).catch(() => {});

  await browser.close();
  ok(`${TOTAL_FRAMES} frames PNG capturées`);

  // ── 4. Encodage GIF + WebM via ffmpeg (~5s en arrière-plan)
  info(`[4/4] Encodage GIF + WebM via ffmpeg…`);
  const fps = Math.round(1000 / FRAME_INTERVAL_MS);
  execSync(
    `ffmpeg -y -framerate ${fps} -i "${FRAMES_DIR}/frame_%04d.png" ` +
      `-vf "fps=${fps},scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5" ` +
      `-loop 0 "${OUTPUT_GIF}"`,
    { stdio: "inherit" }
  );
  ok(`GIF encodé → ${OUTPUT_GIF}`);

  execSync(
    `ffmpeg -y -framerate ${fps} -i "${FRAMES_DIR}/frame_%04d.png" ` +
      `-c:v libvpx-vp9 -pix_fmt yuv420p -b:v 1M "${OUTPUT_WEBM}"`,
    { stdio: "inherit" }
  );
  ok(`WebM encodé → ${OUTPUT_WEBM}`);

  // Nettoyage des frames temporaires
  rmSync(FRAMES_DIR, { recursive: true, force: true });
  console.log(`\n\x1b[32m🎉 Trailer généré :\x1b[0m`);
  console.log(`   • ${OUTPUT_GIF}`);
  console.log(`   • ${OUTPUT_WEBM}`);
}

captureTrailer().catch((err) => {
  console.error("\n❌ Échec du trailer :", err?.message ?? err);
  console.error("→ Vérifiez que `bun run dev` tourne bien sur http://localhost:3000\n");
  process.exit(1);
});
