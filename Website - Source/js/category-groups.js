const categoryGroupFallback = [
  {
    grupo: "Escolar",
    descripcion: "Productos personalizados para organizar e identificar utiles.",
    productos: [
      { nombre: "Etiquetas de papel", descripcion: "Para libretas y cuadernos.", imagen: "" },
      { nombre: "Etiquetas de vinil", descripcion: "Para superficies de uso diario.", imagen: "" }
    ]
  }
];

const categoryGrid = document.getElementById("categoryGroupGrid");

async function loadCategoryGroups() {
  let groups = categoryGroupFallback;

  try {
    const response = await fetch("data/category-groups.json");
    if (!response.ok) throw new Error("No se pudieron cargar las categorias");
    groups = await response.json();
  } catch (error) {
    groups = categoryGroupFallback;
  }

  renderCategoryGroups(groups);
}

function renderCategoryGroups(groups) {
  categoryGrid.innerHTML = "";

  groups.forEach((group) => {
    const card = document.createElement("article");
    card.className = "category-group-card";

    const header = document.createElement("div");
    header.className = "category-group-header";

    const title = document.createElement("h3");
    title.textContent = group.grupo;

    const description = document.createElement("p");
    description.textContent = group.descripcion;

    header.append(title, description);

    const productList = document.createElement("div");
    productList.className = "category-product-list";

    group.productos.forEach((product) => {
      const productCard = document.createElement("a");
      productCard.className = "category-product";
      productCard.href = "new-order.html";

      const imageWrap = document.createElement("span");
      imageWrap.className = "category-product-image";

      if (product.imagen) {
        const image = document.createElement("img");
        image.src = product.imagen;
        image.alt = product.nombre;
        imageWrap.appendChild(image);
      }

      const textWrap = document.createElement("span");
      textWrap.className = "category-product-text";

      const name = document.createElement("strong");
      name.textContent = product.nombre;

      const productDescription = document.createElement("span");
      productDescription.textContent = product.descripcion;

      textWrap.append(name, productDescription);
      productCard.append(imageWrap, textWrap);
      productList.appendChild(productCard);
    });

    card.append(header, productList);
    categoryGrid.appendChild(card);
  });
}

if (categoryGrid) {
  loadCategoryGroups();
}
