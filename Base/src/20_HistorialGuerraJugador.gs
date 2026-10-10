// ==============================================================================
// 20_HistorialGuerraJugador.gs
// Historial de guerra por jugador (grupal + individual) y alertas asociadas.
// ==============================================================================

// ----- Variables y constantes -----

// (ORDEN DE EJECUCIÓN: 24 — Histórico de Guerra [→ Contexto_Base_Web.md §20B001]

// PRIORIDAD DE FUENTES (Sección 3 del consolidado): Perfil > Log > Analytics. [→ Contexto_Base_Web.md §20B002]
var FUENTE_PRIORIDAD_HISTORIAL_GUERRA = {
  'riverrace': 0,
  'analytics': 1,
  'log':       2,
  'perfil':    3
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

// CSV GRUPAL (carpeta DRIVE_FOLDER_ID_ROYALEAPI_GRUPAL, Sección 6 del [→ Contexto_Base_Web.md §20B005]

var HISTORIAL_GUERRA_GRUPAL_FILENAME = 'HistorialGuerra_Grupal.csv';

// PUNTO 2 DE LA HOJA DE RUTA — endpoint que recibe los "registro" ya armados [→ Contexto_Base_Web.md §20B006]

// NUEVO (15-sep-2026, hallazgo B-35 de Plan_Fases.md): movido a Script [→ Contexto_Base_Web.md §20B007]
var HISTORIAL_GUERRA_TOKEN = _scriptToken('HISTORIAL_GUERRA_TOKEN');

// Índice en memoria { tag: DriveFile }, memoizado para el resto de la [→ Contexto_Base_Web.md §20B008]
var _HISTORIAL_GUERRA_DRIVE_INDEX_POR_TAG = null;

// ----- Funciones manuales / punto de entrada -----

// NOTA DE REORDEN (23-ago-2026, pedido usuario): las funciones manuales [→ Contexto_Base_Web.md §20B009]

/**
 * resolverAlertasHistorialGuerra() [→ Contexto_Base_Web.md §20B010]
 */
function resolverAlertasHistorialGuerra() {
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

// ----- Funciones internas / helpers -----

/**
 * _actualizarFilaHistorialGuerraGrupal(tag, nombre, registroNuevo) [→ Contexto_Base_Web.md §20B016]
 */
function _actualizarFilaHistorialGuerraGrupal(tag, nombre, registroNuevo) {
  if (!tag || !registroNuevo) return;
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    Logger.log('[HistorialGuerra][Grupal] No se pudo obtener el lock para ' + tag + ' — se omite esta actualización para evitar pisar otra escritura en curso.');
    return;
  }
  try {
    _actualizarFilaHistorialGuerraGrupalImpl(tag, nombre, registroNuevo);
  } finally {
    lock.releaseLock();
  }
}

function _actualizarFilaHistorialGuerraGrupalImpl(tag, nombre, registroNuevo) {
  try {
    var csvText = _loadHistorialGuerraGrupalCSV();
    var filas = csvText ? _parseCSV(csvText) : [HISTORIAL_GUERRA_GRUPAL_ENCABEZADOS.slice()];
    if (!filas.length) filas = [HISTORIAL_GUERRA_GRUPAL_ENCABEZADOS.slice()];

    var tagStr = String(tag).trim();
    var idxExistente = -1;
    for (var i = 1; i < filas.length; i++) { // fila 0 = encabezados
      if (filas[i][0] === tagStr &&
          Number(filas[i][2]) === Number(registroNuevo.temporadaInterna) &&
          Number(filas[i][4]) === Number(registroNuevo.semana)) {
        idxExistente = i;
        break;
      }
    }

    var existenteObj = (idxExistente >= 0) ? _filaHistorialGuerraGrupalARegistro(filas[idxExistente]) : null;
    var decision = _debeReemplazarRegistroHistorialGuerra(existenteObj, registroNuevo);

    if (!decision.reemplazar) {
      Logger.log('[HistorialGuerra][Grupal] Se ignora fila entrante (fuente "' + registroNuevo.fuente +
                 '" de menor prioridad) para ' + tagStr + ' Temporada ' + registroNuevo.temporadaInterna +
                 ' / Semana ' + registroNuevo.semana);
      return;
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
      filas[idxExistente] = filaNueva;
    } else {
      filas.push(filaNueva);
    }

    _saveHistorialGuerraGrupalCSV(_encodeCSV(filas));
  } catch (e) {
    Logger.log('[HistorialGuerra][Grupal] Error actualizando ' + tag + ': ' + e.message);
  }
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
 * _aplicarHistorialGuerra(candidatosPayload) [→ Contexto_Base_Web.md §20B019]
 */
function _aplicarHistorialGuerra(candidatosPayload) {
  if (!candidatosPayload || !candidatosPayload.length) {
    return { ok: false, error: 'Sin candidatos en el payload.', procesados: 0, registrosGuardados: 0 };
  }

  var offset = _getTemporadaOffsetRoyaleApi(); // 18_CorreccionGuerra.gs — mismo mapeo que Correcciones_Guerra.csv
  var procesados = 0, registrosGuardados = 0;
  var errores = [];

  for (var c = 0; c < candidatosPayload.length; c++) {
    var cand = candidatosPayload[c] || {};
    var tag = String(cand.tag || '').trim().toUpperCase();
    if (!tag) continue;
    var nombre = cand.nombre || '';
    var registrosEntrada = cand.registros || [];

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

        _guardarRegistroHistorialGuerra(tag, nombre, registroCompleto.clan, registroCompleto);
        registrosGuardados++;
      }
      procesados++;
    } catch (e) {
      errores.push({ tag: tag, error: e.message });
      Logger.log('[HistorialGuerra][Endpoint] Error procesando ' + tag + ': ' + e.message);
    }
  }

  return { ok: true, procesados: procesados, registrosGuardados: registrosGuardados, errores: errores };
}

// NOMBRE DE ARCHIVO E ÍNDICE POR TAG (mismo patrón que Players, [→ Contexto_Base_Web.md §20B020]

/**
 * _buildHistorialGuerraFilename(tag, clanActual) [→ Contexto_Base_Web.md §20B021]
 */
function _buildHistorialGuerraFilename(tag, clanActual) {
  var fechaHora = Utilities.formatDate(new Date(), 'America/Lima', 'dd-MM-yyyy HH.mm');
  var clan = (clanActual && String(clanActual).trim()) ? String(clanActual).trim() : 'Sin clan';
  return fechaHora + ' - ' + clan + ' - ' + String(tag || '').trim() + '.json';
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
 * _fusionarRegistroEnArrayHistorialGuerra(registros, nuevo, tag, nombre) [→ Contexto_Base_Web.md §20B028]
 */
function _fusionarRegistroEnArrayHistorialGuerra(registros, nuevo, tag, nombre) {
  var idxExistente = -1;
  for (var i = 0; i < registros.length; i++) {
    if (registros[i].temporadaInterna === nuevo.temporadaInterna &&
        registros[i].semana === nuevo.semana) {
      idxExistente = i;
      break;
    }
  }

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

  if (idxExistente >= 0) {
    registros[idxExistente] = registroFinal;
  } else {
    registros.push(registroFinal);
  }
  return registros;
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
    if (!idx[tag] || f.getName() > idx[tag].getName()) idx[tag] = f;
  }

  _HISTORIAL_GUERRA_DRIVE_INDEX_POR_TAG = idx;
  return idx;
}

/**
 * _getHistorialGuerraGrupalFolder() [→ Contexto_Base_Web.md §20B032]
 */
function _getHistorialGuerraGrupalFolder() {
  try { return DriveApp.getFolderById(DRIVE_FOLDER_ID_ROYALEAPI_GRUPAL); }
  catch (e) {
    var folders = DriveApp.getFoldersByName('Grupal');
    return folders.hasNext() ? folders.next() : DriveApp.createFolder('Grupal');
  }
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
  try {
    var historial = _cargarHistorialGuerraIndividual(tag) || _crearHistorialGuerraVacio(tag);
    historial.registros = _fusionarRegistroEnArrayHistorialGuerra(historial.registros || [], registroNuevo, tag, nombre);
    historial.fechaUltimaConsulta = Utilities.formatDate(new Date(), 'America/Lima', 'dd/MM/yyyy');

    var filename  = _buildHistorialGuerraFilename(tag, clanActual);
    var contenido = JSON.stringify(historial, null, 2);
    var folder    = DriveApp.getFolderById(DRIVE_FOLDER_ID_ROYALEAPI_INDIVIDUAL);
    var indice    = _getHistorialGuerraDriveIndexPorTag(folder);
    var archivoExistente = indice[String(tag).trim()] || null;

    if (archivoExistente) {
      if (archivoExistente.getName() !== filename) archivoExistente.setName(filename);
      archivoExistente.setContent(contenido);
    } else {
      var nuevoArchivo = folder.createFile(filename, contenido, MimeType.PLAIN_TEXT);
      indice[String(tag).trim()] = nuevoArchivo;
    }
  } catch (e) {
    Logger.log('[HistorialGuerra] Error guardando ' + tag + ': ' + e.message);
  }
}

function _loadHistorialGuerraGrupalCSV() {
  var folder = _getHistorialGuerraGrupalFolder();
  var files = folder.getFilesByName(HISTORIAL_GUERRA_GRUPAL_FILENAME);
  if (files.hasNext()) {
    return files.next().getBlob().getDataAsString('UTF-8');
  }
  return null;
}

// RESOLUCIÓN de alertas (Sección 8 P3 del consolidado, mecanismo confirmado [→ Contexto_Base_Web.md §20B037]

/**
 * _numOrNull(v) [→ Contexto_Base_Web.md §20B038]
 */
function _numOrNull(v) {
  return (v === '' || v === null || v === undefined) ? null : Number(v);
}

/**
 * _prioridadFuenteHistorialGuerra(fuente) [→ Contexto_Base_Web.md §20B039]
 */
function _prioridadFuenteHistorialGuerra(fuente) {
  var p = FUENTE_PRIORIDAD_HISTORIAL_GUERRA[String(fuente || '').toLowerCase()];
  return (typeof p === 'number') ? p : -1;
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
    files.next().setContent(content);
  } else {
    folder.createFile(HISTORIAL_GUERRA_GRUPAL_FILENAME, content, MimeType.CSV);
  }
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

  // Se arma UNA sola vez acá, fuera del .map() de abajo, para no
  // releer/parsear Backup_Guerra.csv una vez por cada registro semanal.
  var mapaFechas = _obtenerFechaCierrePorTemporadaSemana(tagNorm);

  var salida = registros
    .slice()
    .sort(function (a, b) {
      if (a.temporadaInterna !== b.temporadaInterna) return b.temporadaInterna - a.temporadaInterna;
      return b.semana - a.semana;
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
        comentario:         r.comentario || ''
      };
    });

  // NUEVO (re-aplicado 19-sep-2026): recorte opcional. `salida` ya viene [→ Contexto_Base_Web.md §20B047]
  var total = salida.length;
  var limiteNum = Number(limite);
  var recortar = !!limiteNum && limiteNum > 0 && limiteNum < total;
  if (recortar) salida = salida.slice(0, limiteNum);

  return { ok: true, tag: tagNorm, total: total, truncado: recortar, registros: salida };
}