// 36_PerfilWeb.gs
// CSV exclusivo de los 5 contadores de la cabecera de estadísticas avanzadas del perfil (CSV primero, JSON de respaldo). [→ Contexto_Base_Web.md §36B001]
// NUEVO (24-sep-2026, pedido del usuario)
//
// Fuente cache /players: ExpLevel, KingTowerLevel, StarPoints, ExpPoints, TotalExpPoints; una fila por jugador; no toca la columna Nivel de Directorio/Inactivos; progress{} quedó fuera (ver 35). [→ Contexto_Base_Web.md §36B002]

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 27-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Hoja Perfil web: actualizar
//  Parte 2 — Funciones que no se corren a mano
//    - Perfil web: leer, armar y guardar el CSV (lo usa updatePerfilWebSheet)
//    - Perfil web: respuestas web (CSV primero)
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

var PERFIL_WEB_CSV = 'Backup_PerfilWeb.csv';

var PERFIL_WEB_HEADERS = [
  'N°', 'Tag',
  'ExpLevel', 'KingTowerLevel', 'StarPoints', 'ExpPoints', 'TotalExpPoints'
];

var _PW_CSV_MEMO = null; // memo por ejecución: la misma petición web lo usa 1 sola vez por tag, pero el CSV se lee 1 sola vez

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Hoja Perfil web: actualizar -----

// Actualiza el CSV según PLAYERS_API_ENABLED; reusa _mergearCards2CSV() (merge por Tag, nunca vacía). [→ Contexto_Base_Web.md §36B005]
function updatePerfilWebSheet() {
  if (PLAYERS_API_ENABLED === false) {
    Logger.log('[PerfilWeb] PLAYERS_API_ENABLED=false: no se actualiza ' + PERFIL_WEB_CSV + '.');
    return;
  }

  if (PLAYERS_API_ENABLED === 'admin') {
    _actualizarPerfilWebSoloAdmins();
    return;
  }

  var ss = _getSs();
  _fetchPlayersData(); // memoizado: no repite peticiones ya hechas en esta corrida

  var tags = [];
  if (PLAYERS_API_ENABLED === true) {
    tags = _getTagsConPlayerCache();
  } else if (PLAYERS_API_ENABLED === 'partial') {
    tags = _getTagsParaPartialMode(ss);
  }
  if (!tags || tags.length === 0) {
    Logger.log('[PerfilWeb] Sin jugadores para actualizar');
    return;
  }

  var nuevas = _armarFilasPerfilWebParaTags(tags);
  if (nuevas.length === 0) {
    Logger.log('[PerfilWeb] Sin datos para escribir');
    return;
  }

  var csv = _leerPerfilWebCSV();
  var finales = _mergearCards2CSV(csv.rows, nuevas);
  _guardarPerfilWebCSV(csv.headers, finales);
  Logger.log('[PerfilWeb] ' + PERFIL_WEB_CSV + ' actualizado con merge para ' + nuevas.length +
    ' jugador(es). Nunca se vacía: el resto de tags conserva su fila anterior.');
}

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Perfil web: leer, armar y guardar el CSV (lo usa updatePerfilWebSheet) -----

// Lee Backup_PerfilWeb.csv como {headers, rows}; si no existe, devuelve encabezados por defecto. [→ Contexto_Base_Web.md §36B003]
function _leerPerfilWebCSV() {
  var csvText = _loadCSVFromDrive(PERFIL_WEB_CSV);
  if (!csvText) return { headers: PERFIL_WEB_HEADERS.slice(), rows: [] };
  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length === 0) return { headers: PERFIL_WEB_HEADERS.slice(), rows: [] };
  var headers = parsed[0], rows = parsed.slice(1);
  for (var h = headers.length; h < PERFIL_WEB_HEADERS.length; h++) headers.push(PERFIL_WEB_HEADERS[h]);
  for (var r = 0; r < rows.length; r++) {
    while (rows[r].length < PERFIL_WEB_HEADERS.length) rows[r].push('');
  }
  return { headers: headers, rows: rows };
}

function _pwCelda(v) {
  return (v === undefined || v === null) ? '' : v;
}

// Arma la fila del CSV de un jugador a partir de su JSON de /players. [→ Contexto_Base_Web.md §36B004]
function _armarFilaPerfilWeb(tag, pd) {
  return [
    '', tag,
    _pwCelda(pd.expLevel), _pwCelda(pd.kingTowerLevel), _pwCelda(pd.starPoints),
    _pwCelda(pd.expPoints), _pwCelda(pd.totalExpPoints)
  ];
}

function _armarFilasPerfilWebParaTags(tags) {
  var filas = [];
  for (var i = 0; i < tags.length; i++) {
    var pd = _getPlayerCache(tags[i]);
    if (!pd) continue;
    filas.push(_armarFilaPerfilWeb(tags[i], pd));
  }
  return filas;
}

/** Renumera la columna N° (índice 0) y guarda el CSV completo. */
function _guardarPerfilWebCSV(headers, rows) {
  for (var i = 0; i < rows.length; i++) rows[i][0] = i + 1;
  _saveCSVToDrive(PERFIL_WEB_CSV, _encodeCSV([headers].concat(rows)));
}

// Modo 'admin': actualiza solo filas de admins y preserva el resto. [→ Contexto_Base_Web.md §36B006]
function _actualizarPerfilWebSoloAdmins() {
  var ss = _getSs();
  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!shDir || shDir.getLastRow() < 2) {
    Logger.log('[PerfilWeb] Directorio no encontrado o vacío');
    return;
  }

  var dataDir = shDir.getRange(2, 1, shDir.getLastRow() - 1, DIR_SHEET_COLS).getValues();
  var tagsAdmin = [];
  for (var i = 0; i < dataDir.length; i++) {
    var admin = String(dataDir[i][IC.ADMIN - 1] || '').trim();
    var tag = String(dataDir[i][IC.TAG - 1] || '').trim();
    if (admin === 'Sí' && tag) tagsAdmin.push(tag);
  }
  if (tagsAdmin.length === 0) {
    Logger.log('[PerfilWeb] No hay ningún admin marcado en Directorio, nada que actualizar.');
    return;
  }

  _fetchPlayersData(); // ANTES de revisar el cache (mismo fix que Cards_2/Insignias_2/CaminoLeyendas)

  var nuevas = _armarFilasPerfilWebParaTags(tagsAdmin);
  if (nuevas.length === 0) {
    Logger.log('[PerfilWeb] Se consultó /players para ' + tagsAdmin.length + ' admin(es) pero ninguno devolvió datos (posible error de API).');
    return;
  }

  var csv = _leerPerfilWebCSV();
  var finales = _mergearCards2CSV(csv.rows, nuevas);
  _guardarPerfilWebCSV(csv.headers, finales);
  Logger.log('[PerfilWeb] ' + PERFIL_WEB_CSV + ' actualizado: ' + nuevas.length + ' admin(es) (modo ADMIN, preservando no-admins).');
}

// ----- Perfil web: respuestas web (CSV primero) -----

function _pwCsvMemo() {
  if (!_PW_CSV_MEMO) _PW_CSV_MEMO = _leerPerfilWebCSV();
  return _PW_CSV_MEMO;
}

function _pwNumero(v) {
  if (v === undefined || v === null) return null;
  var s = String(v).trim().replace(/,/g, '');
  if (s === '') return null;
  var n = Number(s);
  return isNaN(n) ? null : n;
}

// Devuelve los 5 contadores del CSV, o null si no hay fila/dato. [→ Contexto_Base_Web.md §36B007]
function _webPerfilWebCsv(tag) {
  var tagLimpio = cleanTag(tag);
  if (!tagLimpio) return null;
  var rows;
  try {
    rows = _pwCsvMemo().rows;
  } catch (e) {
    Logger.log('[WebAPI] No se pudo leer ' + PERFIL_WEB_CSV + ' (' + e.message + '); se usa el JSON.');
    return null;
  }
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (cleanTag(r[1]) !== tagLimpio) continue;
    var res = {
      expLevel:       _pwNumero(r[2]),
      kingTowerLevel: _pwNumero(r[3]),
      starPoints:     _pwNumero(r[4]),
      expPoints:      _pwNumero(r[5]),
      totalExpPoints: _pwNumero(r[6])
    };
    var hay = res.expLevel !== null || res.kingTowerLevel !== null || res.starPoints !== null ||
      res.expPoints !== null || res.totalExpPoints !== null;
    return hay ? res : null;
  }
  return null;
}

// Pisa en `extra` los contadores que trae el CSV; el resto queda como el JSON. [→ Contexto_Base_Web.md §36B008]
function _webAplicarPerfilWebCsv(extra, csv) {
  if (!csv) return;
  if (csv.expLevel       !== null) extra.expLevel       = csv.expLevel;
  if (csv.kingTowerLevel !== null) extra.kingTowerLevel = csv.kingTowerLevel;
  if (csv.starPoints     !== null) extra.starPoints     = csv.starPoints;
  if (csv.expPoints      !== null) extra.expPoints      = csv.expPoints;
  if (csv.totalExpPoints !== null) extra.totalExpPoints = csv.totalExpPoints;
}
