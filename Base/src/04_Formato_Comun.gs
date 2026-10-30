// ==============================================================================
// 04_Formato_Comun.gs
// Formato visual transversal a varias hojas: bordes, tablas, gridlines,
// clip de columnas, limpieza de hojas obsoletas. Invocado principalmente desde runFormato() en 00_Main.gs.
// ==============================================================================

// ----- Funciones manuales / punto de entrada -----

// _setupCards()/_setupCards2() — ELIMINADAS (06-ago-2026). [→ Contexto_Base_Web.md §04B001]

// aplicarFormatoGlobal [→ Contexto_Base_Web.md §04B002]
function aplicarFormatoGlobal() {
  var ss = _getSs();
  Logger.log('[Formato] Iniciando aplicarFormatoGlobal...');

  // FIX (07-ago-2026): antes solo se recorrían las hojas registradas en [→ Contexto_Base_Web.md §04B003]
  var HOJAS_SIN_BORDE_GENERICO = [];

  var allSheets = ss.getSheets();
  for (var i = 0; i < allSheets.length; i++) {
    var sh     = allSheets[i];
    var shName = sh.getName();
    // Calendario no se trata como tabla (sin bordes ni centrado masivo)
    if (shName === CFG.SHEETS.CALENDARIO) continue;

    // FIX (07-ago-2026): reportado por el usuario — runAll() se cortó a [→ Contexto_Base_Web.md §04B004]
    var formateoOk = false;
    var ultimoError = null;
    for (var intentoFmt = 1; intentoFmt <= 3 && !formateoOk; intentoFmt++) {
      try {
        var lastRow = sh.getLastRow();
        var lastCol = sh.getLastColumn();
        if (lastRow < 1 || lastCol < 1) { formateoOk = true; break; }

        // Aplicar CLIP + centrado horizontal/vertical a TODA la hoja
        sh.getRange(1, 1, lastRow, lastCol)
          .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP)
          .setHorizontalAlignment('center')
          .setVerticalAlignment('middle');

        if (HOJAS_SIN_BORDE_GENERICO.indexOf(shName) === -1) {
          // Determinar desde qué fila empiezan los datos
          var dataStartRow = (shName === CFG.SHEETS.CONTROL) ? 4 : 2;

          if (lastRow >= dataStartRow) {
            // Aplicar bordes SOLO a filas con datos
            applyBorderCenter(sh.getRange(dataStartRow, 1, lastRow - dataStartRow + 1, lastCol));
          }

          // Limpiar bordes en filas vacías (después de lastRow hasta maxRows para borrar residuos)
          var maxRows = sh.getMaxRows();
          if (maxRows > lastRow) {
            try {
              sh.getRange(lastRow + 1, 1, maxRows - lastRow, lastCol)
                .setBorder(false, false, false, false, false, false);
            } catch (eBorde) {}
          }
        }

        formateoOk = true;
      } catch (eFmt) {
        ultimoError = eFmt;
        var msgFmt = String(eFmt.message || '');
        var esErrorTransitorioSheets = /service spreadsheets failed|internal error|try again|timeout/i.test(msgFmt);
        if (esErrorTransitorioSheets && intentoFmt < 3) {
          Logger.log('[Formato] "' + shName + '": error transitorio (intento ' + intentoFmt + '/3): ' + msgFmt + '. Reintentando...');
          Utilities.sleep(2000 * intentoFmt);
        } else {
          // Error no transitorio, o ya se agotaron los 3 intentos: se [→ Contexto_Base_Web.md §04B005]
          break;
        }
      }
    }
    if (!formateoOk) {
      Logger.log('[Formato] "' + shName + '": no se pudo formatear tras 3 intentos (' +
        (ultimoError ? (ultimoError.message || ultimoError) : 'motivo desconocido') +
        '). Se omite esta hoja y se continúa con el resto.');
      continue;
    }
  }

  // Control: ancho 45px en toda la cuadrícula (COL_INICIO_GRID = 17 en adelante)
  var shControl = ss.getSheetByName(CFG.SHEETS.CONTROL);
  if (shControl) {
    var COL_INICIO_GRID = 17; // FIX (03-ago-2026): 18 -> 17 (Jugador eliminada)
    var lastColCtrl = shControl.getLastColumn();
    for (var c = COL_INICIO_GRID; c <= lastColCtrl; c++) {
      shControl.setColumnWidth(c, 45);
    }
    restaurarAnchosColumnasFijos(CFG.SHEETS.CONTROL); // PF287 (30-oct-2026): vuelven los anchos guardados con guardarAnchosColumnasFijos(), que los 45 px de arriba pisaban (AP, AQ, DQ)
    shControl.setColumnWidth(1, 35);
  }

  var shMsg = ss.getSheetByName(CFG.SHEETS.MENSAJES);
  if (shMsg && shMsg.getLastRow() > 1) {
    var numDataRows = shMsg.getLastRow() - 1;
    shMsg.getRange(2, 1, numDataRows, shMsg.getLastColumn())
      .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    for (var r = 2; r <= shMsg.getLastRow(); r++) {
      shMsg.setRowHeight(r, 200);
    }
  }

  // Mensajes: columna Contenido con ancho fijo de 428px y ajuste de texto [→ Contexto_Base_Web.md §04B006]
  var shMsgWrap = ss.getSheetByName(CFG.SHEETS.MENSAJES);
  if (shMsgWrap) {
    var colContenidoMsg = shMsgWrap.getLastColumn(); // Contenido es la última columna (14)
    shMsgWrap.setColumnWidth(colContenidoMsg, 428);
    var lastRowMsgWrap = shMsgWrap.getLastRow();
    if (lastRowMsgWrap >= 1) {
      shMsgWrap.getRange(1, colContenidoMsg, lastRowMsgWrap, 1)
        .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    }
  }

  // Aplicar CLIP a la columna Jugador en todas las hojas que la tienen
  _aplicarClipColumnaJugador();

  Logger.log('[Formato] aplicarFormatoGlobal completado exitosamente.');
}

// ----- Funciones internas / helpers -----

/**
 * _aplicarClipColumnaJugador() [→ Contexto_Base_Web.md §04B007]
 */
/**
 * _hojasConColumnaJugador() [→ Contexto_Base_Web.md §04B008]
 */
function _hojasConColumnaJugador() {
  return [
    { name: CFG.SHEETS.DIRECTORIO,      col: DC.JUGADOR },
    // Administradores (12/07/2026): ya no tiene columna "Jugador" — pasó a [→ Contexto_Base_Web.md §04B009]
    { name: CFG.SHEETS.INACTIVOS,       col: 4 },
    // Vetados (17-ago-2026): la columna 4 dejó de ser "Jugador" y pasó a [→ Contexto_Base_Web.md §04B010]
  ];
}

function _aplicarClipColumnaJugador() {
  var ss = _getSs();
  var sheetConfigs = _hojasConColumnaJugador();
  for (var i = 0; i < sheetConfigs.length; i++) {
    var cfg = sheetConfigs[i];
    var sh  = ss.getSheetByName(cfg.name);
    if (!sh) continue;
    var lastRow = sh.getLastRow();
    if (lastRow < 2) continue;
    try {
      sh.getRange(2, cfg.col, lastRow - 1, 1)
        .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    } catch(e) {
      Logger.log('[Formato] Error CLIP ' + cfg.name + ': ' + e.message);
    }
  }
  Logger.log('[Formato] CLIP aplicado a columna Jugador en todas las hojas.');
  // La columna "Jugador" se oculta en todas las hojas (es un valor calculado
  // de apoyo interno, no necesita verse).
  _ocultarColumnaJugador();
}

/**
 * _ocultarColumnaJugador() [→ Contexto_Base_Web.md §04B011]
 */
function _ocultarColumnaJugador() {
  var ss = _getSs();
  var sheetConfigs = _hojasConColumnaJugador();
  for (var i = 0; i < sheetConfigs.length; i++) {
    var cfg = sheetConfigs[i];
    var sh  = ss.getSheetByName(cfg.name);
    if (!sh) continue;
    try {
      sh.hideColumns(cfg.col);
    } catch(e) {
      Logger.log('[Formato] Error ocultando columna Jugador en ' + cfg.name + ': ' + e.message);
    }
  }
  Logger.log('[Formato] Columna Jugador oculta en todas las hojas.');
}

/**
 * _aplicarSubindiceEncabezados(sh) [→ Contexto_Base_Web.md §04B012]
 */
function _aplicarSubindiceEncabezados(sh) {
  var lastCol = sh.getLastColumn();
  if (lastCol < 1) return;
  var headerRow = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  for (var c = 0; c < headerRow.length; c++) {
    var v = String(headerRow[c] || '').trim();
    var match = v.match(/^N(\d)°$/);
    if (!match) continue;
    var digit = match[1];
    var cell = sh.getRange(1, c + 1);
    try {
      var rt = SpreadsheetApp.newRichTextValue()
        .setText('N' + digit + '°')
        .setTextStyle(0, 1, SpreadsheetApp.newTextStyle().build())         // 'N'
        .setTextStyle(1, 2, SpreadsheetApp.newTextStyle()                  // digit en subíndice
          .setFontSize(7)
          .setBaselineOffset(SpreadsheetApp.TextBaselineOffset.SUBSCRIPT)
          .build())
        .setTextStyle(2, 3, SpreadsheetApp.newTextStyle().build())         // '°'
        .build();
      cell.setRichTextValue(rt);
    } catch(e) {
      // Fallback: dejar el texto sin formato si RichText falla
    }
  }
}

/**
 * _limpiarBordesFilasVacias() [→ Contexto_Base_Web.md §04B013]
 */
function _limpiarBordesFilasVacias() {
  var ss = _getSs();
  var sheetNames = Object.values(CFG.SHEETS);
  for (var i = 0; i < sheetNames.length; i++) {
    var shName = sheetNames[i];
    if (shName === CFG.SHEETS.CALENDARIO) continue;
    var sh = ss.getSheetByName(shName);
    if (!sh) continue;
    var lastRow = sh.getLastRow();
    var maxRows = sh.getMaxRows();
    var lastCol = sh.getLastColumn() || 1;
    if (maxRows > lastRow && lastRow >= 1) {
      try {
        sh.getRange(lastRow + 1, 1, maxRows - lastRow, lastCol)
          .setBorder(false, false, false, false, false, false);
      } catch(e) {}
    }
  }
  Logger.log('[Formato] Bordes en filas vacías limpiados.');
}

function _crearTabla(sh, headerRow, dataEndRow, numCols, tableName) {
  try {
    if (dataEndRow < headerRow + 1) return;
    var range = sh.getRange(headerRow, 1, dataEndRow - headerRow + 1, numCols);
    if (sh.getFilter()) { sh.getFilter().remove(); }
    range.createFilter();
    Logger.log('[Tabla] Filtro aplicado en: ' + tableName);
  } catch(e) {
    Logger.log('[Tabla] Error creando filtro en ' + tableName + ': ' + e.message);
  }
}

/**
 * _repararMergesFiltroHeader(sh, filaHeader) [→ Contexto_Base_Web.md §04B014]
 */
function _repararMergesFiltroHeader(sh, filaHeader) {
  var lastCol = sh.getLastColumn();
  if (lastCol < 1 || filaHeader < 2) return;
  var headerRange = sh.getRange(1, 1, filaHeader, lastCol);
  var merges = headerRange.getMergedRanges();
  var corregidas = [];

  for (var i = 0; i < merges.length; i++) {
    var m = merges[i];
    var r0 = m.getRow();
    var rEnd = r0 + m.getNumRows() - 1;
    if (r0 <= filaHeader - 1 && rEnd >= filaHeader) {
      var c0   = m.getColumn();
      var numC = m.getNumColumns();
      var valor = m.getValue();
      var fmt   = m.getBackground();
      var fontColor = m.getFontColor();
      var fontWeight = m.getFontWeight();
      var hAlign = m.getHorizontalAlignment();
      var vAlign = m.getVerticalAlignment();

      m.breakApart();

      // La porción de arriba (fila inicio..filaHeader-1) queda EN BLANCO —
      // el rótulo ya no vive aquí, ver comentario de la función.
      var arriba = sh.getRange(r0, c0, filaHeader - r0, numC);
      if (arriba.getNumRows() > 1) arriba.merge();
      arriba.setValue('')
        .setBackground(fmt)
        .setFontColor(fontColor)
        .setFontWeight(fontWeight)
        .setHorizontalAlignment(hAlign)
        .setVerticalAlignment(vAlign);

      // filaHeader queda como celda propia CON el rótulo — es la fila que
      // usa el desplegable del filtro y donde viven los demás encabezados.
      sh.getRange(filaHeader, c0, 1, numC).setValue(valor)
        .setBackground(fmt)
        .setFontColor(fontColor)
        .setFontWeight(fontWeight)
        .setHorizontalAlignment(hAlign)
        .setVerticalAlignment(vAlign);

      corregidas.push(sh.getRange(filaHeader, c0).getA1Notation() + ' ("' + valor + '")');
    }
  }

  if (corregidas.length > 0) {
    Logger.log('[Filtros] ' + sh.getName() + ': merges de encabezado partidos en fila ' + filaHeader + ' para permitir el filtro: ' + corregidas.join(', '));
  }
}

/**
 * _aplicarFiltroEnFilaHeader(sh, nombreHoja) [→ Contexto_Base_Web.md §04B015]
 */
function _aplicarFiltroEnFilaHeader(sh, nombreHoja) {
  var filaHeader = sh.getFrozenRows() || 1;
  var lastRow = sh.getLastRow();
  var lastCol = sh.getLastColumn();
  if (lastCol < 1) return;

  // FIX (18-sep-2026, pedido usuario -- "las hojas Conflictos, T_Resoluciones, [→ Contexto_Base_Web.md §04B016]
  var ultimaFilaFiltro = Math.max(lastRow, filaHeader + 1);
  if (ultimaFilaFiltro > sh.getMaxRows()) ultimaFilaFiltro = sh.getMaxRows();
  if (ultimaFilaFiltro < filaHeader) return; // la hoja ni siquiera tiene la fila de encabezado
  var numFilasFiltro = ultimaFilaFiltro - filaHeader + 1;

  if (filaHeader > 1) {
    // Antes de crear el filtro, partir cualquier celda combinada de [→ Contexto_Base_Web.md §04B017]
    _repararMergesFiltroHeader(sh, filaHeader);
  }

  try {
    if (sh.getFilter()) { sh.getFilter().remove(); }
    sh.getRange(filaHeader, 1, numFilasFiltro, lastCol).createFilter();
    Logger.log('[Filtros] Filtro aplicado en fila ' + filaHeader + ': ' + nombreHoja);
  } catch (e) {
    Logger.log('[Filtros] Error al recrear el filtro en ' + nombreHoja + ' (fila ' + filaHeader + ', intento 1): ' + e.message);

    if (filaHeader > 1) {
      // Reintento de respaldo: rompe CUALQUIER merge residual que quede [→ Contexto_Base_Web.md §04B018]
      try {
        var filaHeaderRange = sh.getRange(filaHeader, 1, 1, lastCol);
        var mergesResiduales = filaHeaderRange.getMergedRanges();
        for (var mr = 0; mr < mergesResiduales.length; mr++) {
          try { mergesResiduales[mr].breakApart(); } catch (eBreak) {}
        }
        sh.getRange(filaHeader, 1, numFilasFiltro, lastCol).createFilter();
        Logger.log('[Filtros] ' + nombreHoja + ': filtro creado en el segundo intento, tras romper merge(s) residual(es) en la fila ' + filaHeader + '.');
      } catch (e2) {
        Logger.log('[Filtros] Error al recrear el filtro en ' + nombreHoja + ' (fila ' + filaHeader + ', intento 2), se abandona por esta corrida: ' + e2.message);
      }
    }
  }
}

/**
 * _restaurarFiltros() [→ Contexto_Base_Web.md §04B019]
 */
function _restaurarFiltros() {
  var ss = _getSs();

  // GENERALIZADO (18-sep-2026, pedido usuario -- "no me refería solo a esas [→ Contexto_Base_Web.md §04B020]
  var HOJAS_SIN_TABLA_ESTANDAR = [CFG.SHEETS.CALENDARIO, 'Terreno_Limpio'];

  // Recorre TODAS las hojas del spreadsheet (no una lista fija), así que [→ Contexto_Base_Web.md §04B021]
  var allSheets = ss.getSheets();
  for (var s = 0; s < allSheets.length; s++) {
    var sh = allSheets[s];
    var shName = sh.getName();
    if (HOJAS_SIN_TABLA_ESTANDAR.indexOf(shName) >= 0) continue;
    _aplicarFiltroEnFilaHeader(sh, shName);
  }

  // Columnas congeladas: reafirmación defensiva por si alguna corrida [→ Contexto_Base_Web.md §04B022]
  try { var shCtrl = ss.getSheetByName(CFG.SHEETS.CONTROL); if (shCtrl) shCtrl.setFrozenColumns(3); } catch(e) {}
  try { var shCtrl2 = ss.getSheetByName('Control_2'); if (shCtrl2) shCtrl2.setFrozenColumns(3); } catch(e) {}
  try { var shNuevos = ss.getSheetByName(CFG.SHEETS.NUEVOS); if (shNuevos) shNuevos.setFrozenColumns(3); } catch(e) {}
  try { var shTControl = ss.getSheetByName(CFG.SHEETS.T_CONTROL); if (shTControl) shTControl.setFrozenColumns(7); } catch(e) {} // 7 = TC_FIXED_COLS

  // Freeze 3 columnas en hojas cuya fila 1 empieza con N° | Tag | Nombre
  var hojasConTagNombre = [
    CFG.SHEETS.DIRECTORIO, CFG.SHEETS.ADMINISTRADORES,
    CFG.SHEETS.GUERRA, CFG.SHEETS.GUERRA_LOGS,
    CFG.SHEETS.HISTORIAL, CFG.SHEETS.PENDIENTES,
    CFG.SHEETS.INACTIVOS, CFG.SHEETS.VETADOS,
    CFG.SHEETS.MULTICUENTAS, CFG.SHEETS.COMENTARIOS,
  ];
  for (var hi = 0; hi < hojasConTagNombre.length; hi++) {
    var shFrz = ss.getSheetByName(hojasConTagNombre[hi]);
    if (!shFrz) continue;
    var h1 = shFrz.getRange(1, 1, 1, Math.min(shFrz.getLastColumn(), 3)).getValues()[0];
    if (String(h1[0]).trim() === 'N°' &&
        String(h1[1]).trim() === 'Tag' &&
        String(h1[2]).trim() === 'Nombre') {
      shFrz.setFrozenColumns(3);
    }
  }

  Logger.log('[Filtros] _restaurarFiltros completado.');

  // La columna "Jugador" debe permanecer oculta en todas las hojas; si alguna [→ Contexto_Base_Web.md §04B023]
  _ocultarColumnaJugador();

  // DEFENSIVO (30/06/2026): la columna E "Movimiento" de Historial estuvo [→ Contexto_Base_Web.md §04B024]
  try {
    var shHist = ss.getSheetByName(CFG.SHEETS.HISTORIAL);
    if (shHist && shHist.isColumnHiddenByUser(5)) {
      shHist.showColumns(5);
      Logger.log('[Filtros] Columna "Movimiento" (col 5) de Historial estaba oculta — se restauró visible.');
    }
  } catch(e) {
    Logger.log('[Filtros] Error verificando visibilidad de Movimiento en Historial: ' + e.message);
  }
}

function _aplicarTablasYGridlines() {
  var ss = _getSs();
  Logger.log('[Tablas] Iniciando _aplicarTablasYGridlines...');

  // 1. Desactivar cuadrículas en todas las hojas (costoso: solo en runAll)
  var allSheets = ss.getSheets();
  for (var i = 0; i < allSheets.length; i++) {
    _desactivarGridlines(allSheets[i]);
  }

  // 2. Filtros nativos (reutiliza la misma lógica que corre en cada runUpdate)
  _restaurarFiltros();

  Logger.log('[Tablas] _aplicarTablasYGridlines completado.');
}

function _limpiarHojaTerrenoLimpio() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Terreno_Limpio');

  if (sh) {
    if (ss.getSheets().length > 1) {
      try {
        ss.deleteSheet(sh);
        Logger.log('[Setup] Hoja "Terreno_Limpio" eliminada con éxito.');
      } catch(e) {
        Logger.log('[Setup] No se pudo eliminar "Terreno_Limpio": ' + e.message);
      }
    } else {
      Logger.log('[Setup] "Terreno_Limpio" es la única hoja, no se puede eliminar.');
    }
  }
}

/**
 * _renombrarHojasHistorialLegacy() [→ Contexto_Base_Web.md §04B025]
 */
function _renombrarHojasHistorialLegacy() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var migraciones = [
    { viejo: 'Ascensos',  nuevo: CFG.SHEETS.ASCENSOS },
    { viejo: 'Historial', nuevo: CFG.SHEETS.HISTORIAL }
  ];

  for (var i = 0; i < migraciones.length; i++) {
    var viejo = migraciones[i].viejo;
    var nuevo = migraciones[i].nuevo;
    if (viejo === nuevo) continue; // sin cambio configurado

    if (ss.getSheetByName(nuevo)) continue; // la pestaña nueva ya existe, no tocar nada

    var shViejo = ss.getSheetByName(viejo);
    if (!shViejo) continue; // no había pestaña vieja que migrar

    try {
      shViejo.setName(nuevo);
      Logger.log('[Setup] Pestaña renombrada: "' + viejo + '" -> "' + nuevo + '".');
    } catch (e) {
      Logger.log('[Setup] No se pudo renombrar "' + viejo + '" a "' + nuevo + '": ' + e.message);
    }
  }
}

/**
 * _limpiarHojasCardsObsoletas() [→ Contexto_Base_Web.md §04B026]
 */
function _limpiarHojasCardsObsoletas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var nombres = [CFG.SHEETS.CARDS, CFG.SHEETS.CARDS_2];

  for (var i = 0; i < nombres.length; i++) {
    var nombre = nombres[i];
    var sh = ss.getSheetByName(nombre);
    if (!sh) continue;

    try {
      _respaldarListaHojasCSV(ss, [nombre], true);
    } catch (e) {
      Logger.log('[Setup] No se pudo respaldar "' + nombre + '" antes de eliminarla: ' + e.message);
    }

    if (ss.getSheets().length > 1) {
      try {
        ss.deleteSheet(sh);
        Logger.log('[Setup] Hoja "' + nombre + '" (obsoleta, ahora vive solo en CSV) eliminada con éxito.');
      } catch (e) {
        Logger.log('[Setup] No se pudo eliminar "' + nombre + '": ' + e.message);
      }
    } else {
      Logger.log('[Setup] "' + nombre + '" es la única hoja, no se puede eliminar.');
    }
  }
}

/**
 * _limpiarHojaTRequisitosObsoleta() [→ Contexto_Base_Web.md §04B027]
 */
function _limpiarHojaTRequisitosObsoleta() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('T_Requisitos');

  if (sh) {
    if (ss.getSheets().length > 1) {
      try {
        ss.deleteSheet(sh);
        Logger.log('[Setup] Hoja "T_Requisitos" (obsoleta, reemplazada por CR_Lista) eliminada con éxito.');
      } catch(e) {
        Logger.log('[Setup] No se pudo eliminar "T_Requisitos": ' + e.message);
      }
    } else {
      Logger.log('[Setup] "T_Requisitos" es la única hoja, no se puede eliminar.');
    }
  }
}

/**
 * _limpiarHojaMenuObsoleta() [→ Contexto_Base_Web.md §04B028]
 */
function _limpiarHojaMenuObsoleta() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Menú');

  if (!_leerIndiceGuardado()) {
    if (sh) {
      Logger.log('[Setup] Hoja "Menú" (obsoleta) NO se elimina todavía: aún no existe el índice de contenido guardado. Se reintenta en la próxima corrida (o ejecutar inicializarIndiceContenido()).');
    }
    return;
  }

  if (sh) {
    if (ss.getSheets().length > 1) {
      try {
        ss.deleteSheet(sh);
        Logger.log('[Setup] Hoja "Menú" (obsoleta, reemplazada por el índice de contenido) eliminada con éxito.');
      } catch(e) {
        Logger.log('[Setup] No se pudo eliminar "Menú": ' + e.message);
      }
    } else {
      Logger.log('[Setup] "Menú" es la única hoja, no se puede eliminar.');
    }
  }

  _enviarRespaldosMenuAPapelera();
}

/**
 * _enviarRespaldosMenuAPapelera() [→ Contexto_Base_Web.md §04B029]
 */
function _enviarRespaldosMenuAPapelera() {
  try {
    var folder = _getCsvFolder();
    var nombres = ['Backup_Menu.csv', 'Backup_Menú.csv'];
    for (var i = 0; i < nombres.length; i++) {
      var files = folder.getFilesByName(nombres[i]);
      while (files.hasNext()) {
        files.next().setTrashed(true);
        Logger.log('[Setup] Respaldo obsoleto "' + nombres[i] + '" enviado a la papelera de Drive.');
      }
    }
  } catch (e) {
    Logger.log('[Setup] No se pudieron limpiar los respaldos de Menú: ' + e.message);
  }
}

/**
 * aplicarClipGlobal() [→ Contexto_Base_Web.md §04B030]
 */
function aplicarClipGlobal() {
  var ss = _getSs();
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var sh = sheets[i];
    var shName = sh.getName();
    var lastRow = sh.getLastRow();
    var lastCol = sh.getLastColumn();
    if (lastRow < 1 || lastCol < 1) continue;
    try {
      sh.getRange(1, 1, lastRow, lastCol)
        .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    } catch(e) {}
  }
  // Mensajes: altura 200px se mantiene, CLIP ya aplicado por generarTodosMensajes

  // FIX (17-ago-2026): mismo refuerzo que el de Menú!Contenido de arriba, [→ Contexto_Base_Web.md §04B031]
  var shMensajesClip = ss.getSheetByName(CFG.SHEETS.MENSAJES);
  if (shMensajesClip) {
    var lastRowMensajesClip = shMensajesClip.getLastRow();
    var lastColMensajesClip = shMensajesClip.getLastColumn();
    if (lastRowMensajesClip >= 1 && lastColMensajesClip >= 1) {
      var headersMensajesClip = shMensajesClip.getRange(1, 1, 1, lastColMensajesClip).getValues()[0];
      var colContenidoMensajesClip = -1;
      for (var hmc = 0; hmc < headersMensajesClip.length; hmc++) {
        if (String(headersMensajesClip[hmc] || '').trim() === 'Contenido') {
          colContenidoMensajesClip = hmc + 1;
          break;
        }
      }
      if (colContenidoMensajesClip > 0) {
        shMensajesClip.getRange(1, colContenidoMensajesClip, lastRowMensajesClip, 1)
          .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
      } else {
        Logger.log('[CLIP] Mensajes: no se encontró la columna "Contenido" en el encabezado (fila 1), se omite el refuerzo de WRAP.');
      }
    }
  }

  Logger.log('[CLIP] Ajuste CLIP aplicado a todo el documento (excepto Mensajes!Contenido, que se mantiene en Ajustar/WRAP).');
}
// ----- Variables y constantes -----

// ANCHOS DE COLUMNA POR NOMBRE DE ENCABEZADO (pedido usuario, esta corrida) [→ Contexto_Base_Web.md §04B032]

var ANCHOS_COLUMNAS_ARCHIVO = 'Anchos_Columnas_Fijos.json';

// EXCEPCIÓN — hoja "Calendario", columnas B..J (pedido usuario, 16-ago-2026). [→ Contexto_Base_Web.md §04B033]
var COL_INICIO_ANCHOS_CALENDARIO = 2;  // B

var COL_FIN_ANCHOS_CALENDARIO    = 10; // J
// ----- Funciones manuales / punto de entrada -----


// Fase 18 (17/07/2026): autoajuste de ancho de columna. [→ Contexto_Base_Web.md §04B034]

/**
 * autoajustarAnchoColumnas(nombreHoja) [→ Contexto_Base_Web.md §04B035]
 */
function autoajustarAnchoColumnas(nombreHoja, incluirOcultas) {
  var ss = _getSs();
  var hojas;
  var reanudable = !nombreHoja; // solo el recorrido de TODAS las hojas es reanudable

  // Colchón en píxeles que se suma DESPUÉS de autoResizeColumns(), para [→ Contexto_Base_Web.md §04B036]
  var COLCHON_PX = 16;

  // Ancho default de una columna nueva en Google Sheets (píxeles). Ahora es [→ Contexto_Base_Web.md §04B037]
  var DEFAULT_COL_WIDTH_PX = 100;

  // FIX (pedido usuario): archivo guardado por guardarAnchosColumnasFijos(), [→ Contexto_Base_Web.md §04B038]
  var anchosGuardados = _leerAnchosColumnasGuardados();

  if (nombreHoja) {
    var sh = ss.getSheetByName(nombreHoja);
    if (!sh) {
      Logger.log('[AutoAjuste] Hoja no encontrada: ' + nombreHoja);
      return true;
    }
    hojas = [sh];
  } else {
    hojas = ss.getSheets();
  }

  // REANUDABLE: progreso guardado en ScriptProperties, mismo criterio que [→ Contexto_Base_Web.md §04B039]
  var props = PropertiesService.getScriptProperties();
  var claveIdx = 'AUTOAJUSTE_ANCHO_IDX';
  var idxInicio = reanudable ? parseInt(props.getProperty(claveIdx) || '0', 10) : 0;
  if (idxInicio >= hojas.length) idxInicio = 0; // por si cambió la cantidad de hojas entre corridas

  var inicioTanda = Date.now();
  var procesadas = 0;
  var omitidas = 0;

  for (var i = idxInicio; i < hojas.length; i++) {
    var hoja = hojas[i];

    if (hoja.isSheetHidden() && !incluirOcultas) {
      omitidas++;
      continue;
    }

    var maxCol = hoja.getMaxColumns();
    if (maxCol < 1) {
      omitidas++;
      continue;
    }

    try {
      // FIX (pedido usuario, excepción "Nuevos"): rango de columnas que el [→ Contexto_Base_Web.md §04B040]
      var limiteGenerico = Math.min(maxCol, _limiteColumnasParaAnchoPorEncabezado(hoja));

      // FIX (pedido usuario, mapa de anchos guardados para ESTA hoja en [→ Contexto_Base_Web.md §04B041]
      var mapaHojaGuardado = anchosGuardados[hoja.getName()] || {};

      // FIX (pedido usuario): encabezados de fila 1, para poder emparejar [→ Contexto_Base_Web.md §04B042]
      var encabezados = [];
      if (limiteGenerico >= 1) {
        try {
          // FIX (16-ago-2026): mismo bug que guardarAnchosColumnasFijos()/ [→ Contexto_Base_Web.md §04B043]
          var filaHeaderAutoajuste = _filaEncabezadoParaAnchos(hoja);
          encabezados = _clavesColumnasParaAnchos(hoja, filaHeaderAutoajuste, limiteGenerico);
        } catch (eHead) {
          encabezados = [];
        }
      }

      // PASO 1: detectar, columna por columna (hasta limiteGenerico), [→ Contexto_Base_Web.md §04B044]
      var colsFijas = [];
      var colsFijasPorGuardado = 0;
      var colsAutoajustables = [];
      for (var c = 1; c <= limiteGenerico; c++) {
        var nombreColActual = String(encabezados[c - 1] || '').trim();
        var anchoGuardadoCol = nombreColActual ? mapaHojaGuardado[nombreColActual] : undefined;

        if (anchoGuardadoCol !== undefined) {
          // Ancho fijo explícito (guardado por nombre de encabezado): se [→ Contexto_Base_Web.md §04B045]
          hoja.setColumnWidth(c, anchoGuardadoCol);
          colsFijas.push(c);
          colsFijasPorGuardado++;
        } else if (hoja.getColumnWidth(c) !== DEFAULT_COL_WIDTH_PX) {
          // Respaldo: mismo heurístico de antes, solo para columnas sin
          // ancho guardado explícitamente.
          colsFijas.push(c);
        } else {
          colsAutoajustables.push(c);
        }
      }

      // PASO 2: autoajustar solo las columnas sin ancho fijo. Se agrupan [→ Contexto_Base_Web.md §04B046]
      var rangos = _agruparColumnasContiguas(colsAutoajustables);
      for (var r = 0; r < rangos.length; r++) {
        hoja.autoResizeColumns(rangos[r][0], rangos[r][1] - rangos[r][0] + 1);
      }

      // PASO 3: colchón manual (ver nota FIX arriba) — solo sobre las
      // columnas recién autoajustadas, nunca sobre las de ancho fijo.
      for (var k = 0; k < colsAutoajustables.length; k++) {
        var col = colsAutoajustables[k];
        hoja.setColumnWidth(col, hoja.getColumnWidth(col) + COLCHON_PX);
      }

      // PASO 4 (pedido usuario, excepción "Nuevos"): franja del historial [→ Contexto_Base_Web.md §04B047]
      var colsGridNuevos = _aplicarAnchosFijosGridHistorialNuevos(hoja, maxCol);

      procesadas++;
      Logger.log('[AutoAjuste] ' + hoja.getName() + ': ' + colsAutoajustables.length +
                 ' columna(s) autoajustada(s) (+' + COLCHON_PX + 'px de colchón), ' +
                 colsFijas.length + ' columna(s) con ancho fijo respetada(s) sin cambios (' +
                 colsFijasPorGuardado + ' de ellas por archivo guardado, ' +
                 (colsFijas.length - colsFijasPorGuardado) + ' por heurístico)' +
                 (colsGridNuevos > 0 ? ', ' + colsGridNuevos + ' columna(s) del historial RoyaleAPI con ancho fijo por posición' : '') +
                 '.');
    } catch (e) {
      omitidas++;
      Logger.log('[AutoAjuste] ' + hoja.getName() + ': error al autoajustar (' + e.message + '), se omite.');
    }

    // REANUDABLE (ver nota FIX arriba): chequeo de presupuesto interno [→ Contexto_Base_Web.md §04B048]
    var quedanHojas = (i + 1) < hojas.length;
    if (reanudable && quedanHojas && (Date.now() - inicioTanda) > CFG.AUTOAJUSTE_ANCHO_BUDGET_MS) {
      props.setProperty(claveIdx, String(i + 1));
      Logger.log('[AutoAjuste] Presupuesto interno agotado tras la hoja ' + (i + 1) + '/' + hojas.length +
                 ' (' + hoja.getName() + '). Procesadas en esta tanda: ' + procesadas + ', omitidas: ' + omitidas +
                 '. Se reintenta el mismo paso en la próxima continuación.');
      return false;
    }
  }

  if (reanudable) props.deleteProperty(claveIdx);
  Logger.log('[AutoAjuste] Terminado. Hojas procesadas: ' + procesadas + ', omitidas: ' + omitidas + '.');
  return true;
}

/**
 * autoajustarAnchoColumnasCompleto() [→ Contexto_Base_Web.md §04B049]
 */
function autoajustarAnchoColumnasCompleto() {
  while (!autoajustarAnchoColumnas()) { /* continúa hasta terminar */ }
}

/**
 * autoajustarHojasSinAnchosGuardados() [→ Contexto_Base_Web.md §04B050]
 */
function autoajustarHojasSinAnchosGuardados() {
  var ss = _getSs();
  var guardado = _leerAnchosColumnasGuardados();
  var props = PropertiesService.getScriptProperties();
  var claveIdx = 'AUTOAJUSTE_SIN_GUARDAR_IDX';

  var pendientes = [];
  var hojas = ss.getSheets();
  for (var h = 0; h < hojas.length; h++) {
    var nombre = hojas[h].getName();
    if (nombre === CFG.SHEETS.CALENDARIO) continue;
    if (guardado[nombre]) continue; // ya tiene anchos guardados: lo maneja restaurarAnchosColumnasFijos()
    pendientes.push(nombre);
  }

  if (pendientes.length === 0) {
    props.deleteProperty(claveIdx);
    Logger.log('[AutoAjuste] Todas las hojas ya tienen anchos guardados, nada que autoajustar.');
    return true;
  }

  var idxInicio = parseInt(props.getProperty(claveIdx) || '0', 10);
  if (isNaN(idxInicio) || idxInicio >= pendientes.length) idxInicio = 0;

  var inicioTanda = Date.now();
  for (var i = idxInicio; i < pendientes.length; i++) {
    try {
      autoajustarAnchoColumnas(pendientes[i], true);
    } catch (e) {
      Logger.log('[AutoAjuste] ' + pendientes[i] + ': error al autoajustar hoja sin anchos guardados (' + e.message + '), se omite.');
    }

    if ((i + 1) < pendientes.length && (Date.now() - inicioTanda) > CFG.AUTOAJUSTE_ANCHO_BUDGET_MS) {
      props.setProperty(claveIdx, String(i + 1));
      Logger.log('[AutoAjuste] Presupuesto interno agotado tras ' + (i + 1) + '/' + pendientes.length +
                 ' hojas sin anchos guardados. Se reintenta el mismo paso en la próxima continuación.');
      _logProgresoPaso_('AutoAjuste', 'hojas sin anchos guardados autoajustadas', idxInicio, (i + 1) - idxInicio, pendientes.length, 'hojas'); // PF285
      return false;
    }
  }

  props.deleteProperty(claveIdx);
  Logger.log('[AutoAjuste] Hojas sin anchos guardados autoajustadas: ' + pendientes.length + ' (' + pendientes.join(', ') + ').');
  return true;
}

/**
 * guardarAnchosColumnasFijos(nombreHoja) [→ Contexto_Base_Web.md §04B051]
 */
function guardarAnchosColumnasFijos(nombreHoja) {
  var ss = _getSs();
  var hojas;

  if (nombreHoja) {
    var shUnica = ss.getSheetByName(nombreHoja);
    if (!shUnica) {
      Logger.log('[AnchosColumnas] Hoja no encontrada: ' + nombreHoja);
      return;
    }
    hojas = [shUnica];
  } else {
    hojas = ss.getSheets();
  }

  var guardado = _leerAnchosColumnasGuardados(); // mezcla sobre lo existente
  var hojasProcesadas = 0;
  var columnasGuardadas = 0;
  // FIX (pedido usuario, esta corrida): contadores separados para el LOG de [→ Contexto_Base_Web.md §04B052]
  var hojasConCambios = 0;
  var columnasActualizadas = 0;

  for (var i = 0; i < hojas.length; i++) {
    var hoja = hojas[i];

    var maxCol = hoja.getMaxColumns();
    if (maxCol < 1 || hoja.getMaxRows() < 1) {
      Logger.log('[AnchosColumnas] ' + hoja.getName() + ': sin columnas/filas, se omite.');
      continue;
    }

    // FIX (pedido usuario, excepción "Nuevos"): no escanear más allá del [→ Contexto_Base_Web.md §04B053]
    var maxColHeader = Math.min(maxCol, _limiteColumnasParaAnchoPorEncabezado(hoja));
    if (maxColHeader < 1) {
      Logger.log('[AnchosColumnas] ' + hoja.getName() + ': toda la hoja cae en la franja dinámica excluida, se omite.');
      continue;
    }

    var encabezados;
    try {
      var filaHeaderGuardar = _filaEncabezadoParaAnchos(hoja);
      encabezados = _clavesColumnasParaAnchos(hoja, filaHeaderGuardar, maxColHeader);
    } catch (e) {
      Logger.log('[AnchosColumnas] ' + hoja.getName() + ': no se pudo leer la fila de encabezados (' + e.message + '), se omite.');
      continue;
    }

    // Valores guardados ANTES de esta corrida para esta hoja puntual -- [→ Contexto_Base_Web.md §04B054]
    var mapaAnteriorHoja = guardado[hoja.getName()] || {};

    var mapaHoja = {};
    var encontrados = 0;
    var cambiados = 0;
    for (var c = 0; c < maxColHeader; c++) {
      var nombreCol = String(encabezados[c] || '').trim();
      if (!nombreCol) continue; // columnas sin encabezado no se guardan (no hay forma de identificarlas luego)
      var anchoNuevo = hoja.getColumnWidth(c + 1);
      mapaHoja[nombreCol] = anchoNuevo;
      encontrados++;
      if (mapaAnteriorHoja[nombreCol] !== anchoNuevo) cambiados++;
    }

    guardado[hoja.getName()] = mapaHoja;
    hojasProcesadas++;
    columnasGuardadas += encontrados;

    if (cambiados > 0) {
      hojasConCambios++;
      columnasActualizadas += cambiados;
      Logger.log('[AnchosColumnas] ' + hoja.getName() + ': ' + cambiados + ' columna(s) con ancho actualizado.');
    }
  }

  _escribirAnchosColumnasGuardados(guardado);
  Logger.log('[AnchosColumnas] Guardado en Drive (' + ANCHOS_COLUMNAS_ARCHIVO + '). Hojas procesadas: ' +
             hojasProcesadas + ', hojas con cambios: ' + hojasConCambios + ', columnas actualizadas: ' + columnasActualizadas + '.');
}

/**
 * restaurarAnchosColumnasFijos(nombreHoja) [→ Contexto_Base_Web.md §04B055]
 */
function restaurarAnchosColumnasFijos(nombreHoja) {
  var ss = _getSs();
  var guardado = _leerAnchosColumnasGuardados();

  if (nombreHoja && !guardado[nombreHoja]) {
    Logger.log('[AnchosColumnas] No hay anchos guardados para la hoja: ' + nombreHoja);
    return;
  }
  var nombresHojas = nombreHoja ? [nombreHoja] : Object.keys(guardado);

  if (nombresHojas.length === 0) {
    Logger.log('[AnchosColumnas] No hay ningún ancho guardado todavía (correr guardarAnchosColumnasFijos() primero).');
    return;
  }

  var hojasProcesadas = 0;
  var columnasRestauradas = 0;

  for (var i = 0; i < nombresHojas.length; i++) {
    var nombre = nombresHojas[i];
    var mapaHoja = guardado[nombre];
    if (!mapaHoja) continue;

    var hoja = ss.getSheetByName(nombre);
    if (!hoja) {
      Logger.log('[AnchosColumnas] ' + nombre + ': hay anchos guardados pero la hoja ya no existe, se omite.');
      continue;
    }

    var maxCol = hoja.getMaxColumns();
    if (maxCol < 1 || hoja.getMaxRows() < 1) continue;

    // FIX (pedido usuario, excepción "Nuevos"): mismo límite que [→ Contexto_Base_Web.md §04B056]
    var maxColHeader = Math.min(maxCol, _limiteColumnasParaAnchoPorEncabezado(hoja));
    if (maxColHeader < 1) continue;

    var encabezados;
    try {
      var filaHeaderRestaurar = _filaEncabezadoParaAnchos(hoja);
      encabezados = _clavesColumnasParaAnchos(hoja, filaHeaderRestaurar, maxColHeader);
    } catch (e) {
      Logger.log('[AnchosColumnas] ' + nombre + ': no se pudo leer la fila de encabezados (' + e.message + '), se omite.');
      continue;
    }

    var restauradasHoja = 0;
    for (var c = 0; c < maxColHeader; c++) {
      var nombreCol = String(encabezados[c] || '').trim();
      if (!nombreCol) continue;
      var anchoGuardado = mapaHoja[nombreCol];
      if (anchoGuardado === undefined) continue; // sin ancho guardado para este encabezado
      hoja.setColumnWidth(c + 1, anchoGuardado);
      restauradasHoja++;
    }

    // FIX (pedido usuario): al restaurar la hoja "Nuevos", reaplicar de [→ Contexto_Base_Web.md §04B057]
    var colsGridRestauradas = _aplicarAnchosFijosGridHistorialNuevos(hoja, maxCol);
    restauradasHoja += colsGridRestauradas;

    hojasProcesadas++;
    columnasRestauradas += restauradasHoja;
    Logger.log('[AnchosColumnas] ' + nombre + ': ' + restauradasHoja + ' columna(s) restaurada(s) (' +
               (restauradasHoja - colsGridRestauradas) + ' por encabezado' +
               (colsGridRestauradas > 0 ? ', ' + colsGridRestauradas + ' por franja fija de historial Nuevos' : '') + ').');
  }

  Logger.log('[AnchosColumnas] Restauración terminada. Hojas procesadas: ' + hojasProcesadas +
             ', columnas restauradas: ' + columnasRestauradas + '.');
}

// ----- Funciones internas / helpers -----

/**
 * _clavesColumnasParaAnchos(hoja, filaHeader, limiteGenerico) [→ Contexto_Base_Web.md §04B058]
 */
function _clavesColumnasParaAnchos(hoja, filaHeader, limiteGenerico) {
  if (limiteGenerico < 1) return [];

  if (hoja.getName() === CFG.SHEETS.CALENDARIO) {
    var claves = [];
    for (var c = 1; c <= limiteGenerico; c++) {
      claves.push((c >= COL_INICIO_ANCHOS_CALENDARIO && c <= COL_FIN_ANCHOS_CALENDARIO)
        ? colLetter(c) : '');
    }
    return claves;
  }

  if (hoja.getMaxRows() < filaHeader) return [];
  try {
    var rango = hoja.getRange(filaHeader, 1, 1, limiteGenerico);
    var valores = rango.getValues()[0];

    // FIX (18-sep-2026, pedido usuario): "si hay más de una fila de [→ Contexto_Base_Web.md §04B059]
    var mergedRanges = rango.getMergedRanges();
    for (var i = 0; i < mergedRanges.length; i++) {
      var merged = mergedRanges[i];
      var anclaValor = hoja.getRange(merged.getRow(), merged.getColumn()).getValue();
      var colInicio = merged.getColumn();
      var colFin = colInicio + merged.getNumColumns() - 1;
      for (var c = colInicio; c <= colFin; c++) {
        var idx = c - 1; // 0-based dentro de 'valores'
        if (idx >= 0 && idx < valores.length) valores[idx] = anclaValor;
      }
    }

    // FIX (17-ago-2026, ver docblock arriba): desambiguar encabezados [→ Contexto_Base_Web.md §04B060]
    var vistos = {};
    return valores.map(function (v) {
      var texto = String(v || '').trim();
      if (!texto) return '';
      vistos[texto] = (vistos[texto] || 0) + 1;
      return (vistos[texto] > 1) ? (texto + '#' + vistos[texto]) : texto;
    });
  } catch (e) {
    return [];
  }
}

// EXCEPCIÓN — hoja "Nuevos", franja dinámica del historial RoyaleAPI [→ Contexto_Base_Web.md §04B061]

/**
 * _limiteColumnasParaAnchoPorEncabezado(hoja) [→ Contexto_Base_Web.md §04B062]
 */
/**
 * _filaEncabezadoParaAnchos(hoja) [→ Contexto_Base_Web.md §04B063]
 */
function _filaEncabezadoParaAnchos(hoja) {
  return hoja.getFrozenRows() || 1;
}

function _limiteColumnasParaAnchoPorEncabezado(hoja) {
  if (hoja.getName() === CFG.SHEETS.NUEVOS && typeof COL_INICIO_GRID_NUEVOS !== 'undefined') {
    return COL_INICIO_GRID_NUEVOS - 1;
  }
  return hoja.getMaxColumns();
}

/**
 * _aplicarAnchosFijosGridHistorialNuevos(hoja, maxCol) [→ Contexto_Base_Web.md §04B064]
 */
function _aplicarAnchosFijosGridHistorialNuevos(hoja, maxCol) {
  // FIX (17-ago-2026, pedido usuario): esta función se llama para TODAS las [→ Contexto_Base_Web.md §04B065]
  if (hoja.getName() !== CFG.SHEETS.NUEVOS) return 0;
  if (typeof COL_INICIO_GRID_NUEVOS === 'undefined') return 0;
  if (maxCol < COL_INICIO_GRID_NUEVOS) return 0;

  // Ancho fijo por posición dentro de cada bloque de 4 columnas, en el [→ Contexto_Base_Web.md §04B066]
  var ANCHOS_GRID_NUEVOS_PX = [120, 80, 62, 72]; // [Clan, Ataques, Fame, Barcos]

  var ajustadas = 0;
  for (var c = COL_INICIO_GRID_NUEVOS; c <= maxCol; c++) {
    var offset = (c - COL_INICIO_GRID_NUEVOS) % GRID_BLOQUE_ANCHO_NUEVOS;
    hoja.setColumnWidth(c, ANCHOS_GRID_NUEVOS_PX[offset]);
    ajustadas++;
  }
  return ajustadas;
}

/**
 * _leerAnchosColumnasGuardados() [→ Contexto_Base_Web.md §04B067]
 */
function _leerAnchosColumnasGuardados() {
  // (25-sep-2026, FASE B) Ahora en "Otros" (DRIVE_FOLDER_ID_OTROS) — antes [→ Contexto_Base_Web.md §04B068]
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var files = folder.getFilesByName(ANCHOS_COLUMNAS_ARCHIVO);
    if (!files.hasNext()) return {};
    var contenido = files.next().getBlob().getDataAsString('UTF-8');
    return contenido ? JSON.parse(contenido) : {};
  } catch (e) {
    Logger.log('[AnchosColumnas] No se pudo leer ' + ANCHOS_COLUMNAS_ARCHIVO + ' (' + e.message + '), se asume vacío.');
    return {};
  }
}

/**
 * _escribirAnchosColumnasGuardados(datos) [→ Contexto_Base_Web.md §04B069]
 */
function _escribirAnchosColumnasGuardados(datos) {
  // (25-sep-2026, FASE B) Ahora en "Otros" (DRIVE_FOLDER_ID_OTROS), igual
  // que _leerAnchosColumnasGuardados() más arriba en este archivo.
  var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
  var contenido = JSON.stringify(datos, null, 2);
  var files = folder.getFilesByName(ANCHOS_COLUMNAS_ARCHIVO);
  if (files.hasNext()) {
    _setContentConConteo_(files.next(), contenido);
  } else {
    _createFileConConteo_(folder, ANCHOS_COLUMNAS_ARCHIVO, contenido, MimeType.PLAIN_TEXT);
  }
}

/**
 * _agruparColumnasContiguas(cols) [→ Contexto_Base_Web.md §04B070]
 */
function _agruparColumnasContiguas(cols) {
  var rangos = [];
  for (var i = 0; i < cols.length; i++) {
    if (i === 0 || cols[i] !== cols[i - 1] + 1) {
      rangos.push([cols[i], cols[i]]);
    } else {
      rangos[rangos.length - 1][1] = cols[i];
    }
  }
  return rangos;
}