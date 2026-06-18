#!/usr/bin/env python3
"""Non-blocking status check for the release triggered by tag v0.2.0.

Steps (all called once, no polling):
  1. `gh run list --workflow=release.yml` — find the v0.2.0-triggered run
  2. `gh run view <id> --json jobs,status,conclusion,createdAt,updatedAt,headBranch,displayTitle`
     -> per-OS status (Windows / macOS / Linux build jobs + Release publish job)
  3. If status == "completed":
       3a. `gh release view v0.2.0 --json assets` — list attached installers
       3b. group assets by platform (windows/macos/linux) for readable output
       3c. CDN HEAD-check each -> HTTP code

This script NEVER blocks on `gh run watch` — total runtime target <90 s.
"""
import json
import re
import subprocess
import sys
import time

REPO_DIR = "/Users/alessioinnangi/Desktop/Projets/Jeux/Eldoria"
TAG = "v0.2.0"


def gh(*args, timeout=30):
    return subprocess.run(["gh", *args], cwd=REPO_DIR, capture_output=True, text=True, timeout=timeout)


def curl_head(url, timeout=15):
    return subprocess.run(
        ["curl", "-sLI", "-o", "/dev/null", "-w", "%{http_code}", url],
        capture_output=True, text=True, timeout=timeout,
    )


def platform_of(asset_name):
    n = asset_name.lower()
    if any(suffix in n for suffix in ("win-", "win32", ".exe")):
        return "🪟 WINDOWS"
    if any(suffix in n for suffix in ("mac-", "macos", ".dmg", "darwin")):
        return "🍎 MACOS"
    if any(suffix in n for suffix in ("linux-", "linux64", ".appimage", ".deb", ".rpm", "linux")):
        return "🐧 LINUX"
    return "📦 AUTRE"


def fmt_duration(seconds):
    if seconds is None:
        return "?"
    m, s = divmod(int(seconds), 60)
    return f"{m}m{s:02d}s"


def main():
    print(f"=== 1. Find the v0.2.0-triggered run on workflow release.yml ===\n")
    deadline = time.time() + 60  # give it 1 minute max to appear in API
    target = None
    while time.time() < deadline:
        r = gh(
            "run", "list",
            "--workflow=release.yml",
            "--json", "databaseId,status,conclusion,name,headBranch,displayTitle,createdAt,headSha",
            "--limit", "10",
            timeout=20,
        )
        if r.returncode != 0:
            print(f"  gh list failed: {r.stderr.strip()[:200]}")
            time.sleep(8)
            continue
        try:
            runs = json.loads(r.stdout)
        except json.JSONDecodeError:
            print(f"  gh returned non-JSON, sleeping")
            time.sleep(8)
            continue

        for run_obj in runs:
            blob = " ".join(str(x) for x in run_obj.values())
            if TAG in blob or (run_obj.get("headBranch") == TAG):
                target = run_obj
                break
        if target:
            break
        print(f"  no run for {TAG} yet ({len(runs)} runs total) — sleeping 8 s")
        time.sleep(8)

    if not target:
        print(f"\n❌ No run found for tag {TAG} after 60 s.")
        print(f"   This is normal if the API takes longer to register the run.")
        print(f"   Try again in a few minutes, or check: gh run list --workflow=release.yml --limit 3")
        sys.exit(1)

    run_id = target["databaseId"]
    print(f"\n  ✅ Found run id={run_id}")
    print(f"     status:        {target['status']}")
    print(f"     conclusion:    {target.get('conclusion') or '—pending—'}")
    print(f"     headBranch:    {target.get('headBranch')}")
    print(f"     displayTitle:  {target.get('displayTitle')}")
    print(f"     createdAt:     {target.get('createdAt')}")

    print(f"\n=== 2. Per-job breakdown (Jobs of run {run_id}) ===\n")
    r = gh(
        "run", "view", str(run_id),
        "--json", "jobs,status,conclusion,createdAt,updatedAt",
        timeout=30,
    )
    if r.returncode != 0:
        print(f"❌ gh run view failed: {r.stderr.strip()[:400]}")
        sys.exit(2)

    view = json.loads(r.stdout)
    print(f"  ✅ Run overall status: {view['status']} / conclusion: {view.get('conclusion') or '—'}")
    print(f"     createdAt: {view.get('createdAt')}  updatedAt: {view.get('updatedAt')}")
    print()
    print(f"  ┌──── Per-job status ────────────────────────────────────────")
    print(f"  │  {'JOB':36s}  {'STATUS':12s}  {'CONCL':10s}  {'DURATION':9s}")
    print(f"  ├─────────────────────────────────────────────────────────────")
    for job in view["jobs"]:
        name = (job.get("name") or "")[:36]
        st = (job.get("status") or "?")[:12]
        co = (job.get("conclusion") or "running…")[:10]
        dur = fmt_duration(job.get("durationSeconds"))
        print(f"  │  {name:36s}  {st:12s}  {co:10s}  {dur:9s}")
    print(f"  └─────────────────────────────────────────────────────────────")

    if view["status"] != "completed":
        print(f"\n⚠️ Workflow run is still {view['status']}. NOT polling further.")
        print(f"   Re-run this script later to refresh status.")
        print(f"   Or wait + then check: gh run view {run_id}")
        sys.exit(3)

    if view.get("conclusion") != "success":
        print(f"\n❌ Workflow run finished but with conclusion '{view.get('conclusion')}'.")
        print(f"   Inspect failing jobs: gh run view {run_id} --log-failed")
        sys.exit(4)

    # Job success — verify release + assets
    print(f"\n=== 3. Verify GitHub Release {TAG} ===\n")
    r = gh("release", "view", TAG,
           "--json", "tagName,name,publishedAt,author,url,assets",
           timeout=30)
    if r.returncode != 0:
        print(f"❌ gh release view failed: {r.stderr.strip()[:400]}")
        sys.exit(5)

    rel = json.loads(r.stdout)
    print(f"  ✅ Release {rel['tagName']} = {rel['name']}")
    print(f"     Published: {rel['publishedAt']}")
    print(f"     URL:       {rel['url']}")
    print(f"     Assets:    {len(rel['assets'])}")

    # Group by platform
    by_platform = {"🪟 WINDOWS": [], "🍎 MACOS": [], "🐧 LINUX": [], "📦 AUTRE": []}
    for asset in rel["assets"]:
        plat = platform_of(asset["name"])
        by_platform[plat].append(asset)

    print(f"\n=== 4. Assets grouped by platform (3-plateformes séparées) ===\n")
    for plat in ["🪟 WINDOWS", "🍎 MACOS", "🐧 LINUX", "📦 AUTRE"]:
        items = by_platform[plat]
        if not items: continue
        print(f"  {plat}  ({len(items)} installeur(s))")
        for a in items:
            size_mb = (a.get("size") or 0) / 1024 / 1024
            print(f"       • {a['name']:48s} {size_mb:6.1f} MB  → {a['url']}")
        print()

    # CDN HTTP checks for each
    print(f"=== 5. CDN HTTP check on /releases/latest/download/<asset> ===\n")
    full_set = []
    for plat_items in by_platform.values():
        full_set.extend(plat_items)
    if not full_set:
        print("  ⚠️ No assets attached — release publish job likely failed")
        sys.exit(6)

    base = "https://github.com/DmzGamingYT/Eldoria/releases/latest/download"
    working = 0
    for asset in full_set:
        url = f"{base}/{asset['name']}"
        r = curl_head(url, timeout=15)
        code = r.stdout.strip()
        try:
            code_int = int(code)
        except ValueError:
            code_int = -1
        mark = "✅" if code_int == 200 else f"❌ ({code})"
        if code_int == 200:
            working += 1
        print(f"  {mark}  HTTP {code:>4s}  {asset['name']}")

    print(f"\n=== SUMMARY ===")
    print(f"  ✅ Workflow finished with status: completed / conclusion: success")
    print(f"  ✅ GitHub Release {rel['tagName']} = {rel['name']} published")
    print(f"  ✅ {working}/{len(full_set)} installer download URLs return HTTP 200")
    win_present = bool(by_platform['🪟 WINDOWS'])
    mac_present = bool(by_platform['🍎 MACOS'])
    linux_present = bool(by_platform['🐧 LINUX'])
    print(f"  {'✅' if win_present else '❌'} Windows installers present  ({len(by_platform['🪟 WINDOWS'])})")
    print(f"  {'✅' if mac_present else '❌'} macOS installers present    ({len(by_platform['🍎 MACOS'])})")
    print(f"  {'✅' if linux_present else '❌'} Linux installers present    ({len(by_platform['🐧 LINUX'])})")
    if not (win_present and mac_present and linux_present):
        print(f"\n❌ One platform missing installers — investigate the matrix job for that OS.")
        sys.exit(7)


if __name__ == "__main__":
    main()
