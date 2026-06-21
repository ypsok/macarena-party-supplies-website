const instagramPostsFallback = [
  {
    titulo: "Pedido en Instagram",
    descripcion: "Referencia real publicada por Macarena Party Supplies.",
    url: "https://www.instagram.com/macarena_partygdl/",
    imagen: "",
    categoria: "Instagram"
  }
];

const instagramGrid = document.getElementById("instagramPostGrid");

async function loadInstagramPosts() {
  let posts = instagramPostsFallback;

  try {
    const response = await fetch("data/instagram-posts.json");
    if (!response.ok) throw new Error("No se pudieron cargar las publicaciones");
    posts = await response.json();
  } catch (error) {
    posts = instagramPostsFallback;
  }

  renderInstagramPosts(posts);
}

function renderInstagramPosts(posts) {
  instagramGrid.innerHTML = "";

  posts.forEach((post) => {
    const card = document.createElement("a");
    card.className = "instagram-post-card";
    card.href = post.url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.setAttribute("aria-label", `${post.titulo}. Ver en Instagram`);

    const media = document.createElement("span");
    media.className = "instagram-post-media";

    if (post.imagen) {
      const image = document.createElement("img");
      image.src = post.imagen;
      image.alt = post.titulo;
      media.appendChild(image);
    }

    const body = document.createElement("span");
    body.className = "instagram-post-body";

    const category = document.createElement("span");
    category.className = "instagram-post-category";
    category.textContent = post.categoria || "Instagram";

    const title = document.createElement("strong");
    title.textContent = post.titulo;

    const action = document.createElement("span");
    action.className = "instagram-post-action";
    action.textContent = "Instagram";

    body.append(category, title, action);
    card.append(media, body);
    instagramGrid.appendChild(card);
  });
}

if (instagramGrid) {
  loadInstagramPosts();
}
