// ==============================================================================
// 20_HistorialGuerraJugador.gs
// Historial de guerra por jugador (grupal + individual) y alertas asociadas.
// ==============================================================================

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 29-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Alertas del historial de guerra: resolver
//    - Revision_Guerra.csv: aplicar la decisión «Conservar» o «Reemplazar»
//    - Diagnóstico de River Race
//    - Limpieza de archivos repetidos de la carpeta Individual: atajos del editor
//  Parte 2 — Funciones que no se corren a mano
//    - Alertas del historial de guerra: ayuda
//    - Guardar un registro (lo llaman la web y la resolución de alertas)
//    - Historial individual (un JSON por jugador en Drive)
//    - Historial grupal (HistorialGuerra_Grupal.csv)
//    - Revision_Guerra.csv: decisión «Conservar» o «Reemplazar» sobre los valores distintos del historial grupal
//    - Comparar y reemplazar registros (lo usan el individual y el grupal)
//    - Web: historial por jugador (lectura)
//    - Limpieza de archivos repetidos de la carpeta Individual: función principal
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

// (ORDEN DE EJECUCIÓN: 24 — Histórico de Guerra [→ Contexto_Base_Web.md §20B001]

// PRIORIDAD DE FUENTES (cambiada el 11-oct-2026, antes Perfil > Log > Analytics): Log > Analytics > Perfil. [→ Contexto_Base_Web.md §20B002, §PF032]
var FUENTE_PRIORIDAD_HISTORIAL_GUERRA = {
  'riverrace': 0,
  'perfil':    1,
  'analytics': 2,
  'log':       3
};

// HOJA DE ALERTAS (Sección 8 P3 del consolidado) — una fila por discrepancia [→ Contexto_Base_Web.md §20B003]
var AHG = {
  TAG: 1, NOMBRE: 2, TEMPORADA_INTERNA: 3, TEMPORADA_ROYALEAPI: 4, SEMANA: 5,
  CLAN: 6, FUENTE_NUEVA: 7,
  ATAQUES_RIVERRACE: 8, ATAQUES_NUEVO: 9,
  FAME_RIVERRACE: 10, FAME_NUEVO: 11,
  BARCOS_RIVERRACE: 12, BARCOS_NUEVO: 13,
  FECHA_DETECTADO: 14, ESTADO: 15,
  VALOR_CORRECTO_ATAQUES: 16, VALOR_CORRECTO_FAME: 17, VALOR_CORRECTO_BARCOS: 18,
  NOTAS: 19
};

var AHG_ENCABEZADOS = [
  'Tag', 'Nombre', 'TemporadaInterna', 'TemporadaRoyaleAPI', 'Semana', 'Clan', 'FuenteNueva',
  'Ataques_RiverRace', 'Ataques_Nuevo', 'Fame_RiverRace', 'Fame_Nuevo', 'Barcos_RiverRace', 'Barcos_Nuevo',
  'FechaDetectado', 'Estado', 'ValorCorrecto_Ataques', 'ValorCorrecto_Fame', 'ValorCorrecto_Barcos', 'Notas'
];

var AHG_TOTAL_COLS = 19;

// FASE 2 (04-sep-2026, pedido del usuario, punto 1 del documento de [→ Contexto_Base_Web.md §20B004]
var HISTORIAL_GUERRA_GRUPAL_ENCABEZADOS = [
  'Tag', 'Nombre',
  'TemporadaInterna', 'TemporadaRoyaleAPI', 'Semana', 'Clan',
  'Ataques', 'Fame', 'Barcos', 'Fuente', 'Cerrada', 'Alerta', 'Comentario'
];

// CSV GRUPAL (desde el 1-nov-2026 en CSV/Tampermonkey, §PF321; antes carpeta DRIVE_FOLDER_ID_ROYALEAPI_GRUPAL, Sección 6 del [→ Contexto_Base_Web.md §20B005]
var HISTORIAL_GUERRA_GRUPAL_FILENAME = 'HistorialGuerra_Grupal.csv';

// PUNTO 2 DE LA HOJA DE RUTA — endpoint que recibe los "registro" ya armados [→ Contexto_Base_Web.md §20B006]

// NUEVO (15-sep-2026, hallazgo B-35 de Plan_Fases.md): movido a Script [→ Contexto_Base_Web.md §20B007]
var HISTORIAL_GUERRA_TOKEN = _scriptToken('HISTORIAL_GUERRA_TOKEN');

// Índice en memoria { tag: DriveFile }, memoizado para el resto de la [→ Contexto_Base_Web.md §20B008]
var _HISTORIAL_GUERRA_DRIVE_INDEX_POR_TAG = null;

// §PF321: true cuando ya se comprobó (en esta ejecución) si el CSV grupal había que mover de JSON/RoyaleAPI/Grupal a CSV/Tampermonkey.
var _HISTORIAL_GUERRA_GRUPAL_CSV_MOVIDO = false;

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Alertas del historial de guerra: resolver -----

// NOTA DE REORDEN (23-ago-2026, pedido usuario): las funciones manuales [→ Contexto_Base_Web.md §20B009]

/**
 * resolverAlertasHistorialGuerra() [→ Contexto_Base_Web.md §20B010]
 */
function resolverAlertasHistorialGuerra() {
  if (_bloquearSiReenumerando_('resolverAlertasHistorialGuerra')) return; // PF260
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.ALERTAS_HISTORIAL_GUERRA);
  if (!sh) {
    Logger.log('[HistorialGuerra][Alertas] Hoja Alertas_HistorialGuerra no existe todavía — nada que resolver.');
    return;
  }

  var lastRow = sh.getLastRow();
  if (lastRow < 2) {
    Logger.log('[HistorialGuerra][Alertas] Hoja vacía — nada que resolver.');
    return;
  }

  var filas = sh.getRange(2, 1, lastRow - 1, AHG_TOTAL_COLS).getValues();
  var filasAEliminar = []; // números de fila REAL en la hoja (1-based), para borrar después
  var resueltas = 0;
  var errores = 0;

  for (var i = 0; i < filas.length; i++) {
    var f = filas[i];
    var estado = String(f[AHG.ESTADO - 1] || '').trim();
    if (estado !== 'Resuelto') continue;

    var tag = String(f[AHG.TAG - 1] || '').trim();
    if (!tag) continue;

    try {
      var registroCorregido = {
        temporadaInterna:   Number(f[AHG.TEMPORADA_INTERNA - 1]),
        temporadaRoyaleAPI: _numOrNull(f[AHG.TEMPORADA_ROYALEAPI - 1]),
        semana:             Number(f[AHG.SEMANA - 1]),
        clan:               f[AHG.CLAN - 1] || '',
        ataques: (f[AHG.VALOR_CORRECTO_ATAQUES - 1] === '') ? _numOrNull(f[AHG.ATAQUES_NUEVO - 1]) : Number(f[AHG.VALOR_CORRECTO_ATAQUES - 1]),
        fame:    (f[AHG.VALOR_CORRECTO_FAME - 1]    === '') ? _numOrNull(f[AHG.FAME_NUEVO - 1])    : Number(f[AHG.VALOR_CORRECTO_FAME - 1]),
        barcos:  (f[AHG.VALOR_CORRECTO_BARCOS - 1]  === '') ? _numOrNull(f[AHG.BARCOS_NUEVO - 1])  : Number(f[AHG.VALOR_CORRECTO_BARCOS - 1]),
        fuente:  f[AHG.FUENTE_NUEVA - 1] || 'perfil',
        cerrada: true
        // Sin "alerta": al reescribirse el registro completo (JSON) / la fila
        // completa (CSV) sin esa propiedad, el flag queda limpio solo.
      };

      var nombre = f[AHG.NOMBRE - 1] || '';
      _guardarRegistroHistorialGuerra(tag, nombre, registroCorregido.clan, registroCorregido);

      filasAEliminar.push(i + 2); // +2: fila 1 = encabezados, filas[] es 0-based
      resueltas++;
    } catch (e) {
      errores++;
      Logger.log('[HistorialGuerra][Alertas] Error resolviendo fila de ' + tag +
                 ' (Temporada ' + f[AHG.TEMPORADA_INTERNA - 1] + ' / Semana ' + f[AHG.SEMANA - 1] +
                 '): ' + e.message + ' — la fila se deja como estaba, no se borra.');
    }
  }

  // Borrar de abajo hacia arriba para que cada índice siga siendo válido [→ Contexto_Base_Web.md §20B011]
  filasAEliminar.sort(function (a, b) { return b - a; });
  for (var j = 0; j < filasAEliminar.length; j++) {
    sh.deleteRow(filasAEliminar[j]);
  }

  Logger.log('[HistorialGuerra][Alertas] Resolución terminada: ' + resueltas +
             ' fila(s) aplicada(s) y removida(s) de la hoja' +
             (errores > 0 ? ', ' + errores + ' error(es) (ver log arriba, filas no borradas).' : '.'));
}

// ----- Revision_Guerra.csv: aplicar la decisión «Conservar» o «Reemplazar» (§PF325) -----

/**
 * aplicarDecisionesRevisionGuerra() [→ Contexto_Base_Web.md §PF325]
 * Se corre a mano después de escribir en la columna Estado de Revision_Guerra.csv: «Conservar» deja el valor guardado y borra la alternativa; «Reemplazar» aplica el valor
 * nuevo y borra el guardado. Solo atiende los valores distintos del historial grupal (CSV grupal y JSON grupal por clan). «Pendiente» y «Resuelto» no se tocan.
 * Primero escribe el dato final y solo después borra la fila de Revision_Guerra.csv; si el valor guardado cambió desde que se creó la fila, no aplica nada y la devuelve a «Pendiente».
 */
function aplicarDecisionesRevisionGuerra() {
  if (_bloquearSiReenumerando_('aplicarDecisionesRevisionGuerra')) return;
  var etq = '[HistorialGuerra][Revisión]';
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    Logger.log(etq + ' No se pudo obtener el lock: hay otra escritura en curso. Vuelve a correr la función en unos minutos.');
    return;
  }
  try {
    _rgAplicarDecisiones_(etq);
  } catch (e) {
    Logger.log(etq + ' Error: ' + (e.message || e) + '. Las filas de Revision_Guerra.csv no se borraron; vuelve a correr la función.');
  } finally {
    lock.releaseLock();
  }
}

// ----- Diagnóstico de River Race -----

// DISPARADOR AUTOMÁTICO para resolverAlertasHistorialGuerra() — pendiente [→ Contexto_Base_Web.md §20B012]

// MOVIDO (05-oct-2026, pedido usuario): activarTriggerResolverAlertasHistorialGuerra()/ [→ Contexto_Base_Web.md §20B013]

// DIAGNÓSTICO River Race — paso previo obligatorio antes de programar el [→ Contexto_Base_Web.md §20B014]

/**
 * diagnosticoRiverRaceHTML(clanTags) [→ Contexto_Base_Web.md §20B015]
 */
function diagnosticoRiverRaceHTML(clanTags) {
  var tags = clanTags || ['GCRG8L00', 'GYCU9YRG', 'GQQPPJGR', 'GG99LCJY'];
  var resumen = [];

  for (var i = 0; i < tags.length; i++) {
    var tag = tags[i];
    var url = 'https://royaleapi.com/clan/' + tag + '/war/race';
    try {
      var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      var codigo = resp.getResponseCode();
      var html = resp.getContentText();

      var tieneNextData = html.indexOf('__NEXT_DATA__') !== -1;
      var tieneOtroJsonEmbebido = /<script[^>]+type=["']application\/json["']/.test(html);
      var tieneTextoTabla = html.indexOf('Decks used today') !== -1;

      var nombreArchivo = 'DiagnosticoRiverRace_' + tag + '.txt';
      DriveApp.createFile(nombreArchivo, html, MimeType.PLAIN_TEXT);

      var linea = '[RiverRace-Diag] ' + tag + ' → HTTP ' + codigo +
                  ' | largo=' + html.length +
                  ' | __NEXT_DATA__=' + tieneNextData +
                  ' | otro_json_embebido=' + tieneOtroJsonEmbebido +
                  ' | texto_tabla_visible=' + tieneTextoTabla +
                  ' | guardado en Drive: ' + nombreArchivo;
      Logger.log(linea);
      resumen.push(linea);
    } catch (e) {
      var lineaError = '[RiverRace-Diag] ' + tag + ' → ERROR: ' + e.message;
      Logger.log(lineaError);
      resumen.push(lineaError);
    }
  }

  Logger.log('[RiverRace-Diag] Resumen completo:\n' + resumen.join('\n'));
  return resumen;
}

// ----- Limpieza de archivos repetidos de la carpeta Individual: atajos del editor -----

/** Atajos para el editor de Apps Script (sin parámetros): simula / aplica la limpieza de la carpeta Individual. */
function limpiarDuplicadosHistorialGuerraIndividualSimular() { return limpiarDuplicadosHistorialGuerraIndividual(false); }

function limpiarDuplicadosHistorialGuerraIndividualAplicar() { return limpiarDuplicadosHistorialGuerraIndividual(true); }

// ----- Llenado inicial del JSON grupal por clan desde los JSON individuales (§PF321) -----

/**
 * Lee los JSON individuales de RoyaleAPI (carpeta Individual) y agrega al JSON grupal de cada clan lo que trae su Log cerrado, con la temporada Supercell. Se puede correr las veces que haga
 * falta: lo que ya estaba no se duplica y un valor distinto queda como alternativa y va a Revision_Guerra.csv. Si no alcanza en una tanda, se programa sola.
 */
function reconstruirJsonGrupalDesdeIndividuales() { _hgReconstruirJsonGrupal_(false); }

/** Punto de entrada del disparador de continuación de reconstruirJsonGrupalDesdeIndividuales() (no se corre a mano). */
function _continuarReconstruirJsonGrupalDesdeIndividuales() { _hgReconstruirJsonGrupal_(true); }

/** Borra el avance del llenado y su continuación pendiente. No borra ningún archivo de Drive: la próxima corrida recorre los JSON individuales desde el primero, sin duplicar lo ya agregado. */
function reconstruirJsonGrupalReiniciar() {
  PropertiesService.getScriptProperties().deleteProperty(HG_JSON_GRUPAL_ESTADO_PROP);
  _borrarTriggersDeContinuacion('_continuarReconstruirJsonGrupalDesdeIndividuales');
  try {
    var raw = PropertiesService.getScriptProperties().getProperty('EJECUCION_EN_CURSO');
    var info = raw ? JSON.parse(raw) : null;
    if (info && String(info.fn) === 'reconstruirJsonGrupalDesdeIndividuales') _liberarLockEjecucion();
  } catch (e) { /* propiedad corrupta: se deja como está */ }
  Logger.log('[JSON grupal] Avance borrado. La próxima corrida empieza desde el primer JSON individual.');
}

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Alertas del historial de guerra: ayuda -----

// RESOLUCIÓN de alertas (Sección 8 P3 del consolidado, mecanismo confirmado [→ Contexto_Base_Web.md §20B037]

/**
 * _numOrNull(v) [→ Contexto_Base_Web.md §20B038]
 */
function _numOrNull(v) {
  return (v === '' || v === null || v === undefined) ? null : Number(v);
}

// ----- Guardar un registro (lo llaman la web y la resolución de alertas) -----

/**
 * _aplicarHistorialGuerra(candidatosPayload) [→ Contexto_Base_Web.md §20B019]
 */
function _aplicarHistorialGuerra(candidatosPayload) {
  if (!candidatosPayload || !candidatosPayload.length) {
    return { ok: false, error: 'Sin candidatos en el payload.', procesados: 0, registrosGuardados: 0 };
  }

  var offset = _getTemporadaOffsetRoyaleApi(); // 18_CorreccionGuerra.gs — mismo mapeo que Correcciones_Guerra.csv
  var procesados = 0, registrosGuardados = 0, registrosExternos = 0;
  var errores = [];
  var itemsGrupal = []; // se escriben todos juntos al final (un solo CSV grupal por petición) [→ Contexto_Base_Web.md §PF068]

  for (var c = 0; c < candidatosPayload.length; c++) {
    var cand = candidatosPayload[c] || {};
    var tag = String(cand.tag || '').trim().toUpperCase();
    if (!tag) continue;
    var nombre = cand.nombre || '';
    // §PF341: `soloIndividual` (Tampermonkey v3.20) = alguien que ya no está en los clanes Terna y se conoce solo por su tag (sin nombre real): todo lo suyo va
    // únicamente a su JSON individual, nada al CSV grupal ni al JSON grupal. Sin la marca (Tampermonkey anterior) todo funciona como antes.
    var soloIndividual = cand.soloIndividual === true;
    var registrosEntrada = cand.registros || [];
    var registrosDelJugador = [];
    var clanDelJugador = '';
    var clanExternoDelJugador = ''; // solo se usa para el nombre de un archivo NUEVO cuando el lote del jugador trae únicamente filas externas

    try {
      for (var r = 0; r < registrosEntrada.length; r++) {
        var reg = registrosEntrada[r] || {};
        var temporadaRoyaleApi = Number(reg.temporadaRoyaleApi);
        var semana = Number(reg.semana);
        if (!temporadaRoyaleApi || !semana) continue; // sin clave confiable: se descarta

        var registroCompleto = {
          temporadaInterna:   temporadaRoyaleApi - offset,
          temporadaRoyaleAPI: temporadaRoyaleApi,
          semana:             semana,
          clan:               reg.clan || cand.clan || '',
          ataques: (reg.ataques === undefined || reg.ataques === null || reg.ataques === '') ? null : Number(reg.ataques),
          fame:    (reg.fame    === undefined || reg.fame    === null || reg.fame    === '') ? null : Number(reg.fame),
          barcos:  (reg.barcos  === undefined || reg.barcos  === null || reg.barcos  === '') ? null : Number(reg.barcos),
          fuente:  reg.fuente || 'perfil',
          cerrada: reg.cerrada !== false // por defecto true; solo River Race mandaría cerrada:false explícito (todavía no implementado del lado cliente)
        };

        // §PF340 (2-nov-2026): una fila de un clan que NO es de CFG.TERNA_TAGS (decide el backend por el tag del clan que manda Tampermonkey; sin tag se trata
        // como Terna, igual que antes) se guarda SOLO en el JSON individual, como total del jugador en esa semana y ese clan. No va al CSV grupal ni al JSON grupal
        // y los lectores de Guerra (18_, 59_) la ignoran, así que nunca llega a Backup_Guerra.csv. [→ Contexto_Base_Web.md §PF340]
        var clanTagFila = _normalizarClanTagCorreccion(reg.clanTag);
        var esExterna = !!clanTagFila && CFG.TERNA_TAGS.indexOf(clanTagFila) < 0;
        if (esExterna) {
          registroCompleto.externa = true;
          registroCompleto.clanTag = clanTagFila;
        }

        // §PF342 (2-nov-2026): el JSON individual guarda el tag del clan en TODAS las filas, también en las de clanes Terna (antes solo en las externas). Va en una copia:
        // lo que se manda al CSV grupal y al JSON grupal (itemsGrupal) sigue siendo `registroCompleto`, sin ese campo. Sin tag en la entrada (Tampermonkey anterior) no se agrega nada.
        var registroIndividual = registroCompleto;
        if (!esExterna && clanTagFila) {
          registroIndividual = JSON.parse(JSON.stringify(registroCompleto));
          registroIndividual.clanTag = clanTagFila;
        }

        registrosDelJugador.push(registroIndividual);
        if (esExterna) {
          if (registroCompleto.clan) clanExternoDelJugador = registroCompleto.clan;
          registrosExternos++;
        } else {
          if (registroCompleto.clan) clanDelJugador = registroCompleto.clan; // el nombre del archivo usa el clan del último registro Terna, como antes
          if (!soloIndividual) itemsGrupal.push({ tag: tag, nombre: nombre, registro: registroCompleto });
        }
        registrosGuardados++;
      }
      // JSON individual: una lectura y, si cambió algo, una escritura por jugador.
      _guardarRegistrosHistorialGuerraIndividual(tag, nombre, clanDelJugador || clanExternoDelJugador, registrosDelJugador);
      procesados++;
    } catch (e) {
      errores.push({ tag: tag, error: e.message });
      Logger.log('[HistorialGuerra][Endpoint] Error procesando ' + tag + ': ' + e.message);
    }
  }

  // CSV grupal: una lectura y una escritura para toda la petición.
  var grupal = _actualizarFilasHistorialGuerraGrupalLote(itemsGrupal);

  // JSON grupal por clan (§PF321): solo lo que viene del Log; un fallo aquí no afecta a lo ya guardado.
  var jsonGrupal = { guardados: 0, cambios: 0, conflictos: 0, ignorados: 0, sinLock: false };
  try { jsonGrupal = _actualizarJsonGrupalClanesLote(itemsGrupal); }
  catch (eJg) { Logger.log('[HistorialGuerra][JSON grupal] Error: ' + eJg.message); }

  return {
    ok: true, procesados: procesados, registrosGuardados: registrosGuardados, registrosExternos: registrosExternos, errores: errores,
    grupalGuardado: grupal.guardado, grupalCambios: grupal.cambios, grupalIgnorados: grupal.ignorados,
    grupalSinLock: !!grupal.sinLock,
    jsonGrupalGuardados: jsonGrupal.guardados, jsonGrupalCambios: jsonGrupal.cambios, jsonGrupalConflictos: jsonGrupal.conflictos, jsonGrupalSinLock: !!jsonGrupal.sinLock
  };
}

// PUNTO DE ENTRADA ÚNICO (JSON individual + CSV grupal a la vez) [→ Contexto_Base_Web.md §20B033]

/**
 * _guardarRegistroHistorialGuerra(tag, nombre, clanActual, registroNuevo) [→ Contexto_Base_Web.md §20B034]
 */
function _guardarRegistroHistorialGuerra(tag, nombre, clanActual, registroNuevo) {
  _guardarRegistroHistorialGuerraIndividual(tag, nombre, clanActual, registroNuevo);
  _actualizarFilaHistorialGuerraGrupal(tag, nombre, registroNuevo);
}

// GUARDADO (leer → fusionar → guardar completo) [→ Contexto_Base_Web.md §20B035]

/**
 * _guardarRegistroHistorialGuerraIndividual(tag, nombre, clanActual, registroNuevo) [→ Contexto_Base_Web.md §20B036]
 */
function _guardarRegistroHistorialGuerraIndividual(tag, nombre, clanActual, registroNuevo) {
  if (!tag || !registroNuevo) return;
  _guardarRegistrosHistorialGuerraIndividual(tag, nombre, clanActual, [registroNuevo]);
}

// ----- Historial individual (un JSON por jugador en Drive) -----

/**
 * _guardarRegistrosHistorialGuerraIndividual(tag, nombre, clanActual, registrosNuevos) [→ Contexto_Base_Web.md §PF068]
 * Versión por lote: lee el JSON del jugador UNA vez, fusiona todos los registros en memoria
 * y lo escribe UNA vez, y solo si algún registro cambió (o si el jugador aún no tiene archivo).
 */
function _guardarRegistrosHistorialGuerraIndividual(tag, nombre, clanActual, registrosNuevos) {
  if (!tag || !registrosNuevos || !registrosNuevos.length) return;
  try {
    var existente = _cargarHistorialGuerraIndividual(tag);
    var historial = existente || _crearHistorialGuerraVacio(tag);
    var registros = historial.registros || [];
    var antes = JSON.stringify(registros);

    for (var i = 0; i < registrosNuevos.length; i++) {
      registros = _fusionarRegistroEnArrayHistorialGuerra(registros, registrosNuevos[i], tag, nombre);
    }
    historial.registros = registros;

    if (existente && JSON.stringify(registros) === antes) return; // nada cambió: no se toca Drive

    historial.fechaUltimaConsulta = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy');

    var filename  = _buildHistorialGuerraFilename(tag, clanActual);
    var contenido = JSON.stringify(historial, null, 2);
    var folder    = DriveApp.getFolderById(DRIVE_FOLDER_ID_ROYALEAPI_INDIVIDUAL);
    var indice    = _getHistorialGuerraDriveIndexPorTag(folder);
    var archivoExistente = indice[String(tag).trim()] || null;

    // §PF340: si el lote trae solo filas de clan externo, el archivo ya existente conserva su nombre (lleva el clan Terna del jugador); el externo solo nombra un archivo nuevo.
    var soloExternos = registrosNuevos.every(function (rn) { return rn && rn.externa === true; });
    if (archivoExistente) {
      if (!soloExternos && archivoExistente.getName() !== filename) archivoExistente.setName(filename);
      _setContentConConteo_(archivoExistente, contenido);
    } else {
      var nuevoArchivo = _createFileConConteo_(folder, filename, contenido, MimeType.PLAIN_TEXT);
      indice[String(tag).trim()] = nuevoArchivo;
    }
  } catch (e) {
    Logger.log('[HistorialGuerra] Error guardando ' + tag + ': ' + e.message);
  }
}

// CARGA DEL JSON INDIVIDUAL [→ Contexto_Base_Web.md §20B022]

/**
 * _cargarHistorialGuerraIndividual(tag) [→ Contexto_Base_Web.md §20B023]
 */
function _cargarHistorialGuerraIndividual(tag) {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_ROYALEAPI_INDIVIDUAL);
    var indice = _getHistorialGuerraDriveIndexPorTag(folder);
    var archivo = indice[String(tag || '').trim()] || null;
    if (!archivo) return null;

    var contenido = archivo.getBlob().getDataAsString('UTF-8');
    if (!contenido) return null;
    return JSON.parse(contenido);
  } catch (e) {
    Logger.log('[HistorialGuerra] Error cargando ' + tag + ': ' + e.message);
    return null;
  }
}

/**
 * _getHistorialGuerraDriveIndexPorTag(folder) [→ Contexto_Base_Web.md §20B030]
 */
function _getHistorialGuerraDriveIndexPorTag(folder) {
  if (_HISTORIAL_GUERRA_DRIVE_INDEX_POR_TAG) return _HISTORIAL_GUERRA_DRIVE_INDEX_POR_TAG;

  var reTag = /-\s(#[0-9A-Z]+)\.json$/i;
  var idx = {};
  var todos = folder.getFiles();
  while (todos.hasNext()) {
    var f = todos.next();
    var m = reTag.exec(f.getName());
    if (!m) continue;
    var tag = m[1];
    // Por las dudas hubiera más de un archivo del mismo tag (no debería [→ Contexto_Base_Web.md §20B031]
    // 5-nov-2026 (§PF370): los nombres empiezan con la fecha dd-mm-aaaa, así que el orden alfabético elegía el de MAYOR DÍA DEL MES, no el más reciente (22-10-2026 le ganaba a 04-11-2026). Con dos archivos del mismo Tag se elige el de última modificación; solo en ese caso se pide getLastUpdated(), que no se llama en el camino normal.
    if (!idx[tag]) { idx[tag] = f; continue; }
    var tNuevo = f.getLastUpdated().getTime(), tPrevio = idx[tag].getLastUpdated().getTime();
    if (tNuevo > tPrevio || (tNuevo === tPrevio && f.getName() > idx[tag].getName())) idx[tag] = f;
  }

  _HISTORIAL_GUERRA_DRIVE_INDEX_POR_TAG = idx;
  return idx;
}

/**
 * _crearHistorialGuerraVacio(tag)
 * Shell inicial para un jugador que todavía no tiene archivo.
 */
function _crearHistorialGuerraVacio(tag) {
  return {
    tag: String(tag || '').trim(),
    backfillPerfilHecho: false,
    ultimaTemporadaCubierta: null,
    ultimaSemanaCubierta: null,
    fechaUltimaConsulta: null,
    registros: []
  };
}

/**
 * _fusionarRegistroEnArrayHistorialGuerra(registros, nuevo, tag, nombre) [→ Contexto_Base_Web.md §20B028]
 */
function _fusionarRegistroEnArrayHistorialGuerra(registros, nuevo, tag, nombre) {
  // PF040: la clave incluye el clan; registros de clanes distintos de la misma semana coexisten. [→ Contexto_Base_Web.md §PF040]
  var idxExistente = _buscarIndiceHistorialGuerra(registros, nuevo);

  var existente = (idxExistente >= 0) ? registros[idxExistente] : null;
  var decision = _debeReemplazarRegistroHistorialGuerra(existente, nuevo);

  if (!decision.reemplazar) {
    Logger.log('[HistorialGuerra] Se ignora registro entrante (fuente "' + nuevo.fuente +
               '" de menor prioridad que la ya guardada "' + (existente && existente.fuente) +
               '") para Temporada ' + nuevo.temporadaInterna + ' / Semana ' + nuevo.semana);
    return registros;
  }

  var registroFinal = JSON.parse(JSON.stringify(nuevo)); // copia, no mutar el objeto que pasó el llamador
  if (decision.alerta) {
    registroFinal.alerta = true;
    _registrarAlertaHistorialGuerra(tag, nombre, existente, nuevo);
    Logger.log('[HistorialGuerra] ALERTA: valor(es) menor(es) al cerrar Temporada ' +
               nuevo.temporadaInterna + ' / Semana ' + nuevo.semana +
               ' (fuente nueva "' + nuevo.fuente + '" vs. riverrace ya registrado). ' +
               'Fila agregada a la hoja Alertas_HistorialGuerra.');
  }
  // Comentario (FASE 2, 04-sep-2026): mismo criterio que en el CSV grupal [→ Contexto_Base_Web.md §20B029]
  registroFinal.comentario = (existente && existente.comentario) || '';
  // §PF342: si la fila entrante no trae clanTag (Tampermonkey anterior) y la guardada sí, y es del mismo clan, se conserva; con otro clan no se hereda. [→ Contexto_Base_Web.md §PF342]
  if (!registroFinal.clanTag && existente && existente.clanTag &&
      _claveClanHistorialGuerra(existente.clan) === _claveClanHistorialGuerra(registroFinal.clan)) {
    registroFinal.clanTag = existente.clanTag;
  }

  if (idxExistente >= 0) {
    registros[idxExistente] = registroFinal;
  } else {
    registros.push(registroFinal);
  }
  return registros;
}

// NOMBRE DE ARCHIVO E ÍNDICE POR TAG (mismo patrón que Players, [→ Contexto_Base_Web.md §20B020]

/**
 * _buildHistorialGuerraFilename(tag, clanActual) [→ Contexto_Base_Web.md §20B021]
 */
function _buildHistorialGuerraFilename(tag, clanActual) {
  var fechaHora = Utilities.formatDate(new Date(), 'America/Lima', 'dd-MM-yyyy HH.mm');
  // FIX (25-oct-2026): la celda de clan de RoyaleAPI trae pegada la fecha de la semana (tooltip oculto, ver limpiarTextoClan() de Tampermonkey.md) y el nombre del archivo salia como "Clan   2026-02-16". Solo se limpia el NOMBRE DEL ARCHIVO: el campo clan de cada registro no se toca (forma parte de su identidad).
  var clanLimpio = String(clanActual || '').split(/\r?\n/)[0].replace(/\s+\d{4}-\d{2}-\d{2}[\s\S]*$/, '').trim();
  var clan = clanLimpio ? clanLimpio : 'Sin clan';
  return fechaHora + ' - ' + clan + ' - ' + String(tag || '').trim() + '.json';
}

// ----- Historial grupal (HistorialGuerra_Grupal.csv) -----

/**
 * _actualizarFilaHistorialGuerraGrupal(tag, nombre, registroNuevo) [→ Contexto_Base_Web.md §20B016]
 */
function _actualizarFilaHistorialGuerraGrupal(tag, nombre, registroNuevo) {
  if (!tag || !registroNuevo) return;
  // Un solo registro = lote de uno (misma lógica que el envío masivo). [→ Contexto_Base_Web.md §PF068]
  _actualizarFilasHistorialGuerraGrupalLote([{ tag: tag, nombre: nombre, registro: registroNuevo }]);
}

/**
 * _actualizarFilasHistorialGuerraGrupalLote(items) [→ Contexto_Base_Web.md §PF068]
 * items: [{ tag, nombre, registro }]. Toma el lock una vez, lee el CSV grupal UNA vez,
 * aplica todos los items en memoria y lo escribe UNA vez, solo si algo cambió.
 * Devuelve { guardado: bool, cambios: n, ignorados: n }.
 */
function _actualizarFilasHistorialGuerraGrupalLote(items) {
  var res = { guardado: false, cambios: 0, ignorados: 0 };
  if (!items || !items.length) return res;

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    Logger.log('[HistorialGuerra][Grupal] No se pudo obtener el lock — se omiten ' + items.length +
               ' actualización(es) del CSV grupal para evitar pisar otra escritura en curso.');
    res.sinLock = true;
    return res;
  }
  try {
    var csvText = _loadHistorialGuerraGrupalCSV();
    var filas = csvText ? _parseCSV(csvText) : [HISTORIAL_GUERRA_GRUPAL_ENCABEZADOS.slice()];
    if (!filas.length) filas = [HISTORIAL_GUERRA_GRUPAL_ENCABEZADOS.slice()];

    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (!it || !it.tag || !it.registro) continue;
      try {
        if (_aplicarRegistroEnFilasHistorialGuerraGrupal(filas, it.tag, it.nombre, it.registro)) res.cambios++;
        else res.ignorados++;
      } catch (eItem) {
        Logger.log('[HistorialGuerra][Grupal] Error actualizando ' + it.tag + ': ' + eItem.message);
      }
    }

    if (res.cambios > 0) {
      _saveHistorialGuerraGrupalCSV(_encodeCSV(filas));
      res.guardado = true;
    }
  } catch (e) {
    Logger.log('[HistorialGuerra][Grupal] Error en el lote: ' + e.message);
  } finally {
    lock.releaseLock();
  }
  return res;
}

function _loadHistorialGuerraGrupalCSV() {
  var folder = _getHistorialGuerraGrupalFolder();
  var files = folder.getFilesByName(HISTORIAL_GUERRA_GRUPAL_FILENAME);
  if (files.hasNext()) {
    return files.next().getBlob().getDataAsString('UTF-8');
  }
  return null;
}

/**
 * _getHistorialGuerraGrupalFolder() [→ Contexto_Base_Web.md §20B032]
 */
function _getHistorialGuerraGrupalFolder() {
  // §PF321 (1-nov-2026): el CSV grupal vive en CSV/Tampermonkey (la usuaria lo movió a mano); la carpeta JSON/RoyaleAPI/Grupal queda para los JSON grupales por clan.
  // Si el archivo todavía estuviera en la carpeta vieja y no en la nueva, se MUEVE (conserva su ID y su historial de versiones) la primera vez que se pide la carpeta.
  try {
    var destino = _getCsvSubcarpeta_('Tampermonkey', true);
    if (!_HISTORIAL_GUERRA_GRUPAL_CSV_MOVIDO) {
      _HISTORIAL_GUERRA_GRUPAL_CSV_MOVIDO = true;
      if (!destino.getFilesByName(HISTORIAL_GUERRA_GRUPAL_FILENAME).hasNext()) {
        var viejos = _getHistorialGuerraGrupalJsonFolder_().getFilesByName(HISTORIAL_GUERRA_GRUPAL_FILENAME);
        if (viejos.hasNext()) {
          viejos.next().moveTo(destino);
          Logger.log('[HistorialGuerra][Grupal] ' + HISTORIAL_GUERRA_GRUPAL_FILENAME + ' movido de JSON/RoyaleAPI/Grupal a CSV/Tampermonkey.');
        }
      }
    }
    return destino;
  } catch (e) {
    Logger.log('[HistorialGuerra][Grupal] AVISO: no se pudo usar CSV/Tampermonkey (' + (e.message || e) + '); se usa la carpeta anterior.');
    return _getHistorialGuerraGrupalJsonFolder_();
  }
}

/**
 * _getHistorialGuerraGrupalJsonFolder_() [→ Contexto_Base_Web.md §PF321]
 * Carpeta JSON/RoyaleAPI/Grupal (DRIVE_FOLDER_ID_ROYALEAPI_GRUPAL): los JSON grupales por clan; antes también tenía el CSV grupal.
 */
function _getHistorialGuerraGrupalJsonFolder_() {
  try { return DriveApp.getFolderById(DRIVE_FOLDER_ID_ROYALEAPI_GRUPAL); }
  catch (e) {
    var folders = DriveApp.getFoldersByName('Grupal');
    return folders.hasNext() ? folders.next() : DriveApp.createFolder('Grupal');
  }
}

/**
 * _aplicarRegistroEnFilasHistorialGuerraGrupal(filas, tag, nombre, registroNuevo) [→ Contexto_Base_Web.md §PF068]
 * Función en memoria (no toca Drive): fusiona el registro en `filas` (se modifica el array).
 * Devuelve true si cambió algo, false si se ignoró por menor prioridad.
 */
function _aplicarRegistroEnFilasHistorialGuerraGrupal(filas, tag, nombre, registroNuevo) {
  var tagStr = String(tag).trim();
  // PF040: la clave incluye el clan; mismas reglas que el JSON individual. [→ Contexto_Base_Web.md §PF040]
  var regsTag = [], filaDeRegsTag = [];
  for (var i = 1; i < filas.length; i++) { // fila 0 = encabezados
    if (filas[i][0] === tagStr) {
      regsTag.push(_filaHistorialGuerraGrupalARegistro(filas[i]));
      filaDeRegsTag.push(i);
    }
  }
  var posExistente = _buscarIndiceHistorialGuerra(regsTag, registroNuevo);
  var idxExistente = (posExistente >= 0) ? filaDeRegsTag[posExistente] : -1;

  var existenteObj = (idxExistente >= 0) ? _filaHistorialGuerraGrupalARegistro(filas[idxExistente]) : null;
  var decision = _debeReemplazarRegistroHistorialGuerra(existenteObj, registroNuevo);

  if (!decision.reemplazar) {
    Logger.log('[HistorialGuerra][Grupal] Se ignora fila entrante (fuente "' + registroNuevo.fuente +
               '" de menor prioridad) para ' + tagStr + ' Temporada ' + registroNuevo.temporadaInterna +
               ' / Semana ' + registroNuevo.semana);
    return false;
  }

  var registroFinal = JSON.parse(JSON.stringify(registroNuevo));
  if (decision.alerta) {
    registroFinal.alerta = true;
    _registrarAlertaHistorialGuerra(tagStr, nombre, existenteObj, registroNuevo);
  }
  // Comentario (FASE 2, 04-sep-2026): campo manual, nunca lo manda [→ Contexto_Base_Web.md §20B017]
  registroFinal.comentario = (existenteObj && existenteObj.comentario) || '';

  var filaNueva = _registroHistorialGuerraAFilaGrupal(tagStr, nombre, registroFinal);
  if (idxExistente >= 0) {
    // Si la fila resultante es idéntica a la ya guardada (reenvío de lo mismo), no hay cambio que escribir.
    var iguales = (filas[idxExistente].length === filaNueva.length);
    for (var c = 0; iguales && c < filaNueva.length; c++) {
      if (String(filas[idxExistente][c]) !== String(filaNueva[c])) iguales = false;
    }
    if (iguales) return false;
    filas[idxExistente] = filaNueva;
  } else {
    filas.push(filaNueva);
  }
  return true;
}

/**
 * _filaHistorialGuerraGrupalARegistro(fila) [→ Contexto_Base_Web.md §20B026]
 */
function _filaHistorialGuerraGrupalARegistro(fila) {
  return {
    temporadaInterna:   Number(fila[2]),
    temporadaRoyaleAPI: fila[3] === '' ? null : Number(fila[3]),
    semana:             Number(fila[4]),
    clan:               fila[5],
    ataques:            fila[6] === '' ? null : Number(fila[6]),
    fame:               fila[7] === '' ? null : Number(fila[7]),
    barcos:             fila[8] === '' ? null : Number(fila[8]),
    fuente:             fila[9],
    cerrada:            fila[10] === 'true',
    alerta:             fila[11] === 'true',
    // Comentario (FASE 2, 04-sep-2026): columna 13, agregada al final — [→ Contexto_Base_Web.md §20B027]
    comentario:         fila[12] || ''
  };
}

/**
 * _registroHistorialGuerraAFilaGrupal(tag, nombre, registro) [→ Contexto_Base_Web.md §20B042]
 */
function _registroHistorialGuerraAFilaGrupal(tag, nombre, registro) {
  return [
    tag, (nombre || ''),
    registro.temporadaInterna, (registro.temporadaRoyaleAPI == null ? '' : registro.temporadaRoyaleAPI),
    registro.semana, (registro.clan || ''),
    (registro.ataques == null ? '' : registro.ataques),
    (registro.fame == null ? '' : registro.fame),
    (registro.barcos == null ? '' : registro.barcos),
    registro.fuente,
    registro.cerrada ? 'true' : 'false',
    registro.alerta ? 'true' : 'false',
    (registro.comentario || '') // FASE 2 (04-sep-2026) — columna 13, al final.
  ];
}

function _saveHistorialGuerraGrupalCSV(content) {
  var folder = _getHistorialGuerraGrupalFolder();
  var files = folder.getFilesByName(HISTORIAL_GUERRA_GRUPAL_FILENAME);
  if (files.hasNext()) {
    _setContentConConteo_(files.next(), content);
  } else {
    _createFileConConteo_(folder, HISTORIAL_GUERRA_GRUPAL_FILENAME, content, MimeType.CSV);
  }
}

// ----- JSON grupal por clan (§PF321, 1-nov-2026): lo que trae el Log de cada clan, una semana tras otra -----

var HISTORIAL_GUERRA_JSON_GRUPAL_PREFIJO = 'Grupal - ';

/** Nombre del clan tal como se guarda en el JSON grupal: sin el salto de línea ni la fecha que a veces trae pegados el perfil. */
function _nombreClanJsonGrupal_(clan) {
  return String(clan === null || clan === undefined ? '' : clan).split('\n')[0].replace(/\s+\d{4}-\d{2}-\d{2}\s*$/, '').trim();
}

/** Nombre del archivo de un clan en JSON/RoyaleAPI/Grupal: «Grupal - <clan>.json» (sin caracteres que Drive o un zip no admiten). */
function _nombreArchivoJsonGrupal_(clan) {
  return HISTORIAL_GUERRA_JSON_GRUPAL_PREFIJO + _nombreClanJsonGrupal_(clan).replace(/[\\\/:*?"<>|]/g, '-') + '.json';
}

function _crearJsonGrupalVacio_(clan) {
  return { clan: _nombreClanJsonGrupal_(clan), fuente: 'log', fechaUltimaActualizacion: '', semanas: [] };
}

/**
 * Función pura (§PF321). Aplica en memoria los registros del Log (fuente 'log', cerrada) a los documentos grupales por clan.
 * docs = { claveClan: documento } (se modifica y se completa con los clanes nuevos); items = [{ tag, nombre, registro }]; offset = _getTemporadaOffsetRoyaleApi(); ahora = texto de la fecha.
 * Clave de un dato: clan + temporada + semana + jugador. Un Log trae solo semanas cerradas, así que el valor no debería variar: si trae un valor distinto del guardado
 * NO se pisa; el nuevo se guarda también en `alternativas` del jugador, con `revision: 'pendiente'`, y se devuelve en `conflictos` para mandarlo a revisión manual.
 * Un valor que ya estaba (o que ya figura en `alternativas`) no cambia nada. Un dato nulo (RoyaleAPI no lo trae) nunca cuenta como distinto.
 * Cada semana lleva las tres numeraciones: temporadaInterna, temporadaRoyaleAPI y temporadaSupercell (AAAA-MM).
 * Devuelve { cambios, ignorados, tocados: { claveClan: true }, conflictos: [{ clan, tag, nombre, temporada, semana, guardado: {A,F,B}, nuevo: {A,F,B} }] }.
 */
function _jsonGrupalAplicarItems_(docs, items, offset, ahora) {
  var res = { cambios: 0, ignorados: 0, tocados: {}, conflictos: [] };
  var nulo = function (v) { return v === null || v === undefined || v === ''; };
  var campos = [['ataques', 'A'], ['fame', 'F'], ['barcos', 'B']];
  (items || []).forEach(function (it) {
    var r = it && it.registro, tag = String((it && it.tag) || '').trim().toUpperCase();
    if (!r || !tag || String(r.fuente || '').toLowerCase() !== 'log' || r.cerrada === false) { res.ignorados++; return; }
    var clan = _nombreClanJsonGrupal_(r.clan), t = Number(r.temporadaInterna), sem = Number(r.semana);
    if (!clan || !isFinite(t) || !(sem > 0)) { res.ignorados++; return; }
    var clave = _claveClanHistorialGuerra(clan);
    var doc = docs[clave];
    if (!doc) { doc = docs[clave] = _crearJsonGrupalVacio_(clan); res.tocados[clave] = true; }
    var semana = null;
    for (var i = 0; i < doc.semanas.length; i++) { if (Number(doc.semanas[i].temporadaInterna) === t && Number(doc.semanas[i].semana) === sem) { semana = doc.semanas[i]; break; } }
    if (!semana) {
      semana = { temporadaInterna: t, temporadaRoyaleAPI: nulo(r.temporadaRoyaleAPI) ? null : Number(r.temporadaRoyaleAPI), temporadaSupercell: _cgwTemporadaSupercellTexto_(t, offset), semana: sem, jugadores: [] };
      doc.semanas.push(semana);
      res.tocados[clave] = true;
    } else {
      if (nulo(semana.temporadaSupercell)) { var sc = _cgwTemporadaSupercellTexto_(t, offset); if (sc !== '') { semana.temporadaSupercell = sc; res.tocados[clave] = true; } }
      if (nulo(semana.temporadaRoyaleAPI) && !nulo(r.temporadaRoyaleAPI)) { semana.temporadaRoyaleAPI = Number(r.temporadaRoyaleAPI); res.tocados[clave] = true; }
    }
    var nombre = String(it.nombre || '').trim();
    var jug = null;
    for (var k = 0; k < semana.jugadores.length; k++) { if (String(semana.jugadores[k].tag).toUpperCase() === tag) { jug = semana.jugadores[k]; break; } }
    var nuevo = { ataques: nulo(r.ataques) ? null : Number(r.ataques), fame: nulo(r.fame) ? null : Number(r.fame), barcos: nulo(r.barcos) ? null : Number(r.barcos) };
    if (!jug) {
      semana.jugadores.push({ tag: tag, nombre: nombre, ataques: nuevo.ataques, fame: nuevo.fame, barcos: nuevo.barcos });
      res.cambios++; res.tocados[clave] = true;
      return;
    }
    var cambio = false;
    if (nombre && jug.nombre !== nombre) { jug.nombre = nombre; cambio = true; }
    var distinto = false;
    campos.forEach(function (c) {
      var v = nuevo[c[0]];
      if (v === null) return;
      if (nulo(jug[c[0]])) { jug[c[0]] = v; cambio = true; }
      else if (Number(jug[c[0]]) !== v) distinto = true;
    });
    if (distinto) {
      var alts = jug.alternativas = jug.alternativas || [];
      var yaEsta = alts.some(function (a) { return campos.every(function (c) { return nulo(nuevo[c[0]]) || Number(a[c[0]]) === nuevo[c[0]]; }); });
      if (!yaEsta) {
        alts.push({ ataques: nuevo.ataques, fame: nuevo.fame, barcos: nuevo.barcos, fechaDetectado: ahora });
        jug.revision = 'pendiente';
        res.conflictos.push({ clan: clan, tag: tag, nombre: jug.nombre || nombre, temporada: t, semana: sem,
          guardado: { A: jug.ataques, F: jug.fame, B: jug.barcos }, nuevo: { A: nuevo.ataques, F: nuevo.fame, B: nuevo.barcos } });
        cambio = true;
      }
    }
    if (cambio) { res.cambios++; res.tocados[clave] = true; }
  });
  return res;
}

/** Función pura. Deja las semanas de un documento ordenadas por temporada interna y semana, y los jugadores por tag, para que el archivo sea estable. */
function _jsonGrupalOrdenar_(doc) {
  doc.semanas.sort(function (a, b) { return (Number(a.temporadaInterna) - Number(b.temporadaInterna)) || (Number(a.semana) - Number(b.semana)); });
  doc.semanas.forEach(function (w) { w.jugadores.sort(function (a, b) { return a.tag < b.tag ? -1 : (a.tag > b.tag ? 1 : 0); }); });
  return doc;
}

/**
 * _jsonGrupalAlternativaIgual_(jugador, alternativa) [→ Contexto_Base_Web.md §PF322]
 * Función pura. true si la alternativa ya no contradice al valor guardado: cada campo que trae (ataques, fame, barcos) es igual al guardado. Un campo nulo de la alternativa no cuenta.
 */
function _jsonGrupalAlternativaIgual_(jugador, alternativa) {
  var nulo = function (v) { return v === null || v === undefined || v === ''; };
  return ['ataques', 'fame', 'barcos'].every(function (c) {
    return nulo(alternativa[c]) || (!nulo(jugador[c]) && Number(jugador[c]) === Number(alternativa[c]));
  });
}

/**
 * _jsonGrupalFusionarJugador_(destino, origen, ahora) [→ Contexto_Base_Web.md §PF322]
 * Función pura. Junta dos fichas del mismo jugador, el mismo clan y la misma semana (se modifica `destino`). Un dato nulo del destino se rellena; un valor distinto del guardado
 * NO se pisa: pasa a `alternativas` con `revision: 'pendiente'`, igual que _jsonGrupalAplicarItems_(). Las alternativas del origen también se conservan.
 * Devuelve true si el valor del origen contradecía al guardado y es un conflicto nuevo (para mandarlo a Revision_Guerra.csv).
 */
function _jsonGrupalFusionarJugador_(destino, origen, ahora) {
  var nulo = function (v) { return v === null || v === undefined || v === ''; };
  var campos = ['ataques', 'fame', 'barcos'];
  if (!destino.nombre && origen.nombre) destino.nombre = origen.nombre;
  var nuevo = {}, distinto = false;
  campos.forEach(function (c) {
    var v = nulo(origen[c]) ? null : Number(origen[c]);
    nuevo[c] = v;
    if (v === null) return;
    if (nulo(destino[c])) destino[c] = v;
    else if (Number(destino[c]) !== v) distinto = true;
  });
  var alts = Array.isArray(destino.alternativas) ? destino.alternativas : [];
  var igualA = function (a, b) { return campos.every(function (c) { return (nulo(a[c]) ? null : Number(a[c])) === (nulo(b[c]) ? null : Number(b[c])); }); };
  var conflicto = false;
  if (distinto && !alts.some(function (a) { return campos.every(function (c) { return nulo(nuevo[c]) || Number(a[c]) === nuevo[c]; }); })) {
    alts.push({ ataques: nuevo.ataques, fame: nuevo.fame, barcos: nuevo.barcos, fechaDetectado: ahora });
    conflicto = true;
  }
  (Array.isArray(origen.alternativas) ? origen.alternativas : []).forEach(function (a) {
    if (!_jsonGrupalAlternativaIgual_(destino, a) && !alts.some(function (x) { return igualA(x, a); })) alts.push(a);
  });
  if (alts.length) { destino.alternativas = alts; destino.revision = 'pendiente'; }
  return conflicto;
}

/**
 * _jsonGrupalReenumerarDoc_(doc, delta, ahora) [→ Contexto_Base_Web.md §PF322]
 * Función pura (§PF322, 1-nov-2026). Reenumeración de temporadas aplicada a un JSON grupal por clan (se modifica `doc`):
 *   1. Suma `delta` a la temporadaInterna de cada semana. temporadaRoyaleAPI y temporadaSupercell no cambian (la reenumeración mueve la Ref y el offset en sentido contrario).
 *   2. Si dos semanas quedan con la misma temporadaInterna y semana, las junta: los jugadores iguales no se duplican y un valor distinto se conserva como alternativa (nunca se pierde un dato).
 *   3. Quita las alternativas que ya coinciden con el valor guardado (el conflicto quedó resuelto) y, si no queda ninguna, también la marca `revision: 'pendiente'`.
 * Devuelve { semanas, fusionadas, conflictos: [...como _jsonGrupalAplicarItems_...], alternativasQuitadas, revisionesCerradas }. No marca el documento con la corrida: eso lo hace quien lo guarda.
 */
function _jsonGrupalReenumerarDoc_(doc, delta, ahora) {
  var res = { semanas: 0, fusionadas: 0, conflictos: [], alternativasQuitadas: 0, revisionesCerradas: 0 };
  if (!doc || !Array.isArray(doc.semanas)) return res;
  var nulo = function (v) { return v === null || v === undefined || v === ''; };
  var d = Number(delta);
  if (!isFinite(d)) return res;
  doc.semanas.forEach(function (w) {
    if (nulo(w.temporadaInterna) || !isFinite(Number(w.temporadaInterna))) return;
    w.temporadaInterna = Number(w.temporadaInterna) + d;
    res.semanas++;
  });
  return _jsonGrupalJuntarSemanas_(doc, res, ahora);
}

/**
 * _jsonGrupalJuntarSemanas_(doc, res, ahora) [→ Contexto_Base_Web.md §PF323]
 * Función pura. Segunda y tercera parte de la reenumeración de un JSON grupal, separadas el 1-nov-2026 para que las use también _jsonGrupalAlinearDoc_():
 * junta las semanas que quedaron con la misma temporadaInterna y semana (el valor distinto se conserva como alternativa), quita las alternativas que ya coinciden con el valor guardado y ordena.
 * Se modifica `doc` y se completa `res` (fusionadas, conflictos, alternativasQuitadas, revisionesCerradas); lo devuelve.
 */
function _jsonGrupalJuntarSemanas_(doc, res, ahora) {
  var nulo = function (v) { return v === null || v === undefined || v === ''; };
  var porClave = {}, quedan = [];
  doc.semanas.forEach(function (w) {
    var t = Number(w.temporadaInterna), s = Number(w.semana);
    if (nulo(w.temporadaInterna) || !isFinite(t) || !isFinite(s)) { quedan.push(w); return; }
    var base = porClave[t + '|' + s];
    if (!base) { porClave[t + '|' + s] = w; quedan.push(w); return; }
    res.fusionadas++;
    base.jugadores = base.jugadores || [];
    if (nulo(base.temporadaRoyaleAPI) && !nulo(w.temporadaRoyaleAPI)) base.temporadaRoyaleAPI = w.temporadaRoyaleAPI;
    if (nulo(base.temporadaSupercell) && !nulo(w.temporadaSupercell)) base.temporadaSupercell = w.temporadaSupercell;
    (w.jugadores || []).forEach(function (j) {
      var dest = null;
      for (var k = 0; k < base.jugadores.length; k++) { if (String(base.jugadores[k].tag).toUpperCase() === String(j.tag).toUpperCase()) { dest = base.jugadores[k]; break; } }
      if (!dest) { base.jugadores.push(j); return; }
      var guardado = { A: dest.ataques, F: dest.fame, B: dest.barcos };
      if (_jsonGrupalFusionarJugador_(dest, j, ahora)) {
        res.conflictos.push({ clan: doc.clan, tag: dest.tag, nombre: dest.nombre || j.nombre || '', temporada: t, semana: s,
          guardado: guardado, nuevo: { A: j.ataques, F: j.fame, B: j.barcos } });
      }
    });
  });
  doc.semanas = quedan;
  doc.semanas.forEach(function (w) {
    (w.jugadores || []).forEach(function (j) {
      if (!Array.isArray(j.alternativas)) return;
      var antes = j.alternativas.length;
      j.alternativas = j.alternativas.filter(function (a) { return !_jsonGrupalAlternativaIgual_(j, a); });
      res.alternativasQuitadas += antes - j.alternativas.length;
      if (!j.alternativas.length) {
        delete j.alternativas;
        if (j.revision === 'pendiente') { delete j.revision; res.revisionesCerradas++; }
      }
    });
  });
  _jsonGrupalOrdenar_(doc);
  return res;
}

/**
 * _jsonGrupalAlinearDoc_(doc, offset, ahora) [→ Contexto_Base_Web.md §PF323]
 * Función pura (§PF323, 1-nov-2026). Deja un JSON grupal por clan en la numeración vigente SIN depender de cuántos meses se corrió la referencia: a cada semana con temporadaRoyaleAPI le pone
 * temporadaInterna = temporadaRoyaleAPI - offset (el mismo mapeo de _cgwTemporadaRoyaleApiTexto_(); la temporada de RoyaleAPI no cambia con la reenumeración). Es idempotente: con los datos ya al día no cambia nada.
 * Una semana sin temporadaRoyaleAPI no se toca (se cuenta en `sinReferencia`). Si dos semanas quedan iguales, las junta como _jsonGrupalReenumerarDoc_() (un valor distinto se conserva como alternativa).
 * Devuelve { semanas (cambiadas), sinReferencia, fusionadas, conflictos, alternativasQuitadas, revisionesCerradas }. No marca el documento con la corrida: eso lo hace quien lo guarda.
 */
function _jsonGrupalAlinearDoc_(doc, offset, ahora) {
  var res = { semanas: 0, sinReferencia: 0, fusionadas: 0, conflictos: [], alternativasQuitadas: 0, revisionesCerradas: 0 };
  if (!doc || !Array.isArray(doc.semanas)) return res;
  var nulo = function (v) { return v === null || v === undefined || v === ''; };
  var off = Number(offset);
  if (!isFinite(off)) return res;
  var alDia = [], movidas = [];
  doc.semanas.forEach(function (w) {
    if (nulo(w.temporadaRoyaleAPI) || !isFinite(Number(w.temporadaRoyaleAPI))) { res.sinReferencia++; alDia.push(w); return; }
    var objetivo = Number(w.temporadaRoyaleAPI) - off;
    if (nulo(w.temporadaInterna) || Number(w.temporadaInterna) !== objetivo) { w.temporadaInterna = objetivo; res.semanas++; movidas.push(w); }
    else alDia.push(w);
  });
  doc.semanas = alDia.concat(movidas); // al juntar gana la semana que YA estaba en la numeración vigente; la otra aporta lo que falta o queda como alternativa
  var antes = JSON.stringify(doc);
  var r = _jsonGrupalJuntarSemanas_(doc, res, ahora);
  r.cambioDoc = res.semanas > 0 || r.fusionadas > 0 || r.alternativasQuitadas > 0 || JSON.stringify(doc) !== antes;
  return r;
}

/**
 * _historialGuerraGrupalAlinearFilas_(filas, offset) [→ Contexto_Base_Web.md §PF323]
 * Función pura (§PF323, 1-nov-2026). Lo mismo que _jsonGrupalAlinearDoc_() para las filas de HistorialGuerra_Grupal.csv (fila 0 = encabezados): a cada fila con TemporadaRoyaleAPI le pone
 * TemporadaInterna = TemporadaRoyaleAPI - offset; una fila sin TemporadaRoyaleAPI no se toca (`sinReferencia`). Idempotente.
 * Si dos filas quedan con la misma clave (tag, temporada interna, semana y clan), las junta en una: gana la que YA estaba en la numeración vigente y, si ambas estaban o ninguna, la de fuente de mayor prioridad;
 * a la ganadora se le rellenan los datos vacíos con los de la otra. Un valor distinto no se pierde en silencio: va en `conflictos` para mandarlo a Revision_Guerra.csv.
 * Devuelve { filas (tabla nueva, la original no se modifica), cambiadas, sinReferencia, fusionadas, conflictos: [{ tag, nombre, clan, temporada, semana, guardado: {A,F,B}, descartado: {A,F,B} }] }.
 */
function _historialGuerraGrupalAlinearFilas_(filas, offset) {
  var res = { filas: filas, cambiadas: 0, sinReferencia: 0, fusionadas: 0, conflictos: [] };
  var off = Number(offset);
  if (!filas || filas.length < 2 || !isFinite(off)) return res;
  var ncol = HISTORIAL_GUERRA_GRUPAL_ENCABEZADOS.length;
  var vacio = function (v) { return v === null || v === undefined || String(v).trim() === ''; };
  var salida = [filas[0]], porClave = {};
  for (var i = 1; i < filas.length; i++) {
    var f = filas[i].slice();
    while (f.length < ncol) f.push('');
    var yaEstaba = true;
    if (vacio(f[3]) || !isFinite(Number(f[3]))) {
      res.sinReferencia++;
    } else {
      var objetivo = Number(f[3]) - off;
      if (String(f[2]).trim() !== String(objetivo)) { f[2] = objetivo; res.cambiadas++; yaEstaba = false; }
    }
    if (vacio(f[0])) { salida.push(f); continue; }
    var clave = [String(f[0]).trim().toUpperCase(), String(f[2]).trim(), String(f[4]).trim(), _claveClanHistorialGuerra(f[5])].join('|');
    var previo = porClave[clave];
    if (!previo) { porClave[clave] = { fila: f, yaEstaba: yaEstaba, pos: salida.length }; salida.push(f); continue; }
    res.fusionadas++;
    var cand = { fila: f, yaEstaba: yaEstaba };
    var candGana = (cand.yaEstaba && !previo.yaEstaba) ||
      (cand.yaEstaba === previo.yaEstaba && _prioridadFuenteHistorialGuerra(f[9]) > _prioridadFuenteHistorialGuerra(previo.fila[9]));
    var gana = candGana ? cand : previo, pierde = candGana ? previo : cand;
    var fg = gana.fila.slice(), fp = pierde.fila;
    [[6, 'A'], [7, 'F'], [8, 'B']].forEach(function (c) {
      if (vacio(fp[c[0]])) return;
      if (vacio(fg[c[0]])) fg[c[0]] = fp[c[0]];
    });
    if (vacio(fg[1]) && !vacio(fp[1])) fg[1] = fp[1];
    if (vacio(fg[12]) && !vacio(fp[12])) fg[12] = fp[12];
    if (String(fp[11]) === 'true') fg[11] = 'true';
    var distintos = [6, 7, 8].some(function (c) { return !vacio(fp[c]) && !vacio(gana.fila[c]) && Number(fp[c]) !== Number(gana.fila[c]); });
    if (distintos) {
      res.conflictos.push({ tag: String(fg[0]).trim(), nombre: String(fg[1] || ''), clan: String(fg[5] || ''), temporada: fg[2], semana: fg[4],
        guardado: { A: gana.fila[6], F: gana.fila[7], B: gana.fila[8] }, descartado: { A: fp[6], F: fp[7], B: fp[8] } });
    }
    salida[previo.pos] = fg;
    porClave[clave] = { fila: fg, yaEstaba: gana.yaEstaba, pos: previo.pos };
  }
  res.filas = salida;
  return res;
}

/** Texto de la entrada de Revision_Guerra.csv para un conflicto al alinear HistorialGuerra_Grupal.csv (§PF323). */
function _entradaRevisionCsvGrupal_(c, ahora) {
  var t = function (v) { return (v === null || v === undefined || String(v).trim() === '') ? 'sin dato' : v; };
  return {
    temporada: c.temporada, semana: c.semana, tag: c.tag, nombre: c.nombre,
    tipo: CGW_CONTRADICCION_TIPO,
    motivo: 'CSV grupal (' + c.clan + '): al alinear la numeración, dos filas de la misma semana traían valores distintos',
    detalle: 'Se conservó: ataques ' + t(c.guardado.A) + ', fame ' + t(c.guardado.F) + ', barcos ' + t(c.guardado.B) + '. Se descartó (' + ahora + '): ataques ' + t(c.descartado.A) + ', fame ' + t(c.descartado.F) + ', barcos ' + t(c.descartado.B) +
      '. Decidir cuál vale.',
    estado: 'Pendiente'
  };
}

/** Texto de la entrada de Revision_Guerra.csv para un conflicto del JSON grupal. */
function _entradaRevisionJsonGrupal_(c, ahora) {
  var t = function (v) { return v === null || v === undefined ? 'sin dato' : v; };
  return {
    temporada: c.temporada, semana: c.semana, tag: c.tag, nombre: c.nombre,
    tipo: CGW_CONTRADICCION_TIPO,
    motivo: 'JSON grupal de RoyaleAPI (' + c.clan + '): el Log trae un valor distinto del guardado para la misma semana cerrada',
    detalle: 'Guardado: ataques ' + t(c.guardado.A) + ', fame ' + t(c.guardado.F) + ', barcos ' + t(c.guardado.B) + '. Nuevo (' + ahora + '): ataques ' + t(c.nuevo.A) + ', fame ' + t(c.nuevo.F) + ', barcos ' + t(c.nuevo.B) +
      '. Se conservan ambos en «' + _nombreArchivoJsonGrupal_(c.clan) + '» (campo alternativas); decidir cuál vale.',
    estado: 'Pendiente'
  };
}

/**
 * _actualizarJsonGrupalClanesLote(items) [→ Contexto_Base_Web.md §PF321]
 * items: [{ tag, nombre, registro }] (los mismos del CSV grupal). Toma el lock una vez, lee el JSON de cada clan que aparece, aplica todo en memoria y escribe solo los que cambiaron.
 * Los conflictos van a Revision_Guerra.csv (Estado «Pendiente») cuando ya se soltó el lock. Devuelve { guardados, cambios, conflictos, ignorados, sinLock }.
 */
function _actualizarJsonGrupalClanesLote(items) {
  var res = { guardados: 0, cambios: 0, conflictos: 0, ignorados: 0, sinLock: false };
  var utiles = (items || []).filter(function (it) { return it && it.registro && String(it.registro.fuente || '').toLowerCase() === 'log' && it.registro.cerrada !== false; });
  if (!utiles.length) return res;
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    Logger.log('[HistorialGuerra][JSON grupal] No se pudo obtener el lock: se omiten ' + utiles.length + ' registro(s) del JSON grupal.');
    res.sinLock = true;
    return res;
  }
  var conflictos = [], ahora = Utilities.formatDate(new Date(), 'America/Lima', 'yyyy-MM-dd HH:mm:ss');
  try {
    var folder = _getHistorialGuerraGrupalJsonFolder_();
    var docs = {}, archivos = {}, clanes = {};
    utiles.forEach(function (it) { var c = _nombreClanJsonGrupal_(it.registro.clan); if (c) clanes[_claveClanHistorialGuerra(c)] = c; });
    Object.keys(clanes).forEach(function (clave) {
      var files = folder.getFilesByName(_nombreArchivoJsonGrupal_(clanes[clave]));
      if (!files.hasNext()) return;
      var f = files.next();
      try {
        var d = JSON.parse(f.getBlob().getDataAsString('UTF-8'));
        if (d && Array.isArray(d.semanas)) { docs[clave] = d; archivos[clave] = f; }
      } catch (eLeer) { Logger.log('[HistorialGuerra][JSON grupal] AVISO: no se pudo leer ' + f.getName() + ' (' + eLeer.message + '); no se toca.'); clanes[clave] = null; }
    });
    var aplicables = utiles.filter(function (it) { var c = _nombreClanJsonGrupal_(it.registro.clan); return c && clanes[_claveClanHistorialGuerra(c)]; });
    var r = _jsonGrupalAplicarItems_(docs, aplicables, _getTemporadaOffsetRoyaleApi(), ahora);
    res.cambios = r.cambios; res.ignorados = r.ignorados; conflictos = r.conflictos; res.conflictos = conflictos.length;
    Object.keys(r.tocados).forEach(function (clave) {
      var doc = _jsonGrupalOrdenar_(docs[clave]);
      doc.fechaUltimaActualizacion = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy');
      var contenido = JSON.stringify(doc, null, 2);
      if (archivos[clave]) _setContentConConteo_(archivos[clave], contenido);
      else _createFileConConteo_(folder, _nombreArchivoJsonGrupal_(doc.clan), contenido, MimeType.PLAIN_TEXT);
      res.guardados++;
    });
  } catch (e) {
    Logger.log('[HistorialGuerra][JSON grupal] Error en el lote: ' + e.message);
  } finally {
    lock.releaseLock();
  }
  if (conflictos.length) {
    try { _registrarRevisionGuerra_(conflictos.map(function (c) { return _entradaRevisionJsonGrupal_(c, ahora); })); }
    catch (eRev) { Logger.log('[HistorialGuerra][JSON grupal] AVISO: no se pudo escribir Revision_Guerra.csv (' + (eRev.message || eRev) + '); los conflictos quedan en el JSON (revision: pendiente).'); }
  }
  return res;
}

var HG_JSON_GRUPAL_ESTADO_PROP = 'HG_JSON_GRUPAL_ESTADO';           // propiedad del script con el avance del llenado (JSON)
var HG_JSON_GRUPAL_PRESUPUESTO_MS = 3 * 60 * 1000 + 30 * 1000;      // tanda: pasado este tiempo no se empieza otro lote (la plataforma corta a los 6 min)
var HG_JSON_GRUPAL_LOTE = 60;                                       // JSON individuales por cada escritura de los JSON grupales

/** Tag -> nombre, leído de HistorialGuerra_Grupal.csv (los JSON individuales no traen el nombre). {} si no se puede leer. */
function _hgNombresPorTag_() {
  var mapa = {};
  try {
    var texto = _loadHistorialGuerraGrupalCSV();
    var filas = texto ? _parseCSV(texto) : [];
    for (var i = 1; i < filas.length; i++) {
      var tag = String(filas[i][0] || '').trim().toUpperCase(), nombre = String(filas[i][1] || '').trim();
      if (tag && nombre) mapa[tag] = nombre;
    }
  } catch (e) { Logger.log('[JSON grupal] AVISO: no se pudieron leer los nombres de HistorialGuerra_Grupal.csv (' + (e.message || e) + '); los jugadores quedan sin nombre hasta la próxima consulta.'); }
  return mapa;
}

/** Función pura. Los registros del Log cerrado de un JSON individual, como items del JSON grupal: [{ tag, nombre, registro }]. */
function _hgItemsLogDeIndividual_(datos, tagDeNombre, nombres) {
  var tag = String((datos && datos.tag) || tagDeNombre || '').trim().toUpperCase();
  if (!tag) return [];
  return ((datos && datos.registros) || []).filter(function (r) { return r && String(r.fuente || '').toLowerCase() === 'log' && r.cerrada === true; })
    .map(function (r) { return { tag: tag, nombre: (nombres && nombres[tag]) || '', registro: r }; });
}

function _hgReconstruirJsonGrupal_(esContinuacion) {
  var nombreFn = 'reconstruirJsonGrupalDesdeIndividuales', handler = '_continuarReconstruirJsonGrupalDesdeIndividuales';
  var props = PropertiesService.getScriptProperties();
  if (esContinuacion) {
    if (_reenumeracionEnCurso_() || (CFG.VENTANA_GUERRA_BLOQUEAR_OTROS && _estadoVentanaGuerra_().protegida)) {
      _borrarTriggersDeContinuacion(handler);
      _liberarLockEjecucion();
      Logger.log('[JSON grupal] Pausado: hay una reenumeración en curso o la ventana de guerra protegida está activa. El avance queda guardado: vuelve a correr ' + nombreFn + '() después.');
      return;
    }
  } else if (!_adquirirLockEjecucion(nombreFn)) {
    return;
  }
  var t0 = Date.now(), st = null;
  try { st = JSON.parse(props.getProperty(HG_JSON_GRUPAL_ESTADO_PROP) || 'null'); } catch (eSt) { st = null; }
  var guardar = function () { props.setProperty(HG_JSON_GRUPAL_ESTADO_PROP, JSON.stringify(st)); };
  try {
    if (!st) { st = { ultimo: '', tandas: 0, leidos: 0, conError: 0, cambios: 0, conflictos: 0 }; Logger.log('=== JSON grupal por clan desde los JSON individuales: INICIO ==='); }
    else Logger.log('=== JSON grupal por clan desde los JSON individuales: CONTINÚA (tanda ' + (st.tandas + 1) + ') ===');
    st.tandas++;

    var reTag = /-\s(#[0-9A-Z]+)\.json$/i, lista = [], it = DriveApp.getFolderById(DRIVE_FOLDER_ID_ROYALEAPI_INDIVIDUAL).getFiles();
    while (it.hasNext()) { var f = it.next(), m = reTag.exec(f.getName()); if (m) lista.push({ file: f, nombre: f.getName(), tag: m[1].toUpperCase() }); }
    lista.sort(function (a, b) { return a.nombre < b.nombre ? -1 : (a.nombre > b.nombre ? 1 : 0); });
    var pendientes = lista.filter(function (x) { return x.nombre > st.ultimo; });
    var previas = lista.length - pendientes.length, nombres = _hgNombresPorTag_();
    var items = [], enLote = 0, ultimoLote = st.ultimo, estaTanda = 0, incompleto = false, sinLock = false;

    var cerrarLote = function () {
      if (!enLote) return true;
      var r = _actualizarJsonGrupalClanesLote(items);
      if (r.sinLock) { sinLock = true; return false; }
      st.cambios += r.cambios; st.conflictos += r.conflictos; st.ultimo = ultimoLote; st.leidos += enLote; estaTanda += enLote;
      guardar();
      items = []; enLote = 0;
      return true;
    };

    for (var i = 0; i < pendientes.length; i++) {
      if (Date.now() - t0 > HG_JSON_GRUPAL_PRESUPUESTO_MS) { incompleto = true; break; }
      var p = pendientes[i];
      try { items = items.concat(_hgItemsLogDeIndividual_(JSON.parse(p.file.getBlob().getDataAsString('UTF-8')), p.tag, nombres)); }
      catch (eLeer) { st.conError++; Logger.log('[JSON grupal] AVISO: no se pudo leer «' + p.nombre + '» (' + (eLeer.message || eLeer) + '); se sigue con el siguiente.'); }
      ultimoLote = p.nombre; enLote++;
      if (enLote >= HG_JSON_GRUPAL_LOTE && !cerrarLote()) { incompleto = true; break; }
    }
    if (!incompleto && !cerrarLote()) incompleto = true;

    if (incompleto) {
      guardar();
      _refrescarLockEjecucion(nombreFn);
      _programarContinuacion(handler);
      _logProgresoPaso_('JSON grupal', 'JSON individuales leídos', previas, estaTanda, lista.length, 'archivos');
      Logger.log('[JSON grupal] ' + (sinLock ? 'No se pudo tomar el lock para escribir los JSON grupales; se reintenta en la tanda siguiente.' : 'Presupuesto de la tanda agotado.') + ' Avance guardado; continuación programada en 10 s.');
      return;
    }
    Logger.log('[JSON grupal] FIN (' + st.tandas + ' tanda(s)). JSON individuales leídos: ' + st.leidos + (st.conError ? ' (' + st.conError + ' con error de lectura)' : '') +
      '. Registros nuevos o cambiados en los JSON grupales: ' + st.cambios + '. Valores distintos enviados a revisión manual (Revision_Guerra.csv): ' + st.conflictos + '.');
    props.deleteProperty(HG_JSON_GRUPAL_ESTADO_PROP);
    _borrarTriggersDeContinuacion(handler);
    _liberarLockEjecucion();
  } catch (e) {
    if (st) guardar();
    _borrarTriggersDeContinuacion(handler);
    _liberarLockEjecucion();
    Logger.log('[JSON grupal] ERROR: ' + e.message + '. El avance quedó guardado hasta el último lote escrito; vuelve a correr ' + nombreFn + '() para seguir.');
    throw e;
  }
}

// ----- Revision_Guerra.csv: decisión «Conservar» o «Reemplazar» sobre los valores distintos del historial grupal (§PF325) -----

/** Función pura (§PF325). El Estado de una fila de Revision_Guerra.csv sin mayúsculas ni tildes ('conservar', 'reemplazar', 'pendiente'...; '' si está vacío). */
function _rgEstadoNormalizado_(texto) {
  var s = String(texto === null || texto === undefined ? '' : texto).trim().toLowerCase();
  if (s.normalize) s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return s;
}

function _rgNulo_(v) { return v === null || v === undefined || v === ''; }

/** Función pura. Los tres valores de una semana como { A, F, B }: número o null si no hay dato. */
function _rgValores_(ataques, fame, barcos) {
  return { A: _rgNulo_(ataques) ? null : Number(ataques), F: _rgNulo_(fame) ? null : Number(fame), B: _rgNulo_(barcos) ? null : Number(barcos) };
}

/** Función pura. true si los tres valores son iguales (null contra null también). */
function _rgMismos_(x, y) { return x.A === y.A && x.F === y.F && x.B === y.B; }

/** Función pura. true si `actual` ya trae cada valor que `otro` tiene (un null de `otro` no cuenta). */
function _rgContiene_(actual, otro) {
  return ['A', 'F', 'B'].every(function (k) { return otro[k] === null || actual[k] === otro[k]; });
}

/** Función pura. Texto de los tres valores para el registro y las notas. */
function _rgTexto_(v) {
  var t = function (x) { return x === null || x === undefined ? 'sin dato' : x; };
  return 'ataques ' + t(v.A) + ', fame ' + t(v.F) + ', barcos ' + t(v.B);
}

/**
 * Función pura (§PF325). Lee el Motivo y el Detalle de una fila de Revision_Guerra.csv escritos por _entradaRevisionCsvGrupal_() o _entradaRevisionJsonGrupal_().
 * Devuelve { origen: 'csv'|'json', clan, guardado: {A,F,B}, otro: {A,F,B} } (`otro` es el valor descartado del CSV o el valor nuevo del JSON) o null si la fila es de otro tipo.
 */
function _rgParsearFilaGrupal_(motivo, detalle) {
  var m = String(motivo === null || motivo === undefined ? '' : motivo), d = String(detalle === null || detalle === undefined ? '' : detalle);
  var num = '(\\d+|sin dato)';
  var tres = 'ataques ' + num + ', fame ' + num + ', barcos ' + num;
  var origen, clan, rx;
  // [\s\S] y no «.»: el clan del CSV grupal suele traer pegados un salto de línea y una fecha (la mitad de las filas reales), y el motivo los hereda.
  var mc = /^CSV grupal \(([\s\S]+?)\): /.exec(m);
  var mj = /^JSON grupal de RoyaleAPI \(([\s\S]+?)\): /.exec(m);
  if (mc) { origen = 'csv'; clan = mc[1]; rx = new RegExp('^Se conservó: ' + tres + '\\. Se descartó \\([^)]*\\): ' + tres + '\\.'); }
  else if (mj) { origen = 'json'; clan = mj[1]; rx = new RegExp('^Guardado: ' + tres + '\\. Nuevo \\([^)]*\\): ' + tres + '\\.'); }
  else return null;
  var r = rx.exec(d);
  if (!r) return null;
  var v = function (t) { return t === 'sin dato' ? null : Number(t); };
  return { origen: origen, clan: clan, guardado: { A: v(r[1]), F: v(r[2]), B: v(r[3]) }, otro: { A: v(r[4]), F: v(r[5]), B: v(r[6]) } };
}

/**
 * Función pura (§PF325). Aplica la decisión ('conservar' o 'reemplazar') sobre las filas del CSV grupal (se modifica `filas`). `p` es el resultado de _rgParsearFilaGrupal_().
 * Devuelve { estado: 'aplicada' | 'yaAplicada' | 'obsoleta' | 'sinFila', cambio: bool, quedo: {A,F,B} }. 'obsoleta' = el valor guardado ya no es el de la fila de revisión: no se toca nada.
 */
function _rgAplicarEnFilasCsv_(filas, tag, temporada, semana, p, decision) {
  var tagU = String(tag).trim().toUpperCase(), claveClan = _claveClanHistorialGuerra(p.clan), idx = -1;
  for (var i = 1; i < filas.length; i++) {
    var f = filas[i];
    if (String(f[0]).trim().toUpperCase() === tagU && Number(f[2]) === Number(temporada) && Number(f[4]) === Number(semana) && _claveClanHistorialGuerra(f[5]) === claveClan) { idx = i; break; }
  }
  if (idx < 0) return { estado: 'sinFila', cambio: false };
  var fila = filas[idx], actual = _rgValores_(fila[6], fila[7], fila[8]);
  if (decision === 'conservar') {
    return _rgMismos_(actual, p.guardado) ? { estado: 'aplicada', cambio: false, quedo: actual } : { estado: 'obsoleta', cambio: false };
  }
  if (_rgMismos_(actual, p.guardado)) {
    var nuevo = { A: p.otro.A === null ? actual.A : p.otro.A, F: p.otro.F === null ? actual.F : p.otro.F, B: p.otro.B === null ? actual.B : p.otro.B };
    fila[6] = nuevo.A === null ? '' : nuevo.A; fila[7] = nuevo.F === null ? '' : nuevo.F; fila[8] = nuevo.B === null ? '' : nuevo.B;
    return { estado: 'aplicada', cambio: true, quedo: nuevo };
  }
  if (_rgContiene_(actual, p.otro)) return { estado: 'yaAplicada', cambio: false, quedo: actual };
  return { estado: 'obsoleta', cambio: false };
}

/**
 * Función pura (§PF325). Igual que _rgAplicarEnFilasCsv_(), sobre el documento del JSON grupal de un clan (se modifica `doc`). Quita la alternativa que decidió la fila y, si ya no queda
 * ninguna, también la marca `revision: 'pendiente'`. «Reemplazar» pasa los valores de la alternativa al jugador; «Conservar» solo la quita.
 */
function _rgAplicarEnDocJson_(doc, tag, temporada, semana, p, decision) {
  var tagU = String(tag).trim().toUpperCase(), sem = null, jug = null, i;
  for (i = 0; i < doc.semanas.length; i++) { if (Number(doc.semanas[i].temporadaInterna) === Number(temporada) && Number(doc.semanas[i].semana) === Number(semana)) { sem = doc.semanas[i]; break; } }
  if (!sem) return { estado: 'sinFila', cambio: false };
  for (i = 0; i < sem.jugadores.length; i++) { if (String(sem.jugadores[i].tag).trim().toUpperCase() === tagU) { jug = sem.jugadores[i]; break; } }
  if (!jug) return { estado: 'sinFila', cambio: false };
  var actual = _rgValores_(jug.ataques, jug.fame, jug.barcos);
  var alts = Array.isArray(jug.alternativas) ? jug.alternativas : [], pos = -1;
  for (i = 0; i < alts.length; i++) { if (_rgMismos_(_rgValores_(alts[i].ataques, alts[i].fame, alts[i].barcos), p.otro)) { pos = i; break; } }
  if (decision === 'conservar') {
    if (!_rgMismos_(actual, p.guardado)) return { estado: 'obsoleta', cambio: false };
    if (pos < 0) return { estado: 'yaAplicada', cambio: false, quedo: actual };
    alts.splice(pos, 1);
  } else {
    if (pos < 0) return _rgContiene_(actual, p.otro) ? { estado: 'yaAplicada', cambio: false, quedo: actual } : { estado: 'obsoleta', cambio: false };
    if (!_rgMismos_(actual, p.guardado) && !_rgContiene_(actual, p.otro)) return { estado: 'obsoleta', cambio: false };
    if (p.otro.A !== null) jug.ataques = p.otro.A;
    if (p.otro.F !== null) jug.fame = p.otro.F;
    if (p.otro.B !== null) jug.barcos = p.otro.B;
    alts.splice(pos, 1);
    alts = alts.filter(function (a) { return !_jsonGrupalAlternativaIgual_(jug, a); });
  }
  if (alts.length) { jug.alternativas = alts; }
  else { delete jug.alternativas; if (jug.revision === 'pendiente') delete jug.revision; }
  return { estado: 'aplicada', cambio: true, quedo: _rgValores_(jug.ataques, jug.fame, jug.barcos) };
}

/** Lee el JSON grupal de un clan. Devuelve { doc, archivo, tocado, fallo } o null si no existe o no se puede leer. */
function _rgLeerJsonClan_(clan) {
  try {
    var files = _getHistorialGuerraGrupalJsonFolder_().getFilesByName(_nombreArchivoJsonGrupal_(clan));
    if (!files.hasNext()) return null;
    var f = files.next();
    var d = JSON.parse(f.getBlob().getDataAsString('UTF-8'));
    return (d && Array.isArray(d.semanas)) ? { doc: d, archivo: f, tocado: false, fallo: false } : null;
  } catch (e) {
    Logger.log('[HistorialGuerra][Revisión] AVISO: no se pudo leer el JSON grupal de «' + clan + '» (' + (e.message || e) + ').');
    return null;
  }
}

/** Clave de una fila de Revision_Guerra.csv: la misma que usa _registrarRevisionGuerra_() (temporada, semana, tag, tipo y motivo). */
function _rgClaveFila_(f) { return [f[2], f[3], f[4], f[6], f[7]].map(String).join('|'); }

/** Hace el trabajo de aplicarDecisionesRevisionGuerra() (el lock ya está tomado). */
function _rgAplicarDecisiones_(etq) {
  var ahora = Utilities.formatDate(new Date(), 'America/Lima', 'yyyy-MM-dd HH:mm:ss');
  var ncol = REVISION_GUERRA_ENCABEZADO.length;
  var leerRevision = function () {
    var texto = _loadCSVFromDrive(REVISION_GUERRA_CSV), p = texto ? _parseCSV(texto) : [], filas = [];
    for (var i = 1; i < (p ? p.length : 0); i++) { var f = p[i].slice(0, ncol); while (f.length < ncol) f.push(''); filas.push(f); }
    return filas;
  };
  var revision = leerRevision();
  if (!revision.length) { Logger.log(etq + ' Revision_Guerra.csv no tiene filas: no hay nada que aplicar.'); return; }

  var decisiones = [], sinReconocer = 0;
  revision.forEach(function (f) {
    var est = _rgEstadoNormalizado_(f[9]);
    if (est === 'conservar' || est === 'reemplazar') decisiones.push({ fila: f, decision: est });
    else if (est !== '' && est !== 'pendiente' && est !== 'resuelto') {
      sinReconocer++;
      if (sinReconocer <= 20) Logger.log(etq + ' Fila N° ' + f[0] + ': el Estado «' + f[9] + '» no es «Conservar» ni «Reemplazar»; no se toca.');
    }
  });
  if (!decisiones.length) { Logger.log(etq + ' Ninguna fila de Revision_Guerra.csv tiene el Estado «Conservar» o «Reemplazar»: no hay nada que aplicar.'); return; }

  var csvTexto = null, filasCsv = null, csvCambio = false, docs = {};
  decisiones.forEach(function (d) {
    var f = d.fila, p = _rgParsearFilaGrupal_(f[7], f[8]);
    if (!p) { d.r = { estado: 'noSoportada' }; return; }
    d.p = p;
    if (p.origen === 'csv') {
      if (filasCsv === null) { csvTexto = _loadHistorialGuerraGrupalCSV(); filasCsv = csvTexto ? _parseCSV(csvTexto) : []; }
      d.r = _rgAplicarEnFilasCsv_(filasCsv, f[4], f[2], f[3], p, d.decision);
      if (d.r.cambio) csvCambio = true;
    } else {
      var clave = _claveClanHistorialGuerra(p.clan);
      if (docs[clave] === undefined) docs[clave] = _rgLeerJsonClan_(p.clan);
      d.ent = docs[clave];
      if (!d.ent) { d.r = { estado: 'sinFila' }; return; }
      d.r = _rgAplicarEnDocJson_(d.ent.doc, f[4], f[2], f[3], p, d.decision);
      if (d.r.cambio) d.ent.tocado = true;
    }
  });

  // 1) Primero se escribe el dato final...
  var falloCsv = false;
  if (csvCambio) {
    try { _saveHistorialGuerraGrupalCSV(_encodeCSV(filasCsv)); }
    catch (eCsv) { falloCsv = true; Logger.log(etq + ' ERROR escribiendo ' + HISTORIAL_GUERRA_GRUPAL_FILENAME + ': ' + (eCsv.message || eCsv) + '. Las filas del CSV grupal no se aplican.'); }
  }
  Object.keys(docs).forEach(function (clave) {
    var ent = docs[clave];
    if (!ent || !ent.tocado) return;
    try {
      var doc = _jsonGrupalOrdenar_(ent.doc);
      doc.fechaUltimaActualizacion = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy');
      _setContentConConteo_(ent.archivo, JSON.stringify(doc, null, 2));
    } catch (eJson) {
      ent.fallo = true;
      Logger.log(etq + ' ERROR escribiendo el JSON grupal de «' + _rgNombreArchivo_(ent) + '»: ' + (eJson.message || eJson) + '. Sus filas no se aplican.');
    }
  });

  // 2) ...y solo después se decide qué pasa con cada fila de Revision_Guerra.csv.
  var cuenta = { conservar: 0, reemplazar: 0, yaAplicadas: 0, devueltas: 0, noSoportadas: 0 };
  var nombreDecision = { conservar: 'Conservar', reemplazar: 'Reemplazar' };
  decisiones.forEach(function (d) {
    var f = d.fila, r = d.r, p = d.p;
    var etiqueta = 'T' + f[2] + ' semana ' + f[3] + ' ' + f[4] + (f[5] ? ' (' + f[5] + ')' : '');
    if (r.estado === 'noSoportada') {
      d.final = 'noSoportada'; cuenta.noSoportadas++;
      if (cuenta.noSoportadas <= 20) Logger.log(etq + ' Fila N° ' + f[0] + ' (' + etiqueta + '): «' + nombreDecision[d.decision] + '» solo se aplica a los valores distintos del historial grupal; esta fila es de otro tipo y no se toca.');
      return;
    }
    var escrituraFallo = (r.cambio && p.origen === 'csv' && falloCsv) || (r.cambio && p.origen === 'json' && d.ent && d.ent.fallo);
    if ((r.estado === 'aplicada' || r.estado === 'yaAplicada') && !escrituraFallo) {
      d.final = 'borrar';
      if (r.estado === 'yaAplicada') cuenta.yaAplicadas++; else cuenta[d.decision]++;
      var descartado = d.decision === 'conservar' ? p.otro : p.guardado;
      Logger.log(etq + ' ' + etiqueta + ' [' + (p.origen === 'csv' ? 'CSV grupal' : 'JSON grupal') + ' ' + _nombreClanJsonGrupal_(p.clan) + ']: ' + nombreDecision[d.decision] +
        (r.estado === 'yaAplicada' ? ' (ya estaba aplicado)' : '') + ' → quedó ' + _rgTexto_(r.quedo) + '; se borró ' + _rgTexto_(descartado) + '.');
      return;
    }
    if (escrituraFallo) { d.final = 'queda'; return; }
    d.final = 'devolver'; cuenta.devueltas++;
    d.nota = r.estado === 'sinFila'
      ? 'No se aplicó «' + nombreDecision[d.decision] + '» (' + ahora + '): no se encontró ese dato en el ' + (p.origen === 'csv' ? 'CSV grupal' : 'JSON grupal') + '. Revísalo y decide de nuevo.'
      : 'No se aplicó «' + nombreDecision[d.decision] + '» (' + ahora + '): el valor guardado cambió desde que se creó esta fila o ya no existe la alternativa. Decide de nuevo.';
    Logger.log(etq + ' ' + etiqueta + ': no se aplicó «' + nombreDecision[d.decision] + '»; ' + (r.estado === 'sinFila' ? 'no se encontró el dato' : 'el valor guardado cambió') + '. La fila vuelve a «Pendiente».');
  });

  // 3) Revision_Guerra.csv se vuelve a leer justo antes de escribirlo, por si otro proceso agregó filas mientras tanto.
  var cambios = {};
  decisiones.forEach(function (d) { if (d.final === 'borrar' || d.final === 'devolver') cambios[_rgClaveFila_(d.fila)] = d; });
  var fresca = leerRevision(), salida = [], borradas = 0, devueltas = 0;
  fresca.forEach(function (f) {
    var d = cambios[_rgClaveFila_(f)], est = _rgEstadoNormalizado_(f[9]);
    if (!d || (est !== 'conservar' && est !== 'reemplazar')) { salida.push(f); return; }
    if (d.final === 'borrar') { borradas++; return; }
    f[9] = CGW_CONTRADICCION_ESTADO;
    f[8] = String(f[8]) + ' [' + d.nota + ']';
    devueltas++;
    salida.push(f);
  });
  if (borradas || devueltas) {
    for (var n = 0; n < salida.length; n++) salida[n][0] = n + 1;
    try {
      _saveCSVToDrive(REVISION_GUERRA_CSV, _encodeCSV([REVISION_GUERRA_ENCABEZADO].concat(salida)));
    } catch (eRev) {
      Logger.log(etq + ' ERROR escribiendo Revision_Guerra.csv: ' + (eRev.message || eRev) + '. Los valores ya se aplicaron; vuelve a correr la función para limpiar las filas.');
      return;
    }
  }
  Logger.log(etq + ' Terminó: ' + cuenta.conservar + ' «Conservar» y ' + cuenta.reemplazar + ' «Reemplazar» aplicadas (' + cuenta.yaAplicadas + ' ya estaban aplicadas); ' +
    borradas + ' fila(s) borrada(s) de Revision_Guerra.csv; ' + devueltas + ' devuelta(s) a «Pendiente»; ' + cuenta.noSoportadas + ' de otro tipo sin tocar; ' + sinReconocer + ' con un Estado que no se reconoce.');
}

function _rgNombreArchivo_(ent) { return ent && ent.archivo ? ent.archivo.getName() : ''; }

// ----- Comparar y reemplazar registros (lo usan el individual y el grupal) -----

/**
 * _buscarIndiceHistorialGuerra(registros, nuevo) [→ Contexto_Base_Web.md §PF040]
 */
function _buscarIndiceHistorialGuerra(registros, nuevo) {
  var nuevoEsPerfil = String(nuevo.fuente || '').toLowerCase() === 'perfil';
  var clanNuevo = _claveClanHistorialGuerra(nuevo.clan);
  var nuevoEsExterno = nuevo.externa === true;
  var idxMismoClan = -1, idxPerfil = -1, idxMejorNoPerfil = -1, prioMejor = -2;

  for (var i = 0; i < registros.length; i++) {
    var r = registros[i];
    if (Number(r.temporadaInterna) !== Number(nuevo.temporadaInterna) ||
        Number(r.semana) !== Number(nuevo.semana)) continue;

    // §PF340: las filas de clan externo (externa: true) tienen su propia identidad por jugador, semana y clan: nunca se mezclan con las de clanes Terna
    // (ni como «el perfil de la semana» ni como «el registro de mejor fuente»), ni una pisa a la otra. [→ Contexto_Base_Web.md §PF340]
    if ((r.externa === true) !== nuevoEsExterno) continue;
    if (nuevoEsExterno) {
      if (_claveClanHistorialGuerra(r.clan) === clanNuevo) return i;
      continue;
    }

    var esPerfil = String(r.fuente || '').toLowerCase() === 'perfil';
    if (esPerfil) {
      if (idxPerfil < 0) idxPerfil = i;
      continue;
    }
    if (_claveClanHistorialGuerra(r.clan) === clanNuevo && idxMismoClan < 0) idxMismoClan = i;
    var prio = _prioridadFuenteHistorialGuerra(r.fuente);
    if (prio > prioMejor) { prioMejor = prio; idxMejorNoPerfil = i; }
  }

  if (nuevoEsPerfil) return (idxMejorNoPerfil >= 0) ? idxMejorNoPerfil : idxPerfil;
  return (idxMismoClan >= 0) ? idxMismoClan : idxPerfil;
}

// CLAVE POR CLAN (11-oct-2026, pedido usuaria): Log y Analytics son por clan, así que un jugador puede tener varios registros la misma semana (uno por clan) y deben coexistir. [→ Contexto_Base_Web.md §PF040]
/**
 * _claveClanHistorialGuerra(clan) [→ Contexto_Base_Web.md §PF040]
 */
function _claveClanHistorialGuerra(clan) {
  return String(clan || '').replace(/\s+\d{4}-\d{2}-\d{2}\s*$/, '').trim().toLowerCase();
}

// NÚCLEO DE FUSIÓN (Sección 3 + Hallazgo 2 del consolidado: sin precedente [→ Contexto_Base_Web.md §20B024]

/**
 * _debeReemplazarRegistroHistorialGuerra(existente, nuevo) [→ Contexto_Base_Web.md §20B025]
 */
function _debeReemplazarRegistroHistorialGuerra(existente, nuevo) {
  if (!existente) return { reemplazar: true, alerta: false };

  var prioExistente = _prioridadFuenteHistorialGuerra(existente.fuente);
  var prioNuevo      = _prioridadFuenteHistorialGuerra(nuevo.fuente);

  var existenteEsRiverraceAbierto = (existente.fuente === 'riverrace' && existente.cerrada === false);

  if (existenteEsRiverraceAbierto) {
    if (nuevo.fuente === 'riverrace') {
      return { reemplazar: true, alerta: false }; // actualización intradía normal
    }
    // Fuente cerrada reemplazando al provisional: valida que no haya bajado.
    var bajo = _algunValorBajoHistorialGuerra(existente, nuevo);
    return { reemplazar: true, alerta: bajo };
  }

  // existente es una fuente cerrada (log/analytics/perfil, cerrada:true).
  if (prioNuevo >= prioExistente) {
    return { reemplazar: true, alerta: false };
  }
  return { reemplazar: false, alerta: false }; // fuente de menor prioridad no pisa
}

/**
 * _prioridadFuenteHistorialGuerra(fuente) [→ Contexto_Base_Web.md §20B039]
 */
function _prioridadFuenteHistorialGuerra(fuente) {
  var p = FUENTE_PRIORIDAD_HISTORIAL_GUERRA[String(fuente || '').toLowerCase()];
  return (typeof p === 'number') ? p : -1;
}

/**
 * _algunValorBajoHistorialGuerra(existente, nuevo) [→ Contexto_Base_Web.md §20B018]
 */
function _algunValorBajoHistorialGuerra(existente, nuevo) {
  var campos = ['ataques', 'fame', 'barcos'];
  for (var i = 0; i < campos.length; i++) {
    var c = campos[i];
    var vExistente = existente[c];
    var vNuevo = nuevo[c];
    if (vExistente == null || vNuevo == null) continue; // campo no presente en alguno de los dos, se omite
    if (Number(vNuevo) < Number(vExistente)) return true;
  }
  return false;
}

/**
 * _registrarAlertaHistorialGuerra(tag, nombre, existente, nuevo) [→ Contexto_Base_Web.md §20B040]
 */
function _registrarAlertaHistorialGuerra(tag, nombre, existente, nuevo) {
  try {
    var ss = _getSs();
    var sh = ss.getSheetByName(CFG.SHEETS.ALERTAS_HISTORIAL_GUERRA);
    if (!sh) { _setupAlertasHistorialGuerra(ss); sh = ss.getSheetByName(CFG.SHEETS.ALERTAS_HISTORIAL_GUERRA); }

    var filas = sh.getLastRow() > 1
      ? sh.getRange(2, 1, sh.getLastRow() - 1, AHG_TOTAL_COLS).getValues() : [];
    var tagStr = String(tag || '').trim();
    for (var i = 0; i < filas.length; i++) {
      if (filas[i][AHG.TAG - 1] === tagStr &&
          Number(filas[i][AHG.TEMPORADA_INTERNA - 1]) === Number(nuevo.temporadaInterna) &&
          Number(filas[i][AHG.SEMANA - 1]) === Number(nuevo.semana) &&
          _claveClanHistorialGuerra(filas[i][AHG.CLAN - 1]) === _claveClanHistorialGuerra(nuevo.clan) &&
          filas[i][AHG.ESTADO - 1] === 'Pendiente') {
        return; // ya hay una alerta pendiente idéntica, no duplicar
      }
    }

    var fila = [];
    fila[AHG.TAG - 1] = tagStr;
    fila[AHG.NOMBRE - 1] = nombre || '';
    fila[AHG.TEMPORADA_INTERNA - 1] = nuevo.temporadaInterna;
    fila[AHG.TEMPORADA_ROYALEAPI - 1] = (nuevo.temporadaRoyaleAPI == null ? '' : nuevo.temporadaRoyaleAPI);
    fila[AHG.SEMANA - 1] = nuevo.semana;
    fila[AHG.CLAN - 1] = nuevo.clan || '';
    fila[AHG.FUENTE_NUEVA - 1] = nuevo.fuente;
    fila[AHG.ATAQUES_RIVERRACE - 1] = (existente.ataques == null ? '' : existente.ataques);
    fila[AHG.ATAQUES_NUEVO - 1] = (nuevo.ataques == null ? '' : nuevo.ataques);
    fila[AHG.FAME_RIVERRACE - 1] = (existente.fame == null ? '' : existente.fame);
    fila[AHG.FAME_NUEVO - 1] = (nuevo.fame == null ? '' : nuevo.fame);
    fila[AHG.BARCOS_RIVERRACE - 1] = (existente.barcos == null ? '' : existente.barcos);
    fila[AHG.BARCOS_NUEVO - 1] = (nuevo.barcos == null ? '' : nuevo.barcos);
    fila[AHG.FECHA_DETECTADO - 1] = new Date();
    fila[AHG.ESTADO - 1] = 'Pendiente';
    fila[AHG.VALOR_CORRECTO_ATAQUES - 1] = '';
    fila[AHG.VALOR_CORRECTO_FAME - 1] = '';
    fila[AHG.VALOR_CORRECTO_BARCOS - 1] = '';
    fila[AHG.NOTAS - 1] = '';

    sh.appendRow(fila);
    sh.getRange(sh.getLastRow(), AHG.ESTADO).setDataValidation(
      SpreadsheetApp.newDataValidation().requireValueInList(['Pendiente', 'Resuelto'], true).setAllowInvalid(false).build()
    );
    // FIX (23-ago-2026, pedido del usuario): mismo estilo que T_Lista/ [→ Contexto_Base_Web.md §20B041]
    applyBorderCenter(sh.getRange(sh.getLastRow(), 1, 1, AHG_TOTAL_COLS));
  } catch (e) {
    Logger.log('[HistorialGuerra][Alertas] Error registrando alerta de ' + tag + ': ' + e.message);
  }
}

// ----- Web: historial por jugador (lectura) -----

/**
 * _webHistorialGuerraJugador(token, tagBuscado) [→ Contexto_Base_Web.md §20B045]
 */
function _webHistorialGuerraJugador(token, tagBuscado, limite) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };

  var tagNorm = String(tagBuscado || '').trim().toUpperCase();
  if (tagNorm && tagNorm.charAt(0) !== '#') tagNorm = '#' + tagNorm;
  if (!tagNorm || tagNorm === '#') return { ok: false, error: 'Ingresa un Tag.' };

  var historial = _cargarHistorialGuerraIndividual(tagNorm);
  var registros = (historial && historial.registros) ? historial.registros : [];

  // Se arma UNA sola vez aquí, fuera del .map() de abajo, para no
  // releer/parsear Backup_Guerra.csv una vez por cada registro semanal.
  var mapaFechas = _obtenerFechaCierrePorTemporadaSemana(tagNorm);

  var salida = registros
    .slice()
    .sort(function (a, b) {
      if (a.temporadaInterna !== b.temporadaInterna) return b.temporadaInterna - a.temporadaInterna;
      if (a.semana !== b.semana) return b.semana - a.semana;
      return String(a.clan || '').localeCompare(String(b.clan || '')); // PF040: varios clanes en la misma semana
    })
    .map(function (r) {
      var fechaObj = mapaFechas[r.temporadaInterna + '|' + r.semana] || null;
      // FIX (10-sep-2026, pedido usuario — "el historial de guerra trae la [→ Contexto_Base_Web.md §20B046]
      var clanLimpio = String(r.clan || '').replace(/\s+\d{4}-\d{2}-\d{2}\s*$/, '').trim();
      return {
        fecha:              fechaObj ? _formatFechaCanonica(fechaObj) : '',
        temporadaInterna:   r.temporadaInterna,
        temporadaRoyaleAPI: (r.temporadaRoyaleAPI == null) ? null : r.temporadaRoyaleAPI,
        semana:             r.semana,
        clan:               clanLimpio,
        ataques:            (r.ataques == null) ? null : r.ataques,
        fame:               (r.fame == null) ? null : r.fame,
        barcos:             (r.barcos == null) ? null : r.barcos,
        fuente:             r.fuente || '',
        cerrada:            !!r.cerrada,
        comentario:         r.comentario || '',
        externa:            r.externa === true // §PF340: fila de un clan que no es de Terna (solo vive en el JSON individual)
      };
    });

  // NUEVO (re-aplicado 19-sep-2026): recorte opcional. `salida` ya viene [→ Contexto_Base_Web.md §20B047]
  var total = salida.length;
  var limiteNum = Number(limite);
  var recortar = !!limiteNum && limiteNum > 0 && limiteNum < total;
  if (recortar) salida = salida.slice(0, limiteNum);

  return { ok: true, tag: tagNorm, total: total, truncado: recortar, registros: salida };
}

// WEB — HISTORIAL COMPLETO POR JUGADOR (FASE 2, 04-sep-2026, punto 1 del [→ Contexto_Base_Web.md §20B043]

/**
 * _obtenerFechaCierrePorTemporadaSemana(tagNorm) [→ Contexto_Base_Web.md §20B044]
 */
function _obtenerFechaCierrePorTemporadaSemana(tagNorm) {
  var mapa = {};
  var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
  if (!csvText) return mapa;

  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length < 2) return mapa;

  for (var i = 1; i < parsed.length; i++) {
    var f = parsed[i];
    var tagFila = String(f[GC.TAG - 1] || '').trim().toUpperCase();
    if (tagFila !== tagNorm) continue;

    var temporada = Number(f[GC.TEMPORADA - 1]) || 0;
    var semana    = Number(f[GC.SEMANA - 1]) || 0;
    if (!temporada || !semana) continue;

    var fechaFila = _comoFechaComparable(f[GC.FECHA - 1]);
    if (!fechaFila) continue;

    var clave = temporada + '|' + semana;
    if (!mapa[clave] || fechaFila > mapa[clave]) mapa[clave] = fechaFila;
  }

  return mapa;
}

// ----- Limpieza de archivos repetidos de la carpeta Individual: función principal -----

// LIMPIEZA DE ARCHIVOS REPETIDOS EN LA CARPETA INDIVIDUAL (25-oct-2026)

/**
 * limpiarDuplicadosHistorialGuerraIndividual(aplicar) (25-oct-2026; sin probar en Apps Script real)
 * Busca en la carpeta de JSON individuales de RoyaleAPI los archivos con EXACTAMENTE el mismo nombre (el caso de las copias que el navegador
 * bajaba como «(1)»). Solo toca grupos de nombre idéntico. Si el contenido es igual byte a byte, conserva el más antiguo y manda los demás a la papelera
 * (se recuperan desde ahí); si el contenido difiere, no toca nada y lo deja en el registro. Por defecto SOLO SIMULA: con aplicar=true recién envía a la papelera.
 * Lee el contenido solo de los grupos repetidos y se detiene antes de pasar de unos 5 minutos (la corrida siguiente continúa donde quedó, porque lo ya borrado no vuelve a aparecer).
 * @param {boolean=} aplicar
 * @returns {{aplicado:boolean, gruposRepetidos:number, identicos:number, distintos:number, enviadosAPapelera:number, incompleto:boolean}}
 */
function limpiarDuplicadosHistorialGuerraIndividual(aplicar) {
  var inicio = Date.now();
  var LIMITE_MS = 5 * 60 * 1000;
  var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_ROYALEAPI_INDIVIDUAL);
  var porNombre = {};
  var it = folder.getFiles();
  while (it.hasNext()) {
    var f = it.next();
    var n = f.getName();
    if (!porNombre[n]) porNombre[n] = [];
    porNombre[n].push(f);
  }

  var res = { aplicado: !!aplicar, gruposRepetidos: 0, identicos: 0, distintos: 0, enviadosAPapelera: 0, incompleto: false };
  var detalle = [];
  var nombres = Object.keys(porNombre);
  for (var i = 0; i < nombres.length; i++) {
    var lista = porNombre[nombres[i]];
    if (lista.length < 2) continue;
    res.gruposRepetidos++;
    if (Date.now() - inicio > LIMITE_MS) { res.incompleto = true; continue; }

    lista.sort(function (a, b) { return a.getDateCreated().getTime() - b.getDateCreated().getTime(); });
    var conservado = lista[0];
    var base = conservado.getBlob().getDataAsString();
    for (var j = 1; j < lista.length; j++) {
      var otro = lista[j];
      if (otro.getBlob().getDataAsString() === base) {
        res.identicos++;
        if (aplicar) { otro.setTrashed(true); res.enviadosAPapelera++; }
        detalle.push((aplicar ? 'PAPELERA' : 'SE ENVIARIA') + ' ' + nombres[i] + ' (id ' + otro.getId() + ')');
      } else {
        res.distintos++;
        detalle.push('NO SE TOCA (contenido distinto) ' + nombres[i] + ' (ids ' + conservado.getId() + ' y ' + otro.getId() + ')');
      }
    }
  }

  Logger.log('[Limpieza] Individual — ' + (aplicar ? 'APLICADO' : 'SIMULACION') + ': grupos con nombre repetido ' + res.gruposRepetidos +
             ' | identicos ' + res.identicos + ' | distintos ' + res.distintos + ' | enviados a la papelera ' + res.enviadosAPapelera +
             (res.incompleto ? ' | INCOMPLETO por tiempo: vuelve a correrla' : ''));
  if (detalle.length) Logger.log(detalle.join('\n'));
  _registrarLogScriptTerna('limpiarDuplicadosHistorialGuerraIndividual(' + (aplicar ? 'true' : '') + ')',
    (aplicar ? 'Aplicado. ' : 'Simulacion. ') + 'Grupos repetidos: ' + res.gruposRepetidos + ', identicos: ' + res.identicos +
    ', distintos: ' + res.distintos + ', enviados a la papelera: ' + res.enviadosAPapelera + (res.incompleto ? ' (incompleto por tiempo)' : ''), []);
  return res;
}
