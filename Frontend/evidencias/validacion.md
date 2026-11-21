# Evidencia de validación

Se revisó el sitio en Chrome mediante cuatro contextos iframe de viewport fijo, de 375, 768, 1024 y 1440 píxeles CSS de ancho, con altura 950. Las capturas incluyen el contexto de revisión. La de 1440 se muestra a escala 0,85 para que quepa en la ventana de captura; el sitio interior sigue evaluando su layout a 1440 píxeles. No se usaron cuatro dispositivos físicos.

| Viewport | Ancho útil (descontando scrollbar) | Ancho del contenido | Tarjetas por fila |
|---|---:|---:|---:|
| 375 | 360 | 360 | 1 |
| 768 | 753 | 753 | 2 |
| 1024 | 1009 | 1009 | 3 |
| 1440 | 1425 | 1425 | 3 |

No se observó desbordamiento horizontal. El encabezado y el hero se apilan en móvil; las categorías se envuelven. El pie pasa de cuatro a dos y una columna. Ver también las decisiones en `../diseno/decisiones.md`.

## Pruebas funcionales realizadas

- Catálogo: 10 productos generados desde JSON, búsqueda de salmón devuelve un resultado.
- Carrito: agregar, incrementar cantidad y actualizar total (dos rolls acevichados: $15.980).
- Confirmación: carga y éxito; limpia el carrito y muestra número de prueba.
- Catálogo vacío: mensaje visible, posibilidad de regresar al modo normal.
- Error de carga: mensaje y botón Reintentar recuperan el catálogo.
- Error de pedido: conserva la selección y los datos; habilita reintento.
- Recarga: conserva la selección mediante localStorage.
- Sintaxis: ambos archivos JavaScript comprobados con node --check.

## Capturas

- `nikkei-viewport-375.jpg`, `nikkei-viewport-768.jpg`, `nikkei-viewport-1024.jpg`, `nikkei-viewport-1440.jpg`: cuatro anchos de inicio.
- `nikkei-carta-375.jpg` y `nikkei-carta-1024.jpg`: catálogo en móvil y escritorio.
- `nikkei-pedido-error.jpg`: estado de error con selección conservada.

Los nombres y correos empleados en las pruebas son ficticios. No se envió información a un servicio real. Falta verificar la URL pública después de que el propietario active GitHub Pages.


## Actualización de carta
Se añadieron cinco postres y el filtro Postres. Las capturas anteriores corresponden a la carta inicial de diez productos; no muestran esta ampliación. Las imágenes de postres se incorporaron junto con fotos de entradas, bebidas y rolls. Se verificaron las 15 rutas de productos y la integridad de los JPG. Las capturas previas no representan esta actualización de fotografías.


## Carrusel de inicio
Se añadió un carrusel de tres imágenes locales (sushi, tabla y mochis), con intervalo de cuatro segundos y controles manuales. Se comprobaron la sintaxis de JavaScript y las rutas de las imágenes. Las capturas previas muestran la imagen fija anterior; no constituyen evidencia visual del nuevo carrusel.

Se añadieron chicha morada, jugo de maracuyá e Inca Kola, con imágenes locales y precios ficticios. El catálogo actualizado tiene 18 productos (cinco bebidas y cinco postres). Se verificaron las rutas de todos los productos.

Se reemplazaron las fotos de limonada y té frío por fotografías en ambientes de cafetería, sin fondo blanco de estudio. Se comprobó la lógica del carrusel (intervalo, avance, retorno y pausa) con un DOM simulado; esta prueba no sustituye la revisión visual en navegador.

Se incorporaron ocho fotografías aportadas por la usuaria para la carta: acevichado, salmón, combo para dos, tabla familiar, gyozas, limonada, suspiro y chicha morada. Se conservaron sus proporciones y se comprobaron los JPG y las 18 rutas de productos. El código y las tres imágenes del carrusel permanecen iguales. Las capturas anteriores no muestran esta selección de fotografías.
