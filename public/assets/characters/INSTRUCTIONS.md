# How to finish the Quaternius pack import

Two of the three packs are CC0 but itch.io forces a one-time interactive claim
step before serving the ZIPs (no auth-less CDN, no GitHub mirror). Once the
ZIPs are on disk, this helper script will pick out only the `.glb` meshes that
Eldoria needs and dispose of the per-platform FBX/Godot/Blender source variants.

---

## Step 1 — claim the two packs on itch.io

Open these two pages in your browser, click **"Download Now"**, then **"No
thanks, just take me to the downloads"**, and grab the Standard ZIP each:

1. **Universal Base Characters** — https://quaternius.itch.io/universal-base-characters
2. **Modular Character Outfits · Fantasy** — https://quaternius.itch.io/modular-character-outfits-fantasy

## Step 2 — drop both ZIPs anywhere on disk

You can put them anywhere — `Downloads/`, your Desktop, a `/tmp/imports/`
folder — and tell me the path(s). The extracted archive's filenames change
between Quaternius releases; do not guess them. Let the extraction helper
find the right meshes by reading the archive's manifest.

## Step 3 — what I will do once you tell me where the ZIPs are

For each ZIP:

1. Extract the top-level folder.
2. Drop the `Unity/`, `Godot/`, `Blender/`, `Maya/`, `Sources/`, `FBX/` and any
   `.mtl` / `.obj` / `.blend` files. Eldoria is GLB-only and Three.js loads
   `.glb` natively.
3. From the `Unreal-Godot/` subtree (the directory Quaternius consistently
   ships for game-engine use), copy the meshes that match our 5 archetypes:
   - 1 humanoid base + 1 selected hairstyle per character
   - The Knight armor set (hero)
   - The Wizard / Sage robe set (Eldric, Mireille)
   - The Hood + Leather ranger set (Saela)
   - The Civilian / merchant set (Brynn)
4. Place each kept mesh in its target subfolder per CREDITS.md §2 + §3.
5. Update CREDITS.md to flip "PENDING" → "DONE" for each fully-imported pack.

## Step 4 — after import, wire into source

The next refactor pass will rewrite `Player.tsx` (hero) and `Npc.tsx` (4 NPCs)
to load the imported `.glb`s via `@react-three/drei` `useGLTF` + `useAnimations`,
mapping the existing animation refs (capeRef, armRef, legRef, …) onto the GLB
skeleton node names. Animations are already imported (`Universal Animation
Library 2`) and the same Universal-Humanoid bone names keep both regions
compatible.

## Step 5 — Draco compression check

Quaternius newer bundles ship meshes with `KHR_draco_mesh_compression` baked
in. If you import a Draco-compressed GLB, `useGLTF` will throw unless you
configure the decoder path first:

1. Copy the three.js Draco WASM + JS worker into the project:
   `mkdir -p public/draco && cp node_modules/three/examples/jsm/libs/draco/*.{js,wasm} public/draco/`
   (drei does NOT bundle a Draco worker — it ships with three.js at
   `three/examples/jsm/libs/draco/`.)
2. In `src/game/player/Npc.tsx`, just before `NpcVariant`'s `useGLTF` calls
   (or `useGLTF.preload`), add a guarded setup so the loader only points at
   `/draco/` when the worker is actually on disk:
   ```ts
   if (typeof window !== "undefined") {
     fetch("/draco/draco_decoder.wasm", { method: "HEAD" })
       .then((r) => { if (r.ok) useGLTF.setDecoderPath("/draco/"); })
       .catch(() => { /* silent: no Draco worker yet, gzip-default path */ });
   }
   ```
3. Suspect Draco if you see `Error: KHR_draco_mesh_compression extension
   required` in the console when `useGLTF` resolves.

The Universal Animation Library 2 Standard variant we already imported is
NOT Draco-compressed (parsed cleanly without `setDecoderPath`), so this is a
forward-compatibility note for the next two packs.
