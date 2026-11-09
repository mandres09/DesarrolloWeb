# Nikkei Roll Evaluación 2

Caso 19 · Ventas en línea y despacho · Marco Fuentealba

Backend de evaluación en localhost. El frontend de Nikkei Roll permite consultar la carta, crear y verificar una cuenta, armar un pedido, iniciar un pago de prueba y consultar el estado mediante GraphQL. El código original de la Evaluación 1 está en la otra carpeta del ZIP.

## Arranque en Windows

Abre una terminal en esta carpeta. Usa Python 3.12 con el lanzador `py`.

```bat
py -3.12 -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python scripts\iniciar.py
```

En macOS o Linux:

```sh
python3.12 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python scripts/iniciar.py
```

Abre **https://localhost:8443**. El certificado es autofirmado y se genera en el primer arranque. Su certificado público está en `.runtime/cert.pem`. Usa la excepción del navegador únicamente para esta dirección local o confía explícitamente en ese certificado en un perfil de prueba. Ctrl+C detiene los nueve procesos. En Windows, `iniciar.bat` también inicia la aplicación si ya se creó el entorno.

## Demostración

1. En **Mi cuenta**, crea un cliente con un correo ficticio como `demo@example.test`, RUN de ejemplo `11111111-1`, contraseña de al menos diez caracteres, comuna y provincia Santiago, región Metropolitana, fecha de nacimiento pasada y teléfono ficticio `+56911111111`.
2. En otra terminal, ejecuta `.venv\Scripts\python -X utf8 scripts\operador.py correos` para consultar el buzón. Copia el código del mensaje destinado al correo ficticio. Verifica el correo e inicia sesión.
3. En **Carta**, agrega un roll salmón. Abre **Tu pedido**, usa `Dirección de prueba 123, Santiago` y crea el pedido. La dirección `Dirección lejana 123, Santiago` permite probar el rechazo por cobertura.
4. En **Mi cuenta**, pulsa **Actualizar pedidos** y luego **Iniciar pago de prueba**. Copia el identificador y ejecuta `.venv\Scripts\python -X utf8 scripts\operador.py aprobar ID_DEL_PAGO`. Actualiza para ver el pedido pagado por $8.490 y el detalle combinado de pedidos e inventario.
5. El personal usa las cuentas ficticias de `.runtime/cuentas-demo.json`. Los ejemplos REST de `docs/contratos/ejemplos.json` muestran las operaciones de caja, despacho, administración y dueño. Puedes abrir `https://localhost:8443/api/orders/ID_DEL_PEDIDO/dispatch-print` en el navegador tras iniciar sesión con despacho. Imprime con Ctrl+P.

En macOS o Linux, usa `.venv/bin/python` y barras diagonales en los ejemplos. Para escribir con sesión fuera del navegador, conserva cookies HTTPS y copia el valor de la cookie `csrf` a la cabecera `X-CSRF-Token`. La cookie `session` es HttpOnly. No se copian credenciales del operador al navegador.

## Pruebas y evidencias

Detén primero cualquier instancia local para liberar 8443 y 8500–8507. Ejecuta:

```bat
.venv\Scripts\python scripts\verificar.py
```

El verificador usa un directorio temporal para iniciar los nueve servicios, ejecutar pruebas HTTP y medir carga. Luego reinicia con los mismos archivos SQLite para comprobar persistencia y suspende brevemente Inventory para verificar la respuesta parcial de GraphQL. Las evidencias quedan en `docs/evidencias`. Para repetir el recorrido visual, instala Node.js, Playwright y su Chromium en un entorno de pruebas, define `NIKKEI_PYTHON` con la ruta del Python del entorno y agrega `--navegador` al comando anterior. La variable `CHROMIUM` permite seleccionar un binario ya instalado.

## Arquitectura y límites de la prueba

- 8443 es la entrada para el navegador. Los procesos 8500–8507 se enlazan a 127.0.0.1 y requieren identidad técnica para las operaciones. Cada servicio conserva su SQLite.
- `GET /health` permite comprobar arranque. Los registros incluyen un identificador de correlación. `RUNTIME_DIR` permite aislar la configuración y `DATA_DIR` cambiar el directorio de bases.
- El proveedor de pago, el correo y el comprobante funcionan con adaptadores locales. El comprobante es académico, sin validez tributaria. El modo local resuelve dos domicilios de prueba. `GEOCODER_URL`, `LOCAL_LAT` y `LOCAL_LON` permiten configurar otro entorno. La dirección se comparte con el geocodificador solo si este se configura.
- El despacho sigue los estados pagado, preparando, despachado y entregado. La anulación con motivo se admite hasta el comienzo de preparación. Para un intento interrumpido o una reserva impaga de más de 15 minutos, el administrador invoca `POST /api/admin/reconcile`. El inventario devuelve las unidades una sola vez.
- `.runtime` contiene datos, claves generadas y cuentas de prueba. Está excluida de Git y del ZIP. El script `scripts/rotar.py` renueva identidades y firmas con los procesos detenidos.
- Los diagramas `.dot` son editables y sus versiones `.svg` son legibles en navegador. Los contratos incluyen el schema GraphQL, OpenAPI y ejemplos de entradas, salidas y cabeceras.
