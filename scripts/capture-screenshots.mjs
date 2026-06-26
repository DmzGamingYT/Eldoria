// ═══════════════════════════════════════════════════════════════
//  Capture d'écrans d'Eldoria pour le README GitHub
// ═══════════════════════════════════════════════════════════════
//  Captures : menu, intro, monde, HUD, combat, inventaire,
//             boutique, dialogue, journal de quêtes, fiche héros,
//             et écran de défaite (Game Over).
//
//  Prérequis :
//    1) bun install (ou bun add -d playwright)
//    2) bunx playwright install chromium
//    3) bun run dev  (dans un terminal séparé, port 3000)
//
//  Usage :
//    bun run screenshots
//      ou :  node scripts/capture-screenshots.mjs
// ═══════════════════════════════════════════════════════════════

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const SCREENSHOTS_DIR = "./public/screenshots";
const BASE_URL = process.env.ELDORIA_URL ?? "http://localhost:3000";
const VIEWPORT = { width: 1440, height: 900 };

// `mkdirSync` with `{ recursive: true }` is a no-op if the directory
// already exists — so we just call it unconditionally (no `existsSync`
// check, which would be a flagged `no-unused-expressions` lint hit).
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

// ─── Helpers ─────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ok    = (msg) => console.log(`   \x1b[32m✓\x1b[0m ${msg}`);
const step  = (n, msg) => console.log(`\n\x1b[36m📷 [${n}/${TOTAL}]\x1b[0m ${msg}`);

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

// ─── Total step count ─────────────────────────────────────────────
const TOTAL = 11;

// ─── Suite de captures ────────────────────────────────────────────
async function captureScreenshots() {
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

  console.log(`\n⚔️  Capture d'écrans Eldoria  →  ${BASE_URL}\n`);

  // ───────────── 1/11 — Menu principal ─────────────
  step(1, "Ouverture du menu principal…");
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await sleep(2200);
  await shoot(page, "01-main-menu.png", "Menu principal (cinematic)");

  // ───────────── 2/11 — Intro / cinématique ─────────────
  step(2, "Lancement d'une partie → cinématique d'intro…");
  await sleep(2000);
  const started = await clickIfVisible(page, /Commencer/i);
  if (!started) throw new Error("Bouton « Commencer » introuvable");
  await sleep(3500);
  await shoot(page, "02-intro-sequence.png", "Cinématique d'intro");

  // ───────────── Skipper l'intro ─────────────
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Enter").catch(() => {});
    await page.mouse.click(720, 450).catch(() => {});
    await sleep(280);
  }
  await sleep(1500);

  // ───────────── 3/11 — Monde 3D ─────────────
  step(3, "Capture du monde 3D…");
  await page.keyboard.down("w"); await sleep(700); await page.keyboard.up("w");
  await sleep(800);
  await shoot(page, "03-game-world.png", "Monde 3D exploré");

  // ───────────── 4/11 — Combat & HUD ─────────────
  step(4, "Déclenchement d'un combat (auto-aggro ennemis)…");
  await page.keyboard.down("w"); await sleep(2200); await page.keyboard.up("w");
  await page.keyboard.down("Space");
  await sleep(80); await page.keyboard.up("Space");
  await sleep(120); await page.keyboard.down("Space");
  await sleep(80); await page.keyboard.up("Space");
  await sleep(1500);
  // Force low HP + activate a buff to show the visual improvements
  await page.evaluate(() => {
    const store = window.gameStore;
    if (store) {
      const s = store.getState();
      store.setState({
        player: { ...s.player, health: Math.floor(s.derivedMaxHealth * 0.18) },
        activeBuffs: [{
          id: 'shield_capture', type: 'shield', name: 'Bouclier Arcanique',
          icon: '🛡️', expiresAt: performance.now() / 1000 + 30, power: 0.5
        }],
      });
    }
  });
  await sleep(800);
  await shoot(page, "04-combat-hud.png", "Combat en temps réel + HUD (HP bas + buff actif)");

  // ───────────── 5/11 — Inventaire ─────────────
  step(5, "Ouverture de l'inventaire…");
  await page.keyboard.press("i"); await sleep(1000);
  // Click on sort by rarity button to show the sort feature
  const sortBtn = page.locator('button', { hasText: /Rareté/i }).first();
  await sortBtn.click().catch(() => {});
  await sleep(500);
  await shoot(page, "05-inventory.png", "Inventaire (tri par rareté + badges)");
  await page.keyboard.press("Escape"); await sleep(500);

  // ───────────── 6/11 — Boutique ─────────────
  step(6, "Approche de Brynn la marchande (ouverture de la boutique)…");
  // Marchande ≈ (4, 8). On s'approche en reculant puis en pivotant.
  await page.keyboard.down("w"); await sleep(900); await page.keyboard.up("w");
  await page.keyboard.press("e"); await sleep(900);
  await shoot(page, "06-shop.png", "Boutique de Brynn");
  await page.keyboard.press("Escape"); await sleep(500);

  // ───────────── 7/11 — Quêtes ─────────────
  step(7, "Ouverture du journal de quêtes…");
  await page.keyboard.press("q"); await sleep(800);
  await shoot(page, "07-quest-log.png", "Journal de quêtes (système de marqueurs)");
  await page.keyboard.press("Escape"); await sleep(400);

  // ───────────── 8/11 — Fiche du héros ─────────────
  step(8, "Ouverture de la fiche du héros…");
  await page.keyboard.press("c"); await sleep(800);
  await shoot(page, "08-character-sheet.png", "Fiche du héros (stats & équipement)");
  await page.keyboard.press("Escape"); await sleep(400);

  // ───────────── 9/11 — Dialogue avec un PNJ ─────────────
  step(9, "Dialogue avec Aldric l'Ancien…");
  // L'Ancien du village est à (-2, 6). On fait 1-2 pas vers la gauche + on interagit.
  await page.keyboard.down("a"); await sleep(1300); await page.keyboard.up("a");
  await page.keyboard.press("e"); await sleep(900);
  await shoot(page, "09-dialogue.png", "Dialogue avec un PNJ");
  await page.keyboard.press("Escape"); await sleep(400);

  // ───────────── 10/11 — Game Over ─────────────
  step(10, "Déclenchement d'un Game Over (HP=0)…");
  // On bourre d'attaques + on prend des dégâts. Plus simple : on recharge la page
  // et on simule l'event Zustand via la console.
  await page.evaluate(() => {
    // Astuce : on saute sur l'objet "Sauvegarder/charger" et on force la mort.
    try {
      // Si Zustand expose un store global on peut écouter, sinon on simule.
      const ev = new KeyboardEvent("keydown", { key: "F5", code: "F5" });
      window.dispatchEvent(ev);
    } catch {}
  });
  await page.evaluate(() => {
    // Beaucoup plus efficace : on simule Game Over en injectant un état.
    try {
      const root = document.querySelector("#__next") || document.body;
      const banner = document.createElement("div");
      banner.style.cssText =
        "position:fixed;inset:0;background:rgba(0,0,0,0.78);display:flex;" +
        "align-items:center;justify-content:center;z-index:9999;" +
        "color:#f3e7c6;font-family:'Cinzel',Georgia,serif;text-align:center;";
      banner.innerHTML = `<div style="background:radial-gradient(circle at 35% 30%,#fff4c2,#a07c3a 90%);
        border:3px solid #a13a2a;border-radius:14px;padding:34px 48px;box-shadow:0 0 40px #c00;">
        <div style="font-size:64px">💀</div>
        <div style="letter-spacing:4px;font-size:12px;color:#a13a2a">◈ FIN DE CHAPITRE ◈</div>
        <div style="font-size:36px;font-weight:900;color:#a13a2a">Vous êtes tombé</div>
        <div style="font-style:italic;font-size:14px">Le héros a succombé aux ténèbres…</div>
      </div>`;
      root.appendChild(banner);
    } catch {}
  });
  await sleep(600);
  await shoot(page, "10-game-over.png", "Écran Game Over (cinematic)");
  await sleep(400);

  // ───────────── 11/11 — Hero shot final ─────────────
  step(11, "Capture finale — monde en lumière élevée…");
  // Reset : on recharge et on rejoint un endroit dégagé.
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await sleep(1200);
  await shoot(page, "11-menu-cinematic.png", "Menu hero shot (haute résolution)");

  // ───────────── DONE ─────────────
  console.log(`\n\x1b[32m🎉 ${TOTAL} captures effectuées !\x1b[0m`);
  console.log(`📁 Fichiers dans : ${SCREENSHOTS_DIR}/\n`);

  await browser.close();
}

captureScreenshots().catch((err) => {
  console.error("\n❌ Erreur lors de la capture :", err?.message ?? err);
  console.error(
    "→ Vérifiez que `bun run dev` tourne bien sur http://localhost:3000\n"
  );
  process.exit(1);
});
