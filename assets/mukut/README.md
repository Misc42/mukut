# Mukut component GLB assets

4 modular Mukut components for the 3D viewer. Source geometry lives in `Misc42/helmet:mechanical/openscad/`.

| `<id>.glb` | Source | Approx. size |
|---|---|---|
| `chin_housing.glb` | `helmet_module.scad` → STL → GLB | 60×30×40 mm |
| `forehead_hud.glb` | hand-author in Blender (Sharp 1.3" LCD) | 33×18×8 mm |
| `rear_pod.glb` | `battery_enclosure.scad` → STL → GLB | 80×50×25 mm |
| `antenna.glb` | hand-author 3 stacked cylinders | 12 mm dia × 60 mm |

## Authoring convention (enforce, or anchor attachment breaks)

- Mounting face (the face that touches the helmet shell) at **local origin**
- +Z = outward normal (away from helmet surface)
- +Y = up (component-relative)
- Real-world meters

If a component is authored facing the wrong way, the viewer rotates it onto the helmet shell pointing INTO the rider's skin instead of away. Bad.

## Convert pipeline

```bash
# openscad to STL
openscad -o tmp.stl --render path/to/source.scad

# STL to GLB (no PBR — basic geometry only)
npm i -g obj2gltf
# (obj2gltf takes OBJ; convert STL→OBJ first via meshlab, or use blender headless:)
blender -b -P bake_to_glb.py -- tmp.stl chin_housing.glb
```

Until real renders land, the Three.js code in `viewer/scene.js` applies a saffron tint (`#E8B339`) + plastic roughness (0.55) at runtime via `tintMukutComponent()` so even untextured geometry reads visually as "Mukut module."

## .gitignore note

The actual `*.glb` binaries are NOT committed to git. Tanay generates per-machine from the OpenSCAD source + hand-authoring; production deploy promotes them to the live `assets/mukut/` directory.
