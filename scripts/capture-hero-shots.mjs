// ═══════════════════════════════════════════════════════════════
//  Capture de 3 hero shots pour le README GitHub
// ═══════════════════════════════════════════════════════════════
//  Scènes optimisées :
//    1) Intro cinématique — 6 lignes visibles (texte dramatique)
//    2) Monde 3D — golden hour, caméra éloignée, panorama
//    3) Combat + HUD — ennemi en range, attaque en cours, HUD visible
//
//  Prérequis :
//    1) bun install
//    2) bunx playwright install chromium
//    3) bun run dev  (port 3000)
//
//  Usage :
//    node scripts/capture-hero-shots.mjs
// ═══════════════════════════════════════════════════════════════

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const SCREENSHOTS_DIR = "./public/screenshots";
const BASE_URL = process.env.ELDORIA_URL ?? "http://localhost:3000";
const VIEWPORT = { width: 1440, height: 900 };

mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ok    = (msg) => console.log(`   \x1b[32m✓\x1b[0m ${msg}`);
const step  = (n, msg) => console.log(`\n\x1b[36m📷 [${n}/3]\x1b[0m ${msg}`);

async function shoot(page, filename, label = "") {
  const path = `${SCREENSHOTS_DIR}/${filename}`;
  await page.screenshot({ path, fullPage: false, type: "png" });
  ok(`${label || filename} → ${path}`);
}

async function clickIfVisible(page, regex, timeout = 4000) {
  try {
    const loc = page.locator("button", { hasText: regex }).first();
    await loc.waitFor({ state: "visible", timeout });
    await loc.click();
    return true;
  } catch {
    return false;
  }
}

async function captureHeroShots() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=swiftshader"],
  });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1.5,
    locale: "fr-FR",
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => console.log("   ⚠️  Page error:", e.message));

  console.log(`\n⚔️  Hero Shots Eldoria  →  ${BASE_URL}\n`);

  // ───────────── 1/3 — Intro cinématique dramatique ─────────────
  step(1, "Intro cinématique — 6 lignes visibles…");
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await sleep(3500);

  // Click "Commencer une nouvelle quête"
  const started = await clickIfVisible(page, /Commencer/i);
  if (!started) throw new Error("Bouton « Commencer » introuvable");
  await sleep(2500);

  // Avancer jusqu'à 6 lignes visibles (texte dramatique)
  // Lignes 0-5 = "Depuis trois hivers…" → "Vous êtes le dernier espoir."
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Space");
    await sleep(450);
  }
  // Laisser la dernière ligne s'animer
  await sleep(1200);
  await shoot(page, "02-intro-sequence.png", "Intro cinématique (6 lignes)");

  // ───────────── Skipper l'intro ─────────────
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press("Enter").catch(() => {});
    await page.mouse.click(720, 450).catch(() => {});
    await sleep(250);
  }
  await sleep(2000);

  // ───────────── 2/3 — Monde 3D panoramique (golden hour) ─────────────
  step(2, "Monde 3D — caméra éloignée + golden hour…");

  // Se déplacer vers un point dégagé (village centre)
  // Le spawn est à (0, 8), on avance un peu vers le nord
  await page.keyboard.down("w");
  await sleep(400);
  await page.keyboard.up("w");
  await sleep(300);

  // Manipuler le store Zustand via page.evaluate pour un angle caméra panoramique
  await page.evaluate(() => {
    const store = (window).gameStore;
    if (store) {
      // Caméra éloignée, angle incliné vers le bas pour voir le monde
      // yaw ~0.3 (légèrement tourné), pitch ~0.45 (vue semi-panoramique)
      store.setState({
        cameraYaw: 0.3,
        cameraPitch: 0.42,
      });
    } else {
      console.warn("gameStore not found — camera angles not applied");
    }
  });
  // Laisser la scène se stabiliser (bloom, fog, sky)
  await sleep(2500);
  await shoot(page, "03-game-world.png", "Monde 3D panoramique");

  // ───────────── 3/3 — Combat + HUD ─────────────
  step(3, "Combat + HUD — action en cours…");

  // Téléporter le joueur près des slimes + forcer HP bas + buff actif
  await page.evaluate(() => {
    const store = window.gameStore;
    if (store) {
      const s = store.getState();
      store.setState({
        cameraYaw: 1.6,
        cameraPitch: 0.5,
        player: { ...s.player, position: [8, s.player.position[1], -5], health: Math.floor(s.derivedMaxHealth * 0.18) },
        activeBuffs: [{
          id: 'shield_capture', type: 'shield', name: 'Bouclier Arcanique',
          icon: '🛡️', expiresAt: performance.now() / 1000 + 30, power: 0.5
        }],
      });
    } else {
      console.warn("gameStore not found — state not applied");
    }
  });
  await sleep(1500);

  // Lancer quelques attaques pour déclencher le combat
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press("Space");
    await sleep(350);
  }
  await sleep(600);

  // Ajuster la caméra pour un angle dramatique
  await page.evaluate(() => {
    const store = window.gameStore;
    if (store) {
      store.setState({
        cameraYaw: 1.4,
        cameraPitch: 0.55,
      });
    }
  });
  await sleep(800);

  // Une attaque de plus pour un moment d'action
  await page.keyboard.press("Space");
  await sleep(200);
  await shoot(page, "04-combat-hud.png", "Combat + HUD (action)");

  // ───────────── DONE ─────────────
  console.log(`\n\x1b[32m🎉 3 hero shots capturés !\x1b[0m`);
  console.log(`📁 Fichiers dans : ${SCREENSHOTS_DIR}/\n`);

  await browser.close();
}

captureHeroShots().catch((err) => {
  console.error("\n❌ Erreur lors de la capture :", err?.message ?? err);
  console.error(
    "→ Vérifiez que `bun run dev` tourne bien sur http://localhost:3000\n"
  );
  process.exit(1);
});
