const reviewConfig = window.MPS_CATALOG || {};
const reviewKey = `mps-smart-cart:${reviewConfig.id || "catalog"}`;
const reviewSummary = document.getElementById("smartCartReviewSummary");
const whatsappButton = document.getElementById("smartCartWhatsapp");

const deliveryOptions = [
  "Parques de Tesistán",
  "Calandrías",
  "Arboreto Residencial",
  "Valle Imperial",
  "La Cima",
  "Zona Real",
  "Otro"
];

const materialOptions = ["Papel adhesivo", "Vinil adhesivo", "Vinil laminado"];
const schoolSheetTypes = ["Rectangular", "Circular", "Lápiz mini", "Lápiz full cover"];
const fonts = [
  { number: 1, name: "Arturo", family: "MPS Font 1" },
  { number: 2, name: "Blueberry", family: "MPS Font 2" },
  { number: 3, name: "Chicken Pie", family: "MPS Font 3" },
  { number: 4, name: "Hello Sunday", family: "MPS Font 4" },
  { number: 5, name: "KG", family: "MPS Font 5" },
  { number: 6, name: "Magical Story", family: "MPS Font 6" },
  { number: 7, name: "Sapphira", family: "MPS Font 7" },
  { number: 8, name: "Sugar Fruit", family: "MPS Font 8" },
  { number: 9, name: "Time Zone", family: "MPS Font 9" },
  { number: 10, name: "Take Print", family: "MPS Font 10" },
  { number: 11, name: "Rosaline Signature", family: "MPS Font 11" },
  { number: 12, name: "Tuesday Love", family: "MPS Font 12" }
];

let designCatalog = [];
let cart = null;

function getSavedCart() {
  try {
    const saved = sessionStorage.getItem(reviewKey);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    return null;
  }
}

function saveCart() {
  if (!cart) return;
  cart.updatedAt = new Date().toISOString();
  sessionStorage.setItem(reviewKey, JSON.stringify(cart));
  updateWhatsappButton();
}

function answer(id) {
  return cart?.answers?.[id] || {};
}

function ensureReviewData() {
  cart.review = cart.review || {};
  cart.review.deliveryPoint = cart.review.deliveryPoint || answer("deliveryPoint").value || "";
  cart.review.packageDesigns = cart.review.packageDesigns || {};
  cart.review.packageMaterials = cart.review.packageMaterials || {};
  cart.review.addons = cart.review.addons || {};
  cart.review.sameNameForAll = cart.review.sameNameForAll ?? true;
  cart.review.packagePeople = cart.review.packagePeople || {};

  packageUnits().forEach((unit) => {
    cart.review.packageDesigns[unit.key] = cart.review.packageDesigns[unit.key] || defaultDesign();
    cart.review.packageMaterials[unit.key] = cart.review.packageMaterials[unit.key] || materialOptions[0];
  });

  addonUnits("Tag para mochila").forEach((unit) => {
    cart.review.addons[unit.key] = cart.review.addons[unit.key] || {};
    cart.review.addons[unit.key].design = cart.review.addons[unit.key].design || onlyKnownDesign();
  });

  [...addonUnits("Nombre en vinil (un color)"), ...addonUnits("Nombre en vinil (dos colores)")].forEach((unit) => {
    cart.review.addons[unit.key] = cart.review.addons[unit.key] || {};
    cart.review.addons[unit.key].font = cart.review.addons[unit.key].font || answer("studentInfo").fonts?.name || 1;
  });

  addonUnits("Plantilla de nombre al contorno con personaje").forEach((unit) => {
    cart.review.addons[unit.key] = cart.review.addons[unit.key] || {};
    cart.review.addons[unit.key].material = cart.review.addons[unit.key].material || materialOptions[0];
  });

  [...addonUnits("Planilla escolar individual - papel"), ...addonUnits("Planilla escolar individual - vinil")].forEach((unit) => {
    cart.review.addons[unit.key] = cart.review.addons[unit.key] || {};
    cart.review.addons[unit.key].design = cart.review.addons[unit.key].design || onlyKnownDesign();
    cart.review.addons[unit.key].type = cart.review.addons[unit.key].type || schoolSheetTypes[0];
    cart.review.addons[unit.key].material = cart.review.addons[unit.key].material || materialOptions[0];
  });

  addonUnits("Tira larga para cuaderno").forEach((unit) => {
    cart.review.addons[unit.key] = cart.review.addons[unit.key] || {};
    cart.review.addons[unit.key].design = cart.review.addons[unit.key].design || onlyKnownDesign();
  });
}

function expandItems(items = []) {
  return items.flatMap((item) => Array.from({ length: item.quantity || 0 }, (_, index) => ({
    key: `${item.label}-${index + 1}`.toLowerCase().replace(/\s+/g, "-"),
    label: item.quantity > 1 ? `${item.label} #${index + 1}` : item.label,
    baseLabel: item.label,
    index: index + 1
  })));
}

function packageUnits() {
  return expandItems(answer("package").items || []);
}

function addonUnits(label) {
  return expandItems((answer("addons").items || []).filter((item) => item.label === label));
}

function designName(number) {
  const found = designCatalog.find((design) => String(design.number) === String(number));
  return found ? found.name : `Diseño ${number || ""}`.trim();
}

function designOptions(selected) {
  return designCatalog.map((design) => `
    <option value="${design.number}"${String(selected) === String(design.number) ? " selected" : ""}>
      ${design.number}. ${esc(design.name)}
    </option>
  `).join("");
}

function fontOptions(selected) {
  return fonts.map((font) => `
    <option value="${font.number}"${String(selected) === String(font.number) ? " selected" : ""}>
      ${font.number}. ${font.name}
    </option>
  `).join("");
}

function selectOptions(options, selected) {
  const fullOptions = selected && !options.includes(selected) ? [...options, selected] : options;
  return fullOptions.map((option) => `<option value="${esc(option)}"${option === selected ? " selected" : ""}>${option}</option>`).join("");
}

function esc(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function defaultDesign() {
  return answer("designModel").modelNumber || "";
}

function onlyKnownDesign() {
  const designs = Object.values(cart.review?.packageDesigns || {}).filter(Boolean);
  const unique = [...new Set(designs)];
  if (unique.length === 1) return unique[0];
  return defaultDesign();
}

function renderDelivery() {
  return `
    <section class="review-section">
      <h2>Punto de entrega</h2>
      <label class="review-field">
        <span>Entrega</span>
        <select data-path="deliveryPoint">${selectOptions(deliveryOptions, cart.review.deliveryPoint)}</select>
      </label>
    </section>
  `;
}

function renderPackages() {
  const units = packageUnits();
  return `
    <section class="review-section">
      <h2>Paquetes</h2>
      <div class="review-list">
        ${units.map((unit) => `
          <article class="review-line">
            <strong>(${unit.index}) ${unit.baseLabel}</strong>
            <label>
              <span>Diseño</span>
              <select data-path="packageDesigns.${unit.key}">${designOptions(cart.review.packageDesigns[unit.key] || defaultDesign())}</select>
            </label>
            <label>
              <span>Material</span>
              <select data-path="packageMaterials.${unit.key}">${selectOptions(materialOptions, cart.review.packageMaterials[unit.key] || materialOptions[0])}</select>
            </label>
          </article>
        `).join("") || "<p>No hay paquetes seleccionados.</p>"}
      </div>
    </section>
  `;
}

function renderPencilLabels() {
  const items = answer("pencilLabels").items || [];
  return `
    <section class="review-section">
      <h2>Etiquetas para lápiz</h2>
      <div class="review-list compact">
        ${items.map((item) => `
          <article class="review-line">
            <strong>${item.label}</strong>
            <span>${item.value}</span>
          </article>
        `).join("") || "<p>No aplica para los paquetes elegidos.</p>"}
      </div>
    </section>
  `;
}

function renderVinylName(label, key, outline = false) {
  const units = addonUnits(label);
  return units.map((unit) => {
    const data = cart.review.addons[unit.key] || {};
    return `
      <article class="review-line">
        <strong>${unit.label}</strong>
        <label>
          <span>Tipografía</span>
          <select data-path="addons.${unit.key}.font">${fontOptions(data.font || answer("studentInfo").fonts?.name || 1)}</select>
        </label>
        <div class="review-font-preview${outline ? " outline" : ""}" data-font-preview="${unit.key}">
          ${esc(answer("studentInfo").values?.name) || "Nombre"}
        </div>
      </article>
    `;
  }).join("");
}

function renderDesignAddon(label) {
  return addonUnits(label).map((unit) => {
    const data = cart.review.addons[unit.key] || {};
    return `
      <article class="review-line">
        <strong>${unit.label}</strong>
        <label>
          <span>Diseño</span>
          <select data-path="addons.${unit.key}.design">${designOptions(data.design || onlyKnownDesign())}</select>
        </label>
      </article>
    `;
  }).join("");
}

function renderSchoolSheets() {
  const units = [
    ...addonUnits("Planilla escolar individual - papel"),
    ...addonUnits("Planilla escolar individual - vinil")
  ];

  return units.map((unit) => {
    const data = cart.review.addons[unit.key] || {};
    return `
      <article class="review-line">
        <strong>${unit.label}</strong>
        <label>
          <span>Diseño</span>
          <select data-path="addons.${unit.key}.design">${designOptions(data.design || onlyKnownDesign())}</select>
        </label>
        <label>
          <span>Tipo</span>
          <select data-path="addons.${unit.key}.type">${selectOptions(schoolSheetTypes, data.type || schoolSheetTypes[0])}</select>
        </label>
        <label>
          <span>Material</span>
          <select data-path="addons.${unit.key}.material">${selectOptions(materialOptions, data.material || materialOptions[0])}</select>
        </label>
      </article>
    `;
  }).join("");
}

function renderNotebookStrips() {
  return addonUnits("Tira larga para cuaderno").map((unit) => {
    const data = cart.review.addons[unit.key] || {};
    return `
      <article class="review-line">
        <strong>${unit.label}</strong>
        <label>
          <span>Datos de tira</span>
          <input type="text" data-path="addons.${unit.key}.text" value="${esc(data.text)}" placeholder="Ej. Nombre completo">
        </label>
        <label>
          <span>Diseño</span>
          <select data-path="addons.${unit.key}.design">${designOptions(data.design || onlyKnownDesign())}</select>
        </label>
      </article>
    `;
  }).join("");
}

function renderContourSheets() {
  return addonUnits("Plantilla de nombre al contorno con personaje").map((unit) => {
    const data = cart.review.addons[unit.key] || {};
    return `
      <article class="review-line">
        <strong>${unit.label}</strong>
        <label>
          <span>Personaje</span>
          <input type="text" data-path="addons.${unit.key}.character" value="${esc(data.character)}" placeholder="Personaje">
        </label>
        <label>
          <span>Material</span>
          <select data-path="addons.${unit.key}.material">${selectOptions(materialOptions, data.material || materialOptions[0])}</select>
        </label>
      </article>
    `;
  }).join("");
}

function renderAddons() {
  const html = [
    renderDesignAddon("Tag para mochila"),
    renderVinylName("Nombre en vinil (un color)", "vinylOne"),
    renderVinylName("Nombre en vinil (dos colores)", "vinylTwo", true),
    renderContourSheets(),
    renderSchoolSheets(),
    renderNotebookStrips()
  ].filter(Boolean).join("");

  return `
    <section class="review-section">
      <h2>Complementos</h2>
      <div class="review-list">${html || "<p>No hay complementos seleccionados.</p>"}</div>
    </section>
  `;
}

function renderPersonalData() {
  const info = answer("studentInfo");
  const values = info.values || {};
  const savedFonts = info.fonts || {};
  const units = packageUnits();

  return `
    <section class="review-section">
      <h2>Datos para personalizar</h2>
      <label class="review-check">
        <input type="checkbox" data-path="sameNameForAll"${cart.review.sameNameForAll ? " checked" : ""}>
        <span>Mismo nombre para todos los paquetes</span>
      </label>
      <div class="review-name-editor">
        <label>
          <span>Nombre</span>
          <input type="text" data-answer="studentInfo.values.name" value="${esc(values.name)}">
        </label>
        <label>
          <span>Tipografía nombre</span>
          <select data-answer="studentInfo.fonts.name">${fontOptions(savedFonts.name || 1)}</select>
        </label>
        <label>
          <span>Apellidos</span>
          <input type="text" data-answer="studentInfo.values.lastName" value="${esc(values.lastName)}">
        </label>
        <label>
          <span>Tipografía apellidos</span>
          <select data-answer="studentInfo.fonts.lastName">${fontOptions(savedFonts.lastName || 5)}</select>
        </label>
        <label>
          <span>Grupo</span>
          <input type="text" data-answer="studentInfo.values.group" value="${esc(values.group)}">
        </label>
        <div class="review-name-preview">
          <span data-main-name>${esc(values.name) || "Nombre"}</span>
          <strong data-main-lastname>${esc(values.lastName) || "Apellidos"}</strong>
        </div>
      </div>
      <div class="review-list${cart.review.sameNameForAll ? " is-hidden" : ""}" id="packagePeople">
        ${units.map((unit) => {
          const person = cart.review.packagePeople[unit.key] || {};
          return `
            <article class="review-line">
              <strong>${unit.label}</strong>
              <label><span>Nombre</span><input type="text" data-path="packagePeople.${unit.key}.name" value="${esc(person.name || values.name)}"></label>
              <label><span>Apellidos</span><input type="text" data-path="packagePeople.${unit.key}.lastName" value="${esc(person.lastName || values.lastName)}"></label>
              <label><span>Grupo</span><input type="text" data-path="packagePeople.${unit.key}.group" value="${esc(person.group || values.group)}"></label>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function setDeep(target, path, value) {
  const parts = path.split(".");
  let ref = target;
  parts.slice(0, -1).forEach((part) => {
    ref[part] = ref[part] || {};
    ref = ref[part];
  });
  ref[parts.at(-1)] = value;
}

function bindReviewEvents() {
  reviewSummary.querySelectorAll("[data-path]").forEach((control) => {
    control.addEventListener("input", () => {
      const value = control.type === "checkbox" ? control.checked : control.value;
      setDeep(cart.review, control.dataset.path, value);
      saveCart();
      if (control.dataset.path === "sameNameForAll") renderReview();
      refreshFontPreviews();
    });
    control.addEventListener("change", () => control.dispatchEvent(new Event("input")));
  });

  reviewSummary.querySelectorAll("[data-answer]").forEach((control) => {
    control.addEventListener("input", () => {
      setDeep(cart.answers, control.dataset.answer, control.value);
      cart.answers.studentInfo.type = "textFields";
      cart.answers.studentInfo.value = [
        cart.answers.studentInfo.values?.name,
        cart.answers.studentInfo.values?.lastName,
        cart.answers.studentInfo.values?.group
      ].filter(Boolean).join(" ");
      saveCart();
      refreshFontPreviews();
    });
    control.addEventListener("change", () => control.dispatchEvent(new Event("input")));
  });
}

function refreshFontPreviews() {
  const info = answer("studentInfo");
  const nameFont = fonts.find((font) => String(font.number) === String(info.fonts?.name || 1));
  const lastFont = fonts.find((font) => String(font.number) === String(info.fonts?.lastName || 5));
  reviewSummary.querySelector("[data-main-name]")?.style.setProperty("font-family", `'${nameFont.family}', cursive`);
  reviewSummary.querySelector("[data-main-lastname]")?.style.setProperty("font-family", `'${lastFont.family}', cursive`);
  reviewSummary.querySelectorAll("[data-font-preview]").forEach((preview) => {
    const key = preview.dataset.fontPreview;
    const selected = cart.review.addons?.[key]?.font || info.fonts?.name || 1;
    const font = fonts.find((item) => String(item.number) === String(selected)) || fonts[0];
    preview.style.fontFamily = `'${font.family}', cursive`;
  });
}

function renderReview() {
  if (!cart || !cart.answers) {
    reviewSummary.innerHTML = `
      <p>No hay preferencias guardadas todavía.</p>
      <a class="catalog-button secondary" href="./">Volver al catálogo</a>
    `;
    whatsappButton.classList.remove("whatsapp-ready");
    return;
  }

  ensureReviewData();
  reviewSummary.innerHTML = `
    ${renderDelivery()}
    ${renderPackages()}
    ${renderPencilLabels()}
    ${renderAddons()}
    ${renderPersonalData()}
  `;

  bindReviewEvents();
  refreshFontPreviews();
  saveCart();
}

function formatDesign(value) {
  return value ? `${value}. ${designName(value)}` : "Sin diseño";
}

function buildWhatsappText() {
  const lines = [
    "Hola, quiero cotizar este pedido.",
    `Catálogo: ${cart.catalog?.name || reviewConfig.name || "Catálogo"}`,
    "",
    `Punto de entrega: ${cart.review.deliveryPoint || "Sin definir"}`,
    "",
    "Paquetes:"
  ];

  packageUnits().forEach((unit) => {
    lines.push(`- ${unit.label}: ${formatDesign(cart.review.packageDesigns[unit.key] || defaultDesign())}; Material: ${cart.review.packageMaterials[unit.key] || materialOptions[0]}`);
  });

  const pencil = answer("pencilLabels").items || [];
  if (pencil.length) {
    lines.push("", "Etiquetas para lápiz:");
    pencil.forEach((item) => lines.push(`- ${item.label}: ${item.value}`));
  }

  lines.push("", "Complementos:");
  Object.entries(cart.review.addons || {}).forEach(([key, value]) => {
    const details = Object.entries(value).map(([field, detail]) => `${field}: ${field === "design" ? formatDesign(detail) : detail}`).join("; ");
    lines.push(`- ${key}: ${details}`);
  });

  const info = answer("studentInfo");
  lines.push("", "Datos:");
  lines.push(`- Nombre: ${info.values?.name || ""} (${info.fonts?.name || "sin fuente"})`);
  lines.push(`- Apellidos: ${info.values?.lastName || ""} (${info.fonts?.lastName || "sin fuente"})`);
  lines.push(`- Grupo: ${info.values?.group || ""}`);
  lines.push(`- Mismo nombre para todos: ${cart.review.sameNameForAll ? "Sí" : "No"}`);

  if (!cart.review.sameNameForAll) {
    Object.entries(cart.review.packagePeople || {}).forEach(([key, person]) => {
      lines.push(`  • ${key}: ${person.name || ""} ${person.lastName || ""} - ${person.group || ""}`);
    });
  }

  return lines.join("\n");
}

function updateWhatsappButton() {
  const phone = reviewConfig.whatsapp || "5213330438386";
  whatsappButton.href = `https://wa.me/${phone}?text=${encodeURIComponent(buildWhatsappText())}`;
}

async function loadDesignCatalog() {
  try {
    const response = await fetch("../catalogos/data/personajes-designs.json");
    designCatalog = await response.json();
  } catch (error) {
    designCatalog = Array.from({ length: 44 }, (_, index) => ({
      number: index + 1,
      name: `Diseño ${index + 1}`
    }));
  }
}

async function initReview() {
  cart = getSavedCart();
  await loadDesignCatalog();
  renderReview();
}

initReview();
