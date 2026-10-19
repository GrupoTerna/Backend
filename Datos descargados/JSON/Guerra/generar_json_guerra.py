#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genera los JSON de guerra POR SEMANA a partir de Backup_Guerra.csv (Contexto_Base_Web.md §PF123).

Uso:
    python3 generar_json_guerra.py "<ruta a 'Datos descargados'>" [--fecha AAAA-MM-DD] [--solo-verificar]

Qué hace:
 1. Agrupa las filas de CSV/Hojas/Backup_Guerra.csv por (Temporada, Semana) y escribe un archivo por semana en
    JSON/Guerra/T<temporada>/T<temporada>_S<semana> - <dd-mm-aaaa> <HH.MM>.json
    (la fecha y hora del nombre son la PRIMERA hora de registro de la semana y NO cambian después: si ya existe un
    archivo con ese prefijo T<t>_S<s> - , se reutiliza su nombre).
 2. Cada archivo trae, sin perder ninguna columna, las filas EXACTAS del CSV (bloque "filas") y un bloque "diario"
    (medallas, ataques y barcos de cada día por jugador y clan, la clave M_ de Diario_C y su estado).
 3. Coteja los totales semanales del CSV con los JSON de RoyaleAPI (JSON/RoyaleAPI/Individual). Si el JSON trae MÁS
    que el CSV y el reparto es posible, el domingo se completa SOLO en el bloque "diario" (Marca "Reconstruido");
    las filas de "filas" nunca se modifican. Si no hay JSON de ese jugador, clan y semana, se avisa y no se toca.
 4. Escribe el informe CSV/Informes/Cotejo_JSON_Guerra <fecha> (informe).csv y JSON/Guerra/README_Guerra.md.
 5. Verifica: al juntar todos los archivos salen EXACTAMENTE las filas del CSV (celda por celda).

Solo lectura sobre el CSV y los JSON de RoyaleAPI. Solo escribe dentro de JSON/Guerra/ y el informe.
"""
import csv, glob, json, os, re, sys, collections, datetime

FORMATO = 1
RUTA_CSV = 'CSV/Hojas/Backup_Guerra.csv'
RUTA_DIARIO_C = 'CSV/Informes/Diario_C.csv'
RUTA_JSON_API = 'JSON/RoyaleAPI/Individual'
CARPETA = 'JSON/Guerra'
DIARIO_COLS = ['Tag', 'Clan', 'PeriodIndex', 'Día', 'Medallas', 'Ataques', 'Barcos', 'Clave', 'Estado', 'Variantes', 'Marca']
JUGADOR_DIA_COLS = ['Tag', 'PeriodIndex', 'Día', 'Medallas', 'Ataques', 'Barcos', 'Clave', 'Estado', 'Variantes', 'Clanes', 'Marca']
RECON_COLS = ['Tag', 'Clan', 'PeriodIndex', 'Medallas_CSV', 'Ataques_CSV', 'Barcos_CSV', 'Medallas_final', 'Ataques_final',
              'Barcos_final', 'JSON_ataques', 'JSON_fame', 'JSON_barcos', 'JSON_fuentes']
TOPE_ATAQUES_DIA, TOPE_MEDALLAS_DIA = 4, 900


def ent(v):
    return int(float(v)) if v not in ('', None) else 0


def clave(m, a, b):
    return 'M_%03d_A_%d_B_%d' % (m, a, b)


def enc(v):
    """Celda del CSV -> valor JSON. Enteros canónicos pasan a número; el resto queda como texto (ida y vuelta exacta)."""
    return int(v) if re.fullmatch(r'0|-?[1-9]\d{0,17}', v) else v


def dec(v):
    return str(v) if isinstance(v, int) else v


def parse_fecha(s):
    m = re.fullmatch(r'(\d\d)/(\d\d)/(\d{4})(?: (\d\d):(\d\d):(\d\d))?', s or '')
    if not m:
        return None
    d, mo, y, hh, mi, ss = m.groups()
    return datetime.datetime(int(y), int(mo), int(d), int(hh or 0), int(mi or 0), int(ss or 0))


def norm_clan(c):
    # En los registros "perfil" el clan a veces trae basura de rascado: "GrupoXTerna™2\n   2026-08-24".
    return (c or '').split('\n')[0].strip()


def leer_csv(ruta):
    with open(ruta, encoding='utf-8-sig', newline='') as f:
        r = csv.reader(f)
        cab = next(r)
        filas = [x for x in r]
    return cab, filas


def cargar_diario_c(raiz):
    with open(os.path.join(raiz, RUTA_DIARIO_C), encoding='utf-8-sig', newline='') as f:
        return {x['ID']: int(x['Variantes']) for x in csv.DictReader(f)}


def cargar_json_api(raiz, temporadas):
    """(tag, clan normalizado, temporada, semana) -> lista de registros únicos."""
    js = collections.defaultdict(dict)
    for f in sorted(glob.glob(os.path.join(raiz, RUTA_JSON_API, '*.json'))):
        try:
            with open(f, encoding='utf-8') as fh:
                d = json.load(fh)
        except Exception:
            continue
        for x in d.get('registros', []):
            if x.get('temporadaInterna') not in temporadas:
                continue
            k = (d['tag'], norm_clan(x.get('clan')), x['temporadaInterna'], x['semana'])
            v = (x['ataques'], x['fame'], x['barcos'], x['fuente'], bool(x.get('cerrada')))
            js[k][v] = 1
    return {k: list(v) for k, v in js.items()}


def estado_clave(dc, m, a, b):
    if a == 0 and m == 0 and b == 0:
        return clave(m, a, b), 'sin_ataques', 0
    k = clave(m, a, b)
    if k not in dc:
        return k, 'no_existe', 0
    return k, ('unica' if dc[k] == 1 else 'ambigua'), dc[k]


def json_de_serie(regs):
    """Valor semanal del JSON para una serie. Prefiere registros cerrados (perfil, log, analytics). Si solo hay riverrace
    (instantánea de una semana sin cerrar) usa la mayor, que es un piso y no el total final.
    Devuelve (estado, ataques, fame, barcos, fuentes, cerrado)."""
    if not regs:
        return 'sin_json', None, None, None, [], False
    cerr = [r for r in regs if r[4]]
    if not cerr:
        r = max(regs, key=lambda z: (z[0], z[1]))
        return 'ok', r[0], r[1], r[2], sorted({z[3] for z in regs}), False
    af = {(r[0], r[1]) for r in cerr}
    bs = {r[2] for r in cerr if r[2] is not None}
    fu = sorted({r[3] for r in cerr})
    if len(af) > 1 or len(bs) > 1:
        return 'json_inconsistente', None, None, None, fu, True
    a, f = next(iter(af))
    return 'ok', a, f, (next(iter(bs)) if bs else None), fu, True


def procesar_semana(cab, filas, dc, js, T, S):
    ix = {c: i for i, c in enumerate(cab)}
    g = lambda r, c: r[ix[c]]
    guerra = [r for r in filas if g(r, 'Etapa') == 'Guerra']
    pis = sorted({int(g(r, 'PeriodIndex')) for r in guerra})
    letra = {}
    for r in guerra:
        letra.setdefault(int(g(r, 'PeriodIndex')), collections.Counter())[g(r, 'Día')] += 1
    letra = {pi: c.most_common(1)[0][0] for pi, c in letra.items()}
    series, repetidas = collections.defaultdict(dict), collections.defaultdict(set)
    for r in guerra:
        k = (g(r, 'Tag'), g(r, 'Clan'))
        pi = int(g(r, 'PeriodIndex'))
        if pi in series[k]:
            repetidas[k].add(pi)
        series[k][pi] = r  # gana la última fila del archivo
    # valores del día por serie (clan) según el CSV
    dia = {}
    for k, d in series.items():
        pf = pb = 0
        for pi in sorted(d):
            x = d[pi]
            f, b, a = ent(g(x, 'Fame')), ent(g(x, 'Barcos')), ent(g(x, 'AtaquesHoy'))
            i = pis.index(pi)
            salto = i > 0 and pis[i - 1] not in d
            dia[(k, pi)] = {'m': f - pf, 'a': a, 'b': b - pb, 'salto': salto, 'rep': pi in repetidas[k], 'recon': False}
            pf, pb = f, b
    # cotejo con el JSON de RoyaleAPI
    cotejo, candidatos = [], {}
    por_tag = collections.defaultdict(set)
    for (t_, c_, tt, ss) in js:
        if tt == T and ss == S:
            por_tag[t_].add(c_)
    for k, d in sorted(series.items()):
        tag, clan = k
        ult = d[max(d)]
        aS = sum(ent(g(x, 'AtaquesHoy')) for x in d.values())
        fS, bS = ent(g(ult, 'Fame')), ent(g(ult, 'Barcos'))
        aCol = ent(g(ult, 'AtaquesSemana'))
        est, ja, jf, jb, fu, cerrado = json_de_serie(js.get((tag, clan, T, S)))
        fila = {'Tag': tag, 'Nombre': g(ult, 'Nombre'), 'Clan': clan, 'AtaquesSemana_col': aCol, 'A': aS, 'F': fS, 'B': bS,
                'JA': ja, 'JF': jf, 'JB': jb, 'fu': ','.join(fu), 'otro_clan': '', 'Accion': '', 'Detalle': ''}
        if est == 'sin_json':
            otros = sorted(por_tag.get(tag, set()) - {clan})
            fila['Estado'] = 'sin_json'
            fila['otro_clan'] = ' | '.join(otros)
            fila['Accion'] = 'avisar, no se toca'
        elif est == 'json_inconsistente':
            fila['Estado'] = 'json_inconsistente'
            fila['Accion'] = 'no se toca'
            fila['Detalle'] = 'los registros cerrados del JSON no coinciden entre sí'
        else:
            da, df = ja - aS, jf - fS
            db = (jb - bS) if jb is not None else 0
            if da == 0 and df == 0 and db == 0:
                fila['Estado'] = 'coincide'
            elif not cerrado:
                fila['Estado'] = 'json_sin_cerrar'
                fila['Accion'] = 'no se toca (instantánea de semana sin cerrar: es un piso, no el total)'
                fila['Detalle'] = 'JSON - CSV: ataques %+d, fame %+d, barcos %+d' % (da, df, db)
            elif da >= 0 and df >= 0 and db >= 0:
                fila['Estado'] = 'json_mas'
                fila['Detalle'] = 'JSON - CSV: ataques %+d, fame %+d, barcos %+d' % (da, df, db)
                candidatos[k] = (da, df, db, ja, jf, jb, fu)
            elif da <= 0 and df <= 0 and db <= 0:
                fila['Estado'] = 'json_menos'
                fila['Accion'] = 'no se toca'
                fila['Detalle'] = 'JSON - CSV: ataques %+d, fame %+d, barcos %+d' % (da, df, db)
            else:
                fila['Estado'] = 'json_distinto'
                fila['Accion'] = 'no se toca'
                fila['Detalle'] = 'JSON - CSV: ataques %+d, fame %+d, barcos %+d (unos suben y otros bajan)' % (da, df, db)
        cotejo.append(fila)
    # reconstrucción: lo que el JSON trae de más va al domingo (último día de guerra), solo si el reparto es posible
    dom = pis[-1] if pis else None
    previos = {}
    for k, (da, df, db, ja, jf, jb, fu) in candidatos.items():
        previos[k] = dict(dia[(k, dom)]) if (k, dom) in dia else None
    motivo = {}
    prov = {}
    for k, cand in candidatos.items():
        if previos[k] is None or max(series[k]) != dom:
            motivo[k] = 'no hay fila de domingo para esa serie'
            continue
        da, df, db = cand[0], cand[1], cand[2]
        x = previos[k]
        prov[k] = {'m': x['m'] + df, 'a': x['a'] + da, 'b': x['b'] + db}
        if prov[k]['a'] > TOPE_ATAQUES_DIA or not (0 <= prov[k]['m'] <= TOPE_MEDALLAS_DIA):
            motivo[k] = 'el domingo pasaría el tope diario (4 ataques o 900 medallas)'
            del prov[k]
    # la suma de clanes del mismo jugador en el domingo debe seguir siendo una clave de Diario_C
    por_jug = collections.defaultdict(list)
    for k in prov:
        por_jug[k[0]].append(k)
    for tag, ks in por_jug.items():
        tot = {'m': 0, 'a': 0, 'b': 0}
        for (kk, pi), v in dia.items():
            if kk[0] == tag and pi == dom:
                src = prov.get(kk, v)
                tot['m'] += src['m']; tot['a'] += src['a']; tot['b'] += src['b']
        _, est, _ = estado_clave(dc, tot['m'], tot['a'], tot['b'])
        if est == 'no_existe' or tot['a'] > TOPE_ATAQUES_DIA:
            for kk in ks:
                motivo[kk] = 'la suma de clanes del domingo no es una clave de Diario_C'
                del prov[kk]
    recon = []
    for k, v in prov.items():
        da, df, db, ja, jf, jb, fu = candidatos[k]
        x = dia[(k, dom)]
        recon.append([k[0], k[1], dom, x['m'], x['a'], x['b'], v['m'], v['a'], v['b'], ja, jf, jb, ','.join(fu)])
        x.update({'m': v['m'], 'a': v['a'], 'b': v['b'], 'recon': True})
    for f in cotejo:
        k = (f['Tag'], f['Clan'])
        if f['Estado'] == 'json_mas':
            if k in prov:
                f['Estado'] = 'json_mas_reconstruido'
                f['Accion'] = 'domingo completado en "diario" (Marca Reconstruido)'
            else:
                f['Estado'] = 'json_mas_no_resuelve'
                f['Accion'] = 'no se toca'
                f['Detalle'] += ' | ' + motivo.get(k, '')
    # bloques de salida
    diario = []
    for (k, pi) in sorted(dia, key=lambda z: (z[0][0], z[0][1], z[1])):
        x = dia[(k, pi)]
        cl, es, va = estado_clave(dc, x['m'], x['a'], x['b'])
        marca = '+'.join(m for m, c in (('Reconstruido', x['recon']), ('Salto', x['salto']), ('Repetida', x['rep'])) if c)
        diario.append([k[0], k[1], pi, letra.get(pi, ''), x['m'], x['a'], x['b'], cl, es, va, marca])
    agg = {}
    for (k, pi), x in dia.items():
        z = agg.setdefault((k[0], pi), {'m': 0, 'a': 0, 'b': 0, 'n': 0, 'recon': False, 'salto': False})
        z['m'] += x['m']; z['a'] += x['a']; z['b'] += x['b']; z['n'] += 1
        z['recon'] |= x['recon']; z['salto'] |= x['salto']
    jug = []
    for (tag, pi) in sorted(agg):
        z = agg[(tag, pi)]
        cl, es, va = estado_clave(dc, z['m'], z['a'], z['b'])
        marca = '+'.join(m for m, c in (('Reconstruido', z['recon']), ('Salto', z['salto'])) if c)
        jug.append([tag, pi, letra.get(pi, ''), z['m'], z['a'], z['b'], cl, es, va, z['n'], marca])
    return diario, jug, recon, cotejo, {'dias_guerra': pis, 'series': len(series), 'filas_guerra': len(guerra)}


def escribir_semana(ruta, cabecera, cols, filas, diario, jug, recon):
    def lista(nombre, items):
        cuerpo = ',\n'.join(json.dumps(i, ensure_ascii=False, separators=(',', ':')) for i in items)
        return '"%s": [%s]' % (nombre, ('\n' + cuerpo + '\n') if items else '')
    partes = [
        '"cabecera": ' + json.dumps(cabecera, ensure_ascii=False, separators=(',', ':')),
        '"columnas": ' + json.dumps(cols, ensure_ascii=False, separators=(',', ':')),
        lista('filas', filas),
        '"diario_columnas": ' + json.dumps(DIARIO_COLS, ensure_ascii=False, separators=(',', ':')),
        lista('diario', diario),
        '"jugador_dia_columnas": ' + json.dumps(JUGADOR_DIA_COLS, ensure_ascii=False, separators=(',', ':')),
        lista('jugador_dia', jug),
        '"reconstruidos_columnas": ' + json.dumps(RECON_COLS, ensure_ascii=False, separators=(',', ':')),
        lista('reconstruidos', recon),
    ]
    os.makedirs(os.path.dirname(ruta), exist_ok=True)
    with open(ruta, 'w', encoding='utf-8', newline='\n') as f:
        f.write('{\n' + ',\n'.join(partes) + '\n}\n')


def nombre_archivo(raiz, T, S, primera):
    carpeta = os.path.join(raiz, CARPETA, 'T%d' % T)
    previos = sorted(glob.glob(os.path.join(carpeta, 'T%d_S%d - *.json' % (T, S))))
    if previos:  # el nombre no cambia después de creado
        return previos[0]
    txt = primera.strftime('%d-%m-%Y %H.%M') if primera else '00-00-0000 00.00'
    return os.path.join(carpeta, 'T%d_S%d - %s.json' % (T, S, txt))


def generar(raiz, fecha):
    cab, filas = leer_csv(os.path.join(raiz, RUTA_CSV))
    ix = {c: i for i, c in enumerate(cab)}
    dc = cargar_diario_c(raiz)
    grupos = collections.defaultdict(list)
    for r in filas:
        grupos[(int(r[ix['Temporada']]), int(r[ix['Semana']]))].append(r)
    js = cargar_json_api(raiz, {t for t, _ in grupos})
    informe, resumen = [], []
    for (T, S) in sorted(grupos):
        fs = grupos[(T, S)]
        fechas = [parse_fecha(r[ix['Fecha']]) for r in fs]
        validas = [f for f in fechas if f]
        primera = min(validas) if validas else None
        sin_hora = all(f.hour == 0 and f.minute == 0 and f.second == 0 for f in validas) if validas else True
        diario, jug, recon, cot, info = procesar_semana(cab, fs, dc, js, T, S)
        ruta = nombre_archivo(raiz, T, S, primera)
        cabecera = {
            'formato': FORMATO, 'temporada': T, 'semana': S, 'archivo': os.path.basename(ruta),
            'primeraFecha': primera.strftime('%d-%m-%Y %H.%M') if primera else '',
            'primeraFechaSinHora': bool(sin_hora), 'filas': len(fs), 'filasGuerra': info['filas_guerra'],
            'filasEntrenamiento': sum(1 for r in fs if r[ix['Etapa']] == 'Entrenamiento'),
            'filasSinFecha': sum(1 for f in fechas if f is None), 'diasGuerra': info['dias_guerra'],
            'origenCsv': 'Datos descargados/' + RUTA_CSV, 'diarioC': 'Datos descargados/' + RUTA_DIARIO_C,
            'jsonRoyaleAPI': 'Datos descargados/' + RUTA_JSON_API + ' (clan normalizado: se descarta lo que sigue al salto de línea)',
            'generado': fecha,
            'regla': 'filas = copia exacta del CSV (no se modifican). diario/jugador_dia = valores del día calculados con '
                     'Fame y Barcos acumulados; lo que completa el JSON de RoyaleAPI va solo en diario con Marca Reconstruido.',
        }
        escribir_semana(ruta, cabecera, cab, [[enc(c) for c in r] for r in fs], diario, jug, recon)
        for f in cot:
            informe.append([T, S] + [f['Tag'], f['Nombre'], f['Clan'], f['Estado'], f['A'], f['AtaquesSemana_col'], f['F'], f['B'],
                                    '' if f['JA'] is None else f['JA'], '' if f['JF'] is None else f['JF'],
                                    '' if f['JB'] is None else f['JB'], f['fu'], f['otro_clan'], f['Accion'], f['Detalle']])
        cnt = collections.Counter(f['Estado'] for f in cot)
        est_j = collections.Counter(z[7] for z in jug)
        resumen.append({'T': T, 'S': S, 'ruta': ruta, 'filas': len(fs), 'bytes': os.path.getsize(ruta), 'primera': cabecera['primeraFecha'],
                        'sin_hora': sin_hora, 'sin_fecha': cabecera['filasSinFecha'], 'cotejo': dict(cnt), 'jugador_dia': dict(est_j),
                        'reconstruidos': len(recon)})
    # series de JSON en un clan Terna, con actividad, que no tienen fila de guerra en el CSV
    terna = {r[ix['Clan']] for r in filas if r[ix['Clan']]}
    csv_ser = {(r[ix['Tag']], r[ix['Clan']], int(r[ix['Temporada']]), int(r[ix['Semana']])) for r in filas if r[ix['Etapa']] == 'Guerra'}
    clan_csv = collections.defaultdict(set)
    nombre_de = {}
    for r in filas:
        nombre_de[r[ix['Tag']]] = r[ix['Nombre']]
        if r[ix['Etapa']] == 'Guerra':
            clan_csv[(r[ix['Tag']], int(r[ix['Temporada']]), int(r[ix['Semana']]))].add(r[ix['Clan']])
    solo = []
    for k in sorted(js):
        if k[1] not in terna or k in csv_ser or not any(x[0] or x[1] for x in js[k]):
            continue
        tag, clan, T, S = k
        est, ja, jf, jb, fu, cerrado = json_de_serie(js[k])
        if est != 'ok':
            continue
        if (T, S) not in grupos:
            det = 'la semana no existe en el CSV'
        elif clan_csv.get((tag, T, S)):
            det = 'el CSV lo tiene esa semana en otro clan: ' + ' | '.join(sorted(clan_csv[(tag, T, S)]))
        else:
            det = 'el CSV no tiene a este jugador esa semana'
        if not cerrado:
            det += ' | instantánea de semana sin cerrar'
        solo.append((k, det))
        informe.append([T, S, tag, nombre_de.get(tag, ''), clan, 'solo_json', '', '', '', '', ja, jf, '' if jb is None else jb, ','.join(fu), '',
                        'avisar, no se toca', det])
    # informe
    ruta_inf = os.path.join(raiz, 'CSV/Informes', 'Cotejo_JSON_Guerra %s (informe).csv' % fecha)
    with open(ruta_inf, 'w', encoding='utf-8-sig', newline='') as f:
        w = csv.writer(f)
        w.writerow(['Temporada', 'Semana', 'Tag', 'Nombre', 'Clan', 'Estado', 'Ataques_CSV', 'AtaquesSemana_col_CSV', 'Fame_CSV', 'Barcos_CSV',
                    'Ataques_JSON', 'Fame_JSON', 'Barcos_JSON', 'Fuentes_JSON', 'JSON_de_otro_clan', 'Accion', 'Detalle'])
        w.writerows(informe)
    return resumen, ruta_inf, solo, (cab, filas)


def verificar(raiz, cab, filas):
    """Junta todos los archivos semanales y compara celda por celda con el CSV."""
    errores = []
    archivos = sorted(glob.glob(os.path.join(raiz, CARPETA, 'T*', 'T*_S* - *.json')))
    juntas = {}
    for a in archivos:
        with open(a, encoding='utf-8') as f:
            d = json.load(f)
        if d['columnas'] != cab:
            errores.append('columnas distintas en ' + a)
        if d['cabecera']['filas'] != len(d['filas']):
            errores.append('cabecera.filas no coincide en ' + a)
        for r in d['filas']:
            n = dec(r[0])
            if n in juntas:
                errores.append('N° repetido entre archivos: ' + n)
            juntas[n] = [dec(c) for c in r]
    ixn = cab.index('N°')
    orig = {r[ixn]: r for r in filas}
    if len(orig) != len(filas):
        errores.append('el CSV tiene N° repetidos')
    if len(juntas) != len(filas):
        errores.append('filas en JSON: %d, filas en CSV: %d' % (len(juntas), len(filas)))
    dif = sum(1 for n, r in orig.items() if juntas.get(n) != r)
    if dif:
        errores.append('filas que no coinciden celda por celda: %d' % dif)
    # los teléfonos o celulares no pueden estar en los archivos (el repo es público): 9 o más dígitos seguidos
    # (quitando espacios, guiones, puntos y paréntesis) o un "+" seguido de 6 o más
    tel = 0
    for r in filas:
        for i, c in enumerate(r):
            if cab[i] in ('Nombre', 'Clan'):
                z = re.sub(r'[\s\-.()]', '', c)
                if re.search(r'\d{9,}', z) or re.search(r'\+\d{6,}', z):
                    tel += 1
    if tel:
        errores.append('posibles teléfonos en Nombre o Clan: %d filas (revisar y avisar a la usuaria)' % tel)
    return len(archivos), len(juntas), errores


def readme(raiz, resumen, fecha):
    ln = ['# JSON de guerra por semana', '',
          'Generado el %s por `generar_json_guerra.py` a partir de `CSV/Hojas/Backup_Guerra.csv` (Contexto_Base_Web.md §PF123).' % fecha, '',
          'Un archivo por semana: `T<temporada>/T<temporada>_S<semana> - <dd-mm-aaaa> <HH.MM>.json`. La fecha y hora del nombre son la '
          '**primera hora de registro** de la semana y **no cambian** después (se busca el archivo por el prefijo `T<t>_S<s> - `). '
          'Cuando la primera fecha no trae hora, el nombre lleva `00.00`.', '',
          'Bloques de cada archivo: `cabecera`, `columnas` y `filas` (copia exacta del CSV, sin perder ninguna columna; los enteros van como número y el resto como texto), '
          '`diario` (valores del día por jugador y clan con su clave `M_…` de `Diario_C`), `jugador_dia` (lo mismo sumando los clanes del jugador en el día) y '
          '`reconstruidos` (lo que el JSON de RoyaleAPI trae de más, solo para el domingo). La `Marca` del diario puede ser `Reconstruido`, `Salto` '
          '(falta la fila del día anterior de esa serie: la diferencia incluye más de un día) o `Repetida` (hay más de una fila para ese día; se usó la última).', '',
          '| Temporada | Semana | Archivo | Filas | Primera hora | Tamaño (KB) |', '|---|---|---|---|---|---|']
    for r in resumen:
        ln.append('| %d | %d | `%s` | %d | %s%s | %.0f |' % (r['T'], r['S'], os.path.relpath(r['ruta'], os.path.join(raiz, CARPETA)).replace('\\', '/'), r['filas'],
                                                          r['primera'], ' (sin hora)' if r['sin_hora'] else '', r['bytes'] / 1024))
    ln += ['', 'Total: %d archivos, %d filas.' % (len(resumen), sum(r['filas'] for r in resumen)), '',
           'Regenerar o verificar: `python3 generar_json_guerra.py "<ruta a Datos descargados>" [--fecha AAAA-MM-DD] [--solo-verificar]`.', '']
    with open(os.path.join(raiz, CARPETA, 'README_Guerra.md'), 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(ln))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    raiz = args[0]
    fecha = datetime.date.today().isoformat()
    if '--fecha' in sys.argv:
        fecha = sys.argv[sys.argv.index('--fecha') + 1]
        args = [a for a in args if a != fecha]
    if '--solo-verificar' in sys.argv:
        cab, filas = leer_csv(os.path.join(raiz, RUTA_CSV))
        n, m, err = verificar(raiz, cab, filas)
        print('archivos:', n, '| filas juntadas:', m, '| filas CSV:', len(filas), '| errores:', err or 'ninguno')
        sys.exit(1 if err else 0)
    resumen, ruta_inf, solo, (cab, filas) = generar(raiz, fecha)
    readme(raiz, resumen, fecha)
    n, m, err = verificar(raiz, cab, filas)
    print('archivos:', n, '| filas juntadas:', m, '| filas CSV:', len(filas), '| errores:', err or 'ninguno')
    print('informe:', ruta_inf)
    for r in resumen:
        print('T%d_S%d %4d filas %5.0f KB  primera=%s%s sin_fecha=%d recon=%d cotejo=%s' % (
            r['T'], r['S'], r['filas'], r['bytes'] / 1024, r['primera'], '(sin hora)' if r['sin_hora'] else '', r['sin_fecha'], r['reconstruidos'], r['cotejo']))
    c = collections.Counter(k[2:] for k, _ in solo)
    print('series de JSON en clan Terna con actividad y sin fila de guerra en el CSV:', len(solo))
    print('  por (temporada, semana):', dict(sorted(c.items())))
    print('  por motivo:', dict(collections.Counter(d.split(' | ')[0].split(':')[0] for _, d in solo)))
    sys.exit(1 if err else 0)


if __name__ == '__main__':
    main()
