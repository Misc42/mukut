# Helmet GLB assets

10 CC-BY licensed helmet 3D models for the Mukut compatibility viewer. **All files in this directory are manually downloaded** — see `../../viewer/README.md` § Step 1 for the download URLs and license verification checklist.

Filename convention: `<id>.glb` where `<id>` matches `helmets[].id` in `data/helmets.json`.

Optional companion files (lazy-loaded as picker thumbnails):
- `<id>_thumb.webp` — 320×240 WebP, ~10-30 KB each — speeds up the model grid render

Attribution for each model is rendered in the viewer's credits panel; the data comes from `helmets[].attribution` in `data/helmets.json`. **Do not delete attribution metadata** — required by the CC-BY license.

## .gitignore note

The actual `*.glb` and `*.webp` binaries are NOT committed to git (see root `.gitignore`). Tanay downloads them per-machine; production deployment uploads them via GitHub Pages once via a separate process (LFS, release artifact, or direct push as the catalog stabilizes).
