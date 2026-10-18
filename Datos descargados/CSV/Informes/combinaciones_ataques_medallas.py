#!/usr/bin/env python3
"""Genera combinaciones_ataques_medallas.csv (solo lectura; no toca ningun dato del sistema).

Copia la logica de _fameDescomposicionesDia_() (Base/src/18_CorreccionGuerra.gs, bloque §18B004):
  - Por dia (jugador, sumando todos sus clanes): n ataques (0 a 4), b de ellos a barcos, el resto PvP,
    como maximo UN duelo por dia (2 o 3 mazos).
  - Medallas: barco gana 125 / pierde 75; PvP gana 200 / pierde 100; duelo 0-2=200, 2-0=500, 1-2=450, 2-1=600.
Por semana: suma de los 4 dias de guerra (jueves, viernes, sabado, domingo): hasta 16 ataques y 3600 medallas.

Columnas: Periodo (Dia|Semana), Ataques, Barcos, Medallas, Variantes, Detalle.
  Dia:    Variantes = formas distintas de llegar a esa cifra; Detalle = esas formas.
  Semana: Variantes = repartos distintos (J,V,S,D) de cifras diarias (ataques-barcos-medallas) que dan esa cifra
          semanal; Detalle queda vacio (seria enorme).
"""
import csv, os
from collections import defaultdict

PVP_G, PVP_P, BAR_G, BAR_P = 200, 100, 125, 75
DUELOS = [("0-2", 2, 200), ("2-0", 2, 500), ("1-2", 3, 450), ("2-1", 3, 600)]
MAZOS_DIA, DIAS = 4, 4

def descomposiciones(n, b):
    if n < 0 or n > MAZOS_DIA or b < 0 or b > n:
        return []
    ops = [(None, 0, 0)] + [d for d in DUELOS if b + d[1] <= n]
    out = []
    for et, mz, fd in ops:
        pvp = n - b - mz
        for bg in range(b + 1):
            for pg in range(pvp + 1):
                fame = bg*BAR_G + (b-bg)*BAR_P + pg*PVP_G + (pvp-pg)*PVP_P + fd
                partes = []
                if b: partes.append(f"barcos {bg}G-{b-bg}P")
                if pvp: partes.append(f"PvP {pg}G-{pvp-pg}P")
                if et: partes.append(f"duelo {et}")
                out.append((fame, " + ".join(partes) if partes else "sin ataques"))
    return out

# estados del dia: (n, b, fame) -> lista de detalles
dia = defaultdict(list)
for n in range(MAZOS_DIA + 1):
    for b in range(n + 1):
        for fame, det in descomposiciones(n, b):
            dia[(n, b, fame)].append(det)

# semana: conteo de secuencias ordenadas de 4 dias por (A, B, F)
sem = {(0, 0, 0): 1}
for _ in range(DIAS):
    nuevo = defaultdict(int)
    for (A, B, F), c in sem.items():
        for (n, b, f) in dia:
            nuevo[(A+n, B+b, F+f)] += c
    sem = nuevo

aqui = os.path.dirname(os.path.abspath(__file__))
ruta = os.path.join(aqui, "combinaciones_ataques_medallas.csv")
with open(ruta, "w", newline="", encoding="utf-8-sig") as fh:
    w = csv.writer(fh)
    w.writerow(["Periodo", "Ataques", "Barcos", "Medallas", "Variantes", "Detalle"])
    for (n, b, f) in sorted(dia):
        det = sorted(set(dia[(n, b, f)]))
        w.writerow(["Dia", n, b, f, len(dia[(n, b, f)]), " | ".join(det)])
    for (A, B, F) in sorted(sem):
        w.writerow(["Semana", A, B, F, sem[(A, B, F)], ""])

print("Dia:", len(dia), "filas; Semana:", len(sem), "filas")
print("Maximo dia:", max(f for _, _, f in dia), "| maximo semana:", max(F for _, _, F in sem),
      "| ataques maximos semana:", max(A for A, _, _ in sem))
