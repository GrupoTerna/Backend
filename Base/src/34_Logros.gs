// 34_Logros.gs
// Logros (achievements de /players) en dos CSV, 
// con la misma dinámica que Cards/Cards_2 e Insignias/Insignias_2
// NUEVO (24-sep-2026, pedido del usuario)
//
// NUEVO 24-sep-2026: Logros en dos CSV (catálogo con Nombre/Info_es semi-manuales y marcador {objetivo}; por jugador, con relleno = Objetivo vacío). Mismos modos y merge que Cards_2/Insignias_2. [→ Contexto_Base_Web.md §34B001]

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 27-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Hoja Logros y Logros2: actualizar
//  Parte 2 — Funciones que no se corren a mano
//    - Logros: leer, guardar y tomar de la caché (lo usa updateLogrosSheet)
//    - Logros2: leer, armar y guardar el CSV (lo usa updateLogros2Sheet)
//    - Logros: respuestas web (CSV primero)
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

var LOGROS_CSV   = 'Backup_Logros.csv';

var LOGROS2_CSV  = 'Backup_Logros_2.csv';

var LOGROS_HEADERS  = ['N°', 'Name', 'Nombre', 'Info', 'Info_es'];

var LOGROS2_HEADERS = ['N°', 'Tag', 'Name', 'Nombre', 'Estrellas', 'Progreso', 'Objetivo', 'Info', 'Completado'];

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Hoja Logros y Logros2: actualizar -----

// Agrega al catálogo los logros nuevos (alfabético, al final) y completa Info si estaba vacía; nunca pisa Nombre ni borra filas. [→ Contexto_Base_Web.md §34B003]
function updateLogrosSheet() {
  if (PLAYERS_API_ENABLED !== false) _fetchPlayersData();

  var mapa = _getLogrosDesdeCache();
  var nombres = Object.keys(mapa).sort();
  if (nombres.length === 0) {
    Logger.log('[Logros] Sin logros en cache de jugadores. ' + LOGROS_CSV + ' queda tal cual.');
    return;
  }

  var csv = _leerLogrosCSV();
  var indice = {};
  for (var e = 0; e < csv.rows.length; e++) indice[String(csv.rows[e][1] || '').trim()] = e;

  var nuevas = 0, actualizadas = 0;
  for (var i = 0; i < nombres.length; i++) {
    var nm = nombres[i];
    if (indice[nm] !== undefined) {
      var fila = csv.rows[indice[nm]];
      if (!String(fila[3] || '').trim() && mapa[nm]) { fila[3] = mapa[nm]; actualizadas++; }
    } else {
      csv.rows.push(['', nm, '', mapa[nm], '']);
      nuevas++;
    }
  }

  _guardarLogrosCSV(csv.headers, csv.rows);
  Logger.log('[Logros] ' + LOGROS_CSV + ': ' + nuevas + ' logro(s) nuevo(s), ' + actualizadas + ' Info completada(s).');
}

function updateLogros2Sheet() {
  if (PLAYERS_API_ENABLED === false) {
    Logger.log('[Logros2] PLAYERS_API_ENABLED=false: no se actualiza ' + LOGROS2_CSV + '.');
    return;
  }
  var tags = _logrosTagsAActualizar();
  if (!tags || tags.length === 0) {
    Logger.log('[Logros2] Sin jugadores para actualizar');
    return;
  }
  var nuevas = _armarFilasLogros2ParaTags(tags);
  if (nuevas.length === 0) {
    Logger.log('[Logros2] Sin datos para escribir');
    return;
  }
  var csv = _leerLogros2CSV();
  var finales = _mergearCards2CSV(csv.rows, nuevas);
  _guardarLogros2CSV(csv.headers, finales);
  Logger.log('[Logros2] ' + LOGROS2_CSV + ' actualizado con merge para ' + tags.length +
    ' jugador(es). Nunca se vacía: el resto de tags conserva su fila anterior.');
}

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Logros: leer, guardar y tomar de la caché (lo usa updateLogrosSheet) -----

function _leerLogrosCSV() {
  var t = _loadCSVFromDrive(LOGROS_CSV);
  if (!t) return { headers: LOGROS_HEADERS.slice(), rows: [] };
  var p = _parseCSV(t);
  if (!p || p.length === 0) return { headers: LOGROS_HEADERS.slice(), rows: [] };
  var headers = p[0], rows = p.slice(1);
  // CSV creado antes de la columna Info_es: se completa el encabezado y las filas
  // (queda guardado en la próxima corrida de updateLogrosSheet()).
  for (var h = headers.length; h < LOGROS_HEADERS.length; h++) headers.push(LOGROS_HEADERS[h]);
  for (var r = 0; r < rows.length; r++) {
    while (rows[r].length < LOGROS_HEADERS.length) rows[r].push('');
  }
  return { headers: headers, rows: rows };
}

// Mapa name -> info (primera descripción no vacía) recorriendo el cache de /players de todos los jugadores. [→ Contexto_Base_Web.md §34B002]
function _getLogrosDesdeCache() {
  var mapa = {};
  var cache = (CACHE_CLAN_DATA && CACHE_CLAN_DATA._players) ? CACHE_CLAN_DATA._players : {};
  for (var tag in cache) {
    if (!Object.prototype.hasOwnProperty.call(cache, tag)) continue;
    var lista = (cache[tag] && cache[tag].achievements) || [];
    for (var k = 0; k < lista.length; k++) {
      var a = lista[k];
      var nm = a && a.name ? String(a.name).trim() : '';
      if (!nm) continue;
      if (!Object.prototype.hasOwnProperty.call(mapa, nm)) mapa[nm] = '';
      if (!mapa[nm] && a.info) mapa[nm] = String(a.info);
    }
  }
  return mapa;
}

function _guardarLogrosCSV(headers, rows) {
  for (var i = 0; i < rows.length; i++) rows[i][0] = i + 1;
  _saveCSVToDrive(LOGROS_CSV, _encodeCSV([headers].concat(rows)));
}

// ----- Logros2: leer, armar y guardar el CSV (lo usa updateLogros2Sheet) -----

function _leerLogros2CSV() {
  var t = _loadCSVFromDrive(LOGROS2_CSV);
  if (!t) return { headers: LOGROS2_HEADERS.slice(), rows: [] };
  var p = _parseCSV(t);
  if (!p || p.length === 0) return { headers: LOGROS2_HEADERS.slice(), rows: [] };
  return { headers: p[0], rows: p.slice(1) };
}

function _lgCelda(v) {
  return (v === undefined || v === null) ? '' : v;
}

function _getNombresLogrosConocidos() {
  var vistos = {}, lista = [];
  var cat = _leerLogrosCSV().rows;
  for (var i = 0; i < cat.length; i++) {
    var n = String(cat[i][1] || '').trim();
    if (n && !vistos[n]) { vistos[n] = true; lista.push(n); }
  }
  var nuevas = [];
  var cache = (CACHE_CLAN_DATA && CACHE_CLAN_DATA._players) ? CACHE_CLAN_DATA._players : {};
  for (var tag in cache) {
    if (!Object.prototype.hasOwnProperty.call(cache, tag)) continue;
    var ach = (cache[tag] && cache[tag].achievements) || [];
    for (var k = 0; k < ach.length; k++) {
      var nb = ach[k] && ach[k].name ? String(ach[k].name).trim() : '';
      if (nb && !vistos[nb]) { vistos[nb] = true; nuevas.push(nb); }
    }
  }
  nuevas.sort();
  return lista.concat(nuevas);
}

function _mapaNombresLogrosCatalogo(rows) {
  var mapa = {};
  for (var i = 0; i < rows.length; i++) {
    var nm = String(rows[i][1] || '').trim();
    var es = String(rows[i][2] || '').trim();
    if (nm && es && !Object.prototype.hasOwnProperty.call(mapa, nm)) mapa[nm] = es;
  }
  return mapa;
}

// Una fila por CADA logro conocido: el real del jugador o relleno (0/0/vacío). [→ Contexto_Base_Web.md §34B004]
function _armarFilasLogros2ParaTags(tags) {
  var filas = [];
  var nombreEs = _mapaNombresLogrosCatalogo(_leerLogrosCSV().rows);
  var conocidos = _getNombresLogrosConocidos();
  for (var i = 0; i < tags.length; i++) {
    var tag = tags[i];
    var pd = _getPlayerCache(tag);
    if (!pd) continue;

    var tiene = {};
    var lista = pd.achievements || [];
    for (var k = 0; k < lista.length; k++) {
      var a = lista[k];
      var nm = a && a.name ? String(a.name).trim() : '';
      if (!nm) continue;
      tiene[nm] = true;
      filas.push([
        '', tag, nm, nombreEs[nm] || '',
        _lgCelda(a.stars), _lgCelda(a.value), _lgCelda(a.target),
        _lgCelda(a.info), _lgCelda(a.completionInfo)
      ]);
    }
    for (var g = 0; g < conocidos.length; g++) {
      var c = conocidos[g];
      if (tiene[c]) continue;
      filas.push(['', tag, c, nombreEs[c] || '', 0, 0, '', '', '']);
    }
  }
  return filas;
}

// Tags a refrescar según PLAYERS_API_ENABLED (mismos 4 modos que Insignias_2/Cards_2). [→ Contexto_Base_Web.md §34B005]
function _logrosTagsAActualizar() {
  if (PLAYERS_API_ENABLED === false) return [];
  var ss = _getSs();
  _fetchPlayersData(); // memoizado; en modo 'admin' también va ANTES de mirar el cache

  if (PLAYERS_API_ENABLED === 'admin') {
    var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
    if (!shDir || shDir.getLastRow() < 2) return [];
    var dataDir = shDir.getRange(2, 1, shDir.getLastRow() - 1, DIR_SHEET_COLS).getValues();
    var admins = [];
    for (var i = 0; i < dataDir.length; i++) {
      var admin = String(dataDir[i][IC.ADMIN - 1] || '').trim();
      var tag = String(dataDir[i][IC.TAG - 1] || '').trim();
      if (admin === 'Sí' && tag && _getPlayerCache(tag)) admins.push(tag);
    }
    return admins;
  }
  if (PLAYERS_API_ENABLED === 'partial') return _getTagsParaPartialMode(ss);
  return _getTagsConPlayerCache();
}

function _guardarLogros2CSV(headers, rows) {
  for (var i = 0; i < rows.length; i++) rows[i][0] = i + 1;
  _saveCSVToDrive(LOGROS2_CSV, _encodeCSV([headers].concat(rows)));
}

// ----- Logros: respuestas web (CSV primero) -----

// Catálogo para la web { name: { nombre, infoEs } } desde Backup_Logros.csv; si no se puede leer devuelve {}. [→ Contexto_Base_Web.md §34B006]
function _webMapaNombreLogroPorName() {
  var mapa = {};
  try {
    var rows = _leerLogrosCSV().rows;
    for (var i = 0; i < rows.length; i++) {
      var nm = String(rows[i][1] || '').trim();
      if (!nm || Object.prototype.hasOwnProperty.call(mapa, nm)) continue;
      var es = String(rows[i][2] || '').trim();
      var ies = String(rows[i][4] || '').trim();
      if (es || ies) mapa[nm] = { nombre: es, infoEs: ies };
    }
  } catch (e) {
    Logger.log('[WebAPI] No se pudo leer ' + LOGROS_CSV + ' (' + e.message + '); se usa el JSON.');
  }
  return mapa;
}

// Copia del logro con nombreEs/infoEs ({objetivo} reemplazado por el target vigente) si el catálogo los tiene. [→ Contexto_Base_Web.md §34B007]
function _webConNombreLogroEs(a, catalogo) {
  if (!a || typeof a !== 'object' || !a.name) return a;
  var c = catalogo[String(a.name)];
  if (!c || (!c.nombre && !c.infoEs)) return a;
  var copia = {};
  for (var k in a) if (Object.prototype.hasOwnProperty.call(a, k)) copia[k] = a[k];
  if (c.nombre) copia.nombreEs = c.nombre;
  if (c.infoEs) {
    copia.infoEs = (a.target !== undefined && a.target !== null)
      ? c.infoEs.replace(/\{objetivo\}/g, String(a.target))
      : c.infoEs;
  }
  return copia;
}

// Arma achievements[] para perfil.html con Backup_Logros_2.csv primero (relleno ignorado) y el JSON de respaldo; devuelve copias. [→ Contexto_Base_Web.md §34B008]
function _webLogrosCsvPrimero(tag, logrosJson) {
  var tagLimpio = cleanTag(tag);
  if (!tagLimpio) return logrosJson;
  var num = function (v) {
    if (v === undefined || v === null || String(v).trim() === '') return null;
    var n = Number(String(v).trim().replace(/,/g, ''));
    return isNaN(n) ? null : n;
  };
  var porNombre = {}, ordenCsv = [];
  try {
    var rows = _leerLogros2CSV().rows;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (cleanTag(r[1]) !== tagLimpio) continue;
      var nm = String(r[2] || '').trim();
      if (!nm) continue;
      if (num(r[6]) === null) continue; // Objetivo vacío = relleno (no lo tiene)
      if (!Object.prototype.hasOwnProperty.call(porNombre, nm)) ordenCsv.push(nm);
      porNombre[nm] = {
        stars: num(r[4]), value: num(r[5]), target: num(r[6]),
        info: String(r[7] || '').trim(), completionInfo: String(r[8] || '').trim()
      };
    }
  } catch (e) {
    Logger.log('[WebAPI] No se pudo leer ' + LOGROS2_CSV + ' (' + e.message + '); se usa el JSON.');
    return logrosJson;
  }
  if (ordenCsv.length === 0) return logrosJson;

  var aplicar = function (base, reg) {
    var out = {};
    for (var k in base) if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = base[k];
    if (reg.stars  !== null) out.stars  = reg.stars;
    if (reg.value  !== null) out.value  = reg.value;
    if (reg.target !== null) out.target = reg.target;
    if (reg.info) out.info = reg.info;
    if (reg.completionInfo) out.completionInfo = reg.completionInfo;
    return out;
  };

  var salida = [], usados = {};
  var base = Array.isArray(logrosJson) ? logrosJson : [];
  for (var j = 0; j < base.length; j++) {
    var a = base[j];
    var n = a && a.name ? String(a.name).trim() : '';
    if (n && porNombre[n]) { salida.push(aplicar(a, porNombre[n])); usados[n] = true; }
    else salida.push(a);
  }
  for (var c = 0; c < ordenCsv.length; c++) {
    if (usados[ordenCsv[c]]) continue;
    salida.push(aplicar({ name: ordenCsv[c] }, porNombre[ordenCsv[c]]));
  }
  return salida;
}
