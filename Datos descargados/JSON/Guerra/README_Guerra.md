# JSON de guerra por semana

Generado el 2026-10-25 por `generar_json_guerra.py` a partir de `CSV/Hojas/Backup_Guerra.csv` (Contexto_Base_Web.md §PF123).

Un archivo por semana: `T<temporada>/T<temporada>_S<semana> - <dd-mm-aaaa> <HH.MM>.json`. La fecha y hora del nombre son la **primera hora de registro** de la semana y **no cambian** después (se busca el archivo por el prefijo `T<t>_S<s> - `). Cuando la primera fecha no trae hora, el nombre lleva `00.00`.

Bloques de cada archivo: `cabecera`, `columnas` y `filas` (copia exacta del CSV, sin perder ninguna columna; los enteros van como número y el resto como texto), `diario` (valores del día por jugador y clan con su clave `M_…` de `Diario_C`), `jugador_dia` (lo mismo sumando los clanes del jugador en el día) y `reconstruidos` (lo que el JSON de RoyaleAPI trae de más, solo para el domingo). La `Marca` del diario puede ser `Reconstruido`, `Salto` (falta la fila del día anterior de esa serie: la diferencia incluye más de un día) o `Repetida` (hay más de una fila para ese día; se usó la última).

| Temporada | Semana | Archivo | Filas | Primera hora | Tamaño (KB) |
|---|---|---|---|---|---|
| 5 | 1 | `T5/T5_S1 - 07-05-2026 00.00.json` | 196 | 07-05-2026 00.00 (sin hora) | 59 |
| 5 | 2 | `T5/T5_S2 - 14-05-2026 00.00.json` | 232 | 14-05-2026 00.00 (sin hora) | 70 |
| 5 | 3 | `T5/T5_S3 - 21-05-2026 00.00.json` | 240 | 21-05-2026 00.00 (sin hora) | 73 |
| 5 | 4 | `T5/T5_S4 - 28-05-2026 00.00.json` | 268 | 28-05-2026 00.00 (sin hora) | 81 |
| 6 | 1 | `T6/T6_S1 - 05-06-2026 00.00.json` | 491 | 04-06-2026 00.00 (sin hora) | 140 |
| 6 | 2 | `T6/T6_S2 - 08-06-2026 00.00.json` | 1138 | 08-06-2026 00.00 (sin hora) | 252 |
| 6 | 3 | `T6/T6_S3 - 15-06-2026 00.00.json` | 1034 | 15-06-2026 00.00 | 234 |
| 6 | 4 | `T6/T6_S4 - 22-06-2026 00.00.json` | 856 | 22-06-2026 00.00 (sin hora) | 190 |
| 6 | 5 | `T6/T6_S5 - 29-06-2026 00.00.json` | 866 | 29-06-2026 00.00 (sin hora) | 195 |
| 7 | 1 | `T7/T7_S1 - 06-07-2026 00.00.json` | 850 | 06-07-2026 00.00 (sin hora) | 192 |
| 7 | 2 | `T7/T7_S2 - 16-07-2026 00.00.json` | 524 | 16-07-2026 00.00 (sin hora) | 155 |
| 7 | 3 | `T7/T7_S3 - 23-07-2026 00.00.json` | 504 | 23-07-2026 00.00 (sin hora) | 154 |
| 7 | 4 | `T7/T7_S4 - 29-07-2026 00.00.json` | 878 | 29-07-2026 00.00 | 218 |
| 8 | 1 | `T8/T8_S1 - 03-08-2026 00.00.json` | 998 | 03-08-2026 00.00 (sin hora) | 236 |
| 8 | 2 | `T8/T8_S2 - 10-08-2026 00.00.json` | 1046 | 10-08-2026 00.00 | 233 |
| 8 | 3 | `T8/T8_S3 - 17-08-2026 05.01.json` | 1010 | 17-08-2026 05.01 | 229 |
| 8 | 4 | `T8/T8_S4 - 24-08-2026 05.01.json` | 969 | 24-08-2026 05.01 | 221 |
| 8 | 5 | `T8/T8_S5 - 31-08-2026 05.01.json` | 966 | 31-08-2026 05.01 | 225 |
| 9 | 1 | `T9/T9_S1 - 07-09-2026 06.01.json` | 826 | 07-09-2026 06.01 | 197 |
| 9 | 2 | `T9/T9_S2 - 14-09-2026 06.01.json` | 889 | 14-09-2026 06.01 | 207 |
| 9 | 3 | `T9/T9_S3 - 21-09-2026 04.41.json` | 875 | 21-09-2026 04.41 | 206 |
| 9 | 4 | `T9/T9_S4 - 28-09-2026 04.58.json` | 860 | 28-09-2026 04.58 | 203 |
| 10 | 1 | `T10/T10_S1 - 05-10-2026 09.08.json` | 751 | 05-10-2026 09.08 | 176 |
| 10 | 2 | `T10/T10_S2 - 12-10-2026 04.39.json` | 843 | 12-10-2026 04.39 | 198 |
| 10 | 3 | `T10/T10_S3 - 19-10-2026 04.33.json` | 824 | 19-10-2026 04.33 | 194 |

Total: 25 archivos, 18934 filas.

Regenerar o verificar: `python3 generar_json_guerra.py "<ruta a Datos descargados>" [--fecha AAAA-MM-DD] [--solo-verificar]`.
