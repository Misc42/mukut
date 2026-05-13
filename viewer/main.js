/**
 * Mukut 3D helmet compatibility viewer — entry point.
 *
 * Boots: scene + renderer + lights + HDR env + OrbitControls.
 * Loads: Mukut component GLBs in parallel; helmet GLBs lazy on pick.
 * Wires: helmet picker UI, email-capture fallback, error states.
 * Attaches: each Mukut component to its anchor on the selected helmet.
 *
 * Debug: append ?debug=1 to URL to render AxesHelper gizmos at each anchor
 * point, in-page anchor coord readout, and gracefully label every component.
 */

import {
  createScene,
  startRenderLoop,
  handleResize,
  disposeObject,
  tintMukutComponent,
  fitCameraToObject,
} from "./scene.js";
import { getLoader, loadGLB, normalizeScale } from "./loader.js";
import { attachComponent, detachAllComponents, renderAnchorGizmos } from "./anchors.js";
import { initUI, bindHelmetPicker, showLoading, hideLoading, showError, showBlockFallback, showHelmetNotInDB, hideNotInDB } from "./ui.js";
import { loadGenericDemoHelmet, createProceduralMukutComponent, fixWebARrocksAGVMaterials } from "./fallback.js";

const HELMETS_JSON = "./data/helmets.json";
const ANCHORS_JSON = "./data/anchors.json";

const DEBUG = new URLSearchParams(location.search).has("debug");

let _state = {
  helmetsDb: null,
  anchorsDb: null,
  components: {},
  currentHelmet: null,
  currentHelmetId: null,
  currentGizmos: [],
};

async function boot() {
  const canvas = document.getElementById("viewer-canvas");
  if (!canvas) {
    console.error("[mukut-viewer] no canvas#viewer-canvas in DOM");
    return;
  }

  if (!supportsWebGL()) {
    showError(canvas, "Your browser doesn't support WebGL — here's a static preview instead.");
    return;
  }

  const { scene, renderer, camera, controls } = createScene(canvas);
  const loader = getLoader(renderer);

  window.addEventListener("resize", () => handleResize(renderer, camera, canvas));
  handleResize(renderer, camera, canvas);

  startRenderLoop(renderer, scene, camera, controls);

  try {
    const [helmetsRes, anchorsRes] = await Promise.all([
      fetch(HELMETS_JSON).then(r => r.json()),
      fetch(ANCHORS_JSON).then(r => r.json()),
    ]);
    _state.helmetsDb = helmetsRes;
    _state.anchorsDb = anchorsRes;
  } catch (err) {
    console.error("[mukut-viewer] failed to load helmet DB", err);
    showError(canvas, "Couldn't load helmet database. Try refreshing.");
    return;
  }

  initUI(_state.helmetsDb);
  bindHelmetPicker((helmetId) => selectHelmet(helmetId, scene, camera, controls, loader, canvas));

  showLoading(canvas, "Mukut module utha rahe hain...");
  for (const c of _state.helmetsDb.mukut_components) {
    let obj = null;
    try {
      obj = await loadGLB(c.glb_path, loader);
      tintMukutComponent(obj);
    } catch (_err) {
      console.info(`[mukut-viewer] using procedural fallback for ${c.id} (GLB not present at ${c.glb_path})`);
      obj = createProceduralMukutComponent(c.id);
    }
    _state.components[c.anchor_key] = obj;
  }
  hideLoading(canvas);

  const claimMatched = _state.helmetsDb.helmets.find(h => h.is_claim_matched === true);
  const firstHelmet = claimMatched || _state.helmetsDb.helmets[0];
  if (firstHelmet) {
    console.info("[mukut-viewer] boot: auto-loading first claim-matched helmet:", firstHelmet.id, "GLB path:", firstHelmet.glb_path);
    try {
      await selectHelmet(firstHelmet.id, scene, camera, controls, loader, canvas);
      console.info("[mukut-viewer] boot: auto-load complete");
    } catch (err) {
      console.error("[mukut-viewer] boot: auto-load failed:", err);
      showError(canvas, `Auto-load error: ${err.message || err}`);
    }
  }
}

async function selectHelmet(helmetId, scene, camera, controls, loader, canvas) {
  if (_state.currentHelmetId === helmetId) return;

  const meta = _state.helmetsDb.helmets.find(h => h.id === helmetId);
  if (!meta) {
    showBlockFallback(canvas, helmetId);
    return;
  }

  showLoading(canvas, `Helmet utha rahe hain — ${meta.display_name}...`);

  if (_state.currentHelmet) {
    detachAllComponents(_state.currentHelmet, Object.values(_state.components));
    if (DEBUG) _state.currentGizmos.forEach(g => g.parent?.remove(g));
    _state.currentGizmos = [];
    disposeObject(_state.currentHelmet);
    _state.currentHelmet = null;
  }

  let helmetObj;
  let isGenericDemo = false;
  try {
    console.info(`[mukut-viewer] loading real GLB: ${meta.glb_path}`);
    helmetObj = await loadGLB(meta.glb_path, loader);
    console.info(`[mukut-viewer] GLB loaded for ${helmetId}, normalizing scale...`);
    normalizeScale(helmetObj, meta.shell_height_m);
    if (meta.needs_alpha_fix) {
      console.info(`[mukut-viewer] applying alpha-fix for ${helmetId}`);
      fixWebARrocksAGVMaterials(helmetObj);
    }
    console.info(`[mukut-viewer] real GLB pipeline complete for ${helmetId}`);
  } catch (_err) {
    console.info(`[mukut-viewer] ${helmetId} not in DB — real GLB missing at ${meta.glb_path}:`, _err.message || _err);
    hideLoading(canvas);
    const banner = document.getElementById("viewer-fallback-banner");
    if (banner) banner.style.display = "none";
    showHelmetNotInDB(canvas, meta, async () => {
      hideNotInDB(canvas);
      showLoading(canvas, "Generic Mukut fit preview load kar rahe hain...");
      try {
        const demo = await loadGenericDemoHelmet(loader);
        normalizeScale(demo, meta.shell_height_m);
        await mountHelmet(demo, helmetId, true, scene, camera, controls, canvas);
      } catch (err) {
        console.error("[mukut-viewer] generic demo load failed", err);
        showError(canvas, "Demo preview load failed.");
        hideLoading(canvas);
      }
    });
    return;
  }
  await mountHelmet(helmetObj, helmetId, false, scene, camera, controls, canvas);
}

async function mountHelmet(helmetObj, helmetId, isGenericDemo, scene, camera, controls, canvas) {
  scene.add(helmetObj);
  _state.currentHelmet = helmetObj;
  _state.currentHelmetId = helmetId;

  const helmetAnchors = isGenericDemo
    ? _state.anchorsDb._default?.anchors
    : (_state.anchorsDb[helmetId]?.anchors || _state.anchorsDb._default?.anchors);
  if (helmetAnchors) {
    _state.helmetsDb.mukut_components.forEach(c => {
      const comp = _state.components[c.anchor_key];
      const anchor = helmetAnchors[c.anchor_key];
      if (comp && anchor) {
        attachComponent(comp, anchor, helmetObj);
      }
    });
    if (DEBUG) {
      _state.currentGizmos = renderAnchorGizmos(helmetObj, helmetAnchors);
    }
  } else {
    console.warn(`[mukut-viewer] no anchors for ${helmetId} in anchors.json`);
  }

  fitCameraToObject(camera, controls, helmetObj, 1.6);
  hideLoading(canvas);

  const banner = document.getElementById("viewer-fallback-banner");
  if (banner) banner.style.display = isGenericDemo ? "block" : "none";
}

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch (_) {
    return false;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
