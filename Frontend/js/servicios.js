/* Servicio dummy: consulta JSON por HTTP y simula el envío de un pedido.
   Los modos de prueba permiten observar carga, vacío, éxito y error. */
const servicio = {
  esperar(ms) { return new Promise(resolve => setTimeout(resolve, ms)); },
  async consultarProductos(modo = 'normal') {
    await this.esperar(500);
    if (modo === 'error') throw new Error('No pudimos cargar la carta. Intenta nuevamente.');
    const respuesta = await fetch('datos/productos.json');
    if (!respuesta.ok) throw new Error('La carta no está disponible. Intenta nuevamente.');
    const productos = await respuesta.json();
    return modo === 'empty' ? [] : productos;
  },
  async enviarPedido(pedido, modo = 'normal') {
    await this.esperar(800);
    if (modo === 'error') throw new Error('No pudimos confirmar. Tu selección se conserva: vuelve a intentarlo.');
    if (!pedido.items.length) throw new Error('Agrega un producto antes de confirmar.');
    return { ok: true, numero: 'NR-' + Date.now().toString().slice(-6) };
  }
};
