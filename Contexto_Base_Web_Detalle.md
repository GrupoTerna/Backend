# Contexto_Base_Web_Detalle

Bloques por `.gs` pasados desde `Contexto_Base_Web.md`: el resumen de cada archivo, su «Índice de bloques movidos» y su «Detalle (texto original, sin cambios)». **Es histórico y no se edita** (reglas en `Consolidados de cambios/Reglas_Consolidados.md`, sección 9). Las secciones `PFxxx`, el plan de fases, los abiertos y el mapa que dice en qué archivo está cada bloque están en `Contexto_Base_Web.md`. Un `§NNBxxx` se busca con el prefijo `NN` en «Mapa de bloques por `.gs`». Si algo de aquí contradice una sección PF, manda la PF.


# Archivo 01_Config_Global.gs

Configuración global: objeto `CFG` (hojas, colores, presupuestos de tiempo, ventana de guerra, límites de /players y battlelog), interruptores de API (`PLAYERS_API_ENABLED`, `BATTLELOGCHESTS_API_ENABLED`, `SUPRIMIR_PLAYERS_TEMPORAL`), IDs de carpetas de Drive (CSV, JSON, Plantillas, Endpoints, Ranking, Torneos, etc.) y helpers genéricos (fechas, nombres de clan, tags ocultos, lectura de hojas con fallback a CSV, tokens).

Los IDs de bloque de este archivo llevan el prefijo `01` (ej. `01B001`).


## Índice de bloques movidos

| ID | Líneas orig. | Ubicación | Resumen |
|---|---|---|---|
| 01B001 | 10-25 | `Cabecera del archivo` | Configuración central del sistema de gestión de clanes - Familia Terna |
| 01B002 | 27-29 | `Cabecera del archivo` | OBJETO CFG - Configuración central |
| 01B003 | 40-54 | `CFG` | FASE 6 (punto 6 del documento — Detección de infiltrados/sabotaje): |
| 01B004 | 62-73 | `CFG` | Fecha de referencia: primer lunes de la Temporada 1 (04/05/2026). |
| 01B005 | 93-95 | `CFG` | Valores válidos para la columna "Razón" (motivo de veto). 'Sí'/'No' |
| 01B006 | 101-117 | `CFG` | ADMIN_FAMILIA - Respaldo de qué clan(es) administra cada admin. |
| 01B007 | 125-129 | `CFG` | Solo administran Grupo乂Terna™ (ClanTag #GCRG8L00 = CFG.TERNA_TAGS[0], |
| 01B008 | 134-137 | `CFG` | Nombre de respaldo por ClanTag, usado SOLO si todavía no hay cache de |
| 01B009 | 145-148 | `CFG` | Nombre completo de cada día, indexado por su letra (ver DIA_LETRAS). |
| 01B010 | 162-164 | `CFG` | FIX (06-ago-2026): Historial -> "Historial_I/S" (Ingresos/Salidas). |
| 01B011 | 170-180 | `CFG` | FASE 6 (05-ago-2026, cierre del plan de migración Plantillas -> Menú): |
| 01B012 | 185-187 | `CFG` | FIX (06-ago-2026): Ascensos -> "Historial_A/D" (Ascensos/Degradaciones). |
| 01B013 | 194-202 | `CFG` | FASE (07-sep-2026, pedido del usuario): S_Lista es la hoja análoga a |
| 01B014 | 205-215 | `CFG` | NUEVO (09-sep-2026, pedido usuario): hoja análoga a T_Asistencia pero |
| 01B015 | 218-223 | `CFG` | FASE 24 (02-sep-2026, pedido del usuario — descalificaciones y |
| 01B016 | 228-231 | `CFG` | Histórico de Guerra por jugador (20_HistorialGuerraJugador.gs) — hoja |
| 01B017 | 233-253 | `CFG` | FIX (07-sep-2026, reportado por el usuario -- "aparece una hoja nueva |
| 01B018 | 255-269 | `CFG` | NUEVO (13-sep-2026, pedido del usuario): CR_Lista es la hoja de |
| 01B019 | 271-279 | `CFG` | NUEVO (14-sep-2026, pedido del usuario -- cierre del CONTRATO |
| 01B020 | 283-291 | `CFG` | FASE 24 (02-sep-2026, pedido del usuario — descalificaciones y |
| 01B021 | 296-306 | `CFG` | NUEVO (15-sep-2026, pedido del usuario -- cuentas prestadas en |
| 01B022 | 310-315 | `CFG` | NUEVO (09-sep-2026, pedido usuario): los 2 valores válidos para la |
| 01B023 | 321-332 | `CFG` | RESUELTO (10-sep-2026, definición exacta del usuario -- ver |
| 01B024 | 363-376 | `CFG` | Categorías de referencia (orden canónico) para la hoja Extra — col Categoría (L). |
| 01B025 | 386-405 | `CFG` | Orden de categorías EXCLUSIVO para la generación de mensajes diarios |
| 01B026 | 423-425 | `CFG` | Opciones de Tipo para el dropdown de la hoja Índice (col P de Extra). |
| 01B027 | 431-434 | `CFG` | Orden canónico de las columnas de control, compartido por la hoja Extra |
| 01B028 | 437-441 | `CFG` | Configuración inicial recomendada por hoja para la tabla Índice (se usa |
| 01B029 | 464-469 | `CFG` | --- Control de ejecución (locks auto-expirables, ver 00_Main.gs) --- |
| 01B030 | 472-497 | `CFG` | Presupuesto de tiempo objetivo para cada "tanda" de runAll/runUpdate antes |
| 01B031 | 500-504 | `CFG` | FIX (06-ago-2026): runSyncCSV() ahora usa el mismo motor de tandas |
| 01B032 | 506-513 | `CFG` | FIX (22-ago-2026): runGuerraRapido() se cancelaba por exceder el límite |
| 01B033 | 515-524 | `CFG` | NUEVO (09-sep-2026, pedido usuario -- "_continuarProcesarSorteos() / |
| 01B034 | 526-532 | `CFG` | Presupuesto interno SOLO para el bucle de /players dentro de |
| 01B035 | 535-541 | `CFG` | Límite MÁXIMO de consultas a /players que se hacen en UNA sola tanda de |
| 01B036 | 544-553 | `CFG` | NUEVO (27-sep-2026, pedido usuario -- "partelo en tandas... replica el |
| 01B037 | 556-561 | `CFG` | Tope adicional de cuántos jugadores como máximo se procesan (battlelog + |
| 01B038 | 564-575 | `CFG` | FIX (07-sep-2026, pedido usuario -- "no se debe recurrir directamente a |
| 01B039 | 578-588 | `CFG` | Tope adicional de cuántas consultas a RoyaleAPI se hacen como máximo |
| 01B040 | 591-600 | `CFG` | FASE 21 (01/08/2026): edad máxima que se acepta para el archivo de |
| 01B041 | 602-607 | `CFG` | FIX (06-ago-2026): mismo criterio que PLAYERS_PROGRESO_MAX_EDAD_MS, pero |
| 01B042 | 609-615 | `CFG` | NUEVO (27-sep-2026): mismo criterio que PLAYERS_PROGRESO_MAX_EDAD_MS/ |
| 01B043 | 618-628 | `CFG` | FIX (08-ago-2026): umbral corto exclusivo para runGuerra() (00_Main.gs). |
| 01B044 | 631-640 | `CFG` | VENTANA DE GUERRA PROTEGIDA (05-oct-2026, pedido del usuario). Entre las 4:00 y las 4:59 a.m. de Lima |
| 01B045 | 651-665 | `CFG` | FIX (02-sep-2026, "corridas de runAll()/runUpdate() muriendo dentro del |
| 01B046 | 668-671 | `CFG` | Filas por lote en _restaurarGuerraDesdeCSVSiVacia() (ver |
| 01B047 | 674-684 | `CFG` | Presupuesto interno SOLO para el bucle de respaldarHojasDerivadasCSV() |
| 01B048 | 687-698 | `CFG` | FIX (16-ago-2026): presupuesto interno SOLO para el bucle de |
| 01B049 | 701-716 | `CFG` | FIX (17-ago-2026): presupuesto interno SOLO para el bucle de |
| 01B050 | 719-738 | `CFG` | FIX (02-sep-2026, pedido usuario — diagnóstico de timeouts en runAll()): |
| 01B051 | 741-758 | `CFG` | FIX (02-sep-2026): _limpiarLinksAccidentalesEnHoja(sh) — la versión |
| 01B052 | 761-777 | `CFG` | FIX (04-sep-2026): el throttle de arriba (1 vez/hora) reduce CUÁNTAS |
| 01B053 | 780-793 | `CFG` | FIX (07-sep-2026): reemplaza el enfoque de _limpiarLinksAccidentalesEnHoja() |
| 01B054 | 796-809 | `CFG` | FIX (02-sep-2026): runGuerra() (00_Main.gs) es monolítica — a diferencia |
| 01B055 | 812-815 | `CFG` | FASE 6 (05-ago-2026, cierre del plan de migración Plantillas -> Menú): |
| 01B056 | 817-823 | `CFG` | Colores de fondo por letra de día (para formato condicional en Guerra) |
| 01B057 | 855-860 | `CFG` | Paleta cíclica de colores pastel para agrupar visualmente las filas |
| 01B058 | 865-867 | `CFG` | Colores pastel de fondo para la hoja Vetados, según columna "Razón". |
| 01B059 | 877-880 | `CFG` | CARDS_RARITY_BG — ELIMINADO (06-ago-2026). Era el mapa de colores para |
| 01B060 | 882-893 | `CFG` | Colores pastel de fondo para la hoja Ascensos, según columna "Tipo". |
| 01B061 | 899-901 | `CFG` | 4-oct-2026 (Fase 14, aviso d de 26_Torneos_Core.gs): tipo nuevo 'Ascenso de clan' que |
| 01B062 | 908-913 | `CFG` | Mínimo de puntaje de guerra por defecto para torneo — respaldo SOLO |
| 01B063 | 916-919 | `CFG` | Colores pastel de fondo para la hoja Mensajes, según columna "Tipo". |
| 01B064 | 926-931 | `CFG` | Categorías "Estáticas" (Plantillas) que ahora también se replican en |
| 01B065 | 938-943 | `CFG` | Pedido usuario (ago-2026): Participantes/Ganadores de torneo y sorteo |
| 01B066 | 949-954 | `CFG` | Pedido usuario (11/08/2026): "Ascensos y descensos" (categoría |
| 01B067 | 958-961 | `CFG` | Fórmula del título combinado D1:P2 de la hoja Control. Usa SWITCH() |
| 01B068 | 967-970 | `CFG` | FIX (13-ago-2026, pedido usuario): fórmula del título dinámico D1:K2 de |
| 01B069 | 976-986 | `CFG` | Cuentas ocultas manualmente: se tratan como si NO existieran en ningún |
| 01B070 | 990-1006 | `CFG` | INTERRUPTOR PLAYERS_API_ENABLED |
| 01B071 | 1009-1027 | `PLAYERS_API_ENABLED` | INTERRUPTOR BATTLELOGCHESTS_API_ENABLED |
| 01B072 | 1030-1040 | `BATTLELOGCHESTS_API_ENABLED` | INTERRUPTOR SUPRIMIR_PLAYERS_TEMPORAL (Fase 1 del plan de cambios) |
| 01B073 | 1043-1131 | `SUPRIMIR_PLAYERS_TEMPORAL` | IDs DE CARPETAS DRIVE |
| 01B074 | 1134-1137 | `DRIVE_FOLDER_ID_CSV` | Carpeta raíz donde se guardan los JSON de backup de API (clans, currentriverrace). |
| 01B075 | 1140-1145 | `DRIVE_FOLDER_ID_JSON` | Carpeta donde se guardan los JSON de /players. Un archivo por jugador |
| 01B076 | 1148-1154 | `DRIVE_FOLDER_ID_PLAYERS` | Carpeta contenedora "RoyaleAPI" (dentro de "JSON", NO dentro de |
| 01B077 | 1157-1161 | `DRIVE_FOLDER_ID_ROYALEAPI` | Histórico de Guerra por jugador (RoyaleAPI vía Tampermonkey — NO viene de la |
| 01B078 | 1164-1166 | `DRIVE_FOLDER_ID_ROYALEAPI_INDIVIDUAL` | CSV consolidado (una fila por jugador+temporada+semana), equivalente |
| 01B079 | 1169-1172 | `DRIVE_FOLDER_ID_ROYALEAPI_GRUPAL` | Nombre del archivo de progreso temporal de /players (ver 09_API_ClashRoyale.gs). |
| 01B080 | 1175-1177 | `PLAYERS_PROGRESS_FILE` | FIX (06-ago-2026): checkpoint equivalente para clanes/currentriverrace, |
| 01B081 | 1180-1186 | `CLANES_PROGRESO_FILE` | NUEVO (27-sep-2026): checkpoint equivalente para battlelog+upcomingchests, |
| 01B082 | 1193-1202 | `DRIVE_FOLDER_ID_PLANTILLAS` | Carpeta "Clans_Consulta_Temporal" (pedido del usuario, 26-sep-2026): NO es |
| 01B083 | 1205-1228 | `DRIVE_FOLDER_ID_CLANS_CONSULTA_TEMPORAL` | SUBCARPETAS DENTRO DE "Plantillas" (Mi unidad > Respaldo > Plantillas). |
| 01B084 | 1231-1238 | `DRIVE_FOLDER_ID_PLANTILLAS_TORNEOS_SORTEOS` | 2) "Otras" — ID: 1d6_wFdPE6SfRDN9rIc847vE6XVxZuq71 |
| 01B085 | 1241-1243 | `DRIVE_FOLDER_ID_PLANTILLAS_OTRAS` | 3) "Mazos" — ID: 1-NyyqZ-p9mwJ78Q28DLo0XkXxYIoRTbo |
| 01B086 | 1246-1254 | `DRIVE_FOLDER_ID_PLANTILLAS_MAZOS` | 4) "Descripciones" — ID: 1Sm3c_O1MwSd29kX_n3PW1v0jjdyD0r8E |
| 01B087 | 1257-1261 | `DRIVE_FOLDER_ID_PLANTILLAS_DESCRIPCIONES` | 5) "Bienvenidas" — ID: 1z5Gs3lDn1lxjbKB4dSRLbN6kfdY66AhB |
| 01B088 | 1264-1266 | `DRIVE_FOLDER_ID_PLANTILLAS_BIENVENIDAS` | Array de conveniencia con las 5 subcarpetas de arriba, para recorrerlas |
| 01B089 | 1275-1280 | `DRIVE_FOLDERS_PLANTILLAS_SUB` | Carpeta raíz. Nombre en Drive: "Respaldo" (padre de "CSV", "JSON" y |
| 01B090 | 1283-1287 | `DRIVE_FOLDER_ID_RESPALDO` | Nombre en Drive: "Torneos" (subcarpeta dentro de "JSON" > "Endpoints" |
| 01B091 | 1290-1295 | `DRIVE_FOLDER_ID_TORNEOS` | Nombre en Drive: "Globales" (subcarpeta dentro de "Torneos", pedido del |
| 01B092 | 1298-1301 | `DRIVE_FOLDER_ID_TORNEOS_GLOBALES` | Nombre en Drive: "Por búsqueda de nombre" (subcarpeta dentro de "Torneos", |
| 01B093 | 1304-1313 | `DRIVE_FOLDER_ID_TORNEOS_BUSQUEDA_NOMBRE` | REORGANIZACIÓN DE DRIVE (25-sep-2026, pedido del usuario): "JSON" > |
| 01B094 | 1319-1324 | `DRIVE_FOLDER_ID_ENDPOINTS` | Nombre en Drive: "Battlelog" (subcarpeta dentro de "Endpoints"). EN USO |
| 01B095 | 1327-1426 | `DRIVE_FOLDER_ID_BATTLELOG` | Backup_Arena.csv / Backup_Modo.csv (DRIVE_FOLDER_ID_CSV, carpeta "CSV") |
| 01B096 | 1428-1434 | `DRIVE_FOLDER_ID_BATTLELOG` | Nombre en Drive: "Cards" (subcarpeta dentro de "Endpoints"). Usada |
| 01B097 | 1437-1439 | `DRIVE_FOLDER_ID_CARDS` | Carpeta contenedora "Clans" (subcarpeta dentro de "Endpoints"). Contiene 5 |
| 01B098 | 1442-1445 | `DRIVE_FOLDER_ID_CLANS` | Carpeta contenedora "CurrentRiverRace" (subcarpeta dentro de "Endpoints"). |
| 01B099 | 1448-1452 | `DRIVE_FOLDER_ID_CURRENTRIVERRACE` | Nombre en Drive: "Locations" (subcarpeta dentro de "Endpoints"). En uso |
| 01B100 | 1459-1470 | `DRIVE_FOLDER_ID_RANKING` | Nombre en Drive: "Copas" (subcarpeta dentro de "Ranking"). EN USO desde |
| 01B101 | 1473-1480 | `DRIVE_FOLDER_ID_RANKING_COPAS` | Nombre en Drive: "Guerra" (subcarpeta dentro de "Ranking"). EN USO desde |
| 01B102 | 1483-1495 | `DRIVE_FOLDER_ID_RANKING_GUERRA` | Carpeta contenedora "Jugadores" (subcarpeta dentro de "Ranking"). Contiene |
| 01B103 | 1498-1513 | `DRIVE_FOLDER_ID_RANKING_JUGADORES` | Nombre en Drive: "Camino de leyendas" (subcarpeta dentro de "Ranking" > |
| 01B104 | 1516-1522 | `DRIVE_FOLDER_ID_RANKING_JUGADORES_CAMINO_LEYENDAS` | Nombre en Drive: "Global" (subcarpeta dentro de "Ranking" > "Jugadores", |
| 01B105 | 1525-1529 | `DRIVE_FOLDER_ID_RANKING_JUGADORES_GLOBAL` | Nombre en Drive: "Seasons" (subcarpeta dentro de "Endpoints"). En uso |
| 01B106 | 1532-1537 | `DRIVE_FOLDER_ID_SEASONS` | Nombre en Drive: "UpcomingChests" (subcarpeta dentro de "Endpoints"). EN |
| 01B107 | 1540-1578 | `DRIVE_FOLDER_ID_UPCOMINGCHESTS` | Backup_Cofres.csv (DRIVE_FOLDER_ID_CSV, carpeta "CSV") |
| 01B108 | 1580-1688 | `DRIVE_FOLDER_ID_UPCOMINGCHESTS` | RECURSOS GRÁFICOS (íconos/imágenes) -- REGISTRADO 27-sep-2026, pedido del |
| 01B109 | 1690-1693 | `DRIVE_FOLDER_ID_UPCOMINGCHESTS` | Nombre en Drive: "Otros" (subcarpeta dentro de "JSON", NO dentro de |
| 01B110 | 1696-1748 | `DRIVE_FOLDER_ID_OTROS` | RECONSTRUCCIÓN AUTOMÁTICA DE LOS 4 DOCS DE TORNEOS/SORTEOS |
| 01B111 | 1751-1754 | `_DOCS_TORNEOS_SORTEOS_RECONSTRUIBLES` | Nombres de día y mes en español, usados SOLO por _formatFechaLargaEs() |
| 01B112 | 1762-1766 | `_MESES_ES` | IV. HELPERS GLOBALES |
| 01B113 | 1768-1779 | `_MESES_ES` | HELPERS DE CARPETA "Plantillas" Y SUS SUBCARPETAS |
| 01B114 | 1781-1789 | `_MESES_ES` | _getCarpetasPlantillas() |
| 01B115 | 1803-1810 | `_getCarpetasPlantillas` | FIX (02-sep-2026, pedido usuario — corridas de RUNUPDATE muriendo "sin |
| 01B116 | 1813-1816 | `_CACHE_IDS_PLANTILLAS_MEMORIA_` | Prefijo de la clave en Script Properties (persiste ENTRE ejecuciones y |
| 01B117 | 1819-1860 | `PLANTILLAS_ID_CACHE_PREFIX_` | _buscarArchivoEnPlantillas(nombreArchivo, idArchivo) |
| 01B118 | 1897-1899 | `_buscarArchivoEnPlantillas` | ID cacheado ya no sirve (archivo borrado o movido fuera de |
| 01B119 | 1904-1906 | `_buscarArchivoEnPlantillas` | 3. Recorrido normal de las 6 carpetas (el costoso). Si encuentra el |
| 01B120 | 1918-1928 | `_buscarArchivoEnPlantillas` | FASE (08/08/2026 — Reconstrucción automática de docs borrados): si |
| 01B121 | 1932-1940 | `_buscarArchivoEnPlantillas` | _getMapaDocsReconstruibles() |
| 01B122 | 1949-1953 | `_getMapaDocsReconstruibles` | NUEVO (15-sep-2026, pedido del usuario -- ver 29_Docs_NoCalificados.gs). |
| 01B123 | 1961-1976 | `_getMapaDocsReconstruibles` | _getMapaCarpetaDestinoDocsReconstruibles() |
| 01B124 | 1984-1987 | `_getMapaCarpetaDestinoDocsReconstruibles` | NUEVO (15-sep-2026): "se deben generar en la misma carpeta de sus |
| 01B125 | 1994-2007 | `_getMapaCarpetaDestinoDocsReconstruibles` | _crearDocReconstruibleSiFalta(nombreArchivo) |
| 01B126 | 2026-2028 | `_crearDocReconstruibleSiFalta` | DocumentApp.create() lo crea en la raíz de "Mi unidad"; lo sacamos |
| 01B127 | 2036-2039 | `_crearDocReconstruibleSiFalta` | FIX (02-sep-2026): cachea el ID nuevo igual que el recorrido normal de |
| 01B128 | 2050-2052 | `_crearDocReconstruibleSiFalta` | HELPER DE ENLACES - makeLink() |
| 01B129 | 2066-2068 | `makeLink` | HELPERS DE FECHA Y TIEMPO |
| 01B130 | 2094-2104 | `dateKey` | _formatFechaLargaEs(fecha) |
| 01B131 | 2134-2136 | `_setDateCell` | HELPERS DE TEMPORADA Y PERIODINDEX |
| 01B132 | 2142-2147 | `periodIdxToLetra` | diaLetraANombre(letra) |
| 01B133 | 2161-2176 | `esDiaGuerraIdx` | _getMesEfectivo(periodIndex) |
| 01B134 | 2189-2199 | `_getMesEfectivo` | Sin caché válido de clanes, el periodIndex recibido es un 0 por |
| 01B135 | 2208-2222 | `_getMesEfectivo` | Reinicio de temporada detectado: el periodIndex de la API volvió a un |
| 01B136 | 2228-2238 | `_getMesEfectivo` | GUARDIÁN ANTI-DRIFT — el mes efectivo NUNCA debería quedar más de 1 mes |
| 01B137 | 2261-2267 | `_getMesEfectivo` | Calcula el "mes efectivo" que correspondería HOY según la fecha real del |
| 01B138 | 2280-2284 | `_calcularMesEfectivoRealDeHoy` | calcTemporadaDesdeMesEfectivo(ref, mesEfectivo) |
| 01B139 | 2322-2324 | `calcDiaGuerraIdx` | HELPERS DE CLAN Y API |
| 01B140 | 2326-2332 | `calcDiaGuerraIdx` | HELPER DE TELÉFONOS |
| 01B141 | 2337-2348 | `soloDigitos` | _getClanesAdminTexto(prefijo, celular) |
| 01B142 | 2365-2372 | `_getClanesAdminTexto` | _getNombresClanesTernaOrdenados() |
| 01B143 | 2390-2397 | `_getNombresClanesTernaOrdenados` | _resolverNombreClan(clanTag) |
| 01B144 | 2406-2412 | `_resolverNombreClan` | esRazonValida(v) |
| 01B145 | 2417-2423 | `esRazonValida` | esTagOculto(tag) |
| 01B146 | 2434-2455 | `esTagOculto` | _ocultarFilasTagsOcultos(sh, colTag) |
| 01B147 | 2492-2508 | `_ocultarFilasTagsOcultos` | encodeTag(tag) |
| 01B148 | 2552-2554 | `colLetter` | HELPERS DE FORMATO Y LAYOUT |
| 01B149 | 2587-2589 | `_clearBg` | HELPERS DE DRIVE Y SPREADSHEET |
| 01B150 | 2611-2625 | `_desactivarGridlines` | FALLBACK GENÉRICO SHEET -> CSV |
| 01B151 | 2627-2633 | `_desactivarGridlines` | _armarHeaderIdx(headers) |
| 01B152 | 2642-2692 | `_armarHeaderIdx` | _obtenerFilasConFallbackCSV(ss, nombreHoja, nombreArchivoCsv, totalCols, headerRowsHoja) |
| 01B153 | 2718-2720 | `_obtenerFilasConFallbackCSV` | Sheet no disponible (spreadsheet caído, hoja protegida/corrupta, |
| 01B154 | 2761-2775 | `_obtenerFilasConFallbackCSV` | _obtenerMapaPorTagConFallbackCSV(ss, nombreHoja, nombreArchivoCsv, tagColIdx, totalCols) |
| 01B155 | 2786-2800 | `_obtenerMapaPorTagConFallbackCSV` | _numDesdeCeldaCSV_(v) |
| 01B156 | 2813-2815 | `_scriptToken` | Corta temprano y con mensaje claro: sin literal de respaldo, un |
| 01B157 | 2822-2841 | `_scriptToken` | guardarTokensEnScriptProperties() |
| 01B158 | (12-oct-2026) | `_csvSubcarpetaDe_` | Subcarpetas de la carpeta CSV: mapa archivo → subcarpeta y búsqueda |

---

## Detalle (texto original, sin cambios)

Cada bloque se copió tal cual estaba en el `.gs` (sin los `//`). Los números de línea son los del archivo ANTES de la limpieza.


### Ubicación: `Cabecera del archivo`

#### 01B001 — líneas 10-25 (comentario)

```text
Configuración central del sistema de gestión de clanes - Familia Terna
Contiene: objeto CFG, interruptores, IDs Drive y TODOS los helpers globales.
Cambiar un valor aquí lo propaga automáticamente a todo el sistema.

CONCEPTO CLAVE - CAMPO "JUGADOR" (columna Nom_Multi en Directorio):
  El campo visible que identifica a una persona en el sistema es Nom_Multi.
  Se construye como: "NombrePersona (Cuenta1 Cuenta2 ...)"
  - NombrePersona: nombre legible escrito manualmente en la columna Nom_Multi
                   de la hoja Directorio. Permite identificar a jugadores cuyos
                   nombres en el juego tienen caracteres especiales o son
                   difíciles de etiquetar en WhatsApp.
  - Cuenta1, Cuenta2...: nombres reales del juego (member.name de la API).
  APLICA PARA TODOS los jugadores, incluso si solo tienen una cuenta.
  Si Nom_Multi está vacío, se usa directamente el nombre del juego.
  El campo "Jugador" en hojas derivadas (Control, Multicuentas, etc.)
  siempre refleja este mismo valor calculado.
```

#### 01B002 — líneas 27-29 (comentario)

```text
---------------------------------------------------------------------------
OBJETO CFG - Configuración central
---------------------------------------------------------------------------
```


### Ubicación: `CFG`

#### 01B003 — líneas 40-54 (comentario)

```text
FASE 6 (punto 6 del documento — Detección de infiltrados/sabotaje):
lista MANUAL de clanes con los que hay conflicto conocido, además de
los rivales que ya salen automáticamente de currentriverrace de la
temporada actual (ver _getClanesRivalesTemporadaActual(),
15_DeteccionInfiltrados.gs). DECISIÓN DE ALCANCE (reportada, no
confirmada por el usuario todavía): se implementó como arreglo de
config, en el MISMO estilo que ADMIN_FAMILIA de arriba, en vez de una
hoja nueva de Sheets — más simple de mantener desde el código y no
agrega una hoja más a Sheets, pero exige tocar código para editarla
(a diferencia de una hoja, que un admin no técnico podría editar
directo). Si se prefiere que sea editable como hoja, avisar para
moverlo a una hoja nueva (ej. 'Conflictos') en una fase aparte.
tag: Tag del clan (con #). nombre: solo informativo (no se usa para
matchear, el match es por tag). motivo: texto libre, para que quede
registrado por qué se agregó.
```

#### 01B004 — líneas 62-73 (comentario)

```text
Fecha de referencia: primer lunes de la Temporada 1 (04/05/2026).

GETTER (pendiente Reenumeración de Temporadas, punto 1): en vez de un
valor fijo, lee primero de PropertiesService (CFG_REF_ACTIVO, guardado
como 'YYYY-MM-DD' por runReenumerarTemporadas() al reenumerar) y solo
si no hay nada guardado todavía, cae al valor original de abajo como
bootstrap. PropertiesService es lectura LOCAL (no llama a la API de
Sheets), así que no hay riesgo de leer una hoja vacía justo después de
un Demoler ni de pagar el costo de una llamada extra en cada corrida.
Al ser un getter, ningún otro archivo que ya usa CFG.REF_DEFAULT
necesita cambiar — siguen escribiendo CFG.REF_DEFAULT igual que hoy y
reciben automáticamente el valor activo.
```

#### 01B005 — líneas 93-95 (comentario)

```text
Valores válidos para la columna "Razón" (motivo de veto). 'Sí'/'No'
pertenecen a la columna "Vetado", NUNCA deben aparecer en "Razón" — si
aparecen, es un dato corrupto heredado (columnas cruzadas) y se descarta.
```

#### 01B006 — líneas 101-117 (comentario)

```text
---------------------------------------------------------------------
ADMIN_FAMILIA - Respaldo de qué clan(es) administra cada admin.
No reemplaza la columna "Admin" de Directorio (que sigue siendo la
fuente real de "¿es admin?"); esto SOLO alimenta la columna informativa
"Clanes_Admin" (Directorio y Administradores), para distinguir admins
que están a cargo de los 4 clanes Terna de los que solo administran uno.
clanes: 'TODOS' -> los 4 clanes Terna. O un texto con el/los clanes
puntuales (tal como deben verse en la columna).
Todos los celulares de la familia ya están registrados. Si en algún
momento agregas o quitas un administrador, eso se sigue manejando 100%
desde la columna "Admin" de Directorio (ver _esAdministrador() en
44_BotWhatsApp.gs) — esta tabla NO otorga ni quita permisos de admin,
solo decide qué texto mostrar en "Clanes_Admin" cuando esa columna
Admin ya dice "Sí". Si das de baja a alguien de aquí (o cambia de
alcance), basta con editar/quitar su entrada en este arreglo; no hace
falta tocar Directorio para eso.
---------------------------------------------------------------------
```

#### 01B007 — líneas 125-129 (comentario)

```text
Solo administran Grupo乂Terna™ (ClanTag #GCRG8L00 = CFG.TERNA_TAGS[0],
confirmado por el usuario). clanes guarda el/los ClanTag, no el
nombre — el nombre real se resuelve en tiempo de ejecución vía
_resolverNombreClan() para no quedar desactualizado si el clan
cambia de nombre en el juego.
```

#### 01B008 — líneas 134-137 (comentario)

```text
Nombre de respaldo por ClanTag, usado SOLO si todavía no hay cache de
la API disponible (p.ej. la primera vez que corre el bot en una
ejecución, antes de updateDirectorioSheet) al resolver Clanes_Admin
para un admin con clanes:[tags...] específicos (no 'TODOS').
```

#### 01B009 — líneas 145-148 (comentario)

```text
Nombre completo de cada día, indexado por su letra (ver DIA_LETRAS).
Fuente única de verdad para cualquier lugar que necesite mostrar el
nombre completo del día (ej. encabezado de Control) a partir de la
letra guardada en Extra!C2. Ver diaLetraANombre().
```

#### 01B010 — líneas 162-164 (comentario)

```text
FIX (06-ago-2026): Historial -> "Historial_I/S" (Ingresos/Salidas).
Ver _renombrarHojasHistorialLegacy() en 04_Formato_Comun.gs para la migración
de la pestaña real ya existente (preserva todos sus datos).
```

#### 01B011 — líneas 170-180 (comentario)

```text
FASE 6 (05-ago-2026, cierre del plan de migración Plantillas -> Menú):
se quita PLANTILLAS:'Plantillas' de este mapa — la hoja ya no existe
y ningún archivo
del proyecto la referencia más. NOTA: esto NO afecta las constantes
DRIVE_FOLDER_ID_PLANTILLAS* de más abajo en este archivo — esas siguen
vigentes, son los IDs de las carpetas de Drive que
syncPlantillasDesdeDrive() (43_Menu_Dinamico.gs) sigue leyendo para poblar
el índice de contenido.
Igual que Plantillas, se quita MENU:'Menú': la hoja Menú se eliminó y su
contenido vive ahora en el índice de contenido (_getIndiceContenido(),
43_Menu_Dinamico.gs). Ver _limpiarHojaMenuObsoleta(), 04_Formato_Comun.gs.
```

#### 01B012 — líneas 185-187 (comentario)

```text
FIX (06-ago-2026): Ascensos -> "Historial_A/D" (Ascensos/Degradaciones).
Ver _renombrarHojasHistorialLegacy() en 04_Formato_Comun.gs para la migración
de la pestaña real ya existente (preserva todos sus datos).
```

#### 01B013 — líneas 194-202 (comentario)

```text
FASE (07-sep-2026, pedido del usuario): S_Lista es la hoja análoga a
T_Lista pero para SORTEOS (no torneos) — ver _setupSLista()
(02_Setup_Hojas.gs), el objeto SL y las funciones
importarSListaDesdeCSV()/_aplicarDropdownId2SLista()/
_aplicarDropdownEstadoSLista() (26_Torneos_Core.gs). A diferencia de
T_Lista, no hay ningún proceso automático que la llene (ID, ID_2,
Organizador, etc. son de carga 100% manual) — el código solo se
encarga de reconocer sus columnas, respaldarla en CSV y poder
reconstruirla si se demuele el spreadsheet.
```

#### 01B014 — líneas 205-215 (comentario)

```text
NUEVO (09-sep-2026, pedido usuario): hoja análoga a T_Asistencia pero
para SORTEOS -- ver _setupSAsistencia() (02_Setup_Hojas.gs), el
objeto SA (26_Torneos_Core.gs) y CFG.SORTEOS_RESULTADO_TIPOS /
CFG.SORTEOS_RAZON_TIPOS más abajo. A diferencia de T_Asistencia (que
se llena automáticamente por torneo procesado en T_Lista), TODAVÍA
no hay ningún proceso automático que la llene -- por ahora solo
existe la ESTRUCTURA (encabezados + dropdown de Resultado y de
Razón). El proceso real (la "ruleta" en la web que importa
participantes calificados, sortea y exporta ganadores acá) sigue
pendiente de definir -- ver el bloque PENDIENTE en el docblock de
procesarSorteos() (26_Torneos_Core.gs).
```

#### 01B015 — líneas 218-223 (comentario)

```text
FASE 24 (02-sep-2026, pedido del usuario — descalificaciones y
desempates de torneos): una fila por CUENTA AFECTADA (no por
torneo), para poder auditar cada caso por separado. Ver
_setupTResoluciones() (02_Setup_Hojas.gs) para las columnas y
_aplicarResolucionesTorneo() (26_Torneos_Core.gs) para cómo se
aplica sobre el resultado crudo de Victorias/Puesto.
```

#### 01B016 — líneas 228-231 (comentario)

```text
Histórico de Guerra por jugador (20_HistorialGuerraJugador.gs) — hoja
donde caen las discrepancias "acumulado bajó al cerrar la semana"
(Sección 8 P3 del consolidado). Su respaldo en Drive es
Alertas_HistorialGuerra.csv (ver syncAcumulativosCSV(), 05_Backup_CSV.gs).
```

#### 01B017 — líneas 233-253 (comentario)

```text
FIX (07-sep-2026, reportado por el usuario -- "aparece una hoja nueva
llamada 'Hoja 21' con los encabezados Tag/Nombre/Motivo, sin ningún
valor"): a esta constante le faltaba la clave CONFLICTOS por completo
-- _setupConflictos() (02_Setup_Hojas.gs) y _getClanesConflictoManual()
(15_DeteccionInfiltrados.gs) ya la usaban (CFG.SHEETS.CONFLICTOS) desde
la FASE 6 (03-sep-2026), y el comentario de esa fase incluso la da por
existente acá, pero nunca se agregó de verdad a este objeto. Como
CFG.SHEETS.CONFLICTOS valía `undefined`, _getOrCreateSheet(ss,
undefined) (02_Setup_Hojas.gs) llamaba a ss.insertSheet(undefined) --
Apps Script, ante un nombre inválido, crea la hoja con el próximo
nombre automático disponible ("Hoja 21" en este caso) en vez de fallar
o de usar "Conflictos". El resto de _setupConflictos() seguía
corriendo con total normalidad sobre esa hoja mal nombrada (por eso
sí tenía los encabezados Tag/Nombre/Motivo, pero ninguna fila: la hoja
real "Conflictos" es manual, la llena un admin a mano). Con la clave
agregada, setupAllSheets() vuelve a crear/usar una hoja llamada
"Conflictos" como corresponde. La hoja "Hoja 21" que ya quedó creada
en el spreadsheet NO se borra sola -- hay que borrarla a mano una vez
(clic derecho -> Eliminar), reasignando a mano cualquier fila de
conflicto que se haya cargado ahí por error a la hoja "Conflictos"
correcta si corresponde.
```

#### 01B018 — líneas 255-269 (comentario)

```text
NUEVO (13-sep-2026, pedido del usuario): CR_Lista es la hoja de
"Planificación, registro y modificación de cambio de rango" -- pensada
para REEMPLAZAR a T_Requisitos en sus categorías "Ascensos"/
"Descensos" (27_Torneos_Sorteos_Requisitos.gs). Encabezado de 3 FILAS
fusionadas (a diferencia de T_Lista/S_Lista, que usan 2 -- ver
_aplicarHeaderTresFilas(), 02_Setup_Hojas.gs) porque acá Min_CR y
Ataques discriminan por CLAN (C1-C4) Y por ROL (Miembro/Veterano/
Colider) al mismo tiempo. Cada corrida registra SIEMPRE un par de
filas (una de Ascenso y una de Descenso) -- ver columna Tipo, con
dropdown fijo ("Ascenso"/"Descenso"). El ID usa prefijo "A" o "D"
(Ascenso/Descenso) en vez de la "T"/sin prefijo de T_Lista/S_Lista --
la generación automática del ID y la mecánica real de Min_CR (cómo
discrimina por rango) quedan PENDIENTES de definir; este pase
(_setupCRLista(), 02_Setup_Hojas.gs) solo cubre la ESTRUCTURA de la
hoja (encabezados, merges, filtro en fila 3, dropdown de Tipo).
```

#### 01B019 — líneas 271-279 (comentario)

```text
NUEVO (14-sep-2026, pedido del usuario -- cierre del CONTRATO
PENDIENTE "Marcar visto en el grupo" dejado en admin.html el
08-sep-2026): "Grupo_Verificado" persiste la confirmación manual de
que un ganador SÍ está en el grupo de WhatsApp de ganadores (hasta
ahora vivía solo en memoria del navegador, _grupoVerificadoTags,
admin.html -- se perdía al recargar la página y ningún otro admin la
veía). Ver _setupGrupoVerificado() (02_Setup_Hojas.gs) para las
columnas y GV/GV_TOTAL_COLS (26_Torneos_Core.gs, junto a TR) para el
resto del manejo.
```

#### 01B020 — líneas 283-291 (comentario)

```text
FASE 24 (02-sep-2026, pedido del usuario — descalificaciones y
desempates de torneos): las 3 categorías válidas para la columna
Tipo_Resolucion de la hoja T_Resoluciones. Usadas tanto por
_registrarResolucionTorneo() (26_Torneos_Core.gs, valida contra este
set) como por _aplicarResolucionesTorneo() (mismo archivo, decide qué
hacer con el Puesto según cuál de las 3 sea). Los valores (no las
claves) son el texto exacto que se guarda en la hoja y el que ve el
admin en el panel — cambiar un valor acá exige también actualizar el
<select> de admin.html.
```

#### 01B021 — líneas 296-306 (comentario)

```text
NUEVO (15-sep-2026, pedido del usuario -- cuentas prestadas en
torneos): cuarto tipo, el único que NO es un castigo ni un empate.
Se registra cuando el ganador de un puesto tiene valor en la columna
Préstamo (Directorio / T_Asistencia) y el admin confirma, en el
panel de Ganadores (admin.html), que quien jugó fue el prestatario y
no el dueño de la cuenta. Efecto: NINGUNO sobre el puesto -- no
descalifica, no reparte y no reemplaza Puesto_Final; solo deja el
Motivo escrito en T_Resoluciones diciendo a quién estaba prestada la
cuenta y a quién le corresponde el premio (ver
_aplicarResolucionesTorneo() y _registrarResolucionTorneo(),
26_Torneos_Core.gs).
```

#### 01B022 — líneas 310-315 (comentario)

```text
NUEVO (09-sep-2026, pedido usuario): los 2 valores válidos para la
columna Resultado de la hoja S_Asistencia (ver _setupSAsistencia(),
02_Setup_Hojas.gs, y el objeto SA en 26_Torneos_Core.gs) -- mismo
criterio que TORNEOS_RESOLUCION_TIPOS arriba: los valores (no las
claves) son el texto exacto que se guarda en la hoja y el que ve el
admin en el dropdown.
```

#### 01B023 — líneas 321-332 (comentario)

```text
RESUELTO (10-sep-2026, definición exacta del usuario -- ver
Consolidado_Cambios_Pendientes_Torneos_Sorteos.md, sección 2): motivos
válidos para la columna Razón de S_Asistencia, cuando Resultado =
SORTEOS_RESULTADO_TIPOS.NO_CALIFICA. Cada motivo corresponde a un
requisito de S_Lista que la persona no cumplió (WhatsApp, Reacción o
Miembro activo). Sorteos NO tiene concepto de empate (eso es exclusivo
de Torneos, ver TORNEOS_RESOLUCION_TIPOS arriba) -- este mismo set de
motivos también se usa cuando un ganador de la ruleta resulta
descalificado después de haber salido sorteado (PASO 3 de la sección 1
del consolidado): no es un sistema aparte, es el mismo dropdown de
Razón. Ver _setupSAsistencia() (02_Setup_Hojas.gs), que ahora aplica
esto como dropdown real en vez de texto libre.
```

#### 01B024 — líneas 363-376 (comentario)

```text
Categorías de referencia (orden canónico) para la hoja Extra — col Categoría (L).
FIX (19-ago-2026, pedido usuario): este arreglo controla ÚNICAMENTE el
orden de la hoja Extra / Menú (vía _actualizarMenuDinamico(),
02_Setup_Hojas.gs) — YA NO controla el orden de la hoja Mensajes, que ahora
usa su propio arreglo independiente CFG.MENSAJES_ORDEN_CATEGORIAS (ver
más abajo) vía _getOrdenMensajesCategoria() en 30_Mensajes.gs.
Se agregan las categorías que existían como documentos/plantillas
reales pero faltaban en este arreglo (antes caían al final por
default 9999 vía _agregarCategoriaAExtra()): 'Participantes
calificados (torneo/sorteo)', 'Ganadores (torneo/sorteo)',
'Ascensos y descensos' (agrupadas junto a Torneos/Sorteos, mismo
criterio que ya esperaba CATEGORIAS_ANCLA_EXTRA más arriba) e 'iPhone'
(doc real en Drive, carpeta Plantillas > Otras — ver
DRIVE_FOLDER_ID_PLANTILLAS_OTRAS).
```

#### 01B025 — líneas 386-405 (comentario)

```text
Orden de categorías EXCLUSIVO para la generación de mensajes diarios
(generarTodosMensajes(), 30_Mensajes.gs) — INDEPENDIENTE del orden de
CFG.EXTRA_CATEGORIAS de arriba (ese solo controla Extra/Menú). Pedido
del usuario (19-ago-2026):
  - Días de guerra: el primer mensaje SIEMPRE debe ser 'Día de guerra',
    seguido de los mensajes de guerra ('Mensaje de Guerra', con las
    listas de ataques pendientes).
  - Días de entrenamiento: el primer mensaje SIEMPRE debe ser
    'Defensas de barcos'.
  - En AMBOS casos, después: 'Etiqueta de miembro', luego 'Celular'
    (celulares faltantes), después 'Mazos' y 'iPhone'.
'Defensas de barcos' y 'Día de guerra'/'Mensaje de Guerra' son
mutuamente excluyentes en generarTodosMensajes() (esDiaGuerra decide
cuál de los dos grupos se genera ese día), así que pueden compartir
las primeras posiciones del arreglo sin conflicto: el que corresponda
a ese tipo de día termina siendo, en la práctica, el primer mensaje.
Cualquier categoría que NO esté en este arreglo (ej. una plantilla
Estática nueva agregada en Drive) sigue cayendo al final, en el
mismo orden relativo en que _agregarCategoriaAExtra() la haya
registrado — ver _getOrdenMensajesCategoria() en 30_Mensajes.gs.
```

#### 01B026 — líneas 423-425 (comentario)

```text
Opciones de Tipo para el dropdown de la hoja Índice (col P de Extra).
El orden de este arreglo ES el orden de prioridad usado para ordenar la
hoja Índice (Raíz antes que Secundario, antes que Respaldo).
```

#### 01B027 — líneas 431-434 (comentario)

```text
Orden canónico de las columnas de control, compartido por la hoja Extra
(columnas de referencia N..Q, en ESTE mismo orden) y la hoja Índice
(entre N° y Nombre). Cambiar el orden de este arreglo reordena ambas
hojas la próxima vez que corra runAll/runUpdate.
```

#### 01B028 — líneas 437-441 (comentario)

```text
Configuración inicial recomendada por hoja para la tabla Índice (se usa
SOLO la primera vez que una hoja se agrega automáticamente a Índice; una
vez que la fila existe, el usuario puede editarla libremente y ya no se
vuelve a tocar). Para cualquier hoja que no esté en este mapa, se usa el
valor por defecto genérico (No / Secundario / Solo Lectura).
```

#### 01B029 — líneas 464-469 (comentario)

```text
--- Control de ejecución (locks auto-expirables, ver 00_Main.gs) ---
Si una ejecución de runAll/runUpdate/runGuerra queda "colgada" (p.ej. por
exceder el tiempo máximo de ejecución de Apps Script) más de este tiempo,
el lock se considera vencido y se libera automáticamente para no bloquear
ejecuciones futuras. Ajustar a un valor mayor si la cuenta es Workspace
con límites de ejecución más altos (hasta 30 min en triggers).
```

#### 01B030 — líneas 472-497 (comentario)

```text
Presupuesto de tiempo objetivo para cada "tanda" de runAll/runUpdate antes
de programar una continuación automática vía trigger, dejando margen bajo
el límite real de ejecución de Apps Script (6 min en ejecución manual).
4m45s (antes 5m15s) — se redujo el margen tras observar el 7-jul-2026
una corrida que llegó a 5m59s reales (casi el límite duro de ~6min de
la plataforma) porque un solo paso tardó más de lo previsto entre dos
chequeos de presupuesto. Con el paso Extra/Clan ahora separado (ver
PASOS_RUNALL/PASOS_RUNUPDATE en 00_Main.gs) y más margen aquí, un paso
individual lento tiene menos chance de llegar al límite duro antes de
que el chequeo de presupuesto pueda cortar limpio.

Reducido a 3m30s (antes 4m45s) el 18-jul-2026: una corrida en frío
(runAll() sobre planilla recién reconstruida) murió con "Exceeded
maximum execution time" DENTRO del paso del documento "Mazos personalizados"
(00_Main.gs, paso ya eliminado) — updateDirectorioSheet() había terminado a los
~4m30s (todavía bajo el presupuesto de 4m45s vigente en ese momento), así
que el motor dejó entrar al paso siguiente, que arma la tabla del Doc
fila por fila vía Document Service (7 celdas + varias llamadas de
formato por celda, ×143 jugadores) y con eso solo le quedaban ~1m15-1m30
antes del límite duro de 6 min — no le alcanzó. A diferencia de los
incidentes anteriores, este NO se resuelve separando el paso en dos
(ya estaba solo), sino dejando más margen ANTES de que el motor decida
entrar a un paso pesado sin partir propia: con 3m30s de presupuesto, el
chequeo posterior a updateDirectorioSheet() (a los ~4m30s reales)
hubiera cortado ahí y diferido el Doc a la siguiente tanda, con una
ejecución de 6 min completa para él solo.
```

#### 01B031 — líneas 500-504 (comentario)

```text
FIX (06-ago-2026): runSyncCSV() ahora usa el mismo motor de tandas
(_ejecutarPorTandas(), 00_Main.gs) que runAll()/runUpdate() — antes
ejecutaba syncAllCSV() + respaldarHojasRestantesCSV() en una sola
tanda sin checkpoint real entre pasos, y terminó excediendo el límite
duro de la plataforma ("Exceeded maximum execution time").
```

#### 01B032 — líneas 506-513 (comentario)

```text
FIX (22-ago-2026): runGuerraRapido() se cancelaba por exceder el límite
de ejecución de Apps Script (6 min) — a diferencia de runAll()/
runUpdate()/runSyncCSV(), corría todos sus pasos de un solo tirón, sin
el motor de tandas (_ejecutarPorTandas(), 00_Main.gs) ni checkpoint
alguno. Se le agrega su propio presupuesto, mismo valor que las demás
corridas periódicas, para que si no alcanza a terminar en una sola
ejecución, se programe una continuación automática (10s) en vez de
cortarse a la mitad sin terminar.
```

#### 01B033 — líneas 515-524 (comentario)

```text
NUEVO (09-sep-2026, pedido usuario -- "_continuarProcesarSorteos() /
presupuesto por tandas"): presupuesto para runSorteos()/
_continuarProcesarSorteos() (00_Main.gs), la corrida INDEPENDIENTE del
módulo de sorteos (fuera de runAll()/runUpdate()). Mismo valor que las
demás corridas periódicas/manuales — S_Lista es mucho más liviana que
T_Lista (procesarSListaNuevasFilas() no hace ningún refetch a
RoyaleAPI, a diferencia de procesarTListaNuevasFilas()), así que en la
práctica una sola tanda debería alcanzar siempre, pero se le da el
mismo motor de tandas/continuación que al resto por consistencia y
como resguardo si S_Lista llega a crecer mucho.
```

#### 01B034 — líneas 526-532 (comentario)

```text
Presupuesto interno SOLO para el bucle de /players dentro de
_fetchPlayersData() (09_API_ClashRoyale.gs). El proxy (Render free tier)
puede ser lento, así que este corte es más corto que los anteriores:
si se agota, _fetchPlayersData() guarda en Drive lo ya obtenido y
devuelve false para que se reintente el MISMO paso en la próxima
continuación (en vez de que todo runUpdate()/runAll() se corte de
golpe por el límite de 6 min de Apps Script y pierda el progreso).
```

#### 01B035 — líneas 535-541 (comentario)

```text
Límite MÁXIMO de consultas a /players que se hacen en UNA sola tanda de
_fetchPlayersData() (09_API_ClashRoyale.gs), sin importar cuánto presupuesto
de tiempo (PLAYERS_FETCH_BUDGET_MS) quede todavía disponible. Al llegar
a este límite se corta igual que un corte por tiempo: se guarda el
progreso en Drive y se reintenta el resto en la próxima continuación.
Pensado como un tope adicional de "cuántas peticiones HTTP como máximo
por corrida", independiente del presupuesto de tiempo.
```

#### 01B036 — líneas 544-553 (comentario)

```text
NUEVO (27-sep-2026, pedido usuario -- "partelo en tandas... replica el
guardado de avance también"): mismo patrón que PLAYERS_FETCH_BUDGET_MS/
PLAYERS_FETCH_MAX_POR_TANDA (arriba), pero para el bucle de
_descargarBattlelogYCofresParaTodos() (09_API_ClashRoyale.gs) --
battlelog + upcomingchests, 2 llamadas HTTP por jugador (más una
búsqueda lineal de archivo en Drive por cada una), así que se le da un
presupuesto propio en vez de heredar el de /players. Si se agota, la
función guarda en Drive los tags ya procesados y devuelve `false` para
que se reintente el MISMO paso en la próxima continuación, igual que
_fetchPlayersData().
```

#### 01B037 — líneas 556-561 (comentario)

```text
Tope adicional de cuántos jugadores como máximo se procesan (battlelog +
upcomingchests, los 2) en UNA sola tanda, sin importar cuánto
presupuesto de tiempo (BATTLELOGCHESTS_FETCH_BUDGET_MS) quede todavía
disponible -- mismo criterio que PLAYERS_FETCH_MAX_POR_TANDA. Más bajo
que el de /players porque cada jugador acá cuesta 2 llamadas HTTP + 2
búsquedas de archivo en Drive, no 1 sola.
```

#### 01B038 — líneas 564-575 (comentario)

```text
FIX (07-sep-2026, pedido usuario -- "no se debe recurrir directamente a
RoyaleAPI porque demora, se debe hacer solo como fallback si no
responde el CSV o está vacío (como ahora), pero se debe asignar
tandas para que no falle por quedarse sin tiempo"): presupuesto de
tiempo para el bucle de refetch a RoyaleAPI dentro de
procesarTListaNuevasFilas() (26_Torneos_Core.gs). Mismo patrón que
PLAYERS_FETCH_BUDGET_MS (arriba): si se agota, la función guarda lo ya
recuperado (queda escrito en T_Asistencia al momento, no al final) y
devuelve una señal para que procesarTorneos() corte ahí y
_ejecutarPorTandas() (00_Main.gs) reintente el MISMO paso en la
próxima continuación, en vez de perder el progreso o chocar contra el
límite duro de 6 minutos de Apps Script.
```

#### 01B039 — líneas 578-588 (comentario)

```text
Tope adicional de cuántas consultas a RoyaleAPI se hacen como máximo
en UNA sola tanda de procesarTListaNuevasFilas(), sin importar cuánto
presupuesto de tiempo (TORNEOS_REFETCH_BUDGET_MS) quede disponible --
mismo criterio que PLAYERS_FETCH_MAX_POR_TANDA (arriba). Pensado
sobre todo para el escenario que motivó este fix: si tras un Demoler
quedan MUCHOS torneos "viejos" sin filas en T_Asistencia (porque su
CSV de respaldo también estaba vacío), una ráfaga de decenas de
pedidos seguidos contra royaleapi.com en pocos segundos es justo el
patrón que dispara el reto anti-bot de Cloudflare (ver FASE 19d,
26_Torneos_Core.gs) -- este tope corta la ráfaga aunque el presupuesto
de tiempo todavía no se haya agotado.
```

#### 01B040 — líneas 591-600 (comentario)

```text
FASE 21 (01/08/2026): edad máxima que se acepta para el archivo de
progreso de /players guardado en Drive (ver _cargarProgresoPlayers(),
09_API_ClashRoyale.gs) antes de descartarlo como resto de un ciclo anterior.
Ahora ese archivo sobrevive hasta el final de TODO el ciclo de
runAll()/runUpdate() (no se borra al completar solo /players dentro de
una tanda), para que pasos posteriores en tandas nuevas (Directorio,
Cards, etc.) reutilicen los jugadores ya traídos en vez de volver a
pedirlos a la API. 45 minutos da margen generoso para varias tandas
encadenadas de un mismo ciclo, sin llegar a solaparse con el siguiente
ciclo de runUpdate() (cada 2 horas) si por algún motivo no se limpiara solo.
```

#### 01B041 — líneas 602-607 (comentario)

```text
FIX (06-ago-2026): mismo criterio que PLAYERS_PROGRESO_MAX_EDAD_MS, pero
para el checkpoint de clanes/currentriverrace (ver CLANES_PROGRESO_FILE
y _guardarProgresoClanes()/_cargarProgresoClanes() en 09_API_ClashRoyale.gs).
Antes de este fix, _fetchClanesBasico() no tenía ningún checkpoint que
sobreviviera entre ejecuciones de Apps Script, así que cada continuación
de runAll()/runUpdate() volvía a pedir los 5 clanes a la API desde cero.
```

#### 01B042 — líneas 609-615 (comentario)

```text
NUEVO (27-sep-2026): mismo criterio que PLAYERS_PROGRESO_MAX_EDAD_MS/
CLANES_PROGRESO_MAX_EDAD_MS, pero para el checkpoint de battlelog+
upcomingchests (ver BATTLELOGCHESTS_PROGRESS_FILE y
_guardarProgresoBattlelogChests()/_cargarProgresoBattlelogChests() en
09_API_ClashRoyale.gs). Mismo archivo de progreso sobrevive hasta el
final de TODO el ciclo de runAll() (se limpia en _continuarRunAll(),
junto con _borrarProgresoPlayers()/_borrarProgresoClanes()).
```

#### 01B043 — líneas 618-628 (comentario)

```text
FIX (08-ago-2026): umbral corto exclusivo para runGuerra() (00_Main.gs).
Ese trigger corre cada 10 minutos DENTRO de la ventana de guerra activa
(4-5am hora Perú) y necesita decksUsedToday/Ataques al minuto — reusar
el checkpoint de 45 min (pensado para Directorio/Control/Pendientes)
dejaba los Ataques congelados hasta 40 min por detrás del valor real
para los clanes cuyo checkpoint no se refrescaba a tiempo, aunque Fame
sí llegara actualizado por otra vía. 4 min es menor a los 10 min entre
disparos, así que CADA disparo de runGuerra() vuelve a pedir
/currentriverrace fresco — pero sigue evitando pedirlo dos veces si
varios pasos de la MISMA ejecución (updateGuerraSheet + Guerra_Logs +
Control + Pendientes) llaman a _fetchClanesBasico() seguido.
```

#### 01B044 — líneas 631-640 (comentario)

```text
VENTANA DE GUERRA PROTEGIDA (05-oct-2026, pedido del usuario). Entre las 4:00 y las 4:59 a.m. de Lima
(09:00-09:59 UTC) cada clan cambia de dia de guerra en su propio momento (~4:29 a 4:39 el 05-oct) y
Supercell no garantiza que esa hora se mantenga. En esa ventana SOLO debe correr runGuerra() y en su
version ligera (API -> JSON -> hoja Guerra -> Backup_Guerra.csv). Ese dia runGuerraRapido (4:26 a 4:38)
tomo el candado y cancelo las corridas de runGuerra de las 4:27 y 4:37.
  INI/FIN: limites de la ventana en minutos UTC del dia (9*60 = 09:00 UTC, 10*60 = 10:00 UTC).
  PRE_MARGEN_MIN: desde N minutos ANTES de la ventana ya no se permite empezar ni continuar otra
    ejecucion pesada (runGuerraRapido, runAll, runUpdate, runSyncCSV...), para que ninguna siga viva
    (ni con una continuacion pendiente) cuando empiece la ventana.
  BLOQUEAR_OTROS: false desactiva el bloqueo (solo para una emergencia o una prueba manual).
```

#### 01B045 — líneas 651-665 (comentario)

```text
FIX (02-sep-2026, "corridas de runAll()/runUpdate() muriendo dentro del
paso de Guerra al restaurar semanas faltantes de Backup_Guerra.csv, sin
avanzar de una corrida a la siguiente"): _restaurarGuerraDesdeCSVSiVacia()
(17_GuerraSheet.gs) antes armaba TODAS las filas faltantes en memoria y
recién al final hacía un único setValues() -- si la ejecución se cortaba
por el límite duro de la plataforma (6 min) antes de llegar a esa línea,
no quedaba NADA guardado y la siguiente corrida repetía el mismo trabajo
desde cero (el propio log lo delataba: "probable corrida anterior
interrumpida antes de restaurar", señal de que ya había pasado antes).
Ahora esa función escribe en LOTES de GUERRA_RESTORE_LOTE_FILAS filas por
setValues() (cada lote queda confirmado en la hoja apenas Sheets
responde, así Apps Script mate la ejecución justo después) y corta según
este presupuesto de tiempo, devolviendo `false` para que
_ejecutarPorTandas() (00_Main.gs) reintente el MISMO paso en la próxima
continuación, retomando solo lo que de verdad falta.
```

#### 01B046 — líneas 668-671 (comentario)

```text
Filas por lote en _restaurarGuerraDesdeCSVSiVacia() (ver
GUERRA_RESTORE_BUDGET_MS arriba). Tope adicional de "cuántas filas como
máximo por escritura", independiente del presupuesto de tiempo -- mismo
criterio que PLAYERS_FETCH_MAX_POR_TANDA.
```

#### 01B047 — líneas 674-684 (comentario)

```text
Presupuesto interno SOLO para el bucle de respaldarHojasDerivadasCSV()
(05_Backup_CSV.gs). Ese paso puede terminar procesando ~15+ hojas en una
sola invocación (Extra, Control, Pendientes, Cards_2, Players, etc.),
y como es EL ÚLTIMO paso pesado de la corrida, suele arrancar ya cerca
del borde de RUNALL_PRESUPUESTO_MS (3m30s) — sin un corte propio,
sumar el tiempo de todas esas hojas en un solo tirón puede llegar al
límite duro de la plataforma (6m30s) a mitad de camino, sin haber
podido guardar progreso. Deliberadamente corto (bastante menos que
PLAYERS_FETCH_BUDGET_MS) porque se mide desde el inicio de CADA
invocación de este paso, que puede empezar en cualquier punto del
presupuesto general ya consumido.
```

#### 01B048 — líneas 687-698 (comentario)

```text
FIX (16-ago-2026): presupuesto interno SOLO para el bucle de
autoajustarAnchoColumnas() (04_Formato_Comun.gs) cuando procesa TODAS las
hojas (sin argumento nombreHoja) -- agregado como paso propio de
PASOS_RUNALL. autoResizeColumns() es una llamada cara (repinta la
hoja), y con 20+ hojas visibles en el spreadsheet, sumar el tiempo de
todas en un solo tirón sin cortes podía llegar al límite duro de la
plataforma (6m30s) a mitad de camino -- mismo riesgo que ya se corrigió
para el paso de Backup CSV: Guerra + celulares (ver PASOS_RUNALL,
00_Main.gs) y para respaldarHojasDerivadasCSV() (RESPALDO_DERIVADAS_
BUDGET_MS, arriba). Mismo valor conservador que ese último por el mismo
motivo: se mide desde el inicio de CADA invocación de este paso, que
puede empezar en cualquier punto del presupuesto general ya consumido.
```

#### 01B049 — líneas 701-716 (comentario)

```text
FIX (17-ago-2026): presupuesto interno SOLO para el bucle de
limpiarLinksAccidentalesDeNombres() (11_DirectorioSheet.gs). Ese paso
recorre TODAS las hojas del spreadsheet y, por cada columna Nombre/
Nombre Jugador/Jugador/Nom_Multi/Clan que encuentra, hace un
getRichTextValues() sobre el rango completo -- notablemente más lento
que getValues(), y sin cortes propios podía sumar el tiempo de TODAS
las hojas (incluida Guerra, que crece cada día y tiene columnas Nombre
y Clan con miles de filas) en un solo tirón. El 17-ago-2026 una corrida
murió con "Exceeded maximum execution time" (límite duro de la
plataforma, 6m30s) DENTRO de este paso -- el chequeo de presupuesto de
_ejecutarPorTandas() solo corre ENTRE pasos, así que _continuarRunAll
nunca se volvió a llamar y la corrida quedó a medias hasta que el lock
expiró solo. Mismo patrón/valor conservador que RESPALDO_DERIVADAS_
BUDGET_MS y AUTOAJUSTE_ANCHO_BUDGET_MS (arriba), por el mismo motivo:
se mide desde el inicio de CADA invocación de este paso, que puede
empezar en cualquier punto del presupuesto general ya consumido.
```

#### 01B050 — líneas 719-738 (comentario)

```text
FIX (02-sep-2026, pedido usuario — diagnóstico de timeouts en runAll()):
syncAcumulativosCSV() (05_Backup_CSV.gs) corría syncInactivosCSV() + las
7 hojas acumulativas restantes de un solo tirón, sin ningún punto de
control interno propio (a diferencia de respaldarHojasDerivadasCSV(),
arriba, que ya reparte su trabajo en tandas). El riesgo se agravó el
mismo día: syncInactivosCSV() ahora puede, cuando la hoja Inactivos
encogió respecto al último Backup_Inactivos.csv (reactivaciones/pases a
Vetados en la misma corrida), llamar a _compararInactivosConCSV() —que
lee Inactivos completa (~993 filas y creciendo), lee TODO el Directorio
sin muestreo, y hace una consulta en vivo a la API (_fetchClanesBasico(),
memoizada pero de hasta 10-15s en frío)—. Ahora syncAcumulativosCSV()
procesa sus 8 trabajos (Inactivos + 7 hojas) de a uno, chequeando este
presupuesto entre cada uno; si se agota antes de terminar, guarda en qué
trabajo se quedó (ScriptProperties) y devuelve `false` para que
_ejecutarPorTandas() reintente este MISMO paso en la próxima
continuación. Mismo valor conservador que RESPALDO_DERIVADAS_BUDGET_MS/
AUTOAJUSTE_ANCHO_BUDGET_MS/LIMPIAR_LINKS_BUDGET_MS
(arriba), por el mismo motivo: se mide desde el inicio de CADA
invocación de este paso, que puede empezar en cualquier punto del
presupuesto general ya consumido.
```

#### 01B051 — líneas 741-758 (comentario)

```text
FIX (02-sep-2026): _limpiarLinksAccidentalesEnHoja(sh) — la versión
PUNTUAL de una sola hoja (11_DirectorioSheet.gs), distinta de la barrida
general limpiarLinksAccidentalesDeNombres() que SÍ ya tiene su propio
presupuesto (LIMPIAR_LINKS_BUDGET_MS, arriba) — se llama SIN protección
ninguna desde dentro de updateGuerraSheet() (17_GuerraSheet.gs), en CADA
corrida de runGuerra() (hasta cada 10 min dentro de la ventana 4-5am).
Es exactamente el mismo patrón de getRichTextValues() sobre columnas
Nombre/Clan que ya causó la muerte por "Exceeded maximum execution time"
documentada en el comentario de LIMPIAR_LINKS_BUDGET_MS (17-ago-2026),
pero acá sobre UNA sola llamada que no se puede cortar a la mitad (no
hay varias hojas entre las que repartir un chequeo de presupuesto como
en la barrida general). La única protección posible para una llamada
atómica así es no dispararla si no hace falta: se throttlea a un máximo
de 1 vez cada este intervalo (ver _guerraLimpiarLinksUltimaVezMs en
ScriptProperties, updateGuerraSheet()) — los enlaces accidentales de
Nombre/Clan no aparecen con tanta frecuencia como para necesitar
limpiarse cada 10 minutos, y runAll()/runUpdate() de todos modos ya
corren la barrida general aparte (ver comentario junto al call site).
```

#### 01B052 — líneas 761-777 (comentario)

```text
FIX (04-sep-2026): el throttle de arriba (1 vez/hora) reduce CUÁNTAS
veces se dispara _limpiarLinksAccidentalesEnHoja(sh) sobre Guerra, pero
no protege la corrida puntual en que SÍ le toca dispararse: si para ese
momento la hoja Guerra ya creció mucho (9000+ filas y sigue subiendo,
ver Backup_Guerra.csv) y/o los pasos anteriores de updateGuerraSheet()
ya consumieron buena parte del presupuesto de 6 min del trigger, la
llamada puede no alcanzar a terminar y tirar abajo TODA la corrida con
"Exceeded maximum execution time" (caso real: 04-sep-2026, ~05:01 UTC,
corrida completa perdida en el minuto 6 sin ningún dato corrupto, pero
sin actualizar Guerra esa vuelta). Este límite es el tope de tiempo YA
transcurrido (medido desde _tGS0 en updateGuerraSheet()) a partir del
cual esta llamada se SALTA por completo en esta corrida (sin marcar
_guerraLimpiarLinksUltimaVezMs, para que se reintente en la próxima
corrida en vez de esperar otra hora entera). No evita el riesgo si la
hoja sigue creciendo indefinidamente, pero da margen real para que la
llamada, una vez iniciada, tenga tiempo de terminar sin comerse el
límite duro del trigger.
```

#### 01B053 — líneas 780-793 (comentario)

```text
FIX (07-sep-2026): reemplaza el enfoque de _limpiarLinksAccidentalesEnHoja()
(relectura ATÓMICA de TODA la columna Nombre/Clan en cada corrida) por
_limpiarLinksAccidentalesGuerraIncremental() (17_GuerraSheet.gs), que solo
relee el tramo de filas NUEVAS desde la última corrida (guardado en
ScriptProperties) — Guerra es un registro histórico append-only dentro de
la temporada, así que las filas viejas no necesitan revisarse de nuevo.
Aun así, se agrega este presupuesto interno como red de seguridad: si el
tramo pendiente fuera grande (primera corrida tras desplegar este fix, o
justo después de un reinicio de temporada que resetea el watermark), la
función corta al acercarse a este límite, guarda el avance REAL logrado
(no todo el tramo) y retoma el resto en la siguiente corrida, sin arriesgar
el límite duro de 6 min del trigger. Caso real que motivó este fix: la
llamada atómica anterior pasó de ~110s a ~190s+ en pocas horas (logs
06/07-sep-2026) y tiró abajo corridas completas de runGuerra().
```

#### 01B054 — líneas 796-809 (comentario)

```text
FIX (02-sep-2026): runGuerra() (00_Main.gs) es monolítica — a diferencia
de runAll()/runUpdate()/runGuerraRapido(), NO usa _ejecutarPorTandas() ni
guarda checkpoint alguno, así que un paso lento dentro de ella no puede
reanudarse, solo perder el disparo completo. _syncGuerraCSV() (llamada
desde runGuerra() con throttle de 1 vez/hora) lee getRichTextValues()
sobre TODA la hoja Guerra (documentado como lento, ver comentario junto
a su llamada) y ya se ha visto consumir el resto del presupuesto de la
corrida sin dejar rastro en el log (corrida de las 2:01 a.m., "Pendientes
hoja limpia" seguido de silencio hasta el timeout). Como no se puede
reanudar a mitad de _syncGuerraCSV(), la única protección posible es NO
dispararla si ya no queda margen razonable en la corrida — se salta esa
hora puntual (el respaldo queda como máximo ~1h más desactualizado, sin
pérdida de datos: Backup_Guerra.csv no es la única copia) y se reintenta
en el próximo disparo horario.
```

#### 01B055 — líneas 812-815 (comentario)

```text
FASE 6 (05-ago-2026, cierre del plan de migración Plantillas -> Menú):
se elimina PLANTILLAS_CLANES — era una constante muerta (confirmado que
no se usaba en ningún otro archivo del proyecto), y con la hoja
Plantillas ya eliminada dejó de tener sentido conservarla.
```

#### 01B056 — líneas 817-823 (comentario)

```text
Colores de fondo por letra de día (para formato condicional en Guerra)
FIX (30-ago-2026): antes había un único CFG.COLORES_DIA compartido entre
Guerra y Guerra_Logs, con tonos demasiado pálidos (casi blancos, p.ej.
'D':'#fafafa') que en la hoja Guerra apenas se distinguían. Se separan
en dos paletas: COLORES_DIA_GUERRA (pastel pero más saturado, para que
se note bien en la hoja Guerra) y COLORES_DIA_GUERRA_LOGS (pastel algo
más suave que Guerra, pero ya visible, para la hoja Guerra_Logs).
```

#### 01B057 — líneas 855-860 (comentario)

```text
Paleta cíclica de colores pastel para agrupar visualmente las filas
de T_Asistencia por ID de torneo (mismo ID = mismo color). Se cicla
con (índice de aparición del ID) % length — ver
_aplicarFormatoCondicionalTAporTorneo() en 26_Torneos_Core.gs. Mismo
patrón que CAL_SEM (arriba), pero con más colores para que dos
torneos consecutivos rara vez compartan color en tablas largas.
```

#### 01B058 — líneas 865-867 (comentario)

```text
Colores pastel de fondo para la hoja Vetados, según columna "Razón".
'NARANJA x' usa el naranja (es el clan que vetó); cada otra razón tiene
su propio color pastel distinto, en vez de agruparse todas en uno solo.
```

#### 01B059 — líneas 877-880 (comentario)

```text
CARDS_RARITY_BG — ELIMINADO (06-ago-2026). Era el mapa de colores para
el formato condicional de la hoja Cards (_aplicarFmtCondicionalCards(),
31_Cards_Mazos.gs). Cards ya no es una hoja (vive solo en Backup_Cards.csv,
ver 31_Cards_Mazos.gs), así que no hay ningún formato de hoja que aplicar.
```

#### 01B060 — líneas 882-893 (comentario)

```text
Colores pastel de fondo para la hoja Ascensos, según columna "Tipo".
Se usan en formato condicional (fila completa) — ver
_aplicarFormatoCondicionalAscensos() en 24_Historial_Ascensos.gs.
FASE 5 (13-sep-2026, pedido del usuario, plan de Cambio de Rango): se
agregan 'Expulsión' y 'Elegible Admin' -- los dos valores nuevos de
ASC.TIPO que puede generar _registrarPropuestasCRListaEnHistorial()
(24_Historial_Ascensos.gs) para propuestas de CR_Lista que
NO son un Ascenso/Degradación de rango dentro del clan: 'Expulsión'
(Miembro que no cumple Descenso -- candidato a salir del clan, no a
bajar de rango) y 'Elegible Admin' (Colíder que cumple Ascenso -- solo
marca elegibilidad, requiere decisión humana, NUNCA genera un ascenso
de rango automático).
```

#### 01B061 — líneas 899-901 (comentario)

```text
4-oct-2026 (Fase 14, aviso d de 26_Torneos_Core.gs): tipo nuevo 'Ascenso de clan' que
_registrarPropuestasCRListaEnHistorial() guarda para el Colider de una cantera que sube de clan
(AscensoClan, llega como Miembro). Azul pastel, distinto de Ascenso (verde) y Elegible Admin (amarillo).
```

#### 01B062 — líneas 908-913 (comentario)

```text
Mínimo de puntaje de guerra por defecto para torneo — respaldo SOLO
para cuando un clan tiene Min_T activo en T_Lista (fila más reciente de
ese clan, ver _getConfigMasRecienteCategoria(), 26_Torneos_Core.gs) pero
la celda de cantidad quedó vacía o en 0. Min_G se usa en
sorteo, Min_T se usa en torneo. Ya NO hay una columna Min_T en la
hoja Clan (eliminada, ver PARCHES_MIN_T.md).
```

#### 01B063 — líneas 916-919 (comentario)

```text
Colores pastel de fondo para la hoja Mensajes, según columna "Tipo".
Se usan en formato condicional (fila completa, solo columnas con datos).
Colores pastel por Categoría en la hoja Mensajes (nueva nomenclatura).
La regla de formato condicional evalúa la columna Categoría (col 8).
```

#### 01B064 — líneas 926-931 (comentario)

```text
Categorías "Estáticas" (Plantillas) que ahora también se replican en
Mensajes (ver generarTodosMensajes(), 30_Mensajes.gs) — necesitan su
propio color para que _aplicarFormatoCondicionalMensajes() las pinte
igual que a las categorías Dinámicas. "Descripción" queda afuera a
propósito: esa categoría NO se muestra en Mensajes (ver filtro en
generarTodosMensajes()).
```

#### 01B065 — líneas 938-943 (comentario)

```text
Pedido usuario (ago-2026): Participantes/Ganadores de torneo y sorteo
no tenían color (no estaban en este mapa) — se agregan acá. Estas 4
categorías además se ocultan automáticamente y se mueven al final de
la hoja Mensajes (ver CATEGORIAS_OCULTAS_MENSAJES, 30_Mensajes.gs),
pero se les da color igual para que se identifiquen bien al
mostrarlas manualmente (showRows) o al revisarlas en la hoja Menú.
```

#### 01B066 — líneas 949-954 (comentario)

```text
Pedido usuario (11/08/2026): "Ascensos y descensos" (categoría
Estática, doc "Ascensos y descensos - Comunidad - ..." — ver
NOMBRE_DOC_ASCENSOS_DESCENSOS en 25_Doc_AscensosDescensos.gs) tampoco
tenía color. Se oculta igual que Participantes/Ganadores (ver
CATEGORIAS_OCULTAS_MENSAJES, 30_Mensajes.gs) pero se le da color por
el mismo motivo: identificarla bien al mostrarla manualmente.
```

#### 01B067 — líneas 958-961 (comentario)

```text
Fórmula del título combinado D1:P2 de la hoja Control. Usa SWITCH()
para traducir la letra de Extra!C2 (L/M/X/J/V/S/D) a su nombre completo
(ver también CFG.DIA_NOMBRES, usado del lado de Apps Script para el
mismo propósito en otros contextos que no son fórmulas de hoja).
```

#### 01B068 — líneas 967-970 (comentario)

```text
FIX (13-ago-2026, pedido usuario): fórmula del título dinámico D1:K2 de
la hoja Nuevos. Misma lógica que CONTROL_TITULO_FORMULA (Extra!A2/B2/C2),
pero sin el prefijo "CONTROL DE GUERRA -". Ver _pintarEncabezadosNuevos()
en 14_Nuevos_RoyaleAPI.gs.
```

#### 01B069 — líneas 976-986 (comentario)

```text
Cuentas ocultas manualmente: se tratan como si NO existieran en ningún
clan, en NINGUNA hoja (Directorio, Guerra, Control, Pendientes,
Mensajes, etc.) — ver esTagOculto() más abajo, usado como filtro único
en _fetchClanesBasico() (09_API_ClashRoyale.gs) y en _construirFilasDirectorio()
(01_Config_Global.gs). Caso de uso: una cuenta baneada por Supercell
que ya no se puede expulsar desde la app del clan (el botón de expulsar
no funciona) pero que tampoco debe seguir apareciendo como miembro.
  #JV2CCCP28: cuenta baneada por Supercell de forma aparentemente
  irreversible (no se puede expulsar del clan) — agregada el 04-jul-2026.
  NOTA: #CGGGR82PJ había sido agregada por error el 03-jul-2026 (no es
  la cuenta baneada) y se retiró de esta lista el 04-jul-2026.
```

#### 01B070 — líneas 990-1006 (comentario)

```text
---------------------------------------------------------------------------
INTERRUPTOR PLAYERS_API_ENABLED
Controla si y cómo se llama al endpoint /players/{tag}.
  false     -> NO llama /players para NADIE, ni siquiera admins. V_Guerra
               y el resto de campos de /players conservan el valor previo
               del CSV/hoja.
  'admin'   -> llama /players SOLO para las cuentas marcadas Admin='Sí'
               en Directorio (activas o inactivas).
  'partial' -> llama a los admins + a quienes tienen V_Guerra vacío en
               Directorio.
  true      -> llama /players para todos los activos Terna (incluye admins).

FASE (02/08/2026): antes 'false' igual llamaba /players para los admins
(para que Cards_2/Directorio no los dejara desactualizados). Ese
comportamiento se movió a su propio modo explícito ('admin'): 'false' es
ahora un apagado total, sin excepciones.
---------------------------------------------------------------------------
```


### Ubicación: `PLAYERS_API_ENABLED`

#### 01B071 — líneas 1009-1027 (comentario)

```text
---------------------------------------------------------------------------
INTERRUPTOR BATTLELOGCHESTS_API_ENABLED
NUEVO (29-sep-2026, pedido de la usuaria): interruptor APARTE de
PLAYERS_API_ENABLED, solo para /battlelog y /upcomingchests de la corrida
masiva (_descargarBattlelogYCofresParaTodos(), 09_API_ClashRoyale.gs, paso
de PASOS_RUNALL). Antes esos dos endpoints iban atados a
PLAYERS_API_ENABLED === true: cada vez que se activaba /players para todos,
se descargaban tambien battlelog y cofres de todos.
  true  -> la corrida masiva descarga battlelog y upcomingchests de los
           jugadores que tengan /players en cache en esa corrida (los que
           deja PLAYERS_API_ENABLED: con 'partial' seran solo admins +
           nuevos; con true, todos los activos Terna; con false, ninguno).
  false -> la corrida masiva NO los descarga (valor recomendado). La web
           los descarga A PEDIDO, una vez por dia (Lima) y por Tag, y los
           guarda en Drive (ver _webObtenerJsonJugadorDelDia(),
           37_Web_API.gs). Los JSON ya guardados en Drive siguen sirviendo
           de respaldo si la API no responde.
Volver a ponerlo en false despues de una descarga masiva.
---------------------------------------------------------------------------
```


### Ubicación: `BATTLELOGCHESTS_API_ENABLED`

#### 01B072 — líneas 1030-1040 (comentario)

```text
---------------------------------------------------------------------------
INTERRUPTOR SUPRIMIR_PLAYERS_TEMPORAL (Fase 1 del plan de cambios)
Interruptor de "esta corrida no debe tocar /players bajo ningún concepto",
independiente de PLAYERS_API_ENABLED. Pensado para ejecuciones puntuales
(p.ej. una función rápida de guerra) que necesitan reconstruir Directorio
con los datos YA existentes en las hojas Players/Links, sin disparar
ninguna llamada HTTP nueva a /players — ni siquiera para admins.
_fetchPlayersData() (09_API_ClashRoyale.gs) corta de inmediato si esto es true.
Quien lo active debe volver a ponerlo en false al terminar (usar
try/finally) para no afectar corridas normales de runUpdate()/runAll().
---------------------------------------------------------------------------
```


### Ubicación: `SUPRIMIR_PLAYERS_TEMPORAL`

#### 01B073 — líneas 1043-1131 (comentario)

```text
---------------------------------------------------------------------------
IDs DE CARPETAS DRIVE
Configurar con los IDs reales de las carpetas en Google Drive.

REORGANIZACIÓN DE DRIVE (25-sep-2026, pedido del usuario): el usuario
reordenó "JSON" y metió las subcarpetas de respaldo de API (antes sueltas
directo dentro de "JSON") en una nueva carpeta contenedora "Endpoints".
Dentro de "Endpoints", "Clans" y "CurrentRiverRace" ahora son carpetas de
ENDPOINT que contienen, cada una, una subcarpeta POR CLAN (antes era al
revés: cada clan tenía una carpeta raíz con "Clans"/"CurrentRiverRace"
adentro). "Otros" y "RoyaleAPI" quedaron sueltas dentro de "JSON", NO
entraron a "Endpoints". Todos los IDs de abajo están confirmados contra
el id.csv que pasó el usuario, carácter por carácter (no contra una
captura de pantalla).

PENDIENTE DE FASE SIGUIENTE (pedido explícito del usuario: "solo guarda
las carpetas con los ID en el código"): por ahora esta reorganización
SOLO queda declarada como constantes, más abajo. La lógica real de
guardado (_getCarpetaParaClan(), _getSubcarpetaEndpoint_(),
_SUBCARPETAS_CLAN_ y CARPETAS_JSON_POR_ENDPOINT_, las cuatro en
09_API_ClashRoyale.gs) TODAVÍA arma el camino a la carpeta del clan con
el esquema VIEJO (clan → endpoint) y con los IDs viejos de
_SUBCARPETAS_CLAN_, que ya NO son los que aparecen en el CSV nuevo (el
CSV nuevo no trae una "carpeta raíz por clan" equivalente: ahora cada
clan tiene una subcarpeta distinta dentro de "Clans" y otra distinta
dentro de "CurrentRiverRace"). Mientras no se actualice esa lógica,
guardarApiDump() sigue escribiendo en las carpetas de clan viejas (que
pueden haber quedado huérfanas tras el reordenamiento en Drive), NO en
las nuevas de abajo. Ver AVISOS ABIERTOS al inicio de
09_API_ClashRoyale.gs para el detalle y las dos constantes nuevas
(_SUBCARPETAS_CLAN_POR_ENDPOINT_CLANS_ y
_SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_) ya listas para
engancharse ahí en esa fase siguiente.

REFERENCIA RÁPIDA (nombre visible en Drive -> constante en el código):
  "Respaldo"      (carpeta raíz)      -> DRIVE_FOLDER_ID_RESPALDO
  "Plantillas"    (dentro de Respaldo)-> DRIVE_FOLDER_ID_PLANTILLAS
    "Torneos y sorteos" (dentro de Plantillas) -> DRIVE_FOLDER_ID_PLANTILLAS_TORNEOS_SORTEOS
    "Otras"              (dentro de Plantillas) -> DRIVE_FOLDER_ID_PLANTILLAS_OTRAS
    "Mazos"               (dentro de Plantillas) -> DRIVE_FOLDER_ID_PLANTILLAS_MAZOS
    "Descripciones"       (dentro de Plantillas) -> DRIVE_FOLDER_ID_PLANTILLAS_DESCRIPCIONES
    "Bienvenidas"         (dentro de Plantillas) -> DRIVE_FOLDER_ID_PLANTILLAS_BIENVENIDAS
  (las 5 de arriba se recorren en conjunto vía DRIVE_FOLDERS_PLANTILLAS_SUB
  y _buscarArchivoEnPlantillas() — ver más abajo)
  "JSON"          (dentro de Respaldo)-> DRIVE_FOLDER_ID_JSON
    "Endpoints" (dentro de JSON) -> DRIVE_FOLDER_ID_ENDPOINTS (NUEVA, sin uso todavía)
      "Battlelog"        (dentro de Endpoints) -> DRIVE_FOLDER_ID_BATTLELOG (EN USO desde 25-sep-2026: JSON crudo por jugador, vía descargarBattlelogJugador(), MANUAL, 09_API_ClashRoyale.gs)
      "Cards"            (dentro de Endpoints) -> DRIVE_FOLDER_ID_CARDS (EN USO desde 25-sep-2026: Cache_Cards.json, vía descargarCards(), 09_API_ClashRoyale.gs)
      "Clans"            (dentro de Endpoints) -> DRIVE_FOLDER_ID_CLANS (NUEVA, sin uso; contenedora, 1 subcarpeta por clan)
        "Grupo乂Terna™" (dentro de Clans) -> _SUBCARPETAS_CLAN_POR_ENDPOINT_CLANS_['grupo乂terna™'] (09_API_ClashRoyale.gs, NUEVA, sin uso)
        "GrupoXTerna™2" (dentro de Clans) -> _SUBCARPETAS_CLAN_POR_ENDPOINT_CLANS_['grupoxterna™2'] (09_API_ClashRoyale.gs, NUEVA, sin uso)
        "GrupoXTerna™3" (dentro de Clans) -> _SUBCARPETAS_CLAN_POR_ENDPOINT_CLANS_['grupoxterna™3'] (09_API_ClashRoyale.gs, NUEVA, sin uso)
        "Mini乂Ternas™" (dentro de Clans) -> _SUBCARPETAS_CLAN_POR_ENDPOINT_CLANS_['mini乂ternas™'] (09_API_ClashRoyale.gs, NUEVA, sin uso)
        "NARANJA x"     (dentro de Clans) -> _SUBCARPETAS_CLAN_POR_ENDPOINT_CLANS_['naranja x'] (09_API_ClashRoyale.gs, NUEVA, sin uso)
      "CurrentRiverRace" (dentro de Endpoints) -> DRIVE_FOLDER_ID_CURRENTRIVERRACE (NUEVA, sin uso; contenedora, 1 subcarpeta por clan)
        "Grupo乂Terna™" (dentro de CurrentRiverRace) -> _SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_['grupo乂terna™'] (09_API_ClashRoyale.gs, NUEVA, sin uso)
        "GrupoXTerna™2" (dentro de CurrentRiverRace) -> _SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_['grupoxterna™2'] (09_API_ClashRoyale.gs, NUEVA, sin uso)
        "GrupoXTerna™3" (dentro de CurrentRiverRace) -> _SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_['grupoxterna™3'] (09_API_ClashRoyale.gs, NUEVA, sin uso)
        "Mini乂Ternas™" (dentro de CurrentRiverRace) -> _SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_['mini乂ternas™'] (09_API_ClashRoyale.gs, NUEVA, sin uso)
        "NARANJA x"     (dentro de CurrentRiverRace) -> _SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_['naranja x'] (09_API_ClashRoyale.gs, NUEVA, sin uso)
      "Locations"        (dentro de Endpoints) -> DRIVE_FOLDER_ID_LOCATIONS (EN USO desde 25-sep-2026: Cache_Locations.json, vía descargarLocations(), 09_API_ClashRoyale.gs)
      "Players"          (dentro de Endpoints) -> DRIVE_FOLDER_ID_PLAYERS (YA EXISTÍA; antes colgaba directo de "JSON", el usuario la movió dentro de "Endpoints" — mismo ID, no cambia nada en el código)
      "Ranking"          (dentro de Endpoints) -> DRIVE_FOLDER_ID_RANKING (NUEVA, sin uso; contenedora)
        "Copas"                        (dentro de Ranking)             -> DRIVE_FOLDER_ID_RANKING_COPAS (EN USO desde 25-sep-2026: Cache_RankingGlobalClanes.json, vía descargarRankingGlobalClanes(), MANUAL, 09_API_ClashRoyale.gs)
        "Guerra"                       (dentro de Ranking)             -> DRIVE_FOLDER_ID_RANKING_GUERRA (EN USO desde 25-sep-2026: Cache_RankingGlobalGuerraClanes.json, vía descargarRankingGlobalGuerraClanes(), MANUAL, 09_API_ClashRoyale.gs)
        "Jugadores"                    (dentro de Ranking)             -> DRIVE_FOLDER_ID_RANKING_JUGADORES (EN USO desde 25-sep-2026: Cache_RankingGlobalJugadores.json, vía descargarRankingGlobalJugadores(), MANUAL, 09_API_ClashRoyale.gs; sigue siendo contenedora, ver "Camino de leyendas" y "Global" abajo -- CORRECCIÓN 26-sep-2026: son HERMANAS, ninguna anidada dentro de la otra, no "Camino de leyendas" > "Global" como decía antes esta línea)
          "Camino de leyendas"         (dentro de Jugadores, HERMANA de "Global") -> DRIVE_FOLDER_ID_RANKING_JUGADORES_CAMINO_LEYENDAS (EN USO desde 26-sep-2026: vía descargarRankingGlobalJugadoresCaminoLeyendasPorTemporada()/descargarRankingJugadoresCaminoLeyendasPorUbicacion(), MANUAL, 09_API_ClashRoyale.gs)
          "Global"                     (dentro de Jugadores, HERMANA de "Camino de leyendas") -> DRIVE_FOLDER_ID_RANKING_JUGADORES_GLOBAL (EN USO desde 25/26-sep-2026: vía descargarRankingGlobalJugadores()/descargarRankingJugadoresPorUbicacion(), MANUAL, 09_API_ClashRoyale.gs)
      "Seasons"          (dentro de Endpoints) -> DRIVE_FOLDER_ID_SEASONS (EN USO desde 25-sep-2026: Cache_Seasons.json, vía descargarSeasons(), 09_API_ClashRoyale.gs)
      "Torneos"          (dentro de Endpoints) -> DRIVE_FOLDER_ID_TORNEOS (YA EXISTÍA; antes colgaba directo de "JSON", el usuario la movió dentro de "Endpoints" — mismo ID, no cambia nada en el código)
        "Globales"       (dentro de Torneos) -> DRIVE_FOLDER_ID_TORNEOS_GLOBALES (EN USO desde 25-sep-2026: Cache_GlobalTournaments.json, vía descargarGlobalTournaments(), 09_API_ClashRoyale.gs)
        "Terna"          (dentro de Torneos) -> DRIVE_FOLDER_ID_TORNEOS_TERNA (EN USO desde 14-oct-2026: Torneo - <tag>.json de torneos cuyo creador estaba en un clan Terna, vía _guardarJsonTorneoEnDrive(), 26_Torneos_Core.gs; ver §PF078)
        "Locales"        (dentro de Torneos) -> DRIVE_FOLDER_ID_TORNEOS_LOCALES (NUEVA, SIN USO a propósito: no existe endpoint de torneos locales; ver §PF078)
      "UpcomingChests"   (dentro de Endpoints) -> DRIVE_FOLDER_ID_UPCOMINGCHESTS (EN USO desde 25-sep-2026: JSON crudo por jugador, vía descargarUpcomingChestsJugador(), MANUAL, 09_API_ClashRoyale.gs)
    "Otros"       (dentro de JSON, NO dentro de Endpoints) -> DRIVE_FOLDER_ID_OTROS (EN USO PARCIAL desde 25-sep-2026 fase B; ver checklist de AVISOS ABIERTOS / FASE B en 09_API_ClashRoyale.gs)
    "RoyaleAPI"   (dentro de JSON, NO dentro de Endpoints) -> DRIVE_FOLDER_ID_ROYALEAPI (NUEVA; antes era "carpeta contenedora, sin constante propia")
      "Individual" (dentro de RoyaleAPI) -> DRIVE_FOLDER_ID_ROYALEAPI_INDIVIDUAL (20_HistorialGuerraJugador.gs)
      "Grupal"     (dentro de RoyaleAPI) -> DRIVE_FOLDER_ID_ROYALEAPI_GRUPAL (20_HistorialGuerraJugador.gs)
  "CSV"           (dentro de Respaldo)-> DRIVE_FOLDER_ID_CSV

Los _SUBCARPETAS_CLAN_ viejos (09_API_ClashRoyale.gs, con sus 5 IDs de
carpeta-raíz-por-clan) NO se listan acá porque ya no corresponden a
ninguna carpeta de este árbol reordenado; siguen documentados y sin
tocar en ese archivo, porque son los que usa hoy el código real.

Si el usuario menciona una carpeta por su nombre de Drive (ej. "la carpeta
Nuevos" o "la carpeta NARANJA x"), usar esta tabla para ubicar la
constante/archivo correcto en vez de pedir el ID de nuevo o verificar a
mano en Drive.
---------------------------------------------------------------------------
Carpeta donde se guardan los archivos CSV de backup. Nombre en Drive: "CSV".
```


### Ubicación: `DRIVE_FOLDER_ID_CSV`

#### 01B074 — líneas 1134-1137 (comentario)

```text
Carpeta raíz donde se guardan los JSON de backup de API (clans, currentriverrace).
Dentro de esta carpeta existen subcarpetas por clan; los JSON se enrutan
automáticamente a la subcarpeta del clan que aparece en su nombre.
Nombre en Drive: "JSON".
```


### Ubicación: `DRIVE_FOLDER_ID_JSON`

#### 01B075 — líneas 1140-1145 (comentario)

```text
Carpeta donde se guardan los JSON de /players. Un archivo por jugador
(nombre = tag del jugador), se actualiza en cada consulta, nunca se elimina.
Nombre en Drive: "Players" (subcarpeta dentro de "JSON" > "Endpoints" desde
la reorganización del 25-sep-2026; mismo ID de siempre, la carpeta solo
cambió de padre en Drive, no de identidad).
Nota: DRIVE_FOLDER_ID_PLAYERS también se declara en 01_Config_Global.gs donde se usa.
```


### Ubicación: `DRIVE_FOLDER_ID_PLAYERS`

#### 01B076 — líneas 1148-1154 (comentario)

```text
Carpeta contenedora "RoyaleAPI" (dentro de "JSON", NO dentro de
"Endpoints" — quedó fuera de esa reorganización). Antes no tenía
constante propia ("carpeta contenedora, sin constante propia"); se agrega
acá el 25-sep-2026 porque ahora se tiene su ID confirmado por CSV. Sin uso
en el código todavía: sus dos subcarpetas reales (Individual/Grupal, ver
las dos constantes de abajo) ya tienen su propia constante y se siguen
usando por esas, no por esta.
```


### Ubicación: `DRIVE_FOLDER_ID_ROYALEAPI`

#### 01B077 — líneas 1157-1161 (comentario)

```text
Histórico de Guerra por jugador (RoyaleAPI vía Tampermonkey — NO viene de la
API oficial de Supercell, por eso son carpetas separadas de Players).
Un JSON por jugador (nombre = tag), array de registros semanales adentro.
Nombre en Drive: "Individual" (subcarpeta dentro de "JSON/RoyaleAPI").
Ver 20_HistorialGuerraJugador.gs.
```


### Ubicación: `DRIVE_FOLDER_ID_ROYALEAPI_INDIVIDUAL`

#### 01B078 — líneas 1164-1166 (comentario)

```text
CSV consolidado (una fila por jugador+temporada+semana), equivalente
grupal del histórico anterior. Nombre en Drive: "Grupal" (subcarpeta
dentro de "JSON/RoyaleAPI"). Ver 20_HistorialGuerraJugador.gs.
```


### Ubicación: `DRIVE_FOLDER_ID_ROYALEAPI_GRUPAL`

#### 01B079 — líneas 1169-1172 (comentario)

```text
Nombre del archivo de progreso temporal de /players (ver 09_API_ClashRoyale.gs).
Se guarda en la misma carpeta que el backup de celulares. Se borra solo
en cuanto un ciclo de /players termina completo; si queda un archivo
viejo después de eso, se puede borrar manualmente sin riesgo.
```


### Ubicación: `PLAYERS_PROGRESS_FILE`

#### 01B080 — líneas 1175-1177 (comentario)

```text
FIX (06-ago-2026): checkpoint equivalente para clanes/currentriverrace,
mismo patrón que PLAYERS_PROGRESS_FILE — ver _guardarProgresoClanes()/
_cargarProgresoClanes()/_borrarProgresoClanes() en 09_API_ClashRoyale.gs.
```


### Ubicación: `CLANES_PROGRESO_FILE`

#### 01B081 — líneas 1180-1186 (comentario)

```text
NUEVO (27-sep-2026): checkpoint equivalente para battlelog+upcomingchests,
mismo patrón que PLAYERS_PROGRESS_FILE/CLANES_PROGRESO_FILE -- ver
_guardarProgresoBattlelogChests()/_cargarProgresoBattlelogChests()/
_borrarProgresoBattlelogChests() en 09_API_ClashRoyale.gs. Guarda la lista
de tags ya procesados (no el JSON de battlelog/cofres en sí -- ESO ya se
guarda tal cual en DRIVE_FOLDER_ID_BATTLELOG/DRIVE_FOLDER_ID_UPCOMINGCHESTS,
ver descargarBattlelogJugador()/descargarUpcomingChestsJugador()).
```


### Ubicación: `DRIVE_FOLDER_ID_PLANTILLAS`

#### 01B082 — líneas 1193-1202 (comentario)

```text
Carpeta "Clans_Consulta_Temporal" (pedido del usuario, 26-sep-2026): NO es
una subcarpeta de "Clans" (DRIVE_FOLDER_ID_CLANS, arriba) -- es la carpeta
de destino de las 4 variaciones MANUALES de consulta de clanes agregadas
en 09_API_ClashRoyale.gs: descargarClanMiembros(tag, limit),
buscarClanesPorNombre(nombre), buscarClanesPorNombreYUbicacion(nombre,
locationId) y buscarClanesPorUbicacion(locationId). Uso pensado para
consultas puntuales desde la web, no histórico: SIEMPRE el mismo archivo
de nombre fijo ("clans_consulta_temporal.json"), reemplazado por completo
en cada llamada de cualquiera de las 4 funciones -- nunca se crea un
archivo nuevo, sin importar qué endpoint se haya llamado.
```


### Ubicación: `DRIVE_FOLDER_ID_CLANS_CONSULTA_TEMPORAL`

#### 01B083 — líneas 1205-1228 (comentario)

```text
---------------------------------------------------------------------------
SUBCARPETAS DENTRO DE "Plantillas" (Mi unidad > Respaldo > Plantillas).
Registradas el 01/08/2026 a partir de capturas de Drive del usuario.
NOTA: "Plantillas" es solo el nombre de la carpeta (contiene Google Docs), igual que
Respaldo > CSV / JSON / TXT indican el tipo de archivo que contienen. La hoja
Plantillas y su CSV ya no existen.
FASE (01/08/2026): activadas y conectadas — syncPlantillasDesdeDrive()
(43_Menu_Dinamico.gs) y todas las funciones que buscan un documento puntual por
nombre dentro de Plantillas (_leerSeccionDocDrive en 44_BotWhatsApp.gs;
actualizarDocParticipantesCalificadosTorneo, _actualizarUnDocParticipantesCalificados
y _escribirDocGanadores en 28_Torneos_Docs.gs) ahora recorren la carpeta
Plantillas Y estas 5 subcarpetas (vía _buscarArchivoEnPlantillas(), helper
definido más abajo en este archivo), ya no solo la carpeta raíz. Esto era
necesario porque el usuario movió ahí documentos que antes vivían sueltos
directo en "Plantillas" (ej. "Mazos personalizados", "Participantes
calificados (torneo/sorteo)", "Ganadores (torneo/sorteo)"); con la
búsqueda antigua (solo carpeta raíz) esos documentos habrían dejado de
encontrarse.

1) "Torneos y sorteos" — ID: 12ZSn_btY_lWfgDPSDq2Njih75hdc9zJE
   Archivos: "Participantes calificados (torneo) - Comunidad - G乂T ...",
   "Participantes calificados (sorteo) - Comunidad - G乂T ...",
   "Ganadores (torneo) - Comunidad - G乂T Familia Terna",
   "Ganadores (sorteo) - Comunidad - G乂T Familia Terna"
```


### Ubicación: `DRIVE_FOLDER_ID_PLANTILLAS_TORNEOS_SORTEOS`

#### 01B084 — líneas 1231-1238 (comentario)

```text
2) "Otras" — ID: 1d6_wFdPE6SfRDN9rIc847vE6XVxZuq71
   Archivos: "iPhone - Comunidad - G乂T Familia Terna",
   "Etiqueta de miembro - Comunidad - G乂T Familia Terna",
   "Día de guerra - Comunidad - G乂T Familia Terna",
   "Defensas de barcos - Comunidad - G乂T Familia T...",
   "GRUPO乂TERNA™ – CONTRATO OFICIAL DE LA ÉLI..." (.pdf, no es Google Doc,
   syncPlantillasDesdeDrive() lo ignora por tipo),
   "GRUPO乂TERNA™ – BIENVENIDA OFICIAL" (.pdf, ídem)
```


### Ubicación: `DRIVE_FOLDER_ID_PLANTILLAS_OTRAS`

#### 01B085 — líneas 1241-1243 (comentario)

```text
3) "Mazos" — ID: 1-NyyqZ-p9mwJ78Q28DLo0XkXxYIoRTbo
   Archivos: "Mazos personalizados - Comunidad - G乂T Familia...",
   "Mazos - Comunidad - G乂T Familia Terna"
```


### Ubicación: `DRIVE_FOLDER_ID_PLANTILLAS_MAZOS`

#### 01B086 — líneas 1246-1254 (comentario)

```text
4) "Descripciones" — ID: 1Sm3c_O1MwSd29kX_n3PW1v0jjdyD0r8E
   Archivos: "Descripción - RoyaleAPI - G乂T Familia Terna",
   "Descripción - Particular - Mini乂Ternas™",
   "Descripción - Particular - Grupo乂Terna™",
   "Descripción - Particular - GrupoXTerna™3",
   "Descripción - Particular - GrupoXTerna™2",
   "Descripción - Detectives - G乂T Familia Terna",
   "Descripción - Comunidad - G乂T Familia Terna",
   "Descripción - Chat General - G乂T Familia Terna"
```


### Ubicación: `DRIVE_FOLDER_ID_PLANTILLAS_DESCRIPCIONES`

#### 01B087 — líneas 1257-1261 (comentario)

```text
5) "Bienvenidas" — ID: 1z5Gs3lDn1lxjbKB4dSRLbN6kfdY66AhB
   Archivos: "Bienvenida - Particular - Mini乂Ternas™",
   "Bienvenida - Particular - Grupo乂Terna™",
   "Bienvenida - Particular - GrupoXTerna™3",
   "Bienvenida - Particular - GrupoXTerna™2"
```


### Ubicación: `DRIVE_FOLDER_ID_PLANTILLAS_BIENVENIDAS`

#### 01B088 — líneas 1264-1266 (comentario)

```text
Array de conveniencia con las 5 subcarpetas de arriba, para recorrerlas
todas juntas (ver _getCarpetasPlantillas() y _buscarArchivoEnPlantillas()
más abajo en este mismo archivo).
```


### Ubicación: `DRIVE_FOLDERS_PLANTILLAS_SUB`

#### 01B089 — líneas 1275-1280 (comentario)

```text
---------------------------------------------------------------------------
Carpeta raíz. Nombre en Drive: "Respaldo" (padre de "CSV", "JSON" y
"Plantillas"). Guardada como referencia aunque hoy ningún código la usa
directamente (cada subcarpeta ya tiene su propia constante arriba); evita
tener que volver a pedirla si en el futuro hace falta, p.ej. para
recorrer o recrear la estructura completa de Drive desde cero.
```


### Ubicación: `DRIVE_FOLDER_ID_RESPALDO`

#### 01B090 — líneas 1283-1287 (comentario)

```text
Nombre en Drive: "Torneos" (subcarpeta dentro de "JSON" > "Endpoints"
desde la reorganización del 25-sep-2026; mismo ID de siempre, la carpeta
solo cambió de padre en Drive, no de identidad). Usada desde la Fase 19b
del plan de cambios (guardado del JSON de cada consulta de torneo, ver
26_Torneos_Core.gs).
```


### Ubicación: `DRIVE_FOLDER_ID_TORNEOS`

#### 01B091 — líneas 1290-1295 (comentario)

```text
Nombre en Drive: "Globales" (subcarpeta dentro de "Torneos", pedido del
usuario 25-sep-2026, para /globaltournaments -- torneos globales que
Supercell activa de forma esporádica; ver descargarGlobalTournaments(),
09_API_ClashRoyale.gs, que solo guarda el JSON crudo ahí, sin CSV, porque
hoy responde {"items":[]} y no se conoce el schema de un torneo real).
ID confirmado por el usuario (25-sep-2026).
```


### Ubicación: `DRIVE_FOLDER_ID_TORNEOS_GLOBALES`

#### 01B092 — líneas 1298-1301 (comentario)

```text
Nombre en Drive: "Por búsqueda de nombre" (subcarpeta dentro de "Torneos",
pedido del usuario 25-sep-2026), para el JSON crudo de /tournaments?name=X
(búsqueda por nombre, hoy solo probada con "terna" en 44.gs). Distinta de
DRIVE_FOLDER_ID_TORNEOS (esa es por tag individual, /tournaments/{tag}).
```


### Ubicación: `DRIVE_FOLDER_ID_TORNEOS_BUSQUEDA_NOMBRE`

#### 01B093 — líneas 1304-1313 (comentario)

```text
---------------------------------------------------------------------------
REORGANIZACIÓN DE DRIVE (25-sep-2026, pedido del usuario): "JSON" >
"Endpoints" y sus subcarpetas nuevas. Todas confirmadas por id.csv,
carácter por carácter. NINGUNA de las constantes de este bloque se usa
todavía en el código (pedido explícito del usuario: "solo guarda las
carpetas con los ID en el código" — la lógica de guardado queda para una
fase siguiente, ver el aviso grande al inicio de la sección "IDs DE
CARPETAS DRIVE" más arriba en este mismo archivo, y el bloque AVISOS
ABIERTOS al inicio de 09_API_ClashRoyale.gs).
---------------------------------------------------------------------------
```


### Ubicación: `DRIVE_FOLDER_ID_ENDPOINTS`

#### 01B094 — líneas 1319-1324 (comentario)

```text
Nombre en Drive: "Battlelog" (subcarpeta dentro de "Endpoints"). EN USO
desde el 25-sep-2026 vía descargarBattlelogJugador() (09_API_ClashRoyale.gs,
función MANUAL): guarda ahí el JSON crudo de /players/{tag}/battlelog de
UN jugador puntual (array de batallas), un solo archivo vigente por tag
(se sobreescribe, sin histórico) -- ver el docblock de esa función para
el detalle completo.
```


### Ubicación: `DRIVE_FOLDER_ID_BATTLELOG`

#### 01B095 — líneas 1327-1426 (comentario)

```text
---------------------------------------------------------------------------
Backup_Arena.csv / Backup_Modo.csv (DRIVE_FOLDER_ID_CSV, carpeta "CSV")
PENDIENTE DE IMPLEMENTAR (25-sep-2026, pedido del usuario): estructura
registrada acá para que quede fijada de una vez, aunque todavía no existe
ninguna función que los arme ni los actualice -- ni una que consuma los
JSON de "Battlelog" (arriba, DRIVE_FOLDER_ID_BATTLELOG) para poblarlos.
Mismo patrón de fondo que Backup_Cards.csv/updateCardsSheet()
(31_Cards_Mazos.gs): un CSV que se arma/actualiza recorriendo un cache de
JSON crudo, deduplicando por ID, con una columna de traducción manual que
NUNCA se pisa si ya tiene un valor cargado a mano. La diferencia es la
fuente: Cards sale del cache de jugadores (/players); Arena y Modo van a
salir del cache de "Battlelog" (cada batalla trae "arena":{id,name,
rawName} y "gameMode":{id,name} -- confirmado contra el JSON real de
/battlelog, no contra /players).

-- Backup_Arena.csv --
  Columnas: N° | ID | Name | RawName | Nombre | Nombre_2
    N°        : numeración automática (correlativo, no es el ID de la API).
    ID        : arena.id, tal cual viene en el JSON.
    Name      : arena.name, tal cual viene en el JSON (ej. "Arena 12").
    RawName   : arena.rawName, tal cual viene en el JSON (ej. "Arena12").
    Nombre    : traducción al español de Name -- EDICIÓN MANUAL. Si está
                vacía, se usa el valor de Name (nunca queda la celda vacía
                en el uso real del CSV, solo puede estarlo recién creada).
    Nombre_2  : traducción al español de RawName -- EDICIÓN MANUAL. Si
                está vacía, se usa el valor de RawName.
  Orden: alfabético, primero por Name y luego por RawName.

-- Backup_Modo.csv --
  Columnas: N° | ID | Name | Nombre
    N°        : numeración automática (correlativo, no es el ID de la API).
    ID        : gameMode.id, tal cual viene en el JSON.
    Name      : gameMode.name, tal cual viene en el JSON (ej.
                "RR_CaptureTheEgg_Friendly", "Ranked1v1_NewArena2").
    Nombre    : traducción al español de Name -- EDICIÓN MANUAL. Si está
                vacía, se usa el valor de Name.
  Sin RawName/Nombre_2: a diferencia de "arena", el objeto "gameMode" del
  JSON de /battlelog NO trae un rawName propio -- Name YA es el nombre
  interno/crudo del modo (ver ejemplos arriba), por eso no hay una
  segunda columna cruda que traducir.
  Orden: alfabético por Name (confirmado por el usuario, 25-sep-2026 --
  mismo criterio que Arena, sin la parte de RawName por no tener columna).

TAREA PENDIENTE (25-sep-2026, confirmado por el usuario) -- IMPLEMENTADA
(26-sep-2026): la función que une los JSON de "Battlelog" (arriba,
DRIVE_FOLDER_ID_BATTLELOG -- hoy uno por jugador, vía
descargarBattlelogJugador()) con Backup_Arena.csv y Backup_Modo.csv ya
está escrita: _actualizarBackupArenaConBattlelog() y
_actualizarBackupModoConBattlelog() (ambas en 09_API_ClashRoyale.gs, justo
debajo de descargarBattlelogJugador()). Sacan "arena" y "gameMode" de cada
batalla del array que ya devuelve /battlelog, deduplican por ID contra lo
que ya tiene cada CSV (y entre sí, dentro del mismo array), agregan filas
nuevas (Nombre/Nombre_2 en blanco para traducción manual, igual que
Backup_Cards.csv) y reordenan alfabéticamente al guardar. Mismo patrón de
fondo que _actualizarBackupCofresConChests() (mismo archivo, alimenta
Backup_Cofres.csv desde /upcomingchests) más que updateCardsSheet(), que
lee de un cache separado en vez de la respuesta que ya se tiene en mano.
Definido (26-sep-2026, pedido del usuario, resuelve el "sin definir
todavía" de abajo): NO corre sola -- queda enganchada dentro de
descargarBattlelogJugador() misma, se ejecuta automáticamente cada vez
que se descarga un battlelog, sin una función manual aparte.

Sin probar todavía en Apps Script real -- falta correr
descargarBattlelogJugador() sobre un tag real y confirmar en Drive que
Backup_Arena.csv y Backup_Modo.csv quedan con las filas y el orden
esperados (incluida la fusión con filas que Torneos haya dejado con Name
vacío en Backup_Modo.csv).

NUEVA DEFINICIÓN CONFIRMADA (26-sep-2026, pedido del usuario -- resuelve
un caso borde que no estaba cubierto arriba): a diferencia de
Backup_Arena.csv (SOLO lo alimenta esta función de Battlelog, todavía sin
implementar), Backup_Modo.csv tiene DOS fuentes distintas que pueden
agregarle filas:
  1) El flujo de Torneos (26_Torneos_Core.gs, _resolverModoDesdeCatalogo(),
     YA IMPLEMENTADO): solo conoce el ID (gameMode.id de /tournaments, que
     NO trae name -- confirmado, a diferencia de /battlelog). Cuando no
     encuentra el ID en el catálogo, agrega una fila nueva con Name y
     Nombre en blanco.
  2) Esta función de Battlelog (PENDIENTE): sí conoce Name (gameMode.name
     de /battlelog).
Regla de fusión para cuando ambas fuentes tocan el mismo ID -- NUNCA puede
haber dos filas para el mismo ID en Backup_Modo.csv:
  - Antes de agregar una fila nueva, esta función debe buscar el ID entre
    las filas YA existentes del catálogo (mismo criterio que ya aplica
    _resolverModoDesdeCatalogo() del lado de Torneos).
  - Si el ID YA existe (venga de una fila que dejó Torneos con Name vacío,
    o de una corrida anterior de esta misma función) y esa fila tiene Name
    vacío pero Battlelog sí trae name para ese ID -- completar Name EN ESA
    FILA EXISTENTE, sin crear una fila nueva. Nombre nunca se toca (sigue
    siendo 100% manual).
  - Si el ID YA existe y Name ya tenía valor -- no hace falta reescribirlo
    (no se espera que gameMode.name cambie para un mismo id).
  - Si el ID NO existe todavía en ninguna fila -- recién ahí se agrega una
    fila nueva, con Name completo desde Battlelog (Nombre en blanco para
    que el usuario la traduzca después).
En el sentido inverso (Battlelog corre primero, Torneos después) no hace
falta ningún cambio: _resolverModoDesdeCatalogo() (26_Torneos_Core.gs) ya
busca por ID antes de agregar, así que si la fila ya existe con Name
completo por Battlelog, la encuentra y la usa tal cual, sin duplicarla.
---------------------------------------------------------------------------
```

#### 01B096 — líneas 1428-1434 (comentario)

```text
Nombre en Drive: "Cards" (subcarpeta dentro de "Endpoints"). Usada
desde el 25-sep-2026 vía descargarCards() (09_API_ClashRoyale.gs,
función MANUAL) -- guarda ahí Cache_Cards.json (respuesta cruda completa
de /cards: catálogo completo, "items" + "supportItems"). Esa misma
función también actualiza (no reemplaza) Backup_Cards.csv
(DRIVE_FOLDER_ID_CSV), el CSV histórico que ya mantenía updateCardsSheet()
(31_Cards_Mazos.gs) desde el cache de jugadores.
```


### Ubicación: `DRIVE_FOLDER_ID_CARDS`

#### 01B097 — líneas 1437-1439 (comentario)

```text
Carpeta contenedora "Clans" (subcarpeta dentro de "Endpoints"). Contiene 5
subcarpetas, una por clan — ver _SUBCARPETAS_CLAN_POR_ENDPOINT_CLANS_ en
09_API_ClashRoyale.gs para los 5 IDs de esas subcarpetas.
```


### Ubicación: `DRIVE_FOLDER_ID_CLANS`

#### 01B098 — líneas 1442-1445 (comentario)

```text
Carpeta contenedora "CurrentRiverRace" (subcarpeta dentro de "Endpoints").
Contiene 5 subcarpetas, una por clan — ver
_SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_ en 09_API_ClashRoyale.gs
para los 5 IDs de esas subcarpetas.
```


### Ubicación: `DRIVE_FOLDER_ID_CURRENTRIVERRACE`

#### 01B099 — líneas 1448-1452 (comentario)

```text
Nombre en Drive: "Locations" (subcarpeta dentro de "Endpoints"). En uso
desde el 25-sep-2026 vía descargarLocations() (09_API_ClashRoyale.gs,
función MANUAL) -- guarda ahí Cache_Locations.json (respuesta cruda
completa de /locations); el mismo dato también se refleja en
Backup_Locations.csv (DRIVE_FOLDER_ID_CSV).
```


### Ubicación: `DRIVE_FOLDER_ID_RANKING`

#### 01B100 — líneas 1459-1470 (comentario)

```text
Nombre en Drive: "Copas" (subcarpeta dentro de "Ranking"). EN USO desde
el 25-sep-2026 vía descargarRankingGlobalClanes() (09_API_ClashRoyale.gs,
función MANUAL): guarda ahí Cache_RankingGlobalClanes.json, la respuesta
cruda de /locations/global/rankings/clans -- el ranking GLOBAL de clanes
por clanScore (trofeos), sin filtrar por país. Sin CSV (pedido explícito
del usuario). Es un ranking único (no por jugador/clan/tag), así que el
archivo tiene nombre FIJO y se REEMPLAZA por completo en cada corrida --
no queda histórico. Acepta un parámetro opcional "limit" (se traduce en
"?limit=N" agregado a la URL) para pedirle a la API cuántos clanes
devolver; sin ese parámetro, se llama sin límite explícito. El número no
está fijo en el código (no es necesariamente 5) -- lo decide quien corre
la función cada vez.
```


### Ubicación: `DRIVE_FOLDER_ID_RANKING_COPAS`

#### 01B101 — líneas 1473-1480 (comentario)

```text
Nombre en Drive: "Guerra" (subcarpeta dentro de "Ranking"). EN USO desde
el 25-sep-2026 vía descargarRankingGlobalGuerraClanes()
(09_API_ClashRoyale.gs, función MANUAL): guarda ahí
Cache_RankingGlobalGuerraClanes.json, la respuesta cruda de
/locations/global/rankings/clanwars -- el ranking GLOBAL de clanes por
GUERRA (distinto de "Copas"/DRIVE_FOLDER_ID_RANKING_COPAS, que es por
clanScore/trofeos). Sin CSV. Archivo con nombre fijo, reemplazado por
completo en cada corrida (ranking único, no por tag).
```


### Ubicación: `DRIVE_FOLDER_ID_RANKING_GUERRA`

#### 01B102 — líneas 1483-1495 (comentario)

```text
Carpeta contenedora "Jugadores" (subcarpeta dentro de "Ranking"). Contiene
a su vez "Camino de leyendas" (ver la constante siguiente). EN USO además
como destino directo desde el 25-sep-2026 vía
descargarRankingGlobalJugadores() (09_API_ClashRoyale.gs, función
MANUAL): guarda ahí Cache_RankingGlobalJugadores.json, la respuesta cruda
de /locations/global/rankings/players -- el ranking GLOBAL de jugadores
(equivalente a "Copas"/DRIVE_FOLDER_ID_RANKING_COPAS pero para jugadores).
Sin CSV. Archivo con nombre fijo, reemplazado por completo en cada
corrida (ranking único, no por jugador/tag).
AVISO (25-sep-2026, confirmado por el usuario): a día de hoy este
endpoint responde 200 OK pero VACÍO -- {"items":[],"paging":{"cursors":{}}}
-- se guarda igual, tal cual responda en cada corrida, para que la
función ya esté lista si Supercell lo arregla más adelante.
```


### Ubicación: `DRIVE_FOLDER_ID_RANKING_JUGADORES`

#### 01B103 — líneas 1498-1513 (comentario)

```text
Nombre en Drive: "Camino de leyendas" (subcarpeta dentro de "Ranking" >
"Jugadores"). EN USO desde el 26-sep-2026 vía
descargarRankingGlobalJugadoresCaminoLeyendasPorTemporada() y
descargarRankingJugadoresCaminoLeyendasPorUbicacion() (ambas
09_API_ClashRoyale.gs, funciones MANUALES): guardan ahí el JSON crudo de
/locations/global/pathoflegend/{seasonId}/rankings/players y de
/locations/{locationId}/pathoflegend/players respectivamente -- el
ranking de Camino de Leyendas (distinto del ranking por
trofeos/clanScore de siempre, que vive en "Global", ver la constante
siguiente). Sin CSV.
CORRECCIÓN (26-sep-2026, confirmado por el usuario con captura de Drive):
el comentario decía antes que esta carpeta "contiene a su vez" a
"Global" (jerarquía anidada de 4 niveles); en realidad son carpetas
HERMANAS, ambas directamente dentro de "Ranking" > "Jugadores" -- ver
también la misma corrección en el docblock de
descargarRankingJugadoresPorUbicacion() (09_API_ClashRoyale.gs).
```


### Ubicación: `DRIVE_FOLDER_ID_RANKING_JUGADORES_CAMINO_LEYENDAS`

#### 01B104 — líneas 1516-1522 (comentario)

```text
Nombre en Drive: "Global" (subcarpeta dentro de "Ranking" > "Jugadores",
HERMANA de "Camino de leyendas" -- ver corrección en la constante de
arriba; ninguna de las dos está anidada dentro de la otra). EN USO desde
el 25-sep-2026 vía descargarRankingGlobalJugadores() y
descargarRankingJugadoresPorUbicacion() (09_API_ClashRoyale.gs): el
ranking de jugadores por trofeos/clanScore de siempre, sin Camino de
Leyendas.
```


### Ubicación: `DRIVE_FOLDER_ID_RANKING_JUGADORES_GLOBAL`

#### 01B105 — líneas 1525-1529 (comentario)

```text
Nombre en Drive: "Seasons" (subcarpeta dentro de "Endpoints"). En uso
desde el 25-sep-2026 vía descargarSeasons() (09_API_ClashRoyale.gs,
función MANUAL) -- guarda ahí Cache_Seasons.json (respuesta cruda completa
de /locations/global/seasons); el mismo dato también se refleja en
Backup_Seasons.csv (DRIVE_FOLDER_ID_CSV).
```


### Ubicación: `DRIVE_FOLDER_ID_SEASONS`

#### 01B106 — líneas 1532-1537 (comentario)

```text
Nombre en Drive: "UpcomingChests" (subcarpeta dentro de "Endpoints"). EN
USO desde el 25-sep-2026 vía descargarUpcomingChestsJugador()
(09_API_ClashRoyale.gs, función MANUAL): guarda ahí el JSON crudo de
/players/{tag}/upcomingchests de UN jugador puntual, un solo archivo
vigente por tag (se sobreescribe, sin histórico) -- ver el docblock de
esa función para el detalle completo.
```


### Ubicación: `DRIVE_FOLDER_ID_UPCOMINGCHESTS`

#### 01B107 — líneas 1540-1578 (comentario)

```text
---------------------------------------------------------------------------
Backup_Cofres.csv (DRIVE_FOLDER_ID_CSV, carpeta "CSV")
Alimentado desde el 25-sep-2026 por descargarUpcomingChestsJugador() (ver
arriba, DRIVE_FOLDER_ID_UPCOMINGCHESTS): mismo patrón de fondo que
Backup_Cards.csv/updateCardsSheet() (31_Cards_Mazos.gs) -- un catálogo que
solo CRECE, nunca se pisa, con una columna de traducción manual que se
respeta si ya tiene valor. La diferencia con Cards/Arena/Modo es que acá
el JSON de origen (/upcomingchests) NO se guarda tal cual en el CSV: solo
alimenta la lista de cofres conocidos (ver _actualizarBackupCofresConChests(),
09_API_ClashRoyale.gs) -- si no trae ningún cofre nuevo, no se crea
ninguna fila.

  Columnas: N° | Name | Nombre | Link
    (Link agregada a mano por el usuario el 27-sep-2026; ver RECURSOS
    GRÁFICOS más abajo. Las filas nuevas que crea
    _actualizarBackupCofresConChests(), 09_API_ClashRoyale.gs, nacen con
    Link vacío, igual que Nombre.)
    N°     : numeración automática (correlativo, no es un dato de la API).
    Name   : items[].name, tal cual viene en el JSON (ej. "Golden Chest",
             "Mega Lightning Chest"). Deduplicado -- una sola fila por
             nombre de cofre, aunque /upcomingchests repita el mismo
             nombre varias veces en el array (es normal, ej. "Golden
             Chest" aparece más de una vez en la cola de un jugador).
    Nombre : traducción al español de Name -- EDICIÓN MANUAL. Si está
             vacía (fila recién creada), se usa el valor de Name.
    Link   : URL de la imagen del cofre -- EDICIÓN MANUAL (ver
             RECURSOS GRÁFICOS). _webCofresJugador() (37_Web_API.gs) la
             manda como `link`; vacía -> el frontend no muestra ícono.
  Orden: sin definir todavía (no especificado por el usuario) -- las filas
  nuevas se agregan al final, igual que Backup_Cards.csv (no se reordena
  solo por agregar cofres nuevos).

  Uso previsto (no implementado todavía, ver AVISO en
  descargarUpcomingChestsJugador()): cuando algo tenga que MOSTRAR la cola
  de cofres de un jugador, por cada cofre de su /upcomingchests debe
  consultar Backup_Cofres.csv por Name y mostrar Nombre; si no encuentra
  el cofre en el CSV (no debería pasar si siempre se corre
  descargarUpcomingChestsJugador() antes), cae al Name en inglés.
---------------------------------------------------------------------------
```

#### 01B108 — líneas 1580-1688 (comentario)

```text
---------------------------------------------------------------------------
RECURSOS GRÁFICOS (íconos/imágenes) -- REGISTRADO 27-sep-2026, pedido del
usuario ("registra eso en el backend por si necesito más íconos").
Son las dos fuentes de imágenes gratuitas y permitidas que el usuario
encontró. Solo documentación: ninguna función las descarga ni las
consulta sola; cuando se necesite un ícono nuevo, buscarlo primero acá.

  1) Supercell Fan Kit -- "Game Assets"
     https://fankit.supercell.com/d/BmehSDJrZNff/game-assets-1
     Fuente oficial de Supercell para contenido de fans (no se pudo
     abrir desde acá el 27-sep-2026: su contenido no está verificado).
     Uso sujeto a la Fan Content Policy de Supercell:
     https://supercell.com/en/fan-content-policy/

  2) RoyaleAPI / cr-api-assets (GitHub, rama master)
     https://github.com/RoyaleAPI/cr-api-assets
     Es el repo de assets que usa royaleapi.com. Carpetas verificadas el
     27-sep-2026 (clonando el repo): arenas, badges, cards, cards-75,
     cards-150 (y variantes -gold y -png8), chests, chr, chr_champions,
     music, sfx, trade-tokens, ui.
       - chests/ (fuente de la columna Link de Backup_Cofres.csv): archivos
         chest-*.png (draft, epic, fortune, giant, gold-fortune, gold,
         goldcrate, king, kinglegendary, legendary, lightning, magical,
         megalightning, overflowgoldcrate, plentifulgoldcrate, royalwild,
         silver, supermagical, wooden) y ic-chest-*.png (epic, giant,
         gold, magical, silver, wooden).
       - cards/ (208 archivos) usa el nombre de la carta en minúsculas
         con guiones (ej. cards/knight.png, cards/x-bow.png); las
         evoluciones llevan sufijo -ev1 (ej. archers-ev1.png) y los
         héroes -hero / -hero-ev1. Incluye _empty.png y _invalid.png.
       - arenas/ trae arena0..arena24.png, league0..league10.png y
         legendary.png (37 archivos).
       - badges/ (182 imágenes A_Char_*.png, etc.): NO son las insignias
         de los jugadores (Backup_Insignias.csv). Aclarado por el usuario
         el 27-sep-2026: es otro tipo de imagen; no usarla como ícono de
         insignia ni clonarla.
     Su LICENSE aclara que el contenido no está afiliado ni respaldado por
     Supercell y remite a la misma Fan Content Policy.

  Limitaciones vistas al revisar el repo (27-sep-2026):
    - No tiene ninguna imagen de "Ronin" (ni en cards/ ni en el resto):
      el repo va detrás de las cartas nuevas. Para Ronin hay que usar el
      ícono que ya manda Supercell en /players (cards[].iconUrls) -- ver
      _iconoCartaFallbackParaMaestria() en perfil.html -- o buscarlo en
      el Fan Kit.

  DECISIÓN DEL USUARIO (27-sep-2026): CLONAR las imágenes en vez de
  enlazarlas en vivo. El README de cr-api-assets pide clonar el repo y NO
  usar los archivos directamente "como si fuera un CDN", así que la
  columna Link de Backup_Cofres.csv debe apuntar a copias propias, no a
  raw.githubusercontent.com. Copia hecha: las 25 imágenes de chests/ se
  entregaron en chests.zip para subirlas al repo GrupoTerna/Web, en la
  carpeta assets/chests/ (ruta propuesta por Claude, no confirmada por el
  usuario). URL resultante:
    https://grupoterna.github.io/Web/assets/chests/<archivo>.png
  Al subir cualquier imagen copiada de cr-api-assets, conservar el aviso
  de su LICENSE (contenido no afiliado a Supercell, Fan Content Policy).
  PENDIENTE: el usuario debe (1) subir la carpeta al repo y (2) cambiar a
  mano cada Link de Backup_Cofres.csv a la URL nueva. Hasta entonces los
  Link actuales siguen funcionando pero cargan desde el repo de RoyaleAPI.
  AMPLIADO (27-sep-2026, pedido del usuario): también se clonaron arenas/
  (37 archivos, arenas.zip) y cards/ (208 archivos, unos 26 MB, cards.zip),
  para subirlas a assets/arenas/ y assets/cards/ del mismo repo. badges/
  NO se clona (ver arriba: no son las insignias). Solo se clonó cards/;
  las variantes cards-75, cards-150, -gold y -png8 siguen sin copiarse.
  Las demás carpetas se copian solo cuando hagan falta.

  ANTIGÜEDAD Y PRIORIDAD DE ESTAS COPIAS (27-sep-2026; el usuario lo
  indicó y luego lo comprobó con capturas de GitHub y el listado de
  cards/, columna "Last commit date"):
  Las cartas, cofres y arenas del juego cambian seguido, pero los archivos
  de estas carpetas del repo de RoyaleAPI son viejos:
    - cards/ (assets/cards/): de 6 meses a 9 años. VERIFICADO con el
      listado: lo más reciente ("add new cards", "add hero assets", hace
      6 meses) son las evoluciones y héroes; muchas cartas base siguen
      con la imagen regenerada hace 9 años, otras con arte de hace 3 a 5
      años. Sigue SIN existir ronin.png (ni evolución/héroe de Ronin).
      Se conserva, pero es la ÚLTIMA OPCIÓN. Antes hay que agotar las
      otras fuentes (los iconUrls que manda Supercell en /players y
      /cards, o el Fan Kit) y solo si ninguna sirve se cae a esta carpeta.
    - chests/ (assets/chests/): de 5 a 9 años. VERIFICADO con las
      capturas: la mayoría de chest-*.png tiene 8 años ("add MLC,
      tokens"), chest-goldcrate, chest-overflowgoldcrate,
      chest-plentifulgoldcrate y chest-royalwild tienen 5 años, y los
      ic-chest-*.png tienen 9 años. (El "alrededor de 9 años" dicho antes
      era una aproximación; el promedio real es más cercano a 8.)
    - arenas/ (assets/arenas/): de 3 a 6 años. VERIFICADO con el listado
      que pasó el usuario (27-sep-2026): arena4 a arena9 tienen 3 años
      ("update arena 4,5,6 per supercell arena config change"); arena0 a
      arena3, arena10 a arena24 y league0 a league10 tienen 5 años
      ("arena update"); legendary.png tiene 6 años. CORRECCIÓN a lo dicho
      antes: el usuario había estimado "alrededor de 9 años" para las
      arenas, y el listado muestra que son más nuevas que eso (las más
      viejas tienen 6). Siguen siendo antiguas para un juego que cambia
      arenas seguido, así que la prioridad de abajo se mantiene.
  Chests y arenas se usan SOLO porque hoy no hay otra fuente disponible
  (decisión del usuario).
  En cuanto se encuentre una fuente más actualizada de cofres o arenas,
  esa debe tener PRIORIDAD sobre estas copias, y hay que cambiar los Link
  de Backup_Cofres.csv (y la imagen de arena que se elija) para apuntar a
  la nueva.
  PENDIENTE DE DEFINIR: buscar una fuente actualizada de cofres y arenas
  (el usuario no indicó todavía dónde ni cuándo).

  Estado de los catálogos (dicho por el usuario, 27-sep-2026): todos los
  Backup_*.csv ya tienen sus traducciones al español completas (columna
  Nombre). Los cofres/arenas/modos/cartas nuevos que aparezcan siguen
  entrando con Nombre vacío hasta traducirlos a mano.
---------------------------------------------------------------------------
```

#### 01B109 — líneas 1690-1693 (comentario)

```text
Nombre en Drive: "Otros" (subcarpeta dentro de "JSON", NO dentro de
"Endpoints" — quedó fuera de esa reorganización). Sin uso en el código
todavía; propósito exacto de esta carpeta pendiente de que el usuario lo
aclare (queda anotado acá para no perderlo).
```


### Ubicación: `DRIVE_FOLDER_ID_OTROS`

#### 01B110 — líneas 1696-1748 (comentario)

```text
---------------------------------------------------------------------------
RECONSTRUCCIÓN AUTOMÁTICA DE LOS 4 DOCS DE TORNEOS/SORTEOS
FASE (08/08/2026): los 4 documentos de "Participantes calificados"/
"Ganadores" (torneo y sorteo) son documentos FUNCIONALES: el propio
script los lee y escribe automáticamente (ver 28_Torneos_Docs.gs). Antes de
este cambio, si alguno se borraba por accidente en Drive,
_buscarArchivoEnPlantillas() dejaba de encontrarlo para siempre (ID roto
+ nombre inexistente) y todas las funciones que dependen de él se
omitían en silencio (solo quedaba un Logger.log de aviso, sin ningún
efecto real).

Ahora, cuando _buscarArchivoEnPlantillas() no encuentra un archivo (ni
por ID ni por nombre) Y el nombre buscado es uno de estos 4 documentos
conocidos, _crearDocReconstruibleSiFalta() (justo abajo) crea
automáticamente un Google Doc nuevo con el mismo nombre EXACTO, dentro
de la subcarpeta "Torneos y sorteos"
(DRIVE_FOLDER_ID_PLANTILLAS_TORNEOS_SORTEOS), reconstruyendo el
contenido base tal como estaba en la plantilla real (texto fijo de
Premios/Fecha/Transmisión/Requisitos, encabezados de las listas
dinámicas, tablas de ejemplo, redes sociales y pie de página —
verificado contra los 4 .docx reales descargados de Drive el
08/08/2026). Las funciones que actualizan estos documentos
(actualizarDocParticipantesCalificadosTorneo, sincronizarRequisitosYPremiosTorneo,
sincronizarRequisitosSorteo, actualizarDocGanadoresTorneo, etc., todas en
28_Torneos_Docs.gs y 27_Torneos_Sorteos_Requisitos.gs) sobrescriben después el contenido dinámico (fecha real,
requisitos reales de T_Lista/S_Lista, lista real de participantes/
ganadores) exactamente igual que si el documento nunca se hubiera
borrado — no hace falta ningún paso manual.

Los constructores de contenido (_construirContenidoDoc...()) están
definidos en 28_Torneos_Docs.gs, junto al resto de la lógica de estos 4
documentos. Se referencian acá dentro de una función (no como literal al
cargar este archivo) porque las constantes NOMBRE_DOC_*/DOC_ID_* y las
funciones constructoras viven en 28_Torneos_Docs.gs, y el orden de carga de
archivos entre módulos de un mismo proyecto de Apps Script no está
garantizado; como todos los archivos ya están cargados (y sus funciones
ya declaradas) para cuando esta función se ejecuta de verdad (nunca al
cargar el script, siempre en respuesta a un _buscarArchivoEnPlantillas()
real), no hay ningún problema de orden.

IMPORTANTE sobre el ID de Drive: el ID nuevo del documento recreado NO se
puede escribir de vuelta en las constantes DOC_ID_* (son "var" fijas en
el código fuente). Esto no rompe nada: como se ve arriba,
_buscarArchivoEnPlantillas() ya intenta primero por ID y, si falla, cae a
la búsqueda por nombre exacto — como el documento recreado tiene el
nombre EXACTO esperado, se sigue encontrando sin problema en cada
corrida futura, solo un poco más lento (recorre carpetas en vez de abrir
directo por ID) que si la constante estuviera al día. Si se quiere
recuperar la búsqueda directa por ID, alcanza con copiar el ID nuevo
(queda en el Logger.log de la corrida que lo recreó, y en la URL del
documento) y actualizar a mano la constante DOC_ID_* correspondiente en
28_Torneos_Docs.gs.
---------------------------------------------------------------------------
```


### Ubicación: `_DOCS_TORNEOS_SORTEOS_RECONSTRUIBLES`

#### 01B111 — líneas 1751-1754 (comentario)

```text
Nombres de día y mes en español, usados SOLO por _formatFechaLargaEs()
para producir texto plano (ej. en un Google Doc) equivalente al
NumberFormat de hoja 'dddd, d "de" mmmm"," yyyy h:mm:ss am/pm' que usa la
columna Vigencia de Directorio (ver DC.VIGENCIA en 11_DirectorioSheet.gs).
```


### Ubicación: `_MESES_ES`

#### 01B112 — líneas 1762-1766 (comentario)

```text
=============================================================================
IV. HELPERS GLOBALES
Funciones reutilizables usadas por múltiples módulos.
Se definen UNA SOLA VEZ aquí.
=============================================================================
```

#### 01B113 — líneas 1768-1779 (comentario)

```text
---------------------------------------------------------------------------
HELPERS DE CARPETA "Plantillas" Y SUS SUBCARPETAS
Fase (01/08/2026): la carpeta "Plantillas" ahora tiene 5 subcarpetas
(Torneos y sorteos, Otras, Mazos, Descripciones, Bienvenidas — ver
DRIVE_FOLDERS_PLANTILLAS_SUB más arriba en este archivo). Estos dos
helpers centralizan el recorrido de raíz + subcarpetas para que
syncPlantillasDesdeDrive() (43_Menu_Dinamico.gs) y cualquier función que busque
un documento puntual por nombre (_leerSeccionDocDrive en 44_BotWhatsApp.gs;
actualizarDocParticipantesCalificadosTorneo, _actualizarUnDocParticipantesCalificados
y _escribirDocGanadores en 28_Torneos_Docs.gs) no dependan de en cuál
subcarpeta puntual quedó guardado cada documento.
---------------------------------------------------------------------------
```

#### 01B114 — líneas 1781-1789 (docblock)

```text
_getCarpetasPlantillas()
Devuelve un array de objetos Folder: la carpeta raíz "Plantillas"
(DRIVE_FOLDER_ID_PLANTILLAS) seguida de sus 5 subcarpetas
(DRIVE_FOLDERS_PLANTILLAS_SUB), en ese orden. Una carpeta que falle al
abrirse (ID inválido, sin permiso, etc.) se omite con un Logger.log, sin
cortar el resto — así una subcarpeta con problemas no tumba todo el
recorrido.
```


### Ubicación: `_getCarpetasPlantillas`

#### 01B115 — líneas 1803-1810 (comentario)

```text
FIX (02-sep-2026, pedido usuario — corridas de RUNUPDATE muriendo "sin
loguear nada" justo al entrar al paso del documento "Mazos personalizados", ya eliminado):
caché en memoria (vive solo durante esta ejecución) de IDs de Drive ya
resueltos por _buscarArchivoEnPlantillas() — evita repetir la lectura de
Script Properties (ver PLANTILLAS_ID_CACHE_PREFIX_ abajo) si la misma
función se llama varias veces para el mismo documento dentro de una sola
corrida, como pasa con los docs de Torneos/Sorteos y Ascensos y
descensos (varias llamadas en 28_Torneos_Docs.gs y 25_Doc_AscensosDescensos.gs).
```


### Ubicación: `_CACHE_IDS_PLANTILLAS_MEMORIA_`

#### 01B116 — líneas 1813-1816 (comentario)

```text
Prefijo de la clave en Script Properties (persiste ENTRE ejecuciones y
triggers, a diferencia de _CACHE_IDS_PLANTILLAS_MEMORIA_) donde se guarda,
por nombre de archivo, el último ID de Drive resuelto por búsqueda de
nombre en _buscarArchivoEnPlantillas() — ver FIX (02-sep-2026) ahí mismo.
```


### Ubicación: `PLANTILLAS_ID_CACHE_PREFIX_`

#### 01B117 — líneas 1819-1860 (docblock)

```text
_buscarArchivoEnPlantillas(nombreArchivo, idArchivo)
FASE (01/08/2026): ahora busca PRIMERO por ID (rápido, y no se rompe si
el usuario renombra el archivo) y, solo si el ID no viene, no es válido,
o el archivo con ese ID ya no existe/no es accesible, cae al método
anterior: nombre EXACTO en la raíz de "Plantillas" y, si no aparece ahí,
en cada una de sus 5 subcarpetas (en el orden de
DRIVE_FOLDERS_PLANTILLAS_SUB). Devuelve el primer File encontrado, o null
si no está en ninguna.

FIX (02-sep-2026, pedido usuario — diagnóstico de las corridas de
RUNUPDATE del 1-sept y 2-sept que morían exactamente al entrar al paso
del documento "Mazos personalizados" (paso ya eliminado) sin loguear nada más, ni siquiera
el aviso de "presupuesto interno agotado" que ese paso ya loguea desde
el 19-ago-2026): para documentos SIN idArchivo hardcodeado (como
"Mazos personalizados", cuyo ID quedaba vacío a
propósito en un archivo ya eliminado), esta función caía
SIEMPRE al recorrido de las 6 carpetas (raíz "Plantillas" + 5
subcarpetas) vía getFilesByName(), un viaje a la API de Drive por
carpeta — y esta misma función se llama varias veces por corrida (Mazos
personalizados, Ascensos y descensos, los 4 docs de Torneos/Sorteos).
Ese recorrido, sumado ANTES del bucle de grupos con presupuesto propio
del paso del documento "Mazos personalizados" (que no empieza a medir tiempo
hasta después de tener el documento abierto), es justamente el tramo sin
checkpoint donde la ejecución podía morir en seco.

Ahora, si el archivo ya se encontró por nombre alguna vez, su ID queda
cacheado en Script Properties (persiste entre ejecuciones/triggers, a
diferencia de una variable en memoria) bajo la clave
PLANTILLAS_ID_CACHE_PREFIX_ + nombreArchivo; ese ID cacheado se intenta
ANTES de recorrer las 6 carpetas, ahorrando ese recorrido en casi todas
las llamadas futuras (queda tan rápido como si idArchivo hubiera venido
hardcodeado desde el principio). Un ID cacheado que ya no sirva (archivo
borrado o movido fuera de Plantillas) simplemente cae al recorrido
normal de abajo, que lo vuelve a encontrar y re-cachea solo — no hace
falta invalidar nada a mano.

@param {string} nombreArchivo Nombre exacto a buscar (usado en el
  fallback; también se usa en los logs de los llamadores).
@param {string} [idArchivo] ID de Drive del archivo (opcional). Si se
  pasa, se intenta DriveApp.getFileById(idArchivo) antes que nada.
```


### Ubicación: `_buscarArchivoEnPlantillas`

#### 01B118 — líneas 1897-1899 (comentario)

```text
ID cacheado ya no sirve (archivo borrado o movido fuera de
Plantillas): se limpia y se sigue con el recorrido normal de abajo,
que lo vuelve a encontrar y re-cachea si lo encuentra de nuevo.
```

#### 01B119 — líneas 1904-1906 (comentario)

```text
3. Recorrido normal de las 6 carpetas (el costoso). Si encuentra el
   archivo, cachea su ID para que la próxima llamada (misma corrida u
   otra futura) entre por el paso 1 o 2 de arriba.
```

#### 01B120 — líneas 1918-1928 (comentario)

```text
FASE (08/08/2026 — Reconstrucción automática de docs borrados): si
tampoco se encontró por nombre en ninguna carpeta, y nombreArchivo es
uno de los 4 documentos funcionales de Torneos/Sorteos que este script
sabe reconstruir desde cero (Participantes calificados/Ganadores,
torneo y sorteo — ver _getMapaDocsReconstruibles() más abajo en este
mismo archivo), se crea automáticamente en vez de devolver null. Para
cualquier OTRO documento (Mazos personalizados, Descripciones,
Bienvenidas, etc.) el comportamiento queda EXACTAMENTE igual que antes:
_crearDocReconstruibleSiFalta() devuelve null para esos casos y el
llamador sigue decidiendo qué hacer (normalmente, omitir con un
Logger.log), como siempre.
```

#### 01B121 — líneas 1932-1940 (docblock)

```text
_getMapaDocsReconstruibles()
Devuelve (armándolo la primera vez que se llama, y cacheándolo después
en _DOCS_TORNEOS_SORTEOS_RECONSTRUIBLES) un objeto
{ [nombreExactoDelDoc]: funciónConstructora } con los documentos que
este script sabe reconstruir desde cero: los 4 de Torneos/Sorteos
(28_Torneos_Docs.gs) más, desde el 11/08/2026, el de Ascensos y descensos
(25_Doc_AscensosDescensos.gs).
```


### Ubicación: `_getMapaDocsReconstruibles`

#### 01B122 — líneas 1949-1953 (comentario)

```text
NUEVO (15-sep-2026, pedido del usuario -- ver 29_Docs_NoCalificados.gs).
Registrarlos acá es lo que hace que _buscarArchivoEnPlantillas(nombre)
los BUSQUE primero y solo los CREE si no existen: es el mecanismo con el
que se cumple el pedido "no se deben multiplicar, se debe buscar para
actualizar el mismo documento en vez de crear una versión nueva".
```

#### 01B123 — líneas 1961-1976 (docblock)

```text
_getMapaCarpetaDestinoDocsReconstruibles()
FASE (11/08/2026): devuelve { [nombreExactoDelDoc]: idDeCarpetaDestino }
— dónde debe quedar guardado cada doc reconstruible dentro de
Plantillas. Los 4 docs de Torneos/Sorteos van a
DRIVE_FOLDER_ID_PLANTILLAS_TORNEOS_SORTEOS (como siempre, desde el
08/08/2026); el de Ascensos y descensos va a
DRIVE_FOLDER_ID_PLANTILLAS_OTRAS (misma subcarpeta donde vive hoy el
documento real). Antes de esta fase, _crearDocReconstruibleSiFalta()
usaba SIEMPRE DRIVE_FOLDER_ID_PLANTILLAS_TORNEOS_SORTEOS a secas, porque
hasta ahora los únicos documentos reconstruibles vivían ahí; con este
mapa, cualquier doc reconstruible futuro que no aparezca acá sigue
cayendo a esa misma carpeta por defecto (ver el `||` en
_crearDocReconstruibleSiFalta()), así que el comportamiento anterior no
cambia para nadie más.
```


### Ubicación: `_getMapaCarpetaDestinoDocsReconstruibles`

#### 01B124 — líneas 1984-1987 (comentario)

```text
NUEVO (15-sep-2026): "se deben generar en la misma carpeta de sus
análogos". Los dos de No calificados acompañan a "Participantes
calificados" en Torneos y sorteos; el de Cambio de rango acompaña a
"Ascensos y descensos" en Otras.
```

#### 01B125 — líneas 1994-2007 (docblock)

```text
_crearDocReconstruibleSiFalta(nombreArchivo)
Si nombreArchivo es uno de los documentos conocidos (ver
_getMapaDocsReconstruibles()), crea un Google Doc nuevo con ese nombre
EXACTO dentro de la carpeta que le corresponda según
_getMapaCarpetaDestinoDocsReconstruibles() (por defecto,
DRIVE_FOLDER_ID_PLANTILLAS_TORNEOS_SORTEOS, si el nombre no está en ese
mapa), le arma el contenido base llamando a la función constructora
correspondiente (definida en 28_Torneos_Docs.gs o 25_Doc_AscensosDescensos.gs) y
devuelve el File de Drive ya creado. Si el nombre no es uno de los
conocidos, devuelve null sin hacer nada — mismo comportamiento que tenía
_buscarArchivoEnPlantillas() antes de esta fase para cualquier otro
documento.
```


### Ubicación: `_crearDocReconstruibleSiFalta`

#### 01B126 — líneas 2026-2028 (comentario)

```text
DocumentApp.create() lo crea en la raíz de "Mi unidad"; lo sacamos
de ahí para que quede SOLO dentro de su subcarpeta de Plantillas
(mismo criterio que un archivo movido a mano por el usuario).
```

#### 01B127 — líneas 2036-2039 (comentario)

```text
FIX (02-sep-2026): cachea el ID nuevo igual que el recorrido normal de
_buscarArchivoEnPlantillas(), así la próxima búsqueda de este mismo
nombre (misma corrida u otra futura) no necesita recorrer las 6
carpetas ni volver a intentar (y fallar) por el ID viejo/roto.
```

#### 01B128 — líneas 2050-2052 (comentario)

```text
---------------------------------------------------------------------------
HELPER DE ENLACES - makeLink()
---------------------------------------------------------------------------
```


### Ubicación: `makeLink`

#### 01B129 — líneas 2066-2068 (comentario)

```text
---------------------------------------------------------------------------
HELPERS DE FECHA Y TIEMPO
---------------------------------------------------------------------------
```


### Ubicación: `dateKey`

#### 01B130 — líneas 2094-2104 (docblock)

```text
_formatFechaLargaEs(fecha)
Devuelve `fecha` como texto en español y hora de Lima (America/Lima), con
el MISMO formato visual que usa la columna Vigencia de Directorio:
"miércoles, 8 de julio, 2026 9:45:00 a.m."
Se arma manualmente (no con Utilities.formatDate + 'EEEE'/'MMMM') porque
esos patrones dependen del locale de la cuenta, no de un parámetro
explícito, así que no garantizan nombres en español. Todos los campos
numéricos se extraen vía Utilities.formatDate con huso 'America/Lima'
para no depender de la zona horaria del servidor de Apps Script.
```


### Ubicación: `_setDateCell`

#### 01B131 — líneas 2134-2136 (comentario)

```text
---------------------------------------------------------------------------
HELPERS DE TEMPORADA Y PERIODINDEX
---------------------------------------------------------------------------
```


### Ubicación: `periodIdxToLetra`

#### 01B132 — líneas 2142-2147 (docblock)

```text
diaLetraANombre(letra)
Traduce una letra de día (L/M/X/J/V/S/D) a su nombre completo en
mayúsculas (ver CFG.DIA_NOMBRES). Devuelve la letra tal cual si no
coincide con ninguna letra conocida.
```


### Ubicación: `esDiaGuerraIdx`

#### 01B133 — líneas 2161-2176 (docblock)

```text
_getMesEfectivo(periodIndex)
Devuelve { anio, mes } (mes 0-based) del "mes efectivo" de temporada,
persistido en PropertiesService. A diferencia del cálculo antiguo (ver
nota en calcTemporadaDesdeRef), este NO se basa en la fecha real del
calendario sino en el periodIndex reportado por la API de Clash Royale:
el mes efectivo solo avanza cuando se detecta que el periodIndex volvió
a un valor bajo respecto al último visto (reinicio de temporada real en
el juego). Mientras tanto, aunque la fecha real ya haya cruzado al mes
siguiente, el mes efectivo (y por lo tanto Calendario/Control/Extra)
sigue mostrando la temporada anterior.

Bootstrap: si todavía no hay estado guardado (primera ejecución), se usa
la fecha real con el ajuste de "primer lunes del mes" (mismo criterio que
antes) solo para inicializar el valor de partida.
```


### Ubicación: `_getMesEfectivo`

#### 01B134 — líneas 2189-2199 (comentario)

```text
---------------------------------------------------------------------
Sin caché válido de clanes, el periodIndex recibido es un 0 por
DEFECTO (no un dato real de la API) — no se debe usar para detectar
rollover ni para pisar CTX_LAST_PERIOD_INDEX. Se devuelve el último mes
efectivo guardado tal cual, sin escribir nada en Properties. Esto es
lo que faltaba antes: una llamada aislada a _getCtx() (diagnóstico,
trigger suelto, etc.) terminaba grabando un periodIndex=0 falso como
si fuera real, y la siguiente corrida legítima con un periodIndex alto
se marcaba como "salto sospechoso" — bloqueando Guerra/Control sin
motivo real (ver conversación del 04-jul-2026).
---------------------------------------------------------------------
```

#### 01B135 — líneas 2208-2222 (comentario)

```text
Reinicio de temporada detectado: el periodIndex de la API volvió a un
valor bajo respecto al último visto -> avanzar el mes efectivo en 1.

IMPORTANTE: antes esta condición era solo "pIdx < lastPeriod", lo que
disparaba un "reinicio de temporada" falso ante CUALQUIER lectura de
periodIndex menor a la anterior — incluyendo un simple parpadeo/caché
desactualizada de Drive en pleno mediados de temporada (ver diagnóstico
del 05-jul-2026: aparecieron filas de Temporada 3, 4 y 5 en Guerra con
periodIndex ~28-33, es decir mitad/final de temporada, no un reinicio
real). Un reinicio real de temporada SIEMPRE se ve como un salto GRANDE
desde el final de una temporada (periodIndex alto, ~20+) hacia el
principio de la siguiente (periodIndex bajo, días de entrenamiento
0-6) — nunca un descenso de 1-2 unidades en pleno periodo de guerra.
Ahora se exige esa forma característica antes de avanzar el mes
efectivo, para no confundir ruido pasajero con un reinicio real.
```

#### 01B136 — líneas 2228-2238 (comentario)

```text
---------------------------------------------------------------------
GUARDIÁN ANTI-DRIFT — el mes efectivo NUNCA debería quedar más de 1 mes
calendario POR DELANTE de la fecha real de hoy. Sí puede quedar
ATRASADO (si una temporada real dura más de lo previsto), pero jamás
adelantado — eso solo pasa por incrementos en falso acumulados (ver
diagnóstico del 04-jul-2026: el contador llegó a marcar "Temporada 5,
mes de septiembre" estando hoy a inicios de julio). Como esto vive en
PropertiesService, ni borrar las hojas (demolerTodoElSpreadsheet) ni
volver a correr runAll lo corrige por sí solo — hay que detectarlo y
resetearlo aquí mismo, en el único lugar donde se lee/escribe.
---------------------------------------------------------------------
```

#### 01B137 — líneas 2261-2267 (docblock)

```text
Calcula el "mes efectivo" que correspondería HOY según la fecha real del
sistema (mismo criterio que usaba el bootstrap de _getMesEfectivo): si
todavía no llegó el primer lunes del mes actual, el mes efectivo sigue
siendo el anterior. Se usa tanto para el bootstrap inicial como para el
guardián anti-drift.
```


### Ubicación: `_calcularMesEfectivoRealDeHoy`

#### 01B138 — líneas 2280-2284 (docblock)

```text
calcTemporadaDesdeMesEfectivo(ref, mesEfectivo)
Igual que calcTemporadaDesdeRef(), pero a partir de un { anio, mes } ya
calculado (ver _getMesEfectivo) en vez de leer la fecha real directamente.
```


### Ubicación: `calcDiaGuerraIdx`

#### 01B139 — líneas 2322-2324 (comentario)

```text
---------------------------------------------------------------------------
HELPERS DE CLAN Y API
---------------------------------------------------------------------------
```

#### 01B140 — líneas 2326-2332 (comentario)

```text
---------------------------------------------------------------------------
HELPER DE TELÉFONOS
soloDigitos(): el valor GUARDADO de Prefijo/Celular debe ser siempre solo
dígitos. El formato visual con espacios ('### ### ### ###') se aplica
EXCLUSIVAMENTE vía setNumberFormat sobre la celda — nunca debe formar
parte del valor real de la celda, del CSV ni del JSON de respaldo.
---------------------------------------------------------------------------
```


### Ubicación: `soloDigitos`

#### 01B141 — líneas 2337-2348 (docblock)

```text
_getClanesAdminTexto(prefijo, celular)
Busca el celular (prefijo+celular, comparando solo dígitos) en
CFG.ADMIN_FAMILIA y devuelve el texto a mostrar en la columna
"Clanes_Admin": los nombres de TODOS los clanes Terna (concatenados con
", ", respetando el orden de filas de la hoja Clan — ver
_getNombresClanesTernaOrdenados()) si clanes:'TODOS', o los nombres
reales (resueltos por _resolverNombreClan) de los ClanTag listados en
clanes:[...]. Si el celular no está en la lista (todavía no se cargó su
número, o es un admin fuera de esta familia fija), devuelve '' — la
columna queda vacía en vez de inventar un dato.
```


### Ubicación: `_getClanesAdminTexto`

#### 01B142 — líneas 2365-2372 (docblock)

```text
_getNombresClanesTernaOrdenados()
Devuelve los nombres de los clanes Terna (CFG.TERNA_TAGS) en el orden de
filas de la hoja Clan (misma fuente de orden que usa Cat_disp/Plantillas,
ver _getOrdenClanHoja() en 43_Menu_Dinamico.gs). Si la hoja Clan todavía no tiene
datos (ej. corrida muy temprana), cae a _resolverNombreClan() en el orden
de CFG.TERNA_TAGS.
```


### Ubicación: `_getNombresClanesTernaOrdenados`

#### 01B143 — líneas 2390-2397 (docblock)

```text
_resolverNombreClan(clanTag)
Devuelve el nombre real del clan vía _getClanCache() (09_API_ClashRoyale.gs,
cache de la API ya consultada en esta ejecución). Si todavía no hay cache
para ese tag (p.ej. corrida muy temprana, o el bot corre fuera del flujo
de updateDirectorioSheet), cae a CFG.CLAN_NOMBRES_FALLBACK; si tampoco
está ahí, devuelve el tag tal cual para no dejar la celda vacía.
```


### Ubicación: `_resolverNombreClan`

#### 01B144 — líneas 2406-2412 (docblock)

```text
esRazonValida(v)
Devuelve true solo si v es una de las razones de veto reconocidas. 'Sí',
'No', vacío, o cualquier otro texto NO son razones válidas — se usa para
evitar que valores cruzados de la columna "Vetado" (Sí/No) se filtren a
la columna "Razón" desde el CSV o el JSON de respaldo.
```


### Ubicación: `esRazonValida`

#### 01B145 — líneas 2417-2423 (docblock)

```text
esTagOculto(tag)
Devuelve true si el tag está en CFG.TAGS_OCULTOS (cuentas ocultas
manualmente, ver comentario ahí). Normaliza mayúsculas/minúsculas y
agrega el '#' inicial si faltara, para comparar sin importar el formato
exacto con el que llegue el tag (API, CSV, hoja).
```


### Ubicación: `esTagOculto`

#### 01B146 — líneas 2434-2455 (docblock)

```text
_ocultarFilasTagsOcultos(sh, colTag)
Sincroniza el estado oculto/visible de las filas de datos (desde la fila
2) con CFG.TAGS_OCULTOS, comparando la columna `colTag` (1-based):
  - Oculta (Sheet.hideRows, NO borra) las filas cuyo tag SÍ está en
    CFG.TAGS_OCULTOS. hideRows() es idempotente (no pasa nada si la fila
    ya estaba oculta), así que esto se hace directo, sin chequear antes.
  - Muestra de nuevo (Sheet.showRows) las filas de tags que SE QUITARON
    de CFG.TAGS_OCULTOS desde la última corrida (ej. una cuenta se agregó
    por error y luego se corrige) — para eso se guarda en
    PropertiesService la lista aplicada en la corrida anterior y se
    compara con la actual.

IMPORTANTE (rendimiento): a propósito NO se usa Sheet.isRowHiddenByUser()
fila por fila en cada corrida — en una hoja grande (Guerra puede acumular
miles de filas por temporada) eso son miles de llamadas individuales a
Sheets y puede agotar el tiempo de ejecución (6 min) por sí solo. El
"unhide" solo escanea la hoja cuando de verdad cambió la lista de tags
ocultos (caso raro), y el "hide" es una sola lectura de columna + un
hideRows() por fila que coincide (siempre pocas, ya que son cuentas
excepcionales).
```


### Ubicación: `_ocultarFilasTagsOcultos`

#### 01B147 — líneas 2492-2508 (docblock)

```text
encodeTag(tag)
Codifica el "#" de un tag de Clash Royale como "%23" para usar en rutas
de la API (ver comentario de @param path en _apiGet(), 09_API_ClashRoyale.gs).

Idempotente (18/07/2026): se reportó una solicitud real a
.../players/%2523GG8PJ8GC en vez de .../players/%23GG8PJ8GC — es decir,
un "%23" que volvió a pasar por una codificación de URL en algún punto
de la cadena antes de llegar a la API, duplicando el "%" a "%25". La
causa exacta (origen del tag ya codificado) no se pudo reproducir en el
código de este archivo, pero como este es el único punto que arma el
segmento de tag para TODAS las llamadas (/clans, /clans/.../currentriverrace,
/players), blindarlo acá cubre cualquier fuente que hubiera colado un tag
ya codificado (una vez o dos): primero se normaliza hacia el "#" crudo
(deshaciendo "%2523" o "%23" tantas veces como aparezcan) y recién ahí se
codifica una sola vez. Un tag crudo normal pasa sin cambios.
```


### Ubicación: `colLetter`

#### 01B148 — líneas 2552-2554 (comentario)

```text
---------------------------------------------------------------------------
HELPERS DE FORMATO Y LAYOUT
---------------------------------------------------------------------------
```


### Ubicación: `_clearBg`

#### 01B149 — líneas 2587-2589 (comentario)

```text
---------------------------------------------------------------------------
HELPERS DE DRIVE Y SPREADSHEET
---------------------------------------------------------------------------
```


### Ubicación: `_desactivarGridlines`

#### 01B150 — líneas 2611-2625 (comentario)

```text
-----------------------------------------------------------------------
FALLBACK GENÉRICO SHEET -> CSV
NUEVO (15-sep-2026, pedido del usuario: "función genérica que permita
redirigir las consultas a los csv cuando sheets no está disponible o
está vacío"). Antes, cada función que necesitaba este comportamiento lo
reimplementaba a mano (ver _getCsvDirMap(), 11_DirectorioSheet.gs, que
solo cubre el caso puntual de Directorio/Backup_Directorio.csv). Esta
función centraliza el mismo criterio para CUALQUIER par hoja/CSV del
proyecto, reutilizando los helpers ya existentes _getCsvFolder()/
_loadCSVFromDrive()/_parseCSV() (05_Backup_CSV.gs) en vez de duplicarlos.
No reemplaza los backups puntuales ya existentes (_getCsvDirMap(),
importarAcumulativosDesdeCSV(), etc.) — es el punto de entrada genérico
que cualquier lectura NUEVA puede usar para no repetir el mismo
try/catch + chequeo de hoja vacía + fallback a CSV en cada función.
-----------------------------------------------------------------------
```

#### 01B151 — líneas 2627-2633 (docblock)

```text
_armarHeaderIdx(headers)
Convierte una fila de encabezados en un mapa { 'NombreColumna': idx0based }.
Helper interno de _obtenerFilasConFallbackCSV(), pero también reutilizable
por cualquier otra lectura que necesite resolver columnas por nombre en
vez de por posición fija.
```


### Ubicación: `_armarHeaderIdx`

#### 01B152 — líneas 2642-2692 (docblock)

```text
_obtenerFilasConFallbackCSV(ss, nombreHoja, nombreArchivoCsv, totalCols, headerRowsHoja)

Lee la hoja `nombreHoja` de `ss`. Si la hoja NO existe, si existe pero
está vacía (sin filas de datos más allá del encabezado), o si la lectura
falla por cualquier motivo (spreadsheet no disponible, hoja protegida/
corrupta, error transitorio de la API de Sheets), redirige
automáticamente la consulta al respaldo CSV `nombreArchivoCsv` guardado
en Drive (carpeta DRIVE_FOLDER_ID_CSV, ver _getCsvFolder()).

Requiere que la hoja y el CSV tengan las columnas en el MISMO orden
(igual criterio que ya usan todos los pares hoja/CSV del proyecto, ver
SHEET_CSV_BACKUP_MAP-style en 05_Backup_CSV.gs) para que totalCols y los
índices de columna sigan siendo válidos sin importar cuál de las dos
fuentes se haya usado.

@param {Spreadsheet} ss               - Spreadsheet activo (ver _getSs()).
@param {string}      nombreHoja       - Nombre de la hoja (CFG.SHEETS.*).
@param {string}      nombreArchivoCsv - Nombre del CSV de respaldo en Drive,
                                        ej. 'Backup_Directorio.csv'. Si se
                                        omite (undefined/''), no hay a
                                        dónde redirigir y se devuelve
                                        origen:'vacio' apenas la hoja falla.
@param {number}      [totalCols]      - Cantidad de columnas a leer/recortar.
                                        Si se omite, se usa el ancho real
                                        de la hoja (o el del CSV, en su caso).
@param {number}      [headerRowsHoja=1] NUEVO (15-sep-2026, pedido del
                                        usuario -- fallback web->CSV de
                                        Torneos, T_Lista/S_Lista/CR_Lista):
                                        cantidad de filas de encabezado
                                        FUSIONADAS que tiene la HOJA viva
                                        (1 = la mayoría de las hojas; 2 =
                                        T_Lista/S_Lista, ver
                                        _aplicarHeaderDosFilas(),
                                        02_Setup_Hojas.gs; 3 = CR_Lista,
                                        ver _aplicarHeaderTresFilas()). El
                                        CSV de respaldo, en cambio, SIEMPRE
                                        tiene 1 sola fila de encabezado ya
                                        combinada (ver
                                        _extraerValoresConLinksReales(),
                                        05_Backup_CSV.gs) sin importar este
                                        parámetro -- por eso solo afecta la
                                        rama 'sheet', nunca la rama 'csv'.

@returns {{
  filas:     Array<Array<*>>,        // filas de datos, SIN la fila de encabezado
  headers:   Array<string>,          // fila de encabezado de la fuente usada
  headerIdx: Object,                 // { 'NombreColumna': idx0based, ... }
  origen:    'sheet'|'csv'|'vacio'   // de dónde salieron los datos
}}
```


### Ubicación: `_obtenerFilasConFallbackCSV`

#### 01B153 — líneas 2718-2720 (comentario)

```text
Sheet no disponible (spreadsheet caído, hoja protegida/corrupta,
error transitorio de la API, etc.) -> se sigue de largo y se intenta
el CSV en vez de propagar la excepción.
```

#### 01B154 — líneas 2761-2775 (docblock)

```text
_obtenerMapaPorTagConFallbackCSV(ss, nombreHoja, nombreArchivoCsv, tagColIdx, totalCols)

Mismo criterio que _leerHojaComoMapaPorTag() (12_Players_Links.gs),
pero construido sobre _obtenerFilasConFallbackCSV(): arma un mapa
Tag -> fila, redirigiendo automáticamente al CSV de respaldo cuando la
hoja no existe o está vacía. `tagColIdx` es 0-based y debe apuntar a la
MISMA columna tanto en la hoja como en el CSV.

Pensada para lecturas nuevas que necesiten este comportamiento; los
mapas puntuales ya existentes (_getCsvDirMap(), _leerHojaComoMapaPorTag())
no se tocan.

@returns {{ mapa: Object, origen: 'sheet'|'csv'|'vacio' }}
```


### Ubicación: `_obtenerMapaPorTagConFallbackCSV`

#### 01B155 — líneas 2786-2800 (docblock)

```text
_numDesdeCeldaCSV_(v)
TANDA 15 (21-sep-2026, auditoría del AVISO 6). Convierte a número una celda
ENTERA que puede venir de la hoja (ya es número) o de un respaldo CSV (texto).
Los respaldos Backup_<Hoja>.csv se arman con getDisplayValues() (ver
_extraerValoresConLinksReales(), 05_Backup_CSV.gs), así que una celda con
formato '#,##0' (Clan: Trofeos/Requerimiento/Copas/Donaciones; Players: Copas
y otras) queda escrita "5,432" y Number("5,432") da NaN. Quita el separador
de miles (coma, punto, espacio o apóstrofo) SOLO cuando el texto tiene forma de
miles agrupados de a tres dígitos, así "3,000" y "3.000" dan 3000 y no se toca
ningún otro texto. Solo para columnas de enteros. Devuelve NaN si la celda está
vacía o no es numérica (el llamador decide el valor por defecto, p. ej. `|| 0`).
Gemela de _numDesdeCeldaLogs_() (17_GuerraSheet.gs, Tanda 12): misma regla, pero
esta vive en 01 para poder usarse desde cualquier archivo sin depender de Guerra.
```


### Ubicación: `_scriptToken`

#### 01B156 — líneas 2813-2815 (comentario)

```text
Corta temprano y con mensaje claro: sin literal de respaldo, un
secreto faltante en Script Properties ya no puede quedar disfrazado
de "undefined" silencioso en medio de un login o un endpoint.
```

#### 01B157 — líneas 2822-2841 (docblock)

```text
guardarTokensEnScriptProperties()
NUEVO (19-sep-2026, pedido del usuario -- seguimiento de B-35 de
Plan_Fases.md). Ya se ejecutó una vez y las 8 Properties están guardadas.
ACTUALIZACIÓN (19-sep-2026, misma entrega): retirados del código los
literales de respaldo que esta función copiaba a Script Properties, así
que ahora sirve solo como reintento/verificación: por cada token, si la
Property ya existe la deja intacta; si no existe, ya no tiene de dónde
sacar un valor (no hay literal en el código) y lo reporta en "fallaron"
para que se cree a mano. Es idempotente y NUNCA escribe valores en el
registro: solo nombres.

ADVERTENCIA: NUNCA cambies a mano el valor de CLAVE_ADMIN_PEPPER una vez
guardado. Es parte del hash de cada Clave_Hash de la hoja Administradores;
si cambia, TODOS los admins con hash guardado dejan de poder iniciar sesión
(el login solo compara contra el hash cuando existe). Los demás tokens sí se
pueden rotar cuando quieras editando su Property (y avisando a quien los
use); DASHBOARD_TOKEN, por ejemplo, solo lo usan los administradores del
dashboard.
```

#### 01B158 — 12-oct-2026 (funcionamiento, subcarpetas de la carpeta CSV)

```text
Archivos: 01_Config_Global.gs (_csvSubcarpetaDe_, _getCsvSubcarpeta_,
_csvBuscarArchivo_, CSV_MOVER_A_SUBCARPETA), 05_Backup_CSV.gs
(_loadCSVFromDrive, _saveCSVToDrive, _logTampermonkeyADrive) y
11_DirectorioSheet.gs (_getCsvDirMap).

Funcionamiento: la carpeta CSV tiene las subcarpetas Background, Hojas,
Informes, Tampermonkey y Jugador. _csvSubcarpetaDe_(nombre) devuelve la subcarpeta
asignada a cada CSV (Informes: "Backup_Guerra ANTES de reparar*", Reparacion_*,
Limpieza_Coliseo_*, Revision_Guerra*, Diagnostico_*; Tampermonkey: Correcciones_*,
Log_Tampermonkey_* y Backup_Guerra_Semanal.csv, que Apps Script arma con datos
traídos por Tampermonkey; Background, Hojas y Jugador: listas explícitas).
Criterio confirmado por la usuaria el 12-oct-2026: Background = comportamiento
general sin datos personales de un jugador (Cards, Cards_3, Modo, Arena,
Insignias, Logros, Cofres, Locations, Seasons); Jugador = datos
que dependen de cada jugador (Cards_2, Insignias_2, Logros_2, ProgresoEventos,
Battlelogs, PerfilWeb, CaminoLeyendas); Hojas = respaldo de una hoja de Sheets (incluye
Backup_Índice, Control, Control_2, T_Control, Calendario, Links y Multicuentas:
cualquier hoja respaldada sale como Backup_<hoja>.csv por
_respaldarListaHojasCSV, así que una hoja nueva debe sumarse a la lista de
Hojas); Informes incluye también Correccion_Fecha_Guerra_Logs*. Corrección: la primera versión de este mapa (12-oct-2026
mañana) puso Cards_2 e Insignias_2 en Background; son por jugador. Un nombre
sin asignar se queda en la raíz de CSV (hoy no queda ninguno de los que usa el
código).
Todo el código lee y escribe CSV solo con _loadCSVFromDrive/_saveCSVToDrive,
que buscan el archivo en este orden: subcarpeta asignada, raíz, demás
subcarpetas. Si existe en cualquier sitio NO se crea otra copia; si se guarda
fuera de su subcarpeta se mueve a ella (CSV_MOVER_A_SUBCARPETA). Los nombres
nuevos solo se crean (junto con su subcarpeta) cuando no existen en ninguna.

Por qué no se debe mover un CSV de carpeta sin esta lógica (evidencia
12-oct-2026): con la versión anterior, que solo buscaba en la raíz, al mover
a mano Backup_Guerra, Backup_Guerra_Semanal, Correcciones_Guerra y
Log_Tampermonkey_CorreccionGuerra a subcarpetas, _saveCSVToDrive creó copias
nuevas pequeñas en la raíz (108 KB, 31 KB, 1.6 KB y 203 B) y el sistema pasó a
leer esas copias en lugar de los originales (1.8 MB, 380 KB, 429 KB y 66 KB).
Si aparece una copia duplicada en la raíz, la que se usa es la de la subcarpeta
asignada; la copia pequeña debe borrarla la usuaria.

Fuera de este mecanismo: HistorialGuerra_Grupal.csv vive en la carpeta "Grupal"
(DRIVE_FOLDER_ID_ROYALEAPI_GRUPAL), no en CSV, así que no se mueve a Informes
por este cambio. Los JSON (ClanSystem_Backup_*, progresos) usan otras carpetas.
```


---


# Archivo 02_Setup_Hojas.gs

Creación y estructura de todas las hojas del spreadsheet (encabezados, formato base, protección). Punto de entrada: `setupAllSheets()`. Los IDs de bloque llevan prefijo `02`.


## Índice de bloques movidos

| ID | Líneas orig. | Ubicación | Resumen |
|---|---|---|---|
| 02B001 | 9-29 | `Cabecera del archivo` | Métricas del grid de Control: nombre, ancho TOTAL de columnas (25 de |
| 02B002 | 37-46 | `CONTROL_METRICAS` | Índices de columna (1-based) de la hoja "Inactivos" — ver _setupInactivos(). |
| 02B003 | 57-60 | `INACTIVOS_TOTAL_COLS` | Índices de columna (1-based) de la hoja "Players" — ver _setupPlayers(). |
| 02B004 | 73-76 | `PLAYERS_TOTAL_COLS` | Índices de columna (1-based) de la hoja "Links" — ver _setupLinks(). |
| 02B005 | 86-90 | `LINKS_TOTAL_COLS` | SECCIÓN 2: FUNCIONES DE SETUP / INTERNAS (sin cambios de orden respecto de |
| 02B006 | 107-109 | `setupAllSheets` | Las hojas Plantillas y Menú ya no se crean: Plantillas se eliminó en la |
| 02B007 | 116-124 | `setupAllSheets` | FIX (06-ago-2026): Cards y Cards_2 dejan de vivir en el spreadsheet. |
| 02B008 | 134-138 | `setupAllSheets` | NUEVO (09-sep-2026, pedido usuario): estructura de S_Asistencia (ver |
| 02B009 | 143-145 | `setupAllSheets` | FASE 6 (punto 6 del documento — Detección de infiltrados/sabotaje, |
| 02B010 | 147-150 | `setupAllSheets` | NUEVO (14-sep-2026, pedido del usuario): "Marcar visto en el grupo" |
| 02B011 | 160-169 | `setupAllSheets` | _getOrCreateSheet(ss, name) |
| 02B012 | 179-193 | `_getOrCreateSheet` | _setupAlertasHistorialGuerra(ss) |
| 02B013 | 198-206 | `_setupAlertasHistorialGuerra` | FIX (23-ago-2026, pedido del usuario): mismo estilo que T_Lista — antes |
| 02B014 | 209-214 | `_setupAlertasHistorialGuerra` | Bordes grises + centrado sobre las filas de datos que ya existan (p.ej. |
| 02B015 | 221-223 | `_setupAlertasHistorialGuerra` | Rango amplio (hasta fila 2000) para que la validación ya cubra filas que |
| 02B016 | 229-266 | `_setupExtra` | Mostrar_T (antes "Mostrar"): SOLO cambio de nombre — mantiene exactamente |
| 02B017 | 273-276 | `_setupExtra` | Siempre se reescribe la fila 1 (igual que Directorio) para que columnas |
| 02B018 | 287-294 | `_setupExtra` | _protegerSoloAdvertencia(sh) |
| 02B019 | 305-309 | `_protegerSoloAdvertencia` | _quitarProteccionAdvertencia(sh) |
| 02B020 | 320-335 | `_setupClan` | Min_T ELIMINADA (08/08/2026): ya no vive en esta hoja — ahora se |
| 02B021 | 351-355 | `_setupClan` | MIGRACIÓN INVERSA: si la hoja Clan todavía tiene la columna Min_T |
| 02B022 | 361-366 | `_setupClan` | MIGRACIÓN INVERSA (11/08/2026, FASE 27): si la hoja Clan todavía |
| 02B023 | 372-383 | `_setupClan` | MIGRACIÓN (12-ago-2026): si la hoja Clan todavía NO tiene las |
| 02B024 | 389-398 | `_setupClan` | MIGRACIÓN (16-sep-2026, pedido del usuario -- ícono real del clan a |
| 02B025 | 414-440 | `_setupDirectorio` | Cat_disp y Clanes_Admin (12/07/2026): YA NO forman parte de la hoja |
| 02B026 | 459-466 | `_setupGuerra` | PUNTO 1.4/1.5 (Consolidado_Cambios_Pendientes_Guerra.md): Temporada_2 y |
| 02B027 | 479-483 | `_setupGuerraLogs` | TANDA 1 (20-sep-2026): la lista de encabezados vive ahora en |
| 02B028 | 489-493 | `_setupGuerraLogs` | Siempre actualizar fila 1 para reflejar columnas nuevas (ej. Min_G |
| 02B029 | 512-517 | `_setupControl` | _controlColTotales() |
| 02B030 | 536-544 | `_buildControlHeaders` | _pintarEncabezadosControl(sh) |
| 02B031 | 551-555 | `_pintarEncabezadosControl` | A1:C2 queda vacío, combinado y centrado, SIN bordes — permite |
| 02B032 | 563-566 | `_pintarEncabezadosControl` | D1:P2 combinado y centrado: título con Temporada, Semana y Día |
| 02B033 | 575-577 | `_pintarEncabezadosControl` | Fila 1: nombre de cada métrica, ocupando TODO su ancho (incluye las |
| 02B034 | 589-591 | `_pintarEncabezadosControl` | Fila 2: "Sem N" combinado cada 5 columnas (bloque de días), y luego, |
| 02B035 | 603-612 | `_pintarEncabezadosControl` | Columnas agregadas (Total/%/Prom): fila 2 ya NO lleva el rótulo de |
| 02B036 | 628-630 | `_pintarEncabezadosControl` | Fila 3: encabezados fijos |
| 02B037 | 640-646 | `_pintarEncabezadosControl` | Fila 3: día de cada columna del bloque de semanas (J/V/S/D/Tsem), y |
| 02B038 | 687-689 | `_pintarEncabezadosControl` | Historial: N°\|Fecha\|Tag\|Nombre\|Movimiento\|Clan\|ClanTag (7 columnas) - Nombre = nombre en juego del jugador |
| 02B039 | 702-717 | `_setupPendientes` | Nom_Multi (agregada 06-ago-2026, a la derecha de Nombre): mismo campo |
| 02B040 | 722-727 | `_setupPendientes` | MIGRACIÓN: si la hoja ya existía SIN la columna Nom_Multi, se |
| 02B041 | 733-736 | `_setupPendientes` | MIGRACIÓN: si la hoja ya existía SIN la columna Préstamo, se inserta |
| 02B042 | 742-744 | `_setupPendientes` | MIGRACIÓN (13-ago-2026): si la hoja ya existía SIN la columna |
| 02B043 | 750-752 | `_setupPendientes` | Siempre reescribir la fila de encabezados (igual criterio que |
| 02B044 | 789-799 | `_setupComentarios` | FIX (26-ago-2026, pedido explícito del usuario): la columna 5 vuelve de |
| 02B045 | 808-810 | `_setupInactivos` | Inactivos: 29 columnas propias (ver IC arriba), el mismo set de campos |
| 02B046 | 828-847 | `_setupVetados` | FIX (26-ago-2026, pedido explícito del usuario): la columna 4 vuelve de |
| 02B047 | 849-852 | `_setupVetados` | Se reescriben SIEMPRE las 13 columnas (headers.length === VETADOS_TOTAL_COLS) |
| 02B048 | 856-861 | `_setupVetados` | Formato de fecha visible dd/mm/yyyy HH:mm:ss (24h) para la columna |
| 02B049 | 870-880 | `_setupVetados` | Multicuentas: 15 columnas |
| 02B050 | 893-908 | `_setupMulticuentas` | _setupPlayers(ss) |
| 02B051 | 927-945 | `_setupPlayers` | _setupLinks(ss) |
| 02B052 | 959-983 | `_setupLinks` | Ascensos (hoja física "Historial_A/D", ver CFG.SHEETS.ASCENSOS): 18 |
| 02B053 | 986-992 | `_setupAscensosSheet` | FASE 5 (13-sep-2026, pedido del usuario, plan de Cambio de Rango): se |
| 02B054 | 1005-1045 | `_setupAdministradores` | Administradores (12/07/2026): DEJÓ de ser un espejo de Directorio. |
| 02B055 | 1053-1056 | `_setupAdministradores` | Clave (col 23): contraseña de login web EN TEXTO PLANO, autogenerada |
| 02B056 | 1058-1065 | `_setupAdministradores` | Clave_Hash (col 24): NUEVO (15-sep-2026). Hash SHA-256 de la Clave |
| 02B057 | 1068-1076 | `_setupAdministradores` | Siempre actualizar fila 1 (13/07/2026, reorden Estado/Admin/Vetado/Razón |
| 02B058 | 1089-1096 | `_setupMensajes` | FIX (28-sep-2026, pedido del usuario -- "en la hoja Mensajes se borro el encabezado de la |
| 02B059 | 1104-1123 | `_setupMensajes` | _aplicarHeaderDosFilas(sh, columnas) |
| 02B060 | 1147-1157 | `_aplicarHeaderDosFilas` | FASE 2 (25-sep-2026, rediseño T_Lista): rompe CUALQUIER merge existente |
| 02B061 | 1170-1172 | `_aplicarHeaderDosFilas` | Estilo: mismo criterio visual que applyHeaderStyle() (04_Formato_Comun.gs), |
| 02B062 | 1185-1212 | `_aplicarHeaderDosFilas` | _aplicarHeaderTresFilas(sh, columnas) |
| 02B063 | 1267-1269 | `_aplicarHeaderTresFilas` | Mismo criterio visual que _aplicarHeaderDosFilas(), pero sobre 3 filas |
| 02B064 | 1282-1305 | `_aplicarHeaderTresFilas` | _aplicarFiltroFila2(sh, nombreHoja) |
| 02B065 | 1319-1330 | `_aplicarFiltroFila2` | _aplicarFiltroFila3(sh, nombreHoja) |
| 02B066 | 1344-1430 | `_aplicarFiltroFila3` | _setupTLista(ss) |
| 02B067 | 1433-1457 | `_setupTLista` | FASE 2 (25-sep-2026, rediseño T_Lista -- ver docblock del objeto TL en |
| 02B068 | 1469-1496 | `_setupTLista` | FIX (12-sep-2026, pedido del usuario -- requisito nuevo "Barcos"): |
| 02B069 | 1501-1510 | `_setupTLista` | FIX (31/08/2026, pedido del usuario — sugerencia #1 de la lista de |
| 02B070 | 1513-1517 | `_setupTLista` | Desplegable fijo de Estado ("Planificado"/"Realizado") — ver |
| 02B071 | 1519-1525 | `_setupTLista` | FIX (08-sep-2026, corrección de desincronización): faltaban estas 2 |
| 02B072 | 1528-1534 | `_setupTLista` | FIX (12-sep-2026, pedido del usuario -- consolidado, sección 1 cierre |
| 02B073 | 1542-1628 | `_setupTLista` | _setupSLista(ss) |
| 02B074 | 1640-1644 | `_setupSLista` | FIX (12-sep-2026, pedido del usuario -- requisito nuevo "Barcos"): |
| 02B075 | 1650-1652 | `_setupSLista` | Desplegables fijo/dinámico — ver docblocks de las 4 funciones |
| 02B076 | 1657-1660 | `_setupSLista` | FIX (12-sep-2026, pedido del usuario -- consolidado, sección 1 cierre |
| 02B077 | 1668-1699 | `_setupSLista` | _setupCRLista(ss) |
| 02B078 | 1729-1740 | `_setupCRLista` | _aplicarDropdownTipoCRLista(ss) |
| 02B079 | 1758-1773 | `_aplicarDropdownTipoCRLista` | _aplicarDropdownEstadoCRLista(ss) |
| 02B080 | 1791-1797 | `_aplicarDropdownEstadoCRLista` | _setupTAsistencia(ss) |
| 02B081 | 1808-1852 | `_setupTAsistencia` | _setupSAsistencia(ss) |
| 02B082 | 1860-1864 | `_setupSAsistencia` | Dropdown de Resultado (columna 13, SA.RESULTADO en 26_Torneos_Core.gs) -- |
| 02B083 | 1870-1874 | `_setupSAsistencia` | Razón (columna 14, SA.RAZON): dropdown RESUELTO (10-sep-2026, ver |
| 02B084 | 1888-1898 | `_setupSAsistencia` | _setupTControl(ss) |
| 02B085 | 1913-1915 | `_setupTControl` | Filas 1 y 2 (supercategoría "Torneos" y categorías "T_"&Temporada) se |
| 02B086 | 1921-1964 | `_setupTControl` | _setupTResoluciones(ss) |
| 02B087 | 1977-2003 | `_setupTResoluciones` | _setupConflictos(ss) |
| 02B088 | 2009-2013 | `_setupConflictos` | FIX (04-sep-2026): usaba CC.NOMBRE/CC.MOTIVO (variable global de la hoja |
| 02B089 | 2022-2056 | `_setupConflictos` | _setupGrupoVerificado(ss) |

---

## Detalle (texto original, sin cambios)

Cada bloque se copió tal cual estaba en el `.gs` (sin los `//`). Los números de línea son los del archivo ANTES de la limpieza.


### Ubicación: `Cabecera del archivo`

#### 02B001 — líneas 9-29 (comentario)

```text
-----------------------------------------------------------------------
Métricas del grid de Control: nombre, ancho TOTAL de columnas (25 de
semanas [J/V/S/D/Tsem × 5 semanas] + las columnas agregadas de temporada
propias de la métrica, si tiene) y los nombres de esas columnas agregadas
(rótulo individual en fila 3 — la fila del filtro nativo — con fila 2
como encabezado de grupo: "Resumen", combinado horizontalmente entre las
columnas agregadas de la métrica si tiene más de una, o sin combinar si
tiene una sola; nunca combinado verticalmente con la fila 3, ver
_pintarEncabezadosControl() más abajo y _repararMergesFiltroControl(),
02_Setup_Hojas.gs).
  - Ataques: +Total (suma de los 5 Tsem) y +% (Total / 64 u 80 según la
    temporada tenga 4 o 5 semanas).
  - Puntaje: +Prom (promedio de los Tsem; la semana 5 solo cuenta si la
    temporada tiene 5 semanas) y +% (Prom / Min_G de la semana actual,
    fijo en 100% si lo alcanza o supera).
  - Puntaje acumulado: sin columnas agregadas (sin cambios).
  - Barcos: +Total (suma de los 5 Tsem).
CUALQUIER cambio de ancho/orden aquí debe reflejarse también en los
offsets (OFF) usados en updateControlSheet(), _aplicarFmtCondicionalControl()
y _aplicarVisibilidadSemanasControl() (22_ControlCalendario.gs).
-----------------------------------------------------------------------
```


### Ubicación: `CONTROL_METRICAS`

#### 02B002 — líneas 37-46 (comentario)

```text
---------------------------------------------------------------------------
Índices de columna (1-based) de la hoja "Inactivos" — ver _setupInactivos().
INACTIVOS_TOTAL_COLS = 29. Mismo set de campos que Directorio (mismo orden;
ver DC en 02_Setup_Hojas.gs), pero sin las columnas de estadísticas de
Players/Links. Incluye Comentario (col 29) como campo propio de la hoja
(deja de guardarse solo en el snapshot JSON de extras, ver
_cargarExtraColsInactivos() en 05_Backup_CSV.gs). La columna Jugador (col 4)
se mantiene en la hoja pero se oculta automáticamente (ver
_setupInactivos() y _proyectarInactivos() en 05_Backup_CSV.gs).
---------------------------------------------------------------------------
```


### Ubicación: `INACTIVOS_TOTAL_COLS`

#### 02B003 — líneas 57-60 (comentario)

```text
---------------------------------------------------------------------------
Índices de columna (1-based) de la hoja "Players" — ver _setupPlayers().
PLAYERS_TOTAL_COLS = 31.
---------------------------------------------------------------------------
```


### Ubicación: `PLAYERS_TOTAL_COLS`

#### 02B004 — líneas 73-76 (comentario)

```text
---------------------------------------------------------------------------
Índices de columna (1-based) de la hoja "Links" — ver _setupLinks().
LINKS_TOTAL_COLS = 14.
---------------------------------------------------------------------------
```


### Ubicación: `LINKS_TOTAL_COLS`

#### 02B005 — líneas 86-90 (comentario)

```text
=============================================================================
SECCIÓN 2: FUNCIONES DE SETUP / INTERNAS (sin cambios de orden respecto de
antes del reordenamiento del 23-ago-2026, salvo por las 4 que se movieron
arriba a la Sección 1).
=============================================================================
```


### Ubicación: `setupAllSheets`

#### 02B006 — líneas 107-109 (comentario)

```text
Las hojas Plantillas y Menú ya no se crean: Plantillas se eliminó en la
migración a Menú, y Menú se reemplazó por el índice de contenido (ver
_getIndiceContenido(), 43_Menu_Dinamico.gs).
```

#### 02B007 — líneas 116-124 (comentario)

```text
FIX (06-ago-2026): Cards y Cards_2 dejan de vivir en el spreadsheet.
Ya NO se llama _setupCards(ss)/_setupCards2(ss) acá — esas dos hojas
se eliminaron del flujo (ver _limpiarHojasCardsObsoletas() en
04_Formato_Comun.gs). Los
datos de cartas viven ahora ÚNICAMENTE en Backup_Cards.csv y
Backup_Cards_2.csv (Drive), leídos/escritos directo por
updateCardsSheet()/updateCards2Sheet() y por _construirCardInfoMap()/
_construirCards2PorTag() (31_Cards_Mazos.gs) — ningún paso del flujo
vuelve a depender de una hoja "Cards"/"Cards_2" en Sheets.
```

#### 02B008 — líneas 134-138 (comentario)

```text
NUEVO (09-sep-2026, pedido usuario): estructura de S_Asistencia (ver
_setupSAsistencia() más abajo en este archivo) -- por ahora SOLO la
hoja/encabezados/dropdown de Resultado; el proceso que la llena (la
"ruleta" en la web) sigue pendiente de definir, ver el bloque
PENDIENTE en el docblock de procesarSorteos() (26_Torneos_Core.gs).
```

#### 02B009 — líneas 143-145 (comentario)

```text
FASE 6 (punto 6 del documento — Detección de infiltrados/sabotaje,
03-sep-2026): hoja editable a mano por el admin, ver _setupConflictos()
más abajo y CC/CC_TOTAL_COLS en 15_DeteccionInfiltrados.gs.
```

#### 02B010 — líneas 147-150 (comentario)

```text
NUEVO (14-sep-2026, pedido del usuario): "Marcar visto en el grupo"
pasa de vivir solo en memoria del navegador a persistir acá -- ver
_setupGrupoVerificado() más abajo en este mismo archivo y
CFG.SHEETS.GRUPO_VERIFICADO (01_Config_Global.gs).
```

#### 02B011 — líneas 160-169 (docblock)

```text
_getOrCreateSheet(ss, name)
NOTA (respaldo automático en CSV): cualquier hoja creada aquí NO necesita
registrarse a mano en ninguna lista de respaldo. respaldarHojasRestantesCSV()
(05_Backup_CSV.gs) recorre TODAS las hojas del spreadsheet automáticamente y
genera Backup_<NombreHoja>.csv para cada una que no tenga ya un mecanismo
de respaldo dedicado. Igualmente, cualquier columna de texto enriquecido
(enlaces) que se agregue en una hoja nueva se detecta sola al exportar a
CSV (ver _extraerValoresConLinksReales() en 05_Backup_CSV.gs).
```


### Ubicación: `_getOrCreateSheet`

#### 02B012 — líneas 179-193 (docblock)

```text
_setupAlertasHistorialGuerra(ss)
Hoja de discrepancias del histórico de Guerra (Sección 8 P3 del
consolidado): una fila por (Tag, TemporadaInterna, Semana) donde el valor
definitivo (log/analytics/perfil) llegó MENOR al último acumulado
provisional de River Race para esa semana — ver
_algunValorBajoHistorialGuerra() en 20_HistorialGuerraJugador.gs, que es
quien decide cuándo se genera la fila.

Resolución (todavía sin programar el lado de lectura, ver cabecera de
20_HistorialGuerraJugador.gs): el usuario cambia Estado a "Resuelto" y
llena ValorCorrecto a mano; una función futura leerá esta hoja y aplicará
ese valor al registro correspondiente (JSON individual + CSV grupal),
limpiando el flag "alerta" ahí.
```


### Ubicación: `_setupAlertasHistorialGuerra`

#### 02B013 — líneas 198-206 (comentario)

```text
FIX (23-ago-2026, pedido del usuario): mismo estilo que T_Lista — antes
el encabezado solo se ponía en negrita (setFontWeight('bold')) y el
resto de la tabla quedaba sin borde. applyHeaderStyle() (ver
01_Config_Global.gs) aplica el mismo fondo negro/letra blanca/bordes blancos
que usa el resto de las hojas "tipo tabla" del proyecto (T_Lista,
T_Asistencia, Extra, etc.) y ya se encarga de sh.setFrozenRows(1) — se
reescribe siempre (no solo "si no tenía encabezados") para que quede
igual de estilizada aunque la hoja ya existiera de antes con el
formato viejo.
```

#### 02B014 — líneas 209-214 (comentario)

```text
Bordes grises + centrado sobre las filas de datos que ya existan (p.ej.
tras restaurar desde Alertas_HistorialGuerra.csv en un Demoler previo) —
mismo criterio que _setupExtra() más abajo en este archivo. Las filas
NUEVAS que se agreguen después reciben su propio applyBorderCenter() en
_registrarAlertaHistorialGuerra() (20_HistorialGuerraJugador.gs), mismo
patrón que T_Asistencia/_generarAsistenciaParaTorneo().
```

#### 02B015 — líneas 221-223 (comentario)

```text
Rango amplio (hasta fila 2000) para que la validación ya cubra filas que
_registrarAlertaHistorialGuerra() todavía va a agregar más adelante —
mismo criterio que otras columnas de dropdown del proyecto.
```


### Ubicación: `_setupExtra`

#### 02B016 — líneas 229-266 (comentario)

```text
Mostrar_T (antes "Mostrar"): SOLO cambio de nombre — mantiene exactamente
las mismas conexiones/lecturas que tenía "Mostrar" (temporada elegida
para ver en Control/Control_2/Ascensos y descensos, etc.). Sigue en la
misma columna (G) porque las dos columnas nuevas se agregan A LA DERECHA.

Mostrar_S (nueva, sin lógica todavía): pensada para elegir/buscar una
SEMANA específica dentro de la temporada elegida en Mostrar_T.
Mostrar_D (nueva, sin lógica todavía): pensada para elegir un DÍA dentro
de la semana elegida en Mostrar_S (siempre relativo a Mostrar_T).
Por ahora ninguna de las dos tiene conexiones/lectores en el código —
solo existen como columnas en blanco, listas para que se les agregue
lógica más adelante.
Torneo_Vigente_ID / Sorteo_Vigente_ID (NUEVAS, 13-sep-2026, pedido del
usuario -- FASE 0 del plan de corrección Torneo/Sorteo): mismo criterio
que Mostrar_T (columna G) pero para elegir a mano CUÁL torneo/sorteo se
considera "vigente" para todo cálculo automático que no tenga un `id`
puntual en su propio contexto (ver _getIdVigenteExtra(), 26_Torneos_Core.gs).
Se guarda el ID (TL.ID/SL.ID) del torneo/sorteo elegido, NUNCA su Fecha
ni su N°. Van al FINAL (columnas 20 y 21) para no correr ninguna columna
existente. Por ahora se completan a mano directamente en esta hoja
(Extra está oculta pero editable, ver _protegerSoloAdvertencia() más
abajo); conectarlas a un selector en la web queda para una fase
posterior del mismo plan.

Ascenso_Vigente_ID / Descenso_Vigente_ID (NUEVAS, 13-sep-2026, pedido
del usuario -- plan de Cambio de Rango, precursor de la Fase 9 de
limpieza de T_Requisitos): MISMO patrón exacto que Torneo_Vigente_ID/
Sorteo_Vigente_ID, pero para CR_Lista. Guardan el ID (CR.ID) del par
Ascenso/Descenso que se considera "vigente" -- a diferencia de
Torneo_Vigente_ID/Sorteo_Vigente_ID (que hoy se llenan solo a mano),
estas dos SÍ tienen un escritor automático desde el inicio:
_autogenerarParCRListaSiCorrespondeInicioTemporada() (26_Torneos_Core.gs)
las sobreescribe cada vez que autogenera un par nuevo el primer día de
temporada. Igual que las de Torneo/Sorteo, siguen siendo editables a
mano en esta misma hoja si algún día hace falta apuntar a un par
distinto del recién autogenerado (Extra está oculta pero editable, ver
_protegerSoloAdvertencia() más abajo). Van al FINAL (columnas 22 y 23)
para no correr ninguna columna existente.
```

#### 02B017 — líneas 273-276 (comentario)

```text
Siempre se reescribe la fila 1 (igual que Directorio) para que columnas
nuevas (p.ej. Mostrar_S/Mostrar_D, Visibilidad, Tipo, Torneo_Vigente_ID/
Sorteo_Vigente_ID, Ascenso_Vigente_ID/Descenso_Vigente_ID) se agreguen
también en hojas ya existentes.
```

#### 02B018 — líneas 287-294 (docblock)

```text
_protegerSoloAdvertencia(sh)
Aplica protección de "solo advertencia" a toda la hoja: al editar se
muestra el aviso de Google Sheets, pero la edición SÍ se permite después
de aceptarlo (igual que la hoja Extra). Evita acumular protecciones
duplicadas en cada ejecución, ya que primero quita cualquier protección
previa creada por este mismo sistema (identificada por su descripción).
```


### Ubicación: `_protegerSoloAdvertencia`

#### 02B019 — líneas 305-309 (docblock)

```text
_quitarProteccionAdvertencia(sh)
Quita la protección de "solo advertencia" creada por _protegerSoloAdvertencia,
si existe, dejando la hoja completamente editable sin avisos.
```


### Ubicación: `_setupClan`

#### 02B020 — líneas 320-335 (comentario)

```text
Min_T ELIMINADA (08/08/2026): ya no vive en esta hoja — ahora se
define por clan vía T_Lista/S_Lista (categoría "Torneo").
Min_G ELIMINADA (11/08/2026, FASE 27, pedido del usuario): ya no vive
en esta hoja tampoco — ahora se define por clan en CR_Lista,
categoría "Descensos", columna "Miembro" (ver 10_ClanSheet.gs y
26_Torneos_Core.gs). Ver la migración inversa más abajo (borra la columna
si todavía existe de una hoja creada antes de este cambio) — mismo
patrón ya usado para Min_T.
FIX (12-ago-2026): 'Analytics' y 'CSV' agregadas a la derecha de
'RoyaleApi' — ver comentario junto a "var CC" en 10_ClanSheet.gs.
FIX (12-ago-2026): 'Analytics' y 'CSV' agregadas a la derecha de
'RoyaleApi' — ver comentario junto a "var CC" en 10_ClanSheet.gs.
NUEVO (16-sep-2026, pedido del usuario -- ícono real del clan a
partir del badgeId de Supercell): 'Badge_Id' agregada a la derecha de
'Descripción' y a la izquierda de 'RoyaleApi' — ver docblock completo
junto a "var CC" en 10_ClanSheet.gs (CC.BADGE_ID).
```

#### 02B021 — líneas 351-355 (comentario)

```text
MIGRACIÓN INVERSA: si la hoja Clan todavía tiene la columna Min_T
(agregada el 23/07/2026 en la posición 7), se elimina físicamente.
deleteColumn() conserva el contenido del resto de columnas
automáticamente (Google Sheets corre todo hacia la izquierda), así
que no hace falta mover datos a mano.
```

#### 02B022 — líneas 361-366 (comentario)

```text
MIGRACIÓN INVERSA (11/08/2026, FASE 27): si la hoja Clan todavía
tiene la columna Min_G (posición 6, la única posición que tuvo en
toda su historia — nunca se movió), se elimina físicamente,
desplazando Trofeos..Condición una posición a la izquierda. Se
revisa DESPUÉS de la migración de Min_T de arriba, por si una hoja
muy vieja todavía tuviera ambas columnas presentes a la vez.
```

#### 02B023 — líneas 372-383 (comentario)

```text
MIGRACIÓN (12-ago-2026): si la hoja Clan todavía NO tiene las
columnas 'Analytics'/'CSV' (layout viejo, donde la posición 15 era
'CWStats' en vez de 'Analytics'), se insertan 2 columnas nuevas
justo a la derecha de RoyaleApi (posición 14) — insertColumnsAfter()
corre CWStats..Condición hacia la derecha automáticamente sin perder
ningún dato ya escrito en esas columnas (enlaces, Condición, etc.).
Se detecta por el encabezado de la columna 15: si ya dice
'Analytics', la migración ya se aplicó antes y no se repite.
OJO -- esta migración vive ANTES de la de 'Badge_Id' (justo abajo)
porque todavía chequea la posición VIEJA (15, antes de que
'Badge_Id' corriera todo un lugar a la derecha); una hoja tan vieja
que necesite esta migración pasa por las dos, en orden.
```

#### 02B024 — líneas 389-398 (comentario)

```text
MIGRACIÓN (16-sep-2026, pedido del usuario -- ícono real del clan a
partir del badgeId de Supercell): si la hoja Clan todavía NO tiene
la columna 'Badge_Id' (layout viejo, donde la posición 14 era
'RoyaleApi'), se inserta 1 columna nueva justo a la derecha de
'Descripción' (posición 13) — insertColumnsAfter() corre
RoyaleApi..Condición una posición a la derecha automáticamente sin
perder ningún dato ya escrito ahí (enlaces, Condición, etc.), mismo
patrón EXACTO que la migración de 'Analytics'/'CSV' de arriba. Se
detecta por el encabezado de la columna 14: si ya dice 'Badge_Id',
la migración ya se aplicó antes y no se repite.
```


### Ubicación: `_setupDirectorio`

#### 02B025 — líneas 414-440 (comentario)

```text
Cat_disp y Clanes_Admin (12/07/2026): YA NO forman parte de la hoja
Directorio. Ambas siguen existiendo, al final, en la hoja Administradores
(ver _setupAdministradores() más abajo) — que es ahora el único lugar
donde se editan/muestran — y también se siguen incluyendo en
Backup_Directorio.csv (agregadas ahí a partir de Administradores, ver
syncDirectorioCSV() en 05_Backup_CSV.gs), aunque ya no estén en esta hoja.

Directorio pasó de 58 a 29 columnas (13/07/2026, Fase 4): además de
Cat_disp/Clanes_Admin, ahora se quitan también físicamente:
  - Los 23 campos de estadísticas de Players (Antigüedad..Donaciones_d)
    — ahora viven solo en la hoja Players (ver _setupPlayers() más
    abajo, PC en 02_Setup_Hojas.gs).
  - Los 6 campos de enlaces de Links (WSP, RoyaleAPI, Mazo, Mazo2,
    CWStats, Render) — ahora viven solo en la hoja Links (ver
    _setupLinks() más abajo, LC en 02_Setup_Hojas.gs).
El resultado es el MISMO layout de 29 columnas que la hoja Inactivos
(ver IC/_setupInactivos() más arriba en este archivo), en el MISMO
ORDEN, incluyendo Comentario como columna 29 — este arreglo de headers
es intencionalmente idéntico al de _setupInactivos(). El modelo
"completo" de 60 columnas (DC, ver 02_Setup_Hojas.gs) se sigue
usando en memoria para armar el CSV y las hojas Players/Links/Inactivos;
solo cambia el ANCHO FÍSICO real de esta hoja.

Si la hoja viene de una versión anterior con las columnas de Players/
Links (o Cat_disp/Clanes_Admin) todavía físicamente presentes, hace
falta una migración manual (borrar/reordenar columnas) antes de que
este layout quede consistente.
```


### Ubicación: `_setupGuerra`

#### 02B026 — líneas 459-466 (comentario)

```text
PUNTO 1.4/1.5 (Consolidado_Cambios_Pendientes_Guerra.md): Temporada_2 y
Origen agregadas al final (columnas 19-20, ver GC en 17_GuerraSheet.gs).
Se cambia a "siempre reescribir fila 1" (mismo criterio que
_setupGuerraLogs()) para que una hoja Guerra YA EXISTENTE (creada antes
de este cambio, con solo 18 columnas de encabezado) reciba los 2
encabezados nuevos sin necesitar un Demoler — antes solo se escribía
el encabezado si la hoja nacía vacía, así que un despliegue sobre una
hoja ya poblada nunca hubiera mostrado los nombres de columna nuevos.
```


### Ubicación: `_setupGuerraLogs`

#### 02B027 — líneas 479-483 (comentario)

```text
TANDA 1 (20-sep-2026): la lista de encabezados vive ahora en
GUERRA_LOGS_HEADERS (17_GuerraSheet.gs, fuente única, igual que
GUERRA_HEADERS para Guerra) -- 27 columnas, con ProgressEarned,
NumOfDefensesRemaining, ProgressEarnedFromDefenses, Tipo (TANDA 5:
Terna/Rival) y Estado (TANDA 13a, 21-sep-2026: Leído/Estimado) al final.
```

#### 02B028 — líneas 489-493 (comentario)

```text
Siempre actualizar fila 1 para reflejar columnas nuevas (ej. Min_G
agregada después de que la hoja ya existía con 20 columnas; EndOfDayRank
agregada 07-sep-2026, FASE 13 punto 1, después de que ya existía con 21;
las 3 de avance, 20-sep-2026, con 22). Solo se escribe la fila 1: los
datos existentes no se tocan.
```


### Ubicación: `_setupControl`

#### 02B029 — líneas 512-517 (docblock)

```text
_controlColTotales()
Última columna con contenido de la hoja Control: 16 columnas fijas (15 +
"Ascenso") + la suma de anchos de CONTROL_METRICAS (105 = 27+27+25+26) = 121.
FIX (03-ago-2026): 17->16 columnas fijas (se sacó "Jugador").
```


### Ubicación: `_buildControlHeaders`

#### 02B030 — líneas 536-544 (docblock)

```text
_pintarEncabezadosControl(sh)
(Re)pinta las 3 filas de encabezado de Control completas (títulos,
combinaciones de Sem N, letras de día, columnas agregadas Total/%/Prom y
bordes) según CONTROL_METRICAS. Se usa tanto en el setup inicial de una
hoja nueva (_buildControlHeaders) como después de insertar columnas en una
hoja YA EXISTENTE (ver migrarControlColumnasExtra(), 22_ControlCalendario.gs).
No toca datos (filas 4+), solo encabezados.
```


### Ubicación: `_pintarEncabezadosControl`

#### 02B031 — líneas 551-555 (comentario)

```text
A1:C2 queda vacío, combinado y centrado, SIN bordes — permite
inmovilizar columnas hasta la C (ver shCtrl.setFrozenColumns(3) en
_restaurarFiltros(), 04_Formato_Comun.gs) sin partir la celda de título. Relleno
negro (igual que el resto del encabezado) para que no se vea como un
hueco/celda en blanco junto al título.
```

#### 02B032 — líneas 563-566 (comentario)

```text
D1:P2 combinado y centrado: título con Temporada, Semana y Día
(nombre completo del día, ver CFG.CONTROL_TITULO_FORMULA en 01_Config_Global.gs).
FIX (03-ago-2026): 13 columnas (D..P) = 16 columnas fijas - 3 (A-C) = 13
(antes 14, con Jugador todavía en el conteo).
```

#### 02B033 — líneas 575-577 (comentario)

```text
Fila 1: nombre de cada métrica, ocupando TODO su ancho (incluye las
columnas agregadas de temporada: Total/%/Prom son parte conceptual de
la métrica, así que la celda combinada de fila 1 también las cubre).
```

#### 02B034 — líneas 589-591 (comentario)

```text
Fila 2: "Sem N" combinado cada 5 columnas (bloque de días), y luego,
por métrica, el encabezado de grupo "Resumen" de sus columnas agregadas
(Total/%/Prom) — ver detalle en el comentario dentro del loop.
```

#### 02B035 — líneas 603-612 (comentario)

```text
Columnas agregadas (Total/%/Prom): fila 2 ya NO lleva el rótulo de
cada una (eso vive en fila 3, ver loop de más abajo) — en vez de eso,
fila 2 funciona como encabezado de GRUPO para todas las columnas
agregadas de la métrica, con el texto "Resumen". Si la métrica tiene
más de una columna agregada (Ataques: Total+%, Puntaje: Prom+%), esa
celda se combina horizontalmente entre ellas; si tiene una sola
(Barcos: Total) se deja SIN combinar, una sola celda con "Resumen".
Nunca se combina verticalmente con la fila 3 (a diferencia de antes):
eso es justo lo que rompía createFilter() al arrancar en fila 3, ver
_repararMergesFiltroControl(), 04_Formato_Comun.gs.
```

#### 02B036 — líneas 628-630 (comentario)

```text
Fila 3: encabezados fijos
FIX (03-ago-2026): columna "Jugador" eliminada de Control (quedaba
duplicada con Directorio y ya no se usa acá) — 17 columnas fijas -> 16.
```

#### 02B037 — líneas 640-646 (comentario)

```text
Fila 3: día de cada columna del bloque de semanas (J/V/S/D/Tsem), y
luego el rótulo individual de cada columna agregada (Total/%/Prom) de
la métrica — es la fila que usa el desplegable del filtro nativo para
mostrar el nombre de columna (arranca en fila 3, ver
_restaurarFiltros(), 04_Formato_Comun.gs), así que TODAS las columnas necesitan
su propio texto acá, agregadas incluidas (fila 2, arriba, ya no lo
tiene: ahí solo va "Resumen" como encabezado de grupo).
```

#### 02B038 — líneas 687-689 (comentario)

```text
---------------------------------------------------------------------------
Historial: N°|Fecha|Tag|Nombre|Movimiento|Clan|ClanTag  (7 columnas) - Nombre = nombre en juego del jugador
---------------------------------------------------------------------------
```


### Ubicación: `_setupPendientes`

#### 02B039 — líneas 702-717 (comentario)

```text
Nom_Multi (agregada 06-ago-2026, a la derecha de Nombre): mismo campo
que en Directorio (IC.NOM_MULTI), se usa para identificar multicuentas
directamente en Pendientes. Queda OCULTA por defecto (ver más abajo y
updatePendientesSheet() en 17_GuerraSheet.gs, que la vuelve a ocultar
en cada corrida de runAll()/runUpdate()).
Préstamo (agregada 07-ago-2026, a la derecha de Nom_Multi): mismo
campo que en Directorio (IC.PRESTAMO). Igual que Nom_Multi, queda
OCULTA por defecto (ver más abajo y updatePendientesSheet() en
17_GuerraSheet.gs).
RoyaleAPI (agregada 13-ago-2026, a la derecha de WSP, pedido del
usuario): mismo link que la columna RoyaleAPI de la hoja Links (ver
LC.ROYALE_API / _escribirLinks(), 12_Players_Links.gs) —
'https://royaleapi.com/player/' + tag sin '#' + '/', con el mismo
texto de enlace ('Link'). A diferencia de Nom_Multi/Préstamo, esta
columna queda VISIBLE por defecto (mismo criterio que WSP, a su
izquierda).
```

#### 02B040 — líneas 722-727 (comentario)

```text
MIGRACIÓN: si la hoja ya existía SIN la columna Nom_Multi, se
inserta físicamente a la derecha de Nombre (columna 3 -> 4),
desplazando Clan..WSP una posición a la derecha.
insertColumnsAfter() conserva el contenido de cada columna existente
automáticamente (mismo patrón que la migración de Min_T en
_setupClan(), más arriba en este mismo archivo).
```

#### 02B041 — líneas 733-736 (comentario)

```text
MIGRACIÓN: si la hoja ya existía SIN la columna Préstamo, se inserta
físicamente a la derecha de Nom_Multi (columna 4 -> 5), desplazando
Clan..WSP una posición a la derecha. Mismo patrón que la migración
de Nom_Multi de arriba.
```

#### 02B042 — líneas 742-744 (comentario)

```text
MIGRACIÓN (13-ago-2026): si la hoja ya existía SIN la columna
RoyaleAPI, se inserta físicamente a la derecha de WSP (columna
9 -> 10). Mismo patrón que las 2 migraciones de arriba.
```

#### 02B043 — líneas 750-752 (comentario)

```text
Siempre reescribir la fila de encabezados (igual criterio que
Extra/Directorio/Clan) para que quede al día aunque la hoja ya
tuviera datos.
```


### Ubicación: `_setupComentarios`

#### 02B044 — líneas 789-799 (comentario)

```text
FIX (26-ago-2026, pedido explícito del usuario): la columna 5 vuelve de
"Jugador" a "Nom_Multi" (revierte el FIX del 25-ago-2026). El VALOR
que se sigue escribiendo ahí NO cambia: sigue siendo IC.NOM_MULTI (el
nombre legible escrito a mano en Directorio, sin el listado de cuentas)
— ver CMC/COMENTARIOS_TOTAL_COLS en 11_DirectorioSheet.gs y
moverComentarioFila()/_copiarComentarioAscensoAComentarios(), que arman
la fila con esos índices nombrados. La clave interna CMC.NOM_MULTI
(antes CMC.JUGADOR) también se renombró en 11_DirectorioSheet.gs para
que no quede ninguna referencia a "Jugador" fuera de Directorio/Inactivos.
Siempre se reescribe la fila 1 (igual que Vetados/Administradores) para
que una hoja YA EXISTENTE con el encabezado viejo también quede al día.
```


### Ubicación: `_setupInactivos`

#### 02B045 — líneas 808-810 (comentario)

```text
Inactivos: 29 columnas propias (ver IC arriba), el mismo set de campos
que Directorio más Comentario al final. Siempre se reescribe la fila 1
para reflejar la estructura vigente.
```


### Ubicación: `_setupVetados`

#### 02B046 — líneas 828-847 (comentario)

```text
FIX (26-ago-2026, pedido explícito del usuario): la columna 4 vuelve de
"Jugador" a "Nom_Multi" (revierte el FIX del 25-ago-2026 — el VALOR
que se escribe ahí sigue siendo el mismo Nom_Multi calculado, solo
cambia el rótulo del encabezado; ver VC en 11_DirectorioSheet.gs).

FASE 4 — WEB (arquitectura-web-familia-terna.md, Sección 7.5): se
agregan 3 columnas nuevas al final, exclusivas del flujo "Vetar desde
la web" (todavía sin backend implementado, ver Sección 7 del doc):
  - Autor: Nom_Multi (o Nombre) del admin que vetó.
  - Vía: 'Web' | 'Bot' | 'Sheet' — dropdown, editable a mano después.
  - Fecha: objeto Date real del momento del veto. Formato dd/mm/yyyy
    HH:mm:ss (24h). SÍ se respalda/restaura en el ciclo CSV (igual que
    el resto de columnas), pero como número (epoch ms), nunca como
    texto — ver colsFormatoNumerico en respaldarIndiceYProtegidasCSV()/
    _respaldarListaHojasCSV() e importarAcumulativosDesdeCSV(), y
    _parseSpanishDate() (todas en 05_Backup_CSV.gs).
VETADOS_TOTAL_COLS pasa de 10 a 13 (ver 11_DirectorioSheet.gs). Siempre
se reescribe la fila 1 (igual que Comentarios/Administradores) para que
una hoja YA EXISTENTE con el encabezado/ancho viejo también quede al
día en la próxima corrida de setup.
```

#### 02B047 — líneas 849-852 (comentario)

```text
Se reescriben SIEMPRE las 13 columnas (headers.length === VETADOS_TOTAL_COLS)
para que una hoja ya existente, que haya quedado con encabezados viejos
o incompletos en Autor/Vía/Fecha (col. 11-13), quede al día en esta
misma corrida — no depende de si la hoja ya tenía o no esas columnas.
```

#### 02B048 — líneas 856-861 (comentario)

```text
Formato de fecha visible dd/mm/yyyy HH:mm:ss (24h) para la columna
Fecha, igual que el resto de columnas de fecha con hora del proyecto.
El dropdown de Vía ('Web'/'Bot'/'Sheet') se aplica en cada corrida de
_updateVetados() vía _aplicarDropdownsVetados() (13_Inactivos_Vetados.gs),
mismo patrón que _aplicarDropdownsAdministradores()/_aplicarDropdownsInactivos()
— así cubre siempre el número real de filas, no un rango fijo adivinado acá.
```

#### 02B049 — líneas 870-880 (comentario)

```text
---------------------------------------------------------------------------
Multicuentas: 15 columnas
N°|Tag|Nombre|Nom_Multi|Préstamo|Clan|Rango|Nivel|Copas|V_Guerra|
Iniciales|Permiso|Inactividad(d)|Alerta|Estado
---------------------------------------------------------------------------
CAMBIO (07-ago-2026): se quitó la columna "Jugador" (valor calculado de
apoyo interno, redundante con Nom_Multi) y se agregó "Préstamo" a la
derecha de Nom_Multi, mismo campo que en Directorio (DC.PRESTAMO). El
total de columnas se mantiene en 15, así que Rango/Estado y las columnas
numéricas (Nivel/Copas/V_Guerra) NO cambian de posición — ver
_updateMulticuentas() en 13_Inactivos_Vetados.gs.
```


### Ubicación: `_setupMulticuentas`

#### 02B050 — líneas 893-908 (docblock)

```text
_setupPlayers(ss)
Hoja "Players": 31 columnas. Roster de jugadores con los mismos campos de
estadísticas de la API que Directorio, sin las columnas de gestión interna
(Prefijo/Celular/WSP(G)/Fecha_ing/Vigencia/Alerta/Estado/Vetado/etc.).
N°|Tag|Nombre|Nom_Multi|Préstamo|Clan|ClanTag|Rango|Antigüedad|Nivel|
Nivel2|Copas|Copas_max|Arena|V_Guerra|Victorias|Derrotas|Batallas|Racha|
Camino de leyendas_Liga|Camino de leyendas_Trofeos|Camino de leyendas_Rango|
Victorias de tres coronas|Max_victorias_desafíos|Torneos|Emotes|Banners|
Cartas_desafíos|Cartas_torneos|Donaciones_r|Donaciones_d

NOTA: esta función solo crea la hoja y sus encabezados. El respaldo en
Backup_Players.csv es automático (ver respaldarHojasRestantesCSV() en
05_Backup_CSV.gs). NO incluye lógica de población/sincronización de datos
desde la API o desde Directorio — eso queda pendiente de definir.
```


### Ubicación: `_setupPlayers`

#### 02B051 — líneas 927-945 (docblock)

```text
_setupLinks(ss)
Hoja "Links": 14 columnas. Registro centralizado de enlaces por jugador
(mismas columnas de enlace que Administradores: WSP, RoyaleAPI, Mazo,
Mazo2, CWStats, Render), junto con las columnas de identificación básicas.
N°|Tag|Nombre|Nom_Multi|Préstamo|Clan|ClanTag|Rango|WSP|RoyaleAPI|
Mazo|Mazo2|CWStats|Render

Jugador (12/07/2026): quitada de esta hoja — esa columna queda SOLO en
Directorio e Inactivos.

NOTA: esta función solo crea la hoja y sus encabezados. El respaldo en
Backup_Links.csv es automático (ver respaldarHojasRestantesCSV() en
05_Backup_CSV.gs), incluida la detección automática de texto enriquecido
(ver _extraerValoresConLinksReales() en 05_Backup_CSV.gs) para las columnas
WSP/RoyaleAPI/Mazo/Mazo2/CWStats/Render en cuanto se llenen con
makeLink(). NO incluye lógica de población/sincronización de datos desde
Administradores o Directorio — eso queda pendiente de definir.
```


### Ubicación: `_setupLinks`

#### 02B052 — líneas 959-983 (comentario)

```text
---------------------------------------------------------------------------
Ascensos (hoja física "Historial_A/D", ver CFG.SHEETS.ASCENSOS): 18
columnas — registro histórico (append-only) de cambios de rango
detectados en el Directorio, MÁS (desde la Fase 5 de CR_Lista,
13-sep-2026) las propuestas generadas por el sistema de Cambio de Rango.
Ver updateAscensosSheet() en 24_Historial_Ascensos.gs para el
flujo de detección/escritura real, y _registrarPropuestasCRListaEnHistorial()
(mismo archivo) para el flujo de propuestas.
FIX (26-ago-2026, pedido explícito del usuario): la columna 3 vuelve a
llamarse "Nombre" (antes decía "Nombre Jugador", sin motivo claro). El
VALOR que se escribe ahí NO cambia: sigue siendo el mismo Nombre del
Directorio (registro[ASC.NOMBRE-1] = filaDirectorio[DC.NOMBRE-1], ver
updateAscensosSheet()/_construirRegistroAscenso() en
24_Historial_Ascensos.gs) — nunca fue el campo Jugador/
Nom_Multi, así que no hace falta tocar ASC.NOMBRE ni ninguna otra lógica.
FASE 5 (13-sep-2026, pedido del usuario, plan de Cambio de Rango): se
agrega la columna 18 "Estado_Propuesta" (Planificado/Realizado/vacío) --
ver docblock de ASC (13_Inactivos_Vetados.gs) para la
semántica completa. Antes esta función solo escribía la fila 1 si la
hoja estaba vacía; ahora se reescribe SIEMPRE (mismo criterio que
Vetados/Comentarios/Administradores) para que una hoja YA EXISTENTE con
el encabezado viejo también quede al día en la próxima corrida de setup.
N°|Tag|Nombre|Nom_Multi|Iniciales|Permiso|Inactividad(d)|Fecha|
Clan|ClanTag|Líder|Autor|Rango|Rango_2|Tipo|Estado|Comentario|Estado_Propuesta
---------------------------------------------------------------------------
```


### Ubicación: `_setupAscensosSheet`

#### 02B053 — líneas 986-992 (comentario)

```text
FASE 5 (13-sep-2026, pedido del usuario, plan de Cambio de Rango): se
agrega "Estado_Propuesta" (columna 18) al final -- ver docblock de ASC
(13_Inactivos_Vetados.gs) para la semántica completa
(Planificado/Realizado/vacío). Mismo criterio que el resto de
_setup*() del proyecto: siempre reescribir la fila 1 completa, para
que una hoja YA EXISTENTE (17 cols, header viejo) también quede al
día en la próxima corrida de setup sin depender de que esté vacía.
```


### Ubicación: `_setupAdministradores`

#### 02B054 — líneas 1005-1045 (comentario)

```text
Administradores (12/07/2026): DEJÓ de ser un espejo de Directorio.
Ahora tiene su PROPIA estructura reducida — solo los campos de
identidad y gestión de admins — en un orden propio (Rango va DESPUÉS de
Clan/ClanTag, al revés que en Directorio). Ver el objeto de índices AC
en 11_DirectorioSheet.gs; sincronizarAdministradores() (en ese mismo
archivo) arma cada fila campo por campo desde Directorio, ya no copia
filas completas por posición. Cat_disp/Funciones/Clanes_Admin/Clave son
el único lugar en Sheets donde existen (además de Backup_Directorio.csv,
que toma Cat_disp/Clanes_Admin de aquí, ver syncDirectorioCSV() en
05_Backup_CSV.gs — Funciones y Clave NO se exportan a ese CSV, ver nota
ahí).

FASE 4 — WEB (25-ago-2026, arquitectura-web-familia-terna.md Sección
7.2): se agregan 2 columnas nuevas, 21 → 23 columnas totales:
  - Funciones (col 21): permisos de FUNCIONES del panel admin web
    ("Vetar", "Registrar miembro nuevo"), texto libre separado por
    comas, edición MANUAL — distinta de Cat_disp, que es solo accesos a
    contenido/categorías de Menú.
  - Clave (col 23): contraseña individual de cada admin para el login
    personalizado de la web (usuario = Celular, columna 11).
    FASE 5 (26-ago-2026, pedido explícito del usuario): dejó de ser de
    edición MANUAL exclusiva. sincronizarAdministradores() ahora la
    AUTOGENERA la primera vez que un Celular aparece como
    administrador (una sola Clave por Celular, no por Tag/fila —
    comparte la misma en todas las cuentas de una multicuenta) y
    luego la preserva tal cual en cada corrida futura, igual que ya
    preservaba Funciones/Cat_disp — nunca la recalcula ni la borra una
    vez generada. Ver sincronizarAdministradores() y _generarClaveAdmin()
    en 11_DirectorioSheet.gs.
  Clanes_Admin (CALCULADA, ver _getClanesAdminTexto()) se corre un
  puesto a la derecha, de 21 a 22.
FASE 6 — SEGURIDAD (15-sep-2026, pedido del usuario, hallazgo B-31 de
Plan_Fases.md): se agrega Clave_Hash, 23 → 24 columnas totales. A
diferencia del salto de 21 a 23 (25-ago-2026), este agregado es 100%
NO DESTRUCTIVO: escribir el header en la celda 24 no toca ninguna
columna existente ni sus datos, así que una hoja Administradores YA
EXISTENTE (23 columnas) queda al día en la siguiente corrida de setup
sin necesitar ninguna migración manual (no hace falta un
migrarAdministradoresAgregarClaveHash() aparte, a diferencia de la
migración 21→23 que sí requirió una función manual porque el layout
completo había cambiado de orden).
```

#### 02B055 — líneas 1053-1056 (comentario)

```text
Clave (col 23): contraseña de login web EN TEXTO PLANO, autogenerada
por Celular (ver nota FASE 5 más arriba). Sigue siendo el único
canal por el que un admin nuevo conoce su propia contraseña -- NO
borrar ni vaciar a mano, ver docblock de Clave_Hash abajo.
```

#### 02B056 — líneas 1058-1065 (comentario)

```text
Clave_Hash (col 24): NUEVO (15-sep-2026). Hash SHA-256 de la Clave
(con pimienta + Tag como sal, ver _hashClaveAdmin(), 37_Web_API.gs),
completado SOLO por _webAuthLogin() en el primer login exitoso de
cada Celular tras este cambio -- nunca por sincronizarAdministradores().
Mientras un Celular no tenga Clave_Hash, el login sigue validando
contra Clave en texto plano (columna 23) como hasta ahora; en cuanto
Clave_Hash existe, pasa a ser la ÚNICA fuente de verdad para ese
Celular. No editar a mano.
```

#### 02B057 — líneas 1068-1076 (comentario)

```text
Siempre actualizar fila 1 (13/07/2026, reorden Estado/Admin/Vetado/Razón
antes de Vigencia/Inactividad(d)/Alerta; 25-ago-2026, se agregan
Funciones/Clave): igual que _setupDirectorio()/_setupInactivos(), para
que una hoja Administradores YA EXISTENTE (con los headers en el orden
viejo, 21 cols) también quede al día en la próxima corrida de setup,
sin depender de que la hoja esté vacía. Los DATOS de cada fila los
reconstruye por separado sincronizarAdministradores() (ya arma cada
campo por nombre vía AC, no por copia posicional), así que esto solo
corrige la fila de encabezados.
```


### Ubicación: `_setupMensajes`

#### 02B058 — líneas 1089-1096 (comentario)

```text
FIX (28-sep-2026, pedido del usuario -- "en la hoja Mensajes se borro el encabezado de la
columna O, la de los mensajes"): CAUSA. Antes la fila de encabezados solo se escribia si la
hoja estaba vacia. Cuando se agrego la columna Rango (13), generarTodosMensajes() paso a
escribir 15 columnas (Rango=13, Tipo=14, Contenido=15, ver MC en 30_Mensajes.gs), pero una
hoja YA EXISTENTE conservo sus 14 encabezados viejos: "Tipo" quedo sobre Rango, "Contenido"
sobre Tipo y la columna O (los mensajes) sin encabezado. Ahora la fila 1 se reescribe siempre
(mismo criterio que Administradores/Pendientes/Directorio). NO se inserta ninguna columna: los
datos ya se escriben en las 15 posiciones y generarTodosMensajes() los regenera completos.
```

#### 02B059 — líneas 1104-1123 (docblock)

```text
_aplicarHeaderDosFilas(sh, columnas)
FIX (08-sep-2026, pedido usuario — layout confirmado por PDF de la hoja
real): helper genérico para armar un encabezado de 2 FILAS FUSIONADAS,
usado por _setupTLista()/_setupSLista() para las columnas Min_T/Min_S,
Ataques y Torneos, que ahora traen un valor diferenciado por clan
(C1-C4) en vez de una sola celda. La fila 1 lleva el rótulo (de grupo,
fusionado horizontalmente sobre sus subcolumnas, o simple, fusionado
VERTICALMENTE con la fila 2 si la columna no tiene subcolumnas); la
fila 2 lleva "C1"/"C2"/"C3"/"C4" debajo de cada grupo, vacía en las
columnas simples (ya fusionadas con la fila 1).

@param {Sheet} sh
@param {Array<string|{label:string, subs:string[]}>} columnas Una
  entrada por columna final: un string para columna simple (label única,
  ocupa 1 columna), o {label, subs} para un grupo (label ocupa
  subs.length columnas en la fila 1, subs.length va en la fila 2).
@returns {number} Total de columnas escritas (para usar como numCols
  en el resto del setup).
```


### Ubicación: `_aplicarHeaderDosFilas`

#### 02B060 — líneas 1147-1157 (comentario)

```text
FASE 2 (25-sep-2026, rediseño T_Lista): rompe CUALQUIER merge existente
en las 2 filas de encabezado, en todo el ancho actual de la hoja (no
solo `totalCols`, por si el layout anterior era más angosto o más
ancho) -- necesario para poder reejecutar este helper sobre una hoja
YA CREADA cuando el ancho de un grupo cambia entre una corrida y la
siguiente (p. ej. _setupTLista(): "Min_T" pasó de columnas 15-18 a
27-30). Sin esto, Sheets tira "Range fully or partially in a merged
cell" al intentar fusionar sobre un merge previo que ya no coincide.
NO PROBADO contra una hoja real (sin acceso a Apps Script desde acá) --
falta que el usuario confirme al reejecutar _setupTLista() sobre la
hoja real con datos.
```

#### 02B061 — líneas 1170-1172 (comentario)

```text
Estilo: mismo criterio visual que applyHeaderStyle() (04_Formato_Comun.gs),
pero aplicado a las 2 filas y con 2 filas congeladas en vez de 1 --
applyHeaderStyle() no se reutiliza acá porque fuerza setFrozenRows(1).
```

#### 02B062 — líneas 1185-1212 (docblock)

```text
_aplicarHeaderTresFilas(sh, columnas)
NUEVO (13-sep-2026, pedido del usuario -- CR_Lista): helper genérico para
un encabezado de 3 FILAS FUSIONADAS, usado por _setupCRLista() más abajo.
Se necesita un nivel extra respecto de _aplicarHeaderDosFilas() (justo
arriba) porque en CR_Lista los grupos "Min_CR" y "Ataques" discriminan
por CLAN (C1-C4) Y por ROL (Miembro/Veterano/Colider) al mismo tiempo --
dos niveles de agrupación en vez de uno.

Cada entrada de `columnas` es una de estas dos formas:
  - Bloque SIMPLE: { label, headers } -- el label ocupa TODO el ancho de
    `headers` fusionado horizontalmente en la fila 1 Y fusionado
    verticalmente con la fila 2 (una sola celda combinada de 2x N), y la
    fila 3 lleva los encabezados reales (uno por elemento de `headers`).
    Ej.: "Planificación, registro y modificación de cambio de rango" con
    headers = ['N°','Temporada',...] u "Otros requisitos" con
    headers = ['Barcos','Miembro activo',...].
  - Bloque de 2 NIVELES: { label, grupos } -- el label ocupa TODO el
    ancho del bloque en la fila 1 (fusionado horizontalmente, SIN fusión
    vertical con la fila 2); `grupos` es un array de {sub, subs} donde
    cada `sub` (ej. "Miembro") ocupa subs.length columnas fusionadas
    horizontalmente en la fila 2, y `subs` (ej. ['C1','C2','C3','C4']) va
    tal cual en la fila 3. Ej.: "Min_CR" / "Ataques".

@param {Sheet} sh
@param {Array<{label:string, headers:string[]}|{label:string, grupos:Array<{sub:string, subs:string[]}>}>} columnas
@returns {number} Total de columnas escritas.
```


### Ubicación: `_aplicarHeaderTresFilas`

#### 02B063 — líneas 1267-1269 (comentario)

```text
Mismo criterio visual que _aplicarHeaderDosFilas(), pero sobre 3 filas
y con 3 filas congeladas (acá el filtro va en la fila 3 -- ver
_aplicarFiltroFila3() más abajo en este archivo).
```

#### 02B064 — líneas 1282-1305 (docblock)

```text
_aplicarFiltroFila2(sh, nombreHoja)
FIX (09-sep-2026, pedido usuario — Consolidado_Cambios_Pendientes_
Torneos_Sorteos.md, secciones 4-5: "El filtro debe estar en la segunda
fila... No debe estar en la fila 1"): helper genérico para crear el
filtro nativo (botón de embudo) empezando en la FILA 2 -- la fila que
lleva los encabezados reales en T_Lista/S_Lista (fila 1 es solo la
agrupación combinada: "Planificación...", "Min_T"/"Min_S", "Ataques",
"Torneos", "Otros requisitos"). A diferencia de Control/Control_2/Nuevos/
T_Control (encabezado real en fila 3, ver _repararMergesFiltroControl(),
04_Formato_Comun.gs), acá NO hace falta ninguna reparación de merges
previa: _aplicarHeaderDosFilas() (justo arriba) solo combina
HORIZONTALMENTE dentro de la fila 1 -- nunca combina verticalmente fila
1 con fila 2 -- así que ningún merge cruza el límite superior del rango
del filtro y createFilter() nunca falla por ese motivo.

Se reusa tal cual desde _setupTLista()/_setupSLista() (este archivo) y
desde _restaurarFiltros() (04_Formato_Comun.gs, llamada en cada
runAll()/runUpdate() para que una hoja que creció de filas no pierda el
botón de filtro).

@param {Sheet} sh
@param {string} nombreHoja Solo para el log.
```


### Ubicación: `_aplicarFiltroFila2`

#### 02B065 — líneas 1319-1330 (docblock)

```text
_aplicarFiltroFila3(sh, nombreHoja)
NUEVO (13-sep-2026, pedido del usuario -- CR_Lista): mismo criterio que
_aplicarFiltroFila2() justo arriba, pero para hojas con encabezado de 3
FILAS FUSIONADAS (ver _aplicarHeaderTresFilas(), justo arriba en este
archivo) -- ahí el encabezado real vive en la fila 3, así que el filtro
nativo (botón de embudo) también tiene que arrancar en la fila 3, y los
datos arrancan en la fila 4.

@param {Sheet} sh
@param {string} nombreHoja Solo para el log.
```


### Ubicación: `_aplicarFiltroFila3`

#### 02B066 — líneas 1344-1430 (docblock)

```text
_setupTLista(ss)
Encabezados completos de T_Lista (ver TL en 26_Torneos_Core.gs): N°,
Temporada, Fecha, ID, Tag_Tor, Tag_Tor_2, Contraseña, Organizador,
Tag_org, Clan, ClanTag, Premios, Link_app, Link_json. El llenado
automático de la mayoría de estas columnas (salvo N°, Link_app y
Premios, que se cargan a mano o desde el panel) lo hace
procesarTListaNuevasFilas() (26_Torneos_Core.gs), no este setup.

FASE 23 (30-ago-2026, pedido del usuario) — Reordenamiento de columnas +
columna nueva Tag_Tor_2:
  Antes:  N°, Fecha, ID, Tag_Tor, Contraseña, Temporada, Organizador,
          Tag_org, Clan, ClanTag, Link_app, Link_json.
  Ahora:  N°, Temporada, Fecha, ID, Tag_Tor, Tag_Tor_2, Contraseña,
          Organizador, Tag_org, Clan, ClanTag, Premios, Link_app, Link_json.
Tag_Tor_2 es de EDICIÓN MANUAL ÚNICAMENTE (ningún código del proyecto la
escribe): sirve para marcar que un torneo de T_Lista es la CONTINUACIÓN
de otro torneo preexistente (caso real que motivó esto: el admin creó
por error un torneo de solo media hora y tuvo que abrir uno nuevo para
completarlo). Si Tag_Tor_2 de una fila coincide con el Tag_Tor de otra
fila ya existente, esa fila se trata como continuación del torneo dueño
de ese Tag_Tor -- ver _resolverGruposContinuacionTorneos() en
26_Torneos_Core.gs, que fusiona Victorias y recalcula Puesto entre todos
los torneos de un mismo grupo (T_Control, Ganadores del torneo, y la API
web). El torneo de continuación sigue generando su propio ID y sus
propias filas en T_Asistencia con normalidad; lo único que cambia es que
no abre columna propia en T_Control. Este mecanismo queda disponible
para cualquier torneo futuro que necesite dividirse en más de una parte,
sin volver a tocar código.

FIX (05-sep-2026, pedido usuario — "Planificar torneo" + premios):
columna nueva Premios. Guarda los premios del torneo como texto,
separados por comas (ej. "Pass Royale, S/ 20, Skin legendaria"), armado
desde el editor de premios del panel web (ver
_planificarTorneoDesdeBot()/_registrarTorneoDesdeBot() en este mismo
archivo y _webAdminTorneoPlanificarGuardar() en 37_Web_API.gs). Es de
carga manual o vía el panel — ningún proceso automático la sobrescribe.

FIX (08-sep-2026, pedido usuario — layout confirmado por PDF de la hoja
real, "Planificación, registro y modificación de torneos"): Min_T y
Ataques dejaron de ser una columna única -- son AHORA un valor
diferenciado por clan (C1 = clan principal .. C4 = Mini乂Ternas™, mismo
orden que CFG.TERNA_TAGS y la Hoja Clan). El encabezado pasa a ocupar 2
FILAS FUSIONADAS: fila 1 = rótulo de cada columna (fusionado
verticalmente con la fila 2 para las columnas simples, o fusionado
horizontalmente sobre C1-C4 para Min_T/Ataques); fila 2 = "C1"/"C2"/
"C3"/"C4" debajo de cada grupo -- ver _aplicarHeaderDosFilas() justo
arriba. Como consecuencia, LOS DATOS ahora arrancan en la FILA 3 (antes
fila 2) -- ver TL/TL_TOTAL_COLS/TL_MIN_T_COLS/TL_ATAQUES_COLS
(26_Torneos_Core.gs) y las notas de "PENDIENTE" ahí sobre qué funciones
todavía no se actualizaron a ese nuevo offset de fila.

FIX (09-sep-2026, pedido usuario — Consolidado_Cambios_Pendientes_
Torneos_Sorteos.md, sección 4: estructura exacta A:AC confirmada por el
PDF más reciente "Base - T_Lista.pdf"): la hoja pasa de 26 a 29 columnas
(A:AC) y el encabezado de fila 1 deja de tener columnas "sueltas"
fusionadas verticalmente con la fila 2 -- TODAS las columnas quedan
agrupadas bajo uno de 4 rótulos combinados HORIZONTALMENTE en la fila 1:
  A1:N1   "Planificación, registro y modificación de torneos"
  O1:R1   "Min_T"       (fila 2: C1, C2, C3, C4)
  S1:V1   "Ataques"     (fila 2: C1, C2, C3, C4)
  W1:AC1  "Otros requisitos"
Se agregan 3 columnas nuevas confirmadas por el PDF (no inventadas):
Semanas (C), Hora (E) y WhatsApp (Y) -- ninguna existía antes en la
hoja. El filtro nativo pasa a vivir en la FILA 2 (nunca en la fila 1,
ver _aplicarFiltroFila2() más arriba en este archivo); los datos siguen
arrancando en la fila 3, sin cambios respecto del fix anterior.

NO se modifica en este pase: ningún consumidor de TL (lectura/escritura
de procesarTListaNuevasFilas(), CSV, etc.) -- ver el bloque "PENDIENTE"
en el docblock de TL (26_Torneos_Core.gs). Este pase cubre únicamente la
ESTRUCTURA de la hoja (encabezados, merges, filtro, dropdowns).

FIX (12-sep-2026, pedido del usuario -- requisito nuevo "Barcos",
confirmado por captura real de la hoja): la hoja pasa de 29 a 30
columnas (A:AD). El grupo "Otros requisitos" (antes W1:AC1) pasa a
W1:AD1, con Barcos como PRIMER sub-rótulo (antes de Miembro activo) --
ver el array `columnas` de esta misma función, más abajo, y el objeto TL
(26_Torneos_Core.gs) para el índice exacto (TL.BARCOS). Semántica: tope
MÁXIMO sobre el PROMEDIO de ataques a barcos en las semanas
seleccionadas (columna Semanas) -- 0 configurado significa que ningún
ataque a barcos está permitido (barcos > 0 ya descalifica). Es una sola
columna para los 4 clanes, igual que Miembro activo/Reacción/WhatsApp.
Este pase solo agrega la ESTRUCTURA (columna) + la lectura en
_getConfigMasRecienteCategoria() (26_Torneos_Core.gs); la lógica de
calificación/descalificación en sí queda para una fase posterior.
```


### Ubicación: `_setupTLista`

#### 02B067 — líneas 1433-1457 (comentario)

```text
FASE 2 (25-sep-2026, rediseño T_Lista -- ver docblock del objeto TL en
26_Torneos_Core.gs, que es la fuente de verdad del mapeo de columnas):
la hoja pasa de 30 a 43 columnas (A:AQ). Corresponde 1 a 1 con el
objeto TL -- cualquier cambio acá tiene que reflejarse también allá, y
viceversa.

Columnas NUEVAS agregadas en este pase, todavía sin dato ni lógica
detrás (llegan vacías hasta que cada fase futura las llene -- ver TL,
26_Torneos_Core.gs, para el detalle fase por fase): Creación, Nombre,
Tipo, Nivel_tope, Participantes, Capacidad, Modo_ID, Modo, Preparación,
Duración, Nom_Multi_Org, Link_json_2, Descripción.

PENDIENTE DE CONFIRMAR: el grupo "Otros requisitos" (última columna
fusionada de abajo) ya NO contiene solo requisitos -- Estado se movió
al primer grupo (junto a Premios) y este grupo ahora suma Link_app/
Link_json/Link_json_2/Descripción/Comentario, que nunca fueron
"requisitos" tampoco (ya venían ahí desde antes de esta fase). Se dejó
el mismo rótulo de grupo por no inventar uno nuevo sin confirmar --
avisar si se prefiere partirlo en más de un grupo o renombrarlo.

FASE 9 (25-sep-2026, plan T_Lista -- ver docblock "PLAN EN CURSO" en
26_Torneos_Core.gs): la hoja pasa de 43 a 44 columnas (A:AR). Columna
nueva Organizador_Fuente, agregada al final del grupo "Otros
requisitos", junto a Comentario -- ver TL.ORGANIZADOR_FUENTE
(26_Torneos_Core.gs) para el detalle de qué la llena y cuándo.
```

#### 02B068 — líneas 1469-1496 (comentario)

```text
FIX (12-sep-2026, pedido del usuario -- requisito nuevo "Barcos"):
columna nueva, agregada como PRIMER sub-rótulo del grupo "Otros
requisitos" (antes de Miembro activo), confirmada por el PDF/
captura real de la hoja. A diferencia de Ataques (mínimo exigido:
0 = sin requisito, cualquier valor > 0 exige al menos esa
cantidad), Barcos es un TOPE MÁXIMO sobre el PROMEDIO de ataques a
barcos en las semanas seleccionadas (ver columna Semanas): un
participante que supere ese promedio se descalifica. Si el valor
configurado es 0, el óptimo es no atacar NINGÚN barco (barcos > 0
ya descalifica, no hace falta que sea "mayor al tope"). Es UNA
SOLA columna para los 4 clanes (no C1-C4, igual que Miembro
activo/Reacción/WhatsApp) -- ver TL.BARCOS (26_Torneos_Core.gs).
Este pase solo agrega la ESTRUCTURA (columna + lectura en
_getConfigMasRecienteCategoria()); la lógica de calificación/
descalificación en sí queda para una fase posterior.

FASE 2 (25-sep-2026): Estado SALIÓ de este grupo (ahora vive en
el primer grupo, junto a Premios -- ver arriba) y se agregaron acá
Link_json_2 y Descripción (columnas nuevas, ver TL,
26_Torneos_Core.gs).

FASE 9 (25-sep-2026, plan T_Lista -- ver docblock "PLAN EN CURSO"
en 26_Torneos_Core.gs): columna nueva Organizador_Fuente, al
final, junto a Comentario -- 44 columnas en total (A:AR). La
llena procesarTListaNuevasFilas() (26_Torneos_Core.gs) con 'API'
o 'Manual' según cómo se resolvió Organizador para ese torneo;
ver TL.ORGANIZADOR_FUENTE ahí para el detalle completo. Ningún
cambio en admin.html todavía (llega recién en la Fase 11).
```

#### 02B069 — líneas 1501-1510 (comentario)

```text
FIX (31/08/2026, pedido del usuario — sugerencia #1 de la lista de
mejoras, caso real que la motivó: un ID escrito a mano en una fila
nueva hizo que procesarTListaNuevasFilas() (26_Torneos_Core.gs) la
tratara como "torneo ya procesado" y se saltara el llenado automático
de Tag_Tor/Contraseña/Organizador/etc.). Nota informativa en el
encabezado de ID (no bloquea la edición — para eso ya existe
_protegerSoloAdvertencia() más abajo, que avisa igual en TODA la
hoja): aparece al pasar el mouse por la celda de esa columna en fila 2
(FIX 09-sep-2026: antes era fila 1 -- con el header nuevo, el rótulo
real de cada columna vive en la fila 2, no en la 1).
```

#### 02B070 — líneas 1513-1517 (comentario)

```text
Desplegable fijo de Estado ("Planificado"/"Realizado") — ver
_aplicarDropdownEstadoTLista() (26_Torneos_Core.gs), que también se
reaplica en cada restauración desde CSV y en cada corrida de
procesarTListaNuevasFilas(); acá alcanza con dejarlo puesto para
cuando la hoja recién se crea.
```

#### 02B071 — líneas 1519-1525 (comentario)

```text
FIX (08-sep-2026, corrección de desincronización): faltaban estas 2
llamadas -- Miembro activo y Reacción ya tienen desplegable fijo
("Sí"/"No") en _aplicarDropdownMiembroActivoTLista()/
_aplicarDropdownReaccionTLista() (26_Torneos_Core.gs) y ya se
reaplican en importarTListaDesdeCSV() y procesarTListaNuevasFilas(),
pero no se dejaban puestas al crear la hoja desde cero. Mismo patrón
que _aplicarDropdownEstadoTLista() justo arriba.
```

#### 02B072 — líneas 1528-1534 (comentario)

```text
FIX (12-sep-2026, pedido del usuario -- consolidado, sección 1 cierre
de PASO 1 y sección 8.1/8.2 punto 1): faltaba esta llamada también --
WhatsApp ya tiene desplegable fijo ("Sí"/"No") en
_aplicarDropdownWhatsappTLista() (26_Torneos_Core.gs) y ya se reaplica
en importarTListaDesdeCSV() y procesarTListaNuevasFilas(), pero no se
dejaba puesto al crear la hoja desde cero. Mismo patrón que Miembro
activo/Reacción justo arriba.
```

#### 02B073 — líneas 1542-1628 (docblock)

```text
_setupSLista(ss)
FASE (07-sep-2026, pedido del usuario): S_Lista es la hoja análoga a
T_Lista pero para SORTEOS en vez de torneos — ver el objeto SL
(26_Torneos_Core.gs) para los índices de columna. A diferencia de
T_Lista, NINGÚN proceso automático la llena: es 100% de carga manual
(no hay Tag de sorteo — es innecesario, es algo interno — ni
generación automática de ID). El código solo se encarga de: reconocer
sus columnas (SL), respaldarla en CSV (ver respaldarIndiceYProtegidasCSV(),
05_Backup_CSV.gs) y poder reconstruirla desde ese CSV si se demuele el
spreadsheet (ver importarSListaDesdeCSV(), 26_Torneos_Core.gs).

Encabezados: N°, Temporada, Fecha, ID, ID_2, Organizador, Tag_org, Clan,
ClanTag, Premios, Min_S, Ataques, Torneos, Miembro activo, Reacción,
Estado, Comentario. Min_S es el análogo de Min_T (mínimo de fame para
ser participante calificado), pero para sorteos. ID_2 (análogo de
Tag_Tor_2 en T_Lista) marca que un sorteo es CONTINUACIÓN de otro: tiene
desplegable con los valores ya usados en la columna ID (ver
_aplicarDropdownId2SLista(), 26_Torneos_Core.gs). Estado tiene el mismo
desplegable fijo que T_Lista ("Planificado"/"Realizado", ver
_aplicarDropdownEstadoSLista()). Reacción se deja igual que en T_Lista:
no produce ninguna acción todavía, sin importar si dice "Sí" o "No".

FIX (08-sep-2026, pedido usuario — layout confirmado por PDF de la hoja
real, "Planificación, registro y modificación de Sorteos"): Min_S,
Ataques y Torneos dejaron de ser una columna única -- son AHORA un
valor diferenciado por clan (C1-C4, mismo orden que CFG.TERNA_TAGS y la
Hoja Clan) -- mismo cambio que TL/T_Lista, ver el docblock de
_setupTLista() justo arriba para el detalle completo. El encabezado
pasa a ocupar 2 filas fusionadas (ver _aplicarHeaderDosFilas()) y los
DATOS ahora arrancan en la FILA 3 (antes fila 2).

FIX (08-sep-2026, corrección de desincronización): faltaban las
llamadas a _aplicarDropdownMiembroActivoSLista()/
_aplicarDropdownReaccionSLista() (26_Torneos_Core.gs) -- ya existían y
ya se reaplicaban en importarSListaDesdeCSV(), pero no se dejaban
puestas al crear la hoja desde cero.

FIX (09-sep-2026, pedido usuario — Consolidado_Cambios_Pendientes_
Torneos_Sorteos.md, sección 5: estructura exacta A:AC confirmada por el
PDF más reciente "Base - S_Lista.pdf"): la hoja pasa de 26 a 29 columnas
(A:AC), con el mismo criterio de header que T_Lista (ver FIX 09-sep-2026
en el docblock de _setupTLista() justo arriba): TODAS las columnas
quedan agrupadas bajo uno de 5 rótulos combinados HORIZONTALMENTE en la
fila 1 (ninguna columna suelta fusionada verticalmente con la fila 2):
  A1:K1   "Planificación, registro y modificación de Sorteos"
  L1:P1   "Min_S"   (fila 2: C1, C2, C3, C4, Delta)
  Q1:T1   "Ataques" (fila 2: C1, C2, C3, C4)
  U1:X1   "Torneos" (fila 2: C1, C2, C3, C4)
  Y1:AC1  "Otros requisitos"
Se agregan Hora (D) y WhatsApp (AA), confirmadas por el PDF (mismo
criterio que T_Lista), y Delta (P) dentro del grupo Min_S -- el PDF la
muestra explícitamente en la fila 2 de ese grupo; no se elimina ni se
confunde con las 4 columnas C1-C4. El filtro nativo pasa a vivir en la
FILA 2 (nunca en la fila 1, ver _aplicarFiltroFila2(), más arriba en
este archivo); los datos siguen arrancando en la fila 3.

FIX (11-sep-2026, pedido usuario): columna nueva Semanas, agregada a la
derecha de Premios (dentro del mismo primer grupo -- la hoja pasa de 29
a 30 columnas, A1:L1 en vez de A1:K1). Indica qué semanas de guerra
evaluar para calificar a este sorteo, en formato
"Temporada_Semana,Temporada_Semana,..." (ej. "T4_S1,T4_S2,T4_S3") -- el
indicador de cada participante (trofeos/ataques/torneos) se promedia
entre esas semanas antes de compararlo contra Min_S/Ataques/Torneos. Es
texto libre, sin dropdown. Igual que el resto de este pase: acá solo se
cubre la ESTRUCTURA (encabezado + columna en SL); el consumidor real que
lea Semanas y calcule el promedio queda PENDIENTE (ver
_webSorteoCalificados(), 37_Web_API.gs, que hoy sigue usando solo el
indicador de la semana/temporada actual).

NO se modifica en este pase: ningún consumidor de SL -- ver el bloque
"PENDIENTE" en el docblock de TL (26_Torneos_Core.gs), que aplica igual
para SL. Este pase cubre únicamente la ESTRUCTURA de la hoja
(encabezados, merges, filtro, dropdowns).

FIX (12-sep-2026, pedido del usuario -- requisito nuevo "Barcos", mismo
agregado y misma semántica exacta que en _setupTLista() más arriba en
este archivo -- ver ese docblock para el detalle completo): la hoja
pasa de 30 a 31 columnas (A:AE). El grupo "Otros requisitos" (antes
Y1:AC1, 5 columnas) pasa a Y1:AD1 (6 columnas), con Barcos como PRIMER
sub-rótulo (antes de Miembro activo) -- ver el
array `columnas` de esta misma función, más abajo, y el objeto SL
(26_Torneos_Core.gs) para el índice exacto (SL.BARCOS). Este pase solo
agrega la ESTRUCTURA (columna) + la lectura en
_getConfigMasRecienteCategoria() (26_Torneos_Core.gs); la lógica de
calificación/descalificación en sí queda para una fase posterior.
```


### Ubicación: `_setupSLista`

#### 02B074 — líneas 1640-1644 (comentario)

```text
FIX (12-sep-2026, pedido del usuario -- requisito nuevo "Barcos"):
mismo agregado y mismo criterio exacto que en _setupTLista() justo
arriba en este archivo (ver ese docblock para el detalle completo
de la semántica de tope máximo/promedio). Una sola columna para
los 4 clanes -- ver SL.BARCOS (26_Torneos_Core.gs).
```

#### 02B075 — líneas 1650-1652 (comentario)

```text
Desplegables fijo/dinámico — ver docblocks de las 4 funciones
(26_Torneos_Core.gs). Se reaplican también en importarSListaDesdeCSV()
tras cada restauración desde CSV.
```

#### 02B076 — líneas 1657-1660 (comentario)

```text
FIX (12-sep-2026, pedido del usuario -- consolidado, sección 1 cierre
de PASO 1 y sección 8.1/8.2 punto 1): faltaba esta llamada también --
mismo criterio que Miembro activo/Reacción justo arriba, ver
_aplicarDropdownWhatsappSLista() (26_Torneos_Core.gs).
```

#### 02B077 — líneas 1668-1699 (docblock)

```text
_setupCRLista(ss)
NUEVO (13-sep-2026, pedido del usuario): CR_Lista es la hoja de
"Planificación, registro y modificación de cambio de rango" -- pensada
para REEMPLAZAR a T_Requisitos en sus categorías "Ascensos"/"Descensos"
(27_Torneos_Sorteos_Requisitos.gs). Este pase cubre ÚNICAMENTE la ESTRUCTURA de
la hoja (encabezados, merges, filtro, dropdown de Tipo) -- ni el ID
automático (prefijo "A"/"D" en vez de "T"), ni la mecánica real de
Min_CR (cómo discrimina por rango), ni el par Ascenso+Descenso por
corrida quedan implementados todavía; eso se define en una fase
posterior, sin volver a tocar la estructura de la hoja.

A diferencia de T_Lista/S_Lista (encabezado de 2 filas, ver
_aplicarHeaderDosFilas()), CR_Lista usa un encabezado de 3 FILAS
FUSIONADAS -- ver _aplicarHeaderTresFilas() más arriba en este archivo --
porque Min_CR y Ataques discriminan por CLAN (C1-C4) Y por ROL (Miembro/
Veterano/Colider) al mismo tiempo (2 niveles de agrupación en vez de 1).
Estructura exacta (confirmada por captura real de la hoja):
  A1:K2   "Planificación, registro y modificación de cambio de rango"
          (fusionado 2 filas; fila 3: N°, Temporada, Semanas, Fecha,
          Hora, ID, Organizador, Tag_org, Clan, ClanTag, Tipo)
  L1:W1   "Min_CR"   (fila 2: Miembro L1:O2, Veterano P1:S2, Colider
          T1:W2; fila 3: C1,C2,C3,C4 debajo de cada uno)
  X1:AI1  "Ataques"  (mismo criterio que Min_CR: Miembro X1:AA2,
          Veterano AB1:AE2, Colider AF1:AI2; fila 3: C1-C4)
  AJ1:AN2 "Otros requisitos" (fusionado 2 filas; fila 3: Barcos,
          Miembro activo, WhatsApp, Estado, Comentario)
El filtro nativo va en la FILA 3 (nunca en la 1 ni en la 2, ver
_aplicarFiltroFila3() más arriba en este archivo); los datos arrancan en
la fila 4. Tipo tiene desplegable fijo ("Ascenso"/"Descenso") -- ver
_aplicarDropdownTipoCRLista() justo abajo.
```


### Ubicación: `_setupCRLista`

#### 02B078 — líneas 1729-1740 (docblock)

```text
_aplicarDropdownTipoCRLista(ss)
NUEVO (13-sep-2026, pedido del usuario): desplegable fijo ("Ascenso"/
"Descenso") para la columna Tipo de CR_Lista (fila 3 del encabezado,
dentro del primer bloque -- ver _setupCRLista() justo arriba). Cada
corrida de cambio de rango registra siempre un par de filas, una de cada
tipo. Mismo patrón de reaplicación por rango completo de columna que
_aplicarDropdownEstadoTLista()/_aplicarDropdownEstadoSLista()
(26_Torneos_Core.gs): se vuelve a llamar sobre TODA la columna cada vez
que se corre el setup, así una fila nueva agregada a mano hereda el
desplegable sin necesidad de copiar/pegar validación de datos.
```


### Ubicación: `_aplicarDropdownTipoCRLista`

#### 02B079 — líneas 1758-1773 (docblock)

```text
_aplicarDropdownEstadoCRLista(ss)
NUEVO (16-sep-2026, pedido del usuario): desplegable fijo ("Planificado"/
"Realizado") para la columna Estado de CR_Lista (fila 3 del encabezado,
dentro del bloque "Otros requisitos": Barcos, Miembro activo, WhatsApp,
Estado, Comentario -- ver _setupCRLista() justo arriba). Mismo criterio
EXACTO que _aplicarDropdownTipoCRLista() (misma función, mismo patrón de
reaplicación por rango completo de columna) y que
_aplicarDropdownEstadoTLista()/_aplicarDropdownEstadoSLista()
(26_Torneos_Core.gs): mismos dos valores ('Planificado', 'Realizado'), en
el mismo orden.
El formulario web de CR_Lista (admin.html) NUNCA manda `estado` --
siempre lo guarda como 'Planificado' al crear/editar una corrida (ver
leerOtrosCriteriosCR(), admin.html), así que este dropdown es la única
forma de pasar una corrida a 'Realizado': a mano, directo en la hoja.
```


### Ubicación: `_aplicarDropdownEstadoCRLista`

#### 02B080 — líneas 1791-1797 (docblock)

```text
_setupTAsistencia(ss)
Encabezados completos de T_Asistencia (ver TA en 26_Torneos_Core.gs): N°,
Fecha, ID, Temporada, Tag, Nombre, Nom_Multi, Préstamo, ClanTag, Clan,
Puesto, Victorias. Se llena automáticamente por torneo procesado en
T_Lista (ver _generarAsistenciaParaTorneo(), 26_Torneos_Core.gs).
```


### Ubicación: `_setupTAsistencia`

#### 02B081 — líneas 1808-1852 (docblock)

```text
_setupSAsistencia(ss)
NUEVO (09-sep-2026, pedido usuario): hoja análoga a T_Asistencia (ver
_setupTAsistencia() justo arriba) pero para SORTEOS -- ver el objeto SA
en 26_Torneos_Core.gs y CFG.SHEETS.S_ASISTENCIA/CFG.SORTEOS_RESULTADO_TIPOS
(01_Config_Global.gs). Encabezados (14 columnas): N°, Fecha, ID,
Temporada, Tag, Nombre, Nom_Multi, Préstamo, ClanTag, Clan (idénticas a
T_Asistencia), más 4 nuevas específicas de sorteos:
  Tickets   — columna agregada (11-sep-2026, pedido usuario). Celda
              numérica libre, sin dropdown. ACTUALIZADO (12-sep-2026,
              consolidado sección 1 punto 10): ya no es solo estructura
              vacía -- _registrarResolucionSorteo() (26_Torneos_Core.gs)
              la llena con el valor opcional que reciba (validado como
              número >= 0), y actualizarDocGanadoresSorteo()
              (28_Torneos_Docs.gs) la lee para volcarla en la columna
              "Victorias" del docx "Ganadores (sorteo)". Esta corrige un
              docblock anterior que seguía afirmando lo contrario.
  Premio    — se obtiene desde la web, o se ingresa manualmente si no
              viene de ahí. Sin dropdown (texto libre).
  Resultado — "Califica" / "No califica" (CFG.SORTEOS_RESULTADO_TIPOS).
              CON dropdown, aplicado acá.
  Razón     — por qué una fila no calificó, o qué criterio le faltó
              cumplir. RESUELTO (10-sep-2026, ver
              Consolidado_Cambios_Pendientes_Torneos_Sorteos.md sección
              2): 3 motivos fijos (CFG.SORTEOS_RAZON_TIPOS), CON dropdown,
              aplicado acá. El mismo dropdown se usa tanto para "No
              califica" como para el caso de un ganador de la ruleta
              descalificado después de salir sorteado (no es un sistema
              aparte).

A diferencia de T_Asistencia (que _generarAsistenciaParaTorneo(),
26_Torneos_Core.gs, llena automáticamente por cada torneo procesado en
T_Lista), esta función solo deja la ESTRUCTURA lista (encabezados +
dropdowns de Resultado y Razón) -- S_Asistencia no se llena en batch por
torneo/sorteo procesado, sino fila por fila, cada vez que se resuelve UN
ganador. ACTUALIZADO (12-sep-2026): eso ya no es trabajo pendiente --
`_registrarResolucionSorteo()` (26_Torneos_Core.gs), invocada desde
sorteo.html (`guardarResolucionGanador()`) vía
`_webAdminSorteoResolucionGuardar()` (37_Web_API.gs), ES el proceso real
que llena S_Asistencia; `actualizarDocGanadoresSorteo()`
(28_Torneos_Docs.gs) después vuelca esas filas en el docx "Ganadores
(sorteo)". Este párrafo describía un estado (09-sep-2026) anterior a que
ese flujo existiera; se corrige para no seguir afirmando que sigue
pendiente de construir.
```


### Ubicación: `_setupSAsistencia`

#### 02B082 — líneas 1860-1864 (comentario)

```text
Dropdown de Resultado (columna 13, SA.RESULTADO en 26_Torneos_Core.gs) --
pedido explícito del usuario. Se limita a las filas de datos (desde la
fila 2 hasta la última con contenido, o una tanda inicial de 200 si la
hoja está recién creada) para no dejar la validación pegada a toda la
columna sin límite.
```

#### 02B083 — líneas 1870-1874 (comentario)

```text
Razón (columna 14, SA.RAZON): dropdown RESUELTO (10-sep-2026, ver
Consolidado_Cambios_Pendientes_Torneos_Sorteos.md sección 2) --
3 motivos, uno por cada requisito de S_Lista que la persona no
cumplió (CFG.SORTEOS_RAZON_TIPOS, 01_Config_Global.gs). Mismo criterio
que el dropdown de Resultado: se limita a las filas de datos.
```

#### 02B084 — líneas 1888-1898 (docblock)

```text
_setupTControl(ss)
Deja solo los 7 encabezados fijos de la cuadrícula (N°, Tag, Nombre,
Nom_Multi, Préstamo, ClanTag, Clan) en la fila 3, igual que en el setup
original. El resto de la cuadrícula (supercategoría "Torneos", categorías
"T_"&Temporada, columnas de fecha por torneo, y los checks ☑ de
asistencia) se construye/reconstruye completa en cada corrida por
regenerarTControlSheet() (26_Torneos_Core.gs), igual que updateControlSheet()
hace con la hoja Control — este setup solo garantiza que la hoja y sus
encabezados fijos existan la primera vez.
```


### Ubicación: `_setupTControl`

#### 02B085 — líneas 1913-1915 (comentario)

```text
Filas 1 y 2 (supercategoría "Torneos" y categorías "T_"&Temporada) se
completan solo cuando existan torneos procesados — ver
regenerarTControlSheet() en 26_Torneos_Core.gs.
```

#### 02B086 — líneas 1921-1964 (docblock)

```text
_setupTResoluciones(ss)
FASE 24 (02-sep-2026, pedido del usuario — descalificaciones y
desempates de torneos, hoy imposibles de registrar porque el "ganador"
salía 100% calculado de T_Asistencia/T_Control sin ningún lugar donde
un admin pudiera dejar una decisión manual). Una fila por CUENTA
AFECTADA (no por torneo), para poder auditar cada caso por separado:

  IdTorneo         — Id de T_Lista, SIEMPRE anclado a la RAÍZ del grupo
                      de continuación si el torneo tiene alguna (mismo
                      criterio que T_Control, ver
                      _resolverGruposContinuacionTorneos(),
                      26_Torneos_Core.gs) — así una resolución cargada
                      sobre cualquier parte de un torneo dividido
                      aplica igual sin importar con qué ID se consulte.
  Tag              — cuenta afectada.
  Nombre           — informativo, se refresca solo desde el Directorio
                      cada vez que se guarda (nunca se edita a mano).
  Puesto_Original  — el puesto que le tocaba por Victorias crudas,
                      ANTES de esta resolución.
  Tipo_Resolucion  — una de las 3 categorías de
                      CFG.TORNEOS_RESOLUCION_TIPOS: 'Descalificado',
                      'Empate - Reparto de premio' o
                      'Empate - Partida de desempate'.
  Puesto_Final     — el puesto que efectivamente cobra premio tras
                      resolver (solo aplica a "Empate - Partida de
                      desempate"; vacío en los otros 2 casos).
  Motivo           — texto libre: la razón del castigo o el detalle del
                      desempate. Obligatorio — el resultado final nunca
                      debe quedar sin explicación visible.
  Registrado_Por   — admin logueado que hizo la entrada (identidad de
                      sesión, ver _webAuthObtenerAdmin(), 37_Web_API.gs).
  Fecha_Registro   — timestamp de cuándo se guardó/actualizó la fila.

Se escribe y se actualiza ÚNICAMENTE vía _registrarResolucionTorneo()
(26_Torneos_Core.gs, invocada desde el panel admin por
webAdminTorneoResolucionGuardar) — nunca a mano, para que Nombre y
Puesto_Original siempre queden consistentes con T_Asistencia. Se lee
desde _aplicarResolucionesTorneo() (mismo archivo), el único punto que
alimenta a los 3 consumidores del resultado de un torneo
(actualizarDocGanadoresTorneo(), _webGanadoresTorneoMasReciente() y
_webHistorialTorneos()), para que el Doc de Ganadores y la web SIEMPRE
coincidan.
```


### Ubicación: `_setupTResoluciones`

#### 02B087 — líneas 1977-2003 (docblock)

```text
_setupConflictos(ss)
FASE 6 (punto 6 del documento — Detección de infiltrados/sabotaje).
Hoja MANUAL de clanes en conflicto conocido, editada directo por un
admin no técnico (columnas Tag, Nombre, Motivo — ver CFC/CFC_TOTAL_COLS
en 15_DeteccionInfiltrados.gs, que es quien la lee vía
_getClanesConflictoManual()).

DECISIÓN DE ALCANCE resuelta (03-sep-2026, confirmada por el usuario):
esta hoja reemplaza a CFG.CLANES_CONFLICTO_MANUAL (arreglo de config en
01_Config_Global.gs, ya retirado) — el usuario prefirió que el ingreso
de tags de clanes en conflicto sea editable en Sheets, no en código.

  Tag      — Tag del clan en conflicto, con o sin '#' (se normaliza al
             leer, ver _getClanesConflictoManual()). Obligatorio: una
             fila sin Tag se ignora.
  Nombre   — solo informativo, para que el admin identifique el clan de
             un vistazo. NO se usa para matchear (el match es por Tag).
  Motivo   — texto libre: por qué se agregó este clan a la lista de
             conflicto (ej. "exmiembros vetados fundaron este clan").

A diferencia de otras hojas "tipo tabla" del proyecto (T_Resoluciones,
Alertas_HistorialGuerra), esta hoja se llena y edita 100% a mano por el
admin — por eso NO se le aplica _protegerSoloAdvertencia() (esa
protección está pensada para hojas que el sistema recalcula solas, con
el aviso "esto normalmente no se edita a mano"; acá es justo al revés).
```


### Ubicación: `_setupConflictos`

#### 02B088 — líneas 2009-2013 (comentario)

```text
FIX (04-sep-2026): usaba CC.NOMBRE/CC.MOTIVO (variable global de la hoja
Clan, 10_ClanSheet.gs — CC.NOMBRE=3, y CC no tiene ninguna propiedad
MOTIVO) en vez de las columnas propias de Conflictos. Ver el mismo FIX
en 15_DeteccionInfiltrados.gs (renombrado CC -> CFC) para el detalle
completo de la colisión de nombres.
```

#### 02B089 — líneas 2022-2056 (docblock)

```text
_setupGrupoVerificado(ss)
NUEVO (14-sep-2026, pedido del usuario -- cierre del CONTRATO PENDIENTE
"Marcar visto en el grupo" dejado en admin.html el 08-sep-2026, ver
docblock junto a _grupoVerificadoTags ahí): una fila por Tag confirmado
a ojo por un admin como "sí está en el grupo de WhatsApp de ganadores".
A diferencia de T_Resoluciones (una fila por CUENTA AFECTADA en un
torneo puntual), esta confirmación es GLOBAL por Tag, no por torneo: se
asume que el grupo de WhatsApp de ganadores es uno solo y permanente, así
que una vez confirmado un Tag ahí queda verificado para cualquier
torneo/sorteo futuro también (evita pedirle al admin que reconfirme lo
mismo cada vez que ese jugador vuelve a ganar). Si en el futuro hiciera
falta poder "des-verificar" a alguien (ej. salió del grupo), se agrega
ahí mismo un botón que borre la fila -- no hace falta un estado
Sí/No en la columna, la presencia de la fila YA ES la confirmación
(mismo criterio simple que usa Vetados/Conflictos: estar en la hoja =
aplica).

  Tag              — Tag del ganador confirmado (clave, con o sin '#',
                      se normaliza al leer con cleanTag()).
  Nombre           — informativo, para poder auditar la hoja a simple
                      vista sin tener que cruzar contra Directorio.
  Fecha_Registro   — timestamp de cuándo se confirmó.
  Registrado_Por   — admin logueado que confirmó (mismo criterio que
                      Registrado_Por de T_Resoluciones, ver
                      _webAuthObtenerAdmin(), 37_Web_API.gs).

Se escribe ÚNICAMENTE vía _marcarVistoEnGrupoVerificado() (24_Torneos_
Core.gs, invocada desde el panel admin por webAdminMarcarVistoEnGrupo) —
nunca a mano, por eso lleva _protegerSoloAdvertencia() como T_Resoluciones
(a diferencia de Conflictos, que es 100% manual). Se lee con
_getTagsVistosEnGrupo() (mismo archivo), que arma un Set en memoria para
que _webAdminGanadoresTorneoDetalle() (37_Web_API.gs) pueda marcar
`verificadoGrupo:true` sin una consulta por participante.
```


---


# Archivo 03_Indice_Sheet.gs

Todo lo relativo a la hoja Índice (orden, visibilidad y edición de las pestañas): `importarIndiceDesdeCSV()`, `actualizarIndiceSheet()`, `_reordenarYOcultarHojasSegunIndice()` y helpers. Los IDs de bloque llevan prefijo `03`.


## Índice de bloques movidos

| ID | Líneas orig. | Ubicación | Resumen |
|---|---|---|---|
| 03B001 | 8-44 | `Cabecera del archivo` | importarIndiceDesdeCSV() |
| 03B002 | 67-71 | `importarIndiceDesdeCSV` | Red de seguridad: si la hoja todavía no tiene encabezado en la fila 1 |
| 03B003 | 86-100 | `importarIndiceDesdeCSV` | actualizarIndiceSheet() |
| 03B004 | 106-109 | `actualizarIndiceSheet` | Mapa de hojas reales por su sheetId (estable: NO cambia si se renombra |
| 03B005 | 121-132 | `actualizarIndiceSheet` | DIAGNÓSTICO TEMPORAL (12-ago-2026, pedido del usuario): "Visibilidad/ |
| 03B006 | 145-163 | `numFilas` | Corrección (30/07/2026): "se ha generado un montón de registros, |
| 03B007 | 197-201 | `numFilas` | DIAGNÓSTICO 2: lo que queda en hojasPorId en este punto son hojas |
| 03B008 | 211-214 | `numFilas` | Lo que queda en hojasPorId son hojas reales que no tenían fila en |
| 03B009 | 263-271 | `numFilas` | FIX (09-ago-2026, pedido del usuario): ocultar filas de hojas ya NO |
| 03B010 | 293-295 | `_setupIndice` | Se reescribe siempre (no solo si está vacía): así una hoja con |
| 03B011 | 302-317 | `_setupIndice` | _setupIndice(ss) |
| 03B012 | 318-325 | `_setupIndice` | _colIndiceFor(campo) |
| 03B013 | 334-346 | `_colIndiceFor` | _migrarOrdenColumnasIndiceSiHaceFalta(sh) |
| 03B014 | 389-396 | `_indiceTotalCols` | _aplicarFormatoCondicionalIndice(sh, numCols) |
| 03B015 | 431-435 | `_aplicarFormatoCondicionalIndice` | _colLetra(n) |
| 03B016 | 446-453 | `_colLetra` | _compararFilasIndice(a, b) |
| 03B017 | 483-493 | `_compararFilasIndice` | _reordenarYOcultarHojasSegunIndice() |

---

## Detalle (texto original, sin cambios)

Cada bloque se copió tal cual estaba en el `.gs` (sin los `//`). Los números de línea son los del archivo ANTES de la limpieza.


### Ubicación: `Cabecera del archivo`

#### 03B001 — líneas 8-44 (docblock)

```text
importarIndiceDesdeCSV()
Restaura la hoja Índice desde Backup_Índice.csv si está vacía (o casi
vacía) — para recuperar Visibilidad/Tipo/Edición personalizados tras un
Demoler + runAll() (Fase 17 del plan de cambios). Si la hoja YA tiene
filas, no hace nada (no pisa ediciones en curso ni el reordenamiento que
ya haga actualizarIndiceSheet()). Debe llamarse ANTES de
actualizarIndiceSheet() dentro de PASOS_RUNALL (ver 03_Indice_Sheet.gs).
La fusión real por columna ID (sheetId) la hace actualizarIndiceSheet()
más adelante; esta función solo necesita volcar el CSV de vuelta a la
hoja para que esa conciliación tenga algo de dónde partir.

FIX (13-ago-2026, pedido del usuario): Backup_Índice.csv trae una columna
extra "Fecha" (a la derecha de "Edición") que NO existe en la hoja
Índice real — existe únicamente en el CSV, justamente para que no se
pueda editar a mano desde la hoja (ver _respaldarIndiceCSV(),
05_Backup_CSV.gs).

FIX (18-sep-2026, pedido del usuario -- "se debe detectar la cantidad de
columnas de los csv para actualizarlas cuando se agrega algo en sheets" /
"todas las hojas y sus csv, no solo torneos"): antes esta función SOLO
sabía descartar la columna "Fecha" (única diferencia conocida en ese
momento entre el CSV y la hoja real) y para el resto asumía POSICIÓN
cruda -- si en el futuro se agrega una columna nueva a CFG.INDICE_COLUMNAS
(02_Setup_Hojas.gs), o si el orden cambia, un CSV viejo se habría
desalineado en silencio, mismo bug de fondo que T_Lista/Ascensos (ver
docblock de _mapaNombreAIdxDesdeHoja(), 05_Backup_CSV.gs, para el caso
real que lo expuso). Ahora se restaura por NOMBRE de columna, con los
mismos 3 helpers que ya usa el resto del proyecto
(_mapaNombreAIdxDesdeHoja()/_mapearIndicesCSVPorEncabezado()/
_reconstruirFilaCSVPorEncabezado(), 05_Backup_CSV.gs): el mapa
nombre->índice se lee del header REAL que _setupIndice() ya dejó en la
fila 1 de esta hoja (setupAllSheets() corre antes que este import dentro
de PASOS_RUNALL), así que cualquier columna nueva de INDICE_COLUMNAS ya
aparece ahí. La columna "Fecha" del CSV, al no tener match en el header
de la hoja, se ignora sola -- ya no hace falta el caso especial de antes.
```


### Ubicación: `importarIndiceDesdeCSV`

#### 03B002 — líneas 67-71 (comentario)

```text
Red de seguridad: si la hoja todavía no tiene encabezado en la fila 1
(caso anómalo -- este paso debería correr siempre DESPUÉS de
setupAllSheets()/_setupIndice() dentro de PASOS_RUNALL), se cae al
recorte posicional de antes de este fix (quitando "Fecha" si está
presente) en vez de perder todas las filas en silencio.
```

#### 03B003 — líneas 86-100 (docblock)

```text
actualizarIndiceSheet()
Mantiene la hoja Índice sincronizada con las hojas reales del documento:
 - Agrega una fila nueva (con valores por defecto) para cada hoja que
   exista en el documento y todavía no aparezca en Índice.
 - Marca Vigente="No" en las filas cuya hoja ya no existe (sin borrar
   la fila) y Vigente="Sí" si la hoja existe.
 - Reordena TODAS las filas según: Vigente > Visibilidad > Tipo > Edición >
   Nombre (ver _compararFilasIndice) y renumera la columna N°.
 - Aplica los desplegables de Vigente/Visibilidad/Tipo/Edición.
El orden de columnas (entre N° y Nombre) sale de CFG.INDICE_COLUMNAS, que
es el mismo orden en que están las columnas de referencia N..Q en Extra.
No toca el orden físico de las pestañas ni su visibilidad — de eso se
encarga _reordenarYOcultarHojasSegunIndice(), que se debe llamar después.
```


### Ubicación: `actualizarIndiceSheet`

#### 03B004 — líneas 106-109 (comentario)

```text
Mapa de hojas reales por su sheetId (estable: NO cambia si se renombra
la pestaña, a diferencia del nombre). Es la clave que usamos para
saber si una fila de Índice corresponde a una hoja que sigue existiendo,
incluso si le cambiaron el nombre.
```

#### 03B005 — líneas 121-132 (comentario)

```text
DIAGNÓSTICO TEMPORAL (12-ago-2026, pedido del usuario): "Visibilidad/
Tipo/Edición de Índice se pierden al Demoler + runAll(), aun ejecutando
runSyncCSV() completo antes". No se pudo confirmar la causa por análisis
estático del código, así que este bloque deja evidencia real en el
Registro de ejecución (Ver > Ejecuciones) la próxima vez que corra:
cuántas filas traía la hoja ANTES de reconciliar, y el detalle de cada
una (Nombre/ID leídos, si matcheó por ID directo, por Nombre de
respaldo, o si NO matcheó -> se marca huérfana y el nombre real
terminará re-creado con valores por defecto más abajo). Es SOLO
logging: no cambia ningún valor ni ningún comportamiento existente.
Se puede borrar este bloque (y el bloque DIAGNÓSTICO 2 más abajo) una
vez resuelto el problema.
```


### Ubicación: `numFilas`

#### 03B006 — líneas 145-163 (comentario)

```text
Corrección (30/07/2026): "se ha generado un montón de registros,
cuando debe ser una fila por hoja". Causa raíz: cada Demoler +
runAll() borra TODAS las hojas y setupAllSheets() las recrea con un
sheetId NUEVO. Antes, esta función solo reconectaba por nombre las
filas SIN ID todavía (migración); un sheetId viejo que ya no existe
nunca se volvía a vincular por nombre, así que cada Demoler+runAll
dejaba ~28 filas "Vigente=No" nuevas (sheetId muerto) en vez de
reciclar la fila de la corrida anterior — de ahí las cientos de
filas duplicadas acumuladas en varios ciclos de prueba.

Fix, dos partes:
1) Deduplicación dura: como máximo UNA fila por Nombre. La primera
   vez que se ve un Nombre (recorriendo de arriba hacia abajo) se
   procesa; cualquier fila posterior con el MISMO Nombre se
   descarta (es basura duplicada, todas comparten el mismo origen).
2) Reconexión por nombre para CUALQUIER fila sin match por ID (no
   solo las legadas sin ID): si el sheetId ya no existe pero SÍ hay
   una hoja real sin reclamar con ese mismo Nombre, se revive la
   fila con el sheetId actual en vez de dejarla "No" y crear otra.
```

#### 03B007 — líneas 197-201 (comentario)

```text
DIAGNÓSTICO 2: lo que queda en hojasPorId en este punto son hojas
reales que NO se pudieron reconectar con ninguna fila restaurada
(ver bloque DIAGNÓSTICO arriba) — son las que están a punto de
recrearse con valores por DEFECTO, pisando cualquier Visibilidad/
Tipo/Edición personalizado que tuvieran antes del Demoler.
```

#### 03B008 — líneas 211-214 (comentario)

```text
Lo que queda en hojasPorId son hojas reales que no tenían fila en
Índice (hojas nuevas): se agregan con su configuración recomendada
(CFG.INDICE_DEFAULTS) o, si no está mapeada, con un valor genérico
seguro (No / Secundario / Solo Lectura). Se les asigna su sheetId.
```

#### 03B009 — líneas 263-271 (comentario)

```text
FIX (09-ago-2026, pedido del usuario): ocultar filas de hojas ya NO
vigentes (Vigente="No") — se ejecuta dentro de actualizarIndiceSheet(),
así que corre automáticamente con runAll(), runUpdate() y con el botón
manual runActualizarIndiceManual() (todos llaman a esta función), sin
necesitar un paso aparte. Como filas.sort() (_compararFilasIndice) ya
deja las Vigente="No" al fondo, alcanza con ubicar el primer índice
no vigente y ocultar desde ahí hasta el final; el resto se muestra
(por si una hoja volvió a estar vigente y su fila estaba oculta de
una corrida anterior).
```


### Ubicación: `_setupIndice`

#### 03B010 — líneas 293-295 (comentario)

```text
Se reescribe siempre (no solo si está vacía): así una hoja con
encabezados del orden viejo queda con los títulos correctos apenas se
corre este código nuevo, en línea con la migración de datos de arriba.
```

#### 03B011 — líneas 302-317 (docblock)

```text
_setupIndice(ss)
Hoja Índice: tabla de control de TODAS las hojas del documento.
N° | Nombre | ID | Vigente | Visibilidad | Tipo | Edición
- N° es numeración automática (1, 2, 3...) según el orden físico de filas.
- Vigente indica si la hoja con ese Nombre existe actualmente. Si se borra
  una hoja, su fila NUNCA se borra de Índice — solo se marca Vigente="No".
- El contenido (qué hojas hay, si siguen vigentes, el orden final de filas)
  se mantiene con actualizarIndiceSheet(); aquí solo se crea la estructura.
FIX (09-ago-2026, pedido del usuario): Nombre e ID se movieron de después
de INDICE_COLUMNAS a justo después de N° (antes: N° | Vigente |
Visibilidad | Tipo | Edición | Nombre | ID). Ver
_migrarOrdenColumnasIndiceSiHaceFalta() más abajo, que reacomoda los
datos ya escritos con el orden viejo la primera vez que corre con este
código nuevo.
```

#### 03B012 — líneas 318-325 (docblock)

```text
_colIndiceFor(campo)
Devuelve la columna (1-based) de un campo en la hoja Índice. N° es
siempre la columna 1, Nombre la 2 e ID la 3; los campos restantes
(Vigente, Visibilidad, Tipo, Edición, en ese orden por defecto) salen de
CFG.INDICE_COLUMNAS —mismo orden en que aparecen las columnas de
referencia N..Q en la hoja Extra— y van a partir de la columna 4.
```


### Ubicación: `_colIndiceFor`

#### 03B013 — líneas 334-346 (docblock)

```text
_migrarOrdenColumnasIndiceSiHaceFalta(sh)
FIX (09-ago-2026, pedido del usuario): las columnas Nombre e ID se
movieron de después de INDICE_COLUMNAS a justo después de N° (nuevo
orden: N° | Nombre | ID | Vigente | Visibilidad | Tipo | Edición).
_colIndiceFor() ya devuelve las posiciones NUEVAS; esta función se
encarga, UNA SOLA VEZ por hoja, de reacomodar los datos que ya estaban
escritos con el orden VIEJO (N° | Vigente | Visibilidad | Tipo |
Edición | Nombre | ID) para que no queden desalineados con los
encabezados nuevos. Es idempotente: si el encabezado de la columna 2 ya
es "Nombre" (orden nuevo), no hace nada; si la hoja es nueva o está
vacía, tampoco.
```


### Ubicación: `_indiceTotalCols`

#### 03B014 — líneas 389-396 (docblock)

```text
_aplicarFormatoCondicionalIndice(sh, numCols)
Aplica formato condicional por fila según el valor de la columna Tipo.
  Raíz      → verde pastel  (#d9ead3)
  Secundario → azul pastel  (#cfe2f3)
  Respaldo   → naranja pastel (#fce5cd)
Colorea toda la fila (columnas 1..numCols) usando la columna Tipo como referencia.
```


### Ubicación: `_aplicarFormatoCondicionalIndice`

#### 03B015 — líneas 431-435 (docblock)

```text
_colLetra(n)
Convierte un número de columna (1-based) a su letra(s) de columna de Sheets.
Ej: 1→'A', 4→'D', 27→'AA'
```


### Ubicación: `_colLetra`

#### 03B016 — líneas 446-453 (docblock)

```text
_compararFilasIndice(a, b)
Orden: Vigente (Sí antes que No, para mandar al fondo hojas eliminadas
que ya no existen) > Visibilidad (según el orden de CFG.EXTRA_VISIBILIDAD:
Sí, No — primero las visibles) > Tipo (según el orden de CFG.EXTRA_TIPO:
Raíz, Secundario, Respaldo) > Edición (según el orden de
CFG.EXTRA_EDICION: Editable, Solo Lectura) > Nombre (alfabético).
```


### Ubicación: `_compararFilasIndice`

#### 03B017 — líneas 483-493 (docblock)

```text
_reordenarYOcultarHojasSegunIndice()
Usa el orden y los valores ya calculados en la hoja Índice (llamar SIEMPRE
después de actualizarIndiceSheet()) para:
 - Reordenar las pestañas físicas del documento en ese mismo orden.
 - Mostrar/ocultar cada pestaña según su columna Visibilidad.
 - Aplicar protección de "solo advertencia" según su columna Edición
   (Solo Lectura -> advertencia al editar; Editable -> sin protección).
Las filas con Vigente="No" (hojas borradas) se ignoran, ya que no existe
una pestaña real a la cual aplicarles nada.
```


---


# Archivo 04_Formato_Comun.gs

Formato visual transversal a varias hojas: bordes, tablas, gridlines, clip de columnas, anchos fijos de columna, limpieza de hojas obsoletas. Invocado principalmente desde `runFormato()` y desde los pasos finales de `runAll()` (00_Main.gs). Los IDs de bloque llevan prefijo `04`.


## Índice de bloques movidos

| ID | Líneas orig. | Ubicación | Resumen |
|---|---|---|---|
| 04B001 | 9-17 | `Cabecera del archivo` | _setupCards()/_setupCards2() — ELIMINADAS (06-ago-2026). |
| 04B002 | 19-24 | `Cabecera del archivo` | aplicarFormatoGlobal |
| 04B003 | 29-50 | `aplicarFormatoGlobal` | FIX (07-ago-2026): antes solo se recorrían las hojas registradas en |
| 04B004 | 60-81 | `aplicarFormatoGlobal` | FIX (07-ago-2026): reportado por el usuario — runAll() se cortó a |
| 04B005 | 124-126 | `aplicarFormatoGlobal` | Error no transitorio, o ya se agotaron los 3 intentos: se |
| 04B006 | 160-168 | `aplicarFormatoGlobal` | Mensajes: columna Contenido con ancho fijo de 428px y ajuste de texto |
| 04B007 | 188-193 | `aplicarFormatoGlobal` | _aplicarClipColumnaJugador() |
| 04B008 | 194-200 | `aplicarFormatoGlobal` | _hojasConColumnaJugador() |
| 04B009 | 204-208 | `_hojasConColumnaJugador` | Administradores (12/07/2026): ya no tiene columna "Jugador" — pasó a |
| 04B010 | 210-227 | `_hojasConColumnaJugador` | Vetados (17-ago-2026): la columna 4 dejó de ser "Jugador" y pasó a |
| 04B011 | 253-259 | `_aplicarClipColumnaJugador` | _ocultarColumnaJugador() |
| 04B012 | 276-280 | `_ocultarColumnaJugador` | _aplicarSubindiceEncabezados(sh) |
| 04B013 | 308-312 | `_aplicarSubindiceEncabezados` | _limpiarBordesFilasVacias() |
| 04B014 | 346-395 | `_crearTabla` | _repararMergesFiltroHeader(sh, filaHeader) |
| 04B015 | 448-464 | `_repararMergesFiltroHeader` | _aplicarFiltroEnFilaHeader(sh, nombreHoja) |
| 04B016 | 471-485 | `_aplicarFiltroEnFilaHeader` | FIX (18-sep-2026, pedido usuario -- "las hojas Conflictos, T_Resoluciones, |
| 04B017 | 492-494 | `_aplicarFiltroEnFilaHeader` | Antes de crear el filtro, partir cualquier celda combinada de |
| 04B018 | 506-509 | `_aplicarFiltroEnFilaHeader` | Reintento de respaldo: rompe CUALQUIER merge residual que quede |
| 04B019 | 525-535 | `_aplicarFiltroEnFilaHeader` | _restaurarFiltros() |
| 04B020 | 539-559 | `_restaurarFiltros` | GENERALIZADO (18-sep-2026, pedido usuario -- "no me refería solo a esas |
| 04B021 | 562-564 | `_restaurarFiltros` | Recorre TODAS las hojas del spreadsheet (no una lista fija), así que |
| 04B022 | 573-577 | `_restaurarFiltros` | Columnas congeladas: reafirmación defensiva por si alguna corrida |
| 04B023 | 604-606 | `_restaurarFiltros` | La columna "Jugador" debe permanecer oculta en todas las hojas; si alguna |
| 04B024 | 609-616 | `_restaurarFiltros` | DEFENSIVO (30/06/2026): la columna E "Movimiento" de Historial estuvo |
| 04B025 | 662-680 | `_limpiarHojaTerrenoLimpio` | _renombrarHojasHistorialLegacy() |
| 04B026 | 708-721 | `_renombrarHojasHistorialLegacy` | _limpiarHojasCardsObsoletas() |
| 04B027 | 750-768 | `_limpiarHojasCardsObsoletas` | _limpiarHojaTRequisitosObsoleta() |
| 04B028 | 787-802 | `_limpiarHojaTRequisitosObsoleta` | _limpiarHojaMenuObsoleta() |
| 04B029 | 830-838 | `_limpiarHojaMenuObsoleta` | _enviarRespaldosMenuAPapelera() |
| 04B030 | 855-859 | `_enviarRespaldosMenuAPapelera` | aplicarClipGlobal() |
| 04B031 | 876-885 | `aplicarClipGlobal` | FIX (17-ago-2026): mismo refuerzo que el de Menú!Contenido de arriba, |
| 04B032 | 912-944 | `aplicarClipGlobal` | ANCHOS DE COLUMNA POR NOMBRE DE ENCABEZADO (pedido usuario, esta corrida) |
| 04B033 | 948-958 | `ANCHOS_COLUMNAS_ARCHIVO` | EXCEPCIÓN — hoja "Calendario", columnas B..J (pedido usuario, 16-ago-2026). |
| 04B034 | 965-1028 | `COL_FIN_ANCHOS_CALENDARIO` | Fase 18 (17/07/2026): autoajuste de ancho de columna. |
| 04B035 | 1030-1108 | `COL_FIN_ANCHOS_CALENDARIO` | autoajustarAnchoColumnas(nombreHoja) |
| 04B036 | 1114-1120 | `autoajustarAnchoColumnas` | Colchón en píxeles que se suma DESPUÉS de autoResizeColumns(), para |
| 04B037 | 1123-1126 | `autoajustarAnchoColumnas` | Ancho default de una columna nueva en Google Sheets (píxeles). Ahora es |
| 04B038 | 1129-1131 | `autoajustarAnchoColumnas` | FIX (pedido usuario): archivo guardado por guardarAnchosColumnasFijos(), |
| 04B039 | 1145-1148 | `autoajustarAnchoColumnas` | REANUDABLE: progreso guardado en ScriptProperties, mismo criterio que |
| 04B040 | 1173-1177 | `autoajustarAnchoColumnas` | FIX (pedido usuario, excepción "Nuevos"): rango de columnas que el |
| 04B041 | 1180-1182 | `autoajustarAnchoColumnas` | FIX (pedido usuario, mapa de anchos guardados para ESTA hoja en |
| 04B042 | 1185-1192 | `autoajustarAnchoColumnas` | FIX (pedido usuario): encabezados de fila 1, para poder emparejar |
| 04B043 | 1196-1204 | `autoajustarAnchoColumnas` | FIX (16-ago-2026): mismo bug que guardarAnchosColumnasFijos()/ |
| 04B044 | 1212-1219 | `autoajustarAnchoColumnas` | PASO 1: detectar, columna por columna (hasta limiteGenerico), |
| 04B045 | 1228-1230 | `autoajustarAnchoColumnas` | Ancho fijo explícito (guardado por nombre de encabezado): se |
| 04B046 | 1243-1245 | `autoajustarAnchoColumnas` | PASO 2: autoajustar solo las columnas sin ancho fijo. Se agrupan |
| 04B047 | 1258-1264 | `autoajustarAnchoColumnas` | PASO 4 (pedido usuario, excepción "Nuevos"): franja del historial |
| 04B048 | 1280-1285 | `autoajustarAnchoColumnas` | REANUDABLE (ver nota FIX arriba): chequeo de presupuesto interno |
| 04B049 | 1301-1316 | `autoajustarAnchoColumnas` | autoajustarAnchoColumnasCompleto() |
| 04B050 | 1321-1359 | `autoajustarAnchoColumnasCompleto` | autoajustarHojasSinAnchosGuardados() |
| 04B051 | 1405-1438 | `autoajustarHojasSinAnchosGuardados` | guardarAnchosColumnasFijos(nombreHoja) |
| 04B052 | 1457-1463 | `guardarAnchosColumnasFijos` | FIX (pedido usuario, esta corrida): contadores separados para el LOG de |
| 04B053 | 1476-1480 | `guardarAnchosColumnasFijos` | FIX (pedido usuario, excepción "Nuevos"): no escanear más allá del |
| 04B054 | 1496-1500 | `guardarAnchosColumnasFijos` | Valores guardados ANTES de esta corrida para esta hoja puntual -- |
| 04B055 | 1531-1549 | `guardarAnchosColumnasFijos` | restaurarAnchosColumnasFijos(nombreHoja) |
| 04B056 | 1582-1586 | `restaurarAnchosColumnasFijos` | FIX (pedido usuario, excepción "Nuevos"): mismo límite que |
| 04B057 | 1609-1612 | `restaurarAnchosColumnasFijos` | FIX (pedido usuario): al restaurar la hoja "Nuevos", reaplicar de |
| 04B058 | 1629-1678 | `restaurarAnchosColumnasFijos` | _clavesColumnasParaAnchos(hoja, filaHeader, limiteGenerico) |
| 04B059 | 1696-1712 | `_clavesColumnasParaAnchos` | FIX (18-sep-2026, pedido usuario): "si hay más de una fila de |
| 04B060 | 1725-1727 | `_clavesColumnasParaAnchos` | FIX (17-ago-2026, ver docblock arriba): desambiguar encabezados |
| 04B061 | 1740-1752 | `_clavesColumnasParaAnchos` | EXCEPCIÓN — hoja "Nuevos", franja dinámica del historial RoyaleAPI |
| 04B062 | 1754-1765 | `_clavesColumnasParaAnchos` | _limiteColumnasParaAnchoPorEncabezado(hoja) |
| 04B063 | 1766-1823 | `_clavesColumnasParaAnchos` | _filaEncabezadoParaAnchos(hoja) |
| 04B064 | 1835-1875 | `_limiteColumnasParaAnchoPorEncabezado` | _aplicarAnchosFijosGridHistorialNuevos(hoja, maxCol) |
| 04B065 | 1877-1885 | `_aplicarAnchosFijosGridHistorialNuevos` | FIX (17-ago-2026, pedido usuario): esta función se llama para TODAS las |
| 04B066 | 1890-1892 | `_aplicarAnchosFijosGridHistorialNuevos` | Ancho fijo por posición dentro de cada bloque de 4 columnas, en el |
| 04B067 | 1904-1912 | `_aplicarAnchosFijosGridHistorialNuevos` | _leerAnchosColumnasGuardados() |
| 04B068 | 1914-1917 | `_leerAnchosColumnasGuardados` | (25-sep-2026, FASE B) Ahora en "Otros" (DRIVE_FOLDER_ID_OTROS) — antes |
| 04B069 | 1930-1936 | `_leerAnchosColumnasGuardados` | _escribirAnchosColumnasGuardados(datos) |
| 04B070 | 1950-1960 | `_escribirAnchosColumnasGuardados` | _agruparColumnasContiguas(cols) |

---

## Detalle (texto original, sin cambios)

Cada bloque se copió tal cual estaba en el `.gs` (sin los `//`). Los números de línea son los del archivo ANTES de la limpieza.


### Ubicación: `Cabecera del archivo`

#### 04B001 — líneas 9-17 (comentario)

```text
---------------------------------------------------------------------------
_setupCards()/_setupCards2() — ELIMINADAS (06-ago-2026).
Cards y Cards_2 ya no son hojas del spreadsheet: sus datos viven
únicamente en Backup_Cards.csv / Backup_Cards_2.csv (Drive). Ver
_limpiarHojasCardsObsoletas() en 04_Formato_Comun.gs (borra las hojas si todavía
existen de una versión anterior) y updateCardsSheet()/updateCards2Sheet()/
_construirCardInfoMap()/_construirCards2PorTag() en 04_Formato_Comun.gs (leen y
escriben directo en esos dos CSV).
---------------------------------------------------------------------------
```

#### 04B002 — líneas 19-24 (comentario)

```text
---------------------------------------------------------------------------
aplicarFormatoGlobal
Aplica formato de celda a todas las hojas.
Borra bordes en filas vacías y aplica bordes solo hasta la última fila con datos.
Control: cuadrícula con ancho de 45px (columnas COL_INICIO_GRID en adelante).
---------------------------------------------------------------------------
```


### Ubicación: `aplicarFormatoGlobal`

#### 04B003 — líneas 29-50 (comentario)

```text
FIX (07-ago-2026): antes solo se recorrían las hojas registradas en
CFG.SHEETS, así que cualquier hoja creada A MANO por el usuario (ej.
T_Requisitos, Terreno_Limpio) — o cualquier hoja nueva que se agregue
en el futuro, con ese mismo patrón — nunca recibía el centrado
horizontal/vertical de acá abajo, porque ni siquiera se llegaba a
pedir sh = ss.getSheetByName(...) para ella. Ahora se recorren TODAS
las hojas reales del spreadsheet (ss.getSheets()), así que cualquier
hoja —existente o creada después— queda centrada automáticamente, sin
tener que acordarse de agregarla a ninguna lista.

Hojas que ya tienen su propio borde definido a propósito en otra parte
del código: acá se les sigue aplicando el centrado de más abajo, pero
se salta el borde gris genérico para no pisarlo/pelear con él.
BAJA DEFINITIVA (17-sep-2026, pedido del usuario -- "revisa lo que
todavía use alguna conexión a T_Requisitos, esa hoja ya no existe"):
se quita T_REQ_SHEET de esta lista. La hoja T_Requisitos fue dada de
baja a mano (14-sep-2026, Fase 9); como este bucle recorre
ss.getSheets() (las hojas REALES del spreadsheet) y solo compara
nombres, dejar T_REQ_SHEET acá nunca rompía nada (shName simplemente
nunca coincidía) -- pero ya no tiene ningún sentido mantenerlo. Queda
el array vacío, listo para la próxima hoja que necesite este mismo
tipo de exclusión.
```

#### 04B004 — líneas 60-81 (comentario)

```text
FIX (07-ago-2026): reportado por el usuario — runAll() se cortó a
mitad de camino con "Exception: Service Spreadsheets failed while
accessing document with id ..." justo en esta línea (sh.getLastRow()),
llamado desde aplicarFormatoGlobal() dentro de PASOS_RUNALL(). Este es
un error TRANSITORIO del lado de Google (no de este código): con
spreadsheets grandes y muchas hojas, formatear una tras otra en el
mismo segundo puede pisarle los talones al servicio de Sheets, que
responde con esta excepción genérica en vez de un 429 explícito de
cuota (por eso no lo agarraba el chequeo de cuota que ya existe en
44_BotWhatsApp.gs para la API de People). Antes, esto abortaba TODO
aplicarFormatoGlobal() (y con él, todo el paso de PASOS_RUNALL en el
que corre) apenas UNA hoja fallaba — dejando el resto de las hojas
sin formatear y el resto de runAll() sin ejecutarse en esa corrida.

Mismo criterio de backoff exponencial que ya usa el proyecto para
errores transitorios de cuota (ver sincronizarContactos(),
44_BotWhatsApp.gs: 3 reintentos, 2s/4s/8s), pero acá aplicado POR
HOJA: si una hoja puntual sigue fallando tras 3 reintentos, se
registra en el log y se sigue con la SIGUIENTE hoja en vez de
abortar el resto — mismo espíritu que el try/catch por candidato de
_aplicarImportacionNuevos() (14_Nuevos_RoyaleAPI.gs): un fallo
puntual no debe tumbar todo el lote.
```

#### 04B005 — líneas 124-126 (comentario)

```text
Error no transitorio, o ya se agotaron los 3 intentos: se
registra y se sigue con la siguiente hoja SIN abortar el resto
de aplicarFormatoGlobal()/runAll().
```

#### 04B006 — líneas 160-168 (comentario)

```text
Mensajes: columna Contenido con ancho fijo de 428px y ajuste de texto
"Ajustar" (WRAP, no CLIP). Se aplica DESPUÉS del bloque de Mensajes de
más arriba a propósito, porque ese bloque ya le puso WrapStrategy.CLIP
a TODA la hoja Mensajes (igual que a cualquier otra hoja del bucle
general) — este bloque pisa esa configuración solo para la columna
Contenido, mismo patrón que el bloque de Menú de más abajo. FIX
(14-ago-2026, pedido usuario): antes Mensajes!Contenido no tenía este
override y quedaba en CLIP (cortado) para siempre, sin ancho fijo
propio (heredaba lo que fuera que _setupMensajes() hubiera puesto).
```

#### 04B007 — líneas 188-193 (docblock)

```text
_aplicarClipColumnaJugador()
Aplica WrapStrategy.CLIP a la columna "Jugador" en todas las hojas que la tienen.
Evita que nombres largos (con múltiples cuentas) expandan la altura de fila.
Debe llamarse después de aplicarFormatoGlobal() o desde runAll/runUpdate.
```

#### 04B008 — líneas 194-200 (docblock)

```text
_hojasConColumnaJugador()
Lista compartida de hojas que tienen una columna "Jugador" (valor calculado
de apoyo interno) y su número de columna (1-based). Centralizada aquí para
que _aplicarClipColumnaJugador() y _ocultarColumnaJugador() no dupliquen el
mismo mapa hoja->columna en dos lugares distintos.
```


### Ubicación: `_hojasConColumnaJugador`

#### 04B009 — líneas 204-208 (comentario)

```text
Administradores (12/07/2026): ya no tiene columna "Jugador" — pasó a
tener su propia estructura reducida de 21 columnas (ver AC en
11_DirectorioSheet.gs y _setupAdministradores() más abajo).
Control (03-ago-2026): ya no tiene columna "Jugador" (ver
_pintarEncabezadosControl(), migrarControlQuitarJugador()).
```

#### 04B010 — líneas 210-227 (comentario)

```text
Vetados (17-ago-2026): la columna 4 dejó de ser "Jugador" y pasó a
ser "Nom_Multi" (ver _setupVetados() más arriba) — ya NO es un valor
calculado de apoyo interno, es información real que el usuario quiere
ver, igual que la columna Nom_Multi de Directorio (que tampoco está
en esta lista ni se oculta). Por eso se saca a Vetados de esta lista:
ya no se oculta ni se le fuerza CLIP en cada runAll/runUpdate.
Multicuentas (07-ago-2026): ya no tiene columna "Jugador" — se quitó
y se agregó "Préstamo" a la derecha de Nom_Multi (ver
_setupMulticuentas() más arriba y _updateMulticuentas() en
11_DirectorioSheet.gs).
NOTA (30/06/2026): Historial fue eliminado de esta lista — su columna 5
es "Movimiento" (estructura real: N°|Fecha|Tag|Nombre|Movimiento|Clan|
ClanTag), NO una columna "Jugador". Estaba mapeado por error con
col:5 y por eso runAll/runUpdate ocultaban Movimiento en cada ejecución.
Comentarios (17-ago-2026): mismo cambio que Vetados — la columna 5
dejó de ser "Jugador" y pasó a ser "Nom_Multi" (ver _setupComentarios()
más arriba), así que se saca de esta lista: ya no se oculta ni se le
fuerza CLIP en cada runAll/runUpdate.
```


### Ubicación: `_aplicarClipColumnaJugador`

#### 04B011 — líneas 253-259 (docblock)

```text
_ocultarColumnaJugador()
Oculta la columna "Jugador" en todas las hojas que la tienen (ver
_hojasConColumnaJugador()). Se llama desde _aplicarClipColumnaJugador()
(runAll) y también desde _restaurarFiltros() (cada runUpdate), por si
alguna hoja se reconstruyó por completo y la columna quedó visible otra vez.
```


### Ubicación: `_ocultarColumnaJugador`

#### 04B012 — líneas 276-280 (docblock)

```text
_aplicarSubindiceEncabezados(sh)
Aplica texto enriquecido para que el número en N1°, N2°, N3° aparezca en subíndice.
Busca en la fila 1 todas las celdas cuyo valor sea "N1°", "N2°" o "N3°".
```


### Ubicación: `_aplicarSubindiceEncabezados`

#### 04B013 — líneas 308-312 (docblock)

```text
_limpiarBordesFilasVacias()
Recorre todas las hojas (excepto Calendario) y elimina
bordes en filas que están más allá de la última fila con datos.
```


### Ubicación: `_crearTabla`

#### 04B014 — líneas 346-395 (docblock)

```text
_repararMergesFiltroHeader(sh, filaHeader)
GENERALIZADA (18-sep-2026, pedido usuario -- "no me refería solo a esas
hojas, hay un montón de hojas nuevas... si la hoja tiene n filas de
encabezados... poner los filtros en la fila n, no en las filas
anteriores"). Antes se llamaba _repararMergesFiltroHeader(sh) y asumía
SIEMPRE fila 3 fija (pensada solo para Control); ahora recibe filaHeader
como parámetro para servir a CUALQUIER hoja con encabezado de n filas
fusionadas, presente o futura, sin tener que tocar esta función de nuevo
cada vez que se agregue una hoja nueva con ese patrón. El nombre de la
función se actualiza acorde; ver _aplicarFiltroEnFilaHeader() más abajo,
que es quien ahora la llama desde el bucle genérico de _restaurarFiltros().

El filtro nativo de una hoja con encabezado de varias filas arranca en la
fila filaHeader (la última del bloque de encabezado). Sheets exige que
cualquier celda combinada que toque el rango del filtro esté COMPLETAMENTE
contenida en él — si una columna tiene una celda combinada que empieza
antes de filaHeader y termina en/después de filaHeader (o más allá), el
merge queda "cortado" por el borde superior del rango y createFilter()
falla para TODA la hoja (no solo esa columna). Esto pasa en columnas donde
el encabezado real vive en una celda combinada que arranca antes de
filaHeader, en vez de tener su propio texto en esa fila.

Esta función detecta esos merges (fila inicio <= filaHeader-1, fila fin >=
filaHeader) y los parte en dos: deja la fila filaHeader como celda
independiente CON el rótulo (mismo valor/formato que tenía el merge) —
porque esa es la fila que usa el desplegable del filtro nativo para
mostrar el nombre de columna, y es donde viven todos los demás encabezados
de la hoja — y deja la porción de arriba (fila inicio..filaHeader-1) EN
BLANCO (mismo fondo/formato, sin texto), para que el rótulo no quede
duplicado entre las filas.

Historial de este comentario/función (ver Lista_de_cambios.md):
- Hasta el 18/07/2026 (entonces fija a fila 3, hoja Control): copiaba el
  mismo texto a AMBAS filas → "doble Total"/"doble Prom" apilados (Fase
  10).
- 18/07/2026 (primer intento de fix): dejaba el rótulo arriba y la fila 3
  en blanco → el filtro perdía el nombre de columna en el desplegable y
  la fila 3 quedaba visualmente vacía frente al resto de encabezados
  (reportado igual de "mal" que el bug original). CORREGIDO: el rótulo va
  en la fila del filtro, arriba queda en blanco.
- 18-sep-2026: generalizada de fila 3 fija a filaHeader parametrizado.

Idempotente: si ya se corrigió antes, no encuentra merges que crucen
filaHeader (quedaron partidos en celdas independientes) y no hace nada.

@param {Sheet} sh
@param {number} filaHeader Fila 1-based donde debe quedar el rótulo (la
  última fila del bloque de encabezado de esta hoja).
```


### Ubicación: `_repararMergesFiltroHeader`

#### 04B015 — líneas 448-464 (docblock)

```text
_aplicarFiltroEnFilaHeader(sh, nombreHoja)
NUEVA (18-sep-2026, pedido usuario): mecanismo genérico que reemplaza el
bucle de fila fija + los bloques a mano por hoja (Control/Control_2/
Nuevos/T_Control/T_Lista/S_Lista) que había antes en _restaurarFiltros().
Detecta la fila de encabezado de CUALQUIER hoja vía sh.getFrozenRows()
(mismo criterio que _filaEncabezadoParaAnchos(), 04_Formato_Comun --
todas las funciones de setup del proyecto ya configuran las filas
congeladas correctamente al crear cada tipo de encabezado, así que ambos
sistemas comparten una sola fuente de verdad) y crea el filtro nativo
empezando exactamente en esa fila, nunca antes -- así una hoja nueva con
encabezado de varias filas fusionadas queda cubierta automáticamente, sin
tener que agregarla a ninguna lista.

@param {Sheet} sh
@param {string} nombreHoja Solo para el log.
```


### Ubicación: `_aplicarFiltroEnFilaHeader`

#### 04B016 — líneas 471-485 (comentario)

```text
FIX (18-sep-2026, pedido usuario -- "las hojas Conflictos, T_Resoluciones,
Grupo verificado y Alertas_HistorialGuerra no tienen filtros"). CAUSA
RAÍZ: acá había un `if (lastRow < filaHeader + 1) return;` ("sin filas de
datos debajo del encabezado, nada que filtrar"). Esas 4 hojas son tablas
ESPORÁDICAS (una fila solo cuando ocurre el evento: una resolución de
torneo, una alerta de guerra, una confirmación en el grupo, un clan en
conflicto cargado a mano) y casi siempre están con SOLO el encabezado --
así que nunca llegaban a recibir el filtro, y cuando por fin se les
agregaba una fila, seguían sin él hasta que alguien corriera runUpdate().
Ahora una hoja con solo encabezado también recibe su filtro: el rango
cubre el encabezado + al menos UNA fila debajo (vacía si hace falta),
limitado a las filas que la hoja realmente tiene (getMaxRows()). Es
genérico (no hay lista de hojas): cubre cualquier tabla vacía, presente
o futura. El rango vuelve a ajustarse a los datos reales en cada
_restaurarFiltros() (cada runUpdate/runAll).
```

#### 04B017 — líneas 492-494 (comentario)

```text
Antes de crear el filtro, partir cualquier celda combinada de
encabezado que cruce el límite de filaHeader -- si no, createFilter()
falla para TODA la hoja por un solo merge mal alineado.
```

#### 04B018 — líneas 506-509 (comentario)

```text
Reintento de respaldo: rompe CUALQUIER merge residual que quede
exactamente en la fila del encabezado (no solo los que cruzan el
límite superior) y reintenta una vez -- mismo criterio de respaldo
que antes tenía solo Control.
```

#### 04B019 — líneas 525-535 (docblock)

```text
_restaurarFiltros()
Recrea el filtro nativo (botón de embudo) en todas las hojas estándar.
Es una operación liviana (a diferencia de _desactivarGridlines, que es
costosa de aplicar en todas las hojas), pensada para ejecutarse en CADA
runUpdate(): varias operaciones del ciclo periódico cambian el número de
filas/columnas de una hoja (Historial al agregar registros, Inactivos/
Vetados al reconstruirse, Guerra al insertar columnas de una semana nueva,
etc.) y eso puede romper el rango del filtro existente, haciendo que el
botón de filtro desaparezca. Volver a crearlo aquí lo restaura siempre.
```


### Ubicación: `_restaurarFiltros`

#### 04B020 — líneas 539-559 (comentario)

```text
GENERALIZADO (18-sep-2026, pedido usuario -- "no me refería solo a esas
hojas, hay un montón de hojas nuevas... poner los filtros en la fila n,
no en las filas anteriores"). Antes había un bucle genérico que asumía
fila 1 fija para todas las hojas, más una lista de exclusión ('sinTabla')
y un bloque de código A MANO por cada hoja excluida (Control, Control_2,
Nuevos, T_Control, T_Lista, S_Lista) que repetía casi la misma lógica de
reparar merges + crear filtro, cada uno con su fila hardcodeada -- y
cualquier hoja nueva con encabezado de varias filas fusionadas (como
CR_Lista, que de hecho no estaba ni en la lista de exclusión) quedaba
sin cubrir o mal cubierta. Se reemplaza todo eso por
_aplicarFiltroEnFilaHeader() (ver más arriba en este archivo), que
detecta la fila de encabezado de CADA hoja vía getFrozenRows() (mismo
criterio que usa el sistema de anchos de columna) y crea el filtro
exactamente ahí -- sin listas fijas, cubre automáticamente cualquier
hoja nueva, presente o futura.

Solo quedan afuera del mecanismo genérico las hojas que NO son una
tabla estándar con encabezado + filas de datos:
- Calendario: estructura de cuadrícula propia, no aplica.
- Terreno_Limpio: hoja temporal/obsoleta que se elimina aparte (ver
  _limpiarHojaTerrenoLimpio()).
```

#### 04B021 — líneas 562-564 (comentario)

```text
Recorre TODAS las hojas del spreadsheet (no una lista fija), así que
cualquier hoja nueva — incluidas las que Diana cree a mano — recibe
filtro automáticamente, en la fila de encabezado que le corresponda.
```

#### 04B022 — líneas 573-577 (comentario)

```text
Columnas congeladas: reafirmación defensiva por si alguna corrida
anterior las perdió (ej. al reconstruir la hoja). El filtro y la fila
de encabezado ya quedaron resueltos arriba de forma genérica; esto solo
cubre el ancho de la franja de columnas fijas de cada hoja, que sigue
siendo particular de cada una.
```

#### 04B023 — líneas 604-606 (comentario)

```text
La columna "Jugador" debe permanecer oculta en todas las hojas; si alguna
se reconstruyó por completo (ej. al crecer columnas) puede quedar visible
de nuevo, así que se reafirma aquí en cada runUpdate().
```

#### 04B024 — líneas 609-616 (comentario)

```text
DEFENSIVO (30/06/2026): la columna E "Movimiento" de Historial estuvo
ocultándose por error en versiones anteriores (estaba incluida por
error en _hojasConColumnaJugador() con col:5, cuando en Historial la
columna 5 es "Movimiento", no "Jugador" — ver corrección en
_hojasConColumnaJugador(), 04_Formato_Comun.gs). Esa lista ya no incluye
Historial, pero si alguna ejecución previa al fix dejó la columna
oculta en la hoja, se reafirma aquí que vuelva a mostrarse, en cada
runAll/runUpdate, hasta que ya no quede ninguna hoja con el estado viejo.
```


### Ubicación: `_limpiarHojaTerrenoLimpio`

#### 04B025 — líneas 662-680 (docblock)

```text
_renombrarHojasHistorialLegacy()
FIX (06-ago-2026): Ascensos -> "Historial_A/D" e Historial -> "Historial_I/S".
CFG.SHEETS.ASCENSOS/CFG.SHEETS.HISTORIAL (01_Config_Global.gs) ya apuntan al
nombre NUEVO; esta función renombra en el spreadsheet REAL la pestaña
que todavía tenga el nombre viejo (hardcodeado acá a propósito, ya que
las constantes CFG ya no lo tienen) al nombre nuevo correspondiente,
preservando intactos todos sus datos/formato/protecciones — setName()
es un simple renombrado de pestaña, no toca el contenido.

Se llama ANTES de setupAllSheets() (ver PASOS_RUNALL/PASOS_RUNUPDATE más
abajo en este archivo) para que _getOrCreateSheet() (02_Setup_Hojas.gs)
encuentre la pestaña ya renombrada y NO cree una "Historial_A/D"/
"Historial_I/S" nueva y vacía en paralelo a la vieja con los datos.

Si la pestaña nueva YA existe (ej. en una segunda corrida, tras la
primera migración) no hace nada — evita reintentar un renombrado ya
hecho o, peor, sobreescribir por accidente la pestaña nueva.
```


### Ubicación: `_renombrarHojasHistorialLegacy`

#### 04B026 — líneas 708-721 (docblock)

```text
_limpiarHojasCardsObsoletas()
FIX (06-ago-2026): Cards y Cards_2 dejan de vivir en el spreadsheet — sus
datos viven ahora ÚNICAMENTE en Backup_Cards.csv / Backup_Cards_2.csv
(Drive; ver updateCardsSheet()/updateCards2Sheet()/_construirCardInfoMap()/
_construirCards2PorTag() en 31_Cards_Mazos.gs). setupAllSheets() ya no las crea
(ver 31_Cards_Mazos.gs); esta función, mismo patrón que
_limpiarHojaTerrenoLimpio() de arriba,
elimina las hojas si todavía existen de una versión anterior del proyecto.

Antes de borrar cada hoja, la respalda una última vez a su CSV
(protegerContraReduccion=true, mismo criterio que Vetados/T_Lista) para
no perder ninguna edición manual o dato aún no sincronizado en ese CSV.
```


### Ubicación: `_limpiarHojasCardsObsoletas`

#### 04B027 — líneas 750-768 (docblock)

```text
_limpiarHojaTRequisitosObsoleta()
NUEVO (24-sep-2026, pedido del usuario -- "t_requisitos no se debe
generar"): mismo patrón exacto que _limpiarHojaMenuObsoleta() de
abajo. La hoja T_Requisitos fue dada de baja (14-sep-2026, Fase 9;
reemplazada por CR_Lista en todo el sistema de Ascensos/Descensos -- ver
27_Torneos_Sorteos_Requisitos.gs) pero, a diferencia de Plantillas/Menú/Cards,
nunca tuvo su propia función de limpieza: la pestaña seguía existiendo
de forma huérfana en el spreadsheet, sin ningún consumidor de código.
Por eso respaldarHojasDerivadasCSV() (05_Backup_CSV.gs) -que recorre
TODAS las hojas reales vía ss.getSheets(), no una lista fija- seguía
generando Backup_T_Requisitos.csv en cada corrida: el respaldo de una
hoja borrada de baja hace tiempo, sin código nuevo que lo pidiera. Al
eliminar la pestaña acá, ss.getSheets() deja de incluirla y ese respaldo
deja de generarse solo, sin tocar 05_Backup_CSV.gs.
Nombre literal 'T_Requisitos' (no CFG.SHEETS.T_REQUISITOS): esa
constante ya no existe, se quitó junto con el resto del código de la
hoja (17-sep-2026, ver 01_Config_Global.gs).
```


### Ubicación: `_limpiarHojaTRequisitosObsoleta`

#### 04B028 — líneas 787-802 (docblock)

```text
_limpiarHojaMenuObsoleta()
Mismo patrón que _limpiarHojaTerrenoLimpio(). La hoja Menú dejó de
existir: su contenido vive ahora en el índice de contenido
(Indice_Contenido.json en Drive + caché, ver _getIndiceContenido(),
43_Menu_Dinamico.gs), que se reconstruye solo desde Drive, Clan y Mensajes.
Nadie más la lee ni la escribe, así que borrarla no pierde datos.
También manda a la papelera de Drive sus dos archivos de respaldo viejos
(ver _enviarRespaldosMenuAPapelera()), incluso si la hoja ya no existe.
Salvaguarda: si todavía no hay ningún índice guardado (caché ni Drive), NO
se borra nada y se avisa en el log — se reintenta en la próxima corrida,
cuando el pipeline ya haya generado el índice (o tras
inicializarIndiceContenido()).
Nombre literal 'Menú' (no CFG.SHEETS.MENU): esa constante ya no existe. La
hoja Índice marca sola Vigente="No" en la fila de una hoja borrada.
```


### Ubicación: `_limpiarHojaMenuObsoleta`

#### 04B029 — líneas 830-838 (docblock)

```text
_enviarRespaldosMenuAPapelera()
Manda a la papelera de Drive los respaldos CSV de la hoja Menú, que ya no
se usan (recuperables desde la papelera):
  - Backup_Menu.csv : respaldo dedicado que escribía syncAcumulativosCSV().
  - Backup_Menú.csv : respaldo genérico de hojas "derivadas" de cuando Menú
                      aún no tenía respaldo dedicado.
Busca en la carpeta de respaldos (_getCsvFolder()). Nunca lanza error.
```


### Ubicación: `_enviarRespaldosMenuAPapelera`

#### 04B030 — líneas 855-859 (docblock)

```text
aplicarClipGlobal()
Recorre todas las hojas y aplica CLIP a toda la celda de datos.
Llamar desde runAll() o como trigger diario ligero.
```


### Ubicación: `aplicarClipGlobal`

#### 04B031 — líneas 876-885 (comentario)

```text
FIX (17-ago-2026): mismo refuerzo que el de Menú!Contenido de arriba,
pero para Mensajes!Contenido. generarTodosMensajes() (30_Mensajes.gs)
deja esa columna en WRAP (altura de fila 200px, para que el texto del
mensaje se lea completo), pero el bucle genérico de arriba le vuelve a
poner CLIP a TODA la hoja Mensajes un instante después, en la MISMA
corrida — pisando ese ajuste siempre, no de forma intermitente (mismo
bug reportado para Menú!Contenido, el 07-ago-2026, ver comentario de
arriba). Se localiza la columna "Contenido" por su encabezado (fila 1)
en vez de asumir una posición fija, para no romper si se agrega o
reordena alguna columna en Mensajes.
```

#### 04B032 — líneas 912-944 (comentario)

```text
=============================================================================
ANCHOS DE COLUMNA POR NOMBRE DE ENCABEZADO (pedido usuario, esta corrida)
=============================================================================
Objetivo: poder ajustar a mano el ancho de las columnas que se quieran
fijas y "congelar" ese ajuste en un archivo -- identificando cada columna
por el TEXTO DE SU ENCABEZADO (fila 1), no por su índice numérico, así el
guardado sigue siendo válido aunque más adelante se reordenen, inserten o
borren columnas en la hoja. autoajustarAnchoColumnas() lee ese archivo
antes de autoajustar (ver FIX arriba en este archivo) en vez de adivinar
a ciegas con el heurístico de "ancho != default".

Flujo de uso:
  1) Ajustar a mano el ancho de las columnas que se quieran fijas.
  2) Correr guardarAnchosColumnasFijos() (todas las hojas) o
     guardarAnchosColumnasFijos('Directorio') (una sola hoja) -- guarda
     el ancho ACTUAL de cada columna con encabezado no vacío.
  3) A partir de ahí, cada corrida de autoajustarAnchoColumnas() respeta
     esos anchos guardados (columna "fija" por encabezado) y solo
     autoajusta el resto.
  4) restaurarAnchosColumnasFijos() aplica el archivo guardado en
     cualquier momento, sin pasar por el autoajuste -- útil si algo
     (una fila nueva, un import, etc.) descuadró los anchos y se quiere
     volver al último guardado sin reajustar todo de nuevo.

El archivo (JSON, Drive, carpeta "Otros" del proyecto --
DRIVE_FOLDER_ID_OTROS, FASE B 25-sep-2026; antes vivía suelto directo en
"JSON") tiene esta forma:
  {
    "Directorio": { "Jugador": 180, "ClanTag": 90, ... },
    "Guerra":     { "Ataques": 70, ... },
    ...
  }
=============================================================================
```


### Ubicación: `ANCHOS_COLUMNAS_ARCHIVO`

#### 04B033 — líneas 948-958 (comentario)

```text
-----------------------------------------------------------------------
EXCEPCIÓN — hoja "Calendario", columnas B..J (pedido usuario, 16-ago-2026).
Calendario no tiene fila de encabezados (es un layout visual, no una
tabla), así que el sistema por-nombre-de-encabezado no tiene con qué
identificar sus columnas -- de ahí que guardarAnchosColumnasFijos() la
guardara siempre en 0. Para esta hoja puntual se usa la LETRA de columna
como "clave" en vez de un texto de encabezado (mismo archivo JSON, mismo
flujo de guardar/restaurar/autoajustar, sin crear un sistema paralelo).
Rango fijo pedido: B (2) hasta J (10) -- el resto de columnas de
Calendario (A, K en adelante) sigue sin pasar por este sistema.
-----------------------------------------------------------------------
```


### Ubicación: `COL_FIN_ANCHOS_CALENDARIO`

#### 04B034 — líneas 965-1028 (comentario)

```text
Fase 18 (17/07/2026): autoajuste de ancho de columna.
Función nueva e independiente — sin dependencias de las demás fases.
Ejecución manual: elegir autoajustarAnchoColumnasCompleto (recorre TODAS
las hojas garantizando terminar, ver más abajo) en el selector de
funciones del editor de Apps Script y correr "Ejecutar".

FIX (16-ago-2026): autoajustarAnchoColumnas() se agrega a PASOS_RUNALL
(ver 00_Main.gs) — ya NO es 100% independiente del flujo automático del
sistema. Se hizo REANUDABLE (mismo patrón que respaldarHojasDerivadasCSV(),
05_Backup_CSV.gs) para que correr todas las hojas dentro de runAll() no
arriesgue el mismo "Exceeded maximum execution time" ya corregido para el
paso de Backup CSV: Guerra + celulares. Para uso manual desde el editor
(que no tiene el motor de continuación automática de runAll()), usar
autoajustarAnchoColumnasCompleto(), que reintenta el mismo paso hasta
terminar TODAS las hojas en una sola invocación — igual que
respaldarHojasRestantesCSV() hace con respaldarHojasDerivadasCSV().

FIX (17/07/2026): sh.autoResizeColumns() recortaba el texto. Es un bug
conocido y no resuelto de la propia API de Sheets (ver
issuetracker.google.com/issues/254659439): el cálculo interno de "ancho
ideal" que usa autoResizeColumns() es más angosto que el que aplica
Sheets cuando uno hace doble clic en el borde de una columna para
autoajustarla a mano. Por eso la macro grabada tampoco funcionaba, aunque
grabara el mismo clic: por debajo llama a esa misma API, así que hereda
el mismo sub-cálculo. No existe un parámetro para pedirle más margen, así
que el workaround es medir el ancho que devuelve autoResizeColumns() y
sumarle un colchón fijo en píxeles con setColumnWidth().

FIX (07-ago-2026): la función pisaba CUALQUIER ancho de columna, incluido
uno fijado a mano por el usuario (ej. una columna angosta a propósito
para que quede colapsada visualmente). Se agregó una heurística: si una
columna puntual ya tenía un ancho distinto al default de Sheets
(DEFAULT_COL_WIDTH_PX), se asumía fijada a propósito y se excluía del
autoajuste.

FIX (pedido usuario, esta corrida): esa heurística "ancho != default" era
ciega — si alguien fijaba a mano una columna a un valor que coincidiera
justo con el default (100px), no había forma de distinguirla de una
columna nunca tocada, y además no había forma de RECORDAR cuáles eran las
columnas fijas si algo las descuadraba (una fila nueva, un import, etc.).
Ahora existe un archivo en Drive (ANCHOS_COLUMNAS_ARCHIVO, JSON, en la
carpeta "Otros" del proyecto — DRIVE_FOLDER_ID_OTROS desde FASE B
25-sep-2026; antes vivía suelto directo en "JSON") que guarda el
ancho de cada columna INDEXADO POR EL TEXTO DE SU ENCABEZADO (fila 1), no
por su índice — así el guardado sigue siendo válido aunque más adelante
se reordenen, inserten o borren columnas en la hoja. Flujo:
  1) Ajustar a mano el ancho de las columnas que se quieran fijas.
  2) Correr guardarAnchosColumnasFijos() — congela ese ajuste en el
     archivo, por nombre de encabezado.
  3) autoajustarAnchoColumnas() ahora LEE ese archivo antes de autoajustar
     en vez de adivinar a ciegas con el heurístico: toda columna cuyo
     encabezado esté en el archivo se trata como fija (se le aplica el
     ancho guardado, nunca se autoajusta). El heurístico viejo
     (ancho != default) se mantiene SOLO como respaldo para columnas que
     todavía no se guardaron explícitamente con
     guardarAnchosColumnasFijos() — así no cambia el comportamiento en
     spreadsheets que todavía no usan este archivo.
  4) restaurarAnchosColumnasFijos() aplica el archivo guardado en
     cualquier momento, sin pasar por el autoajuste — útil para volver al
     último guardado si algo descuadró los anchos.
Ver guardarAnchosColumnasFijos(), restaurarAnchosColumnasFijos() y
_leerAnchosColumnasGuardados() más abajo en este mismo archivo.

@param {string} [nombreHoja] Nombre exacto de una hoja puntual (opcional).
```

#### 04B035 — líneas 1030-1108 (docblock)

```text
autoajustarAnchoColumnas(nombreHoja)
Autoajusta el ancho de todas las columnas con datos.

- Sin argumento: procesa TODAS las hojas visibles del spreadsheet.
- Con nombreHoja: procesa solo esa hoja puntual (nombre exacto de CFG.SHEETS,
  ej. autoajustarAnchoColumnas(CFG.SHEETS.DIRECTORIO) o
  autoajustarAnchoColumnas('Directorio')).

Las hojas ocultas se omiten a propósito: si alguien la ocultó con un ancho
de columna puntual, autoajustarla de paso sería un efecto colateral no
pedido. Cada hoja se procesa dentro de su propio try/catch para que una
falla puntual (celdas combinadas, protecciones, etc.) no corte el resto
del recorrido.

ANCHO FIJO POR COLUMNA (FIX pedido usuario, esta corrida): antes de
autoajustar, cada columna se revisa individualmente contra el archivo
guardado por guardarAnchosColumnasFijos() (emparejando por el TEXTO de su
encabezado, fila 1 — ver _leerAnchosColumnasGuardados()):
  - Si su encabezado tiene un ancho guardado ahí, la columna se trata
    como FIJA: se le aplica exactamente ese ancho guardado (por si se
    había descuadrado) y NO se autoajusta.
  - Si su encabezado no tiene ancho guardado, se aplica el heurístico
    anterior como respaldo: si el ancho actual es distinto al default de
    Sheets (DEFAULT_COL_WIDTH_PX), se asume fijada a propósito (pero
    nunca guardada explícitamente) y se deja intacta; si coincide con el
    default, se autoajusta normalmente.
Esto es por columna, no por hoja: una misma hoja puede tener columnas con
ancho guardado, columnas fijas solo por heurístico, y columnas
autoajustables, todo mezclado.

EXCEPCIÓN "NUEVOS" (pedido usuario, esta corrida): en la hoja "Nuevos",
el bloque "Historial RoyaleAPI (últimas N fechas)" (fila 3, desde la
columna COL_INICIO_GRID_NUEVOS en adelante) queda TOTALMENTE FUERA de
todo lo anterior -- no pasa por guardado/restauración por encabezado ni
por el heurístico ni por el autoajuste. Ahí el encabezado "Clan" (y
"Ataques"/"Fame"/"Barcos") se repite una vez por cada bloque de fecha que
agrega el userscript de Tampermonkey (cantidad variable, crece con el
tiempo), y ese "Clan" no es el mismo que la columna fija NC.CLAN, así que
identificarlo por nombre de encabezado es ambiguo. En vez de eso, se le
aplica un ancho FIJO POR POSICIÓN dentro de cada bloque de 4 columnas:
Clan 120px, Ataques 80px, Fame 62px, Barcos 72px -- ver
_aplicarAnchosFijosGridHistorialNuevos() más abajo en este archivo. Se
reaplica en cada corrida para cubrir automáticamente los bloques nuevos
que Tampermonkey vaya agregando.

REANUDABLE (16-ago-2026, agregada a PASOS_RUNALL — mismo patrón que
respaldarHojasDerivadasCSV(), 05_Backup_CSV.gs, y _fetchAllClanData(),
09_API_ClashRoyale.gs): SOLO aplica cuando se procesan TODAS las hojas (sin
`nombreHoja`) — es el caso con varias hojas y por lo tanto el único que
puede acercarse al límite de tiempo. autoResizeColumns() es una llamada
cara (repinta la hoja), y con 20+ hojas visibles en el spreadsheet, sumar
el tiempo de todas en un solo tirón sin cortes podía llegar al límite
duro de la plataforma (6 min) a mitad de camino, igual que ya pasó con el
paso de Backup CSV: Guerra + celulares (ver PASOS_RUNALL, 00_Main.gs). Se
procesa de a una hoja, chequeando el presupuesto propio
(CFG.AUTOAJUSTE_ANCHO_BUDGET_MS) después de cada una; si se agota antes
de terminar, guarda en qué hoja se quedó (ScriptProperties) y devuelve
`false` para que _ejecutarPorTandas() reintente este MISMO paso en la
próxima continuación, retomando justo donde quedó en vez de repetir todo
desde cero. Llamada con `nombreHoja` (uso manual desde el menú, una sola
hoja) siempre se completa en la misma invocación y devuelve `true`.

FIX (18-sep-2026, pedido usuario -- "Conflictos, T_Resoluciones, Grupo
verificado y Alertas_HistorialGuerra no tienen autoajuste de ancho de
columna con anchos guardados"): segundo parámetro opcional
`incluirOcultas`. Por defecto (false) todo sigue igual: las hojas
ocultas se omiten. Lo pasa en true autoajustarHojasSinAnchosGuardados()
(más abajo en este archivo), porque una hoja nueva que no figura en
CFG.INDICE_DEFAULTS nace con Visibilidad "No" (oculta) y sin este
parámetro quedaba SIEMPRE fuera del autoajuste. Las columnas con un ancho
distinto al default (fijadas a mano) se siguen respetando igual.

@param {string} [nombreHoja] Nombre exacto de una hoja puntual (opcional).
@param {boolean} [incluirOcultas] true para no omitir la hoja si está oculta.
@returns {boolean} true si terminó todas las hojas (o si se pidió una
         sola hoja puntual), false si quedó incompleto (presupuesto
         interno agotado) y hay que reintentar el mismo paso.
```


### Ubicación: `autoajustarAnchoColumnas`

#### 04B036 — líneas 1114-1120 (comentario)

```text
Colchón en píxeles que se suma DESPUÉS de autoResizeColumns(), para
compensar el sub-cálculo de la API (ver nota de FIX arriba). 16px es un
margen conservador (~1-2 caracteres) que cubre la mayoría de las
fuentes/tamaños usados en este spreadsheet sin dejar las columnas
visiblemente más anchas que un autoajuste manual normal. Si algún caso
puntual sigue cortando texto (fuentes/tamaños poco comunes), subir este
valor.
```

#### 04B037 — líneas 1123-1126 (comentario)

```text
Ancho default de una columna nueva en Google Sheets (píxeles). Ahora es
SOLO el respaldo para columnas sin ancho guardado explícitamente (ver
nota de FIX arriba) — la fuente de verdad principal es el archivo de
guardarAnchosColumnasFijos().
```

#### 04B038 — líneas 1129-1131 (comentario)

```text
FIX (pedido usuario): archivo guardado por guardarAnchosColumnasFijos(),
{ "NombreHoja": { "Encabezado": anchoPx, ... }, ... }. Se lee UNA vez
acá afuera del loop de hojas.
```

#### 04B039 — líneas 1145-1148 (comentario)

```text
REANUDABLE: progreso guardado en ScriptProperties, mismo criterio que
RESPALDO_DERIVADAS_IDX (respaldarHojasDerivadasCSV(), 05_Backup_CSV.gs).
Solo se usa cuando reanudable === true (recorrido de todas las hojas);
en el caso de una sola hoja puntual, idxInicio siempre queda en 0.
```

#### 04B040 — líneas 1173-1177 (comentario)

```text
FIX (pedido usuario, excepción "Nuevos"): rango de columnas que el
sistema por-encabezado debe considerar en ESTA hoja -- para
"Nuevos", todo lo anterior al historial dinámico de RoyaleAPI (ver
_limiteColumnasParaAnchoPorEncabezado()); para cualquier otra hoja,
sin cambio (limiteGenerico === maxCol).
```

#### 04B041 — líneas 1180-1182 (comentario)

```text
FIX (pedido usuario, mapa de anchos guardados para ESTA hoja en
particular, emparejado por encabezado ({} si la hoja nunca se
guardó con guardarAnchosColumnasFijos()).
```

#### 04B042 — líneas 1185-1192 (comentario)

```text
FIX (pedido usuario): encabezados de fila 1, para poder emparejar
cada columna con su ancho guardado por nombre. Solo se lee hasta
limiteGenerico -- la franja de historial dinámico de "Nuevos" (si
aplica) queda afuera a propósito. Si la hoja no tiene fila de
encabezados legible, se sigue igual con el heurístico viejo para
todas las columnas (mapaHojaGuardado ya vacío para esta hoja hace
que ninguna columna encuentre coincidencia, así que el
comportamiento cae solo en el heurístico, sin errores).
```

#### 04B043 — líneas 1196-1204 (comentario)

```text
FIX (16-ago-2026): mismo bug que guardarAnchosColumnasFijos()/
restaurarAnchosColumnasFijos() -- leía SIEMPRE fila 1, así que
en Control/Control_2/Nuevos/T_Control (encabezado real en fila
3) nunca encontraba coincidencia por nombre y esas columnas
caían siempre en el heurístico viejo. Ver
_filaEncabezadoParaAnchos()/_clavesColumnasParaAnchos() (esta
última también resuelve la excepción de "Calendario", que no
tiene fila de encabezados en absoluto: usa la letra de columna
como clave para B..J en vez de texto de encabezado).
```

#### 04B044 — líneas 1212-1219 (comentario)

```text
PASO 1: detectar, columna por columna (hasta limiteGenerico),
cuáles tienen un ancho fijo -- primero por archivo guardado (por
encabezado), y si no hay coincidencia ahí, por el heurístico viejo
(ancho != default) como respaldo. Esas se respetan (o se corrigen
al valor guardado); el resto se autoajusta normalmente. Las
columnas más allá de limiteGenerico (historial dinámico de
"Nuevos", si aplica) NO pasan por este loop -- se manejan aparte
más abajo, con _aplicarAnchosFijosGridHistorialNuevos().
```

#### 04B045 — líneas 1228-1230 (comentario)

```text
Ancho fijo explícito (guardado por nombre de encabezado): se
aplica tal cual, corrigiendo cualquier descuadre, y se excluye
del autoajuste.
```

#### 04B046 — líneas 1243-1245 (comentario)

```text
PASO 2: autoajustar solo las columnas sin ancho fijo. Se agrupan
columnas contiguas en un solo llamado a autoResizeColumns() (más
eficiente que un llamado por columna en hojas anchas).
```

#### 04B047 — líneas 1258-1264 (comentario)

```text
PASO 4 (pedido usuario, excepción "Nuevos"): franja del historial
dinámico de RoyaleAPI (más allá de limiteGenerico, si esta hoja es
"Nuevos") -- ancho fijo por POSICIÓN dentro de cada bloque de 4
columnas (Clan/Ataques/Fame/Barcos), reaplicado en CADA corrida
para cubrir automáticamente cualquier bloque nuevo que Tampermonkey
haya agregado desde la última vez. No hace nada (devuelve 0) en
cualquier hoja que no sea "Nuevos".
```

#### 04B048 — líneas 1280-1285 (comentario)

```text
REANUDABLE (ver nota FIX arriba): chequeo de presupuesto interno
DESPUÉS de cada hoja, no antes -- así la hoja actual siempre termina
de procesarse por completo antes de decidir si cortar. Solo aplica
al recorrido de todas las hojas (reanudable === true); con una sola
hoja puntual nunca hay más que un elemento, así que este chequeo no
llega a activarse.
```

#### 04B049 — líneas 1301-1316 (docblock)

```text
autoajustarAnchoColumnasCompleto()
Punto de entrada para ejecución MANUAL desde el editor de Apps Script
(selector de funciones > Ejecutar). autoajustarAnchoColumnas() ahora es
reanudable por tandas (ver comentario FIX arriba) para poder cortar
limpio DENTRO de runAll() — pero una ejecución manual disparada desde el
editor no pasa por el motor de continuación automática de
_ejecutarPorTandas() (00_Main.gs), así que sin este wrapper una corrida
manual con muchas hojas podría devolver `false` (presupuesto interno
agotado) y dejar el resto a medias hasta que alguien la vuelva a correr
a mano. Mismo criterio que respaldarHojasRestantesCSV() (05_Backup_CSV.gs)
usa para envolver a respaldarHojasDerivadasCSV(): reintenta el mismo
paso hasta que devuelve `true`, garantizando terminar TODAS las hojas en
una sola invocación (dentro del límite de 6 min de una ejecución manual
de Apps Script).
```


### Ubicación: `autoajustarAnchoColumnasCompleto`

#### 04B050 — líneas 1321-1359 (docblock)

```text
autoajustarHojasSinAnchosGuardados()
NUEVA (18-sep-2026, pedido usuario -- "las hojas Conflictos,
T_Resoluciones, Grupo verificado y Alertas_HistorialGuerra no tienen
autoajuste de ancho de columna con anchos guardados").

CAUSA RAÍZ: desde el 20-ago-2026, el único paso de runAll() que toca
anchos es restaurarAnchosColumnasFijos(), y esa función SOLO aplica lo que
ya está en Anchos_Columnas_Fijos.json -- una hoja que nunca se guardó ahí
(todas las hojas creadas después del último guardarAnchosColumnasFijos(),
como estas 4) queda con el ancho por defecto (100px) para siempre, porque
autoajustarAnchoColumnas() ya no forma parte del flujo automático. Y aun
corriéndola a mano, esa función omite las hojas ocultas, y una hoja nueva
fuera de CFG.INDICE_DEFAULTS nace oculta (Visibilidad "No").

Esta función es el complemento que faltaba, y es GENÉRICA (sin lista de
hojas): toma toda hoja del spreadsheet que NO tenga ninguna entrada en el
archivo de anchos guardados y le corre autoajustarAnchoColumnas(nombre,
true) -- que igual respeta cualquier columna con ancho ya distinto al
default (fijada a mano) y solo autoajusta las que siguen en 100px. Las
hojas que SÍ están en el archivo no se tocan (siguen siendo asunto
exclusivo de restaurarAnchosColumnasFijos(), así que el criterio del
20-ago -- "no autoajustar lo que el usuario ya fijó" -- se mantiene).
Excluye Calendario (layout visual con su propio criterio de anchos, ver
COL_INICIO_ANCHOS_CALENDARIO).

NO guarda nada en el archivo: para que los anchos de una de estas hojas
queden "guardados" (y sobrevivan a un Demoler + runAll() tal cual los
dejaste), ajustarlos a mano y correr guardarAnchosColumnasFijos('Hoja');
desde ese momento la hoja deja de pasar por acá.

REANUDABLE (mismo patrón que autoajustarAnchoColumnas() completo): chequea
CFG.AUTOAJUSTE_ANCHO_BUDGET_MS después de cada hoja y, si se agota, guarda
el índice en ScriptProperties y devuelve false para que
_ejecutarPorTandas() (00_Main.gs) reintente el MISMO paso.

@returns {boolean} true si terminó (o no había nada que hacer), false si
         quedó incompleto por presupuesto interno.
```


### Ubicación: `autoajustarHojasSinAnchosGuardados`

#### 04B051 — líneas 1405-1438 (docblock)

```text
guardarAnchosColumnasFijos(nombreHoja)
Lee el ancho ACTUAL de cada columna con encabezado no vacío (fila 1) y lo
guarda en Drive, indexado por el TEXTO del encabezado -- no por índice de
columna -- así sigue siendo válido aunque el orden de columnas cambie más
adelante.

- Sin argumento: procesa TODAS las hojas visibles del spreadsheet.
- Con nombreHoja: procesa solo esa hoja puntual.

Si ya existía un archivo guardado, esta corrida MEZCLA (no reemplaza): las
hojas no tocadas en esta corrida conservan su valor anterior tal cual;
solo se sobrescribe por completo el bloque de las hojas efectivamente
procesadas ahora (dentro de una hoja procesada, si un encabezado que
antes estaba guardado ya no existe en la hoja, se pierde -- es el
comportamiento esperado: ya no hay columna a la que aplicárselo).

Encabezados duplicados dentro de la misma hoja (dos columnas con el mismo
texto en fila 1): se guarda el ancho de la ÚLTIMA columna con ese texto
(comportamiento simple y predecible, documentado acá porque no hay forma
de distinguir cuál "es cuál" solo por nombre -- si esto es un problema
real en alguna hoja puntual, la solución es no tener encabezados
duplicados, no esta función).

LOG (FIX pedido usuario, esta corrida): por cada hoja procesada, se
compara el ancho NUEVO de cada columna contra el que ya estaba guardado
ANTES de esta corrida. Solo las columnas cuyo ancho cambió cuentan como
"actualizadas" -- una hoja donde ningún ancho cambió respecto al último
guardado no genera línea de log (no se considera una actualización). El
log nunca muestra los píxeles, solo el nombre de la hoja y la cantidad de
columnas con cambios.

@param {string} [nombreHoja] Nombre exacto de una hoja puntual (opcional).
```


### Ubicación: `guardarAnchosColumnasFijos`

#### 04B052 — líneas 1457-1463 (comentario)

```text
FIX (pedido usuario, esta corrida): contadores separados para el LOG de
"qué cambió" -- columnasGuardadas (arriba) sigue contando TODAS las
columnas con encabezado que se escriben en el archivo (igual que antes,
se necesita para el resumen general), pero el log por hoja de acá abajo
ahora reporta solo las columnas cuyo ancho es DISTINTO al que ya estaba
guardado -- una hoja cuyos anchos no cambiaron desde el último guardado
no cuenta como "actualizada" y no aparece en el log.
```

#### 04B053 — líneas 1476-1480 (comentario)

```text
FIX (pedido usuario, excepción "Nuevos"): no escanear más allá del
inicio del historial dinámico de RoyaleAPI en esa hoja puntual -- ver
_limiteColumnasParaAnchoPorEncabezado() y
_aplicarAnchosFijosGridHistorialNuevos() más arriba. Para cualquier
otra hoja, maxColHeader === maxCol (sin cambio de comportamiento).
```

#### 04B054 — líneas 1496-1500 (comentario)

```text
Valores guardados ANTES de esta corrida para esta hoja puntual --
necesarios para comparar y detectar qué columnas cambiaron de ancho
(ver mapaAnteriorHoja[nombreCol] más abajo). {} si la hoja nunca se
había guardado antes -- en ese caso, toda columna encontrada cuenta
como "cambiada" (no había ningún valor previo con el que coincidir).
```

#### 04B055 — líneas 1531-1549 (docblock)

```text
restaurarAnchosColumnasFijos(nombreHoja)
Aplica a la hoja el último ancho guardado por guardarAnchosColumnasFijos(),
emparejando por TEXTO de encabezado -- no por índice -- así, si una
columna se movió de lugar desde que se guardó, igual recibe el ancho
correcto porque la búsqueda es por su encabezado actual, no por su
posición.

- Sin argumento: procesa TODAS las hojas que tengan datos guardados.
- Con nombreHoja: procesa solo esa hoja puntual (debe existir en el
  archivo guardado).

Encabezados de la hoja que no están en lo guardado: se dejan intactos (no
hay ancho guardado para ellos). Encabezados guardados que ya no existen
en la hoja (columna borrada/renombrada desde el guardado): se ignoran
silenciosamente, no generan error.

@param {string} [nombreHoja] Nombre exacto de una hoja puntual (opcional).
```


### Ubicación: `restaurarAnchosColumnasFijos`

#### 04B056 — líneas 1582-1586 (comentario)

```text
FIX (pedido usuario, excepción "Nuevos"): mismo límite que
guardarAnchosColumnasFijos() -- ver _limiteColumnasParaAnchoPorEncabezado().
Sin esto, un "Clan" guardado desde la columna fija NC.CLAN (K) se
aplicaría por error a TODAS las columnas "Clan" repetidas del
historial dinámico, pisando los 120px fijos de esa franja.
```

#### 04B057 — líneas 1609-1612 (comentario)

```text
FIX (pedido usuario): al restaurar la hoja "Nuevos", reaplicar de
paso el ancho fijo por posición del historial dinámico (ver
_aplicarAnchosFijosGridHistorialNuevos()) -- así restaurarAnchosColumnasFijos()
también deja esa franja correcta, no solo autoajustarAnchoColumnas().
```

#### 04B058 — líneas 1629-1678 (docblock)

```text
_clavesColumnasParaAnchos(hoja, filaHeader, limiteGenerico)
Devuelve un array (0-based, una entrada por columna hasta limiteGenerico)
con la "clave" que identifica a cada columna dentro del archivo JSON de
anchos guardados -- normalmente el TEXTO del encabezado real de la hoja
(fila filaHeader), salvo para "Calendario" (ver excepción arriba), donde
la clave es la LETRA de columna (solo dentro de B..J; fuera de ese rango
queda '' y no se guarda/restaura/autoajusta por este sistema).

Centraliza acá la lectura para que guardarAnchosColumnasFijos(),
restaurarAnchosColumnasFijos() y autoajustarAnchoColumnas() usen
exactamente el mismo criterio -- si en el futuro se agrega otra
excepción como esta, alcanza con tocar esta única función.

FIX (17-ago-2026, pedido usuario): "en la hoja Control, los bloques J-V-S-D
(a partir del segundo bloque) importan mal el ancho de columnas" y "el
problema son los bloques de resumen" (Total/%/Prom). CAUSA RAÍZ: hojas
como Control repiten el MISMO texto de encabezado varias veces --
"J"/"V"/"S"/"D" una vez por cada una de las 5 semanas dentro de cada
categoría (Ataques/Puntaje/Puntaje acumulado/Barcos), y además "%"
aparece 2 veces (Ataques % y Puntaje %) y "Total" aparece 2 veces
(Ataques Total y Barcos Total) -- ver CONTROL_METRICAS, 02_Setup_Hojas.gs. Como
el objeto JSON solo puede tener UNA entrada por clave de texto, tanto
guardarAnchosColumnasFijos() como restaurarAnchosColumnasFijos() colisionan:
al guardar, cada nueva columna con el mismo encabezado PISA el ancho que
ya se había guardado para la anterior con ese mismo texto (sobrevive solo
el de la ÚLTIMA columna con ese encabezado en toda la hoja); al restaurar,
esa única entrada se aplica a TODAS las columnas con ese encabezado, sin
distinguir bloque/semana/categoría.

Se corrige acá, de forma genérica (sin necesidad de una excepción dedicada
por hoja, a diferencia de "Calendario"/"Nuevos" arriba): se cuenta cuántas
veces se repite cada texto de encabezado A MEDIDA que se recorren las
columnas de izquierda a derecha, y a partir de la 2da aparición se le
agrega un sufijo numerado a la clave ("J" -> "J", "J#2", "J#3"...). La
PRIMERA aparición de cualquier encabezado conserva su clave tal cual
(compatibilidad con anchos ya guardados de encabezados que nunca se
repiten, como "Vigencia" en Directorio). Como guardarAnchosColumnasFijos()/
restaurarAnchosColumnasFijos()/autoajustarAnchoColumnas() recorren las
columnas siempre en el mismo orden (izquierda a derecha), la Nésima
aparición de un mismo encabezado recibe siempre el mismo sufijo tanto al
guardar como al restaurar, así que cada bloque queda identificado de forma
estable e independiente de los demás.

@param {Sheet} hoja
@param {number} filaHeader Fila 1-based del encabezado real (ver
  _filaEncabezadoParaAnchos()) -- ignorada para "Calendario".
@param {number} limiteGenerico Última columna (1-based) a considerar.
@return {Array<string>} claves por columna, '' donde no aplica.
```


### Ubicación: `_clavesColumnasParaAnchos`

#### 04B059 — líneas 1696-1712 (comentario)

```text
FIX (18-sep-2026, pedido usuario): "si hay más de una fila de
encabezados es porque las superiores tienen celdas combinadas y deja
de reconocer el resto de columnas... una hoja que tiene una celda
combinada A1:C1 y D1:E1 solo guarda los anchos de la columna A y la
columna D, dejando las otras fuera". CAUSA RAÍZ: esto pasaba incluso
ya con filaHeader correcto, en cualquier hoja donde ESA MISMA fila de
encabezado tenga celdas combinadas horizontalmente (ej. el rótulo de
grupo repetido sobre varias columnas) -- getValues() solo devuelve el
texto en la celda "ancla" (arriba/izquierda) de cada rango combinado
y '' en el resto de columnas que ese merge cubre, así que sin este
relleno esas columnas quedaban con clave vacía y se descartaban más
abajo ("columnas sin encabezado no se guardan").

Se corrige de forma genérica para cualquier hoja: se detectan los
merges que tocan esta fila (getMergedRanges()) y se propaga el valor
de la celda ancla de cada uno a TODAS las columnas que abarca, antes
de armar las claves.
```

#### 04B060 — líneas 1725-1727 (comentario)

```text
FIX (17-ago-2026, ver docblock arriba): desambiguar encabezados
repetidos con un sufijo numerado por aparición, en vez de dejar que
colisionen en la misma clave.
```

#### 04B061 — líneas 1740-1752 (comentario)

```text
-----------------------------------------------------------------------
EXCEPCIÓN — hoja "Nuevos", franja dinámica del historial RoyaleAPI
(pedido usuario). Ver _limiteColumnasParaAnchoPorEncabezado() y
_aplicarAnchosFijosGridHistorialNuevos() más abajo para el detalle
completo: a partir de COL_INICIO_GRID_NUEVOS (definida en
14_Nuevos_RoyaleAPI.gs) la fila 3 repite "Clan | Ataques | Fame | Barcos"
una vez por cada bloque de fecha que el userscript de Tampermonkey vaya
agregando (cantidad variable, crece con el tiempo) -- por nombre de
encabezado es ambiguo (mismo texto se repite muchas veces, y "Clan" ahí
NO es la misma columna que NC.CLAN), así que esa franja queda FUERA del
sistema de guardado/restauración/autoajuste por encabezado y se maneja
aparte, con anchos fijos por posición dentro de cada bloque de 4.
-----------------------------------------------------------------------
```

#### 04B062 — líneas 1754-1765 (docblock)

```text
_limiteColumnasParaAnchoPorEncabezado(hoja)
Devuelve la última columna (1-based) que el sistema de guardado/
restauración/autoajuste POR NOMBRE DE ENCABEZADO debe considerar para
esta hoja. Para la hoja "Nuevos" es COL_INICIO_GRID_NUEVOS - 1 (todo lo
que hay ANTES de que arranque el historial dinámico de RoyaleAPI, incluida
la columna fija NC.CLAN); para cualquier otra hoja, es simplemente
hoja.getMaxColumns() (sin límite especial).

@param {Sheet} hoja
@return {number} Última columna (1-based) a considerar por encabezado.
```

#### 04B063 — líneas 1766-1823 (docblock)

```text
_filaEncabezadoParaAnchos(hoja)
Devuelve la fila (1-based) donde vive el encabezado REAL de esta hoja,
para el sistema de guardado/restauración de anchos por nombre de
encabezado (guardarAnchosColumnasFijos()/restaurarAnchosColumnasFijos()).

FIX (18-sep-2026, pedido usuario -- "revisar que la función de guardado
de ancho de columnas reconozca cuando hay columnas nuevas"): T_Lista/
S_Lista (header de 2 FILAS FUSIONADAS, ver _aplicarHeaderDosFilas(),
02_Setup_Hojas.gs) y CR_Lista (header de 3 FILAS FUSIONADAS, ver
_aplicarHeaderTresFilas()) tenían el mismo problema que Control/
Control_2/Nuevos/T_Control arriba, y no estaban en la lista: como esta
función devolvía fila 1 para las tres, y en la fila 1 de esas hojas el
texto real (rótulos de grupo: "Min_T", "Ataques", "Otros requisitos",
etc.) solo está presente en la PRIMERA columna de cada fusión horizontal
-- getValues() devuelve '' en el resto por el mismo motivo que
_combinarHeaderDosFilas()/_combinarHeaderTresFilas() (05_Backup_CSV.gs)
documentan --, _clavesColumnasParaAnchos() recibía clave vacía para casi
todas las columnas y las descartaba ("columnas sin encabezado no se
guardan"). En la práctica, guardarAnchosColumnasFijos()/
restaurarAnchosColumnasFijos()/autoajustarAnchoColumnas() solo llegaban a
reconocer ~4 columnas de T_Lista/S_Lista/CR_Lista (una por cada grupo:
"Planificación...", "Min_T"/"Min_CR", "Ataques", "Otros requisitos") en
vez de las ~24-31 reales -- cualquier ajuste manual de ancho en el resto
de columnas (incluida una columna nueva como "Barcos") se perdía en cada
Demoler + runAll(), sin ningún error visible.

T_Lista/S_Lista usan fila 2 (el rótulo real y único de cada columna, ej.
"Min_T C1" vive repartido entre fila 1 + fila 2, pero fila 2 ya alcanza
para distinguir columnas entre sí gracias a la desambiguación por
repetición que ya aplica _clavesColumnasParaAnchos() más abajo). CR_Lista
usa fila 3 (mismo criterio: "C1"-"C4" se repite 6 veces en esa hoja, pero
la desambiguación por aparición de _clavesColumnasParaAnchos() ya le da a
cada repetición una clave estable y distinta, igual que ya hacía para los
bloques J/V/S/D de Control).

GENERALIZADA (18-sep-2026, pedido usuario -- "no me refería solo a esas
hojas, hay un montón de hojas nuevas"): la lista fija de arriba (HOJAS_
ENCABEZADO_FILA_3/HOJAS_ENCABEZADO_FILA_2) obligaba a acordarse de tocar
esta función cada vez que se agrega una hoja nueva con encabezado de
varias filas fusionadas -- exactamente el mismo tipo de olvido que causó
el problema con T_Lista/S_Lista/CR_Lista documentado arriba. Se reemplaza
por hoja.getFrozenRows(): TODAS las funciones de setup de este proyecto
ya configuran las filas congeladas para que coincidan exactamente con la
cantidad de filas de encabezado de cada hoja (aplyHeaderStyle() ->
setFrozenRows(1) para encabezado simple; _aplicarHeaderDosFilas() ->
setFrozenRows(2) para T_Lista/S_Lista; _aplicarHeaderTresFilas() y los
setups de Control/Control_2/Nuevos/T_Control -> setFrozenRows(3)), así
que reusar ese mismo valor evita mantener una segunda lista en paralelo:
cualquier hoja nueva con encabezado de n filas queda cubierta automática-
mente en cuanto su setup fija n filas congeladas, sin tocar esta función
de nuevo. Si una hoja no tiene ninguna fila congelada (getFrozenRows()
devuelve 0), se asume encabezado de 1 fila (mismo valor por defecto que
tenía la lista fija).

@param {Sheet} hoja
@return {number} Fila 1-based del encabezado real de esta hoja.
```


### Ubicación: `_limiteColumnasParaAnchoPorEncabezado`

#### 04B064 — líneas 1835-1875 (docblock)

```text
_aplicarAnchosFijosGridHistorialNuevos(hoja, maxCol)
EXCEPCIÓN pedida por el usuario para la hoja "Nuevos": el bloque
"Historial RoyaleAPI (últimas N fechas)" (fila 3, desde la columna
COL_INICIO_GRID_NUEVOS -- hoy X -- en adelante) no tiene una cantidad fija
de columnas -- el userscript de Tampermonkey agrega bloques de 4 columnas
(Clan, Ataques, Fame, Barcos) a medida que RoyaleAPI acumula más fechas de
historial, así que la cantidad real de columnas de este bloque (la "N"
variable del título) cambia con el tiempo.

Como el encabezado "Clan" (y "Ataques"/"Fame"/"Barcos") se repite una vez
POR CADA bloque de fecha -- y ese "Clan" no es el mismo que la columna
fija NC.CLAN --, el guardado/restauración por nombre de encabezado
(guardarAnchosColumnasFijos()/restaurarAnchosColumnasFijos()) no sirve
acá: con encabezados repetidos solo podría guardar el ancho de la ÚLTIMA
columna con ese texto en toda la hoja, pisando a las demás. Por eso esta
franja NUNCA pasa por ese sistema (ver _limiteColumnasParaAnchoPorEncabezado(),
que la excluye) ni por el autoajuste normal: se le aplica directamente un
ancho fijo por POSICIÓN dentro de cada bloque de 4 columnas (offset
0=Clan, 1=Ataques, 2=Fame, 3=Barcos -- mismo orden que OFFN en
14_Nuevos_RoyaleAPI.gs), repitiendo el patrón tantas veces como bloques de
fecha existan ahora mismo en la hoja (hasta maxCol).

Al reaplicarse en CADA corrida de autoajustarAnchoColumnas() (y poder
llamarse aparte, standalone), cubre automáticamente cualquier bloque
nuevo que Tampermonkey haya agregado desde la última vez -- de ahí el
pedido explícito del usuario de aplicar estos anchos "periódicamente" en
vez de una sola vez a mano.

Anchos pedidos por el usuario (píxeles): Clan 120, Ataques 80, Fame 62,
Barcos 72.

No hace nada (devuelve 0) si COL_INICIO_GRID_NUEVOS no está definido
(14_Nuevos_RoyaleAPI.gs no cargado en este proyecto) o si la hoja todavía
no llega a tener columnas en ese rango.

@param {Sheet} hoja Debe ser la hoja "Nuevos" (no se valida el nombre acá,
  lo valida quien llama).
@param {number} maxCol Última columna con datos de la hoja (hoja.getMaxColumns()).
@return {number} Cantidad de columnas a las que se les aplicó ancho fijo.
```


### Ubicación: `_aplicarAnchosFijosGridHistorialNuevos`

#### 04B065 — líneas 1877-1885 (comentario)

```text
FIX (17-ago-2026, pedido usuario): esta función se llama para TODAS las
hojas dentro de autoajustarAnchoColumnas()/restaurarAnchosColumnasFijos(),
pero estaba pensada SOLO para la hoja "Nuevos" -- sin este chequeo,
cualquier otra hoja con columnas suficientes (Directorio, Players, etc.)
caía igual en el loop de abajo y le pisaba el ancho a sus columnas desde
COL_INICIO_GRID_NUEVOS (columna 24 = X) en adelante con el patrón fijo
de Clan/Ataques/Fame/Barcos [120,80,62,72] -- reportado por el usuario:
Directorio!Vigencia (columna X) se restauraba siempre en 120px, y Players
también salía mal desde esa misma columna en adelante.
```

#### 04B066 — líneas 1890-1892 (comentario)

```text
Ancho fijo por posición dentro de cada bloque de 4 columnas, en el
mismo orden que OFFN.CLAN(0)/ATAQUES(1)/FAME(2)/BARCOS(3) en
14_Nuevos_RoyaleAPI.gs -- pedido explícito del usuario.
```

#### 04B067 — líneas 1904-1912 (docblock)

```text
_leerAnchosColumnasGuardados()
Lee (sin modificar) el archivo JSON de anchos fijos desde Drive. Si el
archivo todavía no existe (primera vez que se usa este sistema) o no se
puede leer por cualquier motivo, devuelve un objeto vacío -- nunca lanza
error hacia quien la llama.

@return {Object} { "NombreHoja": { "Encabezado": anchoPx, ... }, ... }
```


### Ubicación: `_leerAnchosColumnasGuardados`

#### 04B068 — líneas 1914-1917 (comentario)

```text
(25-sep-2026, FASE B) Ahora en "Otros" (DRIVE_FOLDER_ID_OTROS) — antes
vivía suelto directo en "JSON". Ver checklist de AVISOS ABIERTOS / FASE
B en 09_API_ClashRoyale.gs. Afecta también a
_escribirAnchosColumnasGuardados(), justo abajo en este mismo archivo.
```

#### 04B069 — líneas 1930-1936 (docblock)

```text
_escribirAnchosColumnasGuardados(datos)
Escribe (reemplazando el contenido completo) el archivo JSON de anchos
fijos en Drive. Crea el archivo si todavía no existe.

@param {Object} datos { "NombreHoja": { "Encabezado": anchoPx, ... }, ... }
```


### Ubicación: `_escribirAnchosColumnasGuardados`

#### 04B070 — líneas 1950-1960 (docblock)

```text
_agruparColumnasContiguas(cols)
Recibe un array de números de columna (1-based, orden ascendente, ej.
[1,2,3,5,6,8]) y devuelve rangos contiguos como pares [inicio,fin]
(ej. [[1,3],[5,6],[8,8]]). Usado por autoajustarAnchoColumnas() para
agrupar columnas autoajustables consecutivas en un solo llamado a
autoResizeColumns(), en vez de uno por columna.

@param {number[]} cols Columnas 1-based en orden ascendente.
@return {number[][]} Array de pares [inicio, fin], ambos inclusive.
```


---


# Archivo 05_Backup_CSV.gs

Sistema de respaldo y sincronización CSV <-> hojas, para todas las hojas del proyecto (`syncAllCSV()`, `respaldarHojasDerivadasCSV()`, restauraciones desde CSV, mapeo de columnas por nombre de encabezado). Los IDs de bloque llevan prefijo `05`.


## Índice de bloques movidos

| ID | Líneas orig. | Ubicación | Resumen |
|---|---|---|---|
| 05B001 | 8-49 | `Cabecera del archivo` | AVISOS ABIERTOS / VERIFICACIONES ABIERTAS |
| 05B002 | 51-88 | `Cabecera del archivo` | Backup JSON de celulares y Sincronización Bidireccional de CSV. |
| 05B003 | 91-97 | `Cabecera del archivo` | NOTA DE REORDEN (23-ago-2026, pedido usuario): las funciones manuales |
| 05B004 | 98-105 | `Cabecera del archivo` | syncClanCSV() |
| 05B005 | 166-172 | `exportarBackupCelulares` | (25-sep-2026, FASE B) ClanSystem_Backup_Celulares.json se escribe ahora |
| 05B006 | 198-213 | `importarDirectorioDesdeCSV` | respaldarHojasRestantesCSV() |
| 05B007 | 216-222 | `respaldarHojasRestantesCSV` | respaldarHojasDerivadasCSV() ahora es reanudable (devuelve false si le |
| 05B008 | 226-231 | `respaldarHojasRestantesCSV` | respaldarIndiceYProtegidasCSV() |
| 05B009 | 234-253 | `respaldarIndiceYProtegidasCSV` | FIX (18-sep-2026, pedido usuario -- "el ID de la hoja de cambio de |
| 05B010 | 260-291 | `respaldarIndiceYProtegidasCSV` | Hojas protegidas (edición manual, se bloquea si se reducen las filas). |
| 05B011 | 298-303 | `respaldarIndiceYProtegidasCSV` | FASE 5 (25-sep-2026, rediseño T_Lista -- ver punto B-bis y comentario |
| 05B012 | 308-322 | `respaldarIndiceYProtegidasCSV` | FASE (07-sep-2026, pedido del usuario): S_Lista es la hoja análoga a |
| 05B013 | 329-332 | `respaldarIndiceYProtegidasCSV` | FIX (12-sep-2026, pedido del usuario): faltaba reaplicar acá también el |
| 05B014 | 337-344 | `respaldarIndiceYProtegidasCSV` | NUEVO (13-sep-2026, pedido del usuario): CR_Lista ya tiene su propio |
| 05B015 | 348-351 | `respaldarIndiceYProtegidasCSV` | NUEVO (16-sep-2026, pedido del usuario): mismo criterio que el |
| 05B016 | 356-381 | `respaldarIndiceYProtegidasCSV` | FIX (07-sep-2026, reportado por el usuario -- "T_Asistencia y T_Control |
| 05B017 | 388-396 | `respaldarIndiceYProtegidasCSV` | RESUELTO (10-sep-2026, pedido usuario -- ver Consolidado_Cambios_ |
| 05B018 | 403-412 | `respaldarIndiceYProtegidasCSV` | FIX (27-sep-2026, pedido del usuario -- ver docblock completo de |
| 05B019 | 420-455 | `respaldarIndiceYProtegidasCSV` | respaldarHojasDerivadasCSV() |
| 05B020 | 459-469 | `respaldarHojasDerivadasCSV` | Hojas protegidas: excluidas de "derivadas" (se respaldan aparte, en |
| 05B021 | 472-538 | `respaldarHojasDerivadasCSV` | Hojas con mecanismo de respaldo DEDICADO en otra función (no se deben |
| 05B022 | 548-550 | `respaldarHojasDerivadasCSV` | Todas las demás hojas del spreadsheet (existentes o nuevas) se tratan |
| 05B023 | 580-582 | `respaldarHojasDerivadasCSV` | CSV Sync Operations |
| 05B024 | 584-599 | `respaldarHojasDerivadasCSV` | syncDirectorioCSV() |
| 05B025 | 600-614 | `respaldarHojasDerivadasCSV` | DC_HEADERS_60_COLS |
| 05B026 | 657-662 | `syncDirectorioCSV` | Los 6 campos de enlaces (WSP/RoyaleAPI/Mazo/Mazo2/CWStats/Render) viven |
| 05B027 | 679-683 | `syncDirectorioCSV` | Cat_disp/Clanes_Admin: se agregan al final, tomadas de Administradores. |
| 05B028 | 710-749 | `syncDirectorioCSV` | syncInactivosCSV() |
| 05B029 | 769-789 | `syncInactivosCSV` | FASE 5 (Lista_de_cambios.md): ANTES, el blindaje bloqueaba CUALQUIER |
| 05B030 | 817-819 | `syncInactivosCSV` | Snapshot de las 31 columnas extra (Nivel, Copas, V_Guerra, Cat_disp, |
| 05B031 | 822-824 | `syncInactivosCSV` | Encabezados de 60 columnas, mismo layout/orden que Directorio (DC) -- |
| 05B032 | 833-843 | `syncInactivosCSV` | FIX (17-ago-2026, mismo bug reportado el 13-ago-2026 — "valores |
| 05B033 | 867-890 | `syncInactivosCSV` | diagnosticoInactivosVsCSV() |
| 05B034 | 934-976 | `diagnosticoInactivosVsCSV` | syncAcumulativosCSV() |
| 05B035 | 978-983 | `syncAcumulativosCSV` | FASE 6 (05-ago-2026, cierre del plan de migración Plantillas -> Menú): |
| 05B036 | 988-990 | `syncAcumulativosCSV` | protegerFechas:true (28-sep-2026, extendido a todas las hojas con Fecha): no se |
| 05B037 | 993-996 | `syncAcumulativosCSV` | Histórico de Guerra por jugador (20_HistorialGuerraJugador.gs) — |
| 05B038 | 1002-1004 | `syncAcumulativosCSV` | Trabajo 0 = syncInactivosCSV() (caso especial: función propia, no una |
| 05B039 | 1041-1082 | `syncAcumulativosCSV` | importarAcumulativosDesdeCSV() |
| 05B040 | 1086-1088 | `importarAcumulativosDesdeCSV` | FASE 6 (05-ago-2026): ver comentario equivalente en syncAcumulativosCSV() |
| 05B041 | 1094-1102 | `importarAcumulativosDesdeCSV` | FASE 4 (25-ago-2026, corrige interpretación anterior): Vetados ahora |
| 05B042 | 1128-1133 | `importarAcumulativosDesdeCSV` | fechaCol: columna 1-based donde vive Fecha en ESTA hoja acumulativa. |
| 05B043 | 1137-1141 | `importarAcumulativosDesdeCSV` | Mapa NOMBRE DE ENCABEZADO -> índice actual, leído del header REAL |
| 05B044 | 1147-1151 | `importarAcumulativosDesdeCSV` | Red de seguridad: si la hoja todavía no tiene encabezado en la |
| 05B045 | 1178-1183 | `importarAcumulativosDesdeCSV` | FIX (18-sep-2026): la fila 1 (encabezado) ya NO se toca acá -- antes |
| 05B046 | 1195-1197 | `importarAcumulativosDesdeCSV` | Mismo formato corto 24h que fija _setupVetados() (02_Setup_Hojas.gs) |
| 05B047 | 1216-1260 | `importarAcumulativosDesdeCSV` | importarExtraDesdeCSV() |
| 05B048 | 1297-1299 | `importarExtraDesdeCSV` | Si el CSV no tenía NADA que restaurar en los 4 (ej. backup viejo, |
| 05B049 | 1312-1344 | `importarExtraDesdeCSV` | corregirFechasComoTextoEnBackups() |
| 05B050 | 1350-1357 | `corregirFechasComoTextoEnBackups` | FIX: Guerra/Guerra_Logs — Fecha es el instante REAL de captura (ligado |
| 05B051 | 1437-1485 | `corregirFechasComoTextoEnBackups` | corregirLinksEndpointsDobleCodificados() |
| 05B052 | 1555-1559 | `corregirLinksEndpointsDobleCodificados` | Resincroniza los CSV en Drive que dependen de las columnas recién |
| 05B053 | 1579-1583 | `corregirLinksEndpointsDobleCodificados` | repararRazonInvalida() |
| 05B054 | 1641-1643 | `repararRazonInvalida` | 4. ClanSystem_Backup_Celulares.json |
| 05B055 | 1661-1680 | `repararRazonInvalida` | syncAllCSV() |
| 05B056 | 1685-1688 | `syncAllCSV` | Guerra ya NO se respalda dentro de updateGuerraSheet() (ver nota ahí, |
| 05B057 | 1745-1747 | `repararFormatoTelefonos` | 3. ClanSystem_Backup_Celulares.json |
| 05B058 | 1768-1770 | `repararFormatoTelefonos` | CSV Helpers (Parser RFC 4180 completo) |
| 05B059 | 1788-1800 | `_encodeCSV` | _cargarExtraColsInactivos() |
| 05B060 | 1803-1807 | `_cargarExtraColsInactivos` | (25-sep-2026, FASE B) ClanSystem_Backup_InactivosExtra.json se lee y se |
| 05B061 | 1818-1851 | `_cargarExtraColsInactivos` | _extraColsInactivosDesdeCsv(tagNorm) |
| 05B062 | 1881-1899 | `_extraColsInactivosDesdeCsv` | _compararInactivosConCSV(ss) |
| 05B063 | 1929-1932 | `_compararInactivosConCSV` | --- 3. Estado actual en Directorio, por Tag (para explicar cada diferencia). |
| 05B064 | 1951-1961 | `_compararInactivosConCSV` | --- 3b. Membresía ACTUAL (en vivo) del clan Vetado, vía el cache de la |
| 05B065 | 1988-1991 | `_compararInactivosConCSV` | No-admin activo en el clan Vetado ahora mismo (confirmado en vivo |
| 05B066 | 2008-2017 | `_compararInactivosConCSV` | _eliminarExtraColsInactivosPorTags(tags) |
| 05B067 | 2045-2054 | `_eliminarExtraColsInactivosPorTags` | FASE 9bis (17-sep-2026, limpieza de código muerto, pedido del usuario): |
| 05B068 | 2056-2095 | `_eliminarExtraColsInactivosPorTags` | _extraerValoresConLinksReales(sh, numRows, numCols, colConHoraForzada) |
| 05B069 | 2096-2105 | `_eliminarExtraColsInactivosPorTags` | _extraerValoresConLinksReales(sh, numRows, numCols, colConHoraForzada, colsFormatoNumerico) |
| 05B070 | 2106-2129 | `_eliminarExtraColsInactivosPorTags` | _extraerValoresConLinksReales(sh, numRows, numCols, colConHoraForzada, colsFormatoNumerico, headerRows) |
| 05B071 | 2130-2140 | `_eliminarExtraColsInactivosPorTags` | _extraerValoresConLinksReales(sh, numRows, numCols, colConHoraForzada, colsFormatoNumerico, headerRows,… |
| 05B072 | 2150-2154 | `_extraerValoresConLinksReales` | NUEVO (13-sep-2026, pedido del usuario -- CR_Lista): mismo criterio |
| 05B073 | 2162-2180 | `_extraerValoresConLinksReales` | Detección de columnas con enlaces por MUESTREO, no por escaneo completo. |
| 05B074 | 2191-2193 | `_extraerValoresConLinksReales` | Columna con enlaces confirmada: recién acá se lee completa con |
| 05B075 | 2200-2217 | `_extraerValoresConLinksReales` | FASE 1 (Lista_de_cambios.md, 18-jul-2026): detección automática de |
| 05B076 | 2229-2231 | `_extraerValoresConLinksReales` | Columna de fecha confirmada: se lee completa con getValues() (SOLO |
| 05B077 | 2244-2250 | `_extraerValoresConLinksReales` | FASE 5 (25-sep-2026, rediseño T_Lista -- ver punto B-bis del docblock |
| 05B078 | 2267-2313 | `_extraerValoresConLinksReales` | _combinarHeaderDosFilas(sh, numCols) |
| 05B079 | 2318-2320 | `_combinarHeaderDosFilas` | Cuenta cuántas veces aparece cada nombre de fila 2 en TODA la hoja -- |
| 05B080 | 2332-2334 | `_combinarHeaderDosFilas` | Compatibilidad con el esquema viejo (columna fusionada |
| 05B081 | 2348-2370 | `_combinarHeaderDosFilas` | _combinarHeaderTresFilas(sh, numCols) |
| 05B082 | 2394-2396 | `_combinarHeaderTresFilas` | Conteo de la combinación rol+leaf (ej. "Miembro\|C1") -- en CR_Lista |
| 05B083 | 2408-2411 | `_combinarHeaderTresFilas` | Columna simple fusionada verticalmente en las 3 filas (no debería |
| 05B084 | 2428-2477 | `_combinarHeaderTresFilas` | _mapaNombreAIdxDesdeHoja(sh, numCols, numFilasHeader) |
| 05B085 | 2495-2520 | `_mapaNombreAIdxDesdeHoja` | _mapearIndicesCSVPorEncabezado(headerCSV, nombreAIdx) |
| 05B086 | 2530-2537 | `_mapearIndicesCSVPorEncabezado` | _reconstruirFilaCSVPorEncabezado(rowCSV, csvIdxAIdx, totalCols) |
| 05B087 | 2548-2589 | `_reconstruirFilaCSVPorEncabezado` | _formatFechaCanonica(dateVal, forzarConHora) |
| 05B088 | 2598-2606 | `_formatFechaCanonica` | _guardarExtraColsInactivosBatch(nuevosPorTag) |
| 05B089 | 2612-2615 | `_guardarExtraColsInactivosBatch` | (25-sep-2026, FASE B) Ahora en "Otros" (DRIVE_FOLDER_ID_OTROS), igual |
| 05B090 | 2631-2691 | `_guardarExtraColsInactivosBatch` | _importarInactivosDesdeCSV(ss) |
| 05B091 | 2715-2720 | `_importarInactivosDesdeCSV` | Mapa CAMPO (clave de DC, ej. 'TAG', 'PERMISO', ...) -> índice REAL |
| 05B092 | 2733-2735 | `_importarInactivosDesdeCSV` | Encabezado: se descarta; _setupInactivos() escribe los encabezados |
| 05B093 | 2791-2799 | `_importarInactivosDesdeCSV` | _insertarColumnaFechaIndice(valores, pos, timestamp) |
| 05B094 | 2855-2861 | `_parseSpanishDate` | FASE 4 (25-ago-2026): formato numérico (epoch ms), usado por Vetados.Fecha |
| 05B095 | 2890-2897 | `_parseSpanishDate` | FIX (hora perdida al re-parsear fechas ya en formato canónico |
| 05B096 | 2917-2922 | `_parseSpanishDate` | _respaldarIndiceCSV(ss) |
| 05B097 | 2923-2953 | `_parseSpanishDate` | _respaldarIndiceCSV(ss) |
| 05B098 | 2968-2970 | `_respaldarIndiceCSV` | Posición (0-based) donde se inserta "Fecha" en el CSV: justo a la |
| 05B099 | 2975-2977 | `_respaldarIndiceCSV` | Sin columna ID todavía no se puede rastrear cambios de ID entre |
| 05B100 | 3004-3007 | `_respaldarIndiceCSV` | Fecha previa por ID (para conservarla en las filas cuyo ID NO cambió). |
| 05B101 | 3039-3042 | `_respaldarIndiceCSV` | El ID cambió (pestaña borrada y recreada con el mismo nombre): se |
| 05B102 | 3080-3105 | `_respaldarIndiceCSV` | _respaldarListaHojasCSV(ss, hojas, protegerContraReduccion, colClaveIdx) |
| 05B103 | 3106-3116 | `_respaldarIndiceCSV` | _respaldarListaHojasCSV(ss, hojas, protegerContraReduccion, colClaveIdx, maxColOverride) |
| 05B104 | 3117-3122 | `_respaldarIndiceCSV` | _colSet(...cols) |
| 05B105 | 3129-3142 | `_colSet` | _respaldarListaHojasCSV(ss, hojas, protegerContraReduccion, colClaveIdx, colsFormatoNumerico) |
| 05B106 | 3143-3157 | `_colSet` | _respaldarListaHojasCSV(ss, hojas, protegerContraReduccion, colClaveIdx, colsFormatoNumerico, colsMinutosASegundos) |
| 05B107 | 3168-3178 | `_respaldarListaHojasCSV` | FIX (08-sep-2026, pedido usuario): T_Lista/S_Lista tienen header de 2 |
| 05B108 | 3194-3196 | `_respaldarListaHojasCSV` | Chequeo adicional por CLAVE (ver comentario del parámetro arriba): |
| 05B109 | 3228-3231 | `_respaldarListaHojasCSV` | Detección automática de texto enriquecido (RichText) con enlaces: |
| 05B110 | 3249-3277 | `_saveCSVToDrive` | syncAcumulativosCSV() |
| 05B111 | 3278-3299 | `_saveCSVToDrive` | _syncUnaAcumulativaCSV(item, forzar) |
| 05B112 | 3314-3316 | `_syncUnaAcumulativaCSV` | Blindaje: solo pisa el CSV si la hoja tiene igual o más filas que el CSV |
| 05B113 | 3336-3346 | `_syncUnaAcumulativaCSV` | PROTECCIÓN DE FECHAS (28-sep-2026, extendida a todas las hojas con Fecha): |
| 05B114 | 3357-3359 | `_syncUnaAcumulativaCSV` | Columna de Fecha en el CSV: se busca por el TEXTO del encabezado de la |
| 05B115 | 3413-3425 | `_syncUnaAcumulativaCSV` | _contarFilasSinFechaRespaldable(valores) |
| 05B116 | 3445-3468 | `_contarFilasSinFechaRespaldable` | LOG DE TAMPERMONKEY EN DRIVE (13-ago-2026, pedido del usuario) |
| 05B117 | 3470-3480 | `TAMPERMONKEY_LOG_MAX_LINEAS` | _logTampermonkeyADrive(boton, resultado, errorTexto) |
| 05B118 | 3529-3535 | `_logTampermonkeyADrive` | _csvEscapeCampo(valor) |

---

## Detalle (texto original, sin cambios)

Cada bloque se copió tal cual estaba en el `.gs` (sin los `//`). Los números de línea son los del archivo ANTES de la limpieza.


### Ubicación: `Cabecera del archivo`

#### 05B001 — líneas 8-49 (comentario)

```text
=============================================================================
AVISOS ABIERTOS / VERIFICACIONES ABIERTAS
-----------------------------------------------------------------------
HECHO (28-sep-2026): _syncUnaAcumulativaCSV() (más abajo en este archivo)
solo comparaba la CANTIDAD de filas de la hoja contra el CSV, nunca su
contenido. Historial_I/S perdió las Fechas de casi todas sus filas (ver
AVISOS ABIERTOS en 24_Historial_Ascensos.gs) y, como conservaba
las mismas filas, la sincronización sobrescribió Backup_Historial_I-S.csv
con la hoja ya dañada.
HECHO (28-sep-2026, segunda tanda, pedido del usuario): la protección se
EXTIENDE a todas las hojas acumulativas con Fecha (Comentarios, Calendario_2,
Guerra_Logs, Historial_I/S, Historial_A/D y Alertas_HistorialGuerra). Regla
nueva, más precisa que la primera versión ("hoja con más filas sin Fecha que
el CSV"), porque esa habría bloqueado el respaldo cada vez que se registrara
legítimamente una fila sin Fecha: ahora se cuentan las filas CON Fecha
respaldable y se bloquea SOLO cuando el CSV tiene más filas con Fecha que la
hoja de las que se explican por filas quitadas a propósito (fusión de
duplicados, borrado manual). Es decir: una fila que se BORRA no bloquea;
una fila que sigue ahí pero PIERDE su Fecha sí bloquea. Agregar filas nuevas
(con o sin Fecha) nunca bloquea. Aplica también con forzar===true y con
permitirReduccion, y si la comprobación falla por un error tampoco se
sobrescribe (se conserva el CSV). La protección está activa por defecto para
todo item con hasFecha:true (se desactiva solo con protegerFechas:false), de
modo que también cubre las llamadas sueltas a _syncUnaAcumulativaCSV() hechas
desde otros archivos (por ejemplo corregirTemporadasFantasma(), en
17_GuerraSheet.gs) sin tener que tocarlos.
PENDIENTE DE DEFINIR (28-sep-2026): las hojas con función de respaldo propia
(Directorio, Guerra -> _syncGuerraCSV(), Inactivos -> syncInactivosCSV()) NO
tienen esta protección; no se pidió y no se revisó su formato de Fecha.
PENDIENTE DE DEFINIR (28-sep-2026): si alguien borra o cambia A PROPÓSITO la
Fecha de una fila existente (sin borrar la fila), el respaldo de esa hoja
queda bloqueado con [ALERTA PROTECCIÓN] hasta restaurar la fecha o hasta que
se decida qué mecanismo manual usar para aceptar la pérdida.
PENDIENTE DE VERIFICAR: no se pudo probar en Apps Script real.
HECHO (2-oct-2026, pregunta 51, hoja Battlelogs): respaldarHojasDerivadasCSV()
excluye ahora la hoja 'Battlelogs' del respaldo genérico (ver el comentario
justo encima de hojasConRespaldoDedicado). Esa hoja es una vista que se
reconstruye DESDE Backup_Battlelogs.csv (07_Battlelogs_Hoja.gs); el CSV es la
fuente y NUNCA debe regenerarse desde la hoja. ADVERTENCIA PARA QUIEN EDITE ESTE
ARCHIVO: si se quita 'Battlelogs' de esa lista, el respaldo genérico pisará
Backup_Battlelogs.csv con el contenido (posiblemente viejo) de la hoja.
=============================================================================
```

#### 05B002 — líneas 51-88 (comentario)

```text
=============================================================================
05_Backup_CSV.gs
=============================================================================
Backup JSON de celulares y Sincronización Bidireccional de CSV.
Parser CSV nativo y lectura directa a Drive.

ARCHIVOS CSV EN DRIVE (DRIVE_FOLDER_ID_CSV):
  Backup_Directorio.csv  -> Todas las columnas de la hoja Directorio
  Backup_Clan.csv        -> Todas las columnas de la hoja Clan
                             (Min_G y Min_T ya NO viven en esta hoja: Min_G sale de
                             CR_Lista y Min_T de T_Lista/S_Lista)
  Backup_Guerra.csv      -> Todas las columnas de la hoja Guerra
  ... y el resto de hojas.

POLÍTICA DE TEXTO ENRIQUECIDO (RichText) EN CSV — LEER ANTES DE EDITAR:
  Toda función de este archivo que exporta una hoja a CSV debe usar
  _extraerValoresConLinksReales() (más abajo) en vez de llamar
  directamente a getDisplayValues(). Esa función detecta AUTOMÁTICAMENTE
  cualquier columna que tenga celdas de texto enriquecido con un enlace
  (getLinkUrl()) y guarda en el CSV la URL real, no el texto visible
  ("Link", "Carta", "Mazos", etc.). No existe ninguna lista fija de
  columnas por hoja (el mecanismo anterior, limitado a Cards y
  Administradores, fue reemplazado por esta detección genérica).
  CUALQUIER columna con texto enriquecido que se cree en el futuro, en
  CUALQUIER hoja (existente o nueva), queda cubierta automáticamente sin
  tener que tocar este archivo.

POLÍTICA DE HOJAS NUEVAS — LEER ANTES DE EDITAR:
  respaldarHojasRestantesCSV() ya NO usa una lista fija de nombres de
  hoja para decidir qué se respalda: recorre TODAS las hojas del
  spreadsheet (ss.getSheets()) y genera Backup_<NombreHoja>.csv para cada
  una, excepto las que ya tienen un mecanismo de respaldo dedicado
  (Directorio, Clan, Guerra, Índice y las hojas acumulativas de
  syncAcumulativosCSV) o las protegidas contra reducción de filas
  (Vetados). Por eso, cualquier hoja creada en el futuro (por ejemplo
  mediante _getOrCreateSheet() en 05_Backup_CSV.gs) obtiene su propio CSV de
  respaldo automáticamente, sin necesidad de agregarla a ninguna lista.
=============================================================================
```

#### 05B003 — líneas 91-97 (comentario)

```text
=============================================================================
NOTA DE REORDEN (23-ago-2026, pedido usuario): las funciones manuales
(entry points ejecutables a mano o por trigger) se movieron al inicio del
archivo, en el mismo orden relativo en que aparecian antes. Ninguna tiene una
funcion _continuar... asociada en este archivo. Los helpers "_algo()" que
antes estaban mezclados con ellas siguen debajo, en su mismo orden relativo.
=============================================================================
```

#### 05B004 — líneas 98-105 (docblock)

```text
syncClanCSV()
Sincroniza la hoja Clan completa con Backup_Clan.csv.
Min_G y Min_T ya NO se exportan desde acá (FASE 27, 11/08/2026, y
FASE 8/08/2026 respectivamente) — ambos se definen ahora por clan
fuera de la hoja Clan (Min_G en CR_Lista, categoría Descensos; Min_T
vía T_Lista/S_Lista), cada uno con su propio respaldo/restauración.
```


### Ubicación: `exportarBackupCelulares`

#### 05B005 — líneas 166-172 (comentario)

```text
(25-sep-2026, FASE B) ClanSystem_Backup_Celulares.json se escribe ahora
en "Otros" (DRIVE_FOLDER_ID_OTROS) — antes vivía suelto directo en
"JSON". Ver checklist de AVISOS ABIERTOS / FASE B en 09_API_ClashRoyale.gs.
Esto cierra el hueco temporal que quedó abierto desde la parte 3: la
LECTURA de este mismo archivo en 11_DirectorioSheet.gs ya apuntaba a
"Otros" desde entonces, mientras esta escritura seguía en "JSON" — con
ambas ahora en "Otros", vuelven a encontrarse entre sí.
```


### Ubicación: `importarDirectorioDesdeCSV`

#### 05B006 — líneas 198-213 (docblock)

```text
respaldarHojasRestantesCSV()
Respaldo genérico (CSV completo, ancho/alto variable) para TODAS las
hojas que no tienen ya un mecanismo de respaldo dedicado.

Las hojas derivadas (Nuevos, T_Lista, T_Control, etc.) se guardan SIN
protección de reducción de filas, porque se regeneran completamente
en cada ejecución y es normal que cambien de tamaño.

AUTODETECCIÓN: la lista de "hojas derivadas" ya no está escrita a mano.
Se arma recorriendo ss.getSheets() y excluyendo únicamente las hojas
protegidas y las que ya tienen respaldo dedicado en otra función. Así,
cualquier hoja nueva (ej. "Links", "Players", o cualquier otra que se
cree más adelante) obtiene automáticamente su Backup_<Hoja>.csv la
próxima vez que corra este respaldo, sin tocar este archivo.
```


### Ubicación: `respaldarHojasRestantesCSV`

#### 05B007 — líneas 216-222 (comentario)

```text
respaldarHojasDerivadasCSV() ahora es reanudable (devuelve false si le
faltan hojas por procesar, ver comentario ahí) para poder cortar entre
pasos DENTRO de runAll()/runUpdate() (_ejecutarPorTandas(),
00_Main.gs). Acá, en cambio, se llama fuera de ese motor de tandas
(runSyncCSV() es un botón manual, sin continuación automática), así
que hace falta este bucle para asegurar que TODAS las hojas derivadas
queden respaldadas antes de devolver el control.
```

#### 05B008 — líneas 226-231 (docblock)

```text
respaldarIndiceYProtegidasCSV()
Primera mitad de respaldarHojasRestantesCSV(): Índice (fusión por ID) +
hojas protegidas (Vetados). Separada de respaldarHojasDerivadasCSV() (ver
comentario ahí) para dar un punto de control de presupuesto entre ambas.
```


### Ubicación: `respaldarIndiceYProtegidasCSV`

#### 05B009 — líneas 234-253 (comentario)

```text
FIX (18-sep-2026, pedido usuario -- "el ID de la hoja de cambio de
rango quedó vacío tras Demoler + runAll(), aunque ya lo había llenado
a mano antes de demoler"). CAUSA RAÍZ: todas las llamadas de esta
función (Índice, Vetados, T_Lista, S_Lista + sus dropdowns, CR_Lista +
sus dropdowns, T_Asistencia, S_Asistencia) vivían en una sola secuencia
SIN try/catch propio. demolerTodoElSpreadsheet() llama a esta función
envuelta en UN SOLO try/catch que solo loguea un aviso y sigue borrando
las hojas igual (ver comentario ahí) -- así que si CUALQUIER llamada
anterior a la de CR_Lista fallaba (ej. un error transitorio de Drive/
Sheets al respaldar Índice o Vetados, o al aplicar un dropdown), TODAS
las llamadas posteriores de esta función -- incluida la de CR_Lista --
se saltaban por completo sin dejar ningún log específico, y Demoler
borraba las hojas de todos modos con Backup_CR_Lista.csv desactualizado
(el de la última corrida de runSyncCSV()/runAll() previa, SIN el ID
recién tecleado a mano). Al reconstruirse con runAll(), importarCRListaDesdeCSV()
(26_Torneos_Core.gs) restauraba ese CSV viejo tal cual, sin el ID.
SOLUCIÓN: cada respaldo/dropdown de esta función queda ahora en su
propio try/catch, igual que ya hace demolerTodoElSpreadsheet() con sus
propios pasos -- una falla puntual queda logueada con detalle pero YA
NO bloquea el respaldo de las hojas siguientes en la lista.
```

#### 05B010 — líneas 260-291 (comentario)

```text
Hojas protegidas (edición manual, se bloquea si se reducen las filas).
T_Lista se agrega en la Fase 8: son torneos registrados A MANO (fecha +
link + contraseña), no datos 100% recalculables — mismo criterio que
Vetados: no perder filas si una corrida ve la hoja con menos datos de
los que ya tiene el CSV (ej. justo después de un Demoler).

FIX (17-ago-2026, pedido explícito del usuario: "el código no tiene
permiso para borrar filas de Vetados, eso solo se hace a mano en
Sheets"): Vetados se respalda ahora en su PROPIA llamada, pasando el
4° parámetro colClaveIdx=2 (columna Tag) a _respaldarListaHojasCSV().
Motivo: la protección de conteo de filas (protegerContraReduccion) NO
detecta que se pierdan filas PUNTUALES si al mismo tiempo se agregan
otras nuevas (el total de filas queda igual o sube, así que el chequeo
"lastRow < csvRows" nunca se dispara) — así es como pudieron
desaparecer del Backup_Vetados.csv cuentas vetadas por motivos propios
(no por el clan vetado) sin que ninguna alerta lo marcara: el conteo
total no bajó porque, al mismo tiempo, entraron nuevas cuentas vetadas
por pertenecer al clan vetado. Con colClaveIdx=2, la protección ahora
compara el CONJUNTO de Tags del CSV existente contra el de la hoja
Vetados actual: si falta algún Tag que sí estaba en el CSV, se bloquea
la sobreescritura igual que ante una reducción de filas, sin importar
el total. Ver _respaldarListaHojasCSV() más abajo para el detalle.
T_Lista NO tiene columna Tag en la posición 2 (tiene ID/Tag_Tor), así
que se deja con el chequeo genérico de conteo de filas, sin colClaveIdx.
FIX (25-ago-2026, corrige interpretación anterior): la columna Fecha
(VC.FECHA=13) SÍ se respalda en el CSV, como el resto de columnas —
el pedido explícito fue que no se guarde como texto, sino en formato
numérico (epoch ms). colsFormatoNumerico marca esa columna para que
_extraerValoresConLinksReales() la exporte como número en vez de con el
texto canónico "dd/MM/yyyy HH:mm:ss" que usa por defecto para cualquier
columna de fecha. Ver comentario de _respaldarListaHojasCSV() más abajo
y _parseSpanishDate(), que reconoce ese formato numérico al reimportar.
```

#### 05B011 — líneas 298-303 (comentario)

```text
FASE 5 (25-sep-2026, rediseño T_Lista -- ver punto B-bis y comentario
"FASE 5" en 26_Torneos_Core.gs): Preparación/Duración guardan MINUTOS
como valor real de la celda; colsMinutosASegundos (6° parámetro,
nuevo) hace que _extraerValoresConLinksReales() las exporte en
SEGUNDOS al CSV -- caso especial aislado acá, nunca por NumberFormat,
mismo espíritu que colsFormatoNumerico para columnas de fecha.
```

#### 05B012 — líneas 308-322 (comentario)

```text
FASE (07-sep-2026, pedido del usuario): S_Lista es la hoja análoga a
T_Lista pero para SORTEOS -- también es de carga 100% manual, así que
se respalda con la misma protección contra reducción de filas (sin
colClaveIdx, mismo criterio que T_Lista: no tiene columna Tag en la
posición 2). Se aprovecha este mismo punto -- ya corre dentro de
runAll()/runUpdate()/runSyncCSV() -- para refrescar acá los
desplegables de S_Lista (ID_2 con los ID ya cargados, y Estado fijo):
a diferencia de T_Lista, S_Lista no tiene ningún
"procesarSListaNuevasFilas()" que los reaplique en cada corrida, así
que sin este enganche el desplegable de ID_2 quedaría desactualizado
apenas se cargara un sorteo nuevo a mano.
FIX (08-sep-2026, corrección de desincronización): faltaba reaplicar
acá también Miembro activo y Reacción -- quedaban desactualizados por
el mismo motivo que ID_2/Estado (S_Lista no tiene
"procesarSListaNuevasFilas()" que los reaplique en cada corrida).
```

#### 05B013 — líneas 329-332 (comentario)

```text
FIX (12-sep-2026, pedido del usuario): faltaba reaplicar acá también el
desplegable de WhatsApp, mismo motivo exacto que Miembro activo/
Reacción justo arriba (S_Lista no tiene "procesarSListaNuevasFilas()"
que lo reaplique en cada corrida).
```

#### 05B014 — líneas 337-344 (comentario)

```text
NUEVO (13-sep-2026, pedido del usuario): CR_Lista ya tiene su propio
CSV dedicado -- mismo criterio exacto que S_Lista justo arriba (carga
100% manual, sin colClaveIdx porque no tiene columna Tag en la
posición 2). Se aprovecha este mismo punto para reaplicar el
desplegable de Tipo (Ascenso/Descenso): CR_Lista todavía no tiene
ningún "procesarCRListaNuevasFilas()" que lo reaplique en cada
corrida, mismo motivo por el que S_Lista reaplica acá sus propios
desplegables.
```

#### 05B015 — líneas 348-351 (comentario)

```text
NUEVO (16-sep-2026, pedido del usuario): mismo criterio que el
dropdown de Tipo, justo arriba -- se reaprovecha este mismo punto para
reaplicar también el desplegable de Estado (Planificado/Realizado),
ver _aplicarDropdownEstadoCRLista() (02_Setup_Hojas.gs).
```

#### 05B016 — líneas 356-381 (comentario)

```text
FIX (07-sep-2026, reportado por el usuario -- "T_Asistencia y T_Control
siguen vacíos" incluso después del FIX del 02-sep-2026 que restaura
T_Asistencia desde su CSV si la hoja está vacía). Causa raíz de fondo:
T_Asistencia vivía en el balde genérico de "hojas derivadas"
(respaldarHojasDerivadasCSV(), más abajo), que se respalda SIEMPRE sin
ninguna protección contra reducción de filas -- a diferencia de
Vetados/T_Lista, que sí la tienen. El razonamiento de ese balde
("se regeneran completas en cada corrida, es normal que cambien de
tamaño") es válido para T_Control (100% derivada de T_Asistencia,
barata de reconstruir), pero NO para T_Asistencia: sus datos vienen de
la API de RoyaleAPI para cada torneo, que deja de servir el JSON de un
torneo pasadas unas semanas -- si T_Asistencia se vacía por cualquier
bug (como pasó acá) y justo después corre un respaldo, ese respaldo
sobreescribía Backup_T_Asistencia.csv con un archivo VACÍO, borrando
para siempre la única copia recuperable de esos datos y dejando inútil
a importarTAsistenciaDesdeCSV() (26_Torneos_Core.gs) para cualquier
corrida futura. Se saca T_Asistencia de ese balde (ver el `.indexOf()`
actualizado en respaldarHojasDerivadasCSV(), más abajo en este archivo)
y se respalda acá, con el mismo blindaje que T_Lista/Vetados: si la
hoja tiene MENOS filas que el CSV ya guardado, se salta la
sobreescritura y se deja constancia en el log. colClaveIdx apunta a la
columna ID (TA.ID) en vez de Tag: una fila de T_Asistencia identifica
de forma única a (torneo, jugador), así que lo que de verdad importa
proteger es que ningún ID de torneo completo desaparezca sin que el
conteo total lo refleje (mismo criterio que colClaveIdx=2/Tag en
Vetados, adaptado a la clave real de esta hoja).
```

#### 05B017 — líneas 388-396 (comentario)

```text
RESUELTO (10-sep-2026, pedido usuario -- ver Consolidado_Cambios_
Pendientes_Torneos_Sorteos.md, sección 1, "histórico de ganadores de
sorteos pasados"): S_Asistencia cumple el mismo rol que T_Asistencia
(acumula fila por fila, hoy sin ningún proceso que aún la llene, ver
_setupSAsistencia(), 02_Setup_Hojas.gs), así que se respalda con el
mismo blindaje que T_Asistencia justo arriba: si la hoja tiene MENOS
filas que el CSV ya guardado, se salta la sobreescritura. colClaveIdx
apunta a SA.ID (columna 3, igual que TA.ID en T_Asistencia) -- una
fila de S_Asistencia identifica de forma única a (sorteo, ganador).
```

#### 05B018 — líneas 403-412 (comentario)

```text
FIX (27-sep-2026, pedido del usuario -- ver docblock completo de
importarExtraDesdeCSV() más abajo en este archivo): Extra tiene 4
campos de carga 100% manual (Torneo_Vigente_ID/Sorteo_Vigente_ID/
Ascenso_Vigente_ID/Descenso_Vigente_ID) que no se recalculan solos en
ninguna corrida -- mismo criterio que S_Lista/CR_Lista arriba: se
respalda acá, con protección contra reducción de filas (sin
colClaveIdx, la fila 2 es la única fila de dato de esta hoja), para
que un Demoler seguido de runAll() nunca sobreescriba Backup_Extra.csv
con una fila vacía a mitad de camino, antes de que importarExtraDesdeCSV()
alcance a restaurarla.
```

#### 05B019 — líneas 420-455 (docblock)

```text
respaldarHojasDerivadasCSV()
Segunda mitad de respaldarHojasRestantesCSV(): recorre TODAS las hojas
"derivadas" (sin mecanismo de respaldo dedicado ni protección) y las
guarda en Backup_<Hoja>.csv.

SEPARADA de respaldarIndiceYProtegidasCSV() (16-jul-2026): esta función
puede tocar hojas grandes (ej. Guerra, con miles de filas) y, sumada al
resto de _respaldarListaHojasCSV()/_extraerValoresConLinksReales() de
cada hoja derivada, es la operación más pesada de todo runAll(). Antes
iba junta con syncAllCSV() Y respaldarIndiceYProtegidasCSV() en un solo
paso de PASOS_RUNALL (00_Main.gs): ese bloque combinado murió con
"Exceeded maximum execution time" (límite duro de la plataforma) porque
el chequeo de presupuesto de _ejecutarPorTandas() solo corre ENTRE pasos,
no dentro de uno. Darle su propio paso (ver mismo patrón ya aplicado a
Extra/Clan, Cards/Cards_2 —cuando aún eran hojas— y Guerra/Guerra_Logs)
da un punto de control de presupuesto justo antes de la parte más
costosa. FIX (06-ago-2026): Cards/Cards_2 dejaron de ser hojas del
spreadsheet (ver 31_Cards_Mazos.gs), así que ya no pasan por esta función.

REANUDABLE (17-jul-2026, mismo patrón que _fetchAllClanData() en
09_API_ClashRoyale.gs): aunque cada hoja individual ya es rápida (unos
segundos, tras el fix de _extraerValoresConLinksReales() por muestreo),
hay ~15+ hojas derivadas y este paso arranca casi siempre ya cerca del
borde de RUNALL_PRESUPUESTO_MS (4m45s) — es el último paso pesado de la
corrida. Sumar el tiempo de TODAS las hojas en un solo tirón sin cortes
podía llegar igual al límite duro (6m30s) a mitad de camino. Ahora se
procesa de a una hoja, chequeando el presupuesto propio
(RESPALDO_DERIVADAS_BUDGET_MS) entre cada una; si se agota antes de
terminar, guarda en qué hoja se quedó (ScriptProperties) y devuelve
false para que _ejecutarPorTandas() reintente este MISMO paso en la
próxima continuación, retomando justo donde quedó.
@returns {boolean} true si terminó TODAS las hojas derivadas, false si
         quedó incompleto (presupuesto interno agotado) y hay que
         reintentar el mismo paso.
```


### Ubicación: `respaldarHojasDerivadasCSV`

#### 05B020 — líneas 459-469 (comentario)

```text
Hojas protegidas: excluidas de "derivadas" (se respaldan aparte, en
respaldarIndiceYProtegidasCSV()).

FIX (06-ago-2026): se quita CFG.SHEETS.CARDS_2 de esta lista. Cards_2
ya no es una hoja del spreadsheet (ver _limpiarHojasCardsObsoletas(),
04_Formato_Comun.gs, y updateCards2Sheet(), 04_Formato_Comun.gs): esa función ahora
escribe el merge directo sobre Backup_Cards_2.csv, sin pasar por una
hoja intermedia, así que el problema que esta protección resolvía (una
hoja vacía puntual pisando un CSV bueno) ya no puede ocurrir por este
camino. Sigue habiendo protección para Vetados, que sí sigue siendo una
hoja real de edición manual.
```

#### 05B021 — líneas 472-538 (comentario)

```text
Hojas con mecanismo de respaldo DEDICADO en otra función (no se deben
duplicar aquí): Directorio (syncDirectorioCSV), Clan (syncClanCSV),
Guerra (_syncGuerraCSV), Índice (_respaldarIndiceCSV, en
respaldarIndiceYProtegidasCSV()) y las hojas acumulativas de
syncAcumulativosCSV().
FASE 6 (05-ago-2026, cierre del plan): se quita CFG.SHEETS.PLANTILLAS
de esta lista — la hoja Plantillas ya no existe.
La hoja Menú también se eliminó: su contenido ya no se guarda en una
hoja sino en el índice de contenido (Indice_Contenido.json en Drive +
caché, ver _getIndiceContenido(), 43_Menu_Dinamico.gs), que se
reconstruye solo desde Drive, Clan y Mensajes. Por eso ya no tiene
respaldo CSV (Backup_Menu.csv) ni figura en esta lista.
FIX (07-sep-2026): se agrega CFG.SHEETS.T_ASISTENCIA -- ahora tiene su
propio respaldo protegido en respaldarIndiceYProtegidasCSV() (ver el
FIX completo ahí), así que debe excluirse de acá para no duplicar el
respaldo (y, sobre todo, para que ya NO pase por el camino sin
protección contra reducción de filas de más abajo). T_Control NO se
agrega: sigue siendo 100% derivada y barata de reconstruir a partir de
T_Asistencia en cuanto esta última tenga datos, así que el blindaje
extra no hace falta ahí.
FIX (09-sep-2026, pedido usuario — Consolidado_Cambios_Pendientes_
Torneos_Sorteos.md, sección 13 "revisar todos los offsets de columnas
que afecten directamente a T_Lista/S_Lista"): faltaba agregar
CFG.SHEETS.S_LISTA acá. Sin esta exclusión, S_Lista quedaba en el
balde genérico de "derivadas" (respaldarHojasDerivadasCSV(), más abajo
en este archivo) A PESAR de que YA se respalda correctamente, con
protección contra reducción de filas y con el header de 2 filas bien
combinado, en respaldarIndiceYProtegidasCSV() (ver línea ~249 más
arriba en este archivo) -- que corre ANTES que el balde de derivadas.
Resultado real: cada corrida de runAll()/runUpdate()/runSyncCSV()
sobreescribía Backup_S_Lista.csv una SEGUNDA vez, ahora tratando la
hoja como si tuviera 1 sola fila de encabezado (headerRows=1 por
defecto, en vez de 2) y SIN protección contra pérdida de filas -- el
backup bueno del sorteo se pisaba en el mismo run con uno corrupto
(encabezado combinado mal, sin blindaje ante una hoja vacía de más).
Mismo criterio que T_LISTA, ya excluida justo abajo por el motivo
análogo (ver el comentario de la FIX de 07-sep-2026, línea ~350).
FIX (10-sep-2026, mismo criterio que T_ASISTENCIA/S_LISTA arriba): se
agrega CFG.SHEETS.S_ASISTENCIA -- ahora tiene su propio respaldo
protegido en respaldarIndiceYProtegidasCSV() (ver el bloque RESUELTO
de más arriba en este archivo), así que debe excluirse de acá para no
duplicar el respaldo ni pasar por el camino sin protección contra
reducción de filas de más abajo.
NUEVO (13-sep-2026, pedido del usuario): se agrega CFG.SHEETS.CR_LISTA
-- mismo motivo exacto que T_LISTA/S_LISTA (comentarios arriba): ya
tiene su propio respaldo protegido, con header de 3 filas bien
combinado, en respaldarIndiceYProtegidasCSV().
FIX (27-sep-2026, pedido del usuario -- ver docblock completo de
importarExtraDesdeCSV() más abajo en este archivo): se agrega
CFG.SHEETS.EXTRA -- mismo motivo exacto que CR_Lista/T_Lista/S_Lista
justo arriba. Extra caía antes en el balde genérico de "derivadas"
(se respaldaba bien, SIN protección contra reducción y SIN ningún
import de vuelta), lo que dejaba sus 4 campos de carga 100% manual
(Torneo_Vigente_ID/Sorteo_Vigente_ID/Ascenso_Vigente_ID/Descenso_
Vigente_ID) sin ninguna forma de recuperarse tras un Demoler. Ahora
tiene su propio respaldo protegido en respaldarIndiceYProtegidasCSV().
NUEVO (2-oct-2026, pregunta 51 -- hoja Battlelogs, ver 07_Battlelogs_Hoja.gs):
se agrega la hoja 'Battlelogs' a esta lista de exclusión. Es una VISTA de solo
lectura que se reconstruye DESDE Backup_Battlelogs.csv, y ese CSV se alimenta
por otro camino (06_Battlelogs_Siembra.gs y _registrarBattlelogEnCsv_(),
09_API_ClashRoyale.gs), nunca desde la hoja. Si 'Battlelogs' quedara en el
balde genérico de "derivadas", este mismo bucle (que usa 'Backup_' + nombre +
'.csv' y SIN protección contra reducción de filas) sobreescribiría
Backup_Battlelogs.csv con lo que tenga la hoja en ese momento: si la hoja está
desactualizada (las descargas agregan filas al CSV sin tocar la hoja), se
perderían batallas que ya no se pueden recuperar. Se escribe el nombre literal
(no CFG.SHEETS) para no tocar 01_Config_Global.gs.
```

#### 05B022 — líneas 548-550 (comentario)

```text
Todas las demás hojas del spreadsheet (existentes o nuevas) se tratan
como "derivadas": se respaldan SIEMPRE, sin protección contra
reducción de filas, porque se regeneran completamente en cada corrida.
```

#### 05B023 — líneas 580-582 (comentario)

```text
---------------------------------------------------------------------------
CSV Sync Operations
---------------------------------------------------------------------------
```

#### 05B024 — líneas 584-599 (docblock)

```text
syncDirectorioCSV()
Guarda en Backup_Directorio.csv el Directorio COMPLETO en formato histórico
de 60 columnas (DC) — no las 29 columnas físicas actuales de la hoja
Directorio (ver Fase 4/DIR_SHEET_COLS en 11_DirectorioSheet.gs). Cada fila
se arma combinando, por Tag, Directorio (29, IC) + Players (31, PC) +
Links (14, LC) vía _leerDirectorioFisicoComoDC() (11_DirectorioSheet.gs) —
se reusa esa función en vez de duplicar la lógica de combinación.

Cat_disp y Clanes_Admin (12/07/2026): la hoja Directorio ya NO tiene estas
2 columnas (ver _setupDirectorio() en 02_Setup_Hojas.gs) — viven solo en
Administradores — pero el CSV de Directorio SÍ debe seguir teniéndolas
(así se pidió), así que se agregan aquí AL FINAL, tomadas de
Administradores por Tag. Filas que no son admin quedan con esas 2
columnas vacías.
```

#### 05B025 — líneas 600-614 (docblock)

```text
DC_HEADERS_60_COLS
Encabezados de las 60 columnas históricas del formato DC (Directorio),
en el mismo orden que el objeto de índices DC (02_Setup_Hojas.gs) --
idéntico al que ya usa migrarDirectorioColumnaPrestamo() (01_Config_Global.gs).

FIX (18-sep-2026, pedido del usuario -- "todas las hojas y sus csv"):
antes este mismo array vivía DUPLICADO a mano en syncDirectorioCSV() (para
Backup_Directorio.csv) y en syncInactivosCSV() (como `headers60`, para
Backup_Inactivos.csv) -- dos copias que había que mantener idénticas y
sincronizadas con DC a la vez. Se deja acá, una sola vez, y ambas
funciones (además de _importarInactivosDesdeCSV(), más abajo, que ahora
lo usa para detectar columnas por NOMBRE en vez de por posición cruda de
DC) lo referencian directamente.
```


### Ubicación: `syncDirectorioCSV`

#### 05B026 — líneas 657-662 (comentario)

```text
Los 6 campos de enlaces (WSP/RoyaleAPI/Mazo/Mazo2/CWStats/Render) viven
ahora físicamente en Links, como RichText con URL real. _leerHojaComoMapaPorTag()
(usada dentro de _leerDirectorioFisicoComoDC()) solo trae el texto visible
("Link","Mazos",...), así que acá se pisan con la URL real por Tag —
mismo criterio que ya aplicaba _extraerValoresConLinksReales() antes de
separar Directorio en Directorio/Players/Links.
```

#### 05B027 — líneas 679-683 (comentario)

```text
Cat_disp/Clanes_Admin: se agregan al final, tomadas de Administradores.
FASE 4 (25-ago-2026): Funciones y Clave (AC.FUNCIONES/AC.CLAVE, nuevas
en Administradores) NO se agregan acá A PROPÓSITO — Backup_Directorio.csv
mantiene el formato histórico de 60 columnas (DC) y, además, Clave es
una contraseña de login: no debe terminar en un CSV de respaldo genérico.
```

#### 05B028 — líneas 710-749 (docblock)

```text
syncInactivosCSV()
Sincroniza la hoja Inactivos (29 columnas reales, incluye Comentario, ver
IC/INACTIVOS_TOTAL_COLS en 05_Backup_CSV.gs) con Backup_Inactivos.csv,
manteniendo el CSV en 60 columnas (mismo layout/orden de 60 columnas que
usa Directorio, ver DC en 02_Setup_Hojas.gs) SIN volver a expandir
físicamente la hoja Inactivos.

ANTES (bug): este respaldo se hacía dentro de syncAcumulativosCSV(), que
pedía un getRange(1,1,lastRow,DIR_TOTAL_COLS) (60 columnas) directamente
sobre la hoja Inactivos. Como la hoja Inactivos ya NO tiene 60 columnas
físicas (se redujo a 28, ver _setupInactivos()), ese getRange de 60
columnas hacía que Sheets expandiera automáticamente la hoja Inactivos de
vuelta a 60 columnas (las columnas extra quedaban vacías) cada vez que
corría el respaldo — deshaciendo la reducción de columnas.

AHORA: esta función lee la hoja Inactivos con su ancho REAL (29 columnas)
usando _extraerValoresConLinksReales() para las 29 columnas propias
(Tag, Nombre, Rango, Fecha_ing, Comentario, etc. — las que la hoja
Inactivos sigue editando/mostrando), y completa las 31 columnas restantes
(Nivel, Copas, V_Guerra, Cat_disp, Clanes_Admin, etc.) leyendo
ClanSystem_Backup_InactivosExtra.json por Tag — el snapshot que se guardó
en el momento en que cada cuenta pasó a Inactivos (ver
_guardarExtraColsInactivosBatch() arriba y _updateInactivos()/
_camposExtraInactivos() en 05_Backup_CSV.gs). Esas 31 columnas NUNCA
se leen de la hoja Inactivos (que ya no las tiene físicamente); si un tag
todavía no tiene snapshot guardado (caso raro: JSON borrado a mano o
cuenta que pasó a Inactivos antes de esta función existir), quedan vacías
como único fallback, pero la información ya capturada nunca se pierde.

NOTA (FIX 17-ago-2026): esta función y _importarInactivosDesdeCSV() (más
abajo en este mismo archivo) usan _esSiNoOVacio() para validar Vetado/
Permiso/Admin (y esRazonValida() para Razón) antes de copiarlos. Ese
helper está definido en 11_DirectorioSheet.gs — no acá — porque Apps
Script comparte un único espacio de nombres global entre todos los .gs
del proyecto, y ese es el mismo criterio que ya usa _getCsvDirMap() /
_reconstruirFilaDCDesdeFisico() / _reconstruirExistingDesdeInactivos()
(11_DirectorioSheet.gs). No se duplica la función acá para que no haya
dos definiciones distintas del mismo criterio en el proyecto.
```


### Ubicación: `syncInactivosCSV`

#### 05B029 — líneas 769-789 (comentario)

```text
FASE 5 (Lista_de_cambios.md): ANTES, el blindaje bloqueaba CUALQUIER
guardado en que la hoja tuviera menos filas que el CSV existente, sin
importar la causa. Un reingreso legítimo a un clan Terna
(_retirarDeInactivosPorReactivacion(), 13_Inactivos_Vetados.gs) saca la
cuenta físicamente de la hoja Inactivos y baja sheetRows; si esa misma
corrida no sumó suficientes cuentas nuevas para compensar, el conteo
quedaba por debajo del CSV y el guardado se bloqueaba SIEMPRE (hasta
que sheetRows volviera a superar csvRows por acumulación), dejando el
CSV atrasado con tags que ya no estaban en la hoja — el síntoma de las
"17 cuentas de diferencia" que reportó la Fase 4.

AHORA: si la hoja tiene menos filas que el CSV, no se bloquea a ciegas.
_compararInactivosConCSV() (compartida con diagnosticoInactivosVsCSV(),
más abajo) explica Tag por Tag cada cuenta que está en el CSV pero ya
no en la hoja, cruzando contra el Directorio actual. Si TODAS esas
diferencias son movimientos legítimos confirmados (reactivación en un
clan trackeado, o paso a Vetados), se guarda igual aunque sheetRows sea
menor que csvRows. Si queda aunque sea UN tag sin explicar (posible
pérdida de datos real, no un reingreso), el guardado se sigue
bloqueando igual que antes, y se loguean los tags concretos para
revisión manual (ver también diagnosticoInactivosVsCSV()).
```

#### 05B030 — líneas 817-819 (comentario)

```text
Snapshot de las 31 columnas extra (Nivel, Copas, V_Guerra, Cat_disp,
Clanes_Admin, etc.), guardado por Tag cuando cada cuenta pasó a
Inactivos. Ver comentario de la función, arriba.
```

#### 05B031 — líneas 822-824 (comentario)

```text
Encabezados de 60 columnas, mismo layout/orden que Directorio (DC) --
ver DC_HEADERS_60_COLS (justo arriba de syncDirectorioCSV(), en este
mismo archivo). Antes este array estaba duplicado a mano acá.
```

#### 05B032 — líneas 833-843 (comentario)

```text
FIX (17-ago-2026, mismo bug reportado el 13-ago-2026 — "valores
numéricos en columnas de texto en Directorio"): esta exportación
copiaba Vetado/Permiso/Admin/Razón crudos desde la hoja física
Inactivos hacia Backup_Inactivos.csv, sin el mismo filtro que ya
tienen _getCsvDirMap()/_construirFila()/_reconstruirFilaDCDesdeFisico()/
_importarInactivosDesdeCSV(). Si por cualquier vía (pegado manual,
corrupción heredada) la hoja física llegara a tener un valor no
Sí/No en esas columnas, este export lo perpetuaba en el CSV — y de
ahí podía volver a entrar al sistema en la siguiente restauración.
Se aplica acá el mismo criterio, por consistencia y defensa en
profundidad, aunque el punto de entrada (import) ya quedó cerrado.
```

#### 05B033 — líneas 867-890 (docblock)

```text
diagnosticoInactivosVsCSV()
FASE 4 (Lista_de_cambios.md): genera el log/reporte de las cuentas de
diferencia entre la hoja Inactivos y Backup_Inactivos.csv que la Fase 4
pedía y que todavía no se había generado.

Usa _compararInactivosConCSV() (compartida con syncInactivosCSV(), ver
Fase 5 en el changelog: desde esa corrección, syncInactivosCSV() ya NO
bloquea el guardado cuando todas las diferencias están explicadas por
reactivación/Vetados — solo bloquea, igual que antes, cuando queda algún
tag sin explicar). Esta función sigue sirviendo para ver el detalle
completo tag por tag, incluidas las diferencias YA explicadas.

Esta función NO modifica nada (ni la hoja, ni el CSV, ni Directorio):
solo compara Tag por Tag la hoja Inactivos actual contra el último
Backup_Inactivos.csv guardado, cruza cada diferencia contra el Directorio
actual para proponer una hipótesis, y deja:
  - Un resumen de conteos en el Logger de ejecución.
  - Un archivo Diagnostico_Fase4_InactivosVsCSV.csv en la misma carpeta de
    Drive que los demás backups (ver _getCsvFolder()), con el detalle
    tag por tag, para poder revisarlo fuera del editor de Apps Script.

Se corre a mano (menú o editor); no forma parte de runAll()/runUpdate().
```


### Ubicación: `diagnosticoInactivosVsCSV`

#### 05B034 — líneas 934-976 (docblock)

```text
syncAcumulativosCSV()
Respalda en CSV la hoja Inactivos (vía syncInactivosCSV()) y las hojas
"acumulativas" con mecanismo de respaldo dedicado (Menú, Comentarios,
Calendario_2, Guerra_Logs, Historial, Ascensos, Alertas_HistorialGuerra).

REANUDABLE (FIX 02-sep-2026, pedido usuario — diagnóstico de timeouts en
runAll(); mismo patrón ya aplicado en respaldarHojasDerivadasCSV(), más
abajo en este archivo, y en el resto de pasos pesados documentados en
CFG.RESPALDO_DERIVADAS_BUDGET_MS/AUTOAJUSTE_ANCHO_BUDGET_MS/
LIMPIAR_LINKS_BUDGET_MS, 01_Config_Global.gs).

CAUSA RAÍZ: este paso corría syncInactivosCSV() + las 7 hojas acumulativas
de un solo tirón, sin ningún punto de control interno propio — a
diferencia de respaldarHojasDerivadasCSV(), que ya reparte su trabajo en
tandas chequeando presupuesto entre cada hoja. El riesgo se agravó el
mismo día: syncInactivosCSV() ahora puede, cuando la hoja Inactivos
encogió respecto al último Backup_Inactivos.csv (reactivaciones/pases a
Vetados en la misma corrida), llamar a _compararInactivosConCSV() — que
lee la hoja Inactivos completa (~993 filas y creciendo), lee TODO el
Directorio sin muestreo, y hace una consulta en vivo a la API
(_fetchClanesBasico(), memoizada pero de hasta 10-15s en frío) para
confirmar membresía del clan Vetado. Sumado a las 7 hojas acumulativas
restantes (Guerra_Logs y Alertas_HistorialGuerra pueden crecer bastante),
todo ese trabajo tenía que caber en un único paso atómico de
_ejecutarPorTandas() — si no entraba, el corte no es una excepción de JS
capturable y no quedaba ningún checkpoint intermedio (mismo síntoma ya
documentado para _restaurarNuevosDesdeCsvDebug(), 14_Nuevos_RoyaleAPI.gs).

SOLUCIÓN: se trata syncInactivosCSV() como el primer "trabajo" de una
lista (junto a las 7 hojas acumulativas de abajo) y se procesa de a un
trabajo por vez, chequeando CFG.ACUMULATIVOS_BUDGET_MS entre cada uno
(ScriptProperties, mismo patrón que respaldarHojasDerivadasCSV()): si se
agota antes de terminar, guarda en qué trabajo se quedó y devuelve
`false` para que _ejecutarPorTandas() reintente este MISMO paso en la
próxima continuación, retomando justo donde quedó (ver el `return`
agregado a este paso en PASOS_RUNALL/PASOS_RUNUPDATE/PASOS_RUNSYNCCSV,
00_Main.gs).

@returns {boolean} true si terminó TODOS los trabajos (Inactivos + las 7
         hojas acumulativas), false si quedó incompleto (presupuesto
         interno agotado) y hay que reintentar el mismo paso.
```


### Ubicación: `syncAcumulativosCSV`

#### 05B035 — líneas 978-983 (comentario)

```text
FASE 6 (05-ago-2026, cierre del plan de migración Plantillas -> Menú):
se quita la entrada de CFG.SHEETS.PLANTILLAS / Backup_Plantillas.csv —
la hoja Plantillas ya no existe.
La entrada de Menú / Backup_Menu.csv también se quitó: la hoja Menú se
eliminó y su contenido vive en el índice de contenido (ver
_getIndiceContenido(), 43_Menu_Dinamico.gs).
```

#### 05B036 — líneas 988-990 (comentario)

```text
protegerFechas:true (28-sep-2026, extendido a todas las hojas con Fecha): no se
sobrescribe el CSV si la hoja perdió Fechas que el CSV sí tiene (ver
_syncUnaAcumulativaCSV()).
```

#### 05B037 — líneas 993-996 (comentario)

```text
Histórico de Guerra por jugador (20_HistorialGuerraJugador.gs) —
nombre de archivo SIN prefijo "Backup_" a propósito, así quedó
confirmado en el diseño (Sección 8 P3 del consolidado). permitirReduccion:true
porque el usuario edita Estado/ValorCorrecto a mano en la hoja.
```

#### 05B038 — líneas 1002-1004 (comentario)

```text
Trabajo 0 = syncInactivosCSV() (caso especial: función propia, no una
entrada de `acumulativos`). Trabajos 1..N = las 7 hojas de arriba, en
orden (trabajo i corresponde a acumulativos[i - 1]).
```

#### 05B039 — líneas 1041-1082 (docblock)

```text
importarAcumulativosDesdeCSV()
Importa CSV a la hoja solo si la hoja está vacía (sin datos).

CASO ESPECIAL Inactivos (ver _importarInactivosDesdeCSV() más abajo):
Backup_Inactivos.csv tiene 60 columnas en formato/orden DC (igual que
Directorio, ver syncInactivosCSV()), pero la hoja Inactivos solo tiene 29
columnas físicas en formato/orden IC (ver INACTIVOS_TOTAL_COLS en
05_Backup_CSV.gs) — y ese orden NO coincide con el de las primeras 29 columnas
del CSV. Por eso Inactivos NO puede pasar por el bucle genérico de abajo
(que reordena por NOMBRE de columna, no por posición cruda de ambos
formatos): se procesa aparte, con su propia función de importación.

FIX (18-sep-2026, pedido del usuario -- "se debe detectar la cantidad de
columnas de los csv para actualizarlas cuando se agrega algo en sheets" /
"me refería a todas las hojas y sus csv, no solo torneos"): el bucle
genérico de abajo (Menú, Comentarios, Calendario_2, Guerra_Logs,
Historial, Ascensos, Vetados, Alertas_HistorialGuerra) hacía
`r.slice(0, numCols)` -- un recorte puramente POSICIONAL, igual que el
bug ya corregido en T_Lista/S_Lista/CR_Lista/T_Asistencia/T_Resoluciones/
S_Asistencia (26_Torneos_Core.gs, ver docblock de
_mapaNombreAIdxDesdeHoja() en este mismo archivo para el caso real que lo
expuso). Si a cualquiera de estas 8 hojas se le agrega una columna nueva
que NO caiga exactamente al final, o si el CSV en Drive quedó desfasado
de una corrida anterior a ese cambio, ese slice() desalineaba columnas en
silencio, sin ningún error visible.

AHORA: cada hoja de este bloque se restaura por NOMBRE de columna, con
los mismos 3 helpers ya usados por Torneos
(_mapaNombreAIdxDesdeHoja()/_mapearIndicesCSVPorEncabezado()/
_reconstruirFilaCSVPorEncabezado(), justo arriba en este archivo): el
mapa nombre->índice se lee del header REAL que setupAllSheets()/_setupX()
ya dejó en la fila 1 de la hoja (esta función corre DESPUÉS de esa
reconstrucción de headers dentro de PASOS_RUNALL, así que ese header ya
refleja cualquier columna agregada en el código actual, aunque el CSV en
Drive sea de antes de agregarla). Además, la fila 1 (encabezado) YA NO se
pisa con el header guardado dentro del propio CSV: solo se limpian y
escriben las filas de DATOS, desde la fila 2 -- mismo criterio que ya usa
_restaurarGuerraDesdeCSVSiVacia() (17_GuerraSheet.gs) con la hoja Guerra,
y que evita que un CSV con un header desactualizado deshaga lo que
setupAllSheets() ya dejó bien.
```


### Ubicación: `importarAcumulativosDesdeCSV`

#### 05B040 — líneas 1086-1088 (comentario)

```text
FASE 6 (05-ago-2026): ver comentario equivalente en syncAcumulativosCSV()
más arriba — se quita CFG.SHEETS.PLANTILLAS / Backup_Plantillas.csv, y
también CFG.SHEETS.MENU / Backup_Menu.csv (hoja Menú eliminada).
```

#### 05B041 — líneas 1094-1102 (comentario)

```text
FASE 4 (25-ago-2026, corrige interpretación anterior): Vetados ahora
importa las 13 columnas completas (VETADOS_TOTAL_COLS), incluyendo
Autor/Vía/Fecha. hasFecha:true + fechaCol:VC.FECHA hace que el bucle
genérico de abajo reconstruya la columna Fecha como objeto Date real
vía _parseSpanishDate() — que ahora reconoce el formato numérico
(epoch ms) en el que _respaldarListaHojasCSV()/_extraerValoresConLinksReales()
exportan esa columna (ver colsFormatoNumerico ahí). El pedido
explícito del usuario fue que Fecha no se guarde como texto, no que
se excluya del respaldo/restauración.
```

#### 05B042 — líneas 1128-1133 (comentario)

```text
fechaCol: columna 1-based donde vive Fecha en ESTA hoja acumulativa.
Antes se asumía columna 2 (newR[1]) para todas — correcto para
Comentarios/Calendario_2/Guerra_Logs/Historial, pero Ascensos tiene
Fecha en ASC.FECHA (8), no en la 2. Sin este campo, al reimportar
desde Backup_Historial_A-D.csv esa columna se quedaba con el texto crudo
del CSV en vez de reconstruirse como objeto Date.
```

#### 05B043 — líneas 1137-1141 (comentario)

```text
Mapa NOMBRE DE ENCABEZADO -> índice actual, leído del header REAL
que setupAllSheets()/_setupX() ya dejó en la fila 1 de esta hoja
(header de 1 sola fila en las 8 hojas de este bloque, a diferencia
de T_Lista/S_Lista/CR_Lista). Ver el docblock de esta función, más
arriba, para el porqué.
```

#### 05B044 — líneas 1147-1151 (comentario)

```text
Red de seguridad: si la hoja todavía no tiene encabezado en la
fila 1 (caso anómalo -- este paso debería correr siempre DESPUÉS
de setupAllSheets() dentro de PASOS_RUNALL), no hay nombres con
los que mapear. Se cae al recorte posicional de antes de este fix
en vez de perder todas las filas en silencio.
```

#### 05B045 — líneas 1178-1183 (comentario)

```text
FIX (18-sep-2026): la fila 1 (encabezado) ya NO se toca acá -- antes
se sobreescribía con parsed[0] (el header guardado DENTRO del CSV),
que puede ser el header VIEJO de una corrida anterior a que se
agregara una columna nueva, pisando lo que setupAllSheets() ya dejó
bien en la fila 1 con el header ACTUAL. Solo se limpian y escriben
las filas de DATOS, desde la fila 2.
```

#### 05B046 — líneas 1195-1197 (comentario)

```text
Mismo formato corto 24h que fija _setupVetados() (02_Setup_Hojas.gs)
para VC.FECHA — el resto de hojas de este bloque usan el formato
largo en español, pero Vetados.Fecha no.
```

#### 05B047 — líneas 1216-1260 (docblock)

```text
importarExtraDesdeCSV()
Restaura, desde Backup_Extra.csv, los 4 campos "Vigente_ID" de la fila 2
de la hoja Extra: Torneo_Vigente_ID, Sorteo_Vigente_ID (columnas 20/21) y
Ascenso_Vigente_ID, Descenso_Vigente_ID (columnas 22/23) -- ver
_setupExtra(), 02_Setup_Hojas.gs.

FIX (27-sep-2026, reportado por el usuario -- "ya había guardado a mano
los 4 campos Vigente_ID de Extra, corrí runSyncCSV() y el CSV sí los
tenía guardados, pero al Demoler y ejecutar runAll() esos campos quedan
vacíos; son los únicos campos de Extra que quedan vacíos").

CAUSA RAÍZ: a diferencia de Índice/Vetados/T_Lista/S_Lista/CR_Lista/
T_Asistencia/S_Asistencia, Extra NUNCA tuvo un import dedicado.
demolerTodoElSpreadsheet() (00_Main.gs) borra la hoja
Extra completa igual que al resto. setupAllSheets() la recrea después
llamando a _setupExtra() (02_Setup_Hojas.gs), pero esa función SOLO
reescribe la fila 1 (encabezados) -- nunca toca la fila 2, así que estos
4 campos quedan vacíos sin que nada los repueble. El resto de columnas
de Extra (Temporada, Semana, Mostrar_T, etc.) no se nota afectado porque
SÍ se recalculan solas en otros pasos de runAll() -- estos 4 campos son
los únicos de carga 100% manual sin ningún escritor automático (salvo
Ascenso_Vigente_ID/Descenso_Vigente_ID, que si acaso se sobreescriben el
primer día de temporada vía _autogenerarParCRListaSiCorrespondeInicio
Temporada(), 26_Torneos_Core.gs -- pero eso no ayuda en medio de
temporada). Backup_Extra.csv sí se generaba bien porque Extra caía en el
balde genérico de "hojas derivadas" (respaldarHojasDerivadasCSV(), más
arriba en este archivo) -- el export nunca fue el problema, faltaba el
import de vuelta.

SOLUCIÓN: mismo patrón que importarCRListaDesdeCSV() (26_Torneos_Core.gs)
-- si la fila 2 YA tiene al menos uno de estos 4 campos completo, no se
toca (no pisa una edición manual reciente ni una corrida en curso). Si
los 4 están vacíos (caso típico: recién post-Demoler), se restauran
desde Backup_Extra.csv. El mapeo es por NOMBRE de encabezado (igual que
el resto de importarXDesdeCSV() del proyecto, ver
_mapearIndicesCSVPorEncabezado() más arriba), así que sigue funcionando
aunque estas columnas se reordenen en el futuro. Solo se tocan las
columnas 20 a 23 -- nunca el resto de la fila 2, que se recalcula por su
cuenta en otros pasos de runAll() y no debe pisarse con un valor viejo
del CSV.

Se llama en el mismo paso "Importar CSV" de PASOS_RUNALL (00_Main.gs),
junto a importarCRListaDesdeCSV().
```


### Ubicación: `importarExtraDesdeCSV`

#### 05B048 — líneas 1297-1299 (comentario)

```text
Si el CSV no tenía NADA que restaurar en los 4 (ej. backup viejo,
anterior a que estas columnas existieran), no tiene sentido escribir 4
celdas vacías -- se deja constancia y se sale sin tocar la hoja.
```

#### 05B049 — líneas 1312-1344 (docblock)

```text
corregirFechasComoTextoEnBackups()
FASE 1 (Lista_de_cambios.md): repara los backups YA GUARDADOS en Drive
cuya columna de fecha quedó grabada como el texto largo en español que
producía getDisplayValues() (ej. "sábado, 18 de julio, 2026 8:14:00
p.m.") en vez de un valor numérico sin ambigüedad — confirmado por
revisión manual en Drive el 18/07/2026 en los 9 archivos de la lista de
abajo (Backup_T_Asistencia.csv y Backup_T_Lista.csv no tenían filas de
datos a esa fecha, pero se incluyen igual por si ya tienen registros).

Esta función es SOLO el arreglo de una vez de lo que ya está en Drive.
La prevención para que esto no se repita está en _extraerValoresConLinksReales()
y _syncGuerraCSV() (ambas en este archivo / 17_GuerraSheet.gs): de ahora
en adelante, cada corrida de sincronización ya graba las fechas
directamente en el mismo formato canónico que esta función escribe acá
(ver _formatFechaCanonica()), así que el próximo respaldarHojasRestantesCSV()/
syncAcumulativosCSV()/_syncGuerraCSV() no vuelve a deshacer esta
corrección ni a reintroducir el texto largo.

MECÁNICA: para cada archivo, busca la(s) columna(s) indicada(s) por
nombre de encabezado, reconstruye la fecha real con _parseSpanishDate()
(ya sabe leer tanto el texto largo en español como 'dd/mm/yyyy') y la
vuelve a escribir con _formatFechaCanonica(). Las celdas vacías o que ya
están en formato canónico (numérico) se dejan intactas — la función es
IDEMPOTENTE, se puede correr más de una vez sin efecto adicional. Las
celdas que no se puedan interpretar como fecha se dejan sin tocar y se
cuentan aparte en el log, para revisión manual puntual.

Es una función de reparación bajo demanda (mismo patrón que
repararRazonInvalida(), justo abajo): no se agrega a runAll()/runUpdate().
NO modifica ninguna hoja del spreadsheet, solo los archivos CSV en Drive.
@returns {Array} resumen por archivo: { fileName, corregidas, noParseadas }
```


### Ubicación: `corregirFechasComoTextoEnBackups`

#### 05B050 — líneas 1350-1357 (comentario)

```text
FIX: Guerra/Guerra_Logs — Fecha es el instante REAL de captura (ligado
al periodIndex vigente en ese momento), nunca debe perder la hora aunque
el valor caiga justo en medianoche. Antes esta función llamaba a
_formatFechaCanonica(fechaObj) sin forzar la hora, igual que para
columnas de "fecha de calendario" puro (T_Lista, Historial, etc.) —
eso dejaba estas dos columnas sin sufijo de hora cuando el Date parseado
ya caía en 00:00:00 (ver mismo criterio que ya usa _syncGuerraCSV(),
17_GuerraSheet.gs, con forzarConHora=true para esta misma columna).
```

#### 05B051 — líneas 1437-1485 (docblock)

```text
corregirLinksEndpointsDobleCodificados()
FASE 9 (Lista_de_cambios.md): repara los enlaces YA GRABADOS en las hojas
Clan y Links que apuntan a un endpoint de la API (CFG.API_BASE) con el "#"
del tag doblemente codificado ("%2523" en vez de "%23").

Causa raíz real (distinta de lo que se sospechaba en el reporte original
de Fase 9): NO era una doble codificación dinámica en tiempo de ejecución
— era un "%2523" escrito a mano, literal, en el código fuente, en el
enlace "Render (players)" de la hoja Clan (10_ClanSheet.gs, columna
CC.RENDER_PLAYERS, enlace del líder de cada clan). Los otros 3 enlaces de
esa misma hoja (RENDER_CLANS/RENDER_MEMBERS/RENDER_RIVERRACE) sí usaban
"%23" correctamente, por eso encodeTag() (01_Config_Global.gs, usado por /clans y
/players en el resto del código) no mostraba el problema. Esto explica el
tag reportado en el log real (#GG8PJ8GC): es (o fue) líder de uno de los
clanes de CFG.TERNA_TAGS.

Corrección aplicada al código fuente (10_ClanSheet.gs línea ~143):
"%2523" -> "%23". De ahora en adelante ningún enlace nuevo se graba mal.
Esta función es SOLO la reparación de los enlaces que ya quedaron
grabados con el error antes del fix, en las 2 hojas que usan CFG.API_BASE
en un RichTextValue (ver makeLink(), 01_Config_Global.gs): Clan (columnas
RENDER_CLANS/RENDER_MEMBERS/RENDER_RIVERRACE/RENDER_PLAYERS, por si
alguna quedó contaminada por otra vía) y Links (columna RENDER, enlace
API de cada jugador, armado en updateDirectorioSheet(), 11_DirectorioSheet.gs).

MECÁNICA: lee cada columna con getRichTextValues() (para no perder el
texto mostrado — nombre del líder, "Link", etc.), y reescribe SOLO la URL
de las celdas cuya URL apunta a CFG.API_BASE y contiene "%2523"
(colapsándolo a "%23" tantas veces como aparezca, mismo criterio que
encodeTag()). Las celdas sin enlace, sin "%2523", o que no apuntan a
CFG.API_BASE (RoyaleAPI, CWStats, WhatsApp, etc.) se dejan sin tocar —
la función es IDEMPOTENTE. No se agrega a runAll()/runUpdate(); se corre
a mano una sola vez para reparar lo ya grabado (mismo patrón que
corregirFechasComoTextoEnBackups(), arriba).

CSV YA GRABADOS EN DRIVE (agregado 19/07/2026): reparar solo las celdas
de la hoja NO alcanza — Backup_Clan.csv (syncClanCSV()) y Backup_Links.csv
(hoja "derivada", respaldada por respaldarHojasDerivadasCSV() vía
_respaldarListaHojasCSV()) se arman leyendo estas mismas columnas con
_extraerValoresConLinksReales(), así que cualquier "%2523" que ya haya
quedado grabado en esos CSV antes de este fix seguiría ahí hasta la
próxima corrida de runAll()/runUpdate(). Por eso, al final de esta
función, si se corrigió al menos una celda en Clan o en Links, se
resincroniza de una vez el CSV correspondiente (mismas funciones que usa
runAll()), para que el archivo en Drive quede corregido en la misma
corrida, sin esperar el próximo ciclo automático.
@returns {Array} resumen por hoja/columna: { hoja, columna, corregidas }
```


### Ubicación: `corregirLinksEndpointsDobleCodificados`

#### 05B052 — líneas 1555-1559 (comentario)

```text
Resincroniza los CSV en Drive que dependen de las columnas recién
corregidas, para que "%2523" no quede pisado en la hoja pero vivo
todavía en el CSV (ver comentario de la función, arriba). Solo se
resincroniza el CSV de la hoja que realmente tuvo correcciones, y solo
si esa hoja existe (mismo chequeo ya hecho más arriba).
```

#### 05B053 — líneas 1579-1583 (docblock)

```text
repararRazonInvalida()
Función de reparación bajo demanda. Limpia valores corruptos heredados
en la columna "Razón" de Directorio y Vetados.
```


### Ubicación: `repararRazonInvalida`

#### 05B054 — líneas 1641-1643 (comentario)

```text
4. ClanSystem_Backup_Celulares.json
(25-sep-2026, FASE B) Ahora en "Otros" (DRIVE_FOLDER_ID_OTROS), igual
que exportarBackupCelulares() más arriba en este archivo.
```

#### 05B055 — líneas 1661-1680 (docblock)

```text
syncAllCSV()
Sincroniza todos los CSV con el estado actual de las hojas.
Incluye: Directorio, Clan, Guerra (via updateGuerraSheet), acumulativos y JSON de celulares.

Función MANUAL/legacy (se corre a mano desde el editor; PASOS_RUNALL/
PASOS_RUNUPDATE/PASOS_RUNSYNCCSV ya NO la llaman, usan sus mismas partes
separadas en pasos individuales — ver comentario FIX en PASOS_RUNALL,
00_Main.gs, para el porqué). No pasa por _ejecutarPorTandas(), así que no
hay continuación automática por trigger si se corta a mitad de camino.

FIX (02-sep-2026): syncAcumulativosCSV() ahora es reanudable y puede
devolver `false` a mitad de sus 8 trabajos (Inactivos + 7 hojas
acumulativas, ver su propio docblock en este mismo archivo). Como esta
función corre síncrona, de una sola vez, no hace falta el mecanismo de
trigger — simplemente se vuelve a llamar hasta que devuelva `true`, así
el llamado manual sigue completando TODOS los trabajos en la misma
ejecución, igual que antes de este fix (solo que ahora en varias
sub-llamadas en vez de una sola, sin punto de control).
```


### Ubicación: `syncAllCSV`

#### 05B056 — líneas 1685-1688 (comentario)

```text
Guerra ya NO se respalda dentro de updateGuerraSheet() (ver nota ahí,
17-jul-2026): se centralizó acá para no repetir la extracción de
getRichTextValues() (lenta sobre el rango completo de Guerra, que
crece cada día) dos veces por corrida.
```


### Ubicación: `repararFormatoTelefonos`

#### 05B057 — líneas 1745-1747 (comentario)

```text
3. ClanSystem_Backup_Celulares.json
(25-sep-2026, FASE B) Ahora en "Otros" (DRIVE_FOLDER_ID_OTROS), igual
que exportarBackupCelulares() más arriba en este archivo.
```

#### 05B058 — líneas 1768-1770 (comentario)

```text
---------------------------------------------------------------------------
CSV Helpers (Parser RFC 4180 completo)
---------------------------------------------------------------------------
```


### Ubicación: `_encodeCSV`

#### 05B059 — líneas 1788-1800 (docblock)

```text
_cargarExtraColsInactivos()
Lee ClanSystem_Backup_InactivosExtra.json y devuelve { Tag -> {campo:valor} }
con las 31 columnas de estadísticas de Players/Links (Nivel, Copas,
V_Guerra, etc.) y Cat_disp/Clanes_Admin — las columnas de Directorio (DC)
que la hoja Inactivos ya NO tiene físicamente (ver IC/INACTIVOS_TOTAL_COLS
en 11_DirectorioSheet.gs) pero que Backup_Inactivos.csv SÍ debe conservar. Comentario
NO forma parte de este snapshot: es un campo propio de Inactivos
(IC.COMENTARIO) y viaja siempre con la hoja física. Se capturan una sola
vez, en el momento en que una cuenta pasa a Inactivos (ver
_updateInactivos()/_camposExtraInactivos() en 02_Setup_Hojas.gs),
porque una vez inactiva ya no se sigue trackeando en la API/Players/Links.
```


### Ubicación: `_cargarExtraColsInactivos`

#### 05B060 — líneas 1803-1807 (comentario)

```text
(25-sep-2026, FASE B) ClanSystem_Backup_InactivosExtra.json se lee y se
escribe ahora en "Otros" (DRIVE_FOLDER_ID_OTROS) — antes vivía suelto
directo en "JSON". Ver checklist de AVISOS ABIERTOS / FASE B en
09_API_ClashRoyale.gs. Afecta también a _eliminarExtraColsInactivosPorTags()
y _guardarExtraColsInactivosBatch(), más abajo en este mismo archivo.
```

#### 05B061 — líneas 1818-1851 (docblock)

```text
_extraColsInactivosDesdeCsv(tagNorm)
NUEVO (24-sep-2026, pedido usuario -- "se debería consultar a sheets
primero, luego al csv y por último al json"): mismo resultado que una
entrada de _cargarExtraColsInactivos()[tag] (las 31 columnas de
estadísticas de Players/Links que la hoja Inactivos ya no tiene
físicamente -- ver _camposExtraInactivos()), pero leído de
Backup_Inactivos.csv en vez de ClanSystem_Backup_InactivosExtra.json.

Por qué el CSV puede ser la fuente principal acá: Backup_Inactivos.csv
SIEMPRE se guarda en formato DC de 60 columnas (ver syncInactivosCSV()
más abajo), con las 31 columnas extra ya fusionadas dentro de la misma
fila -- es el MISMO archivo que _webBuscarFilaInactivosPorTag()
(37_Web_API.gs) ya usa como respaldo de la fila completa cuando la hoja
Inactivos falla del todo. Usarlo también para las columnas extra evita
mantener dos lecturas paralelas (CSV para la fila base, JSON aparte para
las estadísticas) contra dos archivos de Drive distintos.

Por qué el JSON sigue siendo necesario como respaldo: las 31 columnas se
capturan UNA sola vez, en el momento exacto en que una cuenta pasa a
Inactivos (ver _camposExtraInactivos()/_updateInactivos()), y quedan en
ClanSystem_Backup_InactivosExtra.json de inmediato. Backup_Inactivos.csv,
en cambio, recién las recibe en la siguiente corrida de
syncInactivosCSV() -- así que un tag recién movido a Inactivos puede no
estar todavía en el CSV. Para ESE caso puntual, quien llama a esta
función debe caer a _cargarExtraColsInactivos() (ver
_webBuscarFilaInactivosPorTag()).

@param {string} tagNorm - Tag ya normalizado (sin '#', mayúsculas -- ver cleanTag()).
@returns {?Object} {campo: valor} solo con los campos de
  _camposExtraInactivos() que la fila trae con algo (celda no vacía), o
  null si el tag no está en el CSV, su fila no trae ningún dato extra, o
  el CSV no se puede leer.
```


### Ubicación: `_extraColsInactivosDesdeCsv`

#### 05B062 — líneas 1881-1899 (docblock)

```text
_compararInactivosConCSV(ss)
FASE 4/5 (Lista_de_cambios.md): compara Tag por Tag la hoja Inactivos
actual contra el último Backup_Inactivos.csv guardado, y para cada tag
que está en el CSV pero ya no en la hoja, propone una hipótesis cruzando
contra el Directorio actual. Función COMPARTIDA por:
  - diagnosticoInactivosVsCSV() (Fase 4): solo reporta, no modifica nada.
  - syncInactivosCSV() (Fase 5): usa el flag `explicada` de cada
    diferencia para decidir si es seguro guardar el CSV aunque tenga
    menos filas que la hoja (ver esa función, arriba).
@returns {Object} { tagsHoja, tagsCsv, soloEnHoja, soloEnCsv }
  - tagsHoja/tagsCsv: mapas Tag -> Nombre.
  - soloEnHoja: [[tag, nombre], ...] — en Inactivos, todavía no en el CSV.
  - soloEnCsv: [[tag, nombre, hipotesis, explicada], ...] — en el CSV,
    ya no en la hoja. `explicada` (boolean) es true solo cuando la
    hipótesis es un movimiento legítimo CONFIRMADO contra Directorio
    (reactivación en un clan trackeado, o paso a Vetados); false si no
    se pudo confirmar (requiere revisión manual).
```


### Ubicación: `_compararInactivosConCSV`

#### 05B063 — líneas 1929-1932 (comentario)

```text
--- 3. Estado actual en Directorio, por Tag (para explicar cada diferencia).
Directorio ya tiene el mismo layout físico de 29 columnas que Inactivos
(formato IC, ver DIR_SHEET_COLS en 02_Setup_Hojas.gs), así que se lee
con los mismos índices IC.
```

#### 05B064 — líneas 1951-1961 (comentario)

```text
--- 3b. Membresía ACTUAL (en vivo) del clan Vetado, vía el cache de la
API. Necesario porque los NO-admin activos en el clan Vetado
(CFG.VETADO_TAG) nunca se escriben en Directorio (se excluyen a
propósito, ver _construirFilasDirectorio() en 11_DirectorioSheet.gs) —
solo un admin activo en el clan Vetado aparece ahí — y tampoco quedan
reflejados en la hoja Inactivos si ya se cayeron de ella (ver el bug que
esto corrige: no alcanza con mirar hojas ya desactualizadas, hace falta
el dato en vivo). _fetchClanesBasico() es liviano (~10-15s, no llama a
/players) y usa memoización propia: si ya se corrió en esta misma
ejecución (p.ej. como parte de runUpdate()/runAll()), no repite la
consulta.
```

#### 05B065 — líneas 1988-1991 (comentario)

```text
No-admin activo en el clan Vetado ahora mismo (confirmado en vivo
vía API): por diseño no pasa por Directorio. Debería estar en
Inactivos en la próxima corrida de _updateInactivos(); si sigue
faltando después de eso, ahí sí amerita revisión manual.
```

#### 05B066 — líneas 2008-2017 (docblock)

```text
_eliminarExtraColsInactivosPorTags(tags)
Elimina de ClanSystem_Backup_InactivosExtra.json las entradas de los tags
indicados. Se usa cuando una cuenta que estaba en Inactivos vuelve a
estar Activa en un clan Terna: su snapshot de las 31 columnas extra ya se
usó para restaurar los datos en la fila fresca de Directorio (ver
_reconstruirExistingDesdeInactivos()/_retirarDeInactivosPorReactivacion()
en 13_Inactivos_Vetados.gs) y no debe seguir ocupando espacio en el JSON
indefinidamente.
```


### Ubicación: `_eliminarExtraColsInactivosPorTags`

#### 05B067 — líneas 2045-2054 (docblock)

```text
FASE 9bis (17-sep-2026, limpieza de código muerto, pedido del usuario):
se borró _extraerLinksColumnaCSV(sh, lastRow, col) -- reemplazada desde
hace tiempo por la detección genérica de _extraerValoresConLinksReales()
(justo abajo), que cubre cualquier columna de cualquier hoja sin tener
que declararla a mano (a diferencia de esta, pensada solo para una
columna puntual, ej. Administradores). Confirmado con un grep de todo el
proyecto que no le quedaba ningún llamador ni referencia real, solo su
propia definición.
```

#### 05B068 — líneas 2056-2095 (docblock)

```text
_extraerValoresConLinksReales(sh, numRows, numCols, colConHoraForzada)
Lee un rango (desde la fila 1, columna 1) igual que getDisplayValues(),
pero detecta AUTOMÁTICAMENTE cualquier columna que tenga al menos una
celda de texto enriquecido (RichText) con un enlace real (getLinkUrl()).
En esas columnas, cada fila de datos se sobreescribe con la URL real del
enlace (o '' si esa celda puntual no tiene enlace), en vez del texto
visible ("Link", "Carta", "Héroe", "Evolución", "Mazos", etc.).

Reemplaza el mecanismo anterior (colsLinkCards / colsLinkAdm), que
dependía de listas de columnas escritas a mano solo para las hojas Cards
y Administradores. Con esta función, CUALQUIER hoja y CUALQUIER columna
con enlaces de texto enriquecido queda cubierta automáticamente, incluidas
columnas o hojas creadas en el futuro: no hace falta declarar a mano qué
columnas tienen enlaces.

La fila 1 (encabezado) nunca se toca.

FIX (03-ago-2026): esta función detecta columnas de fecha por MUESTREO,
sin saber el nombre/rol de cada columna — así que, hasta ahora, TODAS
las columnas de fecha detectadas se formateaban igual con
_formatFechaCanonica(valor) (sin forzar hora), recortando la hora si el
valor caía justo en medianoche exacta. Eso es correcto para columnas de
calendario puro (ej. Calendario_2), pero incorrecto para una columna
"Fecha" que representa el instante REAL de registro (ej. Guerra_Logs:
ver mismo caso ya corregido para Guerra en _syncGuerraCSV(),
17_GuerraSheet.gs). El nuevo parámetro opcional `colConHoraForzada`
(índice de columna 1-based) le dice a esta función qué columna, SI es de
fecha, debe forzar siempre la hora — el resto de columnas de fecha
detectadas por muestreo siguen con el comportamiento de siempre (recortan
la hora si el valor es medianoche exacta). Si se omite, el comportamiento
es idéntico al de antes (ninguna columna fuerza hora).

@param {Sheet} sh - Hoja de origen.
@param {number} numRows - Número de filas a leer (desde la fila 1).
@param {number} numCols - Número de columnas a leer (desde la columna 1).
@param {number} [colConHoraForzada] - Columna 1-based cuya fecha, si es
       detectada, debe conservar SIEMPRE su hora (aunque sea 00:00:00).
@returns {Array} Matriz de valores lista para _encodeCSV().
```

#### 05B069 — líneas 2096-2105 (docblock)

```text
_extraerValoresConLinksReales(sh, numRows, numCols, colConHoraForzada, colsFormatoNumerico)
@param {Object} [colsFormatoNumerico] Mapa { colIndex(1-based): true } —
  ver _respaldarListaHojasCSV(). Cualquier columna marcada acá que la
  detección automática de fechas (más abajo) identifique como columna de
  Date se exporta como número (epoch ms) en vez del texto canónico
  "dd/MM/yyyy HH:mm:ss" que usan por defecto todas las demás columnas de
  fecha del sistema (Vigencia, Fecha de Comentarios/Ascensos/etc., que NO
  cambian de comportamiento).
```

#### 05B070 — líneas 2106-2129 (docblock)

```text
_extraerValoresConLinksReales(sh, numRows, numCols, colConHoraForzada, colsFormatoNumerico, headerRows)
@param {Object} [colsFormatoNumerico] Mapa { colIndex(1-based): true } —
  ver _respaldarListaHojasCSV(). Cualquier columna marcada acá que la
  detección automática de fechas (más abajo) identifique como columna de
  Date se exporta como número (epoch ms) en vez del texto canónico
  "dd/MM/yyyy HH:mm:ss" que usan por defecto todas las demás columnas de
  fecha del sistema (Vigencia, Fecha de Comentarios/Ascensos/etc., que NO
  cambian de comportamiento).
@param {number} [headerRows=1] FIX (08-sep-2026, pedido usuario —
  T_Lista/S_Lista pasaron a tener un header de 2 FILAS FUSIONADAS, ver
  _aplicarHeaderDosFilas(), 02_Setup_Hojas.gs): por defecto (1, todas las
  demás hojas del proyecto) el comportamiento es idéntico al de siempre —
  fila 1 = encabezado, filas 2..numRows = datos. Si se pasa 2, esta
  función combina las filas 1 y 2 en UN SOLO encabezado plano (vía
  _combinarHeaderDosFilas(), más abajo -- ej. "Min_T" + "C1" =
  "Min_T C1") y trata la fila 2 real de la hoja como parte del header,
  NO como dato: los datos pasan a leerse desde la fila 3. La matriz que
  devuelve esta función SIEMPRE tiene 1 sola fila de encabezado (la
  combinada), sin importar headerRows, para que el CSV resultante tenga
  la misma forma de siempre y _mapearIndicesCSVPorEncabezado()/
  importarTListaDesdeCSV()/importarSListaDesdeCSV() (26_Torneos_Core.gs)
  no necesiten saber nada sobre el header de 2 filas de la HOJA.
```

#### 05B071 — líneas 2130-2140 (docblock)

```text
_extraerValoresConLinksReales(sh, numRows, numCols, colConHoraForzada, colsFormatoNumerico, headerRows, colsMinutosASegundos)
@param {Object} [colsMinutosASegundos] FASE 5 (25-sep-2026, rediseño
  T_Lista) -- ver _respaldarListaHojasCSV(). Mapa { colIndex(1-based):
  true } de columnas NUMÉRICAS (no de fecha) cuyo valor real en la hoja
  son minutos y deben exportarse al CSV multiplicados por 60 (segundos).
  A diferencia de colsFormatoNumerico (que depende de la detección
  automática de columnas Date), esta conversión se aplica siempre que la
  columna esté marcada y la celda tenga un número real -- no hace falta
  detección, porque estas columnas nunca son de fecha.
```


### Ubicación: `_extraerValoresConLinksReales`

#### 05B072 — líneas 2150-2154 (comentario)

```text
NUEVO (13-sep-2026, pedido del usuario -- CR_Lista): mismo criterio
que headerRows===2, pero combinando 3 filas de encabezado en vez de
2 -- ver _combinarHeaderTresFilas() más abajo en este archivo. Las
filas 2 y 3 reales de la hoja (rol y C1-C4) se descartan del
resultado -- no son datos.
```

#### 05B073 — líneas 2162-2180 (comentario)

```text
Detección de columnas con enlaces por MUESTREO, no por escaneo completo.
ANTES (hasta el 17-jul-2026) esta función hacía
sh.getRange(1,1,numRows,numCols).getRichTextValues() sobre TODO el
rango para saber qué columnas tenían enlaces. getRichTextValues() es
muchísimo más lento que getValues()/getDisplayValues() para el mismo
rango (arma un objeto RichTextValue por celda) — sobre una hoja grande
(Guerra con 5000+ filas, Cards_2 con 16000+ filas) ese escaneo completo
podía tardar varios minutos ÉL SOLO, aunque la hoja no tuviera NINGUNA
columna con enlaces (el caso real de Guerra y Cards_2: 0 columnas con
RichText, escaneadas igual en cada corrida).

Como las columnas de enlaces de estas hojas se generan en bloque (si
una fila de esa columna tiene enlace, prácticamente todas lo tienen —
ver Cards/Administradores/Directorio/Pendientes/Clan), basta con
muestrear las primeras filas para saber, por columna, si hace falta el
escaneo completo. Si el muestreo encuentra un enlace en una columna,
RECIÉN ahí se paga el costo de leer esa columna completa con
getRichTextValues() (una sola columna, no la hoja entera) para obtener
la URL real fila por fila.
```

#### 05B074 — líneas 2191-2193 (comentario)

```text
Columna con enlaces confirmada: recién acá se lee completa con
getRichTextValues(), y SOLO esa columna (1 de numCols), no la hoja
entera.
```

#### 05B075 — líneas 2200-2217 (comentario)

```text
FASE 1 (Lista_de_cambios.md, 18-jul-2026): detección automática de
columnas de FECHA, mismo patrón por muestreo que la detección de
enlaces de arriba. ANTES, esta función solo hacía getDisplayValues(),
que para una celda de tipo Date devuelve el texto formateado según el
NumberFormat de la celda — en Vigencia/Fecha (Administradores,
Ascensos, Comentarios, Guerra_Logs, Historial, Mensajes, etc.) ese
formato es el texto largo en español ("dddd, d "de" mmmm"," yyyy
h:mm:ss am/pm", ver _setDateCell()/_formatFechaLargaEs() en
01_Config_Global.gs), así que el CSV quedaba con fechas grabadas como texto
largo dependiente del locale en vez de un valor numérico sin
ambigüedad. AHORA: cualquier columna donde el muestreo encuentre al
menos una celda con un objeto Date real se vuelve a leer completa con
getValues() (no getDisplayValues) y cada celda se reescribe con
_formatFechaCanonica() — mismo texto final para T_Lista/T_Asistencia/
DiaGuerra (que ya usaban 'dd/mm/yyyy', sin cambio real) pero ahora
también para Vigencia/Fecha (que dejan de guardarse como texto largo).
Cubre automáticamente cualquier hoja/columna de fecha futura, sin
declarar nombres a mano, igual que la detección de enlaces de arriba.
```

#### 05B076 — líneas 2229-2231 (comentario)

```text
Columna de fecha confirmada: se lee completa con getValues() (SOLO
esa columna, no la hoja entera) para poder formatear cada celda de
forma canónica, en vez de heredar el texto largo de getDisplayValues().
```

#### 05B077 — líneas 2244-2250 (comentario)

```text
FASE 5 (25-sep-2026, rediseño T_Lista -- ver punto B-bis del docblock
de 26_Torneos_Core.gs y el JSDoc de colsMinutosASegundos más arriba):
conversión especial minutos->segundos, aislada del resto de la
detección automática de arriba (esas columnas nunca son de tipo Date,
así que no pasan por ese bloque). Se lee el valor NUMÉRICO real de la
celda (getValues(), no el texto de getDisplayValues() que ya trae
`valores`) para no depender del separador decimal/miles del locale.
```

#### 05B078 — líneas 2267-2313 (docblock)

```text
_combinarHeaderDosFilas(sh, numCols)
FIX (08-sep-2026, pedido usuario): combina las 2 filas de encabezado de
una hoja con header fusionado (T_Lista/S_Lista, ver
_aplicarHeaderDosFilas(), 02_Setup_Hojas.gs) en un solo array plano, para
usar como fila de encabezado del CSV -- ej. la columna cuya fila 1 dice
"Min_T" (fusionada horizontalmente sobre 4 columnas) y cuya fila 2 dice
"C1"/"C2"/"C3"/"C4" se combina en "Min_T C1"/"Min_T C2"/etc., que es
exactamente el nombre que ya esperan NOMBRE_A_IDX_TL/NOMBRE_A_IDX_SL
(26_Torneos_Core.gs).

FIX (09-sep-2026, pedido usuario — Consolidado_Cambios_Pendientes_
Torneos_Sorteos.md, sección 4-5: estructura exacta A:AC confirmada por
los PDF más recientes): con el header nuevo, TODAS las columnas de
T_Lista/S_Lista tienen ya un nombre real y distinto en la fila 2 (antes,
las columnas "sueltas" como N°/Fecha/ID quedaban fusionadas
VERTICALMENTE entre fila 1 y fila 2 -- la fila 2 quedaba en blanco por
getDisplayValues() para esas columnas, y ESO era la señal para no
prefijar con el grupo). Ahora ninguna columna queda en blanco en la fila
2 -- todas, incluidas N°/Fecha/ID/Semanas/Hora/WhatsApp/Estado/etc.,
quedan agrupadas bajo alguno de los 4-5 rótulos combinados
HORIZONTALMENTE de la fila 1 (ver _setupTLista()/_setupSLista(),
02_Setup_Hojas.gs) -- así que la vieja regla "fila 2 en blanco = columna
simple, sin prefijo" prefijaría por error TODAS las columnas con su
rótulo de grupo completo (ej. "Planificación, registro y modificación de
torneos N°"), rompiendo la compatibilidad con NOMBRE_A_IDX_TL/
NOMBRE_A_IDX_SL (que esperan "N°" a secas) y con cualquier CSV ya
guardado en Drive.

La nueva regla es POR AMBIGÜEDAD, no por si la fila 2 está en blanco: se
prefija con el rótulo de grupo únicamente cuando el nombre de la fila 2
se REPITE en más de un grupo dentro de la misma hoja -- que es
exactamente el caso de "C1"/"C2"/"C3"/"C4" (aparecen una vez por cada
grupo Min_T/Ataques en T_Lista, o Min_S/Ataques/Torneos en S_Lista, y
sin el prefijo del grupo serían indistinguibles entre sí). Cualquier
nombre único dentro de la hoja (N°, Temporada, Semanas, Fecha, Hora, ID,
Tag_Tor, ..., Delta, WhatsApp, Estado, Comentario, etc.) se usa TAL
CUAL, sin prefijo -- mismo resultado final que la regla vieja producía
para esas columnas cuando la fila 2 sí estaba en blanco, así que
NOMBRE_A_IDX_TL/NOMBRE_A_IDX_SL (26_Torneos_Core.gs) y cualquier CSV
viejo con esos mismos nombres simples siguen funcionando sin cambios.

Usa forward-fill sobre la fila 1 para reconstruir el rótulo de grupo en
las columnas 2+ de un grupo fusionado horizontalmente (Sheets solo
guarda el valor en la primera columna de la fusión; getDisplayValues()
devuelve '' en las demás).
```


### Ubicación: `_combinarHeaderDosFilas`

#### 05B079 — líneas 2318-2320 (comentario)

```text
Cuenta cuántas veces aparece cada nombre de fila 2 en TODA la hoja --
solo C1/C2/C3/C4 deberían repetirse (una vez por grupo Min_T/Ataques/
Torneos); cualquier otro nombre es único.
```

#### 05B080 — líneas 2332-2334 (comentario)

```text
Compatibilidad con el esquema viejo (columna fusionada
verticalmente, fila 2 en blanco): se usa el rótulo de grupo tal
cual, como siempre.
```

#### 05B081 — líneas 2348-2370 (docblock)

```text
_combinarHeaderTresFilas(sh, numCols)
NUEVO (13-sep-2026, pedido del usuario -- CR_Lista): mismo objetivo que
_combinarHeaderDosFilas() justo arriba, pero para un encabezado de 3
FILAS FUSIONADAS (ver _aplicarHeaderTresFilas(), 02_Setup_Hojas.gs),
usado por CR_Lista porque Min_CR y Ataques discriminan por CLAN (C1-C4)
Y por ROL (Miembro/Veterano/Colider) al mismo tiempo -- dos niveles de
agrupación en vez de uno.

Mismo criterio de desambiguación POR AMBIGÜEDAD que la función de 2
filas: un nombre de la fila 3 (ej. "C1") que sea único en toda la hoja
se usa tal cual; si se repite, se prueba primero con el prefijo del rol
(fila 2, ej. "Miembro C1") -- pero en CR_Lista ESE combo también se
repite (Miembro/C1 existe una vez bajo "Min_CR" y otra bajo "Ataques"),
así que en ese caso se agrega TAMBIÉN el rótulo de grupo (fila 1),
quedando "Min_CR Miembro C1" / "Ataques Miembro C1", etc. -- únicos en
toda la hoja.

Usa forward-fill sobre las filas 1 y 2 para reconstruir el rótulo de
grupo/rol en las columnas 2+ de un bloque fusionado horizontalmente
(mismo motivo que _combinarHeaderDosFilas(): Sheets solo guarda el valor
en la primera columna de la fusión).
```


### Ubicación: `_combinarHeaderTresFilas`

#### 05B082 — líneas 2394-2396 (comentario)

```text
Conteo de la combinación rol+leaf (ej. "Miembro|C1") -- en CR_Lista
esto también se repite (una vez por grupo Min_CR/Ataques), así que
hace falta un tercer nivel (grupo1) para desambiguar del todo.
```

#### 05B083 — líneas 2408-2411 (comentario)

```text
Columna simple fusionada verticalmente en las 3 filas (no debería
ocurrir en CR_Lista -- _aplicarHeaderTresFilas() siempre llena la
fila 3 -- pero se deja como red de seguridad): usa el rótulo de
grupo tal cual.
```

#### 05B084 — líneas 2428-2477 (docblock)

```text
_mapaNombreAIdxDesdeHoja(sh, numCols, numFilasHeader)
FIX (18-sep-2026, pedido del usuario -- "se debe detectar la cantidad de
columnas de los csv para actualizarlas cuando se agrega algo en sheets"):
hasta ahora, cada importarXDesdeCSV() de 26_Torneos_Core.gs (T_Lista/
S_Lista/CR_Lista/T_Asistencia/T_Resoluciones/S_Asistencia) traía su propio
mapa NOMBRE_A_IDX_* HARDCODEADO -- una copia manual de los mismos nombres
e índices que ya viven en el objeto de índices de la hoja (TL/SL/CR/TA/
TR/SA) y en el header real que escribe el _setupX() correspondiente
(02_Setup_Hojas.gs). Cada columna nueva obligaba a recordar tocar 3
lugares a la vez -- y bastaba con olvidar UNO (este mapa) para que esa
columna quedara "invisible" al restaurar desde CSV, sin ningún error
visible (caso real detectado por el usuario: Barcos ya existía en la hoja
T_Lista y en TL, pero no se había agregado a NOMBRE_A_IDX_TL).

Esta función reemplaza esos mapas hardcodeados: en vez de mantenerlos a
mano, lee el header REAL de la hoja EN ESE MOMENTO (1, 2 o 3 filas
fusionadas, según numFilasHeader) y arma el mapa nombre->índice
directamente desde ahí, vía _combinarHeaderDosFilas()/
_combinarHeaderTresFilas() (justo arriba en este archivo) cuando
corresponde. Así el mapa queda siempre sincronizado con lo que la hoja YA
tiene: agregar una columna nueva solo requiere tocar el objeto de índices
y su _setupX(), como ya se hacía antes -- este mapa se actualiza solo,
sin tocarlo.

FIX (18-sep-2026, ampliación pedida por el usuario -- "me refería a todas
las hojas y sus csv, no solo torneos"): esta función y sus dos
complementos (_mapearIndicesCSVPorEncabezado()/
_reconstruirFilaCSVPorEncabezado(), justo abajo) vivían solo en
26_Torneos_Core.gs. Se trasladan acá, al archivo central de respaldo/
restauración de TODAS las hojas del proyecto, para que
importarAcumulativosDesdeCSV() e importarIndiceDesdeCSV() (04_Indice_
Sheet.gs) puedan reutilizarlas también, en vez de reimplementar la misma
lógica de detección de columnas por nombre en cada archivo. Apps Script
comparte un único espacio de nombres global entre todos los .gs del
proyecto, así que este traslado no requiere ningún cambio en los
llamadores existentes de 26_Torneos_Core.gs.

Los alias de compatibilidad para nombres de encabezado VIEJOS (de una
columna ya RENOMBRADA, ej. 'ID' -> 'ID [1]') siguen agregándose a mano
sobre el resultado de esta función en cada importarXDesdeCSV() -- esos sí
necesitan intervención manual, porque un nombre viejo ya no existe en
ningún lado de la hoja actual como para detectarlo solo.

@param {Sheet} sh
@param {number} numCols
@param {number} [numFilasHeader] 1 (default), 2 o 3 -- filas de
  encabezado fusionadas de la hoja.
@returns {Object} mapa {'Nombre Encabezado': índice 1-based}.
```


### Ubicación: `_mapaNombreAIdxDesdeHoja`

#### 05B085 — líneas 2495-2520 (docblock)

```text
_mapearIndicesCSVPorEncabezado(headerCSV, nombreAIdx)
FIX (07-sep-2026, pedido usuario — "eso se debe prever para evitar fallos
en la reconstrucción"): helper compartido por toda función
importarXDesdeCSV() del proyecto para que un restore desde CSV viejo
NUNCA dependa de que el orden de columnas de la hoja real siga siendo el
mismo que cuando ese CSV se generó. Caso real que expuso el problema:
Premios se reordenó en T_Lista (de posición 14 a 12) y un restore
posicional puro habría desalineado Premios/Link_app/Link_json en
silencio, sin ningún error visible — ver el docblock de
importarTListaDesdeCSV() (26_Torneos_Core.gs) para el detalle completo de
cómo eso rompía T_Asistencia/T_Control en cadena.

Dado el encabezado de un CSV (su fila 1 — _extraerValoresConLinksReales(),
justo arriba en este archivo, siempre la incluye) y un mapa
NOMBRE_DE_COLUMNA -> índice (1-based) ACTUAL de esa columna en la hoja,
devuelve un array donde la posición i (0-based, columna i del CSV) indica
a qué índice corresponde HOY esa columna, según su NOMBRE — no según la
posición que tenía en el CSV. Una columna del CSV cuyo nombre ya no
exista en el mapa (ej. una columna eliminada en el pasado) devuelve null
ahí y se ignora al reconstruir filas.

@param {Array<string>} headerCSV - fila 1 del CSV ya parseado.
@param {Object} nombreAIdx - mapa {'Nombre Encabezado': índice 1-based}.
@returns {Array<number|null>} índice destino por cada columna del CSV.
```


### Ubicación: `_mapearIndicesCSVPorEncabezado`

#### 05B086 — líneas 2530-2537 (docblock)

```text
_reconstruirFilaCSVPorEncabezado(rowCSV, csvIdxAIdx, totalCols)
Complemento de _mapearIndicesCSVPorEncabezado(): reordena una fila del CSV
(array plano, orden viejo) hacia el orden ACTUAL de la hoja, usando el
mapeo por nombre ya calculado. Columnas de la hoja actual sin match en
esta fila del CSV (ej. una columna agregada DESPUÉS de que ese CSV se
generó) quedan como '' en vez de romper el resto del mapeo.
```


### Ubicación: `_reconstruirFilaCSVPorEncabezado`

#### 05B087 — líneas 2548-2589 (docblock)

```text
_formatFechaCanonica(dateVal, forzarConHora)
FASE 1 (Lista_de_cambios.md): formato de fecha ÚNICO y sin ambigüedad
para grabar en CUALQUIER backup CSV, en reemplazo del texto largo en
español que producía getDisplayValues() sobre celdas con el NumberFormat
'dddd, d "de" mmmm"," yyyy h:mm:ss am/pm' (ej. "sábado, 18 de julio,
2026 8:14:00 p.m."). Ese texto depende del locale/idioma y no es
directamente parseable sin _parseSpanishDate(); el formato de acá es
puramente numérico:
  - Sin componente de hora (medianoche exacta — caso de DiaGuerra,
    T_Lista, T_Asistencia, Calendario_2, que ya usaban 'dd/mm/yyyy'):
    'dd/MM/yyyy'.
  - Con hora (caso de Vigencia/Fecha en Administradores, Ascensos,
    Comentarios, Guerra, Guerra_Logs, Historial, Mensajes):
    'dd/MM/yyyy HH:mm:ss' (24 horas, sin am/pm).
Huso horario fijo 'America/Lima', igual que _formatFechaLargaEs(), para
no depender de la zona horaria del proyecto de Apps Script.
Usada por _extraerValoresConLinksReales() (arriba) y por _syncGuerraCSV()
(17_GuerraSheet.gs) para que TODA fecha exportada a CSV, presente o
futura, quede en este mismo formato — así se evita que el problema de
Fase 1 se repita. También la usa corregirFechasComoTextoEnBackups()
(más abajo) para reparar los CSV ya guardados en Drive.

FIX (03-ago-2026): antes, el criterio para decidir si se incluye la hora
era puramente el VALOR (si horaStr==='00:00:00', se asumía que ese campo
era "de calendario" y se recortaba a solo fecha) — sin importar qué
columna era. Eso funciona bien para DiaGuerra (que SIEMPRE es medianoche,
por diseño), pero es incorrecto para Fecha (Guerra/Guerra_Logs): Fecha es
el instante REAL en que se registró la fila (ctx real de captura, ligado
al periodIndex vigente en ese momento — que a su vez cambia pasadas las
4-5am, no a medianoche), así que aunque coincidiera justo con las 00:00:00
de casualidad, igual debe conservar su hora real. El nuevo parámetro
opcional `forzarConHora` permite que el LLAMADOR (no el valor) decida esto
según la columna: los llamados sobre Fecha de Guerra/Guerra_Logs pasan
`true`; los llamados sobre DiaGuerra (y el resto de columnas de solo
fecha) no lo pasan, y conservan el comportamiento de siempre.
@param {*} dateVal - Valor de la celda. Si no es un objeto Date válido,
       se devuelve '' (no se inventa una fecha).
@param {boolean} [forzarConHora] - Si es true, SIEMPRE se incluye
       'HH:mm:ss', incluso si el valor cae justo en medianoche exacta.
@returns {string}
```


### Ubicación: `_formatFechaCanonica`

#### 05B088 — líneas 2598-2606 (docblock)

```text
_guardarExtraColsInactivosBatch(nuevosPorTag)
Fusiona nuevosPorTag { Tag -> {campo:valor} } con lo que ya había en
ClanSystem_Backup_InactivosExtra.json. NUNCA borra un tag existente que no
venga en nuevosPorTag: así no se pierde la última información conocida de
un inactivo aunque desaparezca de dirData en una corrida futura (mismo
criterio de "protección anti-borrado" que usa _updateInactivos() para la
hoja Inactivos).
```


### Ubicación: `_guardarExtraColsInactivosBatch`

#### 05B089 — líneas 2612-2615 (comentario)

```text
(25-sep-2026, FASE B) Ahora en "Otros" (DRIVE_FOLDER_ID_OTROS), igual
que _cargarExtraColsInactivos() más arriba en este archivo. Con esto
quedan las 4 funciones de este archivo (Celulares + InactivosExtra)
apuntando a "Otros"; cierra la parte 6 del checklist de FASE B.
```

#### 05B090 — líneas 2631-2691 (docblock)

```text
_importarInactivosDesdeCSV(ss)
Restaura la hoja Inactivos (29 columnas propias, formato IC, incluye
Comentario) desde Backup_Inactivos.csv (60 columnas, formato/orden DC —
igual layout que Directorio, ver syncInactivosCSV() más arriba), solo si
la hoja está vacía.

BUG ANTERIOR: esta hoja se importaba junto con el resto de "acumulativos"
en un bucle genérico que solo hacía row.slice(0, 28) sobre la fila cruda
del CSV de 60 columnas. Como el orden de columnas del CSV (DC, igual que
Directorio) NO coincide con el de las columnas propias de Inactivos
(IC — por ejemplo, columna 8 del CSV es "Permiso" pero columna 8 de
Inactivos es "Clan"), ese slice() copiaba cada valor a la columna
equivocada. Además, al pasar numCols=DIR_TOTAL_COLS (60) para el chequeo
de expansión de columnas, la hoja Inactivos se re-expandía físicamente a
60 columnas (deshaciendo la reducción de columnas, el mismo bug de
expansión que ya se había corregido del lado de syncInactivosCSV(), pero
en sentido inverso: ahora en la importación en vez del respaldo).

AHORA: se lee el CSV de 60 columnas y, fila por fila, se proyecta a las
29 columnas de Inactivos usando el mapeo IC<-DC (inverso exacto de
syncInactivosCSV()): fila29[IC.campo-1] = filaCsv[DC.campo-1]. Las 31
columnas del CSV que NO forman parte de IC (Nivel, Copas, V_Guerra,
Cat_disp, Clanes_Admin, etc. — Comentario YA forma parte de IC, no de
este grupo) se guardan aparte, por Tag, en
ClanSystem_Backup_InactivosExtra.json (mismo mecanismo que usa
_updateInactivos() en 13_Inactivos_Vetados.gs al mandar una cuenta a
Inactivos), para no perder esa información aunque la hoja Inactivos
nunca la muestre. La hoja se escribe con su ancho real (29 columnas), sin
tocar sh.getMaxColumns() con un numCols de 60, así que no se re-expande.

FIX (17-ago-2026, mismo bug reportado el 13-ago-2026 — "valores numéricos
en columnas de texto en Directorio", visto en Permiso/Admin/Vetado): el
mapeo fila29[IC.campo-1] = rCsv[DC.campo-1] copiaba el valor del CSV tal
cual, sin ningún filtro — a diferencia de _getCsvDirMap() (07_Directorio
Sheet.gs), que sí quedó parchada el 13-ago-2026 con _esSiNoOVacio(). Si
Backup_Inactivos.csv traía un valor corrupto heredado en Permiso/Admin/
Vetado (p.ej. porque se exportó con _reconstruirFilaDCDesdeFisico() antes
de que esa función también se parchara, ver 11_DirectorioSheet.gs), ese
valor entraba intacto a la hoja Inactivos — y de ahí, al reactivarse la
cuenta (_reconstruirExistingDesdeInactivos() -> _construirFila()), podía
o no quedar filtrado según el camino exacto. Ahora se aplica el mismo
criterio _esSiNoOVacio()/esRazonValida() que usa el resto del sistema,
así el hueco queda cerrado en el punto de entrada del CSV, sin depender
de que un filtro más adelante en la cadena lo atrape.

FIX (18-sep-2026, pedido del usuario -- "todas las hojas y sus csv, no
solo torneos"): el mapeo fila29[IC.campo-1] = rCsv[DC[campo]-1] asumía
ciegamente que el CSV en Drive tiene EXACTAMENTE el mismo orden de
columnas que el objeto DC vigente en el código actual -- mismo patrón de
bug que T_Lista/Ascensos (ver docblock de _mapaNombreAIdxDesdeHoja(), más
arriba en este archivo). Si en el futuro se agrega una columna nueva a
Directorio/DC y Backup_Inactivos.csv en Drive queda desactualizado (de
antes de ese cambio), esta lectura posicional desalinearía columnas en
silencio. Ahora, en vez de descartar el header del CSV (parsed[0]) sin
mirarlo, se usa para ubicar cada campo por su NOMBRE literal (vía
DC_HEADERS_60_COLS, que da el nombre de encabezado que le corresponde a
cada campo de DC): un campo cuyo nombre no aparezca en ese header (CSV
viejo, de antes de que ese campo existiera) queda simplemente vacío, en
vez de leer el valor de otra columna por error.
```


### Ubicación: `_importarInactivosDesdeCSV`

#### 05B091 — líneas 2715-2720 (comentario)

```text
Mapa CAMPO (clave de DC, ej. 'TAG', 'PERMISO', ...) -> índice REAL
(0-based) en ESTE CSV, resuelto por el NOMBRE literal de encabezado
que le corresponde a cada campo (DC_HEADERS_60_COLS está en el mismo
orden que DC) buscado dentro del header que el propio CSV trae en su
fila 1 -- no por la posición que DC dice hoy. Ver el FIX (18-sep-2026)
del docblock de esta función para el porqué.
```

#### 05B092 — líneas 2733-2735 (comentario)

```text
Encabezado: se descarta; _setupInactivos() escribe los encabezados
propios de 29 columnas más abajo. Ya se usó arriba (headerCsv)
para armar idxEnCsvPorCampo antes de llegar acá.
```

#### 05B093 — líneas 2791-2799 (docblock)

```text
_insertarColumnaFechaIndice(valores, pos, timestamp)
Helper de _respaldarIndiceCSV(): inserta la columna "Fecha" en la
posición 0-based `pos` de cada fila de `valores` (encabezado incluido),
usando `timestamp` (numérico, Date.now()) como valor para TODAS las
filas de datos. Se usa solo en los casos donde no hay CSV previo con el
que fusionar (CSV inexistente, o sin columna ID), así que toda fila
cuenta como "nueva" y recibe la misma Fecha.
```


### Ubicación: `_parseSpanishDate`

#### 05B094 — líneas 2855-2861 (comentario)

```text
FASE 4 (25-ago-2026): formato numérico (epoch ms), usado por Vetados.Fecha
(VC.FECHA, ver colsFormatoNumerico en _respaldarListaHojasCSV()/
_extraerValoresConLinksReales()) — pedido explícito: guardar esa fecha
como número, no como texto. 10-13 dígitos cubre epoch ms desde el año
2001 en adelante (13 dígitos) y deja margen por si algún día se guarda
en segundos en vez de milisegundos (10 dígitos); cualquier otra
cantidad de dígitos NO matchea acá y sigue el camino normal de abajo.
```

#### 05B095 — líneas 2890-2897 (comentario)

```text
FIX (hora perdida al re-parsear fechas ya en formato canónico
"dd/MM/yyyy HH:mm:ss", ver _formatFechaCanonica()): antes esta rama
solo capturaba día/mes/año y descartaba la hora si venía, por lo que
CUALQUIER fecha con hora (Fecha de Guerra/Guerra_Logs, Vigencia de
Administradores, etc.) que pasara por acá volvía siempre a medianoche
— típicamente al restaurar una hoja vacía desde su Backup_*.csv (ver
_restaurarGuerraDesdeCSVSiVacia(), 17_GuerraSheet.gs). Ahora el grupo
de hora es opcional pero, si está presente, se usa.
```

#### 05B096 — líneas 2917-2922 (docblock)

```text
_respaldarIndiceCSV(ss)
Respaldo de la hoja Índice usando la columna ID (estable: sheetId real,
no cambia si se renombra una pestaña) como clave de fusión en vez de
bloquear todo el respaldo por conteo de filas.
```

#### 05B097 — líneas 2923-2953 (docblock)

```text
_respaldarIndiceCSV(ss)
Respaldo de la hoja Índice usando la columna ID (sheetId real) como clave
de fusión primaria, con Nombre como respaldo cuando el ID cambió.

FIX (06-ago-2026): el ID de una pestaña es estable si se la renombra,
pero NO si se la borra y se recrea (Google le asigna un ID nuevo aunque
el nombre sea el mismo — pasa en setups, limpiezas, Demoler, etc.). La
versión anterior solo fusionaba por ID: cuando el ID cambiaba, la fila
vieja (huérfana) se conservaba para siempre Y se agregaba una fila nueva
con el ID nuevo — acumulando filas fantasma en cada recreación de
pestaña. Con el tiempo Backup_Índice.csv llegó a ~200 filas para una
hoja Índice real de ~30. Ahora, si el ID no matchea, se intenta matchear
por Nombre (actualizando al ID nuevo en vez de duplicar); si TAMPOCO
matchea por Nombre, la fila se descarta (la pestaña ya no existe de
verdad). La primera corrida con este fix limpia de una vez todas las
filas huérfanas acumuladas hasta ahora.

FIX (13-ago-2026, pedido del usuario): se agrega la columna "Fecha" a la
derecha de "Edición", SOLO en este CSV — la hoja Índice real no la tiene
(así que no se puede editar a mano desde Sheets, ver también
importarIndiceDesdeCSV(), 03_Indice_Sheet.gs, que la descarta al restaurar).
Es un timestamp numérico puro (Date.now(), milisegundos desde epoch —
NUNCA texto/fecha formateada) que registra la última vez que a esa fila
se le asignó un ID NUEVO: es decir, la última vez que la pestaña real
fue borrada y recreada (o detectada por primera vez). Mientras el ID no
cambie de una corrida a otra, Fecha se conserva tal cual estaba; el día
que el ID cambia (match por Nombre en vez de por ID directo, ver más
abajo) o la fila es nueva, Fecha se pisa con el momento actual. Sirve
para saber hasta cuándo estuvo vigente el ID anterior de cada hoja.
```


### Ubicación: `_respaldarIndiceCSV`

#### 05B098 — líneas 2968-2970 (comentario)

```text
Posición (0-based) donde se inserta "Fecha" en el CSV: justo a la
derecha de "Edición" (o al final, por seguridad, si esa columna no
existiera todavía en la hoja).
```

#### 05B099 — líneas 2975-2977 (comentario)

```text
Sin columna ID todavía no se puede rastrear cambios de ID entre
corridas, así que tampoco tiene sentido agregar Fecha esta vez
(mismo criterio que antes: se guarda tal cual, sin fusión).
```

#### 05B100 — líneas 3004-3007 (comentario)

```text
Fecha previa por ID (para conservarla en las filas cuyo ID NO cambió).
Si el CSV anterior todavía no tenía columna Fecha (primera corrida con
este fix), el mapa queda vacío y toda fila recibe Fecha = ahora la
primera vez que se regenera el CSV con este código nuevo.
```

#### 05B101 — líneas 3039-3042 (comentario)

```text
El ID cambió (pestaña borrada y recreada con el mismo nombre): se
actualiza al ID nuevo en vez de dejar la fila vieja huérfana, y se
marca para que Fecha pase a "ahora" (se le acaba de asignar un ID
nuevo a esta fila).
```

#### 05B102 — líneas 3080-3105 (docblock)

```text
_respaldarListaHojasCSV(ss, hojas, protegerContraReduccion, colClaveIdx)
Función genérica que recorre una lista de hojas y las guarda en CSV.
@param {Spreadsheet} ss - El spreadsheet activo.
@param {Array} hojas - Array de nombres de hojas (CFG.SHEETS.XXX).
@param {boolean} protegerContraReduccion - Si es true, solo guarda el CSV
       si la hoja actual tiene IGUAL o MÁS filas que el CSV existente en
       Drive. Si es false, guarda SIEMPRE el CSV, aunque la hoja tenga
       menos filas (caso de hojas generadas por script como T_Lista/Nuevos).
@param {number} [colClaveIdx] - FIX (17-ago-2026, pedido explícito del
       usuario). Columna (1-based) que identifica de forma única cada fila
       (ej. Tag). Solo tiene efecto si protegerContraReduccion=true.
       MOTIVO: comparar solo el TOTAL de filas (como hace el bloque de
       arriba desde siempre) no detecta la pérdida de filas PUNTUALES si,
       en la misma corrida, se agregan otras filas nuevas — el total
       puede quedar igual o incluso subir, así que "lastRow < csvRows"
       nunca se dispara y el CSV se sobreescribe igual, perdiendo en
       silencio filas que el código NO tiene permitido borrar (ej.
       Vetados: un tag vetado por un clan nuevo entra a la vez que otro
       tag, vetado por un motivo propio, desaparece de la hoja — el
       conteo total no cambia, pero sí cambió QUIÉN está). Cuando se pasa
       colClaveIdx, además del chequeo de conteo, se compara el CONJUNTO
       de valores de esa columna entre el CSV existente y la hoja actual:
       si falta algún valor que sí estaba en el CSV, se bloquea la
       sobreescritura igual que ante una reducción de filas.
```

#### 05B103 — líneas 3106-3116 (docblock)

```text
_respaldarListaHojasCSV(ss, hojas, protegerContraReduccion, colClaveIdx, maxColOverride)
@param {number} [maxColOverride] Si se pasa, se exporta como máximo hasta
  esta columna (1-based) sin importar cuántas columnas reales tenga la
  hoja — usado por Vetados (FASE 4, 25-ago-2026) para excluir a propósito
  la columna Fecha (VC.FECHA=13) del respaldo CSV: esa fecha es un objeto
  Date real del momento del veto y NUNCA debe pasar por un ciclo de
  serialización/lectura como texto (ver arquitectura-web-familia-terna.md,
  Sección 7.5). Si se omite, se exporta hasta sh.getLastColumn() (igual
  que siempre).
```

#### 05B104 — líneas 3117-3122 (docblock)

```text
_colSet(...cols)
Azúcar sintáctico: arma un mapa { colIndex: true } a partir de una lista
de índices de columna (1-based), para pasar como colsFormatoNumerico a
_respaldarListaHojasCSV()/_extraerValoresConLinksReales().
```


### Ubicación: `_colSet`

#### 05B105 — líneas 3129-3142 (docblock)

```text
_respaldarListaHojasCSV(ss, hojas, protegerContraReduccion, colClaveIdx, colsFormatoNumerico)
@param {Object} [colsFormatoNumerico] Mapa { colIndex(1-based): true } de
  columnas de FECHA que deben exportarse como número (epoch ms, vía
  Date.getTime()) en vez del texto canónico "dd/MM/yyyy HH:mm:ss" que usa
  por defecto la detección automática de fechas de
  _extraerValoresConLinksReales(). Usado por Vetados (FASE 4, 25-ago-2026,
  arquitectura-web-familia-terna.md Sección 7.5) para la columna Fecha
  (VC.FECHA=13): el pedido explícito fue "que no se guarde como texto,
  sino en formato numérico" — la fecha SÍ se respalda (no se excluye del
  CSV), solo que como número sin ambigüedad de locale/zona horaria en vez
  de un string formateado. Ver _parseSpanishDate(), que reconoce ese
  mismo formato numérico al reimportar (importarAcumulativosDesdeCSV()).
```

#### 05B106 — líneas 3143-3157 (docblock)

```text
_respaldarListaHojasCSV(ss, hojas, protegerContraReduccion, colClaveIdx, colsFormatoNumerico, colsMinutosASegundos)
@param {Object} [colsMinutosASegundos] FASE 5 (25-sep-2026, rediseño
  T_Lista -- ver punto B-bis y el comentario "FASE 5" en
  26_Torneos_Core.gs). Mapa { colIndex(1-based): true } de columnas
  NUMÉRICAS (no de fecha) cuyo valor real en la hoja son MINUTOS, y que
  deben exportarse al CSV en SEGUNDOS (valor*60) -- caso especial
  distinto de colsFormatoNumerico (que solo aplica a columnas de tipo
  Date). Usado por T_Lista para Preparación/Duración
  (TL.PREPARACION/TL.DURACION): la celda muestra y guarda minutos como
  valor real (no segundos con NumberFormat, que no puede dividir un
  valor), y solo el respaldo genérico convierte a segundos, para no
  perder la unidad cruda de la API en el CSV. Reconstruido de vuelta a
  minutos al restaurar -- ver importarTListaDesdeCSV() (26_Torneos_Core.gs).
```


### Ubicación: `_respaldarListaHojasCSV`

#### 05B107 — líneas 3168-3178 (comentario)

```text
FIX (08-sep-2026, pedido usuario): T_Lista/S_Lista tienen header de 2
FILAS FUSIONADAS (ver _aplicarHeaderDosFilas(), 02_Setup_Hojas.gs),
a diferencia de las demás hojas de esta lista (header de 1 fila). El
CSV resultante SIEMPRE tiene 1 sola fila de encabezado (la combinada,
ver _combinarHeaderDosFilas()) sin importar cuántas filas de header
tenga la hoja real -- por eso las comparaciones de "filas de dato"
más abajo restan headerRows de lastRow, no simplemente 1.
NUEVO (13-sep-2026, pedido del usuario): CR_Lista tiene header de 3
FILAS FUSIONADAS (ver _aplicarHeaderTresFilas(), 02_Setup_Hojas.gs) --
mismo criterio que T_Lista/S_Lista arriba, solo que
_combinarHeaderTresFilas() combina 3 filas de header en vez de 2.
```

#### 05B108 — líneas 3194-3196 (comentario)

```text
Chequeo adicional por CLAVE (ver comentario del parámetro arriba):
atrapa la pérdida de filas puntuales que el chequeo de conteo, por
sí solo, no puede ver.
```

#### 05B109 — líneas 3228-3231 (comentario)

```text
Detección automática de texto enriquecido (RichText) con enlaces:
ver _extraerValoresConLinksReales() más abajo. Cualquier columna de
CUALQUIER hoja con celdas de enlace ("Link", "Carta", "Mazos", etc.)
se exporta con la URL real, no con el texto visible.
```


### Ubicación: `_saveCSVToDrive`

#### 05B110 — líneas 3249-3277 (docblock)

```text
syncAcumulativosCSV()
Sincroniza hojas acumulativas (no se borran) con sus archivos CSV de backup.
INCLUYE Guerra_Logs e Historial.
Inactivos NO está en la lista genérica de abajo: tiene su propio mecanismo
dedicado (syncInactivosCSV(), justo arriba) porque necesita mantener el
CSV en 60 columnas sin leer la hoja con 60 columnas (ver esa función).

FIX (Fase 2, 19/07/2026): Plantillas es de EDICIÓN MANUAL (no un log que
solo crece), así que una reducción de filas puede ser perfectamente
legítima (ej. el usuario quita una plantilla vieja de la vista). Antes,
el mismo blindaje "ciego" que el resto de esta lista bloqueaba el guardado
en cuanto la hoja tenía menos filas que el CSV — y como no hay forma
automática de "explicar" la diferencia contra otra hoja (a diferencia de
Inactivos, que se contrasta con Directorio), el CSV quedaba desactualizado
indefinidamente. Ahora Plantillas tiene su propia bandera
`permitirReduccion: true`: se guarda siempre que tenga al menos 2 filas,
sin bloquear por conteo, y solo se deja constancia en el log de que hubo
una reducción. Las demás hojas de esta lista (Comentarios, Calendario_2,
Guerra_Logs, Historial, Ascensos) son registros que solo deberían crecer,
así que conservan el blindaje original: una reducción ahí sí es señal de
posible pérdida de datos real.

NOTA para el usuario: si quieres que una plantilla deje de mostrarse sin
que esto dispare una reducción de filas, es mejor OCULTAR esa fila
(clic derecho > Ocultar fila) en vez de borrarla — una fila oculta sigue
contando dentro de getLastRow() (Sheets no la excluye de las filas con
contenido), así que el conteo se mantiene estable.
```

#### 05B111 — líneas 3278-3299 (docblock)

```text
_syncUnaAcumulativaCSV(item, forzar)
Sincroniza UNA hoja "acumulativa" (ver lista en syncAcumulativosCSV) a su
CSV de respaldo en Drive. Extraído de syncAcumulativosCSV() para poder
invocarlo también de forma puntual y forzada — ver _syncGuerraCSV() para
el porqué del parámetro forzar (mismo motivo: una fusión de duplicados
legítima reduce filas, y el blindaje normal bloquearía esa sincronización
para siempre).

FIX (03-ago-2026): item admite ahora `fechaColConHoraForzada` (columna
1-based) — si se indica, esa columna de fecha SIEMPRE conserva su hora al
exportarse (ver _extraerValoresConLinksReales(), parámetro
colConHoraForzada). Se usa para Comentarios, Guerra_Logs, Historial y
Ascensos (mismo caso ya corregido para Guerra en 17_GuerraSheet.gs): su
Fecha es el instante real de registro, no una fecha de calendario, así
que no debe recortarse aunque el valor caiga justo en medianoche exacta.
Calendario_2 NO declara este campo a propósito: su fecha SÍ es de
calendario puro (como DiaGuerra), así que conserva el comportamiento de
siempre (recorta la hora si es medianoche).
@param {Object}  item   - { sheetName, fileName, numCols, hasFecha, fechaCol, permitirReduccion, fechaColConHoraForzada }
@param {boolean} [forzar]
```


### Ubicación: `_syncUnaAcumulativaCSV`

#### 05B112 — líneas 3314-3316 (comentario)

```text
Blindaje: solo pisa el CSV si la hoja tiene igual o más filas que el CSV
existente — EXCEPTO para las hojas marcadas con permitirReduccion:true,
o cuando se pasa forzar===true explícitamente (ver docblock arriba).
```

#### 05B113 — líneas 3336-3346 (comentario)

```text
PROTECCIÓN DE FECHAS (28-sep-2026, extendida a todas las hojas con Fecha):
el blindaje de arriba solo mira la cantidad de filas. Aquí se compara
cuántas filas CON Fecha respaldable tiene la hoja frente al CSV existente.
Se bloquea solo si el CSV tiene más filas con Fecha que la hoja de las que
se explican por filas quitadas a propósito (fusión de duplicados, borrado
manual): quitar una fila NO bloquea; que una fila siga ahí pero pierda su
Fecha SÍ bloquea. Agregar filas nuevas (con o sin Fecha) nunca bloquea.
Aplica también con forzar/permitirReduccion (perder fechas nunca es una
reducción intencional). Activa por defecto en todo item con hasFecha:true
(se desactiva solo con protegerFechas:false). Si el CSV no existe no hay
nada que proteger; si la comprobación falla por un error, NO se guarda.
```

#### 05B114 — líneas 3357-3359 (comentario)

```text
Columna de Fecha en el CSV: se busca por el TEXTO del encabezado de la
hoja en esa columna (robusto si el CSV trae otro orden); si no se
encuentra, se usa el mismo índice que la hoja.
```

#### 05B115 — líneas 3413-3425 (docblock)

```text
_contarFilasSinFechaRespaldable(valores)
Cuenta cuántos valores de una columna de Fecha NO tienen una fecha
respaldable. Cuenta como CON fecha: un objeto Date válido, un número, o un
texto no vacío que _parseSpanishDate() reconozca como fecha (una fecha
pegada como texto no es una fecha perdida: el CSV la guarda igual).
Cuenta como SIN fecha: vacío, null, Date inválido o texto que no se puede
interpretar como fecha.
Usada por _syncUnaAcumulativaCSV() para las hojas con Fecha (protección de
fechas, 28-sep-2026, ver AVISOS ABIERTOS al inicio de este archivo).
@param {Array} valores - valores crudos de la columna Fecha (sin encabezado).
@return {number} cantidad de filas sin fecha respaldable.
```


### Ubicación: `_contarFilasSinFechaRespaldable`

#### 05B116 — líneas 3445-3468 (comentario)

```text
=============================================================================
LOG DE TAMPERMONKEY EN DRIVE (13-ago-2026, pedido del usuario)
=============================================================================
El usuario pidió poder ver qué pasó en cada corrida de los botones de
Tampermonkey (corregirGuerra / importarNuevos) sin tener que entrar a
Ver > Ejecuciones de Apps Script -- y de paso, esto deja de perder
silenciosamente errores como el de actualizarControl2() dentro de
_aplicarCorreccionesGuerra() (18_CorreccionGuerra.gs), que hasta ahora
solo se registraba con Logger.log() (invisible fuera del editor).

Un archivo CSV por botón, en la misma carpeta de Drive que ya se usa para
los demás respaldos (DRIVE_FOLDER_ID_CSV): "Log_Tampermonkey_<boton>.csv".
Cada llamada a doPost() agrega UNA fila con fecha, si terminó OK o con
error, un resumen del resultado, y el texto del error si lo hubo. El
archivo se recorta solo a las últimas TAMPERMONKEY_LOG_MAX_LINEAS filas
de datos para que no crezca sin límite con el tiempo (mismo criterio que
ya usa el snapshot de depuración de "Nuevos", ver
_guardarSnapshotDebugImportacionNuevos(), 14_Nuevos_RoyaleAPI.gs).

Nunca debe interrumpir el flujo normal del botón: si escribir el log
falla (Drive caído, permisos, etc.), se traga el error acá mismo y sigue
-- el botón de Tampermonkey ya tiene su propio manejo de errores en
doPost(), este log es solo un espejo adicional para diagnóstico.
=============================================================================
```


### Ubicación: `TAMPERMONKEY_LOG_MAX_LINEAS`

#### 05B117 — líneas 3470-3480 (docblock)

```text
_logTampermonkeyADrive(boton, resultado, errorTexto)
@param {string} boton       Nombre corto del botón/acción — se usa tal
                             cual en el nombre del archivo, ej.
                             'CorreccionGuerra' o 'ImportarNuevos'.
@param {Object} [resultado] Objeto de resultado devuelto al userscript
                             (se guarda como JSON compacto). Puede venir
                             vacío/undefined cuando hubo error.
@param {string} [errorTexto] Mensaje de error, si lo hubo. Vacío/undefined
                             cuando la llamada terminó OK.
```


### Ubicación: `_logTampermonkeyADrive`

#### 05B118 — líneas 3529-3535 (docblock)

```text
_csvEscapeCampo(valor)
Escapa un valor para uso seguro dentro de un campo CSV (comillas dobles
alrededor si contiene coma, comilla o salto de línea; comillas internas
duplicadas). Mismo criterio estándar que ya usa el resto del proyecto al
generar CSVs de respaldo.
```


---


# Archivo 06_Battlelogs_Siembra.gs

Siembra de `Backup_Battlelogs.csv` con los JSON que ya hay en la carpeta "Battlelog" (`DRIVE_FOLDER_ID_BATTLELOG`). Puntos de entrada: `sembrarBattlelogsDesdeCarpeta()` y `sembrarBattlelogsDesdeCarpetaPrueba()`. Contiene los helpers `_bls*` que usan también 07 y 09. Los IDs de bloque llevan prefijo `06`. El bloque grande del encabezado incluye los "AVISOS ABIERTOS / VERIFICACIONES ABIERTAS" [1]-[6].


## Índice de bloques movidos

| ID | Líneas orig. | Ubicación | Resumen |
|---|---|---|---|
| 06B001 | 6-86 | `Cabecera del archivo` | PEDIDO DEL USUARIO (1-oct-2026, pregunta 51 del consolidado): los JSON de la |
| 06B002 | 105-107 | `BLS_COL` | PUNTOS DE ENTRADA |
| 06B003 | 117-121 | `sembrarBattlelogsDesdeCarpeta` | sembrarBattlelogsDesdeCarpetaPrueba() |
| 06B004 | 126-128 | `sembrarBattlelogsDesdeCarpetaPrueba` | NUCLEO |
| 06B005 | 310-312 | `_blsSembrarConCandado_` | LECTURA DE LA CARPETA Y DE LAS BATALLAS |
| 06B006 | 314-320 | `_blsSembrarConCandado_` | _blsListarArchivos_() |
| 06B007 | 349-353 | `_blsEsBatallaGuerra_` | _blsClanDeBatalla_(equipo0) |
| 06B008 | 359-364 | `_blsClanDeBatalla_` | _blsRondasDuelo_(equipo0, rival0) |
| 06B009 | 417-422 | `_blsFilaDeBatalla_` | _blsCompletarLado_(previa, nueva) |
| 06B010 | 434-436 | `_blsCompletarLado_` | COMPARACION Y CLAVES |
| 06B011 | 451-455 | `_blsCelda_` | _blsFirma_(fila) |
| 06B012 | 481-483 | `_blsComparar_` | CSV Y PUNTO DE CONTROL |
| 06B013 | 485-489 | `_blsComparar_` | _blsLeerCsv_(nombre, headersEsperados) |
| 06B014 | 518-523 | `_blsRenumerar_` | _blsGuardarTodo_(...) |

---

## Detalle (texto original, sin cambios)

Cada bloque se copió tal cual estaba en el `.gs` (sin los `//`). Los números de línea son los del archivo ANTES de la limpieza.


### Ubicación: `Cabecera del archivo`

#### 06B001 — líneas 6-86 (comentario)

```text

PEDIDO DEL USUARIO (1-oct-2026, pregunta 51 del consolidado): los JSON de la
corrida masiva del 27-sep (07:10 a 07:27) son, para muchos jugadores, la
UNICA copia de las batallas de guerra del 24 al 27-sep, y cada descarga
nueva de descargarBattlelogJugador() los sobrescribe. Esta funcion vuelca esas
batallas al CSV ANTES de cualquier descarga masiva nueva.

ESTE ARCHIVO ES NUEVO Y AUTONOMO (autorizado como parte de la tanda 1 de la
pregunta 51): no modifica ninguna funcion de otro .gs. Solo usa helpers que
ya existen: _loadCSVFromDrive(), _saveCSVToDrive(), _encodeCSV(),
_parseCSV() (05_Backup_CSV.gs) y las constantes DRIVE_FOLDER_ID_BATTLELOG /
DRIVE_FOLDER_ID_OTROS (01_Config_Global.gs).

QUE HACE (decisiones confirmadas por el usuario el 1-oct-2026):
  1) Columnas: N° (numeracion automatica, primera columna), Tag, Nombre,
     battleTime (UTC, tal como viene en el JSON), Tipo, ClanTag, ClanNombre,
     ModoId, ModoNombre, CoronasPropias, CoronasRival, RondasDuelo,
     BarcoGanado, TorresNuevas, TorresRestantes, Archivo, Descargado, LadoBarco.
  2) Reconoce los archivos de un Tag por el final del nombre
     "dd-MM-yyyy HH.mm - {Clan} - #TAG.json" (mismo criterio que
     descargarBattlelogJugador()). A diferencia de esa funcion NO se queda
     con el primer archivo: lee TODOS los de un mismo Tag, del mas viejo al
     mas nuevo (pregunta 49).
  3) Clave de duplicado: battleTime + Tipo + Tag. Si la clave ya existe con
     los mismos datos, se ignora. Si existe con datos DISTINTOS, la fila ya
     guardada NO se pisa y el caso se anota en Revision_Guerra.csv.
  4) Entran las batallas cuyo tipo empieza por "riverRace" o es "boatBattle"
     (incluye las de entrenamiento; separarlas es trabajo del filtro por
     PeriodIndex de la Tanda 3). Las demas batallas no se guardan.
  5) Solo LEE los JSON; nunca los modifica ni los borra.
  6) NUEVO (4-oct-2026, Fase 15 tanda 3.5b, filtro de defensas de barco): se agrega
     la columna LadoBarco (ultima, indice 17) con el valor crudo de boatBattleSide
     del JSON ("defender" = el barco del clan fue atacado y el jugador NO atacó;
     "attacker" u otro valor = ataque del jugador). Solo se llena en boatBattle.
     Una fila vieja (sembrada antes de este cambio) queda con LadoBarco vacio y se
     completa sola cuando el mismo JSON vuelve a leerse (siembra o descarga) mientras
     siga en la carpeta; la comparacion de duplicados NO incluye esta columna.

COMO SE USA (desde el editor de Apps Script, menu Ejecutar):
  - sembrarBattlelogsDesdeCarpetaPrueba(): NO escribe nada; cuenta cuantas
    filas nuevas agregaria y cuantos conflictos habria.
  - sembrarBattlelogsDesdeCarpeta(): escribe Backup_Battlelogs.csv y, si hay
    conflictos, Revision_Guerra.csv. Trabaja por tandas con punto de control
    (BLS_PRESUPUESTO_MS): si no alcanza el tiempo, vuelve a ejecutarla hasta
    que el log diga "SIEMBRA COMPLETA".

=============================================================================
AVISOS ABIERTOS / VERIFICACIONES ABIERTAS
=============================================================================
  [1] NO SE PROBO EN APPS SCRIPT REAL ni con los JSON reales de Drive. Si se
      probo la logica con un entorno simulado en node (ver el consolidado).
      Correr primero sembrarBattlelogsDesdeCarpetaPrueba() y revisar el log.
  [2] PREGUNTA 44 (clan de cada batalla): el campo team[0].clan puede ser el
      clan EN EL MOMENTO de la batalla o el clan ACTUAL al descargar. Esta
      siembra lo guarda tal como viene y NO descarta nada por clan. Si la
      MISMA batalla aparece en dos descargas con clan distinto, se anota en
      Revision_Guerra.csv con el motivo "Clan distinto entre descargas
      (evidencia pregunta 44)": esa evidencia sirve para cerrar la 44. La
      lectura del clan esta aislada en _blsClanDeBatalla_().
  [3] ACTUALIZADO (2-oct-2026): (a) HECHO: descargarBattlelogJugador() agrega
      al CSV cada descarga nueva; (b) HECHO: la hoja "Battlelogs"
      (07_Battlelogs_Hoja.gs, refrescada desde runSyncCSV()); (c) DESCARTADO
      por la usuaria: el candado que impediria la descarga masiva mientras el
      CSV este vacio (con 1750 filas ya no es urgente; reabrir solo si algun
      dia se recrea el CSV desde cero); (d) DESCARTADO por la usuaria: la
      entrada de menu (este proyecto no usa menus de Sheets).
  [4] Si Backup_Battlelogs.csv ya existe con un encabezado distinto al de
      BLS_HEADERS, la siembra se detiene sin tocar nada. EXCEPCION (4-oct-2026):
      un CSV con el encabezado ANTERIOR de 17 columnas (sin LadoBarco) se acepta,
      sus filas se leen con LadoBarco vacio, y el encabezado nuevo se escribe la
      proxima vez que se guarde el CSV.
  [5] CERRADO (4-oct-2026, informeBattlelogContraGuerra()): el valor de un ATAQUE real
      de barco en boatBattleSide es "attacker". Con los 188 boatBattle del CSV: 169
      "defender" y 19 "attacker", sin otros valores. El filtro de
      18_CorreccionGuerra.gs sigue descartando SOLO "defender" y trata cualquier otro
      valor no vacio como ataque; si algun dia aparece un tercer valor, el informe lo
      mostrara en su linea «LadoBarco en el CSV».
  [6] Las filas viejas sin LadoBarco son NO CONCLUYENTES (decision de la usuaria,
      4-oct-2026): 18_CorreccionGuerra.gs no las suma como mazo, fame ni barco. Solo se
      recuperan los lados de los JSON que sigan en la carpeta Battlelog.
=============================================================================
```


### Ubicación: `BLS_COL`

#### 06B002 — líneas 105-107 (comentario)

```text
-----------------------------------------------------------------------------
PUNTOS DE ENTRADA
-----------------------------------------------------------------------------
```


### Ubicación: `sembrarBattlelogsDesdeCarpeta`

#### 06B003 — líneas 117-121 (docblock)

```text
sembrarBattlelogsDesdeCarpetaPrueba()
Igual que la anterior pero NO escribe nada en Drive: solo cuenta y deja el
resumen en el log.
```


### Ubicación: `sembrarBattlelogsDesdeCarpetaPrueba`

#### 06B004 — líneas 126-128 (comentario)

```text
-----------------------------------------------------------------------------
NUCLEO
-----------------------------------------------------------------------------
```


### Ubicación: `_blsSembrarConCandado_`

#### 06B005 — líneas 310-312 (comentario)

```text
-----------------------------------------------------------------------------
LECTURA DE LA CARPETA Y DE LAS BATALLAS
-----------------------------------------------------------------------------
```

#### 06B006 — líneas 314-320 (docblock)

```text
_blsListarArchivos_()
Agrupa por Tag los archivos de la carpeta Battlelog. Nombre esperado
(ver _buildBattlelogFilename(), 09_API_ClashRoyale.gs):
"dd-MM-yyyy HH.mm - {Clan} - #TAG.json". La fecha del nombre es la hora de
la descarga (Lima). "orden" permite ordenar del mas viejo al mas nuevo.
```


### Ubicación: `_blsEsBatallaGuerra_`

#### 06B007 — líneas 349-353 (docblock)

```text
_blsClanDeBatalla_(equipo0)
UNICO lugar donde se lee el clan de una batalla (pregunta 44 del
consolidado): hoy toma team[0].clan tal como viene en el JSON.
```


### Ubicación: `_blsClanDeBatalla_`

#### 06B008 — líneas 359-364 (docblock)

```text
_blsRondasDuelo_(equipo0, rival0)
Coronas por ronda de un duelo, ej. "3 vs 1 / 0 vs 2". Se usa " vs " y no un
guion para que Google Sheets/Excel no lo conviertan en fecha al abrir el CSV.
Si el rival no trae sus rondas, queda "3 vs ?".
```


### Ubicación: `_blsFilaDeBatalla_`

#### 06B009 — líneas 417-422 (docblock)

```text
_blsCompletarLado_(previa, nueva)
Si la fila ya guardada es un boatBattle SIN LadoBarco y la fila nueva (del mismo
battleTime + Tipo + Tag) si lo trae, copia el lado a la fila guardada. Devuelve true
si cambio algo (el llamador debe guardar el CSV). Nunca pisa un lado ya guardado.
```


### Ubicación: `_blsCompletarLado_`

#### 06B010 — líneas 434-436 (comentario)

```text
-----------------------------------------------------------------------------
COMPARACION Y CLAVES
-----------------------------------------------------------------------------
```


### Ubicación: `_blsCelda_`

#### 06B011 — líneas 451-455 (docblock)

```text
_blsFirma_(fila)
Texto con las columnas comparables (ClanTag a TorresRestantes). Se excluye
Nombre (puede cambiar sin que la batalla sea otra), Archivo y Descargado.
```


### Ubicación: `_blsComparar_`

#### 06B012 — líneas 481-483 (comentario)

```text
-----------------------------------------------------------------------------
CSV Y PUNTO DE CONTROL
-----------------------------------------------------------------------------
```

#### 06B013 — líneas 485-489 (docblock)

```text
_blsLeerCsv_(nombre, headersEsperados)
Lee un CSV de la carpeta CSV. Si no existe o esta vacio devuelve 0 filas. Si
existe con un encabezado distinto al esperado devuelve ok=false (no se toca).
```


### Ubicación: `_blsRenumerar_`

#### 06B014 — líneas 518-523 (docblock)

```text
_blsGuardarTodo_(...)
Escribe Backup_Battlelogs.csv (ordenado por battleTime y Tag, con N°
renumerado), agrega a Revision_Guerra.csv las filas nuevas y guarda el punto
de control. Nunca se llama en modo prueba.
```


---


# Archivo 07_Battlelogs_Hoja.gs

Hoja "Battlelogs": vista de SOLO LECTURA de `Backup_Battlelogs.csv` (dirección del dato siempre CSV -> hoja). Punto de entrada: `actualizarHojaBattlelogs()`, llamado como último paso de `PASOS_RUNSYNCCSV`. Los IDs de bloque llevan prefijo `07`. El bloque grande del encabezado incluye los "AVISOS ABIERTOS" [1]-[7] (ej. no quitar 'Battlelogs' de la lista de exclusión del respaldo genérico en 05_Backup_CSV.gs).


## Índice de bloques movidos

| ID | Líneas orig. | Ubicación | Resumen |
|---|---|---|---|
| 07B001 | 6-111 | `Cabecera del archivo` | PEDIDO / DECISION (pregunta 45 y 51 del consolidado): el registro acumulativo |
| 07B002 | 131-133 | `BLH_NOTA_A1` | PUNTO DE ENTRADA |
| 07B003 | 135-143 | `BLH_NOTA_A1` | actualizarHojaBattlelogs() |
| 07B004 | 188-190 | `actualizarHojaBattlelogs` | Reconstruccion completa: se borran los datos viejos (si la hoja tenia mas |
| 07B005 | 223-225 | `actualizarHojaBattlelogs` | AUXILIARES |
| 07B006 | 227-236 | `actualizarHojaBattlelogs` | _blhDisenoColumnas_() |
| 07B007 | 252-259 | `_blhDisenoColumnas_` | _blhFilasParaHoja_(filasCsv, dise) |
| 07B008 | 287-292 | `_blhFilasParaHoja_` | _blhHoraLima_(battleTime) |

---

## Detalle (texto original, sin cambios)

Cada bloque se copió tal cual estaba en el `.gs` (sin los `//`). Los números de línea son los del archivo ANTES de la limpieza.


### Ubicación: `Cabecera del archivo`

#### 07B001 — líneas 6-111 (comentario)

```text

PEDIDO / DECISION (pregunta 45 y 51 del consolidado): el registro acumulativo
de batallas de guerra vive en Backup_Battlelogs.csv (una fila por batalla) y
la hoja se llama "Battlelogs". Este archivo es la parte "hoja" de ese diseno.

Solo usa helpers que ya existen: _blsLeerCsv_() y las constantes BLS_CSV_NOMBRE
/ BLS_HEADERS (06_Battlelogs_Siembra.gs), _getSs(), _getOrCreateSheet(),
applyHeaderStyle(), _aplicarFiltroEnFilaHeader() (04_Formato_Comun.gs y
02_Setup_Hojas.gs). No modifica ninguna funcion de otro .gs.

DIRECCION DEL DATO (lo mas importante de este archivo):
  Backup_Battlelogs.csv  ---->  hoja "Battlelogs"      (SIEMPRE en este sentido)
El CSV es la FUENTE: lo llenan la siembra (06_Battlelogs_Siembra.gs) y cada
descarga (_registrarBattlelogEnCsv_(), 09_API_ClashRoyale.gs). La hoja se
vuelve a construir entera desde el CSV cada vez que se corre
actualizarHojaBattlelogs(); NUNCA se escribe de la hoja al CSV. Lo que se
edite a mano en la hoja se pierde en la proxima actualizacion.

COMO SE USA:
  - AUTOMATICO (2-oct-2026): runSyncCSV() (00_Main.gs, PASOS_RUNSYNCCSV) corre
    actualizarHojaBattlelogs() como ULTIMO paso, una vez al dia (el trigger de
    runSyncCSV es a las 03:00 hora Peru). Si falla, solo deja el error en el
    log y NO corta runSyncCSV.
  - A MANO: desde el editor de Apps Script (menu Ejecutar) se puede correr
    actualizarHojaBattlelogs() cuando se quiera. Este proyecto no usa menus de
    Sheets (ver el AVISO [4]). Deja un resumen en el log.

COLUMNAS: las 17 de Backup_Battlelogs.csv (BLS_HEADERS), en el mismo orden y
con el mismo N° del CSV, MAS UNA SOLA COLUMNA QUE EXISTE UNICAMENTE EN LA HOJA:
"Hora Lima" (2-oct-2026, decision de la usuaria), puesta justo a la derecha
de battleTime. El CSV NO cambia: sigue con 17 columnas y battleTime en UTC
crudo. "Hora Lima" es battleTime convertido a America/Lima (UTC-5, sin
horario de verano) con formato yyyy-MM-dd HH:mm:ss, guardado como TEXTO (asi
ordena bien con el filtro y Sheets no lo convierte en fecha). Si un battleTime
no se puede leer, la celda queda VACIA (no se inventa una hora). Para volver a
la forma anterior (sin la columna) basta poner BLH_AGREGAR_HORA_LIMA = false.
  Las filas van en el orden del CSV (battleTime ascendente); para ver lo mas
  nuevo primero, usar el filtro de la hoja. Tipos: N°, ModoId, CoronasPropias,
  CoronasRival, TorresNuevas y TorresRestantes son numeros; todo lo demas se
  guarda como TEXTO (battleTime, Hora Lima, Archivo y Descargado para que
  Sheets no los convierta en fecha; Nombre y ClanNombre para que un nombre que
  empiece por "=" no se tome como formula).

=============================================================================
AVISOS ABIERTOS / VERIFICACIONES ABIERTAS
=============================================================================
  [1] NO SE PROBO EN APPS SCRIPT REAL ni con la hoja real. Si se probo la
      logica con un entorno simulado en node (ver el consolidado). Primera
      prueba pedida: correr actualizarHojaBattlelogs() y comprobar que la hoja
      tiene tantas filas de dato como filas tiene Backup_Battlelogs.csv, y que
      "Hora Lima" es 5 horas MENOS que battleTime (20260927T071200.000Z ->
      2026-09-27 02:12:00).
  [2] RIESGO CERRADO EN 05_Backup_CSV.gs, QUE NO SE DEBE DESHACER: el respaldo
      generico de hojas "derivadas" (respaldarHojasDerivadasCSV()) escribe
      Backup_<NombreHoja>.csv para TODA hoja que no este en su lista de
      exclusion, sin proteccion contra reduccion de filas. Una hoja llamada
      "Battlelogs" habria sobreescrito Backup_Battlelogs.csv con su propio
      contenido (que puede estar desactualizado, porque las descargas agregan
      filas al CSV sin tocar la hoja) y se habrian perdido batallas que ya no
      se pueden recuperar. Por eso 05_Backup_CSV.gs excluye 'Battlelogs' de ese
      respaldo. Si alguien cambia el nombre de la hoja (BLH_SHEET_NAME), debe
      cambiar tambien ese literal en 05_Backup_CSV.gs.
      ATENCION (2-oct-2026): como ahora la hoja tiene 18 columnas y el CSV 17,
      si alguna vez se quitara 'Battlelogs' de esa lista el respaldo generico
      escribiria un CSV de 18 columnas con el MISMO nombre que el registro y lo
      dejaria con un encabezado distinto al esperado (_blsLeerCsv_() se
      detendria). Razon de mas para no quitarla.
  [3] RESUELTO (2-oct-2026, decision de la usuaria): REFRESCO AUTOMATICO. Se
      agrego como ultimo paso de PASOS_RUNSYNCCSV (00_Main.gs). Se eligio
      runSyncCSV() y NO runUpdate(), asi que la hoja se refresca una vez al dia
      y no en cada runUpdate()/runAll(). Despues de un Demoler la hoja
      desaparece y se vuelve a crear con la primera corrida (el CSV no se
      pierde).
  [4] CORRECCION (regla 9) al AVISO [3](d) de 06_Battlelogs_Siembra.gs y a lo
      anotado en el consolidado: ahi figuraba "una entrada en el menu"
      como pendiente de la pregunta 51. Este proyecto NO usa menus de Sheets
      (la Regla 1 de Reglas Globales prohibe getUi()/alert()/toast(), y ya hay
      un precedente: resolverAlertasHistorialGuerra() es "llamada manual a
      proposito, sin item de menu"). Por eso no se agrego ninguna entrada de
      menu. DECIDIDO (2-oct-2026, usuaria): se DESCARTA la entrada de menu.
      Tampoco se hara el candado que impediria la descarga masiva mientras el
      CSV este vacio (DESCARTADO por la usuaria el mismo dia; con 1750 filas ya
      no es urgente). Solo habria que reabrirlo si algun dia se vuelve a crear
      el CSV desde cero: en ese caso, correr primero la siembra
      (sembrarBattlelogsDesdeCarpeta()) antes de cualquier descarga masiva.
  [5] DECIDIDO (2-oct-2026, usuaria): columna "Hora Lima" solo en la hoja (ver
      COLUMNAS). LIMITE A TENER PRESENTE: es la hora calendario de Lima, NO el
      dia de guerra. El dia de guerra cambia entre las 04:00 y las 05:00 Lima en
      un minuto distinto para cada clan y puede variar de una semana a otra, y
      no se asume ninguna hora fija (pregunta 47). Para saber de que dia de
      guerra es una batalla se usa el PeriodIndex del clan, no esta columna.
      Esta columna sirve para leer la hora y ubicar la batalla a ojo.
      PENDIENTE DE DEFINIR (usuaria): si la hoja deberia traer tambien el
      PeriodIndex o el dia de guerra; no se agrego porque exige la logica de la
      Tanda 3 y no se pidio.
  [6] Mismo problema de costo que en la siembra: con miles de filas la
      reconstruccion escribe toda la hoja de una vez (un solo setValues). Con
      1750 filas es liviano; si el CSV crece a decenas de miles de filas habria
      que revisarlo. Ahora ademas corre dentro de runSyncCSV(): si el CSV
      crece mucho y runSyncCSV() empezara a quedarse sin tiempo, este es el
      primer paso que se puede sacar de PASOS_RUNSYNCCSV.
  [7] Si el candado del proyecto esta ocupado (otra descarga de battlelog o
      la siembra), actualizarHojaBattlelogs() no hace nada y lo deja en el log;
      en runSyncCSV() eso significa que ese dia la hoja no se refresca y queda
      con el dato del dia anterior hasta la siguiente corrida. No es un error.
=============================================================================
```


### Ubicación: `BLH_NOTA_A1`

#### 07B002 — líneas 131-133 (comentario)

```text
-----------------------------------------------------------------------------
PUNTO DE ENTRADA
-----------------------------------------------------------------------------
```

#### 07B003 — líneas 135-143 (docblock)

```text
actualizarHojaBattlelogs()
Crea la hoja "Battlelogs" si no existe y la reconstruye desde
Backup_Battlelogs.csv. Nunca escribe el CSV. Si el CSV no existe, esta vacio
o tiene un encabezado distinto al esperado, NO toca la hoja.
Lo llama a mano el usuario y, una vez al dia, el ultimo paso de
PASOS_RUNSYNCCSV (00_Main.gs).
@returns {{filas:number, creada:boolean, sinHoraLima:number}|null} null si no se hizo nada.
```


### Ubicación: `actualizarHojaBattlelogs`

#### 07B004 — líneas 188-190 (comentario)

```text
Reconstruccion completa: se borran los datos viejos (si la hoja tenia mas
filas que el CSV, o menos columnas, no deben quedar sobrantes) y se escribe
todo de una vez.
```

#### 07B005 — líneas 223-225 (comentario)

```text
-----------------------------------------------------------------------------
AUXILIARES
-----------------------------------------------------------------------------
```

#### 07B006 — líneas 227-236 (docblock)

```text
_blhDisenoColumnas_()
Arma el diseno de columnas de la HOJA a partir de BLS_HEADERS (las del CSV):
  - headers:   encabezados de la hoja (con "Hora Lima" si corresponde).
  - posHora:   posicion (base 0) de "Hora Lima" en la hoja, o -1 si no se agrega.
  - idxBt:     posicion (base 0) de battleTime en el CSV, o -1 si no esta.
  - numericas: mapa posicion-en-la-hoja -> true para las columnas numericas.
"Hora Lima" va justo a la derecha de battleTime; si por algun motivo
battleTime no estuviera en BLS_HEADERS, no se agrega la columna.
```


### Ubicación: `_blhDisenoColumnas_`

#### 07B007 — líneas 252-259 (docblock)

```text
_blhFilasParaHoja_(filasCsv, dise)
Copia las filas del CSV (todo texto) y convierte a numero las columnas
numericas que traen valor. Un valor no numerico en una de esas columnas se
deja como texto (no se inventa un numero). Si el diseno trae "Hora Lima", la
inserta a la derecha de battleTime. No modifica las filas recibidas.
@returns {{filas:Array<Array>, sinHoraLima:number}}
```


### Ubicación: `_blhFilasParaHoja_`

#### 07B008 — líneas 287-292 (docblock)

```text
_blhHoraLima_(battleTime)
Convierte el battleTime del CSV (UTC, formato de la API: 20260927T071200.000Z)
a texto "yyyy-MM-dd HH:mm:ss" en hora de Lima. Si el texto no tiene ese formato
o no es una fecha real, devuelve '' (no se inventa una hora).
```


---


# Archivo 08_Activadores.gs

Todos los activadores (triggers) del proyecto en un solo archivo: `activarTodosLosActivadores()` y `desactivarTodosLosActivadores()`, con horarios en `ACTIVADORES_CONFIG`. Excluye el torneo en vivo y las continuaciones de tandas. Los IDs de bloque llevan prefijo `08`. El bloque grande del encabezado contiene los "AVISOS ABIERTOS" 1-8 (frecuencias, consumo de cuota diaria, colisiones, UptimeRobot).


## Índice de bloques movidos

| ID | Líneas orig. | Ubicación | Resumen |
|---|---|---|---|
| 08B001 | 8-70 | `Cabecera del archivo` | EXCEPCION: el activador del TORNEO EN VIVO (_tickTorneoEnVivo) NO esta aqui. Es temporal (se instala al iniciar un |
| 08B002 | 72-78 | `Cabecera del archivo` | Tipos admitidos: |
| 08B003 | 80-82 | `ACTIVADORES_CONFIG` | ---- Captura de guerra (la unica que consulta la API a diario) ---- |
| 08B004 | 110-114 | `ACTIVADORES_HANDLERS_LEGADOS_` | activarTodosLosActivadores() |
| 08B005 | 130-135 | `activarTodosLosActivadores` | desactivarTodosLosActivadores() |
| 08B006 | 143-145 | `desactivarTodosLosActivadores` | Helpers internos |

---

## Detalle (texto original, sin cambios)

Cada bloque se copió tal cual estaba en el `.gs` (sin los `//`). Los números de línea son los del archivo ANTES de la limpieza.


### Ubicación: `Cabecera del archivo`

#### 08B001 — líneas 8-70 (comentario)

```text

EXCEPCION: el activador del TORNEO EN VIVO (_tickTorneoEnVivo) NO esta aqui. Es temporal (se instala al iniciar un
torneo y se autoelimina a las 2 h) y se maneja aparte: iniciarTorneoEnVivo()/detenerTorneoEnVivo() en 00_Main.gs,
logica real en 26_Torneos_Core.gs. activar/desactivarTodosLosActivadores() no lo tocan.
Tampoco se tocan las continuaciones automaticas de las cadenas por tandas (_continuarRunAll, _continuarRunUpdate,
_continuarRunGuerraRapido, ...): las crea y borra el propio motor de tandas; para pararlas usar cancelarEjecucion().

AVISOS ABIERTOS (pendientes de definir o contestar):
 1. runPendientesYMensajesProgramado: cada 5 min (cambiado de 10 a 5 el 05-oct-2026 a pedido del usuario: "la mayor
    frecuencia posible sin comprometer la cuota"). Valor elegido por Claude con la medicion del AVISO 6: PENDIENTE DE
    CONFIRMAR por el usuario. Motivo: el dato solo cambia cuando runGuerra captura (cada 5 min dentro de la ventana
    4:00-4:59 a.m. Lima, 1 vez por hora fuera de ella), asi que correr mas seguido que cada 5 min no aporta nada.
    Cada 1 min serian 1.440 disparos/dia x ~4-8 s = 1,6 a 3,2 h/dia solo en disparos vacios. Pasar de 10 a 5 min
    cuesta ~+0,2 h/dia. Valores validos de everyMinutes: 1, 5, 10, 15, 30.
 2. runGuerraRapidoProgramado: se queda en 2 h. CORRECCION a lo dicho antes: se penso que, al no hacer nada sin
    captura nueva, podia correr mas seguido "sin costo". No es asi: runGuerra captura al menos 1 vez por hora, asi
    que cada disparo SI encuentra captura nueva y hace la cadena completa. Esa cadena dura entre ~440 y ~600 s
    (contexto.md: la de las 0:26 tardo 438 s y la de las 4:26 601 s), o sea ~1,5 a 2 h/dia a 2 h de frecuencia.
    Cada hora serian ~3 a 4 h/dia y el total pasaria de las 6 h. (everyHours solo admite 1, 2, 4, 6, 8 y 12.)
    Saltarse la API ahorra solo ~20 s por cadena: el tiempo se va en Directorio (~50 s), Nuevos (~3 min) y
    Control (~90 s). PENDIENTE DE DEFINIR: si se quiere mas frecuencia, habria que aligerar la cadena.
 3. Los 3 activadores que antes eran de instalacion manual y opcional (descargarCards semanal,
    resolverAlertasHistorialGuerra diario, _autogenerarParCRListaSiCorrespondeInicioTemporada diario) ahora se instalan
    con todos los demas. Si no se quieren, poner activo:false en ACTIVADORES_CONFIG.
 4. HORA / ZONA HORARIA: atHour(h) usa la zona horaria del proyecto de Apps Script y Apps Script lo ejecuta en
    algun momento entre h:00 y h:59. Los comentarios historicos de installTriggers() asumian "hora UTC" (ej.
    atHour(12) = 07:00 Peru); el manifiesto (appsscript.json) no esta en Base.md, asi que NO se pudo verificar la
    zona del proyecto. Verificar en Configuracion del proyecto que ninguno caiga entre 4:00 y 4:59 a.m. Lima
    (ventana de guerra protegida). Los horarios de abajo se conservaron TAL CUAL estaban.
 5. desactivarTodosLosActivadores() ya no borra "todo" como hacia removeTriggers(): solo los administrados aqui
    (ver ACTIVADORES_HANDLERS_LEGADOS_ para disparadores antiguos que tambien se retiran).
 6. CONSUMO DE TIEMPO DE DISPARADORES (medido el 05-oct-2026 en contexto.md: 93 ejecuciones entre las 22:08 del
    04-oct y las 5:42 del 05-oct). ESTIMACION por dia con esta configuracion (runGuerra 5 min, Pendientes 5 min,
    Rapido 2 h, ping 10 min, ver AVISO 8b): runGuerra ~6.600 s (23 corridas completas de ~190 s, 12 ligeras de la ventana de
    ~100 s y ~250 disparos vacios de ~4 s), runGuerraRapidoProgramado ~5.400 s, pingProxyRender ~750 s
    (DESACTIVADO el 05-oct-2026, ver AVISO 8b: sin el, esos ~750 s no se gastan), Pendientes/Mensajes ~1.700 s,
    diarios ~2.000 s (SUPUESTO: no hay logs de runUpdate, runSyncCSV, etc.).
    Total ~16.500 s = ~4,6 h/dia con el ping y ~15.800 s = ~4,4 h/dia sin el, con error posible de +-1 h. Limite: 6 h/dia en Google Workspace, 90 min/dia en
    cuenta gratuita. Como el proyecto lleva dias corriendo con mas de 3 h/dia, solo es posible con el limite de 6 h
    (PENDIENTE DE CONFIRMAR que la cuenta es Workspace). Margen ~1,6 h sin el ping (1,4 h con el). Si se superara, los disparadores fallan hasta
    que se reinicia la cuota. CORRECCION a lo dicho antes: se hablo de 2,5 a 3 h/dia; con la medicion completa eran
    ~4,4 h/dia ANTES de este cambio. Cualquier disparador nuevo o mas frecuente debe revisarse contra este margen.
 7. POSIBLE COLISION runPendientesYMensajesProgramado vs runGuerra DENTRO de la ventana (NO verificable sin ejecutar).
    Los activadores creados juntos conservan la misma fase: en contexto.md pingProxyRender corre a :x2:08 y runGuerra
    a :x7:53, es decir la misma fase cada 5 min. Si Pendientes cae pegado a runGuerra, puede ver el candado global
    tomado (la corrida ligera dura 1-2 min por ciclo) y omitirse con "OMITIDO: hay otra ejecucion en curso
    (runGuerra". Ese omitir supone que runGuerra ya escribe Pendientes/Mensajes, pero la corrida LIGERA de la ventana
    NO los escribe. Como comprobarlo: tras instalar, revisar en Ejecuciones los logs entre las 4:00 y las 4:59 a.m.;
    si casi todos los disparos dicen OMITIDO, hay que cambiar la regla. PENDIENTE DE DEFINIR (no se cambio codigo).
 8. IDEAS PENDIENTES DE DEFINIR (no hechas): a) un disparo vacio cuesta ~2 a 8 s aunque no haga nada, porque Apps
    Script carga los ~4,8 MB de codigo en cada ejecucion; no se puede bajar con un chequeo por propiedad, solo se
    ahorraria la lectura del checkpoint en Drive (~1 a 3 s por disparo vacio, ~250 a 750 s/dia). b) CORRECCION (05-oct-2026, el usuario mostro su panel de UptimeRobot): el monitor "Render" de UptimeRobot hace un
    GET cada 5 min a https://clash-royale-proxy-2eyr.onrender.com, la MISMA URL (CFG.API_BASE) y el MISMO GET que
    hacia pingProxyRender, y el proxy lleva 2 meses 12 dias arriba con 100% de disponibilidad. El docblock de
    pingProxyRender() en 09_API_ClashRoyale.gs dice que UptimeRobot solo mantiene despierta la Web App de Apps
    Script y no toca el proxy: eso ya NO es cierto (docblock desactualizado, se corrige la proxima vez que se edite
    07; la funcion se conserva, solo se quito su activador). Por eso pingProxyRender quedo con activo:false: era
    redundante y gastaba ~750 s/dia (144 disparos de ~5 s). Se retira al volver a correr activarTodosLosActivadores().
    RIESGO CUBIERTO (05-oct-2026): si UptimeRobot se pausa o falla, 45_Vigilante_UptimeRobot.gs lo detecta (desde
    runGuerra, sin activador nuevo) y pingea el proxy por su cuenta hasta que UptimeRobot vuelva; no hace falta
    poner activo:true aqui. Requiere la propiedad UPTIMEROBOT_API_KEY (ver encabezado de ese archivo). Las horas gratuitas de Render (~744 h/mes de 750 si esta despierto
    24/7) se gastan igual con o sin ping, porque lo despierta UptimeRobot: sigue PENDIENTE DE CONFIRMAR en el panel
    de Render, sobre todo si hay otro servicio gratuito en la misma cuenta.
```

#### 08B002 — líneas 72-78 (comentario)

```text
Tipos admitidos:
  { tipo:'minutos', cada:N }              -> everyMinutes(N)
  { tipo:'horas',   cada:N }              -> everyHours(N)
  { tipo:'diario',  hora:H }              -> everyDays(1).atHour(H)
  { tipo:'semanal', dia:1..7, hora:H }    -> onWeekDay(dia).atHour(H)   (1 = lunes ... 7 = domingo)
  { tipo:'edicion' }                      -> onEdit() de la hoja de calculo
activo:false lo omite al activar (y sigue retirandose al desactivar).
```


### Ubicación: `ACTIVADORES_CONFIG`

#### 08B003 — líneas 80-82 (comentario)

```text
---- Captura de guerra (la unica que consulta la API a diario) ----
Cada 5 min todo el dia; la funcion filtra: ventana ligera 4:00-4:59 a.m. Lima en cada disparo, y el resto del dia
trabajo completo 1 vez por hora (ver runGuerra(), 00_Main.gs).
```


### Ubicación: `ACTIVADORES_HANDLERS_LEGADOS_`

#### 08B004 — líneas 110-114 (docblock)

```text
activarTodosLosActivadores()
UNICA funcion para instalar los activadores del proyecto. Idempotente: primero retira los administrados aqui (y los
legados) y luego crea los de ACTIVADORES_CONFIG con activo:true. No toca el torneo en vivo ni las continuaciones.
```


### Ubicación: `activarTodosLosActivadores`

#### 08B005 — líneas 130-135 (docblock)

```text
desactivarTodosLosActivadores()
UNICA funcion para retirar los activadores del proyecto. Borra solo los administrados desde este archivo
(ACTIVADORES_CONFIG + ACTIVADORES_HANDLERS_LEGADOS_). No toca el torneo en vivo ni las continuaciones de las
cadenas por tandas (para esas: detenerTorneoEnVivo() y cancelarEjecucion()).
```


### Ubicación: `desactivarTodosLosActivadores`

#### 08B006 — líneas 143-145 (comentario)

```text
---------------------------------------------------------------------------
Helpers internos
---------------------------------------------------------------------------
```


---


