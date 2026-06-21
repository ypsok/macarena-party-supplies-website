const form = document.getElementById('order-form');
const card = form.querySelector('.form-card');
const input = document.getElementById('orderNumber');
const infoBtn = document.getElementById('info-toggle');
const closeBtn = document.getElementById('close-order-form');
const help = form.querySelector('.order-help');

const prefix = 'MS-';

document.getElementById('search-order').addEventListener('click', e => {   // apertura de mi formulario
  e.preventDefault();
  form.hidden = false;
});

form.addEventListener('click', e => {      // cerrar si se da click por fuera del form 
  if (e.target === form) {
    closeOrderForm();
  }
});

closeBtn.addEventListener('click', resetHelp);

infoBtn.addEventListener('click', () => {   // mostrar la imagen de ayuda
  const open = !help.hidden;
  help.hidden = open;
  card.classList.toggle('expanded', !open);
});

input.addEventListener('input', () => {    // prefijo MS-
  if (!input.value.startsWith(prefix)) {
    input.value = prefix;
  }
});

input.addEventListener('keydown', e => {   // forzar el prefijo MS- sin que se pueda borrar
  if (
    (e.key === 'Backspace' || e.key === 'Delete') &&
    input.selectionStart <= prefix.length
  ) {
    e.preventDefault();
  }
});

form.addEventListener('submit', e => {    // cerrar form al enviar - posible segundo form con resultados
  e.preventDefault();
  closeOrderForm();
});

function closeOrderForm() {
  form.hidden = true;
  resetHelp();
}

function resetHelp() {    // ocultar imagen de ayuda y reajustar el tamaño al original 
  help.hidden = true;
  card.classList.remove('expanded');
  input.value = prefix;
}

const orderSearcher = () => {   
  // lógica de búsqueda que aún no implemento
};
