/**
 * Procedural geometry fallbacks when GLB assets are not yet committed
 * to the repo. Lets the viewer render immediately out-of-the-box.
 * When real GLBs are dropped into assets/, they automatically take
 * priority and these primitives are skipped.
 */

import * as THREE from "three";

const SAFFRON = 0xE8B339;
const SHELL_COLOR = 0x2A2A38;
const VISOR_COLOR = 0x4DB5FF;

/**
 * Procedural full-face helmet built from primitives. Returns the helmet
 * Object3D AND a matching set of anchor coordinates pinned to this
 * specific shape's surface — overrides anchors.json when the helmet is
 * procedural so Mukut components attach correctly to the placeholder.
 */
export function createProceduralHelmet(shellHeightM = 0.28) {
  const group = new THREE.Group();
  group.userData.isProcedural = true;

  const r = shellHeightM * 0.5;

  const shellMat = new THREE.MeshStandardMaterial({
    color: SHELL_COLOR,
    roughness: 0.42,
    metalness: 0.18,
  });

  const domeGeo = new THREE.SphereGeometry(r, 36, 28, 0, Math.PI * 2, 0, Math.PI * 0.58);
  domeGeo.scale(1.05, 1.20, 1.10);
  domeGeo.translate(0, r * 0.50, 0);
  group.add(new THREE.Mesh(domeGeo, shellMat));

  const chinGeo = new THREE.CapsuleGeometry(r * 0.16, r * 0.95, 8, 18);
  chinGeo.rotateZ(Math.PI / 2);
  chinGeo.translate(0, r * 0.25, r * 0.50);
  group.add(new THREE.Mesh(chinGeo, shellMat));

  const visorGeo = new THREE.SphereGeometry(r * 1.16, 32, 20, Math.PI * 0.30, Math.PI * 0.40, Math.PI * 0.32, Math.PI * 0.22);
  visorGeo.scale(1.0, 1.05, 1.0);
  visorGeo.translate(0, r * 0.50, 0);
  const visorMat = new THREE.MeshStandardMaterial({
    color: VISOR_COLOR,
    roughness: 0.08,
    metalness: 0.45,
    transparent: true,
    opacity: 0.32,
    side: THREE.DoubleSide,
  });
  group.add(new THREE.Mesh(visorGeo, visorMat));

  const baseRingGeo = new THREE.TorusGeometry(r * 0.80, r * 0.05, 10, 36);
  baseRingGeo.rotateX(Math.PI / 2);
  group.add(new THREE.Mesh(baseRingGeo, shellMat));

  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x111119,
    roughness: 0.35,
    metalness: 0.30,
  });
  const visorRimGeo = new THREE.TorusGeometry(r * 0.92, r * 0.02, 8, 24, Math.PI * 0.55);
  visorRimGeo.rotateY(Math.PI);
  visorRimGeo.translate(0, r * 1.05, 0);
  group.add(new THREE.Mesh(visorRimGeo, trimMat));

  const anchors = {
    chin: {
      pos: [0, r * 0.30, r * 0.98],
      normal: [0, -0.25, 0.97],
      tangent_up: [0, 0.97, 0.25],
    },
    forehead_hud: {
      pos: [0, r * 1.32, r * 0.62],
      normal: [0, 0.45, 0.89],
      tangent_up: [0, 0.89, -0.45],
    },
    rear_pod: {
      pos: [0, r * 1.28, -r * 0.62],
      normal: [0, 0.48, -0.88],
      tangent_up: [0, 0.88, 0.48],
    },
    antenna: {
      pos: [0, r * 1.62, -r * 0.10],
      normal: [0, 1.00, 0.00],
      tangent_up: [0, 0.00, -1.00],
    },
  };

  return { helmet: group, anchors };
}

/**
 * Procedural Mukut component — saffron-tinted primitive sized to match
 * the OpenSCAD source dimensions. Mounting face at local origin with
 * +Z = outward normal so the anchor attachment math works correctly.
 */
export function createProceduralMukutComponent(componentId) {
  const mat = new THREE.MeshStandardMaterial({
    color: SAFFRON,
    roughness: 0.50,
    metalness: 0.18,
  });

  let geo;
  switch (componentId) {
    case "chin_housing": {
      geo = new THREE.BoxGeometry(0.062, 0.030, 0.038);
      geo.translate(0, 0, 0.019);
      const wrap = new THREE.Group();
      wrap.add(new THREE.Mesh(geo, mat));
      const lensL = new THREE.CylinderGeometry(0.006, 0.006, 0.004, 16);
      lensL.rotateX(Math.PI / 2);
      lensL.translate(-0.015, 0, 0.038);
      wrap.add(new THREE.Mesh(lensL, new THREE.MeshStandardMaterial({
        color: 0x0F0E14, roughness: 0.05, metalness: 0.85,
      })));
      const lensR = lensL.clone();
      lensR.translate(0.030, 0, 0);
      wrap.add(new THREE.Mesh(lensR, new THREE.MeshStandardMaterial({
        color: 0x0F0E14, roughness: 0.05, metalness: 0.85,
      })));
      wrap.userData.isProcedural = true;
      return wrap;
    }
    case "forehead_hud": {
      geo = new THREE.BoxGeometry(0.033, 0.018, 0.008);
      geo.translate(0, 0, 0.004);
      const wrap = new THREE.Group();
      wrap.add(new THREE.Mesh(geo, mat));
      const lcdGeo = new THREE.PlaneGeometry(0.028, 0.014);
      lcdGeo.translate(0, 0, 0.0081);
      wrap.add(new THREE.Mesh(lcdGeo, new THREE.MeshBasicMaterial({
        color: 0xF4EFE6,
      })));
      wrap.userData.isProcedural = true;
      return wrap;
    }
    case "rear_pod": {
      geo = new THREE.BoxGeometry(0.080, 0.025, 0.048);
      geo.translate(0, 0, 0.024);
      const mesh = new THREE.Mesh(geo, mat);
      const wrap = new THREE.Group();
      wrap.add(mesh);
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
      geo = new THREE.BoxGeometry(0.030, 0.030, 0.030);
      const wrap = new THREE.Group();
      wrap.add(new THREE.Mesh(geo, mat));
      wrap.userData.isProcedural = true;
      return wrap;
    }
  }
}
