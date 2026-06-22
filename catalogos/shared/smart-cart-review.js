const reviewConfig = window.MPS_CATALOG || {};
const reviewKey = `mps-smart-cart:${reviewConfig.id || "catalog"}`;
const reviewSummary = document.getElementById("smartCartReviewSummary");
const whatsappButton = document.getElementById("smartCartWhatsapp");

function getSavedCart() {
  try {
    const saved = sessionStorage.getItem(reviewKey);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    return null;
  }
}

function formatTextFields(answer) {
  const values = answer.values || {};
  const fonts = answer.fonts || {};
  const parts = [];

  if (values.name) parts.push(`${values.name} (${fonts.name || "sin fuente"})`);
  if (values.lastName) parts.push(`${values.lastName} (${fonts.lastName || "sin fuente"})`);
  if (values.group) parts.push(`Grupo: ${values.group}`);

  return parts.join(", ");
}

function getAnswerText(answer) {
  if (answer.items?.length) {
    return answer.items
      .map((item) => item.quantity ? `${item.label} x${item.quantity}` : `${item.label}: ${item.value}`)
      .join(", ");
  }

  if (answer.type === "textFields") return formatTextFields(answer);
  if (answer.version) return `${answer.value} (${answer.version})`;
  return answer.value || "Sin respuesta";
}

function buildWhatsappText(cart) {
  const lines = [
    "Hola, quiero cotizar un pedido desde el catálogo.",
    `Catálogo: ${cart.catalog?.name || reviewConfig.name || "Catálogo"}`,
    "",
    "Preferencias:"
  ];

  Object.values(cart.answers || {}).forEach((answer) => {
    lines.push(`- ${answer.label}: ${getAnswerText(answer)}`);
  });

  return lines.join("\n");
}

function renderReview(cart) {
  const answers = Object.values(cart?.answers || {});

  if (!cart || !answers.length) {
    reviewSummary.innerHTML = `
      <p>No hay preferencias guardadas todavía.</p>
      <a class="catalog-button secondary" href="./">Volver al catálogo</a>
    `;
    whatsappButton.classList.remove("whatsapp-ready");
    return;
  }

  reviewSummary.innerHTML = `
    <dl>
      ${answers.map((answer) => `
        <div>
          <dt>${answer.label}</dt>
          <dd>${getAnswerText(answer)}</dd>
        </div>
      `).join("")}
    </dl>
  `;

  const phone = reviewConfig.whatsapp || "5213330438386";
  whatsappButton.href = `https://wa.me/${phone}?text=${encodeURIComponent(buildWhatsappText(cart))}`;
}

renderReview(getSavedCart());
