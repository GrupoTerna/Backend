#!/usr/bin/env python3
"""Modelo de solo lectura para los dias con mas de 4 ataques (pregunta e). No modifica nada.
Reutiliza la tabla de fame de cruce.py. Regla acordada el 14-oct-2026:
 - reparto dentro de la misma semana, jugador y clan (jueves a domingo);
 - si falta el jueves, sus ataques salen de la fila del viernes (AtaquesSemana - AtaquesHoy);
 - si solo hay fila del jueves, se reconstruyen viernes, sabado y domingo;
 - se escribe solo lo que coincide en todas las soluciones (decision a); lo demas, revision manual.
Se parte de los ACUMULADOS (AtaquesSemana, Fame, Barcos) de cada fila: AtaquesHoy no es confiable
(en 5 casos de T3 S4 vale 0 mientras el acumulado sube)."""
import csv, sys, os, collections, json
sys.path.insert(0, '/home/claude/backend/Datos descargados/CSV/Informes')
import cruce as C

OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
CAP = 5000

def segmentos(dias):
    """dias: {off: fila}. Devuelve lista de dicts(dias=[...], A,B,F deltas, reg=[(n,b,f) por dia o None])."""
    offs = sorted(dias)
    cps = []
    for o in offs:
        r = dias[o]
        cps.append((o, C.num(r['AtaquesSemana']), C.num(r['Barcos']), C.num(r['Fame']), C.num(r['AtaquesHoy'])))
    segs = []; pa = pb = pf = 0; po = -1
    for (o, a, b, f, hoy) in cps:
        segs.append(dict(dias=list(range(po + 1, o + 1)), A=a - pa, B=b - pb, F=f - pf, hoy=hoy, off_fila=o))
        pa, pb, pf, po = a, b, f, o
    return segs

def faltante_jueves(segs, dias):
    """Regla de la usuaria: si falta el jueves y la primera fila es viernes, jueves = acumulado viernes - hoy viernes."""
    s0 = segs[0]
    if s0['dias'] == [0, 1] and s0['off_fila'] == 1:
        n_vie = s0['hoy']; a_acum = s0['A']
        n_jue = a_acum - n_vie
        return n_jue if 0 <= n_jue <= 4 else None
    return None

def soluciones_segmento(k, A, B, F, limite_n=None, fijo_n0=None):
    """Todas las (n,b,f) por dia para k dias con sumas exactas. fijo_n0: ataques del primer dia fijados."""
    opts = C.opciones_dia(); sols = []
    def dfs(i, a, b, f, acc):
        if len(sols) > CAP: return
        if i == k:
            if a == A and b == B and f == F: sols.append(tuple(acc))
            return
        resto = k - i - 1
        for (n, bb, ff) in opts:
            if i == 0 and fijo_n0 is not None and n != fijo_n0: continue
            na, nb, nf = a + n, b + bb, f + ff
            if na > A or nb > B or nf > F: continue
            if na + 4 * resto < A: continue
            acc.append((n, bb, ff)); dfs(i + 1, na, nb, nf, acc); acc.pop()
    dfs(0, 0, 0, 0, [])
    return sols

def es_cero(s):
    return s['A'] == 0 and s['B'] == 0 and s['F'] == 0

def resolver(dias):
    """Recorre las filas en orden. Si un tramo no cabe en sus dias, se prueban coberturas que absorben
    filas vecinas con delta cero (posibles filas viejas) o extienden hasta el domingo; se elige la de menos
    dias extra y, si hay varias con los mismos dias extra, se unen sus soluciones (cobertura ambigua)."""
    segs = segmentos(dias)
    nj = faltante_jueves(segs, dias)
    out = []; notas = []; i = 0
    while i < len(segs):
        s = segs[i]
        fijo = nj if (i == 0 and nj is not None and s['dias'][0] == 0) else None
        sols = soluciones_segmento(len(s['dias']), s['A'], s['B'], s['F'], fijo_n0=fijo)
        if sols:
            out.append(dict(dias=list(s['dias']), sols=sols, zero=es_cero(s), A=s['A'], F=s['F'])); i += 1; continue
        # candidatos
        back_max = 0
        while back_max < len(out) and out[-1 - back_max]['zero']: back_max += 1
        sig = 0
        while i + 1 + sig < len(segs) and es_cero(segs[i + 1 + sig]): sig += 1
        fin_ok = (i + 1 + sig == len(segs))
        cands = []
        for m in range(back_max + 1):
            for f in range(sig + 1):
                for dom in ([False, True] if (fin_ok and f == sig) else [False]):
                    dd = []
                    for it in out[len(out) - m:]: dd += it['dias']
                    dd += s['dias']
                    for t in segs[i + 1:i + 1 + f]: dd += t['dias']
                    if dom and dd[-1] < 3: dd += list(range(dd[-1] + 1, 4))
                    elif dom: continue
                    extra = len(dd) - len(s['dias'])
                    cands.append((extra, m, f, dom, dd))
        cands.sort(key=lambda x: x[0])
        elegido = None
        for extra in sorted({c[0] for c in cands}):
            fact = []
            for (e, m, f, dom, dd) in [c for c in cands if c[0] == extra]:
                fijo2 = nj if (dd[0] == 0 and nj is not None) else None
                ss = soluciones_segmento(len(dd), s['A'], s['B'], s['F'], fijo_n0=fijo2)
                if ss: fact.append((m, f, dom, dd, ss))
            if fact: elegido = (extra, fact); break
        if elegido is None:
            return dict(clase='imposible', notas=notas, segs=segs)
        extra, fact = elegido
        if len(fact) > 1: notas.append('cobertura_ambigua')
        if any(x[0] for x in fact): notas.append('absorbe_fila_vieja')
        if any(x[2] for x in fact) or any(x[1] for x in fact): notas.append('extiende_adelante')
        span = sorted({d for x in fact for d in x[3]})
        uni = set()
        for (m, f, dom, dd, ss) in fact:
            for z in ss:
                mp = dict(zip(dd, z)); uni.add(tuple(mp.get(d, (0, 0, 0)) for d in span))
        mmax = max(x[0] for x in fact); fmax = max(x[1] for x in fact)
        for _ in range(mmax): out.pop()
        out.append(dict(dias=span, sols=sorted(uni), zero=False, A=s['A'], F=s['F']))
        i += 1 + fmax
    return dict(clase='ok', notas=sorted(set(notas)), hechos=[(it, it['sols']) for it in out])

def main():
    filas, _ = C.cargar()
    casos = {k: v for k, v in filas.items() if any(C.num(r['AtaquesHoy']) > 4 for r in v.values())}
    cuenta = collections.Counter(); det = []
    for k, dias in sorted(casos.items()):
        T, S, tag, clan = k
        patron = ''.join('JVSD'[o] for o in sorted(dias))
        res = resolver(dias)
        if res['clase'] == 'imposible':
            cuenta['imposible'] += 1; cuenta['patron_' + patron + '_imposible'] += 1
            det.append(dict(T=T, S=S, Tag=tag, Clan=clan, filas=patron, clase='imposible', soluciones='', ataques_coinciden='', notas='|'.join(res['notas']))); continue
        total = 1; ataques_unicos = True; fame_unica = True; unico = True; truncado = False
        for s, sols in res['hechos']:
            total *= len(sols)
            if len(sols) > CAP: truncado = True
            if len({tuple(x[0] for x in z) for z in sols}) > 1: ataques_unicos = False
            if len({tuple(x[2] for x in z) for z in sols}) > 1: fame_unica = False
            if len(sols) > 1: unico = False
        clase = 'unica' if unico else ('ambigua_ataques_coinciden' if ataques_unicos else 'ambigua')
        cuenta[clase] += 1; cuenta['patron_' + patron + '_' + clase] += 1
        det.append(dict(T=T, S=S, Tag=tag, Clan=clan, filas=patron, clase=clase, soluciones=total, ataques_coinciden='si' if ataques_unicos else 'no', notas='|'.join(res['notas'] + (['truncado'] if truncado else []))))
    print(json.dumps(dict(sorted(cuenta.items())), ensure_ascii=False, indent=1))
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, 'cruce_exceso_detalle.csv'), 'w', newline='', encoding='utf-8-sig') as fh:
        w = csv.DictWriter(fh, fieldnames=['T', 'S', 'Tag', 'Clan', 'filas', 'clase', 'soluciones', 'ataques_coinciden', 'notas'])
        w.writeheader(); [w.writerow(d) for d in det]

if __name__ == '__main__':
    main()
