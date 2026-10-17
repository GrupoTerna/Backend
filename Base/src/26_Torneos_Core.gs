// ==============================================================================
// 26_Torneos_Core.gs
// Módulo de Torneos (RoyaleAPI) — hojas T_Lista, T_Asistencia y T_Control.
// =============================================================================

// PLAN EN CURSO — Rediseño T_Lista (30 -> 43 columnas) + creatorTag real + [→ Contexto_Base_Web.md §26B001]

// PLAN EN CURSO — Bloqueo de Organizador manual tras Link_app + reparación [→ Contexto_Base_Web.md §26B002]

// ----- Variables y constantes -----


// CAMBIOS REALIZADOS: [→ Contexto_Base_Web.md §26B003]


// Índices de columna (1-based) — T_Lista, T_Asistencia y columnas fijas de [→ Contexto_Base_Web.md §26B004]
var TL = {
  NUM:1, TEMPORADA:2, SEMANAS:3, FECHA:4, HORA:5, CREACION:6, ID:7,
  TAG_TOR:8, TAG_TOR_2:9, NOMBRE:10, TIPO:11, CONTRASENA:12,
  NIVEL_TOPE:13, PARTICIPANTES:14, CAPACIDAD:15, MODO_ID:16, MODO:17,
  PREPARACION:18, DURACION:19, ORGANIZADOR:20, NOM_MULTI_ORG:21,
  TAG_ORG:22, CLAN:23, CLAN_TAG:24, PREMIOS:25, ESTADO:26,
  MIN_T_C1:27, MIN_T_C2:28, MIN_T_C3:29, MIN_T_C4:30,
  ATAQUES_C1:31, ATAQUES_C2:32, ATAQUES_C3:33, ATAQUES_C4:34,
  BARCOS:35, MIEMBRO_ACTIVO:36, REACCION:37, WHATSAPP:38,
  LINK_APP:39, LINK_JSON:40, LINK_JSON_2:41, DESCRIPCION:42, COMENTARIO:43,
  // Fase 9 (25-sep-2026, plan T_Lista -- ver docblock "PLAN EN CURSO" más [→ Contexto_Base_Web.md §26B005]
  ORGANIZADOR_FUENTE:44
};

var TL_TOTAL_COLS = 44;

// Arrays auxiliares -- índice 0 = C1 (clan principal) .. índice 3 = C4 [→ Contexto_Base_Web.md §26B006]
var TL_MIN_T_COLS = [TL.MIN_T_C1, TL.MIN_T_C2, TL.MIN_T_C3, TL.MIN_T_C4];
var TL_ATAQUES_COLS = [TL.ATAQUES_C1, TL.ATAQUES_C2, TL.ATAQUES_C3, TL.ATAQUES_C4];

// FASE (07-sep-2026, pedido del usuario): SL -- índices de columna (1-based) [→ Contexto_Base_Web.md §26B007]
var SL = {
  NUM:1, TEMPORADA:2, FECHA:3, HORA:4, ID:5, ID_2:6, ORGANIZADOR:7, TAG_ORG:8,
  CLAN:9, CLAN_TAG:10, PREMIOS:11, SEMANAS:12,
  MIN_S_C1:13, MIN_S_C2:14, MIN_S_C3:15, MIN_S_C4:16, MIN_S_DELTA:17,
  ATAQUES_C1:18, ATAQUES_C2:19, ATAQUES_C3:20, ATAQUES_C4:21,
  TORNEOS_C1:22, TORNEOS_C2:23, TORNEOS_C3:24, TORNEOS_C4:25,
  BARCOS:26, MIEMBRO_ACTIVO:27, REACCION:28, WHATSAPP:29, ESTADO:30, COMENTARIO:31
};

var SL_TOTAL_COLS = 31;

var SL_MIN_S_COLS = [SL.MIN_S_C1, SL.MIN_S_C2, SL.MIN_S_C3, SL.MIN_S_C4];
var SL_ATAQUES_COLS = [SL.ATAQUES_C1, SL.ATAQUES_C2, SL.ATAQUES_C3, SL.ATAQUES_C4];
var SL_TORNEOS_COLS = [SL.TORNEOS_C1, SL.TORNEOS_C2, SL.TORNEOS_C3, SL.TORNEOS_C4];

// NUEVO (13-sep-2026, pedido del usuario): CR -- índices de columna [→ Contexto_Base_Web.md §26B008]
var CR = {
  NUM:1, TEMPORADA:2, SEMANAS:3, FECHA:4, HORA:5, ID:6, ORGANIZADOR:7,
  TAG_ORG:8, CLAN:9, CLAN_TAG:10, TIPO:11,
  MIN_CR_MIEMBRO_C1:12,  MIN_CR_MIEMBRO_C2:13,  MIN_CR_MIEMBRO_C3:14,  MIN_CR_MIEMBRO_C4:15,
  MIN_CR_VETERANO_C1:16, MIN_CR_VETERANO_C2:17, MIN_CR_VETERANO_C3:18, MIN_CR_VETERANO_C4:19,
  MIN_CR_COLIDER_C1:20,  MIN_CR_COLIDER_C2:21,  MIN_CR_COLIDER_C3:22,  MIN_CR_COLIDER_C4:23,
  ATAQUES_MIEMBRO_C1:24,  ATAQUES_MIEMBRO_C2:25,  ATAQUES_MIEMBRO_C3:26,  ATAQUES_MIEMBRO_C4:27,
  ATAQUES_VETERANO_C1:28, ATAQUES_VETERANO_C2:29, ATAQUES_VETERANO_C3:30, ATAQUES_VETERANO_C4:31,
  ATAQUES_COLIDER_C1:32,  ATAQUES_COLIDER_C2:33,  ATAQUES_COLIDER_C3:34,  ATAQUES_COLIDER_C4:35,
  BARCOS:36, MIEMBRO_ACTIVO:37, WHATSAPP:38, ESTADO:39, COMENTARIO:40
};

var CR_TOTAL_COLS = 40;

// Arrays auxiliares por rol -- mismo criterio que TL_MIN_T_COLS/ [→ Contexto_Base_Web.md §26B009]
var CR_MIN_CR_COLS = {
  MIEMBRO:  [CR.MIN_CR_MIEMBRO_C1,  CR.MIN_CR_MIEMBRO_C2,  CR.MIN_CR_MIEMBRO_C3,  CR.MIN_CR_MIEMBRO_C4],
  VETERANO: [CR.MIN_CR_VETERANO_C1, CR.MIN_CR_VETERANO_C2, CR.MIN_CR_VETERANO_C3, CR.MIN_CR_VETERANO_C4],
  COLIDER:  [CR.MIN_CR_COLIDER_C1,  CR.MIN_CR_COLIDER_C2,  CR.MIN_CR_COLIDER_C3,  CR.MIN_CR_COLIDER_C4]
};
var CR_ATAQUES_COLS = {
  MIEMBRO:  [CR.ATAQUES_MIEMBRO_C1,  CR.ATAQUES_MIEMBRO_C2,  CR.ATAQUES_MIEMBRO_C3,  CR.ATAQUES_MIEMBRO_C4],
  VETERANO: [CR.ATAQUES_VETERANO_C1, CR.ATAQUES_VETERANO_C2, CR.ATAQUES_VETERANO_C3, CR.ATAQUES_VETERANO_C4],
  COLIDER:  [CR.ATAQUES_COLIDER_C1,  CR.ATAQUES_COLIDER_C2,  CR.ATAQUES_COLIDER_C3,  CR.ATAQUES_COLIDER_C4]
};

// CR_Lista — CR.HORA como HORA REAL, no texto (16-sep-2026, pedido del [→ Contexto_Base_Web.md §26B010]

/**
 * _horaStringADate(fechaBase, horaStr) [→ Contexto_Base_Web.md §26B011]
 */
function _horaStringADate(fechaBase, horaStr) {
  var m = String(horaStr || '').trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  if (!(fechaBase instanceof Date) || isNaN(fechaBase.getTime())) return null;
  var h = Number(m[1]), min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return new Date(fechaBase.getFullYear(), fechaBase.getMonth(), fechaBase.getDate(), h, min, 0);
}

/**
 * _formatHoraCanonica(dateVal) [→ Contexto_Base_Web.md §26B012]
 */
function _formatHoraCanonica(dateVal) {
  if (!(dateVal instanceof Date) || isNaN(dateVal.getTime())) return '';
  return Utilities.formatDate(dateVal, 'America/Lima', 'HH:mm:ss');
}

/**
 * _parseHoraCanonica(str, fechaBase) [→ Contexto_Base_Web.md §26B013]
 */
function _parseHoraCanonica(str, fechaBase) {
  var m = String(str || '').trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  var base = (fechaBase instanceof Date && !isNaN(fechaBase.getTime())) ? fechaBase : new Date(1899, 11, 30);
  return new Date(base.getFullYear(), base.getMonth(), base.getDate(), Number(m[1]), Number(m[2]), Number(m[3] || 0));
}

/**
 * _reordenarCRListaPorFecha(ss) [→ Contexto_Base_Web.md §26B014]
 */
function _reordenarCRListaPorFecha(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.CR_LISTA);
  if (!sh) return;
  var lastRow = sh.getLastRow();
  if (lastRow < 4) return; // sin datos, nada que ordenar

  var datos = sh.getRange(4, 1, lastRow - 3, CR_TOTAL_COLS).getValues();
  datos.sort(function (a, b) {
    var fA = a[CR.FECHA - 1] instanceof Date ? a[CR.FECHA - 1].getTime() : -Infinity;
    var fB = b[CR.FECHA - 1] instanceof Date ? b[CR.FECHA - 1].getTime() : -Infinity;
    return fB - fA; // descendente: más reciente primero
  });

  for (var n = 0; n < datos.length; n++) {
    datos[n][CR.NUM - 1] = n + 1;
  }

  sh.getRange(4, 1, datos.length, CR_TOTAL_COLS).setValues(datos);
  Logger.log('[CR_Lista] Hoja reordenada por Fecha (más reciente primero, ' + datos.length + ' fila(s)).');
}

// CR_Lista — generación de ID (FASE 1, 13-sep-2026, pedido del usuario, plan [→ Contexto_Base_Web.md §26B015]

/**
 * _generarParIdsCRLista(fecha, ss) [→ Contexto_Base_Web.md §26B016]
 */
function _generarParIdsCRLista(fecha, ss) {
  ss = ss || _getSs();
  var temporada = _calcularTemporadaParaFecha(fecha);
  var semana = _calcularSemanaTorneo(fecha, temporada);

  var lecturaCRIds = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.CR_LISTA, 'Backup_CR_Lista.csv', CR_TOTAL_COLS, 3);
  var datos = lecturaCRIds.filas;
  var numeroEnSemana = _contarParesCRListaEnSemana(datos, temporada, semana);
  var sufijo = Utilities.formatString('%03d', temporada) + '_' + semana + '_' + Utilities.formatString('%02d', numeroEnSemana);

  return {
    idAscenso: 'A_' + sufijo,
    idDescenso: 'D_' + sufijo,
    temporada: temporada,
    semana: semana
  };
}

/**
 * _contarParesCRListaEnSemana(datos, temporada, semana) [→ Contexto_Base_Web.md §26B017]
 */
function _contarParesCRListaEnSemana(datos, temporada, semana) {
  var count = 0;
  for (var i = 0; i < datos.length; i++) {
    var id = String(datos[i][CR.ID - 1] || '').trim();
    if (!id) continue;
    var m = id.match(/^A_(\d{3})_(\d+)_(\d{2})$/);
    if (!m) continue; // solo cuenta Ascenso -- ver docblock de arriba
    if (Number(m[1]) !== temporada) continue;
    if (Number(m[2]) !== semana) continue;
    count++;
  }
  return count + 1;
}

// CR_Lista — autogeneración del par Ascenso/Descenso al inicio de temporada [→ Contexto_Base_Web.md §26B018]

// MOVIDO (05-oct-2026, pedido usuario): activarTriggerAutogenerarCRLista()/desactivarTriggerAutogenerarCRLista() ya [→ Contexto_Base_Web.md §26B019]

/**
 * _esHoyPrimerDiaDeTemporada() [→ Contexto_Base_Web.md §26B020]
 */
function _esHoyPrimerDiaDeTemporada() {
  var hoy = _hoyLimaSinHora();
  var temporadaHoy = _calcularTemporadaParaFecha(hoy);
  var primerDia = primerLunesTemporada(CFG.REF_DEFAULT, temporadaHoy);
  return (hoy.getTime() === primerDia.getTime()) ? temporadaHoy : null;
}

/**
 * _getUltimoParCRLista() [→ Contexto_Base_Web.md §26B021]
 */
function _getUltimoParCRLista() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.CR_LISTA);
  if (!sh || sh.getLastRow() < 4) return { ascenso: null, descenso: null };

  var datos = sh.getRange(4, 1, sh.getLastRow() - 3, CR_TOTAL_COLS).getValues();
  var idAscensoMasReciente = null, fechaMasReciente = null;
  for (var i = 0; i < datos.length; i++) {
    if (String(datos[i][CR.TIPO - 1] || '').trim() !== 'Ascenso') continue;
    var fechaFila = datos[i][CR.FECHA - 1];
    if (!(fechaFila instanceof Date) || isNaN(fechaFila.getTime())) continue;
    if (!fechaMasReciente || fechaFila.getTime() > fechaMasReciente.getTime()) {
      fechaMasReciente = fechaFila;
      idAscensoMasReciente = String(datos[i][CR.ID - 1] || '').trim();
    }
  }
  if (!idAscensoMasReciente) return { ascenso: null, descenso: null };
  return _getParCRListaPorId(idAscensoMasReciente);
}

/**
 * _existeParCRListaParaTemporada(temporada) [→ Contexto_Base_Web.md §26B022]
 */
function _existeParCRListaParaTemporada(temporada) {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.CR_LISTA);
  if (!sh || sh.getLastRow() < 4) return false;

  var datos = sh.getRange(4, 1, sh.getLastRow() - 3, CR_TOTAL_COLS).getValues();
  for (var i = 0; i < datos.length; i++) {
    if (String(datos[i][CR.TIPO - 1] || '').trim() !== 'Ascenso') continue;
    if (Number(datos[i][CR.TEMPORADA - 1]) === Number(temporada)) return true;
  }
  return false;
}

/**
 * _bloqueParaAutogeneracionCRLista(filaParseada) [→ Contexto_Base_Web.md §26B023]
 */
function _bloqueParaAutogeneracionCRLista(filaParseada) {
  if (!filaParseada) {
    return { porClan: [], barcos: undefined, miembroActivo: 'No', whatsapp: 'No', estado: 'Planificado', comentario: '' };
  }
  var porClan = filaParseada.porClan.map(function (b) {
    return {
      clan: b.clan,
      minCR: { miembro: b.minCR.miembro.qty, veterano: b.minCR.veterano.qty, colider: b.minCR.colider.qty },
      ataques: { miembro: b.ataques.miembro.qty, veterano: b.ataques.veterano.qty, colider: b.ataques.colider.qty }
    };
  });
  return {
    porClan: porClan,
    barcos: filaParseada.barcos.activo ? filaParseada.barcos.qty : undefined,
    miembroActivo: filaParseada.miembroActivo.activo ? 'Sí' : 'No',
    whatsapp: filaParseada.whatsapp.activo ? 'Sí' : 'No',
    estado: 'Planificado',
    comentario: ''
  };
}

/**
 * _autogenerarParCRListaSiCorrespondeInicioTemporada() [→ Contexto_Base_Web.md §26B024]
 */
function _autogenerarParCRListaSiCorrespondeInicioTemporada() {
  var temporadaQueArranca = _esHoyPrimerDiaDeTemporada();
  if (!temporadaQueArranca) {
    Logger.log('[CR_Lista][Autogeneración] Hoy no es el primer día de ninguna temporada, no hay nada que hacer.');
    return { ok: false, motivo: 'Hoy no es primer día de temporada.' };
  }

  if (_existeParCRListaParaTemporada(temporadaQueArranca)) {
    Logger.log('[CR_Lista][Autogeneración] Ya existe un par CR_Lista para la Temporada ' +
      temporadaQueArranca + ', no se crea otro.');
    return { ok: false, motivo: 'Ya existe un par para la Temporada ' + temporadaQueArranca + '.' };
  }

  var temporadaEvaluada = temporadaQueArranca - 1;
  if (temporadaEvaluada < 1) {
    Logger.log('[CR_Lista][Autogeneración] Temporada ' + temporadaQueArranca +
      ' no tiene una temporada anterior que evaluar, no se crea nada.');
    return { ok: false, motivo: 'No hay temporada anterior que evaluar.' };
  }

  var numSemanasEvaluada = _getSemanasDeTemporada(temporadaEvaluada);
  var tokensSemanas = [];
  for (var s = 1; s <= numSemanasEvaluada; s++) tokensSemanas.push('T' + temporadaEvaluada + '_S' + s);
  var semanasCsv = tokensSemanas.join(',');

  var ultimoPar = _getUltimoParCRLista();
  if (!ultimoPar.ascenso && !ultimoPar.descenso) {
    Logger.log('[CR_Lista][Autogeneración] CR_Lista está vacía -- no hay ningún par previo del que duplicar ' +
      'Organizador/Min_CR/Ataques/Otros requisitos. No se crea nada; cargar el primer par a mano.');
    return { ok: false, motivo: 'CR_Lista vacía, no hay par previo del que duplicar.' };
  }

  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.CR_LISTA);
  if (!sh) {
    Logger.log('[CR_Lista][Autogeneración] La hoja CR_Lista no existe.');
    return { ok: false, motivo: 'La hoja CR_Lista no existe.' };
  }

  var hoy = _hoyLimaSinHora();
  var idsNuevos = _generarParIdsCRLista(hoy, ss);

  var comunesAscenso = {
    fecha: hoy, hora: '', semanas: semanasCsv, temporada: temporadaQueArranca,
    organizador: ultimoPar.ascenso ? ultimoPar.ascenso.organizador : '',
    tagOrg:      ultimoPar.ascenso ? ultimoPar.ascenso.tagOrg      : '',
    clan: '', clanTag: ''
  };
  var comunesDescenso = {
    fecha: hoy, hora: '', semanas: semanasCsv, temporada: temporadaQueArranca,
    organizador: ultimoPar.descenso ? ultimoPar.descenso.organizador : '',
    tagOrg:      ultimoPar.descenso ? ultimoPar.descenso.tagOrg      : '',
    clan: '', clanTag: ''
  };

  var filaAscenso  = _construirFilaCRLista(comunesAscenso,  'Ascenso',  idsNuevos.idAscenso,  _bloqueParaAutogeneracionCRLista(ultimoPar.ascenso));
  var filaDescenso = _construirFilaCRLista(comunesDescenso, 'Descenso', idsNuevos.idDescenso, _bloqueParaAutogeneracionCRLista(ultimoPar.descenso));

  var filaBaseSheet = Math.max(sh.getLastRow() + 1, 4);
  filaAscenso[CR.NUM - 1]  = filaBaseSheet - 3;
  filaDescenso[CR.NUM - 1] = filaBaseSheet - 2;

  sh.getRange(filaBaseSheet, 1, 2, CR_TOTAL_COLS).setValues([filaAscenso, filaDescenso]);
  _setDateCell(sh, filaBaseSheet,     CR.FECHA, hoy, 'dd/MM/yyyy');
  _setDateCell(sh, filaBaseSheet + 1, CR.FECHA, hoy, 'dd/MM/yyyy');
  // Hora queda vacía en la autogeneración (comunesAscenso/comunesDescenso [→ Contexto_Base_Web.md §26B025]
  _trySetFmt(sh, filaBaseSheet,     CR.HORA, 'h:mm:ss AM/PM');
  _trySetFmt(sh, filaBaseSheet + 1, CR.HORA, 'h:mm:ss AM/PM');
  applyBorderCenter(sh.getRange(filaBaseSheet, 1, 2, CR_TOTAL_COLS));
  _aplicarDropdownTipoCRLista(ss);
  _aplicarDropdownEstadoCRLista(ss);
  _reordenarCRListaPorFecha(ss);

  var shExtra = ss.getSheetByName(CFG.SHEETS.EXTRA);
  if (shExtra) {
    shExtra.getRange(2, 22).setValue(idsNuevos.idAscenso);  // Ascenso_Vigente_ID
    shExtra.getRange(2, 23).setValue(idsNuevos.idDescenso); // Descenso_Vigente_ID
  } else {
    Logger.log('[CR_Lista][Autogeneración] AVISO: no encontré la hoja Extra, no se guardó el ID vigente.');
  }

  Logger.log('[CR_Lista][Autogeneración] Par nuevo creado para Temporada ' + temporadaQueArranca +
    ' (evalúa Temporada ' + temporadaEvaluada + ', ' + numSemanasEvaluada + ' semana(s)): ' +
    idsNuevos.idAscenso + ' / ' + idsNuevos.idDescenso + '. Guardado como vigente en Extra.');

  return { ok: true, motivo: 'Par creado.', idAscenso: idsNuevos.idAscenso, idDescenso: idsNuevos.idDescenso };
}

// CR_Lista — lectura por ID (FASE 2, 13-sep-2026, pedido del usuario, plan [→ Contexto_Base_Web.md §26B026]

/**
 * _getFilaCRListaPorId(id) [→ Contexto_Base_Web.md §26B027]
 */
function _getFilaCRListaPorId(id) {
  if (!id) return null;
  var ss = _getSs();

  var lecturaCR = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.CR_LISTA, 'Backup_CR_Lista.csv', CR_TOTAL_COLS, 3);
  var datos = lecturaCR.filas;
  if (!datos.length) return null;

  var fila = null;
  for (var i = 0; i < datos.length; i++) {
    if (String(datos[i][CR.ID - 1] || '').trim() === String(id).trim()) {
      fila = datos[i];
      break;
    }
  }
  if (!fila) return null;

  // Barcos: mismo criterio exacto que TL.BARCOS/SL.BARCOS (ver [→ Contexto_Base_Web.md §26B028]
  var celdaBarcos = fila[CR.BARCOS - 1];
  var barcosConfigurado = (celdaBarcos !== '' && celdaBarcos !== null && celdaBarcos !== undefined);
  var barcos = { activo: barcosConfigurado, qty: barcosConfigurado ? (Number(celdaBarcos) || 0) : null };

  // Por clan (mismo orden que CFG.TERNA_TAGS, índice 0 = C1 .. índice 3 = [→ Contexto_Base_Web.md §26B029]
  var porClan = [];
  CFG.TERNA_TAGS.forEach(function (tag, idx) {
    var nombreClan = _getNombreClanDump(tag);
    function bloqueRol(colsPorRol) {
      var qty = Number(fila[colsPorRol[idx] - 1]) || 0;
      return { activo: qty > 0, qty: qty };
    }
    porClan.push({
      clan: nombreClan,
      minCR: {
        miembro:  bloqueRol(CR_MIN_CR_COLS.MIEMBRO),
        veterano: bloqueRol(CR_MIN_CR_COLS.VETERANO),
        colider:  bloqueRol(CR_MIN_CR_COLS.COLIDER)
      },
      ataques: {
        miembro:  bloqueRol(CR_ATAQUES_COLS.MIEMBRO),
        veterano: bloqueRol(CR_ATAQUES_COLS.VETERANO),
        colider:  bloqueRol(CR_ATAQUES_COLS.COLIDER)
      }
    });
  });

  // Fecha: la hoja viva la trae como objeto Date; Backup_CR_Lista.csv la [→ Contexto_Base_Web.md §26B030]
  var fechaCelda = fila[CR.FECHA - 1];
  var fechaResuelta = (fechaCelda instanceof Date) ? fechaCelda : _parseSpanishDate(fechaCelda);

  // Hora: la hoja viva la trae como objeto Date real (ver _horaStringADate()/ [→ Contexto_Base_Web.md §26B031]
  var horaCelda = fila[CR.HORA - 1];
  var horaResuelta = (horaCelda instanceof Date) ? horaCelda : _parseHoraCanonica(horaCelda, fechaResuelta);

  return {
    idFila: String(fila[CR.ID - 1] || '').trim(),
    tipo: String(fila[CR.TIPO - 1] || '').trim(),
    fecha: fechaResuelta,
    hora: horaResuelta,
    organizador: String(fila[CR.ORGANIZADOR - 1] || '').trim(),
    tagOrg: String(fila[CR.TAG_ORG - 1] || '').trim(),
    semanas: _parseSemanasSorteo(fila[CR.SEMANAS - 1]),
    barcos: barcos,
    miembroActivo: { activo: String(fila[CR.MIEMBRO_ACTIVO - 1] || '').trim() === 'Sí' },
    whatsapp: { activo: String(fila[CR.WHATSAPP - 1] || '').trim() === 'Sí' },
    estado: String(fila[CR.ESTADO - 1] || '').trim(),
    comentario: String(fila[CR.COMENTARIO - 1] || '').trim(),
    porClan: porClan
  };
}

/**
 * _getParCRListaPorId(idCualquiera) [→ Contexto_Base_Web.md §26B032]
 */
function _getParCRListaPorId(idCualquiera) {
  var id = String(idCualquiera || '').trim();
  var m = id.match(/^[AD]_(\d{3}_\d+_\d{2})$/);
  if (!m) return { ascenso: null, descenso: null };
  return {
    ascenso: _getFilaCRListaPorId('A_' + m[1]),
    descenso: _getFilaCRListaPorId('D_' + m[1])
  };
}

/**
 * _getRequisitosCambioRangoBloqueCategoria(nombreCategoria) [→ Contexto_Base_Web.md §26B033]
 */
function _getRequisitosCambioRangoBloqueCategoria(nombreCategoria) {
  var tipoCR = (nombreCategoria === 'Ascensos') ? 'Ascenso' : 'Descenso';
  var idVigente = _getIdVigenteExtraCR(tipoCR);
  var filaCR = idVigente ? _getFilaCRListaPorId(idVigente) : null;

  if (!filaCR) {
    if (idVigente) {
      Logger.log('[CambioRango][Progreso] Extra!' + tipoCR + '_Vigente_ID (' + idVigente + ') no matchea ' +
        'ninguna fila real de CR_Lista. Sin respaldo (T_Requisitos dado de baja): se devuelve vacío.');
    } else {
      Logger.log('[CambioRango][Progreso] Extra!' + tipoCR + '_Vigente_ID está vacío. Sin respaldo ' +
        '(T_Requisitos dado de baja): se devuelve vacío.');
    }
    return [];
  }

  // miembroActivo en CR_Lista es un flag GLOBAL de toda la corrida (no [→ Contexto_Base_Web.md §26B034]
  var miembroActivoGlobal = filaCR.miembroActivo;
  return filaCR.porClan.map(function (b) {
    return {
      clan:            b.clan,
      minTMiembro:     b.minCR.miembro,
      minT:            b.minCR.veterano,
      minTColider:     b.minCR.colider,
      ataquesMiembro:  b.ataques.miembro,
      ataquesVeterano: b.ataques.veterano,
      ataquesColider:  b.ataques.colider,
      miembroActivo:   miembroActivoGlobal
    };
  });
}

// CR_Lista — promedio de Fame y Ataques por jugador (FASE 3, 13-sep-2026, [→ Contexto_Base_Web.md §26B035]

/**
 * _esMiembroVigenteEnClanesFamilia(tag) [→ Contexto_Base_Web.md §26B036]
 */
function _esMiembroVigenteEnClanesFamilia(tag) {
  var tagNorm = String(tag || '').trim();
  if (!tagNorm) return false;

  capturarApiClanes_(CFG.CLANES_PROGRESO_MAX_EDAD_MS, 'Torneos_Core');
  if (!CACHE_CLAN_DATA) return false;

  for (var i = 0; i < CFG.TERNA_TAGS.length; i++) {
    var cd = CACHE_CLAN_DATA[CFG.TERNA_TAGS[i]];
    if (!cd || !cd.members) continue;
    for (var j = 0; j < cd.members.length; j++) {
      if (String(cd.members[j].tag || '').trim() === tagNorm) return true;
    }
  }
  return false;
}

/**
 * _getPromediosCRParaJugador(tag, semanas, ctxReal) [→ Contexto_Base_Web.md §26B037]
 */
function _getPromediosCRParaJugador(tag, semanas, ctxReal, porTagPrecalculado, datosPropios) {
  var tagNorm = String(tag || '').trim();
  // FIX (16-sep-2026, pedido del usuario -- "así no hay problema con los [→ Contexto_Base_Web.md §26B038]
  var porTag = porTagPrecalculado || _getTrofeosYAtaquesSemanalesPorTag(semanas, ctxReal, true);
  // NUEVO (28-sep-2026): datosPropios (opcional, solo Cambio de Rango / Descenso) reemplaza [→ Contexto_Base_Web.md §26B039]
  var datos = datosPropios || porTag[tagNorm];
  return {
    fameProm: datos ? (datos.trofeosProm || 0) : 0,
    fameSuma: datos ? (datos.trofeosSuma || 0) : 0, // 28-sep-2026, ver _fameCumpleRequisito() (28_Torneos_Docs.gs)
    ataquesProm: datos ? (datos.ataquesProm || 0) : 0,
    // FIX (16-sep-2026, pedido del usuario -- requisito "Barcos" de Cambio [→ Contexto_Base_Web.md §26B040]
    barcosProm: datos ? (datos.barcosProm || 0) : 0,
    barcosSuma: datos ? (datos.barcosSuma || 0) : 0, // 29-sep-2026, ver _barcosCumplenRequisito() (28_Torneos_Docs.gs)
    // 19-sep-2026: sumatoria real + exonerados + semanas evaluadas, para [→ Contexto_Base_Web.md §26B041]
    ataquesSuma:    datos ? (datos.ataquesSuma || 0) : 0,
    ataquesExentos: datos ? (datos.ataquesExentos || 0) : 0,
    semanasEval:    datos ? (datos.semanasEval || 0) : 0
  };
}

// CR_Lista — motor de comparación elegibles/en riesgo (FASE 4, 13-sep-2026, [→ Contexto_Base_Web.md §26B042]

/**
 * _validarCoherenciaCRLista(filaAscenso, filaDescenso) [→ Contexto_Base_Web.md §26B043]
 */
function _validarCoherenciaCRLista(filaAscenso, filaDescenso) {
  var errores = [];
  var porClanDescenso = {};
  filaDescenso.porClan.forEach(function (b) { porClanDescenso[b.clan] = b; });

  var ROLES = ['miembro', 'veterano', 'colider'];
  var ETIQUETAS_ROL = { miembro: 'Miembro', veterano: 'Veterano', colider: 'Colíder' };

  filaAscenso.porClan.forEach(function (bloqueAsc) {
    var bloqueDesc = porClanDescenso[bloqueAsc.clan];
    if (!bloqueDesc) return; // no debería pasar -- Ascenso y Descenso siempre traen los mismos 4 clanes

    ROLES.forEach(function (rol) {
      var minAsc = bloqueAsc.minCR[rol], minDesc = bloqueDesc.minCR[rol];
      if (minAsc.activo && minDesc.activo && minAsc.qty < minDesc.qty) {
        errores.push(
          bloqueAsc.clan + ' / ' + ETIQUETAS_ROL[rol] + ': Min_CR de Ascenso (' + minAsc.qty +
          ') es MENOR que el de Descenso (' + minDesc.qty + ') -- Ascenso debe ser \u2265 Descenso.'
        );
      }

      var atqAsc = bloqueAsc.ataques[rol], atqDesc = bloqueDesc.ataques[rol];
      if (atqAsc.activo && atqDesc.activo && atqAsc.qty < atqDesc.qty) {
        errores.push(
          bloqueAsc.clan + ' / ' + ETIQUETAS_ROL[rol] + ': Ataques de Ascenso (' + atqAsc.qty +
          ') es MENOR que el de Descenso (' + atqDesc.qty + ') -- Ascenso debe ser \u2265 Descenso.'
        );
      }
    });
  });

  return { ok: errores.length === 0, errores: errores };
}

/**
 * _cumpleRequisitoCR(reqMinCR, reqAtaques, promedios) [→ Contexto_Base_Web.md §26B044]
 */
function _cumpleRequisitoCR(reqMinCR, reqAtaques, reqBarcos, reqMiembroActivo, reqWhatsapp, promedios, esMiembroVigente, wspG) {
  var okMinCR   = !reqMinCR.activo   || _fameCumpleRequisito(promedios, reqMinCR.qty); // sumatoria, 28-sep-2026
  var okAtaques = !reqAtaques.activo || _ataquesCumplenRequisito(promedios, reqAtaques.qty); // sumatoria, 19-sep-2026
  // FIX (16-sep-2026, pedido del usuario): Barcos/Miembro activo/WhatsApp [→ Contexto_Base_Web.md §26B045]
  var okBarcos = !reqBarcos.activo || _barcosCumplenRequisito(promedios, reqBarcos.qty); // sumatoria, 29-sep-2026
  var okMiembroActivo = !reqMiembroActivo.activo || !!esMiembroVigente;
  var okWhatsapp = !reqWhatsapp.activo || String(wspG || '').trim() === 'Sí';
  return okMinCR && okAtaques && okBarcos && okMiembroActivo && okWhatsapp;
}

/**
 * _detalleRequisitoCR(tipoPropuesta, rolKey, reqMinCR, reqAtaques, promedios) [→ Contexto_Base_Web.md §26B046]
 */
// FIX (16-sep-2026, pedido del usuario -- calcar el formato de texto que ya [→ Contexto_Base_Web.md §26B047]
var _ETIQUETAS_ROL_CR_MIN = { miembro: 'miembro', veterano: 'veterano', colider: 'colíder' };

function _destinoRangoCR(tipoPropuesta, rolKey) {
  if (tipoPropuesta === 'EligibleAdmin') return 'admin';
  if (tipoPropuesta === 'Ascenso') {
    if (rolKey === 'miembro')  return 'veterano';
    if (rolKey === 'veterano') return 'colíder';
  }
  if (tipoPropuesta === 'Descenso') {
    if (rolKey === 'miembro')  return 'expulsión';
    if (rolKey === 'veterano') return 'miembro';
    if (rolKey === 'colider')  return 'veterano';
  }
  return null;
}

/**
 * _unirPartesEspanol(arr) [→ Contexto_Base_Web.md §26B048]
 */
function _unirPartesEspanol(arr) {
  if (!arr.length) return '';
  if (arr.length === 1) return arr[0];
  return arr.slice(0, -1).join(', ') + ' y ' + arr[arr.length - 1];
}

function _detalleRequisitoCR(tipoPropuesta, rolKey, reqMinCR, reqAtaques, reqBarcos, reqMiembroActivo, reqWhatsapp, promedios, esMiembroVigente, wspG) {
  var partes = [];
  if (reqAtaques.activo) {
    var okAtaques = _ataquesCumplenRequisito(promedios, reqAtaques.qty); // sumatoria, 19-sep-2026
    var exoneradosTxt = (Number(promedios.ataquesExentos) > 0) ? ', ' + promedios.ataquesExentos + ' exonerados por domingo opcional' : '';
    partes.push((okAtaques ? 'cumple' : 'no cumple') + ' ataques (' + _round1(promedios.ataquesProm) + '/' + reqAtaques.qty + exoneradosTxt + ')');
  }
  if (reqMinCR.activo) {
    var okPuntaje = _fameCumpleRequisito(promedios, reqMinCR.qty); // sumatoria, 28-sep-2026
    partes.push((okPuntaje ? 'cumple' : 'no cumple') + ' medallas (' + _round1(promedios.fameProm) + '/' + reqMinCR.qty + ')');
  }
  if (reqBarcos.activo) {
    var okBarcos = _barcosCumplenRequisito(promedios, reqBarcos.qty); // sumatoria, 29-sep-2026
    // 29-sep-2026 (correccion, pregunta 33 del consolidado): la usuaria pidio que el detalle diga [→ Contexto_Base_Web.md §26B049]
    var valorBarcos = (promedios.barcosSuma !== undefined && promedios.barcosSuma !== null)
      ? promedios.barcosSuma
      : promedios.barcosProm;
    partes.push((okBarcos ? 'cumple' : 'no cumple') + ' barcos (' + _round1(valorBarcos) + '/' + reqBarcos.qty + ')');
  }
  if (reqMiembroActivo.activo) {
    partes.push((esMiembroVigente ? 'cumple' : 'no cumple') + ' miembro activo');
  }
  if (reqWhatsapp.activo) {
    var okWhatsapp = String(wspG || '').trim() === 'Sí';
    partes.push((okWhatsapp ? 'cumple' : 'no cumple') + ' WhatsApp');
  }

  var texto;
  if (!partes.length) {
    texto = 'Sin requisitos activos para ' + rolKey + '.';
  } else {
    var frase = _unirPartesEspanol(partes);
    texto = frase.charAt(0).toUpperCase() + frase.slice(1) + '.';
  }

  var destino = _destinoRangoCR(tipoPropuesta, rolKey);
  if (destino) {
    texto += ' Rango: ' + (_ETIQUETAS_ROL_CR_MIN[rolKey] || rolKey) + ' a ' + destino + '.';
  }
  return texto;
}

/**
 * _round1(n) [→ Contexto_Base_Web.md §26B050]
 */
function _round1(n) {
  return Math.round((Number(n) || 0) * 10) / 10;
}

/**
 * _fechaInicioSemanasCR(semanas) [→ Contexto_Base_Web.md §26B051]
 */
/**
 * _filtrarSemanasJugadasCR(semanas, ctxReal) [→ Contexto_Base_Web.md §26B052]
 */
// 29-sep-2026: YA NO SE USA en Cambio de Rango (reemplazada por _semanasPendientesCR(), opcion B).
// Se deja definida por si otro archivo la referencia.
function _filtrarSemanasJugadasCR(semanas, ctxReal) {
  if (!semanas || !semanas.length || !ctxReal || ctxReal.periodIndexSospechoso) return semanas || [];
  var tempReal = Number(ctxReal.temporada);
  var ultimaTerminadaIdx = Number(ctxReal.sectionIndex) - 1;
  return semanas.filter(function (s) {
    if (Number(s.temporada) < tempReal) return true;
    if (Number(s.temporada) > tempReal) return false;
    return (Number(s.semana) - 1) <= ultimaTerminadaIdx;
  });
}

/**
 * _semanasPendientesCR(semanas, ctxReal) [→ Contexto_Base_Web.md §26B053]
 */
function _semanasPendientesCR(semanas, ctxReal) {
  if (!semanas || !semanas.length || !ctxReal || ctxReal.periodIndexSospechoso) return [];
  var tempReal = Number(ctxReal.temporada);
  var ultimaTerminadaIdx = Number(ctxReal.sectionIndex) - 1;
  return semanas.filter(function (s) {
    if (Number(s.temporada) < tempReal) return false;
    if (Number(s.temporada) > tempReal) return true;
    return (Number(s.semana) - 1) > ultimaTerminadaIdx;
  });
}

/**
 * _textoSemanasPendientesCR(pendientes) [→ Contexto_Base_Web.md §26B054]
 */
function _textoSemanasPendientesCR(pendientes) {
  return (pendientes || []).map(function (s) {
    var txt = 'semana ' + s.semana + ' de la Temporada ' + s.temporada;
    try {
      var r = _getRangoFechasSemana(s.temporada, Number(s.semana) - 1);
      if (r && r.fin) {
        var cierre = new Date(r.fin.getTime());
        cierre.setDate(cierre.getDate() + 1);
        txt += ' (termina el ' + Utilities.formatDate(cierre, 'America/Lima', 'dd/MM/yyyy') + ')';
      }
    } catch (e) { /* sin fecha, el texto igual sirve */ }
    return txt;
  }).join(', ');
}

function _fechaInicioSemanasCR(semanas) {
  if (!semanas || !semanas.length) return null;
  var masAntigua = null;
  semanas.forEach(function (s) {
    if (!masAntigua || s.temporada < masAntigua.temporada ||
        (s.temporada === masAntigua.temporada && s.semana < masAntigua.semana)) {
      masAntigua = s;
    }
  });
  if (!masAntigua) return null;
  var rango = _getRangoFechasSemana(masAntigua.temporada, masAntigua.semana - 1);
  return rango ? rango.inicio : null;
}

// AVISOS ABIERTOS / VERIFICACIONES ABIERTAS -- Cambio de Rango, rendimiento [→ Contexto_Base_Web.md §26B055]

/**
 * _juevesGuerraSemanaCR(temporada, semana) [→ Contexto_Base_Web.md §26B056]
 */
function _juevesGuerraSemanaCR(temporada, semana) {
  var r = _getRangoFechasSemana(temporada, Number(semana) - 1);
  if (!r) return null;
  var j = new Date(r.inicio.getTime());
  j.setDate(j.getDate() + 3);
  return j;
}

/**
 * _bloqueDescensoDesdeSemanasCompletas(semanasCompletas, fechaIngreso, tag, ventanasPorTag) [→ Contexto_Base_Web.md §26B057]
 */
function _bloqueDescensoDesdeSemanasCompletas(semanasCompletas, fechaIngreso, tag, ventanasPorTag) {
  if (!semanasCompletas || !semanasCompletas.length) return null;
  var ing = fechaIngreso ? new Date(fechaIngreso.getFullYear(), fechaIngreso.getMonth(), fechaIngreso.getDate()) : null;
  var cont = semanasCompletas.filter(function (w) {
    // 4-oct-2026 (punto 5 de la 28, opcion A): 'Reconstruido' en 0 nunca cuenta, con o sin Fecha_ing.
    if (w.reconstruido === true && !(w.trofeos > 0) && !(w.ataques > 0) && !(w.barcos > 0)) return false;
    // 4-oct-2026, P2: una semana 'Reconstruido' con actividad se descarta si Historial_I/S confirma que
    // el Tag NO estaba en Terna ese jueves. null (sin historial del Tag) = no verificable = no descarta.
    if (w.reconstruido === true && ventanasPorTag && tag) {
      var jueP2 = _juevesGuerraSemanaCR(w.temporada, w.semana);
      if (jueP2 && _estuvoEnTernaEseJuevesCR_(tag, jueP2, ventanasPorTag) === false) return false;
    }
    if (!ing) return true;
    // 29-sep-2026, P1 (decision de la usuaria, pregunta 30): las filas reales (Original o Corregido) [→ Contexto_Base_Web.md §26B058]
    if (w.reconstruido !== true) return true;
    var jue = _juevesGuerraSemanaCR(w.temporada, w.semana);
    if (!jue) return true;
    return ing.getTime() <= new Date(jue.getFullYear(), jue.getMonth(), jue.getDate()).getTime();
  });
  if (!cont.length) return null;
  var n = cont.length, sT = 0, sA = 0, sB = 0, sE = 0;
  cont.forEach(function (w) { sT += w.trofeos; sA += w.ataques; sB += w.barcos; sE += w.exentos; });
  return {
    trofeosProm: sT / n, trofeosSuma: sT, ataquesProm: sA / n, barcosProm: sB / n, barcosSuma: sB,
    ataquesSuma: sA, ataquesExentos: sE, semanasEval: n
  };
}

/**
 * _estuvoEnTernaEseJuevesCR_(tag, jueves, ventanasPorTag) [→ Contexto_Base_Web.md §26B059]
 */
function _estuvoEnTernaEseJuevesCR_(tag, jueves, ventanasPorTag) {
  var ini = new Date(jueves.getFullYear(), jueves.getMonth(), jueves.getDate(), 0, 0, 0);
  var fin = new Date(jueves.getFullYear(), jueves.getMonth(), jueves.getDate(), 23, 59, 59);
  var a = _tagEstuvoEnTernaEnFecha(tag, ini, ventanasPorTag);
  var b = _tagEstuvoEnTernaEnFecha(tag, fin, ventanasPorTag);
  if (a === null || b === null) return null;
  return a || b;
}

/**
 * _ventanasHistorialParaDescensoCR_() [→ Contexto_Base_Web.md §26B060]
 */
function _ventanasHistorialParaDescensoCR_() {
  try {
    return _construirVentanasMembresiaTernaPorTag() || {};
  } catch (e) {
    Logger.log('[Cambio de Rango P2] No se pudo leer Historial_I/S; el Descenso sigue sin ese veto: ' + e);
    return {};
  }
}

/**
 * _notaSemanasContadasCR(contadas, total)
 * 28-sep-2026: aclaracion para detalle cuando el Descenso conto menos semanas que la corrida.
 */
function _notaSemanasContadasCR(contadas, total) {
  if (!(contadas > 0) || contadas >= total) return '';
  return ' Semanas contadas: ' + contadas + ' de ' + total + ' (no se cuentan las semanas en que ingresó después del inicio de la guerra, las semanas reconstruidas sin actividad ni las reconstruidas de cuando Historial_I/S indica que no estaba en Terna).';
}

/**
 * _esAdminEnDirectorioCR(valor) [→ Contexto_Base_Web.md §26B061]
 */
function _esAdminEnDirectorioCR(valor) {
  var t = String(valor === null || valor === undefined ? '' : valor).trim().toLowerCase();
  return t === 'sí' || t === 'si';
}

/**
 * _calcularPropuestasCambioRango(idAscenso, idDescenso) [→ Contexto_Base_Web.md §26B062]
 */
function _calcularPropuestasCambioRango(idAscenso, idDescenso) {
  // FIX (16-sep-2026, pedido del usuario -- ver docblock de [→ Contexto_Base_Web.md §26B063]
  _ULTIMO_DIAGNOSTICO_GUERRA_CSV = null;

  var filaAscenso  = _getFilaCRListaPorId(idAscenso);
  var filaDescenso = _getFilaCRListaPorId(idDescenso);
  if (!filaAscenso || !filaDescenso) {
    return {
      ok: false,
      error: 'No encontré una o ambas filas de CR_Lista (' + idAscenso + ' / ' + idDescenso + ').',
      propuestas: []
    };
  }

  // Restricción (13-sep-2026, pedido del usuario): Ascenso siempre debe [→ Contexto_Base_Web.md §26B064]
  var coherencia = _validarCoherenciaCRLista(filaAscenso, filaDescenso);
  if (!coherencia.ok) {
    return {
      ok: false,
      error: 'CR_Lista tiene requisitos incoherentes entre Ascenso y Descenso (' +
        idAscenso + ' / ' + idDescenso + '): ' + coherencia.errores.join(' | '),
      propuestas: []
    };
  }

  var ss = _getSs();
  var ctxReal = _getCtx();

  // CAMBIO (29-sep-2026, pedido de la usuaria, opcion B): la corrida se evalua con TODAS sus [→ Contexto_Base_Web.md §26B065]
  var pendientesAsc  = _semanasPendientesCR(filaAscenso.semanas, ctxReal);
  var pendientesDesc = _semanasPendientesCR(filaDescenso.semanas, ctxReal);
  if (pendientesAsc.length || pendientesDesc.length) {
    return {
      ok: false,
      error: 'Esta corrida evalúa semanas que todavía no terminan: ' +
        _textoSemanasPendientesCR(pendientesAsc.length ? pendientesAsc : pendientesDesc) +
        '. Las propuestas se calculan cuando terminen todas las semanas de la corrida.',
      propuestas: []
    };
  }
  if (!filaAscenso.semanas.length || !filaDescenso.semanas.length) {
    return {
      ok: false,
      error: 'Esta corrida no tiene semanas que evaluar.',
      propuestas: []
    };
  }

  // Índice por nombre de clan (mismo nombre que devuelve _getNombreClanDump(), [→ Contexto_Base_Web.md §26B066]
  var porClanAscenso = {};
  filaAscenso.porClan.forEach(function (b) { porClanAscenso[b.clan] = b; });
  var porClanDescenso = {};
  filaDescenso.porClan.forEach(function (b) { porClanDescenso[b.clan] = b; });

  // Cache de promedios por (tag + corrida): un mismo jugador puede [→ Contexto_Base_Web.md §26B067]
  var mismasSemanasAD = JSON.stringify(filaAscenso.semanas) === JSON.stringify(filaDescenso.semanas);
  // 28-sep-2026: el 4.o parametro (true) agrega el detalle de semanas completas por jugador que [→ Contexto_Base_Web.md §26B068]
  var porTagAscenso = _getTrofeosYAtaquesSemanalesPorTag(filaAscenso.semanas, ctxReal, true, mismasSemanasAD);
  var diagAscenso = _ULTIMO_DIAGNOSTICO_GUERRA_CSV;
  var porTagDescenso = porTagAscenso;
  var diagDescenso = diagAscenso;
  if (!mismasSemanasAD) {
    porTagDescenso = _getTrofeosYAtaquesSemanalesPorTag(filaDescenso.semanas, ctxReal, true, true);
    diagDescenso = _ULTIMO_DIAGNOSTICO_GUERRA_CSV;
  }
  _ULTIMO_DIAGNOSTICO_GUERRA_CSV = diagDescenso || diagAscenso || null;
  // 4-oct-2026, P2: ventanas de Historial_I/S, leidas una sola vez por corrida.
  var ventanasHist = _ventanasHistorialParaDescensoCR_();

  var cachePromedios = {};
  function promediosCache(tag, semanas, sufijoCache) {
    var key = tag + '|' + sufijoCache;
    if (!cachePromedios[key]) {
      cachePromedios[key] = _getPromediosCRParaJugador(tag, semanas, ctxReal, (sufijoCache === 'A') ? porTagAscenso : porTagDescenso);
    }
    return cachePromedios[key];
  }

  // FIX (16-sep-2026, pedido del usuario -- requisito "Miembro activo"): un [→ Contexto_Base_Web.md §26B069]
  var cacheMiembroVigente = {};
  function miembroVigenteCache(tag) {
    if (!(tag in cacheMiembroVigente)) {
      cacheMiembroVigente[tag] = _esMiembroVigenteEnClanesFamilia(tag);
    }
    return cacheMiembroVigente[tag];
  }

  // FIX (16-sep-2026, pedido del usuario -- ver docblock de [→ Contexto_Base_Web.md §26B070]
  var fechaInicioAscenso  = _fechaInicioSemanasCR(filaAscenso.semanas);
  var fechaInicioDescenso = _fechaInicioSemanasCR(filaDescenso.semanas);

  var dataDir = _leerDirectorioFisicoComoDC(ss);
  var propuestas = [];
  // 28-sep-2026: orden de los clanes = orden de CFG.TERNA_TAGS (indice 0 = principal, 3 = Mini);
  // _getFilaCRListaPorId() ya arma porClan en ese orden, asi que no hace falta otra consulta.
  var ordenClanesCR = filaAscenso.porClan.map(function (b) { return b.clan; });

  for (var i = 0; i < dataDir.length; i++) {
    var fila = dataDir[i];
    if (String(fila[DC.ESTADO - 1] || '').trim() !== 'Activo') continue;

    var clan = String(fila[DC.CLAN - 1] || '').trim();
    var bloqueAsc  = porClanAscenso[clan];
    var bloqueDesc = porClanDescenso[clan];
    if (!bloqueAsc && !bloqueDesc) continue; // clan fuera de este par de CR_Lista

    var rangoActual = String(fila[DC.RANGO - 1] || '').trim();
    var rangoNorm = rangoActual.toLowerCase().replace('í', 'i').replace('é', 'e');
    if (rangoNorm === 'lider') continue; // Líder: completamente afuera (confirmado)

    var rolKey = null;
    if (rangoNorm === 'miembro')  rolKey = 'miembro';
    else if (rangoNorm === 'veterano') rolKey = 'veterano';
    else if (rangoNorm === 'colider')  rolKey = 'colider';
    if (!rolKey) continue; // Rango no reconocido (dato sucio): se ignora, no se propone nada

    var tag = String(fila[DC.TAG - 1] || '').trim();
    var nombre = String(fila[DC.NOMBRE - 1] || '').trim();
    // FIX (16-sep-2026, pedido del usuario -- requisito "WhatsApp"): mismo
    // dato que ya usa el Directorio para la columna WSP(G) -- 'Sí'/'No'.
    var wspG = String(fila[DC.WSP_G - 1] || '').trim();

    // FIX (16-sep-2026, pedido del usuario -- ver docblock de [→ Contexto_Base_Web.md §26B071]
    var fechaIngCelda = fila[DC.FECHA_ING - 1];
    var fechaIngreso = (fechaIngCelda instanceof Date && !isNaN(fechaIngCelda.getTime())) ? fechaIngCelda : null;
    // 28-sep-2026: el Descenso ya NO se bloquea entero por Fecha_ing posterior al inicio de la [→ Contexto_Base_Web.md §26B072]

    // --- Descenso: mismo patrón para los 3 rangos (Miembro/Veterano/Colíder) ---
    if (bloqueDesc) {
      var reqMinCRDesc  = bloqueDesc.minCR[rolKey];
      var reqAtaquesDesc = bloqueDesc.ataques[rolKey];
      // 28-sep-2026 (decision del usuario): solo cuentan las semanas completas de ESTE jugador;
      // sin ninguna semana contada no se propone nada (no estaba, o es nuevo).
      var blqDesc = _bloqueDescensoDesdeSemanasCompletas((porTagDescenso[tag] || {}).semanasCompletas, fechaIngreso, tag, ventanasHist);
      var promDesc = blqDesc ? _getPromediosCRParaJugador(tag, filaDescenso.semanas, ctxReal, porTagDescenso, blqDesc) : null;
      // FIX (16-sep-2026, pedido del usuario): Barcos/Miembro activo/ [→ Contexto_Base_Web.md §26B073]
      var miembroVigenteDesc = (promDesc && filaDescenso.miembroActivo.activo) ? miembroVigenteCache(tag) : false;
      if (promDesc && !_cumpleRequisitoCR(reqMinCRDesc, reqAtaquesDesc, filaDescenso.barcos, filaDescenso.miembroActivo, filaDescenso.whatsapp, promDesc, miembroVigenteDesc, wspG)) {
        propuestas.push({
          tag: tag,
          nombre: nombre,
          clan: clan,
          rangoActual: rangoActual,
          tipoPropuesta: 'Descenso',
          detalle: _detalleRequisitoCR('Descenso', rolKey, reqMinCRDesc, reqAtaquesDesc, filaDescenso.barcos, filaDescenso.miembroActivo, filaDescenso.whatsapp, promDesc, miembroVigenteDesc, wspG) + _notaSemanasContadasCR(promDesc.semanasEval, filaDescenso.semanas.length),
          // FASE 8 (13-sep-2026, pedido del usuario -- doc "Ascensos y [→ Contexto_Base_Web.md §26B074]
          ataquesProm: promDesc.ataquesProm,
          fameProm: promDesc.fameProm,
          barcosProm: promDesc.barcosProm,
          // 4-oct-2026 (decision de la usuaria, opcion B de barcos): suma de ataques a barcos de las [→ Contexto_Base_Web.md §26B075]
          barcosSuma: promDesc.barcosSuma,
          // NUEVO (16-sep-2026, pedido del usuario -- primer paso chico [→ Contexto_Base_Web.md §26B076]
          umbralAtaques: reqAtaquesDesc,
          umbralPuntaje: reqMinCRDesc,
          umbralBarcos: filaDescenso.barcos,
          // NUEVO (16-sep-2026, pedido del usuario -- cuarto paso chico, [→ Contexto_Base_Web.md §26B077]
          cumpleAtaques: reqAtaquesDesc.activo ? _ataquesCumplenRequisito(promDesc, reqAtaquesDesc.qty) : null,
          cumplePuntaje: reqMinCRDesc.activo   ? _fameCumpleRequisito(promDesc, reqMinCRDesc.qty) : null,
          cumpleBarcos:  filaDescenso.barcos.activo ? _barcosCumplenRequisito(promDesc, filaDescenso.barcos.qty) : null
        });
      }
    }

    // --- Ascenso: Miembro/Veterano generan propuesta real; Colíder solo
    // "elegible para administración" (sin generar ascenso de rango) ---
    if (bloqueAsc) {
      var reqMinCRAsc  = bloqueAsc.minCR[rolKey];
      var reqAtaquesAsc = bloqueAsc.ataques[rolKey];
      var promAsc = promediosCache(tag, filaAscenso.semanas, 'A');
      // Ver comentario equivalente en el bloque de Descenso, justo arriba.
      var miembroVigenteAsc = filaAscenso.miembroActivo.activo ? miembroVigenteCache(tag) : false;
      if (_cumpleRequisitoCR(reqMinCRAsc, reqAtaquesAsc, filaAscenso.barcos, filaAscenso.miembroActivo, filaAscenso.whatsapp, promAsc, miembroVigenteAsc, wspG)) {
        // 28-sep-2026 (decisiones del usuario, Fase 14 pregunta 29): [→ Contexto_Base_Web.md §26B078]
        var tiposAsc = [];
        var clanDestinoAsc = '';
        if (rolKey !== 'colider') {
          tiposAsc.push('Ascenso');
        } else {
          var idxClanAsc = ordenClanesCR.indexOf(clan);
          if (idxClanAsc > 0) { tiposAsc.push('AscensoClan'); clanDestinoAsc = ordenClanesCR[idxClanAsc - 1]; }
          // 28-sep-2026 (correccion de la usuaria): la cantera SOLO sube de clan; 'EligibleAdmin' queda
          // solo para el colider del clan principal (o de un clan que no esta en el orden de CR_Lista).
          if (idxClanAsc <= 0 && !_esAdminEnDirectorioCR(fila[DC.ADMIN - 1])) tiposAsc.push('EligibleAdmin');
        }
        tiposAsc.forEach(function (tipoPropuesta) {
        var propAsc = {
          tag: tag,
          nombre: nombre,
          clan: clan,
          rangoActual: rangoActual,
          tipoPropuesta: tipoPropuesta,
          detalle: _detalleRequisitoCR(tipoPropuesta, rolKey, reqMinCRAsc, reqAtaquesAsc, filaAscenso.barcos, filaAscenso.miembroActivo, filaAscenso.whatsapp, promAsc, miembroVigenteAsc, wspG),
          // FASE 8 -- ver comentario equivalente en el bloque de Descenso,
          // justo arriba en esta misma función.
          ataquesProm: promAsc.ataquesProm,
          fameProm: promAsc.fameProm,
          barcosProm: promAsc.barcosProm,
          barcosSuma: promAsc.barcosSuma, // 4-oct-2026, ver el comentario equivalente en el bloque de Descenso
          // NUEVO (16-sep-2026, pedido del usuario) -- ver comentario
          // equivalente en el bloque de Descenso, justo arriba.
          umbralAtaques: reqAtaquesAsc,
          umbralPuntaje: reqMinCRAsc,
          umbralBarcos: filaAscenso.barcos,
          // NUEVO (16-sep-2026, pedido del usuario) -- ver comentario
          // equivalente en el bloque de Descenso, justo arriba.
          cumpleAtaques: reqAtaquesAsc.activo ? _ataquesCumplenRequisito(promAsc, reqAtaquesAsc.qty) : null,
          cumplePuntaje: reqMinCRAsc.activo   ? _fameCumpleRequisito(promAsc, reqMinCRAsc.qty) : null,
          cumpleBarcos:  filaAscenso.barcos.activo ? _barcosCumplenRequisito(promAsc, filaAscenso.barcos.qty) : null
        };
        if (tipoPropuesta === 'AscensoClan') {
          propAsc.clanDestino = clanDestinoAsc;
          propAsc.rangoDestino = 'Miembro';
          propAsc.detalle += ' Sube al clan ' + clanDestinoAsc + ' como miembro.';
        }
        propuestas.push(propAsc);
        });
      }
    }
  }

  // FIX (16-sep-2026, pedido del usuario -- "Sin propuestas" sin ningún [→ Contexto_Base_Web.md §26B079]
  var resultado = { ok: true, propuestas: propuestas };
  if (_ULTIMO_DIAGNOSTICO_GUERRA_CSV) {
    resultado.diagnostico = _ULTIMO_DIAGNOSTICO_GUERRA_CSV;
  }
  return resultado;
}

var TA = {
  NUM:1, FECHA:2, ID:3, TEMPORADA:4, TAG:5, NOMBRE:6, NOM_MULTI:7,
  PRESTAMO:8, CLAN_TAG:9, CLAN:10, PUESTO:11, VICTORIAS:12
};

var TA_TOTAL_COLS = 12;

// FASE 24 (02-sep-2026, pedido del usuario — descalificaciones y [→ Contexto_Base_Web.md §26B080]
var TR = {
  ID_TORNEO:1, TAG:2, NOMBRE:3, PUESTO_ORIGINAL:4, TIPO_RESOLUCION:5,
  PUESTO_FINAL:6, MOTIVO:7, REGISTRADO_POR:8, FECHA_REGISTRO:9
};

var TR_TOTAL_COLS = 9;

// NUEVO (14-sep-2026, pedido del usuario -- cierre del CONTRATO PENDIENTE [→ Contexto_Base_Web.md §26B081]
var GV = {
  TAG:1, NOMBRE:2, FECHA_REGISTRO:3, REGISTRADO_POR:4
};

var GV_TOTAL_COLS = 4;

// NUEVO (09-sep-2026, pedido usuario; columna Tickets agregada [→ Contexto_Base_Web.md §26B082]
var SA = {
  NUM:1, FECHA:2, ID:3, TEMPORADA:4, TAG:5, NOMBRE:6, NOM_MULTI:7,
  PRESTAMO:8, CLAN_TAG:9, CLAN:10, TICKETS:11, PREMIO:12, RESULTADO:13, RAZON:14
};

var SA_TOTAL_COLS = 14;

// Columnas fijas de T_Control (antes de las columnas dinámicas por torneo).
var TCC = { NUM:1, TAG:2, NOMBRE:3, NOM_MULTI:4, PRESTAMO:5, CLAN_TAG:6, CLAN:7 };

var TC_FIXED_COLS = 7;

// FASE 19d (30/07/2026) — Activador temporal "Torneo en vivo". [→ Contexto_Base_Web.md §26B083]

var TORNEO_EN_VIVO_HANDLER     = '_tickTorneoEnVivo';

var TORNEO_EN_VIVO_PROP        = 'TORNEO_EN_VIVO_INICIO';

var TORNEO_EN_VIVO_DURACION_MS = 2 * 60 * 60 * 1000; // 2 horas
// 17-oct-2026 (PF091; la usuaria eligió 15 min): mientras dura la ventana, _tickTorneoEnVivo() republica torneos.json (53_Publicar_Torneos.gs)
// como máximo cada 15 min y una vez más al cerrar la ventana. [→ Contexto_Base_Web.md §PF091]
var TORNEO_EN_VIVO_PUBLICAR_CADA_MS = 15 * 60 * 1000;
var TORNEO_EN_VIVO_PUB_PROP         = 'TORNEO_EN_VIVO_PUB_MS';
// 17-oct-2026 (PF091): marca de inicio del tick en curso, para que un tick no arranque mientras el anterior sigue corriendo (ver _tickTorneoEnVivo()).
var TORNEO_EN_VIVO_TICK_PROP        = 'TORNEO_EN_VIVO_TICK_MS';

// ----- Funciones manuales / punto de entrada -----

// SECCIÓN 1: FUNCIONES MANUALES (entry points del usuario, ejecutar a mano [→ Contexto_Base_Web.md §26B084]

/**
 * iniciarActualizacionTorneoEnVivo(inicio) [→ Contexto_Base_Web.md §26B085]
 */
function iniciarActualizacionTorneoEnVivo(inicio) {
  PropertiesService.getScriptProperties().deleteProperty(TORNEO_EN_VIVO_PUB_PROP); // ventana nueva: el primer tick publica
  _instalarActivadorTorneoEnVivo(inicio);
  procesarTorneos();
}

/**
 * detenerActualizacionTorneoEnVivo()
 * Corta el activador manualmente antes de que se cumplan las 2 horas.
 */
function detenerActualizacionTorneoEnVivo() {
  _borrarTriggersPorHandler(TORNEO_EN_VIVO_HANDLER);
  PropertiesService.getScriptProperties().deleteProperty(TORNEO_EN_VIVO_PROP);
  PropertiesService.getScriptProperties().deleteProperty(TORNEO_EN_VIVO_PUB_PROP);
  Logger.log('[TorneoEnVivo] Activador detenido manualmente.');
}

// SECCIÓN 2: RESTO DE FUNCIONES (torneos, docs automatizados, helpers [→ Contexto_Base_Web.md §26B086]


/**
 * procesarTorneos()
 * Punto de entrada único del módulo.
 */
function procesarTorneos() {
  var ss = _getSs();

  // FIX (31/08/2026, pedido del usuario — sugerencia #4 de la lista de [→ Contexto_Base_Web.md §26B087]
  var _tInicioTotal = Date.now();
  function _tPaso(nombre, desde) {
    Logger.log('[Torneos][Tiempos] ' + nombre + ': ' + (Date.now() - desde) + ' ms');
  }

  var _t = Date.now();
  // BAJA DEFINITIVA (14-sep-2026, pedido del usuario -- Fase 9 completa): [→ Contexto_Base_Web.md §26B088]

  // FASE 23 (30/08/2026): aviso preventivo en el log si algún Tag_Tor_2 [→ Contexto_Base_Web.md §26B089]
  _validarTagTor2SinCoincidencia(ss);
  _tPaso('_validarTagTor2SinCoincidencia', _t);

  _t = Date.now();
  var idsNuevos = procesarTListaNuevasFilas(ss);
  _tPaso('procesarTListaNuevasFilas', _t);
  if (idsNuevos.length > 0) {
    Logger.log('[Torneos] Procesados ' + idsNuevos.length + ' torneo(s) nuevo(s)/refrescado(s): ' + idsNuevos.join(', '));
  }

  // FIX (07-sep-2026, pedido usuario -- ver docblock completo del corte [→ Contexto_Base_Web.md §26B090]
  if (idsNuevos.cortadoPorPresupuesto) {
    Logger.log('[Torneos] procesarTListaNuevasFilas() quedó incompleta por presupuesto/tanda de ' +
               'RoyaleAPI -- se corta procesarTorneos() acá, sin tocar Participantes calificados/' +
               'T_Control todavía, para que la próxima continuación retome el refetch pendiente.');
    return false;
  }

  // FIX (pedido usuario): antes, "Participantes calificados (torneo)", [→ Contexto_Base_Web.md §26B091]
  _t = Date.now();
  var ctxCompartido = _getCtx();
  _tPaso('_getCtx (compartido para Participantes/Ganadores)', _t);

  _t = Date.now();
  actualizarDocParticipantesCalificadosTorneo(ctxCompartido);
  _tPaso('actualizarDocParticipantesCalificadosTorneo', _t);

  _t = Date.now();
  actualizarDocParticipantesCalificados(ctxCompartido); // "Participantes calificados (sorteo)"
  _tPaso('actualizarDocParticipantesCalificados', _t);

  _t = Date.now();
  actualizarDocGanadoresTorneo(ctxCompartido);
  _tPaso('actualizarDocGanadoresTorneo', _t);

  // NUEVO (15-sep-2026, pedido del usuario): documentos de NO calificados, [→ Contexto_Base_Web.md §26B092]
  _t = Date.now();
  try {
    actualizarDocNoCalificadosTorneo(ctxCompartido);
  } catch (eNCT) {
    Logger.log('[Torneos] actualizarDocNoCalificadosTorneo() falló (se continúa): ' + eNCT.message);
  }
  _tPaso('actualizarDocNoCalificadosTorneo', _t);

  _t = Date.now();
  try {
    actualizarDocNoCalificadosSorteo(ctxCompartido);
  } catch (eNCS) {
    Logger.log('[Torneos] actualizarDocNoCalificadosSorteo() falló (se continúa): ' + eNCS.message);
  }
  _tPaso('actualizarDocNoCalificadosSorteo', _t);

  _t = Date.now();
  // FASE 22 (02/08/2026, HISTÓRICO): en su momento reescribía el texto de [→ Contexto_Base_Web.md §26B093]
  sincronizarRequisitosYPremiosTorneo();
  _tPaso('sincronizarRequisitosYPremiosTorneo', _t);

  _t = Date.now();
  // FIX (pedido usuario): el activador "Torneo en vivo" (procesarTorneos() [→ Contexto_Base_Web.md §26B094]
  var torneosHoy = _listarTorneosDeHoy();
  if (torneosHoy.length > 0) {
    var inicioTorneoHoy = torneosHoy.reduce(function (max, t) {
      return (t.fecha instanceof Date && (!max || t.fecha > max)) ? t.fecha : max;
    }, null);
    try {
      _instalarActivadorTorneoEnVivo(inicioTorneoHoy);
    } catch (e) {
      Logger.log('[Torneos] No se pudo instalar el activador Torneo en vivo: ' + e.message);
    }
  }
  _tPaso('_listarTorneosDeHoy + _instalarActivadorTorneoEnVivo', _t);

  _t = Date.now();
  regenerarTControlSheet(ss);
  _tPaso('regenerarTControlSheet', _t);

  _t = Date.now();
  // Formato condicional de T_Asistencia por ID de torneo (grupos de filas [→ Contexto_Base_Web.md §26B095]
  try {
    _aplicarFormatoCondicionalTAporTorneo(ss);
  } catch (e) {
    Logger.log('[Torneos] _aplicarFormatoCondicionalTAporTorneo() falló: ' + e.message);
  }
  _tPaso('_aplicarFormatoCondicionalTAporTorneo', _t);

  Logger.log('[Torneos][Tiempos] TOTAL procesarTorneos(): ' + (Date.now() - _tInicioTotal) + ' ms');

  // FIX (07-sep-2026): procesarTorneos() ahora es "reanudable" a nivel de [→ Contexto_Base_Web.md §26B096]
  return true;
}

/**
 * _mapearIndicesCSVPorEncabezado(), _reconstruirFilaCSVPorEncabezado() y [→ Contexto_Base_Web.md §26B097]
 */

/**
 * importarTListaDesdeCSV() [→ Contexto_Base_Web.md §26B098]
 */
function importarTListaDesdeCSV() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.T_LISTA);
  if (!sh) { Logger.log('[Torneos] T_Lista no existe, se omite import.'); return; }
  // FIX (08-sep-2026, pedido usuario): T_Lista tiene header de 2 FILAS [→ Contexto_Base_Web.md §26B099]
  if (sh.getLastRow() >= 3) {
    Logger.log('[Torneos] T_Lista ya tiene datos, se omite import desde CSV.');
    return;
  }
  var csv = _loadCSVFromDrive('Backup_T_Lista.csv');
  if (!csv) { Logger.log('[Torneos] No hay Backup_T_Lista.csv para restaurar.'); return; }
  var parsed = _parseCSV(csv);
  if (parsed.length < 2) { Logger.log('[Torneos] Backup_T_Lista.csv sin filas de datos.'); return; }

  // Mapa NOMBRE DE ENCABEZADO -> clave de TL. Debe reflejar los mismos [→ Contexto_Base_Web.md §26B100]
  var NOMBRE_A_IDX_TL = _mapaNombreAIdxDesdeHoja(sh, TL_TOTAL_COLS, 2);
  // Alias de compatibilidad: 'ID' es el nombre que usaban los CSV viejos [→ Contexto_Base_Web.md §26B101]
  NOMBRE_A_IDX_TL['ID'] = TL.ID;
  var csvIdxATlIdx = _mapearIndicesCSVPorEncabezado(parsed[0], NOMBRE_A_IDX_TL);

  var filas = parsed.slice(1).map(function(r) {
    var newR = _reconstruirFilaCSVPorEncabezado(r, csvIdxATlIdx, TL_TOTAL_COLS);
    // Fecha: _extraerValoresConLinksReales() la guardó en el CSV como texto [→ Contexto_Base_Web.md §26B102]
    var fechaObj = _parseSpanishDate(newR[TL.FECHA - 1]);
    if (fechaObj instanceof Date && !isNaN(fechaObj.getTime())) newR[TL.FECHA - 1] = fechaObj;
    // FASE 1 (25-sep-2026): CORRECCIÓN a lo que decía el docblock de arriba [→ Contexto_Base_Web.md §26B103]
    var horaObj = _parseSpanishDate(newR[TL.HORA - 1]);
    if (horaObj instanceof Date && !isNaN(horaObj.getTime())) newR[TL.HORA - 1] = horaObj;
    // FASE 5 (25-sep-2026, ver punto B-bis del docblock de arriba y el [→ Contexto_Base_Web.md §26B104]
    var prepSegRestore = Number(newR[TL.PREPARACION - 1]);
    newR[TL.PREPARACION - 1] = (newR[TL.PREPARACION - 1] !== '' && !isNaN(prepSegRestore))
      ? (prepSegRestore / 60) : '';
    var durSegRestore = Number(newR[TL.DURACION - 1]);
    newR[TL.DURACION - 1] = (newR[TL.DURACION - 1] !== '' && !isNaN(durSegRestore))
      ? (durSegRestore / 60) : '';
    return newR;
  });

  // FIX (08-sep-2026): los datos arrancan en la fila 3, no en la 2 (header
  // de 2 filas -- ver comentario de arriba).
  sh.getRange(3, 1, filas.length, TL_TOTAL_COLS).setValues(filas);
  for (var i = 0; i < filas.length; i++) {
    _trySetFmt(sh, i + 3, TL.FECHA, 'dd/mm/yyyy');
    // FASE 1 (25-sep-2026): reaplica también el formato de solo-hora tras [→ Contexto_Base_Web.md §26B105]
    _trySetFmt(sh, i + 3, TL.HORA, 'h:mm:ss AM/PM');
  }
  applyBorderCenter(sh.getRange(3, 1, filas.length, TL_TOTAL_COLS));
  _aplicarDropdownAdminTLista(ss);
  _aplicarDropdownTagTor2TLista(ss);
  _aplicarDropdownEstadoTLista(ss);
  // FIX (07-sep-2026, pedido del usuario): reaplica también los [→ Contexto_Base_Web.md §26B106]
  _aplicarDropdownMiembroActivoTLista(ss);
  _aplicarDropdownReaccionTLista(ss);
  // FIX (12-sep-2026, pedido del usuario): faltaba reaplicar acá también el
  // desplegable de WhatsApp, mismo criterio que Miembro activo/Reacción.
  _aplicarDropdownWhatsappTLista(ss);
  Logger.log('[Torneos] T_Lista restaurada desde CSV: ' + filas.length + ' fila(s).');
}

/**
 * importarSListaDesdeCSV() [→ Contexto_Base_Web.md §26B107]
 */
function importarSListaDesdeCSV() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.S_LISTA);
  if (!sh) { Logger.log('[Sorteos] S_Lista no existe, se omite import.'); return; }
  // FIX (08-sep-2026, pedido usuario): mismo criterio que [→ Contexto_Base_Web.md §26B108]
  if (sh.getLastRow() >= 3) {
    Logger.log('[Sorteos] S_Lista ya tiene datos, se omite import desde CSV.');
    return;
  }
  var csv = _loadCSVFromDrive('Backup_S_Lista.csv');
  if (!csv) { Logger.log('[Sorteos] No hay Backup_S_Lista.csv para restaurar.'); return; }
  var parsed = _parseCSV(csv);
  if (parsed.length < 2) { Logger.log('[Sorteos] Backup_S_Lista.csv sin filas de datos.'); return; }

  // Mapa NOMBRE DE ENCABEZADO -> clave de SL. Debe reflejar los mismos [→ Contexto_Base_Web.md §26B109]
  var NOMBRE_A_IDX_SL = _mapaNombreAIdxDesdeHoja(sh, SL_TOTAL_COLS, 2);
  // Alias de compatibilidad: 'ID' es el nombre que usaban los CSV viejos
  // para esta columna, que en la hoja actual se llama 'ID [1]'.
  NOMBRE_A_IDX_SL['ID'] = SL.ID;
  var csvIdxASlIdx = _mapearIndicesCSVPorEncabezado(parsed[0], NOMBRE_A_IDX_SL);

  var filas = parsed.slice(1).map(function(r) {
    var newR = _reconstruirFilaCSVPorEncabezado(r, csvIdxASlIdx, SL_TOTAL_COLS);
    // Fecha: mismo tratamiento que importarTListaDesdeCSV() le da a Fecha [→ Contexto_Base_Web.md §26B110]
    var fechaObj = _parseSpanishDate(newR[SL.FECHA - 1]);
    if (fechaObj instanceof Date && !isNaN(fechaObj.getTime())) newR[SL.FECHA - 1] = fechaObj;
    return newR;
  });

  // FIX (08-sep-2026): los datos arrancan en la fila 3, no en la 2 (header
  // de 2 filas -- ver comentario de arriba).
  sh.getRange(3, 1, filas.length, SL_TOTAL_COLS).setValues(filas);
  for (var i = 0; i < filas.length; i++) {
    _trySetFmt(sh, i + 3, SL.FECHA, 'dd/mm/yyyy');
  }
  applyBorderCenter(sh.getRange(3, 1, filas.length, SL_TOTAL_COLS));
  _aplicarDropdownId2SLista(ss);
  _aplicarDropdownEstadoSLista(ss);
  // FIX (07-sep-2026, pedido del usuario): reaplica también los [→ Contexto_Base_Web.md §26B111]
  _aplicarDropdownMiembroActivoSLista(ss);
  _aplicarDropdownReaccionSLista(ss);
  // FIX (12-sep-2026, pedido del usuario): faltaba reaplicar acá también el
  // desplegable de WhatsApp, mismo criterio que Miembro activo/Reacción.
  _aplicarDropdownWhatsappSLista(ss);
  Logger.log('[Sorteos] S_Lista restaurada desde CSV: ' + filas.length + ' fila(s).');
}

/**
 * importarCRListaDesdeCSV() [→ Contexto_Base_Web.md §26B112]
 */
function importarCRListaDesdeCSV() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.CR_LISTA);
  if (!sh) { Logger.log('[CambioRango] CR_Lista no existe, se omite import.'); return; }
  // Header de 3 filas fusionadas -- "ya tiene datos" es >= 4, no >= 3
  // (fila 2 y fila 3 son sub-rótulos de encabezado, no datos).
  if (sh.getLastRow() >= 4) {
    Logger.log('[CambioRango] CR_Lista ya tiene datos, se omite import desde CSV.');
    return;
  }
  var csv = _loadCSVFromDrive('Backup_CR_Lista.csv');
  if (!csv) { Logger.log('[CambioRango] No hay Backup_CR_Lista.csv para restaurar.'); return; }
  var parsed = _parseCSV(csv);
  if (parsed.length < 2) { Logger.log('[CambioRango] Backup_CR_Lista.csv sin filas de datos.'); return; }

  // Mapa NOMBRE DE ENCABEZADO -> clave de CR. Debe reflejar los mismos [→ Contexto_Base_Web.md §26B113]
  var NOMBRE_A_IDX_CR = _mapaNombreAIdxDesdeHoja(sh, CR_TOTAL_COLS, 3);
  var csvIdxACrIdx = _mapearIndicesCSVPorEncabezado(parsed[0], NOMBRE_A_IDX_CR);

  var filas = parsed.slice(1).map(function(r) {
    var newR = _reconstruirFilaCSVPorEncabezado(r, csvIdxACrIdx, CR_TOTAL_COLS);
    // Fecha: mismo tratamiento que importarSListaDesdeCSV() le da a Fecha [→ Contexto_Base_Web.md §26B114]
    var fechaObj = _parseSpanishDate(newR[CR.FECHA - 1]);
    if (fechaObj instanceof Date && !isNaN(fechaObj.getTime())) newR[CR.FECHA - 1] = fechaObj;
    // Hora: mismo criterio -- se guardó en el CSV como texto canónico [→ Contexto_Base_Web.md §26B115]
    var horaObj = _parseHoraCanonica(newR[CR.HORA - 1], newR[CR.FECHA - 1] instanceof Date ? newR[CR.FECHA - 1] : null);
    if (horaObj instanceof Date) newR[CR.HORA - 1] = horaObj;
    return newR;
  });

  // Los datos arrancan en la fila 4 (header de 3 filas fusionadas).
  sh.getRange(4, 1, filas.length, CR_TOTAL_COLS).setValues(filas);
  for (var i = 0; i < filas.length; i++) {
    _trySetFmt(sh, i + 4, CR.FECHA, 'dd/mm/yyyy');
    _trySetFmt(sh, i + 4, CR.HORA, 'h:mm:ss AM/PM');
  }
  applyBorderCenter(sh.getRange(4, 1, filas.length, CR_TOTAL_COLS));
  _aplicarDropdownTipoCRLista(ss);
  _aplicarDropdownEstadoCRLista(ss);
  _reordenarCRListaPorFecha(ss);
  Logger.log('[CambioRango] CR_Lista restaurada desde CSV: ' + filas.length + ' fila(s).');
}

/**
 * importarTAsistenciaDesdeCSV() [→ Contexto_Base_Web.md §26B116]
 */
function importarTAsistenciaDesdeCSV() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.T_ASISTENCIA);
  if (!sh) { Logger.log('[Torneos] T_Asistencia no existe, se omite import.'); return; }
  if (sh.getLastRow() >= 2) {
    Logger.log('[Torneos] T_Asistencia ya tiene datos, se omite import desde CSV.');
    return;
  }
  var csv = _loadCSVFromDrive('Backup_T_Asistencia.csv');
  if (!csv) { Logger.log('[Torneos] No hay Backup_T_Asistencia.csv para restaurar.'); return; }
  var parsed = _parseCSV(csv);
  if (parsed.length < 2) { Logger.log('[Torneos] Backup_T_Asistencia.csv sin filas de datos.'); return; }

  // FIX (18-sep-2026, pedido del usuario): ver el docblock de [→ Contexto_Base_Web.md §26B117]
  var NOMBRE_A_IDX_TA = _mapaNombreAIdxDesdeHoja(sh, TA_TOTAL_COLS, 1);
  var csvIdxATaIdx = _mapearIndicesCSVPorEncabezado(parsed[0], NOMBRE_A_IDX_TA);

  var filas = parsed.slice(1).map(function(r) {
    var newR = _reconstruirFilaCSVPorEncabezado(r, csvIdxATaIdx, TA_TOTAL_COLS);
    // Fecha: mismo tratamiento que importarTListaDesdeCSV() le da a [→ Contexto_Base_Web.md §26B118]
    var fechaObj = _parseSpanishDate(newR[TA.FECHA - 1]);
    if (fechaObj instanceof Date && !isNaN(fechaObj.getTime())) newR[TA.FECHA - 1] = fechaObj;
    return newR;
  });

  sh.getRange(2, 1, filas.length, TA_TOTAL_COLS).setValues(filas);
  for (var i = 0; i < filas.length; i++) {
    _trySetFmt(sh, i + 2, TA.FECHA, 'dd/mm/yyyy');
  }
  applyBorderCenter(sh.getRange(2, 1, filas.length, TA_TOTAL_COLS));
  Logger.log('[Torneos] T_Asistencia restaurada desde CSV: ' + filas.length + ' fila(s).');
}

/**
 * importarTResolucionesDesdeCSV() [→ Contexto_Base_Web.md §26B119]
 */
function importarTResolucionesDesdeCSV() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.T_RESOLUCIONES);
  if (!sh) { Logger.log('[Torneos] T_Resoluciones no existe, se omite import.'); return; }
  if (sh.getLastRow() >= 2) {
    Logger.log('[Torneos] T_Resoluciones ya tiene datos, se omite import desde CSV.');
    return;
  }
  var csv = _loadCSVFromDrive('Backup_T_Resoluciones.csv');
  if (!csv) { Logger.log('[Torneos] No hay Backup_T_Resoluciones.csv para restaurar.'); return; }
  var parsed = _parseCSV(csv);
  if (parsed.length < 2) { Logger.log('[Torneos] Backup_T_Resoluciones.csv sin filas de datos.'); return; }

  // FIX (18-sep-2026, pedido del usuario): ver el docblock de [→ Contexto_Base_Web.md §26B120]
  var NOMBRE_A_IDX_TR = _mapaNombreAIdxDesdeHoja(sh, TR_TOTAL_COLS, 1);
  var csvIdxATrIdx = _mapearIndicesCSVPorEncabezado(parsed[0], NOMBRE_A_IDX_TR);

  var filas = parsed.slice(1).map(function(r) {
    var newR = _reconstruirFilaCSVPorEncabezado(r, csvIdxATrIdx, TR_TOTAL_COLS);
    // Fecha_Registro se guarda con new Date() (fecha Y hora, ver [→ Contexto_Base_Web.md §26B121]
    var fechaObj = _parseSpanishDate(newR[TR.FECHA_REGISTRO - 1]);
    if (fechaObj instanceof Date && !isNaN(fechaObj.getTime())) newR[TR.FECHA_REGISTRO - 1] = fechaObj;
    return newR;
  });

  sh.getRange(2, 1, filas.length, TR_TOTAL_COLS).setValues(filas);
  applyBorderCenter(sh.getRange(2, 1, filas.length, TR_TOTAL_COLS));
  Logger.log('[Torneos] T_Resoluciones restaurada desde CSV: ' + filas.length + ' fila(s).');
}

/**
 * importarSAsistenciaDesdeCSV() [→ Contexto_Base_Web.md §26B122]
 */
function importarSAsistenciaDesdeCSV() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.S_ASISTENCIA);
  if (!sh) { Logger.log('[Sorteos] S_Asistencia no existe, se omite import.'); return; }
  if (sh.getLastRow() >= 2) {
    Logger.log('[Sorteos] S_Asistencia ya tiene datos, se omite import desde CSV.');
    return;
  }
  var csv = _loadCSVFromDrive('Backup_S_Asistencia.csv');
  if (!csv) { Logger.log('[Sorteos] No hay Backup_S_Asistencia.csv para restaurar.'); return; }
  var parsed = _parseCSV(csv);
  if (parsed.length < 2) { Logger.log('[Sorteos] Backup_S_Asistencia.csv sin filas de datos.'); return; }

  // FIX (18-sep-2026, pedido del usuario): ver el docblock de [→ Contexto_Base_Web.md §26B123]
  var NOMBRE_A_IDX_SA = _mapaNombreAIdxDesdeHoja(sh, SA_TOTAL_COLS, 1);
  var csvIdxASaIdx = _mapearIndicesCSVPorEncabezado(parsed[0], NOMBRE_A_IDX_SA);

  var filas = parsed.slice(1).map(function(r) {
    var newR = _reconstruirFilaCSVPorEncabezado(r, csvIdxASaIdx, SA_TOTAL_COLS);
    // Fecha: mismo tratamiento que importarTAsistenciaDesdeCSV() le da a [→ Contexto_Base_Web.md §26B124]
    var fechaObj = _parseSpanishDate(newR[SA.FECHA - 1]);
    if (fechaObj instanceof Date && !isNaN(fechaObj.getTime())) newR[SA.FECHA - 1] = fechaObj;
    return newR;
  });

  sh.getRange(2, 1, filas.length, SA_TOTAL_COLS).setValues(filas);
  for (var i = 0; i < filas.length; i++) {
    _trySetFmt(sh, i + 2, SA.FECHA, 'dd/mm/yyyy');
  }
  applyBorderCenter(sh.getRange(2, 1, filas.length, SA_TOTAL_COLS));
  Logger.log('[Sorteos] S_Asistencia restaurada desde CSV: ' + filas.length + ' fila(s).');
}

// PASO 3 — T_Control: cuadrícula (una columna por torneo de T_Lista) [→ Contexto_Base_Web.md §26B125]

function regenerarTControlSheet(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.T_CONTROL);
  if (!sh) { Logger.log('[T_Control] Hoja no encontrada'); return; }

  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!shDir || shDir.getLastRow() < 2) return;

  var tagsConAsistencia = _getTagsConAsistencia(ss);

  var dirData = shDir.getRange(2, 1, shDir.getLastRow() - 1, DIR_SHEET_COLS).getValues();
  // Fase 10 (17/07/2026): se quita el chequeo de Vetado — comparaba sin [→ Contexto_Base_Web.md §26B126]
  var jugadores = dirData.filter(function (r) {
    var tag = String(r[IC.TAG - 1] || '').trim();
    return String(r[IC.ESTADO - 1]) === 'Activo' &&
           CFG.TERNA_TAGS.indexOf(String(r[IC.CLAN_TAG - 1])) >= 0 &&
           !!tagsConAsistencia[tag];
  });

  // FASE 23 (30/08/2026): un torneo de continuación (Tag_Tor_2, ver [→ Contexto_Base_Web.md §26B127]
  var grupos = _resolverGruposContinuacionTorneos(ss);
  var shLista = ss.getSheetByName(CFG.SHEETS.T_LISTA);
  var torneos = [];
  // FIX (08-sep-2026, pedido usuario): header de 2 filas fusionadas en
  // T_Lista -- datos desde fila 3, guard >= 3 (antes >= 2).
  if (shLista && shLista.getLastRow() >= 3) {
    var listaData = shLista.getRange(3, 1, shLista.getLastRow() - 2, TL_TOTAL_COLS).getValues();
    for (var i = 0; i < listaData.length; i++) {
      var id = String(listaData[i][TL.ID - 1] || '').trim();
      if (!id) continue;
      var raizId = grupos.raizPorId.hasOwnProperty(id) ? grupos.raizPorId[id] : id;
      if (raizId !== id) continue; // es continuación de otro torneo: se fusiona, no abre columna propia
      torneos.push({
        id: id,
        fecha: listaData[i][TL.FECHA - 1],
        temporada: Number(listaData[i][TL.TEMPORADA - 1]) || 0
      });
    }
  }

  // FIX 1 (parche T_Control/T_Lista): orden ASC por Fecha (los sin fecha [→ Contexto_Base_Web.md §26B128]
  torneos.sort(function (a, b) {
    if (a.temporada !== b.temporada) return a.temporada - b.temporada;
    var fa = (a.fecha instanceof Date && !isNaN(a.fecha.getTime())) ? a.fecha.getTime() : 0;
    var fb = (b.fecha instanceof Date && !isNaN(b.fecha.getTime())) ? b.fecha.getTime() : 0;
    return fa - fb;
  });

  sh.clearContents();
  sh.clearFormats();

  // ---- Columnas fijas ---- [→ Contexto_Base_Web.md §26B129]
  var headersFijos = ['N°', 'Tag', 'Nombre', 'Nom_Multi', 'Préstamo', 'ClanTag', 'Clan'];

  sh.getRange(1, 1, 2, headersFijos.length).merge()
    .setValue('Control de participación en torneos')
    .setBackground(CFG.COLORES.HEADER_BG)
    .setFontColor(CFG.COLORES.HEADER_FG)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBorder(true, true, true, true, true, true, '#ffffff', SpreadsheetApp.BorderStyle.SOLID);

  var rangoHeadersFijos = sh.getRange(3, 1, 1, headersFijos.length);
  rangoHeadersFijos.setValues([headersFijos])
    .setBackground(CFG.COLORES.HEADER_BG)
    .setFontColor(CFG.COLORES.HEADER_FG)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBorder(true, true, true, true, true, true, '#ffffff', SpreadsheetApp.BorderStyle.SOLID);

  var totalCols = TC_FIXED_COLS + torneos.length;

  var filasCuerpo = [];
  for (var j = 0; j < jugadores.length; j++) {
    var r = jugadores[j];
    var fila = [];
    fila[TCC.NUM      - 1] = j + 1;
    fila[TCC.TAG      - 1] = String(r[IC.TAG       - 1] || '');
    fila[TCC.NOMBRE   - 1] = String(r[IC.NOMBRE    - 1] || '');
    fila[TCC.NOM_MULTI- 1] = String(r[IC.NOM_MULTI - 1] || '');
    fila[TCC.PRESTAMO - 1] = String(r[IC.PRESTAMO  - 1] || '');
    fila[TCC.CLAN_TAG - 1] = String(r[IC.CLAN_TAG  - 1] || '');
    fila[TCC.CLAN     - 1] = String(r[IC.CLAN      - 1] || '');
    filasCuerpo.push(fila);
  }

  if (torneos.length === 0) {
    if (filasCuerpo.length > 0) {
      sh.getRange(4, 1, filasCuerpo.length, TC_FIXED_COLS).setValues(filasCuerpo);
      applyBorderCenter(sh.getRange(4, 1, filasCuerpo.length, TC_FIXED_COLS));
    }
    sh.setFrozenRows(3);
    sh.setFrozenColumns(TC_FIXED_COLS);
    Logger.log('[T_Control] Reconstruido sin torneos (' + filasCuerpo.length + ' jugador(es)).');
    return;
  }

  // ---- Encabezados de torneos (Fila 1, 2, 3) ----
  var rangoTorneos = sh.getRange(1, TC_FIXED_COLS + 1, 1, torneos.length);
  rangoTorneos.merge().setValue('Torneos')
    .setBackground(CFG.COLORES.HEADER_BG).setFontColor(CFG.COLORES.HEADER_FG).setFontWeight('bold')
    .setHorizontalAlignment('center').setBorder(true, true, true, true, true, true, '#ffffff', SpreadsheetApp.BorderStyle.SOLID);

  var col = TC_FIXED_COLS + 1;
  var idx = 0;
  while (idx < torneos.length) {
    var temporada = torneos[idx].temporada;
    var ancho = 0;
    while (idx + ancho < torneos.length && torneos[idx + ancho].temporada === temporada) ancho++;
    var rangoTemp = sh.getRange(2, col, 1, ancho);
    if (ancho > 1) rangoTemp.merge();
    rangoTemp.setValue('T_' + temporada)
      .setBackground(CFG.COLORES.HEADER_BG).setFontColor(CFG.COLORES.HEADER_FG).setFontWeight('bold')
      .setHorizontalAlignment('center').setBorder(true, true, true, true, true, true, '#ffffff', SpreadsheetApp.BorderStyle.SOLID);
    col += ancho;
    idx += ancho;
  }

  // FASE 23 (30/08/2026) — sugerencia #3 de la lista de mejoras: si la [→ Contexto_Base_Web.md §26B130]
  var headersFecha = torneos.map(function (t) {
    var base = (t.fecha instanceof Date && !isNaN(t.fecha.getTime())) ? dateKey(t.fecha) : '';
    var idsDelGrupo = grupos.grupoPorRaiz[t.id] || [t.id];
    if (idsDelGrupo.length > 1) base += ' (' + idsDelGrupo.length + ' partes)';
    return base;
  });
  var rangoFechas = sh.getRange(3, TC_FIXED_COLS + 1, 1, torneos.length);
  rangoFechas.setValues([headersFecha])
    .setBackground(CFG.COLORES.HEADER_BG).setFontColor(CFG.COLORES.HEADER_FG).setFontWeight('bold')
    .setHorizontalAlignment('center').setBorder(true, true, true, true, true, true, '#ffffff', SpreadsheetApp.BorderStyle.SOLID);

  // ---- Cuerpo: Victorias (Score) en lugar de ☑ ---- [→ Contexto_Base_Web.md §26B131]
  var asistenciaPorId = _getAsistenciaFusionadaPorRaiz(ss);
  for (var f = 0; f < filasCuerpo.length; f++) {
    var tagJugador = filasCuerpo[f][TCC.TAG - 1];
    for (var t = 0; t < torneos.length; t++) {
      var scoresDelTorneo = asistenciaPorId[torneos[t].id] || {};
      var score = scoresDelTorneo[tagJugador];
      if (score !== undefined && score !== null && score !== '') {
        filasCuerpo[f][TC_FIXED_COLS + t] = score;
      } else {
        filasCuerpo[f][TC_FIXED_COLS + t] = '';
      }
    }
  }

  if (filasCuerpo.length > 0) {
    sh.getRange(4, 1, filasCuerpo.length, totalCols).setValues(filasCuerpo);
    applyBorderCenter(sh.getRange(4, 1, filasCuerpo.length, totalCols));

    var rangoNumeros = sh.getRange(4, TC_FIXED_COLS + 1, filasCuerpo.length, torneos.length);
    rangoNumeros.setNumberFormat('#,##0');

    // ---- FORMATO CONDICIONAL (Verde si > 0, Azul si = 0) ----
    var reglas = [];
    for (var t = 0; t < torneos.length; t++) {
      var letraCol = colLetter(TC_FIXED_COLS + 1 + t);
      var rangoColumna = sh.getRange(4, TC_FIXED_COLS + 1 + t, filasCuerpo.length, 1);

      reglas.push(
        SpreadsheetApp.newConditionalFormatRule()
          .whenFormulaSatisfied('=AND($' + letraCol + '4<>"", $' + letraCol + '4>0)')
          .setBackground(CFG.COLORES.TERNA_BG)
          .setRanges([rangoColumna])
          .build()
      );

      reglas.push(
        SpreadsheetApp.newConditionalFormatRule()
          .whenFormulaSatisfied('=AND($' + letraCol + '4<>"", $' + letraCol + '4=0)')
          .setBackground('#cfe2f3')
          .setRanges([rangoColumna])
          .build()
      );
    }
    _tryCondFmt(sh, reglas);
  }

  sh.setFrozenRows(3);
  sh.setFrozenColumns(TC_FIXED_COLS);
  Logger.log('[T_Control] Reconstruido: ' + filasCuerpo.length + ' jugador(es) x ' + torneos.length + ' torneo(s).');
}

// ----- Funciones internas / helpers -----

/**
 * _aplicarFormatoCondicionalTAporTorneo(ss) [→ Contexto_Base_Web.md §26B132]
 */
function _aplicarFormatoCondicionalTAporTorneo(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.T_ASISTENCIA);
  if (!sh) { Logger.log('[T_Asistencia] Hoja no encontrada, se omite formato por torneo.'); return; }

  var lastRow = sh.getLastRow();
  if (lastRow < 2) {
    // Sin datos: no hay nada que agrupar. Se limpian reglas viejas por si
    // quedaron de una corrida anterior con más filas.
    _tryCondFmt(sh, []);
    return;
  }

  var ids = sh.getRange(2, TA.ID, lastRow - 1, 1).getValues();
  var paleta = CFG.COLORES.TA_ID_PALETTE;
  var colorPorId = {};
  var ordenIds = [];
  for (var i = 0; i < ids.length; i++) {
    var id = String(ids[i][0] || '').trim();
    if (!id) continue;
    if (!colorPorId.hasOwnProperty(id)) {
      colorPorId[id] = paleta[ordenIds.length % paleta.length];
      ordenIds.push(id);
    }
  }

  if (ordenIds.length === 0) {
    _tryCondFmt(sh, []);
    return;
  }

  var dataRange = sh.getRange(2, 1, lastRow - 1, TA_TOTAL_COLS);
  var colId = colLetter(TA.ID);
  var rules = ordenIds.map(function (id) {
    // Escapar comillas dobles por si algún ID llegara a tenerlas (no
    // debería, pero evita fórmulas rotas).
    var idEscapado = id.replace(/"/g, '""');
    return SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$' + colId + '2="' + idEscapado + '"')
      .setBackground(colorPorId[id])
      .setRanges([dataRange])
      .build();
  });

  _tryCondFmt(sh, rules);
  Logger.log('[T_Asistencia] Formato condicional por torneo aplicado: ' + ordenIds.length + ' torneo(s)/color(es).');
}

/**
 * _instalarActivadorTorneoEnVivo(inicio) [→ Contexto_Base_Web.md §26B133]
 */
function _instalarActivadorTorneoEnVivo(inicio) {
  _borrarTriggersPorHandler(TORNEO_EN_VIVO_HANDLER);

  var inicioMs = (inicio instanceof Date && !isNaN(inicio.getTime()))
    ? inicio.getTime()
    : new Date().getTime();

  var transcurrido = new Date().getTime() - inicioMs;
  if (transcurrido >= TORNEO_EN_VIVO_DURACION_MS) {
    PropertiesService.getScriptProperties().deleteProperty(TORNEO_EN_VIVO_PROP);
    Logger.log('[TorneoEnVivo] El inicio indicado (' + new Date(inicioMs) +
               ') ya tiene 2 horas o más, no se instala el activador.');
    return false;
  }

  PropertiesService.getScriptProperties().setProperty(TORNEO_EN_VIVO_PROP, String(inicioMs));

  ScriptApp.newTrigger(TORNEO_EN_VIVO_HANDLER)
    .timeBased()
    .everyMinutes(5)
    .create();

  Logger.log('[TorneoEnVivo] Activador instalado: procesarTorneos() cada 5 min hasta 2h desde ' +
             new Date(inicioMs) + '.');
  return true;
}

/**
 * _tickTorneoEnVivo() [→ Contexto_Base_Web.md §26B134]
 */
function _tickTorneoEnVivo() {
  // 17-oct-2026 (PF091): los ticks son cada 5 min y procesarTorneos() ya tarda ~270-320 s, así que el siguiente tick empezaba con el anterior
  // todavía corriendo (registro de las 17:44:58 y 17:49:58): dos ejecuciones escribiendo los mismos documentos y compitiendo por Drive.
  // Si el tick anterior marcó su inicio hace menos de límite + 20 s, este se omite. La marca se borra al terminar; si el anterior murió por
  // tiempo no la borra, y por eso caduca sola. [→ Contexto_Base_Web.md §PF091]
  var propsG = PropertiesService.getScriptProperties();
  var ahoraG = Date.now();
  var inicioPrevioG = Number(propsG.getProperty(TORNEO_EN_VIVO_TICK_PROP)) || 0;
  if (inicioPrevioG && (ahoraG - inicioPrevioG) < CFG.PLATAFORMA_LIMITE_EJECUCION_MS + 20000) {
    Logger.log('[TorneoEnVivo] El tick anterior sigue corriendo (empezó hace ' + Math.round((ahoraG - inicioPrevioG) / 1000) + ' s); este tick se omite.');
    return;
  }
  propsG.setProperty(TORNEO_EN_VIVO_TICK_PROP, String(ahoraG));
  try {
    _tickTorneoEnVivoCuerpo_();
  } finally {
    propsG.deleteProperty(TORNEO_EN_VIVO_TICK_PROP);
  }
}

function _tickTorneoEnVivoCuerpo_() {
  var props = PropertiesService.getScriptProperties();
  var inicioStr = props.getProperty(TORNEO_EN_VIVO_PROP);
  var inicio = inicioStr ? Number(inicioStr) : null;

  if (!inicio || isNaN(inicio)) {
    // No debería pasar (implicaría un trigger huérfano que nunca pasó por [→ Contexto_Base_Web.md §26B135]
    Logger.log('[TorneoEnVivo] Sin marca de inicio registrada, se detiene el activador por seguridad.');
    _borrarTriggersPorHandler(TORNEO_EN_VIVO_HANDLER);
    return;
  }

  var transcurrido = new Date().getTime() - inicio;
  if (transcurrido >= TORNEO_EN_VIVO_DURACION_MS) {
    _borrarTriggersPorHandler(TORNEO_EN_VIVO_HANDLER);
    props.deleteProperty(TORNEO_EN_VIVO_PROP);
    Logger.log('[TorneoEnVivo] Se cumplieron las 2 horas, activador detenido automáticamente.');
    _publicarTorneosDesdeTick_(true); // última publicación con lo que dejó el tick anterior
    props.deleteProperty(TORNEO_EN_VIVO_PUB_PROP);
    return;
  }

  // 17-oct-2026: procesarTorneos() tarda 170-220 s (registros del 17-oct) y publicar 'torneos' ≈ 85-90 s más la subida, así que no caben
  // juntos en 360 s: cuando toca publicar (cada 15 min), este tick SOLO publica (datos del tick anterior; sin recalcular el historial)
  // y el siguiente vuelve a procesar.
  if (_publicarTorneosDesdeTick_(false)) return;
  Logger.log('[TorneoEnVivo] Ejecutando procesarTorneos() (quedan ' +
             Math.round((TORNEO_EN_VIVO_DURACION_MS - transcurrido) / 60000) + ' min de ventana).');
  procesarTorneos();
}

/**
 * _publicarTorneosDesdeTick_(ignorarCadencia) (17-oct-2026, PF091)
 * Republica torneos.json desde el tick de Torneo en vivo. Publica como máximo cada TORNEO_EN_VIVO_PUBLICAR_CADA_MS (15 min), salvo
 * ignorarCadencia (cierre de la ventana). Devuelve true si le tocaba publicar (lo intentó) y false si aún no. Nunca lanza error.
 */
function _publicarTorneosDesdeTick_(ignorarCadencia) {
  try {
    var props = PropertiesService.getScriptProperties();
    var ahora = Date.now();
    var ultima = Number(props.getProperty(TORNEO_EN_VIVO_PUB_PROP)) || 0;
    if (!ignorarCadencia && (ahora - ultima) < TORNEO_EN_VIVO_PUBLICAR_CADA_MS) return false;
    props.setProperty(TORNEO_EN_VIVO_PUB_PROP, String(ahora)); // se marca el INTENTO: si falla, se reintenta a los 15 min y no se frena procesarTorneos()
    var restanteMs = CFG.PLATAFORMA_LIMITE_EJECUCION_MS - (ahora - TORNEOS_ESTATICO_EJEC_INICIO_MS_);
    if (restanteMs < TORNEOS_ESTATICO_MIN_RESTANTE_MS) {
      Logger.log('[TorneoEnVivo] torneos.json NO se publica: quedan ' + Math.round(restanteMs / 1000) + ' s; se reintenta en 15 min.');
      return true;
    }
    var ok = _publicarTorneosEstatico_(true, false); // sin recalcular el historial; true también cuando no hubo cambios, false si falló
    Logger.log('[TorneoEnVivo] torneos.json: ' + (ok ? 'publicado o sin cambios' : 'NO se publicó, mira verDiagnosticoGuerraVivo()'));
    return true;
  } catch (e) {
    Logger.log('[TorneoEnVivo] error al publicar torneos.json (el activador sigue): ' + e);
    return true;
  }
}

/**
 * _borrarTriggersPorHandler(nombreHandler) [→ Contexto_Base_Web.md §26B136]
 */
function _borrarTriggersPorHandler(nombreHandler) {
  var triggers = ScriptApp.getProjectTriggers();
  var borrados = 0;
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === nombreHandler) {
      ScriptApp.deleteTrigger(triggers[i]);
      borrados++;
    }
  }
  if (borrados > 0) {
    Logger.log('[TorneoEnVivo] Triggers eliminados de "' + nombreHandler + '": ' + borrados);
  }
  return borrados;
}

// PASO 1 — T_Lista: detección y llenado automático de filas nuevas [→ Contexto_Base_Web.md §26B137]

function procesarTListaNuevasFilas(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.T_LISTA);
  // FIX (08-sep-2026, pedido usuario): T_Lista tiene header de 2 FILAS [→ Contexto_Base_Web.md §26B138]
  if (!sh || sh.getLastRow() < 3) return [];

  // FIX (31/08/2026, pedido del usuario -- mismo patrón que el FIX [→ Contexto_Base_Web.md §26B139]
  sh.getRange(3, 1, sh.getLastRow() - 2, TL_TOTAL_COLS).clearDataValidations();

  // Se arma UNA sola vez acá (no en cada fila del loop) y se pasa a [→ Contexto_Base_Web.md §26B140]
  var mapaDirectorioOrg = _getDirectorioLookupPorTag(ss);
  // FASE 8 (25-sep-2026, rediseño T_Lista -- punto G del docblock de [→ Contexto_Base_Web.md §26B141]
  var mapaInactivosOrg = _getInactivosLookupPorTag(ss);

  var numFilas = sh.getLastRow() - 2;
  var datos = sh.getRange(3, 1, numFilas, TL_TOTAL_COLS).getValues();
  var idsProcesados = [];
  // FIX (02-ago-2026): idsProcesados mezcla torneos genuinamente nuevos [→ Contexto_Base_Web.md §26B142]
  var idsGenuinosNuevos = [];

  // Ver FIX (31/08/2026, sugerencia #1) más abajo, dentro del loop, donde [→ Contexto_Base_Web.md §26B143]
  var UMBRAL_REFRESCO_HORAS_TORNEO = 48;

  // FIX (07-sep-2026, reportado por el usuario -- "T_Asistencia y T_Control [→ Contexto_Base_Web.md §26B144]
  var idsConAsistenciaExistente = _getAsistenciaTagsPorId(ss);

  // FIX (07-sep-2026, pedido usuario -- "no se debe recurrir directamente a [→ Contexto_Base_Web.md §26B145]
  var _inicioRefetchTorneos = Date.now();
  var _consultasRefetchEnEstaTanda = 0;
  var _cortadoPorPresupuestoRefetch = false;

  for (var i = 0; i < datos.length; i++) {
    var fila = datos[i];
    var linkApp = String(fila[TL.LINK_APP - 1] || '').trim();
    var idExistente = String(fila[TL.ID - 1] || '').trim();
    // FIX (08-sep-2026): offset de fila corregido a 3 (antes 2) por el [→ Contexto_Base_Web.md §26B146]
    var filaHoja = i + 3;

    // Fase 19a: ANTES, "if (!linkApp || idExistente) continue;" dejaba un [→ Contexto_Base_Web.md §26B147]
    if (!linkApp) {
      // FIX (08-sep-2026, pedido usuario -- Fase 2 de planificación): una [→ Contexto_Base_Web.md §26B148]
      var estadoActualPlan = String(fila[TL.ESTADO - 1] || '').trim();
      if (estadoActualPlan === 'Planificado' && !idExistente) {
        var fechaPlan = fila[TL.FECHA - 1];
        if (fechaPlan instanceof Date && !isNaN(fechaPlan.getTime())) {
          var temporadaManualPlan = fila[TL.TEMPORADA - 1];
          var temporadaPlan = (temporadaManualPlan !== '' && temporadaManualPlan !== null && !isNaN(Number(temporadaManualPlan)))
            ? Number(temporadaManualPlan)
            : _calcularTemporadaParaFecha(fechaPlan);
          var semanaPlan = _calcularSemanaTorneo(fechaPlan, temporadaPlan);
          var numTorneoEnSemanaPlan = _contarTorneosEnSemana(datos, temporadaPlan, semanaPlan, i);
          var idReserva = 'T_' + Utilities.formatString('%03d', temporadaPlan) + '_' + semanaPlan + '_' + Utilities.formatString('%02d', numTorneoEnSemanaPlan);
          sh.getRange(filaHoja, TL.TEMPORADA).setValue(temporadaPlan);
          sh.getRange(filaHoja, TL.ID).setValue(idReserva);
          sh.getRange(filaHoja, TL.NUM).setValue(filaHoja - 2);
          datos[i][TL.TEMPORADA - 1] = temporadaPlan;
          datos[i][TL.ID - 1] = idReserva;
          Logger.log('[T_Lista] Fila ' + filaHoja + ': torneo planificado, ID de reserva ' + idReserva + ' asignado (fecha manual respetada, sin Link_app todavía).');
        } else {
          Logger.log('[T_Lista] Fila ' + filaHoja + ': Estado=Planificado pero sin Fecha válida, no se puede generar el ID de reserva todavía.');
        }
      }
      continue;
    }

    // FIX (31/08/2026, pedido del usuario -- caso real: escribió el ID a [→ Contexto_Base_Web.md §26B149]
    var tagTorExistente = String(fila[TL.TAG_TOR - 1] || '').trim();
    var esRefresco = !!idExistente && !!tagTorExistente;
    // FIX (08-sep-2026, pedido usuario -- Fase 2): distingue el caso [→ Contexto_Base_Web.md §26B150]
    var esReservaConId = !!idExistente && !tagTorExistente;

    // FIX (31/08/2026, pedido del usuario -- sugerencia #1, cuello de [→ Contexto_Base_Web.md §26B151]
    if (esRefresco && idsConAsistenciaExistente[idExistente]) {
      var fechaExistenteChk = fila[TL.FECHA - 1];
      if (fechaExistenteChk instanceof Date && !isNaN(fechaExistenteChk.getTime())) {
        var horasDesdeTorneo = (Date.now() - fechaExistenteChk.getTime()) / 3600000;
        if (horasDesdeTorneo > UMBRAL_REFRESCO_HORAS_TORNEO) {
          idsProcesados.push(idExistente);
          continue;
        }
      }
    }

    // 1. Parsear Tag_Tor y Contraseña (pass opcional)
    var match = linkApp.match(/[?&]id=([^&]+)(?:&pass=([^&]*))?/);
    if (!match) {
      Logger.log('[T_Lista] Fila ' + filaHoja + ': no se pudo parsear Link_app, se omite.');
      continue;
    }
    var tagTor = match[1].trim();
    var contrasena = match[2] ? match[2].trim() : '';

    var tagTorSinHash = tagTor.replace('#', '');
    var linkJson = 'https://royaleapi.com/tournament/' + tagTorSinHash + '/members/json';

    // FIX (07-sep-2026): corte de presupuesto/tanda justo ANTES de cada [→ Contexto_Base_Web.md §26B152]
    if (_consultasRefetchEnEstaTanda >= CFG.TORNEOS_REFETCH_MAX_POR_TANDA ||
        (Date.now() - _inicioRefetchTorneos) > CFG.TORNEOS_REFETCH_BUDGET_MS) {
      Logger.log('[T_Lista] Presupuesto/tanda de refetch a RoyaleAPI agotado en la fila ' +
                 filaHoja + ' (' + _consultasRefetchEnEstaTanda + ' consulta(s) ya hechas en ' +
                 'esta tanda). Se corta acá; la próxima continuación retoma los torneos que falten.');
      _cortadoPorPresupuestoRefetch = true;
      break;
    }
    _consultasRefetchEnEstaTanda++;

    var jsonArray = _fetchMembersTorneo(tagTorSinHash);
    if (!esRefresco) {
      sh.getRange(filaHoja, TL.TAG_TOR).setValue(tagTor);
      sh.getRange(filaHoja, TL.CONTRASENA).setValue(contrasena);
      sh.getRange(filaHoja, TL.LINK_JSON).setValue(linkJson);
      // FIX (26-sep-2026, reportado por el usuario -- Link_json_2 quedaba [→ Contexto_Base_Web.md §26B153]
      sh.getRange(filaHoja, TL.LINK_JSON_2).setValue(CFG.API_BASE + '/tournaments/%23' + tagTorSinHash);
    }

    if (!jsonArray || jsonArray.length === 0) {
      Logger.log('[T_Lista] Fila ' + filaHoja + ': no se pudo obtener el JSON del torneo, se reintentará.');
      continue;
    }

    // FASE 3 (25-sep-2026, rediseño T_Lista -- ver docblock de arriba): [→ Contexto_Base_Web.md §26B154]
    var torneoData = jsonArray.torneoData || null;
    if (torneoData) {
      sh.getRange(filaHoja, TL.NOMBRE).setValue(String(torneoData.name || ''));
      sh.getRange(filaHoja, TL.DESCRIPCION).setValue(String(torneoData.description || ''));
      sh.getRange(filaHoja, TL.NIVEL_TOPE).setValue(
        (torneoData.levelCap !== undefined && torneoData.levelCap !== null) ? Number(torneoData.levelCap) : '');
      sh.getRange(filaHoja, TL.PARTICIPANTES).setValue(
        (torneoData.capacity !== undefined && torneoData.capacity !== null) ? Number(torneoData.capacity) : jsonArray.length);
      sh.getRange(filaHoja, TL.CAPACIDAD).setValue(
        (torneoData.maxCapacity !== undefined && torneoData.maxCapacity !== null) ? Number(torneoData.maxCapacity) : '');
      var modoIdValor = (torneoData.gameMode && torneoData.gameMode.id !== undefined && torneoData.gameMode.id !== null)
        ? Number(torneoData.gameMode.id) : '';
      sh.getRange(filaHoja, TL.MODO_ID).setValue(modoIdValor);
      // FASE 4 (25-sep-2026, rediseño T_Lista -- ver punto A del docblock de [→ Contexto_Base_Web.md §26B155]
      sh.getRange(filaHoja, TL.MODO).setValue(_resolverModoDesdeCatalogo(modoIdValor));
      var creacion = _parseFechaApiSupercell(torneoData.createdTime);
      if (creacion) {
        sh.getRange(filaHoja, TL.CREACION).setValue(creacion);
        // FIX PENDIENTE DE CONFIRMAR: formato elegido por defecto [→ Contexto_Base_Web.md §26B156]
        _trySetFmt(sh, filaHoja, TL.CREACION, 'dd/mm/yyyy hh:mm:ss');
      }
      // FASE 5 (25-sep-2026, rediseño T_Lista -- ver puntos B y B-bis del [→ Contexto_Base_Web.md §26B157]
      var prepSegundos = (torneoData.preparationDuration !== undefined && torneoData.preparationDuration !== null)
        ? Number(torneoData.preparationDuration) : null;
      sh.getRange(filaHoja, TL.PREPARACION).setValue(
        (prepSegundos !== null && !isNaN(prepSegundos)) ? (prepSegundos / 60) : '');
      var durSegundos = (torneoData.duration !== undefined && torneoData.duration !== null)
        ? Number(torneoData.duration) : null;
      sh.getRange(filaHoja, TL.DURACION).setValue(
        (durSegundos !== null && !isNaN(durSegundos)) ? (durSegundos / 60) : '');
      // FASE 6 (25-sep-2026, rediseño T_Lista -- ver punto C del docblock de [→ Contexto_Base_Web.md §26B158]
      var tipoApi = torneoData.type;
      var tipoValor = (tipoApi === 'open') ? 'Abierto' :
                      (tipoApi === 'passwordProtected') ? 'Cerrado' : '';
      if (!tipoValor && tipoApi) {
        Logger.log('[T_Lista] Fila ' + filaHoja + ': valor de type desconocido ("' + tipoApi +
                   '") -- Tipo queda vacío. Revisar mapeo de la Fase 6 (26_Torneos_Core.gs).');
      }
      sh.getRange(filaHoja, TL.TIPO).setValue(tipoValor);
      // FASE 7 (25-sep-2026, rediseño T_Lista -- ver punto D del docblock de [→ Contexto_Base_Web.md §26B159]
      var statusApi = torneoData.status;
      var estadoValor = (statusApi === 'inPreparation') ? 'Planificado' :
                         (statusApi === 'inProgress') ? 'En progreso' :
                         (statusApi === 'ended') ? 'Realizado' : '';
      if (!estadoValor && statusApi) {
        Logger.log('[T_Lista] Fila ' + filaHoja + ': valor de status desconocido ("' + statusApi +
                   '") -- Estado queda vacío. Revisar mapeo de la Fase 7 (26_Torneos_Core.gs).');
      }
      sh.getRange(filaHoja, TL.ESTADO).setValue(estadoValor);
      datos[i][TL.ESTADO - 1] = estadoValor;
    } else {
      // No debería pasar nunca (ya se validó jsonArray.length arriba, y [→ Contexto_Base_Web.md §26B160]
      Logger.log('[T_Lista] Fila ' + filaHoja + ': _fetchMembersTorneo() devolvió membersList sin ' +
                 '.torneoData adjunto -- revisar _fetchMembersTorneo() (más abajo en este archivo). ' +
                 'Se omiten las columnas de solo lectura de esta pasada, se reintentará en la próxima corrida.');
    }

    if (esRefresco) {
      // Refresco: se reutilizan Fecha/Temporada/ID ya registrados, solo se [→ Contexto_Base_Web.md §26B161]
      var fechaExistente = fila[TL.FECHA - 1];
      var temporadaExistente = Number(fila[TL.TEMPORADA - 1]) || 0;
      _generarAsistenciaParaTorneo(ss, idExistente, fechaExistente, temporadaExistente, jsonArray);
      idsProcesados.push(idExistente);
      continue;
    }

    // FIX (08-sep-2026, pedido usuario -- Fase 2): si la fila ya tenía un [→ Contexto_Base_Web.md §26B162]
    var fecha, temporada, id;
    if (esReservaConId) {
      fecha = fila[TL.FECHA - 1];
      temporada = Number(fila[TL.TEMPORADA - 1]) || _calcularTemporadaParaFecha(fecha);
      id = idExistente;
      // N° ya se asignó cuando se generó el ID de reserva (más arriba en [→ Contexto_Base_Web.md §26B163]
    } else {
      fecha = fila[TL.FECHA - 1];
      if (!(fecha instanceof Date) || isNaN(fecha.getTime())) {
        fecha = _hoyLimaSinHora();
        sh.getRange(filaHoja, TL.FECHA).setValue(fecha);
        _trySetFmt(sh, filaHoja, TL.FECHA, 'dd/mm/yyyy');
      }

      var temporadaManual = fila[TL.TEMPORADA - 1];
      temporada = (temporadaManual !== '' && temporadaManual !== null && !isNaN(Number(temporadaManual)))
        ? Number(temporadaManual)
        : _calcularTemporadaParaFecha(fecha);
      sh.getRange(filaHoja, TL.TEMPORADA).setValue(temporada);

      var semana = _calcularSemanaTorneo(fecha, temporada);
      var numTorneoEnSemana = _contarTorneosEnSemana(datos, temporada, semana, i);
      id = 'T_' + Utilities.formatString('%03d', temporada) + '_' + semana + '_' + Utilities.formatString('%02d', numTorneoEnSemana);
      sh.getRange(filaHoja, TL.ID).setValue(id);

      // FIX (08-sep-2026): N° = fila de hoja menos 2 filas de header (antes
      // menos 1), para que la primera fila de dato (fila 3) siga dando N°=1.
      sh.getRange(filaHoja, TL.NUM).setValue(filaHoja - 2);
    }

    // FIX (09-sep-2026, pedido usuario — Consolidado_Cambios_Pendientes_ [→ Contexto_Base_Web.md §26B164]
    var orgManual = String(fila[TL.ORGANIZADOR - 1] || '').trim();
    var tagOrgManual = String(fila[TL.TAG_ORG - 1] || '').trim();
    var clanManual = String(fila[TL.CLAN - 1] || '').trim();
    var clanTagManual = String(fila[TL.CLAN_TAG - 1] || '').trim();

    var infoOrg = null;

    // FASE 8 (25-sep-2026, rediseño T_Lista -- punto G del docblock de [→ Contexto_Base_Web.md §26B165]
    var creatorTagValor = torneoData ? String(torneoData.creatorTag || '').trim() : '';

    if (creatorTagValor) {
      var infoCreator = _resolverOrganizadorPorCreatorTag(creatorTagValor, mapaDirectorioOrg, mapaInactivosOrg);
      sh.getRange(filaHoja, TL.ORGANIZADOR).setValue(infoCreator.nombreOrg);
      sh.getRange(filaHoja, TL.NOM_MULTI_ORG).setValue(infoCreator.nomMultiOrg);
      sh.getRange(filaHoja, TL.TAG_ORG).setValue(infoCreator.tagOrg);
      infoOrg = { nombre: infoCreator.nombreOrg, tag: infoCreator.tagOrg, clan: '', clanTag: '' };
      // tagOrgManual se actualiza al valor recién resuelto (no al que [→ Contexto_Base_Web.md §26B166]
      tagOrgManual = infoCreator.tagOrg;
      Logger.log('[T_Lista] Fila ' + filaHoja + ': Organizador/Nom_Multi_Org/Tag_org resueltos por creatorTag (' +
                 infoCreator.tagOrg + ') -- Fase 8.');
    } else if (orgManual && tagOrgManual) {
      // Caso D: ambos llenos, no se resuelve nada de Organizador/Tag_org.
      Logger.log('[T_Lista] Fila ' + filaHoja + ' tiene Organizador (' + orgManual + ') y Tag_org manuales, se salta la asignación automática de ambos.');
    } else if (!orgManual && !tagOrgManual) {
      // Caso A: lógica ya existente, sin cambios.
      infoOrg = _determinarOrganizador(jsonArray, mapaDirectorioOrg);
      sh.getRange(filaHoja, TL.ORGANIZADOR).setValue(infoOrg.nombre);
      sh.getRange(filaHoja, TL.TAG_ORG).setValue(infoOrg.tag);
    } else if (orgManual && !tagOrgManual) {
      // Caso B: Organizador ya escrito a mano, se resuelve SOLO Tag_org.
      infoOrg = _resolverTagOrgDesdeOrganizador(orgManual, jsonArray, mapaDirectorioOrg);
      if (infoOrg.tag) sh.getRange(filaHoja, TL.TAG_ORG).setValue(infoOrg.tag);
    } else {
      // Caso C: Tag_org ya escrito a mano, Organizador vacío.
      var nomMultiDesdeTag = _getNomMultiPorTag(tagOrgManual);
      if (nomMultiDesdeTag) {
        sh.getRange(filaHoja, TL.ORGANIZADOR).setValue(nomMultiDesdeTag);
        infoOrg = { nombre: nomMultiDesdeTag, tag: tagOrgManual, clan: '', clanTag: '' };
      } else {
        // Tag_org no es un admin válido: se comporta como si Organizador
        // estuviera vacío (Caso A completo) -- pero Tag_org NUNCA se toca.
        infoOrg = _determinarOrganizador(jsonArray, mapaDirectorioOrg);
        sh.getRange(filaHoja, TL.ORGANIZADOR).setValue(infoOrg.nombre);
      }
    }

    // Fase 9 (25-sep-2026, plan T_Lista -- ver TL.ORGANIZADOR_FUENTE más [→ Contexto_Base_Web.md §26B167]
    sh.getRange(filaHoja, TL.ORGANIZADOR_FUENTE).setValue(creatorTagValor ? 'API' : 'Manual');

    // Autocompletado INDEPENDIENTE de Clan/ClanTag (sección 8): a partir [→ Contexto_Base_Web.md §26B168]
    var tagOrgFinal = tagOrgManual || (infoOrg && infoOrg.tag) || '';
    if ((!clanManual || !clanTagManual) && tagOrgFinal) {
      var infoClan = (infoOrg && infoOrg.tag === tagOrgFinal && (infoOrg.clan || infoOrg.clanTag))
        ? infoOrg
        : _derivarClanClanTagDesdeTagOrg(tagOrgFinal, jsonArray, mapaDirectorioOrg);
      if (!clanManual && infoClan.clan) sh.getRange(filaHoja, TL.CLAN).setValue(infoClan.clan);
      if (!clanTagManual && infoClan.clanTag) sh.getRange(filaHoja, TL.CLAN_TAG).setValue(infoClan.clanTag);
    }

    datos[i][TL.TEMPORADA - 1] = temporada;
    datos[i][TL.ID - 1] = id;

    _generarAsistenciaParaTorneo(ss, id, fecha, temporada, jsonArray);
    idsProcesados.push(id);
    idsGenuinosNuevos.push(id);

    // FASE 7 (25-sep-2026, rediseño T_Lista -- reemplaza el FIX 08-sep-2026 [→ Contexto_Base_Web.md §26B169]
  }

  _aplicarDropdownAdminTLista(ss);
  _aplicarDropdownTagTor2TLista(ss);
  _aplicarDropdownEstadoTLista(ss);
  // FIX (07-sep-2026, pedido del usuario): desplegables fijos ("Sí"/"No")
  // de Miembro activo y Reacción, mismo criterio que Estado justo arriba.
  _aplicarDropdownMiembroActivoTLista(ss);
  _aplicarDropdownReaccionTLista(ss);
  // FIX (12-sep-2026, pedido del usuario): faltaba reaplicar acá también el
  // desplegable de WhatsApp, mismo criterio que Miembro activo/Reacción.
  _aplicarDropdownWhatsappTLista(ss);

  // FIX 1b (parche T_Control/T_Lista): reordena físicamente T_Lista por [→ Contexto_Base_Web.md §26B170]
  _guardarModoCSVSiHayNuevos();

  _ordenarTListaPorFecha(ss);

  // FIX (16-ago-2026): reportado por el usuario -- la última fila de [→ Contexto_Base_Web.md §26B171]
  if (sh.getLastRow() >= 3) {
    applyBorderCenter(sh.getRange(3, 1, sh.getLastRow() - 2, TL_TOTAL_COLS));
  }

  idsProcesados.nuevosGenuinos = idsGenuinosNuevos;
  idsProcesados.cortadoPorPresupuesto = _cortadoPorPresupuestoRefetch;
  return idsProcesados;
}

// _ordenarTListaPorFecha(ss) [→ Contexto_Base_Web.md §26B172]
function _ordenarTListaPorFecha(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.T_LISTA);
  // FIX (08-sep-2026, pedido usuario): T_Lista tiene header de 2 FILAS [→ Contexto_Base_Web.md §26B173]
  if (!sh || sh.getLastRow() < 4) return;

  var numFilas = sh.getLastRow() - 2;
  var datos = sh.getRange(3, 1, numFilas, TL_TOTAL_COLS).getValues();

  var conIndice = datos.map(function (fila, idx) {
    var fecha = fila[TL.FECHA - 1];
    return {
      fila: fila,
      idx: idx,
      tiempo: (fecha instanceof Date && !isNaN(fecha.getTime())) ? fecha.getTime() : Infinity
    };
  });

  conIndice.sort(function (a, b) {
    if (a.tiempo !== b.tiempo) return a.tiempo - b.tiempo;
    return a.idx - b.idx; // estable: conserva el orden original en empates / sin fecha
  });

  // FIX (pedido usuario, N° quedaba "2, 1, 3"): antes, si el ORDEN FÍSICO de [→ Contexto_Base_Web.md §26B174]
  var yaOrdenado = true;
  for (var i = 0; i < conIndice.length; i++) {
    if (conIndice[i].idx !== i) { yaOrdenado = false; break; }
    if (Number(conIndice[i].fila[TL.NUM - 1]) !== i + 1) { yaOrdenado = false; break; }
  }
  if (yaOrdenado) return; // nada que reescribir, evita tocar la hoja sin necesidad

  var filasOrdenadas = conIndice.map(function (item, i) {
    var fila = item.fila.slice();
    fila[TL.NUM - 1] = i + 1;
    return fila;
  });

  // FIX (08-sep-2026): rango de escritura y offset de fecha movidos a la
  // fila 3 (antes fila 2) por el header de 2 filas.
  sh.getRange(3, 1, filasOrdenadas.length, TL_TOTAL_COLS).setValues(filasOrdenadas);
  // FASE 1 (25-sep-2026): ESTE es el proceso identificado como causante del [→ Contexto_Base_Web.md §26B175]
  for (var j = 0; j < filasOrdenadas.length; j++) {
    _trySetFmt(sh, j + 3, TL.FECHA, 'dd/mm/yyyy');
    _trySetFmt(sh, j + 3, TL.HORA, 'h:mm:ss AM/PM');
  }
  Logger.log('[T_Lista] Reordenada por Fecha ascendente (' + filasOrdenadas.length + ' fila(s)).');
}

// FASE 13 (26-sep-2026, plan Organizador_Fuente -- ver docblock "FASES [→ Contexto_Base_Web.md §26B176]

/**
 * repararTorneosViejosDesdeAPI() [→ Contexto_Base_Web.md §26B177]
 */
function repararTorneosViejosDesdeAPI() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.T_LISTA);
  if (!sh || sh.getLastRow() < 3) {
    Logger.log('[Reparación Fase 13] T_Lista vacía o no encontrada, nada que reparar.');
    return;
  }

  var PROP_ULTIMA_FILA = 'REPARAR_TORNEOS_VIEJOS_ULTIMA_FILA';
  var props = PropertiesService.getScriptProperties();
  var filaDesde = parseInt(props.getProperty(PROP_ULTIMA_FILA) || '0', 10);

  // FIX (26-sep-2026, reportado por el usuario tras la primera corrida real [→ Contexto_Base_Web.md §26B178]
  sh.getRange(3, 1, sh.getLastRow() - 2, TL_TOTAL_COLS).clearDataValidations();

  var numFilas = sh.getLastRow() - 2;
  var datos = sh.getRange(3, 1, numFilas, TL_TOTAL_COLS).getValues();

  // Mismo criterio que procesarTListaNuevasFilas() (más arriba en este
  // archivo): se arman UNA sola vez, no en cada fila del loop.
  var mapaDirectorioOrg = _getDirectorioLookupPorTag(ss);
  var mapaInactivosOrg = _getInactivosLookupPorTag(ss);
  var mapaAsistenciaPorId = _getAsistenciaTagsPorId(ss);

  var inicio = Date.now();
  var consultas = 0;
  var cortadoPorPresupuesto = false;
  var revisados = 0;
  var reparados = 0;

  for (var i = filaDesde; i < datos.length; i++) {
    var fila = datos[i];
    var filaHoja = i + 3;
    var linkApp = String(fila[TL.LINK_APP - 1] || '').trim();
    if (!linkApp) continue; // sin Link_app no hay tag que volver a consultar

    // Mismo corte de presupuesto/tanda que procesarTListaNuevasFilas() (ver [→ Contexto_Base_Web.md §26B179]
    if (consultas >= CFG.TORNEOS_REFETCH_MAX_POR_TANDA ||
        (Date.now() - inicio) > CFG.TORNEOS_REFETCH_BUDGET_MS) {
      Logger.log('[Reparación Fase 13] Presupuesto/tanda agotado en la fila ' + filaHoja +
                 ' (' + consultas + ' consulta(s) ya hechas en esta tanda). Se corta acá; ' +
                 'correr repararTorneosViejosDesdeAPI() de nuevo para continuar.');
      props.setProperty(PROP_ULTIMA_FILA, String(i));
      cortadoPorPresupuesto = true;
      break;
    }

    var match = linkApp.match(/[?&]id=([^&]+)/);
    if (!match) {
      Logger.log('[Reparación Fase 13] Fila ' + filaHoja + ': no se pudo parsear Link_app, se omite.');
      continue;
    }
    var tagTorSinHash = match[1].trim().replace('#', '');

    revisados++;
    consultas++;
    var jsonArray = _fetchMembersTorneo(tagTorSinHash);
    if (!jsonArray || jsonArray.length === 0) {
      Logger.log('[Reparación Fase 13] Fila ' + filaHoja + ': no se pudo obtener el JSON del torneo, se reintentará en otra corrida.');
      continue;
    }
    var torneoData = jsonArray.torneoData || null;
    if (!torneoData) continue;

    var huboCambio = false;

    // --- columnas de solo lectura (Fases 3/5/6/7), solo si están vacías ---
    if (String(fila[TL.NOMBRE - 1] || '').trim() === '' && torneoData.name) {
      sh.getRange(filaHoja, TL.NOMBRE).setValue(String(torneoData.name));
      huboCambio = true;
    }
    if (String(fila[TL.DESCRIPCION - 1] || '').trim() === '' && torneoData.description) {
      sh.getRange(filaHoja, TL.DESCRIPCION).setValue(String(torneoData.description));
      huboCambio = true;
    }
    // FIX (26-sep-2026, reportado por el usuario -- mismo bug que en [→ Contexto_Base_Web.md §26B180]
    if (String(fila[TL.LINK_JSON_2 - 1] || '').trim() === '') {
      sh.getRange(filaHoja, TL.LINK_JSON_2).setValue(CFG.API_BASE + '/tournaments/%23' + tagTorSinHash);
      huboCambio = true;
    }
    if ((fila[TL.NIVEL_TOPE - 1] === '' || fila[TL.NIVEL_TOPE - 1] === null) &&
        torneoData.levelCap !== undefined && torneoData.levelCap !== null) {
      sh.getRange(filaHoja, TL.NIVEL_TOPE).setValue(Number(torneoData.levelCap));
      huboCambio = true;
    }
    // CORRECCIÓN (26-sep-2026, mismo fix que en procesarTListaNuevasFilas() [→ Contexto_Base_Web.md §26B181]
    if (fila[TL.PARTICIPANTES - 1] === '' || fila[TL.PARTICIPANTES - 1] === null) {
      sh.getRange(filaHoja, TL.PARTICIPANTES).setValue(
        (torneoData.capacity !== undefined && torneoData.capacity !== null) ? Number(torneoData.capacity) : jsonArray.length);
      huboCambio = true;
    }
    if ((fila[TL.CAPACIDAD - 1] === '' || fila[TL.CAPACIDAD - 1] === null) &&
        torneoData.maxCapacity !== undefined && torneoData.maxCapacity !== null) {
      sh.getRange(filaHoja, TL.CAPACIDAD).setValue(Number(torneoData.maxCapacity));
      huboCambio = true;
    }
    // Modo_ID/Modo se tratan como en procesarTListaNuevasFilas() (Fase 4): [→ Contexto_Base_Web.md §26B182]
    var modoIdApi = (torneoData.gameMode && torneoData.gameMode.id !== undefined && torneoData.gameMode.id !== null)
      ? Number(torneoData.gameMode.id) : null;
    var modoIdCelda = (fila[TL.MODO_ID - 1] !== '' && fila[TL.MODO_ID - 1] !== null)
      ? Number(fila[TL.MODO_ID - 1]) : null;
    if (modoIdCelda === null && modoIdApi !== null) {
      sh.getRange(filaHoja, TL.MODO_ID).setValue(modoIdApi);
      modoIdCelda = modoIdApi;
      huboCambio = true;
    }
    if (String(fila[TL.MODO - 1] || '').trim() === '' && modoIdCelda !== null) {
      sh.getRange(filaHoja, TL.MODO).setValue(_resolverModoDesdeCatalogo(modoIdCelda));
      huboCambio = true;
    }
    if (!(fila[TL.CREACION - 1] instanceof Date) || isNaN(fila[TL.CREACION - 1].getTime())) {
      var creacion = _parseFechaApiSupercell(torneoData.createdTime);
      if (creacion) {
        sh.getRange(filaHoja, TL.CREACION).setValue(creacion);
        _trySetFmt(sh, filaHoja, TL.CREACION, 'dd/mm/yyyy hh:mm:ss');
        huboCambio = true;
      }
    }
    // Preparación/Duración: misma conversión seg->min de la Fase 5 (la
    // celda guarda MINUTOS como valor real, nunca segundos).
    if (fila[TL.PREPARACION - 1] === '' || fila[TL.PREPARACION - 1] === null) {
      var prepSeg = (torneoData.preparationDuration !== undefined && torneoData.preparationDuration !== null)
        ? Number(torneoData.preparationDuration) : null;
      if (prepSeg !== null && !isNaN(prepSeg)) {
        sh.getRange(filaHoja, TL.PREPARACION).setValue(prepSeg / 60);
        huboCambio = true;
      }
    }
    if (fila[TL.DURACION - 1] === '' || fila[TL.DURACION - 1] === null) {
      var durSeg = (torneoData.duration !== undefined && torneoData.duration !== null)
        ? Number(torneoData.duration) : null;
      if (durSeg !== null && !isNaN(durSeg)) {
        sh.getRange(filaHoja, TL.DURACION).setValue(durSeg / 60);
        huboCambio = true;
      }
    }
    // Tipo/Estado: mismo mapeo "nunca inventar" de las Fases 6/7 -- si [→ Contexto_Base_Web.md §26B183]
    if (String(fila[TL.TIPO - 1] || '').trim() === '') {
      var tipoApi = torneoData.type;
      var tipoValor = (tipoApi === 'open') ? 'Abierto' :
                      (tipoApi === 'passwordProtected') ? 'Cerrado' : '';
      if (tipoValor) {
        sh.getRange(filaHoja, TL.TIPO).setValue(tipoValor);
        huboCambio = true;
      } else if (tipoApi) {
        Logger.log('[Reparación Fase 13] Fila ' + filaHoja + ': valor de type desconocido ("' + tipoApi + '") -- Tipo queda vacío.');
      }
    }
    if (String(fila[TL.ESTADO - 1] || '').trim() === '') {
      var statusApi = torneoData.status;
      var estadoValor = (statusApi === 'inPreparation') ? 'Planificado' :
                         (statusApi === 'inProgress') ? 'En progreso' :
                         (statusApi === 'ended') ? 'Realizado' : '';
      if (estadoValor) {
        sh.getRange(filaHoja, TL.ESTADO).setValue(estadoValor);
        huboCambio = true;
      } else if (statusApi) {
        Logger.log('[Reparación Fase 13] Fila ' + filaHoja + ': valor de status desconocido ("' + statusApi + '") -- Estado queda vacío.');
      }
    }

    // --- Organizador/Nom_Multi_Org/Tag_org + Organizador_Fuente (punto 3
    //     del docblock de arriba, excepción explícita del plan) ---
    var organizadorFuenteActual = String(fila[TL.ORGANIZADOR_FUENTE - 1] || '').trim();
    var creatorTagValor = String(torneoData.creatorTag || '').trim();
    if (organizadorFuenteActual !== 'API' && creatorTagValor) {
      var infoCreator = _resolverOrganizadorPorCreatorTag(creatorTagValor, mapaDirectorioOrg, mapaInactivosOrg);
      sh.getRange(filaHoja, TL.ORGANIZADOR).setValue(infoCreator.nombreOrg);
      sh.getRange(filaHoja, TL.NOM_MULTI_ORG).setValue(infoCreator.nomMultiOrg);
      sh.getRange(filaHoja, TL.TAG_ORG).setValue(infoCreator.tagOrg);
      sh.getRange(filaHoja, TL.ORGANIZADOR_FUENTE).setValue('API');
      huboCambio = true;
      Logger.log('[Reparación Fase 13] Fila ' + filaHoja + ': Organizador/Nom_Multi_Org/Tag_org completados por creatorTag (' + infoCreator.tagOrg + ').');
    }

    // --- T_Asistencia: solo si vino vacía o incompleta (punto 4) ---
    var idFila = String(fila[TL.ID - 1] || '').trim();
    if (idFila) {
      var tagsExistentes = mapaAsistenciaPorId[idFila] || {};
      var cantidadExistente = Object.keys(tagsExistentes).length;
      if (cantidadExistente < jsonArray.length) {
        var fechaFila = fila[TL.FECHA - 1];
        var temporadaFila = Number(fila[TL.TEMPORADA - 1]) || 0;
        _generarAsistenciaParaTorneo(ss, idFila, fechaFila, temporadaFila, jsonArray);
        huboCambio = true;
        Logger.log('[Reparación Fase 13] Fila ' + filaHoja + ': T_Asistencia refrescada (' +
                   cantidadExistente + ' -> ' + jsonArray.length + ' participante(s)).');
      }
    }

    if (huboCambio) reparados++;
  }

  _guardarModoCSVSiHayNuevos();

  // Se reaplican SIEMPRE (se corte o no por presupuesto -- las validaciones [→ Contexto_Base_Web.md §26B184]
  _aplicarDropdownAdminTLista(ss);
  _aplicarDropdownTagTor2TLista(ss);
  _aplicarDropdownEstadoTLista(ss);
  _aplicarDropdownMiembroActivoTLista(ss);
  _aplicarDropdownReaccionTLista(ss);
  _aplicarDropdownWhatsappTLista(ss);

  if (!cortadoPorPresupuesto) {
    props.deleteProperty(PROP_ULTIMA_FILA);
    regenerarTControlSheet(ss);
    Logger.log('[Reparación Fase 13] Pasada COMPLETA: ' + revisados + ' torneo(s) con Link_app revisado(s), ' +
               reparados + ' reparado(s). T_Control regenerado. NO se tocaron los documentos de Google Docs ' +
               '(actualizarDocParticipantesCalificadosTorneo()/actualizarDocGanadoresTorneo(), 28_Torneos_Docs.gs).');
  } else {
    Logger.log('[Reparación Fase 13] Pasada CORTADA por presupuesto: ' + revisados + ' torneo(s) revisado(s) en esta tanda, ' +
               reparados + ' reparado(s). T_Control todavía NO se regeneró (se regenera recién al terminar una pasada completa).');
  }
}

/**
 * _resolverOrganizadorPorCreatorTag(creatorTagCrudo, mapaDirectorio, mapaInactivos) [→ Contexto_Base_Web.md §26B185]
 */
function _resolverOrganizadorPorCreatorTag(creatorTagCrudo, mapaDirectorio, mapaInactivos) {
  var tag = String(creatorTagCrudo || '').trim();
  if (tag && tag.charAt(0) !== '#') tag = '#' + tag;
  if (!tag) return { nombreOrg: '', nomMultiOrg: '', tagOrg: '' };

  var infoDir = mapaDirectorio && mapaDirectorio[tag];
  if (infoDir) {
    return {
      nombreOrg:   infoDir.nombre   || '',
      nomMultiOrg: infoDir.nomMulti || '',
      tagOrg: tag
    };
  }

  var infoInact = mapaInactivos && mapaInactivos[tag];
  if (infoInact) {
    return {
      nombreOrg:   infoInact.nombre   || '',
      nomMultiOrg: infoInact.nomMulti || '',
      tagOrg: tag
    };
  }

  // Último recurso: nombre real de la cuenta desde la API OFICIAL de [→ Contexto_Base_Web.md §26B186]
  var playerData = _apiGet('/players/' + encodeTag(tag));
  var nombreApi = (playerData && playerData.name) ? String(playerData.name) : '';
  if (!playerData) {
    Logger.log('[T_Lista] _resolverOrganizadorPorCreatorTag(): ' + tag +
               ' no está en Directorio ni en Inactivos, y GET /players/' + tag +
               ' falló -- Nombre_Org queda vacío (Fase 8).');
  }
  return { nombreOrg: nombreApi, nomMultiOrg: '', tagOrg: tag };
}

function _determinarOrganizador(jsonArray, mapaDirectorio) {
  if (!jsonArray || jsonArray.length === 0) return { nombre: '', tag: '', clan: '', clanTag: '' };
  if (jsonArray.length === 1) return _extraerInfoOrganizador(jsonArray[0], mapaDirectorio);

  var priorityTags = ['#QRQULCCV8', '#GLPC8YQGV', '#GY0GJ09C0'];
  var foundMember = null;

  for (var p = 0; p < priorityTags.length; p++) {
    var targetTag = priorityTags[p];
    for (var i = 0; i < jsonArray.length; i++) {
      var tag = String(jsonArray[i].tag || '').trim();
      if (tag.charAt(0) !== '#') tag = '#' + tag;
      if (tag === targetTag) {
        foundMember = jsonArray[i];
        break;
      }
    }
    if (foundMember) break;
  }

  if (!foundMember) {
    var adminTags = _getTagsAdmin();
    for (var i = 0; i < jsonArray.length; i++) {
      var tag = String(jsonArray[i].tag || '').trim();
      if (tag.charAt(0) !== '#') tag = '#' + tag;
      if (adminTags.indexOf(tag) >= 0) {
        foundMember = jsonArray[i];
        break;
      }
    }
  }

  if (!foundMember) {
    foundMember = jsonArray[0];
  }

  return _extraerInfoOrganizador(foundMember, mapaDirectorio);
}

/**
 * _extraerInfoOrganizador(elemento, mapaDirectorio) [→ Contexto_Base_Web.md §26B187]
 */
function _extraerInfoOrganizador(elemento, mapaDirectorio) {
  if (!elemento) return { nombre: '', tag: '', clan: '', clanTag: '' };
  var tag = String(elemento.tag || '').trim();
  if (tag && tag.charAt(0) !== '#') tag = '#' + tag;
  var clanObj = elemento.clan || {};
  var clanTag = String(clanObj.tag || '').trim();
  if (clanTag && clanTag.charAt(0) !== '#') clanTag = '#' + clanTag;

  var infoDir = (mapaDirectorio && mapaDirectorio[tag]) || {};
  var nombre = String(infoDir.nomMulti || '').trim();
  if (!nombre) nombre = String(infoDir.nombre || '').trim();
  if (!nombre) nombre = String(elemento.name || ''); // tag no registrado en Directorio -- último recurso

  return {
    nombre: nombre,
    tag: tag,
    clan: String(clanObj.name || ''),
    clanTag: clanTag
  };
}

/**
 * _buscarInfoOrganizadorPorNomMulti(nomMulti) [→ Contexto_Base_Web.md §26B188]
 */
function _buscarInfoOrganizadorPorNomMulti(nomMulti) {
  var nm = String(nomMulti || '').trim();
  if (!nm) return null;
  var sh = _getSs().getSheetByName(CFG.SHEETS.ADMINISTRADORES);
  if (!sh || sh.getLastRow() < 2) return null;
  var datos = sh.getRange(2, 1, sh.getLastRow() - 1, ADMINISTRADORES_TOTAL_COLS).getValues();
  for (var i = 0; i < datos.length; i++) {
    if (String(datos[i][AC.NOM_MULTI - 1] || '').trim() !== nm) continue;
    var tag = String(datos[i][AC.TAG - 1] || '').trim();
    if (tag && tag.charAt(0) !== '#') tag = '#' + tag;
    var clanTag = String(datos[i][AC.CLAN_TAG - 1] || '').trim();
    if (clanTag && clanTag.charAt(0) !== '#') clanTag = '#' + clanTag;
    return { nombre: nm, tag: tag, clan: String(datos[i][AC.CLAN - 1] || ''), clanTag: clanTag };
  }
  return null;
}

// FIX (09-sep-2026, pedido usuario — Consolidado_Cambios_Pendientes_ [→ Contexto_Base_Web.md §26B189]
var FALLBACK_TAG_ORG_POR_NOMMULTI = {
  'Diana':  ['#2GG8PJ8GC'],
  'Leder':  ['#V20GJRC9Y'],
  'Maikel': ['#QRQULCCV8', '#GLPC8YQGV', '#GY0GJ09C0']
};

/**
 * _getTagsAdminPorNomMulti(nomMulti) [→ Contexto_Base_Web.md §26B190]
 */
function _getTagsAdminPorNomMulti(nomMulti) {
  var nm = String(nomMulti || '').trim();
  if (!nm) return [];
  var sh = _getSs().getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!sh || sh.getLastRow() < 2) return [];
  var datos = sh.getRange(2, 1, sh.getLastRow() - 1, DIR_SHEET_COLS).getValues();
  var tags = [];
  for (var i = 0; i < datos.length; i++) {
    var nomMultiFila = String(datos[i][IC.NOM_MULTI - 1] || '').trim();
    var esAdmin = String(datos[i][IC.ADMIN - 1] || '').trim() === 'Sí';
    if (nomMultiFila !== nm || !esAdmin) continue;
    var tag = String(datos[i][IC.TAG - 1] || '').trim();
    if (tag && tag.charAt(0) !== '#') tag = '#' + tag;
    if (tag) tags.push(tag);
  }
  return tags;
}

/**
 * _getNomMultiPorTag(tag) [→ Contexto_Base_Web.md §26B191]
 */
function _getNomMultiPorTag(tag) {
  var t = String(tag || '').trim();
  if (!t) return null;
  if (t.charAt(0) !== '#') t = '#' + t;
  var sh = _getSs().getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!sh || sh.getLastRow() < 2) return null;
  var datos = sh.getRange(2, 1, sh.getLastRow() - 1, DIR_SHEET_COLS).getValues();
  for (var i = 0; i < datos.length; i++) {
    var tagFila = String(datos[i][IC.TAG - 1] || '').trim();
    if (tagFila.charAt(0) !== '#') tagFila = '#' + tagFila;
    if (tagFila !== t) continue;
    var esAdmin = String(datos[i][IC.ADMIN - 1] || '').trim() === 'Sí';
    if (!esAdmin) return null;
    var nom = String(datos[i][IC.NOM_MULTI - 1] || '').trim();
    if (!nom) nom = String(datos[i][IC.NOMBRE - 1] || '').trim();
    return nom || null;
  }
  return null;
}

/**
 * _resolverTagOrgDesdeOrganizador(nomMulti, jsonArray, mapaDirectorio) [→ Contexto_Base_Web.md §26B192]
 */
function _resolverTagOrgDesdeOrganizador(nomMulti, jsonArray, mapaDirectorio) {
  var nm = String(nomMulti || '').trim();
  var tagsAdmin = _getTagsAdminPorNomMulti(nm);

  if (jsonArray && jsonArray.length > 0 && tagsAdmin.length > 0) {
    for (var i = 0; i < jsonArray.length; i++) {
      var tagJson = String(jsonArray[i].tag || '').trim();
      if (tagJson.charAt(0) !== '#') tagJson = '#' + tagJson;
      if (tagsAdmin.indexOf(tagJson) >= 0) {
        var info = _extraerInfoOrganizador(jsonArray[i], mapaDirectorio);
        return { nombre: nm, tag: tagJson, clan: info.clan, clanTag: info.clanTag };
      }
    }
  }

  // Ninguno de sus tags admin apareció en el JSON de este torneo.
  var fallbacks = FALLBACK_TAG_ORG_POR_NOMMULTI[nm];
  if (fallbacks && fallbacks.length > 0) {
    return { nombre: nm, tag: fallbacks[0], clan: '', clanTag: '' };
  }

  var infoBuscada = _buscarInfoOrganizadorPorNomMulti(nm);
  if (infoBuscada) return infoBuscada;

  // Nom_Multi no encontrado en Administradores tampoco -- no hay nada más [→ Contexto_Base_Web.md §26B193]
  return { nombre: nm, tag: '', clan: '', clanTag: '' };
}

/**
 * _derivarClanClanTagDesdeTagOrg(tag, jsonArray, mapaDirectorio) [→ Contexto_Base_Web.md §26B194]
 */
function _derivarClanClanTagDesdeTagOrg(tag, jsonArray, mapaDirectorio) {
  var t = String(tag || '').trim();
  if (!t) return { clan: '', clanTag: '' };
  if (t.charAt(0) !== '#') t = '#' + t;

  if (jsonArray) {
    for (var i = 0; i < jsonArray.length; i++) {
      var tagJson = String(jsonArray[i].tag || '').trim();
      if (tagJson.charAt(0) !== '#') tagJson = '#' + tagJson;
      if (tagJson === t) {
        var info = _extraerInfoOrganizador(jsonArray[i], mapaDirectorio);
        if (info.clan || info.clanTag) return { clan: info.clan, clanTag: info.clanTag };
        break;
      }
    }
  }

  var infoDir = mapaDirectorio && mapaDirectorio[t];
  if (infoDir) return { clan: infoDir.clan || '', clanTag: infoDir.clanTag || '' };

  return { clan: '', clanTag: '' };
}

// FIX (08-sep-2026, pedido usuario — header de 2 filas confirmado por PDF): [→ Contexto_Base_Web.md §26B195]
function _aplicarDropdownAdminTLista(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.T_LISTA);
  if (!sh || sh.getLastRow() < 3) return;
  var numFilas = sh.getLastRow() - 2;

  // FIX (31/08/2026, pedido del usuario -- caso real: tras reordenar a mano [→ Contexto_Base_Web.md §26B196]
  sh.getRange(3, 1, numFilas, TL_TOTAL_COLS).clearDataValidations();

  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  var adminNombres = [];
  if (shDir && shDir.getLastRow() >= 2) {
    var dirData = shDir.getRange(2, 1, shDir.getLastRow() - 1, DIR_SHEET_COLS).getValues();
    var adminTags = _getTagsAdmin();
    for (var i = 0; i < dirData.length; i++) {
      var tag = String(dirData[i][DC.TAG - 1] || '').trim();
      if (tag.charAt(0) !== '#') tag = '#' + tag;
      if (adminTags.indexOf(tag) >= 0) {
        var nom = String(dirData[i][DC.NOM_MULTI - 1] || '').trim();
        if (!nom) nom = String(dirData[i][DC.NOMBRE - 1] || '').trim();
        if (nom && adminNombres.indexOf(nom) < 0) adminNombres.push(nom);
      }
    }
  }

  if (adminNombres.length === 0) return;
  adminNombres.sort();

  var dv = SpreadsheetApp.newDataValidation().requireValueInList(adminNombres, true).setAllowInvalid(false).build();
  sh.getRange(3, TL.NOM_MULTI_ORG, numFilas, 1).setDataValidation(dv);
}

/**
 * _aplicarDropdownTagTor2TLista(ss) [→ Contexto_Base_Web.md §26B197]
 */
function _aplicarDropdownTagTor2TLista(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.T_LISTA);
  if (!sh || sh.getLastRow() < 3) return;
  var numFilas = sh.getLastRow() - 2;

  sh.getRange(3, TL.TAG_TOR_2, numFilas, 1).clearDataValidations();

  var datos = sh.getRange(3, 1, numFilas, TL_TOTAL_COLS).getValues();
  var tags = [];
  for (var i = 0; i < datos.length; i++) {
    var t = String(datos[i][TL.TAG_TOR - 1] || '').trim();
    if (t && tags.indexOf(t) < 0) tags.push(t);
  }
  if (tags.length === 0) return; // sin ningún Tag_Tor registrado todavía, nada para ofrecer en la lista
  tags.sort();

  var dv = SpreadsheetApp.newDataValidation().requireValueInList(tags, true).setAllowInvalid(false).build();
  sh.getRange(3, TL.TAG_TOR_2, numFilas, 1).setDataValidation(dv);
}

/**
 * _aplicarDropdownEstadoTLista(ss) [→ Contexto_Base_Web.md §26B198]
 */
function _aplicarDropdownEstadoTLista(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.T_LISTA);
  if (!sh || sh.getLastRow() < 3) return;
  var numFilas = sh.getLastRow() - 2;

  sh.getRange(3, TL.ESTADO, numFilas, 1).clearDataValidations();
  // FASE 7 (25-sep-2026, rediseño T_Lista, punto D): se agrega "En [→ Contexto_Base_Web.md §26B199]
  var dv = SpreadsheetApp.newDataValidation().requireValueInList(['Planificado', 'En progreso', 'Realizado'], true).setAllowInvalid(false).build();
  sh.getRange(3, TL.ESTADO, numFilas, 1).setDataValidation(dv);
}

/**
 * _aplicarDropdownMiembroActivoTLista(ss) [→ Contexto_Base_Web.md §26B200]
 */
function _aplicarDropdownMiembroActivoTLista(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.T_LISTA);
  if (!sh || sh.getLastRow() < 3) return;
  var numFilas = sh.getLastRow() - 2;

  sh.getRange(3, TL.MIEMBRO_ACTIVO, numFilas, 1).clearDataValidations();
  var dv = SpreadsheetApp.newDataValidation().requireValueInList(['Sí', 'No'], true).setAllowInvalid(false).build();
  sh.getRange(3, TL.MIEMBRO_ACTIVO, numFilas, 1).setDataValidation(dv);
}

/**
 * _aplicarDropdownReaccionTLista(ss) [→ Contexto_Base_Web.md §26B201]
 */
function _aplicarDropdownReaccionTLista(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.T_LISTA);
  if (!sh || sh.getLastRow() < 3) return;
  var numFilas = sh.getLastRow() - 2;

  sh.getRange(3, TL.REACCION, numFilas, 1).clearDataValidations();
  var dv = SpreadsheetApp.newDataValidation().requireValueInList(['Sí', 'No'], true).setAllowInvalid(false).build();
  sh.getRange(3, TL.REACCION, numFilas, 1).setDataValidation(dv);
}

/**
 * _aplicarDropdownWhatsappTLista(ss) [→ Contexto_Base_Web.md §26B202]
 */
function _aplicarDropdownWhatsappTLista(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.T_LISTA);
  if (!sh || sh.getLastRow() < 3) return;
  var numFilas = sh.getLastRow() - 2;

  sh.getRange(3, TL.WHATSAPP, numFilas, 1).clearDataValidations();
  var dv = SpreadsheetApp.newDataValidation().requireValueInList(['Sí', 'No'], true).setAllowInvalid(false).build();
  sh.getRange(3, TL.WHATSAPP, numFilas, 1).setDataValidation(dv);
}

/**
 * _aplicarDropdownId2SLista(ss) [→ Contexto_Base_Web.md §26B203]
 */
function _aplicarDropdownId2SLista(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.S_LISTA);
  if (!sh || sh.getLastRow() < 3) return;
  var numFilas = sh.getLastRow() - 2;

  sh.getRange(3, SL.ID_2, numFilas, 1).clearDataValidations();

  var datos = sh.getRange(3, 1, numFilas, SL_TOTAL_COLS).getValues();
  var ids = [];
  for (var i = 0; i < datos.length; i++) {
    var idVal = String(datos[i][SL.ID - 1] || '').trim();
    if (idVal && ids.indexOf(idVal) < 0) ids.push(idVal);
  }
  if (ids.length === 0) return; // sin ningún ID registrado todavía, nada para ofrecer en la lista
  ids.sort();

  var dv = SpreadsheetApp.newDataValidation().requireValueInList(ids, true).setAllowInvalid(false).build();
  sh.getRange(3, SL.ID_2, numFilas, 1).setDataValidation(dv);
}

/**
 * _aplicarDropdownEstadoSLista(ss) [→ Contexto_Base_Web.md §26B204]
 */
function _aplicarDropdownEstadoSLista(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.S_LISTA);
  if (!sh || sh.getLastRow() < 3) return;
  var numFilas = sh.getLastRow() - 2;

  sh.getRange(3, SL.ESTADO, numFilas, 1).clearDataValidations();
  var dv = SpreadsheetApp.newDataValidation().requireValueInList(['Planificado', 'Realizado'], true).setAllowInvalid(false).build();
  sh.getRange(3, SL.ESTADO, numFilas, 1).setDataValidation(dv);
}

/**
 * _aplicarDropdownMiembroActivoSLista(ss) [→ Contexto_Base_Web.md §26B205]
 */
function _aplicarDropdownMiembroActivoSLista(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.S_LISTA);
  if (!sh || sh.getLastRow() < 3) return;
  var numFilas = sh.getLastRow() - 2;

  sh.getRange(3, SL.MIEMBRO_ACTIVO, numFilas, 1).clearDataValidations();
  var dv = SpreadsheetApp.newDataValidation().requireValueInList(['Sí', 'No'], true).setAllowInvalid(false).build();
  sh.getRange(3, SL.MIEMBRO_ACTIVO, numFilas, 1).setDataValidation(dv);
}

/**
 * _aplicarDropdownReaccionSLista(ss) [→ Contexto_Base_Web.md §26B206]
 */
function _aplicarDropdownReaccionSLista(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.S_LISTA);
  if (!sh || sh.getLastRow() < 3) return;
  var numFilas = sh.getLastRow() - 2;

  sh.getRange(3, SL.REACCION, numFilas, 1).clearDataValidations();
  var dv = SpreadsheetApp.newDataValidation().requireValueInList(['Sí', 'No'], true).setAllowInvalid(false).build();
  sh.getRange(3, SL.REACCION, numFilas, 1).setDataValidation(dv);
}

/**
 * _aplicarDropdownWhatsappSLista(ss) [→ Contexto_Base_Web.md §26B207]
 */
function _aplicarDropdownWhatsappSLista(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.S_LISTA);
  if (!sh || sh.getLastRow() < 3) return;
  var numFilas = sh.getLastRow() - 2;

  sh.getRange(3, SL.WHATSAPP, numFilas, 1).clearDataValidations();
  var dv = SpreadsheetApp.newDataValidation().requireValueInList(['Sí', 'No'], true).setAllowInvalid(false).build();
  sh.getRange(3, SL.WHATSAPP, numFilas, 1).setDataValidation(dv);
}

/**
 * _aplicarDropdownAdminSLista(ss) [→ Contexto_Base_Web.md §26B208]
 */
function _aplicarDropdownAdminSLista(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.S_LISTA);
  if (!sh || sh.getLastRow() < 3) return;
  var numFilas = sh.getLastRow() - 2;

  sh.getRange(3, SL.ORGANIZADOR, numFilas, 1).clearDataValidations();

  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  var adminNombres = [];
  if (shDir && shDir.getLastRow() >= 2) {
    var dirData = shDir.getRange(2, 1, shDir.getLastRow() - 1, DIR_SHEET_COLS).getValues();
    var adminTags = _getTagsAdmin();
    for (var i = 0; i < dirData.length; i++) {
      var tag = String(dirData[i][DC.TAG - 1] || '').trim();
      if (tag.charAt(0) !== '#') tag = '#' + tag;
      if (adminTags.indexOf(tag) >= 0) {
        var nom = String(dirData[i][DC.NOM_MULTI - 1] || '').trim();
        if (!nom) nom = String(dirData[i][DC.NOMBRE - 1] || '').trim();
        if (nom && adminNombres.indexOf(nom) < 0) adminNombres.push(nom);
      }
    }
  }

  if (adminNombres.length === 0) return;
  adminNombres.sort();

  var dv = SpreadsheetApp.newDataValidation().requireValueInList(adminNombres, true).setAllowInvalid(false).build();
  sh.getRange(3, SL.ORGANIZADOR, numFilas, 1).setDataValidation(dv);
}

/**
 * _aplicarDropdownClanSLista(ss) [→ Contexto_Base_Web.md §26B209]
 */
function _aplicarDropdownClanSLista(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.S_LISTA);
  if (!sh || sh.getLastRow() < 3) return;
  var numFilas = sh.getLastRow() - 2;

  var shClan = ss.getSheetByName(CFG.SHEETS.CLAN);
  var nombresClan = [];
  if (shClan && shClan.getLastRow() >= 2) {
    // Mismo orden que CFG.TERNA_TAGS: se recorre CFG.TERNA_TAGS y se busca [→ Contexto_Base_Web.md §26B210]
    var clanData = shClan.getRange(2, 1, shClan.getLastRow() - 1, CC.CONDICION).getValues();
    for (var t = 0; t < CFG.TERNA_TAGS.length; t++) {
      var tagBuscado = CFG.TERNA_TAGS[t];
      for (var r = 0; r < clanData.length; r++) {
        if (String(clanData[r][CC.CLAN_TAG - 1] || '').trim() === tagBuscado) {
          nombresClan.push(String(clanData[r][CC.NOMBRE - 1] || '').trim());
          break;
        }
      }
    }
  }

  sh.getRange(3, SL.CLAN, numFilas, 1).clearDataValidations();
  if (nombresClan.length === 0) return;

  var dv = SpreadsheetApp.newDataValidation().requireValueInList(nombresClan, true).setAllowInvalid(false).build();
  sh.getRange(3, SL.CLAN, numFilas, 1).setDataValidation(dv);
}

/**
 * procesarSListaNuevasFilas(ss) [→ Contexto_Base_Web.md §26B211]
 */
function procesarSListaNuevasFilas(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.S_LISTA);
  if (!sh || sh.getLastRow() < 3) return [];

  // Mismo motivo que en procesarTListaNuevasFilas(): la validación de [→ Contexto_Base_Web.md §26B212]
  sh.getRange(3, 1, sh.getLastRow() - 2, SL_TOTAL_COLS).clearDataValidations();

  var mapaDirectorioOrg = _getDirectorioLookupPorTag(ss);
  var numFilas = sh.getLastRow() - 2;
  var datos = sh.getRange(3, 1, numFilas, SL_TOTAL_COLS).getValues();
  var idsResueltos = [];

  for (var i = 0; i < datos.length; i++) {
    var fila = datos[i];
    var filaHoja = i + 3;
    var algoResuelto = false;

    // FIX (12-sep-2026): ver docblock de arriba -- ID de reserva, único [→ Contexto_Base_Web.md §26B213]
    var idExistente = String(fila[SL.ID - 1] || '').trim();
    if (!idExistente) {
      var fechaFila = fila[SL.FECHA - 1];
      if (fechaFila instanceof Date && !isNaN(fechaFila.getTime())) {
        var temporadaManual = fila[SL.TEMPORADA - 1];
        var temporadaFila = (temporadaManual !== '' && temporadaManual !== null && !isNaN(Number(temporadaManual)))
          ? Number(temporadaManual)
          : _calcularTemporadaParaFecha(fechaFila);
        var semanaFila = _calcularSemanaTorneo(fechaFila, temporadaFila);
        var numSorteoEnSemana = _contarSorteosEnSemana(datos, temporadaFila, semanaFila, i);
        var idReserva = 'S_' + Utilities.formatString('%03d', temporadaFila) + '_' + semanaFila + '_' + Utilities.formatString('%02d', numSorteoEnSemana);
        sh.getRange(filaHoja, SL.TEMPORADA).setValue(temporadaFila);
        sh.getRange(filaHoja, SL.ID).setValue(idReserva);
        sh.getRange(filaHoja, SL.NUM).setValue(filaHoja - 2);
        datos[i][SL.TEMPORADA - 1] = temporadaFila;
        datos[i][SL.ID - 1] = idReserva;
        fila[SL.ID - 1] = idReserva;
        algoResuelto = true;
        Logger.log('[S_Lista] Fila ' + filaHoja + ': ID asignado ' + idReserva + ' (fecha real respetada).');
      } else {
        Logger.log('[S_Lista] Fila ' + filaHoja + ': sin Fecha válida, no se puede generar el ID todavía.');
      }
    }

    var orgManual = String(fila[SL.ORGANIZADOR - 1] || '').trim();
    var tagOrgManual = String(fila[SL.TAG_ORG - 1] || '').trim();
    var clanManual = String(fila[SL.CLAN - 1] || '').trim();
    var clanTagManual = String(fila[SL.CLAN_TAG - 1] || '').trim();

    if (orgManual || tagOrgManual || clanManual || clanTagManual) {
      var infoOrg = null;

      if (orgManual && tagOrgManual) {
        // Caso D: ambos llenos, no se toca ninguno de los dos.
      } else if (!orgManual && !tagOrgManual) {
        // Caso A: sin JSON no hay auto-detección posible (ver docblock) —
        // se deja tal cual, pendiente de elegir Organizador a mano.
      } else if (orgManual && !tagOrgManual) {
        // Caso B: Organizador ya escrito a mano, se resuelve SOLO Tag_org. [→ Contexto_Base_Web.md §26B214]
        infoOrg = _resolverTagOrgDesdeOrganizador(orgManual, null, mapaDirectorioOrg);
        if (infoOrg.tag) {
          sh.getRange(filaHoja, SL.TAG_ORG).setValue(infoOrg.tag);
          algoResuelto = true;
        }
      } else {
        // Caso C: Tag_org ya escrito a mano, Organizador vacío.
        var nomMultiDesdeTag = _getNomMultiPorTag(tagOrgManual);
        if (nomMultiDesdeTag) {
          sh.getRange(filaHoja, SL.ORGANIZADOR).setValue(nomMultiDesdeTag);
          infoOrg = { nombre: nomMultiDesdeTag, tag: tagOrgManual, clan: '', clanTag: '' };
          algoResuelto = true;
        }
        // Si el tag no es válido, se deja tal cual (sin JSON no hay Caso A [→ Contexto_Base_Web.md §26B215]
      }

      // Autocompletado INDEPENDIENTE de Clan/ClanTag (sección 8), solo desde [→ Contexto_Base_Web.md §26B216]
      var tagOrgFinal = tagOrgManual || (infoOrg && infoOrg.tag) || '';
      if ((!clanManual || !clanTagManual) && tagOrgFinal) {
        var infoClan = _derivarClanClanTagDesdeTagOrg(tagOrgFinal, null, mapaDirectorioOrg);
        if (!clanManual && infoClan.clan) { sh.getRange(filaHoja, SL.CLAN).setValue(infoClan.clan); algoResuelto = true; }
        if (!clanTagManual && infoClan.clanTag) { sh.getRange(filaHoja, SL.CLAN_TAG).setValue(infoClan.clanTag); algoResuelto = true; }
      }
    }

    if (algoResuelto) {
      var idFila = String(fila[SL.ID - 1] || '').trim();
      if (idFila) idsResueltos.push(idFila);
    }
  }

  _aplicarDropdownAdminSLista(ss);
  _aplicarDropdownClanSLista(ss);
  _aplicarDropdownId2SLista(ss);
  _aplicarDropdownEstadoSLista(ss);
  _aplicarDropdownMiembroActivoSLista(ss);
  _aplicarDropdownReaccionSLista(ss);
  // FIX (12-sep-2026, pedido del usuario): faltaba reaplicar acá también el
  // desplegable de WhatsApp, mismo criterio que Miembro activo/Reacción.
  _aplicarDropdownWhatsappSLista(ss);

  if (sh.getLastRow() >= 3) {
    applyBorderCenter(sh.getRange(3, 1, sh.getLastRow() - 2, SL_TOTAL_COLS));
  }

  return idsResueltos;
}

/**
 * procesarSorteos() [→ Contexto_Base_Web.md §26B217]
 */
function procesarSorteos() {
  var ss = _getSs();

  var idsResueltos = procesarSListaNuevasFilas(ss);
  if (idsResueltos.length > 0) {
    Logger.log('[Sorteos] Resuelto Organizador/Tag_org/Clan/ClanTag en ' + idsResueltos.length + ' fila(s) de S_Lista: ' + idsResueltos.join(', '));
  }

  sincronizarRequisitosSorteo();
  actualizarDocParticipantesCalificados();
  // FASE (10-sep-2026, pedido del usuario -- consolidado sección 1, punto [→ Contexto_Base_Web.md §26B218]
  actualizarDocGanadoresSorteo();

  // NUEVO (15-sep-2026, pedido del usuario): complemento de [→ Contexto_Base_Web.md §26B219]
  try {
    actualizarDocNoCalificadosSorteo();
  } catch (eNCS2) {
    Logger.log('[Sorteos] actualizarDocNoCalificadosSorteo() falló (se continúa): ' + eNCS2.message);
  }

  return true;
}

/**
 * _getConfigMasRecienteCategoria(nombreCategoria) [→ Contexto_Base_Web.md §26B220]
 */

/**
 * _parseSemanasSorteo(semanasStr) [→ Contexto_Base_Web.md §26B221]
 */
function _parseSemanasSorteo(semanasStr) {
  var resultado = [];
  String(semanasStr || '').split(',').forEach(function (token) {
    var m = String(token || '').trim().match(/^T(\d+)_S(\d+)$/i);
    if (!m) return;
    resultado.push({ temporada: Number(m[1]), semana: Number(m[2]) });
  });
  return resultado;
}

/**
 * FIX (12-sep-2026, pedido del usuario -- precarga de "Modificar" debe leer [→ Contexto_Base_Web.md §26B222]
 */

/**
 * _getIdVigenteExtra(nombreCategoria) [→ Contexto_Base_Web.md §26B223]
 */
function _getIdVigenteExtra(nombreCategoria) {
  try {
    var ss = _getSs();
    var shExtra = ss.getSheetByName(CFG.SHEETS.EXTRA);
    if (!shExtra) return '';
    var col = (nombreCategoria === 'Torneo') ? 20 : 21; // Torneo_Vigente_ID / Sorteo_Vigente_ID, ver _setupExtra()
    var val = shExtra.getRange(2, col).getValue();
    return val ? String(val).trim() : '';
  } catch (e) {
    Logger.log('[VigenteExtra] Error leyendo Extra!Torneo_Vigente_ID/Sorteo_Vigente_ID: ' + e.message);
    return _valorExtraDesdeCsv_((nombreCategoria === 'Torneo') ? ['Torneo_Vigente_ID'] : ['Sorteo_Vigente_ID']); // PF073: respaldo CSV
  }
}

/**
 * _getIdVigenteExtraCR(tipo) [→ Contexto_Base_Web.md §26B224]
 */
function _getIdVigenteExtraCR(tipo) {
  try {
    var ss = _getSs();
    var shExtra = ss.getSheetByName(CFG.SHEETS.EXTRA);
    if (!shExtra) return '';
    var col = (tipo === 'Ascenso') ? 22 : 23; // Ascenso_Vigente_ID / Descenso_Vigente_ID, ver _setupExtra()
    var val = shExtra.getRange(2, col).getValue();
    return val ? String(val).trim() : '';
  } catch (e) {
    Logger.log('[VigenteExtra] Error leyendo Extra!Ascenso_Vigente_ID/Descenso_Vigente_ID: ' + e.message);
    return _valorExtraDesdeCsv_((tipo === 'Ascenso') ? ['Ascenso_Vigente_ID'] : ['Descenso_Vigente_ID']); // PF073: respaldo CSV
  }
}

// _valorExtraDesdeCsv_(nombres): PF073. Valor de la fila 2 de Extra, leído de Backup_Extra.csv por NOMBRE de encabezado (el CSV se mapea por encabezado, no por posición; ver importarExtraDesdeCSV). Devuelve '' si no hay CSV, columna o valor; nunca lanza error. [→ Contexto_Base_Web.md §PF073]
function _valorExtraDesdeCsv_(nombres) {
  try {
    var lec = _obtenerFilasConFallbackCSV(_getSs(), CFG.SHEETS.EXTRA, 'Backup_Extra.csv');
    if (!lec.filas.length) return '';
    for (var n = 0; n < nombres.length; n++) {
      var idx = lec.headerIdx[nombres[n]];
      if (idx === undefined) continue;
      var v = lec.filas[0][idx];
      if (v !== '' && v !== null && v !== undefined) return String(v).trim();
    }
  } catch (e) {
    Logger.log('[VigenteExtra] Tampoco se pudo leer Backup_Extra.csv: ' + e);
  }
  return '';
}

function _getConfigMasRecienteCategoria(nombreCategoria, id) {
  var esTorneo = (nombreCategoria === 'Torneo');
  var ss = _getSs();
  // PF073: si Sheets falla se trata como hoja vacía (devuelve []), igual que cuando la hoja no existe. [→ Contexto_Base_Web.md §PF073]
  var sh = _hojaConFilas_(ss, esTorneo ? CFG.SHEETS.T_LISTA : CFG.SHEETS.S_LISTA, 3);
  if (!sh) return [];

  var totalCols = esTorneo ? TL_TOTAL_COLS : SL_TOTAL_COLS;
  var datos = sh.getRange(3, 1, sh.getLastRow() - 2, totalCols).getValues();

  var COL_FECHA     = esTorneo ? TL.FECHA : SL.FECHA;
  var COL_ID        = esTorneo ? TL.ID : SL.ID;
  var COLS_MINT     = esTorneo ? TL_MIN_T_COLS : SL_MIN_S_COLS;
  var COLS_ATAQUES  = esTorneo ? TL_ATAQUES_COLS : SL_ATAQUES_COLS;
  var COLS_TORNEOS  = esTorneo ? null : SL_TORNEOS_COLS; // T_Lista no tiene esta columna
  var COL_MIEMBRO   = esTorneo ? TL.MIEMBRO_ACTIVO : SL.MIEMBRO_ACTIVO;
  var COL_REACCION  = esTorneo ? TL.REACCION : SL.REACCION;
  // FIX (12-sep-2026, pedido del usuario -- consolidado, sección 1 y 8, [→ Contexto_Base_Web.md §26B225]
  var COL_WHATSAPP  = esTorneo ? TL.WHATSAPP : SL.WHATSAPP;
  // FIX (12-sep-2026, pedido del usuario -- requisito nuevo "Barcos"): ver [→ Contexto_Base_Web.md §26B226]
  var COL_BARCOS    = esTorneo ? TL.BARCOS : SL.BARCOS;
  var COL_DELTA     = esTorneo ? null : SL.MIN_S_DELTA; // T_Lista no tiene esta columna
  // Semanas (FIX 11-sep-2026, pedido del usuario -- segunda vuelta: se [→ Contexto_Base_Web.md §26B227]
  var COL_SEMANAS   = esTorneo ? TL.SEMANAS : SL.SEMANAS;
  // Premios (FIX 12-sep-2026, pedido del usuario -- consolidado, sección [→ Contexto_Base_Web.md §26B228]
  var COL_PREMIOS   = esTorneo ? TL.PREMIOS : SL.PREMIOS;

  // Fila objetivo: [→ Contexto_Base_Web.md §26B229]
  var filaMasReciente = null;
  if (id) {
    for (var j = 0; j < datos.length; j++) {
      if (String(datos[j][COL_ID - 1] || '') === String(id)) {
        filaMasReciente = datos[j];
        break;
      }
    }
    if (!filaMasReciente) return [];
  } else {
    var idVigenteExtra = _getIdVigenteExtra(nombreCategoria);
    if (idVigenteExtra) {
      for (var k = 0; k < datos.length; k++) {
        if (String(datos[k][COL_ID - 1] || '') === String(idVigenteExtra)) {
          filaMasReciente = datos[k];
          break;
        }
      }
    }
    if (!filaMasReciente) {
      // Respaldo (ver punto 3 del docblock de arriba): ni Extra!*_Vigente_ID
      // tenía un ID válido, se usa el criterio histórico.
      var fechaMasReciente = -1;
      for (var i = 0; i < datos.length; i++) {
        var fila = datos[i];
        var fechaVal = fila[COL_FECHA - 1];
        var t = (fechaVal instanceof Date) ? fechaVal.getTime() : 0;
        if (!fila[COL_FECHA - 1] && !fila[COL_ID - 1]) continue; // fila totalmente vacía
        if (t >= fechaMasReciente) {
          fechaMasReciente = t;
          filaMasReciente = fila;
        }
      }
    }
  }
  if (!filaMasReciente) return [];

  var miembroActivo = { activo: String(filaMasReciente[COL_MIEMBRO - 1] || '').trim() === 'Sí' };
  var reaccion = { activo: String(filaMasReciente[COL_REACCION - 1] || '').trim() === 'Sí' };
  // whatsapp (FIX 12-sep-2026, ver comentario de COL_WHATSAPP más arriba):
  // mismo criterio exacto que miembroActivo/reaccion.
  var whatsapp = { activo: String(filaMasReciente[COL_WHATSAPP - 1] || '').trim() === 'Sí' };
  // Barcos (FIX 12-sep-2026, pedido del usuario -- requisito nuevo, [→ Contexto_Base_Web.md §26B230]
  var celdaBarcos = filaMasReciente[COL_BARCOS - 1];
  var barcosConfigurado = (celdaBarcos !== '' && celdaBarcos !== null && celdaBarcos !== undefined);
  var barcos = { activo: barcosConfigurado, qty: barcosConfigurado ? (Number(celdaBarcos) || 0) : null };
  // Delta (FASE 10-sep-2026, pedido del usuario): a diferencia de Min_S, [→ Contexto_Base_Web.md §26B231]
  var qtyDelta = COL_DELTA ? (Number(filaMasReciente[COL_DELTA - 1]) || 0) : 0;

  // idFila (FASE 10-sep-2026, pedido del usuario -- consolidado sección 1, [→ Contexto_Base_Web.md §26B232]
  var idFilaMasReciente = filaMasReciente[COL_ID - 1];

  // Semanas (FIX 11-sep-2026, pedido del usuario -- columna de S_Lista, y [→ Contexto_Base_Web.md §26B233]
  var semanasSorteo = COL_SEMANAS
    ? _parseSemanasSorteo(filaMasReciente[COL_SEMANAS - 1])
    : [];

  // Premios (FIX 12-sep-2026, ver comentario de COL_PREMIOS más arriba): [→ Contexto_Base_Web.md §26B234]
  var premiosStr = String(filaMasReciente[COL_PREMIOS - 1] || '').trim();

  var resultado = [];
  // Mismo orden que antes tenía T_Requisitos: CFG.TERNA_TAGS (orden Terna
  // oficial). Índice 0 = C1 (clan principal) .. índice 3 = C4 (Mini乂Ternas™).
  CFG.TERNA_TAGS.forEach(function (tag, idx) {
    var nombreClan = _getNombreClanDump(tag);

    var qtyMinT = Number(filaMasReciente[COLS_MINT[idx] - 1]) || 0;
    var qtyAtaques = Number(filaMasReciente[COLS_ATAQUES[idx] - 1]) || 0;
    var qtyTorneos = COLS_TORNEOS ? (Number(filaMasReciente[COLS_TORNEOS[idx] - 1]) || 0) : 0;

    // Torneo/Sorteo en T_Requisitos siempre tenían Min_T "fusionado" [→ Contexto_Base_Web.md §26B235]
    var minTUnico = { activo: qtyMinT > 0, qty: qtyMinT };

    resultado.push({
      clan: nombreClan,
      minTMiembro: minTUnico,
      minT: minTUnico,
      minTColider: minTUnico,
      ataques: { activo: qtyAtaques > 0, qty: qtyAtaques },
      torneos: { activo: qtyTorneos > 0, qty: qtyTorneos },
      miembroActivo: miembroActivo,
      reaccion: reaccion,
      whatsapp: whatsapp,
      barcos: barcos,
      delta: qtyDelta,
      idFila: idFilaMasReciente,
      semanas: semanasSorteo,
      premios: premiosStr
    });
  });

  return resultado;
}

/**
 * _getUltimoRegistroTorneoOSorteo(nombreCategoria) [→ Contexto_Base_Web.md §26B236]
 */
function _getUltimoRegistroTorneoOSorteo(nombreCategoria) {
  var esTorneo = (nombreCategoria === 'Torneo');
  var ss = _getSs();
  var sh = ss.getSheetByName(esTorneo ? CFG.SHEETS.T_LISTA : CFG.SHEETS.S_LISTA);
  if (!sh || sh.getLastRow() < 3) return null;

  var totalCols = esTorneo ? TL_TOTAL_COLS : SL_TOTAL_COLS;
  var datos = sh.getRange(3, 1, sh.getLastRow() - 2, totalCols).getValues();

  var COL_FECHA       = esTorneo ? TL.FECHA : SL.FECHA;
  var COL_ID          = esTorneo ? TL.ID : SL.ID;
  var COL_ORGANIZADOR = esTorneo ? TL.ORGANIZADOR : SL.ORGANIZADOR;
  var COL_TAG_ORG     = esTorneo ? TL.TAG_ORG : SL.TAG_ORG;
  var COL_CLAN        = esTorneo ? TL.CLAN : SL.CLAN;
  var COL_CLAN_TAG    = esTorneo ? TL.CLAN_TAG : SL.CLAN_TAG;
  var COL_COMENTARIO  = esTorneo ? TL.COMENTARIO : SL.COMENTARIO;

  // Mismo criterio "más reciente por Fecha" que el respaldo de [→ Contexto_Base_Web.md §26B237]
  var filaMasReciente = null;
  var fechaMasReciente = -1;
  for (var i = 0; i < datos.length; i++) {
    var fila = datos[i];
    if (!fila[COL_FECHA - 1] && !fila[COL_ID - 1]) continue; // fila totalmente vacía
    var fechaVal = fila[COL_FECHA - 1];
    var t = (fechaVal instanceof Date) ? fechaVal.getTime() : 0;
    if (t >= fechaMasReciente) {
      fechaMasReciente = t;
      filaMasReciente = fila;
    }
  }
  if (!filaMasReciente) return null;

  return {
    autor: String(filaMasReciente[COL_ORGANIZADOR - 1] || '').trim(),
    tagOrg: String(filaMasReciente[COL_TAG_ORG - 1] || '').trim(),
    clanOrg: String(filaMasReciente[COL_CLAN - 1] || '').trim(),
    clanTagOrg: String(filaMasReciente[COL_CLAN_TAG - 1] || '').trim(),
    comentario: String(filaMasReciente[COL_COMENTARIO - 1] || '').trim()
  };
}

/**
 * _fetchMembersTorneo(tagSinHash) [→ Contexto_Base_Web.md §26B238]
 */
function _fetchMembersTorneo(tagSinHash) {
  var tag = String(tagSinHash || '').trim();
  if (tag.charAt(0) === '#') tag = tag.substring(1);
  if (!tag) {
    Logger.log('[Torneos] _fetchMembersTorneo: tag de torneo vacío.');
    return null;
  }

  var data = _apiGet('/tournaments/%23' + tag);
  if (!data) return null; // _apiGet ya logueó el código HTTP / excepción real.

  if (!data.membersList || !Array.isArray(data.membersList)) {
    Logger.log('[Torneos] ' + tag + ' -> la API oficial respondió sin membersList ' +
               '(torneo no encontrado, aún no empezó, o cambió el nombre del campo). ' +
               'Respuesta: ' + JSON.stringify(data).substring(0, 300));
    return null;
  }

  _guardarJsonTorneoEnDrive(tag, data); // se mantiene el respaldo crudo en Drive
  // FASE 3 (25-sep-2026, rediseño T_Lista): se expone el JSON completo del [→ Contexto_Base_Web.md §26B239]
  data.membersList.torneoData = data;
  return data.membersList;
}

/**
 * _parseFechaApiSupercell(str) [→ Contexto_Base_Web.md §26B240]
 */
function _parseFechaApiSupercell(str) {
  var m = String(str || '').match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})\.(\d{3})Z$/);
  if (!m) return null;
  var ms = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6]), Number(m[7]));
  var d = new Date(ms);
  return isNaN(d.getTime()) ? null : d;
}

// FASE 4 (25-sep-2026, rediseño T_Lista -- ver punto A del docblock de [→ Contexto_Base_Web.md §26B241]

// Cache global memoizada por ejecución (mismo criterio que CACHE_CLAN_DATA [→ Contexto_Base_Web.md §26B242]
var _CATALOGO_MODO_CACHE = null; // { headers, rows } de Backup_Modo.csv, o null si todavía no se leyó en esta ejecución
var _CATALOGO_MODO_NUEVOS_PENDIENTES = []; // ID (string) agregados en esta ejecución, para loguear al guardar

/**
 * _leerModoCSV() [→ Contexto_Base_Web.md §26B243]
 */
function _leerModoCSV() {
  var headersDefault = ['N°', 'ID', 'Name', 'Nombre'];
  var csvText = _loadCSVFromDrive('Backup_Modo.csv');
  if (!csvText) return { headers: headersDefault, rows: [] };

  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length === 0) return { headers: headersDefault, rows: [] };

  return { headers: parsed[0], rows: parsed.slice(1) };
}

/**
 * _guardarModoCSV(headers, rows) [→ Contexto_Base_Web.md §26B244]
 */
function _guardarModoCSV(headers, rows) {
  rows.sort(function (a, b) {
    var nameA = String(a[2] || ''), nameB = String(b[2] || '');
    if (nameA === nameB) return 0;
    return nameA < nameB ? -1 : 1;
  });
  for (var i = 0; i < rows.length; i++) rows[i][0] = i + 1;
  _saveCSVToDrive('Backup_Modo.csv', _encodeCSV([headers].concat(rows)));
}

/**
 * _resolverModoDesdeCatalogo(modoId) [→ Contexto_Base_Web.md §26B245]
 */
function _resolverModoDesdeCatalogo(modoId) {
  var idStr = String(modoId === undefined || modoId === null ? '' : modoId).trim();
  if (!idStr) return '';

  if (_CATALOGO_MODO_CACHE === null) _CATALOGO_MODO_CACHE = _leerModoCSV();

  for (var i = 0; i < _CATALOGO_MODO_CACHE.rows.length; i++) {
    if (String(_CATALOGO_MODO_CACHE.rows[i][1] || '').trim() === idStr) {
      var nombreManual = String(_CATALOGO_MODO_CACHE.rows[i][3] || '').trim();
      if (nombreManual) return nombreManual;
      return String(_CATALOGO_MODO_CACHE.rows[i][2] || '').trim(); // fallback: Name
    }
  }

  // Sin match -- fila nueva, Name/Nombre vacíos hasta que el usuario la [→ Contexto_Base_Web.md §26B246]
  if (_CATALOGO_MODO_NUEVOS_PENDIENTES.indexOf(idStr) < 0) {
    _CATALOGO_MODO_CACHE.rows.push(['', Number(idStr), '', '']);
    _CATALOGO_MODO_NUEVOS_PENDIENTES.push(idStr);
  }
  return '';
}

/**
 * _guardarModoCSVSiHayNuevos() [→ Contexto_Base_Web.md §26B247]
 */
function _guardarModoCSVSiHayNuevos() {
  if (_CATALOGO_MODO_NUEVOS_PENDIENTES.length === 0) return;
  _guardarModoCSV(_CATALOGO_MODO_CACHE.headers, _CATALOGO_MODO_CACHE.rows);
  Logger.log('[T_Lista] Backup_Modo.csv: ' + _CATALOGO_MODO_NUEVOS_PENDIENTES.length +
             ' ID(s) de modo nuevo(s) agregado(s) (' + _CATALOGO_MODO_NUEVOS_PENDIENTES.join(', ') +
             '), Name/Nombre vacíos hasta que se completen a mano.');
  _CATALOGO_MODO_NUEVOS_PENDIENTES = [];
}

/**
 * _guardarJsonTorneoEnDrive(tagTorneo, datos) [→ Contexto_Base_Web.md §26B248]
 */
function _guardarJsonTorneoEnDrive(tagTorneo, datos) {
  try {
    var filename = 'Torneo - ' + tagTorneo + '.json';
    var contenido = JSON.stringify(datos, null, 2);

    // 14-oct-2026 (pedido de la usuaria): la subcarpeta se decide UNA SOLA VEZ, la primera
    // vez que se guarda el torneo. Si el archivo ya existe en Terna o en la raíz de Torneos,
    // se sobrescribe ahí y no se mueve (el creador puede cambiarse de clan después).
    // [→ Contexto_Base_Web.md §PF078]
    var folderTerna = null;
    try { folderTerna = DriveApp.getFolderById(DRIVE_FOLDER_ID_TORNEOS_TERNA); }
    catch (eT) { Logger.log('[Torneos] No se pudo abrir la carpeta Terna (revisar DRIVE_FOLDER_ID_TORNEOS_TERNA): ' + eT.message); }
    var folderRaiz = DriveApp.getFolderById(DRIVE_FOLDER_ID_TORNEOS);

    if (folderTerna) {
      var enTerna = folderTerna.getFilesByName(filename);
      if (enTerna.hasNext()) { enTerna.next().setContent(contenido); return; }
    }
    var enRaiz = folderRaiz.getFilesByName(filename);
    if (enRaiz.hasNext()) { enRaiz.next().setContent(contenido); return; }

    // Primera vez: se decide la subcarpeta.
    var destino = (folderTerna && _creadorTorneoEnClanTerna_(datos)) ? folderTerna : folderRaiz;
    destino.createFile(filename, contenido, MimeType.PLAIN_TEXT);
  } catch(e) {
    Logger.log('[Torneos] Error guardando JSON de ' + tagTorneo + ': ' + e.message);
  }
}

/**
 * _creadorTorneoEnClanTerna_(datos) -- true si el creador (datos.creatorTag) está, en este
 * momento, en uno de los clanes de CFG.TERNA_TAGS. El clan sale de la entrada del creador en
 * datos.membersList; si no figura ahí, del Directorio. Sin creatorTag o sin clan: false.
 * [→ Contexto_Base_Web.md §PF078]
 */
function _creadorTorneoEnClanTerna_(datos) {
  var norm = function (t) {
    t = String(t || '').trim().toUpperCase();
    return (t && t.charAt(0) !== '#') ? '#' + t : t;
  };
  var creador = norm(datos && datos.creatorTag);
  if (!creador) return false;

  var clanTag = '';
  var lista = (datos && datos.membersList) || [];
  for (var i = 0; i < lista.length; i++) {
    if (norm(lista[i].tag) === creador) {
      clanTag = norm(lista[i].clan && lista[i].clan.tag);
      break;
    }
  }
  if (!clanTag) {
    try {
      var info = _getDirectorioLookupPorTag(_getSs())[creador];
      if (info) clanTag = norm(info.clanTag);
    } catch (e) { /* sin Directorio: queda sin clan */ }
  }
  if (!clanTag) return false;

  for (var j = 0; j < CFG.TERNA_TAGS.length; j++) {
    if (norm(CFG.TERNA_TAGS[j]) === clanTag) return true;
  }
  return false;
}

// DETALLE /tournaments?name=X (25-sep-2026, confirmado por el usuario; movido [→ Contexto_Base_Web.md §26B249]

function _hoyLimaSinHora() {
  var TZ = 'America/Lima';
  var partes = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd').split('-');
  return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
}

function _calcularTemporadaParaFecha(fecha) {
  var anio = fecha.getFullYear();
  var mes = fecha.getMonth();
  var primerLunes = primerLunesDelMes(anio, mes);
  if (fecha < primerLunes) {
    mes--;
    if (mes < 0) { mes = 11; anio--; }
  }
  var ref = CFG.REF_DEFAULT;
  return (anio - ref.getFullYear()) * 12 + (mes - ref.getMonth()) + 1;
}

function _calcularSemanaTorneo(fecha, temporada) {
  var pl = primerLunesTemporada(CFG.REF_DEFAULT, temporada);
  var periodIndex = Math.floor((fecha.getTime() - pl.getTime()) / 86400000);
  if (periodIndex < 0) periodIndex = 0;
  return periodIdxToSectionIndex(periodIndex) + 1;
}

/**
 * _construirSemanasCsvDesdeIsos(isosCsv) [→ Contexto_Base_Web.md §26B250]
 */
function _construirSemanasCsvDesdeIsos(isosCsv) {
  var tokens = String(isosCsv || '').split(',').map(function (s) {
    var m = String(s).trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    var lunes = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    var temporada = _calcularTemporadaParaFecha(lunes);
    var semana = _calcularSemanaTorneo(lunes, temporada);
    return 'T' + temporada + '_S' + semana;
  }).filter(Boolean);
  return tokens.join(',');
}

function _contarTorneosEnSemana(datos, temporada, semana, hastaIndice) {
  var count = 0;
  for (var i = 0; i < hastaIndice; i++) {
    var id = String(datos[i][TL.ID - 1] || '').trim();
    if (!id) continue;
    var temp = Number(datos[i][TL.TEMPORADA - 1]) || 0;
    if (temp !== temporada) continue;
    var m = id.match(/^T_\d{3}_(\d+)_(\d{2})$/);
    if (m && Number(m[1]) === semana) count++;
  }
  return count + 1;
}

/**
 * _contarSorteosEnSemana(datos, temporada, semana, hastaIndice) [→ Contexto_Base_Web.md §26B251]
 */
function _contarSorteosEnSemana(datos, temporada, semana, hastaIndice) {
  var count = 0;
  for (var i = 0; i < hastaIndice; i++) {
    var id = String(datos[i][SL.ID - 1] || '').trim();
    if (!id) continue;
    var temp = Number(datos[i][SL.TEMPORADA - 1]) || 0;
    if (temp !== temporada) continue;
    var m = id.match(/^S_\d{3}_(\d+)_(\d{2})$/);
    if (m && Number(m[1]) === semana) count++;
  }
  return count + 1;
}

// PASO 2 — T_Asistencia: una fila por participante y torneo [→ Contexto_Base_Web.md §26B252]

function _generarAsistenciaParaTorneo(ss, id, fecha, temporada, jsonArray) {
  var sh = ss.getSheetByName(CFG.SHEETS.T_ASISTENCIA);
  if (!sh) return;

  // Fase 19: upsert por id. ANTES esta función solo hacía APPEND, así que [→ Contexto_Base_Web.md §26B253]
  _borrarFilasAsistenciaPorId(sh, id);

  var mapaDirectorio = _getDirectorioLookupPorTag(ss);
  var numActual = sh.getLastRow() >= 2 ? sh.getLastRow() - 1 : 0;

  var filasNuevas = [];
  for (var i = 0; i < jsonArray.length; i++) {
    var m = jsonArray[i];
    var tag = String(m.tag || '').trim();
    if (tag && tag.charAt(0) !== '#') tag = '#' + tag;
    var clanObj = m.clan || {};
    var clanTag = String(clanObj.tag || '').trim();
    if (clanTag && clanTag.charAt(0) !== '#') clanTag = '#' + clanTag;

    var infoDir = mapaDirectorio[tag] || { nomMulti: '', prestamo: '' };

    numActual++;
    var fila = [];
    fila[TA.NUM - 1] = numActual;
    fila[TA.FECHA - 1] = fecha;
    fila[TA.ID - 1] = id;
    fila[TA.TEMPORADA - 1] = temporada;
    fila[TA.TAG - 1] = tag;
    fila[TA.NOMBRE - 1] = String(m.name || '');
    fila[TA.NOM_MULTI - 1] = infoDir.nomMulti;
    fila[TA.PRESTAMO - 1] = infoDir.prestamo;
    fila[TA.CLAN_TAG - 1] = clanTag;
    fila[TA.CLAN - 1] = String(clanObj.name || '');
    fila[TA.PUESTO - 1] = (m.rank !== undefined && m.rank !== null) ? m.rank : '';
    fila[TA.VICTORIAS - 1] = (m.score !== undefined && m.score !== null) ? m.score : '';
    filasNuevas.push(fila);
  }

  if (filasNuevas.length === 0) return;
  var filaInicio = sh.getLastRow() + 1;
  sh.getRange(filaInicio, 1, filasNuevas.length, TA_TOTAL_COLS).setValues(filasNuevas);
  _trySetFmt(sh, filaInicio, TA.FECHA, 'dd/mm/yyyy');
  if (filasNuevas.length > 1) {
    sh.getRange(filaInicio, TA.FECHA, filasNuevas.length, 1).setNumberFormat('dd/mm/yyyy');
  }
  // Antes no se aplicaba borde/centrado a las filas nuevas — por eso las [→ Contexto_Base_Web.md §26B254]
  applyBorderCenter(sh.getRange(filaInicio, 1, filasNuevas.length, TA_TOTAL_COLS));
}

/**
 * _borrarFilasAsistenciaPorId(sh, id) [→ Contexto_Base_Web.md §26B255]
 */
function _borrarFilasAsistenciaPorId(sh, id) {
  if (sh.getLastRow() < 2) return;

  // FIX (16-ago-2026): reportado por el usuario -- "Exception: Los datos [→ Contexto_Base_Web.md §26B256]
  sh.getDataRange().clearDataValidations();

  var ids = sh.getRange(2, TA.ID, sh.getLastRow() - 1, 1).getValues();
  for (var r = ids.length - 1; r >= 0; r--) {
    if (String(ids[r][0] || '') === String(id)) {
      sh.deleteRow(r + 2);
    }
  }
}

function _getDirectorioLookupPorTag(ss) {
  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  var mapa = {};
  if (!shDir || shDir.getLastRow() < 2) return mapa;
  var datos = shDir.getRange(2, 1, shDir.getLastRow() - 1, DIR_SHEET_COLS).getValues();
  for (var i = 0; i < datos.length; i++) {
    var tag = String(datos[i][IC.TAG - 1] || '').trim();
    if (!tag) continue;
    mapa[tag] = {
      nombre:   String(datos[i][IC.NOMBRE   - 1] || ''),
      nomMulti: String(datos[i][IC.NOM_MULTI - 1] || ''),
      prestamo: String(datos[i][IC.PRESTAMO  - 1] || ''),
      clanTag:  String(datos[i][IC.CLAN_TAG  - 1] || ''),
      clan:     String(datos[i][IC.CLAN      - 1] || '')
    };
  }
  return mapa;
}

/**
 * _getInactivosLookupPorTag(ss) [→ Contexto_Base_Web.md §26B257]
 */
function _getInactivosLookupPorTag(ss) {
  var shInact = ss.getSheetByName(CFG.SHEETS.INACTIVOS);
  var mapa = {};
  if (!shInact || shInact.getLastRow() < 2) return mapa;
  var datos = shInact.getRange(2, 1, shInact.getLastRow() - 1, INACTIVOS_TOTAL_COLS).getValues();
  for (var i = 0; i < datos.length; i++) {
    var tag = String(datos[i][IC.TAG - 1] || '').trim();
    if (!tag) continue;
    mapa[tag] = {
      nombre:   String(datos[i][IC.NOMBRE   - 1] || ''),
      nomMulti: String(datos[i][IC.NOM_MULTI - 1] || ''),
      clanTag:  String(datos[i][IC.CLAN_TAG  - 1] || ''),
      clan:     String(datos[i][IC.CLAN      - 1] || '')
    };
  }
  return mapa;
}

function _getAsistenciaTagsPorId(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.T_ASISTENCIA);
  var mapa = {};
  if (!sh || sh.getLastRow() < 2) return mapa;
  var datos = sh.getRange(2, 1, sh.getLastRow() - 1, TA_TOTAL_COLS).getValues();
  for (var i = 0; i < datos.length; i++) {
    var id = String(datos[i][TA.ID - 1] || '').trim();
    var tag = String(datos[i][TA.TAG - 1] || '').trim();
    var victorias = Number(datos[i][TA.VICTORIAS - 1]) || 0;
    if (!id || !tag) continue;
    if (!mapa[id]) mapa[id] = {};
    mapa[id][tag] = victorias;
  }
  return mapa;
}

function _getTagsConAsistencia(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.T_ASISTENCIA);
  var tags = {};
  if (!sh || sh.getLastRow() < 2) return tags;
  var datos = sh.getRange(2, 1, sh.getLastRow() - 1, TA_TOTAL_COLS).getValues();
  for (var i = 0; i < datos.length; i++) {
    var tag = String(datos[i][TA.TAG - 1] || '').trim();
    if (tag) tags[tag] = true;
  }
  return tags;
}

// FASE 23 (30/08/2026) — Torneos de continuación (columna Tag_Tor_2 de [→ Contexto_Base_Web.md §26B258]

/**
 * _resolverGruposContinuacionTorneos(ss) [→ Contexto_Base_Web.md §26B259]
 */
function _resolverGruposContinuacionTorneos(ss) {
  var vacio = { raizPorId: {}, grupoPorRaiz: {}, infoTorneo: {} };
  // FASE (15-sep-2026, pedido del usuario -- fallback web->CSV, continuación [→ Contexto_Base_Web.md §26B260]
  var lecturaTL = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.T_LISTA, 'Backup_T_Lista.csv', TL_TOTAL_COLS, 2);
  if (lecturaTL.origen === 'vacio') return vacio;

  var datos = lecturaTL.filas;
  if (lecturaTL.origen === 'csv') {
    // Igual que en _webTorneos()/_webGanadoresTorneoMasReciente(): el CSV [→ Contexto_Base_Web.md §26B261]
    datos = datos.map(function (f) {
      var nueva = f.slice();
      var fechaObj = _parseSpanishDate(nueva[TL.FECHA - 1]);
      if (fechaObj instanceof Date && !isNaN(fechaObj.getTime())) nueva[TL.FECHA - 1] = fechaObj;
      return nueva;
    });
  }

  var infoTorneo = {};
  var idPorTagTor = {};   // Tag_Tor -> id (primera fila que lo tiene)
  var continuaDe = {};    // id -> Tag_Tor_2 (a qué Tag_Tor dice continuar)

  for (var i = 0; i < datos.length; i++) {
    var id = String(datos[i][TL.ID - 1] || '').trim();
    if (!id) continue;
    var tagTor = String(datos[i][TL.TAG_TOR - 1] || '').trim();
    var tagTor2 = String(datos[i][TL.TAG_TOR_2 - 1] || '').trim();
    infoTorneo[id] = {
      fecha: datos[i][TL.FECHA - 1],
      temporada: Number(datos[i][TL.TEMPORADA - 1]) || 0,
      tagTor: tagTor,
      tagTor2: tagTor2
    };
    if (tagTor && !idPorTagTor.hasOwnProperty(tagTor)) idPorTagTor[tagTor] = id;
    if (tagTor2) continuaDe[id] = tagTor2;
  }

  var raizPorId = {};

  function _resolverRaiz(id, visitados) {
    if (raizPorId.hasOwnProperty(id)) return raizPorId[id];
    var tagObjetivo = continuaDe[id];
    if (!tagObjetivo) return id; // no continúa a nada: es su propia raíz
    var idObjetivo = idPorTagTor[tagObjetivo];
    // Sin coincidencia (Tag_Tor_2 mal tipeado / torneo aún no registrado) [→ Contexto_Base_Web.md §26B262]
    if (!idObjetivo || idObjetivo === id || visitados[id]) return id;
    var visitadosNuevo = {};
    for (var k in visitados) visitadosNuevo[k] = true;
    visitadosNuevo[id] = true;
    return _resolverRaiz(idObjetivo, visitadosNuevo);
  }

  var grupoPorRaiz = {};
  for (var idAny in infoTorneo) {
    var raiz = _resolverRaiz(idAny, {});
    raizPorId[idAny] = raiz;
    if (!grupoPorRaiz[raiz]) grupoPorRaiz[raiz] = [];
    grupoPorRaiz[raiz].push(idAny);
  }

  for (var raizKey in grupoPorRaiz) {
    grupoPorRaiz[raizKey].sort(function (a, b) {
      var fa = (infoTorneo[a].fecha instanceof Date && !isNaN(infoTorneo[a].fecha.getTime())) ? infoTorneo[a].fecha.getTime() : 0;
      var fb = (infoTorneo[b].fecha instanceof Date && !isNaN(infoTorneo[b].fecha.getTime())) ? infoTorneo[b].fecha.getTime() : 0;
      return fa - fb;
    });
  }

  return { raizPorId: raizPorId, grupoPorRaiz: grupoPorRaiz, infoTorneo: infoTorneo };
}

/**
 * _getAsistenciaFusionadaPorRaiz(ss) [→ Contexto_Base_Web.md §26B263]
 */
function _getAsistenciaFusionadaPorRaiz(ss) {
  var grupos = _resolverGruposContinuacionTorneos(ss);
  var porId = _getAsistenciaTagsPorId(ss);
  var fusion = {};
  for (var raiz in grupos.grupoPorRaiz) {
    var ids = grupos.grupoPorRaiz[raiz];
    var mapaTag = {};
    for (var k = 0; k < ids.length; k++) {
      var scores = porId[ids[k]] || {};
      for (var tag in scores) {
        mapaTag[tag] = (mapaTag[tag] || 0) + scores[tag];
      }
    }
    fusion[raiz] = mapaTag;
  }
  return fusion;
}

/**
 * _getParticipantesFusionadosPorTorneo(ss, idTorneo) [→ Contexto_Base_Web.md §26B264]
 */
function _getParticipantesFusionadosPorTorneo(ss, idTorneo) {
  var grupos = _resolverGruposContinuacionTorneos(ss);
  var raiz = grupos.raizPorId.hasOwnProperty(idTorneo) ? grupos.raizPorId[idTorneo] : idTorneo;
  var idsGrupo = grupos.grupoPorRaiz[raiz] || [idTorneo];

  // FASE (15-sep-2026, pedido del usuario -- fallback web->CSV, continuación [→ Contexto_Base_Web.md §26B265]
  var lecturaTA = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.T_ASISTENCIA, 'Backup_T_Asistencia.csv', TA_TOTAL_COLS);
  var taData = lecturaTA.filas;
  var participantesPorTag = {};
  for (var i = 0; i < taData.length; i++) {
    var idFila = String(taData[i][TA.ID - 1] || '').trim();
    if (idsGrupo.indexOf(idFila) < 0) continue;
    var tag = String(taData[i][TA.TAG - 1] || '').trim();
    if (!tag) continue;
    var victorias = Number(taData[i][TA.VICTORIAS - 1]) || 0;
    if (!participantesPorTag[tag]) {
      participantesPorTag[tag] = {
        tag: tag,
        nombre: String(taData[i][TA.NOMBRE - 1] || ''),
        clan: String(taData[i][TA.CLAN - 1] || ''),
        clanTag: String(taData[i][TA.CLAN_TAG - 1] || ''),
        victorias: 0
      };
    }
    participantesPorTag[tag].victorias += victorias;
  }

  var participantes = [];
  for (var t in participantesPorTag) participantes.push(participantesPorTag[t]);
  participantes.sort(function (a, b) { return b.victorias - a.victorias; });

  for (var p = 0; p < participantes.length; p++) {
    if (p > 0 && participantes[p].victorias === participantes[p - 1].victorias) {
      participantes[p].puesto = participantes[p - 1].puesto;
    } else {
      participantes[p].puesto = p + 1;
    }
  }

  // FASE 24 (02-sep-2026, pedido del usuario): aplica resoluciones [→ Contexto_Base_Web.md §26B266]
  _aplicarResolucionesTorneo(ss, raiz, participantes);

  return { idsGrupo: idsGrupo, raiz: raiz, participantes: participantes };
}

/**
 * _aplicarResolucionesTorneo(ss, idRaiz, participantes) [→ Contexto_Base_Web.md §26B267]
 */
function _aplicarResolucionesTorneo(ss, idRaiz, participantes) {
  // PF073: hoja viva o Backup_T_Resoluciones.csv (antes, si Sheets fallaba, el endpoint respondía 500). [→ Contexto_Base_Web.md §PF073]
  var resolucionPorTag = {};
  var dataTR = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.T_RESOLUCIONES, 'Backup_T_Resoluciones.csv', TR_TOTAL_COLS).filas;
  if (dataTR.length) {
    var data = dataTR;
    for (var i = 0; i < data.length; i++) {
      var idFila = String(data[i][TR.ID_TORNEO - 1] || '').trim();
      if (idFila !== String(idRaiz)) continue;
      var tag = String(data[i][TR.TAG - 1] || '').trim().toUpperCase();
      if (!tag) continue;
      // Si por algún motivo hubiera más de una fila para el mismo Tag en [→ Contexto_Base_Web.md §26B268]
      resolucionPorTag[tag] = {
        tipo:        String(data[i][TR.TIPO_RESOLUCION - 1] || '').trim(),
        puestoFinal: data[i][TR.PUESTO_FINAL - 1],
        motivo:      String(data[i][TR.MOTIVO - 1] || '').trim()
      };
    }
  }

  var TIPOS = CFG.TORNEOS_RESOLUCION_TIPOS;
  for (var p = 0; p < participantes.length; p++) {
    var part = participantes[p];
    part.puestoOriginal = part.puesto;
    part.descalificado = false;
    part.premioRepartido = false;
    part.tipoResolucion = null;
    part.motivoResolucion = '';

    var res = resolucionPorTag[part.tag];
    if (!res) continue;

    part.tipoResolucion = res.tipo;
    part.motivoResolucion = res.motivo;

    if (res.tipo === TIPOS.DESCALIFICADO) {
      part.descalificado = true;
    } else if (res.tipo === TIPOS.REPARTO) {
      part.premioRepartido = true;
    } else if (res.tipo === TIPOS.REVANCHA) {
      var puestoFinalNum = Number(res.puestoFinal);
      if (puestoFinalNum > 0) part.puesto = puestoFinalNum;
    }
  }
}

/**
 * _topNTrasResoluciones(participantes, n) [→ Contexto_Base_Web.md §26B269]
 */
function _topNTrasResoluciones(participantes, n) {
  return participantes
    .filter(function (p) { return !p.descalificado; })
    .sort(function (a, b) {
      var pa = Number(a.puesto) || 0, pb = Number(b.puesto) || 0;
      if (pa !== pb) return pa - pb;
      return b.victorias - a.victorias;
    })
    .slice(0, n);
}

/**
 * _registrarResolucionTorneo(idTorneoCualquiera, tag, tipoResolucion, [→ Contexto_Base_Web.md §26B270]
 */
function _registrarResolucionTorneo(idTorneoCualquiera, tag, tipoResolucion, puestoFinal, motivo, registradoPor) {
  var ss = _getSs();
  var tagNorm = String(tag || '').trim().toUpperCase();
  if (!tagNorm) return { ok: false, error: 'Falta el Tag de la cuenta afectada.' };

  var TIPOS = CFG.TORNEOS_RESOLUCION_TIPOS;
  var tiposValidos = [TIPOS.DESCALIFICADO, TIPOS.REPARTO, TIPOS.REVANCHA];
  if (tiposValidos.indexOf(tipoResolucion) < 0) {
    return { ok: false, error: 'Tipo de resolución inválido.' };
  }

  var puestoFinalNum = null;
  if (tipoResolucion === TIPOS.REVANCHA) {
    puestoFinalNum = Number(puestoFinal);
    if (!puestoFinalNum || puestoFinalNum < 1) {
      return { ok: false, error: 'Falta el Puesto final de la partida de desempate.' };
    }
  }

  var motivoTexto = String(motivo || '').trim();
  if (!motivoTexto) return { ok: false, error: 'Falta el motivo de la resolución.' };

  var grupos = _resolverGruposContinuacionTorneos(ss);
  var idBuscado = String(idTorneoCualquiera || '').trim();
  var idRaiz = grupos.raizPorId.hasOwnProperty(idBuscado) ? grupos.raizPorId[idBuscado] : idBuscado;
  if (!idRaiz) return { ok: false, error: 'Falta el ID del torneo.' };

  // Se recalcula el resultado crudo (con cualquier resolución previa YA [→ Contexto_Base_Web.md §26B271]
  var resultado = _getParticipantesFusionadosPorTorneo(ss, idRaiz);
  var participante = null;
  for (var i = 0; i < resultado.participantes.length; i++) {
    if (resultado.participantes[i].tag === tagNorm) { participante = resultado.participantes[i]; break; }
  }
  if (!participante) return { ok: false, error: 'Esa cuenta no participó en este torneo.' };

  var shTR = _getOrCreateSheet(ss, CFG.SHEETS.T_RESOLUCIONES);
  var filaExistente = -1;
  if (shTR.getLastRow() >= 2) {
    var data = shTR.getRange(2, 1, shTR.getLastRow() - 1, TR_TOTAL_COLS).getValues();
    for (var f = 0; f < data.length; f++) {
      var idFilaExistente = String(data[f][TR.ID_TORNEO - 1] || '').trim();
      var tagFilaExistente = String(data[f][TR.TAG - 1] || '').trim().toUpperCase();
      if (idFilaExistente === idRaiz && tagFilaExistente === tagNorm) {
        filaExistente = f + 2; // +2: encabezado (fila 1) + índice 0-based
        break;
      }
    }
  }

  var puestoOriginalGuardar = participante.puestoOriginal !== undefined ? participante.puestoOriginal : participante.puesto;
  var fila = [
    idRaiz,
    tagNorm,
    participante.nombre,
    puestoOriginalGuardar,
    tipoResolucion,
    tipoResolucion === TIPOS.REVANCHA ? puestoFinalNum : '',
    motivoTexto,
    registradoPor || '',
    new Date()
  ];

  if (filaExistente > 0) {
    shTR.getRange(filaExistente, 1, 1, TR_TOTAL_COLS).setValues([fila]);
  } else {
    shTR.appendRow(fila);
  }

  return { ok: true };
}

/**
 * _marcarVistoEnGrupoVerificado(tag, nombre, registradoPor) [→ Contexto_Base_Web.md §26B272]
 */
function _marcarVistoEnGrupoVerificado(tag, nombre, registradoPor) {
  var tagKey = cleanTag(tag);
  if (!tagKey) return { ok: false, error: 'Falta el Tag del ganador.' };

  var ss = _getSs();
  var sh = _getOrCreateSheet(ss, CFG.SHEETS.GRUPO_VERIFICADO);
  if (sh.getLastRow() >= 2) {
    var data = sh.getRange(2, 1, sh.getLastRow() - 1, GV_TOTAL_COLS).getValues();
    for (var f = 0; f < data.length; f++) {
      if (cleanTag(data[f][GV.TAG - 1]) === tagKey) return { ok: true }; // ya estaba, no duplica
    }
  }

  var tagGuardar = String(tag || '').trim().toUpperCase();
  sh.appendRow([tagGuardar, String(nombre || ''), new Date(), registradoPor || '']);
  return { ok: true };
}

/**
 * _getTagsVistosEnGrupo() [→ Contexto_Base_Web.md §26B273]
 */
function _getTagsVistosEnGrupo() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.GRUPO_VERIFICADO);
  var tags = {};
  if (!sh || sh.getLastRow() < 2) return tags;
  var data = sh.getRange(2, 1, sh.getLastRow() - 1, GV_TOTAL_COLS).getValues();
  for (var i = 0; i < data.length; i++) {
    var tagKey = cleanTag(data[i][GV.TAG - 1]);
    if (tagKey) tags[tagKey] = true;
  }
  return tags;
}
 /**
  * /* FASE (10-sep-2026, pedido del usuario -- consolidado sección 1, puntos 4 [→ Contexto_Base_Web.md §26B274]
  */
function _getFilaSListaPorId(ss, id) {
  var sh = ss.getSheetByName(CFG.SHEETS.S_LISTA);
  if (!sh || sh.getLastRow() < 3) return null;
  var datos = sh.getRange(3, 1, sh.getLastRow() - 2, SL_TOTAL_COLS).getValues();
  var idBuscado = String(id || '').trim();
  for (var i = 0; i < datos.length; i++) {
    if (String(datos[i][SL.ID - 1] || '').trim() === idBuscado) {
      return {
        fecha: datos[i][SL.FECHA - 1],
        temporada: Number(datos[i][SL.TEMPORADA - 1]) || 0
      };
    }
  }
  return null;
}

/**
 * _registrarResolucionSorteo(idSorteo, tag, nombre, premio, resultado, [→ Contexto_Base_Web.md §26B275]
 */
function _registrarResolucionSorteo(idSorteo, tag, nombre, premio, resultado, razon, permitirSinTag, registradoPor, tickets) {
  var ss = _getSs();

  var idNorm = String(idSorteo || '').trim();
  if (!idNorm) return { ok: false, error: 'Falta el ID del sorteo.' };

  var RESULTADOS = CFG.SORTEOS_RESULTADO_TIPOS;
  var resultadosValidos = [RESULTADOS.CALIFICA, RESULTADOS.NO_CALIFICA];
  if (resultadosValidos.indexOf(resultado) < 0) {
    return { ok: false, error: 'Resultado inválido.' };
  }

  var razonTexto = '';
  if (resultado === RESULTADOS.NO_CALIFICA) {
    var RAZONES = CFG.SORTEOS_RAZON_TIPOS;
    var razonesValidas = [RAZONES.NO_WHATSAPP, RAZONES.NO_REACCION, RAZONES.NO_MIEMBRO_ACTIVO];
    razonTexto = String(razon || '').trim();
    if (razonesValidas.indexOf(razonTexto) < 0) {
      return { ok: false, error: 'Falta la razón (obligatoria cuando el resultado es "No califica").' };
    }
  }

  var tagNorm = String(tag || '').trim().toUpperCase();
  if (!tagNorm && !permitirSinTag) {
    return { ok: false, error: 'Falta el Tag del ganador. Si es intencional (cuenta externa a los clanes), confirmá explícitamente el guardado sin Tag.' };
  }
  var tagConHash = tagNorm ? (tagNorm.charAt(0) === '#' ? tagNorm : '#' + tagNorm) : '';

  var nombreTexto = String(nombre || '').trim();
  if (!nombreTexto) return { ok: false, error: 'Falta el nombre del ganador.' };

  // Tickets (FIX 12-sep-2026): opcional. Sin valor -> se guarda vacío, sin
  // inventar un default. Con valor -> debe ser numérico y no negativo.
  var ticketsGuardar = '';
  if (tickets !== undefined && tickets !== null && String(tickets).trim() !== '') {
    var ticketsNum = Number(tickets);
    if (isNaN(ticketsNum) || ticketsNum < 0) {
      return { ok: false, error: 'Tickets inválido (debe ser un número mayor o igual a 0).' };
    }
    ticketsGuardar = ticketsNum;
  }

  var filaSorteo = _getFilaSListaPorId(ss, idNorm);
  if (!filaSorteo) return { ok: false, error: 'No encontré el sorteo ' + idNorm + ' en S_Lista.' };

  var infoDir = { nomMulti: '', prestamo: '', clanTag: '', clan: '' };
  if (tagConHash) {
    var mapaDirectorio = _getDirectorioLookupPorTag(ss);
    if (mapaDirectorio[tagConHash]) infoDir = mapaDirectorio[tagConHash];
  }

  var sh = _getOrCreateSheet(ss, CFG.SHEETS.S_ASISTENCIA);

  // Upsert por (ID de sorteo, Tag) -- ver docblock. Sin Tag conocido no hay
  // clave única: siempre se agrega como fila nueva en ese caso.
  var filaExistente = -1;
  if (tagConHash && sh.getLastRow() >= 2) {
    var datosExistentes = sh.getRange(2, 1, sh.getLastRow() - 1, SA_TOTAL_COLS).getValues();
    for (var f = 0; f < datosExistentes.length; f++) {
      var idFilaExistente = String(datosExistentes[f][SA.ID - 1] || '').trim();
      var tagFilaExistente = String(datosExistentes[f][SA.TAG - 1] || '').trim().toUpperCase();
      if (idFilaExistente === idNorm && tagFilaExistente === tagConHash.toUpperCase()) {
        filaExistente = f + 2; // +2: encabezado (fila 1) + índice 0-based
        break;
      }
    }
  }

  var numGuardar;
  if (filaExistente > 0) {
    numGuardar = sh.getRange(filaExistente, SA.NUM).getValue(); // se conserva el N° ya asignado
  } else {
    numGuardar = (sh.getLastRow() >= 2 ? sh.getLastRow() - 1 : 0) + 1;
  }

  var fila = [];
  fila[SA.NUM - 1]       = numGuardar;
  fila[SA.FECHA - 1]     = filaSorteo.fecha;
  fila[SA.ID - 1]        = idNorm;
  fila[SA.TEMPORADA - 1] = filaSorteo.temporada;
  fila[SA.TAG - 1]       = tagConHash;
  fila[SA.NOMBRE - 1]    = nombreTexto;
  fila[SA.NOM_MULTI - 1] = infoDir.nomMulti || '';
  fila[SA.PRESTAMO - 1]  = infoDir.prestamo || '';
  fila[SA.CLAN_TAG - 1]  = infoDir.clanTag || '';
  fila[SA.CLAN - 1]      = infoDir.clan || '';
  fila[SA.TICKETS - 1]   = ticketsGuardar;
  fila[SA.PREMIO - 1]    = String(premio || '').trim();
  fila[SA.RESULTADO - 1] = resultado;
  fila[SA.RAZON - 1]     = razonTexto;

  if (filaExistente > 0) {
    sh.getRange(filaExistente, 1, 1, SA_TOTAL_COLS).setValues([fila]);
  } else {
    sh.appendRow(fila);
    _trySetFmt(sh, sh.getLastRow(), SA.FECHA, 'dd/mm/yyyy');
    applyBorderCenter(sh.getRange(sh.getLastRow(), 1, 1, SA_TOTAL_COLS));
  }

  Logger.log('[Sorteos] Resolución guardada en S_Asistencia: sorteo ' + idNorm +
             ', tag ' + (tagConHash || '(sin tag)') + ', resultado ' + resultado +
             (ticketsGuardar !== '' ? ', tickets ' + ticketsGuardar : '') +
             (registradoPor ? ', registrado por ' + registradoPor : '') + '.');

  return { ok: true };
}

/**
 * _validarTagTor2SinCoincidencia(ss) [→ Contexto_Base_Web.md §26B276]
 */
function _validarTagTor2SinCoincidencia(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.T_LISTA);
  // FIX (08-sep-2026, pedido usuario): header de 2 filas -- guard >= 3.
  if (!sh || sh.getLastRow() < 3) return;

  var datos = sh.getRange(3, 1, sh.getLastRow() - 2, TL_TOTAL_COLS).getValues();
  var tagsExistentes = {};
  for (var i = 0; i < datos.length; i++) {
    var tagTor = String(datos[i][TL.TAG_TOR - 1] || '').trim();
    if (tagTor) tagsExistentes[tagTor] = true;
  }

  for (var j = 0; j < datos.length; j++) {
    var tagTor2 = String(datos[j][TL.TAG_TOR_2 - 1] || '').trim();
    if (!tagTor2) continue;
    var propioTagTor = String(datos[j][TL.TAG_TOR - 1] || '').trim();
    if (tagTor2 === propioTagTor) {
      Logger.log('[T_Lista] Fila ' + (j + 3) + ': Tag_Tor_2 (' + tagTor2 + ') es igual a su propio Tag_Tor -- se ignora (no puede continuarse a sí mismo).');
      continue;
    }
    if (!tagsExistentes[tagTor2]) {
      Logger.log('[T_Lista] Fila ' + (j + 3) + ': Tag_Tor_2 (' + tagTor2 + ') no coincide con el Tag_Tor de ningún torneo existente -- revisar si está bien escrito.');
    }
  }
}

/**
 * _getMinTClanMaps() [→ Contexto_Base_Web.md §26B277]
 */
function _getMinTClanMaps() {
  var byTag = {};
  var info = _getMinTPorNombreClan('Torneo');
  var ss = _getSs();
  // PF073: hoja Clan viva o Backup_Clan.csv. [→ Contexto_Base_Web.md §PF073]
  var clanData = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.CLAN, 'Backup_Clan.csv', CC.CONDICION).filas;
  if (!clanData.length) return { byTag: byTag };
  for (var c = 0; c < clanData.length; c++) {
    var nombreClan = String(clanData[c][CC.NOMBRE - 1] || '').trim();
    var clanTag    = String(clanData[c][CC.CLAN_TAG - 1] || '').trim();
    if (!nombreClan || !clanTag) continue;
    if (info.minTPorNombreClan.hasOwnProperty(nombreClan)) {
      byTag[clanTag] = info.minTPorNombreClan[nombreClan];
    }
  }
  return { byTag: byTag };
}

// FASE 13/14 (30/07/2026) — INTEGRACIÓN CON EL BOT DE WHATSAPP [→ Contexto_Base_Web.md §26B278]

/**
 * _combinarFechaHora(fechaStr, horaStr) [→ Contexto_Base_Web.md §26B279]
 */
function _combinarFechaHora(fechaStr, horaStr) {
  var mFecha = String(fechaStr || '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  // 17-oct-2026 (PF098): los segundos son opcionales; admin.html manda la hora como "HH:MM:SS" (horaConSegundos()) y el bot como "HH:mm". [→ Contexto_Base_Web.md §PF098]
  var mHora  = String(horaStr  || '').trim().match(/^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);
  if (!mFecha || !mHora) return null;
  var dia = Number(mFecha[1]), mes = Number(mFecha[2]), anio = Number(mFecha[3]);
  var horas = Number(mHora[1]), minutos = Number(mHora[2]), segundos = Number(mHora[3] || 0);
  var fecha = new Date(anio, mes - 1, dia, horas, minutos, segundos);
  if (isNaN(fecha.getTime())) return null;
  return fecha;
}

/** _mismoDia(d1, d2) — compara dos Date por año/mes/día, ignorando la hora. */
function _mismoDia(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

/**
 * _normalizarSiNoRequisito(valor) [→ Contexto_Base_Web.md §26B280]
 */
function _normalizarSiNoRequisito(valor) {
  var v = String(valor || '').trim().toLowerCase();
  if (v === 'si' || v === 'sí') return 'Sí';
  if (v === 'no') return 'No';
  return null;
}

/**
 * _valoresMinTAtaquesPorClan(requisitos) [→ Contexto_Base_Web.md §26B281]
 */
function _valoresMinTAtaquesPorClan(requisitos) {
  var minT = [], ataques = [];
  var porClan = (requisitos && requisitos.requisitosPorClan) || {};
  CFG.TERNA_TAGS.forEach(function (tag) {
    var nombreClan = _getNombreClanDump(tag);
    var datosClan = porClan[nombreClan] || {};
    minT.push(Number(datosClan.minTrofeosGuerra) || 0);
    ataques.push(Number(datosClan.minAtaquesSemana) || 0);
  });
  return { minT: minT, ataques: ataques };
}

/**
 * _valoresMinSAtaquesTorneosPorClan(requisitos) [→ Contexto_Base_Web.md §26B282]
 */
function _valoresMinSAtaquesTorneosPorClan(requisitos) {
  var minS = [], ataques = [], torneos = [];
  var porClan = (requisitos && requisitos.requisitosPorClan) || {};
  CFG.TERNA_TAGS.forEach(function (tag) {
    var nombreClan = _getNombreClanDump(tag);
    var datosClan = porClan[nombreClan] || {};
    minS.push(Number(datosClan.minTrofeosGuerra) || 0);
    ataques.push(Number(datosClan.minAtaquesSemana) || 0);
    torneos.push(Number(datosClan.minTorneos) || 0);
  });
  return { minS: minS, ataques: ataques, torneos: torneos };
}

/**
 * _registrarTorneoDesdeBot(link, fecha, hora, tagTorneoPrincipal, organizadorInfo) [→ Contexto_Base_Web.md §26B283]
 */
function _registrarTorneoDesdeBot(link, fecha, hora, tagTorneoPrincipal, organizadorInfo, semanasIsoCsv, requisitos, comentario) {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.T_LISTA);
  if (!sh) return { ok: false, error: 'No encontré la hoja T_Lista.' };

  var fechaHora = _combinarFechaHora(fecha, hora);
  if (!fechaHora) return { ok: false, error: 'Fecha u hora inválida.' };
  // FASE 1 (25-sep-2026, rediseño T_Lista, opción 1 del plan -- ver docblock [→ Contexto_Base_Web.md §26B284]
  var fechaSolo = new Date(fechaHora.getFullYear(), fechaHora.getMonth(), fechaHora.getDate());
  var horaSolo = _horaStringADate(fechaSolo, hora);

  var lastRow = sh.getLastRow();
  var filaPlanificadaEncontrada = -1;
  // Fase 12 (26-sep-2026, plan T_Lista -- ver docblock "PLAN EN CURSO" más [→ Contexto_Base_Web.md §26B285]
  var idYaLinkeadoEncontrado = '';
  // FIX (08-sep-2026, pedido usuario): header de 2 filas -- guard >= 3,
  // rango desde fila 3, offset +3 (antes +2).
  if (lastRow >= 3) {
    var datosExistentes = sh.getRange(3, 1, lastRow - 2, TL_TOTAL_COLS).getValues();
    for (var iPlan = 0; iPlan < datosExistentes.length; iPlan++) {
      var fPlan = datosExistentes[iPlan];
      var fechaFilaPlan = fPlan[TL.FECHA - 1];
      var horaFilaPlan = fPlan[TL.HORA - 1];
      var linkFilaPlan = String(fPlan[TL.LINK_APP - 1] || '').trim();
      // FASE 1: el emparejamiento por getTime() sobre una sola fecha [→ Contexto_Base_Web.md §26B286]
      var mismaFechaPlan = fechaFilaPlan instanceof Date && _mismoDia(fechaFilaPlan, fechaSolo);
      var mismaHoraPlan = horaFilaPlan instanceof Date && horaSolo instanceof Date &&
        horaFilaPlan.getHours() === horaSolo.getHours() &&
        horaFilaPlan.getMinutes() === horaSolo.getMinutes();
      if (!mismaFechaPlan || !mismaHoraPlan) continue;
      if (!linkFilaPlan) {
        filaPlanificadaEncontrada = iPlan + 3; // fila real de la hoja (1-based + 2 filas de header)
        break;
      }
      // Fase 12: misma fecha/hora, pero esta fila YA tiene Link_app -- se [→ Contexto_Base_Web.md §26B287]
      if (!idYaLinkeadoEncontrado) idYaLinkeadoEncontrado = String(fPlan[TL.ID - 1] || '').trim();
    }
  }

  // Fase 12: si no hay ninguna fila "Planificado sin link" que calce pero [→ Contexto_Base_Web.md §26B288]
  if (filaPlanificadaEncontrada === -1 && idYaLinkeadoEncontrado) {
    var resultadoCorreccion = _corregirLinkTorneoYaRegistrado(ss, idYaLinkeadoEncontrado, link);
    if (!resultadoCorreccion.ok) return resultadoCorreccion;
    procesarTListaNuevasFilas(ss);
    regenerarTControlSheet(ss);
    // 02-oct-2026: corregido:true avisa al llamador que se corrigió una fila
    // ya registrada (no se creó ninguna nueva) -- ver docblock de arriba.
    return { ok: true, id: idYaLinkeadoEncontrado, corregido: true };
  }

  var filaDestino;
  if (filaPlanificadaEncontrada !== -1) {
    filaDestino = filaPlanificadaEncontrada;
    sh.getRange(filaDestino, TL.LINK_APP).setValue(link);
    if (tagTorneoPrincipal) sh.getRange(filaDestino, TL.TAG_TOR_2).setValue(String(tagTorneoPrincipal).trim());
    if (organizadorInfo && organizadorInfo.nombre && organizadorInfo.tag) {
      sh.getRange(filaDestino, TL.ORGANIZADOR).setValue(organizadorInfo.nombre);
      sh.getRange(filaDestino, TL.TAG_ORG).setValue(organizadorInfo.tag);
      sh.getRange(filaDestino, TL.CLAN).setValue(organizadorInfo.clan || '');
      sh.getRange(filaDestino, TL.CLAN_TAG).setValue(organizadorInfo.clanTag || '');
    }
    // FIX (11-sep-2026): ver docblock de arriba -- semanas viajan desde el
    // selector del panel, se convierten a "T{n}_S{m},..." recién acá.
    if (semanasIsoCsv) sh.getRange(filaDestino, TL.SEMANAS).setValue(_construirSemanasCsvDesdeIsos(semanasIsoCsv));
  } else {
    var fila = new Array(TL_TOTAL_COLS).fill('');
    // FASE 1: Fecha (solo fecha) y Hora (solo hora) se escriben como dos
    // valores reales separados -- ver docblock de arriba.
    fila[TL.FECHA - 1]    = fechaSolo;
    fila[TL.HORA - 1]     = horaSolo;
    fila[TL.LINK_APP - 1] = link;
    if (tagTorneoPrincipal) fila[TL.TAG_TOR_2 - 1] = String(tagTorneoPrincipal).trim();
    if (organizadorInfo && organizadorInfo.nombre && organizadorInfo.tag) {
      fila[TL.ORGANIZADOR - 1] = organizadorInfo.nombre;
      fila[TL.TAG_ORG - 1]     = organizadorInfo.tag;
      fila[TL.CLAN - 1]        = organizadorInfo.clan || '';
      fila[TL.CLAN_TAG - 1]    = organizadorInfo.clanTag || '';
    }
    // FIX (11-sep-2026): ver docblock de arriba.
    if (semanasIsoCsv) fila[TL.SEMANAS - 1] = _construirSemanasCsvDesdeIsos(semanasIsoCsv);
    filaDestino = lastRow + 1;
    sh.getRange(filaDestino, 1, 1, TL_TOTAL_COLS).setValues([fila]);
  }
  // FASE 1: se reaplican los DOS formatos siempre (fila nueva o fila [→ Contexto_Base_Web.md §26B289]
  _trySetFmt(sh, filaDestino, TL.FECHA, 'dd/mm/yyyy');
  _trySetFmt(sh, filaDestino, TL.HORA, 'h:mm:ss AM/PM');

  // FIX (12-sep-2026): ver docblock de arriba -- se aplica DESPUÉS del [→ Contexto_Base_Web.md §26B290]
  if (requisitos) {
    var reqVals = _valoresMinTAtaquesPorClan(requisitos);
    sh.getRange(filaDestino, TL.MIN_T_C1, 1, 4).setValues([reqVals.minT]);
    sh.getRange(filaDestino, TL.ATAQUES_C1, 1, 4).setValues([reqVals.ataques]);
    // FIX (12-sep-2026, pedido del usuario -- requisito nuevo "Barcos"): [→ Contexto_Base_Web.md §26B291]
    if (requisitos.barcos !== undefined && requisitos.barcos !== null && requisitos.barcos !== '') {
      sh.getRange(filaDestino, TL.BARCOS).setValue(Number(requisitos.barcos) || 0);
    }
    var miembroActivoNorm = _normalizarSiNoRequisito(requisitos.miembroActivo);
    if (miembroActivoNorm) sh.getRange(filaDestino, TL.MIEMBRO_ACTIVO).setValue(miembroActivoNorm);
    var reaccionNorm = _normalizarSiNoRequisito(requisitos.reaccion);
    if (reaccionNorm) sh.getRange(filaDestino, TL.REACCION).setValue(reaccionNorm);
    var whatsappNorm = _normalizarSiNoRequisito(requisitos.presenciaWhatsapp);
    if (whatsappNorm) sh.getRange(filaDestino, TL.WHATSAPP).setValue(whatsappNorm);
  }
  if (comentario) sh.getRange(filaDestino, TL.COMENTARIO).setValue(String(comentario).trim());

  var idsNuevos = procesarTListaNuevasFilas(ss); // ya existe, procesa CUALQUIER fila pendiente, incluida la recién agregada
  if (idsNuevos.length === 0) {
    return { ok: false, error: 'No se pudo procesar el link (revisa que el formato sea el correcto).' };
  }
  var idNuevo = idsNuevos[idsNuevos.length - 1];

  actualizarDocParticipantesCalificadosTorneo();
  regenerarTControlSheet(ss);

  // FIX (02-ago-2026): arranca el activador de "Torneo en vivo" (cada 5 min [→ Contexto_Base_Web.md §26B292]
  try {
    iniciarActualizacionTorneoEnVivo(fechaHora);
  } catch (e) {
    // No bloquea la confirmación del torneo al admin si esto falla; solo
    // queda registrado en el log para diagnóstico.
    Logger.log('[Torneos] No se pudo iniciar Torneo en vivo tras registrar el torneo ' + idNuevo + ': ' + e.message);
  }

  // 02-oct-2026: corregido:false = fila nueva o fila "Planificado" completada
  // con su link (primer registro), ver docblock de arriba.
  return { ok: true, id: idNuevo, corregido: false };
}

/**
 * _planificarTorneoDesdeBot(fecha, hora, premios, tagTorneoPrincipal, organizadorInfo) [→ Contexto_Base_Web.md §26B293]
 */
function _planificarTorneoDesdeBot(fecha, hora, premios, tagTorneoPrincipal, organizadorInfo, semanasIsoCsv, requisitos, comentario) {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.T_LISTA);
  if (!sh) return { ok: false, error: 'No encontré la hoja T_Lista.' };

  var fechaHora = _combinarFechaHora(fecha, hora);
  if (!fechaHora) return { ok: false, error: 'Fecha u hora inválida.' };
  // FASE 1 (25-sep-2026): ver docblock de arriba / _registrarTorneoDesdeBot()
  // -- mismo criterio, Fecha y Hora se separan acá también.
  var fechaSolo = new Date(fechaHora.getFullYear(), fechaHora.getMonth(), fechaHora.getDate());
  var horaSolo = _horaStringADate(fechaSolo, hora);

  var premiosTexto = String(premios || '').trim();
  if (!premiosTexto) return { ok: false, error: 'Agrega al menos un premio.' };

  var fila = new Array(TL_TOTAL_COLS).fill('');
  fila[TL.FECHA - 1]   = fechaSolo;
  fila[TL.HORA - 1]    = horaSolo;
  fila[TL.PREMIOS - 1] = premiosTexto;
  fila[TL.ESTADO - 1]  = 'Planificado';
  if (tagTorneoPrincipal) fila[TL.TAG_TOR_2 - 1] = String(tagTorneoPrincipal).trim();
  if (organizadorInfo && organizadorInfo.nombre && organizadorInfo.tag) {
    fila[TL.ORGANIZADOR - 1] = organizadorInfo.nombre;
    fila[TL.TAG_ORG - 1]     = organizadorInfo.tag;
    fila[TL.CLAN - 1]        = organizadorInfo.clan || '';
    fila[TL.CLAN_TAG - 1]    = organizadorInfo.clanTag || '';
  }
  // FIX (11-sep-2026): ver docblock de _registrarTorneoDesdeBot() para el
  // detalle completo de _construirSemanasCsvDesdeIsos().
  if (semanasIsoCsv) fila[TL.SEMANAS - 1] = _construirSemanasCsvDesdeIsos(semanasIsoCsv);
  var filaDestino = sh.getLastRow() + 1;
  sh.getRange(filaDestino, 1, 1, TL_TOTAL_COLS).setValues([fila]);
  // FASE 1: se reaplican los dos formatos reales por separado (antes era
  // uno solo, 'dd/mm/yyyy hh:mm', combinado).
  _trySetFmt(sh, filaDestino, TL.FECHA, 'dd/mm/yyyy');
  _trySetFmt(sh, filaDestino, TL.HORA, 'h:mm:ss AM/PM');

  // FIX (12-sep-2026): ver docblock de _registrarTorneoDesdeBot() para el
  // detalle completo de _valoresMinTAtaquesPorClan()/_normalizarSiNoRequisito().
  if (requisitos) {
    var reqVals = _valoresMinTAtaquesPorClan(requisitos);
    sh.getRange(filaDestino, TL.MIN_T_C1, 1, 4).setValues([reqVals.minT]);
    sh.getRange(filaDestino, TL.ATAQUES_C1, 1, 4).setValues([reqVals.ataques]);
    // FIX (12-sep-2026, pedido del usuario -- requisito nuevo "Barcos"): [→ Contexto_Base_Web.md §26B294]
    if (requisitos.barcos !== undefined && requisitos.barcos !== null && requisitos.barcos !== '') {
      sh.getRange(filaDestino, TL.BARCOS).setValue(Number(requisitos.barcos) || 0);
    }
    var miembroActivoNorm = _normalizarSiNoRequisito(requisitos.miembroActivo);
    if (miembroActivoNorm) sh.getRange(filaDestino, TL.MIEMBRO_ACTIVO).setValue(miembroActivoNorm);
    var reaccionNorm = _normalizarSiNoRequisito(requisitos.reaccion);
    if (reaccionNorm) sh.getRange(filaDestino, TL.REACCION).setValue(reaccionNorm);
    var whatsappNorm = _normalizarSiNoRequisito(requisitos.presenciaWhatsapp);
    if (whatsappNorm) sh.getRange(filaDestino, TL.WHATSAPP).setValue(whatsappNorm);
  }
  if (comentario) sh.getRange(filaDestino, TL.COMENTARIO).setValue(String(comentario).trim());

  // FIX (08-sep-2026): asigna el ID de reserva de inmediato (ver docblock [→ Contexto_Base_Web.md §26B295]
  procesarTListaNuevasFilas(ss);

  return { ok: true };
}

/**
 * _listarTorneosDeHoy() [→ Contexto_Base_Web.md §26B296]
 */
function _listarTorneosDeHoy() {
  var sh = _getSs().getSheetByName(CFG.SHEETS.T_LISTA);
  // FIX (08-sep-2026, pedido usuario): header de 2 filas -- guard >= 3.
  if (!sh || sh.getLastRow() < 3) return [];
  var datos = sh.getRange(3, 1, sh.getLastRow() - 2, TL_TOTAL_COLS).getValues();
  var hoy = _hoyLimaSinHora();
  return datos
    .filter(function(f) { return f[TL.FECHA - 1] instanceof Date && _mismoDia(f[TL.FECHA - 1], hoy); })
    .map(function(f) {
      return {
        id: f[TL.ID - 1],
        fecha: f[TL.FECHA - 1],
        tagTor: String(f[TL.TAG_TOR - 1] || '').trim(),
        link: String(f[TL.LINK_APP - 1] || '').trim(),
        // FIX (12-sep-2026): ver docblock de arriba.
        autor: String(f[TL.ORGANIZADOR - 1] || '').trim(),
        premios: String(f[TL.PREMIOS - 1] || '').trim(),
        semanas: _extraerIsosDesdeSemanasCsv(String(f[TL.SEMANAS - 1] || '').trim()),
        // FIX (15-sep-2026): ver docblock de arriba.
        comentario: String(f[TL.COMENTARIO - 1] || '').trim(),
        // Fase 9 (25-sep-2026, plan T_Lista): 'API'|'Manual'|'' -- ver [→ Contexto_Base_Web.md §26B297]
        organizadorFuente: String(f[TL.ORGANIZADOR_FUENTE - 1] || '').trim()
      };
    });
}

/**
 * _extraerIsosDesdeSemanasCsv(semanasCsv) [→ Contexto_Base_Web.md §26B298]
 */
function _extraerIsosDesdeSemanasCsv(semanasCsv) {
  return String(semanasCsv || '').split(',').map(function (token) {
    var m = String(token).trim().match(/^T(\d+)_S(\d+)$/);
    if (!m) return null;
    var temporada = Number(m[1]);
    var semana = Number(m[2]);
    var primerLunes = primerLunesTemporada(CFG.REF_DEFAULT, temporada);
    if (!primerLunes || isNaN(primerLunes.getTime())) return null;
    var lunes = new Date(primerLunes.getTime());
    lunes.setDate(lunes.getDate() + (semana - 1) * 7);
    return Utilities.formatDate(lunes, 'America/Lima', 'yyyy-MM-dd');
  }).filter(Boolean);
}

/**
 * _modificarFechaHoraTorneo(id, fecha, hora, tagTorneoPrincipal) [→ Contexto_Base_Web.md §26B299]
 */
function _modificarFechaHoraTorneo(id, fecha, hora, tagTorneoPrincipal, semanasIsoCsv, comentario, requisitos, organizadorInfo, premios) {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.T_LISTA);
  if (!sh) return { ok: false, error: 'No encontré la hoja T_Lista.' };
  var fechaHora = _combinarFechaHora(fecha, hora);
  if (!fechaHora) return { ok: false, error: 'Fecha u hora inválida.' };
  // FASE 1 (25-sep-2026): ver docblock de arriba / _registrarTorneoDesdeBot()
  // -- mismo criterio, Fecha y Hora se separan acá también.
  var fechaSolo = new Date(fechaHora.getFullYear(), fechaHora.getMonth(), fechaHora.getDate());
  var horaSolo = _horaStringADate(fechaSolo, hora);
  var lastRow = sh.getLastRow();
  // FIX (08-sep-2026, pedido usuario): header de 2 filas -- guard < 3,
  // rango desde fila 3, offset +3 (antes +2).
  if (lastRow < 3) return { ok: false, error: 'T_Lista está vacía.' };
  var ids = sh.getRange(3, TL.ID, lastRow - 2, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0] || '') === String(id)) {
      var fila = i + 3;
      sh.getRange(fila, TL.FECHA).setValue(fechaSolo);
      sh.getRange(fila, TL.HORA).setValue(horaSolo);
      _trySetFmt(sh, fila, TL.FECHA, 'dd/mm/yyyy');
      _trySetFmt(sh, fila, TL.HORA, 'h:mm:ss AM/PM');
      var temporadaNueva = _calcularTemporadaParaFecha(fechaSolo);
      sh.getRange(fila, TL.TEMPORADA).setValue(temporadaNueva);
      if (tagTorneoPrincipal) sh.getRange(fila, TL.TAG_TOR_2).setValue(String(tagTorneoPrincipal).trim());
      // FIX (11-sep-2026): ver docblock de arriba.
      if (semanasIsoCsv) sh.getRange(fila, TL.SEMANAS).setValue(_construirSemanasCsvDesdeIsos(semanasIsoCsv));
      // FIX (12-sep-2026): ver docblock de arriba -- '' = no tocar.
      if (comentario) sh.getRange(fila, TL.COMENTARIO).setValue(String(comentario).trim());
      // FIX (12-sep-2026): ver docblock de arriba -- ya existe precarga [→ Contexto_Base_Web.md §26B300]
      if (requisitos) {
        var reqVals = _valoresMinTAtaquesPorClan(requisitos);
        sh.getRange(fila, TL.MIN_T_C1, 1, 4).setValues([reqVals.minT]);
        sh.getRange(fila, TL.ATAQUES_C1, 1, 4).setValues([reqVals.ataques]);
        // FIX (12-sep-2026, pedido del usuario -- requisito nuevo "Barcos"): [→ Contexto_Base_Web.md §26B301]
        if (requisitos.barcos !== undefined && requisitos.barcos !== null && requisitos.barcos !== '') {
          sh.getRange(fila, TL.BARCOS).setValue(Number(requisitos.barcos) || 0);
        }
        var miembroActivoNorm = _normalizarSiNoRequisito(requisitos.miembroActivo);
        if (miembroActivoNorm) sh.getRange(fila, TL.MIEMBRO_ACTIVO).setValue(miembroActivoNorm);
        var reaccionNorm = _normalizarSiNoRequisito(requisitos.reaccion);
        if (reaccionNorm) sh.getRange(fila, TL.REACCION).setValue(reaccionNorm);
        var whatsappNorm = _normalizarSiNoRequisito(requisitos.presenciaWhatsapp);
        if (whatsappNorm) sh.getRange(fila, TL.WHATSAPP).setValue(whatsappNorm);
      }
      // FIX (12-sep-2026, gap admin.html/btnModificarTorneo): ver docblock [→ Contexto_Base_Web.md §26B302]
      if (organizadorInfo && organizadorInfo.nombre && organizadorInfo.tag) {
        sh.getRange(fila, TL.ORGANIZADOR).setValue(organizadorInfo.nombre);
        sh.getRange(fila, TL.TAG_ORG).setValue(organizadorInfo.tag);
        sh.getRange(fila, TL.CLAN).setValue(organizadorInfo.clan || '');
        sh.getRange(fila, TL.CLAN_TAG).setValue(organizadorInfo.clanTag || '');
      }
      // FIX (12-sep-2026, gap admin.html/btnModificarTorneo): ver docblock
      // de arriba -- '' = no tocar (mismo criterio que comentario).
      if (premios) sh.getRange(fila, TL.PREMIOS).setValue(String(premios).trim());
      regenerarTControlSheet(ss);
      return { ok: true };
    }
  }
  return { ok: false, error: 'No encontré el torneo ' + id + '.' };
}

/**
 * _obtenerOrganizadorFuenteTLista(id) [→ Contexto_Base_Web.md §26B303]
 */
function _obtenerOrganizadorFuenteTLista(id) {
  var sh = _getSs().getSheetByName(CFG.SHEETS.T_LISTA);
  if (!sh || sh.getLastRow() < 3) return '';
  var numFilas = sh.getLastRow() - 2;
  var ids = sh.getRange(3, TL.ID, numFilas, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0] || '') === String(id)) {
      return String(sh.getRange(i + 3, TL.ORGANIZADOR_FUENTE).getValue() || '').trim();
    }
  }
  return '';
}

/**
 * _corregirLinkTorneoYaRegistrado(ss, id, linkNuevo) [→ Contexto_Base_Web.md §26B304]
 */
function _corregirLinkTorneoYaRegistrado(ss, id, linkNuevo) {
  var sh = ss.getSheetByName(CFG.SHEETS.T_LISTA);
  if (!sh || sh.getLastRow() < 3) return { ok: false, error: 'No encontré la hoja T_Lista.' };
  var numFilas = sh.getLastRow() - 2;
  var ids = sh.getRange(3, TL.ID, numFilas, 1).getValues();
  var filaHoja = -1;
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0] || '') === String(id)) { filaHoja = i + 3; break; }
  }
  if (filaHoja === -1) return { ok: false, error: 'No encontré el torneo ' + id + '.' };

  var linkAppExistente = String(sh.getRange(filaHoja, TL.LINK_APP).getValue() || '').trim();
  if (!linkAppExistente) return { ok: true, sinLinkPrevio: true };

  // Mismo regex que usa procesarTListaNuevasFilas() (más abajo en este [→ Contexto_Base_Web.md §26B305]
  var match = String(linkNuevo || '').match(/[?&]id=([^&]+)(?:&pass=([^&]*))?/);
  if (!match) return { ok: false, error: 'No se pudo leer el link del torneo (formato inválido).' };
  var tagNuevo = match[1].trim();
  var contrasenaNueva = match[2] ? match[2].trim() : '';

  var tagExistente = String(sh.getRange(filaHoja, TL.TAG_TOR).getValue() || '').trim();
  var tagNuevoNorm = tagNuevo.replace('#', '').toUpperCase();
  var tagExistenteNorm = tagExistente.replace('#', '').toUpperCase();

  sh.getRange(filaHoja, TL.LINK_APP).setValue(linkNuevo);

  if (tagExistente && tagNuevoNorm === tagExistenteNorm) {
    // Mismo torneo -- solo pudo cambiar &pass=. Se actualiza Contraseña acá [→ Contexto_Base_Web.md §26B306]
    sh.getRange(filaHoja, TL.CONTRASENA).setValue(contrasenaNueva);
    Logger.log('[T_Lista] Fila ' + filaHoja + ' (id ' + id + '): Link_app corregido, mismo Tag_Tor (' +
               tagExistente + ') -- se trata como refresco normal, Organizador no se reprocesa.');
    return { ok: true, cambioTag: false };
  }

  // Torneo distinto de verdad -- se borran Tag_Tor/Contraseña/Link_json [→ Contexto_Base_Web.md §26B307]
  sh.getRange(filaHoja, TL.TAG_TOR).setValue('');
  sh.getRange(filaHoja, TL.CONTRASENA).setValue('');
  sh.getRange(filaHoja, TL.LINK_JSON).setValue('');
  Logger.log('[T_Lista] Fila ' + filaHoja + ' (id ' + id + '): Link_app corregido, Tag_Tor cambió (' +
             tagExistente + ' -> ' + tagNuevo + ') -- Tag_Tor/Contraseña/Link_json se limpian para que ' +
             'procesarTListaNuevasFilas() reprocese la fila completa (columnas de solo lectura + Organizador).');
  return { ok: true, cambioTag: true };
}

/**
 * _listarSorteosDeHoy() [→ Contexto_Base_Web.md §26B308]
 */
function _listarSorteosDeHoy() {
  var sh = _getSs().getSheetByName(CFG.SHEETS.S_LISTA);
  if (!sh || sh.getLastRow() < 3) return [];
  var datos = sh.getRange(3, 1, sh.getLastRow() - 2, SL_TOTAL_COLS).getValues();
  var hoy = _hoyLimaSinHora();
  return datos
    .filter(function(f) { return f[SL.FECHA - 1] instanceof Date && _mismoDia(f[SL.FECHA - 1], hoy); })
    .map(function(f) {
      return {
        id: f[SL.ID - 1],
        fecha: f[SL.FECHA - 1],
        idPrincipal: String(f[SL.ID_2 - 1] || '').trim(),
        autor: String(f[SL.ORGANIZADOR - 1] || '').trim(),
        premios: String(f[SL.PREMIOS - 1] || '').trim(),
        semanas: _extraerIsosDesdeSemanasCsv(String(f[SL.SEMANAS - 1] || '').trim()),
        // AMPLIADO (15-sep-2026, cierre de conexión pendiente -- mismo [→ Contexto_Base_Web.md §26B309]
        comentario: String(f[SL.COMENTARIO - 1] || '').trim()
      };
    });
}

/**
 * _registrarSorteoDesdeBot(fecha, hora, idSorteoPrincipal, organizadorInfo, semanasIsoCsv, requisitos, comentario) [→ Contexto_Base_Web.md §26B310]
 */
function _registrarSorteoDesdeBot(fecha, hora, idSorteoPrincipal, organizadorInfo, semanasIsoCsv, requisitos, comentario) {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.S_LISTA);
  if (!sh) return { ok: false, error: 'No encontré la hoja S_Lista.' };

  var fechaHora = _combinarFechaHora(fecha, hora);
  if (!fechaHora) return { ok: false, error: 'Fecha u hora inválida.' };

  var lastRow = sh.getLastRow();
  var filaPlanificadaEncontrada = -1;
  if (lastRow >= 3) {
    var datosExistentes = sh.getRange(3, 1, lastRow - 2, SL_TOTAL_COLS).getValues();
    for (var iPlan = 0; iPlan < datosExistentes.length; iPlan++) {
      var fPlan = datosExistentes[iPlan];
      var fechaFilaPlan = fPlan[SL.FECHA - 1];
      var estadoFilaPlan = String(fPlan[SL.ESTADO - 1] || '').trim();
      if (estadoFilaPlan === 'Planificado' && fechaFilaPlan instanceof Date && fechaFilaPlan.getTime() === fechaHora.getTime()) {
        filaPlanificadaEncontrada = iPlan + 3; // fila real de la hoja (1-based + 2 filas de header)
        break;
      }
    }
  }

  var filaDestino;
  if (filaPlanificadaEncontrada !== -1) {
    filaDestino = filaPlanificadaEncontrada;
    sh.getRange(filaDestino, SL.ESTADO).setValue('Realizado');
    if (idSorteoPrincipal) sh.getRange(filaDestino, SL.ID_2).setValue(String(idSorteoPrincipal).trim());
    if (organizadorInfo && organizadorInfo.nombre && organizadorInfo.tag) {
      sh.getRange(filaDestino, SL.ORGANIZADOR).setValue(organizadorInfo.nombre);
      sh.getRange(filaDestino, SL.TAG_ORG).setValue(organizadorInfo.tag);
      sh.getRange(filaDestino, SL.CLAN).setValue(organizadorInfo.clan || '');
      sh.getRange(filaDestino, SL.CLAN_TAG).setValue(organizadorInfo.clanTag || '');
    }
    if (semanasIsoCsv) sh.getRange(filaDestino, SL.SEMANAS).setValue(_construirSemanasCsvDesdeIsos(semanasIsoCsv));
  } else {
    var fila = new Array(SL_TOTAL_COLS).fill('');
    fila[SL.FECHA - 1]  = fechaHora;
    fila[SL.ESTADO - 1] = 'Realizado';
    if (idSorteoPrincipal) fila[SL.ID_2 - 1] = String(idSorteoPrincipal).trim();
    if (organizadorInfo && organizadorInfo.nombre && organizadorInfo.tag) {
      fila[SL.ORGANIZADOR - 1] = organizadorInfo.nombre;
      fila[SL.TAG_ORG - 1]     = organizadorInfo.tag;
      fila[SL.CLAN - 1]        = organizadorInfo.clan || '';
      fila[SL.CLAN_TAG - 1]    = organizadorInfo.clanTag || '';
    }
    if (semanasIsoCsv) fila[SL.SEMANAS - 1] = _construirSemanasCsvDesdeIsos(semanasIsoCsv);
    filaDestino = lastRow + 1;
    sh.getRange(filaDestino, 1, 1, SL_TOTAL_COLS).setValues([fila]);
  }
  _trySetFmt(sh, filaDestino, SL.FECHA, 'dd/mm/yyyy hh:mm');

  if (requisitos) {
    var reqVals = _valoresMinSAtaquesTorneosPorClan(requisitos);
    sh.getRange(filaDestino, SL.MIN_S_C1, 1, 4).setValues([reqVals.minS]);
    sh.getRange(filaDestino, SL.ATAQUES_C1, 1, 4).setValues([reqVals.ataques]);
    // FIX (12-sep-2026, pedido del usuario -- requisito nuevo "Barcos"): [→ Contexto_Base_Web.md §26B311]
    if (requisitos.barcos !== undefined && requisitos.barcos !== null && requisitos.barcos !== '') {
      sh.getRange(filaDestino, SL.BARCOS).setValue(Number(requisitos.barcos) || 0);
    }
    sh.getRange(filaDestino, SL.TORNEOS_C1, 1, 4).setValues([reqVals.torneos]);
    if (requisitos.delta !== undefined && requisitos.delta !== null && requisitos.delta !== '') {
      sh.getRange(filaDestino, SL.MIN_S_DELTA).setValue(Number(requisitos.delta) || 0);
    }
    var miembroActivoNorm = _normalizarSiNoRequisito(requisitos.miembroActivo);
    if (miembroActivoNorm) sh.getRange(filaDestino, SL.MIEMBRO_ACTIVO).setValue(miembroActivoNorm);
    var reaccionNorm = _normalizarSiNoRequisito(requisitos.reaccion);
    if (reaccionNorm) sh.getRange(filaDestino, SL.REACCION).setValue(reaccionNorm);
    var whatsappNorm = _normalizarSiNoRequisito(requisitos.presenciaWhatsapp);
    if (whatsappNorm) sh.getRange(filaDestino, SL.WHATSAPP).setValue(whatsappNorm);
  }
  if (comentario) sh.getRange(filaDestino, SL.COMENTARIO).setValue(String(comentario).trim());

  procesarSListaNuevasFilas(ss); // asigna el ID de reserva sobre la fila recién agregada/completada
  var idNuevo = String(sh.getRange(filaDestino, SL.ID).getValue() || '').trim();
  if (!idNuevo) {
    return { ok: false, error: 'No se pudo asignar el ID del sorteo (revisa que la fecha sea válida).' };
  }

  return { ok: true, id: idNuevo };
}

/**
 * _planificarSorteoDesdeBot(fecha, hora, premios, idSorteoPrincipal, organizadorInfo, semanasIsoCsv, requisitos,… [→ Contexto_Base_Web.md §26B312]
 */
function _planificarSorteoDesdeBot(fecha, hora, premios, idSorteoPrincipal, organizadorInfo, semanasIsoCsv, requisitos, comentario) {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.S_LISTA);
  if (!sh) return { ok: false, error: 'No encontré la hoja S_Lista.' };

  var fechaHora = _combinarFechaHora(fecha, hora);
  if (!fechaHora) return { ok: false, error: 'Fecha u hora inválida.' };

  var premiosTexto = String(premios || '').trim();
  if (!premiosTexto) return { ok: false, error: 'Agrega al menos un premio.' };

  var fila = new Array(SL_TOTAL_COLS).fill('');
  fila[SL.FECHA - 1]   = fechaHora;
  fila[SL.PREMIOS - 1] = premiosTexto;
  fila[SL.ESTADO - 1]  = 'Planificado';
  if (idSorteoPrincipal) fila[SL.ID_2 - 1] = String(idSorteoPrincipal).trim();
  if (organizadorInfo && organizadorInfo.nombre && organizadorInfo.tag) {
    fila[SL.ORGANIZADOR - 1] = organizadorInfo.nombre;
    fila[SL.TAG_ORG - 1]     = organizadorInfo.tag;
    fila[SL.CLAN - 1]        = organizadorInfo.clan || '';
    fila[SL.CLAN_TAG - 1]    = organizadorInfo.clanTag || '';
  }
  if (semanasIsoCsv) fila[SL.SEMANAS - 1] = _construirSemanasCsvDesdeIsos(semanasIsoCsv);
  var filaDestino = sh.getLastRow() + 1;
  sh.getRange(filaDestino, 1, 1, SL_TOTAL_COLS).setValues([fila]);
  _trySetFmt(sh, filaDestino, SL.FECHA, 'dd/mm/yyyy hh:mm');

  if (requisitos) {
    var reqVals = _valoresMinSAtaquesTorneosPorClan(requisitos);
    sh.getRange(filaDestino, SL.MIN_S_C1, 1, 4).setValues([reqVals.minS]);
    sh.getRange(filaDestino, SL.ATAQUES_C1, 1, 4).setValues([reqVals.ataques]);
    // FIX (12-sep-2026, pedido del usuario -- requisito nuevo "Barcos"): [→ Contexto_Base_Web.md §26B313]
    if (requisitos.barcos !== undefined && requisitos.barcos !== null && requisitos.barcos !== '') {
      sh.getRange(filaDestino, SL.BARCOS).setValue(Number(requisitos.barcos) || 0);
    }
    sh.getRange(filaDestino, SL.TORNEOS_C1, 1, 4).setValues([reqVals.torneos]);
    if (requisitos.delta !== undefined && requisitos.delta !== null && requisitos.delta !== '') {
      sh.getRange(filaDestino, SL.MIN_S_DELTA).setValue(Number(requisitos.delta) || 0);
    }
    var miembroActivoNorm = _normalizarSiNoRequisito(requisitos.miembroActivo);
    if (miembroActivoNorm) sh.getRange(filaDestino, SL.MIEMBRO_ACTIVO).setValue(miembroActivoNorm);
    var reaccionNorm = _normalizarSiNoRequisito(requisitos.reaccion);
    if (reaccionNorm) sh.getRange(filaDestino, SL.REACCION).setValue(reaccionNorm);
    var whatsappNorm = _normalizarSiNoRequisito(requisitos.presenciaWhatsapp);
    if (whatsappNorm) sh.getRange(filaDestino, SL.WHATSAPP).setValue(whatsappNorm);
  }
  if (comentario) sh.getRange(filaDestino, SL.COMENTARIO).setValue(String(comentario).trim());

  procesarSListaNuevasFilas(ss);

  return { ok: true };
}

/**
 * _modificarFechaHoraSorteo(id, fecha, hora, idSorteoPrincipal, semanasIsoCsv, comentario, requisitos,… [→ Contexto_Base_Web.md §26B314]
 */
function _modificarFechaHoraSorteo(id, fecha, hora, idSorteoPrincipal, semanasIsoCsv, comentario, requisitos, organizadorInfo, premios) {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.S_LISTA);
  if (!sh) return { ok: false, error: 'No encontré la hoja S_Lista.' };
  var fechaHora = _combinarFechaHora(fecha, hora);
  if (!fechaHora) return { ok: false, error: 'Fecha u hora inválida.' };
  var lastRow = sh.getLastRow();
  if (lastRow < 3) return { ok: false, error: 'S_Lista está vacía.' };
  var ids = sh.getRange(3, SL.ID, lastRow - 2, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0] || '') === String(id)) {
      var fila = i + 3;
      sh.getRange(fila, SL.FECHA).setValue(fechaHora);
      _trySetFmt(sh, fila, SL.FECHA, 'dd/mm/yyyy hh:mm');
      var temporadaNueva = _calcularTemporadaParaFecha(fechaHora);
      sh.getRange(fila, SL.TEMPORADA).setValue(temporadaNueva);
      if (idSorteoPrincipal) sh.getRange(fila, SL.ID_2).setValue(String(idSorteoPrincipal).trim());
      if (semanasIsoCsv) sh.getRange(fila, SL.SEMANAS).setValue(_construirSemanasCsvDesdeIsos(semanasIsoCsv));
      if (comentario) sh.getRange(fila, SL.COMENTARIO).setValue(String(comentario).trim());
      if (requisitos) {
        var reqVals = _valoresMinSAtaquesTorneosPorClan(requisitos);
        sh.getRange(fila, SL.MIN_S_C1, 1, 4).setValues([reqVals.minS]);
        sh.getRange(fila, SL.ATAQUES_C1, 1, 4).setValues([reqVals.ataques]);
        // FIX (12-sep-2026, pedido del usuario -- requisito nuevo "Barcos"): [→ Contexto_Base_Web.md §26B315]
        if (requisitos.barcos !== undefined && requisitos.barcos !== null && requisitos.barcos !== '') {
          sh.getRange(fila, SL.BARCOS).setValue(Number(requisitos.barcos) || 0);
        }
        sh.getRange(fila, SL.TORNEOS_C1, 1, 4).setValues([reqVals.torneos]);
        if (requisitos.delta !== undefined && requisitos.delta !== null && requisitos.delta !== '') {
          sh.getRange(fila, SL.MIN_S_DELTA).setValue(Number(requisitos.delta) || 0);
        }
        var miembroActivoNorm = _normalizarSiNoRequisito(requisitos.miembroActivo);
        if (miembroActivoNorm) sh.getRange(fila, SL.MIEMBRO_ACTIVO).setValue(miembroActivoNorm);
        var reaccionNorm = _normalizarSiNoRequisito(requisitos.reaccion);
        if (reaccionNorm) sh.getRange(fila, SL.REACCION).setValue(reaccionNorm);
        var whatsappNorm = _normalizarSiNoRequisito(requisitos.presenciaWhatsapp);
        if (whatsappNorm) sh.getRange(fila, SL.WHATSAPP).setValue(whatsappNorm);
      }
      if (organizadorInfo && organizadorInfo.nombre && organizadorInfo.tag) {
        sh.getRange(fila, SL.ORGANIZADOR).setValue(organizadorInfo.nombre);
        sh.getRange(fila, SL.TAG_ORG).setValue(organizadorInfo.tag);
        sh.getRange(fila, SL.CLAN).setValue(organizadorInfo.clan || '');
        sh.getRange(fila, SL.CLAN_TAG).setValue(organizadorInfo.clanTag || '');
      }
      if (premios) sh.getRange(fila, SL.PREMIOS).setValue(String(premios).trim());
      return { ok: true };
    }
  }
  return { ok: false, error: 'No encontré el sorteo ' + id + '.' };
}