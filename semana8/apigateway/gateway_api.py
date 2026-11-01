import os
import secrets
import httpx



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
        if not isinstance(vault_secrets["client_token"], str) or not vault_secrets["client_token"]:
            raise ValueError("client_token requerido")
        if not isinstance(vault_secrets["backend_shared_secret"], str) or not vault_secrets["backend_shared_secret"]:
            raise ValueError("backend_shared_secret requerido")
        return vault_secrets
    except (ValueError, KeyError, TypeError):
        raise HTTPException(status_code=500, detail="Secretos de Vault incompletos o invalidos")


async def authenticate_client(
        credentials: HTTPAuthorizationCredentials= Depends(security)
):
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Bearer token requerido"
        )
    vault_secrets = (
        await get_gateway_secrets()
    )
    expected_token = vault_secrets["client_token"]
    received_token = credentials.credentials
    valid= secrets.compare_digest(received_token.encode("utf-8"), expected_token.encode("utf-8"))
    if not valid:
        raise HTTPException(status_code=401, detail="Token Invalido")
    return {
        "client_id": "student-client",
        "backend_secret": vault_secrets["backend_shared_secret"]
    }

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
        auth["client_id"]
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
