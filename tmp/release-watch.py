#!/usr/bin/env python3
"""Poll for the release workflow run triggered by tag v0.2.0, watch it to
completion, then dump the GitHub Release v0.2.0 asset inventory + CDN HTTP
checks. Uses gh CLI polling (more robust than REST token plumbing).

Designed to block ~10-20 min for the 3-runner matrix to finish.
"""
import subprocess
import json
import sys
import re
import time
from pathlib import Path

REPO_DIR = "/Users/alessioinnangi/Desktop/Projets/Jeux/Eldoria"
TAG = "v0.2.0"


def run(args, label, cwd=None, timeout=60):
    r = subprocess.run(args, cwd=cwd or REPO_DIR, capture_output=True, text=True, timeout=timeout)
    return r


def find_run_id_for_tag(tag):
    """Poll gh run list until a run referencing the tag appears, then return its id.
    GitHub typically registers the run ~15-90 s after the tag push event.
    """
    print(f"[{label_find}] polling gh run list for the workflow run triggered by tag {tag}...")
    deadline = time.time() + 180  # 3 minutes max
    attempt = 0
    while time.time() < deadline:
        attempt += 1
        r = run(
            ["gh", "run", "list", "--workflow=release.yml",
             "--json", "databaseId,status,conclusion,name,headBranch,displayTitle,createdAt,headSha",
             "--limit", "20"],
            label_find,
            timeout=30,
        )
        if r.returncode != 0:
            print(f"  attempt {attempt}: gh failed: {r.stderr.strip()[:200]}")
            time.sleep(8)
            continue
        try:
            runs = json.loads(r.stdout)
        except json.JSONDecodeError:
            print(f"  attempt {attempt}: gh returned non-JSON")
            time.sleep(8)
            continue

        # Match: a release.yml run whose displayTitle or headBranch mentions v0.2.0,
        # or whose headSha points at the v0.2.0 tag.
        for run_obj in runs:
            blob = " ".join(str(x) for x in run_obj.values())
            if tag in blob:
                print(f"  attempt {attempt}: found candidate run: id={run_obj['databaseId']} status={run_obj['status']}")
                return run_obj
        print(f"  attempt {attempt}: no run yet for tag {tag} ({len(runs)} runs total)")
        time.sleep(10)

    raise RuntimeError(f"No run found for tag {tag} after 3 minutes")


label_find = "find-run"


def main():
    target_run = find_run_id_for_tag(TAG)
    run_id = target_run["databaseId"]
    print(f"\n>>> Targeting run id={run_id} status={target_run['status']}\n")

    # Watch blocking until completion. --exit-status makes gh exit 0 only on success.
    print(f"========================================================")
    print(f"  Watching run {run_id} until completion...")
    print(f"  (max ~15 minutes — stay calm)")
    print(f"========================================================\n")

    r = run(
        ["gh", "run", "watch", str(run_id), "--exit-status", "--interval", "30"],
        "watch",
        timeout=2000,  # 33 minutes ceiling
    )
    print(f"\n[watch] exit={r.returncode}")
    if r.stdout.strip(): print(f"  stdout: {r.stdout.strip()[:1000]}")
    if r.stderr.strip(): print(f"  stderr: {r.stderr.strip()[:500]}")

    if r.returncode != 0:
        print(f"\n❌ workflow run did NOT succeed — release job likely failed. Inspect:")
        print(f"   https://github.com/DmzGamingYT/Eldoria/actions/runs/{run_id}")
        sys.exit(1)

    # Verify the GitHub Release v0.2.0 exists with assets
    print("\n>>> Verifying GitHub Release v0.2.0 ...")
    r = run(
        ["gh", "release", "view", TAG,
         "--json", "tagName,name,publishedAt,author,url,assets"],
        "release-view",
        timeout=30,
    )
    if r.returncode != 0:
        print(f"❌ gh release view failed: {r.stderr.strip()[:600]}")
        sys.exit(2)

    rel = json.loads(r.stdout)
    print(f"  ✅ Release {rel['tagName']} = {rel['name']}")
    print(f"  ✅ Published: {rel['publishedAt']}")
    print(f"  ✅ URL: {rel['url']}")
    print(f"  ✅ Asset count: {len(rel['assets'])}")
    print()
    print("  ┌──── Assets attached ────────────────────────────────")
    for asset in rel["assets"]:
        size_mb = asset.get("size", 0) / 1024 / 1024
        print(f"  │  {asset['name']:50s}  {size_mb:6.1f} MB")
        print(f"  │     → {asset['url']}")
    print("  └────────────────────────────────────────────────────")
    print()

    # CDN HTTP checks on every installer URL
    print(">>> CDN HTTP checks (curl latest/download/...)")
    base = f"https://github.com/DmzGamingYT/Eldoria/releases/latest/download"
    for asset in rel["assets"]:
        # GitHub /releases/latest/download/ FILENAME redirects to the actual signed asset.
        url = f"{base}/{asset['name']}"
        r = run(["curl", "-sLI", "-o", "/dev/null", "-w", "%{http_code} %{size_download}", url], "curl", timeout=30)
        code_size = r.stdout.strip()
        code = code_size.split(" ")[0] if " " in code_size else code_size
        mark = "✅" if code == "200" else f"❌ ({code})"
        print(f"  {mark}  {code_size:>15s}  {url}")

    print("\n>>> Done.")


if __name__ == "__main__":
    main()
