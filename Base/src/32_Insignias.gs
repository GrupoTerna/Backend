// ==============================================================================
// 32_Insignias.gs
// Datos de insignias/badges de jugador (Backup_Insignias.csv y Backup_Insignias_2.csv).
// ==============================================================================

// Mismo patrón de almacenamiento que Backup_Cards.csv/Backup_Cards_2.csv [→ Contexto_Base_Web.md §32B001]

// A) DATOS DE INSIGNIAS: Backup_Insignias.csv (catálogo) y Backup_Insignias_2.csv (por jugador) [→ Contexto_Base_Web.md §32B002]

/**
 * _leerInsigniasCSV() [→ Contexto_Base_Web.md §32B003]
 */
function _leerInsigniasCSV() {
  var headersDefault = ['N°', 'Name', 'Nombre', 'Nivel', 'Nivel_max', 'Objetivo', 'Ícono'];
  var csvText = _loadCSVFromDrive('Backup_Insignias.csv');
  if (!csvText) return { headers: headersDefault, rows: [] };

  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length === 0) return { headers: headersDefault, rows: [] };

  return { headers: parsed[0], rows: parsed.slice(1) };
}

/**
 * _guardarInsigniasCSV(headers, rows) [→ Contexto_Base_Web.md §32B004]
 */
function _guardarInsigniasCSV(headers, rows) {
  rows = _ordenarFilasCatalogoInsignias(rows);
  for (var i = 0; i < rows.length; i++) rows[i][0] = i + 1;
  _saveCSVToDrive('Backup_Insignias.csv', _encodeCSV([headers].concat(rows)));
}

/**
 * _ordenarFilasCatalogoInsignias(rows) [→ Contexto_Base_Web.md §32B005]
 */
function _ordenarFilasCatalogoInsignias(rows) {
  var ordenInsignia = {};
  var siguiente = 0;
  var conPos = [];
  for (var i = 0; i < rows.length; i++) {
    var n = String(rows[i][1] || '').trim();
    if (!Object.prototype.hasOwnProperty.call(ordenInsignia, n)) ordenInsignia[n] = siguiente++;
    conPos.push({ fila: rows[i], pos: i, nombre: n });
  }
  conPos.sort(function (a, b) {
    if (ordenInsignia[a.nombre] !== ordenInsignia[b.nombre]) return ordenInsignia[a.nombre] - ordenInsignia[b.nombre];
    var la = Number(a.fila[3]) || 0;
    var lb = Number(b.fila[3]) || 0;
    if (la !== lb) return la - lb;
    return a.pos - b.pos;
  });
  var salida = [];
  for (var k = 0; k < conPos.length; k++) salida.push(conPos[k].fila);
  return salida;
}

/**
 * _leerInsignias2CSV() [→ Contexto_Base_Web.md §32B006]
 */
function _leerInsignias2CSV() {
  var headersDefault = ['N°', 'Tag', 'Name', 'Nombre', 'Progreso', 'Nivel'];
  var csvText = _loadCSVFromDrive('Backup_Insignias_2.csv');
  if (!csvText) return { headers: headersDefault, rows: [] };

  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length === 0) return { headers: headersDefault, rows: [] };

  return { headers: parsed[0], rows: parsed.slice(1) };
}

/**
 * _guardarInsignias2CSV(headers, rows)
 * Renumera la columna N° (índice 0) y guarda Backup_Insignias_2.csv completo.
 */
function _guardarInsignias2CSV(headers, rows) {
  for (var i = 0; i < rows.length; i++) rows[i][0] = i + 1;
  _saveCSVToDrive('Backup_Insignias_2.csv', _encodeCSV([headers].concat(rows)));
}

// TRADUCCIÓN AUTOMÁTICA DE INSIGNIAS DE MAESTRÍA (contra Backup_Cards.csv) [→ Contexto_Base_Web.md §32B007]

/**
 * _extraerNombreCartaDeInsigniaMastery(nombreInsignia) [→ Contexto_Base_Web.md §32B008]
 */
function _extraerNombreCartaDeInsigniaMastery(nombreInsignia) {
  var n = String(nombreInsignia || '').trim();
  if (n.indexOf('Mastery') !== 0) return null; // no es una insignia de maestría
  var resto = n.substring('Mastery'.length).trim();
  return resto || null; // "Mastery" solo, sin nombre de carta detrás -> null
}

/**
 * _normalizarClaveInsignia(texto) [→ Contexto_Base_Web.md §32B009]
 */
function _normalizarClaveInsignia(texto) {
  return String(texto || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Memo por ejecución del mapa nombre-de-carta -> Nombre en español (ver [→ Contexto_Base_Web.md §32B010]
var _INSIGNIAS_MAPA_CARTAS_MEMO = null;

/**
 * _getMapaCartasEs() [→ Contexto_Base_Web.md §32B011]
 */
function _getMapaCartasEs() {
  if (_INSIGNIAS_MAPA_CARTAS_MEMO) return _INSIGNIAS_MAPA_CARTAS_MEMO;
  var mapa = {};
  var csv = _leerCardsCSV(); // definida en 31_Cards_Mazos.gs
  for (var i = 0; i < csv.rows.length; i++) {
    var clave = _normalizarClaveInsignia(csv.rows[i][2]);
    var es = String(csv.rows[i][3] || '').trim();
    if (clave && es && !mapa[clave]) mapa[clave] = es;
  }
  _INSIGNIAS_MAPA_CARTAS_MEMO = mapa;
  return mapa;
}

/**
 * _buscarTraduccionCartaPorNombre(nombreCartaIngles) [→ Contexto_Base_Web.md §32B012]
 */
function _buscarTraduccionCartaPorNombre(nombreCartaIngles) {
  var clave = _normalizarClaveInsignia(nombreCartaIngles);
  if (!clave) return '';
  return _getMapaCartasEs()[clave] || '';
}

/**
 * _traducirNombreInsignia(nombreInsignia) [→ Contexto_Base_Web.md §32B013]
 */
function _traducirNombreInsignia(nombreInsignia) {
  var nombreCarta = _extraerNombreCartaDeInsigniaMastery(nombreInsignia);
  if (!nombreCarta) return ''; // insignia particular, no genérica de maestría
  return _buscarTraduccionCartaPorNombre(nombreCarta);
}

/**
 * _construirMapaNombresCatalogo(rows) [→ Contexto_Base_Web.md §32B014]
 */
function _construirMapaNombresCatalogo(rows) {
  var mapa = {};
  for (var i = 0; i < rows.length; i++) {
    var nm = String(rows[i][1] || '').trim();
    var es = String(rows[i][2] || '').trim();
    if (nm && es && !Object.prototype.hasOwnProperty.call(mapa, nm)) mapa[nm] = es;
  }
  return mapa;
}

/**
 * _resolverNombreInsignia(nombreInsignia, mapaCatalogo) [→ Contexto_Base_Web.md §32B015]
 */
function _resolverNombreInsignia(nombreInsignia, mapaCatalogo) {
  var n = String(nombreInsignia || '').trim();
  if (mapaCatalogo && Object.prototype.hasOwnProperty.call(mapaCatalogo, n)) return mapaCatalogo[n];
  return _traducirNombreInsignia(n);
}

// SINCRONIZACIÓN REAL DESDE EL CACHE DE /players [→ Contexto_Base_Web.md §32B016]

// ----- Funciones manuales / punto de entrada -----

/**
 * updateInsigniasSheet() [→ Contexto_Base_Web.md §32B017]
 */
function updateInsigniasSheet() {
  // Asegura los perfiles de /players (memoizado: no repite peticiones si
  // ya se obtuvieron antes en esta misma ejecución).
  if (PLAYERS_API_ENABLED !== false) _fetchPlayersData();

  var badgeMap = _getInsigniasDesdeCache();
  if (!badgeMap || Object.keys(badgeMap).length === 0) {
    Logger.log('[Insignias] Sin datos de insignias en cache de jugadores. Backup_Insignias.csv queda tal cual.');
    return;
  }

  var csv = _leerInsigniasCSV();

  // Índice de filas ya existentes, por "Name|Nivel" -> índice en csv.rows.
  // cols: 0=N°, 1=Name, 2=Nombre, 3=Nivel, 4=Nivel_max, 5=Objetivo, 6=Ícono
  var indiceExistente = {};
  for (var e = 0; e < csv.rows.length; e++) {
    var keyExist = String(csv.rows[e][1] || '').trim() + '|' + String(csv.rows[e][3] || '').trim();
    indiceExistente[keyExist] = e;
  }

  // Traducciones ya escritas en el catálogo (a mano o auto-traducidas antes),
  // por insignia: las filas nuevas/vacías de la MISMA insignia las heredan.
  var nombrePorInsignia = _construirMapaNombresCatalogo(csv.rows);

  var nombresInsignia = Object.keys(badgeMap).sort();
  var filasNuevas = 0;
  var filasActualizadas = 0;

  for (var i = 0; i < nombresInsignia.length; i++) {
    var name = nombresInsignia[i];
    var info = badgeMap[name]; // { maxLevel, niveles: { nivel: {objetivo, icono} } }
    var maxLevel = Number(info.maxLevel) || 0;
    if (maxLevel <= 0) continue; // sin maxLevel no se puede reservar nada

    // Reservar TODAS las filas 1..maxLevel para esta insignia, exista o no
    // ya observación puntual de cada nivel.
    for (var nivel = 1; nivel <= maxLevel; nivel++) {
      var key = name + '|' + nivel;
      var observado = info.niveles[nivel]; // {objetivo, icono} o undefined

      if (indiceExistente[key] !== undefined) {
        var fila = csv.rows[indiceExistente[key]];
        var cambio = false;

        if (String(fila[4] || '') !== String(maxLevel)) { fila[4] = maxLevel; cambio = true; }

        if (observado) {
          if (observado.objetivo !== '' && String(fila[5] || '') !== String(observado.objetivo)) {
            fila[5] = observado.objetivo; cambio = true;
          }
          if (observado.icono && fila[6] !== observado.icono) {
            fila[6] = observado.icono; cambio = true;
          }
        }

        if (!String(fila[2] || '').trim()) {
          var traduccion = _resolverNombreInsignia(name, nombrePorInsignia);
          if (traduccion) { fila[2] = traduccion; cambio = true; }
        }

        if (cambio) filasActualizadas++;
      } else {
        csv.rows.push([
          '',                                    // N° (se asigna en _guardarInsigniasCSV)
          name,                                   // Name
          _resolverNombreInsignia(name, nombrePorInsignia), // Nombre (heredado del catálogo; vacío si no hay)
          nivel,                                  // Nivel
          maxLevel,                               // Nivel_max
          observado ? observado.objetivo : '',    // Objetivo (vacío hasta observarse)
          observado ? observado.icono    : ''     // Ícono (vacío hasta observarse)
        ]);
        filasNuevas++;
      }
    }
  }

  if (filasNuevas === 0 && filasActualizadas === 0) {
    Logger.log('[Insignias] Sin cambios para Backup_Insignias.csv (' + nombresInsignia.length + ' insignia(s) revisada(s)).');
    return;
  }

  _guardarInsigniasCSV(csv.headers, csv.rows);
  Logger.log('[Insignias] Backup_Insignias.csv: ' + filasNuevas + ' fila(s) nueva(s), ' +
             filasActualizadas + ' fila(s) actualizada(s) (' + nombresInsignia.length + ' insignia(s) revisada(s)).');
}

/**
 * updateInsignias2Sheet() [→ Contexto_Base_Web.md §32B018]
 */
function updateInsignias2Sheet() {
  if (PLAYERS_API_ENABLED === false) {
    Logger.log('[Insignias2] PLAYERS_API_ENABLED=false: no se actualiza Backup_Insignias_2.csv (sin llamadas a /players para nadie).');
    return;
  }

  if (PLAYERS_API_ENABLED === 'admin') {
    _actualizarInsignias2SoloAdmins();
    return;
  }

  var ss = _getSs();

  // Asegura los perfiles de /players (memoizado: no repite peticiones si
  // ya se obtuvieron antes en esta misma ejecución).
  _fetchPlayersData();

  var tags = [];
  if (PLAYERS_API_ENABLED === true) {
    tags = _getTagsConPlayerCache(); // definida en 31_Cards_Mazos.gs
  } else if (PLAYERS_API_ENABLED === 'partial') {
    tags = _getTagsParaPartialMode(ss); // definida en 31_Cards_Mazos.gs
  }

  if (!tags || tags.length === 0) {
    Logger.log('[Insignias2] Sin jugadores para actualizar');
    return;
  }

  var todasFilas = _armarFilasInsignias2ParaTags(tags);
  if (todasFilas.length === 0) {
    Logger.log('[Insignias2] Sin datos para escribir');
    return;
  }

  // FIX de diseño (mismo criterio que updateCards2Sheet(), 04/06-ago-2026): [→ Contexto_Base_Web.md §32B019]
  var csv = _leerInsignias2CSV();
  var filasFinales = _mergearCards2CSV(csv.rows, todasFilas);
  _guardarInsignias2CSV(csv.headers, filasFinales);
  Logger.log('[Insignias2] Backup_Insignias_2.csv actualizado con merge para ' + tags.length + ' jugador(es) (modo ' +
    (PLAYERS_API_ENABLED === true ? 'TRUE' : 'PARTIAL') + '). Nunca se vacía: el resto de tags conserva su fila anterior.');
}

// ----- Funciones internas / helpers -----

/**
 * _getInsigniasDesdeCache() [→ Contexto_Base_Web.md §32B020]
 */
function _getInsigniasDesdeCache() {
  var map = {};
  for (var i = 0; i < CFG.TERNA_TAGS.length; i++) {
    var cd = _getClanCache(CFG.TERNA_TAGS[i]);
    if (!cd || !cd.members) continue;
    for (var j = 0; j < cd.members.length; j++) {
      var pd = _getPlayerCache(cd.members[j].tag);
      if (!pd || !pd.badges || pd.badges.length === 0) continue;

      for (var k = 0; k < pd.badges.length; k++) {
        var b = pd.badges[k];
        if (!b.name) continue;

        // FIX (27-sep-2026, pedido usuario -- "CrazyArenaBadge1 y 2025YearBadge [→ Contexto_Base_Web.md §32B021]
        var maxLevel = Number(b.maxLevel) || 0;
        var nivel = Number(b.level) || 0;
        if (maxLevel <= 0 && nivel <= 0) {
          maxLevel = 1;
          nivel = 1;
        } else if (maxLevel <= 0) {
          continue; // caso raro: trae nivel pero no maxLevel -- no se puede reservar 1..maxLevel
        }

        if (!map[b.name]) map[b.name] = { maxLevel: maxLevel, niveles: {} };
        // Por seguridad, si algún jugador reportara un maxLevel distinto [→ Contexto_Base_Web.md §32B022]
        if (maxLevel > map[b.name].maxLevel) map[b.name].maxLevel = maxLevel;

        if (nivel < 1) continue; // nivel 0 no aporta ícono/objetivo real que reservar

        var iconUrls = b.iconUrls || {};
        map[b.name].niveles[nivel] = {
          objetivo: b.target !== undefined ? b.target : '',
          icono:    iconUrls.large || ''
        };
      }
    }
  }
  return map;
}

/**
 * _getNombresInsigniasConocidas() [→ Contexto_Base_Web.md §32B023]
 */
function _getNombresInsigniasConocidas() {
  var vistos = {};
  var lista = [];
  var cat = _leerInsigniasCSV().rows;
  for (var i = 0; i < cat.length; i++) {
    var n = String(cat[i][1] || '').trim();
    if (n && !vistos[n]) { vistos[n] = true; lista.push(n); }
  }
  var nuevas = [];
  var cache = (CACHE_CLAN_DATA && CACHE_CLAN_DATA._players) ? CACHE_CLAN_DATA._players : {};
  for (var tag in cache) {
    if (!Object.prototype.hasOwnProperty.call(cache, tag)) continue;
    var badges = (cache[tag] && cache[tag].badges) || [];
    for (var k = 0; k < badges.length; k++) {
      var nb = badges[k] && badges[k].name ? String(badges[k].name).trim() : '';
      if (nb && !vistos[nb]) { vistos[nb] = true; nuevas.push(nb); }
    }
  }
  nuevas.sort();
  return lista.concat(nuevas);
}

/**
 * _armarFilasInsignias2ParaTags(tags) [→ Contexto_Base_Web.md §32B024]
 */
function _armarFilasInsignias2ParaTags(tags) {
  var todasFilas = [];
  // Catálogo leído UNA vez (no por insignia ni por jugador): es la fuente de
  // la columna Nombre (ver _construirMapaNombresCatalogo()).
  var nombrePorInsignia = _construirMapaNombresCatalogo(_leerInsigniasCSV().rows);
  var nombresConocidos = _getNombresInsigniasConocidas();
  for (var i = 0; i < tags.length; i++) {
    var tag = tags[i];
    var pd = _getPlayerCache(tag);
    if (!pd) continue;

    var tiene = {};
    var badges = pd.badges || [];
    for (var k = 0; k < badges.length; k++) {
      var b = badges[k];
      if (!b.name) continue;
      tiene[String(b.name).trim()] = true;

      todasFilas.push([
        '',                                   // N°
        tag,                                  // Tag
        b.name,                               // Name
        _resolverNombreInsignia(b.name, nombrePorInsignia), // Nombre (desde el catálogo; vacío si no hay)
        b.progress !== undefined ? b.progress : '', // Progreso
        // FIX (27-sep-2026, mismo caso que _getInsigniasDesdeCache(), más [→ Contexto_Base_Web.md §32B025]
        b.level !== undefined ? b.level : (b.maxLevel === undefined ? 1 : '') // Nivel
      ]);
    }

    // Relleno: las insignias conocidas que este jugador no tiene.
    for (var g = 0; g < nombresConocidos.length; g++) {
      var nombre = nombresConocidos[g];
      if (tiene[nombre]) continue;
      todasFilas.push([
        '',
        tag,
        nombre,
        _resolverNombreInsignia(nombre, nombrePorInsignia),
        0,                                    // Progreso
        0                                     // Nivel
      ]);
    }
  }
  return todasFilas;
}

/**
 * _actualizarInsignias2SoloAdmins() [→ Contexto_Base_Web.md §32B026]
 */
function _actualizarInsignias2SoloAdmins() {
  var ss = _getSs();
  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!shDir) {
    Logger.log('[Insignias2] Directorio no encontrado');
    return;
  }

  var lastRowDir = shDir.getLastRow();
  if (lastRowDir < 2) {
    Logger.log('[Insignias2] Directorio vacío');
    return;
  }

  var dataDir = shDir.getRange(2, 1, lastRowDir - 1, DIR_SHEET_COLS).getValues();
  var tagsAdmin = [];

  for (var i = 0; i < dataDir.length; i++) {
    var admin = String(dataDir[i][IC.ADMIN - 1] || '').trim();
    var tag = String(dataDir[i][IC.TAG - 1] || '').trim();
    if (admin === 'Sí' && tag) tagsAdmin.push(tag);
  }

  if (tagsAdmin.length === 0) {
    Logger.log('[Insignias2] No hay ningún admin marcado en Directorio, nada que actualizar.');
    return;
  }

  // IMPORTANTE: se llama _fetchPlayersData() ANTES de revisar la cache [→ Contexto_Base_Web.md §32B027]
  _fetchPlayersData();

  var adminsConDatos = [];
  for (var a = 0; a < tagsAdmin.length; a++) {
    if (_getPlayerCache(tagsAdmin[a])) adminsConDatos.push(tagsAdmin[a]);
  }

  if (adminsConDatos.length === 0) {
    Logger.log('[Insignias2] Se consultó /players para ' + tagsAdmin.length + ' admin(es) pero ninguno devolvió datos (posible error de API).');
    return;
  }

  var todasFilas = _armarFilasInsignias2ParaTags(adminsConDatos);
  if (todasFilas.length === 0) return;

  var csv = _leerInsignias2CSV();
  var filasFinales = _mergearCards2CSV(csv.rows, todasFilas);
  _guardarInsignias2CSV(csv.headers, filasFinales);
  Logger.log('[Insignias2] Backup_Insignias_2.csv actualizado: ' + adminsConDatos.length + ' admin(es) (modo ADMIN, preservando no-admins).');
}