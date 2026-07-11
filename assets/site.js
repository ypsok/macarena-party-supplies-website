document.querySelector(".nav-toggle")?.addEventListener("click", () => {
  document.querySelector(".site-header")?.classList.toggle("is-open");
});

document.querySelectorAll("[data-wa-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const lines = ["Hola, quiero información de Macarena Party Supplies."];
    for (const [key, value] of data.entries()) {
      if (String(value).trim()) lines.push(`${key}: ${value}`);
    }
    window.location.href = `https://wa.me/5213330438386?text=${encodeURIComponent(lines.join("\n"))}`;
  });
});
