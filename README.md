# Mukut — मुकुट, हर मोड़ पर साथ

Landing page + interactive 3D helmet compatibility viewer for **Mukut** — product 02 in the [Misc42 Labs](https://misc42.github.io/misc42labs/) portfolio.

A clip-on safety module for any ISI-certified motorcycle helmet — dual rear cameras, live HUD, tri-radio mesh, cross-horizon SOS. v1 is being hand-built on perfboard and tested with a closed alpha of ~10 friends. Not on sale yet. No cloud, no subscription.

**Live**: <https://misc42.github.io/mukut/> (GitHub Pages auto-builds on every push to `main`)

## Repo layout

- `index.html` — landing page (embeds the 3D viewer section mid-page)
- `privacy.html` — DPDP-compliant privacy policy (linked from Play Store listing)
- `.nojekyll` — disables Pages Jekyll processing so `assets/_demo/` (underscore-prefixed) serves correctly
- `viewer/` — Three.js helmet compatibility viewer source (`main.js`, `scene.js`, `loader.js`, `anchors.js`, `fallback.js`, `ui.js`, `style.css`) — see `viewer/README.md` for full architecture
- `data/helmets.json` — 14 brand-pillar entries + `is_claim_matched` flag per slot
- `data/anchors.json` — per-helmet anchor coords for Mukut module attachment
- `assets/helmets/` — claim-matched real brand CADs (currently 1: AGV via WebAR.rocks MIT)
- `assets/_demo/` — neutral demo helmets used by "Generic Mukut fit preview" button + unused backup variants
- `assets/mukut/` — Mukut module GLBs (procedural fallback active in code until OpenSCAD pipeline runs)
- `assets/env/` — HDR env map (optional, falls back to ambient + directional lighting if missing)

## Viewer state

| Brand pill | Behavior |
|---|---|
| **AGV** | Real designer-claim-matched CAD (WebAR.rocks MIT — mesh nodes `prop_helmet_agv_low.*`, materials `prop_helmet_agv_chrome` / `_glass_leather` / `_strap` / `_stitch`). Renders directly with chrome visor + leather strap PBR. |
| Bell · Arai · HJC · LS2 · Torc · Scorpion · Scorpion EXO-COMBAT · AXOR · SMK · Studds · Vega · Steelbird · Royal Enfield | "Helmet not in DB yet" overlay + saffron "Generic Mukut fit preview dikhao →" button → SceneView neutral helmet renders with Mukut clipped on + clear "NOT actual [Brand]" banner |

## Strategy — designer-claim-based brand matching

Brand manufacturers (Shoei / Bell / HJC / AGV / Studds / Vega) never release CADs publicly. The viewer's strategy: **if a 3D-model uploader explicitly claims "this is [Brand] [Model]" (in mesh node names, title, description, README, asset metadata), we trust them and use that asset under the uploader's license.**

This sidesteps the "brands won't license CADs" problem entirely. AGV via WebAR.rocks (MIT) is the precedent. As more designer-claimed direct-downloadable CADs surface, each one slots into `assets/helmets/<id>.glb` + `is_claim_matched: true` in `data/helmets.json` → automatic upgrade from "Not in DB" to real CAD render.

**Indian brand reality**: Studds / Vega / Steelbird / AXOR / SMK / Royal Enfield / TVS — zero claim-matched direct-download CADs exist anywhere on the public web (verified across 12+ sources including Hindi-script Sketchfab, GrabCAD, Cults3D, Thingiverse, Printables, IIT/NIT repos, Indian gov data portal). Practical path: paid Fiverr/Upwork commission with explicit CC-BY contract assignment (~₹5-8k/helmet).

## Source / engineering

Firmware / hardware / engineering docs live in the private [Misc42/helmet](https://github.com/Misc42/helmet) repo. This public repo is intentionally only the marketing landing + viewer.

— Tanay Misra · `tanaymisra97@gmail.com`
