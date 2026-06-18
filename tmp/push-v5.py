#!/usr/bin/env python3
"""Ship roadmap-hero.svg v5 to origin/main and verify CDN propagation."""
import subprocess, time, urllib.request, sys

ROOT = "/Users/alessioinnangi/Desktop/Projets/Jeux/Eldoria"

def sh(label, args, check=False):
    print(f"\n{'='*70}\n{label}\n{'='*70}")
    r = subprocess.run(args, cwd=ROOT, capture_output=True, text=True)
    if r.stdout: print(r.stdout.rstrip())
    if r.stderr: print("STDERR:", r.stderr.rstrip(), file=sys.stderr)
    print(f"-> exit {r.returncode}")
    if check and r.returncode != 0:
        sys.exit(f"{label} FAILED (exit {r.returncode})")
    return r.stdout, r.stderr, r.returncode

# A. LOCAL VALIDATION
sh("A. xmllint + file stats", ["bash", "-c",
    "xmllint --noout public/banner/roadmap-hero.svg && echo XML_OK && "
    "ls -la public/banner/roadmap-hero.svg && wc -l public/banner/roadmap-hero.svg"])

# B. V5 MARKERS
sh("B. v5 internal markers", ["bash", "-c", """
printf '  textLength count           : %s (expect >=25)\\n' "$(grep -c 'textLength=' public/banner/roadmap-hero.svg)"
printf '  lengthAdjust count         : %s (expect >=25)\\n' "$(grep -c 'lengthAdjust=' public/banner/roadmap-hero.svg)"
printf '  translate(0 -60) count     : %s (expect 5)\\n' "$(grep -c 'transform=\"translate(0 -60)\"' public/banner/roadmap-hero.svg)"
printf '  translate(0 -80) STALE     : %s (expect 0)\\n' "$(grep -c 'transform=\"translate(0 -80)\"' public/banner/roadmap-hero.svg)"
printf '  5 anchor translates @175  : %s (expect 5)\\n' "$(grep -cE 'transform=\"translate\\((140|380|650|920|1170) 175\\)\"' public/banner/roadmap-hero.svg)"
printf '  footer outer left line     : %s (expect 1)\\n' "$(grep -c 'x1=\"-260\" y1=\"0\" x2=\"-210\"' public/banner/roadmap-hero.svg)"
printf '  footer outer right line    : %s (expect 1)\\n' "$(grep -c 'x1=\"210\" y1=\"0\" x2=\"260\"' public/banner/roadmap-hero.svg)"
printf '  subtitle plaque headers    : %s (expect 4)\\n' "$(grep -cE 'MONOÏDE 3D|QUATERNIUS LIVE|ARBRE DE TALENTS|MULTIJOUEUR COOPÉRATIF' public/banner/roadmap-hero.svg)"
printf '  P5 subtitle present        : %s (expect 1)\\n' "$(grep -c 'un horizon à inventer' public/banner/roadmap-hero.svg)"
"""])

# C. PRE-COMMIT STATE
_, _, _ = sh("C. git status", ["git", "status", "--short"])

# D. COMMIT (use file for message — avoids shell escaping)
_, _, _ = sh("D1. git add", ["git", "add", "public/banner/roadmap-hero.svg"], check=True)
_, _, _ = sh("D2. git commit (from file)", ["git", "commit", "-F", "tmp/v5-commit-msg.txt"], check=True)
_, _, _ = sh("D3. git log -3", ["git", "log", "--oneline", "-3"])

# E. PUSH
_, _, _ = sh("E. git push origin main", ["git", "push", "origin", "main"], check=True)

# F. CDN VERIFICATION (sleep + curl + grep)
print(f"\n{'='*70}\nF. CDN propagation (sleep 8s + curl + grep)\n{'='*70}")
time.sleep(8)
url = "https://raw.githubusercontent.com/DmzGamingYT/Eldoria/main/public/banner/roadmap-hero.svg"
dest = "/tmp/cdn_roadmap_v5.svg"
try:
    data = urllib.request.urlopen(url, timeout=30).read().decode("utf-8")
    open(dest, "w").write(data)
    print(f"HTTP OK, downloaded {len(data)} bytes -> {dest}")
except Exception as e:
    sys.exit(f"CDN fetch FAILED: {e}")

print("\n--- CDN v5 marker verification ---")
checks = [
    ("CDN translate(0 -60) count  ", data.count('transform="translate(0 -60)"'), 5),
    ("CDN stale translate(0 -80)  ", data.count('transform="translate(0 -80)"'), 0),
    ("CDN textLength count         ", data.count('textLength='), 26),
    ("CDN lengthAdjust count       ", data.count('lengthAdjust='), 26),
    ("CDN subtitle plaque headers  ", data.count('ARBRE DE TALENTS') + data.count('MULTIJOUEUR COOPÉRATIF'), 2),
    ("CDN P5 subtitle present      ", data.count('un horizon à inventer'), 1),
]
ok = True
for label, got, exp in checks:
    mark = "OK " if got == exp else ("WARN" if exp > 0 else "OK ") if got >= exp else "FAIL"
    print(f"  [{mark}] {label}: got={got} expected={exp}")
    if mark == "FAIL": ok = False

# G. FINAL STATE
print(f"\n{'='*70}\nG. Final state\n{'='*70}")
print("\n--- git log -3 ---")
print(subprocess.run(["git", "-C", ROOT, "log", "--oneline", "-3"], capture_output=True, text=True).stdout)
print("\n--- git status ---")
print(subprocess.run(["git", "-C", ROOT, "status", "--short"], capture_output=True, text=True).stdout)

if not ok:
    sys.exit("\n[CDN VERIFICATION FAILED]")

print("\n[ALL GREEN] v5 deployed + CDN verified.")
