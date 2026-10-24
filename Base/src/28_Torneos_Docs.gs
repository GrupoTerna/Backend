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
  // 17-oct-2026 (PF091): los datos de Guerra se leen UNA vez y se pasan a los dos helpers (antes cada uno los leía por su cuenta, ~20 s c/u); [→ Contexto_Base_Web.md §PF091]
  var guerraDataUnica = _getDatosGuerraParaControl(ctx, ctxReal.temporada);

  // Ataques: FIX (05-ago-2026) — antes exigía 16 ataques en la semana REAL [→ Contexto_Base_Web.md §28B014]
  var ataquesSemanaPorTag = _getAtaquesYExentosSemanaActualPorTag(ctx, ctxReal.temporada, guerraDataUnica); // 19-sep-2026: { ataques, exentos }
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

  var trofeosPorTag = _getTrofeosGuerraAcumuladosPorTagParaTemporada(temporadaMostrar, ctxReal, guerraDataUnica);
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
  // 17-oct-2026 (PF091): los datos de Guerra se leen UNA vez y se pasan a los dos helpers (antes cada uno los leía por su cuenta, ~20 s c/u); [→ Contexto_Base_Web.md §PF091]
  var guerraDataUnica = _getDatosGuerraParaControl(ctx, ctxReal.temporada);
  var ataquesSemanaPorTag = _getAtaquesYExentosSemanaActualPorTag(ctx, ctxReal.temporada, guerraDataUnica); // 19-sep-2026: { ataques, exentos }
  var trofeosPorTag = _getTrofeosGuerraAcumuladosPorTagParaTemporada(temporadaMostrar, ctxReal, guerraDataUnica);
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
 * actualizarDocGanadoresSorteo(extra) [→ Contexto_Base_Web.md §28B027]
 * PF221 (24-oct-2026, pedido de la usuaria): `extra` es opcional y lo manda sorteo.html al exportar el acta: {premios, participantes, ganadores:[{nombre, hora}]}.
 * Se guarda en ACTA_SORTEO_EXTRA (propiedades del script, con el ID del sorteo) para que la corrida diaria, que llama sin `extra`, no borre
 * la hora ni el resumen. Devuelve el ID del documento (o '' si no se escribió) para que el endpoint pueda entregarlo como Word.
 */
var PROP_ACTA_SORTEO_EXTRA = 'ACTA_SORTEO_EXTRA';

function actualizarDocGanadoresSorteo(extra) {
  var ss = _getSs();
  var shSL = ss.getSheetByName(CFG.SHEETS.S_LISTA);
  var shSA = ss.getSheetByName(CFG.SHEETS.S_ASISTENCIA);
  // FIX (mismo criterio que actualizarDocGanadoresTorneo()): S_Lista [→ Contexto_Base_Web.md §28B028]
  if (!shSL || shSL.getLastRow() < 3 || !shSA) return '';

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
  if (!idMasReciente) return '';
  var idMasRecienteStr = String(idMasReciente).trim();

  // PF221: datos del acta que solo conoce sorteo.html (hora de cada ganador, premios, participantes). Con `extra` se guardan; sin `extra` se leen
  // los últimos guardados, pero solo si son de este mismo sorteo.
  var extraActa = null;
  try {
    var props = PropertiesService.getScriptProperties();
    if (extra && typeof extra === 'object') {
      extraActa = {
        id: idMasRecienteStr,
        premios: Number(extra.premios) > 0 ? Math.floor(Number(extra.premios)) : 0,
        participantes: Number(extra.participantes) >= 0 ? Math.floor(Number(extra.participantes)) : -1,
        ganadores: (Array.isArray(extra.ganadores) ? extra.ganadores : []).slice(0, 100).map(function (g) {
          // PF228: además de nombre y hora, la página manda premio, tickets y clan para poder escribir en el documento a quien aún no se guardó en S_Asistencia.
          var tk = Number(g && g.tickets);
          return {
            nombre: String((g && g.nombre) || '').slice(0, 80),
            hora: _normalizarHoraActa_(String((g && g.hora) || '').slice(0, 20)), // PF232: dos cifras siempre (antes slice(0, 10) cortaba el punto final y cortaría los segundos)
            premio: String((g && g.premio) || '').slice(0, 80),
            clan: String((g && g.clan) || '').slice(0, 60),
            tickets: (g && g.tickets !== null && g.tickets !== undefined && g.tickets !== '' && !isNaN(tk)) ? tk : ''
          };
        })
      };
      props.setProperty(PROP_ACTA_SORTEO_EXTRA, JSON.stringify(extraActa));
    } else {
      var guardado = props.getProperty(PROP_ACTA_SORTEO_EXTRA);
      if (guardado) {
        var obj = JSON.parse(guardado);
        if (obj && String(obj.id) === idMasRecienteStr) extraActa = obj;
      }
    }
  } catch (eExtra) {
    Logger.log('[Ganadores-Sorteo] No se pudo leer/guardar los datos del acta: ' + eExtra.message);
  }

  // 2) Filas de S_Asistencia de ESE sorteo -- ya son el resultado final,
  // no hay nada que filtrar ni recalcular (ver docblock).
  var ganadores = [];
  if (shSA.getLastRow() >= 2) {
    var datosSA = shSA.getRange(2, 1, shSA.getLastRow() - 1, SA_TOTAL_COLS).getValues();
    for (var j = 0; j < datosSA.length; j++) {
      var fila = datosSA[j];
      if (String(fila[SA.ID - 1] || '').trim() !== idMasRecienteStr) continue;
      // PF222: S_Asistencia ahora lista a todos los participantes; el documento solo muestra a los ganadores (Ganó = Sí; vacío = fila anterior, de ganador).
      var ganoTxt = String(fila[SA.GANO - 1] || '').trim();
      if (ganoTxt !== '' && ganoTxt !== SA_GANO_SI) continue;
      ganadores.push({
        nombre:  String(fila[SA.NOMBRE - 1] || ''),
        clan:    String(fila[SA.CLAN - 1] || ''),
        premio:  String(fila[SA.PREMIO - 1] || ''),
        tickets: fila[SA.TICKETS - 1],
        hora:    ''
      });
    }
  }

  // PF221: la hora sale del acta de sorteo.html; se une por nombre (sin tildes ni mayúsculas) y, si el nombre se editó a mano, por posición
  // cuando hay la misma cantidad de ganadores en ambos lados.
  var resumenActa = null;
  if (extraActa) {
    ganadores = _fusionarGanadoresActaSorteo_(ganadores, extraActa.ganadores);
    resumenActa = { premios: extraActa.premios, participantes: extraActa.participantes, ganadores: ganadores.length };
  }

  return _escribirDocGanadoresSorteo(ganadores, idMasRecienteStr, fechaMasReciente, resumenActa);
}

/**
 * PF228 (24-oct-2026, pedido de la usuaria): el documento de Drive es el que se descarga, así que debe traer a TODOS los ganadores de la ruleta,
 * también a quien todavía no se guardó en S_Asistencia. Une, en el orden de la ruleta, los ganadores que manda sorteo.html (`deLaPagina`: nombre, hora,
 * premio, tickets, clan) con los ya guardados en S_Asistencia (`guardados`): por nombre (sin tildes ni mayúsculas) y, si el nombre se editó a mano, por
 * posición cuando hay la misma cantidad en ambos lados. Los datos guardados mandan sobre los de la página; la hora sale siempre de la página. Quien está
 * guardado y la página ya no lista se agrega al final. Sin ganadores de la página devuelve `guardados` tal cual.
 */
function _fusionarGanadoresActaSorteo_(guardados, deLaPagina) {
  guardados = guardados || [];
  deLaPagina = deLaPagina || [];
  if (deLaPagina.length === 0) return guardados;
  var norm = function (t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim(); };
  var mismaCantidad = deLaPagina.length === guardados.length;
  var usados = {};
  var vacio = function (v) { return v === '' || v === null || v === undefined; };
  var fusion = deLaPagina.map(function (eg, q) {
    var idx = -1;
    for (var j = 0; j < guardados.length; j++) {
      if (!usados[j] && norm(guardados[j].nombre) === norm(eg.nombre)) { idx = j; break; }
    }
    if (idx < 0 && mismaCantidad && !usados[q]) idx = q;
    if (idx >= 0) {
      usados[idx] = true;
      var s = guardados[idx];
      return {
        nombre: s.nombre || eg.nombre,
        clan: s.clan || eg.clan || '',
        premio: s.premio || eg.premio || '',
        tickets: vacio(s.tickets) ? (vacio(eg.tickets) ? '' : eg.tickets) : s.tickets,
        hora: eg.hora || ''
      };
    }
    return { nombre: eg.nombre, clan: eg.clan || '', premio: eg.premio || '', tickets: vacio(eg.tickets) ? '' : eg.tickets, hora: eg.hora || '' };
  }).filter(function (g) { return String(g.nombre || '').trim() !== ''; });
  guardados.forEach(function (s, j) { if (!usados[j]) fusion.push(s); });
  return fusion;
}

/**
 * PF207 (24-oct-2026, pedido de la usuaria). _escribirGanadoresSorteoEnDoc_(body, ganadores): bajo «Ganadores del sorteo:»,
 * (a) sin ganadores quita la tabla (y cualquier otra tabla que siga) y deja una línea corta (TEXTO_SIN_GANADORES_SORTEO_DOC);
 * (b) con ganadores quita esa línea y, si la tabla no existe (porque antes no había ganadores), la crea con el mismo estilo de la plantilla
 * (encabezado gris, texto blanco en negrita: N°, Nombre, Victorias, Clan, Premio); si existe, deja el encabezado y rehace las filas.
 * La columna «Victorias» muestra los Tickets (igual que antes). Devuelve false si no existe el encabezado.
 */
var TEXTO_SIN_GANADORES_SORTEO_DOC = 'Todavía no hay ganadores para este sorteo.';

var PREFIJO_RESUMEN_SORTEO_DOC = 'Resumen del sorteo:';

// PF229 (24-oct-2026, pedido de la usuaria con captura del acta): el documento de ganadores llevaba el título de la plantilla de participantes.
var TITULO_DOC_GANADORES_SORTEO = 'Lista de ganadores del sorteo';
var TITULO_ANTIGUO_DOC_GANADORES_SORTEO = 'Lista de participantes calificados';

/**
 * PF231 (24-oct-2026, pedido de la usuaria con captura): «Ganadores del sorteo:» debe quedar al inicio de una hoja. En vez de depender de los
 * párrafos vacíos de la plantilla (su efecto cambia con el largo de los requisitos y podían dejar el encabezado al final de la página anterior),
 * se quitan los vacíos que lo preceden y se pone un salto de página al comienzo del propio párrafo del encabezado (así Word no deja una línea
 * en blanco arriba de la página nueva). Es idempotente: si el salto ya existe, no se agrega otro.
 */
function _ganadoresAlInicioDePaginaDoc_(body, heading) {
  try {
    var par = heading.asParagraph();
    var tieneSalto = false;
    for (var q = 0; q < par.getNumChildren(); q++) {
      if (par.getChild(q).getType() === DocumentApp.ElementType.PAGE_BREAK) { tieneSalto = true; break; }
    }
    var idx = body.getChildIndex(heading);
    var quitados = 0;
    while (idx - 1 >= 0 && quitados < 40) {
      var ant = body.getChild(idx - 1);
      if (ant.getType() !== DocumentApp.ElementType.PARAGRAPH) break;
      var pa = ant.asParagraph();
      if (pa.getText().trim() !== '') break;
      var conExtra = false;
      for (var k = 0; k < pa.getNumChildren(); k++) {
        if (pa.getChild(k).getType() !== DocumentApp.ElementType.TEXT) { conExtra = true; break; }
      }
      if (conExtra) break; // un salto de página o una imagen no se tocan
      body.removeChild(pa);
      idx--;
      quitados++;
    }
    if (!tieneSalto) par.insertPageBreak(0);
  } catch (eSalto) {
    Logger.log('[Ganadores-Sorteo] No se pudo dejar «Ganadores del sorteo:» al inicio de la página: ' + eSalto.message);
  }
}

/**
 * PF232 (24-oct-2026, pedido de la usuaria): la hora del acta siempre lleva dos cifras en hora, minutos y segundos («05:42 p. m», «09:07:05 a. m»).
 * sorteo.html ya la manda así, pero aquí se normaliza otra vez por si llega de otra forma («5:42 p. m.», «5:7 pm»). El sufijo queda «a. m» o «p. m»
 * (sin punto final). Si el texto no parece una hora, se devuelve recortado y sin cambios. Un texto con hora de 24 h (sin am/pm) solo se rellena con ceros.
 */
function _normalizarHoraActa_(texto) {
  var t = String(texto === null || texto === undefined ? '' : texto).replace(/[\u00A0\u202F]/g, ' ').trim();
  var m = t.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s*(?:([ap])\.?\s*m\.?)?$/i);
  if (!m) return t;
  var dos = function (n) { n = String(parseInt(n, 10)); return n.length < 2 ? '0' + n : n; };
  var salida = dos(m[1]) + ':' + dos(m[2]) + (m[3] !== undefined ? ':' + dos(m[3]) : '');
  if (m[4]) salida += ' ' + (m[4].toLowerCase() === 'a' ? 'a. m' : 'p. m');
  return salida;
}

/**
 * PF221: línea de resumen bajo «Ganadores del sorteo:» (cantidad de premios y si está completo, ganadores registrados, participantes en la lista).
 * `resumen` null = sin datos del acta: no hay línea. Quita siempre la línea anterior y escribe la nueva justo debajo del encabezado.
 */
function _lineasResumenSorteoDoc_(resumen) {
  if (!resumen) return [];
  var lineas = [];
  if (resumen.premios > 0) {
    lineas.push('Premios del sorteo: ' + resumen.premios);
    lineas.push('Ganadores registrados: ' + resumen.ganadores + (resumen.ganadores < resumen.premios ? ' (faltan ' + (resumen.premios - resumen.ganadores) + ')' : ' (completo)'));
  } else {
    lineas.push('Ganadores registrados: ' + resumen.ganadores + ' (cantidad de premios sin límite definido)');
  }
  if (resumen.participantes >= 0) lineas.push('Participantes totales en la lista: ' + resumen.participantes);
  return lineas;
}

// PF230 (24-oct-2026): el resumen ahora es un título («Resumen del sorteo:») con tres viñetas. Estos prefijos sirven para quitar el resumen anterior
// (la línea única de PF221 o las viñetas de PF230) antes de escribir el nuevo.
var PREFIJOS_LINEAS_RESUMEN_SORTEO_DOC = ['Premios del sorteo:', 'Ganadores registrados:', 'Participantes totales en la lista:'];

/**
 * PF230: deja el texto de un párrafo o de un elemento de lista en Arial 12, negro y sin cursiva (negrita según `negrita`). Se aplica también al
 * elemento completo (setAttributes) para que la marca de párrafo y las viñetas no queden con otra fuente.
 */
function _estiloArialDoc_(elem, negrita, colorHex) {
  var color = colorHex || '#000000';
  var estilo = {};
  estilo[DocumentApp.Attribute.FONT_FAMILY] = 'Arial';
  estilo[DocumentApp.Attribute.FONT_SIZE] = 12;
  estilo[DocumentApp.Attribute.BOLD] = !!negrita;
  estilo[DocumentApp.Attribute.ITALIC] = false;
  estilo[DocumentApp.Attribute.FOREGROUND_COLOR] = color;
  try { elem.setAttributes(estilo); } catch (e1) { /* se sigue con el formato del texto */ }
  var t = elem.editAsText();
  var largo = t.getText().length;
  if (largo > 0) {
    t.setFontFamily(0, largo - 1, 'Arial');
    t.setFontSize(0, largo - 1, 12);
    t.setBold(0, largo - 1, !!negrita);
    t.setItalic(0, largo - 1, false);
    t.setForegroundColor(0, largo - 1, color);
  }
}

/**
 * PF232: ancho estimado, en puntos, de un texto en Arial 12 (negrita en el encabezado). Valores medios por tipo de carácter; los CJK (乂), las marcas
 * (™) y los emojis ocupan bastante más que una letra, y por eso el cálculo anterior (7 pt por carácter) dejaba «Grupo乂Terna™» partido en dos líneas.
 * Es una estimación: Apps Script no puede medir el texto real.
 */
function _anchoTextoArialDoc_(texto, negrita) {
  var total = 0;
  var cs = Array.from(String(texto || ''));
  for (var i = 0; i < cs.length; i++) {
    var cp = cs[i].codePointAt(0);
    var w;
    if (cp === 32) w = 3.5;
    else if (cp >= 0x2E80 || cp >= 0x1F000) w = 13;       // CJK, emojis y símbolos anchos
    else if (cp === 0x2122 || cp === 0x00A9 || cp === 0x00AE) w = 12; // ™ © ®
    else if (cp > 127) w = 8;                              // otras letras o símbolos fuera de ASCII (°, £, Δ, ᴳ...)
    else if (cp >= 65 && cp <= 90) w = 8.2;                // mayúsculas
    else if (cp >= 48 && cp <= 57) w = 6.7;                // dígitos
    else if (cp === 109 || cp === 119) w = 9.5;            // m, w
    else if (cp === 105 || cp === 108 || cp === 106 || cp === 116 || cp === 102 || cp === 46 || cp === 58) w = 3.6; // i l j t f . :
    else w = 6.8;                                          // resto de minúsculas y signos
    total += w;
  }
  return negrita ? total * 1.1 : total;
}

/**
 * PF230: formato de la tabla de ganadores. Todo el texto en Arial 12 (el encabezado en negrita blanca sobre gris), valores centrados en horizontal
 * y en vertical, sin espacio extra entre líneas y anchos de columna ajustados al contenido (estimados por la cantidad de caracteres de cada columna
 * y repartidos para que la tabla ocupe el ancho útil de la página; si el contenido no cabe, se reducen en proporción).
 */
function _formatearTablaGanadoresSorteoDoc_(tabla, body) {
  var nFilas = tabla.getNumRows();
  if (nFilas < 1) return;
  var nCols = tabla.getRow(0).getNumCells();
  var necesario = [];
  for (var c = 0; c < nCols; c++) necesario.push(30);

  for (var r = 0; r < nFilas; r++) {
    var fila = tabla.getRow(r);
    for (var cc = 0; cc < fila.getNumCells(); cc++) {
      var celda = fila.getCell(cc);
      try { celda.setVerticalAlignment(DocumentApp.VerticalAlignment.CENTER); } catch (eV) { /* sin alineación vertical */ }
      try { celda.setPaddingTop(4); celda.setPaddingBottom(4); } catch (eP) { /* se deja el relleno de la plantilla */ }
      for (var k = 0; k < celda.getNumChildren(); k++) {
        var hijo = celda.getChild(k);
        if (hijo.getType() !== DocumentApp.ElementType.PARAGRAPH) continue;
        var par = hijo.asParagraph();
        par.setHeading(DocumentApp.ParagraphHeading.NORMAL);
        par.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        try { par.setSpacingBefore(0); par.setSpacingAfter(0); par.setLineSpacing(1); } catch (eS) { /* sin ajuste de interlineado */ }
        _estiloArialDoc_(par, r === 0, r === 0 ? '#FFFFFF' : '#000000');
      }
      if (cc < nCols) {
        var estimado = _anchoTextoArialDoc_(String(celda.getText() || ''), r === 0) + 12; // + relleno lateral de la celda (5 pt a cada lado) y 2 pt de margen para que no se parta
        if (estimado > necesario[cc]) necesario[cc] = estimado;
      }
    }
  }

  var ancho = 468;
  try {
    var pw = body.getPageWidth(), ml = body.getMarginLeft(), mr = body.getMarginRight();
    if (pw > 0) ancho = pw - ml - mr;
  } catch (eW) { /* se usa el ancho por defecto (carta con márgenes de 1") */ }
  var suma = 0;
  necesario.forEach(function (n) { suma += n; });
  if (suma <= 0) return;
  var anchos = [];
  var j;
  if (suma <= ancho) {
    // Cabe todo: se reparte el ancho útil en proporción al contenido.
    for (j = 0; j < nCols; j++) anchos.push(necesario[j] * ancho / suma);
  } else {
    // No cabe: las columnas cortas (N.°, Victorias, Clan, Premio, Hora) conservan lo que necesitan para no partirse y «Nombre» (columna 2), que es la
    // única de largo variable, toma el resto y es la que se parte en líneas. Si aun así no alcanza, se reducen todas en proporción.
    var iNombre = nCols > 1 ? 1 : 0;
    var otras = suma - necesario[iNombre];
    var minNombre = 70;
    if (otras + minNombre <= ancho) {
      for (j = 0; j < nCols; j++) anchos.push(j === iNombre ? ancho - otras : necesario[j]);
    } else {
      for (j = 0; j < nCols; j++) anchos.push(necesario[j] * ancho / suma);
    }
  }
  for (j = 0; j < nCols; j++) {
    try { tabla.setColumnWidth(j, Math.max(24, Math.floor(anchos[j]))); } catch (eC) { /* sin ajuste de ancho */ }
  }
}

function _escribirGanadoresSorteoEnDoc_(body, ganadores, resumen) {
  var enc = body.findText('Ganadores del sorteo:');
  if (!enc) return false;
  // PF229: los documentos ya creados conservan el título de la plantilla de participantes; se corrige aquí (replaceText respeta el formato).
  try { body.replaceText(TITULO_ANTIGUO_DOC_GANADORES_SORTEO, TITULO_DOC_GANADORES_SORTEO); } catch (eT) { /* no es crítico */ }
  var heading = enc.getElement();
  while (heading.getParent() && heading.getParent().getType() !== DocumentApp.ElementType.BODY_SECTION) {
    heading = heading.getParent();
  }
  // PF229: «Ganadores del sorteo:» no puede quedar solo al final de una página; se mantiene junto con el resumen y la tabla.
  try { heading.asParagraph().setKeepWithNext(true); } catch (eK) { /* si el elemento no es párrafo o la API no lo admite, se sigue sin esto */ }
  _ganadoresAlInicioDePaginaDoc_(body, heading); // PF231: antes de calcular idxH, porque quita párrafos previos
  var idxH = body.getChildIndex(heading);

  // Qué hay después del encabezado: tablas y la línea de «sin ganadores».
  var tabla = null, parrafoSin = null, aQuitar = [];
  for (var k = idxH + 1; k < body.getNumChildren(); k++) {
    var h = body.getChild(k);
    if (h.getType() === DocumentApp.ElementType.TABLE) {
      if (!tabla) tabla = h.asTable(); else aQuitar.push(h);
    } else if (h.getType() === DocumentApp.ElementType.PARAGRAPH) {
      var tx = h.asParagraph().getText().trim();
      if (tx === TEXTO_SIN_GANADORES_SORTEO_DOC) { if (!parrafoSin) parrafoSin = h.asParagraph(); else aQuitar.push(h); }
      else if (tx.indexOf(PREFIJO_RESUMEN_SORTEO_DOC) === 0) aQuitar.push(h); // PF221: se vuelve a escribir al final
      else if (tx !== '') break;
    } else if (h.getType() === DocumentApp.ElementType.LIST_ITEM) {
      // PF230: las viñetas del resumen anterior también se quitan; cualquier otra lista marca el fin de la zona de ganadores.
      var txl = h.asListItem().getText().trim();
      var esResumen = PREFIJOS_LINEAS_RESUMEN_SORTEO_DOC.some(function (pf) { return txl.indexOf(pf) === 0; });
      if (esResumen) aQuitar.push(h); else break;
    }
  }
  aQuitar.forEach(function (h) { try { body.removeChild(h); } catch (e) { /* el último hijo no se puede quitar; no pasa nada */ } });

  // PF221: se escribe justo debajo del encabezado, al terminar (antes de cada return true).
  var escribirResumen = function () {
    var lineas = _lineasResumenSorteoDoc_(resumen);
    if (!lineas.length) return;
    var pos = body.getChildIndex(heading) + 1;
    var titulo = body.insertParagraph(pos, PREFIJO_RESUMEN_SORTEO_DOC);
    titulo.setHeading(DocumentApp.ParagraphHeading.NORMAL);
    titulo.setIndentStart(36);
    titulo.setIndentFirstLine(36);
    _estiloArialDoc_(titulo, true);
    try { titulo.setKeepWithNext(true); } catch (eK2) { /* PF229: el resumen se mantiene junto con la tabla */ }
    var primero = null;
    lineas.forEach(function (ln, n) {
      var item = body.insertListItem(pos + 1 + n, ln);
      item.setHeading(DocumentApp.ParagraphHeading.NORMAL);
      item.setGlyphType(DocumentApp.GlyphType.BULLET);
      item.setNestingLevel(0);
      item.setIndentFirstLine(72);
      item.setIndentStart(90);
      if (primero) { try { item.setListId(primero); } catch (eL) { /* cada viñeta queda en su propia lista; se ven igual */ } } else { primero = item; }
      _estiloArialDoc_(item, false);
      try { item.setKeepWithNext(true); } catch (eK3) { /* PF229 */ }
    });
  };

  var recortarFilas = function (t) { while (t.getNumRows() > 1) t.removeRow(1); };

  if (ganadores.length === 0) {
    // Primero se inserta la línea y luego se quita la tabla (si la tabla fuera el último hijo, el documento no puede quedar sin párrafo final).
    if (!parrafoSin) {
      parrafoSin = body.insertParagraph(body.getChildIndex(heading) + 1, TEXTO_SIN_GANADORES_SORTEO_DOC);
      parrafoSin.setHeading(DocumentApp.ParagraphHeading.NORMAL);
      parrafoSin.setIndentStart(36);
      parrafoSin.setIndentFirstLine(36);
      var tt = parrafoSin.editAsText();
      var fin = TEXTO_SIN_GANADORES_SORTEO_DOC.length - 1;
      tt.setBold(0, fin, false);
      tt.setItalic(0, fin, false);
      tt.setFontFamily(0, fin, 'Arial');
      tt.setFontSize(0, fin, 12);
      tt.setForegroundColor(0, fin, '#000000');
    }
    if (tabla) {
      try { body.removeChild(tabla); } catch (eQ) { recortarFilas(tabla); tabla.getRow(0).clear(); }
    }
    // PF209 (24-oct-2026, pedido de la usuaria): al quitar la tabla quedaban párrafos vacíos de la plantilla entre la línea y el
    // siguiente subtítulo («Redes sociales oficiales:»), que se veían como un hueco. Se quitan los vacíos que siguen (sin tocar saltos de página ni imágenes).
    var iSin = body.getChildIndex(parrafoSin);
    while (iSin + 1 < body.getNumChildren()) {
      var sig = body.getChild(iSin + 1);
      if (sig.getType() !== DocumentApp.ElementType.PARAGRAPH) break;
      var psig = sig.asParagraph();
      if (psig.getText().trim() !== '') break;
      var tieneExtra = false;
      for (var q = 0; q < psig.getNumChildren(); q++) {
        if (psig.getChild(q).getType() !== DocumentApp.ElementType.TEXT) { tieneExtra = true; break; }
      }
      if (tieneExtra) break;
      if (iSin + 2 >= body.getNumChildren()) break; // el último párrafo del documento no se puede quitar
      try { body.removeChild(psig); } catch (eV) { break; }
    }
    escribirResumen();
    return true;
  }

  if (parrafoSin) { try { body.removeChild(parrafoSin); } catch (eP) { parrafoSin.setText(''); } }

  var filas = ganadores.map(function (gan, g) {
    return [
      String(g + 1),
      String(gan.nombre || ''),
      (gan.tickets === '' || gan.tickets === null || gan.tickets === undefined) ? '' : String(gan.tickets),
      String(gan.clan || ''),
      String(gan.premio || ''),
      gan.hora ? _normalizarHoraActa_(gan.hora) : '—' // PF221: hora del acta de sorteo.html; PF232: siempre con dos cifras
    ];
  });

  if (!tabla) {
    var valores = [['N°', 'Nombre', 'Victorias', 'Clan', 'Premio', 'Hora']].concat(filas);
    tabla = body.insertTable(body.getChildIndex(heading) + 1, valores);
    for (var r = 0; r < tabla.getNumRows(); r++) {
      var fila = tabla.getRow(r);
      for (var c = 0; c < fila.getNumCells(); c++) {
        var celda = fila.getCell(c);
        var par = celda.getChild(0).asParagraph();
        par.setHeading(DocumentApp.ParagraphHeading.NORMAL);
        par.setAlignment(r === 0 || c === 0 ? DocumentApp.HorizontalAlignment.CENTER : DocumentApp.HorizontalAlignment.LEFT);
        var tc = par.editAsText();
        var largo = tc.getText().length;
        if (largo > 0) {
          tc.setFontFamily(0, largo - 1, 'Arial');
          tc.setFontSize(0, largo - 1, 12);
          tc.setBold(0, largo - 1, r === 0);
          tc.setItalic(0, largo - 1, false);
          tc.setForegroundColor(0, largo - 1, r === 0 ? '#FFFFFF' : '#000000');
        }
        if (r === 0) celda.setBackgroundColor('#B7B7B7');
      }
    }
    _formatearTablaGanadoresSorteoDoc_(tabla, body); // PF230
    escribirResumen();
    return true;
  }

  recortarFilas(tabla);
  // PF221: las tablas ya creadas tienen 5 columnas; se agrega «Hora» al encabezado con el mismo estilo que la última celda.
  var encabezado = tabla.getRow(0);
  if (encabezado.getNumCells() === 5) {
    var celdaHora = encabezado.appendTableCell('Hora');
    var parHora = celdaHora.getChild(0).asParagraph();
    parHora.setHeading(DocumentApp.ParagraphHeading.NORMAL);
    parHora.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    var thh = parHora.editAsText();
    thh.setFontFamily(0, 3, 'Arial');
    thh.setFontSize(0, 3, 12);
    thh.setBold(0, 3, true);
    thh.setItalic(0, 3, false);
    thh.setForegroundColor(0, 3, '#FFFFFF');
    celdaHora.setBackgroundColor('#B7B7B7');
  }
  filas.forEach(function (vals) {
    var nueva = tabla.appendTableRow();
    vals.forEach(function (v) { nueva.appendTableCell(v); });
  });
  _formatearTablaGanadoresSorteoDoc_(tabla, body); // PF230
  escribirResumen();
  return true;
}

/**
 * _escribirDocGanadoresSorteo(ganadores, idSorteo, fechaSorteo, resumen) [→ Contexto_Base_Web.md §28B030]
 */
function _escribirDocGanadoresSorteo(ganadores, idSorteo, fechaSorteo, resumen) {
  var archivo;
  try {
    archivo = _buscarArchivoEnPlantillas(NOMBRE_DOC_GANADORES_SORTEO, DOC_ID_GANADORES_SORTEO);
    if (!archivo) {
      Logger.log('[Ganadores-Sorteo] No se encontró "' + NOMBRE_DOC_GANADORES_SORTEO + '" ni en la carpeta de plantillas ni en sus subcarpetas. Se omite.');
      return '';
    }
  } catch (e) {
    Logger.log('[Ganadores-Sorteo] Error al buscar el documento: ' + e.message);
    return '';
  }

  var doc;
  try {
    doc = DocumentApp.openById(archivo.getId());
  } catch (e) {
    Logger.log('[Ganadores-Sorteo] Error al abrir el documento: ' + e.message);
    return '';
  }
  var body = doc.getBody();

  // PF207 (24-oct-2026, pedido de la usuaria): sin ganadores NO se muestra la tabla, solo un texto corto; con ganadores se rehace la tabla.
  var resTabla = _escribirGanadoresSorteoEnDoc_(body, ganadores, resumen);
  if (!resTabla) {
    Logger.log('[Ganadores-Sorteo] No se encontró \"Ganadores del sorteo:\" en el documento. Se omite.');
    doc.saveAndClose();
    return '';
  }

  // PF206 (24-oct-2026, pedido de la usuaria): este Doc también lleva «Requisitos» y «Fecha:». Antes solo se regeneraban al correr
  // sincronizarRequisitosSorteo() (dentro de procesarSorteos()); el botón Exportar y actualizarDocGanadoresSorteo() dejaban el texto viejo.
  try {
    var bloqueGan = _getConfigMasRecienteCategoria('Sorteo');
    if (bloqueGan.length > 0) {
      _reescribirRequisitosTexto(body, _resumirRequisitosBloque(bloqueGan), _MESES_ES[_calcularMesEfectivoRealDeHoy().mes], [
        function (t) { return t.indexOf('Si se detecta trampa') !== -1; },
        function (t) { return t.trim() === 'Participantes calificados:'; },
        function (t) { return t.trim() === 'Ganadores:'; },
        function (t) { return t.trim() === 'Ganadores del sorteo:'; }
      ], '[Requisitos-Ganadores-Sorteo]', { sorteo: true });
    }
  } catch (eReqGan) {
    Logger.log('[Ganadores-Sorteo] No se pudo regenerar «Requisitos»: ' + eReqGan.message);
  }
  try {
    _actualizarFechaDocSorteo(body, fechaSorteo);
  } catch (eFechaGan) {
    Logger.log('[Ganadores-Sorteo] No se pudo actualizar la «Fecha:»: ' + eFechaGan.message);
  }

  doc.saveAndClose();
  Logger.log('[Ganadores-Sorteo] Sorteo ' + idSorteo + ': ' + ganadores.length + ' ganador(es) escrito(s).');
  return archivo.getId();
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
  _rdocParrafoTexto(body, '●      Alcanzar el mínimo de medallas en guerra durante la semana actual (agosto):', false);
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
  _rdocParrafoTexto(body, 'Alcanzar el mínimo de medallas en guerra durante la semana actual (agosto):', false);
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
  _rdocParrafoTexto(body, TITULO_DOC_GANADORES_SORTEO, true, DocumentApp.HorizontalAlignment.CENTER);
  _rdocParrafoTexto(body, ' Premios:', true, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, '🏆 3 ganadores', false, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, '1 Pass Royale para cada ganador.', false, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, 'Fecha:', true, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, '\tLunes 06 de Julio 2026 - 8:00pm ', false, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, 'Transmisión:', true, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, 'En vivo a través del servidor de Discord del clan, mediante una ruleta.', false, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, 'Requisitos:', true, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocBloqueRequisitosSorteo(body);
  // PF231: ya no hay 7 párrafos vacíos antes del encabezado; _ganadoresAlInicioDePaginaDoc_() lo deja al inicio de la hoja con un salto de página.
  _rdocParrafoRuns(body, [[' ', false], ['Ganadores del sorteo:', true]]);
  body.appendParagraph('');
  _rdocTablaConEncabezadoNegrita(body, [
    ['N°', 'Nombre', 'Victorias', 'Clan', 'Premio', 'Hora'],
    ['1', 'Nombre1', '10', 'Clan1', 'Pass Royale', '08:05 p. m'],
    ['2', 'Nombre2', '9', 'Clan1', 'Pass Royale', '08:07 p. m'],
    ['3', 'Nombre3', '8', 'Clan1', 'Pass Royale', '08:09 p. m']
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
    ['N°', 'Nombre', 'Victorias', 'Clan', 'Medallas de guerra', 'Ataques semanales', 'Resultado'],
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
 * PF206 (24-oct-2026, pedido de la usuaria). _fechaSorteoPorId_(idSorteo): Fecha (con hora) de la fila de S_Lista con ese ID, o null.
 * El Doc de calificados del sorteo mostraba la «Fecha:» de la plantilla (06 de julio) aunque las semanas eran de la temporada 6.
 */
function _fechaSorteoPorId_(idSorteo) {
  try {
    var id = String(idSorteo || '').trim();
    if (!id) return null;
    var shSL = _getSs().getSheetByName(CFG.SHEETS.S_LISTA);
    if (!shSL || shSL.getLastRow() < 3) return null;
    var datos = shSL.getRange(3, 1, shSL.getLastRow() - 2, SL_TOTAL_COLS).getValues();
    for (var i = 0; i < datos.length; i++) {
      if (String(datos[i][SL.ID - 1] || '').trim() === id) {
        var f = datos[i][SL.FECHA - 1];
        return (f instanceof Date && !isNaN(f.getTime())) ? f : null;
      }
    }
  } catch (e) {
    Logger.log('[Fecha-Sorteo] No se pudo leer la fecha del sorteo ' + idSorteo + ': ' + e.message);
  }
  return null;
}

/**
 * PF206. _actualizarFechaDocSorteo(body, fecha): escribe la fecha del sorteo (formato del Doc, «Jueves 22 de Octubre 2026 - 8:00pm»)
 * en el párrafo que sigue a «Fecha:». Si la fecha del Doc ya es POSTERIOR a la del sorteo (edición manual), la respeta.
 * Devuelve true si escribió.
 */
function _actualizarFechaDocSorteo(body, fecha) {
  if (!(fecha instanceof Date) || isNaN(fecha.getTime())) return false;
  var encontrado = body.findText('Fecha:');
  if (!encontrado) return false;
  var elHeading = encontrado.getElement();
  while (elHeading.getParent() && elHeading.getType() !== DocumentApp.ElementType.PARAGRAPH) {
    elHeading = elHeading.getParent();
  }
  var idxValor = body.getChildIndex(elHeading) + 1;
  if (idxValor >= body.getNumChildren()) return false;
  var hijoValor = body.getChild(idxValor);
  if (hijoValor.getType() !== DocumentApp.ElementType.PARAGRAPH) return false;
  var pValor = hijoValor.asParagraph();
  var textoActual = pValor.getText();
  var fechaDoc = _parseSpanishDate(textoActual);
  if (fechaDoc instanceof Date && !isNaN(fechaDoc.getTime()) && fechaDoc > fecha) return false;
  var prefijoMatch = textoActual.match(/^[\s\t]*/);
  var prefijo = prefijoMatch ? prefijoMatch[0] : '';
  pValor.editAsText().setText(prefijo + _formatFechaHoraDocEs(fecha));
  // PF207 (24-oct-2026, pedido de la usuaria): el valor de la fecha copiaba el formato del subtítulo «Fecha:» (morado, negrita). Se le da
  // el formato del texto de cuerpo: el del párrafo que sigue a «Transmisión:»; si no existe, Arial 12 negro sin negrita.
  try {
    var refCuerpo = null;
    var encTr = body.findText('Transmisión:');
    if (encTr) {
      var hTr = encTr.getElement();
      while (hTr.getParent() && hTr.getType() !== DocumentApp.ElementType.PARAGRAPH) hTr = hTr.getParent();
      var iTr = body.getChildIndex(hTr) + 1;
      if (iTr < body.getNumChildren() && body.getChild(iTr).getType() === DocumentApp.ElementType.PARAGRAPH) {
        refCuerpo = body.getChild(iTr).asParagraph();
      }
    }
    if (refCuerpo && refCuerpo.getText().trim() !== '') {
      var attrs = refCuerpo.getAttributes();
      delete attrs[DocumentApp.Attribute.INDENT_START];
      delete attrs[DocumentApp.Attribute.INDENT_FIRST_LINE];
      delete attrs[DocumentApp.Attribute.INDENT_END];
      pValor.setHeading(DocumentApp.ParagraphHeading.NORMAL);
      pValor.setAttributes(attrs);
      var tF = pValor.editAsText();
      var lF = tF.getText().length;
      if (lF > 0) {
        var aT = refCuerpo.editAsText().getAttributes(0);
        tF.setAttributes(0, lF - 1, aT);
      }
    } else {
      pValor.setHeading(DocumentApp.ParagraphHeading.NORMAL);
      var tG = pValor.editAsText();
      var lG = tG.getText().length;
      if (lG > 0) {
        tG.setBold(0, lG - 1, false);
        tG.setItalic(0, lG - 1, false);
        tG.setFontFamily(0, lG - 1, 'Arial');
        tG.setFontSize(0, lG - 1, 12);
        tG.setForegroundColor(0, lG - 1, '#000000');
      }
    }
  } catch (eFmt) {
    Logger.log('[Fecha-Sorteo] No se pudo dar formato de cuerpo a la fecha: ' + eFmt.message);
  }
  return true;
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
function _getAtaquesYExentosSemanaActualPorTag(ctx, temporadaReal, guerraDataPrecalculada) {
  var mapa = {};
  var guerraData = guerraDataPrecalculada || _getDatosGuerraParaControl(ctx, temporadaReal); // 17-oct-2026 (PF091): 3.er parámetro opcional
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

  // 1b. PF206 (24-oct-2026): la «Fecha:» del Doc es la del sorteo en S_Lista (antes quedaba la de la plantilla: 06 de julio).
  // Se escribe después de evaluar, con el ID del sorteo vigente; si la evaluación falla, la fecha no se toca.

  // 2. Evaluación (24-oct-2026, pedido de la usuaria): la MISMA que usa el doc de NO calificados del sorteo y la
  // web (_evaluarCalificacionSorteo_(), 29_Docs_NoCalificados.gs): promedio de las «Semanas» de S_Lista, ataques,
  // torneos y barcos; ya NO se leen los mínimos del texto de este documento ni se usa el acumulado de la temporada. [→ Contexto_Base_Web.md §PF202]
  var ev = _evaluarCalificacionSorteo_(ctxParam);
  if (!ev) {
    Logger.log('[ParticipantesCalificados] "' + nombreDoc + '": no se pudo evaluar el sorteo (ver el motivo en el registro [CalificacionSorteo]). Se deja la lista como estaba; solo se actualizó "[Mes]".');
    doc.saveAndClose();
    return;
  }

  // 2b. PF205 (24-oct-2026, pedido de la usuaria): el texto de «Requisitos» se regenera desde S_Lista cada vez que se actualiza este
  // Doc (WhatsApp solo si está activo; barcos: «ningún ataque» si el tope es 0 o el acumulado permitido; «expulsados o sancionados» siempre).
  // Si falla, la lista se actualiza igual. [→ Contexto_Base_Web.md §PF205]
  try {
    _reescribirRequisitosTexto(body, _resumirRequisitosBloque(ev.bloque), nombreMes, [
      function (t) { return t.trim() === 'Participantes calificados:'; },
      function (t) { return t.indexOf('Si se detecta trampa') !== -1; }
    ], '[Requisitos-Sorteo]', { sorteo: true });
  } catch (eReq) {
    Logger.log('[ParticipantesCalificados] No se pudo regenerar «Requisitos» en "' + nombreDoc + '": ' + eReq.message);
  }

  try {
    _actualizarFechaDocSorteo(body, _fechaSorteoPorId_(ev.idSorteo));
  } catch (eFecha) {
    Logger.log('[ParticipantesCalificados] No se pudo actualizar la «Fecha:» en \"' + nombreDoc + '\": ' + eFecha.message);
  }

  // 3. Un array de calificados por cada clan (mismo orden que los requisitos de S_Lista).
  var porClan = {};
  for (var ci = 0; ci < ev.ordenClanes.length; ci++) porClan[ev.ordenClanes[ci]] = [];

  var totalCalificados = 0;
  ev.evaluados.forEach(function (e) {
    if (e.motivos.length > 0) return; // no calificó: va en el doc de NO calificados
    porClan[e.clan].push({ nombre: e.nombre, puntaje: _fmtMilesComa(e.trofeos) }); // puntaje = medallas de guerra (promedio semanal)
    totalCalificados++;
  });

  var grupos = [];
  for (var gi = 0; gi < ev.ordenClanes.length; gi++) {
    grupos.push({ clan: ev.ordenClanes[gi], personas: porClan[ev.ordenClanes[gi]] });
  }

  _reemplazarListaParticipantes(body, grupos);

  doc.saveAndClose();
  Logger.log('[ParticipantesCalificados] "' + nombreDoc + '": "[Mes]" -> "' + nombreMes + '". ' +
    totalCalificados + ' de ' + ev.evaluados.length + ' cuenta(s) calificada(s) (temporada ' + ev.temporadaActual + ', sorteo ' + (ev.idSorteo || 'sin ID') + ').');
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
    textoHeader.setItalic(false); // PF204: no hereda la cursiva de la línea «Ningún participante calificado.» del clan anterior
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
    // PF204 (24-oct-2026): un clan sin ningún calificado ya no queda en blanco; se escribe una línea que lo dice.
    if (!personas.length) {
      insertAt = _insertarLineaSinCalificados_(body, insertAt);
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
  t.setItalic(false); // PF204: ver el encabezado de clan
  t.setForegroundColor('#000000');
  t.setLinkUrl(null);
  return insertAt + 1;
}

/**
 * _insertarLineaSinCalificados_(body, insertAt): línea de texto para un clan sin ningún participante calificado (PF204). Sin viñeta ni
 * sangría, Arial 12 en cursiva y color gris, para que no se confunda con un nombre. Devuelve la siguiente posición de inserción.
 * [→ Contexto_Base_Web.md §PF204]
 */
function _insertarLineaSinCalificados_(body, insertAt) {
  var p = body.insertParagraph(insertAt, 'Ningún participante calificado.');
  p.setIndentStart(0);
  p.setIndentFirstLine(0);
  p.setBold(false);
  var t = p.editAsText();
  t.setFontFamily('Arial');
  t.setFontSize(12);
  t.setItalic(true);
  t.setUnderline(false);
  t.setForegroundColor('#666666');
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
  t.setItalic(0, fin, false); // PF204: ver el encabezado de clan
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
  // PF073: si Sheets falla prueba Backup_Extra.csv (columna Mostrar_T) y, si tampoco, se queda con la temporada real (antes lanzaba error y el endpoint respondía 500). [→ Contexto_Base_Web.md §PF073]
  try {
    var shExtra = ss.getSheetByName(CFG.SHEETS.EXTRA);
    if (shExtra) {
      var mostrarVal = shExtra.getRange(2, 7).getValue(); // G2 = Mostrar
      var temporadaExtra = Number(mostrarVal);
      if (temporadaExtra) temporadaMostrar = temporadaExtra;
    }
  } catch (eExtra) {
    Logger.log('[Torneos] _getTemporadaMostrarExtra: no se pudo leer Extra, se prueba Backup_Extra.csv: ' + eExtra);
    var temporadaCsv = Number(_valorExtraDesdeCsv_(['Mostrar_T', 'Mostrar']));
    if (temporadaCsv) temporadaMostrar = temporadaCsv;
  }
  return temporadaMostrar;
}

/**
 * _getTrofeosGuerraAcumuladosPorTagParaTemporada(temporadaObjetivo, ctxReal) [→ Contexto_Base_Web.md §28B077]
 */
function _getTrofeosGuerraAcumuladosPorTagParaTemporada(temporadaObjetivo, ctxReal, guerraDataPrecalculada) {
  var ctx = _clonarCtxParaTemporada(ctxReal, temporadaObjetivo);
  var guerraData = guerraDataPrecalculada || _getDatosGuerraParaControl(ctx, ctxReal.temporada); // 17-oct-2026 (PF091): 3.er parámetro opcional
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