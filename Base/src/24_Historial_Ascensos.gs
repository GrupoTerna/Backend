// ==============================================================================
// 24_Historial_Ascensos.gs
// Vista derivada del Directorio: hoja Historial_A/D (ingresos, salidas, ascensos).
// ==============================================================================

// AVISOS ABIERTOS / VERIFICACIONES ABIERTAS [→ Contexto_Base_Web.md §24B001]

// ----- Variables y constantes -----

// Orden jerárquico de rangos (usa la MISMA ortografía que mapRol() en [→ Contexto_Base_Web.md §24B002]
var RANGO_ORDEN = ['Miembro', 'Veterano', 'Colíder', 'Líder'];

// COLUMNAS Temporada / Semana / Día EN Historial_I/S, Historial_A/D Y Comentarios (26-oct-2026, pedido de la usuaria; [→ Contexto_Base_Web.md §PF267]).
// Son 5 columnas AL FINAL de cada hoja (no se mueven las existentes, que se leen por posición), calculadas SIEMPRE desde la columna Fecha:
// Temporada (interna), Temporada RoyaleAPI, Temporada Supercell (AAAA-MM), Semana y Día (nombre del día de la semana).
var TSD_ENCABEZADOS = ['Temporada', 'Temporada RoyaleAPI', 'Temporada Supercell', 'Semana', 'Día'];
var TSD_DIAS_ES_ = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']; // índice = Date.getDay()
var HISTORIAL_TOTAL_COLS = 12; // Historial_I/S: 7 columnas propias + 5 de TSD
var HISTORIAL_TSD_COL = 8;     // primera columna de TSD en Historial_I/S

// ----- Funciones manuales / punto de entrada -----

/**
 * completarTemporadaSemanaDiaHojas() — proyecto Base. Rellena (o recalcula) las 5 columnas Temporada / Temporada RoyaleAPI / Temporada Supercell / Semana / Día
 * en Historial_I/S, Historial_A/D y Comentarios a partir de la Fecha de cada fila. Se puede correr las veces que haga falta (es idempotente). [→ Contexto_Base_Web.md §PF267]
 */
function completarTemporadaSemanaDiaHojas() {
  var ss = _getSs();
  var plan = [
    { nombre: CFG.SHEETS.HISTORIAL,   colFecha: 2,          colTsd: HISTORIAL_TSD_COL },
    { nombre: CFG.SHEETS.ASCENSOS,    colFecha: ASC.FECHA,  colTsd: ASC.TSD },
    { nombre: CFG.SHEETS.COMENTARIOS, colFecha: CMC.FECHA,  colTsd: CMC.TSD }
  ];
  for (var i = 0; i < plan.length; i++) {
    var sh = ss.getSheetByName(plan[i].nombre);
    if (!sh) { Logger.log('[TSD] La hoja "' + plan[i].nombre + '" no existe, se omite.'); continue; }
    var r = _completarTSDEnHoja_(sh, plan[i].colFecha, plan[i].colTsd);
    Logger.log('[TSD] ' + plan[i].nombre + ': ' + r.filas + ' fila(s) revisadas, ' + r.sinFecha + ' sin Fecha válida, ' + r.sinTemporada + ' sin temporada calculable.');
  }
}

/**
 * limpiarDuplicadosHistorial() [→ Contexto_Base_Web.md §24B003]
 */
function limpiarDuplicadosHistorial() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.HISTORIAL);
  if (!sh || sh.getLastRow() < 3) {
    Logger.log('[Limpieza Historial] No hay suficientes filas para limpiar.');
    return;
  }

  var totalRows = sh.getLastRow() - 1;
  var data = sh.getRange(2, 1, totalRows, 7).getValues();

  function clase(mov) {
    if (mov === 'Ingreso' || mov === 'Reingreso') return 'entrada';
    if (mov === 'Salida'  || mov === 'Expulsión') return 'salida';
    return 'otro';
  }

  // Agrupar por (Tag, ClanTag) conservando el índice original.
  var grupos = {};
  for (var i = 0; i < data.length; i++) {
    var tag     = String(data[i][2] || '').trim();
    var clanTag = String(data[i][6] || '').trim();
    var clave   = tag + '|' + clanTag;
    if (!grupos[clave]) grupos[clave] = [];
    grupos[clave].push({
      idx:   i,
      fecha: data[i][1] instanceof Date ? data[i][1].getTime() : 0,
      mov:   String(data[i][4] || '').trim()
    });
  }

  var indicesAEliminar = {};
  for (var clave in grupos) {
    var lista = grupos[clave];
    lista.sort(function(a, b) { return a.fecha - b.fecha; });
    var claseAnterior = null;
    for (var j = 0; j < lista.length; j++) {
      var claseActual = clase(lista[j].mov);
      if (claseActual === claseAnterior) {
        indicesAEliminar[lista[j].idx] = true; // sin cambio real de estado entre medio -> duplicado
      } else {
        claseAnterior = claseActual;
      }
    }
  }

  var filasLimpias = [];
  for (var i = 0; i < data.length; i++) {
    if (!indicesAEliminar[i]) filasLimpias.push(data[i]);
  }

  var eliminados = data.length - filasLimpias.length;
  if (eliminados === 0) {
    Logger.log('[Limpieza Historial] No se encontraron duplicados.');
    return;
  }

  // Mismo orden de visualización que usa _updateHistorial: Clan, luego Fecha,
  // luego Tag, luego Movimiento.
  var shClan = ss.getSheetByName(CFG.SHEETS.CLAN);
  var clanOrden = {};
  if (shClan && shClan.getLastRow() >= 2) {
    var clanData2 = shClan.getRange(2, 1, shClan.getLastRow() - 1, 3).getValues();
    for (var k = 0; k < clanData2.length; k++) clanOrden[String(clanData2[k][2] || '').toLowerCase()] = k;
  }
  filasLimpias.sort(function(a, b) {
    var cA = String(a[5] || '').toLowerCase(), cB = String(b[5] || '').toLowerCase();
    var oA = clanOrden[cA] !== undefined ? clanOrden[cA] : 999;
    var oB = clanOrden[cB] !== undefined ? clanOrden[cB] : 999;
    if (oA !== oB) return oA - oB;
    var fA = a[1] instanceof Date ? a[1].getTime() : 0;
    var fB = b[1] instanceof Date ? b[1].getTime() : 0;
    if (fA !== fB) return fA - fB;
    var tA = String(a[2] || ''), tB = String(b[2] || '');
    if (tA !== tB) return tA < tB ? -1 : 1;
    return String(a[4] || '').localeCompare(String(b[4] || ''));
  });
  for (var i = 0; i < filasLimpias.length; i++) filasLimpias[i][0] = i + 1;

  sh.getRange(2, 1, totalRows, 7).clearContent();
  sh.getRange(2, 1, filasLimpias.length, 7).setValues(filasLimpias);
  for (var i = 0; i < filasLimpias.length; i++) {
    if (filasLimpias[i][1] instanceof Date && !isNaN(filasLimpias[i][1].getTime())) {
      _setDateCell(sh, i + 2, 2, filasLimpias[i][1], 'dddd, d "de" mmmm"," yyyy h:mm:ss am/pm');
    }
  }
  applyBorderCenter(sh.getRange(2, 1, filasLimpias.length, 7));
  if (totalRows > filasLimpias.length) {
    try {
      sh.getRange(filasLimpias.length + 2, 1, totalRows - filasLimpias.length, 7)
        .setBorder(false, false, false, false, false, false)
        .setBackground(null);
    } catch(e) {}
  }

  // 26-oct-2026 (§PF267): la reescritura solo cubre las 7 columnas propias; Temporada / Semana / Día se recalculan desde Fecha (también limpia las de las filas que sobraron).
  _completarTSDEnHoja_(sh, 2, HISTORIAL_TSD_COL);

  Logger.log('[Limpieza Historial] Eliminados ' + eliminados + ' registros duplicados (sin cambio real de estado entre medio).');
}

function updateAscensosSheet(ss, dirData) {
  var sh = ss.getSheetByName(CFG.SHEETS.ASCENSOS);
  if (!sh) { Logger.log('[Ascensos] ABORT: hoja Ascensos no existe.'); return; }

  var csvExistente = _loadCSVFromDrive('Backup_Directorio.csv');
  if (!csvExistente) {
    Logger.log('[Ascensos] Sin Backup_Directorio.csv previo (primera corrida) — no se puede comparar, no se detectan cambios esta vez.');
    _reordenarHistorialAscensosGlobal(ss, sh, []);
    return;
  }

  var parsedDir = _parseCSV(csvExistente);
  if (parsedDir.length < 2) {
    Logger.log('[Ascensos] Backup_Directorio.csv vacío, nada que comparar.');
    return;
  }

  var headers = parsedDir[0];
  var hIdx = {};
  for (var c = 0; c < headers.length; c++) hIdx[String(headers[c]).trim()] = c;
  if (hIdx['Tag'] === undefined || hIdx['Rango'] === undefined) {
    Logger.log('[Ascensos] Backup_Directorio.csv no tiene columnas Tag/Rango, aborto.');
    return;
  }

  var rangoPrevioPorTag = {};
  for (var i = 1; i < parsedDir.length; i++) {
    var row = parsedDir[i];
    var tg = String(row[hIdx['Tag']] || '').trim();
    if (tg) rangoPrevioPorTag[tg] = String(row[hIdx['Rango']] || '').trim();
  }

  // FASE 6 (13-sep-2026, pedido del usuario, plan de Cambio de Rango): antes [→ Contexto_Base_Web.md §24B004]
  var propuestasPendientes = _indexarPropuestasPendientesAscensos(sh);

  var nuevosRegistros = [];
  var propuestasResueltas = 0;
  for (var d = 0; d < dirData.length; d++) {
    var dir = dirData[d];
    var estado = String(dir[DC.ESTADO - 1] || '').trim();
    if (estado !== 'Activo') continue;

    var tag = String(dir[DC.TAG - 1] || '').trim();
    if (!tag) continue;

    // Excluir clanes vetados: Ascensos solo debe registrar cambios de rango [→ Contexto_Base_Web.md §24B005]
    var clanTagAscenso = String(dir[DC.CLAN_TAG - 1] || '').trim();
    if (CFG.TERNA_TAGS.indexOf(clanTagAscenso) < 0) continue;

    var rangoPrevio = rangoPrevioPorTag[tag];
    if (rangoPrevio === undefined) continue; // no había snapshot previo para este tag

    var rangoActual = String(dir[DC.RANGO - 1] || '').trim();
    if (!rangoPrevio || !rangoActual || rangoPrevio === rangoActual) continue;

    var idxAnterior = RANGO_ORDEN.indexOf(rangoPrevio);
    var idxNuevo    = RANGO_ORDEN.indexOf(rangoActual);
    if (idxAnterior < 0 || idxNuevo < 0) continue; // rango no reconocido

    // FASE 6: ¿este cambio real coincide con una propuesta CR_Lista pendiente [→ Contexto_Base_Web.md §24B006]
    var clavePropuesta = tag + '|' + rangoPrevio + '|' + rangoActual;
    var propuestaPendiente = propuestasPendientes[clavePropuesta];
    if (propuestaPendiente) {
      _resolverPropuestaCRListaComoRealizada(sh, propuestaPendiente, dir);
      delete propuestasPendientes[clavePropuesta]; // no reusar la misma fila dos veces en esta corrida
      propuestasResueltas++;
      continue;
    }

    nuevosRegistros.push(_crearRegistroAscenso(dir, rangoPrevio, idxAnterior, idxNuevo));
  }

  if (nuevosRegistros.length === 0 && propuestasResueltas === 0) {
    Logger.log('[Ascensos] Sin cambios de rango detectados en esta corrida.');
    // Igual se reordena globalmente: cubre el caso de que la hoja haya [→ Contexto_Base_Web.md §24B007]
    _reordenarHistorialAscensosGlobal(ss, sh, []);
    return;
  }

  var shCom = ss.getSheetByName(CFG.SHEETS.COMENTARIOS);
  // Copiar el comentario por defecto a la hoja Comentarios ANTES de [→ Contexto_Base_Web.md §24B008]
  if (shCom) {
    for (var j = 0; j < nuevosRegistros.length; j++) {
      var registro = nuevosRegistros[j];
      if (registro[ASC.COMENTARIO - 1]) _copiarComentarioAscensoAComentarios(shCom, registro);
    }
  }

  // Reordena TODA la hoja (existentes + nuevos) por Clan > Fecha — ver [→ Contexto_Base_Web.md §24B009]
  _reordenarHistorialAscensosGlobal(ss, sh, nuevosRegistros);

  Logger.log('[Ascensos] ' + nuevosRegistros.length + ' registro(s) nuevo(s) creado(s), ' +
    propuestasResueltas + ' propuesta(s) CR_Lista resuelta(s) como Realizado, hoja reordenada globalmente.');
}

// ----- Funciones internas / helpers -----

/**
 * _tsdDesdeFecha_(fecha, offset, ref) [→ Contexto_Base_Web.md §PF267]
 * Devuelve [temporada interna, temporada RoyaleAPI, temporada Supercell, semana, día] para una Fecha, o 5 vacíos si la fecha no es válida.
 * Usa el DÍA CALENDARIO (se descarta la hora): así un registro del lunes a las 15:00 sigue siendo lunes. Misma cuenta que _fechaATemporadaSemana()
 * (14_Nuevos_RoyaleAPI.gs: mes efectivo, primer lunes de la temporada, semana = día desde ese lunes / 7 + 1), pero SIN descartar las fechas anteriores a T1:
 * dan temporada 0 o negativa, igual que Correcciones_Guerra.csv (§PF247). `offset` (RoyaleAPI - propia) se puede pasar ya leído para no leer
 * PropertiesService por fila (§PF242); lo mismo vale para `ref` (CFG.REF_DEFAULT también lee PropertiesService en cada acceso): en un bucle por filas se leen
 * una vez y se pasan los dos.
 */
function _tsdDesdeFecha_(fecha, offset, ref) {
  var vacio = ['', '', '', '', ''];
  if (!(fecha instanceof Date) || isNaN(fecha.getTime())) return vacio;
  if (ref === undefined) ref = CFG.REF_DEFAULT;
  if (!ref || isNaN(ref.getTime())) return vacio;

  var dia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  var anio = dia.getFullYear();
  var mes  = dia.getMonth();
  if (dia < primerLunesDelMes(anio, mes)) { // antes del primer lunes del mes: pertenece a la temporada del mes anterior
    mes--;
    if (mes < 0) { mes = 11; anio--; }
  }
  var temporada = calcTemporadaDesdeMesEfectivo(ref, { anio: anio, mes: mes });
  var pl = primerLunesTemporada(ref, temporada); // con temporada <= 0 el mes sale negativo y Date lo normaliza al año anterior
  if (!pl || isNaN(pl.getTime())) return vacio;
  var periodIndex = Math.round((dia.getTime() - pl.getTime()) / 86400000);
  if (periodIndex < 0) return vacio; // red de seguridad, no debería pasar tras el ajuste de mes efectivo

  var off = (offset === undefined) ? _getTemporadaOffsetRoyaleApi() : offset;
  return [
    temporada,
    _cgwTemporadaRoyaleApiTexto_(temporada, off),
    _cgwTemporadaSupercellTexto_(temporada, off),
    Math.floor(periodIndex / 7) + 1,
    TSD_DIAS_ES_[dia.getDay()]
  ];
}

/**
 * _completarTSDEnHoja_(sh, colFecha, colTsd) [→ Contexto_Base_Web.md §PF267]
 * Asegura los 5 encabezados en colTsd..colTsd+4 y recalcula TODAS las filas de datos desde la Fecha (columna colFecha) en una sola escritura.
 * Es idempotente: sirve igual después de reordenar la hoja, de reenumerar temporadas (cambia la Ref y el offset) o de editar una Fecha a mano.
 * La columna de Temporada Supercell se fuerza a texto ('@'): sin eso Sheets convierte "2026-05" en una fecha.
 * Devuelve { filas, sinFecha, sinTemporada }.
 */
function _completarTSDEnHoja_(sh, colFecha, colTsd) {
  var n = TSD_ENCABEZADOS.length;
  var res = { filas: 0, sinFecha: 0, sinTemporada: 0 };
  if (!sh) return res;

  var ultimaCol = colTsd + n - 1;
  if (sh.getMaxColumns() < ultimaCol) sh.insertColumnsAfter(sh.getMaxColumns(), ultimaCol - sh.getMaxColumns());
  sh.getRange(1, colTsd, 1, n).setValues([TSD_ENCABEZADOS]);
  applyHeaderStyle(sh, ultimaCol);

  var lastRow = sh.getLastRow();
  if (lastRow < 2) return res;

  var numFilas = lastRow - 1;
  var fechas = sh.getRange(2, colFecha, numFilas, 1).getValues();
  var offset = _getTemporadaOffsetRoyaleApi(); // una sola lectura (§PF242)
  var refTemporadas = CFG.REF_DEFAULT;         // idem: el getter lee PropertiesService en cada acceso
  var valores = [];
  for (var i = 0; i < numFilas; i++) {
    var f = fechas[i][0];
    var v = _tsdDesdeFecha_(f, offset, refTemporadas);
    if (!(f instanceof Date) || isNaN(f.getTime())) res.sinFecha++;
    else if (v[0] === '') res.sinTemporada++;
    valores.push(v);
  }

  try { sh.getRange(2, colTsd + 2, Math.max(sh.getMaxRows() - 1, numFilas), 1).setNumberFormat('@'); } catch (eFmt) {}
  var rng = sh.getRange(2, colTsd, numFilas, n);
  rng.setValues(valores);
  applyBorderCenter(rng);
  res.filas = numFilas;
  return res;
}

/**
 * _escribirTSDEnFilaHoja_(sh, fila, colTsd, fecha) [→ Contexto_Base_Web.md §PF267]
 * Escribe las 5 columnas de una sola fila (las hojas a las que solo se agregan filas al final: Comentarios). La de Supercell se pone como texto antes de escribir.
 */
function _escribirTSDEnFilaHoja_(sh, fila, colTsd, fecha) {
  try {
    var v = _tsdDesdeFecha_(fecha);
    try { sh.getRange(fila, colTsd + 2).setNumberFormat('@'); } catch (eFmt) {}
    sh.getRange(fila, colTsd, 1, v.length).setValues([v]);
  } catch (e) {
    Logger.log('[TSD] No se pudieron escribir Temporada/Semana/Día en la fila ' + fila + ' de "' + sh.getName() + '": ' + e.message);
  }
}

/**
 * _updateHistorial [→ Contexto_Base_Web.md §24B010]
 */
function _updateHistorial(ss, dirData) {
  var sh = ss.getSheetByName(CFG.SHEETS.HISTORIAL);
  if (!sh) return;

  var now = new Date();

  // Mapa de tags activos actuales
  var activosActuales = {};
  for (var i = 0; i < dirData.length; i++) {
    var r = dirData[i];
    var estadoDir = String(r[DC.ESTADO - 1] || '');
    var tag = String(r[DC.TAG - 1] || '').trim();
    if (tag && estadoDir === 'Activo') {
      activosActuales[tag] = {
        jugador:  String(r[DC.JUGADOR  - 1] || r[DC.NOMBRE - 1] || ''),
        nombre:   String(r[DC.NOMBRE   - 1] || ''),
        clan:     String(r[DC.CLAN     - 1] || ''),
        clanTag:  String(r[DC.CLAN_TAG - 1] || '')
      };
    }
  }

  // Historial completo: usado para (a) saber si un tag YA tuvo alguna vez un [→ Contexto_Base_Web.md §24B011]
  var lastRowHist = sh.getLastRow();
  var historialPorTagClan = {};
  // Último movimiento registrado para cada (tag, clanTag), en orden cronológico [→ Contexto_Base_Web.md §24B012]
  var ultimoMovPorTagClan = {};
  var histDataCompleto = [];
  if (lastRowHist >= 2) {
    histDataCompleto = sh.getRange(2, 1, lastRowHist - 1, 7).getValues();
    for (var i = 0; i < histDataCompleto.length; i++) {
      var tgH2 = String(histDataCompleto[i][2] || '').trim(); // col 3 = Tag
      var ctH2 = String(histDataCompleto[i][6] || '').trim(); // col 7 = ClanTag
      var mvH2 = String(histDataCompleto[i][4] || '').trim(); // col 5 = Movimiento
      if (tgH2 && ctH2) {
        historialPorTagClan[tgH2 + '|' + ctH2] = true;
        ultimoMovPorTagClan[tgH2 + '|' + ctH2] = mvH2;
      }
    }
  }

  // Snapshot previo (último Backup_Directorio.csv sincronizado): tags activos [→ Contexto_Base_Web.md §24B013]
  var csvExistente = _loadCSVFromDrive('Backup_Directorio.csv');
  var tagsActivosPrevios = {};
  if (csvExistente) {
    try {
      var parsedDir = _parseCSV(csvExistente);
      if (parsedDir.length > 1) {
        var headers = parsedDir[0];
        var hIdx = {};
        for (var c = 0; c < headers.length; c++) hIdx[headers[c].trim()] = c;
        for (var i = 1; i < parsedDir.length; i++) {
          var row = parsedDir[i];
          var estado = hIdx['Estado'] !== undefined ? String(row[hIdx['Estado']] || '') : '';
          var tg = hIdx['Tag'] !== undefined ? String(row[hIdx['Tag']] || '').trim() : '';
          if (tg && estado === 'Activo') {
            tagsActivosPrevios[tg] = {
              jugador: hIdx['Jugador'] !== undefined ? String(row[hIdx['Jugador']] || '') :
                       (hIdx['Nombre'] !== undefined ? String(row[hIdx['Nombre']] || '') : ''),
              nombre:  hIdx['Nombre']  !== undefined ? String(row[hIdx['Nombre']] || '')  : '',
              clan:    hIdx['Clan']    !== undefined ? String(row[hIdx['Clan']] || '')    : '',
              clanTag: hIdx['ClanTag'] !== undefined ? String(row[hIdx['ClanTag']] || '') : ''
            };
          }
        }
      }
    } catch(e) { Logger.log('[Historial] Error leyendo CSV Directorio para salidas: ' + e.message); }
  }

  var nuevasFilas = [];

  // 1. Ingresos / Reingresos — evaluado POR CLAN (un mismo tag en clanes [→ Contexto_Base_Web.md §24B014]
  for (var tag in activosActuales) {
    var actual = activosActuales[tag];
    var previo = tagsActivosPrevios[tag];

    // Ya estaba activo en este mismo clan -> no hubo cambio, no se registra.
    if (previo && previo.clanTag === actual.clanTag) continue;

    // Fase 3: solo se registra si el clan de DESTINO es un clan Terna. Un [→ Contexto_Base_Web.md §24B015]
    if (CFG.TERNA_TAGS.indexOf(actual.clanTag) === -1) continue;

    // SEGUNDA CAPA: si el último movimiento registrado en el Historial para [→ Contexto_Base_Web.md §24B016]
    var claveTC = tag + '|' + actual.clanTag;
    var ultimoMov = ultimoMovPorTagClan[claveTC];
    if (ultimoMov === 'Ingreso' || ultimoMov === 'Reingreso') continue;

    var yaEstuvoEnEsteClan = !!historialPorTagClan[claveTC];
    var movimiento = yaEstuvoEnEsteClan ? 'Reingreso' : 'Ingreso';
    // Estructura: N°|Fecha|Tag|Nombre|Movimiento|Clan|ClanTag
    nuevasFilas.push([null, now, tag, actual.nombre, movimiento, actual.clan, actual.clanTag]);
  }

  // 2. Salidas: el tag estaba activo en un clan en el snapshot previo y ya
  //    no está activo en ESE mismo clan (quedó inactivo o se movió a otro clan).
  for (var tag in tagsActivosPrevios) {
    var prev = tagsActivosPrevios[tag];
    var actualNow = activosActuales[tag];
    if (actualNow && actualNow.clanTag === prev.clanTag) continue; // sigue activo en el mismo clan

    // Fase 3: solo se registra si el clan del que SALIÓ era un clan Terna. [→ Contexto_Base_Web.md §24B017]
    if (CFG.TERNA_TAGS.indexOf(prev.clanTag) === -1) continue;

    // Misma protección anti-duplicados que en Ingreso/Reingreso: si lo último
    // registrado para este tag+clan ya es una Salida/Expulsión, no se repite.
    var ultimoMovSal = ultimoMovPorTagClan[tag + '|' + prev.clanTag];
    if (ultimoMovSal === 'Salida' || ultimoMovSal === 'Expulsión') continue;

    // Estructura: N°|Fecha|Tag|Nombre|Movimiento|Clan|ClanTag
    nuevasFilas.push([null, now, tag, prev.nombre, 'Salida', prev.clan, prev.clanTag]);
  }

  // Escribir nuevas filas
  if (nuevasFilas.length > 0) {
    for (var j = 0; j < nuevasFilas.length; j++) {
      var startRowApp = sh.getLastRow() < 1 ? 2 : sh.getLastRow() + 1;
      nuevasFilas[j][0] = startRowApp;
      sh.appendRow(nuevasFilas[j]);
      var newRow = sh.getLastRow();
      // Fecha en col 2
      _setDateCell(sh, newRow, 2, nuevasFilas[j][1], 'dddd, d "de" mmmm"," yyyy h:mm:ss am/pm');
    }
  }

  // GUARD (28-sep-2026): solo se reordena/reescribe la hoja si TODAS las filas [→ Contexto_Base_Web.md §24B018]
  var hayFilasSinFecha = false;
  if (sh.getLastRow() >= 2) {
    var fechasActuales = sh.getRange(2, 2, sh.getLastRow() - 1, 1).getValues();
    var filasSinFecha = 0;
    for (var f = 0; f < fechasActuales.length; f++) {
      var vf = fechasActuales[f][0];
      if (!(vf instanceof Date) || isNaN(vf.getTime())) filasSinFecha++;
    }
    if (filasSinFecha > 0) {
      hayFilasSinFecha = true;
      Logger.log('[Historial][ALERTA] ' + filasSinFecha + ' de ' + fechasActuales.length +
                 ' filas de ' + CFG.SHEETS.HISTORIAL + ' no tienen una Fecha válida. ' +
                 'Se omite el reordenamiento/reescritura de la hoja para no propagar el daño; ' +
                 'las filas nuevas se agregaron al final. Revisar/restaurar desde Backup_Historial_I-S.csv.');
    }
  }

  // Ordenar toda la hoja (solo si todas las filas tienen Fecha válida)
  if (sh.getLastRow() >= 3 && !hayFilasSinFecha) {
    var totalHistRows = sh.getLastRow() - 1;
    var allHist = sh.getRange(2, 1, totalHistRows, 7).getValues();

    var ss2 = _getSs();
    var shClan = ss2.getSheetByName(CFG.SHEETS.CLAN);
    var clanOrden = {};
    if (shClan && shClan.getLastRow() >= 2) {
      var clanData2 = shClan.getRange(2, 1, shClan.getLastRow() - 1, 3).getValues();
      for (var k = 0; k < clanData2.length; k++) {
        // col 3 = Nombre clan (índice 2)
        clanOrden[String(clanData2[k][2] || '').toLowerCase()] = k;
      }
    }

    allHist.sort(function(a, b) {
      // Clan (col 6, índice 5)
      var cA = String(a[5] || '').toLowerCase(), cB = String(b[5] || '').toLowerCase();
      var oA = clanOrden[cA] !== undefined ? clanOrden[cA] : 999;
      var oB = clanOrden[cB] !== undefined ? clanOrden[cB] : 999;
      if (oA !== oB) return oA - oB;
      // Fecha (col 2, índice 1)
      var fA = a[1] instanceof Date ? a[1].getTime() : 0;
      var fB = b[1] instanceof Date ? b[1].getTime() : 0;
      if (fA !== fB) return fA - fB;
      // Tag (col 3, índice 2)
      var tA = String(a[2] || ''), tB = String(b[2] || '');
      if (tA !== tB) return tA < tB ? -1 : 1;
      // Movimiento (col 5, índice 4)
      return String(a[4] || '').localeCompare(String(b[4] || ''));
    });

    for (var i = 0; i < allHist.length; i++) allHist[i][0] = i + 1;
    // FIX (28-sep-2026): escritura de UN SOLO PASO con las fechas incluidas. [→ Contexto_Base_Web.md §24B019]
    sh.getRange(2, 1, allHist.length, 7).setValues(allHist);
    try {
      sh.getRange(2, 2, allHist.length, 1).setNumberFormat('dddd, d "de" mmmm"," yyyy h:mm:ss am/pm');
    } catch (eFmt) {
      Logger.log('[Historial] No se pudo aplicar el formato de fecha: ' + eFmt.message);
    }
    // Verificación: ninguna fecha debe haberse perdido en la escritura.
    var fechasTrasEscribir = sh.getRange(2, 2, allHist.length, 1).getValues();
    var perdidas = 0;
    for (var v = 0; v < fechasTrasEscribir.length; v++) {
      if (!(fechasTrasEscribir[v][0] instanceof Date)) perdidas++;
    }
    if (perdidas > 0) {
      Logger.log('[Historial][ALERTA] Tras reescribir la hoja, ' + perdidas + ' filas quedaron sin Fecha válida.');
    }
    // Centrado + bordes en TODAS las filas con datos (antes no se aplicaba [→ Contexto_Base_Web.md §24B020]
    applyBorderCenter(sh.getRange(2, 1, allHist.length, HISTORIAL_TOTAL_COLS));

    // Bordes por bloque de clan: dado que allHist queda ordenado primero por [→ Contexto_Base_Web.md §24B021]
    var blockStart = 0;
    for (var i = 1; i <= allHist.length; i++) {
      var clanActualBlk = i < allHist.length ? String(allHist[i][5] || '') : null;
      var clanPrevBlk = String(allHist[blockStart][5] || '');
      if (i === allHist.length || clanActualBlk !== clanPrevBlk) {
        var blockRows = i - blockStart;
        sh.getRange(blockStart + 2, 1, blockRows, HISTORIAL_TOTAL_COLS)
          .setBorder(true, true, true, true, false, false,
                     '#000000', SpreadsheetApp.BorderStyle.SOLID_THICK);
        blockStart = i;
      }
    }

    // Limpiar bordes/formato residual en filas vacías por debajo de los datos
    // ("basura" visual que quedaba de versiones anteriores con más filas).
    var maxRowsHist = sh.getMaxRows();
    if (maxRowsHist > allHist.length + 1) {
      try {
        sh.getRange(allHist.length + 2, 1, maxRowsHist - allHist.length - 1, HISTORIAL_TOTAL_COLS)
          .setBorder(false, false, false, false, false, false)
          .setBackground(null);
      } catch(e) {}
    }
  }

  // Formato condicional por Movimiento (col 5 = colLetter(5))
  if (sh.getLastRow() >= 2) {
    var dataRange = sh.getRange(2, 1, sh.getLastRow() - 1, HISTORIAL_TOTAL_COLS), colMov = colLetter(5);
    var rules = [
      SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + colMov + '2="Ingreso"').setBackground(CFG.COLORES.HIST_INGRESO_BG).setRanges([dataRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + colMov + '2="Reingreso"').setBackground(CFG.COLORES.HIST_REINGRESO_BG).setRanges([dataRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + colMov + '2="Salida"').setBackground(CFG.COLORES.HIST_SALIDA_BG).setRanges([dataRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + colMov + '2="Expulsión"').setBackground('#f8bbd0').setRanges([dataRange]).build(),
    ];
    _tryCondFmt(sh, rules);
  }

  // 26-oct-2026 (§PF267): Temporada / Semana / Día se recalculan desde Fecha DESPUÉS de ordenar y escribir (las filas se reordenan por Clan y Fecha, y las filas nuevas entran sin estas columnas).
  _completarTSDEnHoja_(sh, 2, HISTORIAL_TSD_COL);
}

// HOJA ASCENSOS [→ Contexto_Base_Web.md §24B022]
/**
 * updateAscensosSheet(ss, dirData) [→ Contexto_Base_Web.md §24B023]
 */
/**
 * _reaplicarFormatoAscensosExistente(sh) [→ Contexto_Base_Web.md §24B024]
 */
function _reaplicarFormatoAscensosExistente(sh) {
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return;
  applyBorderCenter(sh.getRange(2, 1, lastRow - 1, ASCENSOS_TOTAL_COLS));
  _aplicarFormatoCondicionalAscensos(sh);
  Logger.log('[Ascensos] Formato/bordes reaplicados sobre ' + (lastRow - 1) + ' registro(s) existentes (sin cambios nuevos esta corrida).');
}

/**
 * _getOrdenClanAscensos(ss) [→ Contexto_Base_Web.md §24B025]
 */
function _getOrdenClanAscensos(ss) {
  var shClanAsc = ss.getSheetByName(CFG.SHEETS.CLAN);
  var clanOrdenAsc = {};
  if (shClanAsc && shClanAsc.getLastRow() >= 2) {
    var clanDataAsc = shClanAsc.getRange(2, 1, shClanAsc.getLastRow() - 1, 3).getValues();
    for (var kAsc = 0; kAsc < clanDataAsc.length; kAsc++) {
      clanOrdenAsc[String(clanDataAsc[kAsc][2] || '').toLowerCase()] = kAsc;
    }
  }
  return clanOrdenAsc;
}

/**
 * _reordenarHistorialAscensosGlobal(ss, sh, registrosNuevos) [→ Contexto_Base_Web.md §24B026]
 */
function _reordenarHistorialAscensosGlobal(ss, sh, registrosNuevos) {
  var lastRow = sh.getLastRow();
  var existentes = (lastRow >= 2) ? sh.getRange(2, 1, lastRow - 1, ASCENSOS_TOTAL_COLS).getValues() : [];

  var todos = existentes.concat(registrosNuevos || []);
  if (todos.length === 0) return; // hoja vacía, nada que ordenar

  var clanOrdenAsc = _getOrdenClanAscensos(ss);
  todos.sort(function(a, b) {
    var cA = String(a[ASC.CLAN - 1] || '').toLowerCase(), cB = String(b[ASC.CLAN - 1] || '').toLowerCase();
    var oA = clanOrdenAsc[cA] !== undefined ? clanOrdenAsc[cA] : 999;
    var oB = clanOrdenAsc[cB] !== undefined ? clanOrdenAsc[cB] : 999;
    if (oA !== oB) return oA - oB;
    var fA = a[ASC.FECHA - 1] instanceof Date ? a[ASC.FECHA - 1].getTime() : 0;
    var fB = b[ASC.FECHA - 1] instanceof Date ? b[ASC.FECHA - 1].getTime() : 0;
    return fA - fB;
  });

  // Renumerar N° según la posición final (ver docblock: cambia de
  // significado a propósito, y de paso corrige duplicados heredados).
  for (var n = 0; n < todos.length; n++) {
    todos[n][ASC.NUM - 1] = n + 1;
  }

  sh.getRange(2, 1, todos.length, ASCENSOS_TOTAL_COLS).setValues(todos);

  // Formato de fecha por fila: las filas que YA existían en esa posición [→ Contexto_Base_Web.md §24B027]
  var filaInicioNuevas = lastRow >= 2 ? lastRow + 1 : 2;
  for (var m = filaInicioNuevas; m <= 1 + todos.length; m++) {
    var reg = todos[m - 2];
    _setDateCell(sh, m, ASC.FECHA, reg[ASC.FECHA - 1], 'dddd, d "de" mmmm"," yyyy h:mm:ss am/pm');
    _aplicarFormatoFilaAscenso(sh, m);
  }

  applyBorderCenter(sh.getRange(2, 1, todos.length, ASCENSOS_TOTAL_COLS));
  _aplicarFormatoCondicionalAscensos(sh);

  // 26-oct-2026 (§PF267): Temporada / Semana / Día se recalculan desde Fecha para TODAS las filas (las nuevas entran con esas columnas vacías y el reorden las movió de lugar).
  _completarTSDEnHoja_(sh, ASC.FECHA, ASC.TSD);

  Logger.log('[Ascensos] Hoja reordenada globalmente por Clan > Fecha (' + todos.length + ' fila(s) totales).');
}

/**
 * _crearRegistroAscenso(filaDirectorio, rangoAnterior, idxAnterior, idxNuevo) [→ Contexto_Base_Web.md §24B028]
 */
function _crearRegistroAscenso(filaDirectorio, rangoAnterior, idxAnterior, idxNuevo) {
  var registro = new Array(ASCENSOS_TOTAL_COLS).fill('');

  var rangoNuevo = String(filaDirectorio[DC.RANGO - 1] || '').trim();
  var clan       = String(filaDirectorio[DC.CLAN - 1] || '').trim();

  registro[ASC.TAG - 1]         = String(filaDirectorio[DC.TAG - 1] || '').trim();
  registro[ASC.NOMBRE - 1]      = filaDirectorio[DC.NOMBRE - 1];
  registro[ASC.NOM_MULTI - 1]   = filaDirectorio[DC.NOM_MULTI - 1];
  registro[ASC.INICIALES - 1]   = filaDirectorio[DC.INICIALES - 1];
  registro[ASC.PERMISO - 1]     = filaDirectorio[DC.PERMISO - 1];
  registro[ASC.INACTIVIDAD - 1] = filaDirectorio[DC.INACTIVIDAD - 1];
  registro[ASC.FECHA - 1]       = new Date();
  registro[ASC.CLAN - 1]        = clan;
  registro[ASC.CLAN_TAG - 1]    = filaDirectorio[DC.CLAN_TAG - 1];
  registro[ASC.LIDER - 1]       = filaDirectorio[DC.LIDER - 1];
  registro[ASC.AUTOR - 1]       = 'Diana';
  registro[ASC.RANGO - 1]       = rangoAnterior;
  registro[ASC.RANGO_2 - 1]     = rangoNuevo;
  registro[ASC.TIPO - 1]        = (idxNuevo > idxAnterior) ? 'Ascenso' : 'Degradación';
  registro[ASC.ESTADO - 1]      = String(filaDirectorio[DC.ESTADO - 1] || '').trim();
  registro[ASC.COMENTARIO - 1]  = _generarComentarioAscensoDefault(registro[ASC.TIPO - 1], rangoAnterior, rangoNuevo, clan);

  return registro;
}

/**
 * _generarComentarioAscensoDefault(tipo, rangoAnterior, rangoNuevo, nombreClan) [→ Contexto_Base_Web.md §24B029]
 */
function _generarComentarioAscensoDefault(tipo, rangoAnterior, rangoNuevo, nombreClan) {
  return tipo + ' de ' + (rangoAnterior || 'desconocido') + ' a ' +
         (rangoNuevo || 'desconocido') + ' en el clan ' + (nombreClan || '');
}

/**
 * _copiarComentarioAscensoAComentarios(shCom, registro) [→ Contexto_Base_Web.md §24B030]
 */
function _copiarComentarioAscensoAComentarios(shCom, registro) {
  var nomMulti = registro[ASC.NOM_MULTI - 1] || registro[ASC.NOMBRE - 1];
  var now = registro[ASC.FECHA - 1] instanceof Date ? registro[ASC.FECHA - 1] : new Date();
  // NOTA (26-ago-2026): columna "Nom_Multi" (encabezado, ver _setupComentarios() [→ Contexto_Base_Web.md §24B031]
  var filaCMC = new Array(COMENTARIOS_TOTAL_COLS).fill('');
  filaCMC[CMC.NUM - 1]        = shCom.getLastRow();
  filaCMC[CMC.FECHA - 1]      = now;
  filaCMC[CMC.TAG - 1]        = registro[ASC.TAG - 1];
  filaCMC[CMC.NOMBRE - 1]     = registro[ASC.NOMBRE - 1];
  filaCMC[CMC.NOM_MULTI - 1]  = nomMulti;
  filaCMC[CMC.CLAN_TAG - 1]   = registro[ASC.CLAN_TAG - 1];
  filaCMC[CMC.CLAN - 1]       = registro[ASC.CLAN - 1];
  filaCMC[CMC.RANGO - 1]      = registro[ASC.RANGO_2 - 1];
  filaCMC[CMC.LIDER - 1]      = registro[ASC.LIDER - 1];
  filaCMC[CMC.COMENTARIO - 1] = registro[ASC.COMENTARIO - 1];
  shCom.appendRow(filaCMC);
  _setDateCell(shCom, shCom.getLastRow(), CMC.FECHA, now, 'dddd, d "de" mmmm"," yyyy h:mm:ss am/pm');
  _escribirTSDEnFilaHoja_(shCom, shCom.getLastRow(), CMC.TSD, now); // 26-oct-2026 (§PF267)
}

// CR_Lista — escritura de propuestas en Historial_A/D (FASE 5, 13-sep-2026, [→ Contexto_Base_Web.md §24B032]

/**
 * _registrarPropuestasCRListaEnHistorial(idAscenso, idDescenso) [→ Contexto_Base_Web.md §24B033]
 */
function _registrarPropuestasCRListaEnHistorial(idAscenso, idDescenso) {
  var resultado = _calcularPropuestasCambioRango(idAscenso, idDescenso);
  if (!resultado.ok) {
    return { ok: false, error: resultado.error, agregadas: 0, saltadas: 0 };
  }
  if (resultado.propuestas.length === 0) {
    return { ok: true, agregadas: 0, saltadas: 0 };
  }

  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.ASCENSOS);
  if (!sh) return { ok: false, error: 'La hoja Historial_A/D (Ascensos) no existe.', agregadas: 0, saltadas: 0 };

  // Directorio completo, para poder rellenar los campos que Historial_A/D [→ Contexto_Base_Web.md §24B034]
  var dataDir = _leerDirectorioFisicoComoDC(ss);
  var dirPorTag = {};
  dataDir.forEach(function (fila) {
    var tag = String(fila[DC.TAG - 1] || '').trim();
    if (tag) dirPorTag[tag] = fila;
  });

  // Filas YA existentes, para el chequeo de deduplicación -- se lee una
  // sola vez antes del loop (no una vez por propuesta).
  var lastRow = sh.getLastRow();
  var existentes = (lastRow >= 2) ? sh.getRange(2, 1, lastRow - 1, ASCENSOS_TOTAL_COLS).getValues() : [];
  function yaExistePendiente(tag, tipo, rango2) {
    for (var i = 0; i < existentes.length; i++) {
      var f = existentes[i];
      if (String(f[ASC.TAG - 1] || '').trim() !== tag) continue;
      if (String(f[ASC.TIPO - 1] || '').trim() !== tipo) continue;
      if (String(f[ASC.RANGO_2 - 1] || '').trim() !== rango2) continue;
      if (String(f[ASC.ESTADO_PROPUESTA - 1] || '').trim() !== 'Planificado') continue;
      return true;
    }
    return false;
  }

  var MAPA_TIPO_RANGO2 = {
    'Ascenso_miembro':       { tipo: 'Ascenso',        rango2: 'Veterano' },
    'Ascenso_veterano':      { tipo: 'Ascenso',        rango2: 'Colíder' },
    'Descenso_veterano':     { tipo: 'Degradación',    rango2: 'Miembro' },
    'Descenso_colider':      { tipo: 'Degradación',    rango2: 'Veterano' },
    'Descenso_miembro':      { tipo: 'Expulsión',      rango2: '' },
    'EligibleAdmin_colider': { tipo: 'Elegible Admin', rango2: '' },
    // NUEVO (28-sep-2026, Fase 14 pregunta 29): Colider de cantera que sube de clan. Rango_2 queda [→ Contexto_Base_Web.md §24B035]
    'AscensoClan_colider':  { tipo: 'Ascenso de clan', rango2: '' }
  };

  var shCom = ss.getSheetByName(CFG.SHEETS.COMENTARIOS);
  var nuevosRegistros = [];
  var saltadas = 0;
  // NUEVO (16-sep-2026, pedido del usuario -- sexto paso chico): conteo [→ Contexto_Base_Web.md §24B036]
  var agregadasPorTipo = { Ascenso: 0, Descenso: 0, Admin: 0, AscensoClan: 0 };

  // QUITADO (17-sep-2026, pedido del usuario -- Comentario debe usar [→ Contexto_Base_Web.md §24B037]

  resultado.propuestas.forEach(function (p) {
    var rangoNorm = String(p.rangoActual || '').toLowerCase().replace('í', 'i').replace('é', 'e');
    var mapKey = p.tipoPropuesta + '_' + rangoNorm;
    var mapeo = MAPA_TIPO_RANGO2[mapKey];
    if (!mapeo) {
      Logger.log('[CR_Lista->Historial] Combinación no reconocida (' + mapKey + ') para ' + p.tag + ', se ignora.');
      return;
    }

    if (yaExistePendiente(p.tag, mapeo.tipo, mapeo.rango2)) {
      saltadas++;
      return;
    }

    var filaDir = dirPorTag[p.tag];
    var registro = new Array(ASCENSOS_TOTAL_COLS).fill('');
    registro[ASC.TAG - 1]         = p.tag;
    registro[ASC.NOMBRE - 1]      = p.nombre;
    registro[ASC.NOM_MULTI - 1]   = filaDir ? filaDir[DC.NOM_MULTI - 1] : '';
    registro[ASC.INICIALES - 1]   = filaDir ? filaDir[DC.INICIALES - 1] : '';
    registro[ASC.PERMISO - 1]     = filaDir ? filaDir[DC.PERMISO - 1] : '';
    registro[ASC.INACTIVIDAD - 1] = filaDir ? filaDir[DC.INACTIVIDAD - 1] : '';
    registro[ASC.FECHA - 1]       = new Date();
    registro[ASC.CLAN - 1]        = p.clan;
    registro[ASC.CLAN_TAG - 1]    = filaDir ? filaDir[DC.CLAN_TAG - 1] : '';
    registro[ASC.LIDER - 1]       = filaDir ? filaDir[DC.LIDER - 1] : '';
    registro[ASC.AUTOR - 1]       = 'Diana';
    registro[ASC.RANGO - 1]       = p.rangoActual;
    registro[ASC.RANGO_2 - 1]     = mapeo.rango2;
    registro[ASC.TIPO - 1]        = mapeo.tipo;
    registro[ASC.ESTADO - 1]      = filaDir ? String(filaDir[DC.ESTADO - 1] || '').trim() : '';
    // FIX (17-sep-2026, pedido del usuario -- "a Historial_A/D en la [→ Contexto_Base_Web.md §24B038]
    registro[ASC.COMENTARIO - 1]  = p.detalle;
    registro[ASC.ESTADO_PROPUESTA - 1] = 'Planificado';

    if (shCom && registro[ASC.COMENTARIO - 1]) _copiarComentarioAscensoAComentarios(shCom, registro);
    var categoria = p.tipoPropuesta === 'EligibleAdmin' ? 'Admin' : p.tipoPropuesta;
    if (categoria in agregadasPorTipo) agregadasPorTipo[categoria]++;
    nuevosRegistros.push(registro);
  });

  if (nuevosRegistros.length > 0) {
    _reordenarHistorialAscensosGlobal(ss, sh, nuevosRegistros);
  }

  Logger.log('[CR_Lista->Historial] ' + nuevosRegistros.length + ' propuesta(s) nueva(s) agregada(s) como Planificado, ' +
    saltadas + ' ya existente(s) sin duplicar.');

  return { ok: true, agregadas: nuevosRegistros.length, saltadas: saltadas, agregadasPorTipo: agregadasPorTipo };
}

/**
 * _aplicarFormatoFilaAscenso(sh, fila) [→ Contexto_Base_Web.md §24B039]
 */
function _aplicarFormatoFilaAscenso(sh, fila) {
  var ruleRango = SpreadsheetApp.newDataValidation()
    .requireValueInList(RANGO_ORDEN, true)
    .setAllowInvalid(true) // solo advertencia: son columnas inmutables/históricas, no deben bloquear
    .build();
  sh.getRange(fila, ASC.RANGO).setDataValidation(ruleRango);
  sh.getRange(fila, ASC.RANGO_2).setDataValidation(ruleRango);

  // FASE 5 (13-sep-2026, pedido del usuario, plan de Cambio de Rango): [→ Contexto_Base_Web.md §24B040]
  var ruleEstadoPropuesta = SpreadsheetApp.newDataValidation()
    .requireValueInList(ASC_ESTADO_PROPUESTA_VALORES, true)
    .setAllowInvalid(true)
    .build();
  sh.getRange(fila, ASC.ESTADO_PROPUESTA).setDataValidation(ruleEstadoPropuesta);
}

/**
 * _aplicarFormatoCondicionalAscensos(sh) [→ Contexto_Base_Web.md §24B041]
 */
function _aplicarFormatoCondicionalAscensos(sh) {
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return;
  var dataRange = sh.getRange(2, 1, lastRow - 1, ASCENSOS_TOTAL_COLS);
  var colEstado = colLetter(ASC.ESTADO), colRango2 = colLetter(ASC.RANGO_2), colTipo = colLetter(ASC.TIPO);
  var rules = [
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + colEstado + '2="Inactivo"')
      .setBackground(CFG.COLORES.INACTIVO_BG).setRanges([dataRange]).build(),
  ];
  for (var tipo in CFG.ASCENSOS_TIPO_BG) {
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$' + colTipo + '2="' + tipo + '"')
      .setBackground(CFG.ASCENSOS_TIPO_BG[tipo]).setRanges([dataRange]).build());
  }
  rules.push(
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + colRango2 + '2="Líder"')
      .setBackground(CFG.COLORES.LIDER_BG).setRanges([dataRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + colRango2 + '2="Colíder"')
      .setBackground(CFG.COLORES.COLIDER_BG).setRanges([dataRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + colRango2 + '2="Veterano"')
      .setBackground(CFG.COLORES.VETERANO_BG).setRanges([dataRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + colRango2 + '2="Miembro"')
      .setBackground(CFG.COLORES.MIEMBRO_BG).setRanges([dataRange]).build()
  );
  _tryCondFmt(sh, rules);
}

// FASE 7 (Parte B, 06-sep-2026, punto 7 del documento — edición de autor de [→ Contexto_Base_Web.md §24B042]

/**
 * _webAdminAscensosEditables(token) [→ Contexto_Base_Web.md §24B043]
 */
function _webAdminAscensosEditables(token) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };

  var ss = _getSs();
  // FIX (24-sep-2026, pedido del usuario -- auditoría Sheet->CSV->JSON, [→ Contexto_Base_Web.md §24B044]
  var lecturaAsc = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.ASCENSOS, 'Backup_Historial_A-D.csv', ASCENSOS_TOTAL_COLS);
  if (lecturaAsc.origen === 'vacio') return { ok: true, ascensos: [] };

  var dataAsc = lecturaAsc.filas;
  if (lecturaAsc.origen === 'csv') {
    // Igual que _webAscensosRecientes() (37_Web_API.gs): el CSV guarda [→ Contexto_Base_Web.md §24B045]
    dataAsc = dataAsc.map(function (f) {
      var nueva = f.slice();
      var fechaObj = _parseSpanishDate(nueva[ASC.FECHA - 1]);
      if (fechaObj instanceof Date && !isNaN(fechaObj.getTime())) nueva[ASC.FECHA - 1] = fechaObj;
      return nueva;
    });
  }

  var tz = Session.getScriptTimeZone() || 'America/Lima';

  var lista = dataAsc.map(function (f) {
    var fechaCelda = f[ASC.FECHA - 1];
    var fechaOk = fechaCelda instanceof Date && !isNaN(fechaCelda.getTime());
    var fechaIso = fechaOk ? fechaCelda.toISOString() : '';
    var tagLimpio = String(f[ASC.TAG - 1] || '').trim();
    return {
      id:            tagLimpio + '|' + fechaIso, // ver docblock: clave estable, no la fila física
      tag:           tagLimpio,
      nombre:        String(f[ASC.NOMBRE - 1] || ''),
      clan:          String(f[ASC.CLAN - 1] || ''),
      tipo:          String(f[ASC.TIPO - 1] || ''),
      rangoAnterior: String(f[ASC.RANGO - 1] || ''),
      rangoNuevo:    String(f[ASC.RANGO_2 - 1] || ''),
      fechaTxt:      fechaOk ? Utilities.formatDate(fechaCelda, tz, 'dd/MM/yyyy') : '',
      autor:         String(f[ASC.AUTOR - 1] || ''),
      comentario:    String(f[ASC.COMENTARIO - 1] || ''),
      _fechaOrden:   fechaOk ? fechaCelda.getTime() : 0
    };
  })
  .sort(function (a, b) { return b._fechaOrden - a._fechaOrden; })
  .map(function (r) { delete r._fechaOrden; return r; })
  .slice(0, 100); // últimos 100 — de sobra para elegir cuál editar sin mandar la hoja entera

  return { ok: true, ascensos: lista };
}

/**
 * _webAdminEditarAutorAscenso(token, datos) [→ Contexto_Base_Web.md §24B046]
 */
function _webAdminEditarAutorAscenso(token, datos) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  var admin = _webAuthObtenerAdmin(token);
  if (!admin) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  // 19-sep-2026 (pedido de Diana): requiere la Función 'Corregir autor'. [→ Contexto_Base_Web.md §24B047]
  var adminFresco = _webBuscarAdminPorCelular(admin.celular);
  if (!adminFresco || !_webAdminTieneFuncion(adminFresco.funciones, WEB_FUNCION_CORREGIR_AUTOR)) {
    return { ok: false, error: 'No tienes permiso para corregir el autor de ascensos y descensos.' };
  }

  if (!datos || !datos.id) return { ok: false, error: 'Falta identificar qué registro editar.' };
  var autorNuevo = String((datos && datos.autorNuevo) || '').trim();
  if (!autorNuevo) return { ok: false, error: 'Ingresa el nuevo autor.' };

  var idStr = String(datos.id);
  var sepIdx = idStr.indexOf('|');
  var tagBuscado = sepIdx >= 0 ? idStr.slice(0, sepIdx) : '';
  var fechaIsoBuscada = sepIdx >= 0 ? idStr.slice(sepIdx + 1) : '';
  if (!tagBuscado || !fechaIsoBuscada) return { ok: false, error: 'Identificador de registro inválido.' };

  var ss = _getSs();
  var shAsc = ss.getSheetByName(CFG.SHEETS.ASCENSOS);
  if (!shAsc || shAsc.getLastRow() < 2) return { ok: false, error: 'No encontré el historial de ascensos.' };

  var lastRow = shAsc.getLastRow();
  var dataAsc = shAsc.getRange(2, 1, lastRow - 1, ASCENSOS_TOTAL_COLS).getValues();
  var filaEncontrada = -1;
  for (var i = 0; i < dataAsc.length; i++) {
    var fechaCelda = dataAsc[i][ASC.FECHA - 1];
    var fechaIso = (fechaCelda instanceof Date && !isNaN(fechaCelda.getTime())) ? fechaCelda.toISOString() : '';
    var tagFila = String(dataAsc[i][ASC.TAG - 1] || '').trim();
    if (tagFila === tagBuscado && fechaIso === fechaIsoBuscada) { filaEncontrada = i; break; }
  }
  if (filaEncontrada === -1) {
    return { ok: false, error: 'No encontré ese registro (puede que la hoja se haya actualizado mientras tanto). Recarga la lista e intenta de nuevo.' };
  }

  var filaSheet = filaEncontrada + 2; // +2: fila de encabezado (1) + índice 0-based -> 1-based
  var autorAnterior = String(dataAsc[filaEncontrada][ASC.AUTOR - 1] || '').trim();

  if (autorAnterior === autorNuevo) {
    return { ok: false, error: 'Ese ya es el autor actual de este registro.' };
  }

  var quienEdita = (admin.nombre || admin.tag || 'Admin');
  var tz = Session.getScriptTimeZone() || 'America/Lima';
  var ahoraTxt = Utilities.formatDate(new Date(), tz, 'dd/MM/yyyy HH:mm');
  var comentarioAnterior = String(dataAsc[filaEncontrada][ASC.COMENTARIO - 1] || '').trim();
  var lineaAuditoria = '[' + ahoraTxt + '] Autor cambiado de "' + (autorAnterior || 'sin autor') +
    '" a "' + autorNuevo + '" por ' + quienEdita + '.';
  var comentarioNuevo = comentarioAnterior ? (comentarioAnterior + ' | ' + lineaAuditoria) : lineaAuditoria;

  shAsc.getRange(filaSheet, ASC.AUTOR).setValue(autorNuevo);
  shAsc.getRange(filaSheet, ASC.COMENTARIO).setValue(comentarioNuevo);

  return { ok: true, autor: autorNuevo, comentario: comentarioNuevo };
}

// CR_Lista — detección automática de "Realizado" (FASE 6, 13-sep-2026, pedido [→ Contexto_Base_Web.md §24B048]

/**
 * _indexarPropuestasPendientesAscensos(sh) [→ Contexto_Base_Web.md §24B049]
 */
function _indexarPropuestasPendientesAscensos(sh) {
  var mapa = {};
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return mapa;

  var datos = sh.getRange(2, 1, lastRow - 1, ASCENSOS_TOTAL_COLS).getValues();
  for (var i = 0; i < datos.length; i++) {
    var f = datos[i];
    if (String(f[ASC.ESTADO_PROPUESTA - 1] || '').trim() !== 'Planificado') continue;

    var tag    = String(f[ASC.TAG - 1] || '').trim();
    var rango  = String(f[ASC.RANGO - 1] || '').trim();
    var rango2 = String(f[ASC.RANGO_2 - 1] || '').trim();
    if (!tag || !rango || !rango2) continue; // 'Expulsión'/'Elegible Admin' -- nunca se resuelven aquí

    var clave = tag + '|' + rango + '|' + rango2;
    if (!mapa[clave]) {
      mapa[clave] = {
        filaSheet:        i + 2, // +2: encabezado (fila 1) + índice 0-based -> 1-based
        comentarioActual: String(f[ASC.COMENTARIO - 1] || '')
      };
    }
  }
  return mapa;
}

/**
 * _resolverPropuestaCRListaComoRealizada(sh, propuestaPendiente, filaDirectorio) [→ Contexto_Base_Web.md §24B050]
 */
function _resolverPropuestaCRListaComoRealizada(sh, propuestaPendiente, filaDirectorio) {
  var tz = Session.getScriptTimeZone() || 'America/Lima';
  var ahoraTxt = Utilities.formatDate(new Date(), tz, 'dd/MM/yyyy HH:mm');
  var lineaAuditoria = '[' + ahoraTxt + '] Confirmado: Supercell reporta el cambio de rango real, coincide con esta propuesta de CR_Lista.';
  var comentarioNuevo = propuestaPendiente.comentarioActual
    ? (propuestaPendiente.comentarioActual + ' | ' + lineaAuditoria)
    : lineaAuditoria;

  sh.getRange(propuestaPendiente.filaSheet, ASC.ESTADO_PROPUESTA).setValue('Realizado');
  sh.getRange(propuestaPendiente.filaSheet, ASC.COMENTARIO).setValue(comentarioNuevo);

  var estadoReal = String(filaDirectorio[DC.ESTADO - 1] || '').trim();
  if (estadoReal) sh.getRange(propuestaPendiente.filaSheet, ASC.ESTADO).setValue(estadoReal);

  Logger.log('[CR_Lista->Historial] Fila ' + propuestaPendiente.filaSheet +
    ': propuesta resuelta como Realizado (confirmada por cambio de rango real detectado en el Directorio).');
}
// --- Corrida más reciente de propuestas de cambio de rango (PF286, 28-oct-2026; la usan los documentos de Cambio de rango, 25 y 29) [→ Contexto_Base_Web.md §PF286] ---

/**
 * _corridaCambioRangoVacia_()
 * Resultado de «no hay corrida»: los documentos de Cambio de rango lo usan cuando todavía no se registró ninguna propuesta del par evaluado.
 */
function _corridaCambioRangoVacia_() {
  return { hayCorrida: false, diaTxt: '', temporada: '', semana: '', dia: '', total: 0, aplicadosN: 0, pendientesN: 0, aplicados: [], rangoPrevioPorTag: {} };
}

/**
 * _leerCorridaCambioRangoHistorial_(desdeMs)
 * Lee Historial_A/D y devuelve la corrida más reciente de propuestas (ver _corridaCambioRangoDesdeRegistros_()).
 * `desdeMs` (opcional) deja fuera las propuestas anteriores a esa marca de tiempo: sirve para no confundir la corrida de un par anterior con la del par que se evalúa.
 * Solo lee la hoja; no escribe nada.
 */
function _leerCorridaCambioRangoHistorial_(desdeMs) {
  var sh = _getSs().getSheetByName(CFG.SHEETS.ASCENSOS);
  if (!sh || sh.getLastRow() < 2) return _corridaCambioRangoVacia_();
  var datos = sh.getRange(2, 1, sh.getLastRow() - 1, ASCENSOS_TOTAL_COLS).getValues();
  var offset = _getTemporadaOffsetRoyaleApi(); // una sola lectura, igual que _completarTSDEnHoja_()
  var refTemporadas = CFG.REF_DEFAULT;
  var registros = datos.map(function (f) {
    var fecha = f[ASC.FECHA - 1];
    // Temporada, Semana y Día salen de la Fecha con la misma función que llena esas columnas de la hoja (_tsdDesdeFecha_): [temporada, RoyaleAPI, Supercell, semana, día].
    var tsd = _tsdDesdeFecha_(fecha, offset, refTemporadas);
    return {
      tag: String(f[ASC.TAG - 1] || '').trim(),
      nombre: String(f[ASC.NOMBRE - 1] || '').trim(),
      clan: String(f[ASC.CLAN - 1] || '').trim(),
      rango: String(f[ASC.RANGO - 1] || '').trim(),
      rango2: String(f[ASC.RANGO_2 - 1] || '').trim(),
      tipo: String(f[ASC.TIPO - 1] || '').trim(),
      estadoProp: String(f[ASC.ESTADO_PROPUESTA - 1] || '').trim(),
      fechaMs: (fecha instanceof Date && !isNaN(fecha.getTime())) ? fecha.getTime() : NaN,
      temporada: tsd[0],
      semana: tsd[3],
      dia: tsd[4]
    };
  });
  return _corridaCambioRangoDesdeRegistros_(registros, desdeMs, function (ms) {
    return Utilities.formatDate(new Date(ms), 'America/Lima', 'yyyy-MM-dd');
  });
}

/**
 * _corridaCambioRangoDesdeRegistros_(registros, desdeMs, claveDia) — función pura (se prueba en Node, sin hojas).
 * Una «corrida» son las propuestas (Estado de propuesta «Planificado» o «Realizado») cuya Fecha cae en el mismo día de Lima que la propuesta más reciente: la Fecha
 * es la de creación de la propuesta y no cambia al pasar a «Realizado» (_resolverPropuestaCRListaComoRealizada()), así que todas las de una corrida comparten día.
 * Las filas sin Estado de propuesta (cambios reales sin propuesta) no cuentan. `claveDia(ms)` devuelve el día como 'aaaa-mm-dd'.
 * Devuelve { hayCorrida, diaTxt ('dd/mm/aaaa'), temporada, semana, dia, total, aplicadosN, pendientesN, aplicados (los «Realizado»), rangoPrevioPorTag ({ tag: { rango, rango2 } } solo de Ascenso y Degradación realizados) }.
 */
function _corridaCambioRangoDesdeRegistros_(registros, desdeMs, claveDia) {
  var res = _corridaCambioRangoVacia_();
  var conDia = [];
  (registros || []).forEach(function (r) {
    if (r.estadoProp !== 'Planificado' && r.estadoProp !== 'Realizado') return;
    if (!isFinite(r.fechaMs)) return;
    if (desdeMs !== null && desdeMs !== undefined && r.fechaMs < desdeMs) return;
    conDia.push({ r: r, dia: claveDia(r.fechaMs) });
  });
  if (!conDia.length) return res;

  var ultimoDia = conDia.reduce(function (m, x) { return x.dia > m ? x.dia : m; }, '');
  var corrida = conDia.filter(function (x) { return x.dia === ultimoDia; }).map(function (x) { return x.r; });

  res.hayCorrida = true;
  res.diaTxt = ultimoDia.split('-').reverse().join('/');
  // Temporada, semana y día de la corrida: son los de cualquiera de sus propuestas (todas comparten día; vacíos si el registro no los trae).
  res.temporada = (corrida[0].temporada === undefined) ? '' : corrida[0].temporada;
  res.semana = (corrida[0].semana === undefined) ? '' : corrida[0].semana;
  res.dia = (corrida[0].dia === undefined) ? '' : corrida[0].dia;
  res.total = corrida.length;
  corrida.forEach(function (r) {
    if (r.estadoProp !== 'Realizado') return;
    res.aplicados.push(r);
    if ((r.tipo === 'Ascenso' || r.tipo === 'Degradación') && r.tag) {
      res.rangoPrevioPorTag[r.tag] = { rango: r.rango, rango2: r.rango2 };
    }
  });
  res.aplicadosN = res.aplicados.length;
  res.pendientesN = res.total - res.aplicadosN;
  return res;
}
