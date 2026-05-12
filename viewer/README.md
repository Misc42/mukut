# Mukut 3D Helmet Compatibility Viewer

Interactive Three.js viewer for the Mukut landing page. User picks a helmet, sees Mukut's modular components attached at parametric anchor points.

## Status

| Piece | State |
|---|---|
| Three.js code (scene, loader, anchors, ui, fallback) | ✅ Written (~900 LoC) |
| `data/helmets.json` — 9 verified Sketchfab-downloadable slots | ✅ All slots audited via Sketchfab v3 API |
| `data/anchors.json` — anchor coordinates | ⚠ **Placeholder coords** — eyeball-tune per helmet via `?debug=1` |
| `assets/_demo/damaged_helmet.glb` — universal placeholder (Khronos CC-BY) | ✅ Committed (3.6 MB) |
| `assets/helmets/<id>.glb` — 9 real motorcycle helmet GLBs | 🔴 **Manual Sketchfab download required** |
| `assets/mukut/*.glb` — 4 Mukut component GLBs | 🔴 Procedural placeholder used (saffron primitives) until OpenSCAD → STL → GLB pipeline runs |
| `assets/env/studio_small.hdr` — HDR env map | 🟡 Optional — viewer works without it, lighting falls back to AmbientLight + DirectionalLight |
| Live page | ✅ https://misc42.github.io/mukut/ — viewer section mid-page |

## How the fallback chain works

1. User picks helmet → viewer tries to load `assets/helmets/<id>.glb`
2. If 404 → loads `assets/_demo/damaged_helmet.glb` + shows "Demo placeholder" banner
3. If THAT also fails → renders error message
4. Same anchors apply in all cases (eyeball-tune per real helmet later)

So the viewer always renders SOMETHING — visitor never sees a broken state.

## Manual helmet GLB download (9 slots, ~1-2 hr Tanay-time)

⚠ **All 9 URLs below are Sketchfab-API-verified as downloadable (`isDownloadable: true`).** The previous batch of URLs (Shoei GT-Air II by hellmakerkain etc.) was **75% non-downloadable preview-only** — those are dead, don't reuse.

For each slot below:
1. Click the Sketchfab URL
2. Login to Sketchfab (free account)
3. Click "Download 3D Model" → pick **glTF** format → download `.glb`
4. Run `gltf-transform optimize input.glb output.glb --compress draco --texture-compress webp --simplify 0.5` (decimates ~60% — these models are heavy, 200k-700k faces)
5. Save as `assets/helmets/<id>.glb` per the table below
6. `git add assets/helmets/<id>.glb && git commit -m "ingest <brand> helmet" && git push`
7. Pages auto-rebuild; refresh viewer — your real GLB swaps the demo placeholder

| `<id>.glb` (target filename) | Brand · Model | Sketchfab URL | Author | License | Raw faces |
|---|---|---|---|---|---|
| `bell_moto_iii.glb` | Bell · MOTO III | [`7c4b35c5...`](https://sketchfab.com/3d-models/moto-iii-helmet-7c4b35c5cf8f43aa89924008971b90cd) | Netovanniy | CC-BY | 219k |
| `hjc_classic.glb` | HJC · classic scan | [`8c767f44...`](https://sketchfab.com/3d-models/old-hjc-helmet-8c767f4487c04f83843bcdae41e74085) | leadblacktech | CC-BY | 422k |
| `arai_motorcycle.glb` | Arai · Motorcycle | [`e46811f7...`](https://sketchfab.com/3d-models/arai-motorcycle-helmet-e46811f7185b4db6b763c97f419cbb68) | prohavnese1976 | CC-BY | 494k |
| `torc_t1.glb` | Torc · T1 | [`dd5bce9e...`](https://sketchfab.com/3d-models/t1-helmet-dd5bce9ea5ef408e96858fd0e5c93421) | Netovanniy | CC-BY | 236k |
| `akabhi_moto.glb` | Generic · India-budget proxy | [`69f6a321...`](https://sketchfab.com/3d-models/moto-helmet-69f6a3214221419b90af4fc76ca97370) | akabhi006 | CC-BY | 262k |
| `ls2_with_texture.glb` | LS2 | [`8867d6a5...`](https://sketchfab.com/3d-models/myhelmetwithtexture-8867d6a53e764d00b2eb11627451543d) | iyerlogonadhan | CC-BY | 647k |
| `scorpion_exo500.glb` | Scorpion · EXO-500 | [`7547c74a...`](https://sketchfab.com/3d-models/helmet-scorpion-exo500-7547c74ac8884c029356a4c00a6636ee) | sylque | CC-BY | 689k |
| `ramyouny_generic.glb` | Generic · racing | [`b2ead038...`](https://sketchfab.com/3d-models/motorcycle-helmet-racing-helmet-b2ead0381b914a88810a8be9fc13f47a) | ramyouny | **Free Standard** | 135k |
| `scorpion_exo_combat.glb` | Scorpion · EXO-COMBAT | [`8eae9a2c...`](https://sketchfab.com/3d-models/scorpion-exo-combat-8eae9a2c17324592bad0133821c2b92a) | Marcin.Adamski | CC-BY | 343k |

**License gotchas:**
- 8 of 9 are CC-BY → attribution rendered in viewer credits panel automatically (already wired)
- 1 is Sketchfab "Free Standard" → no attribution required by license, but we credit anyway for consistency
- **Verify the license badge on each Sketchfab page before download** — these were API-checked but per-page check is the final word

**Pre-flight per slot:**
- Open the Sketchfab page in browser
- Confirm the model thumbnail shows a **full-face motorcycle helmet** (NOT modular flip-up, NOT F1 open-cockpit, NOT bicycle, NOT toy)
- Confirm "Download 3D Model" button visible (not greyed out)
- Confirm license badge says "CC Attribution" or "Free Standard" — not CC-BY-SA / CC-BY-NC / CC-BY-ND / All Rights Reserved

## Mukut component GLBs (4 modules, ~1-2 hr Tanay-time)

Source `.scad` files in `Misc42/helmet:mechanical/openscad/`:
- `helmet_module.scad` → chin housing geometry
- `battery_enclosure.scad` → rear pod
- (forehead HUD + antenna cluster — author placeholder geometry in any tool, simple boxes / cylinders)

Convert pipeline:
```bash
sudo apt install openscad             # one-time
openscad -o tmp/chin_housing.stl --render mechanical/openscad/helmet_module.scad

# STL → GLB
npm i -g gltf-transform-cli
gltf-transform copy tmp/chin_housing.stl assets/mukut/chin_housing.glb
```

Drop final GLBs into `~/misc/mukut/assets/mukut/`:
- `chin_housing.glb` · `forehead_hud.glb` · `rear_pod.glb` · `antenna.glb`

**Authoring convention (enforce):** Each component's mounting face at local origin, +Z = outward normal, +Y = up. Get this wrong once and every helmet shows a chin module pointing into the rider's nose.

Until real Mukut GLBs are dropped, viewer renders saffron-tinted primitive boxes/cylinders sized to OpenSCAD-source dimensions (chin housing 62×30×38 mm with 2 black camera lens dots; forehead HUD 33×18×8 mm with white LCD plane; rear pod 80×25×48 mm; antenna 3 stacked whips at 6/4.5/3 cm).

## HDR env map (optional)

```bash
curl -L 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_03_1k.hdr' \
  -o assets/env/studio_small.hdr
```

License: CC0 (public domain). 1k resolution, ~1 MB. Drop in place — viewer auto-picks up on next page load. Without it, lighting falls back to AmbientLight + DirectionalLight (looks fine, slightly less PBR pop).

## Anchor coordinates — eyeball-tune in browser

Open `https://misc42.github.io/mukut/?debug=1` (or local: `python3 -m http.server` from repo root, then `http://localhost:8000/?debug=1`).

For each of the 9 helmets:
1. Pick the helmet from the picker
2. Axes gizmos render at each anchor (chin / forehead_hud / rear_pod / antenna)
3. Each Mukut component positions at its anchor — see if it visually lands on the right surface
4. If off: open `data/anchors.json`, tweak `pos` / `normal` / `tangent_up` for that helmet's anchor, save, refresh
5. Iterate ~5 min per helmet × 9 = ~45 min total

Coordinate system:
- Origin = helmet base-ring center (where it meets neck)
- +Y = up, +Z = forward (face direction), units = meters
- `pos` = absolute coords of anchor point on shell surface
- `normal` = outward surface normal at that point (unit vector)
- `tangent_up` = surface-up direction (perpendicular to normal, points roughly toward crown)

## Local dev

```bash
cd ~/misc/mukut
python3 -m http.server 8000
# Open http://localhost:8000/
```

ES modules + importmap, no build step.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Black canvas | WebGL init failed | Check console; ensure GPU drivers OK |
| Demo helmet renders but I expect my real one | Real GLB not in `assets/helmets/<id>.glb` | Manual download per checklist above, commit, push |
| Helmet loads but Mukut components nowhere visible | Anchors stub coords don't match this specific helmet's origin | `?debug=1` mode, see if gizmos render; if not, anchors.json entry missing or helmet origin wrong |
| Mukut component points wrong way | Mukut GLB authored without `+Z = mounting normal` convention | Re-author in Blender (rotate the mounting face to +Z=forward) |
| All helmets render the SAME placeholder | Real helmet GLBs not yet committed; demo fallback is active for every slot | Expected. Download the 9 GLBs per table above |

## Future work (v1.5+)

- AR mode via `<model-viewer>` shim for iOS Quick Look (USDZ pipeline)
- Wireframe / exploded view toggles
- Shareable URLs: `?helmet=scorpion_exo_combat`
- Visual-regression CI (Puppeteer + pixelmatch)
- Anchor authoring via Blender Python add-on (currently hand-edit JSON)
- Real Mukut PBR renders (currently saffron-tinted primitives)
