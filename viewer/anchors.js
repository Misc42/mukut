/**
 * Parametric attachment of Mukut components to helmet anchor points.
 * Anchor format (from data/anchors.json):
 *   { pos: [x,y,z], normal: [x,y,z], tangent_up: [x,y,z] }
 *
 * Mukut component GLB convention: mounting face at local origin, +Z = outward
 * normal, +Y = up. The component is rotated into the helmet's anchor frame.
 */

import * as THREE from "three";

export function attachComponent(component, anchor, helmetRoot) {
  const n = new THREE.Vector3(...anchor.normal).normalize();
  const u = new THREE.Vector3(...anchor.tangent_up).normalize();
  const t = new THREE.Vector3().crossVectors(u, n).normalize();
  const m = new THREE.Matrix4().makeBasis(t, u, n);
  component.quaternion.setFromRotationMatrix(m);
  component.position.fromArray(anchor.pos);
  helmetRoot.add(component);
}

export function detachAllComponents(helmetRoot, componentObjects) {
  componentObjects.forEach(c => {
    if (c && c.parent === helmetRoot) helmetRoot.remove(c);
  });
}

export function renderAnchorGizmos(helmetRoot, anchors, size = 0.025) {
  const gizmos = [];
  for (const [name, anchor] of Object.entries(anchors)) {
    const axes = new THREE.AxesHelper(size);
    const n = new THREE.Vector3(...anchor.normal).normalize();
    const u = new THREE.Vector3(...anchor.tangent_up).normalize();
    const t = new THREE.Vector3().crossVectors(u, n).normalize();
    const m = new THREE.Matrix4().makeBasis(t, u, n);
    axes.quaternion.setFromRotationMatrix(m);
    axes.position.fromArray(anchor.pos);
    axes.userData.anchorName = name;
    helmetRoot.add(axes);
    gizmos.push(axes);

    const sprite = makeLabel(name);
    sprite.position.fromArray(anchor.pos);
    sprite.position.y += 0.025;
    helmetRoot.add(sprite);
    gizmos.push(sprite);
  }
  return gizmos;
}

function makeLabel(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(15,14,20,0.85)";
  ctx.fillRect(0, 0, 256, 64);
  ctx.fillStyle = "#E8B339";
  ctx.font = "bold 24px 'IBM Plex Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 32);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.06, 0.015, 1);
  return sprite;
}
