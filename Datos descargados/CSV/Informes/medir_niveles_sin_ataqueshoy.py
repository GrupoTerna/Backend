# Medición (solo lectura) de §PF490: cuántas series de cada informe «AplicarTotalesSemana_Historial … (informe).csv» se resolvieron en un nivel «sin AtaquesHoy» de 57_.
# Uso (desde esta carpeta): python3 -I medir_niveles_sin_ataqueshoy.py
import csv, glob, collections
for f in sorted(glob.glob('AplicarTotalesSemana_Historial*(informe).csv')):
    try:
        r = list(csv.reader(open(f, encoding='utf-8-sig')))[1:]
    except Exception:
        continue
    if not r or len(r[0]) < 11:
        continue
    sh = [x for x in r if 'sin AtaquesHoy' in x[8]]
    print(f.split('Historial ')[1][:19], 'series', len(r), 'sin AtaquesHoy', len(sh), dict(collections.Counter(x[10] for x in sh)))
