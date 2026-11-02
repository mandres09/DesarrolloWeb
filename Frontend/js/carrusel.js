'use strict';
// Carrusel sencillo con tres fotos locales y cambio cada cuatro segundos.
const imagenesInicio = [
  {archivo: 'imagenes/sushi.jpg', alt: 'Rolls de sushi presentados para compartir', categoria: 'FUSIÓN NIKKEI', titulo: 'Sabor sin fronteras'},
  {archivo: 'imagenes/tabla.jpg', alt: 'Tabla variada de sushi', categoria: 'PARA COMPARTIR', titulo: 'Una tabla, muchos sabores'},
  {archivo: 'imagenes/mochis.jpg', alt: 'Mochis japoneses dulces', categoria: 'EL TOQUE DULCE', titulo: 'Siempre queda espacio para un postre'}
];
let imagenActual = 0;
let carruselPausado = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let temporizadorCarrusel;
const carruselInicio = document.querySelector('#carrusel');
const botonPausa = document.querySelector('#pausar-carrusel');

function mostrarImagen(numero) {
  imagenActual = (numero + imagenesInicio.length) % imagenesInicio.length;
  const foto = imagenesInicio[imagenActual];
  document.querySelector('#imagen-carrusel').src = foto.archivo;
  document.querySelector('#imagen-carrusel').alt = foto.alt;
  document.querySelector('#categoria-carrusel').textContent = foto.categoria;
  document.querySelector('#titulo-carrusel').textContent = foto.titulo;
  document.querySelectorAll('[data-slide]').forEach(boton => {
    if (Number(boton.dataset.slide) === imagenActual) boton.setAttribute('aria-current', 'true');
    else boton.removeAttribute('aria-current');
  });
}
function iniciarCarrusel() {
  clearInterval(temporizadorCarrusel);
  botonPausa.textContent = carruselPausado ? 'Reproducir' : 'Pausar';
  if (!carruselPausado) {
    temporizadorCarrusel = setInterval(() => {
      // No interrumpir a quien está usando los controles o mirando otra pestaña.
      if (!document.hidden && !carruselInicio.matches(':hover') && !carruselInicio.contains(document.activeElement)) {
        mostrarImagen(imagenActual + 1);
      }
    }, 4000);
  }
}
document.querySelector('#anterior-imagen').addEventListener('click', () => {
  mostrarImagen(imagenActual - 1); iniciarCarrusel();
});
document.querySelector('#siguiente-imagen').addEventListener('click', () => {
  mostrarImagen(imagenActual + 1); iniciarCarrusel();
});
document.querySelectorAll('[data-slide]').forEach(boton => {
  boton.addEventListener('click', () => {
    mostrarImagen(Number(boton.dataset.slide)); iniciarCarrusel();
  });
});
botonPausa.addEventListener('click', () => {
  carruselPausado = !carruselPausado; iniciarCarrusel();
});
iniciarCarrusel();
