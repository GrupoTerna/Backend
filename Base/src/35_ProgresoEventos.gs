// 35_ProgresoEventos.gs
// CSV exclusivo de progress{} (modos rotativos: Táctica Royale, Princesa Sorpresa, etc.); no toca Camino de trofeos ni Camino de Leyendas (ver 33). [→ Contexto_Base_Web.md §35B001]
// NUEVO (24-sep-2026, pedido del usuario)
//
// progress{} no tiene columnas fijas: una fila por jugador + clave de evento (8 columnas, patrón de Logros_2); merge reemplaza TODAS las filas de cada tag actualizado; modos como el resto. [→ Contexto_Base_Web.md §35B002]

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 27-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Hoja Progreso de eventos: actualizar
//  Parte 2 — Funciones que no se corren a mano
//    - Progreso de eventos: leer, armar y guardar el CSV (lo usa updateProgresoEventosSheet)
//    - Progreso de eventos: respuestas web (CSV primero)
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

var PROGRESO_EVENTOS_CSV = 'Backup_ProgresoEventos.csv';

var PROGRESO_EVENTOS_HEADERS = [
  'N°', 'Tag', 'Clave',
  'Arena_Id', 'Arena_Nombre', 'Arena_RawName',
  'Trofeos', 'Mejor_Trofeos'
];

var _PE_CSV_MEMO = null; // memo por ejecución: el CSV se lee 1 sola vez

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Hoja Progreso de eventos: actualizar -----

// Actualiza el CSV según PLAYERS_API_ENABLED; el merge reemplaza todas las filas de cada tag actualizado. [→ Contexto_Base_Web.md §35B004]
function updateProgresoEventosSheet() {
  if (PLAYERS_API_ENABLED === false) {
    Logger.log('[ProgresoEventos] PLAYERS_API_ENABLED=false: no se actualiza ' + PROGRESO_EVENTOS_CSV + '.');
    return;
  }

  if (PLAYERS_API_ENABLED === 'admin') {
    _actualizarProgresoEventosSoloAdmins();
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
    Logger.log('[ProgresoEventos] Sin jugadores para actualizar');
    return;
  }

  // OJO: `nuevas` puede quedar vacía sin ser error; caso extremo documentado (si nadie tiene progress{}, no se reemplaza nada). [→ Contexto_Base_Web.md §35B005]
  var nuevas = _armarFilasProgresoEventosParaTags(tags);

  var csv = _leerProgresoEventosCSV();
  var finales = _mergearCards2CSV(csv.rows, nuevas);
  _guardarProgresoEventosCSV(csv.headers, finales);
  Logger.log('[ProgresoEventos] ' + PROGRESO_EVENTOS_CSV + ' actualizado con merge para ' + tags.length +
    ' jugador(es) (' + nuevas.length + ' fila(s) de eventos). Nunca se vacía: el resto de tags conserva sus filas anteriores.');
}

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Progreso de eventos: leer, armar y guardar el CSV (lo usa updateProgresoEventosSheet) -----

function _leerProgresoEventosCSV() {
  var csvText = _loadCSVFromDrive(PROGRESO_EVENTOS_CSV);
  if (!csvText) return { headers: PROGRESO_EVENTOS_HEADERS.slice(), rows: [] };
  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length === 0) return { headers: PROGRESO_EVENTOS_HEADERS.slice(), rows: [] };
  var headers = parsed[0], rows = parsed.slice(1);
  for (var h = headers.length; h < PROGRESO_EVENTOS_HEADERS.length; h++) headers.push(PROGRESO_EVENTOS_HEADERS[h]);
  for (var r = 0; r < rows.length; r++) {
    while (rows[r].length < PROGRESO_EVENTOS_HEADERS.length) rows[r].push('');
  }
  return { headers: headers, rows: rows };
}

function _peCelda(v) {
  return (v === undefined || v === null) ? '' : v;
}

// Una fila por cada clave de pd.progress; sin relleno (clave ausente = el jugador no participó). [→ Contexto_Base_Web.md §35B003]
function _armarFilasProgresoEventos(tag, pd) {
  var filas = [];
  var prog = pd.progress;
  if (!prog || typeof prog !== 'object') return filas;
  for (var clave in prog) {
    if (!Object.prototype.hasOwnProperty.call(prog, clave)) continue;
    var ev = prog[clave] || {};
    var arena = ev.arena || {};
    filas.push([
      '', tag, clave,
      _peCelda(arena.id), _peCelda(arena.name), _peCelda(arena.rawName),
      _peCelda(ev.trophies), _peCelda(ev.bestTrophies)
    ]);
  }
  return filas;
}

function _armarFilasProgresoEventosParaTags(tags) {
  var filas = [];
  for (var i = 0; i < tags.length; i++) {
    var pd = _getPlayerCache(tags[i]);
    if (!pd) continue;
    filas = filas.concat(_armarFilasProgresoEventos(tags[i], pd));
  }
  return filas;
}

/** Renumera la columna N° (índice 0) y guarda el CSV completo. */
function _guardarProgresoEventosCSV(headers, rows) {
  for (var i = 0; i < rows.length; i++) rows[i][0] = i + 1;
  _saveCSVToDrive(PROGRESO_EVENTOS_CSV, _encodeCSV([headers].concat(rows)));
}

// Modo 'admin': actualiza solo filas de admins y preserva el resto. [→ Contexto_Base_Web.md §35B006]
function _actualizarProgresoEventosSoloAdmins() {
  var ss = _getSs();
  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!shDir || shDir.getLastRow() < 2) {
    Logger.log('[ProgresoEventos] Directorio no encontrado o vacío');
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
    Logger.log('[ProgresoEventos] No hay ningún admin marcado en Directorio, nada que actualizar.');
    return;
  }

  _fetchPlayersData(); // ANTES de revisar el cache (mismo fix que Cards_2/Insignias_2/CaminoLeyendas/PerfilWeb)

  var nuevas = _armarFilasProgresoEventosParaTags(tagsAdmin);

  var csv = _leerProgresoEventosCSV();
  var finales = _mergearCards2CSV(csv.rows, nuevas);
  _guardarProgresoEventosCSV(csv.headers, finales);
  Logger.log('[ProgresoEventos] ' + PROGRESO_EVENTOS_CSV + ' actualizado: ' + tagsAdmin.length +
    ' admin(es) revisado(s), ' + nuevas.length + ' fila(s) de eventos (modo ADMIN, preservando no-admins).');
}

// ----- Progreso de eventos: respuestas web (CSV primero) -----

function _peCsvMemo() {
  if (!_PE_CSV_MEMO) _PE_CSV_MEMO = _leerProgresoEventosCSV();
  return _PE_CSV_MEMO;
}

function _peNumero(v) {
  if (v === undefined || v === null) return null;
  var s = String(v).trim().replace(/,/g, '');
  if (s === '') return null;
  var n = Number(s);
  return isNaN(n) ? null : n;
}

// Arma progress{} desde el CSV (misma forma que el JSON), o null si el tag no tiene filas. [→ Contexto_Base_Web.md §35B007]
function _webProgresoEventosCsv(tag) {
  var tagLimpio = cleanTag(tag);
  if (!tagLimpio) return null;
  var rows;
  try {
    rows = _peCsvMemo().rows;
  } catch (e) {
    Logger.log('[WebAPI] No se pudo leer ' + PROGRESO_EVENTOS_CSV + ' (' + e.message + '); se usa el JSON.');
    return null;
  }
  var out = null;
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (cleanTag(r[1]) !== tagLimpio) continue;
    var clave = r[2] !== undefined ? String(r[2]) : '';
    var arena = {};
    var hayArena = false;
    if (String(r[3] || '').trim() !== '') { arena.id = _peNumero(r[3]); hayArena = true; }
    if (String(r[4] || '').trim() !== '') { arena.name = String(r[4]); hayArena = true; }
    if (String(r[5] || '').trim() !== '') { arena.rawName = String(r[5]); hayArena = true; }
    var trofeos = _peNumero(r[6]);
    var mejor = _peNumero(r[7]);
    if (!hayArena && trofeos === null && mejor === null) continue; // fila vacía, se ignora
    var entrada = {};
    if (hayArena) entrada.arena = arena;
    if (trofeos !== null) entrada.trophies = trofeos;
    if (mejor   !== null) entrada.bestTrophies = mejor;
    if (!out) out = {};
    out[clave] = entrada;
  }
  return out;
}

// FIX 27-sep-2026: normaliza arena.name de cada evento con _resolverArenaDesdeCatalogo(); solo toca arena.name. [→ Contexto_Base_Web.md §35B008]
function _webResolverArenaEsEnProgreso(extra) {
  if (!extra || !extra.progress || typeof extra.progress !== 'object') return;
  for (var clave in extra.progress) {
    if (!Object.prototype.hasOwnProperty.call(extra.progress, clave)) continue;
    var entrada = extra.progress[clave];
    if (entrada && entrada.arena && entrada.arena.rawName) {
      entrada.arena.name = _resolverArenaDesdeCatalogo(entrada.arena.rawName);
    }
  }
}

// El CSV pisa por completo extra.progress (set fresco); al final siempre se resuelve el nombre de arena (FIX 27-sep-2026). [→ Contexto_Base_Web.md §35B009]
function _webAplicarProgresoEventosCsv(extra, csv) {
  if (csv) extra.progress = csv;
  _webResolverArenaEsEnProgreso(extra);
}
