// ═══════════════════════════════════════════════════════════════
// Capture d'écrans du jeu Eldoria pour le README GitHub
// ═══════════════════════════════════════════════════════════════
// Prérequis : bun add -d playwright (à installer avant usage)
// Usage : node scripts/capture-screenshots.mjs
// ═══════════════════════════════════════════════════════════════

import { chromium } from "playwright";
import { mkdirSync } from "fs";

const SCREENSHOTS_DIR = "./public/screenshots";

async function captureScreenshots() {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();

  console.log("⚔️ Capture d'écrans Eldoria — Démarrage...\n");

  // ── 1. Page de chargement ──────────────────────────────────
  console.log("📷 [1/4] Chargement de la page principale...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({
    path: `${SCREENSHOTS_DIR}/01-main-menu.png`,
    fullPage: false,
  });
  console.log("   ✅ Menu principal capturé");

  // ── 2. Démarrer une partie ─────────────────────────────────
  console.log("📷 [2/4] Lancement d'une nouvelle partie...");
  const newGameBtn = page.locator("text=Commencer une nouvelle quête");
  if (await newGameBtn.isVisible({ timeout: 5000 })) {
    await newGameBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/02-intro-sequence.png`,
      fullPage: false,
    });
    console.log("   ✅ Séquence d'intro capturée");

    // Passer l'intro
    console.log("📷 [3/4] Passage de l'intro...");
    const skipBtn = page.locator("text=Passer");
    if (await skipBtn.isVisible({ timeout: 3000 })) {
      await skipBtn.click();
    } else {
      for (let i = 0; i < 15; i++) {
        await page.click("body");
        await page.waitForTimeout(350);
      }
    }
    await page.waitForTimeout(2000);

    // ── 3. Monde 3D ─────────────────────────────────────────
    console.log("📷 [3/4] Capture du monde 3D...");
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/03-game-world.png`,
      fullPage: false,
    });
    console.log("   ✅ Monde 3D capturé");

    // ── 4. HUD ──────────────────────────────────────────────
    console.log("📷 [4/4] Capture du HUD...");
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/04-gameplay-hud.png`,
      fullPage: false,
    });
    console.log("   ✅ Gameplay avec HUD capturé");
  } else {
    console.log("   ⚠️ Bouton non trouvé, tentative alternative...");
    for (let i = 0; i < 5; i++) {
      const btns = page.locator("button");
      const count = await btns.count();
      for (let j = 0; j < count; j++) {
        const text = await btns.nth(j).textContent();
        if (text && text.includes("Commencer")) {
          await btns.nth(j).click();
          await page.waitForTimeout(5000);
          break;
        }
      }
    }
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/03-game-world.png`,
      fullPage: false,
    });
  }

  console.log("\n🎉 Toutes les captures sont terminées !");
  console.log(`📁 Fichiers sauvegardés dans : ${SCREENSHOTS_DIR}/`);

  await browser.close();
}

captureScreenshots().catch((err) => {
  console.error("❌ Erreur lors de la capture :", err);
  process.exit(1);
});
