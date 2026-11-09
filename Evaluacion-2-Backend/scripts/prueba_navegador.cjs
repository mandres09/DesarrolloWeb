const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const {execFileSync} = require('node:child_process')
const {chromium} = require('playwright')

const runtime = process.env.RUNTIME_DIR || path.resolve('.runtime')
const python = process.env.NIKKEI_PYTHON || 'python'
const output = path.join('docs', 'evidencias')

function operator(action, value) {
  const args = ['scripts/operador.py', action]
  if (value) args.push(value)
  return JSON.parse(execFileSync(python, args, {encoding: 'utf8', env: {...process.env, RUNTIME_DIR: runtime, PYTHONUTF8: '1'}}))
}

async function main() {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM || undefined,
    args: ['--no-sandbox']
  })
  try {
    const page = await browser.newPage({ignoreHTTPSErrors: true, viewport: {width: 1280, height: 900}})
    page.setDefaultTimeout(12000)
    const errors = []
    page.on('pageerror', error => {
      errors.push(error.message)
      console.error(error.message)
    })
    const base = 'https://localhost:8443'
    await page.goto(base + '/cuenta.html')
    await page.locator('summary').click()
    const email = 'navegador-' + Date.now() + '@example.test'
    const credentials = {correo: email, clave: 'Nikkei-prueba-navegador-2026'}
    const data = {...credentials, nombre: 'Cliente ficticio', run: '11111111-1',
      direccion: 'Dirección de prueba 123, Santiago', comuna: 'Santiago', provincia: 'Santiago',
      region: 'Metropolitana', nacimiento: '1990-01-01', telefono: '+56911111111'}
    for (const [field, value] of Object.entries(data)) {
      await page.locator('#registro [name="' + field + '"]').fill(value)
    }
    await page.locator('#registro button').click()
    await page.getByText(/Registro creado/).waitFor()
    const mail = operator('correos').find(message => message.recipient === email && message.subject === 'Verifica tu correo')
    assert.ok(mail)
    await page.locator('#verificar input').fill(mail.body.split(': ').at(-1))
    await page.locator('#verificar button').first().click()
    await page.getByText(/Correo verificado/).waitFor()
    for (const [field, value] of Object.entries(credentials)) {
      await page.locator('#login [name="' + field + '"]').fill(value)
    }
    await page.locator('#login button').click()
    await page.getByText('Todavía no hay pedidos.').waitFor()
    await page.goto(base + '/#carta')
    await page.getByRole('button', {name: 'Agregar Roll salmón', exact: true}).click()
    await page.locator('#abrir-carrito').click()
    await page.locator('#carrito[open]').waitFor()
    await page.locator('#direccion').fill(data.direccion)
    await page.locator('#confirmar').click()
    await page.getByText(/Pedido guardado/).waitFor()
    await page.goto(base + '/cuenta.html')
    await page.getByRole('button', {name: 'Actualizar pedidos'}).click()
    await page.getByRole('button', {name: 'Iniciar pago de prueba'}).click()
    const status = page.locator('#estado')
    await page.getByText(/Pago de prueba iniciado/).waitFor()
    const paymentId = (await status.textContent()).split(' ').at(-1)
    operator('aprobar', paymentId)
    await page.getByRole('button', {name: 'Actualizar pedidos'}).click()
    await page.getByRole('heading', {name: /pagado.*8.490/}).waitFor()
    assert.match(await page.locator('#pedidos').textContent(), /Salmón, queso crema y palta/)
    await page.locator('#pedidos').screenshot({path: path.join(output, 'pedido-graphql.png')})
    await page.setViewportSize({width: 375, height: 812})
    await page.goto(base + '/#carta')
    await page.getByRole('button', {name: 'Agregar Roll salmón', exact: true}).waitFor()
    await page.locator('#carta').evaluate(node => node.scrollIntoView({behavior: 'instant'}))
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 375)
    await page.screenshot({path: path.join(output, 'carta-movil.png')})
    assert.deepEqual(errors, [])
    console.log('Recorrido Chromium validado. Total de prueba: 8490 CLP.')
    fs.writeFileSync(path.join(output, 'navegador.json'), JSON.stringify({
      navegador: 'Chromium', escritorio_px: 1280, movil_px: 375, total_clp: 8490,
      resultado: 'Registro, verificación, sesión, carrito, pedido, pago de prueba y agregación GraphQL visibles',
      errores_javascript: errors.length
    }, null, 2))
  } finally {
    await browser.close()
  }
}

main().catch(error => {
  console.error(error.message)
  process.exitCode = 1
})
