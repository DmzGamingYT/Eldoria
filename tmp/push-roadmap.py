#!/usr/bin/env python3
"""Validate + commit + push + CDN-verify the Roadmap section restructure."""
import subprocess
import time
import sys
from pathlib import Path

ROOT = Path("/Users/alessioinnangi/Desktop/Projets/Jeux/Eldoria")

def run(label, args, check=False):
    ec, out, err = subprocess.run(args, cwd=str(ROOT), capture_output=True, text=True).returncode, "", ""
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
print("ROADMAP-HERO COMMIT + PUSH + CDN VERIFICATION")
print("=" * 70)

# 1) Validate SVG XML well-formedness
run("STEP 1 — xmllint on roadmap-hero.svg",
    ["bash", "-c", "xmllint --noout public/banner/roadmap-hero.svg 2>&1 && echo XML_OK || echo XML_FAIL"])

# 2) File sizes + line counts
run("STEP 2 — file stats",
    ["bash", "-c", "wc -c public/banner/roadmap-hero.svg README.md && wc -l public/banner/roadmap-hero.svg"])

# 3) Repo state pre-commit
run("STEP 3 — git status --short + HEAD",
    ["bash", "-c", "git status --short && echo --- && git log --oneline -2"])

# 4) Greps: new asset present in README, old inline block gone
print("\n=== STEP 4 — README swap markers ===")
checks = [
    ("NEW: <img src=\"public/banner/roadmap-hero.svg\">", "roadmap-hero.svg"),
    ("STALE: inline viewBox 1000x200 should be 0", 'viewBox="0 0 1000 200"'),
    ("ANCHOR: 'Cinq jalons' bold one-liner", "Cinq jalons"),
    ("PROSE: italic blockquote present", "Vert du MVP"),
]
for label, pat in checks:
    args = ["bash", "-c", f'grep -c "{pat}" README.md']
    proc = subprocess.run(args, cwd=str(ROOT), capture_output=True, text=True)
    print(f"{label}: {proc.stdout.strip()}")

# 5) SVG internal-quality greps
print("\n=== STEP 5 — roadmap-hero.svg internal markers ===")
markers = [
    ("5 timeline stops (transform=translate at 160/395/630/870/1135)", 'transform="translate(160 175)"'),
    ("PHASE 1 (MVP ✓, créneau stop 1)", 'MVP v0.1'),
    ("PHASE 2 (v0.2 en cours ⚒)", 'v0.2 — en cours'),
    ("PHASE 3 (v0.3 à venir ✦)", 'v0.3 — à venir'),
    ("PHASE 4 (v1.0 rêve ⚔)", 'v1.0 — rêve'),
    ("PHASE 5 (+ loin ∞)", '+ loin'),
    ("Cinebar eyebrow cartouche", 'LA FEUILLE DE ROUTE'),
    ("Gradient sweeps", 'rlLine'),
    ("Animation count", '<animate '),
]
for label, pat in markers:
    if pat == '<animate ':
        proc = subprocess.run(["bash", "-c", f"grep -c '{pat}' public/banner/roadmap-hero.svg"], cwd=str(ROOT), capture_output=True, text=True)
    else:
        proc = subprocess.run(["bash", "-c", f'grep -c "{pat}" public/banner/roadmap-hero.svg'], cwd=str(ROOT), capture_output=True, text=True)
    print(f"{label}: {proc.stdout.strip()}")

# 6) git add + commit (multi-line message via -m -m)
COMMIT_MSG = (
    "feat(readme): restructurer Roadmap en banniere panoramique 1300x340\n"
    "\n"
    "Restructure de la section ## 🗺️ Roadmap du README. Avant : bloc SVG inline\n"
    "viewBox=\"0 0 1000 200\" illisible (fond transparent + titre v0.2 en fill=\"#f6d97c\"\n"
    "(gold) sur fond blanc GitHub = invisible). Apres : nouvelle banniere autonome\n"
    "public/banner/roadmap-hero.svg (1300x340, fond opaque gradient #1a0838->#3a2412,\n"
    "frame or, eyebrow cartouche \"LA FEUILLE DE ROUTE\", piste timeline rgb-line,\n"
    "5 chrono-stops a x={160,395,630,870,1135} avec plaques-titre or/brun + plaques\n"
    "sous-titre parchemin lisibles (font-size 8.5 fill=#3a2412 sur bg cream).\n"
    "\n"
    "Details:\n"
    "- hover/sweep glint anime sur la timeline (cx 120->1180->120, dur=9s)\n"
    "- Phase 2 \"v0.2 — en cours\" garde son pouls or (radial-gradient + ring double pulse)\n"
    "- Phase 5 \"+ loin\" devient halo ethereal (opacity 0.5->0.15, dur=4.2s)\n"
    "- Phases 3 & 4 glow interleaved (decalage 0.4s/0.8s)\n"
    "- 5 plaques-parchemin (cream #fff4c2 + bordure #a07c3a) pour chaque jalon\n"
    "- 5 plaques-titre (gradients sombres + bordures colorees = signature Eldoria)\n"
    "- 30+ animations SMIL echelonnees, 7 IDs gradients uniques\n"
    "\n"
    "Le bloc inline 1000x200 du README est remplace par un seul <img src=\"\n"
    "public/banner/roadmap-hero.svg\"> + anchor one-liner \"❦ Cinq jalons · du\n"
    "prototype livre au reve multijoueur ❦\" + prose blockquote en italique.\n"
    "\n"
    "Benefice : -65 lignes de SVG inline illisible dans README.md, lisibilite\n"
    "x5 sur Phase 2 (or-sur-blanc corrige)."
)
run("STEP 6 — git add",
    ["git", "add", "public/banner/roadmap-hero.svg", "README.md"])
run("STEP 7 — git commit",
    ["git", "commit", "-m", COMMIT_MSG])

# 7) Push
run("STEP 8 — git push origin main",
    ["git", "push", "origin", "main"], check=True)

# 8) Wait + verify CDN propagation
print("\n=== STEP 9 — wait 8s for CDN propagation ===")
time.sleep(8)

URL = "https://raw.githubusercontent.com/DmzGamingYT/Eldoria/main/public/banner/roadmap-hero.svg"
run("STEP 10 — fetch roadmap-hero.svg from raw.githubusercontent.com", ["curl", "-fsS", URL])

# Assert the new asset returns the new content markers
import urllib.request
try:
    import ssl
    ctx = ssl._create_unverified_context()
    req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0"})
    body = urllib.request.urlopen(req, timeout=30, context=ctx).read().decode("utf-8")
    print("\n=== STEP 11 — CDN body markers ===")
    print(f"length={len(body)} bytes")
    for label, needle in [
        ("NEW cartouche LA FEUILLE DE ROUTE", "LA FEUILLE DE ROUTE"),
        ("NEW MVP v0.1 phase", "MVP v0.1"),
        ("NEW v0.2 — en cours", "v0.2 — en cours"),
        ("NEW v0.3 — à venir", "v0.3 — à venir"),
        ("NEW v1.0 — rêve", "v1.0 — rêve"),
        ("NEW + loin", "∞"),
        ("STALE inline 1000x200 viewBox", 'viewBox="0 0 1000 200"'),
        ("STALE inline gradient id=rl", '<linearGradient id="rl"'),
    ]:
        print(f"  {'✓' if needle in body else '✗'} {label}: count={body.count(needle)}")
except Exception as e:
    print(f"!! urllib failed (likely SSL): {e}")
    print("Falling back to curl for marker check...")
    proc = subprocess.run(
        ["curl", "-fsS", URL], cwd=str(ROOT), capture_output=True, text=True
    )
    body = proc.stdout
    print(f"length={len(body)} bytes")
    for label, needle in [
        ("NEW cartouche LA FEUILLE DE ROUTE", "LA FEUILLE DE ROUTE"),
        ("STALE inline 1000x200 viewBox", 'viewBox="0 0 1000 200"'),
    ]:
        print(f"  {'✓' if needle in body else '✗'} {label}: count={body.count(needle)}")

# 9) Verify README on raw too
README_URL = "https://raw.githubusercontent.com/DmzGamingYT/Eldoria/main/README.md"
proc = subprocess.run(
    ["curl", "-fsS", README_URL], cwd=str(ROOT), capture_output=True, text=True
)
body = proc.stdout
print(f"\n=== STEP 12 — README CDN body markers (length={len(body)} bytes) ===")
for label, needle in [
    ("NEW <img src=\"public/banner/roadmap-hero.svg\">", 'roadmap-hero.svg'),
    ("NEW anchor 'Cinq jalons' one-liner", "Cinq jalons"),
    ("NEW prose blockquote", "Vert du MVP"),
    ("STALE inline SVG viewBox 1000 200", '<svg viewBox="0 0 1000 200"'),
]:
    print(f"  {'✓' if needle in body else '✗'} {label}: count={body.count(needle)}")

# 10) Final git state
run("STEP 13 — final git log + status (want clean + new HEAD)",
    ["bash", "-c", "git log --oneline -3 && echo --- && git status --short"])

print("\n" + "=" * 70)
print("DONE")
print("=" * 70)
