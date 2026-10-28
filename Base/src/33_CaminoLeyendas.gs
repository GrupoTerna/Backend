// 33_CaminoLeyendas.gs
// Backup_CaminoLeyendas.csv, un CSV EXCLUSIVO de Camino de Leyendas por jugador, 
// del que la web (perfil.html) lee PRIMERO; el JSON de Drive queda solo como respaldo.
//
// NUEVO 24-sep-2026: CSV exclusivo de Camino de Leyendas + leagueStatistics (21 columnas, una fila por jugador); fuente = cache /players; modos PLAYERS_API_ENABLED; merge por Tag sin vaciar el CSV. [→ Contexto_Base_Web.md §33B001]

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 27-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Hoja Camino de Leyendas: actualizar
//  Parte 2 — Funciones que no se corren a mano
//    - Camino de Leyendas: leer, armar y guardar el CSV (lo usa updateCaminoLeyendasSheet)
//    - Camino de Leyendas: respuestas web (CSV primero)
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

var CAMINO_LEYENDAS_CSV = 'Backup_CaminoLeyendas.csv';

var CAMINO_LEYENDAS_HEADERS = [
  'N°', 'Tag',
  'Actual_Liga', 'Actual_Trofeos', 'Actual_Rango',
  'Anterior_Liga', 'Anterior_Trofeos', 'Anterior_Rango',
  'Mejor_Liga', 'Mejor_Trofeos', 'Mejor_Rango',
  'Ladder_Historico',
  'Liga_Actual_Id', 'Liga_Actual_Trofeos', 'Liga_Actual_Mejor',
  'Liga_Anterior_Id', 'Liga_Anterior_Trofeos', 'Liga_Anterior_Mejor',
  'Liga_Mejor_Id', 'Liga_Mejor_Trofeos', 'Liga_Mejor_Mejor'
];

var _CL_CSV_MEMO = null; // memo por ejecución: la misma petición web lo usa 2 veces

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Hoja Camino de Leyendas: actualizar -----

// Actualiza el CSV según PLAYERS_API_ENABLED; reusa _mergearCards2CSV() (merge por Tag, nunca vacía). [→ Contexto_Base_Web.md §33B004]
function updateCaminoLeyendasSheet() {
  if (PLAYERS_API_ENABLED === false) {
    Logger.log('[CaminoLeyendas] PLAYERS_API_ENABLED=false: no se actualiza ' + CAMINO_LEYENDAS_CSV + '.');
    return;
  }

  if (PLAYERS_API_ENABLED === 'admin') {
    _actualizarCaminoLeyendasSoloAdmins();
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
    Logger.log('[CaminoLeyendas] Sin jugadores para actualizar');
    return;
  }

  var nuevas = _armarFilasCaminoLeyendasParaTags(tags);
  if (nuevas.length === 0) {
    Logger.log('[CaminoLeyendas] Sin datos para escribir');
    return;
  }

  var csv = _leerCaminoLeyendasCSV();
  var finales = _mergearCards2CSV(csv.rows, nuevas);
  _guardarCaminoLeyendasCSV(csv.headers, finales);
  Logger.log('[CaminoLeyendas] ' + CAMINO_LEYENDAS_CSV + ' actualizado con merge para ' + nuevas.length +
    ' jugador(es). Nunca se vacía: el resto de tags conserva su fila anterior.');
}

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Camino de Leyendas: leer, armar y guardar el CSV (lo usa updateCaminoLeyendasSheet) -----

// Lee Backup_CaminoLeyendas.csv como {headers, rows}; si no existe, devuelve encabezados por defecto. [→ Contexto_Base_Web.md §33B002]
function _leerCaminoLeyendasCSV() {
  var csvText = _loadCSVFromDrive(CAMINO_LEYENDAS_CSV);
  if (!csvText) return { headers: CAMINO_LEYENDAS_HEADERS.slice(), rows: [] };
  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length === 0) return { headers: CAMINO_LEYENDAS_HEADERS.slice(), rows: [] };
  var headers = parsed[0], rows = parsed.slice(1);
  // CSV creado antes de las columnas de leagueStatistics: se completan
  // encabezado y filas (se guarda en la próxima corrida del sync).
  for (var h = headers.length; h < CAMINO_LEYENDAS_HEADERS.length; h++) headers.push(CAMINO_LEYENDAS_HEADERS[h]);
  for (var r = 0; r < rows.length; r++) {
    while (rows[r].length < CAMINO_LEYENDAS_HEADERS.length) rows[r].push('');
  }
  return { headers: headers, rows: rows };
}

function _clCelda(v) {
  return (v === undefined || v === null) ? '' : v;
}

// Arma la fila del CSV de un jugador a partir de su JSON de /players (pd). [→ Contexto_Base_Web.md §33B003]
function _armarFilaCaminoLeyendas(tag, pd) {
  var act = pd.currentPathOfLegendSeasonResult || {};
  var ant = pd.lastPathOfLegendSeasonResult    || {};
  var mej = pd.bestPathOfLegendSeasonResult    || {};
  var ls  = pd.leagueStatistics || {};
  var lsAct = ls.currentSeason  || {};
  var lsAnt = ls.previousSeason || {};
  var lsMej = ls.bestSeason     || {};
  return [
    '', tag,
    _clCelda(act.leagueNumber), _clCelda(act.trophies), _clCelda(act.rank),
    _clCelda(ant.leagueNumber), _clCelda(ant.trophies), _clCelda(ant.rank),
    _clCelda(mej.leagueNumber), _clCelda(mej.trophies), _clCelda(mej.rank),
    _clCelda(pd.legacyTrophyRoadHighScore),
    _clCelda(lsAct.id), _clCelda(lsAct.trophies), _clCelda(lsAct.bestTrophies),
    _clCelda(lsAnt.id), _clCelda(lsAnt.trophies), _clCelda(lsAnt.bestTrophies),
    _clCelda(lsMej.id), _clCelda(lsMej.trophies), _clCelda(lsMej.bestTrophies)
  ];
}

function _armarFilasCaminoLeyendasParaTags(tags) {
  var filas = [];
  for (var i = 0; i < tags.length; i++) {
    var pd = _getPlayerCache(tags[i]);
    if (!pd) continue;
    filas.push(_armarFilaCaminoLeyendas(tags[i], pd));
  }
  return filas;
}

/** Renumera la columna N° (índice 0) y guarda el CSV completo. */
function _guardarCaminoLeyendasCSV(headers, rows) {
  for (var i = 0; i < rows.length; i++) rows[i][0] = i + 1;
  _saveCSVToDrive(CAMINO_LEYENDAS_CSV, _encodeCSV([headers].concat(rows)));
}

// Modo 'admin': actualiza solo filas de admins y preserva el resto. [→ Contexto_Base_Web.md §33B005]
function _actualizarCaminoLeyendasSoloAdmins() {
  var ss = _getSs();
  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!shDir || shDir.getLastRow() < 2) {
    Logger.log('[CaminoLeyendas] Directorio no encontrado o vacío');
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
    Logger.log('[CaminoLeyendas] No hay ningún admin marcado en Directorio, nada que actualizar.');
    return;
  }

  _fetchPlayersData(); // ANTES de revisar el cache (mismo fix que Cards_2/Insignias_2)

  var nuevas = _armarFilasCaminoLeyendasParaTags(tagsAdmin);
  if (nuevas.length === 0) {
    Logger.log('[CaminoLeyendas] Se consultó /players para ' + tagsAdmin.length + ' admin(es) pero ninguno devolvió datos (posible error de API).');
    return;
  }

  var csv = _leerCaminoLeyendasCSV();
  var finales = _mergearCards2CSV(csv.rows, nuevas);
  _guardarCaminoLeyendasCSV(csv.headers, finales);
  Logger.log('[CaminoLeyendas] ' + CAMINO_LEYENDAS_CSV + ' actualizado: ' + nuevas.length + ' admin(es) (modo ADMIN, preservando no-admins).');
}

// ----- Camino de Leyendas: respuestas web (CSV primero) -----

function _clCsvMemo() {
  if (!_CL_CSV_MEMO) _CL_CSV_MEMO = _leerCaminoLeyendasCSV();
  return _CL_CSV_MEMO;
}

function _clNumero(v) {
  if (v === undefined || v === null) return null;
  var s = String(v).trim().replace(/,/g, '');
  if (s === '') return null;
  var n = Number(s);
  return isNaN(n) ? null : n;
}

/** {leagueNumber, trophies, rank} solo con las celdas que traen dato; null si ninguna. */
function _clTemporada(liga, trofeos, rango) {
  var o = {}, hay = false;
  var l = _clNumero(liga), t = _clNumero(trofeos), r = _clNumero(rango);
  if (l !== null) { o.leagueNumber = l; hay = true; }
  if (t !== null) { o.trophies     = t; hay = true; }
  if (r !== null) { o.rank         = r; hay = true; }
  return hay ? o : null;
}

/** {id, trophies, bestTrophies} de una temporada de leagueStatistics; null si ninguna celda trae dato. */
function _clLiga(id, trofeos, mejor) {
  var o = {}, hay = false;
  var i = String(id === undefined || id === null ? '' : id).trim();
  var t = _clNumero(trofeos), b = _clNumero(mejor);
  if (i !== '') { o.id = i; hay = true; }
  if (t !== null) { o.trophies = t; hay = true; }
  if (b !== null) { o.bestTrophies = b; hay = true; }
  return hay ? o : null;
}

// Devuelve {actual, anterior, mejor, ladder, ligaActual, ligaAnterior, ligaMejor} del CSV, o null si no hay fila/dato. [→ Contexto_Base_Web.md §33B006]
function _webCaminoLeyendasCsv(tag) {
  var tagLimpio = cleanTag(tag);
  if (!tagLimpio) return null;
  var rows;
  try {
    rows = _clCsvMemo().rows;
  } catch (e) {
    Logger.log('[WebAPI] No se pudo leer ' + CAMINO_LEYENDAS_CSV + ' (' + e.message + '); se usa el JSON.');
    return null;
  }
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (cleanTag(r[1]) !== tagLimpio) continue;
    var res = {
      actual:   _clTemporada(r[2], r[3], r[4]),
      anterior: _clTemporada(r[5], r[6], r[7]),
      mejor:    _clTemporada(r[8], r[9], r[10]),
      ladder:   _clNumero(r[11]),
      ligaActual:   _clLiga(r[12], r[13], r[14]),
      ligaAnterior: _clLiga(r[15], r[16], r[17]),
      ligaMejor:    _clLiga(r[18], r[19], r[20])
    };
    return (res.actual || res.anterior || res.mejor || res.ladder !== null ||
            res.ligaActual || res.ligaAnterior || res.ligaMejor) ? res : null;
  }
  return null;
}

// Pisa en `extra` (rawClash) lo que trae el CSV sin mutar el JSON cacheado; lo que el CSV no trae queda como el JSON. [→ Contexto_Base_Web.md §33B007]
function _webAplicarCaminoLeyendasCsv(extra, csv) {
  if (!csv) return;
  var mezclar = function (base, delCsv) {
    var out = {};
    if (base && typeof base === 'object') {
      for (var k in base) if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = base[k];
    }
    for (var c in delCsv) if (Object.prototype.hasOwnProperty.call(delCsv, c)) out[c] = delCsv[c];
    return out;
  };
  if (csv.actual)   extra.currentPathOfLegendSeasonResult = mezclar(extra.currentPathOfLegendSeasonResult, csv.actual);
  if (csv.anterior) extra.lastPathOfLegendSeasonResult    = mezclar(extra.lastPathOfLegendSeasonResult,    csv.anterior);
  if (csv.mejor)    extra.bestPathOfLegendSeasonResult    = mezclar(extra.bestPathOfLegendSeasonResult,    csv.mejor);
  if (csv.ladder !== null) extra.legacyTrophyRoadHighScore = csv.ladder;
  // leagueStatistics: cada temporada del CSV pisa la del JSON campo por campo.
  if (csv.ligaActual || csv.ligaAnterior || csv.ligaMejor) {
    var ls = mezclar(extra.leagueStatistics, {});
    if (csv.ligaActual)   ls.currentSeason  = mezclar(ls.currentSeason,  csv.ligaActual);
    if (csv.ligaAnterior) ls.previousSeason = mezclar(ls.previousSeason, csv.ligaAnterior);
    if (csv.ligaMejor)    ls.bestSeason     = mezclar(ls.bestSeason,     csv.ligaMejor);
    extra.leagueStatistics = ls;
  }
}
