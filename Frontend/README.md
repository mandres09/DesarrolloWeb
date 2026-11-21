# Nikkei Roll · Evaluación 1

Prototipo frontend responsivo de comida de fusión peruano-japonesa. HTML, CSS y JavaScript sin compilación. Este proyecto corresponde al compañero que trabaja el caso 19, Nikkei Roll; se mantiene separado de Mediterráneo y de SandwichDV.

## Caso y alcance

- Objetivo: seleccionar productos y confirmar un pedido de demostración.
- Flujo: consultar → buscar/filtrar → agregar → revisar cantidades → confirmar.
- Requisitos abordados: catálogo, promoción, selección de productos y confirmación simulada de pedido.

La pauta permite una porción coherente del caso. Esta versión no implementa todo el sistema de negocio: no incluye registro real, validación de correo, pagos, boletas, administración, reportes ni despacho. No se conecta con los PR de backend. Ningún pedido sale del navegador y no se envían correos.

## Qué incluye

- Inicio con la marca, carrusel de tres imágenes y acceso a la carta. Cambia cada cuatro segundos e incluye controles para avanzar, retroceder, elegir imagen y pausar. Se detiene temporalmente al pasar el cursor o enfocar sus controles; con movimiento reducido comienza pausado.
- Catálogo de 18 productos creado mediante DOM a partir de `datos/productos.json`.
- Búsqueda, cinco categorías y filtro de promoción. Bebidas: limonada, té frío, chicha morada, jugo de maracuyá e Inca Kola.
- Carrito con cantidades, eliminación al llegar a cero, total, vaciado y conservación local.
- Formulario de nombre y correo con validación y confirmación simulada.
- Estados de carga, éxito, error y vacío, con recuperación.
- Secciones Nosotros y Contacto; los datos comerciales y precios son ficticios.
- Sketch editable y anotaciones responsivas, más evidencia en cuatro anchos.

## Ejecutar

El catálogo usa fetch por HTTP: no abrir con doble clic usando file://.

Opción XAMPP: copiar esta carpeta como `C:\xampp\htdocs\nikkei-roll`, iniciar Apache en el puerto 8080 y abrir:

`http://localhost:8080/nikkei-roll/`

Opción Python: abrir una terminal dentro de esta carpeta y ejecutar:

```bash
python -m http.server 8000
```

Abrir `http://localhost:8000`. No se requiere Node.js, MongoDB, Vault ni instalar paquetes.

## Probar el flujo

1. Abrir la carta y buscar un producto o elegir una categoría.
2. Agregar uno o más productos y abrir Tu pedido.
3. Sumar o restar unidades; comprobar total. Al restar hasta cero, se elimina el producto.
4. Completar nombre y un correo con formato válido.
5. Confirmar. Se muestra carga y luego un número de pedido de prueba; el carrito queda vacío.

En “Pruebas del prototipo”, al final de la carta, seleccionar Catálogo vacío o Error de servicio y pulsar Cargar escenario. Reintentar recupera la carta normal. La opción Próxima confirmación permite simular un error del pedido y verificar que el carrito no se pierda. Seleccionar Éxito antes de volver a confirmar.

## Servicios dummy

`js/servicios.js` contiene dos operaciones:

- `consultarProductos`: petición fetch al JSON local, que devuelve la lista para generar tarjetas. Demora de demostración y modos vacío/error.
- `enviarPedido`: recibe un objeto con datos y selección, espera y devuelve una confirmación o rechaza la promesa. Es una simulación en memoria, sin endpoint POST remoto ni persistencia del pedido.

`js/app.js` consume esas respuestas para actualizar el DOM con querySelector, createElement, textContent, append, replaceChildren y addEventListener. El contenido de los productos no está escrito en el HTML. El carrito se guarda en localStorage; nombre y correo no se conservan.

## Diseño y evidencias

- [Sketch original](diseno/Sketch-Nikkei-Roll.png) · [Archivo editable](diseno/Sketch-Nikkei-Roll.drawio).
- [Decisiones de diseño y adaptación](diseno/decisiones.md).
- [Validación y cuatro viewports](evidencias/validacion.md).

Se usa CSS Grid equivalente de 12 columnas, Flexbox y Box Model. Viewports comprobados: 375, 768, 1024 y 1440 píxeles. Paleta: rojo `#B52D32`, negro `#202124`, gris claro `#D9D5CF` y crema `#F6F1E7`.

## Publicar en GitHub Pages

El sitio aún no está publicado. Para mantener los PR de backend en el mismo repositorio:

1. Renombrar esta carpeta `Frontend` a `docs` y subirla en la raíz del repositorio, conservando todo su contenido. Debe existir `docs/index.html`.
2. En GitHub, entrar en Settings → Pages.
3. En Build and deployment, seleccionar Deploy from a branch, rama main y carpeta /docs. Guardar.
4. Esperar a que GitHub indique la URL publicada y abrirla. Comprobar carta y pedido.
5. Entregar esa URL junto con el repositorio o ZIP. El enlace del repositorio y el de la página publicada son distintos.

No hace falta instalar dependencias para subir los archivos. No subir el ZIP como único contenido del sitio: descomprimirlo primero. No hay archivos con rutas absolutas a este entorno.

## Imágenes y materiales

Los 18 productos tienen fotografías guardadas dentro de `imagenes/`; no se descargan desde sitios externos al abrir la carta. Se conservan las proporciones originales y las imágenes se comprimen en JPG. La tabla familiar tiene una fotografía propia. Ocho fotos de la carta fueron reemplazadas por las imágenes seleccionadas y aportadas por la usuaria. Los créditos identifican estas fotos sin atribuirles los autores ni las licencias de las imágenes anteriores.

## Sitio publicado

[Visitar Nikkei Roll](https://mandres09.github.io/DesarrolloWeb/Frontend/)

## Integrante

Marco Fuentealba · Trabajo individual.
