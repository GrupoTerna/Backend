#!/usr/bin/env python3
"""Tanda 3 (PF120 punto 13), SOLO LECTURA: reclasifica las filas de cruce_json_domingo_conflictos.csv.
Clases (regla propia de Claude, no confirmada por la usuaria):
  B  solo sistema, todo en ceros (sin actividad).
  C  solo sistema, con actividad, un solo clan esa semana.
  D  el jugador tiene filas en mas de un clan esa semana (la comparacion por clan no sirve).
  E  un solo clan, sistema menor que el JSON: faltan filas o el acumulado esta mal; el JSON da el valor.
  F  solo JSON con actividad, un solo clan, y el sistema no tiene fila del jugador en ese clan.
  G  sistema mayor que no cabe.
Escribe conflictos_clasificados.csv junto a este archivo. No modifica nada."""
import csv, os, collections
AQUI = os.path.dirname(os.path.abspath(__file__))
HOJ = os.path.join(AQUI, '..', 'Hojas', 'Backup_Guerra.csv')
N = lambda v: int(float(v)) if v not in ('', None) else 0
clanes = collections.defaultdict(set); dias = collections.defaultdict(list)
for x in csv.DictReader(open(HOJ, encoding='utf-8-sig')):
    if x['Etapa'] != 'Guerra': continue
    clanes[(x['Temporada'], x['Semana'], x['Tag'])].add(x['Clan'])
    dias[(x['Temporada'], x['Semana'], x['Clan'], x['Tag'])].append((x['Día'], N(x['AtaquesSemana']), N(x['Fame'])))
rows = list(csv.DictReader(open(os.path.join(AQUI, 'cruce_json_domingo_conflictos.csv'), encoding='utf-8-sig')))
out = []; tot = collections.Counter()
for r in rows:
    k = (r['T'], r['S'], r['tag']); varios = len(clanes[k]) > 1
    if r['caso'] == 'sistema mayor, no cabe': c = 'G'
    elif varios: c = 'D'
    elif r['caso'] == 'solo sistema':
        c = 'B' if N(r['sis_ataques']) == 0 and N(r['sis_fame']) == 0 else 'C'
    elif r['caso'] == 'sistema menor que el JSON': c = 'E'
    else: c = 'F'
    tot[c] += 1
    r['clase'] = c; r['clanes_en_la_semana'] = ' | '.join(sorted(clanes[k]))
    ds = sorted(dias.get((r['T'], r['S'], r['clan'], r['tag']), []), key=lambda d: 'JVSD'.index(d[0]) if d[0] in 'JVSD' else 9)
    r['dias_sistema'] = ' '.join('%s:%d/%d' % d for d in ds)  # dia:AtaquesSemana/Fame
    r['ultimo_dia_sistema'] = ds[-1][0] if ds else ''
    sem = [kk[1] for kk in dias if dias[kk] and kk[0] == r['T'] and kk[2] == r['clan'] and kk[3] == r['tag']]
    r['semanas_del_jugador_en_ese_clan_en_la_temporada'] = ','.join(sorted(set(sem), key=int))
    out.append(r)
with open(os.path.join(AQUI, 'conflictos_clasificados.csv'), 'w', newline='', encoding='utf-8') as fh:
    w = csv.DictWriter(fh, fieldnames=list(out[0].keys())); w.writeheader(); w.writerows(out)
for c, n in sorted(tot.items()): print(c, n)
print('total', sum(tot.values()))
