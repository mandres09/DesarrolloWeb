const express = require('express');
const app = express();
app.use(express.json());

// Productos y precios de ejemplo, expresados en CLP.
let productos = [
    { id: 1, nombre: "Roll acevichado", descripcion: "Roll de camaron y palta con salsa acevichada, 10 piezas", categoria: "Rolls", precio: 7990 },
    { id: 2, nombre: "Tabla Nikkei", descripcion: "Seleccion de 30 piezas para compartir", categoria: "Tablas y combos", precio: 19990 }
];
let siguienteId = 3;

app.get('/productos', (req, res) => {
    res.json(productos);
});

app.get('/productos/:id', (req, res) => {
    const producto = productos.find(p => p.id == req.params.id);
    if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json(producto);
});

app.post('/productos', (req, res) => {
    const nuevo = {
        id: siguienteId++,
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        categoria: req.body.categoria,
        precio: req.body.precio
    };
    productos.push(nuevo);
    res.status(201).json(nuevo);
});

app.put('/productos/:id', (req, res) => {
    const producto = productos.find(p => p.id == req.params.id);
    if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" });
    }
    producto.nombre = req.body.nombre;
    producto.descripcion = req.body.descripcion;
    producto.categoria = req.body.categoria;
    producto.precio = req.body.precio;
    res.json(producto);
});

app.delete('/productos/:id', (req, res) => {
    const index = productos.findIndex(p => p.id == req.params.id);
    if (index == -1) {
        return res.status(404).json({ message: "Producto no encontrado" });
    }
    productos.splice(index, 1);
    res.json({ message: "Producto eliminado" });
});

app.listen(4001, () => {
    console.log("API privada de Nikkei Roll en http://localhost:4001");
});
