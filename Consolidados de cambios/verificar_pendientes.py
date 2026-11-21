#!/usr/bin/env python3
"""Verifica Pendientes.md antes del commit (desde la raíz del repo Backend):
    python3 -I "Consolidados de cambios/verificar_pendientes.py"

ERRORES (código de salida 1): fila de pendiente cortada con «…», filas ya
resueltas (tachadas, «[x]» o «Resuelto»), filas repetidas, grupos del resumen
que no coinciden con las secciones.
AVISOS (se miran a mano): `PFnnn` citado que no tiene sección en
Contexto_Base_Web.md (puede ser una fila sin PF, como «Torneos / sesión»).
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
