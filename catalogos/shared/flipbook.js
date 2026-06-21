const catalogConfig = window.MPS_CATALOG || {};

const state = {
  pdf: null,
  pageCount: 0,
  currentPage: 1,
  isRendering: false,
  renderToken: 0
};

const els = {
  stage: document.getElementById("flipbookStage"),
  book: document.getElementById("flipbook"),
  status: document.getElementById("catalogStatus"),
  prev: document.getElementById("prevPage"),
  next: document.getElementById("nextPage"),
  counter: document.getElementById("pageCounter"),
  download: document.getElementById("downloadPdf")
};

const isMobile = () => window.matchMedia("(max-width: 760px)").matches;

function setStatus(message, isError = false) {
  if (!els.status) return;
  els.status.hidden = false;
  els.status.innerHTML = isError ? `<strong>No se pudo cargar el catalogo.</strong><br>${message}` : message;
}

function hideStatus() {
  if (els.status) els.status.hidden = true;
}

function setControlsDisabled(disabled) {
  els.prev.disabled = disabled;
  els.next.disabled = disabled;
}

function getSpreadStart(pageNumber) {
  if (isMobile()) return pageNumber;
  if (pageNumber <= 1) return 1;
  return pageNumber % 2 === 0 ? pageNumber : pageNumber - 1;
}

function updateCounter() {
  if (!els.counter || !state.pageCount) return;

  if (isMobile() || state.currentPage === 1 || state.currentPage === state.pageCount) {
    els.counter.textContent = `${state.currentPage} / ${state.pageCount}`;
  } else {
    const end = Math.min(state.currentPage + 1, state.pageCount);
    els.counter.textContent = `${state.currentPage}-${end} / ${state.pageCount}`;
  }

  els.prev.disabled = state.isRendering || state.currentPage <= 1;
  els.next.disabled = state.isRendering || state.currentPage >= state.pageCount;
}

function getStageSize() {
  const bounds = els.stage.getBoundingClientRect();
  return {
    width: Math.max(280, Math.min(bounds.width - 24, 1080)),
    height: Math.max(360, Math.min(bounds.height - 24, 760))
  };
}

async function renderPageToCanvas(pageNumber, targetWidth, maxHeight) {
  const page = await state.pdf.getPage(pageNumber);
  const initialViewport = page.getViewport({ scale: 1 });
  const widthScale = targetWidth / initialViewport.width;
  const heightScale = maxHeight / initialViewport.height;
  const scale = Math.max(Math.min(widthScale, heightScale), 0.4);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const outputScale = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;

  await page.render({
    canvasContext: context,
    viewport,
    transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null
  }).promise;

  return canvas;
}

function createPageShell(pageNumber) {
  const shell = document.createElement("article");
  shell.className = "pdf-page-shell";
  shell.setAttribute("aria-label", `Pagina ${pageNumber}`);
  return shell;
}

async function renderViewer(pageNumber) {
  if (!state.pdf) return;

  const token = state.renderToken + 1;
  state.renderToken = token;
  state.isRendering = true;
  updateCounter();

  const startPage = getSpreadStart(pageNumber);
  const pages = isMobile()
    ? [startPage]
    : [startPage, startPage + 1].filter((page) => page <= state.pageCount);

  const size = getStageSize();
  const pageWidth = isMobile() ? size.width : (size.width - 18) / pages.length;
  const pageMaxHeight = isMobile() ? Math.min(size.height, 720) : Math.min(size.height, 740);

  const spread = document.createElement("div");
  spread.className = `pdf-spread ${isMobile() ? "is-single" : "is-spread"}`;

  try {
    const renderedPages = await Promise.all(
      pages.map(async (page) => {
        const shell = createPageShell(page);
        const canvas = await renderPageToCanvas(page, pageWidth, pageMaxHeight);
        shell.appendChild(canvas);
        return shell;
      })
    );

    if (token !== state.renderToken) return;

    renderedPages.forEach((page) => spread.appendChild(page));
    els.book.innerHTML = "";
    els.book.appendChild(spread);
    state.currentPage = startPage;
    hideStatus();
  } catch (error) {
    showPdfFallback("Hubo un problema renderizando esta pagina.");
  } finally {
    if (token === state.renderToken) {
      state.isRendering = false;
      updateCounter();
    }
  }
}

function showPdfFallback(reason) {
  state.isRendering = false;
  setControlsDisabled(true);
  els.book.innerHTML = "";
  setStatus(
    `${reason}<br><br><a class="catalog-button" href="${catalogConfig.pdf}" target="_blank" rel="noopener">Abrir PDF</a>`,
    true
  );
}

async function initCatalogViewer() {
  if (!catalogConfig.pdf) {
    showPdfFallback("Falta configurar la ruta del PDF.");
    return;
  }

  els.download.href = catalogConfig.pdf;
  setControlsDisabled(true);
  setStatus("Cargando catalogo...");

  if (!window.pdfjsLib) {
    showPdfFallback("PDF.js no se cargo correctamente.");
    return;
  }

  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    state.pdf = await pdfjsLib.getDocument(catalogConfig.pdf).promise;
    state.pageCount = state.pdf.numPages;
    await renderViewer(1);
  } catch (error) {
    showPdfFallback(`Verifica que el archivo exista en <code>${catalogConfig.pdf}</code>.`);
  }
}

function getStep(direction) {
  return isMobile() ? direction : direction * 2;
}

async function goToRelativePage(direction) {
  if (state.isRendering) return;
  const nextPage = Math.min(Math.max(state.currentPage + getStep(direction), 1), state.pageCount);
  if (nextPage !== state.currentPage) {
    await renderViewer(nextPage);
  }
}

els.prev.addEventListener("click", () => goToRelativePage(-1));
els.next.addEventListener("click", () => goToRelativePage(1));

let touchStartX = 0;
els.stage.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0]?.clientX || 0;
}, { passive: true });

els.stage.addEventListener("touchend", (event) => {
  const endX = event.changedTouches[0]?.clientX || 0;
  const delta = endX - touchStartX;
  if (Math.abs(delta) < 44) return;
  goToRelativePage(delta > 0 ? -1 : 1);
}, { passive: true });

initCatalogViewer();
