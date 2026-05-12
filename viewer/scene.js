/**
 * Three.js scene setup for the Mukut 3D helmet compatibility viewer.
 * Renderer, lights, HDR env map, OrbitControls — all the boilerplate.
 */

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

const SAFFRON = 0xE8B339;
const PAPER = 0x0F0E14;

const isMobile = matchMedia("(pointer: coarse)").matches;

export function createScene(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PAPER);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    powerPreference: "high-performance",
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const aspect = canvas.clientWidth / canvas.clientHeight || 1.0;
  const camera = new THREE.PerspectiveCamera(35, aspect, 0.05, 5);
  camera.position.set(0.42, 0.18, 0.55);

  scene.add(new THREE.AmbientLight(0xFFFFFF, 0.25));
  const key = new THREE.DirectionalLight(0xFFFFFF, isMobile ? 1.3 : 1.0);
  key.position.set(2, 3, 2);
  scene.add(key);

  if (!isMobile) {
    const fill = new THREE.DirectionalLight(0x88AAFF, 0.4);
    fill.position.set(-2, 1, -1);
    scene.add(fill);
  }

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 0.30;
  controls.maxDistance = 1.40;
  controls.minPolarAngle = Math.PI * 0.15;
  controls.maxPolarAngle = Math.PI * 0.85;
  controls.target.set(0, 0.14, 0);
  controls.enablePan = false;
  controls.autoRotate = false;
  controls.update();

  loadEnvironment(scene, renderer).catch(err => {
    console.warn("[mukut-viewer] env map failed, using fallback lighting", err);
  });

  return { scene, renderer, camera, controls };
}

async function loadEnvironment(scene, renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const loader = new RGBELoader();
  const url = "./assets/env/studio_small.hdr";
  return new Promise((resolve, reject) => {
    loader.load(url, (hdrTex) => {
      const env = pmrem.fromEquirectangular(hdrTex).texture;
      scene.environment = env;
      hdrTex.dispose();
      pmrem.dispose();
      resolve(env);
    }, undefined, reject);
  });
}

export function fitCameraToObject(camera, controls, object3D, padding = 1.4) {
  const box = new THREE.Box3().setFromObject(object3D);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const dist = (maxDim / 2) / Math.tan(fov / 2) * padding;
  const dir = new THREE.Vector3(0.7, 0.3, 1.0).normalize();
  camera.position.copy(center).add(dir.multiplyScalar(dist));
  controls.target.copy(center);
  controls.update();
}

export function startRenderLoop(renderer, scene, camera, controls, onFrame) {
  let stopped = false;
  function tick() {
    if (stopped) return;
    controls.update();
    if (onFrame) onFrame();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
  return () => { stopped = true; };
}

export function tintMukutComponent(component) {
  component.traverse(child => {
    if (child.isMesh && child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach(m => {
        if (m.color) m.color.setHex(SAFFRON);
        if (m.emissive) m.emissive.setHex(0x000000);
        if ("metalness" in m) m.metalness = 0.15;
        if ("roughness" in m) m.roughness = 0.55;
      });
    }
  });
}

export function disposeObject(root) {
  if (!root) return;
  root.traverse(obj => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach(m => {
        ["map", "normalMap", "roughnessMap", "metalnessMap", "aoMap", "emissiveMap"].forEach(k => {
          if (m[k]) m[k].dispose();
        });
        m.dispose();
      });
    }
  });
  if (root.parent) root.parent.remove(root);
}

export function handleResize(renderer, camera, canvas) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (canvas.width !== w * window.devicePixelRatio || canvas.height !== h * window.devicePixelRatio) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}
