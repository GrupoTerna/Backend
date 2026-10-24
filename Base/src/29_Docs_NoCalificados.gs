// ==============================================================================
// 29_Docs_NoCalificados.gs
// Documento en Drive que muestra a quienes no calificaron para un torneo, sorteo o cambio de rango.
// ==============================================================================

// NUEVO (15-sep-2026, pedido del usuario): [→ Contexto_Base_Web.md §29B001]

// ----- Variables y constantes -----

// Misma estructura de nombre que los documentos análogos de [→ Contexto_Base_Web.md §29B002]
var NOMBRE_DOC_NO_CALIFICADOS_TORNEO = 'No calificados (torneo) - Comunidad - ᴳ乂ᵀ ⚜️ Familia Terna';

var NOMBRE_DOC_NO_CALIFICADOS_SORTEO = 'No calificados (sorteo) - Comunidad - ᴳ乂ᵀ ⚜️ Familia Terna';

var NOMBRE_DOC_CAMBIO_RANGO = 'Cambio de rango - Comunidad - ᴳ乂ᵀ ⚜️ Familia Terna';

// Veredictos posibles del documento de Cambio de rango (ver
// _ncVeredictoCambioRango() más abajo para la regla exacta de cada uno).
var NC_VEREDICTO = {
  ASCENSO:   'Ascenso',
  ELEGIBLE:  'Elegible para administración',
  MANTENER:  'Mantener rango',
  DESCENSO:  'Descenso',
  EXPULSION: 'Expulsión'
};

// ----- Funciones manuales / punto de entrada -----

/**
 * actualizarDocsNoCalificadosYCambioRango() [→ Contexto_Base_Web.md §29B003]
 */
function actualizarDocsNoCalificadosYCambioRango() {
  actualizarDocNoCalificadosTorneo();
  actualizarDocNoCalificadosSorteo();
  actualizarDocCambioRango();
}

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
    requisitos, filas, resumen, 'Todas las cuentas evaluadas calificaron: no hay nadie que listar en esta corrida.', true);

  Logger.log('[NoCalificados-Torneo] ' + resumen);
}

// NO CALIFICADOS — SORTEO [→ Contexto_Base_Web.md §29B006]

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
    ev.requisitos, filas, resumen, 'Todas las cuentas evaluadas calificaron: no hay nadie que listar en esta corrida.', true);

  Logger.log('[NoCalificados-Sorteo] ' + resumen);
}

// CAMBIO DE RANGO — documento general [→ Contexto_Base_Web.md §29B009]

/**
 * actualizarDocCambioRango(idAscenso, idDescenso) [→ Contexto_Base_Web.md §29B010]
 */
function actualizarDocCambioRango(idAscenso, idDescenso) {
  var idA = idAscenso || _getIdVigenteExtraCR('Ascenso');
  var idD = idDescenso || _getIdVigenteExtraCR('Descenso');
  if (!idA || !idD) {
    Logger.log('[CambioRango-Doc] ABORT: falta el par de CR_Lista (Ascenso=' + (idA || 'vacío') +
      ', Descenso=' + (idD || 'vacío') + '). Configurar Extra!Ascenso_Vigente_ID/Descenso_Vigente_ID ' +
      'o pasar ambos IDs a mano.');
    return;
  }

  var filaAscenso  = _getFilaCRListaPorId(idA);
  var filaDescenso = _getFilaCRListaPorId(idD);
  if (!filaAscenso || !filaDescenso) {
    Logger.log('[CambioRango-Doc] ABORT: no encontré una o ambas filas de CR_Lista (' + idA + ' / ' + idD + ').');
    return;
  }

  // Misma validación que _calcularPropuestasCambioRango(): si Ascenso y [→ Contexto_Base_Web.md §29B011]
  var coherencia = _validarCoherenciaCRLista(filaAscenso, filaDescenso);
  if (!coherencia.ok) {
    Logger.log('[CambioRango-Doc] ABORT: CR_Lista tiene requisitos incoherentes entre Ascenso y Descenso (' +
      idA + ' / ' + idD + '): ' + coherencia.errores.join(' | '));
    return;
  }

  var ss = _getSs();
  var ctxReal = _getCtx();

  // CAMBIO (29-sep-2026, pedido de la usuaria, opcion B): misma regla que [→ Contexto_Base_Web.md §29B012]
  var pendientesAsc  = _semanasPendientesCR(filaAscenso.semanas, ctxReal);
  var pendientesDesc = _semanasPendientesCR(filaDescenso.semanas, ctxReal);
  if (pendientesAsc.length || pendientesDesc.length) {
    Logger.log('[CambioRango-Doc] ABORT: la corrida evalúa semanas que todavía no terminan: ' +
      _textoSemanasPendientesCR(pendientesAsc.length ? pendientesAsc : pendientesDesc));
    return;
  }
  if (!filaAscenso.semanas.length || !filaDescenso.semanas.length) {
    Logger.log('[CambioRango-Doc] ABORT: la corrida no tiene semanas que evaluar.');
    return;
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
  var requisitos = [];
  requisitos.push('Par de CR_Lista evaluado: Ascenso ' + idA + ' / Descenso ' + idD + '.');
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
    ['miembro', 'veterano', 'colider'].forEach(function (rol) {
      requisitos.push(b.clan + ' — ' + _ncNombreRol(rol) + ': ' +
        'ASCENSO ' + _ncTextoRequisito(b.minCR[rol], b.ataques[rol]) + ' | ' +
        'DESCENSO ' + (bd ? _ncTextoRequisito(bd.minCR[rol], bd.ataques[rol]) : 'sin fila de Descenso para este clan') + '.');
    });
    requisitos.push(b.clan + ' — Min_G (umbral de expulsión, sobre medallas promedio): ' +
      (minGPorNombreClan[b.clan] !== undefined ? minGPorNombreClan[b.clan] : CFG.MIN_G_DEFAULT) + '.');
  });
  requisitos.push('Descenso: solo cuentan las semanas completas de cada jugador (con fila el primer día de ' +
    'guerra); si ninguna cuenta, no se evalúa el Descenso y queda en Mantener rango. Ascenso: todas las semanas evaluadas.');
  requisitos.push('Veredictos: ASCENSO si cumple los requisitos de Ascenso; MANTENER RANGO si supera ' +
    'los de Descenso pero no llega a los de Ascenso; DESCENSO si queda por debajo de los de Descenso ' +
    'pero alcanza Min_G; EXPULSIÓN si queda por debajo de Min_G. Se evalúan en ese orden y el primero ' +
    'que coincide es el veredicto. Un Colíder que cumple los requisitos de Ascenso no sube de rango: ' +
    'queda marcado como elegible para administración.');

  // --- Recorrido del padrón (mismo criterio que _calcularPropuestasCambioRango) ---
  var dataDir = _leerDirectorioFisicoComoDC(ss);
  var filas = [['Nombre', 'Clan', 'Rango actual', 'Medallas (prom.)', 'Ataques (prom.)', 'Veredicto', 'Detalle']];
  var conteo = {};
  var totalEvaluados = 0;

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

    totalEvaluados++;
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

    conteo[veredicto.veredicto] = (conteo[veredicto.veredicto] || 0) + 1;
    filas.push([
      String(fila[DC.NOMBRE - 1] || ''),
      clan,
      rangoActual,
      _ncFmtNum(promMostrado ? promMostrado.fameProm : 0),
      _ncFmtNum(promMostrado ? promMostrado.ataquesProm : 0),
      veredicto.veredicto,
      veredicto.detalle
    ]);
  }

  var partesResumen = [];
  Object.keys(conteo).forEach(function (k) { partesResumen.push(k + ': ' + conteo[k]); });
  var resumen = totalEvaluados + ' cuenta(s) evaluada(s). ' +
    (partesResumen.length ? partesResumen.join(' | ') + '.' : 'Ninguna con veredicto.');

  _ncEscribirDocumento(NOMBRE_DOC_CAMBIO_RANGO, 'Cambio de rango',
    requisitos, filas, resumen, 'No hay ninguna cuenta evaluable con este par de CR_Lista.');

  Logger.log('[CambioRango-Doc] ' + resumen);
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
      return { veredicto: NC_VEREDICTO.ASCENSO, detalle: textoAsc + '.' };
    }
    // Colider (28-sep-2026, igual que _calcularPropuestasCambioRango()): de una cantera sube de clan y
    // llega como Miembro; el del clan principal solo es elegible para admin, salvo que ya lo sea.
    if (ctx.clanDestinoColider) {
      return {
        veredicto: NC_VEREDICTO.ASCENSO,
        detalle: textoAsc + '. Colíder de cantera: sube al clan ' + ctx.clanDestinoColider + ' y llega como Miembro.'
      };
    }
    if (ctx.yaEsAdmin) {
      return {
        veredicto: NC_VEREDICTO.MANTENER,
        detalle: textoAsc + '. Colíder del clan principal que ya es admin: no se propone nada.'
      };
    }
    return {
      veredicto: NC_VEREDICTO.ELEGIBLE,
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
 * _ncEscribirDocumento(nombreDoc, titulo, requisitos, filas, resumen, textoSinFilas) [→ Contexto_Base_Web.md §29B021]
 */
function _ncEscribirDocumento(nombreDoc, titulo, requisitos, filas, resumen, textoSinFilas, estiloUniforme) {
  var archivo;
  try {
    // Busca el documento existente (caché de ID -> nombre en las 6 carpetas de [→ Contexto_Base_Web.md §29B022]
    archivo = _buscarArchivoEnPlantillas(nombreDoc);
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
  } else {
    _rdocParrafoTexto(body, textoSinFilas, false, DocumentApp.HorizontalAlignment.JUSTIFY);
  }

  doc.saveAndClose();

  // Los bordes de una sola fila no se pueden fijar con DocumentApp: van aparte, con la API de Docs.
  if (hayTabla && estiloUniforme) _ncBordesBlancosEncabezado_(archivo.getId(), filas[0].length);
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
 * _ncFmtNum(n) [→ Contexto_Base_Web.md §29B026]
 */
function _ncFmtNum(n) {
  var v = Number(n) || 0;
  var r = Math.round(v * 10) / 10;
  return String(r);
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

function _ncContenidoBasePlaceholder(body, titulo) {
  _rdocParrafoTexto(body, titulo, true, DocumentApp.HorizontalAlignment.CENTER);
  _rdocParrafoTexto(body, 'Documento generado automáticamente. Todavía no se ha ejecutado ninguna corrida: ' +
    'el contenido real (requisitos, resumen y tabla) se escribe completo la próxima vez que corra la ' +
    'función correspondiente de 29_Docs_NoCalificados.gs.', false, DocumentApp.HorizontalAlignment.JUSTIFY);
}