#!/usr/bin/env python3
"""Estado de las subidas a Apps Script, calculado desde git (raíz del repo Backend):
    python3 -I "Consolidados de cambios/estado_subidas.py" [ruta_al_clon_de_Web]

Para qué sirve (regla de la usuaria, 21-nov-2026): las filas de `Pendientes.md`
NO repiten «corre `subirBaseDesdeGithub()`», «publica `Web` (`sw.js` vNNN)» ni
«pega Tampermonkey vN». Esos requisitos dejan de ser ciertos en cuanto se
cumplen, y la fila los seguía repitiendo durante meses. La respuesta a «¿hay algo
por subir?» sale de ESTE script, no de lo que diga una fila.

Cómo lo sabe: el Generador deja un commit «Descarga <Proyecto>» cada vez que
`descargar…()` escribe en GitHub lo que hay en Apps Script. Si ese commit es
posterior a un cambio de Claude y no lo revirtió, Apps Script ya tenía ese
cambio (se subió antes de descargar). Un cambio de Claude en `<Proyecto>/src`
SIN descarga posterior queda «sin confirmar»: puede faltar subirlo o puede estar
subido y no descargado todavía (por ejemplo, el Generador copia datos de Drive
con su activador sin descargarse a sí mismo), así que se confirma con otra
evidencia (un archivo descargado que solo el código nuevo puede producir) o se
pregunta a la usuaria. Tampermonkey se pega a mano en el navegador: git no
prueba qué versión tiene instalada; aquí solo se informa la vigente.
"""
import os
import re
import subprocess
import sys

RAIZ = os.getcwd()
if not os.path.isdir(os.path.join(RAIZ, 'Base', 'src')):
    print('Corre este script desde la raíz del repo Backend.')
    sys.exit(2)

GENERADOR_AUTOR = 'grupoternaoficial'
CLAUDE_AUTOR = 'noreply@anthropic.com'
PROYECTOS = ['Base', 'Generador', 'Contactos_Secundario']


def git(*args):
    r = subprocess.run(['git', *args], cwd=RAIZ, capture_output=True, text=True)
    return r.stdout.strip()


if git('rev-parse', '--is-shallow-repository') == 'true':
    print('AVISO: el clon es superficial; corre «git fetch --unshallow» o el resultado puede ser incorrecto.')

sin_confirmar = 0
for p in PROYECTOS:
    # Último commit del Generador (descarga) que menciona el proyecto en su mensaje.
    linea = git('log', '-1', f'--author={GENERADOR_AUTOR}', f'--grep=^Descarga {p}\\b',
                '--format=%H|%h|%s', '--', p)
    if not linea:
        print(f'{p}: no hay ninguna «Descarga {p}» en el historial; no se puede calcular.')
        continue
    completo, corto, asunto = linea.split('|', 2)
    pend = git('log', f'{completo}..HEAD', f'--author={CLAUDE_AUTOR}',
               '--format=%h %s', '--', f'{p}/src')
    cambios = [l for l in pend.split('\n') if l]
    # ¿La descarga cambió algún .gs? Si no, Apps Script era igual a GitHub en ese momento.
    toco = git('show', '--stat', '--format=', completo, '--', f'{p}/src')
    estado_desc = ('cambió archivos de src (Apps Script difería de GitHub)' if toco
                   else 'no cambió ningún .gs de src (Apps Script era igual a GitHub)')
    print(f'{p}: última descarga {corto} — {asunto[:70]}')
    print(f'    {estado_desc}')
    if cambios:
        sin_confirmar += len(cambios)
        print(f'    SIN CONFIRMAR: {len(cambios)} cambio(s) de Claude en {p}/src sin descarga posterior:')
        for c in cambios[:8]:
            print(f'      - {c[:110]}')
        if len(cambios) > 8:
            print(f'      … y {len(cambios) - 8} más')
    else:
        print(f'    AL DÍA: ningún cambio de Claude en {p}/src posterior a esa descarga.')

# Tampermonkey: solo se informa la versión vigente (se pega a mano).
tm = os.path.join(RAIZ, 'Tampermonkey', 'Tampermonkey.md')
if os.path.exists(tm):
    m = re.search(r'@version\s+([\d.]+)', open(tm, encoding='utf-8').read())
    print(f'Tampermonkey: versión vigente en el repo {m.group(1) if m else "?"} '
          '(se pega a mano; git no prueba cuál tiene instalada la usuaria).')

# Web: se publica al subir a main (GitHub Pages); se informa la versión de sw.js.
web = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(RAIZ), 'Web')
sw = os.path.join(web, 'sw.js')
if os.path.exists(sw):
    m = re.search(r"CACHE_NAME\s*=\s*'[^']*?-v(\d+)'", open(sw, encoding='utf-8').read())
    print(f'Web: se publica al subir a main; sw.js vigente v{m.group(1) if m else "?"}.')

print()
print('Lectura: un requisito de subir o publicar solo está pendiente si aparece SIN CONFIRMAR aquí '
      'y no hay otra evidencia de que ya corre. Lo que una fila de Pendientes.md diga sobre subir, '
      'publicar o pegar una versión concreta es historial y se ignora.')
sys.exit(0)
