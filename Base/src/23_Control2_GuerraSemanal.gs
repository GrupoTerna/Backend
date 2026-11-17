// 23_Control2_GuerraSemanal.gs
// Hoja Control_2: resumen semanal de guerra por miembro.
// 23_Control2_GuerraSemanal.gs [→ Contexto_Base_Web.md §23B001]

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 27-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Hoja Control2: actualizar y respaldar
//  Parte 2 — Funciones que no se corren a mano
//    - Control2: formato (lo usa actualizarControl2)
//    - Control2: armado de la cuadrícula de una fila (lo usa actualizarControl2)
//    - Control2: restaurar la hoja si no existe (lo usa RUNALL)
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

// Índices de columna (1-based) — Control_2. [→ Contexto_Base_Web.md §23B002]
var CC2 = {
  NUM: 1, TAG: 2, NOMBRE: 3, NOM_MULTI: 4, CLAN: 5, RANGO: 6, INICIALES: 7,
  CELULAR: 8, V_GUERRA: 9, INACTIVIDAD: 10, ALERTA: 11, ATAQ_PEND: 12, ASCENSO: 13,
  CLAN_TAG: 34, // 6-nov-2026 (tanda 7, Clanes por Tag): va AL FINAL, despues de la cuadricula (CC2_TOTAL_FIJAS + GRID_WIDTH2 + 1), para no mover ninguna columna existente
  ESTADO: 35 // 17-nov-2026 (tanda 13a): «Activo» o «Inactivo» de la fila (clan donde el jugador esta presente segun el Directorio); va AL FINAL, junto a Clan_Tag, para no mover ninguna columna existente
};

var CC2_TOTAL_FIJAS = 13;

var COL_INICIO_GRID2 = 14;

var GRID_WIDTH2 = 20;

// Offsets 0-based dentro de la cuadrícula de 20 columnas, relativos a [→ Contexto_Base_Web.md §23B003]
var OFF2 = {
  ATA: 0,  ATA_TOTAL: 5,  ATA_PCT: 6,    // Ataques: 7 cols (Tₛ1-5, Total, %)
  PUN: 7,  PUN_PROM: 12,  PUN_PCT: 13,   // Puntaje: 7 cols (Tₛ1-5, Prom, %)
  BAR: 14, BAR_TOTAL: 19                  // Barcos:  6 cols (Tₛ1-5, Total)
};

// PARTE 0 — Reconstrucción de Control_2 tras Demoler [→ Contexto_Base_Web.md §23B004]

// Métricas del grid de Control_2: mismo concepto que CONTROL_METRICAS [→ Contexto_Base_Web.md §23B005]
var CONTROL2_METRICAS = [
  { nombre: 'Ataques', ancho: 7, extras: ['Total', '%'] },
  { nombre: 'Puntaje', ancho: 7, extras: ['Prom', '%'] },
  { nombre: 'Barcos',  ancho: 6, extras: ['Total'] }
];

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Hoja Control2: actualizar y respaldar -----

/**
 * actualizarControl2() [→ Contexto_Base_Web.md §23B006]
 */
function actualizarControl2() {
  var ss = _getSs();
  var sh = ss.getSheetByName('Control_2');
  if (!sh) { Logger.log('[Control_2] Hoja "Control_2" no encontrada.'); return; }

  var ctxReal = _getCtx();
  if (ctxReal.periodIndexSospechoso) {
    Logger.log('[Control_2] ABORT: periodIndex sospechoso, no se reconstruye esta corrida.');
    return;
  }

  // Temporada a mostrar: Extra!Mostrar (G2) si tiene valor numérico válido,
  // si no, la temporada real vigente (comportamiento por defecto pedido).
  var temporadaMostrar = ctxReal.temporada;
  var shExtra = ss.getSheetByName(CFG.SHEETS.EXTRA);
  if (shExtra) {
    var mostrarVal = shExtra.getRange(2, 7).getValue(); // G2 = Mostrar
    var temporadaExtra = Number(mostrarVal);
    if (temporadaExtra) temporadaMostrar = temporadaExtra;
  }

  var ctx = _clonarCtxParaTemporada(ctxReal, temporadaMostrar);

  // FIX (12-ago-2026): SE QUITA por completo el guardián de CACHE_CLAN_DATA [→ Contexto_Base_Web.md §23B007]

  var lastRow = sh.getLastRow();
  if (lastRow >= 4) {
    sh.getRange(4, 1, lastRow - 3, sh.getLastColumn()).clearContent();
  }

  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!shDir || shDir.getLastRow() < 2) {
    Logger.log('[Control_2] ABORT: Directorio no existe o todavía no tiene filas (getLastRow() < 2) — ' +
      'Control_2 queda con encabezados pero SIN datos hasta la próxima corrida (normal justo después de ' +
      'un Demoler, si esta llamada corrió ANTES de updateDirectorioSheet() en la misma tanda de runAll()).');
    return;
  }

  var dirData = _leerDirectorioFisicoComoDC(ss);
  var jugadores = dirData.filter(function (r) {
    return String(r[DC.ESTADO - 1]) === 'Activo' &&
           CFG.TERNA_TAGS.indexOf(String(r[DC.CLAN_TAG - 1])) >= 0;
  });
  if (jugadores.length === 0) {
    Logger.log('[Control_2] ABORT: Directorio tiene ' + shDir.getLastRow() + ' fila(s), pero ninguna es ' +
      'Activo + clan Terna — Control_2 queda con encabezados pero SIN datos hasta la próxima corrida.');
    return;
  }

  var guerraData = _getDatosGuerraParaControl(ctx, ctxReal.temporada); // por jugador y SUMADO entre clanes: alimenta «Ataques pendientes» y la fila de quien tiene un solo clan
  var agregadosAscensoPorTag = _getAgregadosAscensoPorTag();
  var numSemanasTemporada = lunesEnMes(ctx.mesEfectivoAnio, ctx.mesEfectivoMes) || 4;
  var mapasMinG = _getMinGClanMaps(); // 6-nov-2026 (tanda 7b-1): el Min_G se busca por Tag del clan y, de respaldo, por nombre
  var minGPorTagClan = mapasMinG.byTag;
  var minGPorNombreClan = mapasMinG.byNombre;

  // Overlay de correcciones desde RoyaleAPI (ver 18_CorreccionGuerra.gs). [→ Contexto_Base_Web.md §23B008]
  // 17-nov-2026 (tanda 13a): se lee UNA vez por clan (overlayCrudo, clave 'temporada|semana|clanTag|tag') y se agrupa por jugador (overlayGuerra, clave 'temporada|semana|tag', suma entre clanes, igual que antes).
  var overlayCrudo = _cargarOverlayCorreccionesGuerraPorClan();
  var overlayGuerra = _agruparOverlayCorreccionesGuerra_(overlayCrudo);

  // TANDA 13a (17-nov-2026; Consolidado_Clanes_por_Tag.md, tanda 13, P7): una fila por jugador Y por clan con registros esa temporada, cada una con el clan de sus
  // registros y la columna Estado («Activo» solo en el clan donde el jugador está presente según el Directorio; «Inactivo» en los demás). Ascenso, Días inactivo y Alerta
  // son del jugador y se repiten iguales en todas sus filas. Un jugador con registros en un solo clan sale con una sola fila, igual que antes.
  var clanActualPorTag = {}; // tag del jugador -> Tag de su clan actual (Directorio)
  for (var ja = 0; ja < jugadores.length; ja++) {
    clanActualPorTag[String(jugadores[ja][DC.TAG - 1] || '').trim()] = _normalizarClanTagCorreccion(jugadores[ja][DC.CLAN_TAG - 1]);
  }
  var guerraPorClan = _procesarFilasGuerraParaControlPorClan_(_getFilasGuerraTemporadaParaControl_(ctx, ctxReal.temporada), ctx, clanActualPorTag);
  var clanesOverlayPorTag = {}; // tag del jugador -> { clanTag: true } con una corrección de RoyaleAPI de un clan Terna esa temporada
  var clavesOverlay = Object.keys(overlayCrudo);
  for (var co = 0; co < clavesOverlay.length; co++) {
    var pOv = clavesOverlay[co].split('|'); // temporada | semana | clantag | tag
    if (pOv.length !== 4 || pOv[0] !== String(ctx.temporada) || !pOv[2] || CFG.TERNA_TAGS.indexOf(pOv[2]) < 0) continue;
    var eOv = overlayCrudo[clavesOverlay[co]];
    if (!(Number(eOv.ataquesSemana) > 0 || Number(eOv.fame) > 0 || Number(eOv.barcos) > 0)) continue; // una corrección en ceros no abre una fila
    if (!clanesOverlayPorTag[pOv[3]]) clanesOverlayPorTag[pOv[3]] = {};
    clanesOverlayPorTag[pOv[3]][pOv[2]] = true;
  }
  var nombresClanTerna = {}; // Tag del clan Terna -> nombre vigente (para el nombre de las filas «Inactivo»)
  try { nombresClanTerna = _mapaNombresClanTerna_(CFG.TERNA_TAGS.slice()); } catch (eNomC) { nombresClanTerna = {}; }

  var fixedRows = [];
  var gridRows = [];
  var tagClanRows = []; // 6-nov-2026 (tanda 7): Clan_Tag de cada fila, en la columna CC2.CLAN_TAG (al final)
  var estadoRows = [];  // 17-nov-2026 (tanda 13a): Estado de cada fila, en la columna CC2.ESTADO (al final, junto a Clan_Tag)
  var numFila = 0;

  for (var i = 0; i < jugadores.length; i++) {
    var jug = jugadores[i];
    var tagJug = String(jug[DC.TAG - 1] || '').trim();
    var gd = guerraData[tagJug];
    var clanTagActual = clanActualPorTag[tagJug];

    var agregAsc = agregadosAscensoPorTag[tagJug] || {};
    var ascensoVal = _evaluarRequisitosAscenso(
      jug[DC.RANGO - 1], agregAsc.ataqPct, agregAsc.puntProm, agregAsc.barcoTotal
    );

    // "Ataques pendientes" (pendCol) depende del día EN CURSO, que solo [→ Contexto_Base_Web.md §23B012]
    var pendCol = '';
    if (String(ctx.temporada) === String(ctxReal.temporada)) {
      var ataqCacheMap = _getAtaquesHoyCache();
      var ataqCacheHoy = ataqCacheMap[tagJug] || 0;
      var offDiaHoy = (ctx.periodIndex % 7) - 3;
      var diaDataHoy = (gd && gd[ctx.sectionIndex]) ? gd[ctx.sectionIndex]['dia_' + offDiaHoy] : null;
      var ataqGuerraHoy = diaDataHoy ? (diaDataHoy.ataques || 0) : 0;
      var ataqHoy = Math.max(ataqCacheHoy, ataqGuerraHoy);
      pendCol = (ctx.esDiaGuerra && ataqHoy < 4) ? 'Si' : '';
    }

    // Clanes con fila: el clan actual (siempre) y los clanes Terna donde el jugador tiene registros esa temporada (Guerra o correcciones de RoyaleAPI).
    // Primero el clan actual (Activo) y después los demás, en el orden de CFG.TERNA_TAGS.
    var clanesJug = {};
    clanesJug[clanTagActual] = true;
    var porClanJug = guerraPorClan[tagJug] || {};
    for (var ctG in porClanJug) { if (CFG.TERNA_TAGS.indexOf(ctG) >= 0) clanesJug[ctG] = true; }
    var clanesOverlayJug = clanesOverlayPorTag[tagJug] || {};
    for (var ctO in clanesOverlayJug) clanesJug[ctO] = true;
    var clanesFila = Object.keys(clanesJug).sort(function (a, b) {
      if (a === clanTagActual) return -1;
      if (b === clanTagActual) return 1;
      return CFG.TERNA_TAGS.indexOf(a) - CFG.TERNA_TAGS.indexOf(b);
    });
    var variasFilas = clanesFila.length > 1;

    for (var f = 0; f < clanesFila.length; f++) {
      var clanTagFila = clanesFila[f];
      var esActivo = (clanTagFila === clanTagActual);
      var nombreClanFila = esActivo ? jug[DC.CLAN - 1] : (nombresClanTerna[clanTagFila] || clanTagFila);
      var minGFila = (clanTagFila && minGPorTagClan[clanTagFila] !== undefined ? minGPorTagClan[clanTagFila] : minGPorNombreClan[nombreClanFila]) || CFG.MIN_G_DEFAULT;

      // Con una sola fila: los datos sumados y las correcciones por jugador, exactamente como antes. Con varias: los datos y las correcciones de ESE clan.
      var gdFila = variasFilas ? (porClanJug[clanTagFila] || null) : gd;
      var correccionDeSemana = function (sem0) {
        var claveSem = ctx.temporada + '|' + (sem0 + 1) + '|';
        return variasFilas ? overlayCrudo[claveSem + clanTagFila + '|' + tagJug] : overlayGuerra[claveSem + tagJug];
      };

      var gridFila = _calcularGridControl2_(gdFila, ctx, numSemanasTemporada, correccionDeSemana, minGFila);

      numFila++;
      fixedRows.push([
        numFila, tagJug, jug[DC.NOMBRE - 1], jug[DC.NOM_MULTI - 1], nombreClanFila,
        jug[DC.RANGO - 1], jug[DC.INICIALES - 1], jug[DC.CELULAR - 1], jug[DC.V_GUERRA - 1],
        jug[DC.INACTIVIDAD - 1], jug[DC.ALERTA - 1], esActivo ? pendCol : '', ascensoVal // «Ataques pendientes» solo en la fila Activo; Ascenso, Inactividad y Alerta iguales en todas
      ]);
      gridRows.push(gridFila);
      tagClanRows.push([clanTagFila]); // 6-nov-2026 (tanda 7): el Tag sale del Directorio (clan actual) o de los registros (los demás clanes)
      estadoRows.push([esActivo ? 'Activo' : 'Inactivo']);
    }
  }

  // FIX (15-ago-2026, pedido usuario: "Control_2 solo actualiza hasta la [→ Contexto_Base_Web.md §23B013]
  // 6-nov-2026 (tanda 7): la hoja ya existente puede no tener la columna Clan_Tag; se agrega (idempotente) antes de escribir.
  _asegurarColumnaClanTagControl2_(sh);
  _asegurarColumnaEstadoControl2_(sh); // 17-nov-2026 (tanda 13a): igual con la columna Estado
  if (fixedRows.length > 0 && sh.getMaxRows() < 3 + fixedRows.length) {
    sh.insertRowsAfter(sh.getMaxRows(), 3 + fixedRows.length - sh.getMaxRows()); // con una fila por clan puede haber más filas que jugadores
  }

  if (fixedRows.length > 0) {
    sh.getRange(4, 1, fixedRows.length, CC2_TOTAL_FIJAS).setValues(fixedRows);
  }

  if (tagClanRows.length > 0) {
    sh.getRange(4, CC2.CLAN_TAG, tagClanRows.length, 1).setValues(tagClanRows);
    applyBorderCenter(sh.getRange(4, CC2.CLAN_TAG, tagClanRows.length, 1));
  }

  if (estadoRows.length > 0) {
    sh.getRange(4, CC2.ESTADO, estadoRows.length, 1).setValues(estadoRows);
    applyBorderCenter(sh.getRange(4, CC2.ESTADO, estadoRows.length, 1));
  }

  if (gridRows.length > 0) {
    sh.getRange(4, COL_INICIO_GRID2, gridRows.length, GRID_WIDTH2).setValues(gridRows);
  }

  if (fixedRows.length > 0) {
    sh.getRange(4, CC2.V_GUERRA,    fixedRows.length, 1).setNumberFormat('#,##0');
    sh.getRange(4, CC2.INACTIVIDAD, fixedRows.length, 1).setNumberFormat('#,##0');
    sh.getRange(4, CC2.CELULAR,     fixedRows.length, 1).setNumberFormat('### ### ### ###');
  }

  if (gridRows.length > 0) {
    sh.getRange(4, COL_INICIO_GRID2 + OFF2.ATA_TOTAL, gridRows.length, 1).setNumberFormat('#,##0');
    sh.getRange(4, COL_INICIO_GRID2 + OFF2.ATA_PCT,   gridRows.length, 1).setNumberFormat('0%');
    sh.getRange(4, COL_INICIO_GRID2 + OFF2.PUN_PROM,  gridRows.length, 1).setNumberFormat('#,##0');
    sh.getRange(4, COL_INICIO_GRID2 + OFF2.PUN_PCT,   gridRows.length, 1).setNumberFormat('0%');
    sh.getRange(4, COL_INICIO_GRID2 + OFF2.BAR_TOTAL, gridRows.length, 1).setNumberFormat('#,##0');
    applyBorderCenter(sh.getRange(4, 1, fixedRows.length, CC2_TOTAL_FIJAS + GRID_WIDTH2));
  }

  // FIX (03-ago-2026): formato condicional de Control_2, con las MISMAS [→ Contexto_Base_Web.md §23B014]
  _aplicarFmtCondicionalControl2(sh, fixedRows.length);

  // FIX (16-ago-2026): Control_2 tiene el MISMO esquema de encabezado que [→ Contexto_Base_Web.md §23B015]
  _limpiarLinksAccidentalesEnHoja(sh, 3);

  Logger.log('[Control_2] Actualizado — temporada ' + ctx.temporada +
    (String(ctx.temporada) === String(ctxReal.temporada) ? ' (real vigente).' : ' (vía Extra!Mostrar).') +
    ' Jugadores: ' + jugadores.length + ' · filas (una por jugador y clan): ' + fixedRows.length);
}

// PARTE 2 — CSV semanal "inverso" de Guerra [→ Contexto_Base_Web.md §23B016]

/**
 * generarBackupGuerraSemanalCSV() [→ Contexto_Base_Web.md §23B017]
 */
function generarBackupGuerraSemanalCSV() {
  var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
  if (!csvText) {
    Logger.log('[GuerraSemanal] No se encontró Backup_Guerra.csv. Nada que agregar.');
    return;
  }

  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length < 2) {
    Logger.log('[GuerraSemanal] Backup_Guerra.csv vacío o sin filas de datos.');
    return;
  }

  var encabezado = parsed[0];
  var filas = parsed.slice(1);

  // Overlay de correcciones desde RoyaleAPI (ver 18_CorreccionGuerra.gs). [→ Contexto_Base_Web.md §23B018]
  var overlayGuerra = _cargarOverlayCorreccionesGuerra();

  // Agrupar por Temporada|Semana|Tag
  var grupos = {}; // clave -> array de filas (arrays de strings, como vienen del CSV)
  var ordenClaves = [];
  for (var i = 0; i < filas.length; i++) {
    var f = filas[i];
    var temporada = String(f[GC.TEMPORADA - 1] || '').trim();
    var semana    = String(f[GC.SEMANA - 1]    || '').trim();
    var tag       = String(f[GC.TAG - 1]       || '').trim();
    if (!temporada || !semana || !tag) continue;

    var clave = temporada + '|' + semana + '|' + tag;
    if (!grupos[clave]) { grupos[clave] = []; ordenClaves.push(clave); }
    grupos[clave].push(f);
  }

  var filasSalida = [];
  var num = 1;
  for (var g = 0; g < ordenClaves.length; g++) {
    var grupo = grupos[ordenClaves[g]];

    // Fila "más reciente" del grupo (mayor PeriodIndex): fuente de
    // Clan/Nombre/Fecha/DiaGuerra/Etapa/PeriodIndex/Donaciones/Ranking.
    var filaMasReciente = grupo[0];
    var periodIndexMax = Number(filaMasReciente[GC.PERIOD_IDX - 1]) || 0;
    for (var k = 1; k < grupo.length; k++) {
      var pIdx = Number(grupo[k][GC.PERIOD_IDX - 1]) || 0;
      if (pIdx > periodIndexMax) {
        periodIndexMax = pIdx;
        filaMasReciente = grupo[k];
      }
    }

    var sumaAtaques = 0;
    var maxFame = 0;
    var maxBarcos = 0;
    // NUEVO (3-oct-2026, parte 54, sub-tanda 3.4): maximo de fame y de barcos por clan, para sumar entre
    // clanes si el jugador estuvo en 2 o mas clanes esa semana (ver CONTROL_SUMA_ENTRE_CLANES, 19_).
    var maxFamePorClan = {}, maxBarcosPorClan = {}, hayFilaSinClan = false;
    // §PF427 (8-nov-2026): los ataques solo se miran en filas de Etapa 'Guerra' (criterio 15 de §PF160). Entrenamiento es práctica:
    // da oro pero no fame y sus ataques no son obligatorios; sus filas traen AtaquesHoy pero AtaquesSemana en 0 o arrastrado de la semana anterior.
    var maxAtaSemPorClan = {};
    for (var k = 0; k < grupo.length; k++) {
      var esGuerraK = String(grupo[k][GC.ETAPA - 1] || '').trim() === 'Guerra';
      if (esGuerraK) sumaAtaques += Number(grupo[k][GC.ATAQUES_HOY - 1]) || 0;
      var fameK = Number(grupo[k][GC.FAME - 1]) || 0;
      if (fameK > maxFame) maxFame = fameK;
      var barcosK = Number(grupo[k][GC.BARCOS - 1]) || 0;
      if (barcosK > maxBarcos) maxBarcos = barcosK;
      var claveClanK = String(grupo[k][GC.CLAN - 1] || '').trim().toLowerCase();
      if (!claveClanK) hayFilaSinClan = true;
      if (!(claveClanK in maxFamePorClan) || fameK > maxFamePorClan[claveClanK]) maxFamePorClan[claveClanK] = fameK;
      if (!(claveClanK in maxBarcosPorClan) || barcosK > maxBarcosPorClan[claveClanK]) maxBarcosPorClan[claveClanK] = barcosK;
      if (esGuerraK) {
        var ataSemK = Number(grupo[k][GC.ATAQUES_SEM - 1]) || 0;
        if (!(claveClanK in maxAtaSemPorClan) || ataSemK > maxAtaSemPorClan[claveClanK]) maxAtaSemPorClan[claveClanK] = ataSemK;
      }
    }
    var clavesClanGrupo = Object.keys(maxFamePorClan);
    if (CONTROL_SUMA_ENTRE_CLANES && !hayFilaSinClan && clavesClanGrupo.length >= 2) {
      maxFame = 0; maxBarcos = 0;
      clavesClanGrupo.forEach(function (c) { maxFame += maxFamePorClan[c]; maxBarcos += maxBarcosPorClan[c]; });
    }

    // §PF427 (8-nov-2026): sin corrección, los ataques de la semana salen del ACUMULADO (AtaquesSemana) y no de la suma de AtaquesHoy, que da menos si falta
    // la fila de un día (criterio 1 de §PF160). AtaquesSemana es por clan: máximo por clan y, con 2 o más clanes (mismo interruptor que fame y barcos), suma entre clanes.
    // Si hay filas sin clan o el interruptor está apagado con 2 o más clanes, se conserva la suma de AtaquesHoy, pero solo de filas de Guerra.
    var clavesAtaGrupo = Object.keys(maxAtaSemPorClan);
    var ataquesSinCorreccion = sumaAtaques;
    if (clavesAtaGrupo.length === 1) {
      ataquesSinCorreccion = maxAtaSemPorClan[clavesAtaGrupo[0]];
    } else if (clavesAtaGrupo.length >= 2 && CONTROL_SUMA_ENTRE_CLANES && !hayFilaSinClan) {
      ataquesSinCorreccion = 0;
      clavesAtaGrupo.forEach(function (c) { ataquesSinCorreccion += maxAtaSemPorClan[c]; });
    }

    var filaSalida = new Array(GUERRA_TOTAL_COLS).fill('');
    filaSalida[GC.NUM        - 1] = num++;
    filaSalida[GC.FECHA      - 1] = filaMasReciente[GC.FECHA - 1];
    filaSalida[GC.TEMPORADA  - 1] = filaMasReciente[GC.TEMPORADA - 1];
    filaSalida[GC.SEMANA     - 1] = filaMasReciente[GC.SEMANA - 1];
    // FIX (03-ago-2026): antes se dejaba vacío ("no aplica a un registro [→ Contexto_Base_Web.md §23B019]
    filaSalida[GC.DIA        - 1] = filaMasReciente[GC.DIA - 1];
    filaSalida[GC.PERIOD_IDX - 1] = periodIndexMax;
    filaSalida[GC.DIA_GUERRA - 1] = filaMasReciente[GC.DIA_GUERRA - 1];
    filaSalida[GC.ETAPA      - 1] = filaMasReciente[GC.ETAPA - 1];
    filaSalida[GC.CLAN       - 1] = filaMasReciente[GC.CLAN - 1];
    filaSalida[GC.TAG        - 1] = filaMasReciente[GC.TAG - 1];
    filaSalida[GC.NOMBRE     - 1] = filaMasReciente[GC.NOMBRE - 1];
    // Corrección RoyaleAPI (si existe una para este mismo grupo): reemplaza [→ Contexto_Base_Web.md §23B020]
    var correccion = overlayGuerra[ordenClaves[g]];
    var ataquesFinal = correccion ? correccion.ataquesSemana : ataquesSinCorreccion;
    var fameFinal    = correccion ? correccion.fame          : maxFame;
    var barcosFinal  = (correccion && correccion.barcos !== null && correccion.barcos !== undefined)
      ? correccion.barcos
      : maxBarcos;

    filaSalida[GC.ATAQUES_HOY - 1] = ataquesFinal;
    filaSalida[GC.ATAQUES_SEM - 1] = ataquesFinal;
    filaSalida[GC.FAME       - 1] = fameFinal;
    filaSalida[GC.BARCOS     - 1] = barcosFinal;
    filaSalida[GC.DON_R      - 1] = filaMasReciente[GC.DON_R - 1];
    filaSalida[GC.DON_D      - 1] = filaMasReciente[GC.DON_D - 1];
    filaSalida[GC.RANKING    - 1] = filaMasReciente[GC.RANKING - 1];
    filaSalida[GC.COPAS      - 1] = filaMasReciente[GC.COPAS - 1]; // 12-oct-2026
    // Temporada_2 / Origen (punto 1.4/1.5): mismo criterio que
    // Clan/Nombre — del día con mayor PeriodIndex del grupo.
    filaSalida[GC.TEMPORADA_2 - 1] = filaMasReciente[GC.TEMPORADA_2 - 1];
    filaSalida[GC.ORIGEN      - 1] = filaMasReciente[GC.ORIGEN - 1];

    filasSalida.push(filaSalida);
  }

  var salida = [encabezado].concat(filasSalida);
  _saveCSVToDrive('Backup_Guerra_Semanal.csv', _encodeCSV(salida));

  Logger.log('[GuerraSemanal] Backup_Guerra_Semanal.csv generado: ' + filasSalida.length +
    ' registro(s) semanal(es) a partir de ' + filas.length + ' fila(s) diaria(s) de Backup_Guerra.csv.');
}

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Control2: formato (lo usa actualizarControl2) -----

/**
 * _aplicarFmtCondicionalControl2(sh, numJugadores) [→ Contexto_Base_Web.md §23B021]
 */
function _aplicarFmtCondicionalControl2(sh, numJugadores) {
  if (numJugadores === 0) return;

  var rangoFijo = sh.getRange(4, 1, numJugadores, CC2_TOTAL_FIJAS);
  var colRango  = colLetter(CC2.RANGO);
  var colClanL  = colLetter(CC2.CLAN);
  var rules     = [];

  rules = rules.concat(_reglasCondFmtRango(rangoFijo, colRango));

  var rangoAscenso = sh.getRange(4, CC2.ASCENSO, numJugadores, 1);
  var colAscL = colLetter(CC2.ASCENSO);
  rules = rules.concat(_reglaCondFmtAscenso(rangoAscenso, colAscL));

  for (var sem = 0; sem < 5; sem++) {
    // Ataques: cada columna de semana ES el total semanal (equivalente a la
    // 5ta columna de cada bloque de Ataques en Control).
    var colAta   = COL_INICIO_GRID2 + OFF2.ATA + sem;
    var rangoAta = sh.getRange(4, colAta, numJugadores, 1);
    rules = rules.concat(_reglaCondFmtAtaquesTotalSemana(rangoAta, colLetter(colAta)));

    // Puntaje: ídem, equivalente a la 5ta columna de Puntaje en Control.
    var colPun   = COL_INICIO_GRID2 + OFF2.PUN + sem;
    var rangoPun = sh.getRange(4, colPun, numJugadores, 1);
    rules = rules.concat(_reglasCondFmtPuntajeTotalSemana(rangoPun, colLetter(colPun), colClanL));

    // Barcos: ídem, equivalente a la 5ta columna de Barcos en Control.
    var colBar   = COL_INICIO_GRID2 + OFF2.BAR + sem;
    var rangoBar = sh.getRange(4, colBar, numJugadores, 1);
    rules = rules.concat(_reglasCondFmtBarcosTotalSemana(rangoBar, colLetter(colBar)));
  }

  // "%" de Puntaje (Prom / Min_G) — equivalente al mismo agregado en Control.
  var colPunPct   = COL_INICIO_GRID2 + OFF2.PUN_PCT;
  var rangoPunPct = sh.getRange(4, colPunPct, numJugadores, 1);
  rules = rules.concat(_reglaCondFmtPuntajePct(rangoPunPct, colLetter(colPunPct)));

  _tryCondFmt(sh, rules);
}

// ----- Control2: armado de la cuadrícula de una fila (lo usa actualizarControl2) -----

/**
 * _calcularGridControl2_(gd, ctx, numSemanasTemporada, correccionDeSemana, minG)
 * Tanda 13a (17-nov-2026): el cálculo de la cuadrícula de UNA fila de Control_2 (antes en línea dentro de actualizarControl2(); mismo cálculo, sin cambios de lógica).
 * `gd` = { sIdx: { dia_0..dia_3 } } del jugador (sumado entre clanes si tiene una sola fila; el de su clan si tiene varias) o null; `correccionDeSemana(sem)`
 * (sem de 0 a 4) devuelve la corrección de RoyaleAPI de esa semana o un valor vacío; `minG` = Min_G del clan de la fila. Devuelve el arreglo de GRID_WIDTH2 columnas.
 */
function _calcularGridControl2_(gd, ctx, numSemanasTemporada, correccionDeSemana, minG) {
  var gridFila = new Array(GRID_WIDTH2).fill('');

  var ataqSemTotales = [];
  var puntSemTotales = [];
  var barcoSemTotales = [];

  for (var sem = 0; sem < 5; sem++) {
    var semData = gd ? gd[sem] : null;
    var inicioSemanaPeriodIndex = (sem * 7) + 3;
    if (inicioSemanaPeriodIndex > ctx.periodIndex) continue; // semana futura, queda en blanco

    // Mismo cálculo que updateControlSheet(): suma de los 4 días de
    // guerra (J/V/S/D) de esa semana para Ataques/Puntaje/Barcos.
    var ataquesArr = [], puntajeArr = [], barcosArr = [];
    for (var d = 0; d < 4; d++) {
      var dData = semData ? semData['dia_' + d] : null;
      if (dData) {
        ataquesArr.push(Number(dData.ataques) || 0);
        puntajeArr.push(Number(dData.puntaje) || 0);
        barcosArr.push(Number(dData.barcos) || 0);
      }
    }

    // Corrección RoyaleAPI (si existe): reemplaza Ataques y Puntaje de [→ Contexto_Base_Web.md §23B009]
    var correccionSem = correccionDeSemana(sem);

    // FIX (24-ago-2026, pedido usuario): si esta semana NO hay ningún día [→ Contexto_Base_Web.md §23B010]
    var estuvoPresenteEstaSemana = ataquesArr.length > 0 || !!correccionSem;
    if (!estuvoPresenteEstaSemana) continue; // sin datos = no estuvo, queda en blanco

    var tsxAta   = ataquesArr.length  ? ataquesArr.reduce(function(a,b){return a+b;},0)  : 0;
    var tsxPunt  = puntajeArr.length  ? puntajeArr.reduce(function(a,b){return a+b;},0)  : 0;
    var tsxBarco = barcosArr.length   ? barcosArr.reduce(function(a,b){return a+b;},0)   : 0;

    if (correccionSem) {
      tsxAta  = correccionSem.ataquesSemana;
      tsxPunt = correccionSem.fame;
      if (correccionSem.barcos !== null && correccionSem.barcos !== undefined) {
        tsxBarco = correccionSem.barcos;
      }
    }

    gridFila[OFF2.ATA + sem] = tsxAta;
    gridFila[OFF2.PUN + sem] = tsxPunt;
    gridFila[OFF2.BAR + sem] = tsxBarco;

    if (sem < numSemanasTemporada) ataqSemTotales.push(Number(tsxAta) || 0);
    if (sem < numSemanasTemporada) puntSemTotales.push(Number(tsxPunt) || 0);
    barcoSemTotales.push(Number(tsxBarco) || 0);
  }

  if (ataqSemTotales.length > 0) {
    var ataqTotalTemp = ataqSemTotales.reduce(function(a,b){ return a+b; }, 0);
    gridFila[OFF2.ATA_TOTAL] = ataqTotalTemp;
    // FIX (24-ago-2026, pedido usuario): denominador dinámico — antes [→ Contexto_Base_Web.md §23B011]
    var denomAtaques = 16 * ataqSemTotales.length;
    gridFila[OFF2.ATA_PCT] = denomAtaques > 0 ? (ataqTotalTemp / denomAtaques) : 0;
  }

  if (puntSemTotales.length > 0) {
    var prom = puntSemTotales.reduce(function(a,b){ return a+b; }, 0) / puntSemTotales.length;
    gridFila[OFF2.PUN_PROM] = prom;
    var pctPunt = minG > 0 ? (prom / minG) : 0;
    gridFila[OFF2.PUN_PCT] = (pctPunt >= 1) ? 1 : pctPunt;
  }

  if (barcoSemTotales.length > 0) {
    gridFila[OFF2.BAR_TOTAL] = barcoSemTotales.reduce(function(a,b){ return a+b; }, 0);
  }

  return gridFila;
}

// ----- Control2: restaurar la hoja si no existe (lo usa RUNALL) -----

/**
 * _asegurarColumnaClanTagControl2_(sh)
 * 6-nov-2026 (tanda 7, Clanes por Tag; §PF419). Idempotente: garantiza que Control_2 tenga la
 * columna CC2.CLAN_TAG (34, al final) y su encabezado «Clan_Tag» en la fila 3. No toca ninguna otra
 * columna. Control_2 se reescribe entera en cada corrida de actualizarControl2(), asi que las filas
 * se llenan solas; esta funcion solo agrega la columna y el encabezado a la hoja que ya existia.
 */
function _asegurarColumnaClanTagControl2_(sh) {
  if (sh.getMaxColumns() < CC2.CLAN_TAG) {
    sh.insertColumnsAfter(sh.getMaxColumns(), CC2.CLAN_TAG - sh.getMaxColumns());
  }
  var celda = sh.getRange(3, CC2.CLAN_TAG);
  if (String(celda.getValue()) === 'Clan_Tag') return;
  sh.getRange(1, CC2.CLAN_TAG, 2, 1).merge()
    .setBackground(CFG.COLORES.HEADER_BG)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  celda.setValue('Clan_Tag')
    .setBackground(CFG.COLORES.HEADER_BG)
    .setFontColor(CFG.COLORES.HEADER_FG)
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
  sh.getRange(1, CC2.CLAN_TAG, 3, 1)
    .setBorder(true, true, true, true, true, true, '#ffffff', SpreadsheetApp.BorderStyle.SOLID);
}

/**
 * _asegurarColumnaEstadoControl2_(sh)
 * 17-nov-2026 (tanda 13a, Clanes por Tag). Igual que _asegurarColumnaClanTagControl2_(): idempotente, garantiza la columna CC2.ESTADO (35, al final, junto a Clan_Tag)
 * y su encabezado «Estado» en la fila 3, sin tocar ninguna otra columna. Las filas se llenan solas en cada corrida de actualizarControl2().
 */
function _asegurarColumnaEstadoControl2_(sh) {
  if (sh.getMaxColumns() < CC2.ESTADO) {
    sh.insertColumnsAfter(sh.getMaxColumns(), CC2.ESTADO - sh.getMaxColumns());
  }
  var celda = sh.getRange(3, CC2.ESTADO);
  if (String(celda.getValue()) === 'Estado') return;
  sh.getRange(1, CC2.ESTADO, 2, 1).merge()
    .setBackground(CFG.COLORES.HEADER_BG)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  celda.setValue('Estado')
    .setBackground(CFG.COLORES.HEADER_BG)
    .setFontColor(CFG.COLORES.HEADER_FG)
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
  sh.getRange(1, CC2.ESTADO, 3, 1)
    .setBorder(true, true, true, true, true, true, '#ffffff', SpreadsheetApp.BorderStyle.SOLID);
}

/**
 * _restaurarControl2SiNoExiste() [→ Contexto_Base_Web.md §23B027]
 */
function _restaurarControl2SiNoExiste() {
  var ss = _getSs();
  if (ss.getSheetByName('Control_2')) return; // ya existe: nunca se toca

  var sh = ss.insertSheet('Control_2');
  if (sh.getMaxColumns() < CC2.ESTADO) { // 6-nov-2026 (tanda 7): hasta la columna Clan_Tag, no solo hasta la cuadricula; 17-nov-2026 (tanda 13a): hasta la columna Estado
    sh.insertColumnsAfter(sh.getMaxColumns(), CC2.ESTADO - sh.getMaxColumns());
  }

  _pintarEncabezadosControl2(sh);

  Logger.log('[Control_2] Hoja recreada desde cero (no existía — probable Demoler previo). ' +
    'Repoblando con actualizarControl2()...');

  try {
    actualizarControl2();
  } catch (e) {
    Logger.log('[Control_2] Encabezados creados, pero actualizarControl2() falló en el primer ' +
      'intento (' + e.message + '); se reintentará en la próxima corrida normal.');
  }
   }

/**
 * _pintarEncabezadosControl2(sh) [→ Contexto_Base_Web.md §23B023]
 */
function _pintarEncabezadosControl2(sh) {
  var SEMANAS = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5'];
  var COL_TOTALES = _control2ColTotales();

  // A1:C2 vacío, combinado, sin bordes (mismo criterio que Control: deja
  // congelar hasta la columna C sin partir la celda de título).
  sh.getRange(1, 1, 2, 3).merge()
    .setValue('')
    .setBackground(CFG.COLORES.HEADER_BG)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBorder(false, false, false, false, false, false);

  // D1:M2 combinado: título (reutiliza la misma fórmula de Temporada/ [→ Contexto_Base_Web.md §23B024]
  sh.getRange(1, 4, 2, CC2_TOTAL_FIJAS - 3).merge()
    .setFormula(CFG.CONTROL_TITULO_FORMULA)
    .setBackground(CFG.COLORES.HEADER_BG)
    .setFontColor(CFG.COLORES.HEADER_FG)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  // Fila 1: nombre de cada métrica, todo su ancho (incluye Total/Prom/%).
  var col = COL_INICIO_GRID2;
  for (var m = 0; m < CONTROL2_METRICAS.length; m++) {
    sh.getRange(1, col, 1, CONTROL2_METRICAS[m].ancho).merge()
      .setValue(CONTROL2_METRICAS[m].nombre)
      .setBackground(CFG.COLORES.HEADER_BG)
      .setFontColor(CFG.COLORES.HEADER_FG)
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    col += CONTROL2_METRICAS[m].ancho;
  }

  // Fila 2: "Sem N" en cada una de las 5 columnas (SIN combinar — a [→ Contexto_Base_Web.md §23B025]
  col = COL_INICIO_GRID2;
  for (var m = 0; m < CONTROL2_METRICAS.length; m++) {
    for (var s = 0; s < SEMANAS.length; s++) {
      sh.getRange(2, col)
        .setValue(SEMANAS[s])
        .setBackground(CFG.COLORES.HEADER_BG)
        .setFontColor(CFG.COLORES.HEADER_FG)
        .setFontWeight('bold')
        .setHorizontalAlignment('center');
      col++;
    }
    var extras = CONTROL2_METRICAS[m].extras;
    if (extras.length > 0) {
      var celdaResumen = (extras.length > 1)
        ? sh.getRange(2, col, 1, extras.length).merge()
        : sh.getRange(2, col, 1, 1);
      celdaResumen.setValue('Resumen')
        .setBackground(CFG.COLORES.HEADER_BG)
        .setFontColor(CFG.COLORES.HEADER_FG)
        .setFontWeight('bold')
        .setHorizontalAlignment('center')
        .setVerticalAlignment('middle');
      col += extras.length;
    }
  }

  // Fila 3: encabezados fijos (13 columnas identificadas de Control_2).
  var fixedHeaders = ['N°', 'Tag', 'Nombre', 'Nom_Multi', 'Clan', 'Rango', 'Iniciales',
                       'Celular', 'V_Guerra', 'Días inactivo', 'Alerta', 'Ataques pendientes', 'Ascenso'];
  sh.getRange(3, 1, 1, fixedHeaders.length).setValues([fixedHeaders])
    .setBackground(CFG.COLORES.HEADER_BG)
    .setFontColor(CFG.COLORES.HEADER_FG)
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  // Fila 3: "Tₛ1".."Tₛ5" por cada semana (una columna, no un bloque de 5 — [→ Contexto_Base_Web.md §23B026]
  col = COL_INICIO_GRID2;
  for (var m = 0; m < CONTROL2_METRICAS.length; m++) {
    for (var s = 0; s < SEMANAS.length; s++) {
      sh.getRange(3, col)
        .setValue('Tₛ' + (s + 1))
        .setBackground(CFG.COLORES.HEADER_BG)
        .setFontColor(CFG.COLORES.HEADER_FG)
        .setFontWeight('bold')
        .setHorizontalAlignment('center');
      col++;
    }
    var extrasFila3 = CONTROL2_METRICAS[m].extras;
    for (var e3 = 0; e3 < extrasFila3.length; e3++) {
      sh.getRange(3, col)
        .setValue(extrasFila3[e3])
        .setBackground(CFG.COLORES.HEADER_BG)
        .setFontColor(CFG.COLORES.HEADER_FG)
        .setFontWeight('bold')
        .setHorizontalAlignment('center');
      col++;
    }
  }

  sh.setFrozenRows(3);
  sh.setFrozenColumns(3);

  var COLOR_BORDE_HEADER = '#ffffff';
  sh.getRange(1, 1, 3, COL_TOTALES)
    .setBorder(true, true, true, true, true, true,
               COLOR_BORDE_HEADER, SpreadsheetApp.BorderStyle.SOLID);

  // A1:C2 sin bordes (se limpia después del borde general para que no lo
  // sobreescriba, mismo criterio que Control).
  sh.getRange(1, 1, 2, 3).setBorder(false, false, false, false, false, false);

  _asegurarColumnaClanTagControl2_(sh); // 6-nov-2026 (tanda 7): encabezado de la columna Clan_Tag (al final)
  _asegurarColumnaEstadoControl2_(sh); // 17-nov-2026 (tanda 13a): encabezado de la columna Estado (al final, junto a Clan_Tag)
}

/**
 * _control2ColTotales() [→ Contexto_Base_Web.md §23B022]
 */
function _control2ColTotales() {
  var total = COL_INICIO_GRID2 - 1;
  for (var m = 0; m < CONTROL2_METRICAS.length; m++) total += CONTROL2_METRICAS[m].ancho;
  return total;
}
