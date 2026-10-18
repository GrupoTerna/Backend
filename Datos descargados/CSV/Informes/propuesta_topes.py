#!/usr/bin/env python3
"""PROPUESTA de solo lectura: repartir de domingo a jueves las semanas con anomalias de topes.
Regla dictada por la usuaria el 18-oct-2026 (Contexto_Base_Web.md PF119 punto 3 y PF120 punto 6).
No modifica Backup_Guerra.csv. Escribe propuesta_topes.csv y propuesta_topes_resumen.csv aqui.

Por cada jugador y semana que aparece en auditoria_topes_detalle.csv (ataques_dia, fame_dia_clan,
ataques_semana):
 - Se fijan los TOTALES de la semana: ultimo AtaquesSemana, Barcos y Fame acumulados de la fila mas reciente.
 - Dias a repartir: los 4 (jueves a domingo) en semanas terminadas, aunque falten filas; solo la semana
   mas reciente del archivo llega hasta su ultimo dia con fila.
 - Cada dia es un estado (n ataques, b barcos, f medallas) valido segun la tabla de fame de
   18_CorreccionGuerra.gs (_fameDescomposicionesDia_): n<=4, b<=n, barco 75/125, normal 100/200,
   duelo 2-0=500, 0-2=200, 2-1=600, 1-2=450 (maximo un duelo por dia).
 - (Version del 18-oct-2026) se conservan las filas cuyos acumulados caben en las tablas (puntos de control) y se
   reparte de domingo a jueves solo dentro de los tramos imposibles; ver codigo (programacion dinamica).
 - Si hay UNA sola solucion -> 'determinado'. Si hay varias -> 'regla domingo a jueves': se llena el
   domingo con el maximo (ataques, luego barcos, luego medallas) que deje el resto factible, y se
   retrocede. Si no hay ninguna -> 'revision' (no se toca). Varios clanes en la semana -> 'revision'.
"""
import csv, os, collections, itertools
AQUI = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(AQUI, '..', 'Backup_Guerra.csv')
OFF = {'J': 0, 'V': 1, 'S': 2, 'D': 3}; LET = 'JVSD'
N = lambda v: int(float(v)) if v not in ('', None) else 0
PG, PP, BG, BP = 200, 100, 125, 75
DUELOS = [(2, 200), (2, 500), (3, 450), (3, 600)]

def tabla(n, b):
    op = [(0, 0)] + [(m, f) for m, f in DUELOS if b + m <= n]
    s = set()
    for m, f in op:
        pvp = n - b - m
        if pvp < 0: continue
        for bg in range(b + 1):
            for pg in range(pvp + 1):
                s.add(bg * BG + (b - bg) * BP + pg * PG + (pvp - pg) * PP + f)
    return sorted(s)

ESTADOS = [(n, b, f) for n in range(5) for b in range(n + 1) for f in tabla(n, b)]
# k dias -> {(A,B,F): cantidad de formas}
cuenta = [collections.Counter({(0, 0, 0): 1})]
for k in range(1, 5):
    c = collections.Counter()
    for (A, B, F), v in cuenta[-1].items():
        for (n, b, f) in ESTADOS: c[(A + n, B + b, F + f)] += v
    cuenta.append(c)

def repartir(total, dias):
    A, B, F = total
    ways = cuenta[dias].get((A, B, F), 0)
    if ways == 0: return 'revision', 'ninguna combinacion de la tabla suma esos totales', None
    sol = []; rem = (A, B, F)
    for d in range(dias - 1, -1, -1):          # domingo hacia jueves
        for (n, b, f) in sorted(ESTADOS, reverse=True):
            r = (rem[0] - n, rem[1] - b, rem[2] - f)
            if r[0] >= 0 and r[1] >= 0 and r[2] >= 0 and cuenta[d].get(r, 0) > 0:
                sol.append((d, n, b, f)); rem = r; break
    sol.sort()
    return ('determinado' if ways == 1 else 'regla domingo a jueves'), '%d combinaciones posibles' % ways, sol

det = list(csv.DictReader(open(os.path.join(AQUI, 'auditoria_topes_detalle.csv'), encoding='utf-8')))
claves = {(r['temporada'], r['semana'], r['tag']) for r in det if r['tope'] in ('ataques_dia', 'fame_dia_clan', 'ataques_semana')}
sem = collections.defaultdict(lambda: collections.defaultdict(dict))
for x in csv.DictReader(open(SRC, encoding='utf-8')):
    if x['Etapa'] == 'Guerra' and x['Día'] in OFF:
        sem[(x['Temporada'], x['Semana'], x['Tag'])][x['Clan']][OFF[x['Día']]] = x

SEM_ACTUAL = max(((t, s_) for (t, s_, _) in sem), key=lambda x: (int(x[0]), int(x[1])))
salida = []; resumen = collections.Counter(); cambia_sin_anomalia = 0
for k in sorted(claves, key=lambda t: (int(t[0]), int(t[1]), t[2])):
    cl = sem[k]; nom = next(iter(next(iter(cl.values())).values()))['Nombre']
    if len(cl) > 1:
        resumen[('revision', 'varios clanes en la semana')] += 1
        salida.append([k[0], k[1], k[2], nom, ' + '.join(sorted(cl)), 'revision', 'varios clanes en la semana: no se toca', '', '', '', '', '', '', '', '', ''])
        continue
    clan, dias = next(iter(cl.items()))
    ult = dias[max(dias)]
    total = (N(ult['AtaquesSemana']), N(ult['Barcos']), N(ult['Fame']))
    maxoff = max(dias)
    bajan = False and any(N(dias[b]['Fame']) < N(dias[a]['Fame']) or N(dias[b]['Barcos']) < N(dias[a]['Barcos']) or N(dias[b]['AtaquesSemana']) < N(dias[a]['AtaquesSemana'])
                for a, b in zip(sorted(dias), sorted(dias)[1:]))
    terminada = (k[0], k[1]) != SEM_ACTUAL
    offs = sorted(dias)
    # Version "conservar tramos buenos" (decidida por la usuaria el 18-oct-2026): cada fila es un punto de control
    # posible. Se eligen los puntos de control que se conservan (los que dejan tramos posibles segun las tablas) y se
    # reparte de domingo a jueves SOLO dentro de los tramos imposibles de respetar. Se conserva la mayor cantidad
    # posible de filas; el total de la semana (ultima fila) queda fijo.
    def tramo_ok(a, b):
        (oa, va), (ob, vb) = a, b
        nd = ob - oa; delta = tuple(x - y for x, y in zip(vb, va))
        if nd <= 0 or min(delta) < 0: return None
        t_, m_, sol_ = repartir(delta, nd)
        return None if t_ == 'revision' else (t_, sol_)
    ini_ = (-1, (0, 0, 0))
    def planear(fin_off):
        """Puntos de control = filas existentes (menos la ultima) + el total de la semana en fin_off.
        Devuelve (cps, mejor): mejor[i] = (filas conservadas hasta i, indice anterior) o None."""
        cps = [(o, (N(dias[o]['AtaquesSemana']), N(dias[o]['Barcos']), N(dias[o]['Fame']))) for o in offs[:-1]]
        cps.append((fin_off, total))
        mejor = [None] * len(cps)
        for i, cp in enumerate(cps):
            cand = []
            if tramo_ok(ini_, cp): cand.append((0, -1))
            for j in range(i):
                if mejor[j] is not None and tramo_ok(cps[j], cp): cand.append((mejor[j][0] + 1, j))
            mejor[i] = max(cand) if cand else None
        return cps, mejor
    cps, mejor = planear(maxoff)                  # primero con la ultima fila en su dia real
    coherente = mejor[-1] is not None and mejor[-1][0] == len(cps) - 1
    if terminada and maxoff < 3:
        if coherente:
            cps = None; tipo = 'revision'; sol = None
            motivo = 'faltan las filas finales de una semana terminada y los acumulados existentes son coherentes: no se sabe si el total ya esta completo'
        else:
            cps, mejor = planear(3)               # el total de la semana se reparte hasta el domingo
    if cps is not None and mejor[-1] is None:
        tipo = 'revision'; sol = None; motivo = 'ninguna combinacion de la tabla suma el total de la semana'
    elif cps is not None:
        cadena = []; i = len(cps) - 1
        while i != -1: cadena.append(i); i = mejor[i][1]
        cadena.reverse(); conserv = [cps[i][0] for i in cadena[:-1]]
        sol = []; prev = ini_
        for i in cadena:
            cur = cps[i]; nd = cur[0] - prev[0]
            delta = tuple(x - y for x, y in zip(cur[1], prev[1]))
            t_, m_, sol_ = repartir(delta, nd)
            sol += [(prev[0] + 1 + d, n, bb, ff) for (d, n, bb, ff) in sol_]
            prev = cur
        sol.sort()
        quedan = len(cps) - 1 - len(conserv)
        tipo = 'conserva tramos buenos' if conserv else 'semana entera domingo a jueves'
        motivo = '%d de %d filas con acumulados conservados como puntos de control; %d fila/s imposible/s repartidas dentro de su tramo' % (len(conserv), len(cps) - 1, quedan)
    resumen[(tipo, '')] += 1
    if sol is None:
        salida.append([k[0], k[1], k[2], nom, clan, tipo, motivo, '', '', '', '', '', '', '', '', '']); continue
    a = b = f = 0
    for (d, n, bb, ff) in sol:
        a += n; b += bb; f += ff
        antes = dias.get(d)
        ant = (N(antes['AtaquesHoy']), N(antes['AtaquesSemana']), N(antes['Barcos']), N(antes['Fame'])) if antes else ('', '', '', '')
        nuevo = (n, a, b, f)
        est = 'fila nueva' if antes is None else ('igual' if tuple(ant) == nuevo else 'cambia')
        salida.append([k[0], k[1], k[2], nom, clan, tipo, motivo, LET[d], *ant, *nuevo, est])
        resumen[('dia ' + est, '')] += 1

enc = ['temporada', 'semana', 'tag', 'nombre', 'clan', 'tipo', 'motivo', 'dia', 'antes_AtaquesHoy', 'antes_AtaquesSemana', 'antes_Barcos', 'antes_Fame',
       'despues_AtaquesHoy', 'despues_AtaquesSemana', 'despues_Barcos', 'despues_Fame', 'estado_del_dia']
# (columnas: antes_* en orden AtaquesHoy, AtaquesSemana, Barcos, Fame)
with open(os.path.join(AQUI, 'propuesta_topes.csv'), 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh); w.writerow(enc)
    for r in salida: w.writerow((r + [''] * len(enc))[:len(enc)])
print('jugador-semana con anomalia:', len(claves))
for (t, m), v in sorted(resumen.items()): print('%-24s %s %5d' % (t, m, v))
