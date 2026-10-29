// ==============================================================================
// 09_API_ClashRoyale.gs
// Consulta y cacheo de datos de la API de Clash Royale: cache en memoria (por
// ejecucion) y cache persistente en Drive (para el Generador/Tampermonkey).
// ==============================================================================

// ----- Variables y constantes -----

// Servicio de API: cache global CACHE_CLAN_DATA, _fetchAllClanData() y _apiGet(). [→ Contexto_Base_Web.md §09B001]

// CACHE GLOBAL [→ Contexto_Base_Web.md §09B002]
var CACHE_CLAN_DATA = null;

// FIX (02-oct-2026): tags cuyo /currentriverrace falló en la última [→ Contexto_Base_Web.md §09B003]
var CLANES_SIN_RIVERRACE = [];

// Memoización DENTRO DE UNA MISMA EJECUCIÓN de Apps Script (se resetea [→ Contexto_Base_Web.md §09B004]
var _clanesBasicoListoEnEstaEjecucion = false;

var _playersCompletoEnEstaEjecucion   = false;

// _apiGet() - Función base de petición HTTP [→ Contexto_Base_Web.md §09B005]

var API_GET_MAX_INTENTOS = 3;

var API_GET_ESPERA_BASE_MS = 3000; // espera = API_GET_ESPERA_BASE_MS * intento (3s, 6s)

// FIX (12-sep-2026): espera base específica para HTTP 429 — más generosa que [→ Contexto_Base_Web.md §09B006]
var API_GET_ESPERA_429_MS = 5000; // espera = API_GET_ESPERA_429_MS * intento (5s, 10s), salvo Retry-After

// ENDPOINTS A CACHEAR [→ Contexto_Base_Web.md §09B007]
var CACHE_ENDPOINTS = [
  {
    key:  'clans',
    path: function(tag) { return '/clans/' + encodeTag(tag); }
  },
  {
    key:  'currentriverrace',
    path: function(tag) { return '/clans/' + encodeTag(tag) + '/currentriverrace'; }
  }
];

// Endpoint individual de jugadores (se gestiona por separado porque usa player tags)
var CACHE_ENDPOINT_PLAYER = {
  key:  'players',
  path: function(tag) { return '/players/' + encodeTag(tag); }
};

// CACHE EN MEMORIA (sesión actual de ejecución) [→ Contexto_Base_Web.md §09B008]
var _DRIVE_CACHE_MEM = {};

// PF091 (17-oct-2026): estado de la captura de clanes en ESTA ejecucion. _clanesBasicoDesdeApiEnEstaEjecucion = true solo si
// _fetchClanesBasico() pidio a la API (no si reutilizo el checkpoint); CLANES_INFO_RESPALDO = tags cuyo /clans salio del
// respaldo del checkpoint por falla de la API (no son datos frescos y no se escriben como JSON);
// _jsonClanesEscritosEnEstaEjecucion evita escribir dos veces los mismos JSON; _jsonClanesUltimoTotal = cuantos se escribieron.
var _clanesBasicoDesdeApiEnEstaEjecucion = false;
var CLANES_INFO_RESPALDO = [];
var _jsonClanesEscritosEnEstaEjecucion = false;
var _jsonClanesUltimoTotal = 0;
// PF091 etapa 4 (17-oct-2026): mientras _guardarJsonClanesDesdeCaptura_() escribe los JSON de la captura, esta variable es un arreglo y
// _guardarCacheEnDrive() anota ahi el nombre de cada archivo en vez de agregar una entrada a Log_ScriptTerna.json por archivo (cada
// entrada lee y reescribe todo el log, ~3 s). Al terminar se registra UNA sola entrada. Fuera de la captura vale null (se registra cada uno).
var _logJsonCapturaAcumulado_ = null;

// AVISOS ABIERTOS / VERIFICACIONES ABIERTAS [→ Contexto_Base_Web.md §09B009]

// AVISOS ABIERTOS / VERIFICACIONES ABIERTAS — pregunta 51, tanda 2: CSV de battlelogs [→ Contexto_Base_Web.md §09B010]

// AVISOS ABIERTOS / VERIFICACIONES ABIERTAS — pregunta 52: periodIndex POR CLAN [→ Contexto_Base_Web.md §09B011]

// AVISOS ABIERTOS / VERIFICACIONES ABIERTAS — FASE B: JSON sueltos -> "Otros" [→ Contexto_Base_Web.md §09B012]

// Claves normalizadas (ver _normalizarNombreClan_) -> ID de la subcarpeta de [→ Contexto_Base_Web.md §09B013]
var _SUBCARPETAS_CLAN_ = {
  'grupo\u4e42terna\u2122':   '1J7M0A2sKoN0vwXDHPOKjJ_QkLzwbIoWR', // Nombre en Drive: "Grupo乂Terna™"
  'grupoxterna\u21222':       '1i7lZIw_69S_6NtQLAmSjMV_6TePKu8cH', // Nombre en Drive: "GrupoXTerna™2"
  'grupoxterna\u21223':       '1nkBknCl29nAO7Pph4QM4BAeO05Up2GFm', // Nombre en Drive: "GrupoXTerna™3"
  'mini\u4e42ternas\u2122':   '1p7mu6rh0wu5hCWTEPttlCjNGF1Cgdqbi', // Nombre en Drive: "Mini乂Ternas™"
  'naranja x':                '1DKxLFE7P0pnItV6nTk6Q1jCctF1YgGx9'  // Nombre en Drive: "NARANJA x"
};

/**
 * CARPETAS_JSON_POR_ENDPOINT_ [→ Contexto_Base_Web.md §09B014]
 */
var CARPETAS_JSON_POR_ENDPOINT_ = {
  'currentriverrace': 'CurrentRiverRace',
  'clans':            'Clans'
};

// Claves normalizadas (ver _normalizarNombreClan_) -> ID de la subcarpeta de [→ Contexto_Base_Web.md §09B015]
var _SUBCARPETAS_CLAN_POR_ENDPOINT_CLANS_ = {
  'grupo\u4e42terna\u2122':   '1MiiF08kqyTcVt7CyBroyDRjv8eARpgfo', // Nombre en Drive: "Grupo乂Terna™"
  'grupoxterna\u21222':       '1D_GUUFTw9P6oSQXsaonxwXlmmp7sZA9M', // Nombre en Drive: "GrupoXTerna™2"
  'grupoxterna\u21223':       '15FCgOyzp2Vd9JtJszWd-EsS_2kKVnlnp', // Nombre en Drive: "GrupoXTerna™3"
  'mini\u4e42ternas\u2122':   '16MPII4hSHAATIPhrGDhuV6uT_Rd2YzHQ', // Nombre en Drive: "Mini乂Ternas™"
  'naranja x':                '1Lhs379eEIpdXJ-2DyWkcYBbkXg4WngaN'  // Nombre en Drive: "NARANJA x"
};

// Claves normalizadas (ver _normalizarNombreClan_) -> ID de la subcarpeta de [→ Contexto_Base_Web.md §09B016]
var _SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_ = {
  'grupo\u4e42terna\u2122':   '18TF9ufSGw8YlEA9Hpu7fT8d0UmiPnkYB', // Nombre en Drive: "Grupo乂Terna™"
  'grupoxterna\u21222':       '1X6dufNme2whAkjHarBCm1jdC6xI0_aQ6', // Nombre en Drive: "GrupoXTerna™2"
  'grupoxterna\u21223':       '1BN8ercCNZeUZYib8jGoVCzkAx2OJ7LWB', // Nombre en Drive: "GrupoXTerna™3"
  'mini\u4e42ternas\u2122':   '1gLW3F9cqNc58VYNvUKmAOT9TtUA6PMxQ', // Nombre en Drive: "Mini乂Ternas™"
  'naranja x':                '1YHhptq93vyECa3KpcEnOEXjEcuz6XBvE'  // Nombre en Drive: "NARANJA x"
};

// endpointKey (CACHE_ENDPOINTS[].key) -> { carpeta raíz de ese endpoint [→ Contexto_Base_Web.md §09B017]
var _ENDPOINT_ROOT_Y_SUBCARPETAS_CLAN_ = {
  'clans': {
    folderIdRaiz:       DRIVE_FOLDER_ID_CLANS,
    subcarpetasPorClan: _SUBCARPETAS_CLAN_POR_ENDPOINT_CLANS_
  },
  'currentriverrace': {
    folderIdRaiz:       DRIVE_FOLDER_ID_CURRENTRIVERRACE,
    subcarpetasPorClan: _SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_
  }
};

// ÍNDICE EN MEMORIA de la carpeta Players (FIX 23/07/2026) [→ Contexto_Base_Web.md §09B018]

var _PLAYERS_DRIVE_INDEX_POR_TAG = null; // { playerTag: DriveFile } — TODOS los archivos, sin filtrar por periodo (Fase 18)

// ----- Funciones manuales / punto de entrada -----

// SECCION 1: FUNCIONES MANUALES (entry points ejecutables a mano desde el [→ Contexto_Base_Web.md §09B019]

/**
 * MANTENIMIENTO MANUAL — ejecutar UNA sola vez desde el editor de Apps Script [→ Contexto_Base_Web.md §09B020]
 */
function resetGuardianPeriodIndex() {
  var props = PropertiesService.getScriptProperties();
  props.deleteProperty('CTX_ULTIMO_PERIODINDEX_OK');
  props.deleteProperty('CTX_ULTIMO_TS_OK');
  Logger.log('[Mantenimiento] Guardián de periodIndex reseteado. La próxima corrida aceptará el periodIndex real sin marcarlo como sospechoso.');
}

// NOTA DE REORDEN (23-ago-2026, pedido usuario): las funciones manuales [→ Contexto_Base_Web.md §09B021]

/**
 * guardarApiDump() [→ Contexto_Base_Web.md §09B022]
 */
function guardarApiDump() {
  // PF091 (17-oct-2026, pedido usuario): ya NO pide a la API por su cuenta. Usa la captura (capturarApiClanes_), que reutiliza el
  // checkpoint si tiene <= CFG.CLANES_PROGRESO_MAX_EDAD_MS o pide una sola vez, y escribe los JSON con esas respuestas.
  // Antes volvia a pedir los mismos 2 endpoints de los 5 clanes. [→ Contexto_Base_Web.md §PF091]
  Logger.log('[ApiDump] Iniciando (usa la captura, sin pedir de nuevo a la API) para ' + CFG.CLAN_TAGS.length + ' clanes...');
  capturarApiClanes_(CFG.CLANES_PROGRESO_MAX_EDAD_MS, 'guardarApiDump');
  // PF091 etapa 4 (17-oct-2026, registro de runUpdate del 12:04): si la captura de OTRA ejecucion (p. ej. el paso 0 de la misma cadena, antes
  // de una continuacion) ya escribio los JSON con este checkpoint, no se reescriben: costaba ~40 s y renombraba los de clans con una hora
  // sin datos nuevos.
  if (!_jsonClanesEscritosEnEstaEjecucion && _jsonClanesDeEsteCheckpointYaEscritos_()) {
    Logger.log('[ApiDump] OMITIDO: los JSON de clans y currentriverrace ya se escribieron con este checkpoint (CLANES_JSON_ESCRITOS_TS); reescribirlos solo cambiaria la hora del nombre de los de clans.');
    return;
  }
  _guardarJsonClanesDesdeCaptura_(true);  // no hace nada si la captura de esta ejecucion ya los escribio
  var total = _jsonClanesUltimoTotal;
  var nota = _clanesBasicoDesdeApiEnEstaEjecucion ? '' : ' (datos del checkpoint, sin pedir a la API)';

  Logger.log('[ApiDump] Completado. Endpoints escritos: ' + total + nota);
  _registrarLogScriptTerna('guardarApiDump()',
    'Dump de API completado. Endpoints escritos: ' + total +
    ' de ' + (CFG.CLAN_TAGS.length * CACHE_ENDPOINTS.length) + ' posibles.' + nota,
    total === 0 ? ['Ningún endpoint se pudo escribir'] : []);
}

// LIMPIEZA DE DUPLICADOS — CACHE DE PLAYERS [→ Contexto_Base_Web.md §09B023]

/**
 * limpiarDuplicadosCachePlayers() [→ Contexto_Base_Web.md §09B024]
 */
function limpiarDuplicadosCachePlayers() {
  var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_PLAYERS);

  // Formato nuevo:    "dd-mm-yyyy HH.mm - {ClanName} - {playerTag} - P{n}.json"
  var patronNuevo = /^\d{2}-\d{2}-\d{4} \d{2}\.\d{2} - .+ - (#[A-Z0-9]+) - P(\d+)\.json$/;
  // Formato antiguo:  "dd-mm-yyyy HH.mm - {ClanName} - {playerTag}.json" (sin periodIndex)
  var patronViejo = /^(\d{2}-\d{2}-\d{4}) \d{2}\.\d{2} - .+ - (#[A-Z0-9]+)\.json$/;

  var grupos = {};
  var archivos = folder.getFiles();

  while (archivos.hasNext()) {
    var f = archivos.next();
    var n = f.getName();
    var key = null;

    var mNuevo = n.match(patronNuevo);
    if (mNuevo) {
      key = 'P|' + mNuevo[1] + '|' + mNuevo[2]; // tag|periodIndex
    } else {
      var mViejo = n.match(patronViejo);
      if (mViejo) {
        key = 'F|' + mViejo[2] + '|' + mViejo[1]; // tag|fecha
      }
    }
    if (!key) continue;

    if (!grupos[key]) grupos[key] = [];
    grupos[key].push({ file: f, lastUpdated: f.getLastUpdated().getTime(), name: n });
  }

  var totalEliminados = 0;
  var resumen = [];

  for (var key2 in grupos) {
    var lista = grupos[key2];
    if (lista.length <= 1) continue;

    lista.sort(function (a, b) { return b.lastUpdated - a.lastUpdated; });

    var conservado = lista[0];
    var borradosDeEsteGrupo = 0;
    for (var i = 1; i < lista.length; i++) {
      lista[i].file.setTrashed(true);
      borradosDeEsteGrupo++;
      totalEliminados++;
    }

    resumen.push(
      key2 + ' -> conservado: "' + conservado.name + '" | ' +
      'eliminados: ' + borradosDeEsteGrupo + ' (' +
      lista.slice(1).map(function (x) { return x.name; }).join(', ') + ')'
    );
  }

  Logger.log('[Limpieza] Players — duplicados enviados a la papelera: ' + totalEliminados);
  Logger.log(resumen.length ? resumen.join('\n') : '[Limpieza] Players — no se encontraron duplicados.');

  _registrarLogScriptTerna(
    'limpiarDuplicadosCachePlayers()',
    'Limpieza de duplicados en cache de players. Archivos enviados a la papelera: ' +
    totalEliminados + '. Detalle: ' + (resumen.length ? resumen.join(' | ') : 'sin duplicados'),
    []
  );

  return { eliminados: totalEliminados, detalle: resumen };

}

/**
 * descargarCards() [→ Contexto_Base_Web.md §09B025]
 */
function descargarCards() {
  var data = _apiGet('/cards');
  var cardMap;
  var usandoRespaldo = false;
  var fuenteTexto = '/cards';

  if (!data || !Array.isArray(data.items) || data.items.length === 0) {
    // RESPALDO AUTOMÁTICO (27-sep-2026, pedido del usuario): si /cards falla [→ Contexto_Base_Web.md §09B026]
    Logger.log('[Cards] No se pudo descargar /cards (respuesta vacía, sin "items", o el proxy falló). ' +
               'Usando respaldo: _getCardsFromCache() (datos ya presentes en la cache de jugadores).');
    cardMap = _getCardsFromCache();
    usandoRespaldo = true;
    fuenteTexto = 'el respaldo (cache de jugadores, /cards no disponible)';
    if (!cardMap || Object.keys(cardMap).length === 0) {
      Logger.log('[Cards] El respaldo tampoco encontró datos (ninguna cuenta con cartas en cache todavía). ' +
                 'No se actualiza Backup_Cards.csv esta corrida.');
      return;
    }
  } else {
    // 1) JSON completo, respuesta cruda sin filtrar ningún campo. Solo tiene [→ Contexto_Base_Web.md §09B027]
    try {
      var folderJson = DriveApp.getFolderById(DRIVE_FOLDER_ID_CARDS);
      var nombreJson = 'Cache_Cards.json';
      var contenidoJson = JSON.stringify(data, null, 2);
      var filesJson = folderJson.getFilesByName(nombreJson);
      if (filesJson.hasNext()) {
        _setContentConConteo_(filesJson.next(), contenidoJson);
      } else {
        _createFileConConteo_(folderJson, nombreJson, contenidoJson, MimeType.PLAIN_TEXT);
      }
      Logger.log('[Cards] ' + nombreJson + ' guardado (' + data.items.length + ' cartas' +
                 (Array.isArray(data.supportItems) ? ' + ' + data.supportItems.length + ' de torre' : '') + ').');
    } catch (eJson) {
      Logger.log('[Cards] Error guardando Cache_Cards.json: ' + eJson.message);
    }

    // 2) Mapa id -> carta, mismo shape que _getCardsFromCache()/ [→ Contexto_Base_Web.md §09B028]
    cardMap = {};
    _agregarCartasApiAMapa(cardMap, data.items, false);
    if (Array.isArray(data.supportItems)) {
      _agregarCartasApiAMapa(cardMap, data.supportItems, true);
    }
  }

  // 3) Actualizar Backup_Cards.csv EN EL MISMO archivo (no se crea uno [→ Contexto_Base_Web.md §09B029]
  try {
    var csv = _leerCardsCSV();

    var existingIds = {};
    for (var e = 0; e < csv.rows.length; e++) {
      var idExist = String(csv.rows[e][1] || '').trim(); // columna ID
      if (idExist) existingIds[idExist] = true;
    }

    var filasRefrescadas = _refrescarCardsRows(csv.rows, cardMap);

    var cardIds = Object.keys(cardMap).sort(function (a, b) { return Number(a) - Number(b); });
    var nuevasFilas = [];
    var nuevasTorre = 0;

    for (var i = 0; i < cardIds.length; i++) {
      var id = cardIds[i];
      if (existingIds[id]) continue; // ya existe
      var c = cardMap[id];
      if (c.esTorre) nuevasTorre++;
      nuevasFilas.push([
        '',                          // N° (se asigna en _guardarCardsCSV)
        Number(id),                  // ID
        c.name || '',                // Name
        '',                          // Nombre (traducción manual del usuario;
                                      // carta nueva -> queda vacía)
        c.maxLevel || '',            // Maxlevel
        c.maxEvolutionLevel,         // MaxEvolutionLevel
        _rarezaParaFila(c),          // Rarity
        c.esTorre ? 'Torre' : '',    // Tipo (carta de torre nueva entra con
                                      // 'Torre'; el resto queda vacío para
                                      // completar a mano, igual que updateCardsSheet())
        c.elixirCost !== undefined ? c.elixirCost : '', // Elixircost
        c.iconMedium          || '', // Carta
        c.iconHeroMedium       || '', // Héroe
        c.iconEvolutionMedium  || ''  // Evolución
      ]);
    }

    if (nuevasFilas.length === 0 && filasRefrescadas === 0) {
      Logger.log('[Cards] ' + fuenteTexto + ' no trajo cartas nuevas ni datos por refrescar en Backup_Cards.csv (' +
                 cardIds.length + ' ya presentes en el catálogo descargado).');
      return;
    }

    var totalPrevio = csv.rows.length;
    for (var j = 0; j < nuevasFilas.length; j++) csv.rows.push(nuevasFilas[j]);
    _guardarCardsCSV(csv.headers, csv.rows);

    if (nuevasFilas.length > 0) {
      Logger.log('[Cards] descargarCards(): agregadas ' + nuevasFilas.length + ' cartas a Backup_Cards.csv' +
                 (nuevasTorre > 0 ? ' (' + nuevasTorre + ' de torre)' : '') + ' desde ' + fuenteTexto + '. Total: ' +
                 (totalPrevio + nuevasFilas.length));
    }
    if (filasRefrescadas > 0) {
      Logger.log('[Cards] descargarCards(): datos refrescados en ' + filasRefrescadas +
                 ' carta(s) existente(s) desde ' + fuenteTexto + '.');
    }
    if (usandoRespaldo) {
      Logger.log('[Cards] ⚠ Esta corrida usó el RESPALDO, no /cards -- revisar por qué falló la API antes de la próxima semana.');
    }
  } catch (eCsv) {
    Logger.log('[Cards] Error actualizando Backup_Cards.csv desde ' + fuenteTexto + ': ' + eCsv.message);
  }

  Logger.log('[Cards] descargarCards() completado' + (usandoRespaldo ? ' (con respaldo).' : '.'));
}

// TRIGGER SEMANAL DE descargarCards() (27-sep-2026, pedido del usuario) [→ Contexto_Base_Web.md §09B030]

// MOVIDO (05-oct-2026, pedido usuario): activarTriggerDescargarCards()/desactivarTriggerDescargarCards() ya no viven [→ Contexto_Base_Web.md §09B031]


/**
 * buscarClanesPorNombre(nombre) [→ Contexto_Base_Web.md §09B032]
 */
function buscarClanesPorNombre(nombre) {
  var path = '/clans?name=' + encodeURIComponent(nombre);

  var data = _apiGet(path);
  if (!data) {
    Logger.log('[ClanesConsultaTemporal] No se pudo descargar ' + path + ' (respuesta vacía o el proxy falló).');
    return false;
  }

  var ok = _guardarJsonClanesConsultaTemporalEnDrive(data);
  if (ok) {
    var cantidad = (data.items ? data.items.length : '?');
    Logger.log('[ClanesConsultaTemporal] clans_consulta_temporal.json guardado (' +
               cantidad + ' clan(es), ' + path + ').');
  }
  return ok;
}

/**
 * buscarClanesPorNombreYUbicacion(nombre, locationId) [→ Contexto_Base_Web.md §09B033]
 */

// nombre y locationId que se usan si buscarClanesPorNombreYUbicacion() se [→ Contexto_Base_Web.md §09B034]
var BUSCAR_CLANES_NOMBRE_YUBI_NOMBRE = 'Nombre del clan';
var BUSCAR_CLANES_NOMBRE_YUBI_LOCATION_ID = 57000184;

function buscarClanesPorNombreYUbicacion(nombre, locationId) {
  if (nombre === undefined || nombre === null || String(nombre).trim() === '') {
    nombre = BUSCAR_CLANES_NOMBRE_YUBI_NOMBRE;
    Logger.log('[ClanesConsultaTemporal] Consultando nombre = "' + nombre +
               '" (definido en la variable BUSCAR_CLANES_NOMBRE_YUBI_NOMBRE, arriba de esta función).');
  }
  if (locationId === undefined || locationId === null || String(locationId).trim() === '') {
    locationId = BUSCAR_CLANES_NOMBRE_YUBI_LOCATION_ID;
    Logger.log('[ClanesConsultaTemporal] Consultando locationId = ' + locationId +
               ' (definido en la variable BUSCAR_CLANES_NOMBRE_YUBI_LOCATION_ID, arriba de esta función).');
  }
  var path = '/clans?name=' + encodeURIComponent(nombre) +
             '&locationId=' + encodeURIComponent(locationId);

  var data = _apiGet(path);
  if (!data) {
    Logger.log('[ClanesConsultaTemporal] No se pudo descargar ' + path + ' (respuesta vacía o el proxy falló).');
    return false;
  }

  var ok = _guardarJsonClanesConsultaTemporalEnDrive(data);
  if (ok) {
    var cantidad = (data.items ? data.items.length : '?');
    Logger.log('[ClanesConsultaTemporal] clans_consulta_temporal.json guardado (' +
               cantidad + ' clan(es), ' + path + ').');
  }
  return ok;
}

/**
 * buscarClanesPorUbicacion(locationId) [→ Contexto_Base_Web.md §09B035]
 */

// locationId que se usa si buscarClanesPorUbicacion() se corre sin argumento [→ Contexto_Base_Web.md §09B036]
var BUSCAR_CLANES_UBICACION_LOCATION_ID = 57000184;

function buscarClanesPorUbicacion(locationId) {
  if (locationId === undefined || locationId === null || String(locationId).trim() === '') {
    locationId = BUSCAR_CLANES_UBICACION_LOCATION_ID;
    Logger.log('[ClanesConsultaTemporal] Consultando locationId = ' + locationId +
               ' (definido en la variable BUSCAR_CLANES_UBICACION_LOCATION_ID, arriba de esta función).');
  }
  var path = '/clans?locationId=' + encodeURIComponent(locationId);

  var data = _apiGet(path);
  if (!data) {
    Logger.log('[ClanesConsultaTemporal] No se pudo descargar ' + path + ' (respuesta vacía o el proxy falló).');
    return false;
  }

  var ok = _guardarJsonClanesConsultaTemporalEnDrive(data);
  if (ok) {
    var cantidad = (data.items ? data.items.length : '?');
    Logger.log('[ClanesConsultaTemporal] clans_consulta_temporal.json guardado (' +
               cantidad + ' clan(es), ' + path + ').');
  }
  return ok;
}

/**
 * descargarClanMiembros(tag, limit) [→ Contexto_Base_Web.md §09B037]
 */

// tag de clan que se usa si descargarClanMiembros() se corre sin argumento [→ Contexto_Base_Web.md §09B038]
var TAG_CLAN_A_CONSULTAR = '#GCRG8L00';

function descargarClanMiembros(tag, limit) {
  if (tag === undefined || tag === null || String(tag).trim() === '') {
    tag = TAG_CLAN_A_CONSULTAR;
    Logger.log('[ClanesConsultaTemporal] Consultando tag = ' + tag +
               ' (definido en la variable TAG_CLAN_A_CONSULTAR, arriba de esta función).');
  }
  var path = '/clans/' + encodeTag(tag) + '/members';
  if (limit !== undefined && limit !== null && limit !== '') {
    path += '?limit=' + encodeURIComponent(limit);
  }

  var data = _apiGet(path);
  if (!data) {
    Logger.log('[ClanesConsultaTemporal] No se pudo descargar ' + path + ' (respuesta vacía o el proxy falló).');
    return false;
  }

  var ok = _guardarJsonClanesConsultaTemporalEnDrive(data);
  if (ok) {
    var cantidad = (data.items ? data.items.length : '?');
    Logger.log('[ClanesConsultaTemporal] clans_consulta_temporal.json guardado (' +
               cantidad + ' miembro(s), ' + path + ').');
  }
  return ok;
}

// -----------------------------------------------------------------------------
// CONTEXTO (25-sep-2026, pedido del usuario) sobre TODOS los endpoints nuevos

// que se están implementando en este bloque (Locations, Seasons, Cards, [→ Contexto_Base_Web.md §09B039]

/**
 * descargarGlobalTournaments() [→ Contexto_Base_Web.md §09B040]
 */
function descargarGlobalTournaments() {
  var data = _apiGet('/globaltournaments');
  if (!data) {
    Logger.log('[GlobalTournaments] No se pudo descargar /globaltournaments (respuesta vacía o el proxy falló).');
    return;
  }

  try {
    var folderJson = DriveApp.getFolderById(DRIVE_FOLDER_ID_TORNEOS_GLOBALES);
    var nombreJson = 'Cache_GlobalTournaments.json';
    var contenidoJson = JSON.stringify(data, null, 2);
    var filesJson = folderJson.getFilesByName(nombreJson);
    if (filesJson.hasNext()) {
      _setContentConConteo_(filesJson.next(), contenidoJson);
    } else {
      _createFileConConteo_(folderJson, nombreJson, contenidoJson, MimeType.PLAIN_TEXT);
    }
    Logger.log('[GlobalTournaments] ' + nombreJson + ' guardado (' +
               (data.items ? data.items.length + ' torneo(s) global(es)' : 'sin "items"') + ').');
  } catch (eJson) {
    Logger.log('[GlobalTournaments] Error guardando Cache_GlobalTournaments.json: ' + eJson.message +
               ' (revisar que DRIVE_FOLDER_ID_TORNEOS_GLOBALES en 01_Config_Global.gs tenga el ID real de la carpeta "Globales").');
  }

  Logger.log('[GlobalTournaments] descargarGlobalTournaments() completado.');
}

/**
 * descargarLocations() [→ Contexto_Base_Web.md §09B041]
 */
function descargarLocations() {
  var data = _apiGet('/locations');
  if (!data || !data.items || !data.items.length) {
    Logger.log('[Locations] No se pudo descargar /locations (respuesta vacía, sin "items", o el proxy falló).');
    return;
  }
  var items = data.items;

  // 1) JSON completo, respuesta cruda sin filtrar ningún campo.
  try {
    var folderJson = DriveApp.getFolderById(DRIVE_FOLDER_ID_LOCATIONS);
    var nombreJson = 'Cache_Locations.json';
    var contenidoJson = JSON.stringify(data, null, 2);
    var filesJson = folderJson.getFilesByName(nombreJson);
    if (filesJson.hasNext()) {
      _setContentConConteo_(filesJson.next(), contenidoJson);
    } else {
      _createFileConConteo_(folderJson, nombreJson, contenidoJson, MimeType.PLAIN_TEXT);
    }
    Logger.log('[Locations] ' + nombreJson + ' guardado (' + items.length + ' locations).');
  } catch (eJson) {
    Logger.log('[Locations] Error guardando Cache_Locations.json: ' + eJson.message);
  }

  // 2) CSV con las mismas 4 columnas (id, name, isCountry, countryCode).
  try {
    var filas = [['id', 'name', 'isCountry', 'countryCode']];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      filas.push([
        it.id          !== undefined ? it.id          : '',
        it.name        !== undefined ? it.name        : '',
        it.isCountry === true ? 'Sí' : (it.isCountry === false ? 'No' : ''),
        it.countryCode !== undefined ? it.countryCode : ''
      ]);
    }
    _saveCSVToDrive('Backup_Locations.csv', _encodeCSV(filas));
    Logger.log('[Locations] Backup_Locations.csv sincronizado (' + items.length + ' filas).');
  } catch (eCsv) {
    Logger.log('[Locations] Error guardando Backup_Locations.csv: ' + eCsv.message);
  }

  Logger.log('[Locations] descargarLocations() completado.');
}

/**
 * descargarLocationPorId(id) [→ Contexto_Base_Web.md §09B042]
 */

// ID que se usa si descargarLocationPorId() se corre sin argumento desde el [→ Contexto_Base_Web.md §09B043]
var ID_A_CONSULTAR = 57000184;

function descargarLocationPorId(id) {
  if (id === undefined || id === null || String(id).trim() === '') {
    id = ID_A_CONSULTAR;
    Logger.log('[Locations] Consultando id = ' + id + ' (definido en la variable ' +
               'ID_A_CONSULTAR, arriba de esta función).');
  }

  var path = '/locations/' + encodeURIComponent(id);

  var data = _apiGet(path);
  if (!data) {
    Logger.log('[Locations] No se pudo descargar ' + path + ' (respuesta vacía o el proxy falló).');
    return false;
  }

  var filename = 'Cache_Locations_' + id + '.json';
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_LOCATIONS);
    var contenido = JSON.stringify(data, null, 2);
    var existentes = folder.getFilesByName(filename);
    if (existentes.hasNext()) {
      _setContentConConteo_(existentes.next(), contenido);
    } else {
      _createFileConConteo_(folder, filename, contenido, MimeType.PLAIN_TEXT);
    }
    Logger.log('[Locations] ' + filename + ' guardado (' + path + ').');
    return true;
  } catch (e) {
    Logger.log('[Locations] Error guardando ' + filename + ': ' + e.message);
    return false;
  }
}

/**
 * descargarRankingClanesPorUbicacion(locationId, limit) [→ Contexto_Base_Web.md §09B044]
 */

// locationId que se usa si descargarRankingClanesPorUbicacion() se corre sin [→ Contexto_Base_Web.md §09B045]
var RANKING_CLANES_LOCATION_ID = 57000184;

function descargarRankingClanesPorUbicacion(locationId, limit) {
  if (locationId === undefined || locationId === null || String(locationId).trim() === '') {
    locationId = RANKING_CLANES_LOCATION_ID;
    Logger.log('[RankingClanesPorUbicacion] Consultando locationId = ' + locationId +
               ' (definido en la variable RANKING_CLANES_LOCATION_ID, arriba de esta función).');
  }
  var path = '/locations/' + encodeURIComponent(locationId) + '/rankings/clans';
  if (limit !== undefined && limit !== null && limit !== '') {
    path += '?limit=' + encodeURIComponent(limit);
  }

  var data = _apiGet(path);
  if (!data) {
    Logger.log('[RankingClanesPorUbicacion] No se pudo descargar ' + path + ' (respuesta vacía o el proxy falló).');
    return false;
  }

  var filename = 'Cache_RankingClanes_' + locationId + '.json';
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_RANKING_COPAS);
    var contenido = JSON.stringify(data, null, 2);
    var existentes = folder.getFilesByName(filename);
    if (existentes.hasNext()) {
      _setContentConConteo_(existentes.next(), contenido);
    } else {
      _createFileConConteo_(folder, filename, contenido, MimeType.PLAIN_TEXT);
    }
    var cantidad = Array.isArray(data) ? data.length : (data.items ? data.items.length : '?');
    Logger.log('[RankingClanesPorUbicacion] ' + filename + ' guardado (' + cantidad + ' clan(es), ' + path + ').');
    return true;
  } catch (e) {
    Logger.log('[RankingClanesPorUbicacion] Error guardando ' + filename + ': ' + e.message);
    return false;
  }
}

/**
 * descargarRankingJugadoresPorUbicacion(locationId, limit) [→ Contexto_Base_Web.md §09B046]
 */

// locationId que se usa si descargarRankingJugadoresPorUbicacion() se corre [→ Contexto_Base_Web.md §09B047]
var RANKING_JUGADORES_LOCATION_ID = 57000184;

function descargarRankingJugadoresPorUbicacion(locationId, limit) {
  if (locationId === undefined || locationId === null || String(locationId).trim() === '') {
    locationId = RANKING_JUGADORES_LOCATION_ID;
    Logger.log('[RankingJugadoresPorUbicacion] Consultando locationId = ' + locationId +
               ' (definido en la variable RANKING_JUGADORES_LOCATION_ID, arriba de esta función).');
  }
  var path = '/locations/' + encodeURIComponent(locationId) + '/rankings/players';
  if (limit !== undefined && limit !== null && limit !== '') {
    path += '?limit=' + encodeURIComponent(limit);
  }

  var data = _apiGet(path);
  if (!data) {
    Logger.log('[RankingJugadoresPorUbicacion] No se pudo descargar ' + path + ' (respuesta vacía o el proxy falló).');
    return false;
  }

  var filename = 'Cache_RankingJugadores_' + locationId + '.json';
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_RANKING_JUGADORES_GLOBAL);
    var contenido = JSON.stringify(data, null, 2);
    var existentes = folder.getFilesByName(filename);
    if (existentes.hasNext()) {
      _setContentConConteo_(existentes.next(), contenido);
    } else {
      _createFileConConteo_(folder, filename, contenido, MimeType.PLAIN_TEXT);
    }
    var cantidad = Array.isArray(data) ? data.length : (data.items ? data.items.length : '?');
    Logger.log('[RankingJugadoresPorUbicacion] ' + filename + ' guardado (' + cantidad + ' jugador(es), ' + path + ').');
    return true;
  } catch (e) {
    Logger.log('[RankingJugadoresPorUbicacion] Error guardando ' + filename + ': ' + e.message);
    return false;
  }
}

/**
 * descargarRankingClanesGuerraPorUbicacion(locationId, limit) [→ Contexto_Base_Web.md §09B048]
 */

// locationId que se usa si descargarRankingClanesGuerraPorUbicacion() se [→ Contexto_Base_Web.md §09B049]
var RANKING_GUERRA_CLANES_LOCATION_ID = 57000184;

function descargarRankingClanesGuerraPorUbicacion(locationId, limit) {
  if (locationId === undefined || locationId === null || String(locationId).trim() === '') {
    locationId = RANKING_GUERRA_CLANES_LOCATION_ID;
    Logger.log('[RankingGuerraClanesPorUbicacion] Consultando locationId = ' + locationId +
               ' (definido en la variable RANKING_GUERRA_CLANES_LOCATION_ID, arriba de esta función).');
  }
  var path = '/locations/' + encodeURIComponent(locationId) + '/rankings/clanwars';
  if (limit !== undefined && limit !== null && limit !== '') {
    path += '?limit=' + encodeURIComponent(limit);
  }

  var data = _apiGet(path);
  if (!data) {
    Logger.log('[RankingGuerraClanesPorUbicacion] No se pudo descargar ' + path + ' (respuesta vacía o el proxy falló).');
    return false;
  }

  var filename = 'Cache_RankingGuerraClanes_' + locationId + '.json';
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_RANKING_GUERRA);
    var contenido = JSON.stringify(data, null, 2);
    var existentes = folder.getFilesByName(filename);
    if (existentes.hasNext()) {
      _setContentConConteo_(existentes.next(), contenido);
    } else {
      _createFileConConteo_(folder, filename, contenido, MimeType.PLAIN_TEXT);
    }
    var cantidad = Array.isArray(data) ? data.length : (data.items ? data.items.length : '?');
    Logger.log('[RankingGuerraClanesPorUbicacion] ' + filename + ' guardado (' + cantidad + ' clan(es), ' + path + ').');
    return true;
  } catch (e) {
    Logger.log('[RankingGuerraClanesPorUbicacion] Error guardando ' + filename + ': ' + e.message);
    return false;
  }
}

/**
 * descargarRankingJugadoresCaminoLeyendasPorUbicacion(locationId, limit) [→ Contexto_Base_Web.md §09B050]
 */

// locationId que se usa si descargarRankingJugadoresCaminoLeyendasPorUbicacion() [→ Contexto_Base_Web.md §09B051]
var RANKING_CAMINO_LEYENDAS_LOCATION_ID = 57000184;

function descargarRankingJugadoresCaminoLeyendasPorUbicacion(locationId, limit) {
  if (locationId === undefined || locationId === null || String(locationId).trim() === '') {
    locationId = RANKING_CAMINO_LEYENDAS_LOCATION_ID;
    Logger.log('[RankingCaminoLeyendasPorUbicacion] Consultando locationId = ' + locationId +
               ' (definido en la variable RANKING_CAMINO_LEYENDAS_LOCATION_ID, arriba de esta función).');
  }
  var path = '/locations/' + encodeURIComponent(locationId) + '/pathoflegend/players';
  if (limit !== undefined && limit !== null && limit !== '') {
    path += '?limit=' + encodeURIComponent(limit);
  }

  var data = _apiGet(path);
  if (!data) {
    Logger.log('[RankingCaminoLeyendasPorUbicacion] No se pudo descargar ' + path + ' (respuesta vacía o el proxy falló).');
    return false;
  }

  var filename = 'Cache_RankingCaminoLeyendas_' + locationId + '.json';
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_RANKING_JUGADORES_CAMINO_LEYENDAS);
    var contenido = JSON.stringify(data, null, 2);
    var existentes = folder.getFilesByName(filename);
    if (existentes.hasNext()) {
      _setContentConConteo_(existentes.next(), contenido);
    } else {
      _createFileConConteo_(folder, filename, contenido, MimeType.PLAIN_TEXT);
    }
    var cantidad = Array.isArray(data) ? data.length : (data.items ? data.items.length : '?');
    Logger.log('[RankingCaminoLeyendasPorUbicacion] ' + filename + ' guardado (' + cantidad + ' jugador(es), ' + path + ').');
    return true;
  } catch (e) {
    Logger.log('[RankingCaminoLeyendasPorUbicacion] Error guardando ' + filename + ': ' + e.message);
    return false;
  }
}

/**
 * descargarRankingGlobalClanes(limit) [→ Contexto_Base_Web.md §09B052]
 */
function descargarRankingGlobalClanes(limit) {
  var path = '/locations/global/rankings/clans';
  if (limit !== undefined && limit !== null && limit !== '') {
    path += '?limit=' + encodeURIComponent(limit);
  }

  var data = _apiGet(path);
  if (!data) {
    Logger.log('[RankingGlobalClanes] No se pudo descargar ' + path + ' (respuesta vacía o el proxy falló).');
    return false;
  }

  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_RANKING_COPAS);
    var filename = 'Cache_RankingGlobalClanes.json';
    var contenido = JSON.stringify(data, null, 2);
    var existentes = folder.getFilesByName(filename);
    if (existentes.hasNext()) {
      _setContentConConteo_(existentes.next(), contenido);
    } else {
      _createFileConConteo_(folder, filename, contenido, MimeType.PLAIN_TEXT);
    }
    // La respuesta es un array plano (a diferencia de otros endpoints que [→ Contexto_Base_Web.md §09B053]
    var cantidad = Array.isArray(data) ? data.length : (data.items ? data.items.length : '?');
    Logger.log('[RankingGlobalClanes] ' + filename + ' guardado (' + cantidad + ' clan(es), ' + path + ').');
    return true;
  } catch (e) {
    Logger.log('[RankingGlobalClanes] Error guardando ' + filename + ': ' + e.message);
    return false;
  }
}

/**
 * descargarRankingGlobalJugadores(limit) [→ Contexto_Base_Web.md §09B054]
 */
function descargarRankingGlobalJugadores(limit) {
  var path = '/locations/global/rankings/players';
  if (limit !== undefined && limit !== null && limit !== '') {
    path += '?limit=' + encodeURIComponent(limit);
  }

  var data = _apiGet(path);
  if (!data) {
    Logger.log('[RankingGlobalJugadores] No se pudo descargar ' + path + ' (respuesta vacía o el proxy falló).');
    return false;
  }

  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_RANKING_JUGADORES_GLOBAL);
    var filename = 'Cache_RankingGlobalJugadores.json';
    var contenido = JSON.stringify(data, null, 2);
    var existentes = folder.getFilesByName(filename);
    if (existentes.hasNext()) {
      _setContentConConteo_(existentes.next(), contenido);
    } else {
      _createFileConConteo_(folder, filename, contenido, MimeType.PLAIN_TEXT);
    }
    var cantidad = Array.isArray(data) ? data.length : (data.items ? data.items.length : '?');
    Logger.log('[RankingGlobalJugadores] ' + filename + ' guardado (' + cantidad + ' jugador(es), ' + path +
               (cantidad === 0 ? ' -- AVISO: endpoint vacío hoy, ver docblock' : '') + ').');
    return true;
  } catch (e) {
    Logger.log('[RankingGlobalJugadores] Error guardando ' + filename + ': ' + e.message);
    return false;
  }
}

/**
 * descargarRankingGlobalGuerraClanes(limit) [→ Contexto_Base_Web.md §09B055]
 */
function descargarRankingGlobalGuerraClanes(limit) {
  var path = '/locations/global/rankings/clanwars';
  if (limit !== undefined && limit !== null && limit !== '') {
    path += '?limit=' + encodeURIComponent(limit);
  }

  var data = _apiGet(path);
  if (!data) {
    Logger.log('[RankingGlobalGuerraClanes] No se pudo descargar ' + path + ' (respuesta vacía o el proxy falló).');
    return false;
  }

  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_RANKING_GUERRA);
    var filename = 'Cache_RankingGlobalGuerraClanes.json';
    var contenido = JSON.stringify(data, null, 2);
    var existentes = folder.getFilesByName(filename);
    if (existentes.hasNext()) {
      _setContentConConteo_(existentes.next(), contenido);
    } else {
      _createFileConConteo_(folder, filename, contenido, MimeType.PLAIN_TEXT);
    }
    var cantidad = Array.isArray(data) ? data.length : (data.items ? data.items.length : '?');
    Logger.log('[RankingGlobalGuerraClanes] ' + filename + ' guardado (' + cantidad + ' clan(es), ' + path + ').');
    return true;
  } catch (e) {
    Logger.log('[RankingGlobalGuerraClanes] Error guardando ' + filename + ': ' + e.message);
    return false;
  }
}

/**
 * descargarRankingGlobalJugadoresCaminoLeyendasPorTemporada(seasonId, limit) [→ Contexto_Base_Web.md §09B056]
 */
// seasonId que se usa si descargarRankingGlobalJugadoresCaminoLeyendasPorTemporada() [→ Contexto_Base_Web.md §09B057]
var SEASON_A_CONSULTAR = '2026-08';

function descargarRankingGlobalJugadoresCaminoLeyendasPorTemporada(seasonId, limit) {
  if (seasonId === undefined || seasonId === null || String(seasonId).trim() === '') {
    seasonId = SEASON_A_CONSULTAR;
    Logger.log('[RankingGlobalCaminoLeyendas] Consultando seasonId = ' + seasonId +
               ' (definido en la variable SEASON_A_CONSULTAR, arriba de esta función).');
  }
  if (!seasonId) {
    Logger.log('[RankingGlobalCaminoLeyendas] Falta seasonId (formato "AAAA-MM", ej. "2026-08"); no se llamó a la API.');
    return false;
  }

  var path = '/locations/global/pathoflegend/' + encodeURIComponent(seasonId) + '/rankings/players';
  if (limit !== undefined && limit !== null && limit !== '') {
    path += '?limit=' + encodeURIComponent(limit);
  }

  var data = _apiGet(path);
  if (!data) {
    Logger.log('[RankingGlobalCaminoLeyendas] No se pudo descargar ' + path + ' (respuesta vacía o el proxy falló).');
    return false;
  }

  var filename = 'Cache_RankingGlobalCaminoLeyendas_' + seasonId + '.json';
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_RANKING_JUGADORES_CAMINO_LEYENDAS);
    var contenido = JSON.stringify(data, null, 2);
    var existentes = folder.getFilesByName(filename);
    if (existentes.hasNext()) {
      _setContentConConteo_(existentes.next(), contenido);
    } else {
      _createFileConConteo_(folder, filename, contenido, MimeType.PLAIN_TEXT);
    }
    var cantidad = Array.isArray(data) ? data.length : (data.items ? data.items.length : '?');
    Logger.log('[RankingGlobalCaminoLeyendas] ' + filename + ' guardado (' + cantidad + ' jugador(es), ' + path + ').');
    return true;
  } catch (e) {
    Logger.log('[RankingGlobalCaminoLeyendas] Error guardando ' + filename + ': ' + e.message);
    return false;
  }
}

/**
 * descargarSeasons() [→ Contexto_Base_Web.md §09B058]
 */
function descargarSeasons() {
  var data = _apiGet('/locations/global/seasons');
  if (!data || !data.items || !data.items.length) {
    Logger.log('[Seasons] No se pudo descargar /locations/global/seasons (respuesta vacía, sin "items", o el proxy falló).');
    return;
  }
  var items = data.items;

  // 1) JSON completo, respuesta cruda sin filtrar ningún campo.
  try {
    var folderJson = DriveApp.getFolderById(DRIVE_FOLDER_ID_SEASONS);
    var nombreJson = 'Cache_Seasons.json';
    var contenidoJson = JSON.stringify(data, null, 2);
    var filesJson = folderJson.getFilesByName(nombreJson);
    if (filesJson.hasNext()) {
      _setContentConConteo_(filesJson.next(), contenidoJson);
    } else {
      _createFileConConteo_(folderJson, nombreJson, contenidoJson, MimeType.PLAIN_TEXT);
    }
    Logger.log('[Seasons] ' + nombreJson + ' guardado (' + items.length + ' temporadas).');
  } catch (eJson) {
    Logger.log('[Seasons] Error guardando Cache_Seasons.json: ' + eJson.message);
  }

  // 2) CSV: N° (posición 1-based, calculada) + id (Supercell "YYYY-MM") + [→ Contexto_Base_Web.md §09B059]
  try {
    var ANCLA_ID = '2026-05';
    var ANCLA_ROYALEAPI = 132;
    var ANCLA_INTERNA = 1;

    var anclaIndex = -1;
    var anclaOcurrencias = 0;
    for (var a = 0; a < items.length; a++) {
      if (items[a].id === ANCLA_ID) {
        anclaOcurrencias++;
        if (anclaIndex === -1) anclaIndex = a;
      }
    }
    if (anclaOcurrencias !== 1) {
      Logger.log('[Seasons] AVISO: id ancla "' + ANCLA_ID + '" aparece ' + anclaOcurrencias + ' veces en el array (se esperaba exactamente 1) -- no se calculan "RoyaleAPI"/"Interna", quedan vacías en todas las filas.');
      anclaIndex = -1;
    }

    var filas = [['N°', 'id', 'RoyaleAPI', 'Interna']];
    for (var i = 0; i < items.length; i++) {
      var offset = (anclaIndex === -1) ? null : (i - anclaIndex);
      filas.push([
        i + 1,
        items[i].id !== undefined ? items[i].id : '',
        offset === null ? '' : (ANCLA_ROYALEAPI + offset),
        offset === null ? '' : (ANCLA_INTERNA + offset)
      ]);
    }
    _saveCSVToDrive('Backup_Seasons.csv', _encodeCSV(filas));
    Logger.log('[Seasons] Backup_Seasons.csv sincronizado (' + items.length + ' filas).');
  } catch (eCsv) {
    Logger.log('[Seasons] Error guardando Backup_Seasons.csv: ' + eCsv.message);
  }

  Logger.log('[Seasons] descargarSeasons() completado.');
}

/**
 * descargarBattlelogJugador(playerTag) [→ Contexto_Base_Web.md §09B060]
 */

// playerTag que se usa si descargarBattlelogJugador() se corre sin argumento [→ Contexto_Base_Web.md §09B061]
var TAG_BATTLELOG_A_CONSULTAR = '#CRCCR2LY9';

function descargarBattlelogJugador(playerTag) {
  if (playerTag === undefined || playerTag === null || String(playerTag).trim() === '') {
    playerTag = TAG_BATTLELOG_A_CONSULTAR;
    Logger.log('[Battlelog] Consultando playerTag = ' + playerTag +
               ' (definido en la variable TAG_BATTLELOG_A_CONSULTAR, arriba de esta función).');
  }
  var tag = String(playerTag || '').trim().toUpperCase();
  if (tag && tag.charAt(0) !== '#') tag = '#' + tag;
  if (!tag || tag === '#') {
    Logger.log('[Battlelog] descargarBattlelogJugador(): falta el tag del jugador.');
    return false;
  }

  var data = _apiGet('/players/' + encodeTag(tag) + '/battlelog');
  if (!data || !Array.isArray(data)) {
    Logger.log('[Battlelog] No se pudo descargar el battlelog de ' + tag +
               ' (respuesta vacía, no es un array, o el proxy falló).');
    return false;
  }

  try {
    var clanName  = _extraerClanDeBattlelog(data, tag);
    var filename  = _buildBattlelogFilename(tag, clanName);
    var contenido = JSON.stringify(data, null, 2);
    var folder    = DriveApp.getFolderById(DRIVE_FOLDER_ID_BATTLELOG);

    // Buscar si ya existe un archivo de este jugador en la carpeta [→ Contexto_Base_Web.md §09B062]
    var reTag = /-\s(#[0-9A-Z]+)\.json$/i;
    var archivoExistente = null;
    var archivos = folder.getFiles();
    while (archivos.hasNext()) {
      var f = archivos.next();
      var m = reTag.exec(f.getName());
      if (m && m[1].toUpperCase() === tag) {
        archivoExistente = f;
        break;
      }
    }

    if (archivoExistente) {
      if (archivoExistente.getName() !== filename) {
        archivoExistente.setName(filename);
      }
      _setContentConConteo_(archivoExistente, contenido);
      Logger.log('[Battlelog] ' + filename + ' actualizado (' + data.length + ' batallas).');
    } else {
      _createFileConConteo_(folder, filename, contenido, MimeType.PLAIN_TEXT);
      Logger.log('[Battlelog] ' + filename + ' creado (' + data.length + ' batallas).');
    }
  } catch (e) {
    Logger.log('[Battlelog] Error guardando battlelog de ' + tag + ': ' + e.message);
    return false;
  }

  // IMPLEMENTADO (26-sep-2026, pedido del usuario -- resuelve la "TAREA [→ Contexto_Base_Web.md §09B063]
  try {
    var agregadasArena = _actualizarBackupArenaConBattlelog(data);
    if (agregadasArena > 0) {
      Logger.log('[Battlelog] Agregada(s) ' + agregadasArena + ' arena(s) nueva(s) a Backup_Arena.csv.');
    }
  } catch (eArena) {
    Logger.log('[Battlelog] Error actualizando Backup_Arena.csv: ' + eArena.message);
  }
  try {
    var resultadoModo = _actualizarBackupModoConBattlelog(data);
    if (resultadoModo.agregadas > 0 || resultadoModo.completadas > 0) {
      Logger.log('[Battlelog] Backup_Modo.csv: ' + resultadoModo.agregadas + ' ID(s) nuevo(s), ' +
                 resultadoModo.completadas + ' Name completado(s) en filas que ya tenía Torneos.');
    }
  } catch (eModo) {
    Logger.log('[Battlelog] Error actualizando Backup_Modo.csv: ' + eModo.message);
  }

  // NUEVO (2-oct-2026, pregunta 51, tanda 2): ademas del JSON, agrega las [→ Contexto_Base_Web.md §09B064]
  try {
    var resCsvBl = _registrarBattlelogEnCsv_(data, tag, filename);
    if (resCsvBl.omitido) {
      Logger.log('[Battlelog] ' + tag + ': NO se agrego al Backup_Battlelogs.csv (' + resCsvBl.omitido +
                 '). El JSON si quedo guardado.');
    } else if (resCsvBl.vistas > 0) {
      Logger.log('[Battlelog] ' + tag + ' -> Backup_Battlelogs.csv: ' + resCsvBl.nuevas + ' nueva(s), ' +
                 resCsvBl.iguales + ' ya registrada(s), ' + resCsvBl.conflictos + ' conflicto(s), ' +
                 resCsvBl.lados + ' lado(s) de barco completado(s) ' +
                 '(de ' + resCsvBl.vistas + ' batalla(s) de guerra en el log).');
    }
  } catch (eCsvBl) {
    Logger.log('[Battlelog] Error agregando al Backup_Battlelogs.csv: ' + eCsvBl.message);
  }

  return true;
}

/**
 * _registrarBattlelogEnCsv_(data, tag, nombreArchivo) [→ Contexto_Base_Web.md §09B065]
 */
function _registrarBattlelogEnCsv_(data, tag, nombreArchivo) {
  var res = { vistas: 0, nuevas: 0, iguales: 0, conflictos: 0, lados: 0, omitido: '' };
  if (typeof _blsLeerCsv_ !== 'function' || typeof _blsFilaDeBatalla_ !== 'function' ||
      typeof _blsEsBatallaGuerra_ !== 'function' || typeof _blsCompletarLado_ !== 'function') {
    res.omitido = 'falta 06_Battlelogs_Siembra.gs en el proyecto (o es una version anterior sin _blsCompletarLado_)';
    return res;
  }

  // Solo las batallas de guerra con battleTime; si no hay, ni se pide el candado.
  var guerra = [];
  for (var i = 0; i < data.length; i++) {
    var bat = data[i];
    if (bat && _blsEsBatallaGuerra_(bat.type) && bat.battleTime) guerra.push(bat);
  }
  res.vistas = guerra.length;
  if (!guerra.length) return res;

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    res.omitido = 'candado ocupado (otra ejecucion esta usando el script)';
    return res;
  }
  try {
    var csv = _blsLeerCsv_(BLS_CSV_NOMBRE, BLS_HEADERS);
    if (!csv.ok) { res.omitido = csv.error; return res; }
    var filas = csv.rows;
    var porClave = {};
    for (var f = 0; f < filas.length; f++) {
      var fr = filas[f];
      porClave[_blsClave_(fr[BLS_COL.BATTLETIME], fr[BLS_COL.TIPO], fr[BLS_COL.TAG])] = fr;
    }

    var archivo = {
      nombre: nombreArchivo,
      descargado: Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy HH:mm')
    };
    var conflictos = [];

    for (var b = 0; b < guerra.length; b++) {
      var fila = _blsFilaDeBatalla_(guerra[b], tag, archivo);
      var clave = _blsClave_(fila[BLS_COL.BATTLETIME], fila[BLS_COL.TIPO], tag);
      var previa = porClave[clave];
      if (!previa) {
        porClave[clave] = fila;
        filas.push(fila);
        res.nuevas++;
        continue;
      }
      var cmp = _blsComparar_(previa, fila);
      if (cmp === 'igual') {
        res.iguales++;
        // NUEVO (4-oct-2026): completa LadoBarco en una fila vieja de boatBattle (ver 06_Battlelogs_Siembra.gs).
        if (_blsCompletarLado_(previa, fila)) res.lados++;
        continue;
      }
      var motivo = (cmp === 'clan')
        ? 'Clan distinto entre descargas (evidencia pregunta 44)'
        : 'Mismo battleTime, datos distintos';
      var detalle = 'battleTime ' + fila[BLS_COL.BATTLETIME] + ' | Tipo ' + fila[BLS_COL.TIPO] +
        ' | Guardado (' + previa[BLS_COL.ARCHIVO] + '): ' + _blsFirma_(previa) +
        ' | Nuevo (' + archivo.nombre + '): ' + _blsFirma_(fila);
      conflictos.push([motivo, detalle]);
      res.conflictos++;
    }

    if (res.nuevas > 0 || res.lados > 0) {
      // Mismo orden que la siembra (_blsGuardarTodo_): battleTime y luego Tag.
      filas.sort(function (a, c) {
        var ka = String(a[BLS_COL.BATTLETIME]), kc = String(c[BLS_COL.BATTLETIME]);
        if (ka !== kc) return ka < kc ? -1 : 1;
        var ta = String(a[BLS_COL.TAG]), tc = String(c[BLS_COL.TAG]);
        if (ta === tc) return 0;
        return ta < tc ? -1 : 1;
      });
      _blsRenumerar_(filas);
      _saveCSVToDrive(BLS_CSV_NOMBRE, _encodeCSV([BLS_HEADERS].concat(filas)));
    }

    if (conflictos.length) {
      var rev = _blsLeerCsv_(BLS_REVISION_CSV_NOMBRE, BLS_REVISION_HEADERS);
      if (!rev.ok) {
        Logger.log('[Battlelog] AVISO: ' + rev.error + ' Los ' + conflictos.length +
          ' conflicto(s) de ' + tag + ' NO se anotaron en ' + BLS_REVISION_CSV_NOMBRE + '.');
      } else {
        var revFilas = rev.rows;
        var vistos = {};
        for (var r = 0; r < revFilas.length; r++) {
          vistos[_blsClaveRevision_(revFilas[r][3], revFilas[r][4], revFilas[r][5])] = true;
        }
        var ts = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy HH:mm:ss');
        var agregoRev = false;
        for (var q = 0; q < conflictos.length; q++) {
          var kRev = _blsClaveRevision_(tag, conflictos[q][0], conflictos[q][1]);
          if (vistos[kRev]) continue;
          vistos[kRev] = true;
          revFilas.push(['', ts, 'Descarga Battlelog', tag, conflictos[q][0], conflictos[q][1]]);
          agregoRev = true;
        }
        if (agregoRev) {
          _blsRenumerar_(revFilas);
          _saveCSVToDrive(BLS_REVISION_CSV_NOMBRE, _encodeCSV([BLS_REVISION_HEADERS].concat(revFilas)));
        }
      }
    }
  } finally {
    lock.releaseLock();
  }
  return res;
}

/**
 * descargarUpcomingChestsJugador(playerTag) [→ Contexto_Base_Web.md §09B066]
 */

// playerTag que se usa si descargarUpcomingChestsJugador() se corre sin [→ Contexto_Base_Web.md §09B067]
var TAG_UPCOMINGCHESTS_A_CONSULTAR = '#2GG8PJ8GC';

function descargarUpcomingChestsJugador(playerTag) {
  if (playerTag === undefined || playerTag === null || String(playerTag).trim() === '') {
    playerTag = TAG_UPCOMINGCHESTS_A_CONSULTAR;
    Logger.log('[UpcomingChests] Consultando playerTag = ' + playerTag +
               ' (definido en la variable TAG_UPCOMINGCHESTS_A_CONSULTAR, arriba de esta función).');
  }
  var tag = String(playerTag || '').trim().toUpperCase();
  if (tag && tag.charAt(0) !== '#') tag = '#' + tag;
  if (!tag || tag === '#') {
    Logger.log('[UpcomingChests] descargarUpcomingChestsJugador(): falta el tag del jugador.');
    return false;
  }

  var data = _apiGet('/players/' + encodeTag(tag) + '/upcomingchests');
  if (!data || !Array.isArray(data.items)) {
    Logger.log('[UpcomingChests] No se pudo descargar upcomingchests de ' + tag +
               ' (respuesta vacía, sin "items", o el proxy falló).');
    return false;
  }

  var guardadoOk = false;
  try {
    var filename  = _buildBattlelogFilename(tag, ''); // sin clan disponible en este endpoint -> "Sin clan"
    var contenido = JSON.stringify(data, null, 2);
    var folder    = DriveApp.getFolderById(DRIVE_FOLDER_ID_UPCOMINGCHESTS);

    // Buscar si ya existe un archivo de este jugador en la carpeta (mismo [→ Contexto_Base_Web.md §09B068]
    var reTag = /-\s(#[0-9A-Z]+)\.json$/i;
    var archivoExistente = null;
    var archivos = folder.getFiles();
    while (archivos.hasNext()) {
      var f = archivos.next();
      var m = reTag.exec(f.getName());
      if (m && m[1].toUpperCase() === tag) {
        archivoExistente = f;
        break;
      }
    }

    if (archivoExistente) {
      if (archivoExistente.getName() !== filename) {
        archivoExistente.setName(filename);
      }
      _setContentConConteo_(archivoExistente, contenido);
      Logger.log('[UpcomingChests] ' + filename + ' actualizado (' + data.items.length + ' cofres).');
    } else {
      _createFileConConteo_(folder, filename, contenido, MimeType.PLAIN_TEXT);
      Logger.log('[UpcomingChests] ' + filename + ' creado (' + data.items.length + ' cofres).');
    }
    guardadoOk = true;
  } catch (e) {
    Logger.log('[UpcomingChests] Error guardando upcomingchests de ' + tag + ': ' + e.message);
    return false;
  }

  try {
    var agregadas = _actualizarBackupCofresConChests(data.items);
    if (agregadas > 0) {
      Logger.log('[UpcomingChests] Agregados ' + agregadas + ' cofre(s) nuevo(s) a Backup_Cofres.csv.');
    } else {
      Logger.log('[UpcomingChests] Sin cofres nuevos para Backup_Cofres.csv (' + data.items.length + ' en la cola de ' + tag + ').');
    }
  } catch (eCsv) {
    // El JSON ya quedó guardado (guardadoOk=true); un fallo aquí no lo revierte.
    Logger.log('[UpcomingChests] Error actualizando Backup_Cofres.csv: ' + eCsv.message);
  }

  return guardadoOk;
}

/**
 * _descargarBattlelogYCofresParaTodos() [→ Contexto_Base_Web.md §09B069]
 */
function _descargarBattlelogYCofresParaTodos() {
  // CAMBIO (29-sep-2026, pedido de la usuaria): ya no depende de [→ Contexto_Base_Web.md §09B070]
  if (BATTLELOGCHESTS_API_ENABLED !== true) {
    Logger.log('[Battlelog/UpcomingChests] BATTLELOGCHESTS_API_ENABLED no es `true` (valor actual: ' +
      BATTLELOGCHESTS_API_ENABLED + '): se omiten battlelog y upcomingchests en la corrida masiva ' +
      '(la web los descarga a pedido, una vez al dia por Tag).');
    return true;
  }

  // Mismo criterio que _fetchAllClanData(): asegura /players en cache antes [→ Contexto_Base_Web.md §09B071]
  var playersOk = true;
  if (_playersCompletoEnEstaEjecucion && CACHE_CLAN_DATA && CACHE_CLAN_DATA._players) {
    Logger.log('[Battlelog/UpcomingChests] /players ya se completó en esta ejecución, se omite repetir.');
  } else {
    playersOk = _fetchPlayersData();
  }
  if (!playersOk) {
    Logger.log('[Battlelog/UpcomingChests] /players quedó incompleto (presupuesto interno agotado); ' +
      'se reintenta este mismo paso en la próxima continuación, todavía sin tocar battlelog/upcomingchests.');
    return false;
  }

  var tags = _getTagsConPlayerCache(); // 31_Cards_Mazos.gs -- mismos tags con /players en cache
  if (!tags || tags.length === 0) {
    Logger.log('[Battlelog/UpcomingChests] Sin jugadores con /players en cache; nada que consultar.');
    return true;
  }

  // Cargar progreso de una tanda anterior de ESTE MISMO ciclo (ver [→ Contexto_Base_Web.md §09B072]
  var progreso = _cargarProgresoBattlelogChests();
  var hechos = {};
  if (progreso && progreso.length) {
    for (var h = 0; h < progreso.length; h++) hechos[progreso[h]] = true;
    Logger.log('[Battlelog/UpcomingChests] Progreso anterior recuperado de Drive: ' + progreso.length +
      ' jugador(es) ya procesados, no se vuelven a consultar.');
  }

  var pendientes = [];
  for (var p = 0; p < tags.length; p++) {
    if (!hechos[tags[p]]) pendientes.push(tags[p]);
  }

  Logger.log('[Battlelog/UpcomingChests] Pendientes: ' + pendientes.length + ' de ' + tags.length +
    ' totales (' + (tags.length - pendientes.length) + ' ya procesados).');

  var inicio = Date.now();
  var seCortoPorPresupuesto = false;
  var okBattlelog = 0;
  var okChests = 0;
  var m;

  for (m = 0; m < pendientes.length; m++) {
    if ((Date.now() - inicio) > CFG.BATTLELOGCHESTS_FETCH_BUDGET_MS) {
      Logger.log('[Battlelog/UpcomingChests] Presupuesto de tiempo (' +
        (CFG.BATTLELOGCHESTS_FETCH_BUDGET_MS / 1000) + 's) agotado en ' + m + '/' + pendientes.length +
        '. Se guarda el progreso y se corta aquí.');
      seCortoPorPresupuesto = true;
      break;
    }
    if (m >= CFG.BATTLELOGCHESTS_FETCH_MAX_POR_TANDA) {
      Logger.log('[Battlelog/UpcomingChests] Límite de ' + CFG.BATTLELOGCHESTS_FETCH_MAX_POR_TANDA +
        ' jugador(es) por tanda alcanzado en ' + m + '/' + pendientes.length +
        '. Se guarda el progreso y se corta aquí; la próxima continuación retoma exactamente donde quedó.');
      seCortoPorPresupuesto = true;
      break;
    }

    var tag = pendientes[m];
    try {
      if (descargarBattlelogJugador(tag)) okBattlelog++;
    } catch (eB) {
      Logger.log('[Battlelog] Error con ' + tag + ': ' + eB.message);
    }
    try {
      if (descargarUpcomingChestsJugador(tag)) okChests++;
    } catch (eC) {
      Logger.log('[UpcomingChests] Error con ' + tag + ': ' + eC.message);
    }
    hechos[tag] = true; // procesado (con o sin error) -- no se vuelve a reintentar solo por un error puntual
    Utilities.sleep(200);
  }

  if (seCortoPorPresupuesto) {
    _guardarProgresoBattlelogChests(Object.keys(hechos));
    Logger.log('[Battlelog/UpcomingChests] INCOMPLETO. Procesados hasta el corte: ' + Object.keys(hechos).length +
      '/' + tags.length + ' | Pendientes para la próxima continuación: ' + (pendientes.length - m) +
      ' | En esta tanda: ' + okBattlelog + ' battlelog(s) OK, ' + okChests + ' upcomingchest(s) OK.');
    _anotarProgresoPaso_('battlelog/upcomingchests: ' + Object.keys(hechos).length + '/' + tags.length + ' hechos', Object.keys(hechos).length); // PF283
    return false;
  }

  Logger.log('[Battlelog/UpcomingChests] Completado para ' + tags.length + ' jugador(es) (' +
    pendientes.length + ' procesados en esta tanda, ' + (tags.length - pendientes.length) +
    ' ya venían de una tanda anterior): ' + okBattlelog + ' battlelog(s) OK, ' + okChests + ' upcomingchest(s) OK.');
  return true;
}

// PERSISTENCIA DE PROGRESO DE BATTLELOG + UPCOMINGCHESTS (para reanudación [→ Contexto_Base_Web.md §09B073]

/**
 * _guardarProgresoBattlelogChests(tagsHechos) [→ Contexto_Base_Web.md §09B074]
 */
function _guardarProgresoBattlelogChests(tagsHechos) {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var files = folder.getFilesByName(BATTLELOGCHESTS_PROGRESS_FILE);
    var content = JSON.stringify({ _ts: Date.now(), tags: (tagsHechos || []) });
    if (files.hasNext()) {
      files.next().setContent(content);
    } else {
      folder.createFile(BATTLELOGCHESTS_PROGRESS_FILE, content, MimeType.PLAIN_TEXT);
    }
  } catch (e) {
    Logger.log('[Battlelog/UpcomingChests] Error guardando progreso en Drive: ' + e.message);
  }
}

/**
 * _cargarProgresoBattlelogChests() [→ Contexto_Base_Web.md §09B075]
 */
function _cargarProgresoBattlelogChests() {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var files = folder.getFilesByName(BATTLELOGCHESTS_PROGRESS_FILE);
    if (!files.hasNext()) return null;
    var file = files.next();
    var text = file.getBlob().getDataAsString('UTF-8');
    var parsed = JSON.parse(text);

    if (!parsed || typeof parsed !== 'object' || !parsed._ts) return null;

    var edadMs = Date.now() - Number(parsed._ts);
    if (edadMs > CFG.BATTLELOGCHESTS_PROGRESO_MAX_EDAD_MS) {
      Logger.log('[Battlelog/UpcomingChests] Progreso en Drive tiene ' + Math.round(edadMs / 60000) +
        ' min — más viejo que el máximo permitido (' + (CFG.BATTLELOGCHESTS_PROGRESO_MAX_EDAD_MS / 60000) +
        ' min). Se descarta como resto de un ciclo anterior, no se reutiliza.');
      file.setTrashed(true);
      return null;
    }

    return parsed.tags || null;
  } catch (e) {
    Logger.log('[Battlelog/UpcomingChests] Error cargando progreso desde Drive: ' + e.message);
    return null;
  }
}

/**
 * _borrarProgresoBattlelogChests() [→ Contexto_Base_Web.md §09B076]
 */
function _borrarProgresoBattlelogChests() {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var files = folder.getFilesByName(BATTLELOGCHESTS_PROGRESS_FILE);
    while (files.hasNext()) {
      files.next().setTrashed(true);
    }
  } catch (e) {
    Logger.log('[Battlelog/UpcomingChests] Error borrando progreso de Drive: ' + e.message);
  }
}

/**
 * _agregarCartasApiAMapa(map, items, esTorre) [→ Contexto_Base_Web.md §09B077]
 */
function _agregarCartasApiAMapa(map, items, esTorre) {
  for (var i = 0; i < items.length; i++) {
    var c = items[i];
    if (!c || c.id === undefined) continue;
    var iconUrls = c.iconUrls || {};
    map[String(c.id)] = {
      name:              c.name              || '',
      maxLevel:          c.maxLevel           || '',
      maxEvolutionLevel: c.maxEvolutionLevel !== undefined ? c.maxEvolutionLevel : '',
      rarity:            c.rarity             || '',
      elixirCost:        c.elixirCost !== undefined ? c.elixirCost : '',
      iconMedium:          iconUrls.medium          || '',
      iconHeroMedium:      iconUrls.heroMedium      || '',
      iconEvolutionMedium: iconUrls.evolutionMedium || '',
      esTorre:           esTorre === true
    };
  }
}

/**
 * _buildBattlelogFilename(playerTag, clanName) [→ Contexto_Base_Web.md §09B078]
 */
function _buildBattlelogFilename(playerTag, clanName) {
  var fechaHora = Utilities.formatDate(new Date(), 'America/Lima', 'dd-MM-yyyy HH.mm');
  var clan = (clanName && String(clanName).trim()) ? String(clanName).trim() : 'Sin clan';
  return fechaHora + ' - ' + clan + ' - ' + String(playerTag || '').trim() + '.json';
}

/**
 * _extraerClanDeBattlelog(data, playerTagNormalizado) [→ Contexto_Base_Web.md §09B079]
 */
function _extraerClanDeBattlelog(data, playerTagNormalizado) {
  for (var i = 0; i < data.length; i++) {
    var team = (data[i] && Array.isArray(data[i].team)) ? data[i].team : [];
    for (var j = 0; j < team.length; j++) {
      var integrante = team[j];
      var tagIntegrante = String((integrante && integrante.tag) || '').trim().toUpperCase();
      if (tagIntegrante === playerTagNormalizado && integrante.clan && integrante.clan.name) {
        return integrante.clan.name;
      }
    }
  }
  return '';
}

/**
 * _leerCofresCSV() [→ Contexto_Base_Web.md §09B080]
 */
function _leerCofresCSV() {
  // FIX (27-sep-2026): Link se agregó a mano a Backup_Cofres.csv; el
  // encabezado por defecto (archivo inexistente/vacío) ahora también la lleva.
  var headersDefault = ['N°', 'Name', 'Nombre', 'Link'];
  var csvText = _loadCSVFromDrive('Backup_Cofres.csv');
  if (!csvText) return { headers: headersDefault, rows: [] };

  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length === 0) return { headers: headersDefault, rows: [] };

  return { headers: parsed[0], rows: parsed.slice(1) };
}

/**
 * _guardarCofresCSV(headers, rows) [→ Contexto_Base_Web.md §09B081]
 */
function _guardarCofresCSV(headers, rows) {
  for (var i = 0; i < rows.length; i++) rows[i][0] = i + 1;
  _saveCSVToDrive('Backup_Cofres.csv', _encodeCSV([headers].concat(rows)));
}

/**
 * _actualizarBackupCofresConChests(items) [→ Contexto_Base_Web.md §09B082]
 */
function _actualizarBackupCofresConChests(items) {
  if (!items || !items.length) return 0;

  var csv = _leerCofresCSV();

  var existentes = {};
  var idxNameExist = csv.headers.indexOf('Name'); // por nombre de columna (FIX 27-sep-2026); 1 si no se encuentra
  if (idxNameExist < 0) idxNameExist = 1;
  for (var e = 0; e < csv.rows.length; e++) {
    var nameExist = String(csv.rows[e][idxNameExist] || '').trim(); // columna Name
    if (nameExist) existentes[nameExist] = true;
  }

  var nuevasFilas = [];
  var vistosEnEstaTanda = {};
  for (var i = 0; i < items.length; i++) {
    var nombreCofre = String((items[i] && items[i].name) || '').trim();
    if (!nombreCofre) continue;
    if (existentes[nombreCofre] || vistosEnEstaTanda[nombreCofre]) continue;
    vistosEnEstaTanda[nombreCofre] = true;
    // FIX (27-sep-2026, pedido usuario -- se agregó a mano la columna Link a [→ Contexto_Base_Web.md §09B083]
    var filaNueva = [];
    for (var c = 0; c < csv.headers.length; c++) filaNueva.push('');
    var idxNameCol = csv.headers.indexOf('Name');
    filaNueva[idxNameCol > -1 ? idxNameCol : 1] = nombreCofre;
    nuevasFilas.push(filaNueva);
  }

  if (nuevasFilas.length === 0) return 0;

  for (var j = 0; j < nuevasFilas.length; j++) csv.rows.push(nuevasFilas[j]);
  _guardarCofresCSV(csv.headers, csv.rows);
  return nuevasFilas.length;
}

/**
 * _leerArenaCSV() [→ Contexto_Base_Web.md §09B084]
 */
function _leerArenaCSV() {
  var headersDefault = ['N°', 'ID', 'Name', 'RawName', 'Nombre', 'Nombre_2'];
  var csvText = _loadCSVFromDrive('Backup_Arena.csv');
  if (!csvText) return { headers: headersDefault, rows: [] };

  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length === 0) return { headers: headersDefault, rows: [] };

  return { headers: parsed[0], rows: parsed.slice(1) };
}

/**
 * _guardarArenaCSV(headers, rows) [→ Contexto_Base_Web.md §09B085]
 */
function _guardarArenaCSV(headers, rows) {
  rows.sort(function (a, b) {
    var nameA = String(a[2] || ''), nameB = String(b[2] || '');
    if (nameA !== nameB) return nameA < nameB ? -1 : 1;
    var rawA = String(a[3] || ''), rawB = String(b[3] || '');
    if (rawA === rawB) return 0;
    return rawA < rawB ? -1 : 1;
  });
  for (var i = 0; i < rows.length; i++) rows[i][0] = i + 1;
  _saveCSVToDrive('Backup_Arena.csv', _encodeCSV([headers].concat(rows)));
  _ARENA_INDICE_MEMO = null; // 08-oct-2026: el catálogo cambió; _resolverArenaDesdeCatalogo() lo vuelve a leer
}

/**
 * _actualizarBackupArenaConBattlelog(battles) [→ Contexto_Base_Web.md §09B086]
 */
function _actualizarBackupArenaConBattlelog(battles) {
  if (!battles || !battles.length) return 0;

  var csv = _leerArenaCSV();

  var existentes = {};
  for (var e = 0; e < csv.rows.length; e++) {
    var idExist = String(csv.rows[e][1] || '').trim(); // columna ID
    if (idExist) existentes[idExist] = true;
  }

  var nuevasFilas = [];
  var vistosEnEstaTanda = {};
  for (var i = 0; i < battles.length; i++) {
    var arena = battles[i] && battles[i].arena;
    if (!arena || arena.id === undefined || arena.id === null) continue;
    var idStr = String(arena.id).trim();
    if (!idStr || existentes[idStr] || vistosEnEstaTanda[idStr]) continue;
    vistosEnEstaTanda[idStr] = true;
    nuevasFilas.push([
      '',                                 // N° (se asigna en _guardarArenaCSV)
      Number(arena.id),                   // ID
      String(arena.name || ''),           // Name
      String(arena.rawName || ''),        // RawName
      '',                                 // Nombre (traducción manual)
      ''                                  // Nombre_2 (traducción manual)
    ]);
  }

  if (nuevasFilas.length === 0) return 0;

  for (var j = 0; j < nuevasFilas.length; j++) csv.rows.push(nuevasFilas[j]);
  _guardarArenaCSV(csv.headers, csv.rows);
  return nuevasFilas.length;
}

/**
 * _resolverArenaDesdeCatalogo(rawName) [→ Contexto_Base_Web.md §09B087]
 */
// CAMBIO 08-oct-2026 (rendimiento): antes cada llamada hacía _leerArenaCSV() (leer y parsear Backup_Arena.csv de Drive, ~750 ms) y el roster la llama una vez por miembro (~90 s). Ahora el catálogo se resuelve UNA vez por ejecución a un índice rawName -> texto final (mismo criterio de siempre: primera fila con ese RawName; Nombre, si no Name, + ' (Nombre_2)'; sin base, el rawName). _guardarArenaCSV() lo invalida, así una ejecución que agrega arenas nuevas ve el catálogo actualizado.
var _ARENA_INDICE_MEMO = null;
function _resolverArenaDesdeCatalogo(rawName) {
  var rawStr = String(rawName === undefined || rawName === null ? '' : rawName).trim();
  if (!rawStr) return '';

  if (!_ARENA_INDICE_MEMO) {
    var idx = {};
    var csv = _leerArenaCSV();
    for (var i = 0; i < csv.rows.length; i++) {
      var raw = String(csv.rows[i][3] || '').trim();
      if (!raw || Object.prototype.hasOwnProperty.call(idx, raw)) continue; // la primera fila con ese RawName manda
      var nombreManual = String(csv.rows[i][4] || '').trim(); // Nombre (E)
      var nameIngles   = String(csv.rows[i][2] || '').trim(); // Name (C)
      var nombre2      = String(csv.rows[i][5] || '').trim(); // Nombre_2 (F) -- antes no se leía
      var base = nombreManual || nameIngles;
      idx[raw] = base ? (nombre2 ? (base + ' (' + nombre2 + ')') : base) : raw; // sin Nombre ni Name completos -- se cae al rawName
    }
    _ARENA_INDICE_MEMO = idx;
  }
  return Object.prototype.hasOwnProperty.call(_ARENA_INDICE_MEMO, rawStr) ? _ARENA_INDICE_MEMO[rawStr] : rawStr; // sin match en el catálogo -- se muestra el rawName tal cual llegó
}

/**
 * _actualizarBackupModoConBattlelog(battles) [→ Contexto_Base_Web.md §09B088]
 */
function _actualizarBackupModoConBattlelog(battles) {
  var resultado = { agregadas: 0, completadas: 0 };
  if (!battles || !battles.length) return resultado;

  var csv = _leerModoCSV();

  // Índice ID -> índice de fila, para no recorrer csv.rows por cada batalla.
  var indicePorId = {};
  for (var r = 0; r < csv.rows.length; r++) {
    var idFila = String(csv.rows[r][1] || '').trim();
    if (idFila) indicePorId[idFila] = r;
  }

  var vistosEnEstaTanda = {};
  var huboCambio = false;
  for (var i = 0; i < battles.length; i++) {
    var gameMode = battles[i] && battles[i].gameMode;
    if (!gameMode || gameMode.id === undefined || gameMode.id === null) continue;
    var idStr = String(gameMode.id).trim();
    if (!idStr || vistosEnEstaTanda[idStr]) continue;
    vistosEnEstaTanda[idStr] = true;
    var nameBattlelog = String(gameMode.name || '').trim();

    if (Object.prototype.hasOwnProperty.call(indicePorId, idStr)) {
      var fila = csv.rows[indicePorId[idStr]];
      var nameActual = String(fila[2] || '').trim(); // columna Name
      if (!nameActual && nameBattlelog) {
        fila[2] = nameBattlelog;
        resultado.completadas++;
        huboCambio = true;
      }
    } else if (nameBattlelog) {
      csv.rows.push(['', Number(gameMode.id), nameBattlelog, '']);
      indicePorId[idStr] = csv.rows.length - 1;
      resultado.agregadas++;
      huboCambio = true;
    }
  }

  if (huboCambio) _guardarModoCSV(csv.headers, csv.rows);
  return resultado;
}

/**
 * _guardarJsonClanesConsultaTemporalEnDrive(datos) [→ Contexto_Base_Web.md §09B089]
 */
function _guardarJsonClanesConsultaTemporalEnDrive(datos) {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_CLANS_CONSULTA_TEMPORAL);
    var filename = 'clans_consulta_temporal.json';
    var contenido = JSON.stringify(datos, null, 2);
    var existentes = folder.getFilesByName(filename);
    if (existentes.hasNext()) {
      _setContentConConteo_(existentes.next(), contenido);
    } else {
      _createFileConConteo_(folder, filename, contenido, MimeType.PLAIN_TEXT);
    }
    return true;
  } catch (e) {
    Logger.log('[ClanesConsultaTemporal] Error guardando ' + filename + ': ' + e.message);
    return false;
  }
}

/**
 * _guardarJsonBusquedaNombreEnDrive(nombreBuscado, datos) [→ Contexto_Base_Web.md §09B090]
 */
function _guardarJsonBusquedaNombreEnDrive(nombreBuscado, datos) {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_TORNEOS_BUSQUEDA_NOMBRE);
    var filename = 'Busqueda - ' + nombreBuscado + '.json';
    var contenido = JSON.stringify(datos, null, 2);
    var existentes = folder.getFilesByName(filename);
    if (existentes.hasNext()) {
      _setContentConConteo_(existentes.next(), contenido);
    } else {
      _createFileConConteo_(folder, filename, contenido, MimeType.PLAIN_TEXT);
    }
  } catch(e) {
    Logger.log('[Torneos] Error guardando JSON de búsqueda "' + nombreBuscado + '": ' + e.message);
  }
}

// ----- Funciones internas / helpers -----

// SECCION 2: RESTO DE FUNCIONES (cache, fetch de API, helpers internos). [→ Contexto_Base_Web.md §09B091]

/**
 * Llama solo a /clans/{tag} y /clans/{tag}/currentriverrace para todos los [→ Contexto_Base_Web.md §09B092]
 */
function _fetchClanesBasico(maxEdadMs) {
  if (_clanesBasicoListoEnEstaEjecucion && CACHE_CLAN_DATA) {
    Logger.log('[API] _fetchClanesBasico: ya se obtuvo en esta ejecución, se omite repetir.');
    return;
  }

  // FIX (06-ago-2026): antes, esta función SIEMPRE pedía los 5 clanes a la [→ Contexto_Base_Web.md §09B093]
  var progreso = _cargarProgresoClanes(maxEdadMs);
  if (progreso && Object.keys(progreso).length === CFG.CLAN_TAGS.length) {
    CACHE_CLAN_DATA = progreso;
    _clanesBasicoListoEnEstaEjecucion = true;
    _clanesBasicoDesdeApiEnEstaEjecucion = false;  // PF091: datos del checkpoint, no de una consulta nueva
    _playersCompletoEnEstaEjecucion = false;
    Logger.log('[API] Progreso anterior de clanes recuperado de Drive (' +
               Object.keys(progreso).length + ' clan(es)), no se vuelven a pedir a la API.');
    return;
  }

  CACHE_CLAN_DATA = {};
  CLANES_SIN_RIVERRACE = [];
  CLANES_INFO_RESPALDO = [];  // PF091
  var huboFallbackInfo = false;
  // FIX (02-oct-2026): último checkpoint conocido (sin importar su edad) como
  // respaldo SOLO para /clans/{tag} (roster) cuando la API falla.
  var respaldoClanes = null;
  Logger.log('[API] Iniciando _fetchAllClanData para ' + CFG.CLAN_TAGS.length + ' clanes...');

  for (var i = 0; i < CFG.CLAN_TAGS.length; i++) {
    var tag = CFG.CLAN_TAGS[i];
    Logger.log('[API] Consultando clan: ' + tag);

    // Endpoint principal: /clans/{tag}
    var info = _apiGet('/clans/' + encodeTag(tag));

    // Endpoint de guerra: /clans/{tag}/currentriverrace
    var riverrace = _apiGet('/clans/' + encodeTag(tag) + '/currentriverrace');

    // LOG DE PERIODO (05-oct-2026, pedido usuario): sectionIndex/periodIndex/periodType TAL CUAL los [→ Contexto_Base_Web.md §09B094]
    try {
      var _nmLog = (info && info.name) ? info.name : '?';
      var _linea = _lineaPeriodoClan_('API', _nmLog, tag, riverrace, null, null);
      if (riverrace && riverrace.clan && riverrace.clan.participants) {
        var _pp = riverrace.clan.participants, _sH = 0, _sS = 0, _sF = 0;
        for (var _q = 0; _q < _pp.length; _q++) {
          _sH += Number(_pp[_q].decksUsedToday) || 0;
          _sS += Number(_pp[_q].decksUsed) || 0;
          _sF += Number(_pp[_q].fame) || 0;
        }
        _linea += ' | participantes=' + _pp.length + ' sum(decksUsedToday)=' + _sH + ' sum(decksUsed)=' + _sS + ' sum(fame)=' + _sF;
      }
      Logger.log(_linea);
    } catch (eLogPer) { Logger.log('[API][PERIODO] no se pudo armar el log de periodo para ' + tag + ': ' + eLogPer.message); }

    // Solo agregar al cache si la info principal llegó correctamente
    if (info) {
      // Filtrar cuentas ocultas manualmente (ver CFG.TAGS_OCULTOS en [→ Contexto_Base_Web.md §09B095]
      var memberListFiltrado = (info.memberList || []).filter(function(m) {
        return !esTagOculto(m.tag);
      });
      CACHE_CLAN_DATA[tag] = {
        info:      info,
        members:   memberListFiltrado,
        riverrace: riverrace
      };
      Logger.log('[API] OK clan ' + tag + ' | miembros: ' + memberListFiltrado.length);
      if (!riverrace) CLANES_SIN_RIVERRACE.push(tag);
    } else {
      // API falló para este clan. FIX (02-oct-2026): antes el clan quedaba [→ Contexto_Base_Web.md §09B096]
      if (respaldoClanes === null) respaldoClanes = _cargarProgresoClanesSinEdad() || {};
      var prev = respaldoClanes[tag];
      if (prev && prev.info) {
        CACHE_CLAN_DATA[tag] = { info: prev.info, members: prev.members || [], riverrace: riverrace };
        huboFallbackInfo = true;
        CLANES_INFO_RESPALDO.push(tag);  // PF091: este /clans no es fresco
        if (!riverrace) CLANES_SIN_RIVERRACE.push(tag);
        Logger.log('[API] FALLO info de clan ' + tag + ' - se usa el roster del último checkpoint (' +
                   (prev.members || []).length + ' miembros).');
      } else {
        Logger.log('[API] FALLO al obtener info de clan ' + tag + ' - sin respaldo disponible, clan omitido.');
      }
    }

    // Pausa entre clanes para no saturar la API
    Utilities.sleep(300);
  }

  // RESUMEN DE PERIODOS (05-oct-2026): si los clanes no reportan el mismo periodIndex en esta corrida
  // (normal entre las 4 y las 5 a.m. de Lima) queda dicho explicitamente en el log.
  try {
    var _pis = [], _distintos = {}, _sinDato = [];
    for (var _t in CACHE_CLAN_DATA) {
      var _rrT = CACHE_CLAN_DATA[_t] && CACHE_CLAN_DATA[_t].riverrace;
      var _valido = !!(_rrT && _rrT.periodIndex !== undefined && _rrT.periodIndex !== null && !isNaN(Number(_rrT.periodIndex)));
      _pis.push(_t + '=' + (_valido ? Number(_rrT.periodIndex) : 'sin dato'));
      if (_valido) _distintos[Number(_rrT.periodIndex)] = true; else _sinDato.push(_t);
    }
    // FIX (05-oct-2026): "sin dato" (404 / clan fuera de la carrera) ya NO cuenta como "no coincide":
    // solo se compara entre los clanes que SI trajeron periodIndex; los que no, se listan aparte.
    var _nDist = Object.keys(_distintos).length;
    Logger.log('[API][PERIODO] RESUMEN periodIndex por clan: ' + _pis.join(', ') +
      (_nDist > 1 ? ' -> LOS CLANES NO COINCIDEN en esta corrida.'
        : (_nDist === 1 ? ' -> los clanes con dato coinciden.' : ' -> ningun clan trajo periodIndex.')) +
      (_sinDato.length ? ' | SIN currentriverrace: ' + _sinDato.join(', ') + ' (404 o fuera de la carrera; no se escribe nada para ellos).' : ''));
  } catch (eResPer) { Logger.log('[API][PERIODO] no se pudo armar el resumen: ' + eResPer.message); }

  // FIX (06-ago-2026): guarda lo recién obtenido en Drive para que la [→ Contexto_Base_Web.md §09B097]
  var _consultaCompleta = (!huboFallbackInfo && CLANES_SIN_RIVERRACE.length === 0 && Object.keys(CACHE_CLAN_DATA).length === CFG.CLAN_TAGS.length);
  if (_consultaCompleta) {
    _guardarProgresoClanes(CACHE_CLAN_DATA);
  } else {
    Logger.log('[API] Resultado incompleto/con respaldo: NO se sobrescribe el checkpoint de clanes en Drive.');
  }

  // NUEVO (05-oct-2026, pedido usuario: "mostrar en la web la ultima hora de consulta a la api"): se anota que [→ Contexto_Base_Web.md §09B098]
  try { _registrarConsultaApiClanes_(_consultaCompleta); }
  catch (eRegApi) { Logger.log('[API] No se pudo registrar la hora de la consulta a la API: ' + eRegApi.message); }

  _clanesBasicoListoEnEstaEjecucion = true;
  _clanesBasicoDesdeApiEnEstaEjecucion = true;      // PF091: datos recien pedidos a la API
  _jsonClanesEscritosEnEstaEjecucion = false;       // PF091: datos nuevos, se pueden escribir de nuevo
  // Cache de jugadores nuevo en esta ejecución: aún no se ha pedido.
  _playersCompletoEnEstaEjecucion = false;
}

/**
 * PF091 (17-oct-2026): anota la hora de la PRIMERA consulta de cada clan y periodIndex directamente de lo recien pedido a la
 * API (solo una propiedad de script, sin Drive; nunca reemplaza una hora ya registrada). Se llama en TODAS las capturas, tambien
 * en la ventana de 4 a 5 a. m., para que un periodo nuevo que aparece a las 4:xx quede con su hora real aunque la ventana no
 * escriba JSON. Solo actua si esta ejecucion pidio a la API. [→ Contexto_Base_Web.md §PF091]
 */
function _registrarPrimeraConsultaDesdeCaptura_() {
  if (!_clanesBasicoDesdeApiEnEstaEjecucion) return;
  try {
    var ctx = _getCtx();
    var ahora = new Date().getTime();
    for (var i = 0; i < CFG.CLAN_TAGS.length; i++) {
      var tag = CFG.CLAN_TAGS[i];
      var d = CACHE_CLAN_DATA && CACHE_CLAN_DATA[tag];
      var rr = d && d.riverrace;
      if (!rr || rr.periodIndex === '' || rr.periodIndex === null || rr.periodIndex === undefined || !isFinite(Number(rr.periodIndex))) continue;
      _registrarPrimeraConsultaRR_(tag, _temporadaDeClan_(ctx, Number(rr.periodIndex)), Number(rr.periodIndex), ahora);
    }
  } catch (e) {
    Logger.log('[Captura] No se pudo registrar la primera consulta: ' + e.message);
  }
}

/**
 * PF091 (17-oct-2026): escribe en Drive los JSON de clans y currentriverrace de cada clan con las MISMAS respuestas que acaba de
 * traer la captura (sin ninguna llamada nueva a la API); es lo que antes hacia guardarApiDump() pidiendo de nuevo. Usa
 * _guardarCacheEnDrive(): un solo archivo por clan, endpoint y periodo; el de currentriverrace conserva la hora de la primera
 * consulta en el nombre. No escribe el /clans de un clan cuyo roster salio del respaldo del checkpoint, ni clanes sin riverrace.
 * Solo actua si esta ejecucion pidio a la API y no escribio ya estos datos. Devuelve cuantos archivos escribio.
 * [→ Contexto_Base_Web.md §PF091]
 */
function _guardarJsonClanesDesdeCaptura_(forzar) {
  // forzar = true (guardarApiDump): escribe aunque los datos vengan del checkpoint (el checkpoint solo se guarda con los 5 clanes
  // completos y sin respaldo, asi que son datos de una consulta real); sin forzar, solo si esta ejecucion pidio a la API.
  if (_jsonClanesEscritosEnEstaEjecucion) return 0;
  if (!forzar && !_clanesBasicoDesdeApiEnEstaEjecucion) return 0;
  if (!CACHE_CLAN_DATA || Object.keys(CACHE_CLAN_DATA).length === 0) return 0;
  var t0 = Date.now();
  var total = 0;
  var nombresEscritos = [];
  try {
    var ctx = _getCtx();
    _logJsonCapturaAcumulado_ = nombresEscritos;   // PF091 etapa 4: una sola entrada en Log_ScriptTerna.json al terminar
    for (var i = 0; i < CFG.CLAN_TAGS.length; i++) {
      var tag = CFG.CLAN_TAGS[i];
      var d = CACHE_CLAN_DATA && CACHE_CLAN_DATA[tag];
      if (!d) continue;
      if (d.info && CLANES_INFO_RESPALDO.indexOf(tag) < 0) { _guardarCacheEnDrive(tag, 'clans', ctx, d.info); total++; }
      if (d.riverrace) { _guardarCacheEnDrive(tag, 'currentriverrace', ctx, d.riverrace); total++; }
    }
    _jsonClanesEscritosEnEstaEjecucion = true;
    // PF091 etapa 4: hora de la ultima escritura completa, para que otra ejecucion (guardarApiDump() tras una continuacion) sepa que ya estan.
    if (total > 0) {
      try { PropertiesService.getScriptProperties().setProperty('CLANES_JSON_ESCRITOS_TS', String(Date.now())); } catch (eTs) { /* solo informativa */ }
    }
  } catch (e) {
    Logger.log('[Captura][JSON] Error escribiendo los JSON: ' + e.message);
  }
  // PF091 etapa 4: se suelta el acumulador (siempre, incluso tras un error) y se registra UNA entrada con todos los archivos.
  _logJsonCapturaAcumulado_ = null;
  if (nombresEscritos.length > 0) {
    _registrarLogScriptTerna(
      '_guardarJsonClanesDesdeCaptura_()',
      'JSON de clans y currentriverrace guardados en Drive (' + nombresEscritos.length + ' archivo(s)): ' + nombresEscritos.join(' | '),
      []
    );
  }
  _jsonClanesUltimoTotal = total;
  Logger.log('[Captura][JSON] ' + total + ' archivo(s) escrito(s) en ' + Math.round((Date.now() - t0) / 100) / 10 + ' s');
  return total;
}

/**
 * PF091 etapa 4 (17-oct-2026): true si los JSON de clans y currentriverrace ya se escribieron DESPUES de que se guardo el checkpoint de
 * clanes que hay hoy en Drive (propiedad CLANES_JSON_ESCRITOS_TS >= hora del checkpoint). Si el checkpoint viene de una captura de la
 * ventana de 4 a 5 a. m. (que no escribe JSON), la propiedad es anterior y devuelve false. Ante cualquier duda devuelve false (se escribe).
 * [→ Contexto_Base_Web.md §PF091]
 */
function _jsonClanesDeEsteCheckpointYaEscritos_() {
  try {
    var escritos = Number(PropertiesService.getScriptProperties().getProperty('CLANES_JSON_ESCRITOS_TS')) || 0;
    if (escritos <= 0) return false;
    var cp = _leerProgresoClanesConEdad_();
    return !!(cp && cp.ts > 0 && escritos >= cp.ts);
  } catch (e) {
    return false;
  }
}

// PERSISTENCIA DE PROGRESO DE CLANES (para reanudación sin repetir) [→ Contexto_Base_Web.md §09B099]

/**
 * _guardarProgresoClanes(cacheClanData) [→ Contexto_Base_Web.md §09B100]
 */
function _guardarProgresoClanes(cacheClanData) {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var files = folder.getFilesByName(CLANES_PROGRESO_FILE);

    var soloClanes = {};
    for (var i = 0; i < CFG.CLAN_TAGS.length; i++) {
      var tag = CFG.CLAN_TAGS[i];
      if (cacheClanData[tag]) soloClanes[tag] = cacheClanData[tag];
    }

    var content = JSON.stringify({ _ts: Date.now(), clanes: soloClanes });
    if (files.hasNext()) {
      files.next().setContent(content);
    } else {
      folder.createFile(CLANES_PROGRESO_FILE, content, MimeType.PLAIN_TEXT);
    }
  } catch (e) {
    Logger.log('[API] Error guardando progreso de clanes en Drive: ' + e.message);
  }
}

/**
 * _cargarProgresoClanes(maxEdadMs) [→ Contexto_Base_Web.md §09B101]
 */
function _cargarProgresoClanes(maxEdadMs) {
  var umbral = (typeof maxEdadMs === 'number') ? maxEdadMs : CFG.CLANES_PROGRESO_MAX_EDAD_MS;
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var files = folder.getFilesByName(CLANES_PROGRESO_FILE);
    if (!files.hasNext()) return null;
    var file = files.next();
    var parsed = JSON.parse(file.getBlob().getDataAsString('UTF-8'));
    if (!parsed || !parsed._ts) return null;

    var edadMs = Date.now() - Number(parsed._ts);
    if (edadMs > umbral) {
      Logger.log('[API] Progreso de clanes en Drive tiene ' + Math.round(edadMs / 60000) +
                 ' min — más viejo que el máximo permitido (' + (umbral / 60000) +
                 ' min). Se descarta, no se reutiliza (se pedirá fresco a la API).');
      // NOTA (08-ago-2026): antes esto siempre borraba el archivo [→ Contexto_Base_Web.md §09B102]
      return null;
    }
    return parsed.clanes || null;
  } catch (e) {
    Logger.log('[API] Error cargando progreso de clanes desde Drive: ' + e.message);
    return null;
  }
}

/**
 * _cargarProgresoClanesSinEdad() [→ Contexto_Base_Web.md §09B103]
 */
function _cargarProgresoClanesSinEdad() {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var files = folder.getFilesByName(CLANES_PROGRESO_FILE);
    if (!files.hasNext()) return null;
    var parsed = JSON.parse(files.next().getBlob().getDataAsString('UTF-8'));
    return (parsed && parsed.clanes) ? parsed.clanes : null;
  } catch (e) {
    Logger.log('[API] Error cargando respaldo de clanes: ' + e.message);
    return null;
  }
}

/**
 * _invalidarProgresoClanes() [→ Contexto_Base_Web.md §09B104]
 */
function _invalidarProgresoClanes() {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var files = folder.getFilesByName(CLANES_PROGRESO_FILE);
    while (files.hasNext()) {
      var f = files.next();
      var parsed = JSON.parse(f.getBlob().getDataAsString('UTF-8'));
      if (parsed) {
        // NUEVO (05-oct-2026): se conserva la hora real de captura en _tsReal (solo la primera vez) para que [→ Contexto_Base_Web.md §09B105]
        if (!parsed._tsReal && parsed._ts) parsed._tsReal = parsed._ts;
        parsed._ts = 0;
        _setContentConConteo_(f, JSON.stringify(parsed));
      }
    }
  } catch (e) {
    Logger.log('[API] Error invalidando progreso de clanes: ' + e.message);
  }
}

// LECTURA DEL CHECKPOINT DE CLANES SIN LLAMAR A LA API (05-oct-2026, pedido usuario) [→ Contexto_Base_Web.md §09B106]

// Edad maxima aceptada por las lecturas SIN API. Por encima de este valor se considera que la captura de [→ Contexto_Base_Web.md §09B107]
var CLANES_SIN_API_MAX_EDAD_MS = 3 * 60 * 60 * 1000;

// Hora (_ts, ms) del checkpoint que cargo la ultima llamada a _fetchClanesBasicoSinApi() EN ESTA EJECUCION.
// Sirve para saber si hay una captura nueva desde la ultima vez que se proceso (0 = nada cargado).
var CLANES_SIN_API_TS_CARGADO = 0;

/**
 * _leerProgresoClanesConEdad_() [→ Contexto_Base_Web.md §09B108]
 */
function _leerProgresoClanesConEdad_() {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var files = folder.getFilesByName(CLANES_PROGRESO_FILE);
    if (!files.hasNext()) return null;
    var parsed = JSON.parse(files.next().getBlob().getDataAsString('UTF-8'));
    if (!parsed || !parsed.clanes) return null;
    var ts = Number(parsed._ts) || Number(parsed._tsReal) || 0;
    return { clanes: parsed.clanes, ts: ts, edadMs: ts > 0 ? (Date.now() - ts) : Infinity };
  } catch (e) {
    Logger.log('[API][SinAPI] Error leyendo el checkpoint de clanes: ' + e.message);
    return null;
  }
}

/**
 * _fetchClanesBasicoSinApi(maxEdadMs) [→ Contexto_Base_Web.md §09B109]
 */
function _fetchClanesBasicoSinApi(maxEdadMs) {
  if (_clanesBasicoListoEnEstaEjecucion && CACHE_CLAN_DATA) {
    Logger.log('[API][SinAPI] El cache de clanes ya esta cargado en esta ejecucion, se omite repetir la lectura.');
    return true;
  }
  var umbral = (typeof maxEdadMs === 'number') ? maxEdadMs : CLANES_SIN_API_MAX_EDAD_MS;
  var cp = _leerProgresoClanesConEdad_();
  if (!cp) {
    Logger.log('[API][SinAPI] No hay checkpoint de clanes legible en Drive. NO se llama a la API; se espera a la proxima captura de runGuerra().');
    return false;
  }
  if (cp.edadMs > umbral) {
    Logger.log('[API][SinAPI] El checkpoint de clanes tiene ' +
      (cp.edadMs === Infinity ? 'edad desconocida' : Math.round(cp.edadMs / 60000) + ' min') +
      ' (maximo aceptado: ' + Math.round(umbral / 60000) + ' min). NO se usa y NO se llama a la API; se espera a la proxima captura de runGuerra().');
    return false;
  }

  var cache = {}, sinRiver = [], faltan = [], resumen = [];
  for (var i = 0; i < CFG.CLAN_TAGS.length; i++) {
    var tag = CFG.CLAN_TAGS[i];
    var cd = cp.clanes[tag];
    if (!cd || !cd.info) { faltan.push(tag); continue; }
    cache[tag] = cd;
    if (!cd.riverrace) sinRiver.push(tag);
    var pi = (cd.riverrace && cd.riverrace.periodIndex !== undefined && cd.riverrace.periodIndex !== null) ? cd.riverrace.periodIndex : 'sin dato';
    resumen.push(tag + '=' + pi);
  }
  if (faltan.length) {
    Logger.log('[API][SinAPI] Al checkpoint le faltan clanes (' + faltan.join(', ') + '). NO se usa y NO se llama a la API.');
    return false;
  }

  CACHE_CLAN_DATA = cache;
  CLANES_SIN_RIVERRACE = sinRiver;
  CLANES_SIN_API_TS_CARGADO = cp.ts;
  _clanesBasicoListoEnEstaEjecucion = true;
  _playersCompletoEnEstaEjecucion = false;
  Logger.log('[API][SinAPI] Clanes cargados del checkpoint de Drive (captura de hace ' + Math.round(cp.edadMs / 60000) +
    ' min, ' + Utilities.formatDate(new Date(cp.ts), 'America/Lima', 'dd/MM HH:mm:ss') + ' Lima) SIN llamar a la API | periodIndex: ' + resumen.join(', '));
  return true;
}

/**
 * _borrarProgresoClanes() [→ Contexto_Base_Web.md §09B110]
 */
function _borrarProgresoClanes() {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var files = folder.getFilesByName(CLANES_PROGRESO_FILE);
    while (files.hasNext()) files.next().setTrashed(true);
  } catch (e) {
    Logger.log('[API] Error borrando progreso de clanes en Drive: ' + e.message);
  }
}

/**
 * Llama a la API para todos los clanes (datos básicos) Y, si [→ Contexto_Base_Web.md §09B111]
 */
function _fetchAllClanData() {
  // PF091 (17-oct-2026): los clanes se piden a traves de capturarApiClanes_() (00_Main.gs), que ademas anota la primera consulta y
  // escribe los JSON de clans y currentriverrace con esas respuestas (sin volver a pedir). Misma edad maxima de siempre (45 min).
  capturarApiClanes_(CFG.CLANES_PROGRESO_MAX_EDAD_MS, 'runUpdate/runAll');

  // IMPORTANTE: _fetchPlayersData() SIEMPRE se llama, sin importar [→ Contexto_Base_Web.md §09B112]
  var playersCompleto = true;
  if (_playersCompletoEnEstaEjecucion && CACHE_CLAN_DATA._players) {
    Logger.log('[API] /players: ya se completó en esta ejecución, se omite repetir.');
  } else {
    playersCompleto = _fetchPlayersData();
    if (playersCompleto) _playersCompletoEnEstaEjecucion = true;
  }

  Logger.log('[API] _fetchAllClanData completado. Clanes en cache: ' + Object.keys(CACHE_CLAN_DATA).length +
             (playersCompleto ? '' : ' | ATENCIÓN: /players quedó incompleto, se reintentará en la próxima continuación.'));

  // Se propaga hacia _ejecutarPorTandas() (00_Main.gs): si /players quedó [→ Contexto_Base_Web.md §09B113]
  return playersCompleto;
}

/**
 * Llama a /players/{tag} según el valor de PLAYERS_API_ENABLED. [→ Contexto_Base_Web.md §09B114]
 */
function _fetchPlayersData() {
  // FASE 1 (plan de cambios, ver 01_Config_Global.gs): interruptor de "esta [→ Contexto_Base_Web.md §09B115]
  if (SUPRIMIR_PLAYERS_TEMPORAL === true) {
    Logger.log('[API] _fetchPlayersData: SUPRIMIR_PLAYERS_TEMPORAL=true, se omite POR COMPLETO la consulta a /players (ni siquiera admins).');
    return false;
  }

  if (!CACHE_CLAN_DATA) {
    Logger.log('[API] _fetchPlayersData: CACHE_CLAN_DATA vacío, se obtiene primero la info básica de clanes.');
    capturarApiClanes_(CFG.CLANES_PROGRESO_MAX_EDAD_MS, 'API_ClashRoyale');
  }
  if (_playersCompletoEnEstaEjecucion && CACHE_CLAN_DATA._players) {
    Logger.log('[API] _fetchPlayersData: /players ya se completó en esta ejecución, se omite repetir.');
    return true;
  }
  Logger.log('[API] PLAYERS_API_ENABLED=' + PLAYERS_API_ENABLED + '. Iniciando consulta /players...');

  var tagsToFetch = [];

  // FASE 12 (18/07/2026): los admins se cargan PRIMERO, antes que los [→ Contexto_Base_Web.md §09B116]
  if (PLAYERS_API_ENABLED !== false) {
    var tagsAdmin = _getTagsAdmin();
    for (var a = 0; a < tagsAdmin.length; a++) {
      if (tagsToFetch.indexOf(tagsAdmin[a]) < 0) tagsToFetch.push(tagsAdmin[a]);
    }
  }

  for (var i = 0; i < CFG.TERNA_TAGS.length; i++) {
    var clanTag = CFG.TERNA_TAGS[i];
    var clanData = CACHE_CLAN_DATA[clanTag];
    if (!clanData) continue;

    var members = clanData.members || [];

    if (PLAYERS_API_ENABLED === 'partial') {
      // Solo miembros con V_Guerra vacío en la hoja Directorio
      var vGuerraVacios = _getTagsConVGuerraVacia();
      for (var j = 0; j < members.length; j++) {
        var tag = members[j].tag;
        if (vGuerraVacios.indexOf(tag) >= 0 && tagsToFetch.indexOf(tag) < 0) {
          tagsToFetch.push(tag);
        }
      }
    } else if (PLAYERS_API_ENABLED === true) {
      // Todos los activos Terna
      for (var j = 0; j < members.length; j++) {
        var tag = members[j].tag;
        if (tagsToFetch.indexOf(tag) < 0) tagsToFetch.push(tag);
      }
    }
  }

  // Inicializar mapa de players en cache global
  if (!CACHE_CLAN_DATA._players) CACHE_CLAN_DATA._players = {};

  // Cargar progreso de una corrida anterior que quedó cortada por tiempo
  // (ver _guardarProgresoPlayers). Estos tags NO se vuelven a pedir a la API.
  var progreso = _cargarProgresoPlayers();
  if (progreso) {
    var tagsRecuperados = 0;
    for (var pTag in progreso) {
      if (!CACHE_CLAN_DATA._players[pTag]) {
        CACHE_CLAN_DATA._players[pTag] = progreso[pTag];
        tagsRecuperados++;
      }
    }
    if (tagsRecuperados > 0) {
      Logger.log('[API] Progreso anterior recuperado de Drive: ' + tagsRecuperados + ' jugadores ya en cache, no se vuelven a pedir.');
    }
  }

  // Filtrar de la lista a pedir los que ya están en cache (de este mismo
  // ciclo o recuperados del progreso guardado).
  var pendientes = [];
  for (var k = 0; k < tagsToFetch.length; k++) {
    if (!CACHE_CLAN_DATA._players[tagsToFetch[k]]) pendientes.push(tagsToFetch[k]);
  }

  Logger.log('[API] /players a consultar: ' + pendientes.length + ' de ' + tagsToFetch.length +
             ' totales (' + (tagsToFetch.length - pendientes.length) + ' ya en cache).');

  var inicio = Date.now();
  var seCortoPorTiempo = false;
  // FIX (23/07/2026): antes no se llevaba registro de qué tags fallaban al [→ Contexto_Base_Web.md §09B117]
  var erroresPlayers = [];

  // periodIndex REAL del periodo de guerra actual (entero que entrega la API [→ Contexto_Base_Web.md §09B118]
  var ctxPlayers  = _getCtx();
  var periodIndex = ctxPlayers.periodIndex;

  for (var m = 0; m < pendientes.length; m++) {
    if ((Date.now() - inicio) > CFG.PLAYERS_FETCH_BUDGET_MS) {
      Logger.log('[API] Presupuesto interno de /players agotado (' + (CFG.PLAYERS_FETCH_BUDGET_MS / 1000) +
                 's) en ' + m + '/' + pendientes.length + '. Se guarda el progreso y se corta aquí; ' +
                 'la próxima continuación retoma exactamente donde quedó.');
      seCortoPorTiempo = true;
      break;
    }

    // Límite de consultas por tanda (CFG.PLAYERS_FETCH_MAX_POR_TANDA), [→ Contexto_Base_Web.md §09B119]
    if (m >= CFG.PLAYERS_FETCH_MAX_POR_TANDA) {
      Logger.log('[API] Límite de ' + CFG.PLAYERS_FETCH_MAX_POR_TANDA + ' consultas por tanda alcanzado en ' +
                 m + '/' + pendientes.length + '. Se guarda el progreso y se corta aquí; ' +
                 'la próxima continuación retoma exactamente donde quedó.');
      seCortoPorTiempo = true;
      break;
    }

    var playerTag = pendientes[m];
    var playerData = _apiGet('/players/' + encodeTag(playerTag));
    if (playerData) {
      CACHE_CLAN_DATA._players[playerTag] = playerData;
      // FIX (19/07/2026): antes NINGÚN punto del flujo real llamaba a [→ Contexto_Base_Web.md §09B120]
      _guardarPlayerEnDrive(playerTag, periodIndex, playerData);
    } else {
      // Sin log individual aquí a propósito (ver nota FIX 23/07/2026 más
      // abajo) — se acumula y se reporta junto con el resumen final.
      erroresPlayers.push(playerTag);
    }
    Utilities.sleep(200);
  }

  // FIX (23/07/2026): antes cada jugador obtenido/guardado dejaba su propia [→ Contexto_Base_Web.md §09B121]
  var resumenErrores = erroresPlayers.length
    ? (' | Con error en esta tanda: ' + erroresPlayers.length + ' (' + erroresPlayers.join(', ') + ')')
    : ' | Sin errores en esta tanda.';

  if (seCortoPorTiempo) {
    _guardarProgresoPlayers(CACHE_CLAN_DATA._players);
    Logger.log('[API] /players INCOMPLETO. Jugadores obtenidos hasta el corte: ' + Object.keys(CACHE_CLAN_DATA._players).length +
               ' | Pendientes para la próxima continuación: ' + (pendientes.length - m) + resumenErrores);
    _anotarProgresoPaso_('/players: ' + Object.keys(CACHE_CLAN_DATA._players).length + ' obtenidos, ' + (pendientes.length - m) + ' pendientes', Object.keys(CACHE_CLAN_DATA._players).length); // PF283
    return false;
  }

  // FASE 21 (01/08/2026): antes se llamaba a _borrarProgresoPlayers() aquí [→ Contexto_Base_Web.md §09B122]
  // PF140 (21-oct-2026): FASE 21 dejó el archivo vivo pero solo se escribía si la tanda se cortaba por tiempo; si /players
  // terminaba completo, el archivo nunca se creaba y la continuación siguiente (ejecución nueva, memoria vacía) pedía los
  // 58 otra vez. Ahora, si esta tanda trajo jugadores nuevos, se guarda el mapa completo para que las continuaciones de la
  // MISMA corrida lo recuperen. Lo borra _continuarRunUpdate()/_continuarRunAll() al terminar el ciclo, y
  // _cargarProgresoPlayers() lo descarta si tiene más de CFG.PLAYERS_PROGRESO_MAX_EDAD_MS. [→ Contexto_Base_Web.md §PF140]
  if (pendientes.length > 0) _guardarProgresoPlayers(CACHE_CLAN_DATA._players);
  _playersCompletoEnEstaEjecucion = true;
  Logger.log('[API] /players completado. Datos obtenidos: ' + Object.keys(CACHE_CLAN_DATA._players).length + resumenErrores);
  return true;
}

// PERSISTENCIA DE PROGRESO DE /players (para reanudación sin repetir) [→ Contexto_Base_Web.md §09B123]

/**
 * _guardarProgresoPlayers(playersMap) [→ Contexto_Base_Web.md §09B124]
 */
function _guardarProgresoPlayers(playersMap) {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var files = folder.getFilesByName(PLAYERS_PROGRESS_FILE);
    var content = JSON.stringify({ _ts: Date.now(), players: (playersMap || {}) });
    if (files.hasNext()) {
      files.next().setContent(content);
    } else {
      folder.createFile(PLAYERS_PROGRESS_FILE, content, MimeType.PLAIN_TEXT);
    }
  } catch (e) {
    Logger.log('[API] Error guardando progreso de /players en Drive: ' + e.message);
  }
}

/**
 * _cargarProgresoPlayers() [→ Contexto_Base_Web.md §09B125]
 */
function _cargarProgresoPlayers() {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var files = folder.getFilesByName(PLAYERS_PROGRESS_FILE);
    if (!files.hasNext()) return null;
    var file = files.next();
    var text = file.getBlob().getDataAsString('UTF-8');
    var parsed = JSON.parse(text);

    // Compatibilidad hacia atrás: si el archivo es un mapa "pelado" (formato [→ Contexto_Base_Web.md §09B126]
    if (!parsed || typeof parsed !== 'object' || !parsed._ts) {
      return parsed || null;
    }

    var edadMs = Date.now() - Number(parsed._ts);
    if (edadMs > CFG.PLAYERS_PROGRESO_MAX_EDAD_MS) {
      Logger.log('[API] Progreso de /players en Drive tiene ' + Math.round(edadMs / 60000) +
                 ' min — más viejo que el máximo permitido (' + (CFG.PLAYERS_PROGRESO_MAX_EDAD_MS / 60000) +
                 ' min). Se descarta como resto de un ciclo anterior, no se reutiliza.');
      file.setTrashed(true);
      return null;
    }

    return parsed.players || null;
  } catch (e) {
    Logger.log('[API] Error cargando progreso de /players desde Drive: ' + e.message);
    return null;
  }
}

/**
 * _borrarProgresoPlayers() [→ Contexto_Base_Web.md §09B127]
 */
function _borrarProgresoPlayers() {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var files = folder.getFilesByName(PLAYERS_PROGRESS_FILE);
    while (files.hasNext()) files.next().setTrashed(true);
  } catch (e) {
    Logger.log('[API] Error borrando progreso de /players en Drive: ' + e.message);
  }
}

/**
 * Obtiene los tags de TODAS las cuentas marcadas como Admin = "Sí" en la [→ Contexto_Base_Web.md §09B128]
 */
function _getTagsAdmin() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!sh || sh.getLastRow() < 2) return [];

  var numCols = sh.getLastColumn();
  var headerRow = sh.getRange(1, 1, 1, numCols).getValues()[0];
  var idxTag = DC.TAG - 1, idxAdmin = DC.ADMIN - 1;
  for (var h = 0; h < headerRow.length; h++) {
    var hName = String(headerRow[h] || '').trim();
    if (hName === 'Tag')   idxTag   = h;
    if (hName === 'Admin') idxAdmin = h;
  }

  var data = sh.getRange(2, 1, sh.getLastRow() - 1, numCols).getValues();
  var tags = [];
  for (var i = 0; i < data.length; i++) {
    var tag   = String(data[i][idxTag]   || '').trim();
    var admin = String(data[i][idxAdmin] || '').trim();
    if (tag && admin === 'Sí') tags.push(tag);
  }
  return tags;
}

/**
 * Obtiene los tags de jugadores que tienen V_Guerra vacío en la hoja Directorio. [→ Contexto_Base_Web.md §09B129]
 */
function _getTagsConVGuerraVacia() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!sh || sh.getLastRow() < 2) return [];

  // Leer encabezados de la fila 1 para obtener índices por nombre (no por posición fija)
  var numCols = sh.getLastColumn();
  var headerRow = sh.getRange(1, 1, 1, numCols).getValues()[0];
  var idxTag = DC.TAG - 1, idxVGuerra = DC.V_GUERRA - 1;
  for (var h = 0; h < headerRow.length; h++) {
    var hName = String(headerRow[h] || '').trim();
    if (hName === 'Tag')      idxTag     = h;
    if (hName === 'V_Guerra') idxVGuerra = h;
  }

  var data = sh.getRange(2, 1, sh.getLastRow() - 1, numCols).getValues();
  var tags = [];
  for (var i = 0; i < data.length; i++) {
    var tag     = String(data[i][idxTag]     || '').trim();
    var vGuerra = data[i][idxVGuerra];
    if (tag && (vGuerra === '' || vGuerra === null || vGuerra === undefined)) {
      tags.push(tag);
    }
  }
  return tags;
}

/**
 * _getBadgeLevel(playerData, badgeName) [→ Contexto_Base_Web.md §09B130]
 */
function _getBadgeLevel(playerData, badgeName) {
  if (!playerData || !playerData.badges) return '';
  for (var i = 0; i < playerData.badges.length; i++) {
    if (playerData.badges[i].name === badgeName) {
      return playerData.badges[i].level !== undefined ? playerData.badges[i].level : '';
    }
  }
  return '';
}

/**
 * _getBadgeProgress(playerData, badgeName) [→ Contexto_Base_Web.md §09B131]
 */
function _getBadgeProgress(playerData, badgeName) {
  if (!playerData || !playerData.badges) return '';
  for (var i = 0; i < playerData.badges.length; i++) {
    if (playerData.badges[i].name === badgeName) {
      return playerData.badges[i].progress !== undefined ? Number(playerData.badges[i].progress) : '';
    }
  }
  return '';
}

/**
 * Extrae el valor de V_Guerra (ClanWarWins badge) del objeto /players. [→ Contexto_Base_Web.md §09B132]
 */
function _getVGuerra(playerData) {
  if (!playerData || !playerData.badges) return '';
  for (var i = 0; i < playerData.badges.length; i++) {
    if (playerData.badges[i].name === 'ClanWarWins') {
      return playerData.badges[i].progress || 0;
    }
  }
  return '';
}

/**
 * Extrae el progress de collectionLevel del objeto /players. [→ Contexto_Base_Web.md §09B133]
 */
function _getNivel2(playerData) {
  if (!playerData || !playerData.badges) return '';
  for (var i = 0; i < playerData.badges.length; i++) {
    if (playerData.badges[i].name === 'CollectionLevel') {
      return Number(playerData.badges[i].progress) || 0;
    }
  }
  return '';
}

/**
 * Realiza una petición GET al proxy de la API de Clash Royale. [→ Contexto_Base_Web.md §09B134]
 */
function _apiGet(path) {
  var url = CFG.API_BASE + path;
  var options = {
    method: 'get',
    muteHttpExceptions: true,
    headers: { 'Accept': 'application/json' }
  };

  for (var intento = 1; intento <= API_GET_MAX_INTENTOS; intento++) {
    try {
      var response = UrlFetchApp.fetch(url, options);
      var code = response.getResponseCode();
      var text = response.getContentText();

      if (code === 200) {
        try {
          return JSON.parse(text);
        } catch(parseErr) {
          Logger.log('[API] Error parseando JSON para ' + path + ': ' + parseErr);
          return null;
        }
      }

      // FIX (02-oct-2026): el proxy (Render) detrás de Cloudflare devuelve a [→ Contexto_Base_Web.md §09B135]
      var esGatewayTransitorio = (code >= 500 && code <= 599);
      if (esGatewayTransitorio && intento < API_GET_MAX_INTENTOS) {
        Logger.log('[API] HTTP ' + code + ' (gateway transitorio, proxy probablemente reiniciando) para ' +
          path + ', intento ' + intento + '/' + API_GET_MAX_INTENTOS +
          ' — reintentando en ' + (API_GET_ESPERA_BASE_MS * intento) + 'ms.');
        Utilities.sleep(API_GET_ESPERA_BASE_MS * intento);
        continue;
      }

      // FIX (12-sep-2026): HTTP 429 (rate limit) también es transitorio — [→ Contexto_Base_Web.md §09B136]
      if (code === 429 && intento < API_GET_MAX_INTENTOS) {
        var retryAfterHeader = response.getHeaders() ? response.getHeaders()['Retry-After'] : null;
        var esperaMs = API_GET_ESPERA_429_MS * intento;
        if (retryAfterHeader && !isNaN(Number(retryAfterHeader))) {
          esperaMs = Math.max(esperaMs, Number(retryAfterHeader) * 1000);
        }
        Logger.log('[API] HTTP 429 (rate limit) para ' + path + ', intento ' + intento + '/' +
          API_GET_MAX_INTENTOS + ' — reintentando en ' + esperaMs + 'ms' +
          (retryAfterHeader ? ' (Retry-After: ' + retryAfterHeader + 's)' : '') + '.');
        Utilities.sleep(esperaMs);
        continue;
      }

      Logger.log('[API] HTTP ' + code + ' para ' + path + ' | Respuesta: ' + text.substring(0, 200));
      return null;
    } catch(e) {
      if (intento < API_GET_MAX_INTENTOS) {
        Logger.log('[API] Excepción de red en _apiGet(' + path + '), intento ' + intento + '/' +
          API_GET_MAX_INTENTOS + ': ' + e + ' — reintentando en ' + (API_GET_ESPERA_BASE_MS * intento) + 'ms.');
        Utilities.sleep(API_GET_ESPERA_BASE_MS * intento);
      } else {
        Logger.log('[API] Excepción en _apiGet(' + path + ') tras ' + API_GET_MAX_INTENTOS + ' intento(s): ' + e);
        return null;
      }
    }
  }
  return null;
}

/**
 * pingProxyRender() [→ Contexto_Base_Web.md §09B137]
 */
function pingProxyRender() {
  try {
    var resp = UrlFetchApp.fetch(CFG.API_BASE, {
      method: 'get',
      muteHttpExceptions: true
    });
    Logger.log('[PingProxy] ' + CFG.API_BASE + ' → HTTP ' + resp.getResponseCode());
  } catch (e) {
    Logger.log('[PingProxy] Excepción al pingear ' + CFG.API_BASE + ': ' + e.message);
  }
}

// Helpers de acceso al cache (para uso en otros módulos) [→ Contexto_Base_Web.md §09B138]

/**
 * Obtiene los datos de un clan desde el cache.
 * Devuelve null si no está en el cache (falló la API para ese clan).
 */
function _getClanCache(tag) {
  if (!CACHE_CLAN_DATA) return null;
  return CACHE_CLAN_DATA[tag] || null;
}

/**
 * Obtiene los datos de /players para un tag desde el cache.
 * Devuelve null si no se consultó /players para ese tag.
 */
function _getPlayerCache(tag) {
  if (!CACHE_CLAN_DATA || !CACHE_CLAN_DATA._players) return null;
  return CACHE_CLAN_DATA._players[tag] || null;
}

/**
 * Guarda los datos de /players de un tag en el cache (contraparte de
 * _getPlayerCache). Usada por _fetchPlayersCached() en 09_API_ClashRoyale.gs.
 */
function _setPlayerCache(tag, datos) {
  if (!CACHE_CLAN_DATA) CACHE_CLAN_DATA = {};
  if (!CACHE_CLAN_DATA._players) CACHE_CLAN_DATA._players = {};
  CACHE_CLAN_DATA._players[tag] = datos;
}

/**
 * Obtiene el contexto de temporada/semana/día del primer clan Terna disponible en cache. [→ Contexto_Base_Web.md §09B139]
 */
function _getCtx() {
  var ref = CFG.REF_DEFAULT;

  var periodIndex   = 0;
  var sectionIndex  = 0;
  var periodType    = 'training';
  var cacheEncontrado = false;

  // Leer periodIndex del primer clan Terna disponible en cache
  for (var i = 0; i < CFG.TERNA_TAGS.length; i++) {
    var clanData = _getClanCache(CFG.TERNA_TAGS[i]);
    if (clanData && clanData.riverrace) {
      var rr = clanData.riverrace;
      periodIndex  = Number(rr.periodIndex)  || 0;
      sectionIndex = Number(rr.sectionIndex) || periodIdxToSectionIndex(periodIndex);
      periodType   = rr.periodType || 'training';
      cacheEncontrado = true;
      break;
    }
  }

  // FIX (19-ago-2026, diagnóstico "Control_2 no reconstruye nada de la [→ Contexto_Base_Web.md §09B140]
  if (!cacheEncontrado) {
    var propsFallback = PropertiesService.getScriptProperties();
    var ultimoOkFallback = Number(propsFallback.getProperty('CTX_ULTIMO_PERIODINDEX_OK'));
    if (ultimoOkFallback) {
      periodIndex  = ultimoOkFallback;
      sectionIndex = periodIdxToSectionIndex(periodIndex);
      periodType   = esDiaGuerraIdx(periodIndex) ? 'warDay' : 'training';
    }
  }

  // Si NINGÚN clan tiene cache cargado (ej. una llamada aislada a _getCtx() [→ Contexto_Base_Web.md §09B141]
  var mesEfectivo = _getMesEfectivo(periodIndex, cacheEncontrado);
  var temporada   = calcTemporadaDesdeMesEfectivo(ref, mesEfectivo);

  var diaLetra   = periodIdxToLetra(periodIndex);
  var diaGuerra  = calcDiaGuerraIdx(ref, temporada, periodIndex);
  var esDiaG     = esDiaGuerraIdx(periodIndex);

  var sospechoso = false;

  if (!cacheEncontrado) {
    Logger.log('[_getCtx] SIN CACHE DE CLANES (llamada aislada, sin _fetchAllClanData() previo) — ' +
      'se usa el último mes efectivo/periodIndex conocido sin modificar contadores persistidos.');
  } else {
    // GUARDIÁN ANTI-PERIODINDEX-DESACTUALIZADO (stale de la API) [→ Contexto_Base_Web.md §09B142]
    var props        = PropertiesService.getScriptProperties();
    var ultimoOkStr   = props.getProperty('CTX_ULTIMO_PERIODINDEX_OK');
    var ultimoTsStr   = props.getProperty('CTX_ULTIMO_TS_OK');

    if (ultimoOkStr !== null && ultimoOkStr !== '') {
      var ultimoOk = Number(ultimoOkStr);
      var ultimoTs = Number(ultimoTsStr || 0);
      var horasTranscurridas = (Date.now() - ultimoTs) / 3600000;
      if (periodIndex > ultimoOk + 2 && horasTranscurridas < 20) {
        sospechoso = true;
        Logger.log('[_getCtx] SOSPECHA de periodIndex desactualizado: ultimoOk=' +
          ultimoOk + ' (hace ' + horasTranscurridas.toFixed(1) + 'h), lectura actual=' +
          periodIndex + '. Se abortará la escritura de Guerra/Guerra_Logs/Control esta corrida.');
      }
    }

    if (!sospechoso) {
      props.setProperty('CTX_ULTIMO_PERIODINDEX_OK', String(periodIndex));
      props.setProperty('CTX_ULTIMO_TS_OK', String(Date.now()));
    }
  }

  return {
    temporada:              temporada,
    sectionIndex:            sectionIndex,
    periodIndex:             periodIndex,
    diaLetra:                diaLetra,
    periodType:              periodType,
    ref:                     ref,
    diaGuerra:               diaGuerra,
    esDiaGuerra:             esDiaG,
    mesEfectivoAnio:         mesEfectivo.anio,
    mesEfectivoMes:          mesEfectivo.mes,
    periodIndexSospechoso:   sospechoso,
    sinCacheClanes:          !cacheEncontrado
  };
}

/**
 * _normalizarNombreClan_(nombre) [→ Contexto_Base_Web.md §09B143]
 */
function _normalizarNombreClan_(nombre) {
  var s = String(nombre || '').trim().toLowerCase();
  try {
    if (s.normalize) s = s.normalize('NFC');
  } catch(e) { /* normalize no disponible: se usa el string tal cual */ }
  return s;
}

/**
 * _getCarpetaParaClan(clanName) [→ Contexto_Base_Web.md §09B144]
 */
function _getCarpetaParaClan(clanName) {
  return { clanName: clanName, clave: _normalizarNombreClan_(clanName) };
}

/**
 * _getSubcarpetaEndpoint_(carpetaClanInfo, endpointKey) [→ Contexto_Base_Web.md §09B145]
 */
function _getSubcarpetaEndpoint_(carpetaClanInfo, endpointKey) {
  var mapaEndpoint = _ENDPOINT_ROOT_Y_SUBCARPETAS_CLAN_[endpointKey];
  if (!mapaEndpoint) return DriveApp.getFolderById(DRIVE_FOLDER_ID_JSON);

  var clave     = (carpetaClanInfo && carpetaClanInfo.clave) || _normalizarNombreClan_(carpetaClanInfo);
  var nombreLog = (carpetaClanInfo && carpetaClanInfo.clanName) || carpetaClanInfo;
  var folderId  = mapaEndpoint.subcarpetasPorClan[clave];
  if (folderId) {
    try { return DriveApp.getFolderById(folderId); } catch(e) { /* fallback abajo */ }
  }

  // Log con los codepoints exactos del nombre recibido — ayuda a diagnosticar
  // rápido si vuelve a haber un mismatch de codificación Unicode.
  var codepoints = [];
  for (var i = 0; i < clave.length; i++) codepoints.push(clave.codePointAt(i).toString(16));
  Logger.log('[Cache] Clan "' + nombreLog + '" no mapeado a subcarpeta del endpoint "' + endpointKey +
             '"; usando raiz de ese endpoint. Clave normalizada: "' + clave + '" | Codepoints: ' + codepoints.join(' '));
  try { return DriveApp.getFolderById(mapaEndpoint.folderIdRaiz); }
  catch(e2) { return DriveApp.getFolderById(DRIVE_FOLDER_ID_JSON); }
}

/** Rellena con un cero a la izquierda si el número tiene un solo dígito (igual que en el Generador). */
function _pad2_(n) {
  var s = String(Math.abs(Number(n) || 0));
  return (Number(n) < 0 ? '-' : '') + (s.length < 2 ? '0' + s : s);
}

/**
 * PF074 (14-oct-2026): carpetas de temporada y semana dentro de la carpeta del clan de cada endpoint. [→ Contexto_Base_Web.md §PF074]
 * Esquema: endpoint -> clan -> T-02 -> S-01 -> JSON de esa semana. Los nombres de las carpetas (T-02, S-01, con cero a la
 * izquierda) son un SUPUESTO por confirmar con la usuaria. Devuelve la carpeta de la semana; la crea si no existe.
 */
var _CARPETA_SEMANA_MEM_ = {};
function _getCarpetaSemana_(carpetaClan, ctx) {
  var nT = 'T-' + _pad2_((ctx && ctx.temporada) || 0);
  var nS = 'S-' + _pad2_(((ctx && ctx.sectionIndex) || 0) + 1);
  var kMem = carpetaClan.getId() + '|' + nT + '|' + nS;
  if (_CARPETA_SEMANA_MEM_[kMem]) {
    try { _CARPETA_SEMANA_MEM_[kMem].getId(); return _CARPETA_SEMANA_MEM_[kMem]; } catch (e) { delete _CARPETA_SEMANA_MEM_[kMem]; }
  }
  function buscarOCrear(padre, nombre) {
    var it = padre.getFoldersByName(nombre);
    return it.hasNext() ? it.next() : padre.createFolder(nombre);
  }
  var cT = buscarOCrear(carpetaClan, nT);
  var cS = buscarOCrear(cT, nS);
  _CARPETA_SEMANA_MEM_[kMem] = cS;
  return cS;
}

/**
 * PF074: busca un archivo con el tag (T-/S-/P.I- sin letra) y el sufijo del endpoint. Primero en la carpeta de la semana
 * y, si no esta, en la carpeta del clan (archivos antiguos que todavia no se movieron: asi no se crea un segundo archivo
 * del mismo periodo). Devuelve el archivo o null. [→ Contexto_Base_Web.md §PF074]
 */
function _buscarArchivoDelPeriodo_(carpetaSemana, carpetaClan, tagPrefijo, sufijo) {
  var carpetas = [carpetaSemana, carpetaClan];
  for (var i = 0; i < carpetas.length; i++) {
    if (!carpetas[i]) continue;
    var todos = carpetas[i].getFiles();
    while (todos.hasNext()) {
      var f = todos.next();
      var n = f.getName();
      if (n.indexOf(tagPrefijo) !== 0) continue;
      // El prefijo "P.I-05" tambien coincide con "P.I-05-S"; se exige que siga un espacio o la letra y luego el espacio.
      var resto = n.substring(tagPrefijo.length);
      if (!/^(?:-[LMXJVSD])?\s/.test(resto)) continue;
      if (!n.endsWith(sufijo)) continue;
      return f;
    }
  }
  return null;
}

/**
 * PF074: iterador de archivos de la carpeta del clan Y de sus subcarpetas de temporada y semana (hasta 2 niveles). Misma
 * interfaz que FileIterator (hasNext/next), para sustituir carpeta.getFiles() en los lectores. `temporadas` (opcional,
 * arreglo de numeros) evita entrar en carpetas T-xx de otras temporadas. [→ Contexto_Base_Web.md §PF074]
 */
function _archivosConSubcarpetas_(carpeta, temporadas) {
  var MAX_NIVEL = 2;
  var pila = [{ it: carpeta.getFiles(), sub: carpeta.getFolders(), n: 0 }];
  var listo = null;
  function avanzar() {
    while (pila.length) {
      var t = pila[pila.length - 1];
      if (t.it.hasNext()) return t.it.next();
      if (t.n < MAX_NIVEL && t.sub.hasNext()) {
        var c = t.sub.next();
        if (temporadas && temporadas.length && t.n === 0) {
          var mT = /^T-(\d+)$/i.exec(c.getName());
          if (mT && temporadas.indexOf(Number(mT[1])) < 0) continue;
        }
        pila.push({ it: c.getFiles(), sub: c.getFolders(), n: t.n + 1 });
        continue;
      }
      pila.pop();
    }
    return null;
  }
  return {
    hasNext: function () { if (listo === null) listo = avanzar(); return listo !== null; },
    next:    function () { if (listo === null) listo = avanzar(); var r = listo; listo = null; return r; }
  };
}

/**
 * _buildPrefijoTSP_(ctx) [→ Contexto_Base_Web.md §09B146]
 */
function _buildPrefijoTSP_(ctx) {
  var temporada    = ctx && ctx.temporada    || 0;
  var sectionIndex = ctx && ctx.sectionIndex || 0;
  var periodIndex  = ctx ? _normalizarPeriodIndex_(ctx.periodIndex) : 0;
  return 'T-' + _pad2_(temporada) +
    '  S-' + _pad2_(sectionIndex + 1) +
    ' P.I-' + _pad2_(periodIndex);
}

/**
 * _horaLimaNow() [→ Contexto_Base_Web.md §09B147]
 */
function _horaLimaNow() {
  return Utilities.formatDate(new Date(), 'America/Lima', 'dd-MM-yyyy HH.mm');
}

/**
 * _horaLimaMensaje12h(d) [→ Contexto_Base_Web.md §09B148]
 */
function _horaLimaMensaje12h(d) {
  return Utilities.formatDate(d instanceof Date ? d : new Date(), 'America/Lima', 'dd/MM/yyyy hh:mm:ss a') + ' (Lima)';
}

/**
 * _buildCacheFilename(ctx, endpointKey, clanName) [→ Contexto_Base_Web.md §09B149]
 */
function _buildCacheFilename(ctx, endpointKey, clanName, fechaMs) {
  // PF074 (14-oct-2026): el nombre nuevo lleva la letra del dia pegada al P.I (P.I-05-S). _buildPrefijoTSP_ sigue SIN
  // letra a proposito: es el prefijo con el que se buscan los archivos existentes (con o sin letra). [→ Contexto_Base_Web.md §PF074]
  var tag       = _buildPrefijoTSP_(ctx) + '-' + periodIdxToLetra(ctx ? _normalizarPeriodIndex_(ctx.periodIndex) : 0);
  // PF091 (17-oct-2026): fechaMs opcional = hora de la primera consulta del periodo (el archivo NUEVO de currentriverrace la usa en el nombre)
  var fechaHora = fechaMs ? Utilities.formatDate(new Date(fechaMs), 'America/Lima', 'dd-MM-yyyy HH.mm') : _horaLimaNow();
  var nombre    = (clanName && String(clanName).trim()) ? String(clanName).trim() : 'Sin clan';
  return tag + ' ' + fechaHora + ' - ' + nombre + ' - ' + endpointKey + '.json';
}

/**
 * _normalizarPeriodIndex_(periodIndex)
 * Normaliza periodIndex a un entero válido (0 si viene nulo/indefinido/NaN).
 */
function _normalizarPeriodIndex_(periodIndex) {
  var n = Number(periodIndex);
  return isNaN(n) ? 0 : n;
}

/**
 * _buildCacheSuffix(endpointKey) [→ Contexto_Base_Web.md §09B150]
 */
function _buildCacheSuffix(endpointKey) {
  return ' - ' + endpointKey + '.json';
}

/**
 * _cargarCacheDesideDrive(clanTag, endpointKey, ctxOrPeriodIndex) [→ Contexto_Base_Web.md §09B151]
 */
function _cargarCacheDesideDrive(clanTag, endpointKey, ctxOrPeriodIndex) {
  // Para players: buscar por nombre de archivo (tag), no por periodo — sin cambios.
  if (endpointKey === 'players') {
    return _cargarPlayerDesideDrive(clanTag);
  }

  var ctx = ctxOrPeriodIndex || {};
  var memKey = clanTag + '|' + endpointKey + '|P' + _normalizarPeriodIndex_(ctx.periodIndex);
  if (_DRIVE_CACHE_MEM[memKey]) return _DRIVE_CACHE_MEM[memKey];

  try {
    // Buscar en la subcarpeta del clan/endpoint si ya conocemos el nombre del [→ Contexto_Base_Web.md §09B152]
    var clanName = '';
    if (CACHE_CLAN_DATA && CACHE_CLAN_DATA[clanTag] && CACHE_CLAN_DATA[clanTag].info) {
      clanName = CACHE_CLAN_DATA[clanTag].info.name || '';
    }
    var carpetaClan = _getCarpetaParaClan(clanName);
    var folder = _getSubcarpetaEndpoint_(carpetaClan, endpointKey);

    var tagPrefijo = _buildPrefijoTSP_(ctx);
    var sufijo     = _buildCacheSuffix(endpointKey);
    // PF074: se busca en la carpeta de la semana (solo si ya existe; leer no crea carpetas) y en la del clan. [→ Contexto_Base_Web.md §PF074]
    var carpetasBusqueda = [];
    try {
      var nTl = 'T-' + _pad2_(ctx.temporada || 0), nSl = 'S-' + _pad2_((ctx.sectionIndex || 0) + 1);
      var itT = folder.getFoldersByName(nTl);
      if (itT.hasNext()) { var itS = itT.next().getFoldersByName(nSl); if (itS.hasNext()) carpetasBusqueda.push(itS.next()); }
    } catch (eS) { /* sin carpeta de semana: se sigue con la del clan */ }
    carpetasBusqueda.push(folder);

    for (var cb = 0; cb < carpetasBusqueda.length; cb++) {
    var todos      = carpetasBusqueda[cb].getFiles();

    while (todos.hasNext()) {
      var f = todos.next();
      var n = f.getName();
      // Filtrar por prefijo (tag T-/S-/P.I- del periodo) + sufijo de endpoint,
      // sin importar la fecha/hora con la que se guardó el archivo.
      if (n.indexOf(tagPrefijo) !== 0) continue;
      if (!/^(?:-[LMXJVSD])?\s/.test(n.substring(tagPrefijo.length))) continue; // PF074: acepta la letra del dia
      if (!n.endsWith(sufijo)) continue;

      try {
        var contenido = f.getBlob().getDataAsString('UTF-8');
        if (!contenido) continue;
        var obj = JSON.parse(contenido);

        // Verificar que el JSON pertenece al clanTag correcto
        var tagEnArchivo = obj.tag || (obj.clan && obj.clan.tag) || '';
        if (!tagEnArchivo || tagEnArchivo.toUpperCase() !== clanTag.toUpperCase()) continue;

        _DRIVE_CACHE_MEM[memKey] = obj;
        Logger.log('[Cache] Cargado desde Drive: ' + n);
        return obj;
      } catch(e2) { /* continuar con siguiente archivo */ }
    }
    }
    return null;
  } catch(e) {
    Logger.log('[Cache] Error buscando cache en Drive para ' + clanTag + ': ' + e.message);
    return null;
  }
}

/**
 * _tsLimaLog_()
 * Timestamp actual en hora de Lima ('yyyy-MM-dd HH:mm:ss'), para los logs de periodo.
 */
function _tsLimaLog_() {
  return Utilities.formatDate(new Date(), 'America/Lima', 'yyyy-MM-dd HH:mm:ss');
}

/**
 * _temporadaDeClan_(ctx, periodIndexClan) [→ Contexto_Base_Web.md §09B153]
 */
function _temporadaDeClan_(ctx, periodIndexClan) {
  var base = Number((ctx || {}).temporada);
  var refPi = Number((ctx || {}).periodIndex);
  var pi = Number(periodIndexClan);
  if (!isFinite(base) || !isFinite(refPi) || periodIndexClan === undefined || periodIndexClan === null ||
      periodIndexClan === '' || !isFinite(pi)) return base;
  var d = pi - refPi;
  if (d >= 14)  return base - 1;
  if (d <= -14) return base + 1;
  return base;
}

/**
 * _temporadaProbableClan_(ctx, periodIndexClan)
 * Se conserva por compatibilidad con el log de periodo: es lo mismo que _temporadaDeClan_().
 */
function _temporadaProbableClan_(ctx, periodIndexClan) {
  var t = _temporadaDeClan_(ctx, periodIndexClan);
  return isFinite(t) ? t : 0;
}

/**
 * _temporadasActivasGuerra_(ctx) [→ Contexto_Base_Web.md §09B154]
 */
function _temporadasActivasGuerra_(ctx) {
  var set = {};
  var base = Number((ctx || {}).temporada);
  if (isFinite(base)) set[base] = true;
  for (var i = 0; i < CFG.TERNA_TAGS.length; i++) {
    var cd = _getClanCache(CFG.TERNA_TAGS[i]);
    var rr = cd && cd.riverrace;
    if (!rr || rr.periodIndex === undefined || rr.periodIndex === null || isNaN(Number(rr.periodIndex))) continue;
    var t = _temporadaDeClan_(ctx, Number(rr.periodIndex));
    if (isFinite(t)) set[t] = true;
  }
  return Object.keys(set).map(Number).sort(function(a, b) { return a - b; });
}

/**
 * _fmtDiaGuerraLog_(fechaDate)
 * 'dd/MM/yyyy' del DiaGuerra (fecha de calendario a la que se adjudican los ataques), o 'n/d'.
 */
function _fmtDiaGuerraLog_(d) {
  if (!(d instanceof Date) || isNaN(d.getTime())) return 'n/d';
  return Utilities.formatDate(d, 'America/Lima', 'dd/MM/yyyy');
}

/**
 * _lineaPeriodoClan_(origen, nombre, tag, rr, ctx, ctxClan) [→ Contexto_Base_Web.md §09B155]
 */
function _lineaPeriodoClan_(origen, nombre, tag, rr, ctx, ctxClan) {
  var pre = '[' + origen + '][PERIODO] ' + (nombre || '?') + ' (' + tag + ') | ts Lima ' + _tsLimaLog_();
  if (!rr || rr.periodIndex === undefined || rr.periodIndex === null || isNaN(Number(rr.periodIndex))) {
    return pre + ' | SIN currentriverrace valido (API fallo/404 o sin periodIndex): no hay sectionIndex/periodIndex para este clan en esta corrida.';
  }
  var pi = Number(rr.periodIndex);
  var siApi = (rr.sectionIndex === undefined || rr.sectionIndex === null || isNaN(Number(rr.sectionIndex)))
    ? null : Number(rr.sectionIndex);
  var siCalc = periodIdxToSectionIndex(pi);
  var si = (siApi === null) ? siCalc : siApi;
  var tipo = rr.periodType || '(sin periodType)';

  var temporadaBot = ctxClan ? ctxClan.temporada : (ctx ? ctx.temporada : null);
  var diaBot = ctxClan ? ctxClan.diaGuerra
    : ((ctx && temporadaBot !== null) ? calcDiaGuerraIdx(ctx.ref, temporadaBot, pi) : null);

  var out = pre +
    ' | sectionIndex=' + (siApi === null ? 'falta(' + siCalc + ' calculado)' : siApi) +
    ' periodIndex=' + pi + ' periodType=' + tipo +
    ' | Temporada(bot)=' + (temporadaBot === null ? 'n/d' : temporadaBot) +
    ' Semana=' + (si + 1) +
    ' Dia=' + periodIdxToLetra(pi) +
    ' | DiaGuerra=' + _fmtDiaGuerraLog_(diaBot);

  if (siApi !== null && siApi !== siCalc) {
    out += ' | AVISO: sectionIndex de la API (' + siApi + ') != floor(periodIndex/7) (' + siCalc + ')';
  }
  if (ctx && ctx.periodIndex !== undefined && ctx.periodIndex !== null) {
    var delta = pi - Number(ctx.periodIndex);
    if (delta !== 0) {
      out += ' | periodIndex ' + (delta > 0 ? '+' : '') + delta + ' vs referencia (' + ctx.periodIndex + ')';
    }
    var tProb = _temporadaProbableClan_(ctx, pi);
    if (temporadaBot !== null && tProb !== Number(temporadaBot)) {
      out += ' | ALERTA TEMPORADA: por su periodIndex este clan estaria en la T' + tProb +
        ' (DiaGuerra=' + _fmtDiaGuerraLog_(calcDiaGuerraIdx(ctx.ref, tProb, pi)) +
        ') pero el bot lo etiqueta con T' + temporadaBot;
    }
  }
  return out;
}

/**
 * _ctxPorClanDesdeDatos_(ctx, endpointKey, datos) [→ Contexto_Base_Web.md §09B156]
 */
function _ctxPorClanDesdeDatos_(ctx, endpointKey, datos) {
  var base = ctx || {};
  if (endpointKey !== 'currentriverrace' || !datos) return base;

  var pi = datos.periodIndex;
  if (pi === undefined || pi === null || pi === '' || isNaN(Number(pi)) || Number(pi) < 0) return base;
  var piNum = Number(pi);

  var si = datos.sectionIndex;
  var siNum = (si === undefined || si === null || si === '' || isNaN(Number(si)))
    ? periodIdxToSectionIndex(piNum)
    : Number(si);

  var copia = {};
  for (var k in base) {
    if (Object.prototype.hasOwnProperty.call(base, k)) copia[k] = base[k];
  }
  copia.periodIndex  = piNum;
  copia.sectionIndex = siNum;
  if (datos.periodType) copia.periodType = datos.periodType;
  return copia;
}

// PRIMERA CONSULTA DE CADA periodIndex (12-oct-2026, pedido de la usuaria). [→ Contexto_Base_Web.md §PF063]
// Guerra y Guerra_Logs crean sus filas con la fecha y hora de la PRIMERA consulta a la API de ese periodIndex
// (un mismo día de guerra cubre dos fechas, porque cambia entre las 4 y las 5 a.m. y no a las 12). Esa hora no
// cambia aunque la fila o el JSON se sigan actualizando. Clave: temporada|periodIndex|tag del clan (sin #).
var PRIMERA_CONSULTA_RR_PROP = 'PRIMERA_CONSULTA_RR';
var PRIMERA_CONSULTA_RR_MAX  = 150;
var _PRIMERA_CONSULTA_RR_MEM = null;

function _leerPrimeraConsultaRR_() {
  if (_PRIMERA_CONSULTA_RR_MEM) return _PRIMERA_CONSULTA_RR_MEM;
  var mapa = {};
  try {
    var txt = PropertiesService.getScriptProperties().getProperty(PRIMERA_CONSULTA_RR_PROP);
    if (txt) mapa = JSON.parse(txt) || {};
  } catch (e) { mapa = {}; }
  _PRIMERA_CONSULTA_RR_MEM = mapa;
  return mapa;
}

function _claveConsultaRR_(temporada, periodIndex, clanTag) {
  return Number(temporada) + '|' + Number(periodIndex) + '|' + cleanTag(clanTag);
}

/** Guarda la hora de esta consulta SOLO si ese clan y periodIndex todavía no tienen una. Nunca la reemplaza. */
function _registrarPrimeraConsultaRR_(clanTag, temporada, periodIndex, ms) {
  try {
    if (!isFinite(Number(temporada)) || !isFinite(Number(periodIndex))) return;
    var mapa = _leerPrimeraConsultaRR_();
    var k = _claveConsultaRR_(temporada, periodIndex, clanTag);
    if (mapa[k]) return;
    mapa[k] = ms || new Date().getTime();
    var claves = Object.keys(mapa);
    if (claves.length > PRIMERA_CONSULTA_RR_MAX) {
      claves.sort(function(a, b) { return mapa[a] - mapa[b]; });
      for (var i = 0; i < claves.length - PRIMERA_CONSULTA_RR_MAX; i++) delete mapa[claves[i]];
    }
    PropertiesService.getScriptProperties().setProperty(PRIMERA_CONSULTA_RR_PROP, JSON.stringify(mapa));
  } catch (e) {
    Logger.log('[PrimeraConsulta] No se pudo registrar: ' + e.message);
  }
}

/**
 * Fecha y hora de la primera consulta de ese periodIndex. Con clanTag usa la de ese clan; sin clanTag (o sin
 * dato de ese clan, p. ej. un rival) usa la más temprana de los clanes Terna. Sin registro devuelve `respaldo`.
 */
function _fechaPrimeraConsultaRR_(temporada, periodIndex, clanTag, respaldo) {
  try {
    var mapa = _leerPrimeraConsultaRR_();
    if (clanTag) {
      var ms = mapa[_claveConsultaRR_(temporada, periodIndex, clanTag)];
      if (ms) return new Date(ms);
    }
    var pref = Number(temporada) + '|' + Number(periodIndex) + '|';
    var min = null;
    for (var k in mapa) {
      if (k.indexOf(pref) === 0 && (min === null || mapa[k] < min)) min = mapa[k];
    }
    if (min !== null) return new Date(min);
  } catch (e) { /* cae al respaldo */ }
  return respaldo;
}

/**
 * _guardarCacheEnDrive(clanTag, endpointKey, ctxOrPeriodIndex, datos) [→ Contexto_Base_Web.md §09B157]
 */
function _guardarCacheEnDrive(clanTag, endpointKey, ctxOrPeriodIndex, datos) {
  // Para players: lógica especial sin cambios (un archivo por jugador, se actualiza siempre)
  if (endpointKey === 'players') {
    _guardarPlayerEnDrive(clanTag, ctxOrPeriodIndex, datos);
    return;
  }

  // FIX (1-oct-2026, pregunta 52): para currentriverrace el nombre del archivo [→ Contexto_Base_Web.md §09B158]
  var ctx = _ctxPorClanDesdeDatos_(ctxOrPeriodIndex || {}, endpointKey, datos);

  // Obtener el nombre del clan desde los datos de la API
  var clanName = (datos && datos.name)
    ? datos.name
    : ((datos && datos.clan && datos.clan.name) ? datos.clan.name : cleanTag(clanTag));

  // PRIMERA CONSULTA (12-oct-2026): se anota la hora de la primera respuesta de este clan y periodIndex. [→ Contexto_Base_Web.md §PF063]
  var fechaPrimeraMs = null;  // PF091: hora de la primera consulta, para el nombre de un archivo NUEVO de currentriverrace
  if (endpointKey === 'currentriverrace' && datos && datos.periodIndex !== '' && datos.periodIndex !== null && isFinite(Number(datos.periodIndex))) {
    var _tempRR = _temporadaDeClan_(ctxOrPeriodIndex || {}, Number(datos.periodIndex));
    _registrarPrimeraConsultaRR_(clanTag, _tempRR, Number(datos.periodIndex), new Date().getTime());
    var _dPrimera = _fechaPrimeraConsultaRR_(_tempRR, Number(datos.periodIndex), clanTag, null);
    if (_dPrimera) fechaPrimeraMs = _dPrimera.getTime();
  }

  var filename   = _buildCacheFilename(ctx, endpointKey, clanName, fechaPrimeraMs);
  var contenido  = JSON.stringify(datos, null, 2);
  var tagPrefijo = _buildPrefijoTSP_(ctx);
  try {
    // Guardar dentro de la subcarpeta del endpoint, dentro de la carpeta del clan.
    var carpetaClan = _getCarpetaParaClan(clanName);
    var carpetaClanDrive = _getSubcarpetaEndpoint_(carpetaClan, endpointKey);
    // PF074 (14-oct-2026): se guarda en la carpeta de la temporada y la semana (se crea si no existe). [→ Contexto_Base_Web.md §PF074]
    var folder = _getCarpetaSemana_(carpetaClanDrive, ctx);

    // Buscar un archivo YA EXISTENTE con este mismo tag (periodo) + endpoint,
    // SIN importar la fecha/hora que tenga en el nombre (ni la letra). Primero en la semana y luego en la carpeta del clan.
    var sufijo = _buildCacheSuffix(endpointKey);
    var archivoExistente = _buscarArchivoDelPeriodo_(folder, carpetaClanDrive, tagPrefijo, sufijo);

    if (archivoExistente) {
      // Renombrar (la fecha/hora en el nombre avanza; en currentriverrace NO, ver abajo) y actualizar contenido.
      // Es EL MISMO archivo: nunca se crea uno nuevo para el mismo periodo.
      // currentriverrace (12-oct-2026): el nombre conserva la fecha y hora de la PRIMERA consulta del periodo y no se
      // renombra; solo se actualiza el contenido. Los demás endpoints siguen renombrándose como siempre.
      if (endpointKey !== 'currentriverrace' && archivoExistente.getName() !== filename) {
        archivoExistente.setName(filename);
      }
      _setContentConConteo_(archivoExistente, contenido);
      Logger.log('[Cache] Actualizado en Drive (mismo archivo, ' + tagPrefijo + '): ' + filename);
    } else {
      // Solo se crea un archivo nuevo cuando cambia el periodo.
      // Los archivos de periodos anteriores se conservan siempre como histórico.
      _createFileConConteo_(folder, filename, contenido, MimeType.PLAIN_TEXT);
      Logger.log('[Cache] Creado en Drive (nuevo periodo ' + tagPrefijo + '): ' + filename);
    }

    // Registrar en el log acumulativo del Script Terna. PF091 etapa 4: dentro de la captura de clanes solo se anota el nombre
    // del archivo y _guardarJsonClanesDesdeCaptura_() registra una sola entrada al final.
    if (_logJsonCapturaAcumulado_) {
      _logJsonCapturaAcumulado_.push(filename);
    } else {
      _registrarLogScriptTerna(
        '_guardarCacheEnDrive()',
        'JSON guardado en Drive: ' + filename + ' | Clan: ' + clanName + ' | Endpoint: ' + endpointKey +
        ' | ' + tagPrefijo,
        []
      );
    }

    // Guardar en memoria de sesión
    var memKey = clanTag + '|' + endpointKey + '|P' + _normalizarPeriodIndex_(ctx.periodIndex);
    _DRIVE_CACHE_MEM[memKey] = datos;
  } catch(e) {
    Logger.log('[Cache] Error guardando ' + filename + ': ' + e.message);
  }
}

/**
 * _apiGetCached(clanTag, endpointKey, pathFn, ctx) [→ Contexto_Base_Web.md §09B159]
 */
function _apiGetCached(clanTag, endpointKey, pathFn, ctx) {
  var memKey = clanTag + '|' + endpointKey;

  // 1. Memoria de sesión: ya fue consultado en este run, es fresco
  if (_DRIVE_CACHE_MEM[memKey]) {
    Logger.log('[Cache] HIT memoria: ' + memKey);
    return _DRIVE_CACHE_MEM[memKey];
  }

  // 2. Llamar a la API y actualizar Drive con la respuesta más reciente
  Logger.log('[Cache] Consultando API: ' + endpointKey + ' para ' + clanTag);
  var datos = _apiGet(pathFn(clanTag));
  if (datos) {
    _guardarCacheEnDrive(clanTag, endpointKey, ctx, datos);
    _DRIVE_CACHE_MEM[memKey] = datos;
    return datos;
  }

  // 3. API falló — usar Drive como fallback de emergencia
  Logger.log('[Cache] API falló para ' + endpointKey + ' / ' + clanTag + ' — intentando Drive...');
  var desdeDrive = _cargarCacheDesideDrive(clanTag, endpointKey, ctx);
  if (desdeDrive) {
    Logger.log('[Cache] FALLBACK Drive: ' + endpointKey + ' / ' + clanTag);
    _DRIVE_CACHE_MEM[memKey] = desdeDrive;
    return desdeDrive;
  }

  Logger.log('[Cache] Sin datos para ' + endpointKey + ' / ' + clanTag);
  return null;
}

/**
 * _buildPlayerFilename(playerTag, clanName) [→ Contexto_Base_Web.md §09B160]
 */
function _buildPlayerFilename(playerTag, clanName) {
  var fechaHora = Utilities.formatDate(new Date(), 'America/Lima', 'dd-MM-yyyy HH.mm');
  var clan = (clanName && String(clanName).trim()) ? String(clanName).trim() : 'Sin clan';
  return fechaHora + ' - ' + clan + ' - ' + String(playerTag || '').trim() + '.json';
}

/**
 * FASE 9bis (17-sep-2026, limpieza de código muerto, pedido del usuario): [→ Contexto_Base_Web.md §09B161]
 */

/**
 * _getPlayersDriveIndexPorTag(folder) [→ Contexto_Base_Web.md §09B162]
 */
function _getPlayersDriveIndexPorTag(folder) {
  if (_PLAYERS_DRIVE_INDEX_POR_TAG) return _PLAYERS_DRIVE_INDEX_POR_TAG;

  // Formato nuevo (Fase 18, sin periodo): "... - {tag}.json"
  // Formato antiguo (histórico, con periodo): "... - {tag} - P{n}.json"
  var reTagNuevo  = /-\s(#[0-9A-Z]+)\.json$/i;
  var reTagViejo  = /-\s(#[0-9A-Z]+)\s-\sP-?\d+\.json$/i;

  var idx = {};
  var todos = folder.getFiles();
  while (todos.hasNext()) {
    var f = todos.next();
    var n = f.getName();
    var m = reTagNuevo.exec(n) || reTagViejo.exec(n);
    if (!m) continue;
    var tag = m[1];
    if (!idx[tag] || n > idx[tag].getName()) idx[tag] = f;
  }

  _PLAYERS_DRIVE_INDEX_POR_TAG = idx;
  _playersIndiceIdsGuardar_(idx); // 08-oct-2026: deja el índice tag -> id de archivo en caché (gratis: ya se recorrió la carpeta) para _cargarPlayerDesideDrive()
  return idx;
}

// NUEVO 08-oct-2026 (rendimiento del perfil web): _cargarPlayerDesideDrive() recorría TODA la carpeta Players, archivo por archivo, por cada jugador (8-30 s por perfil). Cada tag tiene un único archivo que _guardarPlayerEnDrive() renombra y actualiza en el sitio (su id no cambia), así que basta un índice tag -> id guardado en CacheService. Lo escribe _getPlayersDriveIndexPorTag() cada vez que el bot recorre la carpeta (sin costo extra); 6 h de vida. Un tag que no esté en el índice, un archivo borrado/en papelera o cualquier error caen al recorrido completo de siempre.
var PLAYERS_IDX_CACHE_KEY = 'players_idx_ids_v1';
function _playersIndiceIdsGuardar_(idx) {
  try {
    var ids = {};
    Object.keys(idx).forEach(function (t) { ids[t] = idx[t].getId(); });
    CacheService.getScriptCache().put(PLAYERS_IDX_CACHE_KEY, JSON.stringify({ t: Date.now(), ids: ids }), 21600);
  } catch (e) { /* sin caché: _cargarPlayerDesideDrive() recorre la carpeta como antes */ }
}
function _cargarPlayerDesideDriveRapido_(playerTag) {
  try {
    var tag = String(playerTag || '').trim();
    if (!tag) return null;
    var crudo = CacheService.getScriptCache().get(PLAYERS_IDX_CACHE_KEY);
    if (!crudo) return null;
    var id = (JSON.parse(crudo).ids || {})[tag];
    if (!id) return null;
    var f = DriveApp.getFileById(id);
    if (f.isTrashed()) return null;
    var n = f.getName();
    var esDeEsteTag = n.endsWith(' - ' + tag + '.json') || n.indexOf(' - ' + tag + ' - P') >= 0; // exacto: '#ABC' no debe aceptar '#ABCD'
    if (!esDeEsteTag) return null;
    var contenido = f.getBlob().getDataAsString('UTF-8');
    if (!contenido) return null;
    var obj = JSON.parse(contenido);
    _DRIVE_CACHE_MEM[playerTag + '|players'] = obj;
    Logger.log('[Players] Cargado desde Drive (índice): ' + n);
    return obj;
  } catch (e) {
    return null;
  }
}

/**
 * _guardarPlayerEnDrive(playerTag, periodIndex, datos) [→ Contexto_Base_Web.md §09B163]
 */
function _guardarPlayerEnDrive(playerTag, periodIndex, datos) {
  if (!datos) return;
  try {
    // Hora actual de Lima (para nombre de archivo y trazabilidad) [→ Contexto_Base_Web.md §09B164]
    var fechaStr = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy');

    // Determinar en qué clan está el jugador ahora mismo
    var clanActual = (datos.clan && datos.clan.name) ? datos.clan.name : '';

    // Inyectar metadatos de trazabilidad en el JSON
    var payload = JSON.parse(JSON.stringify(datos)); // copia sin mutar el original
    payload._fecha = fechaStr;
    payload._clan  = clanActual;

    var filename  = _buildPlayerFilename(playerTag, clanActual);
    var contenido = JSON.stringify(payload, null, 2);
    var folder    = DriveApp.getFolderById(DRIVE_FOLDER_ID_PLAYERS);

    // Buscar CUALQUIER archivo existente de este tag, sea cual sea su
    // periodo (Fase 18: ya no se segmenta por periodIndex).
    var indice = _getPlayersDriveIndexPorTag(folder);
    var archivoExistente = indice[playerTag] || null;

    if (archivoExistente) {
      // Renombrar (fecha/hora/clan pueden haber cambiado) y actualizar contenido.
      if (archivoExistente.getName() !== filename) {
        archivoExistente.setName(filename);
      }
      _setContentConConteo_(archivoExistente, contenido);
    } else {
      var nuevo = _createFileConConteo_(folder, filename, contenido, MimeType.PLAIN_TEXT);
      indice[playerTag] = nuevo; // se agrega al índice para los siguientes jugadores de esta misma corrida
    }
    // Sin log individual por jugador a propósito: con ~150-200 jugadores por [→ Contexto_Base_Web.md §09B165]

    var memKey = playerTag + '|players|P' + _normalizarPeriodIndex_(periodIndex);
    _DRIVE_CACHE_MEM[memKey] = payload;
  } catch(e) {
    // Este SÍ se deja: es un error real al guardar (Drive, permisos, etc.),
    // no una consulta exitosa de rutina.
    Logger.log('[Players] Error guardando ' + playerTag + ': ' + e.message);
  }
}

/**
 * _cargarPlayerDesideDrive(playerTag) [→ Contexto_Base_Web.md §09B166]
 */
function _cargarPlayerDesideDrive(playerTag) {
  var rapido = _cargarPlayerDesideDriveRapido_(playerTag); // 08-oct-2026: por índice tag -> id (ver _playersIndiceIdsGuardar_)
  if (rapido) return rapido;
  return _cargarPlayerDesideDriveScan_(playerTag);
}

// Recorrido completo de la carpeta Players (comportamiento original de _cargarPlayerDesideDrive()); respaldo cuando el índice no sirve.
function _cargarPlayerDesideDriveScan_(playerTag) {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_PLAYERS);
    var tag    = String(playerTag || '').trim();
    // Formato nuevo (con periodIndex): "... - {tag} - P{n}.json"
    var marcaNueva = ' - ' + tag + ' - P';
    // Formato antiguo (histórico, sin periodIndex): "... - {tag}.json"
    var sufijoViejo = ' - ' + tag + '.json';
    var todos    = folder.getFiles();
    var mejor    = null;
    var mejorNom = '';

    // Buscar todos los archivos del tag (en cualquiera de los dos formatos) [→ Contexto_Base_Web.md §09B167]
    while (todos.hasNext()) {
      var f = todos.next();
      var n = f.getName();
      var esDeEsteTag = (n.indexOf(marcaNueva) >= 0) ||
                         (n.endsWith(sufijoViejo) && n.length > sufijoViejo.length);
      if (esDeEsteTag) {
        if (!mejor || n > mejorNom) {
          mejor    = f;
          mejorNom = n;
        }
      }
    }

    if (!mejor) return null;
    var contenido = mejor.getBlob().getDataAsString('UTF-8');
    if (!contenido) return null;
    var obj = JSON.parse(contenido);
    var memKey = playerTag + '|players';
    _DRIVE_CACHE_MEM[memKey] = obj;
    Logger.log('[Players] Cargado desde Drive: ' + mejorNom);
    return obj;
  } catch(e) {
    Logger.log('[Players] Error cargando ' + playerTag + ': ' + e.message);
    return null;
  }
}

/**
 * _apiGetPlayerCached(playerTag, periodIndex) [→ Contexto_Base_Web.md §09B168]
 */
function _apiGetPlayerCached(playerTag, periodIndex) {
  var endpointKey = 'players';
  var memKey = playerTag + '|' + endpointKey;
  if (_DRIVE_CACHE_MEM[memKey]) return _DRIVE_CACHE_MEM[memKey];

  var desdeDrive = _cargarCacheDesideDrive(playerTag, endpointKey, periodIndex);
  if (desdeDrive) return desdeDrive;

  Logger.log('[Cache] MISS players — consultando API para ' + playerTag);
  var datos = _apiGet(CACHE_ENDPOINT_PLAYER.path(playerTag));
  if (datos) _guardarCacheEnDrive(playerTag, endpointKey, periodIndex, datos);
  return datos;
}

/**
 * _fetchAllClanDataCached() [→ Contexto_Base_Web.md §09B169]
 */
function _fetchAllClanDataCached() {
  Logger.log('[Cache] _fetchAllClanDataCached() iniciado...');

  var ctx = _getCtx(); // { temporada, sectionIndex, periodIndex, ... } — se pasa completo para el tag T-/S-/P.I-

  if (!CACHE_CLAN_DATA) CACHE_CLAN_DATA = {};

  for (var i = 0; i < CFG.CLAN_TAGS.length; i++) {
    var clanTag = CFG.CLAN_TAGS[i];

    // Info del clan
    var info = _apiGetCached(clanTag, 'clans', function(t) {
      return '/clans/' + encodeTag(t);
    }, ctx);

    // Riverrace actual
    var riverrace = _apiGetCached(clanTag, 'currentriverrace', function(t) {
      return '/clans/' + encodeTag(t) + '/currentriverrace';
    }, ctx);

    if (!info && !riverrace) {
      Logger.log('[Cache] Sin datos para: ' + clanTag);
      continue;
    }

    CACHE_CLAN_DATA[clanTag] = {
      info:      info      || {},
      members:   (info && info.memberList) ? info.memberList : [],
      riverrace: riverrace || {}
    };

    Logger.log('[Cache] Clan cargado: ' + (info ? info.name : clanTag));
    try { Logger.log(_lineaPeriodoClan_('Cache', info ? info.name : '', clanTag, riverrace, ctx, null)); } catch (eLogC) {}
    Utilities.sleep(150);
  }

  // Players (si está habilitado) — esquema sin cambios, sigue usando periodIndex plano
  if (PLAYERS_API_ENABLED !== false) {
    _fetchPlayersCached(ctx.periodIndex);
  }

  Logger.log('[Cache] _fetchAllClanDataCached() completado.');
}

/**
 * _fetchPlayersCached(periodIndex)
 * Obtiene datos de /players para cada miembro activo Terna, usando cache.
 */
function _fetchPlayersCached(periodIndex) {
  if (!CACHE_CLAN_DATA) return;
  var procesados = {};

  for (var i = 0; i < CFG.TERNA_TAGS.length; i++) {
    var cd = CACHE_CLAN_DATA[CFG.TERNA_TAGS[i]];
    if (!cd || !cd.members) continue;

    for (var j = 0; j < cd.members.length; j++) {
      var playerTag = cd.members[j].tag;
      if (!playerTag || procesados[playerTag]) continue;
      procesados[playerTag] = true;

      var pd = _apiGetPlayerCached(playerTag, periodIndex);
      if (pd) _setPlayerCache(playerTag, pd);
      Utilities.sleep(100);
    }
  }
  Logger.log('[Cache] Players cacheados: ' + Object.keys(procesados).length);
}

// LOG ACUMULATIVO DEL SCRIPT TERNA [→ Contexto_Base_Web.md §09B170]

/**
 * _registrarLogScriptTerna(funcion, descripcion, advertencias) [→ Contexto_Base_Web.md §09B171]
 */
function _registrarLogScriptTerna(funcion, descripcion, advertencias) {
  try {
    var folder   = DriveApp.getFolderById(DRIVE_FOLDER_ID_OTROS);
    var filename = 'Log_ScriptTerna.json';

    // Hora actual en Lima (NUNCA usar toLocaleString ni toString)
    var horaLima = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy HH:mm:ss') + ' (Lima)';

    var nuevaEntrada = {
      fecha:        horaLima,
      autor:        'Claude (Anthropic)',
      funcion:      funcion || '',
      descripcion:  descripcion || '',
      advertencias: advertencias || []
    };

    var archivos = folder.getFilesByName(filename);
    if (archivos.hasNext()) {
      var archivoLog = archivos.next();
      var contenidoActual = archivoLog.getBlob().getDataAsString('UTF-8');
      var logArray = [];
      try { logArray = JSON.parse(contenidoActual); } catch(e) { logArray = []; }
      if (!Array.isArray(logArray)) logArray = [];
      logArray.push(nuevaEntrada);
      _setContentConConteo_(archivoLog, JSON.stringify(logArray, null, 2));
    } else {
      _createFileConConteo_(folder, filename, JSON.stringify([nuevaEntrada], null, 2), MimeType.PLAIN_TEXT);
    }
    Logger.log('[Log] Entrada registrada en ' + filename + ': ' + funcion);
  } catch(e) {
    Logger.log('[Log] Error escribiendo Log_ScriptTerna.json: ' + e.message);
  }
}