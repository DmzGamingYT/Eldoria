// ════════════════════════════════════════════════════════════════
//  Démo GIF pour le README GitHub & la landing page Eldoria
// ════════════════════════════════════════════════════════════════
//  Capture 5 courtes scènes de VRAI gameplay au lieu d'un
//  diaporama Ken Burns sur screenshots fixes. Chaque scène est
//  forcée dans un état « clean » (HP plein, pas de buff flottant,
//  pas de flash, caméra fixée) puis capturée image par image à
//  12 fps via Playwright, puis chaînée par ffmpeg xfade.
//
//  Scènes (1.5 s chacune, fondu 0.3 s entre) :
//    1. Monde 3D            — panorama golden hour
//    2. Combat + HUD clean  — attaque en arc doré, HUD complet
//    3. Dialogue Aldric     — parchemin avec réplique en cours
//    4. Inventaire          — items de toutes raretés équipés
//    5. Arbre de Talents    — 3 branches avec talents investis
//
//  Sortie : 480×270 @ 12 fps · ~6.3 s · ~700 KB WebM / 1.2 MB GIF.
//
//  Prérequis :
//    1) bun install (ou npm i)
//    2) bunx playwright install chromium
//    3) bun run dev  (port 3000, dans un terminal séparé)
//
//  Usage :  bun run build:demo
//     ou :  node scripts/build-demo-gif.mjs
// ════════════════════════════════════════════════════════════════

import { chromium } from "playwright";
import { execSync } from "node:child_process";
import { mkdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";

const TMP_DIR  = "./tmp/demo-build";
const OUT_DIR  = "./public/illustrations";
const OUT_MP4  = path.join(TMP_DIR, "demo.mp4");
const OUT_GIF  = path.join(OUT_DIR, "demo.gif");
const OUT_WEBM = path.join(OUT_DIR, "demo.webm");

const BASE_URL = process.env.ELDORIA_URL ?? "http://localhost:3000";
const VIEWPORT = { width: 1280, height: 720 };

// ── Timing ──
const FPS_OUT        = 12;
const SCENE_FRAMES   = 18;          // 18 / 12 fps = 1.5 s par scène
const XFADE_DUR      = 0.3;         // fondu entre scènes
const FRAME_INTERVAL = 1000 / FPS_OUT;
// TOTAL_DUR est calculé plus bas (lazy, après la déclaration de SCENES —
// éviterait sinon un TDZ « Cannot access 'SCENES' before initialization »).

// ── Output dims (480×270 — 16:9, pixel budget raisonnable) ──
const W = 480;
const H = 270;

// ── 5 scènes (ordre chronologique d'une partie) ──
const SCENES = [
  { id: "world",     label: "Monde 3D — golden hour, panorama" },
  { id: "combat",    label: "Combat + HUD clean (slime en vue)" },
  { id: "dialogue",  label: "Dialogue Aldric l'Ancien" },
  { id: "inventory", label: "Inventaire — toutes raretés" },
  { id: "talents",   label: "Arbre de Talents (3 branches)" },
];

// ── Helpers console ──
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const step  = (n, total, msg) => console.log(`\n\x1b[36m[${n}/${total}]\x1b[0m  ${msg}`);
const ok    = (msg) => console.log(`   \x1b[32m✓\x1b[0m  ${msg}`);
const warn  = (msg) => console.log(`   \x1b[33m⚠\x1b[0m  ${msg}`);
const info  = (msg) => console.log(`\x1b[36m🎬\x1b[0m  ${msg}`);
const fatal = (msg) => { console.error(`\n\x1b[31m❌\x1b[0m  ${msg}`); process.exit(1); };
const SIZE_MB = (b) => `${(b / 1024 / 1024).toFixed(2)} MB`;

// ── Validation ffmpeg/playwright ──
try { execSync("ffmpeg -version", { stdio: "ignore" }); }
catch { fatal("ffmpeg introuvable dans le PATH. Installe-le avant de relancer."); }

// ════════════════════════════════════════════════════════════════
//  1. PRÉPARATION
// ════════════════════════════════════════════════════════════════
info("Préparation des dossiers temporaires…");
rmSync(TMP_DIR, { recursive: true, force: true });
for (const s of SCENES) mkdirSync(path.join(TMP_DIR, s.id), { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

// ════════════════════════════════════════════════════════════════
//  2. CAPTURE PLAYWRIGHT
// ════════════════════════════════════════════════════════════════
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

/**
 * Injecte un état Zustand « clean » pour la scène idx :
 *  - HP plein, joueur invincible (1 h), pas d'attaque, pas de buff
 *  - Caméra fixée par scène (yaw / pitch)
 *  - UI panel selon la scène (dialog / inventaire / talents)
 *  - Ennemis / loot / particules vidés
 * À exécuter AVANT la première capture de chaque scène, puis laisser 200 ms
 * au moteur R3F pour stabiliser bloom + fog + godrays.
 */
async function injectSceneState(page, sceneIdx) {
  await page.evaluate((idx) => {
    const store = window.gameStore;
    if (!store) return;
    const s = store.getState();
    const now = performance.now() / 1000;

    // Périmètre commun « clean »
    const cleanPlayer = {
      ...s.player,
      health: s.derivedMaxHealth,
      mana:   s.derivedMaxMana,
      invulnerableUntil: now + 3600, // 1 h — bloque toute entrée de dégâts
      lastDamageTime: 0,
      isAttacking: false,
      attackCooldown: 0,
      isMoving: false,
      isDead: false,
      facingDir: [0, 0, -1],
    };

    const baseUi = {
      ...s.ui,
      dialogue: null,
      shop: null,
      inventory: false,
      quests: false,
      character: false,
      talents: false,
      help: false,
      options: false,
      toast: null,
    };

    // Ennemis : on les éloigne TOUS hors champ (x = 999) pour les scènes
    // non-combat. Pour la scène combat, on garde 1 slime à portée visible.
    const OFFSCREEN = [999, 0, 999];
    const newEnemies = s.enemies.map((e) => {
      if (idx === 1) {
        // Combat : on garde juste le premier slime, on le met devant nous
        if (e.type === "slime") {
          return { ...e, position: [8, e.position[1], -3], isDead: false, health: e.maxHealth };
        }
        return { ...e, position: OFFSCREEN };
      }
      return { ...e, position: OFFSCREEN };
    });

    // Per-scene overrides
    let yaw = 0.35;
    let pitch = 0.45;
    let pos = [0, s.player.position[1], 8]; // village center
    let ui = baseUi;
    let inventory = s.inventory;
    let equipment = s.equipment;
    let allocated = s.player.allocatedTalents;
    let points = s.player.talentPoints;

    switch (idx) {
      case 0: // World 3D — panorama semi-aérien
        yaw = 0.35; pitch = 0.42;
        pos = [0, s.player.position[1], 8];
        break;

      case 1: // Combat — face caméra ¾, slime à 1.5 m devant
        yaw = 1.55; pitch = 0.5;
        pos = [8, s.player.position[1], -5];
        // Player faces +Z (rotation=0 ⇒ atan2(0,+)=0 ⇒ world forward +Z) ;
        // slime spawné à z=-3 ⇒ devant le joueur (z=-5).
        cleanPlayer.rotation = 0;
        break;

      case 2: // Dialogue Aldric (-2, 6)
        yaw = -1.25; pitch = 0.45;
        pos = [-1.2, s.player.position[1], 4.5];
        ui = { ...baseUi, dialogue: "elder" };
        break;

      case 3: // Inventaire plein de goodies, équipement léger
        yaw = 0.0; pitch = 0.5;
        pos = [0, s.player.position[1], 8];
        ui = { ...baseUi, inventory: true };
        inventory = [
          { itemId: "rusty_sword", qty: 1 },
          { itemId: "iron_sword", qty: 1 },
          { itemId: "steel_axe", qty: 1 },
          { itemId: "flame_blade", qty: 1 },
          { itemId: "dragon_slayer", qty: 1 },
          { itemId: "leather_armor", qty: 1 },
          { itemId: "chain_mail", qty: 1 },
          { itemId: "plate_armor", qty: 1 },
          { itemId: "health_potion", qty: 3 },
          { itemId: "greater_health_potion", qty: 1 },
          { itemId: "mana_potion", qty: 2 },
          { itemId: "frost_ward_ring", qty: 1 },
        ];
        equipment = { weapon: "iron_sword", armor: "chain_mail", ring: "frost_ward_ring" };
        break;

      case 4: // Talents — level 5 (5 pts), 3 talents tier 1 alloués
        yaw = 0.0; pitch = 0.5;
        pos = [0, s.player.position[1], 8];
        ui = { ...baseUi, talents: true };
        allocated = { c_brawn: 1, m_focus: 1, s_hardy: 1 };
        points = 2;
        break;

      default:
        break;
    }

    store.setState({
      player: { ...cleanPlayer, position: pos },
      enemies: newEnemies,
      activeBuffs: [],
      floatingTexts: [],
      particles: [],
      skillCooldowns: {},
      loot: [],
      cameraYaw: yaw,
      cameraPitch: pitch,
      ui,
      inventory,
      equipment,
      // The talent allocations need a level consistent with max alloc
      // we set them via player.allocatedTalents + talentPoints; derive()
      // will re-resolve derivedAttack etc. when next stat read happens.
    });

    // Talents scene : bump level + bump des stats dérivées pour matcher
    // les effets des talents (c_brawn +3 ATK, m_focus +15 mana, s_hardy
    // +25 PV). Sans ça, les barres HUD à côté de l'arbre afficheraient
    // encore les valeurs de base niveau 1 et ce serait incohérent visuellement.
    if (idx === 4) {
      store.setState((st) => ({
        player: {
          ...st.player,
          level: 5,
          talentPoints: points,
          allocatedTalents: allocated,
          attack:    st.attack + 3,
          maxHealth: st.maxHealth + 25,
          maxMana:   st.maxMana + 15,
        },
        derivedAttack:    st.derivedAttack + 3,
        derivedMaxHealth: st.derivedMaxHealth + 25,
        derivedMaxMana:   st.derivedMaxMana + 15,
      }));
    }
  }, sceneIdx);
}

async function captureScenes() {
  info(`Lancement Chromium + navigation vers ${BASE_URL}`);
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=swiftshader", "--enable-webgl"],
  });
  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    locale: "fr-FR",
  });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log(`   \x1b[33m⚠\x1b[0m  page error: ${e.message}`));

  // ── Démarrage partie ──
  console.log(`\n\x1b[36m⚔️  Démo Eldoria — initialisation de la partie\x1b[0m\n`);
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await sleep(1500);

  const started = await clickIfVisible(page, /Commencer/i);
  if (!started) throw new Error("Bouton « Commencer » introuvable");
  await sleep(2200);

  // Skipper l'intro via le bouton « Passer » (toujours visible en bas-droite)
  const skipped = await clickIfVisible(page, /Passer/i, 5000);
  if (!skipped) {
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press("Enter").catch(() => {});
      await sleep(150);
    }
  }
  await sleep(2800); // laisser le monde se charger (cosmétiques, ennemis, …)

  // ── Capture des 5 scènes ──
  for (let sceneIdx = 0; sceneIdx < SCENES.length; sceneIdx++) {
    const scene = SCENES[sceneIdx];
    step(sceneIdx + 1, SCENES.length, scene.label);

    // 1) Forcer l'état « clean » de la scène
    await injectSceneState(page, sceneIdx);
    await sleep(220); // laisser R3F stabiliser bloom + god rays + Loading Suspense

    // 2) Capturer SCENE_FRAMES images à FPS_OUT (~1.5 s)
    const sceneDir = path.join(TMP_DIR, scene.id);
    for (let f = 0; f < SCENE_FRAMES; f++) {
      await page.screenshot({
        path: path.join(sceneDir, `frame_${String(f).padStart(3, "0")}.png`),
        type: "png",
      });
      await sleep(FRAME_INTERVAL);
    }
    ok(`${SCENE_FRAMES} frames capturées → ${sceneDir}/`);
  }

  await browser.close();
  ok("Browser fermé");
}

// ════════════════════════════════════════════════════════════════
//  3. ENCODAGE FFMPEG (image-sequence inputs + xfade chain)
// ════════════════════════════════════════════════════════════════
//
// On passe chaque scène comme une SEQUENCE d'images (« frame_%03d.png »).
// ffmpeg étend chaque input en un clip de durée = N/fps, puis on chaîne
// les 5 clips par transitions xfade successives. Avantage vs `-loop 1`:
// vrai clip procédural, pas une image fixe zoomée (ce qui était l'ancien
// rendu « chelou »).
//
// Offsets xfade (en secondes) :
//   idx 1 → 1.5 - 0.3  = 1.20
//   idx 2 → 1.2 × 2    = 2.40
//   idx 3 → 1.2 × 3    = 3.60
//   idx 4 → 1.2 × 4    = 4.80
//
// Durée totale = 5 × 1.5 - 4 × 0.3 = 6.3 s
function encodeDemo() {
  // ── 3a. Chaîne image-sequence + xfade vers MP4 ──
  step(1, 3, `Encodage MP4 (${SCENES.length} x ${SCENE_FRAMES}f @ ${FPS_OUT}fps…`);

  const inputArgs = SCENES
    .map((s) => `-framerate ${FPS_OUT} -i "${path.join(TMP_DIR, s.id, "frame_%03d.png")}"`)
    .join(" ");

  // xfade chain — chaque scène indexée [vN], transitions chaînées
  // outv = label final consommé par -map
  // Offsets : chaque N-ième xfade commence à `prev_end - XFADE_DUR` ; en
  // boucle `(i+1) * (D - X)` (où D = scène durée, X = xfade). ANCIENNE
  // formule `(i+1)*D - X` était mathématiquement fausse et tronquait la
  // chaîne à 2 scènes (sortie 2.67s au lieu de 6.3s).
  const xfadeOffsets = [];
  for (let i = 1; i < SCENES.length; i++) {
    xfadeOffsets.push((i * (SCENE_FRAMES / FPS_OUT - XFADE_DUR)).toFixed(2));
  }
  let xfadeChain = `[0:v][1:v]xfade=transition=fade:duration=${XFADE_DUR}:offset=${xfadeOffsets[0]}[a01]`;
  let prevLabel = "a01";
  for (let i = 2; i < SCENES.length; i++) {
    const isLast = i === SCENES.length - 1;
    const outLabel = isLast ? "vout" : `a0${i}`;
    xfadeChain += `;[${prevLabel}][${i}:v]xfade=transition=fade:duration=${XFADE_DUR}:offset=${xfadeOffsets[i - 1]}[${outLabel}]`;
    prevLabel = outLabel;
  }
  // Mise à l'échelle finale (capture = 1280×720 → output = 480×270)
  // Le filtre `fps=${FPS_OUT}` final est inutile : les inputs sont déjà à
  // 12 fps via `-framerate ${FPS_OUT}` ; la chaîne xfade propage la cadence.
  const filterComplex = `${xfadeChain};[vout]scale=${W}:${H}:flags=lanczos,format=yuv420p[v]`;

  const mp4Cmd = [
    "ffmpeg -y",
    inputArgs,
    `-filter_complex "${filterComplex}"`,
    `-map "[v]"`,
    `-c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p`,
    `-r ${FPS_OUT}`,
    `"${OUT_MP4}"`,
  ].join(" ");

  execSync(mp4Cmd, { stdio: ["ignore", "inherit", "pipe"] });
  ok(`MP4 → ${OUT_MP4} (${SIZE_MB(statSync(OUT_MP4).size)})`);

  // ── 3b. WebM (VP9, plus léger, idéal pour sites) ──
  step(2, 3, `Encodage WebM (VP9)…`);
  const webmCmd = [
    `ffmpeg -y -i "${OUT_MP4}"`,
    `-c:v libvpx-vp9 -pix_fmt yuv420p -b:v 600k -deadline good -cpu-used 2`,
    `"${OUT_WEBM}"`,
  ].join(" ");
  execSync(webmCmd, { stdio: ["ignore", "inherit", "pipe"] });
  ok(`WebM → ${OUT_WEBM} (${SIZE_MB(statSync(OUT_WEBM).size)})`);

  // ── 3c. GIF optimisé (palettegen + paletteuse bayer) ──
  step(3, 3, `Encodage GIF (palettegen + paletteuse)…`);
  const gifCmd = [
    `ffmpeg -y -i "${OUT_MP4}"`,
    `-vf "fps=${FPS_OUT},scale=${W}:-1:flags=lanczos,` +
      `split[s0][s1];[s0]palettegen=stats_mode=full[p];` +
      `[s1][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle"`,
    `-loop 0`,
    `"${OUT_GIF}"`,
  ].join(" ");
  execSync(gifCmd, { stdio: ["ignore", "inherit", "pipe"] });
  const gifBytes = statSync(OUT_GIF).size;
  ok(`GIF → ${OUT_GIF} (${SIZE_MB(gifBytes)})`);

  if (gifBytes > 4 * 1024 * 1024) {
    warn(`Le GIF dépasse 4 MB (${SIZE_MB(gifBytes)}). Considère baisser W à 360 ou SCENE_FRAMES.`);
  }

  // Validation intégrité GIF
  try {
    execSync(`ffmpeg -v error -i "${OUT_GIF}" -f null -`, { stdio: "pipe" });
    ok("GIF intègre (decode OK)");
  } catch (err) {
    warn("Le GIF a un warning au decode :");
    console.error(
      "  " +
        (err.stderr?.toString().split("\n").filter(Boolean).slice(0, 3).join("\n  ") ?? "")
    );
  }
}

// ════════════════════════════════════════════════════════════════
//  4. RUN + CLEANUP
// ════════════════════════════════════════════════════════════════
(async () => {
  try {
    await captureScenes();
    encodeDemo();
} finally {
  // KEEP_TMP=1 saute le cleanup final — utile pour inspecter les PNGs bruts
  // (par scène dans `tmp/demo-build/<scene>/frame_NNN.png`) avant ffmpeg.
  if (!process.env.KEEP_TMP) {
    rmSync(TMP_DIR, { recursive: true, force: true });
  } else {
    info(`KEEP_TMP=1 → PNGs préservés dans ${TMP_DIR}/`);
  }
}

  console.log("\n\x1b[32m🎉 Démo générée :\x1b[0m");
  console.log(`   • GIF  : ${OUT_GIF}  (${SIZE_MB(statSync(OUT_GIF).size)})`);
  console.log(`   • WebM : ${OUT_WEBM} (${SIZE_MB(statSync(OUT_WEBM).size)})`);
  const totalDur = SCENES.length * (SCENE_FRAMES / FPS_OUT) -
                    (SCENES.length - 1) * XFADE_DUR;
  console.log(`   • Durée : ${totalDur.toFixed(2)} s · ${FPS_OUT} fps · ${W}×${H}\n`);
  console.log("\x1b[36m📌 Insertion suggérée :\x1b[0m");
  console.log("    Markdown :");
  console.log("      ![Démo Eldoria](./public/illustrations/demo.gif)");
  console.log("    HTML progressif :");
  console.log("      <picture>");
  console.log('        <source srcset="./public/illustrations/demo.webm" type="video/webm">');
  console.log('        <img src="./public/illustrations/demo.gif" alt="Démo Eldoria" width="480">');
  console.log("      </picture>\n");
})().catch((err) => {
  console.error("\n❌ Erreur :", err?.message ?? err);
  console.error(
    `→ Vérifie que \`bun run dev\` tourne bien sur ${BASE_URL}\n`
  );
  process.exit(1);
});
