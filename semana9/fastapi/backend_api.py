import os
import secrets

from fastapi import FastAPI, Header, HTTPException, Depends

# Desde esta carpeta: python -m uvicorn backend_api:app --port 9000
app = FastAPI(
    title="Backend API Nikkei Roll",
    description="Productos y pedidos de ejemplo para consultar desde el API Gateway"
)


INTERNAL_GATEWAY_SECRET = os.getenv("INTERNAL_GATEWAY_SECRET")
if not INTERNAL_GATEWAY_SECRET:
    raise RuntimeError("INTERNAL_GATEWAY_SECRET no esta configurado")


def verify_gateway(x_gateway_secret: str = Header(default="")):
    valid = secrets.compare_digest(
        x_gateway_secret.encode("utf-8"),
        INTERNAL_GATEWAY_SECRET.encode("utf-8")
    )
    if not valid:
        raise HTTPException(
            status_code=403,
            detail="Solicitud no autorizada desde Gateway"
        )


@app.get("/health", dependencies=[Depends(verify_gateway)])
def health():
    return {"status": "OK", "service": "Backend API Nikkei Roll"}


# Datos y precios ficticios en CLP. No se utiliza base de datos en este avance.
@app.get("/productos", dependencies=[Depends(verify_gateway)])
def productos(
    x_authenticated_client: str | None = Header(default=None),
    x_authenticated_user: str | None = Header(default=None),
    x_authenticated_roles: str | None = Header(default=None)
):
    return {
        "identity": {
            "user_id": x_authenticated_client,
            "username": x_authenticated_user,
            "roles": x_authenticated_roles
        },
        "productos": [
            {
                "id": 1,
                "nombre": "Roll acevichado",
                "descripcion": "Roll de camaron y palta con salsa acevichada, 10 piezas",
                "categoria": "Rolls",
                "precio": 7990
            },
            {
                "id": 2,
                "nombre": "Tabla Nikkei",
                "descripcion": "Seleccion de 30 piezas para compartir",
                "categoria": "Tablas y combos",
                "precio": 19990
            },
            {
                "id": 3,
                "nombre": "Gyozas de pollo",
                "descripcion": "Cinco empanaditas rellenas de pollo",
                "categoria": "Entradas",
                "precio": 4990
            },
            {
                "id": 4,
                "nombre": "Limonada",
                "descripcion": "Limonada de 500 ml",
                "categoria": "Bebidas",
                "precio": 2490
            }
        ]
    }


# Solo se consultan estados de ejemplo; no se procesan pagos ni pedidos reales.
@app.get("/pedidos", dependencies=[Depends(verify_gateway)])
def pedidos(
    x_authenticated_client: str | None = Header(default=None),
    x_authenticated_user: str | None = Header(default=None),
    x_authenticated_roles: str | None = Header(default=None)
):
    return {
        "identity": {
            "user_id": x_authenticated_client,
            "username": x_authenticated_user,
            "roles": x_authenticated_roles
        },
        "pedidos": [
            {"id": 1001, "estado": "pagado"},
            {"id": 1002, "estado": "pendiente"}
        ]
    }
