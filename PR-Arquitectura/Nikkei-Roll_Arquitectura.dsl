workspace "Nikkei Roll" "Arquitectura de la implementación local entregada" {
    !identifiers hierarchical
    model {
        cliente = person "Cliente" "Compra y consulta sus propios pedidos"
        admin = person "Administrador" "Gestiona cuentas, productos y pedidos"
        owner = person "Propietario" "Consulta catálogo administrativo y ventas"
        cashier = person "Cajero" "Gestiona comprobantes y estados autorizados"
        dispatch = person "Despacho" "Consulta órdenes y registra el avance de entrega"
        operador = person "Operador de prueba" "Consulta buzón y aprueba pagos desde una consola"
        sistema = softwareSystem "Nikkei Roll" "Cocina peruano-japonesa con carta de rolls, pedidos y despacho" {
            web = container "Frontend web" "HTML, CSS y JavaScript. Se sirve desde gateway" "HTML / CSS / JavaScript"
            gateway = container "API Gateway" "FastAPI. HTTPS 8443. Entrada del navegador" "Python / FastAPI" {
                g_control = component "Controles HTTP" "app_base. Tamaño, cabeceras, correlación y límite de solicitudes" "Python / FastAPI"
                g_rutas = component "Selector de rutas" "ROUTES y proxy. Comprueba método, ruta y cookie requerida" "Python / FastAPI"
                g_csrf = component "Control de origen y CSRF" "proxy. Comprueba origen y token para operaciones con sesión" "Python / FastAPI"
                g_reenvio = component "Reenvío privado" "proxy. Construye cabeceras propias y propaga sesión e idempotencia" "Python / FastAPI"
                g_respuesta = component "Respuesta y cookies" "proxy. Filtra errores y crea o elimina cookies de sesión" "Python / FastAPI"
            }
            auth = container "Autenticación" "FastAPI 8501. Cuentas, roles, JWT y sesiones" "Python / FastAPI"
            clients = container "Clientes" "FastAPI 8502. Perfiles y datos de clientes" "Python / FastAPI"
            inventory = container "Inventario" "FastAPI 8503. Catálogo, stock y reservas" "Python / FastAPI"
            orders = container "Pedidos" "FastAPI 8504. Precios, estados, despacho y reportes" "Python / FastAPI"
            payments = container "Pagos" "FastAPI 8505. Inicio de pago, webhook y reembolso" "Python / FastAPI"
            graphql = container "Agregador GraphQL" "FastAPI y graphql-core. Puerto 8506" "Python / FastAPI" {
                q_endpoint = component "Endpoint privado" "endpoint. POST /graphql, peer y sesión vigente" "Python / FastAPI"
                q_limits = component "Validador de consultas" "limits y validate. Profundidad, campos y schema" "Python / FastAPI"
                q_resolvers = component "Resolvers" "resumen y mine. resumenPedido y misPedidos" "Python / FastAPI"
                q_aggregate = component "Agregación de productos" "aggregate. Una consulta por lote al inventario" "Python / FastAPI"
                q_address = component "Permiso de dirección" "address. Restringe el campo según el rol" "Python / FastAPI"
            }
            provider = container "Proveedor local de prueba" "FastAPI 8507. Buzón, checkout y geocodificación" "Python / FastAPI"
            secrets = container "Gestor de secretos" "FastAPI 8500. Identidades técnicas y claves por ACL" "Python / FastAPI"
            consola = container "Consola del operador" "Python. scripts/operador.py" "Python"
            db_auth = container "auth.sqlite" "Archivo propio del servicio en .runtime/data" "SQLite" {
                tags "Database"
            }
            db_clients = container "clients.sqlite" "Archivo propio del servicio en .runtime/data" "SQLite" {
                tags "Database"
            }
            db_inventory = container "inventory.sqlite" "Archivo propio del servicio en .runtime/data" "SQLite" {
                tags "Database"
            }
            db_orders = container "orders.sqlite" "Archivo propio del servicio en .runtime/data" "SQLite" {
                tags "Database"
            }
            db_payments = container "payments.sqlite" "Archivo propio del servicio en .runtime/data" "SQLite" {
                tags "Database"
            }
            db_provider = container "provider.sqlite" "Archivo propio del servicio en .runtime/data" "SQLite" {
                tags "Database"
            }
            config = container "Configuración privada" ".runtime/secrets.json y tokens locales" "SQLite" {
                tags "Database"
            }
        }
        geocoder = softwareSystem "Geocodificador configurable" "Se utiliza si existe GEOCODER_URL" "External"
        sistema.auth -> sistema.db_auth "Lee y escribe sus datos" "SQLite local"
        sistema.clients -> sistema.db_clients "Lee y escribe sus datos" "SQLite local"
        sistema.inventory -> sistema.db_inventory "Lee y escribe sus datos" "SQLite local"
        sistema.orders -> sistema.db_orders "Lee y escribe sus datos" "SQLite local"
        sistema.payments -> sistema.db_payments "Lee y escribe sus datos" "SQLite local"
        sistema.provider -> sistema.db_provider "Lee y escribe sus datos" "SQLite local"
        sistema.secrets -> sistema.config "Lee claves e identidades autorizadas" "Archivo local"
        sistema -> geocoder "Resuelve domicilios reales según configuración" "HTTPS"
        sistema.provider -> geocoder "Consulta solo el texto de dirección" "HTTPS"
        cliente -> sistema "Compra y consulta sus propios pedidos" "HTTPS"
        cliente -> sistema.web "Compra y consulta sus propios pedidos" "HTTPS"
        admin -> sistema "Gestiona cuentas, productos y pedidos" "HTTPS"
        admin -> sistema.web "Gestiona cuentas, productos y pedidos" "HTTPS"
        owner -> sistema "Consulta catálogo administrativo y ventas" "HTTPS"
        owner -> sistema.web "Consulta catálogo administrativo y ventas" "HTTPS"
        cashier -> sistema "Gestiona comprobantes y estados autorizados" "HTTPS"
        cashier -> sistema.web "Gestiona comprobantes y estados autorizados" "HTTPS"
        dispatch -> sistema "Consulta órdenes y registra el avance de entrega" "HTTPS"
        dispatch -> sistema.web "Consulta órdenes y registra el avance de entrega" "HTTPS"
        operador -> sistema "Opera el entorno académico de prueba" "Consola local"
        operador -> sistema.consola "Ejecuta correos o aprobar" "Terminal"
        sistema.consola -> sistema.provider "Lee buzón o aprueba el checkout" "HTTPS + token de operador"
        sistema.web -> sistema.gateway "Envía peticiones REST y consultas GraphQL" "HTTPS / JSON"
        sistema.gateway -> sistema.auth "Reenvía rutas permitidas y sesión" "HTTPS + identidad de servicio"
        sistema.gateway -> sistema.clients "Reenvía rutas permitidas y sesión" "HTTPS + identidad de servicio"
        sistema.gateway -> sistema.inventory "Reenvía rutas permitidas y sesión" "HTTPS + identidad de servicio"
        sistema.gateway -> sistema.orders "Reenvía rutas permitidas y sesión" "HTTPS + identidad de servicio"
        sistema.gateway -> sistema.payments "Reenvía rutas permitidas y sesión" "HTTPS + identidad de servicio"
        sistema.gateway -> sistema.graphql "Reenvía rutas permitidas y sesión" "HTTPS + identidad de servicio"
        sistema.auth -> sistema.clients "Crea la ficha del cliente" "HTTPS + identidad de servicio"
        sistema.auth -> sistema.provider "Deposita el código en el buzón de prueba" "HTTPS + identidad de servicio"
        sistema.clients -> sistema.auth "Revalida la sesión y el rol" "HTTPS + identidad de servicio"
        sistema.inventory -> sistema.auth "Revalida la sesión y el rol" "HTTPS + identidad de servicio"
        sistema.orders -> sistema.auth "Revalida la sesión y el rol" "HTTPS + identidad de servicio"
        sistema.payments -> sistema.auth "Revalida la sesión y el rol" "HTTPS + identidad de servicio"
        sistema.graphql -> sistema.auth "Revalida la sesión y el rol" "HTTPS + identidad de servicio"
        sistema.auth -> sistema.secrets "Valida identidad técnica o solicita claves" "HTTPS + identidad de servicio"
        sistema.clients -> sistema.secrets "Valida identidad técnica o solicita claves" "HTTPS + identidad de servicio"
        sistema.inventory -> sistema.secrets "Valida identidad técnica o solicita claves" "HTTPS + identidad de servicio"
        sistema.orders -> sistema.secrets "Valida identidad técnica o solicita claves" "HTTPS + identidad de servicio"
        sistema.payments -> sistema.secrets "Valida identidad técnica o solicita claves" "HTTPS + identidad de servicio"
        sistema.graphql -> sistema.secrets "Valida identidad técnica o solicita claves" "HTTPS + identidad de servicio"
        sistema.provider -> sistema.secrets "Valida identidad técnica o solicita claves" "HTTPS + identidad de servicio"
        sistema.orders -> sistema.provider "Resuelve dirección o envía comprobante de prueba" "HTTPS + identidad de servicio"
        sistema.orders -> sistema.inventory "Reserva o libera unidades y obtiene precios" "HTTPS + identidad de servicio"
        sistema.payments -> sistema.orders "Consulta importe y confirma el pago" "HTTPS + identidad de servicio"
        sistema.orders -> sistema.payments "Solicita cancelación o reembolso de prueba" "HTTPS + identidad de servicio"
        sistema.payments -> sistema.provider "Registra checkout o solicita reembolso de prueba" "HTTPS + identidad de servicio"
        sistema.provider -> sistema.payments "Envía aprobación firmada con fecha y evento" "HTTPS + token + HMAC"
        sistema.provider -> sistema.auth "Obtiene correo para el comprobante" "HTTPS + identidad de servicio"
        sistema.graphql -> sistema.orders "Consulta pedidos con la identidad del usuario" "HTTPS + identidad de servicio"
        sistema.graphql -> sistema.inventory "Obtiene productos mediante una consulta por lote" "HTTPS + identidad de servicio"
        sistema.web -> sistema.gateway.g_control "Envía solicitud" "HTTPS / JSON"
        sistema.gateway.g_control -> sistema.gateway.g_rutas "Solicitud dentro de los límites" "Llamada interna"
        sistema.gateway.g_rutas -> sistema.gateway.g_csrf "Ruta permitida" "Llamada interna"
        sistema.gateway.g_csrf -> sistema.gateway.g_reenvio "Origen y CSRF aceptados" "Llamada interna"
        sistema.gateway.g_reenvio -> sistema.gateway.g_respuesta "Respuesta del servicio" "Llamada interna"
        sistema.gateway.g_reenvio -> sistema.auth "Enruta hacia el servicio permitido" "HTTPS + identidad de servicio"
        sistema.gateway.g_reenvio -> sistema.clients "Enruta hacia el servicio permitido" "HTTPS + identidad de servicio"
        sistema.gateway.g_reenvio -> sistema.inventory "Enruta hacia el servicio permitido" "HTTPS + identidad de servicio"
        sistema.gateway.g_reenvio -> sistema.orders "Enruta hacia el servicio permitido" "HTTPS + identidad de servicio"
        sistema.gateway.g_reenvio -> sistema.payments "Enruta hacia el servicio permitido" "HTTPS + identidad de servicio"
        sistema.gateway.g_reenvio -> sistema.graphql "Enruta hacia el servicio permitido" "HTTPS + identidad de servicio"
        sistema.gateway.g_respuesta -> sistema.web "Entrega JSON y cookies protegidas" "HTTPS"
        sistema.gateway -> sistema.graphql.q_endpoint "Reenvía consulta y Bearer de sesión" "HTTPS + identidad de servicio"
        sistema.graphql.q_endpoint -> sistema.auth "Comprueba sesión mediante user" "HTTPS + identidad de servicio"
        sistema.graphql.q_endpoint -> sistema.secrets "Valida identidad técnica y clave pública" "HTTPS + identidad de servicio"
        sistema.graphql.q_endpoint -> sistema.graphql.q_limits "Parsea y valida la consulta" "Llamada interna"
        sistema.graphql.q_limits -> sistema.graphql.q_resolvers "Ejecuta operación válida" "Llamada interna"
        sistema.graphql.q_resolvers -> sistema.orders "Obtiene pedidos autorizados" "HTTPS + identidad de servicio"
        sistema.graphql.q_resolvers -> sistema.graphql.q_aggregate "Entrega las líneas históricas" "Llamada interna"
        sistema.graphql.q_aggregate -> sistema.inventory "POST /internal/batch" "HTTPS + identidad de servicio"
        sistema.graphql.q_resolvers -> sistema.graphql.q_address "Resuelve el campo dirección si se solicita" "Llamada interna"
    }
    views {
        systemContext sistema "C1_Contexto" {
            title "C1 · Contexto de Nikkei Roll · Nikkei Roll"
            include cliente admin owner cashier dispatch operador sistema geocoder
            autoLayout tb
        }
        container sistema "C2_Contenedores" {
            title "C2 · Contenedores de Nikkei Roll · Nikkei Roll"
            include sistema.web sistema.gateway sistema.auth sistema.clients sistema.inventory sistema.orders sistema.payments sistema.graphql sistema.provider sistema.secrets sistema.consola sistema.db_auth sistema.db_clients sistema.db_inventory sistema.db_orders sistema.db_payments sistema.db_provider sistema.config geocoder
            autoLayout tb
        }
        component sistema.gateway "C3_Gateway" {
            title "C3 · Componentes del gateway · Nikkei Roll"
            include sistema.web sistema.gateway.g_control sistema.gateway.g_rutas sistema.gateway.g_csrf sistema.gateway.g_reenvio sistema.gateway.g_respuesta sistema.auth sistema.clients sistema.inventory sistema.orders sistema.payments sistema.graphql
            autoLayout tb
        }
        component sistema.graphql "C3_BFF_GraphQL" {
            title "C3 · Agregador GraphQL · Nikkei Roll"
            include sistema.gateway sistema.graphql.q_endpoint sistema.graphql.q_limits sistema.graphql.q_resolvers sistema.graphql.q_aggregate sistema.graphql.q_address sistema.auth sistema.secrets sistema.orders sistema.inventory
            autoLayout tb
        }
        dynamic sistema "D_Registro_Pedido" {
            title "Flujo · Registro de pedido · Nikkei Roll"
            1: cliente -> sistema.web "Confirma productos y dirección"
            2: sistema.web -> sistema.gateway "POST /api/orders con Idempotency-Key"
            3: sistema.gateway -> sistema.orders "Reenvía sesión e identidad técnica"
            4: sistema.orders -> sistema.auth "Verifica cuenta, sesión y correo"
            5: sistema.orders -> sistema.provider "Resuelve dirección y verifica radio"
            6: sistema.orders -> sistema.db_orders "Guarda estado reservando"
            7: sistema.orders -> sistema.inventory "Reserva unidades y obtiene precios"
            8: sistema.orders -> sistema.db_orders "Calcula total y guarda pendiente_pago"
            autoLayout tb
        }
        dynamic sistema "D_Consulta_Protegida" {
            title "Flujo · Consulta protegida · Nikkei Roll"
            1: cliente -> sistema.web "Abre Mis pedidos"
            2: sistema.web -> sistema.gateway "POST /api/graphql con cookie y CSRF"
            3: sistema.gateway -> sistema.graphql "Reenvía consulta y sesión"
            4: sistema.graphql -> sistema.auth "Revalida la sesión"
            5: sistema.graphql -> sistema.orders "Consulta pedidos permitidos"
            6: sistema.orders -> sistema.auth "Comprueba identidad y permisos"
            7: sistema.graphql -> sistema.inventory "Consulta productos por lote"
            autoLayout tb
        }
        dynamic sistema "D_Pago_Prueba" {
            title "Flujo · Pago local de prueba · Nikkei Roll"
            1: cliente -> sistema.web "Pulsa Iniciar pago de prueba"
            2: sistema.web -> sistema.gateway "POST /api/payments con order_id"
            3: sistema.gateway -> sistema.payments "Reenvía solicitud con sesión"
            4: sistema.payments -> sistema.orders "Obtiene importe y comprueba propiedad"
            5: sistema.payments -> sistema.provider "Crea checkout local de prueba"
            6: operador -> sistema.consola "Ejecuta aprobar ID_DEL_PAGO"
            7: sistema.consola -> sistema.provider "Solicita aprobación con token propio"
            8: sistema.provider -> sistema.payments "Envía evento firmado HMAC"
            9: sistema.payments -> sistema.orders "Marca pedido pagado"
            10: sistema.payments -> sistema.db_payments "Guarda pago y evento procesado"
            autoLayout tb
        }
        styles {
            element "Person" {
                shape Person
                background #526579
                color #FFFFFF
            }
            element "Software System" {
                background #9B2936
                color #FFFFFF
            }
            element "External" {
                background #667586
                color #FFFFFF
            }
            element "Container" {
                background #EDF2F7
                color #172B40
            }
            element "Database" {
                shape Cylinder
            }
            element "Component" {
                background #FFFFFF
                color #172B40
            }
        }
    }
}
