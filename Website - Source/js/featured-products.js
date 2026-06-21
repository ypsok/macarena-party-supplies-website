const featuredFallback = [
  {
    nombre: "Producto destacado",
    definicion: "Espacio listo para una pieza destacada.",
    imagen: "",
    highlight: "#e86aa3"
  }
];

const featuredEls = {
  viewport: document.getElementById("featuredViewport"),
  track: document.getElementById("featuredTrack"),
  prev: document.getElementById("featuredPrev"),
  next: document.getElementById("featuredNext")
};

let featuredProducts = [];

async function loadFeaturedProducts() {
  try {
    const response = await fetch("data/featured-products.json");
    if (!response.ok) throw new Error("No se pudieron cargar los productos destacados");
    featuredProducts = await response.json();
  } catch (error) {
    featuredProducts = featuredFallback;
  }

  renderFeaturedProducts();
  updateFeaturedControls();
}

function renderFeaturedProducts() {
  featuredEls.track.innerHTML = "";

  featuredProducts.forEach((product) => {
    featuredEls.track.appendChild(createFeaturedCard(product));
  });
}

function createFeaturedCard(product) {
  const card = document.createElement("article");
  card.className = "featured-card";
  card.style.setProperty("--highlight", product.highlight || "#e86aa3");

  const media = document.createElement("div");
  media.className = "featured-card-media";

  if (product.imagen) {
    const image = document.createElement("img");
    image.src = product.imagen;
    image.alt = product.nombre;
    media.appendChild(image);
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "featured-card-placeholder";
    placeholder.setAttribute("aria-hidden", "true");
    media.appendChild(placeholder);
  }

  const body = document.createElement("div");
  body.className = "featured-card-body";

  const title = document.createElement("h3");
  title.textContent = product.nombre;

  const description = document.createElement("p");
  description.textContent = product.definicion;

  body.append(title, description);
  card.append(media, body);

  return card;
}

function getFeaturedStepWidth() {
  const firstCard = featuredEls.track.querySelector(".featured-card");
  if (!firstCard) return 0;

  const styles = window.getComputedStyle(featuredEls.track);
  const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
  return firstCard.getBoundingClientRect().width + gap;
}

function getFeaturedStepCount() {
  return featuredProducts.length > 9 ? 5 : 4;
}

function moveFeatured(direction) {
  featuredEls.viewport.scrollBy({
    left: getFeaturedStepWidth() * getFeaturedStepCount() * direction,
    behavior: "smooth"
  });
}

function updateFeaturedControls() {
  const maxScroll = featuredEls.viewport.scrollWidth - featuredEls.viewport.clientWidth;
  const current = featuredEls.viewport.scrollLeft;

  featuredEls.prev.hidden = current <= 8;
  featuredEls.next.hidden = current >= maxScroll - 8 || maxScroll <= 0;
}

if (featuredEls.viewport) {
  featuredEls.prev.addEventListener("click", () => moveFeatured(-1));
  featuredEls.next.addEventListener("click", () => moveFeatured(1));
  featuredEls.viewport.addEventListener("scroll", updateFeaturedControls);
  window.addEventListener("resize", updateFeaturedControls);
  loadFeaturedProducts();
}
