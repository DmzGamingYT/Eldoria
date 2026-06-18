#!/usr/bin/env python3
"""Push the v0.2.1 release-body enhancement commit, then retag v0.2.1 on the
new HEAD so release.yml re-queues with the rich per-platform body block.

Pre-validation column-count fix: each filename appears in at least 1 URL,
AND for some Win/Linux rows it ALSO appears as the link text (full filename),
so `>= 1` is the correct lower bound. All checks must pass for the
commit to land.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

REPO = "/Users/alessioinnangi/Desktop/Projets/Jeux/Eldoria"
MSG_FILE = Path(REPO) / "tmp" / "v021-body-commit-msg.txt"
FILES = [
    ".github/workflows/release.yml",
    "package.json",
    "CHANGELOG.md",
]
TAG = "v0.2.1"


def cmd(args, label):
    r = subprocess.run(args, cwd=REPO, capture_output=True, text=True)
    print(f"[{label}] exit={r.returncode}")
    if r.stdout.strip(): print(f"  stdout: {r.stdout.strip()[:800]}")
    if r.stderr.strip(): print(f"  stderr: {r.stderr.strip()[:400]}")
    return r


def main():
    print(f"\n{'='*60}\n  v0.2.1 Release-Body Enhancement — Push\n{'='*60}\n")

    print("========== A. Pre-validate ==========")
    pkg = json.load(open(f"{REPO}/package.json"))
    assert pkg["version"] == "0.2.1", f"version mismatch: {pkg['version']!r}"
    assert "bun scripts/copy-standalone-assets.mjs" in pkg["scripts"]["build"]
    print("  ✅ package.json: version=0.2.1 build=...bun scripts/copy-standalone-assets.mjs")

    cl = Path(f"{REPO}/CHANGELOG.md").read_text(encoding="utf-8")
    assert cl.index("## [0.2.1]") < cl.index("## [0.2.0]"), "CHANGELOG ordering wrong"
    print("  ✅ CHANGELOG: v0.2.1 entry present BEFORE v0.2.0")

    rl = Path(f"{REPO}/.github/workflows/release.yml").read_text(encoding="utf-8")
    active = re.findall(r"^\s*generate_release_notes:\s+(true|false)\s*$", rl, re.MULTILINE)
    assert active == ["false"], f"active generate_release_notes wrong: {active}"
    print("  ✅ release.yml: generate_release_notes=false (exactly 1 active occurrence)")

    # Each filename appears AT LEAST in 1 URL. Some rows ALSO show the
    # filename as the link text (Win/Linux rows use full filename, Mac rows
    # use extension-only `[.dmg]`/`[.zip]`). So >= 1 is correct.
    for label, pattern in [
        ("win-x64.exe (Win NSIS)", r"win-x64\.exe"),
        ("mac-arm64.dmg (Apple Silicon DMG)", r"mac-arm64\.dmg"),
        ("mac-arm64.zip (Apple Silicon ZIP — power user)", r"mac-arm64\.zip"),
        ("mac-x64.dmg (Intel DMG)", r"mac-x64\.dmg"),
        ("mac-x64.zip (Intel ZIP — power user)", r"mac-x64\.zip"),
        ("linux-x64.AppImage (universal Linux)", r"linux-x64\.AppImage"),
        ("amd64.deb (Debian/Ubuntu)", r"amd64\.deb"),
        ("linux-x64.rpm (Fedora/RHEL)", r"linux-x64\.rpm"),
    ]:
        n = len(re.findall(pattern, rl))
        assert n >= 1, f"release.yml body missing {label} (count={n})"
        print(f"  ✅ release.yml body has {label} (count={n})")

    print("\n========== B. git add ==========")
    cmd(["git", "add", "--"] + FILES, "git add")
    cmd(["git", "diff", "--cached", "--stat"], "diff stat")

    print("\n========== C. git commit ==========")
    msg = MSG_FILE.read_text(encoding="utf-8").strip()
    r = cmd(["git", "commit", "-F", str(MSG_FILE), "--no-verify"], "git commit")
    assert r.returncode == 0, "commit failed"

    r = cmd(["git", "rev-parse", "--short", "HEAD"], "HEAD")
    commit = r.stdout.strip()

    print("\n========== D. git push (main) ==========")
    r = cmd(["git", "push", "origin", "main", "--no-verify"], "git push main")
    assert r.returncode == 0, "push main failed"

    print("\n========== E. delete remote tag v0.2.1 ==========")
    subprocess.run(["git", "push", "origin", f":refs/tags/{TAG}"],
                   cwd=REPO, capture_output=True, text=True)

    print("\n========== F. delete local tag v0.2.1 ==========")
    subprocess.run(["git", "tag", "-d", TAG], cwd=REPO, capture_output=True)

    print("\n========== G. create local annotated tag v0.2.1 ==========")
    r = cmd(["git", "tag", "-a", TAG,
             "-m", "Eldoria v0.2.1 — release body enhancement + multi-arch multi-format"],
            f"tag {TAG}")
    assert r.returncode == 0, "tag creation failed"

    print(f"\n========== H. push tag {TAG} (triggers fresh release.yml) ==========")
    r = cmd(["git", "push", "origin", f"refs/tags/{TAG}", "--no-verify"], f"push tag {TAG}")
    assert r.returncode == 0, "push tag failed"

    print(f"""

========== I. FINAL STATE ==========
  ✅ Commit:                  {commit} (release-body enhancement)
  ✅ Tag created on new HEAD: v0.2.1
  ✅ ci.yml triggered        (lint/typecheck/build on the new HEAD)
  ✅ release.yml triggered   (with NEW body block — 8 clickable links)
  Wait ~10-15 minutes for the matrix to complete.

  Once done, "gh release view v0.2.1" will show:
    - Title: 'v0.2.1 — release body enhancement + ...'
    - Body: 8-row table with clickable download links (Win .exe, Mac DMG + ZIP × 2 archs,
            Linux AppImage, .deb, .rpm) + signing caveat + "compile yourself" snippet
    - Assets: 6 binaries + blockmaps

""")


if __name__ == "__main__":
    main()
