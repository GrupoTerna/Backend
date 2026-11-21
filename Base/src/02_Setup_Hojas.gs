// ==============================================================================
// 02_Setup_Hojas.gs
// Creacion/estructura de todas las hojas del spreadsheet (encabezados, formato base,
// proteccion). Punto de entrada: setupAllSheets().
// ==============================================================================

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 29-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Crear y preparar todas las hojas
//    - Reparar los bordes de S_Asistencia
//    - Poner las notas de columna en los encabezados de las hojas
//  Parte 2 — Funciones que no se corren a mano
//    - Ayudas generales de las hojas (crear la hoja y su protección)
//    - Hojas de clan, directorio y guerra (en el orden de setupAllSheets)
//    - Hoja Control (grid de métricas)
//    - Hojas de seguimiento (historial, pendientes, calendarios, inactivos, vetados, mensajes)
//    - Torneos, sorteos y cambio de rango: listas, encabezados y filtros
//    - Torneos y sorteos: asistencia, control y resoluciones
//    - Hojas restantes (jugadores, enlaces, alertas, conflictos, grupo verificado)
//    - Notas de columna: texto de cada nota y mecanismo que las escribe sin pisar las puestas a mano
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

// Métricas del grid de Control: nombre, ancho TOTAL de columnas (25 de [→ Contexto_Base_Web.md §02B001]
var CONTROL_METRICAS = [
  { nombre: 'Ataques',           ancho: 27, extras: ['Total', '%'] },
  { nombre: 'Puntaje',           ancho: 27, extras: ['Prom', '%'] },
  { nombre: 'Puntaje acumulado', ancho: 25, extras: [] },
  { nombre: 'Barcos',            ancho: 26, extras: ['Total'] }
];

// Índices de columna (1-based) de la hoja "Inactivos" — ver _setupInactivos(). [→ Contexto_Base_Web.md §02B002]
var IC = {
  NUM:1, TAG:2, NOMBRE:3, JUGADOR:4, NOM_MULTI:5, PRESTAMO:6, MULTICUENTA:7,
  CLAN:8, CLAN_TAG:9, RANGO:10, LIDER:11, PREFIJO:12, CELULAR:13, WSP_G:14,
  ETIQUETA:15, PERMISO:16, INICIALES:17, ESTADO:18, ADMIN:19, VETADO:20,
  RAZON:21, FECHA_ING:22, FECHA_LIM:23, VIGENCIA:24,
  INACTIVIDAD:25, ALERTA:26, RANKING:27, RANKING_P:28, COMENTARIO:29
};

var INACTIVOS_TOTAL_COLS = 29;

// Índices de columna (1-based) de la hoja "Players" — ver _setupPlayers(). [→ Contexto_Base_Web.md §02B003]
var PC = {
  NUM:1, TAG:2, NOMBRE:3, NOM_MULTI:4, PRESTAMO:5, CLAN:6, CLAN_TAG:7, RANGO:8,
  ANTIGUEDAD:9, NIVEL:10, NIVEL2:11, COPAS:12, COPAS_MAX:13, ARENA:14, V_GUERRA:15,
  VICTORIAS:16, DERROTAS:17, BATALLAS:18, RACHA:19,
  CL_LIGA:20, CL_TROFEOS:21, CL_RANGO:22,
  VICTORIAS_3C:23, MAX_VIC_DESAFIOS:24, TORNEOS:25, EMOTES:26, BANNERS:27,
  CARTAS_DESAFIOS:28, CARTAS_TORNEOS:29,
  DON_R:30, DON_D:31
};

var PLAYERS_TOTAL_COLS = 31;

// Índices de columna (1-based) de la hoja "Links" — ver _setupLinks(). [→ Contexto_Base_Web.md §02B004]
var LC = {
  NUM:1, TAG:2, NOMBRE:3, NOM_MULTI:4, PRESTAMO:5, CLAN:6, CLAN_TAG:7, RANGO:8,
  WSP:9, ROYALE_API:10, DECK:11, DECK_2:12, CW_STATS:13, RENDER:14
};

var LINKS_TOTAL_COLS = 14;

// Notas de columna (PF286, punto 17 b; 21-nov-2026, pedido de la usuaria): toda nota que escribe el sistema empieza con este prefijo. Una nota de encabezado SIN el prefijo se considera puesta a mano y nunca se reemplaza; ver _aplicarNotasColumnasHoja_().
var NOTA_COLUMNA_PREFIJO_ = '[Sistema] ';

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Crear y preparar todas las hojas -----

// SECCIÓN 2: FUNCIONES DE SETUP / INTERNAS (sin cambios de orden respecto de [→ Contexto_Base_Web.md §02B005]
function setupAllSheets() {
  var ss = _getSs();
  Logger.log('[Setup] Iniciando setupAllSheets...');

  _setupExtra(ss);
  _setupClan(ss);
  _setupDirectorio(ss);
  _setupGuerra(ss);
  _setupGuerraLogs(ss);
  _setupControl(ss);
  _setupHistorial(ss);
  _setupPendientes(ss);
  _setupCalendario(ss);
  _setupCalendario2(ss);
  _setupComentarios(ss);
  // Las hojas Plantillas y Menú ya no se crean: Plantillas se eliminó en la [→ Contexto_Base_Web.md §02B006]
  _setupInactivos(ss);
  _setupVetados(ss);
  _setupMulticuentas(ss);
  _setupAscensosSheet(ss);
  _setupAdministradores(ss);
  _setupMensajes(ss);
  // FIX (06-ago-2026): Cards y Cards_2 dejan de vivir en el spreadsheet. [→ Contexto_Base_Web.md §02B007]
  _setupIndice(ss);
  _setupTLista(ss);
  _setupSLista(ss);
  // NUEVO (13-sep-2026, pedido del usuario): CR_Lista -- ver _setupCRLista()
  // más abajo en este mismo archivo y CFG.SHEETS.CR_LISTA (01_Config_Global.gs).
  _setupCRLista(ss);
  _setupTAsistencia(ss);
  _setupTControl(ss);
  _setupTResoluciones(ss);
  // NUEVO (09-sep-2026, pedido usuario): estructura de S_Asistencia (ver [→ Contexto_Base_Web.md §02B008]
  _setupSAsistencia(ss);
  _setupPlayers(ss);
  _setupLinks(ss);
  _setupAlertasHistorialGuerra(ss);
  // FASE 6 (punto 6 del documento — Detección de infiltrados/sabotaje, [→ Contexto_Base_Web.md §02B009]
  _setupConflictos(ss);
  // NUEVO (14-sep-2026, pedido del usuario): "Marcar visto en el grupo" [→ Contexto_Base_Web.md §02B010]
  _setupGrupoVerificado(ss);

  // NOTA: aplicarFormatoGlobal NO se llama aquí — _runAllImpl la llama después
  // de todas las cargas de datos para evitar hacerlo dos veces (timeout).
  Logger.log('[Setup] setupAllSheets completado.');
}

// ----- Reparar los bordes de S_Asistencia -----

/**
 * PF231: se puede correr sola desde el editor de Apps Script (no recibe parámetros) para corregir los bordes de S_Asistencia sin ejecutar todo el setup.
 */
function repararBordesSAsistencia() {
  var sh = _getSs().getSheetByName(CFG.SHEETS.S_ASISTENCIA);
  if (!sh) { Logger.log('[Setup] repararBordesSAsistencia: no existe la hoja ' + CFG.SHEETS.S_ASISTENCIA); return; }
  _bordesDatosSAsistencia_(sh);
  Logger.log('[Setup] Bordes de S_Asistencia corregidos (' + Math.max(0, sh.getLastRow() - 1) + ' filas, ' + SA_TOTAL_COLS + ' columnas).');
}

// ----- Poner las notas de columna en los encabezados de las hojas -----

/**
 * aplicarNotasColumnas() — proyecto Base, archivo 02_Setup_Hojas.gs. [→ Contexto_Base_Web.md §PF286]
 * Escribe, en el encabezado de cada columna de las hojas que figuran en _definicionNotasColumnas_(), una nota que dice qué es la columna, quién la escribe y si se puede editar. Hoy cubre Historial_A/D, Pendientes, Mensajes, Nuevos y Control (estas dos últimas con los encabezados en la fila 3; una hoja ya existente recibe sus notas al correr esta función). Calendario no tiene notas porque es una cuadrícula sin encabezados por columna.
 * Es idempotente y no toca datos. Una nota que ya tenga el encabezado y NO empiece con «[Sistema] » se considera puesta a mano y se conserva; las del sistema se actualizan si cambió el texto. Si el encabezado de una columna no es el esperado, esa columna se omite y queda en el registro.
 * También la llama setupAllSheets() (por _setupAscensosSheet), así que las notas vuelven solas si se recrea la hoja. Se puede correr aparte, sin ejecutar todo el setup.
 */
function aplicarNotasColumnas() {
  var ss = _getSs();
  var defs = _definicionNotasColumnas_();
  Object.keys(defs).forEach(function (nombreHoja) {
    var sh = ss.getSheetByName(nombreHoja);
    if (!sh) { Logger.log('[Notas] No existe la hoja «' + nombreHoja + '»; se omite.'); return; }
    var r = _aplicarNotasColumnasHoja_(sh, defs[nombreHoja], _filaEncabezadoNotas_(nombreHoja));
    Logger.log('[Notas] ' + nombreHoja + ': ' + r.escritas + ' escrita(s), ' + r.iguales + ' ya estaban igual, ' +
      r.conservadas + ' puesta(s) a mano conservada(s), ' + r.omitidas + ' omitida(s) por encabezado distinto.');
  });
}

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Ayudas generales de las hojas (crear la hoja y su protección) -----

/**
 * _getOrCreateSheet(ss, name) [→ Contexto_Base_Web.md §02B011]
 */
function _getOrCreateSheet(ss, name) {
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    Logger.log('[Setup] Hoja creada: ' + name);
  }
  return sh;
}

/**
 * _protegerSoloAdvertencia(sh) [→ Contexto_Base_Web.md §02B018]
 */
function _protegerSoloAdvertencia(sh) {
  var DESC = 'AUTO_SOLO_LECTURA';
  var protecciones = sh.getProtections(SpreadsheetApp.ProtectionType.SHEET);
  for (var i = 0; i < protecciones.length; i++) {
    if (protecciones[i].getDescription() === DESC) protecciones[i].remove();
  }
  var p = sh.protect().setWarningOnly(true);
  p.setDescription(DESC);
}

/**
 * _quitarProteccionAdvertencia(sh) [→ Contexto_Base_Web.md §02B019]
 */
function _quitarProteccionAdvertencia(sh) {
  var DESC = 'AUTO_SOLO_LECTURA';
  var protecciones = sh.getProtections(SpreadsheetApp.ProtectionType.SHEET);
  for (var i = 0; i < protecciones.length; i++) {
    if (protecciones[i].getDescription() === DESC) protecciones[i].remove();
  }
}

// ----- Hojas de clan, directorio y guerra (en el orden de setupAllSheets) -----

function _setupExtra(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.EXTRA);
  // Mostrar_T (antes "Mostrar"): SOLO cambio de nombre — mantiene exactamente [→ Contexto_Base_Web.md §02B016]
  var headers = ['Temporada','Semana','Día','Ref','Primer lunes','# Sem','Mostrar_T',
                 'Mostrar_S','Mostrar_D',
                 'Trofeos','Liga','Rangos','Alerta','Categoría','Subcategoría',
                 'Vigente','Visibilidad','Tipo','Edición',
                 'Torneo_Vigente_ID','Sorteo_Vigente_ID',
                 'Ascenso_Vigente_ID','Descenso_Vigente_ID'];
  // Siempre se reescribe la fila 1 (igual que Directorio) para que columnas [→ Contexto_Base_Web.md §02B017]
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  applyHeaderStyle(sh, headers.length);
  if (sh.getLastRow() >= 2) {
    applyBorderCenter(sh.getRange(2, 1, 1, headers.length));
  }
  _protegerSoloAdvertencia(sh);
  sh.hideSheet();
  Logger.log('[Setup] Extra OK');
}

function _setupClan(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.CLAN);
  // Min_T ELIMINADA (08/08/2026): ya no vive en esta hoja — ahora se [→ Contexto_Base_Web.md §02B020]
  var headers = ['Orden','ClanTag','Nombre','Líder','Miembros','Trofeos',
                 'Liga','Requerimiento','Copas','Donaciones','Tipo','País',
                 'Descripción','Badge_Id','RoyaleApi','Analytics','CSV','CWStats','App','Render (clans)',
                 'Render (members)','Render (riverrace)','Render (players)','Condición'];
  if (sh.getLastRow() === 0 || sh.getRange(1,1).getValue() === '') {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    var initialData = [
      [1,'#GCRG8L00','','','','','','','','','','','','','','','','','','','','','','Terna'],
      [2,'#GYCU9YRG','','','','','','','','','','','','','','','','','','','','','','Terna'],
      [3,'#GQQPPJGR','','','','','','','','','','','','','','','','','','','','','','Terna'],
      [4,'#GG99LCJY','','','','','','','','','','','','','','','','','','','','','','Terna'],
      // El clan vetado (CFG.VETADO_TAG) ya no se siembra aquí: vive en la hoja Conflictos, como los clanes que se vetan desde la web (§PF369).
    ];
    sh.getRange(2, 1, initialData.length, headers.length).setValues(initialData);
  } else {
    // MIGRACIÓN INVERSA: si la hoja Clan todavía tiene la columna Min_T [→ Contexto_Base_Web.md §02B021]
    var headerCol7 = String(sh.getRange(1, 7).getValue() || '').trim();
    if (headerCol7 === 'Min_T') {
      sh.deleteColumn(7);
      Logger.log('[Setup] Clan: columna Min_T eliminada de la posición 7 (ahora se define por clan vía T_Lista/S_Lista).');
    }
    // MIGRACIÓN INVERSA (11/08/2026, FASE 27): si la hoja Clan todavía [→ Contexto_Base_Web.md §02B022]
    var headerCol6 = String(sh.getRange(1, 6).getValue() || '').trim();
    if (headerCol6 === 'Min_G') {
      sh.deleteColumn(6);
      Logger.log('[Setup] Clan: columna Min_G eliminada de la posición 6 (ahora vive en CR_Lista, categoría Descensos).');
    }
    // MIGRACIÓN (12-ago-2026): si la hoja Clan todavía NO tiene las [→ Contexto_Base_Web.md §02B023]
    var headerCol15 = String(sh.getRange(1, 15).getValue() || '').trim();
    if (headerCol15 !== 'Analytics' && headerCol15 !== 'RoyaleApi') {
      sh.insertColumnsAfter(14, 2);
      Logger.log('[Setup] Clan: columnas "Analytics" y "CSV" insertadas a la derecha de RoyaleApi (posiciones 15-16); CWStats..Condición corridas 2 posiciones a la derecha.');
    }
    // MIGRACIÓN (16-sep-2026, pedido del usuario -- ícono real del clan a [→ Contexto_Base_Web.md §02B024]
    var headerCol14 = String(sh.getRange(1, 14).getValue() || '').trim();
    if (headerCol14 !== 'Badge_Id') {
      sh.insertColumnsAfter(13, 1);
      Logger.log('[Setup] Clan: columna "Badge_Id" insertada a la derecha de Descripción (posición 14); RoyaleApi..Condición corrida 1 posición a la derecha.');
    }
    // Siempre reescribir la fila de encabezados (igual criterio que Extra/
    // Directorio) para que quede al día aunque la hoja ya tuviera datos.
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  applyHeaderStyle(sh, headers.length);
  Logger.log('[Setup] Clan OK');
}

function _setupDirectorio(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.DIRECTORIO);
  // Cat_disp y Clanes_Admin (12/07/2026): YA NO forman parte de la hoja [→ Contexto_Base_Web.md §02B025]
  var headers = [
    'N°','Tag','Nombre','Jugador','Nom_Multi',
    // Préstamo (col 6): edición MANUAL. Registra a quién se prestó esta
    // cuenta. El script NUNCA sobreescribe este campo automáticamente.
    'Préstamo','Multicuenta',
    'Clan','ClanTag','Rango','Líder','Prefijo','Celular','WSP(G)','Etiqueta',
    'Permiso','Iniciales','Estado','Admin','Vetado','Razón',
    'Fecha_ing','Fecha_lim','Vigencia','Inactividad(d)','Alerta','Ranking','Ranking_p',
    'Comentario'
  ];
  // Siempre actualizar fila 1 para reflejar columnas nuevas
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  applyHeaderStyle(sh, headers.length);
  Logger.log('[Setup] Directorio OK (29 cols, mismo layout que Inactivos)');
}

function _setupGuerra(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.GUERRA);
  // PUNTO 1.4/1.5 (Consolidado_Cambios_Pendientes_Guerra.md): Temporada_2 y [→ Contexto_Base_Web.md §02B026]
  // 30-oct-2026 (§PF304): los encabezados salen de GUERRA_HEADERS (17_GuerraSheet.gs, orden nuevo de 23 columnas); ya no se repite la lista aquí.
  // Cada corrida reescribe la fila 1: con la lista vieja habría desordenado los encabezados de una hoja ya reordenada.
  var headers = GUERRA_HEADERS.slice();
  if (sh.getMaxColumns() < headers.length) sh.insertColumnsAfter(sh.getMaxColumns(), headers.length - sh.getMaxColumns());
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  applyHeaderStyle(sh, headers.length);
  _aplicarFormatoMilesGuerra_(sh); // 31-oct-2026: Fame y Copas con coma de miles, solo visual (17_GuerraSheet.gs)
  Logger.log('[Setup] Guerra OK (' + headers.length + ' cols, incluye Merma_AtaquesHoy/Merma_AtaquesSemana)');
}

function _setupGuerraLogs(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.GUERRA_LOGS);
  // TANDA 1 (20-sep-2026): la lista de encabezados vive ahora en [→ Contexto_Base_Web.md §02B027]
  var headers = GUERRA_LOGS_HEADERS.slice();
  // La hoja necesita tener físicamente esas columnas antes de escribir la fila 1.
  if (sh.getMaxColumns() < headers.length) {
    sh.insertColumnsAfter(sh.getMaxColumns(), headers.length - sh.getMaxColumns());
  }
  // Siempre actualizar fila 1 para reflejar columnas nuevas (ej. Min_G [→ Contexto_Base_Web.md §02B028]
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  applyHeaderStyle(sh, headers.length);
  // Nota en el encabezado de EndOfDayRank: el puesto empieza en 0 (un 2 es el
  // tercer puesto). Ver _notaEndOfDayRankGuerraLogs_(), 17_GuerraSheet.gs.
  _notaEndOfDayRankGuerraLogs_(sh);
  // Notas de las 3 columnas de avance (23-25): VACÍO = día sin cerrar, 0 = dato real.
  _asegurarColumnasGuerraLogs_(sh);
  Logger.log('[Setup] Guerra_Logs OK (' + headers.length + ' cols, incluye ProgressEarned/NumOfDefensesRemaining/ProgressEarnedFromDefenses/Tipo/Estado)');
}

// ----- Hoja Control (grid de métricas) -----

function _setupControl(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.CONTROL);
  if (sh.getLastRow() === 0 || sh.getRange(1,1).getValue() === '') {
    _buildControlHeaders(sh);
  }
  // 21-nov-2026 (PF286, punto 17 b): notas de columna; no pisa las puestas a mano.
  _aplicarNotasColumnasHoja_(sh, _definicionNotasColumnas_()[CFG.SHEETS.CONTROL], _filaEncabezadoNotas_(CFG.SHEETS.CONTROL));
  Logger.log('[Setup] Control OK');
}

function _buildControlHeaders(sh) {
  var maxCols = sh.getMaxColumns();
  var COL_TOTALES = _controlColTotales();

  if (maxCols < COL_TOTALES) {
    sh.insertColumnsAfter(maxCols, COL_TOTALES - maxCols);
  }

  _pintarEncabezadosControl(sh);
  _asegurarColumnasClanTagEstadoControl_(sh); // 13b-1 (17-nov-2026): Clan_Tag y Estado al final (122 y 123), también en una hoja nueva
}

/**
 * _controlColTotales() [→ Contexto_Base_Web.md §02B029]
 */
function _controlColTotales() {
  var COL_INICIO_GRID = 17;
  var total = COL_INICIO_GRID - 1;
  for (var m = 0; m < CONTROL_METRICAS.length; m++) total += CONTROL_METRICAS[m].ancho;
  return total;
}

/**
 * _pintarEncabezadosControl(sh) [→ Contexto_Base_Web.md §02B030]
 */
function _pintarEncabezadosControl(sh) {
  var COL_INICIO_GRID = 17; // FIX (03-ago-2026): 18 -> 17 (Jugador eliminada, ver fixedHeaders)
  var SEMANAS = ['Sem 1','Sem 2','Sem 3','Sem 4','Sem 5'];
  var DIAS_G  = ['J','V','S','D'];
  var COL_TOTALES = _controlColTotales();

  // A1:C2 queda vacío, combinado y centrado, SIN bordes — permite [→ Contexto_Base_Web.md §02B031]
  sh.getRange(1, 1, 2, 3).merge()
    .setValue('')
    .setBackground(CFG.COLORES.HEADER_BG)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBorder(false, false, false, false, false, false);

  // D1:P2 combinado y centrado: título con Temporada, Semana y Día [→ Contexto_Base_Web.md §02B032]
  sh.getRange(1, 4, 2, 13).merge()
    .setFormula(CFG.CONTROL_TITULO_FORMULA)
    .setBackground(CFG.COLORES.HEADER_BG)
    .setFontColor(CFG.COLORES.HEADER_FG)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  // Fila 1: nombre de cada métrica, ocupando TODO su ancho (incluye las [→ Contexto_Base_Web.md §02B033]
  var col = COL_INICIO_GRID;
  for (var m = 0; m < CONTROL_METRICAS.length; m++) {
    sh.getRange(1, col, 1, CONTROL_METRICAS[m].ancho).merge()
      .setValue(CONTROL_METRICAS[m].nombre)
      .setBackground(CFG.COLORES.HEADER_BG)
      .setFontColor(CFG.COLORES.HEADER_FG)
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    col += CONTROL_METRICAS[m].ancho;
  }

  // Fila 2: "Sem N" combinado cada 5 columnas (bloque de días), y luego, [→ Contexto_Base_Web.md §02B034]
  col = COL_INICIO_GRID;
  for (var m = 0; m < CONTROL_METRICAS.length; m++) {
    for (var s = 0; s < SEMANAS.length; s++) {
      sh.getRange(2, col, 1, 5).merge()
        .setValue(SEMANAS[s])
        .setBackground(CFG.COLORES.HEADER_BG)
        .setFontColor(CFG.COLORES.HEADER_FG)
        .setFontWeight('bold')
        .setHorizontalAlignment('center');
      col += 5;
    }
    // Columnas agregadas (Total/%/Prom): fila 2 ya NO lleva el rótulo de [→ Contexto_Base_Web.md §02B035]
    var extras = CONTROL_METRICAS[m].extras;
    if (extras.length > 0) {
      var celdaResumen = (extras.length > 1)
        ? sh.getRange(2, col, 1, extras.length).merge()
        : sh.getRange(2, col, 1, 1);
      celdaResumen.setValue('Resumen')
        .setBackground(CFG.COLORES.HEADER_BG)
        .setFontColor(CFG.COLORES.HEADER_FG)
        .setFontWeight('bold')
        .setHorizontalAlignment('center')
        .setVerticalAlignment('middle');
      col += extras.length;
    }
  }

  // Fila 3: encabezados fijos [→ Contexto_Base_Web.md §02B036]
  var fixedHeaders = ['N°','Tag','Nombre','Nom_Multi','Clan','Rango','Iniciales',
                      'Celular','Nivel','Copas','V_Guerra','Permiso',
                      'Días inactivo','Alerta','Ataques pendientes','Ascenso'];
  sh.getRange(3, 1, 1, fixedHeaders.length).setValues([fixedHeaders])
    .setBackground(CFG.COLORES.HEADER_BG)
    .setFontColor(CFG.COLORES.HEADER_FG)
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  // Fila 3: día de cada columna del bloque de semanas (J/V/S/D/Tsem), y [→ Contexto_Base_Web.md §02B037]
  col = COL_INICIO_GRID;
  for (var m = 0; m < CONTROL_METRICAS.length; m++) {
    for (var s = 0; s < SEMANAS.length; s++) {
      for (var d = 0; d < 5; d++) {
        var valorDia = (d < 4) ? DIAS_G[d] : ('Tₛ' + (s + 1));
        sh.getRange(3, col)
          .setValue(valorDia)
          .setBackground(CFG.COLORES.HEADER_BG)
          .setFontColor(CFG.COLORES.HEADER_FG)
          .setFontWeight('bold')
          .setHorizontalAlignment('center');
        col++;
      }
    }
    var extrasFila3 = CONTROL_METRICAS[m].extras;
    for (var e3 = 0; e3 < extrasFila3.length; e3++) {
      sh.getRange(3, col)
        .setValue(extrasFila3[e3])
        .setBackground(CFG.COLORES.HEADER_BG)
        .setFontColor(CFG.COLORES.HEADER_FG)
        .setFontWeight('bold')
        .setHorizontalAlignment('center');
      col++;
    }
  }

  sh.setFrozenRows(3);

  // Borde blanco en todas las celdas de las filas de encabezado (1-3)
  // para que los headers tengan el mismo aspecto que el resto de hojas
  var COLOR_BORDE_HEADER = '#ffffff';
  sh.getRange(1, 1, 3, COL_TOTALES)
    .setBorder(true, true, true, true, true, true,
               COLOR_BORDE_HEADER, SpreadsheetApp.BorderStyle.SOLID);

  // A1:C2 debe quedar SIN bordes (ver comentario más arriba) — se limpia
  // aquí, después del borde general, para que no lo sobreescriba.
  sh.getRange(1, 1, 2, 3).setBorder(false, false, false, false, false, false);
}

// ----- Hojas de seguimiento (historial, pendientes, calendarios, inactivos, vetados, mensajes) -----

// Historial: N°|Fecha|Tag|Nombre|Movimiento|Clan|ClanTag (7 columnas propias + 5 de Temporada/Semana/Día desde el 26-oct-2026, §PF267) - Nombre = nombre en juego del jugador [→ Contexto_Base_Web.md §02B038]
function _setupHistorial(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.HISTORIAL);
  var headers = ['N°','Fecha','Tag','Nombre','Movimiento','Clan','ClanTag'];
  if (sh.getLastRow() === 0 || sh.getRange(1,1).getValue() === '') {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  applyHeaderStyle(sh, headers.length);
  // 26-oct-2026 (pedido de la usuaria, §PF267): 5 columnas más al final (Temporada, Temporada RoyaleAPI, Temporada Supercell, Semana, Día), calculadas desde Fecha.
  // Se completan también las filas que ya existían (la hoja puede venir de antes de este cambio).
  _completarTSDEnHoja_(sh, 2, HISTORIAL_TSD_COL);
  Logger.log('[Setup] Historial OK (12 cols)');
}

function _setupPendientes(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.PENDIENTES);
  // Nom_Multi (agregada 06-ago-2026, a la derecha de Nombre): mismo campo [→ Contexto_Base_Web.md §02B039]
  var headers = ['N°','Tag','Nombre','Nom_Multi','Préstamo','Clan','Faltantes','Celular','WSP','RoyaleAPI'];
  if (sh.getLastRow() === 0 || sh.getRange(1,1).getValue() === '') {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    // MIGRACIÓN: si la hoja ya existía SIN la columna Nom_Multi, se [→ Contexto_Base_Web.md §02B040]
    var headerCol4 = String(sh.getRange(1, 4).getValue() || '').trim();
    if (headerCol4 !== 'Nom_Multi') {
      sh.insertColumnsAfter(3, 1);
      Logger.log('[Setup] Pendientes: columna Nom_Multi insertada en la posición 4 (migración).');
    }
    // MIGRACIÓN: si la hoja ya existía SIN la columna Préstamo, se inserta [→ Contexto_Base_Web.md §02B041]
    var headerCol5 = String(sh.getRange(1, 5).getValue() || '').trim();
    if (headerCol5 !== 'Préstamo') {
      sh.insertColumnsAfter(4, 1);
      Logger.log('[Setup] Pendientes: columna Préstamo insertada en la posición 5 (migración).');
    }
    // MIGRACIÓN (13-ago-2026): si la hoja ya existía SIN la columna [→ Contexto_Base_Web.md §02B042]
    var headerCol10 = String(sh.getRange(1, 10).getValue() || '').trim();
    if (headerCol10 !== 'RoyaleAPI') {
      sh.insertColumnsAfter(9, 1);
      Logger.log('[Setup] Pendientes: columna RoyaleAPI insertada en la posición 10 (migración).');
    }
    // Siempre reescribir la fila de encabezados (igual criterio que [→ Contexto_Base_Web.md §02B043]
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  applyHeaderStyle(sh, headers.length);
  // Ocultas por defecto: ver comentarios de las columnas más arriba.
  try { sh.hideColumns(4); } catch (e) {}
  try { sh.hideColumns(5); } catch (e) {}
  // 21-nov-2026 (PF286, punto 17 b): notas de columna; no pisa las puestas a mano.
  _aplicarNotasColumnasHoja_(sh, _definicionNotasColumnas_()[CFG.SHEETS.PENDIENTES]);
  Logger.log('[Setup] Pendientes OK');
}

function _setupCalendario(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.CALENDARIO);
  if (sh.getLastRow() === 0) {
    sh.getRange(2, 2, 1, 9).merge().setValue('Calendario de temporada')
      .setBackground(null)
      .setFontColor('#000000')
      .setFontWeight('bold')
      .setFontStyle('italic')
      .setFontSize(14)
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');
  }
  Logger.log('[Setup] Calendario OK');
}

function _setupCalendario2(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.CALENDARIO2);
  var headers = ['N°','Fecha','Temporada','Semana','Día','Nota'];
  if (sh.getLastRow() === 0 || sh.getRange(1,1).getValue() === '') {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  applyHeaderStyle(sh, headers.length);
  Logger.log('[Setup] Calendario_2 OK');
}

function _setupComentarios(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.COMENTARIOS);
  // FIX (26-ago-2026, pedido explícito del usuario): la columna 5 vuelve de [→ Contexto_Base_Web.md §02B044]
  var headers = ['N°','Fecha','Tag','Nombre','Nom_Multi','ClanTag','Clan','Rango','Líder','Comentario'];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  applyHeaderStyle(sh, headers.length);
  // 26-oct-2026 (pedido de la usuaria, §PF267): 5 columnas más al final (Temporada, Temporada RoyaleAPI, Temporada Supercell, Semana, Día), calculadas desde Fecha.
  _completarTSDEnHoja_(sh, CMC.FECHA, CMC.TSD);
  Logger.log('[Setup] Comentarios OK (15 cols)');
}

function _setupInactivos(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.INACTIVOS);
  // Inactivos: 29 columnas propias (ver IC arriba), el mismo set de campos [→ Contexto_Base_Web.md §02B045]
  var headers = [
    'N°','Tag','Nombre','Jugador','Nom_Multi','Préstamo','Multicuenta',
    'Clan','ClanTag','Rango','Líder','Prefijo','Celular','WSP(G)','Etiqueta',
    'Permiso','Iniciales','Estado','Admin','Vetado','Razón',
    'Fecha_ing','Fecha_lim','Vigencia','Inactividad(d)','Alerta','Ranking','Ranking_p',
    'Comentario'
  ];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  applyHeaderStyle(sh, headers.length);
  // Jugador (col 4): se oculta automáticamente (el dato se sigue guardando
  // en la hoja, solo se oculta la columna visualmente).
  sh.hideColumns(IC.JUGADOR);
  Logger.log('[Setup] Inactivos OK (29 cols, Jugador oculta)');
}

function _setupVetados(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.VETADOS);
  // FIX (26-ago-2026, pedido explícito del usuario): la columna 4 vuelve de [→ Contexto_Base_Web.md §02B046]
  var headers = ['N°','Tag','Nombre','Nom_Multi','Clan','Rango','Iniciales','Permiso','Estado','Razón','Autor','Vía','Fecha','Clan_Tag']; // 6-nov-2026 (tanda 7, Clanes por Tag): Clan_Tag al final
  if (sh.getMaxColumns() < headers.length) sh.insertColumnsAfter(sh.getMaxColumns(), headers.length - sh.getMaxColumns());
  // Se reescriben SIEMPRE las 14 columnas (headers.length === VETADOS_TOTAL_COLS) [→ Contexto_Base_Web.md §02B047]
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  applyHeaderStyle(sh, headers.length);

  // Formato de fecha visible dd/mm/yyyy HH:mm:ss (24h) para la columna [→ Contexto_Base_Web.md §02B048]
  var numFilasVet = sh.getLastRow() - 1;
  if (numFilasVet >= 1) {
    sh.getRange(2, VC.FECHA, numFilasVet, 1).setNumberFormat('dd/mm/yyyy hh:mm:ss');
  }

  Logger.log('[Setup] Vetados OK (14 cols)');
}

// Multicuentas: 15 columnas [→ Contexto_Base_Web.md §02B049]
function _setupMulticuentas(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.MULTICUENTAS);
  var headers = ['N°','Tag','Nombre','Nom_Multi','Préstamo','Clan','Rango',
                 'Nivel','Copas','V_Guerra','Iniciales','Permiso',
                 'Inactividad(d)','Alerta','Estado'];
  if (sh.getLastRow() === 0 || sh.getRange(1,1).getValue() === '') {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  applyHeaderStyle(sh, headers.length);
  Logger.log('[Setup] Multicuentas OK (15 cols)');
}

// Ascensos (hoja física "Historial_A/D", ver CFG.SHEETS.ASCENSOS): 18 (más 5 de Temporada/Semana/Día desde el 26-oct-2026, §PF267, y la columna 24 Par_CR desde el 28-oct-2026, §PF286) [→ Contexto_Base_Web.md §02B052]
function _setupAscensosSheet(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.ASCENSOS);
  // FASE 5 (13-sep-2026, pedido del usuario, plan de Cambio de Rango): se [→ Contexto_Base_Web.md §02B053]
  var headers = ['N°','Tag','Nombre','Nom_Multi','Iniciales','Permiso',
                 'Inactividad(d)','Fecha','Clan','ClanTag','Líder','Autor',
                 'Rango','Rango_2','Tipo','Estado','Comentario','Estado_Propuesta'];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  applyHeaderStyle(sh, headers.length);
  sh.setColumnWidth(8, 180);   // Fecha
  sh.setColumnWidth(17, 260);  // Comentario
  // 26-oct-2026 (pedido de la usuaria, §PF267): 5 columnas más al final (Temporada, Temporada RoyaleAPI, Temporada Supercell, Semana, Día), calculadas desde Fecha.
  _completarTSDEnHoja_(sh, ASC.FECHA, ASC.TSD);
  // 28-oct-2026 (PF286): columna 24 con el id del par de CR_Lista que generó cada propuesta.
  _asegurarColumnaParCRAscensos_(sh);
  // 21-nov-2026 (PF286, punto 17 b): notas de columna; no pisa las puestas a mano.
  _aplicarNotasColumnasHoja_(sh, _definicionNotasColumnas_()[CFG.SHEETS.ASCENSOS]);
  Logger.log('[Setup] Ascensos OK (24 cols)');
}

function _setupAdministradores(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.ADMINISTRADORES);
  // Administradores (12/07/2026): DEJÓ de ser un espejo de Directorio. [→ Contexto_Base_Web.md §02B054]
  var headers = [
    'N°','Tag','Nombre','Nom_Multi','Préstamo','Clan','ClanTag','Rango','Líder',
    'Prefijo','Celular','WSP(G)','Estado','Admin','Vetado','Razón',
    'Vigencia','Inactividad(d)','Alerta','Cat_disp','Funciones',
    // Clanes_Admin (col 22): CALCULADA. Ver _getClanesAdminTexto() en
    // 01_Config_Global.gs y ADMIN_FAMILIA_JSON (Script Property). No editar a mano.
    'Clanes_Admin',
    // Clave (col 23): contraseña de login web EN TEXTO PLANO, autogenerada [→ Contexto_Base_Web.md §02B055]
    'Clave',
    // Clave_Hash (col 24): NUEVO (15-sep-2026). Hash SHA-256 de la Clave [→ Contexto_Base_Web.md §02B056]
    'Clave_Hash'
  ];
  // Siempre actualizar fila 1 (13/07/2026, reorden Estado/Admin/Vetado/Razón [→ Contexto_Base_Web.md §02B057]
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  applyHeaderStyle(sh, headers.length);
  sh.protect().setWarningOnly(true);
  Logger.log('[Setup] Administradores OK (24 cols)');
}

function _setupMensajes(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.MENSAJES);
  // Nueva estructura: N° | Fecha | Temporada | Semana | Dia | PeriodIndex |
  //                  N1° | Categoría | N2° | Subcategoría | N3° | Clan | Rango | Tipo | Contenido
  var headers = ['N°','Fecha','Temporada','Semana','Dia','PeriodIndex',
                 'N1°','Categoría','N2°','Subcategoría','N3°','Clan','Rango','Tipo','Contenido','Clan_Tag']; // 6-nov-2026 (tanda 7, Clanes por Tag): Clan_Tag despues de Contenido
  if (sh.getMaxColumns() < headers.length) sh.insertColumnsAfter(sh.getMaxColumns(), headers.length - sh.getMaxColumns());
  // FIX (28-sep-2026, pedido del usuario -- "en la hoja Mensajes se borro el encabezado de la [→ Contexto_Base_Web.md §02B058]
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  applyHeaderStyle(sh, headers.length);
  _aplicarSubindiceEncabezados(sh);
  sh.setColumnWidth(MC.CONTENIDO, 428); // Contenido: ancho fijo, texto largo (428px, pedido usuario 14-ago-2026); 6-nov-2026 (tanda 7, Clanes por Tag): antes headers.length (Contenido era la ultima)
  // 21-nov-2026 (PF286, punto 17 b): notas de columna; no pisa las puestas a mano.
  _aplicarNotasColumnasHoja_(sh, _definicionNotasColumnas_()[CFG.SHEETS.MENSAJES]);
  Logger.log('[Setup] Mensajes OK (16 cols, encabezados al dia)');
}

// ----- Torneos, sorteos y cambio de rango: listas, encabezados y filtros -----

/**
 * _setupTLista(ss) [→ Contexto_Base_Web.md §02B066]
 */
function _setupTLista(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.T_LISTA);
  // FASE 2 (25-sep-2026, rediseño T_Lista -- ver docblock del objeto TL en [→ Contexto_Base_Web.md §02B067]
  var columnas = [
    { label: 'Planificación, registro y modificación de torneos', subs: [
        // Orden nuevo (29-oct-2026, pedido de la usuaria); debe coincidir con TL en 26_Torneos_Core.gs
        'N°', 'Temporada', 'Fecha', 'Hora', 'ID', 'Creación', 'Semanas',
        'Tag_Tor', 'Tag_Tor_2', 'Nombre_Org', 'Nom_Multi_Org', 'Tag_org',
        'Clan', 'ClanTag', 'Organizador_Fuente', 'Nombre', 'Tipo', 'Contraseña',
        'Nivel_tope', 'Participantes', 'Capacidad', 'Modo_ID', 'Modo',
        'Preparación', 'Duración', 'Premios', 'Estado'
    ] },
    { label: 'Min_T', subs: ['C1', 'C2', 'C3', 'C4'] },
    { label: 'Ataques', subs: ['C1', 'C2', 'C3', 'C4'] },
    { label: 'Otros requisitos', subs: [
        // FIX (12-sep-2026, pedido del usuario -- requisito nuevo "Barcos"): [→ Contexto_Base_Web.md §02B068]
        'Barcos', 'Miembro activo', 'Reacción', 'WhatsApp', 'Descripción', 'Comentario', 'Link_app', 'Link_json', 'Link_json_2'
    ] }
  ];
  var totalCols = _aplicarHeaderDosFilas(sh, columnas);
  // FIX (31/08/2026, pedido del usuario — sugerencia #1 de la lista de [→ Contexto_Base_Web.md §02B069]
  sh.getRange(2, TL.ID).setNote('No editar a mano. El ID se genera automáticamente al procesar el torneo (ver procesarTListaNuevasFilas(), 26_Torneos_Core.gs). Al agregar un torneo nuevo, dejar esta columna en blanco — igual que Tag_Tor, Contraseña, Organizador, Tag_org, Clan, ClanTag y Link_json.');
  _protegerSoloAdvertencia(sh);
  // Desplegable fijo de Estado ("Planificado"/"Realizado") — ver [→ Contexto_Base_Web.md §02B070]
  _aplicarDropdownEstadoTLista(ss);
  // FIX (08-sep-2026, corrección de desincronización): faltaban estas 2 [→ Contexto_Base_Web.md §02B071]
  _aplicarDropdownMiembroActivoTLista(ss);
  _aplicarDropdownReaccionTLista(ss);
  // FIX (12-sep-2026, pedido del usuario -- consolidado, sección 1 cierre [→ Contexto_Base_Web.md §02B072]
  _aplicarDropdownWhatsappTLista(ss);
  // FIX (09-sep-2026, pedido usuario): filtro nativo en fila 2 (nunca en
  // la 1) -- ver _aplicarFiltroFila2() más arriba en este archivo.
  _aplicarFiltroFila2(sh, 'T_Lista');
  _aplicarFormatoMilesHoja_(sh, 3, TL_COLS_MILES); // separador de miles solo de visualización (29-oct-2026)
  Logger.log('[Setup] T_Lista OK (' + totalCols + ' columnas, header 2 filas, filtro en fila 2)');
}

/**
 * _setupSLista(ss) [→ Contexto_Base_Web.md §02B073]
 */
function _setupSLista(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.S_LISTA);
  var columnas = [
    { label: 'Planificación, registro y modificación de Sorteos', subs: [
        'N°', 'Temporada', 'Fecha', 'Hora', 'ID', 'ID_2', 'Organizador',
        'Tag_org', 'Clan', 'ClanTag', 'Premios', 'Semanas'
    ] },
    { label: 'Min_S', subs: ['C1', 'C2', 'C3', 'C4', 'Delta'] },
    { label: 'Ataques', subs: ['C1', 'C2', 'C3', 'C4'] },
    { label: 'Torneos', subs: ['C1', 'C2', 'C3', 'C4'] },
    { label: 'Otros requisitos', subs: [
        // FIX (12-sep-2026, pedido del usuario -- requisito nuevo "Barcos"): [→ Contexto_Base_Web.md §02B074]
        'Barcos', 'Miembro activo', 'Reacción', 'WhatsApp', 'Estado', 'Comentario'
    ] }
  ];
  var totalCols = _aplicarHeaderDosFilas(sh, columnas);
  _protegerSoloAdvertencia(sh);
  // PF109 (18-oct-2026): la columna Hora de S_Lista queda como hora sin fecha (antes nadie le ponía formato y aparecía «30/12/1899 20:00:00»). [→ Contexto_Base_Web.md §PF109]
  _normalizarHoraSLista(sh);
  // Desplegables fijo/dinámico — ver docblocks de las 4 funciones [→ Contexto_Base_Web.md §02B075]
  _aplicarDropdownId2SLista(ss);
  _aplicarDropdownEstadoSLista(ss);
  _aplicarDropdownMiembroActivoSLista(ss);
  _aplicarDropdownReaccionSLista(ss);
  // FIX (12-sep-2026, pedido del usuario -- consolidado, sección 1 cierre [→ Contexto_Base_Web.md §02B076]
  _aplicarDropdownWhatsappSLista(ss);
  // FIX (09-sep-2026, pedido usuario): filtro nativo en fila 2 (nunca en
  // la 1) -- ver _aplicarFiltroFila2() más arriba en este archivo.
  _aplicarFiltroFila2(sh, 'S_Lista');
  _aplicarFormatoMilesHoja_(sh, 3, SL_COLS_MILES); // separador de miles solo de visualización (29-oct-2026)
  Logger.log('[Setup] S_Lista OK (' + totalCols + ' columnas, header 2 filas, filtro en fila 2)');
}

/**
 * _setupCRLista(ss) [→ Contexto_Base_Web.md §02B077]
 */
function _setupCRLista(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.CR_LISTA);
  var columnas = [
    { label: 'Planificación, registro y modificación de cambio de rango', headers: [
        'N°', 'Temporada', 'Semanas', 'Fecha', 'Hora', 'ID', 'Organizador',
        'Tag_org', 'Clan', 'ClanTag', 'Tipo'
    ] },
    { label: 'Min_CR', grupos: [
        { sub: 'Miembro',  subs: ['C1', 'C2', 'C3', 'C4'] },
        { sub: 'Veterano', subs: ['C1', 'C2', 'C3', 'C4'] },
        { sub: 'Colider',  subs: ['C1', 'C2', 'C3', 'C4'] }
    ] },
    { label: 'Ataques', grupos: [
        { sub: 'Miembro',  subs: ['C1', 'C2', 'C3', 'C4'] },
        { sub: 'Veterano', subs: ['C1', 'C2', 'C3', 'C4'] },
        { sub: 'Colider',  subs: ['C1', 'C2', 'C3', 'C4'] }
    ] },
    { label: 'Otros requisitos', headers: [
        'Barcos', 'Miembro activo', 'WhatsApp', 'Estado', 'Comentario'
    ] }
  ];
  var totalCols = _aplicarHeaderTresFilas(sh, columnas);
  _protegerSoloAdvertencia(sh);
  _aplicarDropdownTipoCRLista(ss);
  _aplicarDropdownEstadoCRLista(ss);
  _aplicarFiltroFila3(sh, 'CR_Lista');
  _aplicarFormatoMilesHoja_(sh, 4, CR_COLS_MILES); // separador de miles solo de visualización (29-oct-2026)
  Logger.log('[Setup] CR_Lista OK (' + totalCols + ' columnas, header 3 filas, filtro en fila 3)');
}

/**
 * _aplicarHeaderDosFilas(sh, columnas) [→ Contexto_Base_Web.md §02B059]
 */
function _aplicarHeaderDosFilas(sh, columnas) {
  var fila1 = [];
  var fila2 = [];
  var mergesGrupo = []; // {col, span} -- merge horizontal en fila 1
  var mergesSimple = []; // {col} -- merge vertical (fila1:fila2) en columnas simples
  var col = 1;

  columnas.forEach(function (c) {
    if (typeof c === 'string') {
      fila1.push(c);
      fila2.push('');
      mergesSimple.push(col);
      col += 1;
    } else {
      fila1.push(c.label);
      for (var k = 1; k < c.subs.length; k++) fila1.push('');
      c.subs.forEach(function (s) { fila2.push(s); });
      mergesGrupo.push({ col: col, span: c.subs.length });
      col += c.subs.length;
    }
  });

  var totalCols = fila1.length;
  // FASE 2 (25-sep-2026, rediseño T_Lista): rompe CUALQUIER merge existente [→ Contexto_Base_Web.md §02B060]
  var anchoActual = Math.max(totalCols, sh.getMaxColumns());
  sh.getRange(1, 1, 2, anchoActual).breakApart();
  sh.getRange(1, 1, 1, totalCols).setValues([fila1]);
  sh.getRange(2, 1, 1, totalCols).setValues([fila2]);

  mergesGrupo.forEach(function (m) {
    sh.getRange(1, m.col, 1, m.span).merge();
  });
  mergesSimple.forEach(function (c) {
    sh.getRange(1, c, 2, 1).merge();
  });

  // Estilo: mismo criterio visual que applyHeaderStyle() (04_Formato_Comun.gs), [→ Contexto_Base_Web.md §02B061]
  var rangoHeader = sh.getRange(1, 1, 2, totalCols);
  rangoHeader.setBackground(CFG.COLORES.HEADER_BG)
    .setFontColor(CFG.COLORES.HEADER_FG)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBorder(true, true, true, true, true, true, '#ffffff', SpreadsheetApp.BorderStyle.SOLID);
  sh.setFrozenRows(2);

  return totalCols;
}

/**
 * _aplicarHeaderTresFilas(sh, columnas) [→ Contexto_Base_Web.md §02B062]
 */
function _aplicarHeaderTresFilas(sh, columnas) {
  var fila1 = [];
  var fila2 = [];
  var fila3 = [];
  var mergesFila1 = [];   // {col, span} -- merge horizontal en fila 1 (bloques de 2 niveles)
  var mergesSimple = [];  // {col, span} -- merge horizontal+vertical fila1:fila2 (bloques simples)
  var mergesSub = [];     // {col, span} -- merge horizontal en fila 2 (cada `sub` de un bloque de 2 niveles)
  var col = 1;

  columnas.forEach(function (c) {
    if (c.headers) {
      // Bloque simple: label fusionado 2x(headers.length), headers reales en fila 3.
      fila1.push(c.label);
      for (var k = 1; k < c.headers.length; k++) fila1.push('');
      c.headers.forEach(function () { fila2.push(''); });
      c.headers.forEach(function (h) { fila3.push(h); });
      mergesSimple.push({ col: col, span: c.headers.length });
      col += c.headers.length;
    } else {
      // Bloque de 2 niveles: label en fila 1 (ancho total), sub-rótulos en
      // fila 2 (uno por grupo), subs (C1-C4) en fila 3.
      var anchoTotal = 0;
      c.grupos.forEach(function (g) { anchoTotal += g.subs.length; });
      fila1.push(c.label);
      for (var j = 1; j < anchoTotal; j++) fila1.push('');
      mergesFila1.push({ col: col, span: anchoTotal });

      var colSub = col;
      c.grupos.forEach(function (g) {
        fila2.push(g.sub);
        for (var m = 1; m < g.subs.length; m++) fila2.push('');
        g.subs.forEach(function (s) { fila3.push(s); });
        mergesSub.push({ col: colSub, span: g.subs.length });
        colSub += g.subs.length;
      });
      col += anchoTotal;
    }
  });

  var totalCols = fila1.length;
  sh.getRange(1, 1, 1, totalCols).setValues([fila1]);
  sh.getRange(2, 1, 1, totalCols).setValues([fila2]);
  sh.getRange(3, 1, 1, totalCols).setValues([fila3]);

  mergesSimple.forEach(function (m) {
    sh.getRange(1, m.col, 2, m.span).merge();
  });
  mergesFila1.forEach(function (m) {
    sh.getRange(1, m.col, 1, m.span).merge();
  });
  mergesSub.forEach(function (m) {
    sh.getRange(2, m.col, 1, m.span).merge();
  });

  // Mismo criterio visual que _aplicarHeaderDosFilas(), pero sobre 3 filas [→ Contexto_Base_Web.md §02B063]
  var rangoHeader = sh.getRange(1, 1, 3, totalCols);
  rangoHeader.setBackground(CFG.COLORES.HEADER_BG)
    .setFontColor(CFG.COLORES.HEADER_FG)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBorder(true, true, true, true, true, true, '#ffffff', SpreadsheetApp.BorderStyle.SOLID);
  sh.setFrozenRows(3);

  return totalCols;
}

/**
 * _aplicarFiltroFila2(sh, nombreHoja) [→ Contexto_Base_Web.md §02B064]
 */
function _aplicarFiltroFila2(sh, nombreHoja) {
  try {
    if (sh.getFilter()) { sh.getFilter().remove(); }
    var lastRow = Math.max(sh.getLastRow(), 2);
    var lastCol = sh.getLastColumn();
    if (lastCol < 1) return;
    sh.getRange(2, 1, lastRow - 1, lastCol).createFilter();
    Logger.log('[Filtros] Filtro aplicado en fila 2: ' + nombreHoja);
  } catch (e) {
    Logger.log('[Filtros] Error al crear el filtro en fila 2 de ' + nombreHoja + ': ' + e.message);
  }
}

/**
 * _aplicarFiltroFila3(sh, nombreHoja) [→ Contexto_Base_Web.md §02B065]
 */
function _aplicarFiltroFila3(sh, nombreHoja) {
  try {
    if (sh.getFilter()) { sh.getFilter().remove(); }
    var lastRow = Math.max(sh.getLastRow(), 3);
    var lastCol = sh.getLastColumn();
    if (lastCol < 1) return;
    sh.getRange(3, 1, lastRow - 2, lastCol).createFilter();
    Logger.log('[Filtros] Filtro aplicado en fila 3: ' + nombreHoja);
  } catch (e) {
    Logger.log('[Filtros] Error al crear el filtro en fila 3 de ' + nombreHoja + ': ' + e.message);
  }
}

/**
 * _aplicarDropdownTipoCRLista(ss) [→ Contexto_Base_Web.md §02B078]
 */
function _aplicarDropdownTipoCRLista(ss) {
  try {
    var sh = ss.getSheetByName(CFG.SHEETS.CR_LISTA);
    if (!sh) return;
    var colTipo = 11; // K: N°(1) Temporada(2) Semanas(3) Fecha(4) Hora(5) ID(6) Organizador(7) Tag_org(8) Clan(9) ClanTag(10) Tipo(11)
    var lastRow = Math.max(sh.getMaxRows(), 4);
    var regla = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Ascenso', 'Descenso'], true)
      .setAllowInvalid(false)
      .build();
    sh.getRange(4, colTipo, lastRow - 3, 1).setDataValidation(regla);
    Logger.log('[Setup] CR_Lista: dropdown de Tipo (Ascenso/Descenso) aplicado.');
  } catch (e) {
    Logger.log('[Setup] Error al aplicar dropdown de Tipo en CR_Lista: ' + e.message);
  }
}

/**
 * _aplicarDropdownEstadoCRLista(ss) [→ Contexto_Base_Web.md §02B079]
 */
function _aplicarDropdownEstadoCRLista(ss) {
  try {
    var sh = ss.getSheetByName(CFG.SHEETS.CR_LISTA);
    if (!sh) return;
    var colEstado = 39; // Barcos(36) Miembro_activo(37) WhatsApp(38) Estado(39) Comentario(40)
    var lastRow = Math.max(sh.getMaxRows(), 4);
    var regla = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Planificado', 'Realizado'], true)
      .setAllowInvalid(false)
      .build();
    sh.getRange(4, colEstado, lastRow - 3, 1).setDataValidation(regla);
    Logger.log('[Setup] CR_Lista: dropdown de Estado (Planificado/Realizado) aplicado.');
  } catch (e) {
    Logger.log('[Setup] Error al aplicar dropdown de Estado en CR_Lista: ' + e.message);
  }
}

// ----- Torneos y sorteos: asistencia, control y resoluciones -----

/**
 * _setupTAsistencia(ss) [→ Contexto_Base_Web.md §02B080]
 */
function _setupTAsistencia(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.T_ASISTENCIA);
  var headers = ['N°', 'Fecha', 'ID', 'Temporada', 'Tag', 'Nombre', 'Nom_Multi',
                  'Préstamo', 'ClanTag', 'Clan', 'Puesto', 'Victorias'];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  applyHeaderStyle(sh, headers.length);
  _protegerSoloAdvertencia(sh);
  Logger.log('[Setup] T_Asistencia OK');
}

/**
 * _setupTControl(ss) [→ Contexto_Base_Web.md §02B084]
 */
function _setupTControl(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.T_CONTROL);
  sh.clearContents();

  var headers = ['N°', 'Tag', 'Nombre', 'Nom_Multi', 'Préstamo', 'ClanTag', 'Clan'];
  var rangoHeaders = sh.getRange(3, 1, 1, headers.length);
  rangoHeaders.setValues([headers])
    .setBackground(CFG.COLORES.HEADER_BG)
    .setFontColor(CFG.COLORES.HEADER_FG)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setBorder(true, true, true, true, true, true, '#ffffff', SpreadsheetApp.BorderStyle.SOLID);
  sh.setFrozenRows(3);

  // Filas 1 y 2 (supercategoría "Torneos" y categorías "T_"&Temporada) se [→ Contexto_Base_Web.md §02B085]

  _protegerSoloAdvertencia(sh);
  Logger.log('[Setup] T_Control OK');
}

/**
 * _setupTResoluciones(ss) [→ Contexto_Base_Web.md §02B086]
 */
function _setupTResoluciones(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.T_RESOLUCIONES);
  var headers = ['IdTorneo', 'Tag', 'Nombre', 'Puesto_Original', 'Tipo_Resolucion',
                  'Puesto_Final', 'Motivo', 'Registrado_Por', 'Fecha_Registro'];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  applyHeaderStyle(sh, headers.length);
  sh.getRange(1, TR.NOMBRE).setNote('Informativa. Se refresca sola desde el Directorio cada vez que se guarda una resolución — no editar a mano.');
  sh.getRange(1, TR.PUESTO_ORIGINAL).setNote('El puesto que le tocaba por Victorias crudas, antes de esta resolución. Se calcula solo, no editar a mano.');
  _protegerSoloAdvertencia(sh);
  Logger.log('[Setup] T_Resoluciones OK');
}

/**
 * _setupSAsistencia(ss) [→ Contexto_Base_Web.md §02B081]
 */
function _setupSAsistencia(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.S_ASISTENCIA);
  var headers = ['N°', 'Fecha', 'ID', 'Temporada', 'Tag', 'Nombre', 'Nom_Multi',
                  'Préstamo', 'ClanTag', 'Clan', 'Tickets', 'Premio', 'Resultado', 'Razón', 'Ganó'];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  applyHeaderStyle(sh, headers.length);

  // Dropdown de Resultado (columna 13, SA.RESULTADO en 26_Torneos_Core.gs) -- [→ Contexto_Base_Web.md §02B082]
  var ultimaFila = Math.max(sh.getLastRow(), 200);
  var valoresResultado = [CFG.SORTEOS_RESULTADO_TIPOS.CALIFICA, CFG.SORTEOS_RESULTADO_TIPOS.NO_CALIFICA];
  var dvResultado = SpreadsheetApp.newDataValidation().requireValueInList(valoresResultado, true).setAllowInvalid(false).build();
  sh.getRange(2, SA.RESULTADO, ultimaFila - 1, 1).setDataValidation(dvResultado);

  // Razón (columna 14, SA.RAZON): dropdown RESUELTO (10-sep-2026, ver [→ Contexto_Base_Web.md §02B083]
  var valoresRazon = [
    CFG.SORTEOS_RAZON_TIPOS.NO_WHATSAPP,
    CFG.SORTEOS_RAZON_TIPOS.NO_REACCION,
    CFG.SORTEOS_RAZON_TIPOS.NO_MIEMBRO_ACTIVO
  ];
  var dvRazon = SpreadsheetApp.newDataValidation().requireValueInList(valoresRazon, true).setAllowInvalid(false).build();
  sh.getRange(2, SA.RAZON, ultimaFila - 1, 1).setDataValidation(dvRazon);
  sh.getRange(1, SA.RAZON).clearNote();

  // PF222 (24-oct-2026): columna «Ganó» (15). Dropdown Sí/No; las filas que ya existían eran solo de ganadores, así que su Ganó vacío pasa a «Sí» (idempotente).
  var dvGano = SpreadsheetApp.newDataValidation().requireValueInList([SA_GANO_SI, SA_GANO_NO], true).setAllowInvalid(false).build();
  sh.getRange(2, SA.GANO, ultimaFila - 1, 1).setDataValidation(dvGano);
  if (sh.getLastRow() >= 2) {
    var rngId = sh.getRange(2, SA.ID, sh.getLastRow() - 1, 1).getValues();
    var rngGano = sh.getRange(2, SA.GANO, sh.getLastRow() - 1, 1);
    var valGano = rngGano.getValues();
    var cambio = false;
    for (var g = 0; g < valGano.length; g++) {
      if (String(valGano[g][0] || '').trim() === '' && String(rngId[g][0] || '').trim() !== '') { valGano[g][0] = SA_GANO_SI; cambio = true; }
    }
    if (cambio) rngGano.setValues(valGano);
  }

  _bordesDatosSAsistencia_(sh); // PF231: la columna «Ganó» (15) de las filas que ya existían no tenía bordes
  _ordenarYColorearSAsistencia_(ss); // 29-oct-2026: más reciente primero y un color por sorteo, como T_Asistencia

  _protegerSoloAdvertencia(sh);
  Logger.log('[Setup] S_Asistencia OK (estructura + dropdown de Resultado y de Razón)');
}

/**
 * PF231 (24-oct-2026, pedido de la usuaria): bordes y centrado en todas las filas de datos de S_Asistencia, columna «Ganó» incluida. Las filas nuevas ya
 * los reciben al escribirse (applyBorderCenter sobre SA_TOTAL_COLS), pero las que existían antes de PF222 tenían solo 14 columnas con bordes.
 */
function _bordesDatosSAsistencia_(sh) {
  var ultima = sh.getLastRow();
  if (ultima >= 2) applyBorderCenter(sh.getRange(2, 1, ultima - 1, SA_TOTAL_COLS));
}

// ----- Hojas restantes (jugadores, enlaces, alertas, conflictos, grupo verificado) -----

/**
 * _setupPlayers(ss) [→ Contexto_Base_Web.md §02B050]
 */
function _setupPlayers(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.PLAYERS);
  var headers = [
    'N°','Tag','Nombre','Nom_Multi','Préstamo','Clan','ClanTag','Rango',
    'Antigüedad','Nivel','Nivel2','Copas','Copas_max','Arena','V_Guerra',
    'Victorias','Derrotas','Batallas','Racha',
    'Camino de leyendas_Liga','Camino de leyendas_Trofeos','Camino de leyendas_Rango',
    'Victorias de tres coronas','Max_victorias_desafíos','Torneos','Emotes','Banners',
    'Cartas_desafíos','Cartas_torneos',
    'Donaciones_r','Donaciones_d'
  ];
  if (sh.getLastRow() === 0 || sh.getRange(1,1).getValue() === '') {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  applyHeaderStyle(sh, headers.length);
  Logger.log('[Setup] Players OK (31 cols)');
}

/**
 * _setupLinks(ss) [→ Contexto_Base_Web.md §02B051]
 */
function _setupLinks(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.LINKS);
  var headers = [
    'N°','Tag','Nombre','Nom_Multi','Préstamo','Clan','ClanTag','Rango',
    'WSP','RoyaleAPI','Mazo','Mazo2','CWStats','Render'
  ];
  if (sh.getLastRow() === 0 || sh.getRange(1,1).getValue() === '') {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  applyHeaderStyle(sh, headers.length);
  Logger.log('[Setup] Links OK (14 cols)');
}

/**
 * _setupAlertasHistorialGuerra(ss) [→ Contexto_Base_Web.md §02B012]
 */
function _setupAlertasHistorialGuerra(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.ALERTAS_HISTORIAL_GUERRA);
  var encabezados = AHG_ENCABEZADOS; // 20_HistorialGuerraJugador.gs
  if (sh.getMaxColumns() < encabezados.length) sh.insertColumnsAfter(sh.getMaxColumns(), encabezados.length - sh.getMaxColumns()); // 6-nov-2026 (tanda 7, Clanes por Tag)
  sh.getRange(1, 1, 1, encabezados.length).setValues([encabezados]);
  // FIX (23-ago-2026, pedido del usuario): mismo estilo que T_Lista — antes [→ Contexto_Base_Web.md §02B013]
  applyHeaderStyle(sh, encabezados.length);

  // Bordes grises + centrado sobre las filas de datos que ya existan (p.ej. [→ Contexto_Base_Web.md §02B014]
  if (sh.getLastRow() >= 2) {
    applyBorderCenter(sh.getRange(2, 1, sh.getLastRow() - 1, encabezados.length));
  }

  var opsEstado = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pendiente', 'Resuelto'], true).setAllowInvalid(false).build();
  // Rango amplio (hasta fila 2000) para que la validación ya cubra filas que [→ Contexto_Base_Web.md §02B015]
  sh.getRange(2, AHG.ESTADO, 1999, 1).setDataValidation(opsEstado);
}

/**
 * _setupConflictos(ss) [→ Contexto_Base_Web.md §02B087]
 */
function _setupConflictos(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.CONFLICTOS);
  var headers = ['Tag', 'Nombre', 'Motivo'];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  applyHeaderStyle(sh, headers.length);
  // FIX (04-sep-2026): usaba CC.NOMBRE/CC.MOTIVO (variable global de la hoja [→ Contexto_Base_Web.md §02B088]
  sh.getRange(1, CFC.NOMBRE).setNote('Solo informativo, no se usa para el match (el match es por Tag).');
  sh.getRange(1, CFC.MOTIVO).setNote('Texto libre: por qué se agregó este clan a la lista de conflicto.');
  if (sh.getLastRow() >= 2) {
    applyBorderCenter(sh.getRange(2, 1, sh.getLastRow() - 1, headers.length));
  }
  Logger.log('[Setup] Conflictos OK');
}

/**
 * _setupGrupoVerificado(ss) [→ Contexto_Base_Web.md §02B089]
 */
function _setupGrupoVerificado(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.GRUPO_VERIFICADO);
  var headers = ['Tag', 'Nombre', 'Fecha_Registro', 'Registrado_Por'];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  applyHeaderStyle(sh, headers.length);
  sh.getRange(1, GV.NOMBRE).setNote('Informativa, para auditar a simple vista. Se refresca sola al confirmar -- no editar a mano.');
  sh.getRange(1, GV.TAG).setNote('Estar en esta hoja YA ES la confirmación (no hay columna Sí/No). Para "desverificar" a alguien, borrar su fila.');
  _protegerSoloAdvertencia(sh);
  Logger.log('[Setup] Grupo_Verificado OK');
}

// ----- Notas de columna: texto de cada nota y mecanismo que las escribe -----

/**
 * _definicionNotasColumnas_() [→ Contexto_Base_Web.md §PF286]
 * Devuelve { nombre de hoja: [ { col, enc, texto } ] }. `col` sale de las constantes de columnas (ASC, etc.) para que la nota siga a su columna si se reordenan; `enc` es el encabezado que debe tener esa columna (si no coincide, la nota no se escribe); `texto` es lo que ve la usuaria, sin el prefijo.
 * Es una función y no una variable porque ASC vive en 13_Inactivos_Vetados.gs, que Apps Script carga después de este archivo. Para agregar otra hoja, sumar una clave aquí y llamar a _aplicarNotasColumnasHoja_() desde su _setup…() (o correr aplicarNotasColumnas()).
 * Cada afirmación del texto se contrastó con el código el 21-nov-2026 (24_Historial_Ascensos.gs, 37_Web_API.gs, 40_Web_Noticias.gs); si cambia cómo se escribe una columna, hay que cambiar también su nota.
 */
function _definicionNotasColumnas_() {
  var copia = 'Se copia del Directorio al crear la fila. Puede quedar vacío si la cuenta no estaba en el Directorio.';
  var defs = {};
  defs[CFG.SHEETS.ASCENSOS] = [
    { col: ASC.NUM, enc: 'N°',
      texto: 'Número de fila. Lo reasigna el sistema cada vez que ordena la hoja (por clan y luego por fecha), así que cambia con el tiempo. No lo edites.' },
    { col: ASC.TAG, enc: 'Tag',
      texto: 'Tag de la cuenta, copiado del Directorio al crear la fila. Con la Fecha forma el identificador con que la web busca esta fila: no lo edites.' },
    { col: ASC.NOMBRE, enc: 'Nombre',
      texto: 'Nombre de la cuenta. Se copia del Directorio al crear la fila.' },
    { col: ASC.NOM_MULTI, enc: 'Nom_Multi', texto: copia },
    { col: ASC.INICIALES, enc: 'Iniciales', texto: copia },
    { col: ASC.PERMISO, enc: 'Permiso', texto: copia },
    { col: ASC.INACTIVIDAD, enc: 'Inactividad(d)',
      texto: 'Días de inactividad que mostraba el Directorio al crear la fila. Puede quedar vacío si la cuenta no estaba en el Directorio.' },
    { col: ASC.FECHA, enc: 'Fecha',
      texto: 'Momento en que se registró el cambio o se creó la propuesta. Ordena las filas dentro de cada clan y de ella se calculan Temporada, Semana y Día. Con el Tag identifica la fila en la web: si la cambias a mano, esa fila deja de poder editarse desde la web. Edítala solo para corregir un error.' },
    { col: ASC.CLAN, enc: 'Clan',
      texto: 'Clan de la cuenta al crear la fila (en una propuesta, el que trae CR_Lista).' },
    { col: ASC.CLAN_TAG, enc: 'ClanTag', texto: copia },
    { col: ASC.LIDER, enc: 'Líder', texto: copia },
    { col: ASC.AUTOR, enc: 'Autor',
      texto: 'Quién generó la fila: el sistema escribe «Diana». Un admin con la función «Corregir autor» puede cambiarlo desde la web y entonces se agrega una línea de auditoría al Comentario. No lo edites a mano.' },
    { col: ASC.RANGO, enc: 'Rango',
      texto: 'Rango que tenía la cuenta antes del cambio. En una propuesta, el rango actual de la cuenta. La lista desplegable solo advierte: no bloquea otros valores.' },
    { col: ASC.RANGO_2, enc: 'Rango_2',
      texto: 'Rango que tiene la cuenta después del cambio, o al que se propone pasarla. Queda vacío en las expulsiones, en «Elegible Admin» y en «Ascenso de clan». La lista desplegable solo advierte: no bloquea otros valores.' },
    { col: ASC.TIPO, enc: 'Tipo',
      texto: 'Ascenso o Degradación en los cambios que el sistema detecta; en las propuestas de Cambio de rango también Expulsión, Elegible Admin y Ascenso de clan. Lo escribe el sistema; no lo edites.' },
    { col: ASC.ESTADO, enc: 'Estado',
      texto: 'Estado de la cuenta en el Directorio al crear la fila. Cuando una propuesta se marca como Realizado, el sistema lo actualiza con el estado de ese momento. La fila se pinta de otro color si es Inactivo.' },
    { col: ASC.COMENTARIO, enc: 'Comentario',
      texto: 'Texto libre. En un cambio detectado el sistema escribe «Ascenso de X a Y en el clan Z»; en una propuesta, el detalle de los requisitos. Al confirmar una propuesta o corregir el autor agrega una línea de auditoría entre corchetes. También se copia a la hoja Comentarios al crear la fila. Puedes editarlo.' },
    { col: ASC.ESTADO_PROPUESTA, enc: 'Estado_Propuesta',
      texto: 'Solo en las filas que vienen de una propuesta de Cambio de rango: Planificado (aún sin aplicar) o Realizado (el Directorio ya muestra el cambio). El sistema la marca Realizado al verificar; también puedes elegirla de la lista. Vacía en los cambios que el sistema detecta solo.' },
    { col: ASC.TSD, enc: TSD_ENCABEZADOS[0],
      texto: 'Número de temporada de la Fecha. Se calcula sola desde la Fecha; no la edites.' },
    { col: ASC.TSD + 1, enc: TSD_ENCABEZADOS[1],
      texto: 'Temporada según el calendario de RoyaleAPI, calculada desde la Fecha. No la edites.' },
    { col: ASC.TSD + 2, enc: TSD_ENCABEZADOS[2],
      texto: 'Temporada según el calendario de Supercell (año y mes, como 2026-05), calculada desde la Fecha. No la edites.' },
    { col: ASC.TSD + 3, enc: TSD_ENCABEZADOS[3],
      texto: 'Semana de guerra de la temporada en que cae la Fecha, calculada desde ella. No la edites.' },
    { col: ASC.TSD + 4, enc: TSD_ENCABEZADOS[4],
      texto: 'Día de la semana de la Fecha (de Domingo a Sábado), calculado desde ella. No lo edites.' },
    { col: ASC.PAR_ID, enc: ASC_PAR_ENCABEZADO,
      texto: 'Id del par de CR_Lista (el del Ascenso, «A_…») que generó la propuesta. Sirve para saber contra qué requisitos evaluarla y a qué corrida pertenece. Vacío en los cambios que el sistema detecta solo. No lo edites a mano.' }
  ];

  // Pendientes (21-nov-2026): la escribe updatePendientesSheet() (17_GuerraSheet.gs). Las columnas son fijas; el encabezado `enc` evita poner una nota en otra columna.
  var borra = 'Esta hoja se borra y se reescribe entera en cada actualización: lo que escribas a mano se pierde. En un día sin guerra solo dice «No es día de guerra».';
  defs[CFG.SHEETS.PENDIENTES] = [
    { col: 1, enc: 'N°', texto: 'Número de fila de esta lista. ' + borra },
    { col: 2, enc: 'Tag',
      texto: 'Tag de la cuenta. Solo salen los miembros de los clanes Terna que hoy todavía tienen ataques por usar.' },
    { col: 3, enc: 'Nombre',
      texto: 'Nombre en el juego, tomado de la lista de miembros del clan (si no aparece ahí, el que trae la guerra).' },
    { col: 4, enc: 'Nom_Multi',
      texto: 'Se copia del Directorio. Esta columna se oculta por defecto.' },
    { col: 5, enc: 'Préstamo',
      texto: 'Se copia del Directorio. Esta columna se oculta por defecto.' },
    { col: 6, enc: 'Clan',
      texto: 'Clan en el que está hoy la cuenta, con el nombre que trae la API.' },
    { col: 7, enc: 'Faltantes',
      texto: 'Ataques que le faltan hoy: 4 menos los ataques usados (se toma el mayor entre la caché de la API y la hoja Guerra). Solo salen cuentas con 1 o más. Las filas van ordenadas por clan, luego por más faltantes y luego por nombre, y se pintan según la cantidad (4, de 2 a 3, y 1).' },
    { col: 8, enc: 'Celular',
      texto: 'Celular del Directorio, solo con dígitos. Queda vacío si la cuenta no tiene.' },
    { col: 9, enc: 'WSP',
      texto: 'Enlace de WhatsApp armado con el prefijo y el celular del Directorio. Solo aparece si la cuenta tiene celular.' },
    { col: 10, enc: 'RoyaleAPI',
      texto: 'Enlace al perfil de la cuenta en RoyaleAPI.' }
  ];

  // Mensajes (21-nov-2026): la escribe generarTodosMensajes() (30_Mensajes.gs).
  var regenera = 'Esta hoja se borra y se reescribe entera cada vez que se generan los mensajes: lo que escribas a mano se pierde.';
  defs[CFG.SHEETS.MENSAJES] = [
    { col: MC.NUM, enc: 'N°', texto: 'Número de fila, según el orden final de los mensajes. ' + regenera },
    { col: MC.FECHA, enc: 'Fecha',
      texto: 'Momento en que se generaron los mensajes. Todas las filas de una misma corrida llevan la misma fecha.' },
    { col: MC.TEMPORADA, enc: 'Temporada', texto: 'Temporada que estaba en curso al generar los mensajes.' },
    { col: MC.SEMANA, enc: 'Semana', texto: 'Semana de guerra de esa temporada al generar los mensajes.' },
    { col: MC.DIA, enc: 'Dia',
      texto: 'Día de guerra en que se generaron, como letra: L lunes, M martes, X miércoles, J jueves, V viernes, S sábado, D domingo.' },
    { col: MC.PERIOD, enc: 'PeriodIndex',
      texto: 'Contador de días de guerra que da la API; cada 7 forman una semana.' },
    { col: MC.N1, enc: 'N1°', texto: 'Número de la categoría, por orden de aparición en la hoja.' },
    { col: MC.CATEGORIA, enc: 'Categoría',
      texto: 'Categoría del mensaje. Las dinámicas se arman con datos del momento; las estáticas vienen de plantillas de Google Docs.' },
    { col: MC.N2, enc: 'N2°', texto: 'Número de la subcategoría dentro de su categoría.' },
    { col: MC.SUBCATEGORIA, enc: 'Subcategoría', texto: 'Subcategoría del mensaje dentro de su categoría.' },
    { col: MC.N3, enc: 'N3°', texto: 'Número del mensaje dentro de su subcategoría.' },
    { col: MC.CLAN, enc: 'Clan',
      texto: 'Clan al que va el mensaje. Los mensajes generales van al Chat General, que se llama «' + CLAN_CHAT_GENERAL + '».' },
    { col: MC.RANGO, enc: 'Rango',
      texto: 'Solo lo llenan los mensajes que se ordenan por el rango de la cuenta en el Directorio (por ejemplo, los de pendientes de guerra). En el resto queda vacío.' },
    { col: MC.TIPO, enc: 'Tipo',
      texto: 'Dinámico (armado con datos del momento) o Estático (texto de una plantilla de Google Docs).' },
    { col: MC.CONTENIDO, enc: 'Contenido',
      texto: 'Texto del mensaje, listo para copiar y enviar.' },
    { col: MC.CLAN_TAG, enc: 'Clan_Tag',
      texto: 'Tag del clan de la columna Clan. Queda vacío en el Chat General y en lo que no es un clan Terna. El clan se identifica por este Tag, no por el nombre.' }
  ];

  // Nuevos (21-nov-2026): encabezados en la fila 3. Contrastado con 14_Nuevos_RoyaleAPI.gs (_refrescarColumnasFijasNuevos_Paso2_ColumnasFijas, _aplicarImportacionNuevos, _renumerarNuevos) y 11_DirectorioSheet.gs (_leerDirectorioFisicoComoDC).
  var delDir = ' Se copia del Directorio en cada refresco de la hoja si el Tag está en el Directorio; un cambio a mano se pierde, así que edítalo en el Directorio.';
  defs[CFG.SHEETS.NUEVOS] = [
    { col: NC.NUM, enc: 'N°',
      texto: 'Número de fila. Lo reasigna el sistema (1, 2, 3…) cada vez que importa, purga o reordena la hoja, así que cambia con el tiempo. No lo edites.' },
    { col: NC.TAG, enc: 'Tag',
      texto: 'Tag de la cuenta, con #. Lo escribe el sistema al crear la fila, con lo que envía Tampermonkey o con las correcciones de guerra, y después se conserva. Es la clave con que se busca la fila: no lo edites.' },
    { col: NC.NOMBRE, enc: 'Nombre', texto: 'Nombre de la cuenta.' + delDir },
    { col: NC.NOM_MULTI, enc: 'Nom_Multi', texto: 'Nombre de multicuenta. Puede quedar vacío.' + delDir },
    { col: NC.NIVEL, enc: 'Nivel',
      texto: 'Nivel de la cuenta. Sale de la hoja Players (dato de la API de Clash Royale) a través del Directorio. Puede quedar vacío si Players no tiene la cuenta. Un cambio a mano se pierde.' },
    { col: NC.COPAS, enc: 'Copas',
      texto: 'Copas (trofeos) de la cuenta. Sale de la hoja Players (API de Clash Royale) a través del Directorio. Puede quedar vacío si Players no tiene la cuenta. Un cambio a mano se pierde.' },
    { col: NC.V_GUERRA, enc: 'V_Guerra',
      texto: 'Victorias de guerra de clanes de la cuenta. Sale de la hoja Players (API de Clash Royale) a través del Directorio. Puede quedar vacío si no hay dato. Un cambio a mano se pierde.' },
    { col: NC.INACTIVIDAD, enc: 'Días inactivo',
      texto: 'Días desde la última conexión de la cuenta. Los calcula el Directorio con la API de Clash Royale; aquí solo se copian. Puede quedar vacío. Un cambio a mano se pierde.' },
    { col: NC.CELULAR, enc: 'Celular',
      texto: 'Celular de la cuenta, solo dígitos.' + delDir + ' Puede quedar vacío.' },
    { col: NC.ROYALE_API, enc: 'RoyaleAPI',
      texto: 'Enlace «Link» al perfil de la cuenta en RoyaleAPI, armado con el Tag. El sistema lo vuelve a escribir en cada refresco e importación; un cambio a mano se pierde.' },
    { col: NC.CLAN, enc: 'Clan',
      texto: 'Clan actual de la cuenta, copiado del Directorio. No es el clan de cada semana del historial: ese está en la columna Clan de cada bloque de fecha. Con esta columna se ordena la hoja y se colorean las filas. Puede quedar vacío si la cuenta no está en el Directorio.' }
  ];

  // Control (21-nov-2026): encabezados en la fila 3. Contrastado con updateControlSheet(), _asegurarColumnasClanTagEstadoControl_(), _calcAlerta() y _evaluarRequisitosAscenso() (22_ControlCalendario.gs, 11_DirectorioSheet.gs).
  var ctl = ' Control se borra y se reescribe entera en cada corrida: para cambiar el dato edita la hoja de origen, no esta.';
  defs[CFG.SHEETS.CONTROL] = [
    { col: 1, enc: 'N°', texto: 'Número de fila. Se reinicia en cada corrida.' + ctl },
    { col: 2, enc: 'Tag', texto: 'Tag de la cuenta, tomado del Directorio. Se repite en cada fila del jugador si tiene registros en más de un clan Terna.' },
    { col: 3, enc: 'Nombre', texto: 'Nombre de la cuenta, tomado del Directorio.' },
    { col: 4, enc: 'Nom_Multi', texto: 'Nombre de multicuenta. Se escribe a mano en el Directorio; aquí solo se copia. Puede quedar vacío.' },
    { col: 5, enc: 'Clan',
      texto: 'Clan de los registros de esa fila. Si el jugador tiene registros en varios clanes Terna hay una fila por clan: la del clan actual va primero (Estado «Activo») y las demás quedan como «Inactivo».' },
    { col: 6, enc: 'Rango', texto: 'Rango de la cuenta en el clan, tomado del Directorio (dato de la API de Clash Royale). Es el rango que usa la columna Ascenso. Puede quedar vacío.' },
    { col: 7, enc: 'Iniciales', texto: '«Sí» si el nombre de la cuenta empieza con el prefijo de los clanes Terna; «No» si no. Lo calcula el Directorio.' },
    { col: 8, enc: 'Celular', texto: 'Celular de la cuenta, solo dígitos. Se escribe a mano en el Directorio; aquí solo se copia. Puede quedar vacío.' },
    { col: 9, enc: 'Nivel', texto: 'Nivel de la cuenta (API de Clash Royale y hoja Players). Queda vacío si no hay dato.' },
    { col: 10, enc: 'Copas', texto: 'Copas (trofeos) de la cuenta según la API del clan. Queda en 0 si no hay dato.' },
    { col: 11, enc: 'V_Guerra', texto: 'Victorias de guerra de clanes de la cuenta (API de Clash Royale, con respaldo en Players). Puede quedar vacío si ninguna fuente tiene el dato.' },
    { col: 12, enc: 'Permiso', texto: 'Sí o No. Se escribe a mano en el Directorio; aquí solo se copia. Puede quedar vacío.' },
    { col: 13, enc: 'Días inactivo',
      texto: 'Días desde la última conexión de la cuenta, calculados con la API de Clash Royale. Vale 999 si la API no entregó la última conexión. Se repite igual en todas las filas del jugador.' },
    { col: 14, enc: 'Alerta',
      texto: 'La calcula el Directorio y puede juntar varias: «Candidato a expulsión» (cuenta activa con 3 o más días de inactividad), «Reactivado» (estaba inactiva y volvió a estar activa) y «Pendiente» (falta el celular o las Iniciales están en «No»). Queda vacía si no aplica ninguna.' },
    { col: 15, enc: 'Ataques pendientes',
      texto: 'Vale «Si» (sin tilde) solo en día de guerra y solo en la fila activa del jugador, cuando tiene menos de 4 ataques hoy (se toma el mayor entre la API y la hoja Guerra). En las demás filas y fuera de los días de guerra queda vacía.' },
    { col: 16, enc: 'Ascenso',
      texto: 'Solo se evalúa a Miembros y Veteranos (en los demás rangos queda vacío). «Sí» si la cuenta cumple a la vez los requisitos de ataques, de puntaje promedio y de barcos que define el sistema; «No» si incumple alguno o faltan datos. Se repite igual en todas las filas del jugador.' },
    { col: CONTROL_COL_CLAN_TAG, enc: 'Clan_Tag',
      texto: 'Tag del clan de esa fila. El clan se identifica por este Tag, no por el nombre.' },
    { col: CONTROL_COL_ESTADO, enc: 'Estado',
      texto: '«Activo» si el clan de la fila es el clan actual del jugador en el Directorio; «Inactivo» en las demás filas del jugador (clanes donde tuvo registros y ya no está).' }
  ];
  return defs;
}

/**
 * _filaEncabezadoNotas_(nombreHoja) [→ Contexto_Base_Web.md §PF286]
 * Fila donde están los encabezados de la hoja, que es donde van las notas de columna: 3 en Nuevos y en Control (las filas 1 y 2 son el título combinado), 1 en las demás.
 */
function _filaEncabezadoNotas_(nombreHoja) {
  return (nombreHoja === CFG.SHEETS.NUEVOS || nombreHoja === CFG.SHEETS.CONTROL) ? 3 : 1;
}

/**
 * _aplicarNotasColumnasHoja_(sh, notas, fila) [→ Contexto_Base_Web.md §PF286]
 * Escribe en la fila `fila` (1 si no se indica; 3 en Nuevos y Control, ver _filaEncabezadoNotas_()) de `sh` las notas de `notas` (ver _definicionNotasColumnas_()) con UNA lectura y, solo si algo cambió, UNA escritura de toda la fila de notas (por eso es barata dentro de setupAllSheets()).
 * Reglas por columna: (1) si el encabezado no es el esperado (`enc`), se omite y se avisa en el registro, para no poner la nota en otra columna si alguien movió columnas; (2) si la celda no tiene nota o la nota empieza con NOTA_COLUMNA_PREFIJO_, se escribe/actualiza; (3) si tiene una nota sin ese prefijo, es de la usuaria y se conserva. Las columnas fuera de la lista no se tocan.
 * Devuelve { escritas, iguales, conservadas, omitidas }.
 */
function _aplicarNotasColumnasHoja_(sh, notas, fila) {
  fila = fila || 1; // 21-nov-2026: Nuevos y Control tienen los encabezados en la fila 3
  var res = { escritas: 0, iguales: 0, conservadas: 0, omitidas: 0 };
  if (!sh || !notas || !notas.length) return res;

  var ancho = 0;
  notas.forEach(function (n) { if (n.col > ancho) ancho = n.col; });
  ancho = Math.min(ancho, sh.getMaxColumns());
  if (ancho < 1) return res;

  var rango = sh.getRange(fila, 1, 1, ancho);
  var encabezados = rango.getValues()[0];
  var actuales = rango.getNotes()[0];
  var nuevas = actuales.slice();

  notas.forEach(function (n) {
    if (n.col > ancho) { res.omitidas++; return; }
    var encReal = String(encabezados[n.col - 1] || '').trim();
    if (encReal !== n.enc) {
      res.omitidas++;
      Logger.log('[Notas] ' + sh.getName() + ' col ' + n.col + ': el encabezado es «' + encReal + '» y se esperaba «' + n.enc + '»; no se escribe la nota.');
      return;
    }
    var previa = String(actuales[n.col - 1] || '');
    var nueva = NOTA_COLUMNA_PREFIJO_ + n.texto;
    if (previa === nueva) { res.iguales++; return; }
    if (previa === '' || previa.indexOf(NOTA_COLUMNA_PREFIJO_) === 0) {
      nuevas[n.col - 1] = nueva;
      res.escritas++;
    } else {
      res.conservadas++;
    }
  });

  if (res.escritas > 0) rango.setNotes([nuevas]);
  return res;
}
