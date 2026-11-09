async function api(ruta, metodo = 'GET', datos, cabeceras = {}) {
  const csrf = document.cookie
    .split(String.fromCharCode(59))
    .map((parte) => parte.trim())
    .find((parte) => parte.startsWith('csrf='))
    ?.slice(5)
  const headers = { ...cabeceras }
  if (csrf) headers['X-CSRF-Token'] = csrf
  if (datos !== undefined) headers['Content-Type'] = 'application/json'
  const respuesta = await fetch('/api' + ruta, {
    method: metodo,
    headers,
    body: datos === undefined ? undefined : JSON.stringify(datos),
  })
  const resultado = await respuesta.json()
  if (!respuesta.ok) throw new Error(resultado.detail)
  return resultado
}

const servicio = {
  async consultarProductos(modo = 'normal') {
    if (modo === 'error')
      throw new Error('No pudimos cargar la carta. Intenta nuevamente.')
    if (modo === 'empty') return []
    return api('/products')
  },
  async enviarPedido(datos, clave, modo = 'normal') {
    if (modo === 'error')
      throw new Error(
        'No pudimos confirmar. Tu selección se conserva para reintentar.',
      )
    return api('/orders', 'POST', datos, { 'Idempotency-Key': clave })
  },
}
