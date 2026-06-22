document.querySelectorAll("[data-cover]").forEach((image) => {
  image.addEventListener("error", () => {
    image.hidden = true;
    image.closest(".catalog-option-media")?.classList.add("is-empty");
  });
});

function getSmartCartKeysWithData() {
  const keys = [];

  for (let index = 0; index < sessionStorage.length; index += 1) {
    const key = sessionStorage.key(index);
    if (!key?.startsWith("mps-smart-cart:")) continue;

    try {
      const cart = JSON.parse(sessionStorage.getItem(key));
      const hasAnswers = Object.keys(cart?.answers || {}).length > 0;
      const hasSelections = Array.isArray(cart?.selections) && cart.selections.length > 0;

      if (hasAnswers || hasSelections) {
        keys.push(key);
      }
    } catch (error) {
      // Ignore malformed session data.
    }
  }

  return keys;
}

function showSmartCartReturnPrompt(keys) {
  if (!keys.length || document.querySelector(".smart-cart-modal")) return;

  const modal = document.createElement("div");
  modal.className = "smart-cart-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "smartCartReturnTitle");
  modal.innerHTML = `
    <div class="smart-cart-dialog">
      <h2 id="smartCartReturnTitle">MPS SMART CART</h2>
      <p>Encontramos preferencias guardadas. ¿Quieres conservarlas para continuar después?</p>
      <div class="smart-cart-actions">
        <button type="button" class="smart-cart-choice secondary" data-smart-cart-clear>Borrar</button>
        <button type="button" class="smart-cart-choice" data-smart-cart-keep>Conservar</button>
      </div>
    </div>
  `;

  modal.querySelector("[data-smart-cart-clear]").addEventListener("click", () => {
    keys.forEach((key) => sessionStorage.removeItem(key));
    modal.remove();
  });

  modal.querySelector("[data-smart-cart-keep]").addEventListener("click", () => {
    modal.remove();
  });

  document.body.appendChild(modal);
}

showSmartCartReturnPrompt(getSmartCartKeysWithData());
