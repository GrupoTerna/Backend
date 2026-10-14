// =============================================================================
// 04_Organizador_JSON.gs
// Organización de archivos de respaldo JSON: drena la carpeta raíz hacia la
// carpeta de cada clan y, dentro de ella, hacia la subcarpeta que le
// corresponda según el endpoint (CurrentRiverRace / Clans).
//
// Esta es la ÚNICA implementación de "drenar raíz → carpeta de clan" del
// proyecto. Antes existía una copia casi idéntica dentro de
// 05_Migrador_Formato.gs (_mig_drenarRaiz); ahora ese archivo simplemente
// llama a _organizarJSON_procesarRaiz_() de aquí, así que solo hay un lugar
// que mantener.
//
// Contiene:
//   - organizarArchivosJSON()        → punto de entrada manual (editor).
//   - _organizarJSON_procesarRaiz_() → motor reutilizable, también se llama
//                                       internamente desde 05 (y podría
//                                       llamarse desde 06 si hiciera falta).
// =============================================================================

/** @const {string} ID de la carpeta raíz que contiene los respaldos JSON. */
var CARPETA_JSON_RAIZ_ID_ = '1fe_z2gahCDeVrYEbG8B2ts-XDJzbNBu8';

/**
 * Mapa de clanes a IDs de subcarpeta en Drive.
 * @const {Object.<string, string>}
 */
var CARPETAS_CLAN_ = {
  'grupo乂terna™':   '1J7M0A2sKoN0vwXDHPOKjJ_QkLzwbIoWR',
  'grupoxterna™2':   '1i7lZIw_69S_6NtQLAmSjMV_6TePKu8cH',
  'grupoxterna™3':   '1nkBknCl29nAO7Pph4QM4BAeO05Up2GFm',
  'mini乂ternas™':   '1p7mu6rh0wu5hCWTEPttlCjNGF1Cgdqbi',
  'naranja x':       '1DKxLFE7P0pnItV6nTk6Q1jCctF1YgGx9'
};

/**
 * PF074 (14-oct-2026): ESQUEMA ACTUAL de carpetas, el que escribe Base desde el 25/26-sep: endpoint -> clan.
 * endpoint (CurrentRiverRace / Clans) -> carpeta del clan dentro de ese endpoint. Las claves de clan son las mismas
 * de CARPETAS_CLAN_. COPIA de _SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_ y _SUBCARPETAS_CLAN_POR_ENDPOINT_CLANS_
 * de Base/src/09_API_ClashRoyale.gs: si cambian alla, hay que cambiarlas aqui (son proyectos de Apps Script separados).
 * CARPETAS_CLAN_ (esquema VIEJO: JSON/<clan>/CurrentRiverRace|Clans) se conserva solo para leer lo historico que
 * pudiera seguir ahi. [→ Contexto_Base_Web.md §PF074]
 * @const {Object.<string, Object.<string, string>>}
 */
var CARPETAS_CLAN_POR_ENDPOINT_ = {
  'currentriverrace': {
    'grupo乂terna™':   '18TF9ufSGw8YlEA9Hpu7fT8d0UmiPnkYB',
    'grupoxterna™2':   '1X6dufNme2whAkjHarBCm1jdC6xI0_aQ6',
    'grupoxterna™3':   '1BN8ercCNZeUZYib8jGoVCzkAx2OJ7LWB',
    'mini乂ternas™':   '1gLW3F9cqNc58VYNvUKmAOT9TtUA6PMxQ',
    'naranja x':       '1YHhptq93vyECa3KpcEnOEXjEcuz6XBvE'
  },
  'clans': {
    'grupo乂terna™':   '1MiiF08kqyTcVt7CyBroyDRjv8eARpgfo',
    'grupoxterna™2':   '1D_GUUFTw9P6oSQXsaonxwXlmmp7sZA9M',
    'grupoxterna™3':   '15FCgOyzp2Vd9JtJszWd-EsS_2kKVnlnp',
    'mini乂ternas™':   '16MPII4hSHAATIPhrGDhuV6uT_Rd2YzHQ',
    'naranja x':       '1Lhs379eEIpdXJ-2DyWkcYBbkXg4WngaN'
  }
};

// ID reservado para uso futuro (carpeta "players").
var CARPETA_PLAYERS_ID_ = '1Kqmn7ExFr3cDER_DgKnHwHlWc9lLW9aF';

/**
 * Mapa endpoint (tal como aparece en el nombre del archivo, en minúsculas,
 * sin ".json") → nombre de la subcarpeta dentro de CADA carpeta de clan.
 *
 * Un endpoint que NO esté en este mapa se queda suelto en la raíz de la
 * carpeta del clan (comportamiento anterior a este cambio), así que
 * agregar más endpoints en el futuro es seguro y no rompe nada.
 */
var CARPETAS_JSON_POR_ENDPOINT_ = {
  'currentriverrace': 'CurrentRiverRace',
  'clans':             'Clans'
};

/** @const {number} Presupuesto de tiempo por ejecución manual, en ms. */
var ORGANIZAR_LIMITE_MS_ = 5 * 60 * 1000;

/** @const {string} Clave en PropertiesService para el estado de organizarArchivosJSON(). */
var ORGANIZAR_PROP_ESTADO_ = 'ORGANIZAR_JSON_ESTADO_V1';

/** @const {string} Nombre del handler que se re-programa como trigger. */
var ORGANIZAR_TRIGGER_HANDLER_ = 'organizarArchivosJSON';

/**
 * Punto de entrada MANUAL. Ejecutar directamente desde el editor cuando se
 * quiera drenar la raíz sin correr la migración completa de 05.
 *
 * Igual que migrarFormatoJSON() (05), controla su propio presupuesto de
 * tiempo: si hay tantos archivos que no alcanza a terminar en una sola
 * ejecución, guarda el avance y programa un trigger para continuar sola en
 * ~1 minuto, sin repetir trabajo (mover un archivo que ya no está en la
 * raíz simplemente no vuelve a aparecer).
 */
function organizarArchivosJSON() {
  var inicio = new Date().getTime();
  var props  = PropertiesService.getScriptProperties();
  var estadoGuardado = props.getProperty(ORGANIZAR_PROP_ESTADO_);
  var resumen = estadoGuardado ? JSON.parse(estadoGuardado) : { movidos: 0, ignorados: [] };

  console.log('organizarArchivosJSON() — ' +
    (estadoGuardado ? 'continuando ejecución anterior…' : 'inicio nuevo…'));

  var completo = _organizarJSON_procesarRaiz_(resumen, inicio);

  if (!completo) {
    props.setProperty(ORGANIZAR_PROP_ESTADO_, JSON.stringify(resumen));
    _organizarJSON_borrarTriggersPendientes_();
    ScriptApp.newTrigger(ORGANIZAR_TRIGGER_HANDLER_).timeBased().after(60 * 1000).create();
    console.log('⏸ Presupuesto de tiempo alcanzado. Progreso guardado (movidos hasta ahora: ' +
      resumen.movidos + '). Continuará sola en ~1 minuto.');
    return;
  }

  props.deleteProperty(ORGANIZAR_PROP_ESTADO_);
  _organizarJSON_borrarTriggersPendientes_();

  console.log('──────────────────────────────────────────');
  console.log('Archivos movidos: ' + resumen.movidos);
  if (resumen.ignorados.length === 0) {
    console.log('Sin archivos ignorados.');
  } else {
    console.log('Archivos ignorados (' + resumen.ignorados.length + '):');
    resumen.ignorados.forEach(function(linea) { console.log('  · ' + linea); });
  }
}

/**
 * Motor reutilizable: recorre la carpeta raíz de JSON y mueve cada archivo
 * a la subcarpeta del clan que figure en su nombre y, dentro de ella, a la
 * subcarpeta que le corresponda según su endpoint (ver
 * CARPETAS_JSON_POR_ENDPOINT_). Las subcarpetas de endpoint se crean solas
 * si todavía no existen en esa carpeta de clan (getOrCreate).
 *
 * El nombre debe tener la forma: <fecha> - <clan> - <endpoint>.json
 * El separador es " - " (espacio guion espacio). Si el archivo ya trae el
 * tag "T-.. S-.. P.I-.." de una migración anterior, sigue funcionando
 * igual: ese tag vive DENTRO del primer segmento (antes de la primera
 * " - "), así que no afecta el corte de clan/endpoint.
 *
 * Es el "motor" compartido: lo llama organizarArchivosJSON() (uso manual)
 * y migrarFormatoJSON() en 05_Migrador_Formato.gs (como su Paso 1).
 *
 * @param {Object} resumen Acumulador con, al menos, { movidos, ignorados }.
 * @param {number=} inicio Timestamp (ms) de inicio de la ejecución actual.
 *   Si se pasa, la función revisa el presupuesto de tiempo periódicamente
 *   (ORGANIZAR_LIMITE_MS_) y puede cortar antes de terminar toda la raíz.
 * @return {boolean} true si terminó de drenar toda la raíz, false si se
 *   cortó por presupuesto de tiempo (es seguro reintentar: los archivos ya
 *   movidos no vuelven a aparecer en la raíz).
 */
function _organizarJSON_procesarRaiz_(resumen, inicio) {
  var carpetaRaiz = DriveApp.getFolderById(CARPETA_JSON_RAIZ_ID_);
  var archivos    = carpetaRaiz.getFiles();

  while (archivos.hasNext()) {
    if (inicio && _organizarJSON_tiempoAgotado_(inicio)) {
      console.log('    (presupuesto de tiempo alcanzado; se continúa el drenaje de la raíz en la próxima ejecución)');
      return false;
    }

    var archivo = archivos.next();
    var nombre  = archivo.getName();

    if (nombre.slice(-5).toLowerCase() !== '.json') {
      resumen.ignorados.push(nombre + '  [razón: no es .json]');
      continue;
    }

    var partes = nombre.split(' - ');
    if (partes.length < 3) {
      resumen.ignorados.push(nombre + '  [razón: formato no reconocido]');
      continue;
    }

    var segClan   = partes[1].trim();
    var clanClave = segClan.toLowerCase();

    if (!CARPETAS_CLAN_.hasOwnProperty(clanClave)) {
      resumen.ignorados.push(nombre + '  [razón: clan "' + segClan + '" no registrado]');
      continue;
    }

    var endpoint = partes.slice(2).join(' - ').replace(/\.json$/i, '').toLowerCase();
    // PF074: destino segun el esquema ACTUAL (endpoint -> clan); si el endpoint no esta mapeado, queda en la carpeta
    // vieja del clan como antes.
    var carpetaDestino = _carpetaDestinoJSON_(clanClave, endpoint);

    archivo.moveTo(carpetaDestino);
    resumen.movidos++;
    console.log('    [raíz → ' + segClan + ' / ' + endpoint + '] ' + nombre);
  }

  return true;
}

/**
 * Devuelve la subcarpeta "nombre" dentro de "carpetaPadre", creándola si
 * todavía no existe. Idempotente: si dos ejecuciones la buscan a la vez,
 * en el peor caso Drive permite carpetas con nombre repetido, pero en el
 * uso normal (secuencial) esto nunca pasa.
 * @param {Folder} carpetaPadre
 * @param {string} nombre
 * @return {Folder}
 */
function _carpetaHijaOCrear_(carpetaPadre, nombre) {
  var it = carpetaPadre.getFoldersByName(nombre);
  if (it.hasNext()) return it.next();
  return carpetaPadre.createFolder(nombre);
}

/**
 * Devuelve TODOS los archivos que pertenecen a una carpeta de clan: los
 * que están sueltos directamente en ella (compatibilidad con lo que ya
 * había antes de organizar en subcarpetas) más los que están dentro de
 * cada subcarpeta de endpoint conocida (CurrentRiverRace, Clans, y
 * cualquier otra que se agregue a CARPETAS_JSON_POR_ENDPOINT_ en el
 * futuro). La usan 06_Limpieza_Duplicados_JSON.gs (_analizarCarpetaJSON_)
 * para que el análisis de identidad vea el historial completo del clan
 * sin importar en qué subcarpeta quedó cada archivo.
 * @param {Folder} carpetaClan
 * @return {Array<File>}
 */
function _archivosDeCarpetaClan_(carpetaClan) {
  var lista = [];

  var top = carpetaClan.getFiles();
  while (top.hasNext()) lista.push(top.next());

  var nombresSubcarpetas = {};
  Object.keys(CARPETAS_JSON_POR_ENDPOINT_).forEach(function(k) {
    nombresSubcarpetas[CARPETAS_JSON_POR_ENDPOINT_[k]] = true;
  });

  Object.keys(nombresSubcarpetas).forEach(function(nombreSub) {
    var itCarpetas = carpetaClan.getFoldersByName(nombreSub);
    while (itCarpetas.hasNext()) {
      var sub = itCarpetas.next();
      var archivosSub = sub.getFiles();
      while (archivosSub.hasNext()) lista.push(archivosSub.next());
    }
  });

  return lista;
}

/**
 * PF074: carpeta donde debe vivir un JSON de un clan y un endpoint: la del esquema ACTUAL (endpoint -> clan) si ese
 * endpoint esta en CARPETAS_CLAN_POR_ENDPOINT_; si no, la carpeta vieja del clan (CARPETAS_CLAN_).
 * @param {string} clanClave Clave de clan en minusculas (como en CARPETAS_CLAN_).
 * @param {string} endpointKey 'currentriverrace' | 'clans' | otro.
 * @return {Folder}
 */
function _carpetaDestinoJSON_(clanClave, endpointKey) {
  var porClan = CARPETAS_CLAN_POR_ENDPOINT_[endpointKey];
  if (porClan && porClan[clanClave]) return DriveApp.getFolderById(porClan[clanClave]);
  return DriveApp.getFolderById(CARPETAS_CLAN_[clanClave]);
}

/**
 * PF074: lista recursiva (hasta `maxNivel` niveles de subcarpetas) de los archivos de una carpeta.
 * @param {Folder} carpeta
 * @param {number} maxNivel
 * @return {Array<File>}
 */
function _archivosRecursivo_(carpeta, maxNivel) {
  var lista = [];
  (function recorrer(c, nivel) {
    var it = c.getFiles();
    while (it.hasNext()) lista.push(it.next());
    if (nivel >= maxNivel) return;
    var sub = c.getFolders();
    while (sub.hasNext()) recorrer(sub.next(), nivel + 1);
  })(carpeta, 0);
  return lista;
}

/**
 * PF074: TODOS los archivos de un clan, vistos juntos: las carpetas del esquema ACTUAL (CurrentRiverRace/<clan> y
 * Clans/<clan>, con sus subcarpetas de temporada y semana, hasta 3 niveles) mas la carpeta vieja del clan
 * (CARPETAS_CLAN_, con sus subcarpetas CurrentRiverRace y Clans). Hace falta verlos juntos porque un clans.json no trae
 * periodIndex y toma prestado el de la captura currentriverrace.json mas cercana (Paso B de _analizarCarpetaJSON_), y
 * ahora esos dos tipos de archivo viven en carpetas distintas.
 * @param {string} clanClave Clave de clan en minusculas (como en CARPETAS_CLAN_).
 * @return {Array<File>}
 */
function _archivosDeClan_(clanClave) {
  var vistos = {}, lista = [];
  function agregar(arr) {
    arr.forEach(function(f) {
      var id = f.getId();
      if (!vistos[id]) { vistos[id] = true; lista.push(f); }
    });
  }
  Object.keys(CARPETAS_CLAN_POR_ENDPOINT_).forEach(function(endpointKey) {
    var id = CARPETAS_CLAN_POR_ENDPOINT_[endpointKey][clanClave];
    if (id) agregar(_archivosRecursivo_(DriveApp.getFolderById(id), 3));
  });
  if (CARPETAS_CLAN_[clanClave]) agregar(_archivosDeCarpetaClan_(DriveApp.getFolderById(CARPETAS_CLAN_[clanClave])));
  return lista;
}

function _organizarJSON_tiempoAgotado_(inicio) {
  return (new Date().getTime() - inicio) > ORGANIZAR_LIMITE_MS_;
}

function _organizarJSON_borrarTriggersPendientes_() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === ORGANIZAR_TRIGGER_HANDLER_) {
      ScriptApp.deleteTrigger(t);
    }
  });
}