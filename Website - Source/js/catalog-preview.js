const catalogFallback = [
  {
    nombre: "Etiquetas escolares",
    definicion: "Etiquetas personalizadas para utiles, termos, loncheras y libretas.",
    imagen: ""
  },
  {
    nombre: "Party favors",
    definicion: "Detalles personalizados para cumpleanos, reuniones y celebraciones.",
    imagen: ""
  },
  {
    nombre: "Candy box",
    definicion: "Cajitas tematicas para dulces, regalos pequenos o kits de fiesta.",
    imagen: ""
  }
];

const catalogEls = {
  viewport: document.getElementById("catalogViewport"),
  track: document.getElementById("catalogTrack"),
  prev: document.getElementById("catalogPrev"),
  next: document.getElementById("catalogNext")
};

let catalogItems = [];

async function loadCatalogPreview() {
  try {
    const response = await fetch("data/catalog-preview.json");
    if (!response.ok) throw new Error("No se pudo cargar el catalogo");
    catalogItems = await response.json();
  } catch (error) {
    catalogItems = catalogFallback;
  }

  renderCatalogPreview();
  updateCarouselControls();
}

function renderCatalogPreview() {
  catalogEls.track.innerHTML = "";

  catalogItems.forEach((item) => {
    const card = document.createElement("article");
    card.className = "catalog-card";

    const media = document.createElement("div");
    media.className = "catalog-media";

    if (item.imagen) {
      const image = document.createElement("img");
      image.src = item.imagen;
      image.alt = item.nombre;
      media.appendChild(image);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "catalog-placeholder";
      placeholder.setAttribute("aria-hidden", "true");
      media.appendChild(placeholder);
    }

    const info = document.createElement("div");
    info.className = "catalog-info";

    const title = document.createElement("h3");
    title.textContent = item.nombre;

    const description = document.createElement("p");
    description.textContent = item.definicion;

    info.append(title, description);
    card.append(media, info);

    catalogEls.track.appendChild(card);
  });
}

function getCardStepWidth() {
  const firstCard = catalogEls.track.querySelector(".catalog-card");
  if (!firstCard) return 0;

  const styles = window.getComputedStyle(catalogEls.track);
  const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
  return firstCard.getBoundingClientRect().width + gap;
}

function getStepCount() {
  return catalogItems.length > 9 ? 5 : 4;
}

function moveCatalog(direction) {
  const distance = getCardStepWidth() * getStepCount() * direction;
  catalogEls.viewport.scrollBy({
    left: distance,
    behavior: "smooth"
  });
}

function updateCarouselControls() {
  const maxScroll = catalogEls.viewport.scrollWidth - catalogEls.viewport.clientWidth;
  const current = catalogEls.viewport.scrollLeft;

  catalogEls.prev.hidden = current <= 8;
  catalogEls.next.hidden = current >= maxScroll - 8 || maxScroll <= 0;
}

catalogEls.prev.addEventListener("click", () => moveCatalog(-1));
catalogEls.next.addEventListener("click", () => moveCatalog(1));
catalogEls.viewport.addEventListener("scroll", updateCarouselControls);
window.addEventListener("resize", updateCarouselControls);

loadCatalogPreview();
