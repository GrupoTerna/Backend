#!/usr/bin/env python3
"""Doble exacto (18-oct-2026, PF120 punto 13, tanda 2; SOLO LECTURA).
Para T2 S1 a S4, T3 S1, T4 S1 y T5 S1 compara, por jugador y clan, el ultimo dia de CSV/Hojas/Backup_Guerra.csv
(Etapa Guerra, dias J, V, S, D) con dos referencias independientes:
  (a) la captura de domingo (-D) de JSON/Endpoints/CurrentRiverRace (si el clan no tiene captura de domingo utilizable,
      la mas reciente que no venga toda en ceros; en T5 S1 son Grupo乂Terna™ y Mini乂Ternas™ y es la del sabado, que es
      solo una cota inferior: el sistema puede ser mayor);
  (b) CSV/Tampermonkey/Correcciones_Guerra.csv: la fila SIN ClanTag es el total de RoyaleAPI del jugador en la semana
      (en jugadores que cambian de clan puede traer solo un clan) y las filas CON ClanTag son el valor por clan
      (solo existen en parte de las semanas).
Referencia de cada clan = fila por clan de RoyaleAPI si existe; si no, el JSON de ese clan.
Referencia: la suma de las filas por clan de RoyaleAPI si existen para ese jugador y semana; si no, el total de RoyaleAPI.
El JSON se usa solo como apoyo (es una captura temprana del domingo: el sistema puede ser mayor si le quedaban ataques;
y en T5 S1 de Grupo乂Terna™ y Mini乂Ternas™ es la del sabado).
Casos por jugador-semana:
  'doble conteo': los MISMOS valores (no cero) en 2 o mas clanes del sistema, y quitar una copia deja la referencia exacta.
  'sobrante: fila del clan anterior': la fila de un clan viene en ceros en el JSON y sin ella la suma coincide con RoyaleAPI.
  'sobrante real': el sistema supera a la referencia y ninguna de las dos explicaciones anteriores lo cubre.
  'sistema menor': el sistema es menor que la referencia (faltan filas o datos).
  'RoyaleAPI sin registro (0, 0, 0)': la referencia viene en ceros y el sistema tiene valores.
  'no concluyente (varios clanes)': RoyaleAPI trae un solo valor para varios clanes y el JSON no alcanza para decidir.
  'sin diferencia': coincide (tambien 'respaldada por el JSON' cuando RoyaleAPI trae un solo clan).
Escribe doble_exacto_detalle.csv y doble_exacto_resumen.csv junto a este archivo. No modifica nada."""
import json, glob, re, csv, collections, os
AQUI = os.path.dirname(os.path.abspath(__file__))
JS = os.path.join(AQUI, '..', '..', 'JSON', 'Endpoints', 'CurrentRiverRace')
BK = os.path.join(AQUI, '..', 'Hojas', 'Backup_Guerra.csv')
CO = os.path.join(AQUI, '..', 'Tampermonkey', 'Correcciones_Guerra.csv')
SEMANAS = [('2', '1'), ('2', '2'), ('2', '3'), ('2', '4'), ('3', '1'), ('4', '1'), ('5', '1')]
N = lambda v: int(float(v)) if v not in ('', None) else 0
pat = re.compile(r'^T-(\d+)\s+S-(\d+)\s+P\.I-(\d+)-([LMXJVSD])\s+(\d\d)-(\d\d)-(\d{4}) (\d\d)\.(\d\d) - (.+) - currentriverrace\.json$')
CEROS = (0, 0, 0)
fmt = lambda v: '/'.join(map(str, v)) if v else ''
suma = lambda vs: tuple(sum(v[i] for v in vs) for i in range(3))

# --- JSON: captura por semana-clan (domingo si hay; si no, la ultima que no venga toda en ceros) ---
cand = collections.defaultdict(list)
for f in glob.glob(os.path.join(JS, '**', '*currentriverrace.json'), recursive=True):
    m = pat.match(os.path.basename(f))
    if not m or (str(int(m[1])), str(int(m[2]))) not in SEMANAS: continue
    cand[(str(int(m[1])), str(int(m[2])), m[10])].append(((int(m[3]), m[7], m[6], m[5], m[8], m[9]), m[4], f))
snap = {}; clan_de_tag = {}
for k, lst in cand.items():
    for orden, letra, f in sorted(lst, reverse=True):
        d = json.load(open(f, encoding='utf-8'))
        if not any(p['decksUsed'] or p['fame'] for p in d['clan']['participants']): continue
        clan_de_tag[d['clan']['tag']] = k[2]
        snap[k] = (letra, {p['tag']: (p['decksUsed'], p.get('boatAttacks', 0), p['fame']) for p in d['clan']['participants']})
        break

# --- Sistema: ultimo dia de guerra por semana, clan y jugador ---
sis = {}; nombre = {}
for x in csv.DictReader(open(BK, encoding='utf-8-sig')):
    if x['Etapa'] != 'Guerra' or x['Día'] not in ('J', 'V', 'S', 'D') or (x['Temporada'], x['Semana']) not in SEMANAS: continue
    k = (x['Temporada'], x['Semana'], x['Tag'], x['Clan']); o = 'JVSD'.index(x['Día'])
    if k not in sis or o >= sis[k][0]: sis[k] = (o, x['Día'], (N(x['AtaquesSemana']), N(x['Barcos']), N(x['Fame'])))
    nombre[x['Tag']] = x['Nombre']
por_jug = collections.defaultdict(dict)
for (T, S, tag, clan), (o, dia, v) in sis.items(): por_jug[(T, S, tag)][clan] = (dia, v)

# --- RoyaleAPI (Correcciones_Guerra.csv): total (sin ClanTag) y por clan (con ClanTag); gana la fila mas reciente ---
tot_roy = {}; clan_roy = collections.defaultdict(dict)
for x in csv.DictReader(open(CO, encoding='utf-8-sig')):
    k = (x['Temporada'], x['Semana'], x['Tag'])
    if k[:2] not in SEMANAS: continue
    v = (N(x['AtaquesSemana']), N(x['Barcos']), N(x['Fame']))
    if x['ClanTag']:
        c = clan_de_tag.get(x['ClanTag'], x['ClanTag'])
        if c not in clan_roy[k] or x['Actualizado'] >= clan_roy[k][c][1]: clan_roy[k][c] = (v, x['Actualizado'])
    elif k not in tot_roy or x['Actualizado'] >= tot_roy[k][1]: tot_roy[k] = (v, x['Actualizado'])

out = []; res = collections.Counter(); dbl_exacto = 0
for (T, S, tag), clanes in sorted(por_jug.items(), key=lambda a: (int(a[0][0]), int(a[0][1]), a[0][2])):
    vals = {c: v for c, (d, v) in clanes.items()}; n = len(vals); ssum = suma(vals.values())
    troy = tot_roy.get((T, S, tag), (None,))[0]; croy = {c: v for c, (v, _) in clan_roy.get((T, S, tag), {}).items()}
    # referencia: suma de las filas por clan de RoyaleAPI si existen; si no, el total de RoyaleAPI
    if croy: R, fr = suma(croy.values()), 'RoyaleAPI por clan'
    elif troy is not None: R, fr = troy, 'RoyaleAPI total'
    else: R, fr = None, ''
    # JSON de cada clan del sistema (solo como apoyo; puede ser una captura temprana del domingo o del sabado)
    jc = {c: (snap[(T, S, c)][1].get(tag), snap[(T, S, c)][0]) for c in vals if (T, S, c) in snap}
    idem = [v for v in set(vals.values()) if v != CEROS and list(vals.values()).count(v) >= 2]
    if R is None: caso, razon = 'sin referencia de RoyaleAPI', ''
    elif R == CEROS and ssum != CEROS: caso, razon = 'RoyaleAPI sin registro (0, 0, 0)', 'RoyaleAPI viene en ceros; no sirve de referencia'
    elif ssum == R: caso, razon = 'sin diferencia', ''
    elif n >= 2 and any(tuple(a - b for a, b in zip(ssum, v)) == R for v in idem):
        v = [v for v in idem if tuple(a - b for a, b in zip(ssum, v)) == R][0]
        caso, razon = 'doble conteo', 'mismos valores %s en %d clanes; %s da %s' % (fmt(v), list(vals.values()).count(v), fr, fmt(R))
    elif ssum[0] < R[0] or ssum[2] < R[2]: caso, razon = 'sistema menor', 'faltan filas o datos frente a ' + fr
    elif croy:
        malos = [c for c, v in vals.items() if (c in croy and (v[0] > croy[c][0] or v[2] > croy[c][2])) or (c not in croy and v != CEROS)]
        caso, razon = 'sobrante real', 'el sistema supera a RoyaleAPI por clan en: ' + ', '.join(malos or ['(ver detalle)'])
    elif n == 1: caso, razon = 'sobrante real', 'el sistema supera al total de RoyaleAPI (un solo clan)'
    elif any(c in jc and jc[c][0] == CEROS and tuple(a - b for a, b in zip(ssum, v)) == R for c, v in vals.items()):
        c = [c for c, v in vals.items() if c in jc and jc[c][0] == CEROS and tuple(a - b for a, b in zip(ssum, v)) == R][0]
        caso, razon = 'sobrante: fila del clan anterior', 'la fila de %s (%s) no existe en el JSON (viene en ceros) y sin ella la suma coincide con %s' % (c, fmt(vals[c]), fr)
    elif all(c in jc and jc[c][0] == v for c, v in vals.items()): caso, razon = 'sin diferencia (suma de clanes respaldada por el JSON)', 'el total de RoyaleAPI trae solo un clan; cada clan coincide con su JSON'
    else: caso, razon = 'no concluyente (varios clanes)', 'RoyaleAPI trae un solo valor para varios clanes y el JSON no coincide en todos'
    de = 'si' if troy and troy != CEROS and ssum[0] == 2 * troy[0] and ssum[2] == 2 * troy[2] else ''
    dbl_exacto += bool(de)
    res[(T, S, caso)] += 1
    if not caso.startswith('sin diferencia') or de:
        out.append([T, S, tag, nombre.get(tag, ''), n,
                    ' | '.join('%s (%s): %s' % (c, clanes[c][0], fmt(v)) for c, v in vals.items()),
                    fmt(ssum), fmt(troy), ' | '.join('%s: %s' % (c, fmt(v)) for c, v in croy.items()),
                    ' | '.join('%s (JSON %s): %s' % (c, l, fmt(j) if j else 'no figura') for c, (j, l) in jc.items()),
                    de, caso, razon])
with open(os.path.join(AQUI, 'doble_exacto_detalle.csv'), 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh)
    w.writerow(['T', 'S', 'tag', 'nombre', 'clanes_en_sistema', 'sistema_por_clan (dia): ataques/barcos/fame', 'sistema_suma',
                'royaleapi_total', 'royaleapi_por_clan', 'json_por_clan (captura de domingo o sabado)', 'doble_exacto_frente_a_royaleapi', 'caso', 'razon'])
    w.writerows(out)
with open(os.path.join(AQUI, 'doble_exacto_resumen.csv'), 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh); w.writerow(['T', 'S', 'caso', 'jugadores'])
    for (T, S, c), v in sorted(res.items(), key=lambda a: (int(a[0][0]), int(a[0][1]), a[0][2])): w.writerow([T, S, c, v])
print('capturas usadas por letra de dia:', dict(collections.Counter(v[0] for v in snap.values())))
print('semanas-clan sin captura utilizable:', sorted(k for k in cand if k not in snap))
tot = collections.Counter()
for (T, S, c), v in res.items(): tot[c] += v
for k, v in sorted(tot.items()): print('%-45s %5d' % (k, v))
print('doble exacto frente a RoyaleAPI (suma del sistema = 2 x total RoyaleAPI):', dbl_exacto)
