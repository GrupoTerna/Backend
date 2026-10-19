# Genera Semanal_C y Semanal_D a partir de Diario_C.csv (77 filas) y Diario_D.csv (110 filas).
# Uso: python3 generar_semanal.py <carpeta_con_Diario_C.csv_y_Diario_D.csv> <carpeta_salida> [MB_por_tramo]
import csv, sys, os
from itertools import combinations_with_replacement
from math import comb
from collections import defaultdict

entrada, salida = sys.argv[1], sys.argv[2]
MB = float(sys.argv[3]) if len(sys.argv) > 3 else 20
os.makedirs(salida, exist_ok=True)

def leer(nombre):
    with open(os.path.join(entrada, nombre), encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f))

dc, dd = leer('Diario_C.csv'), leer('Diario_D.csv')
assert len(dc) == 77 and len(dd) == 110, (len(dc), len(dd))
# comprobar que las variantes de Diario_C coinciden con las filas de Diario_D
cuenta = defaultdict(int)
for r in dd: cuenta[r['ID']] += 1
for r in dc: assert cuenta[r['ID']] == int(r['Variantes']), r['ID']
assert sum(int(r['Variantes']) for r in dc) == 110

# IDs diarios ordenados por texto: los 4 IDs de cada variante van siempre en este orden
dc.sort(key=lambda r: r['ID'])
ids = [r['ID'] for r in dc]
med = [int(r['Medallas']) for r in dc]
ata = [int(r['Ataques']) for r in dc]
bar = [int(r['Barcos']) for r in dc]
var = [int(r['Variantes']) for r in dc]

def idsem(m, a, b): return 'S_%04d_A_%02d_B_%02d' % (m, a, b)

def repartosD(t):  # cuántos repartos con Diario_D caen en esta variante (multiconjuntos de variantes diarias)
    n, rep = 1, defaultdict(int)
    for i in t: rep[i] += 1
    for i, m in rep.items(): n *= comb(var[i] + m - 1, m)
    return n

grupos = defaultdict(list)
for t in combinations_with_replacement(range(77), 4):
    k = idsem(sum(med[i] for i in t), sum(ata[i] for i in t), sum(bar[i] for i in t))
    grupos[k].append(t)
claves = sorted(grupos)
tot_var = sum(len(v) for v in grupos.values())
tot_D = sum(repartosD(t) for v in grupos.values() for t in v)
print('IDs semanales:', len(claves), '| variantes:', tot_var, '| repartos D:', tot_D)
assert len(claves) == 3196 and tot_var == 1581580 and tot_D == 6438740

# Semanal_D en tramos, con N° continuo entre tramos
lim = int(MB * 1024 * 1024)
cab = ['N°', 'ID_Semanal', 'Variante', 'C1', 'C2', 'C3', 'C4', 'Repartos_D']
tramos, n, f, w, tam, tr, info = [], 0, None, None, 0, 0, {}
def abrir():
    global f, w, tam, tr
    tr += 1
    nombre = 'Semanal_D_%02d.csv' % tr
    f = open(os.path.join(salida, nombre), 'w', encoding='utf-8-sig', newline='')
    w = csv.writer(f, lineterminator='\r\n'); w.writerow(cab)
    tam = 0; tramos.append([nombre, None, None, None, None, 0])
    return nombre
nombre = abrir()
for k in claves:
    lista = grupos[k]
    # no partir un ID semanal entre dos tramos
    est = len(lista) * 70
    if tam + est > lim and tam > 0:
        f.close(); tramos[-1][5] = tam; nombre = abrir()
    ini = n + 1
    for j, t in enumerate(lista, 1):
        n += 1
        fila = [n, k, j] + [ids[i] for i in t] + [repartosD(t)]
        w.writerow(fila); tam += sum(len(str(x)) + 1 for x in fila) + 2
    info[k] = (nombre, ini, n, len(lista), sum(repartosD(t) for t in lista))
    if tramos[-1][1] is None: tramos[-1][1] = k
    tramos[-1][2] = k; tramos[-1][3] = ini if tramos[-1][3] is None else tramos[-1][3]; tramos[-1][4] = n
f.close(); tramos[-1][5] = tam

# Semanal_C
with open(os.path.join(salida, 'Semanal_C.csv'), 'w', encoding='utf-8-sig', newline='') as g:
    w = csv.writer(g, lineterminator='\r\n')
    w.writerow(['N°', 'ID_Semanal', 'Medallas', 'Ataques', 'Barcos', 'Variantes_semanales', 'Repartos_D', 'Tramo', 'Fila_inicial', 'Fila_final'])
    for i, k in enumerate(claves, 1):
        m, a, b = int(k[2:6]), int(k[9:11]), int(k[14:16])
        nom, ini, fin, nv, rd = info[k]
        w.writerow([i, k, m, a, b, nv, rd, nom, ini, fin])
for t in tramos: print(t[0], t[1], '->', t[2], 'filas', t[3], '-', t[4])
