#!/usr/bin/env python3
"""Verifica la integridad de Contexto_Base_Web.md y Contexto_Base_Web_Detalle.md.

Uso (desde la raíz del repo Backend):  python3 "Consolidados de cambios/verificar_contexto.py"
Regla completa: Consolidados de cambios/Reglas_Consolidados.md, sección 9.
Sale con código 1 si algo falla. No modifica nada.
"""
import glob, os, re, sys

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PRINCIPAL = 'Contexto_Base_Web.md'
DETALLE = 'Contexto_Base_Web_Detalle.md'


def leer(nombre):
    ruta = os.path.join(RAIZ, nombre)
    return open(ruta, encoding='utf-8').read().split('\n') if os.path.exists(ruta) else None


L = {PRINCIPAL: leer(PRINCIPAL), DETALLE: leer(DETALLE)}
errores = []

# 1) Mapa de bloques por .gs (tabla de la sección «Mapa de bloques por .gs»)
mapa = {}
for l in L[PRINCIPAL]:
    m = re.match(r'^\| `(\d\d)_([^`]+\.gs)` \| `(Contexto_Base_Web(?:_Detalle)?\.md)` \|', l)
    if m:
        mapa[m.group(1)] = (m.group(1) + '_' + m.group(2), m.group(3))
if not mapa:
    errores.append('No se encontró la tabla «Mapa de bloques por .gs» en ' + PRINCIPAL)


def donde_esta_bloque(prefijo, nombre):
    """Archivos donde aparece el encabezado del bloque de ese .gs."""
    hallado = []
    for arch, lineas in L.items():
        if lineas is None:
            continue
        for l in lineas:
            if prefijo == '00':
                ok = l.startswith('## 00_Main.gs — resumen rápido')
            else:
                ok = l == '# Archivo ' + nombre
            if ok:
                hallado.append(arch)
    return hallado


for prefijo, (nombre, arch) in sorted(mapa.items()):
    h = donde_esta_bloque(prefijo, nombre)
    if h != [arch]:
        errores.append(f'{nombre}: el mapa dice «{arch}» pero el bloque está en {h or "ningún archivo"}')

# 2) IDs de bloque: únicos entre los dos archivos y en el archivo que dice el mapa
ID = re.compile(r'^#{2,6} \[?(\d{0,2}B\d{3}[A-Z]?)\b')
vistos = {}
for arch, lineas in L.items():
    if lineas is None:
        continue
    for l in lineas:
        m = ID.match(l)
        if not m:
            continue
        bid = m.group(1)
        if bid in vistos:
            errores.append(f'ID repetido {bid} ({vistos[bid]} y {arch})')
        vistos[bid] = arch
        pref = bid[:2] if bid[0].isdigit() else '00'
        if pref in mapa and mapa[pref][1] != arch:
            errores.append(f'{bid} está en {arch} pero su .gs ({mapa[pref][0]}) está en {mapa[pref][1]}')

# 3) Las secciones PF viven solo en el archivo principal
if L[DETALLE] is not None:
    for l in L[DETALLE]:
        if re.match(r'^### PF\d+', l):
            errores.append('Sección PF dentro del archivo de detalle: ' + l[:70])

# 4) Referencias «[→ Contexto_Base_Web.md §…]» de los .gs: cada una debe resolver
pf = {m.group(1) for l in L[PRINCIPAL] for m in [re.match(r'^### (PF\d+)', l)] if m}
sin_resolver = []
total = 0
for f in glob.glob(os.path.join(RAIZ, '**', '*.gs'), recursive=True):
    try:
        s = open(f, encoding='utf-8').read()
    except Exception:
        continue
    for m in re.finditer(r'\[→ Contexto_Base_Web\.md ([^\]]+)\]', s):
        for t in re.findall(r'§(\w+)', m.group(1)):
            total += 1
            if t.startswith('PF'):
                if t not in pf:
                    sin_resolver.append((os.path.relpath(f, RAIZ), t))
            elif t not in vistos:
                sin_resolver.append((os.path.relpath(f, RAIZ), t))
conocidas = {'37B262C'}  # ya sin resolver al empezar la separación (17-oct-2026)
nuevas = [x for x in sin_resolver if x[1] not in conocidas]
for f, t in nuevas:
    errores.append(f'Referencia sin resolver: §{t} en {f}')

print(f'{len(mapa)} .gs en el mapa, {len(vistos)} IDs de bloque, {len(pf)} secciones PF, '
      f'{total} referencias de los .gs ({len(sin_resolver) - len(nuevas)} ya conocida sin resolver).')
if errores:
    print('\n'.join(errores[:40]))
    if len(errores) > 40:
        print(f'… y {len(errores) - 40} más')
    sys.exit(1)
print('OK: archivo principal y archivo de detalle coherentes.')
