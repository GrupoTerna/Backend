#!/usr/bin/env python3
"""Cruce de solo lectura (18-oct-2026, PF120 punto 9): ultima captura de domingo de cada semana-clan de
Datos descargados/JSON (currentriverrace, sin las variantes -L) contra el ultimo dia de Backup_Guerra.csv.
Regla de la usuaria: una captura temprana solo importa si al jugador le quedaban ataques (4 - decksUsedToday).
Se acepta que el sistema sea mayor que el JSON si la diferencia de ataques <= ataques que le quedaban y la
diferencia de fame <= 200 por ataque restante (propuesta de Claude). Sistema menor que el JSON = conflicto.
Escribe cruce_json_domingo_conflictos.csv junto a este archivo. No modifica nada."""
import json, glob, re, csv, collections, os
AQUI = os.path.dirname(os.path.abspath(__file__)); JS = os.path.join(AQUI, '..', '..', 'JSON'); CSV = os.path.join(AQUI, '..', 'Backup_Guerra.csv')
N = lambda v: int(float(v)) if v not in ('', None) else 0
pat = re.compile(r'^T-(\d+)\s+S-(\d+)\s+P\.I-(\d+)(-L)?\s+(\d\d)-(\d\d)-(\d{4}) (\d\d)\.(\d\d) - (.+) - currentriverrace\.json$')
snap = {}
for f in glob.glob(os.path.join(JS, '*currentriverrace.json')):
    m = pat.match(os.path.basename(f))
    if not m or m[4]: continue
    orden = (int(m[3]), m[7], m[6], m[5], m[8], m[9]); k = (str(int(m[1])), str(int(m[2])), m[10])
    if k not in snap or orden > snap[k][0]: snap[k] = (orden, f)
last = {}
for x in csv.DictReader(open(CSV, encoding='utf-8-sig')):
    if x['Etapa'] != 'Guerra' or x['Día'] not in ('J', 'V', 'S', 'D'): continue
    k = (x['Temporada'], x['Semana'], x['Clan'], x['Tag']); o = 'JVSD'.index(x['Día'])
    if k not in last or o > last[k][0]: last[k] = (o, N(x['AtaquesSemana']), N(x['Barcos']), N(x['Fame']), x['Día'])
tot = collections.Counter(); conf = []
for (T, S, nom), (orden, f) in sorted(snap.items(), key=lambda a: (int(a[0][0]), int(a[0][1]), a[0][2])):
    if orden[0] % 7 != 6: tot['captura no es domingo (omitida)'] += 1; continue
    part = {p['tag']: p for p in json.load(open(f, encoding='utf-8'))['clan']['participants']}
    sis = {tag: v for (t, s, c, tag), v in last.items() if (t, s, c) == (T, S, nom)}
    if not sis: tot['sin filas del clan en el sistema'] += 1; continue
    for tag in set(sis) | set(part):
        p = part.get(tag); s = sis.get(tag)
        if p is None: tot['solo sistema'] += 1; conf.append((T, S, nom, tag, 'solo sistema', *s[1:4], '', '', '', '')); continue
        if s is None:
            if p['decksUsed'] or p['fame']: tot['solo JSON con actividad'] += 1; conf.append((T, S, nom, tag, 'solo JSON con actividad', '', '', '', p['decksUsed'], p.get('boatAttacks', 0), p['fame'], ''))
            continue
        _, a, b, fm, dia = s; rest = max(0, 4 - p.get('decksUsedToday', 0)); da = a - p['decksUsed']; df = fm - p['fame']
        if (da, df, b) == (0, 0, p.get('boatAttacks', 0)): c = 'igual'
        elif da < 0 or df < 0: c = 'sistema menor que el JSON'
        elif da <= rest and df <= rest * 200: c = 'sistema mayor, cabe en los ataques que le quedaban'
        else: c = 'sistema mayor, no cabe'
        tot[c] += 1
        if c in ('sistema menor que el JSON', 'sistema mayor, no cabe'):
            conf.append((T, S, nom, tag, c, a, b, fm, p['decksUsed'], p.get('boatAttacks', 0), p['fame'], rest))
with open(os.path.join(AQUI, 'cruce_json_domingo_conflictos.csv'), 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh); w.writerow(['T', 'S', 'clan', 'tag', 'caso', 'sis_ataques', 'sis_barcos', 'sis_fame', 'json_ataques', 'json_barcos', 'json_fame', 'ataques_que_le_quedaban'])
    w.writerows(conf)
for k, v in sorted(tot.items()): print('%-55s %5d' % (k, v))
