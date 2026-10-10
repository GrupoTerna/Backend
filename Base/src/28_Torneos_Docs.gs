// ==============================================================================
// 28_Torneos_Docs.gs
// Generacion de los documentos de Torneos: participantes calificados (sorteo y
// torneo) y ganadores (sorteo y torneo).
// ==============================================================================

// ----- Variables y constantes -----

var DOC_ID_GANADORES_SORTEO = '1ahOcvTGY9GTCdQhWcYZ9WFFC4PNXjrSllFPiLu-ojrg';

// ID de Drive de cada documento "Ganadores" (confirmados por el usuario). [→ Contexto_Base_Web.md §28B001]
var DOC_ID_GANADORES_TORNEO = '1f2expvIT5QsFzHGRqgR7FbV0p5rO2iHMz06xVs1Dfjo';

// ID de Drive de cada documento de arriba (confirmados por el usuario). [→ Contexto_Base_Web.md §28B002]
var DOC_ID_PARTICIPANTES_CALIFICADOS_SORTEO = '1m31X5WcX6zf9L8DqSMfvydZjG0kdJm4DQkqjSQa6Jzs';

var DOC_ID_PARTICIPANTES_CALIFICADOS_TORNEO = '1c78tjTG8HEtsfGgwivxrf_CFkwj8SqPZqr40Oc22NWA';

var NOMBRE_DOC_GANADORES_SORTEO = 'Ganadores (sorteo) - Comunidad - ᴳ乂ᵀ ⚜️ Familia Terna';

// Nombres exactos de los Google Docs "Ganadores" dentro de [→ Contexto_Base_Web.md §28B003]
var NOMBRE_DOC_GANADORES_TORNEO = 'Ganadores (torneo) - Comunidad - ᴳ乂ᵀ ⚜️ Familia Terna';

// PARTICIPANTES CALIFICADOS (Doc de Drive) [→ Contexto_Base_Web.md §28B004]

// Nombres exactos de los Google Docs dentro de DRIVE_FOLDER_ID_PLANTILLAS. [→ Contexto_Base_Web.md §28B005]
var NOMBRE_DOC_PARTICIPANTES_CALIFICADOS_SORTEO = 'Participantes calificados (sorteo) - Comunidad - ᴳ乂ᵀ ⚜️ Familia Terna';

var NOMBRE_DOC_PARTICIPANTES_CALIFICADOS_TORNEO = 'Participantes calificados (torneo) - Comunidad - ᴳ乂ᵀ ⚜️ Familia Terna';

// RECONSTRUCCIÓN DESDE CERO DE LOS 4 DOCS DE TORNEOS/SORTEOS [→ Contexto_Base_Web.md §28B006]
var _CLANES_TERNA_ORDEN_DOC_RECONSTRUCCION = ['Grupo乂Terna™', 'GrupoXTerna™2', 'GrupoXTerna™3', 'Mini乂Ternas™'];

// ----- Funciones manuales / punto de entrada -----

/**
 * reconstruirDocsTorneosSorteoFaltantes() [→ Contexto_Base_Web.md §28B007]
 */
function reconstruirDocsTorneosSorteoFaltantes() {
  var nombres = [
    NOMBRE_DOC_PARTICIPANTES_CALIFICADOS_SORTEO,
    NOMBRE_DOC_PARTICIPANTES_CALIFICADOS_TORNEO,
    NOMBRE_DOC_GANADORES_SORTEO,
    NOMBRE_DOC_GANADORES_TORNEO
  ];
  var ids = [
    DOC_ID_PARTICIPANTES_CALIFICADOS_SORTEO,
    DOC_ID_PARTICIPANTES_CALIFICADOS_TORNEO,
    DOC_ID_GANADORES_SORTEO,
    DOC_ID_GANADORES_TORNEO
  ];
  for (var i = 0; i < nombres.length; i++) {
    var archivo = _buscarArchivoEnPlantillas(nombres[i], ids[i]);
    if (archivo) {
      Logger.log('[ReconstruirDocs] "' + nombres[i] + '" OK (existe, ID: ' + archivo.getId() + ').');
    } else {
      Logger.log('[ReconstruirDocs] "' + nombres[i] + '" NO se pudo encontrar NI recrear. Revisar permisos de Drive / DRIVE_FOLDER_ID_PLANTILLAS_TORNEOS_SORTEOS.');
    }
  }
}

/**
 * actualizarDocParticipantesCalificados() [→ Contexto_Base_Web.md §28B008]
 */
// FIX (31/08/2026, pedido del usuario -- sugerencia #2 de la lista de [→ Contexto_Base_Web.md §28B009]
function actualizarDocParticipantesCalificados(ctxParam) {
  _actualizarUnDocParticipantesCalificados(NOMBRE_DOC_PARTICIPANTES_CALIFICADOS_SORTEO, DOC_ID_PARTICIPANTES_CALIFICADOS_SORTEO, ctxParam);
}

function actualizarDocParticipantesCalificadosTorneo(ctxParam) {
  var archivo;
  try {
    // FASE (01/08/2026): _buscarArchivoEnPlantillas() busca primero por ID [→ Contexto_Base_Web.md §28B010]
    archivo = _buscarArchivoEnPlantillas(NOMBRE_DOC_PARTICIPANTES_CALIFICADOS_TORNEO, DOC_ID_PARTICIPANTES_CALIFICADOS_TORNEO);
    if (!archivo) {
      Logger.log('[ParticipantesCalificados-Torneo] No se encontró "' + NOMBRE_DOC_PARTICIPANTES_CALIFICADOS_TORNEO + '" ni en la carpeta de plantillas ni en sus subcarpetas. Se omite.');
      return;
    }
  } catch (e) {
    Logger.log('[ParticipantesCalificados-Torneo] Error al buscar el documento: ' + e.message);
    return;
  }

  var doc;
  try {
    doc = DocumentApp.openById(archivo.getId());
  } catch (e) {
    Logger.log('[ParticipantesCalificados-Torneo] Error al abrir el documento: ' + e.message);
    return;
  }
  var body = doc.getBody();
  var ss = _getSs();

  // 1. Fecha: se toma la del torneo más reciente de T_Lista, salvo que el [→ Contexto_Base_Web.md §28B011]
  var fechaDocActualizada = _actualizarFechaDocTorneo(body, ss);

  // 2. Requisitos: Min_T por clan, leído de la fila más reciente de cada [→ Contexto_Base_Web.md §28B012]
  var infoMinT = _getMinTPorNombreClan('Torneo');
  var minTPorNombreClan = infoMinT.minTPorNombreClan;
  var clanesOrden = infoMinT.clanesOrden; // mismo orden en que CFG.TERNA_TAGS lista los clanes

  if (clanesOrden.length === 0) {
    Logger.log('[ParticipantesCalificados-Torneo] No hay clanes con Min_T activo en T_Lista todavía. Se omite la lista, solo se actualizó la fecha.');
    doc.saveAndClose();
    return;
  }

  // 3. FIX (05-ago-2026) — pedido del usuario: la temporada/semana a [→ Contexto_Base_Web.md §28B013]
  var ctxReal = ctxParam || _getCtx();
  if (ctxReal.periodIndexSospechoso) {
    Logger.log('[ParticipantesCalificados-Torneo] ABORT: periodIndex sospechoso, se omite esta corrida (solo se actualizó la fecha).');
    doc.saveAndClose();
    return;
  }
  var temporadaMostrar = _getTemporadaMostrarExtra(ss, ctxReal);
  var ctx = _clonarCtxParaTemporada(ctxReal, temporadaMostrar);

  // Ataques: FIX (05-ago-2026) — antes exigía 16 ataques en la semana REAL [→ Contexto_Base_Web.md §28B014]
  var ataquesSemanaPorTag = _getAtaquesYExentosSemanaActualPorTag(ctx, ctxReal.temporada); // 19-sep-2026: { ataques, exentos }
  // 19-sep-2026 (pedido del usuario): el mínimo de ataques sale del Ataques configurado por clan en T_Lista
  // (ya no un 16 fijo); ver _ataquesMinTorneoPorNombreClan() y _cumpleAtaquesTorneoClan().
  var ataquesMinPorClan = _ataquesMinTorneoPorNombreClan();

  // 3bis. Barcos (FIX 12-sep-2026, pedido del usuario -- calificación real [→ Contexto_Base_Web.md §28B015]
  var bloqueBarcos = _getConfigMasRecienteCategoria('Torneo');
  var reqBarcos = (bloqueBarcos[0] && bloqueBarcos[0].barcos) || { activo: false, qty: null };
  var semanasBarcos = (bloqueBarcos[0] && bloqueBarcos[0].semanas) || [];
  if (reqBarcos.activo && semanasBarcos.length === 0) {
    Logger.log('[ParticipantesCalificados-Torneo] ABORT: Barcos está activo en T_Lista pero falta configurar "Semanas". Se omite la lista, solo se actualizó la fecha.');
    doc.saveAndClose();
    return;
  }
  // Mismo cálculo EXACTO que usa _webSorteoCalificados() -- ver [→ Contexto_Base_Web.md §28B016]
  var barcosPromPorTag = reqBarcos.activo
    ? _getTrofeosYAtaquesSemanalesPorTag(semanasBarcos, ctxReal)
    : {};

  // 4. Cruce con Directorio: solo cuentas Activas en clanes Terna que [→ Contexto_Base_Web.md §28B017]
  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!shDir || shDir.getLastRow() < 2) { doc.saveAndClose(); return; }

  var trofeosPorTag = _getTrofeosGuerraAcumuladosPorTagParaTemporada(temporadaMostrar, ctxReal);
  var dirData = shDir.getRange(2, 1, shDir.getLastRow() - 1, DIR_SHEET_COLS).getValues();

  // Un array de calificados por cada clan (mismo orden que clanesOrden).
  var porClan = {};
  for (var ci = 0; ci < clanesOrden.length; ci++) porClan[clanesOrden[ci]] = [];

  var totalCalificados = 0;
  for (var i = 0; i < dirData.length; i++) {
    var r = dirData[i];
    if (String(r[IC.ESTADO - 1]) !== 'Activo') continue;
    if (CFG.TERNA_TAGS.indexOf(String(r[IC.CLAN_TAG - 1])) < 0) continue;

    var clan = String(r[IC.CLAN - 1] || '').trim();
    if (!(clan in minTPorNombreClan)) continue; // clan sin Min_T definido (no es Terna), no califica

    var tag = String(r[IC.TAG - 1] || '').trim();

    // 19-sep-2026: el Ataques de T_Lista para su clan, menos 4 por cada día opcional (clan ya cruzó la meta).
    if (!_cumpleAtaquesTorneoClan(ataquesSemanaPorTag[tag], ataquesMinPorClan, clan)) continue;

    var trofeos = trofeosPorTag[tag] || 0;
    if (trofeos < minTPorNombreClan[clan]) continue;

    // FIX (12-sep-2026, pedido del usuario -- requisito "Barcos", tope [→ Contexto_Base_Web.md §28B018]
    if (reqBarcos.activo) {
      var barcosProm = (barcosPromPorTag[tag] && barcosPromPorTag[tag].barcosProm) || 0;
      if (barcosProm > reqBarcos.qty) continue;
    }

    porClan[clan].push({ nombre: String(r[IC.NOMBRE - 1] || ''), puntaje: trofeos });
    totalCalificados++;
  }

  // Armar los grupos en el mismo orden en que aparecen los clanes en la [→ Contexto_Base_Web.md §28B019]
  var grupos = [];
  for (var gi = 0; gi < clanesOrden.length; gi++) {
    grupos.push({ clan: clanesOrden[gi], personas: porClan[clanesOrden[gi]] });
  }

  _reemplazarListaParticipantes(body, grupos);

  doc.saveAndClose();
  Logger.log('[ParticipantesCalificados-Torneo] ' +
    (fechaDocActualizada ? 'Fecha actualizada al torneo más reciente de T_Lista. ' : 'Fecha del docx conservada (edición manual más reciente). ') +
    totalCalificados + ' cuenta(s) calificada(s) (temporada ' + temporadaMostrar +
    (String(temporadaMostrar) === String(ctxReal.temporada) ? ' real vigente' : ' vía Extra!Mostrar') +
    ', Min_T y Ataques por clan (T_Lista, menos 4 por día opcional), en la última semana con datos' +
    (reqBarcos.activo ? ', máximo ' + reqBarcos.qty + ' ataques a barcos en promedio semanal).' : ').'));
}

/**
 * actualizarDocGanadoresTorneo() [→ Contexto_Base_Web.md §28B020]
 */
function actualizarDocGanadoresTorneo(ctxParam) {
  var ss = _getSs();
  var shTA = ss.getSheetByName(CFG.SHEETS.T_ASISTENCIA);
  var shTL = ss.getSheetByName(CFG.SHEETS.T_LISTA);
  // FIX (09-sep-2026): T_Lista tiene header de 2 filas (ver [→ Contexto_Base_Web.md §28B021]
  if (!shTA || shTA.getLastRow() < 2 || !shTL || shTL.getLastRow() < 3) return;

  // 1) Torneo puntual: prioriza el ID guardado a mano en [→ Contexto_Base_Web.md §28B022]
  var listaData = shTL.getRange(3, 1, shTL.getLastRow() - 2, TL_TOTAL_COLS).getValues();
  var idMasReciente = null, fechaMasReciente = null;
  var idVigenteExtraTorneo = _getIdVigenteExtra('Torneo');
  if (idVigenteExtraTorneo) {
    for (var i = 0; i < listaData.length; i++) {
      if (String(listaData[i][TL.ID - 1] || '') === idVigenteExtraTorneo) {
        idMasReciente = listaData[i][TL.ID - 1];
        fechaMasReciente = listaData[i][TL.FECHA - 1];
        break;
      }
    }
  }
  if (!idMasReciente) {
    for (var i = 0; i < listaData.length; i++) {
      var f = listaData[i][TL.FECHA - 1];
      if (f instanceof Date && (!fechaMasReciente || f > fechaMasReciente)) {
        fechaMasReciente = f;
        idMasReciente = listaData[i][TL.ID - 1];
      }
    }
  }
  if (!idMasReciente) return;

  // 2) Top 3 real de ESE torneo. FASE 23 (30/08/2026, Tag_Tor_2): si el [→ Contexto_Base_Web.md §28B023]
  var top3 = _topNTrasResoluciones(_getParticipantesFusionadosPorTorneo(ss, idMasReciente).participantes, 3);

  // 3) De esos 3, solo quienes cumplen también los requisitos de [→ Contexto_Base_Web.md §28B024]
  var ctxReal = ctxParam || _getCtx();
  var temporadaMostrar = _getTemporadaMostrarExtra(ss, ctxReal);
  var ctx = _clonarCtxParaTemporada(ctxReal, temporadaMostrar);
  var ataquesSemanaPorTag = _getAtaquesYExentosSemanaActualPorTag(ctx, ctxReal.temporada); // 19-sep-2026: { ataques, exentos }
  var trofeosPorTag = _getTrofeosGuerraAcumuladosPorTagParaTemporada(temporadaMostrar, ctxReal);
  var minTPorTag = _getMinTClanMaps().byTag;
  var ataquesMinPorClan = _ataquesMinTorneoPorNombreClan(); // 19-sep-2026: Ataques de T_Lista por clan

  var ganadoresFinal = top3.filter(function(p) {
    var tag = p.tag;
    var clanTag = p.clanTag;
    var trofeos = trofeosPorTag[tag] || 0;
    var minT = minTPorTag[clanTag] !== undefined ? minTPorTag[clanTag] : CFG.MIN_T_DEFAULT;
    return _cumpleAtaquesTorneoClan(ataquesSemanaPorTag[tag], ataquesMinPorClan, p.clan) && trofeos >= minT; // 19-sep-2026
  }).map(function(p) {
    return {
      puesto: p.puesto,
      nombre: p.nombre,
      clan: p.clan,
      victorias: p.victorias,
      // FASE 24 (02-sep-2026): se propaga para que _escribirDocGanadores()
      // pueda aclarar "(premio repartido)" en la línea de ese puesto.
      premioRepartido: !!p.premioRepartido,
      // NUEVO (15-sep-2026, pedido del usuario -- cuentas prestadas): [→ Contexto_Base_Web.md §28B025]
      cuentaPrestada: !!p.cuentaPrestada,
      prestamo: p.prestamo || ''
    };
  });

  // FIX (09/08/2026): se pasa el encabezado REAL del documento [→ Contexto_Base_Web.md §28B026]
  _escribirDocGanadores(NOMBRE_DOC_GANADORES_TORNEO, DOC_ID_GANADORES_TORNEO, ganadoresFinal, idMasReciente, fechaMasReciente, 'Ganadores del torneo:');
}

/**
 * actualizarDocGanadoresSorteo() [→ Contexto_Base_Web.md §28B027]
 */
function actualizarDocGanadoresSorteo() {
  var ss = _getSs();
  var shSL = ss.getSheetByName(CFG.SHEETS.S_LISTA);
  var shSA = ss.getSheetByName(CFG.SHEETS.S_ASISTENCIA);
  // FIX (mismo criterio que actualizarDocGanadoresTorneo()): S_Lista [→ Contexto_Base_Web.md §28B028]
  if (!shSL || shSL.getLastRow() < 3 || !shSA) return;

  // 1) Sorteo puntual: prioriza el ID guardado a mano en [→ Contexto_Base_Web.md §28B029]
  var listaData = shSL.getRange(3, 1, shSL.getLastRow() - 2, SL_TOTAL_COLS).getValues();
  var idMasReciente = null, fechaMasReciente = null;
  var idVigenteExtraSorteo = _getIdVigenteExtra('Sorteo');
  if (idVigenteExtraSorteo) {
    for (var i = 0; i < listaData.length; i++) {
      if (String(listaData[i][SL.ID - 1] || '') === idVigenteExtraSorteo) {
        idMasReciente = listaData[i][SL.ID - 1];
        fechaMasReciente = listaData[i][SL.FECHA - 1];
        break;
      }
    }
  }
  if (!idMasReciente) {
    for (var i = 0; i < listaData.length; i++) {
      var f = listaData[i][SL.FECHA - 1];
      if (f instanceof Date && (!fechaMasReciente || f > fechaMasReciente)) {
        fechaMasReciente = f;
        idMasReciente = listaData[i][SL.ID - 1];
      }
    }
  }
  if (!idMasReciente) return;
  var idMasRecienteStr = String(idMasReciente).trim();

  // 2) Filas de S_Asistencia de ESE sorteo -- ya son el resultado final,
  // no hay nada que filtrar ni recalcular (ver docblock).
  var ganadores = [];
  if (shSA.getLastRow() >= 2) {
    var datosSA = shSA.getRange(2, 1, shSA.getLastRow() - 1, SA_TOTAL_COLS).getValues();
    for (var j = 0; j < datosSA.length; j++) {
      var fila = datosSA[j];
      if (String(fila[SA.ID - 1] || '').trim() !== idMasRecienteStr) continue;
      ganadores.push({
        nombre:  String(fila[SA.NOMBRE - 1] || ''),
        clan:    String(fila[SA.CLAN - 1] || ''),
        premio:  String(fila[SA.PREMIO - 1] || ''),
        tickets: fila[SA.TICKETS - 1]
      });
    }
  }

  _escribirDocGanadoresSorteo(ganadores, idMasRecienteStr, fechaMasReciente);
}

/**
 * _escribirDocGanadoresSorteo(ganadores, idSorteo, fechaSorteo) [→ Contexto_Base_Web.md §28B030]
 */
function _escribirDocGanadoresSorteo(ganadores, idSorteo, fechaSorteo) {
  var archivo;
  try {
    archivo = _buscarArchivoEnPlantillas(NOMBRE_DOC_GANADORES_SORTEO, DOC_ID_GANADORES_SORTEO);
    if (!archivo) {
      Logger.log('[Ganadores-Sorteo] No se encontró "' + NOMBRE_DOC_GANADORES_SORTEO + '" ni en la carpeta de plantillas ni en sus subcarpetas. Se omite.');
      return;
    }
  } catch (e) {
    Logger.log('[Ganadores-Sorteo] Error al buscar el documento: ' + e.message);
    return;
  }

  var doc;
  try {
    doc = DocumentApp.openById(archivo.getId());
  } catch (e) {
    Logger.log('[Ganadores-Sorteo] Error al abrir el documento: ' + e.message);
    return;
  }
  var body = doc.getBody();

  var tabla = _tablaDeGrupoDoc(body, 'Ganadores del sorteo:');
  if (!tabla || tabla.getNumRows() === 0) {
    Logger.log('[Ganadores-Sorteo] No se encontró la tabla de "Ganadores del sorteo:" en el documento. Se omite.');
    doc.saveAndClose();
    return;
  }

  // Conserva la fila de encabezado (fila 0, nombres de columna) y quita [→ Contexto_Base_Web.md §28B031]
  while (tabla.getNumRows() > 1) {
    tabla.removeRow(1);
  }

  if (ganadores.length === 0) {
    var filaVacia = tabla.appendTableRow();
    filaVacia.appendTableCell('(Todavía no se resolvió ningún ganador para este sorteo.)');
    for (var v = 1; v < 5; v++) filaVacia.appendTableCell('');
  } else {
    for (var g = 0; g < ganadores.length; g++) {
      var gan = ganadores[g];
      var fila = tabla.appendTableRow();
      fila.appendTableCell(String(g + 1));
      fila.appendTableCell(gan.nombre);
      // Columna "Victorias" de la plantilla -- muestra Tickets (ver [→ Contexto_Base_Web.md §28B032]
      fila.appendTableCell(gan.tickets === '' || gan.tickets === null || gan.tickets === undefined
        ? '' : String(gan.tickets));
      fila.appendTableCell(gan.clan);
      fila.appendTableCell(gan.premio);
    }
  }

  doc.saveAndClose();
  Logger.log('[Ganadores-Sorteo] Sorteo ' + idSorteo + ': ' + ganadores.length + ' ganador(es) escrito(s).');
}

// _tablaDeGrupoDoc() — antes vivia en el archivo del documento de mazos personalizados, ya eliminado (su unico [→ Contexto_Base_Web.md §28B033]
/**
 * _tablaDeGrupoDoc(body, textoBusqueda) [→ Contexto_Base_Web.md §28B034]
 */
function _tablaDeGrupoDoc(body, textoBusqueda) {
  var encontrado = body.findText(textoBusqueda);
  if (!encontrado) return null;

  var actual = encontrado.getElement();
  while (actual.getParent() && actual.getParent().getType() !== DocumentApp.ElementType.BODY_SECTION) {
    actual = actual.getParent();
  }
  if (!actual.getParent()) return null;

  if (actual.getType() === DocumentApp.ElementType.TABLE) {
    return actual.asTable();
  }

  var idx = body.getChildIndex(actual);
  for (var k = idx + 1; k < body.getNumChildren(); k++) {
    var siguiente = body.getChild(k);
    if (siguiente.getType() === DocumentApp.ElementType.TABLE) return siguiente.asTable();
    if (siguiente.getType() === DocumentApp.ElementType.PARAGRAPH && siguiente.asParagraph().getText().trim() !== '') break;
  }
  return null;
}

// ----- Funciones internas / helpers -----

/**
 * _rdocParrafoRuns(body, runs, alineacion) [→ Contexto_Base_Web.md §28B035]
 */
function _rdocParrafoRuns(body, runs, alineacion) {
  var p = body.appendParagraph('');
  for (var i = 0; i < runs.length; i++) {
    if (runs[i][0] === '') continue;
    var texto = p.appendText(runs[i][0]);
    texto.setBold(!!runs[i][1]);
  }
  if (alineacion) p.setAlignment(alineacion);
  return p;
}

/**
 * _rdocParrafoTexto(body, texto, negrita, alineacion) [→ Contexto_Base_Web.md §28B036]
 */
function _rdocParrafoTexto(body, texto, negrita, alineacion) {
  return _rdocParrafoRuns(body, [[texto, negrita]], alineacion);
}

/**
 * _rdocBloqueClanValor(body, sufijoValor) [→ Contexto_Base_Web.md §28B037]
 */
function _rdocBloqueClanValor(body, sufijoValor) {
  for (var i = 0; i < _CLANES_TERNA_ORDEN_DOC_RECONSTRUCCION.length; i++) {
    var clan = _CLANES_TERNA_ORDEN_DOC_RECONSTRUCCION[i];
    _rdocParrafoRuns(body, [[clan + ': ', true], ['\t' + sufijoValor, false]]);
  }
}

/**
 * _rdocBloqueRequisitosSorteo(body) [→ Contexto_Base_Web.md §28B038]
 */
function _rdocBloqueRequisitosSorteo(body) {
  _rdocParrafoTexto(body, '●      Alcanzar el mínimo de trofeos en guerra durante la semana actual (agosto):', false);
  _rdocBloqueClanValor(body, '2400');
  _rdocParrafoTexto(body, '●      Solo participan miembros del clan que jueguen sus guerras completas (ataques semanales mínimos por clan):', false);
  _rdocBloqueClanValor(body, '16 ataques semanales');
  _rdocParrafoTexto(body, '●      Haber participado, al menos, en la siguiente cantidad de torneos de la temporada (por clan):', false);
  _rdocBloqueClanValor(body, 'al menos 2 torneos');
  _rdocParrafoTexto(body, '●      Jugadores expulsados o sancionados NO participan', false);
  _rdocParrafoTexto(body, '●      Reaccionar a la publicación de este comunicado en redes sociales.', false);
}

/**
 * _rdocBloqueRequisitosTorneo(body) [→ Contexto_Base_Web.md §28B039]
 */
function _rdocBloqueRequisitosTorneo(body) {
  _rdocParrafoTexto(body, 'Alcanzar el mínimo de trofeos en guerra durante la semana actual (agosto):', false);
  _rdocBloqueClanValor(body, '2400');
  _rdocParrafoTexto(body, 'Solo participan miembros del clan que jueguen sus guerras completas (ataques semanales mínimos por clan):', false);
  _rdocBloqueClanValor(body, '16 ataques semanales');
  _rdocParrafoTexto(body, 'Haber participado, al menos, en la siguiente cantidad de torneos de la temporada (por clan):', false);
  _rdocBloqueClanValor(body, 'al menos 2 torneos');
  _rdocParrafoTexto(body, 'Jugadores expulsados o sancionados NO participan', false);
  _rdocParrafoTexto(body, 'Reaccionar a la publicación de este comunicado en redes sociales.', false);
  _rdocParrafoTexto(body, ' Si se detecta trampa → Descalificación inmediata', false);
  _rdocParrafoTexto(body, ' Si no alcanzas el mínimo de medallas, puedes participar en el torneo de forma recreativa pero no aplicas para recibir premios.', false);
  _rdocParrafoTexto(body, 'El respeto es obligatorio antes, durante y después del torneo', false);
}

/**
 * _rdocBloqueRedesSocialesYPie(body) [→ Contexto_Base_Web.md §28B040]
 */
function _rdocBloqueRedesSocialesYPie(body) {
  _rdocParrafoTexto(body, 'Redes sociales oficiales:', true, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoRuns(body, [['    🌐 Web: ', true], ['https://linktr.ee/grupoternaoficial', false]], DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoRuns(body, [['    📱 WhatsApp: ', true], ['https://chat.whatsapp.com/HfaoDijjtkS4mwijpdczkU', false]], DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoRuns(body, [['    🎧 Discord: ', true], ['https://discord.gg/YKXtg93DVb', false]], DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoRuns(body, [['    📘 Facebook: ', true], ['https://www.facebook.com/profile.php?id=61591417920256', false]], DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoRuns(body, [['    ✖️ X (Twitter): ', true], ['https://x.com/GrupoTernaTM', false]], DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoRuns(body, [['    📸 Instagram: ', true], ['https://www.instagram.com/grupoternaoficial', false]], DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoRuns(body, [['    🎵 TikTok: ', true], ['https://www.tiktok.com/@grupoternaoficial', false]], DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoRuns(body, [['    🏆 RoyaleAPI: ', true], ['https://royaleapi.com/clan/family/grupoterna/clans', false]], DocumentApp.HorizontalAlignment.JUSTIFY);
  body.appendParagraph('');
  _rdocParrafoTexto(body, '💜 GRUPO乂TERNA™ 💜', true, DocumentApp.HorizontalAlignment.CENTER);
  _rdocParrafoTexto(body, 'Donde la élite no se dice…', false, DocumentApp.HorizontalAlignment.CENTER);
  _rdocParrafoTexto(body, 'SE DEMUESTRA.', false, DocumentApp.HorizontalAlignment.CENTER);
}

/**
 * _rdocTablaConEncabezadoNegrita(body, filas) [→ Contexto_Base_Web.md §28B041]
 */
function _rdocTablaConEncabezadoNegrita(body, filas) {
  var tabla = body.appendTable(filas);
  var filaEncabezado = tabla.getRow(0);
  for (var c = 0; c < filaEncabezado.getNumCells(); c++) {
    filaEncabezado.getCell(c).editAsText().setBold(true);
  }
  return tabla;
}

/**
 * _construirContenidoDocParticipantesCalificadosSorteo(body) [→ Contexto_Base_Web.md §28B042]
 */
function _construirContenidoDocParticipantesCalificadosSorteo(body) {
  _rdocParrafoTexto(body, 'Lista de participantes calificados', true, DocumentApp.HorizontalAlignment.CENTER);
  _rdocParrafoTexto(body, ' Premios:', true, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, '🏆 3 ganadores', false, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, '1 Pass Royale para cada ganador.', false, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, 'Fecha:', true, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, '\tLunes 06 de Julio 2026 - 8:00pm ', false, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, 'Transmisión:', true, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, 'En vivo a través del servidor de Discord del clan, mediante una ruleta.', false, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, 'Requisitos:', true, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocBloqueRequisitosSorteo(body);
  _rdocParrafoRuns(body, [[' ', false], ['Aviso sobre reclamos', true]], DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoRuns(body, [
    ['Si consideras que deberías figurar en la lista de participantes calificados y no apareces en ella, debes presentar tu reclamo ante la administración, etiquetando a los líderes o colíderes de tu respectivo clan, como ', false],
    ['máximo 15 minutos antes del inicio del sorteo', true],
    ['. La administración revisará el caso y determinará si corresponde realizar alguna modificación. Una vez alcanzado ese límite de tiempo, no se aceptarán nuevos reclamos ni modificaciones relacionadas con la lista de participantes calificados. Por ello, es responsabilidad de cada participante verificar con anticipación que su nombre figure correctamente en la lista.', false]
  ], DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, 'Participantes calificados:', true, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, 'La lista de “Participantes calificados” es la referencia oficial para determinar quiénes están habilitados para participar y optar por los premios. ', false);
  body.appendParagraph('');
  for (var i = 0; i < _CLANES_TERNA_ORDEN_DOC_RECONSTRUCCION.length; i++) {
    _rdocParrafoTexto(body, _CLANES_TERNA_ORDEN_DOC_RECONSTRUCCION[i] + ':', true);
    body.appendParagraph(' ');
    body.appendParagraph(' ');
  }
  _rdocBloqueRedesSocialesYPie(body);
}

/**
 * _construirContenidoDocParticipantesCalificadosTorneo(body) [→ Contexto_Base_Web.md §28B043]
 */
function _construirContenidoDocParticipantesCalificadosTorneo(body) {
  _rdocParrafoTexto(body, 'Lista de participantes calificados para el torneo', true, DocumentApp.HorizontalAlignment.CENTER);
  _rdocParrafoTexto(body, ' Premios:', true, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoRuns(body, [['●', false], ['      ', false], ['🏆 3 ganadores', false]], DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoRuns(body, [['Primer puesto:', true], ['  \tPass Royale.', false]], DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoRuns(body, [['Segundo puesto: \t', true], ['S/.18.', false]], DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoRuns(body, [['Tercer puesto: ', true], [' \tS/.10.', false]], DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoRuns(body, [['●', false], ['      ', false], [' ADICIONAL:      El campeón podrá elegir el modo del próximo torneo', false]], DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, ' ', false, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, 'Fecha:', true, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, '      \tLunes 06 de Julio 2026 - 8:00 pm', false, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, ' ', false, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, 'Requisitos:', true, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocBloqueRequisitosTorneo(body);
  _rdocParrafoRuns(body, [[' ', false], ['Aviso sobre reclamos', true]], DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoRuns(body, [
    ['Si consideras que deberías figurar en la lista de participantes calificados y no apareces en ella, debes presentar tu reclamo ante la administración, etiquetando a los líderes o colíderes de tu respectivo clan, ', false],
    ['hasta 15 minutos antes del inicio del torneo', true],
    ['. Una vez transcurrido ese plazo, se pierde el derecho a presentar reclamos, por lo que es responsabilidad de cada participante verificar con anticipación que su nombre figure correctamente en la lista de participantes calificados.', false]
  ], DocumentApp.HorizontalAlignment.JUSTIFY);
  body.appendParagraph('');
  _rdocParrafoTexto(body, 'Participantes calificados:', true, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, 'La lista de “Participantes calificados” es la referencia oficial para determinar quiénes están habilitados para participar y optar por los premios. ', false);
  body.appendParagraph('');
  for (var i = 0; i < _CLANES_TERNA_ORDEN_DOC_RECONSTRUCCION.length; i++) {
    _rdocParrafoTexto(body, _CLANES_TERNA_ORDEN_DOC_RECONSTRUCCION[i] + ':', true);
    body.appendParagraph(' ');
    body.appendParagraph(' ');
  }
  _rdocBloqueRedesSocialesYPie(body);
}

/**
 * _construirContenidoDocGanadoresSorteo(body) [→ Contexto_Base_Web.md §28B044]
 */
function _construirContenidoDocGanadoresSorteo(body) {
  _rdocParrafoTexto(body, 'Lista de participantes calificados', true, DocumentApp.HorizontalAlignment.CENTER);
  _rdocParrafoTexto(body, ' Premios:', true, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, '🏆 3 ganadores', false, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, '1 Pass Royale para cada ganador.', false, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, 'Fecha:', true, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, '\tLunes 06 de Julio 2026 - 8:00pm ', false, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, 'Transmisión:', true, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, 'En vivo a través del servidor de Discord del clan, mediante una ruleta.', false, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, 'Requisitos:', true, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocBloqueRequisitosSorteo(body);
  for (var b = 0; b < 7; b++) body.appendParagraph('');
  _rdocParrafoRuns(body, [[' ', false], ['Ganadores del sorteo:', true]]);
  body.appendParagraph('');
  _rdocTablaConEncabezadoNegrita(body, [
    ['N°', 'Nombre', 'Victorias', 'Clan', 'Premio'],
    ['1', 'Nombre1', '10', 'Clan1', 'Pass Royale'],
    ['2', 'Nombre2', '9', 'Clan1', 'Pass Royale'],
    ['3', 'Nombre3', '8', 'Clan1', 'Pass Royale']
  ]);
  body.appendParagraph('');
  _rdocBloqueRedesSocialesYPie(body);
}

/**
 * _construirContenidoDocGanadoresTorneo(body) [→ Contexto_Base_Web.md §28B045]
 */
function _construirContenidoDocGanadoresTorneo(body) {
  _rdocParrafoTexto(body, 'Lista de Ganadores del torneo', true, DocumentApp.HorizontalAlignment.CENTER);
  _rdocParrafoTexto(body, ' Premios:', true, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoRuns(body, [['●', false], ['      ', false], ['🏆 3 ganadores', false]], DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoRuns(body, [['Primer puesto:', true], ['  \tPass Royale.', false]], DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoRuns(body, [['Segundo puesto: \t', true], ['S/.18.', false]], DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoRuns(body, [['Tercer puesto: ', true], [' \tS/.10.', false]], DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoRuns(body, [['●', false], ['      ', false], [' ADICIONAL:      El campeón podrá elegir el modo del próximo torneo', false]], DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, ' ', false, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, 'Fecha:', true, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, '      \tLunes 06 de Julio 2026 - 8:00 pm', false, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, ' ', false, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, 'Requisitos:', true, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocBloqueRequisitosTorneo(body);
  body.appendParagraph('');
  _rdocParrafoRuns(body, [[' ', false], ['Participantes del torneo:', true]], DocumentApp.HorizontalAlignment.JUSTIFY);
  body.appendParagraph('');
  _rdocTablaConEncabezadoNegrita(body, [
    ['N°', 'Nombre', 'Victorias', 'Clan', 'Trofeos de guerra', 'Ataques semanales', 'Resultado'],
    ['1', 'Nombre1', '', 'Clan1', '3000', '16', 'Califica'],
    ['2', 'Nombre2', '', '', '', '', 'Califica'],
    ['3', 'Nombre3', '', '', '', '', 'Califica'],
    ['4', 'Nombre2', '', '', '', '', 'Califica'],
    ['5', 'Nombre5', '', '', '', '', 'No califica']
  ]);
  body.appendParagraph('');
  body.appendParagraph('');
  _rdocParrafoTexto(body, 'Ganadores del torneo:', true, DocumentApp.HorizontalAlignment.JUSTIFY);
  body.appendParagraph('');
  _rdocTablaConEncabezadoNegrita(body, [
    ['N°', 'Nombre', 'Victorias', 'Clan', 'Premio'],
    ['1', 'Nombre1', '10', 'Clan1', 'Pass Royale'],
    ['2', 'Nombre2', '9', 'Clan1', 'S/.18'],
    ['3', 'Nombre3', '8', 'Clan1', 'S/.10']
  ]);
  _rdocBloqueRedesSocialesYPie(body);
}

/**
 * actualizarDocParticipantesCalificadosTorneo() [→ Contexto_Base_Web.md §28B046]
 */
/**
 * _getFechaMasRecienteTLista(ss) [→ Contexto_Base_Web.md §28B047]
 */
function _getFechaMasRecienteTLista(ss) {
  var sh = ss.getSheetByName(CFG.SHEETS.T_LISTA);
  // FIX (09-sep-2026): T_Lista tiene header de 2 filas -- "tiene datos" es
  // getLastRow() >= 3, y los datos arrancan en la fila 3, no en la 2.
  if (!sh || sh.getLastRow() < 3) return null;
  var datos = sh.getRange(3, 1, sh.getLastRow() - 2, TL_TOTAL_COLS).getValues();

  var idVigenteExtra = _getIdVigenteExtra('Torneo');
  if (idVigenteExtra) {
    for (var i = 0; i < datos.length; i++) {
      if (String(datos[i][TL.ID - 1] || '') === idVigenteExtra) {
        var fVigente = datos[i][TL.FECHA - 1];
        return (fVigente instanceof Date && !isNaN(fVigente.getTime())) ? fVigente : null;
      }
    }
  }

  var masReciente = null;
  for (var j = 0; j < datos.length; j++) {
    var f = datos[j][TL.FECHA - 1];
    if (f instanceof Date && !isNaN(f.getTime()) && (!masReciente || f > masReciente)) {
      masReciente = f;
    }
  }
  return masReciente;
}

/**
 * _formatFechaHoraDocEs(fecha) [→ Contexto_Base_Web.md §28B048]
 */
function _formatFechaHoraDocEs(fecha) {
  var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
  var horas24 = fecha.getHours();
  var minutos = fecha.getMinutes();
  var ampm = horas24 >= 12 ? 'pm' : 'am';
  var horas12 = horas24 % 12;
  if (horas12 === 0) horas12 = 12;
  var horaTexto = horas12 + ':' + Utilities.formatString('%02d', minutos) + ampm;
  return cap(_DIAS_ES[fecha.getDay()]) + ' ' + Utilities.formatString('%02d', fecha.getDate()) +
         ' de ' + cap(_MESES_ES[fecha.getMonth()]) + ' ' + fecha.getFullYear() + ' - ' + horaTexto;
}

/**
 * _actualizarFechaDocTorneo(body, ss) [→ Contexto_Base_Web.md §28B049]
 */
function _actualizarFechaDocTorneo(body, ss) {
  var fechaMasReciente = _getFechaMasRecienteTLista(ss);
  if (!fechaMasReciente) return false; // T_Lista sin torneos todavía

  var encontrado = body.findText('Fecha:');
  if (!encontrado) return false;
  var elHeading = encontrado.getElement();
  while (elHeading.getParent() && elHeading.getType() !== DocumentApp.ElementType.PARAGRAPH) {
    elHeading = elHeading.getParent();
  }
  var idxHeading = body.getChildIndex(elHeading);
  var idxValor = idxHeading + 1;
  if (idxValor >= body.getNumChildren()) return false;
  var hijoValor = body.getChild(idxValor);
  if (hijoValor.getType() !== DocumentApp.ElementType.PARAGRAPH) return false;
  var pValor = hijoValor.asParagraph();
  var textoActual = pValor.getText();

  var fechaDocx = _parseSpanishDate(textoActual);
  if (fechaDocx instanceof Date && !isNaN(fechaDocx.getTime()) && fechaDocx > fechaMasReciente) {
    // Edición manual más reciente que el último torneo de T_Lista: se
    // respeta tal cual, no se toca.
    return false;
  }

  // Se conserva el prefijo de espacios/tabs original de la plantilla [→ Contexto_Base_Web.md §28B050]
  var prefijoMatch = textoActual.match(/^[\s\t]*/);
  var prefijo = prefijoMatch ? prefijoMatch[0] : '';
  pValor.editAsText().setText(prefijo + _formatFechaHoraDocEs(fechaMasReciente));
  return true;
}

/**
 * _getAtaquesSemanaActualPorTag(ctx, temporadaReal) [→ Contexto_Base_Web.md §28B051]
 */
function _getAtaquesSemanaActualPorTag(ctx, temporadaReal) {
  var mapa = {};
  var guerraData = _getDatosGuerraParaControl(ctx, temporadaReal);
  for (var tag in guerraData) {
    var semData = guerraData[tag] ? guerraData[tag][ctx.sectionIndex] : null;
    if (!semData) continue;
    var total = 0;
    for (var d = 0; d < 4; d++) {
      var dData = semData['dia_' + d];
      if (dData) total += Number(dData.ataques) || 0;
    }
    mapa[tag] = total;
  }
  return mapa;
}

/**
 * _getAtaquesYExentosSemanaActualPorTag(ctx, temporadaReal) [→ Contexto_Base_Web.md §28B052]
 */
function _getAtaquesYExentosSemanaActualPorTag(ctx, temporadaReal) {
  var mapa = {};
  var guerraData = _getDatosGuerraParaControl(ctx, temporadaReal);
  for (var tag in guerraData) {
    var semData = guerraData[tag] ? guerraData[tag][ctx.sectionIndex] : null;
    if (!semData) continue;
    var total = 0, exentos = 0;
    for (var d = 0; d < 4; d++) {
      var dData = semData['dia_' + d];
      if (!dData) continue;
      total += Number(dData.ataques) || 0;
      if (dData.opcional) exentos += 4;
    }
    mapa[tag] = { ataques: total, exentos: exentos };
  }
  return mapa;
}

/**
 * _cumpleAtaquesSemanaActual(info, qty) [→ Contexto_Base_Web.md §28B053]
 */
function _cumpleAtaquesSemanaActual(info, qty) {
  var i = info || {};
  var q = (qty === undefined || qty === null) ? 16 : Number(qty);
  return (Number(i.ataques) || 0) >= q - (Number(i.exentos) || 0);
}

/**
 * _ataquesMinTorneoPorNombreClan() [→ Contexto_Base_Web.md §28B054]
 */
function _ataquesMinTorneoPorNombreClan() {
  var mapa = {};
  _getConfigMasRecienteCategoria('Torneo').forEach(function (b) {
    mapa[b.clan] = (b.ataques && b.ataques.activo) ? (Number(b.ataques.qty) || 0) : 0;
  });
  return mapa;
}

/**
 * _cumpleAtaquesTorneoClan(info, ataquesMinPorClan, nombreClan) [→ Contexto_Base_Web.md §28B055]
 */
function _cumpleAtaquesTorneoClan(info, ataquesMinPorClan, nombreClan) {
  var nombre = String(nombreClan || '').trim();
  var q = (ataquesMinPorClan && ataquesMinPorClan.hasOwnProperty(nombre)) ? ataquesMinPorClan[nombre] : 16;
  if (!(q > 0)) return true;
  return _cumpleAtaquesSemanaActual(info, q);
}

/**
 * _actualizarUnDocParticipantesCalificados(nombreDoc, idDoc) [→ Contexto_Base_Web.md §28B056]
 */
function _actualizarUnDocParticipantesCalificados(nombreDoc, idDoc, ctxParam) {
  var archivo;
  try {
    // FASE (01/08/2026): _buscarArchivoEnPlantillas() busca primero por ID [→ Contexto_Base_Web.md §28B057]
    archivo = _buscarArchivoEnPlantillas(nombreDoc, idDoc);
    if (!archivo) {
      Logger.log('[ParticipantesCalificados] No se encontró "' + nombreDoc + '" ni en la carpeta de plantillas ni en sus subcarpetas. Se omite.');
      return;
    }
  } catch (e) {
    Logger.log('[ParticipantesCalificados] Error al buscar "' + nombreDoc + '": ' + e.message);
    return;
  }

  var doc;
  try {
    doc = DocumentApp.openById(archivo.getId());
  } catch (e) {
    Logger.log('[ParticipantesCalificados] Error al abrir "' + nombreDoc + '": ' + e.message);
    return;
  }
  var body = doc.getBody();

  // 1. Marcador "[Mes]".
  var mesEfectivo = _calcularMesEfectivoRealDeHoy();
  var nombreMes = _MESES_ES[mesEfectivo.mes];
  body.replaceText('\\[Mes\\]', nombreMes);

  // 2. Requisitos leídos del propio documento. El mínimo de trofeos por [→ Contexto_Base_Web.md §28B058]
  var requisitos = _parseRequisitosParticipantes(body);
  if (Object.keys(requisitos.minTrofeosPorClan).length === 0) {
    Logger.log('[ParticipantesCalificados] "' + nombreDoc + '": no se pudo leer el mínimo de trofeos por clan. Se omite la lista, solo se actualizó "[Mes]".');
    doc.saveAndClose();
    return;
  }

  // 3. Cruce de datos.
  var ss = _getSs();
  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!shDir || shDir.getLastRow() < 2) { doc.saveAndClose(); return; }

  // FIX (05-ago-2026) — mismo pedido que en los docs de torneo: la [→ Contexto_Base_Web.md §28B059]
  var ctxReal = ctxParam || _getCtx();
  var temporadaActual = _getTemporadaMostrarExtra(ss, ctxReal);
  var trofeosPorTag = _getTrofeosGuerraAcumuladosPorTagParaTemporada(temporadaActual, ctxReal);
  var torneosPorTag = requisitos.minTorneos ? _contarTorneosPorTagEnTemporada(ss, temporadaActual) : null;

  // NUEVO (19-sep-2026, pedido del usuario): ataques + exonerados de la [→ Contexto_Base_Web.md §28B060]
  var ctxAtaques = _clonarCtxParaTemporada(ctxReal, temporadaActual);
  var ataquesSemanaPorTag = (Object.keys(requisitos.minAtaquesPorClan).length > 0)
    ? _getAtaquesYExentosSemanaActualPorTag(ctxAtaques, ctxReal.temporada)
    : {};

  var dirData = shDir.getRange(2, 1, shDir.getLastRow() - 1, DIR_SHEET_COLS).getValues();

  // Un array de calificados por cada clan (mismo orden que requisitos.ordenClanes).
  var porClan = {};
  for (var ci = 0; ci < requisitos.ordenClanes.length; ci++) porClan[requisitos.ordenClanes[ci]] = [];

  var totalCalificados = 0;
  for (var i = 0; i < dirData.length; i++) {
    var r = dirData[i];
    if (String(r[IC.ESTADO - 1]) !== 'Activo') continue;
    if (CFG.TERNA_TAGS.indexOf(String(r[IC.CLAN_TAG - 1])) < 0) continue;
    // Fase 10 (17/07/2026): se quita el `if (Vetado === 'Si') continue` — [→ Contexto_Base_Web.md §28B061]

    var clan = String(r[IC.CLAN - 1] || '').trim();
    if (!(clan in requisitos.minTrofeosPorClan)) continue; // Si el clan no está en los requisitos, no califica

    var tag = String(r[IC.TAG - 1] || '').trim();
    var trofeos = trofeosPorTag[tag] || 0;
    if (trofeos < requisitos.minTrofeosPorClan[clan]) continue;

    // NUEVO (19-sep-2026, pedido del usuario): ataques semanales mínimos por [→ Contexto_Base_Web.md §28B062]
    if (requisitos.minAtaquesPorClan.hasOwnProperty(clan)) {
      if (!_cumpleAtaquesSemanaActual(ataquesSemanaPorTag[tag], requisitos.minAtaquesPorClan[clan])) continue;
    }

    if (requisitos.minTorneos) {
      var torneos = torneosPorTag[tag] || 0;
      if (torneos < requisitos.minTorneos) continue;
    }

    porClan[clan].push({ nombre: String(r[IC.NOMBRE - 1] || ''), puntaje: trofeos });
    totalCalificados++;
  }

  // Armar los grupos en el mismo orden en que los clanes aparecen en los [→ Contexto_Base_Web.md §28B063]
  var grupos = [];
  for (var gi = 0; gi < requisitos.ordenClanes.length; gi++) {
    grupos.push({ clan: requisitos.ordenClanes[gi], personas: porClan[requisitos.ordenClanes[gi]] });
  }

  _reemplazarListaParticipantes(body, grupos);

  doc.saveAndClose();
  Logger.log('[ParticipantesCalificados] "' + nombreDoc + '": "[Mes]" -> "' + nombreMes + '". ' +
    totalCalificados + ' cuenta(s) calificada(s) (temporada ' + temporadaActual +
    (requisitos.minTorneos ? ', mínimo ' + requisitos.minTorneos + ' torneos).' : ', sin requisito de mínimo de torneos).'));
}

/**
 * _parseRequisitosParticipantes(body) [→ Contexto_Base_Web.md §28B064]
 */
function _parseRequisitosParticipantes(body) {
  var minTrofeosPorClan = {};
  var minAtaquesPorClan = {}; // NUEVO (19-sep-2026)
  var ordenClanes = []; // orden en que cada clan aparece por primera vez en el documento (trofeos)
  var minTorneos = null;
  var numChildren = body.getNumChildren();

  // Lista de nombres de clanes tal como aparecen en el documento
  var clanNames = ['Grupo乂Terna™', 'GrupoXTerna™2', 'GrupoXTerna™3', 'Mini乂Ternas™'];

  for (var i = 0; i < numChildren; i++) {
    var el = body.getChild(i);
    var tipo = el.getType();
   if (tipo !== DocumentApp.ElementType.PARAGRAPH && tipo !== DocumentApp.ElementType.LIST_ITEM) continue;
    var texto = el.editAsText().getText().trim();
    if (!texto) continue;

    // 1. Buscar clan + número en esta línea (coincidencia flexible).
    for (var c = 0; c < clanNames.length; c++) {
      var clanName = clanNames[c];
      var base = clanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*:\\s*(\\d+)';

      // 1a. Línea de ATAQUES semanales por clan (ej. "Clan: \t16 ataques [→ Contexto_Base_Web.md §28B065]
      var regexAtaques = new RegExp(base + '\\s*ataques\\s*semanales', 'i');
      var mAtaques = texto.match(regexAtaques);
      if (mAtaques) {
        minAtaquesPorClan[clanName] = Number(mAtaques[1]);
        break;
      }

      // 1b. Línea de TROFEOS por clan (cualquier otra "Clan: N" -- la de [→ Contexto_Base_Web.md §28B066]
      var regex = new RegExp(base, 'i');
      var match = texto.match(regex);
      if (match) {
        if (!(clanName in minTrofeosPorClan)) ordenClanes.push(clanName);
        minTrofeosPorClan[clanName] = Number(match[1]);
        break;
      }
    }

    // 2. Buscar mínimo de torneos
    var mTorneos = texto.match(/al\s+menos,?\s*(\d+)\s*torneos/i);
    if (mTorneos && minTorneos === null) {
      minTorneos = Number(mTorneos[1]);
    }
  }

  return { minTrofeosPorClan: minTrofeosPorClan, minAtaquesPorClan: minAtaquesPorClan, ordenClanes: ordenClanes, minTorneos: minTorneos };
}

/**
 * _reemplazarListaParticipantes(body, grupos) [→ Contexto_Base_Web.md §28B067]
 */
function _reemplazarListaParticipantes(body, grupos) {
  var encontrado = body.findText('Participantes calificados:');
  if (!encontrado) {
    Logger.log('[ParticipantesCalificados] No se encontró el encabezado "Participantes calificados:" en el documento. Se omite la lista.');
    return;
  }
  var elHeading = encontrado.getElement();
  while (elHeading.getParent() && elHeading.getType() !== DocumentApp.ElementType.PARAGRAPH) {
    elHeading = elHeading.getParent();
  }
  var idxHeading = body.getChildIndex(elHeading);

  // Buscar el límite del bloque: el encabezado "Redes sociales [→ Contexto_Base_Web.md §28B068]
  var numChildrenOriginal = body.getNumChildren();
  var idxFin = numChildrenOriginal; // por defecto, si no se encuentra límite, hasta el final real
  for (var i = idxHeading + 1; i < numChildrenOriginal; i++) {
    var hijo = body.getChild(i);
    if (hijo.getType() !== DocumentApp.ElementType.PARAGRAPH) continue;
    var texto = hijo.asParagraph().getText().trim();
    if (texto === 'Redes sociales oficiales:') {
      idxFin = i;
      break;
    }
  }

  // Resguardo: Google Docs NUNCA permite que el body se quede sin al menos [→ Contexto_Base_Web.md §28B069]
  if (idxFin >= numChildrenOriginal) {
    body.appendParagraph('');
    idxFin = numChildrenOriginal;
  }

  // Borramos, de atrás hacia adelante, los párrafos existentes del bloque [→ Contexto_Base_Web.md §28B070]
  for (var j = idxFin - 1; j > idxHeading; j--) {
    body.removeChild(body.getChild(j));
  }

  // Armar las líneas del bloque: un encabezado de clan ("NombreClan:"), [→ Contexto_Base_Web.md §28B071]
  var insertAt = idxHeading + 1;
  for (var g = 0; g < grupos.length; g++) {
    var grupo = grupos[g];

    // --- Encabezado del clan: negrita, Arial Unicode MS, 12pt, sin
    // viñeta ni sangría (igual que "Grupo乂Terna™:" en la plantilla). ---
    var pHeader = body.insertParagraph(insertAt++, grupo.clan + ':');
    pHeader.setIndentStart(0);
    pHeader.setIndentFirstLine(0);
    pHeader.setBold(true);
    var textoHeader = pHeader.editAsText();
    textoHeader.setFontFamily('Arial Unicode MS');
    textoHeader.setFontSize(12);
    // El texto nuevo podía heredar subrayado y color azul/morado (estilo [→ Contexto_Base_Web.md §28B072]
    textoHeader.setUnderline(false);
    textoHeader.setForegroundColor('#000000');
    textoHeader.setLinkUrl(null);

    // --- Párrafo vacío que separa el encabezado de la lista (idéntico
    // a la línea " " que trae la plantilla debajo de cada encabezado). ---
    insertAt = _insertarParrafoEspaciador(body, insertAt);

    // --- Una línea por persona: "●" + tab fingido (6 espacios en Times [→ Contexto_Base_Web.md §28B073]
    var personas = (grupo.personas || []).slice().sort(function (a, b) {
      return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
    });
    for (var p = 0; p < personas.length; p++) {
      insertAt = _insertarLineaParticipante(body, insertAt, personas[p].nombre, personas[p].puntaje);
    }

    // --- Párrafo vacío que cierra el grupo (idéntico a la línea " "
    // que trae la plantilla después del último bullet de cada grupo). ---
    insertAt = _insertarParrafoEspaciador(body, insertAt);
  }
}

/**
 * _insertarParrafoEspaciador(body, insertAt) [→ Contexto_Base_Web.md §28B074]
 */
function _insertarParrafoEspaciador(body, insertAt) {
  var p = body.insertParagraph(insertAt, ' ');
  p.setIndentStart(0);
  p.setIndentFirstLine(0);
  p.setBold(false);
  var t = p.editAsText();
  t.setFontFamily('Arial');
  t.setFontSize(12);
  t.setUnderline(false);
  t.setForegroundColor('#000000');
  t.setLinkUrl(null);
  return insertAt + 1;
}

/**
 * _insertarLineaParticipante(body, insertAt, nombre, puntaje) [→ Contexto_Base_Web.md §28B075]
 */
function _insertarLineaParticipante(body, insertAt, nombre, puntaje) {
  var BULLET = '\u25CF'; // "●"
  var TAB_FINGIDO = '      '; // 6 espacios — idéntico al de la plantilla
  var textoNombre = nombre + ' (' + puntaje + ')';
  var lineaCompleta = BULLET + TAB_FINGIDO + textoNombre;

  var p = body.insertParagraph(insertAt, '');
  p.setIndentStart(54);       // 1080 twips
  p.setIndentFirstLine(36);   // 1080 - 360 (hanging) twips
  p.setBold(false);

  var t = p.editAsText();
  t.appendText(lineaCompleta);
  var fin = lineaCompleta.length - 1;

  // Formato base para toda la línea: Arial 12pt, negro, sin subrayado ni enlace.
  t.setFontFamily(0, fin, 'Arial');
  t.setFontSize(0, fin, 12);
  t.setBold(0, fin, false);
  t.setUnderline(0, fin, false);
  t.setForegroundColor(0, fin, '#000000');
  t.setLinkUrl(0, fin, null);

  // El "tab" fingido (los 6 espacios) va en Times New Roman 7pt, igual
  // que en la plantilla original.
  var tabInicio = BULLET.length;
  var tabFin = tabInicio + TAB_FINGIDO.length - 1;
  t.setFontFamily(tabInicio, tabFin, 'Times New Roman');
  t.setFontSize(tabInicio, tabFin, 7);

  return insertAt + 1;
}

/**
 * _getTemporadaMostrarExtra(ss, ctxReal) [→ Contexto_Base_Web.md §28B076]
 */
function _getTemporadaMostrarExtra(ss, ctxReal) {
  var temporadaMostrar = ctxReal.temporada;
  var shExtra = ss.getSheetByName(CFG.SHEETS.EXTRA);
  if (shExtra) {
    var mostrarVal = shExtra.getRange(2, 7).getValue(); // G2 = Mostrar
    var temporadaExtra = Number(mostrarVal);
    if (temporadaExtra) temporadaMostrar = temporadaExtra;
  }
  return temporadaMostrar;
}

/**
 * _getTrofeosGuerraAcumuladosPorTagParaTemporada(temporadaObjetivo, ctxReal) [→ Contexto_Base_Web.md §28B077]
 */
function _getTrofeosGuerraAcumuladosPorTagParaTemporada(temporadaObjetivo, ctxReal) {
  var ctx = _clonarCtxParaTemporada(ctxReal, temporadaObjetivo);
  var guerraData = _getDatosGuerraParaControl(ctx, ctxReal.temporada);
  var mapa = {};

  for (var tag in guerraData) {
    var gd = guerraData[tag];
    var acumuladoUltimaSemana = '';

    // De la semana 5 a la 1 (más reciente primero): la primera semana YA [→ Contexto_Base_Web.md §28B078]
    for (var sem = 4; sem >= 0; sem--) {
      var inicioSemanaPeriodIndex = (sem * 7) + 3;
      if (inicioSemanaPeriodIndex > ctx.periodIndex) continue; // semana futura, no arrancó

      var semData = gd ? gd[sem] : null;
      var valoresDia = [];
      for (var d = 0; d < 4; d++) {
        var cellPeriodIndex = (sem * 7) + 3 + d;
        if (cellPeriodIndex > ctx.periodIndex) break; // día futuro dentro de esta semana
        var dData = semData ? semData['dia_' + d] : null;
        valoresDia.push(dData ? dData.fameAcum : '');
      }

      var totalSemana = _maxOVacio(valoresDia, 0, valoresDia.length);
      if (totalSemana !== '') { acumuladoUltimaSemana = totalSemana; break; }
    }

    mapa[tag] = acumuladoUltimaSemana === '' ? 0 : (Number(acumuladoUltimaSemana) || 0);
  }

  return mapa;
}

/**
 * _contarTorneosPorTagEnTemporada(ss, temporada)
 * Mapa { Tag -> cantidad de torneos DISTINTOS en T_Asistencia para esa Temporada }.
 */
function _contarTorneosPorTagEnTemporada(ss, temporada) {
  var sh = ss.getSheetByName(CFG.SHEETS.T_ASISTENCIA);
  var conteo = {};
  if (!sh || sh.getLastRow() < 2) return conteo;

  var datos = sh.getRange(2, 1, sh.getLastRow() - 1, TA_TOTAL_COLS).getValues();
  var idsPorTag = {};
  for (var i = 0; i < datos.length; i++) {
    if ((Number(datos[i][TA.TEMPORADA - 1]) || 0) !== temporada) continue;
    var tag = String(datos[i][TA.TAG - 1] || '').trim();
    var id = String(datos[i][TA.ID - 1] || '').trim();
    if (!tag || !id) continue;
    if (!idsPorTag[tag]) idsPorTag[tag] = {};
    idsPorTag[tag][id] = true;
  }
  for (var t in idsPorTag) conteo[t] = Object.keys(idsPorTag[t]).length;
  return conteo;
}

/**
 * _getTrofeosYAtaquesSemanalesPorTag(semanas, ctxReal) [→ Contexto_Base_Web.md §28B079]
 */
/**
 * _totalesSemanaDesdeAcumulados(semData) [→ Contexto_Base_Web.md §28B080]
 */
function _totalesSemanaDesdeAcumulados(semData) {
  var maxAtq = 0, maxFame = 0, sumAtq = 0, sumPunt = 0, hayAcum = false;
  for (var d = 0; d < 4; d++) {
    var dd = semData ? semData['dia_' + d] : null;
    if (!dd) continue;
    sumAtq  += Number(dd.ataques) || 0;
    sumPunt += Number(dd.puntaje) || 0;
    if (dd.ataquesAcum !== undefined) {
      hayAcum = true;
      if ((Number(dd.ataquesAcum) || 0) > maxAtq) maxAtq = Number(dd.ataquesAcum) || 0;
    }
    if ((Number(dd.fameAcum) || 0) > maxFame) maxFame = Number(dd.fameAcum) || 0;
  }
  return {
    ataques: hayAcum ? Math.min(maxAtq, 16) : sumAtq, // 16 = 4 dias x 4 ataques
    fame:    hayAcum ? maxFame : sumPunt
  };
}

function _getTrofeosYAtaquesSemanalesPorTag(semanas, ctxReal, denominadorFijo, incluirSemanasCompletas) {
  var acumTrofeos = {}, acumAtaques = {}, acumBarcos = {}, acumExentos = {}, cachePorTemporada = {};
  var semanasCompletasPorTag = {}; // solo si incluirSemanasCompletas (Cambio de Rango, Descenso)

  semanas.forEach(function (s) {
    var guerraData = cachePorTemporada[s.temporada];
    if (!guerraData) {
      var ctxToken = _clonarCtxParaTemporada(ctxReal, s.temporada);
      guerraData = _getDatosGuerraParaControl(ctxToken, ctxReal.temporada);
      cachePorTemporada[s.temporada] = guerraData;
    }

    var sIdx = s.semana - 1;
    for (var tag in guerraData) {
      var semData = guerraData[tag] ? guerraData[tag][sIdx] : null;
      if (!semData) continue; // sin datos esa semana puntual: no participa del promedio

      var totalTrofeos = 0, totalAtaques = 0, totalBarcos = 0, totalExentos = 0;
      // FIX (28-sep-2026): ataques y puntaje de la semana desde contadores acumulados.
      var totSem = _totalesSemanaDesdeAcumulados(semData);
      totalTrofeos = totSem.fame;
      totalAtaques = totSem.ataques;
      for (var d = 0; d < 4; d++) {
        var dData = semData['dia_' + d];
        if (!dData) continue;
        // 19-sep-2026: se suman los ataques REALES. Si el día es opcional por [→ Contexto_Base_Web.md §28B081]
        if (dData.opcional) totalExentos += 4;
        // FIX (12-sep-2026, pedido del usuario -- requisito "Barcos"): mismo [→ Contexto_Base_Web.md §28B082]
        totalBarcos += Number(dData.barcos) || 0;
      }

      (acumTrofeos[tag] = acumTrofeos[tag] || []).push(totalTrofeos);
      (acumAtaques[tag] = acumAtaques[tag] || []).push(totalAtaques);
      (acumBarcos[tag] = acumBarcos[tag] || []).push(totalBarcos);
      (acumExentos[tag] = acumExentos[tag] || []).push(totalExentos);

      // NUEVO (28-sep-2026, decision del usuario -- Cambio de Rango, Descenso): [→ Contexto_Base_Web.md §28B083]
      if (incluirSemanasCompletas && semData.dia_0) {
        (semanasCompletasPorTag[tag] = semanasCompletasPorTag[tag] || []).push({
          temporada: s.temporada, semana: s.semana,
          trofeos: totalTrofeos, ataques: totalAtaques, barcos: totalBarcos, exentos: totalExentos,
          // 29-sep-2026 (P1): true si la fila del primer dia de guerra es solo 'Reconstruido'
          // (ver _procesarFilasGuerraParaControl(), 22_ControlCalendario.gs).
          reconstruido: semData.dia_0.soloReconstruido === true
        });
      }
    }
  });

  var resultado = {};
  var tags = {};
  Object.keys(acumTrofeos).forEach(function (t) { tags[t] = true; });
  Object.keys(acumAtaques).forEach(function (t) { tags[t] = true; });
  Object.keys(acumBarcos).forEach(function (t) { tags[t] = true; });

  // FIX (16-sep-2026, pedido del usuario): con `denominadorFijo`, el [→ Contexto_Base_Web.md §28B084]
  var denom = (denominadorFijo !== false) ? semanas.length : null; // 19-sep-2026: fijo por defecto (sumatorias)
  Object.keys(tags).forEach(function (tag) {
    var arrT = acumTrofeos[tag] || [], arrA = acumAtaques[tag] || [], arrB = acumBarcos[tag] || [];
    var suma = function (a, b) { return a + b; };
    var sumaA = arrA.reduce(suma, 0);
    var sumaT = arrT.reduce(suma, 0); // 28-sep-2026: sumatoria de fame, base de _fameCumpleRequisito()
    var sumaB = arrB.reduce(suma, 0); // 29-sep-2026: sumatoria de barcos, base de _barcosCumplenRequisito()
    resultado[tag] = {
      trofeosProm: arrT.length ? (sumaT / (denom || arrT.length)) : 0,
      trofeosSuma: sumaT,
      ataquesProm: arrA.length ? (sumaA / (denom || arrA.length)) : 0,
      barcosProm:  arrB.length ? (sumaB / (denom || arrB.length)) : 0,
      barcosSuma:  sumaB,
      // Sumatoria real + exonerados + semanas evaluadas (enteros): base de
      // _ataquesCumplenRequisito(), sin errores de decimales.
      ataquesSuma:    sumaA,
      ataquesExentos: (acumExentos[tag] || []).reduce(suma, 0),
      semanasEval:    denom || arrA.length
    };
    // Solo con incluirSemanasCompletas: detalle semanal de las semanas donde el [→ Contexto_Base_Web.md §28B085]
    if (incluirSemanasCompletas && semanasCompletasPorTag[tag]) {
      resultado[tag].semanasCompletas = semanasCompletasPorTag[tag];
    }
  });

  return resultado;
}

/**
 * _ataquesCumplenRequisito(p, qty) [→ Contexto_Base_Web.md §28B086]
 */
function _ataquesCumplenRequisito(p, qty) {
  var q = Number(qty) || 0;
  if (p && Number(p.semanasEval) > 0) {
    return (Number(p.ataquesSuma) || 0) + (Number(p.ataquesExentos) || 0) >= q * Number(p.semanasEval);
  }
  return (p ? (Number(p.ataquesProm) || 0) : 0) >= q;
}

/**
 * _fameCumpleRequisito(p, qty) [→ Contexto_Base_Web.md §28B087]
 */
function _fameCumpleRequisito(p, qty) {
  var q = Number(qty) || 0;
  if (p && Number(p.semanasEval) > 0 && p.fameSuma !== undefined && p.fameSuma !== null) {
    return (Number(p.fameSuma) || 0) >= q * Number(p.semanasEval);
  }
  return (p ? (Number(p.fameProm) || 0) : 0) >= q;
}

/**
 * _barcosCumplenRequisito(p, qty) [→ Contexto_Base_Web.md §28B088]
 */
function _barcosCumplenRequisito(p, qty) {
  var q = Number(qty) || 0;
  if (p && p.barcosSuma !== undefined && p.barcosSuma !== null) {
    return (Number(p.barcosSuma) || 0) <= q;
  }
  return (p ? (Number(p.barcosProm) || 0) : 0) <= q;
}

/**
 * _contarTorneosPorTagEnSemanas(ss, semanas) [→ Contexto_Base_Web.md §28B089]
 */
function _contarTorneosPorTagEnSemanas(ss, semanas) {
  var sh = ss.getSheetByName(CFG.SHEETS.T_ASISTENCIA);
  var conteo = {};
  if (!sh || sh.getLastRow() < 2 || semanas.length === 0) return conteo;

  var clavesValidas = {};
  semanas.forEach(function (s) { clavesValidas[s.temporada + '_' + s.semana] = true; });

  var datos = sh.getRange(2, 1, sh.getLastRow() - 1, TA_TOTAL_COLS).getValues();
  var idsPorTag = {};
  for (var i = 0; i < datos.length; i++) {
    var ts = _fechaATemporadaSemana(datos[i][TA.FECHA - 1]);
    if (!ts || !clavesValidas[ts.temporadaPropia + '_' + ts.semana]) continue;

    var tag = String(datos[i][TA.TAG - 1] || '').trim();
    var id  = String(datos[i][TA.ID - 1] || '').trim();
    if (!tag || !id) continue;
    (idsPorTag[tag] = idsPorTag[tag] || {})[id] = true;
  }
  for (var t in idsPorTag) conteo[t] = Object.keys(idsPorTag[t]).length;
  return conteo;
}

/**
 * _escribirDocGanadores(nombreDoc, idDoc, ganadores, idTorneo, fechaTorneo, encabezado) [→ Contexto_Base_Web.md §28B090]
 */
function _escribirDocGanadores(nombreDoc, idDoc, ganadores, idTorneo, fechaTorneo, encabezado) {
  encabezado = encabezado || 'Ganadores:';

  var archivo;
  try {
    // FASE (01/08/2026): _buscarArchivoEnPlantillas() busca primero por ID [→ Contexto_Base_Web.md §28B091]
    archivo = _buscarArchivoEnPlantillas(nombreDoc, idDoc);
    if (!archivo) {
      Logger.log('[Ganadores-Torneo] No se encontró "' + nombreDoc + '" ni en la carpeta de plantillas ni en sus subcarpetas. Se omite.');
      return;
    }
  } catch (e) {
    Logger.log('[Ganadores-Torneo] Error al buscar el documento: ' + e.message);
    return;
  }

  var doc;
  try {
    doc = DocumentApp.openById(archivo.getId());
  } catch (e) {
    Logger.log('[Ganadores-Torneo] Error al abrir el documento: ' + e.message);
    return;
  }
  var body = doc.getBody();

  // FIX (pedido usuario): igual que en _actualizarFechaDocTorneo() — [→ Contexto_Base_Web.md §28B092]
  _actualizarFechaDocTorneo(body, _getSs());

  var encontrado = body.findText(encabezado);
  if (!encontrado) {
    Logger.log('[Ganadores-Torneo] No se encontró el encabezado "' + encabezado + '" en el documento. Se omite la lista.');
    doc.saveAndClose();
    return;
  }
  var elHeading = encontrado.getElement();
  while (elHeading.getParent() && elHeading.getType() !== DocumentApp.ElementType.PARAGRAPH) {
    elHeading = elHeading.getParent();
  }
  var idxHeading = body.getChildIndex(elHeading);

  // FIX (03/08/2026): igual que en _reemplazarListaParticipantes(), ya NO [→ Contexto_Base_Web.md §28B093]
  var numChildrenOriginal = body.getNumChildren();
  var idxFin = numChildrenOriginal;
  for (var i = idxHeading + 1; i < numChildrenOriginal; i++) {
    var hijo = body.getChild(i);
    if (hijo.getType() !== DocumentApp.ElementType.PARAGRAPH) continue;
    var texto = hijo.asParagraph().getText().trim();
    if (texto === 'Redes sociales oficiales:') {
      idxFin = i;
      break;
    }
  }

  if (idxFin >= numChildrenOriginal) {
    body.appendParagraph('');
    idxFin = numChildrenOriginal;
  }

  for (var j = idxFin - 1; j > idxHeading; j--) {
    body.removeChild(body.getChild(j));
  }

  var lineas = [];
  if (ganadores.length === 0) {
    lineas.push('(Sin ganadores que cumplan los requisitos en este torneo.)');
  } else {
    for (var g = 0; g < ganadores.length; g++) {
      var gan = ganadores[g];
      // FASE 24 (02-sep-2026, pedido del usuario — descalificaciones y [→ Contexto_Base_Web.md §28B094]
      var etiquetaReparto = gan.premioRepartido ? ' (premio repartido)' : '';
      // NUEVO (15-sep-2026, pedido del usuario -- cuentas prestadas): [→ Contexto_Base_Web.md §28B095]
      var etiquetaPrestamo = gan.cuentaPrestada
        ? (gan.prestamo ? ' (cuenta prestada — premio para ' + gan.prestamo + ')' : ' (cuenta prestada)')
        : '';
      lineas.push(gan.puesto + '. ' + gan.nombre + ' — ' + gan.clan + ' (' + gan.victorias + ' victorias)' + etiquetaReparto + etiquetaPrestamo);
    }
  }

  for (var k = 0; k < lineas.length; k++) {
    body.insertParagraph(idxHeading + 1 + k, lineas[k]);
  }

  doc.saveAndClose();
  Logger.log('[Ganadores-Torneo] Torneo ' + idTorneo + ': ' + ganadores.length + ' ganador(es) escrito(s).');
}