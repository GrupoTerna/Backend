# Contraste (SOLO LECTURA) de los casos "no existe" del chequeo de un día contra los totales semanales de los JSON individuales.
# Uso: python3 chequeo_dia_json.py "<Datos descargados>" <Temporada> <Semana>
# Regla: el JSON es más confiable que el CSV. Si el JSON trae el total de ataques de la semana, el domingo se obtiene como
# (total semanal del JSON) - (ataques de jueves a sábado del CSV), igual que la lógica de Supercell de decksused / decksusedtoday.
import csv, glob, json, sys, collections, os
raiz, T, S = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
ent = lambda v: int(float(v)) if v not in ('', None) else 0
dc = {r['ID']: int(r['Variantes']) for r in csv.DictReader(open(os.path.join(raiz, 'CSV/Informes/Diario_C.csv'), encoding='utf-8-sig'))}
clave = lambda m, a, b: 'M_%03d_A_%d_B_%d' % (m, a, b)
js = collections.defaultdict(set)
for f in glob.glob(os.path.join(raiz, 'JSON/RoyaleAPI/Individual/*.json')):
    try: d = json.load(open(f, encoding='utf-8'))
    except Exception: continue
    for x in d.get('registros', []):
        if x.get('temporadaInterna') == T and x.get('semana') == S: js[(d['tag'], x['clan'])].add((x['ataques'], x['fame'], x['barcos'], x['fuente']))
ser = collections.defaultdict(dict)
for x in csv.DictReader(open(os.path.join(raiz, 'CSV/Hojas/Backup_Guerra.csv'), encoding='utf-8-sig')):
    if x['Temporada'] == str(T) and x['Semana'] == str(S) and x['Etapa'] == 'Guerra': ser[(x['Tag'], x['Clan'])][int(x['PeriodIndex'])] = x
# 1) coincidencia semanal CSV vs JSON (el JSON a veces trae barcos vacíos: no cuenta como diferencia)
res = collections.Counter()
for k, d in ser.items():
    if k not in js: res['sin JSON']+= 1; continue
    csvv = (sum(ent(x['AtaquesHoy']) for x in d.values()), ent(d[max(d)]['Fame']), ent(d[max(d)]['Barcos']))
    ok = any(csvv[0] == a and csvv[1] == f and (b is None or csvv[2] == b) for a, f, b, _ in js[k])
    res['coincide' if ok else 'difiere'] += 1
print('series CSV:', len(ser), '| series JSON:', len(js), '|', dict(res))
# 2) casos "no existe" del día
pis = sorted({p for d in ser.values() for p in d}); dom = max(pis)
sal = collections.Counter()
for (tag, clan), d in ser.items():
    prev = None; prevat = 0
    for pi in sorted(d):
        x = d[pi]; m = ent(x['Fame']) - (ent(d[prev]['Fame']) if prev else 0); b = ent(x['Barcos']) - (ent(d[prev]['Barcos']) if prev else 0); a = ent(x['AtaquesHoy'])
        if (a or m or b) and clave(m, a, b) not in dc:
            j = js.get((tag, clan))
            if not j: sal['sin JSON de ese clan y semana'] += 1
            elif len({v[0] for v in j}) > 1: sal['JSON con ataques distintos entre archivos'] += 1
            else:
                ja = next(iter(j))[0]; imp = ja - prevat
                if pi == dom: sal['domingo: con el JSON la clave %s' % ('existe' if 0 <= imp <= 4 and clave(m, imp, b) in dc else 'sigue sin existir')] += 1
                else: sal['otro día: JSON semana=%d vs CSV semana=%d' % (ja, sum(ent(y['AtaquesHoy']) for y in d.values()))] += 1
        prev = pi; prevat += ent(x['AtaquesHoy'])
for k, v in sorted(sal.items()): print(v, 'x', k)
