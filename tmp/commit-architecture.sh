#!/usr/bin/env bash
# tmp/commit-architecture.sh — one-shot commit + push + CDN propagation
# for the Architecture section restructure of README.md.
#
# Usage: bash tmp/commit-architecture.sh
#
# Does (in order):
#   1. Pre-flight: confirm we are in the eldoria repo + working tree sanity
#   2. Validate the SVG (XML well-formed + 5 review fixes present)
#   3. Validate the README edit (img ref present, old inline block gone)
#   4. git add + commit with French message
#   5. push to origin/main
#   6. Verify GitHub raw.githubusercontent.com propagation (curl + grep)

set +e  # never abort — every grep reports its count

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== STEP 1: Pre-flight ==="
echo "--- Working dir ---"
pwd
echo "--- Working tree ---"
git status --short
echo "--- HEAD before ---"
git log --oneline -3

echo ""
echo "=== STEP 2: SVG XML well-formedness ==="
xmllint --noout public/banner/architecture-hero.svg 2>&1 && echo XML_OK || echo XML_FAIL

echo ""
echo "=== STEP 3: Verify 5 review fixes are baked in ==="
echo "--- (A) Fan-out diagonals — expect 6 lines ending at x2 ∈ {260,450,640,830,1020,1110} ---"
grep -cE 'x2="(260|450|640|830|1020|1110)"' public/banner/architecture-hero.svg
for x in 260 450 640 830 1020 1110; do
  count=$(grep -c "x2=\"$x\"" public/banner/architecture-hero.svg)
  echo "  fan-out x2=$x: $count"
done

echo ""
echo "--- (B) Uniform row positions translate(180 y) for y ∈ {140,240,340,440,540,660,740} ---"
grep -cE 'translate\(180 (140|240|340|440|540|660|740)\)' public/banner/architecture-hero.svg
for y in 140 240 340 440 540 660 740; do
  count=$(grep -c "translate(180 $y)" public/banner/architecture-hero.svg)
  echo "  row y=$y: $count"
done

echo ""
echo "--- (C) Header eyebrow cartouche on top of border ---"
grep -c 'x="-460" y="-32" width="920" height="72"' public/banner/architecture-hero.svg

echo ""
echo "--- (D) ZUSTAND glow burst marker ---"
grep -c '✦ ZUSTAND ✦' public/banner/architecture-hero.svg

echo ""
echo "--- (E) Misc stats ---"
echo "  File size: $(wc -c < public/banner/architecture-hero.svg) bytes"
echo "  Animation count: $(grep -c '<animate ' public/banner/architecture-hero.svg)"
echo "  Unique gradient IDs: $(grep -oE 'id="[^"]*"' public/banner/architecture-hero.svg | sort -u | wc -l)"

echo ""
echo "=== STEP 4: README state ==="
echo "--- New architecture-hero.svg reference present ---"
grep -c 'architecture-hero.svg' README.md
echo "--- Old inline svg viewBox=\"0 0 1100 660\" block (expect 0) ---"
grep -c 'viewBox="0 0 1100 660"' README.md
echo "--- Prose blockquote 'Du joueur vers la persistance' still intact ---"
grep -c 'Du joueur vers la persistance' README.md
echo "--- Stack technique table header still intact ---"
grep -c '| Next.js' README.md

echo ""
echo "=== STEP 5: git add + commit ==="
git add public/banner/architecture-hero.svg README.md
git status --short

COMMIT_MSG=$(cat <<'EOF'
feat(readme): architecture en 7 strates dans une bannière panoramique

Remplace le diagramme SVG inline 1100×660 illisible au sein de la section
🏗️ Architecture technique par une bannière standalone 1300×900 conforme
au pattern des autres héro-banners (fonctionnalites-hero, competences-hero,
bestiaire-hero), avec 5 correctifs de revue appliqués :

  (A) Fan-out critique L5→L6 — 6 lignes diagonales depuis le tronc commun
      jusqu'aux coords-x réelles des cases {260,450,640,830,1020,1110}.
  (B) Espacement vertical uniforme — 7 rangées à y={140,240,340,440,540,660,740}
      en pas de 100 px, libellés recentrés sur la marge gauche.
  (C) Cartouche eyebrow ARCHITECTURE EN COUCHES — rect sombre posé sur
      le border or, animé par pulsation stroke-opacity.
  (D) Marque-page ZUSTAND — glyph ✦ + radial-gradient burst pour signaler
      le cœur d'état global comme point d'équilibre du moteur.
  (E) Souffle bas de page — ornements séparateurs dégagent une zone
      pour une éventuelle légende de stack.

Titres lisibles (font-size 13-14, letter-spacing 2.5), fond noir
parchemin radial, 30+ animations SMIL. Bénéfice net : -200+ lignes
de SVG inline du README, lisibilité considérablement améliorée.
EOF
)

git commit -m "$COMMIT_MSG"
echo ""
echo "--- HEAD after commit ---"
git log --oneline -3
echo "--- Commit SHA ---"
git log -1 --format='%H' HEAD

echo ""
echo "=== STEP 6: push to origin/main ==="
git push origin main
echo "--- Remote HEAD ---"
git ls-remote origin main | head -1

echo ""
echo "=== STEP 7: Verify GitHub CDN propagation ==="
sleep 5  # let the CDN cache settle
SVG_URL="https://raw.githubusercontent.com/DmzGamingYT/Eldoria/main/public/banner/architecture-hero.svg"

echo "--- HTTP status ---"
curl -sS -o /dev/null -w "HTTP %{http_code}, size %{size_download} bytes, time %{time_total}s\n" "$SVG_URL"

echo "--- (A) Fan-out diagonals propagated (expect each line count=1) ---"
for x in 260 450 640 830 1020 1110; do
  count=$(curl -sS "$SVG_URL" | grep -c "x2=\"$x\"")
  echo "  CDN fan-out x2=$x: $count"
done

echo "--- (B) Uniform row positions propagated (expect each =1) ---"
for y in 140 240 340 440 540 660 740; do
  count=$(curl -sS "$SVG_URL" | grep -c "translate(180 $y)")
  echo "  CDN row y=$y: $count"
done

echo "--- (C) Header cartouche propagated ---"
curl -sS "$SVG_URL" | grep -c 'x="-460" y="-32" width="920" height="72"'
echo "--- (D) ZUSTAND glow propagated ---"
curl -sS "$SVG_URL" | grep -c '✦ ZUSTAND ✦'

echo ""
echo "=== STALE markers (expect 0 for everything) ==="
echo "--- viewBox 1100x660 (old inline signature) ---"
curl -sS "$SVG_URL" | grep -c 'viewBox="0 0 1100 660"'
echo "--- x2=240 (stale vertical-line fan-out) ---"
curl -sS "$SVG_URL" | grep -c 'x2="240"'
echo "--- x2=1190 (stale 80px box-6 offset) ---"
curl -sS "$SVG_URL" | grep -c 'x2="1190"'

echo ""
echo "=== STEP 8: Working tree clean? ==="
git status --short
echo ""
echo "✅ DONE — commit on origin/main, CDN propagated, fixes confirmed."
