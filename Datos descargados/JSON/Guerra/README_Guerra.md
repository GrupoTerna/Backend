# JSON de guerra por semana

Generado el 2026-10-19 por `generar_json_guerra.py` a partir de `CSV/Hojas/Backup_Guerra.csv` (Contexto_Base_Web.md §PF123).

Un archivo por semana: `T<temporada>/T<temporada>_S<semana> - <dd-mm-aaaa> <HH.MM>.json`. La fecha y hora del nombre son la **primera hora de registro** de la semana y **no cambian** después (se busca el archivo por el prefijo `T<t>_S<s> - `). Cuando la primera fecha no trae hora, el nombre lleva `00.00`.

Bloques de cada archivo: `cabecera`, `columnas` y `filas` (copia exacta del CSV, sin perder ninguna columna; los enteros van como número y el resto como texto), `diario` (valores del día por jugador y clan con su clave `M_…` de `Diario_C`), `jugador_dia` (lo mismo sumando los clanes del jugador en el día) y `reconstruidos` (lo que el JSON de RoyaleAPI trae de más, solo para el domingo). La `Marca` del diario puede ser `Reconstruido`, `Salto` (falta la fila del día anterior de esa serie: la diferencia incluye más de un día) o `Repetida` (hay más de una fila para ese día; se usó la última).

| Temporada | Semana | Archivo | Filas | Primera hora | Tamaño (KB) |
|---|---|---|---|---|---|
| 1 | 2 | `T1/T1_S2 - 14-05-2026 00.00.json` | 4 | 14-05-2026 00.00 (sin hora) | 3 |
| 2 | 1 | `T2/T2_S1 - 05-06-2026 00.00.json` | 423 | 05-06-2026 00.00 (sin hora) | 115 |
| 2 | 2 | `T2/T2_S2 - 08-06-2026 00.00.json` | 1122 | 08-06-2026 00.00 (sin hora) | 238 |
| 2 | 3 | `T2/T2_S3 - 15-06-2026 00.00.json` | 963 | 15-06-2026 00.00 (sin hora) | 202 |
| 2 | 4 | `T2/T2_S4 - 22-06-2026 00.00.json` | 842 | 22-06-2026 00.00 (sin hora) | 179 |
| 2 | 5 | `T2/T2_S5 - 29-06-2026 00.00.json` | 844 | 29-06-2026 00.00 (sin hora) | 183 |
| 3 | 1 | `T3/T3_S1 - 06-07-2026 00.00.json` | 744 | 06-07-2026 00.00 (sin hora) | 155 |
| 3 | 2 | `T3/T3_S2 - 16-07-2026 00.00.json` | 397 | 16-07-2026 00.00 (sin hora) | 110 |
| 3 | 3 | `T3/T3_S3 - 23-07-2026 00.00.json` | 138 | 23-07-2026 00.00 (sin hora) | 40 |
| 3 | 4 | `T3/T3_S4 - 29-07-2026 00.00.json` | 851 | 29-07-2026 00.00 | 211 |
| 4 | 1 | `T4/T4_S1 - 03-08-2026 00.00.json` | 983 | 03-08-2026 00.00 (sin hora) | 231 |
| 4 | 2 | `T4/T4_S2 - 10-08-2026 00.00.json` | 1012 | 10-08-2026 00.00 | 222 |
| 4 | 3 | `T4/T4_S3 - 17-08-2026 05.01.json` | 955 | 17-08-2026 05.01 | 212 |
| 4 | 4 | `T4/T4_S4 - 24-08-2026 05.01.json` | 950 | 24-08-2026 05.01 | 216 |
| 4 | 5 | `T4/T4_S5 - 31-08-2026 05.01.json` | 947 | 31-08-2026 05.01 | 220 |
| 5 | 1 | `T5/T5_S1 - 07-09-2026 06.01.json` | 803 | 07-09-2026 06.01 | 189 |
| 5 | 2 | `T5/T5_S2 - 14-09-2026 06.01.json` | 881 | 14-09-2026 06.01 | 205 |
| 5 | 3 | `T5/T5_S3 - 21-09-2026 04.41.json` | 862 | 21-09-2026 04.41 | 202 |
| 5 | 4 | `T5/T5_S4 - 28-09-2026 04.58.json` | 837 | 28-09-2026 04.58 | 196 |
| 6 | 1 | `T6/T6_S1 - 05-10-2026 09.08.json` | 747 | 05-10-2026 09.08 | 174 |
| 6 | 2 | `T6/T6_S2 - 12-10-2026 04.39.json` | 720 | 12-10-2026 04.39 | 162 |

Total: 21 archivos, 16025 filas.

Regenerar o verificar: `python3 generar_json_guerra.py "<ruta a Datos descargados>" [--fecha AAAA-MM-DD] [--solo-verificar]`.
