#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Renombra JSON/Guerra/T<t>/ y sus archivos T<t>_S<s> - ... después de reenumerar las temporadas
(Contexto_Base_Web.md §PF269 punto 2 y §PF271).

Uso:
    python3 renombrar_json_guerra.py "<ruta a 'Datos descargados'>" [--delta N] [--aplicar]

Cuándo correrlo: DESPUÉS de que la reenumeración terminó en Drive y de que CSV/Hojas/Backup_Guerra.csv del repo ya es la copia
con la numeración nueva (y JSON/RoyaleAPI/Individual también); y ANTES de volver a correr generar_json_guerra.py.

Qué hace (por defecto solo SIMULA y muestra el plan; escribe únicamente con --aplicar):
 1. Para cada archivo semanal decide por su CONTENIDO, no por su nombre: compara los N° de su bloque "filas" con los N° de cada
    (Temporada, misma Semana) del CSV y toma el grupo con mayor coincidencia (mínimo 50 %). Si el grupo es de otra temporada,
    el archivo tiene la numeración vieja y la diferencia es el delta. Los que ya coinciden con el CSV no se tocan.
    Se decide así porque, tras sumar el delta, el rango viejo y el nuevo se solapan (con +4, el T5_S1 viejo y el T5_S1 nuevo son
    semanas distintas) y el nombre solo no permite distinguirlos.
 2. Suma el delta a la carpeta T<t>, al prefijo T<t>_S<s> del nombre, a cabecera.temporada, a cabecera.archivo y a la columna
    Temporada de cada fila de "filas". Todo lo demás queda igual (la fecha y hora del nombre no cambian). Actualiza la tabla de README_Guerra.md.
 3. Si algo no cuadra (formato inesperado, archivo sin correspondencia, deltas distintos, destino ocupado) se detiene SIN escribir nada.
 4. Se puede correr otra vez sin riesgo: lo que ya coincide con el CSV no se vuelve a tocar.

--delta N es opcional: si se da, el script comprueba que coincide con el que deduce del CSV; si no se da, lo deduce.
"""
import csv, glob, json, os, re, sys

RUTA_CSV = 'CSV/Hojas/Backup_Guerra.csv'
CARPETA = 'JSON/Guerra'
MINIMO = 0.5  # fracción mínima de N° del archivo que debe estar en el grupo del CSV


def leer_csv(ruta):
    with open(ruta, encoding='utf-8-sig', newline='') as f:
        r = csv.reader(f)
        cab = next(r)
        filas = [x for x in r]
    return cab, filas


def _dump(x):
    return json.dumps(x, ensure_ascii=False, separators=(',', ':'))


def serializar(d):
    """Mismo formato que escribir_semana() de generar_json_guerra.py, con las columnas que trae el propio archivo."""
    def lista(nombre, items):
        cuerpo = ',\n'.join(_dump(i) for i in items)
        return '"%s": [%s]' % (nombre, ('\n' + cuerpo + '\n') if items else '')
    partes = [
        '"cabecera": ' + _dump(d['cabecera']),
        '"columnas": ' + _dump(d['columnas']),
        lista('filas', d['filas']),
        '"diario_columnas": ' + _dump(d['diario_columnas']),
        lista('diario', d['diario']),
        '"jugador_dia_columnas": ' + _dump(d['jugador_dia_columnas']),
        lista('jugador_dia', d['jugador_dia']),
        '"reconstruidos_columnas": ' + _dump(d['reconstruidos_columnas']),
        lista('reconstruidos', d['reconstruidos']),
    ]
    return '{\n' + ',\n'.join(partes) + '\n}\n'


def grupos_del_csv(raiz):
    """{semana: [(temporada, {N°})]} a partir de Backup_Guerra.csv."""
    cab, filas = leer_csv(os.path.join(raiz, RUTA_CSV))
    it, isem, ixn = cab.index('Temporada'), cab.index('Semana'), cab.index('N°')
    g = {}
    for r in filas:
        g.setdefault((int(r[it]), int(r[isem])), set()).add(r[ixn])
    por_semana = {}
    for (t, s), ns in g.items():
        por_semana.setdefault(s, []).append((t, ns))
    return por_semana


def leer_archivo(ruta, errores):
    """Devuelve (T, S, resto_del_nombre, d, texto) o None si no se puede usar (y anota el error)."""
    nombre = os.path.basename(ruta)
    m = re.match(r'T(-?\d+)_S(\d+) - (.*)\.json$', nombre)
    rel = os.path.relpath(ruta)
    if not m:
        errores.append('%s: el nombre no tiene la forma T<t>_S<s> - <fecha>.json' % rel)
        return None
    T, S, resto = int(m.group(1)), int(m.group(2)), m.group(3)
    if os.path.basename(os.path.dirname(ruta)) != 'T%d' % T:
        errores.append('%s: la carpeta no es T%d' % (rel, T))
        return None
    with open(ruta, encoding='utf-8', newline='') as f:
        texto = f.read()
    try:
        d = json.loads(texto)
    except Exception as e:
        errores.append('%s: JSON no válido (%s)' % (rel, e))
        return None
    try:
        if serializar(d) != texto:
            errores.append('%s: el formato del archivo no coincide con el del generador; no se toca' % rel)
            return None
    except KeyError as e:
        errores.append('%s: falta el bloque %s' % (rel, e))
        return None
    cab = d['cabecera']
    if cab.get('temporada') != T or cab.get('semana') != S or cab.get('archivo') != nombre:
        errores.append('%s: la cabecera (temporada %s, semana %s, archivo %s) no coincide con el nombre' % (
            rel, cab.get('temporada'), cab.get('semana'), cab.get('archivo')))
        return None
    ixt = d['columnas'].index('Temporada')
    mal = [r[0] for r in d['filas'] if r[ixt] != T]
    if mal:
        errores.append('%s: %d fila(s) con una Temporada distinta de %d (primera N° %s)' % (rel, len(mal), T, mal[0]))
        return None
    if not d['filas']:
        errores.append('%s: no tiene filas; no hay con qué compararlo con el CSV' % rel)
        return None
    return T, S, resto, d, texto


def planear(raiz, delta_pedido):
    errores, avisos = [], []
    por_semana = grupos_del_csv(raiz)
    archivos = sorted(glob.glob(os.path.join(raiz, CARPETA, 'T*', 'T*_S* - *.json')))
    items = []
    for ruta in archivos:
        x = leer_archivo(ruta, errores)
        if not x:
            continue
        T, S, resto, d, texto = x
        ixn = d['columnas'].index('N°')
        ns = {str(r[ixn]) for r in d['filas']}
        mejores = sorted(((len(ns & g) / len(ns), t) for t, g in por_semana.get(S, [])), reverse=True)
        if not mejores or mejores[0][0] < MINIMO:
            errores.append('%s: sus N° no están en ningún grupo de la semana %d del CSV (mejor coincidencia: %s)' % (
                os.path.relpath(ruta), S, '%.0f %%' % (mejores[0][0] * 100) if mejores else 'ninguna'))
            continue
        if len(mejores) > 1 and mejores[1][0] >= MINIMO:
            errores.append('%s: coincide a la vez con las temporadas %d y %d del CSV; no se puede decidir' % (
                os.path.relpath(ruta), mejores[0][1], mejores[1][1]))
            continue
        items.append({'ruta': ruta, 'T': T, 'S': S, 'resto': resto, 'd': d, 'nuevaT': mejores[0][1], 'coinc': mejores[0][0]})
    mover = [i for i in items if i['nuevaT'] != i['T']]
    deltas = sorted({i['nuevaT'] - i['T'] for i in mover})
    if len(deltas) > 1:
        errores.append('los archivos piden deltas distintos (%s); revisar a mano' % deltas)
    elif deltas and delta_pedido is not None and deltas[0] != delta_pedido:
        errores.append('--delta %d no coincide con el que sale del CSV (%d)' % (delta_pedido, deltas[0]))
    if not mover and delta_pedido not in (None, 0):
        avisos.append('ningún archivo pide renombrado (todos ya coinciden con el CSV). Si acabas de reenumerar en Drive, '
                      'primero sube a CSV/Hojas/ el Backup_Guerra.csv nuevo.')
    if not errores:
        destinos = {}
        for i in mover:
            if i['nuevaT'] < 0:
                errores.append('%s: la temporada nueva quedaría negativa (%d)' % (os.path.relpath(i['ruta']), i['nuevaT']))
            i['nuevoNombre'] = 'T%d_S%d - %s.json' % (i['nuevaT'], i['S'], i['resto'])
            i['destino'] = os.path.join(raiz, CARPETA, 'T%d' % i['nuevaT'], i['nuevoNombre'])
            if i['destino'] in destinos:
                errores.append('dos archivos irían a %s' % os.path.relpath(i['destino']))
            destinos[i['destino']] = i
        rutas_a_mover = {i['ruta'] for i in mover}
        for i in mover:
            if os.path.exists(i['destino']) and i['destino'] not in rutas_a_mover:
                errores.append('el destino ya existe y no se va a mover: %s' % os.path.relpath(i['destino']))
            # un archivo con la numeración nueva en la carpeta destino con el mismo prefijo pero otra hora en el nombre
            previos = glob.glob(os.path.join(raiz, CARPETA, 'T%d' % i['nuevaT'], 'T%d_S%d - *.json' % (i['nuevaT'], i['S'])))
            if any(p not in rutas_a_mover and p != i['destino'] for p in previos):
                errores.append('ya hay un T%d_S%d en T%d que no se va a mover: %s' % (
                    i['nuevaT'], i['S'], i['nuevaT'], os.path.relpath(previos[0])))
    # orden que evita pisar: con delta positivo se empieza por la temporada más alta; con negativo, por la más baja
    positivo = bool(deltas) and deltas[0] > 0
    mover.sort(key=lambda i: i['T'], reverse=positivo)
    return items, mover, errores, avisos, (deltas[0] if len(deltas) == 1 else None)


def aplicar(raiz, mover):
    for i in mover:
        d = i['d']
        d['cabecera']['temporada'] = i['nuevaT']
        d['cabecera']['archivo'] = i['nuevoNombre']
        ixt = d['columnas'].index('Temporada')
        for r in d['filas']:
            r[ixt] = i['nuevaT']
        os.makedirs(os.path.dirname(i['destino']), exist_ok=True)
        tmp = i['destino'] + '.tmp'
        with open(tmp, 'w', encoding='utf-8', newline='\n') as f:
            f.write(serializar(d))
        os.replace(tmp, i['destino'])
        os.remove(i['ruta'])
        carpeta_vieja = os.path.dirname(i['ruta'])
        if not os.listdir(carpeta_vieja):
            os.rmdir(carpeta_vieja)
    # tabla de README_Guerra.md (la regenera generar_json_guerra.py; aquí solo se corrigen las filas movidas)
    ruta_readme = os.path.join(raiz, CARPETA, 'README_Guerra.md')
    if os.path.exists(ruta_readme):
        with open(ruta_readme, encoding='utf-8', newline='') as f:
            lineas = f.read().split('\n')
        sin_hallar = []
        for i in mover:
            vieja = '| %d | %d | `T%d/T%d_S%d - %s.json` |' % (i['T'], i['S'], i['T'], i['T'], i['S'], i['resto'])
            nueva = '| %d | %d | `T%d/%s` |' % (i['nuevaT'], i['S'], i['nuevaT'], i['nuevoNombre'])
            hay = [k for k, l in enumerate(lineas) if l.startswith(vieja)]
            if len(hay) != 1:
                sin_hallar.append(i['nuevoNombre'])
                continue
            lineas[hay[0]] = nueva + lineas[hay[0]][len(vieja):]
        with open(ruta_readme, 'w', encoding='utf-8', newline='') as f:
            f.write('\n'.join(lineas))
        if sin_hallar:
            print('AVISO: %d fila(s) del README_Guerra.md no se encontraron (se corrigen al correr generar_json_guerra.py): %s' % (
                len(sin_hallar), ', '.join(sin_hallar)))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    delta_pedido = None
    if '--delta' in sys.argv:
        delta_pedido = int(sys.argv[sys.argv.index('--delta') + 1])
        args = [a for a in args if a != str(delta_pedido)]
    if not args:
        sys.exit(__doc__)
    raiz = args[0]
    items, mover, errores, avisos, delta = planear(raiz, delta_pedido)
    print('archivos semanales leídos: %d | por renombrar: %d | ya coinciden con el CSV: %d' % (len(items), len(mover), len(items) - len(mover)))
    for a in avisos:
        print('AVISO:', a)
    if errores:
        print('NO SE ESCRIBIÓ NADA. Problemas (%d):' % len(errores))
        for e in errores:
            print('  -', e)
        sys.exit(1)
    if not mover:
        print('Nada que renombrar.')
        return
    print('delta deducido del CSV: %+d' % delta)
    for i in mover:
        print('  T%d/T%d_S%d - %s.json  ->  T%d/%s   (coincidencia de N° con el CSV: %.0f %%)' % (
            i['T'], i['T'], i['S'], i['resto'], i['nuevaT'], i['nuevoNombre'], i['coinc'] * 100))
    if '--aplicar' not in sys.argv:
        print('Simulación: no se escribió nada. Para aplicar, vuelve a correr con --aplicar.')
        return
    aplicar(raiz, mover)
    # comprobación: tras aplicar, todo debe coincidir ya con el CSV
    items2, mover2, errores2, _, _ = planear(raiz, None)
    if errores2 or mover2:
        print('ERROR tras aplicar: quedan %d por renombrar y %d problema(s): %s' % (len(mover2), len(errores2), errores2[:3]))
        sys.exit(1)
    print('Hecho: %d archivo(s) renombrados. Ahora todos coinciden con el CSV. Siguiente: python3 generar_json_guerra.py "%s" --solo-verificar' % (len(mover), raiz))


if __name__ == '__main__':
    main()
