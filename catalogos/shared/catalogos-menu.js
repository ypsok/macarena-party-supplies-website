document.querySelectorAll("[data-cover]").forEach((image) => {
  image.addEventListener("error", () => {
    image.hidden = true;
    image.closest(".catalog-option-media")?.classList.add("is-empty");
  });
});
