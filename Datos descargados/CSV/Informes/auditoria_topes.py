#!/usr/bin/env python3
"""Auditoria de SOLO LECTURA de Backup_Guerra.csv contra los cuatro topes de un jugador
(dichos por la usuaria el 13 y el 18-oct-2026; Contexto_Base_Web.md PF119/PF120):
  4 ataques por dia, 16 por semana, 900 medallas por dia, 3600 por semana,
sumando todos los clanes del jugador (Tag) en la misma semana de guerra.
No modifica nada. Uso: python3 auditoria_topes.py  (escribe auditoria_topes_detalle.csv aqui).
Solo mira filas con Etapa = Guerra. Fame y AtaquesSemana son acumulados de la semana POR CLAN."""
import csv, os, collections
AQUI = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(AQUI, '..', 'Hojas', 'Backup_Guerra.csv')
OFF = {'J': 0, 'V': 1, 'S': 2, 'D': 3}
N = lambda v: int(float(v)) if v not in ('', None) else 0

filas = [x for x in csv.DictReader(open(SRC, encoding='utf-8')) if x['Etapa'] == 'Guerra' and x['Día'] in OFF]
sem = collections.defaultdict(lambda: collections.defaultdict(dict))  # (T,S) -> (tag) -> (clan) -> {off: fila}
for x in filas:
    sem[(x['Temporada'], x['Semana'])][x['Tag']].setdefault(x['Clan'], {})[OFF[x['Día']]] = x

det = []
def add(t, s, tag, nom, clanes, dia, valor, tope, nota):
    det.append(dict(tope=t, temporada=s[0], semana=s[1], tag=tag, nombre=nom, clanes=clanes, dia=dia, valor=valor, tope_valor=tope, nota=nota))

for s, jug in sem.items():
    for tag, cl in jug.items():
        nom = next(iter(next(iter(cl.values())).values()))['Nombre']
        cs = ' + '.join(sorted(cl))
        # 1) ataques por dia (AtaquesHoy guardado), sumando clanes
        for o in range(4):
            tot = sum(N(d[o]['AtaquesHoy']) for d in cl.values() if o in d)
            if tot > 4: add('ataques_dia', s, tag, nom, cs, 'JVSD'[o], tot, 4, 'suma de AtaquesHoy de los clanes')
        # 2) ataques por semana: ultimo acumulado de cada clan, sumados
        sa = sum(N(d[max(d)]['AtaquesSemana']) for d in cl.values())
        if sa > 16: add('ataques_semana', s, tag, nom, cs, '', sa, 16, 'suma del ultimo AtaquesSemana de cada clan')
        # 3) fame por dia: delta del acumulado de cada clan; si el delta abarca varios dias, el tope es 900 x dias
        por_dia = collections.defaultdict(int); dias_unicos = collections.defaultdict(int)
        for c, d in cl.items():
            prev = 0; po = -1
            for o in sorted(d):
                f = N(d[o]['Fame']); delta = f - prev; span = o - po
                if delta > 900 * span:
                    add('fame_dia_clan', s, tag, nom, c, 'JVSD'[o], delta, 900 * span, 'delta del acumulado de un solo clan (abarca %d dia/s)' % span)
                if delta < 0:
                    add('fame_baja', s, tag, nom, c, 'JVSD'[o], delta, 0, 'el acumulado de fame baja')
                if span == 1: por_dia[o] += delta
                prev, po = f, o
        for o, v in por_dia.items():
            if v > 900 and len(cl) > 1: add('fame_dia_suma_clanes', s, tag, nom, cs, 'JVSD'[o], v, 900, 'suma de varios clanes, deltas de 1 dia')
        # 4) fame por semana: ultimo acumulado de cada clan, sumados
        sf = sum(N(d[max(d)]['Fame']) for d in cl.values())
        if sf > 3600: add('fame_semana', s, tag, nom, cs, '', sf, 3600, 'suma del ultimo Fame de cada clan')

campos = ['tope', 'temporada', 'semana', 'tag', 'nombre', 'clanes', 'dia', 'valor', 'tope_valor', 'nota']
det.sort(key=lambda r: (r['tope'], int(r['temporada']), int(r['semana']), r['tag'], r['dia']))
with open(os.path.join(AQUI, 'auditoria_topes_detalle.csv'), 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, campos); w.writeheader(); w.writerows(det)

print('filas de guerra:', len(filas), '| jugador-semana:', sum(len(j) for j in sem.values()))
res = collections.Counter((r['tope'], r['temporada']) for r in det)
for t in ['ataques_dia', 'ataques_semana', 'fame_dia_clan', 'fame_dia_suma_clanes', 'fame_semana', 'fame_baja']:
    por_t = {k[1]: v for k, v in res.items() if k[0] == t}
    print('%-22s total %4d  por temporada %s' % (t, sum(por_t.values()), dict(sorted(por_t.items()))))
