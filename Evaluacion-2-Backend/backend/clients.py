"""Perfiles persistentes y acceso autorizado al maestro de clientes."""
import json
from fastapi import Request
from backend.common import app_base, init, db, row, fail, peer, user

app = app_base('Clientes')
init('''CREATE TABLE IF NOT EXISTS profiles(id TEXT PRIMARY KEY,data TEXT);
''')


@app.post('/internal/profiles', status_code=201)
async def create_profile(request: Request):
    await peer(request, ['auth'])
    data = await request.json()
    with db() as c:
        c.execute('INSERT INTO profiles VALUES(?,?)',(data['id'],json.dumps(data)))
    return {'id':data['id']}


@app.get('/me')
async def me(request: Request):
    await peer(request, ['gateway','graphql'])
    u = await user(request,verified=False)
    with db() as c: p=row(c,'SELECT data FROM profiles WHERE id=?',(u['sub'],))
    if not p: fail(404,'Perfil no encontrado.')
    return json.loads(p['data'])


@app.put('/me')
async def edit_me(request: Request):
    await peer(request, ['gateway'])
    u = await user(request)
    data = await request.json()
    allowed={'nombre','direccion','comuna','provincia','region','telefono'}
    if not data or set(data)-allowed: fail(422,'Solo puedes modificar los campos de contacto permitidos.')
    if any(not isinstance(v,str) or not 2 <= len(v.strip()) <= 200 for v in data.values()): fail(422,'Datos de perfil inválidos.')
    with db() as c:
        p=row(c,'SELECT data FROM profiles WHERE id=?',(u['sub'],))
        if not p:fail(404,'Perfil no encontrado.')
        profile=json.loads(p['data']);profile.update(data)
        c.execute('UPDATE profiles SET data=? WHERE id=?',(json.dumps(profile),u['sub']))
    return profile


@app.get('/profiles')
async def profiles(request: Request):
    await peer(request,['gateway'])
    await user(request,['admin'])
    with db() as c:return [json.loads(r['data']) for r in c.execute('SELECT data FROM profiles')]


@app.put('/profiles/{uid}')
async def admin_edit_profile(uid:str,request:Request):
    await peer(request,['gateway']);await user(request,['admin'])
    data=await request.json();allowed={'nombre','direccion','comuna','provincia','region','telefono'}
    if not data or set(data)-allowed or any(not isinstance(v,str) or not 2<=len(v.strip())<=200 for v in data.values()):
        fail(422,'Campos o valores de perfil inválidos.')
    with db() as c:
        r=row(c,'SELECT data FROM profiles WHERE id=?',(uid,))
        if not r:fail(404,'Cliente no encontrado.')
        profile=json.loads(r['data']);profile.update(data)
        c.execute('UPDATE profiles SET data=? WHERE id=?',(json.dumps(profile),uid))
    return profile
