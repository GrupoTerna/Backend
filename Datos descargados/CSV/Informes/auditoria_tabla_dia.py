#!/usr/bin/env python3
"""Auditoria de solo lectura (18-oct-2026, PF120 punto 13): para cada dia J, V, S y D de CSV/Hojas/Backup_Guerra.csv comprueba
si (ataques del dia, barcos del dia, fame del dia) encaja con la tabla de _fameDescomposicionesDia_ (18_CorreccionGuerra.gs).
Ataques del dia = AtaquesHoy; barcos y fame del dia = diferencia del acumulado con el dia anterior. No modifica nada.
Limite: solo mide dias con dia previo; AtaquesHoy es el valor de la ultima captura de ese dia."""
import csv, collections, os
AQUI = os.path.dirname(os.path.abspath(__file__)); CSV = os.path.join(AQUI, '..', 'Hojas', 'Backup_Guerra.csv')
BG, BP, PG, PP = 125, 75, 200, 100
DU = [(2, 200), (2, 500), (3, 450), (3, 600)]
def tabla(n, b):
    s = set()
    if n < 0 or n > 4 or b < 0 or b > n: return s
    for m, f in [(0, 0)] + [(m, f) for m, f in DU if b + m <= n]:
        pvp = n - b - m
        for bg in range(b + 1):
            for pg in range(pvp + 1): s.add(bg*BG + (b-bg)*BP + pg*PG + (pvp-pg)*PP + f)
    return s
N = lambda v: int(float(v)) if v not in ('', None) else 0
g = collections.defaultdict(dict)
for x in csv.DictReader(open(CSV, encoding='utf-8-sig')):
    if x['Etapa'] == 'Guerra' and x['Día'] in 'JVSD':
        g[(x['Temporada'], x['Semana'], x['Clan'], x['Tag'])]['JVSD'.index(x['Día'])] = (N(x['AtaquesHoy']), N(x['Fame']), N(x['Barcos']))
tot = collections.Counter()
for k, d in g.items():
    for i in range(4):
        if i not in d: continue
        if i > 0 and (i-1) not in d: tot['sin dia previo (no medido)'] += 1; continue
        prev = d[i-1] if i > 0 else (0, 0, 0); a, f, b = d[i]; df = f - prev[1]; db = b - prev[2]
        if a == 0 and df == 0 and db == 0: tot['dia sin actividad'] += 1; continue
        tot['encaja' if (0 <= db <= a and df in tabla(a, db)) else 'NO encaja'] += 1
for k, v in sorted(tot.items()): print('%-30s %5d' % (k, v))
