import os
import httpx
from pydantic import BaseModel



from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    Request,
    Response,
)

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

app = FastAPI(title="API Gateway Nikkei Roll")

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://127.0.0.1:8100")

security = HTTPBearer(
    auto_error=False
)

VAULT_ADDR = os.getenv(
    "VAULT_ADDR", "http://127.0.0.1:8200"
)

VAULT_TOKEN = os.getenv(
    "VAULT_TOKEN"
)

if not VAULT_TOKEN:
    raise RuntimeError(
        "VAULT TOKEN no esta configurado"
    )

async def get_gateway_secrets():
    url =  (
        f"{VAULT_ADDR}"
        "/v1/secret/data/gateway"
    )
    headers = {
        "X-Vault-Token": VAULT_TOKEN
    }
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url, headers=headers)
    except httpx.RequestError:
        raise HTTPException(status_code=500, detail="Vault no disponible")
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="No fue posible acceder a Vault")
    try:
        vault_secrets = response.json()["data"]["data"]
        if not isinstance(vault_secrets["auth_introspection_secret"], str) or not vault_secrets["auth_introspection_secret"]:
            raise ValueError("auth_introspection_secret requerido")
        if not isinstance(vault_secrets["backend_shared_secret"], str) or not vault_secrets["backend_shared_secret"]:
            raise ValueError("backend_shared_secret requerido")
        return vault_secrets
    except (ValueError, KeyError, TypeError):
        raise HTTPException(status_code=500, detail="Secretos de Vault incompletos o invalidos")


# Todas las llamadas al servicio de autenticacion llevan un secreto interno.
async def call_auth(path, payload, gateway_secrets):
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(
                f"{AUTH_SERVICE_URL}/{path}",
                json=payload,
                headers={"X-Gateway-Auth-Secret": gateway_secrets["auth_introspection_secret"]}
            )
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Authentication Service no disponible")
    # 401 describe credenciales de usuario incorrectas; los demas fallos son internos.
    if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Error consultando Authentication Service")
    try:
        return response.json()
    except ValueError:
        raise HTTPException(status_code=502, detail="Respuesta de autenticacion invalida")


async def authenticate_client(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    if credentials is None:
        raise HTTPException(status_code=401, detail="Bearer token requerido")
    gateway_secrets = await get_gateway_secrets()
    identity = await call_auth("introspect", {"token": credentials.credentials}, gateway_secrets)
    if not identity.get("active", False):
        raise HTTPException(status_code=401, detail="Token invalido o expirado")
    return {
        "user_id": identity["user_id"],
        "username": identity["username"],
        "roles": identity["roles"],
        "token": credentials.credentials,
        "auth_secret": gateway_secrets["auth_introspection_secret"],
        "backend_secret": gateway_secrets["backend_shared_secret"]
    }


# Se publica el login en el Gateway para que el cliente no use secretos internos.


class LoginRequest(BaseModel):
    username: str
    password: str


@app.post("/auth/login")
async def login(request: LoginRequest):
    gateway_secrets = await get_gateway_secrets()
    return await call_auth("login", request.model_dump(), gateway_secrets)


@app.post("/auth/logout")
async def logout(auth=Depends(authenticate_client)):
    return await call_auth(
        "logout",
        {"token": auth["token"]},
        {"auth_introspection_secret": auth["auth_secret"]}
    )


BACKEND_URL = "http://127.0.0.1:9000"

@app.api_route(
    "/api/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"]
)
async def proxy(
    path: str,
    request: Request,
    auth= Depends(authenticate_client)
):
    target_url = (
        f"{BACKEND_URL}/{path}"
    )
    body = await request.body()
    gateway_headers={
        "X-Gateway-Secret":
        auth["backend_secret"],
        "X-Authenticated-Client":
        auth["user_id"],
        "X-Authenticated-User": auth["username"],
        "X-Authenticated-Roles": ",".join(auth["roles"])
    }
    content_type = request.headers.get("content-type")
    if content_type:
        gateway_headers["content-type"] = content_type
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            upstream = await client.request(
                method=request.method,
                url=target_url,
                params=request.query_params,
                content=body,
                headers=gateway_headers
            )
    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail="Backend no disponible"
        )
    responde_headers = {}
    if "content-type" in upstream.headers:
        responde_headers["content-type"] = upstream.headers["content-type"]
    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        headers= responde_headers
    )
