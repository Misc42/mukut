# Mukut — मुकुट, हर मोड़ पर साथ

Landing page for **Mukut** — product 02 in the [Misc42 Labs](https://misc42.github.io/misc42labs/) portfolio.

A clip-on safety module for any ISI-certified motorcycle helmet — dual rear cameras, live HUD, tri-radio mesh, cross-horizon SOS. v1 is being hand-built on perfboard and tested with a closed alpha of ~10 friends. Not on sale yet. No cloud, no subscription.

**Live**: <https://misc42.github.io/mukut/> (GitHub Pages auto-builds on every push to `main`)

## Files

- `index.html` — landing
- `privacy.html` — DPDP-compliant privacy policy (linked from Play Store listing)
- `viewer/` — interactive 3D helmet compatibility viewer (Three.js, see `viewer/README.md`)
- `data/` — helmet DB + anchor coordinates for the viewer
- `assets/` — helmet + Mukut module GLBs + HDR env map (machine-local, see READMEs)

Source / firmware / engineering docs live in the private [Misc42/helmet](https://github.com/Misc42/helmet) repo. This public repo is intentionally only the marketing landing + viewer.

— Tanay Misra · `tanaymisra97@gmail.com`
