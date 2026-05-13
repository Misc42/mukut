# Mukut 3D Helmet Compatibility Viewer

Interactive Three.js viewer at `https://misc42.github.io/mukut/`. User picks a helmet brand, sees Mukut's modular components clipped at parametric anchor positions on a 3D helmet model.

## Status

| Piece | State |
|---|---|
| Three.js code (~900 LoC across 7 modules) | ✅ Wired |
| Brand pillar grid | ✅ 14 pillars + "Other / Don't see mine" email-capture pill |
| **Real claim-matched CADs** | ⚠ **1 of 14**: AGV (WebAR.rocks MIT) |
| Mukut component GLBs | 🔴 procedural saffron primitives — OpenSCAD → GLB pipeline not yet run |
| HDR env map | 🟡 optional — falls back to ambient + directional |
| Anchor coords | ⚠ 0.28m archetype placeholders for all 14 — eyeball-tune via `?debug=1` |
| Live URL | ✅ https://misc42.github.io/mukut/ |
| Live build status | ✅ `gh api repos/Misc42/mukut/pages/builds` → built |

## Architecture

Three.js r165 via importmap (no build step, GitHub Pages static).

```
mukut/
├── index.html                       # landing, embeds <section id="viewer">
├── .nojekyll                        # disables Jekyll so assets/_demo/ serves (underscore prefix)
├── viewer/
│   ├── main.js                      # boot, picker wiring, selectHelmet, mountHelmet
│   ├── scene.js                     # renderer, lights, HDR env, OrbitControls, camera fit
│   ├── loader.js                    # GLTFLoader + DRACO + Meshopt + KTX2 decoders
│   ├── anchors.js                   # parametric attach via Matrix4.makeBasis
│   ├── fallback.js                  # generic-demo loader + procedural Mukut components + alpha-fix
│   ├── ui.js                        # brand-pill picker, model grid, overlays, email capture, credits
│   └── style.css                    # mv-prefix to avoid landing CSS collision
├── data/
│   ├── helmets.json                 # 14 helmet entries — brand, model, glb_path, attribution, is_claim_matched
│   └── anchors.json                 # per-helmet anchor coords (chin / forehead_hud / rear_pod / antenna)
└── assets/
    ├── helmets/agv_motorcycle.glb   # AGV — real claim-matched (WebAR.rocks MIT)
    ├── _demo/sceneview_premium.glb  # Generic preview (sayedgamal655 CC-BY, no brand claim)
    └── _demo/{randymay_scan, rynfkn_motorcycle, oga_racing, helmet_sport, helmet_indian_commuter, helmet_racing, helmet_modular, helmet_offroad}.glb
                                     # 8 placeholder variants committed but unused at runtime
```

## Brand pillar click flow

1. User clicks a brand pill → `_onPickCallback(firstHelmetOfBrand.id)` fires
2. `main.js selectHelmet(id)` tries to load `assets/helmets/<id>.glb`
3. **HTTP 200**: `normalizeScale → fixWebARrocksAGVMaterials (if needs_alpha_fix) → mountHelmet → Mukut components attach at anchors`
4. **HTTP 404**: `showHelmetNotInDB(meta, onShowDemo)` overlay renders. User can click "Generic Mukut fit preview dikhao →" button → loads SceneView GLB + Mukut clipped on + "NOT actual [Brand]" banner

Boot auto-loads the first `is_claim_matched === true` helmet (currently AGV) so the page opens with a real CAD rendered.

## Strategy — designer-claim-based brand matching

Brand manufacturers don't release CADs publicly (ever). The viewer's strategy: trust uploader claims.

**Current claim-matched assets:**

| Brand | Asset | Designer claim |
|---|---|---|
| AGV | `assets/helmets/agv_motorcycle.glb` | WebAR.rocks demo, MIT — mesh nodes named `prop_helmet_agv_low.*`, materials `prop_helmet_agv_chrome` / `_glass_leather` / `_strap` / `_stitch` / `_inside` |

**Other 13 brands**: Sketchfab has designer-claimed CADs but login-walled. URLs are documented in `data/helmets.json` `attribution.source_url` for future manual ingest.

**Indian brands** (Studds / Vega / Steelbird / AXOR / SMK / Royal Enfield / TVS): zero claim-matched direct-download CADs exist anywhere globally — verified across Sketchfab Hindi search, GrabCAD, Cults3D, Thingiverse, Printables, MyMiniFactory, IIT/NIT repos, GitHub raw, archive.org Wayback, Indian gov data portal, FetchCFD, Polycam.

## Adding a real brand CAD (when sourcing)

For each brand without a real CAD in `assets/helmets/`:

```bash
# (1) Click the Sketchfab URL in data/helmets.json[brand].attribution.source_url
# (2) Login to Sketchfab (free account), download GLB format
# (3) Decimate for web
npx --yes gltf-transform optimize input.glb output.glb \
  --compress draco --texture-compress webp --simplify-ratio 0.5
# (4) Drop at assets/helmets/<id>.glb (matching the helmets.json `id`)
# (5) Edit helmets.json that entry → set "is_claim_matched": true
# (6) git add, commit, push — Pages auto-rebuild, the brand pill auto-upgrades from "Not in DB" → real CAD
```

For Indian brands without any free CC source: paid Fiverr/Upwork commission with explicit CC-BY contract assignment (~₹5-8k/helmet).

## Anchor coord tuning (`?debug=1` mode)

```
https://misc42.github.io/mukut/?debug=1
```

Renders AxesHelper gizmos at each anchor on the selected helmet. For each helmet:
1. Pick that brand
2. See where the 4 anchor gizmos (chin / forehead_hud / rear_pod / antenna) render
3. If a Mukut component floats off-surface, edit `data/anchors.json` for that helmet's anchor → save → refresh
4. Schema: `pos: [x,y,z]` (meters, origin = base-ring center), `normal: [x,y,z]` (outward surface unit vector), `tangent_up: [x,y,z]` (surface-up direction, perpendicular to normal). Three.js builds rotation via `Matrix4.makeBasis(cross(up,n), up, n)`

~5 min/helmet × 14 = ~70 min total when ready.

## Mukut component GLBs (Mukut module attaches)

Source `.scad` lives in `Misc42/helmet:mechanical/openscad/`:
- `helmet_module.scad` → chin housing
- `battery_enclosure.scad` → rear pod
- (forehead HUD + antenna — author placeholders in any tool)

When ready:
```bash
sudo apt install openscad
openscad -o tmp/chin_housing.stl --render mechanical/openscad/helmet_module.scad
openscad -o tmp/rear_pod.stl --render mechanical/openscad/battery_enclosure.scad
# STL → GLB via assimpjs (recipe in helmet repo fixes.md Session 5)
npm i -g @gltf-transform/cli
```

Drop final files: `assets/mukut/{chin_housing,forehead_hud,rear_pod,antenna}.glb`.

**Authoring convention (enforce):** each component's mounting face at local origin, +Z = outward normal, +Y = up. Otherwise the anchor attachment math points components INTO the rider's skin instead of away.

Until real Mukut GLBs ship, viewer renders saffron-tinted primitives at OpenSCAD-source dimensions (chin housing 62×30×38 mm + 2 black camera lens dots + forehead HUD 33×18×8 mm with white LCD plane + rear pod 80×25×48 mm + antenna 3 stacked cylinders 6/4.5/3 cm).

## HDR env map (optional)

```bash
curl -L 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_03_1k.hdr' \
  -o assets/env/studio_small.hdr
```

CC0, ~1 MB. Drop in place — viewer auto-loads on next page load. Without it, falls back to ambient + directional lighting (looks fine, slightly less PBR pop).

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `assets/_demo/*` returns HTTP 404 on Pages | GitHub Pages runs Jekyll by default; Jekyll strips `_*`-prefixed directories | `.nojekyll` empty file at repo root (already committed) |
| All 14 brands show "Not in DB" — even AGV | `helmets[0]` was an Indian brand, real GLB 404'd, auto-load picked the wrong helmet | Boot auto-load now picks first `is_claim_matched: true` (was helmets[0]) — fixed in `f7318b4` |
| AGV pill click only highlights pill, doesn't load | Pill click handler only updated UI, didn't fire `_onPickCallback` | Pill click now auto-fires `_onPickCallback(helmets[0].id)` — single-click flow |
| AGV renders but "see-through sections" on orbit | WebAR.rocks GLB has `alphaMode: BLEND` on every material | `fixWebARrocksAGVMaterials()` traverses + force-opaques non-glass materials |
| Helmet renders but Mukut components float in space | Archetype placeholder anchor coords don't match this helmet's shape | `?debug=1` mode + eyeball-tune `anchors.json` |
| Page renders but stuck on loading spinner | Mukut component GLBs 404'd silently, procedural fallback kicked in but blocking; OR GLB parse error | Check browser DevTools console (`F12`) — `[mukut-viewer]` info lines trace the load pipeline |

## Headless Chrome debug template

When the page renders differently than expected, capture browser state programmatically:

```bash
mkdir -p /tmp/headless && cd /tmp/headless
npm init -y && npm install puppeteer-core --silent
```

Then a small script using `executablePath: '/usr/bin/google-chrome'` + WebGL flags (`--use-gl=angle --use-angle=swiftshader --enable-webgl --ignore-gpu-blocklist`) loads the URL, captures `page.on('console')` / `page.on('pageerror')` / `page.on('requestfailed')`, takes a screenshot. See `feedback_headless_browser_debug.md` in user memory for the full template.

## Future work

- AR via `<model-viewer>` shim for iOS Quick Look (USDZ pipeline)
- Wireframe / exploded view toggles
- Shareable URLs (`?helmet=agv_motorcycle&view=rear`)
- Visual-regression CI (Puppeteer + pixelmatch on each helmet)
- Anchor-export Blender Python add-on (currently hand-edit JSON)
- Real Mukut PBR renders (currently procedural saffron primitives)
- More claim-matched brand CADs as the manual sourcing surface expands
