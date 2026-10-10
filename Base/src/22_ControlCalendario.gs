// ==============================================================================
// 22_ControlCalendario.gs
// Hojas Extra, Control y Calendario/Calendario2: vistas de control semanal y calendario.
// ==============================================================================

// ----- Funciones manuales / punto de entrada -----

// SECCIÓN 2: RESTO DE FUNCIONES (Extra, Control, Calendario, helpers internos) [→ Contexto_Base_Web.md §22B001]

function updateExtraSheet() {
  var ss  = _getSs();
  var sh  = ss.getSheetByName(CFG.SHEETS.EXTRA);
  if (!sh) { Logger.log('[Extra] Hoja no encontrada'); return; }

  var ctx  = _getCtx();
  var anio = ctx.mesEfectivoAnio;
  var mes  = ctx.mesEfectivoMes;

  Logger.log('[Extra] Actualizando - Temporada:' + ctx.temporada);

  // FIX (pendiente Reenumeración de Temporadas, punto 3): antes A2 [→ Contexto_Base_Web.md §22B002]
  sh.getRange(2, 1).setValue(ctx.temporada);
  sh.getRange(2, 2).setValue(ctx.sectionIndex + 1);
  sh.getRange(2, 3).setValue(ctx.diaLetra);

  sh.getRange(2, 4).setValue(ctx.ref);
  _trySetFmt(sh, 2, 4, 'dd/mm/yyyy');

  var primerLunes = primerLunesDelMes(anio, mes);
  sh.getRange(2, 5).setValue(primerLunes);
  _trySetFmt(sh, 2, 5, 'dd/mm/yyyy');
  sh.getRange(2, 6).setValue(lunesEnMes(anio, mes));

  // Mostrar_T (col 7, antes "Mostrar"): por defecto es la temporada actual. [→ Contexto_Base_Web.md §22B003]
  sh.getRange(2, 7).setValue(ctx.temporada);

  // Mostrar_S (col 8) y Mostrar_D (col 9): agregadas para, en el futuro, [→ Contexto_Base_Web.md §22B004]

  // FIX (16-ago-2026): las 3 listas fijas de acá abajo (Liga, Rangos, [→ Contexto_Base_Web.md §22B005]
  var ligaRows = CFG.EXTRA_LIGAS_ROWS;
  for (var i = 0; i < ligaRows.length; i++) {
    sh.getRange(i + 2, 10).setValue(ligaRows[i][0]);
    sh.getRange(i + 2, 11).setValue(ligaRows[i][1]);
  }
  if (sh.getLastRow() - 1 > ligaRows.length) {
    var filasSobrantesLiga = (sh.getLastRow() - 1) - ligaRows.length;
    sh.getRange(2 + ligaRows.length, 10, filasSobrantesLiga, 2).clearContent();
  }

  for (var i = 0; i < CFG.EXTRA_RANGOS.length; i++) {
    sh.getRange(i + 2, 12).setValue(CFG.EXTRA_RANGOS[i]);
  }
  if (sh.getLastRow() - 1 > CFG.EXTRA_RANGOS.length) {
    var filasSobrantesRangos = (sh.getLastRow() - 1) - CFG.EXTRA_RANGOS.length;
    sh.getRange(2 + CFG.EXTRA_RANGOS.length, 12, filasSobrantesRangos, 1).clearContent();
  }

  for (var i = 0; i < CFG.EXTRA_ALERTAS.length; i++) {
    sh.getRange(i + 2, 13).setValue(CFG.EXTRA_ALERTAS[i]);
  }
  if (sh.getLastRow() - 1 > CFG.EXTRA_ALERTAS.length) {
    var filasSobrantesAlertas = (sh.getLastRow() - 1) - CFG.EXTRA_ALERTAS.length;
    sh.getRange(2 + CFG.EXTRA_ALERTAS.length, 13, filasSobrantesAlertas, 1).clearContent();
  }

  // Columnas de referencia (listas fijas en el script, igual que Liga/Rangos/Alerta): [→ Contexto_Base_Web.md §22B006]
  var listasReferencia = [
    { arr: CFG.EXTRA_CATEGORIAS,    col: 14 }, // N
    { arr: CFG.EXTRA_SUBCATEGORIAS, col: 15 }, // O
    { arr: CFG.EXTRA_VIGENTE,       col: 16 }, // P
    { arr: CFG.EXTRA_VISIBILIDAD,   col: 17 }, // Q
    { arr: CFG.EXTRA_TIPO,          col: 18 }, // R
    { arr: CFG.EXTRA_EDICION,       col: 19 }, // S
  ];

  var maxFilaRef = CFG.EXTRA_LIGAS_ROWS.length;
  for (var li = 0; li < listasReferencia.length; li++) {
    maxFilaRef = Math.max(maxFilaRef, listasReferencia[li].arr.length);
  }

  for (var li = 0; li < listasReferencia.length; li++) {
    var lista = listasReferencia[li].arr;
    var col = listasReferencia[li].col;
    for (var i = 0; i < lista.length; i++) {
      sh.getRange(i + 2, col).setValue(lista[i]);
    }
    if (lista.length < maxFilaRef && sh.getLastRow() - 1 > lista.length) {
      var filasSobrantes = (sh.getLastRow() - 1) - lista.length;
      sh.getRange(2 + lista.length, col, filasSobrantes, 1).clearContent();
    }
  }

  // Fallback ajustado de 17 a 19 (2 columnas nuevas: Mostrar_S, Mostrar_D).
  var totalColsExtra = sh.getLastColumn() || 19;
  applyBorderCenter(sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), totalColsExtra));

  Logger.log('[Extra] updateExtraSheet completado. Columnas detectadas: ' + totalColsExtra);
}

// CONTROL [→ Contexto_Base_Web.md §22B007]

// FIX (rendimiento, sept-2026 -- runGuerra() cortándose por "Exceeded maximum [→ Contexto_Base_Web.md §22B008]

var CONTROL_LIMPIAR_LINKS_INTERVALO_MS = 60 * 60 * 1000; // máx. 1 vez por hora, igual criterio que Guerra
var CONTROL_FORMATO_REBUILD_MAX_ELAPSED_MS = 6 * 60 * 60 * 1000; // respaldo: forzar rebuild al menos cada 6h

/**
 * _controlNecesitaRebuildFormato(ctx, numJugadores) [→ Contexto_Base_Web.md §22B009]
 */
function _controlNecesitaRebuildFormato(ctx, numJugadores) {
  var props = PropertiesService.getScriptProperties();
  var claveFirma   = '_controlFormatoFirma';
  var claveUltimoMs = '_controlFormatoUltimoRebuildMs';

  var firmaActual = numJugadores + '|' + ctx.temporada + '|' + ctx.sectionIndex;
  var firmaPrev   = props.getProperty(claveFirma);
  var ultimoMs    = Number(props.getProperty(claveUltimoMs)) || 0;
  var pasoElRespaldo = (Date.now() - ultimoMs) >= CONTROL_FORMATO_REBUILD_MAX_ELAPSED_MS;

  if (firmaActual !== firmaPrev || pasoElRespaldo) {
    props.setProperty(claveFirma, firmaActual);
    props.setProperty(claveUltimoMs, String(Date.now()));
    return true;
  }
  return false;
}

function updateControlSheet(ctxOverride) {
  var ss  = _getSs();
  var sh  = ss.getSheetByName(CFG.SHEETS.CONTROL);
  if (!sh) { Logger.log('[Control] Hoja no encontrada'); return false; }

  // ctxOverride: usado por mostrarTemporadaEnControl() para redibujar la [→ Contexto_Base_Web.md §22B010]
  var ctxReal = _getCtx();
  var ctx = ctxOverride || ctxReal;
  Logger.log('[Control] Actualizando...');

  if (ctx.periodIndexSospechoso) {
    Logger.log('[Control] ABORT: periodIndex sospechoso, no se reconstruye esta corrida.');
    return false;
  }

  // FIX (03-ago-2026): este chequeo de cache de clanes SOLO tiene sentido en [→ Contexto_Base_Web.md §22B011]
  if (!ctxOverride) {
    var faltaCache = false;
    for (var i = 0; i < CFG.TERNA_TAGS.length; i++) {
      if (!_getClanCache(CFG.TERNA_TAGS[i])) { faltaCache = true; break; }
    }
    if (faltaCache) {
      Logger.log('[Control] cache incompleto en esta ejecución, se intenta recuperar checkpoint de clanes...');
      _fetchClanesBasico();
    }
    for (var j = 0; j < CFG.TERNA_TAGS.length; j++) {
      if (!_getClanCache(CFG.TERNA_TAGS[j])) {
        Logger.log('[Control] ABORT: falta cache para ' + CFG.TERNA_TAGS[j] + ' (ni en memoria ni en checkpoint de Drive).');
        return false;
      }
    }
  }

  var lastRow = sh.getLastRow();
  if (lastRow >= 4) {
    sh.getRange(4, 1, lastRow - 3, sh.getLastColumn()).clearContent();
  }

  // Título en D1:P2 (combinado, ver _buildControlHeaders en 02_Setup_Hojas.gs).
  sh.getRange(1, 4).setFormula(CFG.CONTROL_TITULO_FORMULA);

  // A1:C2 vacío, negro y sin bordes (mismo color que el resto del header, [→ Contexto_Base_Web.md §22B012]
  sh.getRange(1, 1, 2, 3).setBackground(CFG.COLORES.HEADER_BG);

  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!shDir || shDir.getLastRow() < 2) {
    Logger.log('[Control] ABORT: Directorio no existe o todavía no tiene filas (getLastRow() < 2) — ' +
      'Control queda con encabezados pero SIN datos hasta la próxima corrida.');
    return false;
  }

  // Fase C2 (16/07/2026): Nivel/Copas/V_Guerra ahora viven en Players, así [→ Contexto_Base_Web.md §22B013]
  var dirData = _leerDirectorioFisicoComoDC(ss);
  // Fase 10 (17/07/2026): se quita el chequeo de Vetado. Ya exigimos [→ Contexto_Base_Web.md §22B014]
  var jugadores = dirData.filter(function(r) {
    return String(r[DC.ESTADO - 1]) === 'Activo' &&
           CFG.TERNA_TAGS.indexOf(String(r[DC.CLAN_TAG - 1])) >= 0;
  });

  if (jugadores.length === 0) {
    Logger.log('[Control] ABORT: Directorio tiene ' + shDir.getLastRow() + ' fila(s), pero ninguna es ' +
      'Activo + clan Terna — Control queda con encabezados pero SIN datos hasta la próxima corrida.');
    return false;
  }

  var guerraData  = _getDatosGuerraParaControl(ctx, ctxReal.temporada);
  var ataqCacheMap = _getAtaquesHoyCache();

  // Columna "Ascenso": ver _getAgregadosAscensoPorTag() más abajo. Se calcula [→ Contexto_Base_Web.md §22B015]
  var agregadosAscensoPorTag = _getAgregadosAscensoPorTag();

  // FIX (03-ago-2026): 17->16 / 18->17 (se sacó la columna "Jugador").
  var NUM_COLS_FIJAS  = 16;
  var COL_INICIO_GRID = 17;

  // Ancho total de la cuadrícula (105 columnas) y offsets (0-based, relativos [→ Contexto_Base_Web.md §22B016]
  var GRID_WIDTH = 105;
  var OFF = {
    ATA: 0,   ATA_TOTAL: 25, ATA_PCT: 26,   // Ataques:  27 cols
    PUN: 27,  PUN_PROM: 52, PUN_PCT: 53,    // Puntaje:  27 cols
    ACU: 54,                                 // Acumulado:25 cols
    BAR: 79,  BAR_TOTAL: 104                 // Barcos:   26 cols
  };

  // Número de semanas de la temporada actual (4 u 5) según el "mes efectivo" [→ Contexto_Base_Web.md §22B017]
  var numSemanasTemporada = lunesEnMes(ctx.mesEfectivoAnio, ctx.mesEfectivoMes) || 4;

  // Min_G vigente por clan, indexado por NOMBRE (la columna "Clan" de la [→ Contexto_Base_Web.md §22B018]
  var minGPorNombreClan = _getMinGClanMaps().byNombre;

  var fixedRows = [];
  var gridRows  = [];

  for (var i = 0; i < jugadores.length; i++) {
    var jug    = jugadores[i];
    var tagJug = String(jug[DC.TAG - 1] || '').trim();

    var ataqCacheHoy  = ataqCacheMap[tagJug] || 0;
    // La estructura real de guerraData[tag][sIdx] tiene sub-claves 'dia_0'..'dia_3' [→ Contexto_Base_Web.md §22B019]
    var offDiaHoy = (ctx.periodIndex % 7) - 3;
    var diaDataHoy = (guerraData[tagJug] && guerraData[tagJug][ctx.sectionIndex]) ?
                      guerraData[tagJug][ctx.sectionIndex]['dia_' + offDiaHoy] : null;
    var ataqGuerraHoy = diaDataHoy ? (diaDataHoy.ataques || 0) : 0;
    var ataqHoy = Math.max(ataqCacheHoy, ataqGuerraHoy);
    var pendCol = (ctx.esDiaGuerra && ataqHoy < 4) ? 'Si' : '';

    var gridFila = new Array(GRID_WIDTH).fill('');
    var gd = guerraData[tagJug];

    for (var sem = 0; sem < 5; sem++) {
      var semData = gd ? gd[sem] : null;

      for (var d = 0; d < 4; d++) {
        var cellPeriodIndex = (sem * 7) + 3 + d;
        var diaYaOcurrio = (cellPeriodIndex <= ctx.periodIndex);
        var baseAta = OFF.ATA + sem * 5 + d;
        var basePun = OFF.PUN + sem * 5 + d;
        var baseAcu = OFF.ACU + sem * 5 + d;
        var baseBar = OFF.BAR + sem * 5 + d;

        if (diaYaOcurrio) {
          var dData = semData ? semData['dia_' + d] : null;
          if (dData) {
            gridFila[baseAta] = dData.ataques;
            gridFila[basePun] = dData.puntaje;
            gridFila[baseAcu] = dData.fameAcum;
            gridFila[baseBar] = dData.barcos;
          } else {
            gridFila[baseAta] = '';
            gridFila[basePun] = '';
            gridFila[baseAcu] = '';
            gridFila[baseBar] = '';
          }
        }
      }

      var inicioSemanaPeriodIndex = (sem * 7) + 3;
      if (inicioSemanaPeriodIndex <= ctx.periodIndex) {
        var tsxAta   = _sumaOVacio(gridFila, OFF.ATA+sem*5, 4);
        var tsxPunt  = _sumaOVacio(gridFila, OFF.PUN+sem*5, 4);
        var tsxAcum  = _maxOVacio(gridFila, OFF.ACU+sem*5, 4);
        var tsxBarco = _sumaOVacio(gridFila, OFF.BAR+sem*5, 4);

        // FIX (24-ago-2026, pedido usuario): antes se forzaba 0 en el total [→ Contexto_Base_Web.md §22B020]
        gridFila[OFF.ATA+sem*5+4] = tsxAta;
        gridFila[OFF.PUN+sem*5+4] = tsxPunt;
        gridFila[OFF.ACU+sem*5+4] = tsxAcum;
        gridFila[OFF.BAR+sem*5+4] = tsxBarco;
      }
    }

    // Columnas agregadas de TEMPORADA (fuera del ciclo por semana, una sola [→ Contexto_Base_Web.md §22B021]
    var ataqSemTotales = [];
    for (var sA = 0; sA < Math.min(5, numSemanasTemporada); sA++) {
      var vA = gridFila[OFF.ATA + sA*5 + 4];
      if (vA !== '') ataqSemTotales.push(Number(vA) || 0);
    }
    if (ataqSemTotales.length > 0) {
      var ataqTotalTemp = ataqSemTotales.reduce(function(a,b){ return a+b; }, 0);
      gridFila[OFF.ATA_TOTAL] = ataqTotalTemp;
      // FIX (24-ago-2026, pedido usuario): antes el divisor era SIEMPRE [→ Contexto_Base_Web.md §22B022]
      var denomAtaques = 16 * ataqSemTotales.length;
      gridFila[OFF.ATA_PCT] = denomAtaques > 0 ? (ataqTotalTemp / denomAtaques) : 0;
    }

    // Prom de Puntaje: promedio de los totales semanales de las semanas 1..N [→ Contexto_Base_Web.md §22B023]
    var puntSemTotales = [];
    for (var sP = 0; sP < Math.min(5, numSemanasTemporada); sP++) {
      var vP = gridFila[OFF.PUN + sP*5 + 4];
      if (vP !== '') puntSemTotales.push(Number(vP) || 0);
    }
    if (puntSemTotales.length > 0) {
      var prom = puntSemTotales.reduce(function(a,b){ return a+b; }, 0) / puntSemTotales.length;
      gridFila[OFF.PUN_PROM] = prom;
      var minGJugador = minGPorNombreClan[jug[DC.CLAN - 1]] || CFG.MIN_G_DEFAULT;
      var pctPunt = minGJugador > 0 ? (prom / minGJugador) : 0;
      gridFila[OFF.PUN_PCT] = (pctPunt >= 1) ? 1 : pctPunt; // fijo en 100% si se cumple o supera
    }

    var barcoSemTotales = [];
    for (var sB = 0; sB < 5; sB++) {
      var vB = gridFila[OFF.BAR + sB*5 + 4];
      if (vB !== '') barcoSemTotales.push(Number(vB) || 0);
    }
    if (barcoSemTotales.length > 0) {
      gridFila[OFF.BAR_TOTAL] = barcoSemTotales.reduce(function(a,b){ return a+b; }, 0);
    }

    // Columna fija "Ascenso" (17ª, después de "Ataques pendientes"): usa los [→ Contexto_Base_Web.md §22B024]
    var agregAsc = agregadosAscensoPorTag[tagJug] || {};
    var ascensoVal = _evaluarRequisitosAscenso(
      jug[DC.RANGO - 1],
      agregAsc.ataqPct,
      agregAsc.puntProm,
      agregAsc.barcoTotal
    );

    // Columnas fijas (usando constantes DC, 0-based = DC.X - 1): [→ Contexto_Base_Web.md §22B025]
    fixedRows.push([
      i + 1,              // N°
      tagJug,             // Tag
      jug[DC.NOMBRE    - 1],  // Nombre
      jug[DC.NOM_MULTI - 1],  // Nom_Multi
      jug[DC.CLAN      - 1],  // Clan
      jug[DC.RANGO     - 1],  // Rango
      jug[DC.INICIALES - 1],  // Iniciales
      jug[DC.CELULAR   - 1],  // Celular
      jug[DC.NIVEL     - 1],  // Nivel
      jug[DC.COPAS     - 1],  // Copas
      jug[DC.V_GUERRA  - 1],  // V_Guerra
      jug[DC.PERMISO   - 1],  // Permiso
      jug[DC.INACTIVIDAD - 1], // Días inactivo
      jug[DC.ALERTA    - 1],  // Alerta
      pendCol,                // Ataques pendientes
      ascensoVal              // Ascenso
    ]);

    gridRows.push(gridFila);
  }

  if (fixedRows.length > 0) {
    sh.getRange(4, 1, fixedRows.length, NUM_COLS_FIJAS).setValues(fixedRows);
    // FIX (rendimiento, sept-2026): antes esto llamaba a _trySetFmt() fila [→ Contexto_Base_Web.md §22B026]
    try { sh.getRange(4, 9,  fixedRows.length, 1).setNumberFormat('#,##0'); } catch(e) {}            // Nivel
    try { sh.getRange(4, 10, fixedRows.length, 1).setNumberFormat('#,##0'); } catch(e) {}             // Copas
    try { sh.getRange(4, 11, fixedRows.length, 1).setNumberFormat('#,##0'); } catch(e) {}             // V_Guerra
    try { sh.getRange(4, 13, fixedRows.length, 1).setNumberFormat('#,##0'); } catch(e) {}             // Días inactivo
    try { sh.getRange(4, 8,  fixedRows.length, 1).setNumberFormat('### ### ### ###'); } catch(e) {}   // Celular
  }

  if (gridRows.length > 0) {
    sh.getRange(4, COL_INICIO_GRID, gridRows.length, GRID_WIDTH).setValues(gridRows);

    var colAtaTotal = COL_INICIO_GRID + OFF.ATA_TOTAL;
    var colAtaPct   = COL_INICIO_GRID + OFF.ATA_PCT;
    var colPunProm  = COL_INICIO_GRID + OFF.PUN_PROM;
    var colPunPct   = COL_INICIO_GRID + OFF.PUN_PCT;
    var colBarTotal = COL_INICIO_GRID + OFF.BAR_TOTAL;

    sh.getRange(4, colAtaTotal, gridRows.length, 1).setNumberFormat('#,##0');
    sh.getRange(4, colAtaPct,   gridRows.length, 1).setNumberFormat('0%');
    sh.getRange(4, colPunProm,  gridRows.length, 1).setNumberFormat('#,##0');
    sh.getRange(4, colPunPct,   gridRows.length, 1).setNumberFormat('0%');
    sh.getRange(4, colBarTotal, gridRows.length, 1).setNumberFormat('#,##0');
  }

  // FIX (20-ago-2026, pedido usuario — "no se está aplicando bien el [→ Contexto_Base_Web.md §22B027]
  var necesitaRebuildFormato = _controlNecesitaRebuildFormato(ctx, jugadores.length);

  if (necesitaRebuildFormato) {
    if (fixedRows.length > 0) {
      applyBorderCenter(sh.getRange(4, 1, fixedRows.length, NUM_COLS_FIJAS + GRID_WIDTH));
    }

    // Ancho 45px para toda la cuadrícula (COL_INICIO_GRID en adelante). [→ Contexto_Base_Web.md §22B028]
    var lastColCtrl = sh.getLastColumn();
    if (lastColCtrl >= COL_INICIO_GRID) {
      sh.setColumnWidths(COL_INICIO_GRID, lastColCtrl - COL_INICIO_GRID + 1, 45);
    }

    if (jugadores.length > 0) {
      _aplicarFmtCondicionalControl(sh, jugadores.length);
    }

    // No se debe ver más allá de la semana actual: si estamos en la semana 2, [→ Contexto_Base_Web.md §22B029]
    _aplicarVisibilidadSemanasControl(sh, ctx, COL_INICIO_GRID);
  } else {
    Logger.log('[Control] Formato pesado (bordes/anchos/condicional/visibilidad) SALTADO -- ' +
      'sin cambios de jugadores/temporada/semana desde la última reconstrucción (respaldo forzado cada ' +
      Math.round(CONTROL_FORMATO_REBUILD_MAX_ELAPSED_MS / 3600000) + 'h).');
  }

  // FIX (02-ago-2026): mismo caso que _escribirDirectorio()/updateGuerraSheet()/ [→ Contexto_Base_Web.md §22B030]
  var _propsCtrlLinks = PropertiesService.getScriptProperties();
  var _ultimaLimpiezaLinksControl = Number(_propsCtrlLinks.getProperty('_controlLimpiarLinksUltimaVezMs')) || 0;
  if ((Date.now() - _ultimaLimpiezaLinksControl) >= CONTROL_LIMPIAR_LINKS_INTERVALO_MS) {
    _limpiarLinksAccidentalesEnHoja(sh, 3);
    _propsCtrlLinks.setProperty('_controlLimpiarLinksUltimaVezMs', String(Date.now()));
  } else {
    Logger.log('[Control] _limpiarLinksAccidentalesEnHoja() SALTADO (throttle ' +
      Math.round(CONTROL_LIMPIAR_LINKS_INTERVALO_MS / 60000) + ' min, faltan ' +
      Math.round((CONTROL_LIMPIAR_LINKS_INTERVALO_MS - (Date.now() - _ultimaLimpiezaLinksControl)) / 60000) +
      ' min para la próxima).');
  }

  Logger.log('[Control] Actualizado. Jugadores: ' + jugadores.length);
  return true;
}

/**
 * mostrarTemporadaEnControl() [→ Contexto_Base_Web.md §22B031]
 */
function mostrarTemporadaEnControl() {
  var ss = _getSs();
  var shExtra = ss.getSheetByName(CFG.SHEETS.EXTRA);
  if (!shExtra) { Logger.log('[Control-Mostrar] ABORT: hoja Extra no encontrada.'); return; }

  var mostrarVal = shExtra.getRange(2, 7).getValue(); // G2 = Mostrar
  var temporadaMostrar = Number(mostrarVal);
  if (!temporadaMostrar) {
    Logger.log('[Control-Mostrar] ABORT: Extra!Mostrar (G2) está vacío o no es numérico.');
    return;
  }

  var ctxReal = _getCtx();
  if (ctxReal.periodIndexSospechoso) {
    Logger.log('[Control-Mostrar] ABORT: periodIndex sospechoso, no se redibuja Control.');
    return;
  }

  var ctxMostrar = _clonarCtxParaTemporada(ctxReal, temporadaMostrar);
  var ok = updateControlSheet(ctxMostrar);
  // FIX (03-ago-2026): antes se logueaba "redibujado" incondicionalmente, [→ Contexto_Base_Web.md §22B032]
  if (ok) {
    Logger.log('[Control-Mostrar] Control redibujado para la temporada ' + temporadaMostrar +
      (temporadaMostrar === ctxReal.temporada ? ' (temporada real en curso).' : ' (temporada histórica, se asume completa).'));
  } else {
    Logger.log('[Control-Mostrar] ABORT: updateControlSheet() no escribió nada para la temporada ' +
      temporadaMostrar + ' (ver logs de [Control] arriba para la causa).');
  }

  // FIX (10-ago-2026): un solo clic en mostrarTemporadaEnControl() ahora [→ Contexto_Base_Web.md §22B033]
  try {
    actualizarControl2();
  } catch (e) {
    Logger.log('[Control-Mostrar] actualizarControl2() falló: ' + e.message);
  }
}

function GenerarCalendario(mes, anio) {
  var ss  = _getSs();
  var sh  = ss.getSheetByName(CFG.SHEETS.CALENDARIO);
  if (!sh) { Logger.log('[Calendario] Hoja no encontrada'); return; }

  var ctx       = _getCtx();
  // El mes/año por defecto es el "mes efectivo" (ligado al periodIndex de la
  // API), no la fecha real — ver _getMesEfectivo() en 01_Config_Global.gs.
  if (mes  === undefined) mes  = ctx.mesEfectivoMes;
  if (anio === undefined) anio = ctx.mesEfectivoAnio;

  var temporada = ctx.temporada;
  var numSem    = lunesEnMes(anio, mes);
  var mesNombre = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][mes];

  var mesActualSheet = String(sh.getRange(4, 2).getValue() || '').toLowerCase();
  var conservarNotas = (mesActualSheet === '' || mesActualSheet.indexOf(mesNombre) !== -1);

  var notasExtraidas = [];
  var lastR = sh.getLastRow();
  if (lastR >= 5 && conservarNotas) {
    var allData = sh.getRange(5, 4, lastR - 4 + 1, 7).getDisplayValues();
    for (var i = 0; i < allData.length; i++) {
      var rowText = allData[i].join('');
      var cell1 = String(allData[i][0] || '');
      if (rowText.length > 0 && cell1.indexOf('Lunes') === -1 && cell1.indexOf('-') === -1) {
        notasExtraidas.push(allData[i]);
      }
    }
  }

  // FIX (23-ago-2026, pedido usuario): mapa de respaldo desde Calendario_2 [→ Contexto_Base_Web.md §22B034]
  var notasDesdeCal2 = _leerNotasCalendario2PorSemana(temporada);

  if (lastR >= 4) {
    sh.getRange(4, 2, lastR - 3, 10).clearContent().setBackground(null).clearFormat();
  }

  sh.getRange(2, 2, 1, 9).merge().setValue('Calendario de temporada')
    .setBackground(null)
    .setFontColor('#000000')
    .setFontWeight('bold')
    .setFontStyle('italic')
    .setFontSize(14)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  sh.getRange(4, 2, 1, 2).merge()
    .setValue('Temporada ' + temporada + ', mes de ' + mesNombre)
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle')
    .setFontColor('#000000')
    .setBackground(null);

  sh.getRange(4, 10).setValue(anio)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setFontColor('#000000');

  var diasHeader  = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  var primerLunes = primerLunesDelMes(anio, mes);
  var mesAbrevs   = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

  for (var sem = 0; sem < numSem; sem++) {
    var filaBase = 5 + sem * 4;
    var esSemColiseo = (sem === numSem - 1);

    var colorSem = CFG.COLORES.CAL_SEM[sem] || '#cccccc';
    var txtSem   = esSemColiseo ? ' 🔥 COLISEO ' : ' 🛡️ ENTRENAMIENTO ';
    sh.getRange(filaBase, 2, 3, 2).merge()
      .setValue('Semana ' + (sem+1) + '\n' + txtSem)
      .setBackground(colorSem)
      .setFontColor('#ffffff')
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');

    sh.getRange(filaBase, 4, 1, 7).setValues([diasHeader])
      .setBackground('#f3f3f3')
      .setFontColor('#000000')
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');

    if (sem < notasExtraidas.length && notasExtraidas[sem]) {
      sh.getRange(filaBase + 1, 4, 1, 7).setValues([notasExtraidas[sem]])
        .setHorizontalAlignment('center')
        .setVerticalAlignment('middle');
    } else {
      // FIX (23-ago-2026): nada que extraer de la propia cuadrícula para [→ Contexto_Base_Web.md §22B035]
      var notasSemCal2 = notasDesdeCal2[sem + 1];
      if (notasSemCal2) {
        var diasLetraOrden = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
        var filaRespaldo = diasLetraOrden.map(function (dl) { return notasSemCal2[dl] || ''; });
        if (filaRespaldo.some(function (v) { return v; })) {
          sh.getRange(filaBase + 1, 4, 1, 7).setValues([filaRespaldo])
            .setHorizontalAlignment('center')
            .setVerticalAlignment('middle');
          Logger.log('[Calendario] Semana ' + (sem + 1) + ': notas restauradas desde Calendario_2 (no había nada en la cuadrícula).');
        }
      }
    }

    var fechasRow = [];
    for (var d = 0; d < 7; d++) {
      var fecha = new Date(primerLunes.getTime());
      fecha.setDate(primerLunes.getDate() + sem * 7 + d);
      var dia = fecha.getDate();
      var mesAbr = mesAbrevs[fecha.getMonth()];
      fechasRow.push("'" + dia + '-' + mesAbr);
    }
    sh.getRange(filaBase + 2, 4, 1, 7).setValues([fechasRow])
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');

    applyBorderCenter(sh.getRange(filaBase, 2, 3, 9));
  }

  updateCalendario2();
  resaltarDiaActual();

  Logger.log('[Calendario] Generado para ' + mesNombre + ' ' + anio + ' (' + numSem + ' semanas)');
}

function resaltarDiaActual() {
  var ss  = _getSs();
  var sh  = ss.getSheetByName(CFG.SHEETS.CALENDARIO);
  if (!sh || sh.getLastRow() < 5) return;

  // "Hoy" se calcula a partir de ctx.diaGuerra (fecha derivada de la [→ Contexto_Base_Web.md §22B036]
  var ctx     = _getCtx();
  var hoy     = (ctx.diaGuerra instanceof Date && !isNaN(ctx.diaGuerra.getTime())) ? ctx.diaGuerra : new Date();
  var mesAbrevs = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  var textoHoy = String(hoy.getDate()) + '-' + mesAbrevs[hoy.getMonth()];

  var lastRow = sh.getLastRow();
  var filasFecha = [7, 11, 15, 19, 23];
  var filasTarea = [6, 10, 14, 18, 22];

  for (var i = 0; i < filasFecha.length; i++) {
    if (filasFecha[i] > lastRow) break;
    _clearBg(sh.getRange(filasFecha[i], 4, 1, 7));
    if (filasTarea[i] <= lastRow) _clearBg(sh.getRange(filasTarea[i], 4, 1, 7));
  }

  for (var i = 0; i < filasFecha.length; i++) {
    if (filasFecha[i] > lastRow) break;
    var celdas = sh.getRange(filasFecha[i], 4, 1, 7).getDisplayValues()[0];
    for (var d = 0; d < celdas.length; d++) {
      if (String(celdas[d]).trim() === textoHoy) {
        sh.getRange(filasFecha[i], 4 + d).setBackground('#FDFD96');
        if (filasTarea[i] <= lastRow) {
          sh.getRange(filasTarea[i], 4 + d).setBackground('#FDFD96');
        }
        break;
      }
    }
  }

  Logger.log('[Calendario] Día resaltado correctamente: ' + textoHoy);
}

function updateCalendario2() {
  var ss  = _getSs();
  var shCal  = ss.getSheetByName(CFG.SHEETS.CALENDARIO);
  var shCal2 = ss.getSheetByName(CFG.SHEETS.CALENDARIO2);
  if (!shCal || !shCal2) return;

  var ctx     = _getCtx();
  var filasTarea = [6, 10, 14, 18, 22];
  var diasLetra  = ['L','M','X','J','V','S','D'];

  var existingIds = {};
  var last2 = shCal2.getLastRow();
  if (last2 >= 2) {
    var data2 = shCal2.getRange(2, 1, last2 - 1, 6).getValues();
    for (var i = 0; i < data2.length; i++) {
      var t = String(data2[i][2] || '');
      var s = String(data2[i][3] || '');
      var d = String(data2[i][4] || '');
      existingIds[t + '|' + s + '|' + d] = i + 2;
    }
  }

  var lastRowCal = shCal.getLastRow();

  for (var sem = 0; sem < 5; sem++) {
    var filaTarea = filasTarea[sem];
    if (filaTarea > lastRowCal) break;

    var notas = shCal.getRange(filaTarea, 4, 1, 7).getValues()[0];

    for (var d = 0; d < 7; d++) {
      var nota     = String(notas[d] || '').trim();
      if (!nota) continue;

      var diaLetra = diasLetra[d];
      var idClave  = String(ctx.temporada) + '|' + (sem + 1) + '|' + diaLetra;

      if (existingIds[idClave]) {
        var rowToUpdate = existingIds[idClave];
        shCal2.getRange(rowToUpdate, 6).setValue(nota);
        continue;
      }

      var newN = shCal2.getLastRow() + 1;
      shCal2.appendRow([newN, new Date(), ctx.temporada, sem + 1, diaLetra, nota]);
      var newRow = shCal2.getLastRow();
      _setDateCell(shCal2, newRow, 2, new Date(), 'dd/mm/yyyy');
      existingIds[idClave] = newRow;
    }
  }

  Logger.log('[Calendario_2] Sincronización completada.');
}

// ----- Funciones internas / helpers -----

/**
 * _clonarCtxParaTemporada(ctxReal, temporadaMostrar) [→ Contexto_Base_Web.md §22B037]
 */
function _clonarCtxParaTemporada(ctxReal, temporadaMostrar) {
  var ctx = {};
  for (var k in ctxReal) { ctx[k] = ctxReal[k]; }
  ctx.temporada = temporadaMostrar;

  if (temporadaMostrar === ctxReal.temporada) {
    return ctx; // temporada real en curso: se respeta el avance real (semana/día actuales)
  }

  ctx.periodIndex           = 34; // semana 5, día 3: último periodIndex posible de una temporada
  ctx.sectionIndex          = 4;
  ctx.esDiaGuerra           = true;
  ctx.periodIndexSospechoso = false;
  return ctx;
}
// Requisitos para que la columna "Ascenso" de Control muestre "Sí" (ver [→ Contexto_Base_Web.md §22B038]
var REQUISITOS_ASCENSO = {
  ATAQUES_PCT: 1.0,      // Ataques.% >= 100%
  MIEMBRO_PROM: 2500,    // Puntaje.Prom si Rango actual = "Miembro"
  VETERANO_PROM: 3000,   // Puntaje.Prom si Rango actual = "Veterano"
  BARCOS_TOTAL: 0        // Barcos.Total debe ser exactamente 0
};
/**
 * _evaluarRequisitosAscenso(rango, ataqPct, puntProm, barcoTotal) [→ Contexto_Base_Web.md §22B039]
 */
function _evaluarRequisitosAscenso(rango, ataqPct, puntProm, barcoTotal) {
  var r = String(rango || '').trim();
  if (r !== 'Miembro' && r !== 'Veterano') return ''; // Colíder/Líder/vacío: sin ascenso automático

  var pctAtaques = Number(ataqPct) || 0;
  var promPuntaje = Number(puntProm) || 0;
  var totalBarcos = (barcoTotal === '') ? 0 : (Number(barcoTotal) || 0);

  var promRequerido = (r === 'Miembro') ? REQUISITOS_ASCENSO.MIEMBRO_PROM : REQUISITOS_ASCENSO.VETERANO_PROM;

  var cumple = (pctAtaques >= REQUISITOS_ASCENSO.ATAQUES_PCT) &&
               (promPuntaje >= promRequerido) &&
               (totalBarcos === REQUISITOS_ASCENSO.BARCOS_TOTAL);

  return cumple ? 'Sí' : 'No';
}

/**
 * _aplicarVisibilidadSemanasControl(sh, ctx, colInicioGrid) [→ Contexto_Base_Web.md §22B040]
 */
function _aplicarVisibilidadSemanasControl(sh, ctx, colInicioGrid) {
  var categorias = [0, 27, 54, 79]; // offsets de cada categoría dentro del grid de 105 cols (ver OFF en updateControlSheet)
  for (var sem = 0; sem < 5; sem++) {
    for (var c = 0; c < categorias.length; c++) {
      var colIni = colInicioGrid + categorias[c] + sem * 5;
      try {
        // La categoría "Puntaje acumulado" (offset 54 dentro del grid, ver [→ Contexto_Base_Web.md §22B041]
        if (categorias[c] === 54 || sem > ctx.sectionIndex) {
          sh.hideColumns(colIni, 5);
        } else {
          sh.showColumns(colIni, 5);
        }
      } catch(e) {
        Logger.log('[Control] Error en visibilidad de columnas (sem ' + sem + '): ' + e.message);
      }
    }
  }
}

function _sumaOVacio(arr, base, n) {
  var vals = [];
  for (var i = 0; i < n; i++) {
    var v = arr[base + i];
    if (v !== '' && v !== null && v !== undefined) vals.push(Number(v) || 0);
  }
  return vals.length === 0 ? '' : vals.reduce(function(a,b){return a+b;},0);
}

function _maxOVacio(arr, base, n) {
  var vals = [];
  for (var i = 0; i < n; i++) {
    var v = arr[base + i];
    if (v !== '' && v !== null && v !== undefined) vals.push(Number(v) || 0);
  }
  return vals.length === 0 ? '' : Math.max.apply(null, vals);
}

/**
 * _ULTIMO_DIAGNOSTICO_GUERRA_CSV [→ Contexto_Base_Web.md §22B042]
 */
var _ULTIMO_DIAGNOSTICO_GUERRA_CSV = null;

// MEMO POR EJECUCIÓN de Backup_Guerra.csv (19-sep-2026, pedido del usuario -- [→ Contexto_Base_Web.md §22B043]
var _GUERRA_MEMO_ACTIVO = false;
var _GUERRA_CSV_MEMO    = null; // { diag:string|null, totalFilas:number, porTemporada:{ '7': [fila,...] } }
var _GUERRA_MAPA_MEMO   = {};   // { '7': mapa de _procesarFilasGuerraParaControl() de esa temporada histórica }
// 19-sep-2026 (medición real: control2Vigente=4.9 s, valoresDiarios=2.3 s): filas crudas de la hoja
// Guerra (getValues) leídas UNA vez durante la sesión del dashboard, en vez de una por cuadrícula.
var _GUERRA_HOJA_MEMO   = null;

function _guerraMemoIniciar_() {
  _GUERRA_MEMO_ACTIVO = true;
  _GUERRA_CSV_MEMO    = null;
  _GUERRA_MAPA_MEMO   = {};
  _GUERRA_HOJA_MEMO   = null;
}

function _guerraMemoTerminar_() {
  _GUERRA_MEMO_ACTIVO = false;
  _GUERRA_CSV_MEMO    = null;
  _GUERRA_MAPA_MEMO   = {};
  _GUERRA_HOJA_MEMO   = null;
}

/**
 * _leerGuerraCsvAgrupado_() [→ Contexto_Base_Web.md §22B044]
 */
function _leerGuerraCsvAgrupado_() {
  if (_GUERRA_MEMO_ACTIVO && _GUERRA_CSV_MEMO) return _GUERRA_CSV_MEMO;

  var res = { diag: null, totalFilas: 0, porTemporada: {} };
  var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
  if (!csvText) {
    res.diag = 'NO_EXISTE';
  } else {
    var parsed = _parseCSV(csvText);
    if (!parsed || parsed.length <= 1) {
      res.diag = 'SIN_FILAS';
    } else {
      res.totalFilas = parsed.length - 1;
      for (var i = 1; i < parsed.length; i++) {
        var t = String(parsed[i][GC.TEMPORADA - 1] || '');
        if (!Object.prototype.hasOwnProperty.call(res.porTemporada, t)) res.porTemporada[t] = [];
        res.porTemporada[t].push(parsed[i]);
      }
    }
  }

  if (_GUERRA_MEMO_ACTIVO) _GUERRA_CSV_MEMO = res;
  return res;
}

/**
 * _getDatosGuerraParaControl(ctx, temporadaReal) [→ Contexto_Base_Web.md §22B045]
 */
function _getDatosGuerraParaControl(ctx, temporadaReal) {
  if (temporadaReal === undefined || temporadaReal === null) {
    temporadaReal = _getCtx().temporada;
  }

  if (String(ctx.temporada) === String(temporadaReal)) {
    return _getDatosGuerraDesdeHojaParaControl(ctx);
  }
  return _getDatosGuerraDesdeCsvParaControl(ctx);
}

/**
 * _getDatosGuerraDesdeHojaParaControl(ctx) [→ Contexto_Base_Web.md §22B046]
 */
function _getDatosGuerraDesdeHojaParaControl(ctx) {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.GUERRA);
  if (!sh || sh.getLastRow() < 2) return {};

  // 19-sep-2026 (medición real del dashboard): con la memo activa (solo dentro de [→ Contexto_Base_Web.md §22B047]
  var data;
  if (_GUERRA_MEMO_ACTIVO && _GUERRA_HOJA_MEMO) {
    data = _GUERRA_HOJA_MEMO;
  } else {
    data = sh.getRange(2, 1, sh.getLastRow() - 1, GUERRA_TOTAL_COLS).getValues();
    if (_GUERRA_MEMO_ACTIVO) _GUERRA_HOJA_MEMO = data;
  }
  // NUEVO (19-sep-2026): `true` = temporada real, aquí sí se puede marcar los
  // días opcionales por cruce de meta (ver _clanYaCruzoMetaEnPeriodo()).
  return _procesarFilasGuerraParaControl(data, ctx, true);
}

/**
 * _getDatosGuerraDesdeCsvParaControl(ctx) [→ Contexto_Base_Web.md §22B048]
 */
function _getDatosGuerraDesdeCsvParaControl(ctx) {
  _ULTIMO_DIAGNOSTICO_GUERRA_CSV = null; // se resetea en cada llamada -- ver docblock de arriba

  // MEMO POR EJECUCIÓN (19-sep-2026, ver bloque "MEMO POR EJECUCIÓN" arriba): [→ Contexto_Base_Web.md §22B049]
  var claveMapa = String(ctx.temporada);
  if (_GUERRA_MEMO_ACTIVO && Object.prototype.hasOwnProperty.call(_GUERRA_MAPA_MEMO, claveMapa)) {
    _ULTIMO_DIAGNOSTICO_GUERRA_CSV = _GUERRA_MAPA_MEMO[claveMapa].diag;
    return _GUERRA_MAPA_MEMO[claveMapa].mapa;
  }

  try {
    // 19-sep-2026: la lectura + parseo de Backup_Guerra.csv pasó a [→ Contexto_Base_Web.md §22B050]
    var csvGuerra = _leerGuerraCsvAgrupado_();

    if (csvGuerra.diag === 'NO_EXISTE') {
      _ULTIMO_DIAGNOSTICO_GUERRA_CSV = 'Backup_Guerra.csv no existe (o está vacío) en Drive -- ' +
        'no hay ningún respaldo del cual leer la temporada ' + ctx.temporada + '.';
      Logger.log('[Control] ' + _ULTIMO_DIAGNOSTICO_GUERRA_CSV);
      return {};
    }

    if (csvGuerra.diag === 'SIN_FILAS') {
      _ULTIMO_DIAGNOSTICO_GUERRA_CSV = 'Backup_Guerra.csv existe pero no tiene ninguna fila de ' +
        'datos (solo encabezado o completamente vacío).';
      Logger.log('[Control] ' + _ULTIMO_DIAGNOSTICO_GUERRA_CSV);
      return {};
    }

    var data = Object.prototype.hasOwnProperty.call(csvGuerra.porTemporada, claveMapa)
      ? csvGuerra.porTemporada[claveMapa]
      : [];

    Logger.log('[Control] _getDatosGuerraParaControl: temporada histórica ' + ctx.temporada +
      ' leída directo de Backup_Guerra.csv (' + data.length + ' fila(s) — hoja Guerra no tocada).');

    if (data.length === 0) {
      _ULTIMO_DIAGNOSTICO_GUERRA_CSV = 'Backup_Guerra.csv tiene ' + csvGuerra.totalFilas +
        ' fila(s) en total, pero NINGUNA con Temporada=' + ctx.temporada + ' -- esa temporada ' +
        'nunca quedó respaldada ahí (revisar si _syncGuerraCSV()/_purgarTemporadasAnterioresGuerra(), ' +
        '17_GuerraSheet.gs, llegaron a correr mientras esa temporada todavía estaba vigente).';
      // No se devuelve todavía -- se sigue el camino normal (mapa vacío),
      // el diagnóstico queda disponible igual para quien lo consulte.
    }

    var mapaHistorico = _procesarFilasGuerraParaControl(data, ctx, 'historico');
    if (_GUERRA_MEMO_ACTIVO) {
      _GUERRA_MAPA_MEMO[claveMapa] = { mapa: mapaHistorico, diag: _ULTIMO_DIAGNOSTICO_GUERRA_CSV };
    }
    return mapaHistorico;
  } catch(e) {
    _ULTIMO_DIAGNOSTICO_GUERRA_CSV = 'Error leyendo o parseando Backup_Guerra.csv para la ' +
      'temporada histórica ' + ctx.temporada + ': ' + e.message;
    Logger.log('[Control] ' + _ULTIMO_DIAGNOSTICO_GUERRA_CSV);
    return {};
  }
}

// CRUCE DE META POR DÍA (19-sep-2026, pedido del usuario): ¿el clan ya había [→ Contexto_Base_Web.md §22B051]
var _CRUCE_META_LOGS_MEMO = null;   // { 'temp|clan': { periodIndex: {ini, fin} } }
var _CRUCE_META_RES_MEMO  = {};     // { 'temp|clan|pIdx': true/false }
var _CRUCE_META_JSON_IDX  = {};     // { 'clan': { 'T|S|P': DriveFile } }
var _CRUCE_META_JSON_RES  = {};     // { 'temp|clan|pIdx': true/false/null }

function _cruceNormTemporada_(t) {
  var n = Number(t);
  return isFinite(n) && String(t).trim() !== '' ? String(n) : String(t || '').trim();
}

/**
 * _getMapaCruceMetaGuerraLogs_() [→ Contexto_Base_Web.md §22B052]
 */
function _getMapaCruceMetaGuerraLogs_() {
  if (_CRUCE_META_LOGS_MEMO) return _CRUCE_META_LOGS_MEMO;
  var mapa = {};
  try {
    var lectura = _obtenerFilasConFallbackCSV(
      _getSs(), CFG.SHEETS.GUERRA_LOGS, 'Backup_Guerra_Logs.csv', GUERRA_LOGS_TOTAL_COLS, 1
    );
    var filas = (lectura && lectura.filas) || [];
    for (var i = 0; i < filas.length; i++) {
      var r = filas[i];
      var temp   = _cruceNormTemporada_(r[GLC.TEMPORADA - 1]);
      var nombre = _normalizarNombreClan_(r[GLC.CLAN - 1]);
      var p      = Number(r[GLC.PERIOD_IDX - 1]);
      if (!temp || !nombre || !isFinite(p)) continue;
      var k = temp + '|' + nombre;
      if (!mapa[k]) mapa[k] = {};
      var reg = mapa[k][p] || (mapa[k][p] = { ini: 0, fin: 0 });
      // TANDA 12 (21-sep-2026): si la lectura cae al respaldo CSV, las celdas llegan [→ Contexto_Base_Web.md §22B053]
      reg.ini = Math.max(reg.ini, _numDesdeCeldaLogs_(r[GLC.PROG_START - 1]) || 0);
      reg.fin = Math.max(reg.fin, _numDesdeCeldaLogs_(r[GLC.PROG_END   - 1]) || 0);
    }
  } catch (e) {
    Logger.log('[Control] No se pudo leer Guerra_Logs para cruce de meta: ' + e.message);
  }
  _CRUCE_META_LOGS_MEMO = mapa;
  return mapa;
}

/** Fuente 1. true/false si Guerra_Logs tiene dato de ese clan/día; null si no. */
function _cruceMetaDesdeGuerraLogs_(nombreClan, pIdx, temporada) {
  var reg = _getMapaCruceMetaGuerraLogs_()[_cruceNormTemporada_(temporada) + '|' + _normalizarNombreClan_(nombreClan)];
  if (!reg) return null;
  var cur = reg[pIdx], prev = reg[pIdx - 1];
  if ((cur && cur.ini >= META_GUERRA_PROGRESO) || (prev && prev.fin >= META_GUERRA_PROGRESO)) return true;
  if ((prev && prev.fin > 0) || (cur && cur.ini > 0)) return false;
  return null;
}

/**
 * Fuente 2. Busca en Drive el JSON de currentriverrace del periodo `pIdx` [→ Contexto_Base_Web.md §22B054]
 */
function _cruceMetaDesdeJsonDrive_(nombreClan, pIdx, temporada) {
  try {
    var nombre = _normalizarNombreClan_(nombreClan);
    var claveRes = _cruceNormTemporada_(temporada) + '|' + nombre + '|' + pIdx;
    if (_CRUCE_META_JSON_RES.hasOwnProperty(claveRes)) return _CRUCE_META_JSON_RES[claveRes];

    if (!_CRUCE_META_JSON_IDX[nombre]) {
      var idx = {};
      var carpeta = _getSubcarpetaEndpoint_(_getCarpetaParaClan(nombreClan), 'currentriverrace');
      var it = carpeta.getFiles();
      while (it.hasNext()) {
        var f = it.next();
        var m = /^T-(\d+)\s+S-(\d+)\s+P\.I-(\d+)\s.*- currentriverrace\.json$/i.exec(f.getName());
        if (m) idx[Number(m[1]) + '|' + Number(m[2]) + '|' + Number(m[3])] = f;
      }
      _CRUCE_META_JSON_IDX[nombre] = idx;
    }
    var archivo = _CRUCE_META_JSON_IDX[nombre][Number(temporada) + '|' + (periodIdxToSectionIndex(pIdx) + 1) + '|' + pIdx];
    var res = null;
    if (archivo) {
      var obj = JSON.parse(archivo.getBlob().getDataAsString('UTF-8'));
      var miTag = String((obj.clan && obj.clan.tag) || obj.tag || '').toUpperCase();
      var logs = obj.periodLogs || [];
      for (var l = 0; l < logs.length && res === null; l++) {
        var pl = Number(logs[l].periodIndex);
        if (pl !== pIdx && pl !== pIdx - 1) continue;
        var items = logs[l].items || [];
        for (var k = 0; k < items.length; k++) {
          if (!items[k] || !items[k].clan || String(items[k].clan.tag || '').toUpperCase() !== miTag) continue;
          if (pl === pIdx - 1 && items[k].progressEndOfDay !== undefined) res = Number(items[k].progressEndOfDay) >= META_GUERRA_PROGRESO;
          if (pl === pIdx     && items[k].progressStartOfDay !== undefined) res = Number(items[k].progressStartOfDay) >= META_GUERRA_PROGRESO;
          break;
        }
      }
    }
    _CRUCE_META_JSON_RES[claveRes] = res;
    return res;
  } catch (e) {
    Logger.log('[Control] JSON de Drive no disponible para cruce de meta (' + nombreClan + ', periodo ' + pIdx + '): ' + e.message);
    return null;
  }
}

/**
 * _esPeriodoDeColiseo_(temporada, pIdx) [→ Contexto_Base_Web.md §22B055]
 */
function _esPeriodoDeColiseo_(temporada, pIdx) {
  try {
    var t = Number(temporada);
    var p = Number(pIdx);
    if (!isFinite(t) || t < 1 || !isFinite(p) || p < 0) return false;
    var numSem = Number(_getSemanasDeTemporada(t)) || 0;
    if (numSem < 1) return false;
    return periodIdxToSectionIndex(p) === (numSem - 1);
  } catch (e) {
    Logger.log('[Control] No se pudo determinar si el periodo ' + pIdx + ' de la temporada ' + temporada + ' es coliseo: ' + e.message);
    return false;
  }
}

/**
 * _clanYaCruzoMetaEnPeriodo(nombreClan, periodIndex, temporada, permitirCache) [→ Contexto_Base_Web.md §22B056]
 */
function _clanYaCruzoMetaEnPeriodo(nombreClan, periodIndex, temporada, permitirCache) {
  try {
    var buscado = String(nombreClan || '').trim();
    var pIdx = Number(periodIndex);
    if (!buscado || !isFinite(pIdx)) return false;
    if (temporada !== undefined && temporada !== null && temporada !== '') {
      // CAMBIO (07-oct-2026, criterio unificado; reemplaza el límite al domingo del 06-oct): el jueves nunca es opcional… [→ Contexto_Base_Web.md §22B057]
      if ((pIdx % 7) <= 3) return false;
      // TANDA 9 (21-sep-2026): semana de COLISEO (última de la temporada) -> nunca [→ Contexto_Base_Web.md §22B058]
      if (_esPeriodoDeColiseo_(temporada, pIdx)) return false;
      var claveMemo = _cruceNormTemporada_(temporada) + '|' + _normalizarNombreClan_(buscado) + '|' + pIdx;
      if (_CRUCE_META_RES_MEMO.hasOwnProperty(claveMemo)) return _CRUCE_META_RES_MEMO[claveMemo];
      var r = _cruceMetaDesdeGuerraLogs_(buscado, pIdx, temporada);
      if (r === null) r = _cruceMetaDesdeJsonDrive_(buscado, pIdx, temporada);
      if (r === null && permitirCache) r = _cruceMetaDesdeCacheApi_(buscado, pIdx);
      r = (r === true);
      _CRUCE_META_RES_MEMO[claveMemo] = r;
      return r;
    }
    return _cruceMetaDesdeCacheApi_(buscado, pIdx) === true;
  } catch (e) {
    Logger.log('[Control] No se pudo evaluar cruce de meta (' + nombreClan + ', periodo ' + periodIndex + '): ' + e.message);
  }
  return false;
}

/**
 * Fuente 3 (lógica original del 19-sep-2026, sin cambios): caché de [→ Contexto_Base_Web.md §22B059]
 */
function _cruceMetaDesdeCacheApi_(buscado, pIdx) {
  for (var i = 0; i < CFG.TERNA_TAGS.length; i++) {
    var clanTag  = CFG.TERNA_TAGS[i];
    var clanData = _getClanCache(clanTag);
    if (!clanData || !clanData.info) continue;
    if (String(clanData.info.name || '').trim() !== buscado) continue;
    var rr = clanData.riverrace;
    if (!rr || !rr.clan) return null;
    if (Number(rr.periodIndex) === pIdx) {
      // TANDA 9 (21-sep-2026): en coliseo clan.fame es fama acumulada de la
      // semana (100000+), no progreso de barco: nunca es "cruzó la meta".
      if (String(rr.periodType || '') === 'colosseum') return false;
      return Number(rr.clan.fame) >= META_GUERRA_PROGRESO;
    }
    var logs = rr.periodLogs || [];
    for (var l = 0; l < logs.length; l++) {
      if (Number(logs[l].periodIndex) !== pIdx) continue;
      var items = logs[l].items || [];
      for (var k = 0; k < items.length; k++) {
        if (items[k] && items[k].clan && items[k].clan.tag === clanTag) {
          return Number(items[k].progressStartOfDay) >= META_GUERRA_PROGRESO;
        }
      }
    }
    return false;
  }
  return null;
}

/**
 * CONTROL_SUMA_ENTRE_CLANES (3-oct-2026, parte 54, sub-tanda 3.4 de la Tanda 3, pregunta 42 y 56 del consolidado) [→ Contexto_Base_Web.md §22B060]
 */
var CONTROL_SUMA_ENTRE_CLANES = true;

/**
 * _procesarFilasGuerraParaControl(data, ctx, aplicarCruceMeta) [→ Contexto_Base_Web.md §22B061]
 */
function _procesarFilasGuerraParaControl(data, ctx, aplicarCruceMeta) {
  // 19-sep-2026 (pedido del usuario -- webGuerraEnVivo tardaba 28-39 s): dentro [→ Contexto_Base_Web.md §22B062]
  if (_GUERRA_MEMO_ACTIVO) aplicarCruceMeta = false;
  if (aplicarCruceMeta) { _CRUCE_META_LOGS_MEMO = null; _CRUCE_META_RES_MEMO = {}; } // datos frescos de Guerra_Logs en cada corrida
  var map = {};
  var fameByTagPeriod   = {};
  // boatAttacks es ACUMULADO para toda la semana de guerra (no se reinicia [→ Contexto_Base_Web.md §22B063]
  var barcosByTagPeriod = {};
  // NUEVO (3-oct-2026, 3.4): lo mismo pero separado por clan, para sumar entre clanes despues.
  // porClan[tag][sIdx] = { claves:{ clan: {pIdx: {fameUlt, fameMax, barcos, ataques, acum}} }, sinClan:bool }
  var porClan = {};

  for (var i = 0; i < data.length; i++) {
    var tempStr  = String(data[i][2] || '');
    if (String(ctx.temporada) !== tempStr) continue;

    var semana  = Number(data[i][3] || 1);
    var sIdx    = semana - 1;
    var pIdx    = Number(data[i][5] || 0);
    var tag     = String(data[i][9] || '').trim();
    var ataques = Number(data[i][11]) || 0;
    // FIX (28-sep-2026): AtaquesSemana (col. M) es el contador ACUMULADO de la [→ Contexto_Base_Web.md §22B064]
    var ataquesAcum = Number(data[i][12]) || 0;
    var fame    = Number(data[i][13]) || 0;
    var barcos  = Number(data[i][14]) || 0;
    // NUEVO (29-sep-2026, P1 de la pregunta 30 del consolidado): columna Origen (GC.ORIGEN, col. 20)
    // de la fila: 'Original' | 'Corregido' | 'Reconstruido'. Vacia o ausente (CSV viejo) = real.
    var esFilaReconstruida = String(data[i][GC.ORIGEN - 1] || '').trim().toLowerCase() === 'reconstruido';

    if (!tag || !esDiaGuerraIdx(pIdx)) continue;

    var offDia = (pIdx % 7) - 3;

    if (!map[tag])       map[tag] = {};
    if (!map[tag][sIdx]) map[tag][sIdx] = {};
    var clave = 'dia_' + offDia;
    if (!map[tag][sIdx][clave]) {
      map[tag][sIdx][clave] = { ataques: ataques, ataquesAcum: ataquesAcum, fameAcum: fame, barcos: 0, puntaje: 0 };
      // 29-sep-2026 (P1): true solo mientras TODAS las filas de ese dia sean 'Reconstruido'. Solo lo lee [→ Contexto_Base_Web.md §22B065]
      if (esFilaReconstruida) map[tag][sIdx][clave].soloReconstruido = true;
    } else {
      if (!esFilaReconstruida) delete map[tag][sIdx][clave].soloReconstruido; // basta una fila real para que el dia sea real
      if (ataques > map[tag][sIdx][clave].ataques) map[tag][sIdx][clave].ataques = ataques;
      if (ataquesAcum > (map[tag][sIdx][clave].ataquesAcum || 0)) map[tag][sIdx][clave].ataquesAcum = ataquesAcum;
      if (fame    > map[tag][sIdx][clave].fameAcum) map[tag][sIdx][clave].fameAcum = fame;
    }
    if (aplicarCruceMeta && !map[tag][sIdx][clave].opcional &&
        _clanYaCruzoMetaEnPeriodo(String(data[i][GC.CLAN - 1] || ''), pIdx, tempStr, aplicarCruceMeta === true)) {
      map[tag][sIdx][clave].opcional = true;
    }
    if (!fameByTagPeriod[tag])   fameByTagPeriod[tag]   = {};
    if (!barcosByTagPeriod[tag]) barcosByTagPeriod[tag] = {};
    fameByTagPeriod[tag][pIdx]   = fame;
    // boatAttacks acumulado: nos quedamos con el mayor visto para ese periodIndex
    barcosByTagPeriod[tag][pIdx] = Math.max(barcosByTagPeriod[tag][pIdx] || 0, barcos);

    // NUEVO (3-oct-2026, 3.4): mismo dato, por clan. Dentro de un mismo clan y dia se conservan [→ Contexto_Base_Web.md §22B066]
    if (!porClan[tag])       porClan[tag] = {};
    if (!porClan[tag][sIdx]) porClan[tag][sIdx] = { claves: {}, sinClan: false };
    var claveClan = String(data[i][GC.CLAN - 1] || '').trim().toLowerCase();
    if (!claveClan) porClan[tag][sIdx].sinClan = true;
    var pcs = porClan[tag][sIdx].claves;
    if (!pcs[claveClan]) pcs[claveClan] = {};
    var pce = pcs[claveClan][pIdx];
    if (!pce) {
      pcs[claveClan][pIdx] = { fameUlt: fame, fameMax: fame, barcos: barcos, ataques: ataques, acum: ataquesAcum };
    } else {
      pce.fameUlt = fame;
      if (fame > pce.fameMax) pce.fameMax = fame;
      if (barcos > pce.barcos) pce.barcos = barcos;
      if (ataques > pce.ataques) pce.ataques = ataques;
      if (ataquesAcum > pce.acum) pce.acum = ataquesAcum;
    }
  }

  for (var tag in map) {
    for (var sIdx in map[tag]) {
      for (var d = 0; d < 4; d++) {
        var clave = 'dia_' + d;
        if (!map[tag][sIdx][clave]) continue;
        var pIdxHoy  = Number(sIdx) * 7 + 3 + d;
        var pIdxAyer = pIdxHoy - 1;

        var fameHoy  = (fameByTagPeriod[tag] && fameByTagPeriod[tag][pIdxHoy])  || 0;
        var fameAyer = (fameByTagPeriod[tag] && fameByTagPeriod[tag][pIdxAyer]) || 0;
        var deltaFame = fameHoy - fameAyer;
        map[tag][sIdx][clave].puntaje = Math.min(Math.max(deltaFame, 0), 900);

        // Barcos del día = acumulado de hoy - acumulado de ayer (mismo patrón que Fame). [→ Contexto_Base_Web.md §22B067]
        var barcosHoy  = (barcosByTagPeriod[tag] && barcosByTagPeriod[tag][pIdxHoy])  || 0;
        var barcosAyer = (barcosByTagPeriod[tag] && barcosByTagPeriod[tag][pIdxAyer]) || 0;
        var deltaBarcos = barcosHoy - barcosAyer;
        map[tag][sIdx][clave].barcos = Math.max(deltaBarcos, 0);
      }

      // NUEVO (3-oct-2026, 3.4): si esa semana el jugador tiene filas de 2 o mas clanes, se sobreescriben [→ Contexto_Base_Web.md §22B068]
      if (CONTROL_SUMA_ENTRE_CLANES) _sumarEntreClanesSemanaControl_(map[tag][sIdx], porClan[tag] && porClan[tag][sIdx], Number(sIdx));
    }
  }

  return map;
}

/**
 * _sumarEntreClanesSemanaControl_(semMap, info, sIdx) [→ Contexto_Base_Web.md §22B069]
 */
function _sumarEntreClanesSemanaControl_(semMap, info, sIdx) {
  if (!semMap || !info || info.sinClan) return false;
  var claves = Object.keys(info.claves || {});
  if (claves.length < 2) return false;
  var ultFame = {}, ultAcum = {};
  claves.forEach(function (c) { ultFame[c] = 0; ultAcum[c] = 0; });
  for (var d = 0; d < 4; d++) {
    var pHoy = sIdx * 7 + 3 + d;
    var pAyer = pHoy - 1;
    var ataq = 0, acumTot = 0, fameTot = 0, punt = 0, barc = 0;
    for (var k = 0; k < claves.length; k++) {
      var c = claves[k];
      var hoy = info.claves[c][pHoy];
      if (hoy) {
        var ayer = info.claves[c][pAyer];
        ultFame[c] = hoy.fameMax;
        ultAcum[c] = hoy.acum;
        ataq += hoy.ataques;
        punt += Math.max(hoy.fameUlt - (ayer ? ayer.fameUlt : 0), 0);
        barc += Math.max(hoy.barcos - (ayer ? ayer.barcos : 0), 0);
      }
      fameTot += ultFame[c];
      acumTot += ultAcum[c];
    }
    var dd = semMap['dia_' + d];
    if (!dd) continue; // dia sin ninguna fila: sigue sin dato
    dd.ataques     = Math.min(ataq, 4);
    dd.ataquesAcum = acumTot;
    dd.fameAcum    = fameTot;
    dd.puntaje     = Math.min(punt, 900);
    dd.barcos      = barc;
  }
  return true;
}

/**
 * _getAgregadosAscensoPorTag() [→ Contexto_Base_Web.md §22B070]
 */
function _getAgregadosAscensoPorTag() {
  var resultado = {};

  var ctxReal = _getCtx();
  if (ctxReal.periodIndexSospechoso) {
    Logger.log('[Ascenso] ABORT (cálculo independiente): periodIndex sospechoso, no se recalculan agregados de ascenso esta corrida.');
    return resultado;
  }

  var ss    = _getSs();
  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!shDir || shDir.getLastRow() < 2) return resultado;

  // Fase C2 (16/07/2026): Estado/ClanTag/Vetado/Tag siguen físicamente en
  // Directorio (29 cols, orden IC) — se indexa con IC en vez de DC.
  var dirData = shDir.getRange(2, 1, shDir.getLastRow() - 1, DIR_SHEET_COLS).getValues();
  // Fase 10 (17/07/2026): igual que en la otra función de este archivo — [→ Contexto_Base_Web.md §22B071]
  var jugadoresActivos = dirData.filter(function(r) {
    return String(r[IC.ESTADO - 1]) === 'Activo' &&
           CFG.TERNA_TAGS.indexOf(String(r[IC.CLAN_TAG - 1])) >= 0;
  });
  if (jugadoresActivos.length === 0) return resultado;

  var guerraData = _getDatosGuerraParaControl(ctxReal, ctxReal.temporada); // ctx.temporada === temporadaReal -> siempre lee la hoja Guerra
  var numSemanasTemporada = lunesEnMes(ctxReal.mesEfectivoAnio, ctxReal.mesEfectivoMes) || 4;

  for (var i = 0; i < jugadoresActivos.length; i++) {
    var jug = jugadoresActivos[i];
    var tag = String(jug[IC.TAG - 1] || '').trim();
    if (!tag) continue;

    var gd = guerraData[tag];

    var ataqTotal   = 0;
    var huboAtaques = false;
    // FIX (24-ago-2026, pedido usuario): cuenta cuántas semanas de ESTE [→ Contexto_Base_Web.md §22B072]
    var semanasAtaqueContadas = 0;
    var diasOpcionalesContados = 0;
    var puntTotales = []; // solo semanas 1..numSemanasTemporada, igual que updateControlSheet()
    var barcoTotal  = 0;
    var huboBarcos  = false;

    for (var sem = 0; sem < 5; sem++) {
      var semData = gd ? gd[sem] : null;
      if (!semData) continue;

      var ataqSem = 0, puntSem = 0, barcoSem = 0, tuvoDatosSem = false, optSem = 0;
      for (var d = 0; d < 4; d++) {
        var dData = semData['dia_' + d];
        if (!dData) continue;
        tuvoDatosSem = true;
        // 19-sep-2026: ataques REALES; el día opcional por cruce de meta no
        // regala ataques, baja lo exigido (4 por día, ver denomAtaques abajo).
        if (dData.opcional) optSem++;
        puntSem  += Number(dData.puntaje) || 0;
        barcoSem += Number(dData.barcos)  || 0;
      }
      if (!tuvoDatosSem) continue;
      ataqSem = _totalesSemanaDesdeAcumulados(semData).ataques; // FIX (28-sep-2026)

      // Barcos no se limita a numSemanasTemporada (igual que BAR_TOTAL en [→ Contexto_Base_Web.md §22B073]
      huboBarcos  = true;
      barcoTotal += barcoSem;

      // Ataques y Puntaje SÍ se limitan a las semanas 1..numSemanasTemporada [→ Contexto_Base_Web.md §22B074]
      if (sem < numSemanasTemporada) {
        huboAtaques = true;
        ataqTotal += ataqSem;
        semanasAtaqueContadas++;
        diasOpcionalesContados += optSem;
        puntTotales.push(puntSem);
      }
    }

    // 19-sep-2026: sumatoria exigida = 16 por semana menos 4 por cada día [→ Contexto_Base_Web.md §22B075]
    var denomAtaques = 16 * semanasAtaqueContadas - 4 * diasOpcionalesContados;
    var ataqPct = huboAtaques ? (denomAtaques > 0 ? Math.min(ataqTotal / denomAtaques, 1) : 0) : '';

    var puntProm = '';
    if (puntTotales.length > 0) {
      puntProm = puntTotales.reduce(function(a, b) { return a + b; }, 0) / puntTotales.length;
    }

    resultado[tag] = {
      ataqPct:    ataqPct,
      puntProm:   puntProm,
      barcoTotal: huboBarcos ? barcoTotal : ''
    };
  }

  return resultado;
}

function _getAtaquesHoyCache() {
  var map = {};
  for (var i = 0; i < CFG.TERNA_TAGS.length; i++) {
    var clanData = _getClanCache(CFG.TERNA_TAGS[i]);
    if (!clanData || !clanData.riverrace || !clanData.riverrace.clan) continue;
    var parts = clanData.riverrace.clan.participants || [];
    for (var j = 0; j < parts.length; j++) {
      var tag = parts[j].tag;
      map[tag] = Math.max(map[tag] || 0, Number(parts[j].decksUsedToday) || 0);
    }
  }
  return map;
}

// FIX (03-ago-2026): reglas de formato condicional COMPARTIDAS entre Control [→ Contexto_Base_Web.md §22B076]

function _reglasCondFmtRango(rangoFijo, colRango) {
  return [
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + colRango + '4="Líder"').setBackground(CFG.COLORES.LIDER_BG).setRanges([rangoFijo]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + colRango + '4="Colíder"').setBackground(CFG.COLORES.COLIDER_BG).setRanges([rangoFijo]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + colRango + '4="Veterano"').setBackground(CFG.COLORES.VETERANO_BG).setRanges([rangoFijo]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + colRango + '4="Miembro"').setBackground(CFG.COLORES.MIEMBRO_BG).setRanges([rangoFijo]).build()
  ];
}

function _reglaCondFmtAscenso(rangoAscenso, colAscL) {
  return [
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + colAscL + '4="Sí"').setBackground(CFG.COLORES.ATAQUE_4).setRanges([rangoAscenso]).build()
  ];
}

// Corresponde a la 5ta columna (total semanal) de cada bloque de Ataques en Control.
function _reglaCondFmtAtaquesTotalSemana(rangoTotal, letr) {
  return [
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($' + letr + '4<>"", $' + letr + '4=16)')
      .setBackground(CFG.COLORES.CUMPLE_MING_BG)
      .setFontColor(CFG.COLORES.CUMPLE_MING_FG)
      .setBold(true)
      .setRanges([rangoTotal]).build()
  ];
}

/**
 * _buildMinGSwitchFormula(colClanL) [→ Contexto_Base_Web.md §22B077]
 */
function _buildMinGSwitchFormula(colClanL) {
  var byNombre = _getMinGClanMaps().byNombre;
  var partes = [];
  for (var nombre in byNombre) {
    if (!byNombre.hasOwnProperty(nombre)) continue;
    var nombreEscapado = String(nombre).replace(/"/g, '""');
    partes.push('"' + nombreEscapado + '",' + byNombre[nombre]);
  }
  if (partes.length === 0) return String(CFG.MIN_G_DEFAULT);
  return 'IFERROR(SWITCH($' + colClanL + '4,' + partes.join(',') + ',' + CFG.MIN_G_DEFAULT + '),' + CFG.MIN_G_DEFAULT + ')';
}

function _aplicarFmtCondicionalControl(sh, numJugadores) {
  if (numJugadores === 0) return;

  // FIX (03-ago-2026): 17->16 / 18->17 / col 7->6 / col 17->16 (se sacó "Jugador").
  var NUM_COLS_FIJAS  = 16;
  var COL_INICIO_GRID = 17;
  var rangoFijo = sh.getRange(4, 1, numJugadores, NUM_COLS_FIJAS);
  var colRango  = colLetter(6); // Rango en col 6
  var colClanL  = colLetter(5); // Clan en col 5 (usado por los VLOOKUP de Min_G)
  var rules     = [];

  rules = rules.concat(_reglasCondFmtRango(rangoFijo, colRango));

  // Columna fija "Ascenso" (16, después de "Ataques pendientes"): resalta en
  // verde cuando el jugador ya cumple los requisitos ("Sí").
  var colAscenso = sh.getRange(4, 16, numJugadores, 1);
  var colAscL = colLetter(16);
  rules = rules.concat(_reglaCondFmtAscenso(colAscenso, colAscL));

  for (var sem = 0; sem < 5; sem++) {
    for (var d = 0; d < 4; d++) {
      var gridCol = COL_INICIO_GRID + sem * 5 + d;
      var rango   = sh.getRange(4, gridCol, numJugadores, 1);
      var colL    = colLetter(gridCol);
      rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($' + colL + '4<>"", $' + colL + '4=4)').setBackground(CFG.COLORES.ATAQUE_4).setRanges([rango]).build());
      rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($' + colL + '4<>"", $' + colL + '4>=1, $' + colL + '4<=3)').setBackground(CFG.COLORES.ATAQUE_1_3).setRanges([rango]).build());
      rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($' + colL + '4<>"", $' + colL + '4=0)').setBackground(CFG.COLORES.ATAQUE_0).setRanges([rango]).build());
    }
  }

  // Totales semanales de Ataques (5ta columna de cada semana dentro del [→ Contexto_Base_Web.md §22B078]
  for (var sem = 0; sem < 5; sem++) {
    var colAtaTotal   = COL_INICIO_GRID + sem * 5 + 4;
    var rangoAtaTotal = sh.getRange(4, colAtaTotal, numJugadores, 1);
    var letrAtaTotal  = colLetter(colAtaTotal);
    rules = rules.concat(_reglaCondFmtAtaquesTotalSemana(rangoAtaTotal, letrAtaTotal));
  }

  for (var sem = 0; sem < 5; sem++) {
    for (var d = 0; d < 4; d++) {
      var gridCol = COL_INICIO_GRID + 79 + sem * 5 + d;
      var rango   = sh.getRange(4, gridCol, numJugadores, 1);
      var colL    = colLetter(gridCol);
      rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($' + colL + '4<>"", $' + colL + '4>0)').setBackground(CFG.COLORES.BARCO_POS).setRanges([rango]).build());
      rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($' + colL + '4<>"", $' + colL + '4=0)').setBackground(CFG.COLORES.BARCO_CERO_BG).setRanges([rango]).build());
    }
  }

  // Totales semanales de Barcos (5ta columna de cada semana dentro del bloque Barcos, [→ Contexto_Base_Web.md §22B079]
  for (var sem = 0; sem < 5; sem++) {
    var colBarcoTotal  = COL_INICIO_GRID + 79 + sem * 5 + 4;
    var rangoBarcoTotal = sh.getRange(4, colBarcoTotal, numJugadores, 1);
    var letrBarcoTotal  = colLetter(colBarcoTotal);
    rules = rules.concat(_reglasCondFmtBarcosTotalSemana(rangoBarcoTotal, letrBarcoTotal));
  }

  for (var sem = 0; sem < 5; sem++) {
    // --- PUNTAJE DIARIO (J, V, S, D) ---
    // Eliminado el relleno gris de base. Las reglas condicionales se activan solo si <>"".
    var colPuntDiario   = COL_INICIO_GRID + 27 + sem * 5;
    var rangoPuntDiario = sh.getRange(4, colPuntDiario, numJugadores, 4);
    // Ya no se pinta de gris de base aquí.

    for (var d = 0; d < 4; d++) {
      var colPuntDia   = colPuntDiario + d;
      var rangoPuntDia = sh.getRange(4, colPuntDia, numJugadores, 1);
      var letrPuntDia  = colLetter(colPuntDia);
      var minGLookupDia = _buildMinGSwitchFormula(colClanL);

      // 🔥 REGLAS DE PUNTAJE DIARIO (activadas solo si la celda NO está vacía)

      // 1. Si tiene dato y es 0 -> GRIS
      rules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied('=AND($' + letrPuntDia + '4<>"", $' + letrPuntDia + '4=0)')
        .setBackground(CFG.COLORES.PUNTAJE_DIARIO_BG)
        .setRanges([rangoPuntDia]).build());

      // 2. Si tiene dato y está entre 1 y 1599 -> NARANJA
      rules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied('=AND($' + letrPuntDia + '4<>"", $' + letrPuntDia + '4>=1, $' + letrPuntDia + '4 < 1600)')
        .setBackground(CFG.COLORES.PUNTAJE_BAJO_BG)
        .setRanges([rangoPuntDia]).build());

      // 3. Si tiene dato y está entre 1600 y Menos de Min_G -> AMARILLO
      rules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied('=AND($' + letrPuntDia + '4<>"", $' + letrPuntDia + '4 >= 1600, $' + letrPuntDia + '4 < ' + minGLookupDia + ')')
        .setBackground(CFG.COLORES.PUNTAJE_MEDIO_BG)
        .setRanges([rangoPuntDia]).build());

      // 4. Si tiene dato y >= Min_G -> AZUL (Cumple)
      rules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied('=AND($' + letrPuntDia + '4<>"", $' + letrPuntDia + '4 >= ' + minGLookupDia + ')')
        .setBackground(CFG.COLORES.CUMPLE_MING_BG)
        .setFontColor(CFG.COLORES.CUMPLE_MING_FG)
        .setBold(true)
        .setRanges([rangoPuntDia]).build());
    }

    // --- TOTAL SEMANAL DE PUNTAJE (T1, T2, T3...) ---
    // Regla compartida con Control_2 — ver _reglasCondFmtPuntajeTotalSemana().
    var colPuntaje = COL_INICIO_GRID + 27 + sem * 5 + 4;
    var rangoPunt  = sh.getRange(4, colPuntaje, numJugadores, 1);
    var letrPunt   = colLetter(colPuntaje);
    rules = rules.concat(_reglasCondFmtPuntajeTotalSemana(rangoPunt, letrPunt, colClanL));
  }

  // --- PUNTAJE ACUMULADO (se mantienen las reglas, aunque las columnas estén ocultas) --- [→ Contexto_Base_Web.md §22B080]
  for (var sem = 0; sem < 5; sem++) {
    var colAcum    = COL_INICIO_GRID + 54 + sem * 5 + 4;
    var rangoAcum  = sh.getRange(4, colAcum, numJugadores, 1);
    var letrAcum   = colLetter(colAcum);
    var minGLookupAcum = 'IFERROR(VLOOKUP($' + colClanL + '4, INDIRECT("Clan!$C:$F"), 4, FALSE), 2000)';

    var formVerdeAcum = '=AND($' + letrAcum + '4<>"", $' + letrAcum + '4 >= ' + minGLookupAcum + ')';
    var formRojoAcum  = '=AND($' + letrAcum + '4<>"", $' + letrAcum + '4 < ' + minGLookupAcum + ')';
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied(formVerdeAcum).setBackground('#b7e1cd').setRanges([rangoAcum]).build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied(formRojoAcum).setBackground('#f4c7c3').setRanges([rangoAcum]).build());
  }

  // "%" de Puntaje (Prom / Min_G de la semana actual): mismo estilo "cumple" [→ Contexto_Base_Web.md §22B081]
  var colPuntPct   = COL_INICIO_GRID + 53;
  var rangoPuntPct = sh.getRange(4, colPuntPct, numJugadores, 1);
  var letrPuntPct  = colLetter(colPuntPct);
  rules = rules.concat(_reglaCondFmtPuntajePct(rangoPuntPct, letrPuntPct));

  _tryCondFmt(sh, rules);

  // Ocultar la categoría completa de "Puntaje acumulado" (25 columnas: 5
  // semanas x [J,V,S,D,T]).
  sh.hideColumns(COL_INICIO_GRID + 54, 25);

  // Borde gris grueso a la izquierda donde inicia cada supercategoría y cada
  // bloque de columnas agregadas de temporada (Total/%/Prom).
  var totalFilas = 3 + numJugadores; // encabezados (1-3) + filas de datos
  var inicios = [
    COL_INICIO_GRID + 25,      // Ataques: Total (agregada de temporada)
    COL_INICIO_GRID + 27,      // Puntaje (categoría)
    COL_INICIO_GRID + 27 + 25, // Puntaje: Prom (agregada de temporada)
    COL_INICIO_GRID + 54,      // Puntaje acumulado (categoría)
    COL_INICIO_GRID + 79,      // Barcos (categoría)
    COL_INICIO_GRID + 79 + 25  // Barcos: Total (agregada de temporada)
  ];
  for (var b = 0; b < inicios.length; b++) {
    var rangoBorde = sh.getRange(1, inicios[b], totalFilas, 1);
    rangoBorde.setBorder(null, true, null, null, null, null,
      CFG.COLORES.BORDE_GRIS, SpreadsheetApp.BorderStyle.SOLID_THICK);
  }
}

// CALENDARIO [→ Contexto_Base_Web.md §22B082]

/**
 * _leerNotasCalendario2PorSemana(temporada) [→ Contexto_Base_Web.md §22B083]
 */
function _leerNotasCalendario2PorSemana(temporada) {
  var mapa = {};
  var ss = _getSs();
  var shCal2 = ss.getSheetByName(CFG.SHEETS.CALENDARIO2);
  if (!shCal2) return mapa;

  var lastRow = shCal2.getLastRow();
  if (lastRow < 2) return mapa;

  var data = shCal2.getRange(2, 1, lastRow - 1, 6).getValues();
  for (var i = 0; i < data.length; i++) {
    var r = data[i];
    var temp = Number(r[2]) || 0;
    if (temp !== temporada) continue;

    var sem = Number(r[3]) || 0;
    var diaLetra = String(r[4] || '').trim().toUpperCase();
    var nota = String(r[5] || '').trim();
    if (!sem || !diaLetra || !nota) continue;

    if (!mapa[sem]) mapa[sem] = {};
    mapa[sem][diaLetra] = nota;
  }
  return mapa;
}

function _probarCentradoControl() {
  _fetchClanesBasico();
  updateControlSheet();
  _aplicarTablasYGridlines();
}

// Corresponde a la columna agregada "%" de Puntaje (Prom / Min_G).
function _reglaCondFmtPuntajePct(rangoPct, letr) {
  return [
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($' + letr + '4<>"", $' + letr + '4>=1)')
      .setBackground(CFG.COLORES.CUMPLE_MING_BG)
      .setFontColor(CFG.COLORES.CUMPLE_MING_FG)
      .setBold(true)
      .setRanges([rangoPct]).build()
  ];
}

// Corresponde a la 5ta columna (total semanal) de cada bloque de Barcos en Control.
function _reglasCondFmtBarcosTotalSemana(rangoBarco, letr) {
  return [
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($' + letr + '4<>"", $' + letr + '4=0)').setBackground(CFG.COLORES.BARCO_TOTAL_GRIS_BG).setRanges([rangoBarco]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($' + letr + '4<>"", $' + letr + '4<>0)').setBackground(CFG.COLORES.BARCO_TOTAL_ROJO_BG).setRanges([rangoBarco]).build()
  ];
}

// Corresponde a la 5ta columna (total semanal) de cada bloque de Puntaje en Control. [→ Contexto_Base_Web.md §22B084]
function _reglasCondFmtPuntajeTotalSemana(rangoPunt, letr, colClanL) {
  var minGLookup = _buildMinGSwitchFormula(colClanL);
  var formAzul     = '=AND($' + letr + '4<>"", $' + letr + '4 >= ' + minGLookup + ')';
  var formAmarillo = '=AND($' + letr + '4<>"", $' + letr + '4 >= 1600, $' + letr + '4 < ' + minGLookup + ')';
  var formNaranja  = '=AND($' + letr + '4<>"", $' + letr + '4 < 1600)';
  return [
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied(formAzul).setBackground(CFG.COLORES.CUMPLE_MING_BG).setFontColor(CFG.COLORES.CUMPLE_MING_FG).setBold(true).setRanges([rangoPunt]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied(formAmarillo).setBackground(CFG.COLORES.PUNTAJE_MEDIO_BG).setRanges([rangoPunt]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied(formNaranja).setBackground(CFG.COLORES.PUNTAJE_BAJO_BG).setRanges([rangoPunt]).build()
  ];
}