// 19_CorreccionRiverRace.gs
// Correcciones pendientes de RiverRace verificadas externamente (Tampermonkey).
// 19_CorreccionRiverRace.gs [→ Contexto_Base_Web.md §19B001]

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 27-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Correcciones de River Race: aprobar y limpiar pendientes
//  Parte 2 — Funciones que no se corren a mano
//    - Correcciones de River Race: recibir la verificación web y guardar pendientes
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

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
  IMPLEMENTADO: 16, // Sí / No / vacío, independiente de ESTADO
  // DIAGUERRA (agregada 15-nov-2026, §PF470/§PF471): día de guerra de la detección, 0=Jueves..3=Domingo, tomado del periodIndex.
  // Vacío en las filas anteriores. Evita deducir el día desde la hora del timestamp, que de 00:00 a 05:00 (Lima) da el día calendario y no el de guerra.
  DIAGUERRA: 17,
  // CLANTAG (agregada 15-nov-2026, §PF474): Tag del CLAN al que corresponde la fila (p. ej. #GCRG8L00). Vacío = comparación por el total del tag (filas anteriores o script sin clanTag).
  CLANTAG: 18
};

var CRC_TOTAL_COLS = 18;

var CRC_ENCABEZADOS = [
  'N°', 'Temporada', 'Semana', 'Tag',
  'AtaquesHoy_Detectado', 'AtaquesHoy_Actual',
  'PuntajeHoy_Detectado', 'PuntajeHoy_Actual',
  'BarcosHoy_Detectado', 'BarcosHoy_Actual',
  'FameSemana_Detectado', 'BarcosSemana_Detectado',
  'FechaDeteccion', 'FechaDeteccion_TS', 'Estado', 'Implementado', 'DiaGuerra', 'Clan_Tag'
];

var CORRECCIONES_RIVERRACE_PENDIENTES_CSV = 'Correcciones_RiverRace_Pendientes.csv';

// Token propio del endpoint accion=verificarSemanaActual (ver doPost(), [→ Contexto_Base_Web.md §19B004]
var VERIFICAR_RIVERRACE_TOKEN = _scriptToken('VERIFICAR_RIVERRACE_TOKEN');

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Correcciones de River Race: aprobar y limpiar pendientes -----

// DETECCIÓN — recibe el payload del userscript, compara contra Guerra, y [→ Contexto_Base_Web.md §19B005]

// NOTA DE REORDEN (23-ago-2026, pedido usuario): las funciones manuales [→ Contexto_Base_Web.md §19B006]

function aprobarCorreccionesRiverRacePendientes() {
  var ss = _getSs();

  try {
    capturarApiClanes_(CFG.CLANES_PROGRESO_MAX_EDAD_MS, 'CorreccionRiverRace');
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
  // §PF474 (15-nov-2026): el mismo índice se arma también por clan (clave + '|' + Tag del clan), para aplicar una fila pendiente «de un clan» solo sobre las filas de ese clan.
  var offsetsPorClave = {};
  var offsetsPorClaveClan = {};
  var mapaNombreATagAprob = _mapaNombreClanATagTerna();
  var registrarOffset = function (indice, clave, offDia, pIdx, r) {
    if (!indice[clave]) indice[clave] = {};
    var idxPrevio = indice[clave][offDia];
    if (idxPrevio === undefined || pIdx > (Number(dataG[idxPrevio][GC.PERIOD_IDX - 1]) || 0)) {
      indice[clave][offDia] = r;
    }
  };
  for (var r = 0; r < dataG.length; r++) {
    var fila = dataG[r];
    var claveG = String(fila[GC.TEMPORADA - 1]).trim() + '|' + String(fila[GC.SEMANA - 1]).trim() +
      '|' + String(fila[GC.TAG - 1]).trim();
    var pIdx = Number(fila[GC.PERIOD_IDX - 1]) || 0;
    var offDia = (pIdx % 7) - 3;
    if (offDia < 0 || offDia > 3) continue;
    registrarOffset(offsetsPorClave, claveG, offDia, pIdx, r);
    var clanTagFilaG = _clanTagFilaGuerraRiverRace_(fila, mapaNombreATagAprob);
    if (clanTagFilaG) registrarOffset(offsetsPorClaveClan, claveG + '|' + clanTagFilaG, offDia, pIdx, r);
  }

  var aprobadas = 0, implementadas = 0, fallidas = 0, huboEscritura = false;

  for (var i = 0; i < filas.length; i++) {
    var f = filas[i];
    if (String(f[CRC.ESTADO - 1]).trim() !== 'Pendiente') continue;

    var temporada = String(f[CRC.TEMPORADA - 1]).trim();
    var semana    = String(f[CRC.SEMANA - 1]).trim();
    var tag       = String(f[CRC.TAG - 1]).trim();
    var clave = temporada + '|' + semana + '|' + tag;
    // §PF474: con Clan_Tag en la fila pendiente, solo cuentan las filas de Guerra de ese clan; sin él (filas anteriores), el comportamiento de siempre.
    var clanTagPend = _tagClanRiverRace_(f[CRC.CLANTAG - 1]);
    if (clanTagPend) clave += '|' + clanTagPend;
    var offsetsClave = clanTagPend ? offsetsPorClaveClan[clave] : offsetsPorClave[clave];

    var ok = false;
    if (offsetsClave) {
      // Día real de la detección (Jueves..Domingo), calculado desde [→ Contexto_Base_Web.md §19B008]
      var offDiaDeteccion = _offDiaFilaPendienteRiverRace_(f); // §PF471: usa DiaGuerra si está; sin él, el día calendario (y -1 de 00:00 a 05:00)
      var rowDeteccion = (offDiaDeteccion >= 0) ? offsetsClave[offDiaDeteccion] : undefined;

      if (rowDeteccion === undefined) {
        Logger.log('[RiverRace] ' + clave + ': no se pudo ubicar con certeza el día de guerra de la detección ' +
          '(FECHADETECCION_TS ' + (offDiaDeteccion === -1 ? 'ausente, inválido o detectado de 00:00 a 05:00 sin DiaGuerra' : 'apunta a un día sin fila en Guerra todavía') +
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

  // Reescribe el CSV completo (nunca se purga aquí -- ver
  // limpiarCorreccionesRiverRacePendientesAplicadas() para eso).
  for (var pa = 0; pa < filas.length; pa++) { while (filas[pa].length < CRC_TOTAL_COLS) filas[pa].push(''); } // filas viejas de 16 columnas
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

  for (var pl = 0; pl < conservadas.length; pl++) { while (conservadas[pl].length < CRC_TOTAL_COLS) conservadas[pl].push(''); }
  var salida = [CRC_ENCABEZADOS].concat(conservadas);
  _saveCSVToDrive(CORRECCIONES_RIVERRACE_PENDIENTES_CSV, _encodeCSV(salida));

  Logger.log('[RiverRace] Limpieza manual: ' + borradas + ' fila(s) borrada(s) (Aprobado + Implementado=Sí). ' +
    'Quedan ' + conservadas.length + ' fila(s) en el CSV.');
}

/**
 * limpiarRiverRacePendientesDuplicados() (15-nov-2026, §PF471): quita de Correcciones_RiverRace_Pendientes.csv las filas «Pendiente»
 * repetidas y las de día ambiguo. Nunca toca filas Aprobado ni Descartado y no escribe en Guerra.
 *  1) Repetidas: misma clave temporada|semana|tag|día (el día sale de DiaGuerra y, sin él, de _offDiaFilaPendienteRiverRace_()); queda la más reciente.
 *  2) Ambiguas: sin DiaGuerra, detectadas de 00:00 a 05:00 (Lima) en jueves a domingo. Antes de §PF471 la aprobación las habría puesto en el día calendario
 *     y no en el de guerra. Son detecciones que no se aplicaron; la próxima verificación (fuera de 04:00 a 05:00) las vuelve a generar con DiaGuerra.
 * Cada fila quitada se anota en el registro con su N° y el motivo.
 */
function limpiarRiverRacePendientesDuplicados() {
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

  // Primero se busca, por clave, la fila Pendiente más reciente.
  var ganadora = {};
  for (var i = 0; i < filas.length; i++) {
    var f = filas[i];
    if (String(f[CRC.ESTADO - 1]).trim() !== 'Pendiente') continue;
    var clave = _clavePendienteRiverRace_(f);
    var ts = Number(f[CRC.FECHADETECCION_TS - 1]) || 0;
    if (ganadora[clave] === undefined || ts >= (Number(filas[ganadora[clave]][CRC.FECHADETECCION_TS - 1]) || 0)) ganadora[clave] = i;
  }

  var conservadas = [], repetidas = 0, ambiguas = 0;
  for (var j = 0; j < filas.length; j++) {
    var g = filas[j];
    if (String(g[CRC.ESTADO - 1]).trim() !== 'Pendiente') { conservadas.push(g); continue; }
    var claveG = _clavePendienteRiverRace_(g);
    if (ganadora[claveG] !== j) {
      repetidas++;
      Logger.log('[RiverRace] Se quita la fila N° ' + g[CRC.NUM - 1] + ' (' + claveG + '): repetida, queda la más reciente.');
      continue;
    }
    var tsG = Number(g[CRC.FECHADETECCION_TS - 1]) || 0;
    if (_diaGuerraGuardadoRiverRace_(g) === '' && _offDiaFilaPendienteRiverRace_(g) === -1 && _offDiaDesdeTimestamp(tsG) >= 0) {
      ambiguas++;
      Logger.log('[RiverRace] Se quita la fila N° ' + g[CRC.NUM - 1] + ' (' + claveG + '): día de guerra ambiguo (detectada de 00:00 a 05:00 sin DiaGuerra).');
      continue;
    }
    conservadas.push(g);
  }

  for (var k = 0; k < conservadas.length; k++) {
    conservadas[k][CRC.NUM - 1] = k + 1;
    while (conservadas[k].length < CRC_TOTAL_COLS) conservadas[k].push('');
  }
  _saveCSVToDrive(CORRECCIONES_RIVERRACE_PENDIENTES_CSV, _encodeCSV([CRC_ENCABEZADOS].concat(conservadas)));

  Logger.log('[RiverRace] Limpieza de pendientes: ' + repetidas + ' repetida(s) y ' + ambiguas + ' de día ambiguo quitadas. Quedan ' +
    conservadas.length + ' fila(s). Si quitaste ambiguas, vuelve a correr «Verificar Semana en Curso» fuera de 04:00 a 05:00 (Lima).');
}

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Correcciones de River Race: recibir la verificación web y guardar pendientes -----

/**
 * _procesarVerificacionRiverRace(participantesPayload) [→ Contexto_Base_Web.md §19B013]
 */
function _procesarVerificacionRiverRace(participantesPayload) {
  if (!participantesPayload || !participantesPayload.length) {
    return { ok: false, error: 'Sin participantes en el payload.', procesados: 0, discrepancias: 0 };
  }

  // Mismo motivo que corregirGuerraYControlDesdeControl2() (18_CorreccionGuerra.gs): [→ Contexto_Base_Web.md §19B014]
  try {
    capturarApiClanes_(CFG.CLANES_PROGRESO_MAX_EDAD_MS, 'CorreccionRiverRace');
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
  // §PF471 (15-nov-2026): de 04:00 a 05:00 (Lima) cada clan cambia de día de guerra y RoyaleAPI puede ir un día por delante de la caché del backend; compararlos ahí genera discrepancias falsas.
  if (_enVentanaCambioDiaGuerra_()) {
    return { ok: false, error: 'Es la ventana de cambio de día de guerra (04:00 a 05:00, hora de Lima): los clanes cambian en momentos distintos y la comparación saldría con discrepancias falsas. Vuelve a correrlo después de las 05:00.', procesados: 0, discrepancias: 0 };
  }

  var temporada = ctx.temporada;
  var semana = ctx.sectionIndex + 1;
  var sIdx = semana - 1;

  var guerraData = _getDatosGuerraDesdeHojaParaControl(ctx); // 22_ControlCalendario.gs
  // §PF474 (15-nov-2026): lo mismo que guerraData pero separado por clan (por Tag), para comparar cada clan contra lo que Guerra tiene de ESE clan.
  var guerraPorClan = _getGuerraPorClanParaRiverRace_(ctx, sIdx);

  var mapa = _cargarPendientesRiverRace();
  var ahora = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT-5', 'yyyy-MM-dd HH:mm:ss');
  var ahoraTs = Date.now(); // FECHADETECCION_TS -- mismo instante que 'ahora', en epoch ms

  var procesados = 0, discrepancias = 0, omitidos = 0, yaResueltas = 0;

  // §PF473 (15-nov-2026): un jugador puede salir en dos clanes Terna la misma semana (cambió de clan). Cada clan aporta su valor y ninguno pisa ni excluye al otro.
  // §PF474 (15-nov-2026): el clan se identifica por su Tag (q.clanTag, que manda Tampermonkey desde v3.27); sin Tag (script viejo) se usa el nombre y ese jugador se compara por el total, como en §PF473.
  // Una fila repetida del mismo tag y el mismo clan (lectura duplicada) sí reemplaza a la anterior en vez de sumarse.
  var porTag = {}, ordenTags = [], tagsEnVariosClanes = 0;
  for (var j = 0; j < participantesPayload.length; j++) {
    var q = participantesPayload[j] || {};
    var tagQ = String(q.tag || '').trim().toUpperCase();
    if (!tagQ) { omitidos++; continue; }
    var dQ = Number(q.decksHoy), fQ = Number(q.fameSemana), bQ = Number(q.barcosSemana);
    if (isNaN(dQ) || isNaN(fQ) || isNaN(bQ)) { omitidos++; continue; }
    var clanQ = String(q.clan || '').trim();
    var clanTagQ = _tagClanRiverRace_(q.clanTag);
    var claveClanQ = clanTagQ || clanQ;
    if (!porTag[tagQ]) { porTag[tagQ] = { clanes: {}, nClanes: 0, sinClanTag: false }; ordenTags.push(tagQ); }
    if (!clanTagQ) porTag[tagQ].sinClanTag = true;
    if (!porTag[tagQ].clanes.hasOwnProperty(claveClanQ)) {
      porTag[tagQ].nClanes++;
      if (porTag[tagQ].nClanes === 2) tagsEnVariosClanes++;
    }
    porTag[tagQ].clanes[claveClanQ] = { decks: dQ, fame: fQ, barcos: bQ, clanTag: clanTagQ };
    procesados++;
  }

  var tagsPorClan = 0, tagsPorTotal = 0, discrepanciasPorClan = 0, supersedidas = 0;

  for (var i = 0; i < ordenTags.length; i++) {
    var tag = ordenTags[i];
    var infoTag = porTag[tag];
    var gClan = guerraPorClan[tag];

    // Cada elemento de `comparaciones` es una comparación independiente: una por clan (modo por clan) o una sola con el total del tag (respaldo).
    // El modo por clan exige que TODAS las filas del jugador esa semana en Guerra tengan un clan identificable por Tag; si no, se compara por el total.
    var comparaciones = [];
    if (!infoTag.sinClanTag && !(gClan && gClan.sinClan)) {
      tagsPorClan++;
      for (var cl in infoTag.clanes) {
        if (!infoTag.clanes.hasOwnProperty(cl)) continue;
        var cq = infoTag.clanes[cl];
        comparaciones.push({ clanTag: cq.clanTag, decks: cq.decks, fame: cq.fame, barcos: cq.barcos, dias: (gClan && gClan.clanes[cq.clanTag]) || {} });
      }
    } else {
      tagsPorTotal++;
      var decksTot = 0, fameTot = 0, barcosTot = 0;
      for (var cl2 in infoTag.clanes) {
        if (!infoTag.clanes.hasOwnProperty(cl2)) continue;
        decksTot += infoTag.clanes[cl2].decks;
        fameTot += infoTag.clanes[cl2].fame;
        barcosTot += infoTag.clanes[cl2].barcos;
      }
      comparaciones.push({ clanTag: '', decks: decksTot, fame: fameTot, barcos: barcosTot, dias: (guerraData[tag] && guerraData[tag][sIdx]) || {} });
    }

    for (var k = 0; k < comparaciones.length; k++) {
      var cmp = comparaciones[k];
      var decksHoy = cmp.decks, fameSemana = cmp.fame, barcosSemana = cmp.barcos;
      var diasCmp = cmp.dias;

      // suma(... ya en Guerra): días de guerra ANTERIORES a hoy (offDia < offDiaHoy) [→ Contexto_Base_Web.md §19B015]
      var sumaPuntajeAnteriores = 0, sumaBarcosAnteriores = 0;
      for (var d = 0; d < offDiaHoy; d++) {
        var diaPrevio = diasCmp['dia_' + d];
        if (diaPrevio) {
          sumaPuntajeAnteriores += diaPrevio.puntaje;
          sumaBarcosAnteriores += diaPrevio.barcos;
        }
      }

      var ataquesHoy = decksHoy;
      var puntajeHoy = Math.min(Math.max(fameSemana - sumaPuntajeAnteriores, 0), 900);
      var barcosHoy = Math.max(barcosSemana - sumaBarcosAnteriores, 0);

      var diaHoyActual = diasCmp['dia_' + offDiaHoy];
      var actual = diaHoyActual
        ? { ataques: diaHoyActual.ataques, puntaje: diaHoyActual.puntaje, barcos: diaHoyActual.barcos }
        : { ataques: 0, puntaje: 0, barcos: 0 }; // sin fila todavía hoy en Guerra para este tag (y clan, en el modo por clan)

      if (ataquesHoy === actual.ataques && puntajeHoy === actual.puntaje && barcosHoy === actual.barcos) {
        continue; // sin discrepancia -> no se genera ninguna fila (mismo criterio que el resto del diseño)
      }

      // RESUELTO (22-ago-2026, pedido del usuario): la clave de dedup del CSV [→ Contexto_Base_Web.md §19B016]
      // §PF474: en el modo por clan la clave lleva además el Tag del clan; así un jugador en dos clanes puede tener una fila pendiente por clan.
      var claveTotal = temporada + '|' + semana + '|' + tag + '|' + offDiaHoy;
      var clave = cmp.clanTag ? claveTotal + '|' + cmp.clanTag : claveTotal;
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
      if (cmp.clanTag) {
        discrepanciasPorClan++;
        // Una fila Pendiente del mismo tag y día calculada por el total (sin clan) queda reemplazada por las de cada clan: aplicar las dos pisaría los valores por clan.
        if (mapa[claveTotal] && mapa[claveTotal].estado === 'Pendiente') {
          delete mapa[claveTotal];
          supersedidas++;
          Logger.log('[RiverRace] ' + claveTotal + ': la fila Pendiente por total queda reemplazada por las filas por clan.');
        }
      }
      mapa[clave] = {
        temporada: temporada, semana: semana, tag: tag, clanTag: cmp.clanTag,
        ataquesHoyDetectado: ataquesHoy, ataquesHoyActual: actual.ataques,
        puntajeHoyDetectado: puntajeHoy, puntajeHoyActual: actual.puntaje,
        barcosHoyDetectado: barcosHoy, barcosHoyActual: actual.barcos,
        fameSemanaDetectado: fameSemana, barcosSemanaDetectado: barcosSemana,
        fechaDeteccion: ahora, fechaDeteccionTs: ahoraTs, estado: 'Pendiente', implementado: '', diaGuerra: offDiaHoy
      };
    }
  }

  _guardarPendientesRiverRace(mapa);

  Logger.log('[RiverRace] Verificación semana en curso — Temporada ' + temporada + ', Semana ' + semana +
    ': ' + procesados + ' procesado(s), ' + discrepancias + ' discrepancia(s) nueva(s) (' + discrepanciasPorClan + ' por clan), ' +
    yaResueltas + ' con fila ya resuelta (no sobreescrita), ' + omitidos + ' omitido(s), ' + tagsEnVariosClanes + ' tag(s) en más de un clan; ' +
    tagsPorClan + ' tag(s) comparado(s) por clan y ' + tagsPorTotal + ' por el total (sin Tag de clan en el envío o en alguna fila de Guerra).');

  return { ok: true, procesados: procesados, discrepancias: discrepancias, yaResueltas: yaResueltas, omitidos: omitidos, tagsEnVariosClanes: tagsEnVariosClanes,
    tagsPorClan: tagsPorClan, tagsPorTotal: tagsPorTotal, discrepanciasPorClan: discrepanciasPorClan, supersedidas: supersedidas };
}

/**
 * _tagClanRiverRace_(t) (§PF474): Tag de clan normalizado ('#' + mayúsculas), o '' si viene vacío. Acepta con o sin '#'.
 */
function _tagClanRiverRace_(t) {
  var s = String(t === undefined || t === null ? '' : t).trim().toUpperCase().replace(/^#+/, '');
  return s ? '#' + s : '';
}

/**
 * _clanTagFilaGuerraRiverRace_(fila, mapaNombreATag) (§PF474): Tag del clan de una fila de la hoja Guerra. Primero Clan_Tag; si está vacío, la columna Clan
 * (filas anteriores a §PF419 guardaban ahí el Tag; las demás, el nombre, que se resuelve con _mapaNombreClanATagTerna()). '' si no se puede identificar.
 */
function _clanTagFilaGuerraRiverRace_(fila, mapaNombreATag) {
  var tg = _tagClanRiverRace_(fila[GC.CLAN_TAG - 1]);
  if (tg) return tg;
  var crudo = String(fila[GC.CLAN - 1] || '').trim();
  if (!crudo) return '';
  if (/^#[0-9A-Za-z]+$/.test(crudo)) return _tagClanRiverRace_(crudo);
  var viaNombre = mapaNombreATag && mapaNombreATag[crudo.toLowerCase()];
  return viaNombre ? _tagClanRiverRace_(viaNombre) : '';
}

/**
 * _getGuerraPorClanParaRiverRace_(ctx, sIdx) (§PF474): lo que la hoja Guerra tiene de la semana en curso, por jugador y por clan (Tag), día de guerra a día de guerra.
 * Devuelve { '#TAG': { sinClan: bool, clanes: { '#CLAN': { dia_0: {ataques, puntaje, barcos}, ... } } } } con el mismo cálculo por día que
 * _procesarFilasGuerraParaControl() + _sumarEntreClanesSemanaControl_() (22_ControlCalendario.gs), pero sin sumar entre clanes: puntaje = fame de hoy menos la de ayer
 * del mismo clan (tope 900) y barcos = acumulado de hoy menos el de ayer del mismo clan. sinClan = true si alguna fila del jugador esa semana no tiene clan identificable.
 */
function _getGuerraPorClanParaRiverRace_(ctx, sIdx) {
  var res = {};
  var sh = _getSs().getSheetByName(CFG.SHEETS.GUERRA);
  if (!sh || sh.getLastRow() < 2) return res;
  var data = (_GUERRA_MEMO_ACTIVO && _GUERRA_HOJA_MEMO)
    ? _GUERRA_HOJA_MEMO
    : sh.getRange(2, 1, sh.getLastRow() - 1, GUERRA_TOTAL_COLS).getValues();
  var mapaNombreATag = _mapaNombreClanATagTerna();
  var crudo = {}; // tag -> Tag de clan -> periodIndex -> { fameUlt, barcos, ataques }

  for (var i = 0; i < data.length; i++) {
    var fila = data[i];
    if (String(ctx.temporada) !== String(fila[GC.TEMPORADA - 1] || '')) continue;
    if (Number(fila[GC.SEMANA - 1] || 1) - 1 !== sIdx) continue;
    var pIdx = Number(fila[GC.PERIOD_IDX - 1] || 0);
    var tag = String(fila[GC.TAG - 1] || '').trim();
    if (!tag || !esDiaGuerraIdx(pIdx)) continue;

    if (!res[tag]) res[tag] = { sinClan: false, clanes: {} };
    var clanTag = _clanTagFilaGuerraRiverRace_(fila, mapaNombreATag);
    if (!clanTag) { res[tag].sinClan = true; continue; }

    if (!crudo[tag]) crudo[tag] = {};
    if (!crudo[tag][clanTag]) crudo[tag][clanTag] = {};
    var fame = Number(fila[GC.FAME - 1]) || 0;
    var barcos = Number(fila[GC.BARCOS - 1]) || 0;
    var ataques = Number(fila[GC.ATAQUES_HOY - 1]) || 0;
    var e = crudo[tag][clanTag][pIdx];
    if (!e) {
      crudo[tag][clanTag][pIdx] = { fameUlt: fame, barcos: barcos, ataques: ataques };
    } else {
      e.fameUlt = fame;
      if (barcos > e.barcos) e.barcos = barcos;
      if (ataques > e.ataques) e.ataques = ataques;
    }
  }

  for (var tg in crudo) {
    for (var ct in crudo[tg]) {
      var porP = crudo[tg][ct];
      var dias = {};
      for (var d = 0; d < 4; d++) {
        var pHoy = sIdx * 7 + 3 + d;
        var hoy = porP[pHoy];
        if (!hoy) continue;
        var ayer = porP[pHoy - 1];
        dias['dia_' + d] = {
          ataques: hoy.ataques,
          puntaje: Math.min(Math.max(hoy.fameUlt - (ayer ? ayer.fameUlt : 0), 0), 900),
          barcos: Math.max(hoy.barcos - (ayer ? ayer.barcos : 0), 0)
        };
      }
      res[tg].clanes[ct] = dias;
    }
  }
  return res;
}

/**
 * _clavePendienteRiverRace_(f) (§PF474): clave de una fila de Correcciones_RiverRace_Pendientes.csv: temporada|semana|tag|día, y |Tag del clan si la fila lo trae.
 * Es la misma clave que arma _procesarVerificacionRiverRace() al detectar.
 */
function _clavePendienteRiverRace_(f) {
  var base = String(f[CRC.TEMPORADA - 1] || '').trim() + '|' + String(f[CRC.SEMANA - 1] || '').trim() + '|' +
    String(f[CRC.TAG - 1] || '').trim() + '|' + _offDiaFilaPendienteRiverRace_(f);
  var ct = _tagClanRiverRace_(f[CRC.CLANTAG - 1]);
  return ct ? base + '|' + ct : base;
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
    var clave = _clavePendienteRiverRace_(f); // §PF471: el día sale de DiaGuerra si está (si no, el día calendario; -1 de 00:00 a 05:00). §PF474: lleva |Tag del clan si la fila lo trae.
    mapa[clave] = {
      temporada: temporada, semana: semana, tag: tag, clanTag: _tagClanRiverRace_(f[CRC.CLANTAG - 1]),
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
      implementado:   String(f[CRC.IMPLEMENTADO - 1] || ''),
      diaGuerra:      _diaGuerraGuardadoRiverRace_(f)
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
    var porTagCmp = String(pa[2]).localeCompare(String(pb[2]));
    if (porTagCmp !== 0) return porTagCmp;
    // §PF474: dentro del mismo jugador, por día de guerra y luego por clan (un jugador en dos clanes puede tener dos filas el mismo día).
    var diaA = Number(pa[3]), diaB = Number(pb[3]);
    if (diaA !== diaB) return diaA - diaB;
    return String(pa[4] || '').localeCompare(String(pb[4] || ''));
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
      v.fechaDeteccion, v.fechaDeteccionTs || 0, v.estado, v.implementado,
      (v.diaGuerra === undefined ? '' : v.diaGuerra),
      v.clanTag || '' // §PF474: Clan_Tag; vacío = comparado por el total del tag
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

/**
 * _diaGuerraGuardadoRiverRace_(f) (§PF471): día de guerra (0=Jueves..3=Domingo) guardado en la columna DiaGuerra de una fila, o '' si no lo tiene (filas anteriores al 15-nov-2026).
 */
function _diaGuerraGuardadoRiverRace_(f) {
  var v = f[CRC.DIAGUERRA - 1];
  if (v === undefined || v === null || String(v).trim() === '') return '';
  var n = Number(v);
  return (n >= 0 && n <= 3 && n === Math.floor(n)) ? n : '';
}

/**
 * _offDiaFilaPendienteRiverRace_(f) (§PF471): día de guerra de una fila de Correcciones_RiverRace_Pendientes.csv.
 * Con DiaGuerra, ese. Sin él (filas viejas), el día calendario del timestamp; pero de 00:00 a 05:00 (Lima) el día calendario no es el de guerra, así que devuelve -1 (no se adivina).
 */
function _offDiaFilaPendienteRiverRace_(f) {
  var guardado = _diaGuerraGuardadoRiverRace_(f);
  if (guardado !== '') return guardado;
  var ts = Number(f[CRC.FECHADETECCION_TS - 1]) || 0;
  if (!ts) return -1;
  var horaLima = Number(Utilities.formatDate(new Date(ts), 'America/Lima', 'H'));
  if (horaLima < 5) return -1;
  return _offDiaDesdeTimestamp(ts);
}

/**
 * _enVentanaCambioDiaGuerra_() (§PF471): true si ahora es la ventana en que cada clan cambia de día de guerra (BLG_VENTANA_CAMBIO_UTC, 18_CorreccionGuerra.gs: 09:00 a 10:00 UTC = 04:00 a 05:00 Lima).
 */
function _enVentanaCambioDiaGuerra_() {
  var h = new Date().getUTCHours();
  return h >= BLG_VENTANA_CAMBIO_UTC.desde && h < BLG_VENTANA_CAMBIO_UTC.hasta;
}
