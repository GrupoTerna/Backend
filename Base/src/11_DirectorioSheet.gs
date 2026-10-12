// ==============================================================================
// 11_DirectorioSheet.gs
// Nucleo de la hoja Directorio: lectura/escritura de miembros, administradores,
// dropdowns y vistas derivadas:
// Inactivos, Vetados, Multicuentas, Historial.
// ==============================================================================

// ----- Variables y constantes -----

// CONCEPTO CLAVE - CAMPO JUGADOR (columna 4 en Directorio y en Inactivos — [→ Contexto_Base_Web.md §11B001]

var DC = {
  NUM:1, TAG:2, NOMBRE:3, JUGADOR:4, NOM_MULTI:5,
  PRESTAMO:6,
  MULTICUENTA:7,
  PERMISO:8, ANTIGUEDAD:9, NIVEL:10, NIVEL2:11, COPAS:12, COPAS_MAX:13,
  ARENA:14, V_GUERRA:15, VICTORIAS:16, DERROTAS:17, BATALLAS:18, RACHA:19,
  CL_LIGA:20, CL_TROFEOS:21, CL_RANGO:22,
  VICTORIAS_3C:23, MAX_VIC_DESAFIOS:24, TORNEOS:25, EMOTES:26, BANNERS:27,
  CARTAS_DESAFIOS:28, CARTAS_TORNEOS:29,
  DON_R:30, DON_D:31,
  RANKING:32, RANKING_P:33, RANGO:34, CLAN:35, CLAN_TAG:36, LIDER:37,
  INICIALES:38, PREFIJO:39, CELULAR:40, WSP_G:41, ETIQUETA:42,
  WSP:43, ROYALE_API:44, DECK:45, DECK_2:46, CW_STATS:47, RENDER:48,
  FECHA_ING:49, FECHA_LIM:50, VIGENCIA:51, INACTIVIDAD:52,
  ALERTA:53, ESTADO:54, COMENTARIO:55, VETADO:56, RAZON:57,
  ADMIN:58, CAT_DISP:59,
  CLANES_ADMIN:60
};

var DIR_TOTAL_COLS = 60;

// DIR_SHEET_COLS (13/07/2026, Fase 4): ancho REAL de la hoja Directorio en [→ Contexto_Base_Web.md §11B002]
var DIR_SHEET_COLS = 29;

// Índices de columna (1-based) de la hoja "Administradores" — ver [→ Contexto_Base_Web.md §11B003]
var AC = {
  NUM:1, TAG:2, NOMBRE:3, NOM_MULTI:4, PRESTAMO:5, CLAN:6, CLAN_TAG:7, RANGO:8, LIDER:9,
  PREFIJO:10, CELULAR:11, WSP_G:12, ESTADO:13, ADMIN:14, VETADO:15, RAZON:16,
  VIGENCIA:17, INACTIVIDAD:18, ALERTA:19, CAT_DISP:20, FUNCIONES:21, CLANES_ADMIN:22, CLAVE:23,
  CLAVE_HASH:24
};

var ADMINISTRADORES_TOTAL_COLS = 24;

// Índices de columna (1-based) de la hoja "Vetados" — ver _setupVetados() en [→ Contexto_Base_Web.md §11B004]
var VC = {
  NUM:1, TAG:2, NOMBRE:3, NOM_MULTI:4, CLAN:5, RANGO:6, INICIALES:7, PERMISO:8,
  ESTADO:9, RAZON:10, AUTOR:11, VIA:12, FECHA:13
};

var VETADOS_TOTAL_COLS = 13;

// Columnas que SÍ se recalculan automáticamente desde Directorio/Inactivos [→ Contexto_Base_Web.md §11B005]
var VETADOS_COLS_AUTOSYNC = VC.RAZON; // hasta esta columna inclusive (1..10)

// Índices de columna (1-based) de la hoja "Comentarios" — ver [→ Contexto_Base_Web.md §11B006]
var CMC = {
  NUM:1, FECHA:2, TAG:3, NOMBRE:4, NOM_MULTI:5, CLAN_TAG:6, CLAN:7, RANGO:8,
  LIDER:9, COMENTARIO:10
};

var COMENTARIOS_TOTAL_COLS = 10;

// ----- Funciones manuales / punto de entrada -----

function updateDirectorioSheet() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!sh) { Logger.log('[Dir] Hoja no encontrada'); return; }

  Logger.log('[Dir] Iniciando updateDirectorioSheet...');

  for (var i = 0; i < CFG.TERNA_TAGS.length; i++) {
    if (!_getClanCache(CFG.TERNA_TAGS[i])) {
      Logger.log('[Dir] CRÍTICO: Falló la API para ' + CFG.TERNA_TAGS[i] + '. Se aborta la actualización.');
      return;
    }
  }

  // El bootstrap de reanudación (_ejecutarPorTandas en 00_Main.gs) solo [→ Contexto_Base_Web.md §11B007]
  _fetchPlayersData();

  var csvMap = _getCsvDirMap();
  var existingRows = _leerDirectorioExistente(sh);

  // FASE B4 (16/07/2026): Nivel/Nivel2/V_Guerra/Copas y los 17 campos que [→ Contexto_Base_Web.md §11B008]
  var playersPorTag = _leerHojaComoMapaPorTag(ss, CFG.SHEETS.PLAYERS, PC.TAG - 1, PLAYERS_TOTAL_COLS);
  var linksPorTag    = _leerHojaComoMapaPorTag(ss, CFG.SHEETS.LINKS,   LC.TAG - 1, LINKS_TOTAL_COLS);

  // Mapa completo de índices 0-based para todas las columnas leídas desde [→ Contexto_Base_Web.md §11B009]
  var H = existingRows._headerIdx || {};
  var colIdxMap = {
    celular:    H['Celular']        !== undefined ? H['Celular']        : (IC.CELULAR    - 1),
    nombre:     H['Nombre']         !== undefined ? H['Nombre']         : (IC.NOMBRE     - 1),
    nomMulti:   H['Nom_Multi']      !== undefined ? H['Nom_Multi']      : (IC.NOM_MULTI  - 1),
    prefijo:    H['Prefijo']        !== undefined ? H['Prefijo']        : (IC.PREFIJO    - 1),
    fechaIng:   H['Fecha_ing']      !== undefined ? H['Fecha_ing']      : (IC.FECHA_ING  - 1),
    vetado:     H['Vetado']         !== undefined ? H['Vetado']         : (IC.VETADO     - 1),
    razon:      H['Razón']          !== undefined ? H['Razón']          :
               (H['Razon']          !== undefined ? H['Razon']          : (IC.RAZON      - 1)),
    permiso:    H['Permiso']        !== undefined ? H['Permiso']        : (IC.PERMISO    - 1),
    wspG:       H['WSP(G)']         !== undefined ? H['WSP(G)']         :
               (H['WSP_G']          !== undefined ? H['WSP_G']          : (IC.WSP_G      - 1)),
    etiqueta:   H['Etiqueta']       !== undefined ? H['Etiqueta']       : (IC.ETIQUETA   - 1),
    estado:     H['Estado']         !== undefined ? H['Estado']         : (IC.ESTADO     - 1),
    admin:      H['Admin']          !== undefined ? H['Admin']          : (IC.ADMIN      - 1),
    // Cat_disp: Directorio nunca tuvo esta columna físicamente (no está en [→ Contexto_Base_Web.md §11B010]
    catDisp:    H['Cat_disp']       !== undefined ? H['Cat_disp']       : -1,
    prestamo:   H['Préstamo']       !== undefined ? H['Préstamo']       : (IC.PRESTAMO   - 1),
  };

  var activosPorTag = {};
  var tagAClanTag   = {};

  for (var i = 0; i < CFG.CLAN_TAGS.length; i++) {
    var clanTag  = CFG.CLAN_TAGS[i];
    var clanData = _getClanCache(clanTag);
    if (!clanData) continue;

    var members = clanData.members || [];
    for (var j = 0; j < members.length; j++) {
      var m = members[j];
      activosPorTag[m.tag] = { member: m, clanTag: clanTag, clanInfo: clanData.info };
      tagAClanTag[m.tag] = clanTag;
    }
  }

  // Snapshot de Inactivos (29 columnas propias, incluye Comentario, + 31 [→ Contexto_Base_Web.md §11B011]
  var inactivosPorTag = _leerInactivosParaReactivacion(ss);

  var multiData = _detectarMulticuentas(existingRows, csvMap, activosPorTag, colIdxMap, inactivosPorTag);
  var resultadoDirectorio = _construirFilasDirectorio(activosPorTag, existingRows, csvMap, multiData, ss, colIdxMap, inactivosPorTag, playersPorTag, linksPorTag);
  var todasFilas = resultadoDirectorio.filas;
  _escribirDirectorio(sh, todasFilas);
  // FASE B3 (16/07/2026): poblar Players y Links con el mismo modelo de 60 [→ Contexto_Base_Web.md §11B012]
  _escribirPlayers(ss, todasFilas);
  _escribirLinks(ss, todasFilas);
  _aplicarDropdownsDirectorio(sh, todasFilas.length);
  _aplicarFormatoCondicionalDirectorio(sh, todasFilas.length);
  if (todasFilas.length > 0) {
    applyBorderCenter(sh.getRange(2, 1, todasFilas.length, DIR_SHEET_COLS));
  }
  // FIX (04-ago-2026): "hay filas vacías que están conservando la validación [→ Contexto_Base_Web.md §11B013]
  _limpiarValidacionesFilasVaciasDirectorio(sh, todasFilas.length);

  // FIX (17-ago-2026, pedido usuario): recrear el filtro nativo (embudo) de [→ Contexto_Base_Web.md §11B014]
  _crearTabla(sh, 1, todasFilas.length + 1, DIR_SHEET_COLS, CFG.SHEETS.DIRECTORIO);

  // Poblar Inactivos con TODOS los inactivos (admin y no-admin), fila completa [→ Contexto_Base_Web.md §11B015]
  _updateInactivos(ss, resultadoDirectorio.inactivasCompletas);

  // Reactivación: retirar de Inactivos (hoja + ClanSystem_Backup_ [→ Contexto_Base_Web.md §11B016]
  if (resultadoDirectorio.tagsReactivados.length > 0) {
    _retirarDeInactivosPorReactivacion(ss, resultadoDirectorio.tagsReactivados);
  }

  Logger.log('[Dir] updateDirectorioSheet completado. Filas escritas: ' + todasFilas.length);
  // NOTA: updateVistasDerivadas() ya NO se llama aquí. Se llama como su [→ Contexto_Base_Web.md §11B017]
}

function updateVistasDerivadas() {
  Logger.log('[Vistas] Actualizando vistas...');
  var ss = _getSs();
  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!shDir || shDir.getLastRow() < 2) return;
  // FASE B1 (14/07/2026): antes, esta lectura pedía DIR_TOTAL_COLS (60 [→ Contexto_Base_Web.md §11B018]
  var dirData = _leerDirectorioFisicoComoDC(ss);
  _updateInactivos(ss, dirData);
  _updateVetados(ss, dirData);
  _updateMulticuentas(ss, dirData);
  _updateHistorial(ss, dirData);
  // IMPORTANTE: debe ir DESPUÉS de _updateHistorial (por consistencia de [→ Contexto_Base_Web.md §11B019]
  updateAscensosSheet(ss, dirData);
}

/**
 * sincronizarAdministradores() [→ Contexto_Base_Web.md §11B020]
 */
/**
 * sincronizarAdministradores() [→ Contexto_Base_Web.md §11B021]
 */

/**
 * _generarClaveAdmin() [→ Contexto_Base_Web.md §11B022]
 */
function _generarClaveAdmin() {
  var ALFABETO_CLAVE_ADMIN = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  var clave = '';
  for (var c = 0; c < 8; c++) {
    clave += ALFABETO_CLAVE_ADMIN.charAt(Math.floor(Math.random() * ALFABETO_CLAVE_ADMIN.length));
  }
  return clave;
}

function sincronizarAdministradores() {
  var ss = _getSs();
  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  var shAdm = ss.getSheetByName(CFG.SHEETS.ADMINISTRADORES);
  if (!shDir || !shAdm) {
    Logger.log('[Administradores] Hoja no encontrada (Directorio o Administradores).');
    return;
  }

  // FIX (16/07/2026): antes se leía la hoja física Directorio en crudo [→ Contexto_Base_Web.md §11B023]
  var dirData = _leerDirectorioFisicoComoDC(ss);
  if (dirData.length < 1) return;

  // Cat_disp (12/07/2026): columna de edición MANUAL que ahora vive SOLO en [→ Contexto_Base_Web.md §11B024]
  var catDispPrevioPorTag = {};
  var funcionesPrevioPorTag = {};
  // FASE 4 — WEB (arquitectura-web-familia-terna.md, Sección 7.3.2, v9): [→ Contexto_Base_Web.md §11B025]
  var clanesAdminPrevioPorTag = {};
  // Clave: nombre canónico interno → valor: primera Clave no vacía [→ Contexto_Base_Web.md §11B026]
  var clavePrevioPorCelular = {};
  // NUEVO (15-sep-2026, pedido del usuario, hallazgo B-31): mismo criterio [→ Contexto_Base_Web.md §11B027]
  var claveHashPrevioPorCelular = {};
  var lastRowAdmPrevio = shAdm.getLastRow();
  if (lastRowAdmPrevio >= 2) {
    var admDataPrevia = shAdm.getRange(2, 1, lastRowAdmPrevio - 1, ADMINISTRADORES_TOTAL_COLS).getValues();
    for (var p = 0; p < admDataPrevia.length; p++) {
      var tagPrevio = String(admDataPrevia[p][AC.TAG - 1] || '').trim().toUpperCase();
      if (!tagPrevio) continue;
      catDispPrevioPorTag[tagPrevio]     = String(admDataPrevia[p][AC.CAT_DISP - 1] || '');
      funcionesPrevioPorTag[tagPrevio]   = String(admDataPrevia[p][AC.FUNCIONES - 1] || '');
      clanesAdminPrevioPorTag[tagPrevio] = String(admDataPrevia[p][AC.CLANES_ADMIN - 1] || '');

      var celularPrevioNorm = soloDigitos(admDataPrevia[p][AC.CELULAR - 1]);
      var clavePrevia = String(admDataPrevia[p][AC.CLAVE - 1] || '').trim();
      if (celularPrevioNorm && clavePrevia && !clavePrevioPorCelular[celularPrevioNorm]) {
        clavePrevioPorCelular[celularPrevioNorm] = clavePrevia;
      }
      // NUEVO (15-sep-2026): mismo criterio que clavePrevia, columna [→ Contexto_Base_Web.md §11B028]
      var claveHashPrevia = String(admDataPrevia[p][AC.CLAVE_HASH - 1] || '').trim();
      if (celularPrevioNorm && claveHashPrevia && !claveHashPrevioPorCelular[celularPrevioNorm]) {
        claveHashPrevioPorCelular[celularPrevioNorm] = claveHashPrevia;
      }
    }
  }

  // FIX (30-ago-2026, reportado por el usuario: "si demuelo y ejecuto [→ Contexto_Base_Web.md §11B029]
  try {
    var csvAdminPrevio = _loadCSVFromDrive('Backup_Administradores.csv');
    if (csvAdminPrevio) {
      var parsedAdminPrevio = _parseCSV(csvAdminPrevio);
      if (parsedAdminPrevio && parsedAdminPrevio.length > 1) {
        for (var pc = 1; pc < parsedAdminPrevio.length; pc++) {
          var celularCsvNorm = soloDigitos(parsedAdminPrevio[pc][AC.CELULAR - 1]);
          // NUEVO (15-sep-2026): mismo respaldo para Clave_Hash, mismo [→ Contexto_Base_Web.md §11B030]
          var claveHashCsv = String(parsedAdminPrevio[pc][AC.CLAVE_HASH - 1] || '').trim();
          if (celularCsvNorm && claveHashCsv && !claveHashPrevioPorCelular[celularCsvNorm]) {
            claveHashPrevioPorCelular[celularCsvNorm] = claveHashCsv;
          }
        }
      }
    }
  } catch (eCsvAdmin) {
    Logger.log('[Administradores] No se pudo leer Backup_Administradores.csv para recuperar Claves previas: ' + eCsvAdmin.message);
  }

  // Paso 1: Encontrar celulares de los admin
  var celularesAdmin = {};
  for (var i = 0; i < dirData.length; i++) {
    var esAdmin = String(dirData[i][DC.ADMIN - 1] || '').trim();
    if (esAdmin === 'Sí') {
      var cel = String(dirData[i][DC.CELULAR - 1] || '').trim();
      if (cel) celularesAdmin[cel] = true;
    }
  }

  // Paso 2: Recopilar TODAS las filas (ya reconstruidas a formato DC de 60 [→ Contexto_Base_Web.md §11B031]
  var candidatos = [];
  for (var j = 0; j < dirData.length; j++) {
    var cel2 = String(dirData[j][DC.CELULAR - 1] || '').trim();
    if (cel2 && celularesAdmin[cel2]) {
      candidatos.push({
        dir: dirData[j],
        celular: cel2,
        nomMulti: String(dirData[j][DC.NOM_MULTI - 1] || '').trim(),
        copas: Number(dirData[j][DC.COPAS - 1]) || 0
      });
    }
  }

  // FIX (06-ago-2026): Nom_Multi/Celular a veces solo se cargó en UNA de [→ Contexto_Base_Web.md §11B032]
  var nomMultiPorCelular = {};
  for (var jn = 0; jn < candidatos.length; jn++) {
    var celN = candidatos[jn].celular;
    var nmN  = candidatos[jn].nomMulti;
    if (celN && nmN && !nomMultiPorCelular[celN]) nomMultiPorCelular[celN] = nmN;
  }

  // Orden real de los clanes según la hoja Clan (no alfabético) — mismo
  // helper que usa el resto del proyecto para Cat_disp/Plantillas.
  var ordenClanAdmin = _getOrdenClanHoja(ss);

  for (var jk = 0; jk < candidatos.length; jk++) {
    var c = candidatos[jk];
    // Clave de agrupación: Nom_Multi (propio o heredado del grupo por [→ Contexto_Base_Web.md §11B033]
    c.grupoOrden = (nomMultiPorCelular[c.celular] || c.nomMulti || c.celular || '').toLowerCase();
    var nombreClanC = String(c.dir[DC.CLAN - 1] || '').trim().toLowerCase();
    c.ordenClan = (ordenClanAdmin[nombreClanC] !== undefined) ? ordenClanAdmin[nombreClanC] : 999;
  }

  // Paso 3: Ordenar por Nom_Multi/Celular agrupado (asc) -> Clan (orden de
  // la hoja Clan, no alfabético) -> Copas (desc).
  candidatos.sort(function(a, b) {
    if (a.grupoOrden !== b.grupoOrden) return a.grupoOrden < b.grupoOrden ? -1 : 1;
    if (a.ordenClan !== b.ordenClan) return a.ordenClan - b.ordenClan;
    return b.copas - a.copas;
  });

  // Paso 4: armar cada fila de Administradores (21 cols) campo por campo.
  var filasAdmin = [];
  for (var k = 0; k < candidatos.length; k++) {
    var d = candidatos[k].dir;
    var tagK = String(d[DC.TAG - 1] || '').trim().toUpperCase();
    var esAdminK = String(d[DC.ADMIN - 1] || '').trim() === 'Sí';

    var fila = new Array(ADMINISTRADORES_TOTAL_COLS).fill('');
    fila[AC.NUM - 1]          = k + 1;
    fila[AC.TAG - 1]          = d[DC.TAG - 1];
    fila[AC.NOMBRE - 1]       = d[DC.NOMBRE - 1];
    fila[AC.NOM_MULTI - 1]    = d[DC.NOM_MULTI - 1];
    fila[AC.PRESTAMO - 1]     = d[DC.PRESTAMO - 1];
    fila[AC.CLAN - 1]         = d[DC.CLAN - 1];
    fila[AC.CLAN_TAG - 1]     = d[DC.CLAN_TAG - 1];
    fila[AC.RANGO - 1]        = d[DC.RANGO - 1];
    fila[AC.LIDER - 1]        = d[DC.LIDER - 1];
    fila[AC.PREFIJO - 1]      = d[DC.PREFIJO - 1];
    fila[AC.CELULAR - 1]      = d[DC.CELULAR - 1];
    fila[AC.WSP_G - 1]        = d[DC.WSP_G - 1];
    fila[AC.VIGENCIA - 1]     = d[DC.VIGENCIA - 1];
    fila[AC.INACTIVIDAD - 1]  = d[DC.INACTIVIDAD - 1];
    fila[AC.ALERTA - 1]       = d[DC.ALERTA - 1];
    fila[AC.ESTADO - 1]       = d[DC.ESTADO - 1];
    fila[AC.VETADO - 1]       = d[DC.VETADO - 1];
    fila[AC.RAZON - 1]        = d[DC.RAZON - 1];
    fila[AC.ADMIN - 1]        = d[DC.ADMIN - 1];
    fila[AC.CAT_DISP - 1]     = catDispPrevioPorTag[tagK] || '';
    // FASE 4 (25-ago-2026): Funciones es de edición MANUAL exclusiva [→ Contexto_Base_Web.md §11B034]
    fila[AC.FUNCIONES - 1]    = funcionesPrevioPorTag[tagK] || '';
    // FASE 4 — WEB (Sección 7.3.2, v9): Clanes_Admin ya NO se recalcula [→ Contexto_Base_Web.md §11B035]
    fila[AC.CLANES_ADMIN - 1] = esAdminK
      ? (clanesAdminPrevioPorTag[tagK] || _getClanesAdminTexto(d[DC.PREFIJO - 1], d[DC.CELULAR - 1]))
      : '';

    // FASE 5 (26-ago-2026, pedido explícito del usuario): Clave se [→ Contexto_Base_Web.md §11B036]
    var celularNormK = soloDigitos(d[DC.CELULAR - 1]);
    var claveK = celularNormK ? (clavePrevioPorCelular[celularNormK] || '') : '';
    if (!claveK && celularNormK) {
      claveK = _generarClaveAdmin();
      clavePrevioPorCelular[celularNormK] = claveK;
    }
    fila[AC.CLAVE - 1] = claveK;
    // NUEVO (15-sep-2026): Clave_Hash NUNCA se genera acá -- a propósito, [→ Contexto_Base_Web.md §11B037]
    fila[AC.CLAVE_HASH - 1] = celularNormK ? (claveHashPrevioPorCelular[celularNormK] || '') : '';
    filasAdmin.push(fila);
  }

  var lastRow = shAdm.getLastRow();
  // FIX (05-ago-2026): mismo criterio que _escribirDirectorio() — resetear [→ Contexto_Base_Web.md §11B038]
  if (lastRow >= 2) {
    shAdm.getRange(2, 1, lastRow - 1, ADMINISTRADORES_TOTAL_COLS)
      .clearContent()
      .setFontColor(null);
  }

  if (filasAdmin.length > 0) {
    shAdm.getRange(2, 1, filasAdmin.length, ADMINISTRADORES_TOTAL_COLS).setValues(filasAdmin);
    applyBorderCenter(shAdm.getRange(2, 1, filasAdmin.length, ADMINISTRADORES_TOTAL_COLS));

    // Mismos formatos que Directorio, solo para los campos que sobreviven en [→ Contexto_Base_Web.md §11B039]
    shAdm.getRange(2, AC.VIGENCIA,    filasAdmin.length, 1).setNumberFormat('dddd, d "de" mmmm"," yyyy h:mm:ss am/pm');
    shAdm.getRange(2, AC.CELULAR,     filasAdmin.length, 1).setNumberFormat('### ### ### ###');
    shAdm.getRange(2, AC.NUM,         filasAdmin.length, 1).setNumberFormat('#,##0');
    shAdm.getRange(2, AC.INACTIVIDAD, filasAdmin.length, 1).setNumberFormat('#,##0');
  }

  _aplicarFormatoCondicionalDirectorio(shAdm, filasAdmin.length, ADMINISTRADORES_TOTAL_COLS, AC.VETADO, AC.ESTADO, AC.RANGO);
  _aplicarDropdownsAdministradores(shAdm, filasAdmin.length);   // 👈 NUEVO

  // FIX (06-ago-2026): anchos fijos pedidos por el usuario para Clanes_Admin [→ Contexto_Base_Web.md §11B040]
  try {
    shAdm.setColumnWidth(AC.CLANES_ADMIN, 417);
    shAdm.setColumnWidth(AC.CAT_DISP, 1963);
  } catch (e) {
    Logger.log('[Administradores] Error fijando ancho de columnas Clanes_Admin/Cat_disp: ' + e.message);
  }

  Logger.log('[Administradores] Sincronizados ' + filasAdmin.length + ' registros (' + Object.keys(celularesAdmin).length + ' celulares admin).');

  // FASE 4 — WEB (arquitectura-web-familia-terna.md, Sección 7.5.1): el [→ Contexto_Base_Web.md §11B041]
  try {
    _aplicarDropdownAutorVetados(ss.getSheetByName(CFG.SHEETS.VETADOS), _obtenerNomMultisAdmins());
  } catch (eAutorVet) {
    Logger.log('[Administradores] Error actualizando dropdown de Autor en Vetados: ' + eAutorVet.message);
  }
}

/**
 * actualizarDropdownCatDisp() [→ Contexto_Base_Web.md §11B042]
 */
function actualizarDropdownCatDisp() {
  var ss = _getSs();
  var shAdm  = ss.getSheetByName(CFG.SHEETS.ADMINISTRADORES);
  // Cat_disp (12/07/2026): ya no existe en Directorio, solo en Administradores.
  if (!shAdm) return;

  // Leer categorías únicas del índice de contenido (_getIndiceContenido(),
  // 43_Menu_Dinamico.gs) en orden de aparición (que ya respeta Extra).
  var indice = _getIndiceContenido();
  if (!indice.length) return;
  var vistas = {};
  var categorias = [];
  for (var i = 0; i < indice.length; i++) {
    var cat = String(indice[i].categoria || '').trim();
    if (cat && !vistas[cat]) { vistas[cat] = true; categorias.push(cat); }
  }
  if (categorias.length > 0) {
    _aplicarCatDispMultiSelect(shAdm, categorias);
    Logger.log('[Administradores] Cat_disp autocompletado con ' + categorias.length + ' categorías.');
  }

  // FASE 4 — WEB (Sección 7.3.1): funciones disponibles del panel web hoy. [→ Contexto_Base_Web.md §11B043]
  _aplicarFuncionesMultiSelect(shAdm, ['Vetar', 'Registrar miembro nuevo', WEB_FUNCION_ACTUALIZAR_ROSTER]);
  Logger.log('[Administradores] Funciones autocompletado (donde estaba vacío) con las funciones disponibles.');
}

function moverComentarioFila(sh, row) {
  var comentario = sh.getRange(row, IC.COMENTARIO).getValue();
  if (!comentario || String(comentario).trim() === '') return;
  var rowData = sh.getRange(row, 1, 1, DIR_SHEET_COLS).getValues()[0];
  var shCom = _getSs().getSheetByName(CFG.SHEETS.COMENTARIOS);
  if (!shCom) return;
  var now = new Date();
  // NOTA (26-ago-2026): el encabezado de la columna 5 de Comentarios es [→ Contexto_Base_Web.md §11B044]
  var filaCMC = new Array(COMENTARIOS_TOTAL_COLS).fill('');
  filaCMC[CMC.NUM - 1]        = shCom.getLastRow();
  filaCMC[CMC.FECHA - 1]      = now;
  filaCMC[CMC.TAG - 1]        = rowData[IC.TAG-1];
  filaCMC[CMC.NOMBRE - 1]     = rowData[IC.NOMBRE-1];
  filaCMC[CMC.NOM_MULTI - 1]  = rowData[IC.NOM_MULTI-1];
  filaCMC[CMC.CLAN_TAG - 1]   = rowData[IC.CLAN_TAG-1];
  filaCMC[CMC.CLAN - 1]       = rowData[IC.CLAN-1];
  filaCMC[CMC.RANGO - 1]      = rowData[IC.RANGO-1];
  filaCMC[CMC.LIDER - 1]      = rowData[IC.LIDER-1];
  filaCMC[CMC.COMENTARIO - 1] = comentario;
  shCom.appendRow(filaCMC);
  _setDateCell(shCom, shCom.getLastRow(), CMC.FECHA, now, 'dddd, d "de" mmmm"," yyyy h:mm:ss am/pm');
  sh.getRange(row, IC.COMENTARIO).clearContent();
}

/**
 * limpiarLinksAccidentalesDeNombres() [→ Contexto_Base_Web.md §11B045]
 */
function limpiarLinksAccidentalesDeNombres() {
  var ss = _getSs();
  var hojas = ss.getSheets();

  var props    = PropertiesService.getScriptProperties();
  var claveIdx = 'LIMPIAR_LINKS_IDX';
  var idxInicio = parseInt(props.getProperty(claveIdx) || '0', 10);
  if (idxInicio >= hojas.length) idxInicio = 0; // por si cambió la lista de hojas entre corridas (Demoler, etc.)

  var inicio = Date.now();
  var totalCorregidas = 0;
  var i;

  for (i = idxInicio; i < hojas.length; i++) {
    var resumenHoja = _limpiarLinksAccidentalesEnHoja(hojas[i]);
    for (var k = 0; k < resumenHoja.length; k++) {
      totalCorregidas += resumenHoja[k].corregidas;
    }

    var quedanHojas = (i + 1) < hojas.length;
    if (quedanHojas && (Date.now() - inicio) > CFG.LIMPIAR_LINKS_BUDGET_MS) {
      props.setProperty(claveIdx, String(i + 1));
      Logger.log('[LinksNombres] Presupuesto interno agotado tras la hoja ' +
                 (i + 1) + '/' + hojas.length + ' ("' + hojas[i].getName() + '"). ' +
                 (totalCorregidas > 0 ? totalCorregidas + ' enlace(s) accidental(es) quitado(s) hasta ahora. ' : '') +
                 'Se reintenta el mismo paso en la próxima continuación.');
      return false;
    }
  }

  props.deleteProperty(claveIdx);
  Logger.log('[LinksNombres] Terminado. Total de enlaces accidentales quitados: ' + totalCorregidas + '.');
  return true;
}

// ----- Funciones internas / helpers -----

function _leerDirectorioExistente(sh) {
  var map = {};
  var lastRow = sh.getLastRow();
  if (lastRow < 1) return map;

  // Leer encabezados de la fila 1 para construir índices dinámicos
  var headerRow = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var headerIdx = {};
  for (var h = 0; h < headerRow.length; h++) {
    var hName = String(headerRow[h] || '').trim();
    if (hName) headerIdx[hName] = h; // índice 0-based dentro de la fila de datos
  }
  // Guardar el mapa de encabezados en el objeto devuelto para uso externo
  map._headerIdx = headerIdx;

  // Columna Tag: buscar por encabezado; si no existe, usar DC.TAG como respaldo
  var tagColIdx = (headerIdx['Tag'] !== undefined) ? headerIdx['Tag'] : (DC.TAG - 1);

  if (lastRow < 2) return map;

  // Leer filas de datos (fila 2 en adelante)
  var numCols = Math.max(sh.getLastColumn(), DIR_SHEET_COLS);
  var data = sh.getRange(2, 1, lastRow - 1, numCols).getValues();
  for (var i = 0; i < data.length; i++) {
    var tag = String(data[i][tagColIdx] || '').trim().toUpperCase();
    if (tag) map[tag] = data[i];
  }
  return map;
}

function _getCsvDirMap() {
  var map = {};

  try {
    var hitDir = _csvBuscarArchivo_('Backup_Directorio.csv'); // subcarpeta Hojas [→ Contexto_Base_Web.md §01B158]
    if (hitDir) {
      var csvText = hitDir.file.getBlob().getDataAsString("UTF-8");
      var parsed = Utilities.parseCsv(csvText);
      if (parsed.length > 1) {
        var headers = parsed[0];
        var colIdx = {};
        for (var c = 0; c < headers.length; c++) colIdx[headers[c].trim()] = c;

        // FIX (13-ago-2026, pedido del usuario: "está escribiendo valores [→ Contexto_Base_Web.md §11B046]
        var _esSiNoOVacio = function(v) {
          var s = String(v || '').trim().toLowerCase();
          return s === '' || s === 'sí' || s === 'si' || s === 'no';
        };

        for (var i = 1; i < parsed.length; i++) {
          var row = parsed[i];
          var tag = colIdx['Tag'] !== undefined ? row[colIdx['Tag']] : row[1];
          if (tag) {
            tag = String(tag).trim().toUpperCase();
            map[tag] = {
              nombre:     colIdx['Nombre']        !== undefined ? row[colIdx['Nombre']]        : '',
              jugador:    colIdx['Jugador']        !== undefined ? row[colIdx['Jugador']]       : '',
              nom_multi:  colIdx['Nom_Multi']      !== undefined ? row[colIdx['Nom_Multi']]     : '',
              permiso:    (function() {
                var v = colIdx['Permiso'] !== undefined ? row[colIdx['Permiso']] : '';
                return _esSiNoOVacio(v) ? v : '';
              })(),
              // Prefijo y Celular: siempre limpios (solo dígitos). El CSV puede [→ Contexto_Base_Web.md §11B047]
              prefijo:    colIdx['Prefijo']        !== undefined ? soloDigitos(row[colIdx['Prefijo']]) : '',
              celular:    colIdx['Celular']        !== undefined ? soloDigitos(row[colIdx['Celular']]) : '',
              // wsp_g y etiqueta: filtrar 'Link' (texto de RichText que puede haber [→ Contexto_Base_Web.md §11B048]
              wsp_g:      (function() {
                var v = colIdx['WSP_G'] !== undefined ? row[colIdx['WSP_G']] :
                        (colIdx['WSP(G)'] !== undefined ? row[colIdx['WSP(G)']] : '');
                return String(v || '').trim().toLowerCase() === 'link' ? '' : String(v || '');
              })(),
              etiqueta:   (function() {
                var v = colIdx['Etiqueta'] !== undefined ? row[colIdx['Etiqueta']] : '';
                return String(v || '').trim().toLowerCase() === 'link' ? '' : String(v || '');
              })(),
              vetado:     (function() {
                var v = colIdx['Vetado'] !== undefined ? row[colIdx['Vetado']] : '';
                return _esSiNoOVacio(v) ? v : '';
              })(),
              // Solo se acepta si es una razón reconocida; 'Sí'/'No' u otro
              // texto inválido (datos cruzados heredados) se descartan.
              razon:      (function() {
                var v = colIdx['Razón'] !== undefined ? row[colIdx['Razón']] :
                        (colIdx['Razon'] !== undefined ? row[colIdx['Razon']] : '');
                return esRazonValida(v) ? v : '';
              })(),
              fechaIng:   colIdx['Fecha_ing']      !== undefined ? row[colIdx['Fecha_ing']]     : '',
              // Vigencia y Fecha_lim: antes NO se leían acá — se perdían al [→ Contexto_Base_Web.md §11B049]
              vigencia:   colIdx['Vigencia']       !== undefined ? row[colIdx['Vigencia']]      : '',
              fechaLim:   colIdx['Fecha_lim']      !== undefined ? row[colIdx['Fecha_lim']]     : '',
              nivel:      colIdx['Nivel']          !== undefined ? row[colIdx['Nivel']]         : '',
              copas:      colIdx['Copas']          !== undefined ? row[colIdx['Copas']]         : '',
              // V_Guerra se importa siempre desde CSV como fuente de verdad cuando la API players no está activa
              v_guerra:   colIdx['V_Guerra']       !== undefined ? row[colIdx['V_Guerra']]      : '',
              nivel2:     colIdx['Nivel2']         !== undefined ? row[colIdx['Nivel2']]        : '',
              rango:      colIdx['Rango']          !== undefined ? row[colIdx['Rango']]         : '',
              clan:       colIdx['Clan']           !== undefined ? row[colIdx['Clan']]          : '',
              clan_tag:   colIdx['ClanTag']        !== undefined ? row[colIdx['ClanTag']]       : '',
              inactividad:colIdx['Inactividad(d)'] !== undefined ? row[colIdx['Inactividad(d)']] : '',
              // Admin y Cat_disp: columnas de edición manual. Antes NO se leían [→ Contexto_Base_Web.md §11B050]
              admin:      (function() {
                var v = colIdx['Admin'] !== undefined ? row[colIdx['Admin']] : '';
                return _esSiNoOVacio(v) ? v : '';
              })(),
              cat_disp:   colIdx['Cat_disp']        !== undefined ? row[colIdx['Cat_disp']]      : '',
              // Préstamo: columna de edición manual — solo se lee del CSV para preservarla
              // al reconstruir la hoja desde cero. Nunca se genera automáticamente.
              prestamo:   colIdx['Préstamo']        !== undefined ? row[colIdx['Préstamo']]      : '',
              // --- Campos que SOLO vienen de /players (ver _construirFila) --- [→ Contexto_Base_Web.md §11B051]
              antiguedad:       colIdx['Antigüedad']                  !== undefined ? row[colIdx['Antigüedad']]                  : '',
              arena:            colIdx['Arena']                       !== undefined ? row[colIdx['Arena']]                       : '',
              copas_max:        colIdx['Copas_max']                   !== undefined ? row[colIdx['Copas_max']]                   : '',
              victorias:        colIdx['Victorias']                   !== undefined ? row[colIdx['Victorias']]                   : '',
              derrotas:         colIdx['Derrotas']                    !== undefined ? row[colIdx['Derrotas']]                    : '',
              batallas:         colIdx['Batallas']                    !== undefined ? row[colIdx['Batallas']]                    : '',
              racha:            colIdx['Racha']                       !== undefined ? row[colIdx['Racha']]                       : '',
              cl_liga:          colIdx['Camino de leyendas_Liga']     !== undefined ? row[colIdx['Camino de leyendas_Liga']]     : '',
              cl_trofeos:       colIdx['Camino de leyendas_Trofeos']  !== undefined ? row[colIdx['Camino de leyendas_Trofeos']]  : '',
              cl_rango:         colIdx['Camino de leyendas_Rango']    !== undefined ? row[colIdx['Camino de leyendas_Rango']]    : '',
              victorias_3c:     colIdx['Victorias de tres coronas']   !== undefined ? row[colIdx['Victorias de tres coronas']]   : '',
              max_vic_desafios: colIdx['Max_victorias_desafíos']      !== undefined ? row[colIdx['Max_victorias_desafíos']]      : '',
              torneos:          colIdx['Torneos']                     !== undefined ? row[colIdx['Torneos']]                     : '',
              cartas_desafios:  colIdx['Cartas_desafíos']             !== undefined ? row[colIdx['Cartas_desafíos']]             : '',
              cartas_torneos:   colIdx['Cartas_torneos']              !== undefined ? row[colIdx['Cartas_torneos']]              : '',
              emotes:           colIdx['Emotes']                      !== undefined ? row[colIdx['Emotes']]                      : '',
              banners:          colIdx['Banners']                     !== undefined ? row[colIdx['Banners']]                    : ''
            };
          }
        }
      }
    }
  } catch(e) { Logger.log('[Drive] Error leyendo CSV Directorio: ' + e.message); }

  // (25-sep-2026, FASE B) ClanSystem_Backup_Celulares.json se lee ahora desde [→ Contexto_Base_Web.md §11B052]
  try {
    var folderJson = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var filesJson = folderJson.getFilesByName('ClanSystem_Backup_Celulares.json');
    if (filesJson.hasNext()) {
      var jsonText = filesJson.next().getBlob().getDataAsString("UTF-8");
      var jsonObj = JSON.parse(jsonText);
      for (var i = 0; i < jsonObj.length; i++) {
        var bkp = jsonObj[i];
        var t = String(bkp.tag).trim().toUpperCase();
        // IMPORTANTE: el JSON de celulares solo guarda Tag/Prefijo/Celular/WSP_G/ [→ Contexto_Base_Web.md §11B053]
        if (!map[t]) continue;
        // Validar cada campo del JSON antes de aceptarlo: [→ Contexto_Base_Web.md §11B054]
        var rawPref = soloDigitos(bkp.prefijo);
        if (rawPref) map[t].prefijo = rawPref;
        // Celular válido: numérico con mínimo 7 dígitos (descarta prefijos como '51')
        var rawCel = soloDigitos(bkp.celular);
        if (rawCel.length >= 7) map[t].celular = rawCel;
        // Filtrar 'Link' y valores no Sí/No para WSP(G) y Etiqueta
        var rawWspG = String(bkp.wsp_g || '').trim().toLowerCase();
        if (bkp.wsp_g && rawWspG !== 'link' && (rawWspG === 'sí' || rawWspG === 'si' || rawWspG === 'no')) map[t].wsp_g = bkp.wsp_g;
        var rawEtiq = String(bkp.etiqueta || '').trim().toLowerCase();
        if (bkp.etiqueta && rawEtiq !== 'link' && (rawEtiq === 'sí' || rawEtiq === 'si' || rawEtiq === 'no')) map[t].etiqueta = bkp.etiqueta;
        if (bkp.fecha_ing) map[t].fechaIng  = bkp.fecha_ing;
        // FIX (17-ago-2026, pedido usuario: "sigue trayendo valores numéricos [→ Contexto_Base_Web.md §11B055]
        if (bkp.vetado && _esSiNoOVacio(bkp.vetado)) map[t].vetado = bkp.vetado;
        if (bkp.razon && esRazonValida(bkp.razon)) map[t].razon = bkp.razon;
      }
    }
  } catch(e) {}

  return map;
}

function _detectarMulticuentas(existingRows, csvMap, activosPorTag, colIdxMap, inactivosPorTag) {
  // colIdxMap contiene índices 0-based para columnas leídas desde encabezados: [→ Contexto_Base_Web.md §11B056]
  var idxCel      = (colIdxMap && colIdxMap.celular  !== undefined) ? colIdxMap.celular  : (DC.CELULAR   - 1);
  var idxNombre   = (colIdxMap && colIdxMap.nombre   !== undefined) ? colIdxMap.nombre   : (DC.NOMBRE    - 1);
  var idxNomMulti = (colIdxMap && colIdxMap.nomMulti !== undefined) ? colIdxMap.nomMulti : (DC.NOM_MULTI - 1);

  // FIX (07-ago-2026): la agrupación por Celular solo consideraba tags [→ Contexto_Base_Web.md §11B057]
  inactivosPorTag = inactivosPorTag || {};

  var celMap = {};
  var celData = {};

  var procesarTag = function(tag, cel, nom, nomMulti) {
    if (!cel || cel === '0' || cel === '') return;
    var celLimpio = String(cel).replace(/\D/g,'');
    if (!celLimpio) return;

    if (!celMap[celLimpio]) {
      celMap[celLimpio] = [];
      celData[celLimpio] = { nomMulti: '', nombres: [] };
    }
    if (celMap[celLimpio].indexOf(tag) < 0) celMap[celLimpio].push(tag);

    if (nomMulti && !celData[celLimpio].nomMulti) celData[celLimpio].nomMulti = nomMulti;
    if (nom && celData[celLimpio].nombres.indexOf(nom) < 0) celData[celLimpio].nombres.push(nom);
  };

  var tagsToProcess = {};
  for (var tag in activosPorTag) tagsToProcess[tag] = true;
  for (var tag in existingRows) { if (tag !== '_headerIdx') tagsToProcess[tag] = true; }
  for (var tag in csvMap) tagsToProcess[tag] = true;
  for (var tag in inactivosPorTag) tagsToProcess[tag] = true;

  for (var tag in tagsToProcess) {
    var cel = '', nom = '', nomMulti = '';

    if (csvMap[tag]) {
      cel = csvMap[tag].celular || cel;
      nom = csvMap[tag].nombre || nom;
      nomMulti = csvMap[tag].nom_multi || nomMulti;
    }
    if (inactivosPorTag[tag] && inactivosPorTag[tag].ic) {
      var icInactivo = inactivosPorTag[tag].ic;
      cel = icInactivo[IC.CELULAR - 1] || cel;
      nom = icInactivo[IC.NOMBRE  - 1] || nom;
      nomMulti = icInactivo[IC.NOM_MULTI - 1] || nomMulti;
    }
    if (existingRows[tag]) {
      cel = existingRows[tag][idxCel]      || cel;
      nom = existingRows[tag][idxNombre]   || nom;
      nomMulti = existingRows[tag][idxNomMulti] || nomMulti;
    }
    if (activosPorTag[tag]) {
      nom = activosPorTag[tag].member.name || nom;
    }

    procesarTag(tag, cel, nom, nomMulti);
  }

  return { tagsPorCel: celMap, dataPorCel: celData };
}

function _construirFilasDirectorio(activosPorTag, existingRows, csvMap, multiData, ss, colIdxMap, inactivosPorTag, playersPorTag, linksPorTag) {
  var now = new Date();
  inactivosPorTag = inactivosPorTag || {};
  playersPorTag    = playersPorTag || {};
  linksPorTag      = linksPorTag || {};

  // Cuentas ocultas manualmente (ver CFG.TAGS_OCULTOS en 01_Config_Global.gs): se [→ Contexto_Base_Web.md §11B058]
  for (var tOc = 0; tOc < CFG.TAGS_OCULTOS.length; tOc++) {
    var tagOc = String(CFG.TAGS_OCULTOS[tOc]).toUpperCase();
    delete activosPorTag[tagOc];
    delete existingRows[tagOc];
    delete csvMap[tagOc];
  }

  var filasActivas   = [];
  var filasInactivas = [];

  // F2 (29-sep-2026, pedido de la usuaria): inicio de la permanencia actual de cada Tag segun las [→ Contexto_Base_Web.md §11B059]
  var inicioRachaGuerraPorTag = {};
  try {
    inicioRachaGuerraPorTag = _calcularInicioRachaGuerraPorTag(ss);
  } catch (eF2) {
    Logger.log('[F2 Fecha_ing] No se pudo calcular el inicio de racha desde Guerra; Fecha_ing queda como estaba: ' + eF2);
    inicioRachaGuerraPorTag = {};
  }

  // Activos en el clan Vetado (CFG.VETADO_TAG) que NO son administradores: [→ Contexto_Base_Web.md §11B060]
  var filasVetadoActivoNoAdmin = [];

  var tagMulticuenta = {};
  for (var cel in multiData.tagsPorCel) {
    if (multiData.tagsPorCel[cel].length > 1) {
      for (var k = 0; k < multiData.tagsPorCel[cel].length; k++) tagMulticuenta[multiData.tagsPorCel[cel][k]] = true;
    }
  }

  // tagsReactivados: tags que estaban en Inactivos (sin datos "en vivo" ni [→ Contexto_Base_Web.md §11B061]
  var tagsReactivados = [];

  for (var tag in activosPorTag) {
    var dato = activosPorTag[tag];
    var existingParaFila = existingRows[tag] || null;
    var csvRowParaFila = csvMap[tag] || null;
    // FASE B4 (16/07/2026): Nivel/Nivel2/V_Guerra/Copas y los 17 campos de [→ Contexto_Base_Web.md §11B062]
    var playersParaFila = playersPorTag[String(tag).toUpperCase()] || null;
    // FIX (05-ago-2026): flag que indica si existingParaFila viene en [→ Contexto_Base_Web.md §11B063]
    var esReactivacion = false;
    // Reactivación: si la cuenta no tiene datos "en vivo" ni en Directorio [→ Contexto_Base_Web.md §11B064]
    if (!existingParaFila && !csvRowParaFila && inactivosPorTag[tag]) {
      existingParaFila = _reconstruirExistingDesdeInactivos(inactivosPorTag[tag].ic, inactivosPorTag[tag].extra);
      tagsReactivados.push(tag);
      esReactivacion = true;
      if (!playersParaFila) playersParaFila = _proyectarPlayers(existingParaFila);
    }
    var fila = _construirFila(tag, dato.member, dato.clanInfo, dato.clanTag, existingParaFila, csvRowParaFila, tagMulticuenta, multiData, now, 'Activo', colIdxMap, playersParaFila, esReactivacion, inicioRachaGuerraPorTag[tag]);

    if (dato.clanTag === CFG.VETADO_TAG) {
      var esAdminVetadoActivo = String(fila[DC.ADMIN - 1] || '').trim() === 'Sí';
      if (esAdminVetadoActivo) {
        filasActivas.push(fila);
      } else {
        filasVetadoActivoNoAdmin.push(fila);
      }
    } else {
      filasActivas.push(fila);
    }
  }

  filasActivas.sort(function(a, b) {
    var idxA = CFG.CLAN_TAGS.indexOf(a._clanTag);
    var idxB = CFG.CLAN_TAGS.indexOf(b._clanTag);
    if (idxA !== idxB) return idxA - idxB;
    var rA = CFG.RANGO_ORDEN[a[DC.RANGO-1].toLowerCase().replace('í','i').replace('é','e')] || 4;
    var rB = CFG.RANGO_ORDEN[b[DC.RANGO-1].toLowerCase().replace('í','i').replace('é','e')] || 4;
    if (rA !== rB) return rA - rB;
    var cA = Number(a[DC.COPAS-1]) || 0;
    var cB = Number(b[DC.COPAS-1]) || 0;
    if (cA !== cB) return cB - cA;
    return String(a[DC.JUGADOR-1]).localeCompare(String(b[DC.JUGADOR-1]));
  });

  var inactivosTags = {};
  for (var tag in existingRows) { if (tag !== '_headerIdx' && !activosPorTag[tag]) inactivosTags[tag] = true; }
  for (var tag in csvMap)       { if (!activosPorTag[tag]) inactivosTags[tag] = true; }

  // CAMBIO CRÍTICO (8/7/2026): Filtro de inactivos por Admin [→ Contexto_Base_Web.md §11B065]
  var filasInactivasCompletas = filasVetadoActivoNoAdmin.slice();
  var noAdminFiltrados = 0;
  for (var tag in inactivosTags) {
    var playersParaFilaInactiva = playersPorTag[String(tag).toUpperCase()] || null;
    var linksParaFilaInactiva   = linksPorTag[String(tag).toUpperCase()]   || null;
    var fila = _construirFilaInactiva(tag, existingRows[tag] || null, csvMap[tag] || null, tagMulticuenta, multiData, colIdxMap, playersParaFilaInactiva, linksParaFilaInactiva, inactivosPorTag[tag] ? inactivosPorTag[tag].ic : null);
    filasInactivasCompletas.push(fila);

    // Verificar si es administrador (columna Admin)
    var esAdmin = String(fila[DC.ADMIN - 1] || '').trim().toLowerCase() === 'sí';

    // Solo incluir en Directorio si es admin. Inactivos no-admin se omiten de aquí,
    // pero se preservan en CSV y en Inactivos para poder restaurarlos si es necesario.
    if (esAdmin) {
      filasInactivas.push(fila);
    } else {
      noAdminFiltrados++;
    }
  }
  if (noAdminFiltrados > 0) {
    Logger.log('[Dir] Inactivos NO-admin filtrados (no se muestran en Directorio, se preservan en Inactivos): ' + noAdminFiltrados);
  }

  filasInactivas.sort(function(a, b) {
    var vA = String(a[DC.VETADO-1] || '').trim().toLowerCase();
    var vB = String(b[DC.VETADO-1] || '').trim().toLowerCase();
    var vetA = (vA === 'sí' || vA === 'si');
    var vetB = (vB === 'sí' || vB === 'si');

    var enVetadoA = String(a[DC.CLAN_TAG-1] || '') === CFG.VETADO_TAG;
    var enVetadoB = String(b[DC.CLAN_TAG-1] || '') === CFG.VETADO_TAG;

    // Grupo 1: Vetados en clan vetado
    var g1A = vetA && enVetadoA;
    var g1B = vetB && enVetadoB;
    // Grupo 2: Resto de vetados (vetado pero NO en clan vetado)
    var g2A = vetA && !enVetadoA;
    var g2B = vetB && !enVetadoB;
    // Grupo 3: No vetados (g3 = !vetA)

    // Ordenar por grupo: G1 < G2 < G3
    var grupoA = g1A ? 1 : (g2A ? 2 : 3);
    var grupoB = g1B ? 1 : (g2B ? 2 : 3);
    if (grupoA !== grupoB) return grupoA - grupoB;

    // Dentro del Grupo 1: Clan -> Rango -> Copas DESC -> Jugador ASC -> Nombre ASC
    if (grupoA === 1) {
      var clanA = String(a[DC.CLAN-1] || '').toLowerCase();
      var clanB = String(b[DC.CLAN-1] || '').toLowerCase();
      if (clanA !== clanB) return clanA < clanB ? -1 : 1;
      var rA = CFG.RANGO_ORDEN[String(a[DC.RANGO-1] || '').toLowerCase().replace('í','i').replace('é','e')] || 4;
      var rB = CFG.RANGO_ORDEN[String(b[DC.RANGO-1] || '').toLowerCase().replace('í','i').replace('é','e')] || 4;
      if (rA !== rB) return rA - rB;
      var cA = Number(a[DC.COPAS-1]) || 0;
      var cB = Number(b[DC.COPAS-1]) || 0;
      if (cA !== cB) return cB - cA; // DESC
    }

    // Grupos 2 y 3: Jugador ASC -> Nombre ASC
    var jugA = String(a[DC.JUGADOR-1] || '').toLowerCase();
    var jugB = String(b[DC.JUGADOR-1] || '').toLowerCase();
    if (jugA !== jugB) return jugA < jugB ? -1 : 1;
    var nomA = String(a[DC.NOMBRE-1] || '').toLowerCase();
    var nomB = String(b[DC.NOMBRE-1] || '').toLowerCase();
    return nomA < nomB ? -1 : 1;
  });

  var todasFilas = filasActivas.concat(filasInactivas);
  for (var i = 0; i < todasFilas.length; i++) todasFilas[i][DC.NUM - 1] = i + 1;
  return { filas: todasFilas, inactivasCompletas: filasInactivasCompletas, tagsReactivados: tagsReactivados };
}

/**
 * _resolverFechaIngF2(tag, fechaIng, datoRacha) // datoRacha = {fecha:Date, corte:boolean} [→ Contexto_Base_Web.md §11B066]
 */
function _resolverFechaIngF2(tag, fechaIng, datoRacha) {
  if (!datoRacha || !(datoRacha.fecha instanceof Date) || isNaN(datoRacha.fecha.getTime())) return fechaIng;
  var inicioRacha = datoRacha.fecha;
  var actual = (fechaIng instanceof Date && !isNaN(fechaIng.getTime())) ? fechaIng : null;
  if (actual && actual.getTime() === inicioRacha.getTime()) return fechaIng;
  // Hacia adelante SOLO con corte real (reingreso). Sin corte, una fecha posterior a la Fecha_ing
  // actual no prueba nada (los datos de Guerra empiezan en una fecha fija).
  if (actual && inicioRacha.getTime() > actual.getTime() && !datoRacha.corte) return fechaIng;
  var motivo = !actual ? 'completada (estaba vacia)'
             : (inicioRacha.getTime() < actual.getTime() ? 'corregida hacia atras (primera fila real de Guerra es anterior)'
                                                          : 'movida al inicio de la permanencia actual (reingreso detectado por semana sin filas)');
  var txtAntes = actual ? _formatFechaCanonica(actual, true) : 'vacia';
  Logger.log('[F2 Fecha_ing] ' + tag + ': ' + txtAntes + ' -> ' + _formatFechaCanonica(inicioRacha, true) + ' | ' + motivo);
  return inicioRacha;
}

/**
 * _inicioRachaDesdeFilasGuerra_(filas) [→ Contexto_Base_Web.md §11B067]
 */
function _inicioRachaDesdeFilasGuerra_(filas) {
  var universo = {};
  var porTag = {};
  for (var i = 0; i < filas.length; i++) {
    var f = filas[i];
    var t = Number(f[GC.TEMPORADA - 1]), sm = Number(f[GC.SEMANA - 1]);
    if (isNaN(t) || isNaN(sm) || !f[GC.TEMPORADA - 1] || !f[GC.SEMANA - 1]) continue;
    var wk = t * 100 + sm;
    universo[wk] = true;
    var tag = String(f[GC.TAG - 1] || '').trim();
    if (!tag) continue;
    var origen = String(f[GC.ORIGEN - 1] || '').trim();
    if (origen === 'Reconstruido') continue;
    var fecha = _parseSpanishDate(f[GC.FECHA - 1]);
    if (!(fecha instanceof Date) || isNaN(fecha.getTime())) continue;
    if (!porTag[tag]) porTag[tag] = {};
    var cur = porTag[tag][wk];
    if (!cur || fecha.getTime() < cur.getTime()) porTag[tag][wk] = fecha;
  }
  var semanas = Object.keys(universo).map(Number).sort(function (a, b) { return a - b; });
  var res = {};
  if (!semanas.length) return res;
  var ultima = semanas[semanas.length - 1];
  Object.keys(porTag).forEach(function (tag) {
    var m = porTag[tag];
    if (!m[ultima]) return;
    var inicioWk = null, viendo = false, huboCorte = false;
    for (var k = 0; k < semanas.length; k++) {
      var w = semanas[k];
      if (m[w]) { if (!viendo || inicioWk === null) inicioWk = w; viendo = true; }
      else if (viendo) { inicioWk = null; huboCorte = true; }
    }
    if (inicioWk !== null && m[inicioWk]) res[tag] = { fecha: m[inicioWk], corte: huboCorte };
  });
  return res;
}

/**
 * _calcularInicioRachaGuerraPorTag(ss) [→ Contexto_Base_Web.md §11B068]
 */
function _calcularInicioRachaGuerraPorTag(ss) {
  var filas = [];
  var temporadasHoja = {};
  var sh = ss.getSheetByName(CFG.SHEETS.GUERRA);
  if (sh && sh.getLastRow() >= 2) {
    var datos = sh.getRange(2, 1, sh.getLastRow() - 1, GUERRA_TOTAL_COLS).getValues();
    for (var i = 0; i < datos.length; i++) {
      temporadasHoja[String(datos[i][GC.TEMPORADA - 1] || '')] = true;
      filas.push(datos[i]);
    }
  }
  var csv = _leerGuerraCsvAgrupado_();
  if (csv && csv.porTemporada) {
    Object.keys(csv.porTemporada).forEach(function (t) {
      if (temporadasHoja[t]) return;
      csv.porTemporada[t].forEach(function (r) { filas.push(r); });
    });
  }
  return _inicioRachaDesdeFilasGuerra_(filas);
}

function _parseStringDate(str) {
  if (!str) return null;
  if (str instanceof Date) return str;
  var s = String(str).trim();

  var d = new Date(s);
  if (!isNaN(d.getTime())) return d;

  var parts = s.split('/');
  if (parts.length === 3) {
    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10) - 1;
    var year = parseInt(parts[2].substring(0, 4), 10);
    return new Date(year, month, day);
  }
  return null;
}

function _construirFila(tag, member, info, clanTag, existing, csvRow, tagMulticuenta, multiData, now, estado, colIdxMap, playersRow, existingEsDC, inicioRachaGuerra) {
  // FIX (05-ago-2026): `existing` puede venir en DOS formatos distintos: [→ Contexto_Base_Web.md §11B069]
  var iCelular  = existingEsDC ? (DC.CELULAR  - 1) : ((colIdxMap && colIdxMap.celular  !== undefined) ? colIdxMap.celular  : (IC.CELULAR  - 1));
  var iNomMulti = existingEsDC ? (DC.NOM_MULTI- 1) : ((colIdxMap && colIdxMap.nomMulti !== undefined) ? colIdxMap.nomMulti : (IC.NOM_MULTI- 1));
  var iPrefijo  = existingEsDC ? (DC.PREFIJO  - 1) : ((colIdxMap && colIdxMap.prefijo  !== undefined) ? colIdxMap.prefijo  : (IC.PREFIJO  - 1));
  var iFechaIng = existingEsDC ? (DC.FECHA_ING- 1) : ((colIdxMap && colIdxMap.fechaIng !== undefined) ? colIdxMap.fechaIng : (IC.FECHA_ING- 1));
  var iVetado   = existingEsDC ? (DC.VETADO   - 1) : ((colIdxMap && colIdxMap.vetado   !== undefined) ? colIdxMap.vetado   : (IC.VETADO   - 1));
  var iRazon    = existingEsDC ? (DC.RAZON    - 1) : ((colIdxMap && colIdxMap.razon    !== undefined) ? colIdxMap.razon    : (IC.RAZON    - 1));
  var iPermiso  = existingEsDC ? (DC.PERMISO  - 1) : ((colIdxMap && colIdxMap.permiso  !== undefined) ? colIdxMap.permiso  : (IC.PERMISO  - 1));
  var iWspG     = existingEsDC ? (DC.WSP_G    - 1) : ((colIdxMap && colIdxMap.wspG     !== undefined) ? colIdxMap.wspG     : (IC.WSP_G    - 1));
  var iEtiqueta = existingEsDC ? (DC.ETIQUETA - 1) : ((colIdxMap && colIdxMap.etiqueta !== undefined) ? colIdxMap.etiqueta : (IC.ETIQUETA - 1));
  var iAdmin    = existingEsDC ? (DC.ADMIN    - 1) : ((colIdxMap && colIdxMap.admin    !== undefined) ? colIdxMap.admin    : (IC.ADMIN    - 1));
  var iCatDisp  = existingEsDC ? (DC.CAT_DISP - 1) : ((colIdxMap && colIdxMap.catDisp  !== undefined) ? colIdxMap.catDisp  : -1);
  var iPrestamo = existingEsDC ? (DC.PRESTAMO - 1) : ((colIdxMap && colIdxMap.prestamo !== undefined) ? colIdxMap.prestamo : (IC.PRESTAMO - 1));
  var fila = new Array(DIR_TOTAL_COLS).fill('');
  fila._clanTag = clanTag;
  var tagSinHash = cleanTag(tag);

  // FASE B4 (16/07/2026): Nivel/V_Guerra/Nivel2 y la detección de [→ Contexto_Base_Web.md §11B070]
  var nivel = Number(member.expLevel) || 0;
  if (nivel === 0 && playersRow) nivel = Number(playersRow[PC.NIVEL - 1]) || 0;
  if (nivel === 0 && csvRow)     nivel = Number(csvRow.nivel) || 0;

  // V_Guerra: prioridad: 1) Players (existente), 2) CSV, 3) API players (si activa) [→ Contexto_Base_Web.md §11B071]
  var vGuerra = '';
  var copasActuales = member.trophies || 0;
  if (playersRow && playersRow[PC.V_GUERRA - 1] !== '' && playersRow[PC.V_GUERRA - 1] !== null && playersRow[PC.V_GUERRA - 1] !== undefined) {
    var vgExisting = Number(playersRow[PC.V_GUERRA - 1]);
    var copasEx    = Number(playersRow[PC.COPAS - 1] || 0);
    // Si V_Guerra == Copas de Players o == Copas actuales de la API, está corrupto
    var estaCorrupto = (copasEx > 0 && vgExisting === copasEx) ||
                       (copasActuales > 0 && vgExisting === copasActuales);
    if (!estaCorrupto) {
      vGuerra = playersRow[PC.V_GUERRA - 1];
    }
  }
  if (vGuerra === '' && csvRow && csvRow.v_guerra !== '' && csvRow.v_guerra !== null && csvRow.v_guerra !== undefined) {
    vGuerra = csvRow.v_guerra;
  }

  // Nivel2: prioridad: 1) Players (existente), 2) CSV, 3) API players (collectionLevel.progress)
  var nivel2 = '';
  if (playersRow && playersRow[PC.NIVEL2 - 1] !== '' && playersRow[PC.NIVEL2 - 1] !== null && playersRow[PC.NIVEL2 - 1] !== undefined) {
    nivel2 = playersRow[PC.NIVEL2 - 1];
  } else if (csvRow && csvRow.nivel2 !== '' && csvRow.nivel2 !== null && csvRow.nivel2 !== undefined) {
    nivel2 = csvRow.nivel2;
  }

  // --- Campos que SOLO vienen de /players --- [→ Contexto_Base_Web.md §11B072]
  var _fallbackPlayerField = function(campoPC, csvField) {
    var iPlayers = PC[campoPC] - 1;
    if (playersRow && playersRow[iPlayers] !== '' && playersRow[iPlayers] !== null && playersRow[iPlayers] !== undefined) {
      return playersRow[iPlayers];
    }
    if (csvRow && csvRow[csvField] !== '' && csvRow[csvField] !== null && csvRow[csvField] !== undefined) {
      return csvRow[csvField];
    }
    return '';
  };

  fila[DC.ANTIGUEDAD       - 1] = _fallbackPlayerField('ANTIGUEDAD',       'antiguedad');
  fila[DC.ARENA            - 1] = _fallbackPlayerField('ARENA',            'arena');
  fila[DC.COPAS_MAX        - 1] = _fallbackPlayerField('COPAS_MAX',        'copas_max');
  fila[DC.VICTORIAS        - 1] = _fallbackPlayerField('VICTORIAS',        'victorias');
  fila[DC.DERROTAS         - 1] = _fallbackPlayerField('DERROTAS',         'derrotas');
  fila[DC.BATALLAS         - 1] = _fallbackPlayerField('BATALLAS',         'batallas');
  fila[DC.RACHA            - 1] = _fallbackPlayerField('RACHA',            'racha');
  fila[DC.CL_LIGA          - 1] = _fallbackPlayerField('CL_LIGA',          'cl_liga');
  fila[DC.CL_TROFEOS       - 1] = _fallbackPlayerField('CL_TROFEOS',       'cl_trofeos');
  fila[DC.CL_RANGO         - 1] = _fallbackPlayerField('CL_RANGO',         'cl_rango');
  fila[DC.VICTORIAS_3C     - 1] = _fallbackPlayerField('VICTORIAS_3C',     'victorias_3c');
  fila[DC.MAX_VIC_DESAFIOS - 1] = _fallbackPlayerField('MAX_VIC_DESAFIOS', 'max_vic_desafios');
  fila[DC.TORNEOS          - 1] = _fallbackPlayerField('TORNEOS',          'torneos');
  fila[DC.CARTAS_DESAFIOS  - 1] = _fallbackPlayerField('CARTAS_DESAFIOS',  'cartas_desafios');
  fila[DC.CARTAS_TORNEOS   - 1] = _fallbackPlayerField('CARTAS_TORNEOS',   'cartas_torneos');
  fila[DC.EMOTES           - 1] = _fallbackPlayerField('EMOTES',           'emotes');
  fila[DC.BANNERS          - 1] = _fallbackPlayerField('BANNERS',          'banners');

  // esAdminTag: mismo criterio (existing primero, CSV como respaldo) que se [→ Contexto_Base_Web.md §11B073]
  var esAdminTag = existing ? (String(existing[iAdmin] || '').trim() === 'Sí')
    : !!(csvRow && String(csvRow.admin || '').trim() === 'Sí');

  if (PLAYERS_API_ENABLED !== false || esAdminTag) {
    var playerData = _getPlayerCache(tag);
    if (playerData) {
      if (Number(playerData.expLevel) > 0) nivel = Number(playerData.expLevel);
      var vgNuevo = _getVGuerra(playerData);
      if (vgNuevo !== '') vGuerra = vgNuevo;
      // Nivel2: progress de collectionLevel
      var n2Nuevo = _getNivel2(playerData);
      if (n2Nuevo !== '') nivel2 = n2Nuevo;

      // --- Sobreescribir con datos frescos de /players SOLO cuando vienen [→ Contexto_Base_Web.md §11B074]
      var antig = _getBadgeLevel(playerData, 'YearsPlayed');
      if (antig !== '') fila[DC.ANTIGUEDAD - 1] = antig;

      if (playerData.arena && playerData.arena.rawName) fila[DC.ARENA - 1] = playerData.arena.rawName;

      if (playerData.bestTrophies          !== undefined) fila[DC.COPAS_MAX        - 1] = playerData.bestTrophies;
      if (playerData.wins                  !== undefined) fila[DC.VICTORIAS       - 1] = playerData.wins;
      if (playerData.losses                !== undefined) fila[DC.DERROTAS        - 1] = playerData.losses;
      if (playerData.battleCount           !== undefined) fila[DC.BATALLAS        - 1] = playerData.battleCount;
      if (playerData.currentWinLoseStreak  !== undefined) fila[DC.RACHA           - 1] = playerData.currentWinLoseStreak;

      // Camino de leyendas (currentPathOfLegendSeasonResult)
      var pol = playerData.currentPathOfLegendSeasonResult || {};
      if (pol.leagueNumber !== undefined) fila[DC.CL_LIGA    - 1] = pol.leagueNumber;
      if (pol.trophies     !== undefined) fila[DC.CL_TROFEOS - 1] = pol.trophies;
      if (pol.rank         !== undefined) fila[DC.CL_RANGO   - 1] = pol.rank;

      // Otras stats
      if (playerData.threeCrownWins        !== undefined) fila[DC.VICTORIAS_3C     - 1] = playerData.threeCrownWins;
      if (playerData.challengeMaxWins      !== undefined) fila[DC.MAX_VIC_DESAFIOS - 1] = playerData.challengeMaxWins;
      if (playerData.tournamentBattleCount !== undefined) fila[DC.TORNEOS          - 1] = playerData.tournamentBattleCount;
      if (playerData.challengeCardsWon     !== undefined) fila[DC.CARTAS_DESAFIOS  - 1] = playerData.challengeCardsWon;
      if (playerData.tournamentCardsWon    !== undefined) fila[DC.CARTAS_TORNEOS   - 1] = playerData.tournamentCardsWon;

      // Emotes y Banners: badges con progress
      var emotesNuevo = _getBadgeProgress(playerData, 'EmoteCollection');
      if (emotesNuevo !== '') fila[DC.EMOTES - 1] = emotesNuevo;
      var bannersNuevo = _getBadgeProgress(playerData, 'BannerCollection');
      if (bannersNuevo !== '') fila[DC.BANNERS - 1] = bannersNuevo;
    }
  }
  if (nivel === 0) nivel = '';

  fila[DC.TAG    - 1] = tag;
  fila[DC.NOMBRE - 1] = member.name || '';
  fila[DC.NIVEL  - 1] = nivel;
  fila[DC.NIVEL2 - 1] = nivel2;
  fila[DC.COPAS  - 1] = member.trophies || 0;
  fila[DC.DON_R  - 1] = member.donationsReceived || 0;
  fila[DC.DON_D  - 1] = member.donations || 0;
  fila[DC.RANKING  - 1] = member.clanRank || 0;
  fila[DC.RANKING_P - 1] = member.previousClanRank || 0;
  fila[DC.RANGO   - 1] = mapRol(member.role);
  fila[DC.CLAN    - 1] = info ? (info.name || '') : '';
  fila[DC.CLAN_TAG - 1] = clanTag;
  fila[DC.LIDER   - 1] = info ? getClanLeader(info.memberList || []) : '';
  fila[DC.ESTADO  - 1] = estado;

  var nombreLimpio = String(member.name || '').trim();
  // Iniciales = Sí si el nombre empieza con el prefijo de clan. [→ Contexto_Base_Web.md §11B075]
  var empiezaConIniciales = (nombreLimpio.indexOf('ᴳ乂ᵀ') === 0) ||
                            (CFG.PREFIJO_TERNA ? (nombreLimpio.indexOf(CFG.PREFIJO_TERNA) === 0) : false);
  fila[DC.INICIALES - 1] = empiezaConIniciales ? 'Sí' : 'No';

  var vigenciaDate = lastSeenToDate(member.lastSeen);
  fila[DC.VIGENCIA   - 1] = vigenciaDate || '';
  fila[DC.INACTIVIDAD - 1] = diasInactividad(member.lastSeen);

  var prefijo = '', celular = '', fechaIng = '', vetado = '', razon = '', permiso = '', wsp_g = '', etiqueta = '', nomMulti = '';
  var admin = '', catDisp = '', prestamo = '';

  // Valores válidos para campos de tipo Sí/No (dropdowns)
  var VALORES_SINO = ['sí', 'si', 'no'];
  // WSP(G) y Etiqueta son Sí/No; también aceptamos vacío (se sobreescribirá)
  function _esSiNo(v)    { return VALORES_SINO.indexOf(v.toLowerCase()) >= 0; }
  // Link es el texto de un hipervínculo RichText — no es un valor válido para Sí/No
  function _noEsLink(v)  { return v.toLowerCase() !== 'link'; }

  if (existing) {
    var rawPrefijo  = soloDigitos(existing[iPrefijo]);
    var rawCelular  = soloDigitos(existing[iCelular]);
    var rawWspG     = String(existing[iWspG]     || '').trim();
    var rawEtiqueta = String(existing[iEtiqueta] || '').trim();
    // Prefijo: solo usar si quedó algún dígito tras limpiar
    if (rawPrefijo)  prefijo  = rawPrefijo;
    // Celular: solo usar si tiene mínimo 7 dígitos tras limpiar espacios/formato
    if (rawCelular.length >= 7)  celular  = rawCelular;
    // WSP(G): solo usar si es Sí/No y no es 'Link'
    if (_esSiNo(rawWspG) && _noEsLink(rawWspG))     wsp_g    = rawWspG;
    // Etiqueta: solo usar si es Sí/No y no es 'Link'
    if (_esSiNo(rawEtiqueta) && _noEsLink(rawEtiqueta)) etiqueta = rawEtiqueta;
    if (existing[iFechaIng]) fechaIng = existing[iFechaIng];
    // FIX (13-ago-2026, pedido del usuario): "está escribiendo valores [→ Contexto_Base_Web.md §11B076]
    var rawVetado = String(existing[iVetado] || '').trim();
    vetado   = _esSiNo(rawVetado) ? rawVetado : '';
    // Razón: solo se acepta si es una de las razones reconocidas. 'Sí'/'No' [→ Contexto_Base_Web.md §11B077]
    var rawRazon = String(existing[iRazon] || '').trim();
    razon    = esRazonValida(rawRazon) ? rawRazon : '';
    var rawPermiso = String(existing[iPermiso] || '').trim();
    permiso  = _esSiNo(rawPermiso) ? rawPermiso : '';
    nomMulti = String(existing[iNomMulti] || '').trim();
    // Columnas de edición manual — se preservan, pero solo si son un valor
    // Sí/No/vacío válido (ver fix de arriba, mismo criterio).
    var rawAdmin = String(existing[iAdmin] || '').trim();
    admin    = _esSiNo(rawAdmin) ? rawAdmin : '';
    catDisp  = String(existing[iCatDisp]  || '').trim();
    prestamo = String(existing[iPrestamo] || '').trim();
  }

  // Admin/Cat_disp: si no hubo "existing" (ej. justo después de demolerTodoElSpreadsheet(), [→ Contexto_Base_Web.md §11B078]
  if (!admin   && csvRow && csvRow.admin)    admin   = String(csvRow.admin).trim();
  if (!catDisp && csvRow && csvRow.cat_disp) catDisp = String(csvRow.cat_disp).trim();
  // Préstamo: si no había en existing, caer al CSV (preserva ediciones manuales antiguas)
  if (!prestamo && csvRow && csvRow.prestamo) prestamo = String(csvRow.prestamo).trim();

  // IMPORTANTE: prioridad = 1) valor ya en la hoja (existing, incluye ediciones [→ Contexto_Base_Web.md §11B079]
  if (csvRow) {
    if (!prefijo  && csvRow.prefijo)   prefijo  = soloDigitos(csvRow.prefijo);
    if (!celular  && csvRow.celular)   celular  = soloDigitos(csvRow.celular);
    // WSP(G) del CSV: solo si es Sí/No y no es 'Link'
    if (!wsp_g && csvRow.wsp_g && _esSiNo(String(csvRow.wsp_g)) && _noEsLink(String(csvRow.wsp_g))) wsp_g = csvRow.wsp_g;
    // Etiqueta del CSV: solo si es Sí/No y no es 'Link'
    if (!etiqueta && csvRow.etiqueta && _esSiNo(String(csvRow.etiqueta)) && _noEsLink(String(csvRow.etiqueta))) etiqueta = csvRow.etiqueta;
    if (!vetado   && csvRow.vetado)    vetado   = csvRow.vetado;
    // Razón del CSV: solo si es una razón válida reconocida.
    if (!razon    && csvRow.razon && esRazonValida(csvRow.razon)) razon = csvRow.razon;
    if (!permiso  && csvRow.permiso)   permiso  = csvRow.permiso;
    if (!nomMulti && csvRow.nom_multi) nomMulti = csvRow.nom_multi;
    if (!fechaIng && csvRow.fechaIng)  fechaIng = csvRow.fechaIng;
  }

  // RED DE SEGURIDAD — Celular (ver CELULARES_RESPALDO_MANUAL_ más arriba [→ Contexto_Base_Web.md §11B080]
  var respaldoManual = _getCelularesRespaldoManual_();
  if (!celular && respaldoManual[cleanTag(tag)]) {
    celular = soloDigitos(respaldoManual[cleanTag(tag)]);
    Logger.log('[Celular-Respaldo] ' + tag + ': Celular restaurado desde la propiedad CELULARES_RESPALDO_MANUAL_JSON (existing y CSV llegaron vacíos).');
  }

  // RED DE SEGURIDAD — Vetado (pedido explícito del usuario: "el código no [→ Contexto_Base_Web.md §11B081]
  var vetadoLlegoVacioONoExplicito = !vetado || String(vetado).trim().toLowerCase() === 'no';
  if (vetadoLlegoVacioONoExplicito && _tagEstaVetadoConfirmado(cleanTag(tag))) {
    var vetadoOriginalAntesDeRed = vetado ? ('"' + vetado + '"') : 'vacío';
    vetado = 'Sí';
    Logger.log('[ANTI-DESBANEO] ' + tag + ': Vetado llegó ' + vetadoOriginalAntesDeRed + ' desde existing/CSV pero el Tag está en el ' +
      'registro de vetados confirmados (' + NOMBRE_JSON_VETADOS_CONFIRMADOS_ + ') — se restauró a "Sí" ' +
      'automáticamente. Si este desbaneo es intencional, ejecutar _olvidarVetadoConfirmado("' + cleanTag(tag) + '") ' +
      'a mano desde el editor de Apps Script.');
  }

  if (!prefijo) prefijo = CFG.PREFIJO_DEFAULT;

  var dIngreso = _parseStringDate(fechaIng);
  // IMPORTANTE: si no hay fecha de ingreso registrada, NO asignar now. [→ Contexto_Base_Web.md §11B082]
  var esNuevoSinHistorial = !fechaIng && !existing && (!csvRow || !csvRow.fechaIng);
  if (!dIngreso) {
    dIngreso = esNuevoSinHistorial ? now : null;
  }
  fechaIng = dIngreso || '';

  // F2 (29-sep-2026): completar Fecha_ing si esta vacia y corregirla con el inicio de la [→ Contexto_Base_Web.md §11B083]
  fechaIng = _resolverFechaIngF2(tag, fechaIng, inicioRachaGuerra);

  // Fecha_Lim = plazo para ponerse las iniciales del clan. Si el jugador YA [→ Contexto_Base_Web.md §11B084]
  var fechaLim = (!empiezaConIniciales && fechaIng instanceof Date && !isNaN(fechaIng.getTime()))
    ? new Date(fechaIng.getTime() + 7 * 24 * 60 * 60 * 1000)
    : '';

  if (vGuerra === '' || vGuerra === null || vGuerra === undefined) vGuerra = '';
  if (clanTag === CFG.VETADO_TAG) {
    vetado = 'Sí';
    if (!razon) razon = info ? (info.name || '') : CFG.VETADO_TAG;
  }

  var esMulti = tagMulticuenta[tag] ? 'Sí' : 'No';

  // Jugador = Nom_Multi calculado, para TODOS (incluso cuentas únicas)
  var jugador = _calcJugador(tag, member.name, nomMulti, celular, multiData);
  var iEstado = (colIdxMap && colIdxMap.estado !== undefined) ? colIdxMap.estado : (DC.ESTADO - 1);
  var alerta = _calcAlerta(estado, fila[DC.INACTIVIDAD - 1], celular, fila[DC.INICIALES - 1], existing, iEstado);

  fila[DC.NOM_MULTI  - 1] = nomMulti;
  fila[DC.MULTICUENTA - 1] = esMulti;
  fila[DC.PERMISO    - 1] = permiso;
  fila[DC.V_GUERRA   - 1] = vGuerra;
  // IMPORTANTE: se guardan como NÚMERO (no string). El formato visual con [→ Contexto_Base_Web.md §11B085]
  fila[DC.PREFIJO    - 1] = prefijo ? Number(prefijo) : '';
  fila[DC.CELULAR    - 1] = celular ? Number(celular) : '';
  fila[DC.WSP_G      - 1] = wsp_g;
  fila[DC.ETIQUETA   - 1] = etiqueta;
  fila[DC.FECHA_ING  - 1] = fechaIng;
  fila[DC.FECHA_LIM  - 1] = fechaLim;
  fila[DC.ALERTA     - 1] = alerta;
  fila[DC.JUGADOR    - 1] = jugador;
  fila[DC.VETADO     - 1] = vetado;
  fila[DC.RAZON      - 1] = razon;
  // Columnas de edición manual — se preservan desde existing
  fila[DC.ADMIN      - 1] = admin;
  fila[DC.CAT_DISP   - 1] = catDisp;
  // Préstamo: columna de edición MANUAL. Indica a quién se prestó esta cuenta. [→ Contexto_Base_Web.md §11B086]
  fila[DC.PRESTAMO   - 1] = prestamo;
  // Clanes_Admin: calculada, no manual. Solo se llena si Admin="Sí" y el
  // celular coincide con ADMIN_FAMILIA_JSON (_getAdminFamilia_(), 01_Config_Global.gs).
  fila[DC.CLANES_ADMIN - 1] = (String(admin || '').trim() === 'Sí')
    ? _getClanesAdminTexto(prefijo, celular)
    : '';

  // PRESERVACIÓN DE LINKS Y DATOS EXISTENTES (bloque inerte desde la Fase B3) [→ Contexto_Base_Web.md §11B087]
  if (existing && admin !== 'Sí') {
    // Preservar links generados: RoyaleAPI, Mazo, Mazo2, CWStats, Render
    if (existing[DC.ROYALE_API - 1]) fila[DC.ROYALE_API - 1] = existing[DC.ROYALE_API - 1];
    if (existing[DC.MAZO - 1]) fila[DC.MAZO - 1] = existing[DC.MAZO - 1];
    if (existing[DC.MAZO_2 - 1]) fila[DC.MAZO_2 - 1] = existing[DC.MAZO_2 - 1];
    if (existing[DC.CW_STATS - 1]) fila[DC.CW_STATS - 1] = existing[DC.CW_STATS - 1];
    if (existing[DC.RENDER - 1]) fila[DC.RENDER - 1] = existing[DC.RENDER - 1];

    // WSP: Preservar SOLO si Celular existe
    // Si Celular fue borrado/vacío, también borrar WSP
    if (existing[DC.WSP - 1] && celular) {
      fila[DC.WSP - 1] = existing[DC.WSP - 1];
    } else if (!celular) {
      fila[DC.WSP - 1] = '';
    }
  }

  return fila;
}

/**
 * _calcJugador [→ Contexto_Base_Web.md §11B088]
 */
function _calcJugador(tag, nombre, nomMulti, celular, multiData) {
  var celLimpio = String(celular || '').replace(/\D/g,'');
  var celFundador = _getFundadorCelular_();
  if (celFundador && celLimpio === celFundador) return CFG.FUNDADOR.jugador;

  var finalNomMulti = nomMulti || '';

  // Detectar si es multicuenta real (>1 tag con el mismo celular)
  var esMultiReal = celLimpio &&
                    multiData &&
                    multiData.tagsPorCel &&
                    multiData.tagsPorCel[celLimpio] &&
                    multiData.tagsPorCel[celLimpio].length > 1;

  if (esMultiReal) {
    // Multicuenta: usar todos los nombres del grupo
    var data = multiData.dataPorCel[celLimpio];
    if (!finalNomMulti && data && data.nomMulti) finalNomMulti = data.nomMulti;
    var nombresGrupo = (data && data.nombres.length > 0) ? data.nombres : (nombre ? [nombre] : []);
    var nombresStr = nombresGrupo.join(' ');

    if (finalNomMulti) return finalNomMulti + ' (' + nombresStr + ')';
    return nombresStr;
  }

  // Cuenta única: usar SOLO el nombre propio recibido como parámetro
  if (finalNomMulti) return finalNomMulti + ' (' + (nombre || '') + ')';
  return nombre || '';
}

function _calcAlerta(estado, inactividad, celular, iniciales, existing, iEstado) {
  var idxEstado = (iEstado !== undefined) ? iEstado : (DC.ESTADO - 1);
  var alertas = [];
  if (estado === 'Activo' && Number(inactividad) >= 3) alertas.push('Candidato a expulsión');
  if (existing && String(existing[idxEstado] || '') === 'Inactivo' && estado === 'Activo') alertas.push('Reactivado');
  if (!celular || iniciales === 'No') alertas.push('Pendiente');
  return alertas.join(', ');
}

function _escribirDirectorio(sh, filas) {
  var lastRow = sh.getLastRow();

  // FIX (05-ago-2026): "letras blancas en cuentas no vetadas". clearContent() [→ Contexto_Base_Web.md §11B089]
  if (lastRow >= 2) {
    sh.getRange(2, 1, lastRow - 1, DIR_SHEET_COLS)
      .clearContent()
      .setFontColor(null);
  }
  if (filas.length === 0) return;

  // FIX (pedido usuario — tag #VJV0QGPJG, nombre "67" aparecía vacío en [→ Contexto_Base_Web.md §11B090]
  var COLS_TEXTO_FORZADO_NOMBRE_ = [IC.NOMBRE, IC.NOM_MULTI];
  for (var ctf = 0; ctf < COLS_TEXTO_FORZADO_NOMBRE_.length; ctf++) {
    sh.getRange(2, COLS_TEXTO_FORZADO_NOMBRE_[ctf], filas.length, 1).setNumberFormat('@');
  }

  // IMPORTANTE (rendimiento): a diferencia de la versión anterior, los [→ Contexto_Base_Web.md §11B091]
  var filasHoja = filas.map(function(f) { return _proyectarInactivos(f); });
  sh.getRange(2, 1, filasHoja.length, DIR_SHEET_COLS).setValues(filasHoja);

  // --- Formatos numéricos/fecha: una sola llamada por columna para TODO [→ Contexto_Base_Web.md §11B092]
  sh.getRange(2, IC.CELULAR,     filas.length, 1).setNumberFormat('### ### ### ###');
  sh.getRange(2, IC.VIGENCIA,    filas.length, 1).setNumberFormat('dddd, d "de" mmmm"," yyyy h:mm:ss am/pm');
  // FIX (28-sep-2026, pedido del usuario): Fecha_ing debe MOSTRAR tambien la hora. El valor ya se [→ Contexto_Base_Web.md §11B093]
  sh.getRange(2, IC.FECHA_ING,   filas.length, 1).setNumberFormat('dd/mm/yyyy hh:mm:ss');
  sh.getRange(2, IC.FECHA_LIM,   filas.length, 1).setNumberFormat('dd/mm/yyyy');

  // Celdas Vigencia/Fecha_ing/Fecha_lim que NO traen una fecha válida [→ Contexto_Base_Web.md §11B094]

  // TODAS las columnas numéricas de la hoja (formato visual #,##0 con [→ Contexto_Base_Web.md §11B095]
  var COLS_NUMERICAS_DIR_ = [IC.NUM, IC.RANKING, IC.RANKING_P, IC.INACTIVIDAD];
  for (var ci = 0; ci < COLS_NUMERICAS_DIR_.length; ci++) {
    sh.getRange(2, COLS_NUMERICAS_DIR_[ci], filas.length, 1).setNumberFormat('#,##0');
  }

  // FASE B2: la generación y escritura de los 6 enlaces (WSP, RoyaleAPI, [→ Contexto_Base_Web.md §11B096]

  // FIX (02-ago-2026): recién escrito el Nombre real de la cuenta (viene de [→ Contexto_Base_Web.md §11B097]
  _limpiarLinksAccidentalesEnHoja(sh);
}

function _aplicarDropdownsDirectorio(sh, numFilas) {
  if (numFilas === 0) return;
  var opsSiNo = SpreadsheetApp.newDataValidation().requireValueInList(['Sí','No'], true).build();
  var opsRazon = SpreadsheetApp.newDataValidation()
    .requireValueInList(['NARANJA x','Vetado por clan','Incumplimiento de ataques','Conducta inapropiada','Inactividad prolongada','Solicitud propia'], true).build();
  sh.getRange(2, IC.MULTICUENTA, numFilas, 1).setDataValidation(opsSiNo);
  sh.getRange(2, IC.PERMISO,     numFilas, 1).setDataValidation(opsSiNo);
  sh.getRange(2, IC.WSP_G,       numFilas, 1).setDataValidation(opsSiNo);
  sh.getRange(2, IC.ETIQUETA,    numFilas, 1).setDataValidation(opsSiNo);
  sh.getRange(2, IC.INICIALES,   numFilas, 1).setDataValidation(opsSiNo);
  sh.getRange(2, IC.RAZON,       numFilas, 1).setDataValidation(opsRazon);
  sh.getRange(2, IC.ADMIN,       numFilas, 1).setDataValidation(opsSiNo);
  sh.getRange(2, IC.VETADO,      numFilas, 1).setDataValidation(opsSiNo);
  // Cat_disp (texto libre, sin dropdown) se autocompleta por separado con actualizarDropdownCatDisp()
  actualizarDropdownCatDisp();
}

/**
 * _limpiarValidacionesFilasVaciasDirectorio(sh, numFilas) [→ Contexto_Base_Web.md §11B098]
 */
function _limpiarValidacionesFilasVaciasDirectorio(sh, numFilas) {
  var maxRows = sh.getMaxRows();
  var primeraFilaVacia = numFilas + 2; // numFilas ya escritas empiezan en fila 2
  if (maxRows < primeraFilaVacia) return;
  try {
    sh.getRange(primeraFilaVacia, 1, maxRows - primeraFilaVacia + 1, DIR_SHEET_COLS)
      .clearDataValidations();
  } catch (e) {
    Logger.log('[Directorio] Error limpiando validaciones en filas vacías: ' + e.message);
  }
}

/**
 * _buscarFilaPorTag(sh, tag) [→ Contexto_Base_Web.md §11B099]
 */
function _buscarFilaPorTag(sh, tag) {
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return -1;
  var tags = sh.getRange(2, DC.TAG, lastRow - 1, 1).getValues();
  for (var i = 0; i < tags.length; i++) {
    if (String(tags[i][0] || '').trim() === tag) return i + 2;
  }
  return -1;
}

/**
 * _aplicarFormatoCondicionalDirectorio(sh, numFilas, totalCols, colVetado, colEstado, colRango) [→ Contexto_Base_Web.md §11B100]
 */
function _aplicarFormatoCondicionalDirectorio(sh, numFilas, totalCols, colVetadoNum, colEstadoNum, colRangoNum) {
  if (numFilas === 0) return;
  totalCols    = totalCols    || DIR_SHEET_COLS;
  // 0 explícito = "no aplica en esta hoja", NO se reemplaza por el default.
  colVetadoNum = (colVetadoNum === undefined) ? IC.VETADO : colVetadoNum;
  colEstadoNum = (colEstadoNum === undefined) ? IC.ESTADO : colEstadoNum;
  colRangoNum  = colRangoNum  || IC.RANGO;
  var dataRange = sh.getRange(2, 1, numFilas, totalCols);
  var colRango  = colLetter(colRangoNum);
  var rules = [];
  if (colVetadoNum) {
    var colVetado = colLetter(colVetadoNum);
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + colVetado + '2="Sí"')
      .setBackground(CFG.COLORES.VETADO_BG).setFontColor(CFG.COLORES.VETADO_FG).setBold(true).setRanges([dataRange]).build());
  }
  if (colEstadoNum) {
    var colEstado = colLetter(colEstadoNum);
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + colEstado + '2="Inactivo"')
      .setBackground(CFG.COLORES.INACTIVO_BG).setRanges([dataRange]).build());
  }
  rules.push(
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + colRango + '2="Líder"')
      .setBackground(CFG.COLORES.LIDER_BG).setRanges([dataRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + colRango + '2="Colíder"')
      .setBackground(CFG.COLORES.COLIDER_BG).setRanges([dataRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + colRango + '2="Veterano"')
      .setBackground(CFG.COLORES.VETERANO_BG).setRanges([dataRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + colRango + '2="Miembro"')
      .setBackground(CFG.COLORES.MIEMBRO_BG).setRanges([dataRange]).build()
  );
  _tryCondFmt(sh, rules);
}

/**
 * sincronizarEdicionAdminCatDisp(sh, row) [→ Contexto_Base_Web.md §11B101]
 */
function sincronizarEdicionAdminCatDisp(sh, row) {
  var ss = _getSs();
  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  var shAdm = ss.getSheetByName(CFG.SHEETS.ADMINISTRADORES);
  if (!shDir || !shAdm) return;

  var esDirectorio = (sh.getName() === CFG.SHEETS.DIRECTORIO);
  var shOtro = esDirectorio ? shAdm : shDir;

  var tag = String(sh.getRange(row, DC.TAG).getValue() || '').trim(); // Tag = col 2 en ambas hojas
  if (!tag) return;

  // Admin (12/07/2026): Directorio y Administradores ya NO comparten [→ Contexto_Base_Web.md §11B102]
  var colAdminSh    = esDirectorio ? IC.ADMIN : AC.ADMIN;
  var colAdminOtro  = esDirectorio ? AC.ADMIN : IC.ADMIN;
  var admin = String(sh.getRange(row, colAdminSh).getValue() || '').trim();

  // 1. Mirror inmediato de Admin hacia la otra hoja (misma fila por Tag), si existe.
  var filaOtro = _buscarFilaPorTag(shOtro, tag);
  if (filaOtro > 0) {
    shOtro.getRange(filaOtro, colAdminOtro).setValue(admin);
  }

  // 2. Si se marcó Admin = "Sí", propagar a todas las cuentas del Directorio [→ Contexto_Base_Web.md §11B103]
  if (admin === 'Sí') {
    // La fila con el Celular de origen: si la edición fue en Directorio, es [→ Contexto_Base_Web.md §11B104]
    var filaCelular = esDirectorio ? row : filaOtro;
    if (filaCelular > 0) {
      // FIX (Fase 11): IC.CELULAR (13)/IC.ADMIN (19)/IC.NOM_MULTI (5), nunca
      // DC.* — shDir es siempre la hoja física de 29 columnas.
      var cel = String(shDir.getRange(filaCelular, IC.CELULAR).getValue() || '').trim();
      var nomMultiOrigen = String(shDir.getRange(filaCelular, IC.NOM_MULTI).getValue() || '').trim();

      if (cel) {
        var numFilasDir = shDir.getLastRow() - 1;
        if (numFilasDir >= 1) {
          var celulares      = shDir.getRange(2, IC.CELULAR, numFilasDir, 1).getValues();
          var adminsActuales = shDir.getRange(2, IC.ADMIN, numFilasDir, 1).getValues();
          var nomMultiActual = shDir.getRange(2, IC.NOM_MULTI, numFilasDir, 1).getValues();

          for (var i = 0; i < celulares.length; i++) {
            var celFila = String(celulares[i][0] || '').trim();
            if (!celFila || celFila !== cel) continue;

            if (String(adminsActuales[i][0] || '').trim() !== 'Sí') {
              shDir.getRange(i + 2, IC.ADMIN).setValue('Sí');
            }

            // Nom_Multi (pedido nuevo, Fase 11): se propaga solo si la
            // cuenta destino todavía no tiene uno propio cargado.
            var nomMultiDestino = String(nomMultiActual[i][0] || '').trim();
            if (!nomMultiDestino && nomMultiOrigen) {
              shDir.getRange(i + 2, IC.NOM_MULTI).setValue(nomMultiOrigen);
            }
          }
        }
      }
    }
    // Reconstruir Administradores (agrega cuentas nuevas que ahora comparten
    // celular admin) y rellenar Cat_disp por defecto en las que aún no tengan valor.
    sincronizarAdministradores();
    actualizarDropdownCatDisp();
  }
}

/**
 * _aplicarCatDispMultiSelect(sh, categorias) [→ Contexto_Base_Web.md §11B105]
 */
function _aplicarCatDispMultiSelect(sh, categorias) {
  var numFilas = sh.getLastRow() - 1;
  if (numFilas < 1) return;

  // Quitar cualquier validación de lista/dropdown que haya quedado de una [→ Contexto_Base_Web.md §11B106]
  sh.getRange(2, AC.CAT_DISP, numFilas, 1).clearDataValidations();

  var todasCategorias = categorias.join(', ');
  var data = sh.getRange(2, AC.ADMIN, numFilas, AC.CAT_DISP - AC.ADMIN + 1).getValues();
  var idxAdmin = 0;
  var idxCatDisp = AC.CAT_DISP - AC.ADMIN;
  for (var i = 0; i < data.length; i++) {
    var esAdmin = String(data[i][idxAdmin] || '').trim();
    var catActual = String(data[i][idxCatDisp] || '').trim();
    if (esAdmin === 'Sí' && !catActual) {
      sh.getRange(i + 2, AC.CAT_DISP).setValue(todasCategorias);
    }
  }
}

/**
 * _aplicarFuncionesMultiSelect(sh, funciones) [→ Contexto_Base_Web.md §11B107]
 */
function _aplicarFuncionesMultiSelect(sh, funciones) {
  var numFilas = sh.getLastRow() - 1;
  if (numFilas < 1) return;

  // Quitar cualquier validación de lista/dropdown que haya quedado de una [→ Contexto_Base_Web.md §11B108]
  sh.getRange(2, AC.FUNCIONES, numFilas, 1).clearDataValidations();

  var todasFunciones = funciones.join(', ');
  var data = sh.getRange(2, AC.ADMIN, numFilas, AC.FUNCIONES - AC.ADMIN + 1).getValues();
  var idxAdmin = 0;
  var idxFunciones = AC.FUNCIONES - AC.ADMIN;
  for (var i = 0; i < data.length; i++) {
    var esAdmin = String(data[i][idxAdmin] || '').trim();
    var funcionesActual = String(data[i][idxFunciones] || '').trim();
    if (esAdmin === 'Sí' && !funcionesActual) {
      sh.getRange(i + 2, AC.FUNCIONES).setValue(todasFunciones);
    }
  }
}

function _aplicarDropdownsAdministradores(sh, numFilas) {
  if (numFilas === 0) return;
  var opsSiNo = SpreadsheetApp.newDataValidation().requireValueInList(['Sí','No'], true).build();
  sh.getRange(2, AC.WSP_G,  numFilas, 1).setDataValidation(opsSiNo);
  sh.getRange(2, AC.ADMIN,  numFilas, 1).setDataValidation(opsSiNo);
  sh.getRange(2, AC.VETADO, numFilas, 1).setDataValidation(opsSiNo);
}

/**
 * _obtenerNomMultisDistintos() [→ Contexto_Base_Web.md §11B109]
 */
function _obtenerNomMultisDistintos() {
  var ss = _getSs();
  var vistos = {};
  var resultado = [];

  function recolectar(nombreHoja) {
    var sh = ss.getSheetByName(nombreHoja);
    if (!sh || sh.getLastRow() < 2) return;
    var data = sh.getRange(2, IC.NOM_MULTI, sh.getLastRow() - 1, 1).getValues();
    for (var i = 0; i < data.length; i++) {
      var nm = String(data[i][0] || '').trim();
      if (nm && !vistos[nm]) { vistos[nm] = true; resultado.push(nm); }
    }
  }

  recolectar(CFG.SHEETS.DIRECTORIO);
  recolectar(CFG.SHEETS.INACTIVOS);

  resultado.sort(function (a, b) { return a.localeCompare(b); });
  return resultado;
}

/**
 * _guardarRegistroNuevoMiembro(datos) [→ Contexto_Base_Web.md §11B110]
 */
function _guardarRegistroNuevoMiembro(datos) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    return { ok: false, error: 'El sistema está ocupado guardando otro registro. Intenta de nuevo en unos segundos.' };
  }
  try {
    return _guardarRegistroNuevoMiembroImpl(datos);
  } finally {
    lock.releaseLock();
  }
}

function _guardarRegistroNuevoMiembroImpl(datos) {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!sh) return { ok: false, error: 'No encontré la hoja Directorio.' };

  var tagNorm = String(datos.tag || '').trim().toUpperCase();
  if (!tagNorm) return { ok: false, error: 'Tag vacío.' };

  var lastRow = sh.getLastRow();
  var filaExistente = -1;
  if (lastRow >= 2) {
    var tags = sh.getRange(2, DC.TAG, lastRow - 1, 1).getValues();
    for (var i = 0; i < tags.length; i++) {
      if (String(tags[i][0] || '').trim().toUpperCase() === tagNorm) {
        filaExistente = i + 2;
        break;
      }
    }
  }

  var prefijoNum = soloDigitos(datos.prefijo);
  var celularNum = soloDigitos(datos.celular);
  var nomMulti   = String(datos.nomMulti || '').trim();
  var prestamo   = String(datos.prestamo || '').trim();

  if (filaExistente > 0) {
    // Fila ya existente (activa o inactiva de una corrida anterior):
    // solo se actualizan estos 4 campos, sin tocar el resto de columnas.
    sh.getRange(filaExistente, IC.PREFIJO).setValue(prefijoNum ? Number(prefijoNum) : '');
    sh.getRange(filaExistente, IC.CELULAR).setValue(celularNum ? Number(celularNum) : '');
    sh.getRange(filaExistente, IC.NOM_MULTI).setValue(nomMulti);
    sh.getRange(filaExistente, IC.PRESTAMO).setValue(prestamo);
    return { ok: true, esNueva: false };
  }

  // Fila nueva: se agrega al final, con Estado="Inactivo" (el jugador [→ Contexto_Base_Web.md §11B111]
  var nuevaFila = new Array(DIR_SHEET_COLS).fill('');
  nuevaFila[IC.TAG - 1]       = tagNorm;
  nuevaFila[IC.PREFIJO - 1]   = prefijoNum ? Number(prefijoNum) : '';
  nuevaFila[IC.CELULAR - 1]   = celularNum ? Number(celularNum) : '';
  nuevaFila[IC.NOM_MULTI - 1] = nomMulti;
  nuevaFila[IC.PRESTAMO - 1]  = prestamo;
  nuevaFila[IC.ESTADO - 1]    = 'Inactivo';

  var filaDestino = lastRow < 1 ? 2 : lastRow + 1;
  sh.getRange(filaDestino, 1, 1, DIR_SHEET_COLS).setValues([nuevaFila]);
  return { ok: true, esNueva: true };
}

/**
 * _aplicarBordesComentarios() (Fase 7 del plan de cambios) [→ Contexto_Base_Web.md §11B112]
 */
function _aplicarBordesComentarios() {
  var sh = _getSs().getSheetByName(CFG.SHEETS.COMENTARIOS);
  if (!sh) return;
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return;
  var lastCol = sh.getLastColumn();
  applyBorderCenter(sh.getRange(2, 1, lastRow - 1, lastCol));
  var maxRows = sh.getMaxRows();
  if (maxRows > lastRow) {
    try {
      sh.getRange(lastRow + 1, 1, maxRows - lastRow, lastCol)
        .setBorder(false, false, false, false, false, false);
    } catch(e) {}
  }
}

// LIMPIEZA DE ENLACES ACCIDENTALES EN NOMBRES [→ Contexto_Base_Web.md §11B113]

/**
 * _limpiarLinksAccidentalesEnHoja(sh) [→ Contexto_Base_Web.md §11B114]
 */
function _limpiarLinksAccidentalesEnHoja(sh, headerRow) {
  headerRow = headerRow || 1;
  var primeraFilaDatos = headerRow + 1;
  // FIX (09-ago-2026): se agrega 'clan' a la lista — pedido explícito del [→ Contexto_Base_Web.md §11B115]
  var ENCABEZADOS_A_LIMPIAR = ['nombre', 'nombre jugador', 'jugador', 'nom_multi', 'clan'];
  var resumen = [];

  var lastRow = sh.getLastRow();
  var lastCol = sh.getLastColumn();
  if (lastRow < primeraFilaDatos || lastCol < 1) return resumen;

  var encabezados;
  try {
    encabezados = sh.getRange(headerRow, 1, 1, lastCol).getDisplayValues()[0];
  } catch (e) {
    return resumen; // hoja sin acceso o formato raro: se omite sin cortar el resto
  }

  for (var c = 0; c < encabezados.length; c++) {
    var nombreCol = String(encabezados[c] || '').trim();
    if (ENCABEZADOS_A_LIMPIAR.indexOf(nombreCol.toLowerCase()) < 0) continue;

    var col = c + 1;
    var rango = sh.getRange(primeraFilaDatos, col, lastRow - primeraFilaDatos + 1, 1);
    var valores;
    try {
      valores = rango.getRichTextValues();
    } catch (e) {
      Logger.log('[LinksNombres] ' + sh.getName() + '.' + nombreCol + ': error al leer (' + e.message + '), se omite.');
      continue;
    }

    var corregidas = 0;
    for (var i = 0; i < valores.length; i++) {
      var rt = valores[i][0];
      if (!rt || !rt.getLinkUrl()) continue;

      // FIX (02/08/2026): reportado que el log registraba "N enlace(s) [→ Contexto_Base_Web.md §11B116]
      var textoLimpio = rt.getText();
      var ultimoPunto = textoLimpio.lastIndexOf('.');
      if (ultimoPunto > 0 && ultimoPunto < textoLimpio.length - 1) {
        textoLimpio = textoLimpio.slice(0, ultimoPunto + 1) + '\u200B' + textoLimpio.slice(ultimoPunto + 1);
      }

      valores[i][0] = SpreadsheetApp.newRichTextValue().setText(textoLimpio).build();
      corregidas++;
    }

    if (corregidas > 0) {
      rango.setRichTextValues(valores);
      // flush() adicional: confirma el cambio de inmediato, antes de que la [→ Contexto_Base_Web.md §11B117]
      SpreadsheetApp.flush();
      Logger.log('[LinksNombres] ' + sh.getName() + '.' + nombreCol + ': ' + corregidas + ' enlace(s) accidental(es) quitado(s).');
    }
    resumen.push({ hoja: sh.getName(), columna: nombreCol, corregidas: corregidas });
  }

  return resumen;
}

// FASE B1 (14/07/2026) — Reconstrucción de filas de Directorio en formato DC [→ Contexto_Base_Web.md §11B118]

/**
 * _leerHojaComoMapaPorTag(ss, nombreHoja, tagColIdx, totalCols) [→ Contexto_Base_Web.md §11B119]
 */
function _leerHojaComoMapaPorTag(ss, nombreHoja, tagColIdx, totalCols) {
  var mapa = {};
  var sh = ss.getSheetByName(nombreHoja);
  if (!sh || sh.getLastRow() < 2) return mapa;
  var datos = sh.getRange(2, 1, sh.getLastRow() - 1, totalCols).getValues();
  for (var i = 0; i < datos.length; i++) {
    var tag = String(datos[i][tagColIdx] || '').trim().toUpperCase();
    if (tag) mapa[tag] = datos[i];
  }
  return mapa;
}

/**
 * _leerFilaHojaPorTag(ss, nombreHoja, tagColIdx, totalCols, tag) [→ Contexto_Base_Web.md §11B120]
 */
function _leerFilaHojaPorTag(ss, nombreHoja, tagColIdx, totalCols, tag) {
  var tagNorm = String(tag || '').trim().toUpperCase();
  if (!tagNorm) return null;
  var sh = ss.getSheetByName(nombreHoja);
  if (!sh || sh.getLastRow() < 2) return null;
  var colTag1based = tagColIdx + 1;
  var finder = sh.getRange(2, colTag1based, sh.getLastRow() - 1, 1)
    .createTextFinder(tagNorm)
    .matchEntireCell(true)
    .matchCase(false);
  var match = finder.findNext();
  if (!match) return null;
  return sh.getRange(match.getRow(), 1, 1, totalCols).getValues()[0];
}

/**
 * _reconstruirFilaDCDesdeFisico(filaDirectorio, playersRow, linksRow) [→ Contexto_Base_Web.md §11B121]
 */
function _reconstruirFilaDCDesdeFisico(filaDirectorio, playersRow, linksRow) {
  var fila = new Array(DIR_TOTAL_COLS).fill('');
  for (var campo in IC) {
    var valorIC = filaDirectorio[IC[campo] - 1];
    if (campo === 'VETADO' || campo === 'PERMISO' || campo === 'ADMIN') {
      valorIC = _esSiNoOVacio(valorIC) ? valorIC : '';
    } else if (campo === 'RAZON') {
      valorIC = esRazonValida(valorIC) ? valorIC : '';
    }
    fila[DC[campo] - 1] = valorIC;
  }
  var CAMPOS_IDENTIDAD = { NUM:1, TAG:1, NOMBRE:1, NOM_MULTI:1, PRESTAMO:1, CLAN:1, CLAN_TAG:1, RANGO:1 };
  if (playersRow) {
    for (var campoP in PC) {
      if (CAMPOS_IDENTIDAD[campoP]) continue;
      if (DC[campoP] !== undefined) fila[DC[campoP] - 1] = playersRow[PC[campoP] - 1];
    }
  }
  if (linksRow) {
    for (var campoL in LC) {
      if (CAMPOS_IDENTIDAD[campoL]) continue;
      if (DC[campoL] !== undefined) fila[DC[campoL] - 1] = linksRow[LC[campoL] - 1];
    }
  }
  return fila;
}

/**
 * _leerDirectorioFisicoComoDC(ss) [→ Contexto_Base_Web.md §11B122]
 */
function _leerDirectorioFisicoComoDC(ss) {
  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!shDir || shDir.getLastRow() < 2) return [];
  var numFilas   = shDir.getLastRow() - 1;
  var dirFisico  = shDir.getRange(2, 1, numFilas, DIR_SHEET_COLS).getValues();
  var playersPorTag = _leerHojaComoMapaPorTag(ss, CFG.SHEETS.PLAYERS, PC.TAG - 1, PLAYERS_TOTAL_COLS);
  var linksPorTag   = _leerLinksComoMapaPorTagConUrls(ss);
  var resultado = [];
  for (var i = 0; i < dirFisico.length; i++) {
    var tag = String(dirFisico[i][IC.TAG - 1] || '').trim().toUpperCase();
    resultado.push(_reconstruirFilaDCDesdeFisico(dirFisico[i], playersPorTag[tag], linksPorTag[tag]));
  }
  return resultado;
}