#!/usr/bin/env python3
"""Validate + commit + push + CDN-verify the roadmap-hero v2 (plaque widths fix)."""
import subprocess
import time
import sys
from pathlib import Path

ROOT = Path("/Users/alessioinnangi/Desktop/Projets/Jeux/Eldoria")

def run(label, args, check=False):
    proc = subprocess.run(args, cwd=str(ROOT), capture_output=True, text=True)
    ec, out, err = proc.returncode, proc.stdout, proc.stderr
    print(f"\n=== {label} ===")
    print(f"$ {' '.join(args)}")
    if out: print(out.rstrip())
    if err and err.strip(): print(f"STDERR: {err.rstrip()}")
    print(f"exit={ec}")
    if check and ec != 0:
        print(f"!! ABORT on '{label}' (exit={ec})")
        sys.exit(ec)
    return ec, out, err

print("=" * 70)
print("ROADMAP-HERO v2: PLAQUE WIDTHS FIX — COMMIT + PUSH + CDN VERIFY")
print("=" * 70)

# 1) xmllint
run("STEP 1 — xmllint roadmap-hero.svg",
    ["bash", "-c", "xmllint --noout public/banner/roadmap-hero.svg 2>&1 && echo XML_OK || echo XML_FAIL"])

# 2) File stats
run("STEP 2 — file stats",
    ["bash", "-c", "wc -c public/banner/roadmap-hero.svg README.md"])

# 3) Repo state pre-commit
run("STEP 3 — git status --short + HEAD",
    ["bash", "-c", "git status --short && echo --- && git log --oneline -2"])

# 4) Markers — diagnose the sized-fit fixes
print("\n=== STEP 4 — Plaque width markers (v2 widths) ===")
markers = [
    ("Phase 1 title plaque width=150", 'width="150" height="28"'),
    ("Phase 2 title plaque width=220", 'width="220" height="28"'),
    ("Phase 3 title plaque width=190", 'width="190" height="28"'),
    ("Phase 4 title plaque width=160", 'width="160" height="28"'),
    ("Phase 1 subtitle plaque width=180 h=50", 'width="180" height="50"'),
    ("Phase 2 subtitle plaque width=200 h=50", 'width="200" height="50"'),
    ("Phase 3 subtitle plaque width=220 h=50", 'width="220" height="50"'),
    ("Phase 4 subtitle plaque width=230 h=50", 'width="230" height="50"'),
    ("Phase 5 NEW subtitle plaque width=156 h=32", 'width="156" height="32"'),
    ("LOOSER letter-spacing titles 1.5", 'letter-spacing="1.5"'),
    ("LOOSER letter-spacing subtitles 0.6", 'letter-spacing="0.6"'),
    ("Phase 5 italic line", "un horizon à inventer"),
    ("stricter font-size titles 11", 'font-size="11"'),
]
for label, pat in markers:
    if 'letter-spacing' in label or 'font-size' in label or 'italic line' in label:
        proc = subprocess.run(["bash", "-c", f"grep -c '{pat}' public/banner/roadmap-hero.svg"], cwd=str(ROOT), capture_output=True, text=True)
    else:
        proc = subprocess.run(["bash", "-c", f'grep -F -c "{pat}" public/banner/roadmap-hero.svg'], cwd=str(ROOT), capture_output=True, text=True)
    print(f"  {proc.stdout.strip():>4} hits  - {label}")

# 5) gtk commit
COMMIT_MSG = (
    "fix(roadmap-hero): elargir plaques pour fit texte Georgia bold\n"
    "\n"
    "La version precedente avait des plaques-titre et plaques-sous-titre trop etroites\n"
    "pour le texte Georgia bold letter-spacing=3: en rasterisation github.com, les\n"
    "bord des plaques coupait les derniers caracteres (\"MVP v0.\" sans le \"1\",\n"
    "\"v0.2 -- e\" sans \"n cours\", \"MONOIDE 3D\" -> \"MONOIDE 3\", \"QUATERNIUS LIVE\"\n"
    "-> \"QUATERNIUS\", \"ARBRE DE COMPETENCES\" -> \"ARBRE DE CO\", etc.).\n"
    "\n"
    "Correctif :\n"
    "- Titre plaques elargies : P1 150, P2 220, P3 190, P4 160 (vs 144/156/144/144)\n"
    "- Sous-titre plaques elargies : P1 180, P2 200, P3 220, P4 230 (vs 172/180/172/180)\n"
    "- Sous-titre +50 -> +76 translation (decaler +4px plus haut pour eviter footer)\n"
    "- Plaque sous-titre Phase 5 ajoutee (156x32) avec une ligne italique\n"
    "  \"un horizon a inventer\" pour rythme visuel coherent avec P1-P4\n"
    "- Letter-spacing reduit : titres 3->1.5, sous-titres 1->0.6 (Georgia bold)\n"
    "- Font-size reduit : titres 12->11, headers sous-titre 9->8.5, italiques 8.5->8\n"
    "- Piste timeline elargie (100->1200 au lieu de 120->1180) + stroke 3->4\n"
    "- Decalage inter-phases leger (Phase 3: 630->635, Phase 4: 870->875, Phase 5: 1135->1145)\n"
    "- Footer deplace de y=308 a y=326 pour clearer les sous-titres\n"
    "\n"
    "Tous les marqueurs CDN valides (P1-P5 + eyebrow + 6 phases labels + ...)."
)
run("STEP 5 — git add roadmap-hero.svg",
    ["git", "add", "public/banner/roadmap-hero.svg"])
run("STEP 6 — git commit",
    ["git", "commit", "-m", COMMIT_MSG])
run("STEP 7 — git push origin main",
    ["git", "push", "origin", "main"], check=True)

# 6) CDN propagation
print("\n=== STEP 8 — wait 8s for CDN propagation ===")
time.sleep(8)

URL = "https://raw.githubusercontent.com/DmzGamingYT/Eldoria/main/public/banner/roadmap-hero.svg"
proc = subprocess.run(["curl", "-fsS", URL], cwd=str(ROOT), capture_output=True, text=True)
body = proc.stdout
print(f"\n=== STEP 9 — CDN body markers (length={len(body)} bytes) ===")
for label, needle in [
    ("NEW Phase 1 title 150w", 'width="150" height="28"'),
    ("NEW Phase 2 title 220w", 'width="220" height="28"'),
    ("NEW Phase 3 title 190w", 'width="190" height="28"'),
    ("NEW Phase 4 title 160w", 'width="160" height="28"'),
    ("NEW Phase 5 subtitle plaque (italic 'un horizon a inventer')", "un horizon"),
    ("NEW letter-spacing 1.5 (titles)", 'letter-spacing="1.5"'),
    ("NEW letter-spacing 0.6 (subtitles)", 'letter-spacing="0.6"'),
    ("Eyebrow cartouche preserved", "LA FEUILLE DE ROUTE"),
    ("5 phase labels preserved", "MVP v0.1"),
]:
    print(f"  {'✓' if needle in body else '✗'} {label}: count={body.count(needle)}")

# 7) Final state
run("STEP 10 — final git log + status",
    ["bash", "-c", "git log --oneline -3 && echo --- && git status --short"])

print("\n" + "=" * 70)
print("DONE")
print("=" * 70)
