# Mukut 3D Helmet Compatibility Viewer

Interactive Three.js viewer that lets a visitor pick their helmet and see Mukut's modular components attached at their correct anchor positions. Answers "will Mukut fit MY helmet?" visually.

## Status — v1 scaffold

| Piece | State |
|---|---|
| Three.js code (scene, loader, anchors, ui) | ✅ Written (~700 LoC) |
| `data/helmets.json` — 10 helmet DB | ✅ Written, all attributions in place |
| `data/anchors.json` — anchor coordinates | ⚠ **Placeholder coords from 0.28m archetype** — eyeball-tune per helmet in browser dev-mode |
| `assets/helmets/*.glb` — 10 helmet GLBs | 🔴 **Manual download required** (see checklist below) |
| `assets/mukut/*.glb` — 4 Mukut component GLBs | 🔴 **Manual generate required** from `mechanical/openscad/*.scad` in the helmet repo |
| `assets/env/studio_small.hdr` — HDR env map | 🔴 **Manual download required** (Poly Haven, CC0) |
| Integration into `index.html` | ✅ Done — new `<section id="viewer">` between `#how` and `#specs` |

## Step 1 — Helmet GLBs (manual download, ~30-45 min)

Sketchfab requires login + per-model click. Tanay downloads, drops into `assets/helmets/<id>.glb`. License is CC-BY for all 10 → attribution panel renders automatically from `helmets.json`.

| `<id>.glb` | Source (click to download) | Expected size |
|---|---|---|
| `shoei_gt_air_2.glb` | [Sketchfab — Shoei GT-Air II by hellmakerkain](https://sketchfab.com/3d-models/shoei-gt-air-ii-970b0d29b77741a5a7b93e5ce1c492a7) | ~3-6 MB |
| `hjc_classic.glb` | [Sketchfab — Old HJC Helmet by leadblacktech](https://sketchfab.com/3d-models/old-hjc-helmet-8c767f4487c04f83843bcdae41e74085) | ~8-15 MB (scan, dense) |
| `arai_rx_7v.glb` | [Sketchfab — Arai RX-7V by gav11](https://sketchfab.com/3d-models/arai-rx-7v-9ad59273159e47679d9ec6f6fcd14d30) | ~4-8 MB |
| `arai_quantic.glb` | [Sketchfab — Arai Quantic by gamaxa](https://sketchfab.com/3d-models/helmet-arai-quantic-grey-d3e121af2acc4be397983a5a4ee0e872) | ~1-3 MB (low poly) |
| `bell_race_star_dlx.glb` | [Sketchfab — Bell Race Star DLX by gamaxa](https://sketchfab.com/3d-models/bell-race-star-flex-dlx-helmet-a79be38e5898479693ba35f288ea86d5) | ~1-2 MB (low poly) |
| `ls2_ff393.glb` | [Sketchfab — LS2 FF393 by daancoppens](https://sketchfab.com/3d-models/pbr-motorcycle-helm-ls2-ff393-e742b3acbbb24ed89b9d917ef20d8082) | ~1-2 MB (game res) |
| `scorpion_exo_r420.glb` | [Sketchfab — Scorpion EXO-R420 by harrymat](https://sketchfab.com/3d-models/scorpion-exo-r420-helmet-5786cf0502f14528ba018cd597e7dc49) | ~5-9 MB |
| `scorpion_exo_combat.glb` | [Sketchfab — Scorpion EXO-COMBAT by Marcin.Adamski](https://sketchfab.com/3d-models/scorpion-exo-combat) | ~5-9 MB |
| `generic_isi_class_1.glb` | [Sketchfab — Motorcycle Helmet (ramyouny)](https://sketchfab.com/3d-models/motorcycle-helmet-racing-helmet-b2ead0381b914a88810a8be9fc13f47a) | ~2-4 MB |
| `generic_isi_class_2.glb` | TBD — pick a different CC-BY generic full-face from Sketchfab; update `helmets.json` attribution | ~2-4 MB |

**Before you download each:** click into the model page, verify the license badge says "Download · CC Attribution" (NOT CC-BY-SA, NOT CC-BY-NC, NOT CC-BY-ND for v1). If a license differs from what `helmets.json` claims, update the JSON immediately.

**Compression** (recommended for mobile load times):
```bash
# Install once
npm i -g @gltf-transform/cli

# Per helmet, Draco + Meshopt + KTX2 squeeze
gltf-transform optimize input.glb output.glb --compress draco --texture-compress webp
```
Target: each helmet `<2 MB` after compression. The scan-based ones (HJC, Shoei GT-Air II) will need aggressive decimation — use `gltf-transform simplify` to drop to ~80k tris.

## Step 2 — Mukut component GLBs (manual generate, ~1-2 hr)

Source `.scad` files live in `Misc42/helmet:mechanical/openscad/`:
- `magnetic_base.scad` → produces the chin housing footprint
- `helmet_module.scad` → the overall module + electronics shell
- `battery_enclosure.scad` → the rear pod

Convert each to GLB:
```bash
# Install openscad
sudo apt install openscad           # Linux
brew install openscad                # macOS

# Render each .scad → STL
openscad -o chin_housing.stl --render mechanical/openscad/helmet_module.scad
openscad -o rear_pod.stl       --render mechanical/openscad/battery_enclosure.scad
# magnetic_base.scad is mount geometry, not a component — skip

# Convert STL → GLB (Three.js loads GLB natively; STL works too via STLLoader
# but GLB embeds materials cleanly)
npm i -g obj2gltf
# Or use Blender headless if you want PBR:
blender -b -P bake_to_glb.py -- chin_housing.stl chin_housing.glb
```

For `forehead_hud.glb` and `antenna.glb` (not in OpenSCAD yet) — author placeholder geometry in Blender or any free tool, ~10 min each. Sharp Memory LCD 1.3" = box `33 × 18 × 8 mm`; antenna cluster = three vertical `60 × 12 mm` cylinders stacked.

Drop final GLBs into `assets/mukut/`:
- `chin_housing.glb`
- `forehead_hud.glb`
- `rear_pod.glb`
- `antenna.glb`

Mounting convention (enforce, or anchor attachment breaks): **each component's mounting face at local origin, +Z = outward normal, +Y = up.** The Three.js `attachComponent()` function in `viewer/anchors.js` rotates the component into the helmet anchor frame assuming this convention.

## Step 3 — HDR env map (1 file, 30 sec)

Download from Poly Haven (CC0):
```bash
mkdir -p assets/env
curl -L 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_03_1k.hdr' -o assets/env/studio_small.hdr
```

This single 1k HDR (~1 MB) makes PBR materials sing without needing 5 dynamic directional lights. PMREM-processed once at boot.

## Step 4 — Eyeball anchor coordinates (browser dev-mode)

Open `https://misc42.github.io/mukut/?debug=1` (or local dev: `python3 -m http.server` in repo root, then `http://localhost:8000/?debug=1`).

For each of the 10 helmets:
1. Pick the helmet from the picker
2. Axes gizmos render at each anchor — chin / forehead_hud / rear_pod / antenna
3. Each Mukut component is positioned at its anchor — see if it visually lands on the right surface
4. If off: open `data/anchors.json`, tweak the `pos` / `normal` / `tangent_up` for that helmet's anchor, save, refresh browser
5. Iterate ~5 min per helmet × 10 = ~50 min total

Coordinate system reminder:
- Origin = helmet base-ring center (where it meets neck)
- +Y = up
- +Z = forward (face direction)
- Units = meters
- `pos` = absolute coords of the anchor point on the shell surface
- `normal` = outward surface normal at that point (unit vector)
- `tangent_up` = surface-up direction (perpendicular to normal, points roughly toward crown)

## Step 5 — Commit + push

```bash
git add data/ viewer/ assets/ index.html
git commit -m "Add 3D helmet compatibility viewer — Three.js parametric anchor attachment"
git push origin main
# GitHub Pages auto-builds in ~30-60 s; live at misc42.github.io/mukut/
```

## Local dev

```bash
# Static server from repo root
python3 -m http.server 8000
# Open http://localhost:8000/
```

The viewer uses ES modules + importmap → no build step. Three.js loads from jsdelivr CDN. Refresh after each `anchors.json` edit; no hot-reload but the JSON re-fetches on each pick.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Black canvas | WebGL init failed | Check console; ensure WebGL is enabled (not Intel old GPU on Linux without driver) |
| Helmet loads but Mukut components nowhere visible | Anchors stub coords don't match helmet origin | Add `?debug=1`, see if gizmos render; if not, anchors.json entry missing or helmet origin wrong |
| Mukut component points wrong way | GLB authored without `+Z = mounting normal` convention | Re-author in Blender (rotate the mounting face to +Z=forward) |
| Anchor gizmo visible but component off-place | `normal` + `tangent_up` not perpendicular | Run `Vector3.cross()` math in console; eyeball-tweak until perpendicular |
| Sketchfab GLB 404 in console | Asset not in `assets/helmets/` | Re-download manually from Sketchfab URL in `helmets.json` |
| Cross-origin error on HDR | CORS blocking Poly Haven domain (rare) | Download locally, serve from `assets/env/` |

## Future work (v1.5+)

- AR mode via `<model-viewer>` shim for iOS Quick Look (USDZ pipeline)
- Wireframe toggle for "x-ray" view inside helmet
- Exploded view animation (lerp components along anchor normals)
- Shareable URLs: `?helmet=shoei-gt-air-2`
- Visual-regression CI via Puppeteer + pixelmatch
- Blender Python add-on for anchor authoring (currently hand-edit JSON)
- Real Mukut PBR renders (currently saffron-tinted OpenSCAD geometry)
