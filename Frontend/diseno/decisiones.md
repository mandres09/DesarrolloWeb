# Diseño y decisiones responsivas

El sketch original se conserva en formato draw.io y PNG. La implementación desarrolla sus bloques: marca, búsqueda, navegación, imagen principal, carta con categorías, tarjetas y pie. Se usa la paleta acordada: rojo #B52D32, negro #202124, gris claro #D9D5CF y crema #F6F1E7.

## Actor, objetivo y flujo

Actor: cliente que quiere seleccionar comida. Objetivo: consultar el catálogo y confirmar una selección de prueba. Flujo: inicio → carta → búsqueda o filtro → agregar → revisar cantidades → ingresar nombre y correo → confirmar → respuesta simulada.

## De sketch a interfaz

La imagen principal se implementa como foto fija: no se requiere carrusel para demostrar el flujo. Las categorías filtran la carta. Los destacados se integran en el catálogo y la promoción dispone de su filtro. El carrito y su confirmación se resuelven en un diálogo para mantener el contexto y evitar páginas duplicadas. La cuenta del sketch se deja fuera del flujo elegido: no se requiere autenticación en la Evaluación 1. El contacto y el horario son datos de muestra, identificados como tales; no se inventan un local real ni perfiles sociales.

## Intención responsiva

- Escritorio: hero 6+6 columnas; catálogo en 3 tarjetas, cada una ocupa 4 de las 12 columnas. Navegación horizontal y pie en cuatro grupos.
- Tablet: hero conserva dos regiones, con tamaños de texto e imagen reducidos; catálogo en 2 tarjetas de 6 columnas. Pie en dos grupos.
- Móvil: hero y catálogo usan 12 columnas por bloque. El buscador pasa a una segunda fila, las categorías se envuelven y el pie se apila. El diálogo ocupa el ancho disponible y admite desplazamiento vertical.

Grid: CSS Grid equivalente de 12 columnas para la macroestructura. Flexbox: cabecera, navegación, categorías, acciones de tarjetas, cantidades y totales. Box Model: box-sizing, padding, border, gap y límites de ancho. No hay framework ni proceso de compilación.

## Decisiones que condicionan el diseño

Se prioriza una selección clara en móvil frente a mostrar todos los controles en una fila. El catálogo se carga por HTTP desde un JSON local para poder publicarlo como sitio estático. El envío se representa con una promesa que devuelve éxito o error, porque esta entrega no necesita backend ni pagos reales. Los mensajes de estado son visibles y se anuncian con aria-live. La navegación puede usarse con teclado y el diálogo conserva el comportamiento nativo de Escape y foco del navegador.

Estas anotaciones explican la adaptación del sketch durante esta entrega. No constituyen evidencia de que todas las vistas finales se hubieran dibujado originalmente.
