"""Inicia los servicios y verifica HTTP, persistencia y carga con datos aislados."""
import argparse
import json
import os
from pathlib import Path
import signal
import ssl
import subprocess
import sys
import tempfile
import time

import httpx
import psutil

ROOT = Path(__file__).resolve().parents[1]
EVIDENCIA = ROOT / 'docs/evidencias'
BASE = 'https://127.0.0.1:8443'


def start(runtime, log):
    env = dict(os.environ, RUNTIME_DIR=str(runtime), PYTHONUTF8='1')
    options = {'creationflags': subprocess.CREATE_NEW_PROCESS_GROUP} if os.name == 'nt' else {}
    process = subprocess.Popen([sys.executable, 'scripts/iniciar.py'], cwd=ROOT, env=env,
                               stdout=log, stderr=subprocess.STDOUT, **options)
    for _ in range(180):
        if process.poll() is not None:
            raise RuntimeError('El arranque falló. Revisa el registro de ejecución.')
        try:
            response = httpx.get(BASE + '/health', verify=ssl.create_default_context(cafile=str(runtime / 'cert.pem')), timeout=1, trust_env=False)
            if response.is_success:
                return process, env
        except (OSError, httpx.RequestError):
            pass
        time.sleep(.2)
    stop(process)
    raise RuntimeError('El gateway no inició en el plazo esperado.')


def stop(process):
    if process.poll() is None:
        process.send_signal(signal.CTRL_BREAK_EVENT if os.name == 'nt' else signal.SIGTERM)
        process.wait(timeout=20)


def verify_inventory_failure(process, client, order_id):
    """Suspende sólo Inventory y comprueba degradación y recuperación de GraphQL."""
    candidates = psutil.Process(process.pid).children(recursive=True)
    inventory = next(p for p in candidates if 'backend.inventory:app' in p.cmdline())
    query = 'query($id:ID!){resumenPedido(id:$id){estado aviso lineas{descripcionActual}}}'
    body = {'query': query, 'variables': {'id': order_id}}
    csrf = 'prueba-de-resiliencia'
    client.cookies.set('csrf', csrf)
    headers = {'X-CSRF-Token': csrf}
    inventory.suspend()
    try:
        failed = client.post('/api/graphql', json=body, headers=headers, timeout=20)
        failed.raise_for_status()
        partial = failed.json()['data']['resumenPedido']
        assert partial['estado'] == 'entregado' and partial['aviso']
        assert partial['lineas'][0]['descripcionActual'] is None
    finally:
        inventory.resume()
    restored = client.post('/api/graphql', json=body, headers=headers, timeout=20)
    restored.raise_for_status()
    full = restored.json()['data']['resumenPedido']
    assert full['lineas'][0]['descripcionActual'] and full['aviso'] is None
    result = {'dependencia': 'inventory', 'respuesta_parcial_http': failed.status_code,
              'estado_historico': partial['estado'], 'aviso_visible': True,
              'descripcion_recuperada': True}
    (EVIDENCIA/'resiliencia.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
    print('Resiliencia verificada ante caída de Inventory:', result)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--navegador', action='store_true', help='Ejecuta también Playwright y Chromium.')
    args = parser.parse_args()
    EVIDENCIA.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp, (EVIDENCIA / 'servidores.log').open('w', encoding='utf-8') as log:
        runtime = Path(tmp) / 'runtime'
        process, env = start(runtime, log)
        try:
            tests = subprocess.run([sys.executable, '-m', 'pytest', '-q', 'tests',
                                    '--junitxml=docs/evidencias/pruebas.xml'], cwd=ROOT,
                                   env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
            (EVIDENCIA/'pruebas.log').write_text(tests.stdout, encoding='utf-8')
            print(tests.stdout, end='')
            tests.check_returncode()
            subprocess.run([sys.executable, 'scripts/carga.py'], cwd=ROOT, env=env, check=True)
            if args.navegador:
                subprocess.run(['node', 'scripts/prueba_navegador.cjs'], cwd=ROOT, env=env, check=True)
        finally:
            stop(process)
        checkpoint = json.loads((runtime/'checkpoint.json').read_text())
        process, _ = start(runtime, log)
        try:
            with httpx.Client(base_url=BASE, verify=str(runtime/'cert.pem'), trust_env=False) as client:
                client.cookies.set('session', checkpoint['session'])
                response = client.get('/api/orders/'+checkpoint['order_id'])
                response.raise_for_status()
                result = {'http': response.status_code, 'estado': response.json()['status'],
                          'total_clp': response.json()['total'], 'reinicio': True}
                assert result['estado'] == 'entregado' and result['total_clp'] == 29990
                (EVIDENCIA/'persistencia.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
                print('Persistencia verificada tras reiniciar:', result)
                verify_inventory_failure(process, client, checkpoint['order_id'])
        finally:
            stop(process)


if __name__ == '__main__':
    main()
