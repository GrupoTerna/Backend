#!/usr/bin/env python3
"""Verifica Pendientes.md antes del commit (desde la raíz del repo Backend):
    python3 -I "Consolidados de cambios/verificar_pendientes.py"

ERRORES (código de salida 1): fila de pendiente cortada con «…», filas ya
resueltas (tachadas, «[x]» o «Resuelto»), filas repetidas, grupos del resumen
que no coinciden con las secciones.
AVISOS (se miran a mano): `PFnnn` citado que no tiene sección en
Contexto_Base_Web.md (puede ser una fila sin PF, como «Torneos / sesión»); filas
que repiten un requisito de subir o publicar («corre `subirBaseDesdeGithub()`»,
«`sw.js` vNNN», «pega Tampermonkey vN»), que se vence al cumplirse y debe leerse
con `estado_subidas.py`; un mismo `PFnnn` dentro de un grupo en dos filas.
"""
import re, sys, os

RAIZ = os.getcwd()
P = os.path.join(RAIZ, 'Pendientes.md')
C = os.path.join(RAIZ, 'Contexto_Base_Web.md')
if not (os.path.exists(P) and os.path.exists(C)):
    print('Corre este script desde la raíz del repo Backend.'); sys.exit(2)

lineas = open(P, encoding='utf-8').read().split('\n')
ctx = open(C, encoding='utf-8').read()
secciones = set(re.findall(r'^### (PF\d+)\b', ctx, re.M))
errores, avisos = [], []

filas, vistas = [], {}
for i, l in enumerate(lineas, 1):
    if re.match(r'^- \[[ xX]\]', l):
        filas.append((i, l))
for i, l in filas:
    if l.startswith('- [x]') or l.startswith('- [X]'):
        errores.append(f'{i}: fila marcada como hecha; se borra, no se deja marcada')
    if re.search(r'~~.+~~', l) and re.search(r'`PF\d+', l):
        avisos.append(f'{i}: tiene texto tachado; si ya se resolvió esa parte, se quita en vez de tacharla')
    if re.search(r'\bResuelto\b', l, re.I) and not re.search(r'(decidid|resuelt[oa]s? (el|en)|ya está resuelto)', l, re.I):
        avisos.append(f'{i}: dice «Resuelto»; las filas resueltas no se dejan en la lista')
    fin = l.rstrip()
    if fin.endswith('…') or fin.endswith('...'):
        errores.append(f'{i}: la fila está cortada con «…» (recupera el original con git show <sha>:Contexto_Base_Web.md o su §PF)')
    if l in vistas:
        errores.append(f'{i}: fila idéntica a la {vistas[l]}')
    vistas.setdefault(l, i)
    for pf in set(re.findall(r'PF(\d+)', l)):
        if f'PF{pf}' not in secciones:
            avisos.append(f'{i}: PF{pf} no tiene sección «### PF{pf}» en Contexto_Base_Web.md')

# Requisitos de subir/publicar copiados en las filas (se vencen al cumplirse).
REQ = re.compile(r'`(?:subirBase|subirGenerador|subirContactos)DesdeGithub\(\)`'
                 r'|`sw\.js`\)? v\d+|Tampermonkey(?:\.md)? v\d+\.\d+')
con_req = [i for i, l in filas if REQ.search(l)]
if con_req:
    avisos.append(f'{len(con_req)} fila(s) repiten un requisito de subir o publicar que ya se venció o se vencerá '
                  f'(líneas {", ".join(map(str, con_req[:12]))}{"…" if len(con_req) > 12 else ""}): '
                  'las filas dicen solo lo que falta probar; lo que hay por subir sale de '
                  '«python3 -I \'Consolidados de cambios/estado_subidas.py\'». Al tocar una fila, se le quita.')

# Un mismo PFnnn en dos filas del mismo grupo (suelen ser filas duplicadas no idénticas).
g_actual, por_grupo = None, {}
for i, l in enumerate(lineas, 1):
    m = re.match(r'^## ([A-E])\.', l)
    if m: g_actual = m.group(1)
    if g_actual and re.match(r'^- \[[ xX]\]', l):
        pf1 = re.match(r'^- \[[ xX]\] `?(PF\d+)`?', l)
        if pf1:
            por_grupo.setdefault((g_actual, pf1.group(1)), []).append(i)
for (g, pf), ls in sorted(por_grupo.items()):
    if len(ls) > 1:
        avisos.append(f'{pf} abre {len(ls)} filas en el grupo {g} (líneas {", ".join(map(str, ls))}); '
                      'si son partes del mismo ítem, se unen en una fila')

# Grupos del resumen contra las secciones «## X.»
resumen = set(re.findall(r'^\| \*\*([A-E])\*\* \|', '\n'.join(lineas), re.M))
cabeceras = set(re.findall(r'^## ([A-E])\.', '\n'.join(lineas), re.M))
if resumen != cabeceras:
    errores.append(f'el resumen lista {sorted(resumen)} y las secciones son {sorted(cabeceras)}')

cuenta = {}
grupo = None
for l in lineas:
    m = re.match(r'^## ([A-E])\.', l)
    if m: grupo = m.group(1)
    if grupo and re.match(r'^- \[ \]', l):
        cuenta[grupo] = cuenta.get(grupo, 0) + 1
print('Filas abiertas por grupo:', ', '.join(f'{g}={n}' for g, n in sorted(cuenta.items())) or 'ninguna')
for a in avisos: print('AVISO ', a)
for e in errores: print('ERROR ', e)
if errores:
    sys.exit(1)
print('OK: Pendientes.md sin filas cortadas, resueltas ni repetidas.' + (f' ({len(avisos)} aviso(s) para mirar a mano)' if avisos else ''))
