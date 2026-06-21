const WHATSAPP_NUMBER = "5213330438386";

const catalog = [
  {
    category: "Etiquetas escolares",
    products: [
      { name: "Paquete basico de etiquetas", price: 120, materials: ["Papel fotografico", "Vinil adhesivo"] },
      { name: "Etiquetas para utiles", price: 95, materials: ["Vinil adhesivo", "Couche adhesivo"] },
      { name: "Etiquetas para termo/lonchera", price: 140, materials: ["Vinil resistente"] }
    ]
  },
  {
    category: "Party favors",
    products: [
      { name: "Candy box personalizada", price: 35, materials: ["Cartulina", "Opalina"] },
      { name: "Vasos personalizados", price: 42, materials: ["Vinil", "Impresion adhesiva"] },
      { name: "Kit de fiesta", price: 280, materials: ["Mixto"] }
    ]
  },
  {
    category: "Papeleria para negocios",
    products: [
      { name: "Tarjetas de agradecimiento", price: 180, materials: ["Opalina", "Sundance Linen"] },
      { name: "Etiquetas para producto", price: 150, materials: ["Couche adhesivo", "Vinil adhesivo"] },
      { name: "Papeleria de marca", price: 320, materials: ["Mixto"] }
    ]
  },
  {
    category: "Diseno digital",
    products: [
      { name: "Invitacion digital", price: 250, materials: ["Archivo digital"] },
      { name: "Tarjeta digital", price: 180, materials: ["Archivo digital"] },
      { name: "Plantilla para redes", price: 220, materials: ["Archivo digital"] }
    ]
  }
];

const state = {
  items: []
};

const els = {
  form: document.getElementById("orderForm"),
  category: document.getElementById("categorySelect"),
  product: document.getElementById("productSelect"),
  material: document.getElementById("materialSelect"),
  quantity: document.getElementById("quantityInput"),
  qtyMinus: document.getElementById("qtyMinus"),
  qtyPlus: document.getElementById("qtyPlus"),
  items: document.getElementById("itemsContainer"),
  empty: document.getElementById("emptyState"),
  itemCount: document.getElementById("itemCount"),
  subtotal: document.getElementById("subtotalText"),
  total: document.getElementById("totalText"),
  whatsapp: document.getElementById("whatsappBtn"),
  customerName: document.getElementById("customerName"),
  customerPhone: document.getElementById("customerPhone"),
  customerEmail: document.getElementById("customerEmail"),
  deliveryDate: document.getElementById("deliveryDate"),
  mainText: document.getElementById("mainText"),
  theme: document.getElementById("themeInput"),
  size: document.getElementById("sizeInput"),
  reference: document.getElementById("referenceInput"),
  notes: document.getElementById("notesInput")
};

function money(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(value);
}

function selectedCategory() {
  return catalog.find((group) => group.category === els.category.value) || catalog[0];
}

function selectedProduct() {
  const group = selectedCategory();
  return group.products.find((product) => product.name === els.product.value) || group.products[0];
}

function fillSelect(select, options) {
  select.innerHTML = "";
  options.forEach((option) => {
    const node = document.createElement("option");
    node.value = option;
    node.textContent = option;
    select.appendChild(node);
  });
}

function loadCategories() {
  fillSelect(els.category, catalog.map((group) => group.category));
  loadProducts();
}

function loadProducts() {
  const group = selectedCategory();
  fillSelect(els.product, group.products.map((product) => product.name));
  loadMaterials();
}

function loadMaterials() {
  fillSelect(els.material, selectedProduct().materials);
}

function updateQuantity(delta) {
  const current = Number.parseInt(els.quantity.value, 10) || 1;
  els.quantity.value = Math.max(1, current + delta);
}

function getCustomization() {
  return {
    mainText: els.mainText.value.trim(),
    theme: els.theme.value.trim(),
    size: els.size.value.trim(),
    reference: els.reference.value.trim(),
    notes: els.notes.value.trim()
  };
}

function clearProductFields() {
  els.quantity.value = 1;
  els.mainText.value = "";
  els.theme.value = "";
  els.size.value = "";
  els.reference.value = "";
  els.notes.value = "";
}

function addItem(event) {
  event.preventDefault();

  const product = selectedProduct();
  const quantity = Math.max(1, Number.parseInt(els.quantity.value, 10) || 1);

  state.items.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    category: els.category.value,
    name: product.name,
    material: els.material.value,
    quantity,
    unitPrice: product.price,
    customization: getCustomization()
  });

  clearProductFields();
  render();
}

function removeItem(id) {
  state.items = state.items.filter((item) => item.id !== id);
  render();
}

function render() {
  els.items.innerHTML = "";
  els.empty.hidden = state.items.length > 0;
  els.whatsapp.disabled = state.items.length === 0;
  els.itemCount.textContent = `${state.items.length} item${state.items.length === 1 ? "" : "s"}`;

  state.items.forEach((item) => {
    const subtotal = item.quantity * item.unitPrice;
    const card = document.createElement("article");
    card.className = "order-item";
    card.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <p>${item.category} · ${item.material}</p>
        <p>${item.quantity} x ${money(item.unitPrice)} = ${money(subtotal)}</p>
      </div>
      <button type="button" aria-label="Eliminar ${item.name}">Eliminar</button>
    `;
    card.querySelector("button").addEventListener("click", () => removeItem(item.id));
    els.items.appendChild(card);
  });

  const subtotal = state.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  els.subtotal.textContent = money(subtotal);
  els.total.textContent = money(subtotal);
}

function lineOrFallback(label, value) {
  return value ? `${label}: ${value}` : null;
}

function buildWhatsAppMessage() {
  const customerLines = [
    "Hola, quiero cotizar este pedido:",
    lineOrFallback("Nombre", els.customerName.value.trim()),
    lineOrFallback("Telefono", els.customerPhone.value.trim()),
    lineOrFallback("Correo", els.customerEmail.value.trim()),
    lineOrFallback("Fecha ideal", els.deliveryDate.value)
  ].filter(Boolean);

  const itemLines = state.items.map((item, index) => {
    const details = [
      `${index + 1}. ${item.name}`,
      `Categoria: ${item.category}`,
      `Material: ${item.material}`,
      `Cantidad: ${item.quantity}`,
      `Precio base: ${money(item.quantity * item.unitPrice)}`,
      lineOrFallback("Texto", item.customization.mainText),
      lineOrFallback("Tema/estilo", item.customization.theme),
      lineOrFallback("Medida/formato", item.customization.size),
      lineOrFallback("Referencia", item.customization.reference),
      lineOrFallback("Notas", item.customization.notes)
    ].filter(Boolean);

    return details.join("\n");
  });

  const total = state.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  return [...customerLines, "", ...itemLines, "", `Total base estimado: ${money(total)}`].join("\n");
}

function openWhatsApp() {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage())}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

els.category.addEventListener("change", loadProducts);
els.product.addEventListener("change", loadMaterials);
els.qtyMinus.addEventListener("click", () => updateQuantity(-1));
els.qtyPlus.addEventListener("click", () => updateQuantity(1));
els.form.addEventListener("submit", addItem);
els.whatsapp.addEventListener("click", openWhatsApp);

loadCategories();
render();
