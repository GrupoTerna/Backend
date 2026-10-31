// ==============================================================================
// 14_Nuevos_RoyaleAPI.gs
// Hoja Nuevos: seguimiento de candidatos externos vistos en RoyaleAPI.
// ==============================================================================

// ----- Variables y constantes ----- [→ Contexto_Base_Web.md §14B001]

// NUEVO (15-sep-2026, hallazgo B-35 de Plan_Fases.md): movido a Script [→ Contexto_Base_Web.md §14B002]
var NUEVOS_ROYALEAPI_TOKEN = _scriptToken('NUEVOS_ROYALEAPI_TOKEN');

// Índices de columna (1-based) — hoja "Nuevos". [→ Contexto_Base_Web.md §14B003]
var NC = {
  NUM: 1, TAG: 2, NOMBRE: 3, NOM_MULTI: 4, NIVEL: 5, COPAS: 6,
  V_GUERRA: 7, INACTIVIDAD: 8, CELULAR: 9, ROYALE_API: 10, CLAN: 11
};

var NC_TOTAL_FIJAS = 11;

var NUEVOS_FILA_FECHAS        = 2; // fila donde vive la fecha de cada bloque

var NUEVOS_FILA_HEADERS       = 3; // fila con Clan/Ataques/Fame/Barcos repetido

var NUEVOS_FILA_DATOS_INICIO  = 4; // primera fila de datos

// FIX (13-ago-2026): bloque nuevo "Semana actual" (12 columnas: Ataques/ [→ Contexto_Base_Web.md §14B004]
var COL_INICIO_SEMANA_ACTUAL_NUEVOS = 12; // L

var SEMANA_ACTUAL_ANCHO_NUEVOS      = 12; // Ataques(4)+Puntaje(4)+Barcos(4)

// Offsets 0-based dentro del bloque "Semana actual" (J=0,V=1,S=2,D=3 por métrica).
var OFFSEM = { ATA: 0, PUN: 4, BAR: 8 };

var COL_INICIO_GRID_NUEVOS      = COL_INICIO_SEMANA_ACTUAL_NUEVOS + SEMANA_ACTUAL_ANCHO_NUEVOS; // 24 (X) — antes 12

var GRID_BLOQUE_ANCHO_NUEVOS    = 4;  // Clan, Ataques, Fame, Barcos

var GRID_NUM_BLOQUES_NUEVOS     = 5;  // hasta 5 fechas/semanas

var GRID_WIDTH_NUEVOS           = GRID_BLOQUE_ANCHO_NUEVOS * GRID_NUM_BLOQUES_NUEVOS; // 20

// Offsets 0-based dentro de cada bloque de 4 columnas.
var OFFN = { CLAN: 0, ATAQUES: 1, FAME: 2, BARCOS: 3 };

/**
 * PASTEL_CLANES_NUEVOS_ [→ Contexto_Base_Web.md §14B005]
 */
var PASTEL_CLANES_NUEVOS_ = [
  '#d9ead3', // verde pastel
  '#cfe2f3', // azul pastel
  '#fce5cd', // naranja pastel
  '#d9d2e9', // lila/violeta pastel
  '#fff2cc'  // amarillo pastel
];

// FIX (15-ago-2026, pedido usuario): renombrado de [→ Contexto_Base_Web.md §14B006]
var NOMBRE_CSV_DEBUG_NUEVOS  = 'Correcciones_Nuevos.csv';

// SNAPSHOT DE DEPURACIÓN DE LA IMPORTACIÓN DE NUEVOS [→ Contexto_Base_Web.md §14B007]

var NOMBRE_JSON_DEBUG_NUEVOS = 'ClanSystem_Debug_ImportNuevos.json';

var SEMANAS_MIN_PARA_PURGAR_DEBUG_NUEVOS = 3;

// FIX (02-sep-2026, pedido usuario: "es un error recurrente en tampermonkey... [→ Contexto_Base_Web.md §14B008]
var NUEVOS_RESTORE_PROGRESS_FILE = 'ClanSystem_Progreso_RestaurarNuevos.json';
// Un checkpoint más viejo que esto se descarta como resto de un intento [→ Contexto_Base_Web.md §14B009]
var NUEVOS_RESTORE_PROGRESO_MAX_EDAD_MS = 6 * 60 * 60 * 1000; // 6 horas
// Presupuesto de tiempo PROPIO de la restauración (más chico que [→ Contexto_Base_Web.md §14B010]
var NUEVOS_RESTORE_PRESUPUESTO_MS = 90 * 1000; // 1m30s
// Tope de candidatos por sub-lote enviado a _aplicarImportacionNuevos() [→ Contexto_Base_Web.md §14B011]
var NUEVOS_RESTORE_LOTE_MAX = 10;

/**
 * _guardarProgresoRestaurarNuevos(tagsYaRestaurados) [→ Contexto_Base_Web.md §14B012]
 */
function _guardarProgresoRestaurarNuevos(tagsYaRestaurados) {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var content = JSON.stringify({ _ts: Date.now(), tags: tagsYaRestaurados || [] });
    _guardarArchivoProgresoVerificado_(folder, NUEVOS_RESTORE_PROGRESS_FILE, content); // PF291
  } catch (e) {
    Logger.log('[Nuevos-Restaurar] Error guardando progreso de restauración en Drive: ' + e.message);
  }
}

/**
 * _cargarProgresoRestaurarNuevos() [→ Contexto_Base_Web.md §14B013]
 */
function _cargarProgresoRestaurarNuevos() {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var files = folder.getFilesByName(NUEVOS_RESTORE_PROGRESS_FILE);
    if (!files.hasNext()) return null;
    var file = files.next();
    var parsed = JSON.parse(file.getBlob().getDataAsString('UTF-8'));
    if (!parsed || !parsed._ts) return null;

    var edadMs = Date.now() - Number(parsed._ts);
    if (edadMs > NUEVOS_RESTORE_PROGRESO_MAX_EDAD_MS) {
      Logger.log('[Nuevos-Restaurar] Checkpoint de restauración en Drive tiene ' + Math.round(edadMs / 60000) +
        ' min -- se descarta como resto de un intento abandonado, se reinicia desde cero.');
      file.setTrashed(true);
      return null;
    }
    return Array.isArray(parsed.tags) ? parsed.tags : null;
  } catch (e) {
    Logger.log('[Nuevos-Restaurar] Error cargando progreso de restauración desde Drive: ' + e.message);
    return null;
  }
}

/**
 * _borrarProgresoRestaurarNuevos() [→ Contexto_Base_Web.md §14B014]
 */
function _borrarProgresoRestaurarNuevos() {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var files = folder.getFilesByName(NUEVOS_RESTORE_PROGRESS_FILE);
    while (files.hasNext()) files.next().setTrashed(true);
  } catch (e) {
    Logger.log('[Nuevos-Restaurar] Error borrando progreso de restauración en Drive: ' + e.message);
  }
}

/**
 * _hayRestauracionNuevosPendiente() [→ Contexto_Base_Web.md §14B015]
 */
function _hayRestauracionNuevosPendiente() {
  var tags = _cargarProgresoRestaurarNuevos();
  return Array.isArray(tags) && tags.length > 0;
}

// ----- Funciones manuales / punto de entrada -----

/**
 * _restaurarNuevosSiNoExiste() [→ Contexto_Base_Web.md §14B016]
 */
// SECCIÓN 1: FUNCIONES MANUALES (entry points de mantenimiento, ejecutar a mano [→ Contexto_Base_Web.md §14B017]

/**
 * reordenarNuevosAhora() [→ Contexto_Base_Web.md §14B018]
 */
function reordenarNuevosAhora() {
  var sh = _getSs().getSheetByName(CFG.SHEETS.NUEVOS);
  if (!sh) { Logger.log('[Nuevos] Hoja no encontrada.'); return; }
  _reordenarFilasNuevosPorClanYNombre(sh);
}

// REPARACIÓN MANUAL DE FORMATO DE ENCABEZADOS (filas 1-3) — 09/08/2026 [→ Contexto_Base_Web.md §14B019]
/**
 * repararFormatoEncabezadosNuevos() [→ Contexto_Base_Web.md §14B020]
 */
function repararFormatoEncabezadosNuevos() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.NUEVOS);
  if (!sh) {
    Logger.log('[Nuevos-RoyaleAPI] repararFormatoEncabezadosNuevos: no existe la hoja "Nuevos". Se omite.');
    return;
  }

  var lastCol = Math.max(sh.getLastColumn(), COL_INICIO_GRID_NUEVOS + GRID_WIDTH_NUEVOS - 1);
  var COLOR_BORDE_HEADER = '#ffffff';

  // 1) Corner A1:C2 — "MIEMBROS NUEVOS" (antes iba vacío), sin bordes.
  sh.getRange(1, 1, 2, 3).breakApart();
  sh.getRange(1, 1, 2, 3).merge()
    .setValue('MIEMBROS NUEVOS')
    .setBackground(CFG.COLORES.HEADER_BG)
    .setFontColor(CFG.COLORES.HEADER_FG)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBorder(false, false, false, false, false, false);

  // 2) D1:K2 — título dinámico Temporada/Semana/Día. Reportado por el [→ Contexto_Base_Web.md §14B021]
  sh.getRange(1, 4, 2, NC_TOTAL_FIJAS - 3).breakApart();
  sh.getRange(1, 4, 2, NC_TOTAL_FIJAS - 3).merge()
    .setFormula(CFG.NUEVOS_TITULO_FORMULA)
    .setBackground(CFG.COLORES.HEADER_BG)
    .setFontColor(CFG.COLORES.HEADER_FG)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  // 3) Bloque "Semana actual" (L1:W1 título + Ataques/Puntaje/Barcos en
  //    fila 2 + J/V/S/D en fila 3).
  sh.getRange(1, COL_INICIO_SEMANA_ACTUAL_NUEVOS, 1, SEMANA_ACTUAL_ANCHO_NUEVOS).breakApart();
  sh.getRange(1, COL_INICIO_SEMANA_ACTUAL_NUEVOS, 1, SEMANA_ACTUAL_ANCHO_NUEVOS).merge()
    .setValue('Semana actual')
    .setBackground(CFG.COLORES.HEADER_BG)
    .setFontColor(CFG.COLORES.HEADER_FG)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  var metricasSemana = ['Ataques', 'Puntaje', 'Barcos'];
  var diasG = ['J', 'V', 'S', 'D'];
  for (var ms = 0; ms < metricasSemana.length; ms++) {
    var colMetrica = COL_INICIO_SEMANA_ACTUAL_NUEVOS + ms * 4;
    sh.getRange(2, colMetrica, 1, 4).breakApart();
    sh.getRange(2, colMetrica, 1, 4).merge()
      .setValue(metricasSemana[ms])
      .setBackground(CFG.COLORES.HEADER_BG)
      .setFontColor(CFG.COLORES.HEADER_FG)
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');
    sh.getRange(NUEVOS_FILA_HEADERS, colMetrica, 1, 4).setValues([diasG])
      .setBackground(CFG.COLORES.HEADER_BG)
      .setFontColor(CFG.COLORES.HEADER_FG)
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
  }

  // FIX (15-ago-2026, pedido usuario): repone también el ancho fijo de [→ Contexto_Base_Web.md §14B022]
  _aplicarAnchoFijoSemanaActualNuevos(sh);

  // 4) Fila 3 — encabezados fijos (Clan al final del bloque).
  var fixedHeaders = ['N°', 'Tag', 'Nombre', 'Nom_Multi', 'Nivel', 'Copas',
                       'V_Guerra', 'Días inactivo', 'Celular', 'RoyaleAPI', 'Clan'];
  sh.getRange(NUEVOS_FILA_HEADERS, 1, 1, fixedHeaders.length).setValues([fixedHeaders])
    .setBackground(CFG.COLORES.HEADER_BG)
    .setFontColor(CFG.COLORES.HEADER_FG)
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  // 5) Cuadrícula del historial: se recorre TODO el ancho real actual [→ Contexto_Base_Web.md §14B023]
  var numBloques = Math.round((lastCol - COL_INICIO_GRID_NUEVOS + 1) / GRID_BLOQUE_ANCHO_NUEVOS);
  var bloqueHeaders = ['Clan', 'Ataques', 'Fame', 'Barcos'];

  for (var b = 0; b < numBloques; b++) {
    var colBloque = COL_INICIO_GRID_NUEVOS + b * GRID_BLOQUE_ANCHO_NUEVOS;

    // Fila 2 (fecha): se relee el valor actual de la celda ANTES de tocar [→ Contexto_Base_Web.md §14B024]
    var valorFechaActual = sh.getRange(NUEVOS_FILA_FECHAS, colBloque).getValue();
    sh.getRange(NUEVOS_FILA_FECHAS, colBloque, 1, GRID_BLOQUE_ANCHO_NUEVOS).breakApart();
    sh.getRange(NUEVOS_FILA_FECHAS, colBloque, 1, GRID_BLOQUE_ANCHO_NUEVOS).merge()
      .setValue(valorFechaActual)
      .setBackground(CFG.COLORES.HEADER_BG)
      .setFontColor(CFG.COLORES.HEADER_FG)
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');

    // Fila 3 (Clan/Ataques/Fame/Barcos): se reescriben los mismos 4
    // textos de siempre y se reaplica el formato.
    sh.getRange(NUEVOS_FILA_HEADERS, colBloque, 1, GRID_BLOQUE_ANCHO_NUEVOS).setValues([bloqueHeaders])
      .setBackground(CFG.COLORES.HEADER_BG)
      .setFontColor(CFG.COLORES.HEADER_FG)
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
  }

  // 6) Título general de fila 1 sobre TODA la cuadrícula actual (no solo
  //    los primeros 5 bloques) — mismo criterio que _reajustarTituloGridNuevos().
  var totalColsGrid = lastCol - COL_INICIO_GRID_NUEVOS + 1;
  sh.getRange(1, COL_INICIO_GRID_NUEVOS, 1, totalColsGrid).breakApart();
  sh.getRange(1, COL_INICIO_GRID_NUEVOS, 1, totalColsGrid).merge()
    .setValue('Historial RoyaleAPI (últimas ' + numBloques + ' fechas)')
    .setBackground(CFG.COLORES.HEADER_BG)
    .setFontColor(CFG.COLORES.HEADER_FG)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  // 7) Filas/columnas congeladas + filtro nativo, por si la hoja los [→ Contexto_Base_Web.md §14B025]
  sh.setFrozenRows(NUEVOS_FILA_HEADERS);
  sh.setFrozenColumns(3);
  if (!sh.getFilter()) {
    sh.getRange(NUEVOS_FILA_HEADERS, 1, 1, lastCol).createFilter();
  }

  // 8) Borde blanco sobre TODO el bloque de encabezado (filas 1 a 3, [→ Contexto_Base_Web.md §14B026]
  sh.getRange(1, 1, NUEVOS_FILA_HEADERS, lastCol)
    .setBorder(true, true, true, true, true, true,
               COLOR_BORDE_HEADER, SpreadsheetApp.BorderStyle.SOLID);
  sh.getRange(1, 1, 2, 3).setBorder(false, false, false, false, false, false);

  Logger.log('[Nuevos-RoyaleAPI] repararFormatoEncabezadosNuevos: formato reaplicado a las filas 1-3 (corner, título dinámico, Semana actual, fijos, ' + numBloques + ' bloque(s) de historial, columnas ' + COL_INICIO_GRID_NUEVOS + ' a ' + lastCol + ').');
}

// ----- Funciones internas / helpers -----

// SECCIÓN 2: RESTO DE FUNCIONES (helpers internos de la hoja Nuevos) — sin [→ Contexto_Base_Web.md §14B027]

function _restaurarNuevosSiNoExiste() {
  var ss = _getSs();
  if (ss.getSheetByName(CFG.SHEETS.NUEVOS)) return; // ya existe: nunca se toca

  var totalCols = COL_INICIO_GRID_NUEVOS + GRID_WIDTH_NUEVOS - 1;
  var csvText = _loadCSVFromDrive('Backup_Nuevos.csv');
  var sh = ss.insertSheet(CFG.SHEETS.NUEVOS);
  if (sh.getMaxColumns() < totalCols) {
    sh.insertColumnsAfter(sh.getMaxColumns(), totalCols - sh.getMaxColumns());
  }

  if (!csvText) {
    Logger.log('[Nuevos] Hoja recreada desde cero (no existía, y sin Backup_Nuevos.csv previo en Drive — ' +
      'probable primera vez). Los candidatos y su historial los repuebla el userscript de Tampermonkey ' +
      'en su próxima corrida (doPost).');
    _pintarEncabezadosNuevos(sh);
    return;
  }

  try {
    var parsed = _parseCSV(csvText);
    if (!parsed || parsed.length === 0) {
      Logger.log('[Nuevos] Backup_Nuevos.csv vacío o corrupto. Hoja recreada vacía.');
      _pintarEncabezadosNuevos(sh);
      return;
    }

    // No se asume totalCols a secas: si el CSV trae más columnas (no [→ Contexto_Base_Web.md §14B028]
    var numCols = Math.max(totalCols, parsed.reduce(function (max, r) { return Math.max(max, r.length); }, 0));
    if (sh.getMaxColumns() < numCols) {
      sh.insertColumnsAfter(sh.getMaxColumns(), numCols - sh.getMaxColumns());
    }
    var rectData = parsed.map(function (r) {
      var newR = r.slice(0, numCols);
      while (newR.length < numCols) newR.push('');
      return newR;
    });

    sh.getRange(1, 1, rectData.length, numCols).setValues(rectData);

    var filasCandidatos = Math.max(0, rectData.length - (NUEVOS_FILA_DATOS_INICIO - 1));
    Logger.log('[Nuevos] Hoja restaurada desde Backup_Nuevos.csv: ' + filasCandidatos +
      ' fila(s) de candidatos recuperada(s) (probable Demoler previo).');
  } catch (e) {
    Logger.log('[Nuevos] Error restaurando desde Backup_Nuevos.csv: ' + e.message + '. Hoja queda creada, posiblemente vacía.');
  }

  _pintarEncabezadosNuevos(sh);

  // FIX (11-ago-2026): _pintarEncabezadosNuevos() (arriba) solo formatea los [→ Contexto_Base_Web.md §14B029]
  _ordenarBloquesFechaNuevos(sh);
  repararFormatoEncabezadosNuevos();

  // FIX (06-ago-2026): si se restauraron candidatos desde el CSV (no el [→ Contexto_Base_Web.md §14B030]
  _aplicarTodoFormatoCondicionalNuevos(sh);

  // FIX (09-ago-2026): mismo motivo que la llamada equivalente al final de [→ Contexto_Base_Web.md §14B031]
  _limpiarLinksAccidentalesEnHoja(sh, NUEVOS_FILA_HEADERS);
}

/**
 * _pintarEncabezadosNuevos(sh) [→ Contexto_Base_Web.md §14B032]
 */
function _pintarEncabezadosNuevos(sh) {
  var totalCols = COL_INICIO_GRID_NUEVOS + GRID_WIDTH_NUEVOS - 1;

  // Fila 1-2, A1:C2: "MIEMBROS NUEVOS" (antes iba vacío).
  sh.getRange(1, 1, 2, 3).merge()
    .setValue('MIEMBROS NUEVOS')
    .setBackground(CFG.COLORES.HEADER_BG)
    .setFontColor(CFG.COLORES.HEADER_FG)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBorder(false, false, false, false, false, false);

  // Fila 1-2, D1:K2: título dinámico Temporada/Semana/Día (misma lógica
  // que Control, ver CFG.NUEVOS_TITULO_FORMULA).
  sh.getRange(1, 4, 2, NC_TOTAL_FIJAS - 3).merge()
    .setFormula(CFG.NUEVOS_TITULO_FORMULA)
    .setBackground(CFG.COLORES.HEADER_BG)
    .setFontColor(CFG.COLORES.HEADER_FG)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  // Fila 1, bloque "Semana actual" (L1:W1, 12 columnas).
  sh.getRange(1, COL_INICIO_SEMANA_ACTUAL_NUEVOS, 1, SEMANA_ACTUAL_ANCHO_NUEVOS).merge()
    .setValue('Semana actual')
    .setBackground(CFG.COLORES.HEADER_BG)
    .setFontColor(CFG.COLORES.HEADER_FG)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  // Fila 2, nombre de cada métrica dentro del bloque (Ataques/Puntaje/Barcos).
  var metricasSemana = ['Ataques', 'Puntaje', 'Barcos'];
  for (var ms = 0; ms < metricasSemana.length; ms++) {
    sh.getRange(2, COL_INICIO_SEMANA_ACTUAL_NUEVOS + ms * 4, 1, 4).merge()
      .setValue(metricasSemana[ms])
      .setBackground(CFG.COLORES.HEADER_BG)
      .setFontColor(CFG.COLORES.HEADER_FG)
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');
  }

  // Fila 1, cuadrícula del historial RoyaleAPI (ahora empieza en X).
  sh.getRange(1, COL_INICIO_GRID_NUEVOS, 1, GRID_WIDTH_NUEVOS).merge()
    .setValue('Historial RoyaleAPI (últimas ' + GRID_NUM_BLOQUES_NUEVOS + ' fechas)')
    .setBackground(CFG.COLORES.HEADER_BG)
    .setFontColor(CFG.COLORES.HEADER_FG)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  // Fila 2, una celda combinada por bloque (4 columnas): vacía, la fecha
  // real la escribe _aplicarImportacionNuevos() al recibir datos.
  for (var b = 0; b < GRID_NUM_BLOQUES_NUEVOS; b++) {
    var colBloque = COL_INICIO_GRID_NUEVOS + b * GRID_BLOQUE_ANCHO_NUEVOS;
    sh.getRange(NUEVOS_FILA_FECHAS, colBloque, 1, GRID_BLOQUE_ANCHO_NUEVOS).merge()
      .setBackground(CFG.COLORES.HEADER_BG)
      .setFontColor(CFG.COLORES.HEADER_FG)
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');
  }

  // Fila 3: encabezados fijos (Clan ahora al final del bloque fijo).
  var fixedHeaders = ['N°', 'Tag', 'Nombre', 'Nom_Multi', 'Nivel', 'Copas',
                       'V_Guerra', 'Días inactivo', 'Celular', 'RoyaleAPI', 'Clan'];
  sh.getRange(NUEVOS_FILA_HEADERS, 1, 1, fixedHeaders.length).setValues([fixedHeaders])
    .setBackground(CFG.COLORES.HEADER_BG)
    .setFontColor(CFG.COLORES.HEADER_FG)
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  // Fila 3, bloque "Semana actual": J/V/S/D repetido por cada métrica.
  var diasG = ['J', 'V', 'S', 'D'];
  for (var ms2 = 0; ms2 < 3; ms2++) {
    sh.getRange(NUEVOS_FILA_HEADERS, COL_INICIO_SEMANA_ACTUAL_NUEVOS + ms2 * 4, 1, 4)
      .setValues([diasG])
      .setBackground(CFG.COLORES.HEADER_BG)
      .setFontColor(CFG.COLORES.HEADER_FG)
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
  }

  // Fila 3, historial: Clan|Ataques|Fame|Barcos por bloque.
  var bloqueHeaders = ['Clan', 'Ataques', 'Fame', 'Barcos'];
  for (var b2 = 0; b2 < GRID_NUM_BLOQUES_NUEVOS; b2++) {
    var colBase = COL_INICIO_GRID_NUEVOS + b2 * GRID_BLOQUE_ANCHO_NUEVOS;
    sh.getRange(NUEVOS_FILA_HEADERS, colBase, 1, GRID_BLOQUE_ANCHO_NUEVOS).setValues([bloqueHeaders])
      .setBackground(CFG.COLORES.HEADER_BG)
      .setFontColor(CFG.COLORES.HEADER_FG)
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
  }

  // FIX (15-ago-2026, pedido usuario): ancho fijo para las columnas de [→ Contexto_Base_Web.md §14B033]
  _aplicarAnchoFijoSemanaActualNuevos(sh);

  sh.setFrozenRows(NUEVOS_FILA_HEADERS);
  sh.setFrozenColumns(3);

  // Filtro nativo desde la fila de encabezados, igual que Control/Control_2/T_Control.
  var filtroActual = sh.getFilter();
  if (!filtroActual) {
    sh.getRange(NUEVOS_FILA_HEADERS, 1, 1, totalCols).createFilter();
  }

  // Borde blanco sobre todo el bloque de encabezado (mismo criterio que [→ Contexto_Base_Web.md §14B034]
  var COLOR_BORDE_HEADER = '#ffffff';
  sh.getRange(1, 1, NUEVOS_FILA_HEADERS, totalCols)
    .setBorder(true, true, true, true, true, true,
               COLOR_BORDE_HEADER, SpreadsheetApp.BorderStyle.SOLID);
  sh.getRange(1, 1, 2, 3).setBorder(false, false, false, false, false, false);
}

/**
 * _aplicarAnchoFijoSemanaActualNuevos(sh) [→ Contexto_Base_Web.md §14B035]
 */
function _aplicarAnchoFijoSemanaActualNuevos(sh) {
  var ANCHO_PX_SAB_DOM = 37;
  var metricasOffsets = [OFFSEM.ATA, OFFSEM.PUN, OFFSEM.BAR]; // Ataques, Puntaje, Barcos
  for (var m = 0; m < metricasOffsets.length; m++) {
    var colSabado  = COL_INICIO_SEMANA_ACTUAL_NUEVOS + metricasOffsets[m] + 2; // día índice 2 = Sábado
    var colDomingo = COL_INICIO_SEMANA_ACTUAL_NUEVOS + metricasOffsets[m] + 3; // día índice 3 = Domingo
    sh.setColumnWidth(colSabado, ANCHO_PX_SAB_DOM);
    sh.setColumnWidth(colDomingo, ANCHO_PX_SAB_DOM);
  }
}

/**
 * _construirReglasClanesNuevos(sh, numFilas) [→ Contexto_Base_Web.md §14B036]
 */
function _construirReglasClanesNuevos(sh, numFilas) {
  var nombresClanes = _getNombresClanesTernaOrdenados();
  if (!nombresClanes.length) return [];
  var totalCols = Math.max(sh.getLastColumn(), COL_INICIO_GRID_NUEVOS + GRID_WIDTH_NUEVOS - 1);
  var dataRange = sh.getRange(NUEVOS_FILA_DATOS_INICIO, 1, numFilas, totalCols);
  var colClan   = colLetter(NC.CLAN);
  var rules = [];
  for (var i = 0; i < nombresClanes.length; i++) {
    var nombreClan = String(nombresClanes[i] || '').trim();
    if (!nombreClan) continue;
    var color = PASTEL_CLANES_NUEVOS_[i % PASTEL_CLANES_NUEVOS_.length];
    var nombreEscapado = nombreClan.replace(/"/g, '""'); // por si algún nombre trajera comillas
    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied('=$' + colClan + NUEVOS_FILA_DATOS_INICIO + '="' + nombreEscapado + '"')
        .setBackground(color)
        .setRanges([dataRange])
        .build()
    );
  }
  return rules;
}

/**
 * _actualizarFormatoGridNuevos(sh) [→ Contexto_Base_Web.md §14B037]
 */
function _actualizarFormatoGridNuevos(sh) {
  var lastRow = sh.getLastRow();
  if (lastRow < NUEVOS_FILA_DATOS_INICIO) return;
  var numFilas = lastRow - NUEVOS_FILA_DATOS_INICIO + 1;

  var bloques = _leerBloquesFechaNuevos(sh);
  if (bloques.length === 0) return;

  var a1Ataques = [], a1Fame = [], a1Barcos = [];
  for (var i = 0; i < bloques.length; i++) {
    var col = bloques[i].col;
    a1Ataques.push(sh.getRange(NUEVOS_FILA_DATOS_INICIO, col + OFFN.ATAQUES, numFilas, 1).getA1Notation());
    a1Fame.push(sh.getRange(NUEVOS_FILA_DATOS_INICIO, col + OFFN.FAME, numFilas, 1).getA1Notation());
    a1Barcos.push(sh.getRange(NUEVOS_FILA_DATOS_INICIO, col + OFFN.BARCOS, numFilas, 1).getA1Notation());
  }

  sh.getRangeList(a1Ataques).setNumberFormat('#,##0');
  sh.getRangeList(a1Fame).setNumberFormat('#,##0');
  sh.getRangeList(a1Barcos).setNumberFormat('#,##0');
}

/**
 * _actualizarSemanaActualNuevos(sh) [→ Contexto_Base_Web.md §14B038]
 */
function _actualizarSemanaActualNuevos(sh) {
  var lastRow = sh.getLastRow();
  if (lastRow < NUEVOS_FILA_DATOS_INICIO) return;

  var ctx = _getCtx();
  var vigente = _getDiaActualYSeccionVigente(ctx);
  if (!vigente) return;

  var numFilas = lastRow - NUEVOS_FILA_DATOS_INICIO + 1;
  var tags = sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.TAG, numFilas, 1).getValues();
  var guerraData = _getDatosGuerraParaControl(ctx, ctx.temporada);

  var salida = [];
  for (var i = 0; i < numFilas; i++) {
    var tag = String(tags[i][0] || '').trim();
    var fila = new Array(SEMANA_ACTUAL_ANCHO_NUEVOS).fill('');
    var gd = tag ? guerraData[tag] : null;
    var semData = gd ? gd[vigente.sectionIndex] : null;

    for (var d = 0; d <= vigente.diaActual; d++) {
      var dData = semData ? semData['dia_' + d] : null;
      if (dData) {
        fila[OFFSEM.ATA + d] = dData.ataques;
        fila[OFFSEM.PUN + d] = dData.puntaje;
        fila[OFFSEM.BAR + d] = dData.barcos;
      }
    }
    salida.push(fila);
  }

  sh.getRange(NUEVOS_FILA_DATOS_INICIO, COL_INICIO_SEMANA_ACTUAL_NUEVOS, numFilas, SEMANA_ACTUAL_ANCHO_NUEVOS)
    .setValues(salida);

  for (var d2 = 0; d2 < 4; d2++) {
    sh.getRange(NUEVOS_FILA_DATOS_INICIO, COL_INICIO_SEMANA_ACTUAL_NUEVOS + OFFSEM.ATA + d2, numFilas, 1).setNumberFormat('#,##0');
    sh.getRange(NUEVOS_FILA_DATOS_INICIO, COL_INICIO_SEMANA_ACTUAL_NUEVOS + OFFSEM.PUN + d2, numFilas, 1).setNumberFormat('#,##0');
    sh.getRange(NUEVOS_FILA_DATOS_INICIO, COL_INICIO_SEMANA_ACTUAL_NUEVOS + OFFSEM.BAR + d2, numFilas, 1).setNumberFormat('#,##0');
  }
}

/**
 * _cerrarSemanaActualNuevos() [→ Contexto_Base_Web.md §14B039]
 */
function _cerrarSemanaActualNuevos() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.NUEVOS);
  if (!sh) return;

  var ctx = _getCtx();
  if (ctx.periodIndexSospechoso) return;
  if (esDiaGuerraIdx(ctx.periodIndex)) return; // nada que cerrar en día de guerra, solo en entrenamiento

  var vigente = _getDiaActualYSeccionVigente(ctx);
  if (!vigente) return; // entrenamiento de la sección 0: sin semana previa que cerrar (ver docblock)

  var temporadaPropia = ctx.temporada;
  var semana = vigente.sectionIndex + 1; // GC.SEMANA es 1-based, igual que _procesarFilasGuerraParaControl()

  var props = PropertiesService.getScriptProperties();
  var propKey = 'NUEVOS_CIERRE_SEMANA_T' + temporadaPropia;
  var marcaActual = String(semana);
  if (props.getProperty(propKey) === marcaActual) return; // esta semana ya se cerró en una corrida anterior

  var lastRow = sh.getLastRow();
  if (lastRow < NUEVOS_FILA_DATOS_INICIO) {
    props.setProperty(propKey, marcaActual);
    return;
  }
  var numFilas = lastRow - NUEVOS_FILA_DATOS_INICIO + 1;
  var tags = sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.TAG, numFilas, 1).getValues();

  // Misma fuente que _actualizarSemanaActualNuevos() (ver docblock arriba:
  // no depender del orden entre pasos de PASOS_RUNALL/PASOS_RUNUPDATE).
  var guerraData = _getDatosGuerraParaControl(ctx, ctx.temporada);

  var fuente = _cargarFuenteGuerraParaTemporada(temporadaPropia, ctx.temporada);
  if (!fuente) {
    Logger.log('[Nuevos-RoyaleAPI] _cerrarSemanaActualNuevos(): no se pudo cargar la fuente de Guerra (hoja Guerra no encontrada) para temporada ' +
      temporadaPropia + '. Se reintenta en la próxima corrida (no se marca como cerrada).');
    return;
  }
  var offsetsPorClave = _construirOffsetsPorClave(fuente.filas, temporadaPropia);

  var stats = {};
  var candidatosConDatos = 0, migrados = 0, yaExistian = 0;
  var huboCambio = false;
  var tagsVistos = {}; // por si Nuevos tuviera alguna fila de Tag repetido, no procesarlo dos veces

  for (var i = 0; i < numFilas; i++) {
    var tag = String(tags[i][0] || '').trim().toUpperCase();
    if (!tag || tagsVistos[tag]) continue;
    tagsVistos[tag] = true;

    var gd = guerraData[tag];
    var semData = gd ? gd[vigente.sectionIndex] : null;
    if (!semData) continue; // sin datos de guerra esa semana (nunca estuvo en Terna, o no jugó) -- nada que migrar

    var ataquesSemana = 0, fame = 0, barcosSemana = 0, huboDia = false;
    for (var d = 0; d < 4; d++) {
      var dData = semData['dia_' + d];
      if (!dData) continue;
      huboDia = true;
      ataquesSemana += Number(dData.ataques) || 0;
      fame          += Number(dData.puntaje) || 0;
      barcosSemana  += Number(dData.barcos)  || 0;
    }
    if (!huboDia) continue;
    candidatosConDatos++;

    var clave = tag + '|' + semana;
    if (offsetsPorClave[clave]) {
      // REGLA DE NO PISADO (ver docblock arriba): ya migrada/corregida por
      // otro mecanismo (punto 1 o punto 3) -- este cierre solo llena huecos.
      yaExistian++;
      continue;
    }

    _aplicarCorreccionAGuerraConReparto(
      fuente, offsetsPorClave, temporadaPropia, semana, tag,
      { ataquesSemana: ataquesSemana, fame: fame, barcos: barcosSemana },
      {}, stats
    );
    huboCambio = true;
    migrados++;
  }

  if (huboCambio) _guardarFuenteGuerra(fuente);

  props.setProperty(propKey, marcaActual);

  Logger.log('[Nuevos-RoyaleAPI] _cerrarSemanaActualNuevos(): temporada ' + temporadaPropia +
    ', semana ' + semana + ' cerrada -- candidatos con datos: ' + candidatosConDatos +
    ', migrados: ' + migrados + ', ya existían (no pisados): ' + yaExistian + '.');
}

function _aplicarImportacionNuevos(candidatosPayload) {
  if (!candidatosPayload || !candidatosPayload.length) {
    return { ok: false, error: 'Sin candidatos en el payload.', procesados: 0 };
  }

  // FIX (06-ago-2026, puntos 4 y 5 del pedido): respaldo crudo de cada [→ Contexto_Base_Web.md §14B040]
  _guardarSnapshotDebugImportacionNuevos(candidatosPayload);

  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.NUEVOS);
  if (!sh) return { ok: false, error: 'Hoja "Nuevos" no encontrada.', procesados: 0 };

  // 1) FIX (09-ago-2026): en vez de recolectar TODAS las fechas del payload [→ Contexto_Base_Web.md §14B041]
  var fechasNecesarias = _seleccionarFechasNuevasNecesariasNuevos(sh, candidatosPayload);
  _asegurarBloquesParaFechas(sh, fechasNecesarias);
  var fechasHeader = _leerBloquesFechaNuevos(sh);

  // El ancho real de la cuadrícula puede ser mayor a GRID_WIDTH_NUEVOS (20 = [→ Contexto_Base_Web.md §14B042]
  var anchoGridActual = sh.getLastColumn() - COL_INICIO_GRID_NUEVOS + 1;

  // 2) Mapa Tag -> fila existente (desde NUEVOS_FILA_DATOS_INICIO).
  var lastRow = sh.getLastRow();
  var tagAFila = {};
  if (lastRow >= NUEVOS_FILA_DATOS_INICIO) {
    var tagsExistentes = sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.TAG,
      lastRow - NUEVOS_FILA_DATOS_INICIO + 1, 1).getValues();
    for (var i = 0; i < tagsExistentes.length; i++) {
      var t = String(tagsExistentes[i][0] || '').trim().toUpperCase();
      if (t) tagAFila[t] = NUEVOS_FILA_DATOS_INICIO + i;
    }
  }

  // 3) Datos frescos del Directorio, para refrescar las columnas fijas
  //    (Nombre, Nom_Multi, Clan, Nivel, Copas, V_Guerra, Inactividad).
  var dirData = _leerDirectorioFisicoComoDC(ss);
  var dirPorTag = {};
  for (var j = 0; j < dirData.length; j++) {
    var tg = String(dirData[j][DC.TAG - 1] || '').trim().toUpperCase();
    if (tg) dirPorTag[tg] = dirData[j];
  }

  // FIX (13-ago-2026, pedido del usuario): "los nuevos se agregan al final [→ Contexto_Base_Web.md §14B043]
  var tagsNuevos = _insertarNuevosCandidatosOrdenadosPorClan(sh, candidatosPayload, tagAFila, dirPorTag);

  var procesados = 0, filasNuevas = tagsNuevos.length, celdasEscritas = 0, registrosOmitidos = 0;
  // FIX (06-ago-2026): errores individuales por candidato — ver comentario [→ Contexto_Base_Web.md §14B044]
  var errores = [];

  for (var c = 0; c < candidatosPayload.length; c++) {
    var cand = candidatosPayload[c] || {};
    var tag = String(cand.tag || '').trim().toUpperCase();
    if (!tag) continue;
    var registros = cand.registros || [];

    // FIX (06-ago-2026): cada candidato se procesa en su propio try/catch. [→ Contexto_Base_Web.md §14B045]
    try {
      var fila = tagAFila[tag];
      if (!fila) {
        // Red de seguridad: no debería pasar, _insertarNuevosCandidatosOrdenadosPorClan() [→ Contexto_Base_Web.md §14B046]
        fila = Math.max(sh.getLastRow() + 1, NUEVOS_FILA_DATOS_INICIO);
        tagAFila[tag] = fila;
      }

      // --- Columnas fijas: refrescar desde Directorio si el tag sigue [→ Contexto_Base_Web.md §14B047]
      var dRow = dirPorTag[tag];
      var fijasActuales = (fila <= sh.getLastRow())
        ? sh.getRange(fila, 1, 1, NC_TOTAL_FIJAS).getValues()[0]
        : new Array(NC_TOTAL_FIJAS).fill('');

      var fijas = fijasActuales.slice();
      fijas[NC.TAG - 1] = tag;
      if (dRow) {
        fijas[NC.NOMBRE - 1]      = dRow[DC.NOMBRE - 1];
        fijas[NC.NOM_MULTI - 1]   = dRow[DC.NOM_MULTI - 1];
        fijas[NC.CLAN - 1]        = dRow[DC.CLAN - 1];
        fijas[NC.NIVEL - 1]       = dRow[DC.NIVEL - 1];
        fijas[NC.COPAS - 1]       = dRow[DC.COPAS - 1];
        fijas[NC.V_GUERRA - 1]    = dRow[DC.V_GUERRA - 1];
        fijas[NC.INACTIVIDAD - 1] = dRow[DC.INACTIVIDAD - 1];
        fijas[NC.CELULAR - 1]     = dRow[DC.CELULAR - 1];
      }
      // NC.ROYALE_API se deja tal cual venía en fijasActuales aquí (no se [→ Contexto_Base_Web.md §14B048]
      sh.getRange(fila, 1, 1, NC_TOTAL_FIJAS).setValues([fijas]);

      // --- RoyaleAPI: enlace clicable generado directo desde el Tag, [→ Contexto_Base_Web.md §14B049]
      sh.getRange(fila, NC.ROYALE_API).setRichTextValue(
        makeLink('Link', 'https://royaleapi.com/player/' + cleanTag(tag) + '/')
      );

      // --- Cuadrícula: limpiar el bloque completo de esta fila ANTES de [→ Contexto_Base_Web.md §14B050]
      sh.getRange(fila, COL_INICIO_GRID_NUEVOS, 1, anchoGridActual).clearContent();

      for (var r = 0; r < registros.length; r++) {
        var reg = registros[r] || {};
        var fechaReg = _parseFechaISONuevos(reg.fecha);
        if (!fechaReg) { registrosOmitidos++; continue; }

        // Con _asegurarBloquesParaFechas() ya corrido arriba, esto en la [→ Contexto_Base_Web.md §14B051]
        var bloque = _buscarBloquePorFechaNuevos(fechasHeader, fechaReg);
        if (!bloque) { registrosOmitidos++; continue; }

        var colBase = bloque.col;
        var clanVal    = (reg.clan !== undefined && reg.clan !== null) ? String(reg.clan) : '';
        var ataquesVal = (reg.ataques === '' || reg.ataques === null || reg.ataques === undefined) ? '' : Number(reg.ataques);
        var fameVal    = (reg.fame    === '' || reg.fame    === null || reg.fame    === undefined) ? '' : Number(reg.fame);
        var barcosVal  = (reg.barcos  === '' || reg.barcos  === null || reg.barcos  === undefined) ? '' : Number(reg.barcos);

        sh.getRange(fila, colBase + OFFN.CLAN,    1, 1).setValue(clanVal);
        sh.getRange(fila, colBase + OFFN.ATAQUES, 1, 1).setValue(ataquesVal);
        sh.getRange(fila, colBase + OFFN.FAME,    1, 1).setValue(fameVal);
        sh.getRange(fila, colBase + OFFN.BARCOS,  1, 1).setValue(barcosVal);
        celdasEscritas += 4;
      }

      procesados++;
    } catch (errCand) {
      errores.push({ tag: tag, error: errCand.message || String(errCand) });
      Logger.log('[Nuevos-RoyaleAPI] Error procesando ' + tag + ': ' + (errCand.message || errCand));
    }
  }

  // FASE 9 (Consolidado_Cambios_Pendientes_Guerra.md, punto 3): migra a [→ Contexto_Base_Web.md §14B052]
  try {
    var statsMigracion = _migrarNuevosAHistorico(candidatosPayload);
    if (statsMigracion.clavesMigradas > 0 || statsMigracion.descartadosPorMembresia > 0) {
      Logger.log('[Nuevos-RoyaleAPI] Migración a histórico: ' + statsMigracion.clavesMigradas +
        ' semana(s) nueva(s) agregada(s) a Guerra/Backup_Guerra.csv en ' +
        statsMigracion.temporadasProcesadas + ' temporada(s) (' +
        statsMigracion.clavesYaExistian + ' ya existían, sin tocar; ' +
        // FIX (30-ago-2026): visibilidad de la verificación cruzada contra
        // Historial_I/S — ver docblock de _migrarNuevosAHistorico().
        statsMigracion.descartadosPorMembresia + ' descartado(s) por Historial_I/S (nombre de clan ' +
        'coincidía con Terna pero el Tag no estuvo ahí esa fecha); ' +
        statsMigracion.sinHistorialParaVerificar + ' migrado(s) sin poder verificar por falta de Historial_I/S).');
    }
  } catch (errMigracion) {
    Logger.log('[Nuevos-RoyaleAPI] AVISO: _migrarNuevosAHistorico() falló (' +
      (errMigracion.message || errMigracion) + '). La importación de "Nuevos" continúa igual.');
  }

  // FIX (14-ago-2026, pedido usuario): autolimpieza de candidatos ya [→ Contexto_Base_Web.md §14B053]
  _purgarNuevosEstablecidos(sh);

  var lastRowFinal = sh.getLastRow();
  if (lastRowFinal >= NUEVOS_FILA_DATOS_INICIO) {
    // Renumerar N° de forma continua.
    var numFilas = lastRowFinal - NUEVOS_FILA_DATOS_INICIO + 1;
    var numCol = [];
    for (var n = 0; n < numFilas; n++) numCol.push([n + 1]);
    sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.NUM, numFilas, 1).setValues(numCol);
    applyBorderCenter(sh.getRange(NUEVOS_FILA_DATOS_INICIO, 1, numFilas,
      sh.getLastColumn()));

    // FIX (06-ago-2026): mismo formato numérico que ya usa el resto del [→ Contexto_Base_Web.md §14B054]
    var COLS_NUMERICAS_NUEVOS_ = [NC.NIVEL, NC.COPAS, NC.V_GUERRA, NC.INACTIVIDAD];
    for (var cn = 0; cn < COLS_NUMERICAS_NUEVOS_.length; cn++) {
      sh.getRange(NUEVOS_FILA_DATOS_INICIO, COLS_NUMERICAS_NUEVOS_[cn], numFilas, 1)
        .setNumberFormat('#,##0');
    }
    sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.CELULAR, numFilas, 1)
      .setNumberFormat('### ### ### ###');

    // FIX (09-ago-2026): mismo caso que Control (ver _limpiarLinksAccidentalesEnHoja(sh,3) [→ Contexto_Base_Web.md §14B055]
    _limpiarLinksAccidentalesEnHoja(sh, NUEVOS_FILA_HEADERS);

    // FIX (pedido usuario): antes, el formato numérico de la cuadrícula [→ Contexto_Base_Web.md §14B056]
    _actualizarSemanaActualNuevos(sh);
    _reordenarFilasNuevosPorClanYNombre(sh);
    _aplicarTodoFormatoCondicionalNuevos(sh);
    _ordenarBloquesFechaNuevos(sh);
    _actualizarFormatoGridNuevos(sh);
  }

  Logger.log('[Nuevos-RoyaleAPI] Procesados: ' + procesados + ', filas nuevas: ' + filasNuevas +
    ', celdas escritas: ' + celdasEscritas + ', registros omitidos (fecha inválida): ' + registrosOmitidos +
    ', errores individuales: ' + errores.length + '.');

  return { ok: true, procesados: procesados, filasNuevas: filasNuevas, registrosOmitidos: registrosOmitidos, errores: errores };
}

/**
 * _clanDeFilaEsTerna_(clanTag, nombreClan, nombresTerna) (§PF253)
 * ¿La fila del perfil es de un clan Terna? Con tag de clan, SOLO cuenta el tag (CFG.TERNA_TAGS). Sin tag (la celda de RoyaleAPI no traía
 * enlace) se usa el nombre como antes (§PF248), con la misma comparación flexible de Tampermonkey (solo letras y números, minúsculas,
 * «contiene» en cualquiera de los dos sentidos).
 */
function _clanDeFilaEsTerna_(clanTag, nombreClan, nombresTerna) {
  var tag = String(clanTag || '').trim().toUpperCase();
  if (tag) {
    if (tag.charAt(0) !== '#') tag = '#' + tag;
    return CFG.TERNA_TAGS.indexOf(tag) >= 0;
  }
  var norm = function (s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); };
  var n = norm(nombreClan);
  for (var i = 0; i < (nombresTerna || []).length; i++) {
    var nt = norm(nombresTerna[i]);
    if (n.indexOf(nt) >= 0 || nt.indexOf(n) >= 0) return true;
  }
  return false;
}

/**
 * _esNuevoPorTagClan_(ultimasSemanas, nombresTerna) (§PF253, 25-oct-2026)
 * «Cuenta como nuevo» = alguna de las TRES últimas filas del historial del perfil (la más reciente primero, como las manda Tampermonkey
 * v3.13 en cand.ultimasSemanas: [{clanTag, clan}]) es de un clan que NO es Terna (criterio de siempre; §PF249 punto 1: ahora lo calcula el
 * backend y por tag). Sin filas devuelve false, como antes.
 */
function _esNuevoPorTagClan_(ultimasSemanas, nombresTerna) {
  var n = Math.min(3, (ultimasSemanas || []).length);
  for (var i = 0; i < n; i++) {
    var fila = ultimasSemanas[i];
    if (!fila) continue;
    if (!_clanDeFilaEsTerna_(fila.clanTag, fila.clan, nombresTerna)) return true;
  }
  return false;
}

/**
 * _importarNuevosYPerfiles_(candidatosPayload) [→ Contexto_Base_Web.md §PF243]
 * §PF253: desde Tampermonkey v3.13 cada candidato trae cand.ultimasSemanas (las 3 últimas filas del perfil, con clanTag) y el backend decide por tag si
 * cuenta como nuevo (_esNuevoPorTagClan_()); sin ese campo se usa cand.esNuevo como antes.
 *
 * Punto de entrada de accion=importarNuevos desde PF243 (Tampermonkey v3.8). El botón de miembros nuevos manda TODO lo que
 * leyó de cada perfil visitado y el backend decide qué guarda y dónde:
 *   - Hoja «Nuevos» (_aplicarImportacionNuevos): solo los candidatos con esNuevo distinto de false, o que ya tienen fila en
 *     la hoja (así su cuadrícula no se congela). Un candidato que ya no cuenta como nuevo y no está en la hoja NO se agrega.
 *   - Correcciones_Guerra.csv (_aplicarCorreccionesGuerra): las filas de cand.filasPerfil de TODOS los candidatos, como filas de
 *     perfil (fuente 'perfil', sin ClanTag), con la misma regla de conservación de PF236 (una fila igual a la guardada no se
 *     reescribe). La semana en curso se descarta aquí (es provisional; la cubre River Race, PF237).
 * Compatibilidad: una versión anterior de Tampermonkey (sin esNuevo ni filasPerfil) se comporta como antes: todo va a «Nuevos»
 * y nada a Correcciones_Guerra.csv. Un fallo al guardar las correcciones no hace fallar la importación de «Nuevos»: se informa
 * en resultado.correcciones.error.
 */
function _importarNuevosYPerfiles_(candidatosPayload) {
  if (!candidatosPayload || !candidatosPayload.length) {
    return { ok: false, error: 'Sin candidatos en el payload.', procesados: 0 };
  }

  var tagsEnHoja = {};
  try {
    tagsEnHoja = _obtenerTagsEnHojaNuevos(_getSs());
  } catch (eTags) {
    Logger.log('[Nuevos-RoyaleAPI] AVISO: no se pudo leer la lista de tags de «Nuevos» (' + (eTags.message || eTags) +
      '); se envían a «Nuevos» todos los candidatos recibidos.');
    tagsEnHoja = null;
  }

  // Semana en curso de RoyaleAPI (misma cuenta que _obtenerListaCorreccionGuerra()): las filas del perfil de esa semana no se guardan.
  var temporadaEnCurso = null, semanaEnCurso = null;
  try {
    var ctxNv = _getCtx();
    if (!ctxNv.periodIndexSospechoso) {
      temporadaEnCurso = ctxNv.temporada + _getTemporadaOffsetRoyaleApi();
      semanaEnCurso = ctxNv.sectionIndex + 1;
    }
  } catch (eCtxNv) {
    Logger.log('[Nuevos-RoyaleAPI] AVISO: no se pudo calcular la semana en curso (' + (eCtxNv.message || eCtxNv) +
      '); no se descarta ninguna fila de perfil por ese motivo.');
  }

  var nombresTernaNv = [];
  try {
    nombresTernaNv = _getNombresClanesTernaOrdenados(); // solo para las filas del perfil sin enlace de clan (respaldo por nombre, §PF248)
  } catch (eNomNv) {
    Logger.log('[Nuevos-RoyaleAPI] AVISO: no se pudieron leer los nombres de los clanes Terna (' + (eNomNv.message || eNomNv) + ').');
  }

  var paraNuevos = [];
  var correcciones = [];
  var candidatosConPerfil = 0, filasEnCurso = 0;
  for (var i = 0; i < candidatosPayload.length; i++) {
    var cand = candidatosPayload[i] || {};
    var tag = String(cand.tag || '').trim().toUpperCase();
    if (!tag) continue;

    // §PF253: «cuenta como nuevo» lo decide el backend por TAG de clan con las últimas tres filas del perfil (cand.ultimasSemanas, Tampermonkey v3.13). Sin ese campo (Tampermonkey anterior) se usa el esNuevo que mandó.
    var esNuevoCand = Array.isArray(cand.ultimasSemanas) ? _esNuevoPorTagClan_(cand.ultimasSemanas, nombresTernaNv) : (cand.esNuevo !== false);
    var cuentaComoNuevo = (tagsEnHoja === null) || esNuevoCand || (tagsEnHoja[tag] === true);
    if (cuentaComoNuevo) paraNuevos.push(cand);

    var filas = (cand.filasPerfil && cand.filasPerfil.length) ? cand.filasPerfil : [];
    if (filas.length) candidatosConPerfil++;
    for (var f = 0; f < filas.length; f++) {
      var fp = filas[f] || {};
      if (temporadaEnCurso !== null && Number(fp.temporadaRoyaleApi) === Number(temporadaEnCurso) && Number(fp.semana) === Number(semanaEnCurso)) {
        filasEnCurso++;
        continue;
      }
      correcciones.push({
        tag: tag,
        temporadaRoyaleApi: fp.temporadaRoyaleApi,
        semana: fp.semana,
        ataquesSemana: fp.ataquesSemana,
        fame: fp.fame,
        barcos: fp.barcos,
        fuente: 'perfil',
        clanPerfil: fp.clanPerfil || undefined
      });
    }
  }

  var resultado = paraNuevos.length
    ? _aplicarImportacionNuevos(paraNuevos)
    : { ok: true, procesados: 0, filasNuevas: 0, registrosOmitidos: 0, errores: [] };
  resultado.recibidos = candidatosPayload.length;
  resultado.noContaronComoNuevos = candidatosPayload.length - paraNuevos.length;

  if (correcciones.length) {
    try {
      var rc = _aplicarCorreccionesGuerra(correcciones);
      resultado.correcciones = {
        ok: !!(rc && rc.ok), candidatos: candidatosConPerfil, recibidas: correcciones.length, enCursoDescartadas: filasEnCurso,
        aplicadas: (rc && rc.aplicadas) || 0, sinCambios: (rc && rc.sinCambios) || 0, omitidas: (rc && rc.omitidas) || 0,
        anterioresT1: (rc && rc.anterioresT1) || 0 // §PF247
      };
      if (rc && rc.error) resultado.correcciones.error = rc.error;
      if (rc && rc.cambiosPerfil) resultado.correcciones.cambiosPerfil = rc.cambiosPerfil;
      if (rc && rc.avisoControl2) resultado.correcciones.avisoControl2 = rc.avisoControl2;
    } catch (eCorr) {
      Logger.log('[Nuevos-RoyaleAPI] Error guardando las filas de perfil en Correcciones_Guerra.csv: ' + (eCorr.message || eCorr));
      resultado.correcciones = { ok: false, candidatos: candidatosConPerfil, recibidas: correcciones.length, error: (eCorr.message || String(eCorr)) };
    }
  } else if (filasEnCurso > 0) {
    resultado.correcciones = { ok: true, candidatos: candidatosConPerfil, recibidas: 0, enCursoDescartadas: filasEnCurso, aplicadas: 0, sinCambios: 0, omitidas: 0 };
  }

  Logger.log('[Nuevos-RoyaleAPI] Reparto PF243: ' + candidatosPayload.length + ' candidato(s) recibido(s), ' + paraNuevos.length +
    ' a «Nuevos»; ' + correcciones.length + ' fila(s) de perfil a Correcciones_Guerra.csv' +
    (resultado.correcciones ? ' (aplicadas ' + resultado.correcciones.aplicadas + ', sin cambios ' + resultado.correcciones.sinCambios + ')' : '') + '.');
  return resultado;
}

/**
 * _aplicarTodoFormatoCondicionalNuevos(sh) [→ Contexto_Base_Web.md §14B057]
 */
function _aplicarTodoFormatoCondicionalNuevos(sh) {
  var lastRow = sh.getLastRow();
  if (lastRow < NUEVOS_FILA_DATOS_INICIO) return;
  var numFilas = lastRow - NUEVOS_FILA_DATOS_INICIO + 1;
  var rules = [];
  rules = rules.concat(_construirReglasSemanaActualNuevos(sh, numFilas));
  rules = rules.concat(_construirReglasClanesNuevos(sh, numFilas));
  _tryCondFmt(sh, rules);
}

function _asegurarBloquesParaFechas(sh, fechasNecesarias) {
  var bloques = _leerBloquesFechaNuevos(sh);
  var bloquesCreados = 0, bloquesReutilizados = 0;

  function mismoDia(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  }

  // 1) Fechas realmente faltantes (sin bloque ya asignado), deduplicadas [→ Contexto_Base_Web.md §14B058]
  var faltantes = [];
  for (var i = 0; i < fechasNecesarias.length; i++) {
    var fecha = fechasNecesarias[i];
    if (!fecha) continue;
    var yaExiste = bloques.some(function (bk) { return bk.date && mismoDia(bk.date, fecha); });
    if (yaExiste) continue;
    var yaEnFaltantes = faltantes.some(function (f) { return mismoDia(f, fecha); });
    if (!yaEnFaltantes) faltantes.push(fecha);
  }
  if (faltantes.length === 0) return;

  // 2) CASO DE ARRANQUE: si la cuadrícula todavía no tiene NINGÚN bloque [→ Contexto_Base_Web.md §14B059]
  var hayFechaExistente = bloques.some(function (bk) { return !!bk.date; });
  if (!hayFechaExistente) {
    faltantes.sort(function (a, b) { return b.getTime() - a.getTime(); }); // más reciente primero
    var quedan = [];
    for (var q = 0; q < faltantes.length; q++) {
      var vacioBoot = null;
      for (var vb = 0; vb < bloques.length; vb++) {
        if (!bloques[vb].date) { vacioBoot = bloques[vb]; break; }
      }
      if (vacioBoot) {
        sh.getRange(NUEVOS_FILA_FECHAS, vacioBoot.col).setValue(faltantes[q]);
        vacioBoot.date = faltantes[q];
        bloquesReutilizados++;
      } else {
        quedan.push(faltantes[q]);
      }
    }
    faltantes = quedan; // lo que no alcanzó bloque vacío sigue el flujo normal de abajo
  }
  if (faltantes.length === 0) {
    Logger.log('[Nuevos-RoyaleAPI] Bloques de fecha: ' + bloquesReutilizados + ' reutilizado(s) en el arranque.');
    return;
  }

  // 3) FIX (06-ago-2026): las fechas MÁS RECIENTES que cualquier bloque ya [→ Contexto_Base_Web.md §14B060]
  var maxFechaExistente = null;
  for (var m = 0; m < bloques.length; m++) {
    if (bloques[m].date && (!maxFechaExistente || bloques[m].date.getTime() > maxFechaExistente.getTime())) {
      maxFechaExistente = bloques[m].date;
    }
  }

  var masRecientes = [], relleno = [];
  for (var f = 0; f < faltantes.length; f++) {
    if (!maxFechaExistente || faltantes[f].getTime() > maxFechaExistente.getTime()) {
      masRecientes.push(faltantes[f]);
    } else {
      relleno.push(faltantes[f]);
    }
  }

  // masRecientes se inserta de la MÁS ANTIGUA (de este lote) a la MÁS [→ Contexto_Base_Web.md §14B061]
  masRecientes.sort(function (a, b) { return a.getTime() - b.getTime(); });
  for (var r1 = 0; r1 < masRecientes.length; r1++) {
    sh.insertColumnsBefore(COL_INICIO_GRID_NUEVOS, GRID_BLOQUE_ANCHO_NUEVOS);
    _formatearBloqueFechaNuevos(sh, COL_INICIO_GRID_NUEVOS, masRecientes[r1]);
    bloquesCreados++;
  }

  if (relleno.length > 0) {
    // Se relee la cuadrícula: las inserciones de arriba pudieron desplazar
    // las columnas de los bloques ya existentes.
    var bloquesActuales = _leerBloquesFechaNuevos(sh);
    for (var r2 = 0; r2 < relleno.length; r2++) {
      var bloqueVacio = null;
      for (var j = 0; j < bloquesActuales.length; j++) {
        if (!bloquesActuales[j].date) { bloqueVacio = bloquesActuales[j]; break; }
      }
      if (bloqueVacio) {
        sh.getRange(NUEVOS_FILA_FECHAS, bloqueVacio.col).setValue(relleno[r2]);
        bloqueVacio.date = relleno[r2];
        bloquesReutilizados++;
        continue;
      }
      var ultimaColGrid = sh.getLastColumn();
      sh.insertColumnsAfter(ultimaColGrid, GRID_BLOQUE_ANCHO_NUEVOS);
      var colNuevoBloque = ultimaColGrid + 1;
      _formatearBloqueFechaNuevos(sh, colNuevoBloque, relleno[r2]);
      bloquesActuales.push({ date: relleno[r2], col: colNuevoBloque });
      bloquesCreados++;
    }
  }

  if (bloquesCreados > 0) {
    _reajustarTituloGridNuevos(sh);
  }

  if (bloquesCreados > 0 || bloquesReutilizados > 0) {
    Logger.log('[Nuevos-RoyaleAPI] Bloques de fecha: ' + bloquesReutilizados +
      ' reutilizado(s) (vacío -> con fecha), ' + bloquesCreados +
      ' nuevo(s) agregado(s) (más recientes a la izquierda, relleno/backfill al final).');
  }
}

/**
 * _buscarBloquePorFechaNuevos(fechasHeader, fecha) [→ Contexto_Base_Web.md §14B062]
 */
function _buscarBloquePorFechaNuevos(fechasHeader, fecha) {
  for (var i = 0; i < fechasHeader.length; i++) {
    var h = fechasHeader[i];
    if (!h.date) continue;
    if (h.date.getFullYear() === fecha.getFullYear() &&
        h.date.getMonth()    === fecha.getMonth() &&
        h.date.getDate()     === fecha.getDate()) {
      return h;
    }
  }
  return null;
}

/**
 * _cargarSnapshotDebugNuevos() [→ Contexto_Base_Web.md §14B063]
 */
function _cargarSnapshotDebugNuevos() {
  var mapa = {};
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var files = folder.getFilesByName(NOMBRE_JSON_DEBUG_NUEVOS);
    if (files.hasNext()) {
      mapa = JSON.parse(files.next().getBlob().getDataAsString('UTF-8')) || {};
    }
  } catch (e) {
    Logger.log('[Nuevos-Debug] Error leyendo ' + NOMBRE_JSON_DEBUG_NUEVOS + ': ' + e.message);
  }
  return mapa;
}

/**
 * _construirMapaSemanasGuerraTerna() [→ Contexto_Base_Web.md §14B064]
 */
function _construirMapaSemanasGuerraTerna() {
  var mapa = {};
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.GUERRA);
  if (!sh || sh.getLastRow() < 2) return mapa;

  var nombresTerna = _getNombresClanesTernaOrdenados();
  var lastRow = sh.getLastRow();
  var data = sh.getRange(2, 1, lastRow - 1, GUERRA_TOTAL_COLS).getValues();

  var semanasPorTag = {}; // TAG -> { 'temporada-semana': true, ... }
  for (var i = 0; i < data.length; i++) {
    var r = data[i];
    var tg = String(r[GC.TAG - 1] || '').trim().toUpperCase();
    if (!tg) continue;

    var clanNombre = String(r[GC.CLAN - 1] || '').trim();
    if (nombresTerna.indexOf(clanNombre) < 0) continue;

    var ataques = Number(r[GC.ATAQUES_SEM - 1]) || 0;
    if (ataques <= 0) continue;

    var clave = String(r[GC.TEMPORADA - 1]) + '-' + String(r[GC.SEMANA - 1]);
    if (!semanasPorTag[tg]) semanasPorTag[tg] = {};
    semanasPorTag[tg][clave] = true;
  }

  for (var tag in semanasPorTag) {
    mapa[tag] = Object.keys(semanasPorTag[tag]).length;
  }
  return mapa;
}

/**
 * _construirReglasSemanaActualNuevos(sh, numFilas) [→ Contexto_Base_Web.md §14B065]
 */
function _construirReglasSemanaActualNuevos(sh, numFilas) {
  var rules = [];
  var colClanL = colLetter(NC.CLAN);
  var fila0 = NUEVOS_FILA_DATOS_INICIO;

  var ctx = _getCtx();
  var vigente = _getDiaActualYSeccionVigente(ctx);
  if (!vigente) return rules;

  var minG = _buildMinGSwitchFormula(colClanL);

  for (var d = 0; d < 4; d++) {
    if (d > vigente.diaActual) continue; // dia futuro: sin regla, queda "tal cual"

    var colAta = COL_INICIO_SEMANA_ACTUAL_NUEVOS + OFFSEM.ATA + d;
    var colPun = COL_INICIO_SEMANA_ACTUAL_NUEVOS + OFFSEM.PUN + d;
    var colBar = COL_INICIO_SEMANA_ACTUAL_NUEVOS + OFFSEM.BAR + d;
    var rangoAta = sh.getRange(fila0, colAta, numFilas, 1);
    var rangoPun = sh.getRange(fila0, colPun, numFilas, 1);
    var rangoBar = sh.getRange(fila0, colBar, numFilas, 1);
    var lA = colLetter(colAta);
    var lP = colLetter(colPun);
    var lB = colLetter(colBar);

    rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($'+lA+fila0+'<>"", $'+lA+fila0+'=4)').setBackground(CFG.COLORES.ATAQUE_4).setRanges([rangoAta]).build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($'+lA+fila0+'<>"", $'+lA+fila0+'>=1, $'+lA+fila0+'<=3)').setBackground(CFG.COLORES.ATAQUE_1_3).setRanges([rangoAta]).build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($'+lA+fila0+'<>"", $'+lA+fila0+'=0)').setBackground(CFG.COLORES.ATAQUE_0).setRanges([rangoAta]).build());

    rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($'+lP+fila0+'<>"", $'+lP+fila0+'=0)').setBackground(CFG.COLORES.PUNTAJE_DIARIO_BG).setRanges([rangoPun]).build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($'+lP+fila0+'<>"", $'+lP+fila0+'>=1, $'+lP+fila0+'<1600)').setBackground(CFG.COLORES.PUNTAJE_BAJO_BG).setRanges([rangoPun]).build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($'+lP+fila0+'<>"", $'+lP+fila0+'>=1600, $'+lP+fila0+'<'+minG+')').setBackground(CFG.COLORES.PUNTAJE_MEDIO_BG).setRanges([rangoPun]).build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($'+lP+fila0+'<>"", $'+lP+fila0+'>='+minG+')').setBackground(CFG.COLORES.CUMPLE_MING_BG).setFontColor(CFG.COLORES.CUMPLE_MING_FG).setBold(true).setRanges([rangoPun]).build());

    rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($'+lB+fila0+'<>"", $'+lB+fila0+'>0)').setBackground(CFG.COLORES.BARCO_POS).setRanges([rangoBar]).build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($'+lB+fila0+'<>"", $'+lB+fila0+'=0)').setBackground(CFG.COLORES.BARCO_CERO_BG).setRanges([rangoBar]).build());
  }

  return rules;
}

/**
 * _contarSemanasGuerraTerna(tag, mapaPrecomputado) [→ Contexto_Base_Web.md §14B066]
 */
function _contarSemanasGuerraTerna(tag, mapaPrecomputado) {
  var tagNorm = String(tag || '').trim().toUpperCase();
  if (!tagNorm) return 0;

  if (mapaPrecomputado) return mapaPrecomputado[tagNorm] || 0;

  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.GUERRA);
  if (!sh || sh.getLastRow() < 2) return 0;

  var nombresTerna = _getNombresClanesTernaOrdenados();
  var lastRow = sh.getLastRow();
  var data = sh.getRange(2, 1, lastRow - 1, GUERRA_TOTAL_COLS).getValues();

  var semanas = {};
  for (var i = 0; i < data.length; i++) {
    var r = data[i];
    var tg = String(r[GC.TAG - 1] || '').trim().toUpperCase();
    if (tg !== tagNorm) continue;

    var clanNombre = String(r[GC.CLAN - 1] || '').trim();
    if (nombresTerna.indexOf(clanNombre) < 0) continue;

    var ataques = Number(r[GC.ATAQUES_SEM - 1]) || 0;
    if (ataques <= 0) continue;

    var clave = String(r[GC.TEMPORADA - 1]) + '-' + String(r[GC.SEMANA - 1]);
    semanas[clave] = true;
  }
  return Object.keys(semanas).length;
}

/**
 * _formatearBloqueFechaNuevos(sh, col, fecha) [→ Contexto_Base_Web.md §14B067]
 */
function _formatearBloqueFechaNuevos(sh, col, fecha) {
  sh.getRange(NUEVOS_FILA_FECHAS, col, 1, GRID_BLOQUE_ANCHO_NUEVOS).merge()
    .setValue(fecha)
    .setBackground(CFG.COLORES.HEADER_BG)
    .setFontColor(CFG.COLORES.HEADER_FG)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  var bloqueHeaders = ['Clan', 'Ataques', 'Fame', 'Barcos'];
  sh.getRange(NUEVOS_FILA_HEADERS, col, 1, GRID_BLOQUE_ANCHO_NUEVOS).setValues([bloqueHeaders])
    .setBackground(CFG.COLORES.HEADER_BG)
    .setFontColor(CFG.COLORES.HEADER_FG)
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  var COLOR_BORDE_HEADER = '#ffffff';
  sh.getRange(1, col, NUEVOS_FILA_HEADERS, GRID_BLOQUE_ANCHO_NUEVOS)
    .setBorder(true, true, true, true, true, true,
               COLOR_BORDE_HEADER, SpreadsheetApp.BorderStyle.SOLID);
}

/**
 * _getDiaActualYSeccionVigente(ctx) [→ Contexto_Base_Web.md §14B068]
 */
function _getDiaActualYSeccionVigente(ctx) {
  if (ctx.periodIndexSospechoso) return null;

  if (esDiaGuerraIdx(ctx.periodIndex)) {
    return {
      diaActual:    ctx.periodIndex - (ctx.sectionIndex * 7 + 3), // 0=J,1=V,2=S,3=D
      sectionIndex: ctx.sectionIndex
    };
  }

  var seccionAnterior = ctx.sectionIndex - 1;
  if (seccionAnterior < 0) return null; // sin semana previa que mostrar

  return { diaActual: 3, sectionIndex: seccionAnterior };
}

/**
 * _guardarSnapshotDebugImportacionNuevos(candidatosPayload) [→ Contexto_Base_Web.md §14B069]
 */
function _guardarSnapshotDebugImportacionNuevos(candidatosPayload) {
  try {
    var mapa = _cargarSnapshotDebugNuevos();
    var ahoraISO = new Date().toISOString();

    // 1) Fusionar lo recibido en este envío.
    for (var i = 0; i < (candidatosPayload || []).length; i++) {
      var cand = candidatosPayload[i] || {};
      var tag = String(cand.tag || '').trim().toUpperCase();
      if (!tag) continue;
      mapa[tag] = {
        tag: tag,
        fechaImportacion: ahoraISO,
        registros: cand.registros || []
      };
    }

    // 2) Purgar Tags ya establecidos (>= 3 semanas de guerra Terna). [→ Contexto_Base_Web.md §14B070]
    var mapaSemanas = _construirMapaSemanasGuerraTerna();
    var purgados = 0;
    for (var t in mapa) {
      if (_contarSemanasGuerraTerna(t, mapaSemanas) >= SEMANAS_MIN_PARA_PURGAR_DEBUG_NUEVOS) {
        delete mapa[t];
        purgados++;
      }
    }

    // 3a) Guardar JSON completo.
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var filesJson = folder.getFilesByName(NOMBRE_JSON_DEBUG_NUEVOS);
    var contentJson = JSON.stringify(mapa, null, 2);
    if (filesJson.hasNext()) {
      _setContentConConteo_(filesJson.next(), contentJson);
    } else {
      _createFileConConteo_(folder, NOMBRE_JSON_DEBUG_NUEVOS, contentJson, MimeType.PLAIN_TEXT);
    }

    // 3b) Guardar CSV aplanado (una fila por registro individual, para [→ Contexto_Base_Web.md §14B071]
    // §PF253 (25-oct-2026): columna 9 «ClanTag» (tag del clan del registro; vacío si la celda de RoyaleAPI no tenía enlace). Va AL FINAL para no mover las 8 que lee _restaurarNuevosDesdeCsvDebug(). La hoja «Nuevos» sigue mostrando solo el nombre del clan.
    var filasCsv = [['Tag', 'Temporada', 'Fecha', 'Fecha_TS', 'Clan', 'Ataques', 'Fame', 'Barcos', 'ClanTag']];
    for (var t2 in mapa) {
      var entrada = mapa[t2];
      var registros = entrada.registros || [];
      if (registros.length === 0) {
        filasCsv.push([t2, '', '', '', '', '', '', '', '']);
        continue;
      }
      for (var r = 0; r < registros.length; r++) {
        var reg = registros[r] || {};
        var fechaAjustada = _parseFechaISONuevos(reg.fecha);
        var fechaTexto = fechaAjustada ? Utilities.formatDate(fechaAjustada, Session.getScriptTimeZone(), 'dd/MM/yyyy') : (reg.fecha || '');
        var fechaTs = fechaAjustada ? fechaAjustada.getTime() : '';
        filasCsv.push([t2, reg.temporada || '', fechaTexto, fechaTs, reg.clan || '', reg.ataques, reg.fame, reg.barcos, String(reg.clanTag || '').trim().toUpperCase()]);
      }
    }
    var contentCsv = filasCsv.map(function (fila) {
      return fila.map(function (v) {
        var s = (v === undefined || v === null) ? '' : String(v);
        if (s.indexOf(',') >= 0 || s.indexOf('"') >= 0 || s.indexOf('\n') >= 0) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      }).join(',');
    }).join('\r\n');
    _saveCSVToDrive(NOMBRE_CSV_DEBUG_NUEVOS, contentCsv);

    Logger.log('[Nuevos-Debug] Snapshot actualizado: ' + Object.keys(mapa).length +
      ' Tag(s) vigentes, ' + purgados + ' purgado(s) por alcanzar ' +
      SEMANAS_MIN_PARA_PURGAR_DEBUG_NUEVOS + '+ semanas de guerra Terna.');
  } catch (e) {
    Logger.log('[Nuevos-Debug] Error guardando snapshot de depuración: ' + e.message);
  }
}

// POST — aplicar lo que el userscript detectó como "nuevo" [→ Contexto_Base_Web.md §14B072]

/**
 * _aplicarImportacionNuevos(candidatosPayload) [→ Contexto_Base_Web.md §14B073]
 */
/**
 * _insertarNuevosCandidatosOrdenadosPorClan(sh, candidatosPayload, tagAFila, dirPorTag) [→ Contexto_Base_Web.md §14B074]
 */
function _insertarNuevosCandidatosOrdenadosPorClan(sh, candidatosPayload, tagAFila, dirPorTag) {
  var ss = sh.getParent();
  var ordenClan = _getOrdenClanHoja(ss);

  // 1) Candidatos realmente nuevos (sin fila todavía), sin duplicados
  //    dentro del propio payload.
  var nuevosTags = [];
  var vistos = {};
  for (var i = 0; i < candidatosPayload.length; i++) {
    var tag = String((candidatosPayload[i] || {}).tag || '').trim().toUpperCase();
    if (!tag || vistos[tag] || tagAFila[tag]) continue;
    vistos[tag] = true;
    nuevosTags.push(tag);
  }
  if (nuevosTags.length === 0) return [];

  function _claveOrden(tag) {
    var d = dirPorTag[tag];
    var nombreClan = d ? String(d[DC.CLAN - 1] || '').trim().toLowerCase() : '';
    var clanOrden  = (nombreClan && ordenClan[nombreClan] !== undefined) ? ordenClan[nombreClan] : 999;
    var nombre     = d ? String(d[DC.NOM_MULTI - 1] || d[DC.NOMBRE - 1] || '').trim().toLowerCase() : '';
    return { clanOrden: clanOrden, nombre: nombre };
  }

  // 2) Ordenar los candidatos nuevos entre sí: Clan (orden de la hoja
  //    Clan) -> Nombre.
  nuevosTags.sort(function (a, b) {
    var ca = _claveOrden(a), cb = _claveOrden(b);
    if (ca.clanOrden !== cb.clanOrden) return ca.clanOrden - cb.clanOrden;
    if (ca.nombre !== cb.nombre) return ca.nombre < cb.nombre ? -1 : 1;
    return 0;
  });

  // 3) Insertar cada candidato en su posición correcta, comparando contra [→ Contexto_Base_Web.md §14B075]
  var proximaFilaAlFinal = sh.getLastRow() + 1;
  for (var n = 0; n < nuevosTags.length; n++) {
    var tagNuevo = nuevosTags[n];
    var claveNuevo = _claveOrden(tagNuevo);

    var lastRow = sh.getLastRow();
    var filaDestino = Math.max(proximaFilaAlFinal, lastRow + 1); // por defecto, al final de todo
    var vaAlFinal = true;
    if (lastRow >= NUEVOS_FILA_DATOS_INICIO) {
      var numFilasExistentes = lastRow - NUEVOS_FILA_DATOS_INICIO + 1;
      var datosExistentes = sh.getRange(NUEVOS_FILA_DATOS_INICIO, 1, numFilasExistentes, NC_TOTAL_FIJAS).getValues();
      for (var r = 0; r < datosExistentes.length; r++) {
        var clanExistente = String(datosExistentes[r][NC.CLAN - 1] || '').trim().toLowerCase();
        var ordenExistente = (clanExistente && ordenClan[clanExistente] !== undefined) ? ordenClan[clanExistente] : 999;
        var nombreExistente = String(datosExistentes[r][NC.NOM_MULTI - 1] || datosExistentes[r][NC.NOMBRE - 1] || '').trim().toLowerCase();

        var vaDespues = (ordenExistente > claveNuevo.clanOrden) ||
          (ordenExistente === claveNuevo.clanOrden && nombreExistente > claveNuevo.nombre);
        if (vaDespues) {
          filaDestino = NUEVOS_FILA_DATOS_INICIO + r;
          vaAlFinal = false;
          break;
        }
      }
    }

    if (vaAlFinal) {
      // Al final de todo: todavía no hay nada físico que insertar (la fila [→ Contexto_Base_Web.md §14B076]
      proximaFilaAlFinal = filaDestino + 1;
    } else {
      sh.insertRowBefore(filaDestino);
      // Cualquier tag cuya fila ya asignada (de una vuelta anterior de [→ Contexto_Base_Web.md §14B077]
      for (var tagShift in tagAFila) {
        if (tagAFila[tagShift] >= filaDestino) tagAFila[tagShift]++;
      }
      if (proximaFilaAlFinal >= filaDestino) proximaFilaAlFinal++;
    }
    tagAFila[tagNuevo] = filaDestino;
  }

  return nuevosTags;
}

// BLOQUES DE FECHA — lectura y crecimiento dinámico de la cuadrícula [→ Contexto_Base_Web.md §14B078]

/**
 * _leerBloquesFechaNuevos(sh) [→ Contexto_Base_Web.md §14B079]
 */
function _leerBloquesFechaNuevos(sh) {
  var lastCol = sh.getLastColumn();
  var bloques = [];
  for (var col = COL_INICIO_GRID_NUEVOS; col <= lastCol; col += GRID_BLOQUE_ANCHO_NUEVOS) {
    var val = sh.getRange(NUEVOS_FILA_FECHAS, col).getValue();
    var d = (val instanceof Date && !isNaN(val.getTime())) ? val : null;
    bloques.push({ date: d, col: col });
  }
  return bloques;
}

// GET — lista de candidatos para el userscript [→ Contexto_Base_Web.md §14B080]

/**
 * _obtenerListaCandidatosNuevos() [→ Contexto_Base_Web.md §14B081]
 */
function _obtenerListaCandidatosNuevos() {
  var tIni = Date.now(); // PF043: tiempos en el log para ver dónde se va la espera [→ Contexto_Base_Web.md §PF043]
  var ss = _getSs();
  // FIX (24-sep-2026, pedido del usuario -- auditoría Sheet->CSV->JSON, [→ Contexto_Base_Web.md §14B082]
  var shDirNuevos = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  var dirData;
  var ix; // PF043: índices 0-based según el layout de las filas leídas (IC si viene de la hoja, DC si viene del CSV) [→ Contexto_Base_Web.md §PF043]
  if (shDirNuevos && shDirNuevos.getLastRow() >= 2) {
    // PF043: solo el rango físico del Directorio; ya no se leen Players ni Links ni se arman filas de 60 columnas. Los ocho campos que usa esta lista salen de la hoja Directorio y Players/Links no los pisan. [→ Contexto_Base_Web.md §PF043]
    dirData = shDirNuevos.getRange(2, 1, shDirNuevos.getLastRow() - 1, DIR_SHEET_COLS).getValues();
    ix = { estado: IC.ESTADO - 1, clanTag: IC.CLAN_TAG - 1, rango: IC.RANGO - 1, admin: IC.ADMIN - 1, tag: IC.TAG - 1, nomMulti: IC.NOM_MULTI - 1, nombre: IC.NOMBRE - 1, clan: IC.CLAN - 1 };
  } else {
    var lecturaDirNuevos = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.DIRECTORIO, 'Backup_Directorio.csv', DIR_TOTAL_COLS);
    dirData = (lecturaDirNuevos.origen === 'csv') ? lecturaDirNuevos.filas : [];
    ix = { estado: DC.ESTADO - 1, clanTag: DC.CLAN_TAG - 1, rango: DC.RANGO - 1, admin: DC.ADMIN - 1, tag: DC.TAG - 1, nomMulti: DC.NOM_MULTI - 1, nombre: DC.NOMBRE - 1, clan: DC.CLAN - 1 };
  }
  var tDir = Date.now();
  var candidatos = [];

  // FIX (06-ago-2026): cada candidato ahora informa si YA está siendo [→ Contexto_Base_Web.md §14B083]
  var tagsEnNuevos = _obtenerTagsEnHojaNuevos(ss);
  var tTags = Date.now();

  // FIX (29-ago-2026): mapa semanal por Tag construido SOLO desde [→ Contexto_Base_Web.md §14B084]
  var mapaSemanalPorTag = _construirMapaSemanalPorTagDesdeSupercell();
  var tMapa = Date.now();

  // FIX (16-sep-2026): contexto vigente (temporada + semana en curso), para [→ Contexto_Base_Web.md §14B085]
  var ctx = _getCtx();

  for (var i = 0; i < dirData.length; i++) {
    var r = dirData[i];
    if (String(r[ix.estado]) !== 'Activo') continue;

    var clanTag = String(r[ix.clanTag] || '').trim();
    if (CFG.TERNA_TAGS.indexOf(clanTag) < 0) continue;

    var rango = String(r[ix.rango] || '').trim();
    if (rango !== 'Miembro') continue;

    var esAdmin = String(r[ix.admin] || '').trim() === 'Sí';
    if (esAdmin) continue;

    var tag = String(r[ix.tag] || '').trim();
    if (!tag) continue;

    // FIX (29-ago-2026): ya tiene participación establecida en Terna [→ Contexto_Base_Web.md §14B086]
    if (_tagTieneParticipacionEstablecidaEnTerna(tag, mapaSemanalPorTag, ctx)) continue;

    candidatos.push({
      tag: tag,
      nombre: String(r[ix.nomMulti] || r[ix.nombre] || ''),
      clan: String(r[ix.clan] || ''),
      royaleApiUrl: 'https://royaleapi.com/player/' + tag.replace('#', '') + '/',
      yaEnNuevos: tagsEnNuevos.hasOwnProperty(tag.toUpperCase())
    });
  }

  Logger.log('[Nuevos][Lista] ' + candidatos.length + ' candidato(s) · directorio ' + (tDir - tIni) + ' ms · hoja Nuevos ' + (tTags - tDir) + ' ms · mapa semanal ' + (tMapa - tTags) + ' ms · filtrado ' + (Date.now() - tMapa) + ' ms · total ' + (Date.now() - tIni) + ' ms');

  return {
    ok: true,
    clanesTerna: _getNombresClanesTernaOrdenados(),
    clanTagsTerna: CFG.TERNA_TAGS.slice(), // v3.12 de Tampermonkey: «cuenta como nuevo» se decide por tag de clan, no por nombre
    candidatos: candidatos,
    // FIX (11-sep-2026, pedido usuario): objeto vacío a propósito — ver [→ Contexto_Base_Web.md §14B087]
    coberturaPorTag: {}
  };
}

/**
 * _construirMapaSemanalPorTagDesdeSupercell() [→ Contexto_Base_Web.md §14B088]
 */
function _construirMapaSemanalPorTagDesdeSupercell() {
  var mapa = {};
  var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
  if (!csvText) return mapa;

  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length < 2) return mapa;

  // Agrupar por Temporada|Semana|Tag (mismo criterio que
  // generarBackupGuerraSemanalCSV(), sin el paso de overlay).
  var grupos = {};
  var ordenClaves = [];
  for (var i = 1; i < parsed.length; i++) {
    var f = parsed[i];
    var temporada = String(f[GC.TEMPORADA - 1] || '').trim();
    var semana    = String(f[GC.SEMANA - 1]    || '').trim();
    var tag       = String(f[GC.TAG - 1]       || '').trim();
    if (!temporada || !semana || !tag) continue;

    var clave = temporada + '|' + semana + '|' + tag;
    if (!grupos[clave]) { grupos[clave] = []; ordenClaves.push(clave); }
    grupos[clave].push(f);
  }

  for (var g = 0; g < ordenClaves.length; g++) {
    var partes = ordenClaves[g].split('|');
    var grupo  = grupos[ordenClaves[g]];

    var sumaAtaques = 0, maxFame = 0, maxBarcos = 0;
    for (var k = 0; k < grupo.length; k++) {
      sumaAtaques += Number(grupo[k][GC.ATAQUES_HOY - 1]) || 0;
      var fameK   = Number(grupo[k][GC.FAME   - 1]) || 0;
      var barcosK = Number(grupo[k][GC.BARCOS - 1]) || 0;
      if (fameK   > maxFame)   maxFame   = fameK;
      if (barcosK > maxBarcos) maxBarcos = barcosK;
    }

    var tagGrupo = partes[2];
    if (!mapa[tagGrupo]) mapa[tagGrupo] = [];
    mapa[tagGrupo].push({
      temporada: Number(partes[0]) || 0,
      semana:    Number(partes[1]) || 0,
      ataques:   sumaAtaques,
      fame:      maxFame,
      barcos:    maxBarcos
    });
  }

  for (var t in mapa) {
    mapa[t].sort(function (a, b) {
      if (a.temporada !== b.temporada) return b.temporada - a.temporada;
      return b.semana - a.semana;
    });
  }
  return mapa;
}

/**
 * _tagTieneParticipacionEstablecidaEnTerna(tag, mapaSemanalPorTag, ctx) [→ Contexto_Base_Web.md §14B089]
 */
function _tagTieneParticipacionEstablecidaEnTerna(tag, mapaSemanalPorTag, ctx) {
  var registros = mapaSemanalPorTag[tag];
  if (!registros || !registros.length) return false;

  // FIX (16-sep-2026, ver docblock arriba): descartar la semana de guerra [→ Contexto_Base_Web.md §14B090]
  var semanaVigente = ctx ? (Number(ctx.sectionIndex) + 1) : null;
  var temporadaVigente = ctx ? Number(ctx.temporada) : null;
  var registrosCerrados = registros;
  if (ctx) {
    registrosCerrados = [];
    for (var j = 0; j < registros.length; j++) {
      var reg = registros[j];
      if (reg.temporada === temporadaVigente && reg.semana === semanaVigente) continue; // semana en curso, se ignora
      registrosCerrados.push(reg);
    }
  }

  if (registrosCerrados.length < 3) return false;

  var ultimas3 = registrosCerrados.slice(0, 3); // ya vienen ordenadas desc al construir el mapa
  for (var i = 0; i < ultimas3.length; i++) {
    var r = ultimas3[i];
    if (r.ataques <= 0 || r.fame <= 0) return false;
  }
  return true;
}

/**
 * _obtenerTagsEnHojaNuevos(ss) [→ Contexto_Base_Web.md §14B091]
 */
function _obtenerTagsEnHojaNuevos(ss) {
  var mapa = {};
  var sh = ss.getSheetByName(CFG.SHEETS.NUEVOS);
  if (!sh) return mapa;
  var lastRow = sh.getLastRow();
  if (lastRow < NUEVOS_FILA_DATOS_INICIO) return mapa;
  var tags = sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.TAG, lastRow - NUEVOS_FILA_DATOS_INICIO + 1, 1).getValues();
  for (var i = 0; i < tags.length; i++) {
    var t = String(tags[i][0] || '').trim().toUpperCase();
    if (t) mapa[t] = true;
  }
  return mapa;
}

/**
 * _ordenarBloquesFechaNuevos(sh) [→ Contexto_Base_Web.md §14B092]
 */
function _ordenarBloquesFechaNuevos(sh) {
  var lastCol = sh.getLastColumn();
  var totalColsGrid = lastCol - COL_INICIO_GRID_NUEVOS + 1;
  var numBloques = Math.floor(totalColsGrid / GRID_BLOQUE_ANCHO_NUEVOS);
  if (numBloques < 2) return; // nada que reordenar con 0 o 1 bloque

  var bloques = _leerBloquesFechaNuevos(sh);

  var conFecha = [], sinFecha = [];
  for (var i = 0; i < bloques.length; i++) {
    if (bloques[i].date) conFecha.push(bloques[i]); else sinFecha.push(bloques[i]);
  }
  conFecha.sort(function (a, b) { return b.date.getTime() - a.date.getTime(); });
  var ordenDeseado = conFecha.concat(sinFecha); // partición estable: los sin fecha conservan su orden relativo

  // ¿Ya está en el orden correcto? Compara, posición a posición, la
  // columna que DEBERÍA estar ahí contra la que está físicamente ahí hoy.
  var yaOrdenado = true;
  for (var p = 0; p < ordenDeseado.length; p++) {
    if (ordenDeseado[p].col !== bloques[p].col) { yaOrdenado = false; break; }
  }
  if (yaOrdenado) return;

  // FIX (11-ago-2026) — BUG REAL ENCONTRADO: la versión anterior leía y [→ Contexto_Base_Web.md §14B093]
  var lastRowHoja = Math.max(sh.getLastRow(), NUEVOS_FILA_DATOS_INICIO - 1);
  var filasRestoDelBloque = lastRowHoja - (NUEVOS_FILA_FECHAS + 1) + 1; // desde la fila de Headers hasta la última con datos

  var fechaPorCol = {};   // fila NUEVOS_FILA_FECHAS (merge), un valor por bloque
  var restoPorCol = {};   // filas NUEVOS_FILA_FECHAS+1 en adelante (headers + datos)
  for (var b = 0; b < bloques.length; b++) {
    var colB = bloques[b].col;
    fechaPorCol[colB] = sh.getRange(NUEVOS_FILA_FECHAS, colB).getValue();
    if (filasRestoDelBloque > 0) {
      restoPorCol[colB] = sh.getRange(NUEVOS_FILA_FECHAS + 1, colB, filasRestoDelBloque, GRID_BLOQUE_ANCHO_NUEVOS).getValues();
    }
  }

  for (var d = 0; d < ordenDeseado.length; d++) {
    var colDestino = COL_INICIO_GRID_NUEVOS + d * GRID_BLOQUE_ANCHO_NUEVOS;
    var colOrigen = ordenDeseado[d].col;

    // Fila de Fecha: setValue() SOLO sobre la celda ancla del merge [→ Contexto_Base_Web.md §14B094]
    sh.getRange(NUEVOS_FILA_FECHAS, colDestino).setValue(fechaPorCol[colOrigen]);

    // Resto del bloque (headers + datos, celdas normales): setValues() en
    // un solo llamado, como antes.
    if (filasRestoDelBloque > 0) {
      sh.getRange(NUEVOS_FILA_FECHAS + 1, colDestino, filasRestoDelBloque, GRID_BLOQUE_ANCHO_NUEVOS)
        .setValues(restoPorCol[colOrigen]);
    }
  }

  Logger.log('[Nuevos-RoyaleAPI] Cuadrícula reordenada por Fecha (más reciente a la izquierda, ' + numBloques + ' bloque(s)).');
}

/**
 * _parseFechaISONuevos(texto) [→ Contexto_Base_Web.md §14B095]
 */
function _parseFechaISONuevos(texto) {
  if (!texto) return null;
  var m = String(texto).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  var fechaRoyaleApi = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  fechaRoyaleApi.setDate(fechaRoyaleApi.getDate() - 1); // Lunes (RoyaleAPI) -> Domingo (convención del proyecto)
  return fechaRoyaleApi;
}

/**
 * _purgarNuevosEstablecidos(sh) [→ Contexto_Base_Web.md §14B096]
 */
function _purgarNuevosEstablecidos(sh) {
  var lastRow = sh.getLastRow();
  if (lastRow < NUEVOS_FILA_DATOS_INICIO) return 0;
  var numFilas = lastRow - NUEVOS_FILA_DATOS_INICIO + 1;
  var tags = sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.TAG, numFilas, 1).getValues();

  // FIX (22-ago-2026): mapa de semanas construido UNA sola vez (una sola [→ Contexto_Base_Web.md §14B097]
  var mapaSemanas = _construirMapaSemanasGuerraTerna();

  var filasABorrar = [];
  var tagsPurgados = [];
  for (var i = 0; i < numFilas; i++) {
    var tag = String(tags[i][0] || '').trim();
    if (!tag) continue;
    if (_contarSemanasGuerraTerna(tag, mapaSemanas) >= SEMANAS_MIN_PARA_PURGAR_DEBUG_NUEVOS) {
      filasABorrar.push(NUEVOS_FILA_DATOS_INICIO + i);
      tagsPurgados.push(tag);
    }
  }
  if (filasABorrar.length === 0) return 0;

  // Borrar de abajo hacia arriba: borrar una fila de arriba primero [→ Contexto_Base_Web.md §14B098]
  for (var b = filasABorrar.length - 1; b >= 0; b--) {
    sh.deleteRow(filasABorrar[b]);
  }

  Logger.log('[Nuevos] _purgarNuevosEstablecidos(): ' + filasABorrar.length +
    ' candidato(s) purgado(s) por alcanzar ' + SEMANAS_MIN_PARA_PURGAR_DEBUG_NUEVOS +
    '+ semanas de guerra real en un clan Terna (no necesariamente el mismo clan): ' +
    tagsPurgados.join(', ') + '.');
  return filasABorrar.length;
}

/**
 * _purgarNuevosExpulsados(sh, dirPorTag) [→ Contexto_Base_Web.md §14B099]
 */
function _purgarNuevosExpulsados(sh, dirPorTag) {
  var lastRow = sh.getLastRow();
  if (lastRow < NUEVOS_FILA_DATOS_INICIO) return 0;
  var numFilas = lastRow - NUEVOS_FILA_DATOS_INICIO + 1;
  var tags = sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.TAG, numFilas, 1).getValues();

  var filasABorrar = [];
  var tagsPurgados = [];
  for (var i = 0; i < numFilas; i++) {
    var tag = String(tags[i][0] || '').trim().toUpperCase();
    if (!tag) continue;
    var dRow = dirPorTag[tag];
    var sigueActivoEnTerna = dRow &&
      String(dRow[DC.ESTADO - 1]) === 'Activo' &&
      CFG.TERNA_TAGS.indexOf(String(dRow[DC.CLAN_TAG - 1])) >= 0;
    if (!sigueActivoEnTerna) {
      filasABorrar.push(NUEVOS_FILA_DATOS_INICIO + i);
      tagsPurgados.push(tag);
    }
  }
  if (filasABorrar.length === 0) return 0;

  // Borrar de abajo hacia arriba: borrar una fila de arriba primero [→ Contexto_Base_Web.md §14B100]
  for (var b = filasABorrar.length - 1; b >= 0; b--) {
    sh.deleteRow(filasABorrar[b]);
  }

  Logger.log('[Nuevos] _purgarNuevosExpulsados(): ' + filasABorrar.length +
    ' candidato(s) purgado(s) por ya no ser miembro Activo de ningún clan Terna ' +
    '(expulsado/retirado): ' + tagsPurgados.join(', ') + '.');

  // FIX (20-ago-2026, pedido usuario): si la purga deja la hoja en 0 filas [→ Contexto_Base_Web.md §14B101]
  var filasRestantes = sh.getLastRow() - NUEVOS_FILA_DATOS_INICIO + 1;
  if (filasRestantes <= 0) {
    Logger.log('[Nuevos] AVISO: tras la purga de arriba, "Nuevos" quedó SIN ningún candidato ' +
      '(0 filas de datos). Es el comportamiento esperado si se purgó a TODOS los candidatos ' +
      'existentes (revisar la lista de arriba) — si en cambio esperabas ver candidatos que no ' +
      'están en esa lista, el problema está en otro punto (ej. _aplicarImportacionNuevos() no los ' +
      'escribió, o el userscript de Tampermonkey no envió datos en esta corrida).');
  }

  return filasABorrar.length;
}

/**
 * _reajustarTituloGridNuevos(sh) [→ Contexto_Base_Web.md §14B102]
 */
function _reajustarTituloGridNuevos(sh) {
  var totalColsGrid = sh.getLastColumn() - COL_INICIO_GRID_NUEVOS + 1;
  if (totalColsGrid < 1) return;

  var numBloques = Math.round(totalColsGrid / GRID_BLOQUE_ANCHO_NUEVOS);
  sh.getRange(1, COL_INICIO_GRID_NUEVOS, 1, totalColsGrid).merge()
    .setValue('Historial RoyaleAPI (últimas ' + numBloques + ' fechas)')
    .setBackground(CFG.COLORES.HEADER_BG)
    .setFontColor(CFG.COLORES.HEADER_FG)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  var filtroActual = sh.getFilter();
  if (filtroActual) filtroActual.remove();
  sh.getRange(NUEVOS_FILA_HEADERS, 1, 1, sh.getLastColumn()).createFilter();
}

/**
 * _refrescarColumnasFijasNuevos() [→ Contexto_Base_Web.md §14B103]
 */
function _refrescarColumnasFijasNuevos() {
  _refrescarColumnasFijasNuevos_Paso1_FormatoYPurgado();
  _refrescarColumnasFijasNuevos_Paso2_ColumnasFijas();
  _refrescarColumnasFijasNuevos_Paso3_OrdenYFormato();
}

function _refrescarColumnasFijasNuevos_Paso1_FormatoYPurgado() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.NUEVOS);
  if (!sh) return;

  _ordenarBloquesFechaNuevos(sh);
  repararFormatoEncabezadosNuevos();

  // FIX (20-ago-2026, pedido usuario): dirPorTag se construye AQUÍ ARRIBA [→ Contexto_Base_Web.md §14B104]
  var dirData = _leerDirectorioFisicoComoDC(ss);
  var dirPorTag = {};
  for (var j = 0; j < dirData.length; j++) {
    var tg = String(dirData[j][DC.TAG - 1] || '').trim().toUpperCase();
    if (tg) dirPorTag[tg] = dirData[j];
  }

  // FIX (14-ago-2026, pedido usuario): autolimpieza de candidatos ya [→ Contexto_Base_Web.md §14B105]
  var purgadosEstablecidos = _purgarNuevosEstablecidos(sh);
  var purgadosExpulsados = _purgarNuevosExpulsados(sh, dirPorTag);
  if (purgadosEstablecidos > 0 || purgadosExpulsados > 0) _renumerarNuevos(sh);

  var lastRow = sh.getLastRow();
  // FIX (02-sep-2026, ver docblock de NUEVOS_RESTORE_PROGRESS_FILE más [→ Contexto_Base_Web.md §14B106]
  if (lastRow < NUEVOS_FILA_DATOS_INICIO || _hayRestauracionNuevosPendiente()) {
    // PEDIDO DEL USUARIO (22-ago-2026): antes de rendirse por "no hay [→ Contexto_Base_Web.md §14B107]
    try {
      var resultadoRestauracion = _restaurarNuevosDesdeCsvDebug();
      if (resultadoRestauracion && resultadoRestauracion.ok) {
        Logger.log('[Nuevos-RoyaleAPI] Restauración desde ' + NOMBRE_CSV_DEBUG_NUEVOS + ': ' +
          (resultadoRestauracion.procesados || 0) + ' candidato(s) en esta corrida' +
          (resultadoRestauracion.completo ? ' (respaldo completo, sin pendientes).' :
            ' (quedan ' + (resultadoRestauracion.pendientes || 0) + ' candidato(s) más -- continúa en la próxima corrida).'));
      }
    } catch (eRestore) {
      Logger.log('[Nuevos-RoyaleAPI] _restaurarNuevosDesdeCsvDebug() falló: ' + eRestore.message);
    }
  }
}

function _refrescarColumnasFijasNuevos_Paso2_ColumnasFijas() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.NUEVOS);
  if (!sh) return;

  var lastRow = sh.getLastRow();
  if (lastRow < NUEVOS_FILA_DATOS_INICIO) return; // hoja vacía: nada que refrescar
  var numFilas = lastRow - NUEVOS_FILA_DATOS_INICIO + 1;

  var dirData = _leerDirectorioFisicoComoDC(ss);
  var dirPorTag = {};
  for (var j = 0; j < dirData.length; j++) {
    var tg = String(dirData[j][DC.TAG - 1] || '').trim().toUpperCase();
    if (tg) dirPorTag[tg] = dirData[j];
  }

  var tags        = sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.TAG,         numFilas, 1).getValues();
  var nombres      = sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.NOMBRE,      numFilas, 1).getValues();
  var nomMultis     = sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.NOM_MULTI,   numFilas, 1).getValues();
  var clanes        = sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.CLAN,        numFilas, 1).getValues();
  var niveles        = sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.NIVEL,       numFilas, 1).getValues();
  var copasArr        = sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.COPAS,       numFilas, 1).getValues();
  var vGuerras          = sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.V_GUERRA,    numFilas, 1).getValues();
  var inactividades      = sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.INACTIVIDAD, numFilas, 1).getValues();
  var celulares = sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.CELULAR, numFilas, 1).getValues();
  var royaleLinks = [];

  for (var i = 0; i < numFilas; i++) {
    var tag = String(tags[i][0] || '').trim().toUpperCase();
    if (!tag) { royaleLinks.push([makeLink('', '')]); continue; }

    var dRow = dirPorTag[tag];
    if (dRow) {
      nombres[i][0]       = dRow[DC.NOMBRE      - 1];
      nomMultis[i][0]     = dRow[DC.NOM_MULTI    - 1];
      clanes[i][0]        = dRow[DC.CLAN         - 1];
      niveles[i][0]       = dRow[DC.NIVEL        - 1];
      copasArr[i][0]      = dRow[DC.COPAS        - 1];
      vGuerras[i][0]      = dRow[DC.V_GUERRA     - 1];
      inactividades[i][0] = dRow[DC.INACTIVIDAD  - 1];
      celulares[i][0]     = dRow[DC.CELULAR      - 1];
    }
    royaleLinks.push([makeLink('Link', 'https://royaleapi.com/player/' + cleanTag(tag) + '/')]);
  }

  sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.NOMBRE,      numFilas, 1).setValues(nombres);
  sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.NOM_MULTI,   numFilas, 1).setValues(nomMultis);
  sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.CLAN,        numFilas, 1).setValues(clanes);
  sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.NIVEL,       numFilas, 1).setValues(niveles);
  sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.COPAS,       numFilas, 1).setValues(copasArr);
  sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.V_GUERRA,    numFilas, 1).setValues(vGuerras);
  sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.INACTIVIDAD, numFilas, 1).setValues(inactividades);
  // Formato numérico consistente con el resto del proyecto (mismo criterio
  // que ya usaba _aplicarImportacionNuevos() para estas columnas).
  sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.NIVEL,       numFilas, 1).setNumberFormat('#,##0');
  sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.COPAS,       numFilas, 1).setNumberFormat('#,##0');
  sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.V_GUERRA,    numFilas, 1).setNumberFormat('#,##0');
  sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.INACTIVIDAD, numFilas, 1).setNumberFormat('#,##0');

  sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.CELULAR, numFilas, 1).setValues(celulares);
  sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.CELULAR, numFilas, 1).setNumberFormat('### ### ### ###');
  sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.ROYALE_API, numFilas, 1).setRichTextValues(royaleLinks);

  Logger.log('[Nuevos-RoyaleAPI] _refrescarColumnasFijasNuevos_Paso2_ColumnasFijas(): Nombre/Nom_Multi/Clan/Nivel/Copas/V_Guerra/Días inactivo/Celular/RoyaleAPI refrescados en ' + numFilas + ' fila(s).');
}

function _refrescarColumnasFijasNuevos_Paso3_OrdenYFormato() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.NUEVOS);
  if (!sh) return;

  var lastRow = sh.getLastRow();
  if (lastRow < NUEVOS_FILA_DATOS_INICIO) return; // hoja vacía: nada que ordenar/formatear

  // FIX (09-ago-2026): ver docblock de _refrescarColumnasFijasNuevos() más [→ Contexto_Base_Web.md §14B108]
  _actualizarSemanaActualNuevos(sh);
  _reordenarFilasNuevosPorClanYNombre(sh);
  _aplicarTodoFormatoCondicionalNuevos(sh);
  _limpiarLinksAccidentalesEnHoja(sh, NUEVOS_FILA_HEADERS);

  Logger.log('[Nuevos-RoyaleAPI] _refrescarColumnasFijasNuevos_Paso3_OrdenYFormato(): semana actual/orden/formato reaplicados.');
}

/**
 * _renumerarNuevos(sh) [→ Contexto_Base_Web.md §14B109]
 */
function _renumerarNuevos(sh) {
  var lastRow = sh.getLastRow();
  if (lastRow < NUEVOS_FILA_DATOS_INICIO) return;
  var numFilas = lastRow - NUEVOS_FILA_DATOS_INICIO + 1;
  var numCol = [];
  for (var n = 0; n < numFilas; n++) numCol.push([n + 1]);
  sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.NUM, numFilas, 1).setValues(numCol);
}

/**
 * _reordenarFilasNuevosPorClanYNombre(sh) [→ Contexto_Base_Web.md §14B110]
 */
function _reordenarFilasNuevosPorClanYNombre(sh) {
  var lastRow = sh.getLastRow();
  if (lastRow < NUEVOS_FILA_DATOS_INICIO) return;
  var lastCol = sh.getLastColumn();
  var numFilas = lastRow - NUEVOS_FILA_DATOS_INICIO + 1;
  if (numFilas < 2) return;

  var rango = sh.getRange(NUEVOS_FILA_DATOS_INICIO, 1, numFilas, lastCol);
  var valores = rango.getValues();
  var royaleLinks = sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.ROYALE_API, numFilas, 1).getRichTextValues();

  var ordenClan = _getOrdenClanHoja(sh.getParent());

  var indices = valores.map(function (_, i) { return i; });
  indices.sort(function (a, b) {
    var clanA = String(valores[a][NC.CLAN - 1] || '').trim().toLowerCase();
    var clanB = String(valores[b][NC.CLAN - 1] || '').trim().toLowerCase();
    var ordA = (clanA && ordenClan[clanA] !== undefined) ? ordenClan[clanA] : 999;
    var ordB = (clanB && ordenClan[clanB] !== undefined) ? ordenClan[clanB] : 999;
    if (ordA !== ordB) return ordA - ordB;

    var nomA = String(valores[a][NC.NOM_MULTI - 1] || valores[a][NC.NOMBRE - 1] || '').trim().toLowerCase();
    var nomB = String(valores[b][NC.NOM_MULTI - 1] || valores[b][NC.NOMBRE - 1] || '').trim().toLowerCase();
    return nomA.localeCompare(nomB, 'es');
  });

  var yaOrdenado = indices.every(function (v, i) { return v === i; });
  if (yaOrdenado) return;

  var valoresOrdenados = indices.map(function (i) { return valores[i]; });
  var linksOrdenados    = indices.map(function (i) { return [royaleLinks[i][0]]; });

  rango.setValues(valoresOrdenados);
  sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.ROYALE_API, numFilas, 1).setRichTextValues(linksOrdenados);

  var numCol = [];
  for (var n = 0; n < numFilas; n++) numCol.push([n + 1]);
  sh.getRange(NUEVOS_FILA_DATOS_INICIO, NC.NUM, numFilas, 1).setValues(numCol);

  Logger.log('[Nuevos-RoyaleAPI] Filas reordenadas por Clan -> Nombre (' + numFilas + ' fila(s)).');
}

/**
 * _restaurarNuevosDesdeCsvDebug() [→ Contexto_Base_Web.md §14B111]
 */
function _restaurarNuevosDesdeCsvDebug() {
  var csvText = _loadCSVFromDrive(NOMBRE_CSV_DEBUG_NUEVOS);
  if (!csvText) { _borrarProgresoRestaurarNuevos(); return null; }
  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length < 2) { _borrarProgresoRestaurarNuevos(); return null; }

  var ss = _getSs();
  var dirData = _leerDirectorioFisicoComoDC(ss);
  var dirPorTag = {};
  for (var j = 0; j < dirData.length; j++) {
    var tg = String(dirData[j][DC.TAG - 1] || '').trim().toUpperCase();
    if (tg) dirPorTag[tg] = dirData[j];
  }
  var tz = Session.getScriptTimeZone() || 'GMT-5';

  var filas = parsed.slice(1); // Tag, Temporada, Fecha, Fecha_TS, Clan, Ataques, Fame, Barcos, ClanTag (la 9.ª es de §PF253; los CSV anteriores no la tienen)
  var porTag = {};
  var tagsDescartadosPorMembresia = {};

  // FIX (22-ago-2026): mapa de semanas construido UNA sola vez en vez de [→ Contexto_Base_Web.md §14B112]
  var mapaSemanas = _construirMapaSemanasGuerraTerna();

  for (var i = 0; i < filas.length; i++) {
    var f = filas[i];
    var tag = String(f[0] || '').trim().toUpperCase();
    if (!tag) continue;

    // Filtro de membresía -- "que siguen en el clan" (mismo criterio que
    // _purgarNuevosExpulsados()).
    var dRow = dirPorTag[tag];
    var sigueActivoEnTerna = dRow &&
      String(dRow[DC.ESTADO - 1]) === 'Activo' &&
      CFG.TERNA_TAGS.indexOf(String(dRow[DC.CLAN_TAG - 1])) >= 0;
    if (!sigueActivoEnTerna) { tagsDescartadosPorMembresia[tag] = true; continue; }

    // Filtro de "ya establecido" -- mismo criterio que _purgarNuevosEstablecidos().
    if (_contarSemanasGuerraTerna(tag, mapaSemanas) >= SEMANAS_MIN_PARA_PURGAR_DEBUG_NUEVOS) continue;

    // Fecha_TS (numérico, epoch ms) -- ver docblock de esta función. [→ Contexto_Base_Web.md §14B113]
    var fechaTs = Number(f[3]);
    if (!fechaTs) continue; // fila "placeholder" (tag sin registros) o Fecha_TS ausente (CSV de antes de este fix)

    // Domingo (guardado en Fecha_TS) -> Lunes (formato crudo que espera
    // _parseFechaISONuevos(), que le vuelve a restar 1 día).
    var fechaDomingo = new Date(fechaTs);
    fechaDomingo.setDate(fechaDomingo.getDate() + 1);
    var fechaCruda = Utilities.formatDate(fechaDomingo, tz, 'yyyy-MM-dd');

    if (!porTag[tag]) porTag[tag] = [];
    porTag[tag].push({
      temporada: f[1] || '',
      fecha: fechaCruda,
      clan: f[4] || '',
      ataques: Number(f[5]) || 0,
      fame: Number(f[6]) || 0,
      barcos: Number(f[7]) || 0,
      clanTag: String(f[8] || '').trim().toUpperCase() // §PF253: vacío en los CSV anteriores
    });
  }

  var candidatosPayload = [];
  for (var t in porTag) {
    candidatosPayload.push({ tag: t, registros: porTag[t] });
  }

  var totalDescartados = Object.keys(tagsDescartadosPorMembresia).length;
  if (totalDescartados > 0) {
    Logger.log('[Nuevos-Restaurar] ' + totalDescartados + ' Tag(s) del respaldo NO se restauraron ' +
      'por ya no ser miembros Activos de un clan Terna: ' + Object.keys(tagsDescartadosPorMembresia).join(', ') + '.');
  }
  if (!candidatosPayload.length) {
    Logger.log('[Nuevos-Restaurar] Nada que restaurar desde ' + NOMBRE_CSV_DEBUG_NUEVOS +
      ' (vacío, o ningún Tag califica tras el filtro de membresía/semanas).');
    _borrarProgresoRestaurarNuevos();
    return null;
  }

  // --- Descartar del payload los Tags que un intento anterior YA restauró
  //     (checkpoint) -- ver docblock de esta función.
  var tagsYaRestaurados = _cargarProgresoRestaurarNuevos() || [];
  var yaRestauradoSet = {};
  for (var k = 0; k < tagsYaRestaurados.length; k++) yaRestauradoSet[tagsYaRestaurados[k]] = true;

  var candidatosPendientes = candidatosPayload.filter(function (c) {
    return !yaRestauradoSet.hasOwnProperty(c.tag);
  });

  if (!candidatosPendientes.length) {
    // Todo lo que califica del respaldo ya se restauró en un intento
    // anterior -- checkpoint cumplido, se limpia.
    Logger.log('[Nuevos-Restaurar] Los ' + candidatosPayload.length +
      ' candidato(s) que califican del respaldo ya estaban restaurados (checkpoint). Nada pendiente.');
    _borrarProgresoRestaurarNuevos();
    return { ok: true, procesados: 0, filasNuevas: 0, filasEliminadas: 0, errores: [], completo: true, pendientes: 0 };
  }

  Logger.log('[Nuevos-Restaurar] ' + candidatosPendientes.length + ' candidato(s) pendiente(s) de restaurar desde ' +
    NOMBRE_CSV_DEBUG_NUEVOS + (tagsYaRestaurados.length ? ' (' + tagsYaRestaurados.length + ' ya restaurado(s) en un intento anterior).' : '.'));

  // --- Procesar en sub-lotes acotados por tiempo, guardando checkpoint [→ Contexto_Base_Web.md §14B114]
  var inicio = Date.now();
  var totalProcesados = 0, totalFilasNuevas = 0, totalFilasEliminadas = 0;
  var erroresAcumulados = [];
  var indice = 0;
  var seAgotoElPresupuesto = false;

  while (indice < candidatosPendientes.length) {
    if ((Date.now() - inicio) > NUEVOS_RESTORE_PRESUPUESTO_MS) {
      seAgotoElPresupuesto = true;
      break;
    }

    var subLote = candidatosPendientes.slice(indice, indice + NUEVOS_RESTORE_LOTE_MAX);
    var resultadoSubLote = _aplicarImportacionNuevos(subLote);

    if (resultadoSubLote && resultadoSubLote.ok) {
      totalProcesados += resultadoSubLote.procesados || 0;
      totalFilasNuevas += resultadoSubLote.filasNuevas || 0;
      totalFilasEliminadas += resultadoSubLote.filasEliminadas || 0;
      if (resultadoSubLote.errores && resultadoSubLote.errores.length) {
        erroresAcumulados = erroresAcumulados.concat(resultadoSubLote.errores);
      }
      // Sub-lote aplicado con éxito -- sus Tags pasan a "ya restaurados", [→ Contexto_Base_Web.md §14B115]
      for (var s = 0; s < subLote.length; s++) tagsYaRestaurados.push(subLote[s].tag);
    } else {
      Logger.log('[Nuevos-Restaurar] Sub-lote (' + subLote.length + ' candidato(s)) falló: ' +
        (resultadoSubLote && resultadoSubLote.error || 'respuesta inválida de _aplicarImportacionNuevos()') +
        ' -- se reintentará en la próxima corrida (no se marca como restaurado).');
    }

    indice += NUEVOS_RESTORE_LOTE_MAX;
    _guardarProgresoRestaurarNuevos(tagsYaRestaurados);
  }

  // pendientesReales: cuántos Tags del payload total (que califican por [→ Contexto_Base_Web.md §14B116]
  var pendientesReales = candidatosPayload.length - tagsYaRestaurados.length;
  if (pendientesReales < 0) pendientesReales = 0;

  if (pendientesReales === 0) {
    Logger.log('[Nuevos-Restaurar] Restauración completa: ' + tagsYaRestaurados.length + ' candidato(s) en total.');
    _borrarProgresoRestaurarNuevos();
  } else {
    Logger.log('[Nuevos-Restaurar] Presupuesto de tiempo (' + (NUEVOS_RESTORE_PRESUPUESTO_MS / 1000) +
      's) alcanzado -- ' + tagsYaRestaurados.length + ' candidato(s) restaurado(s) hasta ahora, ' +
      pendientesReales + ' pendiente(s) para la próxima corrida.');
  }

  return {
    ok: true,
    procesados: totalProcesados,
    filasNuevas: totalFilasNuevas,
    filasEliminadas: totalFilasEliminadas,
    errores: erroresAcumulados,
    completo: pendientesReales === 0,
    pendientes: pendientesReales
  };
}

/**
 * _asegurarBloquesParaFechas(sh, fechasNecesarias) [→ Contexto_Base_Web.md §14B117]
 */
/**
 * _seleccionarFechasNuevasNecesariasNuevos(sh, candidatosPayload) [→ Contexto_Base_Web.md §14B118]
 */
function _seleccionarFechasNuevasNecesariasNuevos(sh, candidatosPayload) {
  var bloques = _leerBloquesFechaNuevos(sh);

  function mismoDia(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  }
  function existeBloque(fecha) {
    return bloques.some(function (bk) { return bk.date && mismoDia(bk.date, fecha); });
  }

  // FIX (12-ago-2026): bug reportado — "no está agregando la última semana [→ Contexto_Base_Web.md §14B119]
  var maxFechaExistente = null;
  for (var m = 0; m < bloques.length; m++) {
    if (bloques[m].date && (!maxFechaExistente || bloques[m].date.getTime() > maxFechaExistente.getTime())) {
      maxFechaExistente = bloques[m].date;
    }
  }

  var fechasNuevasNecesarias = [];
  function agregarSiFalta(fecha) {
    var yaEsta = fechasNuevasNecesarias.some(function (f) { return mismoDia(f, fecha); });
    if (!yaEsta) fechasNuevasNecesarias.push(fecha);
  }

  for (var c = 0; c < candidatosPayload.length; c++) {
    var registros = (candidatosPayload[c] || {}).registros || [];

    // Fechas del candidato, parseadas y deduplicadas por día.
    var fechasCand = [];
    for (var r = 0; r < registros.length; r++) {
      var f = _parseFechaISONuevos((registros[r] || {}).fecha);
      if (!f) continue;
      if (!fechasCand.some(function (ff) { return mismoDia(ff, f); })) fechasCand.push(f);
    }
    if (fechasCand.length === 0) continue;

    // a) Semana(s) nueva(s) — más reciente(s) que cualquier bloque ya
    //    existente en la hoja: SIEMPRE se agregan, incondicionalmente.
    var masRecientesQueTodo = fechasCand.filter(function (f) {
      return !maxFechaExistente || f.getTime() > maxFechaExistente.getTime();
    });
    for (var mr = 0; mr < masRecientesQueTodo.length; mr++) {
      agregarSiFalta(masRecientesQueTodo[mr]);
    }

    // b) Resto (nunca más nuevas que lo que ya hay en la hoja): mismo
    //    criterio de mínimo 5 que antes, aplicado solo sobre este subgrupo.
    var candidatasBackfill = fechasCand.filter(function (f) {
      return maxFechaExistente && f.getTime() <= maxFechaExistente.getTime();
    });

    var coincidentes = candidatasBackfill.filter(existeBloque);
    if (coincidentes.length >= GRID_NUM_BLOQUES_NUEVOS) continue; // ya cumple el mínimo: no crea nada más

    var sinBloque = candidatasBackfill.filter(function (f) { return !existeBloque(f); });
    sinBloque.sort(function (a, b) { return b.getTime() - a.getTime(); }); // más reciente primero

    var faltan = GRID_NUM_BLOQUES_NUEVOS - coincidentes.length;
    for (var k = 0; k < sinBloque.length && k < faltan; k++) {
      agregarSiFalta(sinBloque[k]);
    }
  }

  return fechasNuevasNecesarias;
}

// FASE 9 (Consolidado_Cambios_Pendientes_Guerra.md, punto 3): MIGRACIÓN DE [→ Contexto_Base_Web.md §14B120]

/**
 * _fechaATemporadaSemana(fecha) [→ Contexto_Base_Web.md §14B121]
 */
function _fechaATemporadaSemana(fecha) {
  if (!(fecha instanceof Date) || isNaN(fecha.getTime())) return null;
  var ref = CFG.REF_DEFAULT;
  if (!ref || isNaN(ref.getTime())) return null;

  // Mismo ajuste de "mes efectivo" que _calcularMesEfectivoRealDeHoy(), [→ Contexto_Base_Web.md §14B122]
  var anio = fecha.getFullYear();
  var mes  = fecha.getMonth();
  var primerLunesFechaMes = primerLunesDelMes(anio, mes);
  if (fecha < primerLunesFechaMes) {
    mes--;
    if (mes < 0) { mes = 11; anio--; }
  }
  var mesEfectivo = { anio: anio, mes: mes };
  var temporadaPropia = calcTemporadaDesdeMesEfectivo(ref, mesEfectivo);
  if (temporadaPropia < 1) return null; // fecha anterior a CFG.REF_DEFAULT, fuera de rango del proyecto

  var pl = primerLunesTemporada(ref, temporadaPropia);
  if (!pl || isNaN(pl.getTime())) return null;

  var periodIndex = Math.round((fecha.getTime() - pl.getTime()) / 86400000);
  if (periodIndex < 0) return null; // no debería pasar tras el ajuste de mes efectivo, red de seguridad
  var semana = Math.floor(periodIndex / 7) + 1;

  return { temporadaPropia: temporadaPropia, semana: semana, periodIndex: periodIndex };
}

/**
 * _mapaNombreClanATagTerna() [→ Contexto_Base_Web.md §14B123]
 */
function _mapaNombreClanATagTerna() {
  var mapa = {};
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.CLAN);
  if (sh && sh.getLastRow() >= 2) {
    var data = sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues(); // Orden, ClanTag, Nombre
    for (var i = 0; i < data.length; i++) {
      var tag = String(data[i][1] || '').trim();
      var nombre = String(data[i][2] || '').trim();
      if (nombre && CFG.TERNA_TAGS.indexOf(tag) >= 0) {
        mapa[nombre.toLowerCase()] = tag;
      }
    }
  }
  // Respaldo (hoja Clan sin datos todavía, ej. corrida muy temprana): usa
  // el mismo fallback que _getNombresClanesTernaOrdenados()/_resolverNombreClan().
  if (Object.keys(mapa).length === 0) {
    for (var j = 0; j < CFG.TERNA_TAGS.length; j++) {
      var tagJ = CFG.TERNA_TAGS[j];
      var nombreJ = _resolverNombreClan(tagJ);
      if (nombreJ) mapa[String(nombreJ).trim().toLowerCase()] = tagJ;
    }
  }
  return mapa;
}

/**
 * _migrarNuevosAHistorico(candidatosPayload) [→ Contexto_Base_Web.md §14B124]
 */
function _migrarNuevosAHistorico(candidatosPayload) {
  var statsGlobal = {
    temporadasProcesadas: 0, clavesMigradas: 0, clavesYaExistian: 0,
    descartadosPorMembresia: 0, sinHistorialParaVerificar: 0, pausadasPorRestauracion: 0
  };
  if (!candidatosPayload || !candidatosPayload.length) return statsGlobal;

  var ctxReal = _getCtx();
  var offsetRoyaleApi = _getTemporadaOffsetRoyaleApi();
  var nombreClanATag = _mapaNombreClanATagTerna();
  // FIX (30-ago-2026): verificación cruzada e independiente del nombre de [→ Contexto_Base_Web.md §14B125]
  var ventanasPorTag = _construirVentanasMembresiaTernaPorTag();

  // 1) Agrupar registros -> por Temporada(propia), lista de entradas a
  //    migrar { tag, semana, ataquesSemana, fame, barcos, temporadaRoyaleApi }.
  var porTemporada = {};
  for (var c = 0; c < candidatosPayload.length; c++) {
    var cand = candidatosPayload[c] || {};
    var tag = String(cand.tag || '').trim().toUpperCase();
    if (!tag) continue;
    var registros = cand.registros || [];

    for (var r = 0; r < registros.length; r++) {
      var reg = registros[r] || {};

      // Punto 3: SOLO clanes Terna. reg.clan es el nombre tal cual lo [→ Contexto_Base_Web.md §14B126]
      var clanNombreReg = String(reg.clan || '').trim().toLowerCase();
      var clanTagReg = clanNombreReg ? nombreClanATag[clanNombreReg] : null;
      if (!clanTagReg) continue;

      var fechaReg = _parseFechaISONuevos(reg.fecha);
      if (!fechaReg) continue;

      // FIX (30-ago-2026): el nombre de clan ya no alcanza por sí solo —
      // se cruza contra Historial_I/S antes de aceptar el registro.
      var verificacionMembresia = _tagEstuvoEnTernaEnFecha(tag, fechaReg, ventanasPorTag);
      if (verificacionMembresia === false) {
        statsGlobal.descartadosPorMembresia++;
        Logger.log('[Nuevos-RoyaleAPI] _migrarNuevosAHistorico(): descartado Tag=' + tag +
          ' Fecha=' + fechaReg + ' ClanReportado="' + reg.clan + '" — Historial_I/S confirma que ' +
          'este Tag NO estuvo en ningún clan Terna esa fecha (posible bug de Tampermonkey o ' +
          'coincidencia de nombre con un clan rival). No se reconstruye.');
        continue;
      }
      if (verificacionMembresia === null) statsGlobal.sinHistorialParaVerificar++;

      var ts = _fechaATemporadaSemana(fechaReg);
      if (!ts) continue; // fecha fuera de rango de CFG.REF_DEFAULT, o inválida

      var ataquesVal = (reg.ataques === '' || reg.ataques === null || reg.ataques === undefined) ? null : Number(reg.ataques);
      var fameVal    = (reg.fame    === '' || reg.fame    === null || reg.fame    === undefined) ? null : Number(reg.fame);
      var barcosVal  = (reg.barcos  === '' || reg.barcos  === null || reg.barcos  === undefined) ? null : Number(reg.barcos);
      if (ataquesVal === null && fameVal === null && barcosVal === null) continue; // registro totalmente vacío, nada que migrar

      if (!porTemporada[ts.temporadaPropia]) porTemporada[ts.temporadaPropia] = [];
      porTemporada[ts.temporadaPropia].push({
        tag: tag,
        semana: ts.semana,
        ataquesSemana: ataquesVal || 0,
        fame: fameVal || 0,
        barcos: barcosVal, // null se preserva tal cual -- _reconstruirSemanaDesdeCero() ya sabe tratarlo como "sin dato"
        temporadaRoyaleApi: ts.temporadaPropia + offsetRoyaleApi
      });
    }
  }

  // 2) Por cada temporada distinta presente en el lote: cargar la fuente [→ Contexto_Base_Web.md §14B127]
  var temporadasKeys = Object.keys(porTemporada);
  for (var t = 0; t < temporadasKeys.length; t++) {
    var temporadaPropia = Number(temporadasKeys[t]);
    var entradas = porTemporada[temporadasKeys[t]];

    var fuente = _cargarFuenteGuerraParaTemporada(temporadaPropia, ctxReal.temporada);
    if (!fuente) {
      Logger.log('[Nuevos-RoyaleAPI] _migrarNuevosAHistorico(): no se pudo cargar la fuente de Guerra para temporada ' +
        temporadaPropia + ' (hoja Guerra no encontrada). Se omite esa temporada.');
      continue;
    }

    // 31-oct-2026: si la temporada es la de la hoja Guerra y la hoja aún no terminó de restaurarse desde Backup_Guerra.csv (por ejemplo,
    // justo después de un Demoler), no se escribe nada ahora: la regla de no pisado solo mira lo que ya hay en la hoja y no vería lo que
    // todavía falta restaurar, así que las semanas se escribirían antes y la restauración las dejaría repetidas o fuera de orden.
    if (fuente.tipo === 'hoja') {
      var faltantesRestauracion = _contarFilasGuerraFaltantesDesdeCSV_(fuente.sh, temporadaPropia);
      if (faltantesRestauracion > 0) {
        statsGlobal.pausadasPorRestauracion++;
        Logger.log('[Nuevos-RoyaleAPI] Migración a histórico omitida para la temporada ' + temporadaPropia +
          ': la hoja Guerra todavía no termina de restaurarse desde Backup_Guerra.csv (faltan ' + faltantesRestauracion +
          ' fila(s)). Las semanas de Nuevos de esa temporada no se migraron en esta corrida.');
        continue;
      }
    }

    var offsetsPorClave = _construirOffsetsPorClave(fuente.filas, temporadaPropia);
    var statsLocal = {};
    var huboCambioTemporada = false;

    for (var e = 0; e < entradas.length; e++) {
      var entrada = entradas[e];
      var clave = entrada.tag + '|' + entrada.semana;

      if (offsetsPorClave[clave]) {
        // YA existe -- regla de no pisado (ver docblock de sección arriba): [→ Contexto_Base_Web.md §14B128]
        statsGlobal.clavesYaExistian++;
        continue;
      }

      _aplicarCorreccionAGuerraConReparto(
        fuente, offsetsPorClave, temporadaPropia, entrada.semana, entrada.tag,
        { ataquesSemana: entrada.ataquesSemana, fame: entrada.fame, barcos: entrada.barcos },
        { temporadaRoyaleApi: entrada.temporadaRoyaleApi },
        statsLocal
      );
      huboCambioTemporada = true;
      statsGlobal.clavesMigradas++;
    }

    if (huboCambioTemporada) {
      _guardarFuenteGuerra(fuente);
    }
    statsGlobal.temporadasProcesadas++;
  }

  return statsGlobal;
}