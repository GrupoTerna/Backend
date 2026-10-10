// ==============================================================================
// 19_CorreccionRiverRace.gs
// Correcciones pendientes de RiverRace verificadas externamente (Tampermonkey).
// ==============================================================================

// ----- Variables y constantes -----

// 19_CorreccionRiverRace.gs [→ Contexto_Base_Web.md §19B001]

// Índices de columna (1-based) — Correcciones_RiverRace_Pendientes.csv. [→ Contexto_Base_Web.md §19B002]
var CRC = {
  NUM: 1, TEMPORADA: 2, SEMANA: 3, TAG: 4,
  ATAQUESHOY_DETECTADO: 5, ATAQUESHOY_ACTUAL: 6,
  PUNTAJEHOY_DETECTADO: 7, PUNTAJEHOY_ACTUAL: 8,
  BARCOSHOY_DETECTADO: 9, BARCOSHOY_ACTUAL: 10,
  FAMESEMANA_DETECTADO: 11, BARCOSSEMANA_DETECTADO: 12,
  FECHADETECCION: 13,
  // FECHADETECCION_TS (agregada 22-ago-2026): mismo instante que [→ Contexto_Base_Web.md §19B003]
  FECHADETECCION_TS: 14,
  ESTADO: 15,       // Pendiente / Aprobado / Descartado
  IMPLEMENTADO: 16  // Sí / No / vacío, independiente de ESTADO
};

var CRC_TOTAL_COLS = 16;

var CRC_ENCABEZADOS = [
  'N°', 'Temporada', 'Semana', 'Tag',
  'AtaquesHoy_Detectado', 'AtaquesHoy_Actual',
  'PuntajeHoy_Detectado', 'PuntajeHoy_Actual',
  'BarcosHoy_Detectado', 'BarcosHoy_Actual',
  'FameSemana_Detectado', 'BarcosSemana_Detectado',
  'FechaDeteccion', 'FechaDeteccion_TS', 'Estado', 'Implementado'
];

var CORRECCIONES_RIVERRACE_PENDIENTES_CSV = 'Correcciones_RiverRace_Pendientes.csv';

// Token propio del endpoint accion=verificarSemanaActual (ver doPost(), [→ Contexto_Base_Web.md §19B004]
var VERIFICAR_RIVERRACE_TOKEN = _scriptToken('VERIFICAR_RIVERRACE_TOKEN');

// ----- Funciones manuales / punto de entrada -----

// DETECCIÓN — recibe el payload del userscript, compara contra Guerra, y [→ Contexto_Base_Web.md §19B005]


// NOTA DE REORDEN (23-ago-2026, pedido usuario): las funciones manuales [→ Contexto_Base_Web.md §19B006]

function aprobarCorreccionesRiverRacePendientes() {
  var ss = _getSs();

  try {
    _fetchClanesBasico();
  } catch (eFetch) {
    Logger.log('[RiverRace] AVISO: no se pudo refrescar el cache de clanes (' + eFetch.message + '). Se continúa igual.');
  }

  var csvText = _loadCSVFromDrive(CORRECCIONES_RIVERRACE_PENDIENTES_CSV);
  if (!csvText) {
    Logger.log('[RiverRace] Nada que aprobar -- ' + CORRECCIONES_RIVERRACE_PENDIENTES_CSV + ' no existe todavía.');
    return;
  }
  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length < 2) {
    Logger.log('[RiverRace] Nada que aprobar -- ' + CORRECCIONES_RIVERRACE_PENDIENTES_CSV + ' está vacío.');
    return;
  }
  var filas = parsed.slice(1);

  var shGuerra = ss.getSheetByName(CFG.SHEETS.GUERRA);
  if (!shGuerra || shGuerra.getLastRow() < 2) {
    Logger.log('[RiverRace] ABORT: hoja Guerra no encontrada o sin filas de datos.');
    return;
  }
  var lastRowG = shGuerra.getLastRow();
  var dataG = shGuerra.getRange(2, 1, lastRowG - 1, GUERRA_TOTAL_COLS).getValues();

  // Por cada (Temporada, Semana, Tag), TODAS las filas ya registradas esa [→ Contexto_Base_Web.md §19B007]
  var offsetsPorClave = {};
  for (var r = 0; r < dataG.length; r++) {
    var fila = dataG[r];
    var claveG = String(fila[GC.TEMPORADA - 1]).trim() + '|' + String(fila[GC.SEMANA - 1]).trim() +
      '|' + String(fila[GC.TAG - 1]).trim();
    var pIdx = Number(fila[GC.PERIOD_IDX - 1]) || 0;
    var offDia = (pIdx % 7) - 3;
    if (offDia < 0 || offDia > 3) continue;
    if (!offsetsPorClave[claveG]) offsetsPorClave[claveG] = {};
    var idxPrevio = offsetsPorClave[claveG][offDia];
    if (idxPrevio === undefined || pIdx > (Number(dataG[idxPrevio][GC.PERIOD_IDX - 1]) || 0)) {
      offsetsPorClave[claveG][offDia] = r;
    }
  }

  var aprobadas = 0, implementadas = 0, fallidas = 0, huboEscritura = false;

  for (var i = 0; i < filas.length; i++) {
    var f = filas[i];
    if (String(f[CRC.ESTADO - 1]).trim() !== 'Pendiente') continue;

    var temporada = String(f[CRC.TEMPORADA - 1]).trim();
    var semana    = String(f[CRC.SEMANA - 1]).trim();
    var tag       = String(f[CRC.TAG - 1]).trim();
    var clave = temporada + '|' + semana + '|' + tag;
    var offsetsClave = offsetsPorClave[clave];

    var ok = false;
    if (offsetsClave) {
      // Día real de la detección (Jueves..Domingo), calculado desde [→ Contexto_Base_Web.md §19B008]
      var offDiaDeteccion = _offDiaDesdeTimestamp(Number(f[CRC.FECHADETECCION_TS - 1]) || 0);
      var rowDeteccion = (offDiaDeteccion >= 0) ? offsetsClave[offDiaDeteccion] : undefined;

      if (rowDeteccion === undefined) {
        Logger.log('[RiverRace] ' + clave + ': no se pudo ubicar con certeza el día de guerra de la detección ' +
          '(FECHADETECCION_TS ' + (offDiaDeteccion === -1 ? 'ausente/inválido' : 'apunta a un día sin fila en Guerra todavía') +
          ') -- no se adivina, la fila queda sin implementar para revisión manual.');
      } else {
        try {
          // offsetsClave recortado a días <= el de la detección: Fame/Barcos [→ Contexto_Base_Web.md §19B009]
          var offsetsClaveHastaDeteccion = {};
          for (var offK in offsetsClave) {
            if (Number(offK) <= offDiaDeteccion) offsetsClaveHastaDeteccion[offK] = offsetsClave[offK];
          }

          // Ataques: reemplazo directo en la fila del día exacto de la detección.
          dataG[rowDeteccion][GC.ATAQUES_HOY - 1] = Number(f[CRC.ATAQUESHOY_DETECTADO - 1]) || 0;

          // Fame/Barcos: reparto vía _corregirCampoAcumuladoConDistribucion() [→ Contexto_Base_Web.md §19B010]
          _corregirCampoAcumuladoConDistribucion(dataG, offsetsClaveHastaDeteccion, GC.FAME,
            Number(f[CRC.FAMESEMANA_DETECTADO - 1]) || 0, 900);
          _corregirCampoAcumuladoConDistribucion(dataG, offsetsClaveHastaDeteccion, GC.BARCOS,
            Number(f[CRC.BARCOSSEMANA_DETECTADO - 1]) || 0, 4);

          ok = true;
          huboEscritura = true;
        } catch (eFila) {
          Logger.log('[RiverRace] Error aplicando fila ' + (i + 1) + ' (' + clave + '): ' + eFila.message);
          ok = false;
        }
      }
    } else {
      Logger.log('[RiverRace] Sin fila en Guerra para ' + clave + ' -- no se pudo aplicar la corrección.');
    }

    f[CRC.ESTADO - 1] = 'Aprobado';
    f[CRC.IMPLEMENTADO - 1] = ok ? 'Sí' : 'No';
    aprobadas++;
    if (ok) implementadas++; else fallidas++;
  }

  if (aprobadas === 0) {
    Logger.log('[RiverRace] Sin filas Pendiente para aprobar.');
    return;
  }

  if (huboEscritura) {
    shGuerra.getRange(2, 1, lastRowG - 1, GUERRA_TOTAL_COLS).setValues(dataG);
    try {
      _syncGuerraCSV(shGuerra); // 17_GuerraSheet.gs -- propaga a Backup_Guerra.csv
    } catch (eSync) {
      Logger.log('[RiverRace] Corrección aplicada en Guerra pero _syncGuerraCSV() falló: ' + eSync.message);
    }
  }

  // Reescribe el CSV completo (nunca se purga acá -- ver
  // limpiarCorreccionesRiverRacePendientesAplicadas() para eso).
  var salidaCsv = [CRC_ENCABEZADOS].concat(filas);
  _saveCSVToDrive(CORRECCIONES_RIVERRACE_PENDIENTES_CSV, _encodeCSV(salidaCsv));

  // Refresco automático (P3 resuelta, Sección 8) -- mismo patrón que [→ Contexto_Base_Web.md §19B011]
  var avisos = [];
  try {
    generarBackupGuerraSemanalCSV(); // 17_GuerraSheet.gs / 23_Control2_GuerraSemanal.gs
  } catch (e1) {
    var avisoBackup = 'generarBackupGuerraSemanalCSV() falló: ' + e1.message;
    Logger.log('[RiverRace] ' + avisoBackup);
    avisos.push(avisoBackup);
  }
  try {
    actualizarControl2(); // 23_Control2_GuerraSemanal.gs
  } catch (e2) {
    var avisoControl2 = 'actualizarControl2() falló: ' + e2.message;
    Logger.log('[RiverRace] ' + avisoControl2);
    avisos.push(avisoControl2);
  }
  try {
    var shNuevos = ss.getSheetByName(CFG.SHEETS.NUEVOS);
    if (shNuevos) _actualizarSemanaActualNuevos(shNuevos); // 14_Nuevos_RoyaleAPI.gs
  } catch (e3) {
    var avisoNuevos = '_actualizarSemanaActualNuevos() falló: ' + e3.message;
    Logger.log('[RiverRace] ' + avisoNuevos);
    avisos.push(avisoNuevos);
  }

  Logger.log('[RiverRace] Aprobación manual: ' + aprobadas + ' fila(s) aprobada(s) (' +
    implementadas + ' implementada(s), ' + fallidas + ' fallida(s)).' +
    (avisos.length ? ' Avisos: ' + avisos.join(' | ') : ''));
}

/**
 * limpiarCorreccionesRiverRacePendientesAplicadas() [→ Contexto_Base_Web.md §19B012]
 */
function limpiarCorreccionesRiverRacePendientesAplicadas() {
  var csvText = _loadCSVFromDrive(CORRECCIONES_RIVERRACE_PENDIENTES_CSV);
  if (!csvText) {
    Logger.log('[RiverRace] Nada que limpiar -- ' + CORRECCIONES_RIVERRACE_PENDIENTES_CSV + ' no existe todavía.');
    return;
  }
  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length < 2) {
    Logger.log('[RiverRace] Nada que limpiar -- ' + CORRECCIONES_RIVERRACE_PENDIENTES_CSV + ' está vacío.');
    return;
  }
  var filas = parsed.slice(1);

  var conservadas = filas.filter(function (f) {
    var esAprobadaImplementada =
      String(f[CRC.ESTADO - 1]).trim() === 'Aprobado' &&
      String(f[CRC.IMPLEMENTADO - 1]).trim() === 'Sí';
    return !esAprobadaImplementada;
  });
  var borradas = filas.length - conservadas.length;

  // Renumera N° según el nuevo orden físico (mismo criterio que el resto
  // de CSV del proyecto: la columna N° es decorativa, se recalcula entera).
  for (var i = 0; i < conservadas.length; i++) {
    conservadas[i][CRC.NUM - 1] = i + 1;
  }

  var salida = [CRC_ENCABEZADOS].concat(conservadas);
  _saveCSVToDrive(CORRECCIONES_RIVERRACE_PENDIENTES_CSV, _encodeCSV(salida));

  Logger.log('[RiverRace] Limpieza manual: ' + borradas + ' fila(s) borrada(s) (Aprobado + Implementado=Sí). ' +
    'Quedan ' + conservadas.length + ' fila(s) en el CSV.');
}

// ----- Funciones internas / helpers -----

/**
 * _procesarVerificacionRiverRace(participantesPayload) [→ Contexto_Base_Web.md §19B013]
 */
function _procesarVerificacionRiverRace(participantesPayload) {
  if (!participantesPayload || !participantesPayload.length) {
    return { ok: false, error: 'Sin participantes en el payload.', procesados: 0, discrepancias: 0 };
  }

  // Mismo motivo que corregirGuerraYControlDesdeControl2() (18_CorreccionGuerra.gs): [→ Contexto_Base_Web.md §19B014]
  try {
    _fetchClanesBasico();
  } catch (eFetch) {
    Logger.log('[RiverRace] AVISO: no se pudo refrescar el cache de clanes (' +
      eFetch.message + '). Se continúa igual -- puede fallar más abajo si _getCtx() queda sin datos.');
  }

  var ctx = _getCtx();
  if (ctx.sinCacheClanes) {
    return { ok: false, error: 'Sin contexto de temporada/semana disponible (sin cache de clanes).', procesados: 0, discrepancias: 0 };
  }
  if (ctx.periodIndexSospechoso) {
    return { ok: false, error: 'periodIndex sospechoso (posible dato stale de la API de Supercell) — reintentar más tarde.', procesados: 0, discrepancias: 0 };
  }

  var offDiaHoy = (ctx.periodIndex % 7) - 3; // 0=Jueves..3=Domingo
  if (offDiaHoy < 0 || offDiaHoy > 3) {
    return { ok: false, error: 'Hoy no es día de guerra — nada que verificar.', procesados: 0, discrepancias: 0 };
  }

  var temporada = ctx.temporada;
  var semana = ctx.sectionIndex + 1;
  var sIdx = semana - 1;

  var guerraData = _getDatosGuerraDesdeHojaParaControl(ctx); // 22_ControlCalendario.gs

  var mapa = _cargarPendientesRiverRace();
  var ahora = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT-5', 'yyyy-MM-dd HH:mm:ss');
  var ahoraTs = Date.now(); // FECHADETECCION_TS -- mismo instante que 'ahora', en epoch ms

  var procesados = 0, discrepancias = 0, omitidos = 0, yaResueltas = 0;

  for (var i = 0; i < participantesPayload.length; i++) {
    var p = participantesPayload[i] || {};
    var tag = String(p.tag || '').trim().toUpperCase();
    if (!tag) { omitidos++; continue; }

    var decksHoy = Number(p.decksHoy);
    var fameSemana = Number(p.fameSemana);
    var barcosSemana = Number(p.barcosSemana);
    if (isNaN(decksHoy) || isNaN(fameSemana) || isNaN(barcosSemana)) { omitidos++; continue; }

    var diasTag = (guerraData[tag] && guerraData[tag][sIdx]) || {};

    // suma(... ya en Guerra): días de guerra ANTERIORES a hoy (offDia < offDiaHoy) [→ Contexto_Base_Web.md §19B015]
    var sumaPuntajeAnteriores = 0, sumaBarcosAnteriores = 0;
    for (var d = 0; d < offDiaHoy; d++) {
      var diaPrevio = diasTag['dia_' + d];
      if (diaPrevio) {
        sumaPuntajeAnteriores += diaPrevio.puntaje;
        sumaBarcosAnteriores += diaPrevio.barcos;
      }
    }

    var ataquesHoy = decksHoy;
    var puntajeHoy = Math.min(Math.max(fameSemana - sumaPuntajeAnteriores, 0), 900);
    var barcosHoy = Math.max(barcosSemana - sumaBarcosAnteriores, 0);

    var diaHoyActual = diasTag['dia_' + offDiaHoy];
    var actual = diaHoyActual
      ? { ataques: diaHoyActual.ataques, puntaje: diaHoyActual.puntaje, barcos: diaHoyActual.barcos }
      : { ataques: 0, puntaje: 0, barcos: 0 }; // sin fila todavía hoy en Guerra para este tag

    procesados++;

    if (ataquesHoy === actual.ataques && puntajeHoy === actual.puntaje && barcosHoy === actual.barcos) {
      continue; // sin discrepancia -> no se genera ninguna fila (mismo criterio que el resto del diseño)
    }

    // RESUELTO (22-ago-2026, pedido del usuario): la clave de dedup del CSV [→ Contexto_Base_Web.md §19B016]
    var clave = temporada + '|' + semana + '|' + tag + '|' + offDiaHoy;
    var existente = mapa[clave];

    // Se conserva esta salvaguarda por si el mismo día se vuelve a correr [→ Contexto_Base_Web.md §19B017]
    if (existente && existente.estado !== 'Pendiente') {
      yaResueltas++;
      Logger.log('[RiverRace] Discrepancia detectada para ' + clave + ' pero ya existe una fila ' +
        existente.estado + ' con esa clave -- no se sobreescribe (ver nota de diseño en el código). ' +
        'Revisar manualmente si es un problema nuevo.');
      continue;
    }

    discrepancias++;
    mapa[clave] = {
      temporada: temporada, semana: semana, tag: tag,
      ataquesHoyDetectado: ataquesHoy, ataquesHoyActual: actual.ataques,
      puntajeHoyDetectado: puntajeHoy, puntajeHoyActual: actual.puntaje,
      barcosHoyDetectado: barcosHoy, barcosHoyActual: actual.barcos,
      fameSemanaDetectado: fameSemana, barcosSemanaDetectado: barcosSemana,
      fechaDeteccion: ahora, fechaDeteccionTs: ahoraTs, estado: 'Pendiente', implementado: ''
    };
  }

  _guardarPendientesRiverRace(mapa);

  Logger.log('[RiverRace] Verificación semana en curso — Temporada ' + temporada + ', Semana ' + semana +
    ': ' + procesados + ' procesado(s), ' + discrepancias + ' discrepancia(s) nueva(s), ' +
    yaResueltas + ' con fila ya resuelta (no sobreescrita), ' + omitidos + ' omitido(s).');

  return { ok: true, procesados: procesados, discrepancias: discrepancias, yaResueltas: yaResueltas, omitidos: omitidos };
}

// PERSISTENCIA — Correcciones_RiverRace_Pendientes.csv [→ Contexto_Base_Web.md §19B018]

function _cargarPendientesRiverRace() {
  var mapa = {};
  var csvText = _loadCSVFromDrive(CORRECCIONES_RIVERRACE_PENDIENTES_CSV);
  if (!csvText) return mapa;

  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length < 2) return mapa;

  var filas = parsed.slice(1);
  for (var i = 0; i < filas.length; i++) {
    var f = filas[i];
    var temporada = String(f[CRC.TEMPORADA - 1] || '').trim();
    var semana    = String(f[CRC.SEMANA - 1]    || '').trim();
    var tag       = String(f[CRC.TAG - 1]       || '').trim();
    if (!temporada || !semana || !tag) continue;

    // Mismo criterio de clave que _procesarVerificacionRiverRace() [→ Contexto_Base_Web.md §19B019]
    var fechaDeteccionTsFila = Number(f[CRC.FECHADETECCION_TS - 1]) || 0;
    var offDiaFila = _offDiaDesdeTimestamp(fechaDeteccionTsFila);
    var clave = temporada + '|' + semana + '|' + tag + '|' + offDiaFila;
    mapa[clave] = {
      temporada: temporada, semana: semana, tag: tag,
      ataquesHoyDetectado:   Number(f[CRC.ATAQUESHOY_DETECTADO - 1])   || 0,
      ataquesHoyActual:      Number(f[CRC.ATAQUESHOY_ACTUAL - 1])      || 0,
      puntajeHoyDetectado:   Number(f[CRC.PUNTAJEHOY_DETECTADO - 1])   || 0,
      puntajeHoyActual:      Number(f[CRC.PUNTAJEHOY_ACTUAL - 1])      || 0,
      barcosHoyDetectado:    Number(f[CRC.BARCOSHOY_DETECTADO - 1])    || 0,
      barcosHoyActual:       Number(f[CRC.BARCOSHOY_ACTUAL - 1])       || 0,
      fameSemanaDetectado:   Number(f[CRC.FAMESEMANA_DETECTADO - 1])   || 0,
      barcosSemanaDetectado: Number(f[CRC.BARCOSSEMANA_DETECTADO - 1]) || 0,
      fechaDeteccion:   String(f[CRC.FECHADETECCION - 1] || ''),
      fechaDeteccionTs: fechaDeteccionTsFila,
      estado:           String(f[CRC.ESTADO - 1] || 'Pendiente'),
      implementado:   String(f[CRC.IMPLEMENTADO - 1] || '')
    };
  }
  return mapa;
}

/**
 * _guardarPendientesRiverRace(mapa) [→ Contexto_Base_Web.md §19B020]
 */
function _guardarPendientesRiverRace(mapa) {
  var claves = Object.keys(mapa).sort(function (a, b) {
    var pa = a.split('|'), pb = b.split('|');
    var temporadaA = Number(pa[0]), temporadaB = Number(pb[0]);
    if (temporadaA !== temporadaB) return temporadaA - temporadaB;
    var semanaA = Number(pa[1]), semanaB = Number(pb[1]);
    if (semanaA !== semanaB) return semanaA - semanaB;
    return String(pa[2]).localeCompare(String(pb[2]));
  });

  var filas = [];
  var num = 1;
  for (var i = 0; i < claves.length; i++) {
    var v = mapa[claves[i]];
    filas.push([
      num++, v.temporada, v.semana, v.tag,
      v.ataquesHoyDetectado, v.ataquesHoyActual,
      v.puntajeHoyDetectado, v.puntajeHoyActual,
      v.barcosHoyDetectado, v.barcosHoyActual,
      v.fameSemanaDetectado, v.barcosSemanaDetectado,
      v.fechaDeteccion, v.fechaDeteccionTs || 0, v.estado, v.implementado
    ]);
  }
  var salida = [CRC_ENCABEZADOS].concat(filas);
  _saveCSVToDrive(CORRECCIONES_RIVERRACE_PENDIENTES_CSV, _encodeCSV(salida));
}

// APROBACIÓN MANUAL — nunca automática, dispara el refresco de [→ Contexto_Base_Web.md §19B021]

/**
 * aprobarCorreccionesRiverRacePendientes() [→ Contexto_Base_Web.md §19B022]
 */
/**
 * _offDiaDesdeTimestamp(ts) [→ Contexto_Base_Web.md §19B023]
 */
function _offDiaDesdeTimestamp(ts) {
  if (!ts) return -1;
  var tz = Session.getScriptTimeZone() || 'GMT-5';
  var isoDow = Number(Utilities.formatDate(new Date(ts), tz, 'u')); // 1=Lunes..7=Domingo
  var MAPA_ISO_A_OFFDIA = { 4: 0, 5: 1, 6: 2, 7: 3 }; // Jueves..Domingo -> 0..3
  return MAPA_ISO_A_OFFDIA.hasOwnProperty(isoDow) ? MAPA_ISO_A_OFFDIA[isoDow] : -1;
}