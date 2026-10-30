// ==============================================================================
// 05_Backup_CSV.gs
// Sistema de respaldo y sincronizacion CSV <-> hojas, para todas las hojas del proyecto.
// ==============================================================================

// ----- Variables y constantes -----

// _BACKUP_OMITIR_CHECK_CLAVES_: solo la migración de ids de evento (47_Migraciones.gs) la pone en true, mientras rehace los respaldos de las listas y la asistencia, para que la protección por claves no bloquee un cambio de ids intencional. Siempre vuelve a false. [→ Contexto_Base_Web.md §PF286]
var _BACKUP_OMITIR_CHECK_CLAVES_ = false;

// ----- Funciones manuales / punto de entrada -----

// AVISOS ABIERTOS / VERIFICACIONES ABIERTAS [→ Contexto_Base_Web.md §05B001]

// Backup JSON de celulares y Sincronización Bidireccional de CSV. [→ Contexto_Base_Web.md §05B002]


// NOTA DE REORDEN (23-ago-2026, pedido usuario): las funciones manuales [→ Contexto_Base_Web.md §05B003]
/**
 * syncClanCSV() [→ Contexto_Base_Web.md §05B004]
 */
function syncClanCSV() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.CLAN);
  if (!sh || sh.getLastRow() < 2) return;

  var lastRow = sh.getLastRow();
  var numCols = CC.CONDICION;
  var data    = _extraerValoresConLinksReales(sh, lastRow, numCols);

  _saveCSVToDrive('Backup_Clan.csv', _encodeCSV(data));
  Logger.log('[Backup] Backup_Clan.csv sincronizado.');
}

/**
 * exportarBackupCelulares()
 * Guarda en Drive los campos manuales del Directorio como JSON.
 */
function exportarBackupCelulares() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!sh || sh.getLastRow() < 2) return;

  // Leer encabezados de la fila 1 para mapear por nombre (no por índice fijo)
  var numCols = Math.max(sh.getLastColumn(), DIR_SHEET_COLS);
  var headerRow = sh.getRange(1, 1, 1, numCols).getValues()[0];
  var H = {};
  for (var h = 0; h < headerRow.length; h++) {
    var hName = String(headerRow[h] || '').trim();
    if (hName) H[hName] = h;
  }
  var iTag     = H['Tag']      !== undefined ? H['Tag']      : (DC.TAG      - 1);
  var iPrefijo = H['Prefijo']  !== undefined ? H['Prefijo']  : (DC.PREFIJO  - 1);
  var iCelular = H['Celular']  !== undefined ? H['Celular']  : (DC.CELULAR  - 1);
  var iWspG    = H['WSP(G)']   !== undefined ? H['WSP(G)']   :
                (H['WSP_G']    !== undefined ? H['WSP_G']    : (DC.WSP_G    - 1));
  var iEtiqueta= H['Etiqueta'] !== undefined ? H['Etiqueta'] : (DC.ETIQUETA - 1);
  var iFechaIng= H['Fecha_ing']!== undefined ? H['Fecha_ing']: (DC.FECHA_ING- 1);
  var iVetado  = H['Vetado']   !== undefined ? H['Vetado']   : (DC.VETADO   - 1);
  var iRazon   = H['Razón']    !== undefined ? H['Razón']    :
                (H['Razon']    !== undefined ? H['Razon']    : (DC.RAZON    - 1));

  var data = sh.getRange(2, 1, sh.getLastRow() - 1, numCols).getValues();
  var backupData = [];

  for (var i = 0; i < data.length; i++) {
    var tag = String(data[i][iTag] || '').trim(); // Tag
    if (tag) {
      backupData.push({
        tag:       tag,
        prefijo:   soloDigitos(data[i][iPrefijo]), // Prefijo
        celular:   soloDigitos(data[i][iCelular]), // Celular
        wsp_g:     String(data[i][iWspG]     || ''), // WSP(G)
        etiqueta:  String(data[i][iEtiqueta] || ''), // Etiqueta
        fecha_ing: data[i][iFechaIng]        || '',  // Fecha_ing
        vetado:    String(data[i][iVetado]   || ''), // Vetado
        razon:     String(data[i][iRazon]    || '')  // Razón
      });
    }
  }

  // (25-sep-2026, FASE B) ClanSystem_Backup_Celulares.json se escribe ahora [→ Contexto_Base_Web.md §05B005]
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var filename = 'ClanSystem_Backup_Celulares.json';
    var files = folder.getFilesByName(filename);
    var content = JSON.stringify(backupData, null, 2);

    if (files.hasNext()) {
      _setContentConConteo_(files.next(), content);
    } else {
      _createFileConConteo_(folder, filename, content, MimeType.PLAIN_TEXT);
    }
    Logger.log('[Backup] JSON celulares guardado exitosamente (' + backupData.length + ' registros).');
  } catch(e) {
    Logger.log('[Backup] Error guardando JSON: ' + e.message);
  }
}

function importarBackupCelulares() {
  Logger.log('[Backup] Importación delegada a lectura en vivo desde _getCsvDirMap().');
}

function importarDirectorioDesdeCSV() {
  Logger.log('[Backup] Importación delegada a lectura en vivo desde _getCsvDirMap().');
}

/**
 * respaldarHojasRestantesCSV() [→ Contexto_Base_Web.md §05B006]
 */
function respaldarHojasRestantesCSV() {
  respaldarIndiceYProtegidasCSV();
  // respaldarHojasDerivadasCSV() ahora es reanudable (devuelve false si le [→ Contexto_Base_Web.md §05B007]
  while (!respaldarHojasDerivadasCSV()) { /* continúa hasta terminar */ }
}

// PF146 (21-oct-2026): claves de los 8 respaldos de respaldarIndiceYProtegidasCSV(), en el orden en que se hacen.
var PROTEGIDAS_CSV_CLAVES = ['INDICE', 'VETADOS', 'T_LISTA', 'S_LISTA', 'CR_LISTA', 'T_ASISTENCIA', 'S_ASISTENCIA', 'EXTRA'];

function _tocaProtegida_(soloClave, clave) {
  return !soloClave || soloClave === clave;
}

/**
 * respaldarIndiceYProtegidasCSV() [→ Contexto_Base_Web.md §05B008]
 */
function respaldarIndiceYProtegidasCSV(soloClave) {
  // PF146 (21-oct-2026): parametro opcional. Sin argumento hace los 8 respaldos, igual que antes (lo usan runAll,
  // runUpdate y los botones manuales). Con una clave de PROTEGIDAS_CSV_CLAVES hace solo ese respaldo; asi
  // PASOS_RUNSYNCCSV lo reparte en 8 pasos y _ejecutarPorTandas puede cortar entre uno y otro. [→ Contexto_Base_Web.md §PF146]
  var ss = _getSs();
  // FIX (18-sep-2026, pedido usuario -- "el ID de la hoja de cambio de [→ Contexto_Base_Web.md §05B009]
  if (_tocaProtegida_(soloClave, 'INDICE')) try {
    _respaldarIndiceCSV(ss);
  } catch (eIdx) {
    Logger.log('[Backup] ERROR respaldando Índice: ' + eIdx.message + ' -- se continúa con el resto de hojas protegidas.');
  }

  // Hojas protegidas (edición manual, se bloquea si se reducen las filas). [→ Contexto_Base_Web.md §05B010]
  if (_tocaProtegida_(soloClave, 'VETADOS')) try {
    _respaldarListaHojasCSV(ss, [CFG.SHEETS.VETADOS], true, 2, _colSet(VC.FECHA));
  } catch (eVet) {
    Logger.log('[Backup] ERROR respaldando Vetados: ' + eVet.message + ' -- se continúa con el resto de hojas protegidas.');
  }
  if (_tocaProtegida_(soloClave, 'T_LISTA')) try {
    // FASE 5 (25-sep-2026, rediseño T_Lista -- ver punto B-bis y comentario [→ Contexto_Base_Web.md §05B011]
    _respaldarListaHojasCSV(ss, [CFG.SHEETS.T_LISTA], true, null, null, _colSet(TL.PREPARACION, TL.DURACION));
  } catch (eTL) {
    Logger.log('[Backup] ERROR respaldando T_Lista: ' + eTL.message + ' -- se continúa con el resto de hojas protegidas.');
  }
  // FASE (07-sep-2026, pedido del usuario): S_Lista es la hoja análoga a [→ Contexto_Base_Web.md §05B012]
  if (_tocaProtegida_(soloClave, 'S_LISTA')) try {
    _respaldarListaHojasCSV(ss, [CFG.SHEETS.S_LISTA], true);
    _aplicarDropdownId2SLista(ss);
    _aplicarDropdownEstadoSLista(ss);
    _aplicarDropdownMiembroActivoSLista(ss);
    _aplicarDropdownReaccionSLista(ss);
    // FIX (12-sep-2026, pedido del usuario): faltaba reaplicar aquí también el [→ Contexto_Base_Web.md §05B013]
    _aplicarDropdownWhatsappSLista(ss);
  } catch (eSL) {
    Logger.log('[Backup] ERROR respaldando S_Lista (o sus dropdowns): ' + eSL.message + ' -- se continúa con el resto de hojas protegidas.');
  }
  // NUEVO (13-sep-2026, pedido del usuario): CR_Lista ya tiene su propio [→ Contexto_Base_Web.md §05B014]
  if (_tocaProtegida_(soloClave, 'CR_LISTA')) try {
    _respaldarListaHojasCSV(ss, [CFG.SHEETS.CR_LISTA], true);
    _aplicarDropdownTipoCRLista(ss);
    // NUEVO (16-sep-2026, pedido del usuario): mismo criterio que el [→ Contexto_Base_Web.md §05B015]
    _aplicarDropdownEstadoCRLista(ss);
  } catch (eCR) {
    Logger.log('[Backup] ERROR respaldando CR_Lista (o sus dropdowns): ' + eCR.message + ' -- se continúa con el resto de hojas protegidas.');
  }
  // FIX (07-sep-2026, reportado por el usuario -- "T_Asistencia y T_Control [→ Contexto_Base_Web.md §05B016]
  if (_tocaProtegida_(soloClave, 'T_ASISTENCIA')) try {
    _respaldarListaHojasCSV(ss, [CFG.SHEETS.T_ASISTENCIA], true, TA.ID);
  } catch (eTA) {
    Logger.log('[Backup] ERROR respaldando T_Asistencia: ' + eTA.message + ' -- se continúa con el resto de hojas protegidas.');
  }

  // RESUELTO (10-sep-2026, pedido usuario -- ver Consolidado_Cambios_ [→ Contexto_Base_Web.md §05B017]
  if (_tocaProtegida_(soloClave, 'S_ASISTENCIA')) try {
    _respaldarListaHojasCSV(ss, [CFG.SHEETS.S_ASISTENCIA], true, SA.ID, (function () { var m = {}; m[SA.FECHA] = true; return m; })()); // PF222: Fecha como número (ms), no como texto
  } catch (eSA) {
    Logger.log('[Backup] ERROR respaldando S_Asistencia: ' + eSA.message + ' -- se continúa con el resto de hojas protegidas.');
  }

  // FIX (27-sep-2026, pedido del usuario -- ver docblock completo de [→ Contexto_Base_Web.md §05B018]
  if (_tocaProtegida_(soloClave, 'EXTRA')) try {
    _respaldarListaHojasCSV(ss, [CFG.SHEETS.EXTRA], true);
  } catch (eExtra) {
    Logger.log('[Backup] ERROR respaldando Extra: ' + eExtra.message + ' -- se continúa con el resto de hojas protegidas.');
  }
}

/**
 * respaldarHojasDerivadasCSV() [→ Contexto_Base_Web.md §05B019]
 */
function respaldarHojasDerivadasCSV(presupuestoMs) {
  // PF282 (26-oct-2026): parametro opcional. Sin argumento usa CFG.RESPALDO_DERIVADAS_BUDGET_MS (60 s), igual que antes.
  // Con 0 hace UNA sola hoja por llamada y devuelve false mientras queden (PASOS_RUNSYNCCSV lo usa asi: cada hoja corre en su
  // propia ejecucion, porque el 25-oct la hoja Links sola tardo ~299 s y la tanda murio justo despues). [→ Contexto_Base_Web.md §PF282]
  var presupuesto = (typeof presupuestoMs === 'number') ? presupuestoMs : CFG.RESPALDO_DERIVADAS_BUDGET_MS;
  var ss = _getSs();

  // Hojas protegidas: excluidas de "derivadas" (se respaldan aparte, en [→ Contexto_Base_Web.md §05B020]
  var hojasProtegidas = [CFG.SHEETS.VETADOS];

  // Hojas con mecanismo de respaldo DEDICADO en otra función (no se deben [→ Contexto_Base_Web.md §05B021]
  var hojasConRespaldoDedicado = [
  CFG.SHEETS.DIRECTORIO, CFG.SHEETS.CLAN, CFG.SHEETS.GUERRA, CFG.SHEETS.INDICE,
  CFG.SHEETS.COMENTARIOS, CFG.SHEETS.CALENDARIO2,
  CFG.SHEETS.GUERRA_LOGS, CFG.SHEETS.HISTORIAL, CFG.SHEETS.INACTIVOS, CFG.SHEETS.ASCENSOS,
  CFG.SHEETS.T_LISTA, CFG.SHEETS.T_ASISTENCIA, CFG.SHEETS.S_LISTA, CFG.SHEETS.S_ASISTENCIA,
  CFG.SHEETS.CR_LISTA, CFG.SHEETS.EXTRA,
  'Battlelogs'
];

  // Todas las demás hojas del spreadsheet (existentes o nuevas) se tratan [→ Contexto_Base_Web.md §05B022]
  var excluidas = hojasProtegidas.concat(hojasConRespaldoDedicado);
  var hojasDerivadas = ss.getSheets()
    .map(function(sh) { return sh.getName(); })
    .filter(function(nombre) { return excluidas.indexOf(nombre) < 0; });

  var props     = PropertiesService.getScriptProperties();
  var claveIdx   = 'RESPALDO_DERIVADAS_IDX';
  var idxInicio  = parseInt(props.getProperty(claveIdx) || '0', 10);
  if (idxInicio >= hojasDerivadas.length) idxInicio = 0; // por si cambió la lista de hojas entre corridas

  var inicio = Date.now();
  var i;
  for (i = idxInicio; i < hojasDerivadas.length; i++) {
    var inicioHoja = Date.now();
    _respaldarListaHojasCSV(ss, [hojasDerivadas[i]], false);
    Logger.log('[Backup] respaldarHojasDerivadasCSV: hoja ' + (i + 1) + '/' + hojasDerivadas.length + ' (' + hojasDerivadas[i] + ') en ' +
               Math.round((Date.now() - inicioHoja) / 1000) + ' s.'); // PF282: tiempo por hoja, para ubicar la lenta
    _anotarProgresoPaso_('hoja ' + (i + 1) + '/' + hojasDerivadas.length + ' (' + hojasDerivadas[i] + ')', i + 1); // PF283

    var quedanHojas = (i + 1) < hojasDerivadas.length;
    if (quedanHojas && (presupuesto === 0 || (Date.now() - inicio) > presupuesto)) {
      props.setProperty(claveIdx, String(i + 1));
      Logger.log('[Backup] respaldarHojasDerivadasCSV: presupuesto interno agotado tras la hoja ' +
                 (i + 1) + '/' + hojasDerivadas.length + ' (' + hojasDerivadas[i] + '). ' +
                 'Se reintenta el mismo paso en la próxima continuación.');
      return false;
    }
  }

  props.deleteProperty(claveIdx);
  return true;
}

// CSV Sync Operations [→ Contexto_Base_Web.md §05B023]

/**
 * syncDirectorioCSV() [→ Contexto_Base_Web.md §05B024]
 */
/**
 * DC_HEADERS_60_COLS [→ Contexto_Base_Web.md §05B025]
 */
var DC_HEADERS_60_COLS = [
  'N°','Tag','Nombre','Jugador','Nom_Multi','Préstamo','Multicuenta','Permiso',
  'Antigüedad','Nivel','Nivel2','Copas','Copas_max','Arena','V_Guerra',
  'Victorias','Derrotas','Batallas','Racha',
  'Camino de leyendas_Liga','Camino de leyendas_Trofeos','Camino de leyendas_Rango',
  'Victorias de tres coronas','Max_victorias_desafíos','Torneos','Emotes','Banners',
  'Cartas_desafíos','Cartas_torneos',
  'Donaciones_r','Donaciones_d',
  'Ranking','Ranking_p','Rango','Clan','ClanTag','Líder',
  'Iniciales','Prefijo','Celular','WSP(G)','Etiqueta',
  'WSP','RoyaleAPI','Mazo','Mazo2','CWStats','Render',
  'Fecha_ing','Fecha_lim','Vigencia','Inactividad(d)',
  'Alerta','Estado','Comentario','Vetado','Razón','Admin','Cat_disp',
  'Clanes_Admin'
];

function syncDirectorioCSV() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!sh || sh.getLastRow() < 2) return;

  // Encabezados de las 60 columnas históricas, en el orden de DC -- ver
  // DC_HEADERS_60_COLS justo arriba en este archivo.
  var headers = DC_HEADERS_60_COLS;

  // Filas combinadas Directorio+Players+Links, ya en formato DC (60 cols).
  var filasDC = _leerDirectorioFisicoComoDC(ss);

  // Prefijo y Celular NUNCA deben exportarse con el formato visual.
  for (var i = 0; i < filasDC.length; i++) {
    filasDC[i][DC.PREFIJO - 1] = soloDigitos(filasDC[i][DC.PREFIJO - 1]);
    filasDC[i][DC.CELULAR - 1] = soloDigitos(filasDC[i][DC.CELULAR - 1]);
  }

  // Mapa Tag -> índice en filasDC, para ubicar cada fila en O(1) al pisar
  // los enlaces reales y los datos de Administradores más abajo.
  var indicePorTag = {};
  for (var f = 0; f < filasDC.length; f++) {
    var tagF = String(filasDC[f][DC.TAG - 1] || '').trim().toUpperCase();
    if (tagF) indicePorTag[tagF] = f;
  }

  // Los 6 campos de enlaces (WSP/RoyaleAPI/Mazo/Mazo2/CWStats/Render) viven [→ Contexto_Base_Web.md §05B026]
  var shLinks = ss.getSheetByName(CFG.SHEETS.LINKS);
  if (shLinks && shLinks.getLastRow() >= 2) {
    var numFilasLinks = shLinks.getLastRow() - 1;
    var linksConUrls = _extraerValoresConLinksReales(shLinks, numFilasLinks + 1, LINKS_TOTAL_COLS);
    var CAMPOS_LINK = ['WSP', 'ROYALE_API', 'DECK', 'DECK_2', 'CW_STATS', 'RENDER'];
    for (var l = 1; l < linksConUrls.length; l++) {
      var tagLink = String(linksConUrls[l][LC.TAG - 1] || '').trim().toUpperCase();
      if (!tagLink || indicePorTag[tagLink] === undefined) continue;
      var filaDestino = filasDC[indicePorTag[tagLink]];
      for (var c = 0; c < CAMPOS_LINK.length; c++) {
        var campo = CAMPOS_LINK[c];
        filaDestino[DC[campo] - 1] = linksConUrls[l][LC[campo] - 1];
      }
    }
  }

  // Cat_disp/Clanes_Admin: se agregan al final, tomadas de Administradores. [→ Contexto_Base_Web.md §05B027]
  var extraPorTag = {};
  var shAdm = ss.getSheetByName(CFG.SHEETS.ADMINISTRADORES);
  if (shAdm && shAdm.getLastRow() >= 2) {
    var lastRowAdm = shAdm.getLastRow();
    var admData = shAdm.getRange(2, 1, lastRowAdm - 1, ADMINISTRADORES_TOTAL_COLS).getValues();
    for (var a = 0; a < admData.length; a++) {
      var tagAdm = String(admData[a][AC.TAG - 1] || '').trim().toUpperCase();
      if (!tagAdm) continue;
      extraPorTag[tagAdm] = {
        catDisp: String(admData[a][AC.CAT_DISP - 1] || ''),
        clanesAdmin: String(admData[a][AC.CLANES_ADMIN - 1] || '')
      };
    }
  }
  for (var d = 0; d < filasDC.length; d++) {
    var tagFila = String(filasDC[d][DC.TAG - 1] || '').trim().toUpperCase();
    var extra = extraPorTag[tagFila];
    filasDC[d][DC.CAT_DISP - 1] = extra ? extra.catDisp : '';
    filasDC[d][DC.CLANES_ADMIN - 1] = extra ? extra.clanesAdmin : '';
  }

  var data = [headers].concat(filasDC);
  _saveCSVToDrive('Backup_Directorio.csv', _encodeCSV(data));
  Logger.log('[Backup] Backup_Directorio.csv sincronizado (' + filasDC.length + ' registros, 60 columnas formato DC, Cat_disp/Clanes_Admin tomadas de Administradores).');
}

/**
 * syncInactivosCSV() [→ Contexto_Base_Web.md §05B028]
 */
function syncInactivosCSV() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.INACTIVOS);
  if (!sh) return;

  var fileName = 'Backup_Inactivos.csv';
  var sheetRows = sh.getLastRow();

  var csvExistente = _loadCSVFromDrive(fileName);
  var csvRows = 0;
  if (csvExistente) csvRows = _parseCSV(csvExistente).length;

  // Blindaje mínimo: nunca pisar el CSV con una hoja vacía (0 registros).
  if (sheetRows < 2) {
    Logger.log('[ALERTA PROTECCIÓN] SKIP sobreescritura de ' + fileName +
               ' (Hoja Inactivos vacía, 0 registros). No se guardó.');
    return;
  }

  // FASE 5 (Lista_de_cambios.md): ANTES, el blindaje bloqueaba CUALQUIER [→ Contexto_Base_Web.md §05B029]
  if (sheetRows < csvRows) {
    var comparacion = _compararInactivosConCSV(ss);
    var sinExplicar = comparacion.soloEnCsv.filter(function(d) { return !d[3]; });

    if (sinExplicar.length > 0) {
      Logger.log('[ALERTA PROTECCIÓN] SKIP sobreescritura de ' + fileName +
                 ' (Hoja tiene ' + sheetRows + ' filas, CSV tiene ' + csvRows + '). ' +
                 sinExplicar.length + ' tag(s) sin explicar contra Directorio (posible pérdida de datos): ' +
                 sinExplicar.map(function(d) { return d[0] + ' (' + d[2] + ')'; }).join('; ') +
                 '. No se guardó — correr diagnosticoInactivosVsCSV() para más detalle.');
      return;
    }

    var explicadas = comparacion.soloEnCsv.filter(function(d) { return d[3]; });
    if (explicadas.length > 0) {
      Logger.log('[Backup] ' + fileName + ': la hoja tiene menos filas que el CSV (' + sheetRows +
                 ' vs ' + csvRows + '), pero ' + explicadas.length +
                 ' diferencia(s) se explican por movimientos legítimos confirmados en Directorio ' +
                 '(reactivación/Vetados), así que se guarda igual. Detalle: ' +
                 explicadas.map(function(d) { return d[0] + ' (' + d[2] + ')'; }).join('; ') + '.');
    }
  }

  // Lectura con el ancho REAL de la hoja Inactivos (29 columnas). NUNCA usar
  // DIR_TOTAL_COLS (60) aquí: forzaría a Sheets a re-expandir la hoja.
  var datosHoja = _extraerValoresConLinksReales(sh, sheetRows, INACTIVOS_TOTAL_COLS);

  // Snapshot de las 31 columnas extra (Nivel, Copas, V_Guerra, Cat_disp, [→ Contexto_Base_Web.md §05B030]
  var extraPorTag = _cargarExtraColsInactivos();

  // Encabezados de 60 columnas, mismo layout/orden que Directorio (DC) -- [→ Contexto_Base_Web.md §05B031]
  var headers60 = DC_HEADERS_60_COLS;

  var resultado = [headers60];
  for (var f = 1; f < datosHoja.length; f++) {
    var filaOrigen = datosHoja[f];
    var fila60 = new Array(DIR_TOTAL_COLS).fill('');
    for (var campo in IC) {
      var valorIC60 = filaOrigen[IC[campo] - 1];
      // FIX (17-ago-2026, mismo bug reportado el 13-ago-2026 — "valores [→ Contexto_Base_Web.md §05B032]
      if (campo === 'VETADO' || campo === 'PERMISO' || campo === 'ADMIN') {
        valorIC60 = _esSiNoOVacio(valorIC60) ? valorIC60 : '';
      } else if (campo === 'RAZON') {
        valorIC60 = esRazonValida(valorIC60) ? valorIC60 : '';
      }
      fila60[DC[campo] - 1] = valorIC60;
    }

    var tagFila = String(filaOrigen[IC.TAG - 1] || '').trim();
    var extra = extraPorTag[tagFila];
    if (extra) {
      for (var campoExtra in extra) {
        if (DC[campoExtra] !== undefined) fila60[DC[campoExtra] - 1] = extra[campoExtra];
      }
    }

    resultado.push(fila60);
  }

  _saveCSVToDrive(fileName, _encodeCSV(resultado));
  Logger.log('[Backup] ' + fileName + ' sincronizado (' + (sheetRows - 1) + ' registros, 60 columnas armadas sin expandir la hoja Inactivos, 29 cols reales).');
}

/**
 * diagnosticoInactivosVsCSV() [→ Contexto_Base_Web.md §05B033]
 */
function diagnosticoInactivosVsCSV() {
  var ss = _getSs();
  var shInactivos = ss.getSheetByName(CFG.SHEETS.INACTIVOS);
  if (!shInactivos) { Logger.log('[Diagnóstico Fase 4] No existe la hoja Inactivos.'); return; }

  var comparacion = _compararInactivosConCSV(ss);
  var tagsHoja = comparacion.tagsHoja;
  var tagsCsv = comparacion.tagsCsv;
  var soloEnHoja = comparacion.soloEnHoja;
  var soloEnCsv = comparacion.soloEnCsv;

  if (!Object.keys(tagsCsv).length) {
    Logger.log('[Diagnóstico Fase 4] No se encontró Backup_Inactivos.csv en Drive todavía.');
  }

  // --- Resumen en el log ---
  var sinExplicar = soloEnCsv.filter(function(d) { return !d[3]; });
  var explicadas = soloEnCsv.filter(function(d) { return d[3]; });
  var totalDiferencia = soloEnHoja.length + soloEnCsv.length;
  Logger.log('[Diagnóstico Fase 4] Hoja Inactivos: ' + Object.keys(tagsHoja).length + ' cuentas. ' +
             'Backup_Inactivos.csv: ' + Object.keys(tagsCsv).length + ' cuentas.');
  Logger.log('[Diagnóstico Fase 4] Solo en la hoja (no en el CSV todavía): ' + soloEnHoja.length);
  Logger.log('[Diagnóstico Fase 4] Solo en el CSV (ya no están en la hoja): ' + soloEnCsv.length +
             ' (' + explicadas.length + ' explicadas por Directorio, ' + sinExplicar.length + ' sin explicar)');
  Logger.log('[Diagnóstico Fase 4] Total de cuentas de diferencia: ' + totalDiferencia);

  // --- Reporte detallado, guardado como CSV junto a los demás backups ---
  var filasReporte = [['Tag', 'Nombre', 'Ubicación', 'Hipótesis', 'Explicada']];
  for (var i = 0; i < soloEnHoja.length; i++) {
    filasReporte.push([soloEnHoja[i][0], soloEnHoja[i][1], 'Solo en hoja Inactivos',
      'Cuenta recién pasada a Inactivos, aún no reflejada en el CSV', 'Sí']);
  }
  for (var i = 0; i < soloEnCsv.length; i++) {
    filasReporte.push([soloEnCsv[i][0], soloEnCsv[i][1], 'Solo en Backup_Inactivos.csv',
      soloEnCsv[i][2], soloEnCsv[i][3] ? 'Sí' : 'No']);
  }
  _saveCSVToDrive('Diagnostico_Fase4_InactivosVsCSV.csv', _encodeCSV(filasReporte));
  Logger.log('[Diagnóstico Fase 4] Reporte detallado guardado en Diagnostico_Fase4_InactivosVsCSV.csv (' +
             (filasReporte.length - 1) + ' fila(s)).');

  return { soloEnHoja: soloEnHoja, soloEnCsv: soloEnCsv, totalDiferencia: totalDiferencia };
}

/**
 * syncAcumulativosCSV() [→ Contexto_Base_Web.md §05B034]
 */
function syncAcumulativosCSV() {
  // FASE 6 (05-ago-2026, cierre del plan de migración Plantillas -> Menú): [→ Contexto_Base_Web.md §05B035]
  var acumulativos = [
    { sheetName: CFG.SHEETS.COMENTARIOS,  fileName: 'Backup_Comentarios.csv',   numCols: COMENTARIOS_TOTAL_COLS, hasFecha: true,  fechaCol: 2, fechaColConHoraForzada: 2, protegerFechas: true },
    { sheetName: CFG.SHEETS.CALENDARIO2,  fileName: 'Backup_Calendario_2.csv',  numCols: 6,  hasFecha: true,  fechaCol: 2, protegerFechas: true },
    { sheetName: CFG.SHEETS.GUERRA_LOGS,  fileName: 'Backup_Guerra_Logs.csv',   numCols: GUERRA_LOGS_TOTAL_COLS, hasFecha: true,  fechaCol: 2, fechaColConHoraForzada: GLC.FECHA, protegerFechas: true }, // TANDA 1 (20-sep-2026): 22 -> 25 (ProgressEarned/NumOfDefensesRemaining/ProgressEarnedFromDefenses). Antes de FASE 13: 21 -> 22 (EndOfDayRank). Con numCols fijo el CSV NO guardaría las columnas nuevas: ahora sigue a la constante
    // protegerFechas:true (28-sep-2026, extendido a todas las hojas con Fecha): no se [→ Contexto_Base_Web.md §05B036]
    { sheetName: CFG.SHEETS.HISTORIAL,    fileName: 'Backup_Historial_I-S.csv',     numCols: HISTORIAL_TOTAL_COLS, hasFecha: true,  fechaCol: 2, fechaColConHoraForzada: 2, protegerFechas: true },
    { sheetName: CFG.SHEETS.ASCENSOS,     fileName: 'Backup_Historial_A-D.csv',      numCols: ASCENSOS_TOTAL_COLS, hasFecha: true, fechaCol: ASC.FECHA, fechaColConHoraForzada: ASC.FECHA, protegerFechas: true },
    // Histórico de Guerra por jugador (20_HistorialGuerraJugador.gs) — [→ Contexto_Base_Web.md §05B037]
    { sheetName: CFG.SHEETS.ALERTAS_HISTORIAL_GUERRA, fileName: 'Alertas_HistorialGuerra.csv',
      numCols: AHG_TOTAL_COLS, hasFecha: true, fechaCol: AHG.FECHA_DETECTADO,
      fechaColConHoraForzada: AHG.FECHA_DETECTADO, permitirReduccion: true, protegerFechas: true },
  ];

  // Trabajo 0 = syncInactivosCSV() (caso especial: función propia, no una [→ Contexto_Base_Web.md §05B038]
  var totalTrabajos = 1 + acumulativos.length;

  var props     = PropertiesService.getScriptProperties();
  var claveIdx  = 'ACUMULATIVOS_IDX';
  var idxInicio = parseInt(props.getProperty(claveIdx) || '0', 10);
  if (idxInicio >= totalTrabajos) idxInicio = 0; // por si cambió la lista de hojas entre corridas

  var inicio = Date.now();
  var i;
  for (i = idxInicio; i < totalTrabajos; i++) {
    var tInicioTrabajo = Date.now();
    var nombreTrabajo = (i === 0) ? 'Inactivos' : acumulativos[i - 1].sheetName;

    if (i === 0) {
      syncInactivosCSV();
    } else {
      _syncUnaAcumulativaCSV(acumulativos[i - 1], false);
    }

    Logger.log('[Backup][t] syncAcumulativosCSV: trabajo ' + (i + 1) + '/' + totalTrabajos +
               ' (' + nombreTrabajo + '): ' + (Date.now() - tInicioTrabajo) + ' ms');

    var quedanTrabajos = (i + 1) < totalTrabajos;
    if (quedanTrabajos && (Date.now() - inicio) > CFG.ACUMULATIVOS_BUDGET_MS) {
      props.setProperty(claveIdx, String(i + 1));
      Logger.log('[Backup] syncAcumulativosCSV: presupuesto interno agotado tras el trabajo ' +
                 (i + 1) + '/' + totalTrabajos + ' (' + nombreTrabajo + '). ' +
                 'Se reintenta el mismo paso en la próxima continuación.');
      _logProgresoPaso_('Backup', 'respaldo CSV de acumulativos', idxInicio, (i + 1) - idxInicio, totalTrabajos, 'trabajos'); // PF285
      return false;
    }
  }

  props.deleteProperty(claveIdx);
  return true;
}

/**
 * importarAcumulativosDesdeCSV() [→ Contexto_Base_Web.md §05B039]
 */
function importarAcumulativosDesdeCSV() {
  var ss = _getSs();
  var acumulativos = [
    // FASE 6 (05-ago-2026): ver comentario equivalente en syncAcumulativosCSV() [→ Contexto_Base_Web.md §05B040]
    { sheetName: CFG.SHEETS.COMENTARIOS,  fileName: 'Backup_Comentarios.csv',   numCols: COMENTARIOS_TOTAL_COLS, hasFecha: true,  fechaCol: 2 },
    { sheetName: CFG.SHEETS.CALENDARIO2,  fileName: 'Backup_Calendario_2.csv',  numCols: 6,  hasFecha: true,  fechaCol: 2 },
    { sheetName: CFG.SHEETS.GUERRA_LOGS,  fileName: 'Backup_Guerra_Logs.csv',   numCols: GUERRA_LOGS_TOTAL_COLS, hasFecha: true,  fechaCol: 2 }, // TANDA 1 (20-sep-2026): 22 -> 25 (ver syncAcumulativosCSV); un CSV viejo de 22 columnas se restaura por NOMBRE de encabezado y las 3 nuevas quedan vacías
    { sheetName: CFG.SHEETS.HISTORIAL,    fileName: 'Backup_Historial_I-S.csv',     numCols: HISTORIAL_TOTAL_COLS, hasFecha: true,  fechaCol: 2 },
    { sheetName: CFG.SHEETS.ASCENSOS,     fileName: 'Backup_Historial_A-D.csv',      numCols: ASCENSOS_TOTAL_COLS, hasFecha: true, fechaCol: ASC.FECHA },
     // FASE 4 (25-ago-2026, corrige interpretación anterior): Vetados ahora [→ Contexto_Base_Web.md §05B041]
     { sheetName: CFG.SHEETS.VETADOS,      fileName: 'Backup_Vetados.csv',       numCols: VETADOS_TOTAL_COLS, hasFecha: true, fechaCol: VC.FECHA },
    { sheetName: CFG.SHEETS.ALERTAS_HISTORIAL_GUERRA, fileName: 'Alertas_HistorialGuerra.csv',
      numCols: AHG_TOTAL_COLS, hasFecha: true, fechaCol: AHG.FECHA_DETECTADO },
  ];

  _importarInactivosDesdeCSV(ss);

  for (var i = 0; i < acumulativos.length; i++) {
    var item = acumulativos[i];
    var sh = ss.getSheetByName(item.sheetName);
    if (!sh) continue;

    var csvText = _loadCSVFromDrive(item.fileName);
    if (!csvText) continue;

    try {
      var parsed = _parseCSV(csvText);

      if (!parsed || parsed.length <= 1) {
        Logger.log('[ALERTA IMPORTACIÓN] ' + item.fileName + ' vacío o corrupto. Se cancela importación.');
        continue;
      }

      var numCols = item.numCols;
      var hasFecha = !!item.hasFecha;
      // fechaCol: columna 1-based donde vive Fecha en ESTA hoja acumulativa. [→ Contexto_Base_Web.md §05B042]
      var fechaCol = item.fechaCol || 2;
      var fechaIdx = fechaCol - 1;

      // Mapa NOMBRE DE ENCABEZADO -> índice actual, leído del header REAL [→ Contexto_Base_Web.md §05B043]
      var nombreAIdx = _mapaNombreAIdxDesdeHoja(sh, numCols, 1);
      var csvIdxAIdx = null;
      if (Object.keys(nombreAIdx).length > 0) {
        csvIdxAIdx = _mapearIndicesCSVPorEncabezado(parsed[0], nombreAIdx);
      } else {
        // Red de seguridad: si la hoja todavía no tiene encabezado en la [→ Contexto_Base_Web.md §05B044]
        Logger.log('[Backup][ALERTA] ' + item.sheetName + ': sin encabezado en la fila 1 al restaurar ' +
                   '(¿corrió antes que setupAllSheets()?) -- se restaura POR POSICIÓN como respaldo.');
      }

      var filas = parsed.slice(1).map(function(r) {
        var newR = csvIdxAIdx
          ? _reconstruirFilaCSVPorEncabezado(r, csvIdxAIdx, numCols)
          : (function() { var rr = r.slice(0, numCols); while (rr.length < numCols) rr.push(''); return rr; })();
        if (hasFecha && newR[fechaIdx]) {
          var dObj = _parseSpanishDate(newR[fechaIdx]);
          if (dObj && dObj instanceof Date) newR[fechaIdx] = dObj;
        }
        // Recalcular DiaGuerra para Guerra_Logs
        if (item.sheetName === CFG.SHEETS.GUERRA_LOGS) {
          var temporadaCsv = Number(newR[GLC.TEMPORADA  - 1]) || 0;
          var periodIdxCsv = Number(newR[GLC.PERIOD_IDX - 1]) || 0;
          var diaGuerraObj = calcDiaGuerraIdx(CFG.REF_DEFAULT, temporadaCsv, periodIdxCsv);
          if (diaGuerraObj instanceof Date && !isNaN(diaGuerraObj.getTime())) newR[GLC.DIA_GUERRA - 1] = diaGuerraObj;
        }
        return newR;
      });

      var numFilas = filas.length;
      if ((numFilas + 1) > sh.getMaxRows()) sh.insertRowsAfter(sh.getMaxRows(), (numFilas + 1) - sh.getMaxRows() + 10);
      if (numCols > sh.getMaxColumns()) sh.insertColumnsAfter(sh.getMaxColumns(), numCols - sh.getMaxColumns());

      // FIX (18-sep-2026): la fila 1 (encabezado) ya NO se toca aquí -- antes [→ Contexto_Base_Web.md §05B045]
      if (sh.getLastRow() >= 2) {
        sh.getRange(2, 1, sh.getLastRow() - 1, numCols).clearContent();
      }
      if (numFilas > 0) {
        sh.getRange(2, 1, numFilas, numCols).setValues(filas);
      }

      if (hasFecha && numFilas > 0) {
        if (item.sheetName === CFG.SHEETS.CALENDARIO2) {
          sh.getRange(2, fechaCol, numFilas, 1).setNumberFormat('dd/mm/yyyy');
        } else if (item.sheetName === CFG.SHEETS.VETADOS) {
          // Mismo formato corto 24h que fija _setupVetados() (02_Setup_Hojas.gs) [→ Contexto_Base_Web.md §05B046]
          sh.getRange(2, fechaCol, numFilas, 1).setNumberFormat('dd/mm/yyyy hh:mm:ss');
        } else {
          sh.getRange(2, fechaCol, numFilas, 1).setNumberFormat('dddd, d "de" mmmm"," yyyy h:mm:ss am/pm');
        }
      }
      // DiaGuerra
      if (numFilas > 0 && item.sheetName === CFG.SHEETS.GUERRA_LOGS) {
        sh.getRange(2, GLC.DIA_GUERRA, numFilas, 1).setNumberFormat('dd/mm/yyyy');
      }

      Logger.log('[Backup] ' + item.sheetName + ' restaurado con ' + numFilas + ' registros.');

    } catch(e) {
      Logger.log('[Backup] Error importando ' + item.fileName + ': ' + e.message);
    }
  }
}

/**
 * importarExtraDesdeCSV() [→ Contexto_Base_Web.md §05B047]
 */
function importarExtraDesdeCSV() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.EXTRA);
  if (!sh) { Logger.log('[Extra] Extra no existe, se omite import.'); return; }

  var COL_TORNEO_VIGENTE_ID   = 20;
  var COL_SORTEO_VIGENTE_ID   = 21;
  var COL_ASCENSO_VIGENTE_ID  = 22;
  var COL_DESCENSO_VIGENTE_ID = 23;

  if (sh.getLastRow() >= 2) {
    var yaTieneAlgo = sh.getRange(2, COL_TORNEO_VIGENTE_ID, 1, 4).getValues()[0].some(function (v) {
      return String(v || '').trim() !== '';
    });
    if (yaTieneAlgo) {
      Logger.log('[Extra] Ya tiene al menos uno de los 4 campos Vigente_ID, se omite import desde CSV.');
      return;
    }
  }

  var csv = _loadCSVFromDrive('Backup_Extra.csv');
  if (!csv) { Logger.log('[Extra] No hay Backup_Extra.csv para restaurar.'); return; }
  var parsed = _parseCSV(csv);
  if (parsed.length < 2) { Logger.log('[Extra] Backup_Extra.csv sin fila de datos.'); return; }

  var numCols = sh.getLastColumn();
  var NOMBRE_A_IDX_EXTRA = _mapaNombreAIdxDesdeHoja(sh, numCols, 1);
  var csvIdxAExtraIdx = _mapearIndicesCSVPorEncabezado(parsed[0], NOMBRE_A_IDX_EXTRA);
  var filaCsv = _reconstruirFilaCSVPorEncabezado(parsed[1], csvIdxAExtraIdx, numCols);

  var valores = [
    filaCsv[COL_TORNEO_VIGENTE_ID - 1],
    filaCsv[COL_SORTEO_VIGENTE_ID - 1],
    filaCsv[COL_ASCENSO_VIGENTE_ID - 1],
    filaCsv[COL_DESCENSO_VIGENTE_ID - 1]
  ];
  // Si el CSV no tenía NADA que restaurar en los 4 (ej. backup viejo, [→ Contexto_Base_Web.md §05B048]
  var hayAlgoQueRestaurar = valores.some(function (v) { return String(v || '').trim() !== ''; });
  if (!hayAlgoQueRestaurar) {
    Logger.log('[Extra] Backup_Extra.csv no tenía ningún valor en los 4 campos Vigente_ID. Nada que restaurar.');
    return;
  }

  sh.getRange(2, COL_TORNEO_VIGENTE_ID, 1, 4).setValues([valores]);
  Logger.log('[Extra] Campos Vigente_ID restaurados desde CSV: Torneo=' + (valores[0] || 'vacío') +
             ', Sorteo=' + (valores[1] || 'vacío') + ', Ascenso=' + (valores[2] || 'vacío') +
             ', Descenso=' + (valores[3] || 'vacío') + '.');
}

/**
 * corregirFechasComoTextoEnBackups() [→ Contexto_Base_Web.md §05B049]
 */
function corregirFechasComoTextoEnBackups() {
  var archivos = [
    { fileName: 'Backup_Administradores.csv', columnas: ['Vigencia'] },
    { fileName: 'Backup_Historial_A-D.csv',   columnas: ['Fecha'] },
    { fileName: 'Backup_Comentarios.csv',     columnas: ['Fecha'], forzarConHora: true },
    // FIX: Guerra/Guerra_Logs — Fecha es el instante REAL de captura (ligado [→ Contexto_Base_Web.md §05B050]
    { fileName: 'Backup_Guerra_Logs.csv',     columnas: ['Fecha'], forzarConHora: true },
    { fileName: 'Backup_Guerra.csv',          columnas: ['Fecha'], forzarConHora: true },
    { fileName: 'Backup_Historial_I-S.csv',   columnas: ['Fecha'] },
    { fileName: 'Backup_Mensajes.csv',        columnas: ['Fecha'], forzarConHora: true },
    { fileName: 'Backup_T_Asistencia.csv',    columnas: ['Fecha'] },
    { fileName: 'Backup_T_Lista.csv',         columnas: ['Fecha'] }
  ];

  // Ya está en formato canónico ('dd/MM/yyyy' o 'dd/MM/yyyy HH:mm:ss'):
  // no hace falta tocarla. Esto es lo que hace la función idempotente.
  var RE_YA_CANONICA = /^\d{2}\/\d{2}\/\d{4}(\s\d{2}:\d{2}:\d{2})?$/;

  var resumen = [];

  for (var i = 0; i < archivos.length; i++) {
    var fileName = archivos[i].fileName;
    try {
      var csvText = _loadCSVFromDrive(fileName);
      if (!csvText) {
        Logger.log('[Fase 1] ' + fileName + ': no existe en Drive, se omite.');
        continue;
      }

      var parsed = _parseCSV(csvText);
      if (!parsed || parsed.length < 2) {
        Logger.log('[Fase 1] ' + fileName + ': sin filas de datos, nada que corregir.');
        continue;
      }

      var headers = parsed[0];
      var corregidas = 0;
      var noParseadas = 0;

      for (var c = 0; c < archivos[i].columnas.length; c++) {
        var nombreCol = archivos[i].columnas[c];
        var idxCol = headers.indexOf(nombreCol);
        if (idxCol < 0) {
          Logger.log('[Fase 1] ' + fileName + ': no se encontró la columna "' + nombreCol + '".');
          continue;
        }

        for (var f = 1; f < parsed.length; f++) {
          var valorOriginal = parsed[f][idxCol];
          if (!valorOriginal) continue;
          if (RE_YA_CANONICA.test(String(valorOriginal).trim())) continue;

          var fechaObj = _parseSpanishDate(valorOriginal);
          if (fechaObj instanceof Date && !isNaN(fechaObj.getTime())) {
            parsed[f][idxCol] = _formatFechaCanonica(fechaObj, !!archivos[i].forzarConHora);
            corregidas++;
          } else {
            noParseadas++;
            Logger.log('[Fase 1] ' + fileName + ' fila ' + (f + 1) + ', columna "' + nombreCol +
                       '": no se pudo interpretar como fecha ("' + valorOriginal + '"), se dejó igual.');
          }
        }
      }

      if (corregidas > 0) {
        _saveCSVToDrive(fileName, _encodeCSV(parsed));
        Logger.log('[Fase 1] ' + fileName + ': ' + corregidas + ' fecha(s) corregida(s) a formato canónico' +
                   (noParseadas > 0 ? ' (' + noParseadas + ' valor(es) no interpretados, revisar log arriba)' : '') + '.');
      } else {
        Logger.log('[Fase 1] ' + fileName + ': nada que corregir' +
                   (noParseadas > 0 ? ' (' + noParseadas + ' valor(es) no interpretados, revisar log arriba)' : ' (ya estaba en formato canónico o vacío)') + '.');
      }

      resumen.push({ fileName: fileName, corregidas: corregidas, noParseadas: noParseadas });

    } catch(e) {
      Logger.log('[Fase 1] Error corrigiendo ' + fileName + ': ' + e.message);
      resumen.push({ fileName: fileName, error: e.message });
    }
  }

  Logger.log('[Fase 1] corregirFechasComoTextoEnBackups() completado.');
  return resumen;
}

/**
 * corregirLinksEndpointsDobleCodificados() [→ Contexto_Base_Web.md §05B051]
 */
function corregirLinksEndpointsDobleCodificados() {
  var ss = _getSs();
  var resumen = [];

  function _normalizarUrlEndpoint(url) {
    var u = String(url || '');
    if (u.indexOf(CFG.API_BASE) !== 0) return url; // no toca enlaces que no son de la API
    while (u.indexOf('%2523') >= 0) u = u.replace('%2523', '%23');
    return u;
  }

  function _repararColumna(sh, hojaNombre, col, nombreCol, lastRow) {
    if (!sh || lastRow < 2) {
      Logger.log('[Fase 9] ' + hojaNombre + '.' + nombreCol + ': sin filas de datos, nada que corregir.');
      resumen.push({ hoja: hojaNombre, columna: nombreCol, corregidas: 0 });
      return;
    }

    var rango = sh.getRange(2, col, lastRow - 1, 1);
    var valores = rango.getRichTextValues();
    var corregidas = 0;

    for (var i = 0; i < valores.length; i++) {
      var rt = valores[i][0];
      if (!rt) continue;
      var texto = rt.getText();
      if (!texto) continue;

      var urlOriginal = rt.getLinkUrl();
      if (!urlOriginal || urlOriginal.indexOf('%2523') < 0) continue;

      var urlNueva = _normalizarUrlEndpoint(urlOriginal);
      if (urlNueva === urlOriginal) continue;

      valores[i][0] = makeLink(texto, urlNueva);
      corregidas++;
    }

    if (corregidas > 0) rango.setRichTextValues(valores);

    Logger.log('[Fase 9] ' + hojaNombre + '.' + nombreCol + ': ' +
               (corregidas > 0 ? corregidas + ' enlace(s) corregido(s) (%2523 -> %23).' : 'nada que corregir.'));
    resumen.push({ hoja: hojaNombre, columna: nombreCol, corregidas: corregidas });
  }

  // Hoja Clan: 4 columnas con enlaces a la API.
  var shClan = ss.getSheetByName(CFG.SHEETS.CLAN);
  if (shClan) {
    var lastRowClan = shClan.getLastRow();
    _repararColumna(shClan, CFG.SHEETS.CLAN, CC.RENDER_CLANS,     'RENDER_CLANS',     lastRowClan);
    _repararColumna(shClan, CFG.SHEETS.CLAN, CC.RENDER_MEMBERS,   'RENDER_MEMBERS',   lastRowClan);
    _repararColumna(shClan, CFG.SHEETS.CLAN, CC.RENDER_RIVERRACE, 'RENDER_RIVERRACE', lastRowClan);
    _repararColumna(shClan, CFG.SHEETS.CLAN, CC.RENDER_PLAYERS,   'RENDER_PLAYERS',   lastRowClan);
  } else {
    Logger.log('[Fase 9] Hoja ' + CFG.SHEETS.CLAN + ' no encontrada, se omite.');
  }

  // Hoja Links: columna RENDER (enlace API por jugador).
  var shLinks = ss.getSheetByName(CFG.SHEETS.LINKS);
  if (shLinks) {
    _repararColumna(shLinks, CFG.SHEETS.LINKS, LC.RENDER, 'RENDER', shLinks.getLastRow());
  } else {
    Logger.log('[Fase 9] Hoja ' + CFG.SHEETS.LINKS + ' no encontrada, se omite.');
  }

  var totalCorregidas = resumen.reduce(function(a, r) { return a + (r.corregidas || 0); }, 0);
  Logger.log('[Fase 9] corregirLinksEndpointsDobleCodificados() completado: ' +
             totalCorregidas + ' enlace(s) corregido(s) en total.');

  // Resincroniza los CSV en Drive que dependen de las columnas recién [→ Contexto_Base_Web.md §05B052]
  var corregidasClan = resumen
    .filter(function(r) { return r.hoja === CFG.SHEETS.CLAN; })
    .reduce(function(a, r) { return a + (r.corregidas || 0); }, 0);
  if (corregidasClan > 0) {
    syncClanCSV();
    Logger.log('[Fase 9] Backup_Clan.csv resincronizado tras la corrección.');
  }

  var corregidasLinks = resumen
    .filter(function(r) { return r.hoja === CFG.SHEETS.LINKS; })
    .reduce(function(a, r) { return a + (r.corregidas || 0); }, 0);
  if (corregidasLinks > 0) {
    _respaldarListaHojasCSV(ss, [CFG.SHEETS.LINKS], false);
    Logger.log('[Fase 9] Backup_' + CFG.SHEETS.LINKS + '.csv resincronizado tras la corrección.');
  }

  return resumen;
}

/**
 * repararRazonInvalida() [→ Contexto_Base_Web.md §05B053]
 */
function repararRazonInvalida() {
  var ss = _getSs();
  var corregidos = 0;

  // 1. Hoja Directorio
  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (shDir && shDir.getLastRow() >= 2) {
    var lastRow = shDir.getLastRow();
    var razonRange = shDir.getRange(2, IC.RAZON, lastRow - 1, 1);
    var razonVals  = razonRange.getValues();
    for (var i = 0; i < razonVals.length; i++) {
      if (razonVals[i][0] && !esRazonValida(razonVals[i][0])) {
        razonVals[i][0] = '';
        corregidos++;
      }
    }
    razonRange.setValues(razonVals);
    Logger.log('[Reparación] Directorio: ' + corregidos + ' celdas de Razón corregidas.');
  }

  // 2. Hoja Vetados
  var shVet = ss.getSheetByName(CFG.SHEETS.VETADOS);
  var corregidosVet = 0;
  if (shVet && shVet.getLastRow() >= 2) {
    var lastRowVet = shVet.getLastRow();
    var razonRangeVet = shVet.getRange(2, 10, lastRowVet - 1, 1);
    var razonValsVet  = razonRangeVet.getValues();
    for (var i = 0; i < razonValsVet.length; i++) {
      if (razonValsVet[i][0] && !esRazonValida(razonValsVet[i][0])) {
        razonValsVet[i][0] = '';
        corregidosVet++;
      }
    }
    razonRangeVet.setValues(razonValsVet);
    Logger.log('[Reparación] Vetados: ' + corregidosVet + ' celdas de Razón corregidas.');
  }

  // 3. Backup_Directorio.csv
  try {
    var csvText = _loadCSVFromDrive('Backup_Directorio.csv');
    if (csvText) {
      var parsed = _parseCSV(csvText);
      if (parsed.length > 1) {
        var headers = parsed[0];
        var idxRazon = headers.indexOf('Razón');
        if (idxRazon < 0) idxRazon = headers.indexOf('Razon');
        if (idxRazon >= 0) {
          for (var i = 1; i < parsed.length; i++) {
            if (parsed[i][idxRazon] && !esRazonValida(parsed[i][idxRazon])) parsed[i][idxRazon] = '';
          }
          _saveCSVToDrive('Backup_Directorio.csv', _encodeCSV(parsed));
          Logger.log('[Reparación] Backup_Directorio.csv: columna Razón limpiada.');
        }
      }
    }
  } catch(e) { Logger.log('[Reparación] Error limpiando Backup_Directorio.csv: ' + e.message); }

  // 4. ClanSystem_Backup_Celulares.json [→ Contexto_Base_Web.md §05B054]
  try {
    var folderJson = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var filesJson = folderJson.getFilesByName('ClanSystem_Backup_Celulares.json');
    if (filesJson.hasNext()) {
      var fileJson = filesJson.next();
      var jsonObj = JSON.parse(fileJson.getBlob().getDataAsString('UTF-8'));
      for (var i = 0; i < jsonObj.length; i++) {
        if (jsonObj[i].razon && !esRazonValida(jsonObj[i].razon)) jsonObj[i].razon = '';
      }
      _setContentConConteo_(fileJson, JSON.stringify(jsonObj, null, 2));
      Logger.log('[Reparación] ClanSystem_Backup_Celulares.json: campo razon limpiado.');
    }
  } catch(e) { Logger.log('[Reparación] Error limpiando JSON de celulares: ' + e.message); }

  Logger.log('[Reparación] repararRazonInvalida() completado.');
}

/**
 * syncAllCSV() [→ Contexto_Base_Web.md §05B055]
 */
function syncAllCSV() {
  var t0 = Date.now();
  syncDirectorioCSV();
  syncClanCSV();
  while (!syncAcumulativosCSV()) { /* reintenta el mismo bloque de trabajos pendientes */ }
  // Guerra ya NO se respalda dentro de updateGuerraSheet() (ver nota ahí, [→ Contexto_Base_Web.md §05B056]
  var ss = _getSs();
  var shGuerra = ss.getSheetByName(CFG.SHEETS.GUERRA);
  if (shGuerra) _syncGuerraCSV(shGuerra);
  exportarBackupCelulares();
  _revisarCsvAlSalir_(t0); // PF291
  Logger.log('[Backup] syncAllCSV completado: Directorio + Clan + Guerra + Acumulativos + JSON.');
}

/**
 * repararFormatoTelefonos()
 * Función de reparación bajo demanda para corregir el formato de Prefijo/Celular.
 */
function repararFormatoTelefonos() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  var corregidos = 0;

  if (sh && sh.getLastRow() >= 2) {
    var lastRow = sh.getLastRow();
    var prefRange = sh.getRange(2, IC.PREFIJO, lastRow - 1, 1);
    var celRange  = sh.getRange(2, IC.CELULAR, lastRow - 1, 1);
    var prefVals  = prefRange.getValues();
    var celVals   = celRange.getValues();

    for (var i = 0; i < celVals.length; i++) {
      var prefLimpio = soloDigitos(prefVals[i][0]);
      var celLimpio  = soloDigitos(celVals[i][0]);
      if (String(prefVals[i][0] || '') !== prefLimpio) corregidos++;
      if (String(celVals[i][0]  || '') !== celLimpio)  corregidos++;
      prefVals[i][0] = prefLimpio ? Number(prefLimpio) : '';
      celVals[i][0]  = celLimpio  ? Number(celLimpio)  : '';
    }
    prefRange.setValues(prefVals);
    celRange.setValues(celVals);
    celRange.setNumberFormat('### ### ### ###');
    Logger.log('[Reparación] Directorio: ' + corregidos + ' celdas de Prefijo/Celular corregidas.');
  }

  // 2. Backup_Directorio.csv
  try {
    var csvText = _loadCSVFromDrive('Backup_Directorio.csv');
    if (csvText) {
      var parsed = _parseCSV(csvText);
      if (parsed.length > 1) {
        var headers = parsed[0];
        var idxPref = headers.indexOf('Prefijo');
        var idxCel  = headers.indexOf('Celular');
        for (var i = 1; i < parsed.length; i++) {
          if (idxPref >= 0) parsed[i][idxPref] = soloDigitos(parsed[i][idxPref]);
          if (idxCel  >= 0) parsed[i][idxCel]  = soloDigitos(parsed[i][idxCel]);
        }
        _saveCSVToDrive('Backup_Directorio.csv', _encodeCSV(parsed));
        Logger.log('[Reparación] Backup_Directorio.csv: columnas Prefijo/Celular limpiadas.');
      }
    }
  } catch(e) { Logger.log('[Reparación] Error limpiando Backup_Directorio.csv: ' + e.message); }

  // 3. ClanSystem_Backup_Celulares.json [→ Contexto_Base_Web.md §05B057]
  try {
    var folderJson = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var filesJson = folderJson.getFilesByName('ClanSystem_Backup_Celulares.json');
    if (filesJson.hasNext()) {
      var fileJson = filesJson.next();
      var jsonObj = JSON.parse(fileJson.getBlob().getDataAsString('UTF-8'));
      for (var i = 0; i < jsonObj.length; i++) {
        if (jsonObj[i].prefijo !== undefined) jsonObj[i].prefijo = soloDigitos(jsonObj[i].prefijo);
        if (jsonObj[i].celular !== undefined) jsonObj[i].celular = soloDigitos(jsonObj[i].celular);
      }
      _setContentConConteo_(fileJson, JSON.stringify(jsonObj, null, 2));
      Logger.log('[Reparación] ClanSystem_Backup_Celulares.json: prefijo/celular limpiados.');
    }
  } catch(e) { Logger.log('[Reparación] Error limpiando JSON de celulares: ' + e.message); }

  Logger.log('[Reparación] repararFormatoTelefonos() completado.');
}

// ----- Funciones internas / helpers -----

// CSV Helpers (Parser RFC 4180 completo) [→ Contexto_Base_Web.md §05B058]

/**
 * Codifica un array de arrays como texto CSV con manejo correcto de comillas,
 * comas y saltos de línea dentro de campos.
 */
function _encodeCSV(rows) {
  return rows.map(function(row) {
    return row.map(function(val) {
      var s = String(val !== null && val !== undefined ? val : '');
      if (s.indexOf('"') >= 0 || s.indexOf(',') >= 0 || s.indexOf('\n') >= 0 || s.indexOf('\r') >= 0) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    }).join(',');
  }).join('\r\n');
}

/**
 * _informeConIdSemana_(filas)  [→ Contexto_Base_Web.md §PF242]
 * Devuelve una COPIA de la tabla de un informe con la columna «ID» como primera columna: T_NN_S_NN con la temporada propia y la
 * semana de la fila, y _#TAG añadido cuando la tabla tiene columna «Tag» con valor (misma forma que Correcciones_Guerra.csv, §PF238).
 * Se busca por el NOMBRE de las columnas «Temporada», «Semana» y «Tag» (sin importar mayúsculas). Si falta Temporada o Semana, o si
 * la primera columna ya es «ID», devuelve la tabla tal cual. Una fila sin temporada o semana numéricas queda con ID vacío.
 * Solo para informes (los lectores de informes buscan columnas por nombre); NO usar en espejos de hojas como Backup_Guerra.csv,
 * cuyas columnas se leen por posición.
 */
function _informeConIdSemana_(filas) {
  if (!filas || filas.length < 2 || !filas[0]) return filas;
  var enc = filas[0];
  if (String(enc[0]).trim() === 'ID') return filas;
  var iT = -1, iS = -1, iG = -1;
  for (var c = 0; c < enc.length; c++) {
    var h = String(enc[c]).trim().toLowerCase();
    if (h === 'temporada' && iT < 0) iT = c;
    else if (h === 'semana' && iS < 0) iS = c;
    else if (h === 'tag' && iG < 0) iG = c;
  }
  if (iT < 0 || iS < 0) return filas;
  var salida = [['ID'].concat(enc)];
  for (var r = 1; r < filas.length; r++) {
    var fila = filas[r] || [];
    var tTxt = String(fila[iT] === undefined ? '' : fila[iT]).trim();
    var sTxt = String(fila[iS] === undefined ? '' : fila[iS]).trim();
    var tagTxt = iG >= 0 ? String(fila[iG] === undefined ? '' : fila[iG]).trim() : '';
    salida.push([_idSemanaInforme_(tTxt, sTxt, tagTxt)].concat(fila));
  }
  return salida;
}

/**
 * _idSemanaInforme_(tTxt, sTxt, tagTxt)  [→ Contexto_Base_Web.md §PF242, §PF258]
 * Arma el «ID» de una fila de informe: T_NN_S_NN (+ _#TAG si hay tag). Vacío si la temporada o la semana no son números mayores que 0.
 * Extraída de _informeConIdSemana_ el 25-oct-2026 para que la reenumeración de temporadas (47_Migraciones.gs, _reenumerarTextoInformeCSV_) recalcule el ID con la MISMA regla.
 */
function _idSemanaInforme_(tTxt, sTxt, tagTxt) {
  tTxt = String(tTxt === undefined || tTxt === null ? '' : tTxt).trim();
  sTxt = String(sTxt === undefined || sTxt === null ? '' : sTxt).trim();
  var tag = String(tagTxt === undefined || tagTxt === null ? '' : tagTxt).trim();
  var t = Number(tTxt), s = Number(sTxt);
  if (tTxt === '' || sTxt === '' || !isFinite(t) || !isFinite(s) || t <= 0 || s <= 0) return '';
  var dos = function(n) { return (n < 10 ? '0' : '') + n; };
  var id = 'T_' + dos(t) + '_S_' + dos(s);
  if (tag) id += '_' + (tag.charAt(0) === '#' ? tag : '#' + tag);
  return id;
}

/** _encodeCSV de un informe, con la columna «ID» al principio (ver _informeConIdSemana_). */
function _encodeCSVInforme(filas) {
  return _encodeCSV(_informeConIdSemana_(filas));
}

/**
 * _cargarExtraColsInactivos() [→ Contexto_Base_Web.md §05B059]
 */
function _cargarExtraColsInactivos() {
  var mapa = {};
  // (25-sep-2026, FASE B) ClanSystem_Backup_InactivosExtra.json se lee y se [→ Contexto_Base_Web.md §05B060]
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var files = folder.getFilesByName('ClanSystem_Backup_InactivosExtra.json');
    if (files.hasNext()) {
      mapa = JSON.parse(files.next().getBlob().getDataAsString('UTF-8')) || {};
    }
  } catch(e) { Logger.log('[Backup] Error leyendo ClanSystem_Backup_InactivosExtra.json: ' + e.message); }
  return mapa;
}

/**
 * _extraColsInactivosDesdeCsv(tagNorm) [→ Contexto_Base_Web.md §05B061]
 */
function _extraColsInactivosDesdeCsv(tagNorm) {
  if (!tagNorm) return null;
  var parsed;
  try {
    var csvText = _loadCSVFromDrive('Backup_Inactivos.csv');
    if (!csvText) return null;
    parsed = _parseCSV(csvText);
  } catch (e) {
    Logger.log('[Backup] _extraColsInactivosDesdeCsv: no se pudo leer Backup_Inactivos.csv (' + e.message + ').');
    return null;
  }
  if (!parsed || parsed.length < 2) return null;

  var rows = parsed.slice(1);
  var campos = _camposExtraInactivos(); // 11_DirectorioSheet.gs: nombres DC que no están en IC
  for (var i = 0; i < rows.length; i++) {
    if (cleanTag(rows[i][DC.TAG - 1]) !== tagNorm) continue;
    var extra = {};
    for (var c = 0; c < campos.length; c++) {
      var campo = campos[c];
      var idx = DC[campo] - 1;
      var valor = rows[i][idx];
      if (valor !== undefined && valor !== '') extra[campo] = valor;
    }
    return Object.keys(extra).length ? extra : null;
  }
  return null;
}

/**
 * _compararInactivosConCSV(ss) [→ Contexto_Base_Web.md §05B062]
 */
function _compararInactivosConCSV(ss) {
  var shInactivos = ss.getSheetByName(CFG.SHEETS.INACTIVOS);
  var shDirectorio = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);

  // --- 1. Tags actuales en la hoja Inactivos (29 cols reales, formato IC) ---
  var tagsHoja = {}; // Tag -> Nombre
  if (shInactivos) {
    var lastRowInactivos = shInactivos.getLastRow();
    if (lastRowInactivos >= 2) {
      var datosInactivos = shInactivos.getRange(2, 1, lastRowInactivos - 1, INACTIVOS_TOTAL_COLS).getValues();
      for (var i = 0; i < datosInactivos.length; i++) {
        var tg = String(datosInactivos[i][IC.TAG - 1] || '').trim();
        if (tg) tagsHoja[tg] = String(datosInactivos[i][IC.NOMBRE - 1] || '');
      }
    }
  }

  // --- 2. Tags en el último Backup_Inactivos.csv (60 cols, formato DC) ---
  var tagsCsv = {}; // Tag -> Nombre
  var csvTexto = _loadCSVFromDrive('Backup_Inactivos.csv');
  if (csvTexto) {
    var filasCsv = _parseCSV(csvTexto);
    for (var i = 1; i < filasCsv.length; i++) { // fila 0 = encabezado
      var fila = filasCsv[i];
      var tg = String(fila[DC.TAG - 1] || '').trim();
      if (tg) tagsCsv[tg] = String(fila[DC.NOMBRE - 1] || '');
    }
  }

  // --- 3. Estado actual en Directorio, por Tag (para explicar cada diferencia). [→ Contexto_Base_Web.md §05B063]
  var dirPorTag = {};
  if (shDirectorio) {
    var lastRowDir = shDirectorio.getLastRow();
    if (lastRowDir >= 2) {
      var datosDir = shDirectorio.getRange(2, 1, lastRowDir - 1, DIR_SHEET_COLS).getValues();
      for (var i = 0; i < datosDir.length; i++) {
        var tg = String(datosDir[i][IC.TAG - 1] || '').trim();
        if (tg) {
          dirPorTag[tg] = {
            estado: String(datosDir[i][IC.ESTADO - 1] || ''),
            clan: String(datosDir[i][IC.CLAN - 1] || ''),
            clanTag: String(datosDir[i][IC.CLAN_TAG - 1] || '')
          };
        }
      }
    }
  }

  // --- 3b. Membresía ACTUAL (en vivo) del clan Vetado, vía el cache de la [→ Contexto_Base_Web.md §05B064]
  var tagsEnClanVetado = {};
  capturarApiClanes_(CFG.CLANES_PROGRESO_MAX_EDAD_MS, 'Backup_CSV');
  var clanVetadoCache = _getClanCache(CFG.VETADO_TAG);
  if (clanVetadoCache && clanVetadoCache.members) {
    for (var i = 0; i < clanVetadoCache.members.length; i++) {
      tagsEnClanVetado[String(clanVetadoCache.members[i].tag || '').trim()] = true;
    }
  }

  // --- 4. Diferencias en ambos sentidos ---
  var soloEnHoja = []; // en Inactivos pero todavía no en el CSV
  var soloEnCsv  = []; // en el CSV pero ya no en la hoja Inactivos
  for (var tg in tagsHoja) {
    if (!tagsCsv.hasOwnProperty(tg)) soloEnHoja.push([tg, tagsHoja[tg]]);
  }
  for (var tg in tagsCsv) {
    if (!tagsHoja.hasOwnProperty(tg)) {
      var infoDir = dirPorTag[tg];
      var hipotesis, explicada;
      if (infoDir && infoDir.estado === 'Activo' && infoDir.clanTag && infoDir.clanTag !== CFG.VETADO_TAG) {
        hipotesis = 'Reactivada en ' + infoDir.clan;
        explicada = true;
      } else if (infoDir && infoDir.clanTag === CFG.VETADO_TAG) {
        hipotesis = 'Pasó a Vetados (admin)';
        explicada = true;
      } else if (tagsEnClanVetado[tg]) {
        // No-admin activo en el clan Vetado ahora mismo (confirmado en vivo [→ Contexto_Base_Web.md §05B065]
        hipotesis = 'Activo en el clan Vetado (no-admin, confirmado en vivo)';
        explicada = true;
      } else if (!infoDir) {
        hipotesis = 'No aparece en el Directorio actual';
        explicada = false;
      } else {
        hipotesis = 'Sigue Inactivo/otro estado en Directorio — revisar manualmente';
        explicada = false;
      }
      soloEnCsv.push([tg, tagsCsv[tg], hipotesis, explicada]);
    }
  }

  return { tagsHoja: tagsHoja, tagsCsv: tagsCsv, soloEnHoja: soloEnHoja, soloEnCsv: soloEnCsv };
}

/**
 * _eliminarExtraColsInactivosPorTags(tags) [→ Contexto_Base_Web.md §05B066]
 */
function _eliminarExtraColsInactivosPorTags(tags) {
  if (!tags || tags.length === 0) return;
  try {
    var mapa = _cargarExtraColsInactivos();
    var borrados = 0;
    for (var i = 0; i < tags.length; i++) {
      if (mapa[tags[i]] !== undefined) { delete mapa[tags[i]]; borrados++; }
    }
    if (borrados === 0) return;

    // (25-sep-2026, FASE B) Ahora en "Otros" (DRIVE_FOLDER_ID_OTROS), igual
    // que _cargarExtraColsInactivos() más arriba en este archivo.
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var filename = 'ClanSystem_Backup_InactivosExtra.json';
    var files = folder.getFilesByName(filename);
    var content = JSON.stringify(mapa, null, 2);
    if (files.hasNext()) {
      _setContentConConteo_(files.next(), content);
    } else {
      _createFileConConteo_(folder, filename, content, MimeType.PLAIN_TEXT);
    }
    Logger.log('[Backup] ClanSystem_Backup_InactivosExtra.json: ' + borrados + ' tag(s) eliminados (reactivados en un clan Terna).');
  } catch(e) {
    Logger.log('[Backup] Error eliminando tags reactivados de ClanSystem_Backup_InactivosExtra.json: ' + e.message);
  }
}

/**
 * FASE 9bis (17-sep-2026, limpieza de código muerto, pedido del usuario): [→ Contexto_Base_Web.md §05B067]
 */

/**
 * _extraerValoresConLinksReales(sh, numRows, numCols, colConHoraForzada) [→ Contexto_Base_Web.md §05B068]
 */
/**
 * _extraerValoresConLinksReales(sh, numRows, numCols, colConHoraForzada, colsFormatoNumerico) [→ Contexto_Base_Web.md §05B069]
 */
/**
 * _extraerValoresConLinksReales(sh, numRows, numCols, colConHoraForzada, colsFormatoNumerico, headerRows) [→ Contexto_Base_Web.md §05B070]
 */
/**
 * _extraerValoresConLinksReales(sh, numRows, numCols, colConHoraForzada, colsFormatoNumerico, headerRows,… [→ Contexto_Base_Web.md §05B071]
 */
// 29-oct-2026: 8.º parámetro `colsSinSeparadorMiles` ({col: true}, 1-based). Esas columnas se muestran con coma de miles (`#,##0`), pero el CSV guarda el número crudo, sin coma (ver _colsMilesDeHoja_()).
function _extraerValoresConLinksReales(sh, numRows, numCols, colConHoraForzada, colsFormatoNumerico, headerRows, colsMinutosASegundos, colsSinSeparadorMiles) {
  headerRows = headerRows || 1;
  var valores = sh.getRange(1, 1, numRows, numCols).getDisplayValues();
  if (headerRows === 2) {
    // Encabezado combinado en una sola fila plana; la fila 2 real de la
    // hoja (subrótulos C1-C4) se descarta del resultado -- no es un dato.
    valores[0] = _combinarHeaderDosFilas(sh, numCols);
    valores.splice(1, 1);
  } else if (headerRows === 3) {
    // NUEVO (13-sep-2026, pedido del usuario -- CR_Lista): mismo criterio [→ Contexto_Base_Web.md §05B072]
    valores[0] = _combinarHeaderTresFilas(sh, numCols);
    valores.splice(1, 2);
  }
  var primeraFilaDatos = headerRows + 1; // 2 (default), 3 (header de 2 filas) o 4 (header de 3 filas)
  var filasDatos = numRows - headerRows; // cuántas filas de DATO reales hay
  if (filasDatos < 1) return valores; // Solo encabezado: nada que detectar.

  // Detección de columnas con enlaces por MUESTREO, no por escaneo completo. [→ Contexto_Base_Web.md §05B073]
  var TAM_MUESTRA = Math.min(filasDatos, 200);
  var richMuestra = sh.getRange(primeraFilaDatos, 1, TAM_MUESTRA, numCols).getRichTextValues();

  for (var c = 0; c < numCols; c++) {
    var tieneEnlace = false;
    for (var rm = 0; rm < TAM_MUESTRA; rm++) {
      if (richMuestra[rm][c].getLinkUrl()) { tieneEnlace = true; break; }
    }
    if (!tieneEnlace) continue;

    // Columna con enlaces confirmada: recién aquí se lee completa con [→ Contexto_Base_Web.md §05B074]
    var richCol = sh.getRange(primeraFilaDatos, c + 1, filasDatos, 1).getRichTextValues();
    for (var r2 = 0; r2 < richCol.length; r2++) {
      valores[r2 + 1][c] = richCol[r2][0].getLinkUrl() || '';
    }
  }

  // FASE 1 (Lista_de_cambios.md, 18-jul-2026): detección automática de [→ Contexto_Base_Web.md §05B075]
  var valMuestraFechas = sh.getRange(primeraFilaDatos, 1, TAM_MUESTRA, numCols).getValues();
  for (var cf = 0; cf < numCols; cf++) {
    var tieneFecha = false;
    for (var rf = 0; rf < TAM_MUESTRA; rf++) {
      if (valMuestraFechas[rf][cf] instanceof Date && !isNaN(valMuestraFechas[rf][cf].getTime())) {
        tieneFecha = true;
        break;
      }
    }
    if (!tieneFecha) continue;

    // Columna de fecha confirmada: se lee completa con getValues() (SOLO [→ Contexto_Base_Web.md §05B076]
    var colFechas = sh.getRange(primeraFilaDatos, cf + 1, filasDatos, 1).getValues();
    var forzarHoraEstaCol = !!colConHoraForzada && (cf + 1) === colConHoraForzada;
    var formatoNumericoEstaCol = !!(colsFormatoNumerico && colsFormatoNumerico[cf + 1]);
    for (var rf2 = 0; rf2 < colFechas.length; rf2++) {
      if (colFechas[rf2][0] instanceof Date && !isNaN(colFechas[rf2][0].getTime())) {
        valores[rf2 + 1][cf] = formatoNumericoEstaCol
          ? String(colFechas[rf2][0].getTime())
          : _formatFechaCanonica(colFechas[rf2][0], forzarHoraEstaCol);
      }
    }
  }

  // FASE 5 (25-sep-2026, rediseño T_Lista -- ver punto B-bis del docblock [→ Contexto_Base_Web.md §05B077]
  if (colsMinutosASegundos) {
    for (var cm = 0; cm < numCols; cm++) {
      if (!colsMinutosASegundos[cm + 1]) continue;
      var colMinutos = sh.getRange(primeraFilaDatos, cm + 1, filasDatos, 1).getValues();
      for (var rmn = 0; rmn < colMinutos.length; rmn++) {
        var valMinutos = colMinutos[rmn][0];
        if (typeof valMinutos === 'number' && !isNaN(valMinutos)) {
          valores[rmn + 1][cm] = String(valMinutos * 60);
        }
      }
    }
  }

  // 29-oct-2026: columnas con separador de miles solo de visualización: getDisplayValues() trae «1,000»; el respaldo guarda el número crudo («1000»), y también los decimales que el formato redondea al mostrarlos.
  if (colsSinSeparadorMiles) {
    for (var cs = 0; cs < numCols; cs++) {
      if (!colsSinSeparadorMiles[cs + 1]) continue;
      var colNumeros = sh.getRange(primeraFilaDatos, cs + 1, filasDatos, 1).getValues();
      for (var rnum = 0; rnum < colNumeros.length; rnum++) {
        var valNumero = colNumeros[rnum][0];
        if (typeof valNumero === 'number' && !isNaN(valNumero)) valores[rnum + 1][cs] = String(valNumero);
      }
    }
  }

  // 29-oct-2026 (pedido de la usuaria): última defensa de TODO respaldo que pasa por aquí. Si una celda de hora quedó como texto con la fecha base de la hoja («30/12/1899 21:00:00», p. ej. una hora tecleada o importada como texto), se guarda solo la hora. [→ Contexto_Base_Web.md §PF286]
  var reHoraBase1899 = /^\s*30\/12\/1899\s+(\d{1,2}:\d{2}(?::\d{2})?)\s*$/;
  for (var rb = 1; rb < valores.length; rb++) {
    for (var cb = 0; cb < valores[rb].length; cb++) {
      var vb = valores[rb][cb];
      if (typeof vb === 'string' && vb.indexOf('1899') !== -1) {
        var mb = vb.match(reHoraBase1899);
        if (mb) valores[rb][cb] = mb[1];
      }
    }
  }

  return valores;
}

/**
 * _combinarHeaderDosFilas(sh, numCols) [→ Contexto_Base_Web.md §05B078]
 */
function _combinarHeaderDosFilas(sh, numCols) {
  var row1 = sh.getRange(1, 1, 1, numCols).getDisplayValues()[0];
  var row2 = sh.getRange(2, 1, 1, numCols).getDisplayValues()[0];

  // Cuenta cuántas veces aparece cada nombre de fila 2 en TODA la hoja -- [→ Contexto_Base_Web.md §05B079]
  var conteoNombre = {};
  for (var c0 = 0; c0 < numCols; c0++) {
    if (!row2[c0]) continue;
    conteoNombre[row2[c0]] = (conteoNombre[row2[c0]] || 0) + 1;
  }

  var ultimaEtiquetaGrupo = '';
  var combinado = [];
  for (var c = 0; c < numCols; c++) {
    if (row1[c] !== '') ultimaEtiquetaGrupo = row1[c];
    if (!row2[c]) {
      // Compatibilidad con el esquema viejo (columna fusionada [→ Contexto_Base_Web.md §05B080]
      combinado.push(ultimaEtiquetaGrupo);
    } else if (conteoNombre[row2[c]] > 1) {
      // Nombre ambiguo (se repite en más de un grupo, ej. "C1") -> se
      // prefija con el grupo para desambiguar.
      combinado.push(ultimaEtiquetaGrupo + ' ' + row2[c]);
    } else {
      // Nombre único dentro de la hoja -> se usa tal cual, sin prefijo.
      combinado.push(row2[c]);
    }
  }
  return combinado;
}

/**
 * _combinarHeaderTresFilas(sh, numCols) [→ Contexto_Base_Web.md §05B081]
 */
function _combinarHeaderTresFilas(sh, numCols) {
  var row1 = sh.getRange(1, 1, 1, numCols).getDisplayValues()[0];
  var row2 = sh.getRange(2, 1, 1, numCols).getDisplayValues()[0];
  var row3 = sh.getRange(3, 1, 1, numCols).getDisplayValues()[0];

  var grupo1 = '', grupo1FF = [];
  for (var c1 = 0; c1 < numCols; c1++) {
    if (row1[c1] !== '') grupo1 = row1[c1];
    grupo1FF.push(grupo1);
  }
  var grupo2 = '', grupo2FF = [];
  for (var c2 = 0; c2 < numCols; c2++) {
    if (row2[c2] !== '') grupo2 = row2[c2];
    grupo2FF.push(grupo2);
  }

  // Conteo de cada nombre de fila 3 (leaf) en TODA la hoja -- solo
  // C1/C2/C3/C4 deberían repetirse (una vez por rol x grupo).
  var conteoLeaf = {};
  for (var l0 = 0; l0 < numCols; l0++) {
    if (!row3[l0]) continue;
    conteoLeaf[row3[l0]] = (conteoLeaf[row3[l0]] || 0) + 1;
  }
  // Conteo de la combinación rol+leaf (ej. "Miembro|C1") -- en CR_Lista [→ Contexto_Base_Web.md §05B082]
  var conteoRolLeaf = {};
  for (var l1 = 0; l1 < numCols; l1++) {
    if (!row3[l1]) continue;
    var claveRolLeaf = grupo2FF[l1] + '|' + row3[l1];
    conteoRolLeaf[claveRolLeaf] = (conteoRolLeaf[claveRolLeaf] || 0) + 1;
  }

  var combinado = [];
  for (var c = 0; c < numCols; c++) {
    var leaf = row3[c];
    if (!leaf) {
      // Columna simple fusionada verticalmente en las 3 filas (no debería [→ Contexto_Base_Web.md §05B083]
      combinado.push(grupo1FF[c]);
    } else if (conteoLeaf[leaf] <= 1) {
      // Nombre único en toda la hoja -> tal cual, sin prefijo.
      combinado.push(leaf);
    } else if (grupo2FF[c] && conteoRolLeaf[grupo2FF[c] + '|' + leaf] <= 1) {
      // Ambiguo a nivel hoja, pero único dentro de su rol -> prefijo de rol.
      combinado.push(grupo2FF[c] + ' ' + leaf);
    } else {
      // Sigue ambiguo (caso real de C1-C4 en CR_Lista) -> prefijo completo
      // grupo + rol.
      combinado.push((grupo1FF[c] + (grupo2FF[c] ? ' ' + grupo2FF[c] : '') + ' ' + leaf).trim());
    }
  }
  return combinado;
}

/**
 * _mapaNombreAIdxDesdeHoja(sh, numCols, numFilasHeader) [→ Contexto_Base_Web.md §05B084]
 */
function _mapaNombreAIdxDesdeHoja(sh, numCols, numFilasHeader) {
  var nombres;
  if (numFilasHeader === 3) {
    nombres = _combinarHeaderTresFilas(sh, numCols);
  } else if (numFilasHeader === 2) {
    nombres = _combinarHeaderDosFilas(sh, numCols);
  } else {
    nombres = sh.getRange(1, 1, 1, numCols).getDisplayValues()[0];
  }
  var mapa = {};
  for (var c = 0; c < nombres.length; c++) {
    var nombre = String(nombres[c] || '').trim();
    if (nombre) mapa[nombre] = c + 1;
  }
  return mapa;
}

/**
 * _mapearIndicesCSVPorEncabezado(headerCSV, nombreAIdx) [→ Contexto_Base_Web.md §05B085]
 */
function _mapearIndicesCSVPorEncabezado(headerCSV, nombreAIdx) {
  var csvIdxAIdx = [];
  for (var h = 0; h < headerCSV.length; h++) {
    var nombreCol = String(headerCSV[h] || '').trim();
    csvIdxAIdx.push(Object.prototype.hasOwnProperty.call(nombreAIdx, nombreCol) ? nombreAIdx[nombreCol] : null);
  }
  return csvIdxAIdx;
}

/**
 * _reconstruirFilaCSVPorEncabezado(rowCSV, csvIdxAIdx, totalCols) [→ Contexto_Base_Web.md §05B086]
 */
function _reconstruirFilaCSVPorEncabezado(rowCSV, csvIdxAIdx, totalCols) {
  var newR = [];
  for (var c = 0; c < totalCols; c++) newR.push('');
  for (var c2 = 0; c2 < rowCSV.length; c2++) {
    var idxDestino = csvIdxAIdx[c2];
    if (idxDestino) newR[idxDestino - 1] = rowCSV[c2];
  }
  return newR;
}

/**
 * _formatFechaCanonica(dateVal, forzarConHora) [→ Contexto_Base_Web.md §05B087]
 */
function _formatFechaCanonica(dateVal, forzarConHora) {
  if (!(dateVal instanceof Date) || isNaN(dateVal.getTime())) return '';
  var TZ = 'America/Lima';
  var horaStr = Utilities.formatDate(dateVal, TZ, 'HH:mm:ss');
  // 29-oct-2026 (pedido de la usuaria): una columna de «solo hora» (Hora de T_Lista, S_Lista y CR_Lista) llega como Date con la fecha base de la hoja (30/12/1899). El respaldo guardaba «30/12/1899 21:00:00»; ahora guarda solo «21:00:00». [→ Contexto_Base_Web.md §PF286]
  if (Utilities.formatDate(dateVal, TZ, 'yyyy') === '1899') return horaStr;
  if (!forzarConHora && horaStr === '00:00:00') return Utilities.formatDate(dateVal, TZ, 'dd/MM/yyyy');
  return Utilities.formatDate(dateVal, TZ, 'dd/MM/yyyy HH:mm:ss');
}

/**
 * _guardarExtraColsInactivosBatch(nuevosPorTag) [→ Contexto_Base_Web.md §05B088]
 */
function _guardarExtraColsInactivosBatch(nuevosPorTag) {
  try {
    var mapa = _cargarExtraColsInactivos();
    for (var tag in nuevosPorTag) mapa[tag] = nuevosPorTag[tag];

    // (25-sep-2026, FASE B) Ahora en "Otros" (DRIVE_FOLDER_ID_OTROS), igual [→ Contexto_Base_Web.md §05B089]
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var filename = 'ClanSystem_Backup_InactivosExtra.json';
    var files = folder.getFilesByName(filename);
    var content = JSON.stringify(mapa, null, 2);
    if (files.hasNext()) {
      _setContentConConteo_(files.next(), content);
    } else {
      _createFileConConteo_(folder, filename, content, MimeType.PLAIN_TEXT);
    }
    Logger.log('[Backup] ClanSystem_Backup_InactivosExtra.json actualizado (' + Object.keys(nuevosPorTag).length + ' tag(s) frescos).');
  } catch(e) {
    Logger.log('[Backup] Error guardando ClanSystem_Backup_InactivosExtra.json: ' + e.message);
  }
}

/**
 * _importarInactivosDesdeCSV(ss) [→ Contexto_Base_Web.md §05B090]
 */
function _importarInactivosDesdeCSV(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.INACTIVOS);
  if (!sh) return;

  var fileName = 'Backup_Inactivos.csv';
  var csvText = _loadCSVFromDrive(fileName);
  if (!csvText) return;

  try {
    var parsed = _parseCSV(csvText);
    if (!parsed || parsed.length <= 1) {
      Logger.log('[ALERTA IMPORTACIÓN] ' + fileName + ' vacío o corrupto. Se cancela importación.');
      return;
    }

    var numRows = parsed.length;
    var numCols = INACTIVOS_TOTAL_COLS;

    if (numRows > sh.getMaxRows()) sh.insertRowsAfter(sh.getMaxRows(), numRows - sh.getMaxRows() + 10);
    // NUNCA usar DIR_TOTAL_COLS (60) aquí: forzaría a Sheets a re-expandir
    // la hoja Inactivos de vuelta a 60 columnas.
    if (numCols > sh.getMaxColumns()) sh.insertColumnsAfter(sh.getMaxColumns(), numCols - sh.getMaxColumns());

    // Mapa CAMPO (clave de DC, ej. 'TAG', 'PERMISO', ...) -> índice REAL [→ Contexto_Base_Web.md §05B091]
    var headerCsv = parsed[0];
    var idxEnCsvPorCampo = {};
    for (var campoParaMapa in DC) {
      var nombreLiteral = DC_HEADERS_60_COLS[DC[campoParaMapa] - 1];
      idxEnCsvPorCampo[campoParaMapa] = nombreLiteral ? headerCsv.indexOf(nombreLiteral) : -1;
    }

    var extraPorTag = {};
    var rectData = [];
    for (var idx = 0; idx < numRows; idx++) {
      var rCsv = parsed[idx];
      if (idx === 0) {
        // Encabezado: se descarta; _setupInactivos() escribe los encabezados [→ Contexto_Base_Web.md §05B092]
        continue;
      }
      var fila29 = new Array(INACTIVOS_TOTAL_COLS).fill('');
      for (var campo in IC) {
        var idxCampoCsv = idxEnCsvPorCampo[campo];
        var valorCampo = (idxCampoCsv >= 0 && rCsv[idxCampoCsv] !== undefined) ? rCsv[idxCampoCsv] : '';
        if (campo === 'VETADO' || campo === 'PERMISO' || campo === 'ADMIN') {
          valorCampo = _esSiNoOVacio(valorCampo) ? valorCampo : '';
        } else if (campo === 'RAZON') {
          valorCampo = esRazonValida(valorCampo) ? valorCampo : '';
        }
        fila29[IC[campo] - 1] = valorCampo;
      }
      // Fechas: Fecha_ing/Fecha_lim se guardaron como texto en el CSV.
      var fIng = _parseSpanishDate(fila29[IC.FECHA_ING - 1]);
      if (fIng instanceof Date) fila29[IC.FECHA_ING - 1] = fIng;
      var fLim = _parseSpanishDate(fila29[IC.FECHA_LIM - 1]);
      if (fLim instanceof Date) fila29[IC.FECHA_LIM - 1] = fLim;

      rectData.push(fila29);

      var tagFila = String(fila29[IC.TAG - 1] || '').trim();
      if (tagFila) {
        var extraObj = {};
        var tieneExtra = false;
        for (var campoDC in DC) {
          if (IC[campoDC] !== undefined) continue; // ya está en las 29 columnas propias (incluye Comentario)
          var idxExtraCsv = idxEnCsvPorCampo[campoDC];
          var valExtra = idxExtraCsv >= 0 ? rCsv[idxExtraCsv] : undefined;
          if (valExtra !== '' && valExtra !== undefined && valExtra !== null) {
            extraObj[campoDC] = valExtra;
            tieneExtra = true;
          }
        }
        if (tieneExtra) extraPorTag[tagFila] = extraObj;
      }
    }

    sh.clearContents();
    _setupInactivos(ss);
    if (rectData.length > 0) {
      sh.getRange(2, 1, rectData.length, INACTIVOS_TOTAL_COLS).setValues(rectData);
    }

    if (Object.keys(extraPorTag).length > 0) {
      _guardarExtraColsInactivosBatch(extraPorTag);
    }

    Logger.log('[Backup] ' + CFG.SHEETS.INACTIVOS + ' restaurado con ' + rectData.length + ' registros (29 columnas, sin re-expandir; extras restauradas en ClanSystem_Backup_InactivosExtra.json).');

  } catch(e) {
    Logger.log('[Backup] Error importando ' + fileName + ': ' + e.message);
  }
}

/**
 * _insertarColumnaFechaIndice(valores, pos, timestamp) [→ Contexto_Base_Web.md §05B093]
 */
function _insertarColumnaFechaIndice(valores, pos, timestamp) {
  var headers = valores[0];
  var nuevosHeaders = headers.slice(0, pos).concat(['Fecha'], headers.slice(pos));
  var filas = [nuevosHeaders];
  for (var i = 1; i < valores.length; i++) {
    var fila = valores[i];
    filas.push(fila.slice(0, pos).concat([timestamp], fila.slice(pos)));
  }
  return filas;
}

// CACHÉ DE CSV (08-oct-2026): memoria por ejecución + CacheService (10 min); _saveCSVToDrive la invalida.
var CSV_CACHE_TTL_SEG   = 600;     // 10 min
var CSV_CACHE_CHUNK     = 90000;   // CacheService: máx 100 KB por valor
var CSV_CACHE_MAX_CHUNK = 40;      // si el CSV comprimido pasa de ~3.5 MB, no se cachea
var _CSV_MEM_ = {};                // memoria por ejecución: filename -> texto

// PF290 (28-oct-2026): conteo de filas o elementos antes y después de cada escritura de un CSV o JSON en Drive. Para no alargar las corridas con muchos archivos, el tiempo gastado en leer y contar tiene un tope por ejecución; al pasarlo, los archivos siguientes se escriben sin conteo. [→ Contexto_Base_Web.md §PF290]
var CONTEO_ARCHIVOS_PRESUPUESTO_MS = 20000;
var _conteoArchivosMs_ = 0;           // tiempo acumulado de conteo en esta ejecución
var _conteoArchivosAgotadoAvisado_ = false;

// PF291 (29-oct-2026): verificación del tamaño tras cada escritura y segunda revisión al final de la cola horaria de guerra. El 28-oct a las 8:05 a. m.
// Backup_Guerra.csv quedó en 0 B justo después de una escritura correcta de 2,4 MB [→ Contexto_Base_Web.md §PF289 punto 10, §PF291].
var ESCRITURA_VERIF_REINTENTOS = 2;    // reescrituras antes de dar la escritura por fallida
var ESCRITURA_VERIF_ESPERA_MS  = 1500; // espera antes de volver a medir el archivo
var _csvEscritosEnEjecucion_ = {};     // filename -> último texto que _saveCSVToDrive() dejó escrito en esta ejecución
var _csvEscritosTs_ = {};               // filename -> hora (ms) de esa escritura
var ESCRITURA_VERIF_ESPERA_FINAL_MS = 8000; // espera mínima desde la escritura antes de la revisión posterior al salir de una tanda
var ESCRITURA_VERIF_TOLERANCIA_MS = 20000; // margen entre nuestra escritura y la fecha de modificación del archivo para considerar que fue otra ejecución la que lo cambió (PF292, punto 9)

function _csvCacheKey_(filename) { return 'CSVDRV_' + filename; }

function _csvCacheGet_(filename) {
  try {
    var cache = CacheService.getScriptCache();
    var base = _csvCacheKey_(filename);
    var n = parseInt(cache.get(base + '_n') || '0', 10);
    if (!n) return null;
    var keys = [];
    for (var i = 0; i < n; i++) keys.push(base + '_' + i);
    var got = cache.getAll(keys);
    var b64 = '';
    for (var j = 0; j < n; j++) {
      var trozo = got[keys[j]];
      if (trozo === undefined || trozo === null) return null; // trozo expirado/faltante
      b64 += trozo;
    }
    var blob = Utilities.newBlob(Utilities.base64Decode(b64), 'application/x-gzip', 'x.gz');
    return Utilities.ungzip(blob).getDataAsString('UTF-8');
  } catch (e) {
    return null; // ante cualquier duda, se lee de Drive
  }
}

function _csvCachePut_(filename, text) {
  try {
    var bytes = Utilities.gzip(Utilities.newBlob(text, 'text/plain', 'x.txt')).getBytes();
    var b64 = Utilities.base64Encode(bytes);
    var n = Math.ceil(b64.length / CSV_CACHE_CHUNK);
    if (n < 1 || n > CSV_CACHE_MAX_CHUNK) return;
    var base = _csvCacheKey_(filename);
    var obj = {};
    for (var i = 0; i < n; i++) obj[base + '_' + i] = b64.substr(i * CSV_CACHE_CHUNK, CSV_CACHE_CHUNK);
    obj[base + '_n'] = String(n);
    CacheService.getScriptCache().putAll(obj, CSV_CACHE_TTL_SEG);
  } catch (e) { /* sin caché: no pasa nada */ }
}

// PF042: caché del resultado de _construirCoberturaPorTag() (18_CorreccionGuerra.gs); se invalida junto con el CSV de guerra. [→ Contexto_Base_Web.md §PF042]
var COBERTURA_GUERRA_CACHE_KEY = 'COBGUERRA_v1';

function _csvCacheBorrar_(filename) {
  try {
    var cache = CacheService.getScriptCache();
    var base = _csvCacheKey_(filename);
    var n = parseInt(cache.get(base + '_n') || '0', 10);
    var keys = [base + '_n'];
    for (var i = 0; i < Math.max(n, 0); i++) keys.push(base + '_' + i);
    if (filename === 'Backup_Guerra.csv') keys.push(COBERTURA_GUERRA_CACHE_KEY); // PF042
    cache.removeAll(keys);
  } catch (e) { /* nada que hacer */ }
}

function _loadCSVFromDrive(filename) {
  // 1) memoria de esta ejecución
  if (Object.prototype.hasOwnProperty.call(_CSV_MEM_, filename)) return _CSV_MEM_[filename];

  // 2) caché entre peticiones
  var cacheado = _csvCacheGet_(filename);
  if (cacheado !== null) {
    _CSV_MEM_[filename] = cacheado;
    return cacheado;
  }

  // 3) Drive
  var hit = _csvBuscarArchivo_(filename); // subcarpeta asignada -> raíz -> demás subcarpetas [→ Contexto_Base_Web.md §01B158]
  if (hit) {
    var texto = hit.file.getBlob().getDataAsString('UTF-8');
    _CSV_MEM_[filename] = texto;
    _csvCachePut_(filename, texto);
    return texto;
  }
  return null; // los archivos inexistentes no se cachean
}

/**
 * Parsea texto CSV con manejo completo de RFC 4180
 * (comillas, comas y saltos de línea dentro de campos).
 */
function _parseCSV(text) {
  var rows = [], row = [], inQuotes = false, val = '';
  for (var i = 0; i < text.length; i++) {
    var c = text.charAt(i);
    if (inQuotes) {
      if (c === '"') {
        if (i + 1 < text.length && text.charAt(i + 1) === '"') { val += '"'; i++; }
        else { inQuotes = false; }
      } else { val += c; }
    } else {
      if (c === '"') { inQuotes = true; }
      else if (c === ',') { row.push(val); val = ''; }
      else if (c === '\n' || c === '\r') {
        row.push(val); rows.push(row); row = []; val = '';
        if (c === '\r' && text.charAt(i + 1) === '\n') i++;
      } else { val += c; }
    }
  }
  if (val || text.charAt(text.length - 1) === ',') row.push(val);
  if (row.length > 0) rows.push(row);
  return rows;
}

/**
 * Parsea fechas en formato español o en formato dd/mm/yyyy.
 */
function _parseSpanishDate(str) {
  if (!str) return '';
  if (str instanceof Date) return str;
  var s = String(str).trim();

  // FASE 4 (25-ago-2026): formato numérico (epoch ms), usado por Vetados.Fecha [→ Contexto_Base_Web.md §05B094]
  if (/^\d{10,13}$/.test(s)) {
    var msNum = s.length <= 10 ? Number(s) * 1000 : Number(s);
    var dNum = new Date(msNum);
    if (!isNaN(dNum.getTime())) return dNum;
  }

  var matchText = s.match(/(\d{1,2})\s+de\s+([a-zA-Z]+)(?:,|\s+)\s*(\d{4})/i);
  if (matchText) {
    var day = parseInt(matchText[1], 10);
    var monthStr = matchText[2].toLowerCase();
    var year = parseInt(matchText[3], 10);
    var months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    var monthIdx = months.indexOf(monthStr);
    if (monthIdx !== -1) {
      var timeMatch = s.match(/(\d{1,2}):(\d{2}):(\d{2})\s*(a\.?m\.?|p\.?m\.?)/i);
      var hrs = 0, mins = 0, secs = 0;
      if (timeMatch) {
        hrs = parseInt(timeMatch[1], 10);
        mins = parseInt(timeMatch[2], 10);
        secs = parseInt(timeMatch[3], 10);
        var ampm = timeMatch[4].toLowerCase().replace(/\./g, '');
        if (ampm === 'pm' && hrs < 12) hrs += 12;
        if (ampm === 'am' && hrs === 12) hrs = 0;
      }
      return new Date(year, monthIdx, day, hrs, mins, secs);
    }
  }

  // FIX (hora perdida al re-parsear fechas ya en formato canónico [→ Contexto_Base_Web.md §05B095]
  var matchSlash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2}):(\d{2}))?/);
  if (matchSlash) {
    var hrsS  = matchSlash[4] !== undefined ? parseInt(matchSlash[4], 10) : 0;
    var minsS = matchSlash[5] !== undefined ? parseInt(matchSlash[5], 10) : 0;
    var secsS = matchSlash[6] !== undefined ? parseInt(matchSlash[6], 10) : 0;
    return new Date(
      parseInt(matchSlash[3], 10),
      parseInt(matchSlash[2], 10) - 1,
      parseInt(matchSlash[1], 10),
      hrsS, minsS, secsS
    );
  }

  var d = new Date(s);
  if (!isNaN(d.getTime())) return d;

  return s;
}

/**
 * _respaldarIndiceCSV(ss) [→ Contexto_Base_Web.md §05B096]
 */
/**
 * _respaldarIndiceCSV(ss) [→ Contexto_Base_Web.md §05B097]
 */
function _respaldarIndiceCSV(ss) {
  var fileName = 'Backup_Índice.csv';
  var sh = ss.getSheetByName(CFG.SHEETS.INDICE);
  if (!sh) return;

  var lastRow = sh.getLastRow();
  var lastCol = sh.getLastColumn();
  if (lastRow < 1 || lastCol < 1) return;

  var valoresHoja = _extraerValoresConLinksReales(sh, lastRow, lastCol);
  var headersHoja = valoresHoja[0];
  var idxIdHoja = headersHoja.indexOf('ID');
  var idxNombreHoja = headersHoja.indexOf('Nombre');
  var idxEdicionHoja = headersHoja.indexOf('Edición');
  // Posición (0-based) donde se inserta "Fecha" en el CSV: justo a la [→ Contexto_Base_Web.md §05B098]
  var posFecha = idxEdicionHoja >= 0 ? idxEdicionHoja + 1 : headersHoja.length;
  var ahora = Date.now(); // timestamp numérico (ms desde epoch) — nunca texto.

  if (idxIdHoja < 0) {
    // Sin columna ID todavía no se puede rastrear cambios de ID entre [→ Contexto_Base_Web.md §05B099]
    _saveCSVToDrive(fileName, _encodeCSV(valoresHoja));
    Logger.log('[Backup] ' + fileName + ' sincronizado sin fusión por ID (' + lastRow + ' filas, hoja sin columna ID todavía).');
    return;
  }

  var csvExistente = _loadCSVFromDrive(fileName);
  if (!csvExistente) {
    // Primera vez que se genera el CSV: todas las filas son "nuevas" ->
    // Fecha = ahora para todas.
    _saveCSVToDrive(fileName, _encodeCSV(_insertarColumnaFechaIndice(valoresHoja, posFecha, ahora)));
    Logger.log('[Backup] ' + fileName + ' creado (' + lastRow + ' filas).');
    return;
  }

  var parsedCsv = _parseCSV(csvExistente);
  var headersCsv = parsedCsv[0] || [];
  var idxIdCsv = headersCsv.indexOf('ID');
  var idxNombreCsv = headersCsv.indexOf('Nombre');
  var idxFechaCsv = headersCsv.indexOf('Fecha');

  if (idxIdCsv < 0) {
    _saveCSVToDrive(fileName, _encodeCSV(_insertarColumnaFechaIndice(valoresHoja, posFecha, ahora)));
    Logger.log('[Backup] ' + fileName + ' sincronizado (CSV anterior sin columna ID; se reemplaza directo esta vez).');
    return;
  }

  // Fecha previa por ID (para conservarla en las filas cuyo ID NO cambió). [→ Contexto_Base_Web.md §05B100]
  var fechaAnteriorPorId = {};
  if (idxFechaCsv >= 0) {
    for (var fi = 1; fi < parsedCsv.length; fi++) {
      var idFi = String(parsedCsv[fi][idxIdCsv] || '').trim();
      if (idFi) fechaAnteriorPorId[idFi] = parsedCsv[fi][idxFechaCsv];
    }
  }

  var filasHojaPorId = {};
  var filasHojaPorNombre = {};
  for (var i = 1; i < valoresHoja.length; i++) {
    var idHoja = String(valoresHoja[i][idxIdHoja] || '').trim();
    var nombreHoja = idxNombreHoja >= 0 ? String(valoresHoja[i][idxNombreHoja] || '').trim() : '';
    if (idHoja) filasHojaPorId[idHoja] = valoresHoja[i];
    if (nombreHoja) filasHojaPorNombre[nombreHoja] = valoresHoja[i];
  }

  var headersResultado = headersHoja.slice(0, posFecha).concat(['Fecha'], headersHoja.slice(posFecha));
  var resultado = [headersResultado];
  var idsUsados = {};
  var descartadas = 0;

  for (var r = 1; r < parsedCsv.length; r++) {
    var idCsv = String(parsedCsv[r][idxIdCsv] || '').trim();
    var nombreCsv = idxNombreCsv >= 0 ? String(parsedCsv[r][idxNombreCsv] || '').trim() : '';

    var filaActualizada = null;
    var idCambioAhora = false;
    if (idCsv && filasHojaPorId.hasOwnProperty(idCsv)) {
      filaActualizada = filasHojaPorId[idCsv];
    } else if (nombreCsv && filasHojaPorNombre.hasOwnProperty(nombreCsv)) {
      // El ID cambió (pestaña borrada y recreada con el mismo nombre): se [→ Contexto_Base_Web.md §05B101]
      filaActualizada = filasHojaPorNombre[nombreCsv];
      idCambioAhora = true;
    }

    if (filaActualizada) {
      var idNuevoUsado = String(filaActualizada[idxIdHoja] || '').trim();
      var fechaFila;
      if (idCambioAhora) {
        fechaFila = ahora;
      } else if (idxFechaCsv >= 0 && fechaAnteriorPorId.hasOwnProperty(idCsv)) {
        fechaFila = fechaAnteriorPorId[idCsv]; // ID sin cambios: se conserva la Fecha ya registrada.
      } else {
        fechaFila = ahora; // sin Fecha previa (CSV viejo sin esta columna todavía).
      }
      resultado.push(filaActualizada.slice(0, posFecha).concat([fechaFila], filaActualizada.slice(posFecha)));
      if (idNuevoUsado) idsUsados[idNuevoUsado] = true;
    } else {
      // Ni ID ni Nombre matchean con la hoja actual: la pestaña ya no
      // existe de verdad. Se descarta (antes se conservaba para siempre).
      descartadas++;
    }
  }

  for (var idNuevo in filasHojaPorId) {
    if (!idsUsados[idNuevo]) {
      // Fila realmente nueva (hoja que no estaba en el CSV anterior, ni
      // por ID ni por Nombre): Fecha = ahora.
      var filaNueva = filasHojaPorId[idNuevo];
      resultado.push(filaNueva.slice(0, posFecha).concat([ahora], filaNueva.slice(posFecha)));
    }
  }

  _saveCSVToDrive(fileName, _encodeCSV(resultado));
  Logger.log('[Backup] ' + fileName + ' fusionado por ID/Nombre (' + (resultado.length - 1) + ' filas totales' +
    (descartadas > 0 ? ', ' + descartadas + ' fila(s) huérfana(s) descartada(s)' : '') + ').');
}

/**
 * _respaldarListaHojasCSV(ss, hojas, protegerContraReduccion, colClaveIdx) [→ Contexto_Base_Web.md §05B102]
 */
/**
 * _respaldarListaHojasCSV(ss, hojas, protegerContraReduccion, colClaveIdx, maxColOverride) [→ Contexto_Base_Web.md §05B103]
 */
/**
 * _colSet(...cols) [→ Contexto_Base_Web.md §05B104]
 */
function _colSet() {
  var m = {};
  for (var i = 0; i < arguments.length; i++) m[arguments[i]] = true;
  return m;
}

/**
 * _respaldarListaHojasCSV(ss, hojas, protegerContraReduccion, colClaveIdx, colsFormatoNumerico) [→ Contexto_Base_Web.md §05B105]
 */
/**
 * _respaldarListaHojasCSV(ss, hojas, protegerContraReduccion, colClaveIdx, colsFormatoNumerico, colsMinutosASegundos) [→ Contexto_Base_Web.md §05B106]
 */
// _colsMilesDeHoja_(nombreHoja): columnas con separador de miles solo de visualización de T_Lista, S_Lista y CR_Lista ({col: true}); null en las demás hojas. [→ Contexto_Base_Web.md §PF286]
function _colsMilesDeHoja_(nombreHoja) {
  if (nombreHoja === CFG.SHEETS.T_LISTA)  return _colSet.apply(null, TL_COLS_MILES);
  if (nombreHoja === CFG.SHEETS.S_LISTA)  return _colSet.apply(null, SL_COLS_MILES);
  if (nombreHoja === CFG.SHEETS.CR_LISTA) return _colSet.apply(null, CR_COLS_MILES);
  return null;
}

function _respaldarListaHojasCSV(ss, hojas, protegerContraReduccion, colClaveIdx, colsFormatoNumerico, colsMinutosASegundos) {
  for (var i = 0; i < hojas.length; i++) {
    var sh = ss.getSheetByName(hojas[i]);
    if (!sh) continue;

    var fileName = 'Backup_' + hojas[i] + '.csv';
    var lastRow = sh.getLastRow();
    var lastCol = sh.getLastColumn();
    if (lastRow < 1 || lastCol < 1) continue;

    // FIX (08-sep-2026, pedido usuario): T_Lista/S_Lista tienen header de 2 [→ Contexto_Base_Web.md §05B107]
    var headerRows = (hojas[i] === CFG.SHEETS.T_LISTA || hojas[i] === CFG.SHEETS.S_LISTA) ? 2 :
                      (hojas[i] === CFG.SHEETS.CR_LISTA) ? 3 : 1;
    var filasDatosHoja = lastRow - headerRows;

    if (protegerContraReduccion) {
      var csvExistente = _loadCSVFromDrive(fileName);
      var csvParseado = csvExistente ? _parseCSV(csvExistente) : null;
      var csvRows = csvParseado ? csvParseado.length : 0;
      var filasDatosCsv = csvRows > 0 ? csvRows - 1 : 0; // el CSV siempre trae 1 sola fila de header
      if (filasDatosHoja < filasDatosCsv) {
        Logger.log('[ALERTA PROTECCIÓN] SKIP sobreescritura de ' + fileName +
                   ' (Hoja tiene ' + filasDatosHoja + ' filas de dato, CSV tiene ' + filasDatosCsv + '). No se guardó.');
        continue;
      }

      // Chequeo adicional por CLAVE (ver comentario del parámetro arriba): [→ Contexto_Base_Web.md §05B108]
      if (colClaveIdx && !_BACKUP_OMITIR_CHECK_CLAVES_ && csvParseado && csvParseado.length > 1) {
        var clavesCSV = {};
        for (var rc = 1; rc < csvParseado.length; rc++) {
          var claveCsv = String(csvParseado[rc][colClaveIdx - 1] || '').trim();
          if (claveCsv) clavesCSV[claveCsv] = true;
        }
        var clavesHojaSet = {};
        if (filasDatosHoja >= 1) {
          var colClaveVals = sh.getRange(headerRows + 1, colClaveIdx, filasDatosHoja, 1).getValues();
          for (var rh = 0; rh < colClaveVals.length; rh++) {
            var claveHoja = String(colClaveVals[rh][0] || '').trim();
            if (claveHoja) clavesHojaSet[claveHoja] = true;
          }
        }
        var clavesPerdidas = [];
        for (var claveCsvKey in clavesCSV) {
          if (!clavesHojaSet[claveCsvKey]) clavesPerdidas.push(claveCsvKey);
        }
        if (clavesPerdidas.length > 0) {
          Logger.log('[ALERTA PROTECCIÓN] SKIP sobreescritura de ' + fileName +
            ' (el total de filas no bajó, pero ' + clavesPerdidas.length +
            ' clave(s) que SÍ estaban en el CSV ya no están en la hoja: ' +
            clavesPerdidas.join(', ') + '). No se guardó. Si esta baja es ' +
            'intencional (ej. se des-vetó a mano en Sheets), corregir el ' +
            'CSV manualmente o volver a correr el respaldo después de que ' +
            'la hoja quede estable.');
          continue;
        }
      }
    }

    // Detección automática de texto enriquecido (RichText) con enlaces: [→ Contexto_Base_Web.md §05B109]
    var valores = _extraerValoresConLinksReales(sh, lastRow, lastCol, null, colsFormatoNumerico, headerRows, colsMinutosASegundos, _colsMilesDeHoja_(hojas[i]));

    _saveCSVToDrive(fileName, _encodeCSV(valores));
    Logger.log('[Backup] ' + fileName + ' sincronizado (' + filasDatosHoja + ' filas de dato).');
  }
}

function _saveCSVToDrive(filename, content) {
  content = _agregarIdAInformeCSV_(filename, content); // PF238 (29-oct-2026): los informes llevan una columna ID al final; no toca respaldos ni hojas
  var hit = _csvBuscarArchivo_(filename); // nunca crea una copia si el archivo ya existe en alguna subcarpeta [→ Contexto_Base_Web.md §01B158]
  var destino = _csvSubcarpetaDe_(filename);
  if (hit) {
    _setContentConConteo_(hit.file, content);
    if (CSV_MOVER_A_SUBCARPETA && destino && hit.carpetaNombre !== destino) {
      try {
        hit.file.moveTo(_getCsvSubcarpeta_(destino, true));
        Logger.log('[CSV] ' + filename + ' movido a la subcarpeta "' + destino + '".');
      } catch (eMover) {
        Logger.log('[CSV] No se pudo mover ' + filename + ' a "' + destino + '": ' + eMover.message);
      }
    }
  } else {
    _createFileConConteo_(_getCsvSubcarpeta_(destino, true), filename, content, MimeType.CSV);
  }
  // Invalida la caché compartida y deja el texto nuevo en memoria de esta ejecución.
  _csvCacheBorrar_(filename);
  _CSV_MEM_[filename] = content;
  _csvEscritosEnEjecucion_[filename] = content; // PF291: para _reverificarCsvEscritos_()
  _csvEscritosTs_[filename] = Date.now();
}

/**
 * _agregarIdAInformeCSV_(filename, content) - PF238 (29-oct-2026, «tú decide» de la usuaria): agrega al FINAL de un informe una columna «ID» con el formato
 * de Correcciones_Guerra.csv (T_NN_S_NN_#TAG, o T_NN_S_NN si la fila no trae Tag), calculado con las columnas «Temporada», «Semana» y «Tag» de cada fila.
 * Solo aplica a lo que va a la subcarpeta Informes con nombre terminado en (informe), (plan), (aplicado), (detalle) o (resumen), que no empiece por «Backup_»
 * (los respaldos son copias de hojas y se leen por posición) y cuya primera línea traiga «Temporada» y «Semana» y todavía no tenga «ID». Va al final y no
 * al inicio porque los lectores conocidos de informes buscan las columnas por nombre, pero no se descarta alguno que use posiciones. Conserva el BOM, el
 * tipo de salto de línea y el texto original de cada fila. Ante cualquier error devuelve el contenido sin cambios. [→ Contexto_Base_Web.md §PF238]
 */
function _agregarIdAInformeCSV_(filename, content) {
  try {
    var nombre = String(filename || '');
    if (typeof content !== 'string' || content === '') return content;
    if (/^Backup_/.test(nombre) || !/\((informe|plan|aplicado|detalle|resumen)\)\.csv$/.test(nombre)) return content;
    if (_csvSubcarpetaDe_(nombre) !== 'Informes') return content;
    var bom = content.charAt(0) === '﻿' ? '﻿' : '';
    var texto = bom ? content.slice(1) : content;
    var crlf = texto.indexOf('\r\n') >= 0;
    // Partir en registros por saltos de línea fuera de comillas.
    var registros = [], ini = 0, enComillas = false;
    for (var i = 0; i < texto.length; i++) {
      var c = texto.charAt(i);
      if (c === '"') enComillas = !enComillas;
      else if (c === '\n' && !enComillas) { registros.push(texto.substring(ini, i)); ini = i + 1; }
    }
    var cola = texto.substring(ini);
    if (cola !== '') registros.push(cola);
    if (registros.length < 1) return content;
    var cabecera = _parseCSV(registros[0].replace(/\r$/, ''))[0] || [];
    var iTemp = -1, iSem = -1, iTag = -1;
    for (var h = 0; h < cabecera.length; h++) {
      var nh = String(cabecera[h]).trim();
      if (nh === 'ID') return content;
      if (nh === 'Temporada') iTemp = h; else if (nh === 'Semana') iSem = h; else if (nh === 'Tag') iTag = h;
    }
    if (iTemp < 0 || iSem < 0) return content;
    var salida = [];
    for (var r = 0; r < registros.length; r++) {
      var reg = registros[r].replace(/\r$/, '');
      if (r === 0) { salida.push(reg + ',ID'); continue; }
      if (reg === '') { salida.push(reg); continue; }
      var campos = _parseCSV(reg)[0] || [];
      var t = String(campos[iTemp] === undefined ? '' : campos[iTemp]).trim();
      var sm = String(campos[iSem] === undefined ? '' : campos[iSem]).trim();
      var id = '';
      if (t !== '' && sm !== '' && !isNaN(Number(t)) && !isNaN(Number(sm))) {
        var tg = iTag >= 0 ? String(campos[iTag] === undefined ? '' : campos[iTag]).trim().toUpperCase() : '';
        if (tg && tg.charAt(0) !== '#') tg = '#' + tg;
        id = tg ? _cgwIdFila_(t, sm, tg) : _cgwIdFila_(t, sm, '').replace(/_$/, '');
      }
      salida.push(reg + ',' + id);
    }
    return bom + salida.join(crlf ? '\r\n' : '\n') + (texto.charAt(texto.length - 1) === '\n' ? (crlf ? '\r\n' : '\n') : '');
  } catch (e) {
    Logger.log('[CSV] No se pudo agregar la columna ID a ' + filename + ' (' + e.message + '); se guarda sin ella.');
    return content;
  }
}

/**
 * _contarRegistrosTexto_(texto, nombre) - Cuenta los registros de un CSV o JSON para el log de cambios (PF290).
 * Devuelve { n, txt }: n = número principal (-1 si no se pudo contar) y txt = descripción legible. CSV o texto: filas de dato (sin la
 * primera línea, contando solo saltos fuera de comillas). JSON arreglo: elementos. JSON objeto: claves, más el tamaño de hasta tres claves
 * que sean arreglos u objetos. [→ Contexto_Base_Web.md §PF290]
 */
function _contarRegistrosTexto_(texto, nombre) {
  if (texto === null || texto === undefined) return { n: -1, txt: 'sin lectura' };
  if (texto === '') return { n: 0, txt: '0 (vacío)' };
  if (texto.length > 12000000) return { n: -1, txt: 'demasiado grande para contar' };
  if (/\.json$/i.test(nombre || '')) {
    try {
      var o = JSON.parse(texto.charAt(0) === '\uFEFF' ? texto.slice(1) : texto);
      if (Array.isArray(o)) return { n: o.length, txt: o.length + ' elemento(s)' };
      if (o && typeof o === 'object') {
        var ks = Object.keys(o), partes = [];
        for (var i = 0; i < ks.length && partes.length < 3; i++) {
          var v = o[ks[i]];
          if (v && typeof v === 'object') partes.push(ks[i] + ':' + (Array.isArray(v) ? v.length : Object.keys(v).length));
        }
        return { n: ks.length, txt: ks.length + ' clave(s)' + (partes.length ? ' [' + partes.join(', ') + ']' : '') };
      }
      return { n: 1, txt: '1 valor' };
    } catch (eJson) { return { n: -1, txt: 'JSON ilegible' }; }
  }
  var lineas = 0, enComillas = false;
  for (var j = 0; j < texto.length; j++) {
    var c = texto.charAt(j);
    if (c === '"') enComillas = !enComillas;
    else if (c === '\n' && !enComillas) lineas++;
  }
  if (texto.charAt(texto.length - 1) !== '\n') lineas++;
  var datos = Math.max(0, lineas - 1);
  return { n: datos, txt: datos + ' fila(s)' };
}

/**
 * _logCambioArchivo_(nombre, textoAntes, textoDespues, esNuevo) - Escribe en el log «[Archivo] nombre: antes → después» (PF290).
 * Si el conteo baja, agrega «[BAJA n]». Nunca lanza error. [→ Contexto_Base_Web.md §PF290]
 */
function _logCambioArchivo_(nombre, textoAntes, textoDespues, esNuevo) {
  try {
    var a = esNuevo ? { n: 0, txt: 'archivo nuevo' } : (textoAntes === undefined ? { n: -1, txt: 'antes sin contar' } : _contarRegistrosTexto_(textoAntes, nombre));
    var d = _contarRegistrosTexto_(textoDespues, nombre);
    var marca = (a.n >= 0 && d.n >= 0 && d.n < a.n) ? ' [BAJA ' + (a.n - d.n) + ']' : '';
    Logger.log('[Archivo] ' + nombre + ': ' + a.txt + ' → ' + d.txt + marca);
  } catch (eLog) { /* el conteo nunca debe romper una escritura */ }
}

/**
 * _conteoArchivosDisponible_() - true mientras el tiempo de conteo de esta ejecución no pase de CONTEO_ARCHIVOS_PRESUPUESTO_MS (PF290).
 * Avisa una sola vez en el log cuando se agota. [→ Contexto_Base_Web.md §PF290]
 */
function _conteoArchivosDisponible_() {
  if (_conteoArchivosMs_ <= CONTEO_ARCHIVOS_PRESUPUESTO_MS) return true;
  if (!_conteoArchivosAgotadoAvisado_) {
    _conteoArchivosAgotadoAvisado_ = true;
    Logger.log('[Archivo] Se agotó el tiempo de conteo de esta ejecución (' + Math.round(CONTEO_ARCHIVOS_PRESUPUESTO_MS / 1000) + ' s): los archivos que se escriban después no registran filas antes y después.');
  }
  return false;
}

/**
 * _setContentConConteo_(file, contenido) - Igual que file.setContent(contenido), pero lee antes el contenido actual y deja en el log las
 * filas o elementos antes y después (PF290). No cuenta los archivos Log_*, que ya se leen enteros al escribirse. Los errores de
 * setContent se propagan igual que antes. [→ Contexto_Base_Web.md §PF290]
 */
function _setContentConConteo_(file, contenido) {
  var nombre = '', antes;
  var contar = _conteoArchivosDisponible_();
  var t0 = Date.now();
  try { nombre = file.getName(); } catch (eNombre) { contar = false; }
  if (contar && /^Log_/i.test(nombre)) contar = false;
  if (contar) {
    try { antes = file.getBlob().getDataAsString('UTF-8'); } catch (eLeer) { antes = null; }
  }
  file.setContent(contenido);
  _asegurarEscrituraCompleta_(file, contenido, nombre); // PF291
  if (contar) {
    _logCambioArchivo_(nombre, antes, contenido, false);
    _conteoArchivosMs_ += Date.now() - t0;
  }
}

/**
 * _createFileConConteo_(folder, nombre, contenido, mime) - Igual que folder.createFile(...) y devuelve el archivo; deja en el log el
 * conteo del archivo nuevo (PF290). [→ Contexto_Base_Web.md §PF290]
 */
function _createFileConConteo_(folder, nombre, contenido, mime) {
  var archivo = folder.createFile(nombre, contenido, mime);
  _asegurarEscrituraCompleta_(archivo, contenido, String(nombre)); // PF291
  if (!/^Log_/i.test(String(nombre)) && _conteoArchivosDisponible_()) {
    var t0 = Date.now();
    _logCambioArchivo_(String(nombre), null, contenido, true);
    _conteoArchivosMs_ += Date.now() - t0;
  }
  return archivo;
}

/**
 * _guardarArchivoProgresoVerificado_(folder, nombre, contenido) - Guarda un archivo de progreso o checkpoint (JSON) en la carpeta: si ya existe lo
 * sobrescribe con setContent() y si no lo crea; en los dos casos comprueba que no quedó vacío o recortado con _asegurarEscrituraCompleta_() (PF291).
 * No deja registro de filas (los archivos de progreso se guardan muchas veces por ejecución; PF290, punto 4) y devuelve el archivo. Si la comprobación
 * lanza error, lo propaga: los cinco sitios que la llaman lo atrapan con su propio try y lo dejan en el registro. [→ Contexto_Base_Web.md §PF291]
 */
function _guardarArchivoProgresoVerificado_(folder, nombre, contenido) {
  var it = folder.getFilesByName(nombre);
  var archivo;
  if (it.hasNext()) {
    archivo = it.next();
    archivo.setContent(contenido);
  } else {
    archivo = folder.createFile(nombre, contenido, MimeType.PLAIN_TEXT);
  }
  _asegurarEscrituraCompleta_(archivo, contenido, String(nombre));
  return archivo;
}

/**
 * _archivoModificadoDespuesDe_(file, tsMs) - true si la fecha de última modificación del archivo es posterior a tsMs (PF292, punto 9). Si no se puede leer, devuelve false (se actúa como antes). [→ Contexto_Base_Web.md §PF292]
 */
function _archivoModificadoDespuesDe_(file, tsMs) {
  try {
    var f = file.getLastUpdated();
    return !!f && f.getTime() > tsMs;
  } catch (e) { return false; }
}

/**
 * _tamanoArchivoSeguro_(file) - Peso del archivo en bytes, o null si no se pudo medir (PF291). [→ Contexto_Base_Web.md §PF291]
 */
function _tamanoArchivoSeguro_(file) {
  try { return file.getSize(); } catch (e) { return null; }
}

/**
 * _asegurarEscrituraCompleta_(file, contenido, nombre) - Comprueba que el archivo no quedó vacío o recortado tras escribirlo (PF291).
 * Un texto de N caracteres ocupa al menos N bytes en UTF-8, así que un archivo que pesa menos que el largo del texto quedó mal escrito.
 * Si pasa, espera y vuelve a medir (Drive puede tardar en reflejar el tamaño); si sigue corto, reescribe hasta ESCRITURA_VERIF_REINTENTOS
 * veces dejando [ALERTA PROTECCIÓN] en el log; si no se arregla, lanza un error en vez de dejar el archivo roto sin avisar. Si no se puede
 * medir el archivo, no hace nada. Un texto vacío no se verifica. [→ Contexto_Base_Web.md §PF291]
 */
function _asegurarEscrituraCompleta_(file, contenido, nombre) {
  if (contenido === null || contenido === undefined) return;
  var largo = String(contenido).length;
  if (largo === 0) return;
  var tam = _tamanoArchivoSeguro_(file);
  if (tam === null || tam >= largo) return;
  for (var i = 1; i <= ESCRITURA_VERIF_REINTENTOS; i++) {
    Logger.log('[ALERTA PROTECCIÓN] ' + nombre + ': se escribieron ' + largo + ' caracteres y el archivo pesa ' + tam + ' bytes. Se espera ' +
      ESCRITURA_VERIF_ESPERA_MS + ' ms y se vuelve a medir (intento ' + i + ' de ' + ESCRITURA_VERIF_REINTENTOS + ').');
    Utilities.sleep(ESCRITURA_VERIF_ESPERA_MS);
    tam = _tamanoArchivoSeguro_(file);
    if (tam === null || tam >= largo) {
      Logger.log('[ALERTA PROTECCIÓN] ' + nombre + ': al volver a medir el archivo pesa ' + tam + ' bytes; la escritura estaba completa.');
      return;
    }
    file.setContent(contenido);
    tam = _tamanoArchivoSeguro_(file);
    if (tam === null || tam >= largo) {
      Logger.log('[ALERTA PROTECCIÓN] ' + nombre + ': reescrito; ahora pesa ' + tam + ' bytes.');
      return;
    }
  }
  throw new Error('[ALERTA PROTECCIÓN] ' + nombre + ' quedó con ' + tam + ' bytes tras escribir ' + largo + ' caracteres y ' +
    ESCRITURA_VERIF_REINTENTOS + ' reintentos. Revisar el archivo en Drive («Administrar versiones»).');
}

/**
 * _reverificarCsvEscritos_(esperaMinMs) - Segunda revisión de los CSV que _saveCSVToDrive() escribió en ESTA ejecución (PF291). Si desde la
 * escritura pasaron menos de esperaMinMs, espera lo que falta (Drive puede dejar una revisión vacía segundos después). Si el archivo de Drive
 * pesa menos que el texto escrito (por ejemplo, una revisión vacía que Drive creó después), lo reescribe con ese texto, que sigue en memoria.
 * Cada archivo se revisa una vez y sale del registro. Nunca lanza error. La llaman la cola horaria de guerra (_runGuerraColaHoraria_,
 * 00_Main.gs) y, vía _revisarCsvAlSalir_(), la ventana ligera de guerra y _ejecutarPorTandas(). [→ Contexto_Base_Web.md §PF291]
 */
function _reverificarCsvEscritos_(esperaMinMs) {
  var nombres = Object.keys(_csvEscritosEnEjecucion_);
  for (var i = 0; i < nombres.length; i++) {
    var nombre = nombres[i];
    try {
      var texto = _csvEscritosEnEjecucion_[nombre];
      var ts = _csvEscritosTs_[nombre] || 0;
      delete _csvEscritosEnEjecucion_[nombre];
      delete _csvEscritosTs_[nombre];
      if (!texto) continue;
      var falta = (esperaMinMs || 0) - (Date.now() - ts);
      if (falta > 0) Utilities.sleep(falta);
      var hit = _csvBuscarArchivo_(nombre);
      if (!hit) {
        Logger.log('[ALERTA PROTECCIÓN] ' + nombre + ': no se encuentra en Drive al volver a revisarlo tras escribirlo.');
        continue;
      }
      var tam = _tamanoArchivoSeguro_(hit.file);
      if (tam === null || tam >= texto.length) {
        Logger.log('[CSV] Revisión posterior: ' + nombre + ' pesa ' + tam + ' bytes (se escribieron ' + texto.length + ' caracteres). Sin cambios.');
        continue;
      }
      // PF292 punto 9 (29-oct-2026): si el archivo NO está vacío y otra ejecución lo modificó después de nuestra escritura, el tamaño menor puede ser
      // una versión más nueva y legítima: no se pisa con el texto viejo. Un archivo vacío (0 B) se repara siempre; si no se puede leer la fecha, se
      // actúa como antes. [→ Contexto_Base_Web.md §PF292]
      if (tam > 0 && _archivoModificadoDespuesDe_(hit.file, ts + ESCRITURA_VERIF_TOLERANCIA_MS)) {
        Logger.log('[ALERTA PROTECCIÓN] ' + nombre + ' pesa ' + tam + ' bytes (se escribieron ' + texto.length + ' caracteres) pero fue modificado después de nuestra escritura: se deja como está para no pisar una versión más nueva.');
        continue;
      }
      Logger.log('[ALERTA PROTECCIÓN] ' + nombre + ' pesa ' + tam + ' bytes y se había escrito con ' + texto.length + ' caracteres: se reescribe con el texto de esta ejecución.');
      hit.file.setContent(texto);
      _asegurarEscrituraCompleta_(hit.file, texto, nombre);
      _csvCacheBorrar_(nombre);
    } catch (e) {
      Logger.log('[ALERTA PROTECCIÓN] Revisión posterior de ' + nombre + ' falló: ' + e.message);
    }
  }
}

/**
 * _revisarCsvAlSalir_(inicioMs) - Revisión posterior para las ejecuciones que no son la cola horaria (PF291): si esta ejecución escribió algún CSV con
 * _saveCSVToDrive() y quedan más de 60 s antes del límite de la plataforma (inicioMs = hora de inicio de la ejecución), espera lo que falte hasta
 * ESCRITURA_VERIF_ESPERA_FINAL_MS desde la escritura y la revisa. Sin escrituras no hace nada ni gasta tiempo. [→ Contexto_Base_Web.md §PF291]
 */
function _revisarCsvAlSalir_(inicioMs) {
  if (Object.keys(_csvEscritosEnEjecucion_).length === 0) return;
  if (CFG.PLATAFORMA_LIMITE_EJECUCION_MS - (Date.now() - inicioMs) <= 60000) {
    Logger.log('[CSV] Revisión posterior de los CSV escritos SALTADA: quedan menos de 60 s de presupuesto.');
    return;
  }
  _reverificarCsvEscritos_(ESCRITURA_VERIF_ESPERA_FINAL_MS);
}

/**
 * syncAcumulativosCSV() [→ Contexto_Base_Web.md §05B110]
 */
/**
 * _syncUnaAcumulativaCSV(item, forzar) [→ Contexto_Base_Web.md §05B111]
 */
function _syncUnaAcumulativaCSV(item, forzar) {
  var ss = _getSs();
  var sh = ss.getSheetByName(item.sheetName);
  if (!sh) return;
  // PF286: Historial_A/D pasó a 24 columnas; si la hoja aún tiene 23, se agrega la columna antes de leer numCols columnas (si no, getRange falla y el respaldo no se guarda).
  if (item.sheetName === CFG.SHEETS.ASCENSOS) _asegurarColumnaParCRAscensos_(sh);

  var sheetRows = sh.getLastRow();

  var csvExistente = _loadCSVFromDrive(item.fileName);
  var csvRows = 0;
  if (csvExistente) {
    var parsed = _parseCSV(csvExistente);
    csvRows = parsed.length;
  }

  // Blindaje: solo pisa el CSV si la hoja tiene igual o más filas que el CSV [→ Contexto_Base_Web.md §05B112]
  var permitirEscritura = false;
  if (forzar) {
    permitirEscritura = sheetRows >= 2;
    if (permitirEscritura && sheetRows < csvRows) {
      Logger.log('[Backup] ' + item.fileName + ': la hoja tiene menos filas que el CSV ' +
                 '(' + sheetRows + ' vs ' + csvRows + '), pero se fuerza la sincronización ' +
                 '(reducción intencional ya verificada) — se guarda igual.');
    }
  } else if (item.permitirReduccion) {
    permitirEscritura = sheetRows >= 2;
    if (permitirEscritura && sheetRows < csvRows) {
      Logger.log('[Backup] ' + item.fileName + ': la hoja tiene menos filas que el CSV ' +
                 '(' + sheetRows + ' vs ' + csvRows + '), pero esta hoja permite reducciones ' +
                 '(edición manual) — se guarda igual.');
    }
  } else if (sheetRows >= csvRows && sheetRows >= 2) {
    permitirEscritura = true;
  }

  // PROTECCIÓN DE FECHAS (28-sep-2026, extendida a todas las hojas con Fecha): [→ Contexto_Base_Web.md §05B113]
  var protegerFechasItem = !!(item.hasFecha && item.protegerFechas !== false);
  if (permitirEscritura && protegerFechasItem && csvExistente && sheetRows >= 2) {
    try {
      var fechaIdxProt = (item.fechaCol || 2) - 1;
      var filasHojaProt = sheetRows - 1;
      var valoresFechaHoja = sh.getRange(2, fechaIdxProt + 1, filasHojaProt, 1).getValues()
        .map(function(r) { return r[0]; });
      var conFechaHoja = filasHojaProt - _contarFilasSinFechaRespaldable(valoresFechaHoja);

      var parsedProt = _parseCSV(csvExistente);
      // Columna de Fecha en el CSV: se busca por el TEXTO del encabezado de la [→ Contexto_Base_Web.md §05B114]
      var idxCsvFecha = fechaIdxProt;
      if (parsedProt.length > 0) {
        var encabezadoHoja = String(sh.getRange(1, fechaIdxProt + 1).getValue() || '').trim();
        if (encabezadoHoja) {
          for (var hc = 0; hc < parsedProt[0].length; hc++) {
            if (String(parsedProt[0][hc]).trim() === encabezadoHoja) { idxCsvFecha = hc; break; }
          }
        }
      }
      var valoresFechaCsv = [];
      for (var rc = 1; rc < parsedProt.length; rc++) {
        var filaCsvProt = parsedProt[rc];
        var filaVacia = true;
        for (var cc = 0; cc < filaCsvProt.length; cc++) {
          if (String(filaCsvProt[cc] === null || filaCsvProt[cc] === undefined ? '' : filaCsvProt[cc]).trim() !== '') { filaVacia = false; break; }
        }
        if (filaVacia) continue; // línea en blanco al final del archivo: no es un registro
        valoresFechaCsv.push(filaCsvProt[idxCsvFecha]);
      }
      var filasCsvProt = valoresFechaCsv.length;
      var conFechaCsv  = filasCsvProt - _contarFilasSinFechaRespaldable(valoresFechaCsv);

      var filasQuitadas = Math.max(0, filasCsvProt - filasHojaProt);
      var fechasPerdidas = conFechaCsv - conFechaHoja - filasQuitadas;

      if (fechasPerdidas > 0) {
        permitirEscritura = false;
        Logger.log('[ALERTA PROTECCIÓN] SKIP sobreescritura de ' + item.fileName +
                   ': la hoja tiene ' + conFechaHoja + ' filas con Fecha (de ' + filasHojaProt + ') y el CSV ' +
                   conFechaCsv + ' (de ' + filasCsvProt + '); faltan al menos ' + fechasPerdidas +
                   ' Fecha(s) que no se explican por filas quitadas. Se conserva el CSV para no perder fechas. ' +
                   'Revisar la columna Fecha de ' + item.sheetName + ' (o restaurar desde el CSV).');
        return;
      }
    } catch (eProt) {
      // Ante un error inesperado de la comprobación NO se sobrescribe: es más
      // seguro conservar el CSV existente que arriesgarse a pisarlo.
      Logger.log('[ALERTA PROTECCIÓN] SKIP sobreescritura de ' + item.fileName +
                 ': no se pudo comprobar las fechas (' + eProt.message + ').');
      return;
    }
  }

  if (permitirEscritura) {
    var data = _extraerValoresConLinksReales(sh, sheetRows, item.numCols, item.fechaColConHoraForzada);
    _saveCSVToDrive(item.fileName, _encodeCSV(data));
    Logger.log('[Backup] ' + item.fileName + ' sincronizado (' + (sheetRows - 1) + ' registros).');
  } else {
    Logger.log('[ALERTA PROTECCIÓN] SKIP sobreescritura de ' + item.fileName +
               ' (Hoja tiene ' + sheetRows + ' filas, CSV tiene ' + csvRows + '). No se guardó.');
  }
}

/**
 * _contarFilasSinFechaRespaldable(valores) [→ Contexto_Base_Web.md §05B115]
 */
function _contarFilasSinFechaRespaldable(valores) {
  var sinFecha = 0;
  for (var i = 0; i < valores.length; i++) {
    var v = valores[i];
    if (v instanceof Date) {
      if (isNaN(v.getTime())) sinFecha++;
      continue;
    }
    if (typeof v === 'number') {
      if (!isFinite(v)) sinFecha++;
      continue;
    }
    var t = String(v === null || v === undefined ? '' : v).trim();
    if (!t) { sinFecha++; continue; }
    var d = _parseSpanishDate(t);
    if (!(d instanceof Date) || isNaN(d.getTime())) sinFecha++;
  }
  return sinFecha;
}
// LOG DE TAMPERMONKEY EN DRIVE (13-ago-2026, pedido del usuario) [→ Contexto_Base_Web.md §05B116]
var TAMPERMONKEY_LOG_MAX_LINEAS = 500;
/**
 * _logTampermonkeyADrive(boton, resultado, errorTexto) [→ Contexto_Base_Web.md §05B117]
 */
function _logTampermonkeyADrive(boton, resultado, errorTexto) {
  try {
    var nombreArchivo = 'Log_Tampermonkey_' + boton + '.csv';
    var encabezado = 'Fecha,Estado,Resultado,Error';
    var hitLog = _csvBuscarArchivo_(nombreArchivo); // vive en la subcarpeta Tampermonkey [→ Contexto_Base_Web.md §01B158]
    var file = hitLog ? hitLog.file : null;

    var lineas;
    if (file) {
      var contenidoActual = file.getBlob().getDataAsString('UTF-8');
      lineas = contenidoActual
        ? contenidoActual.split('\n').filter(function (l) { return l !== ''; })
        : [encabezado];
      if (!lineas.length) lineas = [encabezado];
    } else {
      lineas = [encabezado];
    }

    var ahora = Utilities.formatDate(new Date(), 'America/Lima', 'yyyy-MM-dd HH:mm:ss');
    var ok = !errorTexto;
    var lineaNueva = [
      ahora,
      ok ? 'OK' : 'ERROR',
      _csvEscapeCampo(ok ? JSON.stringify(resultado || {}) : ''),
      _csvEscapeCampo(errorTexto || '')
    ].join(',');
    lineas.push(lineaNueva);

    // Recorta a encabezado + últimas TAMPERMONKEY_LOG_MAX_LINEAS filas de
    // datos, para que el archivo no crezca sin límite con el tiempo.
    if (lineas.length - 1 > TAMPERMONKEY_LOG_MAX_LINEAS) {
      lineas = [lineas[0]].concat(lineas.slice(lineas.length - TAMPERMONKEY_LOG_MAX_LINEAS));
    }
    var contenidoFinal = lineas.join('\n') + '\n';

    if (file) {
      _setContentConConteo_(file, contenidoFinal);
    } else {
      _createFileConConteo_(_getCsvSubcarpeta_(_csvSubcarpetaDe_(nombreArchivo), true), nombreArchivo, contenidoFinal, MimeType.CSV);
    }
  } catch (eLog) {
    // Nunca debe romper el flujo del botón -- solo se registra en el log
    // normal de Apps Script como último recurso.
    Logger.log('[TampermonkeyLog] No se pudo escribir "' + boton + '" en Drive: ' + eLog.message);
  }
}

/**
 * _csvEscapeCampo(valor) [→ Contexto_Base_Web.md §05B118]
 */
function _csvEscapeCampo(valor) {
  var s = String(valor === null || valor === undefined ? '' : valor);
  if (s.indexOf(',') >= 0 || s.indexOf('"') >= 0 || s.indexOf('\n') >= 0) {
    s = '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}