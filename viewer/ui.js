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

  const firstBrand = brands.keys().next().value;
  if (firstBrand) {
    pillRow.querySelector(`[data-brand="${CSS.escape(firstBrand)}"]`)?.click();
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
    const isProxy = h.is_proxy === true;
    if (isProxy) {
      conf.className = "mv-conf mv-conf-proxy";
      conf.textContent = "Proxy form-factor";
    } else if (h.segment === "india-budget" || h.segment === "india-premium") {
      conf.className = "mv-conf mv-conf-estimated";
      conf.textContent = "~80% Estimated";
    } else {
      conf.className = "mv-conf mv-conf-verified";
      conf.textContent = "98% Verified";
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
  const items = _helmetsDb.helmets.map(h => {
    const a = h.attribution;
    if (!a || !a.source_url || a.source_url === "TBD") return null;
    return `<li><a href="${escapeHtml(a.source_url)}" target="_blank" rel="noopener">${escapeHtml(h.display_name)}</a> by ${escapeHtml(a.author)} (${escapeHtml(a.license)})</li>`;
  }).filter(Boolean).join("");
  container.innerHTML = `<details class="mv-credits"><summary>3D model credits (CC-BY)</summary><ul>${items}</ul></details>`;
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
