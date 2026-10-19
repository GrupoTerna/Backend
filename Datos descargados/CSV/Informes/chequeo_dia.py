# Chequeo de un día (SOLO LECTURA): ¿la diferencia diaria de (medallas, ataques, barcos) de cada jugador cae en una clave de Diario_C?
# Uso: python3 chequeo_dia.py <Backup_Guerra.csv> <Diario_C.csv> <Temporada> <Semana>
import csv, sys, collections
bk, dcf, T, S = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
dc = {r['ID']: int(r['Variantes']) for r in csv.DictReader(open(dcf, encoding='utf-8-sig'))}
def clave(m, a, b): return 'M_%03d_A_%d_B_%d' % (m, a, b)
filas = [x for x in csv.DictReader(open(bk, encoding='utf-8-sig')) if x['Temporada'] == T and x['Semana'] == S and x['Etapa'] == 'Guerra']
ent = lambda v: int(float(v)) if v not in ('', None) else 0
# serie por (jugador, clan): una fila por PeriodIndex (la de mayor Fecha textual si hay varias; se avisa)
ser = collections.defaultdict(dict); dup = 0
for x in filas:
    k = (x['Tag'], x['Clan']); pi = int(x['PeriodIndex'])
    if pi in ser[k]: dup += 1
    ser[k][pi] = x
print('filas de guerra:', len(filas), '| repetidas por (jugador, clan, día):', dup, '| series:', len(ser))
# ¿Fame y Barcos son acumulados de la semana? (no bajan dentro de una serie)
bajan = sum(1 for d in ser.values() for a, b in zip(sorted(d)[:-1], sorted(d)[1:]) if ent(d[b]['Fame']) < ent(d[a]['Fame']))
bajanB = sum(1 for d in ser.values() for a, b in zip(sorted(d)[:-1], sorted(d)[1:]) if ent(d[b]['Barcos']) < ent(d[a]['Barcos']))
print('series donde Fame baja de un día al siguiente:', bajan, '| donde Barcos baja:', bajanB)
dia = collections.defaultdict(lambda: [0, 0, 0, 0])  # (tag, pi) -> medallas, ataques, barcos, filas
for (tag, clan), d in ser.items():
    prev = None
    for pi in sorted(d):
        x = d[pi]; f, b = ent(x['Fame']), ent(x['Barcos'])
        df = f - (ent(d[prev]['Fame']) if prev else 0); db = b - (ent(d[prev]['Barcos']) if prev else 0)
        t = dia[(tag, pi)]; t[0] += df; t[1] += ent(x['AtaquesHoy']); t[2] += db; t[3] += 1; prev = pi
res = collections.defaultdict(collections.Counter); malos = []
for (tag, pi), (m, a, b, n) in sorted(dia.items()):
    if a == 0 and m == 0 and b == 0: est = 'sin ataques'
    else:
        k = clave(m, a, b)
        est = 'no existe' if k not in dc else ('unica' if dc[k] == 1 else 'ambigua(%d)' % dc[k])
        if est == 'no existe': malos.append((tag, pi, m, a, b))
    res[pi][est] += 1
for pi in sorted(res): print('PI', pi, dict(res[pi]))
tot = collections.Counter(); [tot.update(c) for c in res.values()]
print('TOTAL', dict(tot))
import json; json.dump(malos, open('/home/claude/chequeo_malos.json', 'w'))
