// ==============================================================================
// 29_Docs_NoCalificados.gs
// Documentos en Drive de quienes no calificaron para un torneo o sorteo, y los tres de Cambio de rango (cambios aplicados, calificados y no calificados).
// ==============================================================================

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 28-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano: actualizarDocsNoCalificadosYCambioRango()
//  Parte 2 — Funciones que no se corren a mano (las de documento las llama 26_Torneos_Core.gs; también aceptan correrse sin argumentos)
//    - No calificados del torneo
//    - No calificados del sorteo (y su evaluación)
//    - Cambio de rango: documento de cambios aplicados, documentos de calificados y no calificados, su evaluación y su veredicto
//    - Ayudas compartidas (texto de requisitos, escritura del documento y su formato)
//    - Contenido base para la reconstrucción automática de los documentos
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

// NUEVO (15-sep-2026, pedido del usuario): [→ Contexto_Base_Web.md §29B001]

// ----- Variables y constantes -----

// Misma estructura de nombre que los documentos análogos de [→ Contexto_Base_Web.md §29B002]
var NOMBRE_DOC_NO_CALIFICADOS_TORNEO = 'No calificados (torneo) - Comunidad - ᴳ乂ᵀ ⚜️ Familia Terna';

var NOMBRE_DOC_NO_CALIFICADOS_SORTEO = 'No calificados (sorteo) - Comunidad - ᴳ乂ᵀ ⚜️ Familia Terna';

var NOMBRE_DOC_CAMBIO_RANGO = 'Cambio de rango - Comunidad - ᴳ乂ᵀ ⚜️ Familia Terna';

// NUEVO (28-oct-2026, PF286 punto 11): los dos documentos de calificados y no calificados de Cambio de rango, en la carpeta «Cambio de rango» de Drive. Mismo patrón de nombre que los de torneos y sorteos.
var NOMBRE_DOC_CALIFICADOS_CAMBIO_RANGO = 'Participantes calificados (cambio de rango) - Comunidad - ᴳ乂ᵀ ⚜️ Familia Terna';

var NOMBRE_DOC_NO_CALIFICADOS_CAMBIO_RANGO = 'No calificados (cambio de rango) - Comunidad - ᴳ乂ᵀ ⚜️ Familia Terna';

// NUEVO (28-oct-2026, PF286 punto 12): ids fijos de los tres documentos, para no depender de la búsqueda por nombre ni de la caché de Script Properties cuando se mueven de carpeta.
// El de «Cambio de rango» es el mismo archivo que DOC_ID_ASCENSOS_DESCENSOS (25_Doc_AscensosDescensos.gs), que ya figura en Drive con el título «Cambio de rango». Se repite aquí el valor (no se referencia la constante de 25) para no depender del orden de carga de los archivos.
var DOC_ID_NO_CALIFICADOS_TORNEO = '1wBJWDE8Jy1IbO7UljZwJl_PMzXU7n3qJZtg2GtHsmIQ';
var DOC_ID_NO_CALIFICADOS_SORTEO = '1arA22oL2lmJplWc-EHbibHAVkAWsE8Vkby_W2kCec1g';
var DOC_ID_CAMBIO_RANGO = '1jkUntN6esvkNvHosYesDQwlU33BfPr1I_wyyYueMxWo';
// Los dos documentos nuevos todavía no existen en Drive: la primera corrida los crea por nombre (_crearDocReconstruibleSiFalta(), 01_Config_Global.gs) y deja el id en el registro. Cuando existan, pegar aquí su id para que dejen de buscarse por nombre.
var DOC_ID_CALIFICADOS_CAMBIO_RANGO = '';
var DOC_ID_NO_CALIFICADOS_CAMBIO_RANGO = '';

// Encabezado de la tabla de los documentos de calificados y no calificados de Cambio de rango.
var NC_ENCABEZADO_TABLA_CAMBIO_RANGO = ['Nombre', 'Clan', 'Rango actual', 'Medallas (prom.)', 'Ataques (prom.)', 'Veredicto', 'Detalle'];

// Veredictos posibles de la evaluación de Cambio de rango (ver
// _ncVeredictoCambioRango() más abajo para la regla exacta de cada uno).
var NC_VEREDICTO = {
  ASCENSO:   'Ascenso',
  ELEGIBLE:  'Elegible para administración',
  MANTENER:  'Mantener rango',
  DESCENSO:  'Descenso',
  EXPULSION: 'Expulsión'
};

// ----- Parte 1: funciones que se corren a mano -----

/**
 * actualizarDocsNoCalificadosYCambioRango() [→ Contexto_Base_Web.md §29B003]
 */
function actualizarDocsNoCalificadosYCambioRango() {
  actualizarDocNoCalificadosTorneo();
  actualizarDocNoCalificadosSorteo();
  actualizarDocCambioRango();
  actualizarDocsCalificadosYNoCalificadosCambioRango();
}

// ----- Parte 2: funciones que no se corren a mano -----

// NO CALIFICADOS — TORNEO [→ Contexto_Base_Web.md §29B004]

/**
 * actualizarDocNoCalificadosTorneo(ctxParam) [→ Contexto_Base_Web.md §29B005]
 */
function actualizarDocNoCalificadosTorneo(ctxParam) {
  var ss = _getSs();

  var infoMinT = _getMinTPorNombreClan('Torneo');
  var minTPorNombreClan = infoMinT.minTPorNombreClan;
  var clanesOrden = infoMinT.clanesOrden;
  if (clanesOrden.length === 0) {
    Logger.log('[NoCalificados-Torneo] No hay clanes con Min_T activo en T_Lista todavía. Se omite.');
    return;
  }

  var ctxReal = ctxParam || _getCtx();
  if (ctxReal.periodIndexSospechoso) {
    Logger.log('[NoCalificados-Torneo] ABORT: periodIndex sospechoso, se omite esta corrida.');
    return;
  }

  var temporadaMostrar = _getTemporadaMostrarExtra(ss, ctxReal);
  var ctx = _clonarCtxParaTemporada(ctxReal, temporadaMostrar);
  // 17-oct-2026 (PF091): los datos de Guerra se leen UNA vez y se pasan a los dos helpers (antes cada uno los leía por su cuenta, ~20 s c/u); [→ Contexto_Base_Web.md §PF091]
  var guerraDataUnica = _getDatosGuerraParaControl(ctx, ctxReal.temporada);
  var ataquesSemanaPorTag = _getAtaquesYExentosSemanaActualPorTag(ctx, ctxReal.temporada, guerraDataUnica); // 19-sep-2026: { ataques, exentos }
  var ataquesMinPorClan = _ataquesMinTorneoPorNombreClan(); // 19-sep-2026 (pedido del usuario): Ataques de T_Lista por clan

  var bloqueBarcos = _getConfigMasRecienteCategoria('Torneo');
  var reqBarcos = (bloqueBarcos[0] && bloqueBarcos[0].barcos) || { activo: false, qty: null };
  var semanasBarcos = (bloqueBarcos[0] && bloqueBarcos[0].semanas) || [];
  if (reqBarcos.activo && semanasBarcos.length === 0) {
    Logger.log('[NoCalificados-Torneo] ABORT: Barcos está activo en T_Lista pero falta configurar "Semanas". Se omite.');
    return;
  }
  var barcosPromPorTag = reqBarcos.activo
    ? _getTrofeosYAtaquesSemanalesPorTag(semanasBarcos, ctxReal)
    : {};

  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!shDir || shDir.getLastRow() < 2) {
    Logger.log('[NoCalificados-Torneo] Directorio vacío. Se omite.');
    return;
  }

  var trofeosPorTag = _getTrofeosGuerraAcumuladosPorTagParaTemporada(temporadaMostrar, ctxReal, guerraDataUnica);
  var dirData = shDir.getRange(2, 1, shDir.getLastRow() - 1, DIR_SHEET_COLS).getValues();

  // --- Requisitos, al INICIO del documento ---
  // 23-oct-2026: mismo estilo que el documento del sorteo: una viñeta por clan con sus
  // requisitos separados por «;», y luego las viñetas generales (antes eran viñetas con
  // sangrías de espacios y subviñetas, con formatos distintos entre sí).
  var requisitos = [];
  for (var ri = 0; ri < clanesOrden.length; ri++) {
    var clanReq = clanesOrden[ri];
    var ataquesReqClan = ataquesMinPorClan.hasOwnProperty(clanReq) ? ataquesMinPorClan[clanReq] : 16; // 19-sep-2026: Ataques de T_Lista por clan
    requisitos.push(clanReq + ' — Ataques de guerra en la semana evaluada: ' +
      (ataquesReqClan > 0 ? 'mínimo ' + ataquesReqClan : 'no exigido') +
      '; Medallas de guerra acumuladas (temporada ' + temporadaMostrar + '): mínimo ' + minTPorNombreClan[clanReq] + '.');
  }
  if (reqBarcos.activo) {
    requisitos.push('Barcos (promedio semanal): máximo ' + reqBarcos.qty +
      ' (tope, superarlo descalifica; un promedio igual al tope no descalifica).');
  }
  // 19-sep-2026: exención por día opcional (el clan ya cruzó la meta: se descuentan 4 por día).
  requisitos.push('Ataques de guerra: se descuentan 4 por cada día opcional, cuando el clan ya cruzó la meta.');

  // --- Recorrido del padrón ---
  var filas = [['Nombre', 'Clan', 'Ataques semana', 'Medallas de guerra', 'Barcos (prom.)', 'Motivo por el que no califica']];
  var totalEvaluados = 0, totalNoCalificados = 0;

  for (var i = 0; i < dirData.length; i++) {
    var r = dirData[i];
    if (String(r[IC.ESTADO - 1]) !== 'Activo') continue;
    if (CFG.TERNA_TAGS.indexOf(String(r[IC.CLAN_TAG - 1])) < 0) continue;

    var clan = String(r[IC.CLAN - 1] || '').trim();
    if (!(clan in minTPorNombreClan)) continue; // clan sin Min_T: fuera del padrón, igual que en el doc de calificados

    totalEvaluados++;
    var tag = String(r[IC.TAG - 1] || '').trim();
    var nombre = String(r[IC.NOMBRE - 1] || '');

    var infoAtaques = ataquesSemanaPorTag[tag] || { ataques: 0, exentos: 0 };
    var ataquesSemana = infoAtaques.ataques; // reales
    var ataquesMinClan = ataquesMinPorClan.hasOwnProperty(clan) ? ataquesMinPorClan[clan] : 16; // 19-sep-2026: Ataques de T_Lista de su clan
    var ataquesExigidos = Math.max(0, ataquesMinClan - infoAtaques.exentos); // menos 4 por día opcional
    var trofeos = trofeosPorTag[tag] || 0;
    var barcosProm = reqBarcos.activo
      ? ((barcosPromPorTag[tag] && barcosPromPorTag[tag].barcosProm) || 0)
      : null;

    var motivos = [];
    if (!_cumpleAtaquesTorneoClan(infoAtaques, ataquesMinPorClan, clan)) {
      motivos.push('Ataques: ' + ataquesSemana + ' de ' + ataquesExigidos + ' exigidos' +
        (infoAtaques.exentos > 0 ? ' (' + ataquesMinClan + ' menos ' + infoAtaques.exentos + ' por día opcional)' : '') + '.');
    }
    if (trofeos < minTPorNombreClan[clan]) {
      motivos.push('Medallas de guerra: ' + _ncFmtNum(trofeos) + ' (se piden ' + minTPorNombreClan[clan] + ').');
    }
    if (reqBarcos.activo && barcosProm > reqBarcos.qty) {
      motivos.push('Barcos: ' + _ncFmtNum(barcosProm) + ' de promedio semanal (el tope es ' + reqBarcos.qty + ').');
    }
    if (motivos.length === 0) continue; // calificó: no va en este documento

    totalNoCalificados++;
    filas.push([
      nombre,
      clan,
      String(ataquesSemana),
      _ncFmtNum(trofeos),
      (barcosProm === null ? 'No evaluado' : _ncFmtNum(barcosProm)),
      motivos.join(' ')
    ]);
  }

  var resumen = totalNoCalificados + ' de ' + totalEvaluados + ' cuenta(s) evaluada(s) no califican. ' +
    'Temporada ' + temporadaMostrar +
    (String(temporadaMostrar) === String(ctxReal.temporada) ? ' (real vigente)' : ' (vía Extra!Mostrar)') + '.';

  _ncEscribirDocumento(NOMBRE_DOC_NO_CALIFICADOS_TORNEO, 'Participantes NO calificados (torneo)',
    requisitos, filas, resumen, 'Todas las cuentas evaluadas calificaron: no hay nadie que listar en esta corrida.', true, DOC_ID_NO_CALIFICADOS_TORNEO);

  Logger.log('[NoCalificados-Torneo] ' + resumen);
}

// NO CALIFICADOS — SORTEO [→ Contexto_Base_Web.md §29B006]

/**
 * actualizarDocNoCalificadosSorteo(ctxParam) [→ Contexto_Base_Web.md §29B007]
 */
function actualizarDocNoCalificadosSorteo(ctxParam) {
  var ev = _evaluarCalificacionSorteo_(ctxParam);
  if (!ev) return;

  var filas = [['Nombre', 'Clan', 'Medallas (prom.)', 'Ataques (prom.)', 'Torneos', 'Barcos (prom.)', 'Motivo por el que no califica']];
  var totalNoCalificados = 0;
  ev.evaluados.forEach(function (e) {
    if (e.motivos.length === 0) return; // calificó: va en el doc de Participantes calificados
    totalNoCalificados++;
    filas.push([
      e.nombre,
      e.clan,
      _ncFmtNum(e.trofeos),
      _ncFmtNum(e.ataques),
      String(e.torneos),
      (e.barcosEvaluado ? _ncFmtNum(e.barcosProm) : 'No evaluado'),
      e.motivos.join(' ')
    ]);
  });

  var resumen = totalNoCalificados + ' de ' + ev.evaluados.length + ' cuenta(s) evaluada(s) no califican. ' +
    'Temporada ' + ev.temporadaActual + '. Sorteo ' + (ev.idSorteo || 'sin ID') + '.';

  _ncEscribirDocumento(NOMBRE_DOC_NO_CALIFICADOS_SORTEO, 'Participantes NO calificados (sorteo)',
    ev.requisitos, filas, resumen, 'Todas las cuentas evaluadas calificaron: no hay nadie que listar en esta corrida.', true, DOC_ID_NO_CALIFICADOS_SORTEO);

  Logger.log('[NoCalificados-Sorteo] ' + resumen);
}

/**
 * _evaluarCalificacionSorteo_(ctxParam) [→ Contexto_Base_Web.md §PF202]
 * (24-oct-2026, pedido de la usuaria) ÚNICA evaluación del sorteo: la usan el doc de NO calificados y el de
 * Participantes calificados, así que un jugador sale en uno o en el otro, nunca en ninguno. Mismo criterio
 * que _webSorteoCalificados() (37_Web_API.gs). Devuelve null si no se puede evaluar (sin filas en S_Lista o
 * sin «Semanas»); si no, { evaluados, requisitos, ordenClanes, temporadaActual, idSorteo }, donde cada
 * evaluado trae sus `motivos` (vacío = califica).
 */
function _evaluarCalificacionSorteo_(ctxParam) {
  var bloque = _getConfigMasRecienteCategoria('Sorteo');
  if (bloque.length === 0) {
    Logger.log('[CalificacionSorteo] S_Lista no tiene ninguna fila con Clan asignado todavía. Se omite.');
    return null;
  }

  var ss = _getSs();
  var ctxReal = ctxParam || _getCtx();
  var temporadaActual = _getTemporadaMostrarExtra(ss, ctxReal);

  var necesitaTrofeos = bloque.some(function (b) { return b.minT.activo; });
  var necesitaAtaques = bloque.some(function (b) { return b.ataques.activo; });
  var necesitaTorneos = bloque.some(function (b) { return b.torneos.activo; });
  var necesitaBarcos  = bloque.some(function (b) { return b.barcos.activo; });

  var semanas = bloque[0].semanas || [];
  var necesitaSemanas = necesitaTrofeos || necesitaAtaques || necesitaTorneos || necesitaBarcos;
  if (necesitaSemanas && semanas.length === 0) {
    Logger.log('[CalificacionSorteo] ABORT: falta configurar "Semanas" en S_Lista para este sorteo.');
    return null;
  }

  var semanalPorTag = (necesitaTrofeos || necesitaAtaques || necesitaBarcos)
    ? _getTrofeosYAtaquesSemanalesPorTag(semanas, ctxReal)
    : {};
  var torneosPorTag = necesitaTorneos ? _contarTorneosPorTagEnSemanas(ss, semanas) : {};

  var reqPorClan = {};
  var ordenClanes = [];
  bloque.forEach(function (b) {
    reqPorClan[b.clan] = b;
    ordenClanes.push(b.clan);
  });

  // --- Requisitos, al INICIO del documento ---
  var requisitos = [];
  ordenClanes.forEach(function (c) {
    var req = reqPorClan[c];
    var partes = [];
    if (req.minT.activo)    partes.push('Medallas de guerra (promedio semanal): mínimo ' + req.minT.qty);
    if (req.ataques.activo) partes.push('Ataques (promedio semanal): mínimo ' + req.ataques.qty);
    if (req.torneos.activo) partes.push('Torneos jugados en las semanas evaluadas: mínimo ' + req.torneos.qty);
    if (req.barcos.activo)  partes.push('Barcos (promedio semanal): máximo ' + req.barcos.qty + ' (tope, superarlo descalifica)');
    if (!partes.length)     partes.push('sin requisitos automáticos activos para este clan');
    requisitos.push(c + ' — ' + partes.join('; ') + '.');
  });
  if (semanas.length) {
    requisitos.push('Semanas evaluadas: ' + semanas.map(function (s) {
      return 'T' + s.temporada + '_S' + s.semana;
    }).join(', ') + '.');
  }

  var dataDir = _leerDirectorioFisicoComoDC(ss);
  var evaluados = [];

  for (var i = 0; i < dataDir.length; i++) {
    var fila = dataDir[i];
    if (String(fila[DC.ESTADO - 1] || '').trim() !== 'Activo') continue;

    var clan = String(fila[DC.CLAN - 1] || '').trim();
    var req = reqPorClan[clan];
    if (!req) continue; // clan sin fila de requisitos: no participa, igual que en _webSorteoCalificados()

    var tag = String(fila[DC.TAG - 1] || '').trim();
    var trofeos = (semanalPorTag[tag] && semanalPorTag[tag].trofeosProm) || 0;
    var ataques = (semanalPorTag[tag] && semanalPorTag[tag].ataquesProm) || 0;
    var barcosProm = (semanalPorTag[tag] && semanalPorTag[tag].barcosProm) || 0;
    var torneos = torneosPorTag[tag] || 0;

    var motivos = [];
    if (req.minT.activo && trofeos < req.minT.qty) {
      motivos.push('Medallas de guerra: ' + _ncFmtNum(trofeos) + ' de promedio (se piden ' + req.minT.qty + ').');
    }
    // 19-sep-2026: SUMATORIA (no promedio), igual que _webSorteoCalificados() (37_Web_API.gs).
    if (req.ataques.activo && !_ataquesCumplenRequisito(semanalPorTag[tag], req.ataques.qty)) {
      // 19-sep-2026: aviso de exoneración por domingo opcional (mismo texto que [→ Contexto_Base_Web.md §29B008]
      var exentosTxt = (semanalPorTag[tag] && Number(semanalPorTag[tag].ataquesExentos) > 0)
        ? ', ' + semanalPorTag[tag].ataquesExentos + ' exonerados por domingo opcional'
        : '';
      motivos.push('Ataques: ' + _ncFmtNum(ataques) + ' de promedio (se piden ' + req.ataques.qty + exentosTxt + ').');
    }
    if (req.torneos.activo && torneos < req.torneos.qty) {
      motivos.push('Torneos: ' + torneos + ' (se piden ' + req.torneos.qty + ').');
    }
    if (req.barcos.activo && barcosProm > req.barcos.qty) {
      motivos.push('Barcos: ' + _ncFmtNum(barcosProm) + ' de promedio semanal (el tope es ' + req.barcos.qty + ').');
    }
    evaluados.push({
      nombre: String(fila[DC.NOMBRE - 1] || ''),
      clan: clan,
      tag: tag,
      trofeos: trofeos,
      ataques: ataques,
      torneos: torneos,
      barcosProm: barcosProm,
      barcosEvaluado: !!req.barcos.activo,
      motivos: motivos   // vacío = CALIFICA
    });
  }

  return {
    evaluados: evaluados,
    requisitos: requisitos,
    ordenClanes: ordenClanes,
    temporadaActual: temporadaActual,
    idSorteo: bloque[0].idFila || '',
    bloque: bloque // PF205: configuración de S_Lista, para regenerar el texto de «Requisitos» del Doc de calificados
  };
}

// CAMBIO DE RANGO — tres documentos (PF286 punto 11, 28-oct-2026) [→ Contexto_Base_Web.md §29B009]
//  «Cambio de rango»: los cambios realmente aplicados de la corrida más reciente (leídos de Historial_A/D), con los requisitos que regían, las listas por clan y las tablas de requisitos por rango.
//  «Participantes calificados (cambio de rango)»: quienes cumplen los requisitos de Ascenso del par vigente de CR_Lista.
//  «No calificados (cambio de rango)»: todos los demás evaluados, con su veredicto y el detalle.

/**
 * actualizarDocCambioRango(idAscenso, idDescenso) [→ Contexto_Base_Web.md §29B010]
 * Documento «Cambio de rango». Ya no da un veredicto por jugador (eso pasó a los documentos de calificados y no calificados): indica los cambios de rango
 * realmente aplicados de la corrida más reciente (_leerCorridaCambioRangoHistorial_(), 24_Historial_Ascensos.gs), con los requisitos del par de CR_Lista,
 * la temporada y la semana, las listas por clan y las tablas de requisitos por rango (25_Doc_AscensosDescensos.gs). No evalúa a nadie, así que es barato.
 * Sin ids usa el par vigente de Extra.
 */
function actualizarDocCambioRango(idAscenso, idDescenso) {
  var par = _cargarParCambioRango_(idAscenso, idDescenso);
  if (!par.ok) {
    Logger.log('[CambioRango-Doc] ABORT: ' + par.error);
    return;
  }

  var minGPorNombreClan = _getMinGClanMaps().byNombre;
  var corrida = _leerCorridaCambioRangoHistorial_(null);
  var requisitos = _requisitosCambioRango_(par, minGPorNombreClan, { detallePorRol: false, reglasVeredicto: false });
  var resumen = _resumenCorridaCambioRango_(corrida);
  var ordenClanes = par.filaAscenso.porClan.map(function (b) { return b.clan; });
  var grupos = _agruparCambiosAplicadosPorClan_(corrida.aplicados, ordenClanes);

  _ncEscribirDocumento(NOMBRE_DOC_CAMBIO_RANGO, 'Cambio de rango',
    requisitos, null, resumen, '', false, DOC_ID_CAMBIO_RANGO,
    function (body) {
      if (corrida.hayCorrida) {
        _agregarListasCambiosAplicadosADoc_(body, grupos);
        _rdocParrafoTexto(body, '', false);
      }
      _agregarTablasRequisitosRangoADoc_(body, par.filaAscenso, par.filaDescenso);
      _rdocParrafoTexto(body, '', false);
      _agregarReglasCambioRangoADoc_(body);
      _rdocParrafoTexto(body, '', false);
      _rdocBloqueRedesSocialesYPie(body);
    });

  Logger.log('[CambioRango-Doc] ' + resumen);
}

/**
 * actualizarDocsCalificadosYNoCalificadosCambioRango(idAscenso, idDescenso)
 * Documentos «Participantes calificados (cambio de rango)» y «No calificados (cambio de rango)». Evalúa UNA vez a todo el padrón (_evaluarCambioRango_()) y
 * reparte a cada cuenta en uno u otro: califica quien cumple los requisitos de Ascenso de su rango y clan; todos los demás van en «No calificados», con su
 * veredicto (Mantener rango, Descenso o Expulsión) y el detalle. Una cuenta sale en uno de los dos documentos, nunca en ninguno ni en los dos.
 * Sin ids usa el par vigente de Extra.
 */
function actualizarDocsCalificadosYNoCalificadosCambioRango(idAscenso, idDescenso) {
  var ev = _evaluarCambioRango_(idAscenso, idDescenso);
  if (!ev) return;

  var rep = _repartirEvaluadosCambioRango_(ev.evaluados, ev.ordenClanes);
  var total = ev.evaluados.length;
  var conteoCal = _conteoVeredictosTexto_(rep.calificados);
  var conteoNo = _conteoVeredictosTexto_(rep.noCalificados);

  var resumenCal = rep.calificados.length + ' de ' + total + ' cuenta(s) evaluada(s) cumplen los requisitos de Ascenso' +
    (conteoCal ? ' (' + conteoCal + ')' : '') + '.';
  var resumenNo = rep.noCalificados.length + ' de ' + total + ' cuenta(s) evaluada(s) no cumplen los requisitos de Ascenso' +
    (conteoNo ? ' (' + conteoNo + ')' : '') + '.';

  var notaCal = 'Califican los jugadores que cumplen los requisitos de Ascenso de su rango y de su clan; los demás figuran en el documento «No calificados (cambio de rango)».';
  var notaNo = 'No califican los jugadores que no cumplen los requisitos de Ascenso de su rango y de su clan; los que sí los cumplen figuran en el documento «Participantes calificados (cambio de rango)».';

  _ncEscribirDocumento(NOMBRE_DOC_CALIFICADOS_CAMBIO_RANGO, 'Participantes calificados (cambio de rango)',
    ev.requisitos.concat([notaCal]), _filasEvaluadosCambioRango_(rep.calificados), resumenCal,
    'Ningún jugador cumple los requisitos de Ascenso en esta corrida.', true, DOC_ID_CALIFICADOS_CAMBIO_RANGO);

  _ncEscribirDocumento(NOMBRE_DOC_NO_CALIFICADOS_CAMBIO_RANGO, 'Participantes NO calificados (cambio de rango)',
    ev.requisitos.concat([notaNo]), _filasEvaluadosCambioRango_(rep.noCalificados), resumenNo,
    'Todas las cuentas evaluadas cumplen los requisitos de Ascenso: no hay nadie que listar en esta corrida.', true, DOC_ID_NO_CALIFICADOS_CAMBIO_RANGO);

  Logger.log('[CambioRango-Doc] Calificados: ' + resumenCal + ' | No calificados: ' + resumenNo);
}

/**
 * _cargarParCambioRango_(idAscenso, idDescenso)
 * Lee y valida el par de CR_Lista que evalúan los documentos de Cambio de rango. Sin ids usa el par vigente de Extra (Ascenso_Vigente_ID y Descenso_Vigente_ID).
 * Devuelve { ok: true, idA, idD, filaAscenso, filaDescenso } o { ok: false, error }.
 */
function _cargarParCambioRango_(idAscenso, idDescenso) {
  var idA = idAscenso || _getIdVigenteExtraCR('Ascenso');
  var idD = idDescenso || _getIdVigenteExtraCR('Descenso');
  if (!idA || !idD) {
    return { ok: false, error: 'falta el par de CR_Lista (Ascenso=' + (idA || 'vacío') +
      ', Descenso=' + (idD || 'vacío') + '). Configurar Extra!Ascenso_Vigente_ID/Descenso_Vigente_ID ' +
      'o pasar ambos IDs a mano.' };
  }

  var filaAscenso  = _getFilaCRListaPorId(idA);
  var filaDescenso = _getFilaCRListaPorId(idD);
  if (!filaAscenso || !filaDescenso) {
    return { ok: false, error: 'no encontré una o ambas filas de CR_Lista (' + idA + ' / ' + idD + ').' };
  }

  // Misma validación que _calcularPropuestasCambioRango(): si Ascenso y [→ Contexto_Base_Web.md §29B011]
  var coherencia = _validarCoherenciaCRLista(filaAscenso, filaDescenso);
  if (!coherencia.ok) {
    return { ok: false, error: 'CR_Lista tiene requisitos incoherentes entre Ascenso y Descenso (' +
      idA + ' / ' + idD + '): ' + coherencia.errores.join(' | ') };
  }

  return { ok: true, idA: idA, idD: idD, filaAscenso: filaAscenso, filaDescenso: filaDescenso };
}

/**
 * _requisitosCambioRango_(par, minGPorNombreClan, opciones)
 * Líneas de «Requisitos evaluados» de los documentos de Cambio de rango (`par` es lo que devuelve _cargarParCambioRango_()).
 * opciones.detallePorRol: agrega, por clan y rol, los requisitos de Ascenso y de Descenso (los documentos de calificados y no calificados; «Cambio de rango» no los
 * pone porque ya lleva las tablas de requisitos por rango). opciones.reglasVeredicto: agrega la línea que explica cómo se decide el veredicto.
 */
function _requisitosCambioRango_(par, minGPorNombreClan, opciones) {
  opciones = opciones || {};
  var filaAscenso = par.filaAscenso;
  var filaDescenso = par.filaDescenso;
  var porClanDescenso = {};
  filaDescenso.porClan.forEach(function (b) { porClanDescenso[b.clan] = b; });

  var requisitos = [];
  requisitos.push('Par de CR_Lista evaluado: Ascenso ' + par.idA + ' / Descenso ' + par.idD + '.');
  if (filaAscenso.semanas && filaAscenso.semanas.length) {
    requisitos.push('Semanas evaluadas (Ascenso): ' + filaAscenso.semanas.map(function (s) {
      return 'T' + s.temporada + '_S' + s.semana;
    }).join(', ') + '.');
  }
  if (filaDescenso.semanas && filaDescenso.semanas.length) {
    requisitos.push('Semanas evaluadas (Descenso): ' + filaDescenso.semanas.map(function (s) {
      return 'T' + s.temporada + '_S' + s.semana;
    }).join(', ') + '.');
  }
  filaAscenso.porClan.forEach(function (b) {
    var bd = porClanDescenso[b.clan];
    if (opciones.detallePorRol) {
      ['miembro', 'veterano', 'colider'].forEach(function (rol) {
        requisitos.push(b.clan + ' — ' + _ncNombreRol(rol) + ': ' +
          'ASCENSO ' + _ncTextoRequisito(b.minCR[rol], b.ataques[rol]) + ' | ' +
          'DESCENSO ' + (bd ? _ncTextoRequisito(bd.minCR[rol], bd.ataques[rol]) : 'sin fila de Descenso para este clan') + '.');
      });
    }
    requisitos.push(b.clan + ' — Min_G (umbral de expulsión, sobre medallas promedio): ' +
      (minGPorNombreClan[b.clan] !== undefined ? minGPorNombreClan[b.clan] : CFG.MIN_G_DEFAULT) + '.');
  });
  requisitos.push('Descenso: solo cuentan las semanas completas de cada jugador (con fila el primer día de ' +
    'guerra); si ninguna cuenta, no se evalúa el Descenso y queda en Mantener rango. Ascenso: todas las semanas evaluadas.');
  if (opciones.reglasVeredicto) {
    requisitos.push('Veredictos: ASCENSO si cumple los requisitos de Ascenso; MANTENER RANGO si supera ' +
      'los de Descenso pero no llega a los de Ascenso; DESCENSO si queda por debajo de los de Descenso ' +
      'pero alcanza Min_G; EXPULSIÓN si queda por debajo de Min_G. Se evalúan en ese orden y el primero ' +
      'que coincide es el veredicto. Un Colíder que cumple los requisitos de Ascenso no sube de rango: ' +
      'queda marcado como elegible para administración.');
  }
  return requisitos;
}

/**
 * _resumenCorridaCambioRango_(corrida) — función pura (se prueba en Node, sin hojas).
 * Texto de «Resumen» del documento «Cambio de rango», a partir de lo que devuelve _leerCorridaCambioRangoHistorial_() (24_Historial_Ascensos.gs).
 */
function _resumenCorridaCambioRango_(corrida) {
  if (!corrida || !corrida.hayCorrida) {
    return 'Todavía no se ha registrado ninguna propuesta de cambio de rango, así que no hay cambios aplicados que mostrar.';
  }
  var partes = [];
  if (corrida.temporada !== '' && corrida.temporada !== undefined && corrida.temporada !== null) partes.push('temporada ' + corrida.temporada);
  if (corrida.semana !== '' && corrida.semana !== undefined && corrida.semana !== null) partes.push('semana ' + corrida.semana);
  if (corrida.dia) partes.push(corrida.dia);
  var cuando = partes.length ? ' (' + partes.join(', ') + ')' : '';
  return 'Corrida del ' + corrida.diaTxt + cuando + ': ' + corrida.total + ' cambio(s) propuesto(s), ' +
    corrida.aplicadosN + ' aplicado(s)' +
    (corrida.pendientesN > 0 ? ' y ' + corrida.pendientesN + ' pendiente(s) de aplicar.' : '; no queda ninguno pendiente.');
}

/**
 * _evaluarCambioRango_(idAscenso, idDescenso)
 * ÚNICA evaluación del padrón para Cambio de rango (antes estaba dentro de actualizarDocCambioRango()): la usan los documentos de calificados y no calificados,
 * así que una cuenta sale en uno o en el otro, nunca en ninguno. Mismo criterio que _calcularPropuestasCambioRango() (26_Torneos_Core.gs).
 * Devuelve null si no se puede evaluar (sin par, par incoherente, semanas que todavía no terminan o sin semanas); si no,
 * { idA, idD, filaAscenso, filaDescenso, requisitos, ordenClanes, evaluados }, donde cada evaluado trae { nombre, clan, tag, rangoActual, rolKey, fame, ataques,
 * veredicto, detalle, cumpleAscenso }.
 */
function _evaluarCambioRango_(idAscenso, idDescenso) {
  var par = _cargarParCambioRango_(idAscenso, idDescenso);
  if (!par.ok) {
    Logger.log('[CambioRango-Doc] ABORT: ' + par.error);
    return null;
  }
  var idA = par.idA;
  var idD = par.idD;
  var filaAscenso = par.filaAscenso;
  var filaDescenso = par.filaDescenso;

  var ss = _getSs();
  var ctxReal = _getCtx();

  // CAMBIO (29-sep-2026, pedido de la usuaria, opcion B): misma regla que [→ Contexto_Base_Web.md §29B012]
  var pendientesAsc  = _semanasPendientesCR(filaAscenso.semanas, ctxReal);
  var pendientesDesc = _semanasPendientesCR(filaDescenso.semanas, ctxReal);
  if (pendientesAsc.length || pendientesDesc.length) {
    Logger.log('[CambioRango-Doc] ABORT: la corrida evalúa semanas que todavía no terminan: ' +
      _textoSemanasPendientesCR(pendientesAsc.length ? pendientesAsc : pendientesDesc));
    return null;
  }
  if (!filaAscenso.semanas.length || !filaDescenso.semanas.length) {
    Logger.log('[CambioRango-Doc] ABORT: la corrida no tiene semanas que evaluar.');
    return null;
  }

  var porClanAscenso = {};
  filaAscenso.porClan.forEach(function (b) { porClanAscenso[b.clan] = b; });
  var porClanDescenso = {};
  filaDescenso.porClan.forEach(function (b) { porClanDescenso[b.clan] = b; });

  // Min_G por nombre de clan — el umbral de EXPULSIÓN. Es la misma fuente [→ Contexto_Base_Web.md §29B013]
  var minGPorNombreClan = _getMinGClanMaps().byNombre;

  // FIX (27-sep-2026, pedido del usuario -- mismo arreglo que ya se aplicó en [→ Contexto_Base_Web.md §29B014]
  var mismasSemanasAD = JSON.stringify(filaAscenso.semanas) === JSON.stringify(filaDescenso.semanas);
  // 4-oct-2026 (Fase 14, aviso b): el 4.o parametro (semanas completas por jugador) lo usa el [→ Contexto_Base_Web.md §29B015]
  var porTagAscenso = _getTrofeosYAtaquesSemanalesPorTag(filaAscenso.semanas, ctxReal, true, mismasSemanasAD);
  var porTagDescenso = mismasSemanasAD
    ? porTagAscenso
    : _getTrofeosYAtaquesSemanalesPorTag(filaDescenso.semanas, ctxReal, true, true);
  // 4-oct-2026, P2: ventanas de Historial_I/S (misma lectura unica por corrida que
  // _calcularPropuestasCambioRango(), 26_Torneos_Core.gs).
  var ventanasHist = _ventanasHistorialParaDescensoCR_();

  var cachePromedios = {};
  function promediosCache(tag, semanas, sufijoCache) {
    var key = tag + '|' + sufijoCache;
    if (!cachePromedios[key]) {
      cachePromedios[key] = _getPromediosCRParaJugador(tag, semanas, ctxReal, (sufijoCache === 'A') ? porTagAscenso : porTagDescenso);
    }
    return cachePromedios[key];
  }

  // 4-oct-2026: "Miembro activo" (consulta a la API) solo se pide si el requisito esta activo, y una
  // sola vez por jugador (mismo criterio que miembroVigenteCache() de _calcularPropuestasCambioRango()).
  var cacheMiembroVigente = {};
  function miembroVigenteCache(tag) {
    if (!(tag in cacheMiembroVigente)) cacheMiembroVigente[tag] = _esMiembroVigenteEnClanesFamilia(tag);
    return cacheMiembroVigente[tag];
  }
  var ordenClanesCR = filaAscenso.porClan.map(function (b) { return b.clan; });

  // --- Requisitos, al INICIO del documento ---
  var requisitos = _requisitosCambioRango_(par, minGPorNombreClan, { detallePorRol: true, reglasVeredicto: true });

  // --- Recorrido del padrón (mismo criterio que _calcularPropuestasCambioRango) ---
  var dataDir = _leerDirectorioFisicoComoDC(ss);
  var evaluados = [];

  for (var i = 0; i < dataDir.length; i++) {
    var fila = dataDir[i];
    if (String(fila[DC.ESTADO - 1] || '').trim() !== 'Activo') continue;

    var clan = String(fila[DC.CLAN - 1] || '').trim();
    var bloqueAsc  = porClanAscenso[clan];
    var bloqueDesc = porClanDescenso[clan];
    if (!bloqueAsc && !bloqueDesc) continue; // clan fuera de este par de CR_Lista

    var rangoActual = String(fila[DC.RANGO - 1] || '').trim();
    var rangoNorm = rangoActual.toLowerCase().replace('í', 'i').replace('é', 'e');
    if (rangoNorm === 'lider') continue; // Líder: fuera del cálculo, igual que en _calcularPropuestasCambioRango()

    var rolKey = null;
    if (rangoNorm === 'miembro')       rolKey = 'miembro';
    else if (rangoNorm === 'veterano') rolKey = 'veterano';
    else if (rangoNorm === 'colider')  rolKey = 'colider';
    if (!rolKey) continue; // Rango no reconocido (dato sucio)

    var tag = String(fila[DC.TAG - 1] || '').trim();

    var promAsc  = bloqueAsc  ? promediosCache(tag, filaAscenso.semanas,  'A') : null;
    // 4-oct-2026 (Fase 14, aviso b): igual que _calcularPropuestasCambioRango(): el Descenso se evalua [→ Contexto_Base_Web.md §29B016]
    var fechaIngCelda = fila[DC.FECHA_ING - 1];
    var fechaIngreso = (fechaIngCelda instanceof Date && !isNaN(fechaIngCelda.getTime())) ? fechaIngCelda : null;
    var blqDesc = bloqueDesc ? _bloqueDescensoDesdeSemanasCompletas((porTagDescenso[tag] || {}).semanasCompletas, fechaIngreso, tag, ventanasHist) : null;
    var promDesc = blqDesc ? _getPromediosCRParaJugador(tag, filaDescenso.semanas, ctxReal, porTagDescenso, blqDesc) : null;
    var idxClanDoc = ordenClanesCR.indexOf(clan);
    var ctxVeredicto = {
      globAsc:  { barcos: filaAscenso.barcos,  miembroActivo: filaAscenso.miembroActivo,  whatsapp: filaAscenso.whatsapp },
      globDesc: { barcos: filaDescenso.barcos, miembroActivo: filaDescenso.miembroActivo, whatsapp: filaDescenso.whatsapp },
      wspG: String(fila[DC.WSP_G - 1] || '').trim(),
      miembroVigente: function () { return miembroVigenteCache(tag); },
      sinSemanasDesc: !!(bloqueDesc && !promDesc),
      clanDestinoColider: (rolKey === 'colider' && idxClanDoc > 0) ? ordenClanesCR[idxClanDoc - 1] : '',
      yaEsAdmin: _esAdminEnDirectorioCR(fila[DC.ADMIN - 1])
    };
    // Los indicadores que se muestran son los de la corrida de Descenso [→ Contexto_Base_Web.md §29B017]
    var promMostrado = promDesc || promAsc;

    var minGClan = (minGPorNombreClan[clan] !== undefined) ? minGPorNombreClan[clan] : CFG.MIN_G_DEFAULT;
    var veredicto = _ncVeredictoCambioRango(rolKey, bloqueAsc, bloqueDesc, promAsc, promDesc, minGClan, ctxVeredicto);

    evaluados.push({
      nombre: String(fila[DC.NOMBRE - 1] || ''),
      clan: clan,
      tag: tag,
      rangoActual: rangoActual,
      rolKey: rolKey,
      fame: promMostrado ? promMostrado.fameProm : 0,
      ataques: promMostrado ? promMostrado.ataquesProm : 0,
      veredicto: veredicto.veredicto,
      detalle: veredicto.detalle,
      cumpleAscenso: !!veredicto.cumpleAscenso
    });
  }

  return {
    idA: idA,
    idD: idD,
    filaAscenso: filaAscenso,
    filaDescenso: filaDescenso,
    requisitos: requisitos,
    ordenClanes: ordenClanesCR,
    evaluados: evaluados
  };
}

/**
 * _repartirEvaluadosCambioRango_(evaluados, ordenClanes) — función pura (se prueba en Node, sin hojas).
 * Reparte a los evaluados en { calificados (cumplen el Ascenso), noCalificados (todos los demás) }. Cada lista sale ordenada por clan (en el orden de `ordenClanes`),
 * luego por rango (Colíder, Veterano, Miembro) y luego por nombre.
 */
function _repartirEvaluadosCambioRango_(evaluados, ordenClanes) {
  var calificados = [];
  var noCalificados = [];
  (evaluados || []).forEach(function (e) {
    (e.cumpleAscenso ? calificados : noCalificados).push(e);
  });
  var ordenRol = { colider: 0, veterano: 1, miembro: 2 };
  function posClan(c) {
    var i = (ordenClanes || []).indexOf(c);
    return i < 0 ? 9999 : i;
  }
  function comparar(a, b) {
    var dc = posClan(a.clan) - posClan(b.clan);
    if (dc !== 0) return dc;
    var ra = (ordenRol[a.rolKey] === undefined) ? 9 : ordenRol[a.rolKey];
    var rb = (ordenRol[b.rolKey] === undefined) ? 9 : ordenRol[b.rolKey];
    if (ra !== rb) return ra - rb;
    return String(a.nombre).localeCompare(String(b.nombre), 'es', { sensitivity: 'base' });
  }
  calificados.sort(comparar);
  noCalificados.sort(comparar);
  return { calificados: calificados, noCalificados: noCalificados };
}

/**
 * _filasEvaluadosCambioRango_(lista) — función pura. Filas de la tabla de los documentos de calificados y no calificados (encabezado + una fila por cuenta).
 */
function _filasEvaluadosCambioRango_(lista) {
  var filas = [NC_ENCABEZADO_TABLA_CAMBIO_RANGO.slice()];
  (lista || []).forEach(function (e) {
    filas.push([e.nombre, e.clan, e.rangoActual, _ncFmtNum(e.fame), _ncFmtNum(e.ataques), e.veredicto, e.detalle]);
  });
  return filas;
}

/**
 * _conteoVeredictosTexto_(lista) — función pura. «Ascenso: 5 | Elegible para administración: 1», en el orden fijo de NC_VEREDICTO y sin los que no tienen ninguna cuenta.
 */
function _conteoVeredictosTexto_(lista) {
  var orden = [NC_VEREDICTO.ASCENSO, NC_VEREDICTO.ELEGIBLE, NC_VEREDICTO.MANTENER, NC_VEREDICTO.DESCENSO, NC_VEREDICTO.EXPULSION];
  var conteo = {};
  (lista || []).forEach(function (e) { conteo[e.veredicto] = (conteo[e.veredicto] || 0) + 1; });
  var partes = [];
  orden.forEach(function (v) { if (conteo[v]) partes.push(v + ': ' + conteo[v]); });
  return partes.join(' | ');
}

/**
 * _ncVeredictoCambioRango(rolKey, bloqueAsc, bloqueDesc, promAsc, promDesc, minGClan) [→ Contexto_Base_Web.md §29B018]
 */
function _ncVeredictoCambioRango(rolKey, bloqueAsc, bloqueDesc, promAsc, promDesc, minGClan, ctx) {
  // 4-oct-2026 (Fase 14, aviso b): _cumpleRequisitoCR() (26_Torneos_Core.gs) cambio de firma el [→ Contexto_Base_Web.md §29B019]
  ctx = ctx || {};
  var sinReq = { activo: false, qty: 0 };
  var gA = ctx.globAsc  || { barcos: sinReq, miembroActivo: sinReq, whatsapp: sinReq };
  var gD = ctx.globDesc || { barcos: sinReq, miembroActivo: sinReq, whatsapp: sinReq };
  function cumple(bloque, glob, prom) {
    var mv = (glob.miembroActivo && glob.miembroActivo.activo && ctx.miembroVigente) ? ctx.miembroVigente() : false;
    return _cumpleRequisitoCR(bloque.minCR[rolKey], bloque.ataques[rolKey], glob.barcos, glob.miembroActivo,
      glob.whatsapp, prom, mv, ctx.wspG || '');
  }

  // 1. Ascenso
  if (bloqueAsc && promAsc && cumple(bloqueAsc, gA, promAsc)) {
    var textoAsc = 'Cumple Ascenso — ' +
      _ncTextoRequisitoVsReal(bloqueAsc.minCR[rolKey], bloqueAsc.ataques[rolKey], promAsc);
    if (rolKey !== 'colider') {
      return { veredicto: NC_VEREDICTO.ASCENSO, cumpleAscenso: true, detalle: textoAsc + '.' };
    }
    // Colider (28-sep-2026, igual que _calcularPropuestasCambioRango()): de una cantera sube de clan y
    // llega como Miembro; el del clan principal solo es elegible para admin, salvo que ya lo sea.
    if (ctx.clanDestinoColider) {
      return {
        veredicto: NC_VEREDICTO.ASCENSO,
        cumpleAscenso: true,
        detalle: textoAsc + '. Colíder de cantera: sube al clan ' + ctx.clanDestinoColider + ' y llega como Miembro.'
      };
    }
    if (ctx.yaEsAdmin) {
      return {
        veredicto: NC_VEREDICTO.MANTENER,
        cumpleAscenso: true,
        detalle: textoAsc + '. Colíder del clan principal que ya es admin: no se propone nada.'
      };
    }
    return {
      veredicto: NC_VEREDICTO.ELEGIBLE,
      cumpleAscenso: true,
      detalle: textoAsc + '. Colíder: no sube de rango, queda elegible para administración.'
    };
  }

  // Descenso sin ninguna semana completa del jugador (ingreso tardio, sin filas el primer dia de guerra,
  // filas Reconstruido vetadas por Fecha_ing): no hay Descenso que evaluar y tampoco Expulsion.
  if (ctx.sinSemanasDesc) {
    return {
      veredicto: NC_VEREDICTO.MANTENER,
      detalle: 'No cumple Ascenso y ninguna de sus semanas cuenta para Descenso (no tuvo la semana completa): no se propone nada.' +
        (bloqueAsc && promAsc
          ? ' Ascenso: ' + _ncTextoRequisitoVsReal(bloqueAsc.minCR[rolKey], bloqueAsc.ataques[rolKey], promAsc) + '.'
          : '')
    };
  }

  // 2. Mantener rango
  if (bloqueDesc && promDesc && cumple(bloqueDesc, gD, promDesc)) {
    return {
      veredicto: NC_VEREDICTO.MANTENER,
      detalle: 'Supera Descenso pero no llega a Ascenso — Descenso: ' +
        _ncTextoRequisitoVsReal(bloqueDesc.minCR[rolKey], bloqueDesc.ataques[rolKey], promDesc) +
        (bloqueAsc && promAsc
          ? '. Ascenso: ' + _ncTextoRequisitoVsReal(bloqueAsc.minCR[rolKey], bloqueAsc.ataques[rolKey], promAsc) + '.'
          : '.')
    };
  }

  // 3 y 4. Por debajo de Descenso: Min_G decide entre Descenso y Expulsión.
  var promParaMinG = promDesc || promAsc;
  var fame = promParaMinG ? promParaMinG.fameProm : 0;
  if (fame < minGClan) {
    return {
      veredicto: NC_VEREDICTO.EXPULSION,
      detalle: 'Medallas promedio ' + _ncFmtNum(fame) + ', por debajo de Min_G (' + minGClan + ')' +
        (bloqueDesc && promDesc
          ? '. Descenso: ' + _ncTextoRequisitoVsReal(bloqueDesc.minCR[rolKey], bloqueDesc.ataques[rolKey], promDesc) + '.'
          : '.')
    };
  }
  return {
    veredicto: NC_VEREDICTO.DESCENSO,
    detalle: 'No alcanza los requisitos de Descenso' +
      (bloqueDesc && promDesc
        ? ' — ' + _ncTextoRequisitoVsReal(bloqueDesc.minCR[rolKey], bloqueDesc.ataques[rolKey], promDesc)
        : '') +
      '. Medallas promedio ' + _ncFmtNum(fame) + ', alcanza Min_G (' + minGClan + '), así que no corresponde expulsión.'
  };
}

// HELPERS COMPARTIDOS DE ESTE ARCHIVO [→ Contexto_Base_Web.md §29B020]

/**
 * _ncFmtNum(n) [→ Contexto_Base_Web.md §29B026]
 */
function _ncFmtNum(n) {
  var v = Number(n) || 0;
  var r = Math.round(v * 10) / 10;
  return String(r);
}

/**
 * _ncNombreRol(rolKey)
 * 'miembro'|'veterano'|'colider' -> etiqueta legible para el documento.
 */
function _ncNombreRol(rolKey) {
  if (rolKey === 'miembro')  return 'Miembro';
  if (rolKey === 'veterano') return 'Veterano';
  if (rolKey === 'colider')  return 'Colíder';
  return rolKey;
}

/**
 * _ncTextoRequisito(reqMinCR, reqAtaques) [→ Contexto_Base_Web.md §29B023]
 */
function _ncTextoRequisito(reqMinCR, reqAtaques) {
  var partes = [];
  partes.push('Medallas ' + (reqMinCR && reqMinCR.activo ? '>= ' + reqMinCR.qty : 'no exigido'));
  partes.push('Ataques ' + (reqAtaques && reqAtaques.activo ? '>= ' + reqAtaques.qty : 'no exigido'));
  return partes.join(', ');
}

/**
 * _ncTextoRequisitoVsReal(reqMinCR, reqAtaques, promedios) [→ Contexto_Base_Web.md §29B024]
 */
function _ncTextoRequisitoVsReal(reqMinCR, reqAtaques, promedios) {
  var partes = [];
  if (reqMinCR && reqMinCR.activo) {
    partes.push('Medallas ' + _ncFmtNum(promedios.fameProm) + ' (se pide ' + reqMinCR.qty + ')');
  }
  if (reqAtaques && reqAtaques.activo) {
    // 19-sep-2026: aviso de exoneración por domingo opcional, mismo criterio y [→ Contexto_Base_Web.md §29B025]
    var exentosTxt = (promedios && Number(promedios.ataquesExentos) > 0)
      ? ', ' + promedios.ataquesExentos + ' exonerados por domingo opcional'
      : '';
    partes.push('Ataques ' + _ncFmtNum(promedios.ataquesProm) + ' (se pide ' + reqAtaques.qty + exentosTxt + ')');
  }
  if (!partes.length) partes.push('sin requisitos activos para este rol/clan');
  return partes.join(', ');
}

/**
 * _ncEscribirDocumento(nombreDoc, titulo, requisitos, filas, resumen, textoSinFilas) [→ Contexto_Base_Web.md §29B021]
 */
function _ncEscribirDocumento(nombreDoc, titulo, requisitos, filas, resumen, textoSinFilas, estiloUniforme, idDoc, alAgregarSecciones) {
  var archivo;
  try {
    // Busca el documento existente (caché de ID -> nombre en las 6 carpetas de [→ Contexto_Base_Web.md §29B022]
    archivo = _buscarArchivoEnPlantillas(nombreDoc, idDoc); // idDoc (PF286): primero por id; si falla, por nombre como antes
  } catch (e) {
    Logger.log('[DocsNoCalificados] Error al buscar "' + nombreDoc + '": ' + e.message);
    return;
  }
  if (!archivo) {
    Logger.log('[DocsNoCalificados] No se encontró ni se pudo crear "' + nombreDoc + '". Se omite. ' +
      '(Revisar que el nombre esté registrado en _getMapaDocsReconstruibles(), 01_Config_Global.gs.)');
    return;
  }

  var doc;
  try {
    doc = DocumentApp.openById(archivo.getId());
  } catch (e2) {
    Logger.log('[DocsNoCalificados] Error al abrir "' + nombreDoc + '": ' + e2.message);
    return;
  }

  var body = doc.getBody();
  body.clear();

  _rdocParrafoTexto(body, titulo, true, DocumentApp.HorizontalAlignment.CENTER);
  _rdocParrafoTexto(body, 'Generado el ' + _ncFechaHoraPeru() + ' (hora de Perú).', false, DocumentApp.HorizontalAlignment.CENTER);
  _rdocParrafoTexto(body, '', false);

  _rdocParrafoTexto(body, 'Requisitos evaluados:', true, DocumentApp.HorizontalAlignment.JUSTIFY);
  if (requisitos && requisitos.length) {
    for (var i = 0; i < requisitos.length; i++) {
      _rdocParrafoTexto(body, '●      ' + requisitos[i], false, DocumentApp.HorizontalAlignment.JUSTIFY);
    }
  } else {
    _rdocParrafoTexto(body, '●      No había ningún requisito activo en esta corrida.', false, DocumentApp.HorizontalAlignment.JUSTIFY);
  }
  _rdocParrafoTexto(body, '', false);

  _rdocParrafoTexto(body, 'Resumen:', true, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, resumen, false, DocumentApp.HorizontalAlignment.JUSTIFY);
  _rdocParrafoTexto(body, '', false);

  var hayTabla = !!(filas && filas.length > 1);
  if (hayTabla) {
    // 23-oct-2026: los dos «No calificados» (torneo y sorteo) usan la tabla de encabezado negro;
    // el de Cambio de rango sigue con la tabla de siempre (estiloUniforme no se le pasa).
    if (estiloUniforme) _ncTablaEstiloOscuro(body, filas);
    else _rdocTablaConEncabezadoNegrita(body, filas);
  } else if (textoSinFilas) {
    _rdocParrafoTexto(body, textoSinFilas, false, DocumentApp.HorizontalAlignment.JUSTIFY);
  }

  // NUEVO (28-oct-2026, PF286): secciones propias de un documento (listas, tablas de requisitos, reglas) que se escriben después de la tabla o del texto de «sin filas».
  if (typeof alAgregarSecciones === 'function') {
    _rdocParrafoTexto(body, '', false);
    alAgregarSecciones(body);
  }

  doc.saveAndClose();

  // Los bordes de una sola fila no se pueden fijar con DocumentApp: van aparte, con la API de Docs.
  if (hayTabla && estiloUniforme) _ncBordesBlancosEncabezado_(archivo.getId(), filas[0].length);
}

/**
 * _ncFechaHoraPeru() [→ Contexto_Base_Web.md §29B027]
 */
function _ncFechaHoraPeru() {
  var tz = 'America/Lima';
  try {
    var tzSs = _getSs().getSpreadsheetTimeZone();
    if (tzSs) tz = tzSs;
  } catch (e) {
    // Sin acceso al spreadsheet: se queda con America/Lima.
  }
  return Utilities.formatDate(new Date(), tz, 'dd/MM/yyyy HH:mm');
}

/**
 * _ncTablaEstiloOscuro(body, filas)
 * Tabla de los documentos «No calificados»: todos los valores y encabezados centrados en
 * horizontal y en vertical; fila de encabezados con letras blancas en negrita y relleno negro.
 * Los bordes blancos del encabezado los pone _ncBordesBlancosEncabezado_() después de guardar.
 */
function _ncTablaEstiloOscuro(body, filas) {
  var tabla = body.appendTable(filas);
  for (var r = 0; r < tabla.getNumRows(); r++) {
    var fila = tabla.getRow(r);
    for (var c = 0; c < fila.getNumCells(); c++) {
      var celda = fila.getCell(c);
      celda.setVerticalAlignment(DocumentApp.VerticalAlignment.CENTER);
      for (var k = 0; k < celda.getNumChildren(); k++) {
        var hijo = celda.getChild(k);
        if (hijo.getType() === DocumentApp.ElementType.PARAGRAPH) {
          hijo.asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        }
      }
      if (r === 0) {
        celda.setBackgroundColor('#000000');
        celda.editAsText().setBold(true).setForegroundColor('#ffffff');
      }
    }
  }
  return tabla;
}

/**
 * _ncBordesBlancosEncabezado_(docId, numColumnas)
 * Pone bordes blancos a la fila de encabezados de la tabla del documento (API REST de Docs, con el
 * token del propio script; no hace falta activar ningún servicio avanzado, pero sí que la API de
 * Google Docs esté habilitada en el proyecto de Cloud). Si algo falla solo deja un registro: el
 * documento ya quedó escrito, solo sin los bordes blancos. Devuelve true si se aplicaron.
 */
function _ncBordesBlancosEncabezado_(docId, numColumnas) {
  try {
    var cab = { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() };
    var url = 'https://docs.googleapis.com/v1/documents/' + docId;
    var resp = UrlFetchApp.fetch(url, { headers: cab, muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) {
      Logger.log('[DocsNoCalificados] Bordes del encabezado: no se pudo leer el documento (HTTP ' +
        resp.getResponseCode() + '). ' + String(resp.getContentText()).substring(0, 200));
      return false;
    }
    var contenido = (JSON.parse(resp.getContentText()).body || {}).content || [];
    var inicioTabla = null;
    for (var i = 0; i < contenido.length; i++) {
      if (contenido[i].table) { inicioTabla = contenido[i].startIndex; break; }
    }
    if (inicioTabla === null) return false;
    var borde = {
      color: { color: { rgbColor: { red: 1, green: 1, blue: 1 } } },
      width: { magnitude: 1, unit: 'PT' },
      dashStyle: 'SOLID'
    };
    var cuerpo = { requests: [{ updateTableCellStyle: {
      tableRange: {
        tableCellLocation: { tableStartLocation: { index: inicioTabla }, rowIndex: 0, columnIndex: 0 },
        rowSpan: 1,
        columnSpan: numColumnas
      },
      tableCellStyle: { borderTop: borde, borderBottom: borde, borderLeft: borde, borderRight: borde },
      fields: 'borderTop,borderBottom,borderLeft,borderRight'
    } }] };
    var r2 = UrlFetchApp.fetch(url + ':batchUpdate', {
      method: 'post', contentType: 'application/json', headers: cab,
      payload: JSON.stringify(cuerpo), muteHttpExceptions: true
    });
    if (r2.getResponseCode() !== 200) {
      Logger.log('[DocsNoCalificados] Bordes del encabezado: la API de Docs respondió HTTP ' +
        r2.getResponseCode() + '. ' + String(r2.getContentText()).substring(0, 200));
      return false;
    }
    return true;
  } catch (e) {
    Logger.log('[DocsNoCalificados] Bordes del encabezado: ' + e.message);
    return false;
  }
}

// CONTENIDO BASE (solo para la reconstrucción automática) [→ Contexto_Base_Web.md §29B028]

function _construirContenidoDocNoCalificadosTorneo(body) {
  _ncContenidoBasePlaceholder(body, 'Participantes NO calificados (torneo)');
}

function _construirContenidoDocNoCalificadosSorteo(body) {
  _ncContenidoBasePlaceholder(body, 'Participantes NO calificados (sorteo)');
}

function _construirContenidoDocCambioRango(body) {
  _ncContenidoBasePlaceholder(body, 'Cambio de rango');
}

function _construirContenidoDocCalificadosCambioRango(body) {
  _ncContenidoBasePlaceholder(body, 'Participantes calificados (cambio de rango)');
}

function _construirContenidoDocNoCalificadosCambioRango(body) {
  _ncContenidoBasePlaceholder(body, 'Participantes NO calificados (cambio de rango)');
}

function _ncContenidoBasePlaceholder(body, titulo) {
  _rdocParrafoTexto(body, titulo, true, DocumentApp.HorizontalAlignment.CENTER);
  _rdocParrafoTexto(body, 'Documento generado automáticamente. Todavía no se ha ejecutado ninguna corrida: ' +
    'el contenido real (requisitos, resumen y tabla) se escribe completo la próxima vez que corra la ' +
    'función correspondiente de 29_Docs_NoCalificados.gs.', false, DocumentApp.HorizontalAlignment.JUSTIFY);
}
