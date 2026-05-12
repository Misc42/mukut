/**
 * GLB loading with Draco + Meshopt + KTX2 support. Cleanup helpers.
 */

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";

const DRACO_DECODER = "https://www.gstatic.com/draco/versioned/decoders/1.5.6/";
const KTX2_BASIS = "https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/libs/basis/";

let _loader = null;

export function getLoader(renderer) {
  if (_loader) return _loader;
  const loader = new GLTFLoader();
  const draco = new DRACOLoader();
  draco.setDecoderPath(DRACO_DECODER);
  loader.setDRACOLoader(draco);
  loader.setMeshoptDecoder(MeshoptDecoder);
  if (renderer) {
    const ktx2 = new KTX2Loader();
    ktx2.setTranscoderPath(KTX2_BASIS);
    ktx2.detectSupport(renderer);
    loader.setKTX2Loader(ktx2);
  }
  _loader = loader;
  return loader;
}

export function loadGLB(url, loader, onProgress) {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => resolve(gltf.scene),
      (xhr) => {
        if (onProgress && xhr.lengthComputable) {
          onProgress(xhr.loaded / xhr.total);
        }
      },
      (err) => reject(err)
    );
  });
}

export async function loadMany(urls, loader) {
  const settled = await Promise.allSettled(urls.map(u => loadGLB(u, loader)));
  const out = {};
  urls.forEach((url, i) => {
    const r = settled[i];
    out[url] = r.status === "fulfilled" ? r.value : null;
    if (r.status === "rejected") {
      console.warn(`[mukut-viewer] failed to load ${url}:`, r.reason);
    }
  });
  return out;
}

export function normalizeScale(object3D, targetHeightMeters) {
  const box = new THREE.Box3().setFromObject(object3D);
  const size = box.getSize(new THREE.Vector3());
  if (size.y <= 0) return;
  const scale = targetHeightMeters / size.y;
  if (Math.abs(scale - 1.0) > 0.05) {
    object3D.scale.multiplyScalar(scale);
  }
  const box2 = new THREE.Box3().setFromObject(object3D);
  const center = box2.getCenter(new THREE.Vector3());
  const min = box2.min;
  object3D.position.x -= center.x;
  object3D.position.y -= min.y;
  object3D.position.z -= center.z;
}
