<!-- TOP-LEVEL HERO BANNER : bannière cinématique dawn -->
<p align="center">
  <a href="public/banner/eldoria-banner.svg">
    <picture>
      <img src="public/banner/eldoria-banner.svg" alt="Eldoria — Chroniques de la Forêt d'Argent" width="100%">
    </picture>
  </a>
</p>

<!-- Animated typing / sub-title SVG -->
<p align="center">
  <svg viewBox="0 0 720 80" xmlns="http://www.w3.org/2000/svg" width="720" style="max-width:100%;height:auto;">
    <defs>
      <linearGradient id="tGold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff4c2"/>
        <stop offset="50%" stop-color="#f6d97c"/>
        <stop offset="100%" stop-color="#a07c3a"/>
      </linearGradient>
    </defs>
    <text x="360" y="38" text-anchor="middle"
          font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="22" fill="url(#tGold)">
      &gt; Explorez le monde d'Eldoria...
      <animate attributeName="opacity" values="0;1;1;0;1" keyTimes="0;0.4;0.7;0.85;1" dur="4s" repeatCount="indefinite"/>
    </text>
    <text x="360" y="62" text-anchor="middle"
          font-family="Georgia, serif" font-size="12" fill="#a07c3a" letter-spacing="3">
      ◆ AFFRONTEZ LES OMBRES ◆ PURIFIEZ LE SANCTUAIRE ◆
    </text>
  </svg>
</p>

<!-- Tech stack badges row with subtle pulse -->
<p align="center">
  <svg width="0" height="0" style="position:absolute">
    <defs>
      <filter id="badgePulse" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="0.6"/>
      </filter>
    </defs>
  </svg>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img alt="React Three Fiber" src="https://img.shields.io/badge/React_Three_Fiber-9-049ef4?style=for-the-badge&logo=three.js&logoColor=white" />
  <img alt="Three.js" src="https://img.shields.io/badge/Three.js-0.184-049ef4?style=for-the-badge&logo=threedotjs&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <br/>
  <img alt="Electron" src="https://img.shields.io/badge/Electron-42-47848f?style=for-the-badge&logo=electron&logoColor=white" />
  <img alt="Zustand" src="https://img.shields.io/badge/Zustand-5-443e38?style=for-the-badge&logo=react&logoColor=white" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-6-2d3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img alt="SQLite" src="https://img.shields.io/badge/SQLite-local-003b57?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img alt="MIT-style" src="https://img.shields.io/badge/license-©_Auteur-3a2412?style=for-the-badge" />
</p>

<br/>

<!-- =====================  LORE  ===================== -->
<div align="center">
  <svg viewBox="0 0 1000 220" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:1000px">
    <defs>
      <linearGradient id="paraLore" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f8e9c5"/>
        <stop offset="50%" stop-color="#ead7a8"/>
        <stop offset="100%" stop-color="#d8be83"/>
      </linearGradient>
      <linearGradient id="inkLore" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff4c2"/>
        <stop offset="100%" stop-color="#a07c3a"/>
      </linearGradient>
    </defs>
    <!-- Parchment background -->
    <path d="M30,20 L970,20 Q980,20 980,30 L980,190 Q980,200 970,200 L30,200 Q20,200 20,190 L20,30 Q20,20 30,20 Z"
          fill="url(#paraLore)" stroke="#a07c3a" stroke-width="2"/>
    <path d="M40,30 L960,30 Q965,30 965,35 L965,185 Q965,190 960,190 L40,190 Q35,190 35,185 L35,35 Q35,30 40,30 Z"
          fill="none" stroke="#a07c3a" stroke-width="0.6" opacity="0.6"/>
    <!-- Corners ornaments -->
    <text x="46" y="50" font-size="22" fill="#a07c3a" font-family="Georgia, serif">❦</text>
    <text x="954" y="50" font-size="22" fill="#a07c3a" font-family="Georgia, serif" text-anchor="end">❧</text>
    <text x="46" y="190" font-size="22" fill="#a07c3a" font-family="Georgia, serif">❧</text>
    <text x="954" y="190" font-size="22" fill="#a07c3a" font-family="Georgia, serif" text-anchor="end">❦</text>
    <!-- Eyebrow -->
    <text x="500" y="68" text-anchor="middle" font-family="Georgia, serif" font-size="13"
          fill="#a13a2a" letter-spacing="6" font-weight="bold">◈ LA LÉGENDE ◈</text>
    <!-- Animated gold line -->
    <line x1="200" y1="78" x2="800" y2="78" stroke="url(#inkLore)" stroke-width="1.4" opacity="0.85"/>
    <circle cx="200" cy="78" r="3" fill="#f6d97c"/>
    <circle cx="800" cy="78" r="3" fill="#f6d97c"/>
    <!-- Lore text -->
    <g font-family="Georgia, 'Times New Roman', serif" fill="#3a2412" text-anchor="middle">
      <text x="500" y="108" font-size="16" font-style="italic">
        Autrefois, le royaume d'Eldoria prospérait sous la lumière de l'<tspan font-weight="bold">Arbre d'Argent</tspan>.
      </text>
      <text x="500" y="132" font-size="16" font-style="italic">
        Mais voici trois hivers, le sorcier <tspan font-weight="bold" fill="#a13a2a">Mordrak</tspan> a brisé le sceau ancien
        et déchaîné ses armées sur les terres des hommes.
      </text>
      <text x="500" y="156" font-size="16" font-style="italic">
        Les héros d'antan ont disparu — <tspan font-weight="bold" fill="#a13a2a">vous êtes le dernier porteur d'espoir</tspan>.
      </text>
      <text x="500" y="180" font-size="15" fill="#5a3a1f">
        Forgez votre légende. Terrassez les ténèbres. Rendez la paix à Eldoria.
      </text>
    </g>
    <!-- Glow dancing circles -->
    <circle cx="500" cy="40" r="3" fill="#f6d97c">
      <animate attributeName="opacity" values="0.2;1;0.2" dur="3.2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="60" cy="110" r="2" fill="#a07c3a">
      <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2.6s" begin="0.6s" repeatCount="indefinite"/>
    </circle>
    <circle cx="940" cy="110" r="2" fill="#a07c3a">
      <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2.6s" begin="1.2s" repeatCount="indefinite"/>
    </circle>
  </svg>
</div>

<br/>

---

## ⚔️ Galerie en action

<!-- Animated cinebar — cinematic intro -->
<p align="center">
  <svg viewBox="0 0 920 100" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:920px">
    <defs>
      <linearGradient id="cineGold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff4c2"/>
        <stop offset="50%" stop-color="#f6d97c"/>
        <stop offset="100%" stop-color="#a07c3a"/>
      </linearGradient>
      <linearGradient id="cineDark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1a0e2e"/>
        <stop offset="100%" stop-color="#3a2412"/>
      </linearGradient>
    </defs>
    <!-- Cartouche background with subtle glow -->
    <rect x="80" y="20" width="760" height="68" fill="url(#cineDark)" stroke="url(#cineGold)" stroke-width="2" rx="8"/>
    <rect x="86" y="26" width="748" height="56" fill="none" stroke="#f6d97c" stroke-width="0.5" rx="6" opacity="0.5"/>
    <!-- Decorative side ornaments -->
    <text x="100" y="62" fill="#f6d97c" font-family="Georgia, serif" font-size="22" opacity="0.9">❦</text>
    <text x="820" y="62" fill="#f6d97c" font-family="Georgia, serif" font-size="22" opacity="0.9" text-anchor="end">❧</text>
    <!-- Eyebrow -->
    <text x="460" y="40" text-anchor="middle" fill="#f6d97c" font-family="Georgia, serif" font-size="11" letter-spacing="6" font-weight="bold">◈ UNE PLONGÉE EN IMAGES ◈</text>
    <!-- Subtitle with cinematic fade-in -->
    <text x="460" y="66" text-anchor="middle" fill="#fff4c2" font-family="Georgia, serif" font-size="17" font-style="italic">
      Quatre instants saisis dans le royaume d'Eldoria…
      <animate attributeName="opacity" values="0;1" dur="1.6s" fill="freeze"/>
    </text>
    <!-- Twinkling corner sparkles -->
    <circle cx="100" cy="34" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" repeatCount="indefinite"/></circle>
    <circle cx="820" cy="34" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="0.6s" repeatCount="indefinite"/></circle>
    <circle cx="100" cy="86" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="1.2s" repeatCount="indefinite"/></circle>
    <circle cx="820" cy="86" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="1.8s" repeatCount="indefinite"/></circle>
  </svg>
</p>

<br/>

<!-- 2×2 grid of "tableaux" — framed parchment cards -->
<table align="center" cellpadding="0" cellspacing="0">
<tr>
<td width="50%" align="center" valign="top">

<a href="public/screenshots/01-main-menu.png">
  <img src="public/screenshots/01-main-menu.png" alt="Menu principal d'Eldoria — fond cinématique, ambres flottants" width="100%" style="max-width:600px; display:block; border-radius:2px; border:2px solid #a07c3a; box-shadow:0 4px 16px rgba(0,0,0,0.45);">
</a>

<!-- Animated title cartouche (gaM) -->
<svg viewBox="0 0 600 54" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:600px">
  <defs>
    <linearGradient id="gaMBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a0e2e"/>
      <stop offset="100%" stop-color="#3a2412"/>
    </linearGradient>
    <linearGradient id="gaMGold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff4c2"/>
      <stop offset="50%" stop-color="#f6d97c"/>
      <stop offset="100%" stop-color="#a07c3a"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="596" height="50" fill="url(#gaMBg)" stroke="url(#gaMGold)" stroke-width="2" rx="4">
    <animate attributeName="stroke-opacity" values="0.55;1;0.55" dur="3.6s" repeatCount="indefinite"/>
  </rect>
  <rect x="8" y="8" width="584" height="38" fill="none" stroke="#f6d97c" stroke-width="0.4" rx="2" opacity="0.45"/>
  <text x="14" y="20" fill="#a07c3a" font-family="Georgia, serif" font-size="11">❦</text>
  <text x="586" y="20" text-anchor="end" fill="#a07c3a" font-family="Georgia, serif" font-size="11">❧</text>
  <text x="300" y="34" text-anchor="middle" fill="#f6d97c" font-family="Georgia, serif" font-size="13" font-weight="bold" letter-spacing="4">❦ ⚔ MENU PRINCIPAL ❦</text>
  <circle cx="14" cy="46" r="2" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="0s" repeatCount="indefinite"/></circle>
  <circle cx="586" cy="46" r="2" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="0.6s" repeatCount="indefinite"/></circle>
  <circle cx="14" cy="10" r="2" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="1.2s" repeatCount="indefinite"/></circle>
  <circle cx="586" cy="10" r="2" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="1.8s" repeatCount="indefinite"/></circle>
</svg>

<p align="center" style="max-width:600px"><em>🏰 Le portail de l'aventure — fond cinématique, ambres flottants, rayons divins.</em></p>
<p align="center" style="max-width:600px"><em>🏰 Le portail de l'aventure — fond cinématique, ambres flottants, rayons divins.</em></p>

</td>
<td width="50%" align="center" valign="top">

<a href="public/screenshots/03-game-world.png">
  <img src="public/screenshots/03-game-world.png" alt="Terrain procédural d'Eldoria — biome 200×200, cycle jour/nuit" width="100%" style="max-width:600px; display:block; border-radius:2px; border:2px solid #a07c3a; box-shadow:0 4px 16px rgba(0,0,0,0.45);">
</a>

<!-- Animated title cartouche (gaW) -->
<svg viewBox="0 0 600 54" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:600px">
  <defs>
    <linearGradient id="gaWBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a0e2e"/>
      <stop offset="100%" stop-color="#3a2412"/>
    </linearGradient>
    <linearGradient id="gaWGold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff4c2"/>
      <stop offset="50%" stop-color="#f6d97c"/>
      <stop offset="100%" stop-color="#a07c3a"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="596" height="50" fill="url(#gaWBg)" stroke="url(#gaWGold)" stroke-width="2" rx="4">
    <animate attributeName="stroke-opacity" values="0.55;1;0.55" dur="3.6s" repeatCount="indefinite"/>
  </rect>
  <rect x="8" y="8" width="584" height="38" fill="none" stroke="#f6d97c" stroke-width="0.4" rx="2" opacity="0.45"/>
  <text x="14" y="20" fill="#a07c3a" font-family="Georgia, serif" font-size="11">❦</text>
  <text x="586" y="20" text-anchor="end" fill="#a07c3a" font-family="Georgia, serif" font-size="11">❧</text>
  <text x="300" y="34" text-anchor="middle" fill="#f6d97c" font-family="Georgia, serif" font-size="13" font-weight="bold" letter-spacing="4">❦ 🌲 LE MONDE ❦</text>
  <circle cx="14" cy="46" r="2" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="0s" repeatCount="indefinite"/></circle>
  <circle cx="586" cy="46" r="2" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="0.6s" repeatCount="indefinite"/></circle>
  <circle cx="14" cy="10" r="2" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="1.2s" repeatCount="indefinite"/></circle>
  <circle cx="586" cy="10" r="2" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="1.8s" repeatCount="indefinite"/></circle>
</svg>

<p align="center" style="max-width:600px"><em>🌲 Terrain procédural 200×200, cycle jour/nuit, brouillard atmosphérique.</em></p>
<p align="center" style="max-width:600px"><em>🌲 Terrain procédural 200×200, cycle jour/nuit, brouillard atmosphérique.</em></p>

</td>
</tr>
<tr><td colspan="2" height="20"></td></tr>
<tr>
<td width="50%" align="center" valign="top">

<a href="public/screenshots/04-gameplay-hud.png">
  <img src="public/screenshots/04-gameplay-hud.png" alt="HUD parchemin d'Eldoria — barres de vie/mana/XP, minimap, barre rapide" width="100%" style="max-width:600px; display:block; border-radius:2px; border:2px solid #a07c3a; box-shadow:0 4px 16px rgba(0,0,0,0.45);">
</a>

<!-- Animated title cartouche (gaC) -->
<svg viewBox="0 0 600 54" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:600px">
  <defs>
    <linearGradient id="gaCBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a0e2e"/>
      <stop offset="100%" stop-color="#3a2412"/>
    </linearGradient>
    <linearGradient id="gaCGold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff4c2"/>
      <stop offset="50%" stop-color="#f6d97c"/>
      <stop offset="100%" stop-color="#a07c3a"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="596" height="50" fill="url(#gaCBg)" stroke="url(#gaCGold)" stroke-width="2" rx="4">
    <animate attributeName="stroke-opacity" values="0.55;1;0.55" dur="3.6s" repeatCount="indefinite"/>
  </rect>
  <rect x="8" y="8" width="584" height="38" fill="none" stroke="#f6d97c" stroke-width="0.4" rx="2" opacity="0.45"/>
  <text x="14" y="20" fill="#a07c3a" font-family="Georgia, serif" font-size="11">❦</text>
  <text x="586" y="20" text-anchor="end" fill="#a07c3a" font-family="Georgia, serif" font-size="11">❧</text>
  <text x="300" y="34" text-anchor="middle" fill="#f6d97c" font-family="Georgia, serif" font-size="13" font-weight="bold" letter-spacing="4">❦ ⚔ COMBAT &amp; HUD ❦</text>
  <circle cx="14" cy="46" r="2" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="0s" repeatCount="indefinite"/></circle>
  <circle cx="586" cy="46" r="2" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="0.6s" repeatCount="indefinite"/></circle>
  <circle cx="14" cy="10" r="2" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="1.2s" repeatCount="indefinite"/></circle>
  <circle cx="586" cy="10" r="2" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="1.8s" repeatCount="indefinite"/></circle>
</svg>

<p align="center" style="max-width:600px"><em>⚔️ HUD parchemin, barres de vie/mana/XP, minimap, barre rapide.</em></p>
<p align="center" style="max-width:600px"><em>⚔️ HUD parchemin, barres de vie/mana/XP, minimap, barre rapide.</em></p>

</td>
<td width="50%" align="center" valign="top">

<a href="public/screenshots/02-intro-sequence.png">
  <img src="public/screenshots/02-intro-sequence.png" alt="Cinématique d'introduction — l'histoire de Mordrak contée en travelling 3D" width="100%" style="max-width:600px; display:block; border-radius:2px; border:2px solid #a07c3a; box-shadow:0 4px 16px rgba(0,0,0,0.45);">
</a>

<!-- Animated title cartouche (gaT) -->
<svg viewBox="0 0 600 54" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:600px">
  <defs>
    <linearGradient id="gaTBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a0e2e"/>
      <stop offset="100%" stop-color="#3a2412"/>
    </linearGradient>
    <linearGradient id="gaTGold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff4c2"/>
      <stop offset="50%" stop-color="#f6d97c"/>
      <stop offset="100%" stop-color="#a07c3a"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="596" height="50" fill="url(#gaTBg)" stroke="url(#gaTGold)" stroke-width="2" rx="4">
    <animate attributeName="stroke-opacity" values="0.55;1;0.55" dur="3.6s" repeatCount="indefinite"/>
  </rect>
  <rect x="8" y="8" width="584" height="38" fill="none" stroke="#f6d97c" stroke-width="0.4" rx="2" opacity="0.45"/>
  <text x="14" y="20" fill="#a07c3a" font-family="Georgia, serif" font-size="11">❦</text>
  <text x="586" y="20" text-anchor="end" fill="#a07c3a" font-family="Georgia, serif" font-size="11">❧</text>
  <text x="300" y="34" text-anchor="middle" fill="#f6d97c" font-family="Georgia, serif" font-size="13" font-weight="bold" letter-spacing="4">❦ 🎬 CINÉMATIQUE ❦</text>
  <circle cx="14" cy="46" r="2" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="0s" repeatCount="indefinite"/></circle>
  <circle cx="586" cy="46" r="2" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="0.6s" repeatCount="indefinite"/></circle>
  <circle cx="14" cy="10" r="2" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="1.2s" repeatCount="indefinite"/></circle>
  <circle cx="586" cy="10" r="2" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="1.8s" repeatCount="indefinite"/></circle>
</svg>

<p align="center" style="max-width:600px"><em>🎬 L'histoire de Mordrak et des ténèbres contée en travelling 3D.</em></p>
<p align="center" style="max-width:600px"><em>🎬 L'histoire de Mordrak et des ténèbres contée en travelling 3D.</em></p>

</td>
</tr>
</table>

---

## 🗡️ Ce qu'Eldoria a sous le capot

<!-- Animated cinebar — grand opening -->
<p align="center">
  <svg viewBox="0 0 940 110" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:940px">
    <defs>
      <linearGradient id="capGold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff4c2"/><stop offset="50%" stop-color="#f6d97c"/><stop offset="100%" stop-color="#a07c3a"/>
      </linearGradient>
      <linearGradient id="capDark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1a0e2e"/><stop offset="100%" stop-color="#3a2412"/>
      </linearGradient>
    </defs>
    <rect x="80" y="20" width="780" height="78" fill="url(#capDark)" stroke="url(#capGold)" stroke-width="2" rx="8"/>
    <rect x="86" y="26" width="768" height="66" fill="none" stroke="#f6d97c" stroke-width="0.5" rx="6" opacity="0.5"/>
    <text x="100" y="68" fill="#f6d97c" font-family="Georgia, serif" font-size="24" opacity="0.9">❦</text>
    <text x="840" y="68" fill="#f6d97c" font-family="Georgia, serif" font-size="24" opacity="0.9" text-anchor="end">❧</text>
    <text x="470" y="44" text-anchor="middle" fill="#f6d97c" font-family="Georgia, serif" font-size="11" letter-spacing="6" font-weight="bold">◈ LE GRAND GRIMOIRE D'ELDORIA ◈</text>
    <text x="470" y="76" text-anchor="middle" fill="#fff4c2" font-family="Georgia, serif" font-size="18" font-style="italic">
      Sous le capot — un royaume tissé de chiffres, de sorts et de cendres…
      <animate attributeName="opacity" values="0;1" dur="1.6s" fill="freeze"/>
    </text>
    <circle cx="100" cy="36" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" repeatCount="indefinite"/></circle>
    <circle cx="840" cy="36" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="0.6s" repeatCount="indefinite"/></circle>
    <circle cx="100" cy="106" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="1.2s" repeatCount="indefinite"/></circle>
    <circle cx="840" cy="106" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="1.8s" repeatCount="indefinite"/></circle>
  </svg>
</p>

<br/>

<!-- ============== THE GRAND SCEAU ============== : central rotating emblem with 6 radiating "rayons" -->
<p align="center">
  <a href="public/banner/sceau-capot.svg">
    <picture>
      <img src="public/banner/sceau-capot.svg" alt="Le Grand Sceau d'Eldoria — emblème cinématique du royaume" width="100%">
    </picture>
  </a>
</p>

<br/>

<!-- ============ LES CARRÉS DU SAVOIR ============ : 6 thematic knowledge tiles (extracted to standalone asset) ============ -->
<p align="center">
  <a href="public/banner/carres-savoir.svg">
    <img src="public/banner/carres-savoir.svg" alt="Les six piliers d'Eldoria — monde, arsenal, combat, butin, prouesse, scène" width="100%">
  </a>
</p>

<p align="center"><em>🗝 Chaque pilier rayonne vers le sceau central ; le héros, lui, rayonne vers chacun d'eux.</em></p>

---

## 🌍 Le monde d'Eldoria

<!-- Animated cinebar — cinematic intro -->
<p align="center">
  <svg viewBox="0 0 940 110" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:940px">
    <defs>
      <linearGradient id="wmGoldCine" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff4c2"/><stop offset="50%" stop-color="#f6d97c"/><stop offset="100%" stop-color="#a07c3a"/>
      </linearGradient>
      <linearGradient id="wmDarkCine" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1a0e2e"/><stop offset="100%" stop-color="#3a2412"/>
      </linearGradient>
    </defs>
    <rect x="80" y="20" width="780" height="78" fill="url(#wmDarkCine)" stroke="url(#wmGoldCine)" stroke-width="2" rx="8"/>
    <rect x="86" y="26" width="768" height="66" fill="none" stroke="#f6d97c" stroke-width="0.5" rx="6" opacity="0.5"/>
    <text x="100" y="68" fill="#f6d97c" font-family="Georgia, serif" font-size="24" opacity="0.9">❦</text>
    <text x="840" y="68" fill="#f6d97c" font-family="Georgia, serif" font-size="24" opacity="0.9" text-anchor="end">❧</text>
    <text x="470" y="44" text-anchor="middle" fill="#f6d97c" font-family="Georgia, serif" font-size="11" letter-spacing="6" font-weight="bold">◈ LA CARTE D'ELDORIA ◈</text>
    <text x="470" y="76" text-anchor="middle" fill="#fff4c2" font-family="Georgia, serif" font-size="18" font-style="italic">
      Deux cents unités de mystère — du foyer du joueur au trône de Mordrak…
      <animate attributeName="opacity" values="0;1" dur="1.6s" fill="freeze"/>
    </text>
    <circle cx="100" cy="36" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" repeatCount="indefinite"/></circle>
    <circle cx="840" cy="36" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="0.6s" repeatCount="indefinite"/></circle>
    <circle cx="100" cy="106" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="1.2s" repeatCount="indefinite"/></circle>
    <circle cx="840" cy="106" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="1.8s" repeatCount="indefinite"/></circle>
  </svg>
</p>

<br/>

<!-- ============ LA CARTE CINEMATIQUE ============ : top-down 1100x720 SVG with compass, paths, 7 medallions -->
<p align="center">
  <a href="public/banner/carte-monde.svg">
    <img src="public/banner/carte-monde.svg" alt="Carte du monde d'Eldoria — sept biomes rayonnant depuis le Village central" width="100%">
  </a>
</p>

<p align="center"><em>🗺️ Chaque biome rayonne depuis le <strong>Village central</strong>, foyer du porteur d'espoir ; plus l'aura s'assombrit, plus l'ennemi gagne en férocité. Le <strong>Donjon de Mordrak</strong>, au nord, attend le héros qui aura purifié les cinq territoires.</em></p>

---

## 📜 La Quête du Héros

<p align="center">
  <a href="public/banner/quest-chain.svg">
    <picture>
      <img src="public/banner/quest-chain.svg" alt="Chaîne des quêtes" width="100%">
    </picture>
  </a>
</p>

Le destin du porteur d'espoir est tracé en cinq chapitres — chacun se conclut par une récompense rare et la rencontre d'une nouvelle menace.

| # | Quête | Donneur | Objectif | Récompense |
|---|---|---|---|---|
| 1 | 🟢 **Chasse aux Slimes** | Aldric l'Ancien | Tuer 5 slimes | 50 XP, 30 po, Potion |
| 2 | 🟤 **La Menace Gobeline** | Brynn la Marchande | Tuer 6 gobelins | 120 XP, 80 po, Épée de Fer |
| 3 | 🐺 **Chasse aux Loups** | Saela la Chasseuse | Tuer 5 loups | 180 XP, 100 po, Cotte de Mailles |
| 4 | 💀 **Repos des Os** | Mireille la Sage | Tuer 6 squelettes | 300 XP, 200 po, Hache d'Acier |
| 5 | ⚔️ **Le Seigneur des Ombres** | Mireille la Sage | Vaincre Mordrak | 1000 XP, 1000 po, <strong>Tueuse de Dragon</strong> |

---

## ⚡ Les Compétences du Héros

<!-- Animated cinebar — cinematic intro -->
<p align="center">
  <svg viewBox="0 0 920 100" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:920px">
    <defs>
      <linearGradient id="skillCineGold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff4c2"/>
        <stop offset="50%" stop-color="#f6d97c"/>
        <stop offset="100%" stop-color="#a07c3a"/>
      </linearGradient>
      <linearGradient id="skillCineDark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1a0e2e"/>
        <stop offset="100%" stop-color="#3a2412"/>
      </linearGradient>
    </defs>
    <rect x="80" y="20" width="760" height="68" fill="url(#skillCineDark)" stroke="url(#skillCineGold)" stroke-width="2" rx="8"/>
    <rect x="86" y="26" width="748" height="56" fill="none" stroke="#f6d97c" stroke-width="0.5" rx="6" opacity="0.5"/>
    <text x="100" y="62" fill="#f6d97c" font-family="Georgia, serif" font-size="22" opacity="0.9">❦</text>
    <text x="820" y="62" fill="#f6d97c" font-family="Georgia, serif" font-size="22" opacity="0.9" text-anchor="end">❧</text>
    <text x="460" y="40" text-anchor="middle" fill="#f6d97c" font-family="Georgia, serif" font-size="11" letter-spacing="6" font-weight="bold">◆ CINQ ARTS ARCANIQUES ◆</text>
    <text x="460" y="66" text-anchor="middle" fill="#fff4c2" font-family="Georgia, serif" font-size="17" font-style="italic">
      Cinq sorts canalisent votre mana — débloqués au fil de votre ascension…
      <animate attributeName="opacity" values="0;1" dur="1.6s" fill="freeze"/>
    </text>
    <circle cx="100" cy="34" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" repeatCount="indefinite"/></circle>
    <circle cx="820" cy="34" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="0.6s" repeatCount="indefinite"/></circle>
    <circle cx="100" cy="86" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="1.2s" repeatCount="indefinite"/></circle>
    <circle cx="820" cy="86" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="1.8s" repeatCount="indefinite"/></circle>
  </svg>
</p>


<p align="center">
  <a href="public/banner/competences-hero.svg">
    <img src="public/banner/competences-hero.svg" alt="Cinq arts arcaniques — Boule de Feu, Soin Léger, Éclair, Bouclier, Givre" width="100%" style="max-width:780px">
  </a>
</p>

---

## 👹 Le bestiaire

<!-- Animated cinebar — cinematic intro -->
<p align="center">
  <svg viewBox="0 0 920 100" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:920px">
    <defs>
      <linearGradient id="bestCineGold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff4c2"/>
        <stop offset="50%" stop-color="#f6d97c"/>
        <stop offset="100%" stop-color="#a07c3a"/>
      </linearGradient>
      <linearGradient id="bestCineDark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1a0e2e"/>
        <stop offset="100%" stop-color="#3a2412"/>
      </linearGradient>
    </defs>
    <rect x="80" y="20" width="760" height="68" fill="url(#bestCineDark)" stroke="url(#bestCineGold)" stroke-width="2" rx="8"/>
    <rect x="86" y="26" width="748" height="56" fill="none" stroke="#f6d97c" stroke-width="0.5" rx="6" opacity="0.5"/>
    <text x="100" y="62" fill="#f6d97c" font-family="Georgia, serif" font-size="22" opacity="0.9">❦</text>
    <text x="820" y="62" fill="#f6d97c" font-family="Georgia, serif" font-size="22" opacity="0.9" text-anchor="end">❧</text>
    <text x="460" y="40" text-anchor="middle" fill="#f6d97c" font-family="Georgia, serif" font-size="11" letter-spacing="6" font-weight="bold">◆ BESTIAIRE D'ELDORIA ◆</text>
    <text x="460" y="66" text-anchor="middle" fill="#fff4c2" font-family="Georgia, serif" font-size="17" font-style="italic">
      Six créatures rampent dans les terres — et un seigneur les guide…
      <animate attributeName="opacity" values="0;1" dur="1.6s" fill="freeze"/>
    </text>
    <circle cx="100" cy="34" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" repeatCount="indefinite"/></circle>
    <circle cx="820" cy="34" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="0.6s" repeatCount="indefinite"/></circle>
    <circle cx="100" cy="86" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="1.2s" repeatCount="indefinite"/></circle>
    <circle cx="820" cy="86" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="1.8s" repeatCount="indefinite"/></circle>
  </svg>
</p>

<p align="center">
  <img src="public/banner/bestiaire-hero.svg" alt="Bestiaire d'Eldoria - six creatures dont le boss final Mordrak : Slime Vert, Pillard Gobelin, Loup Sinistre, Squelette, Ogre des Cavernes" width="100%" style="max-width:1300px">
</p>

---

## 👥 Les PNJ d'Eldoria

Quatre marchands, mentors et gardiens du village — chacun avec son dialogue, sa quête, ses marchandises :

| Portrait | Nom | Rôle | Particularité |
|:--:|---|---|---|
| 🎩 | **Aldric l'Ancien du Village** | Mentor | Offre la première quête — Chasse aux Slimes |
| 🛒 | **Brynn la Marchande** | Commerçante | Boutique d'armes, armures & potions + Quête Gobelins |
| 🏹 | **Saela la Chasseuse** | Éclaireuse | Guide des Bois Sinistres + Quête Loups |
| 🔮 | **Mireille la Sage** | Prophétesse | Révèle l'origine de Mordrak + Quêtes Squelettes & Boss |

---

## 🎮 Les commandes du héros

<p align="center">
  <svg viewBox="0 0 900 360" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:900px">
    <defs>
      <linearGradient id="kbd" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff4c2"/><stop offset="100%" stop-color="#a07c3a"/></linearGradient>
    </defs>
    <rect x="10" y="10" width="880" height="340" rx="14" fill="#3a2412" stroke="#f6d97c" stroke-width="2"/>
    <rect x="14" y="14" width="872" height="332" rx="11" fill="none" stroke="#f6d97c" stroke-width="0.6" opacity="0.6"/>

    <text x="450" y="40" text-anchor="middle" font-family="Georgia, serif" font-size="20" font-weight="bold"
          fill="#f6d97c" letter-spacing="3">◈  CONTRÔLES DU HÉROS  ◈</text>

    <!-- Movement row -->
    <g transform="translate(40 80)">
      <rect x="0"   y="0" width="60" height="44" rx="6" fill="url(#kbd)" stroke="#fff4c2" stroke-width="0.6"/>
      <text x="30"  y="30" text-anchor="middle" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#3a2412">W</text>
      <rect x="65"  y="0" width="60" height="44" rx="6" fill="url(#kbd)" stroke="#fff4c2" stroke-width="0.6"/>
      <text x="95"  y="30" text-anchor="middle" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#3a2412">A</text>
      <rect x="130" y="0" width="60" height="44" rx="6" fill="url(#kbd)" stroke="#fff4c2" stroke-width="0.6"/>
      <text x="160" y="30" text-anchor="middle" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#3a2412">S</text>
      <rect x="195" y="0" width="60" height="44" rx="6" fill="url(#kbd)" stroke="#fff4c2" stroke-width="0.6"/>
      <text x="225" y="30" text-anchor="middle" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#3a2412">D</text>
      <text x="320" y="30" font-family="Georgia, serif" font-size="14" fill="#ead7a8" font-style="italic">Se déplacer</text>
    </g>

    <!-- Run -->
    <g transform="translate(40 140)">
      <rect x="0" y="0" width="120" height="44" rx="6" fill="url(#kbd)" stroke="#fff4c2" stroke-width="0.6"/>
      <text x="60" y="30" text-anchor="middle" font-family="Georgia, serif" font-size="14" font-weight="bold" fill="#3a2412">Maj</text>
      <text x="180" y="30" font-family="Georgia, serif" font-size="14" fill="#ead7a8" font-style="italic">Courir</text>
    </g>

    <!-- Attack -->
    <g transform="translate(40 200)">
      <rect x="0" y="0" width="160" height="44" rx="6" fill="#c2563a" stroke="#fff4c2" stroke-width="0.6"/>
      <text x="80" y="30" text-anchor="middle" font-family="Georgia, serif" font-size="14" font-weight="bold" fill="#fff4c2">Espace / J</text>
      <text x="220" y="30" font-family="Georgia, serif" font-size="14" fill="#ead7a8" font-style="italic">Attaquer avec votre arme</text>
    </g>

    <!-- Camera -->
    <g transform="translate(40 260)">
      <rect x="0" y="0" width="60" height="44" rx="6" fill="url(#kbd)" stroke="#fff4c2" stroke-width="0.6"/>
      <text x="30" y="30" text-anchor="middle" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#3a2412">[</text>
      <rect x="65" y="0" width="60" height="44" rx="6" fill="url(#kbd)" stroke="#fff4c2" stroke-width="0.6"/>
      <text x="95" y="30" text-anchor="middle" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#3a2412">]</text>
      <text x="180" y="30" font-family="Georgia, serif" font-size="14" fill="#ead7a8" font-style="italic">Tourner la caméra au clavier</text>
    </g>

    <!-- Right column -->
    <g transform="translate(520 80)">
      <text x="0" y="-4" font-family="Georgia, serif" font-size="11" fill="#f6d97c" letter-spacing="4">◈ INTERACTIONS</text>
      <rect x="0"   y="8"  width="50" height="34" rx="5" fill="#3a7a3a" stroke="#f6d97c" stroke-width="0.5"/>
      <text x="25"  y="30" text-anchor="middle" font-family="Georgia, serif" font-size="13" font-weight="bold" fill="#fff4c2">E</text>
      <text x="68" y="30" font-family="Georgia, serif" font-size="13" fill="#ead7a8">Parler à un PNJ / ouvrir</text>

      <rect x="0"   y="50" width="50" height="34" rx="5" fill="url(#kbd)" stroke="#fff4c2" stroke-width="0.6"/>
      <text x="25"  y="72" text-anchor="middle" font-family="Georgia, serif" font-size="13" font-weight="bold" fill="#3a2412">I</text>
      <text x="68" y="72" font-family="Georgia, serif" font-size="13" fill="#ead7a8">Inventaire (sac)</text>

      <rect x="0"   y="92" width="50" height="34" rx="5" fill="url(#kbd)" stroke="#fff4c2" stroke-width="0.6"/>
      <text x="25"  y="114" text-anchor="middle" font-family="Georgia, serif" font-size="13" font-weight="bold" fill="#3a2412">Q</text>
      <text x="68" y="114" font-family="Georgia, serif" font-size="13" fill="#ead7a8">Journal de quêtes</text>

      <rect x="0"   y="134" width="50" height="34" rx="5" fill="url(#kbd)" stroke="#fff4c2" stroke-width="0.6"/>
      <text x="25"  y="156" text-anchor="middle" font-family="Georgia, serif" font-size="13" font-weight="bold" fill="#3a2412">C</text>
      <text x="68" y="156" font-family="Georgia, serif" font-size="13" fill="#ead7a8">Fiche du héros</text>

      <rect x="0"   y="176" width="50" height="34" rx="5" fill="url(#kbd)" stroke="#fff4c2" stroke-width="0.6"/>
      <text x="25"  y="198" text-anchor="middle" font-family="Georgia, serif" font-size="13" font-weight="bold" fill="#3a2412">H</text>
      <text x="68" y="198" font-family="Georgia, serif" font-size="13" fill="#ead7a8">Aide</text>
    </g>

    <!-- Hotbar -->
    <g transform="translate(520 270)">
      <text x="0" y="-4" font-family="Georgia, serif" font-size="11" fill="#f6d97c" letter-spacing="4">◈ BARRE RAPIDE</text>
      <rect x="0"   y="8" width="44" height="44" rx="6" fill="url(#kbd)" stroke="#fff4c2" stroke-width="0.6"/>
      <text x="22" y="36" text-anchor="middle" font-family="Georgia, serif" font-size="14" font-weight="bold" fill="#3a2412">1</text>
      <text x="34" y="22" text-anchor="middle" font-family="Georgia, serif" font-size="9" fill="#c2563a">🧪</text>
      <rect x="55"  y="8" width="44" height="44" rx="6" fill="url(#kbd)" stroke="#fff4c2" stroke-width="0.6"/>
      <text x="77" y="36" text-anchor="middle" font-family="Georgia, serif" font-size="14" font-weight="bold" fill="#3a2412">2</text>
      <text x="89" y="22" text-anchor="middle" font-family="Georgia, serif" font-size="9" fill="#3a7aa0">🔵</text>
      <rect x="110" y="8" width="44" height="44" rx="6" fill="url(#kbd)" stroke="#fff4c2" stroke-width="0.6"/>
      <text x="132" y="36" text-anchor="middle" font-family="Georgia, serif" font-size="14" font-weight="bold" fill="#3a2412">3</text>
      <text x="144" y="22" text-anchor="middle" font-family="Georgia, serif" font-size="9" fill="#a13a2a">🍷</text>
      <text x="170" y="36" font-family="Georgia, serif" font-size="12" fill="#ead7a8" font-style="italic">Potions de la barre rapide</text>
    </g>

    <!-- Animated "key press" indicators -->
    <circle cx="320" cy="80" r="3" fill="#f6d97c">
      <animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="320" cy="140" r="3" fill="#f6d97c">
      <animate attributeName="opacity" values="0;1;0" dur="2.5s" begin="0.4s" repeatCount="indefinite"/>
    </circle>
    <circle cx="320" cy="200" r="3" fill="#c2563a">
      <animate attributeName="opacity" values="0;1;0" dur="2.5s" begin="0.8s" repeatCount="indefinite"/>
    </circle>
  </svg>
</p>

---

## 💎 Fonctionnalités

<!-- Animated cinebar — features intro -->
<p align="center">
<svg viewBox="0 0 920 80" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:920px">
  <defs>
    <linearGradient id="featGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff4c2"/><stop offset="50%" stop-color="#f6d97c"/><stop offset="100%" stop-color="#a07c3a"/></linearGradient>
    <linearGradient id="featDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a0e2e"/><stop offset="100%" stop-color="#3a2412"/></linearGradient>
  </defs>
  <rect x="80" y="10" width="760" height="60" fill="url(#featDark)" stroke="url(#featGold)" stroke-width="2" rx="8"/>
  <rect x="86" y="16" width="748" height="48" fill="none" stroke="#f6d97c" stroke-width="0.5" rx="6" opacity="0.5"/>
  <text x="100" y="48" fill="#f6d97c" font-family="Georgia, serif" font-size="20" opacity="0.9">❦</text>
  <text x="820" y="48" fill="#f6d97c" font-family="Georgia, serif" font-size="20" opacity="0.9" text-anchor="end">❧</text>
  <text x="460" y="30" text-anchor="middle" fill="#f6d97c" font-family="Georgia, serif" font-size="11" letter-spacing="6" font-weight="bold">◆ TREIZE PILIERS ◆</text>
  <text x="460" y="54" text-anchor="middle" fill="#fff4c2" font-family="Georgia, serif" font-size="16" font-style="italic">
    Chaque facette du royaume tient en une carte…
    <animate attributeName="opacity" values="0;1" dur="1.6s" fill="freeze"/>
  </text>
  <circle cx="100" cy="22" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" repeatCount="indefinite"/></circle>
  <circle cx="820" cy="22" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="0.6s" repeatCount="indefinite"/></circle>
  <circle cx="100" cy="74" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="1.2s" repeatCount="indefinite"/></circle>
  <circle cx="820" cy="74" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin="1.8s" repeatCount="indefinite"/></circle>
</svg>
</p>

<table align="center" cellpadding="0" cellspacing="0">
<tr>
<!-- Row 1 -->
<td align="center" width="20%" valign="top">
<svg viewBox="0 0 200 168" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:200px">
  <defs><linearGradient id="cp1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff4c2"/><stop offset="100%" stop-color="#d8be83"/></linearGradient></defs>
  <rect x="4" y="4" width="192" height="160" rx="8" fill="url(#cp1)" stroke="#a07c3a" stroke-width="1.5"><animate attributeName="stroke-opacity" values="0.55;1;0.55" dur="3.6s" begin="0s" repeatCount="indefinite"/></rect>
  <rect x="9" y="9" width="182" height="150" rx="6" fill="none" stroke="#a07c3a" stroke-width="0.4" opacity="0.4"/>
  <text x="100" y="56" font-size="36" text-anchor="middle">🌍</text>
  <rect x="14" y="116" width="172" height="22" fill="#3a2412" stroke="#f6d97c" stroke-width="1.5" rx="3"><animate attributeName="fill-opacity" values="0;1" dur="1.6s" begin="0.1s" fill="freeze"/></rect>
  <text x="100" y="131" font-size="11" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" fill="#f6d97c" letter-spacing="2">❦ MONDE 3D ❦</text>
  <text x="100" y="151" font-size="9" text-anchor="middle" font-family="Georgia, serif" fill="#5a3a1f" font-style="italic">200×200, cycle 180 s, brouillard</text>
</svg>
</td>
<td align="center" width="20%" valign="top">
<svg viewBox="0 0 200 168" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:200px">
  <defs><linearGradient id="cp2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff4c2"/><stop offset="100%" stop-color="#d8be83"/></linearGradient></defs>
  <rect x="4" y="4" width="192" height="160" rx="8" fill="url(#cp2)" stroke="#a07c3a" stroke-width="1.5"><animate attributeName="stroke-opacity" values="0.55;1;0.55" dur="3.6s" begin="0.2s" repeatCount="indefinite"/></rect>
  <rect x="9" y="9" width="182" height="150" rx="6" fill="none" stroke="#a07c3a" stroke-width="0.4" opacity="0.4"/>
  <text x="100" y="58" font-size="38" text-anchor="middle">⚔️</text>
  <rect x="14" y="116" width="172" height="22" fill="#3a2412" stroke="#f6d97c" stroke-width="1.5" rx="3"><animate attributeName="fill-opacity" values="0;1" dur="1.6s" begin="0.2s" fill="freeze"/></rect>
  <text x="100" y="131" font-size="11" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" fill="#f6d97c" letter-spacing="2">❦ COMBAT ❦</text>
  <text x="100" y="151" font-size="9" text-anchor="middle" font-family="Georgia, serif" fill="#5a3a1f" font-style="italic">arc, combo, i-frames, particules</text>
</svg>
</td>
<td align="center" width="20%" valign="top">
<svg viewBox="0 0 200 168" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:200px">
  <defs><linearGradient id="cp3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff4c2"/><stop offset="100%" stop-color="#d8be83"/></linearGradient></defs>
  <rect x="4" y="4" width="192" height="160" rx="8" fill="url(#cp3)" stroke="#a07c3a" stroke-width="1.5"><animate attributeName="stroke-opacity" values="0.55;1;0.55" dur="3.6s" begin="0.4s" repeatCount="indefinite"/></rect>
  <rect x="9" y="9" width="182" height="150" rx="6" fill="none" stroke="#a07c3a" stroke-width="0.4" opacity="0.4"/>
  <text x="100" y="58" font-size="38" text-anchor="middle">👹</text>
  <rect x="14" y="116" width="172" height="22" fill="#3a2412" stroke="#f6d97c" stroke-width="1.5" rx="3"><animate attributeName="fill-opacity" values="0;1" dur="1.6s" begin="0.3s" fill="freeze"/></rect>
  <text x="100" y="131" font-size="11" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" fill="#f6d97c" letter-spacing="2">❦ BESTIAIRE ❦</text>
  <text x="100" y="151" font-size="9" text-anchor="middle" font-family="Georgia, serif" fill="#5a3a1f" font-style="italic">6 + 1 boss, IA, respawn 30 s</text>
</svg>
</td>
<td align="center" width="20%" valign="top">
<svg viewBox="0 0 200 168" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:200px">
  <defs><linearGradient id="cp4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff4c2"/><stop offset="100%" stop-color="#d8be83"/></linearGradient></defs>
  <rect x="4" y="4" width="192" height="160" rx="8" fill="url(#cp4)" stroke="#a07c3a" stroke-width="1.5"><animate attributeName="stroke-opacity" values="0.55;1;0.55" dur="3.6s" begin="0.6s" repeatCount="indefinite"/></rect>
  <rect x="9" y="9" width="182" height="150" rx="6" fill="none" stroke="#a07c3a" stroke-width="0.4" opacity="0.4"/>
  <text x="100" y="58" font-size="38" text-anchor="middle">🎭</text>
  <rect x="14" y="116" width="172" height="22" fill="#3a2412" stroke="#f6d97c" stroke-width="1.5" rx="3"><animate attributeName="fill-opacity" values="0;1" dur="1.6s" begin="0.4s" fill="freeze"/></rect>
  <text x="100" y="131" font-size="11" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" fill="#f6d97c" letter-spacing="2">❦ PNJ ❦</text>
  <text x="100" y="151" font-size="9" text-anchor="middle" font-family="Georgia, serif" fill="#5a3a1f" font-style="italic">4 mentors, dialogues, boutique</text>
</svg>
</td>
<td align="center" width="20%" valign="top">
<svg viewBox="0 0 200 168" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:200px">
  <defs><linearGradient id="cp5" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff4c2"/><stop offset="100%" stop-color="#d8be83"/></linearGradient></defs>
  <rect x="4" y="4" width="192" height="160" rx="8" fill="url(#cp5)" stroke="#a07c3a" stroke-width="1.5"><animate attributeName="stroke-opacity" values="0.55;1;0.55" dur="3.6s" begin="0.8s" repeatCount="indefinite"/></rect>
  <rect x="9" y="9" width="182" height="150" rx="6" fill="none" stroke="#a07c3a" stroke-width="0.4" opacity="0.4"/>
  <text x="100" y="58" font-size="38" text-anchor="middle">📜</text>
  <rect x="14" y="116" width="172" height="22" fill="#3a2412" stroke="#f6d97c" stroke-width="1.5" rx="3"><animate attributeName="fill-opacity" values="0;1" dur="1.6s" begin="0.5s" fill="freeze"/></rect>
  <text x="100" y="131" font-size="11" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" fill="#f6d97c" letter-spacing="2">❦ QUÊTES ❦</text>
  <text x="100" y="151" font-size="9" text-anchor="middle" font-family="Georgia, serif" fill="#5a3a1f" font-style="italic">5 chapitres + 7 coffres</text>
</svg>
</td>
</tr>
<tr>
<!-- Row 2 -->
<td align="center" valign="top">
<svg viewBox="0 0 200 168" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:200px">
  <defs><linearGradient id="cp6" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff4c2"/><stop offset="100%" stop-color="#d8be83"/></linearGradient></defs>
  <rect x="4" y="4" width="192" height="160" rx="8" fill="url(#cp6)" stroke="#a07c3a" stroke-width="1.5"><animate attributeName="stroke-opacity" values="0.55;1;0.55" dur="3.6s" begin="1.0s" repeatCount="indefinite"/></rect>
  <rect x="9" y="9" width="182" height="150" rx="6" fill="none" stroke="#a07c3a" stroke-width="0.4" opacity="0.4"/>
  <text x="100" y="58" font-size="38" text-anchor="middle">🎒</text>
  <rect x="14" y="116" width="172" height="22" fill="#3a2412" stroke="#f6d97c" stroke-width="1.5" rx="3"><animate attributeName="fill-opacity" values="0;1" dur="1.6s" begin="0.6s" fill="freeze"/></rect>
  <text x="100" y="131" font-size="11" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" fill="#f6d97c" letter-spacing="2">❦ INVENTAIRE ❦</text>
  <text x="100" y="151" font-size="9" text-anchor="middle" font-family="Georgia, serif" fill="#5a3a1f" font-style="italic">16+ objets, 5 raretés</text>
</svg>
</td>
<td align="center" valign="top">
<svg viewBox="0 0 200 168" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:200px">
  <defs><linearGradient id="cp7" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff4c2"/><stop offset="100%" stop-color="#d8be83"/></linearGradient></defs>
  <rect x="4" y="4" width="192" height="160" rx="8" fill="url(#cp7)" stroke="#a07c3a" stroke-width="1.5"><animate attributeName="stroke-opacity" values="0.55;1;0.55" dur="3.6s" begin="1.2s" repeatCount="indefinite"/></rect>
  <rect x="9" y="9" width="182" height="150" rx="6" fill="none" stroke="#a07c3a" stroke-width="0.4" opacity="0.4"/>
  <text x="100" y="58" font-size="38" text-anchor="middle">⚒️</text>
  <rect x="14" y="116" width="172" height="22" fill="#3a2412" stroke="#f6d97c" stroke-width="1.5" rx="3"><animate attributeName="fill-opacity" values="0;1" dur="1.6s" begin="0.7s" fill="freeze"/></rect>
  <text x="100" y="131" font-size="11" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" fill="#f6d97c" letter-spacing="2">❦ CRAFTING ❦</text>
  <text x="100" y="151" font-size="9" text-anchor="middle" font-family="Georgia, serif" fill="#5a3a1f" font-style="italic">7 recettes armes/armures/potions</text>
</svg>
</td>
<td align="center" valign="top">
<svg viewBox="0 0 200 168" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:200px">
  <defs><linearGradient id="cp8" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff4c2"/><stop offset="100%" stop-color="#d8be83"/></linearGradient></defs>
  <rect x="4" y="4" width="192" height="160" rx="8" fill="url(#cp8)" stroke="#a07c3a" stroke-width="1.5"><animate attributeName="stroke-opacity" values="0.55;1;0.55" dur="3.6s" begin="1.4s" repeatCount="indefinite"/></rect>
  <rect x="9" y="9" width="182" height="150" rx="6" fill="none" stroke="#a07c3a" stroke-width="0.4" opacity="0.4"/>
  <text x="100" y="58" font-size="38" text-anchor="middle">🏪</text>
  <rect x="14" y="116" width="172" height="22" fill="#3a2412" stroke="#f6d97c" stroke-width="1.5" rx="3"><animate attributeName="fill-opacity" values="0;1" dur="1.6s" begin="0.8s" fill="freeze"/></rect>
  <text x="100" y="131" font-size="11" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" fill="#f6d97c" letter-spacing="2">❦ BOUTIQUE ❦</text>
  <text x="100" y="151" font-size="9" text-anchor="middle" font-family="Georgia, serif" fill="#5a3a1f" font-style="italic">achat/vente, revente 50 % valeur</text>
</svg>
</td>
<td align="center" valign="top">
<svg viewBox="0 0 200 168" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:200px">
  <defs>
    <linearGradient id="cp9" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff4c2"/><stop offset="100%" stop-color="#d8be83"/></linearGradient>
    <radialGradient id="mp9" cx="0.5" cy="0.5" r="0.5"><stop offset="0%" stop-color="#ff5722"/><stop offset="100%" stop-color="#7a1c0a" stop-opacity="0"/></radialGradient>
  </defs>
  <rect x="4" y="4" width="192" height="160" rx="8" fill="url(#cp9)" stroke="#a07c3a" stroke-width="1.5"><animate attributeName="stroke-opacity" values="0.55;1;0.55" dur="3.6s" begin="1.6s" repeatCount="indefinite"/></rect>
  <rect x="9" y="9" width="182" height="150" rx="6" fill="none" stroke="#a07c3a" stroke-width="0.4" opacity="0.4"/>
  <circle cx="100" cy="62" r="34" fill="url(#mp9)" opacity="0.8"><animate attributeName="r" values="28;36;28" dur="2.4s" repeatCount="indefinite"/></circle>
  <text x="100" y="72" font-size="32" text-anchor="middle">🔮</text>
  <rect x="14" y="116" width="172" height="22" fill="#3a2412" stroke="#f6d97c" stroke-width="1.5" rx="3"><animate attributeName="fill-opacity" values="0;1" dur="1.6s" begin="0.9s" fill="freeze"/></rect>
  <text x="100" y="131" font-size="11" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" fill="#f6d97c" letter-spacing="2">❦ MAGIE ❦</text>
  <text x="100" y="151" font-size="9" text-anchor="middle" font-family="Georgia, serif" fill="#5a3a1f" font-style="italic">5 sorts, mana, ciblage</text>
</svg>
</td>
<td align="center" valign="top">
<svg viewBox="0 0 200 168" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:200px">
  <defs><linearGradient id="cp10" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff4c2"/><stop offset="100%" stop-color="#d8be83"/></linearGradient></defs>
  <rect x="4" y="4" width="192" height="160" rx="8" fill="url(#cp10)" stroke="#a07c3a" stroke-width="1.5"><animate attributeName="stroke-opacity" values="0.55;1;0.55" dur="3.6s" begin="1.8s" repeatCount="indefinite"/></rect>
  <rect x="9" y="9" width="182" height="150" rx="6" fill="none" stroke="#a07c3a" stroke-width="0.4" opacity="0.4"/>
  <text x="100" y="58" font-size="34" text-anchor="middle">📈</text>
  <rect x="14" y="116" width="172" height="22" fill="#3a2412" stroke="#f6d97c" stroke-width="1.5" rx="3"><animate attributeName="fill-opacity" values="0;1" dur="1.6s" begin="1.0s" fill="freeze"/></rect>
  <text x="100" y="131" font-size="11" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" fill="#f6d97c" letter-spacing="2">❦ PROGRESSION ❦</text>
  <text x="100" y="151" font-size="9" text-anchor="middle" font-family="Georgia, serif" fill="#5a3a1f" font-style="italic">XP level^1.6, 3 pts/niveau</text>
</svg>
</td>
</tr>
<tr>
<!-- Row 3 -->
<td align="center" valign="top">
<svg viewBox="0 0 200 168" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:200px">
  <defs><linearGradient id="cp11" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff4c2"/><stop offset="100%" stop-color="#d8be83"/></linearGradient></defs>
  <rect x="4" y="4" width="192" height="160" rx="8" fill="url(#cp11)" stroke="#a07c3a" stroke-width="1.5"><animate attributeName="stroke-opacity" values="0.55;1;0.55" dur="3.6s" begin="2.0s" repeatCount="indefinite"/></rect>
  <rect x="9" y="9" width="182" height="150" rx="6" fill="none" stroke="#a07c3a" stroke-width="0.4" opacity="0.4"/>
  <text x="100" y="58" font-size="38" text-anchor="middle">💾</text>
  <rect x="14" y="116" width="172" height="22" fill="#3a2412" stroke="#f6d97c" stroke-width="1.5" rx="3"><animate attributeName="fill-opacity" values="0;1" dur="1.6s" begin="1.1s" fill="freeze"/></rect>
  <text x="100" y="131" font-size="11" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" fill="#f6d97c" letter-spacing="2">❦ SAUVEGARDE ❦</text>
  <text x="100" y="151" font-size="9" text-anchor="middle" font-family="Georgia, serif" fill="#5a3a1f" font-style="italic">localStorage + Prisma/SQLite</text>
</svg>
</td>
<td align="center" valign="top">
<svg viewBox="0 0 200 168" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:200px">
  <defs><linearGradient id="cp12" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff4c2"/><stop offset="100%" stop-color="#d8be83"/></linearGradient></defs>
  <rect x="4" y="4" width="192" height="160" rx="8" fill="url(#cp12)" stroke="#a07c3a" stroke-width="1.5"><animate attributeName="stroke-opacity" values="0.55;1;0.55" dur="3.6s" begin="2.2s" repeatCount="indefinite"/></rect>
  <rect x="9" y="9" width="182" height="150" rx="6" fill="none" stroke="#a07c3a" stroke-width="0.4" opacity="0.4"/>
  <text x="100" y="58" font-size="36" text-anchor="middle">🖥️</text>
  <rect x="14" y="116" width="172" height="22" fill="#3a2412" stroke="#f6d97c" stroke-width="1.5" rx="3"><animate attributeName="fill-opacity" values="0;1" dur="1.6s" begin="1.2s" fill="freeze"/></rect>
  <text x="100" y="131" font-size="11" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" fill="#f6d97c" letter-spacing="2">❦ DESKTOP ❦</text>
  <text x="100" y="151" font-size="9" text-anchor="middle" font-family="Georgia, serif" fill="#5a3a1f" font-style="italic">Web + Electron Win/Mac/Linux</text>
</svg>
</td>
<td align="center" valign="top">
<svg viewBox="0 0 200 168" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:200px">
  <defs>
    <linearGradient id="cp13" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff4c2"/><stop offset="100%" stop-color="#d8be83"/></linearGradient>
    <radialGradient id="gp13" cx="0.5" cy="0.5" r="0.5"><stop offset="0%" stop-color="#fff4c2" stop-opacity="0.7"/><stop offset="100%" stop-color="#fff4c2" stop-opacity="0"/></radialGradient>
  </defs>
  <rect x="4" y="4" width="192" height="160" rx="8" fill="url(#cp13)" stroke="#a07c3a" stroke-width="1.5"><animate attributeName="stroke-opacity" values="0.55;1;0.55" dur="3.6s" begin="2.4s" repeatCount="indefinite"/></rect>
  <rect x="9" y="9" width="182" height="150" rx="6" fill="none" stroke="#a07c3a" stroke-width="0.4" opacity="0.4"/>
  <circle cx="100" cy="62" r="38" fill="url(#gp13)"><animate attributeName="r" values="34;42;34" dur="3s" repeatCount="indefinite"/></circle>
  <text x="100" y="72" font-size="32" text-anchor="middle">🎨</text>
  <rect x="14" y="116" width="172" height="22" fill="#3a2412" stroke="#f6d97c" stroke-width="1.5" rx="3"><animate attributeName="fill-opacity" values="0;1" dur="1.6s" begin="1.3s" fill="freeze"/></rect>
  <text x="100" y="131" font-size="11" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" fill="#f6d97c" letter-spacing="2">❦ DA PARCHEMIN ❦</text>
  <text x="100" y="151" font-size="9" text-anchor="middle" font-family="Georgia, serif" fill="#5a3a1f" font-style="italic">Cinzel+Garamond, Bloom, GodRays</text>
</svg>
</td>
<td align="center" valign="top">
<svg viewBox="0 0 200 168" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:200px">
  <defs>
    <linearGradient id="cpE" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a0838"/><stop offset="100%" stop-color="#3a2412"/></linearGradient>
    <radialGradient id="gaE" cx="0.5" cy="0.5" r="0.5"><stop offset="0%" stop-color="#fff4c2" stop-opacity="0.5"/><stop offset="100%" stop-color="#fff4c2" stop-opacity="0"/></radialGradient>
  </defs>
  <rect x="4" y="4" width="192" height="160" rx="8" fill="url(#cpE)" stroke="#f6d97c" stroke-width="1.5"><animate attributeName="stroke-opacity" values="0.55;1;0.55" dur="3.6s" begin="2.6s" repeatCount="indefinite"/></rect>
  <rect x="9" y="9" width="182" height="150" rx="6" fill="none" stroke="#f6d97c" stroke-width="0.4" opacity="0.4"/>
  <circle cx="100" cy="62" r="38" fill="url(#gaE)"><animate attributeName="r" values="34;42;34" dur="3.6s" repeatCount="indefinite"/></circle>
  <text x="100" y="50" text-anchor="middle" fill="#f6d97c" font-family="Georgia, serif" font-size="9" letter-spacing="2" font-weight="bold">◆ EN UN COUP D'ŒIL ◆</text>
  <text x="100" y="72" text-anchor="middle" fill="#fff4c2" font-family="Georgia, serif" font-size="14" font-style="italic">13 piliers</text>
  <text x="100" y="90" text-anchor="middle" fill="#fff4c2" font-family="Georgia, serif" font-size="11">1 cathédrale</text>
  <rect x="14" y="116" width="172" height="22" fill="#3a2412" stroke="#f6d97c" stroke-width="1.5" rx="3"><animate attributeName="fill-opacity" values="0;1" dur="1.6s" begin="1.4s" fill="freeze"/></rect>
  <text x="100" y="131" font-size="10" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" fill="#f6d97c" letter-spacing="2">❦ COHÉRENT ❦</text>
  <text x="100" y="151" font-size="9" text-anchor="middle" font-family="Georgia, serif" fill="#a07c3a" font-style="italic">De A à Z · 1 seul dépôt</text>
</svg>
</td>
<td align="center" valign="top">
<svg viewBox="0 0 200 168" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:200px">
  <defs>
    <linearGradient id="cpF" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a0838"/><stop offset="100%" stop-color="#3a2412"/></linearGradient>
    <radialGradient id="gaF" cx="0.5" cy="0.5" r="0.5"><stop offset="0%" stop-color="#fff4c2" stop-opacity="0.5"/><stop offset="100%" stop-color="#fff4c2" stop-opacity="0"/></radialGradient>
  </defs>
  <rect x="4" y="4" width="192" height="160" rx="8" fill="url(#cpF)" stroke="#f6d97c" stroke-width="1.5"><animate attributeName="stroke-opacity" values="0.55;1;0.55" dur="3.6s" begin="2.8s" repeatCount="indefinite"/></rect>
  <rect x="9" y="9" width="182" height="150" rx="6" fill="none" stroke="#f6d97c" stroke-width="0.4" opacity="0.4"/>
  <circle cx="100" cy="62" r="40" fill="url(#gaF)"><animate attributeName="r" values="36;44;36" dur="3.6s" begin="0.6s" repeatCount="indefinite"/></circle>
  <text x="100" y="50" text-anchor="middle" fill="#f6d97c" font-family="Georgia, serif" font-size="9" letter-spacing="2" font-weight="bold">◆ UN SEUL ◆</text>
  <text x="100" y="72" text-anchor="middle" fill="#fff4c2" font-family="Georgia, serif" font-size="14" font-style="italic">dépôt</text>
  <text x="100" y="90" text-anchor="middle" fill="#fff4c2" font-family="Georgia, serif" font-size="11">architectural</text>
  <rect x="14" y="116" width="172" height="22" fill="#3a2412" stroke="#f6d97c" stroke-width="1.5" rx="3"><animate attributeName="fill-opacity" values="0;1" dur="1.6s" begin="1.6s" fill="freeze"/></rect>
  <text x="100" y="131" font-size="10" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" fill="#f6d97c" letter-spacing="2">❦ AUTONOME ❦</text>
  <text x="100" y="151" font-size="9" text-anchor="middle" font-family="Georgia, serif" fill="#a07c3a" font-style="italic">Web + Desktop · 1 commande</text>
</svg>
</td>
</tr>
</table>

---

## 🚀 Démarrage rapide

### Prérequis

- **[Bun](https://bun.sh/) ≥ 1.0** (gestionnaire de paquets et runtime)
- **[Node.js](https://nodejs.org/) ≥ 18** (requis par Next.js et Prisma)

### Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/DmzGamingYT/Eldoria.git
cd Eldoria

# 2. Installer les dépendances
bun install

# 3. Initialiser la base de données (sauvegardes)
bun run db:generate
bun run db:push

# 4. Lancer le serveur de développement
bun run dev
```

Ouvrez **http://localhost:3000** dans votre navigateur puis cliquez sur
<kbd>Commencer une nouvelle quête</kbd>. Bonne aventure !

### Build desktop (optionnel)

```bash
bun run electron:dev          # Next.js + Electron en parallèle
bun run electron:build        # Build pour la plateforme courante
bun run electron:build:mac    # macOS (DMG + ZIP)
bun run electron:build:win    # Windows (NSIS + portable)
bun run electron:build:linux  # Linux (AppImage + deb + rpm)
```

### Récupérer des captures d'écran automatiquement

```bash
bun run screenshots
# → génère public/screenshots/{01..04}*.png via Playwright
```

### Générer le trailer GIF cinématique

```bash
bun run trailer
# → capture 10 s de gameplay dans public/illustrations/trailer.gif (12 fps)
# + version WebM 1080p dans public/illustrations/trailer.webm
#
# Prérequis supplémentaires :
#   • ffmpeg ≥ 5.0 installé (brew install ffmpeg / apt install ffmpeg)
```
---

## 🏗️ Architecture technique

<p align="center">
<svg viewBox="0 0 1100 660" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:1100px">
  <defs>
    <linearGradient id="bgA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a0838"/><stop offset="100%" stop-color="#3a2412"/></linearGradient>
    <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff4c2"/><stop offset="50%" stop-color="#f6d97c"/><stop offset="100%" stop-color="#a07c3a"/></linearGradient>
    <linearGradient id="pa" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff4c2"/><stop offset="100%" stop-color="#d8be83"/></linearGradient>
    <radialGradient id="ha" cx="0.5" cy="0.5" r="0.5"><stop offset="0%" stop-color="#fff4c2" stop-opacity="0.55"/><stop offset="100%" stop-color="#fff4c2" stop-opacity="0"/></radialGradient>
    <marker id="aH" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto"><polygon points="0,0 10,5 0,10" fill="#f6d97c"/></marker>
  </defs>
  <rect width="1100" height="660" fill="url(#bgA)" rx="8"/>
  <rect x="6" y="6" width="1088" height="648" fill="none" stroke="url(#ga)" stroke-width="2" opacity="0.6" rx="8"/>
  <rect x="14" y="14" width="1072" height="632" fill="none" stroke="#f6d97c" stroke-width="0.5" opacity="0.4" rx="6"/>
  <g transform="translate(550 30)" text-anchor="middle">
    <ellipse cx="0" cy="8" rx="340" ry="20" fill="url(#ha)"/>
    <text font-family="Georgia, serif" font-size="13" fill="#f6d97c" letter-spacing="6" font-weight="bold">◈ ARCHITECTURE EN COUCHES ◈</text>
    <text y="20" font-family="Georgia, serif" font-size="11" fill="#a07c3a" font-style="italic">Du joueur vers la persistance — chaque flèche pulse au rythme du moteur.</text>
  </g>
  <g font-family="Georgia, serif" fill="#f6d97c" font-size="10" letter-spacing="3" font-weight="bold">
    <text x="22" y="100">HÔTES</text>
    <text x="22" y="190">SHELL WEB</text>
    <text x="22" y="280">RENDU 3D</text>
    <text x="22" y="370">MOTEUR JEU</text>
    <text x="22" y="430">ÉTAT GLOBAL</text>
    <text x="22" y="500">MODULES</text>
    <text x="22" y="608">PERSISTENCE</text>
  </g>

  <!-- L1: HÔTES -->
  <g transform="translate(120 70)">
    <g transform="translate(0 0)"><rect width="240" height="44" rx="6" fill="url(#pa)" stroke="#a07c3a" stroke-width="1.5"/><circle cx="22" cy="22" r="14" fill="#5fd35f"><animate attributeName="r" values="11;15;11" dur="3s" repeatCount="indefinite"/></circle><text x="22" y="27" font-family="Georgia,serif" font-size="14" text-anchor="middle">🌍</text><text x="135" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="13" font-weight="bold" fill="#3a2412">NAVIGATEUR</text><text x="135" y="36" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#5a3a1f" font-style="italic">Chrome • Firefox • Safari</text></g>
    <g transform="translate(280 0)"><rect width="240" height="44" rx="6" fill="url(#pa)" stroke="#a07c3a" stroke-width="1.5"/><circle cx="22" cy="22" r="14" fill="#38bdf8"><animate attributeName="r" values="11;15;11" dur="3s" begin="0.4s" repeatCount="indefinite"/></circle><text x="22" y="27" font-family="Georgia,serif" font-size="14" text-anchor="middle">🖥️</text><text x="135" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="13" font-weight="bold" fill="#3a2412">DESKTOP ELECTRON</text><text x="135" y="36" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#5a3a1f" font-style="italic">Windows • macOS • Linux</text></g>
  </g>
  <line x1="400" y1="116" x2="400" y2="146" stroke="#f6d97c" stroke-width="2.5" marker-end="url(#aH)"><animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" repeatCount="indefinite"/></line>
  <line x1="680" y1="116" x2="680" y2="146" stroke="#f6d97c" stroke-width="2.5" marker-end="url(#aH)" opacity="0.75"><animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.4s" begin="0.4s" repeatCount="indefinite"/></line>

  <!-- L2: SHELL WEB -->
  <g transform="translate(120 150)">
    <g transform="translate(0 0)"><rect width="200" height="44" rx="6" fill="url(#pa)" stroke="#a07c3a" stroke-width="1.5"/><text x="100" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="bold" fill="#3a2412">NEXT.JS 16</text><text x="100" y="36" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#5a3a1f" font-style="italic">SSR • RSC • routing</text></g>
    <g transform="translate(220 0)"><rect width="180" height="44" rx="6" fill="url(#pa)" stroke="#a07c3a" stroke-width="1.5"/><text x="90" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="bold" fill="#3a2412">/API</text><text x="90" y="36" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#5a3a1f" font-style="italic">route.ts • Prisma</text></g>
    <g transform="translate(420 0)"><rect width="320" height="44" rx="6" fill="url(#pa)" stroke="#a07c3a" stroke-width="1.5"/><text x="160" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="bold" fill="#3a2412">APP/ + GAME/</text><text x="160" y="36" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#5a3a1f" font-style="italic">page.tsx → composant racine</text></g>
  </g>
  <line x1="540" y1="196" x2="540" y2="226" stroke="#f6d97c" stroke-width="2.5" marker-end="url(#aH)"><animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" begin="0.3s" repeatCount="indefinite"/></line>

  <!-- L3: RENDU 3D -->
  <g transform="translate(120 230)">
    <g transform="translate(0 0)"><rect width="220" height="44" rx="6" fill="url(#pa)" stroke="#a07c3a" stroke-width="1.5"/><text x="110" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="bold" fill="#3a2412">REACT + R3F 9</text><text x="110" y="36" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#5a3a1f" font-style="italic">déclaratif • hooks natifs</text></g>
    <g transform="translate(240 0)"><rect width="220" height="44" rx="6" fill="url(#pa)" stroke="#a07c3a" stroke-width="1.5"/><text x="110" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="bold" fill="#3a2412">THREE.JS 0.184</text><text x="110" y="36" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#5a3a1f" font-style="italic">scène • mesh • shaders</text></g>
    <g transform="translate(480 0)"><rect width="260" height="44" rx="6" fill="url(#pa)" stroke="#a07c3a" stroke-width="1.5"/><text x="130" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="bold" fill="#3a2412">DREI + POSTFX</text><text x="130" y="36" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#5a3a1f" font-style="italic">Bloom • God Rays • Vignette</text></g>
  </g>
  <line x1="540" y1="276" x2="540" y2="306" stroke="#f6d97c" stroke-width="2.5" marker-end="url(#aH)"><animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" begin="0.6s" repeatCount="indefinite"/></line>

  <!-- L4: MOTEUR JEU -->
  <g transform="translate(120 310)">
    <rect width="780" height="44" rx="6" fill="url(#pa)" stroke="#a13a2a" stroke-width="2"/>
    <rect width="780" height="44" rx="6" fill="none" stroke="#a13a2a" stroke-width="0.5" opacity="0.4"/>
    <circle cx="174" cy="22" r="4" fill="#c2563a"><animate attributeName="opacity" values="0.4;1;0.4" dur="1.4s" repeatCount="indefinite"/></circle>
    <circle cx="606" cy="22" r="4" fill="#c2563a"><animate attributeName="opacity" values="0.4;1;0.4" dur="1.4s" begin="0.4s" repeatCount="indefinite"/></circle>
    <text x="390" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="14" font-weight="900" fill="#a13a2a">⚡ GAME.TSX ⚡ ORCHESTRATEUR ⚡</text>
    <text x="390" y="37" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#5a3a1f" font-style="italic">boucle useFrame • contrôles • HUD overlay</text>
  </g>
  <line x1="540" y1="356" x2="540" y2="386" stroke="#f6d97c" stroke-width="2.5" marker-end="url(#aH)"><animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" begin="0.9s" repeatCount="indefinite"/></line>

  <!-- L5: ÉTAT GLOBAL -->
  <g transform="translate(120 390)">
    <g transform="translate(0 0)"><rect width="240" height="44" rx="6" fill="url(#pa)" stroke="#a07c3a" stroke-width="1.5"/><text x="120" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="13" font-weight="900" fill="#a13a2a">✦ ZUSTAND ✦</text><text x="120" y="36" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#5a3a1f" font-style="italic">store.ts • selectors</text></g>
    <g transform="translate(260 0)"><rect width="240" height="44" rx="6" fill="url(#pa)" stroke="#a07c3a" stroke-width="1.5"/><text x="120" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="bold" fill="#3a2412">TYPES + CONSTANTS</text><text x="120" y="36" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#5a3a1f" font-style="italic">types.ts • constants.ts</text></g>
    <g transform="translate(520 0)"><rect width="260" height="44" rx="6" fill="url(#pa)" stroke="#a07c3a" stroke-width="1.5"/><text x="130" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="bold" fill="#3a2412">AUDIO</text><text x="130" y="36" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#5a3a1f" font-style="italic">audio.ts • musique + SFX</text></g>
  </g>
  <line x1="540" y1="436" x2="540" y2="450" stroke="#f6d97c" stroke-width="2.5"/>
  <line x1="190" y1="450" x2="190" y2="476" stroke="#f6d97c" stroke-width="2" marker-end="url(#aH)" opacity="0.75"><animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.4s" begin="0s" repeatCount="indefinite"/></line>
  <line x1="340" y1="450" x2="340" y2="476" stroke="#f6d97c" stroke-width="2" marker-end="url(#aH)" opacity="0.75"><animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.4s" begin="0.2s" repeatCount="indefinite"/></line>
  <line x1="490" y1="450" x2="490" y2="476" stroke="#f6d97c" stroke-width="2" marker-end="url(#aH)" opacity="0.75"><animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.4s" begin="0.4s" repeatCount="indefinite"/></line>
  <line x1="640" y1="450" x2="640" y2="476" stroke="#f6d97c" stroke-width="2" marker-end="url(#aH)" opacity="0.75"><animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.4s" begin="0.6s" repeatCount="indefinite"/></line>
  <line x1="790" y1="450" x2="790" y2="476" stroke="#f6d97c" stroke-width="2" marker-end="url(#aH)" opacity="0.75"><animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.4s" begin="0.8s" repeatCount="indefinite"/></line>

  <!-- L6: MODULES -->
  <g transform="translate(120 480)">
    <g transform="translate(0 0)"><rect width="120" height="44" rx="6" fill="#ead7a8" stroke="#a07c3a" stroke-width="1.5"/><text x="60" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="bold" fill="#a13a2a">PLAYER 👤</text><text x="60" y="36" text-anchor="middle" font-family="Georgia,serif" font-size="9" fill="#5a3a1f" font-style="italic">Player.tsx</text></g>
    <g transform="translate(150 0)"><rect width="120" height="44" rx="6" fill="#ead7a8" stroke="#a07c3a" stroke-width="1.5"/><text x="60" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="bold" fill="#a13a2a">ENEMIES 👹</text><text x="60" y="36" text-anchor="middle" font-family="Georgia,serif" font-size="9" fill="#5a3a1f" font-style="italic">Enemy.tsx</text></g>
    <g transform="translate(300 0)"><rect width="120" height="44" rx="6" fill="#ead7a8" stroke="#a07c3a" stroke-width="1.5"/><text x="60" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="bold" fill="#a13a2a">WORLD 🌍</text><text x="60" y="36" text-anchor="middle" font-family="Georgia,serif" font-size="9" fill="#5a3a1f" font-style="italic">World.tsx</text></g>
    <g transform="translate(450 0)"><rect width="120" height="44" rx="6" fill="#ead7a8" stroke="#a07c3a" stroke-width="1.5"/><text x="60" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="bold" fill="#a13a2a">EFFECTS ✨</text><text x="60" y="36" text-anchor="middle" font-family="Georgia,serif" font-size="9" fill="#5a3a1f" font-style="italic">PostFX</text></g>
    <g transform="translate(600 0)"><rect width="120" height="44" rx="6" fill="#ead7a8" stroke="#a07c3a" stroke-width="1.5"/><text x="60" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="bold" fill="#a13a2a">UI 🖼️</text><text x="60" y="36" text-anchor="middle" font-family="Georgia,serif" font-size="9" fill="#5a3a1f" font-style="italic">12 panneaux</text></g>
    <g transform="translate(750 0)"><rect width="120" height="44" rx="6" fill="#ead7a8" stroke="#a07c3a" stroke-width="1.5"/><text x="60" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="bold" fill="#a13a2a">DATA 📊</text><text x="60" y="36" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#5a3a1f" font-style="italic">items/skills</text></g>
  </g>

  <!-- L7: PERSISTENCE / ASSETS -->
  <g transform="translate(120 580)">
    <g transform="translate(0 0)"><rect width="180" height="38" rx="6" fill="#1a0838" stroke="#f6d97c" stroke-width="1.5"/><text x="90" y="24" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="bold" fill="#f6d97c">💾 PRISMA + SQLITE</text></g>
    <g transform="translate(200 0)"><rect width="180" height="38" rx="6" fill="#1a0838" stroke="#f6d97c" stroke-width="1.5"/><text x="90" y="24" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="bold" fill="#f6d97c">🎨 QUATERNIUS CC0</text></g>
    <g transform="translate(400 0)"><rect width="220" height="38" rx="6" fill="#1a0838" stroke="#f6d97c" stroke-width="1.5"/><text x="110" y="24" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="bold" fill="#f6d97c">📜 BANNERS SVG CINÉMATIQUES</text></g>
    <g transform="translate(640 0)"><rect width="140" height="38" rx="6" fill="#1a0838" stroke="#f6d97c" stroke-width="1.5"/><text x="70" y="24" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="bold" fill="#f6d97c">⚙ SCRIPTS</text></g>
  </g>
  <circle cx="22" cy="22" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0;1;0" dur="2.4s" begin="0s" repeatCount="indefinite"/></circle>
  <circle cx="1078" cy="22" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0;1;0" dur="2.4s" begin="0.3s" repeatCount="indefinite"/></circle>
  <circle cx="22" cy="638" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0;1;0" dur="2.4s" begin="0.6s" repeatCount="indefinite"/></circle>
  <circle cx="1078" cy="638" r="3" fill="#f6d97c"><animate attributeName="opacity" values="0;1;0" dur="2.4s" begin="0.9s" repeatCount="indefinite"/></circle>
</svg>
</p>

> **Du joueur vers la persistance**, sept strates empilées communiquent par flèches pulsantes : les **HÔTES** (navigateur ou Electron) projettent le **SHELL WEB** (Next.js 16 + App Router), qui active le **RENDU 3D** (React + R3F + Three.js + post-fx). Le **MOTEUR JEU** (`Game.tsx`) orchestre la boucle d'affichage et s'appuie sur l'**ÉTAT GLOBAL** Zustand (`store.ts`, types, audio). Six **MODULES** métier (`player`, `enemies`, `world`, `effects`, `ui`, `data`) reçoivent les ordres du store. Sous le capot : **Prisma + SQLite** pour la persistance, **modèles Quaternius CC0** pour les assets 3D, **banners SVG cinématiques** pour le README, et un dossier **scripts/** pour la capture / génération.

### Stack technique

| Technologie | Rôle | Pourquoi |
|---|---|---|
| **Next.js 16** | Framework React, SSR, routing | App Router moderne + RSC-ready |
| **React Three Fiber** | Rendu 3D WebGL dans React | Déclaratif, hooks natifs Three |
| **@react-three/drei** | Helpers 3D (`useGLTF`, `OrbitControls`, `Sky`, `Cloud`) | Composants prêts à l'emploi |
| **@react-three/postprocessing** | Bloom, God Rays, Vignette | Pipeline d'effets cinématiques |
| **Three.js** | Moteur 3D sous-jacent | Standard de l'industrie |
| **Zustand** | État global réactif | Boilerplate minimal, performant |
| **Tailwind CSS 4** | Styles utilitaires | Système design prêt à l'emploi |
| **Prisma + SQLite** | Persistance locale (sauvegardes) | Zéro-config, type-safe |
| **Electron 42** | Application desktop | Build Win/Mac/Linux natif |
| **TypeScript 5** | Typage statique | DX + sûreté de typage |

---

## 🗺️ Roadmap

<p align="center">
  <svg viewBox="0 0 1000 200" xmlns="http://www.w3.org/2000/svg" width="100%" style="max-width:1000px">
    <defs>
      <linearGradient id="rl" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#3a7a3a"/>
        <stop offset="50%" stop-color="#f6d97c"/>
        <stop offset="100%" stop-color="#ff5468"/>
      </linearGradient>
    </defs>

    <line x1="60" y1="100" x2="940" y2="100" stroke="url(#rl)" stroke-width="6" stroke-linecap="round"/>

    <!-- Phase 1: MVP ✅ shipped -->
    <g transform="translate(110 100)">
      <circle r="22" fill="#3a7a3a" stroke="#fff4c2" stroke-width="2"/>
      <text y="6" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#fff4c2">✓</text>
      <text y="-40" text-anchor="middle" font-family="Georgia, serif" font-size="13" font-weight="bold" fill="#3a7a3a">MVP v0.1</text>
      <text y="50"  text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#5a3a1f" font-style="italic">Monoïde 3D, 6 ennemis,</text>
      <text y="65"  text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#5a3a1f" font-style="italic">5 quêtes, base Electron</text>
    </g>

    <!-- Phase 2: en cours -->
    <g transform="translate(330 100)">
      <circle r="22" fill="#f6d97c" stroke="#3a2412" stroke-width="2">
        <animate attributeName="r" values="20;25;20" dur="2.4s" repeatCount="indefinite"/>
      </circle>
      <text y="6" text-anchor="middle" font-family="Georgia, serif" font-size="16" font-weight="bold" fill="#3a2412">⚒</text>
      <text y="-40" text-anchor="middle" font-family="Georgia, serif" font-size="13" font-weight="bold" fill="#f6d97c">v0.2 — en cours</text>
      <text y="50"  text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#5a3a1f" font-style="italic">Modèles Quaternius réels,</text>
      <text y="65"  text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#5a3a1f" font-style="italic">animations, audio complet</text>
    </g>

    <!-- Phase 3: competences arbre -->
    <g transform="translate(550 100)">
      <circle r="22" fill="#3a2412" stroke="#a07c3a" stroke-width="2"/>
      <text y="6" text-anchor="middle" font-family="Georgia, serif" font-size="14" font-weight="bold" fill="#f6d97c">✦</text>
      <text y="-40" text-anchor="middle" font-family="Georgia, serif" font-size="13" font-weight="bold" fill="#a07c3a">v0.3 — à venir</text>
      <text y="50"  text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#5a3a1f" font-style="italic">Arbre de compétences,</text>
      <text y="65"  text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#5a3a1f" font-style="italic">PNJ secondaire, météo</text>
    </g>

    <!-- Phase 4: multijoueur -->
    <g transform="translate(770 100)">
      <circle r="22" fill="#3a2412" stroke="#a07c3a" stroke-width="2"/>
      <text y="6" text-anchor="middle" font-family="Georgia, serif" font-size="14" font-weight="bold" fill="#f6d97c">⚔</text>
      <text y="-40" text-anchor="middle" font-family="Georgia, serif" font-size="13" font-weight="bold" fill="#a07c3a">v1.0 — rêve</text>
      <text y="50"  text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#5a3a1f" font-style="italic">Multijoueur coopératif,</text>
      <text y="65"  text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#5a3a1f" font-style="italic">guildes, raids</text>
    </g>

    <!-- Phase 5: monde persistant -->
    <g transform="translate(920 100)">
      <circle r="14" fill="none" stroke="#ff5468" stroke-width="1.5" opacity="0.5"/>
      <text y="4" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="#ff5468">∞</text>
      <text y="-40" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="#ff5468">+ loin</text>
    </g>
  </svg>
</p>

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour les conventions de code, la structure du projet et comment soumettre une Pull Request.

```bash
bun run lint          # Vérifier le style de code
bunx tsc --noEmit     # Vérifier les types TypeScript
bun run build         # Build de production
bun run screenshots   # Régénérer les captures
```

---

## 📦 Assets & Crédits

Les modèles 3D et animations sont fournis par **[Quaternius](https://quaternius.com)** sous licence **CC0 1.0** (domaine public).

| Pack | Statut | Emplacement |
|---|---|---|
| Universal Animation Library | ✅ Téléchargé | `public/assets/characters/animations/` |
| Universal Base Characters | ⚠️ Placeholder | `public/assets/characters/base/` |
| Modular Character Outfits | ⚠️ Placeholder | `public/assets/characters/outfits/` |

Les bannières et illustrations SVG du README sont dérivées de l'identité visuelle du jeu
(parchemin / or / pourpre) et codées artisanalement pour ce projet.

---

<p align="center">
  <a href="public/banner/footer-flourish.svg">
    <picture>
      <img src="public/banner/footer-flourish.svg" alt="Signature Eldoria" width="100%">
    </picture>
  </a>
</p>

<p align="center">
  <a href="#top">
    <img src="https://img.shields.io/badge/Retour_en_haut-⚔️_ELDORIA-f6d97c?style=for-the-badge&labelColor=3a2412&color=a13a2a" alt="Retour en haut" />
  </a>
  <br/>
  <sub>
    Fait avec ❤️, beaucoup de <code>useFrame()</code>, et un soupçon de <em>Three.js</em>.
  </sub>
  <br/>
  <sup>
    <strong>© DmzGamingYT</strong> — <em>« Le code du projet est la propriété de son auteur. Les assets 3D Quaternius sont placés sous CC0 1.0. »</em>
  </sup>
</p>
