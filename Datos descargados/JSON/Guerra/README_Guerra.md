# JSON de guerra por semana

Generado el 2026-10-19 por `generar_json_guerra.py` a partir de `CSV/Hojas/Backup_Guerra.csv` (Contexto_Base_Web.md §PF123).

Un archivo por semana: `T<temporada>/T<temporada>_S<semana> - <dd-mm-aaaa> <HH.MM>.json`. La fecha y hora del nombre son la **primera hora de registro** de la semana y **no cambian** después (se busca el archivo por el prefijo `T<t>_S<s> - `). Cuando la primera fecha no trae hora, el nombre lleva `00.00`.

Bloques de cada archivo: `cabecera`, `columnas` y `filas` (copia exacta del CSV, sin perder ninguna columna; los enteros van como número y el resto como texto), `diario` (valores del día por jugador y clan con su clave `M_…` de `Diario_C`), `jugador_dia` (lo mismo sumando los clanes del jugador en el día) y `reconstruidos` (lo que el JSON de RoyaleAPI trae de más, solo para el domingo). La `Marca` del diario puede ser `Reconstruido`, `Salto` (falta la fila del día anterior de esa serie: la diferencia incluye más de un día) o `Repetida` (hay más de una fila para ese día; se usó la última).

| Temporada | Semana | Archivo | Filas | Primera hora | Tamaño (KB) |
|---|---|---|---|---|---|
| 5 | 2 | `T5/T5_S2 - 14-05-2026 00.00.json` | 4 | 14-05-2026 00.00 (sin hora) | 3 |
| 6 | 1 | `T6/T6_S1 - 05-06-2026 00.00.json` | 423 | 05-06-2026 00.00 (sin hora) | 115 |
| 6 | 2 | `T6/T6_S2 - 08-06-2026 00.00.json` | 1122 | 08-06-2026 00.00 (sin hora) | 238 |
| 6 | 3 | `T6/T6_S3 - 15-06-2026 00.00.json` | 963 | 15-06-2026 00.00 (sin hora) | 202 |
| 6 | 4 | `T6/T6_S4 - 22-06-2026 00.00.json` | 842 | 22-06-2026 00.00 (sin hora) | 179 |
| 6 | 5 | `T6/T6_S5 - 29-06-2026 00.00.json` | 844 | 29-06-2026 00.00 (sin hora) | 183 |
| 7 | 1 | `T7/T7_S1 - 06-07-2026 00.00.json` | 744 | 06-07-2026 00.00 (sin hora) | 155 |
| 7 | 2 | `T7/T7_S2 - 16-07-2026 00.00.json` | 397 | 16-07-2026 00.00 (sin hora) | 110 |
| 7 | 3 | `T7/T7_S3 - 23-07-2026 00.00.json` | 138 | 23-07-2026 00.00 (sin hora) | 40 |
| 7 | 4 | `T7/T7_S4 - 29-07-2026 00.00.json` | 851 | 29-07-2026 00.00 | 211 |
| 8 | 1 | `T8/T8_S1 - 03-08-2026 00.00.json` | 983 | 03-08-2026 00.00 (sin hora) | 231 |
| 8 | 2 | `T8/T8_S2 - 10-08-2026 00.00.json` | 1012 | 10-08-2026 00.00 | 222 |
| 8 | 3 | `T8/T8_S3 - 17-08-2026 05.01.json` | 955 | 17-08-2026 05.01 | 212 |
| 8 | 4 | `T8/T8_S4 - 24-08-2026 05.01.json` | 950 | 24-08-2026 05.01 | 216 |
| 8 | 5 | `T8/T8_S5 - 31-08-2026 05.01.json` | 947 | 31-08-2026 05.01 | 220 |
| 9 | 1 | `T9/T9_S1 - 07-09-2026 06.01.json` | 803 | 07-09-2026 06.01 | 189 |
| 9 | 2 | `T9/T9_S2 - 14-09-2026 06.01.json` | 881 | 14-09-2026 06.01 | 205 |
| 9 | 3 | `T9/T9_S3 - 21-09-2026 04.41.json` | 862 | 21-09-2026 04.41 | 202 |
| 9 | 4 | `T9/T9_S4 - 28-09-2026 04.58.json` | 837 | 28-09-2026 04.58 | 196 |
| 10 | 1 | `T10/T10_S1 - 05-10-2026 09.08.json` | 747 | 05-10-2026 09.08 | 174 |
| 10 | 2 | `T10/T10_S2 - 12-10-2026 04.39.json` | 720 | 12-10-2026 04.39 | 162 |

Total: 21 archivos, 16025 filas.

Regenerar o verificar: `python3 generar_json_guerra.py "<ruta a Datos descargados>" [--fecha AAAA-MM-DD] [--solo-verificar]`.
