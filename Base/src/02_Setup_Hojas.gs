// ==============================================================================
// 02_Setup_Hojas.gs
// Creacion/estructura de todas las hojas del spreadsheet (encabezados, formato base,
// proteccion). Punto de entrada: setupAllSheets().
// ==============================================================================

// ----- Variables y constantes -----

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

// ----- Funciones manuales / punto de entrada -----

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

// ----- Funciones internas / helpers -----

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
 * _setupAlertasHistorialGuerra(ss) [→ Contexto_Base_Web.md §02B012]
 */
function _setupAlertasHistorialGuerra(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.ALERTAS_HISTORIAL_GUERRA);
  var encabezados = AHG_ENCABEZADOS; // 20_HistorialGuerraJugador.gs
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
      [5,'#RYYCRGVG','','','','','','','','','','','','','','','','','','','','','','Vetado'],
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
  var headers = ['N°','Fecha','Temporada','Semana','Día','PeriodIndex',
                 'DiaGuerra','Etapa','Clan','Tag','Nombre',
                 'AtaquesHoy','AtaquesSemana','Fame','Barcos',
                 'Donaciones_r','Donaciones_d','Ranking',
                 'Temporada_2','Origen','Copas'];
  if (sh.getMaxColumns() < headers.length) sh.insertColumnsAfter(sh.getMaxColumns(), headers.length - sh.getMaxColumns());
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  applyHeaderStyle(sh, headers.length);
  Logger.log('[Setup] Guerra OK (21 cols, incluye Temporada_2/Origen/Copas)');
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

function _setupControl(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.CONTROL);
  if (sh.getLastRow() === 0 || sh.getRange(1,1).getValue() === '') {
    _buildControlHeaders(sh);
  }
  Logger.log('[Setup] Control OK');
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

function _buildControlHeaders(sh) {
  var maxCols = sh.getMaxColumns();
  var COL_TOTALES = _controlColTotales();

  if (maxCols < COL_TOTALES) {
    sh.insertColumnsAfter(maxCols, COL_TOTALES - maxCols);
  }

  _pintarEncabezadosControl(sh);
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
  var headers = ['N°','Tag','Nombre','Nom_Multi','Clan','Rango','Iniciales','Permiso','Estado','Razón','Autor','Vía','Fecha'];
  // Se reescriben SIEMPRE las 13 columnas (headers.length === VETADOS_TOTAL_COLS) [→ Contexto_Base_Web.md §02B047]
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  applyHeaderStyle(sh, headers.length);

  // Formato de fecha visible dd/mm/yyyy HH:mm:ss (24h) para la columna [→ Contexto_Base_Web.md §02B048]
  var numFilasVet = sh.getLastRow() - 1;
  if (numFilasVet >= 1) {
    sh.getRange(2, VC.FECHA, numFilasVet, 1).setNumberFormat('dd/mm/yyyy hh:mm:ss');
  }

  Logger.log('[Setup] Vetados OK (13 cols)');
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
                 'N1°','Categoría','N2°','Subcategoría','N3°','Clan','Rango','Tipo','Contenido'];
  // FIX (28-sep-2026, pedido del usuario -- "en la hoja Mensajes se borro el encabezado de la [→ Contexto_Base_Web.md §02B058]
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  applyHeaderStyle(sh, headers.length);
  _aplicarSubindiceEncabezados(sh);
  sh.setColumnWidth(headers.length, 428); // Contenido: ancho fijo, texto largo (428px, pedido usuario 14-ago-2026)
  Logger.log('[Setup] Mensajes OK (15 cols, encabezados al dia)');
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
 * _setupTLista(ss) [→ Contexto_Base_Web.md §02B066]
 */
function _setupTLista(ss) {
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.T_LISTA);
  // FASE 2 (25-sep-2026, rediseño T_Lista -- ver docblock del objeto TL en [→ Contexto_Base_Web.md §02B067]
  var columnas = [
    { label: 'Planificación, registro y modificación de torneos', subs: [
        'N°', 'Temporada', 'Semanas', 'Fecha', 'Hora', 'Creación', 'ID',
        'Tag_Tor', 'Tag_Tor_2', 'Nombre', 'Tipo', 'Contraseña',
        'Nivel_tope', 'Participantes', 'Capacidad', 'Modo_ID', 'Modo',
        'Preparación', 'Duración', 'Nombre_Org', 'Nom_Multi_Org',
        'Tag_org', 'Clan', 'ClanTag', 'Premios', 'Estado'
    ] },
    { label: 'Min_T', subs: ['C1', 'C2', 'C3', 'C4'] },
    { label: 'Ataques', subs: ['C1', 'C2', 'C3', 'C4'] },
    { label: 'Otros requisitos', subs: [
        // FIX (12-sep-2026, pedido del usuario -- requisito nuevo "Barcos"): [→ Contexto_Base_Web.md §02B068]
        'Barcos', 'Miembro activo', 'Reacción', 'WhatsApp', 'Link_app', 'Link_json', 'Link_json_2', 'Descripción', 'Comentario', 'Organizador_Fuente'
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
  Logger.log('[Setup] CR_Lista OK (' + totalCols + ' columnas, header 3 filas, filtro en fila 3)');
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

/**
 * PF231: se puede correr sola desde el editor de Apps Script (no recibe parámetros) para corregir los bordes de S_Asistencia sin ejecutar todo el setup.
 */
function repararBordesSAsistencia() {
  var sh = _getSs().getSheetByName(CFG.SHEETS.S_ASISTENCIA);
  if (!sh) { Logger.log('[Setup] repararBordesSAsistencia: no existe la hoja ' + CFG.SHEETS.S_ASISTENCIA); return; }
  _bordesDatosSAsistencia_(sh);
  Logger.log('[Setup] Bordes de S_Asistencia corregidos (' + Math.max(0, sh.getLastRow() - 1) + ' filas, ' + SA_TOTAL_COLS + ' columnas).');
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