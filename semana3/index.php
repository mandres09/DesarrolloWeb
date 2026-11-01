<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Semana 3 | Catálogo de automovilismo</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background: #15151e; color: #f5f5f5; }
        header { background: #101014; border-bottom: 4px solid #e10600; }
        .etiqueta { color: #ffad50; font-size: .85rem; letter-spacing: .12rem; }
        .table thead th { background: #a80400; color: white; }
        .table tfoot th, .table tfoot td { background: #252530; color: white; }
        .table td, .table th { padding: .85rem; vertical-align: middle; }
        caption { color: #d0d0d5; }
        footer { color: #bcbcc6; }
    </style>
    <script>
        // Datos locales de ejemplo: simulan la estructura de una respuesta API.
        // Los precios son ficticios y están expresados en pesos chilenos.
        const respuestaAPI = {
            status: 200,
            message: "Productos obtenidos correctamente",
            data: [
                { id: 1, nombre: "Gorra de automovilismo", categoria: "Accesorios", precio: 15990, cantidad: 2 },
                { id: 2, nombre: "Polera de escudería", categoria: "Vestuario", precio: 24990, cantidad: 3 },
                { id: 3, nombre: "Polerón de competición", categoria: "Vestuario", precio: 45990, cantidad: 1 },
                { id: 4, nombre: "Chaqueta de paddock", categoria: "Vestuario", precio: 69990, cantidad: 1 },
                { id: 5, nombre: "Auto a escala 1:43", categoria: "Coleccionables", precio: 32990, cantidad: 2 },
                { id: 6, nombre: "Casco en miniatura", categoria: "Coleccionables", precio: 54990, cantidad: 1 },
                { id: 7, nombre: "Llavero de neumático", categoria: "Accesorios", precio: 5990, cantidad: 4 },
                { id: 8, nombre: "Tazón de circuito", categoria: "Hogar", precio: 9990, cantidad: 2 },
                { id: 9, nombre: "Botella deportiva", categoria: "Accesorios", precio: 12990, cantidad: 3 },
                { id: 10, nombre: "Póster de circuito", categoria: "Decoración", precio: 7990, cantidad: 2 },
                { id: 11, nombre: "Bandera a cuadros", categoria: "Decoración", precio: 8990, cantidad: 1 },
                { id: 12, nombre: "Mochila de competición", categoria: "Accesorios", precio: 35990, cantidad: 2 }
            ]
        };

        function formatoPesos(valor) {
            return "$" + valor.toLocaleString("es-CL");
        }

        function cargarTabla() {
            const cuerpo = document.getElementById("cuerpoTabla");
            // Evita duplicar las filas si se vuelve a llamar la función.
            cuerpo.textContent = "";
            let totalUnidades = 0;
            let totalGeneral = 0;

            respuestaAPI.data.forEach((producto) => {
                const fila = document.createElement("tr");
                const subtotal = producto.precio * producto.cantidad;

                const celdaId = document.createElement("td");
                celdaId.innerText = producto.id;

                const celdaNombre = document.createElement("td");
                celdaNombre.innerText = producto.nombre;

                const celdaCategoria = document.createElement("td");
                celdaCategoria.innerText = producto.categoria;

                const celdaPrecio = document.createElement("td");
                celdaPrecio.innerText = formatoPesos(producto.precio);
                celdaPrecio.setAttribute("class", "text-end text-nowrap");

                const celdaCantidad = document.createElement("td");
                celdaCantidad.innerText = producto.cantidad;
                celdaCantidad.setAttribute("class", "text-end");

                const celdaSubtotal = document.createElement("td");
                celdaSubtotal.innerText = formatoPesos(subtotal);
                celdaSubtotal.setAttribute("class", "text-end text-nowrap fw-bold");

                fila.appendChild(celdaId);
                fila.appendChild(celdaNombre);
                fila.appendChild(celdaCategoria);
                fila.appendChild(celdaPrecio);
                fila.appendChild(celdaCantidad);
                fila.appendChild(celdaSubtotal);
                cuerpo.appendChild(fila);

                totalUnidades += producto.cantidad;
                totalGeneral += subtotal;
            });

            document.getElementById("totalProductos").innerText = respuestaAPI.data.length;
            document.getElementById("totalUnidades").innerText = totalUnidades;
            document.getElementById("totalGeneral").innerText = formatoPesos(totalGeneral);
        }
    </script>
</head>
<body onload="cargarTabla();">
    <header class="py-4">
        <div class="container">
            <p class="etiqueta mb-2">AUTOMOVILISMO / SEMANA 3</p>
            <h1 class="h2 mb-0">Catálogo de productos</h1>
        </div>
    </header>
    <main class="container py-4">
        <h2 class="h4">Listado dinámico</h2>
        <p class="text-light">Productos, cantidades y valores calculados con JavaScript.</p>
        <p><span class="badge text-bg-danger"><span id="totalProductos">0</span> productos distintos</span></p>
        <div class="table-responsive">
            <table class="table table-striped table-bordered table-hover mb-0">
                <caption>Precios de ejemplo en pesos chilenos (CLP). Subtotal = precio unitario × cantidad.</caption>
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Producto</th>
                        <th scope="col">Categoría</th>
                        <th scope="col" class="text-end">Precio unitario</th>
                        <th scope="col" class="text-end">Cantidad</th>
                        <th scope="col" class="text-end">Subtotal</th>
                    </tr>
                </thead>
                <tbody id="cuerpoTabla"></tbody>
                <tfoot>
                    <tr>
                        <th scope="row" colspan="4">Totales</th>
                        <td id="totalUnidades" class="text-end fw-bold">0</td>
                        <td id="totalGeneral" class="text-end text-nowrap fw-bold">$0</td>
                    </tr>
                </tfoot>
            </table>
        </div>
        <noscript><p class="alert alert-warning mt-3">Activa JavaScript para ver el listado de productos.</p></noscript>
    </main>
    <footer class="container pb-4 small">Ejercicio de Bootstrap, objetos y manipulación del DOM.</footer>
</body>
</html>
