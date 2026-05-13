/**
 * Asset fallbacks for the 3D helmet viewer.
 *
 * Brand pill click path: when a real per-brand GLB doesn't exist in
 * assets/helmets/<id>.glb, main.js shows a "Helmet not in DB" overlay —
 * no automatic fake-CAD substitution. The user has to deliberately click
 * the "Generic Mukut fit preview" button to trigger loadGenericDemoHelmet,
 * which loads ONE explicit demo (WebAR.rocks AGV motorcycle helmet, MIT,
 * 4.13 MB, full PBR with chrome visor + leather strap).
 *
 * Other helmet GLBs in assets/_demo/ stay committed for possible future
 * use (preview gallery, variant switcher) but are not referenced from
 * runtime code.
 *
 * Mukut component fallback: procedural saffron-tinted primitives at
 *   OpenSCAD-source dimensions. Mounting face at local origin with
 *   +Z = outward normal so the anchor attachment math works correctly.
 */

import * as THREE from "three";
import { loadGLB } from "./loader.js";

const SAFFRON = 0xE8B339;

/**
 * Single explicit demo helmet — loaded only on a deliberate user click of
 * the "Show generic Mukut fit preview" button (not as an automatic
 * fallback per brand pill). The brand pill click path now shows an
 * honest "Helmet not in DB" message instead of pretending a generic
 * helmet is the brand's actual CAD.
 *
 * Other GLBs in assets/_demo/ remain committed but unused at runtime —
 * available for future swap if needed.
 */
const GENERIC_DEMO = {
  path: "./assets/_demo/motorcycle_helmet.glb",
  needsMaterialFix: true,
  label: "Generic AGV-modeled full-face (demo only)",
};

export async function loadGenericDemoHelmet(loader) {
  const helmet = await loadGLB(GENERIC_DEMO.path, loader);
  helmet.userData.isDemo = true;
  helmet.userData.demoLabel = GENERIC_DEMO.label;
  if (GENERIC_DEMO.needsMaterialFix) fixWebARrocksAGVMaterials(helmet);
  return helmet;
}

export async function loadDemoHelmet(loader, _meta) {
  return loadGenericDemoHelmet(loader);
}

function applyBareGeometryTint(root) {
  root.traverse(child => {
    if (!child.isMesh) return;
    child.material = new THREE.MeshStandardMaterial({
      color: 0x4A4A52,
      metalness: 0.18,
      roughness: 0.50,
      side: THREE.FrontSide,
    });
    child.material.needsUpdate = true;
  });
}

/**
 * The WebAR.rocks AGV helmet ships with every material set to
 * alphaMode=BLEND + doubleSided=true — even the opaque shell / strap /
 * leather / inside. BLEND mode makes Three.js render them in the
 * transparent pass, where depthWrite is false by default, so back faces
 * of double-sided meshes punch through front faces as the camera
 * rotates ("see-through sections"). Fix: force opaque + single-sided
 * on every material whose name does NOT contain "glass" (visor needs to
 * stay translucent).
 */
function fixWebARrocksAGVMaterials(root) {
  root.traverse(child => {
    if (!child.isMesh || !child.material) return;
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    mats.forEach(m => {
      const name = (m.name || "").toLowerCase();
      const isGlass = name.includes("glass") || name.includes("visor");
      if (isGlass) {
        m.transparent = true;
        m.opacity = 0.55;
        m.depthWrite = false;
        m.side = THREE.DoubleSide;
        m.alphaTest = 0;
      } else {
        m.transparent = false;
        m.opacity = 1.0;
        m.depthWrite = true;
        m.depthTest = true;
        m.side = THREE.FrontSide;
        m.alphaTest = 0;
      }
      m.needsUpdate = true;
    });
  });
}

export function createProceduralMukutComponent(componentId) {
  const mat = new THREE.MeshStandardMaterial({
    color: SAFFRON,
    roughness: 0.50,
    metalness: 0.18,
  });

  switch (componentId) {
    case "chin_housing": {
      const wrap = new THREE.Group();
      const body = new THREE.BoxGeometry(0.062, 0.030, 0.038);
      body.translate(0, 0, 0.019);
      wrap.add(new THREE.Mesh(body, mat));

      const lensMat = new THREE.MeshStandardMaterial({
        color: 0x0F0E14, roughness: 0.05, metalness: 0.85,
      });
      const lensL = new THREE.CylinderGeometry(0.006, 0.006, 0.004, 16);
      lensL.rotateX(Math.PI / 2);
      lensL.translate(-0.015, 0, 0.038);
      wrap.add(new THREE.Mesh(lensL, lensMat));
      const lensR = lensL.clone();
      lensR.translate(0.030, 0, 0);
      wrap.add(new THREE.Mesh(lensR, lensMat));

      wrap.userData.isProcedural = true;
      return wrap;
    }
    case "forehead_hud": {
      const wrap = new THREE.Group();
      const body = new THREE.BoxGeometry(0.033, 0.018, 0.008);
      body.translate(0, 0, 0.004);
      wrap.add(new THREE.Mesh(body, mat));

      const lcd = new THREE.PlaneGeometry(0.028, 0.014);
      lcd.translate(0, 0, 0.0081);
      wrap.add(new THREE.Mesh(lcd, new THREE.MeshBasicMaterial({ color: 0xF4EFE6 })));

      wrap.userData.isProcedural = true;
      return wrap;
    }
    case "rear_pod": {
      const wrap = new THREE.Group();
      const body = new THREE.BoxGeometry(0.080, 0.025, 0.048);
      body.translate(0, 0, 0.024);
      wrap.add(new THREE.Mesh(body, mat));
      wrap.userData.isProcedural = true;
      return wrap;
    }
    case "antenna": {
      const group = new THREE.Group();
      const segments = [
        { h: 0.060, r: 0.005, color: SAFFRON },
        { h: 0.045, r: 0.005, color: 0xC89234 },
        { h: 0.030, r: 0.005, color: 0xA87234 },
      ];
      let z = 0;
      segments.forEach(seg => {
        const cyl = new THREE.CylinderGeometry(seg.r, seg.r, seg.h, 12);
        cyl.rotateX(Math.PI / 2);
        cyl.translate(0, 0, z + seg.h / 2);
        group.add(new THREE.Mesh(cyl, new THREE.MeshStandardMaterial({
          color: seg.color, roughness: 0.35, metalness: 0.55,
        })));
        z += seg.h + 0.004;
      });
      group.userData.isProcedural = true;
      return group;
    }
    default: {
      const wrap = new THREE.Group();
      const geo = new THREE.BoxGeometry(0.030, 0.030, 0.030);
      wrap.add(new THREE.Mesh(geo, mat));
      wrap.userData.isProcedural = true;
      return wrap;
    }
  }
}
