# Tablas semanales de ataques, barcos y medallas

Respaldo enlazado de cuatro niveles. El cálculo al vuelo es la vía rápida; estos archivos son el respaldo.

    Semanal_C  ->  Semanal_D  ->  Diario_C  ->  Diario_D

Esta carpeta (`Informes/Semanal/`) guarda Semanal_C y Semanal_D; `Diario_C.csv` y `Diario_D.csv` están un nivel arriba, en `Informes/`.

Todos llevan la columna `N°` (numeración automática, solo para ubicarte a mano; el código no depende de ella).
El orden de los días no importa: cada reparto se guarda una sola vez, con sus 4 IDs de Diario_C ordenados por texto.
Para asignarlo a días concretos se permutan esos 4 IDs (como máximo 24).

| Archivo | Una fila es | Filas | Para qué |
|---|---|---|---|
| `Semanal_C.csv` | un ID semanal `S_…` | 3196 | Es el mapa: dice en qué tramo y filas de Semanal_D están sus variantes |
| `Semanal_D_01..07.csv` | una variante semanal (4 IDs de Diario_C) | 1.581.580 | Los repartos posibles de ese ID semanal |
| `Diario_C.csv` | un ID diario `M_…` | 77 | `Variantes` = variantes diarias de ese ID |
| `Diario_D.csv` | una combinación diaria concreta | 110 | Enlaza a Diario_C por `ID` |

## Cómo buscar un ID semanal
1. Busca el ID en `Semanal_C.csv` (formato `S_MMMM_A_AA_B_BB`: medallas de 4 dígitos, ataques y barcos de 2).
2. Lee `Tramo`, `Fila_inicial` y `Fila_final`: ahí están todas sus variantes en Semanal_D (el `N°` de Semanal_D es continuo entre tramos).
3. Cada variante trae `C1..C4` (IDs de Diario_C). Si el ID diario tiene `Variantes` = 1 no hace falta abrir Diario_D; si es mayor, filtra Diario_D por ese `ID`.

## Dos tipos de variantes (no son lo mismo)
- `Variantes_semanales` (Semanal_C): sets de 4 IDs diarios que suman ese ID semanal.
- `Variantes` (Diario_C): combinaciones diarias concretas (de Diario_D) dentro de un ID diario.
- `Repartos_D`: repartos totales si se baja hasta Diario_D (por variante en Semanal_D; sumado por ID en Semanal_C).

## Comprobaciones al generar
Suma de `Variantes_semanales` = 1.581.580; suma de `Repartos_D` = 6.438.740; 3196 IDs; máximo 20.025 repartos en `S_1925_A_14_B_05`.
Generador: `generar_semanal.py <carpeta con Diario_C.csv y Diario_D.csv> <carpeta de salida> [MB por tramo]`.
