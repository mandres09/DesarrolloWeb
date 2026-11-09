const estadoCuenta = document.querySelector('#estado')
const listaPedidos = document.querySelector('#pedidos')
const pesos = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
})
const consulta =
  'query { misPedidos(limit: 20) { id estado total aviso lineas { nombre descripcionActual cantidad subtotal } } }'

function informar(mensaje) {
  estadoCuenta.textContent = mensaje
}

function elemento(etiqueta, texto) {
  const nodo = document.createElement(etiqueta)
  nodo.textContent = texto
  return nodo
}

async function cargarPedidos() {
  const resultado = await api('/graphql', 'POST', { query: consulta })
  if (resultado.errors?.length) throw new Error(resultado.errors[0].message)
  listaPedidos.replaceChildren()
  for (const pedido of resultado.data.misPedidos) {
    const tarjeta = elemento('article', '')
    tarjeta.append(
      elemento('h3', pedido.estado + ' · ' + pesos.format(pedido.total)),
    )
    tarjeta.append(elemento('p', 'Pedido ' + pedido.id))
    const lineas = elemento('ul', '')
    for (const linea of pedido.lineas) {
      lineas.append(
        elemento(
          'li',
          linea.cantidad +
            ' × ' +
            linea.nombre +
            ' · ' +
            pesos.format(linea.subtotal),
        ),
      )
      if (linea.descripcionActual)
        lineas.lastElementChild.append(elemento('p', linea.descripcionActual))
    }
    tarjeta.append(lineas)
    if (pedido.aviso) tarjeta.append(elemento('p', pedido.aviso))
    if (pedido.estado === 'pendiente_pago') {
      const pago = elemento('button', 'Iniciar pago de prueba')
      pago.type = 'button'
      pago.dataset.action = 'pago'
      pago.dataset.order = pedido.id
      tarjeta.append(pago)
    }
    listaPedidos.append(tarjeta)
  }
  if (!listaPedidos.children.length)
    listaPedidos.append(elemento('p', 'Todavía no hay pedidos.'))
}

const formularios = {
  registro: '/auth/register',
  login: '/auth/login',
  verificar: '/auth/verify',
}

for (const [id, ruta] of Object.entries(formularios)) {
  const form = document.getElementById(id)
  form.addEventListener('submit', async (evento) => {
    evento.preventDefault()
    const boton = form.querySelector('button')
    boton.disabled = true
    try {
      const resultado = await api(
        ruta,
        'POST',
        Object.fromEntries(new FormData(form)),
      )
      form.reset()
      informar(
        resultado.message || 'Sesión iniciada. Perfil ' + resultado.user.role,
      )
      if (id === 'login' && resultado.user.verified) await cargarPedidos()
    } catch (error) {
      informar(error.message)
    } finally {
      boton.disabled = false
    }
  })
}

document.querySelector('main').addEventListener('click', async (evento) => {
  const boton = evento.target.closest('[data-action]')
  if (!boton) return
  boton.disabled = true
  try {
    switch (boton.dataset.action) {
      case 'reenviar':
        informar((await api('/auth/resend', 'POST', {})).message)
        break
      case 'pedidos':
        await cargarPedidos()
        informar('Pedidos actualizados.')
        break
      case 'salir':
        informar((await api('/auth/logout', 'POST', {})).message)
        listaPedidos.replaceChildren()
        break
      case 'pago': {
        const resultado = await api('/payments', 'POST', {
          order_id: boton.dataset.order,
        })
        informar('Pago de prueba iniciado. Identificador ' + resultado.id)
        break
      }
    }
  } catch (error) {
    informar(error.message)
  } finally {
    boton.disabled = false
  }
})
