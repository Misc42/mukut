/**
 * Procedural geometry fallbacks when GLB assets are not yet committed
 * to the repo. Lets the viewer render immediately out-of-the-box.
 * When real GLBs are dropped into assets/, they automatically take
 * priority and these primitives are skipped.
 */

import * as THREE from "three";

const SAFFRON = 0xE8B339;
const SHELL_COLOR = 0x2A2832;
const VISOR_COLOR = 0x0F0E14;

/**
 * Procedural full-face helmet built from primitives. Stylized,
 * recognizable as a helmet, deliberately not realistic — signals
 * "this is a placeholder while we load your specific model."
 */
export function createProceduralHelmet(shellHeightM = 0.28) {
  const group = new THREE.Group();
  group.userData.isProcedural = true;

  const r = shellHeightM * 0.5;

  const shellGeo = new THREE.SphereGeometry(r, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.62);
  shellGeo.scale(1.0, 1.18, 1.05);
  shellGeo.translate(0, r * 0.4, 0);
  const shellMat = new THREE.MeshStandardMaterial({
    color: SHELL_COLOR,
    roughness: 0.45,
    metalness: 0.08,
  });
  const shell = new THREE.Mesh(shellGeo, shellMat);
  group.add(shell);

  const chinShape = new THREE.Shape();
  chinShape.moveTo(-r * 0.62, 0);
  chinShape.quadraticCurveTo(0, -r * 0.18, r * 0.62, 0);
  chinShape.lineTo(r * 0.58, r * 0.10);
  chinShape.quadraticCurveTo(0, -r * 0.05, -r * 0.58, r * 0.10);
  chinShape.closePath();
  const chinGeo = new THREE.ExtrudeGeometry(chinShape, {
    depth: r * 0.65,
    bevelEnabled: true,
    bevelSize: 0.005,
    bevelThickness: 0.005,
    bevelSegments: 2,
  });
  chinGeo.rotateX(Math.PI / 2);
  chinGeo.translate(0, r * 0.10, r * 0.05);
  const chin = new THREE.Mesh(chinGeo, shellMat);
  group.add(chin);

  const visorGeo = new THREE.SphereGeometry(r * 0.95, 24, 18, Math.PI * 0.30, Math.PI * 0.40, Math.PI * 0.18, Math.PI * 0.28);
  visorGeo.scale(1.0, 1.05, 1.10);
  visorGeo.translate(0, r * 0.42, 0);
  const visorMat = new THREE.MeshStandardMaterial({
    color: VISOR_COLOR,
    roughness: 0.15,
    metalness: 0.50,
    transparent: true,
    opacity: 0.92,
  });
  const visor = new THREE.Mesh(visorGeo, visorMat);
  group.add(visor);

  const baseRingGeo = new THREE.TorusGeometry(r * 0.78, r * 0.04, 8, 32);
  baseRingGeo.rotateX(Math.PI / 2);
  baseRingGeo.translate(0, 0, 0);
  const baseRing = new THREE.Mesh(baseRingGeo, shellMat);
  group.add(baseRing);

  return group;
}

/**
 * Procedural Mukut component — saffron-tinted primitive box / cylinder
 * sized to match the OpenSCAD source dimensions. The component's
 * mounting face is at local origin with +Z = outward normal so the
 * anchor attachment math in viewer/anchors.js works correctly.
 */
export function createProceduralMukutComponent(componentId) {
  const mat = new THREE.MeshStandardMaterial({
    color: SAFFRON,
    roughness: 0.55,
    metalness: 0.15,
  });

  let geo;
  switch (componentId) {
    case "chin_housing": {
      geo = new THREE.BoxGeometry(0.060, 0.030, 0.040);
      geo.translate(0, 0, 0.020);
      break;
    }
    case "forehead_hud": {
      geo = new THREE.BoxGeometry(0.033, 0.018, 0.008);
      geo.translate(0, 0, 0.004);
      break;
    }
    case "rear_pod": {
      geo = new THREE.BoxGeometry(0.080, 0.025, 0.050);
      geo.translate(0, 0, 0.0125);
      break;
    }
    case "antenna": {
      const group = new THREE.Group();
      const heights = [0.060, 0.045, 0.030];
      const colors = [SAFFRON, 0xC8923F, 0xA8723F];
      let z = 0;
      heights.forEach((h, i) => {
        const cyl = new THREE.CylinderGeometry(0.006, 0.006, h, 12);
        cyl.rotateX(Math.PI / 2);
        cyl.translate(0, 0, z + h / 2);
        const m = new THREE.Mesh(cyl, new THREE.MeshStandardMaterial({
          color: colors[i],
          roughness: 0.4,
          metalness: 0.6,
        }));
        group.add(m);
        z += h + 0.003;
      });
      group.userData.isProcedural = true;
      return group;
    }
    default: {
      geo = new THREE.BoxGeometry(0.030, 0.030, 0.030);
    }
  }

  const mesh = new THREE.Mesh(geo, mat);
  const wrap = new THREE.Group();
  wrap.add(mesh);
  wrap.userData.isProcedural = true;
  return wrap;
}
