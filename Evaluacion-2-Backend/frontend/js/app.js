'use strict'

let productos = []

let carrito = []
let intentoPedido
let categoria = 'Todas'

let soloPromos = false

let enviando = false

let avisoTimer

const $ = (selector) => document.querySelector(selector)

const dinero = (valor) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(valor)

// El carrito local solo guarda los productos elegidos.
try {
  const guardado = JSON.parse(localStorage.getItem('nikkei-carrito') || '[]')

  if (Array.isArray(guardado))
    carrito = guardado.filter(
      (p) =>
        Number.isInteger(p.id) &&
        typeof p.nombre === 'string' &&
        Number.isFinite(p.precio) &&
        p.precio >= 0 &&
        Number.isInteger(p.cantidad) &&
        p.cantidad > 0 &&
        p.cantidad <= 20,
    )
} catch (error) {
  carrito = []
}
function guardar() {
  try {
    localStorage.setItem('nikkei-carrito', JSON.stringify(carrito))
  } catch (error) {
    avisar('Tu selección se mantiene mientras esta página esté abierta.')
  }
}
function crear(tag, clase, texto) {
  const nodo = document.createElement(tag)

  if (clase) nodo.className = clase

  if (texto !== undefined) nodo.textContent = texto

  return nodo
}
function avisar(texto) {
  $('#aviso').textContent = texto

  clearTimeout(avisoTimer)

  avisoTimer = setTimeout(() => {
    $('#aviso').textContent = ''
  }, 2400)
}
function renderProductos() {
  const busqueda = $('#buscar').value.trim().toLocaleLowerCase('es')

  const visibles = productos.filter(
    (p) =>
      (categoria === 'Todas' || p.categoria === categoria) &&
      (!soloPromos || p.promocion) &&
      (p.nombre + ' ' + p.descripcion)
        .toLocaleLowerCase('es')
        .includes(busqueda),
  )

  $('#productos').replaceChildren()

  $('#resultados').textContent =
    visibles.length +
    (visibles.length === 1 ? ' producto' : ' productos') +
    (soloPromos ? ' en promoción' : ' en la carta')

  $('#estado-catalogo').textContent = visibles.length
    ? ''
    : 'No hay productos para esta selección. Prueba otra categoría o limpia los filtros.'

  visibles.forEach((p) => {
    const card = crear('article', 'product-card')

    const visual = crear('div', 'product-image')

    if (p.imagen) {
      const img = crear('img')
      img.src = p.imagen
      img.alt = p.nombre + ': fotografía referencial'
      img.loading = 'lazy'

      // Mientras falta la foto, se muestra el nombre del producto.
      img.addEventListener(
        'error',
        () => {
          img.remove()

          visual.append(crear('div', 'product-placeholder', p.nombre))
        },
        { once: true },
      )

      visual.append(img)
    } else {
      visual.append(crear('div', 'product-placeholder', p.nombre))
    }
    if (p.promocion) visual.append(crear('span', 'badge', 'PARA DOS'))

    const content = crear('div', 'product-content')

    content.append(
      crear('span', 'category-label', p.categoria),
      crear('h3', '', p.nombre),
      crear('p', '', p.descripcion),
    )

    const actions = crear('div', 'product-actions')

    const boton = crear('button', '', p.disponible ? 'Agregar +' : 'Agotado')
    boton.disabled = !p.disponible
    boton.type = 'button'
    boton.setAttribute('aria-label', 'Agregar ' + p.nombre)

    boton.addEventListener('click', () => agregar(p))

    actions.append(crear('strong', '', dinero(p.precio)), boton)
    content.append(actions)
    card.append(visual, content)
    $('#productos').append(card)
  })
}
async function cargar(modo = 'normal') {
  $('#productos').replaceChildren()
  $('#resultados').textContent = ''
  $('#estado-catalogo').textContent = 'Cargando la carta…'
  $('#productos').setAttribute('aria-busy', 'true')
  $('#reintentar').hidden = true
  $('#probar-catalogo').disabled = true

  try {
    productos = await servicio.consultarProductos(modo)
    renderProductos()
  } catch (error) {
    productos = []
    $('#estado-catalogo').textContent = error.message
    $('#reintentar').hidden = false
  } finally {
    $('#productos').setAttribute('aria-busy', 'false')
    $('#probar-catalogo').disabled = false
  }
}
function agregar(producto) {
  if (enviando) return avisar('Espera a que termine la confirmación actual.')

  if (producto.disponible === false) return
  const item = carrito.find((p) => p.id === producto.id)

  if (item) {
    if (item.cantidad >= 20) return avisar('Máximo 20 unidades por producto.')
    item.cantidad++
  } else
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1,
    })

  $('#estado-pedido').textContent = ''
  guardar()
  renderCarrito()
  avisar(producto.nombre + ' agregado a tu pedido')
}
function cambiar(id, diferencia) {
  if (enviando) return

  const item = carrito.find((p) => p.id === id)

  if (!item) return

  item.cantidad = Math.min(20, item.cantidad + diferencia)

  carrito = carrito.filter((p) => p.cantidad > 0)
  guardar()
  renderCarrito()
  $('#estado-pedido').textContent = ''
}
function renderCarrito() {
  $('#items-carrito').replaceChildren()

  const cantidad = carrito.reduce((total, p) => total + p.cantidad, 0)

  $('#cantidad-carrito').textContent = cantidad

  $('#abrir-carrito').setAttribute(
    'aria-label',
    'Ver pedido: ' + cantidad + ' unidades',
  )

  if (!carrito.length)
    $('#items-carrito').append(
      crear(
        'p',
        'muted',
        'Tu pedido está vacío. Elige tus favoritos en la carta.',
      ),
    )

  carrito.forEach((p) => {
    const row = crear('div', 'cart-item')
    const detail = crear('div')
    detail.append(
      crear('h3', '', p.nombre),
      crear('span', '', dinero(p.precio) + ' por unidad'),
    )

    const quantity = crear('div', 'quantity')
    const cambios = [-1, 1]
    cambios.forEach((diff, index) => {
      if (index) quantity.append(crear('span', '', p.cantidad))

      const btn = crear('button', '', diff === -1 ? '−' : '+')
      btn.type = 'button'
      btn.disabled = enviando
      btn.setAttribute(
        'aria-label',
        (diff === -1 ? 'Quitar una unidad de ' : 'Agregar una unidad de ') +
          p.nombre,
      )
      btn.addEventListener('click', () => cambiar(p.id, diff))
      quantity.append(btn)
    })

    detail.append(quantity)
    row.append(detail, crear('strong', '', dinero(p.precio * p.cantidad)))
    $('#items-carrito').append(row)
  })

  $('#total').textContent = dinero(
    carrito.reduce((t, p) => t + p.precio * p.cantidad, 0),
  )

  $('#confirmar').disabled = !carrito.length || enviando
  $('#vaciar').disabled = !carrito.length || enviando
}
function limpiar() {
  categoria = 'Todas'
  soloPromos = false
  $('#buscar').value = ''

  document.querySelectorAll('[data-category]').forEach((btn) => {
    const activo = btn.dataset.category === 'Todas'
    btn.classList.toggle('active', activo)
    btn.setAttribute('aria-pressed', activo)
  })
}
$('#busqueda').addEventListener('submit', (event) => {
  event.preventDefault()
  soloPromos = false
  renderProductos()
  location.hash = 'carta'
})

$('#buscar').addEventListener('input', () => {
  soloPromos = false
  renderProductos()
})

$('#categorias').addEventListener('click', (event) => {
  const btn = event.target.closest('[data-category]')
  if (!btn) return
  categoria = btn.dataset.category
  soloPromos = false

  document.querySelectorAll('[data-category]').forEach((b) => {
    const activo = b === btn
    b.classList.toggle('active', activo)
    b.setAttribute('aria-pressed', activo)
  })
  renderProductos()
})

$('#limpiar').addEventListener('click', () => {
  limpiar()
  renderProductos()
})

$('#ver-promos').addEventListener('click', () => {
  limpiar()
  soloPromos = true
  renderProductos()
  location.hash = 'carta'
})

$('#reintentar').addEventListener('click', () => {
  $('#modo-catalogo').value = 'normal'
  cargar()
})

$('#probar-catalogo').addEventListener('click', () => {
  limpiar()
  cargar($('#modo-catalogo').value)
})

$('#abrir-carrito').addEventListener('click', () => {
  renderCarrito()
  $('#carrito').showModal()
})

$('#cerrar-carrito').addEventListener('click', () => $('#carrito').close())

$('#vaciar').addEventListener('click', () => {
  if (enviando) return
  carrito = []
  guardar()
  renderCarrito()
  $('#estado-pedido').textContent = ''
})

$('#confirmar-form').addEventListener('submit', async (event) => {
  event.preventDefault()
  if (enviando || !carrito.length) return

  enviando = true
  renderCarrito()
  $('#estado-pedido').textContent = 'Enviando tu pedido de prueba…'

  try {
    const datos = {
      direccion: $('#direccion').value.trim(),
      items: carrito.map(({ id, cantidad }) => ({ id, cantidad })),
    }
    const huella = JSON.stringify(datos)
    if (intentoPedido?.huella !== huella)
      intentoPedido = { huella, clave: crypto.randomUUID() }
    const respuesta = await servicio.enviarPedido(
      datos,
      intentoPedido.clave,
      $('#modo-pedido').value,
    )
    carrito = []
    guardar()
    intentoPedido = undefined
    $('#estado-pedido').textContent =
      'Pedido guardado por ' +
      dinero(respuesta.total) +
      '. Continúa en Mi cuenta para iniciar el pago.'
    $('#confirmar-form').reset()
  } catch (error) {
    $('#estado-pedido').textContent = error.message
  } finally {
    enviando = false
    renderCarrito()
  }
})

renderCarrito()
cargar()
