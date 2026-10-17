#!/usr/bin/env python3
"""Pasa bloques de .gs de Contexto_Base_Web.md a Contexto_Base_Web_Detalle.md (regla 9.3).

Uso (desde la raíz de Backend):
  python3 "Consolidados de cambios/mover_bloques.py" --parte 2 09_API_ClashRoyale.gs 10_ClanSheet.gs ...

Hace: verificar antes -> copiar tal cual al detalle -> comprobar byte a byte -> borrar del principal ->
cambiar el mapa -> anotar en el registro y en el plan 9.6 -> verificar después.
No usa git. Se niega a mover un bloque que contenga secciones PF (esos casos se hacen a mano).
"""
import argparse, os, re, subprocess, sys

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
P, D = os.path.join(RAIZ, 'Contexto_Base_Web.md'), os.path.join(RAIZ, 'Contexto_Base_Web_Detalle.md')
VERIF = os.path.join(RAIZ, 'Consolidados de cambios', 'verificar_contexto.py')
ID = re.compile(r'^#{2,6} \[?(\d{0,2}B\d{3}[A-Z]?)\b')


def verificar(etapa):
    r = subprocess.run([sys.executable, VERIF], capture_output=True, text=True)
    print(f'[verificación {etapa}]', r.stdout.strip().splitlines()[-1] if r.stdout.strip() else r.stderr[-200:])
    if r.returncode != 0:
        print(r.stdout[-1500:]); sys.exit('Verificación fallida ' + etapa + ': no se continúa.')


ap = argparse.ArgumentParser()
ap.add_argument('--parte', required=True)
ap.add_argument('archivos', nargs='+')
a = ap.parse_args()

verificar('antes')
t = open(P, encoding='utf-8').read()
L = t.split('\n')
H1 = [i for i, l in enumerate(L) if l.startswith('# Archivo ')]
fin_de = {}
for k, i in enumerate(H1):
    fin_de[L[i][len('# Archivo '):]] = (i, H1[k + 1] if k + 1 < len(H1) else len(L))
cuerpos, rangos, ids = [], [], 0
for n in a.archivos:
    if n not in fin_de:
        sys.exit(f'{n}: no está como «# Archivo» en el principal (¿ya movido?)')
    i, j = fin_de[n]
    bl = L[i:j]
    if any(re.match(r'^### PF\d+', l) for l in bl):
        sys.exit(f'{n}: el bloque contiene secciones PF; se mueve a mano (regla 9.1)')
    cuerpos.append('\n'.join(bl))
    rangos.append((i, j))
    ids += sum(1 for l in bl if ID.match(l))
cab = ('# Contexto_Base_Web_Detalle\n\n'
       'Bloques por `.gs` pasados desde `Contexto_Base_Web.md`: el resumen de cada archivo, su «Índice de bloques movidos» y su «Detalle (texto original, sin cambios)». **Es histórico y no se edita** (reglas en `Consolidados de cambios/Reglas_Consolidados.md`, sección 9). Las secciones `PFxxx`, el plan de fases, los abiertos y el mapa que dice en qué archivo está cada bloque están en `Contexto_Base_Web.md`. Un `§NNBxxx` se busca con el prefijo `NN` en «Mapa de bloques por `.gs`». Si algo de aquí contradice una sección PF, manda la PF.\n\n\n')
det = open(D, encoding='utf-8').read() if os.path.exists(D) else cab
if not det.endswith('\n'):
    det += '\n'
base = len(det)
añadido = '\n'.join(cuerpos) + '\n'
open(D, 'w', encoding='utf-8').write(det + añadido)
leido = open(D, encoding='utf-8').read()
assert leido[:base] == det and leido[base:] == añadido, 'copia no idéntica'
for c in cuerpos:
    assert c in leido
for i, j in sorted(rangos, reverse=True):
    del L[i:j]
t2 = '\n'.join(L)
for n in a.archivos:
    f = f'| `{n}` | `Contexto_Base_Web.md` |'
    assert t2.count(f) == 1, 'fila del mapa: ' + n
    t2 = t2.replace(f, f'| `{n}` | `Contexto_Base_Web_Detalle.md` |')
kb = sum(len(c.encode()) for c in cuerpos) // 1000
nota = (f'**Separación en dos archivos (17-oct-2026), parte {a.parte}:** los bloques de {", ".join("`" + n + "`" for n in a.archivos)} '
        f'({ids} IDs de bloque, {kb} KB) pasaron tal cual a `Contexto_Base_Web_Detalle.md` (comprobado byte a byte). ')
anc = '**Conciliación (17-oct-2026):**'
assert t2.count(anc) == 1
t2 = t2.replace(anc, nota + anc, 1)
t2 = re.sub(r'(\| %s \|[^\n]*\| )Pendiente( \|)' % re.escape(a.parte), r'\1**Hecha el 17-oct-2026**\2', t2) if False else t2
open(P, 'w', encoding='utf-8').write(t2)
# plan 9.6 en las reglas
R = os.path.join(RAIZ, 'Consolidados de cambios', 'Reglas_Consolidados.md')
r = open(R, encoding='utf-8').read()
r2 = re.sub(r'(\| %s \| [^\n]*\| )Pendiente( \|)' % re.escape(a.parte), r'\1**Hecha el 17-oct-2026**\2', r)
open(R, 'w', encoding='utf-8').write(r2)
print(f'Parte {a.parte}: {len(a.archivos)} .gs, {ids} IDs, {kb} KB movidos. Principal {len(t2.encode())/1e6:.2f} MB, detalle {len(leido.encode())/1e6:.2f} MB.')
verificar('después')
