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


# Archivo 09_API_ClashRoyale.gs

Capa de acceso a la API de Clash Royale (vía proxy) y a Drive: fetch de clanes/jugadores/battlelog/etc., caches, checkpoints, nombres de archivos JSON, `pingProxyRender()`. Los IDs de bloque llevan prefijo `09`.


## Índice de bloques movidos

| ID | Líneas orig. | Ubicación | Resumen |
|---|---|---|---|
| 09B001 | 9-30 | `Cabecera del archivo` | Servicio de API: cache global CACHE_CLAN_DATA, _fetchAllClanData() y _apiGet(). |
| 09B002 | 32-36 | `Cabecera del archivo` | CACHE GLOBAL |
| 09B003 | 39-41 | `CACHE_CLAN_DATA` | FIX (02-oct-2026): tags cuyo /currentriverrace falló en la última |
| 09B004 | 44-50 | `CLANES_SIN_RIVERRACE` | Memoización DENTRO DE UNA MISMA EJECUCIÓN de Apps Script (se resetea |
| 09B005 | 55-116 | `_playersCompletoEnEstaEjecucion` | _apiGet() - Función base de petición HTTP |
| 09B006 | 122-125 | `API_GET_ESPERA_BASE_MS` | FIX (12-sep-2026): espera base específica para HTTP 429 — más generosa que |
| 09B007 | 128-130 | `API_GET_ESPERA_429_MS` | ENDPOINTS A CACHEAR |
| 09B008 | 148-152 | `CACHE_ENDPOINT_PLAYER` | CACHE EN MEMORIA (sesión actual de ejecución) |
| 09B009 | 155-211 | `_DRIVE_CACHE_MEM` | AVISOS ABIERTOS / VERIFICACIONES ABIERTAS |
| 09B010 | 213-233 | `_DRIVE_CACHE_MEM` | AVISOS ABIERTOS / VERIFICACIONES ABIERTAS — pregunta 51, tanda 2: CSV de battlelogs |
| 09B011 | 235-254 | `_DRIVE_CACHE_MEM` | AVISOS ABIERTOS / VERIFICACIONES ABIERTAS — pregunta 52: periodIndex POR CLAN |
| 09B012 | 256-310 | `_DRIVE_CACHE_MEM` | AVISOS ABIERTOS / VERIFICACIONES ABIERTAS — FASE B: JSON sueltos -> "Otros" |
| 09B013 | 312-320 | `_DRIVE_CACHE_MEM` | Claves normalizadas (ver _normalizarNombreClan_) -> ID de la subcarpeta de |
| 09B014 | 329-340 | `_SUBCARPETAS_CLAN_` | CARPETAS_JSON_POR_ENDPOINT_ |
| 09B015 | 346-352 | `CARPETAS_JSON_POR_ENDPOINT_` | Claves normalizadas (ver _normalizarNombreClan_) -> ID de la subcarpeta de |
| 09B016 | 361-367 | `_SUBCARPETAS_CLAN_POR_ENDPOINT_CLANS_` | Claves normalizadas (ver _normalizarNombreClan_) -> ID de la subcarpeta de |
| 09B017 | 376-382 | `_SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_` | endpointKey (CACHE_ENDPOINTS[].key) -> { carpeta raíz de ese endpoint |
| 09B018 | 394-418 | `_ENDPOINT_ROOT_Y_SUBCARPETAS_CLAN_` | ÍNDICE EN MEMORIA de la carpeta Players (FIX 23/07/2026) |
| 09B019 | 424-471 | `_PLAYERS_DRIVE_INDEX_POR_TAG` | SECCION 1: FUNCIONES MANUALES (entry points ejecutables a mano desde el |
| 09B020 | 473-487 | `_PLAYERS_DRIVE_INDEX_POR_TAG` | MANTENIMIENTO MANUAL — ejecutar UNA sola vez desde el editor de Apps Script |
| 09B021 | 495-501 | `resetGuardianPeriodIndex` | NOTA DE REORDEN (23-ago-2026, pedido usuario): las funciones manuales |
| 09B022 | 503-508 | `resetGuardianPeriodIndex` | guardarApiDump() |
| 09B023 | 538-583 | `guardarApiDump` | LIMPIEZA DE DUPLICADOS — CACHE DE PLAYERS |
| 09B024 | 585-592 | `guardarApiDump` | limpiarDuplicadosCachePlayers() |
| 09B025 | 662-720 | `limpiarDuplicadosCachePlayers` | descargarCards() |
| 09B026 | 728-735 | `descargarCards` | RESPALDO AUTOMÁTICO (27-sep-2026, pedido del usuario): si /cards falla |
| 09B027 | 747-749 | `descargarCards` | 1) JSON completo, respuesta cruda sin filtrar ningún campo. Solo tiene |
| 09B028 | 766-769 | `descargarCards` | 2) Mapa id -> carta, mismo shape que _getCardsFromCache()/ |
| 09B029 | 777-781 | `descargarCards` | 3) Actualizar Backup_Cards.csv EN EL MISMO archivo (no se crea uno |
| 09B030 | 850-872 | `descargarCards` | TRIGGER SEMANAL DE descargarCards() (27-sep-2026, pedido del usuario) |
| 09B031 | 874-877 | `descargarCards` | MOVIDO (05-oct-2026, pedido usuario): activarTriggerDescargarCards()/desactivarTriggerDescargarCards() ya no viven |
| 09B032 | 880-891 | `descargarCards` | buscarClanesPorNombre(nombre) |
| 09B033 | 910-931 | `buscarClanesPorNombre` | buscarClanesPorNombreYUbicacion(nombre, locationId) |
| 09B034 | 933-936 | `buscarClanesPorNombre` | nombre y locationId que se usan si buscarClanesPorNombreYUbicacion() se |
| 09B035 | 969-988 | `buscarClanesPorNombreYUbicacion` | buscarClanesPorUbicacion(locationId) |
| 09B036 | 990-993 | `buscarClanesPorNombreYUbicacion` | locationId que se usa si buscarClanesPorUbicacion() se corre sin argumento |
| 09B037 | 1019-1043 | `buscarClanesPorUbicacion` | descargarClanMiembros(tag, limit) |
| 09B038 | 1045-1047 | `buscarClanesPorUbicacion` | tag de clan que se usa si descargarClanMiembros() se corre sin argumento |
| 09B039 | 1079-1092 | `descargarClanMiembros` | que se están implementando en este bloque (Locations, Seasons, Cards, |
| 09B040 | 1094-1124 | `descargarClanMiembros` | descargarGlobalTournaments() |
| 09B041 | 1152-1191 | `descargarGlobalTournaments` | descargarLocations() |
| 09B042 | 1237-1270 | `descargarLocations` | descargarLocationPorId(id) |
| 09B043 | 1272-1275 | `descargarLocations` | ID que se usa si descargarLocationPorId() se corre sin argumento desde el |
| 09B044 | 1311-1347 | `descargarLocationPorId` | descargarRankingClanesPorUbicacion(locationId, limit) |
| 09B045 | 1349-1352 | `descargarLocationPorId` | locationId que se usa si descargarRankingClanesPorUbicacion() se corre sin |
| 09B046 | 1391-1458 | `descargarRankingClanesPorUbicacion` | descargarRankingJugadoresPorUbicacion(locationId, limit) |
| 09B047 | 1460-1463 | `descargarRankingClanesPorUbicacion` | locationId que se usa si descargarRankingJugadoresPorUbicacion() se corre |
| 09B048 | 1502-1541 | `descargarRankingJugadoresPorUbicacion` | descargarRankingClanesGuerraPorUbicacion(locationId, limit) |
| 09B049 | 1543-1546 | `descargarRankingJugadoresPorUbicacion` | locationId que se usa si descargarRankingClanesGuerraPorUbicacion() se |
| 09B050 | 1585-1629 | `descargarRankingClanesGuerraPorUbicacion` | descargarRankingJugadoresCaminoLeyendasPorUbicacion(locationId, limit) |
| 09B051 | 1631-1634 | `descargarRankingClanesGuerraPorUbicacion` | locationId que se usa si descargarRankingJugadoresCaminoLeyendasPorUbicacion() |
| 09B052 | 1673-1698 | `descargarRankingJugadoresCaminoLeyendasPorUbicacion` | descargarRankingGlobalClanes(limit) |
| 09B053 | 1721-1723 | `descargarRankingGlobalClanes` | La respuesta es un array plano (a diferencia de otros endpoints que |
| 09B054 | 1733-1772 | `descargarRankingGlobalClanes` | descargarRankingGlobalJugadores(limit) |
| 09B055 | 1805-1824 | `descargarRankingGlobalJugadores` | descargarRankingGlobalGuerraClanes(limit) |
| 09B056 | 1856-1903 | `descargarRankingGlobalGuerraClanes` | descargarRankingGlobalJugadoresCaminoLeyendasPorTemporada(seasonId, limit) |
| 09B057 | 1904-1906 | `descargarRankingGlobalGuerraClanes` | seasonId que se usa si descargarRankingGlobalJugadoresCaminoLeyendasPorTemporada() |
| 09B058 | 1950-2005 | `descargarRankingGlobalJugadoresCaminoLeyendasPorTemporada` | descargarSeasons() |
| 09B059 | 2030-2034 | `descargarSeasons` | 2) CSV: N° (posición 1-based, calculada) + id (Supercell "YYYY-MM") + |
| 09B060 | 2072-2107 | `descargarSeasons` | descargarBattlelogJugador(playerTag) |
| 09B061 | 2109-2111 | `descargarSeasons` | playerTag que se usa si descargarBattlelogJugador() se corre sin argumento |
| 09B062 | 2140-2142 | `descargarBattlelogJugador` | Buscar si ya existe un archivo de este jugador en la carpeta |
| 09B063 | 2170-2177 | `descargarBattlelogJugador` | IMPLEMENTADO (26-sep-2026, pedido del usuario -- resuelve la "TAREA |
| 09B064 | 2196-2199 | `descargarBattlelogJugador` | NUEVO (2-oct-2026, pregunta 51, tanda 2): ademas del JSON, agrega las |
| 09B065 | 2218-2251 | `descargarBattlelogJugador` | _registrarBattlelogEnCsv_(data, tag, nombreArchivo) |
| 09B066 | 2362-2401 | `_registrarBattlelogEnCsv_` | descargarUpcomingChestsJugador(playerTag) |
| 09B067 | 2403-2405 | `_registrarBattlelogEnCsv_` | playerTag que se usa si descargarUpcomingChestsJugador() se corre sin |
| 09B068 | 2434-2436 | `descargarUpcomingChestsJugador` | Buscar si ya existe un archivo de este jugador en la carpeta (mismo |
| 09B069 | 2480-2537 | `descargarUpcomingChestsJugador` | _descargarBattlelogYCofresParaTodos() |
| 09B070 | 2539-2543 | `_descargarBattlelogYCofresParaTodos` | CAMBIO (29-sep-2026, pedido de la usuaria): ya no depende de |
| 09B071 | 2551-2556 | `_descargarBattlelogYCofresParaTodos` | Mismo criterio que _fetchAllClanData(): asegura /players en cache antes |
| 09B072 | 2575-2577 | `_descargarBattlelogYCofresParaTodos` | Cargar progreso de una tanda anterior de ESTE MISMO ciclo (ver |
| 09B073 | 2645-2655 | `_descargarBattlelogYCofresParaTodos` | PERSISTENCIA DE PROGRESO DE BATTLELOG + UPCOMINGCHESTS (para reanudación |
| 09B074 | 2657-2663 | `_descargarBattlelogYCofresParaTodos` | _guardarProgresoBattlelogChests(tagsHechos) |
| 09B075 | 2679-2687 | `_guardarProgresoBattlelogChests` | _cargarProgresoBattlelogChests() |
| 09B076 | 2715-2723 | `_cargarProgresoBattlelogChests` | _borrarProgresoBattlelogChests() |
| 09B077 | 2736-2748 | `_borrarProgresoBattlelogChests` | _agregarCartasApiAMapa(map, items, esTorre) |
| 09B078 | 2768-2777 | `_agregarCartasApiAMapa` | _buildBattlelogFilename(playerTag, clanName) |
| 09B079 | 2784-2796 | `_buildBattlelogFilename` | _extraerClanDeBattlelog(data, playerTagNormalizado) |
| 09B080 | 2811-2818 | `_extraerClanDeBattlelog` | _leerCofresCSV() |
| 09B081 | 2832-2836 | `_leerCofresCSV` | _guardarCofresCSV(headers, rows) |
| 09B082 | 2842-2855 | `_guardarCofresCSV` | _actualizarBackupCofresConChests(items) |
| 09B083 | 2876-2882 | `_actualizarBackupCofresConChests` | FIX (27-sep-2026, pedido usuario -- se agregó a mano la columna Link a |
| 09B084 | 2897-2905 | `_actualizarBackupCofresConChests` | _leerArenaCSV() |
| 09B085 | 2917-2922 | `_leerArenaCSV` | _guardarArenaCSV(headers, rows) |
| 09B086 | 2935-2952 | `_guardarArenaCSV` | _actualizarBackupArenaConBattlelog(battles) |
| 09B087 | 2989-3013 | `_actualizarBackupArenaConBattlelog` | _resolverArenaDesdeCatalogo(rawName) |
| 09B088 | 3032-3057 | `_resolverArenaDesdeCatalogo` | _actualizarBackupModoConBattlelog(battles) |
| 09B089 | 3101-3114 | `_actualizarBackupModoConBattlelog` | _guardarJsonClanesConsultaTemporalEnDrive(datos) |
| 09B090 | 3133-3143 | `_guardarJsonClanesConsultaTemporalEnDrive` | _guardarJsonBusquedaNombreEnDrive(nombreBuscado, datos) |
| 09B091 | 3162-3183 | `_guardarJsonBusquedaNombreEnDrive` | SECCION 2: RESTO DE FUNCIONES (cache, fetch de API, helpers internos). |
| 09B092 | 3185-3193 | `_guardarJsonBusquedaNombreEnDrive` | Llama solo a /clans/{tag} y /clans/{tag}/currentriverrace para todos los |
| 09B093 | 3200-3225 | `_fetchClanesBasico` | FIX (06-ago-2026): antes, esta función SIEMPRE pedía los 5 clanes a la |
| 09B094 | 3254-3258 | `_fetchClanesBasico` | LOG DE PERIODO (05-oct-2026, pedido usuario): sectionIndex/periodIndex/periodType TAL CUAL los |
| 09B095 | 3276-3281 | `_fetchClanesBasico` | Filtrar cuentas ocultas manualmente (ver CFG.TAGS_OCULTOS en |
| 09B096 | 3293-3296 | `_fetchClanesBasico` | API falló para este clan. FIX (02-oct-2026): antes el clan quedaba |
| 09B097 | 3333-3340 | `_fetchClanesBasico` | FIX (06-ago-2026): guarda lo recién obtenido en Drive para que la |
| 09B098 | 3348-3352 | `_fetchClanesBasico` | NUEVO (05-oct-2026, pedido usuario: "mostrar en la web la ultima hora de consulta a la api"): se anota que |
| 09B099 | 3361-3369 | `_fetchClanesBasico` | PERSISTENCIA DE PROGRESO DE CLANES (para reanudación sin repetir) |
| 09B100 | 3371-3378 | `_fetchClanesBasico` | _guardarProgresoClanes(cacheClanData) |
| 09B101 | 3401-3416 | `_guardarProgresoClanes` | _cargarProgresoClanes(maxEdadMs) |
| 09B102 | 3432-3440 | `_cargarProgresoClanes` | NOTA (08-ago-2026): antes esto siempre borraba el archivo |
| 09B103 | 3450-3454 | `_cargarProgresoClanes` | _cargarProgresoClanesSinEdad() |
| 09B104 | 3468-3472 | `_cargarProgresoClanesSinEdad` | _invalidarProgresoClanes() |
| 09B105 | 3481-3483 | `_invalidarProgresoClanes` | NUEVO (05-oct-2026): se conserva la hora real de captura en _tsReal (solo la primera vez) para que |
| 09B106 | 3494-3507 | `_invalidarProgresoClanes` | LECTURA DEL CHECKPOINT DE CLANES SIN LLAMAR A LA API (05-oct-2026, pedido usuario) |
| 09B107 | 3509-3511 | `_invalidarProgresoClanes` | Edad maxima aceptada por las lecturas SIN API. Por encima de este valor se considera que la captura de |
| 09B108 | 3518-3523 | `CLANES_SIN_API_TS_CARGADO` | _leerProgresoClanesConEdad_() |
| 09B109 | 3539-3547 | `_leerProgresoClanesConEdad_` | _fetchClanesBasicoSinApi(maxEdadMs) |
| 09B110 | 3591-3597 | `_fetchClanesBasicoSinApi` | _borrarProgresoClanes() |
| 09B111 | 3608-3615 | `_borrarProgresoClanes` | Llama a la API para todos los clanes (datos básicos) Y, si |
| 09B112 | 3619-3623 | `_fetchAllClanData` | IMPORTANTE: _fetchPlayersData() SIEMPRE se llama, sin importar |
| 09B113 | 3635-3638 | `_fetchAllClanData` | Se propaga hacia _ejecutarPorTandas() (00_Main.gs): si /players quedó |
| 09B114 | 3642-3657 | `_fetchAllClanData` | Llama a /players/{tag} según el valor de PLAYERS_API_ENABLED. |
| 09B115 | 3659-3668 | `_fetchPlayersData` | FASE 1 (plan de cambios, ver 01_Config_Global.gs): interruptor de "esta |
| 09B116 | 3686-3710 | `_fetchPlayersData` | FASE 12 (18/07/2026): los admins se cargan PRIMERO, antes que los |
| 09B117 | 3774-3779 | `_fetchPlayersData` | FIX (23/07/2026): antes no se llevaba registro de qué tags fallaban al |
| 09B118 | 3782-3786 | `_fetchPlayersData` | periodIndex REAL del periodo de guerra actual (entero que entrega la API |
| 09B119 | 3799-3803 | `_fetchPlayersData` | Límite de consultas por tanda (CFG.PLAYERS_FETCH_MAX_POR_TANDA), |
| 09B120 | 3816-3822 | `_fetchPlayersData` | FIX (19/07/2026): antes NINGÚN punto del flujo real llamaba a |
| 09B121 | 3832-3839 | `_fetchPlayersData` | FIX (23/07/2026): antes cada jugador obtenido/guardado dejaba su propia |
| 09B122 | 3851-3865 | `_fetchPlayersData` | FASE 21 (01/08/2026): antes se llamaba a _borrarProgresoPlayers() acá |
| 09B123 | 3871-3878 | `_fetchPlayersData` | PERSISTENCIA DE PROGRESO DE /players (para reanudación sin repetir) |
| 09B124 | 3880-3888 | `_fetchPlayersData` | _guardarProgresoPlayers(playersMap) |
| 09B125 | 3904-3927 | `_guardarProgresoPlayers` | _cargarProgresoPlayers() |
| 09B126 | 3937-3940 | `_cargarProgresoPlayers` | Compatibilidad hacia atrás: si el archivo es un mapa "pelado" (formato |
| 09B127 | 3961-3969 | `_cargarProgresoPlayers` | _borrarProgresoPlayers() |
| 09B128 | 3980-3986 | `_borrarProgresoPlayers` | Obtiene los tags de TODAS las cuentas marcadas como Admin = "Sí" en la |
| 09B129 | 4011-4015 | `_getTagsAdmin` | Obtiene los tags de jugadores que tienen V_Guerra vacío en la hoja Directorio. |
| 09B130 | 4043-4048 | `_getTagsConVGuerraVacia` | _getBadgeLevel(playerData, badgeName) |
| 09B131 | 4059-4064 | `_getBadgeLevel` | _getBadgeProgress(playerData, badgeName) |
| 09B132 | 4075-4080 | `_getBadgeProgress` | Extrae el valor de V_Guerra (ClanWarWins badge) del objeto /players. |
| 09B133 | 4091-4095 | `_getVGuerra` | Extrae el progress de collectionLevel del objeto /players. |
| 09B134 | 4106-4114 | `_getNivel2` | Realiza una petición GET al proxy de la API de Clash Royale. |
| 09B135 | 4138-4142 | `_apiGet` | FIX (02-oct-2026): el proxy (Render) detrás de Cloudflare devuelve a |
| 09B136 | 4152-4158 | `_apiGet` | FIX (12-sep-2026): HTTP 429 (rate limit) también es transitorio — |
| 09B137 | 4188-4220 | `_apiGet` | pingProxyRender() |
| 09B138 | 4233-4235 | `pingProxyRender` | Helpers de acceso al cache (para uso en otros módulos) |
| 09B139 | 4265-4269 | `_setPlayerCache` | Obtiene el contexto de temporada/semana/día del primer clan Terna disponible en cache. |
| 09B140 | 4291-4318 | `_getCtx` | FIX (19-ago-2026, diagnóstico "Control_2 no reconstruye nada de la |
| 09B141 | 4329-4343 | `_getCtx` | Si NINGÚN clan tiene cache cargado (ej. una llamada aislada a _getCtx() |
| 09B142 | 4357-4371 | `_getCtx` | GUARDIÁN ANTI-PERIODINDEX-DESACTUALIZADO (stale de la API) |
| 09B143 | 4410-4421 | `_getCtx` | _normalizarNombreClan_(nombre) |
| 09B144 | 4430-4445 | `_normalizarNombreClan_` | _getCarpetaParaClan(clanName) |
| 09B145 | 4450-4465 | `_getCarpetaParaClan` | _getSubcarpetaEndpoint_(carpetaClanInfo, endpointKey) |
| 09B146 | 4493-4506 | `_pad2_` | _buildPrefijoTSP_(ctx) |
| 09B147 | 4516-4524 | `_buildPrefijoTSP_` | _horaLimaNow() |
| 09B148 | 4529-4544 | `_horaLimaNow` | _horaLimaMensaje12h(d) |
| 09B149 | 4549-4567 | `_horaLimaMensaje12h` | _buildCacheFilename(ctx, endpointKey, clanName) |
| 09B150 | 4584-4592 | `_normalizarPeriodIndex_` | _buildCacheSuffix(endpointKey) |
| 09B151 | 4597-4613 | `_buildCacheSuffix` | _cargarCacheDesideDrive(clanTag, endpointKey, ctxOrPeriodIndex) |
| 09B152 | 4625-4631 | `_cargarCacheDesideDrive` | Buscar en la subcarpeta del clan/endpoint si ya conocemos el nombre del |
| 09B153 | 4680-4694 | `_tsLimaLog_` | _temporadaDeClan_(ctx, periodIndexClan) |
| 09B154 | 4716-4724 | `_temporadaProbableClan_` | _temporadasActivasGuerra_(ctx) |
| 09B155 | 4748-4759 | `_fmtDiaGuerraLog_` | _lineaPeriodoClan_(origen, nombre, tag, rr, ctx, ctxClan) |
| 09B156 | 4802-4817 | `_lineaPeriodoClan_` | _ctxPorClanDesdeDatos_(ctx, endpointKey, datos) |
| 09B157 | 4841-4867 | `_ctxPorClanDesdeDatos_` | _guardarCacheEnDrive(clanTag, endpointKey, ctxOrPeriodIndex, datos) |
| 09B158 | 4875-4878 | `_guardarCacheEnDrive` | FIX (1-oct-2026, pregunta 52): para currentriverrace el nombre del archivo |
| 09B159 | 4939-4956 | `_guardarCacheEnDrive` | _apiGetCached(clanTag, endpointKey, pathFn, ctx) |
| 09B160 | 4988-5000 | `_apiGetCached` | _buildPlayerFilename(playerTag, clanName) |
| 09B161 | 5007-5016 | `_buildPlayerFilename` | FASE 9bis (17-sep-2026, limpieza de código muerto, pedido del usuario): |
| 09B162 | 5018-5034 | `_buildPlayerFilename` | _getPlayersDriveIndexPorTag(folder) |
| 09B163 | 5058-5080 | `_getPlayersDriveIndexPorTag` | _guardarPlayerEnDrive(playerTag, periodIndex, datos) |
| 09B164 | 5084-5086 | `_guardarPlayerEnDrive` | Hora actual de Lima (para nombre de archivo y trazabilidad) |
| 09B165 | 5116-5119 | `_guardarPlayerEnDrive` | Sin log individual por jugador a propósito: con ~150-200 jugadores por |
| 09B166 | 5130-5137 | `_guardarPlayerEnDrive` | _cargarPlayerDesideDrive(playerTag) |
| 09B167 | 5150-5152 | `_cargarPlayerDesideDrive` | Buscar todos los archivos del tag (en cualquiera de los dos formatos) |
| 09B168 | 5180-5184 | `_cargarPlayerDesideDrive` | _apiGetPlayerCached(playerTag, periodIndex) |
| 09B169 | 5199-5206 | `_apiGetPlayerCached` | _fetchAllClanDataCached() |
| 09B170 | 5276-5299 | `_fetchPlayersCached` | LOG ACUMULATIVO DEL SCRIPT TERNA |
| 09B171 | 5301-5308 | `_fetchPlayersCached` | _registrarLogScriptTerna(funcion, descripcion, advertencias) |

---

## Detalle (texto original, sin cambios)

Cada bloque se copió tal cual estaba en el `.gs` (sin los `//`). Los números de línea son los del archivo ANTES de la limpieza.


### Ubicación: `Cabecera del archivo`

#### 09B001 — líneas 9-30 (comentario)

```text
=============================================================================
Servicio de API: cache global CACHE_CLAN_DATA, _fetchAllClanData() y _apiGet().
TODAS las hojas leen exclusivamente del cache. Nunca llaman a la API directamente.
Orden de consumo: /clans/{tag} -> /clans/{tag}/currentriverrace -> /players/{tag}

NOTA (28-jun-2026): se eliminó por completo el código de /riverracelog.
El proxy (clash-royale-proxy-2eyr.onrender.com) no tiene autorización
para consultar esa ruta (devolvía HTTP 404/500), así que no tiene sentido
mantener ese código aunque estuviera apagado por un interruptor.

NOTA (28-jun-2026): _fetchPlayersData() ahora es REANUDABLE. El proxy es
un servidor gratuito (Render free tier) y puede ser lento o quedarse sin
responder a mitad de la lista de /players. Antes, si la ejecución se
cortaba por exceder el tiempo máximo de Apps Script, la siguiente
continuación volvía a pedir TODOS los /players desde cero (incluyendo los
que ya se habían obtenido con éxito), multiplicando el consumo del
servidor gratuito sin necesidad. Ahora, cada jugador obtenido con éxito
se guarda de inmediato en un archivo de progreso en Drive
(PLAYERS_PROGRESS_FILE). Si la función se corta por presupuesto interno
de tiempo, devuelve `false` y NO se pierde lo ya obtenido: la próxima
vez que se llame, esos tags se saltan y solo se piden los que faltan.
=============================================================================
```

#### 09B002 — líneas 32-36 (comentario)

```text
---------------------------------------------------------------------------
CACHE GLOBAL
Se rellena UNA SOLA VEZ por ciclo de ejecución.
Estructura: { "#TAG": { info, members[], riverrace }, _players: {...} }
---------------------------------------------------------------------------
```


### Ubicación: `CACHE_CLAN_DATA`

#### 09B003 — líneas 39-41 (comentario)

```text
FIX (02-oct-2026): tags cuyo /currentriverrace falló en la última
_fetchClanesBasico() de esta ejecución (Pendientes lo usa para no borrar
la hoja con datos de guerra incompletos).
```


### Ubicación: `CLANES_SIN_RIVERRACE`

#### 09B004 — líneas 44-50 (comentario)

```text
Memoización DENTRO DE UNA MISMA EJECUCIÓN de Apps Script (se resetea
igual que CACHE_CLAN_DATA en cada ejecución nueva). Sin esto, si dos
pasos distintos de la misma tanda llaman a _fetchClanesBasico()/
_fetchAllClanData() (p.ej. el bootstrap de reanudación en
_ejecutarPorTandas() y luego runPendientesYMensajes()), cada llamada
volvía a borrar CACHE_CLAN_DATA y a repetir TODA la consulta — incluyendo
los 121 /players, ~100-140s — por segunda vez en la misma ejecución.
```


### Ubicación: `_playersCompletoEnEstaEjecucion`

#### 09B005 — líneas 55-116 (comentario)

```text
---------------------------------------------------------------------------
_apiGet() - Función base de petición HTTP
---------------------------------------------------------------------------
FIX (17-ago-2026, pedido usuario: "[API] Excepción en _apiGet(...):
Exception: Address unavailable... pero si ingreso manualmente al link, sí
carga la información"). Causa: el proxy (clash-royale-proxy-2eyr.onrender.com)
corre en Render free tier, que "duerme" el contenedor tras un rato sin
tráfico y tarda entre ~10 y ~50s en volver a levantarlo con la próxima
petición. Mientras el contenedor está a mitad de arrancar, la conexión
TCP puede fallar de entrada (Apps Script la reporta como "Address
unavailable", una excepción de RED, no un código HTTP) — por eso un solo
intento fallaba siempre en ese momento, pero visitar el mismo link a mano
unos segundos después (dándole tiempo al contenedor a terminar de
levantar) sí funcionaba. Antes _apiGet() NO reintentaba nada (a
diferencia de otras partes del proyecto, ver "3 reintentos, 2s/4s/8s" en
14_Nuevos_RoyaleAPI.gs) — un solo golpe de mala suerte con el proxy
dormido tumbaba ese clan/jugador por toda la corrida.
Ahora se reintenta automáticamente, con espera creciente, en tres casos:
  1) Excepción de RED (catch) — típicamente el proxy dormido/reiniciando.
  2) HTTP 502/503/504 — típico de la propia infraestructura de Render
     devolviendo un error de gateway mientras el contenedor sigue
     levantando (a diferencia de un 4xx real de la API, que SÍ es un
     error real y no vale la pena reintentar).
  3) HTTP 429 (ver FIX 12-sep-2026 abajo) — límite de tasa, también
     transitorio: reintentar con más espera SÍ cambia el resultado.
Un HTTP distinto de esos cuatro (400, 404, etc.) sigue sin reintentarse:
es una respuesta real del servidor, reintentar no cambiaría el resultado.

FIX (12-sep-2026, pedido usuario: "en la madrugada del sábado registró 4
ataques en el clan 2, 3 y 4, el clan principal estaba bien; tras Demoler +
runAll ahora deja huecos en esos mismos clanes"): causa raíz encontrada.
_fetchClanesBasico() (más abajo en este archivo) recorre CFG.CLAN_TAGS
EN ORDEN y llama a _apiGet() para /clans/{tag} y /clans/{tag}/currentriverrace
de cada clan, uno tras otro (con solo 300ms de pausa entre clanes). El
clan principal es CFG.CLAN_TAGS[0] (CFG.TERNA_TAGS[0]), así que sus
llamadas salen primero, cuando todavía no se acumularon suficientes
peticiones para chocar con el rate limit del proxy/API — pero los clanes
2, 3 y 4 (índices 1, 2, 3) salen después, y son los que más
probablemente reciben un HTTP 429 ("Too Many Requests") del proxy,
justamente cuando runAll() ya viene de una tanda pesada (Demoler acumula
MUCHAS llamadas seguidas: Directorio, Guerra, Control, Torneos, etc.).
Antes de este fix, un 429 NO estaba en la lista de códigos reintentables
(ver comentario de arriba: "Un HTTP distinto de esos tres... sigue sin
reintentarse"), así que _apiGet() devolvía null de inmediato. Eso hacía
que, en _fetchClanesBasico(), `info` (o `riverrace`) llegara null para
ese clan y se registrara "API FALLÓ al obtener info de clan X - se
conservan datos existentes" — es decir, CACHE_CLAN_DATA[tag] NO se
llenaba para ese clan en esa corrida. updateGuerraSheet() (17_GuerraSheet.gs)
entonces hace `if (!clanData) { ...'Sin cache para '+clanTag+', saltando.'; continue; }`
y ese clan queda TOTALMENTE sin procesar esa corrida: ningún participante
de ese clan recibe fila nueva ni actualización — de ahí los "huecos"
reportados justo en los clanes que salen después en el loop (2, 3, 4),
nunca en el principal (1). (El patrón previo "4 ataques y 0 fame" viene
de un bug distinto, ya corregido más arriba en este mismo archivo — ver
el FIX CRÍTICO del 04-sep-2026 en 17_GuerraSheet.gs sobre el ID de fila
sin Clan; si la copia de Apps Script en uso todavía no tenía ese fix
desplegado, podía convivir con este mismo problema de 429 al mismo
tiempo.) Solución: tratar 429 igual que 502/503/504 (transitorio,
reintentable), respetando el header Retry-After si el proxy lo manda, y
con una espera base más generosa que la de los gateways (los rate limits
suelen necesitar más tiempo que un contenedor reiniciando).
---------------------------------------------------------------------------
```


### Ubicación: `API_GET_ESPERA_BASE_MS`

#### 09B006 — líneas 122-125 (comentario)

```text
FIX (12-sep-2026): espera base específica para HTTP 429 — más generosa que
la de 502/503/504 (API_GET_ESPERA_BASE_MS), porque un rate limit typically
necesita más tiempo en enfriar que un contenedor de Render reiniciando.
Se usa Retry-After (en segundos) si el proxy lo manda; si no, este valor.
```


### Ubicación: `API_GET_ESPERA_429_MS`

#### 09B007 — líneas 128-130 (comentario)

```text
---------------------------------------------------------------------------
ENDPOINTS A CACHEAR
---------------------------------------------------------------------------
```


### Ubicación: `CACHE_ENDPOINT_PLAYER`

#### 09B008 — líneas 148-152 (comentario)

```text
---------------------------------------------------------------------------
CACHE EN MEMORIA (sesión actual de ejecución)
Evita múltiples llamadas Drive/API al mismo JSON en el mismo run.
Estructura: { "clanTag|endpoint" -> Object }
---------------------------------------------------------------------------
```


### Ubicación: `_DRIVE_CACHE_MEM`

#### 09B009 — líneas 155-211 (comentario)

```text
=============================================================================
AVISOS ABIERTOS / VERIFICACIONES ABIERTAS
-----------------------------------------------------------------------
(25-sep-2026) REORGANIZACIÓN DE DRIVE: "JSON" > "Endpoints" > "Clans" /
"CurrentRiverRace", y CADA UNA de esas dos carpetas de endpoint contiene
una subcarpeta por clan (ver DRIVE_FOLDER_ID_CLANS y
DRIVE_FOLDER_ID_CURRENTRIVERRACE en 01_Config_Global.gs, y las constantes
_SUBCARPETAS_CLAN_POR_ENDPOINT_CLANS_ / _..._CURRENTRIVERRACE_ / y el mapa
_ENDPOINT_ROOT_Y_SUBCARPETAS_CLAN_ más abajo en este mismo archivo).

HECHO (26-sep-2026): _getCarpetaParaClan() y _getSubcarpetaEndpoint_()
(más abajo en este archivo) ya resuelven "endpoint -> clan" (raíz del
endpoint primero, subcarpeta del clan dentro de ella después), en vez del
esquema viejo "clan -> endpoint". Esto cambia dónde leen/escriben
_cargarCacheDesideDrive()/_guardarCacheEnDrive() (ambas en este mismo
archivo, únicos dos llamadores de esas dos funciones AQUÍ) — o sea, el
cache normal de /clans y /clans/{tag}/currentriverrace que arma
_fetchAllClanData() en cada runAll()/runUpdate().

HECHO (26-sep-2026, misma sesión): las 4 llamadas de 17_GuerraSheet.gs
(recalcularGuerraLogsDesdeJSON(), reconstruirRivalesHistoricosGuerraLogs(),
_rellenarEstadoGuerraLogsHistorico_(), _limpiarFilasColiseoGuerraLogs_())
que armaban la carpeta a mano con el esquema VIEJO
(`_getSubcarpetaEndpoint_(DriveApp.getFolderById(_SUBCARPETAS_CLAN_[clave]), 'currentriverrace')`)
ya se actualizaron para leer directo de
_SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_ (entregado como archivo
puntual 17_GuerraSheet.gs). La llamada de _cruceMetaDesdeJsonDrive_()
(22_ControlCalendario.gs, no 17) ya usaba _getCarpetaParaClan()/
_getSubcarpetaEndpoint_() y quedó actualizada sola con el cambio de este
archivo, sin tocarla.

_SUBCARPETAS_CLAN_ y CARPETAS_JSON_POR_ENDPOINT_ (esquema viejo, más
abajo) ya NO tienen ningún llamador vivo DENTRO de Base — el único que
quedaba, limpiarDuplicadosCacheClanes(), se BORRÓ el 27-sep-2026 (pedido
del usuario, ver NOTA en el bloque "LIMPIEZA DE DUPLICADOS" más abajo en
este mismo archivo).

RESUELTO (27-sep-2026): se confirmó contra Tampermonkey.md y Generador.md
si algún archivo externo al proyecto todavía las espera por nombre.
Tampermonkey.md: NO -- es puramente cliente (corre en el navegador),
habla con el backend solo por acción HTTP (corregirGuerra, importarNuevos,
historialGuerra, verificarSemanaActual, listaCorreccionGuerra,
listaNuevosRoyaleAPI) y nunca conoce nombres de variables de Apps Script.
Generador.md: SÍ, aunque no por el nombre exacto de la variable de Base --
Generador tiene su PROPIA copia de este esquema (CARPETAS_CLAN_ con los
MISMOS 5 IDs de carpeta que _SUBCARPETAS_CLAN_, y su propia
CARPETAS_JSON_POR_ENDPOINT_, mismo nombre y mismos endpoints), y una
función ACTIVA (organizarArchivosJSON(), 04_Organizador_JSON.gs
( 04_Organizador_JSON.gs no pertenece a Base.md, sino a Generador.md) de ese
proyecto) que hoy sigue moviendo archivos sueltos de la carpeta raíz
"JSON" a esas mismas subcarpetas de clan/endpoint. El esquema viejo ya no
está en uso DENTRO de Base, pero la estructura de carpetas que describe
sigue viva porque Generador la administra activamente. CONCLUSIÓN: NO se
borran _SUBCARPETAS_CLAN_ ni CARPETAS_JSON_POR_ENDPOINT_ de este archivo
-- se dejan declaradas a propósito, como referencia documentada de esos 5
IDs de carpeta mientras Generador siga dependiendo de ese mismo esquema.
=============================================================================
```

#### 09B010 — líneas 213-233 (comentario)

```text
=============================================================================
AVISOS ABIERTOS / VERIFICACIONES ABIERTAS — pregunta 51, tanda 2: CSV de battlelogs
-----------------------------------------------------------------------
(2-oct-2026) HECHO, SIN PROBAR EN APPS SCRIPT REAL: descargarBattlelogJugador()
llama ahora a _registrarBattlelogEnCsv_() (funcion nueva, justo debajo de ella)
despues de guardar el JSON: agrega a Backup_Battlelogs.csv las batallas de
guerra de cada descarga (la usan la corrida masiva, la web y la descarga
manual). Misma clave que la siembra (battleTime + Tipo + Tag), asi que no
duplica lo ya sembrado. Depende de 06_Battlelogs_Siembra.gs (helpers _bls*).
CORRECCION (regla 9) al AVISO [3] de 06_Battlelogs_Siembra.gs: su punto (a)
(«que descargarBattlelogJugador() agregue al CSV cada descarga nueva») YA
esta hecho; siguen pendientes (b) la hoja «Battlelogs», (c) el candado contra
la descarga masiva con el CSV vacio y (d) la entrada de menu.
VERIFICAR: (a) correr descargarBattlelogJugador() con un Tag real y mirar el
log («-> Backup_Battlelogs.csv: N nueva(s), M ya registrada(s)»); en una
segunda corrida seguida, N debe ser 0; (b) que Backup_Battlelogs.csv siga con
el encabezado de BLS_HEADERS y el N° consecutivo; (c) que el costo por
jugador en la corrida masiva sea razonable (cada descarga con batallas de
guerra lee y reescribe el CSV completo, ~1750 filas el 1-oct); (d) si el log
dice «candado ocupado», esas batallas NO pasaron al CSV en esa descarga.
=============================================================================
```

#### 09B011 — líneas 235-254 (comentario)

```text
=============================================================================
AVISOS ABIERTOS / VERIFICACIONES ABIERTAS — pregunta 52: periodIndex POR CLAN
-----------------------------------------------------------------------
(1-oct-2026) HECHO, SIN PROBAR EN APPS SCRIPT REAL: _guardarCacheEnDrive()
ahora nombra el JSON de currentriverrace con el periodIndex y el
sectionIndex que trae el CONTENIDO de cada clan (datos.periodIndex y
datos.sectionIndex), no con los del primer clan Terna con cache (_getCtx()).
Antes, en la ventana de las 04:00 a las 05:00 (Lima), un clan que todavia
estaba en el periodIndex 20 podia guardarse como P.I-21 por llevar el
nombre del primer clan (ver helper _ctxPorClanDesdeDatos_()).
VERIFICAR: (a) tras la proxima corrida, que cada JSON nuevo de
currentriverrace lleve en el nombre el mismo P.I- que su contenido;
(b) en esa misma ventana, que no aparezca un P.I-21 con contenido de 20;
(c) RIESGO CONOCIDO: _cargarCacheDesideDrive() (fallback cuando la API
falla) y otros lectores buscan por el ctx GLOBAL; en la ventana de
desfase entre clanes, un clan rezagado puede no encontrar su archivo hasta
que cambie de periodo. repararAtaquesHoyGuerraDesdeJSON*() ya prueba el
periodIndex vecino (+1 y -1), asi que no deberia afectarlo. El proyecto
Generador NO crea estos JSON (confirmado por el usuario), no hay que tocarlo.
=============================================================================
```

#### 09B012 — líneas 256-310 (comentario)

```text
=============================================================================
AVISOS ABIERTOS / VERIFICACIONES ABIERTAS — FASE B: JSON sueltos -> "Otros"
-----------------------------------------------------------------------
(25-sep-2026) Pedido del usuario: los archivos que antes se guardaban
sueltos directo en la carpeta "JSON" (DRIVE_FOLDER_ID_JSON) ahora deben
guardarse en la carpeta "Otros" (DRIVE_FOLDER_ID_OTROS, 01_Config_Global.gs).
Esto es DISTINTO del ruteo por clan (_getCarpetaParaClan(),
_SUBCARPETAS_CLAN_, CARPETAS_JSON_POR_ENDPOINT_, más abajo en este mismo
archivo), que sigue igual y NO se toca en esta fase B.

Inventario de los 10 JSON sueltos a migrar, repartidos en 7 archivos .gs.
Checklist (se marca [x] a medida que se entrega cada archivo ya migrado):
  [x] 43_Menu_Dinamico.gs                -> Indice_Contenido.json
  [x] 09_API_ClashRoyale.gs (este mismo) -> Cache_Clanes_Progreso.json,
                                            Cache_Players_Progreso.json,
                                            Log_ScriptTerna.json
  [x] 11_DirectorioSheet.gs              -> lee ClanSystem_Backup_Celulares.json
  [x] 13_Inactivos_Vetados.gs -> ClanSystem_Backup_VetadosConfirmados.json
  [x] 14_Nuevos_RoyaleAPI.gs             -> ClanSystem_Progreso_RestaurarNuevos.json,
                                            ClanSystem_Debug_ImportNuevos.json
  [x] 05_Backup_CSV.gs                   -> escribe/repara ClanSystem_Backup_Celulares.json,
                                            ClanSystem_Backup_InactivosExtra.json
  [x] 04_Formato_Comun.gs                   -> Anchos_Columnas_Fijos.json

CHECKLIST COMPLETO (26-sep-2026). CORRECCIÓN a lo anotado antes en este
mismo bloque: 05_Backup_CSV.gs y 04_Formato_Comun.gs figuraban con [ ], pero
al revisar el código de ambos no queda ninguna referencia a
DRIVE_FOLDER_ID_JSON -- las 4 funciones de 30 (Celulares + InactivosExtra)
y la lectura/escritura de Anchos_Columnas_Fijos.json en 31 ya apuntaban a
DRIVE_FOLDER_ID_OTROS. El checklist se había quedado sin actualizar, no el
código; no hizo falta modificar ni 05_Backup_CSV.gs ni 04_Formato_Comun.gs.

RESUELTO: el "PENDIENTE DE DEFINIR / HUECO TEMPORAL" que había quedado
anotado acá (la lectura de ClanSystem_Backup_Celulares.json en
11_DirectorioSheet.gs sin encontrar su escritura en 05_Backup_CSV.gs
mientras esta última seguía en "JSON") ya no aplica: ambos lados están en
"Otros", así que se encuentran entre sí con normalidad.

RESUELTO: la acción manual del usuario (mover a mano en Drive, de "JSON"
a "Otros", los JSON físicos viejos que el código nunca mueve por sí solo)
ya se confirmó hecha (27-sep-2026): los 6 archivos con datos acumulados
que faltaban -- ClanSystem_Backup_Celulares.json,
ClanSystem_Backup_VetadosConfirmados.json,
ClanSystem_Progreso_RestaurarNuevos.json, ClanSystem_Debug_ImportNuevos.json,
ClanSystem_Backup_InactivosExtra.json y Anchos_Columnas_Fijos.json -- ya
están movidos. La FASE B queda cerrada del todo: checklist completo en
código y archivos físicos ya en su carpeta final.

RESUELTO (25-sep-2026, después de esta fase B): lo relacionado al endpoint
/locations (función manual de actualización, guardado en
DRIVE_FOLDER_ID_LOCATIONS) que se había dejado para el final ya se
implementó -- ver descargarLocations() más abajo en este mismo
archivo. Es un endpoint aparte, con su propia carpeta ("Locations", dentro
de "Endpoints"), no uno de los 7 archivos de la lista de arriba.
=============================================================================
```

#### 09B013 — líneas 312-320 (comentario)

```text
Claves normalizadas (ver _normalizarNombreClan_) -> ID de la subcarpeta de
Drive de cada clan, todas dentro de la carpeta "JSON" (DRIVE_FOLDER_ID_JSON).
Nombre real de cada carpeta en Drive anotado a la derecha, tal cual se ve
en la interfaz (con mayúsculas/símbolos originales) para poder ubicarla
si el usuario la menciona por su nombre en vez de por clave/ID.
OJO (25-sep-2026): estas 5 son las carpetas VIEJAS (clan → endpoint), de
antes de la reorganización de Drive — ver AVISOS ABIERTOS arriba. Se
dejan tal cual porque siguen siendo las que usa hoy el código real; no se
tocan en esta fase.
```


### Ubicación: `_SUBCARPETAS_CLAN_`

#### 09B014 — líneas 329-340 (docblock)

```text
CARPETAS_JSON_POR_ENDPOINT_
Mismo mapa que usa el proyecto Generador (04_Organizador_JSON.gs de ese
proyecto): endpoint (tal como aparece en CACHE_ENDPOINTS[].key, en
minúsculas) → nombre de la subcarpeta dentro de CADA carpeta de clan.
Un endpoint que NO esté aquí se queda suelto en la raíz de la carpeta del
clan (comportamiento anterior a este cambio) — agregar endpoints nuevos
en el futuro es seguro y no rompe nada de lo existente.
OJO (25-sep-2026): mapa del esquema VIEJO (clan → endpoint) — ver AVISOS
ABIERTOS arriba. Se deja tal cual porque sigue siendo el que usa hoy el
código real; no se toca en esta fase.
```


### Ubicación: `CARPETAS_JSON_POR_ENDPOINT_`

#### 09B015 — líneas 346-352 (comentario)

```text
Claves normalizadas (ver _normalizarNombreClan_) -> ID de la subcarpeta de
Drive de cada clan DENTRO de "Clans" (DRIVE_FOLDER_ID_CLANS,
01_Config_Global.gs), esquema NUEVO (endpoint → clan) de la
reorganización del 25-sep-2026. Confirmadas contra el id.csv del usuario,
carácter por carácter.
EN USO desde el 26-sep-2026 (ver _getCarpetaParaClan()/_getSubcarpetaEndpoint_()
más abajo en este archivo).
```


### Ubicación: `_SUBCARPETAS_CLAN_POR_ENDPOINT_CLANS_`

#### 09B016 — líneas 361-367 (comentario)

```text
Claves normalizadas (ver _normalizarNombreClan_) -> ID de la subcarpeta de
Drive de cada clan DENTRO de "CurrentRiverRace"
(DRIVE_FOLDER_ID_CURRENTRIVERRACE, 01_Config_Global.gs), esquema NUEVO
(endpoint → clan) de la reorganización del 25-sep-2026. Confirmadas
contra el id.csv del usuario, carácter por carácter.
EN USO desde el 26-sep-2026 (ver _getCarpetaParaClan()/_getSubcarpetaEndpoint_()
más abajo en este archivo).
```


### Ubicación: `_SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_`

#### 09B017 — líneas 376-382 (comentario)

```text
endpointKey (CACHE_ENDPOINTS[].key) -> { carpeta raíz de ese endpoint
dentro de "Endpoints", mapa de subcarpeta por clan DENTRO de esa raíz }.
Es la pieza que junta las dos constantes de arriba con
DRIVE_FOLDER_ID_CLANS/DRIVE_FOLDER_ID_CURRENTRIVERRACE (01_Config_Global.gs)
para poder resolver "endpoint -> clan" en un solo paso desde
_getSubcarpetaEndpoint_(). Un endpoint que no esté aquí (hoy, ninguno de
los dos endpoints de este cache) cae al fallback de raíz JSON.
```


### Ubicación: `_ENDPOINT_ROOT_Y_SUBCARPETAS_CLAN_`

#### 09B018 — líneas 394-418 (comentario)

```text
---------------------------------------------------------------------------
ÍNDICE EN MEMORIA de la carpeta Players (FIX 23/07/2026)
---------------------------------------------------------------------------
ANTES: _guardarPlayerEnDrive() hacía folder.getFiles() + un while
secuencial completo por CADA jugador, para encontrar su archivo existente
(búsqueda por sufijo). Como los archivos de periodos anteriores nunca se
borran (ver nota más abajo), la carpeta Players solo crece con el tiempo:
para ~150-200 jugadores por corrida, esto se traducía en cientos de
llamadas a Drive re-escaneando una carpeta cada vez más grande — un
escaneo efectivamente O(jugadores × archivos_en_carpeta) que se ponía más
lento turno tras turno (reporte: "corre 4 turnos y no termina de
consultar a players").

AHORA: se hace UN SOLO recorrido completo de la carpeta por ejecución
(memoizado en _PLAYERS_DRIVE_INDEX_POR_TAG, igual patrón que CACHE_CLAN_DATA
en 09_API_ClashRoyale.gs — variable global que se resetea sola en cada
ejecución nueva de Apps Script), y cada guardado individual consulta ese
índice en memoria (O(1)) en vez de volver a listar Drive.
FASE 9bis (17-sep-2026, limpieza de código muerto, pedido del usuario):
se borran _PLAYERS_DRIVE_INDEX y _PLAYERS_DRIVE_INDEX_PERIOD (el índice
histórico por periodo, anterior a la Fase 18) junto con la función que
los usaba, _getPlayersDriveIndex() (más abajo) -- confirmado con un grep
de todo el proyecto que ninguna de las tres tenía ya ningún llamador ni
referencia real, solo su propia declaración/definición. El índice vigente
es _PLAYERS_DRIVE_INDEX_POR_TAG (Fase 18), que no filtra por periodo.
```


### Ubicación: `_PLAYERS_DRIVE_INDEX_POR_TAG`

#### 09B019 — líneas 424-471 (comentario)

```text
=============================================================================
SECCION 1: FUNCIONES MANUALES (entry points ejecutables a mano desde el
editor de Apps Script).

REORDEN (26-sep-2026, pedido usuario): esta seccion reemplaza el criterio
de orden de la nota anterior (23-ago-2026, que solo agrupaba las manuales
al inicio conservando su orden relativo previo, sin sacar del todo los
helpers intercalados). Ahora, ademas de ir agrupadas, las funciones
manuales estan ordenadas por el ENDPOINT de la API que consultan (ver el
comentario de cada subgrupo, mas abajo). Los helpers "_algo()" que antes
quedaban intercalados en medio de este bloque (los de Cards, los de
Battlelog/Cofres/Arena/Modo, y los dos "_guardarJson...EnDrive" de
clanes/torneos) se movieron a la Seccion 2, junto con el resto de
helpers, para que esta Seccion 1 quede compuesta EXCLUSIVAMENTE por
funciones manuales, sin ninguna intercalada -- que es justamente el
pedido del usuario ("que aparezcan juntas cuando busque la funcion para
ejecutarla"). El orden relativo de esos helpers entre si no cambia
respecto de donde estaban.

Subgrupo A -- Mantenimiento / sin endpoint puntual de la API (no aplica
orden por endpoint): resetGuardianPeriodIndex(), guardarApiDump() (dump
general de TODOS los endpoints cacheados, no de uno solo) y
limpiarDuplicadosCachePlayers().

Subgrupo B -- Resto de funciones manuales, ordenadas por el endpoint que
consultan: /cards -> /clans (busquedas y miembros) -> /globaltournaments
-> /locations (catalogo y detalle) -> /locations/{id}/... (rankings y
pathoflegend por ubicacion) -> /locations/global/... (rankings,
pathoflegend por temporada y seasons, globales) -> /players/{tag}/...
(battlelog, upcomingchests).

PEDIDO ADICIONAL (26-sep-2026, mismo pedido del usuario que el reorden):
las funciones manuales que necesitan un seasonId o un tag de jugador para
poder correr desde el editor de Apps Script sin argumento, y que hasta
ahora no tenian un valor por defecto, lo tienen ahora, siguiendo el mismo
patron ya usado por descargarLocationPorId()/ID_A_CONSULTAR (ver su
docblock, mas abajo en este archivo):
  - descargarRankingGlobalJugadoresCaminoLeyendasPorTemporada(seasonId, limit)
    ahora usa SEASON_A_CONSULTAR = '2026-08' si se omite seasonId (antes
    quedaba como "PENDIENTE DE DEFINIR", sin valor por defecto).
  - descargarBattlelogJugador(playerTag) ahora usa
    TAG_BATTLELOG_A_CONSULTAR = '#2GG8PJ8GC' si se omite playerTag.
  - descargarUpcomingChestsJugador(playerTag) ahora usa
    TAG_UPCOMINGCHESTS_A_CONSULTAR = '#2GG8PJ8GC' si se omite playerTag.
  - descargarClanMiembros(tag, limit) ahora usa
    TAG_CLAN_A_CONSULTAR = '#GCRG8L00' si se omite tag (tag de CLAN, no
    de jugador -- distinto de los tres anteriores).
=============================================================================
```

#### 09B020 — líneas 473-487 (docblock)

```text
MANTENIMIENTO MANUAL — ejecutar UNA sola vez desde el editor de Apps Script
(seleccionar esta función en el desplegable y presionar "Ejecutar") cuando
el guardián anti-periodIndex-desactualizado de _getCtx() se queda atascado
por un valor corrupto heredado (ver diagnóstico del 04/05-jul-2026: un
"CTX_ULTIMO_PERIODINDEX_OK" en 0 hacía que CUALQUIER periodIndex real
(ej. 33) se marcara como sospechoso y abortara Guerra/Guerra_Logs/Control
en cada corrida, hasta que pasaran 20h desde CTX_ULTIMO_TS_OK).

Esta función borra ambas Script Properties para que la siguiente corrida
de runGuerra()/runUpdate() arranque sin estado previo y acepte de
inmediato el periodIndex real como "OK", sin esperar la autocuración de
20h. No borra ningún dato de las hojas, solo el estado interno del
guardián.
```


### Ubicación: `resetGuardianPeriodIndex`

#### 09B021 — líneas 495-501 (comentario)

```text
=============================================================================
NOTA DE REORDEN (23-ago-2026, pedido usuario): las funciones manuales
(entry points ejecutables a mano o por trigger) se movieron al inicio del
archivo, en el mismo orden relativo en que aparecian antes. Ninguna tiene una
funcion _continuar... asociada en este archivo. Los helpers "_algo()" que
antes estaban mezclados con ellas siguen debajo, en su mismo orden relativo.
=============================================================================
```

#### 09B022 — líneas 503-508 (docblock)

```text
guardarApiDump()
Recorre todos los clanes y endpoints, usando el sistema de cache.
Si el cache del día ya existe → solo confirma. Si no → descarga y guarda.
Equivale al comportamiento anterior de guardarApiDump() pero sin duplicar llamadas.
```


### Ubicación: `guardarApiDump`

#### 09B023 — líneas 538-583 (comentario)

```text
=============================================================================
LIMPIEZA DE DUPLICADOS — CACHE DE PLAYERS
(19/07/2026; alcance recortado el 27-sep-2026, ver NOTA más abajo)

PROBLEMA QUE CORRIGE:
  Antes de este fix, cada ejecución del script podía crear un archivo NUEVO
  por jugador en /players, aunque fuera el mismo periodo real (periodIndex),
  porque:
    a) el nombre de archivo incluía la hora actual y la búsqueda de
       "¿ya existe?" comparaba el nombre completo (con hora), o
    b) la deduplicación era por fecha calendario (dd-mm-yyyy), ambigua en
       la ventana en que el periodIndex real cambia de un día para otro
       (entre las 4am y las 5am, hora variable).
  Resultado: varios archivos con la misma fecha o el mismo periodo real
  para el mismo jugador.

QUÉ HACE:
  Recorre la carpeta PLAYERS, agrupa los archivos que ya usan el FORMATO
  NUEVO (con "P{periodIndex}" en el nombre) por su periodIndex real, y
  también agrupa por separado los archivos del FORMATO ANTIGUO (sin
  periodIndex) por fecha calendario — para limpiar cualquier duplicado que
  haya quedado de antes de este fix. En cada grupo con más de un archivo,
  conserva el de ÚLTIMA EDICIÓN REAL (Drive File.getLastUpdated(), no el
  nombre) y envía los demás a la papelera de Drive (setTrashed(true) —
  reversible por 30 días, NO destrucción permanente).

CÓMO USARLA:
  Ejecutar manualmente UNA VEZ desde el editor de Apps Script. Es segura
  de volver a correr: si ya no hay duplicados, no hace nada.

NOTA (27-sep-2026): existía una hermana, limpiarDuplicadosCacheClanes(),
para /clans y /clans/{tag}/currentriverrace — SE BORRÓ en esta sesión,
pedido del usuario ("si ya no se usa para nada, bórralo o actualízalo").
Motivo: sus dos regex (patronNuevo/patronViejo) solo reconocían el formato
de nombre de ANTES del 20-jul-2026 (fecha al PRINCIPIO del nombre); desde
ese cambio, _buildCacheFilename() (más abajo en este archivo) arma el
nombre con el tag "T-.. S-.. P.I-.." como prefijo, así que esas regex ya
no calzaban con NINGÚN archivo generado en los últimos dos meses. Además,
recorría directo las carpetas VIEJAS de _SUBCARPETAS_CLAN_ (esquema
clan -> endpoint) que el usuario confirmó haber reemplazado por carpetas
NUEVAS (con IDs distintos, entregados por CSV) al reorganizar Drive el
25-sep-2026 — es decir, apuntaba a una estructura ya reemplazada, con un
patrón de nombre ya discontinuado. limpiarDuplicadosCachePlayers() (abajo)
no se tocó: su carpeta (DRIVE_FOLDER_ID_PLAYERS) y su formato de nombre no
cambiaron con ninguno de los dos cambios anteriores.
=============================================================================
```

#### 09B024 — líneas 585-592 (docblock)

```text
limpiarDuplicadosCachePlayers()
Igual que la (ex) limpiarDuplicadosCacheClanes() pero para la carpeta PLAYERS.
Agrupa por tag+periodIndex (formato nuevo) o por tag+fecha (formato
antiguo, sin periodIndex) y conserva solo la última edición real de cada
grupo, enviando los duplicados a la papelera.
@returns {{eliminados: number, detalle: string[]}}
```


### Ubicación: `limpiarDuplicadosCachePlayers`

#### 09B025 — líneas 662-720 (docblock)

```text
descargarCards()
(Renombrada 25-sep-2026, pedido del usuario: se llamaba
descargarCardsRoyaleAPI(), pero usa la API OFICIAL de Supercell vía el
proxy en Render, nunca RoyaleAPI — ver nota en descargarLocations().)
MANUAL — mismo patrón que descargarLocations()/
descargarSeasons() (ver docblocks ahí) para /cards: guarda el
JSON crudo completo (catálogo COMPLETO de cartas de Supercell, "items" +
"supportItems" de torre, tengan dueño o no en el clan) en la carpeta
"Cards" (DRIVE_FOLDER_ID_CARDS).

A DIFERENCIA de Locations/Seasons, esta función NO crea un CSV nuevo
(pedido explícito del usuario, 25-sep-2026): el CSV de cartas ya existe
-- Backup_Cards.csv, mantenido hoy por updateCardsSheet() (31_Cards_Mazos.gs)
a partir del cache de jugadores -- y esta función lo ACTUALIZA en el
mismo archivo, reusando tal cual los mismos helpers y el mismo formato de
fila que updateCardsSheet() (_leerCardsCSV/_guardarCardsCSV/
_refrescarCardsRows/_rarezaParaFila, los 4 viven en 31_Cards_Mazos.gs) para
que ambas fuentes (cache de jugadores y catálogo /cards) escriban siempre
el mismo CSV, sin duplicar lógica de merge.

OJO (25-sep-2026, pedido usuario -- "revisa qué campos coinciden y si hay
algún campo que aún no se esté guardando"): comparado campo por campo, el
JSON de /cards NO trae ningún dato que Backup_Cards.csv no supiera
guardar ya:
  id                       -> columna ID
  name                     -> columna Name
  maxLevel                 -> columna Maxlevel
  maxEvolutionLevel        -> columna MaxEvolutionLevel (ausente en cartas
                               sin evolución/héroe, y SIEMPRE ausente en
                               supportItems -- igual que hoy con /players)
  rarity                   -> columna Rarity
  elixirCost                -> columna Elixircost (SIEMPRE ausente en
                               supportItems: las cartas de torre no gastan
                               elixir, ya documentado en 31_Cards_Mazos.gs)
  iconUrls.medium           -> columna Carta
  iconUrls.heroMedium       -> columna Héroe (ausente en la mayoría, normal)
  iconUrls.evolutionMedium  -> columna Evolución (ausente en la mayoría, normal)
Las columnas "Nombre" (traducción al español) y "Tipo"
(Tropa/Hechizo/Estructura/Torre) siguen sin poder completarse desde
ninguna API -- "Torre" se sigue asignando solo a cartas NUEVAS de
supportItems, igual que updateCardsSheet(); Nombre y Tipo de filas nuevas
quedan vacíos para completar a mano, y las filas YA EXISTENTES nunca
pisan estas dos columnas (mismo criterio que _refrescarCardsRows(),
AVISO 12 de 31_Cards_Mazos.gs).

VENTAJA sobre updateCardsSheet(): /cards es el catálogo COMPLETO de
Supercell, no depende de que algún jugador del clan ya haya desbloqueado
la carta -- por eso puede agregar/refrescar cartas que updateCardsSheet()
todavía no ve en ningún cache de jugador.

Guarda:
  - JSON completo (respuesta cruda de /cards, incluidos "items" y
    "supportItems"): Drive, carpeta "Cards" (DRIVE_FOLDER_ID_CARDS),
    Cache_Cards.json.
  - CSV: Backup_Cards.csv (DRIVE_FOLDER_ID_CSV) -- se actualiza el
    archivo existente, mismas 12 columnas de siempre (ver _leerCardsCSV()),
    NO se crea ningún archivo nuevo.
```


### Ubicación: `descargarCards`

#### 09B026 — líneas 728-735 (comentario)

```text
RESPALDO AUTOMÁTICO (27-sep-2026, pedido del usuario): si /cards falla
(proxy caído, cuota, respuesta vacía), se cae solo a
_getCardsFromCache() (31_Cards_Mazos.gs) -- mismo shape de campos
exacto (ver comparación en el bloque de triggers más abajo), aunque
con menos cobertura (solo cartas que algún líder/jugador ya tiene
desbloqueadas). NO se borra ni se reemplaza descargarCards(): sigue
pudiendo llamarse a mano igual que siempre, esto solo agrega qué hacer
cuando la llamada a la API falla, en vez de no hacer nada.
```

#### 09B027 — líneas 747-749 (comentario)

```text
1) JSON completo, respuesta cruda sin filtrar ningún campo. Solo tiene
   sentido guardarlo cuando SÍ hubo respuesta real de /cards -- en el
   respaldo no hay un `data` de /cards que guardar acá.
```

#### 09B028 — líneas 766-769 (comentario)

```text
2) Mapa id -> carta, mismo shape que _getCardsFromCache()/
   _mezclarCartasEnMapa() (31_Cards_Mazos.gs), para poder reusar
   _refrescarCardsRows() y el mismo formato de fila nueva que
   updateCardsSheet() sin duplicar lógica.
```

#### 09B029 — líneas 777-781 (comentario)

```text
3) Actualizar Backup_Cards.csv EN EL MISMO archivo (no se crea uno
   nuevo): refresca las filas existentes y agrega las cartas del
   catálogo que todavía no estén, mismo formato de fila que
   updateCardsSheet() (31_Cards_Mazos.gs). Funciona igual venga
   `cardMap` de /cards o del respaldo -- mismo shape de campos.
```

#### 09B030 — líneas 850-872 (comentario)

```text
=============================================================================
TRIGGER SEMANAL DE descargarCards() (27-sep-2026, pedido del usuario)
Mismo patrón de trigger OPCIONAL, autoinstalable y con función idempotente
que ya usa el proyecto en activarTriggerResolverAlertasHistorialGuerra()
(20_HistorialGuerraJugador.gs): no se agrega a installTriggers() (00_Main.gs)
para no obligar a nadie a tenerlo activo -- se instala/retira a mano UNA VEZ
desde el editor de Apps Script y, a diferencia de un trigger diario, queda
disparando solo una vez por semana (mismo día y hora cada semana).

FALLBACK (pedido del usuario, comparado campo por campo antes de decidir,
resuelto 27-sep-2026): _getCardsFromCache()/_mezclarCartasEnMapa()
(31_Cards_Mazos.gs, AVISO 12) extraen EXACTAMENTE los mismos campos que
/cards (name, maxLevel, maxEvolutionLevel, rarity, elixirCost, las 3 URLs
de ícono) -- no hay ningún dato que el método viejo traiga y /cards no
traiga; /cards es estrictamente mejor en cobertura (catálogo completo de
Supercell, no depende de que algún jugador de la Familia ya haya
desbloqueado la carta). El método viejo se CONSERVA sin cambios (no se
borró ningún código de 31_Cards_Mazos.gs) y descargarCards() ahora cae
solo a él cuando /cards falla -- ver el `if (!data...)` al inicio de
descargarCards() más arriba en este archivo. descargarCards() sigue
pudiendo llamarse a mano en cualquier momento, para un caso excepcional,
exactamente igual que antes de este cambio.
=============================================================================
```

#### 09B031 — líneas 874-877 (comentario)

```text
MOVIDO (05-oct-2026, pedido usuario): activarTriggerDescargarCards()/desactivarTriggerDescargarCards() ya no viven
aqui. El activador semanal de descargarCards() se instala y retira junto con todos los demas desde
08_Activadores.gs (activarTodosLosActivadores()/desactivarTodosLosActivadores()), con su dia y hora en
ACTIVADORES_CONFIG. descargarCards() sigue pudiendo llamarse a mano en cualquier momento.
```

#### 09B032 — líneas 880-891 (docblock)

```text
buscarClanesPorNombre(nombre)
MANUAL — pedido del usuario (26-sep-2026): guarda en
"Clans_Consulta_Temporal" el JSON crudo de /clans?name=X -- búsqueda
global de clanes por nombre (no está atada a los clanes propios del
proyecto). Comparte el mismo archivo fijo que descargarClanMiembros()/
buscarClanesPorNombreYUbicacion()/buscarClanesPorUbicacion() (ver
_guardarJsonClanesConsultaTemporalEnDrive()).

@param {string} nombre - Nombre (o parte del nombre) a buscar.
@returns {boolean} true si guardó correctamente, false si no.
```


### Ubicación: `buscarClanesPorNombre`

#### 09B033 — líneas 910-931 (docblock)

```text
buscarClanesPorNombreYUbicacion(nombre, locationId)
MANUAL — pedido del usuario (26-sep-2026): igual que
buscarClanesPorNombre(), pero con el filtro combinado /clans?name=X&
locationId=Y. Mismo archivo fijo compartido en
"Clans_Consulta_Temporal" (ver _guardarJsonClanesConsultaTemporalEnDrive()).

@param {string} nombre - Nombre (o parte del nombre) a buscar.
@param {string|number} locationId - ID de ubicación (ver /locations,
  descargarLocations()).
@returns {boolean} true si guardó correctamente, false si no.

AVISO (26-sep-2026): mismo caso que descargarLocationPorId() (ver AVISO
en su docblock, más arriba en este archivo) -- el editor de Apps Script
no permite escribir valores para "nombre" ni "locationId" al correr una
función desde el menú "Ejecutar". Por eso se agregaron, justo abajo, las
variables BUSCAR_CLANES_NOMBRE_YUBI_NOMBRE y
BUSCAR_CLANES_NOMBRE_YUBI_LOCATION_ID: son el nombre y el locationId que
se usan automáticamente cuando esta función se ejecuta sin argumentos.
Para buscar otro nombre/ubicación, cambiar esas dos variables y guardar
antes de volver a ejecutar.
```

#### 09B034 — líneas 933-936 (comentario)

```text
nombre y locationId que se usan si buscarClanesPorNombreYUbicacion() se
corre sin argumentos desde el editor de Apps Script -- cambiar estos
valores por los que se quieran buscar (locationId: ver columna "id" en
Cache_Locations.json/Backup_Locations.csv) y guardar antes de ejecutar.
```


### Ubicación: `buscarClanesPorNombreYUbicacion`

#### 09B035 — líneas 969-988 (docblock)

```text
buscarClanesPorUbicacion(locationId)
MANUAL — pedido del usuario (26-sep-2026): igual que
buscarClanesPorNombre(), pero solo con filtro de ubicación /clans?
locationId=Y (sin "name"). Mismo archivo fijo compartido en
"Clans_Consulta_Temporal" (ver _guardarJsonClanesConsultaTemporalEnDrive()).

@param {string|number} locationId - ID de ubicación (ver /locations,
  descargarLocations()).
@returns {boolean} true si guardó correctamente, false si no.

AVISO (26-sep-2026): mismo caso que descargarLocationPorId() (ver AVISO
en su docblock, más arriba en este archivo) -- el editor de Apps Script
no permite escribir un valor para "locationId" al correr una función
desde el menú "Ejecutar". Por eso se agregó, justo abajo, la variable
BUSCAR_CLANES_UBICACION_LOCATION_ID: es el locationId que se usa
automáticamente cuando esta función se ejecuta sin argumento. Para
consultar otra ubicación, cambiar el número de
BUSCAR_CLANES_UBICACION_LOCATION_ID y guardar antes de volver a ejecutar.
```

#### 09B036 — líneas 990-993 (comentario)

```text
locationId que se usa si buscarClanesPorUbicacion() se corre sin argumento
desde el editor de Apps Script -- cambiar este número por el id a
consultar (ver columna "id" en Cache_Locations.json/Backup_Locations.csv)
y guardar antes de ejecutar.
```


### Ubicación: `buscarClanesPorUbicacion`

#### 09B037 — líneas 1019-1043 (docblock)

```text
descargarClanMiembros(tag, limit)
MANUAL — pedido del usuario (26-sep-2026): guarda en
"Clans_Consulta_Temporal" (DRIVE_FOLDER_ID_CLANS_CONSULTA_TEMPORAL) el
JSON crudo de /clans/{tag}/members -- lista de miembros de UN clan
puntual (paginada). Este endpoint YA se usa dentro del proyecto como
fallback cuando /clans/{tag} no responde (no se toca ese uso); esta
función es una vía MANUAL adicional para llamarlo a mano, igual que el
resto de variaciones de este bloque.

@param {string} [tag] - Tag del clan, con o sin "#" (ej. "#GCRG8L00" o
  "GCRG8L00"). Se normaliza con encodeTag(), igual que el resto del script.
  Opcional -- si se omite, usa TAG_CLAN_A_CONSULTAR (ver arriba).
@param {number} [limit] - Opcional. Cuántos miembros trae la API, agregado
  como "?limit=N". Si se omite, se llama sin límite explícito.
@returns {boolean} true si guardó correctamente, false si no.

AVISO (26-sep-2026, pedido usuario): mismo caso que descargarLocationPorId()
(ver AVISO en su docblock, más arriba en este archivo) -- el editor de
Apps Script no permite escribir un valor para "tag" al correr una función
desde el menú "Ejecutar". Por eso se agregó, justo abajo, la variable
TAG_CLAN_A_CONSULTAR: es el tag de clan que se usa automáticamente cuando
esta función se ejecuta sin argumento. Para consultar otro clan, cambiar
el valor de TAG_CLAN_A_CONSULTAR y guardar antes de volver a ejecutar.
```

#### 09B038 — líneas 1045-1047 (comentario)

```text
tag de clan que se usa si descargarClanMiembros() se corre sin argumento
desde el editor de Apps Script -- cambiar este valor por el tag a
consultar y guardar antes de ejecutar.
```


### Ubicación: `descargarClanMiembros`

#### 09B039 — líneas 1079-1092 (comentario)

```text
que se están implementando en este bloque (Locations, Seasons, Cards,
GlobalTournaments): antes de empezar esta tanda ya se editó la
configuración del servidor proxy en Render (clash-royale-proxy-2eyr.onrender.com,
CFG.API_BASE) y se comprobó que puede llamar correctamente a TODOS los
endpoints de la API de Clash Royale. Los endpoints que se descartaron o
que aparecen documentados como "muertos"/"vacíos con frecuencia" (ver el
bloque de comentarios de testTodosLosEndpoints(), más abajo en este mismo
archivo) quedaron así porque Supercell los tiene removidos, inhabilitados,
devuelven datos vacíos/muestreados, o requieren autorización que este
proxy no tiene -- NO porque el servidor de Render esté mal configurado o
fallando. /globaltournaments es uno de esos casos "vivo pero vacío con
frecuencia": responde 200 OK con {"items":[]} porque los torneos globales
son esporádicos, no porque el proxy falle.
-----------------------------------------------------------------------------
```

#### 09B040 — líneas 1094-1124 (docblock)

```text
descargarGlobalTournaments()
(Renombrada 25-sep-2026, pedido del usuario: se llamaba
descargarGlobalTournamentsRoyaleAPI(), pero usa la API OFICIAL de
Supercell vía el proxy en Render, nunca RoyaleAPI — ver nota en
descargarLocations().)
MANUAL — mismo patrón que descargarLocations()/
descargarSeasons()/descargarCards() (ver docblocks ahí)
para /globaltournaments, PERO SIN generar ni tocar ningún CSV (pedido
explícito del usuario, 25-sep-2026).

/globaltournaments son los torneos globales que Supercell activa de forma
ESPORÁDICA (no todo el tiempo hay uno corriendo); hoy responde
{"items":[]} porque no hay ninguno activo. Por eso esta función:
  - SOLO descarga y guarda el JSON crudo, tal cual lo devuelve la API.
  - NO arma ningún CSV: con el array vacío no hay forma de saber qué
    campos trae un torneo global real (no hay ni un solo item de
    ejemplo todavía) -- inventar columnas a ciegas sería adivinar un
    schema que no se conoce. Cuando algún día haya un torneo global
    activo y el JSON traiga al menos un item real, hay que revisar sus
    campos y recién ahí definir el CSV (si hiciera falta).
  - NO se usa por ahora en ningún otro lado del sistema (ni Directorio,
    ni Web, ni ningún otro endpoint) -- queda solo HABILITADA y
    documentada para el futuro, tal cual pidió el usuario.

Guarda:
  - JSON completo (respuesta cruda de /globaltournaments, hoy
    {"items":[]}): Drive, carpeta "Globales" (DRIVE_FOLDER_ID_TORNEOS_GLOBALES,
    dentro de "Torneos" > "Endpoints" > "JSON" > "Respaldo"),
    Cache_GlobalTournaments.json.
```


### Ubicación: `descargarGlobalTournaments`

#### 09B041 — líneas 1152-1191 (docblock)

```text
descargarLocations()
(Renombrada 25-sep-2026, pedido del usuario: se llamaba
descargarLocationsRoyaleAPI(), pero usa la API OFICIAL de Supercell vía
el proxy en Render — CFG.API_BASE, ver _apiGet() — nunca RoyaleAPI.)
MANUAL — ejecutar a mano desde el editor de Apps Script cuando haga falta
refrescar el catálogo de /locations (países + regiones + "Global"/
"International"), vía la API oficial de Supercell (proxy en Render,
CFG.API_BASE — nunca RoyaleAPI server-side, ver _apiGet() más abajo en
este archivo). No se llama desde runAll()/
runUpdate() ni ningún trigger: este catálogo casi no cambia (algún país
nuevo o cambio de nombre ocasional), así que no vale la pena gastar
presupuesto de ejecución consultándolo en cada corrida.

Resuelve el pendiente "endpoint /locations (función manual de
actualización, guardado en DRIVE_FOLDER_ID_LOCATIONS)" dejado abierto a
propósito en el checklist de AVISOS ABIERTOS / FASE B más arriba en este
archivo (esa fase migró 7 archivos .gs de "JSON" a "Otros"; /locations
quedó afuera porque es carpeta propia -- DRIVE_FOLDER_ID_LOCATIONS,
dentro de "Endpoints" -- no uno de esos 7).

Guarda TODOS los campos que devuelve la API (id, name, isCountry,
countryCode -- sin filtrar ninguno), pensando en una futura
implementación en la web (ej. buscar rankings por país por countryCode/
id). Por eso el JSON guarda la respuesta cruda tal cual, y el CSV repite
las mismas 4 columnas en vez de recortarlas. IMPORTANTE (pedido usuario):
esta función SOLO descarga y guarda -- no expone estos datos a la web ni
a ningún otro endpoint todavía.

Actualiza JSON y CSV en la misma corrida, ambos a partir de la misma
respuesta de la API (una sola llamada), para que nunca queden
desincronizados entre sí:
  - JSON completo (respuesta cruda de /locations, incluido "paging"):
    Drive, carpeta "Locations" (DRIVE_FOLDER_ID_LOCATIONS),
    Cache_Locations.json.
  - CSV (id, name, isCountry, countryCode -- una fila por location, sin
    "paging", que no es tabular): Drive, carpeta "CSV"
    (DRIVE_FOLDER_ID_CSV, vía _saveCSVToDrive()/_encodeCSV() en
    05_Backup_CSV.gs), Backup_Locations.csv.
```


### Ubicación: `descargarLocations`

#### 09B042 — líneas 1237-1270 (docblock)

```text
descargarLocationPorId(id)
MANUAL — pedido del usuario (26-sep-2026): guarda en la misma carpeta
"Locations" (DRIVE_FOLDER_ID_LOCATIONS, ver descargarLocations() arriba)
el JSON crudo de /locations/{id} -- detalle de UNA sola ubicación (ej.
{"id":57000184,"name":"Peru","isCountry":true,"countryCode":"PE"}), a
diferencia de descargarLocations(), que trae el catálogo completo.

El "id" a consultar sale del catálogo general que ya guarda
descargarLocations() (Cache_Locations.json / Backup_Locations.csv) -- no
hay que adivinarlo.

Sin CSV (pedido explícito del usuario, mismo criterio que
descargarBattlelogJugador()/descargarUpcomingChestsJugador()): esta
función SOLO guarda el JSON. A diferencia de esas dos funciones (que usan
nombre fijo por endpoint) y a diferencia del bloque de
Clans_Consulta_Temporal (que reemplaza siempre el mismo archivo), acá el
nombre de archivo lleva el id consultado ("Cache_Locations_{id}.json"):
cada id consultado deja su propio archivo dentro de "Locations", y volver
a consultar el mismo id reemplaza solo el archivo de ESE id (no crea uno
nuevo ni toca los demás).

@param {string|number} id - ID de la ubicación a consultar (ver
  Cache_Locations.json/Backup_Locations.csv, columna "id").
@returns {boolean} true si guardó correctamente, false si no.

AVISO (26-sep-2026): el editor de Apps Script no permite escribir un
valor para "id" al correr una función desde el menú "Ejecutar" -- por
eso se agregó, justo abajo, la variable ID_A_CONSULTAR: es el id que se
usa automáticamente cuando esta función se ejecuta directamente desde el
editor sin argumento (que es como el usuario siempre la corre). Para
consultar un id distinto, cambiar el número de ID_A_CONSULTAR y guardar
antes de volver a ejecutar.
```

#### 09B043 — líneas 1272-1275 (comentario)

```text
ID que se usa si descargarLocationPorId() se corre sin argumento desde el
editor de Apps Script -- cambiar este número por el id a consultar (ver
columna "id" en Cache_Locations.json / Backup_Locations.csv) y guardar
antes de ejecutar.
```


### Ubicación: `descargarLocationPorId`

#### 09B044 — líneas 1311-1347 (docblock)

```text
descargarRankingClanesPorUbicacion(locationId, limit)
MANUAL — pedido del usuario (26-sep-2026): guarda en la misma carpeta
"Copas" (DRIVE_FOLDER_ID_RANKING_COPAS, ver descargarRankingGlobalClanes()
arriba) el JSON crudo de /locations/{locationId}/rankings/clans -- mismo
ranking de clanes por clanScore/trofeos que descargarRankingGlobalClanes(),
pero filtrado a UNA ubicación puntual (país/región) en vez del ranking
global.

El "locationId" a consultar sale del catálogo general de ubicaciones (ver
descargarLocations()/descargarLocationPorId(), más arriba en este mismo
archivo) -- no hay que adivinarlo.

Sin CSV (pedido explícito del usuario). Mismo criterio que
descargarLocationPorId(): como acá SÍ hay un id variable (a diferencia del
ranking global, que es único), el nombre de archivo lleva el locationId
consultado ("Cache_RankingClanes_{locationId}.json") -- cada ubicación
consultada deja su propio archivo dentro de "Copas", y volver a consultar
la misma ubicación reemplaza solo el archivo de ESA ubicación (no crea uno
nuevo ni toca los demás, incluido Cache_RankingGlobalClanes.json, que es
un archivo aparte).

@param {string|number} locationId - ID de la ubicación a consultar (ver
  Cache_Locations.json/Backup_Locations.csv, columna "id").
@param {number} [limit] - Opcional. Cuántos clanes trae la API (top N),
  agregado como "?limit=N". Si se omite, se llama sin límite explícito.
@returns {boolean} true si guardó correctamente, false si no.

AVISO (26-sep-2026): mismo caso que descargarLocationPorId() (ver AVISO
en su docblock, más arriba en este archivo) -- el editor de Apps Script
no permite escribir un valor para "locationId" al correr una función
desde el menú "Ejecutar". Por eso se agregó, justo abajo, la variable
RANKING_CLANES_LOCATION_ID: es el locationId que se usa automáticamente
cuando esta función se ejecuta sin argumento. Para consultar otra
ubicación, cambiar el número de RANKING_CLANES_LOCATION_ID y guardar
antes de volver a ejecutar.
```

#### 09B045 — líneas 1349-1352 (comentario)

```text
locationId que se usa si descargarRankingClanesPorUbicacion() se corre sin
argumento desde el editor de Apps Script -- cambiar este número por el id
a consultar (ver columna "id" en Cache_Locations.json/Backup_Locations.csv)
y guardar antes de ejecutar.
```


### Ubicación: `descargarRankingClanesPorUbicacion`

#### 09B046 — líneas 1391-1458 (docblock)

```text
descargarRankingJugadoresPorUbicacion(locationId, limit)
MANUAL — pedido del usuario (26-sep-2026): guarda el JSON crudo de
/locations/{locationId}/rankings/players -- mismo ranking de jugadores
que descargarRankingGlobalJugadores(), pero filtrado a UNA ubicación
puntual (país/región) en vez del ranking global. Mismo criterio que
descargarRankingClanesPorUbicacion()/descargarRankingClanesGuerraPorUbicacion()
(arriba en este archivo), pero para jugadores.

Carpeta destino: "Global" -- DRIVE_FOLDER_ID_RANKING_JUGADORES_GLOBAL
(01_Config_Global.gs). Esta es la MISMA carpeta que usa ahora
descargarRankingGlobalJugadores() (arriba en este archivo, corregida el
26-sep-2026) -- ambas comparten "Global", cada una con su propio nombre de
archivo (fijo la global, por-locationId esta).

CORRECCIÓN DE NOMBRE (26-sep-2026, confirmado por el usuario con captura
de Drive): la constante se llamaba
DRIVE_FOLDER_ID_RANKING_JUGADORES_CAMINO_LEYENDAS_GLOBAL, nombre engañoso
porque sugería que "Global" está anidada dentro de "Camino de leyendas" --
en realidad son carpetas HERMANAS, ambas directamente dentro de "Ranking"
> "Jugadores". Se renombró a DRIVE_FOLDER_ID_RANKING_JUGADORES_GLOBAL
(mismo ID de Drive, '1_DO5ZMCLP2HHSg4vxTS5Z-qr89q8EIl4', solo cambia el
nombre de la variable en 01_Config_Global.gs). La carpeta/constante ya
existía antes (creada sin uso) pensando en
/locations/global/pathoflegend/{seasonId}/rankings/players ("Camino de
leyendas"), NO para este endpoint -- el usuario reutiliza la misma
carpeta "Global" para este ranking por ubicación en vez de crear una
carpeta nueva.

CORRECCIÓN (26-sep-2026): el párrafo anterior decía "si en el futuro se
implementa también la función de Camino de Leyendas, las tres compartirían
'Global'". Ya se implementó (ver
descargarRankingGlobalJugadoresCaminoLeyendasPorTemporada() y
descargarRankingJugadoresCaminoLeyendasPorUbicacion(), ambas más abajo en
este archivo) y NO comparten "Global": usan su carpeta hermana "Camino de
leyendas" (DRIVE_FOLDER_ID_RANKING_JUGADORES_CAMINO_LEYENDAS), separada de
esta. Las dos carpetas siguen siendo HERMANAS dentro de "Ranking" >
"Jugadores", ninguna anidada dentro de la otra.

El "locationId" a consultar sale del catálogo general de ubicaciones (ver
descargarLocations()/descargarLocationPorId(), más arriba en este mismo
archivo) -- no hay que adivinarlo.

Sin CSV (pedido explícito del usuario). Mismo criterio que
descargarRankingClanesPorUbicacion()/descargarLocationPorId(): como acá SÍ
hay un id variable (a diferencia del ranking global, que es único), el
nombre de archivo lleva el locationId consultado
("Cache_RankingJugadores_{locationId}.json") -- cada ubicación consultada
deja su propio archivo, y volver a consultar la misma ubicación reemplaza
solo el archivo de ESA ubicación (no crea uno nuevo ni toca los demás,
incluido Cache_RankingGlobalJugadores.json, que es un archivo aparte
dentro de la MISMA carpeta "Global", vía descargarRankingGlobalJugadores()).

@param {string|number} locationId - ID de la ubicación a consultar (ver
  Cache_Locations.json/Backup_Locations.csv, columna "id").
@param {number} [limit] - Opcional. Cuántos jugadores trae la API (top N),
  agregado como "?limit=N". Si se omite, se llama sin límite explícito.
@returns {boolean} true si guardó correctamente, false si no.

AVISO (26-sep-2026): mismo caso que descargarLocationPorId() (ver AVISO
en su docblock, más arriba en este archivo) -- el editor de Apps Script
no permite escribir un valor para "locationId" al correr una función
desde el menú "Ejecutar". Por eso se agregó, justo abajo, la variable
RANKING_JUGADORES_LOCATION_ID: es el locationId que se usa
automáticamente cuando esta función se ejecuta sin argumento. Para
consultar otra ubicación, cambiar el número de
RANKING_JUGADORES_LOCATION_ID y guardar antes de volver a ejecutar.
```

#### 09B047 — líneas 1460-1463 (comentario)

```text
locationId que se usa si descargarRankingJugadoresPorUbicacion() se corre
sin argumento desde el editor de Apps Script -- cambiar este número por el
id a consultar (ver columna "id" en Cache_Locations.json/Backup_Locations.csv)
y guardar antes de ejecutar.
```


### Ubicación: `descargarRankingJugadoresPorUbicacion`

#### 09B048 — líneas 1502-1541 (docblock)

```text
descargarRankingClanesGuerraPorUbicacion(locationId, limit)
MANUAL — pedido del usuario (26-sep-2026): guarda en la misma carpeta
"Guerra" (DRIVE_FOLDER_ID_RANKING_GUERRA, ver
descargarRankingGlobalGuerraClanes() arriba) el JSON crudo de
/locations/{locationId}/rankings/clanwars -- mismo ranking de clanes por
GUERRA que descargarRankingGlobalGuerraClanes(), pero filtrado a UNA
ubicación puntual (país/región) en vez del ranking global. Mismo criterio
que descargarRankingClanesPorUbicacion() (arriba en este archivo), pero
para "Guerra" en vez de "Copas".

El "locationId" a consultar sale del catálogo general de ubicaciones (ver
descargarLocations()/descargarLocationPorId(), más arriba en este mismo
archivo) -- no hay que adivinarlo.

Sin CSV (pedido explícito del usuario). Mismo criterio que
descargarRankingClanesPorUbicacion()/descargarLocationPorId(): como acá SÍ
hay un id variable (a diferencia del ranking global, que es único), el
nombre de archivo lleva el locationId consultado
("Cache_RankingGuerraClanes_{locationId}.json") -- cada ubicación
consultada deja su propio archivo dentro de "Guerra", y volver a
consultar la misma ubicación reemplaza solo el archivo de ESA ubicación
(no crea uno nuevo ni toca los demás, incluido
Cache_RankingGlobalGuerraClanes.json, que es un archivo aparte).

@param {string|number} locationId - ID de la ubicación a consultar (ver
  Cache_Locations.json/Backup_Locations.csv, columna "id").
@param {number} [limit] - Opcional. Cuántos clanes trae la API (top N),
  agregado como "?limit=N". Si se omite, se llama sin límite explícito.
@returns {boolean} true si guardó correctamente, false si no.

AVISO (26-sep-2026): mismo caso que descargarLocationPorId() (ver AVISO
en su docblock, más arriba en este archivo) -- el editor de Apps Script
no permite escribir un valor para "locationId" al correr una función
desde el menú "Ejecutar". Por eso se agregó, justo abajo, la variable
RANKING_GUERRA_CLANES_LOCATION_ID: es el locationId que se usa
automáticamente cuando esta función se ejecuta sin argumento. Para
consultar otra ubicación, cambiar el número de
RANKING_GUERRA_CLANES_LOCATION_ID y guardar antes de volver a ejecutar.
```

#### 09B049 — líneas 1543-1546 (comentario)

```text
locationId que se usa si descargarRankingClanesGuerraPorUbicacion() se
corre sin argumento desde el editor de Apps Script -- cambiar este número
por el id a consultar (ver columna "id" en Cache_Locations.json/
Backup_Locations.csv) y guardar antes de ejecutar.
```


### Ubicación: `descargarRankingClanesGuerraPorUbicacion`

#### 09B050 — líneas 1585-1629 (docblock)

```text
descargarRankingJugadoresCaminoLeyendasPorUbicacion(locationId, limit)
NUEVA (26-sep-2026, pedido del usuario) — MANUAL: guarda en la misma
carpeta "Camino de leyendas"
(DRIVE_FOLDER_ID_RANKING_JUGADORES_CAMINO_LEYENDAS, ver
descargarRankingGlobalJugadoresCaminoLeyendasPorTemporada() arriba) el
JSON crudo de /locations/{locationId}/pathoflegend/players -- ranking de
Camino de Leyendas de la TEMPORADA ACTUAL, filtrado a una ubicación
puntual (país/región). A diferencia de
descargarRankingGlobalJugadoresCaminoLeyendasPorTemporada(), este
endpoint NO lleva seasonId en el path -- así lo entrega la API para
consultas por ubicación (siempre la temporada en curso).

El "locationId" a consultar sale del catálogo general de ubicaciones (ver
descargarLocations()/descargarLocationPorId(), más arriba en este mismo
archivo) -- no hay que adivinarlo.

Sin CSV (pedido explícito del usuario). Mismo criterio que
descargarRankingJugadoresPorUbicacion(): como acá SÍ hay un id variable,
el nombre de archivo lleva el locationId consultado
("Cache_RankingCaminoLeyendas_{locationId}.json") -- cada ubicación
consultada deja su propio archivo, y volver a consultar la misma ubicación
reemplaza solo el archivo de ESA ubicación (no crea uno nuevo ni toca los
demás, incluidos los que deja
descargarRankingGlobalJugadoresCaminoLeyendasPorTemporada() en la MISMA
carpeta).

@param {string|number} locationId - ID de la ubicación a consultar (ver
  Cache_Locations.json/Backup_Locations.csv, columna "id").
@param {number} [limit] - OPCIONAL. Cuántos jugadores trae la API (top N).
  Si se pasa, se agrega como "?limit=N" a la URL. Si NO se quiere limitar
  el resultado, simplemente no se pasa este parámetro (o se pasa
  undefined) -- la función NO agrega "?limit=" a la URL y la API responde
  con todos los jugadores que devuelva por defecto.
@returns {boolean} true si guardó correctamente, false si no.

AVISO (26-sep-2026): mismo caso que descargarLocationPorId() (ver AVISO
en su docblock, más arriba en este archivo) -- el editor de Apps Script
no permite escribir un valor para "locationId" al correr una función
desde el menú "Ejecutar". Por eso se agregó, justo abajo, la variable
RANKING_CAMINO_LEYENDAS_LOCATION_ID: es el locationId que se usa
automáticamente cuando esta función se ejecuta sin argumento. Para
consultar otra ubicación, cambiar el número de
RANKING_CAMINO_LEYENDAS_LOCATION_ID y guardar antes de volver a ejecutar.
```

#### 09B051 — líneas 1631-1634 (comentario)

```text
locationId que se usa si descargarRankingJugadoresCaminoLeyendasPorUbicacion()
se corre sin argumento desde el editor de Apps Script -- cambiar este número
por el id a consultar (ver columna "id" en Cache_Locations.json/
Backup_Locations.csv) y guardar antes de ejecutar.
```


### Ubicación: `descargarRankingJugadoresCaminoLeyendasPorUbicacion`

#### 09B052 — líneas 1673-1698 (docblock)

```text
descargarRankingGlobalClanes(limit)
MANUAL — pedido del usuario (25-sep-2026): guarda en la carpeta "Copas"
(DRIVE_FOLDER_ID_RANKING_COPAS, ver 01_Config_Global.gs) el JSON crudo de
/locations/global/rankings/clans -- el ranking GLOBAL de clanes (por
clanScore/trofeos, no filtrado por país). Devuelve un array plano de
clanes (tag, name, rank, previousRank, location, clanScore, members,
badgeId), NO envuelto en "items" como otros endpoints de ranking.

Sin CSV (pedido explícito del usuario): esta función SOLO guarda el JSON,
mismo criterio que descargarBattlelogJugador()/descargarUpcomingChestsJugador()
(sin CSV) pero a diferencia de esas dos, este endpoint NO es por jugador --
es un ranking global único, así que el archivo tiene nombre FIJO
("Cache_RankingGlobalClanes.json") y se REEMPLAZA por completo en cada
corrida (mismo patrón de sobreescritura que Cache_Seasons.json/
Cache_GlobalTournaments.json, más arriba en este archivo -- no hay "un
archivo por tag" porque no hay tag).

@param {number} [limit] - Opcional. Cuántos clanes trae la API (top N).
  Si se omite, se llama sin "?limit=", tal cual responda la API por
  defecto. NO hay un valor fijo de 5 ni de ningún otro número -- el
  usuario decide cuántos quiere cada vez que corre la función a mano
  (ej. descargarRankingGlobalClanes(5), descargarRankingGlobalClanes(50),
  o descargarRankingGlobalClanes() sin límite).
@returns {boolean} true si guardó correctamente, false si no.
```


### Ubicación: `descargarRankingGlobalClanes`

#### 09B053 — líneas 1721-1723 (comentario)

```text
La respuesta es un array plano (a diferencia de otros endpoints que
envuelven en "items") -- Array.isArray cubre ambos casos por si el
proxy cambia el formato más adelante.
```

#### 09B054 — líneas 1733-1772 (docblock)

```text
descargarRankingGlobalJugadores(limit)
MANUAL — pedido del usuario (25-sep-2026, carpeta corregida 26-sep-2026):
guarda en la carpeta "Global" (DRIVE_FOLDER_ID_RANKING_JUGADORES_GLOBAL,
ver 01_Config_Global.gs) el JSON crudo de /locations/global/rankings/players
-- el ranking GLOBAL de jugadores (equivalente a
descargarRankingGlobalClanes() pero para jugadores).

CORRECCIÓN (26-sep-2026, confirmado por el usuario con captura de Drive):
esta función guardaba antes en DRIVE_FOLDER_ID_RANKING_JUGADORES (la
carpeta contenedora "Jugadores"), pero esa carpeta NO tiene archivos
propios -- solo contiene dos subcarpetas HERMANAS, "Camino de leyendas" y
"Global" (ninguna anidada dentro de la otra). El destino correcto es
"Global" (DRIVE_FOLDER_ID_RANKING_JUGADORES_GLOBAL, mismo ID que usa
descargarRankingJugadoresPorUbicacion() más abajo -- ambas comparten
carpeta, cada una con su propio nombre de archivo fijo/por-id).

AVISO (25-sep-2026, confirmado por el usuario): a día de hoy este
endpoint responde 200 OK pero VACÍO -- {"items":[],"paging":{"cursors":{}}}
-- distinto del caso de /globaltournaments (ese SÍ trae "paging" con
cursores reales cuando hay datos; acá "cursors" también viene vacío). No
se sabe si es una falla temporal del proxy, una limitación real de la API
de Supercell para este endpoint puntual, o algo que se corrija más
adelante -- por eso esta función se deja lista y funcionando igual, para
que cuando (o si) el endpoint empiece a devolver datos, ya esté todo
armado sin tener que tocar código: se guarda el JSON tal cual responda
en cada corrida, vacío o no.

Sin CSV (pedido explícito del usuario), mismo criterio que
descargarRankingGlobalClanes(): archivo con nombre FIJO
("Cache_RankingGlobalJugadores.json"), reemplazado por completo en cada
corrida -- no hay histórico ni "un archivo por tag" (es un ranking único,
no por jugador).

@param {number} [limit] - Opcional. Cuántos jugadores trae la API (top
  N), agregado como "?limit=N" a la URL. Si se omite, se llama sin
  límite explícito. Ningún valor fijo -- lo decide quien corre la
  función cada vez (mismo criterio que descargarRankingGlobalClanes()).
@returns {boolean} true si guardó correctamente, false si no.
```


### Ubicación: `descargarRankingGlobalJugadores`

#### 09B055 — líneas 1805-1824 (docblock)

```text
descargarRankingGlobalGuerraClanes(limit)
MANUAL — pedido del usuario (25-sep-2026): guarda en la carpeta "Guerra"
(DRIVE_FOLDER_ID_RANKING_GUERRA, ver 01_Config_Global.gs) el JSON crudo de
/locations/global/rankings/clanwars -- el ranking GLOBAL de clanes por
GUERRA (distinto de "Copas"/descargarRankingGlobalClanes(), que es por
clanScore/trofeos). Mismo criterio que las otras dos funciones de ranking
global (descargarRankingGlobalClanes()/descargarRankingGlobalJugadores(),
ambas más arriba en este archivo).

Sin CSV (pedido explícito del usuario). Archivo con nombre FIJO
("Cache_RankingGlobalGuerraClanes.json"), reemplazado por completo en
cada corrida -- ranking único, sin histórico ni "un archivo por tag".

@param {number} [limit] - Opcional. Cuántos clanes trae la API (top N),
  agregado como "?limit=N" a la URL. Si se omite, se llama sin límite
  explícito. Ningún valor fijo -- lo decide quien corre la función cada
  vez (mismo criterio que las otras dos de ranking global).
@returns {boolean} true si guardó correctamente, false si no.
```


### Ubicación: `descargarRankingGlobalGuerraClanes`

#### 09B056 — líneas 1856-1903 (docblock)

```text
descargarRankingGlobalJugadoresCaminoLeyendasPorTemporada(seasonId, limit)
NUEVA (26-sep-2026, pedido del usuario) — MANUAL: guarda en la carpeta
"Camino de leyendas" (DRIVE_FOLDER_ID_RANKING_JUGADORES_CAMINO_LEYENDAS,
ver 01_Config_Global.gs) el JSON crudo de
/locations/global/pathoflegend/{seasonId}/rankings/players -- el ranking
GLOBAL de jugadores por Camino de Leyendas de UNA temporada puntual.
Distinto de descargarRankingGlobalJugadores() (más arriba en este
archivo), que es el ranking global de siempre por trofeos/clanScore, sin
Camino de Leyendas.

Carpeta destino: "Camino de leyendas" -- HERMANA de "Global"
(DRIVE_FOLDER_ID_RANKING_JUGADORES_GLOBAL, la que usan
descargarRankingGlobalJugadores()/descargarRankingJugadoresPorUbicacion()),
ambas dentro de "Ranking" > "Jugadores", ninguna anidada dentro de la
otra (ver corrección en el docblock de descargarRankingJugadoresPorUbicacion(),
arriba en este archivo).

CORRECCIÓN (26-sep-2026, pedido usuario): resuelve el "PENDIENTE DE DEFINIR"
que dejaba esta función sin valor por defecto para "seasonId". Mismo
patrón que descargarLocationPorId()/ID_A_CONSULTAR (ver docblock de
descargarLocationPorId(), más arriba en este archivo): se agregó, justo
abajo, la variable SEASON_A_CONSULTAR -- es el seasonId ("AAAA-MM") que se
usa automáticamente cuando esta función se ejecuta sin argumento desde el
editor de Apps Script. Para consultar otra temporada, cambiar el valor de
SEASON_A_CONSULTAR y guardar antes de volver a ejecutar. 33_CaminoLeyendas.gs
sigue sin exponer el seasonId "AAAA-MM" vigente (currentPathOfLegendSeasonResult
no trae ese formato), así que el valor sigue siendo manual, ahora con
default en vez de obligatorio.

Sin CSV (pedido explícito del usuario). Como el seasonId es variable
(distintas temporadas pueden consultarse con el tiempo), el nombre de
archivo lo lleva ("Cache_RankingGlobalCaminoLeyendas_{seasonId}.json"),
mismo criterio que descargarRankingClanesPorUbicacion() con locationId --
cada temporada consultada deja su propio archivo, y volver a consultar la
misma temporada reemplaza solo ESE archivo (no crea uno nuevo ni toca los
demás).

@param {string} [seasonId] - Temporada a consultar, formato "AAAA-MM" (ej.
  "2026-08"). Opcional -- si se omite, usa SEASON_A_CONSULTAR (ver arriba).
@param {number} [limit] - OPCIONAL. Cuántos jugadores trae la API (top N).
  Si se pasa, se agrega como "?limit=N" a la URL. Si NO se quiere limitar
  el resultado, simplemente no se pasa este parámetro (o se pasa
  undefined) -- la función NO agrega "?limit=" a la URL y la API responde
  con todos los jugadores que devuelva por defecto.
@returns {boolean} true si guardó correctamente, false si no (incluye el
  caso de seasonId vacío/omitido).
```

#### 09B057 — líneas 1904-1906 (comentario)

```text
seasonId que se usa si descargarRankingGlobalJugadoresCaminoLeyendasPorTemporada()
se corre sin argumento desde el editor de Apps Script -- cambiar este valor
por la temporada a consultar (formato "AAAA-MM") y guardar antes de ejecutar.
```


### Ubicación: `descargarRankingGlobalJugadoresCaminoLeyendasPorTemporada`

#### 09B058 — líneas 1950-2005 (docblock)

```text
descargarSeasons()
(Renombrada 25-sep-2026, pedido del usuario: se llamaba
descargarSeasonsRoyaleAPI(), pero usa la API OFICIAL de Supercell vía el
proxy en Render, nunca RoyaleAPI — ver nota en descargarLocations().)
MANUAL — mismo patrón que descargarLocations() (ver docblock ahí),
pero para /locations/global/seasons: guarda TODO el historial de
temporadas (id con formato Supercell "YYYY-MM") sin filtrar, pensando en
una futura implementación en la web. Tampoco expone estos datos a ningún
otro endpoint todavía.

OJO (25-sep-2026, pedido usuario): existen 3 numeraciones de temporada
distintas para la MISMA temporada real (mismos periodIndex y todo) --
interna de este sistema (ej. 4), RoyaleAPI (ej. 135) y Supercell/formato
de este endpoint (ej. "2026-08"). Esta función descarga y guarda el id
"YYYY-MM" tal cual lo da la API, y además CALCULA las otras dos
numeraciones para cada fila (columnas "RoyaleAPI" e "Interna" del CSV),
usando como ANCLA la fila con id "2026-05" (confirmado por el usuario:
"2026-05" = RoyaleAPI 132 = Interna 1, porque la numeración interna
arranca en mayo como temporada 1). Para el resto de las filas NO hay
fórmula real -- se extrapola sumando/restando 1 por cada fila que se
aleja del ancla (fila de abajo = +1, fila de arriba = -1), tal cual pidió
el usuario. Esto asume que RoyaleAPI e Interna avanzan 1:1 con las filas
de este array sin saltos ni duplicados propios; si eso no es cierto lejos
del ancla (p. ej. cerca de los ids repetidos de las temporadas más
antiguas), los valores calculados ahí quedarán desfasados y hay que
revisarlos a mano -- no son un mapeo confirmado, son una extrapolación.

Guarda:
  - JSON completo (respuesta cruda de /locations/global/seasons, incluido
    "paging"): Drive, carpeta "Seasons" (DRIVE_FOLDER_ID_SEASONS),
    Cache_Seasons.json.
  - CSV: Drive, carpeta "CSV" (DRIVE_FOLDER_ID_CSV), Backup_Seasons.csv,
    con columnas:
      "N°"        - posición 1-based de esa fila dentro del array "items",
                    tal cual lo devuelve la API -- NO es un dato del JSON,
                    es CALCULADO (solo se numera la fila) y puede cambiar
                    si el proxy reordena o el historial crece; por eso el
                    ancla de "RoyaleAPI"/"Interna" es el id "2026-05", NUNCA
                    un valor fijo de "N°" (ver más abajo). Columna
                    renombrada de "posicion" (25-sep-2026, pedido usuario)
                    y movida a la izquierda de "id" para que coincida con
                    el mismo criterio de Backup_Cards.csv (N° primero).
      "id"        - tal cual la API ("YYYY-MM").
      "RoyaleAPI" - extrapolada desde el ancla "2026-05"=132 (ver arriba).
      "Interna"   - extrapolada desde el ancla "2026-05"=1 (ver arriba).
    Si el id ancla "2026-05" no aparece en el array, o aparece más de una
    vez (no debería, pero el array SÍ trae ids repetidos en temporadas
    antiguas, ej. "2016-02" dos veces), no se puede anclar con certeza:
    "RoyaleAPI" e "Interna" quedan vacías en TODAS las filas y se deja
    aviso en el Logger, en vez de inventar un offset a ciegas.
    El array trae ids repetidos en las temporadas más antiguas -- se
    guardan todas las filas tal cual vienen, sin deduplicar, porque no
    hay forma de saber desde acá si son temporadas realmente distintas o
    un duplicado del proxy.
```


### Ubicación: `descargarSeasons`

#### 09B059 — líneas 2030-2034 (comentario)

```text
2) CSV: N° (posición 1-based, calculada) + id (Supercell "YYYY-MM") +
   RoyaleAPI/Interna extrapoladas desde el ANCLA POR ID "2026-05"
   (RoyaleAPI 132, Interna 1) -- el ancla es el id, nunca el valor de
   "N°" (que puede cambiar si el array se reordena o crece), sumando/
   restando 1 por cada fila que se aleja del ancla (ver docblock).
```

#### 09B060 — líneas 2072-2107 (docblock)

```text
descargarBattlelogJugador(playerTag)
MANUAL — pedido del usuario (25-sep-2026): guarda en la carpeta
"Battlelog" (DRIVE_FOLDER_ID_BATTLELOG, ver 01_Config_Global.gs -- la
constante ya existía, declarada sin uso todavía) el JSON crudo de
/players/{tag}/battlelog para UN jugador puntual.

Mismo criterio que la carpeta "Players" (_guardarPlayerEnDrive(), más
arriba en este archivo): UN SOLO archivo vigente por tag, sin histórico
-- si ya existe un archivo de este jugador se sobreescribe (nombre y
contenido); si no existe, se crea uno nuevo. Nombre de archivo con el
mismo formato que "Players" (ver _buildBattlelogFilename()):
"dd-mm-yyyy HH.mm - {ClanName} - {playerTag}.json".

A diferencia de "Players", el JSON de /battlelog es un ARRAY (una entrada
por batalla), no un objeto -- se guarda tal cual lo devuelve la API, sin
inyectarle campos de trazabilidad (un array no puede llevar propiedades
extra a través de JSON.stringify()). Sin CSV (pedido explícito del
usuario): esta función SOLO guarda el JSON. Función MANUAL, sin llamador
automático todavía -- se corre a mano por tag, igual que
descargarCards()/descargarLocations()/descargarSeasons() para sus
respectivos endpoints.

@param {string} [playerTag] - Tag del jugador (ej. "#2GG8PJ8GC" o "2GG8PJ8GC").
  Opcional -- si se omite, usa TAG_BATTLELOG_A_CONSULTAR (ver arriba).
@returns {boolean} true si guardó correctamente, false si no.

AVISO (26-sep-2026, pedido usuario): mismo caso que descargarLocationPorId()
(ver AVISO en su docblock, más arriba en este archivo) -- el editor de
Apps Script no permite escribir un valor para "playerTag" al correr una
función desde el menú "Ejecutar". Por eso se agregó, justo abajo, la
variable TAG_BATTLELOG_A_CONSULTAR: es el tag que se usa automáticamente
cuando esta función se ejecuta sin argumento. Para consultar otro
jugador, cambiar el valor de TAG_BATTLELOG_A_CONSULTAR y guardar antes de
volver a ejecutar.
```

#### 09B061 — líneas 2109-2111 (comentario)

```text
playerTag que se usa si descargarBattlelogJugador() se corre sin argumento
desde el editor de Apps Script -- cambiar este valor por el tag a
consultar y guardar antes de ejecutar.
```


### Ubicación: `descargarBattlelogJugador`

#### 09B062 — líneas 2140-2142 (comentario)

```text
Buscar si ya existe un archivo de este jugador en la carpeta
(mismo criterio que _getPlayersDriveIndexPorTag(), pero sin
memoización: acá se llama para un solo jugador a la vez).
```

#### 09B063 — líneas 2170-2177 (comentario)

```text
IMPLEMENTADO (26-sep-2026, pedido del usuario -- resuelve la "TAREA
PENDIENTE" anotada junto a DRIVE_FOLDER_ID_BATTLELOG en
01_Config_Global.gs): además de guardar el JSON, alimenta
Backup_Arena.csv y Backup_Modo.csv con "arena" y "gameMode" de cada
batalla -- mismo patrón que descargarUpcomingChestsJugador() con
Backup_Cofres.csv (más abajo en este archivo), y un fallo acá no
revierte el JSON ya guardado (guardadoOk implícito, ver return true al
final).
```

#### 09B064 — líneas 2196-2199 (comentario)

```text
NUEVO (2-oct-2026, pregunta 51, tanda 2): ademas del JSON, agrega las
batallas de GUERRA de esta descarga a Backup_Battlelogs.csv (registro
acumulativo, sin duplicados; ver _registrarBattlelogEnCsv_(), justo abajo).
Un fallo aca no revierte el JSON ya guardado ni cambia el resultado.
```

#### 09B065 — líneas 2218-2251 (docblock)

```text
_registrarBattlelogEnCsv_(data, tag, nombreArchivo)
NUEVO (2-oct-2026, pregunta 51, tanda 2): agrega a Backup_Battlelogs.csv las
batallas de GUERRA de una descarga de descargarBattlelogJugador(), para que
ya no se pierdan cuando el JSON de ese jugador se sobreescriba en la
descarga siguiente (el JSON solo guarda las ~25 a 30 ultimas batallas).

Usa los mismos helpers y el mismo formato de fila que la siembra
(06_Battlelogs_Siembra.gs: _blsLeerCsv_, _blsFilaDeBatalla_, _blsClave_,
_blsComparar_, BLS_HEADERS), asi que una batalla sembrada y la misma batalla
descargada despues dan la MISMA clave (battleTime + Tipo + Tag) y no se
duplican. Entran las batallas cuyo tipo empieza por "riverRace" o es
"boatBattle" (igual que la siembra; no se descarta nada por clan, pregunta 44).

Si la clave ya existe con los mismos datos, se ignora. Si existe con datos
distintos, la fila guardada NO se pisa y el caso se anota en
Revision_Guerra.csv (Origen "Descarga Battlelog"), con los mismos motivos que
la siembra.

Candado: LockService.getScriptLock() hasta 30 s, porque lee, modifica y
reescribe el CSV completo y la siembra y las descargas de la web pueden
coincidir. Si no se obtiene, NO se escribe nada y se devuelve `omitido` (el
JSON ya quedo guardado, pero sus batallas de guerra seguirian sin pasar al
CSV hasta la proxima descarga o hasta volver a correr la siembra mientras
ese JSON siga igual).

Si falta 06_Battlelogs_Siembra.gs o Backup_Battlelogs.csv tiene un encabezado
distinto al esperado, no se toca nada y se devuelve `omitido`.

@param {Array}  data           Array crudo de /battlelog (el mismo que se guarda en el JSON).
@param {string} tag            Tag normalizado del dueno del log, con "#".
@param {string} nombreArchivo  Nombre con el que se guardo el JSON (columna Archivo).
@returns {{vistas:number, nuevas:number, iguales:number, conflictos:number, lados:number, omitido:string}}
```


### Ubicación: `_registrarBattlelogEnCsv_`

#### 09B066 — líneas 2362-2401 (docblock)

```text
descargarUpcomingChestsJugador(playerTag)
MANUAL — pedido del usuario (25-sep-2026): guarda en la carpeta
"UpcomingChests" (DRIVE_FOLDER_ID_UPCOMINGCHESTS, ver 01_Config_Global.gs)
el JSON crudo de /players/{tag}/upcomingchests para UN jugador puntual.

Mismo criterio que "Battlelog"/"Players": un solo archivo vigente por tag
(se sobreescribe, sin histórico). Nombre de archivo con el mismo formato
(reutiliza _buildBattlelogFilename(), más arriba en este archivo, que a
pesar del nombre es genérica: "dd-mm-yyyy HH.mm - {ClanName} - {tag}.json").

AVISO (25-sep-2026): a diferencia de Battlelog (trae el clan dentro de
"team") y de Players (lo trae directo), /upcomingchests NO incluye ningún
dato de clan en su respuesta -- por eso el nombre de archivo siempre
queda con "Sin clan". Completar ese dato requeriría una llamada extra a
/players por cada descarga; no implementado, no fue pedido.

Además de guardar el JSON, alimenta Backup_Cofres.csv (ver
_actualizarBackupCofresConChests(), más abajo en este archivo, y el
bloque de documentación junto a DRIVE_FOLDER_ID_UPCOMINGCHESTS en
01_Config_Global.gs): por cada cofre del array "items" cuyo "name" NO
esté ya en el CSV, agrega una fila nueva (Nombre en blanco, para
traducción manual). El JSON de /upcomingchests NO se guarda "tal cual" en
el CSV -- solo alimenta este catálogo de cofres conocidos (mismo patrón
que updateCardsSheet() con Backup_Cards.csv, 31_Cards_Mazos.gs); si no
trae ningún cofre nuevo, no se crea ninguna fila.

@param {string} [playerTag] - Tag del jugador (ej. "#2GG8PJ8GC" o "2GG8PJ8GC").
  Opcional -- si se omite, usa TAG_UPCOMINGCHESTS_A_CONSULTAR (ver arriba).
@returns {boolean} true si guardó el JSON correctamente, false si no.

AVISO (26-sep-2026, pedido usuario): mismo caso que descargarLocationPorId()
(ver AVISO en su docblock, más arriba en este archivo) -- el editor de
Apps Script no permite escribir un valor para "playerTag" al correr una
función desde el menú "Ejecutar". Por eso se agregó, justo abajo, la
variable TAG_UPCOMINGCHESTS_A_CONSULTAR: es el tag que se usa
automáticamente cuando esta función se ejecuta sin argumento. Para
consultar otro jugador, cambiar el valor de TAG_UPCOMINGCHESTS_A_CONSULTAR
y guardar antes de volver a ejecutar.
```

#### 09B067 — líneas 2403-2405 (comentario)

```text
playerTag que se usa si descargarUpcomingChestsJugador() se corre sin
argumento desde el editor de Apps Script -- cambiar este valor por el tag
a consultar y guardar antes de ejecutar.
```


### Ubicación: `descargarUpcomingChestsJugador`

#### 09B068 — líneas 2434-2436 (comentario)

```text
Buscar si ya existe un archivo de este jugador en la carpeta (mismo
criterio que descargarBattlelogJugador(), sin memoización: acá se
llama para un solo jugador a la vez).
```

#### 09B069 — líneas 2480-2537 (docblock)

```text
_descargarBattlelogYCofresParaTodos()
CAMBIO (29-sep-2026): este parrafo reemplaza lo que dice mas abajo sobre
PLAYERS_API_ENABLED === true / false / 'admin' / 'partial' como condicion para
consultar battlelog y upcomingchests: ahora la condicion es
BATTLELOGCHESTS_API_ENABLED === true (01_Config_Global.gs), independiente de
PLAYERS_API_ENABLED. Lo demas (tandas, progreso, tags con /players en cache) sigue igual.
NUEVO (27-sep-2026, pedido del usuario): conecta descargarBattlelogJugador()
y descargarUpcomingChestsJugador() (ambas arriba en este archivo, MANUALES
hasta ahora -- solo se corrían a mano por tag) a runAll(), atadas al MISMO
interruptor que /players (PLAYERS_API_ENABLED, ver 01_Config_Global.gs):

  PLAYERS_API_ENABLED === true  -> se consultan los 3 endpoints: /players
    (ya se consultó más arriba en PASOS_RUNALL, dentro de
    updateCardsSheet() -> _fetchPlayersData(), memoizado) + /battlelog y
    /upcomingchests para esos MISMOS tags, uno por uno, en esta función.
  PLAYERS_API_ENABLED === false, 'admin' o 'partial' -> se omiten los 3
    endpoints por completo (ni battlelog ni upcomingchests se llaman).
    AVISO: el usuario pidió el corte explícitamente en términos de
    true/false; 'admin'/'partial' quedan del lado de "se omiten" por
    default -- si en el futuro se necesita que esos 2 modos también
    disparen battlelog/upcomingchests (aunque sea solo para admins),
    avisar para ajustar esta condición.

REANUDABLE POR TANDAS (27-sep-2026, pedido del usuario -- "partelo en
tandas... replica el guardado de avance también"): mismo motor y mismo
patrón EXACTO que _fetchPlayersData() (más abajo en este archivo):
  - Presupuesto propio (CFG.BATTLELOGCHESTS_FETCH_BUDGET_MS) + tope de
    jugadores por tanda (CFG.BATTLELOGCHESTS_FETCH_MAX_POR_TANDA),
    cualquiera de los dos que se agote primero corta el bucle.
  - Si se corta, guarda en Drive (BATTLELOGCHESTS_PROGRESS_FILE, vía
    _guardarProgresoBattlelogChests()) la lista de tags YA procesados en
    este ciclo y devuelve `false` -- _ejecutarPorTandas() (00_Main.gs)
    reintenta el MISMO paso en la próxima continuación (10s después) en
    vez de avanzar al siguiente paso de PASOS_RUNALL.
  - Al reanudar (_cargarProgresoBattlelogChests()), los tags que ya
    figuran en ese progreso NO se vuelven a consultar -- ni a la API de
    Supercell (battlelog/upcomingchests) ni tampoco se repite el fetch de
    /players: igual que _fetchPlayersData(), si CACHE_CLAN_DATA._players
    quedó vacío por tratarse de una ejecución de Apps Script nueva (cada
    continuación lo es), _fetchPlayersData() reconstruye ese cache leyendo
    el JSON ya guardado en Drive (PLAYERS_PROGRESS_FILE) en vez de volver
    a pedirlo en vivo a la API -- así que llamarla acá de nuevo es gratis
    en HTTP mientras ese checkpoint siga vivo (ver AVISO 45 min más abajo).
  - El archivo de progreso NO se borra apenas esta función termina su
    lista completa: sobrevive (igual que PLAYERS_PROGRESS_FILE/
    CLANES_PROGRESO_FILE) hasta que el CICLO COMPLETO de runAll() termina
    de verdad -- se limpia en _continuarRunAll() (00_Main.gs), junto con
    _borrarProgresoPlayers()/_borrarProgresoClanes().

Reusa _getTagsConPlayerCache() (31_Cards_Mazos.gs) para saber a quién
consultar: son los mismos tags que tienen /players en cache en ESTA
corrida (no hace falta un fetch nuevo de clanes).

@returns {boolean} true si terminó la lista completa (o si estaba
  deshabilitado, sin nada que hacer); false si quedó incompleta y debe
  reintentarse el mismo paso en la próxima continuación.
```


### Ubicación: `_descargarBattlelogYCofresParaTodos`

#### 09B070 — líneas 2539-2543 (comentario)

```text
CAMBIO (29-sep-2026, pedido de la usuaria): ya no depende de
PLAYERS_API_ENABLED === true, sino de su propio interruptor
BATTLELOGCHESTS_API_ENABLED (01_Config_Global.gs). Asi se puede activar
/players para todos sin descargar tambien battlelog y cofres de todos.
Los tags a consultar siguen siendo los que tienen /players en cache.
```

#### 09B071 — líneas 2551-2556 (comentario)

```text
Mismo criterio que _fetchAllClanData(): asegura /players en cache antes
de seguir. Si esta es una continuación (ejecución de Apps Script nueva,
CACHE_CLAN_DATA reiniciado), _fetchPlayersData() reconstruye el cache
leyendo el checkpoint JSON ya guardado en Drive (PLAYERS_PROGRESS_FILE)
en vez de volver a pedirlo en vivo -- NO se repite ninguna consulta a
/players mientras ese archivo siga vigente (ver docblock de la función).
```

#### 09B072 — líneas 2575-2577 (comentario)

```text
Cargar progreso de una tanda anterior de ESTE MISMO ciclo (ver
_guardarProgresoBattlelogChests() más abajo). Estos tags NO se vuelven a
procesar.
```

#### 09B073 — líneas 2645-2655 (comentario)

```text
---------------------------------------------------------------------------
PERSISTENCIA DE PROGRESO DE BATTLELOG + UPCOMINGCHESTS (para reanudación
sin repetir). Mismo patrón EXACTO que _guardarProgresoPlayers()/
_cargarProgresoPlayers()/_borrarProgresoPlayers() (más abajo en este mismo
archivo), pero guardando solo la LISTA de tags ya procesados (no un JSON
de datos por tag): el dato real de cada jugador ya queda guardado tal
cual por descargarBattlelogJugador()/descargarUpcomingChestsJugador() en
sus propias carpetas de Drive (DRIVE_FOLDER_ID_BATTLELOG/
DRIVE_FOLDER_ID_UPCOMINGCHESTS) -- este checkpoint solo necesita recordar
"a quién ya le tocó" para no reconsultar la API de vuelta.
---------------------------------------------------------------------------
```

#### 09B074 — líneas 2657-2663 (docblock)

```text
_guardarProgresoBattlelogChests(tagsHechos)
Guarda en Drive la lista de tags ya procesados (battlelog + upcomingchests)
en este ciclo, para que una continuación posterior no los repita. Mismo
criterio de timestamp (_ts) que _guardarProgresoPlayers().
@param {Array<string>} tagsHechos - Tags ya procesados (éxito o error puntual, da igual).
```


### Ubicación: `_guardarProgresoBattlelogChests`

#### 09B075 — líneas 2679-2687 (docblock)

```text
_cargarProgresoBattlelogChests()
Lee el progreso guardado por una tanda anterior DENTRO DEL MISMO ciclo de
runAll(). Mismo criterio de antigüedad que _cargarProgresoPlayers(): si el
timestamp guardado tiene más de CFG.BATTLELOGCHESTS_PROGRESO_MAX_EDAD_MS,
se descarta (y se borra) como resto de un ciclo anterior.
@returns {Array<string>|null} Lista de tags ya procesados, o null si no
  existe, no se pudo leer, o quedó viejo.
```


### Ubicación: `_cargarProgresoBattlelogChests`

#### 09B076 — líneas 2715-2723 (docblock)

```text
_borrarProgresoBattlelogChests()
Elimina el archivo de progreso de battlelog+upcomingchests. Se llama
desde _continuarRunAll() (00_Main.gs) recién cuando el CICLO COMPLETO de
runAll() termina de verdad -- mismo momento en que se llama
_borrarProgresoPlayers()/_borrarProgresoClanes(), NO cada vez que esta
función termina su propia lista dentro de una tanda (mismo criterio,
mismo motivo: FASE 21 de _guardarProgresoPlayers(), más abajo).
```


### Ubicación: `_borrarProgresoBattlelogChests`

#### 09B077 — líneas 2736-2748 (docblock)

```text
_agregarCartasApiAMapa(map, items, esTorre)
Helper de descargarCards(): agrega al mapa id->carta las cartas
de un array del JSON de /cards ("items" o "supportItems"), con el MISMO
shape que _mezclarCartasEnMapa() (31_Cards_Mazos.gs) espera, para poder
reusar _refrescarCardsRows()/_rarezaParaFila() tal cual. A diferencia de
_mezclarCartasEnMapa() (que mezcla varias cuentas de jugador y se queda
con el mayor valor de cada campo), acá cada ID aparece una sola vez en el
JSON de /cards -- no hace falta lógica de merge, solo mapear los campos.
@param {Object} map - Mapa id->carta (se modifica).
@param {Array<Object>} items - "items" o "supportItems" del JSON de /cards.
@param {boolean} esTorre - true para "supportItems".
```


### Ubicación: `_agregarCartasApiAMapa`

#### 09B078 — líneas 2768-2777 (docblock)

```text
_buildBattlelogFilename(playerTag, clanName)
Construye el nombre de archivo para el battlelog de un jugador en la
carpeta "Battlelog" (DRIVE_FOLDER_ID_BATTLELOG, declarada en
01_Config_Global.gs). Mismo formato que _buildPlayerFilename() (carpeta
"Players", más arriba en este archivo): "dd-mm-yyyy HH.mm - {ClanName} -
{playerTag}.json". Si no hay clan disponible se usa "Sin clan".
@param {string} playerTag - Tag del jugador (ej. "#2GG8PJ8GC")
@param {string} clanName  - Nombre del clan (opcional)
```


### Ubicación: `_buildBattlelogFilename`

#### 09B079 — líneas 2784-2796 (docblock)

```text
_extraerClanDeBattlelog(data, playerTagNormalizado)
Helper de descargarBattlelogJugador(): a diferencia de /players, el JSON
de /battlelog no trae el clan actual del jugador de forma directa -- hay
que buscarlo dentro de "team" de cada batalla. Recorre las batallas (la
más reciente primero, índice 0) buscando al integrante de "team" cuyo tag
coincida con el jugador consultado, y devuelve el nombre de su clan en
esa batalla. Si nunca aparece con clan, devuelve '' (queda "Sin clan" en
el nombre de archivo).
@param {Array<Object>} data
@param {string} playerTagNormalizado - Tag ya en mayúsculas, con "#".
@returns {string}
```


### Ubicación: `_extraerClanDeBattlelog`

#### 09B080 — líneas 2811-2818 (docblock)

```text
_leerCofresCSV()
Lee Backup_Cofres.csv (Drive, carpeta "CSV", DRIVE_FOLDER_ID_CSV). Mismo
patrón que _leerCardsCSV() (31_Cards_Mazos.gs): si el archivo no existe
todavía, devuelve el set de headers por defecto con 0 filas (se crea
recién al guardar la primera vez).
@returns {{headers: Array<string>, rows: Array<Array>}}
```


### Ubicación: `_leerCofresCSV`

#### 09B081 — líneas 2832-2836 (docblock)

```text
_guardarCofresCSV(headers, rows)
Renumera la columna N° (índice 0) y guarda Backup_Cofres.csv completo.
Mismo patrón que _guardarCardsCSV() (31_Cards_Mazos.gs).
```


### Ubicación: `_guardarCofresCSV`

#### 09B082 — líneas 2842-2855 (docblock)

```text
_actualizarBackupCofresConChests(items)
Helper de descargarUpcomingChestsJugador(): agrega a Backup_Cofres.csv
una fila por cada cofre de "items" (respuesta de /upcomingchests) cuyo
"name" todavía no esté en el CSV. Deduplica por Name -- tanto contra lo
que ya había en el CSV como dentro del propio array (upcomingchests
repite nombres de cofre varias veces, ej. "Golden Chest"). Las filas
nuevas nacen con "Nombre" vacío (traducción manual pendiente, igual que
Backup_Cards.csv); las filas ya existentes NO se tocan. No reordena el
CSV -- las filas nuevas quedan al final (orden pendiente de definir, ver
AVISO en 01_Config_Global.gs).
@param {Array<{index:number,name:string}>} items
@returns {number} Cantidad de filas nuevas agregadas (0 si no hubo).
```


### Ubicación: `_actualizarBackupCofresConChests`

#### 09B083 — líneas 2876-2882 (comentario)

```text
FIX (27-sep-2026, pedido usuario -- se agregó a mano la columna Link a
Backup_Cofres.csv): antes la fila nueva tenía siempre 3 celdas fijas
(N°, Name, Nombre), lo que dejaba filas más cortas que el encabezado
apenas existiera Link. Ahora la fila se arma con tantas celdas como
columnas tenga el CSV, y solo Name se llena (N° lo asigna
_guardarCofresCSV(); Nombre y Link quedan vacíos para completarlos a
mano). Se ubica Name por NOMBRE de columna, igual que _webCofresJugador().
```

#### 09B084 — líneas 2897-2905 (docblock)

```text
_leerArenaCSV()
Lee Backup_Arena.csv (Drive, carpeta "CSV", DRIVE_FOLDER_ID_CSV). Mismo
patrón que _leerCofresCSV()/_leerCardsCSV(): si el archivo no existe
todavía, devuelve el encabezado por defecto con 0 filas.
Columnas (ver bloque de documentación junto a DRIVE_FOLDER_ID_BATTLELOG,
01_Config_Global.gs): N° | ID | Name | RawName | Nombre | Nombre_2.
@returns {{headers: Array<string>, rows: Array<Array>}}
```


### Ubicación: `_leerArenaCSV`

#### 09B085 — líneas 2917-2922 (docblock)

```text
_guardarArenaCSV(headers, rows)
Ordena alfabéticamente (primero por Name, índice 2, luego por RawName,
índice 3 -- confirmado por el usuario, ver 01_Config_Global.gs), renumera
N° (índice 0) según ese orden, y guarda Backup_Arena.csv completo.
```


### Ubicación: `_guardarArenaCSV`

#### 09B086 — líneas 2935-2952 (docblock)

```text
_actualizarBackupArenaConBattlelog(battles)
Helper de descargarBattlelogJugador(): agrega a Backup_Arena.csv una fila
por cada "arena" (id/name/rawName) de "battles" (respuesta de
/battlelog) cuyo ID todavía no esté en el CSV. Deduplica por ID -- tanto
contra lo que ya había en el CSV como dentro del propio array (el
battlelog repite la misma arena en varias batallas). Las filas nuevas
nacen con Nombre/Nombre_2 vacíos (traducción manual pendiente, mismo
criterio que Backup_Cards.csv/Backup_Cofres.csv); las filas ya existentes
NO se tocan (a diferencia de Backup_Modo.csv, acá no hay ningún campo
automático que pudiera faltarles: arena.name y arena.rawName siempre
vienen juntos en el JSON de /battlelog).
A diferencia de Backup_Modo.csv, Backup_Arena.csv NO tiene una segunda
fuente (solo lo alimenta esta función), así que no hace falta ninguna
regla de fusión entre fuentes.
@param {Array<Object>} battles - Array crudo de /battlelog.
@returns {number} Cantidad de filas nuevas agregadas (0 si no hubo).
```


### Ubicación: `_actualizarBackupArenaConBattlelog`

#### 09B087 — líneas 2989-3013 (docblock)

```text
_resolverArenaDesdeCatalogo(rawName)
FASE 5 (27-sep-2026, pedido usuario -- botón "Arena" del perfil web
conectado a Backup_Arena.csv): busca en Backup_Arena.csv, por RawName
(columna índice 3 -- mismo valor que guarda Directorio en DC.ARENA, ver
"if (playerData.arena && playerData.arena.rawName) fila[DC.ARENA - 1] =
playerData.arena.rawName;" en 11_DirectorioSheet.gs), la traducción manual
al español. Mismo criterio de fallback que _resolverModoDesdeCatalogo()
(26_Torneos_Core.gs):
  - Si hay match y "Nombre" (columna índice 4) está completo a mano:
    devuelve Nombre.
  - Si hay match pero "Nombre" está vacío: devuelve "Name" (columna
    índice 2, la que trae la API de Clash Royale, en inglés).
  - Si NO hay match en el catálogo (arena que Battlelog todavía no vio
    para ningún jugador), o si el match no tiene ni Nombre ni Name:
    devuelve el propio rawName recibido, para no dejar el dato vacío.
A diferencia de _resolverModoDesdeCatalogo(), esta función es de SOLO
LECTURA: no agrega filas nuevas al catálogo. Backup_Arena.csv ya se
alimenta únicamente desde _actualizarBackupArenaConBattlelog() (arriba en
este mismo archivo), así que no hace falta duplicar esa lógica acá.
@param {string} rawName - p. ej. fila[DC.ARENA - 1] (usado desde
  _webPerfilExtendido(), 37_Web_API.gs).
@return {string} Nombre en español, o Name en inglés como respaldo, o el
  propio rawName si el catálogo no lo tiene.
```


### Ubicación: `_resolverArenaDesdeCatalogo`

#### 09B088 — líneas 3032-3057 (docblock)

```text
_actualizarBackupModoConBattlelog(battles)
Helper de descargarBattlelogJugador(): alimenta Backup_Modo.csv con
"gameMode" (id/name) de "battles" (respuesta de /battlelog). Reutiliza
_leerModoCSV()/_guardarModoCSV() (26_Torneos_Core.gs -- mismo archivo
físico, no hace falta duplicar la lectura/escritura del CSV).

A diferencia de Backup_Arena.csv, Backup_Modo.csv tiene DOS fuentes (ver
"NUEVA DEFINICIÓN CONFIRMADA", 01_Config_Global.gs, junto a
DRIVE_FOLDER_ID_BATTLELOG): el flujo de Torneos
(_resolverModoDesdeCatalogo(), 26_Torneos_Core.gs) solo conoce el ID y
puede haber dejado filas con Name vacío; Battlelog sí conoce Name
(gameMode.name). Regla de fusión aplicada acá, para NUNCA duplicar fila
por el mismo ID:
  - ID ya existe y su Name está vacío -> se completa Name EN ESA FILA
    (Nombre nunca se toca, es 100% manual).
  - ID ya existe y su Name ya tenía valor -> no se toca.
  - ID no existe todavía -> fila nueva, con Name completo (Nombre vacío
    para que el usuario la traduzca después).
Deduplica también dentro del propio array (un modo se repite en varias
batallas del mismo battlelog).
@param {Array<Object>} battles - Array crudo de /battlelog.
@returns {{agregadas: number, completadas: number}} Cuántas filas nuevas
  se agregaron y cuántas filas existentes de Torneos se completaron con
  el Name que traía Battlelog.
```


### Ubicación: `_actualizarBackupModoConBattlelog`

#### 09B089 — líneas 3101-3114 (docblock)

```text
_guardarJsonClanesConsultaTemporalEnDrive(datos)
Helper compartido por las 4 funciones MANUALES de consulta de clanes
(descargarClanMiembros(), buscarClanesPorNombre(),
buscarClanesPorNombreYUbicacion(), buscarClanesPorUbicacion()). Guarda en
DRIVE_FOLDER_ID_CLANS_CONSULTA_TEMPORAL (01_Config_Global.gs) el JSON
crudo de la respuesta con nombre FIJO ("clans_consulta_temporal.json"),
reemplazado por completo en cada llamada -- las 4 variaciones comparten el
mismo archivo (pedido explícito del usuario, 26-sep-2026: uso pensado para
consultas puntuales desde la web, no histórico por tag/nombre). Mismo
patrón de sobreescritura que descargarRankingGlobalClanes()/etc., más
arriba en este archivo, pero sin nombre por endpoint -- es UN solo archivo
para las 4.
```


### Ubicación: `_guardarJsonClanesConsultaTemporalEnDrive`

#### 09B090 — líneas 3133-3143 (docblock)

```text
_guardarJsonBusquedaNombreEnDrive(nombreBuscado, datos)
Guarda el JSON crudo de /tournaments?name=X en DRIVE_FOLDER_ID_TORNEOS_BUSQUEDA_NOMBRE
(01_Config_Global.gs, subcarpeta "Por búsqueda de nombre" dentro de
"Torneos"), un único archivo por nombre buscado, sobrescrito en cada
corrida. Mismo patrón que _guardarJsonTorneoEnDrive() (26_Torneos_Core.gs),
pero para la búsqueda por nombre en vez del detalle por tag individual.
Hoy la única llamada real es desde testTodosLosEndpoints() (44.gs,
archivo temporal de pruebas de endpoints); el contexto completo de
/tournaments?name=X vive en 26_Torneos_Core.gs, no acá.
```


### Ubicación: `_guardarJsonBusquedaNombreEnDrive`

#### 09B091 — líneas 3162-3183 (comentario)

```text
=============================================================================
SECCION 2: RESTO DE FUNCIONES (cache, fetch de API, helpers internos).

REORDEN (26-sep-2026, pedido usuario): al inicio de esta seccion se
agregaron 12 helpers "_algo()" que antes estaban intercalados en medio de
la Seccion 1 (funciones manuales), mezclados con las funciones que los
usan. Se movieron para acá, EN SU MISMO ORDEN RELATIVO original entre
ellos, para que la Seccion 1 quede compuesta solo por funciones manuales,
sin ninguna intercalada (ver nota completa al inicio de la Seccion 1, mas
arriba en este archivo). Son: los 3 helpers de descargarCards()
(_agregarCartasApiAMapa, _buildBattlelogFilename, _extraerClanDeBattlelog),
los 7 de descargarBattlelogJugador()/descargarUpcomingChestsJugador()
para Cofres/Arena/Modo (_leerCofresCSV, _guardarCofresCSV,
_actualizarBackupCofresConChests, _leerArenaCSV, _guardarArenaCSV,
_actualizarBackupArenaConBattlelog, _actualizarBackupModoConBattlelog), y
los 2 "_guardarJson...EnDrive" (_guardarJsonClanesConsultaTemporalEnDrive,
compartido por las 4 funciones manuales de consulta de clanes, y
_guardarJsonBusquedaNombreEnDrive, de busqueda de torneos por nombre).
Ningun helper cambió de comportamiento, solo de posición dentro del
archivo. El resto de esta sección sigue sin cambios de orden respecto de
antes del reordenamiento del 23-ago-2026.
=============================================================================
```

#### 09B092 — líneas 3185-3193 (docblock)

```text
Llama solo a /clans/{tag} y /clans/{tag}/currentriverrace para todos los
clanes (NO toca /players). Rápido (~10-15s para 5 clanes).
Usar cuando el paso que sigue no necesita perfiles de jugador (Guerra,
Control, Pendientes/Mensajes, formato, tablas, Índice, etc.) — solo
updateDirectorioSheet() y Cards/Cards2 (11_DirectorioSheet.gs) necesitan /players,
y ellos mismos llaman a _fetchPlayersData() al empezar (ver esos
archivos), así que no hace falta pedirlo aquí "por si acaso".
```


### Ubicación: `_fetchClanesBasico`

#### 09B093 — líneas 3200-3225 (comentario)

```text
FIX (06-ago-2026): antes, esta función SIEMPRE pedía los 5 clanes a la
API, sin importar si ya se habían pedido segundos antes en la
continuación anterior del mismo ciclo de runAll()/runUpdate() — la única
protección (_clanesBasicoListoEnEstaEjecucion) vive en memoria y se
resetea en cada ejecución nueva de Apps Script (cada tanda/continuación
ES una ejecución nueva). Ahora, antes de tocar la API, se revisa si hay
un checkpoint reciente guardado en Drive por una tanda anterior del
MISMO ciclo (mismo patrón ya usado por /players, ver
_cargarProgresoPlayers() más abajo). Si existe y está fresco (menos de
CFG.CLANES_PROGRESO_MAX_EDAD_MS, o del `maxEdadMs` que haya pasado el
llamador), se reutiliza tal cual y NO se llama a la API — igual que
"Progreso anterior recuperado de Drive" para /players.

FIX (08-ago-2026): el umbral de 45 min es correcto para Directorio/
Control/Pendientes/Cards, que no necesitan datos al minuto. Pero
runGuerra() se dispara cada 10 min DURANTE la ventana de guerra activa
(4-5am) y llamaba a esta función sin distinguirlo — así que durante
esos ~50 minutos, casi todos los disparos reutilizaban el mismo
checkpoint guardado al principio de la ventana, y decksUsedToday
(Ataques) quedaba congelado para los clanes cuyo checkpoint no se
había vuelto a refrescar, aunque currentriverrace ya tuviera ataques
nuevos en la API real. Ahora el llamador puede pasar un `maxEdadMs`
más corto (ver runGuerra(), 00_Main.gs) para forzar datos frescos de
/currentriverrace en cada disparo de 10 min, sin perder el ahorro de
llamadas a la API entre pasos de una MISMA ejecución/continuación
(eso ya lo cubre _clanesBasicoListoEnEstaEjecucion arriba).
```

#### 09B094 — líneas 3254-3258 (comentario)

```text
LOG DE PERIODO (05-oct-2026, pedido usuario): sectionIndex/periodIndex/periodType TAL CUAL los
devuelve la API para ESTE clan, con timestamp de Lima, y los totales de participantes (para
detectar de un vistazo un reinicio de contadores). Cada clan cambia de periodIndex en momentos
distintos (4-5 a.m. Lima): NO se asume que todos coincidan. Temporada/Semana/DiaGuerra con los que
se etiquetan las filas salen en la linea [Guerra][PERIODO] de updateGuerraSheet().
```

#### 09B095 — líneas 3276-3281 (comentario)

```text
Filtrar cuentas ocultas manualmente (ver CFG.TAGS_OCULTOS en
01_Config_Global.gs) directamente acá: es el único punto de entrada de
memberList para TODO el proyecto (Directorio, Guerra, Control,
Pendientes, Mensajes...), así que filtrar aquí basta para que la
cuenta desaparezca de todas las hojas sin tocar cada una por
separado.
```

#### 09B096 — líneas 3293-3296 (comentario)

```text
API falló para este clan. FIX (02-oct-2026): antes el clan quedaba
fuera del cache y Directorio/Control abortaban. Ahora se usa el
roster del último checkpoint (aunque sea viejo). El riverrace NO se
toma del respaldo (podría traer ataques de otro día).
```

#### 09B097 — líneas 3333-3340 (comentario)

```text
FIX (06-ago-2026): guarda lo recién obtenido en Drive para que la
PRÓXIMA tanda/continuación de este mismo ciclo lo recupere arriba (ver
_cargarProgresoClanes()) en vez de volver a pedirlo a la API. Se borra
recién cuando el ciclo completo de runAll()/runUpdate() termina de
verdad (ver _borrarProgresoClanes() en 09_API_ClashRoyale.gs), mismo criterio que
ya usa _guardarProgresoPlayers()/_borrarProgresoPlayers().
FIX (02-oct-2026): solo se guarda si TODO vino fresco de la API. Antes un
resultado parcial sobrescribía el checkpoint bueno y se perdía el respaldo.
```

#### 09B098 — líneas 3348-3352 (comentario)

```text
NUEVO (05-oct-2026, pedido usuario: "mostrar en la web la ultima hora de consulta a la api"): se anota que
acaba de haber una consulta a la API de clanes y si salio completa (la misma condicion que decide si se guarda
el checkpoint de arriba). La hora vive en una propiedad del script, no en el checkpoint, porque runAll()/
runUpdate() borran el checkpoint al terminar (_borrarProgresoClanes()). Ver 42_Web_TiemposActualizacion.gs.
Un fallo al anotar nunca debe afectar la captura.
```

#### 09B099 — líneas 3361-3369 (comentario)

```text
---------------------------------------------------------------------------
PERSISTENCIA DE PROGRESO DE CLANES (para reanudación sin repetir)
FIX (06-ago-2026): mismo patrón que _guardarProgresoPlayers()/
_cargarProgresoPlayers()/_borrarProgresoPlayers() más abajo en este mismo
archivo. Guarda { info, members, riverrace } por clan (NUNCA _players, que
ya tiene su propio archivo de progreso independiente) para que una
continuación posterior no repita /clans y /currentriverrace si ya se
pidieron hace poco dentro del mismo ciclo de runAll()/runUpdate().
---------------------------------------------------------------------------
```

#### 09B100 — líneas 3371-3378 (docblock)

```text
_guardarProgresoClanes(cacheClanData)
Guarda en Drive los datos básicos de clanes (info + members + riverrace)
ya obtenidos en este ciclo, envueltos con un timestamp _ts — mismo
criterio que _guardarProgresoPlayers().
@param {Object} cacheClanData - CACHE_CLAN_DATA completo (se filtra a solo
  las claves de CFG.CLAN_TAGS; _players y banderas internas no se guardan).
```


### Ubicación: `_guardarProgresoClanes`

#### 09B101 — líneas 3401-3416 (docblock)

```text
_cargarProgresoClanes(maxEdadMs)
Lee el progreso de clanes guardado por una tanda anterior DENTRO DEL
MISMO ciclo de runAll()/runUpdate() (cada continuación es una ejecución
de Apps Script nueva, con CACHE_CLAN_DATA reiniciado en memoria). Si el
timestamp guardado tiene más de `maxEdadMs` (o de CFG.CLANES_PROGRESO_MAX_
EDAD_MS si no se pasa nada), se descarta (resto de un ciclo anterior que
no llegó a limpiarse, o — FIX 08-ago-2026 — checkpoint demasiado viejo
para un llamador que necesita datos frescos por minuto, como runGuerra())
— mismo criterio que _cargarProgresoPlayers().
@param {number} [maxEdadMs] - Umbral de frescura en ms. Si se omite, usa
  CFG.CLANES_PROGRESO_MAX_EDAD_MS (45 min, el criterio de siempre para
  Directorio/Control/Pendientes/Cards).
@returns {Object|null} Mapa { clanTag: {info, members, riverrace} }, o null
  si no existe, no se pudo leer, o quedó viejo.
```


### Ubicación: `_cargarProgresoClanes`

#### 09B102 — líneas 3432-3440 (comentario)

```text
NOTA (08-ago-2026): antes esto siempre borraba el archivo
(file.setTrashed(true)), asumiendo que "viejo" == "resto de un
ciclo anterior". Ya no es así: runGuerra() puede pasar un
maxEdadMs corto y descartar un checkpoint que sigue siendo
perfectamente válido para OTRO llamador con umbral más largo
(Directorio/Control/Pendientes) que corra después en el mismo
ciclo. Borrarlo aquí forzaría a ESE llamador a repetir la API
también, sin necesidad. El archivo se sigue limpiando de verdad
en _borrarProgresoClanes() al terminar el ciclo completo.
```

#### 09B103 — líneas 3450-3454 (docblock)

```text
_cargarProgresoClanesSinEdad()
FIX (02-oct-2026): lee el checkpoint de clanes ignorando su antigüedad.
Sirve de respaldo de roster cuando la API falla.
```


### Ubicación: `_cargarProgresoClanesSinEdad`

#### 09B104 — líneas 3468-3472 (docblock)

```text
_invalidarProgresoClanes()
FIX (02-oct-2026): marca el checkpoint como vencido (_ts = 0) SIN borrar los
datos, para forzar consulta fresca pero conservar un respaldo de roster.
```


### Ubicación: `_invalidarProgresoClanes`

#### 09B105 — líneas 3481-3483 (comentario)

```text
NUEVO (05-oct-2026): se conserva la hora real de captura en _tsReal (solo la primera vez) para que
las lecturas SIN API (_fetchClanesBasicoSinApi) sigan sabiendo que edad tienen los datos aunque
_ts = 0 los haya marcado como "vencidos" para las consultas que si piden API.
```

#### 09B106 — líneas 3494-3507 (comentario)

```text
---------------------------------------------------------------------------
LECTURA DEL CHECKPOINT DE CLANES SIN LLAMAR A LA API (05-oct-2026, pedido usuario)
---------------------------------------------------------------------------
CONTEXTO: las versiones PROGRAMADAS de runGuerraRapido() y runPendientesYMensajes() (00_Main.gs) no deben
consultar la API de Supercell: la unica captura contra la API en el dia a dia es runGuerra() (cada 5 min en
la ventana 4:00-4:59 a.m. Lima, 1 vez por hora fuera de ella). Esas versiones leen el ULTIMO checkpoint que
dejo runGuerra() (Cache_Clanes_Progreso.json, ver _guardarProgresoClanes()), asi no compiten por cuota ni por
el candado de la captura.
OJO (verificado en el codigo): ese checkpoint es el unico JSON que escribe runGuerra(). Los JSON por clan y por
periodIndex de _guardarCacheEnDrive() los escribe guardarApiDump(), que solo corre dentro de runAll()/runUpdate().
El checkpoint solo se sobrescribe cuando los 5 clanes llegaron frescos y con currentriverrace (ver el final de
_fetchClanesBasico()): si la API falla o da 404, queda el ultimo bueno.
AVISO ABIERTO (pendiente de definir): runAll()/runUpdate() borran este archivo al terminar su ciclo
(_borrarProgresoClanes()); hasta la siguiente captura de runGuerra() las lecturas sin API abortan con aviso.
```

#### 09B107 — líneas 3509-3511 (comentario)

```text
Edad maxima aceptada por las lecturas SIN API. Por encima de este valor se considera que la captura de
runGuerra() dejo de funcionar y NO se generan hojas/mensajes a partir de datos tan viejos.
PENDIENTE DE DEFINIR por el usuario (valor por defecto puesto por Claude): 3 h.
```


### Ubicación: `CLANES_SIN_API_TS_CARGADO`

#### 09B108 — líneas 3518-3523 (docblock)

```text
_leerProgresoClanesConEdad_()
Lee el checkpoint de clanes sin descartarlo por antiguedad y devuelve tambien su hora de captura.
Si el checkpoint fue invalidado (_ts = 0, ver _invalidarProgresoClanes()) usa _tsReal.
@returns {{clanes:Object, ts:number, edadMs:number}|null} null si no existe o no se puede leer.
```


### Ubicación: `_leerProgresoClanesConEdad_`

#### 09B109 — líneas 3539-3547 (docblock)

```text
_fetchClanesBasicoSinApi(maxEdadMs)
Contraparte de _fetchClanesBasico() que NUNCA llama a la API: carga CACHE_CLAN_DATA desde el ultimo checkpoint
de clanes guardado por runGuerra() (o por cualquier otra consulta fresca). Deja las mismas banderas en memoria
que _fetchClanesBasico(), de modo que cualquier _fetchClanesBasico() posterior en esta ejecucion se omite.
@param {number} [maxEdadMs] - edad maxima aceptada; por defecto CLANES_SIN_API_MAX_EDAD_MS.
@returns {boolean} true si el cache quedo cargado con los clanes de CFG.CLAN_TAGS; false si no hay checkpoint,
  esta muy viejo o le faltan clanes (en ese caso CACHE_CLAN_DATA no se toca y NO se llama a la API).
```


### Ubicación: `_fetchClanesBasicoSinApi`

#### 09B110 — líneas 3591-3597 (docblock)

```text
_borrarProgresoClanes()
Elimina el archivo de progreso de clanes de Drive. Se llama junto a
_borrarProgresoPlayers(): cuando el CICLO COMPLETO de runAll()/
runUpdate() termina de verdad (_continuarRunAll()/_continuarRunUpdate()
en 09_API_ClashRoyale.gs), y desde cancelarEjecucion() al reiniciar manualmente.
```


### Ubicación: `_borrarProgresoClanes`

#### 09B111 — líneas 3608-3615 (docblock)

```text
Llama a la API para todos los clanes (datos básicos) Y, si
PLAYERS_API_ENABLED no es false, también a /players/{tag}.
Usar SOLO cuando el paso que sigue de verdad necesita perfiles de
jugador completos (Directorio, Cards/Cards2 ya lo hacen por su cuenta;
este punto de entrada queda para runDirectorio(), runGuerra(), y el
paso explícito 0 de PASOS_RUNALL/PASOS_RUNUPDATE).
```


### Ubicación: `_fetchAllClanData`

#### 09B112 — líneas 3619-3623 (comentario)

```text
IMPORTANTE: _fetchPlayersData() SIEMPRE se llama, sin importar
PLAYERS_API_ENABLED, porque esa función ya decide internamente qué
tags pedir según el interruptor (false: nadie; 'admin': solo admins;
'partial': admins + V_Guerra vacío; true: todos) — ver comentario
dentro de _fetchPlayersData().
```

#### 09B113 — líneas 3635-3638 (comentario)

```text
Se propaga hacia _ejecutarPorTandas() (00_Main.gs): si /players quedó
incompleto por presupuesto de tiempo, este `false` hace que se
reintente el MISMO paso en la próxima continuación en vez de avanzar,
retomando el progreso ya guardado en Drive (ver _fetchPlayersData()).
```

#### 09B114 — líneas 3642-3657 (docblock)

```text
Llama a /players/{tag} según el valor de PLAYERS_API_ENABLED.
false: no llama a nadie (ni siquiera admins).
'admin': solo las cuentas Admin='Sí' de Directorio.
'partial': admins + quienes tienen V_Guerra vacío en Directorio.
true: todos los activos Terna (incluye admins).

REANUDABLE: si el presupuesto interno de tiempo (PLAYERS_FETCH_BUDGET_MS)
se agota antes de terminar la lista completa, guarda en Drive lo ya
obtenido y devuelve `false` sin lanzar error. La próxima vez que se
llame (incluso en una ejecución de Apps Script completamente nueva)
carga ese progreso y NO vuelve a pedir los tags ya obtenidos.
Devuelve `true` solo cuando la lista completa quedó en cache.

@returns {boolean} true si terminó toda la lista, false si quedó incompleta.
```


### Ubicación: `_fetchPlayersData`

#### 09B115 — líneas 3659-3668 (comentario)

```text
FASE 1 (plan de cambios, ver 01_Config_Global.gs): interruptor de "esta
corrida no debe tocar /players bajo ningún concepto", independiente de
PLAYERS_API_ENABLED. Se chequea ANTES que cualquier otra cosa (incluso
antes de asegurar CACHE_CLAN_DATA) para no disparar ninguna llamada
HTTP a /players, ni siquiera para admins. Quien active este interruptor
es responsable de volver a ponerlo en false (ver comentario junto a su
declaración en 01_Config_Global.gs). Devuelve `false` (igual que un corte por
presupuesto de tiempo) para que el llamador sepa que la lista de
/players quedó sin completar en esta corrida, sin que eso dispare
ningún reintento automático fuera de lugar.
```

#### 09B116 — líneas 3686-3710 (comentario)

```text
FASE 12 (18/07/2026): los admins se cargan PRIMERO, antes que los
miembros de los clanes Terna (antes se agregaban al final — ver bloque
más abajo, que ahora es solo el comentario histórico de ESE cambio).
Causa raíz confirmada: si el proxy gratuito (Render free tier, lento
por naturaleza) hace que CFG.PLAYERS_FETCH_BUDGET_MS (3m30s) se corte
sistemáticamente durante el recorrido de los ~150-200 miembros de los
4 clanes Terna, los tags que se agregaban DESPUÉS (los admins) nunca
llegaban a pedirse en NINGUNA corrida — como cada corrida nueva vuelve
a construir tagsToFetch en el mismo orden, ese tag jamás se alcanza ni
se guarda en el progreso reanudable, así que su Clan/Clan_Tag/Rango
quedan con el último valor conocido para siempre (reporte del
18-jul-2026: cuentas "Mily", Admin=Sí, Inactivo hace 83 días, seguían
mostrando el clan del que ya salieron). En LOS TRES modos ('false',
'partial' y true) se actualizan SIEMPRE todas las cuentas marcadas como
Admin en el Directorio (Admin = "Sí"), sin importar su Estado (Activo o
Inactivo) — solo se agregan los admins, NUNCA todos los inactivos.

FASE (02/08/2026): el bloque de admins ahora es CONDICIONAL. Antes
corría siempre, en los tres modos (incluido false), para que los
admins nunca quedaran desactualizados sin importar el interruptor.
Ahora 'false' es un apagado TOTAL (no llama /players para nadie, ni
siquiera admins) — ese caso de "admins siempre actualizados" pasó a
ser su propio modo explícito: PLAYERS_API_ENABLED = 'admin'. Los modos
'admin', 'partial' y true agregan admins aquí; 'partial' y true además
agregan más tags abajo (V_Guerra vacío / todos los activos Terna).
```

#### 09B117 — líneas 3774-3779 (comentario)

```text
FIX (23/07/2026): antes no se llevaba registro de qué tags fallaban al
pedir /players (playerData null) — no había forma de saber, al terminar
la corrida, si faltó alguna cuenta o si hubo error puntual con alguna.
Ahora se acumulan acá y se resumen en UNA sola línea de log al final
(ver los dos `Logger.log` de resumen más abajo), en vez de imprimir
línea por línea cada consulta exitosa.
```

#### 09B118 — líneas 3782-3786 (comentario)

```text
periodIndex REAL del periodo de guerra actual (entero que entrega la API
en currentriverrace.periodIndex, ya validado por _getCtx()). Se usa como
clave de deduplicación del archivo por jugador en Drive — ver
_guardarPlayerEnDrive() en 09_API_ClashRoyale.gs. Se calcula UNA sola vez aquí
(no por jugador) porque no cambia durante el recorrido de la lista.
```

#### 09B119 — líneas 3799-3803 (comentario)

```text
Límite de consultas por tanda (CFG.PLAYERS_FETCH_MAX_POR_TANDA),
independiente del presupuesto de tiempo de arriba: corta apenas se
alcanzan las 60 consultas en esta misma tanda, aunque todavía quede
presupuesto de tiempo disponible. Mismo tratamiento que un corte por
tiempo: se guarda el progreso y se retoma en la próxima continuación.
```

#### 09B120 — líneas 3816-3822 (comentario)

```text
FIX (19/07/2026): antes NINGÚN punto del flujo real llamaba a
_guardarPlayerEnDrive() — esa función solo se usaba desde
_fetchPlayersCached() (09_API_ClashRoyale.gs), que a su vez nunca se invoca
desde 09_API_ClashRoyale.gs. Resultado: la carpeta Players en Drive quedaba
siempre vacía, sin importar PLAYERS_API_ENABLED. Ahora se guarda
aquí mismo, apenas se obtiene cada jugador, en el mismo lugar
donde ya se persiste el progreso reanudable.
```

#### 09B121 — líneas 3832-3839 (comentario)

```text
FIX (23/07/2026): antes cada jugador obtenido/guardado dejaba su propia
línea de log (en este loop y dentro de _guardarPlayerEnDrive), lo que
inflaba muchísimo el registro de ejecución para ~150-200 jugadores por
corrida y no aportaba nada que no se pudiera resumir al final. Ahora
solo se loguea UNA vez por llamada a _fetchPlayersData(): cuántos se
obtuvieron, cuántos quedaron pendientes (si se cortó por tiempo) y,
sobre todo, la lista de tags que fallaron (si hubo alguno), para poder
detectar de un vistazo "faltó esta cuenta" o "hubo error con esta otra".
```

#### 09B122 — líneas 3851-3865 (comentario)

```text
FASE 21 (01/08/2026): antes se llamaba a _borrarProgresoPlayers() acá
mismo, apenas se completaba la lista DENTRO DE ESTA TANDA — pero eso
borraba el cache de Drive antes de que el resto del ciclo de
runAll()/runUpdate() (que puede seguir en tandas/ejecuciones
posteriores) llegara a aprovecharlo. Resultado: cualquier paso
posterior (updateDirectorioSheet, updateCardsSheet, etc.) que volviera
a llamar a _fetchPlayersData() en una tanda nueva no encontraba nada
que recuperar y volvía a pedir TODOS los jugadores a la API en vivo,
aunque ya se hubieran traído minutos antes en la misma corrida general.
Ahora el archivo se deja vivo: lo borra _borrarProgresoPlayers(), que
se llama desde _continuarRunAll()/_continuarRunUpdate() (09_API_ClashRoyale.gs)
recién cuando el CICLO COMPLETO termina, no cada vez que /players
termina su propia lista. _cargarProgresoPlayers() igual descarta el
archivo solo si quedó más viejo que CFG.PLAYERS_PROGRESO_MAX_EDAD_MS,
para no arrastrar datos de un ciclo anterior que no llegó a limpiar.
```

#### 09B123 — líneas 3871-3878 (comentario)

```text
---------------------------------------------------------------------------
PERSISTENCIA DE PROGRESO DE /players (para reanudación sin repetir)
Usa la misma carpeta de Drive que el resto de los JSON sueltos: "Otros"
(DRIVE_FOLDER_ID_OTROS, 01_Config_Global.gs) — antes usaba "JSON" directo,
ver AVISOS ABIERTOS / FASE B más arriba en este archivo. El archivo es
temporal: se borra automáticamente en cuanto _fetchPlayersData() termina
su lista completa.
---------------------------------------------------------------------------
```

#### 09B124 — líneas 3880-3888 (docblock)

```text
_guardarProgresoPlayers(playersMap)
Guarda en Drive los datos de /players ya obtenidos en este ciclo (éxito
parcial o total), para que una continuación posterior no repita esas
llamadas. Se envuelve con un timestamp (_ts) para que _cargarProgresoPlayers()
pueda distinguir "progreso de ESTE ciclo de runAll/runUpdate" de un
archivo viejo que quedó pegado de un ciclo anterior (ver FASE 21 más abajo).
@param {Object} playersMap - CACHE_CLAN_DATA._players, mapa { tag: playerData }
```


### Ubicación: `_guardarProgresoPlayers`

#### 09B125 — líneas 3904-3927 (docblock)

```text
_cargarProgresoPlayers()
Lee el progreso de /players guardado por una tanda anterior DENTRO DEL
MISMO ciclo de runAll()/runUpdate() (que puede abarcar varias tandas —
cada continuación es una ejecución de Apps Script nueva, con
CACHE_CLAN_DATA reiniciado en memoria).

FASE 21 (01/08/2026): antes _fetchPlayersData() borraba este archivo
apenas terminaba de traer la lista COMPLETA de jugadores dentro de UNA
tanda — pero si un paso posterior (updateDirectorioSheet, updateCardsSheet,
etc.), ya en una tanda/ejecución distinta, volvía a llamar a
_fetchPlayersData(), no encontraba nada que recuperar (el archivo ya no
existía) y volvía a pedir los ~150-200 jugadores a la API EN VIVO desde
cero, aunque ya se hubieran traído minutos antes en la misma corrida
general. Ahora el archivo sobrevive hasta el final del ciclo completo
(ver _borrarProgresoPlayers() llamado desde _continuarRunAll()/
_continuarRunUpdate() en 09_API_ClashRoyale.gs cuando el ciclo entero termina), y
acá se valida que no sea un resto viejo de un ciclo anterior: si el
timestamp guardado tiene más de PLAYERS_PROGRESO_MAX_EDAD_MS, se
descarta (y se borra) en vez de reutilizarse — para no arrastrar datos
de jugadores desactualizados indefinidamente si alguna corrida quedara
sin terminar del todo.
@returns {Object|null} Mapa { tag: playerData }, o null si no existe, no se pudo leer, o quedó viejo.
```


### Ubicación: `_cargarProgresoPlayers`

#### 09B126 — líneas 3937-3940 (comentario)

```text
Compatibilidad hacia atrás: si el archivo es un mapa "pelado" (formato
previo a esta fase, sin _ts), se trata como progreso válido siempre
(no hay timestamp para juzgar antigüedad) — se migrará al formato
nuevo la próxima vez que se guarde.
```

#### 09B127 — líneas 3961-3969 (docblock)

```text
_borrarProgresoPlayers()
Elimina el archivo de progreso de /players. FASE 21 (01/08/2026): ya NO
se llama al completar la lista dentro de una sola tanda de
_fetchPlayersData() (ver comentario ahí) — ahora se llama desde
_continuarRunAll()/_continuarRunUpdate() (09_API_ClashRoyale.gs) cuando el CICLO
COMPLETO de runAll()/runUpdate() termina de verdad, y desde
cancelarEjecucion() (00_Main.gs) al reiniciar manualmente desde cero.
```


### Ubicación: `_borrarProgresoPlayers`

#### 09B128 — líneas 3980-3986 (docblock)

```text
Obtiene los tags de TODAS las cuentas marcadas como Admin = "Sí" en la
hoja Directorio, sin filtrar por Estado (incluye Activos e Inactivos).
Se usa en modo PLAYERS_API_ENABLED = 'partial' para asegurar que los
administradores siempre tengan sus datos actualizados.
@returns {string[]} Array de tags
```


### Ubicación: `_getTagsAdmin`

#### 09B129 — líneas 4011-4015 (docblock)

```text
Obtiene los tags de jugadores que tienen V_Guerra vacío en la hoja Directorio.
Se usa cuando PLAYERS_API_ENABLED = 'partial'.
@returns {string[]} Array de tags
```


### Ubicación: `_getTagsConVGuerraVacia`

#### 09B130 — líneas 4043-4048 (docblock)

```text
_getBadgeLevel(playerData, badgeName)
Extrae el campo 'level' de un badge por nombre desde /players.
Usado para: YearsPlayed → Antigüedad.
@returns {number|''} level del badge, o '' si no se encuentra.
```


### Ubicación: `_getBadgeLevel`

#### 09B131 — líneas 4059-4064 (docblock)

```text
_getBadgeProgress(playerData, badgeName)
Extrae el campo 'progress' de un badge por nombre desde /players.
Usado para: EmoteCollection → Emotes, BannerCollection → Banners.
@returns {number|''} progress del badge, o '' si no se encuentra.
```


### Ubicación: `_getBadgeProgress`

#### 09B132 — líneas 4075-4080 (docblock)

```text
Extrae el valor de V_Guerra (ClanWarWins badge) del objeto /players.
CRITICO: NO confundir badges[ClanWarWins].progress con warDayWins - son campos distintos.
@param {Object} playerData - Respuesta del endpoint /players/{tag}
@returns {number|''} El progreso del badge ClanWarWins, o '' si no está disponible.
```


### Ubicación: `_getVGuerra`

#### 09B133 — líneas 4091-4095 (docblock)

```text
Extrae el progress de collectionLevel del objeto /players.
@param {Object} playerData - Respuesta del endpoint /players/{tag}
@returns {number|''} El progress de CollectionLevel, o '' si no está disponible.
```


### Ubicación: `_getNivel2`

#### 09B134 — líneas 4106-4114 (docblock)

```text
Realiza una petición GET al proxy de la API de Clash Royale.
Reintenta automáticamente ante fallos transitorios de conexión (ver FIX
17-ago-2026 arriba) — hasta API_GET_MAX_INTENTOS intentos, con espera
creciente entre cada uno.
@param {string} path - Ruta del endpoint (ej: '/clans/%23GCRG8L00')
@returns {Object|null} Objeto JSON parseado, o null si hubo error (tras
  agotar los reintentos, si aplican, o de inmediato si fue un error real).
```


### Ubicación: `_apiGet`

#### 09B135 — líneas 4138-4142 (comentario)

```text
FIX (02-oct-2026): el proxy (Render) detrás de Cloudflare devuelve a
menudo 500/520-525 de forma transitoria (visto en logs: 525 "SSL
handshake failed", 500 HTML, 520). Antes solo se reintentaban
502/503/504, así que cualquiera de esos códigos dejaba al clan sin
datos en la primera falla. Ahora todo 5xx es reintentable.
```

#### 09B136 — líneas 4152-4158 (comentario)

```text
FIX (12-sep-2026): HTTP 429 (rate limit) también es transitorio —
ver docblock de arriba ("causa raíz encontrada") para el detalle
completo de por qué esto dejaba huecos en los clanes 2, 3 y 4 (los
que salen después en _fetchClanesBasico()) tras un Demoler + runAll.
Se respeta el header Retry-After (en segundos) si el proxy lo envía;
si no, se usa API_GET_ESPERA_429_MS * intento (más generoso que el
de 502/503/504).
```

#### 09B137 — líneas 4188-4220 (docblock)

```text
pingProxyRender()
FIX (09-sep-2026, pedido usuario — "Error de conexión: Unexpected token
'<', "<!DOCTYPE "... is not valid JSON" al buscar un Tag sin registro en
el buscador público, incluso después de aplicar el fix de
_webApiGetRapido() en 37_Web_API.gs, ver docblock ahí): ese fix (un solo
intento, sin los 3 reintentos de _apiGet()) evita que la SUMA de varios
intentos supere el tiempo de respuesta que Google le da a una URL /exec,
pero NO evita que un ÚNICO intento tarde de más si el proxy
(clash-royale-proxy-2eyr.onrender.com, Render free tier) está dormido —
y eso sigue pasando casi todo el día, porque runGuerra (installTriggers()
en 00_Main.gs) solo llama a la API 1 vez por hora fuera de la franja
04:00-04:59 hora Perú (ejecución "ligera"), dejando tramos de más de 15
minutos sin ningún tráfico hacia el proxy — más que suficiente para que
Render lo vuelva a dormir.
CORRECCIÓN (05-oct-2026, el usuario mostró su panel de UptimeRobot): lo que
decía este comentario antes (que UptimeRobot solo mantenía despierta la Web
App de Apps Script y no tocaba el proxy) ya NO es cierto. El monitor
"Render" de UptimeRobot hace un GET cada 5 minutos a CFG.API_BASE, la misma
URL y el mismo GET que hace esta función, así que hoy es UptimeRobot quien
mantiene despierto el proxy. Por eso el activador de esta función quedó con
activo:false en 08_Activadores.gs (el ping propio era redundante y gastaba
~750 s/día de cuota de disparadores).

Esta función se CONSERVA como respaldo: 45_Vigilante_UptimeRobot.gs la
llama (cada 9 min) solo mientras detecta que UptimeRobot dejó de cuidar el
proxy, y deja de llamarla cuando UptimeRobot vuelve.

No hace nada con la respuesta — el único objetivo es generar tráfico real
hacia el proxy para que no llegue a dormirse del todo, y así cualquier
búsqueda real (_webApiGetRapido(), _webAdminVerificarTag()) encuentre el
proxy ya despierto y responda en segundos, sin depender de reintentos.
```


### Ubicación: `pingProxyRender`

#### 09B138 — líneas 4233-4235 (comentario)

```text
---------------------------------------------------------------------------
Helpers de acceso al cache (para uso en otros módulos)
---------------------------------------------------------------------------
```


### Ubicación: `_setPlayerCache`

#### 09B139 — líneas 4265-4269 (docblock)

```text
Obtiene el contexto de temporada/semana/día del primer clan Terna disponible en cache.
Esta información es la fuente de verdad para todos los módulos.
@returns {Object} { temporada, sectionIndex, periodIndex, diaLetra, ref, diaGuerra, esDiaGuerra }
```


### Ubicación: `_getCtx`

#### 09B140 — líneas 4291-4318 (comentario)

```text
FIX (19-ago-2026, diagnóstico "Control_2 no reconstruye nada de la
cuadrícula"): cuando NO hay cache de clanes (llamada aislada — ej.
actualizarControl2() corrida manual desde el editor, o encadenada
desde el webhook de Tampermonkey sin _fetchAllClanData() previo),
periodIndex se quedaba en el 0 inicial de arriba, SIN excepción.
Eso hacía que actualizarControl2() (23_Control2_GuerraSemanal.gs)
tratara TODAS las semanas de la temporada como "semana futura"
(inicioSemanaPeriodIndex > ctx.periodIndex siempre, para las 5
semanas) y las dejara con el 'continue' que salta el cálculo — la
cuadrícula (Ataques/Puntaje/Barcos) quedaba en blanco para los 130
jugadores aunque las columnas fijas (Tag/Nombre/Clan/etc.) sí se
escribían bien. Esto reproduce exactamente el log reportado por el
usuario: "[_getCtx] SIN CACHE DE CLANES..." seguido de
"[Control_2] Actualizado — temporada 4 (real vigente). Jugadores:
130" — la función terminaba "bien" pero con periodIndex=0 por dentro.

SOLUCIÓN: igual que ya se hace para mesEfectivo (ver
_getMesEfectivo(periodIndex, cacheEncontrado) más abajo, que YA sabe
devolver el último mes efectivo conocido sin cache), acá se hace lo
mismo con periodIndex/sectionIndex/periodType: si no hay cache, se
recupera el último periodIndex ACEPTADO como válido por el guardián
anti-stale (CTX_ULTIMO_PERIODINDEX_OK, la misma propiedad que ya se
guarda más abajo cada vez que SÍ hay cache y no es sospechoso) en vez
de dejarlo en 0. No se marca cacheEncontrado=true (eso seguiría
significando "vengo de la API ahora mismo"), así que el guardián
anti-stale de más abajo (que solo corre si cacheEncontrado) sigue sin
tocarse: esto es puramente un mejor valor de fallback para no romper
cálculos que dependen de "qué semana es hoy" en llamadas aisladas.
```

#### 09B141 — líneas 4329-4343 (comentario)

```text
---------------------------------------------------------------------
Si NINGÚN clan tiene cache cargado (ej. una llamada aislada a _getCtx()
fuera del flujo runAll()/runUpdate(), como una función de diagnóstico
o un trigger que no llamó antes a _fetchAllClanData()), periodIndex
vale 0 por DEFECTO — pero eso NO significa que la temporada realmente
haya reiniciado. Si se le pasara este 0 falso a _getMesEfectivo(), lo
guardaría como si fuera un dato real y corrompería CTX_LAST_PERIOD_INDEX
/ CTX_ULTIMO_PERIODINDEX_OK — eso fue justo lo que causó que Control
abortara la escritura de un día real de guerra (ver conversación del
04-jul-2026: una llamada aislada dejó "ultimoOk=0", y la siguiente
corrida real con periodIndex=33 se marcó como falsa alarma de
"stale"). Por eso: sin cache válido, NO se llama a _getMesEfectivo()
en modo "persistir" — se lee el último mes efectivo guardado tal cual,
sin tocar ningún contador.
---------------------------------------------------------------------
```

#### 09B142 — líneas 4357-4371 (comentario)

```text
-----------------------------------------------------------------
GUARDIÁN ANTI-PERIODINDEX-DESACTUALIZADO (stale de la API)
Justo al terminar una temporada real, la API de Supercell a veces sigue
devolviendo por un rato el periodIndex/sectionIndex VIEJO (de la semana
5 recién terminada) en vez de reiniciarlo a 0. Si eso se escribe tal
cual, toda la temporada nueva queda mal etiquetada como "Semana 5"
desde el día 1 (esto es justamente lo que le pasó a 2 temporadas
completas — ver diagnóstico del 04-jul-2026). Como periodIndex avanza
~1 por día, un salto hacia ARRIBA de más de 2 en menos de 20 horas
respecto a la última lectura aceptada es fisicamente imposible salvo
dato corrupto/stale — se marca ctx.periodIndexSospechoso y las hojas
que dependen de esto (Guerra, Guerra_Logs, Control) deben ABORTAR esa
corrida sin escribir nada, reintentando en la siguiente (10 min
después vía runGuerra) hasta que la API se estabilice.
-----------------------------------------------------------------
```

#### 09B143 — líneas 4410-4421 (docblock)

```text
_normalizarNombreClan_(nombre)
Normaliza un nombre de clan para comparación robusta:
  - Aplica Unicode NFC (compone caracteres descompuestos en una sola forma).
  - Convierte a minúsculas.
  - Recorta espacios al inicio/fin.
Esto evita que diferencias de normalización Unicode (el mismo carácter
visual codificado de dos formas distintas) rompan la comparación con
_SUBCARPETAS_CLAN_, como ocurrió con el bug de "乂" documentado arriba.
@param {string} nombre
@returns {string}
```


### Ubicación: `_normalizarNombreClan_`

#### 09B144 — líneas 4430-4445 (docblock)

```text
_getCarpetaParaClan(clanName)
CAMBIO (26-sep-2026, pedido del usuario: pasar del esquema VIEJO
"clan -> endpoint" al esquema NUEVO "endpoint -> clan"; ver AVISOS
ABIERTOS más arriba en este archivo). Antes esta función ya devolvía el
Folder final del clan (antes de bajar al endpoint). Ahora, como hace
falta conocer primero el ENDPOINT para poder ubicar la carpeta raíz
correcta ("Clans" o "CurrentRiverRace"), esta función YA NO resuelve un
Folder por sí sola: solo normaliza el nombre del clan una vez y lo pasa
como una posta liviana a _getSubcarpetaEndpoint_(), que es quien sí
conoce el endpointKey y hace la resolución real.
Los llamadores NO cambian: se sigue usando exactamente igual que antes,
como primer paso antes de _getSubcarpetaEndpoint_(resultado, endpointKey).
@param {string} clanName
@returns {{clanName: string, clave: string}}
```


### Ubicación: `_getCarpetaParaClan`

#### 09B145 — líneas 4450-4465 (docblock)

```text
_getSubcarpetaEndpoint_(carpetaClanInfo, endpointKey)
CAMBIO (26-sep-2026, esquema NUEVO "endpoint -> clan"): ya no recibe un
Folder de clan para buscar el endpoint DENTRO de él. Ahora hace el camino
inverso: ubica primero la carpeta RAÍZ del endpoint (DRIVE_FOLDER_ID_CLANS
o DRIVE_FOLDER_ID_CURRENTRIVERRACE, vía _ENDPOINT_ROOT_Y_SUBCARPETAS_CLAN_
más arriba en este archivo) y, dentro de ella, la subcarpeta del clan
(_SUBCARPETAS_CLAN_POR_ENDPOINT_CLANS_ / _..._CURRENTRIVERRACE_). Si el
clan no está mapeado dentro de ese endpoint, cae a la carpeta raíz del
propio endpoint (antes caía a la raíz JSON general); si el endpointKey no
está mapeado (hoy no pasa: 'clans' y 'currentriverrace' son los dos únicos
de este cache), cae a la raíz JSON como último fallback.
@param {{clanName: string, clave: string}} carpetaClanInfo - lo que devuelve _getCarpetaParaClan()
@param {string} endpointKey
@returns {Folder}
```


### Ubicación: `_pad2_`

#### 09B146 — líneas 4493-4506 (docblock)

```text
_buildPrefijoTSP_(ctx)
Genera el tag "T-{temporada} S-{semana} P.I-{periodIndex}" con EXACTAMENTE
el mismo padding y espaciado que usa el Generador (05_Migrador_Formato.gs
(05_Migrador_Formato.gs no pertenece a Base.md, sino a Generador.md)
de ese otro proyecto, función _mig_etiquetarCarpetaClan) — dos espacios
antes de "S-", uno antes de "P.I-". Es la IDENTIDAD real de una captura:
mismo tag = mismo periodo de guerra, sin importar cuándo se guardó.
ctx.sectionIndex es 0-based (igual que rr.sectionIndex de la API); se le
suma 1 para mostrar la semana en base 1, igual que hace el Generador con
item.sectionIndex + 1.
@param {Object} ctx - { temporada, sectionIndex, periodIndex, ... } (ver _getCtx() en 09_API_ClashRoyale.gs)
@returns {string}
```


### Ubicación: `_buildPrefijoTSP_`

#### 09B147 — líneas 4516-4524 (docblock)

```text
_horaLimaNow()
Devuelve la fecha/hora ACTUAL en formato "dd-mm-yyyy HH.mm" con hora
de Lima (America/Lima, UTC-5, sin cambio de horario de verano).
Se usa para construir nombres de archivo de cache.
NOTA: NUNCA usar new Date().toLocaleString() ni new Date().toString()
porque esas funciones devuelven la hora del servidor de Google (UTC o US),
no la hora de Perú. Siempre usar Utilities.formatDate con 'America/Lima'.
```


### Ubicación: `_horaLimaNow`

#### 09B148 — líneas 4529-4544 (docblock)

```text
_horaLimaMensaje12h(d)
FIX (11-sep-2026, pedido usuario): los mensajes de ataques pendientes
(línea "🕒 Generado: ...", ver generarTodosMensajes(), 30_Mensajes.gs)
usaban _horaLimaLog() de arriba, que da hora en formato 24 horas
("HH:mm:ss") — correcto para logs internos, pero el usuario pidió que
ese texto de cara al usuario (dentro del mensaje de WhatsApp) vaya en
formato 12 horas con AM/PM, igual que el resto de horas que se muestran
en los mensajes (ej. "Tienen hasta las 12:00 AM para completar sus
ataques"). Se crea esta función NUEVA en vez de modificar _horaLimaLog()
porque esa sigue usándose (o pudiera reusarse) para logs internos en
formato 24h — no se debe alterar su contrato. Misma zona horaria
(America/Lima) y mismo patrón de retorno (" (Lima)" al final) que
_horaLimaLog(), solo cambia el formato de la hora en sí.
@param {Date} d - fecha a formatear (opcional; si se omite usa new Date())
```


### Ubicación: `_horaLimaMensaje12h`

#### 09B149 — líneas 4549-4567 (docblock)

```text
_buildCacheFilename(ctx, endpointKey, clanName)
Genera el nombre del archivo de cache en Drive.
Formato: "{tag T-/S-/P.I-} {fecha hora} - {ClanName} - {endpointKey}.json"
  La fecha/hora es la hora REAL de Lima en el momento de guardar — es solo
  INFORMATIVA (para saber a simple vista cuándo se guardó), NUNCA se usa
  para deduplicar. El periodIndex YA NO va como sufijo "- P{n}" (formato
  anterior): ahora vive dentro del tag inicial, igual que en el Generador.
clanName es opcional: si no se pasa se usa "Sin clan".

FIX (19/07/2026, mantenido): la deduplicación nunca depende de la fecha
calendario del sistema (ambigua en la ventana 4am-5am en que el
periodIndex real cambia de un día para otro) — depende únicamente del tag
T-/S-/P.I-, construido a partir del periodIndex real de la API.
CAMBIO (20/07/2026): antes el tag terminaba en "- P{periodIndex}.json" al
final del nombre; ahora es un PREFIJO "T-.. S-.. P.I-.." al inicio, para
que el nombre de archivo sea 100% compatible con el que genera y espera
el proyecto Generador (ver _mig_etiquetarCarpetaClan en ese proyecto).
```


### Ubicación: `_normalizarPeriodIndex_`

#### 09B150 — líneas 4584-4592 (docblock)

```text
_buildCacheSuffix(endpointKey)
Sufijo INVARIANTE del nombre de archivo para el endpoint (la extensión
final, común a todos los archivos de ese endpoint dentro de su
subcarpeta). Ya NO incluye periodIndex — esa parte ahora vive en el
PREFIJO del nombre (ver _buildPrefijoTSP_); la búsqueda real de "¿ya
existe un archivo de este periodo?" combina prefijo (tag) + este sufijo.
Formato del sufijo: " - {endpointKey}.json"
```


### Ubicación: `_buildCacheSuffix`

#### 09B151 — líneas 4597-4613 (docblock)

```text
_cargarCacheDesideDrive(clanTag, endpointKey, ctxOrPeriodIndex)
Carga el JSON del cache en Drive si corresponde al periodo indicado.
Para endpoints de clan (clans/currentriverrace): busca DENTRO de la
subcarpeta de ese endpoint (ver _getSubcarpetaEndpoint_) un archivo cuyo
nombre EMPIECE con el tag T-/S-/P.I- de ese ctx y TERMINE en
"- {endpoint}.json" (ignora por completo la fecha/hora de guardado), y
verifica el clanTag dentro del JSON para garantizar que el archivo es del
clan correcto.
Para 'players' (esquema sin cambios): ctxOrPeriodIndex se ignora aquí y
se delega a _cargarPlayerDesideDrive, que resuelve por su cuenta.
@param {string} clanTag
@param {string} endpointKey
@param {Object|number} ctxOrPeriodIndex - ctx completo (ver _getCtx()) para
  endpoints de clan; para 'players' puede ser cualquier cosa, no se usa.
@returns {Object|null} Objeto JSON parseado, o null si no hay cache válido.
```


### Ubicación: `_cargarCacheDesideDrive`

#### 09B152 — líneas 4625-4631 (comentario)

```text
Buscar en la subcarpeta del clan/endpoint si ya conocemos el nombre del
clan (viene del cache en memoria de esta misma ejecución). Si todavía
no se conoce, se pasa clanName vacío igual: _getSubcarpetaEndpoint_()
(esquema NUEVO endpoint -> clan) no encuentra clave y cae sola a la
raíz del endpoint correspondiente (antes cambio 26-sep-2026 cargaba
directo la raíz JSON general porque el fallback vivía en este
llamador; ahora vive en _getSubcarpetaEndpoint_() y ya es endpoint-aware).
```


### Ubicación: `_tsLimaLog_`

#### 09B153 — líneas 4680-4694 (docblock)

```text
_temporadaDeClan_(ctx, periodIndexClan)
FIX (05-oct-2026, aprobado por el usuario, punto 1 del analisis): ctx.temporada y ctx.periodIndex
salen del PRIMER clan Terna con cache (ver _getCtx()), pero cada clan cambia de periodIndex en
momentos distintos (entre las 4 y las 5 a.m. de Lima). Dentro de una misma temporada dos clanes
difieren como maximo en 1-2 periodos; una diferencia >= 14 solo puede significar que el clan esta
en OTRA temporada (ultimo dia de la anterior vs primero de la siguiente).
Devuelve la temporada con la que hay que ETIQUETAR las filas de ESE clan:
  - periodIndexClan - ctx.periodIndex >= 14  -> ctx.temporada - 1 (el clan sigue en la anterior)
  - periodIndexClan - ctx.periodIndex <= -14 -> ctx.temporada + 1 (el clan ya paso a la siguiente)
  - en cualquier otro caso                   -> ctx.temporada
Si ctx no trae temporada/periodIndex numericos, o periodIndexClan no es un numero valido, devuelve
ctx.temporada sin cambios (nunca inventa una temporada).
@returns {number} temporada de ESE clan
```


### Ubicación: `_temporadaProbableClan_`

#### 09B154 — líneas 4716-4724 (docblock)

```text
_temporadasActivasGuerra_(ctx)
Lista (sin repetidos, ascendente) de las temporadas con las que se etiquetaran filas en esta
corrida: ctx.temporada mas la de cada clan Terna con currentriverrace valido en cache
(_temporadaDeClan_). Normalmente es UNA sola; durante el cambio de temporada pueden ser dos.
La usan la restauracion desde CSV y la purga de la hoja Guerra para no quitar (ni dejar sin
restaurar) las filas de un clan que todavia esta en la temporada anterior.
@returns {number[]}
```


### Ubicación: `_fmtDiaGuerraLog_`

#### 09B155 — líneas 4748-4759 (docblock)

```text
_lineaPeriodoClan_(origen, nombre, tag, rr, ctx, ctxClan)
Arma UNA linea de log con el periodo que reporta la API de currentriverrace para ESE clan:
  timestamp Lima | sectionIndex | periodIndex | periodType | Temporada | Semana | DiaGuerra
- sectionIndex/periodIndex/periodType: tal cual los trae la API de ese clan (no los de otro clan).
- Temporada/Semana/DiaGuerra: los que el bot USA para etiquetar las filas de ese clan (ctxClan si se
  pasa; si no, se calculan con ctx). DiaGuerra es el dia al que se adjudican los ataques, no la
  fecha real de la corrida.
- Si el periodIndex del clan difiere del de referencia (ctx) se avisa con el delta, y si la
  diferencia indica OTRA temporada se muestra la temporada probable del clan (solo informativo).
Solo lectura: no modifica ningun estado.
```


### Ubicación: `_lineaPeriodoClan_`

#### 09B156 — líneas 4802-4817 (docblock)

```text
_ctxPorClanDesdeDatos_(ctx, endpointKey, datos)
FIX (1-oct-2026, pregunta 52 del consolidado, aprobado por el usuario):
devuelve el ctx que se usa para NOMBRAR el JSON de un clan. Solo para
'currentriverrace': copia el ctx recibido y le pone el periodIndex y el
sectionIndex del CONTENIDO de ese clan (datos.periodIndex /
datos.sectionIndex). Si el JSON no trae un periodIndex valido, o el
endpoint es otro (por ejemplo 'clans', que no lo trae), devuelve el ctx
original sin cambios. No modifica el objeto recibido.
sectionIndex es 0-based, igual que en _getCtx(); si falta en el JSON se
calcula con periodIdxToSectionIndex().
@param {Object} ctx
@param {string} endpointKey
@param {Object} datos - JSON de la API de ese clan.
@returns {Object}
```


### Ubicación: `_ctxPorClanDesdeDatos_`

#### 09B157 — líneas 4841-4867 (docblock)

```text
_guardarCacheEnDrive(clanTag, endpointKey, ctxOrPeriodIndex, datos)
Persiste el JSON en Drive, DENTRO de la subcarpeta del endpoint (ver
_getSubcarpetaEndpoint_), con nombre:
  "{tag T-/S-/P.I-} {fecha hora} - {ClanName} - {endpoint}.json"
- Si ya existe un archivo con ese MISMO tag (mismo periodo real, sin
  importar la fecha/hora que tenga en el nombre) → se ACTUALIZA ese mismo
  archivo (se renombra para reflejar la hora nueva y se sobreescribe el
  contenido). NUNCA se crea un archivo adicional para el mismo periodo.
- Si existe un archivo de un periodo anterior, NUNCA se borra: se
  conserva como histórico. Solo se crea un archivo nuevo cuando cambia
  el periodo (temporada/semana/periodIndex).

CAMBIO (20/07/2026): antes se guardaba suelto en la carpeta del clan y el
tag de periodo era un sufijo "- P{periodIndex}.json"; ahora se guarda en
la subcarpeta del endpoint (CurrentRiverRace/Clans) y el tag es un
PREFIJO "T-.. S-.. P.I-..", exactamente el mismo formato que usa el
proyecto Generador — así los archivos que crea Base desde ahora son
indistinguibles de los que ya organiza/renombra el Generador, y ambos
proyectos pueden convivir sobre la misma estructura de carpetas sin
duplicar ni pisarse.
@param {string} clanTag
@param {string} endpointKey
@param {Object|number} ctxOrPeriodIndex - ctx completo (ver _getCtx()) para
  endpoints de clan; para 'players' se pasa el periodIndex plano, sin cambios.
@param {Object} datos
```


### Ubicación: `_guardarCacheEnDrive`

#### 09B158 — líneas 4875-4878 (comentario)

```text
FIX (1-oct-2026, pregunta 52): para currentriverrace el nombre del archivo
usa el periodIndex/sectionIndex del contenido de ESTE clan, no los del
primer clan Terna con cache (ver _ctxPorClanDesdeDatos_() y el aviso de
la pregunta 52 al inicio de este archivo).
```

#### 09B159 — líneas 4939-4956 (docblock)

```text
_apiGetCached(clanTag, endpointKey, pathFn, ctx)
Versión cacheada de _apiGet().

ESTRATEGIA: siempre consulta la API y actualiza el respaldo en Drive.
El cache en Drive es un respaldo de último recurso, no una fuente primaria.

Flujo:
  1. Memoria de sesión → retorna directo (ya fue llamado en este mismo run)
  2. API → guarda/sobreescribe en Drive y memoria, retorna resultado
  3. Si la API falla → intenta Drive como fallback de emergencia

@param {string}   clanTag     - Tag del clan (con #)
@param {string}   endpointKey - Clave identificadora del endpoint
@param {Function} pathFn      - Función que genera el path dado el tag
@param {Object}   ctx         - Contexto de periodo (ver _getCtx()): { temporada, sectionIndex, periodIndex, ... }, usado para construir el tag T-/S-/P.I- de deduplicación
@returns {Object|null}
```


### Ubicación: `_apiGetCached`

#### 09B160 — líneas 4988-5000 (docblock)

```text
_buildPlayerFilename(playerTag, clanName)
Construye el nombre de archivo para un player en la carpeta PLAYERS.
Formato: "dd-mm-yyyy HH.mm - {ClanName} - {playerTag}.json"
La fecha/hora es la hora REAL actual de Lima en el momento de guardar
(puramente informativa). Si no hay clan, se usa "Sin clan".

CAMBIO (Fase 18 del plan de cambios): ya NO incluye "- P{periodIndex}"
en el nombre. Decisión confirmada: un solo JSON vigente por cuenta,
siempre sobreescrito, sin guardar histórico por periodo/temporada.
@param {string} playerTag   - Tag del jugador (ej. "#2GG8PJ8GC")
@param {string} clanName    - Nombre del clan (opcional)
```


### Ubicación: `_buildPlayerFilename`

#### 09B161 — líneas 5007-5016 (docblock)

```text
FASE 9bis (17-sep-2026, limpieza de código muerto, pedido del usuario):
se borró _getPlayersDriveIndex(folder, periodIndex) -- el índice histórico
por periodo, ya sin llamador real desde que _guardarPlayerEnDrive() dejó
de segmentar por periodo (Fase 18, un solo JSON vigente por cuenta).
Confirmado con un grep de todo el proyecto que no le quedaba ninguna
referencia real (ni siquiera como código muerto invocado indirectamente),
solo su propia definición. El reemplazo vigente es
_getPlayersDriveIndexPorTag(), justo abajo, que no filtra por periodo.
```

#### 09B162 — líneas 5018-5034 (docblock)

```text
_getPlayersDriveIndexPorTag(folder)
Fase 18 del plan de cambios: índice de la carpeta Players que ya NO
filtra por periodo — mapea CUALQUIER archivo existente de un jugador
(nombre nuevo sin periodo, o restos del formato antiguo "- P{n}.json")
a su tag, para poder encontrar "el" archivo vigente de esa cuenta sin
importar cuándo se guardó por última vez. Memoizado para el resto de la
ejecución (mismo patrón de memoización explicado en el bloque de
comentarios junto a la declaración de _PLAYERS_DRIVE_INDEX_POR_TAG, más
arriba).

Si un tag tuviera MÁS DE UN archivo (típicamente restos del esquema
anterior, uno por periodo), se queda con el nombrado más reciente
(comparación lexicográfica, ya que la fecha/hora va primero en el
nombre) y dejará los demás archivos de ese tag sin tocar — no se borran
automáticamente aquí (ver nota de limpieza manual en la Fase 18).
```


### Ubicación: `_getPlayersDriveIndexPorTag`

#### 09B163 — líneas 5058-5080 (docblock)

```text
_guardarPlayerEnDrive(playerTag, periodIndex, datos)
Persiste el JSON de un jugador en la carpeta PLAYERS.
Reglas (Fase 18 del plan de cambios — decisión confirmada: un solo JSON
vigente por cuenta, SIN histórico por periodo/temporada):
  - Nombre del archivo: "dd-mm-yyyy HH.mm - {ClanName} - {playerTag}.json"
    (fecha/hora REAL de Lima al momento de guardar; puramente informativa).
  - BUSCA si ya existe CUALQUIER archivo de ese tag, sea cual sea el
    periodo en que se guardó: si existe, lo sobreescribe (actualiza
    nombre y contenido). Si no existe → crea uno nuevo.
  - Los archivos de periodos anteriores que ya existían ANTES de esta
    fase no se eliminan automáticamente al implementarla (ver nota de
    limpieza manual en el plan de cambios); simplemente deja de crearse
    uno nuevo por periodo a partir de ahora.
  - Dentro del JSON se inyectan _fecha y _clan para trazabilidad.

@param {string} playerTag   - Tag del jugador (ej. "#2GG8PJ8GC")
@param {number} periodIndex - periodIndex real del periodo de guerra actual
  (ya NO se usa para el nombre de archivo ni para buscar el existente;
  se conserva en la firma y en el memKey en memoria solo para no romper
  a quien la llama, y porque sigue siendo útil como dato de trazabilidad).
@param {Object} datos       - Respuesta de /players/{tag}
```


### Ubicación: `_guardarPlayerEnDrive`

#### 09B164 — líneas 5084-5086 (comentario)

```text
Hora actual de Lima (para nombre de archivo y trazabilidad)
NUNCA usar d.getDate() directo: devuelve hora del servidor Google (UTC),
no la hora de Perú. Siempre usar Utilities.formatDate con 'America/Lima'.
```

#### 09B165 — líneas 5116-5119 (comentario)

```text
Sin log individual por jugador a propósito: con ~150-200 jugadores por
corrida, esa línea por línea inflaba el registro de ejecución sin
aportar nada que _fetchPlayersData() (09_API_ClashRoyale.gs) no resuma
mejor al final (total obtenido + lista de tags con error, si hubo).
```

#### 09B166 — líneas 5130-5137 (docblock)

```text
_cargarPlayerDesideDrive(playerTag)
Carga el JSON de un jugador desde la carpeta PLAYERS buscando por tag en el nombre.
Busca el archivo más reciente que termine en "- {playerTag}.json" (de cualquier fecha).
No filtra por fecha: devuelve el último archivo guardado para ese tag.
@param {string} playerTag
@returns {Object|null}
```


### Ubicación: `_cargarPlayerDesideDrive`

#### 09B167 — líneas 5150-5152 (comentario)

```text
Buscar todos los archivos del tag (en cualquiera de los dos formatos)
y quedarse con el más reciente (nombre lexicográficamente mayor =
fecha+hora más reciente, ya que esa parte siempre va primero).
```

#### 09B168 — líneas 5180-5184 (docblock)

```text
_apiGetPlayerCached(playerTag, periodIndex)
Versión cacheada de _apiGet() para el endpoint /players/{tag}.
Cache por playerTag + periodIndex.
```


### Ubicación: `_apiGetPlayerCached`

#### 09B169 — líneas 5199-5206 (docblock)

```text
_fetchAllClanDataCached()
Versión del fetch principal que usa el cache de Drive.
Llamar desde 03_ApiService o 09_Main en lugar de _fetchAllClanData()
cuando se quiera garantizar una sola llamada por endpoint por día.

Rellena CACHE_CLAN_DATA con la misma estructura que _fetchAllClanData().
```


### Ubicación: `_fetchPlayersCached`

#### 09B170 — líneas 5276-5299 (comentario)

```text
=============================================================================
LOG ACUMULATIVO DEL SCRIPT TERNA
_registrarLogScriptTerna(funcion, descripcion, advertencias)

Guarda un registro acumulativo en "Log_ScriptTerna.json" dentro de la
carpeta "Otros" (DRIVE_FOLDER_ID_OTROS) — antes iba suelto directo en
"JSON"; ver AVISOS ABIERTOS / FASE B más arriba en este mismo archivo.
Cada entrada incluye:
  - fecha: hora de Lima al momento de la operación
  - autor: "Claude (Anthropic)"
  - funcion: qué función generó el cambio
  - descripcion: texto libre con el detalle de la operación
  - advertencias: array de mensajes de error/alerta (puede estar vacío)

REGLAS:
  - NUNCA borra entradas anteriores; solo añade (bitácora acumulativa).
  - Si el archivo no existe, lo crea con un array de un elemento.
  - Si hay un error al leer/escribir, lo loguea en el Logger sin lanzar excepción.

INSTRUCCIÓN DE HORA (crítico — leer antes de editar):
  La hora SIEMPRE se genera con:
    Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy HH:mm:ss')
  NUNCA usar new Date().toLocaleString() (devuelve hora del servidor Google).
=============================================================================
```

#### 09B171 — líneas 5301-5308 (docblock)

```text
_registrarLogScriptTerna(funcion, descripcion, advertencias)
Añade una entrada al Log_ScriptTerna.json en la carpeta DRIVE_FOLDER_ID_OTROS.
Acumulativo: nunca borra. Si el archivo no existe, lo crea.
@param {string}   funcion      - Nombre de la función que generó el cambio
@param {string}   descripcion  - Descripción del cambio
@param {string[]} advertencias - Array de advertencias/errores (puede estar vacío)
```


---


# Archivo 10_ClanSheet.gs

Hoja Clan: resumen agregado por clan (`updateClanSheet()`, mapa de columnas `CC`, `_getMinGClanMaps()`, formato condicional). Los IDs de bloque llevan prefijo `10`. Nota: algunos bloques estaban DENTRO del objeto `CC` (comentarios de columnas nuevas); se movieron igual y en el código queda su referencia.


## Índice de bloques movidos

| ID | Líneas orig. | Ubicación | Resumen |
|---|---|---|---|
| 10B001 | 8-11 | `Cabecera del archivo` | 10_ClanSheet.gs |
| 10B002 | 13-33 | `Cabecera del archivo` | Índices de columna en la hoja Clan (1-based) |
| 10B003 | 38-59 | `CC` | NUEVO (16-sep-2026, pedido del usuario -- "hay imágenes de clan, |
| 10B004 | 123-129 | `updateClanSheet` | NUEVO (16-sep-2026, pedido del usuario -- ver docblock de CC.BADGE_ID, |
| 10B005 | 136-138 | `updateClanSheet` | ENLACES con makeLink (texto enriquecido - NUNCA HYPERLINK()) |
| 10B006 | 142-145 | `updateClanSheet` | FIX (12-ago-2026): 'Analytics' y 'CSV' — dos enlaces más al historial |
| 10B007 | 167-175 | `updateClanSheet` | Render (players): texto = nombre del líder, URL = API /players del líder |
| 10B008 | 192-194 | `updateClanSheet` | Persistir el estado actual de la hoja (incluye Min_G manual) en el |
| 10B009 | 202-245 | `updateClanSheet` | _getMinGClanMaps() |
| 10B010 | 249-253 | `_getMinGClanMaps` | Fuente única: par vigente de CR_Lista (Extra!Descenso_Vigente_ID). Se |

---

## Detalle (texto original, sin cambios)

Cada bloque se copió tal cual estaba en el `.gs` (sin los `//`). Los números de línea son los del archivo ANTES de la limpieza.


### Ubicación: `Cabecera del archivo`

#### 10B001 — líneas 8-11 (comentario)

```text
=============================================================================
10_ClanSheet.gs
Actualización de la hoja Clan con datos de cada clan desde el cache.
=============================================================================
```

#### 10B002 — líneas 13-33 (comentario)

```text
Índices de columna en la hoja Clan (1-based)
Min_T ELIMINADA (08/08/2026): vivía a la derecha de Min_G (columna 7)
desde el 23/07/2026. Hoy Min_T se define POR CLAN en T_Lista/S_Lista (fila
más reciente de cada clan), no en esta hoja — ver _getMinTPorNombreClan()
(27_Torneos_Sorteos_Requisitos.gs) y _getConfigMasRecienteCategoria()
(26_Torneos_Core.gs).
Min_G ELIMINADA (11/08/2026, pedido del usuario, FASE 27): ya NO vive en
esta hoja — hoy sale de CR_Lista (par de Descenso vigente, ver
Extra!Descenso_Vigente_ID). Ver _getMinGClanMaps() más abajo, que lee de
ahí, y la migración inversa en _setupClan() (02_Setup_Hojas.gs) que borra físicamente
esta columna si todavía existe de una hoja creada antes de este cambio.
FIX (12-ago-2026): se agregan 'Analytics' y 'CSV' a la derecha de
RoyaleApi (pedido explícito del usuario) — dos enlaces más al historial
de guerra del clan en RoyaleAPI:
  Analytics: https://royaleapi.com/clan/{TAG}/war/analytics
  CSV:       https://royaleapi.com/clan/{TAG}/war/analytics/csv
Como el resto de columnas de esta hoja se referencian SIEMPRE vía CC.*
(nunca con números de columna sueltos), insertarlas acá y correr
CW_STATS..CONDICION dos posiciones a la derecha propaga solas a todo el
resto del proyecto (updateClanSheet(), _setupClan(), syncClanCSV(),
_obtenerInfoClanCompleta(), el bot de WhatsApp, etc.) sin tocar nada más.
```


### Ubicación: `CC`

#### 10B003 — líneas 38-59 (comentario)

```text
NUEVO (16-sep-2026, pedido del usuario -- "hay imágenes de clan,
busqué en clans/currentriverrace pero solo dan 'badgeId', no un link
[...] el sistema lo debería enviar cuando consulta el endpoint clans
o currentriverrace, ya que se podría cambiar el ícono desde el
juego"): BADGE_ID guarda el `badgeId` NUMÉRICO crudo tal cual lo
devuelve /clans/{tag} de Supercell (ver info.badgeId en
updateClanSheet(), justo abajo) -- nunca se resuelve a un nombre de
ícono acá (eso es trabajo 100% del frontend, ver
iconoBadgeClanHtml()/BADGE_NOMBRES_POR_ID en common.js, que ya estaba
listo esperando este campo). Se inserta ACÁ (posición 14, a la
izquierda de RoyaleApi) siguiendo el mismo criterio ya usado para
Analytics/CSV (ver comentario de más arriba, junto a la migración de
_setupClan() en 02_Setup_Hojas.gs): como el resto de columnas de esta
hoja se referencian SIEMPRE vía CC.* (nunca con números de columna
sueltos), insertarla acá y correr RoyaleApi..Condición una posición a
la derecha propaga solo con este cambio a todo el resto del proyecto
(updateClanSheet(), _setupClan(), syncClanCSV(), _webClanInfoCalcular(),
el bot de WhatsApp, etc.) sin tocar nada más -- en particular,
CC.CONDICION (que varios lugares usan como el total de columnas de la
hoja, ej. syncClanCSV()/_webClanInfoCalcular()) pasa de 23 a 24
automáticamente, sin que ninguno de esos sitios necesite cambiar una
sola línea.
```


### Ubicación: `updateClanSheet`

#### 10B004 — líneas 123-129 (comentario)

```text
NUEVO (16-sep-2026, pedido del usuario -- ver docblock de CC.BADGE_ID,
justo arriba): `badgeId` viene tal cual en la respuesta de
/clans/{tag} (info, el mismo objeto que ya alimenta Nombre/Trofeos/
Descripción/etc. un poco más arriba) -- se guarda CRUDO, sin
resolverlo a nombre de ícono (eso lo hace common.js en el momento,
por si Supercell agrega un badge nuevo o el jugador cambia el ícono
del clan -- así nunca queda una hoja con un ícono "congelado").
```

#### 10B005 — líneas 136-138 (comentario)

```text
-------------------------------------------------------------------------
ENLACES con makeLink (texto enriquecido - NUNCA HYPERLINK())
-------------------------------------------------------------------------
```

#### 10B006 — líneas 142-145 (comentario)

```text
FIX (12-ago-2026): 'Analytics' y 'CSV' — dos enlaces más al historial
de guerra del clan en RoyaleAPI, a la derecha de RoyaleApi (pedido
explícito del usuario). Mismo texto a mostrar ('Link') que el resto
de enlaces de esta hoja, mismo patrón makeLink().
```

#### 10B007 — líneas 167-175 (comentario)

```text
Render (players): texto = nombre del líder, URL = API /players del líder

FASE 9 (Lista_de_cambios.md) — causa raíz real de "%2523" en vez de
"%23" (corregido 18/07/2026): NO era una doble codificación dinámica
vía encodeTag() como se sospechaba originalmente — era este "%2523"
escrito a mano, literal, justo acá. Los otros 3 enlaces de esta misma
hoja (RENDER_CLANS/MEMBERS/RIVERRACE, arriba) sí usaban "%23"
correctamente. Ver corregirLinksEndpointsDobleCodificados() (05_Backup_CSV.gs)
para reparar los enlaces que ya quedaron grabados mal antes de este fix.
```

#### 10B008 — líneas 192-194 (comentario)

```text
Persistir el estado actual de la hoja (incluye Min_G manual) en el
CSV de respaldo, para que un valor ingresado a mano en Sheets
sobreviva a una reconstrucción futura de la hoja.
```

#### 10B009 — líneas 202-245 (docblock)

```text
_getMinGClanMaps()
FASE 27 (11/08/2026): Min_G ya NO vive en la hoja Clan — hoy se define POR
CLAN en CR_Lista (fila de Descenso del par vigente). En su momento la
FASE 27 la había movido a T_Requisitos/Descensos; ver MIGRACIÓN y BAJA
DEFINITIVA más abajo.

MIGRACIÓN (13-sep-2026, pedido del usuario -- precursor de la Fase 9 de
limpieza de T_Requisitos): la fuente pasó a ser CR_Lista, vía el par
vigente guardado en Extra!Descenso_Vigente_ID
(_getIdVigenteExtraCR('Descenso'), 26_Torneos_Core.gs) -- ese ID lo
escribe solo _autogenerarParCRListaSiCorrespondeInicioTemporada() cada
inicio de temporada, o un admin a mano si hace falta apuntar a otro par.
_getMinGClanMaps() corre desde procesos de fondo sin contexto de UI
(Guerra_Logs, Control), por eso necesita este automatismo -- a
diferencia de _getFilaCRListaPorId(id), que para la pantalla web de
propuestas exige `id` siempre sin automatismo alguno (confirmado por el
usuario, ver docblock de esa función).

BAJA DEFINITIVA (14-sep-2026, pedido del usuario -- Fase 9 completa): se
quita el respaldo a T_Requisitos/Descensos. Validado en producción que
Extra!Descenso_Vigente_ID siempre está poblado (el usuario ya dio de baja
la hoja T_Requisitos a mano). Si el par vigente no existe o no matchea
ninguna fila real de CR_Lista, ya NO se cae a T_Requisitos -- el clan
queda simplemente sin entrada en `byNombre`/`byTag` (el llamador aplica
su propio criterio por defecto para "sin Min_G configurado", igual que ya
hacía antes para un clan sin fila).

Cualquier código que necesite Min_G debe pasar SIEMPRE por esta función
— nunca leer Clan!F directamente ni con una fórmula de hoja (ver
_buildMinGSwitchFormula(), 22_ControlCalendario.gs, para el caso de
fórmulas de formato condicional).

Devuelve los valores de Min_G indexados de dos formas: por ClanTag
(usado en Guerra_Logs) y por Nombre de clan (usado en Control, donde la
columna "Clan" de la cuadrícula fija guarda el nombre, no el tag). Si un
clan no tiene requisito de Min_G configurado (cantidad vacía/en 0 en
CR_Lista), se usa CFG.MIN_G_DEFAULT como respaldo final (mismo criterio
que ya usaba la celda vacía de la hoja Clan).

El cruce ClanTag<->Nombre sigue viviendo en la hoja Clan (columnas
CC.CLAN_TAG / CC.NOMBRE, que NO se tocaron con ninguna de las dos
migraciones — solo se quitó Min_G).
```


### Ubicación: `_getMinGClanMaps`

#### 10B010 — líneas 249-253 (comentario)

```text
Fuente única: par vigente de CR_Lista (Extra!Descenso_Vigente_ID). Se
ignora si el requisito está "activo" o no -- Min_G es siempre un
umbral vigente para el clan, se lea o no como "requisito activo". Solo
se usa la CANTIDAD, con CFG.MIN_G_DEFAULT como respaldo si está vacía
o en 0.
```


---


# Archivo 11_DirectorioSheet.gs

Hoja Directorio (modelo de 60 columnas en memoria `DC` vs. layout físico `IC`/`DIR_SHEET_COLS`): `updateDirectorioSheet()`, `_construirFilasDirectorio()`, `_escribirDirectorio()`, `_leerHojaComoMapaPorTag()` y relacionados. Los IDs de bloque llevan prefijo `11`.


## Índice de bloques movidos

| ID | Líneas orig. | Ubicación | Resumen |
|---|---|---|---|
| 11B001 | 10-41 | `Cabecera del archivo` | CONCEPTO CLAVE - CAMPO JUGADOR (columna 4 en Directorio y en Inactivos — |
| 11B002 | 64-83 | `DIR_TOTAL_COLS` | DIR_SHEET_COLS (13/07/2026, Fase 4): ancho REAL de la hoja Directorio en |
| 11B003 | 86-138 | `DIR_SHEET_COLS` | Índices de columna (1-based) de la hoja "Administradores" — ver |
| 11B004 | 148-178 | `ADMINISTRADORES_TOTAL_COLS` | Índices de columna (1-based) de la hoja "Vetados" — ver _setupVetados() en |
| 11B005 | 186-189 | `VETADOS_TOTAL_COLS` | Columnas que SÍ se recalculan automáticamente desde Directorio/Inactivos |
| 11B006 | 192-208 | `VETADOS_COLS_AUTOSYNC` | Índices de columna (1-based) de la hoja "Comentarios" — ver |
| 11B007 | 232-240 | `updateDirectorioSheet` | El bootstrap de reanudación (_ejecutarPorTandas en 00_Main.gs) solo |
| 11B008 | 246-253 | `updateDirectorioSheet` | FASE B4 (16/07/2026): Nivel/Nivel2/V_Guerra/Copas y los 17 campos que |
| 11B009 | 257-261 | `updateDirectorioSheet` | Mapa completo de índices 0-based para todas las columnas leídas desde |
| 11B010 | 278-281 | `updateDirectorioSheet` | Cat_disp: Directorio nunca tuvo esta columna físicamente (no está en |
| 11B011 | 302-308 | `updateDirectorioSheet` | Snapshot de Inactivos (29 columnas propias, incluye Comentario, + 31 |
| 11B012 | 315-318 | `updateDirectorioSheet` | FASE B3 (16/07/2026): poblar Players y Links con el mismo modelo de 60 |
| 11B013 | 326-336 | `updateDirectorioSheet` | FIX (04-ago-2026): "hay filas vacías que están conservando la validación |
| 11B014 | 339-358 | `updateDirectorioSheet` | FIX (17-ago-2026, pedido usuario): recrear el filtro nativo (embudo) de |
| 11B015 | 361-370 | `updateDirectorioSheet` | Poblar Inactivos con TODOS los inactivos (admin y no-admin), fila completa |
| 11B016 | 373-382 | `updateDirectorioSheet` | Reactivación: retirar de Inactivos (hoja + ClanSystem_Backup_ |
| 11B017 | 388-392 | `updateDirectorioSheet` | NOTA: updateVistasDerivadas() ya NO se llama aquí. Se llama como su |
| 11B018 | 400-409 | `updateVistasDerivadas` | FASE B1 (14/07/2026): antes, esta lectura pedía DIR_TOTAL_COLS (60 |
| 11B019 | 415-418 | `updateVistasDerivadas` | IMPORTANTE: debe ir DESPUÉS de _updateHistorial (por consistencia de |
| 11B020 | 422-436 | `updateVistasDerivadas` | sincronizarAdministradores() |
| 11B021 | 437-457 | `updateVistasDerivadas` | sincronizarAdministradores() |
| 11B022 | 459-475 | `updateVistasDerivadas` | _generarClaveAdmin() |
| 11B023 | 494-504 | `sincronizarAdministradores` | FIX (16/07/2026): antes se leía la hoja física Directorio en crudo |
| 11B024 | 508-525 | `sincronizarAdministradores` | Cat_disp (12/07/2026): columna de edición MANUAL que ahora vive SOLO en |
| 11B025 | 528-534 | `sincronizarAdministradores` | FASE 4 — WEB (arquitectura-web-familia-terna.md, Sección 7.3.2, v9): |
| 11B026 | 536-543 | `sincronizarAdministradores` | Clave: nombre canónico interno → valor: primera Clave no vacía |
| 11B027 | 545-551 | `sincronizarAdministradores` | NUEVO (15-sep-2026, pedido del usuario, hallazgo B-31): mismo criterio |
| 11B028 | 568-571 | `sincronizarAdministradores` | NUEVO (15-sep-2026): mismo criterio que clavePrevia, columna |
| 11B029 | 579-615 | `sincronizarAdministradores` | FIX (30-ago-2026, reportado por el usuario: "si demuelo y ejecuto |
| 11B030 | 623-628 | `sincronizarAdministradores` | NUEVO (15-sep-2026): mismo respaldo para Clave_Hash, mismo |
| 11B031 | 650-656 | `sincronizarAdministradores` | Paso 2: Recopilar TODAS las filas (ya reconstruidas a formato DC de 60 |
| 11B032 | 670-677 | `sincronizarAdministradores` | FIX (06-ago-2026): Nom_Multi/Celular a veces solo se cargó en UNA de |
| 11B033 | 691-694 | `sincronizarAdministradores` | Clave de agrupación: Nom_Multi (propio o heredado del grupo por |
| 11B034 | 736-738 | `sincronizarAdministradores` | FASE 4 (25-ago-2026): Funciones es de edición MANUAL exclusiva |
| 11B035 | 740-747 | `sincronizarAdministradores` | FASE 4 — WEB (Sección 7.3.2, v9): Clanes_Admin ya NO se recalcula |
| 11B036 | 752-765 | `sincronizarAdministradores` | FASE 5 (26-ago-2026, pedido explícito del usuario): Clave se |
| 11B037 | 773-782 | `sincronizarAdministradores` | NUEVO (15-sep-2026): Clave_Hash NUNCA se genera acá -- a propósito, |
| 11B038 | 788-791 | `sincronizarAdministradores` | FIX (05-ago-2026): mismo criterio que _escribirDirectorio() — resetear |
| 11B039 | 802-805 | `sincronizarAdministradores` | Mismos formatos que Directorio, solo para los campos que sobreviven en |
| 11B040 | 815-818 | `sincronizarAdministradores` | FIX (06-ago-2026): anchos fijos pedidos por el usuario para Clanes_Admin |
| 11B041 | 828-834 | `sincronizarAdministradores` | FASE 4 — WEB (arquitectura-web-familia-terna.md, Sección 7.5.1): el |
| 11B042 | 842-868 | `sincronizarAdministradores` | actualizarDropdownCatDisp() |
| 11B043 | 890-894 | `actualizarDropdownCatDisp` | FASE 4 — WEB (Sección 7.3.1): funciones disponibles del panel web hoy. |
| 11B044 | 906-910 | `moverComentarioFila` | NOTA (26-ago-2026): el encabezado de la columna 5 de Comentarios es |
| 11B045 | 927-984 | `moverComentarioFila` | limpiarLinksAccidentalesDeNombres() |
| 11B046 | 1066-1083 | `_getCsvDirMap` | FIX (13-ago-2026, pedido del usuario: "está escribiendo valores |
| 11B047 | 1102-1105 | `_getCsvDirMap` | Prefijo y Celular: siempre limpios (solo dígitos). El CSV puede |
| 11B048 | 1108-1110 | `_getCsvDirMap` | wsp_g y etiqueta: filtrar 'Link' (texto de RichText que puede haber |
| 11B049 | 1132-1135 | `_getCsvDirMap` | Vigencia y Fecha_lim: antes NO se leían acá — se perdían al |
| 11B050 | 1147-1152 | `_getCsvDirMap` | Admin y Cat_disp: columnas de edición manual. Antes NO se leían |
| 11B051 | 1161-1166 | `_getCsvDirMap` | --- Campos que SOLO vienen de /players (ver _construirFila) --- |
| 11B052 | 1191-1200 | `_getCsvDirMap` | (25-sep-2026, FASE B) ClanSystem_Backup_Celulares.json se lee ahora desde |
| 11B053 | 1210-1216 | `_getCsvDirMap` | IMPORTANTE: el JSON de celulares solo guarda Tag/Prefijo/Celular/WSP_G/ |
| 11B054 | 1218-1221 | `_getCsvDirMap` | Validar cada campo del JSON antes de aceptarlo: |
| 11B055 | 1233-1247 | `_getCsvDirMap` | FIX (17-ago-2026, pedido usuario: "sigue trayendo valores numéricos |
| 11B056 | 1258-1260 | `_detectarMulticuentas` | colIdxMap contiene índices 0-based para columnas leídas desde encabezados: |
| 11B057 | 1265-1280 | `_detectarMulticuentas` | FIX (07-ago-2026): la agrupación por Celular solo consideraba tags |
| 11B058 | 1342-1347 | `_construirFilasDirectorio` | Cuentas ocultas manualmente (ver CFG.TAGS_OCULTOS en 01_Config_Global.gs): se |
| 11B059 | 1358-1361 | `_construirFilasDirectorio` | F2 (29-sep-2026, pedido de la usuaria): inicio de la permanencia actual de cada Tag segun las |
| 11B060 | 1370-1376 | `_construirFilasDirectorio` | Activos en el clan Vetado (CFG.VETADO_TAG) que NO son administradores: |
| 11B061 | 1386-1391 | `_construirFilasDirectorio` | tagsReactivados: tags que estaban en Inactivos (sin datos "en vivo" ni |
| 11B062 | 1398-1404 | `_construirFilasDirectorio` | FASE B4 (16/07/2026): Nivel/Nivel2/V_Guerra/Copas y los 17 campos de |
| 11B063 | 1406-1415 | `_construirFilasDirectorio` | FIX (05-ago-2026): flag que indica si existingParaFila viene en |
| 11B064 | 1417-1421 | `_construirFilasDirectorio` | Reactivación: si la cuenta no tiene datos "en vivo" ni en Directorio |
| 11B065 | 1459-1480 | `_construirFilasDirectorio` | CAMBIO CRÍTICO (8/7/2026): Filtro de inactivos por Admin |
| 11B066 | 1553-1567 | `_construirFilasDirectorio` | _resolverFechaIngF2(tag, fechaIng, datoRacha) // datoRacha = {fecha:Date, corte:boolean} |
| 11B067 | 1584-1603 | `_resolverFechaIngF2` | _inicioRachaDesdeFilasGuerra_(filas) |
| 11B068 | 1641-1646 | `_inicioRachaDesdeFilasGuerra_` | _calcularInicioRachaGuerraPorTag(ss) |
| 11B069 | 1687-1704 | `_construirFila` | FIX (05-ago-2026): `existing` puede venir en DOS formatos distintos: |
| 11B070 | 1721-1725 | `_construirFila` | FASE B4 (16/07/2026): Nivel/V_Guerra/Nivel2 y la detección de |
| 11B071 | 1730-1733 | `_construirFila` | V_Guerra: prioridad: 1) Players (existente), 2) CSV, 3) API players (si activa) |
| 11B072 | 1758-1766 | `_construirFila` | --- Campos que SOLO vienen de /players --- |
| 11B073 | 1796-1801 | `_construirFila` | esAdminTag: mismo criterio (existing primero, CSV como respaldo) que se |
| 11B074 | 1815-1818 | `_construirFila` | --- Sobreescribir con datos frescos de /players SOLO cuando vienen |
| 11B075 | 1868-1871 | `_construirFila` | Iniciales = Sí si el nombre empieza con el prefijo de clan. |
| 11B076 | 1904-1916 | `_construirFila` | FIX (13-ago-2026, pedido del usuario): "está escribiendo valores |
| 11B077 | 1919-1921 | `_construirFila` | Razón: solo se acepta si es una de las razones reconocidas. 'Sí'/'No' |
| 11B078 | 1935-1945 | `_construirFila` | Admin/Cat_disp: si no hubo "existing" (ej. justo después de demolerTodoElSpreadsheet(), |
| 11B079 | 1951-1955 | `_construirFila` | IMPORTANTE: prioridad = 1) valor ya en la hoja (existing, incluye ediciones |
| 11B080 | 1971-1973 | `_construirFila` | RED DE SEGURIDAD — Celular (ver CELULARES_RESPALDO_MANUAL_ más arriba |
| 11B081 | 1979-2012 | `_construirFila` | RED DE SEGURIDAD — Vetado (pedido explícito del usuario: "el código no |
| 11B082 | 2026-2028 | `_construirFila` | IMPORTANTE: si no hay fecha de ingreso registrada, NO asignar now. |
| 11B083 | 2035-2037 | `_construirFila` | F2 (29-sep-2026): completar Fecha_ing si esta vacia y corregirla con el inicio de la |
| 11B084 | 2040-2042 | `_construirFila` | Fecha_Lim = plazo para ponerse las iniciales del clan. Si el jugador YA |
| 11B085 | 2064-2068 | `_construirFila` | IMPORTANTE: se guardan como NÚMERO (no string). El formato visual con |
| 11B086 | 2082-2084 | `_construirFila` | Préstamo: columna de edición MANUAL. Indica a quién se prestó esta cuenta. |
| 11B087 | 2092-2106 | `_construirFila` | PRESERVACIÓN DE LINKS Y DATOS EXISTENTES (bloque inerte desde la Fase B3) |
| 11B088 | 2127-2143 | `_construirFila` | _calcJugador |
| 11B089 | 2185-2199 | `_escribirDirectorio` | FIX (05-ago-2026): "letras blancas en cuentas no vetadas". clearContent() |
| 11B090 | 2207-2217 | `_escribirDirectorio` | FIX (pedido usuario — tag #VJV0QGPJG, nombre "67" aparecía vacío en |
| 11B091 | 2223-2241 | `_escribirDirectorio` | IMPORTANTE (rendimiento): a diferencia de la versión anterior, los |
| 11B092 | 2245-2253 | `_escribirDirectorio` | --- Formatos numéricos/fecha: una sola llamada por columna para TODO |
| 11B093 | 2256-2259 | `_escribirDirectorio` | FIX (28-sep-2026, pedido del usuario): Fecha_ing debe MOSTRAR tambien la hora. El valor ya se |
| 11B094 | 2263-2265 | `_escribirDirectorio` | Celdas Vigencia/Fecha_ing/Fecha_lim que NO traen una fecha válida |
| 11B095 | 2267-2277 | `_escribirDirectorio` | TODAS las columnas numéricas de la hoja (formato visual #,##0 con |
| 11B096 | 2283-2294 | `_escribirDirectorio` | FASE B2: la generación y escritura de los 6 enlaces (WSP, RoyaleAPI, |
| 11B097 | 2296-2305 | `_escribirDirectorio` | FIX (02-ago-2026): recién escrito el Nombre real de la cuenta (viene de |
| 11B098 | 2326-2337 | `_aplicarDropdownsDirectorio` | _limpiarValidacionesFilasVaciasDirectorio(sh, numFilas) |
| 11B099 | 2350-2355 | `_limpiarValidacionesFilasVaciasDirectorio` | _buscarFilaPorTag(sh, tag) |
| 11B100 | 2366-2383 | `_buscarFilaPorTag` | _aplicarFormatoCondicionalDirectorio(sh, numFilas, totalCols, colVetado, colEstado, colRango) |
| 11B101 | 2417-2432 | `_aplicarFormatoCondicionalDirectorio` | sincronizarEdicionAdminCatDisp(sh, row) |
| 11B102 | 2445-2456 | `sincronizarEdicionAdminCatDisp` | Admin (12/07/2026): Directorio y Administradores ya NO comparten |
| 11B103 | 2467-2471 | `sincronizarEdicionAdminCatDisp` | 2. Si se marcó Admin = "Sí", propagar a todas las cuentas del Directorio |
| 11B104 | 2473-2475 | `sincronizarEdicionAdminCatDisp` | La fila con el Celular de origen: si la edición fue en Directorio, es |
| 11B105 | 2515-2522 | `sincronizarEdicionAdminCatDisp` | _aplicarCatDispMultiSelect(sh, categorias) |
| 11B106 | 2527-2530 | `_aplicarCatDispMultiSelect` | Quitar cualquier validación de lista/dropdown que haya quedado de una |
| 11B107 | 2546-2557 | `_aplicarCatDispMultiSelect` | _aplicarFuncionesMultiSelect(sh, funciones) |
| 11B108 | 2562-2565 | `_aplicarFuncionesMultiSelect` | Quitar cualquier validación de lista/dropdown que haya quedado de una |
| 11B109 | 2589-2602 | `_aplicarDropdownsAdministradores` | _obtenerNomMultisDistintos() |
| 11B110 | 2625-2660 | `_obtenerNomMultisDistintos` | _guardarRegistroNuevoMiembro(datos) |
| 11B111 | 2708-2711 | `_guardarRegistroNuevoMiembroImpl` | Fila nueva: se agrega al final, con Estado="Inactivo" (el jugador |
| 11B112 | 2725-2732 | `_guardarRegistroNuevoMiembroImpl` | _aplicarBordesComentarios() (Fase 7 del plan de cambios) |
| 11B113 | 2749-2771 | `_aplicarBordesComentarios` | LIMPIEZA DE ENLACES ACCIDENTALES EN NOMBRES |
| 11B114 | 2773-2805 | `_aplicarBordesComentarios` | _limpiarLinksAccidentalesEnHoja(sh) |
| 11B115 | 2809-2821 | `_limpiarLinksAccidentalesEnHoja` | FIX (09-ago-2026): se agrega 'clan' a la lista — pedido explícito del |
| 11B116 | 2855-2870 | `_limpiarLinksAccidentalesEnHoja` | FIX (02/08/2026): reportado que el log registraba "N enlace(s) |
| 11B117 | 2883-2887 | `_limpiarLinksAccidentalesEnHoja` | flush() adicional: confirma el cambio de inmediato, antes de que la |
| 11B118 | 2897-2917 | `_limpiarLinksAccidentalesEnHoja` | FASE B1 (14/07/2026) — Reconstrucción de filas de Directorio en formato DC |
| 11B119 | 2919-2924 | `_limpiarLinksAccidentalesEnHoja` | _leerHojaComoMapaPorTag(ss, nombreHoja, tagColIdx, totalCols) |
| 11B120 | 2937-2949 | `_leerHojaComoMapaPorTag` | _leerFilaHojaPorTag(ss, nombreHoja, tagColIdx, totalCols, tag) |
| 11B121 | 2965-2995 | `_leerFilaHojaPorTag` | _reconstruirFilaDCDesdeFisico(filaDirectorio, playersRow, linksRow) |
| 11B122 | 3023-3047 | `_reconstruirFilaDCDesdeFisico` | _leerDirectorioFisicoComoDC(ss) |

---

## Detalle (texto original, sin cambios)

Cada bloque se copió tal cual estaba en el `.gs` (sin los `//`). Los números de línea son los del archivo ANTES de la limpieza.


### Ubicación: `Cabecera del archivo`

#### 11B001 — líneas 10-41 (comentario)

```text
CONCEPTO CLAVE - CAMPO JUGADOR (columna 4 en Directorio y en Inactivos —
Multicuentas ya NO la tiene, ver nota MULTICUENTAS más abajo; Vetados
TAMPOCO la tiene desde el 17-ago-2026, ver nota siguiente):
  Siempre se calcula como: Nom_Multi + " (" + Cuenta1 + " " + Cuenta2 + "...)"
  - Nom_Multi: nombre legible escrito manualmente en la columna Nom_Multi
               del Directorio. Permite identificar jugadores con caracteres
               especiales. Aplica aunque el jugador solo tenga UNA cuenta.
  - Si Nom_Multi está vacío, se usa directamente el nombre del juego.
  Esto facilita etiquetar en WhatsApp a cuentas con caracteres especiales.

VETADOS (17-ago-2026, pedido explícito del usuario): la columna 4 pasó de
"Jugador" a "Nom_Multi" (el nombre manual, SIN el listado de cuentas entre
paréntesis) — ver _setupVetados() en 02_Setup_Hojas.gs, y _updateVetados()/
sincronizarRazonHaciaVetados() más abajo en este archivo, que ahora leen
DC.NOM_MULTI/IC.NOM_MULTI en vez de DC.JUGADOR/IC.JUGADOR para esa columna.

COMENTARIOS (17-ago-2026, mismo pedido): la columna 5 también pasó de
"Jugador" a "Nom_Multi" — ver _setupComentarios() en 02_Setup_Hojas.gs,
moverComentarioFila() y _copiarComentarioAscensoAComentarios() más abajo
en este archivo.

HISTORIAL: encabezados N°|Fecha|Tag|Nombre|Movimiento|Clan|ClanTag (7 cols)

MULTICUENTAS: desde columna C en adelante se sincronizan TODOS los campos
              del Directorio para el tag correspondiente. FIX (07-ago-2026):
              se quitó la columna "Jugador" y se agregó "Préstamo" a la
              derecha de Nom_Multi (ver _setupMulticuentas() en
              02_Setup_Hojas.gs y _updateMulticuentas() más abajo).

V_GUERRA: se importa desde CSV (csvRow.v_guerra) si existing está vacío,
          o desde /players si PLAYERS_API_ENABLED está activo.
=============================================================================
```


### Ubicación: `DIR_TOTAL_COLS`

#### 11B002 — líneas 64-83 (comentario)

```text
DIR_SHEET_COLS (13/07/2026, Fase 4): ancho REAL de la hoja Directorio en
Sheets. Bajó de 58 a 29 columnas: además de Cat_disp/Clanes_Admin (ya
quitadas en la fase anterior), ahora se quitan también físicamente:
  - Los 23 campos de estadísticas de Players (DC.ANTIGUEDAD..DC.DON_D,
    índices 9-31) — ahora viven solo en la hoja Players.
  - Los 6 campos de enlaces de Links (DC.WSP, DC.ROYALE_API, DC.DECK,
    DC.DECK_2, DC.CW_STATS, DC.RENDER, índices 43-48) — ahora viven solo
    en la hoja Links.
Directorio termina con el MISMO layout de 29 columnas que Inactivos (ver
IC en 02_Setup_Hojas.gs), en el MISMO ORDEN (incluye Comentario como col 29) —
ver _setupDirectorio() en 02_Setup_Hojas.gs. OJO: ese orden NO es el orden de
DC (que sigue reflejando el orden histórico de 60 columnas) — es el
orden de IC. Esto significa que, a partir de esta fase, el índice DC.X
de un campo retenido YA NO coincide necesariamente con su posición física
real en la hoja Directorio (aunque el campo no se haya removido).

DIR_TOTAL_COLS (60) se mantiene como el modelo "completo" en memoria
(usado para construir Players/Links/Inactivos y el CSV) — YA NO lo usa
Administradores (ver AC/ADMINISTRADORES_TOTAL_COLS más abajo) y, desde
esta fase, tampoco refleja el ancho físico de Directorio.
```


### Ubicación: `DIR_SHEET_COLS`

#### 11B003 — líneas 86-138 (comentario)

```text
=============================================================================
Índices de columna (1-based) de la hoja "Administradores" — ver
_setupAdministradores() en 02_Setup_Hojas.gs. Desde el 12/07/2026 Administradores
DEJÓ de ser un espejo de Directorio: tiene su PROPIA estructura reducida de
21 columnas (identidad + campos de gestión de admins), en un orden propio
(nótese que aquí Rango va DESPUÉS de Clan/ClanTag, al revés que en
Directorio). Por eso usa su propio objeto de índices (AC), NUNCA el de
Directorio (DC) — comparten nombre de campo pero NO comparten posición.
Se arma fila por fila en sincronizarAdministradores() (más abajo en este
archivo), tomando cada campo de Directorio por nombre, no por copia
posicional completa.
=============================================================================
Orden (13/07/2026): Estado/Admin/Vetado/Razón ahora van ANTES de
Vigencia/Inactividad(d)/Alerta (antes era al revés). Cat_disp y
Clanes_Admin se mantienen al final, sin cambios.

FASE 4 — WEB (25-ago-2026, contrato cerrado en arquitectura-web-familia-terna.md
Sección 7.2/7.3): se agregan 2 columnas nuevas al final:
  - Funciones (col 21, letra U): permisos de FUNCIONES del panel admin web
    ("Vetar", "Registrar miembro nuevo"), separada de Cat_disp (que es
    SOLO accesos a contenido/categorías de Menú). Texto libre separado por
    comas, mismo criterio que Cat_disp. Edición manual — sincronizarAdministradores()
    la preserva igual que Cat_disp, nunca la recalcula ni la borra.
  - Clave (col 23, letra W): contraseña individual de cada admin para el
    login personalizado de la web (usuario = Celular, columna 11).
    FASE 5 (26-ago-2026, pedido explícito del usuario: "está bien que las
    claves se guarden en el csv, pero se debe generar solo una por cada
    celular (solo administradores)"): dejó de ser de edición manual
    exclusiva. sincronizarAdministradores() la AUTOGENERA (ver
    _generarClaveAdmin() más abajo) la primera vez que un Celular
    aparece como administrador — una sola Clave por Celular, compartida
    por todas las cuentas de una misma multicuenta, nunca una por Tag —
    y luego la preserva tal cual en cada corrida futura, igual que ya
    preservaba Funciones/Cat_disp. Nunca se recalcula ni se borra una
    vez generada.
Clanes_Admin (columna CALCULADA, ver _getClanesAdminTexto()) se corre un
puesto a la derecha, de 21 a 22, para dejar sitio a Funciones justo antes.
ADMINISTRADORES_TOTAL_COLS pasa de 21 a 23. Ver _setupAdministradores() en
02_Setup_Hojas.gs para el encabezado físico y sincronizarAdministradores()
más abajo para cómo se preservan/generan Funciones/Clave en cada corrida.
FASE 6 — SEGURIDAD (15-sep-2026, pedido del usuario, hallazgo B-31 de
Plan_Fases.md: "Las claves de admin están en texto plano... cualquiera
con acceso de lectura a la hoja o al CSV de respaldo las ve"): se agrega
1 columna más al FINAL, 23 → 24. Clave_Hash (col 24) NO reemplaza a
Clave (col 23) — ver el porqué en el docblock de _hashClaveAdmin() y en
_webAuthLogin() (37_Web_API.gs): Clave en texto plano sigue siendo, hoy,
el único canal por el que un admin nuevo se entera de su propia
contraseña (no hay ningún mensaje/WhatsApp que se la envíe aparte), así
que borrarla de un plumazo dejaría a cualquier admin que todavía no
inició sesión ni una sola vez sin forma de conocerla. La migración es
perezosa: Clave_Hash se completa sola, admin por admin, en su próximo
login exitoso (ver _webAuthLogin()) — no hace falta ninguna corrida
manual ni coordinar nada con nadie.
```


### Ubicación: `ADMINISTRADORES_TOTAL_COLS`

#### 11B004 — líneas 148-178 (comentario)

```text
=============================================================================
Índices de columna (1-based) de la hoja "Vetados" — ver _setupVetados() en
02_Setup_Hojas.gs. Igual que Administradores, tiene su PROPIA estructura,
nunca comparte posición con DC/IC aunque comparta nombre de campo.

FIX (26-ago-2026, pedido explícito del usuario): la columna 4 vuelve a
llamarse "Nom_Multi" (revierte el rótulo "Jugador" del FIX del
25-ago-2026 — el valor que se sigue escribiendo ahí es el mismo de
siempre, Nom_Multi calculado; ver _updateVetados()/
sincronizarRazonHaciaVetados() más abajo, que NO cambian de dónde leen
el dato, solo el rótulo volvió a cambiar). La clave interna del objeto
VC también se renombró de JUGADOR a NOM_MULTI (mismo criterio que CMC
más abajo, en Comentarios) — pedido explícito del usuario de que no
quede "Jugador" en el código de esta hoja, ni en el encabezado ni en
el resto del contenido. FASE 4 — WEB (arquitectura-web-familia-terna.md,
Sección 7.5): se agregan 3 columnas nuevas al final, exclusivas del
flujo "Vetar desde la web":
  - Autor (col 11): Nom_Multi del admin logueado que vetó (o su Nombre si
    no tiene Nom_Multi).
  - Vía (col 12): 'Web' | 'Bot' | 'Sheet' (dropdown, editable a mano).
  - Fecha (col 13): objeto Date real del momento del veto. SÍ se
    respalda/restaura junto con el resto del CSV, pero como número
    (epoch ms) en vez de texto — el pedido explícito fue "que no se
    guarde como texto, sino en formato numérico", no que se excluya. Ver
    colsFormatoNumerico en respaldarIndiceYProtegidasCSV()/
    _respaldarListaHojasCSV() e importarAcumulativosDesdeCSV(), y
    _parseSpanishDate() (todas en 05_Backup_CSV.gs).
VETADOS_TOTAL_COLS pasa de 10 a 13. Usar SIEMPRE VC.* en vez de índices de
array sueltos (ej. data[i][9]) — esa era la causa de que el contenido de
una columna se leyera/escribiera mal apenas se desplazaba el orden.
=============================================================================
```


### Ubicación: `VETADOS_TOTAL_COLS`

#### 11B005 — líneas 186-189 (comentario)

```text
Columnas que SÍ se recalculan automáticamente desde Directorio/Inactivos
en cada corrida de _updateVetados() (Fase 4 no toca esto). Autor/Vía/Fecha
(11-13) son exclusivas del flujo web y _updateVetados() las preserva tal
cual estén, igual que ya hacía con Razón.
```


### Ubicación: `VETADOS_COLS_AUTOSYNC`

#### 11B006 — líneas 192-208 (comentario)

```text
=============================================================================
Índices de columna (1-based) de la hoja "Comentarios" — ver
_setupComentarios() en 02_Setup_Hojas.gs y moverComentarioFila() más abajo.

FIX (26-ago-2026, pedido explícito del usuario): la columna 5 vuelve a
llamarse "Nom_Multi" (revierte el rótulo "Jugador" del FIX del
25-ago-2026 — el valor sigue siendo Nom_Multi calculado, igual que en
Vetados; ver nota en VC de arriba). La clave interna del objeto CMC
también se renombró de JUGADOR a NOM_MULTI (mismo criterio que VC, en
Vetados) — pedido explícito del usuario de que no quede "Jugador" en el
código de esta hoja, ni en el encabezado ni en el resto del contenido.
No se agregan columnas nuevas acá: el comentario automático de un veto
desde la web (Sección 7.5, paso 9) se escribe TAL CUAL en la columna
Comentario existente, con el autor/razón/fecha incluidos dentro del
texto — no hay columnas separadas de Autor/Vía/Fecha en esta hoja (esas
son exclusivas de Vetados).
=============================================================================
```


### Ubicación: `updateDirectorioSheet`

#### 11B007 — líneas 232-240 (comentario)

```text
El bootstrap de reanudación (_ejecutarPorTandas en 00_Main.gs) solo
garantiza los datos básicos del clan (rápido). Como esta función SÍ
necesita los perfiles de /players, los asegura aquí mismo. Si ya se
obtuvieron antes en esta misma ejecución (memoización en
09_API_ClashRoyale.gs), esta llamada no repite ninguna petición HTTP.
IMPORTANTE: se llama SIEMPRE, sin importar PLAYERS_API_ENABLED, porque
_fetchPlayersData() ya decide internamente qué tags pedir según el
interruptor y SIEMPRE incluye los admins. Antes, con el interruptor en
false, este bloque se saltaba entero y los admins quedaban sin pedirse.
```

#### 11B008 — líneas 246-253 (comentario)

```text
FASE B4 (16/07/2026): Nivel/Nivel2/V_Guerra/Copas y los 17 campos que
resuelve _fallbackPlayerField() (ver _construirFila() más abajo) ya no
se leen desde `existing` (fila de Directorio) — se movieron a la hoja
Players (ver Fase B3, _escribirPlayers()). playersPorTag/linksPorTag
(mapas Tag -> fila, formato PC/LC) reutilizan el mismo helper de la
Fase B1 (_leerHojaComoMapaPorTag(), ver más abajo en este archivo) y se
pasan a través de _construirFilasDirectorio() hasta _construirFila()/
_construirFilaInactiva().
```

#### 11B009 — líneas 257-261 (comentario)

```text
Mapa completo de índices 0-based para todas las columnas leídas desde
la hoja Directorio. Se construye desde los encabezados reales de la fila 1.
Clave: nombre canónico interno → valor: índice 0-based en la fila de datos.
Si un encabezado no se encuentra, se cae al índice fijo de IC como respaldo
(IC, no DC: `existing` es siempre la fila FÍSICA de Directorio, formato IC).
```

#### 11B010 — líneas 278-281 (comentario)

```text
Cat_disp: Directorio nunca tuvo esta columna físicamente (no está en
IC) — depende siempre del CSV (ver comentario en _construirFila()).
-1 es un índice inválido a propósito, mismo efecto práctico que el
NaN que daba el respaldo anterior (DC.CAT_DISP, fuera de rango).
```

#### 11B011 — líneas 302-308 (comentario)

```text
Snapshot de Inactivos (29 columnas propias, incluye Comentario, + 31
columnas extra guardadas en ClanSystem_Backup_InactivosExtra.json), usado
más abajo por
_construirFilasDirectorio() para restaurar los datos de cualquier cuenta
que vuelva a estar Activa en un clan Terna (ver
_leerInactivosParaReactivacion()/_reconstruirExistingDesdeInactivos(),
más abajo en este archivo).
```

#### 11B012 — líneas 315-318 (comentario)

```text
FASE B3 (16/07/2026): poblar Players y Links con el mismo modelo de 60
columnas ya usado para escribir Directorio. Antes, estas dos hojas
existían con sus encabezados (ver _setupPlayers()/_setupLinks() en
02_Setup_Hojas.gs) pero ninguna función las llenaba.
```

#### 11B013 — líneas 326-336 (comentario)

```text
FIX (04-ago-2026): "hay filas vacías que están conservando la validación
de datos" — _aplicarDropdownsDirectorio() (arriba) solo APLICA
validaciones sobre las filas 2..(1+todasFilas.length); nunca las QUITA
de las filas por debajo de eso. Si la hoja tenía antes más filas con
datos (o hasta sh.getMaxRows(), que puede ser mayor que cualquier fila
que alguna vez tuvo datos), esas filas se quedan con los desplegables
(Sí/No, Razón, etc.) para siempre, aunque estén completamente vacías.
La limpieza de bordes en filas vacías (ver _limpiarBordesFilasVacias(),
04_Formato_Comun.gs) ya corre en cada runUpdate/runAll para TODAS las hojas, pero
solo toca bordes, nunca validaciones — de ahí que el borde sí se vea
limpio pero el desplegable de validación siga apareciendo al hacer clic.
```

#### 11B014 — líneas 339-358 (comentario)

```text
FIX (17-ago-2026, pedido usuario): recrear el filtro nativo (embudo) de
Directorio con el rango ACTUALIZADO cada vez que se reescribe la hoja.
_restaurarFiltros()/_crearTabla() (00_Main.gs) son las que normalmente
recrean el filtro con el rango correcto, pero SOLO corren dentro del
pipeline de runUpdate()/runAll() (PASOS_RUNUPDATE/PASOS_RUNALL) —
runGuerraRapido() nunca las llama (ver runGuerraRapido(), 00_Main.gs).
Reportado por el usuario: tras correr runGuerraRapido() con el roster
más chico que la última vez que corrió runUpdate() (miembros
expulsados/inactivados), el filtro de Directorio se quedaba con el
rango VIEJO (más grande, de la corrida anterior): aunque
_limpiarValidacionesFilasVaciasDirectorio() (arriba) ya deja esas filas
sin desplegable ni datos, siguen DENTRO del rango del filtro existente
porque nada lo había vuelto a crear más chico — y como Sheets sí
reconoce esas celdas como en blanco, cada columna filtrable las ofrece
como opción "(Vacío)" en el desplegable de filtro. Recrear el filtro
acá, con el todasFilas.length ya actualizado, corrige esto sin importar
qué función haya llamado a updateDirectorioSheet() (runGuerraRapido(),
runUpdate() o runAll()) — es una sola hoja, así que el costo es mínimo
y no repite el trabajo de la limpieza global de _restaurarFiltros()
(esa sigue corriendo aparte para el resto de hojas).
```

#### 11B015 — líneas 361-370 (comentario)

```text
Poblar Inactivos con TODOS los inactivos (admin y no-admin), fila completa
(60 columnas, igual estructura que Directorio). Esto es necesario porque
los inactivos no-admin nunca se escriben en la hoja Directorio, así que
esta es la única oportunidad de esta corrida para preservar sus datos
completos antes de que _construirFilaInactiva() ya no tenga de dónde
recuperarlos en una corrida futura. _updateInactivos() (ver más abajo)
se llama de nuevo después, como parte de updateVistasDerivadas(), y esa
segunda llamada solo confirma/actualiza los admin-inactivos que sí
aparecen en Directorio, preservando (protección anti-borrado) lo que se
acaba de escribir aquí para los no-admin.
```

#### 11B016 — líneas 373-382 (comentario)

```text
Reactivación: retirar de Inactivos (hoja + ClanSystem_Backup_
InactivosExtra.json) las cuentas que acaban de recuperar sus datos
porque volvieron a estar Activas en un clan Terna (ver
_construirFilasDirectorio()/_reconstruirExistingDesdeInactivos() más
arriba). No se espera a que updateVistasDerivadas() las retire más
tarde por su propia protección anti-borrado (esa segunda pasada podría
no llegar a ejecutarse en la misma corrida si el motor de tandas corta
la ejecución entre Directorio y Vistas): se retiran acá mismo, de
inmediato, para que la cuenta nunca quede a la vez en Directorio (Activa)
y en Inactivos.
```

#### 11B017 — líneas 388-392 (comentario)

```text
NOTA: updateVistasDerivadas() ya NO se llama aquí. Se llama como su
propio paso independiente en PASOS_RUNALL/PASOS_RUNUPDATE (11_DirectorioSheet.gs),
lo que evita ejecutarlo dos veces por ciclo y permite que el motor de
tandas (_ejecutarPorTandas) pueda checkpointear entre Directorio y
Vistas en vez de que ambos queden atrapados dentro de la misma tanda.
```


### Ubicación: `updateVistasDerivadas`

#### 11B018 — líneas 400-409 (comentario)

```text
FASE B1 (14/07/2026): antes, esta lectura pedía DIR_TOTAL_COLS (60
columnas, formato DC) directo de la hoja FÍSICA Directorio, que desde la
Fase 4 solo tiene DIR_SHEET_COLS (29) columnas reales en el orden de IC
— el resultado ya no correspondía al formato DC que
_updateInactivos()/_updateVetados()/_updateMulticuentas()/
_updateHistorial()/updateAscensosSheet() (todas llamadas más abajo con
este mismo dirData) asumen. _leerDirectorioFisicoComoDC() (ver más abajo
en este archivo) resuelve esto: lee las 29 columnas reales + Players +
Links y devuelve cada fila ya reconstruida en formato DC de 60
columnas, para que el resto de esta función siga sin cambios.
```

#### 11B019 — líneas 415-418 (comentario)

```text
IMPORTANTE: debe ir DESPUÉS de _updateHistorial (por consistencia de
lectura) y ANTES de que syncAllCSV()/syncDirectorioCSV() sobreescriban
Backup_Directorio.csv en esta misma corrida — ver comentario en
updateAscensosSheet() para el detalle de por qué el orden importa.
```

#### 11B020 — líneas 422-436 (docblock)

```text
sincronizarAdministradores()
Actualiza la hoja Administradores:
  1. Busca en Directorio las filas donde Admin == "Sí"
  2. Obtiene sus números de celular
  3. Trae TODAS las filas del Directorio que comparten esos celulares
     (incluye multicuentas del mismo dueño)
  4. Ordena por Nom_Multi y luego Copas (desc)
Filas con celular vacío se marcan como "No aplica".

Cat_disp/Clanes_Admin (12/07/2026): Directorio ya no tiene estas 2
columnas, así que no vienen copiadas de ahí. Cat_disp se preserva del
valor que ya tenía la propia hoja Administradores (edición manual);
Clanes_Admin se recalcula siempre desde cero (columna derivada).
```

#### 11B021 — líneas 437-457 (docblock)

```text
sincronizarAdministradores()
Actualiza la hoja Administradores:
  1. Busca en Directorio las filas donde Admin == "Sí"
  2. Obtiene sus números de celular
  3. Trae TODAS las filas del Directorio que comparten esos celulares
     (incluye multicuentas del mismo dueño)
  4. Ordena por Nom_Multi y luego Copas (desc)
Filas con celular vacío se marcan como "No aplica".

Administradores (12/07/2026): DEJÓ de ser un espejo de Directorio — tiene
su propia estructura reducida de 21 columnas (ver AC/_setupAdministradores()
en 11_DirectorioSheet.gs), en un orden propio. Por eso cada fila se arma CAMPO POR
CAMPO desde Directorio (DC.* -> AC.*), ya no es una copia posicional
completa de la fila. Copas se usa solo para ordenar (viene de Directorio)
pero ya NO se guarda en Administradores, que no tiene esa columna.

Cat_disp/Clanes_Admin: Directorio no tiene estas 2 columnas. Cat_disp se
preserva del valor que ya tenía la propia hoja Administradores (edición
manual); Clanes_Admin se recalcula siempre desde cero (columna derivada).
```

#### 11B022 — líneas 459-475 (docblock)

```text
_generarClaveAdmin()
FASE 5 (26-ago-2026, pedido explícito del usuario): genera una Clave
(contraseña de login web, columna AC.CLAVE) nueva y aleatoria de 8
caracteres. La llama sincronizarAdministradores() (ver Paso 4, más
abajo) UNA SOLA VEZ por Celular, la primera vez que ese Celular aparece
como administrador — nunca se vuelve a invocar para ese mismo Celular en
corridas futuras, porque la Clave ya generada queda preservada.

Alfabeto de 33 símbolos sin caracteres fácilmente confundibles entre sí
(se excluyen 0/O, 1/I/L) para que un admin pueda transcribir la clave a
mano sin errores. 8 caracteres de este alfabeto dan 33^8 (~1.7×10^12)
combinaciones — suficiente para una clave de acceso interno de un grupo
cerrado de administradores; no pretende ser un estándar de seguridad de
nivel bancario.
@returns {string} Clave de 8 caracteres, ej. "K7XW4RNQ".
```


### Ubicación: `sincronizarAdministradores`

#### 11B023 — líneas 494-504 (comentario)

```text
FIX (16/07/2026): antes se leía la hoja física Directorio en crudo
(shDir.getRange(2,1,shDir.getLastRow()-1,DIR_SHEET_COLS): 29 columnas reales, orden
IC) y se indexaba con DC.* (orden de 60 columnas). DC e IC solo
coinciden en las primeras 7 posiciones, así que todo índice DC.* más
allá de esa posición (DC.ADMIN, DC.CELULAR, DC.COPAS, etc.) caía fuera
de rango o leía el campo equivocado -- en la práctica, esAdmin nunca era
'Sí' y esta función nunca detectaba administradores.
_leerDirectorioFisicoComoDC() (ver 11_DirectorioSheet.gs) reconstruye
cada fila al formato DC completo de 60 columnas (Directorio + Players +
Links), así que todos los índices DC.* de esta función vuelven a ser
válidos, incluido DC.COPAS (se trae desde Players).
```

#### 11B024 — líneas 508-525 (comentario)

```text
Cat_disp (12/07/2026): columna de edición MANUAL que ahora vive SOLO en
Administradores. Antes de borrar el contenido de la hoja, se guarda su
valor actual por Tag para poder preservarlo al reconstruir las filas
más abajo (si no se hace esto, cada corrida de sincronizarAdministradores()
borraría cualquier categoría elegida a mano).
FASE 4 (25-ago-2026): junto con Cat_disp, también se preservaba
Funciones (edición MANUAL exclusiva — ver AC más arriba en este
archivo). No se recalcula ni se borra en cada corrida; solo se guarda
su valor actual por Tag antes de reescribir la hoja, y se vuelve a
poner en su sitio al armar cada fila (Paso 4, más abajo).

FASE 5 (26-ago-2026, pedido explícito del usuario: "está bien que las
claves se guarden en el csv, pero se debe generar solo una por cada
celular (solo administradores)"): Clave deja de preservarse por Tag y
pasa a preservarse/generarse por CELULAR — ver clavePrevioPorCelular
más abajo y el Paso 4. El login web es por Celular, no por Tag, así
que todas las cuentas de una misma multicuenta deben compartir
exactamente la misma Clave.
```

#### 11B025 — líneas 528-534 (comentario)

```text
FASE 4 — WEB (arquitectura-web-familia-terna.md, Sección 7.3.2, v9):
Clanes_Admin pasa de ser 100% calculada (se pisaba sola en cada
corrida, sin importar si alguien la había editado a mano) a seguir el
MISMO patrón que Cat_disp/Funciones: se guarda su valor previo por Tag
acá, y se preserva tal cual al armar cada fila (Paso 4, más abajo) si
ya tenía algo. Solo se calcula con _getClanesAdminTexto() cuando la
celda llega vacía (admin nuevo, o alguien borró todo el contenido).
```

#### 11B026 — líneas 536-543 (comentario)

```text
Clave: nombre canónico interno → valor: primera Clave no vacía
encontrada para ese Celular en la hoja Administradores ANTES de
reescribirla. Se indexa por soloDigitos(Celular) (no por el string
crudo) para que una Clave ya generada se siga reconociendo aunque
Sheets haya guardado el Celular como Number en una corrida y como
String en otra — mismo criterio de normalización que usa el resto del
proyecto para comparar celulares entre fuentes (ver soloDigitos() en
01_Config_Global.gs).
```

#### 11B027 — líneas 545-551 (comentario)

```text
NUEVO (15-sep-2026, pedido del usuario, hallazgo B-31): mismo criterio
exacto que clavePrevioPorCelular de arriba, pero para el hash — se
preserva por Celular (no por Tag), indexado por soloDigitos(Celular).
Si el hash todavía no existe para ese Celular (nadie de esa
multicuenta inició sesión desde que se agregó esta columna), queda
como string vacío y _webAuthLogin() lo completa solo en el próximo
login exitoso — ver _hashClaveAdmin()/_webAuthLogin() en 37_Web_API.gs.
```

#### 11B028 — líneas 568-571 (comentario)

```text
NUEVO (15-sep-2026): mismo criterio que clavePrevia, columna
Clave_Hash (24) en vez de Clave (23). String vacío si la hoja
todavía no tiene 24 columnas físicas (undefined -> '' por el
patrón `|| ''` ya usado en todo este archivo).
```

#### 11B029 — líneas 579-615 (comentario)

```text
FIX (30-ago-2026, reportado por el usuario: "si demuelo y ejecuto
runall, se vuelven a generar las claves"). El bloque de arriba SOLO
mira la hoja Administradores tal cual está ANTES de reescribirla en
esta misma corrida — pero justo después de un Demoler, esa hoja está
vacía (lastRowAdmPrevio < 2), así que clavePrevioPorCelular queda
vacío y CADA celular se trata como "nuevo": se le genera una Clave
aleatoria distinta con _generarClaveAdmin(), aunque las Claves viejas
sigan existiendo en Backup_Administradores.csv.
Administradores es una hoja "derivada" sin restauración dedicada (a
diferencia de Guerra/Control_2, que sí tienen su propio
_restaurarXSiNoExiste() — ver 05_Backup_CSV.gs / 22_ControlCalendario.gs): se respalda siempre tal cual quedó la
hoja, sin protección ni restauración previa (ver
respaldarHojasDerivadasCSV(), 05_Backup_CSV.gs). Como
sincronizarAdministradores() corre ANTES que ese paso de respaldo
dentro de runAll() (ver PASOS_RUNALL, 00_Main.gs), las Claves nuevas
(equivocadas) terminaban también sobreescribiendo el propio CSV en la
misma corrida, perdiendo las viejas para siempre en vez de solo
"hasta el próximo runAll".

Se completa acá el mismo mapa claveHashPrevioPorCelular con lo que haya
en Backup_Administradores.csv, SOLO para los celulares que la hoja no
tenía (la hoja, cuando sí tiene datos, sigue siendo la fuente de
verdad — el CSV es el respaldo de último recurso para cuando la hoja
llegó vacía). Mismo helper (_loadCSVFromDrive/_parseCSV) que ya usan
los demás _restaurarXSiNoExiste() del proyecto.

CAMBIO (20-sep-2026, pedido del usuario): la Clave en texto plano ya
NO se restaura desde el CSV hacia la hoja acá. El CSV sigue teniendo su
propia columna Clave intacta (respaldarHojasDerivadasCSV() la sigue
copiando tal cual, sin cambios en 05_Backup_CSV.gs), pero esta función
deja de leerla de vuelta hacia Sheets. Efecto práctico SOLO tras un
Demoler + runAll(): un admin que YA tenía Clave_Hash (ya inició sesión
alguna vez) no se entera de nada, porque _webAuthLogin() prioriza el
hash y este sigue restaurándose igual que antes (ver abajo). Un admin
que NUNCA inició sesión (sin Clave_Hash) recibe una Clave nueva de
_generarClaveAdmin() en vez de la vieja del CSV -- se le debe avisar la
Clave de nuevo en ese caso puntual.
```

#### 11B030 — líneas 623-628 (comentario)

```text
NUEVO (15-sep-2026): mismo respaldo para Clave_Hash, mismo
motivo exacto que motivó el FIX del 30-ago-2026 para Clave —
sin esto, un Demoler + runAll() perdería el trabajo de
migración ya hecho (los admins que ya habían iniciado sesión
volverían a depender de la Clave en texto plano hasta su
siguiente login).
```

#### 11B031 — líneas 650-656 (comentario)

```text
Paso 2: Recopilar TODAS las filas (ya reconstruidas a formato DC de 60
columnas vía _leerDirectorioFisicoComoDC(), ver arriba) que comparten
esos celulares, guardando aparte Nom_Multi/Copas solo para el ordenamiento
del paso 3 (Copas no se guarda en Administradores, que no tiene esa
columna). Copas viene de la hoja Players una vez esté poblada; hasta
entonces queda vacía/0 -- comportamiento esperado durante la migración,
no un bug de índices (ver _leerDirectorioFisicoComoDC()).
```

#### 11B032 — líneas 670-677 (comentario)

```text
FIX (06-ago-2026): Nom_Multi/Celular a veces solo se cargó en UNA de
las cuentas de un mismo dueño (multicuenta) — antes, cualquier cuenta
sin su propio Nom_Multi ordenaba sola (cadena vacía), lejos del resto
de sus cuentas hermanas, en vez de agruparse con ellas. Se arma un mapa
Celular -> Nom_Multi "heredado": el primer Nom_Multi no vacío que se
encuentre entre TODAS las cuentas que comparten ese mismo Celular. Así,
basta con que UNA cuenta del grupo tenga el Nom_Multi cargado para que
TODO el grupo (identificado por Celular) se agrupe bajo ese nombre.
```

#### 11B033 — líneas 691-694 (comentario)

```text
Clave de agrupación: Nom_Multi (propio o heredado del grupo por
Celular); si NINGUNA cuenta del grupo tiene Nom_Multi cargado, se
agrupa por el propio Celular, así las multicuentas sin Nom_Multi
siguen quedando juntas en vez de dispersarse.
```

#### 11B034 — líneas 736-738 (comentario)

```text
FASE 4 (25-ago-2026): Funciones es de edición MANUAL exclusiva
(permisos del panel web) — se preserva tal cual, igual que Cat_disp,
nunca se recalcula.
```

#### 11B035 — líneas 740-747 (comentario)

```text
FASE 4 — WEB (Sección 7.3.2, v9): Clanes_Admin ya NO se recalcula
siempre desde CFG.ADMIN_FAMILIA — eso pisaba sin avisar cualquier
edición manual hecha directo en la celda. Mismo criterio que
Funciones/Cat_disp: si el Tag ya tenía algo en Clanes_Admin (edición
manual, o valor de una corrida anterior), se preserva tal cual; solo
se calcula con _getClanesAdminTexto() cuando la celda llega vacía
(admin nuevo, o alguien borró todo el contenido), como punto de
partida razonable.
```

#### 11B036 — líneas 752-765 (comentario)

```text
FASE 5 (26-ago-2026, pedido explícito del usuario): Clave se
autogenera por Celular en vez de editarse a mano. `candidatos` (Paso
2) ya está filtrado a filas cuyo Celular está en celularesAdmin
(Paso 1, Admin='Sí'), así que CUALQUIER Celular que llegue hasta acá
es, por construcción, un Celular de administrador — no hace falta
repetir ese chequeo fila por fila.
- Si ese Celular YA tiene una Clave guardada de una corrida anterior
  (clavePrevioPorCelular, cargado arriba desde la hoja ANTES de
  reescribirla), se reutiliza tal cual: nunca se regenera sola.
- Si es la primera vez que ese Celular aparece como admin, se genera
  una Clave nueva con _generarClaveAdmin() y se guarda en
  clavePrevioPorCelular para que el resto de filas de este mismo
  Celular en esta misma corrida (multicuentas) reciban la MISMA
  Clave recién creada, no una distinta cada una.
```

#### 11B037 — líneas 773-782 (comentario)

```text
NUEVO (15-sep-2026): Clave_Hash NUNCA se genera acá -- a propósito,
a diferencia de Clave. Si ya existía (alguien de este Celular ya
inició sesión al menos una vez desde que se agregó esta columna), se
preserva tal cual. Si no existía, queda vacío: _webAuthLogin() la
completa sola en el próximo login exitoso de ese Celular, contra la
Clave en texto plano de arriba (ver docblock de _hashClaveAdmin(),
37_Web_API.gs). No se calcula un hash nuevo cada vez que se genera
una Clave nueva (`if (!claveK...)` arriba) porque en ese caso
Clave_Hash debe seguir vacía: es una Clave que el admin todavía no
usó ni una vez para loguearse.
```

#### 11B038 — líneas 788-791 (comentario)

```text
FIX (05-ago-2026): mismo criterio que _escribirDirectorio() — resetear
el color de letra al reescribir, para que no quede un blanco fijado
manualmente pegado a una posición de fila que ya no corresponde a la
misma cuenta (ver comentario detallado en _escribirDirectorio()).
```

#### 11B039 — líneas 802-805 (comentario)

```text
Mismos formatos que Directorio, solo para los campos que sobreviven en
la nueva estructura reducida (12/07/2026): Vigencia, Celular, y los
numéricos N°/Inactividad(d). Fecha_ing/Fecha_lim ya no existen aquí
(Administradores ya no tiene esas 2 columnas).
```

#### 11B040 — líneas 815-818 (comentario)

```text
FIX (06-ago-2026): anchos fijos pedidos por el usuario para Clanes_Admin
y Cat_disp — se reaplican en cada corrida (independiente de si hay
filas o no) porque Sheets no conserva el ancho de columna al hacer
clearContent()/setValues() sobre columnas ya angostadas manualmente.
```

#### 11B041 — líneas 828-834 (comentario)

```text
FASE 4 — WEB (arquitectura-web-familia-terna.md, Sección 7.5.1): el
dropdown de Autor en Vetados depende de la lista de Nom_Multi de
administradores, que puede cambiar acá (se agregó/quitó un admin, o
alguien editó su Nom_Multi) sin que _updateVetados() llegue a correr
en el medio. Se reaplica acá también (además de en _updateVetados(),
13_Inactivos_Vetados.gs) para que el dropdown nunca quede
desactualizado respecto de la lista real de admins.
```

#### 11B042 — líneas 842-868 (docblock)

```text
actualizarDropdownCatDisp()
Actualiza la columna Cat_disp (col 59) en Administradores — desde el
12/07/2026 esa columna ya NO existe en Directorio, solo aquí — leyendo
las categorías únicas del índice de contenido (_getIndiceContenido(),
43_Menu_Dinamico.gs), respetando el orden de la hoja Extra.

Cat_disp es de SELECCIÓN MÚLTIPLE: el valor de la celda es una lista de
categorías separadas por ", ". NO se aplica validación de lista/dropdown
(Google Sheets no soporta selección múltiple nativa vía Apps Script — ver
DataValidation — y un dropdown de una sola opción solo estorbaba, sin
permitir elegir varias categorías a la vez). La celda es simplemente
texto libre separado por comas, igual que Cat_disp ya se usa hoy.

Por defecto, todas las categorías quedan marcadas (todas seleccionadas)
SOLO para cuentas con Admin = "Sí" y SOLO si la celda Cat_disp está
vacía. Si el usuario edita manualmente el texto (deja un subconjunto),
ese valor se respeta y no se vuelve a sobreescribir.

FASE 4 — WEB (arquitectura-web-familia-terna.md, Sección 7.3.1): de paso,
esta misma función aplica el autocompletado análogo para Funciones (con
_aplicarFuncionesMultiSelect(), mismo patrón exacto que Cat_disp) — se
agrega acá, en vez de en una función nueva aparte, porque este es el
mismo punto donde ya se llama a _aplicarCatDispMultiSelect(shAdm,
categorias) y no hace falta sumar otro paso a PASOS_RUNALL/PASOS_RUNUPDATE/
PASOS_RUNGUERRARAPIDO (00_Main.gs) para lograr el mismo efecto.
```


### Ubicación: `actualizarDropdownCatDisp`

#### 11B043 — líneas 890-894 (comentario)

```text
FASE 4 — WEB (Sección 7.3.1): funciones disponibles del panel web hoy.
Si se agrega una función nueva en el futuro, solo hay que sumarla acá.
NUEVO (05-oct-2026): 'Actualizar roster' (WEB_FUNCION_ACTUALIZAR_ROSTER, 37_Web_API.gs) entra activa por defecto para
todo admin nuevo o con la celda vacia; los admin existentes la reciben con
migrarFuncionActualizarRosterATodosLosAdmins() (47_Migraciones.gs).
```


### Ubicación: `moverComentarioFila`

#### 11B044 — líneas 906-910 (comentario)

```text
NOTA (26-ago-2026): el encabezado de la columna 5 de Comentarios es
"Nom_Multi" (ver _setupComentarios(), 02_Setup_Hojas.gs); el VALOR
que se escribe ahí sigue siendo IC.NOM_MULTI (nombre legible escrito a
mano, sin el listado de cuentas) — mismo criterio que Vetados (ver VC en
este archivo). Se arma con CMC.* en vez de una lista posicional suelta.
```

#### 11B045 — líneas 927-984 (docblock)

```text
limpiarLinksAccidentalesDeNombres()
Recorre TODAS las hojas del spreadsheet llamando a
_limpiarLinksAccidentalesEnHoja() en cada una (ver esa función para el
detalle de qué columnas busca y por qué). Se agrega como paso automático
en PASOS_RUNALL/PASOS_RUNUPDATE (00_Main.gs), justo antes del respaldo
CSV, así que cualquier caso nuevo (otro jugador con un nombre que
"parezca" dominio) se corrige solo en cada corrida completa, sin
intervención manual. También se puede correr a mano desde el editor de
Apps Script para forzar la limpieza de inmediato en TODAS las hojas, sin
esperar a la próxima corrida programada.

NOTA (02-ago-2026): esta barrida general sigue existiendo como red de
seguridad, pero YA NO es la única defensa — Directorio además se limpia
a sí mismo al final de cada _escribirDirectorio() (ver
_limpiarLinksAccidentalesEnHoja() ahí), así que actualizar Directorio
suelto (fuera de runAll()/runUpdate()) también queda protegido.

REANUDABLE (FIX 17-ago-2026, mismo patrón que respaldarHojasDerivadasCSV()
en 05_Backup_CSV.gs y _fetchAllClanData() en 09_API_ClashRoyale.gs): esta función
llama a _limpiarLinksAccidentalesEnHoja() por cada columna coincidente
(Nombre/Nombre Jugador/Jugador/Nom_Multi/Clan) con un getRichTextValues()
sobre el rango completo — bastante más lento que getValues(). Con 27+
hojas y varias con miles de filas (Guerra, que además crece cada día y
tiene tanto "Nombre" como "Clan" entre esos encabezados desde el FIX
09-ago-2026), sumar el tiempo de TODAS las hojas en un solo tirón podía
superar tanto el presupuesto blando (CFG.RUNALL_PRESUPUESTO_MS) como el
límite duro de la plataforma (6m30s) SIN que _ejecutarPorTandas() llegara
a cortar limpio, porque ese chequeo solo corre ENTRE pasos, no dentro de
uno. El 17-ago-2026 una corrida murió exactamente así: "Exceeded maximum
execution time" dentro de este paso, y como ese error no es una excepción
de JS capturable, tampoco corrió el catch de _continuarRunAll() — el lock
quedó vivo hasta que expiró solo (CFG.LOCK_MAX_DURACION_MS) y nadie volvió
a llamar a _continuarRunAll() automáticamente.

Ahora se procesa de a una hoja, chequeando el presupuesto propio
(CFG.LIMPIAR_LINKS_BUDGET_MS) entre cada una; si se agota antes de
terminar, guarda en qué hoja se quedó (ScriptProperties) y devuelve
`false` para que _ejecutarPorTandas() reintente este MISMO paso en la
próxima continuación, retomando justo donde quedó (en vez de repetir
desde la hoja 0 o de colgarse otra vez sin dejar rastro).

CAMBIO DE CONTRATO: antes devolvía el array `resumen` (hoja/columna/
corregidas). Como ningún llamador real usaba ese valor (PASOS_RUNALL y
PASOS_RUNUPDATE, en 00_Main.gs, ya lo descartaban), ahora devuelve un
booleano (true = terminó todas las hojas, false = quedó incompleta),
igual que respaldarHojasDerivadasCSV(). El detalle por hoja/columna se
sigue viendo igual que antes en el log ("[LinksNombres] ..." dentro de
_limpiarLinksAccidentalesEnHoja()).

Si se corre a mano desde el editor y el spreadsheet es grande, puede que
una sola invocación no alcance a cubrir todas las hojas (devuelve false):
simplemente volver a ejecutar la función a mano retoma donde quedó, igual
que hace la continuación automática dentro de runAll()/runUpdate().

@returns {boolean} true si terminó TODAS las hojas, false si quedó
         incompleta (presupuesto interno agotado) y hay que reintentar.
```


### Ubicación: `_getCsvDirMap`

#### 11B046 — líneas 1066-1083 (comentario)

```text
FIX (13-ago-2026, pedido del usuario: "está escribiendo valores
numéricos en columnas de texto en Directorio", visto en Permiso/
Admin/Vetado — las 3 son dropdowns Sí/No/vacío en la hoja física
(ver setDataValidation(opsSiNo) sobre IC.PERMISO/IC.ADMIN/IC.VETADO,
más abajo en este mismo archivo). Antes, permiso/admin/vetado se
leían ACÁ del CSV sin ninguna validación — a diferencia de wsp_g/
etiqueta (que ya filtraban 'Link') y de razón (que ya exigía
esRazonValida()). Si Backup_Directorio.csv llega alguna vez con
esas columnas corridas o con un valor que no es texto Sí/No (por
headers duplicados en el CSV, por una fila más larga/corta que el
header, o por cualquier corrupción previa), ese valor crudo — que
puede ser cualquier número — pasaba directo a map[tag].permiso/
.admin/.vetado y de ahí a la celda de la hoja (ver _construirFila(),
10_ClanSheet.gs... ahora 11_DirectorioSheet.gs), disparando el
triángulo rojo de "valor no permitido por la regla de validación"
en Permiso/Admin/Vetado. _esSiNoOVacio() acepta 'Sí'/'Si'/'No'/vacío
(mismo criterio que ya usan wsp_g/etiqueta) y descarta cualquier
otra cosa, igual que esRazonValida() hace con Razón.
```

#### 11B047 — líneas 1102-1105 (comentario)

```text
Prefijo y Celular: siempre limpios (solo dígitos). El CSV puede
contener residuos de espacios de versiones anteriores con el bug
de formato visual guardado como valor; se normalizan aquí también
como defensa adicional.
```

#### 11B048 — líneas 1108-1110 (comentario)

```text
wsp_g y etiqueta: filtrar 'Link' (texto de RichText que puede haber
quedado en el CSV si syncDirectorioCSV usó getDisplayValues() sobre
una hoja corrupta)
```

#### 11B049 — líneas 1132-1135 (comentario)

```text
Vigencia y Fecha_lim: antes NO se leían acá — se perdían al
reconstruir un Inactivo sin fila "existing" (p.ej. tras
demolerTodoElSpreadsheet()), aunque el CSV sí las tuviera
guardadas (ver uso en _construirFilaInactiva()).
```

#### 11B050 — líneas 1147-1152 (comentario)

```text
Admin y Cat_disp: columnas de edición manual. Antes NO se leían
aquí — solo se preservaban desde "existing" (la fila viva en la
hoja), así que al demoler todo el spreadsheet (sin fila previa)
se perdían aunque el CSV sí las tuviera guardadas. Ver uso en
_construirFilaActiva(): ahora sirven de fallback cuando no hay
existing.
```

#### 11B051 — líneas 1161-1166 (comentario)

```text
--- Campos que SOLO vienen de /players (ver _construirFila) ---
Antes no se leían aquí: aunque syncDirectorioCSV() los exporta
(guarda las 57 columnas), _construirFila() no tenía de dónde
restaurarlos cuando PLAYERS_API_ENABLED está apagado, en modo
'partial' sin ese tag seleccionado, o tras demolerTodoElSpreadsheet()
(sin fila "existing"). Resultado: esas columnas se vaciaban.
```

#### 11B052 — líneas 1191-1200 (comentario)

```text
(25-sep-2026, FASE B) ClanSystem_Backup_Celulares.json se lee ahora desde
"Otros" (DRIVE_FOLDER_ID_OTROS) — antes vivía suelto directo en "JSON".
Ver checklist de AVISOS ABIERTOS / FASE B en 09_API_ClashRoyale.gs.
OJO: quien ESCRIBE/repara este mismo archivo es 05_Backup_CSV.gs, que
todavía no se migró (parte 5 del checklist) — hasta que esa parte se
entregue, 05_Backup_CSV.gs sigue escribiendo en "JSON" y esta lectura
ya apunta a "Otros", así que no se van a encontrar entre sí. No rompe
nada (el try/catch de abajo lo maneja en silencio, sin enriquecer el
mapa con datos de celulares/vetados de este JSON en ese lapso); es un
hueco temporal esperado hasta cerrar la parte 5.
```

#### 11B053 — líneas 1210-1216 (comentario)

```text
IMPORTANTE: el JSON de celulares solo guarda Tag/Prefijo/Celular/WSP_G/
Etiqueta/Fecha_ing/Vetado/Razón — NO Nombre/Jugador/Clan/Rango/etc.
Si un tag aparece SOLO en este JSON (no en Backup_Directorio.csv ni en
la hoja Directorio actual), crear una entrada nueva produciría una fila
"fantasma" con esos campos en blanco (el bug de "solo aparece el tag").
Por eso NUNCA se crea un tag nuevo aquí: el JSON solo complementa tags
que ya están en el mapa por venir del CSV de Directorio.
```

#### 11B054 — líneas 1218-1221 (comentario)

```text
Validar cada campo del JSON antes de aceptarlo:
El JSON pudo haber sido generado con índices erróneos sobre una hoja corrupta,
por lo que puede tener Prefijo='Sí', Celular='51', WSP(G)='Sí', etc. cruzados.
Prefijo válido: numérico (ej: '51', '1', '34')
```

#### 11B055 — líneas 1233-1247 (comentario)

```text
FIX (17-ago-2026, pedido usuario: "sigue trayendo valores numéricos
en Vetados/Directorio pese a la protección"). Causa: el FIX
(13-ago-2026) de más arriba en esta misma función solo agregó
_esSiNoOVacio() a la lectura de Permiso/Admin/Vetado desde
Backup_Directorio.csv (bloque de arriba) — este segundo bloque,
que COMPLEMENTA el mapa con ClanSystem_Backup_Celulares.json, ya
validaba wsp_g/etiqueta/razon (ver líneas de arriba) pero dejó
vetado con un chequeo simplemente truthy (`if (bkp.vetado)`), sin
pasar por el mismo filtro. Si ese JSON viene con columnas
corridas/cruzadas (mismo tipo de corrupción que motivó el fix
original), un valor numérico se colaba directo a map[t].vetado
por esta puerta, sin pasar por Backup_Directorio.csv en absoluto
— de ahí que reapareciera incluso con la protección del CSV ya
puesta. Ahora usa el mismo _esSiNoOVacio() que ya usan Permiso/
Admin/Vetado en el bloque de arriba.
```


### Ubicación: `_detectarMulticuentas`

#### 11B056 — líneas 1258-1260 (comentario)

```text
colIdxMap contiene índices 0-based para columnas leídas desde encabezados:
  celular, nombre, nomMulti
Si no se pasa, se usan los índices fijos de DC como respaldo.
```

#### 11B057 — líneas 1265-1280 (comentario)

```text
FIX (07-ago-2026): la agrupación por Celular solo consideraba tags
presentes en existingRows (Directorio físico, solo cuentas Activas),
csvMap (Backup_Directorio.csv, que también solo refleja las cuentas
Activas de la última corrida) y activosPorTag (API, solo Activos). Una
cuenta que deja de estar Activa en cualquier clan Terna y pasa a
Inactivos desaparece de las tres fuentes anteriores tras la corrida en
que se mueve — así, con el tiempo, dejaba de contarse para el
agrupamiento por Celular, y un jugador con una cuenta activa y varias
inactivas en el mismo Celular podía perder su marca de "Multicuenta"
(o, peor, la marca podía quedar en 'No' aunque otras cuentas del mismo
Celular siguieran existiendo, solo que inactivas). Se agrega
inactivosPorTag (mapa Tag -> {ic, extra}, ver
_leerInactivosParaReactivacion() más abajo en este archivo) como
fuente adicional, así el Celular de una cuenta inactiva se sigue
teniendo en cuenta para la evaluación aunque la cuenta ya no aparezca
en Directorio.
```


### Ubicación: `_construirFilasDirectorio`

#### 11B058 — líneas 1342-1347 (comentario)

```text
Cuentas ocultas manualmente (ver CFG.TAGS_OCULTOS en 01_Config_Global.gs): se
excluyen por completo, tanto de "Activas" como de "Inactivas". Esto es
necesario además del filtro en _fetchClanesBasico() (09_API_ClashRoyale.gs)
porque una cuenta que YA tenía fila en Directorio de una corrida
anterior (existingRows) o en el CSV de respaldo (csvMap) aparecería
igual como "Salió"/inactiva si no se quita también acá.
```

#### 11B059 — líneas 1358-1361 (comentario)

```text
F2 (29-sep-2026, pedido de la usuaria): inicio de la permanencia actual de cada Tag segun las
filas REALES de Guerra (ver _calcularInicioRachaGuerraPorTag()). Se calcula una sola vez por
corrida y nunca rompe la actualizacion del Directorio: si falla, queda vacio y Fecha_ing se
trata como siempre.
```

#### 11B060 — líneas 1370-1376 (comentario)

```text
Activos en el clan Vetado (CFG.VETADO_TAG) que NO son administradores:
estar activo en el clan Vetado no significa estar presente en un clan
Terna, así que estas cuentas NO deben ir a Directorio — se tratan como
si no estuvieran en ningún clan Terna y caen en Inactivos (ver más abajo,
donde se agregan a filasInactivasCompletas). Los administradores activos
en el clan Vetado SÍ permanecen en Directorio, igual que cualquier otro
admin.
```

#### 11B061 — líneas 1386-1391 (comentario)

```text
tagsReactivados: tags que estaban en Inactivos (sin datos "en vivo" ni
en Directorio ni en Backup_Directorio.csv) y que en esta corrida
aparecen de nuevo como Activos en un clan Terna. Ver
_reconstruirExistingDesdeInactivos()/_leerInactivosParaReactivacion()
más abajo en este archivo, y su uso en updateDirectorioSheet() para
retirarlos de Inactivos inmediatamente.
```

#### 11B062 — líneas 1398-1404 (comentario)

```text
FASE B4 (16/07/2026): Nivel/Nivel2/V_Guerra/Copas y los 17 campos de
_fallbackPlayerField() (ver _construirFila()) ya no se leen de
`existing` — se leen de playersParaFila (fila de la hoja Players,
formato PC, para este Tag). Caso reactivación (ver bloque de abajo):
esa cuenta no tiene fila en Players (los inactivos no-admin nunca se
escriben ahí), así que se sintetiza con _proyectarPlayers() a partir
del mismo existingParaFila (formato DC) reconstruido desde Inactivos.
```

#### 11B063 — líneas 1406-1415 (comentario)

```text
FIX (05-ago-2026): flag que indica si existingParaFila viene en
formato DC (60 columnas, ver _reconstruirExistingDesdeInactivos() más
abajo) en vez del formato físico IC (29 columnas) que usa
_leerDirectorioExistente(). _construirFila() necesita saberlo para
calcular los índices de lectura de campos manuales (Celular, Prefijo,
Vetado, Razón, WSP(G), Etiqueta, Admin, etc.) con el objeto correcto
(DC.* o IC.*) — antes siempre usaba IC.*, y al leer un array en
formato DC eso apuntaba a un campo totalmente distinto (ver bug
reportado: "el vetado salió solo de la lista" y "se borró el
celular"), porque DC e IC solo coinciden en las primeras 7 columnas.
```

#### 11B064 — líneas 1417-1421 (comentario)

```text
Reactivación: si la cuenta no tiene datos "en vivo" ni en Directorio
ni en su CSV de respaldo, pero SÍ estaba guardada en Inactivos, se
restauran sus datos desde ahí (Prefijo, Celular, Nom_Multi,
Comentario, Fecha_ing, links, etc.) en vez de arrancar la fila en
blanco.
```

#### 11B065 — líneas 1459-1480 (comentario)

```text
CAMBIO CRÍTICO (8/7/2026): Filtro de inactivos por Admin
Solo se incluyen inactivos en filasInactivas si son administradores (Admin='Sí').
Los inactivos NO-admin se preservan en el CSV (via syncDirectorioCSV) pero NO se
muestran en la hoja Directorio. Esto es para que después de Demoler, los inactivos
no se recarguen automáticamente — solo permanecen en la hoja Inactivos y en el CSV.
EXCEPCIÓN: Los administradores (Admin='Sí') siempre se muestran en Directorio,
sean activos o inactivos.

filasInactivasCompletas: TODOS los inactivos (admin y no-admin), fila completa
de 60 columnas. Se usa para poblar la hoja Inactivos con la misma estructura
que Directorio (ver llamada a _updateInactivos() en updateDirectorioSheet()),
ya que los no-admin nunca se escriben en la hoja Directorio y por lo tanto no
podrían rescatarse luego desde ahí. Aunque acá se incluyen también las filas
de admin (para no perder sus datos), _updateInactivos() (más abajo en este
archivo) filtra explícitamente cualquier fila con Admin='Sí' antes de
escribir la hoja Inactivos: los administradores NUNCA deben aparecer ahí,
sin importar si están Activos o Inactivos — siempre permanecen en Directorio.
Arranca con los activos-en-Vetado no-admin (ver bloque más arriba): estas
cuentas SÍ tienen datos "en vivo" (recién construidos con _construirFila,
Estado='Activo'), así que se agregan directamente aquí en vez de pasar
por _construirFilaInactiva() (pensada para cuentas que no aparecen en el
memberList actual de ningún clan Terna).
```

#### 11B066 — líneas 1553-1567 (docblock)

```text
_resolverFechaIngF2(tag, fechaIng, datoRacha)   // datoRacha = {fecha:Date, corte:boolean}
F2 (29-sep-2026, decision de la usuaria, pregunta 30 del consolidado): Fecha_ing es el INICIO DE LA
PERMANENCIA ACTUAL, tomado de la primera fila REAL de Guerra (Original o Corregido, nunca
Reconstruido) de la racha actual del Tag. Reglas:
  - Fecha_ing vacia            -> se completa con inicioRacha.
  - inicioRacha ANTERIOR a Fecha_ing -> se corrige hacia atras (caso Akuma L4D: 25/09 pasa a
    24/09 04:01:51; el desfase de un dia se corrige solo).
  - inicioRacha POSTERIOR a Fecha_ing -> solo se aplica si datoRacha.corte es true: el Tag tuvo un
    corte real (una semana de guerra sin ninguna fila real entre dos
    semanas con fila), o sea un reingreso; Fecha_ing pasa al inicio de la permanencia actual.
  - Sin datoRacha (Tag sin filas reales, o sin fila en la ultima semana) -> no cambia nada.
Cada cambio queda en el log. No escribe nada en Historial_I/S.
@return {Date|string} la Fecha_ing final (Date) o la recibida si no cambia.
```


### Ubicación: `_resolverFechaIngF2`

#### 11B067 — líneas 1584-1603 (docblock)

```text
_inicioRachaDesdeFilasGuerra_(filas)
Logica pura (sin hojas) de F2. `filas` = filas de Guerra en formato GC (Fecha ya como Date o
texto parseable). Devuelve { TAG: {fecha:Date, corte:boolean} }: primera fecha real de la racha actual
de cada Tag y si esa racha empezo tras un CORTE real (reingreso). Sin corte, `fecha` solo es la
primera fila de los datos disponibles y NO prueba el ingreso real (un veterano tiene filas desde
el primer dato); por eso F2 solo la usa para completar o corregir hacia atras, nunca hacia adelante.
Reglas (todas decididas por la usuaria, 28-sep-2026):
  - Solo cuentan filas Origen 'Original' o 'Corregido' (o vacio, filas antiguas). Las filas
    'Reconstruido' se ignoran por completo: ni dan fecha ni cuentan como presencia.
  - Universo de semanas = toda (Temporada, Semana) que tenga al menos una fila de cualquier
    Tag (incluidas las Reconstruido): son las semanas en que hubo guerra.
  - Una semana del universo sin ninguna fila real de un Tag, DESPUES de que ese Tag ya tenia
    filas, corta la racha (los ceros cuentan como presencia). Las semanas anteriores a su primera
    fila NO son corte: solo indican que no hay datos.
  - La racha actual empieza en la primera semana con fila real despues del ultimo corte; la fecha
    es la menor Fecha de sus filas reales en esa semana.
  - Si el Tag no tiene fila real en la ULTIMA semana del universo, no se devuelve nada (puede
    estar recien reingresado y sin fila todavia; no se adivina).
```


### Ubicación: `_inicioRachaDesdeFilasGuerra_`

#### 11B068 — líneas 1641-1646 (docblock)

```text
_calcularInicioRachaGuerraPorTag(ss)
Lee las filas de Guerra (hoja = temporada vigente; Backup_Guerra.csv = temporadas anteriores, la
hoja manda en las temporadas que ambas traen) y devuelve { TAG: {fecha, corte} } via
_inicioRachaDesdeFilasGuerra_(). Solo lectura.
```


### Ubicación: `_construirFila`

#### 11B069 — líneas 1687-1704 (comentario)

```text
FIX (05-ago-2026): `existing` puede venir en DOS formatos distintos:
  1) Formato físico IC (29 columnas) — caso normal, viene de
     _leerDirectorioExistente(sh)/existingRows. colIdxMap (resuelto por
     encabezado real de la hoja) es correcto para este caso.
  2) Formato DC (60 columnas) — caso de REACTIVACIÓN, viene de
     _reconstruirExistingDesdeInactivos() (ver _construirFilasDirectorio()
     más arriba, que pasa existingEsDC=true en ese caso).
ANTES, este bloque SIEMPRE calculaba los índices con colIdxMap/IC.*, sin
importar el formato real de `existing`. Como DC e IC solo coinciden en
sus primeras 7 columnas (NUM/TAG/NOMBRE/JUGADOR/NOM_MULTI/PRESTAMO/
MULTICUENTA) y divergen totalmente después, leer un array en formato DC
con índices de IC devolvía el campo equivocado: p.ej. iCelular=12
(IC.CELULAR-1) caía sobre DC.COPAS_MAX (posición 13 en DC), e
iVetado=19 (IC.VETADO-1) caía sobre DC.CL_LIGA (posición 20 en DC). Eso
causaba que, al reactivarse una cuenta, el Celular quedara "borrado"
(leído desde Copas_max) y el Vetado se perdiera solo (leído desde la
liga de Camino de Leyendas) — sin ninguna edición manual de por medio.
Ahora, si existingEsDC es true, se usan directamente los índices DC.*.
```

#### 11B070 — líneas 1721-1725 (comentario)

```text
FASE B4 (16/07/2026): Nivel/V_Guerra/Nivel2 y la detección de
corrupción de V_Guerra leían antes `existing[iNivel]`/`existing[iVGuerra]`/
`existing[iCopasEx]` — esos 4 campos ya no están físicamente en
Directorio (viven en Players). Se leen ahora de `playersRow` (fila de
Players para este Tag, formato PC — ver _construirFilasDirectorio()).
```

#### 11B071 — líneas 1730-1733 (comentario)

```text
V_Guerra: prioridad: 1) Players (existente), 2) CSV, 3) API players (si activa)
IMPORTANTE: si el valor de playersRow[PC.V_GUERRA] coincide con las copas del
miembro (o con la columna Copas de Players), es señal de corrupción previa
(el bug de índice fijo llenó V_Guerra con Copas). En ese caso se ignora y se usa CSV.
```

#### 11B072 — líneas 1758-1766 (comentario)

```text
--- Campos que SOLO vienen de /players ---
Prioridad: 1) valor ya guardado en la hoja Players (playersRow) 2) CSV
de respaldo (Backup_Directorio.csv — clave tras
demolerTodoElSpreadsheet(), donde no hay playersRow) 3) API /players, si
está activa y trae el dato para este tag. Antes esta sección SIEMPRE
dejaba estos 17 campos en blanco cuando no había playerData en el ciclo
actual (flag apagado, modo 'partial' sin este tag seleccionado, o
ejecución cortada antes de llegar a /players), pisando datos que ya
existían.
```

#### 11B073 — líneas 1796-1801 (comentario)

```text
esAdminTag: mismo criterio (existing primero, CSV como respaldo) que se
usa más abajo para la variable 'admin' (línea ~836), pero calculado acá
arriba porque este bloque de /players corre ANTES que esa asignación.
Se usa para que los admins SIEMPRE se actualicen con datos frescos de
/players, sin importar PLAYERS_API_ENABLED (reporte: "admins
desactualizados sin importar el estado del interruptor").
```

#### 11B074 — líneas 1815-1818 (comentario)

```text
--- Sobreescribir con datos frescos de /players SOLO cuando vienen
presentes en la respuesta. Si un campo no viene (badge ausente,
colección no devuelta, etc.), se conserva el valor de fallback ya
asignado arriba (existing/CSV) en vez de pisarlo con 0 o ''.
```

#### 11B075 — líneas 1868-1871 (comentario)

```text
Iniciales = Sí si el nombre empieza con el prefijo de clan.
Se verifican dos formas Unicode del mismo prefijo:
  ᴳ乂ᵀ  (U+1D33, U+4E42, U+1D40) - superíndices, forma usada en nombres de jugadores
  G乂T  (U+0047, U+4E42, U+0054) - letras normales, valor de CFG.PREFIJO_TERNA
```

#### 11B076 — líneas 1904-1916 (comentario)

```text
FIX (13-ago-2026, pedido del usuario): "está escribiendo valores
numéricos en columnas de texto en Directorio" — visto en Permiso,
Admin y Vetado (las 3 son dropdowns Sí/No/vacío, ver
setDataValidation(opsSiNo) más abajo en este archivo). Estas 3 líneas
leían `existing[...]` sin ninguna validación, a diferencia de WSP(G)/
Etiqueta (ya filtradas arriba con _esSiNo) y de Razón (ya filtrada con
esRazonValida()). Si alguna vez quedó un valor no-Sí/No en la celda
(dato corrupto heredado, o el mismo hueco que _getCsvDirMap() — ver
fix de la misma fecha ahí — dejaba pasar sin filtro desde el CSV),
ese valor se releía y reescribía en CADA corrida, sin autocorregirse
nunca. Ahora se descarta igual que ya se hacía con Razón, así la hoja
se autocorrige sola (vuelve a quedar vacío, listo para setearse a
mano de nuevo) en vez de seguir arrastrando el dato corrupto.
```

#### 11B077 — líneas 1919-1921 (comentario)

```text
Razón: solo se acepta si es una de las razones reconocidas. 'Sí'/'No'
(valor cruzado con la columna Vetado, dato corrupto heredado) se
descarta — así la hoja se autocorrige sola en cada ejecución.
```

#### 11B078 — líneas 1935-1945 (comentario)

```text
Admin/Cat_disp: si no hubo "existing" (ej. justo después de demolerTodoElSpreadsheet(),
donde NO hay fila previa en absoluto), caer al CSV de respaldo como fuente
alterna. Antes esto no existía y por eso esas columnas se perdían al
reconstruir desde cero, aunque el CSV sí las tuviera guardadas.
Cat_disp (12/07/2026): Directorio ya no tiene esta columna (ver
_setupDirectorio() en 02_Setup_Hojas.gs), así que "existing" NUNCA la trae —
catDisp depende siempre del CSV aquí (csvRow.cat_disp), que a su vez lo
toma de Administradores al respaldar (ver syncDirectorioCSV() en
05_Backup_CSV.gs). Esto solo alimenta el modelo en memoria (usado por
Inactivos); Administradores mismo preserva su propio Cat_disp por otra
vía (ver sincronizarAdministradores(), más abajo en este archivo).
```

#### 11B079 — líneas 1951-1955 (comentario)

```text
IMPORTANTE: prioridad = 1) valor ya en la hoja (existing, incluye ediciones
manuales recientes) 2) CSV de respaldo, SOLO si la hoja no tenía nada.
Antes el CSV sobrescribía incondicionalmente el valor de la hoja, por lo
que editar un teléfono a mano se revertía al valor viejo del CSV en el
siguiente runUpdate().
```

#### 11B080 — líneas 1971-1973 (comentario)

```text
RED DE SEGURIDAD — Celular (ver CELULARES_RESPALDO_MANUAL_ más arriba
en este archivo): último recurso, solo si existing y CSV llegaron
vacíos. Nunca pisa un celular que ya esté presente.
```

#### 11B081 — líneas 1979-2012 (comentario)

```text
RED DE SEGURIDAD — Vetado (pedido explícito del usuario: "el código no
tiene permitido quitar baneos por ningún motivo, en el script se indica
que eso solo se puede ejecutar de forma manual"). Si tanto `existing`
como el CSV de respaldo llegaron vacíos para este campo, pero el Tag
figura en el registro persistente de vetados confirmados (ver
_tagEstaVetadoConfirmado(), _updateVetados() se encarga de ir
registrando ahí a todo Tag que aparezca vetado), se restaura 'Sí' acá
mismo, ANTES de que la fila llegue a escribirse en la hoja, y se deja
un log bien visible — así un desbaneo automático nunca pasa
desapercibido ni silencioso.

FIX (18-ago-2026, pedido explícito del usuario: "llevo pidiendo esto 5
veces, Lucky #JR9J0JCQ9 sigue saliendo de Vetados sin que nadie lo
desvetee a mano, mientras que a otros tags vetados —p.ej. #RGCL8LGJC—
nunca les pasa"). CAUSA RAÍZ real de por qué esta red de seguridad NO
protegía a Lucky: el chequeo de abajo solo se disparaba cuando `vetado`
llegaba VACÍO desde existing/CSV (`!vetado`) — pero un 'No' EXPLÍCITO
(no vacío) es un valor válido para _esSiNo() más arriba, así que si en
algún momento la celda Vetado de ESTE tag en particular quedó con 'No'
en vez de vacía (dato heredado de un Backup_Directorio.csv viejo de
antes de que se le baneara, o un clic accidental sobre el dropdown de
la hoja física, que la próxima corrida vuelve a leer como "existing"),
`vetado` terminaba en 'No' — un string NO vacío — y `!vetado` daba
false: la red de seguridad nunca llegaba a evaluarse para ese caso,
dejando pasar el desbaneo silenciosamente como si fuera legítimo. Esto
explica por qué el bug era selectivo por Tag (afecta solo a cuentas
cuya celda quedó en 'No' explícito alguna vez) y no un fallo general de
la red de seguridad. Ahora un 'No' explícito se trata EXACTAMENTE igual
que un valor vacío para esta protección puntual: si el Tag sigue en el
registro de vetados confirmados, se restaura a 'Sí' de todas formas. La
ÚNICA forma de que un desbaneo (vacío o 'No') se respete de verdad
sigue siendo la misma de siempre y no cambia con este FIX: ejecutar
_olvidarVetadoConfirmado(tag) a mano desde el editor de Apps Script,
que saca al Tag del registro ANTES de que este chequeo vuelva a correr.
```

#### 11B082 — líneas 2026-2028 (comentario)

```text
IMPORTANTE: si no hay fecha de ingreso registrada, NO asignar now.
Asignar now causaría que el historial detecte un "Ingreso" falso en cada ejecución.
Solo se usa now si el jugador es genuinamente nuevo (no aparece en CSV ni en existing).
```

#### 11B083 — líneas 2035-2037 (comentario)

```text
F2 (29-sep-2026): completar Fecha_ing si esta vacia y corregirla con el inicio de la
permanencia actual segun Guerra (ver _resolverFechaIngF2()). Si no hay dato de Guerra
(inicioRachaGuerra vacio) no cambia nada. inicioRachaGuerra = {fecha, corte} de la racha del Tag.
```

#### 11B084 — líneas 2040-2042 (comentario)

```text
Fecha_Lim = plazo para ponerse las iniciales del clan. Si el jugador YA
ingresa con las iniciales puestas (empiezaConIniciales), no hay plazo
que cumplir — se deja vacía en vez de calcular Fecha_Ing + 7 días.
```

#### 11B085 — líneas 2064-2068 (comentario)

```text
IMPORTANTE: se guardan como NÚMERO (no string). El formato visual con
espacios ('### ### ### ###') solo se aplica de forma consistente en
Sheets cuando la celda es de tipo numérico; si se guarda como texto,
Sheets ignora el NumberFormat y muestra los dígitos sin agrupar — eso
causaba que el formato se viera bien en algunas filas y mal en otras.
```

#### 11B086 — líneas 2082-2084 (comentario)

```text
Préstamo: columna de edición MANUAL. Indica a quién se prestó esta cuenta.
NUNCA se genera automáticamente: solo se preserva tal como está en la hoja
o en el CSV de backup. La IA no sobreescribe este campo.
```

#### 11B087 — líneas 2092-2106 (comentario)

```text
========================================================================
PRESERVACIÓN DE LINKS Y DATOS EXISTENTES (bloque inerte desde la Fase B3)
Antes preservaba RoyaleAPI/Mazo/Mazo2/CWStats/Render/WSP leyendo
`existing[DC.CAMPO - 1]` cuando Admin = "No". Desde la Fase B3, ningún
consumidor lee fila[DC.ROYALE_API-1]/fila[DC.WSP-1]/etc. — _escribirLinks()
(11_DirectorioSheet.gs) genera esos 6 enlaces directo desde Tag/Prefijo/
Celular para cada fila, y resuelve la preservación de Mazo/Mazo2 leyendo
la hoja Links (oldDeckByTag/oldDeck2ByTag), no `fila`. Se deja el bloque
sin quitar (no se pidió eliminar funcionalidad), documentado como
inerte: escribe en fila[DC.ROYALE_API-1]/etc. pero nada aguas abajo
vuelve a leer esas posiciones. Nota histórica (bug preexistente, no
introducido por esta migración): DC no define MAZO/MAZO_2 (los campos
correctos son DC.DECK/DC.DECK_2), así que esas 2 líneas siempre
evaluaron `existing[NaN]` = undefined, desde antes de esta migración.
========================================================================
```

#### 11B088 — líneas 2127-2143 (docblock)

```text
_calcJugador
Calcula el campo Jugador para TODOS los jugadores.

Lógica:
  - Multicuenta (mismo celular, >1 tag):
      NomMulti (Nombre1 Nombre2 ...)   si hay NomMulti
      Nombre1 Nombre2 ...              si no hay NomMulti
  - Cuenta única con NomMulti definido:
      NomMulti (NombrePropio)
  - Cuenta única sin NomMulti:
      NombrePropio

IMPORTANTE: para cuentas únicas NUNCA usar data.nombres (que agrupa
todos los nombres del celular en el sistema). Usar solo el nombre
recibido como parámetro para evitar contaminación cruzada.
```


### Ubicación: `_escribirDirectorio`

#### 11B089 — líneas 2185-2199 (comentario)

```text
FIX (05-ago-2026): "letras blancas en cuentas no vetadas". clearContent()
borra VALORES, nunca formato. El color de letra blanco de Vetado lo pone
una regla de formato CONDICIONAL (ver _aplicarFormatoCondicionalDirectorio()
más abajo), que solo pinta las filas donde Vetado="Sí" — en el resto de
filas, la celda vuelve a mostrar su formato DE BASE. Si esa fila física
tuvo alguna vez un color de letra blanco fijado directo (edición manual
vieja, o una versión anterior del script que pintaba con setFontColor()
en vez de formato condicional), clearContent() nunca lo quita — y como
las filas se reordenan en cada corrida (ver sorts en
_construirFilasDirectorio()), esa letra blanca queda pegada a la
POSICIÓN de fila, no a la cuenta, y aparece en cualquier cuenta que caiga
ahí después, esté o no vetada. setFontColor(null) resetea el color de
letra al default (negro) antes de reescribir, así el blanco vuelve a
depender EXCLUSIVAMENTE de la regla condicional (por contenido, no por
posición).
```

#### 11B090 — líneas 2207-2217 (comentario)

```text
FIX (pedido usuario — tag #VJV0QGPJG, nombre "67" aparecía vacío en
Directorio aunque members/clans/currentriverrace de la API sí traen
"67"): cuando el nombre de una cuenta es puramente numérico, Sheets
interpreta el valor como NÚMERO (no como texto) al escribirlo con
setValues() en una celda con formato "Automático" — el mismo problema
clásico de Apps Script con IDs/códigos con forma de número. Un nombre
así deja de comportarse como el resto de los nombres (texto) y puede
no mostrarse. Se fuerza el formato de estas columnas de identidad a
texto plano ("@") ANTES de escribir los valores, para que cualquier
nombre —incluido uno 100% numérico como "67"— se guarde y se muestre
siempre como texto, igual que los demás.
```

#### 11B091 — líneas 2223-2241 (comentario)

```text
IMPORTANTE (rendimiento): a diferencia de la versión anterior, los
objetos Date NO se reemplazan por '' aquí. setValues() ya escribe
valores Date como fecha real de la celda en una sola llamada; lo único
que falta después es el NumberFormat de cada columna, que se aplica
UNA VEZ para todo el rango (ver más abajo) en vez de celda por celda.
Esto es lo que antes obligaba a updateDirectorioSheet() a hacer miles
de llamadas individuales a getRange() (una por celda por fila), que con
~900 filas consumía varios minutos y agotaba el límite de ejecución de
Apps Script antes de llegar a las hojas derivadas (Vistas, Índice, etc.).

FASE B2 (14/07/2026): antes, `f.slice(0, DIR_SHEET_COLS)` tomaba los
primeros 29 campos de "f" en ORDEN DC (N°..Cartas_torneos) — válido
cuando DIR_SHEET_COLS era 58 y ese orden coincidía con el layout físico
viejo de Directorio, pero ya NO corresponde al layout físico actual
(orden IC, ver _setupDirectorio() en 11_DirectorioSheet.gs). Se reemplaza por
_proyectarInactivos() (más abajo en este archivo): esa función ya
resuelve exactamente esta misma proyección DC -> 29 columnas físicas
para la hoja Inactivos, y Directorio comparte ese mismo layout, así que
la reutiliza directo en vez de duplicar la lógica.
```

#### 11B092 — líneas 2245-2253 (comentario)

```text
--- Formatos numéricos/fecha: una sola llamada por columna para TODO
el rango de filas, en vez de una llamada por fila.
FASE B2: estos 4 campos siguen físicamente en Directorio, pero su
posición real en la hoja es la de IC, no la de DC (coincidían por
casualidad cuando el layout físico era el viejo de 58 columnas — desde
que Directorio pasó a 29 columnas en orden IC, DC.CELULAR/DC.VIGENCIA/
DC.FECHA_ING/DC.FECHA_LIM ya no son la columna real; usarlos acá estaba
aplicando el formato a la columna equivocada, o directamente extendiendo
la hoja con columnas de más). ---
```

#### 11B093 — líneas 2256-2259 (comentario)

```text
FIX (28-sep-2026, pedido del usuario): Fecha_ing debe MOSTRAR tambien la hora. El valor ya se
guarda con hora (Date; el CSV la trae como "dd/MM/yyyy HH:mm:ss"): solo el formato de la
columna la ocultaba. Una fecha escrita a mano sin hora (ej. 24/09/2026) se ve como 00:00:00.
Fecha_lim sigue solo con fecha.
```

#### 11B094 — líneas 2263-2265 (comentario)

```text
Celdas Vigencia/Fecha_ing/Fecha_lim que NO traen una fecha válida
(string vacío u otro valor no-Date) quedan con el NumberFormat de fecha
aplicado pero mostrando vacío, igual que con _setDateCell() antes.
```

#### 11B095 — líneas 2267-2277 (comentario)

```text
TODAS las columnas numéricas de la hoja (formato visual #,##0 con
separador de miles; NO modifica el valor real de la celda, solo cómo
se muestra).
FASE B2: de la lista original de columnas numéricas, solo N°, Ranking,
Ranking_p e Inactividad(d) siguen físicamente en Directorio — el resto
(Nivel, Nivel2, Copas, Copas_max, V_Guerra, Victorias, Derrotas,
Batallas, Racha, Camino de leyendas, Victorias_3c, Max_vic_desafíos,
Torneos, Emotes, Banners, Cartas_desafíos, Cartas_torneos,
Donaciones_r/d) se movieron a la hoja Players: ese formato se aplica
donde se escriben esos campos (ver _escribirPlayers(), Fase B3, más
abajo). Se usa el índice físico real de Directorio (IC), no DC.
```

#### 11B096 — líneas 2283-2294 (comentario)

```text
FASE B2: la generación y escritura de los 6 enlaces (WSP, RoyaleAPI,
CWStats, Render, Mazo, Mazo2) se saca de esta función — esos 6 campos
ya no están físicamente en Directorio, viven en la hoja Links (ver
_setupLinks()/LC en 02_Setup_Hojas.gs). Antes, escribir con
sh.getRange(2, DC.WSP, ...) etc. sobre esta hoja (ya de 29 columnas)
terminaba extendiendo la hoja con columnas fantasma (30-48) con datos
mal ubicados, en vez de fallar visiblemente.
Implementado en Fase B3: ver _escribirLinks() más abajo, que reproduce
esta misma lógica (oldDeckByTag/oldDeck2ByTag, _construirCardInfoMap()/
_construirCards2PorTag(), _generarUrlMazoDesdeMapas()/
_generarUrlMazo2DesdeMapas()) pero escribiendo sobre LC.WSP/
LC.ROYALE_API/LC.CW_STATS/LC.RENDER/LC.DECK/LC.DECK_2 en Links.
```

#### 11B097 — líneas 2296-2305 (comentario)

```text
FIX (02-ago-2026): recién escrito el Nombre real de la cuenta (viene de
member.name de la API, no lo tipea un admin), Sheets puede haberle
vuelto a poner un enlace automático si "parece" un dominio (ver
limpiarLinksAccidentalesDeNombres() más abajo en este archivo para el
porqué). Antes esta limpieza SOLO corría como paso aparte de
PASOS_RUNALL/PASOS_RUNUPDATE, así que actualizar Directorio suelto
(ej. desde el menú "Actualizar Directorio", sin correr runAll()/
runUpdate() completo después) dejaba el enlace pegado indefinidamente.
Llamándolo acá, Directorio queda protegido sin importar cómo se lo
actualice.
```


### Ubicación: `_aplicarDropdownsDirectorio`

#### 11B098 — líneas 2326-2337 (docblock)

```text
_limpiarValidacionesFilasVaciasDirectorio(sh, numFilas)
FIX (04-ago-2026): quita las validaciones de datos (los desplegables
Sí/No, Razón, etc. que aplica _aplicarDropdownsDirectorio()) de cualquier
fila por debajo de la última fila con datos reales, hasta
sh.getMaxRows(). Antes nada hacía esto: _aplicarDropdownsDirectorio()
solo AGREGA validación sobre las filas con datos, nunca la QUITA de las
que quedaron vacías (p. ej. porque la hoja tenía más filas en una corrida
anterior), así que esas filas conservaban el desplegable para siempre
aunque estuvieran en blanco. Se llama justo después de escribir
Directorio, con el mismo numFilas que ya usa _aplicarDropdownsDirectorio().
```


### Ubicación: `_limpiarValidacionesFilasVaciasDirectorio`

#### 11B099 — líneas 2350-2355 (docblock)

```text
_buscarFilaPorTag(sh, tag)
Devuelve el número de fila (1-based) donde la columna Tag coincide con
el tag dado, o -1 si no se encuentra. Busca en toda la hoja (fila 2 en
adelante).
```


### Ubicación: `_buscarFilaPorTag`

#### 11B100 — líneas 2366-2383 (docblock)

```text
_aplicarFormatoCondicionalDirectorio(sh, numFilas, totalCols, colVetado, colEstado, colRango)
Aplica el formato condicional de color por Vetado/Estado/Rango. Los
últimos 4 parámetros son opcionales y default a los valores de Directorio
(DIR_SHEET_COLS, DC.VETADO/ESTADO/RANGO) — se usa así para Directorio.
Administradores (12/07/2026) tiene su propia estructura y posiciones (ver
AC en este archivo), así que se llama pasando sus propios valores
(ADMINISTRADORES_TOTAL_COLS, AC.VETADO, AC.ESTADO, AC.RANGO).

FIX (05-ago-2026): Links no tiene columnas Vetado ni Estado (solo 14 cols:
identidad + enlaces, ver LC en este archivo) — antes esta función nunca se
llamaba para Links por eso mismo, así que se quedaba sin ningún color.
Ahora colVetadoNum/colEstadoNum aceptan 0 explícito como "esta hoja no
tiene esa columna, omitir esa regla" (distinto de 'no pasado', que sigue
cayendo al default de Directorio vía el fallback ||). Links se llama con
(0, 0, LC.RANGO): sin colores de Vetado/Inactivo (no aplica, no tiene esos
datos), pero con los mismos colores por Rango que Directorio.
```


### Ubicación: `_aplicarFormatoCondicionalDirectorio`

#### 11B101 — líneas 2417-2432 (docblock)

```text
sincronizarEdicionAdminCatDisp(sh, row)
Maneja la edición manual de la columna Admin en Directorio o en
Administradores, espejándola (mismo Tag) hacia la otra hoja y, cuando se
marca Admin = "Sí", propagando esa marca a TODAS las cuentas del
Directorio que comparten el mismo número de Celular (multicuentas del
mismo dueño). Se debe llamar desde onEditTrigger() cuando la hoja editada
es Directorio o Administradores y la columna editada es Admin o Cat_disp.

Cat_disp (12/07/2026): YA NO se sincroniza aquí. Esa columna ya no existe
en Directorio (ver _setupDirectorio() en 02_Setup_Hojas.gs) — solo vive en
Administradores — así que no hay ninguna celda hacia/desde la cual
reflejarla. Si el trigger dispara por una edición de Cat_disp en
Administradores, esta función simplemente no tiene nada que mirror (el
valor se queda solo ahí, que es justamente lo esperado).
```


### Ubicación: `sincronizarEdicionAdminCatDisp`

#### 11B102 — líneas 2445-2456 (comentario)

```text
Admin (12/07/2026): Directorio y Administradores ya NO comparten
posiciones de columna (Administradores tiene su propia estructura
reducida, ver AC en este archivo) — hay que usar el índice correcto
según de qué hoja se trate en cada lado.
Fase 11 (17/07/2026) — FIX: shDir es siempre la hoja FÍSICA de Directorio
(29 columnas, orden IC), nunca el formato reconstruido de 60 columnas
(orden DC). Antes, cuando el lado "Directorio" correspondía a shDir, se
usaba DC.ADMIN (col. física 58) en vez de IC.ADMIN (19) — tanto para
LEER (colAdminSh, esDirectorio=true) como para ESCRIBIR (colAdminOtro,
esDirectorio=false, es decir edición hecha desde Administradores) — la
segunda mitad del bug no estaba explícitamente en el reporte pero es el
mismo problema espejado, así que se corrige igual.
```

#### 11B103 — líneas 2467-2471 (comentario)

```text
2. Si se marcó Admin = "Sí", propagar a todas las cuentas del Directorio
   que compartan el mismo Celular (multicuentas): Admin="Sí" siempre, y
   Nom_Multi solo si está vacío (Fase 11, pedido nuevo — no pisar un
   Nom_Multi ya cargado a mano). Reconstruye Administradores + dropdowns
   para que reflejen los cambios.
```

#### 11B104 — líneas 2473-2475 (comentario)

```text
La fila con el Celular de origen: si la edición fue en Directorio, es
"row" directamente; si fue en Administradores, es la fila espejo en
Directorio (filaOtro) — que puede no existir todavía (-1).
```

#### 11B105 — líneas 2515-2522 (docblock)

```text
_aplicarCatDispMultiSelect(sh, categorias)
Rellena con "todas las categorías" (texto separado por comas, sin
validación de lista) únicamente las filas con Admin = "Sí" cuya celda
Cat_disp esté vacía. No toca filas que ya tengan algún valor (manual).
Uso exclusivo de Administradores (único caller: actualizarDropdownCatDisp()),
por eso usa directamente AC.ADMIN/AC.CAT_DISP (12/07/2026).
```


### Ubicación: `_aplicarCatDispMultiSelect`

#### 11B106 — líneas 2527-2530 (comentario)

```text
Quitar cualquier validación de lista/dropdown que haya quedado de una
versión anterior del script — Cat_disp ahora es texto libre, y una
validación de una sola opción bloqueaba escribir varias categorías
separadas por coma.
```

#### 11B107 — líneas 2546-2557 (docblock)

```text
_aplicarFuncionesMultiSelect(sh, funciones)
FASE 4 — WEB (arquitectura-web-familia-terna.md, Sección 7.3.1). Análoga
exacta a _aplicarCatDispMultiSelect() de acá arriba: rellena con "todas
las funciones disponibles" (texto separado por comas, sin validación de
lista de una sola opción — un admin puede tener varias funciones a la
vez) únicamente las filas con Admin = "Sí" cuya celda Funciones esté
vacía. No toca filas que ya tengan cualquier valor (edición manual,
incluida una que haya quitado una función a propósito).
Uso exclusivo de Administradores (único caller: actualizarDropdownCatDisp()),
por eso usa directamente AC.ADMIN/AC.FUNCIONES.
```


### Ubicación: `_aplicarFuncionesMultiSelect`

#### 11B108 — líneas 2562-2565 (comentario)

```text
Quitar cualquier validación de lista/dropdown que haya quedado de una
versión anterior del script — Funciones es texto libre, y una
validación de una sola opción bloquearía tener varias funciones a la
vez separadas por coma.
```


### Ubicación: `_aplicarDropdownsAdministradores`

#### 11B109 — líneas 2589-2602 (docblock)

```text
_obtenerNomMultisDistintos()
FASE 4 — WEB (arquitectura-web-familia-terna.md, Sección 7.4, Paso 2):
lista de todos los Nom_Multi distintos ya usados, para poblar el
`<select>` de Nom_Multi (con "Ninguna de las anteriores" agregado aparte
por el frontend) al completar el registro de un miembro nuevo — así el
admin puede reutilizar el Nom_Multi de una multicuenta ya existente en
vez de tipearlo de memoria y arriesgar una variante distinta (typos,
mayúsculas) que rompería el agrupamiento por multicuenta.
Recorre Directorio e Inactivos (ambas comparten el layout físico IC, ver
IC/DIR_SHEET_COLS/INACTIVOS_TOTAL_COLS más arriba en este archivo) — un
Nom_Multi puede existir solo en una cuenta hoy inactiva.
@returns {string[]} Nom_Multi únicos, no vacíos, orden alfabético.
```


### Ubicación: `_obtenerNomMultisDistintos`

#### 11B110 — líneas 2625-2660 (docblock)

```text
_guardarRegistroNuevoMiembro(datos)
datos = { tag, prefijo, celular, nomMulti, prestamo }
Usada por el flujo "Registrar miembro nuevo" del bot de WhatsApp (ver
44_BotWhatsApp.gs, exclusivo de administradores). Escribe (o actualiza,
si el tag ya tenía fila) SOLO estos 4 campos editables en Directorio:
Prefijo, Celular, Nom_Multi y Préstamo — el resto de columnas se deja tal
cual (si la fila ya existía) o vacío (si es fila nueva).

Esto es un "pre-registro": estos 4 campos son justamente los que
_construirFila()/_construirFilaInactiva() (más abajo en este archivo)
SIEMPRE preservan desde la fila "existing" en cada updateDirectorioSheet().
Así, apenas el jugador aparezca en el memberList de un clan Terna (vía
API), su fila se arma automáticamente combinando estos datos manuales con
el resto de la info que sí viene de la API (Nombre, Clan, Rango, stats).
Mientras tanto, si el tag no está en ningún clan Terna todavía, la fila
queda como "Inactivo" hasta que updateDirectorioSheet() la reconcilie.

Devuelve { ok: true, esNueva } o { ok: false, error }.

FIX (30-ago-2026, pedido de revisión): esta función busca la fila por
Tag y RECIÉN DESPUÉS escribe (lectura-modificación-escritura), sin
ningún lock — mismo problema de fondo que los endpoints que reescriben
un CSV completo (ver _aplicarCorreccionesGuerra(),
18_CorreccionGuerra.gs), aunque acá el "documento" sea la hoja
Directorio en vez de un CSV. Si dos admins guardan la gestión de dos
miembros distintos casi al mismo tiempo esto no sería grave (cada uno
escribe una fila distinta), pero si guardan el MISMO tag casi
simultáneamente (dos pestañas del mismo admin, por ejemplo), la segunda
escritura podría no ver todavía la fila que la primera recién creó y
terminar creando una fila DUPLICADA para el mismo Tag en vez de
actualizar la existente. Se envuelve el ciclo completo (buscar fila →
decidir actualizar/crear → escribir) con LockService.getScriptLock(),
mismo mecanismo que ya usa el proyecto en otras partes (ver
_adquirirLockEjecucion(), 00_Main.gs).
```


### Ubicación: `_guardarRegistroNuevoMiembroImpl`

#### 11B111 — líneas 2708-2711 (comentario)

```text
Fila nueva: se agrega al final, con Estado="Inactivo" (el jugador
todavía no aparece en el memberList de ningún clan Terna vía API — en
cuanto ingrese de verdad, la siguiente updateDirectorioSheet() la
reconoce como Activa y combina estos datos con los de la API).
```

#### 11B112 — líneas 2725-2732 (docblock)

```text
_aplicarBordesComentarios()  (Fase 7 del plan de cambios)
Bordes grises en TODAS las filas con datos de Comentarios. Se llama tras
cada actualización (runUpdate/runAll) para no depender del trigger diario
de aplicarFormatoGlobal() (que solo corre dentro de runAll()/runFormato(),
dejando sin borde cualquier comentario agregado durante el día por
runUpdate()).
```


### Ubicación: `_aplicarBordesComentarios`

#### 11B113 — líneas 2749-2771 (comentario)

```text
=============================================================================
LIMPIEZA DE ENLACES ACCIDENTALES EN NOMBRES
FASE (01/08/2026): reportado con el jugador "drax_tv.sv" — el origen real
es la columna "Nombre" (nombre de cuenta DEL JUEGO, member.name que
devuelve la API de Clash Royale — ver fila[DC.NOMBRE - 1] = member.name
más arriba en este archivo, y el equivalente en Guerra/T_Asistencia). No
es un valor tecleado por un admin: el jugador eligió ese nombre dentro
del juego. Google Sheets detecta automáticamente texto con forma de
dominio (".sv" es un TLD válido, El Salvador) y lo convierte en enlace
clicable, sin importar que el valor haya llegado por Apps Script
(setValue(), como en este caso) en vez de tecleado a mano. Si alguna vez
ese mismo texto se copia a Nom_Multi (ej. un admin lo pega ahí porque el
nombre del juego "no es legible", ver CFG en 01_Config_Global.gs), la falla se
replicaría también en Nom_Multi — por eso la limpieza de abajo cubre las
4 columnas (Nombre, Nombre Jugador, Jugador, Nom_Multi), no solo Nombre.
Como estas columnas se replican en varias hojas derivadas de Directorio
(incluida Guerra, que tiene su propia columna "Nombre"), el enlace
accidental terminó apareciendo en todas ellas — y de ahí se coló también
en los mensajes de WhatsApp que citan ese nombre (ver
_postWhatsApp()/_evitarAutoLinkWsp(), 44_BotWhatsApp.gs, que ahora rompe
el mismo patrón de dominio en el texto saliente para que WhatsApp tampoco
lo autoenlace).
=============================================================================
```

#### 11B114 — líneas 2773-2805 (docblock)

```text
_limpiarLinksAccidentalesEnHoja(sh)
FIX (02-ago-2026): lógica de limpieza de UNA sola hoja, extraída de
limpiarLinksAccidentalesDeNombres() para poder llamarla puntualmente
justo después de escribir Directorio (ver _escribirDirectorio() más
arriba), sin depender de que el paso general de PASOS_RUNALL/
PASOS_RUNUPDATE llegue a ejecutarse más adelante en la misma corrida.

Motivo del fix: se detectó que si alguien corre updateDirectorioSheet()
(o el ítem de menú "Actualizar Directorio") SUELTO, fuera de runAll()/
runUpdate(), el enlace accidental que Sheets le vuelve a poner al nombre
de la cuenta (member.name de la API) queda pegado indefinidamente, porque
nadie vuelve a correr limpiarLinksAccidentalesDeNombres() hasta la
siguiente corrida completa. Con esta función llamándose al final de
_escribirDirectorio(), Directorio queda protegido sin importar CÓMO se
lo actualice (runAll, runUpdate, o el menú suelto).

Misma lógica exacta que el bloque interno de limpiarLinksAccidentalesDeNombres()
(mismas 4 columnas buscadas por encabezado, mismo criterio de "cualquier
enlace ahí es accidental"), pero acotada a la hoja `sh` recibida.

FIX (02-ago-2026): se agrega el parámetro opcional `headerRow` porque
Control tiene sus encabezados fijos en la FILA 3 (títulos combinados en
1-2, ver _pintarEncabezadosControl(), 02_Setup_Hojas.gs), no en la fila 1 como
el resto de las hojas — con el valor por defecto (1), esta función (y por
lo tanto también la barrida general limpiarLinksAccidentalesDeNombres())
nunca llegaba a revisar Control en absoluto.

@param {Sheet} sh
@param {number} [headerRow=1] - Fila donde están los encabezados; los
  datos se asumen desde headerRow+1 en adelante.
@returns {Array} resumen de esta hoja: [{ hoja, columna, corregidas }, ...]
```


### Ubicación: `_limpiarLinksAccidentalesEnHoja`

#### 11B115 — líneas 2809-2821 (comentario)

```text
FIX (09-ago-2026): se agrega 'clan' a la lista — pedido explícito del
usuario, reportado en la hoja "Nuevos": el bloque de historial de
RoyaleAPI (columna "Clan" repetida una vez por fecha, ver
14_Nuevos_RoyaleAPI.gs) puede traer el nombre de un clan RIVAL con
forma de dominio (ej. "LAMPA.COM", visible en el propio historial de
RoyaleAPI del jugador) — Sheets lo autoenlaza exactamente igual que ya
hacía con nombres de jugador tipo "drax_tv.sv" (ver FIX 02-ago-2026 más
abajo), pero la columna "Clan" nunca estaba en esta lista, así que
nunca se limpiaba. Como esta función ya recorre TODAS las columnas
cuyo encabezado coincida (sin importar cuántas veces se repita ese
encabezado en la hoja), agregar 'clan' acá cubre de una sola vez tanto
la columna fija "Clan" de Nuevos/Directorio como los 4+ bloques de
fecha (uno por cada semana) que repiten el encabezado "Clan".
```

#### 11B116 — líneas 2855-2870 (comentario)

```text
FIX (02/08/2026): reportado que el log registraba "N enlace(s)
accidental(es) quitado(s)" pero el link SEGUÍA viéndose en Sheets
(caso "drax_tv.sv" en Directorio.Nombre), incluso corriendo esta
función sola y de forma aislada (sin cortes de tiempo de por medio).
Causa real: el detector de "texto con forma de dominio" de Sheets
NO depende de si Apps Script puso un link explícito — depende de
que el CONTENIDO del texto siga pareciendo un dominio. Al escribir
setText(rt.getText()) con el mismo texto plano ("drax_tv.sv"),
Sheets lo vuelve a reconocer como dominio y lo re-enlaza por su
cuenta, deshaciendo el fix casi al instante — de ahí el desfase
"el log dice que se arregló, pero en Sheets sigue el link".

Solución: romper el patrón "palabra.tld" insertando un espacio de
ancho cero (U+200B, invisible) justo antes del último punto. Es
visualmente idéntico (no se renderiza), pero Sheets ya no lo
reconoce como dominio y no vuelve a auto-enlazarlo.
```

#### 11B117 — líneas 2883-2887 (comentario)

```text
flush() adicional: confirma el cambio de inmediato, antes de que la
corrida siga con pasos pesados que en el pasado ya han superado el
límite de 6 minutos de la plataforma (ver PASOS_RUNALL, 00_Main.gs).
No era la causa raíz de este bug puntual, pero es buena práctica
igual y no tiene costo real.
```

#### 11B118 — líneas 2897-2917 (comentario)

```text
=============================================================================
FASE B1 (14/07/2026) — Reconstrucción de filas de Directorio en formato DC
completo (60 columnas) a partir de la hoja física (29 columnas, formato IC)
+ Players (31 columnas, formato PC) + Links (14 columnas, formato LC).

Reemplaza las lecturas directas `shDir.getRange(2, 1, n, DIR_TOTAL_COLS)`
que updateVistasDerivadas() y (en su momento) el paso del documento "Mazos personalizados", ya eliminado, hacían
antes de esta fase: esa lectura pedía 60 columnas directo de la hoja
física Directorio, que desde la fase anterior (Fase 4) solo tiene 29
columnas reales en el orden de IC — el resultado ya no correspondía al
formato DC que el resto de cada función asumía.

IMPORTANTE: hasta que la Fase B3 (población de Players/Links) esté
implementada, `_leerHojaComoMapaPorTag()` para Players/Links devolverá un
mapa vacío (esas hojas todavía no se llenan en ninguna corrida), así que
los 23 campos de estadísticas y los 6 de enlaces quedarán vacíos en el
resultado de `_leerDirectorioFisicoComoDC()` — es el comportamiento
esperado en este punto de la migración, no un bug de esta fase. En cuanto
Players/Links tengan datos, estas mismas funciones los van a traer sin
más cambios.
=============================================================================
```

#### 11B119 — líneas 2919-2924 (docblock)

```text
_leerHojaComoMapaPorTag(ss, nombreHoja, tagColIdx, totalCols)
Lee una hoja completa (desde la fila 2) y arma un mapa Tag -> fila (array
de totalCols posiciones, 0-based). Genérica: la usan _leerDirectorioFisicoComoDC()
(más abajo) para leer Players y Links por Tag.
```


### Ubicación: `_leerHojaComoMapaPorTag`

#### 11B120 — líneas 2937-2949 (docblock)

```text
_leerFilaHojaPorTag(ss, nombreHoja, tagColIdx, totalCols, tag)
Fase C3 (16/07/2026): versión liviana de _leerHojaComoMapaPorTag() para
cuando solo se necesita UNA fila puntual (ej. el bot de WhatsApp
respondiendo a un Tag específico), en vez de traer y mapear la hoja
completa. Usa createTextFinder() sobre la columna de Tag (más rápido que
getValues() de toda la hoja para consultas de 1 Tag).
Mismos parámetros que _leerHojaComoMapaPorTag (tagColIdx 0-based, para
mantener la misma firma), pero además recibe el `tag` buscado. El match es
exacto (matchEntireCell) e insensible a mayúsculas (Tag ya se guarda en
mayúsculas, pero por si acaso). Devuelve la fila (array de totalCols
posiciones) o null si no hay match.
```


### Ubicación: `_leerFilaHojaPorTag`

#### 11B121 — líneas 2965-2995 (docblock)

```text
_reconstruirFilaDCDesdeFisico(filaDirectorio, playersRow, linksRow)
Reconstruye una fila completa de 60 columnas (formato DC) a partir de:
 - filaDirectorio: fila física de Directorio (29 columnas, formato IC).
 - playersRow: fila física de Players (31 columnas, formato PC) o
   undefined si esa cuenta todavía no tiene fila en Players.
 - linksRow: fila física de Links (14 columnas, formato LC) o undefined.
Es la función inversa de la proyección DC->IC que ya usa
_proyectarInactivos() más arriba: primero copia los 29 campos que siguen
en Directorio (por nombre de campo, vía IC), y después completa los 23
campos de Players y los 6 de Links si están disponibles. Los campos de
identidad de Players/Links (Num/Tag/Nombre/Nom_Multi/Préstamo/Clan/
ClanTag/Rango) se saltan porque ya llegaron desde Directorio.

FIX (17-ago-2026, mismo bug reportado el 13-ago-2026 — "valores numéricos
en columnas de texto en Directorio", visto en Permiso/Admin/Vetado): esta
función copiaba filaDirectorio[IC[campo]-1] tal cual, sin ningún filtro,
a diferencia de _getCsvDirMap()/_construirFila() (ya parchadas el
13-ago-2026 con _esSiNoOVacio()/_esSiNo()). Es la ÚNICA función que arma
la fila de 60 columnas (formato DC) para syncDirectorioCSV()/
syncInactivosCSV() (Backup_Directorio.csv y Backup_Inactivos.csv) y para
_construirFilaInactiva() (admin inactivo con fila física existente). Si
la celda física de Permiso/Admin/Vetado tenía un valor corrupto heredado
(p.ej. el número de liga de Camino de Leyendas, cruzado por el bug de
índices DC/IC ya corregido en _construirFila()), ese número pasaba
intacto hacia el CSV — y de ahí, en cascada, hacia cualquier restauración
posterior (incluida _importarInactivosDesdeCSV(), 05_Backup_CSV.gs, también
parcheada en esta misma fecha). Razón usa esRazonValida() (mismo criterio
que el resto del archivo); Permiso/Admin/Vetado usan _esSiNoOVacio()
(acepta 'Sí'/'Si'/'No'/vacío, descarta cualquier otra cosa).
```


### Ubicación: `_reconstruirFilaDCDesdeFisico`

#### 11B122 — líneas 3023-3047 (docblock)

```text
_leerDirectorioFisicoComoDC(ss)
Lee la hoja física Directorio (29 columnas, formato IC) + Players (31,
formato PC) + Links (14, formato LC), y devuelve un array de filas en
formato DC (60 columnas), una por cada fila de Directorio, en el mismo
orden físico. Punto de entrada único usado por updateVistasDerivadas() y
el paso (ya eliminado) del documento "Mazos personalizados" para seguir trabajando con el modelo
completo de 60 columnas sin leer la hoja física pidiendo DIR_TOTAL_COLS
(que ya no es su ancho real).

FIX (1-sep-2026, pedido usuario — "las celdas no están vacías, tendría
que generar algo como https://royaleapi.com/player/2GG8PJ8GC/"): los 6
campos de enlaces de Links (WSP, RoyaleAPI, CWStats, Render, Mazo, Mazo2)
son celdas de texto enriquecido (ver makeLink(), 01_Config_Global.gs) cuyo
texto VISIBLE es "Link"/"Mazos" — la URL real solo vive en el enlace de
la celda, no en su texto. Leerlos con _leerHojaComoMapaPorTag() (como
antes) devolvía literalmente "Link"/"Mazos" en fila[DC.ROYALE_API-1] y
compañía, y como esos textos no empiezan con "http",
_webUrlPerfilExterno() (37_Web_API.gs) terminaba armando URLs rotas del
tipo ".../player/LINK" — el frontend las filtraba en silencio
(urlValida() en common.js), así que el botón simplemente no aparecía,
sin ningún error visible en ningún lado. Se reemplaza la lectura de
Links por _leerLinksComoMapaPorTagConUrls() (12_Players_Links.gs),
que sí extrae la URL real de esas 6 columnas.
```


---


# Archivo 12_Players_Links.gs

Vistas derivadas del Directorio: hojas Players y Links (`_escribirPlayers()`, `_escribirLinks()`, proyecciones y lectores de enlaces). Los IDs de bloque llevan prefijo `12`.


## Índice de bloques movidos

| ID | Líneas orig. | Ubicación | Resumen |
|---|---|---|---|
| 12B001 | 8-15 | `Cabecera del archivo` | FASE B3 (16/07/2026) — Población de las hojas Players y Links. |
| 12B002 | 17-25 | `Cabecera del archivo` | _proyectarPlayers(r) |
| 12B003 | 34-42 | `_proyectarPlayers` | _escribirPlayers(ss, filas) |
| 12B004 | 53-56 | `_escribirPlayers` | Limpiar bordes de todo el rango de datos posible antes de reponerlos, |
| 12B005 | 66-72 | `_escribirPlayers` | Formato condicional por Rango, igual criterio de colores que Directorio. |
| 12B006 | 88-97 | `_escribirPlayers` | _aplicarFormatoCondicionalPlayers(sh, numFilas, totalCols, colRangoNum) |
| 12B007 | 115-120 | `_aplicarFormatoCondicionalPlayers` | _proyectarLinksIdentidad(r) |
| 12B008 | 131-144 | `_proyectarLinksIdentidad` | _escribirLinks(ss, filas) |
| 12B009 | 201-207 | `_escribirLinks` | FIX (05-ago-2026): Links nunca tenía formato condicional (a diferencia |
| 12B010 | 211-225 | `_escribirLinks` | _leerLinksRichTextPorTag(ss, camposLC) |
| 12B011 | 248-268 | `_leerLinksRichTextPorTag` | _leerLinksComoMapaPorTagConUrls(ss) |

---

## Detalle (texto original, sin cambios)

Cada bloque se copió tal cual estaba en el `.gs` (sin los `//`). Los números de línea son los del archivo ANTES de la limpieza.


### Ubicación: `Cabecera del archivo`

#### 12B001 — líneas 8-15 (comentario)

```text
=============================================================================
FASE B3 (16/07/2026) — Población de las hojas Players y Links.
Se reescriben COMPLETAS en cada corrida (mismo criterio que Directorio),
a partir de "filas" (el modelo completo de 60 columnas, formato DC, que
ya arma _construirFilasDirectorio() y usa _escribirDirectorio()). Se
llaman desde updateDirectorioSheet(), justo después de
_escribirDirectorio().
=============================================================================
```

#### 12B002 — líneas 17-25 (docblock)

```text
_proyectarPlayers(r)
Proyecta una fila completa de Directorio (formato DC, 60 columnas en
memoria) a las 31 columnas propias de la hoja Players (formato PC, ver
_setupPlayers() en 11_DirectorioSheet.gs): los 8 campos de identidad + los 23
campos de estadísticas de la API que ya no están físicamente en
Directorio. Todos los campos de PC existen en DC con el mismo nombre, así
que la proyección es directa por nombre de campo.
```


### Ubicación: `_proyectarPlayers`

#### 12B003 — líneas 34-42 (docblock)

```text
_escribirPlayers(ss, filas)
Reescribe por completo la hoja Players a partir de "filas" (60 columnas,
formato DC). Aplica formato numérico (#,##0) a los 21 campos de
estadísticas correspondientes — ese formato se movió acá desde
_escribirDirectorio() (Fase B2), porque esos campos ya no están
físicamente en Directorio. Antigüedad y Arena quedan sin formato numérico
(igual que en la lista original de Directorio: son texto, no número).
```


### Ubicación: `_escribirPlayers`

#### 12B004 — líneas 53-56 (comentario)

```text
Limpiar bordes de todo el rango de datos posible antes de reponerlos,
para que no queden bordes huérfanos en filas que ya no tienen datos
(mismo criterio que el resto de hojas del proyecto: borrar y
reestablecer en cada corrida). Fase 6 del plan de cambios.
```

#### 12B005 — líneas 66-72 (comentario)

```text
Formato condicional por Rango, igual criterio de colores que Directorio.
Players NO tiene columnas Vetado/Estado propias (ver objeto PC arriba),
así que aquí solo se colorea por Rango — no se reutiliza
_aplicarFormatoCondicionalDirectorio() porque esa función siempre
necesita una columna Vetado/Estado real y, al no existir en Players,
haría fallback a los índices de otra hoja (IC), coloreando por una
columna que no corresponde.
```

#### 12B006 — líneas 88-97 (docblock)

```text
_aplicarFormatoCondicionalPlayers(sh, numFilas, totalCols, colRangoNum)
Formato condicional dedicado para la hoja Players (Fase 6 del plan de
cambios): colorea por Rango con el mismo criterio de colores que
Directorio/Administradores (CFG.COLORES.LIDER_BG, etc.), pero SIN las
reglas de Vetado/Estado, porque Players no tiene esas columnas (ver
objeto PC). Si en el futuro Players llegara a tener columnas propias de
Vetado/Estado, esta función se puede reemplazar por una llamada directa a
_aplicarFormatoCondicionalDirectorio() con los índices reales.
```


### Ubicación: `_aplicarFormatoCondicionalPlayers`

#### 12B007 — líneas 115-120 (docblock)

```text
_proyectarLinksIdentidad(r)
Proyecta los 8 campos de identidad de una fila de Directorio (formato DC)
a las primeras 8 columnas de Links (formato LC). Los 6 campos de enlaces
(columnas 9-14) son RichText y se generan aparte — ver _escribirLinks().
```


### Ubicación: `_proyectarLinksIdentidad`

#### 12B008 — líneas 131-144 (docblock)

```text
_escribirLinks(ss, filas)
Reescribe por completo la hoja Links a partir de "filas" (60 columnas,
formato DC). Reproduce, tal cual, la lógica de generación de enlaces que
antes vivía en _escribirDirectorio() (movida de ahí en la Fase B2): WSP
(desde Prefijo+Celular), RoyaleAPI, CWStats y Render (URLs fijas por Tag),
y Mazo/Mazo2 (calculados desde Cards/Cards_2 vía _construirCardInfoMap()/
_construirCards2PorTag()/_generarUrlMazoDesdeMapas()/
_generarUrlMazo2DesdeMapas(), ver 31_Cards_Mazos.gs). Igual que antes: si no
hay datos NUEVOS de Cards_2 para un tag en esta corrida, se conserva el
Mazo/Mazo2 que ya había en la celda (oldDeckByTag/oldDeck2ByTag,
capturados antes de limpiar la hoja) en vez de reemplazarlo por un link
vacío.
```


### Ubicación: `_escribirLinks`

#### 12B009 — líneas 201-207 (comentario)

```text
FIX (05-ago-2026): Links nunca tenía formato condicional (a diferencia
de Directorio y Administradores, que sí llaman a esta función). Links no
tiene columnas Vetado/Estado (ver LC más arriba: 14 cols, sin esos
campos), así que se pasa 0 en esas dos posiciones para omitir esas
reglas (ver fix de _aplicarFormatoCondicionalDirectorio más abajo en
este archivo) y se aplican solo los colores por Rango, igual que en
Directorio.
```

#### 12B010 — líneas 211-225 (docblock)

```text
_leerLinksRichTextPorTag(ss, camposLC)
Lee, para los campos LC indicados (ej. ['CW_STATS','ROYALE_API','DECK',
'DECK_2']), los valores RichText de la hoja Links y arma un mapa
Tag -> { CAMPO: richTextValue, ... }.

ESTADO (07-oct-2026): ya no tiene llamadores. Su único usuario era
el paso del documento "Mazos personalizados" (documento y paso eliminados,
ver pedido del usuario del 07-oct-2026). Se CONSERVA como helper global por
decisión del usuario: es la única función del proyecto que devuelve los
RichTextValue originales de Links (texto visible + enlace); las demás
(_leerLinksComoMapaPorTagConUrls() más abajo y _extraerValoresConLinksReales()
en 05_Backup_CSV.gs) devuelven solo la URL como texto. Útil si algún
documento o salida futura necesita reescribir el enlace tal cual.
```


### Ubicación: `_leerLinksRichTextPorTag`

#### 12B011 — líneas 248-268 (docblock)

```text
_leerLinksComoMapaPorTagConUrls(ss)
FIX (1-sep-2026, pedido usuario — "las celdas no están vacías, tendría
que generar algo como https://royaleapi.com/player/2GG8PJ8GC/ y
https://cwstats.com/player/2GG8PJ8GC/"): igual que
_leerHojaComoMapaPorTag(ss, CFG.SHEETS.LINKS, LC.TAG-1, LINKS_TOTAL_COLS)
(11_DirectorioSheet.gs), pero para los 6 campos que son enlaces de texto
enriquecido (WSP, RoyaleAPI, CWStats, Render, Mazo, Mazo2 — ver
makeLink() en 01_Config_Global.gs y _escribirLinks() más arriba en este
archivo) se sobreescribe el valor con la URL REAL del enlace
(getLinkUrl()) en vez del texto visible que muestra la celda
("Link"/"Mazos"). Reemplaza la llamada genérica que hacía
_leerDirectorioFisicoComoDC() para leer Links — así cualquier consumidor
de esa función (perfil web, generación de docs, backups CSV, etc.)
recibe la URL real en vez de un texto que no sirve para armar un link.
Es el mismo patrón (getRichTextValues + getLinkUrl) que ya usa
_leerLinksRichTextPorTag() (arriba) y _extraerValoresConLinksReales()
(05_Backup_CSV.gs) para el mismo problema en otras hojas.
@returns {Object} Tag -> fila (array de LINKS_TOTAL_COLS posiciones,
  0-based), igual formato que _leerHojaComoMapaPorTag().
```


---


# Archivo 13_Inactivos_Vetados.gs

Hojas Inactivos y Vetados (movimiento de miembros que salen/son vetados, razones, restauración). Los IDs de bloque llevan prefijo `13`.


## Índice de bloques movidos

| ID | Líneas orig. | Ubicación | Resumen |
|---|---|---|---|
| 13B001 | 8-30 | `Cabecera del archivo` | HOJA ASCENSOS — registro histórico de cambios de rango (Miembro/Veterano/ |
| 13B002 | 44-55 | `ASC_ESTADO_PROPUESTA_VALORES` | RED DE SEGURIDAD (14-ago-2026, pedido explícito del usuario) — Celular de |
| 13B003 | 60-75 | `CELULARES_RESPALDO_MANUAL_` | RED DE SEGURIDAD (14-ago-2026, pedido explícito del usuario) — "el código |
| 13B004 | 78-82 | `NOMBRE_JSON_VETADOS_CONFIRMADOS_` | _tagEstaVetadoConfirmado(tag) |
| 13B005 | 88-98 | `_construirFilaInactiva` | Construye una fila para un jugador inactivo (no está en ningún clan Terna via API). |
| 13B006 | 104-114 | `_construirFilaInactiva` | FASE B4 (16/07/2026): antes, `fila = existing.slice(0)` asumía que |
| 13B007 | 116-118 | `_construirFilaInactiva` | Normalizar Prefijo/Celular a Number aunque la fila se copie tal cual |
| 13B008 | 121-129 | `_construirFilaInactiva` | FALLBACK AL CSV (mismo criterio que _construirFila() para activos, |
| 13B009 | 163-166 | `_construirFilaInactiva` | Vigencia y Fecha_lim: mismo fallback que Fecha_ing — antes se |
| 13B010 | 176-178 | `_construirFilaInactiva` | Campos que solo vienen de /players: igual que en _construirFila, |
| 13B011 | 199-213 | `_construirFilaInactiva` | FIX (18-ago-2026, pedido explícito del usuario): cuentas de apoyo |
| 13B012 | 252-286 | `_construirFilaInactiva` | --- Datos frescos de /players para administradores inactivos --- |
| 13B013 | 297-303 | `_construirFilaInactiva` | 🟢 ACTUALIZACIÓN DE RANGO (role) |
| 13B014 | 351-358 | `_construirFilaInactiva` | 🟢 ACTUALIZACIÓN DE CLAN Y CLAN_TAG |
| 13B015 | 378-392 | `_construirFilaInactiva` | _camposExtraInactivos() |
| 13B016 | 401-408 | `_camposExtraInactivos` | _proyectarInactivos(r) |
| 13B017 | 443-455 | `_proyectarInactivos` | _leerInactivosParaReactivacion(ss) |
| 13B018 | 473-486 | `_leerInactivosParaReactivacion` | _esSiNoOVacio(v) |
| 13B019 | 492-512 | `_esSiNoOVacio` | _reconstruirExistingDesdeInactivos(icRow, extraObj) |
| 13B020 | 532-545 | `_reconstruirExistingDesdeInactivos` | _retirarDeInactivosPorReactivacion(ss, tags) |
| 13B021 | 578-583 | `_updateInactivos` | Inactivos: tiene su PROPIA estructura reducida de 29 columnas (ver |
| 13B022 | 593-603 | `_updateInactivos` | Candidatas frescas según dirData, ya proyectadas a las 29 columnas de |
| 13B023 | 605-617 | `_updateInactivos` | extrasFrescos: { Tag -> {campo: valor} } con las 31 columnas de |
| 13B024 | 647-656 | `_updateInactivos` | PROTECCIÓN ANTI-BORRADO: la hoja Inactivos se reconstruye a partir de la |
| 13B025 | 684-687 | `_updateInactivos` | FIX (05-ago-2026): mismo criterio que _escribirDirectorio() — resetear |
| 13B026 | 696-699 | `_updateInactivos` | Fix: la hoja Inactivos nunca reaplicaba el formato de Celular al |
| 13B027 | 717-724 | `_aplicarDropdownsInactivos` | _aplicarDropdownsVetados(sh, numFilas) |
| 13B028 | 731-740 | `_aplicarDropdownsVetados` | _obtenerNomMultisAdmins() |
| 13B029 | 759-779 | `_obtenerNomMultisAdmins` | _obtenerCuentasDeNomMulti(nomMulti) |
| 13B030 | 814-833 | `_obtenerCuentasDeNomMulti` | _aplicarDropdownAutorVetados(shVet, nomMultisAdmins) |
| 13B031 | 850-856 | `_aplicarDropdownAutorVetados` | (25-sep-2026, FASE B) ClanSystem_Backup_VetadosConfirmados.json se lee y |
| 13B032 | 885-892 | `_guardarVetadosConfirmados_` | _registrarVetadoConfirmado(tag) |
| 13B033 | 907-915 | `_tagEstaVetadoConfirmado` | _olvidarVetadoConfirmado(tag) |
| 13B034 | 938-976 | `_updateVetados` | FIX (07-ago-2026): la columna Razón (col J, índice 9) de la hoja |
| 13B035 | 991-994 | `_updateVetados` | Dos filas del mismo tag con Razón NO vacía en ambas (caso raro, |
| 13B036 | 1020-1022 | `_updateVetados` | Preservar la Razón manual ya escrita en Vetados; solo si el tag |
| 13B037 | 1025-1036 | `_updateVetados` | NOTA (26-ago-2026): el encabezado de la columna 4 de Vetados es |
| 13B038 | 1054-1075 | `_updateVetados` | FIX (14-ago-2026, pedido explícito del usuario): "la hoja Vetados debe |
| 13B039 | 1108-1114 | `_updateVetados` | RED DE SEGURIDAD anti-desbaneo (ver CELULARES_RESPALDO_MANUAL_ / |
| 13B040 | 1117-1120 | `_updateVetados` | PROTECCIÓN ANTI-BORRADO (igual criterio que en Inactivos): un tag solo |
| 13B041 | 1191-1193 | `sincronizarRazonHaciaVetados` | 'Sí'/'No' pertenecen a la columna "Vetado", nunca a "Razón". Si alguien |
| 13B042 | 1210-1214 | `sincronizarRazonHaciaVetados` | NOTA (26-ago-2026): columna "Nom_Multi" (encabezado) = valor IC.NOM_MULTI |
| 13B043 | 1249-1269 | `sincronizarRazonHaciaDirectorio` | _upsertVetadoDesdeWeb(tag, filaOrigenIC, razon, autor, via, fecha) |
| 13B044 | 1300-1304 | `_upsertVetadoDesdeWeb` | Fecha real (Date), formateada dd/mm/yyyy HH:mm:ss en la celda — NO el |
| 13B045 | 1308-1323 | `_upsertVetadoDesdeWeb` | _webAgregarComentarioVeto(filaOrigenIC, autor, fecha, razon, comentarioAdmin) |
| 13B046 | 1349-1357 | `_webAgregarComentarioVeto` | _updateMulticuentas(ss, dirData) |
| 13B047 | 1372-1383 | `_updateMulticuentas` | FIX (07-ago-2026): "mientras un jugador con varias cuentas asociadas al |
| 13B048 | 1391-1393 | `_updateMulticuentas` | Por Celular, ¿el grupo tiene al menos una cuenta Activa en un clan |
| 13B049 | 1409-1412 | `_updateMulticuentas` | Fase 10 (17/07/2026): Multicuentas no filtraba Vetado en absoluto — |
| 13B050 | 1420-1423 | `_updateMulticuentas` | Cuenta Inactiva: solo se muestra si su Celular tiene al menos una |
| 13B051 | 1436-1443 | `_updateMulticuentas` | ACTUALIZADO (16/07/2026): este comentario advertía que dirRow no |
| 13B052 | 1471-1473 | `_updateMulticuentas` | Fix: Multicuentas nunca reaplicaba el formato numérico de Nivel/ |
| 13B053 | 1491-1495 | `_updateMulticuentas` | IMPORTANTE: el color por Rango NUNCA debe aplicarse a filas Inactivas. |

---

## Detalle (texto original, sin cambios)

Cada bloque se copió tal cual estaba en el `.gs` (sin los `//`). Los números de línea son los del archivo ANTES de la limpieza.


### Ubicación: `Cabecera del archivo`

#### 13B001 — líneas 8-30 (comentario)

```text
=============================================================================
HOJA ASCENSOS — registro histórico de cambios de rango (Miembro/Veterano/
Colíder/Líder) detectados en el Directorio entre una corrida y la
siguiente. Ver updateAscensosSheet() más abajo para el flujo completo.
=============================================================================
FASE 5 (13-sep-2026, pedido del usuario, plan de Cambio de Rango): se
agrega ESTADO_PROPUESTA (columna 18, "Estado_Propuesta") para distinguir
una fila que es solo una PROPUESTA generada por el sistema de CR_Lista
("Planificado") de una que refleja un cambio REAL ya confirmado por
datos de Supercell ("Realizado") -- SIN tocar ASC.ESTADO (columna 16,
"Estado"), que ya significaba otra cosa: el Estado de cuenta del
jugador en ese momento (Activo/Inactivo, copiado de DC.ESTADO -- ver
_crearRegistroAscenso(), 24_Historial_Ascensos.gs). Vacío
('') para toda fila histórica que no vino de este sistema -- incluidas
las que updateAscensosSheet() sigue creando por detección real (eso no
cambia en esta fase, ver _crearRegistroAscenso(): al no tocarse esa
función, el nuevo array de ASCENSOS_TOTAL_COLS elementos ya inicializa
esta columna en '' por defecto). La conexión real entre una detección
automática y una propuesta "Planificado" pendiente (para pasarla a
"Realizado" en vez de duplicar) es la Fase 6 (13-sep-2026, pedido del
usuario) -- ver _indexarPropuestasPendientesAscensos() y
_resolverPropuestaCRListaComoRealizada() al final de
24_Historial_Ascensos.gs.
```


### Ubicación: `ASC_ESTADO_PROPUESTA_VALORES`

#### 13B002 — líneas 44-55 (comentario)

```text
=============================================================================
RED DE SEGURIDAD (14-ago-2026, pedido explícito del usuario) — Celular de
cuentas puntuales que YA se perdió varias veces (reescrito a mano ~3
veces, con distintas versiones del código y en fechas distintas). Esto es
solo una red de auxilio, NO reemplaza arreglar la causa raíz de por qué
se pierde: se consulta como ÚLTIMO recurso en _construirFila(), solo si
Celular terminó vacío después de agotar existing/CSV. Nunca pisa un
Celular que ya esté presente.
  #JR9J0JCQ9 (Lucky) = +51 <celular>
Para agregar otra cuenta, sumar una línea más "TAG: 'numero'" (sin
espacios, sin +51, solo los dígitos del celular).
=============================================================================
```


### Ubicación: `CELULARES_RESPALDO_MANUAL_`

#### 13B003 — líneas 60-75 (comentario)

```text
=============================================================================
RED DE SEGURIDAD (14-ago-2026, pedido explícito del usuario) — "el código
no tiene permitido quitar baneos por ningún motivo, en el script se
indica que eso solo se puede ejecutar de forma manual". _construirFila()
ya preserva Vetado desde `existing`/CSV (ver más abajo), pero si por
cualquier motivo (bug futuro, dato corrupto, corrida a mitad de un bug
que aún no se detectó) ambas fuentes llegaran vacías para un Tag que
esta misma función YA marcó como vetado en una corrida anterior, este
registro (persistido en Drive, ver _registrarVetadoConfirmado() y
_tagEstaVetadoConfirmado() en _updateVetados() más abajo en este mismo
archivo) fuerza el valor de vuelta a 'Sí' y deja un log bien visible en
vez de dejar pasar el desbaneo en silencio. El registro es de SOLO
AGREGAR desde el código: nunca se borra una entrada automáticamente,
solo un admin puede limpiarlo a mano (correr
_olvidarVetadoConfirmado(tag) desde el editor de Apps Script).
=============================================================================
```


### Ubicación: `NOMBRE_JSON_VETADOS_CONFIRMADOS_`

#### 13B004 — líneas 78-82 (docblock)

```text
_tagEstaVetadoConfirmado(tag)
Consulta el registro persistente (sin volver a leerlo del disco en cada
llamada — usa una caché en memoria del proceso, ver _cacheVetadosConfirmados_).
```


### Ubicación: `_construirFilaInactiva`

#### 13B005 — líneas 88-98 (comentario)

```text
Construye una fila para un jugador inactivo (no está en ningún clan Terna via API).

IMPORTANTE (cambio 8/7/2026): Esta función SIEMPRE construye la fila completa
con todos los datos (se preservan en el CSV para posible rescate). Sin
embargo, el FILTRADO de qué inactivos mostrar en la hoja Directorio se
hace en _construirFilasDirectorio() — ver línea ~548 donde se verifica
Admin='Sí'. Solo inactivos que sean administradores aparecen en Directorio;
el resto se omite de ahí pero se preserva en CSV e Inactivos.

Índices 0-based para todas las columnas leídas de existing (fila física
de Directorio, formato IC — igual criterio que _construirFila()).
```

#### 13B006 — líneas 104-114 (comentario)

```text
FASE B4 (16/07/2026): antes, `fila = existing.slice(0)` asumía que
`existing` (fila FÍSICA real de Directorio, único caso: un admin
inactivo, que es el único tipo de inactivo que sigue apareciendo
físicamente en Directorio) tenía las 60 columnas del modelo DC en el
mismo orden que DC. Eso dejó de ser cierto: la hoja física ahora
tiene 29 columnas en el orden de IC, y los 23 campos de Players + 6
de Links ya no están ahí. Se reemplaza por
_reconstruirFilaDCDesdeFisico() (Fase B1, más abajo en este archivo):
arma la fila completa de 60 columnas combinando `existing` (29
columnas físicas) con playersRow/linksRow (fila de Players/Links para
este Tag, o null si esa cuenta no tiene fila ahí).
```

#### 13B007 — líneas 116-118 (comentario)

```text
Normalizar Prefijo/Celular a Number aunque la fila se copie tal cual
de 'existing': si en algún momento se guardaron como texto (string),
el NumberFormat visual no se aplica de forma consistente en Sheets.
```

#### 13B008 — líneas 121-129 (comentario)

```text
FALLBACK AL CSV (mismo criterio que _construirFila() para activos,
ver más abajo en este archivo): si el 'existing' de un inactivo no
tiene celular/prefijo (se perdió en alguna corrida anterior, ej. una
vez sin datos de /players para ese tag), se recupera del CSV de
respaldo en vez de dejarlo vacío para siempre. Antes esta rama NO
tenía este fallback — por eso un celular perdido en un inactivo nunca
se recuperaba aunque el CSV sí lo tuviera guardado (reporte del
05-jul-2026: "el csv tiene los teléfonos pero Sheets solo conservó
los celulares de los activos").
```

#### 13B009 — líneas 163-166 (comentario)

```text
Vigencia y Fecha_lim: mismo fallback que Fecha_ing — antes se
dejaban vacías en este camino (reconstrucción sin "existing", p.ej.
tras demolerTodoElSpreadsheet()) aunque el CSV sí las tuviera
guardadas.
```

#### 13B010 — líneas 176-178 (comentario)

```text
Campos que solo vienen de /players: igual que en _construirFila,
se restauran desde el CSV cuando no hay fila "existing" (p.ej. tras
demolerTodoElSpreadsheet()). Antes se perdían siempre en este caso.
```

#### 13B011 — líneas 199-213 (comentario)

```text
FIX (18-ago-2026, pedido explícito del usuario): cuentas de apoyo
vetadas que se mueven entre los 4 clanes Terna o quedan sin clan por
tiempos indefinidos (ej. #JR9J0JCQ9, Lucky). Al no ser admin, esta
cuenta NUNCA tiene fila en Directorio ni en Backup_Directorio.csv
mientras está inactiva — ambos ("existing" y "csvRow") son SIEMPRE
null para ella tarde o temprano. Como esta función nunca leía la
propia hoja Inactivos, cualquier edición manual hecha directo ahí
(Vetado, Razón, Prefijo, Celular, Nom_Multi, Préstamo) se perdía en la
siguiente corrida sin ningún error — la fila se reconstruía en blanco
(o con lo último que había en existing/CSV, que podía ya estar
desactualizado) cada vez. "inactivoPropio" es la fila que esta misma
cuenta ya tenía en Inactivos (ver _leerInactivosParaReactivacion(),
pasada por _construirFilasDirectorio()) — se usa como ÚLTIMO recurso,
solo si existing/csvRow no aportaron el dato, con los mismos filtros
_esSiNoOVacio()/esRazonValida() que ya usa el resto de este archivo.
```

#### 13B012 — líneas 252-286 (comentario)

```text
--- Datos frescos de /players para administradores inactivos ---
_fetchPlayersData() (09_API_ClashRoyale.gs) agrega SIEMPRE los tags de
Admin="Sí" a tagsToFetch, incluso si su cuenta está Inactivo, para que
no queden desactualizados indefinidamente. Antes esta función nunca
leía ese resultado (solo se aplicaba a las filas Activas en
_construirFila), así que el dato se pedía a la API pero se descartaba.
Mismo criterio de "solo pisar si el campo viene presente" que en
_construirFila, para no perder valores de existing/CSV con 0 o ''.
Sin importar PLAYERS_API_ENABLED, si esta cuenta inactiva es Admin="Sí"
se intenta aplicar el dato fresco de /players (reporte: "admins
desactualizados sin importar el estado del interruptor").
FIX (05-ago-2026): Clan/Clan_Tag inconsistentes entre admins inactivos.
Reporte del usuario: "si todas las cuentas de Administradores son
admins, ¿por qué algunas borran el Clan y otras no?". Causa raíz: el
bloque de abajo SOLO limpia Clan/Clan_Tag cuando _getPlayerCache(tag)
trae datos frescos de /players en ESTA corrida. Si esa consulta puntual
falla (error de red/proxy, rate limit, o el tag no se llegó a pedir),
el bloque entero se salta y Clan/Clan_Tag se quedan con el valor viejo
de 'existing' — que puede ser un clan Terna del que este admin YA
salió (por eso esta fila pasó por _construirFilaInactiva: el roster de
clanes de ESTE ciclo ya confirmó que no está en ninguno de los 4). Como
el éxito/fracaso del fetch es por-tag, dos admins igual de "fuera de
clan" terminaban mostrando resultados distintos (uno limpio, otro con
el clan viejo) según si su consulta individual tuvo suerte esta vez.

Para no depender de esa fetch puntual: si el Clan_Tag que ya trae la
fila es uno de los 5 tags gestionados (CFG.CLAN_TAGS, incluye el
vetado), se limpia AQUÍ MISMO, sin condición — el roster de clanes de
este ciclo ya es prueba suficiente de que ya no pertenece ahí. Si el
fetch de /players sí trae datos más abajo, los vuelve a pisar con el
valor real (otro clan Terna, uno externo, o vacío si no tiene clan).
Un Clan_Tag que NO es de los 5 gestionados (ej. se unió a un clan
externo, confirmado en una corrida anterior) se deja intacto acá: sin
fetch fresco no hay forma de saber si sigue ahí, así que no se inventa
un vacío que sería igual de arbitrario que el bug original.
```

#### 13B013 — líneas 297-303 (comentario)

```text
🟢 ACTUALIZACIÓN DE RANGO (role)
/players solo incluye "role" cuando el jugador pertenece a un clan.
Si no viene, es porque ya no tiene clan (no un dato ausente por otro
motivo) -- antes esta rama solo pisaba el valor cuando "role" venía
presente y dejaba el Rango viejo si no, por lo que un admin que
dejó el clan por completo seguía mostrando su último rango. Ahora
se limpia explícitamente cuando no hay clan.
```

#### 13B014 — líneas 351-358 (comentario)

```text
🟢 ACTUALIZACIÓN DE CLAN Y CLAN_TAG
Mismo criterio que Rango arriba: si playerDataInactivo.clan no
viene, es porque el jugador ya no tiene clan (dato ausente por
definición, no por un problema puntual de la API) -- antes esta
rama solo pisaba Clan/Clan_Tag cuando SÍ había clan y dejaba el
valor viejo si no, por lo que un admin que salió del todo del
juego (sin unirse a otro clan) seguía apareciendo con el clan del
que ya se fue.
```

#### 13B015 — líneas 378-392 (docblock)

```text
_camposExtraInactivos()
Devuelve los nombres de campo de DC (Directorio, 60 columnas) que NO
existen en IC (Inactivos, 29 columnas) — las 31 columnas de estadísticas
de Players/Links (Nivel, Copas, V_Guerra, etc.) y Cat_disp/Clanes_Admin.
Comentario ya NO forma parte de este conjunto: desde que se agregó
IC.COMENTARIO, Inactivos guarda ese campo físicamente igual que
Directorio, así que la diferencia DC-IC lo excluye automáticamente. Se
calculan por diferencia entre DC e IC (en vez de mantener una lista fija
a mano) para que, si algún día cambian los campos de cualquiera de las
dos hojas, este cálculo se mantenga correcto solo. Usado por
_updateInactivos() (más abajo) para saber qué capturar de dirData antes
de que se pierda, y por syncInactivosCSV() (05_Backup_CSV.gs) para saber qué
campos leer de ClanSystem_Backup_InactivosExtra.json.
```


### Ubicación: `_camposExtraInactivos`

#### 13B016 — líneas 401-408 (docblock)

```text
_proyectarInactivos(r)
Proyecta una fila completa de Directorio (formato DC, 60 columnas en
memoria — ver arriba) a las 29 columnas propias de la hoja Inactivos
(formato IC, ver _setupInactivos() en 11_DirectorioSheet.gs). Mismo set de campos
que Directorio, en el mismo orden, más Comentario al final; no incluye
las columnas de estadísticas de Players/Links.
```


### Ubicación: `_proyectarInactivos`

#### 13B017 — líneas 443-455 (docblock)

```text
_leerInactivosParaReactivacion(ss)
Lee la hoja Inactivos (29 columnas, formato IC, incluye Comentario) + el
snapshot de las 31 columnas extra (ClanSystem_Backup_InactivosExtra.json,
ver _cargarExtraColsInactivos() en 05_Backup_CSV.gs) y arma un mapa
Tag -> { ic: fila de 29 columnas, extra: {campo:valor} o null } con toda
la información que se guardó de cada cuenta mientras estuvo inactiva.
Se usa en _construirFilasDirectorio() para restaurar esos datos cuando
una cuenta vuelve a aparecer como Activa en un clan Terna (ver pedido del
usuario: "si un jugador vuelve a estar activo... se debe retirar de
Inactivos y mover su información a las respectivas hojas y el csv de
Directorio").
```


### Ubicación: `_leerInactivosParaReactivacion`

#### 13B018 — líneas 473-486 (docblock)

```text
_esSiNoOVacio(v)
Helper compartido en todo el proyecto (FIX 13-ago-2026, extendido
17-ago-2026): valida que un valor sea apto para las columnas dropdown
Sí/No/vacío (Vetado, Permiso, Admin). Devuelve true solo para
'Sí'/'Si'/'No'/vacío; cualquier otra cosa (p.ej. un número corrupto
heredado, como el número de liga de Camino de Leyendas cruzado por el
bug de índices DC/IC) se descarta. Se define acá, a nivel de archivo, en
vez de repetirla como var local dentro de cada función (como hacía
originalmente _getCsvDirMap()), para que _reconstruirFilaDCDesdeFisico(),
_reconstruirExistingDesdeInactivos() y cualquier otra función de este
proyecto (incluidas las de 05_Backup_CSV.gs, que comparte el mismo espacio de
nombres global de Apps Script) usen exactamente el mismo criterio.
```


### Ubicación: `_esSiNoOVacio`

#### 13B019 — líneas 492-512 (docblock)

```text
_reconstruirExistingDesdeInactivos(icRow, extraObj)
Proyección inversa de _proyectarInactivos(): arma una fila "existing" de
60 columnas (formato DC, igual estructura que una fila real de
Directorio) a partir de una fila de Inactivos (29 columnas, formato IC,
incluye Comentario) más su snapshot de las 31 columnas extra (Nivel,
Copas, V_Guerra, WSP, RoyaleAPI, Mazo, Mazo2, CWStats, Render, Cat_disp,
Clanes_Admin, etc.). El resultado se pasa como "existing" a
_construirFila(), para que la cuenta reactivada recupere
Prefijo/Celular/Nom_Multi/Etiqueta/WSP(G)/Permiso/Fecha_ing/links/etc. en
vez de arrancar en blanco.

FIX (17-ago-2026, mismo bug reportado el 13-ago-2026): esta función
copiaba icRow[IC[campo]-1] tal cual, sin filtro. En la práctica queda
protegida río abajo porque _construirFila() vuelve a filtrar Vetado/
Permiso/Admin/Razón cuando existingEsDC=true (ver esReactivacion en
_construirFilasDirectorio()) — pero por el mismo criterio de "filtrar en
el punto de entrada, no confiar en que un filtro más adelante lo
atrape" ya aplicado en _reconstruirFilaDCDesdeFisico(), syncInactivosCSV()
e _importarInactivosDesdeCSV(), se filtra también acá.
```


### Ubicación: `_reconstruirExistingDesdeInactivos`

#### 13B020 — líneas 532-545 (docblock)

```text
_retirarDeInactivosPorReactivacion(ss, tags)
Retira físicamente de la hoja Inactivos las filas de los tags indicados
(cuentas que acaban de reactivarse en un clan Terna, ver
_construirFilasDirectorio() más arriba) y limpia sus entradas en
ClanSystem_Backup_InactivosExtra.json (ver
_eliminarExtraColsInactivosPorTags() en 05_Backup_CSV.gs), ya que esos datos
ya se usaron para restaurar la fila fresca en Directorio y no deben
seguir ocupando espacio indefinidamente. Se llama inmediatamente después
de escribir Directorio, sin esperar a la próxima corrida de
_updateInactivos()/updateVistasDerivadas(), para que la cuenta nunca
quede duplicada (Activa en Directorio y, a la vez, todavía en Inactivos).
Los administradores nunca pasan por acá: nunca están en Inactivos.
```


### Ubicación: `_updateInactivos`

#### 13B021 — líneas 578-583 (comentario)

```text
Inactivos: tiene su PROPIA estructura reducida de 29 columnas (ver
IC/INACTIVOS_TOTAL_COLS en 02_Setup_Hojas.gs; mismo set de campos que
Directorio más Comentario, sin las columnas de estadísticas de
Players/Links). dirData sigue llegando con las 60 columnas completas
de Directorio (formato DC); cada fila candidata se proyecta a 29
columnas (formato IC) con _proyectarInactivos() antes de guardarse.
```

#### 13B022 — líneas 593-603 (comentario)

```text
Candidatas frescas según dirData, ya proyectadas a las 29 columnas de
Inactivos.
Reglas (ver pedido del usuario):
  - Los administradores (Admin='Sí') NUNCA aparecen en Inactivos, sin
    importar su Estado (Activo/Inactivo) — siempre permanecen en
    Directorio. Por eso se excluyen acá antes de cualquier otra regla.
  - Cualquier miembro Inactivo (no vetado) que no sea admin: igual que
    antes.
  - Cualquier miembro Activo en el clan Vetado (CFG.VETADO_TAG) que no
    sea admin: estar activo en el clan Vetado no significa estar
    presente en un clan Terna, así que también cae en Inactivos.
```

#### 13B023 — líneas 605-617 (comentario)

```text
extrasFrescos: { Tag -> {campo: valor} } con las 31 columnas de
estadísticas de Players/Links (Nivel, Copas, V_Guerra, etc.) y
Cat_disp/Clanes_Admin — las columnas de dirData (formato DC, 60 cols)
que NO forman parte de las 29 columnas propias de Inactivos (formato IC).
Comentario ya NO entra acá: viaja directo dentro de _proyectarInactivos()
porque ahora es un campo propio de Inactivos (IC.COMENTARIO). Se
capturan aquí, en el momento exacto en que una cuenta pasa a Inactivos,
porque una vez inactiva ya no se sigue trackeando en la API/Players/
Links. Se guardan en ClanSystem_Backup_InactivosExtra.json (ver
_guardarExtraColsInactivosBatch() en 05_Backup_CSV.gs) para que
syncInactivosCSV() pueda reconstruir esas 31 columnas en
Backup_Inactivos.csv sin tener que leerlas de la hoja Inactivos (que ya
NO las tiene físicamente) y sin perder la información.
```

#### 13B024 — líneas 647-656 (comentario)

```text
PROTECCIÓN ANTI-BORRADO: la hoja Inactivos se reconstruye a partir de la
UNIÓN de (a) lo que ya había en la hoja y (b) las candidatas frescas de
dirData. Un tag SOLO se retira de Inactivos cuando dirData confirma
explícitamente que cambió de estado (pasó a Activo o a Vetado). Si un
tag desaparece de dirData por completo (caso anómalo que no debería
ocurrir, pero que ya ha causado pérdida de datos antes — o, en el caso
normal de los inactivos no-admin, simplemente porque no se muestran en
la hoja Directorio), su fila se conserva tal cual estaba en vez de
borrarla. No se detalla cada tag en el registro de ejecución para no
saturarlo; solo se deja un conteo resumen.
```

#### 13B025 — líneas 684-687 (comentario)

```text
FIX (05-ago-2026): mismo criterio que _escribirDirectorio() — resetear
el color de letra al reescribir, para que no quede un blanco fijado
manualmente pegado a una posición de fila que ya no corresponde a la
misma cuenta (ver comentario detallado en _escribirDirectorio()).
```

#### 13B026 — líneas 696-699 (comentario)

```text
Fix: la hoja Inactivos nunca reaplicaba el formato de Celular al
copiarlo desde Directorio — quedaba como número plano en vez del
formato "### ### ### ###" (mismo criterio que Directorio y
Administradores, ver updateDirectorioSheet()/sincronizarAdministradores()).
```


### Ubicación: `_aplicarDropdownsInactivos`

#### 13B027 — líneas 717-724 (docblock)

```text
_aplicarDropdownsVetados(sh, numFilas)
FASE 4 (25-ago-2026, arquitectura-web-familia-terna.md Sección 7.5):
dropdown de la columna Vía ('Web'/'Bot'/'Sheet') — mismo patrón que
_aplicarDropdownsAdministradores()/_aplicarDropdownsInactivos(), aplicado
en cada corrida de _updateVetados() sobre el número real de filas
escritas, para no depender de un rango fijo adivinado en el setup.
```


### Ubicación: `_aplicarDropdownsVetados`

#### 13B028 — líneas 731-740 (docblock)

```text
_obtenerNomMultisAdmins()
FASE 4 — WEB (arquitectura-web-familia-terna.md, Sección 7.5.1): lista
de los Nom_Multi de personas que SON administradores hoy — leídos
directo de la hoja Administradores (que ya solo contiene celulares
marcados como Admin='Sí' en Directorio, ver sincronizarAdministradores(),
11_DirectorioSheet.gs), no de Directorio en general (un miembro común no
puede figurar como "Autor" de un veto).
@returns {string[]} Nom_Multi únicos, no vacíos, orden alfabético.
```


### Ubicación: `_obtenerNomMultisAdmins`

#### 13B029 — líneas 759-779 (docblock)

```text
_obtenerCuentasDeNomMulti(nomMulti)
FIX (12-sep-2026, pedido usuario -- panel admin, cuadro "¿Con cuál cuenta
organizó?"): dado un Nom_Multi, devuelve TODAS las cuentas de Clash Royale
que tiene esa persona -- recorre Directorio y Directorio_Inactivos (mismo
layout físico de 29 columnas, IC.*, ver 11_DirectorioSheet.gs) filtrando
por IC.NOM_MULTI. El Clan y el ClanTag de cada cuenta YA viven como
columnas propias de la fila (IC.CLAN / IC.CLAN_TAG) -- no hace falta
relacionar nada con la hoja de Clanes, mismo dato que ya usa
_getDirectorioLookupPorTag() (26_Torneos_Core.gs) para resolver
Clan/ClanTag de un Tag conocido.
FIX (21-sep-2026, limpieza de comentario desactualizado): este docblock
decía que el helper "todavía NO está conectado a ningún endpoint". Eso ya
no es cierto: _webAdminCuentasDeNomMulti() (37_Web_API.gs) lo envuelve
desde el 12-sep-2026, y admin.html (cargarCuentasDelAutor()) ya lo llama.
Se corrige acá para no arrastrar la confusión a futuras sesiones.
@param {string} nomMulti
@returns {{tag:string, nombre:string, clan:string, clanTag:string}[]}
  Una entrada por cada cuenta encontrada -- Directorio primero y luego
  Inactivos -- sin duplicar Tags que aparezcan en ambas hojas.
```


### Ubicación: `_obtenerCuentasDeNomMulti`

#### 13B030 — líneas 814-833 (docblock)

```text
_aplicarDropdownAutorVetados(shVet, nomMultisAdmins)
FASE 4 — WEB (Sección 7.5.1, ajuste pedido en v8). A diferencia de Vía
(lista fija de 3 valores, ver _aplicarDropdownsVetados() más arriba),
la columna Autor necesita un dropdown DINÁMICO — crece o cambia cada vez
que se agrega/quita un admin — así que no puede ser una
requireValueInList() fija escrita una sola vez: se recalcula cada vez
que se reconstruye Administradores (ver caller en
sincronizarAdministradores(), 11_DirectorioSheet.gs) y cada vez que
corre _updateVetados() (más abajo en este archivo), mismo criterio de
robustez que usa el proyecto para otros dropdowns dependientes de datos
(_aplicarCatDispMultiSelect() recibe la lista ya calculada, en vez de
calcularla ella misma).
Si `nomMultisAdmins` viene vacío (todavía no hay administradores con
Nom_Multi cargado), se limpia cualquier validación previa en vez de
aplicar una lista vacía (que bloquearía cualquier valor).
Este dropdown es solo para la edición manual directa en la hoja — el
endpoint _webAdminVetar() (37_Web_API.gs) sigue escribiendo Autor
directamente por código, sin pasar por esta UI de Sheets.
```


### Ubicación: `_aplicarDropdownAutorVetados`

#### 13B031 — líneas 850-856 (comentario)

```text
(25-sep-2026, FASE B) ClanSystem_Backup_VetadosConfirmados.json se lee y
se escribe ahora desde/hacia "Otros" (DRIVE_FOLDER_ID_OTROS) — antes vivía
suelto directo en "JSON". A diferencia de ClanSystem_Backup_Celulares.json
(11_DirectorioSheet.gs / 05_Backup_CSV.gs), acá la lectura Y la escritura
están en este mismo archivo, así que no hay hueco temporal: ambas quedan
consistentes en el mismo cambio. Ver checklist de AVISOS ABIERTOS / FASE B
en 09_API_ClashRoyale.gs.
```


### Ubicación: `_guardarVetadosConfirmados_`

#### 13B032 — líneas 885-892 (docblock)

```text
_registrarVetadoConfirmado(tag)
Marca un Tag como "vetado confirmado" en el registro persistente. Se
llama desde _updateVetados() por cada Tag que termina con Vetado='Sí' en
cualquiera de sus fuentes (Directorio o Inactivos). Es ACUMULATIVO: nunca
quita entradas, solo agrega — así el registro nunca puede ser la causa de
un desbaneo automático, solo de un re-baneo defensivo si algo más falla.
```


### Ubicación: `_tagEstaVetadoConfirmado`

#### 13B033 — líneas 907-915 (docblock)

```text
_olvidarVetadoConfirmado(tag)
ÚNICA forma de quitar una entrada del registro de "vetados confirmados".
Debe ejecutarse A MANO desde el editor de Apps Script (Ejecutar >
_olvidarVetadoConfirmado, o llamarla una vez desde un trigger temporal)
cuando un desbaneo sea realmente intencional. El código de actualización
normal (updateDirectorioSheet/runAll/runUpdate/runGuerraRapido) NUNCA la
llama por sí solo.
```


### Ubicación: `_updateVetados`

#### 13B034 — líneas 938-976 (comentario)

```text
FIX (07-ago-2026): la columna Razón (col J, índice 9) de la hoja
Vetados es de EDICIÓN MANUAL — el script nunca debe modificarla ni
borrar su contenido (a diferencia del resto de las columnas, que sí
se refrescan desde el Directorio en cada corrida). Antes, la fila de
'candidatas' se armaba SIEMPRE con r[DC.RAZON-1] (el valor de Razón
en el Directorio), que puede venir vacío si esa razón no es una de
las reconocidas por esRazonValida() (ver ~línea 1213 más arriba en
este archivo, que limpia DC.RAZON cuando no es válida) — eso pisaba
silenciosamente la razón escrita a mano acá en Vetados y, con la
celda vacía, el formato condicional por Razón (más abajo) dejaba de
aplicarse. Ahora se lee primero el valor YA EXISTENTE en la propia
hoja Vetados para cada tag, y ese es el que se conserva; el valor del
Directorio solo se usa como respaldo la PRIMERA vez que un tag entra
a Vetados (todavía no tiene ninguna fila propia con Razón manual).
FIX 2 (07-ago-2026): el bug seguía reproduciéndose para tags puntuales
(reporte: #JR9J0JCQ9) a pesar del FIX de arriba. Causa: este mismo
bucle, si el tag tenía MÁS DE UNA fila en Vetados (duplicado heredado
de antes de que existiera este FIX — dos filas con el mismo Tag, una
con la Razón escrita a mano y otra en blanco), simplemente pisaba
razonManualPorTag[tgPrevio] con la ÚLTIMA fila leída sin importar su
contenido. Si la fila en blanco quedaba más abajo que la fila con la
razón real, la razón real se perdía ACÁ MISMO, antes de llegar
siquiera a candidatas — y como esto se repite en cada corrida, el
usuario ve el mismo tag "reventando" una y otra vez aunque lo
retipee (retipearlo arregla esa corrida puntual, pero la duplicada en
blanco lo vuelve a pisar en la siguiente). Ahora, ante un tag
duplicado, se prefiere SIEMPRE la razón NO vacía sobre una vacía, sin
importar el orden de las filas.
FASE 4 (25-ago-2026, arquitectura-web-familia-terna.md Sección 7.5):
junto con la Razón manual, ahora también se preservan Autor/Vía/Fecha
(VC.AUTOR/VC.VIA/VC.FECHA, columnas 11-13) — son exclusivas del flujo
"Vetar desde la web" y este barrido automático NUNCA debe tocarlas: se
guarda su valor actual por Tag y se vuelve a poner en su sitio al
reconstruir la fila más abajo, igual que ya se hacía con Razón.
A partir de acá se usa SIEMPRE VC.* (nunca índices de array sueltos
como antes, ej. existentesPrevio[i][9]) — esos índices sueltos eran
exactamente lo que rompía el contenido de una columna en cuanto el
orden de columnas se desplazaba (ver VETADOS_TOTAL_COLS/VC en
11_DirectorioSheet.gs).
```

#### 13B035 — líneas 991-994 (comentario)

```text
Dos filas del mismo tag con Razón NO vacía en ambas (caso raro,
pero posible en datos duplicados heredados): se loguea para que
quede visible, y gana la última leída (mismo criterio de
"más reciente gana" que usa el resto del sistema).
```

#### 13B036 — líneas 1020-1022 (comentario)

```text
Preservar la Razón manual ya escrita en Vetados; solo si el tag
es nuevo en Vetados (sin fila propia todavía) se usa la Razón del
Directorio como valor inicial.
```

#### 13B037 — líneas 1025-1036 (comentario)

```text
NOTA (26-ago-2026): el encabezado de la columna 4 de Vetados es
"Nom_Multi" (ver _setupVetados(), 02_Setup_Hojas.gs); el VALOR
que se escribe ahí sigue siendo DC.NOM_MULTI (nombre legible escrito
a mano en Directorio, sin la lista de cuentas), igual que siempre —
solo cambió el rótulo del encabezado (revierte el FIX del
25-ago-2026, que lo había puesto en "Jugador"). La clave interna
también se renombró de VC.JUGADOR a VC.NOM_MULTI (pedido explícito
del usuario de que no quede "Jugador" ni en el encabezado ni en el
resto del código de esta hoja). Se arma con VC.* para que la fila
quede en el orden correcto sin depender de índices sueltos.
Autor/Vía/Fecha (11-13) se preservan tal cual estaban (nunca los
toca este barrido automático).
```

#### 13B038 — líneas 1054-1075 (comentario)

```text
FIX (14-ago-2026, pedido explícito del usuario): "la hoja Vetados debe
mostrar a TODOS los vetados, sin excepción... Vetados no es excluyente
con Directorio o Inactivos. Una cuenta puede estar en Directorio y en
Vetados a la vez. También puede estar en Vetados e Inactivos a la vez."
Causa raíz de "solo aparece un vetado" (reporte: solo #RGCL8LGJC):
`dirData` (parámetro de esta función) NUNCA incluye a los inactivos
NO-admin — ver _construirFilasDirectorio() más arriba en este mismo
archivo ("Solo incluir en Directorio si es admin. Inactivos no-admin
se omiten de aquí"). Como la mayoría de los vetados no son
administradores, en cuanto una cuenta vetada deja de estar activa en
un clan Terna (pasa a Inactivos), dejaba de aparecer en `dirData` — y
el bucle de arriba, que SOLO mira `dirData`, nunca la agregaba a
`candidatas`. La única razón por la que alguna cuenta sobrevivía en
Vetados era la protección anti-borrado de más abajo (conserva la
última fila conocida si el tag ya no aparece en `dirPorTag`) — pero
eso solo protege filas que YA existían en Vetados de una corrida
anterior; un Tag vetado por primera vez directamente en la hoja
Inactivos (única forma de vetar a alguien que ya no está activo en
ningún clan Terna) nunca llegaba a tener esa primera fila. Ahora se
lee también la hoja Inactivos directamente, con el mismo criterio
(Vetado='Sí'), para que ninguna cuenta vetada se quede sin mostrarse
acá sin importar en qué hoja viva su Vetado='Sí'.
```

#### 13B039 — líneas 1108-1114 (comentario)

```text
RED DE SEGURIDAD anti-desbaneo (ver CELULARES_RESPALDO_MANUAL_ /
_registrarVetadoConfirmado() más abajo en este archivo, usadas también
desde _construirFila()): todo Tag que llega hasta acá con Vetado='Sí'
(desde Directorio o desde Inactivos) queda registrado de forma
persistente en Drive como "vetado confirmado". Es ACUMULATIVO —
nunca se borra una entrada automáticamente, solo agrega — así que no
puede convertirse él mismo en la causa de un desbaneo.
```

#### 13B040 — líneas 1117-1120 (comentario)

```text
PROTECCIÓN ANTI-BORRADO (igual criterio que en Inactivos): un tag solo
sale de Vetados cuando el Directorio confirma que ya no está vetado.
Si el tag desaparece por completo del Directorio, se conserva su última
fila conocida en vez de eliminarla.
```


### Ubicación: `sincronizarRazonHaciaVetados`

#### 13B041 — líneas 1191-1193 (comentario)

```text
'Sí'/'No' pertenecen a la columna "Vetado", nunca a "Razón". Si alguien
los escribe por error en Razón (la validación de la lista lo permite con
advertencia, no lo bloquea), se descarta en vez de propagarlo a Vetados.
```

#### 13B042 — líneas 1210-1214 (comentario)

```text
NOTA (26-ago-2026): columna "Nom_Multi" (encabezado) = valor IC.NOM_MULTI
(ver _setupVetados(), 02_Setup_Hojas.gs, y nota en VC, 11_DirectorioSheet.gs).
Autor/Vía/Fecha (11-13) quedan vacías acá: esta función sincroniza la
Razón escrita a mano DIRECTAMENTE en Directorio, no un veto hecho desde
la web (ese flujo, Fase 4, las llena aparte — ver _webAdminVetar()).
```


### Ubicación: `sincronizarRazonHaciaDirectorio`

#### 13B043 — líneas 1249-1269 (docblock)

```text
_upsertVetadoDesdeWeb(tag, filaOrigenIC, razon, autor, via, fecha)
FASE 4 — WEB (arquitectura-web-familia-terna.md, Sección 7.5, paso 8).
Escribe (o actualiza) directamente la fila del Tag vetado en la hoja
Vetados, llamada por _webAdminVetar() (37_Web_API.gs) inmediatamente
después de marcar Vetado='Sí' en Directorio/Inactivos (paso 6) — sin
esperar a la próxima corrida automática de _updateVetados(), que de
todos modos preservará Autor/Vía/Fecha tal cual queden acá
(VETADOS_COLS_AUTOSYNC, ver VC más arriba en este archivo).

`filaOrigenIC` es la fila física completa (formato IC, mismo layout de
29 columnas que comparten Directorio e Inactivos — ver comentario en DC/
IC, 11_DirectorioSheet.gs) de la que se vetó, ya leída por el llamador.

Si el Tag YA tenía una fila en Vetados (caso raro: re-vetar algo que ya
estaba vetado, o que se vetó antes desde el Bot/Sheet), se preserva su
Autor/Vía/Fecha original y SOLO se actualiza Razón — mismo criterio de
"nunca pisar" que ya usa sincronizarRazonHaciaVetados() más arriba en
este archivo. Si es la primera vez, se agrega una fila nueva completa
con el Autor/Vía/Fecha de esta acción.
```


### Ubicación: `_upsertVetadoDesdeWeb`

#### 13B044 — líneas 1300-1304 (comentario)

```text
Fecha real (Date), formateada dd/mm/yyyy HH:mm:ss en la celda — NO el
formato largo en español que usa el Comentario automático (ver
_webAgregarComentarioVeto() más abajo), y sin pasar por el ciclo de
serialización a texto del CSV (se respalda como número epoch ms, ver
arquitectura-web-familia-terna.md Sección 7.5, paso 8).
```

#### 13B045 — líneas 1308-1323 (docblock)

```text
_webAgregarComentarioVeto(filaOrigenIC, autor, fecha, razon, comentarioAdmin)
FASE 4 — WEB (Sección 7.5, paso 9). Agrega el comentario automático a la
hoja Comentarios cuando se vetea desde la web — mismo patrón de columnas
(CMC.*) que moverComentarioFila() (11_DirectorioSheet.gs), pero el texto
se arma acá en vez de leerse de la celda "Comentario" de Directorio, y
SIEMPRE se refiere a la persona vetada, nunca al admin que ejecutó la
acción (mismo criterio que moverComentarioFila()).
String exacto del comentario (cerrado desde la v6 de
arquitectura-web-familia-terna.md, sin cambios desde entonces):
  "Vetado desde la web por {Autor} el {Fecha}. Razón: {Razón}. {Comentario del admin}"
`{Fecha}` usa el formato largo en español ("miércoles, 8 de julio, 2026
9:45:00 a.m.") armado con _formatFechaLargaEs() (ver 04_Formato_Comun.gs),
la misma función que ya usa la columna Vigencia de Directorio para fechas
legibles en texto libre.
```


### Ubicación: `_webAgregarComentarioVeto`

#### 13B046 — líneas 1349-1357 (comentario)

```text
_updateMulticuentas(ss, dirData)
Layout de Multicuentas (15 cols, ver _setupMulticuentas() en 02_Setup_Hojas.gs):
N°|Tag|Nombre|Nom_Multi|Préstamo|Clan|Rango|Nivel|Copas|V_Guerra|
Iniciales|Permiso|Inactividad(d)|Alerta|Estado
CAMBIO (07-ago-2026): se quitó "Jugador" y se agregó "Préstamo" a la
derecha de Nom_Multi, en la misma posición (col 5) que ocupaba Jugador.
El total de columnas no cambia, por lo que colRango/colEstado y
COLS_NUMERICAS_MULTI_ (Nivel/Copas/V_Guerra, más abajo) siguen apuntando
a las mismas posiciones de siempre.
```


### Ubicación: `_updateMulticuentas`

#### 13B047 — líneas 1372-1383 (comentario)

```text
FIX (07-ago-2026): "mientras un jugador con varias cuentas asociadas al
mismo Celular tenga al menos una cuenta activa en cualquiera de los
clanes terna, deben seguir mostrándose TODAS sus cuentas en Multicuentas
— solo deben dejar de mostrarse cuando TODAS sus cuentas estén fuera de
los clanes terna". Antes esta función solo recorría dirData (Directorio
físico = solo cuentas Activas), así que ninguna cuenta inactiva del
mismo grupo podía aparecer acá, sin importar que el jugador siguiera
teniendo otra cuenta activa en un clan Terna. Se agregan como
candidatas las cuentas de Inactivos que pertenecen a un grupo
Multicuenta='Sí' (ese flag ya considera cuentas inactivas desde el fix
de _detectarMulticuentas(), ver 11_DirectorioSheet.gs) y cuyo Celular
tiene al menos una cuenta Activa en un clan Terna.
```

#### 13B048 — líneas 1391-1393 (comentario)

```text
Por Celular, ¿el grupo tiene al menos una cuenta Activa en un clan
Terna? Solo las cuentas Activas (dirData) pueden aportar esto — una
cuenta Inactiva nunca cuenta como "activa en terna" por definición.
```

#### 13B049 — líneas 1409-1412 (comentario)

```text
Fase 10 (17/07/2026): Multicuentas no filtraba Vetado en absoluto —
se agrega el criterio unificado (mismo que Control/Torneos):
un vetado se excluye, salvo que esté Activo en un clan Terna (reingreso),
en cuyo caso se muestra igual que cualquier otro miembro activo.
```

#### 13B050 — líneas 1420-1423 (comentario)

```text
Cuenta Inactiva: solo se muestra si su Celular tiene al menos una
cuenta Activa en un clan Terna (criterio calculado arriba). No
pasa por el chequeo de Vetado de abajo (ese es específico para
decidir si una cuenta ACTIVA vetada se muestra o no).
```

#### 13B051 — líneas 1436-1443 (comentario)

```text
ACTUALIZADO (16/07/2026): este comentario advertía que dirRow no
traería Nivel/Copas/V_Guerra por venir de una lectura cruda de la hoja
física (29 columnas). Ya no aplica: desde la Fase B1 (14/07/2026),
updateVistasDerivadas() arma dirData con _leerDirectorioFisicoComoDC()
(Directorio + Players + Links reconstruidos a formato DC de 60
columnas) antes de llamar a esta función, así que
dirRow[DC.NIVEL-1]/[DC.COPAS-1]/[DC.V_GUERRA-1] sí leen la posición
correcta.
```

#### 13B052 — líneas 1471-1473 (comentario)

```text
Fix: Multicuentas nunca reaplicaba el formato numérico de Nivel/
Copas/V_Guerra al copiarlos desde Directorio (que a su vez los lee de
Players) — mismo formato '#,##0' que usan Players y Control.
```

#### 13B053 — líneas 1491-1495 (comentario)

```text
IMPORTANTE: el color por Rango NUNCA debe aplicarse a filas Inactivas.
El campo Rango de un inactivo puede conservar un valor viejo (de cuando
todavía era miembro activo), así que sin el chequeo de Estado algunos
inactivos quedaban coloreados (los que tenían un Rango viejo no vacío)
y otros no (los que no lo tenían) — algo inconsistente y no deseado.
```


---


# Archivo 14_Nuevos_RoyaleAPI.gs

Hoja Nuevos (RoyaleAPI vía Tampermonkey): restauración, columnas fijas, refresco por pasos, y helpers genéricos como `_leerHojaComoMapaPorTag()`. Los IDs de bloque llevan prefijo `14`.


## Índice de bloques movidos

| ID | Líneas orig. | Ubicación | Resumen |
|---|---|---|---|
| 14B001 | 6-118 | `Cabecera del archivo` | ----- Variables y constantes ----- |
| 14B002 | 120-123 | `Cabecera del archivo` | NUEVO (15-sep-2026, hallazgo B-35 de Plan_Fases.md): movido a Script |
| 14B003 | 126-131 | `NUEVOS_ROYALEAPI_TOKEN` | Índices de columna (1-based) — hoja "Nuevos". |
| 14B004 | 145-148 | `NUEVOS_FILA_DATOS_INICIO` | FIX (13-ago-2026): bloque nuevo "Semana actual" (12 columnas: Ataques/ |
| 14B005 | 167-177 | `OFFN` | PASTEL_CLANES_NUEVOS_ |
| 14B006 | 186-191 | `PASTEL_CLANES_NUEVOS_` | FIX (15-ago-2026, pedido usuario): renombrado de |
| 14B007 | 194-222 | `NOMBRE_CSV_DEBUG_NUEVOS` | SNAPSHOT DE DEPURACIÓN DE LA IMPORTACIÓN DE NUEVOS |
| 14B008 | 228-254 | `SEMANAS_MIN_PARA_PURGAR_DEBUG_NUEVOS` | FIX (02-sep-2026, pedido usuario: "es un error recurrente en tampermonkey... |
| 14B009 | 256-259 | `NUEVOS_RESTORE_PROGRESS_FILE` | Un checkpoint más viejo que esto se descarta como resto de un intento |
| 14B010 | 261-267 | `NUEVOS_RESTORE_PROGRESO_MAX_EDAD_MS` | Presupuesto de tiempo PROPIO de la restauración (más chico que |
| 14B011 | 269-272 | `NUEVOS_RESTORE_PRESUPUESTO_MS` | Tope de candidatos por sub-lote enviado a _aplicarImportacionNuevos() |
| 14B012 | 275-287 | `NUEVOS_RESTORE_LOTE_MAX` | _guardarProgresoRestaurarNuevos(tagsYaRestaurados) |
| 14B013 | 303-308 | `_guardarProgresoRestaurarNuevos` | _cargarProgresoRestaurarNuevos() |
| 14B014 | 332-338 | `_cargarProgresoRestaurarNuevos` | _borrarProgresoRestaurarNuevos() |
| 14B015 | 349-356 | `_borrarProgresoRestaurarNuevos` | _hayRestauracionNuevosPendiente() |
| 14B016 | 364-391 | `_hayRestauracionNuevosPendiente` | _restaurarNuevosSiNoExiste() |
| 14B017 | 392-396 | `_hayRestauracionNuevosPendiente` | SECCIÓN 1: FUNCIONES MANUALES (entry points de mantenimiento, ejecutar a mano |
| 14B018 | 398-403 | `_hayRestauracionNuevosPendiente` | reordenarNuevosAhora() |
| 14B019 | 410-451 | `reordenarNuevosAhora` | REPARACIÓN MANUAL DE FORMATO DE ENCABEZADOS (filas 1-3) — 09/08/2026 |
| 14B020 | 452-461 | `reordenarNuevosAhora` | repararFormatoEncabezadosNuevos() |
| 14B021 | 484-487 | `repararFormatoEncabezadosNuevos` | 2) D1:K2 — título dinámico Temporada/Semana/Día. Reportado por el |
| 14B022 | 527-529 | `repararFormatoEncabezadosNuevos` | FIX (15-ago-2026, pedido usuario): repone también el ancho fijo de |
| 14B023 | 541-544 | `repararFormatoEncabezadosNuevos` | 5) Cuadrícula del historial: se recorre TODO el ancho real actual |
| 14B024 | 551-557 | `repararFormatoEncabezadosNuevos` | Fila 2 (fecha): se relee el valor actual de la celda ANTES de tocar |
| 14B025 | 589-591 | `repararFormatoEncabezadosNuevos` | 7) Filas/columnas congeladas + filtro nativo, por si la hoja los |
| 14B026 | 598-601 | `repararFormatoEncabezadosNuevos` | 8) Borde blanco sobre TODO el bloque de encabezado (filas 1 a 3, |
| 14B027 | 612-616 | `repararFormatoEncabezadosNuevos` | SECCIÓN 2: RESTO DE FUNCIONES (helpers internos de la hoja Nuevos) — sin |
| 14B028 | 645-648 | `_restaurarNuevosSiNoExiste` | No se asume totalCols a secas: si el CSV trae más columnas (no |
| 14B029 | 670-676 | `_restaurarNuevosSiNoExiste` | FIX (11-ago-2026): _pintarEncabezadosNuevos() (arriba) solo formatea los |
| 14B030 | 680-699 | `_restaurarNuevosSiNoExiste` | FIX (06-ago-2026): si se restauraron candidatos desde el CSV (no el |
| 14B031 | 702-707 | `_restaurarNuevosSiNoExiste` | FIX (09-ago-2026): mismo motivo que la llamada equivalente al final de |
| 14B032 | 711-747 | `_restaurarNuevosSiNoExiste` | _pintarEncabezadosNuevos(sh) |
| 14B033 | 844-846 | `_pintarEncabezadosNuevos` | FIX (15-ago-2026, pedido usuario): ancho fijo para las columnas de |
| 14B034 | 858-860 | `_pintarEncabezadosNuevos` | Borde blanco sobre todo el bloque de encabezado (mismo criterio que |
| 14B035 | 868-882 | `_pintarEncabezadosNuevos` | _aplicarAnchoFijoSemanaActualNuevos(sh) |
| 14B036 | 894-925 | `_aplicarAnchoFijoSemanaActualNuevos` | _construirReglasClanesNuevos(sh, numFilas) |
| 14B037 | 949-960 | `_construirReglasClanesNuevos` | _actualizarFormatoGridNuevos(sh) |
| 14B038 | 982-997 | `_actualizarFormatoGridNuevos` | _actualizarSemanaActualNuevos(sh) |
| 14B039 | 1038-1105 | `_actualizarSemanaActualNuevos` | _cerrarSemanaActualNuevos() |
| 14B040 | 1203-1207 | `_aplicarImportacionNuevos` | FIX (06-ago-2026, puntos 4 y 5 del pedido): respaldo crudo de cada |
| 14B041 | 1214-1222 | `_aplicarImportacionNuevos` | 1) FIX (09-ago-2026): en vez de recolectar TODAS las fechas del payload |
| 14B042 | 1227-1230 | `_aplicarImportacionNuevos` | El ancho real de la cuadrícula puede ser mayor a GRID_WIDTH_NUEVOS (20 = |
| 14B043 | 1254-1264 | `_aplicarImportacionNuevos` | FIX (13-ago-2026, pedido del usuario): "los nuevos se agregan al final |
| 14B044 | 1268-1270 | `_aplicarImportacionNuevos` | FIX (06-ago-2026): errores individuales por candidato — ver comentario |
| 14B045 | 1279-1291 | `_aplicarImportacionNuevos` | FIX (06-ago-2026): cada candidato se procesa en su propio try/catch. |
| 14B046 | 1295-1298 | `_aplicarImportacionNuevos` | Red de seguridad: no debería pasar, _insertarNuevosCandidatosOrdenadosPorClan() |
| 14B047 | 1303-1305 | `_aplicarImportacionNuevos` | --- Columnas fijas: refrescar desde Directorio si el tag sigue |
| 14B048 | 1323-1326 | `_aplicarImportacionNuevos` | NC.ROYALE_API se deja tal cual venía en fijasActuales acá (no se |
| 14B049 | 1329-1336 | `_aplicarImportacionNuevos` | --- RoyaleAPI: enlace clicable generado directo desde el Tag, |
| 14B050 | 1341-1346 | `_aplicarImportacionNuevos` | --- Cuadrícula: limpiar el bloque completo de esta fila ANTES de |
| 14B051 | 1354-1357 | `_aplicarImportacionNuevos` | Con _asegurarBloquesParaFechas() ya corrido arriba, esto en la |
| 14B052 | 1381-1390 | `_aplicarImportacionNuevos` | FASE 9 (Consolidado_Cambios_Pendientes_Guerra.md, punto 3): migra a |
| 14B053 | 1409-1414 | `_aplicarImportacionNuevos` | FIX (14-ago-2026, pedido usuario): autolimpieza de candidatos ya |
| 14B054 | 1427-1433 | `_aplicarImportacionNuevos` | FIX (06-ago-2026): mismo formato numérico que ya usa el resto del |
| 14B055 | 1442-1454 | `_aplicarImportacionNuevos` | FIX (09-ago-2026): mismo caso que Control (ver _limpiarLinksAccidentalesEnHoja(sh,3) |
| 14B056 | 1457-1474 | `_aplicarImportacionNuevos` | FIX (pedido usuario): antes, el formato numérico de la cuadrícula |
| 14B057 | 1489-1512 | `_aplicarImportacionNuevos` | _aplicarTodoFormatoCondicionalNuevos(sh) |
| 14B058 | 1531-1533 | `_asegurarBloquesParaFechas` | 1) Fechas realmente faltantes (sin bloque ya asignado), deduplicadas |
| 14B059 | 1545-1551 | `_asegurarBloquesParaFechas` | 2) CASO DE ARRANQUE: si la cuadrícula todavía no tiene NINGÚN bloque |
| 14B060 | 1576-1585 | `_asegurarBloquesParaFechas` | 3) FIX (06-ago-2026): las fechas MÁS RECIENTES que cualquier bloque ya |
| 14B061 | 1602-1607 | `_asegurarBloquesParaFechas` | masRecientes se inserta de la MÁS ANTIGUA (de este lote) a la MÁS |
| 14B062 | 1650-1654 | `_asegurarBloquesParaFechas` | _buscarBloquePorFechaNuevos(fechasHeader, fecha) |
| 14B063 | 1668-1675 | `_buscarBloquePorFechaNuevos` | _cargarSnapshotDebugNuevos() |
| 14B064 | 1690-1724 | `_cargarSnapshotDebugNuevos` | _construirMapaSemanasGuerraTerna() |
| 14B065 | 1758-1793 | `_construirMapaSemanasGuerraTerna` | _construirReglasSemanaActualNuevos(sh, numFilas) |
| 14B066 | 1834-1848 | `_construirReglasSemanaActualNuevos` | _contarSemanasGuerraTerna(tag, mapaPrecomputado) |
| 14B067 | 1881-1888 | `_contarSemanasGuerraTerna` | _formatearBloqueFechaNuevos(sh, col, fecha) |
| 14B068 | 1911-1930 | `_formatearBloqueFechaNuevos` | _getDiaActualYSeccionVigente(ctx) |
| 14B069 | 1947-1964 | `_getDiaActualYSeccionVigente` | _guardarSnapshotDebugImportacionNuevos(candidatosPayload) |
| 14B070 | 1982-1985 | `_guardarSnapshotDebugImportacionNuevos` | 2) Purgar Tags ya establecidos (>= 3 semanas de guerra Terna). |
| 14B071 | 2005-2031 | `_guardarSnapshotDebugImportacionNuevos` | 3b) Guardar CSV aplanado (una fila por registro individual, para |
| 14B072 | 2067-2069 | `_guardarSnapshotDebugImportacionNuevos` | POST — aplicar lo que el userscript detectó como "nuevo" |
| 14B073 | 2071-2109 | `_guardarSnapshotDebugImportacionNuevos` | _aplicarImportacionNuevos(candidatosPayload) |
| 14B074 | 2110-2171 | `_guardarSnapshotDebugImportacionNuevos` | _insertarNuevosCandidatosOrdenadosPorClan(sh, candidatosPayload, tagAFila, dirPorTag) |
| 14B075 | 2205-2212 | `_insertarNuevosCandidatosOrdenadosPorClan` | 3) Insertar cada candidato en su posición correcta, comparando contra |
| 14B076 | 2240-2244 | `_insertarNuevosCandidatosOrdenadosPorClan` | Al final de todo: todavía no hay nada físico que insertar (la fila |
| 14B077 | 2248-2251 | `_insertarNuevosCandidatosOrdenadosPorClan` | Cualquier tag cuya fila ya asignada (de una vuelta anterior de |
| 14B078 | 2263-2267 | `_insertarNuevosCandidatosOrdenadosPorClan` | BLOQUES DE FECHA — lectura y crecimiento dinámico de la cuadrícula |
| 14B079 | 2269-2279 | `_insertarNuevosCandidatosOrdenadosPorClan` | _leerBloquesFechaNuevos(sh) |
| 14B080 | 2291-2293 | `_leerBloquesFechaNuevos` | GET — lista de candidatos para el userscript |
| 14B081 | 2295-2382 | `_leerBloquesFechaNuevos` | _obtenerListaCandidatosNuevos() |
| 14B082 | 2385-2395 | `_obtenerListaCandidatosNuevos` | FIX (24-sep-2026, pedido del usuario -- auditoría Sheet->CSV->JSON, |
| 14B083 | 2406-2410 | `_obtenerListaCandidatosNuevos` | FIX (06-ago-2026): cada candidato ahora informa si YA está siendo |
| 14B084 | 2413-2416 | `_obtenerListaCandidatosNuevos` | FIX (29-ago-2026): mapa semanal por Tag construido SOLO desde |
| 14B085 | 2419-2425 | `_obtenerListaCandidatosNuevos` | FIX (16-sep-2026): contexto vigente (temporada + semana en curso), para |
| 14B086 | 2444-2449 | `_obtenerListaCandidatosNuevos` | FIX (29-ago-2026): ya tiene participación establecida en Terna |
| 14B087 | 2465-2472 | `_obtenerListaCandidatosNuevos` | FIX (11-sep-2026, pedido usuario): objeto vacío a propósito — ver |
| 14B088 | 2477-2488 | `_obtenerListaCandidatosNuevos` | _construirMapaSemanalPorTagDesdeSupercell() |
| 14B089 | 2546-2599 | `_construirMapaSemanalPorTagDesdeSupercell` | _tagTieneParticipacionEstablecidaEnTerna(tag, mapaSemanalPorTag, ctx) |
| 14B090 | 2604-2607 | `_tagTieneParticipacionEstablecidaEnTerna` | FIX (16-sep-2026, ver docblock arriba): descartar la semana de guerra |
| 14B091 | 2630-2634 | `_tagTieneParticipacionEstablecidaEnTerna` | _obtenerTagsEnHojaNuevos(ss) |
| 14B092 | 2649-2672 | `_obtenerTagsEnHojaNuevos` | _ordenarBloquesFechaNuevos(sh) |
| 14B093 | 2696-2716 | `_ordenarBloquesFechaNuevos` | FIX (11-ago-2026) — BUG REAL ENCONTRADO: la versión anterior leía y |
| 14B094 | 2734-2736 | `_ordenarBloquesFechaNuevos` | Fila de Fecha: setValue() SOLO sobre la celda ancla del merge |
| 14B095 | 2750-2788 | `_ordenarBloquesFechaNuevos` | _parseFechaISONuevos(texto) |
| 14B096 | 2798-2841 | `_parseFechaISONuevos` | _purgarNuevosEstablecidos(sh) |
| 14B097 | 2848-2851 | `_purgarNuevosEstablecidos` | FIX (22-ago-2026): mapa de semanas construido UNA sola vez (una sola |
| 14B098 | 2866-2868 | `_purgarNuevosEstablecidos` | Borrar de abajo hacia arriba: borrar una fila de arriba primero |
| 14B099 | 2880-2927 | `_purgarNuevosEstablecidos` | _purgarNuevosExpulsados(sh, dirPorTag) |
| 14B100 | 2950-2952 | `_purgarNuevosExpulsados` | Borrar de abajo hacia arriba: borrar una fila de arriba primero |
| 14B101 | 2961-2965 | `_purgarNuevosExpulsados` | FIX (20-ago-2026, pedido usuario): si la purga deja la hoja en 0 filas |
| 14B102 | 2978-2989 | `_purgarNuevosExpulsados` | _reajustarTituloGridNuevos(sh) |
| 14B103 | 3008-3136 | `_reajustarTituloGridNuevos` | _refrescarColumnasFijasNuevos() |
| 14B104 | 3151-3156 | `_refrescarColumnasFijasNuevos_Paso1_FormatoYPurgado` | FIX (20-ago-2026, pedido usuario): dirPorTag se construye ACÁ ARRIBA |
| 14B105 | 3164-3179 | `_refrescarColumnasFijasNuevos_Paso1_FormatoYPurgado` | FIX (14-ago-2026, pedido usuario): autolimpieza de candidatos ya |
| 14B106 | 3185-3194 | `_refrescarColumnasFijasNuevos_Paso1_FormatoYPurgado` | FIX (02-sep-2026, ver docblock de NUEVOS_RESTORE_PROGRESS_FILE más |
| 14B107 | 3196-3208 | `_refrescarColumnasFijasNuevos_Paso1_FormatoYPurgado` | PEDIDO DEL USUARIO (22-ago-2026): antes de rendirse por "no hay |
| 14B108 | 3297-3312 | `_refrescarColumnasFijasNuevos_Paso3_OrdenYFormato` | FIX (09-ago-2026): ver docblock de _refrescarColumnasFijasNuevos() más |
| 14B109 | 3321-3328 | `_refrescarColumnasFijasNuevos_Paso3_OrdenYFormato` | _renumerarNuevos(sh) |
| 14B110 | 3338-3348 | `_renumerarNuevos` | _reordenarFilasNuevosPorClanYNombre(sh) |
| 14B111 | 3391-3475 | `_reordenarFilasNuevosPorClanYNombre` | _restaurarNuevosDesdeCsvDebug() |
| 14B112 | 3495-3498 | `_restaurarNuevosDesdeCsvDebug` | FIX (22-ago-2026): mapa de semanas construido UNA sola vez en vez de |
| 14B113 | 3517-3519 | `_restaurarNuevosDesdeCsvDebug` | Fecha_TS (numérico, epoch ms) -- ver docblock de esta función. |
| 14B114 | 3579-3582 | `_restaurarNuevosDesdeCsvDebug` | --- Procesar en sub-lotes acotados por tiempo, guardando checkpoint |
| 14B115 | 3605-3609 | `_restaurarNuevosDesdeCsvDebug` | Sub-lote aplicado con éxito -- sus Tags pasan a "ya restaurados", |
| 14B116 | 3621-3624 | `_restaurarNuevosDesdeCsvDebug` | pendientesReales: cuántos Tags del payload total (que califican por |
| 14B117 | 3648-3699 | `_restaurarNuevosDesdeCsvDebug` | _asegurarBloquesParaFechas(sh, fechasNecesarias) |
| 14B118 | 3700-3751 | `_restaurarNuevosDesdeCsvDebug` | _seleccionarFechasNuevasNecesariasNuevos(sh, candidatosPayload) |
| 14B119 | 3762-3787 | `_seleccionarFechasNuevasNecesariasNuevos` | FIX (12-ago-2026): bug reportado — "no está agregando la última semana |
| 14B120 | 3843-3868 | `_seleccionarFechasNuevasNecesariasNuevos` | FASE 9 (Consolidado_Cambios_Pendientes_Guerra.md, punto 3): MIGRACIÓN DE |
| 14B121 | 3870-3883 | `_seleccionarFechasNuevasNecesariasNuevos` | _fechaATemporadaSemana(fecha) |
| 14B122 | 3889-3893 | `_fechaATemporadaSemana` | Mismo ajuste de "mes efectivo" que _calcularMesEfectivoRealDeHoy(), |
| 14B123 | 3915-3929 | `_fechaATemporadaSemana` | _mapaNombreClanATagTerna() |
| 14B124 | 3956-4021 | `_mapaNombreClanATagTerna` | _migrarNuevosAHistorico(candidatosPayload) |
| 14B125 | 4032-4034 | `_migrarNuevosAHistorico` | FIX (30-ago-2026): verificación cruzada e independiente del nombre de |
| 14B126 | 4049-4052 | `_migrarNuevosAHistorico` | Punto 3: SOLO clanes Terna. reg.clan es el nombre tal cual lo |
| 14B127 | 4093-4096 | `_migrarNuevosAHistorico` | 2) Por cada temporada distinta presente en el lote: cargar la fuente |
| 14B128 | 4118-4120 | `_migrarNuevosAHistorico` | YA existe -- regla de no pisado (ver docblock de sección arriba): |

---

## Detalle (texto original, sin cambios)

Cada bloque se copió tal cual estaba en el `.gs` (sin los `//`). Los números de línea son los del archivo ANTES de la limpieza.


### Ubicación: `Cabecera del archivo`

#### 14B001 — líneas 6-118 (comentario)

```text
----- Variables y constantes -----
Complementa (NO reemplaza) 18_CorreccionGuerra.gs. Mismo mecanismo general
(userscript de Tampermonkey visitando perfiles de RoyaleAPI + endpoints
doGet/doPost con token propio), pero para la hoja "Nuevos" (creada a mano
por el usuario como réplica reducida de Control):

  Columnas fijas (11, fila de encabezados = 3, datos desde fila 4):
    N° | Tag | Nombre | Nom_Multi | Clan | Nivel | Copas | V_Guerra |
    Días inactivo | Celular | RoyaleAPI

  Cuadrícula (5 bloques de 4 columnas cada uno, empieza en columna L=12):
    Bloque = Clan | Ataques | Fame | Barcos
    La FECHA de cada bloque vive en la FILA 2 (una celda por bloque,
    normalmente combinada sobre las 4 columnas del bloque).

FIX (06-ago-2026) — Celular y RoyaleAPI: agregadas a la derecha de "Días
inactivo" (pedido explícito del usuario). Celular se refresca desde
Directorio en cada importación (mismo dato que DC.CELULAR, formato
'### ### ### ###', igual que en Directorio/Administradores). RoyaleAPI
es un enlace clicable generado directo desde el Tag del jugador (mismo
patrón que usa la hoja Links para LC.ROYALE_API vía makeLink()) — no se
copia del Directorio porque ese enlace vive como RichText en la hoja
Links, y _leerDirectorioFisicoComoDC() solo recupera su TEXTO visible
("Link"), nunca la URL real. También se agregó formato condicional en
tonos pastel por Clan (una fila completa por color) y formato numérico
consistente con el resto del proyecto para las columnas numéricas
(Nivel/Copas/V_Guerra/Días inactivo: '#,##0'; Celular: '### ### ### ###').
Ver _aplicarImportacionNuevos() y _aplicarTodoFormatoCondicionalNuevos()
más abajo.

CANDIDATOS: activos de un clan Terna, Rango = "Miembro", Admin != "Sí"
(ver _obtenerListaCandidatosNuevos()). La condición "tuvo alguna de sus
últimas 3 semanas en OTRO clan" (FIX 06-ago-2026: antes solo se
revisaban las últimas 2 — "última y/o penúltima") la evalúa el propio
userscript (es el único lado que tiene acceso al historial real de
RoyaleAPI) — el backend solo entrega la lista de candidatos a revisar y
recibe los que el userscript ya determinó que sí son "nuevos".

ALINEACIÓN POR FECHA: cada registro que manda el userscript trae su fecha
real (texto ISO "YYYY-MM-DD", tal como la muestra RoyaleAPI, normalizada a
domingo por _parseFechaISONuevos() — ver FIX 05-ago-2026 ahí). Se compara
día/mes/año contra las fechas ya presentes en la fila 2 de Nuevos. Si una
fecha de la fila 2 no tiene registro para un jugador, esas 4 celdas quedan
vacías (nunca en cero) — ver _aplicarImportacionNuevos(), que limpia el
bloque completo antes de rescribir solo lo que sí llegó.

FIX (05-ago-2026) — YA NO SE DESCARTAN REGISTROS SIN BLOQUE: el diseño
original topeaba en 5 bloques compartidos por TODOS los jugadores y
descartaba en silencio cualquier registro cuya fecha no matcheara ninguno
(pedido explícito del usuario: distintas cuentas pueden tener su historial
desalineado entre sí — p. ej. si a una le faltó participar en alguna
guerra puntual — así que el conjunto de fechas realmente necesario en un
mismo envío puede superar la cantidad de bloques actuales). Ahora
_asegurarBloquesParaFechas() (más abajo) crea/reutiliza bloques según haga
falta ANTES de escribir cualquier fila, así que ningún registro se pierde
aunque el total de bloques crezca.

FIX (06-ago-2026) — BLOQUES NUEVOS A LA IZQUIERDA, SIN TOPE DE 5 FILAS:
dos cambios de comportamiento en _asegurarBloquesParaFechas() y en el
userscript (Tampermonkey.md):
  1) El userscript ya NO recorta el historial a las 5 filas más recientes
     antes de enviarlo — manda TODO lo que la tabla de RoyaleAPI trae
     cargado. Antes, si la hoja ya tenía más de 5 columnas de fecha, las
     más antiguas nunca podían completarse para un jugador nuevo (nunca
     llegaba suficiente historial). Ver "REGISTROS_MAX_ENVIO" ahí, un
     tope de seguridad generoso, no una limitación real.
  2) Una fecha que sea MÁS RECIENTE que cualquier bloque ya existente
     (una semana nueva recién publicada en RoyaleAPI) ahora se inserta a
     la IZQUIERDA de la cuadrícula, no al final — la hoja "Nuevos" va de
     más reciente (izquierda) a más antigua (derecha), así que agregar
     siempre al final quedaba al revés del resto de la hoja. Fechas más
     antiguas que ya no encajan ("relleno"/backfill, típico al completar
     historial de un miembro recién agregado) siguen el criterio previo:
     reutilizan un bloque vacío si lo hay, o se agregan al final. Ver
     docblock de _asegurarBloquesParaFechas() para el detalle completo.

PARTE 0 — Reconstrucción tras Demoler (04-ago-2026): Nuevos es una hoja
creada A MANO por el usuario (igual que Control_2, ver
23_Control2_GuerraSemanal.gs), así que setupAllSheets()
(02_Setup_Hojas.gs) NO la crea ni la conoce. Sin un mecanismo dedicado,
demolerTodoElSpreadsheet() + runAll() la borraría para siempre.
_restaurarNuevosSiNoExiste() sigue el MISMO patrón que
_restaurarControl2SiNoExiste() (23_Control2_GuerraSemanal.gs): solo actúa si
la hoja NO existe, y entonces:
  1) La crea.
  2) Si hay Backup_Nuevos.csv en Drive, vuelca sus filas TAL CUAL
     (candidatos + historial de RoyaleAPI ya importado por el userscript
     antes del Demoler), restaurando los datos sin esperar a la próxima
     corrida del userscript.
  3) Repone encabezados/formato con _pintarEncabezadosNuevos() —
     heredando el mismo look & feel que Control: fondo negro
     (CFG.COLORES.HEADER_BG), letra blanca (CFG.COLORES.HEADER_FG),
     bordes y fila de encabezados congelada. Un CSV solo guarda valores,
     nunca merges ni formato, así que esto SIEMPRE se repone después de
     restaurar.

El respaldo Backup_Nuevos.csv NO requiere código nuevo: al ser una hoja
no listada en `hojasProtegidas` ni `hojasConRespaldoDedicado`
(respaldarHojasDerivadasCSV(), 05_Backup_CSV.gs), se respalda automáticamente
en CADA corrida de runAll()/runUpdate()/runSyncCSV(), igual que cualquier
otra hoja "derivada" del spreadsheet (ver comentario explícito por nombre
a "Nuevos" en respaldarHojasRestantesCSV(), 05_Backup_CSV.gs). Se guarda SIN
protección contra reducción de filas (protegerContraReduccion=false),
porque es normal que la cantidad de candidatos cambie de una corrida a
otra.

Si tampoco existe Backup_Nuevos.csv (primera vez, nunca se respaldó), la
hoja queda creada pero vacía — los candidatos y su historial los repuebla
el userscript de Tampermonkey en su próxima corrida (doPost).

Debe llamarse dentro de PASOS_RUNALL (00_Main.gs), junto a
_restaurarControl2SiNoExiste().
=============================================================================
```

#### 14B002 — líneas 120-123 (comentario)

```text
NUEVO (15-sep-2026, hallazgo B-35 de Plan_Fases.md): movido a Script
Properties vía _scriptToken() (37_Web_API.gs). Debe coincidir con el
userscript.
ACTUALIZACIÓN (19-sep-2026): retirado el literal de respaldo del código.
```


### Ubicación: `NUEVOS_ROYALEAPI_TOKEN`

#### 14B003 — líneas 126-131 (comentario)

```text
---------------------------------------------------------------------------
Índices de columna (1-based) — hoja "Nuevos".
FIX (13-ago-2026, pedido usuario): Clan se movió al final del bloque fijo
(después de RoyaleAPI). Todas las referencias del resto del archivo usan
NC.CAMPO simbólicamente, así que este cambio de valores se propaga solo.
---------------------------------------------------------------------------
```


### Ubicación: `NUEVOS_FILA_DATOS_INICIO`

#### 14B004 — líneas 145-148 (comentario)

```text
FIX (13-ago-2026): bloque nuevo "Semana actual" (12 columnas: Ataques/
Puntaje/Barcos x J/V/S/D), insertado ANTES del historial de RoyaleAPI. El
historial (que antes empezaba en la columna 12) ahora arranca 12 columnas
más a la derecha.
```


### Ubicación: `OFFN`

#### 14B005 — líneas 167-177 (docblock)

```text
PASTEL_CLANES_NUEVOS_
Paleta de colores pastel para el formato condicional por Clan de
_aplicarFormatoCondicionalClanesNuevos() — se asigna un color por clan
Terna, en el mismo orden que devuelve _getNombresClanesTernaOrdenados()
(hoja Clan). Mismos hex ya usados en otras partes del proyecto (ver
comentario "Raíz/Secundario/Respaldo" en 01_Config_Global.gs y las categorías de
Mensajes) para mantener una sola paleta pastel consistente en todo el
spreadsheet. Si algún día hubiera más clanes Terna que colores en esta
lista, se recicla desde el principio (ver % en la función).
```


### Ubicación: `PASTEL_CLANES_NUEVOS_`

#### 14B006 — líneas 186-191 (comentario)

```text
FIX (15-ago-2026, pedido usuario): renombrado de
'ClanSystem_Debug_ImportNuevos.csv' a 'Correcciones_Nuevos.csv' — mismo
archivo, mismo contenido y lógica, solo cambia el nombre en Drive (para
que quede consistente con 'Correcciones_Guerra.csv', su equivalente del
otro flujo). El archivo viejo con el nombre anterior NO se borra solo:
hay que borrarlo a mano en Drive si ya no se quiere conservar.
```


### Ubicación: `NOMBRE_CSV_DEBUG_NUEVOS`

#### 14B007 — líneas 194-222 (comentario)

```text
=============================================================================
SNAPSHOT DE DEPURACIÓN DE LA IMPORTACIÓN DE NUEVOS
(antes se citaba como "08b_Nuevos_Debug_Snapshot.gs", un nombre provisional:
nunca fue un archivo aparte, su contenido es parte de este archivo).
Resuelve los puntos 4 y 5 del pedido:

  4) Cada vez que llega un payload del userscript (doPost accion=
     importarNuevos), se guarda una copia CRUDA de lo recibido (por Tag,
     con fecha de importación y los registros tal cual llegaron) en
     Drive, en formato JSON (para depuración programática) y CSV (para
     revisar a simple vista en Sheets/Excel). Esto permite comparar lo
     que el userscript realmente mandó contra lo que terminó escrito en
     la hoja "Nuevos", sin depender de los logs de Apps Script (que se
     pierden).

  5) Ese archivo temporal se autolimpia: cualquier Tag que ya acumule al
     menos 3 semanas DISTINTAS de participación de guerra (AtaquesSemana
     > 0) en cualquiera de los clanes Terna (según la hoja Guerra) se
     elimina del snapshot en cada corrida — ya cumplió el criterio de
     "candidato establecido" y no hace falta seguir depurando su
     importación.

USO: llamar _guardarSnapshotDebugImportacionNuevos(candidatosPayload) al
PRINCIPIO de _aplicarImportacionNuevos(candidatosPayload), antes de
procesar filas — así queda un registro incluso si algo falla al escribir
en la hoja. (Esta llamada ya está integrada en _aplicarImportacionNuevos(),
en este mismo archivo; el bloque "INTEGRACIÓN" que se mencionaba aquí ya no
existe.)
=============================================================================
```


### Ubicación: `SEMANAS_MIN_PARA_PURGAR_DEBUG_NUEVOS`

#### 14B008 — líneas 228-254 (comentario)

```text
FIX (02-sep-2026, pedido usuario: "es un error recurrente en tampermonkey...
la hoja Nuevos solo me muestra 1 o 2 jugadores... espera a que vuelva a
ejecutar en tampermonkey para traer el resto, aunque sean los mismos que ya
se habían escaneado antes"). Causa raíz encontrada: _restaurarNuevosDesdeCsvDebug()
(más abajo) procesaba TODO el respaldo (Correcciones_Nuevos.csv) de un solo
tirón, en un único ciclo sin puntos de control -- a diferencia del resto del
proyecto (ver _guardarProgresoPlayers()/_cargarProgresoPlayers()/
_borrarProgresoPlayers(), 09_API_ClashRoyale.gs), que sí divide trabajo
potencialmente largo en tandas resumibles. Con varias decenas de candidatos
represados en el respaldo (típico justo después de un Demoler + runAll()),
cada uno con varias llamadas a la Sheets API (leer/escribir columnas fijas,
limpiar y rescribir la cuadrícula, insertar fila si no existía), el tiempo
total podía superar el límite duro de la plataforma A MITAD del ciclo. Ese
corte no es un error de JS capturable por try/catch (ver el FIX de
guardarApiDump(), 00_Main.gs, mismo síntoma): el proceso completo de Apps
Script se termina de golpe, dejando en la hoja SOLO las filas que ya
alcanzaron a escribirse (1 o 2, en la práctica) antes del corte. Como la
hoja "Nuevos" deja de estar vacía con esas pocas filas, la condición que
dispara la restauración (`lastRow < NUEVOS_FILA_DATOS_INICIO`, ver
_refrescarColumnasFijasNuevos_Paso1_FormatoYPurgado() más abajo) nunca
vuelve a cumplirse, y el resto del respaldo queda huérfano -- solo
reaparece si Tampermonkey vuelve a escanear esos mismos jugadores desde
cero. Se agrega un checkpoint en Drive (mismo patrón que el progreso de
/players) con los Tags que YA se restauraron: cada corrida de
_restaurarNuevosDesdeCsvDebug() retoma justo donde quedó la anterior,
procesando el respaldo en sub-lotes acotados por tiempo (ver
NUEVOS_RESTORE_PRESUPUESTO_MS) en vez de todo junto.
```


### Ubicación: `NUEVOS_RESTORE_PROGRESS_FILE`

#### 14B009 — líneas 256-259 (comentario)

```text
Un checkpoint más viejo que esto se descarta como resto de un intento
abandonado (ej. el respaldo cambió de forma relevante entre medio) en vez
de arrastrarse indefinidamente -- mismo criterio que
CFG.PLAYERS_PROGRESO_MAX_EDAD_MS.
```


### Ubicación: `NUEVOS_RESTORE_PROGRESO_MAX_EDAD_MS`

#### 14B010 — líneas 261-267 (comentario)

```text
Presupuesto de tiempo PROPIO de la restauración (más chico que
CFG.RUNALL_PRESUPUESTO_MS a propósito): dentro de este paso de
runAll()/runGuerraRapido() todavía queda tiempo de sobra para el resto de
_refrescarColumnasFijasNuevos_Paso1_FormatoYPurgado() (purgados) y para
que _ejecutarPorTandas() alcance a cortar limpio ENTRE pasos si hiciera
falta, en vez de arriesgarse a que la restauración sola se coma el límite
duro de la plataforma.
```


### Ubicación: `NUEVOS_RESTORE_PRESUPUESTO_MS`

#### 14B011 — líneas 269-272 (comentario)

```text
Tope de candidatos por sub-lote enviado a _aplicarImportacionNuevos()
dentro de un mismo ciclo de restauración -- evita medir el tiempo
candidato por candidato (impreciso con lotes muy chicos) sin dejar de
cortar con la frecuencia suficiente para respetar NUEVOS_RESTORE_PRESUPUESTO_MS.
```


### Ubicación: `NUEVOS_RESTORE_LOTE_MAX`

#### 14B012 — líneas 275-287 (docblock)

```text
_guardarProgresoRestaurarNuevos(tagsYaRestaurados)
Guarda en Drive los Tags que _restaurarNuevosDesdeCsvDebug() ya alcanzó a
escribir en la hoja "Nuevos" en este intento de restauración (que puede
abarcar varias corridas de runAll()/runGuerraRapido()). Mismo patrón que
_guardarProgresoPlayers() (09_API_ClashRoyale.gs): envuelto con `_ts` para
poder distinguir un checkpoint vigente de uno viejo abandonado.
(25-sep-2026, FASE B) Se guarda en "Otros" (DRIVE_FOLDER_ID_OTROS), antes
en "JSON" — ver checklist de AVISOS ABIERTOS / FASE B en
09_API_ClashRoyale.gs. Lectura y escritura están las dos en este archivo,
así que no hay hueco temporal.
@param {string[]} tagsYaRestaurados
```


### Ubicación: `_guardarProgresoRestaurarNuevos`

#### 14B013 — líneas 303-308 (docblock)

```text
_cargarProgresoRestaurarNuevos()
@returns {string[]|null} Tags ya restaurados en el intento vigente, o null
  si no hay checkpoint, no se pudo leer, o el que había quedó demasiado
  viejo (ver NUEVOS_RESTORE_PROGRESO_MAX_EDAD_MS).
```


### Ubicación: `_cargarProgresoRestaurarNuevos`

#### 14B014 — líneas 332-338 (docblock)

```text
_borrarProgresoRestaurarNuevos()
Se llama cuando _restaurarNuevosDesdeCsvDebug() termina de restaurar TODO
el respaldo pendiente (o cuando ya no queda nada que califique tras el
filtro de membresía/semanas) -- así una corrida futura, si la hoja vuelve
a quedar vacía por otro Demoler, arranca un checkpoint limpio.
```


### Ubicación: `_borrarProgresoRestaurarNuevos`

#### 14B015 — líneas 349-356 (docblock)

```text
_hayRestauracionNuevosPendiente()
true si quedó un checkpoint vigente con al menos un Tag ya restaurado --
indica que un intento de restauración anterior se cortó a mitad de camino
(por el límite duro de la plataforma) y todavía puede quedar respaldo sin
aplicar. Se usa en _refrescarColumnasFijasNuevos_Paso1_FormatoYPurgado()
para NO depender únicamente de "la hoja está vacía" (ver FIX arriba).
```


### Ubicación: `_hayRestauracionNuevosPendiente`

#### 14B016 — líneas 364-391 (docblock)

```text
_restaurarNuevosSiNoExiste()
Ver "PARTE 0" en el comentario de cabecera de este archivo. Mismo patrón
que _restaurarControl2SiNoExiste() (23_Control2_GuerraSemanal.gs): SOLO actúa
si la hoja NO existe (nunca toca una hoja ya presente, ni siquiera para
completarla — no se pisan filas que ya haya escrito el userscript).
Si no existe:
  1) Crea la hoja "Nuevos".
  2) Si hay Backup_Nuevos.csv (respaldado automáticamente en cada corrida
     por respaldarHojasDerivadasCSV(), 05_Backup_CSV.gs — ver comentario de
     cabecera de este archivo), vuelca sus filas TAL CUAL: columnas fijas
     (Tag, Nombre, Nom_Multi, Clan, Nivel, Copas, V_Guerra, Días
     inactivo, Celular, RoyaleAPI) + toda la cuadrícula (hasta 5 bloques
     de Clan/Ataques/Fame/Barcos, incluidas las fechas de la fila 2) —
     restaura exactamente lo que había antes del Demoler, sin esperar a
     la próxima corrida del userscript.
  3) Si no hay CSV tampoco (primera vez, nunca se respaldó), la hoja
     queda creada pero vacía — los candidatos y su historial los repuebla
     el userscript de Tampermonkey en su próxima corrida vía doPost() ->
     _aplicarImportacionNuevos().
  4) Llama a _pintarEncabezadosNuevos() para reponer el formato/merges de
     las 3 filas de encabezado — un CSV solo guarda valores, nunca merges
     ni fondo/color, así que esto se repone SIEMPRE después de restaurar
     No
     pisa los valores ya restaurados (ej. las fechas de la fila 2): sh.
     getRange(...).merge() conserva el valor de la celda superior-
     izquierda del bloque, que es justo donde el CSV guardó ese valor.
```

#### 14B017 — líneas 392-396 (comentario)

```text
=============================================================================
SECCIÓN 1: FUNCIONES MANUALES (entry points de mantenimiento, ejecutar a mano
desde el editor de Apps Script). Reordenado el 23-ago-2026 (pedido usuario).
Ninguna tiene función _continuarX asociada.
=============================================================================
```

#### 14B018 — líneas 398-403 (docblock)

```text
reordenarNuevosAhora()
Ejecutar UNA VEZ a mano desde el editor de Apps Script para arreglar de
inmediato el orden actual (las filas que Tampermonkey ya dejó
desordenadas), sin esperar a la próxima corrida automática.
```


### Ubicación: `reordenarNuevosAhora`

#### 14B019 — líneas 410-451 (comentario)

```text
=============================================================================
REPARACIÓN MANUAL DE FORMATO DE ENCABEZADOS (filas 1-3) — 09/08/2026
=============================================================================
Pedido del usuario: TODOS los encabezados de "Nuevos" (filas 1 a 3 —
título, fecha de cada bloque, y Clan/Ataques/Fame/Barcos) deben tener
fondo negro, letra blanca en negrita y bordes blancos — mismo criterio
que ya aplican _pintarEncabezadosNuevos() (bloques originales, creados
junto con la hoja) y _formatearBloqueFechaNuevos() (bloques nuevos,
agregados por _asegurarBloquesParaFechas() cuando llega una fecha sin
bloque todavía). El problema reportado es que varias de las columnas de
fecha que se fueron agregando A LO LARGO DEL TIEMPO en la hoja real NO
tienen ese formato — lo más probable es que se hayan creado con alguna
versión anterior del código (antes de que _formatearBloqueFechaNuevos()
existiera/se llamara en todos los casos), así que el código actual ya
las deja bien formateadas a partir de ahora, pero no corrige solo, con
el paso del tiempo, las columnas que ya quedaron mal en la hoja.

FIX (14-ago-2026, pedido usuario): esta función NO se había actualizado
junto con la reestructuración del 13-ago (bloque "Semana actual", Clan
movido al final, título D1:K2 dinámico, corner "MIEMBROS NUEVOS"). Como
_pintarEncabezadosNuevos() SOLO corre cuando la hoja "Nuevos" se crea o
se restaura desde cero (_restaurarNuevosSiNoExiste() hace
"if (ss.getSheetByName(...)) return;" — nunca toca una hoja que ya
existe), en una hoja YA EXISTENTE (el caso normal, la hoja lleva
semanas en uso) esos encabezados nuevos nunca se llegaban a pintar:
D1:K2 se quedaba con el texto plano viejo (nunca con la fórmula), y el
bloque "Semana actual" + el título general de "Historial RoyaleAPI..."
quedaban directamente sin pintar. repararFormatoEncabezadosNuevos() es
precisamente la función pensada para reparar una hoja ya existente sin
recrearla — se actualiza acá para que también reponga todo lo nuevo.

repararFormatoEncabezadosNuevos() (más abajo) es la función para correr
UNA VEZ a mano (Ejecutar > repararFormatoEncabezadosNuevos, desde el
editor de Apps Script) y dejar TODA la hoja al día, sin importar cuántos
bloques tenga hoy (a diferencia de _pintarEncabezadosNuevos(), que da por
sentado el ancho ORIGINAL de GRID_NUM_BLOQUES_NUEVOS=5 bloques, esta
función lee el ancho REAL actual de la cuadrícula con sh.getLastColumn()
y reformatea todos los bloques que encuentre, sean 5, 6 o más). No borra
ni cambia ninguna fecha ni ningún dato de la cuadrícula — solo re-aplica
fondo/letra/negrita/alineación/bordes ahí. La ÚNICA excepción es D1:K2,
que pasa a llevar la fórmula dinámica en vez del texto plano que tenía.
Es segura de correr las veces que haga falta (idempotente).
```

#### 14B020 — líneas 452-461 (docblock)

```text
repararFormatoEncabezadosNuevos()
Re-pinta TODOS los encabezados (filas 1-3) de "Nuevos" con la estructura
vigente: corner "MIEMBROS NUEVOS" (A1:C2), título dinámico D1:K2, bloque
"Semana actual" (Ataques/Puntaje/Barcos x J/V/S/D), encabezados fijos con
Clan al final, y título + Clan/Ataques/Fame/Barcos de TODOS los bloques
de fecha del historial (sea cual sea su cantidad real hoy). No toca
ninguna fila de datos (4+) ni ningún valor de la cuadrícula (fechas,
nombres de clan) — solo reaplica encabezados/formato visual.
```


### Ubicación: `repararFormatoEncabezadosNuevos`

#### 14B021 — líneas 484-487 (comentario)

```text
2) D1:K2 — título dinámico Temporada/Semana/Día. Reportado por el
   usuario con texto plano en vez de la fórmula viva: se reescribe
   siempre con setFormula() (idempotente, no rompe nada si ya era la
   fórmula correcta).
```

#### 14B022 — líneas 527-529 (comentario)

```text
FIX (15-ago-2026, pedido usuario): repone también el ancho fijo de
Sábado/Domingo — ver _aplicarAnchoFijoSemanaActualNuevos() (mismo
criterio que _pintarEncabezadosNuevos()).
```

#### 14B023 — líneas 541-544 (comentario)

```text
5) Cuadrícula del historial: se recorre TODO el ancho real actual
   (COL_INICIO_GRID_NUEVOS hasta lastCol), bloque por bloque de
   GRID_BLOQUE_ANCHO_NUEVOS columnas — no se asume que sean 5 bloques,
   para cubrir tanto los originales como cualquiera agregado después.
```

#### 14B024 — líneas 551-557 (comentario)

```text
Fila 2 (fecha): se relee el valor actual de la celda ANTES de tocar
nada — si el bloque ya estaba correctamente combinado, getValue()
sobre el rango devuelve el valor de la celda superior-izquierda; si
por algún motivo NO estaba combinado (rastro de una versión vieja
del código), se toma igual el valor de esa primera celda. merge() +
setValue() con el mismo valor no pierde la fecha, y de paso arregla
el merge si estaba roto.
```

#### 14B025 — líneas 589-591 (comentario)

```text
7) Filas/columnas congeladas + filtro nativo, por si la hoja los
   hubiera perdido en algún momento (mismo criterio que
   _pintarEncabezadosNuevos()).
```

#### 14B026 — líneas 598-601 (comentario)

```text
8) Borde blanco sobre TODO el bloque de encabezado (filas 1 a 3,
   columna 1 hasta lastCol), y se vuelve a limpiar sobre el corner
   A1:C2 para no partir esa celda combinada — mismo criterio que
   _pintarEncabezadosNuevos()/_formatearBloqueFechaNuevos().
```

#### 14B027 — líneas 612-616 (comentario)

```text
=============================================================================
SECCIÓN 2: RESTO DE FUNCIONES (helpers internos de la hoja Nuevos) — sin
cambios de orden respecto de antes del reordenamiento del 23-ago-2026, salvo
por las 2 que se movieron arriba a la Sección 1.
=============================================================================
```


### Ubicación: `_restaurarNuevosSiNoExiste`

#### 14B028 — líneas 645-648 (comentario)

```text
No se asume totalCols a secas: si el CSV trae más columnas (no
debería pasar con la estructura fija de Nuevos, pero por robustez
ante cualquier cambio futuro de GRID_NUM_BLOQUES_NUEVOS), se
conservan igual en vez de truncarlas.
```

#### 14B029 — líneas 670-676 (comentario)

```text
FIX (11-ago-2026): _pintarEncabezadosNuevos() (arriba) solo formatea los
primeros GRID_NUM_BLOQUES_NUEVOS (5) bloques — si el CSV restaurado trae
más columnas de fecha (lo normal, la hoja real crece con el tiempo), esos
bloques quedan sin fondo negro/letra blanca, y de paso el orden de fecha
que traía el CSV puede no ser el correcto (más reciente a la izquierda).
Se corrige de inmediato acá, sin esperar a que _refrescarColumnasFijasNuevos()
corra más adelante en PASOS_RUNALL (ver FIX 11-ago-2026 ahí, mismo bug).
```

#### 14B030 — líneas 680-699 (comentario)

```text
FIX (06-ago-2026): si se restauraron candidatos desde el CSV (no el
caso de hoja vacía, que ya retornó arriba en las dos ramas anteriores),
se pinta también el formato condicional por Clan de una vez, en vez de
esperar a la próxima corrida del userscript (_aplicarImportacionNuevos()
ya lo hace, pero recién cuando lleguen datos nuevos).
FIX (09-ago-2026): en este punto — justo después de un Demoler — la
hoja "Clan" recién fue recreada por _setupClan() con la columna Nombre
VACÍA (se llena recién en el paso de _fetchAllClanData(), más adelante
en PASOS_RUNALL) y CFG.CLAN_NOMBRES_FALLBACK solo tiene registrado el
nombre del clan principal (#GCRG8L00) — ver comentario completo en
_getNombresClanesTernaOrdenados() (01_Config_Global.gs) y en
_refrescarColumnasFijasNuevos() (más abajo en este archivo). Por eso
ESTA llamada, aunque no se quita (deja algo de color de inmediato en
vez de esperar), va a colorear SOLO el clan principal — es la causa
exacta del bug reportado ("al demoler y restaurar, solo le dio color a
las filas del clan principal"). Se corrige de verdad más abajo: la
MISMA función se vuelve a llamar al final de
_refrescarColumnasFijasNuevos(), que en PASOS_RUNALL corre en un paso
POSTERIOR a _fetchAllClanData()/updateClanSheet() — con la hoja "Clan"
ya completa, ahí sí se recolorean los 4 clanes Terna correctamente.
```

#### 14B031 — líneas 702-707 (comentario)

```text
FIX (09-ago-2026): mismo motivo que la llamada equivalente al final de
_aplicarImportacionNuevos() (ver comentario ahí) — el CSV restaurado
pudo guardar, tal cual, un valor de "Clan" con forma de dominio (ej.
"LAMPA.COM") en algún bloque de fecha; al volcarlo con setValues()
arriba, Sheets puede volver a autoenlazarlo de inmediato. headerRow=
NUEVOS_FILA_HEADERS (3), igual que en Control.
```

#### 14B032 — líneas 711-747 (docblock)

```text
_pintarEncabezadosNuevos(sh)
(Re)pinta las 3 filas de encabezado de "Nuevos" completas — mismo criterio
visual que _pintarEncabezadosControl()/_pintarEncabezadosControl2()
(02_Setup_Hojas.gs / 23_Control2_GuerraSemanal.gs): fondo CFG.COLORES.HEADER_BG,
letra CFG.COLORES.HEADER_FG, negrita, centrado, filas 1-3 congeladas.
No toca datos (filas 4+), solo encabezados — se puede volver a llamar
sobre una hoja ya existente sin perder filas de candidatos.

FIX (13-ago-2026, pedido usuario):
  - A1:C2 ahora lleva el título fijo "MIEMBROS NUEVOS" (antes iba vacío).
  - D1:K2 lleva el título dinámico Temporada/Semana/Día (misma lógica que
    Control, ver CFG.NUEVOS_TITULO_FORMULA).
  - Nuevo bloque "Semana actual" (L1:W1, 12 columnas: Ataques/Puntaje/
    Barcos x J/V/S/D) entre las columnas fijas y el historial de
    RoyaleAPI — mismos valores que Control para la semana de guerra
    vigente (ver _actualizarSemanaActualNuevos()).
  - El historial de RoyaleAPI ahora arranca en COL_INICIO_GRID_NUEVOS
    (columna X), 12 columnas más a la derecha que antes.
  - Clan se movió al final del bloque de encabezados fijos (ver NC.CLAN).

  Fila 1: A1:C2 combinado "MIEMBROS NUEVOS" (sin bordes — permite
          inmovilizar hasta la columna C sin partir la celda, mismo
          truco que Control/Control_2); D1:K2 combinado con el título
          dinámico; L1:W1 combinado "Semana actual"; X1 en adelante
          (cuadrícula), una celda por fila 1 con el título general de la
          cuadrícula.
  Fila 2: fila 2 de D1:K2 (parte del título dinámico); una celda por
          métrica del bloque "Semana actual" (Ataques/Puntaje/Barcos);
          una celda por bloque del historial (combinada sobre sus 4
          columnas), vacía — ahí escribe la FECHA real
          _aplicarImportacionNuevos() cuando el userscript manda datos.
  Fila 3: encabezados fijos (N°|Tag|Nombre|Nom_Multi|Nivel|Copas|
          V_Guerra|Días inactivo|Celular|RoyaleAPI|Clan) + J/V/S/D por
          cada métrica de "Semana actual" + por cada bloque del
          historial, Clan|Ataques|Fame|Barcos.
```


### Ubicación: `_pintarEncabezadosNuevos`

#### 14B033 — líneas 844-846 (comentario)

```text
FIX (15-ago-2026, pedido usuario): ancho fijo para las columnas de
Sábado/Domingo del bloque "Semana actual" — ver
_aplicarAnchoFijoSemanaActualNuevos() más abajo en este archivo.
```

#### 14B034 — líneas 858-860 (comentario)

```text
Borde blanco sobre todo el bloque de encabezado (mismo criterio que
Control_2), y se limpia después sobre el corner para no partir la
celda combinada A1:C2.
```

#### 14B035 — líneas 868-882 (docblock)

```text
_aplicarAnchoFijoSemanaActualNuevos(sh)
FIX (15-ago-2026, pedido usuario): ancho fijo de 37px para las columnas
de Sábado y Domingo del bloque "Semana actual" (una por cada una de las
3 subcategorías: Ataques, Puntaje, Barcos — 6 columnas en total). Esos 2
días usan el formato de TOTAL SEMANAL (ver
_construirReglasSemanaActualNuevos() más abajo), visualmente equivalente
a una columna de "Total" de Control_2 — de ahí el ancho angosto fijo,
para diferenciarlas de las columnas de Jueves/Viernes (que conservan el
ancho normal/automático).

Es puramente estructural (no depende de qué día es "hoy"): se aplica
siempre que se (re)pintan los encabezados, tanto desde
_pintarEncabezadosNuevos() como desde repararFormatoEncabezadosNuevos().
```


### Ubicación: `_aplicarAnchoFijoSemanaActualNuevos`

#### 14B036 — líneas 894-925 (docblock)

```text
_construirReglasClanesNuevos(sh, numFilas)
FIX (13-ago-2026): antes vivía dentro de _aplicarFormatoCondicionalClanesNuevos()
(pedido explícito del usuario — colorea cada FILA de datos según el Clan
del jugador, en tonos pastel, mismo mecanismo que
_aplicarFormatoCondicionalDirectorio(), 11_DirectorioSheet.gs). Ahora solo
DEVUELVE las reglas (no las aplica) para poder combinarlas con las de
_construirReglasSemanaActualNuevos() en una sola llamada a
setConditionalFormatRules() — ver _aplicarTodoFormatoCondicionalNuevos().

FIX (14-ago-2026, pedido usuario): el 13-ago esto se había limitado a
las columnas fijas (A:K) pensando que el pastel por clan "chocaría" con
los resaltados de "Semana actual"/historial — pero el pedido original
(06-ago-2026) SIEMPRE fue teñir la FILA COMPLETA, y el historial de
RoyaleAPI (columnas del grid) no tiene ningún resaltado propio (solo
setNumberFormat en _actualizarFormatoGridNuevos(), sin conditional
format), así que no hay conflicto ahí. Vuelve a cubrir toda la fila
(hasta el último bloque de fecha real, sh.getLastColumn() en vez de un
ancho fijo — cubre también bloques agregados con el tiempo más allá de
los GRID_NUM_BLOQUES_NUEVOS iniciales). Donde SÍ hay resaltado propio
(Ataques/Puntaje/Barcos de "Semana actual") esta regla queda con menor
prioridad que _construirReglasSemanaActualNuevos() — ver el ORDEN en
que se concatenan ambos arreglos en _aplicarTodoFormatoCondicionalNuevos()
(la regla de más arriba en la lista gana; semana actual va primero).

Los nombres de clan se obtienen de _getNombresClanesTernaOrdenados()
(lee la hoja Clan en vivo) en vez de escribirlos a mano acá — evita
repetir el bug ya documentado en 27_Torneos_Sorteos_Requisitos.gs con el carácter "乂"
(U+4E42 vs U+4E58): cualquier nombre de clan que use ese glifo se
compara siempre contra el mismo valor real de la hoja Clan, nunca contra
una copia tipeada a mano que podría traer el codepoint equivocado.
```


### Ubicación: `_construirReglasClanesNuevos`

#### 14B037 — líneas 949-960 (docblock)

```text
_actualizarFormatoGridNuevos(sh)
FIX (pedido usuario: "demora bastante al actualizar el formato fila por
fila"): reaplica el formato numérico ('#,##0') de las 3 sub-columnas
numéricas de la cuadrícula (Ataques/Fame/Barcos — Clan es texto, no
lleva formato numérico) sobre TODAS las filas de datos y TODOS los
bloques de fecha existentes, en un solo paso al final de la
importación — usando getRangeList() (batch real: 3 llamadas a
setNumberFormat() en total, cubriendo todo el rango de una vez, sin
importar cuántos bloques o filas haya), en vez de aplicar el formato de
a un bloque/fila a la vez cada vez que se agrega o reordena una columna.
```


### Ubicación: `_actualizarFormatoGridNuevos`

#### 14B038 — líneas 982-997 (docblock)

```text
_actualizarSemanaActualNuevos(sh)
FIX (13-ago-2026, pedido usuario): escribe Ataques/Puntaje/Barcos (J/V/S/D)
de la semana de guerra vigente, usando exactamente la misma fuente que
Control: _getDatosGuerraParaControl() (22_ControlCalendario.gs). Un día
que todavía no ocurrió queda en blanco (nunca en 0), igual criterio que
updateControlSheet().

FIX (16-ago-2026, pedido usuario — "el reinicio de los jueves y en punto
2 (entrenamiento) están bien" quedó confirmado, pero el bloque quedaba
totalmente en blanco lunes-miércoles): usa la MISMA sección/día vigente
que _construirReglasSemanaActualNuevos() (ver _getDiaActualYSeccionVigente,
arriba en este archivo) — durante entrenamiento, en vez de dejar todo en
blanco, sigue mostrando J-D de la semana que acaba de cerrar
(sectionIndex anterior), y recién se reinicia solo al llegar el jueves.
```


### Ubicación: `_actualizarSemanaActualNuevos`

#### 14B039 — líneas 1038-1105 (docblock)

```text
_cerrarSemanaActualNuevos()
FASE 11 (punto 4 del Consolidado_Cambios_Pendientes_Guerra.md) — cierre
semanal del bloque "Semana actual" de la hoja Nuevos hacia el histórico
real (Guerra/Backup_Guerra.csv). Era el único de los 4 mecanismos del
documento sin ningún código escrito (backend ni userscript).

DISPARADOR (pregunta 6, sección 6 del Consolidado — confirmado, sin
cambios): mismo criterio que ya usa el resto del sistema — la semana
cierra cuando ctx.periodIndex pasa de Domingo a Lunes (entrenamiento).
Se detecta reutilizando _getDiaActualYSeccionVigente() (el mismo helper
que ya usa _actualizarSemanaActualNuevos(), ver su docblock arriba en
este archivo): en cuanto ctx.periodIndex deja de ser día de guerra, esa
función devuelve la sección ANTERIOR (la semana que acaba de cerrar),
congelada en offset 3 (Domingo) — es decir, con los 4 días J/V/S/D ya
completos y listos para sumar.

Por cada Tag presente en la hoja Nuevos con datos de guerra esa semana:
  1) Suma los 4 días (Ataques, Fame/Puntaje, Barcos) en un total semanal.
  2) Lo vuelca a Guerra/Backup_Guerra.csv reutilizando
     _aplicarCorreccionAGuerraConReparto() (punto 1.1, 18_CorreccionGuerra.gs)
     — la MISMA función de escritura/upsert que ya usa el punto 3
     (_migrarNuevosAHistorico(), arriba en este archivo). Si la clave
     Tag|Semana no existe todavía, entra sola en modo "reconstrucción
     completa" (reparte los totales con el mismo algoritmo Barcos-
     primero + piso que cualquier otra reconstrucción y marca
     Origen='Reconstruido').

REGLA DE NO PISADO (idéntica a la del punto 3, ver docblock de
_migrarNuevosAHistorico()): el punto 3 ya corre en cada escaneo del
userscript y puede haber migrado esta misma semana ANTES de que cierre
formalmente (o el punto 1 pudo haberla corregido a mano). Por eso este
cierre pasa por el mismo chequeo de "¿ya existe la clave?"
(_construirOffsetsPorClave()) antes de escribir — si ya existe, la deja
intacta y solo cuenta la clave como "ya existía", nunca la pisa ni la
duplica.

FUENTE DE LOS DATOS: se recalcula directo con _getDatosGuerraParaControl()
(misma fuente que ya consulta _actualizarSemanaActualNuevos()) en vez de
leer el bloque "Semana actual" ya pintado en la hoja — así no depende de
que _actualizarSemanaActualNuevos() ya haya corrido en esta misma pasada
de PASOS_RUNALL/PASOS_RUNUPDATE (00_Main.gs), donde el paso de Nuevos
puede ir antes o después del paso de Guerra según el punto del pipeline.

IDEMPOTENCIA SIN TOCAR LA HOJA: en vez de limpiar el bloque "Semana
actual" (eso reintroduciría el bug ya corregido el 16-ago-2026 -- ver
docblock de _actualizarSemanaActualNuevos() -- que necesita seguir
mostrando esos 4 días congelados durante TODO el entrenamiento, Lunes a
Miércoles), se usa un marcador en PropertiesService
(`NUEVOS_CIERRE_SEMANA_T<temporada>` = última semana ya cerrada de esa
temporada). Así, aunque esta función se llame en cada corrida de
runAll()/runUpdate() (~cada 10 min) durante los 3 días de entrenamiento,
solo hace el trabajo real la primera vez que ve una semana nueva cerrada.

NO toca la hoja Nuevos para nada (ni lee ni escribe sus celdas de datos
de la cuadrícula, solo la columna Tag para saber qué candidatos
recorrer) — mismo principio de independencia que ya sigue
_migrarNuevosAHistorico() (punto 3): migración/cierre por un lado,
purga/visualización de la vista (_purgarNuevosEstablecidos()/
_purgarNuevosExpulsados()) por otro, sin mezclarse.

LÍMITE CONOCIDO (heredado de _getDiaActualYSeccionVigente(), no es un
bug nuevo de esta función): en el entrenamiento de la primerísima
sección de una temporada (sectionIndex 0), no hay "semana anterior" que
cerrar dentro de esa misma temporada — la última semana de la temporada
ANTERIOR no se cierra por esta vía. Mismo límite que ya acepta
_actualizarSemanaActualNuevos() (bloque en blanco en ese caso).
```


### Ubicación: `_aplicarImportacionNuevos`

#### 14B040 — líneas 1203-1207 (comentario)

```text
FIX (06-ago-2026, puntos 4 y 5 del pedido): respaldo crudo de cada
envío del userscript en Drive (JSON + CSV, ver 14_Nuevos_RoyaleAPI.gs)
ANTES de tocar la hoja, para poder depurar manualmente si algo se
escribe mal. Ese mismo archivo se autolimpia: purga los Tags que ya
acumulan 3+ semanas de guerra real en un clan Terna.
```

#### 14B041 — líneas 1214-1222 (comentario)

```text
1) FIX (09-ago-2026): en vez de recolectar TODAS las fechas del payload
   (ver docblock de la función, arriba), se pide a
   _seleccionarFechasNuevasNecesariasNuevos() solo el subconjunto de
   fechas que de verdad necesita una columna NUEVA — por candidato,
   hasta completar un mínimo de GRID_NUM_BLOQUES_NUEVOS (5) fechas
   contando también las que ya coinciden con columnas existentes.
   Recién después se leen los bloques definitivos de la fila
   NUEVOS_FILA_FECHAS (dinámico: tantos bloques como columnas tenga la
   cuadrícula — ver _leerBloquesFechaNuevos()).
```

#### 14B042 — líneas 1227-1230 (comentario)

```text
El ancho real de la cuadrícula puede ser mayor a GRID_WIDTH_NUEVOS (20 =
5 bloques) si _asegurarBloquesParaFechas() tuvo que agregar columnas —
se usa este valor dinámico para limpiar/formatear filas más abajo, en
vez del constante fijo.
```

#### 14B043 — líneas 1254-1264 (comentario)

```text
FIX (13-ago-2026, pedido del usuario): "los nuevos se agregan al final
en vez de ordenarse por clan". Antes, el bloque de más abajo (dentro
del for de candidatosPayload) hacía `fila = sh.getLastRow() + 1` para
CUALQUIER tag sin fila todavía -- siempre al fondo de la hoja, sin
importar su Clan. Ahora, ANTES de escribir ninguna celda, se insertan
filas en blanco para todos los candidatos realmente nuevos, cada una
en la posición que le corresponde por Clan (mismo orden que la hoja
Clan) y, dentro de un mismo Clan, por Nombre. tagAFila queda
actualizado (filas nuevas + corrimiento de las filas existentes que
quedaron debajo de cada inserción), así que el resto de esta función
no necesita ningún otro cambio: sigue usando tagAFila[tag] tal cual.
```

#### 14B044 — líneas 1268-1270 (comentario)

```text
FIX (06-ago-2026): errores individuales por candidato — ver comentario
del try/catch más abajo. Se devuelven en la respuesta para que el
userscript los muestre en el panel (ver Tampermonkey.md).
```

#### 14B045 — líneas 1279-1291 (comentario)

```text
FIX (06-ago-2026): cada candidato se procesa en su propio try/catch.
Antes, una excepción en CUALQUIER punto de este bloque (ej. al armar
el RichText de RoyaleAPI o al escribir la cuadrícula de un candidato
puntual) abortaba TODA la función sin terminar de procesar los
candidatos restantes del lote — el error quedaba enterrado en el log
de Apps Script (que el userscript nunca leía) y, del lado del
userscript, la respuesta HTTP 500 tampoco se revisaba (antes solo se
comprobaba un fallo de RED, ver fix en Tampermonkey.md), así que el
lote se descartaba en silencio como si nada hubiera pasado. Esto
coincide con el síntoma reportado: "Celular y RoyaleAPI recién
aparecen tras RunAll" — que sí corre _refrescarColumnasFijasNuevos()
por separado, sin depender de este flujo. Aislar cada candidato evita
que uno roto arruine el lote completo.
```

#### 14B046 — líneas 1295-1298 (comentario)

```text
Red de seguridad: no debería pasar, _insertarNuevosCandidatosOrdenadosPorClan()
(ver arriba) ya insertó/asignó fila para TODO tag nuevo del payload.
Si igual llega acá (ej. un tag que no vino en candidatosPayload por
algún motivo), se agrega al final como antes, en vez de fallar.
```

#### 14B047 — líneas 1303-1305 (comentario)

```text
--- Columnas fijas: refrescar desde Directorio si el tag sigue
    activo ahí; si ya no está (dejó el clan / ascendió / etc.),
    conservar lo que ya hubiera en la fila en vez de vaciarlo.
```

#### 14B048 — líneas 1323-1326 (comentario)

```text
NC.ROYALE_API se deja tal cual venía en fijasActuales acá (no se
toca con setValues): se escribe aparte más abajo como RichText,
sin mezclarlo con el resto de columnas fijas (que son valores
planos).
```

#### 14B049 — líneas 1329-1336 (comentario)

```text
--- RoyaleAPI: enlace clicable generado directo desde el Tag,
    mismo patrón que usa la hoja Links para LC.ROYALE_API (ver
    makeLink() en 01_Config_Global.gs). NO se copia de
    dRow[DC.ROYALE_API-1]: ese campo llega desde
    _leerDirectorioFisicoComoDC(), que lee la hoja Links con
    getValues() y solo trae el TEXTO visible del enlace ("Link"),
    nunca la URL real (que vive como RichText). Generarlo acá
    evita depender de que Links ya esté poblada para este tag.
```

#### 14B050 — líneas 1341-1346 (comentario)

```text
--- Cuadrícula: limpiar el bloque completo de esta fila ANTES de
    rescribir, para que una fecha sin registro quede vacía (nunca
    en cero) en vez de arrastrar un valor viejo. Se usa el ancho
    REAL de la cuadrícula (anchoGridActual, ver arriba), no el
    fijo de 5 bloques — puede haber crecido por
    _asegurarBloquesParaFechas().
```

#### 14B051 — líneas 1354-1357 (comentario)

```text
Con _asegurarBloquesParaFechas() ya corrido arriba, esto en la
práctica siempre encuentra bloque — se deja el chequeo por
robustez (ej. si fechaReg viniera nula por algún dato corrupto
que no se filtró antes).
```

#### 14B052 — líneas 1381-1390 (comentario)

```text
FASE 9 (Consolidado_Cambios_Pendientes_Guerra.md, punto 3): migra a
Guerra/Backup_Guerra.csv cualquier semana Terna del historial recién
recibido que el sistema propio nunca registró. Se corre ACÁ, con el
payload crudo completo (mismo `candidatosPayload` de esta función,
antes de que _purgarNuevosEstablecidos() pueda borrar la fila del
candidato de la hoja "Nuevos" más abajo) — la migración no depende de
que la fila siga viva en "Nuevos", así que el orden entre ambas no
importa por ese lado, pero se aísla en su propio try/catch para que un
error ahí nunca tumbe el resto de la importación (mismo criterio que
el try/catch por candidato de arriba).
```

#### 14B053 — líneas 1409-1414 (comentario)

```text
FIX (14-ago-2026, pedido usuario): autolimpieza de candidatos ya
establecidos — ver docblock de _purgarNuevosEstablecidos() más abajo
en este archivo. Se corre acá, después de escribir todos los
candidatos de este lote pero ANTES del renumerado/formato final de
más abajo, para que ese paso ya opere sobre el set de filas correcto
(sin gastar renumerado/formato en filas que se acaban de borrar).
```

#### 14B054 — líneas 1427-1433 (comentario)

```text
FIX (06-ago-2026): mismo formato numérico que ya usa el resto del
proyecto para estos mismos campos — '#,##0' para Nivel/Copas/
V_Guerra/Días inactivo (ver COLS_NUMERICAS_DIR_/COLS_NUMERICAS_PLAYERS_/
COLS_NUMERICAS_MULTI_ en 13_Inactivos_Vetados.gs) y '### ### ### ###'
para Celular (ver IC.CELULAR/AC.CELULAR, mismo archivo). Se reaplica
en cada importación sobre TODO el bloque de datos (barato, no rompe
nada repetirlo) para que también cubra filas nuevas.
```

#### 14B055 — líneas 1442-1454 (comentario)

```text
FIX (09-ago-2026): mismo caso que Control (ver _limpiarLinksAccidentalesEnHoja(sh,3)
en updateControlSheet(), 17_GuerraSheet.gs) — el valor de "Clan" que
llega en cada registro (reg.clan, ver arriba, columna OFFN.CLAN) es el
nombre TAL CUAL lo muestra el historial de RoyaleAPI, que puede ser el
de un clan RIVAL con forma de dominio (ej. "LAMPA.COM") y Sheets lo
autoenlaza igual que hacía con nombres de jugador (ver
_limpiarLinksAccidentalesEnHoja(), 11_DirectorioSheet.gs, que ahora
también revisa la columna "Clan" — FIX 09-ago-2026 ahí). La barrida
general de limpiarLinksAccidentalesDeNombres() (PASOS_RUNALL) igual lo
habría corregido en la siguiente corrida completa, pero recién ahí —
se llama también acá, con headerRow=NUEVOS_FILA_HEADERS (3, no 1, ver
mismo motivo que Control), para que quede limpio de inmediato apenas
el userscript termina de escribir, sin esperar al próximo runAll().
```

#### 14B056 — líneas 1457-1474 (comentario)

```text
FIX (pedido usuario): antes, el formato numérico de la cuadrícula
(Ataques/Fame/Barcos) nunca se reaplicaba en bloque — y el orden de
las columnas de fecha podía desalinearse con el tiempo (bloques de
"relleno"/backfill reutilizan cualquier hueco vacío sin comparar su
fecha contra la de los bloques vecinos, ver _asegurarBloquesParaFechas()).
Ahora, UNA sola vez al final de la importación (nunca fila por fila):
  1) se reordenan físicamente los bloques de fecha (más reciente a
     la izquierda), y
  2) se reaplica el formato numérico de TODA la cuadrícula de datos
     (todas las filas, todos los bloques) en un puñado de llamadas
     batch (RangeList), no una por fila.

FIX (13-ago-2026, pedido usuario): justo antes de reordenar/formatear
la cuadrícula, se escribe la "Semana actual" (mismos valores que
Control), se reordenan TODAS las filas por Clan -> Nombre (no solo
las nuevas, ver _reordenarFilasNuevosPorClanYNombre()) y recién ahí se
pinta el formato condicional unificado (clanes + semana actual) —
reemplaza la llamada suelta que antes vivía más arriba.
```

#### 14B057 — líneas 1489-1512 (docblock)

```text
_aplicarTodoFormatoCondicionalNuevos(sh)
FIX (13-ago-2026): reemplaza los llamados sueltos a
_aplicarFormatoCondicionalClanesNuevos() en todo el archivo
(setConditionalFormatRules() reemplaza TODAS las reglas de la hoja, así
que las de clan + las de "Semana actual" deben combinarse en una sola
llamada).

REEMPLAZA cualquier regla de formato condicional previa de la hoja
(sh.setConditionalFormatRules() no es aditivo) — seguro acá porque
"Nuevos" no tiene ninguna otra regla de formato condicional definida en
el resto del proyecto.

FIX (14-ago-2026, pedido usuario): orden de concatenación invertido.
En Sheets, cuando varias reglas matchean la misma celda, gana la que
está MÁS ARRIBA en la lista (mismo criterio documentado en
_aplicarFormatoCondicionalMenu(), 30_Mensajes.gs: "se aplica al final,
menor prioridad"). Ahora que _construirReglasClanesNuevos() vuelve a
cubrir la fila completa (ver su docblock), las reglas de "Semana
actual" (resaltado de Ataques/Puntaje/Barcos) deben ir PRIMERO para
que ganen sobre el pastel de fondo en esas columnas puntuales; el
pastel por clan queda de fondo en todo lo demás (incluida la
cuadrícula de historial, que no tiene resaltado propio).
```


### Ubicación: `_asegurarBloquesParaFechas`

#### 14B058 — líneas 1531-1533 (comentario)

```text
1) Fechas realmente faltantes (sin bloque ya asignado), deduplicadas
   (una misma fecha puede repetirse entre varios candidatos del mismo
   payload).
```

#### 14B059 — líneas 1545-1551 (comentario)

```text
2) CASO DE ARRANQUE: si la cuadrícula todavía no tiene NINGÚN bloque
   con fecha (hoja recién creada, con los bloques vacíos que deja
   _pintarEncabezadosNuevos()), se aprovechan esos espacios en vez de
   insertar columnas nuevas — se asignan de más reciente a más
   antigua, en el mismo orden izquierda->derecha en que ya están esos
   bloques vacíos, para que la cuadrícula arranque ya en el orden
   cronológico correcto.
```

#### 14B060 — líneas 1576-1585 (comentario)

```text
3) FIX (06-ago-2026): las fechas MÁS RECIENTES que cualquier bloque ya
   existente (semanas nuevas que RoyaleAPI acaba de publicar) van a la
   IZQUIERDA de la cuadrícula — pedido explícito del usuario, ya que
   el orden cronológico de la hoja es de más reciente (izquierda) a
   más antigua (derecha); antes SIEMPRE se agregaban al final
   (derecha), quedando en el orden contrario al resto de la hoja. El
   resto (fechas antiguas que faltaban — típico al completar el
   historial de un miembro recién agregado a "Nuevos") sigue el
   criterio anterior: reutiliza un bloque vacío si lo hay, o lo agrega
   al FINAL (derecha).
```

#### 14B061 — líneas 1602-1607 (comentario)

```text
masRecientes se inserta de la MÁS ANTIGUA (de este lote) a la MÁS
NUEVA, siempre en la misma posición (COL_INICIO_GRID_NUEVOS): cada
insertColumnsBefore() empuja hacia la derecha lo insertado en el paso
anterior, así que la última en insertarse (la más nueva) termina más
a la izquierda de todas — el orden final queda correctamente
cronológico (más nueva -> más a la izquierda).
```

#### 14B062 — líneas 1650-1654 (docblock)

```text
_buscarBloquePorFechaNuevos(fechasHeader, fecha)
Devuelve el bloque {date, col} cuya fecha coincide en día/mes/año, o null
si ninguna de las hasta 5 fechas de la fila 2 coincide.
```


### Ubicación: `_buscarBloquePorFechaNuevos`

#### 14B063 — líneas 1668-1675 (docblock)

```text
_cargarSnapshotDebugNuevos()
Lee ClanSystem_Debug_ImportNuevos.json y devuelve { Tag -> {...} } o {}
si no existe todavía (primera vez).
(25-sep-2026, FASE B) Se lee desde "Otros" (DRIVE_FOLDER_ID_OTROS), antes
desde "JSON" — ver checklist de AVISOS ABIERTOS / FASE B en
09_API_ClashRoyale.gs.
```


### Ubicación: `_cargarSnapshotDebugNuevos`

#### 14B064 — líneas 1690-1724 (docblock)

```text
_construirMapaSemanasGuerraTerna()
FIX (22-ago-2026): "runGuerraRapido() se cancela por 'Exceeded maximum
execution time', el log se corta justo después de
'repararFormatoEncabezadosNuevos: ...' sin ninguna línea más hasta el
corte". Causa raíz encontrada: _contarSemanasGuerraTerna(tag) (más abajo)
hace una lectura COMPLETA de la hoja Guerra (sh.getRange(...).getValues())
cada vez que se llama -- y se llamaba UNA VEZ POR CADA FILA/TAG dentro de
un bucle en 3 lugares distintos: _purgarNuevosEstablecidos() (una vez por
cada candidato de "Nuevos"), _guardarSnapshotDebugImportacionNuevos() (una
vez por cada Tag del snapshot) y _restaurarNuevosDesdeCsvDebug() (una vez
por cada FILA del CSV de respaldo, ni siquiera por Tag único). Con la hoja
"Nuevos" y la hoja Guerra creciendo (34 bloques de historial en Nuevos al
momento de este FIX), ese patrón N+1 -- N lecturas completas de una hoja
cada vez más grande -- pasó a tardar varios minutos sin loguear nada en el
medio (todo ocurre dentro de un mismo bucle síncrono, sin ningún
Logger.log() entre llamadas), justo el hueco de silencio que se ve en el
log entre "repararFormatoEncabezadosNuevos" y el corte por límite de
tiempo. Al ser TODO esto una sola llamada de un solo paso de
PASOS_RUNGUERRARAPIDO (_refrescarColumnasFijasNuevos_Paso1_FormatoYPurgado,
00_Main.gs), _ejecutarPorTandas() no tiene ninguna oportunidad de cortar
limpio y programar una continuación -- el paso completo debe terminar o
se pierde a mitad de camino.

SOLUCIÓN: esta función lee la hoja Guerra UNA SOLA VEZ y devuelve un mapa
{ TAG -> cantidadDeSemanas } ya calculado para TODOS los tags a la vez.
Los 3 lugares de arriba ahora arman este mapa una sola vez ANTES de su
bucle y consultan el mapa en memoria (O(1) por tag) en vez de volver a
pedirle la hoja completa a Sheets por cada tag/fila. _contarSemanasGuerraTerna(tag)
se conserva tal cual (mismo nombre, mismo comportamiento con un solo
argumento) para cualquier uso puntual/manual fuera de un bucle, pero
ahora acepta un segundo argumento opcional `mapaPrecomputado` -- si se
pasa (construido con esta función), se usa directamente y NO se vuelve a
leer la hoja Guerra.
```


### Ubicación: `_construirMapaSemanasGuerraTerna`

#### 14B065 — líneas 1758-1793 (docblock)

```text
_construirReglasSemanaActualNuevos(sh, numFilas)
FIX (13-ago-2026): mismas reglas visuales que _aplicarFmtCondicionalControl()
(22_ControlCalendario.gs) para un dia de Ataques/Puntaje/Barcos, aplicadas
a las 12 columnas de "Semana actual". Reutiliza _buildMinGSwitchFormula()
(misma fuente de Min_G que Control: CR_Lista, par de Descenso vigente).

FIX (16-ago-2026, corrige el FIX 15-ago-2026 anterior — pedido usuario):
el FIX 15-ago-2026 aplicaba, para Sábado/Domingo ya transcurridos, el
resaltado de TOTAL SEMANAL de Control_2 (_reglaCondFmtAtaquesTotalSemana()
y compañía, que comparan contra el acumulado, p.ej. =16 ataques). Eso era
un error de diseño: ese resaltado es el de la columna "Total" de
Control_2 (que sí acumula J+V+S+D). Este bloque de Nuevos NO tiene una
columna "Total" — cada celda J/V/S/D guarda el valor de ESE día
individual, exactamente como las columnas J/V/S/D de la hoja Control.
Control usa el MISMO umbral diario (0 / 1-3 / 4 para Ataques, y sus
equivalentes para Puntaje/Barcos) en cualquier semana, sin importar si el
día ya cerró o no — no existe una variante "semanal" de ese formato por
día, el total semanal es un concepto que solo vive en Control_2, en una
celda aparte.

Por eso ahora: para TODOS los días ya ocurridos (d <= diaActual, sin
distinción entre J/V y S/D) se aplica el MISMO bloque de reglas diarias
que antes solo corría para d <= 1. NO se llama a
_reglaCondFmtAtaquesTotalSemana()/_reglasCondFmtPuntajeTotalSemana()/
_reglasCondFmtBarcosTotalSemana() (23_Control2_GuerraSemanal.gs) — esas
comparan contra el ACUMULADO de la semana, pero cada celda de este
bloque guarda el valor de UN solo día (máx. 4) — aplicarlas acá dejaría
esa celda sin resaltado posible.

El día/sección vigente sale de _getDiaActualYSeccionVigente() (arriba en
este mismo archivo) — misma fuente que usa _actualizarSemanaActualNuevos(),
para que ambas nunca se desincronicen. Un día futuro (d > diaActual)
queda sin regla ("tal cual"; además su celda está vacía, ver
_actualizarSemanaActualNuevos()).
```


### Ubicación: `_construirReglasSemanaActualNuevos`

#### 14B066 — líneas 1834-1848 (docblock)

```text
_contarSemanasGuerraTerna(tag, mapaPrecomputado)
Cuenta cuántas semanas DISTINTAS (Temporada+Semana) de guerra, con
AtaquesSemana > 0, tiene este Tag en cualquiera de los clanes Terna,
según la hoja Guerra (GC.*, ver 17_GuerraSheet.gs). Se usa como criterio
de "candidato ya establecido" para purgar el snapshot de depuración de
Nuevos (no toca la hoja Nuevos ni Directorio, solo el archivo temporal).

Si se pasa `mapaPrecomputado` (ver _construirMapaSemanasGuerraTerna()
arriba), se usa ese mapa en memoria y NO se lee la hoja Guerra -- así se
evita el patrón N+1 cuando esta función se llama dentro de un bucle (ver
FIX 22-ago-2026 en el docblock de _construirMapaSemanasGuerraTerna()). Si
no se pasa nada, se comporta exactamente igual que antes (lectura propia
de la hoja Guerra), pensado solo para llamadas sueltas fuera de un bucle.
```


### Ubicación: `_contarSemanasGuerraTerna`

#### 14B067 — líneas 1881-1888 (docblock)

```text
_formatearBloqueFechaNuevos(sh, col, fecha)
Aplica a UN bloque nuevo (4 columnas a partir de col) el mismo formato de
encabezado que _pintarEncabezadosNuevos() aplica a los bloques originales
de la hoja: fila NUEVOS_FILA_FECHAS con la fecha (celda combinada), fila
NUEVOS_FILA_HEADERS con Clan/Ataques/Fame/Barcos, y borde blanco sobre
todo el bloque de encabezado (filas 1 a NUEVOS_FILA_HEADERS).
```


### Ubicación: `_formatearBloqueFechaNuevos`

#### 14B068 — líneas 1911-1930 (docblock)

```text
_getDiaActualYSeccionVigente(ctx)
FIX (16-ago-2026, corrige el FIX 15-ago-2026 de abajo — pedido usuario):
fuente ÚNICA de verdad del "día/semana de guerra vigente" para el bloque
"Semana actual" de Nuevos — la usan _construirReglasSemanaActualNuevos()
y _actualizarSemanaActualNuevos(), para que valores y formato nunca se
desincronicen.

  - Jueves-Domingo (esDiaGuerraIdx(ctx.periodIndex) true): cálculo normal,
    diaActual = offset 0-3 dentro de ctx.sectionIndex.
  - Lunes-Miércoles (entrenamiento): se CONGELA en Domingo (diaActual=3)
    de la sección ANTERIOR (ctx.sectionIndex - 1) — la semana de guerra
    que acaba de cerrar. El reinicio del jueves sale solo: en cuanto
    ctx.periodIndex vuelve a caer en día de guerra, este mismo cálculo da
    diaActual=0 sobre el sectionIndex correcto, sin lógica aparte.

@returns {Object|null} { diaActual (0-3), sectionIndex } o null si
  ctx.periodIndexSospechoso, o si es entrenamiento de la primerísima
  sección registrada (sectionIndex 0, sin semana anterior que mostrar).
```


### Ubicación: `_getDiaActualYSeccionVigente`

#### 14B069 — líneas 1947-1964 (docblock)

```text
_guardarSnapshotDebugImportacionNuevos(candidatosPayload)
candidatosPayload = [{ tag, registros: [{temporada, fecha, clan, ataques, fame, barcos}, ...] }, ...]
(mismo payload que recibe _aplicarImportacionNuevos()).

1) Fusiona lo recibido en ESTE envío con lo que ya había en el snapshot
   (sobreescribe por Tag: cada envío nuevo reemplaza el anterior de ese
   mismo Tag, ya que representa la lectura más reciente de RoyaleAPI).
2) Purga del snapshot cualquier Tag que ya tenga >= 3 semanas de guerra
   en un clan Terna (ver _contarSemanasGuerraTerna()) — sin importar si
   ese Tag vino o no en este envío puntual.
3) Guarda el resultado como JSON (estructura completa) y como CSV
   (aplanado, una fila por registro, para inspección rápida).

No lanza excepción hacia arriba: cualquier error se registra en el log y
la función retorna normalmente, para que un fallo de depuración nunca
bloquee la importación real a la hoja Nuevos.
```


### Ubicación: `_guardarSnapshotDebugImportacionNuevos`

#### 14B070 — líneas 1982-1985 (comentario)

```text
2) Purgar Tags ya establecidos (>= 3 semanas de guerra Terna).
FIX (22-ago-2026): mapa de semanas construido UNA sola vez en vez de
releer toda la hoja Guerra por cada Tag del snapshot -- ver docblock
de _construirMapaSemanasGuerraTerna() más arriba en este archivo.
```

#### 14B071 — líneas 2005-2031 (comentario)

```text
3b) Guardar CSV aplanado (una fila por registro individual, para
    poder abrirlo directo y comparar contra lo que quedó en la hoja
    Nuevos sin tener que leer JSON a mano).

FIX (06-ago-2026) — FORMATO PEDIDO POR EL USUARIO: columnas
Tag|Temporada|Fecha|Clan|Ataques|Fame|Barcos (se quita
FechaImportacion, que no aportaba para cruzar contra la hoja Nuevos).
Temporada viaja tal cual la manda el userscript (texto "134-4", ver
Tampermonkey.md) y NUNCA se escribe en la hoja "Nuevos" — solo vive
acá, en el temporal, para poder auditar qué semana real de RoyaleAPI
originó cada fila.

FIX (22-ago-2026, pedido explícito del usuario): "si hay diferencia
en el formato de fecha, dale fecha y hora en formato numérico -- el
texto es solo para visualizar en Sheets (como formato únicamente)
pero el valor, tanto en Sheets como en el CSV, deben ser numéricos".
Se agrega Fecha_TS (epoch ms, numérico -- mismo criterio que
CRC.FECHADETECCION_TS en 19_CorreccionRiverRace.gs) con el valor REAL
que usa _restaurarNuevosDesdeCsvDebug() para reconstruir el payload
-- ya NO hace falta parsear ningún texto con regex para restaurar.
Fecha (texto, DD/MM/YYYY) se conserva TAL CUAL estaba -- pero ahora
es puramente decorativa/de inspección visual (para poder comparar a
simple vista contra la fila 2 de "Nuevos" al abrir el CSV), nunca la
fuente de verdad. Ambas representan el MISMO instante, ya ajustado
(mismo -1 día que aplica _parseFechaISONuevos() para pasar de la
convención de RoyaleAPI -lunes- a la convención del proyecto
-domingo-) -- Fecha_TS es simplemente ese mismo Date en epoch ms.
```

#### 14B072 — líneas 2067-2069 (comentario)

```text
=============================================================================
POST — aplicar lo que el userscript detectó como "nuevo"
=============================================================================
```

#### 14B073 — líneas 2071-2109 (docblock)

```text
_aplicarImportacionNuevos(candidatosPayload)
candidatosPayload = [{ tag, registros: [{temporada, fecha, clan, ataques, fame, barcos}, ...] }, ...]
(hasta 5 registros por tag, más reciente primero — no importa el orden en
que lleguen, se alinean por fecha real contra la fila 2).

FIX (05-ago-2026): ANTES de escribir cualquier fila, se recolectan las
fechas que trae el payload completo (de TODOS los candidatos, no solo
uno) y se llama a _asegurarBloquesParaFechas() para que la cuadrícula
tenga un bloque para cada una — reutilizando bloques vacíos si los hay, o
agregando columnas nuevas si ya no quedan (ver docblock de esa función).
Recién después se leen los bloques (ya completos) y se procesa candidato
por candidato como antes.

FIX (09-ago-2026) — MÍNIMO 5, SIN CREAR COLUMNAS DE MÁS: el fix anterior
(05-ago-2026, párrafo de arriba) pasaba a _asegurarBloquesParaFechas()
TODAS las fechas de TODOS los registros de TODOS los candidatos, sin
límite — combinado con que el userscript ya no recorta su envío a 5
filas (ver REGISTROS_MAX_ENVIO en Tampermonkey.md), esto termina creando
una columna nueva por cada fecha que el historial de RoyaleAPI tenga
cargado (pueden ser 100+), en vez de solo las necesarias — exactamente
el problema reportado por el usuario (la hoja real llegó a acumular 203
bloques de fecha). Pedido explícito del usuario, con dos ejemplos:
  - Si RoyaleAPI ofrece 10 fechas y la cuenta ya tiene 7 que COINCIDEN
    con columnas ya existentes en la hoja, se guardan esas 7 (ya cumplen
    de sobra el mínimo de 5) y NO se crean columnas para las 3 restantes.
  - Si RoyaleAPI ofrece 10 fechas y la cuenta solo tiene 3 que coinciden,
    se crean columnas SOLO para 2 más (las 2 más recientes de las 7 que
    no coincidían) — lo justo para llegar a 5 — y las otras 5 no generan
    columna.
Ahora _seleccionarFechasNuevasNecesariasNuevos() (más abajo) decide, por
candidato, cuántas columnas NUEVAS hacen falta (si es que hacen falta) y
solo esas se pasan a _asegurarBloquesParaFechas() — que sigue intacta,
con la misma lógica de "más recientes a la izquierda / relleno reutiliza
bloque vacío o se agrega al final". Las fechas de un candidato que ya
coinciden con una columna EXISTENTE se siguen guardando siempre, sin
límite (nunca se descartan solo por ya haber varias) — el límite de 5
aplica exclusivamente a cuántas columnas NUEVAS se crean.
```

#### 14B074 — líneas 2110-2171 (docblock)

```text
_insertarNuevosCandidatosOrdenadosPorClan(sh, candidatosPayload, tagAFila, dirPorTag)
FIX (13-ago-2026, pedido del usuario): "los nuevos se agregan al final en
vez de ordenarse por clan". Antes, _aplicarImportacionNuevos() ubicaba
CUALQUIER candidato sin fila todavía en sh.getLastRow()+1 -- siempre al
fondo de la hoja, sin importar su Clan.

Esta función corre ANTES de escribir ninguna celda: localiza los
candidatos realmente NUEVOS del payload (los que todavía no tienen fila
en tagAFila), los ordena entre sí por Clan (mismo orden que la hoja
Clan, ver _getOrdenClanHoja) y, dentro de un mismo Clan, por Nombre
(Nom_Multi si está cargado, si no Nombre), e inserta una fila en blanco
para cada uno justo en la posición que le corresponde entre las filas
YA EXISTENTES de "Nuevos" (justo después del último registro de su mismo
Clan, o antes del primer registro de un Clan que va después en el orden
si su Clan todavía no tiene ningún registro ahí).

tagAFila se actualiza in-place: se agregan las filas nuevas y se corren
hacia abajo (+1) las que ya tenía asignadas cualquier tag cuya fila haya
quedado debajo de cada inserción. Así, el resto de
_aplicarImportacionNuevos() (que ya usa tagAFila[tag] para saber en qué
fila escribir cada candidato) no necesita ningún otro cambio.

El Clan/Nombre usado para ordenar sale de dirPorTag (Directorio de ESTA
corrida): si el tag no está activo en Directorio todavía (candidato
recién detectado, aún sin fila propia ahí), se ordena al final
(clanOrden 999) -- se reubicará solo en la próxima importación en cuanto
Directorio lo tenga.

@returns {Array} Tags (string) de los candidatos que se insertaron como
         fila nueva -- se usa para contar "filasNuevas" en el resumen.

FIX (12-sep-2026, pedido usuario -- "cuando ejecuto tampermonkey se llena
bien Nuevos, pero si demuelo y corro runAll, la hoja viene con una sola
fila de datos y hay que volver a escanear"). Causa raíz encontrada: esta
función solo insertaba físicamente una fila (sh.insertRowBefore) cuando
el candidato nuevo iba EN MEDIO de filas ya existentes. Cuando iba AL
FINAL de todo (filaDestino > lastRow) -- el caso normal para TODO
candidato nuevo si la hoja estaba vacía, típico justo después de un
Demoler -- la función no escribía ni insertaba nada acá: solo anotaba
filaDestino en tagAFila, confiando en que sh.getLastRow() reflejaría esa
fila en la SIGUIENTE vuelta del bucle. Pero sh.getLastRow() no cambia
hasta que alguna celda de esa fila se escriba de verdad -- eso recién
pasa DESPUÉS, en el bucle principal de _aplicarImportacionNuevos() (ver
ahí). Con 2+ candidatos nuevos que van "al final" en la MISMA llamada
(ej. tras un Demoler, donde TODOS los candidatos restaurados son
"nuevos" y van al final por definición), sh.getLastRow() devolvía el
mismo valor viejo en cada vuelta y todos terminaban con el MISMO
filaDestino -- tagAFila[tag] se pisaba uno a otro, y al escribir después
cada candidato sobreescribía la fila del anterior: solo sobrevivía el
ÚLTIMO procesado. Con NUEVOS_RESTORE_LOTE_MAX=10 candidatos restaurados
de un solo golpe tras un Demoler, esto explica el síntoma exacto
reportado (el log decía "filas nuevas: 10" pero la hoja terminaba con 1
sola fila real).
SOLUCIÓN: se agrega 'proximaFilaAlFinal', un contador LOCAL (no depende
de sh.getLastRow()) que se reserva/incrementa a mano cada vez que un
candidato se asigna "al final", sin esperar a que la escritura real lo
refleje en la hoja -- así el siguiente candidato "al final" de la MISMA
llamada cae en la fila siguiente, nunca en la misma. Cuando sí ocurre una
inserción física en medio (insertRowBefore), esa reserva también se
corre hacia abajo junto con tagAFila, igual que antes.
```


### Ubicación: `_insertarNuevosCandidatosOrdenadosPorClan`

#### 14B075 — líneas 2205-2212 (comentario)

```text
3) Insertar cada candidato en su posición correcta, comparando contra
   las filas YA EXISTENTES en la hoja. Se relee Clan/Nom_Multi/Nombre
   de la hoja en cada vuelta (no de una copia vieja) porque la propia
   inserción va corriendo filas hacia abajo en cada iteración.

FIX (12-sep-2026): ver docblock de la función más arriba --
'proximaFilaAlFinal' resuelve la colisión de filas cuando 2+
candidatos nuevos van "al final" en la misma llamada.
```

#### 14B076 — líneas 2240-2244 (comentario)

```text
Al final de todo: todavía no hay nada físico que insertar (la fila
se crea sola cuando se escriba, más abajo en
_aplicarImportacionNuevos(), vía auto-expansión de la hoja) -- solo
se reserva el número de fila para que el SIGUIENTE candidato "al
final" de este mismo lote no choque con este.
```

#### 14B077 — líneas 2248-2251 (comentario)

```text
Cualquier tag cuya fila ya asignada (de una vuelta anterior de
este mismo bucle) haya quedado en o después de filaDestino se
corre 1 hacia abajo -- incluida la reserva "al final" de más
arriba, si ya se había apartado alguna.
```

#### 14B078 — líneas 2263-2267 (comentario)

```text
=============================================================================
BLOQUES DE FECHA — lectura y crecimiento dinámico de la cuadrícula
FIX (05-ago-2026): ver "YA NO SE DESCARTAN REGISTROS SIN BLOQUE" en el
comentario de cabecera de este archivo.
=============================================================================
```

#### 14B079 — líneas 2269-2279 (docblock)

```text
_leerBloquesFechaNuevos(sh)
Lee TODOS los bloques de fecha que existan actualmente en la fila
NUEVOS_FILA_FECHAS, recorriendo desde COL_INICIO_GRID_NUEVOS hasta la
última columna de la hoja de a GRID_BLOQUE_ANCHO_NUEVOS (4) en 4 —
a diferencia del código original (que solo leía los primeros
GRID_NUM_BLOQUES_NUEVOS=5), esto se adapta a cualquier cantidad de
bloques que la cuadrícula tenga en este momento, incluidos los que
_asegurarBloquesParaFechas() haya agregado en corridas anteriores.
@returns {Array<{date: Date|null, col: number}>}
```


### Ubicación: `_leerBloquesFechaNuevos`

#### 14B080 — líneas 2291-2293 (comentario)

```text
=============================================================================
GET — lista de candidatos para el userscript
=============================================================================
```

#### 14B081 — líneas 2295-2382 (docblock)

```text
_obtenerListaCandidatosNuevos()
Miembros ACTIVOS de un clan Terna, Rango = "Miembro" y Admin != "Sí".
El userscript decide, revisando su historial real en RoyaleAPI, cuáles de
estos SÍ cuentan como "nuevos" (alguna de sus últimas 3 semanas de
historial perteneciente a un clan que no es Terna — FIX 06-ago-2026:
antes se revisaban solo las últimas 2, "última y/o penúltima").

FASE 10 (Consolidado_Cambios_Pendientes_Guerra.md, punto 3.1, pregunta
10): la respuesta incluyó por un tiempo `coberturaPorTag` — MISMO campo,
MISMO formato y MISMA función (_construirCoberturaPorTag(),
18_CorreccionGuerra.gs) que usa `_obtenerListaCorreccionGuerra()` para el
flujo de Corrección de Guerra, reusado tal cual (decisión del usuario,
ronda 6). La idea era que el userscript filtrara `registros` en
`procesarCandidatoActual()` con el mismo criterio `indexOf()` que ya usa
la fase 'perfiles' de Corrección de Guerra, para no REENVIAR al backend
semanas que el sistema ya tiene guardadas (reemplazando el filtro
`REGISTROS_MAX_ENVIO` — ver Tampermonkey.md).

FIX (11-sep-2026, pedido usuario: "en la hoja Nuevos solo aparecen los
registros de otros clanes pero no aparecen los registros que han tenido
ellos en nuestros clanes, salen vacías esas semanas"): ese reuso era
incorrecto para ESTE flujo y se revierte. `_construirCoberturaPorTag()`
solo puede contener semanas de Backup_Guerra.csv, que a su vez SOLO se
alimenta de los clanes Terna (ver runGuerra()/runGuerraRapido(),
17_GuerraSheet.gs) — es decir, una etiqueta "cubierta" ahí significa
exactamente "el candidato pasó esa semana en un clan Terna". Como el
userscript usa esa cobertura para NO reenviar semanas ya "cubiertas", en
la práctica terminaba omitiendo del payload justo las semanas que el
candidato pasó en NUESTROS clanes (nunca las de un clan rival, que jamás
quedan en Backup_Guerra.csv) — y _aplicarImportacionNuevos() escribe la
cuadrícula de la hoja Nuevos únicamente con lo que llega en ese payload,
así que esas semanas quedaban en blanco ahí, mientras que las de otros
clanes sí se veían. Esa optimización tenía sentido para Corrección de
Guerra (ahí el objetivo es justamente evitar duplicar datos que ya
existen en Guerra/Backup_Guerra.csv), pero la hoja Nuevos necesita el
historial COMPLETO y visible del candidato (incluidas sus semanas en
clanes Terna, para poder juzgar su trayectoria) — no debe filtrarse.
Por eso ahora se devuelve `coberturaPorTag: {}` (objeto vacío): el
mismo `indexOf()` que usa el userscript no encuentra ninguna etiqueta ya
"cubierta" para ningún tag, así que no filtra nada y reenvía el
historial completo tal como lo lee de RoyaleAPI. El único costo es que
ya no se ahorra ese reenvío de semanas Terna ya guardadas — inofensivo,
porque _aplicarImportacionNuevos() simplemente vuelve a escribir el
mismo valor en esa celda (ver su código, más abajo en este archivo).

FIX (29-ago-2026, pedido usuario): el filtro de AppScript ahora absorbe
parte de la evaluación de Tampermonkey — un candidato con participación
ESTABLECIDA en Terna (últimas 3 semanas con Ataques y Fame > 0, ver
_tagTieneParticipacionEstablecidaEnTerna()) ya no se incluye en la lista
que se manda al userscript. Tampermonkey NO se descarta ni cambia de
criterio: sigue evaluando el historial real de RoyaleAPI para todo el
resto de candidatos — esto solo evita reenviar cuentas que ya tienen
evidencia clara, sin depender de que Tampermonkey haya corrido.
ACTUALIZACIÓN (11-sep-2026): el criterio de "participación establecida"
YA NO exige Barcos > 0 (se quitó esa condición, ver el docblock de
_tagTieneParticipacionEstablecidaEnTerna() más abajo para el motivo
completo) -- este párrafo quedó desactualizado y se corrige acá para que
ambos comentarios digan lo mismo que el código.

FIX (16-sep-2026, pedido usuario: "consulta más de 60 cuentas y no
deberían pasar de 20" -- diagnóstico confirmado con el log [DIAG-Nuevos]):
la causa real NO era el requisito Ataques>0/Fame>0 en sí (ya correcto
desde el 11-sep-2026), sino que `_tagTieneParticipacionEstablecidaEnTerna()`
tomaba las "últimas 3 semanas" directamente de `mapaSemanalPorTag` SIN
excluir la semana de guerra VIGENTE (la que todavía está en curso, ej.
"T5_S2" en el log). Esa semana en curso normalmente tiene Ataques/Fame
parciales o en 0 simplemente porque el día de guerra actual todavía no
termina (el jugador puede atacar más tarde) -- no es evidencia de
inactividad, es un dato incompleto. Al contarla como una de las 3 semanas
exigidas, la mayoría de miembros activos reprobaban el chequeo por una
semana que ni siquiera había cerrado, inflando el lote a 60+ candidatos.
Ahora se obtiene el contexto vigente (`_getCtx()`) UNA sola vez acá y se
pasa a `_tagTieneParticipacionEstablecidaEnTerna()`, que descarta la
semana en curso antes de tomar las 3 más recientes -- ver su docblock más
abajo para el detalle. Los logs [DIAG-Nuevos], ya con la causa
confirmada, se retiran junto con este fix.

A propósito, este chequeo lee `Backup_Guerra.csv` DIRECTO (vía
_construirMapaSemanalPorTagDesdeSupercell()), NO `Backup_Guerra_Semanal.csv`
— ese segundo CSV se genera aplicando el overlay de `Correcciones_Guerra.csv`
(que a su vez viene de RoyaleAPI vía Tampermonkey, ver 18_CorreccionGuerra.gs),
así que usarlo acá haría que este primer filtro dependiera indirectamente
de que Tampermonkey ya haya corrido antes — justo lo que se quiere evitar,
dado que el userscript requiere inicio manual y no siempre hay
disponibilidad. `Backup_Guerra.csv` se alimenta únicamente de
runGuerra()/runGuerraRapido() contra la API de Supercell.
```


### Ubicación: `_obtenerListaCandidatosNuevos`

#### 14B082 — líneas 2385-2395 (comentario)

```text
FIX (24-sep-2026, pedido del usuario -- auditoría Sheet->CSV->JSON,
Tanda 6 / Tampermonkey): antes leía _leerDirectorioFisicoComoDC(ss)
directo, que no tiene fallback propio (devuelve [] en silencio si
Directorio no está disponible, ver su docblock) -- si la hoja fallaba,
este endpoint (llamado por el userscript de Tampermonkey) simplemente
dejaba de mandar candidatos, sin avisar. Mismo criterio ya aplicado en
_webAdminOtrasCuentas()/_getParticipacionHoyGuerra() (37_Web_API.gs/
17_GuerraSheet.gs): se usa _leerDirectorioFisicoComoDC(ss) mientras la
hoja esté disponible (necesita fusionar Players/Links), y solo se cae a
Backup_Directorio.csv (ya en formato DC de 60 columnas) cuando la hoja
no existe o está vacía.
```

#### 14B083 — líneas 2406-2410 (comentario)

```text
FIX (06-ago-2026): cada candidato ahora informa si YA está siendo
trackeado en la hoja Nuevos. El userscript usa este flag para mandar
su historial aunque ya no cuente como "esNuevo" — ver comentario en
Tampermonkey.md (antes, un candidato con fila ya existente dejaba de
recibir CUALQUIER actualización en cuanto pasaba un par de semanas).
```

#### 14B084 — líneas 2413-2416 (comentario)

```text
FIX (29-ago-2026): mapa semanal por Tag construido SOLO desde
Backup_Guerra.csv (Supercell), sin overlay de RoyaleAPI — ver docblock
arriba y el de _construirMapaSemanalPorTagDesdeSupercell() más abajo.
Se arma una sola vez fuera del loop.
```

#### 14B085 — líneas 2419-2425 (comentario)

```text
FIX (16-sep-2026): contexto vigente (temporada + semana en curso), para
que _tagTieneParticipacionEstablecidaEnTerna() pueda excluir la semana
todavía no cerrada de las "últimas 3 semanas" exigidas -- ver docblock
de esta función y el de esa función más abajo. _getCtx() no depende de
cache de clanes: sin cache (caso normal de este endpoint, llamado
aislado por Tampermonkey) recurre al último periodIndex aceptado como
válido por runGuerra()/runGuerraRapido().
```

#### 14B086 — líneas 2444-2449 (comentario)

```text
FIX (29-ago-2026): ya tiene participación establecida en Terna
(últimas 3 semanas con Ataques y Fame > 0 -- Barcos ya NO es parte del
criterio, ver ACTUALIZACIÓN 11-sep-2026 en el docblock de esta función
y el docblock de _tagTieneParticipacionEstablecidaEnTerna() más abajo)
→ no se envía a Tampermonkey, ya hay evidencia suficiente de que no
es "nuevo".
```

#### 14B087 — líneas 2465-2472 (comentario)

```text
FIX (11-sep-2026, pedido usuario): objeto vacío a propósito — ver
docblock de esta función, arriba, para el motivo completo. Antes acá
se llamaba a _construirCoberturaPorTag() (18_CorreccionGuerra.gs),
reusando la cobertura del flujo de Corrección de Guerra, lo que
hacía que Tampermonkey dejara en blanco justo las semanas que el
candidato pasó en un clan Terna. Se mantiene el campo en la
respuesta (en vez de quitarlo) para no romper el contrato que
Tampermonkey.md espera, pero siempre vacío para este flujo.
```

#### 14B088 — líneas 2477-2488 (docblock)

```text
_construirMapaSemanalPorTagDesdeSupercell()
Lee DIRECTO de Backup_Guerra.csv (histórico diario alimentado solo por la
API de Supercell vía runGuerra()/runGuerraRapido()) y agrega por semana
con el MISMO criterio que generarBackupGuerraSemanalCSV() (17_GuerraSheet.gs
— suma de AtaquesHoy, máximo de Fame, máximo de Barcos) — pero SIN aplicar
el overlay de Correcciones_Guerra.csv. A propósito: este mapa debe poder
construirse sin que Tampermonkey haya corrido nunca, así que no puede
depender de nada que a su vez dependa de RoyaleAPI.
@return {Object} { tag: [ {temporada, semana, ataques, fame, barcos}, ... ] }
  ordenado desc por (Temporada, Semana).
```


### Ubicación: `_construirMapaSemanalPorTagDesdeSupercell`

#### 14B089 — líneas 2546-2599 (docblock)

```text
_tagTieneParticipacionEstablecidaEnTerna(tag, mapaSemanalPorTag, ctx)
Devuelve true si `tag` tiene Ataques y Fame > 0 en sus 3 registros
semanales CERRADOS MÁS RECIENTES de `mapaSemanalPorTag` (orden Temporada
desc, luego Semana desc — puede cruzar temporadas si la actual todavía no
acumuló 3 semanas propias). Con menos de 3 registros cerrados, o con
Ataques o Fame en 0 dentro de esas 3 semanas, devuelve false (se manda
igual a Tampermonkey para que el userscript decida).

FIX (11-sep-2026, pedido usuario: "evalúa cuentas que llevan varios
meses ininterrumpidos en el clan, lo que contradice al filtro de 3
semanas" / "cada vez que ejecuto evalúa entre 70 y 80 cuentas"): ANTES
esta función también exigía Barcos > 0 en las 3 semanas (ver `barcos`
en el docblock viejo). Los ataques de barco (part.boatAttacks, ver
updateGuerraSheet(), 17_GuerraSheet.gs — ahí mismo se loguean como
"ALERTA especial" precisamente porque NO son un evento de todas las
semanas) son un ataque BONUS que solo está disponible cuando el clan ya
derrotó el jefe del día Y a ese jugador en particular le tocó turno de
usarlo — nada garantiza que un miembro, por más antiguo y activo que
sea, haga al menos un ataque de barco en CADA una de sus últimas 3
semanas. En la práctica esto hacía que la gran mayoría de miembros
activos (incluidos los de varios meses ininterrumpidos) fallaran esta
condición por Barcos, y por lo tanto NUNCA calificaran como
"participación establecida" — se seguían mandando a Tampermonkey en
cada corrida, inflando el lote a 70-80 cuentas en vez de limitarse a
los candidatos genuinamente nuevos o dudosos. Se quita la exigencia de
Barcos: Ataques > 0 y Fame > 0 (ambos sí ocurren toda semana en la que
el jugador realmente participa) son evidencia suficiente de
participación real en esa semana.

FIX (16-sep-2026, pedido usuario: "consulta más de 60 cuentas y no
deberían pasar de 20" tras el FIX 11-sep-2026 de arriba -- diagnóstico
confirmado con el log temporal [DIAG-Nuevos]: casi todos los "candidatos"
mostraban justo la semana de guerra VIGENTE, ej. "T5_S2", con
Ataques/Fame en 0 o parciales): el bug real no era el requisito en sí,
sino que `registros` (ordenado desc por Temporada/Semana) incluía la
semana en curso, que todavía no cierra y por lo tanto puede tener
Ataques/Fame en 0 sin que eso signifique inactividad — el jugador
simplemente no ha atacado TODAVÍA en el día de guerra actual. Contarla
como una de las 3 "semanas cerradas" exigidas reprobaba a la mayoría de
miembros activos por un dato incompleto, inflando el lote a 60+
candidatos en vez de limitarse a los genuinamente nuevos o dudosos.
Ahora se recibe `ctx` (ver _getCtx(), 00_Main.gs) y se descarta de
`registros` la fila cuya Temporada+Semana coincide con la semana VIGENTE
(ctx.temporada + ctx.sectionIndex+1) antes de tomar las 3 más recientes —
esa semana en curso simplemente no cuenta ni a favor ni en contra hasta
que cierre. El log [DIAG-Nuevos], ya con la causa confirmada, se retira
junto con este fix.
@param {string} tag
@param {Object} mapaSemanalPorTag  Ver _construirMapaSemanalPorTagDesdeSupercell().
@param {Object} ctx  Ver _getCtx() (00_Main.gs) — se usa ctx.temporada y
  ctx.sectionIndex (semana vigente = ctx.sectionIndex + 1) para excluir la
  semana de guerra en curso, todavía no cerrada.
```


### Ubicación: `_tagTieneParticipacionEstablecidaEnTerna`

#### 14B090 — líneas 2604-2607 (comentario)

```text
FIX (16-sep-2026, ver docblock arriba): descartar la semana de guerra
VIGENTE (todavía en curso, sin cerrar) antes de evaluar las "últimas 3
semanas". Si no hay ctx válido (caso extremo, no debería ocurrir dado
el fallback de _getCtx()), se sigue igual sin excluir nada.
```

#### 14B091 — líneas 2630-2634 (docblock)

```text
_obtenerTagsEnHojaNuevos(ss)
Helper de _obtenerListaCandidatosNuevos() (FIX 06-ago-2026): mapa
{TAG_EN_MAYUSCULAS: true} con los tags que ya tienen fila en Nuevos.
```


### Ubicación: `_obtenerTagsEnHojaNuevos`

#### 14B092 — líneas 2649-2672 (docblock)

```text
_ordenarBloquesFechaNuevos(sh)
FIX (pedido usuario: "las fechas quedan desordenadas"): _asegurarBloquesParaFechas()
mantiene las fechas MÁS RECIENTES a la izquierda cuando las agrega, pero
un bloque de "relleno"/backfill puede reutilizar cualquier hueco vacío
(o agregarse al final) sin comparar su fecha contra la de los bloques
vecinos — con el tiempo la cuadrícula puede quedar con fechas fuera de
orden. Esta función relee TODOS los bloques actuales y los reordena
físicamente por Fecha DESCENDENTE (más reciente primero, a la
izquierda — misma convención que el resto de la hoja), dejando los
bloques SIN fecha (vacíos, todavía no asignados) al final.

Implementación: en vez de mover columnas (moveColumns() tiene una
semántica de índice de destino fácil de errar off-by-one y no se puede
probar en este entorno), se leen los VALORES completos de cada bloque
(fecha + encabezados + todas las filas de datos) y se reescriben en su
posición deseada — el formato/merge de cada bloque ya es IDÉNTICO entre
sí (mismo patrón de _formatearBloqueFechaNuevos()), así que no se pierde
nada reordenando solo los valores. _buscarBloquePorFechaNuevos() empareja
siempre por VALOR de fecha, nunca por posición, así que reordenar acá no
rompe nada del resto del flujo.

No crea ni borra columnas — el ANCHO total de la cuadrícula no cambia.
```


### Ubicación: `_ordenarBloquesFechaNuevos`

#### 14B093 — líneas 2696-2716 (comentario)

```text
FIX (11-ago-2026) — BUG REAL ENCONTRADO: la versión anterior leía y
escribía CADA bloque completo (fila de Fecha + headers + datos) con un
solo getRange(NUEVOS_FILA_FECHAS, col, filasATransferir, 4).setValues(),
es decir, mezclando en UN MISMO rango la fila 2 (Fecha, celda COMBINADA
de 4 columnas) con las filas 3 en adelante (celdas normales, sin
combinar). Escribir con setValues() sobre un rango que abarca una
celda combinada JUNTO CON filas sin combinar es exactamente lo que el
resto de este archivo evita a propósito — ver repararFormatoEncabezadosNuevos()
más abajo, que SIEMPRE hace rango.breakApart() antes de tocar la fila
de Fecha. Sin ese resguardo, la escritura sobre la fila de Fecha
(mergeada) no se aplicaba de forma confiable: los bloques de abajo
(headers/datos) sí se movían, pero la fecha del encabezado se quedaba
en su columna original o quedaba inconsistente — la cuadrícula
terminaba viéndose exactamente tan desordenada como antes de llamar a
esta función, en TODOS los casos (no solo tras un Demoler+runAll). Se
corrige separando la escritura en dos partes: la fila de Fecha (celda
combinada, ancla en la columna base del bloque) se escribe aparte con
setValue(), y el resto del bloque (headers + filas de datos, celdas
normales) con setValues() — sigue siendo un puñado de llamadas batch
(nunca una por fila), solo que ya no mezcla merge y no-merge en un
mismo rango.
```

#### 14B094 — líneas 2734-2736 (comentario)

```text
Fila de Fecha: setValue() SOLO sobre la celda ancla del merge
destino — nunca setValues() de rango, para no arriesgar una
escritura ignorada/inconsistente sobre la celda combinada.
```

#### 14B095 — líneas 2750-2788 (docblock)

```text
_parseFechaISONuevos(texto)
Parsea "YYYY-MM-DD" (formato que muestra RoyaleAPI, ver PDF de ejemplo)
a un objeto Date en hora local, ignorando cualquier hora/zona horaria que
pudiera venir después (solo interesa el día calendario).

FIX (05-ago-2026) — DESFASE DE 1 DÍA CON ROYALEAPI:
RoyaleAPI muestra el cierre de cada semana de guerra con la fecha del
LUNES (el día siguiente al cierre real), mientras que el resto del
proyecto (Guerra, Control, Control_2, la fila 2 de "Nuevos" que el
usuario escribe a mano) usa siempre el DOMINGO como fecha de cierre de
semana — reportado por el usuario: "el registro que en RoyaleAPI se
muestra como 3 de agosto, en Sheets aparecerá como 2 de agosto".

Antes de este fix, esta función devolvía la fecha de RoyaleAPI TAL CUAL
(lunes), así que nunca coincidía con las fechas de cabecera de la fila 2
de "Nuevos" (domingo, escritas a mano) — _buscarBloquePorFechaNuevos()
jamás encontraba bloque, y CADA registro se descartaba en silencio
(contabilizado como "registrosOmitidos" en los logs), dejando la hoja
casi vacía aunque el userscript sí estuviera enviando datos.

Se resta 1 día ACÁ — un solo lugar, mismo patrón que
TEMPORADA_OFFSET_ROYALEAPI en 18_CorreccionGuerra.gs — para que, de aquí
en adelante, todo el resto del código (_buscarBloquePorFechaNuevos(), la
fila 2 de cabecera) siga trabajando en la MISMA convención de fecha
(domingo) que ya usa el resto del proyecto, sin tener que tocar nada más.

IMPORTANTE: la fila 2 de "Nuevos" debe seguir escribiéndose a mano con
la fecha en DOMINGO (ej. 02/08/2026), NO con la fecha que RoyaleAPI
muestra en pantalla (03/08/2026, lunes) — este fix asume esa convención.
Si alguna columna de la fila 2 ya quedó escrita con la fecha de lunes
(como se ve en el PDF de ejemplo, con headers 03/08, 27/07, 20/07), hay
que corregirla a mano a domingo (02/08, 26/07, 19/07) para que vuelva a
matchear. Los registros de semanas ya pasadas que se hayan descartado
antes de este fix no se recuperan solos: hace falta correr de nuevo el
userscript de "Buscar miembros nuevos" con la fila 2 ya corregida,
siempre que esa semana siga entre las últimas que RoyaleAPI conserva en
el historial del jugador.
```


### Ubicación: `_parseFechaISONuevos`

#### 14B096 — líneas 2798-2841 (docblock)

```text
_purgarNuevosEstablecidos(sh)
FIX (14-ago-2026, pedido explícito del usuario): "se supone que ya
debería limpiarse automáticamente, cualquier miembro que lleve más de 3
semanas en algún clan terna, no debe aparecer en la hoja Nuevos... en
cuanto sus 3 fechas más recientes estén en un clan terna (no
necesariamente el mismo clan terna), ya no se debe mostrar ahí."

CAUSA RAÍZ encontrada: _contarSemanasGuerraTerna(tag) (ver arriba en
este mismo archivo) YA implementa exactamente ese criterio — cuenta
semanas DISTINTAS (Temporada+Semana) con AtaquesSemana > 0 en
CUALQUIERA de los clanes Terna, según la hoja Guerra (la fuente más
confiable de participación real, más confiable que la cuadrícula de
"Nuevos", que depende del historial visual de RoyaleAPI). Pero hasta
ahora esa función solo se usaba dentro de
_guardarSnapshotDebugImportacionNuevos() (ver "SNAPSHOT DE DEPURACIÓN" en 14_Nuevos_RoyaleAPI.gs
más abajo en este archivo) para purgar un archivo JSON de DEPURACIÓN en
Drive — nunca para quitar filas de la hoja "Nuevos" que el usuario
realmente ve. Por eso la hoja jamás se achicaba sola, sin importar
cuántas semanas llevara un candidato ya establecido en un clan Terna.

Esta función reutiliza el MISMO criterio (SEMANAS_MIN_PARA_PURGAR_DEBUG_NUEVOS,
hoy = 3) pero aplicado directamente a las filas de datos de "Nuevos"
(desde NUEVOS_FILA_DATOS_INICIO). Borra físicamente (deleteRow) cada
fila cuyo Tag ya alcanzó el mínimo de semanas — de abajo hacia arriba,
para no desfasar los índices de fila ya calculados.

Se llama desde _refrescarColumnasFijasNuevos() (corre en TODO
runAll()/runUpdate(), sin depender del userscript de Tampermonkey ni de
ninguna llamada a la API — solo lee la hoja Guerra, que ya está
actualizada en ese punto del pipeline) y también al final de
_aplicarImportacionNuevos() (cada vez que el userscript manda un lote),
para que la hoja se autolimpie en ambos flujos sin depender de una
corrida manual dedicada.

No toca la cuadrícula de fechas ni ninguna otra hoja — solo elimina
filas completas de "Nuevos". El llamador es responsable de renumerar la
columna N° después (ver _renumerarNuevos() más abajo), ya que
_aplicarImportacionNuevos() y _refrescarColumnasFijasNuevos() ya tienen
su propia lógica de renumeración/formato que conviene correr una sola
vez, después del purgado.

@returns {number} cantidad de filas purgadas.
```


### Ubicación: `_purgarNuevosEstablecidos`

#### 14B097 — líneas 2848-2851 (comentario)

```text
FIX (22-ago-2026): mapa de semanas construido UNA sola vez (una sola
lectura de la hoja Guerra) en vez de dejar que _contarSemanasGuerraTerna()
relea toda la hoja Guerra por cada fila de "Nuevos" -- ver docblock de
_construirMapaSemanasGuerraTerna() más arriba en este archivo.
```

#### 14B098 — líneas 2866-2868 (comentario)

```text
Borrar de abajo hacia arriba: borrar una fila de arriba primero
correría hacia arriba los índices de las filas siguientes, todavía
pendientes de borrar en este mismo lote.
```

#### 14B099 — líneas 2880-2927 (docblock)

```text
_purgarNuevosExpulsados(sh, dirPorTag)
FIX (20-ago-2026, pedido usuario): "expulsé miembros del clan y siguieron
apareciendo en Nuevos sin importar cuántas veces corriera runAll()/
runGuerraRapido(), incluso después de forzarRosterFrescoAhora()".

CAUSA RAÍZ: hasta ahora la ÚNICA limpieza automática de "Nuevos" era
_purgarNuevosEstablecidos() (arriba), que solo saca de la hoja a quien YA
lleva 3+ semanas de guerra real en un clan Terna — es decir, candidatos
que "se graduaron" a miembro pleno. Nunca existió ningún chequeo de
membresía en vivo: un candidato expulsado del clan (in-game) que todavía
no llegaba a esas 3 semanas se quedaba en "Nuevos" para siempre, porque
nada volvía a preguntar "¿sigue siendo miembro de algún clan Terna?".

Esta función SÍ hace esa pregunta, usando el mismo criterio de membresía
en vivo que ya usa actualizarControl2() para filtrar Control_2
(Estado === 'Activo' && ClanTag en CFG.TERNA_TAGS, ver
23_Control2_GuerraSemanal.gs): cualquier fila de "Nuevos" cuyo Tag NO
aparezca en Directorio como Activo en un clan Terna se considera
expulsado/retirado y se borra. dirPorTag se recibe ya armado desde
_refrescarColumnasFijasNuevos() (mismo mapa que se usa después para
refrescar Nombre/Clan/etc.) para no leer Directorio dos veces.

SUPUESTO (documentado para poder ajustarlo rápido si no aplica): todo
candidato que llega a "Nuevos" ya es, en ese momento, miembro de un clan
Terna (así lo indican los comentarios de _purgarNuevosEstablecidos() y
_contarSemanasGuerraTerna()) — no es una lista de gente externa todavía
sin unirse. Por eso un Tag ausente de Directorio-Activo-Terna se
interpreta como "ya no es miembro" y no como "todavía no se unió". Si en
algún momento "Nuevos" empezara a incluir candidatos externos aún no
unidos, este chequeo tendría que revisarse (ej. exigir explícitamente
Estado === 'Inactivo' en vez de "ausente de Directorio").

Se llama desde _refrescarColumnasFijasNuevos() (corre en TODO
runAll()/runUpdate()/runGuerraRapido()), justo junto a
_purgarNuevosEstablecidos() y ANTES de refrescar columnas — mismo
criterio de orden (no perder tiempo refrescando filas que se van a
borrar en el mismo paso).

No toca la cuadrícula de fechas ni ninguna otra hoja — solo elimina
filas completas de "Nuevos". El llamador es responsable de renumerar la
columna N° después (ver _renumerarNuevos()).

@param {Sheet} sh Hoja "Nuevos".
@param {Object} dirPorTag Mapa Tag (mayúsculas) -> fila de Directorio
  (formato _leerDirectorioFisicoComoDC()).
@returns {number} cantidad de filas purgadas.
```


### Ubicación: `_purgarNuevosExpulsados`

#### 14B100 — líneas 2950-2952 (comentario)

```text
Borrar de abajo hacia arriba: borrar una fila de arriba primero
correría hacia arriba los índices de las filas siguientes, todavía
pendientes de borrar en este mismo lote.
```

#### 14B101 — líneas 2961-2965 (comentario)

```text
FIX (20-ago-2026, pedido usuario): si la purga deja la hoja en 0 filas
de candidatos, se deja constancia explícita en el log — así se puede
distinguir de un vistazo "Nuevos quedó vacía porque se purgó a todos
los candidatos existentes" de cualquier otro motivo (ej. la hoja ya
venía vacía antes de esta llamada, o algo la vació sin pasar por acá).
```

#### 14B102 — líneas 2978-2989 (docblock)

```text
_reajustarTituloGridNuevos(sh)
Después de agregar bloques nuevos al final de la cuadrícula (ver
_asegurarBloquesParaFechas()), el título combinado de la fila 1
("Historial RoyaleAPI...", creado por _pintarEncabezadosNuevos() con el
ancho ORIGINAL de 5 bloques) se queda corto — Sheets no extiende un merge
existente cuando se insertan columnas justo después de su borde derecho.
Esta función lo vuelve a combinar sobre el ancho TOTAL actual de la
cuadrícula, y de paso recrea el filtro nativo (mismo motivo: un filtro ya
creado tampoco se extiende solo más allá de su rango original) para que
cubra las columnas nuevas.
```


### Ubicación: `_reajustarTituloGridNuevos`

#### 14B103 — líneas 3008-3136 (docblock)

```text
_refrescarColumnasFijasNuevos()
FIX (06-ago-2026): Celular y RoyaleAPI solo se escribían dentro de
_aplicarImportacionNuevos(), que SOLO corre cuando el userscript de
Tampermonkey manda datos para un tag — y el userscript solo manda datos
de los candidatos que sigue detectando como "esNuevo" (última y/o
penúltima semana fuera de un clan Terna). Una vez que un candidato ya
lleva varias semanas adentro (el caso normal de casi todas las filas ya
existentes en Nuevos), deja de mandarse en cada corrida — así que
Celular/RoyaleAPI se quedaban vacíos para siempre en esas filas.

A diferencia del resto de _aplicarImportacionNuevos(), Celular y
RoyaleAPI NO necesitan datos de Tampermonkey en absoluto: Celular sale
directo de Directorio (mismo dato que DC.CELULAR) y RoyaleAPI se genera
directo desde el Tag (mismo patrón que makeLink() usa en Links). Esta
función recorre TODAS las filas ya existentes en Nuevos y refresca
ambas columnas sin depender de que llegue nada del userscript. Debe
llamarse dentro de PASOS_RUNALL/PASOS_RUNUPDATE (00_Main.gs), junto a
_restaurarNuevosSiNoExiste().

FIX (07-ago-2026): se extiende para sincronizar TAMBIÉN Nombre/Nom_Multi/
Clan/Nivel/Copas/V_Guerra/Días inactivo (Inactividad(d)) desde
Directorio, mismo criterio que Celular — estas columnas solo se
escribían dentro de _aplicarImportacionNuevos() con los datos que manda
el userscript en el momento de detectar al candidato como "nuevo"
(_construirFilaNuevos(), más abajo en este archivo), así que quedaban
congeladas con el valor que tenían esa primera vez y nunca más se
refrescaban (el jugador podía ascender de rango, cambiar de Nom_Multi,
subir de Nivel/Copas/V_Guerra, o sumar días de inactividad, y Nuevos
seguía mostrando el dato viejo indefinidamente). Igual que con
Celular/RoyaleAPI, si el tag ya no aparece en el Directorio (dRow
inexistente) se conserva el valor que ya tenía la fila, en vez de
vaciarlo.

FIX (09-ago-2026): al final también se vuelve a llamar a
_aplicarFormatoCondicionalClanesNuevos(sh) — pedido explícito del
usuario: "al demoler y restaurar, solo le dio color a las filas del
clan principal". Causa raíz: _restaurarNuevosSiNoExiste() (más arriba en
este archivo) llama a esa misma función justo después de un Demoler,
pero en ESE punto de PASOS_RUNALL la hoja "Clan" todavía no tiene
nombres (columna Nombre vacía, recién creada por _setupClan()) ni
_fetchAllClanData() corrió todavía — _getNombresClanesTernaOrdenados()
(01_Config_Global.gs) cae entonces a su fallback, CFG.TERNA_TAGS.map(
_resolverNombreClan), y CFG.CLAN_NOMBRES_FALLBACK SOLO tiene registrado
el ClanTag del clan principal (#GCRG8L00) — los otros 3 clanes Terna
resuelven al Tag crudo (ej. "#GYCU9YRG") en vez de a su nombre real, así
que la regla de formato condicional para esos 3 nunca coincide con
ningún valor real de la columna Clan y esas filas quedan sin color.
_refrescarColumnasFijasNuevos() es el lugar correcto para repetir la
llamada: en PASOS_RUNALL corre en su PROPIO paso, después de
updateClanSheet() y updateDirectorioSheet() (que a su vez corren después
de _fetchAllClanData()) — mismo criterio ya aplicado en su momento a
_restaurarControl2SiNoExiste() (ver FIX 03-ago-2026, 10_ClanSheet.gs) para
esta misma clase de bug. Para entonces la hoja "Clan" ya tiene los 4
nombres reales, así que esta segunda pasada sí colorea los 4 clanes
Terna correctamente, sin tener que tocar el orden de PASOS_RUNALL ni
CFG.CLAN_NOMBRES_FALLBACK (que sigue sirviendo solo para su propósito
original: Clanes_Admin antes de que haya cache — ver 01_Config_Global.gs).

FIX (11-ago-2026) — ORDEN Y FORMATO DE ENCABEZADOS TAMBIÉN EN RUNALL: hasta
ahora, _ordenarBloquesFechaNuevos() (reordena las columnas de fecha, más
reciente a la izquierda) y el reformateo de encabezados más allá de los 5
bloques originales SOLO ocurrían dentro de _aplicarImportacionNuevos(), es
decir, únicamente cuando el userscript de Tampermonkey hacía un POST con
fechas nuevas. Un runAll/runUpdate corriente (sin que Tampermonkey haya
mandado nada en esa corrida) nunca los disparaba — y, en particular, tras
Demoler + runAll, _restaurarNuevosSiNoExiste() repone la hoja desde
Backup_Nuevos.csv y pinta encabezados con _pintarEncabezadosNuevos(), que
deja formateados SOLO los primeros GRID_NUM_BLOQUES_NUEVOS (5) bloques
(ver docblock de esa función) aunque el CSV restaurado traiga más
columnas de fecha (lo normal, la hoja real crece con el tiempo) —
síntoma reportado: "aplica el formato a los encabezados pasada la 5ta
fecha al ejecutar Tampermonkey, pero no al demoler y correr runAll", y
"las fechas no se ordenan, ni con Tampermonkey ni con runAll".
_refrescarColumnasFijasNuevos() SÍ corre en TODO runAll/runUpdate (ver
docblock de la función), así que es el lugar correcto para garantizar
ambas cosas siempre, sin depender de que Tampermonkey haya posteado algo
ese día: reordena físicamente los bloques por fecha descendente y
reaplica fondo/letra/bordes de encabezado a TODO el ancho real de la
cuadrícula (no solo los primeros 5), reutilizando
repararFormatoEncabezadosNuevos() en vez de duplicar esa lógica. Se hace
ANTES del "if (lastRow < ...) return;" de más abajo porque el orden y el
formato de encabezados no dependen de que haya filas de datos.

FIX (22-ago-2026): "Exceeded maximum execution time" con el log
'[Nuevos-RoyaleAPI] repararFormatoEncabezadosNuevos: ...' como última
línea antes del corte. Causa raíz: exactamente el mismo patrón que ya
describe el comentario "barrida general" del 22-ago-2026 en PASOS_RUNALL
(00_Main.gs) — esta función corría TODO su trabajo (reparar encabezados,
purgar establecidos/expulsados, refrescar columnas fijas de TODAS las
filas, actualizar semana actual, reordenar filas, repintar formato
condicional y limpiar links) de un solo tirón, como UN SOLO paso dentro
de PASOS_RUNALL/PASOS_RUNUPDATE/PASOS_RUNGUERRARAPIDO. El chequeo de
presupuesto de _ejecutarPorTandas() (00_Main.gs) solo corre ENTRE pasos,
así que si esta función por sí sola tarda demasiado (la hoja "Nuevos"
viene creciendo: al momento de este FIX ya tenía 34 bloques de
historial), puede consumir sola el resto del límite duro de la
plataforma antes de que _ejecutarPorTandas() tenga oportunidad de cortar
limpio y programar la continuación automática.

SOLUCIÓN: se separa en 3 funciones más chicas, cada una pensada para ser
su PROPIO paso dentro de PASOS_RUNALL/PASOS_RUNUPDATE/
PASOS_RUNGUERRARAPIDO (00_Main.gs), dando un punto de control de
presupuesto entre cada una — mismo criterio ya aplicado a Extra/Clan,
Cards/Cards_2, Guerra/Guerra_Logs, Control/Control_2, etc.:
  1) _refrescarColumnasFijasNuevos_Paso1_FormatoYPurgado(sh) — reordena
     bloques de fecha, repara formato de encabezados, purga candidatos
     ya establecidos/expulsados y, si la hoja queda vacía, intenta
     restaurarla desde el respaldo de debug.
  2) _refrescarColumnasFijasNuevos_Paso2_ColumnasFijas(sh) — refresca
     Nombre/Nom_Multi/Clan/Nivel/Copas/V_Guerra/Días inactivo/Celular/
     RoyaleAPI en todas las filas de datos ya existentes.
  3) _refrescarColumnasFijasNuevos_Paso3_OrdenYFormato(sh) — escribe la
     "Semana actual", reordena las filas por Clan -> Nombre, repinta el
     formato condicional y limpia links accidentales.
_refrescarColumnasFijasNuevos() se conserva TAL CUAL (mismo nombre,
mismo comportamiento) como envoltorio de las 3 partes en orden, por si
algo la sigue llamando de un solo tirón (ej. ejecución manual desde el
editor de Apps Script) — NO debe usarse dentro de PASOS_RUNALL/
PASOS_RUNUPDATE/PASOS_RUNGUERRARAPIDO, que deben llamar a las 3 partes
como pasos separados (ver 00_Main.gs).

Cada parte vuelve a resolver la hoja, `dirPorTag` y `lastRow`/`numFilas`
por su cuenta (no se pasan variables en memoria entre partes) porque,
igual que con CACHE_CLAN_DATA (ver _ejecutarPorTandas(), 00_Main.gs), si
el presupuesto se agota entre partes, la continuación automática es una
ejecución de Apps Script completamente nueva y no puede depender de
estado en memoria de la tanda anterior.
```


### Ubicación: `_refrescarColumnasFijasNuevos_Paso1_FormatoYPurgado`

#### 14B104 — líneas 3151-3156 (comentario)

```text
FIX (20-ago-2026, pedido usuario): dirPorTag se construye ACÁ ARRIBA
(antes iba más abajo, después de los purgados) para poder pasárselo
también a _purgarNuevosExpulsados() (nueva, ver más abajo). Es el mismo
mapa Tag -> fila de Directorio que ya se usaba para refrescar
Nombre/Clan/etc., reutilizado ahora también como fuente de verdad de
membresía en vivo (Estado + ClanTag).
```

#### 14B105 — líneas 3164-3179 (comentario)

```text
FIX (14-ago-2026, pedido usuario): autolimpieza de candidatos ya
establecidos (3+ semanas de guerra real en un clan Terna) — ver
docblock de _purgarNuevosEstablecidos() más abajo en este archivo.

FIX (20-ago-2026, pedido usuario): "expulsé miembros y siguieron
apareciendo en Nuevos sin importar cuántas veces corriera runAll()/
runGuerraRapido()". Causa raíz: _purgarNuevosEstablecidos() es la ÚNICA
limpieza automática que existía, y su criterio es "3+ semanas
establecido en un clan Terna" — nunca revisaba si el candidato SEGUÍA
siendo miembro. Un expulsado que aún no llegaba a esas 3 semanas se
quedaba en la hoja indefinidamente. Se agrega _purgarNuevosExpulsados()
(mismo criterio de membresía en vivo que ya usa actualizarControl2()
para filtrar Control_2: Estado === 'Activo' && ClanTag en un clan
Terna) para cubrir justo ese caso. Ambos purgados se corren PRIMERO,
antes de leer/refrescar las columnas fijas, para no perder tiempo
refrescando filas que se van a borrar en el mismo paso.
```

#### 14B106 — líneas 3185-3194 (comentario)

```text
FIX (02-sep-2026, ver docblock de NUEVOS_RESTORE_PROGRESS_FILE más
arriba): antes esta condición era SOLO "hoja vacía" (lastRow <
NUEVOS_FILA_DATOS_INICIO), pensada para el caso Demoler + runAll(). Pero
si un intento de restauración anterior se cortó a mitad de camino (por
el límite duro de la plataforma) ya alcanzó a escribir 1-2 filas, así
que la hoja deja de estar "vacía" y esta condición nunca volvía a
dispararse -- el resto del respaldo quedaba huérfano para siempre. Ahora
también se dispara si queda un checkpoint de restauración pendiente
(_hayRestauracionNuevosPendiente()), sin importar cuántas filas ya
tenga la hoja.
```

#### 14B107 — líneas 3196-3208 (comentario)

```text
PEDIDO DEL USUARIO (22-ago-2026): antes de rendirse por "no hay
filas" (típicamente tras un Demoler + runAll(), que recrea la hoja
100% vacía), intentar reponerlas desde el último respaldo de
Tampermonkey (Correcciones_Nuevos.csv) -- ver
_restaurarNuevosDesdeCsvDebug() (14_Nuevos_RoyaleAPI.gs).
Envuelto en try/catch para no tumbar el resto de
_refrescarColumnasFijasNuevos()/runAll()/runGuerraRapido() si el
respaldo estuviera corrupto o faltara algún dato.

FIX (02-sep-2026): _restaurarNuevosDesdeCsvDebug() ahora es resumible
(procesa en sub-lotes acotados por tiempo, ver
NUEVOS_RESTORE_PRESUPUESTO_MS) -- el resultado incluye `completo:
false` si todavía queda respaldo pendiente para la próxima corrida.
```


### Ubicación: `_refrescarColumnasFijasNuevos_Paso3_OrdenYFormato`

#### 14B108 — líneas 3297-3312 (comentario)

```text
FIX (09-ago-2026): ver docblock de _refrescarColumnasFijasNuevos() más
arriba — se repinta el formato condicional ahora que la hoja "Clan"
(leída por _getNombresClanesTernaOrdenados()) ya tiene sus 4 nombres
reales en este punto de PASOS_RUNALL, y de paso se limpia cualquier
hipervínculo accidental que la columna "Clan" recién escrita en el
paso anterior pudiera haber heredado del Directorio (mismo motivo que
la limpieza equivalente en _aplicarImportacionNuevos()/
_restaurarNuevosSiNoExiste(), ver ahí).

FIX (13-ago-2026, pedido usuario): además de repintar el formato
condicional (ahora unificado, clanes + "Semana actual"), acá también se
escribe la "Semana actual" (mismos valores que Control) y se reordenan
TODAS las filas por Clan -> Nombre (no solo las nuevas que inserta el
userscript, ver _reordenarFilasNuevosPorClanYNombre()) — corre en TODO
runAll()/runUpdate(), así que es el lugar correcto para mantener la
hoja ordenada aunque el Clan de algún candidato haya cambiado.
```

#### 14B109 — líneas 3321-3328 (docblock)

```text
_renumerarNuevos(sh)
Recalcula la columna N° (1, 2, 3...) de forma continua para todas las
filas de datos de "Nuevos". Se separa de _purgarNuevosEstablecidos()
porque varios llamadores (import, refresco periódico) ya hacían su
propia renumeración en otro punto del flujo; centralizarla acá evita
dejar huecos en N° después de un borrado.
```


### Ubicación: `_renumerarNuevos`

#### 14B110 — líneas 3338-3348 (docblock)

```text
_reordenarFilasNuevosPorClanYNombre(sh)
FIX (13-ago-2026, pedido usuario): hasta ahora solo las filas NUEVAS se
insertaban ordenadas (_insertarNuevosCandidatosOrdenadosPorClan), pero las
filas ya existentes nunca se reubicaban si su Clan cambiaba o si quedaron
mal ordenadas de antes. Esta función relee TODA la hoja y la reordena de
una vez por Clan (orden de la hoja Clan) -> Nombre (Nom_Multi || Nombre).
No usa RichText para el bulk (evitaría números guardados como texto,
rompiendo el formato condicional): reordena valores planos y, aparte,
reordena el RichTextValue de RoyaleAPI (único link de las columnas fijas).
```


### Ubicación: `_reordenarFilasNuevosPorClanYNombre`

#### 14B111 — líneas 3391-3475 (docblock)

```text
_restaurarNuevosDesdeCsvDebug()
PEDIDO DEL USUARIO (22-ago-2026): "cuando ejecuto tampermonkey, eso se
guarda. todos esos miembros nuevos que siguen en el clan, deben volver a
aparecer, porque ya quedaron en su archivo de respaldo" -- hasta ahora
Correcciones_Nuevos.csv (NOMBRE_CSV_DEBUG_NUEVOS) era de SOLO ESCRITURA:
se generaba en cada importación del userscript, pero nada lo volvía a
leer. Cubre sobre todo el caso "Demoler + runAll()": la hoja "Nuevos" se
recrea 100% vacía, y hasta ahora había que esperar a la próxima corrida
de Tampermonkey para que reaparecieran candidatos que el sistema ya
había detectado antes.

FILTRO IMPORTANTE ("que siguen en el clan"): a diferencia de una
importación normal del userscript, acá SÍ hace falta filtrar por
membresía activa ANTES de reconstruir el payload -- si se le pasara todo
el CSV tal cual a _aplicarImportacionNuevos(), reinsertaría también a
quienes ya dejaron el clan desde el último respaldo (esa función no
filtra por membresía al insertar, solo al refrescar columnas fijas de
filas YA existentes -- ver su propio comentario "conservar lo que ya
hubiera en la fila en vez de vaciarlo"). Se usa el MISMO criterio que ya
usa _purgarNuevosExpulsados() (Estado === 'Activo' && ClanTag en un clan
Terna) y también se excluye a quien ya haya alcanzado
SEMANAS_MIN_PARA_PURGAR_DEBUG_NUEVOS semanas de guerra Terna (mismo
criterio que _purgarNuevosEstablecidos()) -- en la práctica el CSV ya
debería venir sin estos últimos (se purgan solos en cada escritura, ver
_guardarSnapshotDebugImportacionNuevos()), pero se revalida acá por si
pasó tiempo entre el último respaldo y esta restauración.

FORMATO DE FECHA (FIX 22-ago-2026, pedido del usuario): se lee
Fecha_TS (epoch ms, numérico -- ver _guardarSnapshotDebugImportacionNuevos())
en vez de parsear la columna Fecha (texto, dd/MM/yyyy) con regex -- esa
columna de texto es puramente decorativa/visual, nunca la fuente de
verdad. Aun así, hace falta UNA conversión: Fecha_TS ya viene en la
convención del proyecto (domingo), pero _aplicarImportacionNuevos()
espera reg.fecha en el formato CRUDO que manda RoyaleAPI (texto
YYYY-MM-DD, lunes) y le aplica su propio -1 día vía
_parseFechaISONuevos(). Por eso acá se hace la conversión inversa
(domingo -> +1 día -> lunes -> texto YYYY-MM-DD) ANTES de armar el
payload, para poder reusar _aplicarImportacionNuevos() tal cual, sin
duplicar su lógica de escritura de hoja/cuadrícula en una segunda
implementación paralela. La diferencia contra la versión anterior de
esta función es que ahora se parte de un número (Fecha_TS), no de texto
parseado con regex -- no hay forma de que un formato de fecha
inesperado en el CSV lo descarte en silencio.

FIX (02-sep-2026, pedido usuario: "es un error recurrente en tampermonkey...
la hoja Nuevos solo me muestra 1 o 2 jugadores"): esta función ahora es
RESUMIBLE. Antes mandaba TODO candidatosPayload de una sola vez a
_aplicarImportacionNuevos(), sin punto de control -- con varias decenas de
candidatos represados (típico justo después de un Demoler), esa única
llamada podía superar el límite duro de la plataforma a mitad de camino,
dejando en la hoja solo los 1-2 candidatos que alcanzaron a escribirse
antes del corte. Como ese corte NO es una excepción de JS capturable (ver
NUEVOS_RESTORE_PROGRESS_FILE, más arriba en este archivo, para el detalle
completo), y la hoja dejaba de estar "vacía" con esas pocas filas, la
restauración nunca se reintentaba sola.

Ahora se usa un checkpoint en Drive (_cargarProgresoRestaurarNuevos() /
_guardarProgresoRestaurarNuevos(), mismo patrón que el progreso de
/players) con los Tags que YA se restauraron en este intento. Cada
llamada:
  1) reconstruye candidatosPayload completo desde el CSV (igual que
     antes, con los mismos filtros de membresía/semanas);
  2) descarta del payload los Tags que el checkpoint ya marca como
     restaurados;
  3) procesa lo que queda en sub-lotes de NUEVOS_RESTORE_LOTE_MAX
     candidatos, llamando a _aplicarImportacionNuevos() por sub-lote, y
     cortando en cuanto se supera NUEVOS_RESTORE_PRESUPUESTO_MS de tiempo
     transcurrido (deja margen bajo el límite duro de la plataforma para
     que la ejecución termine limpia en vez de que la corte la
     plataforma);
  4) guarda el checkpoint actualizado con los Tags recién restaurados. Si
     no quedó ningún Tag pendiente, borra el checkpoint (restauración
     completa) -- si quedaron pendientes, el checkpoint sobrevive para
     que la PRÓXIMA corrida de runAll()/runGuerraRapido() retome justo
     donde se cortó ésta (ver el cambio de condición en
     _refrescarColumnasFijasNuevos_Paso1_FormatoYPurgado(), que ya no
     depende solo de "hoja vacía").

@returns {Object|null} { ok, procesados, filasNuevas, filasEliminadas,
  errores, completo, pendientes } acumulado de los sub-lotes procesados en
  ESTA corrida (completo=false y pendientes>0 si quedó respaldo sin
  aplicar para la próxima corrida), o null si no había nada respaldado ni
  pendiente / nada que califique tras el filtro de membresía.
```


### Ubicación: `_restaurarNuevosDesdeCsvDebug`

#### 14B112 — líneas 3495-3498 (comentario)

```text
FIX (22-ago-2026): mapa de semanas construido UNA sola vez en vez de
releer toda la hoja Guerra por cada FILA del CSV de respaldo -- ver
docblock de _construirMapaSemanasGuerraTerna() más arriba en este
archivo.
```

#### 14B113 — líneas 3517-3519 (comentario)

```text
Fecha_TS (numérico, epoch ms) -- ver docblock de esta función.
Columna 3 (índice 3, tras Tag/Temporada/Fecha) -- Fecha (índice 2,
texto) NO se usa acá, es solo para visualización en el CSV.
```

#### 14B114 — líneas 3579-3582 (comentario)

```text
--- Procesar en sub-lotes acotados por tiempo, guardando checkpoint
    después de cada sub-lote (no solo al final): si la plataforma corta
    la ejecución a mitad de un sub-lote posterior, el checkpoint ya
    refleja los sub-lotes anteriores que sí se completaron.
```

#### 14B115 — líneas 3605-3609 (comentario)

```text
Sub-lote aplicado con éxito -- sus Tags pasan a "ya restaurados",
sin importar si algún Tag individual tuvo un error puntual dentro
del sub-lote (mismo criterio que _aplicarImportacionNuevos(), que
aísla errores por candidato y no aborta el resto -- reintentar todo
el sub-lote de nuevo repetiría los que sí funcionaron).
```

#### 14B116 — líneas 3621-3624 (comentario)

```text
pendientesReales: cuántos Tags del payload total (que califican por
membresía/semanas) todavía NO están en tagsYaRestaurados tras esta
corrida -- si el presupuesto se agotó a mitad de camino (seAgotoElPresupuesto),
esto va a ser > 0 y el checkpoint sobrevive para la próxima corrida.
```

#### 14B117 — líneas 3648-3699 (docblock)

```text
_asegurarBloquesParaFechas(sh, fechasNecesarias)
Garantiza que exista un bloque (columna) en la fila NUEVOS_FILA_FECHAS
para CADA fecha en fechasNecesarias (Date, ya normalizadas por
_parseFechaISONuevos() — domingo, misma convención que el resto del
proyecto). El diseño original de esta hoja asumía como máximo
GRID_NUM_BLOQUES_NUEVOS (5) fechas compartidas por TODOS los jugadores —
pero distintas cuentas pueden tener su "últimas 5 filas de historial"
desalineadas entre sí (p. ej. si a alguna le faltó participar en una
guerra puntual), así que el conjunto de fechas realmente necesario para
un mismo envío puede superar 5. Antes de este fix, cualquier fecha sin
un bloque ya existente que coincidiera se descartaba en silencio
(registrosOmitidos) — pedido explícito del usuario: "no se debe ignorar
los registros".

Estrategia (FIX 06-ago-2026 — reescrita para que las semanas más
recientes queden a la IZQUIERDA, como pidió el usuario; el resto de la
hoja ya va de más reciente a más antigua de izquierda a derecha, así
que agregar SIEMPRE al final quedaba al revés):
  0) CASO DE ARRANQUE — si la cuadrícula todavía no tiene NINGÚN bloque
     con fecha asignada (hoja recién creada, con los
     GRID_NUM_BLOQUES_NUEVOS (5) bloques vacíos que deja
     _pintarEncabezadosNuevos()), esos espacios se aprovechan primero:
     se asignan de más reciente a más antigua, en el mismo orden
     izquierda->derecha en que ya están posicionados, para que la
     cuadrícula arranque directamente en el orden correcto.
  1) Para el resto de las fechas faltantes, se separan en dos grupos
     según se comparen contra la fecha MÁS RECIENTE que ya tenga algún
     bloque existente:
       a) MÁS RECIENTES que ese máximo (una semana nueva que RoyaleAPI
          acaba de publicar) → se insertan con insertColumnsBefore()
          justo al inicio de la cuadrícula (COL_INICIO_GRID_NUEVOS),
          de la más antigua a la más nueva DE ESTE LOTE, para que la
          más nueva termine físicamente más a la izquierda de todas.
       b) NO más recientes (fechas de "relleno"/backfill — típico al
          completar el historial de un miembro recién agregado a
          "Nuevos", cuyo historial puede alcanzar semanas más antiguas
          que las que ya tiene la hoja) → mismo criterio que antes:
          reutilizan un bloque vacío si lo hay, o se agregan al FINAL
          de la cuadrícula (insertColumnsAfter) si no.
  2) A las columnas nuevas se les aplica el mismo formato de encabezado
     que ya tienen los bloques existentes (_formatearBloqueFechaNuevos()),
     y se reajusta el título combinado de la fila 1 + el filtro nativo
     para que cubran TODA la cuadrícula resultante
     (_reajustarTituloGridNuevos()).
El resto del código (_buscarBloquePorFechaNuevos()) empareja SIEMPRE por
el valor de fecha de cada columna, nunca por su posición, así que
reordenar columnas a mano tampoco rompe nada.

No modifica ninguna fila de datos (candidatos) — eso lo sigue haciendo
_aplicarImportacionNuevos() después de llamar a esta función.
```

#### 14B118 — líneas 3700-3751 (docblock)

```text
_seleccionarFechasNuevasNecesariasNuevos(sh, candidatosPayload)
FIX (09-ago-2026): decide qué fechas realmente necesitan una columna
NUEVA en la cuadrícula de "Nuevos" — pedido explícito del usuario: la
hoja debe garantizar un MÍNIMO de GRID_NUM_BLOQUES_NUEVOS (5) registros
por candidato, pero sin crear más columnas de las estrictamente
necesarias para llegar a ese mínimo (ver docblock de
_aplicarImportacionNuevos() para los dos ejemplos exactos del pedido).

FIX (12-ago-2026) — LA SEMANA MÁS RECIENTE YA NO SE PIERDE: el diseño
original de este FIX (09-ago-2026, ver historial abajo) aplicaba el
criterio de "mínimo 5" sobre TODAS las fechas del candidato por igual,
sin importar su antigüedad. Bug reportado: un candidato con historial
largo ya tenía 5+ columnas coincidentes de temporadas VIEJAS, así que el
candidato se saltaba ENTERO (paso 3 de abajo) antes de revisar si, entre
sus fechas "sin bloque", estaba la semana más nueva recién publicada en
RoyaleAPI — esa fecha nunca llegaba a pedir columna, para NINGÚN
candidato, y la hoja "Nuevos" se quedaba pegada en la temporada
anterior. Ahora, antes de aplicar el criterio de mínimo, las fechas del
candidato se separan en dos grupos:
  • Más recientes que el bloque existente más nuevo de la hoja (semana
    nueva de guerra) → SIEMPRE piden columna, sin excepción.
  • El resto (relleno/backfill, no más nuevo que lo que ya hay en la
    hoja) → sigue el criterio de mínimo 5 tal cual (pasos 1-4 de abajo),
    sin crear más columnas de las estrictamente necesarias.

Por cada candidato del payload (pasos 1-4 aplicados solo al grupo de
relleno/backfill, ver arriba):
  1) Se parsean y deduplican (por día) sus fechas de registros.
  2) Se separan en "coincidentes" (ya existe un bloque/columna con esa
     fecha en la hoja, sin importar si esta fila puntual ya tenía dato
     ahí o no) y "sin bloque".
  3) Si las coincidentes ya suman GRID_NUM_BLOQUES_NUEVOS (5) o más, el
     candidato NO necesita ninguna columna nueva de relleno — sus fechas
     "sin bloque" restantes simplemente no generan columna (se guardarán
     como "registrosOmitidos" al procesar la fila, igual que una fecha
     sin bloque de toda la vida).
  4) Si no llegan a 5, se ordenan sus fechas "sin bloque" de la más
     reciente a la más antigua y se toman solo las primeras
     (5 - coincidentes) — el resto tampoco genera columna nueva.
El resultado es la unión (deduplicada entre candidatos) de esas fechas
"por completar" — el único insumo que debe recibir
_asegurarBloquesParaFechas() para que la cuadrícula crezca lo justo y
necesario. Si una columna termina creándose porque OTRO candidato la
necesitaba para llegar a su propio mínimo, un candidato que ya tenía 5+
coincidentes puede "aprovecharla" gratis para esa fecha puntual si
también la tenía en su payload — no viola el pedido (esa columna de
todas formas era necesaria), solo evita crear una de más.

No modifica la hoja — es una función de solo lectura/selección, la
escritura la sigue haciendo _asegurarBloquesParaFechas() como siempre.
```


### Ubicación: `_seleccionarFechasNuevasNecesariasNuevos`

#### 14B119 — líneas 3762-3787 (comentario)

```text
FIX (12-ago-2026): bug reportado — "no está agregando la última semana
de guerra registrada en RoyaleAPI" (la hoja se quedaba pegada en la
temporada anterior, sin la más reciente ya publicada). Causa raíz: el
criterio de "mínimo 5" de abajo (FIX 09-ago-2026) miraba el TOTAL de
fechas coincidentes de un candidato sin distinguir su antigüedad — un
candidato con historial largo ya tenía 5+ columnas coincidentes de
semanas VIEJAS, así que el bloque `if (coincidentes.length >=
GRID_NUM_BLOQUES_NUEVOS) continue;` saltaba el candidato ENTERO antes
de mirar si alguna de sus fechas "sin bloque" era en realidad la
semana más nueva recién publicada por RoyaleAPI (más reciente que
maxFechaExistente) — esa fecha nunca llegaba a
_asegurarBloquesParaFechas() y por lo tanto nunca se creaba su
columna, para NINGÚN candidato, hasta que maxFechaExistente < esa
fecha por otra vía (nunca pasaba). Se guardaba igual como
"registrosOmitidos" en vez de perderse silenciosamente en el payload,
pero jamás se pintaba en la hoja.

Ahora se separan las fechas del candidato en dos grupos ANTES de
aplicar la lógica de mínimo:
  a) Más recientes que maxFechaExistente (semana(s) nueva(s) que
     RoyaleAPI acaba de publicar) → SIEMPRE generan columna nueva, sin
     importar cuántas coincidentes viejas tenga ya el candidato.
  b) El resto (fechas de relleno/backfill, no más nuevas que lo que ya
     hay en la hoja) → sigue exactamente el criterio de mínimo 5 de
     antes (FIX 09-ago-2026), sin crear más columnas de las
     estrictamente necesarias para llegar a ese mínimo.
```

#### 14B120 — líneas 3843-3868 (comentario)

```text
=============================================================================
FASE 9 (Consolidado_Cambios_Pendientes_Guerra.md, punto 3): MIGRACIÓN DE
"Nuevos" -> Guerra/Backup_Guerra.csv (semanas Terna que el sistema propio
nunca registró en tiempo real, reconstruidas desde el historial de
RoyaleAPI que ya trae el userscript de Tampermonkey para esta hoja).
=============================================================================

MOTIVACIÓN: la hoja "Nuevos" ya recibe, para cada candidato, su historial
completo de RoyaleAPI (bloques de fecha con Clan/Ataques/Fame/Barcos por
semana — ver cabecera de este archivo). Antes de este punto, ese
historial SOLO se usaba para decidir si el candidato "cuenta como nuevo"
(últimas 3 semanas) y para mostrarlo en la cuadrícula de "Nuevos" — nunca
se cruzaba contra Guerra/Backup_Guerra.csv, así que semanas donde el
jugador YA estaba en un clan Terna pero el sistema propio no las
registró (bug viejo, corrida caída, etc. — ver punto 1.5) se perdían
para siempre en cuanto el candidato se purgaba de "Nuevos"
(_purgarNuevosEstablecidos()).

REGLA DE NO PISADO: esta migración NUNCA toca una clave
Temporada|Semana|Tag que YA existe en Guerra/Backup_Guerra.csv. "Nuevos"
es una fuente secundaria (un snapshot de perfil, sin desglose diario
real garantizado) — si el sistema propio ya tiene esa semana registrada
(aunque sea a medias), esa fuente manda; solo se usa este mecanismo para
LLENAR huecos, nunca para corregir datos ya presentes (para eso está el
punto 1, corrección vía RoyaleAPI/Control_2).
=============================================================================
```

#### 14B121 — líneas 3870-3883 (docblock)

```text
_fechaATemporadaSemana(fecha)
Inversa de calcDiaGuerraIdx()/primerLunesTemporada(): dado un Date
(normalmente el domingo de cierre de una semana de guerra, tal como lo
entrega _parseFechaISONuevos() a partir del historial de RoyaleAPI),
devuelve a qué Temporada (propia) y Semana (1-based dentro de esa
temporada) pertenece — mismo criterio de "mes efectivo" que ya usa
_calcularMesEfectivoRealDeHoy()/calcTemporadaDesdeMesEfectivo() para la
fecha de HOY, aplicado acá a una fecha arbitraria del pasado.

@param {Date} fecha
@return {Object|null} { temporadaPropia, semana, periodIndex } o null si
  `fecha` no es una fecha válida o CFG.REF_DEFAULT todavía no está listo.
```


### Ubicación: `_fechaATemporadaSemana`

#### 14B122 — líneas 3889-3893 (comentario)

```text
Mismo ajuste de "mes efectivo" que _calcularMesEfectivoRealDeHoy(),
aplicado a `fecha` en vez de a la fecha real de hoy: si `fecha` cae
ANTES del primer lunes de su propio mes calendario, pertenece
efectivamente al mes anterior (la temporada del proyecto arranca
siempre en un lunes, no el día 1 calendario).
```

#### 14B123 — líneas 3915-3929 (docblock)

```text
_mapaNombreClanATagTerna()
Mapa { NOMBRE_CLAN_NORMALIZADO: clanTag } SOLO para los clanes Terna
(CFG.TERNA_TAGS), leído de la hoja Clan (mismas columnas Orden/ClanTag/
Nombre que usa _getNombresClanesTernaOrdenados()). Se usa para filtrar,
registro por registro, el historial de RoyaleAPI de "Nuevos" a SOLO las
semanas que el candidato pasó en un clan Terna (punto 3: "filtra
registros a clanes Terna") — un mismo candidato puede tener, en el mismo
historial, semanas en un clan Terna y otras en un clan rival.

Normalización: trim + minúsculas, para no fallar por mayúsculas/acentos
de captura distintos entre RoyaleAPI y la hoja Clan.

@return {Object}
```


### Ubicación: `_mapaNombreClanATagTerna`

#### 14B124 — líneas 3956-4021 (docblock)

```text
_migrarNuevosAHistorico(candidatosPayload)
FASE 9 (punto 3 del Consolidado) — ver docblock de sección más arriba.
Por cada candidato del payload de "Nuevos", filtra sus registros a
clanes Terna, arma la clave Temporada(propia)|Semana|Tag (derivada de la
fecha del registro vía _fechaATemporadaSemana()), y para cada clave que
TODAVÍA no existe en Guerra/Backup_Guerra.csv, la migra reutilizando
_aplicarCorreccionAGuerraConReparto() (18_CorreccionGuerra.gs, punto
1.1) — al no haber ninguna fila previa para esa clave, esa función entra
automáticamente en modo "reconstrucción completa" (punto 1.5): crea las
4 filas J/V/S/D, reparte los totales semanales que trae "Nuevos" con el
mismo algoritmo Barcos-primero + piso (punto 1.6) que usa cualquier otra
reconstrucción, y marca `Origen = 'Reconstruido'`.

Depende de: GC.TEMPORADA_2 (Fase 1) para poder anotar
`opciones.temporadaRoyaleApi` en cada fila reconstruida (mismo criterio
que el punto 1.4), y de _aplicarCorreccionAGuerraConReparto()/modo
reconstrucción (Fase 5, 18_CorreccionGuerra.gs).

NO llama a _purgarNuevosEstablecidos() ni la reemplaza — son mecanismos
independientes (ver comentario en el punto 3 del Consolidado): esta
función solo escribe en Guerra/Backup_Guerra.csv, nunca toca la hoja
"Nuevos".

IDEMPOTENCIA: agrupa por temporada y, dentro de cada temporada, indexa
las claves YA existentes una sola vez (_construirOffsetsPorClave()) antes
de procesar — una clave recién migrada en esta misma corrida queda
marcada de inmediato en `offsetsPorClave` (efecto colateral de
_aplicarCorreccionAGuerraConReparto(), ver su docblock), así que un
segundo registro del mismo candidato para la misma semana en el mismo
lote no la migra dos veces; y un escaneo POSTERIOR (otro POST del
userscript) tampoco, porque para entonces esa clave ya está en
Guerra/Backup_Guerra.csv y la vuelve a encontrar en offsetsPorClave.

FIX (30-ago-2026, pedido usuario: "se han regenerado mal porque pone
ceros en semanas que no han estado en los clanes terna"): antes de este
fix, un registro pasaba a migrarse con solo que `reg.clan` (texto tal
cual lo entrega RoyaleAPI/Tampermonkey) coincidiera con el NOMBRE actual
de algún clan Terna — sin ninguna verificación propia de que el Tag
realmente estuvo ahí esa fecha. Eso puede fabricar una semana
"Reconstruido" con Ataques=Fame=Barcos=0 para una semana en la que el Tag
NUNCA fue miembro Terna (ver docblock de
_construirVentanasMembresiaTernaPorTag(), 18_CorreccionGuerra.gs, para
las dos formas conocidas en que el nombre de clan por sí solo puede
engañar a este chequeo). Ahora, además del nombre de clan, cada registro
se cruza contra Historial_I/S (fuente propia de Ingreso/Salida por Tag):
  - Historial CONFIRMA que el Tag estuvo en Terna esa fecha → se migra
    igual que antes.
  - Historial CONFIRMA que el Tag NO estuvo en Terna esa fecha → se
    descarta (nunca se reconstruye), y se cuenta en
    `statsGlobal.descartadosPorMembresia`.
  - El Tag no tiene NINGUNA fila en Historial_I/S (miembro previo a esa
    hoja) → no hay forma de confirmar ni descartar con esta fuente; se
    mantiene el comportamiento anterior (se migra confiando en el nombre
    de clan) para no perder datos legítimos de miembros antiguos, pero
    se cuenta aparte en `statsGlobal.sinHistorialParaVerificar` para que
    quede visible en el log cuánto del lote no pudo verificarse por esta
    vía. Para revisar lo YA escrito antes de este fix, ver
    _auditarReconstruccionesGuerraSospechosas() (18_CorreccionGuerra.gs).

@param {Array} candidatosPayload Mismo payload que recibe
  _aplicarImportacionNuevos() — [{ tag, registros: [{fecha, clan,
  ataques, fame, barcos}, ...] }, ...].
@return {Object} { temporadasProcesadas, clavesMigradas, clavesYaExistian,
  descartadosPorMembresia, sinHistorialParaVerificar }
```


### Ubicación: `_migrarNuevosAHistorico`

#### 14B125 — líneas 4032-4034 (comentario)

```text
FIX (30-ago-2026): verificación cruzada e independiente del nombre de
clan — ver docblock arriba y el de _construirVentanasMembresiaTernaPorTag()
(18_CorreccionGuerra.gs).
```

#### 14B126 — líneas 4049-4052 (comentario)

```text
Punto 3: SOLO clanes Terna. reg.clan es el nombre tal cual lo
muestra RoyaleAPI para esa semana (puede ser un clan rival, o
vacío si esa semana el jugador no jugó guerra) — se descarta
cualquier registro que no resuelva a un clanTag Terna conocido.
```

#### 14B127 — líneas 4093-4096 (comentario)

```text
2) Por cada temporada distinta presente en el lote: cargar la fuente
   UNA sola vez, procesar solo las claves faltantes, guardar UNA sola
   vez (evita releer/reescribir Guerra/Backup_Guerra.csv por cada
   registro individual).
```

#### 14B128 — líneas 4118-4120 (comentario)

```text
YA existe -- regla de no pisado (ver docblock de sección arriba):
"Nuevos" nunca corrige/ajusta una semana que el sistema propio (o
una corrección de RoyaleAPI vía el punto 1) ya tiene registrada.
```


---


