#!/usr/bin/env python3
"""Cruce de solo lectura: totales semanales de RoyaleAPI (Correcciones_Guerra.csv) contra
el reparto diario de Backup_Guerra.csv. No modifica nada. Reescrito el 14-oct-2026 porque el
cruce.py anterior se perdio con el directorio de trabajo de la sesion previa.

Modelo (igual que 18_CorreccionGuerra.gs, _fameDescomposicionesDia_):
  dia = (n ataques 0..4, b barcos 0..n, f fame) con f en la tabla de (n, b).
  barco gana 125 / pierde 75; PvP gana 200 / pierde 100; duelo (max 1 por dia, usa 2 o 3 mazos)
  0-2=200, 2-0=500, 1-2=450, 2-1=600.
Registro: AtaquesHoy es diario; AtaquesSemana, Fame y Barcos son ACUMULADOS de la semana.
"""
import csv, sys, collections, itertools, json, os
from functools import lru_cache

REPO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')  # carpeta CSV/
RUTAS = {'Backup_Guerra.csv': 'Hojas', 'Correcciones_Guerra.csv': 'Tampermonkey'}  # subcarpeta de cada CSV desde el 18-oct-2026
OUT = sys.argv[1] if len(sys.argv) > 1 else '.'

BG, BP, PG, PP = 125, 75, 200, 100
DUELOS = [(2, 200), (2, 500), (3, 450), (3, 600)]


@lru_cache(None)
def tabla(n, b):
    """Conjunto de fames posibles de un dia con n ataques y b barcos."""
    if n < 0 or n > 4 or b < 0 or b > n:
        return frozenset()
    opts = [(0, 0)] + [(m, f) for m, f in DUELOS if b + m <= n]
    out = set()
    for m, fd in opts:
        pvp = n - b - m
        for bg in range(b + 1):
            for pg in range(pvp + 1):
                out.add(bg * BG + (b - bg) * BP + pg * PG + (pvp - pg) * PP + fd)
    return frozenset(out)


@lru_cache(None)
def opciones_dia():
    """Todas las (n, b, f) posibles de un dia."""
    return tuple((n, b, f) for n in range(5) for b in range(n + 1) for f in sorted(tabla(n, b)))


def leer(nombre):
    rows = list(csv.reader(open(os.path.join(REPO, RUTAS.get(nombre, ''), nombre), encoding='utf-8')))
    h = rows[0]
    return [dict(zip(h, r[:len(h)])) for r in rows[1:]]


def num(x):
    try:
        return int(float(str(x).replace(',', '').strip()))
    except Exception:
        return 0


def cargar():
    b = leer('Backup_Guerra.csv')
    filas = collections.defaultdict(dict)  # (T,S,Tag,Clan) -> {off: fila}
    for r in b:
        if r['Etapa'] != 'Guerra':
            continue
        off = (num(r['PeriodIndex']) % 7) - 3
        if off < 0 or off > 3:
            continue
        k = (r['Temporada'], r['Semana'], r['Tag'].strip(), r['Clan'])
        prev = filas[k].get(off)
        if prev is None or num(r['PeriodIndex']) > num(prev['PeriodIndex']):
            filas[k][off] = r
    return filas, b


def diarios_registrados(dias):
    """dias: {off: fila} -> lista de 4 tuplas (presente, n, b, f) con b y f como delta del acumulado."""
    res = []
    acb = acf = 0
    for off in range(4):
        r = dias.get(off)
        if r is None:
            res.append((False, 0, 0, 0))
            continue
        n = num(r['AtaquesHoy'])
        cb, cf = num(r['Barcos']), num(r['Fame'])
        res.append((True, n, max(0, cb - acb), max(0, cf - acf)))
        acb, acf = cb, cf
    return res


def primer_fallo(reg):
    """Indice del primer dia presente cuyo (n,b,f) no cabe en la tabla; 4 si todos caben."""
    for off in range(4):
        pres, n, b, f = reg[off]
        if pres and f not in tabla(n, b):
            return off
    return 4


def resolver_desde(reg, A, B, F, desde, ausentes_libres=False):
    """Fija los dias 0..desde-1 como estan en el registro (los ausentes en 0) y busca todos los
    repartos de los dias desde..3 que sumen exactamente A, B, F. Devuelve (optimas, n, dmin)."""
    base = []
    for off in range(desde):
        pres, n, b, f = reg[off]
        base.append((n, b, f) if pres else (0, 0, 0))
    idx_libres = [o for o in range(desde, 4) if reg[o][0] or ausentes_libres]
    fijos_aus = {o: (0, 0, 0) for o in range(desde, 4) if o not in idx_libres}
    sa0 = sum(x[0] for x in base); sb0 = sum(x[1] for x in base); sf0 = sum(x[2] for x in base)
    needA, needB, needF = A - sa0, (None if B is None else B - sb0), F - sf0
    if needA < 0 or needF < 0 or (needB is not None and needB < 0):
        return [], 0, None
    opts = opciones_dia()
    sols = []

    def dfs(i, a, b, f, acc):
        if i == len(idx_libres):
            if a == needA and f == needF and (needB is None or b == needB):
                sols.append(tuple(acc))
            return
        resto = len(idx_libres) - i - 1
        for (n, bb, ff) in opts:
            na, nb, nf = a + n, b + bb, f + ff
            if na > needA or nf > needF or (needB is not None and nb > needB):
                continue
            if na + 4 * resto < needA:
                continue
            acc.append((n, bb, ff)); dfs(i + 1, na, nb, nf, acc); acc.pop()
    dfs(0, 0, 0, 0, [])
    completas = []
    for s_ in sols:
        dias = list(base) + [None] * (4 - desde)
        for o, v in fijos_aus.items():
            dias[o] = v
        for o, v in zip(idx_libres, s_):
            dias[o] = v
        completas.append(tuple(dias))
    if not completas:
        return [], 0, None

    def dist(sol):
        d = 0
        for o in range(4):
            pres, n, b, f = reg[o]
            n2, b2, f2 = sol[o]
            if not pres:
                d += (n2 != 0) + (b2 != 0) + (f2 != 0)
            else:
                d += (n != n2) + (b != b2) + (f != f2)
        return d
    ds = [dist(x) for x in completas]
    m = min(ds)
    return [x for x, d in zip(completas, ds) if d == m], len(completas), m


def resolver(reg, A, B, F):
    """Devuelve (desde_usado, nivel, optimas, n_soluciones, dmin).
    nivel: 'confiables' = solo desde el primer fallo; 'liberando' = hubo que liberar dias anteriores;
    'dias_sin_fila' = hizo falta usar dias sin fila; 'ninguno' = imposible incluso con todo libre."""
    pf = primer_fallo(reg)
    if pf == 4:
        sa = sum(r[1] for r in reg if r[0]); sb = sum(r[2] for r in reg if r[0]); sf = sum(r[3] for r in reg if r[0])
        if sa == A and sf == F and (B is None or sb == B):
            return 4, 'confiables', [tuple((r[1], r[2], r[3]) if r[0] else (0, 0, 0) for r in reg)], 1, 0
    for desde in range(pf, -1, -1):
        opt, n, d = resolver_desde(reg, A, B, F, desde)
        if n:
            return desde, ('confiables' if desde == pf else 'liberando'), opt, n, d
    opt, n, d = resolver_desde(reg, A, B, F, 0, ausentes_libres=True)
    if n:
        return 0, 'dias_sin_fila', opt, n, d
    return 0, 'ninguno', [], 0, None


def main():
    filas, _ = cargar()
    corr = leer('Correcciones_Guerra.csv')
    salida = []
    cuenta = collections.Counter()
    for c in corr:
        ct = c['ClanTag'].strip()
        if not ct:
            continue
        T, S, tag = c['Temporada'], c['Semana'], c['Tag'].strip()
        A = num(c['AtaquesSemana']); F = num(c['Fame'])
        B = None if c['Barcos'].strip() == '' else num(c['Barcos'])
        claves = [k for k in filas if k[0] == T and k[1] == S and k[2] == tag] if False else None
        salida.append((c, T, S, tag, ct, A, B, F))
    # indexar claves por (T,S,Tag) para no recorrer todo
    idx = collections.defaultdict(list)
    for k in filas:
        idx[(k[0], k[1], k[2])].append(k)
    # tag de clan -> nombre (por cruce de tags de jugador no hace falta: se usa el unico clan de la fila si solo hay uno)
    detalle = []
    CLAN_DE_TAG = {'#GCRG8L00': 'Grupo乂Terna™', '#GYCU9YRG': 'GrupoXTerna™2',
                   '#GQQPPJGR': 'GrupoXTerna™3', '#GG99LCJY': 'Mini乂Ternas™'}
    for (c, T, S, tag, ct, A, B, F) in salida:
        nombre = CLAN_DE_TAG.get(ct)
        k = (T, S, tag, nombre)
        if nombre is None or k not in filas:
            cuenta['sin_filas'] += 1
            detalle.append(dict(T=T, S=S, Tag=tag, ClanTag=ct, A=A, B=B, F=F, clase='sin_filas', soluciones=0))
            continue
        reg = diarios_registrados(filas[k])
        libres_desde, nivel, optimas, nsol, dmin = resolver(reg, A, B, F)
        if nsol == 0:
            clase = 'imposible'
        elif dmin == 0 and libres_desde == 4:
            clase = 'sin_cambio'
        elif len(optimas) == 1:
            clase = 'unica'
        else:
            clase = 'ambigua'
        coincide_n = ''
        if clase == 'ambigua':
            ns = {tuple(x[0] for x in s) for s in optimas}
            coincide_n = 'si' if len(ns) == 1 else 'no'
        cuenta[clase] += 1
        cuenta['nivel_' + nivel] += 1
        if clase == 'ambigua':
            cuenta['ambigua_ataques_coinciden_' + coincide_n] += 1
        detalle.append(dict(T=T, S=S, Tag=tag, ClanTag=ct, A=A, B=B, F=F, clase=clase,
                            libres_desde=libres_desde, nivel=nivel, soluciones=nsol, optimas=len(optimas),
                            distancia=dmin, ataques_coinciden=coincide_n))
    print(json.dumps(cuenta, ensure_ascii=False, indent=1))
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, 'cruce_detalle.csv'), 'w', newline='', encoding='utf-8-sig') as fh:
        w = csv.DictWriter(fh, fieldnames=['T', 'S', 'Tag', 'ClanTag', 'A', 'B', 'F', 'clase', 'libres_desde', 'nivel',
                                           'soluciones', 'optimas', 'distancia', 'ataques_coinciden'])
        w.writeheader(); [w.writerow(d) for d in detalle]


if __name__ == '__main__':
    main()
