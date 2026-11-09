# Contratos de integración local

## Enrutamiento

Las operaciones públicas están en operaciones.csv y gateway.openapi.json. El gateway elimina el prefijo /api. Para S01 a S05 elimina también /auth, por ejemplo /api/auth/verify se convierte en /verify de Auth. El destino de /api/admin/clients es /admin/clients de Auth. Los restantes caminos mantienen el sufijo publicado. Las rutas privadas y los endpoints de operador quedan fuera de la lista del gateway.

La sesión viaja en la cookie session. El gateway crea la cabecera interna Authorization con ese valor y descarta Authorization, X-User, X-Role y X-Service-Key del navegador. El destino valida el token de servicio en el gestor. Auth revalida sesión y vigencia con su SQLite cuando el destino lo solicita. Las escrituras con sesión llevan también X-CSRF-Token.

## Operaciones internas

| Origen y destino | Operación | Datos y comportamiento |
|---|---|---|
| Auth a Clients | POST /internal/profiles | UUID y perfil sin contraseña. Crea el perfil antes de enviar el correo. |
| Auth a proveedor | POST /internal/mail | Correo, asunto y código de verificación. Se guarda en buzón local. |
| Destinos a Auth | POST /internal/session | Bearer de usuario. Devuelve identidad, rol y estado verificado. |
| Orders a proveedor | POST /internal/geocode | Sólo dirección. Entrega latitud y longitud para calcular cobertura. |
| Orders a Inventory | POST /internal/reserve | UUID del pedido e ítems. Reserva todo el lote en una transacción o devuelve 409. |
| Orders a Inventory | POST /internal/release/{id} | UUID del pedido. Devuelve unidades una vez y deja marca de liberación. |
| Payments a Orders | GET /internal/orders/{id} | Devuelve UUID, propietario, total y estado necesarios para abrir el checkout. |
| Payments a proveedor | POST /internal/checkout | UUID de pago y total oficial. Repetir conserva el checkout. |
| Proveedor a Payments | POST /webhook | event_id, payment_id, total y status pagado. Firma SHA-256 HMAC del timestamp, un punto y el JSON exacto. Ventana de 300 segundos. |
| Payments a Orders | POST /internal/paid/{id} | UUID del pedido. Transición a pagado o respuesta idempotente. |
| Orders a Payments | POST /internal/refund/{id} | UUID del pedido. Solicita devolución de prueba al proveedor. |
| Orders a proveedor | POST /internal/receipt | Pedido y total con sus líneas. El proveedor resuelve el correo en Auth. Una emisión por pedido. |
| GraphQL a Orders | GET /orders o GET /orders/{id} | Conserva sesión, permisos y propiedad en la consulta. |
| GraphQL a Inventory | POST /internal/batch | Hasta 100 IDs por lote. Sin acceso a SQLite de Inventory. |

Cada tramo requiere HTTPS e identidad técnica. El certificado local se confía de forma explícita. Los timeouts se traducen en 503 o en aviso de respuesta parcial en GraphQL. Los identificadores y valores de ejemplo no corresponden a una cuenta real.
