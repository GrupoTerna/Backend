// ==============================================================================
// 17_GuerraSheet.gs
// Hojas Guerra, Guerra_Logs y Pendientes: datos crudos de guerra de clanes.
// ==============================================================================

// CONTEXTO: TEMPORADA POR CLAN Y CAMBIO DE TEMPORADA (05-oct-2026, pedido del usuario) [→ Contexto_Base_Web.md §17B001]

// REGLA DE TRABAJO DE ESTE PROYECTO (21-sep-2026, pedido del usuario) [→ Contexto_Base_Web.md §17B002]

// ----- Variables y constantes -----

// 17_GuerraSheet.gs [→ Contexto_Base_Web.md §17B003]

// DOCUMENTACIÓN DEL FUNCIONAMIENTO DE LA GUERRA (currentriverrace) [→ Contexto_Base_Web.md §17B004]

// PENDIENTES TRASLADADOS DESDE Lista_de_cambios.docx (22-sep-2026, revisión [→ Contexto_Base_Web.md §17B005]

// ÍNDICES DE COLUMNA - HOJA GUERRA (1-based) [→ Contexto_Base_Web.md §17B006]
var GC = {
  NUM:          1,
  FECHA:        2,
  TEMPORADA:    3,
  SEMANA:       4,
  DIA:          5,
  PERIOD_IDX:   6,
  DIA_GUERRA:   7,
  ETAPA:        8,
  CLAN:         9,
  TAG:          10,
  NOMBRE:       11,
  ATAQUES_HOY:  12,
  ATAQUES_SEM:  13,
  FAME:         14,
  BARCOS:       15,
  DON_R:        16,
  DON_D:        17,
  RANKING:      18,
  TEMPORADA_2:  19,
  ORIGEN:       20,
  COPAS:        21   // 12-oct-2026: copas del jugador en ese día (mem.trophies de /clans/{tag}); se guarda igual que Ranking. Va al final para no mover ningún índice anterior.
};

var GUERRA_TOTAL_COLS = 21;

// Origen de una fila de Guerra: 'Original' | 'Corregido' | 'Reconstruido', con un sufijo opcional desde el 20-oct-2026
// (§PF132): 'Corregido - Solución única', 'Corregido - Solución estimada', 'Reconstruido - Solución única' y
// 'Reconstruido - Solución estimada'. Para comparar el origen se usa SIEMPRE esta función, no ===.
function _origenGuerraEs_(valor, base) {
  var v = String(valor === null || valor === undefined ? '' : valor).trim().toLowerCase();
  var b = String(base).toLowerCase();
  return v === b || v.indexOf(b + ' - ') === 0;
}

// Encabezados canónicos de la hoja Guerra (mismo orden que GC de arriba). [→ Contexto_Base_Web.md §17B007]
var GUERRA_HEADERS = ['N°','Fecha','Temporada','Semana','Día','PeriodIndex',
                       'DiaGuerra','Etapa','Clan','Tag','Nombre',
                       'AtaquesHoy','AtaquesSemana','Fame','Barcos',
                       'Donaciones_r','Donaciones_d','Ranking',
                       'Temporada_2','Origen','Copas'];

// ÍNDICES DE COLUMNA - HOJA GUERRA_LOGS (1-based) [→ Contexto_Base_Web.md §17B008]
var GLC = {
  NUM:          1,
  FECHA:        2,
  TEMPORADA:    3,
  SEMANA:       4,
  DIA:          5,
  DIA_GUERRA:   6,
  CLAN:         7,
  TAG:          8,
  PERIOD_IDX:   9,
  LIDER:        10,
  TAG_L:        11,
  DONACIONES:   12,
  TROFEOS:      13,
  COPAS:        14,
  MIEMBROS:     15,
  REPAIR_PTS:   16,
  PERIOD_PTS:   17,
  PTS_EARNED:   18,
  PROG_START:   19,
  PROG_END:     20,
  MIN_G:        21,
  END_OF_DAY_RANK: 22,
  PROG_EARNED:  23,   // TANDA 1 (20-sep-2026): item.progressEarned
  DEF_REMAINING: 24,  // TANDA 1: item.numOfDefensesRemaining
  PROG_DEFENSES: 25,  // TANDA 1: item.progressEarnedFromDefenses
  TIPO:         26,   // TANDA 5: 'Terna' | 'Rival' (vacío = Terna, filas anteriores a la tanda 5)
  ESTADO:       27    // TANDA 13a (21-sep-2026): 'Leído' | 'Estimado' (vacío = origen desconocido). Texto: NO entra en los formatos '#,##0' (terminan en PROG_DEFENSES)
};

var GUERRA_LOGS_TOTAL_COLS = 27; // TANDA 13a (21-sep-2026): 26 -> 27 (columna Estado)

// Encabezados canónicos de la hoja Guerra_Logs (mismo orden que GLC de arriba). [→ Contexto_Base_Web.md §17B009]
var GUERRA_LOGS_HEADERS = ['N°','Fecha','Temporada','Semana','Día','DiaGuerra',
                           'Clan','Tag','PeriodIndex','Líder','Tag(L)',
                           'Donaciones','Trofeos','Copas','Miembros',
                           'RepairPoints','PeriodPoints','PointsEarned',
                           'ProgressStartOfDay','ProgressEndOfDay','Min_G','EndOfDayRank',
                           'ProgressEarned','NumOfDefensesRemaining','ProgressEarnedFromDefenses',
                           'Tipo','Estado'];

// Notas de los encabezados de las 3 columnas de la TANDA 1 (20-sep-2026).
var GUERRA_LOGS_NOTAS_AVANCE = {};
// TANDA 8 (21-sep-2026): notas de PointsEarned y de las dos columnas de avance
// del barco, para dejar claro qué guardan en la SEMANA DE COLISEO.
GUERRA_LOGS_NOTAS_AVANCE[GLC.PTS_EARNED] =
  'Puntos (fama) que ganó el clan ese día: suma de lo que ganaron ese día todos sus jugadores.\n' +
  'SEMANA DE COLISEO (última de la temporada, jueves a domingo): la API no entrega este dato. Se ESTIMA como la fama acumulada de la semana ' +
  '(clan.fame) menos lo ya registrado en los días anteriores de la semana, en el último registro del día. Si ese último registro fue antes ' +
  'del cierre del día, unos puntos pasan al día siguiente.\n' +
  'En coliseo, VACÍO = no se pudo calcular (faltan los días anteriores de la semana). En una semana de carrera normal el 0 es un dato real.';
GUERRA_LOGS_NOTAS_AVANCE[GLC.PROG_START] =
  'Avance del barco al INICIO del día (se lee del JSON; un clan que ya cruzó la meta muestra su fame sin tope, ej. 10272).\n' +
  'SEMANA DE COLISEO: VACÍO. Los barcos no avanzan y la fama acumulada de la semana NO es un avance del barco.';
GUERRA_LOGS_NOTAS_AVANCE[GLC.PROG_END] =
  'Avance del barco al CIERRE del día, con tope en 10000 (se lee del JSON). El día en curso muestra el avance al inicio de hoy.\n' +
  'SEMANA DE COLISEO: VACÍO. Los barcos no avanzan y la fama acumulada de la semana NO es un avance del barco.';
GUERRA_LOGS_NOTAS_AVANCE[GLC.PROG_EARNED] =
  'Avance del barco que el clan ganó ese día por su PUESTO (progressEarned del JSON de currentriverrace): ' +
  '3000, 1800, 1000, 600 o 400; en empate, el promedio de los puestos compartidos.\n' +
  'VACÍO = el día todavía no cierra (o el dato no se guardó). 0 = dato real (ej. el clan no participó).\n\n' +
  'SEMANA DE COLISEO (última de la temporada, incluido el último domingo): siempre VACÍO. En coliseo los barcos no avanzan, no hay avance por puesto.\n' +
  'Domingo de una semana de carrera normal: es un valor PROVISIONAL y ESTIMADO con el puesto estimado de EndOfDayRank (ver la nota de esa columna) ' +
  'hasta que la API entrega ese domingo cerrado; entonces el dato real lo reemplaza. NumOfDefensesRemaining y ProgressEarnedFromDefenses no se pueden estimar y quedan vacíos.';
GUERRA_LOGS_NOTAS_AVANCE[GLC.DEF_REMAINING] =
  'Defensas activas que le quedaban al barco del clan al cierre del día (numOfDefensesRemaining del JSON). ' +
  'Con las 15 activas el bono por defensas es el máximo.\n' +
  'VACÍO = el día todavía no cierra (o el dato no se guardó). 0 = dato real.';
GUERRA_LOGS_NOTAS_AVANCE[GLC.TIPO] =
  'Terna = clan de la Familia Terna. Rival = otro clan de la misma carrera (TANDA 5, 20-sep-2026).\n' +
  'VACÍO = fila anterior a la tanda 5: es de un clan Terna (los rivales no se guardaban).\n' +
  'De un rival solo se conoce lo que trae el JSON de currentriverrace: Clan, Tag, Copas (clanScore), ' +
  'RepairPoints, PeriodPoints y las columnas de avance/puesto. Líder, Tag(L), Donaciones, Trofeos, Miembros y Min_G quedan vacíos.';
GUERRA_LOGS_NOTAS_AVANCE[GLC.ESTADO] =
  'De dónde salen los datos de la fila (TANDA 13, 21-sep-2026):\n' +
  'Leído = TODOS los datos de la fila se trajeron tal cual del JSON/API, sin ningún cálculo del código.\n' +
  'Estimado = la fila incluye AL MENOS UN cálculo del código (aunque sea de un solo valor): PointsEarned por diferencia de fama acumulada, ' +
  'ProgressStartOfDay tomado del cierre del día anterior, puesto por orden de puntos o de fama, ProgressEarned por puesto, etc. ' +
  'Incluye el día en curso (aún sin cerrar) y TODA la semana de coliseo, porque la API no entrega logs diarios de coliseo.\n' +
  'Se evalúan los datos de GUERRA de la fila (PointsEarned, ProgressStart/End, EndOfDayRank, ProgressEarned, defensas y bono). Líder, Donaciones, Trofeos, Copas, Miembros, Min_G y Tipo no cuentan.\n' +
  'Una fila Estimado pasa a Leído solo cuando el dato real la reemplaza sin cálculos. Una fila Leído nunca vuelve a Estimado.\n' +
  'VACÍO = origen desconocido (fila anterior a esta columna): NO se asume Leído.';
GUERRA_LOGS_NOTAS_AVANCE[GLC.PROG_DEFENSES] =
  'Bono de avance por defensas (progressEarnedFromDefenses del JSON). Se lee tal cual: NO es una función exacta ' +
  'de las defensas restantes (con las 15 activas siempre es 435).\n' +
  'ProgressStartOfDay + ProgressEarned + este bono = ProgressEndOfDay (con tope en 10000).\n' +
  'VACÍO = el día todavía no cierra (o el dato no se guardó). 0 = dato real.';

// Nota que se pone en el encabezado de la columna EndOfDayRank (V) de [→ Contexto_Base_Web.md §17B010]
var GUERRA_LOGS_NOTA_END_OF_DAY_RANK =
  'EL PUESTO EMPIEZA EN 0 (tal como viene del JSON de currentriverrace).\n' +
  '0 = primer puesto\n1 = segundo puesto\n2 = tercer puesto\n3 = cuarto puesto\n4 = quinto puesto\n' +
  'Ojo: un 2 es el TERCER puesto, no el segundo.\n' +
  'Si dos clanes empatan en puntos, comparten el mismo número (ej. dos clanes con 2 = ambos terceros, y no aparece el 3).\n' +
  'Un clan que no participa queda tras el último clan con puntos (4 si los otros 4 participan; 3 si uno ya cruzó la meta).\n' +
  '-1 = el clan YA HABÍA CRUZADO LA META antes de ese día y no compite (dato real de la API).\n' +
  'VACÍO = el día todavía no cierra (o el dato no se guardó). El 0 es el primer puesto real.\n' +
  'En filas antiguas (anteriores al 20-sep-2026) un 0 también puede ser un dato que no se guardó.\n\n' +
  'SEMANA DE COLISEO (última de la temporada, jueves a domingo): la API NO entrega ningún log diario, así que el puesto es una ESTIMACIÓN ' +
  'ordenando a los clanes de la carrera por su fama acumulada de la semana, en el último registro de ese día.\n' +
  'ÚLTIMO DOMINGO DE LA TEMPORADA (siempre es coliseo): el puesto NO es necesariamente un dato real, es PROVISIONAL y ESTIMADO. ' +
  'Nadie lo corrige después porque al cambiar la temporada la API ya no entrega ese domingo.\n' +
  'Puede no ser cierto: por ejemplo, dos clanes cercanos en puntaje pueden estar en primer puesto y luego ser alcanzados ' +
  'por otro clan y terminar en segundo. Solo es una estimación.\n' +
  'Domingo de una semana de carrera normal: también es una estimación (por los puntos del día) hasta que la API lo entrega cerrado; ' +
  'entonces el dato real la reemplaza.';

/**
 * _notaEndOfDayRankGuerraLogs_(sh) [→ Contexto_Base_Web.md §17B011]
 */
function _notaEndOfDayRankGuerraLogs_(sh) {
  try {
    var celda = sh.getRange(1, GLC.END_OF_DAY_RANK);
    if (celda.getNote() !== GUERRA_LOGS_NOTA_END_OF_DAY_RANK) {
      celda.setNote(GUERRA_LOGS_NOTA_END_OF_DAY_RANK);
    }
  } catch (e) {
    Logger.log('[GuerraLogs] No se pudo poner la nota de EndOfDayRank: ' + e.message);
  }
}

/**
 * _asegurarColumnasGuerraLogs_(sh) [→ Contexto_Base_Web.md §17B012]
 */
function _asegurarColumnasGuerraLogs_(sh) {
  if (sh.getMaxColumns() < GUERRA_LOGS_TOTAL_COLS) {
    sh.insertColumnsAfter(sh.getMaxColumns(), GUERRA_LOGS_TOTAL_COLS - sh.getMaxColumns());
  }
  var primera = GLC.PROG_EARNED;
  var actuales = sh.getRange(1, primera, 1, GUERRA_LOGS_TOTAL_COLS - primera + 1).getValues()[0];
  var huboCambio = false;
  for (var i = 0; i < actuales.length; i++) {
    var esperado = GUERRA_LOGS_HEADERS[primera - 1 + i];
    if (String(actuales[i] || '').trim() !== esperado) {
      sh.getRange(1, primera + i).setValue(esperado);
      huboCambio = true;
    }
  }
  if (huboCambio) {
    applyHeaderStyle(sh, GUERRA_LOGS_TOTAL_COLS);
    Logger.log('[GuerraLogs] Encabezados de las columnas nuevas (ProgressEarned, NumOfDefensesRemaining, ProgressEarnedFromDefenses, Tipo, Estado: W-AA) agregados o corregidos.');
  }
  try {
    for (var col in GUERRA_LOGS_NOTAS_AVANCE) {
      var celda = sh.getRange(1, Number(col));
      if (celda.getNote() !== GUERRA_LOGS_NOTAS_AVANCE[col]) celda.setNote(GUERRA_LOGS_NOTAS_AVANCE[col]);
    }
  } catch (e) {
    Logger.log('[GuerraLogs] No se pudieron poner las notas de las columnas de avance: ' + e.message);
  }
}

// Avance del barco por puesto (índice = EndOfDayRank 0..4). Sección 4 de la
// documentación de la guerra: 3000 / 1800 / 1000 / 600 / 400.
var GUERRA_PROGRESO_POR_PUESTO = [3000, 1800, 1000, 600, 400];

/**
 * _estimarPuestosDomingoRR_(rr, tagPropio) [→ Contexto_Base_Web.md §17B013]
 */
function _estimarPuestosDomingoRR_(rr, tagPropio) {
  var salida = {};
  if (!rr) return salida;
  if (String(rr.periodType || '') === 'colosseum') return salida;

  var candidatos = [];
  var vistos = {};
  var agregar = function (c, tagAlternativo) {
    if (!c) return;
    var t = _tagComparableLogs_(c.tag || tagAlternativo);
    if (!t || vistos[t]) return;
    vistos[t] = true;
    var fame = Number(c.fame) || 0;
    candidatos.push({
      tag:    t,
      puntos: Number(c.periodPoints) || 0,
      fame:   fame,
      cruzo:  fame >= META_GUERRA_PROGRESO
    });
  };
  agregar(rr.clan, tagPropio);
  var lista = rr.clans || [];
  for (var i = 0; i < lista.length; i++) agregar(lista[i], '');

  // Clanes que ya cruzaron: no compiten, resultado fijo.
  candidatos.forEach(function (c) {
    if (c.cruzo) salida[c.tag] = { rank: -1, progressEarned: 0, cruzo: true, fame: c.fame };
  });

  var participantes = candidatos.filter(function (c) { return !c.cruzo && c.puntos > 0; })
                                .sort(function (a, b) { return b.puntos - a.puntos; });
  if (participantes.length === 0) return salida;

  var pos = 0;
  while (pos < participantes.length) {
    var fin = pos;
    while (fin + 1 < participantes.length && participantes[fin + 1].puntos === participantes[pos].puntos) fin++;
    var suma = 0;
    for (var k = pos; k <= fin; k++) suma += (GUERRA_PROGRESO_POR_PUESTO[k] || 0);
    var promedio = Math.round(suma / (fin - pos + 1));
    for (var m = pos; m <= fin; m++) {
      salida[participantes[m].tag] = { rank: pos, progressEarned: promedio, cruzo: false, fame: participantes[m].fame };
    }
    pos = fin + 1;
  }

  // Sin puntos y sin haber cruzado: no participa (puesto tras el último con puntos, avance 0).
  candidatos.forEach(function (c) {
    if (!c.cruzo && c.puntos <= 0) salida[c.tag] = { rank: participantes.length, progressEarned: 0, cruzo: false, fame: c.fame };
  });
  return salida;
}

/**
 * _estimarPuestosColiseoRR_(rr, tagPropio) [→ Contexto_Base_Web.md §17B014]
 */
function _estimarPuestosColiseoRR_(rr, tagPropio) {
  var salida = {};
  if (!rr || String(rr.periodType || '') !== 'colosseum') return salida;

  var candidatos = [];
  var vistos = {};
  var agregar = function (c, tagAlternativo) {
    if (!c) return;
    var t = _tagComparableLogs_(c.tag || tagAlternativo);
    if (!t || vistos[t]) return;
    vistos[t] = true;
    candidatos.push({ tag: t, fame: Number(c.fame) || 0 });
  };
  agregar(rr.clan, tagPropio);
  var lista = rr.clans || [];
  for (var i = 0; i < lista.length; i++) agregar(lista[i], '');

  if (!candidatos.some(function (c) { return c.fame > 0; })) return salida;
  candidatos.sort(function (a, b) { return b.fame - a.fame; });

  var pos = 0;
  while (pos < candidatos.length) {
    var fin = pos;
    while (fin + 1 < candidatos.length && candidatos[fin + 1].fame === candidatos[pos].fame) fin++;
    for (var m = pos; m <= fin; m++) salida[candidatos[m].tag] = { rank: pos };
    pos = fin + 1;
  }
  return salida;
}

/**
 * _sumaPuntosColiseoPrevios_(tag, temporada, pIdxHoy, fameHoy, mapaIds, datos) [→ Contexto_Base_Web.md §17B015]
 */
function _sumaPuntosColiseoPrevios_(tag, temporada, pIdxHoy, fameHoy, mapaIds, datos) {
  var primero = Math.floor(pIdxHoy / 7) * 7 + 3;
  var suma = 0;
  for (var p = primero; p < pIdxHoy; p++) {
    var id = tag + '│' + temporada + '│' + periodIdxToSectionIndex(p) + '│' + p;
    var ix = mapaIds ? mapaIds[id] : undefined;
    if (typeof ix !== 'number' || !datos[ix]) return null;
    var v = datos[ix][GLC.PTS_EARNED - 1];
    if (v === '' || v === null || v === undefined) return null;
    suma += Number(v) || 0;
  }
  if (suma === 0 && pIdxHoy > primero && fameHoy > 0) return null;
  return suma;
}

/**
 * _progressEndDiaAnterior_(logsPorPeriodo, pIdxAnterior, mapaIds, datos, tag, temporada) [→ Contexto_Base_Web.md §17B016]
 */
function _progressEndDiaAnterior_(logsPorPeriodo, pIdxAnterior, mapaIds, datos, tag, temporada) {
  var l = logsPorPeriodo ? logsPorPeriodo[pIdxAnterior] : null;
  if (l && l.encontrado && Number(l.progressEndOfDay) > 0) return Number(l.progressEndOfDay);
  var id = tag + '│' + temporada + '│' + periodIdxToSectionIndex(pIdxAnterior) + '│' + pIdxAnterior;
  var ix = mapaIds ? mapaIds[id] : undefined;
  if (typeof ix === 'number' && datos[ix]) {
    var v = Number(datos[ix][GLC.PROG_END - 1]) || 0;
    if (v > 0) return v;
  }
  return 0;
}

// TANDA 13b (21-sep-2026): valores posibles de la columna Estado de Guerra_Logs.
// Vacío = origen desconocido (no se asume Leído).
var GL_ESTADO_LEIDO    = 'Leído';
var GL_ESTADO_ESTIMADO = 'Estimado';

/**
 * _marcarEstadoLog_(fila, esLeido) [→ Contexto_Base_Web.md §17B017]
 */
function _marcarEstadoLog_(fila, esLeido) {
  var actual = String(fila[GLC.ESTADO - 1] || '').trim();
  if (actual === GL_ESTADO_LEIDO) return false;
  var nuevo = esLeido ? GL_ESTADO_LEIDO : GL_ESTADO_ESTIMADO;
  if (actual === nuevo) return false;
  fila[GLC.ESTADO - 1] = nuevo;
  return true;
}

/**
 * _filaCoincideConLogCerrado_(fila, log) [→ Contexto_Base_Web.md §17B018]
 */
function _filaCoincideConLogCerrado_(fila, log) {
  if (!log || !log.encontrado) return false;
  var igual = function (col, valor) {
    return (_numDesdeCeldaLogs_(fila[col - 1]) || 0) === (Number(valor) || 0);
  };
  if (!igual(GLC.PTS_EARNED, log.pointsEarned))       return false;
  if (!igual(GLC.PROG_START, log.progressStartOfDay)) return false;
  if (!igual(GLC.PROG_END,   log.progressEndOfDay))   return false;
  var opcionales = [
    [GLC.END_OF_DAY_RANK, log.endOfDayRank],
    [GLC.PROG_EARNED,     log.progressEarned],
    [GLC.DEF_REMAINING,   log.numOfDefensesRemaining],
    [GLC.PROG_DEFENSES,   log.progressEarnedFromDefenses]
  ];
  for (var k = 0; k < opcionales.length; k++) {
    var v = opcionales[k][1];
    if (v === null || v === undefined) continue; // el JSON no trae el dato: no se compara
    if (!igual(opcionales[k][0], v)) return false;
  }
  return true;
}

/**
 * _actualizarValorLogSiCambia_(fila, col1based, valor) [→ Contexto_Base_Web.md §17B019]
 */
function _actualizarValorLogSiCambia_(fila, col1based, valor) {
  if (valor === null || valor === undefined) return false;
  var actual = fila[col1based - 1];
  var vacio = (actual === '' || actual === null || actual === undefined);
  if (vacio || Number(actual) !== valor) {
    fila[col1based - 1] = valor;
    return true;
  }
  return false;
}

// ----- Funciones manuales / punto de entrada -----

/**
 * _desgloseBarcosPorDia(tag, clanTag, ctx, datosGuerra, barcosHoy) [→ Contexto_Base_Web.md §17B020]
 */
// SECCIÓN 1: FUNCIONES MANUALES (entry points de mantenimiento, ejecutar a mano [→ Contexto_Base_Web.md §17B021]

/**
 * MANTENIMIENTO MANUAL — ejecutar UNA sola vez desde el editor de Apps Script [→ Contexto_Base_Web.md §17B022]
 */
function corregirTemporadasFantasma() {
  var ss  = _getSs();
  var ctx = _getCtx();
  var temporadaCorrecta = Number(ctx.temporada) || 1;
  // El error empezó en el periodIndex 29, cuyo día real es martes 30 de [→ Contexto_Base_Web.md §17B023]
  var FECHA_CORTE = new Date(2026, 5, 30, 0, 0, 0); // 30 de junio de 2026 (mes 5 = junio, 0-based)

  Logger.log('[Corrección] Temporada correcta actual: ' + temporadaCorrecta + '. Se corregirán filas con Fecha >= ' + FECHA_CORTE.toDateString() + ' y Temporada > ' + temporadaCorrecta + '.');

  // PASO 1 (FIX 02-ago-2026): corregir DIRECTO sobre los CSV en Drive — [→ Contexto_Base_Web.md §17B024]
  _corregirTemporadaEnCSV(
    'Backup_Guerra.csv', GC, GUERRA_TOTAL_COLS,
    [GC.ATAQUES_HOY, GC.ATAQUES_SEM, GC.FAME, GC.BARCOS, GC.DON_R, GC.DON_D, GC.RANKING],
    temporadaCorrecta, FECHA_CORTE
  );
  _corregirTemporadaEnCSV(
    'Backup_Guerra_Logs.csv', GLC, GUERRA_LOGS_TOTAL_COLS,
    [GLC.DONACIONES, GLC.TROFEOS, GLC.COPAS, GLC.MIEMBROS, GLC.REPAIR_PTS, GLC.PERIOD_PTS, GLC.PTS_EARNED, GLC.PROG_START, GLC.PROG_END,
     GLC.PROG_EARNED, GLC.DEF_REMAINING, GLC.PROG_DEFENSES], // TANDA 1 (20-sep-2026): las 3 columnas nuevas también se conservan al fusionar duplicados
    temporadaCorrecta, FECHA_CORTE
  );

  // PASO 2: corregir lo que la hoja todavía conserva (prácticamente solo la [→ Contexto_Base_Web.md §17B025]
  _corregirTemporadaEnGuerra(ss, temporadaCorrecta, FECHA_CORTE);
  _corregirTemporadaEnGuerraLogs(ss, temporadaCorrecta, FECHA_CORTE);

  // PASO 3: resincronizar YA los CSV afectados, forzando la escritura para [→ Contexto_Base_Web.md §17B026]
  var shGuerra = ss.getSheetByName(CFG.SHEETS.GUERRA);
  if (shGuerra) _syncGuerraCSV(shGuerra, true);

  _syncUnaAcumulativaCSV(
    { sheetName: CFG.SHEETS.GUERRA_LOGS, fileName: 'Backup_Guerra_Logs.csv', numCols: GUERRA_LOGS_TOTAL_COLS, hasFecha: true, fechaCol: GLC.FECHA },
    true
  );

  Logger.log('[Corrección] corregirTemporadasFantasma completado. Backup_Guerra.csv y Backup_Guerra_Logs.csv ya quedaron resincronizados con la corrección (escritura forzada), incluyendo cualquier temporada que ya estuviera purgada de la hoja.');
}

/**
 * REPARAR_duplicadosGuerra() [→ Contexto_Base_Web.md §17B027]
 */
function REPARAR_duplicadosGuerra() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.GUERRA);
  if (!sh) { Logger.log('[Reparar] Hoja Guerra no encontrada.'); return; }

  var lastRow = sh.getLastRow();
  if (lastRow < 2) { Logger.log('[Reparar] Hoja Guerra vacía, nada que reparar.'); return; }

  var datos = sh.getRange(2, 1, lastRow - 1, GUERRA_TOTAL_COLS).getValues();

  // Mismos campos acumulables que ya fusiona corregirTemporadasFantasma().
  var CAMPOS_NUM_MAYOR = [GC.ATAQUES_HOY, GC.ATAQUES_SEM, GC.FAME, GC.BARCOS, GC.DON_R, GC.DON_D, GC.RANKING];

  var grupos = {}; // id -> [índices en datos, en orden físico de la hoja]
  for (var i = 0; i < datos.length; i++) {
    var fila = datos[i];
    var tag = String(fila[GC.TAG - 1] || '').trim().toUpperCase();
    if (!tag) continue;
    var clan      = String(fila[GC.CLAN - 1] || '').trim();
    var temporada = String(fila[GC.TEMPORADA - 1] || '');
    var semana    = Number(fila[GC.SEMANA - 1] || 1);
    var sIdx      = semana - 1;
    var pIdx      = Number(fila[GC.PERIOD_IDX - 1] || 0);
    // Mismo ID que updateGuerraSheet()/_mapaIdsGuerra()/_idFilaGuerraCSV().
    var id = tag + '│' + clan + '│' + temporada + '│' + sIdx + '│' + pIdx;
    if (!grupos[id]) grupos[id] = [];
    grupos[id].push(i);
  }

  var filasFinales = [];
  var gruposConDuplicados = 0;
  var filasEliminadas = 0;

  Object.keys(grupos).forEach(function(id) {
    var indices = grupos[id];
    if (indices.length === 1) {
      filasFinales.push(datos[indices[0]]);
      return;
    }

    gruposConDuplicados++;
    filasEliminadas += (indices.length - 1);

    // Base: la última fila física del grupo (la más reciente que se [→ Contexto_Base_Web.md §17B028]
    var base = datos[indices[indices.length - 1]].slice();
    for (var c = 0; c < CAMPOS_NUM_MAYOR.length; c++) {
      var col = CAMPOS_NUM_MAYOR[c];
      var maxVal = 0;
      for (var k = 0; k < indices.length; k++) {
        var v = Number(datos[indices[k]][col - 1]) || 0;
        if (v > maxVal) maxVal = v;
      }
      base[col - 1] = maxVal;
    }
    filasFinales.push(base);
  });

  Logger.log('[Reparar] Filas leídas: ' + datos.length + '. Grupos con duplicados: ' +
    gruposConDuplicados + '. Filas duplicadas eliminadas: ' + filasEliminadas +
    '. Filas finales: ' + filasFinales.length + '.');

  if (filasEliminadas === 0) {
    Logger.log('[Reparar] No se encontraron duplicados. Nada que reparar.');
    return;
  }

  // Orden prolijo por PeriodIndex, igual que las filas nuevas de
  // updateGuerraSheet().
  filasFinales.sort(function(a, b) {
    return (a[GC.PERIOD_IDX - 1] || 0) - (b[GC.PERIOD_IDX - 1] || 0);
  });

  // Renumerar N° de forma continua (1..total).
  for (var n = 0; n < filasFinales.length; n++) {
    filasFinales[n][GC.NUM - 1] = n + 1;
  }

  // Se limpia TODO el rango de datos actual (más largo que el final) y se
  // reescribe solo con las filas ya deduplicadas.
  sh.getRange(2, 1, lastRow - 1, GUERRA_TOTAL_COLS).clearContent();
  sh.getRange(2, 1, filasFinales.length, GUERRA_TOTAL_COLS).setValues(filasFinales);

  // Resincronizar YA el CSV, forzando la escritura porque la cantidad de [→ Contexto_Base_Web.md §17B029]
  _syncGuerraCSV(sh, true);

  Logger.log('[Reparar] Completado. Backup_Guerra.csv resincronizado (escritura forzada). ' +
    'Vuelve a abrir guerra.html (o espera la próxima corrida) para ver los números ya corregidos.');
}

// GUERRA SHEET [→ Contexto_Base_Web.md §17B030]

/**
 * _limpiarLinksAccidentalesGuerraIncremental(sh) [→ Contexto_Base_Web.md §17B031]
 */
function _limpiarLinksAccidentalesGuerraIncremental(sh) {
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return true;

  var props = PropertiesService.getScriptProperties();
  var COLUMNAS = [
    { col: GC.CLAN,   propTotal: '_guerraLinksClanTotalFilas',   propFila: '_guerraLinksClanUltimaFila' },
    { col: GC.NOMBRE, propTotal: '_guerraLinksNombreTotalFilas', propFila: '_guerraLinksNombreUltimaFila' }
  ];
  var BLOQUE = 500;

  var inicio = Date.now();
  var completo = true;

  for (var k = 0; k < COLUMNAS.length; k++) {
    var cfgCol = COLUMNAS[k];

    var totalFilasAnterior = Number(props.getProperty(cfgCol.propTotal)) || 0;
    var ultimaFilaRevisada = Number(props.getProperty(cfgCol.propFila)) || 1; // fila 1 = encabezado

    if (lastRow < totalFilasAnterior) {
      // La hoja se achicó: hubo purga de temporada anterior, los índices de
      // fila ya no corresponden a las mismas filas de antes.
      ultimaFilaRevisada = 1;
      Logger.log('[LinksNombres][Guerra] ' + cfgCol.col + ': hoja se achicó (' +
        totalFilasAnterior + ' -> ' + lastRow + ' filas), se resetea watermark ' +
        'para re-chequeo completo.');
    }

    if (ultimaFilaRevisada >= lastRow) {
      props.setProperty(cfgCol.propTotal, String(lastRow));
      continue; // nada nuevo que revisar en esta columna
    }

    var filaActual = ultimaFilaRevisada + 1;
    while (filaActual <= lastRow) {
      if ((Date.now() - inicio) >= CFG.GUERRA_LIMPIAR_LINKS_BUDGET_MS) {
        completo = false;
        break;
      }

      var filaHastaBloque = Math.min(filaActual + BLOQUE - 1, lastRow);
      var rango = sh.getRange(filaActual, cfgCol.col, filaHastaBloque - filaActual + 1, 1);
      var valores;
      try {
        valores = rango.getRichTextValues();
      } catch (e) {
        Logger.log('[LinksNombres][Guerra] error al leer filas ' + filaActual + '-' +
          filaHastaBloque + ' (' + e.message + '), se omite este bloque.');
        props.setProperty(cfgCol.propFila, String(filaHastaBloque));
        filaActual = filaHastaBloque + 1;
        continue;
      }

      var corregidas = 0;
      for (var i = 0; i < valores.length; i++) {
        var rt = valores[i][0];
        if (!rt || !rt.getLinkUrl()) continue;

        // Mismo criterio que _limpiarLinksAccidentalesEnHoja(): insertar un [→ Contexto_Base_Web.md §17B032]
        var textoLimpio = rt.getText();
        var ultimoPunto = textoLimpio.lastIndexOf('.');
        if (ultimoPunto > 0 && ultimoPunto < textoLimpio.length - 1) {
          textoLimpio = textoLimpio.slice(0, ultimoPunto + 1) + '\u200B' + textoLimpio.slice(ultimoPunto + 1);
        }
        valores[i][0] = SpreadsheetApp.newRichTextValue().setText(textoLimpio).build();
        corregidas++;
      }

      if (corregidas > 0) {
        rango.setRichTextValues(valores);
        SpreadsheetApp.flush();
        Logger.log('[LinksNombres][Guerra] col ' + cfgCol.col + ', filas ' + filaActual + '-' +
          filaHastaBloque + ': ' + corregidas + ' enlace(s) accidental(es) quitado(s).');
      }

      // Se guarda el avance tras CADA bloque, no solo al final del tramo [→ Contexto_Base_Web.md §17B033]
      props.setProperty(cfgCol.propFila, String(filaHastaBloque));
      filaActual = filaHastaBloque + 1;
    }

    props.setProperty(cfgCol.propTotal, String(lastRow));
  }

  return completo;
}

/**
 * _asegurarColumnaCopasGuerra_(sh) — 12-oct-2026 (pedido usuario: gráfica de copas en perfil y clan).
 * La hoja Guerra pasa de 20 a 21 columnas (GC.COPAS). Si la hoja todavía tiene 20, agrega la columna y el
 * encabezado «Copas» copiando el formato del encabezado de Origen. Idempotente. [→ Contexto_Base_Web.md §PF061]
 */
function _asegurarColumnaCopasGuerra_(sh) {
  if (!sh) return;
  if (sh.getMaxColumns() < GUERRA_TOTAL_COLS) {
    sh.insertColumnsAfter(sh.getMaxColumns(), GUERRA_TOTAL_COLS - sh.getMaxColumns());
  }
  var celda = sh.getRange(1, GC.COPAS);
  if (String(celda.getValue() || '').trim() === '') {
    sh.getRange(1, GC.ORIGEN).copyTo(celda, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
    celda.setValue('Copas');
  }
}

/**
 * Actualiza la hoja Guerra con los datos de participación del día actual. [→ Contexto_Base_Web.md §17B034]
 */
function updateGuerraSheet() {
  var ss  = _getSs();
  var sh  = ss.getSheetByName(CFG.SHEETS.GUERRA);
  if (!sh) { Logger.log('[Guerra] Hoja no encontrada'); return; }
  _asegurarColumnaCopasGuerra_(sh); // 12-oct-2026: la hoja necesita la columna 21 antes de leer o escribir con GUERRA_TOTAL_COLS

  // GUARDIA: sin cache no hay datos válidos — abortar para no corromper la [→ Contexto_Base_Web.md §17B035]
  if (!CACHE_CLAN_DATA) {
    Logger.log('[Guerra] cache vacío en esta ejecución, se intenta recuperar checkpoint de clanes...');
    capturarApiClanes_(CFG.CLANES_PROGRESO_MAX_EDAD_MS, 'GuerraSheet');
  }
  if (!CACHE_CLAN_DATA || !Object.keys(CACHE_CLAN_DATA).length) {
    Logger.log('[Guerra] ABORT: no hay cache de clanes ni checkpoint recuperable. Llamar desde runGuerra() o runUpdate(), no directamente.');
    return;
  }

  var ctx = _getCtx();
  Logger.log('[Guerra] Actualizando... PeriodIndex actual: ' + ctx.periodIndex);

  // DIAGNÓSTICO TEMPORAL (02-sep-2026): runGuerra() viene agotando el [→ Contexto_Base_Web.md §17B036]
  var _tGS0 = Date.now();

  // GUARDIA: periodIndex sospechoso de estar desactualizado (stale de la [→ Contexto_Base_Web.md §17B037]
  if (ctx.periodIndexSospechoso) {
    Logger.log('[Guerra] ABORT: periodIndex sospechoso, no se escribe esta corrida.');
    return;
  }

  // Restaurar desde CSV si la hoja está vacía (solo encabezado o vacía del [→ Contexto_Base_Web.md §17B038]
  var temporadasActivas = _temporadasActivasGuerra_(ctx);
  if (temporadasActivas.length > 1) {
    Logger.log('[Guerra][PERIODO] Los clanes estan en temporadas distintas: [' + temporadasActivas.join(', ') +
      '] (ctx.temporada=' + ctx.temporada + '). Se restauran y conservan en la hoja todas ellas.');
  }
  var restauracionCompleta = _restaurarGuerraDesdeCSVSiVacia(sh, temporadasActivas);
  Logger.log('[Guerra][t] tras _restaurarGuerraDesdeCSVSiVacia: ' + (Date.now() - _tGS0) + ' ms');
  if (restauracionCompleta === false) {
    Logger.log('[Guerra] updateGuerraSheet() corta acá: restauración desde CSV quedó incompleta, se reintenta en la próxima continuación antes de fusionar datos frescos.');
    return false;
  }

  // Leer TODA la hoja de datos UNA sola vez, en memoria. Antes, cada fila [→ Contexto_Base_Web.md §17B039]
  var lastRowGuerra = sh.getLastRow();
  var datosGuerra   = (lastRowGuerra >= 2)
    ? sh.getRange(2, 1, lastRowGuerra - 1, GUERRA_TOTAL_COLS).getValues()
    : [];
  var existingIds = _mapaIdsGuerra(datosGuerra);
  var huboCambiosExistentes = false;
  var fechasReparadas = 0;

  var now         = new Date();
  var nuevasFilas = [];

  // Procesar solo clanes Terna (no el clan vetado)
  for (var i = 0; i < CFG.TERNA_TAGS.length; i++) {
    var clanTag  = CFG.TERNA_TAGS[i];
    var clanData = _getClanCache(clanTag);
    if (!clanData) {
      Logger.log('[Guerra] Sin cache para ' + clanTag + ', saltando.');
      continue;
    }

    var rr      = clanData.riverrace || {};
    var info    = clanData.info      || {};
    var members = clanData.members   || [];

    // PENDIENTE e) RESUELTO (20-sep-2026, ver docblock de arriba de este [→ Contexto_Base_Web.md §17B040]
    if (rr.periodIndex === undefined || rr.periodIndex === null || rr.periodIndex === '' || isNaN(Number(rr.periodIndex))) {
      Logger.log('[Guerra][PROTECCION] ' + (info.name || clanTag) + ' (' + clanTag + '): currentriverrace sin periodIndex valido; ' +
        'se omite este clan en esta corrida (antes se escribia con periodIndex 0 / training).');
      try { Logger.log(_lineaPeriodoClan_('Guerra', info.name || '', clanTag, rr, ctx, null)); } catch (eLogPer0) {}
      continue;
    }
    var periodIndexClan  = Number(rr.periodIndex);
    var sectionIndexClan = (rr.sectionIndex !== undefined && rr.sectionIndex !== null && rr.sectionIndex !== '' && !isNaN(Number(rr.sectionIndex)))
      ? Number(rr.sectionIndex) : periodIdxToSectionIndex(periodIndexClan);
    var temporadaClan = _temporadaDeClan_(ctx, periodIndexClan);
    var ctxClan = {
      temporada:    temporadaClan,
      ref:          ctx.ref,
      sectionIndex: sectionIndexClan,
      periodIndex:  periodIndexClan,
      diaLetra:     periodIdxToLetra(periodIndexClan),
      periodType:   rr.periodType || 'training',
      diaGuerra:    calcDiaGuerraIdx(ctx.ref, temporadaClan, periodIndexClan)
    };

    // LOG DE PERIODO POR CLAN (05-oct-2026, pedido usuario): sectionIndex/periodIndex que reporta la API [→ Contexto_Base_Web.md §17B041]
    try { Logger.log(_lineaPeriodoClan_('Guerra', info.name || '', clanTag, rr, ctx, ctxClan)); } catch (eLogPer) {}

    // Mapa de miembros activos del clan para cruzar donaciones/ranking
    var memberMap = {};
    for (var k = 0; k < members.length; k++) {
      memberMap[members[k].tag] = members[k];
    }

    // Participantes de guerra del clan
    var participants = (rr.clan && rr.clan.participants) ? rr.clan.participants : [];

    // Determinar la etapa actual (PROPIA de este clan, ver ctxClan arriba)
    var etapa = (ctxClan.periodType === 'training') ? 'Entrenamiento' : 'Guerra';

    var clanNombre = info.name || '';
    var diaGuerra  = ctxClan.diaGuerra;

    // PROTECCION (05-oct-2026, pedido usuario -- "domingo T5 S4 sin ataques"): el lunes 05-oct, 4:48-5:08 a.m. (Lima), [→ Contexto_Base_Web.md §17B042]
    if (_apiGuerraReiniciadaParaClan_(datosGuerra, clanNombre, ctxClan.temporada, ctxClan.periodIndex, participants)) {
      Logger.log('[Guerra][PROTECCION] ' + clanNombre + ', periodIndex ' + ctxClan.periodIndex + ': la API devolvio a TODOS los participantes en 0 (decksUsed, fame, boatAttacks) y la hoja ya tiene datos de ese dia. Se omite este clan en esta corrida para no pisar el cierre del dia.');
      continue;
    }

    for (var j = 0; j < participants.length; j++) {
      var part = participants[j];
      var tag  = String(part.tag || '').trim();
      if (!tag) continue;

      // Solo registrar jugadores que están actualmente en el memberList del clan
      if (!memberMap[tag]) continue;

      var ataqHoy  = Number(part.decksUsedToday) || 0;
      var ataqSem  = Number(part.decksUsed)       || 0;
      var fame     = Number(part.fame)             || 0;
      var barcos   = Number(part.boatAttacks)      || 0;

      // ALERTA especial: registrar en log si hay barcos [→ Contexto_Base_Web.md §17B043]
      if (barcos > 0) {
        var desgloseBarcos = _desgloseBarcosPorDia(tag, clanTag, ctxClan, datosGuerra, barcos);
        Logger.log('ALERTA BARCOS: ' + part.name + ' (' + tag + ') │ ' +
                   clanNombre + ' │ Día(s): ' + (desgloseBarcos || ctxClan.diaLetra) +
                   ' │ Total semana:' + barcos);
      }

      // PUNTO 1.7 (Consolidado_Cambios_Pendientes_Guerra.md) — corrección [→ Contexto_Base_Web.md §17B044]
      if (_autocorregirAtaqueDiaAnteriorDecksUsed(tag, clanTag, ctxClan, datosGuerra, ataqHoy, ataqSem, fame, barcos)) {
        huboCambiosExistentes = true;
      }

      var mem     = memberMap[tag] || {};
      var donR    = Number(mem.donationsReceived) || 0;
      var donD    = Number(mem.donations)         || 0;
      var ranking = Number(mem.clanRank)          || 0;
      var copas   = Number(mem.trophies)          || 0; // 12-oct-2026: copas del jugador hoy (misma fuente que clanRank)

      // Nombre: preferir el de /clans/{tag} (memberMap, mem.name), que [→ Contexto_Base_Web.md §17B045]
      var nombreActual = mem.name || part.name || '';

      // ID único de deduplicación: tag + clan + temporada + sectionIndex + periodIndex. [→ Contexto_Base_Web.md §17B046]
      var idGuerra = tag.toUpperCase() + '│' + clanNombre + '│' + ctxClan.temporada + '│' + ctxClan.sectionIndex + '│' + ctxClan.periodIndex;

      if (existingIds[idGuerra] !== undefined) {
        // FILA EXISTENTE: actualizar SOLO si el nuevo valor es MAYOR [→ Contexto_Base_Web.md §17B047]
        var idx      = existingIds[idGuerra];
        var existing = datosGuerra[idx];

        var ataqHoyEx  = Number(existing[GC.ATAQUES_HOY - 1]) || 0;
        var ataqSemEx  = Number(existing[GC.ATAQUES_SEM - 1]) || 0;
        var fameEx     = Number(existing[GC.FAME - 1])        || 0;
        var barcosEx   = Number(existing[GC.BARCOS - 1])      || 0;

        // Con el ID basado en periodIndex (ver comentario arriba), cada fila [→ Contexto_Base_Web.md §17B048]
        if (ataqHoy === 0 && ataqHoyEx > 0 && fame > 0 && fame >= fameEx && ataqSem >= ataqSemEx && ataqSem > 0) {
          var hoyProtegido = ataqHoyEx;
          var semPrev = _semAcumDiaAnteriorGuerra_(datosGuerra, tag, clanNombre, ctxClan.temporada, ctxClan.periodIndex - 1);
          if (semPrev !== null) {
            var desdeSem = ataqSem - semPrev;
            if (desdeSem >= 0 && desdeSem <= 4 && desdeSem > hoyProtegido) hoyProtegido = desdeSem;
          }
          Logger.log('[Guerra][PROTECCION] contador diario reiniciado: ' + tag + ' (' + nombreActual + ') en ' + clanNombre + ', periodIndex ' + ctxClan.periodIndex +
            '. API: decksUsedToday=0, decksUsed=' + ataqSem + ', fame=' + fame + '. Se conserva AtaquesHoy=' + hoyProtegido + ' (hoja: ' + ataqHoyEx + ').');
          ataqHoy = hoyProtegido;
        }
        if (ataqHoy < ataqHoyEx) {
          Logger.log('[Guerra][ALERTA] AtaquesHoy BAJÓ de ' + ataqHoyEx + ' a ' + ataqHoy +
            ' — ' + tag + ' (' + nombreActual + ') en ' + clanNombre +
            ', periodIndex ' + ctxClan.periodIndex + ', periodType ' + ctxClan.periodType +
            '. API: decksUsedToday=' + ataqHoy + ', decksUsed=' + ataqSem + ', fame=' + fame + '.');
        }
        // PROTECCION DE FAMA (11-oct-2026, caso domingo 04-oct T5 S4) [→ Contexto_Base_Web.md §PF031]
        // La fama no baja a 0 dentro de un mismo periodIndex. Si la API la devuelve en 0 y la fila ya tenia fama > 0,
        // es un reinicio de la API, no un dato: se conserva la de la hoja. Es mas estrecho que un ratchet general
        // (§17B048 quito ese ratchet a proposito): solo bloquea el 0 y deja pasar cualquier otro valor.
        if (fame === 0 && fameEx > 0) {
          Logger.log('[Guerra][PROTECCION FAMA] la API devolvio fame=0 pero la fila ya tenia ' + fameEx + ': ' + tag + ' (' + nombreActual + ') en ' + clanNombre +
            ', periodIndex ' + ctxClan.periodIndex + '. API: decksUsed=' + ataqSem + ', decksUsedToday=' + ataqHoy + '. Se conserva la fama de la hoja.');
          fame = fameEx;
        }
        if (ataqHoy !== ataqHoyEx) { existing[GC.ATAQUES_HOY - 1] = ataqHoy; huboCambiosExistentes = true; }
        if (ataqSem !== ataqSemEx) { existing[GC.ATAQUES_SEM - 1] = ataqSem; huboCambiosExistentes = true; }
        if (fame    !== fameEx)    { existing[GC.FAME - 1]        = fame;    huboCambiosExistentes = true; }
        if (barcos  !== barcosEx)  { existing[GC.BARCOS - 1]      = barcos;  huboCambiosExistentes = true; }

        // Donaciones, ranking y Nombre siempre se actualizan (son [→ Contexto_Base_Web.md §17B049]
        existing[GC.DON_R - 1]   = donR;
        existing[GC.DON_D - 1]   = donD;
        existing[GC.RANKING - 1] = ranking;
        if (copas > 0) existing[GC.COPAS - 1] = copas; // 0 = la API no mandó trofeos; no se pisa un valor ya guardado
        if (nombreActual && nombreActual !== String(existing[GC.NOMBRE - 1] || '')) {
          existing[GC.NOMBRE - 1] = nombreActual;
        }
        // AUTORREPARACIÓN DE DiaGuerra (05-oct-2026): si una corrida anterior se cortó [→ Contexto_Base_Web.md §17B050]
        if (_celdaVaciaGuerra_(existing[GC.DIA_GUERRA - 1]) && diaGuerra instanceof Date && !isNaN(diaGuerra.getTime())) {
          existing[GC.DIA_GUERRA - 1] = diaGuerra;
          fechasReparadas++;
        }
        huboCambiosExistentes = true;

        continue;
      }

      // FILA NUEVA [→ Contexto_Base_Web.md §17B051]
      nuevasFilas.push({
        id: idGuerra,
        row: [
          null,                      // N° (se asigna al escribir)
          _fechaPrimeraConsultaRR_(ctxClan.temporada, ctxClan.periodIndex, clanTag, now), // Fecha = PRIMERA consulta del periodIndex (12-oct-2026); no cambia al actualizar
          ctxClan.temporada,         // Temporada
          ctxClan.sectionIndex + 1,  // Semana
          ctxClan.diaLetra,          // Día
          ctxClan.periodIndex,       // PeriodIndex
          diaGuerra,                 // DiaGuerra (Date)
          etapa,                     // Etapa
          clanNombre,                // Clan
          tag,                       // Tag
          nombreActual,          // Nombre (preferido: mem.name de /clans, ver comentario arriba)
          ataqHoy,              // AtaquesHoy
          ataqSem,              // AtaquesSemana
          fame,                 // Fame
          barcos,               // Barcos
          donR,                 // Donaciones_r
          donD,                 // Donaciones_d
          ranking,              // Ranking
          ctxClan.temporada + _getTemporadaOffsetRoyaleApi(), // Temporada_2 (punto 1.4)
          'Original',           // Origen (punto 1.5)
          copas > 0 ? copas : '' // Copas (12-oct-2026)
        ]
      });
      existingIds[idGuerra] = true;
    }
  }

  Logger.log('[Guerra][t] tras loop de participantes: ' + (Date.now() - _tGS0) + ' ms');

  // Volcar TODOS los cambios de filas existentes en UNA sola escritura [→ Contexto_Base_Web.md §17B052]
  if (huboCambiosExistentes && datosGuerra.length > 0) {
    sh.getRange(2, 1, datosGuerra.length, GUERRA_TOTAL_COLS).setValues(datosGuerra);
  }

  // Ordenar nuevas filas por PeriodIndex ASC
  nuevasFilas.sort(function(a, b) {
    return (a.row[GC.PERIOD_IDX - 1] || 0) - (b.row[GC.PERIOD_IDX - 1] || 0);
  });

  if (nuevasFilas.length > 0) {
    var startRow = sh.getLastRow() < 1 ? 2 : sh.getLastRow() + 1;

    // FIX (05-oct-2026): Fecha y DiaGuerra se escriben en el MISMO setValues que el [→ Contexto_Base_Web.md §17B053]
    var batchValues = nuevasFilas.map(function(f, idx) {
      f.row[0] = startRow + idx - 1; // N°
      var fch = f.row[GC.FECHA - 1];
      if (!(fch instanceof Date) || isNaN(fch.getTime())) f.row[GC.FECHA - 1] = now;
      var dg = f.row[GC.DIA_GUERRA - 1];
      if (!(dg instanceof Date) || isNaN(dg.getTime())) {
        var dgCalc = calcDiaGuerraIdx(CFG.REF_DEFAULT, Number(f.row[GC.TEMPORADA - 1]) || 0, Number(f.row[GC.PERIOD_IDX - 1]) || 0);
        f.row[GC.DIA_GUERRA - 1] = (dgCalc instanceof Date && !isNaN(dgCalc.getTime())) ? dgCalc : '';
      }
      return f.row;
    });

    sh.getRange(startRow, 1, batchValues.length, GUERRA_TOTAL_COLS).setValues(batchValues);
    sh.getRange(startRow, GC.FECHA,      batchValues.length, 1).setNumberFormat('dddd, d "de" mmmm"," yyyy h:mm:ss AM/PM');
    sh.getRange(startRow, GC.DIA_GUERRA, batchValues.length, 1).setNumberFormat('dd/mm/yyyy');
  }

  if (fechasReparadas > 0) {
    sh.getRange(2, GC.DIA_GUERRA, datosGuerra.length, 1).setNumberFormat('dd/mm/yyyy');
    Logger.log('[Guerra][FECHAS] Autorreparadas ' + fechasReparadas + ' celda(s) vacía(s) de DiaGuerra en filas existentes (Fecha no se modifica).');
  }

  Logger.log('[Guerra][t] tras escrituras (existentes+nuevas): ' + (Date.now() - _tGS0) + ' ms');

  // Formato condicional por Día (columna E)
  _aplicarFmtCondicionalGuerra(sh);

  // Ocultar (no borrar, para no perder el histórico) filas de cuentas [→ Contexto_Base_Web.md §17B054]
  _ocultarFilasTagsOcultos(sh, GC.TAG);

  Logger.log('[Guerra][t] tras _aplicarFmtCondicionalGuerra + _ocultarFilasTagsOcultos: ' + (Date.now() - _tGS0) + ' ms');

  // PURGA (02-ago-2026): la hoja Guerra ya no acumula el histórico completo, [→ Contexto_Base_Web.md §17B055]
  _purgarTemporadasAnterioresGuerra(sh, temporadasActivas);

  Logger.log('[Guerra][t] tras _purgarTemporadasAnterioresGuerra: ' + (Date.now() - _tGS0) + ' ms');

  // NOTA (17-jul-2026, actualizada 02-ago-2026): el respaldo NORMAL a [→ Contexto_Base_Web.md §17B056]

  // FIX (02-ago-2026): mismo caso que _escribirDirectorio() en [→ Contexto_Base_Web.md §17B057]
  var _propsGS = PropertiesService.getScriptProperties();
  var _ultimaLimpiezaLinksGuerra = Number(_propsGS.getProperty('_guerraLimpiarLinksUltimaVezMs')) || 0;
  var _elapsedAntesDeLimpiarLinks = Date.now() - _tGS0;
  if ((Date.now() - _ultimaLimpiezaLinksGuerra) < CFG.GUERRA_LIMPIAR_LINKS_INTERVALO_MS) {
    Logger.log('[Guerra] _limpiarLinksAccidentalesGuerraIncremental() SALTADO (throttle ' +
      Math.round(CFG.GUERRA_LIMPIAR_LINKS_INTERVALO_MS / 60000) + ' min, ' +
      'faltan ' + Math.round((CFG.GUERRA_LIMPIAR_LINKS_INTERVALO_MS - (Date.now() - _ultimaLimpiezaLinksGuerra)) / 60000) +
      ' min para la próxima).');
  } else if (_elapsedAntesDeLimpiarLinks >= CFG.GUERRA_LIMPIAR_LINKS_MAX_ELAPSED_MS) {
    // FIX (04-sep-2026): ver docblock de CFG.GUERRA_LIMPIAR_LINKS_MAX_ELAPSED_MS [→ Contexto_Base_Web.md §17B058]
    Logger.log('[Guerra] _limpiarLinksAccidentalesGuerraIncremental() SALTADO (ya van ' +
      Math.round(_elapsedAntesDeLimpiarLinks / 1000) + 's transcurridos, ' +
      'por encima del margen de ' + Math.round(CFG.GUERRA_LIMPIAR_LINKS_MAX_ELAPSED_MS / 1000) +
      's; se reintenta en la próxima corrida).');
  } else {
    var _terminoCompleto = _limpiarLinksAccidentalesGuerraIncremental(sh);
    if (_terminoCompleto) _propsGS.setProperty('_guerraLimpiarLinksUltimaVezMs', String(Date.now()));
    // Si NO terminó completo (cortó por presupuesto interno), NO se marca [→ Contexto_Base_Web.md §17B059]
    Logger.log('[Guerra][t] tras _limpiarLinksAccidentalesGuerraIncremental (completo: ' +
      _terminoCompleto + '): ' + (Date.now() - _tGS0) + ' ms');
  }

  // FIX (19-ago-2026, pedido usuario: "la hoja Nuevos debe eliminar filas [→ Contexto_Base_Web.md §17B060]
  if (typeof _purgarNuevosExpulsados === 'function') {
    try {
      var shNuevos = ss.getSheetByName(CFG.SHEETS.NUEVOS);
      if (shNuevos) {
        var dirDataNuevos = _leerDirectorioFisicoComoDC(ss);
        var dirPorTagNuevos = {};
        for (var iDirNuevos = 0; iDirNuevos < dirDataNuevos.length; iDirNuevos++) {
          var tgNuevos = String(dirDataNuevos[iDirNuevos][DC.TAG - 1] || '').trim().toUpperCase();
          if (tgNuevos) dirPorTagNuevos[tgNuevos] = dirDataNuevos[iDirNuevos];
        }
        var purgadosExMiembrosGuerra = _purgarNuevosExpulsados(shNuevos, dirPorTagNuevos);
        if (purgadosExMiembrosGuerra > 0 && typeof _renumerarNuevos === 'function') {
          _renumerarNuevos(shNuevos);
        }
      }
    } catch (eNuevos) {
      Logger.log('[Guerra] _purgarNuevosExpulsados() falló: ' + eNuevos.message);
    }
  }

  Logger.log('[Guerra] updateGuerraSheet completado. Nuevas filas: ' + nuevasFilas.length +
    ' | tiempo total tras restauración: ' + (Date.now() - _tGS0) + ' ms');
}

// GUERRA_LOGS SHEET [→ Contexto_Base_Web.md §17B061]

/**
 * _logsPorPeriodoDeTag_(rr, tag) [→ Contexto_Base_Web.md §17B062]
 */
function _logsPorPeriodoDeTag_(rr, tag) {
  var out = {};
  if (!rr || !rr.periodLogs) return out;
  var tagUp = String(tag || '').toUpperCase();
  rr.periodLogs.forEach(function(l) {
    var itemData = { pointsEarned: 0, progressStartOfDay: 0, progressEndOfDay: 0, endOfDayRank: null,
                     progressEarned: null, numOfDefensesRemaining: null, progressEarnedFromDefenses: null,
                     encontrado: false };
    if (l.items && l.items.length) {
      for (var ii = 0; ii < l.items.length; ii++) {
        var it = l.items[ii];
        if (it.clan && String(it.clan.tag || '').toUpperCase() === tagUp) {
          itemData.pointsEarned       = Number(it.pointsEarned)       || 0;
          itemData.progressStartOfDay = Number(it.progressStartOfDay) || 0;
          itemData.progressEndOfDay   = Number(it.progressEndOfDay)   || 0;
          // endOfDayRank: null si no viene (día sin cerrar); 0 = primer puesto.
          itemData.endOfDayRank       = (it.endOfDayRank === undefined || it.endOfDayRank === null) ? null : (Number(it.endOfDayRank) || 0);
          itemData.progressEarned            = (it.progressEarned            === undefined || it.progressEarned            === null) ? null : (Number(it.progressEarned)            || 0);
          itemData.numOfDefensesRemaining    = (it.numOfDefensesRemaining    === undefined || it.numOfDefensesRemaining    === null) ? null : (Number(it.numOfDefensesRemaining)    || 0);
          itemData.progressEarnedFromDefenses = (it.progressEarnedFromDefenses === undefined || it.progressEarnedFromDefenses === null) ? null : (Number(it.progressEarnedFromDefenses) || 0);
          itemData.encontrado = true;
          break;
        }
      }
    }
    out[l.periodIndex] = {
      periodIndex:        l.periodIndex,
      pointsEarned:       itemData.pointsEarned,
      progressStartOfDay: itemData.progressStartOfDay,
      progressEndOfDay:   itemData.progressEndOfDay,
      endOfDayRank:       itemData.endOfDayRank,
      progressEarned:            itemData.progressEarned,
      numOfDefensesRemaining:    itemData.numOfDefensesRemaining,
      progressEarnedFromDefenses: itemData.progressEarnedFromDefenses,
      encontrado:         itemData.encontrado
    };
  });
  return out;
}

// PENDIENTE (19-sep-2026): revisar Guerra_Logs en semanas/temporadas pasadas y los domingos con
// ceros -- ver el bloque "PENDIENTE" y recalcularGuerraLogsDesdeJSON() en la Sección 1 de este archivo.
/**
 * Actualiza la hoja Guerra_Logs con los periodLogs del riverrace de cada clan Terna. [→ Contexto_Base_Web.md §17B063]
 */
function updateGuerraLogsSheet() {
  var ss  = _getSs();
  var sh  = ss.getSheetByName(CFG.SHEETS.GUERRA_LOGS);
  if (!sh) { Logger.log('[GuerraLogs] Hoja no encontrada'); return; }

  // FIX (07-ago-2026): el encabezado de la columna Min_G (col 21 = U) [→ Contexto_Base_Web.md §17B064]
  if (String(sh.getRange(1, GLC.MIN_G).getValue() || '').trim() !== 'Min_G') {
    sh.getRange(1, GLC.MIN_G).setValue('Min_G');
    applyHeaderStyle(sh, GUERRA_LOGS_TOTAL_COLS);
    Logger.log('[GuerraLogs] FIX: encabezado de Min_G (columna U) estaba vacío, corregido.');
  }
  // Mismo FIX que el de arriba, para la columna EndOfDayRank (22, FASE 13 [→ Contexto_Base_Web.md §17B065]
  if (String(sh.getRange(1, GLC.END_OF_DAY_RANK).getValue() || '').trim() !== 'EndOfDayRank') {
    sh.getRange(1, GLC.END_OF_DAY_RANK).setValue('EndOfDayRank');
    applyHeaderStyle(sh, GUERRA_LOGS_TOTAL_COLS);
    Logger.log('[GuerraLogs] FIX: encabezado de EndOfDayRank (columna V) estaba vacío, corregido.');
  }
  // Nota en el encabezado: el puesto empieza en 0 (un 2 es el tercer puesto).
  _notaEndOfDayRankGuerraLogs_(sh);
  // TANDA 1 (20-sep-2026): columnas físicas, encabezados y notas de
  // ProgressEarned / NumOfDefensesRemaining / ProgressEarnedFromDefenses.
  _asegurarColumnasGuerraLogs_(sh);

  var ctx = _getCtx();
  Logger.log('[GuerraLogs] Actualizando... PeriodIndex actual: ' + ctx.periodIndex);

  if (ctx.periodIndexSospechoso) {
    Logger.log('[GuerraLogs] ABORT: periodIndex sospechoso, no se escribe esta corrida.');
    return;
  }

  // Igual que en updateGuerraSheet(): leer toda la hoja UNA vez y mutar en [→ Contexto_Base_Web.md §17B066]
  var lastRowLogs = sh.getLastRow();
  var datosLogs    = (lastRowLogs >= 2)
    ? sh.getRange(2, 1, lastRowLogs - 1, GUERRA_LOGS_TOTAL_COLS).getValues()
    : [];
  var existingIds = _mapaIdsGuerraLogs(datosLogs);
  var huboCambiosExistentesLogs = false;

  var now         = new Date();
  var nuevasFilas = [];

  // Min_G vigente por clan (CR_Lista, categoría Descensos, columna [→ Contexto_Base_Web.md §17B067]
  var minGPorTag = _getMinGClanMaps().byTag;

  // Procesar solo clanes Terna
  for (var i = 0; i < CFG.TERNA_TAGS.length; i++) {
    var clanTag  = CFG.TERNA_TAGS[i];
    var clanData = _getClanCache(clanTag);
    if (!clanData) continue;

    var minGClan = (minGPorTag[clanTag] !== undefined) ? minGPorTag[clanTag] : CFG.MIN_G_DEFAULT;

    var rr      = clanData.riverrace || {};
    var info    = clanData.info      || {};
    var members = clanData.members   || [];

    // PENDIENTE e) RESUELTO (20-sep-2026, ver docblock de arriba de este [→ Contexto_Base_Web.md §17B068]
    if (rr.periodIndex === undefined || rr.periodIndex === null || rr.periodIndex === '' || isNaN(Number(rr.periodIndex))) {
      Logger.log('[GuerraLogs][PROTECCION] ' + (info.name || clanTag) + ' (' + clanTag + '): currentriverrace sin periodIndex valido; se omite este clan en esta corrida.');
      continue;
    }
    var periodIndexClan  = Number(rr.periodIndex);
    var sectionIndexClan = (rr.sectionIndex !== undefined && rr.sectionIndex !== null && rr.sectionIndex !== '' && !isNaN(Number(rr.sectionIndex)))
      ? Number(rr.sectionIndex) : periodIdxToSectionIndex(periodIndexClan);
    var temporadaClan    = _temporadaDeClan_(ctx, periodIndexClan);

    // Calcular todos los periodIndexes de la semana actual DE ESTE CLAN
    // (dias de guerra: offsets 3,4,5,6) -- sectionIndexClan * 7 + 3..6.
    var pIdxsGuerraClan = [
      sectionIndexClan * 7 + 3,
      sectionIndexClan * 7 + 4,
      sectionIndexClan * 7 + 5,
      sectionIndexClan * 7 + 6
    ];
    // Solo incluir los que ya ocurrieron para ESTE clan (≤ su propio periodIndex)
    var pIdxsActivosClan = pIdxsGuerraClan.filter(function(p) { return p <= periodIndexClan; });

    // TANDA 4 (20-sep-2026, pedido del usuario -- domingo de Guerra_Logs): el [→ Contexto_Base_Web.md §17B069]
    var pIdxDomingoPrevioClan = (sectionIndexClan > 0) ? (sectionIndexClan * 7 - 1) : -1;
    if (pIdxDomingoPrevioClan >= 0) pIdxsActivosClan.unshift(pIdxDomingoPrevioClan);

    // Construir mapa de logs desde periodLogs[].items[] filtrando por clanTag [→ Contexto_Base_Web.md §17B070]
    var myLogs = _logsPorPeriodoDeTag_(rr, clanTag);

    // TANDA 7 (21-sep-2026): estimación del puesto/avance del domingo EN CURSO
    // (solo si este clan está en domingo). Ver _estimarPuestosDomingoRR_().
    var estDomingoClan = ((periodIndexClan % 7) === 6) ? _estimarPuestosDomingoRR_(rr, clanTag) : {};

    // TANDA 8 (21-sep-2026): SEMANA DE COLISEO (última de la temporada). La API [→ Contexto_Base_Web.md §17B071]
    var esColiseoClan  = (String(rr.periodType || '') === 'colosseum');
    var estColiseoClan = esColiseoClan ? _estimarPuestosColiseoRR_(rr, clanTag) : {};

    // Datos estáticos del clan (disponibles siempre)
    var donaciones  = Number(info.donationsPerWeek)              || 0;
    var trofeosG    = Number(info.clanWarTrophies)               || 0;
    var copasClan   = Number(info.clanScore)                     || 0;
    var numMiembros = Number(info.members)                       || 0;
    var liderNombre = getClanLeader(members);
    var liderTag    = getClanLeaderTag(members);

    // Datos dinámicos del clan (del día actual en el cache)
    var rClan       = rr.clan || {};
    var repairPts   = Number(rClan.repairPoints) || 0;
    var periodPts   = Number(rClan.periodPoints) || 0;
    var fameActual  = Number(rClan.fame)         || 0;

    for (var pi = 0; pi < pIdxsActivosClan.length; pi++) {
      var pIdx = pIdxsActivosClan[pi];

      var sIdx        = periodIdxToSectionIndex(pIdx);
      var diaLetraLog = periodIdxToLetra(pIdx);
      var diaGuerraLog = calcDiaGuerraIdx(ctx.ref, temporadaClan, pIdx);

      // ID único: clanTag + temporada + sectionIndex + periodIndex
      var idLog = clanTag + '│' + temporadaClan + '│' + sIdx + '│' + pIdx;

      // Datos del log (desde periodLogs si existen, o del cache para el día actual)
      var log = myLogs[pIdx] || null;
      var esDiaActual = (pIdx === periodIndexClan);
      // TANDA 13b (21-sep-2026): ¿hay log CERRADO de este clan para este día?
      // Sin él, los valores de la fila los calcula el código (Estimado).
      var logCerradoT = !!(log && log.encontrado);

      // TANDA 4: domingo de la semana anterior -> solo si el log cerrado de
      // ESTE clan ya viene en periodLogs; sin log no se crea ni se toca nada.
      var esDomPrev = (pIdx === pIdxDomingoPrevioClan);
      if (esDomPrev && !(log && log.encontrado)) continue;

      var ptsEarned = log ? (Number(log.pointsEarned)       || 0) : 0;
      var progStart = log ? (Number(log.progressStartOfDay) || 0) : 0;
      // progressEndOfDay: si hay log cerrado úsalo; si es día actual usa fame del cache [→ Contexto_Base_Web.md §17B072]
      var progEnd   = log ? (Number(log.progressEndOfDay)   || 0) : (esDiaActual ? Math.min(fameActual, META_GUERRA_PROGRESO) : 0);
      // EndOfDayRank (FASE 13 punto 1): solo viene en periodLogs ya [→ Contexto_Base_Web.md §17B073]
      var rankEnd   = log ? log.endOfDayRank : null;
      // TANDA 1 (20-sep-2026): avance ganado por puesto, defensas restantes y [→ Contexto_Base_Web.md §17B074]
      var progGanado = log ? log.progressEarned             : null;
      var defRest    = log ? log.numOfDefensesRemaining     : null;
      var progDef    = log ? log.progressEarnedFromDefenses : null;

      // TANDA 4 (20-sep-2026): DOMINGO EN CURSO, valores PROVISIONALES. Si es [→ Contexto_Base_Web.md §17B075]
      if (!esDomPrev && !(log && log.encontrado) && esDiaActual && (pIdx % 7) === 6 &&
          Number(rr.periodIndex) === pIdx && !esColiseoClan) {
        ptsEarned = periodPts;
        var finSabadoClan = _progressEndDiaAnterior_(myLogs, pIdx - 1, existingIds, datosLogs, clanTag, temporadaClan);
        progStart = (finSabadoClan > 0)
          ? Math.min(finSabadoClan, META_GUERRA_PROGRESO)
          : Math.min(fameActual, META_GUERRA_PROGRESO);
        var estDomClan = estDomingoClan[_tagComparableLogs_(clanTag)];
        if (estDomClan) {
          rankEnd    = estDomClan.rank;
          progGanado = estDomClan.progressEarned;
          if (estDomClan.cruzo) {
            // Clan que ya cruzó la meta antes de hoy (log real verificado en [→ Contexto_Base_Web.md §17B076]
            progStart = estDomClan.fame;
            progEnd   = estDomClan.fame;
            defRest   = 0;
            progDef   = 0;
          }
        }
      }

      // TANDA 8 (21-sep-2026, pedido del usuario): DÍA DE COLISEO (jueves a [→ Contexto_Base_Web.md §17B077]
      var ptsColiseo = null;
      var esFilaColiseo = (esColiseoClan && !esDomPrev);
      if (esFilaColiseo) {
        progStart = 0;
        progEnd   = 0;
        if (esDiaActual && Number(rr.periodIndex) === pIdx) {
          var previosColiseo = _sumaPuntosColiseoPrevios_(clanTag, temporadaClan, pIdx, fameActual, existingIds, datosLogs);
          if (previosColiseo !== null) {
            ptsColiseo = Math.max(0, fameActual - previosColiseo);
            ptsEarned  = ptsColiseo;
          }
          var estColiseoFila = estColiseoClan[_tagComparableLogs_(clanTag)];
          if (estColiseoFila) rankEnd = estColiseoFila.rank;
        }
      }

      if (existingIds[idLog] !== undefined) {
        // FILA EXISTENTE: actualizar solo datos dinámicos si son mayores o más completos
        var idxLog   = existingIds[idLog];
        var existing = datosLogs[idxLog];

        // TANDA 4: domingo de la semana anterior. Con el log cerrado como [→ Contexto_Base_Web.md §17B078]
        if (esDomPrev) {
          var cambioDom = false;
          if (_actualizarValorLogSiCambia_(existing, GLC.PTS_EARNED,      ptsEarned)) cambioDom = true;
          if (_actualizarValorLogSiCambia_(existing, GLC.PROG_START,      progStart)) cambioDom = true;
          if (_actualizarValorLogSiCambia_(existing, GLC.PROG_END,        progEnd))   cambioDom = true;
          if (_actualizarValorLogSiCambia_(existing, GLC.END_OF_DAY_RANK, rankEnd))   cambioDom = true;
          if (_actualizarValorLogSiCambia_(existing, GLC.PROG_EARNED,     progGanado)) cambioDom = true;
          if (_actualizarValorLogSiCambia_(existing, GLC.DEF_REMAINING,   defRest))    cambioDom = true;
          if (_actualizarValorLogSiCambia_(existing, GLC.PROG_DEFENSES,   progDef))    cambioDom = true;
          // TANDA 13b: con el log cerrado como fuente, la fila pasa a Leído si
          // quedó igual al log (nunca al revés).
          if (_marcarEstadoLog_(existing, _filaCoincideConLogCerrado_(existing, log))) cambioDom = true;
          if (cambioDom) huboCambiosExistentesLogs = true;
          continue;
        }

        // TANDA 5: filas Terna anteriores al cambio tienen Tipo vacío; las de
        // la semana actual se marcan solas en la próxima corrida.
        if (!existing[GLC.TIPO - 1]) { existing[GLC.TIPO - 1] = 'Terna'; huboCambiosExistentesLogs = true; }

        if (!existing[GLC.LIDER - 1]) { existing[GLC.LIDER - 1] = liderNombre; huboCambiosExistentesLogs = true; }
        if (!existing[GLC.TAG_L - 1]) { existing[GLC.TAG_L - 1] = liderTag;    huboCambiosExistentesLogs = true; }

        if (donaciones  > (Number(existing[GLC.DONACIONES  - 1]) || 0)) { existing[GLC.DONACIONES - 1] = donaciones;  huboCambiosExistentesLogs = true; }
        if (trofeosG   !== (Number(existing[GLC.TROFEOS    - 1]) || 0)) { existing[GLC.TROFEOS    - 1] = trofeosG;   huboCambiosExistentesLogs = true; }
        if (copasClan  !== (Number(existing[GLC.COPAS      - 1]) || 0)) { existing[GLC.COPAS      - 1] = copasClan;  huboCambiosExistentesLogs = true; }
        if (numMiembros !== (Number(existing[GLC.MIEMBROS  - 1]) || 0)) { existing[GLC.MIEMBROS   - 1] = numMiembros; huboCambiosExistentesLogs = true; }
        if (repairPts   > (Number(existing[GLC.REPAIR_PTS  - 1]) || 0)) { existing[GLC.REPAIR_PTS - 1] = repairPts;  huboCambiosExistentesLogs = true; }
        if (periodPts   > (Number(existing[GLC.PERIOD_PTS  - 1]) || 0)) { existing[GLC.PERIOD_PTS - 1] = periodPts;  huboCambiosExistentesLogs = true; }
        if (ptsEarned   > (Number(existing[GLC.PTS_EARNED  - 1]) || 0)) { existing[GLC.PTS_EARNED - 1] = ptsEarned;  huboCambiosExistentesLogs = true; }
        if (progStart   > (Number(existing[GLC.PROG_START  - 1]) || 0)) { existing[GLC.PROG_START - 1] = progStart;  huboCambiosExistentesLogs = true; }
        if (progEnd     > (Number(existing[GLC.PROG_END    - 1]) || 0)) { existing[GLC.PROG_END   - 1] = progEnd;    huboCambiosExistentesLogs = true; }

        // EndOfDayRank (FASE 13 punto 1): backfill automático. Se [→ Contexto_Base_Web.md §17B079]
        if (_actualizarValorLogSiCambia_(existing, GLC.END_OF_DAY_RANK, rankEnd)) huboCambiosExistentesLogs = true;

        // TANDA 1 (20-sep-2026): ProgressEarned / NumOfDefensesRemaining / [→ Contexto_Base_Web.md §17B080]
        if (_actualizarValorLogSiCambia_(existing, GLC.PROG_EARNED,   progGanado)) huboCambiosExistentesLogs = true;
        if (_actualizarValorLogSiCambia_(existing, GLC.DEF_REMAINING, defRest))    huboCambiosExistentesLogs = true;
        if (_actualizarValorLogSiCambia_(existing, GLC.PROG_DEFENSES, progDef))    huboCambiosExistentesLogs = true;

        // Min_G: fila de la semana actual (única que este bucle toca) -> [→ Contexto_Base_Web.md §17B081]
        if (Number(existing[GLC.MIN_G - 1]) !== minGClan) { existing[GLC.MIN_G - 1] = minGClan; huboCambiosExistentesLogs = true; }

        // TANDA 13b (21-sep-2026): Estado. Leído solo si hay log cerrado, no es [→ Contexto_Base_Web.md §17B082]
        if (_marcarEstadoLog_(existing, logCerradoT && !esFilaColiseo && _filaCoincideConLogCerrado_(existing, log))) huboCambiosExistentesLogs = true;

        continue;
      }

      // FILA NUEVA
      nuevasFilas.push({
        id:  idLog,
        row: [
          null,            // N°
          _fechaPrimeraConsultaRR_(temporadaClan, pIdx, clanTag, now), // Fecha = PRIMERA consulta del periodIndex (12-oct-2026); no cambia al actualizar
          temporadaClan,   // Temporada
          sIdx + 1,        // Semana
          diaLetraLog,     // Día
          diaGuerraLog,    // DiaGuerra (Date)
          info.name || '', // Clan
          clanTag,         // Tag (del clan)
          pIdx,            // PeriodIndex
          liderNombre,     // Líder
          liderTag,        // Tag(L)
          donaciones,      // Donaciones
          trofeosG,        // Trofeos
          copasClan,       // Copas
          numMiembros,     // Miembros
          repairPts,       // RepairPoints
          periodPts,       // PeriodPoints
          (esFilaColiseo && ptsColiseo === null) ? '' : ptsEarned, // PointsEarned (coliseo: VACÍO si no se pudo calcular)
          esFilaColiseo ? '' : progStart,  // ProgressStartOfDay (coliseo: no hay barco)
          esFilaColiseo ? '' : progEnd,    // ProgressEndOfDay (coliseo: no hay barco)
          minGClan,        // Min_G (vigente en CR_Lista > Descensos > Miembro al momento de crear la fila)
          (rankEnd === null || rankEnd === undefined) ? '' : rankEnd, // EndOfDayRank (vacío si el periodo todavía no cerró; 0 = primer puesto; se backfillea solo, ver arriba)
          (progGanado === null || progGanado === undefined) ? '' : progGanado, // ProgressEarned (vacío si el día no cerró)
          (defRest    === null || defRest    === undefined) ? '' : defRest,    // NumOfDefensesRemaining
          (progDef    === null || progDef    === undefined) ? '' : progDef,    // ProgressEarnedFromDefenses
          'Terna',         // Tipo (TANDA 5)
          (logCerradoT && !esFilaColiseo) ? GL_ESTADO_LEIDO : GL_ESTADO_ESTIMADO // Estado (TANDA 13b): Leído = log cerrado tal cual; el resto lo calcula el código
        ]
      });
      existingIds[idLog] = true;
    }
  }

  // TANDA 5 (20-sep-2026, pedido del usuario): CLANES RIVALES de la carrera. [→ Contexto_Base_Web.md §17B083]
  var ternaComp = {};
  for (var tq = 0; tq < CFG.TERNA_TAGS.length; tq++) ternaComp[_tagComparableLogs_(CFG.TERNA_TAGS[tq])] = true;

  var rivales = {};
  var ordenRivales = [];
  for (var ir = 0; ir < CFG.TERNA_TAGS.length; ir++) {
    var dataR = _getClanCache(CFG.TERNA_TAGS[ir]);
    if (!dataR) continue;
    var rrR = dataR.riverrace || {};
    var listaR = rrR.clans || [];
    for (var cr = 0; cr < listaR.length; cr++) {
      var cItem = listaR[cr] || {};
      var tagR = _tagComparableLogs_(cItem.tag);
      if (!tagR || ternaComp[tagR] || rivales[tagR]) continue;
      rivales[tagR] = {
        tag:      String(cItem.tag),
        nombre:   String(cItem.name || '').trim(),
        copas:    Number(cItem.clanScore)    || 0,
        repair:   Number(cItem.repairPoints) || 0,
        periodPts: Number(cItem.periodPoints) || 0,
        fame:     Number(cItem.fame)         || 0,
        rrPeriodIndex: Number(rrR.periodIndex),
        logs:     _logsPorPeriodoDeTag_(rrR, cItem.tag),
        // TANDA 7 (21-sep-2026): estimación de puesto/avance del domingo en [→ Contexto_Base_Web.md §17B084]
        estimacion: ((Number(rrR.periodIndex) % 7) === 6) ? _estimarPuestosDomingoRR_(rrR, CFG.TERNA_TAGS[ir]) : {},
        // TANDA 8 (21-sep-2026): la carrera donde se encontró este rival está
        // en semana de COLISEO -> puesto estimado por fama acumulada.
        coliseo: (String(rrR.periodType || '') === 'colosseum'),
        estimacionColiseo: (String(rrR.periodType || '') === 'colosseum') ? _estimarPuestosColiseoRR_(rrR, CFG.TERNA_TAGS[ir]) : {}
      };
      ordenRivales.push(tagR);
    }
  }

  for (var ro = 0; ro < ordenRivales.length; ro++) {
    var rv = rivales[ordenRivales[ro]];

    // PENDIENTE e) RESUELTO (20-sep-2026, ver docblock de arriba de este [→ Contexto_Base_Web.md §17B085]
    var periodIndexRival  = Number(rv.rrPeriodIndex) || 0;
    var temporadaRival    = (rv.rrPeriodIndex === undefined || rv.rrPeriodIndex === null || isNaN(Number(rv.rrPeriodIndex)))
      ? ctx.temporada : _temporadaDeClan_(ctx, periodIndexRival); // FIX (05-oct-2026): sin periodIndex valido, la de referencia
    var sectionIndexRival = periodIdxToSectionIndex(periodIndexRival);
    var pIdxsGuerraRival  = [
      sectionIndexRival * 7 + 3,
      sectionIndexRival * 7 + 4,
      sectionIndexRival * 7 + 5,
      sectionIndexRival * 7 + 6
    ];
    var pIdxsActivosRival = pIdxsGuerraRival.filter(function(p) { return p <= periodIndexRival; });
    var pIdxDomingoPrevioRival = (sectionIndexRival > 0) ? (sectionIndexRival * 7 - 1) : -1;
    if (pIdxDomingoPrevioRival >= 0) pIdxsActivosRival.unshift(pIdxDomingoPrevioRival);

    for (var rp = 0; rp < pIdxsActivosRival.length; rp++) {
      var pIdxR    = pIdxsActivosRival[rp];
      var sIdxR    = periodIdxToSectionIndex(pIdxR);
      var idLogR   = rv.tag + '│' + temporadaRival + '│' + sIdxR + '│' + pIdxR;
      var logR     = rv.logs[pIdxR] || null;
      var hayLogR  = !!(logR && logR.encontrado);
      var esActualR = (pIdxR === periodIndexRival);
      var esDomPrevR = (pIdxR === pIdxDomingoPrevioRival);

      // Sin log cerrado solo interesa el día en curso; el domingo anterior
      // exige log (igual que en los clanes Terna).
      if (!hayLogR && (esDomPrevR || !esActualR)) continue;

      var ptsR   = hayLogR ? (Number(logR.pointsEarned)       || 0) : 0;
      var iniR   = hayLogR ? (Number(logR.progressStartOfDay) || 0) : 0;
      var finR   = hayLogR ? (Number(logR.progressEndOfDay)   || 0) : Math.min(rv.fame, META_GUERRA_PROGRESO);
      var rankR  = hayLogR ? logR.endOfDayRank : null;
      var ganR   = hayLogR ? logR.progressEarned : null;
      var defR   = hayLogR ? logR.numOfDefensesRemaining : null;
      var bonoR  = hayLogR ? logR.progressEarnedFromDefenses : null;
      var periodPtsR = esActualR ? rv.periodPts : 0;
      var repairR    = esActualR ? rv.repair : 0;

      // Domingo en curso: valores provisionales (ver TANDA 4 arriba) y, desde [→ Contexto_Base_Web.md §17B086]
      if (!hayLogR && esActualR && (pIdxR % 7) === 6 && rv.rrPeriodIndex === pIdxR && !rv.coliseo) {
        ptsR = rv.periodPts;
        var finSabadoRival = _progressEndDiaAnterior_(rv.logs, pIdxR - 1, existingIds, datosLogs, rv.tag, temporadaRival);
        iniR = (finSabadoRival > 0)
          ? Math.min(finSabadoRival, META_GUERRA_PROGRESO)
          : Math.min(rv.fame, META_GUERRA_PROGRESO);
        var estDomRival = rv.estimacion ? rv.estimacion[_tagComparableLogs_(rv.tag)] : null;
        if (estDomRival) {
          rankR = estDomRival.rank;
          ganR  = estDomRival.progressEarned;
          if (estDomRival.cruzo) {
            // Mismo caso que en los clanes Terna: ya cruzó la meta antes de hoy.
            iniR = estDomRival.fame;
            finR = estDomRival.fame;
            defR = 0;
            bonoR = 0;
          }
        }
      }

      // TANDA 8 (21-sep-2026): DÍA DE COLISEO de un rival. Mismo criterio que en [→ Contexto_Base_Web.md §17B087]
      var ptsColiseoR = null;
      var esFilaColiseoR = (!!rv.coliseo && !esDomPrevR);
      if (esFilaColiseoR) {
        iniR = 0;
        finR = 0;
        if (esActualR && rv.rrPeriodIndex === pIdxR) {
          var previosColiseoR = _sumaPuntosColiseoPrevios_(rv.tag, temporadaRival, pIdxR, rv.fame, existingIds, datosLogs);
          if (previosColiseoR !== null) {
            ptsColiseoR = Math.max(0, rv.fame - previosColiseoR);
            ptsR = ptsColiseoR;
          }
          var estColiseoR = rv.estimacionColiseo ? rv.estimacionColiseo[_tagComparableLogs_(rv.tag)] : null;
          if (estColiseoR) rankR = estColiseoR.rank;
        }
      }

      if (existingIds[idLogR] !== undefined) {
        var exR = datosLogs[existingIds[idLogR]];
        if (!exR) continue; // fila creada en esta misma corrida: no se repite
        if (esDomPrevR) {
          var cambioR = false;
          if (_actualizarValorLogSiCambia_(exR, GLC.PTS_EARNED,      ptsR))  cambioR = true;
          if (_actualizarValorLogSiCambia_(exR, GLC.PROG_START,      iniR))  cambioR = true;
          if (_actualizarValorLogSiCambia_(exR, GLC.PROG_END,        finR))  cambioR = true;
          if (_actualizarValorLogSiCambia_(exR, GLC.END_OF_DAY_RANK, rankR)) cambioR = true;
          if (_actualizarValorLogSiCambia_(exR, GLC.PROG_EARNED,     ganR))  cambioR = true;
          if (_actualizarValorLogSiCambia_(exR, GLC.DEF_REMAINING,   defR))  cambioR = true;
          if (_actualizarValorLogSiCambia_(exR, GLC.PROG_DEFENSES,   bonoR)) cambioR = true;
          if (_marcarEstadoLog_(exR, _filaCoincideConLogCerrado_(exR, logR))) cambioR = true; // TANDA 13b
          if (cambioR) huboCambiosExistentesLogs = true;
          continue;
        }
        if (!exR[GLC.TIPO - 1]) { exR[GLC.TIPO - 1] = 'Rival'; huboCambiosExistentesLogs = true; }
        if (rv.nombre && !exR[GLC.CLAN - 1]) { exR[GLC.CLAN - 1] = rv.nombre; huboCambiosExistentesLogs = true; }
        if (rv.copas > 0 && rv.copas !== (Number(exR[GLC.COPAS - 1]) || 0)) { exR[GLC.COPAS - 1] = rv.copas; huboCambiosExistentesLogs = true; }
        if (repairR   > (Number(exR[GLC.REPAIR_PTS - 1]) || 0)) { exR[GLC.REPAIR_PTS - 1] = repairR;   huboCambiosExistentesLogs = true; }
        if (periodPtsR > (Number(exR[GLC.PERIOD_PTS - 1]) || 0)) { exR[GLC.PERIOD_PTS - 1] = periodPtsR; huboCambiosExistentesLogs = true; }
        if (ptsR      > (Number(exR[GLC.PTS_EARNED - 1]) || 0)) { exR[GLC.PTS_EARNED - 1] = ptsR;      huboCambiosExistentesLogs = true; }
        if (iniR      > (Number(exR[GLC.PROG_START - 1]) || 0)) { exR[GLC.PROG_START - 1] = iniR;      huboCambiosExistentesLogs = true; }
        if (finR      > (Number(exR[GLC.PROG_END   - 1]) || 0)) { exR[GLC.PROG_END   - 1] = finR;      huboCambiosExistentesLogs = true; }
        if (_actualizarValorLogSiCambia_(exR, GLC.END_OF_DAY_RANK, rankR)) huboCambiosExistentesLogs = true;
        if (_actualizarValorLogSiCambia_(exR, GLC.PROG_EARNED,     ganR))  huboCambiosExistentesLogs = true;
        if (_actualizarValorLogSiCambia_(exR, GLC.DEF_REMAINING,   defR))  huboCambiosExistentesLogs = true;
        if (_actualizarValorLogSiCambia_(exR, GLC.PROG_DEFENSES,   bonoR)) huboCambiosExistentesLogs = true;
        // TANDA 13b: Estado (mismo criterio que en los clanes Terna).
        if (_marcarEstadoLog_(exR, hayLogR && !esFilaColiseoR && _filaCoincideConLogCerrado_(exR, logR))) huboCambiosExistentesLogs = true;
        continue;
      }

      // FILA NUEVA de un rival (las columnas que el JSON no trae van vacías)
      nuevasFilas.push({
        id:  idLogR,
        row: [
          null,                                   // N°
          _fechaPrimeraConsultaRR_(temporadaRival, pIdxR, null, now), // Fecha = PRIMERA consulta del periodIndex (la más temprana de los Terna; 12-oct-2026)
          temporadaRival,                         // Temporada
          sIdxR + 1,                              // Semana
          periodIdxToLetra(pIdxR),                // Día
          calcDiaGuerraIdx(ctx.ref, temporadaRival, pIdxR), // DiaGuerra (Date)
          rv.nombre,                              // Clan
          rv.tag,                                 // Tag (del clan)
          pIdxR,                                  // PeriodIndex
          '',                                     // Líder (no viene)
          '',                                     // Tag(L) (no viene)
          '',                                     // Donaciones (no viene)
          '',                                     // Trofeos (no viene)
          rv.copas || '',                         // Copas (clanScore)
          '',                                     // Miembros (no viene)
          esActualR ? repairR : '',               // RepairPoints (solo día en curso)
          esActualR ? periodPtsR : '',            // PeriodPoints (solo día en curso)
          (esFilaColiseoR && ptsColiseoR === null) ? '' : ptsR, // PointsEarned (coliseo: VACÍO si no se pudo calcular)
          esFilaColiseoR ? '' : iniR,             // ProgressStartOfDay (coliseo: no hay barco)
          esFilaColiseoR ? '' : finR,             // ProgressEndOfDay (coliseo: no hay barco)
          '',                                     // Min_G (no aplica)
          (rankR === null || rankR === undefined) ? '' : rankR,
          (ganR  === null || ganR  === undefined) ? '' : ganR,
          (defR  === null || defR  === undefined) ? '' : defR,
          (bonoR === null || bonoR === undefined) ? '' : bonoR,
          'Rival',                                // Tipo
          (hayLogR && !esFilaColiseoR) ? GL_ESTADO_LEIDO : GL_ESTADO_ESTIMADO // Estado (TANDA 13b)
        ]
      });
      existingIds[idLogR] = true;
    }
  }

  // Volcar TODOS los cambios de filas existentes en UNA sola escritura.
  if (huboCambiosExistentesLogs && datosLogs.length > 0) {
    sh.getRange(2, 1, datosLogs.length, GUERRA_LOGS_TOTAL_COLS).setValues(datosLogs);
    // TANDA 1: mismo formato numérico que ya tienen las filas nuevas en las 3
    // columnas de avance (las filas anteriores a este cambio las tenían vacías).
    sh.getRange(2, GLC.PROG_EARNED, datosLogs.length, GLC.PROG_DEFENSES - GLC.PROG_EARNED + 1).setNumberFormat('#,##0');
  }

  // Ordenar por periodIndex ASC
  nuevasFilas.sort(function(a, b) {
    return (a.row[GLC.PERIOD_IDX - 1] || 0) - (b.row[GLC.PERIOD_IDX - 1] || 0);
  });

  if (nuevasFilas.length > 0) {
    var startRow = sh.getLastRow() < 1 ? 2 : sh.getLastRow() + 1;

    var batchValues = nuevasFilas.map(function(f, idx) {
      f.row[0] = startRow + idx - 1;
      // TANDA 13a (21-sep-2026): las filas nuevas se arman con las columnas [→ Contexto_Base_Web.md §17B088]
      while (f.row.length < GUERRA_LOGS_TOTAL_COLS) f.row.push('');
      return f.row.map(function(v) {
        if (v instanceof Date) return '';
        return v;
      });
    });

    sh.getRange(startRow, 1, batchValues.length, GUERRA_LOGS_TOTAL_COLS).setValues(batchValues);

    for (var idx = 0; idx < nuevasFilas.length; idx++) {
      var row  = startRow + idx;
      var fRow = nuevasFilas[idx].row;
      _setDateCell(sh, row, GLC.FECHA,      fRow[GLC.FECHA - 1],      'dddd, d "de" mmmm"," yyyy h:mm:ss AM/PM');
      _setDateCell(sh, row, GLC.DIA_GUERRA, fRow[GLC.DIA_GUERRA - 1], 'dd/mm/yyyy');
      for (var c = GLC.DONACIONES; c <= GLC.PROG_DEFENSES; c++) {
        _trySetFmt(sh, row, c, '#,##0');
      }
    }
  }

  _aplicarFmtCondicionalGuerraLogs(sh);
  Logger.log('[GuerraLogs] completado. Nuevas filas creadas: ' + nuevasFilas.length);
}

// WEB: LOG DE GUERRA POR CLAN (vista (a) de la Fase 13 del plan de cambios [→ Contexto_Base_Web.md §17B089]

/**
 * _webGuerraLog(tag) [→ Contexto_Base_Web.md §17B090]
 */
/**
 * _puestoWebDesdeFila_(fila) [→ Contexto_Base_Web.md §17B091]
 */
function _puestoWebDesdeFila_(fila) {
  var v = fila[GLC.END_OF_DAY_RANK - 1];
  if (v === '' || v === null || v === undefined) return 0;
  var n = _numDesdeCeldaLogs_(v); // TANDA 12: tolera "31,200" del respaldo CSV
  if (!isFinite(n) || n < 0) return 0;
  if (n === 0 && !(_numDesdeCeldaLogs_(fila[GLC.PTS_EARNED - 1]) > 0)) return 0;
  return n + 1;
}

/**
 * _puestoEstimadoWebDesdeFila_(fila, esColiseoFila) [→ Contexto_Base_Web.md §17B092]
 */
function _puestoEstimadoWebDesdeFila_(fila, esColiseoFila) {
  var estado = String(fila[GLC.ESTADO - 1] || '').trim();
  if (estado === GL_ESTADO_LEIDO) return false;
  if (estado === GL_ESTADO_ESTIMADO) return true;
  return !!esColiseoFila;
}

/**
 * _tagComparableLogs_(t) [→ Contexto_Base_Web.md §17B093]
 */
function _tagComparableLogs_(t) {
  return String(t || '').replace('#', '').trim().toUpperCase();
}

/**
 * _numDesdeCeldaLogs_(v) [→ Contexto_Base_Web.md §17B094]
 */
function _numDesdeCeldaLogs_(v) {
  if (typeof v === 'number') return v;
  if (v === '' || v === null || v === undefined) return NaN;
  var t = String(v).replace(/\u00a0/g, ' ').trim();
  if (t === '') return NaN;
  if (/^-?\d{1,3}([.,' ]\d{3})+$/.test(t)) t = t.replace(/[.,' ]/g, '');
  return Number(t);
}

function _webGuerraLog(tag) {
  var ss = _getSs();
  var lectura = _obtenerFilasConFallbackCSV(
    ss, CFG.SHEETS.GUERRA_LOGS, 'Backup_Guerra_Logs.csv', GUERRA_LOGS_TOTAL_COLS, 1
  );
  var data = lectura.filas;

  // FIX (20-sep-2026, reporte del usuario: webGuerraLog devolvía los 4 clanes [→ Contexto_Base_Web.md §17B095]
  var tagNorm = _tagComparableLogs_(tag);
  var idxTerna = -1;
  for (var q = 0; q < CFG.TERNA_TAGS.length; q++) {
    if (_tagComparableLogs_(CFG.TERNA_TAGS[q]) === tagNorm) { idxTerna = q; break; }
  }
  var tagsAPedir = (tagNorm && idxTerna >= 0)
    ? [CFG.TERNA_TAGS[idxTerna]]
    : (tagNorm ? [] : CFG.TERNA_TAGS); // tag inválido -> []; sin tag -> todos

  var clanes = [];
  for (var t = 0; t < tagsAPedir.length; t++) {
    clanes.push(_webGuerraLogUnClan(tagsAPedir[t], data));
  }
  return { clanes: clanes };
}

/**
 * _webGuerraLogUnClan(tagNorm, data) [→ Contexto_Base_Web.md §17B096]
 */
function _webGuerraLogUnClan(tagNorm, data) {
  var salida = { clan: '', tag: tagNorm, semanas: [] };

  // Última fila (mayor PeriodIndex) por Temporada+Semana, solo del clan pedido.
  var porSemana = {}; // 'temporada|semana' -> { ...datos de la fila elegida }
  for (var i = 0; i < data.length; i++) {
    var fila = data[i];
    if (_tagComparableLogs_(fila[GLC.TAG - 1]) !== _tagComparableLogs_(tagNorm)) continue;

    var temporadaFila = Number(fila[GLC.TEMPORADA  - 1]) || 0;
    var semanaFila     = Number(fila[GLC.SEMANA     - 1]) || 0;
    var periodIdxFila  = Number(fila[GLC.PERIOD_IDX - 1]) || 0;
    if (!temporadaFila || !semanaFila) continue;

    var clave = temporadaFila + '|' + semanaFila;
    if (!porSemana[clave] || periodIdxFila > porSemana[clave].periodIndex) {
      // TANDA 11 (21-sep-2026): en la semana de COLISEO no hay barco (el "Boat" [→ Contexto_Base_Web.md §17B097]
      var esColiseoFila = _esPeriodoDeColiseo_(temporadaFila, periodIdxFila);
      var rankFila = _puestoWebDesdeFila_(fila); // TANDA 3: 1..5 (0 = sin dato), ver _puestoWebDesdeFila_()
      porSemana[clave] = {
        temporada:   temporadaFila,
        semana:      semanaFila,
        periodIndex: periodIdxFila,
        boat:        esColiseoFila ? 0 : (_numDesdeCeldaLogs_(fila[GLC.PROG_END - 1]) || 0), // TANDA 12: tolera "10,000" del CSV
        trophy:      _numDesdeCeldaLogs_(fila[GLC.TROFEOS          - 1]) || 0,
        rank:        rankFila,
        coliseo:     esColiseoFila,
        // TANDA 13c (21-sep-2026): desde la columna Estado (antes: solo coliseo). [→ Contexto_Base_Web.md §17B098]
        rankEstimado: rankFila > 0 && _puestoEstimadoWebDesdeFila_(fila, esColiseoFila),
        clanNombre:  String(fila[GLC.CLAN - 1] || '').trim()
      };
    }
  }

  var lista = Object.keys(porSemana).map(function (k) { return porSemana[k]; });

  // Orden ASCENDENTE (cronológico) primero, para poder calcular el delta
  // de Trophy contra la semana inmediatamente anterior.
  lista.sort(function (a, b) {
    if (a.temporada !== b.temporada) return a.temporada - b.temporada;
    return a.semana - b.semana;
  });

  var trophyAnterior = null;
  var nombreClan = '';
  for (var s = 0; s < lista.length; s++) {
    var item = lista[s];
    item.trophyDelta = (trophyAnterior === null) ? 0 : (item.trophy - trophyAnterior);
    trophyAnterior = item.trophy;
    if (item.clanNombre) nombreClan = item.clanNombre; // el nombre más reciente gana
    delete item.clanNombre;
  }

  // Se devuelve DESCENDENTE (más reciente primero) -- se invierte recién
  // acá, DESPUÉS de calcular los deltas en orden cronológico.
  lista.reverse();

  salida.clan    = nombreClan;
  salida.semanas = lista;
  return salida;
}

// WEB: HISTORIAL DE COPAS DEL CLAN (gráfica «Copas» de clan.html) [→ Contexto_Base_Web.md §PF062]

/**
 * _webClanCopas(tag) — 12-oct-2026 (pedido usuario: gráfica de copas en clan.html).
 * Copas del clan por día, desde Guerra_Logs (GLC.COPAS, una fila por día y por clan; fallback Backup_Guerra_Logs.csv).
 * tag obligatorio y de un clan Terna; cualquier otro devuelve puntos: [] (no se expone ningún clan rival).
 * Un punto por día de guerra: si hubiera más de una fila el mismo día se queda la de mayor PeriodIndex.
 * Respuesta: { clan, tag, puntos: [{ fecha: 'dd/MM/yyyy', copas, periodIndex, temporada }] } en orden cronológico.
 */
function _webClanCopas(tag) {
  var tagNorm = _tagComparableLogs_(tag);
  var tagOficial = '';
  for (var q = 0; q < CFG.TERNA_TAGS.length; q++) {
    if (_tagComparableLogs_(CFG.TERNA_TAGS[q]) === tagNorm) { tagOficial = CFG.TERNA_TAGS[q]; break; }
  }
  var salida = { clan: '', tag: tagOficial || String(tag || ''), puntos: [] };
  if (!tagOficial) return salida;

  var ss = _getSs();
  var tz = Session.getScriptTimeZone() || 'America/Lima';
  var lectura = _obtenerFilasConFallbackCSV(
    ss, CFG.SHEETS.GUERRA_LOGS, 'Backup_Guerra_Logs.csv', GUERRA_LOGS_TOTAL_COLS, 1
  );
  var data = lectura.filas;
  var porDia = {}; // 'dd/MM/yyyy' -> punto
  for (var i = 0; i < data.length; i++) {
    var fila = data[i];
    if (_tagComparableLogs_(fila[GLC.TAG - 1]) !== tagNorm) continue;
    var copas = _numDesdeCeldaLogs_(fila[GLC.COPAS - 1]);
    if (!(copas > 0)) continue; // vacío o 0 = sin dato
    var dg = fila[GLC.DIA_GUERRA - 1];
    var fecha = '';
    if (dg instanceof Date && !isNaN(dg.getTime())) fecha = Utilities.formatDate(dg, tz, 'dd/MM/yyyy');
    else if (/^\d{2}\/\d{2}\/\d{4}$/.test(String(dg || '').trim())) fecha = String(dg).trim();
    if (!fecha) {
      var fh = fila[GLC.FECHA - 1];
      if (fh instanceof Date && !isNaN(fh.getTime())) fecha = Utilities.formatDate(fh, tz, 'dd/MM/yyyy');
    }
    if (!fecha) continue;
    var periodIdx = Number(fila[GLC.PERIOD_IDX - 1]) || 0;
    if (!porDia[fecha] || periodIdx > porDia[fecha].periodIndex) {
      porDia[fecha] = { fecha: fecha, copas: copas, periodIndex: periodIdx, temporada: Number(fila[GLC.TEMPORADA - 1]) || 0 };
    }
    var nombre = String(fila[GLC.CLAN - 1] || '').trim();
    if (nombre) salida.clan = nombre;
  }
  var lista = Object.keys(porDia).map(function (k) { return porDia[k]; });
  lista.sort(function (a, b) { return (a.temporada - b.temporada) || (a.periodIndex - b.periodIndex); });
  salida.puntos = lista;
  return salida;
}

// WEB: PUESTOS POR DÍA DE GUERRA (botones Jue-Dom de guerra.html) [→ Contexto_Base_Web.md §17B099]

/**
 * _webGuerraPuestosDia() [→ Contexto_Base_Web.md §17B100]
 */
function _webGuerraPuestosDia() {
  // Caché compartida de 120 s (mismo criterio que _webPronosticoGuerra()): Guerra_Logs [→ Contexto_Base_Web.md §17B101]
  return _webCacheado('web_guerra_puestos_dia_v5', 120, _webGuerraPuestosDiaCalcular_);
}

/**
 * _webGuerraPuestosDiaCalcular_() [→ Contexto_Base_Web.md §17B102]
 */
function _webGuerraPuestosDiaCalcular_() {
  var ss = _getSs();
  var lectura = _obtenerFilasConFallbackCSV(
    ss, CFG.SHEETS.GUERRA_LOGS, 'Backup_Guerra_Logs.csv', GUERRA_LOGS_TOTAL_COLS, 1
  );
  var data = lectura.filas;
  var tags = CFG.TERNA_TAGS;
  // FIX (20-sep-2026): mismo error que _webGuerraLog() -- cleanTag() quita el [→ Contexto_Base_Web.md §17B103]
  var tagsComp = tags.map(_tagComparableLogs_);

  // 1) Semana más reciente con filas de algún clan Terna.
  var mejorTemp = 0, mejorSem = 0;
  for (var i = 0; i < data.length; i++) {
    var f = data[i];
    if (tagsComp.indexOf(_tagComparableLogs_(f[GLC.TAG - 1])) < 0) continue;
    var t = Number(f[GLC.TEMPORADA - 1]) || 0;
    var s = Number(f[GLC.SEMANA    - 1]) || 0;
    if (!t || !s) continue;
    if (t > mejorTemp || (t === mejorTemp && s > mejorSem)) { mejorTemp = t; mejorSem = s; }
  }
  if (!mejorTemp) return { temporada: 0, semana: 0, coliseo: false, dias: [] };

  // 2) Esqueleto de 4 días x clanes (rank 0 = sin dato / día sin cerrar; con dato, 1..5).
  var baseP = (mejorSem - 1) * 7 + 3; // PeriodIndex del Jueves (Semana = sectionIndex + 1)
  // TANDA 11 (21-sep-2026): en la semana de COLISEO los puestos son ESTIMADOS por
  // fama acumulada (la API no entrega logs diarios). Se marca la semana y cada día.
  var esColiseoSem = _esPeriodoDeColiseo_(mejorTemp, baseP);
  var dias = [];
  for (var off = 0; off < 4; off++) {
    dias.push({
      letra: periodIdxToLetra(baseP + off),
      periodIndex: baseP + off,
      fecha: null,
      estimado: false, // TANDA 13c: se completa abajo con el Estado de las filas (antes: esColiseoSem)
      clanes: tags.map(function (tg) { return { clan: '', tag: tg, rank: 0, estimado: false }; })
    });
  }

  // 3) Llenar con las filas de esa semana.
  for (var j = 0; j < data.length; j++) {
    var fila = data[j];
    if ((Number(fila[GLC.TEMPORADA - 1]) || 0) !== mejorTemp) continue;
    if ((Number(fila[GLC.SEMANA    - 1]) || 0) !== mejorSem)  continue;
    var iClan = tagsComp.indexOf(_tagComparableLogs_(fila[GLC.TAG - 1]));
    if (iClan < 0) continue;
    var o = (Number(fila[GLC.PERIOD_IDX - 1]) || 0) - baseP;
    if (o < 0 || o > 3) continue;

    var celda = dias[o].clanes[iClan];
    var nombre = String(fila[GLC.CLAN - 1] || '').trim();
    if (nombre) celda.clan = nombre;
    // TANDA 3 (20-sep-2026): la hoja guarda 0..4 (0 = primer puesto); la web
    // espera 1..5 con 0 = "sin dato" -> _puestoWebDesdeFila_().
    var rk = _puestoWebDesdeFila_(fila);
    if (rk > 0) {
      celda.rank = rk;
      // TANDA 13c (21-sep-2026): ¿ese puesto es estimado? Sale de la columna [→ Contexto_Base_Web.md §17B104]
      celda.estimado = _puestoEstimadoWebDesdeFila_(fila, esColiseoSem);
      if (celda.estimado) dias[o].estimado = true;
    }

    if (!dias[o].fecha) {
      var fg = fila[GLC.DIA_GUERRA - 1];
      if (fg instanceof Date && !isNaN(fg.getTime())) {
        dias[o].fecha = fg.toISOString();
      } else {
        var m = String(fg || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/); // dd/mm/yyyy (respaldo CSV)
        if (m) {
          var fd = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
          if (!isNaN(fd.getTime())) dias[o].fecha = fd.toISOString();
        }
      }
    }
  }

  return { temporada: mejorTemp, semana: mejorSem, coliseo: esColiseoSem, dias: dias };
}

// PENDIENTES SHEET [→ Contexto_Base_Web.md §17B105]

/**
 * Actualiza la hoja Pendientes con los jugadores que tienen ataques sin realizar. [→ Contexto_Base_Web.md §17B106]
 */
// FIX (02-oct-2026): true si updatePendientesSheet() abortó por falta de datos de la API.
var PENDIENTES_ABORTADO_POR_API = false;

function updatePendientesSheet() {
  var ss  = _getSs();
  var sh  = ss.getSheetByName(CFG.SHEETS.PENDIENTES);
  if (!sh) { Logger.log('[Pendientes] Hoja no encontrada'); return; }

  // Garantizar que el cache esté disponible (Pendientes no usa /players)
  if (!CACHE_CLAN_DATA) {
    Logger.log('[Pendientes] Cache vacío, ejecutando _fetchClanesBasico()...');
    capturarApiClanes_(CFG.CLANES_PROGRESO_MAX_EDAD_MS, 'GuerraSheet');
  }

  var ctx = _getCtx();

  // FIX (02-oct-2026): si en día de guerra falta /currentriverrace de algún [→ Contexto_Base_Web.md §17B107]
  PENDIENTES_ABORTADO_POR_API = false;
  try { PropertiesService.getScriptProperties().deleteProperty('PENDIENTES_ABORT_TS'); } catch (eP) {}
  if (ctx.esDiaGuerra) {
    var ternaSinDatos = [];
    for (var iT = 0; iT < CFG.TERNA_TAGS.length; iT++) {
      var cdT = _getClanCache(CFG.TERNA_TAGS[iT]);
      if (!cdT || !cdT.riverrace) ternaSinDatos.push(CFG.TERNA_TAGS[iT]);
    }
    if (ternaSinDatos.length > 0) {
      PENDIENTES_ABORTADO_POR_API = true;
      // Persistido: Mensajes puede correr en otra tanda (otra ejecución).
      try { PropertiesService.getScriptProperties().setProperty('PENDIENTES_ABORT_TS', String(Date.now())); } catch (eP2) {}
      Logger.log('[Pendientes] ABORT: sin datos de guerra (API) para ' + ternaSinDatos.join(', ') +
                 '. Se conserva la hoja anterior; no se generan mensajes en esta corrida.');
      return;
    }
  }

  // Limpiar datos previos (10 columnas: N°|Tag|Nombre|Nom_Multi|Préstamo| [→ Contexto_Base_Web.md §17B108]
  var lastRow = sh.getLastRow();
  if (lastRow >= 2) sh.getRange(2, 1, lastRow - 1, 10).clearContent();

  if (!ctx.esDiaGuerra) {
    // FIX (18-ago-2026, pedido usuario): combinar B2:C2 en día de [→ Contexto_Base_Web.md §17B109]
    try {
      var celdaAviso = sh.getRange(2, 2, 1, 2);
      if (!celdaAviso.isPartOfMerge()) celdaAviso.merge();
    } catch (e) {
      Logger.log('[Pendientes] Error al combinar B2:C2: ' + e.message);
    }
    sh.getRange(2, 2).setValue('No es día de guerra');
    Logger.log('[Pendientes] No es día de guerra, hoja limpia.');
    // Las columnas Nom_Multi (D) y Préstamo (E) deben permanecer ocultas
    // también cuando la hoja se limpia por no ser día de guerra.
    try { sh.hideColumns(4); } catch (e) {}
    try { sh.hideColumns(5); } catch (e) {}
    // FIX (pedido usuario): igual que en las otras 2 salidas de esta [→ Contexto_Base_Web.md §17B110]
    _finalizarFormatoPendientes(sh, lastRow, 0);
    return;
  }

  Logger.log('[Pendientes] Calculando pendientes...');

  // FIX (18-ago-2026, pedido usuario): deshacer la combinación de B2:C2 [→ Contexto_Base_Web.md §17B111]
  try {
    var celdaAviso2 = sh.getRange(2, 2, 1, 2);
    if (celdaAviso2.isPartOfMerge()) celdaAviso2.breakApart();
  } catch (e) {
    Logger.log('[Pendientes] Error al deshacer combinación B2:C2: ' + e.message);
  }

  // Leer celulares, Nom_Multi y Préstamo desde Directorio para generar [→ Contexto_Base_Web.md §17B112]
  var shDir  = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  var dirMap = {};
  if (shDir && shDir.getLastRow() >= 2) {
    var dirData = shDir.getRange(2, 1, shDir.getLastRow() - 1, DIR_SHEET_COLS).getValues();
    for (var i = 0; i < dirData.length; i++) {
      var tg = String(dirData[i][IC.TAG - 1] || '').trim();
      if (tg) {
        dirMap[tg] = {
          prefijo:  String(dirData[i][IC.PREFIJO   - 1] || CFG.PREFIJO_DEFAULT),
          celular:  String(dirData[i][IC.CELULAR   - 1] || ''),
          nomMulti: String(dirData[i][IC.NOM_MULTI - 1] || ''),
          prestamo: String(dirData[i][IC.PRESTAMO  - 1] || '')
        };
      }
    }
  }

  // Obtener ataques registrados en la hoja Guerra (para usar el mayor)
  var guerraAtaqMap = _getAtaquesHoyDeGuerra(ctx);
  // Obtener ataques del cache API
  var cacheAtaqMap  = _getAtaquesHoyCache();
  var pendientes    = [];

  for (var i = 0; i < CFG.TERNA_TAGS.length; i++) {
    var clanTag  = CFG.TERNA_TAGS[i];
    var clanData = _getClanCache(clanTag);
    if (!clanData || !clanData.riverrace || !clanData.riverrace.clan) continue;

    var participants = clanData.riverrace.clan.participants || [];
    var members      = clanData.members || [];

    // FIX (11-sep-2026, pedido usuario: "ha omitido varias cuentas que no [→ Contexto_Base_Web.md §17B113]
    var participantsPorTag = {};
    for (var pk = 0; pk < participants.length; pk++) {
      participantsPorTag[participants[pk].tag] = participants[pk];
    }

    var clanNombre = (clanData.info && clanData.info.name) ? clanData.info.name : clanTag;
    var clanOrden  = CFG.TERNA_TAGS.indexOf(clanTag);

    for (var j = 0; j < members.length; j++) {
      var mem = members[j];
      var tagMiembro = mem.tag;
      if (!tagMiembro) continue;

      // part queda como {} (no undefined) si el miembro todavía no está en [→ Contexto_Base_Web.md §17B114]
      var part = participantsPorTag[tagMiembro] || {};

      // Usar el MAYOR entre: cache API, hoja Guerra
      var ataqCache  = cacheAtaqMap[tagMiembro]  || 0;
      var ataqGuerra = guerraAtaqMap[tagMiembro] || 0;
      var ataqUsados = Math.max(ataqCache, ataqGuerra);
      var faltantes  = 4 - ataqUsados;

      if (faltantes > 0) {
        var dirInfo  = dirMap[tagMiembro] || { prefijo: CFG.PREFIJO_DEFAULT, celular: '', nomMulti: '' };
        var pref     = String(dirInfo.prefijo || CFG.PREFIJO_DEFAULT).replace(/\D/g, '');
        var cel      = String(dirInfo.celular  || '').replace(/\D/g, '');

        pendientes.push({
          tag:        tagMiembro,
          nombre:     mem.name || part.name || '',
          nomMulti:   dirInfo.nomMulti || '',
          prestamo:   dirInfo.prestamo || '',
          clan:       clanNombre,
          clanOrden:  clanOrden,
          faltantes:  faltantes,
          pref:       pref,
          cel:        cel
        });
      }
    }
  }

  // Ordenar: 1) Clan (por orden en CFG.TERNA_TAGS), 2) Faltantes DESC, 3) Nombre ASC
  pendientes.sort(function(a, b) {
    if (a.clanOrden !== b.clanOrden) return a.clanOrden - b.clanOrden;
    if (b.faltantes !== a.faltantes) return b.faltantes - a.faltantes;
    return String(a.nombre).localeCompare(String(b.nombre));
  });

  if (pendientes.length === 0) {
    Logger.log('[Pendientes] Sin jugadores con ataques pendientes.');
    // FIX (pedido usuario): ver _finalizarFormatoPendientes() más abajo — [→ Contexto_Base_Web.md §17B115]
    _finalizarFormatoPendientes(sh, lastRow, 0);
    return;
  }

  // Escribir en batch (10 columnas: N°|Tag|Nombre|Nom_Multi|Préstamo|Clan|
  // Faltantes|Celular|WSP|RoyaleAPI)
  var rows = pendientes.map(function(p, idx) {
    return [idx + 1, p.tag, p.nombre, p.nomMulti, p.prestamo, p.clan, p.faltantes, p.cel, '', ''];
  });

  sh.getRange(2, 1, rows.length, 10).setValues(rows);

  // Aplicar links de WhatsApp (celda por celda, RichTextValue) — col I = 9 [→ Contexto_Base_Web.md §17B116]
  for (var i = 0; i < pendientes.length; i++) {
    var p = pendientes[i];
    if (p.cel) {
      sh.getRange(i + 2, 9).setRichTextValue(
        makeLink('WhatsApp', 'https://wa.me/' + p.pref + p.cel)
      );
    }
  }

  // Aplicar links de RoyaleAPI (celda por celda, RichTextValue) — col J = 10. [→ Contexto_Base_Web.md §17B117]
  var royaleVals = pendientes.map(function(p) {
    return [makeLink('Link', 'https://royaleapi.com/player/' + cleanTag(p.tag) + '/')];
  });
  sh.getRange(2, 10, pendientes.length, 1).setRichTextValues(royaleVals);

  // Formato condicional por Faltantes (col G = columna 7, desplazada una [→ Contexto_Base_Web.md §17B118]
  var dataRange = sh.getRange(2, 1, rows.length, 10);
  var colFalt   = colLetter(7);
  var rules = [
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$' + colFalt + '2=4')
      .setBackground(CFG.COLORES.PEND_4_BG)
      .setRanges([dataRange]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($' + colFalt + '2>=2,$' + colFalt + '2<=3)')
      .setBackground(CFG.COLORES.PEND_3_BG)
      .setRanges([dataRange]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$' + colFalt + '2=1')
      .setBackground(CFG.COLORES.PEND_1_BG)
      .setRanges([dataRange]).build(),
  ];
  _tryCondFmt(sh, rules);

  applyBorderCenter(dataRange);

  // FIX (02-ago-2026): mismo caso que _escribirDirectorio()/updateGuerraSheet() [→ Contexto_Base_Web.md §17B119]
  _limpiarLinksAccidentalesEnHoja(sh);

  // Las columnas Nom_Multi (D) y Préstamo (E) se mantienen ocultas por [→ Contexto_Base_Web.md §17B120]
  try { sh.hideColumns(4); } catch (e) {}
  try { sh.hideColumns(5); } catch (e) {}

  // FIX (pedido usuario: "quedan filas vacías con bordes coloreados... la [→ Contexto_Base_Web.md §17B121]
  _finalizarFormatoPendientes(sh, lastRow, pendientes.length);

  Logger.log('[Pendientes] Actualizado. Jugadores con pendientes: ' + pendientes.length);
}

// PENDIENTE (19-sep-2026, pedido del usuario): REVISAR LA HOJA GUERRA_LOGS. [→ Contexto_Base_Web.md §17B122]

// Temporadas a recalcular (números). Vacío = todas las que tengan JSON en Drive.
var RECALC_GUERRA_LOGS_TEMPORADAS = [];

/**
 * recalcularGuerraLogsDesdeJSON() [→ Contexto_Base_Web.md §17B123]
 */
function recalcularGuerraLogsDesdeJSON() {
  var t0 = Date.now(), LIMITE_MS = 270000;
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.GUERRA_LOGS);
  if (!sh || sh.getLastRow() < 2) { Logger.log('[RecalcGuerraLogs] Guerra_Logs vacía o inexistente.'); return; }
  _asegurarColumnasGuerraLogs_(sh); // TANDA 1: columnas físicas 23-25, encabezados y notas

  var n = sh.getLastRow() - 1;
  var datos = sh.getRange(2, 1, n, GUERRA_LOGS_TOTAL_COLS).getValues();
  var ids = _mapaIdsGuerraLogs(datos);
  var props = PropertiesService.getScriptProperties();
  // CAMBIO (26-sep-2026, esquema NUEVO endpoint -> clan, ver AVISOS ABIERTOS [→ Contexto_Base_Web.md §17B124]
  var claves = Object.keys(_SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_);
  var desde = Number(props.getProperty('RECALC_GUERRA_LOGS_CLAN_IDX')) || 0;
  var cambios = 0, sinFila = 0, archivos = 0, completo = true;
  var estadoCambios = 0; // TANDA 13b: filas cuyo Estado cambió

  for (var c = desde; c < claves.length; c++) {
    if (Date.now() - t0 > LIMITE_MS) { completo = false; break; }
    var porId = {};
    try {
      var carpeta = DriveApp.getFolderById(_SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_[claves[c]]);
      // Último archivo (mayor P.I) de cada temporada+semana.
      var elegidos = {};
      var it = _archivosConSubcarpetas_(carpeta);
      while (it.hasNext()) {
        var f = it.next();
        var m = /^T-(\d+)\s+S-(\d+)\s+P\.I-(\d+)(?:-[LMXJVSD])?\s.*- currentriverrace\.json$/i.exec(f.getName());
        if (!m) continue;
        var temp = Number(m[1]), pI = Number(m[3]);
        if (RECALC_GUERRA_LOGS_TEMPORADAS.length && RECALC_GUERRA_LOGS_TEMPORADAS.indexOf(temp) < 0) continue;
        var kSem = temp + '|' + Number(m[2]);
        // TANDA 4 (20-sep-2026): con el mismo P.I hay varias capturas (una por [→ Contexto_Base_Web.md §17B125]
        var mFh = /(\d{2})-(\d{2})-(\d{4})\s+(\d{2})\.(\d{2})/.exec(f.getName());
        var claveHora = mFh ? Number(mFh[3] + mFh[2] + mFh[1] + mFh[4] + mFh[5]) : 0;
        if (!elegidos[kSem] || pI > elegidos[kSem].p || (pI === elegidos[kSem].p && claveHora > elegidos[kSem].h)) {
          elegidos[kSem] = { f: f, p: pI, temp: temp, h: claveHora };
        }
      }
      for (var kS in elegidos) {
        if (Date.now() - t0 > LIMITE_MS) { completo = false; break; }
        var obj = JSON.parse(elegidos[kS].f.getBlob().getDataAsString('UTF-8'));
        archivos++;
        var miTag = String((obj.clan && obj.clan.tag) || obj.tag || '').toUpperCase();
        if (!miTag) continue;
        var pref = miTag + '│' + elegidos[kS].temp + '│';
        var reg = function (pIdx) {
          var id = pref + periodIdxToSectionIndex(pIdx) + '│' + pIdx;
          // TANDA 13b: `cierre` = lo que trae el log CERRADO (sin los valores [→ Contexto_Base_Web.md §17B126]
          return porId[id] || (porId[id] = { pts: 0, ini: 0, fin: 0, rank: null, ganado: null, defRest: null, defBono: null, cierre: null, coliseo: false });
        };
        var logs = obj.periodLogs || [];
        for (var l = 0; l < logs.length; l++) {
          var pl = Number(logs[l].periodIndex);
          if (!isFinite(pl) || !esDiaGuerraIdx(pl)) continue;
          var items = logs[l].items || [];
          for (var k = 0; k < items.length; k++) {
            var itm = items[k];
            if (!itm || !itm.clan || String(itm.clan.tag || '').toUpperCase() !== miTag) continue;
            var r = reg(pl);
            var cz = r.cierre || (r.cierre = { encontrado: true, pointsEarned: 0, progressStartOfDay: 0, progressEndOfDay: 0 });
            cz.pointsEarned       = Math.max(cz.pointsEarned,       Number(itm.pointsEarned)       || 0);
            cz.progressStartOfDay = Math.max(cz.progressStartOfDay, Number(itm.progressStartOfDay) || 0);
            cz.progressEndOfDay   = Math.max(cz.progressEndOfDay,   Number(itm.progressEndOfDay)   || 0);
            r.coliseo = _esPeriodoDeColiseo_(elegidos[kS].temp, pl);
            r.pts  = Math.max(r.pts,  Number(itm.pointsEarned)       || 0);
            r.ini  = Math.max(r.ini,  Number(itm.progressStartOfDay) || 0);
            r.fin  = Math.max(r.fin,  Number(itm.progressEndOfDay)   || 0);
            // TANDA 2 (20-sep-2026): null = el JSON no trae el campo; 0 = primer puesto.
            if (itm.endOfDayRank !== undefined && itm.endOfDayRank !== null) r.rank = Number(itm.endOfDayRank) || 0;
            // TANDA 1: null = el JSON no trae el campo (no se toca la celda).
            if (itm.progressEarned             !== undefined && itm.progressEarned             !== null) r.ganado  = Number(itm.progressEarned)             || 0;
            if (itm.numOfDefensesRemaining     !== undefined && itm.numOfDefensesRemaining     !== null) r.defRest = Number(itm.numOfDefensesRemaining)     || 0;
            if (itm.progressEarnedFromDefenses !== undefined && itm.progressEarnedFromDefenses !== null) r.defBono = Number(itm.progressEarnedFromDefenses) || 0;
            break;
          }
        }
        var pProp = Number(obj.periodIndex);
        // TANDA 8 (21-sep-2026): en un JSON de COLISEO clan.fame es fama
        // acumulada (100000+), no un avance de barco: no se vuelca aquí.
        if (isFinite(pProp) && esDiaGuerraIdx(pProp) && obj.clan && String(obj.periodType || '') !== 'colosseum') {
          var rp = reg(pProp);
          rp.fin = Math.max(rp.fin, Number(obj.clan.fame) || 0); // día en curso: fame acumulado
          // TANDA 4 (20-sep-2026): domingo EN CURSO en el último JSON de la [→ Contexto_Base_Web.md §17B127]
          if ((pProp % 7) === 6) {
            rp.pts = Math.max(rp.pts, Number(obj.clan.periodPoints) || 0);
            rp.ini = Math.max(rp.ini, Math.min(Number(obj.clan.fame) || 0, META_GUERRA_PROGRESO));
          }
        }
      }
    } catch (e) {
      Logger.log('[RecalcGuerraLogs] Clan ' + claves[c] + ': ' + e.message);
    }
    for (var id in porId) {
      var ix = ids[id];
      if (ix === undefined) { sinFila++; continue; }
      var row = datos[ix], v = porId[id];
      if (v.pts > (Number(row[GLC.PTS_EARNED - 1]) || 0)) { row[GLC.PTS_EARNED - 1] = v.pts; cambios++; }
      if (v.ini > (Number(row[GLC.PROG_START - 1]) || 0)) { row[GLC.PROG_START - 1] = v.ini; cambios++; }
      if (v.fin > (Number(row[GLC.PROG_END   - 1]) || 0)) { row[GLC.PROG_END   - 1] = v.fin; cambios++; }
      if (_actualizarValorLogSiCambia_(row, GLC.END_OF_DAY_RANK, v.rank)) cambios++; // TANDA 2: incluye el 0 (primer puesto)
      if (_actualizarValorLogSiCambia_(row, GLC.PROG_EARNED,   v.ganado))  cambios++;
      if (_actualizarValorLogSiCambia_(row, GLC.DEF_REMAINING, v.defRest)) cambios++;
      if (_actualizarValorLogSiCambia_(row, GLC.PROG_DEFENSES, v.defBono)) cambios++;
      // TANDA 13b (21-sep-2026): Estado. Leído solo si el JSON trajo el día [→ Contexto_Base_Web.md §17B128]
      if (v.cierre) {
        v.cierre.endOfDayRank = v.rank;
        v.cierre.progressEarned = v.ganado;
        v.cierre.numOfDefensesRemaining = v.defRest;
        v.cierre.progressEarnedFromDefenses = v.defBono;
      }
      if (_marcarEstadoLog_(row, !!v.cierre && !v.coliseo && _filaCoincideConLogCerrado_(row, v.cierre))) estadoCambios++;
    }
    if (completo) props.setProperty('RECALC_GUERRA_LOGS_CLAN_IDX', String(c + 1));
  }

  // Domingos (y cualquier día sin inicio): inicio = cierre del día anterior.
  for (var i = 0; i < datos.length; i++) {
    var pi = Number(datos[i][GLC.PERIOD_IDX - 1]);
    if (!isFinite(pi) || (pi % 7) <= 3 || (Number(datos[i][GLC.PROG_START - 1]) || 0) > 0) continue;
    var idAnt = String(datos[i][GLC.TAG - 1] || '') + '│' + String(datos[i][GLC.TEMPORADA - 1] || '') +
                '│' + periodIdxToSectionIndex(pi - 1) + '│' + (pi - 1);
    var fAnt = ids[idAnt] !== undefined ? (Number(datos[ids[idAnt]][GLC.PROG_END - 1]) || 0) : 0;
    if (fAnt > 0) {
      // TANDA 13b: un inicio copiado del cierre del día anterior es un CÁLCULO [→ Contexto_Base_Web.md §17B129]
      if (String(datos[i][GLC.ESTADO - 1] || '').trim() === GL_ESTADO_LEIDO) continue;
      datos[i][GLC.PROG_START - 1] = fAnt; cambios++;
      if (_marcarEstadoLog_(datos[i], false)) estadoCambios++;
    }
  }

  if (cambios > 0 || estadoCambios > 0) {
    // Solo PointsEarned..ProgressEarnedFromDefenses (cols 18-25); Min_G (21) se reescribe igual que estaba.
    var bloque = datos.map(function (r) { return r.slice(GLC.PTS_EARNED - 1, GLC.PROG_DEFENSES); });
    sh.getRange(2, GLC.PTS_EARNED, n, bloque[0].length).setValues(bloque);
    sh.getRange(2, GLC.PROG_EARNED, n, GLC.PROG_DEFENSES - GLC.PROG_EARNED + 1).setNumberFormat('#,##0'); // TANDA 1
    // TANDA 13b: la columna Estado (27) se escribe aparte: el bloque de arriba termina en la 25.
    sh.getRange(2, GLC.ESTADO, n, 1).setValues(datos.map(function (r) { return [r[GLC.ESTADO - 1]]; }));
  }
  if (completo) props.deleteProperty('RECALC_GUERRA_LOGS_CLAN_IDX');
  var msg = '[RecalcGuerraLogs] ' + (completo ? 'COMPLETO' : 'INCOMPLETO (volver a ejecutar para continuar)') +
    ' | JSON leídos: ' + archivos + ' | valores actualizados: ' + cambios + ' | Estado actualizado: ' + estadoCambios + ' | ids del JSON sin fila en Guerra_Logs (no se crean): ' + sinFila;
  Logger.log(msg);
  _registrarLogScriptTerna('recalcularGuerraLogsDesdeJSON()', msg, []);
}

/**
 * reconstruirRivalesHistoricosGuerraLogs() [→ Contexto_Base_Web.md §17B130]
 */
function reconstruirRivalesHistoricosGuerraLogs() {
  var t0 = Date.now(), LIMITE_MS = 270000;
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.GUERRA_LOGS);
  if (!sh || sh.getLastRow() < 2) { Logger.log('[ReconstruirRivales] Guerra_Logs vacía o inexistente.'); return; }
  _asegurarColumnasGuerraLogs_(sh); // columnas físicas 23-27, encabezados y notas

  var n = sh.getLastRow() - 1;
  var datos = sh.getRange(2, 1, n, GUERRA_LOGS_TOTAL_COLS).getValues();
  var ids = _mapaIdsGuerraLogs(datos);

  var ternaComp = {};
  for (var tq = 0; tq < CFG.TERNA_TAGS.length; tq++) ternaComp[_tagComparableLogs_(CFG.TERNA_TAGS[tq])] = true;

  var props = PropertiesService.getScriptProperties();
  // CAMBIO (26-sep-2026, esquema NUEVO endpoint -> clan, ver AVISOS ABIERTOS [→ Contexto_Base_Web.md §17B131]
  var claves = Object.keys(_SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_);
  var desde = Number(props.getProperty('RECONSTRUIR_RIVALES_CLAN_IDX')) || 0;
  var nuevas = {}; // id -> acumulador ("el mayor gana" antes de insertar)
  var archivos = 0, completo = true;

  for (var c = desde; c < claves.length; c++) {
    if (Date.now() - t0 > LIMITE_MS) { completo = false; break; }
    try {
      // Mismo criterio de selección de archivo que recalcularGuerraLogsDesdeJSON(): [→ Contexto_Base_Web.md §17B132]
      var carpeta = DriveApp.getFolderById(_SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_[claves[c]]);
      var elegidos = {};
      var it = _archivosConSubcarpetas_(carpeta);
      while (it.hasNext()) {
        var f = it.next();
        var m = /^T-(\d+)\s+S-(\d+)\s+P\.I-(\d+)(?:-[LMXJVSD])?\s.*- currentriverrace\.json$/i.exec(f.getName());
        if (!m) continue;
        var temp = Number(m[1]), pI = Number(m[3]);
        if (RECALC_GUERRA_LOGS_TEMPORADAS.length && RECALC_GUERRA_LOGS_TEMPORADAS.indexOf(temp) < 0) continue;
        var kSem = temp + '|' + Number(m[2]);
        var mFh = /(\d{2})-(\d{2})-(\d{4})\s+(\d{2})\.(\d{2})/.exec(f.getName());
        var claveHora = mFh ? Number(mFh[3] + mFh[2] + mFh[1] + mFh[4] + mFh[5]) : 0;
        if (!elegidos[kSem] || pI > elegidos[kSem].p || (pI === elegidos[kSem].p && claveHora > elegidos[kSem].h)) {
          elegidos[kSem] = { f: f, p: pI, temp: temp, h: claveHora };
        }
      }
      for (var kS in elegidos) {
        if (Date.now() - t0 > LIMITE_MS) { completo = false; break; }
        var obj = JSON.parse(elegidos[kS].f.getBlob().getDataAsString('UTF-8'));
        archivos++;
        var temporada = elegidos[kS].temp;
        var listaClanes = obj.clans || [];
        for (var cr = 0; cr < listaClanes.length; cr++) {
          var cItem = listaClanes[cr] || {};
          var tagR = _tagComparableLogs_(cItem.tag);
          if (!tagR || ternaComp[tagR]) continue; // nunca un clan Terna: ese ya tiene su propio historial
          var nombreR = String(cItem.name || '').trim();
          var copasR  = Number(cItem.clanScore) || 0;
          var logsR   = _logsPorPeriodoDeTag_(obj, cItem.tag);

          for (var pIdxStr in logsR) {
            var logR = logsR[pIdxStr];
            if (!logR.encontrado) continue; // solo días CERRADOS con dato real de este rival
            var pIdx = Number(pIdxStr);
            if (!esDiaGuerraIdx(pIdx)) continue;
            var sIdx = periodIdxToSectionIndex(pIdx);
            var idR  = cItem.tag + '│' + temporada + '│' + sIdx + '│' + pIdx;
            if (ids[idR] !== undefined) continue; // ya existe: esta función no la toca

            var reg = nuevas[idR] || (nuevas[idR] = {
              tag: cItem.tag, nombre: nombreR, copas: copasR, temporada: temporada,
              sIdx: sIdx, pIdx: pIdx,
              pts: 0, ini: 0, fin: 0, rank: null, ganado: null, defRest: null, defBono: null,
              cerrado: false, prov: false // TANDA 13b: origen de los valores (ver Estado)
            });
            reg.cerrado = true;
            reg.pts = Math.max(reg.pts, Number(logR.pointsEarned)       || 0);
            reg.ini = Math.max(reg.ini, Number(logR.progressStartOfDay) || 0);
            reg.fin = Math.max(reg.fin, Number(logR.progressEndOfDay)   || 0);
            if (logR.endOfDayRank             !== null) reg.rank    = logR.endOfDayRank;
            if (logR.progressEarned           !== null) reg.ganado  = logR.progressEarned;
            if (logR.numOfDefensesRemaining   !== null) reg.defRest = logR.numOfDefensesRemaining;
            if (logR.progressEarnedFromDefenses !== null) reg.defBono = logR.progressEarnedFromDefenses;
            if (nombreR && !reg.nombre) reg.nombre = nombreR;
            if (copasR > reg.copas) reg.copas = copasR;
          }

          // Domingo EN CURSO del último domingo de una temporada (pendiente c): [→ Contexto_Base_Web.md §17B133]
          var pProp = Number(obj.periodIndex);
          // TANDA 8 (21-sep-2026): no en coliseo (fame acumulada, sin barco).
          if (isFinite(pProp) && esDiaGuerraIdx(pProp) && (pProp % 7) === 6 && !logsR[pProp] &&
              String(obj.periodType || '') !== 'colosseum') {
            var sIdxP = periodIdxToSectionIndex(pProp);
            var idP   = cItem.tag + '│' + temporada + '│' + sIdxP + '│' + pProp;
            if (ids[idP] === undefined) {
              var regP = nuevas[idP] || (nuevas[idP] = {
                tag: cItem.tag, nombre: nombreR, copas: copasR, temporada: temporada,
                sIdx: sIdxP, pIdx: pProp,
                pts: 0, ini: 0, fin: 0, rank: null, ganado: null, defRest: null, defBono: null,
                cerrado: false, prov: false
              });
              regP.prov = true; // TANDA 13b: valores provisionales del día en vivo -> Estimado
              regP.pts = Math.max(regP.pts, Number(cItem.periodPoints) || 0);
              var finProv = Math.min(Number(cItem.fame) || 0, META_GUERRA_PROGRESO);
              regP.ini = Math.max(regP.ini, finProv);
              regP.fin = Math.max(regP.fin, finProv);
              if (nombreR && !regP.nombre) regP.nombre = nombreR;
              if (copasR > regP.copas) regP.copas = copasR;
            }
          }
        }
      }
    } catch (e) {
      Logger.log('[ReconstruirRivales] Clan ' + claves[c] + ': ' + e.message);
    }
    if (completo) props.setProperty('RECONSTRUIR_RIVALES_CLAN_IDX', String(c + 1));
  }

  // Armar las filas nuevas, mismo formato que la sección de rivales de
  // updateGuerraLogsSheet() (ver más arriba en este archivo).
  var now = new Date();
  var nuevasFilas = [];
  for (var idNueva in nuevas) {
    var rg = nuevas[idNueva];
    nuevasFilas.push({
      id: idNueva,
      row: [
        null,                                    // N° (se numera al insertar)
        now,                                     // Fecha
        rg.temporada,                            // Temporada
        rg.sIdx + 1,                             // Semana
        periodIdxToLetra(rg.pIdx),               // Día
        calcDiaGuerraIdx(CFG.REF_DEFAULT, rg.temporada, rg.pIdx), // DiaGuerra
        rg.nombre,                               // Clan
        rg.tag,                                  // Tag
        rg.pIdx,                                 // PeriodIndex
        '',                                      // Líder (no viene)
        '',                                      // Tag(L) (no viene)
        '',                                      // Donaciones (no viene)
        '',                                      // Trofeos (no viene)
        rg.copas || '',                          // Copas (clanScore)
        '',                                      // Miembros (no viene)
        '',                                      // RepairPoints (fila histórica, no es "hoy")
        '',                                      // PeriodPoints (fila histórica, no es "hoy")
        rg.pts,                                  // PointsEarned
        rg.ini,                                  // ProgressStartOfDay
        rg.fin,                                  // ProgressEndOfDay
        '',                                       // Min_G (no aplica)
        (rg.rank    === null || rg.rank    === undefined) ? '' : rg.rank,
        (rg.ganado  === null || rg.ganado  === undefined) ? '' : rg.ganado,
        (rg.defRest === null || rg.defRest === undefined) ? '' : rg.defRest,
        (rg.defBono === null || rg.defBono === undefined) ? '' : rg.defBono,
        'Rival',                                 // Tipo
        // Estado (TANDA 13b): Leído solo si TODOS los valores salen de días
        // cerrados del JSON, sin mezcla con provisionales y fuera de coliseo.
        (rg.cerrado && !rg.prov && !_esPeriodoDeColiseo_(rg.temporada, rg.pIdx)) ? GL_ESTADO_LEIDO : GL_ESTADO_ESTIMADO
      ]
    });
  }

  nuevasFilas.sort(function(a, b) {
    if (a.row[GLC.TEMPORADA - 1] !== b.row[GLC.TEMPORADA - 1]) return a.row[GLC.TEMPORADA - 1] - b.row[GLC.TEMPORADA - 1];
    return (a.row[GLC.PERIOD_IDX - 1] || 0) - (b.row[GLC.PERIOD_IDX - 1] || 0);
  });

  if (nuevasFilas.length > 0) {
    var startRow = sh.getLastRow() < 1 ? 2 : sh.getLastRow() + 1;

    var batchValues = nuevasFilas.map(function(f, idx) {
      f.row[0] = startRow + idx - 1;
      // TANDA 13a (21-sep-2026): las filas nuevas se arman con las columnas [→ Contexto_Base_Web.md §17B134]
      while (f.row.length < GUERRA_LOGS_TOTAL_COLS) f.row.push('');
      return f.row.map(function(v) {
        if (v instanceof Date) return '';
        return v;
      });
    });

    sh.getRange(startRow, 1, batchValues.length, GUERRA_LOGS_TOTAL_COLS).setValues(batchValues);

    for (var idx = 0; idx < nuevasFilas.length; idx++) {
      var row  = startRow + idx;
      var fRow = nuevasFilas[idx].row;
      _setDateCell(sh, row, GLC.FECHA,      fRow[GLC.FECHA - 1],      'dddd, d "de" mmmm"," yyyy h:mm:ss AM/PM');
      _setDateCell(sh, row, GLC.DIA_GUERRA, fRow[GLC.DIA_GUERRA - 1], 'dd/mm/yyyy');
      for (var colFmt = GLC.DONACIONES; colFmt <= GLC.PROG_DEFENSES; colFmt++) {
        _trySetFmt(sh, row, colFmt, '#,##0');
      }
    }

    _aplicarFmtCondicionalGuerraLogs(sh);
  }

  if (completo) props.deleteProperty('RECONSTRUIR_RIVALES_CLAN_IDX');
  var msg = '[ReconstruirRivales] ' + (completo ? 'COMPLETO' : 'INCOMPLETO (volver a ejecutar para continuar)') +
    ' | JSON leídos: ' + archivos + ' | filas nuevas de rivales creadas: ' + nuevasFilas.length;
  Logger.log(msg);
  _registrarLogScriptTerna('reconstruirRivalesHistoricosGuerraLogs()', msg, []);
}

// TANDA 13d (21-sep-2026, pedido del usuario): RELLENAR Estado EN LAS FILAS [→ Contexto_Base_Web.md §17B135]

/**
 * _claveFilaGuerraLogs_(fila) [→ Contexto_Base_Web.md §17B136]
 */
function _claveFilaGuerraLogs_(fila) {
  return _tagComparableLogs_(fila[GLC.TAG - 1]) + '|' +
    (Number(fila[GLC.TEMPORADA - 1]) || 0) + '|' + (Number(fila[GLC.PERIOD_IDX - 1]) || 0);
}

/**
 * _cerradosDesdeJsonGuerra_(obj, temporada, salida) [→ Contexto_Base_Web.md §17B137]
 */
function _cerradosDesdeJsonGuerra_(obj, temporada, salida) {
  var logs = (obj && obj.periodLogs) || [];
  var nulo = function (v) { return (v === undefined || v === null) ? null : (Number(v) || 0); };
  var cantidad = 0;
  for (var l = 0; l < logs.length; l++) {
    var pl = Number(logs[l].periodIndex);
    if (!isFinite(pl) || !esDiaGuerraIdx(pl)) continue;
    var items = logs[l].items || [];
    for (var k = 0; k < items.length; k++) {
      var it = items[k];
      if (!it || !it.clan || !it.clan.tag) continue;
      salida[_tagComparableLogs_(it.clan.tag) + '|' + (Number(temporada) || 0) + '|' + pl] = {
        encontrado: true,
        pointsEarned:       Number(it.pointsEarned)       || 0,
        progressStartOfDay: Number(it.progressStartOfDay) || 0,
        progressEndOfDay:   Number(it.progressEndOfDay)   || 0,
        endOfDayRank:               nulo(it.endOfDayRank),
        progressEarned:             nulo(it.progressEarned),
        numOfDefensesRemaining:     nulo(it.numOfDefensesRemaining),
        progressEarnedFromDefenses: nulo(it.progressEarnedFromDefenses)
      };
      cantidad++;
    }
  }
  return cantidad;
}

/**
 * rellenarEstadoGuerraLogsHistorico() [→ Contexto_Base_Web.md §17B138]
 */
function rellenarEstadoGuerraLogsHistorico() {
  _rellenarEstadoGuerraLogsHistorico_(false);
}

/**
 * rellenarEstadoGuerraLogsHistoricoAplicar() [→ Contexto_Base_Web.md §17B139]
 */
function rellenarEstadoGuerraLogsHistoricoAplicar() {
  _rellenarEstadoGuerraLogsHistorico_(true);
}

/**
 * _rellenarEstadoGuerraLogsHistorico_(aplicar) [→ Contexto_Base_Web.md §17B140]
 */
function _rellenarEstadoGuerraLogsHistorico_(aplicar) {
  var t0 = Date.now(), LIMITE_MS = 270000;
  var etiqueta = aplicar ? 'APLICAR' : 'SOLO INFORMAR';
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.GUERRA_LOGS);
  if (!sh || sh.getLastRow() < 2) { Logger.log('[RellenarEstado] Guerra_Logs vacía o inexistente.'); return; }
  _asegurarColumnasGuerraLogs_(sh);

  var n = sh.getLastRow() - 1;
  var datos = sh.getRange(2, 1, n, GUERRA_LOGS_TOTAL_COLS).getValues();
  var props = PropertiesService.getScriptProperties();
  var CLAVE_IDX = 'RELLENAR_ESTADO_CLAN_IDX';
  var escribirEstado = function () {
    sh.getRange(2, GLC.ESTADO, n, 1).setValues(datos.map(function (r) { return [r[GLC.ESTADO - 1]]; }));
  };

  // Paso A: filas vacías; las de coliseo son 'Estimado', el resto queda pendiente.
  var vacias = 0, coliseo = 0, pend = [];
  for (var i = 0; i < n; i++) {
    var f = datos[i];
    if (!String(f[GLC.TAG - 1] || '').trim()) continue;
    if (String(f[GLC.ESTADO - 1] || '').trim() !== '') continue;
    vacias++;
    if (_esPeriodoDeColiseo_(Number(f[GLC.TEMPORADA - 1]), Number(f[GLC.PERIOD_IDX - 1]))) {
      coliseo++;
      if (aplicar) f[GLC.ESTADO - 1] = GL_ESTADO_ESTIMADO;
    } else {
      pend.push(i);
    }
  }
  if (aplicar && coliseo > 0) escribirEstado();

  // Paso B: filas pendientes contra los logs cerrados de los JSON de Drive. [→ Contexto_Base_Web.md §17B141]
  var claves = Object.keys(_SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_);
  var desde = aplicar ? (Number(props.getProperty(CLAVE_IDX)) || 0) : 0;
  var completo = true, archivos = 0, leidas = 0;
  var resueltas = {}, distintas = {};

  for (var c = desde; c < claves.length && pend.length; c++) {
    if (Date.now() - t0 > LIMITE_MS) { completo = false; break; }
    var cerrados = {};
    try {
      var carpeta = DriveApp.getFolderById(_SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_[claves[c]]);
      var elegidos = {};
      var it = _archivosConSubcarpetas_(carpeta);
      while (it.hasNext()) {
        var fArch = it.next();
        var m = /^T-(\d+)\s+S-(\d+)\s+P\.I-(\d+)(?:-[LMXJVSD])?\s.*- currentriverrace\.json$/i.exec(fArch.getName());
        if (!m) continue;
        var temp = Number(m[1]), pI = Number(m[3]);
        if (RECALC_GUERRA_LOGS_TEMPORADAS.length && RECALC_GUERRA_LOGS_TEMPORADAS.indexOf(temp) < 0) continue;
        var kSem = temp + '|' + Number(m[2]);
        var mFh = /(\d{2})-(\d{2})-(\d{4})\s+(\d{2})\.(\d{2})/.exec(fArch.getName());
        var claveHora = mFh ? Number(mFh[3] + mFh[2] + mFh[1] + mFh[4] + mFh[5]) : 0;
        if (!elegidos[kSem] || pI > elegidos[kSem].p || (pI === elegidos[kSem].p && claveHora > elegidos[kSem].h)) {
          elegidos[kSem] = { f: fArch, p: pI, temp: temp, h: claveHora };
        }
      }
      for (var kS in elegidos) {
        if (Date.now() - t0 > LIMITE_MS) { completo = false; break; }
        var obj = JSON.parse(elegidos[kS].f.getBlob().getDataAsString('UTF-8'));
        archivos++;
        leidas += _cerradosDesdeJsonGuerra_(obj, elegidos[kS].temp, cerrados);
      }
    } catch (e) {
      Logger.log('[RellenarEstado] Clan ' + claves[c] + ': ' + e.message);
    }

    var cambios = 0;
    for (var p = 0; p < pend.length; p++) {
      var ix = pend[p];
      if (resueltas[ix]) continue;
      var fila = datos[ix];
      var cer = cerrados[_claveFilaGuerraLogs_(fila)];
      if (!cer) continue;
      if (_filaCoincideConLogCerrado_(fila, cer)) {
        resueltas[ix] = true;
        delete distintas[ix];
        if (aplicar) { fila[GLC.ESTADO - 1] = GL_ESTADO_LEIDO; cambios++; }
      } else {
        distintas[ix] = true;
      }
    }
    if (aplicar && cambios > 0) escribirEstado();
    if (completo && aplicar) props.setProperty(CLAVE_IDX, String(c + 1));
  }
  if (completo && aplicar) props.deleteProperty(CLAVE_IDX);

  var leido = Object.keys(resueltas).length;
  var distinto = Object.keys(distintas).length;
  var sinJson = Math.max(0, pend.length - leido - distinto);
  var msg = '[RellenarEstado] ' + etiqueta + ' | ' + (completo ? 'COMPLETO' : 'INCOMPLETO (' + (aplicar ? 'volver a ejecutar para continuar' : 'no alcanzó el tiempo; usar rellenarEstadoGuerraLogsHistoricoAplicar(), que es reanudable') + ')') +
    ' | filas con Estado vacío al empezar: ' + vacias +
    ' | ' + (aplicar ? 'marcadas' : 'se marcarían') + ' Estimado (coliseo): ' + coliseo +
    ' | ' + (aplicar ? 'marcadas' : 'se marcarían') + ' Leído (coinciden con el JSON): ' + leido +
    ' | quedan VACÍAS porque el JSON trae ese día pero la fila es distinta (correr recalcularGuerraLogsDesdeJSON() y repetir): ' + distinto +
    ' | quedan VACÍAS sin JSON cerrado de ese día: ' + sinJson +
    ' | JSON leídos: ' + archivos + ' | logs cerrados vistos: ' + leidas;
  Logger.log(msg);
  _registrarLogScriptTerna('rellenarEstadoGuerraLogsHistorico' + (aplicar ? 'Aplicar' : '') + '()', msg, []);
}

// TANDA 10 (21-sep-2026, pedido del usuario): LIMPIEZA DE FILAS VIEJAS DE [→ Contexto_Base_Web.md §17B142]

// Las 5 columnas de barco: en coliseo los barcos no avanzan y deben quedar VACÍAS
// (regla confirmada en la TANDA 8).
var GL_COLS_BARCO_COLISEO = [GLC.PROG_START, GLC.PROG_END, GLC.PROG_EARNED, GLC.DEF_REMAINING, GLC.PROG_DEFENSES];

/**
 * _semanaColiseoCerrada_(temporada, pIdx, ctx) [→ Contexto_Base_Web.md §17B143]
 */
function _semanaColiseoCerrada_(temporada, pIdx, ctx) {
  var t = Number(temporada), p = Number(pIdx);
  if (!isFinite(t) || !isFinite(p) || !_esPeriodoDeColiseo_(t, p)) return false;
  var tAct = Number(ctx && ctx.temporada), pAct = Number(ctx && ctx.periodIndex);
  if (!isFinite(tAct)) return false;
  if (t < tAct) return true;
  if (t > tAct) return false;
  if (!isFinite(pAct)) return false;
  return pAct > (Math.floor(p / 7) * 7 + 6);
}

/**
 * _snapshotColiseoDesdeJson_(obj, temporada, claveHora, salida) [→ Contexto_Base_Web.md §17B144]
 */
function _snapshotColiseoDesdeJson_(obj, temporada, claveHora, salida) {
  if (!obj || String(obj.periodType || '') !== 'colosseum') return 0;
  var pI = Number(obj.periodIndex);
  if (!isFinite(pI)) return 0;
  var tagPropio = String((obj.clan && obj.clan.tag) || obj.tag || '');
  var est = _estimarPuestosColiseoRR_(obj, tagPropio);
  var clanes = [];
  if (obj.clan) clanes.push({ tag: obj.clan.tag || tagPropio, fame: obj.clan.fame });
  var lista = obj.clans || [];
  for (var i = 0; i < lista.length; i++) clanes.push({ tag: lista[i] && lista[i].tag, fame: lista[i] && lista[i].fame });
  var tocadas = 0, vistos = {};
  for (var k = 0; k < clanes.length; k++) {
    var t = _tagComparableLogs_(clanes[k].tag);
    if (!t || vistos[t]) continue;
    vistos[t] = true;
    var clave = t + '|' + (Number(temporada) || 0) + '|' + pI;
    var fame = Number(clanes[k].fame) || 0;
    var previo = salida[clave];
    if (previo && (previo.h > claveHora || (previo.h === claveHora && previo.fame >= fame))) continue;
    salida[clave] = { fame: fame, rank: est[t] ? est[t].rank : null, h: claveHora };
    tocadas++;
  }
  return tocadas;
}

/**
 * limpiarFilasColiseoGuerraLogs() [→ Contexto_Base_Web.md §17B145]
 */
function limpiarFilasColiseoGuerraLogs() {
  _limpiarFilasColiseoGuerraLogs_(false);
}

/**
 * limpiarFilasColiseoGuerraLogsAplicar() [→ Contexto_Base_Web.md §17B146]
 */
function limpiarFilasColiseoGuerraLogsAplicar() {
  _limpiarFilasColiseoGuerraLogs_(true);
}

/**
 * _limpiarFilasColiseoGuerraLogs_(aplicar) [→ Contexto_Base_Web.md §17B147]
 */
function _limpiarFilasColiseoGuerraLogs_(aplicar) {
  var t0 = Date.now(), LIMITE_MS = 270000;
  var etiqueta = aplicar ? 'APLICAR' : 'SOLO INFORMAR';
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.GUERRA_LOGS);
  if (!sh || sh.getLastRow() < 2) { Logger.log('[LimpiezaColiseo] Guerra_Logs vacía o inexistente.'); return; }
  _asegurarColumnasGuerraLogs_(sh);

  var ctx = _getCtx();
  var n = sh.getLastRow() - 1;
  var datos = sh.getRange(2, 1, n, GUERRA_LOGS_TOTAL_COLS).getValues();
  var props = PropertiesService.getScriptProperties();
  var CLAVE_IDX = 'LIMPIEZA_COLISEO_CLAN_IDX';
  var marca = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH.mm.ss');
  var cambiosLog = [['N°', 'Id', 'Columna', 'Valor anterior', 'Valor nuevo']];
  var vacio = function (v) { return v === '' || v === null || v === undefined; };
  var celda = function (fila, col) { return fila[col - 1]; };
  var idDe = function (f) { return _claveFilaGuerraLogs_(f); };
  var encabezado = function (col) { return String(GUERRA_LOGS_HEADERS[col - 1] || ('col ' + col)); };

  // Filas objetivo: coliseo cerrado y que no sean Leído.
  var objetivo = [];
  var yaLeidas = 0;
  for (var i = 0; i < n; i++) {
    var f = datos[i];
    if (!String(f[GLC.TAG - 1] || '').trim()) continue;
    if (!_semanaColiseoCerrada_(f[GLC.TEMPORADA - 1], f[GLC.PERIOD_IDX - 1], ctx)) continue;
    if (String(f[GLC.ESTADO - 1] || '').trim() === GL_ESTADO_LEIDO) { yaLeidas++; continue; }
    objetivo.push(i);
  }

  var escribir = function () {
    if (cambiosLog.length > 1) {
      _saveCSVToDrive('Limpieza_Coliseo_Guerra_Logs ' + marca + '.csv', _encodeCSV(cambiosLog));
    }
    var bloque = datos.map(function (r) { return r.slice(GLC.PTS_EARNED - 1, GLC.PROG_DEFENSES); });
    sh.getRange(2, GLC.PTS_EARNED, n, bloque[0].length).setValues(bloque);
    sh.getRange(2, GLC.PROG_EARNED, n, GLC.PROG_DEFENSES - GLC.PROG_EARNED + 1).setNumberFormat('#,##0');
    sh.getRange(2, GLC.ESTADO, n, 1).setValues(datos.map(function (r) { return [r[GLC.ESTADO - 1]]; }));
  };
  var fijar = function (fila, col, nuevo) {
    var anterior = celda(fila, col);
    cambiosLog.push([fila[GLC.NUM - 1] || '', idDe(fila), encabezado(col), anterior, nuevo]);
    fila[col - 1] = nuevo;
  };

  // Paso A: vaciar las columnas de barco (sin Drive).
  var filasBarco = 0, celdasBarco = 0, filasMarcadas = 0;
  var tocadas = {}; // índice de fila -> true (para marcar Estimado una sola vez)
  for (var o = 0; o < objetivo.length; o++) {
    var fA = datos[objetivo[o]];
    var conValor = GL_COLS_BARCO_COLISEO.filter(function (col) { return !vacio(celda(fA, col)); });
    if (!conValor.length) continue;
    filasBarco++; celdasBarco += conValor.length;
    tocadas[objetivo[o]] = true;
    if (aplicar) conValor.forEach(function (col) { fijar(fA, col, ''); });
  }

  // Paso B: PointsEarned y EndOfDayRank desde los JSON de Drive. [→ Contexto_Base_Web.md §17B148]
  var claves = Object.keys(_SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_);
  var desde = aplicar ? (Number(props.getProperty(CLAVE_IDX)) || 0) : 0;
  var completo = true, archivos = 0;
  var ptsCalc = {}, ptsDifiere = {}, rankCalc = {}, rankDifiere = {}, noCalculable = {};
  var resueltasPts = {}, resueltasRank = {};

  for (var c = desde; c < claves.length && objetivo.length; c++) {
    if (Date.now() - t0 > LIMITE_MS) { completo = false; break; }
    var snap = {};
    try {
      var carpeta = DriveApp.getFolderById(_SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_[claves[c]]);
      // Última captura de CADA día (temporada + P.I) de coliseo.
      var elegidos = {};
      var it = _archivosConSubcarpetas_(carpeta);
      while (it.hasNext()) {
        var fArch = it.next();
        var m = /^T-(\d+)\s+S-(\d+)\s+P\.I-(\d+)(?:-[LMXJVSD])?\s.*- currentriverrace\.json$/i.exec(fArch.getName());
        if (!m) continue;
        var temp = Number(m[1]), pI = Number(m[3]);
        if (RECALC_GUERRA_LOGS_TEMPORADAS.length && RECALC_GUERRA_LOGS_TEMPORADAS.indexOf(temp) < 0) continue;
        if (!_semanaColiseoCerrada_(temp, pI, ctx)) continue;
        var kDia = temp + '|' + pI;
        var mFh = /(\d{2})-(\d{2})-(\d{4})\s+(\d{2})\.(\d{2})/.exec(fArch.getName());
        var claveHora = mFh ? Number(mFh[3] + mFh[2] + mFh[1] + mFh[4] + mFh[5]) : 0;
        if (!elegidos[kDia] || claveHora > elegidos[kDia].h) elegidos[kDia] = { f: fArch, temp: temp, h: claveHora };
      }
      for (var kD in elegidos) {
        if (Date.now() - t0 > LIMITE_MS) { completo = false; break; }
        var obj = JSON.parse(elegidos[kD].f.getBlob().getDataAsString('UTF-8'));
        archivos++;
        _snapshotColiseoDesdeJson_(obj, elegidos[kD].temp, elegidos[kD].h, snap);
      }
    } catch (e) {
      Logger.log('[LimpiezaColiseo] Clan ' + claves[c] + ': ' + e.message);
    }

    for (var o2 = 0; o2 < objetivo.length; o2++) {
      var ix = objetivo[o2];
      var fB = datos[ix];
      var tagC = _tagComparableLogs_(fB[GLC.TAG - 1]);
      var tempB = Number(fB[GLC.TEMPORADA - 1]) || 0;
      var pB = Number(fB[GLC.PERIOD_IDX - 1]) || 0;
      var hoy = snap[tagC + '|' + tempB + '|' + pB];
      if (!hoy) continue;

      // PointsEarned = fama de hoy - fama de ayer (jueves: la fama entera).
      var pts = null;
      if ((pB % 7) === 3) pts = hoy.fame;
      else {
        var ayer = snap[tagC + '|' + tempB + '|' + (pB - 1)];
        if (ayer) pts = Math.max(0, hoy.fame - ayer.fame);
      }
      if (pts === null) {
        if (!resueltasPts[ix]) noCalculable[ix] = true;
      } else if (!resueltasPts[ix]) {
        var ptsAct = celda(fB, GLC.PTS_EARNED);
        var ptsActNum = _numDesdeCeldaLogs_(ptsAct);
        if (vacio(ptsAct) || ptsActNum === 0) {
          if (pts > 0) {
            resueltasPts[ix] = true; delete noCalculable[ix]; delete ptsDifiere[ix];
            ptsCalc[ix] = true;
            tocadas[ix] = true;
            if (aplicar) fijar(fB, GLC.PTS_EARNED, pts);
          }
        } else if (ptsActNum !== pts) {
          ptsDifiere[ix] = true; // ya tenía dato: se conserva
        }
      }

      // EndOfDayRank = puesto estimado por fama (0 = primero).
      if (hoy.rank !== null && !resueltasRank[ix]) {
        var rkAct = celda(fB, GLC.END_OF_DAY_RANK);
        var rkActNum = _numDesdeCeldaLogs_(rkAct);
        if (vacio(rkAct) || (rkActNum === 0 && hoy.rank !== 0)) {
          resueltasRank[ix] = true; delete rankDifiere[ix];
          rankCalc[ix] = true;
          tocadas[ix] = true;
          if (aplicar) fijar(fB, GLC.END_OF_DAY_RANK, hoy.rank);
        } else if (rkActNum !== hoy.rank) {
          rankDifiere[ix] = true; // ya tenía dato: se conserva
        }
      }
    }
    if (aplicar && completo) props.setProperty(CLAVE_IDX, String(c + 1));
  }
  if (aplicar && completo) props.deleteProperty(CLAVE_IDX);

  // Paso C: toda fila tocada queda Estimado.
  for (var ixT in tocadas) {
    if (aplicar) { if (_marcarEstadoLog_(datos[ixT], false)) filasMarcadas++; }
    else if (String(datos[ixT][GLC.ESTADO - 1] || '').trim() !== GL_ESTADO_ESTIMADO) filasMarcadas++;
  }
  if (aplicar && (cambiosLog.length > 1 || filasMarcadas > 0)) escribir();

  var cuenta = function (mapa) { return Object.keys(mapa).length; };
  var msg = '[LimpiezaColiseo] ' + etiqueta + ' | ' + (completo ? 'COMPLETO' : 'INCOMPLETO (' + (aplicar ? 'volver a ejecutar para continuar' : 'no alcanzó el tiempo; usar limpiarFilasColiseoGuerraLogsAplicar(), que es reanudable') + ')') +
    ' | filas de coliseo cerrado a revisar: ' + objetivo.length + ' (ya Leídas, omitidas: ' + yaLeidas + ')' +
    ' | filas con barco a vaciar: ' + filasBarco + ' (' + celdasBarco + ' celdas)' +
    ' | PointsEarned ' + (aplicar ? 'corregidos' : 'se corregirían') + ': ' + cuenta(ptsCalc) + ', ya con otro dato (se conservan): ' + cuenta(ptsDifiere) + ', sin captura del día anterior: ' + cuenta(noCalculable) +
    ' | EndOfDayRank ' + (aplicar ? 'corregidos' : 'se corregirían') + ': ' + cuenta(rankCalc) + ', ya con otro dato (se conservan): ' + cuenta(rankDifiere) +
    ' | filas ' + (aplicar ? 'marcadas' : 'que se marcarían') + ' Estimado: ' + filasMarcadas +
    ' | JSON leídos: ' + archivos +
    (aplicar && cambiosLog.length > 1 ? ' | valores anteriores guardados en Drive: "Limpieza_Coliseo_Guerra_Logs ' + marca + '.csv" (' + (cambiosLog.length - 1) + ' cambios)' : '');
  Logger.log(msg);
  _registrarLogScriptTerna('limpiarFilasColiseoGuerraLogs' + (aplicar ? 'Aplicar' : '') + '()', msg, []);
}


// ----- CORRECCIÓN DE Fecha EN Guerra_Logs (12-oct-2026, pedido de la usuaria) -----
// [→ Contexto_Base_Web.md §PF063] Las filas anteriores a la regla «Fecha = primera consulta del periodIndex» quedaron con la hora
// de la corrida que las creó (00:01:58, 21:02:28, 08:22:01) o sin hora (00:00:00). La mejor fuente que queda es la PRIMERA captura
// de la hoja Guerra (y de Backup_Guerra.csv, que conserva lo purgado) para la misma temporada, periodIndex y clan. Los rivales no
// están en Guerra: se usa la primera captura de cualquier clan Terna en ese periodIndex.
// Primero se ejecuta el informe (no escribe nada) y después el que aplica. Reglas: solo se corrige hacia una hora MÁS TEMPRANA
// (la primera consulta no puede ser posterior a la creación de la fila), o la hora de una fila que solo tenía fecha en el MISMO día;
// la captura debe caer en la fecha del DiaGuerra o en la siguiente; nunca se inventa una hora (sin captura con hora, la fila no se toca).
function corregirFechaGuerraLogsInforme() { _corregirFechaGuerraLogs_(false); }
function corregirFechaGuerraLogsAplicar() { _corregirFechaGuerraLogs_(true); }

function _msFechaConHoraLima_(v) {
  var d = null;
  if (v instanceof Date) d = v;
  else {
    var s = String(v || '').trim();
    if (/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/.test(s)) {
      try { d = Utilities.parseDate(s, 'America/Lima', 'dd/MM/yyyy HH:mm:ss'); } catch (e) { d = null; }
    }
  }
  if (!d || isNaN(d.getTime())) return null;
  if (Utilities.formatDate(d, 'America/Lima', 'HH:mm:ss') === '00:00:00') return null; // solo fecha: no es una hora real
  return d.getTime();
}

function _diaLimaDe_(v) {
  var d = null;
  if (v instanceof Date) d = v;
  else {
    var s = String(v || '').trim();
    var m = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(s);
    if (m) return m[3] + m[2] + m[1];
  }
  if (!d || isNaN(d.getTime())) return '';
  return Utilities.formatDate(d, 'America/Lima', 'yyyyMMdd');
}

/** Primera captura con hora por temporada|periodIndex|clan y por temporada|periodIndex|* (mínimo entre clanes). */
function _primerasCapturasGuerra_(ss) {
  var minimo = {}, sinHora = {}, total = {};
  var anotar = function (filas) {
    for (var i = 0; i < filas.length; i++) {
      var f = filas[i];
      if (_celdaVaciaGuerra_(f[GC.FECHA - 1])) continue;
      var ms = _msFechaConHoraLima_(f[GC.FECHA - 1]);
      var base = (Number(f[GC.TEMPORADA - 1]) || 0) + '|' + (Number(f[GC.PERIOD_IDX - 1]) || 0) + '|';
      var ks = [base + String(f[GC.CLAN - 1] || '').trim(), base + '*'];
      for (var k = 0; k < ks.length; k++) {
        // Filas de Guerra con solo fecha (sin hora) son capturas de hora desconocida. Si son más del 10 % del grupo, el mínimo
        // con hora ya no es confiable como primera captura y ese grupo no se usa (ver _corregirFechaGuerraLogs_).
        total[ks[k]] = (total[ks[k]] || 0) + 1;
        if (ms === null) { sinHora[ks[k]] = (sinHora[ks[k]] || 0) + 1; continue; }
        if (minimo[ks[k]] === undefined || ms < minimo[ks[k]]) minimo[ks[k]] = ms;
      }
    }
  };
  var fuentes = 0;
  try {
    var sh = ss.getSheetByName(CFG.SHEETS.GUERRA);
    if (sh && sh.getLastRow() >= 2) { anotar(sh.getRange(2, 1, sh.getLastRow() - 1, GUERRA_TOTAL_COLS).getValues()); fuentes++; }
  } catch (e1) { Logger.log('[CorregirFecha] No se pudo leer la hoja Guerra: ' + e1.message); }
  try {
    var txt = _loadCSVFromDrive('Backup_Guerra.csv');
    if (txt) {
      var p = _parseCSV(txt);
      if (p && p.length > 1) { anotar(p.slice(1)); fuentes++; }
    }
  } catch (e2) { Logger.log('[CorregirFecha] No se pudo leer Backup_Guerra.csv: ' + e2.message); }
  var inseguro = {};
  for (var kk in sinHora) if (sinHora[kk] / total[kk] > 0.10) inseguro[kk] = true;
  return { minimo: minimo, sinHora: inseguro, fuentes: fuentes };
}

/** Devuelve la fecha corregida (ms) o null si la fila no debe cambiar. */
function _fechaCorregidaGuerraLog_(fechaActual, diaGuerra, fuenteMs) {
  if (fuenteMs === undefined || fuenteMs === null) return null;
  var diaFuente = Utilities.formatDate(new Date(fuenteMs), 'America/Lima', 'yyyyMMdd');
  var dg = _diaLimaDe_(diaGuerra);
  if (dg) {
    var y = Number(dg.substr(0, 4)), m = Number(dg.substr(4, 2)) - 1, d = Number(dg.substr(6, 2));
    var sig = Utilities.formatDate(new Date(y, m, d + 1, 12, 0, 0), 'America/Lima', 'yyyyMMdd');
    if (diaFuente !== dg && diaFuente !== sig) return null; // captura de otro día: no es confiable
  }
  var actualMs = _msFechaConHoraLima_(fechaActual);
  if (actualMs !== null) return (fuenteMs < actualMs - 1000) ? fuenteMs : null;
  // La fila solo tenía fecha (sin hora): se completa si la captura es del mismo día.
  var diaActual = _diaLimaDe_(fechaActual);
  return (diaActual && diaActual === diaFuente) ? fuenteMs : null;
}

function _corregirFechaGuerraLogs_(aplicar) {
  var etiqueta = aplicar ? 'APLICAR' : 'SOLO INFORMAR';
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.GUERRA_LOGS);
  if (!sh || sh.getLastRow() < 2) { Logger.log('[CorregirFecha] Guerra_Logs vacía o inexistente.'); return; }
  var n = sh.getLastRow() - 1;
  var datos = sh.getRange(2, 1, n, GUERRA_LOGS_TOTAL_COLS).getValues();
  var cap = _primerasCapturasGuerra_(ss);
  if (!cap.fuentes) { Logger.log('[CorregirFecha] Sin hoja Guerra ni Backup_Guerra.csv: no hay de dónde tomar la primera captura. No se cambió nada.'); return; }

  var marca = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH.mm.ss');
  var fmt = function (ms) { return Utilities.formatDate(new Date(ms), 'America/Lima', 'dd/MM/yyyy HH:mm:ss'); };
  var cambiosLog = [['N°', 'Id', 'Tipo', 'Fecha anterior', 'Fecha nueva']];
  var nuevaCol = [];
  var porTipo = { Terna: 0, Rival: 0 }, sinFuente = 0, otroDia = 0, iguales = 0, horaDesconocida = 0;
  var ejemplos = [];
  for (var i = 0; i < n; i++) {
    var f = datos[i];
    var actual = f[GLC.FECHA - 1];
    nuevaCol.push([actual]);
    if (!String(f[GLC.TAG - 1] || '').trim()) continue;
    var esRival = String(f[GLC.TIPO - 1] || '').trim() === 'Rival';
    var base = (Number(f[GLC.TEMPORADA - 1]) || 0) + '|' + (Number(f[GLC.PERIOD_IDX - 1]) || 0) + '|';
    var claveCap = base + (esRival ? '*' : String(f[GLC.CLAN - 1] || '').trim());
    if (cap.sinHora[claveCap]) { horaDesconocida++; continue; }
    var fuente = cap.minimo[claveCap];
    if (fuente === undefined) { sinFuente++; continue; }
    var nuevoMs = _fechaCorregidaGuerraLog_(actual, f[GLC.DIA_GUERRA - 1], fuente);
    if (nuevoMs === null) {
      var actMs = _msFechaConHoraLima_(actual);
      if (actMs !== null && fuente >= actMs - 1000) iguales++; else otroDia++;
      continue;
    }
    var tipo = esRival ? 'Rival' : 'Terna';
    porTipo[tipo]++;
    var antes = (actual instanceof Date) ? fmt(actual.getTime()) : String(actual);
    cambiosLog.push([f[GLC.NUM - 1] || '', _claveFilaGuerraLogs_(f), tipo, antes, fmt(nuevoMs)]);
    if (ejemplos.length < 6) ejemplos.push((f[GLC.NUM - 1] || '?') + ': ' + antes + ' -> ' + fmt(nuevoMs));
    nuevaCol[i] = [new Date(nuevoMs)];
  }
  var total = cambiosLog.length - 1;
  if (aplicar && total > 0) {
    _saveCSVToDrive('Correccion_Fecha_Guerra_Logs ' + marca + '.csv', _encodeCSV(cambiosLog));
    sh.getRange(2, GLC.FECHA, n, 1).setValues(nuevaCol);
    sh.getRange(2, GLC.FECHA, n, 1).setNumberFormat('dddd, d "de" mmmm"," yyyy h:mm:ss AM/PM');
    _syncUnaAcumulativaCSV(
      { sheetName: CFG.SHEETS.GUERRA_LOGS, fileName: 'Backup_Guerra_Logs.csv', numCols: GUERRA_LOGS_TOTAL_COLS, hasFecha: true, fechaCol: GLC.FECHA },
      true
    );
  }
  var msg = '[CorregirFecha] ' + etiqueta + ' | filas revisadas: ' + n + ' | fuentes de primera captura: ' + cap.fuentes +
    ' | Fecha ' + (aplicar ? 'corregidas' : 'se corregirían') + ': ' + total + ' (Terna ' + porTipo.Terna + ', Rival ' + porTipo.Rival + ')' +
    ' | sin captura con hora en Guerra (no se tocan): ' + sinFuente +
    ' | periodos con capturas de Guerra sin hora, primera captura desconocida (no se tocan): ' + horaDesconocida +
    ' | ya iguales o con hora más temprana (no se tocan): ' + iguales +
    ' | captura de otro día (no se tocan): ' + otroDia +
    (ejemplos.length ? ' | ejemplos: ' + ejemplos.join(' ; ') : '') +
    (aplicar && total > 0 ? ' | valores anteriores guardados en Drive: "Correccion_Fecha_Guerra_Logs ' + marca + '.csv"; Backup_Guerra_Logs.csv resincronizado' : '');
  Logger.log(msg);
  _registrarLogScriptTerna('corregirFechaGuerraLogs' + (aplicar ? 'Aplicar' : 'Informe') + '()', msg, []);
}





// ----- Funciones internas / helpers -----

// SECCIÓN 2: RESTO DE FUNCIONES (actualización de hojas de guerra, helpers [→ Contexto_Base_Web.md §17B149]

function _desgloseBarcosPorDia(tag, clanTag, ctx, datosGuerra, barcosHoy) {
  // Resolver el NOMBRE de clan asociado a clanTag (la columna Clan de la [→ Contexto_Base_Web.md §17B150]
  var _clanCacheDesglose  = _getClanCache(clanTag);
  var _clanNombreDesglose = (_clanCacheDesglose && _clanCacheDesglose.info && _clanCacheDesglose.info.name) || '';

  // 1) Acumulado de barcos por periodIndex, para este tag Y este clan, [→ Contexto_Base_Web.md §17B151]
  var porPeriodo = {};
  for (var i = 0; i < datosGuerra.length; i++) {
    var fila = datosGuerra[i];
    if (String(fila[GC.TAG - 1] || '').trim() !== tag) continue;
    if (_clanNombreDesglose && String(fila[GC.CLAN - 1] || '') !== _clanNombreDesglose) continue;
    if (String(fila[GC.TEMPORADA - 1] || '') !== String(ctx.temporada)) continue;
    if (Number(fila[GC.SEMANA - 1] || 0) !== ctx.sectionIndex + 1) continue;
    var pIdxFila = Number(fila[GC.PERIOD_IDX - 1]) || 0;
    porPeriodo[pIdxFila] = Number(fila[GC.BARCOS - 1]) || 0;
  }
  // El valor de HOY (recién leído de la API) siempre manda sobre lo que
  // hubiera quedado guardado en una corrida anterior de este mismo día.
  porPeriodo[ctx.periodIndex] = barcosHoy;

  // 2) Recorrer los días de guerra de la semana actual (offset 3..6 dentro [→ Contexto_Base_Web.md §17B152]
  var inicioSemana = ctx.sectionIndex * 7; // periodIndex del Lunes de esta semana
  var offHoy        = ctx.periodIndex % 7;
  var partes        = [];
  var acumAnterior  = 0;

  for (var off = 3; off <= offHoy && off <= 6; off++) {
    var pIdx = inicioSemana + off;
    // Si no hay dato guardado para ese día puntual (ej. una corrida se
    // saltó ese periodIndex), se asume que el acumulado no cambió ese día.
    var acumEseDia = (porPeriodo[pIdx] !== undefined) ? porPeriodo[pIdx] : acumAnterior;
    var delta = acumEseDia - acumAnterior;
    if (delta > 0) {
      partes.push(periodIdxToLetra(pIdx) + ':' + delta);
    }
    acumAnterior = acumEseDia;
  }

  return partes.join(', ');
}

/**
 * _autocorregirAtaqueDiaAnteriorDecksUsed(tag, clanTag, ctx, datosGuerra, ataqHoyApi, ataqSemApi) [→ Contexto_Base_Web.md §17B153]
 */
function _autocorregirAtaqueDiaAnteriorDecksUsed(tag, clanTag, ctx, datosGuerra, ataqHoyApi, ataqSemApi, fameApi, barcosApi) {
  var offHoyDia = (ctx.periodIndex % 7) - 3; // 0=Jueves..3=Domingo
  if (offHoyDia <= 0) return false; // Jueves (o fuera de día de guerra): no hay día anterior en la misma semana

  // Resolver el NOMBRE de clan asociado a clanTag (la columna Clan de la [→ Contexto_Base_Web.md §17B154]
  var _clanCacheAutocorregir  = _getClanCache(clanTag);
  var _clanNombreAutocorregir = (_clanCacheAutocorregir && _clanCacheAutocorregir.info && _clanCacheAutocorregir.info.name) || '';

  var periodIndexAnterior = ctx.periodIndex - 1;
  var rowIdx = -1;
  /**
   * /* FIX (28-sep-2026, pedido usuario — "el sábado hizo 0 ataques pero el [→ Contexto_Base_Web.md §17B155]
   */
  var sumaAtaquesDiasPrevios = 0;
  var rowIdxBase = -1; // NUEVO (sub-tanda 3.2): fila del dia D-1 (cierra la base de fame/barcos de ayer)
  for (var i = 0; i < datosGuerra.length; i++) {
    var fila = datosGuerra[i];
    if (String(fila[GC.TAG - 1] || '').trim() !== tag) continue;
    if (_clanNombreAutocorregir && String(fila[GC.CLAN - 1] || '') !== _clanNombreAutocorregir) continue;
    if (String(fila[GC.TEMPORADA - 1] || '') !== String(ctx.temporada)) continue;
    if (((Number(fila[GC.SEMANA - 1]) || 1) - 1) !== ctx.sectionIndex) continue;
    var pIdxFilaPrevia = Number(fila[GC.PERIOD_IDX - 1]) || 0;
    if (!esDiaGuerraIdx(pIdxFilaPrevia)) continue;
    if (pIdxFilaPrevia === periodIndexAnterior - 1) rowIdxBase = i;
    if (pIdxFilaPrevia === periodIndexAnterior) { rowIdx = i; continue; }
    if (pIdxFilaPrevia < periodIndexAnterior) sumaAtaquesDiasPrevios += Number(fila[GC.ATAQUES_HOY - 1]) || 0;
  }
  if (rowIdx < 0) return false; // el día anterior todavía no tiene fila (corrida se saltó ese periodo, o es de otro clan)

  /**
   * /* FIX (28-sep-2026, corrección al cálculo anterior — ver comentario del [→ Contexto_Base_Web.md §17B156]
   */
  var huboCambio = false;
  var ataquesRealesDiaAnterior = (ataqSemApi - ataqHoyApi) - sumaAtaquesDiasPrevios;
  var ataquesGuardados = Number(datosGuerra[rowIdx][GC.ATAQUES_HOY - 1]) || 0;
  if (ataquesRealesDiaAnterior > ataquesGuardados) {
    datosGuerra[rowIdx][GC.ATAQUES_HOY - 1] = Math.min(4, ataquesRealesDiaAnterior);
    // Fila "cerrada" que se autocorrige: si nació 'Original', pasa a
    // 'Corregido' (punto 1.5) — si ya era 'Reconstruido', se mantiene.
    var origenActual = String(datosGuerra[rowIdx][GC.ORIGEN - 1] || '').trim();
    if (origenActual === '' || origenActual === 'Original') {
      datosGuerra[rowIdx][GC.ORIGEN - 1] = 'Corregido';
    }
    huboCambio = true;
  }

  // NUEVO (2-oct-2026, Tanda 3, sub-tanda 3.2): cierre de fame, barcos y acumulado
  // semanal de ayer. Solo si el llamador paso fame y barcos (si no, todo igual que antes).
  if (typeof fameApi === 'number' && typeof barcosApi === 'number' && !isNaN(fameApi) && !isNaN(barcosApi)) {
    var filaAyer = datosGuerra[rowIdx];
    var filaBase = rowIdxBase >= 0 ? datosGuerra[rowIdxBase] : null; // sin fila el dia D-1: base 0
    var dec = _decidirCierreFameBarcosDia_({
      apiSem: ataqSemApi, apiHoy: ataqHoyApi, apiFame: fameApi, apiBarcos: barcosApi,
      sumaAtaquesPrevios: sumaAtaquesDiasPrevios,
      guardadoAtaqSem: Number(filaAyer[GC.ATAQUES_SEM - 1]) || 0,
      guardadaFame: Number(filaAyer[GC.FAME - 1]) || 0,
      guardadosBarcos: Number(filaAyer[GC.BARCOS - 1]) || 0,
      baseFame: filaBase ? (Number(filaBase[GC.FAME - 1]) || 0) : 0,
      baseBarcos: filaBase ? (Number(filaBase[GC.BARCOS - 1]) || 0) : 0
    });
    if (dec.accion === 'aplicar') {
      filaAyer[GC.ATAQUES_SEM - 1] = dec.nuevoAtaqSem;
      filaAyer[GC.FAME - 1]        = dec.nuevaFame;
      filaAyer[GC.BARCOS - 1]      = dec.nuevosBarcos;
      var origenCierre = String(filaAyer[GC.ORIGEN - 1] || '').trim();
      if (origenCierre === '' || origenCierre === 'Original') filaAyer[GC.ORIGEN - 1] = 'Corregido';
      Logger.log('[Guerra][Cierre de dia] ' + tag + ' en ' + (_clanNombreAutocorregir || clanTag) +
        ', periodIndex ' + periodIndexAnterior + ': acumulado de ayer corregido (' + dec.motivo + ').' +
        (dec.alarmaTabla ? ' ALARMA: ' + dec.nDia + ' ataque(s), ' + dec.barcosDia + ' barco(s) y fame ' +
          dec.fameDia + ' del dia NO cuadran con la tabla de fame (se escribio igual: es el dato oficial).' : ''));
      huboCambio = true;
    } else if (dec.accion === 'pendiente' || dec.accion === 'alarma') {
      Logger.log('[Guerra][Cierre de dia] ' + (dec.accion === 'alarma' ? 'ALARMA' : 'PENDIENTE') + ': ' + tag +
        ' en ' + (_clanNombreAutocorregir || clanTag) + ', periodIndex ' + periodIndexAnterior + ' -- ' + dec.motivo);
    }
  }
  return huboCambio;
}

/**
 * _decidirCierreFameBarcosDia_(p) [→ Contexto_Base_Web.md §17B157]
 */
function _decidirCierreFameBarcosDia_(p) {
  var apiSem = Number(p.apiSem) || 0, apiHoy = Number(p.apiHoy) || 0;
  var apiFame = Number(p.apiFame) || 0, apiBarcos = Number(p.apiBarcos) || 0;
  var sumaPrev = Number(p.sumaAtaquesPrevios) || 0;
  var gSem = Number(p.guardadoAtaqSem) || 0, gFame = Number(p.guardadaFame) || 0, gBarcos = Number(p.guardadosBarcos) || 0;
  var bFame = Number(p.baseFame) || 0, bBarcos = Number(p.baseBarcos) || 0;

  if (apiHoy < 0 || apiHoy > apiSem) {
    return { accion: 'alarma', motivo: 'contadores incoherentes: decksUsedToday=' + apiHoy + ' y decksUsed=' + apiSem };
  }
  var nCum = apiSem - apiHoy;          // ataques acumulados que de verdad se hicieron hasta el fin de ayer
  var nDia = nCum - sumaPrev;          // ataques de ayer
  if (nDia < 0 || nDia > 4) {
    return { accion: 'alarma', motivo: 'los ataques de ayer salen ' + nDia + ' (decksUsed - decksUsedToday = ' + nCum +
      ', dias previos guardados = ' + sumaPrev + '); fuera de 0 a 4' };
  }
  if (gSem >= nCum) return { accion: 'nada', motivo: 'la fila de ayer ya tiene todos sus ataques' };

  if (apiHoy > 0) {
    return { accion: 'pendiente', nDia: nDia, motivo: 'la fila de ayer quedo con ' + gSem + ' ataque(s) acumulado(s) de ' + nCum +
      ', pero hoy ya hay ' + apiHoy + ' ataque(s) y no se puede separar con certeza su fame ni sus barcos; no se escribe nada' };
  }

  // apiHoy === 0: todo lo nuevo es de ayer. El acumulado de hoy es el de fin de ayer.
  if (apiFame < gFame || apiBarcos < gBarcos) {
    return { accion: 'alarma', nDia: nDia, motivo: 'el acumulado bajo: fame ' + gFame + ' -> ' + apiFame + ', barcos ' + gBarcos + ' -> ' + apiBarcos };
  }
  var fameDia = apiFame - bFame, barcosDia = apiBarcos - bBarcos;
  // Solo una diferencia NEGATIVA bloquea: significa que el acumulado de hoy es menor que el de anteayer. [→ Contexto_Base_Web.md §17B158]
  if (fameDia < 0 || barcosDia < 0) {
    return { accion: 'alarma', nDia: nDia, fameDia: fameDia, barcosDia: barcosDia,
      motivo: 'el acumulado de hoy es menor que el de anteayer: fame ' + apiFame + ' contra ' + bFame +
              ', barcos ' + apiBarcos + ' contra ' + bBarcos };
  }
  var alarmaTabla = false;
  if (typeof _fameEsPosibleDia_ === 'function') alarmaTabla = !_fameEsPosibleDia_(nDia, fameDia, barcosDia);
  return { accion: 'aplicar', nDia: nDia, fameDia: fameDia, barcosDia: barcosDia, alarmaTabla: alarmaTabla,
    nuevoAtaqSem: apiSem, nuevaFame: apiFame, nuevosBarcos: apiBarcos,
    motivo: 'ataques ' + gSem + ' -> ' + apiSem + ', fame ' + gFame + ' -> ' + apiFame + ', barcos ' + gBarcos + ' -> ' + apiBarcos };
}

/**
 * rellenarTemporada2Historico() [→ Contexto_Base_Web.md §17B159]
 */
function rellenarTemporada2Historico() {
  var ss = _getSs();
  var offsetVigente = _getTemporadaOffsetRoyaleApi();
  var rellenadasCsv = 0, rellenadasHoja = 0, origenRellenadoCsv = 0, origenRellenadoHoja = 0;

  // --- Backup_Guerra.csv (histórico completo, todas las temporadas) ---
  var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
  if (csvText) {
    var parsed = _parseCSV(csvText);
    if (parsed && parsed.length > 1) {
      var encabezado = parsed[0];
      var filas = parsed.slice(1);
      for (var i = 0; i < filas.length; i++) {
        var fila = filas[i];
        while (fila.length < GUERRA_TOTAL_COLS) fila.push('');
        if (!String(fila[GC.TEMPORADA_2 - 1] || '').trim()) {
          var temporadaFila = Number(fila[GC.TEMPORADA - 1]) || 0;
          fila[GC.TEMPORADA_2 - 1] = temporadaFila + offsetVigente;
          rellenadasCsv++;
        }
        if (!String(fila[GC.ORIGEN - 1] || '').trim()) {
          fila[GC.ORIGEN - 1] = 'Original';
          origenRellenadoCsv++;
        }
      }
      if (rellenadasCsv > 0 || origenRellenadoCsv > 0) {
        var salida = [encabezado].concat(filas);
        _saveCSVToDrive('Backup_Guerra.csv', _encodeCSV(salida));
      }
    }
  }

  // --- Hoja Guerra (solo puede tener filas de la temporada vigente) ---
  var sh = ss.getSheetByName(CFG.SHEETS.GUERRA);
  if (sh && sh.getLastRow() >= 2) {
    var lastRow = sh.getLastRow();
    var data = sh.getRange(2, 1, lastRow - 1, GUERRA_TOTAL_COLS).getValues();
    var huboCambioHoja = false;
    for (var r = 0; r < data.length; r++) {
      if (!String(data[r][GC.TEMPORADA_2 - 1] || '').trim()) {
        var temporadaFilaH = Number(data[r][GC.TEMPORADA - 1]) || 0;
        data[r][GC.TEMPORADA_2 - 1] = temporadaFilaH + offsetVigente;
        rellenadasHoja++;
        huboCambioHoja = true;
      }
      if (!String(data[r][GC.ORIGEN - 1] || '').trim()) {
        data[r][GC.ORIGEN - 1] = 'Original';
        origenRellenadoHoja++;
        huboCambioHoja = true;
      }
    }
    if (huboCambioHoja) {
      sh.getRange(2, 1, data.length, GUERRA_TOTAL_COLS).setValues(data);
      _syncGuerraCSV(sh); // propaga también a Backup_Guerra.csv
    }
  }

  Logger.log('[Migración Temporada_2] Offset usado: ' + offsetVigente + '. ' +
    'Backup_Guerra.csv: ' + rellenadasCsv + ' fila(s) con Temporada_2 rellenada, ' +
    origenRellenadoCsv + ' con Origen rellenado. ' +
    'Hoja Guerra: ' + rellenadasHoja + ' fila(s) con Temporada_2 rellenada, ' +
    origenRellenadoHoja + ' con Origen rellenado.');
}

/**
 * repararAtaquesHoyGuerraInforme() / repararAtaquesHoyGuerraAplicar() [→ Contexto_Base_Web.md §17B160]
 */
function repararAtaquesHoyGuerraInforme() { _repararAtaquesHoyGuerra_(false); }
function repararAtaquesHoyGuerraAplicar() { _repararAtaquesHoyGuerra_(true); }

/**
 * _calcularReparacionAtaquesHoy_(filas) [→ Contexto_Base_Web.md §17B161]
 */
function _calcularReparacionAtaquesHoy_(filas) {
  var grupos = {};
  for (var i = 0; i < filas.length; i++) {
    var f = filas[i];
    var tag = String(f[GC.TAG - 1] || '').trim();
    if (!tag) continue;
    var pIdx = Number(f[GC.PERIOD_IDX - 1]);
    if (isNaN(pIdx) || !esDiaGuerraIdx(pIdx)) continue;
    var clave = tag + '|' + String(f[GC.CLAN - 1] || '') + '|' + String(f[GC.TEMPORADA - 1] || '') + '|' + String(f[GC.SEMANA - 1] || '');
    if (!grupos[clave]) grupos[clave] = [];
    grupos[clave].push(i);
  }

  var cambios = [], sinResolver = [], gruposConExceso = 0;
  Object.keys(grupos).forEach(function (clave) {
    var idxs = grupos[clave].slice().sort(function (a, b) {
      return Number(filas[a][GC.PERIOD_IDX - 1]) - Number(filas[b][GC.PERIOD_IDX - 1]);
    });

    var coherente = true, motivo = '';
    var S = [], H = [];
    for (var k = 0; k < idxs.length; k++) {
      var fila = filas[idxs[k]];
      var sRaw = fila[GC.ATAQUES_SEM - 1], hRaw = fila[GC.ATAQUES_HOY - 1];
      var s = (sRaw === '' || sRaw === null || sRaw === undefined) ? NaN : Number(sRaw);
      var h = (hRaw === '' || hRaw === null || hRaw === undefined) ? 0 : Number(hRaw);
      if (isNaN(s) || isNaN(h)) { coherente = false; motivo = 'AtaquesSemana o AtaquesHoy vacio/no numerico'; break; }
      if (k > 0 && Number(fila[GC.PERIOD_IDX - 1]) === Number(filas[idxs[k - 1]][GC.PERIOD_IDX - 1])) {
        coherente = false; motivo = 'dos filas del mismo dia'; break;
      }
      if (k > 0 && s < S[k - 1]) { coherente = false; motivo = 'AtaquesSemana baja de un dia al siguiente (cambio de clan o reinicio)'; break; }
      S.push(s); H.push(h);
    }

    var sumaH = 0, maxS = 0;
    if (coherente) {
      for (var m = 0; m < H.length; m++) sumaH += H[m];
      maxS = S.length ? S[S.length - 1] : 0;
    } else {
      // Sin datos coherentes solo se puede saber si HAY sospecha por la suma cruda.
      for (var q = 0; q < idxs.length; q++) {
        sumaH += Number(filas[idxs[q]][GC.ATAQUES_HOY - 1]) || 0;
        var sq = Number(filas[idxs[q]][GC.ATAQUES_SEM - 1]);
        if (!isNaN(sq) && sq > maxS) maxS = sq;
      }
    }
    var total = Math.min(16, maxS);
    if (sumaH <= total) return; // sin evidencia de inflacion en esta semana
    gruposConExceso++;
    if (!coherente) {
      sinResolver.push({ clave: clave, motivo: motivo, sumaAntes: sumaH, total: total, excesoRestante: sumaH - total, idxs: idxs });
      return;
    }

    var exceso = sumaH - total;
    var propuestos = [];
    for (var j = 0; j < idxs.length && exceso > 0; j++) {
      var fj = filas[idxs[j]];
      if (!_origenGuerraEs_(fj[GC.ORIGEN - 1], 'Corregido')) continue;
      var subida = S[j] - (j > 0 ? S[j - 1] : 0);
      var posible = H[j] - Math.max(0, subida);
      if (posible <= 0) continue;
      var quitar = Math.min(posible, exceso);
      propuestos.push({ idx: idxs[j], anterior: H[j], nuevo: H[j] - quitar, total: total, sumaAntes: sumaH, subida: subida });
      exceso -= quitar;
    }
    if (exceso > 0) {
      sinResolver.push({ clave: clave, motivo: 'el exceso no se puede quitar solo de filas Corregido', sumaAntes: sumaH, total: total, excesoRestante: exceso, idxs: idxs });
      return; // no se aplica nada parcial en una semana sin resolver
    }
    propuestos.forEach(function (c) { cambios.push(c); });
  });
  return { cambios: cambios, sinResolver: sinResolver, gruposConExceso: gruposConExceso };
}

function _repararAtaquesHoyGuerra_(aplicar) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { Logger.log('[ReparoAtaquesHoy] Hay otra ejecucion en curso; se cancela para no pisar datos. Reintentar en unos minutos.'); return; }
  try {
    var t0 = Date.now();
    var ss = _getSs();
    var marca = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH.mm.ss');
    var etiqueta = aplicar ? 'APLICAR' : 'SOLO INFORMAR';
    var informe = [['Fuente', 'Tipo', 'Temporada', 'Semana', 'Tag', 'Nombre', 'Clan', 'PeriodIndex', 'AtaquesHoy anterior', 'AtaquesHoy nuevo', 'AtaquesSemana de la fila', 'Total semanal (max AtaquesSemana, tope 16)', 'Suma AtaquesHoy antes', 'Detalle']];
    var resumen = { csvCambios: 0, csvSinResolver: 0, hojaCambios: 0, hojaSinResolver: 0 };

    var agregarAlInforme = function (fuente, filas, res) {
      res.cambios.forEach(function (c) {
        var f = filas[c.idx];
        informe.push([fuente, 'Cambio', f[GC.TEMPORADA - 1], f[GC.SEMANA - 1], f[GC.TAG - 1], f[GC.NOMBRE - 1], f[GC.CLAN - 1], f[GC.PERIOD_IDX - 1], c.anterior, c.nuevo, f[GC.ATAQUES_SEM - 1], c.total, c.sumaAntes, 'Sube ' + c.subida + ' contra la fila anterior']);
      });
      res.sinResolver.forEach(function (s) {
        var f = filas[s.idxs[0]];
        informe.push([fuente, 'SIN RESOLVER', f[GC.TEMPORADA - 1], f[GC.SEMANA - 1], f[GC.TAG - 1], f[GC.NOMBRE - 1], f[GC.CLAN - 1], '', '', '', '', s.total, s.sumaAntes, s.motivo + ' (exceso ' + s.excesoRestante + ')']);
      });
    };

    // --- Backup_Guerra.csv (todas las temporadas) ---
    var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
    var encabezadoCsv = null, filasCsv = null, resCsv = null;
    if (csvText) {
      var parsed = _parseCSV(csvText);
      if (parsed && parsed.length > 1) {
        encabezadoCsv = parsed[0];
        filasCsv = parsed.slice(1);
        for (var a = 0; a < filasCsv.length; a++) { while (filasCsv[a].length < GUERRA_TOTAL_COLS) filasCsv[a].push(''); }
        resCsv = _calcularReparacionAtaquesHoy_(filasCsv);
        agregarAlInforme('Backup_Guerra.csv', filasCsv, resCsv);
        resumen.csvCambios = resCsv.cambios.length;
        resumen.csvSinResolver = resCsv.sinResolver.length;
      }
    }

    // --- Hoja Guerra (temporada vigente) ---
    var sh = ss.getSheetByName(CFG.SHEETS.GUERRA);
    var datosHoja = null, resHoja = null;
    if (sh && sh.getLastRow() >= 2) {
      datosHoja = sh.getRange(2, 1, sh.getLastRow() - 1, GUERRA_TOTAL_COLS).getValues();
      resHoja = _calcularReparacionAtaquesHoy_(datosHoja);
      agregarAlInforme('Hoja Guerra', datosHoja, resHoja);
      resumen.hojaCambios = resHoja.cambios.length;
      resumen.hojaSinResolver = resHoja.sinResolver.length;
    }

    var nombreInforme = 'Reparacion_AtaquesHoy_Guerra ' + marca + ' (' + (aplicar ? 'aplicado' : 'informe') + ').csv';
    if (informe.length > 1) _saveCSVToDrive(nombreInforme, _encodeCSV(informe));

    if (aplicar && (resumen.csvCambios > 0 || resumen.hojaCambios > 0)) {
      // Respaldo previo del CSV completo, ANTES de escribir nada.
      if (csvText) _saveCSVToDrive('Backup_Guerra ANTES de reparar AtaquesHoy ' + marca + '.csv', csvText);

      if (resCsv && resCsv.cambios.length) {
        resCsv.cambios.forEach(function (c) { filasCsv[c.idx][GC.ATAQUES_HOY - 1] = String(c.nuevo); });
        _saveCSVToDrive('Backup_Guerra.csv', _encodeCSV([encabezadoCsv].concat(filasCsv)));
      }
      if (resHoja && resHoja.cambios.length) {
        // Solo la columna AtaquesHoy: no se reescriben Fecha ni el resto de columnas.
        var col = datosHoja.map(function (r) { return [r[GC.ATAQUES_HOY - 1]]; });
        resHoja.cambios.forEach(function (c) { col[c.idx][0] = c.nuevo; });
        sh.getRange(2, GC.ATAQUES_HOY, col.length, 1).setValues(col);
        _syncGuerraCSV(sh); // propaga la hoja al CSV, igual que rellenarTemporada2Historico()
      }
    }

    Logger.log('[ReparoAtaquesHoy] ' + etiqueta + ' (' + Math.round((Date.now() - t0) / 1000) + ' s). ' +
      'Backup_Guerra.csv: ' + resumen.csvCambios + ' fila(s) a bajar, ' + resumen.csvSinResolver + ' semana(s) sin resolver. ' +
      'Hoja Guerra: ' + resumen.hojaCambios + ' fila(s) a bajar, ' + resumen.hojaSinResolver + ' semana(s) sin resolver. ' +
      (informe.length > 1 ? 'Detalle en Drive: ' + nombreInforme + '.' : 'No hay nada que reparar.') +
      (aplicar ? '' : ' (No se escribio nada; correr repararAtaquesHoyGuerraAplicar() para aplicar.)'));
  } finally {
    lock.releaseLock();
  }
}

/**
 * repararAtaquesHoyGuerraDesdeJSONInforme() / repararAtaquesHoyGuerraDesdeJSONAplicar() [→ Contexto_Base_Web.md §17B162]
 */
var REPARAR_JSON_LIMITE_MS = 270000;
var REPARAR_JSON_NOMBRE_DIA = { 3: 'jueves', 4: 'viernes', 5: 'sabado', 6: 'domingo' };

function repararAtaquesHoyGuerraDesdeJSONInforme() { _repararAtaquesHoyGuerraDesdeJSON_(false); }
function repararAtaquesHoyGuerraDesdeJSONAplicar() { _repararAtaquesHoyGuerraDesdeJSON_(true); }

/**
 * _calcularAtaquesDiariosDesdeJSON_(dias) [→ Contexto_Base_Web.md §17B163]
 */
function _calcularAtaquesDiariosDesdeJSON_(dias) {
  var offs = [4, 5, 6], k;
  for (var i = 0; i < offs.length; i++) {
    k = offs[i];
    var x = dias[k];
    if (!x || !isFinite(x.d) || !isFinite(x.t) || x.d < 0 || x.t < 0) return { ok: false, motivo: 'datos vacios o no numericos en el JSON del ' + REPARAR_JSON_NOMBRE_DIA[k] };
    if (x.t > 4) return { ok: false, motivo: 'decksUsedToday mayor a 4 en el JSON del ' + REPARAR_JSON_NOMBRE_DIA[k] + ' (' + x.t + ')' };
    if (x.t > x.d) return { ok: false, motivo: 'decksUsedToday mayor que decksUsed en el JSON del ' + REPARAR_JSON_NOMBRE_DIA[k] };
  }
  if (dias[5].d < dias[4].d || dias[6].d < dias[5].d) return { ok: false, motivo: 'decksUsed baja de un dia al siguiente en los JSON (cambio de clan o reinicio)' };
  var e4 = dias[4].d - dias[4].t, e5 = dias[5].d - dias[5].t, e6 = dias[6].d - dias[6].t;
  var diario = { 3: e4, 4: e5 - e4, 5: e6 - e5, 6: dias[6].t };
  for (k = 3; k <= 6; k++) {
    if (diario[k] < 0 || diario[k] > 4) return { ok: false, motivo: 'los JSON dan ' + diario[k] + ' ataques el ' + REPARAR_JSON_NOMBRE_DIA[k] + ' (fuera de 0-4)' };
  }
  return { ok: true, motivo: '', diario: diario, acumulado: { 3: e4, 4: e5, 5: e6, 6: dias[6].d }, domingoCompleto: dias[6].t >= 4 };
}

/**
 * _calcularReparacionDesdeJSON_(filas, grupos, leerDia) [→ Contexto_Base_Web.md §17B164]
 */
function _calcularReparacionDesdeJSON_(filas, grupos, leerDia) {
  var cambios = [], sinResolver = [], avisos = [], resueltos = 0, domingosIncompletos = 0;
  grupos.forEach(function (g) {
    var idxs = g.idxs, f0 = filas[idxs[0]];
    var tag = String(f0[GC.TAG - 1] || '').trim().toUpperCase();
    var clan = String(f0[GC.CLAN - 1] || '');
    var temp = Number(f0[GC.TEMPORADA - 1]), semana = Number(f0[GC.SEMANA - 1]);
    var base = 7 * (semana - 1);
    if (!tag || isNaN(temp) || isNaN(semana) || semana < 1) { sinResolver.push({ idx0: idxs[0], clave: g.clave, motivo: 'fila sin tag, temporada o semana validos' }); return; }

    var dias = {}, motivoFalta = '', capturas = [];
    [4, 5, 6].forEach(function (off) {
      var r = leerDia(clan, temp, base + off, tag) || { estado: 'sin_json' };
      if (r.estado === 'ok') {
        dias[off] = { d: Number(r.d), t: Number(r.t) };
        capturas.push(REPARAR_JSON_NOMBRE_DIA[off] + (r.hora ? ' ' + r.hora : '') + (r.nota ? ' [' + r.nota + ']' : ''));
        return;
      }
      if (motivoFalta) return;
      var nd = REPARAR_JSON_NOMBRE_DIA[off];
      if (r.estado === 'ausente') motivoFalta = 'el jugador no aparece en el JSON del ' + nd;
      else if (r.estado === 'indice_distinto') motivoFalta = 'ningun JSON del ' + nd + ' trae ese periodIndex en su contenido' + (r.motivo ? ' (' + r.motivo + ')' : '');
      else if (r.estado === 'incoherente') motivoFalta = 'JSON del ' + nd + ' incoherente: ' + (r.motivo || 'datos de otro periodo');
      else if (r.estado === 'tiempo') motivoFalta = 'sin procesar: se acabo el tiempo (volver a correr)';
      else motivoFalta = 'no hay JSON del ' + nd + ' para este clan';
    });
    if (motivoFalta) { sinResolver.push({ idx0: idxs[0], clave: g.clave, motivo: motivoFalta }); return; }

    var calc = _calcularAtaquesDiariosDesdeJSON_(dias);
    if (!calc.ok) { sinResolver.push({ idx0: idxs[0], clave: g.clave, motivo: calc.motivo }); return; }

    // El AtaquesSemana de la fila del domingo puede venir de una correccion de RoyaleAPI (se guarda ahi el total semanal [→ Contexto_Base_Web.md §17B165]
    var contradiccion = '';
    idxs.forEach(function (ix) {
      var fx = filas[ix];
      if (Number(fx[GC.PERIOD_IDX - 1]) - base !== 6) return;
      var sx = fx[GC.ATAQUES_SEM - 1];
      if (sx === '' || sx === null || sx === undefined || !isFinite(Number(sx))) return;
      var dx = Number(sx) - calc.acumulado[5];
      if (dx > 4) contradiccion = 'el AtaquesSemana de la fila del domingo (' + Number(sx) + ') supera en ' + dx + ' al acumulado del sabado del JSON (' + calc.acumulado[5] + '): posible correccion de RoyaleAPI, revisar a mano';
    });
    if (contradiccion) { sinResolver.push({ idx0: idxs[0], clave: g.clave, motivo: contradiccion }); return; }

    resueltos++;
    var offsConFila = {};
    idxs.forEach(function (ix) {
      var f = filas[ix];
      var off = Number(f[GC.PERIOD_IDX - 1]) - base;
      if (off < 3 || off > 6) return;
      offsConFila[off] = true;
      var hRaw = f[GC.ATAQUES_HOY - 1], sRaw = f[GC.ATAQUES_SEM - 1];
      var hAnt = (hRaw === '' || hRaw === null || hRaw === undefined) ? 0 : Number(hRaw);
      var sAnt = (sRaw === '' || sRaw === null || sRaw === undefined) ? '' : Number(sRaw);
      var hNuevo = calc.diario[off], sNuevo = calc.acumulado[off], nota = '';
      if (off === 6) {
        if (!calc.domingoCompleto) { domingosIncompletos++; nota = 'Domingo incompleto en el ultimo JSON (' + hNuevo + ' de 4): pudo atacar despues de la ultima captura. '; }
        // La evidencia de la fila es su AtaquesSemana (decksUsed real de la API), NO su AtaquesHoy (es lo que estaba inflado).
        var deSemana = (sAnt !== '' && isFinite(sAnt)) ? sAnt - calc.acumulado[5] : -1;
        if (deSemana > hNuevo && deSemana <= 4) { hNuevo = deSemana; sNuevo = calc.acumulado[5] + hNuevo; nota += 'Se conserva el domingo que sale del AtaquesSemana de la fila (' + deSemana + '), mayor que el del JSON. '; }
      }
      if (hNuevo === hAnt && sAnt !== '' && sNuevo === sAnt) return; // ya coincide
      cambios.push({ idx: ix, off: off, hAnt: hAnt, hNuevo: hNuevo, sAnt: sAnt, sNuevo: sNuevo,
        detalle: nota + 'JSON: ' + REPARAR_JSON_NOMBRE_DIA[off] + ' ' + calc.diario[off] + ' ataque(s), acumulado ' + calc.acumulado[off] +
          '. Ultima captura de cada dia (hora Lima del nombre): ' + capturas.join(' | ') });
    });
    for (var o = 3; o <= 6; o++) {
      if (!offsConFila[o] && calc.diario[o] > 0) avisos.push({ idx0: idxs[0], detalle: 'Falta la fila del ' + REPARAR_JSON_NOMBRE_DIA[o] + ' y el JSON indica ' + calc.diario[o] + ' ataque(s) ese dia (no se crean filas)' });
    }
  });
  return { cambios: cambios, sinResolver: sinResolver, avisos: avisos, resueltos: resueltos, domingosIncompletos: domingosIncompletos };
}

/**
 * _crearLectorDiaJSONGuerra_(t0) [→ Contexto_Base_Web.md §17B166]
 */
function _crearLectorDiaJSONGuerra_(t0) {
  var indices = {}, jsons = {}, agotado = false;
  function indiceDeClan(claveClan) {
    if (indices[claveClan] !== undefined) return indices[claveClan];
    var idCarpeta = _SUBCARPETAS_CLAN_POR_ENDPOINT_CURRENTRIVERRACE_[claveClan];
    var idx = null;
    if (idCarpeta) {
      idx = {};
      try {
        var it = _archivosConSubcarpetas_(DriveApp.getFolderById(idCarpeta)); // PF074: incluye subcarpetas de temporada y semana
        while (it.hasNext()) {
          var f = it.next(), nombre = f.getName();
          var m = /^T-(\d+)\s+S-(\d+)\s+P\.I-(\d+)(?:-[LMXJVSD])?\s.*- currentriverrace\.json$/i.exec(nombre);
          if (!m) continue;
          var mFh = /(\d{2})-(\d{2})-(\d{4})\s+(\d{2})\.(\d{2})/.exec(nombre);
          var h = mFh ? Number(mFh[3] + mFh[2] + mFh[1] + mFh[4] + mFh[5]) : 0;
          var hora = mFh ? (mFh[1] + '-' + mFh[2] + ' ' + mFh[4] + '.' + mFh[5]) : '';
          var k = Number(m[1]) + '|' + Number(m[3]);
          if (!idx[k] || h > idx[k].h) idx[k] = { f: f, h: h, hora: hora, nombre: nombre };
        }
      } catch (e) { Logger.log('[ReparoAtaquesHoyJSON] No se pudo listar la carpeta de ' + claveClan + ': ' + e.message); idx = null; }
    }
    indices[claveClan] = idx;
    return idx;
  }
  // Abre (una sola vez) el archivo de indice `pNombre` y devuelve lo que dice su CONTENIDO.
  function abrir(claveClan, temporada, pNombre, reg) {
    var kj = claveClan + '|' + Number(temporada) + '|' + Number(pNombre);
    if (jsons[kj] === undefined) {
      try {
        var obj = JSON.parse(reg.f.getBlob().getDataAsString('UTF-8'));
        var mapa = {}, parts = (obj.clan && obj.clan.participants) ? obj.clan.participants : [];
        for (var i = 0; i < parts.length; i++) {
          var tg = String(parts[i].tag || '').trim().toUpperCase();
          if (tg) mapa[tg] = { d: Number(parts[i].decksUsed) || 0, t: Number(parts[i].decksUsedToday) || 0, f: Number(parts[i].fame) || 0 };
        }
        jsons[kj] = { periodIndex: Number(obj.periodIndex), sectionIndex: (obj.sectionIndex === undefined || obj.sectionIndex === null) ? null : Number(obj.sectionIndex),
          periodType: obj.periodType ? String(obj.periodType) : '', mapa: mapa };
      } catch (e) { Logger.log('[ReparoAtaquesHoyJSON] JSON ilegible ' + reg.nombre + ': ' + e.message); jsons[kj] = null; }
    }
    return jsons[kj];
  }
  return {
    agotado: function () { return agotado; },
    // El periodIndex REAL de una captura es el que trae su contenido (obj.periodIndex), no el del nombre: el nombre [→ Contexto_Base_Web.md §17B167]
    leer: function (clan, temporada, periodIdx, tag) {
      if (Date.now() - t0 > REPARAR_JSON_LIMITE_MS) { agotado = true; return { estado: 'tiempo' }; }
      var claveClan = _normalizarNombreClan_(clan);
      var idx = indiceDeClan(claveClan);
      if (!idx) return { estado: 'sin_json' };
      var pedido = Number(periodIdx), candidatos = [pedido, pedido + 1, pedido - 1];
      var hayAlguno = false, vistos = [], elegido = null, motivoIncoh = '';
      for (var c = 0; c < candidatos.length && !elegido; c++) {
        var pn = candidatos[c];
        if (pn < 0) continue;
        var reg = idx[Number(temporada) + '|' + pn];
        if (!reg) continue;
        hayAlguno = true;
        var j = abrir(claveClan, temporada, pn, reg);
        if (j === null) continue;
        if (j.periodIndex !== pedido) { vistos.push('P.I-' + pn + ' dice ' + j.periodIndex); continue; }
        if (j.sectionIndex !== null && j.sectionIndex !== Math.floor(pedido / 7)) { motivoIncoh = 'sectionIndex ' + j.sectionIndex + ' no corresponde a la semana ' + (Math.floor(pedido / 7) + 1); continue; }
        if (j.periodType && j.periodType.toLowerCase() === 'training') { motivoIncoh = 'periodType training en un dia de guerra'; continue; }
        elegido = { j: j, reg: reg, pn: pn };
      }
      if (!elegido) {
        if (motivoIncoh) return { estado: 'incoherente', motivo: motivoIncoh };
        if (!hayAlguno) return { estado: 'sin_json' };
        return { estado: 'indice_distinto', motivo: vistos.join('; ') };
      }
      var p = elegido.j.mapa[String(tag).trim().toUpperCase()];
      if (!p) return { estado: 'ausente' };
      return { estado: 'ok', d: p.d, t: p.t, f: p.f, hora: elegido.reg.hora,
        nota: elegido.pn !== pedido ? 'archivo nombrado P.I-' + elegido.pn + ' pero su contenido dice P.I-' + pedido : '' };
    }
  };
}

function _repararAtaquesHoyGuerraDesdeJSON_(aplicar) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { Logger.log('[ReparoAtaquesHoyJSON] Hay otra ejecucion en curso; se cancela para no pisar datos. Reintentar en unos minutos.'); return; }
  try {
    var t0 = Date.now();
    var ss = _getSs();
    var marca = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH.mm.ss');
    var etiqueta = aplicar ? 'APLICAR' : 'SOLO INFORMAR';
    var informe = [['Fuente', 'Tipo', 'Temporada', 'Semana', 'Tag', 'Nombre', 'Clan', 'PeriodIndex', 'AtaquesHoy anterior', 'AtaquesHoy nuevo', 'AtaquesSemana anterior', 'AtaquesSemana nueva', 'Detalle', 'Origen anterior']];
    var lector = _crearLectorDiaJSONGuerra_(t0);
    var resumen = { csvCambios: 0, csvSinResolver: 0, csvResueltos: 0, hojaCambios: 0, hojaSinResolver: 0, hojaResueltos: 0, domingos: 0, avisos: 0 };

    var agregarAlInforme = function (fuente, filas, res) {
      res.cambios.forEach(function (c) {
        var f = filas[c.idx];
        informe.push([fuente, 'Cambio', f[GC.TEMPORADA - 1], f[GC.SEMANA - 1], f[GC.TAG - 1], f[GC.NOMBRE - 1], f[GC.CLAN - 1], f[GC.PERIOD_IDX - 1], c.hAnt, c.hNuevo, c.sAnt, c.sNuevo, c.detalle, f[GC.ORIGEN - 1]]);
      });
      res.sinResolver.forEach(function (s) {
        var f = filas[s.idx0];
        informe.push([fuente, 'SIN RESOLVER', f[GC.TEMPORADA - 1], f[GC.SEMANA - 1], f[GC.TAG - 1], f[GC.NOMBRE - 1], f[GC.CLAN - 1], '', '', '', '', '', s.motivo]);
      });
      res.avisos.forEach(function (a) {
        var f = filas[a.idx0];
        informe.push([fuente, 'Aviso', f[GC.TEMPORADA - 1], f[GC.SEMANA - 1], f[GC.TAG - 1], f[GC.NOMBRE - 1], f[GC.CLAN - 1], '', '', '', '', '', a.detalle]);
      });
    };

    // --- Backup_Guerra.csv (todas las temporadas) ---
    var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
    var encabezadoCsv = null, filasCsv = null, resCsv = null;
    if (csvText) {
      var parsed = _parseCSV(csvText);
      if (parsed && parsed.length > 1) {
        encabezadoCsv = parsed[0];
        filasCsv = parsed.slice(1);
        for (var a = 0; a < filasCsv.length; a++) { while (filasCsv[a].length < GUERRA_TOTAL_COLS) filasCsv[a].push(''); }
        var previoCsv = _calcularReparacionAtaquesHoy_(filasCsv);
        resCsv = _calcularReparacionDesdeJSON_(filasCsv, previoCsv.sinResolver, lector.leer);
        agregarAlInforme('Backup_Guerra.csv', filasCsv, resCsv);
        resumen.csvCambios = resCsv.cambios.length; resumen.csvSinResolver = resCsv.sinResolver.length; resumen.csvResueltos = resCsv.resueltos;
        resumen.domingos += resCsv.domingosIncompletos; resumen.avisos += resCsv.avisos.length;
      }
    }

    // --- Hoja Guerra (temporada vigente) ---
    var sh = ss.getSheetByName(CFG.SHEETS.GUERRA);
    var datosHoja = null, resHoja = null;
    if (sh && sh.getLastRow() >= 2) {
      datosHoja = sh.getRange(2, 1, sh.getLastRow() - 1, GUERRA_TOTAL_COLS).getValues();
      var previoHoja = _calcularReparacionAtaquesHoy_(datosHoja);
      resHoja = _calcularReparacionDesdeJSON_(datosHoja, previoHoja.sinResolver, lector.leer);
      agregarAlInforme('Hoja Guerra', datosHoja, resHoja);
      resumen.hojaCambios = resHoja.cambios.length; resumen.hojaSinResolver = resHoja.sinResolver.length; resumen.hojaResueltos = resHoja.resueltos;
      resumen.domingos += resHoja.domingosIncompletos; resumen.avisos += resHoja.avisos.length;
    }

    var nombreInforme = 'Reparacion_AtaquesHoy_Guerra_JSON ' + marca + ' (' + (aplicar ? 'aplicado' : 'informe') + ').csv';
    if (informe.length > 1) _saveCSVToDrive(nombreInforme, _encodeCSV(informe));

    if (aplicar && (resumen.csvCambios > 0 || resumen.hojaCambios > 0)) {
      // Respaldo previo del CSV completo, ANTES de escribir nada.
      if (csvText) _saveCSVToDrive('Backup_Guerra ANTES de reparar AtaquesHoy desde JSON ' + marca + '.csv', csvText);

      if (resCsv && resCsv.cambios.length) {
        resCsv.cambios.forEach(function (c) {
          var fila = filasCsv[c.idx];
          fila[GC.ATAQUES_HOY - 1] = String(c.hNuevo);
          fila[GC.ATAQUES_SEM - 1] = String(c.sNuevo);
          var og = String(fila[GC.ORIGEN - 1] || '').trim();
          if (og === '' || og === 'Original') fila[GC.ORIGEN - 1] = 'Corregido';
        });
        _saveCSVToDrive('Backup_Guerra.csv', _encodeCSV([encabezadoCsv].concat(filasCsv)));
      }
      if (resHoja && resHoja.cambios.length) {
        // Solo AtaquesHoy, AtaquesSemana y Origen: no se reescribe el resto de columnas.
        var colAtaques = datosHoja.map(function (r) { return [r[GC.ATAQUES_HOY - 1], r[GC.ATAQUES_SEM - 1]]; });
        var colOrigen = datosHoja.map(function (r) { return [r[GC.ORIGEN - 1]]; });
        resHoja.cambios.forEach(function (c) {
          colAtaques[c.idx][0] = c.hNuevo;
          colAtaques[c.idx][1] = c.sNuevo;
          var og = String(colOrigen[c.idx][0] || '').trim();
          if (og === '' || og === 'Original') colOrigen[c.idx][0] = 'Corregido';
        });
        sh.getRange(2, GC.ATAQUES_HOY, colAtaques.length, 2).setValues(colAtaques);
        sh.getRange(2, GC.ORIGEN, colOrigen.length, 1).setValues(colOrigen);
        _syncGuerraCSV(sh); // propaga la hoja al CSV, igual que repararAtaquesHoyGuerraAplicar()
      }
    }

    Logger.log('[ReparoAtaquesHoyJSON] ' + etiqueta + ' (' + Math.round((Date.now() - t0) / 1000) + ' s). ' +
      'Backup_Guerra.csv: ' + resumen.csvResueltos + ' semana(s) resueltas, ' + resumen.csvCambios + ' fila(s) a cambiar, ' + resumen.csvSinResolver + ' sin resolver. ' +
      'Hoja Guerra: ' + resumen.hojaResueltos + ' semana(s) resueltas, ' + resumen.hojaCambios + ' fila(s) a cambiar, ' + resumen.hojaSinResolver + ' sin resolver. ' +
      'Domingos incompletos: ' + resumen.domingos + '. Avisos de filas faltantes: ' + resumen.avisos + '. ' +
      (informe.length > 1 ? 'Detalle en Drive: ' + nombreInforme + '.' : 'No hay nada que reparar.') +
      (lector.agotado() ? ' SE ACABO EL TIEMPO: volver a correr para seguir con las semanas pendientes.' : '') +
      (aplicar ? '' : ' (No se escribio nada; correr repararAtaquesHoyGuerraDesdeJSONAplicar() para aplicar.)'));
  } finally {
    lock.releaseLock();
  }
}

// ==============================================================================
// REPARACION UNICA DE LA FAMA DEL DOMINGO DESDE LOS JSON (11-oct-2026) [→ Contexto_Base_Web.md §PF031]
// Caso: domingo 04-oct-2026 (T5 S4, periodIndex 27, coliseo). El reinicio de la API del lunes 05-oct dejo
// Fame = 0 en filas que si tenian ataques. Se repone SOLO la columna Fame (y Origen) desde la ultima captura
// currentriverrace de ese periodIndex, y solo cuando los mazos del JSON coinciden con AtaquesSemana de la fila.
// Primero correr ...Informe() (no escribe en la hoja ni en el CSV), revisar el CSV del informe en Drive y luego ...Aplicar().
// Los domingos anteriores (05/07, 02/08 y 30/08) se reparan con las funciones repararFamaDomingosAnteriores...() de abajo [→ Contexto_Base_Web.md §PF045].
// ==============================================================================
var REPARAR_FAMA_DOMINGO_TEMPORADA = 5;
var REPARAR_FAMA_DOMINGO_PERIODINDEX = 27;

function repararFamaDomingoDesdeJSONInforme() { _repararFamaDomingoDesdeJSON_(false); }
function repararFamaDomingoDesdeJSONAplicar() { _repararFamaDomingoDesdeJSON_(true); }

// DOMINGOS ANTERIORES (11-oct-2026) [→ Contexto_Base_Web.md §PF045]
// Domingos 05/07 (T2, periodIndex 34), 02/08 (T3, 27) y 30/08 (T4, 27). Ademas de las filas con Fame 0 y ataques > 0 (caso de PF031), repara
// las filas con Fame, AtaquesSemana y AtaquesHoy los tres en 0 cuyo sabado (mismo jugador y clan, periodIndex - 1) ya traia datos: la fama y los
// ataques semanales son acumulados y no pueden bajar a 0. En esas filas repone tambien AtaquesSemana y AtaquesHoy. Las capturas JSON del
// domingo deben estar en la carpeta de Drive de cada clan. Primero ...Informe(), revisar el CSV en Drive y luego ...Aplicar().
var REPARAR_FAMA_DOMINGOS_ANTERIORES = [[2, 34], [3, 27], [4, 27]];
var REPARAR_FAMA_TOPE_MEDALLAS_DIA = 900;

function repararFamaDomingosAnterioresInforme() { _repararFamaDomingoDesdeJSON_(false, REPARAR_FAMA_DOMINGOS_ANTERIORES); }
function repararFamaDomingosAnterioresAplicar() { _repararFamaDomingoDesdeJSON_(true, REPARAR_FAMA_DOMINGOS_ANTERIORES); }

/**
 * _calcularReparacionFamaDomingo_(filas, temporada, periodIdx, leerDia, opciones) [→ Contexto_Base_Web.md §PF031 y §PF045]
 * Funcion pura (sin Drive ni hoja): recibe las filas y el lector de dias, devuelve { cambios, sinResolver }.
 * Caso A (PF031): filas de esa temporada y periodIndex con Fame = 0 y AtaquesSemana > 0. Se repone solo la fama si el JSON trae fama > 0,
 * sus mazos (decksUsed) igualan AtaquesSemana de la fila y la fama no queda por debajo de la del sabado de la misma hoja.
 * Caso B (PF045, solo con opciones.ceroTotal): Fame = 0, AtaquesSemana = 0 y AtaquesHoy = 0, pero el sabado del mismo jugador y clan
 * (periodIndex - 1) tiene fama o ataques mayores que 0. Se reponen Fame, AtaquesSemana (decksUsed) y AtaquesHoy (decksUsedToday) desde el
 * JSON si el jugador aparece con fama > 0, mazos > 0, y ni fama ni mazos quedan por debajo de los del sabado, y los de hoy no superan a los semanales.
 * opciones.topeMedallas: si la fama nueva menos la del sabado lo supera, queda SIN RESOLVER (PF036). Sin opciones, se comporta como en PF031.
 * Cualquier otro caso queda SIN RESOLVER y no se toca.
 */
function _calcularReparacionFamaDomingo_(filas, temporada, periodIdx, leerDia, opciones) {
  opciones = opciones || {};
  var cambios = [], sinResolver = [], famaSabado = {}, ataquesSabado = {}, hayFilaSabado = {};
  filas.forEach(function (f) {
    if (Number(f[GC.TEMPORADA - 1]) !== temporada || Number(f[GC.PERIOD_IDX - 1]) !== periodIdx - 1) return;
    var k = String(f[GC.TAG - 1] || '').trim().toUpperCase() + '|' + String(f[GC.CLAN - 1] || '');
    famaSabado[k] = Number(f[GC.FAME - 1]) || 0;
    ataquesSabado[k] = Number(f[GC.ATAQUES_SEM - 1]) || 0;
    hayFilaSabado[k] = true;
  });
  filas.forEach(function (f, i) {
    if (Number(f[GC.TEMPORADA - 1]) !== temporada || Number(f[GC.PERIOD_IDX - 1]) !== periodIdx) return;
    var fameAnt = Number(f[GC.FAME - 1]) || 0;
    var sRaw = f[GC.ATAQUES_SEM - 1];
    var ataqSem = (sRaw === '' || sRaw === null || sRaw === undefined) ? 0 : Number(sRaw);
    var hRaw = f[GC.ATAQUES_HOY - 1];
    var ataqHoy = (hRaw === '' || hRaw === null || hRaw === undefined) ? 0 : Number(hRaw);
    var tag = String(f[GC.TAG - 1] || '').trim().toUpperCase();
    var clan = String(f[GC.CLAN - 1] || '');
    var k = tag + '|' + clan;
    if (fameAnt > 0) return;
    var casoB = false;
    if (!(ataqSem > 0)) {
      // Caso B: los tres en 0 y el sabado con datos. Con AtaquesSemana = 0 y sin sabado con datos, el 0 es real.
      if (!opciones.ceroTotal || ataqHoy > 0 || !hayFilaSabado[k] || !(famaSabado[k] > 0 || ataquesSabado[k] > 0)) return;
      casoB = true;
    }
    var r = leerDia(clan, temporada, periodIdx, tag) || { estado: 'sin_json' };
    if (r.estado !== 'ok') {
      var motivo = 'no hay JSON del domingo para este clan';
      if (r.estado === 'ausente') motivo = 'el jugador no aparece en el JSON del domingo';
      else if (r.estado === 'indice_distinto') motivo = 'ningun JSON trae ese periodIndex en su contenido' + (r.motivo ? ' (' + r.motivo + ')' : '');
      else if (r.estado === 'incoherente') motivo = 'JSON incoherente: ' + (r.motivo || 'datos de otro periodo');
      else if (r.estado === 'tiempo') motivo = 'sin procesar: se acabo el tiempo (volver a correr)';
      sinResolver.push({ idx: i, motivo: motivo });
      return;
    }
    if (!(r.f > 0)) { sinResolver.push({ idx: i, motivo: 'el JSON (' + r.hora + ') trae fama 0 para este jugador' }); return; }
    var sab = famaSabado[k];
    if (casoB) {
      if (!(r.d > 0)) { sinResolver.push({ idx: i, motivo: 'el JSON (' + r.hora + ') trae 0 mazos para este jugador' }); return; }
      if (r.d < (ataquesSabado[k] || 0)) { sinResolver.push({ idx: i, motivo: 'los mazos del JSON (' + r.d + ') son menos que los AtaquesSemana del sabado (' + ataquesSabado[k] + ')' }); return; }
      if (r.t > r.d) { sinResolver.push({ idx: i, motivo: 'los mazos de hoy del JSON (' + r.t + ') superan a los semanales (' + r.d + ')' }); return; }
    } else if (Number(r.d) !== ataqSem) {
      sinResolver.push({ idx: i, motivo: 'los mazos del JSON (' + r.d + ') no coinciden con AtaquesSemana de la fila (' + ataqSem + '): la fama del JSON puede estar desfasada' });
      return;
    }
    if (sab !== undefined && r.f < sab) {
      sinResolver.push({ idx: i, motivo: 'la fama del JSON (' + r.f + ') es menor que la del sabado en la hoja (' + sab + ')' });
      return;
    }
    if (opciones.topeMedallas > 0 && sab !== undefined && (r.f - sab) > opciones.topeMedallas) {
      sinResolver.push({ idx: i, motivo: 'las medallas del domingo (' + (r.f - sab) + ') superan el tope de ' + opciones.topeMedallas + ' por dia: revisar a mano' });
      return;
    }
    cambios.push({ idx: i, fameAnt: fameAnt, fameNueva: r.f, ataqSem: ataqSem, sabado: sab,
      ataques: casoB, ataqSemNueva: casoB ? r.d : ataqSem, ataqHoyAnt: ataqHoy, ataqHoyNueva: casoB ? r.t : ataqHoy,
      detalle: (casoB ? 'Fame, AtaquesSemana y AtaquesHoy tomados del JSON de ' : 'Fama tomada del JSON de ') + r.hora +
        (casoB ? ' (mazos ' + r.d + ', de hoy ' + r.t + '; el sabado ya tenia datos)' : ' (mazos ' + r.d + ' = AtaquesSemana)') +
        (sab === undefined ? '. Sin fila del sabado para contrastar' : '. Fama del sabado en la hoja: ' + sab + ', medallas del domingo: ' + (r.f - sab)) });
  });
  return { cambios: cambios, sinResolver: sinResolver };
}

function _repararFamaDomingoDesdeJSON_(aplicar, objetivos) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { Logger.log('[ReparoFamaDomingo] Hay otra ejecucion en curso; se cancela para no pisar datos. Reintentar en unos minutos.'); return; }
  try {
    var t0 = Date.now();
    var ss = _getSs();
    // Sin objetivos: el domingo 04-oct (T5, periodIndex 27) de PF031, igual que antes. Con objetivos: lista de [temporada, periodIndex] (PF045).
    var anteriores = !!(objetivos && objetivos.length);
    var lista = anteriores ? objetivos : [[REPARAR_FAMA_DOMINGO_TEMPORADA, REPARAR_FAMA_DOMINGO_PERIODINDEX]];
    var opcionesCalculo = anteriores ? { ceroTotal: true, topeMedallas: REPARAR_FAMA_TOPE_MEDALLAS_DIA } : {};
    var etiquetaObjetivos = lista.map(function (o) { return 'T' + o[0] + '_PI' + o[1]; }).join('_');
    var marca = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH.mm.ss');
    var informe = [['Fuente', 'Tipo', 'Temporada', 'Semana', 'Tag', 'Nombre', 'Clan', 'PeriodIndex', 'Fame anterior', 'Fame nueva', 'AtaquesSemana', 'Fame sabado', 'Detalle', 'Origen anterior', 'Reparado', 'AtaquesSemana nueva', 'AtaquesHoy anterior', 'AtaquesHoy nueva']];
    var lector = _crearLectorDiaJSONGuerra_(t0);
    var resumen = { csvCambios: 0, csvSinResolver: 0, hojaCambios: 0, hojaSinResolver: 0 };

    var agregarAlInforme = function (fuente, filas, res) {
      res.cambios.forEach(function (c) {
        var f = filas[c.idx];
        informe.push([fuente, 'Cambio', f[GC.TEMPORADA - 1], f[GC.SEMANA - 1], f[GC.TAG - 1], f[GC.NOMBRE - 1], f[GC.CLAN - 1], f[GC.PERIOD_IDX - 1], c.fameAnt, c.fameNueva, c.ataqSem, (c.sabado === undefined ? '' : c.sabado), c.detalle, f[GC.ORIGEN - 1],
          (c.ataques ? 'Fame y ataques' : 'Fame'), (c.ataques ? c.ataqSemNueva : ''), (c.ataques ? c.ataqHoyAnt : ''), (c.ataques ? c.ataqHoyNueva : '')]);
      });
      res.sinResolver.forEach(function (s) {
        var f = filas[s.idx];
        informe.push([fuente, 'SIN RESOLVER', f[GC.TEMPORADA - 1], f[GC.SEMANA - 1], f[GC.TAG - 1], f[GC.NOMBRE - 1], f[GC.CLAN - 1], f[GC.PERIOD_IDX - 1], f[GC.FAME - 1], '', f[GC.ATAQUES_SEM - 1], '', s.motivo, f[GC.ORIGEN - 1], '', '', '', '']);
      });
    };

    // --- Backup_Guerra.csv (todas las temporadas) ---
    var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
    var encabezadoCsv = null, filasCsv = null, resCsv = null;
    if (csvText) {
      var parsed = _parseCSV(csvText);
      if (parsed && parsed.length > 1) {
        encabezadoCsv = parsed[0];
        filasCsv = parsed.slice(1);
        for (var a = 0; a < filasCsv.length; a++) { while (filasCsv[a].length < GUERRA_TOTAL_COLS) filasCsv[a].push(''); }
        resCsv = { cambios: [], sinResolver: [] };
        lista.forEach(function (o) {
          var rr = _calcularReparacionFamaDomingo_(filasCsv, o[0], o[1], lector.leer, opcionesCalculo);
          resCsv.cambios = resCsv.cambios.concat(rr.cambios); resCsv.sinResolver = resCsv.sinResolver.concat(rr.sinResolver);
        });
        agregarAlInforme('Backup_Guerra.csv', filasCsv, resCsv);
        resumen.csvCambios = resCsv.cambios.length; resumen.csvSinResolver = resCsv.sinResolver.length;
      }
    }

    // --- Hoja Guerra (temporada vigente; puede no tener la temporada 5) ---
    var sh = ss.getSheetByName(CFG.SHEETS.GUERRA);
    var datosHoja = null, resHoja = null;
    if (sh && sh.getLastRow() >= 2) {
      datosHoja = sh.getRange(2, 1, sh.getLastRow() - 1, GUERRA_TOTAL_COLS).getValues();
      resHoja = { cambios: [], sinResolver: [] };
      lista.forEach(function (o) {
        var rh = _calcularReparacionFamaDomingo_(datosHoja, o[0], o[1], lector.leer, opcionesCalculo);
        resHoja.cambios = resHoja.cambios.concat(rh.cambios); resHoja.sinResolver = resHoja.sinResolver.concat(rh.sinResolver);
      });
      agregarAlInforme('Hoja Guerra', datosHoja, resHoja);
      resumen.hojaCambios = resHoja.cambios.length; resumen.hojaSinResolver = resHoja.sinResolver.length;
    }

    var nombreInforme = 'Reparacion_FamaDomingo' + (anteriores ? 'Anteriores_' : '_') + etiquetaObjetivos + ' ' + marca + ' (' + (aplicar ? 'aplicado' : 'informe') + ').csv';
    if (informe.length > 1) _saveCSVToDrive(nombreInforme, _encodeCSV(informe));

    if (aplicar && (resumen.csvCambios > 0 || resumen.hojaCambios > 0)) {
      // Respaldo previo del CSV completo, ANTES de escribir nada.
      if (csvText) _saveCSVToDrive('Backup_Guerra ANTES de reparar FamaDomingo' + (anteriores ? 'Anteriores' : '') + ' ' + marca + '.csv', csvText);

      if (resCsv && resCsv.cambios.length) {
        resCsv.cambios.forEach(function (c) {
          var fila = filasCsv[c.idx];
          fila[GC.FAME - 1] = String(c.fameNueva);
          if (c.ataques) { fila[GC.ATAQUES_SEM - 1] = String(c.ataqSemNueva); fila[GC.ATAQUES_HOY - 1] = String(c.ataqHoyNueva); }
          var og = String(fila[GC.ORIGEN - 1] || '').trim();
          if (og === '' || og === 'Original') fila[GC.ORIGEN - 1] = 'Corregido';
        });
        _saveCSVToDrive('Backup_Guerra.csv', _encodeCSV([encabezadoCsv].concat(filasCsv)));
      }
      if (resHoja && resHoja.cambios.length) {
        // Solo Fame, Origen y (caso B de PF045) AtaquesHoy y AtaquesSemana: no se reescribe el resto de columnas.
        var colFame = datosHoja.map(function (r) { return [r[GC.FAME - 1]]; });
        var colAtaquesHoy = datosHoja.map(function (r) { return [r[GC.ATAQUES_HOY - 1]]; });
        var colAtaquesSem = datosHoja.map(function (r) { return [r[GC.ATAQUES_SEM - 1]]; });
        var colOrigen = datosHoja.map(function (r) { return [r[GC.ORIGEN - 1]]; });
        resHoja.cambios.forEach(function (c) {
          colFame[c.idx][0] = c.fameNueva;
          if (c.ataques) { colAtaquesHoy[c.idx][0] = c.ataqHoyNueva; colAtaquesSem[c.idx][0] = c.ataqSemNueva; }
          var og = String(colOrigen[c.idx][0] || '').trim();
          if (og === '' || og === 'Original') colOrigen[c.idx][0] = 'Corregido';
        });
        sh.getRange(2, GC.FAME, colFame.length, 1).setValues(colFame);
        if (resHoja.cambios.some(function (c) { return c.ataques; })) {
          sh.getRange(2, GC.ATAQUES_HOY, colAtaquesHoy.length, 1).setValues(colAtaquesHoy);
          sh.getRange(2, GC.ATAQUES_SEM, colAtaquesSem.length, 1).setValues(colAtaquesSem);
        }
        sh.getRange(2, GC.ORIGEN, colOrigen.length, 1).setValues(colOrigen);
        _syncGuerraCSV(sh); // propaga la hoja al CSV, igual que repararAtaquesHoyGuerraDesdeJSONAplicar()
      }
    }

    Logger.log('[ReparoFamaDomingo] ' + (aplicar ? 'APLICAR' : 'SOLO INFORMAR') + ' ' + etiquetaObjetivos + ' (' + Math.round((Date.now() - t0) / 1000) + ' s). ' +
      'Backup_Guerra.csv: ' + resumen.csvCambios + ' fila(s) a cambiar, ' + resumen.csvSinResolver + ' sin resolver. ' +
      'Hoja Guerra: ' + resumen.hojaCambios + ' fila(s) a cambiar, ' + resumen.hojaSinResolver + ' sin resolver. ' +
      (informe.length > 1 ? 'Detalle en Drive: ' + nombreInforme + '.' : 'No hay nada que reparar.') +
      (lector.agotado() ? ' SE ACABO EL TIEMPO: volver a correr para seguir con las filas pendientes.' : '') +
      (aplicar ? '' : ' (No se escribio nada; correr ' + (anteriores ? 'repararFamaDomingosAnterioresAplicar()' : 'repararFamaDomingoDesdeJSONAplicar()') + ' para aplicar.)'));
  } finally {
    lock.releaseLock();
  }
}

// REPARACION DE LOS DOMINGOS CON EL LOG DE ROYALEAPI (12-oct-2026, pedido del usuario) [→ Contexto_Base_Web.md §PF047]
// Corrige Fame y AtaquesSemana de los domingos 05/07 (T2, periodIndex 34), 02/08 (T3, 27), 30/08 (T4, 27) y 04/10 (T5, 27) en Backup_Guerra.csv
// y en la hoja Guerra, tomando el total semanal que el Tampermonkey leyo del Log de RoyaleAPI (Correcciones_Guerra.csv, con Tag de jugador y de clan).
// Solo sube valores: si el guardado es mayor que el del Log, la fila queda SIN RESOLVER. No toca AtaquesHoy ni Barcos (el Log no trae el dato del dia).
// Primero ...Informe(), revisar el CSV en Drive y luego ...Aplicar().
var REPARAR_DOMINGOS_CORRECCIONES = [[2, 34], [3, 27], [4, 27], [5, 27]];
var REPARAR_DOMINGOS_CLANTAG = { 'Grupo乂Terna™': '#GCRG8L00', 'GrupoXTerna™2': '#GYCU9YRG', 'GrupoXTerna™3': '#GQQPPJGR', 'Mini乂Ternas™': '#GG99LCJY' };
var REPARAR_DOMINGOS_TOPE_ATAQUES = 16;
// Plausibilidad (12-oct-2026): cada ataque de guerra da al menos 75 de fama (barco perdido), asi que si los ataques suben respecto al sabado y las
// medallas del domingo son menos que 75 por ataque nuevo, el Log no es coherente consigo mismo y la fila queda SIN RESOLVER [→ Contexto_Base_Web.md §PF047]
var REPARAR_DOMINGOS_MEDALLAS_MIN_POR_ATAQUE = 75;

function repararDomingosDesdeCorreccionesInforme() { _repararDomingosDesdeCorrecciones_(false); }
function repararDomingosDesdeCorreccionesAplicar() { _repararDomingosDesdeCorrecciones_(true); }

/**
 * _buscarCorreccionDomingo_(overlay, temporada, semana, clanTag, tag) [→ Contexto_Base_Web.md §PF047]
 * Busca en el overlay de Correcciones_Guerra.csv (clave temporada|semana|clanTag|tag) la fila del jugador. Primero la de su clan; si el Log de esa semana
 * no trae ClanTag (T2 S5 y anteriores) usa la fila sin ClanTag. Si hay filas con ClanTag pero ninguna de este clan, devuelve 'otro_clan'.
 */
function _buscarCorreccionDomingo_(overlay, temporada, semana, clanTag, tag) {
  var t = String(temporada), s = String(semana);
  if (clanTag && overlay[t + '|' + s + '|' + clanTag + '|' + tag]) return { estado: 'ok', e: overlay[t + '|' + s + '|' + clanTag + '|' + tag] };
  var hayConClan = false;
  (CFG.CLAN_TAGS || []).forEach(function (ct) { if (overlay[t + '|' + s + '|' + ct + '|' + tag]) hayConClan = true; });
  if (hayConClan) return { estado: 'otro_clan' };
  var sinClan = overlay[t + '|' + s + '||' + tag];
  if (sinClan) return { estado: 'ok_sin_clan', e: sinClan };
  return { estado: 'sin_dato' };
}

/**
 * _calcularReparacionDomingoDesdeCorrecciones_(filas, temporada, periodIdx, overlay, opciones) [→ Contexto_Base_Web.md §PF047]
 * Funcion pura (sin Drive ni hoja): devuelve { cambios, sinResolver, sinDato, iguales }. Solo mira las filas de esa temporada y ese periodIndex.
 * Cambio: la fama y los ataques semanales del Log son iguales o mayores que los guardados (y alguno es mayor), no quedan por debajo de los del sabado
 * del mismo jugador y clan, y las medallas del domingo no superan opciones.topeMedallas. Cualquier otro caso con diferencia queda SIN RESOLVER.
 */
function _calcularReparacionDomingoDesdeCorrecciones_(filas, temporada, periodIdx, overlay, opciones) {
  opciones = opciones || {};
  var cambios = [], sinResolver = [], sinDato = 0, iguales = 0, sabado = {}, filasPorTag = {};
  filas.forEach(function (f) {
    if (Number(f[GC.TEMPORADA - 1]) !== temporada) return;
    var pi = Number(f[GC.PERIOD_IDX - 1]);
    var tg = String(f[GC.TAG - 1] || '').trim().toUpperCase();
    if (pi === periodIdx - 1) {
      sabado[tg + '|' + String(f[GC.CLAN - 1] || '')] = { fame: Number(f[GC.FAME - 1]) || 0, ataques: Number(f[GC.ATAQUES_SEM - 1]) || 0 };
    } else if (pi === periodIdx) {
      filasPorTag[tg] = (filasPorTag[tg] || 0) + 1;
    }
  });
  filas.forEach(function (f, i) {
    if (Number(f[GC.TEMPORADA - 1]) !== temporada || Number(f[GC.PERIOD_IDX - 1]) !== periodIdx) return;
    var tag = String(f[GC.TAG - 1] || '').trim().toUpperCase();
    var clan = String(f[GC.CLAN - 1] || '');
    var fameAnt = Number(f[GC.FAME - 1]) || 0;
    var ataqAnt = Number(f[GC.ATAQUES_SEM - 1]) || 0;
    var ataqHoy = Number(f[GC.ATAQUES_HOY - 1]) || 0;
    var b = _buscarCorreccionDomingo_(overlay, temporada, Number(f[GC.SEMANA - 1]), REPARAR_DOMINGOS_CLANTAG[clan] || '', tag);
    if (b.estado === 'sin_dato') { sinDato++; return; }
    if (b.estado === 'otro_clan') { sinResolver.push({ idx: i, motivo: 'el Log trae a este jugador esa semana en otro clan, no en este' }); return; }
    if (b.estado === 'ok_sin_clan' && filasPorTag[tag] > 1) { sinResolver.push({ idx: i, motivo: 'el jugador tiene varias filas ese domingo y el Log de esa semana no trae ClanTag: no se sabe a que clan corresponde' }); return; }
    var fameNueva = Number(b.e.fame) || 0, ataqNueva = Number(b.e.ataquesSemana) || 0;
    if (fameNueva === fameAnt && ataqNueva === ataqAnt) { iguales++; return; }
    if (fameNueva < fameAnt || ataqNueva < ataqAnt) { sinResolver.push({ idx: i, motivo: 'lo guardado (ataques ' + ataqAnt + ', fama ' + fameAnt + ') es mayor que el Log (ataques ' + ataqNueva + ', fama ' + fameNueva + '): revisar a mano' }); return; }
    var s = sabado[tag + '|' + clan];
    if (s && fameNueva < s.fame) { sinResolver.push({ idx: i, motivo: 'la fama del Log (' + fameNueva + ') es menor que la del sabado en la hoja (' + s.fame + ')' }); return; }
    if (s && ataqNueva < s.ataques) { sinResolver.push({ idx: i, motivo: 'los ataques del Log (' + ataqNueva + ') son menos que los del sabado en la hoja (' + s.ataques + ')' }); return; }
    if (ataqNueva > REPARAR_DOMINGOS_TOPE_ATAQUES) { sinResolver.push({ idx: i, motivo: 'los ataques del Log (' + ataqNueva + ') superan el tope de ' + REPARAR_DOMINGOS_TOPE_ATAQUES + ' por semana: revisar a mano' }); return; }
    if (opciones.topeMedallas > 0 && s && (fameNueva - s.fame) > opciones.topeMedallas) { sinResolver.push({ idx: i, motivo: 'las medallas del domingo (' + (fameNueva - s.fame) + ') superan el tope de ' + opciones.topeMedallas + ' por dia: revisar a mano' }); return; }
    if (s && opciones.medallasMinPorAtaque > 0 && (ataqNueva - s.ataques) > 0 && (fameNueva - s.fame) < opciones.medallasMinPorAtaque * (ataqNueva - s.ataques)) {
      sinResolver.push({ idx: i, motivo: 'el Log sube los ataques (' + s.ataques + ' a ' + ataqNueva + ') pero las medallas del domingo son solo ' + (fameNueva - s.fame) + ' (minimo ' + (opciones.medallasMinPorAtaque * (ataqNueva - s.ataques)) + '): el Log no es coherente, revisar a mano' });
      return;
    }
    cambios.push({ idx: i, fameAnt: fameAnt, fameNueva: fameNueva, ataqAnt: ataqAnt, ataqNueva: ataqNueva, ataqHoy: ataqHoy,
      sabFame: s ? s.fame : '', sabAtaques: s ? s.ataques : '',
      detalle: 'Fame y AtaquesSemana tomados del Log de RoyaleAPI (Correcciones_Guerra.csv' + (b.estado === 'ok_sin_clan' ? ', sin ClanTag: cruzado solo por Tag' : '') + ')' +
        (s ? '. Sabado en la hoja: fama ' + s.fame + ', ataques ' + s.ataques + '; medallas del domingo: ' + (fameNueva - s.fame) : '. Sin fila del sabado para contrastar') });
  });
  return { cambios: cambios, sinResolver: sinResolver, sinDato: sinDato, iguales: iguales };
}

function _repararDomingosDesdeCorrecciones_(aplicar) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { Logger.log('[ReparoDomingosLog] Hay otra ejecucion en curso; se cancela para no pisar datos. Reintentar en unos minutos.'); return; }
  try {
    var t0 = Date.now();
    var ss = _getSs();
    var marca = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH.mm.ss');
    var overlay = _cargarOverlayCorreccionesGuerraPorClan();
    if (!Object.keys(overlay).length) { Logger.log('[ReparoDomingosLog] Correcciones_Guerra.csv no existe o esta vacio; no se hace nada.'); return; }
    var opciones = { topeMedallas: REPARAR_FAMA_TOPE_MEDALLAS_DIA, medallasMinPorAtaque: REPARAR_DOMINGOS_MEDALLAS_MIN_POR_ATAQUE };
    var informe = [['Fuente', 'Tipo', 'Temporada', 'Semana', 'Tag', 'Nombre', 'Clan', 'PeriodIndex', 'Fame anterior', 'Fame nueva', 'AtaquesSemana anterior', 'AtaquesSemana nueva', 'Fame sabado', 'AtaquesSemana sabado', 'AtaquesHoy (no se toca)', 'Detalle', 'Origen anterior']];
    var resumen = { csvCambios: 0, csvSinResolver: 0, csvIguales: 0, csvSinDato: 0, hojaCambios: 0, hojaSinResolver: 0 };

    var calcular = function (filas) {
      var r = { cambios: [], sinResolver: [], sinDato: 0, iguales: 0 };
      REPARAR_DOMINGOS_CORRECCIONES.forEach(function (o) {
        var x = _calcularReparacionDomingoDesdeCorrecciones_(filas, o[0], o[1], overlay, opciones);
        r.cambios = r.cambios.concat(x.cambios); r.sinResolver = r.sinResolver.concat(x.sinResolver); r.sinDato += x.sinDato; r.iguales += x.iguales;
      });
      return r;
    };
    var agregarAlInforme = function (fuente, filas, res) {
      res.cambios.forEach(function (c) {
        var f = filas[c.idx];
        informe.push([fuente, 'Cambio', f[GC.TEMPORADA - 1], f[GC.SEMANA - 1], f[GC.TAG - 1], f[GC.NOMBRE - 1], f[GC.CLAN - 1], f[GC.PERIOD_IDX - 1], c.fameAnt, c.fameNueva, c.ataqAnt, c.ataqNueva, c.sabFame, c.sabAtaques, c.ataqHoy, c.detalle, f[GC.ORIGEN - 1]]);
      });
      res.sinResolver.forEach(function (s) {
        var f = filas[s.idx];
        informe.push([fuente, 'SIN RESOLVER', f[GC.TEMPORADA - 1], f[GC.SEMANA - 1], f[GC.TAG - 1], f[GC.NOMBRE - 1], f[GC.CLAN - 1], f[GC.PERIOD_IDX - 1], f[GC.FAME - 1], '', f[GC.ATAQUES_SEM - 1], '', '', '', f[GC.ATAQUES_HOY - 1], s.motivo, f[GC.ORIGEN - 1]]);
      });
    };

    // --- Backup_Guerra.csv (todas las temporadas) ---
    var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
    var encabezadoCsv = null, filasCsv = null, resCsv = null;
    if (csvText) {
      var parsed = _parseCSV(csvText);
      if (parsed && parsed.length > 1) {
        encabezadoCsv = parsed[0];
        filasCsv = parsed.slice(1);
        for (var a = 0; a < filasCsv.length; a++) { while (filasCsv[a].length < GUERRA_TOTAL_COLS) filasCsv[a].push(''); }
        resCsv = calcular(filasCsv);
        agregarAlInforme('Backup_Guerra.csv', filasCsv, resCsv);
        resumen.csvCambios = resCsv.cambios.length; resumen.csvSinResolver = resCsv.sinResolver.length; resumen.csvIguales = resCsv.iguales; resumen.csvSinDato = resCsv.sinDato;
      }
    }

    // --- Hoja Guerra (temporada vigente; normalmente no tiene estas temporadas) ---
    var sh = ss.getSheetByName(CFG.SHEETS.GUERRA);
    var datosHoja = null, resHoja = null;
    if (sh && sh.getLastRow() >= 2) {
      datosHoja = sh.getRange(2, 1, sh.getLastRow() - 1, GUERRA_TOTAL_COLS).getValues();
      resHoja = calcular(datosHoja);
      agregarAlInforme('Hoja Guerra', datosHoja, resHoja);
      resumen.hojaCambios = resHoja.cambios.length; resumen.hojaSinResolver = resHoja.sinResolver.length;
    }

    var nombreInforme = 'Reparacion_DomingosDesdeLog ' + marca + ' (' + (aplicar ? 'aplicado' : 'informe') + ').csv';
    if (informe.length > 1) _saveCSVToDrive(nombreInforme, _encodeCSV(informe));

    if (aplicar && (resumen.csvCambios > 0 || resumen.hojaCambios > 0)) {
      // Respaldo previo del CSV completo, ANTES de escribir nada.
      if (csvText) _saveCSVToDrive('Backup_Guerra ANTES de reparar DomingosDesdeLog ' + marca + '.csv', csvText);

      if (resCsv && resCsv.cambios.length) {
        resCsv.cambios.forEach(function (c) {
          var fila = filasCsv[c.idx];
          fila[GC.FAME - 1] = String(c.fameNueva);
          fila[GC.ATAQUES_SEM - 1] = String(c.ataqNueva);
          var og = String(fila[GC.ORIGEN - 1] || '').trim();
          if (og === '' || og === 'Original') fila[GC.ORIGEN - 1] = 'Corregido';
        });
        _saveCSVToDrive('Backup_Guerra.csv', _encodeCSV([encabezadoCsv].concat(filasCsv)));
      }
      if (resHoja && resHoja.cambios.length) {
        // Solo Fame, AtaquesSemana y Origen: no se reescribe el resto de columnas.
        var colFame = datosHoja.map(function (r) { return [r[GC.FAME - 1]]; });
        var colAtaquesSem = datosHoja.map(function (r) { return [r[GC.ATAQUES_SEM - 1]]; });
        var colOrigen = datosHoja.map(function (r) { return [r[GC.ORIGEN - 1]]; });
        resHoja.cambios.forEach(function (c) {
          colFame[c.idx][0] = c.fameNueva;
          colAtaquesSem[c.idx][0] = c.ataqNueva;
          var og = String(colOrigen[c.idx][0] || '').trim();
          if (og === '' || og === 'Original') colOrigen[c.idx][0] = 'Corregido';
        });
        sh.getRange(2, GC.FAME, colFame.length, 1).setValues(colFame);
        sh.getRange(2, GC.ATAQUES_SEM, colAtaquesSem.length, 1).setValues(colAtaquesSem);
        sh.getRange(2, GC.ORIGEN, colOrigen.length, 1).setValues(colOrigen);
        _syncGuerraCSV(sh); // propaga la hoja al CSV, igual que en PF031 y PF045
      }
    }

    Logger.log('[ReparoDomingosLog] ' + (aplicar ? 'APLICAR' : 'SOLO INFORMAR') + ' (' + Math.round((Date.now() - t0) / 1000) + ' s). ' +
      'Backup_Guerra.csv: ' + resumen.csvCambios + ' fila(s) a cambiar, ' + resumen.csvSinResolver + ' sin resolver, ' + resumen.csvIguales + ' ya iguales al Log, ' + resumen.csvSinDato + ' sin dato en el Log. ' +
      'Hoja Guerra: ' + resumen.hojaCambios + ' fila(s) a cambiar, ' + resumen.hojaSinResolver + ' sin resolver. ' +
      (informe.length > 1 ? 'Detalle en Drive: ' + nombreInforme + '.' : 'No hay nada que reparar.') +
      (aplicar ? '' : ' (No se escribio nada; correr repararDomingosDesdeCorreccionesAplicar() para aplicar.)'));
  } finally {
    lock.releaseLock();
  }
}

/**
 * _prepararFilaGuerraDesdeCSV(rawRow, numCols) [→ Contexto_Base_Web.md §17B168]
 */
function _prepararFilaGuerraDesdeCSV(rawRow, numCols) {
  var newR = rawRow.slice(0, numCols);
  while (newR.length < numCols) newR.push('');

  // Fecha (col 2, índice 1): es un timestamp real de ejecución, no se puede
  // recalcular — se parsea el texto en español guardado en el CSV.
  if (newR[GC.FECHA - 1]) {
    var fechaObj = _parseSpanishDate(newR[GC.FECHA - 1]);
    if (fechaObj instanceof Date && !isNaN(fechaObj.getTime())) newR[GC.FECHA - 1] = fechaObj;
  }
  // DiaGuerra (col 7, índice 6): SÍ es derivable de forma determinista a [→ Contexto_Base_Web.md §17B169]
  var temporadaCsv = Number(newR[GC.TEMPORADA  - 1]) || 0;
  var periodIdxCsv = Number(newR[GC.PERIOD_IDX - 1]) || 0;
  var diaGuerraObj = calcDiaGuerraIdx(CFG.REF_DEFAULT, temporadaCsv, periodIdxCsv);
  if (diaGuerraObj instanceof Date && !isNaN(diaGuerraObj.getTime())) newR[GC.DIA_GUERRA - 1] = diaGuerraObj;

  return newR;
}

/**
 * Restaura la hoja Guerra desde Backup_Guerra.csv. Restaura SOLO las filas [→ Contexto_Base_Web.md §17B170]
 */
function _restaurarGuerraDesdeCSVSiVacia(sh, temporadaActual) {
  var numCols = GUERRA_TOTAL_COLS;

  // Acepta una temporada o una lista (05-oct-2026). tempsSet: { 'N': true }.
  var tempsSet = {};
  [].concat(temporadaActual).forEach(function(t) { tempsSet[String(t)] = true; });
  var tempsTxt = Object.keys(tempsSet).join('+');

  var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
  if (!csvText) return true;

  try {
    var parsedCompleto = _parseCSV(csvText);
    if (!parsedCompleto || parsedCompleto.length <= 1) return true; // CSV vacío o solo encabezado

    // Filtrar SOLO la temporada actual — ver comentario de la función.
    var filasTemporada = [];
    for (var pi = 1; pi < parsedCompleto.length; pi++) {
      if (tempsSet[String(parsedCompleto[pi][GC.TEMPORADA - 1] || '')]) {
        filasTemporada.push(parsedCompleto[pi]);
      }
    }
    if (filasTemporada.length === 0) {
      Logger.log('[Guerra] Backup_Guerra.csv no tiene filas de la temporada actual (' +
        tempsTxt + ') todavía — no hay nada que restaurar (temporada recién iniciada).');
      return true;
    }

    // Si la hoja está totalmente vacía, primero se escribe SOLO el [→ Contexto_Base_Web.md §17B171]
    var lastRow = sh.getLastRow();
    if (lastRow < 1) {
      if (numCols > sh.getMaxColumns()) sh.insertColumnsAfter(sh.getMaxColumns(), numCols - sh.getMaxColumns());
      sh.getRange(1, 1, 1, GUERRA_HEADERS.length).setValues([GUERRA_HEADERS]);
      lastRow = 1;
    }

    var dataActual = lastRow > 1 ? sh.getRange(2, 1, lastRow - 1, numCols).getValues() : [];
    var existingIds = _mapaIdsGuerra(dataActual);

    var filasFaltantes = [];
    for (var ff = 0; ff < filasTemporada.length; ff++) {
      var fRawChk = filasTemporada[ff];
      var tagChk  = String(fRawChk[GC.TAG - 1] || '').trim().toUpperCase();
      if (!tagChk) continue;
      // FIX CRÍTICO (04-sep-2026, mismo bug que _mapaIdsGuerra()/ [→ Contexto_Base_Web.md §17B172]
      var clanChk = String(fRawChk[GC.CLAN - 1] || '').trim();
      var semChk  = Number(fRawChk[GC.SEMANA - 1] || 1);
      var pidxChk = Number(fRawChk[GC.PERIOD_IDX - 1] || 0);
      var idChk   = tagChk + '│' + clanChk + '│' + String(fRawChk[GC.TEMPORADA - 1] || '') + '│' + (semChk - 1) + '│' + pidxChk;
      if (existingIds.hasOwnProperty(idChk)) continue; // ya está, no se duplica
      filasFaltantes.push(fRawChk);
    }

    if (filasFaltantes.length === 0) {
      if (lastRow > 1) {
        Logger.log('[Guerra] _restaurarGuerraDesdeCSVSiVacia: hoja ya tiene ' + (lastRow - 1) +
          ' fila(s) y ya cubre todas las de la temporada actual (' + temporadaActual +
          ') presentes en Backup_Guerra.csv, se omite la restauración.');
      }
      return true;
    }

    var semanasFaltantesSet = {};
    for (var sf = 0; sf < filasFaltantes.length; sf++) {
      semanasFaltantesSet[Number(filasFaltantes[sf][GC.SEMANA - 1]) || 0] = true;
    }
    Logger.log('[Guerra] Faltan ' + filasFaltantes.length + ' fila(s) de la temporada actual (' +
      tempsTxt + ') — semana(s) involucrada(s): [' + Object.keys(semanasFaltantesSet).join(', ') +
      ']. Restaurando en lotes de ' + CFG.GUERRA_RESTORE_LOTE_FILAS + ' fila(s) (presupuesto ' +
      (CFG.GUERRA_RESTORE_BUDGET_MS / 1000) + 's)...');

    // Espacio suficiente en la hoja para TODAS las filas faltantes, de una
    // sola vez (evita recalcular/reinsertar filas en cada lote).
    if ((lastRow + filasFaltantes.length) > sh.getMaxRows()) {
      sh.insertRowsAfter(sh.getMaxRows(), (lastRow + filasFaltantes.length) - sh.getMaxRows() + 10);
    }

    var inicio = Date.now();
    var proximaFila = lastRow + 1;
    var lote = [];
    var escritasEnEstaCorrida = 0;
    var seCortoPorTiempo = false;

    var _volcarLote = function() {
      if (!lote.length) return;
      var appendData = lote.map(function(r) { return _prepararFilaGuerraDesdeCSV(r, numCols); });
      sh.getRange(proximaFila, 1, appendData.length, numCols).setValues(appendData);
      sh.getRange(proximaFila, 2, appendData.length, 1).setNumberFormat('dddd, d "de" mmmm"," yyyy h:mm:ss AM/PM');
      sh.getRange(proximaFila, 7, appendData.length, 1).setNumberFormat('dd/mm/yyyy');
      proximaFila += appendData.length;
      escritasEnEstaCorrida += appendData.length;
      lote = [];
    };

    for (var fi = 0; fi < filasFaltantes.length; fi++) {
      lote.push(filasFaltantes[fi]);

      if (lote.length >= CFG.GUERRA_RESTORE_LOTE_FILAS) _volcarLote();

      if ((Date.now() - inicio) > CFG.GUERRA_RESTORE_BUDGET_MS) {
        _volcarLote(); // no perder lo ya armado en memoria aunque no complete un lote entero
        seCortoPorTiempo = true;
        Logger.log('[Guerra] Presupuesto interno de restauración agotado (' +
          (CFG.GUERRA_RESTORE_BUDGET_MS / 1000) + 's) en ' + (fi + 1) + '/' + filasFaltantes.length +
          '. Se guardaron ' + escritasEnEstaCorrida + ' fila(s) en esta corrida (YA quedaron confirmadas ' +
          'en la hoja, no se pierden). El resto se retoma en la próxima continuación.');
        break;
      }
    }
    if (!seCortoPorTiempo) _volcarLote();

    if (seCortoPorTiempo) return false;

    Logger.log('[Guerra] Restauración completada: ' + escritasEnEstaCorrida + ' fila(s) agregada(s) (semana(s) [' +
      Object.keys(semanasFaltantesSet).join(', ') + ']).');
    return true;
  } catch(e) {
    Logger.log('[Guerra] Error restaurando desde CSV: ' + e.message);
    return true; // no bloquear el resto de updateGuerraSheet() por un error puntual acá; ya quedó logueado.
  }
}

/**
 * Sincroniza (FUSIONA) el contenido de la hoja Guerra con Backup_Guerra.csv.
 * @param {Sheet} sh - Hoja Guerra
 */
/**
 * _syncGuerraCSV(sh, forzar) [→ Contexto_Base_Web.md §17B173]
 */
function _syncGuerraCSV(sh, forzar) {
  try {
    var lastRow = sh.getLastRow();
    if (lastRow < 1) {
      Logger.log('[Guerra] _syncGuerraCSV: hoja sin encabezado, nada que fusionar.');
      return;
    }

    // NO se usa _extraerValoresConLinksReales() acá (17-jul-2026): esa [→ Contexto_Base_Web.md §17B174]
    var data = sh.getRange(1, 1, lastRow, GUERRA_TOTAL_COLS).getDisplayValues();

    // FASE 1 (Lista_de_cambios.md, 18-jul-2026): getDisplayValues() sobre [→ Contexto_Base_Web.md §17B175]
    if (lastRow >= 2) {
      var colFechaGuerra     = sh.getRange(2, GC.FECHA,      lastRow - 1, 1).getValues();
      var colDiaGuerraGuerra = sh.getRange(2, GC.DIA_GUERRA, lastRow - 1, 1).getValues();
      for (var rg = 0; rg < colFechaGuerra.length; rg++) {
        if (colFechaGuerra[rg][0] instanceof Date && !isNaN(colFechaGuerra[rg][0].getTime())) {
          data[rg + 1][GC.FECHA - 1] = _formatFechaCanonica(colFechaGuerra[rg][0], true);
        }
        if (colDiaGuerraGuerra[rg][0] instanceof Date && !isNaN(colDiaGuerraGuerra[rg][0].getTime())) {
          data[rg + 1][GC.DIA_GUERRA - 1] = _formatFechaCanonica(colDiaGuerraGuerra[rg][0]);
        }
      }
    }

    // --- FUSIÓN con el CSV existente ---
    var csvExistente  = _loadCSVFromDrive('Backup_Guerra.csv');
    var encabezado     = data[0];
    var filasFusion    = []; // array de filas (arrays de strings), sin encabezado
    var mapaFusion      = {}; // id -> índice en filasFusion

    if (csvExistente) {
      var parsedExistente = _parseCSV(csvExistente);
      if (parsedExistente.length > 0) encabezado = parsedExistente[0]; // preferir el encabezado ya persistido
      if (encabezado.length < GUERRA_TOTAL_COLS) encabezado = data[0]; // 12-oct-2026: CSV viejo de 20 columnas; se toma el encabezado de la hoja (trae «Copas»)
      for (var pi = 1; pi < parsedExistente.length; pi++) {
        var filaCsv = parsedExistente[pi].slice(0, GUERRA_TOTAL_COLS);
        while (filaCsv.length < GUERRA_TOTAL_COLS) filaCsv.push('');
        var idCsv = _idFilaGuerraCSV(filaCsv);
        if (idCsv && mapaFusion.hasOwnProperty(idCsv)) {
          // Duplicado ya presente en el propio CSV (no debería ocurrir, pero [→ Contexto_Base_Web.md §17B176]
          filasFusion[mapaFusion[idCsv]] = filaCsv;
        } else {
          if (idCsv) mapaFusion[idCsv] = filasFusion.length;
          filasFusion.push(filaCsv);
        }
      }
    }

    var csvRowsAntes = filasFusion.length;
    var nuevasDesdeHoja = 0;

    for (var si = 1; si < data.length; si++) {
      var filaHoja = data[si];
      var idHoja = _idFilaGuerraCSV(filaHoja);
      if (!idHoja) continue;
      if (mapaFusion.hasOwnProperty(idHoja)) {
        filasFusion[mapaFusion[idHoja]] = filaHoja; // actualizar con el valor más reciente de la hoja
      } else {
        mapaFusion[idHoja] = filasFusion.length;
        filasFusion.push(filaHoja); // fila nueva que el CSV todavía no tenía
        nuevasDesdeHoja++;
      }
    }

    // Blindaje: la fusión nunca debe reducir el conteo de filas del CSV,
    // salvo que forzar===true (ver comentario de la función más arriba).
    if (!forzar && filasFusion.length < csvRowsAntes) {
      Logger.log('[ALERTA PROTECCIÓN] SKIP fusión de Backup_Guerra.csv ' +
                 '(el resultado fusionado tendría ' + filasFusion.length + ' filas, ' +
                 'menos que las ' + csvRowsAntes + ' actuales del CSV).');
      return;
    }

    // FIX (03-ago-2026): renumerar N° de forma CONTINUA sobre TODO el CSV [→ Contexto_Base_Web.md §17B177]
    for (var rn = 0; rn < filasFusion.length; rn++) {
      filasFusion[rn][GC.NUM - 1] = String(rn + 1);
    }

    var salida = [encabezado].concat(filasFusion);
    _saveCSVToDrive('Backup_Guerra.csv', _encodeCSV(salida));
    Logger.log('[Guerra] Backup_Guerra.csv fusionado (' + (salida.length - 1) + ' filas totales; ' +
      nuevasDesdeHoja + ' nueva(s) desde la hoja, el resto actualizadas o intactas de temporadas anteriores).');
  } catch(e) {
    Logger.log('[Guerra] Error fusionando CSV: ' + e.message);
  }
}

/**
 * _idFilaGuerraCSV(fila) [→ Contexto_Base_Web.md §17B178]
 */
function _idFilaGuerraCSV(fila) {
  var tag = String(fila[GC.TAG - 1] || '').trim().toUpperCase();
  if (!tag) return null;
  var clan      = String(fila[GC.CLAN - 1] || '').trim();
  var temporada = String(fila[GC.TEMPORADA - 1] || '');
  var semana    = Number(fila[GC.SEMANA - 1] || 1);
  var sIdx      = semana - 1;
  var pIdx      = Number(fila[GC.PERIOD_IDX - 1] || 0);
  return tag + '│' + clan + '│' + temporada + '│' + sIdx + '│' + pIdx;
}

/**
 * Lee los IDs existentes en la hoja Guerra para deduplicación.
 * @returns {Object} Mapa { id -> rowNumber }
 */
/** true si la celda está vacía (''/null/undefined). No considera vacío a un Date ni a un número. */
function _celdaVaciaGuerra_(v) {
  return v === '' || v === null || v === undefined;
}

/**
 * _mapaIdsGuerra(datos) [→ Contexto_Base_Web.md §17B179]
 */
function _mapaIdsGuerra(datos) {
  var map = {};
  for (var i = 0; i < datos.length; i++) {
    var tag       = String(datos[i][GC.TAG          - 1] || '').trim().toUpperCase();
    var clan      = String(datos[i][GC.CLAN         - 1] || '').trim();
    var temporada = String(datos[i][GC.TEMPORADA    - 1] || '');
    var semana    = Number(datos[i][GC.SEMANA       - 1] || 1);
    var sIdx      = semana - 1;
    var pIdx      = Number(datos[i][GC.PERIOD_IDX   - 1] || 0);

    if (tag) {
      // Mismo esquema de ID que updateGuerraSheet(): tag + clan + temporada + [→ Contexto_Base_Web.md §17B180]
      var id = tag + '│' + clan + '│' + temporada + '│' + sIdx + '│' + pIdx;
      map[id] = i; // Índice en el array (0-based)
    }
  }
  return map;
}

/**
 * _purgarTemporadasAnterioresGuerra(sh, temporadaActual) [→ Contexto_Base_Web.md §17B181]
 */
function _purgarTemporadasAnterioresGuerra(sh, temporadaActual) {
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return;

  var tempsSet = {};
  [].concat(temporadaActual).forEach(function(t) { tempsSet[String(t)] = true; });
  var tempsTxt = Object.keys(tempsSet).join('+');

  var data = sh.getRange(2, 1, lastRow - 1, GUERRA_TOTAL_COLS).getValues();

  var hayAnteriores = false;
  for (var i = 0; i < data.length; i++) {
    if (!tempsSet[String(data[i][GC.TEMPORADA - 1] || '')]) { hayAnteriores = true; break; }
  }
  if (!hayAnteriores) return; // caso normal: nada que purgar esta corrida

  Logger.log('[Guerra] Detectada(s) fila(s) de temporada(s) distinta(s) de ' + tempsTxt +
    ' en la hoja. Fusionando con Backup_Guerra.csv ANTES de purgar, para no perder nada.');
  _syncGuerraCSV(sh); // asegura que TODO lo que hay en la hoja ahora mismo (incluidas las filas viejas) ya quedó en el CSV

  var filasActuales = [];
  for (var i = 0; i < data.length; i++) {
    if (tempsSet[String(data[i][GC.TEMPORADA - 1] || '')]) filasActuales.push(data[i]);
  }

  sh.getRange(2, 1, lastRow - 1, GUERRA_TOTAL_COLS).clearContent();
  if (filasActuales.length > 0) {
    for (var r = 0; r < filasActuales.length; r++) filasActuales[r][GC.NUM - 1] = r + 1; // renumerar N°
    sh.getRange(2, 1, filasActuales.length, GUERRA_TOTAL_COLS).setValues(filasActuales);
    sh.getRange(2, GC.FECHA,      filasActuales.length, 1).setNumberFormat('dddd, d "de" mmmm"," yyyy h:mm:ss AM/PM');
    sh.getRange(2, GC.DIA_GUERRA, filasActuales.length, 1).setNumberFormat('dd/mm/yyyy');
  }

  Logger.log('[Guerra] Purga completada: ' + (data.length - filasActuales.length) +
    ' fila(s) de temporada(s) anterior(es) quitada(s) de la hoja (a salvo en Backup_Guerra.csv). ' +
    'Filas restantes en la hoja: ' + filasActuales.length + '.');
}

/**
 * Aplica formato condicional a la hoja Guerra según la letra del día (col E).
 */
function _aplicarFmtCondicionalGuerra(sh) {
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return;

  var dataRange = sh.getRange(2, 1, lastRow - 1, GUERRA_TOTAL_COLS);
  var colDia    = colLetter(GC.DIA);
  var rules     = [];

  var dias = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  for (var i = 0; i < dias.length; i++) {
    var d  = dias[i];
    var bg = CFG.COLORES_DIA_GUERRA[d] || '#ffffff';
    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied('=$' + colDia + '2="' + d + '"')
        .setBackground(bg)
        .setRanges([dataRange])
        .build()
    );
  }

  _tryCondFmt(sh, rules);
}

/**
 * _mapaIdsGuerraLogs(datos) [→ Contexto_Base_Web.md §17B182]
 */
function _mapaIdsGuerraLogs(datos) {
  var map = {};
  for (var i = 0; i < datos.length; i++) {
    var clanTag   = String(datos[i][GLC.TAG       - 1] || '');
    var temporada = String(datos[i][GLC.TEMPORADA - 1] || '');
    var semana    = Number(datos[i][GLC.SEMANA    - 1] || 1);
    var pIdx      = Number(datos[i][GLC.PERIOD_IDX - 1] || 0);
    var sIdx      = semana - 1;
    var id        = clanTag + '│' + temporada + '│' + sIdx + '│' + pIdx;
    if (clanTag) map[id] = i;
  }
  return map;
}

/**
 * Aplica formato condicional a la hoja Guerra_Logs según la letra del día (col E).
 */
function _aplicarFmtCondicionalGuerraLogs(sh) {
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return;

  var dataRange = sh.getRange(2, 1, lastRow - 1, GUERRA_LOGS_TOTAL_COLS);
  var colDia    = colLetter(GLC.DIA);
  var rules     = [];

  var dias = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  for (var i = 0; i < dias.length; i++) {
    var d  = dias[i];
    var bg = CFG.COLORES_DIA_GUERRA_LOGS[d] || '#ffffff';
    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied('=$' + colDia + '2="' + d + '"')
        .setBackground(bg)
        .setRanges([dataRange])
        .build()
    );
  }

  _tryCondFmt(sh, rules);
}

/**
 * _finalizarFormatoPendientes(sh, oldLastRow, numFilasDatos) [→ Contexto_Base_Web.md §17B183]
 */
function _finalizarFormatoPendientes(sh, oldLastRow, numFilasDatos) {
  var numCols = 10; // FIX (13-ago-2026): 9 -> 10 por la columna RoyaleAPI nueva.
  var newLastRow = 1 + numFilasDatos; // fila 1 = encabezado

  // 1) Bordes residuales de filas que tenían datos antes y ya no.
  if (oldLastRow > newLastRow) {
    try {
      sh.getRange(newLastRow + 1, 1, oldLastRow - newLastRow, numCols)
        .setBorder(false, false, false, false, false, false);
    } catch (e) {
      Logger.log('[Pendientes] Error limpiando bordes residuales: ' + e.message);
    }
  }

  // 2) Filtro nativo ajustado exactamente al rango actual (mismo patrón que
  // _crearTabla(), 00_Main.gs).
  try {
    if (sh.getFilter()) sh.getFilter().remove();
    if (numFilasDatos > 0) {
      sh.getRange(1, 1, newLastRow, numCols).createFilter();
    }
  } catch (e) {
    Logger.log('[Pendientes] Error recreando filtro: ' + e.message);
  }
}

/**
 * Obtiene el mapa de AtaquesHoy por tag desde la hoja Guerra, [→ Contexto_Base_Web.md §17B184]
 */
function _getAtaquesHoyDeGuerra(ctx) {
  var map = {};
  var ss  = _getSs();
  var sh  = ss.getSheetByName(CFG.SHEETS.GUERRA);
  if (!sh || sh.getLastRow() < 2) return map;

  var data = sh.getRange(2, 1, sh.getLastRow() - 1, GUERRA_TOTAL_COLS).getValues();

  for (var i = 0; i < data.length; i++) {
    var temporada = String(data[i][GC.TEMPORADA   - 1] || '');
    var semana    = Number(data[i][GC.SEMANA      - 1] || 1);
    var sIdx      = semana - 1;
    var diaLetra  = String(data[i][GC.DIA         - 1] || '');
    var tag       = String(data[i][GC.TAG         - 1] || '');
    var ataqHoy   = Number(data[i][GC.ATAQUES_HOY - 1]) || 0;

    if (String(ctx.temporada) === temporada &&
        sIdx === ctx.sectionIndex &&
        diaLetra === ctx.diaLetra &&
        tag) {
      map[tag] = Math.max(map[tag] || 0, ataqHoy);
    }
  }
  return map;
}

/**
 * Interpreta un valor de celda de Fecha como Date comparable, sin importar [→ Contexto_Base_Web.md §17B185]
 */
function _comoFechaComparable(val) {
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (val) {
    var d = _parseSpanishDate(String(val));
    if (d instanceof Date && !isNaN(d.getTime())) return d;
  }
  return null;
}

/**
 * Combina fila (nueva) dentro de filaExistente, conservando el mayor valor [→ Contexto_Base_Web.md §17B186]
 */
function _fusionarFilasPorMaximo(filaExistente, filaNueva, colsValor, idxFecha1based, idxEstado1based) {
  for (var c = 0; c < colsValor.length; c++) {
    var idxCol = colsValor[c] - 1;
    // TANDA 1 (20-sep-2026): si AMBAS filas tienen la celda vacía (sin dato, [→ Contexto_Base_Web.md §17B187]
    var nVacio = (filaNueva[idxCol] === '' || filaNueva[idxCol] === null || filaNueva[idxCol] === undefined);
    var eVacio = (filaExistente[idxCol] === '' || filaExistente[idxCol] === null || filaExistente[idxCol] === undefined);
    if (nVacio && eVacio) continue;
    // TANDA 12 (21-sep-2026): con filas de un CSV parseado (todo texto), las [→ Contexto_Base_Web.md §17B188]
    var vNuevo = _numDesdeCeldaLogs_(filaNueva[idxCol]) || 0;
    var vViejo = _numDesdeCeldaLogs_(filaExistente[idxCol]) || 0;
    filaExistente[idxCol] = Math.max(vNuevo, vViejo);
  }
  var idxF = idxFecha1based - 1;
  var fechaNuevaObj = _comoFechaComparable(filaNueva[idxF]);
  var fechaViejaObj = _comoFechaComparable(filaExistente[idxF]);
  if (fechaNuevaObj && (!fechaViejaObj || fechaNuevaObj > fechaViejaObj)) {
    filaExistente[idxF] = filaNueva[idxF];
  }
  // TANDA 13b (21-sep-2026): columna Estado (texto, solo Guerra_Logs; Guerra no [→ Contexto_Base_Web.md §17B189]
  if (idxEstado1based) {
    var iE = idxEstado1based - 1;
    var eNuevo = String(filaNueva[iE] || '').trim();
    var eViejo = String(filaExistente[iE] || '').trim();
    if (eNuevo === GL_ESTADO_LEIDO || eViejo === GL_ESTADO_LEIDO) filaExistente[iE] = GL_ESTADO_LEIDO;
    else if (eNuevo === GL_ESTADO_ESTIMADO || eViejo === GL_ESTADO_ESTIMADO) filaExistente[iE] = GL_ESTADO_ESTIMADO;
  }
}

function _corregirTemporadaEnGuerra(ss, temporadaCorrecta, fechaCorte) {
  var sh = ss.getSheetByName(CFG.SHEETS.GUERRA);
  if (!sh || sh.getLastRow() < 2) { Logger.log('[Corrección] Guerra: hoja vacía, nada que hacer.'); return; }

  var lastRow = sh.getLastRow();
  var data    = sh.getRange(2, 1, lastRow - 1, GUERRA_TOTAL_COLS).getValues();

  var colsValor = [GC.ATAQUES_HOY, GC.ATAQUES_SEM, GC.FAME, GC.BARCOS, GC.DON_R, GC.DON_D, GC.RANKING];
  var grupos = {};
  var filasFinal = [];
  var corregidas = 0;

  for (var i = 0; i < data.length; i++) {
    var fila     = data[i];
    var fecha    = fila[GC.FECHA - 1];
    var tempOrig = Number(fila[GC.TEMPORADA - 1]) || 0;
    var pIdx     = Number(fila[GC.PERIOD_IDX - 1]) || 0;

    // La columna Fecha de filas antiguas puede seguir guardada como TEXTO [→ Contexto_Base_Web.md §17B190]
    if (!(fecha instanceof Date) && fecha) {
      var fechaParseada = _parseSpanishDate(String(fecha));
      if (fechaParseada instanceof Date && !isNaN(fechaParseada.getTime())) {
        fecha = fechaParseada;
        fila[GC.FECHA - 1] = fechaParseada;
      }
    }

    var dentroDeVentana = (fecha instanceof Date) && !isNaN(fecha.getTime()) && fecha >= fechaCorte;
    if (dentroDeVentana && tempOrig > temporadaCorrecta) {
      fila[GC.TEMPORADA - 1] = temporadaCorrecta;
      var nuevoDiaGuerra = calcDiaGuerraIdx(CFG.REF_DEFAULT, temporadaCorrecta, pIdx);
      if (nuevoDiaGuerra instanceof Date && !isNaN(nuevoDiaGuerra.getTime())) fila[GC.DIA_GUERRA - 1] = nuevoDiaGuerra;
      corregidas++;
    }

    var tag   = String(fila[GC.TAG - 1] || '').trim();
    var clave = tag + '|' + fila[GC.TEMPORADA - 1] + '|' + fila[GC.PERIOD_IDX - 1];

    if (grupos.hasOwnProperty(clave)) {
      _fusionarFilasPorMaximo(filasFinal[grupos[clave]], fila, colsValor, GC.FECHA);
    } else {
      grupos[clave] = filasFinal.length;
      filasFinal.push(fila);
    }
  }

  var fusionadas = data.length - filasFinal.length;

  sh.getRange(2, 1, lastRow - 1, GUERRA_TOTAL_COLS).clearContent();
  if (filasFinal.length > 0) {
    sh.getRange(2, 1, filasFinal.length, GUERRA_TOTAL_COLS).setValues(filasFinal);
    sh.getRange(2, GC.FECHA,      filasFinal.length, 1).setNumberFormat('dddd, d "de" mmmm"," yyyy h:mm:ss AM/PM');
    sh.getRange(2, GC.DIA_GUERRA, filasFinal.length, 1).setNumberFormat('dd/mm/yyyy');
  }

  Logger.log('[Corrección] Guerra: ' + corregidas + ' fila(s) con Temporada corregida. ' +
    fusionadas + ' quedaron duplicadas tras la corrección y se fusionaron (se conservó el mayor valor de cada columna). ' +
    'Filas finales: ' + filasFinal.length + ' (antes: ' + data.length + ', ningún registro se perdió).');
}

function _corregirTemporadaEnGuerraLogs(ss, temporadaCorrecta, fechaCorte) {
  var sh = ss.getSheetByName(CFG.SHEETS.GUERRA_LOGS);
  if (!sh || sh.getLastRow() < 2) { Logger.log('[Corrección] Guerra_Logs: hoja vacía, nada que hacer.'); return; }

  var lastRow = sh.getLastRow();
  var data    = sh.getRange(2, 1, lastRow - 1, GUERRA_LOGS_TOTAL_COLS).getValues();

  // Guerra_Logs es un registro por CLAN (no por jugador) — la clave natural
  // es Tag(clan) + Temporada + PeriodIndex, no el tag de jugador.
  var colsValor = [GLC.DONACIONES, GLC.TROFEOS, GLC.COPAS, GLC.MIEMBROS,
                   GLC.REPAIR_PTS, GLC.PERIOD_PTS, GLC.PTS_EARNED, GLC.PROG_START, GLC.PROG_END,
                   GLC.PROG_EARNED, GLC.DEF_REMAINING, GLC.PROG_DEFENSES]; // TANDA 1 (20-sep-2026)
  var grupos = {};
  var filasFinal = [];
  var corregidas = 0;

  for (var i = 0; i < data.length; i++) {
    var fila     = data[i];
    var fecha    = fila[GLC.FECHA - 1];
    var tempOrig = Number(fila[GLC.TEMPORADA - 1]) || 0;
    var pIdx     = Number(fila[GLC.PERIOD_IDX - 1]) || 0;

    // Mismo resguardo que en _corregirTemporadaEnGuerra(): por si alguna
    // fila antigua quedó con Fecha en texto en vez de Date real.
    if (!(fecha instanceof Date) && fecha) {
      var fechaParseadaLogs = _parseSpanishDate(String(fecha));
      if (fechaParseadaLogs instanceof Date && !isNaN(fechaParseadaLogs.getTime())) {
        fecha = fechaParseadaLogs;
        fila[GLC.FECHA - 1] = fechaParseadaLogs;
      }
    }

    var dentroDeVentana = (fecha instanceof Date) && !isNaN(fecha.getTime()) && fecha >= fechaCorte;
    if (dentroDeVentana && tempOrig > temporadaCorrecta) {
      fila[GLC.TEMPORADA - 1] = temporadaCorrecta;
      var nuevoDiaGuerra = calcDiaGuerraIdx(CFG.REF_DEFAULT, temporadaCorrecta, pIdx);
      if (nuevoDiaGuerra instanceof Date && !isNaN(nuevoDiaGuerra.getTime())) fila[GLC.DIA_GUERRA - 1] = nuevoDiaGuerra;
      corregidas++;
    }

    var tagClan = String(fila[GLC.TAG - 1] || '').trim();
    var clave   = tagClan + '|' + fila[GLC.TEMPORADA - 1] + '|' + fila[GLC.PERIOD_IDX - 1];

    if (grupos.hasOwnProperty(clave)) {
      _fusionarFilasPorMaximo(filasFinal[grupos[clave]], fila, colsValor, GLC.FECHA, GLC.ESTADO); // TANDA 13b: Estado
    } else {
      grupos[clave] = filasFinal.length;
      filasFinal.push(fila);
    }
  }

  var fusionadas = data.length - filasFinal.length;

  sh.getRange(2, 1, lastRow - 1, GUERRA_LOGS_TOTAL_COLS).clearContent();
  if (filasFinal.length > 0) {
    sh.getRange(2, 1, filasFinal.length, GUERRA_LOGS_TOTAL_COLS).setValues(filasFinal);
    sh.getRange(2, GLC.FECHA,      filasFinal.length, 1).setNumberFormat('dddd, d "de" mmmm"," yyyy h:mm:ss AM/PM');
    sh.getRange(2, GLC.DIA_GUERRA, filasFinal.length, 1).setNumberFormat('dd/mm/yyyy');
  }

  Logger.log('[Corrección] Guerra_Logs: ' + corregidas + ' fila(s) con Temporada corregida. ' +
    fusionadas + ' quedaron duplicadas tras la corrección y se fusionaron (se conservó el mayor valor de cada columna). ' +
    'Filas finales: ' + filasFinal.length + ' (antes: ' + data.length + ', ningún registro se perdió).');
}

/**
 * _corregirTemporadaEnCSV(fileName, colMap, totalCols, colsValor, temporadaCorrecta, fechaCorte) [→ Contexto_Base_Web.md §17B191]
 */
function _corregirTemporadaEnCSV(fileName, colMap, totalCols, colsValor, temporadaCorrecta, fechaCorte) {
  var csvTexto = _loadCSVFromDrive(fileName);
  if (!csvTexto) {
    Logger.log('[Corrección] ' + fileName + ': no existe todavía en Drive, nada que corregir.');
    return;
  }

  var parsed = _parseCSV(csvTexto);
  if (parsed.length < 2) {
    Logger.log('[Corrección] ' + fileName + ': sin filas de datos, nada que corregir.');
    return;
  }

  var encabezado  = parsed[0];
  var grupos      = {};
  var filasFinal  = [];
  var corregidas  = 0;

  for (var i = 1; i < parsed.length; i++) {
    var fila = parsed[i].slice(0, totalCols);
    while (fila.length < totalCols) fila.push('');

    var fechaObj = _comoFechaComparable(fila[colMap.FECHA - 1]);
    var tempOrig = Number(fila[colMap.TEMPORADA - 1]) || 0;
    var pIdx     = Number(fila[colMap.PERIOD_IDX - 1]) || 0;

    var dentroDeVentana = !!fechaObj && fechaObj >= fechaCorte;
    if (dentroDeVentana && tempOrig > temporadaCorrecta) {
      fila[colMap.TEMPORADA - 1] = String(temporadaCorrecta);

      var nuevoDiaGuerra = calcDiaGuerraIdx(CFG.REF_DEFAULT, temporadaCorrecta, pIdx);
      if (nuevoDiaGuerra instanceof Date && !isNaN(nuevoDiaGuerra.getTime())) {
        fila[colMap.DIA_GUERRA - 1] = _formatFechaCanonica(nuevoDiaGuerra);
      }
      // Si la Fecha venía en texto español heredado (bug ya corregido para [→ Contexto_Base_Web.md §17B192]
      fila[colMap.FECHA - 1] = _formatFechaCanonica(fechaObj, true);

      corregidas++;
    }

    var tag   = String(fila[colMap.TAG - 1] || '').trim();
    var clave = tag + '|' + fila[colMap.TEMPORADA - 1] + '|' + fila[colMap.PERIOD_IDX - 1];

    if (grupos.hasOwnProperty(clave)) {
      _fusionarFilasPorMaximo(filasFinal[grupos[clave]], fila, colsValor, colMap.FECHA, colMap.ESTADO); // TANDA 13b: Estado (solo existe en GLC; en GC es undefined y se ignora)
    } else {
      grupos[clave] = filasFinal.length;
      filasFinal.push(fila);
    }
  }

  var fusionadas = (parsed.length - 1) - filasFinal.length;

  var salida = [encabezado].concat(filasFinal);
  _saveCSVToDrive(fileName, _encodeCSV(salida));

  Logger.log('[Corrección] ' + fileName + ' (directo sobre CSV, incluye temporadas ya purgadas de la hoja): ' +
    corregidas + ' fila(s) con Temporada corregida. ' + fusionadas +
    ' quedaron duplicadas tras la corrección y se fusionaron (se conservó el mayor valor de cada columna). ' +
    'Filas finales: ' + filasFinal.length + ' (antes: ' + (parsed.length - 1) + ', ningún registro se perdió).');
}

// PUNTO 3 (cambios_web.docx) / FASE 3 del plan de fases — "Cantidad de [→ Contexto_Base_Web.md §17B193]

/**
 * _getParticipacionHoyGuerra(ctx) [→ Contexto_Base_Web.md §17B194]
 */
function _getParticipacionHoyGuerra(ctx) {
  var ss = _getSs();

  // FIX (24-sep-2026, pedido del usuario -- auditoría Sheet->CSV->JSON, [→ Contexto_Base_Web.md §17B195]
  var lecturaGuerraHoy = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.GUERRA, 'Backup_Guerra.csv', GUERRA_TOTAL_COLS);

  // 1) Filas de la hoja Guerra que corresponden EXACTAMENTE al día de hoy
  //    (mismo Temporada + Semana + PeriodIndex que ctx).
  var filasHoy = [];
  var datos = lecturaGuerraHoy.filas;
  for (var i = 0; i < datos.length; i++) {
    var f = datos[i];
    if (Number(f[GC.TEMPORADA - 1])   === Number(ctx.temporada) &&
        Number(f[GC.SEMANA - 1])      === Number(ctx.sectionIndex + 1) &&
        Number(f[GC.PERIOD_IDX - 1])  === Number(ctx.periodIndex)) {
      filasHoy.push(f);
    }
  }

  // 2) Agrupar por Tag -> { nombre, clanes: { nombreClan: ataqHoy } }. [→ Contexto_Base_Web.md §17B196]
  var porTag = {};
  for (var j = 0; j < filasHoy.length; j++) {
    var fila = filasHoy[j];
    var tag = cleanTag(fila[GC.TAG - 1]);
    if (!tag) continue;
    var clanFila     = String(fila[GC.CLAN - 1] || '');
    var ataqHoyFila  = Number(fila[GC.ATAQUES_HOY - 1]) || 0;
    if (!porTag[tag]) porTag[tag] = { nombre: String(fila[GC.NOMBRE - 1] || ''), clanes: {} };
    porTag[tag].clanes[clanFila] = ataqHoyFila;
  }

  // 3) Roster ACTIVO por clan (Directorio) — mismo criterio que usa
  //    _webRosterCalcular() (37_Web_API.gs): DC.ESTADO === 'Activo'.
  var shDirPartHoy = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  var dataDir;
  if (shDirPartHoy && shDirPartHoy.getLastRow() >= 2) {
    dataDir = _leerDirectorioFisicoComoDC(ss);
  } else {
    var lecturaDirPartHoy = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.DIRECTORIO, 'Backup_Directorio.csv', DIR_TOTAL_COLS);
    dataDir = (lecturaDirPartHoy.origen === 'csv') ? lecturaDirPartHoy.filas : [];
  }
  var porClan = {}; // nombreClan -> { clan, reservadas: [], disponibles: [] }

  for (var k = 0; k < dataDir.length; k++) {
    var filaDir = dataDir[k];
    if (String(filaDir[DC.ESTADO - 1] || '').trim() !== 'Activo') continue;
    var clanNombreDir = String(filaDir[DC.CLAN - 1] || '');
    if (!clanNombreDir) continue;
    var tagDir = cleanTag(filaDir[DC.TAG - 1]);
    if (!tagDir) continue;

    if (!porClan[clanNombreDir]) {
      porClan[clanNombreDir] = { clan: clanNombreDir, reservadas: [], disponibles: [] };
    }

    var entradaTag = porTag[tagDir];
    var ataqHoyEnEsteClan = (entradaTag && entradaTag.clanes[clanNombreDir] !== undefined)
      ? entradaTag.clanes[clanNombreDir]
      : 0;

    // FIX (11-oct-2026, pedido usuaria): cada cuenta lleva sus ataques usados hoy en ESTE clan (ataquesHoy); guerra.html lo lee en pendientesHoy(). [→ Contexto_Base_Web.md §PF030]
    var infoCuenta = { tag: String(filaDir[DC.TAG - 1] || ''), nombre: String(filaDir[DC.NOMBRE - 1] || ''), ataquesHoy: Number(ataqHoyEnEsteClan) || 0 };
    if (ataqHoyEnEsteClan > 0) {
      porClan[clanNombreDir].reservadas.push(infoCuenta);
    } else {
      porClan[clanNombreDir].disponibles.push(infoCuenta);
    }
  }

  // 4) Casos multi-clan: mismo Tag con AtaquesHoy > 0 en más de un clan hoy.
  var multiClan = [];
  for (var tagKey in porTag) {
    var entrada = porTag[tagKey];
    var clanesConAtaque = [];
    var totalAtaques = 0;
    for (var clanKey in entrada.clanes) {
      if (entrada.clanes[clanKey] > 0) {
        clanesConAtaque.push(clanKey);
        totalAtaques += entrada.clanes[clanKey];
      }
    }
    if (clanesConAtaque.length > 1) {
      multiClan.push({
        tag: tagKey,
        nombre: entrada.nombre,
        clanes: clanesConAtaque,
        totalAtaquesHoy: totalAtaques
      });
    }
  }

  return {
    ok: true,
    periodIndex: ctx.periodIndex,
    clanes: Object.keys(porClan).map(function (c) { return porClan[c]; }),
    multiClan: multiClan
  };
}

/**
 * testParticipacionHoyGuerra() [→ Contexto_Base_Web.md §17B197]
 */
function testParticipacionHoyGuerra() {
  var ctx = _getCtx();
  var resultado = _getParticipacionHoyGuerra(ctx);
  Logger.log('[Test] PeriodIndex: ' + resultado.periodIndex);
  for (var i = 0; i < resultado.clanes.length; i++) {
    var c = resultado.clanes[i];
    Logger.log('[Test] ' + c.clan + ' -> reservadas: ' + c.reservadas.length + ', disponibles: ' + c.disponibles.length);
  }
  Logger.log('[Test] Casos multi-clan hoy: ' + resultado.multiClan.length);
  if (resultado.multiClan.length) Logger.log(JSON.stringify(resultado.multiClan));
}

/**
 * _apiGuerraReiniciadaParaClan_(datosGuerra, clanNombre, temporada, periodIndex, participants) [→ Contexto_Base_Web.md §17B198]
 */
function _apiGuerraReiniciadaParaClan_(datosGuerra, clanNombre, temporada, periodIndex, participants) {
  if (!participants || participants.length === 0) return false;
  for (var i = 0; i < participants.length; i++) {
    var p = participants[i];
    if ((Number(p.decksUsed) || 0) !== 0 || (Number(p.fame) || 0) !== 0 || (Number(p.boatAttacks) || 0) !== 0) return false;
  }
  var conDatos = 0;
  for (var r = 0; r < datosGuerra.length; r++) {
    var f = datosGuerra[r];
    if (String(f[GC.CLAN - 1] || '') !== String(clanNombre)) continue;
    if (Number(f[GC.TEMPORADA - 1]) !== Number(temporada)) continue;
    if (Number(f[GC.PERIOD_IDX - 1]) !== Number(periodIndex)) continue;
    if ((Number(f[GC.ATAQUES_SEM - 1]) || 0) > 0 || (Number(f[GC.FAME - 1]) || 0) > 0) { conDatos++; if (conDatos >= 3) return true; }
  }
  return false;
}

/**
 * _semAcumDiaAnteriorGuerra_(datosGuerra, tag, clanNombre, temporada, periodIndexAnterior) [→ Contexto_Base_Web.md §17B199]
 */
function _semAcumDiaAnteriorGuerra_(datosGuerra, tag, clanNombre, temporada, periodIndexAnterior) {
  var tagU = String(tag || '').trim().toUpperCase();
  for (var r = 0; r < datosGuerra.length; r++) {
    var f = datosGuerra[r];
    if (Number(f[GC.PERIOD_IDX - 1]) !== Number(periodIndexAnterior)) continue;
    if (Number(f[GC.TEMPORADA - 1]) !== Number(temporada)) continue;
    if (String(f[GC.CLAN - 1] || '') !== String(clanNombre)) continue;
    if (String(f[GC.TAG - 1] || '').trim().toUpperCase() !== tagU) continue;
    return Number(f[GC.ATAQUES_SEM - 1]) || 0;
  }
  return null;
}