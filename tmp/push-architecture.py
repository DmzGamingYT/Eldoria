#!/usr/bin/env python3
"""tmp/push-architecture.py — commit + push the Architecture restructure + verify CDN propagation."""

import subprocess
import time
import urllib.request
from pathlib import Path

ROOT = Path("/Users/alessioinnangi/Desktop/Projets/Jeux/Eldoria")


def run(label, cmd):
    r = subprocess.run(cmd, cwd=str(ROOT), capture_output=True, text=True)
    print(f"=== {label} ===")
    print(f"  exit: {r.returncode}")
    if r.stdout:
        for line in r.stdout.strip().split("\n"):
            print(f"  OUT | {line}")
    if r.stderr:
        for line in r.stderr.strip().split("\n"):
            print(f"  ERR | {line}")
    print()
    return r.returncode, r.stdout, r.stderr


print("=" * 70)
print("ARCHITECTURE-HERO COMMIT + PUSH + CDN VERIFICATION")
print("=" * 70)
print()

# STEP 1 — Pre-flight
ec, out, _ = run("STEP 1 — pre-flight", ["git", "status", "--short"])
ec, out, _ = run("STEP 1 — HEAD before", ["git", "log", "--oneline", "-3"])

# STEP 2 — git add the 2 files
ec, _, _ = run("STEP 2 — git add architecture-hero.svg + README.md",
               ["git", "add", "public/banner/architecture-hero.svg", "README.md"])
ec, out, _ = run("STEP 2 — git status post-add", ["git", "status", "--short"])

# STEP 3 — git commit (full French message, multi-line)
commit_msg = """feat(readme): restructurer Architecture technique en banniere panoramique 1300x900

Remplace le bloc SVG inline 1100x660 illisible au sein de la section
Architecture technique par une banniere standalone (architecture-hero.svg,
1300x900, 24 animations SMIL) avec 5 correctifs de revue :

  (A) CRITIQUE — Fan-out L5->L6 : 6 diagonales reelles depuis le tronc commun
      (650, 600) jusqu'aux coordonnees reelles des cases x={260, 450, 640,
      830, 1020, 1110}, chacune avec marker-end et animation pulse.
  (B) Rythme vertical uniforme : 7 rangees y={140, 240, 340, 440, 540, 660,
      740} en pas de 100px, libelles recadres sur la marge gauche.
  (C) Cartouche eyebrow « ARCHITECTURE EN COUCHES » : rect sombre sur le
      border or, animation pulse stroke-opacity.
  (D) Marque-page ZUSTAND : glyph ✦ + radial-gradient burst pour signaler
      le coeur d'etat global comme centre d'equilibre du moteur.
  (E) Souffle bas de page : ornements or decales pour ouvrir une legende.

Benefice net : -200+ lignes de SVG inline du README, lisibilite
considerablement amelioree, mapping DA coherent avec les hero-banners
voisins (fonctionnalites-hero, competences-hero, bestiaire-hero).
"""

ec, out, _ = run("STEP 3 — git commit", ["git", "commit", "-m", commit_msg])

if ec != 0:
    print("!! Commit failed — aborting push. The 2 files are now staged but uncommitted.")
    raise SystemExit(1)

ec, out, _ = run("STEP 3 — HEAD after commit", ["git", "log", "-1", "--format=%H%n%s%n%n%b", "HEAD"])

# STEP 4 — git push
ec, out, _ = run("STEP 4 — git push origin main", ["git", "push", "origin", "main"])

if ec != 0:
    print("!! Push failed — fix auth/network, then retry git push origin main.")
    raise SystemExit(1)

ec, out, _ = run("STEP 4 — remote HEAD", ["git", "ls-remote", "origin", "main"])

# STEP 5 — verify GitHub CDN propagation
print("=" * 70)
print("STEP 5 — verify GitHub CDN propagation (waiting 8s for cache)")
print("=" * 70)
time.sleep(8)

svg_url = "https://raw.githubusercontent.com/DmzGamingYT/Eldoria/main/public/banner/architecture-hero.svg"
try:
    req = urllib.request.Request(svg_url, headers={"Cache-Control": "no-cache"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        body = resp.read().decode("utf-8")
        print(f"  HTTP {resp.status} from {svg_url}")
        print(f"  payload size: {len(body)} bytes")
        print()

        print("=== NEW markers (each expected = 1) ===")
        for marker, label in [
            ("x2=\"260\"",   "fan-out x2=260  -> module 1"),
            ("x2=\"450\"",   "fan-out x2=450  -> module 2"),
            ("x2=\"640\"",   "fan-out x2=640  -> module 3"),
            ("x2=\"830\"",   "fan-out x2=830  -> module 4"),
            ("x2=\"1020\"",  "fan-out x2=1020 -> module 5"),
            ("x2=\"1110\"",  "fan-out x2=1110 -> module 6"),
            ("translate(180 140)", "row y=140 → HÔTES"),
            ("translate(180 240)", "row y=240 → SHELL WEB"),
            ("translate(180 340)", "row y=340 → RENDU 3D"),
            ("translate(180 440)", "row y=440 → MOTEUR JEU"),
            ("translate(180 540)", "row y=540 → ÉTAT GLOBAL"),
            ("translate(180 660)", "row y=660 → ZUSTAND-bridge"),
            ("translate(180 740)", "row y=740 → PERSISTANCE"),
            ('x="-460" y="-32" width="920" height="72"',
             "header eyebrow cartouche"),
            ("✦ ZUSTAND ✦", "ZUSTAND glow burst"),
        ]:
            print(f"  CDN {label}: {body.count(marker)}")

        print()
        print("=== STALE markers (each expected = 0) ===")
        for marker in [
            "viewBox=\"0 0 1100 660\"",  # old inline signature
            "x2=\"240\"",                # old 20px drift
            "x2=\"1190\"",               # old 80px box-6 offset
            "translate(180 270)",       # old non-uniform row position
        ]:
            print(f"  CDN stale {marker}: {body.count(marker)}")
except Exception as e:
    print(f"  CDN ERROR: {e}")
    raise SystemExit(2)

# Also confirm README on github
readme_url = "https://raw.githubusercontent.com/DmzGamingYT/Eldoria/main/README.md"
print()
print("=" * 70)
print("STEP 6 — also verify README on gitHub")
print("=" * 70)
try:
    with urllib.request.urlopen(readme_url, timeout=20) as resp:
        body = resp.read().decode("utf-8")
        stale_inline = 'viewBox="0 0 1100 660"'
        print(f"  HTTP {resp.status} from {readme_url}")
        print(f"  README has architecture-hero.svg ref: {body.count('architecture-hero.svg')}")
        print(f"  README has old inline 1100x660 SVG block: {body.count(stale_inline)}")
        print(f"  README still has prose blockquote: {body.count('Du joueur vers la persistance')}")
except Exception as e:
    print(f"  README ERROR: {e}")

# STEP 7 — final working tree state
print()
print("=" * 70)
print("STEP 7 — final working tree")
print("=" * 70)
ec, out, _ = run("STEP 7 — git status --short", ["git", "status", "--short"])

print()
print("=" * 70)
print("DONE — Architecture restructure deployed.")
print("=" * 70)
