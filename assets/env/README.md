# HDR environment map

Single HDR file for PBR lighting in the viewer.

## Download (one-time, ~30 sec)

```bash
curl -L 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_03_1k.hdr' \
  -o studio_small.hdr
```

License: **CC0** (no attribution required, public domain) — Poly Haven.

Source: https://polyhaven.com/a/studio_small_03

## Why this HDR

- 1k resolution = ~1 MB file (Mukut viewer's total asset budget is tight)
- Studio softbox-style lighting works for product visualization across helmet brand colors
- CC0 = zero legal friction
- PMREM-processed once at boot (compute-cheap)

## Alternatives if you want to swap

Any CC0 1k HDR from Poly Haven works — see https://polyhaven.com/hdris. Studio / interior categories are safest for product viz. Outdoor / sunset HDRs cast warm shadows that fight the saffron Mukut tint visually.

If swapping, update `viewer/scene.js:loadEnvironment()` URL constant — or rename the new file to `studio_small.hdr` and drop in place.
