#!/usr/bin/env python3
"""Análisis de las series «Probable error» y «Revisar» de seriesCerosInicialesInforme() (Contexto_Base_Web.md §PF586).
Solo lee; no escribe nada. Uso (desde la raíz del repo Backend):  python3 -I "Consolidados de cambios/analisis_series_ceros_iniciales.py"

Parte del informe «Cruce_CerosIniciales_vs_JSON … (informe).csv» más reciente de Datos descargados/CSV/Informes/Cruce_Meta, busca en
Backup_Guerra.csv las filas en cero de cada serie (Etapa Guerra, Origen «Reconstruido…», AtaquesHoy, Barcos y Fame en 0, en los «Días en cero»)
y las cruza con el Historial (Backup_Historial_I-S.csv). Niveles de evidencia (el primero que cumple):
  N1  el Historial trae un ingreso del jugador a ESE clan en esa temporada y semana, DESPUÉS del último día en cero (el propio Historial contradice el cero);
  N2a la hoja tiene una fila NO reconstruida del mismo jugador, con ataques, barcos o fame, en OTRO clan el mismo día, para TODOS los días en cero;
  N2b lo mismo, pero solo para algunos de los días en cero (el informe lo marca en «Días con dato real en otro clan (hoja)»);
  N3  solo el JSON trae ataques en otro clan que caben en los días previos;
  N4  «Revisar»: señal débil o que no cabe.
"""
import csv
import collections
import datetime
import glob
import io
import os
import sys

BASE = os.path.join('Datos descargados', 'CSV')


def leer(ruta):
    with open(ruta, encoding='utf-8-sig', newline='') as fh:
        filas = list(csv.reader(io.StringIO(fh.read())))
    enc = filas[0]
    return enc, [dict(zip(enc, f)) for f in filas[1:] if f]


def fecha(txt):
    try:
        return datetime.datetime.strptime(txt.strip()[:10], '%d/%m/%Y').date()
    except ValueError:
        return None


def main():
    informes = sorted(glob.glob(os.path.join(BASE, 'Informes', 'Cruce_Meta', 'Cruce_CerosIniciales_vs_JSON * (informe).csv')))
    if not informes:
        sys.exit('No hay informe Cruce_CerosIniciales_vs_JSON en Datos descargados/CSV/Informes/Cruce_Meta. Corre desde la raíz del repo Backend.')
    _, inf = leer(informes[-1])
    _, guerra = leer(os.path.join(BASE, 'Hojas', 'Backup_Guerra.csv'))
    _, hist = leer(os.path.join(BASE, 'Hojas', 'Backup_Historial_I-S.csv'))
    print('Informe:', os.path.basename(informes[-1]), '| Backup_Guerra.csv:', len(guerra), 'filas | Historial I-S:', len(hist), 'filas')
    print('Movimientos del Historial:', dict(collections.Counter(h['Movimiento'] for h in hist)))
    ingresos = collections.defaultdict(list)  # (tag, clan_tag, temporada, semana) -> fechas de ingreso
    for h in hist:
        if h['Movimiento'].lower().startswith(('ingreso', 'reingreso')):
            ingresos[(h['Tag'], h['ClanTag'], h['Temporada'], h['Semana'])].append(fecha(h['Fecha']))
    indice = collections.defaultdict(list)
    for g in guerra:
        indice[(g['Tag'], g['Clan_Tag'], g['Temporada'], g['Semana'])].append(g)
    guerra_por_jugador = collections.defaultdict(list)
    for g in guerra:
        guerra_por_jugador[(g['Tag'], g['Temporada'], g['Semana'])].append(g)
    niveles = collections.Counter()
    filas_por_nivel = collections.Counter()
    pendientes = collections.Counter()
    detalle = []
    for s in inf:
        if s['Veredicto'] not in ('Probable error', 'Revisar'):
            continue
        clave = (s['Tag'], s['Clan_Tag'], s['Temporada'], s['Semana'])
        dias = [d.strip() for d in s['Días en cero'].split(',') if d.strip()]
        ceros = [g for g in indice[clave] if g['Día'] in dias and g['Etapa'] == 'Guerra' and g['Origen'].startswith('Reconstruido')
                 and g['AtaquesHoy'] in ('0', '') and g['Barcos'] in ('0', '') and g['Fame'] in ('0', '')]
        if not ceros:
            pendientes['ya no están en Backup_Guerra.csv'] += 1
            continue
        ultimo = max(fecha(g['Fecha']) for g in ceros if fecha(g['Fecha']))
        ing = [f for f in ingresos.get(clave, []) if f]
        if s['Veredicto'] == 'Revisar':
            nivel = 'N4'
        elif any(f > ultimo for f in ing):
            nivel = 'N1'
        elif s['Días con dato real en otro clan (hoja)'].strip():
            otras = [o for o in guerra_por_jugador[(s['Tag'], s['Temporada'], s['Semana'])]
                     if o['Clan_Tag'] != s['Clan_Tag'] and o['Etapa'] == 'Guerra' and not o['Origen'].startswith('Reconstruido')
                     and any(o[c] not in ('', '0') for c in ('AtaquesHoy', 'Barcos', 'Fame'))]
            dias_otra = {o['Día'] for o in otras}
            nivel = 'N2a' if all(g['Día'] in dias_otra for g in ceros) else 'N2b'
        else:
            nivel = 'N3'
        niveles[nivel] += 1
        filas_por_nivel[nivel] += len(ceros)
        detalle.append((nivel, s['Temporada'], s['Semana'], s['Clan'], s['Tag'], ','.join(dias), len(ceros)))
    print('Series analizadas: %d (sin filas en cero hoy: %d)' % (sum(niveles.values()), pendientes['ya no están en Backup_Guerra.csv']))
    for n in ('N1', 'N2a', 'N2b', 'N3', 'N4'):
        print('  %s: %d series, %d filas en cero' % (n, niveles[n], filas_por_nivel[n]))
    print('  Total filas en cero:', sum(filas_por_nivel.values()), '| jugadores distintos:', len({d[4] for d in detalle}))
    if '--detalle' in sys.argv:
        for d in sorted(detalle):
            print(*d, sep=' | ')


if __name__ == '__main__':
    main()
