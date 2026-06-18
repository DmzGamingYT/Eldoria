#!/usr/bin/env python3
"""Push roadmap-hero.svg v5 to origin/main with full CDN verification."""
import subprocess, time, urllib.request, sys

ROOT = "/Users/alessioinnangi/Desktop/Projets/Jeux/Eldoria"

def run(label, cmd, capture=True, check=False):
    print(f"\n{'='*70}\n{label}\n{'='*70}")
    r = subprocess.run(cmd, cwd=ROOT, capture_output=capture, text=True)
    if r.stdout.strip(): print(r.stdout)
    if r.stderr.strip(): print("STDERR:", r.stderr, file=sys.stderr)
    if check and r.returncode != 0:
        print(f"❌ {label} FAILED (exit {r.returncode})"); sys.exit(1)
    print(f"→ exit {r.returncode}")
    return r.returncode

# ── A. Pre-flight: xmllint + size ──
run("A. xmllint + file stats",
    ["bash", "-c", "xmllint --noout public/banner/roadmap-hero.svg && echo XML_OK; ls -la public/banner/roadmap-hero.svg; wc -l public/banner/roadmap-hero.svg"])

# ── B. Internal marker verification ──
run("B. v5 internal markers (all should be ≥1, atomic counts should be 5)",
    ["bash", "-c", """
echo '--- textLength occurrences (should be high, all text constrained) ---'
grep -c 'textLength=' public/banner/roadmap-hero.svg
echo '--- lengthAdjust occurrences ---'
grep -c 'lengthAdjust=' public/banner/roadmap-hero.svg
echo '--- translate(0 -60) count (must=5) ---'
grep -c 'transform="translate(0 -60)"' public/banner/roadmap-hero.svg
echo '--- translate(0 -80) stale count (must=0) ---'
grep -c 'transform="translate(0 -80)"' public/banner/roadmap-hero.svg || true
echo '--- 5 phase anchor translates (140/380/650/920/1170 within 175) ---'
grep -cE 'transform="translate\\((140|380|650|920|1170) 175\\)"' public/banner/roadmap-hero.svg
echo '--- footer ornament fix (lines at -260/-210 and 210/260) ---'
grep -c 'x1="-260" y1="0" x2="-210"' public/banner/roadmap-hero.svg
grep -c 'x1="210" y1="0" x2="260"' public/banner/roadmap-hero.svg
echo '--- phase 5 subtitle plaque ---'
grep -c 'un horizon à inventer' public/banner/roadmap-hero.svg
echo '--- subtitle header texts (sans ornament glyphs) ---'
grep -cE 'MONOÏDE 3D|QUATERNIUS LIVE|ARBRE DE TALENTS|MULTIJOUEUR COOPÉRATIF' public/banner/roadmap-hero.svg
"""])

# ── C. Git state pre-commit ──
run("C. git status before commit",
    ["git", "status", "--short"])

# ── D. Commit + push ──
run("D. git add roadm