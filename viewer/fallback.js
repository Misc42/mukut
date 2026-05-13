/**
 * Asset fallbacks when a helmet GLB is not yet present in the repo.
 *
 * Helmet fallback: load assets/_demo/motorcycle_helmet.glb — a real
 *   3D-scanned full-face motorcycle helmet, CC0 (public domain) from
 *   Printables #502088 by RandyMay, decimated to ~7 MB web-ready.
 *   Reads correctly as a motorcycle helmet from any angle (visor +
 *   chin bar + vents intact).
 *
 * Mukut component fallback: procedural saffron-tinted primitives at
 *   OpenSCAD-source dimensions. Mounting face at local origin with
 *   +Z = outward normal so the anchor attachment math works correctly.
 */

import * as THREE from "three";
import { loadGLB } from "./loader.js";

const SAFFRON = 0xE8B339;
const SHELL_DEMO_COLOR = 0x2A2A38;
const DEMO_HELMET_PATH = "./assets/_demo/motorcycle_helmet.glb";

export async function loadDemoHelmet(loader) {
  const helmet = await loadGLB(DEMO_HELMET_PATH, loader);
  helmet.userData.isDemo = true;
  helmet.traverse(child => {
    if (child.isMesh && child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach(m => {
        if (m.color) m.color.setHex(SHELL_DEMO_COLOR);
        if ("metalness" in m) m.metalness = 0.20;
        if ("roughness" in m) m.roughness = 0.42;
      });
    }
  });
  return helmet;
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
