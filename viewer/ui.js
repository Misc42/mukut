/**
 * Viewer UI: brand-pill picker, model grid, loading bar, error states,
 * email-capture fallback. Pure DOM + vanilla JS, no framework.
 */

let _helmetsDb = null;
let _onPickCallback = null;

export function initUI(helmetsDb) {
  _helmetsDb = helmetsDb;
  renderBrandPills();
  renderCreditsPanel();
}

export function bindHelmetPicker(onPick) {
  _onPickCallback = onPick;
}

function renderBrandPills() {
  const container = document.getElementById("viewer-picker");
  if (!container) return;

  const brands = new Map();
  _helmetsDb.helmets.forEach(h => {
    if (!brands.has(h.brand)) brands.set(h.brand, []);
    brands.get(h.brand).push(h);
  });

  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "mv-picker";

  const pillRow = document.createElement("div");
  pillRow.className = "mv-pillrow";
  let activeBrand = null;

  const modelGrid = document.createElement("div");
  modelGrid.className = "mv-modelgrid";

  brands.forEach((helmets, brand) => {
    const pill = document.createElement("button");
    pill.className = "mv-pill";
    pill.textContent = brand;
    pill.dataset.brand = brand;
    pill.addEventListener("click", () => {
      [...pillRow.children].forEach(c => c.classList.remove("mv-pill-active"));
      pill.classList.add("mv-pill-active");
      activeBrand = brand;
      renderModelGrid(modelGrid, helmets);
      if (helmets.length > 0 && _onPickCallback) {
        _onPickCallback(helmets[0].id);
      }
    });
    pillRow.appendChild(pill);
  });

  const blockBtn = document.createElement("button");
  blockBtn.className = "mv-pill mv-pill-other";
  blockBtn.textContent = "Other / Don't see mine";
  blockBtn.addEventListener("click", () => {
    [...pillRow.children].forEach(c => c.classList.remove("mv-pill-active"));
    blockBtn.classList.add("mv-pill-active");
    modelGrid.innerHTML = "";
    showInlineEmailCapture(modelGrid);
  });
  pillRow.appendChild(blockBtn);

  wrap.appendChild(pillRow);
  wrap.appendChild(modelGrid);
  container.appendChild(wrap);

  const claimBrand = [..._helmetsDb.helmets].find(h => h.is_claim_matched === true)?.brand;
  const initialBrand = claimBrand || brands.keys().next().value;
  if (initialBrand) {
    [...pillRow.children].forEach(c => c.classList.remove("mv-pill-active"));
    const initialPill = pillRow.querySelector(`[data-brand="${CSS.escape(initialBrand)}"]`);
    if (initialPill) {
      initialPill.classList.add("mv-pill-active");
      renderModelGrid(modelGrid, brands.get(initialBrand));
    }
  }
}

function renderModelGrid(grid, helmets) {
  grid.innerHTML = "";
  helmets.forEach(h => {
    const card = document.createElement("button");
    card.className = "mv-model";
    card.dataset.helmetId = h.id;

    const thumb = document.createElement("div");
    thumb.className = "mv-model-thumb";
    if (h.thumbnail_path) {
      const img = document.createElement("img");
      img.src = h.thumbnail_path;
      img.alt = h.display_name;
      img.loading = "lazy";
      img.addEventListener("error", () => {
        thumb.classList.add("mv-thumb-fallback");
        thumb.textContent = h.brand[0];
      });
      thumb.appendChild(img);
    } else {
      thumb.classList.add("mv-thumb-fallback");
      thumb.textContent = h.brand[0];
    }

    const label = document.createElement("span");
    label.className = "mv-model-label";
    label.textContent = h.display_name;

    const conf = document.createElement("span");
    if (h.is_claim_matched === true) {
      conf.className = "mv-conf mv-conf-claim-matched";
      conf.textContent = "Designer claim-matched";
    } else {
      conf.className = "mv-conf mv-conf-not-in-db";
      conf.textContent = "Not in DB yet";
    }

    card.appendChild(thumb);
    card.appendChild(label);
    card.appendChild(conf);

    card.addEventListener("click", () => {
      [...grid.children].forEach(c => c.classList.remove("mv-model-active"));
      card.classList.add("mv-model-active");
      if (_onPickCallback) _onPickCallback(h.id);
    });
    grid.appendChild(card);
  });
  const firstCard = grid.querySelector(".mv-model");
  if (firstCard) firstCard.classList.add("mv-model-active");
}

function showInlineEmailCapture(container) {
  container.innerHTML = `
    <div class="mv-block">
      <p class="mv-block-title">Hmm — your helmet isn't in our DB yet.</p>
      <p class="mv-block-sub">Tell us which helmet you ride; we'll add it. (Closed alpha — limited slots.)</p>
      <form class="mv-email-form" action="https://formspree.io/f/TODO" method="POST">
        <input type="text" name="helmet_model" placeholder="Your helmet brand + model (e.g. Vega Crux DX)" required>
        <input type="email" name="email" placeholder="Your email" required>
        <button type="submit">Add my helmet to the list</button>
      </form>
      <p class="mv-block-fineprint">No spam. We email once when your helmet is supported.</p>
    </div>
  `;
}

function renderCreditsPanel() {
  const container = document.getElementById("viewer-credits");
  if (!container) return;
  const helmetItems = _helmetsDb.helmets.map(h => {
    const a = h.attribution;
    if (!a || !a.source_url || a.source_url === "TBD") return null;
    return `<li><a href="${escapeHtml(a.source_url)}" target="_blank" rel="noopener">${escapeHtml(h.display_name)}</a> by ${escapeHtml(a.author)} (${escapeHtml(a.license)})</li>`;
  }).filter(Boolean).join("");

  const demoItems = [
    { name: "Motorcycle Helmet (AGV-modeled)", author: "WebAR.rocks", license: "MIT", url: "https://github.com/WebAR-rocks/WebAR.rocks.face" },
    { name: "Full Face Motorcycle Helmet 3D Scan", author: "RandyMay", license: "CC0", url: "https://www.printables.com/model/502088-full-face-motorcycle-helmet-3d-scan" },
    { name: "Motorcycle Helmet (sport-touring)", author: "ANDRIANIAINAToky via rynfkn/FP-Grafkom", license: "CC-BY-4.0", url: "https://github.com/rynfkn/FP-Grafkom" },
    { name: "Low-poly Racing Helmet", author: "OpenGameArt contributor", license: "CC-BY-SA-4.0", url: "https://opengameart.org/content/low-poly-racing-helmet" },
    { name: "Motorcycle Helmet (premium V-Ray PBR)", author: "sayedgamal655 (via SceneView catalog)", license: "CC-BY-4.0", url: "https://sketchfab.com/3d-models/moto-helmet-6c75ac1b13a047bd86742f37ce25adac" },
    { name: "AI-generated helmet variants (5×)", author: "Pollinations.ai + TripoSR pipeline", license: "MIT (TripoSR) + public-domain (Pollinations)", url: "https://github.com/VAST-AI-Research/TripoSR" },
  ];
  const demoHtml = demoItems.map(d =>
    `<li><a href="${escapeHtml(d.url)}" target="_blank" rel="noopener">${escapeHtml(d.name)}</a> by ${escapeHtml(d.author)} (${escapeHtml(d.license)})</li>`
  ).join("");

  container.innerHTML = `
    <details class="mv-credits">
      <summary>3D model credits</summary>
      <p class="mv-credits-section">Demo placeholders currently in use:</p>
      <ul>${demoHtml}</ul>
      <p class="mv-credits-section">Brand-specific helmet CADs (target sources, swap-in as committed):</p>
      <ul>${helmetItems}</ul>
    </details>
  `;
}

export function showHelmetNotInDB(canvas, meta, onShowDemo) {
  const wrap = canvas.parentElement;
  let ov = wrap.querySelector(".mv-notindb");
  if (!ov) {
    ov = document.createElement("div");
    ov.className = "mv-overlay mv-notindb";
    wrap.appendChild(ov);
  }
  ov.innerHTML = `
    <div class="mv-notindb-card">
      <p class="mv-notindb-eyebrow">Helmet not in DB yet</p>
      <h3 class="mv-notindb-title">${escapeHtml(meta.display_name)}</h3>
      <p class="mv-notindb-body">Iska real CAD abhi public domain mein available nahi hai. Hum brand-specific CADs manually source kar rahe hain — drop ya tum bata sakte ho kaunsa helmet hai.</p>
      <div class="mv-notindb-actions">
        <button class="mv-notindb-demo-btn" type="button">Generic Mukut fit preview dikhao →</button>
      </div>
      <p class="mv-notindb-fineprint">Generic preview ek demo helmet pe Mukut clip karke dikhata hai — your helmet shape may differ slightly.</p>
    </div>
  `;
  ov.style.display = "flex";
  const btn = ov.querySelector(".mv-notindb-demo-btn");
  if (btn) btn.addEventListener("click", () => {
    if (onShowDemo) onShowDemo();
  });
}

export function hideNotInDB(canvas) {
  const ov = canvas.parentElement?.querySelector(".mv-notindb");
  if (ov) ov.style.display = "none";
}

export function showLoading(canvas, message) {
  const ov = ensureOverlay(canvas, "mv-loading");
  ov.innerHTML = `<div class="mv-loader"></div><p>${escapeHtml(message || "Loading...")}</p>`;
  ov.style.display = "flex";
}

export function hideLoading(canvas) {
  const ov = canvas.parentElement?.querySelector(".mv-loading");
  if (ov) ov.style.display = "none";
}

export function showError(canvas, message) {
  const ov = ensureOverlay(canvas, "mv-error");
  ov.innerHTML = `<p>${escapeHtml(message)}</p>`;
  ov.style.display = "flex";
}

export function showBlockFallback(canvas, helmetId) {
  const ov = ensureOverlay(canvas, "mv-block-overlay");
  ov.innerHTML = `<p>Helmet '${escapeHtml(helmetId)}' nahi mila. Pick a different one from the list or use the "Other" option to request it.</p>`;
  ov.style.display = "flex";
}

function ensureOverlay(canvas, cls) {
  const wrap = canvas.parentElement;
  let ov = wrap.querySelector("." + cls);
  if (!ov) {
    ov = document.createElement("div");
    ov.className = `mv-overlay ${cls}`;
    wrap.appendChild(ov);
  }
  return ov;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[c]);
}
