#!/usr/bin/env python3
"""Contraste de las defensas de barco contra los periodLogs de los JSON de CurrentRiverRace.

Reproduce el contraste de Contexto_Base_Web.md §PF585 (puntos 3, 6 y 9). Solo lee; no escribe nada.
Uso (desde la raíz del repo Backend):  python3 -I "Consolidados de cambios/contraste_defensas_riverrace.py"

Método (el mismo de §PF585 punto 3):
  - Fuente: Datos descargados/JSON/Endpoints/CurrentRiverRace/<carpeta del clan>/T-xx/S-xx/*.json
    (se omite Capturas_Continuas: sus nombres no traen el mismo formato de fecha).
  - Cada archivo repite el historial de toda la temporada, así que se deduplica por
    (carpeta, temporada, tag del clan, periodIndex) tomando la lectura más reciente.
  - La temporada se distingue por la cronología (cada vez que el periodIndex del archivo retrocede
    dentro de una carpeta empieza una temporada nueva), NO por la etiqueta T-xx.
  - periodIndex % 7: 3 = jueves, 4 = viernes, 5 = sábado, 6 = domingo (días de guerra).
"""
import collections
import itertools
import json
import os
import re
import sys

RAIZ = os.path.join('Datos descargados', 'JSON', 'Endpoints', 'CurrentRiverRace')
PUNTOS = [59, 53, 47, 43, 41, 37, 31, 29, 23, 19, 17, 13, 11, 7, 5]  # puestos 1 a 15; suman 435
PAT_PI = re.compile(r'P\.I-(\d+)')
PAT_FECHA = re.compile(r'(\d{2})-(\d{2})-(\d{4}) (\d{2})\.(\d{2})')


def archivos():
    """Devuelve {carpeta: [(fecha, ruta)]} ordenado por fecha, sin Capturas_Continuas."""
    por = collections.defaultdict(list)
    for carpeta in sorted(os.listdir(RAIZ)):
        if carpeta == 'Capturas_Continuas':
            continue
        for r, _, fs in os.walk(os.path.join(RAIZ, carpeta)):
            for f in fs:
                m = PAT_FECHA.search(f)
                if f.endswith('.json') and m:
                    d, mo, y, h, mi = map(int, m.groups())
                    por[carpeta].append(((y, mo, d, h, mi), os.path.join(r, f)))
    for c in por:
        por[c].sort()
    return por


def leer():
    """Una lectura por (carpeta, temporada, tag, periodIndex): la más reciente. También cuenta conflictos."""
    base = {}
    conflictos = {}  # clave -> campos que difieren entre copias
    lecturas = 0
    carreras = set()
    for carpeta, lista in archivos().items():
        temporada, ultimo = 0, None
        for fecha, ruta in lista:
            try:
                with open(ruta, encoding='utf-8') as fh:
                    d = json.load(fh)
            except (OSError, ValueError):
                continue
            pi_arch = d.get('periodIndex')
            if pi_arch is None:
                m = PAT_PI.search(ruta)
                pi_arch = int(m.group(1)) if m else None
            if pi_arch is not None:
                if ultimo is not None and pi_arch < ultimo:
                    temporada += 1
                ultimo = pi_arch
            carreras.add((carpeta, temporada))
            for log in d.get('periodLogs') or []:
                pi = log.get('periodIndex')
                for it in log.get('items') or []:
                    tag = (it.get('clan') or {}).get('tag')
                    if tag is None or pi is None:
                        continue
                    lecturas += 1
                    clave = (carpeta, temporada, tag, pi)
                    reg = {k: it.get(k) for k in ('pointsEarned', 'progressStartOfDay', 'progressEndOfDay',
                                                  'endOfDayRank', 'progressEarned',
                                                  'numOfDefensesRemaining', 'progressEarnedFromDefenses')}
                    if clave in base and base[clave][1] != reg:
                        conflictos.setdefault(clave, set()).update(
                            k for k in reg if reg[k] != base[clave][1][k])
                    base[clave] = (fecha, reg)  # las lecturas llegan en orden cronológico: queda la más reciente
    return base, conflictos, lecturas, carreras


def tabla_sumas():
    """{n: {suma: cantidad de subconjuntos de n puestos distintos}} (mochila 0/1)."""
    t = collections.defaultdict(collections.Counter)
    for n in range(16):
        for c in itertools.combinations(PUNTOS, n):
            t[n][sum(c)] += 1
    return t


def main():
    if not os.path.isdir(RAIZ):
        sys.exit('No encuentro ' + RAIZ + '. Corre el script desde la raíz del repo Backend.')
    base, conflictos, lecturas, carreras = leer()
    suma = tabla_sumas()
    menores = {n: sum(sorted(PUNTOS)[:n]) for n in range(16)}
    filas = {k: v[1] for k, v in base.items()}
    solo_puesto = sum(1 for c in conflictos.values() if c == {'endOfDayRank'})
    en_defensas = sum(1 for c in conflictos.values() if c & {'numOfDefensesRemaining', 'progressEarnedFromDefenses'})
    print('Clan-días únicos: %d (clanes %d, carreras %d, lecturas %d)'
          % (len(filas), len({k[2] for k in filas}), len(carreras), lecturas))
    print('Con copias distintas: %d (solo cambia el puesto provisional: %d; cambian las defensas: %d)'
          % (len(conflictos), solo_puesto, en_defensas))

    # (a) pares imposibles
    imposibles = ncero = n15 = 0
    por14 = collections.Counter()
    unica = unica_menores = 0
    for r in filas.values():
        n, p = r['numOfDefensesRemaining'], r['progressEarnedFromDefenses']
        if not isinstance(n, int) or not isinstance(p, int) or not 0 <= n <= 15 or suma[n][p] == 0:
            imposibles += 1
            continue
        ncero += (n == 0)
        n15 += (n == 15)
        if n == 14:
            por14[p] += 1
        if suma[n][p] == 1 and n != 15:  # con 15 la combinación es trivial; §PF585 punto 3 (c) no las cuenta
            unica += 1
            unica_menores += (p == menores[n])
    print('(a) pares imposibles: %d de %d; con 0 restantes: %d; con 15: %d' % (imposibles, len(filas), ncero, n15))
    print('(b) con 14 restantes: %d casos, %d valores distintos: %s'
          % (sum(por14.values()), len(por14), sorted(por14.items(), key=lambda x: -x[1])[:15]))
    print('(c) con una sola combinación posible (sin las de 15 en pie): %d; faltan exactamente las de más puntos: %d (%.1f %%)'
          % (unica, unica_menores, 100.0 * unica_menores / unica if unica else 0))

    # (d) series semanales (solo días de guerra: periodIndex % 7 de 3 a 6)
    series = collections.defaultdict(dict)
    for (carpeta, temp, tag, pi), r in filas.items():
        if 3 <= pi % 7 <= 6:
            series[(carpeta, temp, tag, pi // 7)][pi] = r
    largas = {k: [v[i] for i in sorted(v)] for k, v in series.items() if len(v) >= 2}
    suben = 0
    for dias in largas.values():
        for a, b in zip(dias, dias[1:]):
            if (b['numOfDefensesRemaining'] or 0) > (a['numOfDefensesRemaining'] or 0) or \
               (b['progressEarnedFromDefenses'] or 0) > (a['progressEarnedFromDefenses'] or 0):
                suben += 1
                break
    print('(d) series con 2 o más días de guerra: %d; en las que la cantidad o los puntos suben: %d' % (len(largas), suben))

    # (e) jueves
    jueves = [r for (c, t, g, pi), r in filas.items() if pi % 7 == 3]
    print('(e) jueves: %d clan-días; con las 15 en pie: %d (%.1f %%)'
          % (len(jueves), sum(1 for r in jueves if r['numOfDefensesRemaining'] == 15),
             100.0 * sum(1 for r in jueves if r['numOfDefensesRemaining'] == 15) / len(jueves)))

    # (f) identidad del avance
    cumplen = fallan = fallan_no10000 = 0
    for r in filas.values():
        try:
            ok = r['progressEndOfDay'] == r['progressStartOfDay'] + r['progressEarned'] + r['progressEarnedFromDefenses']
        except TypeError:
            continue
        if ok:
            cumplen += 1
        else:
            fallan += 1
            fallan_no10000 += (r['progressEndOfDay'] != 10000)
    print('(f) identidad progressEnd = Start + Earned + FromDefenses: cumple %d, no cumple %d (de ellas con End distinto de 10000: %d)'
          % (cumplen, fallan, fallan_no10000))

    # §PF585 punto 6: clan que ya cruzó
    cruzo = [r for r in filas.values() if r['endOfDayRank'] == -1]
    ceros = sum(1 for r in cruzo if not (r['pointsEarned'] or r['progressEarned'] or
                                          r['numOfDefensesRemaining'] or r['progressEarnedFromDefenses']))
    print('(6) días con endOfDayRank -1: %d; con puntos, premio, defensas y premio de defensas en 0: %d' % (len(cruzo), ceros))
    posteriores = posteriores_cero = 0
    for dias in largas.values():
        cruzado = False
        for r in dias:
            if cruzado:
                posteriores += 1
                posteriores_cero += (not (r['pointsEarned'] or r['numOfDefensesRemaining'] or r['progressEarnedFromDefenses']))
            if r['progressEndOfDay'] is not None and r['progressEndOfDay'] >= 10000:
                cruzado = True
    print('(6) días posteriores al día en que el avance llega a 10000: %d; en 0 en puntos y defensas: %d' % (posteriores, posteriores_cero))


if __name__ == '__main__':
    main()
