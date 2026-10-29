// ==============================================================================
// 20_HistorialGuerraJugador.gs
// Historial de guerra por jugador (grupal + individual) y alertas asociadas.
// ==============================================================================

// ----- Variables y constantes -----

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
  var itemsGrupal = []; // se escriben todos juntos al final (un solo CSV grupal por petición) [→ Contexto_Base_Web.md §PF068]

  for (var c = 0; c < candidatosPayload.length; c++) {
    var cand = candidatosPayload[c] || {};
    var tag = String(cand.tag || '').trim().toUpperCase();
    if (!tag) continue;
    var nombre = cand.nombre || '';
    var registrosEntrada = cand.registros || [];
    var registrosDelJugador = [];
    var clanDelJugador = '';

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

        registrosDelJugador.push(registroCompleto);
        if (registroCompleto.clan) clanDelJugador = registroCompleto.clan; // el nombre del archivo usa el clan del último registro, como antes
        itemsGrupal.push({ tag: tag, nombre: nombre, registro: registroCompleto });
        registrosGuardados++;
      }
      // JSON individual: una lectura y, si cambió algo, una escritura por jugador.
      _guardarRegistrosHistorialGuerraIndividual(tag, nombre, clanDelJugador, registrosDelJugador);
      procesados++;
    } catch (e) {
      errores.push({ tag: tag, error: e.message });
      Logger.log('[HistorialGuerra][Endpoint] Error procesando ' + tag + ': ' + e.message);
    }
  }

  // CSV grupal: una lectura y una escritura para toda la petición.
  var grupal = _actualizarFilasHistorialGuerraGrupalLote(itemsGrupal);

  return {
    ok: true, procesados: procesados, registrosGuardados: registrosGuardados, errores: errores,
    grupalGuardado: grupal.guardado, grupalCambios: grupal.cambios, grupalIgnorados: grupal.ignorados,
    grupalSinLock: !!grupal.sinLock
  };
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

// CLAVE POR CLAN (11-oct-2026, pedido usuaria): Log y Analytics son por clan, así que un jugador puede tener varios registros la misma semana (uno por clan) y deben coexistir. [→ Contexto_Base_Web.md §PF040]
/**
 * _claveClanHistorialGuerra(clan) [→ Contexto_Base_Web.md §PF040]
 */
function _claveClanHistorialGuerra(clan) {
  return String(clan || '').replace(/\s+\d{4}-\d{2}-\d{2}\s*$/, '').trim().toLowerCase();
}

/**
 * _buscarIndiceHistorialGuerra(registros, nuevo) [→ Contexto_Base_Web.md §PF040]
 */
function _buscarIndiceHistorialGuerra(registros, nuevo) {
  var nuevoEsPerfil = String(nuevo.fuente || '').toLowerCase() === 'perfil';
  var clanNuevo = _claveClanHistorialGuerra(nuevo.clan);
  var idxMismoClan = -1, idxPerfil = -1, idxMejorNoPerfil = -1, prioMejor = -2;

  for (var i = 0; i < registros.length; i++) {
    var r = registros[i];
    if (Number(r.temporadaInterna) !== Number(nuevo.temporadaInterna) ||
        Number(r.semana) !== Number(nuevo.semana)) continue;

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
  _guardarRegistrosHistorialGuerraIndividual(tag, nombre, clanActual, [registroNuevo]);
}

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

    if (archivoExistente) {
      if (archivoExistente.getName() !== filename) archivoExistente.setName(filename);
      _setContentConConteo_(archivoExistente, contenido);
    } else {
      var nuevoArchivo = _createFileConConteo_(folder, filename, contenido, MimeType.PLAIN_TEXT);
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

/** Atajos para el editor de Apps Script (sin parámetros): simula / aplica la limpieza de la carpeta Individual. */
function limpiarDuplicadosHistorialGuerraIndividualSimular() { return limpiarDuplicadosHistorialGuerraIndividual(false); }
function limpiarDuplicadosHistorialGuerraIndividualAplicar() { return limpiarDuplicadosHistorialGuerraIndividual(true); }
