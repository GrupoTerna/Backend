// ==============================================================================
// 47_Migraciones.gs
// Migraciones de una sola vez (migrarX), conservadas por trazabilidad; incluye la herramienta manual de reenumeración de temporadas (antes en 52_ReenumerarTemporadas.gs). [→ Contexto_Base_Web.md §47B001]
// ==============================================================================

// ----- Variables y constantes -----

// (Antes en 52_ReenumerarTemporadas.gs)
var PASOS_REENUMERAR_TEMPORADAS = [
  function () { return _reenumerarCSV('Backup_Guerra.csv', GC, GUERRA_TOTAL_COLS, GC.TEMPORADA); },
  function () { return _reenumerarCSV('Backup_Guerra_Logs.csv', GLC, GUERRA_LOGS_TOTAL_COLS, GLC.TEMPORADA); },
  function () { _reenumerarHoja(CFG.SHEETS.GUERRA, GC, GUERRA_TOTAL_COLS, GC.TEMPORADA); },
  function () { _reenumerarHoja(CFG.SHEETS.GUERRA_LOGS, GLC, GUERRA_LOGS_TOTAL_COLS, GLC.TEMPORADA); },
  // FIX (09-sep-2026): T_Lista tiene header de 2 filas, los datos arrancan
  // en la fila 3 -- ver docblock de _reenumerarHoja() más abajo.
  function () { _reenumerarHoja(CFG.SHEETS.T_LISTA, TL, TL_TOTAL_COLS, TL.TEMPORADA, 3); },
  function () { return _reenumerarCSV('Backup_T_Lista.csv', TL, TL_TOTAL_COLS, TL.TEMPORADA); },
  function () { _reenumerarHoja(CFG.SHEETS.T_ASISTENCIA, TA, TA_TOTAL_COLS, TA.TEMPORADA); },
  function () { return _reenumerarCSV('Backup_T_Asistencia.csv', TA, TA_TOTAL_COLS, TA.TEMPORADA); },
  function () { _reenumerarCalendario2Hoja(); },
  function () { return _reenumerarCSV('Backup_Calendario_2.csv', null, 6, 3); }, // Calendario_2 no tiene un CC dedicado; col 3 = Temporada
  function () { return _reenumerarCorreccionesGuerraCSV(); },
  // PF254 (25-oct-2026, etapa C, tanda 1): sorteos, asistencia de sorteos y registros de cambio de rango. S_Lista tiene encabezado de
  // 2 filas (datos desde la fila 3), como T_Lista; CR_Lista de 3 (datos desde la fila 4); S_Asistencia de 1. Los respaldos aplanan el encabezado a 1 fila.
  function () { _reenumerarHoja(CFG.SHEETS.S_LISTA, SL, SL_TOTAL_COLS, SL.TEMPORADA, 3); },
  function () { return _reenumerarCSV('Backup_S_Lista.csv', SL, SL_TOTAL_COLS, SL.TEMPORADA); },
  function () { _reenumerarHoja(CFG.SHEETS.S_ASISTENCIA, SA, SA_TOTAL_COLS, SA.TEMPORADA); },
  function () { return _reenumerarCSV('Backup_S_Asistencia.csv', SA, SA_TOTAL_COLS, SA.TEMPORADA); },
  function () { _reenumerarHoja(CFG.SHEETS.CR_LISTA, CR, CR_TOTAL_COLS, CR.TEMPORADA, 4); },
  function () { return _reenumerarCSV('Backup_CR_Lista.csv', CR, CR_TOTAL_COLS, CR.TEMPORADA); },
  // PF255 (25-oct-2026, etapa C, tanda 2): Revision_Guerra.csv acumula filas con Temporada interna (col. 3) y su clave de deduplicación
  // (_registrarRevisionGuerra_) incluye la temporada; sin reenumerarla se duplicarían las revisiones. Sin mapa de columnas propio: col. 3, 10 columnas.
  function () { return _reenumerarCSV(REVISION_GUERRA_CSV, null, REVISION_GUERRA_ENCABEZADO.length, 3); },
  // PF255: Correcciones_RiverRace_Pendientes.csv es una cola con Temporada interna (col. 2) que se cruza con Guerra por la clave
  // temporada|semana|tag (19_CorreccionRiverRace.gs); si Guerra se reenumera y la cola no, una aprobación apuntaría a otra semana.
  function () { return _reenumerarCSV(CORRECCIONES_RIVERRACE_PENDIENTES_CSV, null, CRC_TOTAL_COLS, CRC.TEMPORADA); },
  // PF257 (25-oct-2026, etapa C, tanda 3): histórico de guerra por jugador (20_HistorialGuerraJugador.gs), reenumerado como UNA unidad: JSON individuales,
  // CSV grupal (carpeta Grupal, no CSV/Informes) y la hoja Alertas_HistorialGuerra con su CSV. TemporadaRoyaleAPI no cambia.
  function () { return _reenumerarHistorialGuerraIndividual(); },
  function () { return _reenumerarHistorialGuerraGrupalCSV(); },
  function () { _reenumerarHoja(CFG.SHEETS.ALERTAS_HISTORIAL_GUERRA, AHG, AHG_TOTAL_COLS, AHG.TEMPORADA_INTERNA); },
  function () { return _reenumerarCSV('Alertas_HistorialGuerra.csv', AHG, AHG_TOTAL_COLS, AHG.TEMPORADA_INTERNA); },
  // PF258 (25-oct-2026, etapa C, tanda 4): informes y respaldos con fecha en CSV/Informes y CSV/Tampermonkey. Se detecta la columna por encabezado EXACTO
  // «Temporada»/«temporada» (no toca Temporada_2, Temporada RoyaleAPI, Temporada Supercell ni Id_RoyaleAPI); si el informe trae la columna ID, se recalcula.
  function () { return _reenumerarInformesCSV(); },
  // PF260 (25-oct-2026): nombres de los JSON de Drive (Endpoints, Anomalías, Otros; incluye los clanes bloqueados como NARANJA x). Va ANTES de _finalizarReenumeracion() para no mover los índices de los pasos anteriores.
  function () { return _reenumerarNombresJsonDrive(); },
  function () { _finalizarReenumeracion(); },
  // PF267 (26-oct-2026): Historial_I/S, Historial_A/D y Comentarios llevan Temporada/Semana/Día calculadas desde Fecha. Se recalculan DESPUÉS de _finalizarReenumeracion(),
  // porque ahí cambian CFG_REF_ACTIVO y CFG_OFFSET_ROYALEAPI; antes saldría la numeración vieja. No se les suma el delta. Va al FINAL para no mover los índices de los pasos anteriores.
  function () { completarTemporadaSemanaDiaHojas(); },
  // PF268 (26-oct-2026): fichas «T<n>_S<m>» de las columnas «Semanas» de T_Lista, S_Lista y CR_Lista (y sus Backup_*.csv). Al FINAL por el mismo motivo que el paso anterior (no mover índices).
  function () { return _reenumerarTokensSemanasTorneos_(); },
  // PF270 (25-oct-2026): nombres de los informes históricos con la temporada interna («…_T5S4 …», «…_T2_PI34_T3_PI27 …») en CSV/Informes y CSV/Tampermonkey. Al FINAL para no mover índices.
  function () { return _reenumerarNombresInformes_(); },
];

// PF269 (25-oct-2026): qué hace cada paso y qué se espera al terminarlo; _ejecutarPorTandas lo imprime («Ejecutando paso N/M: …»). MISMO ORDEN que PASOS_REENUMERAR_TEMPORADAS (si se añade un paso, añadir su texto al final).
var NOMBRES_PASOS_REENUMERAR_TEMPORADAS = [
  'Backup_Guerra.csv: suma el delta a la columna Temporada de cada fila → todas las filas con la numeración nueva',
  'Backup_Guerra_Logs.csv: suma el delta a Temporada → todas las filas con la numeración nueva',
  'Hoja Guerra: suma el delta a Temporada (solo esa columna) → todas las filas con la numeración nueva',
  'Hoja Guerra_Logs: suma el delta a Temporada → todas las filas con la numeración nueva',
  'Hoja T_Lista (datos desde la fila 3): suma el delta a Temporada → torneos con la numeración nueva',
  'Backup_T_Lista.csv: suma el delta a Temporada → copia igual a la hoja',
  'Hoja T_Asistencia: suma el delta a Temporada → asistencia con la numeración nueva',
  'Backup_T_Asistencia.csv: suma el delta a Temporada → copia igual a la hoja',
  'Hoja Calendario_2: suma el delta a Temporada (columna 3) → calendario con la numeración nueva',
  'Backup_Calendario_2.csv: suma el delta a Temporada → copia igual a la hoja',
  'Correcciones_Guerra.csv: suma el delta a Temporada y reconstruye la clave, el ID y las columnas de RoyaleAPI y Supercell → overlay coherente con la hoja Guerra',
  'Hoja S_Lista (datos desde la fila 3): suma el delta a Temporada → sorteos con la numeración nueva',
  'Backup_S_Lista.csv: suma el delta a Temporada → copia igual a la hoja',
  'Hoja S_Asistencia: suma el delta a Temporada → asistencia de sorteos con la numeración nueva',
  'Backup_S_Asistencia.csv: suma el delta a Temporada → copia igual a la hoja',
  'Hoja CR_Lista (datos desde la fila 4): suma el delta a Temporada → registros de cambio de rango con la numeración nueva',
  'Backup_CR_Lista.csv: suma el delta a Temporada → copia igual a la hoja',
  'Revision_Guerra.csv: suma el delta a Temporada (columna 3) → revisiones sin duplicarse',
  'Correcciones_RiverRace_Pendientes.csv: suma el delta a Temporada → cola alineada con la hoja Guerra',
  'HistorialGuerra, JSON individuales (Drive): suma el delta a temporadaInterna de cada registro → todos los JSON marcados con esta corrida',
  'HistorialGuerra_Grupal.csv: suma el delta a TemporadaInterna → todas las filas con la numeración nueva',
  'Hoja Alertas_HistorialGuerra: suma el delta a Temporada interna → alertas con la numeración nueva',
  'Alertas_HistorialGuerra.csv: suma el delta a Temporada interna → copia igual a la hoja',
  'Informes CSV de CSV/Informes y CSV/Tampermonkey: suma el delta a la columna Temporada y recalcula ID → todos los informes con columna Temporada actualizados',
  'Nombres de JSON y carpetas T-NN de Drive: suma el delta al número de temporada del nombre → todos los T-NN renombrados',
  'Finalizar: cambia la Ref y el offset de RoyaleAPI, sube la versión de la caché del cruce de meta y mueve NUEVOS_CIERRE_SEMANA_T<n> → numeración nueva activa',
  'Historial_I/S, Historial_A/D y Comentarios: recalcula Temporada, Semana y Día desde la Fecha (no suma delta) → columnas con la numeración nueva',
  'Fichas T<n>_S<m> de la columna Semanas de T_Lista, S_Lista y CR_Lista y sus Backup_*.csv: suma el delta → fichas apuntando a la semana correcta',
  'Nombres de informes históricos con T<n>S<m> o T<n>_PI<m> (CSV/Informes y CSV/Tampermonkey): suma el delta al número de temporada del nombre → nombres con la numeración nueva'
];

// _reenumProgreso_(nombre, previas, estaTanda, total, unidad): PF269; dos líneas de progreso al estilo de /players: acumulado (tandas anteriores + esta) de total, y lo hecho en esta tanda.
function _reenumProgreso_(nombre, previas, estaTanda, total, unidad) {
  var acum = previas + estaTanda;
  var pct = total > 0 ? Math.round(acum * 100 / total) : 100;
  Logger.log('[Reenumeración]   ' + nombre + ': acumulado ' + acum + ' de ' + total + ' ' + unidad + ' (' + pct + ' %); en tandas anteriores: ' + previas + '; faltan ' + Math.max(total - acum, 0) + '.');
  Logger.log('[Reenumeración]   ' + nombre + ': en esta tanda: ' + estaTanda + ' ' + unidad + '.');
  _anotarProgresoPaso_(nombre + ': ' + acum + ' de ' + total + ' ' + unidad, acum); // PF283
}

// ----- Funciones manuales / punto de entrada -----

// =============================================================================
// SECCIÓN 1: funciones manuales de mantenimiento (ejecutar a mano), reordenadas el 23-ago-2026; ninguna tiene _continuarX. [→ Contexto_Base_Web.md §47B003]
// =============================================================================

// migrarQuitarCatDispClanesAdminDeDirectorio(): UNA vez (12/07/2026); Cat_disp y Clanes_Admin dejan Directorio (queda en 58 columnas). [→ Contexto_Base_Web.md §47B004]
function migrarQuitarCatDispClanesAdminDeDirectorio() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!sh) { Logger.log('[Migración Cat_disp/Clanes_Admin] Directorio no encontrado.'); return; }

  var lastCol = sh.getLastColumn();
  if (lastCol < 59) {
    Logger.log('[Migración Cat_disp/Clanes_Admin] Directorio ya tiene ' + lastCol + ' columnas (<59), no hay nada que borrar.');
    return;
  }
  var h59 = String(sh.getRange(1, 59).getValue() || '').trim();
  var h60 = lastCol >= 60 ? String(sh.getRange(1, 60).getValue() || '').trim() : '';
  if (h59 !== 'Cat_disp') {
    Logger.log('[Migración Cat_disp/Clanes_Admin] ABORT: la columna 59 no dice "Cat_disp" (dice "' + h59 + '"). No se reconoce el layout esperado, no se borra nada.');
    return;
  }
  var numABorrar = (h60 === 'Clanes_Admin') ? 2 : 1;
  sh.deleteColumns(59, numABorrar);
  Logger.log('[Migración Cat_disp/Clanes_Admin] Directorio: ' + numABorrar + ' columna(s) borrada(s) desde la posición 59. Directorio ahora tiene ' + sh.getLastColumn() + ' columnas.');
}

// migrarLinksQuitarJugador(): UNA vez (12/07/2026); borra la columna "Jugador" de Links si tiene el layout viejo (15 columnas). [→ Contexto_Base_Web.md §47B005]
function migrarLinksQuitarJugador() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.LINKS);
  if (!sh) { Logger.log('[Migración Links] Hoja no encontrada.'); return; }

  var h4 = String(sh.getRange(1, 4).getValue() || '').trim();
  if (h4 !== 'Jugador') {
    Logger.log('[Migración Links] La columna 4 no dice "Jugador" (dice "' + h4 + '"), no hay nada que migrar.');
    return;
  }
  sh.deleteColumn(4);
  Logger.log('[Migración Links] Columna "Jugador" eliminada. Links ahora tiene ' + sh.getLastColumn() + ' columnas.');
}

// migrarDirectorioColumnaPrestamo(): UNA vez; mueve Préstamo (col. 59) a la posición 6 en Directorio y Administradores con layout viejo y reescribe los encabezados. [→ Contexto_Base_Web.md §47B006]
function migrarDirectorioColumnaPrestamo() {
  var ss = _getSs();
  var headers = [
    'N°','Tag','Nombre','Jugador','Nom_Multi','Préstamo','Multicuenta','Permiso',
    'Antigüedad','Nivel','Nivel2','Copas','Copas_max','Arena','V_Guerra',
    'Victorias','Derrotas','Batallas','Racha',
    'Camino de leyendas_Liga','Camino de leyendas_Trofeos','Camino de leyendas_Rango',
    'Victorias de tres coronas','Max_victorias_desafíos','Torneos','Emotes','Banners',
    'Cartas_desafíos','Cartas_torneos',
    'Donaciones_r','Donaciones_d',
    'Ranking','Ranking_p','Rango','Clan','ClanTag','Líder',
    'Iniciales','Prefijo','Celular','WSP(G)','Etiqueta',
    'WSP','RoyaleAPI','Mazo','Mazo2','CWStats','Render',
    'Fecha_ing','Fecha_lim','Vigencia','Inactividad(d)',
    'Alerta','Estado','Comentario','Vetado','Razón','Admin','Cat_disp',
    'Clanes_Admin'
  ];
  _migrarColumnaPrestamoEnHoja(ss.getSheetByName(CFG.SHEETS.DIRECTORIO), 'Directorio', headers);
  _migrarColumnaPrestamoEnHoja(ss.getSheetByName(CFG.SHEETS.ADMINISTRADORES), 'Administradores', headers);
}

// =============================================================================
// SECCIÓN 1: funciones manuales (reordenado 23-ago-2026); sin _continuarX. [→ Contexto_Base_Web.md §47B009]
// =============================================================================

// migrarControlColumnasExtra(): UNA vez; inserta en la hoja Control existente (116 columnas) las columnas nuevas Total/%/Prom sin perder datos. [→ Contexto_Base_Web.md §47B010]
function migrarControlColumnasExtra() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.CONTROL);
  if (!sh) { Logger.log('[Migración Control] Hoja no encontrada'); return; }

  if (sh.getMaxColumns() < 116) {
    Logger.log('[Migración Control] ABORT: la hoja tiene menos de 116 columnas; ' +
      'no parece tener el layout viejo esperado (4 métricas x 25 columnas). ' +
      'Si la hoja ya tiene el layout nuevo, no ejecutes esta función de nuevo.');
    return;
  }

  // Layout ANTES de la migración: COL_INICIO_GRID=17, 4 métricas x 25 columnas (Ataques 17-41, Puntaje 42-66, Acumulado 67-91, Barcos 92-116). [→ Contexto_Base_Web.md §47B011]

  // 1) Total y % de Ataques, a la derecha de la col 41 (Tsem5 de Ataques).
  sh.insertColumnsAfter(41, 2);

  // 2) Prom y % de Puntaje: el Tsem5 de Puntaje, que estaba en 66, ahora
  //    está en 68 (+2 por la inserción anterior).
  sh.insertColumnsAfter(68, 2);

  // 3) Total de Barcos: el Tsem5 de Barcos, que estaba en 116, ahora está
  //    en 120 (+4 por las dos inserciones anteriores).
  sh.insertColumnsAfter(120, 1);

  _pintarEncabezadosControl(sh);

  Logger.log('[Migración Control] Columnas insertadas (Ataques +2, Puntaje +2, ' +
    'Barcos +1) y encabezados repintados. Ejecuta updateControlSheet() para ' +
    'repoblar los valores de las columnas nuevas.');
}

// migrarControlColumnaAscenso(): UNA vez; inserta la columna "Ascenso" en la posición 17 de Control (layout de 16 columnas fijas) sin perder datos. [→ Contexto_Base_Web.md §47B012]
function migrarControlColumnaAscenso() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.CONTROL);
  if (!sh) { Logger.log('[Migración Ascenso] Hoja Control no encontrada'); return; }

  var encabezadoCol16 = String(sh.getRange(3, 16).getValue() || '').trim();
  var encabezadoCol17 = String(sh.getRange(3, 17).getValue() || '').trim();
  if (encabezadoCol16 !== 'Ataques pendientes') {
    Logger.log('[Migración Ascenso] ABORT: la columna 16 no dice "Ataques pendientes" ' +
      '(dice "' + encabezadoCol16 + '"); la hoja no parece tener el layout de 16 ' +
      'columnas fijas esperado.');
    return;
  }
  if (encabezadoCol17 === 'Ascenso') {
    Logger.log('[Migración Ascenso] ABORT: la columna 17 ya dice "Ascenso"; ' +
      'esta migración ya se aplicó antes, no ejecutar de nuevo.');
    return;
  }

  sh.insertColumnsAfter(16, 1);
  _pintarEncabezadosControl(sh);

  Logger.log('[Migración Ascenso] Columna "Ascenso" insertada en la posición 17 y ' +
    'encabezados repintados. Ejecuta updateControlSheet() para repoblar sus valores.');
}

// migrarControlQuitarJugador(): UNA vez (03-ago-2026); borra la columna "Jugador" de Control con layout viejo (17 fijas); mismo patrón que migrarLinksQuitarJugador(). [→ Contexto_Base_Web.md §47B013]
function migrarControlQuitarJugador() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.CONTROL);
  if (!sh) { Logger.log('[Migración Control] Hoja Control no encontrada.'); return; }

  var h4 = String(sh.getRange(3, 4).getValue() || '').trim();
  if (h4 !== 'Jugador') {
    Logger.log('[Migración Control] La columna 4 (fila 3) no dice "Jugador" ' +
      '(dice "' + h4 + '"), no hay nada que migrar.');
    return;
  }

  sh.deleteColumn(4);
  _pintarEncabezadosControl(sh);

  var numJugadores = Math.max(0, sh.getLastRow() - 3);
  _aplicarFmtCondicionalControl(sh, numJugadores);

  Logger.log('[Migración Control] Columna "Jugador" eliminada, encabezados ' +
    'repintados y formato condicional reaplicado. Control ahora tiene ' +
    sh.getLastColumn() + ' columnas. No hace falta correr updateControlSheet() ' +
    'aparte — los datos y la cuadrícula ya quedaron corridos junto con la columna.');
}

// _getOrdenMensajesCategoria(): FIX 19-ago-2026; orden de categorías EXCLUSIVO de generarTodosMensajes(), desde CFG.MENSAJES_ORDEN_CATEGORIAS (ya no de la hoja Extra). [→ Contexto_Base_Web.md §47B014]
// =============================================================================
// SECCIÓN 1: funciones manuales (reordenado 23-ago-2026); sin _continuarX. [→ Contexto_Base_Web.md §47B015]
// =============================================================================

// migrarAgregarCopasAGuerra(): UNA vez (12-oct-2026, pedido usuario: gráfica de copas en perfil y clan). Agrega la columna «Copas» (col. 21, GC.COPAS) a la hoja Guerra y al encabezado de Backup_Guerra.csv; las filas viejas quedan con la celda vacía (no hay historial anterior de copas). Idempotente. Ejecutar a mano justo después de subirBaseDesdeGithub(). [→ Contexto_Base_Web.md §PF061]
function migrarAgregarCopasAGuerra() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.GUERRA);
  if (!sh) { Logger.log('[Migración Copas Guerra] Hoja Guerra no encontrada.'); return; }
  _asegurarColumnaCopasGuerra_(sh);
  Logger.log('[Migración Copas Guerra] Hoja Guerra con ' + sh.getMaxColumns() + ' columnas y encabezado «Copas» en la columna ' + GC.COPAS + '.');

  var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
  if (!csvText) { Logger.log('[Migración Copas Guerra] Backup_Guerra.csv no existe todavía; se creará con la columna en la próxima fusión.'); return; }
  var parsed = _parseCSV(csvText);
  if (!parsed || !parsed.length) return;
  if (parsed[0].length >= GUERRA_TOTAL_COLS) { Logger.log('[Migración Copas Guerra] Backup_Guerra.csv ya tiene ' + parsed[0].length + ' columnas; nada que hacer.'); return; }
  for (var i = 0; i < parsed.length; i++) {
    while (parsed[i].length < GUERRA_TOTAL_COLS) parsed[i].push(i === 0 ? 'Copas' : '');
  }
  _saveCSVToDrive('Backup_Guerra.csv', _encodeCSV(parsed));
  Logger.log('[Migración Copas Guerra] Backup_Guerra.csv actualizado a ' + GUERRA_TOTAL_COLS + ' columnas (' + (parsed.length - 1) + ' filas).');
}

// migrarPosicionCategoriaAscensosDescensosEnExtra(): UNA vez; corrige la posición de "Ascensos y descensos" en la columna Categoría de Extra (justo después de los torneos). [→ Contexto_Base_Web.md §47B016]
function migrarPosicionCategoriaAscensosDescensosEnExtra() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.EXTRA);
  if (!sh) { Logger.log('[Migración Extra] Hoja Extra no encontrada.'); return; }

  var COL_CATEGORIA = _colCategoriaExtra_(sh); // PF141 (21-oct-2026): antes fija en 12 (L = Rangos); ver 30_Mensajes.gs
  var categoria = 'Ascensos y descensos';
  var categoriaLower = categoria.toLowerCase();

  var lastRowSheet = sh.getLastRow();
  var valoresActuales = [];
  if (lastRowSheet >= 2) {
    var colVals = sh.getRange(2, COL_CATEGORIA, lastRowSheet - 1, 1).getValues();
    for (var k = 0; k < colVals.length; k++) {
      var vv = String(colVals[k][0] || '').trim();
      if (vv !== '') valoresActuales.push(vv);
    }
  }

  var posActual = -1;
  for (var i = 0; i < valoresActuales.length; i++) {
    if (valoresActuales[i].toLowerCase() === categoriaLower) { posActual = i; break; }
  }
  if (posActual === -1) {
    Logger.log('[Migración Extra] "Ascensos y descensos" no está en la columna L de Extra todavía. Nada que migrar (se agregará en su posición correcta la próxima vez que generarTodosMensajes() la encuentre).');
    return;
  }

  // Quitarla de su posición actual para calcular dónde debería ir SIN
  // contarse a sí misma como ancla (por si acaso).
  valoresActuales.splice(posActual, 1);

  var posDeseada = valoresActuales.length; // fallback: al final
  var anclas = CATEGORIAS_ANCLA_EXTRA[categoriaLower];
  if (anclas) {
    for (var ai = 0; ai < valoresActuales.length; ai++) {
      if (anclas.indexOf(valoresActuales[ai].toLowerCase()) >= 0) posDeseada = ai + 1;
    }
  }

  if (posDeseada === posActual) {
    Logger.log('[Migración Extra] "Ascensos y descensos" ya está en la posición correcta (justo después de los torneos). No se toca nada.');
    return;
  }

  valoresActuales.splice(posDeseada, 0, categoria);

  var nuevaColumna = valoresActuales.map(function (v) { return [v]; });
  sh.getRange(2, COL_CATEGORIA, nuevaColumna.length, 1).setValues(nuevaColumna);
  Logger.log('[Migración Extra] "Ascensos y descensos" movida de la posición ' + (posActual + 1) + ' a la ' + (posDeseada + 1) + ' (justo después de los torneos) en la columna L de Extra.');
}

// BAJA DEFINITIVA 14-sep-2026: se quitó migrarOrdenCategoriasTRequisitos() (migración ya ejecutada; operaba sobre T_Requisitos, dada de baja). [→ Contexto_Base_Web.md §47B017]

// ---------------------------------------------------------------------------
// Permisos: activar la Funcion para todos los admin (ejecutar UNA vez a mano)
// ---------------------------------------------------------------------------

// (Antes en 37_Web_API.gs)
// migrarFuncionCorregirAutorATodosLosAdmins(): UNA vez, antes de abrir el panel de permisos; agrega la Función 'Corregir autor' a todos los admins que ya tienen alguna Función. [→ Contexto_Base_Web.md §47B018]
function migrarFuncionCorregirAutorATodosLosAdmins() {
  var hoja = _webPermisosLeerHoja();
  if (!hoja) { Logger.log('[Permisos] ' + WEB_PERMISOS_MSG_HOJA_NO_DISPONIBLE); return; }
  // FIX (24-sep-2026): ver docblock de _webPermisosLeerHoja() -- si los datos
  // vinieron del respaldo CSV (hoja.sh === null), esta migración manual no
  // tiene dónde escribir. Se aborta con un mensaje claro en vez de reventar
  // con un TypeError al llamar hoja.sh.getRange(...).
  if (hoja.origen !== 'sheet') {
    Logger.log('[Permisos] La hoja Administradores no está disponible en este momento (se está leyendo desde el respaldo). Reintenta esta migración más tarde.');
    return;
  }

  var rango = hoja.sh.getRange(2, AC.FUNCIONES, hoja.data.length, 1);
  var valores = rango.getValues();
  var agregadas = 0, yaLaTenian = 0, vacias = 0, sinNada = 0;

  for (var i = 0; i < valores.length; i++) {
    var actual = String(valores[i][0] || '').trim();
    if (!actual) { vacias++; continue; }
    if (actual === WEB_PERMISOS_SIN_NADA) { sinNada++; continue; }
    if (_webPermisosParsearLista(actual).indexOf(WEB_FUNCION_CORREGIR_AUTOR) !== -1) { yaLaTenian++; continue; }
    valores[i][0] = actual + ', ' + WEB_FUNCION_CORREGIR_AUTOR;
    agregadas++;
  }
  if (agregadas > 0) rango.setValues(valores);

  Logger.log('[Permisos] "' + WEB_FUNCION_CORREGIR_AUTOR + '" agregada en ' + agregadas + ' fila(s). ' +
    'Ya la tenían: ' + yaLaTenian + '. Celdas vacías (sin tocar): ' + vacias + '. En "' + WEB_PERMISOS_SIN_NADA + '" (sin tocar): ' + sinNada + '.');
}

// (Antes en 41_Web_ActualizarRoster.gs)
// migrarFuncionActualizarRosterATodosLosAdmins(): UNA vez; agrega 'Actualizar roster' a los admins con Función escrita; no toca '(ninguna)'; idempotente. [→ Contexto_Base_Web.md §47B019]
function migrarFuncionActualizarRosterATodosLosAdmins() {
  var hoja = _webPermisosLeerHoja();
  if (!hoja) { Logger.log('[Permisos] ' + WEB_PERMISOS_MSG_HOJA_NO_DISPONIBLE); return; }
  if (hoja.origen !== 'sheet') {
    Logger.log('[Permisos] La hoja Administradores no esta disponible en este momento (se esta leyendo desde el respaldo). Reintenta mas tarde.');
    return;
  }

  var rango = hoja.sh.getRange(2, AC.FUNCIONES, hoja.data.length, 1);
  var valores = rango.getValues();
  var agregadas = 0, yaLaTenian = 0, vacias = 0, sinNada = 0;

  for (var i = 0; i < valores.length; i++) {
    var actual = String(valores[i][0] || '').trim();
    if (!actual) { vacias++; continue; }
    if (actual === WEB_PERMISOS_SIN_NADA) { sinNada++; continue; }
    if (_webPermisosParsearLista(actual).indexOf(WEB_FUNCION_ACTUALIZAR_ROSTER) !== -1) { yaLaTenian++; continue; }
    valores[i][0] = actual + ', ' + WEB_FUNCION_ACTUALIZAR_ROSTER;
    agregadas++;
  }
  if (agregadas > 0) rango.setValues(valores);

  Logger.log('[Permisos] "' + WEB_FUNCION_ACTUALIZAR_ROSTER + '" agregada en ' + agregadas + ' fila(s). Ya la tenian: ' + yaLaTenian +
    '. Celdas vacias (se llenan solas con la lista por defecto): ' + vacias + '. En "' + WEB_PERMISOS_SIN_NADA + '" (sin tocar): ' + sinNada + '.');
}

// ---------------------------------------------------------------------------
// Reenumeracion de temporadas (antes 52_ReenumerarTemporadas.gs). Funcion MANUAL,
// de uso ocasional; no es una migracion de una sola vez.
// ---------------------------------------------------------------------------

// Sistema de reenumeración de temporadas: cambia UNA fecha Ref (y el Offset de RoyaleAPI) y propaga el delta de meses a toda "Temporada" guardada; manual; incluye qué no se toca. [→ Contexto_Base_Web.md §47B020]
// =============================================================================

// runReenumerarTemporadas(nuevaFechaRefStr): punto de entrada MANUAL (YYYY-MM-DD); reusa el motor de tandas de _ejecutarPorTandas(). [→ Contexto_Base_Web.md §47B021]
function runReenumerarTemporadas(nuevaFechaRefStr) {
  // PF258 (25-oct-2026): validar ANTES de tomar el lock. Desde el editor de Apps Script no se pueden pasar argumentos: la función llegaba con
  // nuevaFechaRefStr undefined, guardaba REENUM_DELTA_MESES = «NaN» y fallaba en setProperty dejando el lock tomado. Desde el editor, usar iniciarReenumerarTemporadas().
  var textoFecha = String(nuevaFechaRefStr === undefined || nuevaFechaRefStr === null ? '' : nuevaFechaRefStr).trim();
  var mFecha = /^(\d{4})-(\d{2})-(\d{2})$/.exec(textoFecha);
  var fechaValida = mFecha && new Date(Number(mFecha[1]), Number(mFecha[2]) - 1, Number(mFecha[3])).getMonth() === Number(mFecha[2]) - 1;
  if (!fechaValida) {
    Logger.log('[Reenumeración] NO se inició: falta la fecha Ref nueva o no tiene el formato AAAA-MM-DD (recibido: «' + textoFecha + '»). Desde el editor de Apps Script no se pueden pasar argumentos: escribe la fecha dentro de iniciarReenumerarTemporadas() y corre esa función. No se guardó ni se cambió nada.');
    return;
  }
  nuevaFechaRefStr = textoFecha;
  var pasoPendiente = PropertiesService.getScriptProperties().getProperty('REENUM_PASO');
  if (pasoPendiente !== null) {
    Logger.log('[Reenumeración] NO se inició: hay una reenumeración sin terminar (REENUM_PASO = ' + pasoPendiente + '). Empezar de nuevo sumaría el delta otra vez en los pasos ya hechos. Usa reanudarReenumerarTemporadas().');
    return;
  }
  if (!_adquirirLockEjecucion('runReenumerarTemporadas')) return;

  var refVieja = CFG.REF_DEFAULT; // getter, ya resuelve el valor activo
  var p = String(nuevaFechaRefStr).split('-');
  var refNueva = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));

  var deltaMeses = (refVieja.getFullYear() * 12 + refVieja.getMonth())
                  - (refNueva.getFullYear() * 12 + refNueva.getMonth());

  if (deltaMeses === 0) {
    Logger.log('[Reenumeración] La nueva fecha Ref no cambia el mes efectivo respecto a la actual. No se hace nada.');
    _liberarLockEjecucion();
    return;
  }

  var props = PropertiesService.getScriptProperties();
  props.setProperty('REENUM_DELTA_MESES', String(deltaMeses));
  props.setProperty('REENUM_NUEVA_REF', nuevaFechaRefStr);
  props.setProperty('REENUM_OFFSET_VIEJO', String(_getTemporadaOffsetRoyaleApi()));
  props.setProperty('REENUM_PASO', '0');
  props.setProperty('REENUM_RUN_ID', String(Date.now())); // PF257: marca de esta corrida dentro de los JSON de HistorialGuerra (evita sumar dos veces)
  props.deleteProperty('REENUM_HG_IDX');
  props.deleteProperty('REENUM_INF_IDX'); // PF258: índice del paso de informes
  props.deleteProperty('REENUM_JSON_IDX'); // PF260: índice del paso de nombres de JSON
  Object.keys(props.getProperties()).forEach(function (k) { if (k.indexOf('REENUM_TOK_') === 0) props.deleteProperty(k); }); // PF268: marcas del paso de fichas «Semanas»

  Logger.log('[Reenumeración] Ref vieja: ' + refVieja.toDateString() +
             ' | Ref nueva: ' + refNueva.toDateString() +
             ' | deltaMeses: ' + deltaMeses +
             ' (se sumará a toda Temporada guardada; offset RoyaleAPI se ajustará en -' + deltaMeses + ').');

  _continuarReenumerarTemporadas();
}

// =============================================================================
// PUNTO 2 (Consolidado_Cambios_Pendientes_Guerra.md): detección automática SOLO SUGERENCIA de la temporada más antigua con presencia Terna; nunca dispara la reenumeración. [→ Contexto_Base_Web.md §47B022]
// =============================================================================

// _primerLunesDelMesEfectivoDe_(fecha): PF285 (27-oct-2026); primer lunes del mes Supercell al que pertenece una fecha real (si cae antes del primer lunes de su mes, cuenta como el mes anterior; mismo criterio que _fechaATemporadaSemana()). Es la fecha Ref que deja esa fecha dentro de la T1.
function _primerLunesDelMesEfectivoDe_(fecha) {
  var anio = fecha.getFullYear();
  var mes = fecha.getMonth();
  if (fecha < primerLunesDelMes(anio, mes)) {
    mes--;
    if (mes < 0) { mes = 11; anio--; }
  }
  return primerLunesDelMes(anio, mes);
}

// _etiquetaMesTemporada_(d): PF285; id de temporada Supercell ('AAAA-MM', un mes por temporada) de una fecha Ref, sin pasar por la zona horaria.
function _etiquetaMesTemporada_(d) {
  return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2);
}

// _variacionTemporadas_(fechaRefNueva): PF285; compara la T1 actual, la T1 sugerida y la temporada actual (la de hoy). Solo calcula, no escribe nada.
// deltaMeses > 0: la sugerida es más antigua (hay que reenumerar); 0: es la misma; < 0: es más reciente (no hace falta). El Id de RoyaleAPI de una semana no cambia al reenumerar: cambian Ref y offset a la vez.
function _variacionTemporadas_(fechaRefNueva) {
  var ref = CFG.REF_DEFAULT;
  var offset = _getTemporadaOffsetRoyaleApi();
  var refNueva = _primerLunesDelMesEfectivoDe_(fechaRefNueva);
  var deltaMeses = (ref.getFullYear() * 12 + ref.getMonth()) - (refNueva.getFullYear() * 12 + refNueva.getMonth());
  var mesHoy = _calcularMesEfectivoRealDeHoy();
  var tHoy = calcTemporadaDesdeMesEfectivo(ref, mesHoy);
  return {
    refNueva: refNueva,
    deltaMeses: deltaMeses,
    t1ActualMes: _etiquetaMesTemporada_(ref),
    t1ActualRoyale: 1 + offset,
    t1SugeridaMes: _etiquetaMesTemporada_(refNueva),
    t1SugeridaRoyale: 1 + offset - deltaMeses,
    mesHoy: mesHoy.anio + '-' + ('0' + (mesHoy.mes + 1)).slice(-2),
    tHoyAntes: tHoy,
    tHoyDespues: tHoy + deltaMeses,
    hoyRoyale: tHoy + offset
  };
}

// _textoVariacionTemporadas_(v): PF285; frase para el registro con la variación de la T1 actual, la T1 sugerida y la temporada actual (v sale de _variacionTemporadas_()).
function _textoVariacionTemporadas_(v) {
  var n = Math.abs(v.deltaMeses);
  var plural = (n === 1) ? 'temporada' : 'temporadas';
  var comparacion;
  if (v.deltaMeses === 0) {
    comparacion = 'La temporada detectada es la MISMA que la T1 actual: 0 temporadas de diferencia, no hay nada que reenumerar.';
  } else if (v.deltaMeses > 0) {
    comparacion = 'La temporada detectada es ' + n + ' ' + plural + ' MÁS ANTIGUA que la T1 actual: se suman ' + n + ' a toda Temporada guardada.';
  } else {
    comparacion = 'La temporada detectada es ' + n + ' ' + plural + ' MÁS RECIENTE que la T1 actual: la T1 actual ya la cubre, no hace falta reenumerar.';
  }
  var actual = 'Temporada actual (Supercell ' + v.mesHoy + ', RoyaleAPI ' + v.hoyRoyale + '): hoy es T' + v.tHoyAntes +
    (v.deltaMeses > 0 ? ' y pasaría a ser T' + v.tHoyDespues : ' y seguiría siendo T' + v.tHoyAntes) + '.';
  var relacion = (v.deltaMeses > 0 && v.tHoyDespues === 1)
    ? ' La temporada detectada es también la temporada actual.'
    : (v.deltaMeses > 0 ? ' La temporada actual quedaría a ' + (v.tHoyDespues - 1) + ' ' + ((v.tHoyDespues - 1) === 1 ? 'temporada' : 'temporadas') + ' de la nueva T1.' : '');
  return 'VARIACIÓN: T1 actual = Supercell ' + v.t1ActualMes + ' (RoyaleAPI ' + v.t1ActualRoyale + '); T1 sugerida = Supercell ' + v.t1SugeridaMes + ' (RoyaleAPI ' + v.t1SugeridaRoyale + '). ' +
    comparacion + ' ' + actual + relacion;
}

// detectarTemporadaMasAntiguaConPresenciaTerna(): manual, solo sugerencia; cruza Backup_Guerra.csv, la hoja Nuevos y (§PF253, por tag de clan) Correcciones_Guerra.csv; nunca modifica datos. PF285 (27-oct-2026): devuelve la fecha Ref 'AAAA-MM-DD' (primer lunes del mes Supercell más antiguo) o '' si no hay nada que reenumerar, e indica la variación de la T1 actual, la T1 sugerida y la temporada actual; la usa iniciarReenumerarTemporadas(). [→ Contexto_Base_Web.md §47B023]
function detectarTemporadaMasAntiguaConPresenciaTerna() {
  var props = PropertiesService.getScriptProperties();
  var pasoPendiente = props.getProperty('REENUM_PASO');
  if (pasoPendiente !== null) {
    Logger.log('[Detección Reenumeración] NO se calculó: hay una reenumeración sin terminar (REENUM_PASO = ' + pasoPendiente + '). Termínala con reanudarReenumerarTemporadas() y vuelve a correr esta función.');
    return '';
  }
  var nombresTerna = _getNombresClanesTernaOrdenados();

  var fechaGuerra = _buscarFechaMasAntiguaTernaEnBackupGuerra(nombresTerna);
  var fechaNuevos = _buscarFechaMasAntiguaTernaEnNuevos(nombresTerna);
  var fechaCorrecciones = _buscarFechaMasAntiguaTernaEnCorreccionesGuerra(); // §PF253: por TAG de clan

  var candidatos = [];
  if (fechaGuerra) candidatos.push({ fecha: fechaGuerra, fuente: 'Backup_Guerra.csv' });
  if (fechaNuevos) candidatos.push({ fecha: fechaNuevos, fuente: 'hoja Nuevos (historial RoyaleAPI)' });
  if (fechaCorrecciones) candidatos.push({ fecha: fechaCorrecciones, fuente: 'Correcciones_Guerra.csv (por tag de clan)' });

  if (!candidatos.length) {
    Logger.log('[Detección Reenumeración] No se encontró ninguna fila/bloque con presencia confirmada ' +
      'de un clan Terna, ni en Backup_Guerra.csv, ni en la hoja Nuevos ni en Correcciones_Guerra.csv. Nada que sugerir.');
    return '';
  }

  candidatos.sort(function (a, b) { return a.fecha.getTime() - b.fecha.getTime(); });
  var elegido = candidatos[0];
  var tz = Session.getScriptTimeZone() || 'GMT-5';
  var v = _variacionTemporadas_(elegido.fecha); // PF285: la fecha Ref es el primer lunes del mes Supercell de la fecha más antigua
  var fechaStr = Utilities.formatDate(v.refNueva, tz, 'yyyy-MM-dd');

  var detalleOtras = '';
  if (candidatos.length > 1) {
    detalleOtras = ' Otra(s) fuente(s) evaluada(s): ' + candidatos.slice(1).map(function (c) {
      return c.fuente + ' (' + Utilities.formatDate(c.fecha, tz, 'yyyy-MM-dd') + ', Supercell ' + _etiquetaMesTemporada_(_primerLunesDelMesEfectivoDe_(c.fecha)) + ')';
    }).join(', ') + '.';
  }
  var cabecera = '[Detección Reenumeración] Fecha más antigua con presencia Terna: ' + Utilities.formatDate(elegido.fecha, tz, 'yyyy-MM-dd') +
    ' (determinada por: ' + elegido.fuente + ').' + detalleOtras + ' ' + _textoVariacionTemporadas_(v) + ' ';

  if (v.deltaMeses <= 0) {
    // Una fecha igual o más reciente que la Ref actual nunca se guarda ni se devuelve: reenumerar con ella correría las temporadas hacia el otro lado.
    props.deleteProperty('REENUM_SUGERENCIA_FECHA');
    props.deleteProperty('REENUM_SUGERENCIA_FUENTE');
    Logger.log(cabecera + 'Esta función SOLO sugiere. No se guardó ninguna sugerencia.');
    return '';
  }

  props.setProperty('REENUM_SUGERENCIA_FECHA', fechaStr);
  props.setProperty('REENUM_SUGERENCIA_FUENTE', elegido.fuente);
  Logger.log(cabecera + 'FECHA REF A USAR: ' + fechaStr + '. Esta función SOLO sugiere -- no reenumera nada. Para aplicar, correr ' +
    'iniciarReenumerarTemporadas() (la usa), ejecutarReenumeracionSugerida() (usa esta fecha) o ' +
    'runReenumerarTemporadas(\'YYYY-MM-DD\') con la fecha que prefieras.');
  return fechaStr;
}

// _buscarFechaMasAntiguaTernaEnBackupGuerra(nombresTerna): fuente 1 de la detección; devuelve Date o null. [→ Contexto_Base_Web.md §47B024]
function _buscarFechaMasAntiguaTernaEnBackupGuerra(nombresTerna) {
  var csvText = _loadCSVFromDrive('Backup_Guerra.csv');
  if (!csvText) return null;
  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length < 2) return null;

  var nombresSet = {};
  for (var n = 0; n < nombresTerna.length; n++) {
    nombresSet[String(nombresTerna[n]).trim().toLowerCase()] = true;
  }

  var masAntigua = null;
  for (var i = 1; i < parsed.length; i++) {
    var fila = parsed[i];
    var clanFila = String(fila[GC.CLAN - 1] || '').trim().toLowerCase();
    if (!clanFila || !nombresSet[clanFila]) continue;
    var fechaObj = _comoFechaComparable(fila[GC.FECHA - 1]);
    if (!fechaObj) continue;
    if (!masAntigua || fechaObj < masAntigua) masAntigua = fechaObj;
  }
  return masAntigua;
}

// _buscarSemanaMasAntiguaTernaEnCorreccionesGuerra_(): §PF259 (25-oct-2026); semana más antigua de Correcciones_Guerra.csv con un clan Terna CONFIRMADO. Devuelve { temporada, semana, clanTag, via, fecha, filasTerna, perfilesSinClan } o null.
// Cuenta (1) una fila con ClanTag de CFG.TERNA_TAGS (Log o Analytics) y (2) la fila del perfil de RoyaleAPI (sin ClanTag) cuyo «Clan RoyaleAPI» es de CFG.TERNA_TAGS (via = 'perfil'): es el caso de las semanas
// anteriores al sistema, que solo se conocen por el perfil del jugador. NO cuenta la fila de perfil de un clan externo ni la de perfil sin clan conocido (se informa en perfilesSinClan). «fecha» = lunes de esa semana (primer lunes de la
// temporada + (semana - 1) * 7). Compara por (temporada, semana) propias, que son las que usa el overlay. Solo lee.
function _buscarSemanaMasAntiguaTernaEnCorreccionesGuerra_() {
  var overlay;
  try {
    overlay = _cargarOverlayCorreccionesGuerraPorClan();
  } catch (e) {
    Logger.log('[Detección Reenumeración] No se pudo leer Correcciones_Guerra.csv: ' + e.message);
    return null;
  }
  var claves = Object.keys(overlay || {});
  if (!claves.length) return null;

  var ternaSet = {};
  for (var t = 0; t < CFG.TERNA_TAGS.length; t++) {
    ternaSet[_normalizarClanTagCorreccion(CFG.TERNA_TAGS[t])] = true;
  }

  var mejor = null, filasTerna = 0, perfilesSinClan = 0;
  for (var i = 0; i < claves.length; i++) {
    var p = claves[i].split('|'); // temporada | semana | clantag | tag
    var e = overlay[claves[i]];
    var temporada = Number(p[0]);
    var semana = Number(p[1]);
    if (isNaN(temporada) || !semana || semana < 1) continue;

    var clanTag = p[2], via = '';
    if (clanTag) {
      if (!ternaSet[clanTag]) continue;
      via = 'clan';
    } else {
      var clanPerfil = e && e.clanPerfil ? _normalizarClanTagCorreccion(e.clanPerfil) : '';
      if (!clanPerfil) { perfilesSinClan++; continue; }
      if (!ternaSet[clanPerfil]) continue; // perfil de clan externo
      clanTag = clanPerfil;
      via = 'perfil';
    }
    filasTerna++;
    if (!mejor || temporada < mejor.temporada || (temporada === mejor.temporada && semana < mejor.semana)) {
      mejor = { temporada: temporada, semana: semana, clanTag: clanTag, via: via };
    }
  }
  if (!mejor) return null;

  var pl = primerLunesTemporada(CFG.REF_DEFAULT, mejor.temporada);
  mejor.fecha = (pl && !isNaN(pl.getTime())) ? new Date(pl.getTime()) : null;
  if (mejor.fecha) mejor.fecha.setDate(mejor.fecha.getDate() + (mejor.semana - 1) * 7);
  mejor.filasTerna = filasTerna;
  mejor.perfilesSinClan = perfilesSinClan;
  return mejor;
}

// _buscarFechaMasAntiguaTernaEnCorreccionesGuerra(): fuente 3 de la detección (§PF253, 25-oct-2026; §PF259: ahora cuenta también el perfil con clan Terna); devuelve Date o null. Usa _buscarSemanaMasAntiguaTernaEnCorreccionesGuerra_().
function _buscarFechaMasAntiguaTernaEnCorreccionesGuerra() {
  var r = _buscarSemanaMasAntiguaTernaEnCorreccionesGuerra_();
  return r && r.fecha ? r.fecha : null;
}

// sugerirFechaRefDesdeCorreccionesGuerra(): devuelve la fecha 'AAAA-MM-DD' sugerida, o '' si no hay nada que hacer (PF261). §PF259 (25-oct-2026); MANUAL, solo sugiere (no reenumera). Lee la semana más antigua con clan Terna de Correcciones_Guerra.csv y dice la fecha EXACTA que se escribe en iniciarReenumerarTemporadas().
// La fecha es el primer lunes del mes Supercell de esa temporada: T1 pasa a ser esa temporada. Si ya hay una reenumeración a medias (REENUM_PASO) NO calcula: el CSV puede estar a medias y la fecha saldría mal.
// Si después aparece un registro más antiguo, se vuelve a correr y da la fecha nueva; la reenumeración suma meses hacia atrás a toda Temporada guardada. Guarda la sugerencia para ejecutarReenumeracionSugerida().
function sugerirFechaRefDesdeCorreccionesGuerra() {
  var props = PropertiesService.getScriptProperties();
  var pasoPendiente = props.getProperty('REENUM_PASO');
  if (pasoPendiente !== null) {
    Logger.log('[Sugerir fecha Ref] NO se calculó: hay una reenumeración sin terminar (REENUM_PASO = ' + pasoPendiente + '). Termínala con reanudarReenumerarTemporadas() y vuelve a correr esta función.');
    return '';
  }
  var r = _buscarSemanaMasAntiguaTernaEnCorreccionesGuerra_();
  if (!r || !r.fecha) {
    Logger.log('[Sugerir fecha Ref] No hay ninguna fila de Correcciones_Guerra.csv con un clan Terna confirmado (por ClanTag o por «Clan RoyaleAPI» del perfil). Nada que sugerir.');
    return '';
  }
  var tz = Session.getScriptTimeZone() || 'GMT-5';
  var ref = CFG.REF_DEFAULT;
  var offset = _getTemporadaOffsetRoyaleApi();
  var plTemporada = primerLunesTemporada(ref, r.temporada);
  var fechaStr = Utilities.formatDate(plTemporada, tz, 'yyyy-MM-dd');
  var supercell = Utilities.formatDate(plTemporada, tz, 'yyyy-MM');
  var royaleApi = r.temporada + offset;
  var deltaMeses = (ref.getFullYear() * 12 + ref.getMonth()) - (plTemporada.getFullYear() * 12 + plTemporada.getMonth());
  var resumen = 'Registro más antiguo con clan Terna: semana RoyaleAPI ' + royaleApi + '-' + r.semana + ' (temporada Supercell ' + supercell + '; propia hoy T' + r.temporada + ' S' + r.semana +
    '), clan ' + r.clanTag + ', leído del ' + (r.via === 'perfil' ? 'perfil del jugador' : 'log/analytics del clan') + '. Filas con clan Terna: ' + r.filasTerna +
    (r.perfilesSinClan ? '. Perfiles sin clan conocido (no cuentan): ' + r.perfilesSinClan : '') + '. ';

  var variacion = _textoVariacionTemporadas_(_variacionTemporadas_(plTemporada)); // PF285: T1 actual, T1 sugerida y temporada actual
  if (deltaMeses <= 0) {
    Logger.log('[Sugerir fecha Ref] ' + resumen + variacion + ' La Ref actual (' + Utilities.formatDate(ref, tz, 'yyyy-MM-dd') + ') ya es igual o más antigua: no hace falta reenumerar por este archivo.');
    return '';
  }
  props.setProperty('REENUM_SUGERENCIA_FECHA', fechaStr);
  props.setProperty('REENUM_SUGERENCIA_FUENTE', 'Correcciones_Guerra.csv, semana RoyaleAPI ' + royaleApi + '-' + r.semana);
  Logger.log('[Sugerir fecha Ref] ' + resumen + 'FECHA A ESCRIBIR en iniciarReenumerarTemporadas(): ' + fechaStr + ' (primer lunes del mes de la temporada ' + supercell + '). Suma ' + deltaMeses +
    ' mes(es) a toda Temporada guardada; el offset de RoyaleAPI pasa de ' + offset + ' a ' + (offset - deltaMeses) + ' (T1 = RoyaleAPI ' + royaleApi + '). ' + variacion + ' ' +
    'Esta función SOLO sugiere. Sugerencia guardada: también sirve ejecutarReenumeracionSugerida().');
  return fechaStr; // PF261: iniciarReenumerarTemporadas() la usa
}

// _buscarFechaMasAntiguaTernaEnNuevos(nombresTerna): fuente 2 de la detección; recorre los bloques de fecha de la hoja Nuevos. [→ Contexto_Base_Web.md §47B025]
function _buscarFechaMasAntiguaTernaEnNuevos(nombresTerna) {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.NUEVOS);
  if (!sh) return null;

  var lastRow = sh.getLastRow();
  if (lastRow < NUEVOS_FILA_DATOS_INICIO) return null;

  var nombresSet = {};
  for (var n = 0; n < nombresTerna.length; n++) {
    nombresSet[String(nombresTerna[n]).trim().toLowerCase()] = true;
  }

  var bloques = _leerBloquesFechaNuevos(sh);
  var numFilasDatos = lastRow - NUEVOS_FILA_DATOS_INICIO + 1;
  var masAntigua = null;

  for (var b = 0; b < bloques.length; b++) {
    var bloque = bloques[b];
    if (!bloque.date) continue; // bloque sin fecha asignada todavía

    var valoresClan = sh.getRange(NUEVOS_FILA_DATOS_INICIO, bloque.col, numFilasDatos, 1).getValues();
    var hayTernaEnBloque = false;
    for (var r = 0; r < valoresClan.length; r++) {
      var clanTxt = String(valoresClan[r][0] || '').trim().toLowerCase();
      if (clanTxt && nombresSet[clanTxt]) { hayTernaEnBloque = true; break; }
    }

    if (hayTernaEnBloque && (!masAntigua || bloque.date < masAntigua)) {
      masAntigua = bloque.date;
    }
  }

  return masAntigua;
}

// ejecutarReenumeracionSugerida(fechaRefStr): MANUAL, tras revisar la sugerencia en el log; sin argumento usa la última sugerencia guardada. [→ Contexto_Base_Web.md §47B026]
function ejecutarReenumeracionSugerida(fechaRefStr) {
  var props = PropertiesService.getScriptProperties();
  var fecha = fechaRefStr;
  var fuente = 'fecha indicada explícitamente por el usuario';

  if (!fecha) {
    fecha = props.getProperty('REENUM_SUGERENCIA_FECHA');
    fuente = 'última sugerencia guardada (' + (props.getProperty('REENUM_SUGERENCIA_FUENTE') || 'fuente desconocida') + ')';
    if (!fecha) {
      Logger.log('[Reenumeración] ABORT: no se pasó una fecha y no hay ninguna sugerencia guardada todavía. ' +
        'Correr primero detectarTemporadaMasAntiguaConPresenciaTerna(), o pasar la fecha a mano: ' +
        'ejecutarReenumeracionSugerida(\'YYYY-MM-DD\').');
      return;
    }
  }

  Logger.log('[Reenumeración] ejecutarReenumeracionSugerida(): aplicando fecha Ref ' + fecha + ' (' + fuente + ').');
  runReenumerarTemporadas(fecha);
}

// ----- Funciones internas / helpers -----

function _migrarColumnaPrestamoEnHoja(sh, nombreHoja, headers) {
  if (!sh) { Logger.log('[Migración Préstamo] Hoja ' + nombreHoja + ' no encontrada, se omite.'); return; }

  var totalCols = 60;
  var lastCol = sh.getLastColumn();

  // Si la col 6 YA dice "Préstamo", asumir que esta hoja ya fue migrada
  // (evita mover los datos dos veces si se corre por accidente otra vez).
  var headerCol6 = String(sh.getRange(1, 6).getValue() || '').trim();
  if (headerCol6 === 'Préstamo') {
    Logger.log('[Migración Préstamo] ' + nombreHoja + ' ya migrada (col 6 = "Préstamo"), se omite.');
    return;
  }

  var lastRow = sh.getLastRow();
  if (lastRow >= 2) {
    // Verificar que la columna 59 (posición vieja) efectivamente diga
    // "Préstamo" antes de mover nada — si no coincide, la hoja no tiene el
    // layout esperado y es más seguro abortar que mover datos a ciegas.
    var headerCol59 = lastCol >= 59 ? String(sh.getRange(1, 59).getValue() || '').trim() : '';
    if (headerCol59 !== 'Préstamo') {
      Logger.log('[Migración Préstamo] ABORT en ' + nombreHoja + ': la columna 59 no dice ' +
        '"Préstamo" (dice "' + headerCol59 + '"). No se reconoce el layout esperado, no se mueve nada.');
      return;
    }

    var data = sh.getRange(2, 1, lastRow - 1, totalCols).getValues();
    var nuevaData = new Array(data.length);
    for (var i = 0; i < data.length; i++) {
      var old = data[i];
      // old (0-indexed): [0..4]=Num..Nom_Multi (5) | [5..57]=Multicuenta..Cat_disp (53) |
      //                  [58]=Préstamo (1) | [59]=Clanes_Admin (1)  →  total 60
      nuevaData[i] = old.slice(0, 5)          // col 1-5, sin cambios
        .concat([old[58]])                    // col 6 = Préstamo (antes col 59)
        .concat(old.slice(5, 58))             // col 7-59 = antes col 6-58 (Multicuenta..Cat_disp)
        .concat([old[59]]);                   // col 60 = Clanes_Admin, sin cambios
    }
    sh.getRange(2, 1, nuevaData.length, totalCols).setValues(nuevaData);
    Logger.log('[Migración Préstamo] ' + nombreHoja + ': ' + nuevaData.length + ' filas reordenadas.');
  } else {
    Logger.log('[Migración Préstamo] ' + nombreHoja + ' sin filas de datos, solo se reescribe el encabezado.');
  }

  // Reescribir encabezados YA (Administradores solo los reescribe si la
  // celda A1 está vacía — aquí se fuerza para no depender de eso).
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  applyHeaderStyle(sh, headers.length);
}

// ---------------------------------------------------------------------------
// Helpers de la reenumeracion de temporadas (antes 52_ReenumerarTemporadas.gs)
// ---------------------------------------------------------------------------

// iniciarReenumerarTemporadas(): PF258; punto de entrada para correr DESDE EL EDITOR (el editor no pasa argumentos). Escribe la fecha Ref nueva en FECHA_REF_NUEVA, guarda y corre esta función.
function iniciarReenumerarTemporadas() {
  var FECHA_REF_NUEVA = 'AAAA-MM-DD'; // <- déjala así para usar la fecha que calcula detectarTemporadaMasAntiguaConPresenciaTerna() (la más antigua entre Backup_Guerra.csv, la hoja Nuevos y Correcciones_Guerra.csv), o escribe una fecha (por ejemplo '2024-09-02') para forzarla
  var fecha = FECHA_REF_NUEVA;
  if (fecha === 'AAAA-MM-DD') {
    fecha = detectarTemporadaMasAntiguaConPresenciaTerna(); // PF285 (antes PF261 usaba solo Correcciones_Guerra.csv): calcula y registra en el log la fecha, la fuente y la variación; '' si no hay nada que reenumerar
    if (!fecha) { Logger.log('[Reenumeración] NO se inició: no hay una fecha Ref más antigua que sugerir (ver el mensaje de arriba).'); return; }
    Logger.log('[Reenumeración] Se usa la fecha sugerida ' + fecha + '.');
  }
  runReenumerarTemporadas(fecha);
}

// reanudarReenumerarTemporadas(): PF258; sigue una reenumeración que se cortó por un error, SIN volver a sumar en los pasos ya hechos. Usa el REENUM_PASO guardado; si se perdió (versión anterior del código, que lo borraba al fallar),
// toma PASO_DONDE_SEGUIR. Exige que sigan guardados REENUM_DELTA_MESES y REENUM_NUEVA_REF (se borran al terminar, así que una corrida completa nunca se reanuda por error).
function reanudarReenumerarTemporadas() {
  var PASO_DONDE_SEGUIR = 6; // 25-oct-2026: la corrida de las 6:21 p.m. terminó los pasos 0 a 5 y falló en el 6 (T_Asistencia). Solo se usa si REENUM_PASO se perdió.
  var props = PropertiesService.getScriptProperties();
  var delta = Number(props.getProperty('REENUM_DELTA_MESES'));
  if (!isFinite(delta) || delta === 0 || !props.getProperty('REENUM_NUEVA_REF') || props.getProperty('REENUM_OFFSET_VIEJO') === null) {
    Logger.log('[Reenumeración] No hay nada que reanudar (faltan REENUM_DELTA_MESES, REENUM_NUEVA_REF o REENUM_OFFSET_VIEJO). No se hizo nada.');
    return;
  }
  var guardado = props.getProperty('REENUM_PASO');
  if (guardado === null) {
    props.setProperty('REENUM_PASO', String(PASO_DONDE_SEGUIR));
    Logger.log('[Reenumeración] REENUM_PASO no estaba guardado; se retoma en el paso ' + PASO_DONDE_SEGUIR + '.');
  }
  if (!_adquirirLockEjecucion('reanudarReenumerarTemporadas')) return;
  _continuarReenumerarTemporadas();
}

// liberarLockEjecucionManual(): PF258; libera a mano el lock de ejecución (EJECUCION_EN_CURSO) que dejó tomado una función que falló antes de liberarlo. Si hay una reenumeración a medias (REENUM_PASO) NO toca nada.
function liberarLockEjecucionManual() {
  var props = PropertiesService.getScriptProperties();
  if (props.getProperty('REENUM_PASO') !== null) {
    Logger.log('[Lock] Hay una reenumeración a medias (REENUM_PASO = ' + props.getProperty('REENUM_PASO') + '). No se libera nada: se continúa con _continuarReenumerarTemporadas() o se revisa primero qué pasos llegaron a escribirse.');
    return;
  }
  var raw = props.getProperty('EJECUCION_EN_CURSO');
  _liberarLockEjecucion();
  if (props.getProperty('REENUM_DELTA_MESES') === 'NaN') props.deleteProperty('REENUM_DELTA_MESES'); // basura del intento sin fecha (25-oct-2026)
  Logger.log('[Lock] Liberado. Lo que había: ' + (raw || '(nada)'));
}

// _continuarReenumerarTemporadas(): entrada de runReenumerarTemporadas() y del trigger de continuación; no llamar para iniciar una corrida nueva (no adquiere el lock). [→ Contexto_Base_Web.md §47B027]
function _continuarReenumerarTemporadas() {
  var paso = parseInt(PropertiesService.getScriptProperties().getProperty('REENUM_PASO') || '0', 10);
  Logger.log(paso === 0 ? '[Reenumeración] INICIO' : '[Reenumeración] CONTINÚA desde el paso ' + (paso + 1) + '/' + PASOS_REENUMERAR_TEMPORADAS.length);
  try {
    var completo = _ejecutarPorTandas('REENUM', PASOS_REENUMERAR_TEMPORADAS, CFG.REENUM_TANDA_PRESUPUESTO_MS, '_continuarReenumerarTemporadas', NOMBRES_PASOS_REENUMERAR_TEMPORADAS);
    if (completo) {
      PropertiesService.getScriptProperties().deleteProperty('REENUM_DELTA_MESES');
      PropertiesService.getScriptProperties().deleteProperty('REENUM_NUEVA_REF');
      PropertiesService.getScriptProperties().deleteProperty('REENUM_OFFSET_VIEJO');
      _liberarLockEjecucion();
      Logger.log('[Reenumeración] FIN — completa.');
    }
    // Si no está completo, el lock NO se libera: _ejecutarPorTandas ya
    // refrescó su timestamp y programó la continuación automática.
  } catch (e) {
    // PF258 (25-oct-2026): REENUM_PASO NO se borra. Antes se borraba y un nuevo inicio empezaba en el paso 0, sumando otra vez el delta en los pasos que ya habían terminado.
    // Queda el índice del paso que falló (los anteriores terminaron). Para seguir: reanudarReenumerarTemporadas(). No correr iniciarReenumerarTemporadas() de nuevo.
    var pasoFallido = PropertiesService.getScriptProperties().getProperty('REENUM_PASO');
    _borrarTriggersDeContinuacion('_continuarReenumerarTemporadas');
    _liberarLockEjecucion();
    var numFallido = isNaN(parseInt(pasoFallido, 10)) ? pasoFallido : (parseInt(pasoFallido, 10) + 1); // PF274: el registro muestra el número (índice + 1); REENUM_PASO guarda el índice
    Logger.log('[Reenumeración] ERROR en el paso ' + numFallido + ': ' + e.message + ' — lock liberado. Los pasos anteriores ya escribieron su parte; el paso ' + numFallido + ' puede haber escrito algo si hace varias escrituras. Corrige la causa y corre reanudarReenumerarTemporadas() (NO vuelvas a iniciar: sumaría el delta de nuevo).');
    throw e;
  }
}

// =============================================================================
// HELPERS GENÉRICOS — suman/restan deltaMeses a UNA columna "Temporada",
// nunca tocan DiaGuerra, Fecha ni PeriodIndex.
// =============================================================================

// _reenumerarCSV(filename, colMap, totalCols, colTemporada): suma REENUM_DELTA_MESES a Temporada en todas las filas del CSV; reanudable con presupuesto interno; devuelve false si queda incompleto. [→ Contexto_Base_Web.md §47B028]
function _reenumerarCSV(filename, colMap, totalCols, colTemporada) {
  var deltaMeses = Number(PropertiesService.getScriptProperties().getProperty('REENUM_DELTA_MESES'));

  var csvText = _loadCSVFromDrive(filename);
  if (!csvText) {
    Logger.log('[Reenumeración] ' + filename + ': no existe todavía, se omite.');
    return true;
  }
  var parsed = _parseCSV(csvText);
  if (!parsed || parsed.length < 2) {
    Logger.log('[Reenumeración] ' + filename + ': vacío, se omite.');
    return true;
  }

  var encabezado = parsed[0];
  var filas = parsed.slice(1);

  var props    = PropertiesService.getScriptProperties();
  var claveIdx = 'REENUM_CSV_IDX_' + filename;
  var idxInicio = parseInt(props.getProperty(claveIdx) || '0', 10);
  if (idxInicio >= filas.length) idxInicio = 0; // por si el archivo cambió de tamaño entre corridas

  var inicio = Date.now();
  var i;
  for (i = idxInicio; i < filas.length; i++) {
    var actual = Number(filas[i][colTemporada - 1]) || 0;
    filas[i][colTemporada - 1] = actual + deltaMeses;

    var quedanFilas = (i + 1) < filas.length;
    if (quedanFilas && (Date.now() - inicio) > CFG.RESPALDO_DERIVADAS_BUDGET_MS) {
      // Guarda lo ya sumado hasta aquí (incluida la fila i) para no perder
      // progreso ni tener que recalcular desde cero en la continuación.
      _saveCSVToDrive(filename, _encodeCSV([encabezado].concat(filas)));
      props.setProperty(claveIdx, String(i + 1));
      Logger.log('[Reenumeración] ' + filename + ': presupuesto interno agotado. Se reintenta el mismo paso en la próxima continuación.');
      _reenumProgreso_(filename, idxInicio, i + 1 - idxInicio, filas.length, 'filas');
      return false;
    }
  }

  _saveCSVToDrive(filename, _encodeCSV([encabezado].concat(filas)));
  props.deleteProperty(claveIdx);
  Logger.log('[Reenumeración] ' + filename + ': terminado (Temporada += ' + deltaMeses + ').');
  _reenumProgreso_(filename, idxInicio, filas.length - idxInicio, filas.length, 'filas');
  return true;
}

// _nombreInformeExcluidoReenum_(nombre): PF258; true si un CSV de CSV/Informes o CSV/Tampermonkey NO debe pasar por _reenumerarInformesCSV (tiene su propio paso, es derivado o usa otra numeración).
function _nombreInformeExcluidoReenum_(nombre) {
  var n = String(nombre || '');
  // Espejos de hoja (Backup_Guerra.csv, etc.): tienen su paso propio. Los «Backup_Guerra ANTES de …» son fotos con fecha y SÍ se reenumeran (decisión de la usuaria, §PF257 punto 1).
  if (/^Backup_/.test(n) && !/^Backup_Guerra ANTES de /.test(n)) return true;
  if (/^Log_Tampermonkey_/.test(n)) return true;
  var exactos = [
    REVISION_GUERRA_CSV,                       // paso propio (PF255)
    CORRECCIONES_RIVERRACE_PENDIENTES_CSV,     // paso propio (PF255)
    CORRECCIONES_GUERRA_CSV,                   // paso propio (_reenumerarCorreccionesGuerraCSV): reconstruye también ID y las columnas de RoyaleAPI y Supercell
    'Alertas_HistorialGuerra.csv',             // paso propio (PF257)
    'HistorialGuerra_Grupal.csv',              // paso propio (PF257), vive en la carpeta Grupal
    'Correcciones_Nuevos.csv',                 // su Temporada es la de RoyaleAPI («136-2»), no cambia
    'Cache_TotalesSemana_Objetivos.csv'        // caché que se regenera (57_ReconstruirSemanaPorDias.gs)
  ];
  return exactos.indexOf(n) >= 0;
}

// _reenumerarTextoInformeCSV_(texto, deltaMeses): PF258; función pura (sin Drive). Suma deltaMeses a la columna de encabezado exacto «Temporada»/«temporada» (solo celdas enteras),
// recalcula «ID» (T_NN_S_NN_#TAG) en las filas cambiadas si la primera columna es «ID», y conserva el fin de línea y el salto final del archivo. Devuelve {texto, cambiado, filas, cambiadas, saltadas, motivo}.
function _reenumerarTextoInformeCSV_(texto, deltaMeses) {
  var res = { texto: texto, cambiado: false, filas: 0, cambiadas: 0, saltadas: 0, motivo: '' };
  var finLinea = texto.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
  var terminaEnSalto = /\n$/.test(texto);
  var filas = _parseCSV(texto);
  if (!filas || filas.length < 2) { res.motivo = 'vacío'; return res; }

  var enc = filas[0], iT = -1, iS = -1, iG = -1;
  for (var c = 0; c < enc.length; c++) {
    var h = String(enc[c]).trim();
    if ((h === 'Temporada' || h === 'temporada') && iT < 0) iT = c;
    else if (h.toLowerCase() === 'semana' && iS < 0) iS = c;
    else if (h.toLowerCase() === 'tag' && iG < 0) iG = c;
  }
  if (iT < 0) { res.motivo = 'sin columna Temporada'; return res; }
  var conId = String(enc[0]).trim() === 'ID' && iS >= 0;

  for (var r = 1; r < filas.length; r++) {
    var fila = filas[r];
    res.filas++;
    if (!fila || fila.length <= iT) { res.saltadas++; continue; }
    var celda = String(fila[iT]).trim();
    if (!/^-?\d+$/.test(celda)) { if (celda !== '') res.saltadas++; continue; }
    fila[iT] = String(Number(celda) + deltaMeses);
    res.cambiadas++;
    if (conId) fila[0] = _idSemanaInforme_(fila[iT], fila[iS], iG >= 0 ? fila[iG] : '');
  }
  if (!res.cambiadas) { res.motivo = 'ninguna fila con Temporada entera'; return res; }

  res.texto = filas.map(function (fila) { return _encodeCSV([fila]); }).join(finLinea) + (terminaEnSalto ? finLinea : '');
  res.cambiado = true;
  return res;
}

// _reenumSinTiempo_(inicioPaso): PF263; true si el paso ya gastó CFG.REENUM_PRESUPUESTO_PASO_MS o si la ejecución completa (INICIO_TANDA_MS_, fijado en _ejecutarPorTandas) pasó de CFG.REENUM_VENTANA_MS.
// Así un paso que arranca tarde dentro de la tanda recibe solo el tiempo que queda y nunca se pasa de los 6 min de Apps Script; un paso que arranca primero puede usar toda la ventana.
function _reenumSinTiempo_(inicioPaso) {
  var ahora = Date.now();
  if (ahora - inicioPaso > CFG.REENUM_PRESUPUESTO_PASO_MS) return true;
  if (INICIO_TANDA_MS_ > 0 && ahora - INICIO_TANDA_MS_ > CFG.REENUM_VENTANA_MS) return true;
  return false;
}

// _reenumerarInformesCSV(): PF258; recorre los .csv de CSV/Informes y CSV/Tampermonkey (menos los de _nombreInformeExcluidoReenum_) y les suma REENUM_DELTA_MESES a «Temporada».
// Reanudable: guarda el índice en REENUM_INF_IDX y NO suma dos veces porque un archivo modificado después del inicio de la corrida (REENUM_RUN_ID) se salta. Devuelve false si queda incompleto.
function _reenumerarInformesCSV() {
  var props = PropertiesService.getScriptProperties();
  var deltaMeses = Number(props.getProperty('REENUM_DELTA_MESES'));
  var inicioCorrida = Number(props.getProperty('REENUM_RUN_ID'));
  var hayMarca = isFinite(inicioCorrida) && inicioCorrida > 0;
  if (!hayMarca) Logger.log('[Reenumeración] Informes: no hay REENUM_RUN_ID; solo se evita sumar dos veces con el índice (REENUM_INF_IDX).');
  var claveIdx = 'REENUM_INF_IDX';

  var lista = [];
  var subcarpetas = ['Informes', 'Tampermonkey'];
  for (var s = 0; s < subcarpetas.length; s++) {
    var carpeta = _getCsvSubcarpeta_(subcarpetas[s], false);
    if (!carpeta) { Logger.log('[Reenumeración] Informes: no existe CSV/' + subcarpetas[s] + ', se omite.'); continue; }
    var it = carpeta.getFiles();
    while (it.hasNext()) {
      var f = it.next(), nombre = f.getName();
      if (!/\.csv$/i.test(nombre) || _nombreInformeExcluidoReenum_(nombre)) continue;
      lista.push({ clave: subcarpetas[s] + '/' + nombre, nombre: nombre, file: f });
    }
  }
  lista.sort(function (a, b) { return a.clave < b.clave ? -1 : (a.clave > b.clave ? 1 : 0); });

  var idxInicio = parseInt(props.getProperty(claveIdx) || '0', 10);
  if (idxInicio >= lista.length) idxInicio = 0; // por si las carpetas cambiaron de tamaño entre corridas
  var inicio = Date.now();
  var cambiados = 0, yaHechos = 0, sinColumna = 0, errores = 0, filasSumadas = 0;

  for (var i = idxInicio; i < lista.length; i++) {
    var item = lista[i];
    try {
      if (hayMarca && item.file.getLastUpdated().getTime() >= inicioCorrida) { yaHechos++; }
      else {
        var blob = item.file.getBlob();
        var bytes = blob.getBytes();
        var tieneBom = bytes.length >= 3 && bytes[0] === -17 && bytes[1] === -69 && bytes[2] === -65;
        var texto = blob.getDataAsString('UTF-8');
        if (texto.charCodeAt(0) === 0xFEFF) texto = texto.slice(1);
        var res = _reenumerarTextoInformeCSV_(texto, deltaMeses);
        if (res.cambiado) {
          item.file.setContent((tieneBom ? '\uFEFF' : '') + res.texto);
          try { _csvCacheBorrar_(item.nombre); } catch (eCache) { /* sin caché que borrar */ }
          cambiados++; filasSumadas += res.cambiadas;
        } else { sinColumna++; }
      }
    } catch (eArch) {
      Logger.log('[Reenumeración] Informes: error en ' + item.clave + ' (' + eArch.message + '); se omite.');
      errores++;
    }
    props.setProperty(claveIdx, String(i + 1));
    if ((i + 1) < lista.length && _reenumSinTiempo_(inicio)) {
      Logger.log('[Reenumeración] Informes: presupuesto agotado. Se reintenta en la próxima continuación.');
      _reenumProgreso_('Informes', idxInicio, i + 1 - idxInicio, lista.length, 'archivos');
      return false;
    }
  }
  props.deleteProperty(claveIdx);
  _reenumProgreso_('Informes', idxInicio, lista.length - idxInicio, lista.length, 'archivos');
  Logger.log('[Reenumeración] Informes: ' + lista.length + ' archivo(s) en la carpeta (cambiados en esta pasada: ' + cambiados + ' con ' + filasSumadas + ' fila(s), ya hechos: ' + yaHechos +
             ', sin columna Temporada o sin filas enteras: ' + sinColumna + ', con error: ' + errores + ') (Temporada += ' + deltaMeses + ').');
  return true;
}

// _reenumerarHistorialGuerraIndividual(): PF257; suma REENUM_DELTA_MESES a registros[].temporadaInterna de cada JSON de la carpeta individual de HistorialGuerra; reanudable (índice + marca de corrida); devuelve false si queda incompleto.
function _reenumerarHistorialGuerraIndividual() {
  var props = PropertiesService.getScriptProperties();
  var deltaMeses = Number(props.getProperty('REENUM_DELTA_MESES'));
  var runId = props.getProperty('REENUM_RUN_ID') ||
    (props.getProperty('REENUM_NUEVA_REF') + '|' + props.getProperty('REENUM_OFFSET_VIEJO') + '|' + deltaMeses);
  var claveIdx = 'REENUM_HG_IDX';

  var folder;
  try { folder = DriveApp.getFolderById(DRIVE_FOLDER_ID_ROYALEAPI_INDIVIDUAL); }
  catch (e) { Logger.log('[Reenumeración] HistorialGuerra individual: carpeta no accesible (' + e.message + '), se omite.'); return true; }

  var archivos = [];
  var it = folder.getFiles();
  while (it.hasNext()) {
    var f = it.next();
    if (/\.json$/i.test(f.getName())) archivos.push(f);
  }
  archivos.sort(function (a, b) { return a.getName() < b.getName() ? -1 : (a.getName() > b.getName() ? 1 : 0); });

  var idxInicio = parseInt(props.getProperty(claveIdx) || '0', 10);
  if (idxInicio >= archivos.length) idxInicio = 0; // por si la carpeta cambió de tamaño entre corridas
  var inicio = Date.now();
  var cambiados = 0, yaHechos = 0, omitidos = 0;

  for (var i = idxInicio; i < archivos.length; i++) {
    var archivo = archivos[i];
    try {
      var obj = JSON.parse(archivo.getBlob().getDataAsString('UTF-8'));
      if (!obj || !Array.isArray(obj.registros)) { omitidos++; }
      else if (obj.reenumeracionId === runId) { yaHechos++; }
      else {
        for (var r = 0; r < obj.registros.length; r++) {
          var reg = obj.registros[r];
          if (!reg || reg.temporadaInterna === null || reg.temporadaInterna === undefined || reg.temporadaInterna === '') continue;
          var n = Number(reg.temporadaInterna);
          if (isFinite(n)) reg.temporadaInterna = n + deltaMeses;
        }
        if (obj.ultimaTemporadaCubierta !== null && obj.ultimaTemporadaCubierta !== undefined && obj.ultimaTemporadaCubierta !== '' &&
            isFinite(Number(obj.ultimaTemporadaCubierta))) {
          obj.ultimaTemporadaCubierta = Number(obj.ultimaTemporadaCubierta) + deltaMeses;
        }
        obj.reenumeracionId = runId;
        archivo.setContent(JSON.stringify(obj, null, 2));
        cambiados++;
      }
    } catch (eArch) {
      Logger.log('[Reenumeración] HistorialGuerra individual: error en ' + archivo.getName() + ' (' + eArch.message + '); se omite.');
      omitidos++;
    }
    props.setProperty(claveIdx, String(i + 1));
    if ((i + 1) < archivos.length && _reenumSinTiempo_(inicio)) {
      Logger.log('[Reenumeración] HistorialGuerra individual: presupuesto agotado. Se reintenta en la próxima continuación.');
      _reenumProgreso_('HistorialGuerra individual', idxInicio, i + 1 - idxInicio, archivos.length, 'archivos');
      return false;
    }
  }
  props.deleteProperty(claveIdx);
  _reenumProgreso_('HistorialGuerra individual', idxInicio, archivos.length - idxInicio, archivos.length, 'archivos');
  Logger.log('[Reenumeración] HistorialGuerra individual: ' + archivos.length + ' archivo(s) revisados en esta corrida de la carpeta (cambiados en esta pasada: ' + cambiados +
             ', ya hechos: ' + yaHechos + ', omitidos: ' + omitidos + ') (temporadaInterna += ' + deltaMeses + ').');
  return true;
}

// _reenumerarNombresJsonDrive(): PF260 (25-oct-2026); suma REENUM_DELTA_MESES al número de temporada que llevan en el NOMBRE los archivos y carpetas de JSON de Drive: archivos «T-NN  S-NN P.I-NN… - clans.json» (y currentriverrace) y carpetas «T-NN» de cada clan, incluidos los clanes
// bloqueados (por ejemplo NARANJA x: se recorren todas las subcarpetas, no solo CFG.TERNA_TAGS). Raíces: DRIVE_FOLDER_ID_ENDPOINTS y, dentro de DRIVE_FOLDER_ID_JSON, las carpetas «Anomalías» y «Otros». Solo cambia el número; fecha, hora, semana y P.I. quedan igual.
// Reanudable y sin sumar dos veces: recorre las carpetas en un orden fijo (por ID) y guarda en REENUM_JSON_IDX cuántas ya terminó; cada archivo o carpeta lleva en su descripción una marca por corrida (ANTES:<nombre viejo> y luego OK), así que un corte entre renombrar y marcar no duplica la suma.
// Devuelve false si se agotó el presupuesto (se reintenta). Las descripciones que tuvieran esos archivos se reemplazan por la marca. Sin probar en Apps Script real.
function _reenumerarNombresJsonDrive() {
  var props = PropertiesService.getScriptProperties();
  var delta = Number(props.getProperty('REENUM_DELTA_MESES'));
  var runId = props.getProperty('REENUM_RUN_ID') ||
    (props.getProperty('REENUM_NUEVA_REF') + '|' + props.getProperty('REENUM_OFFSET_VIEJO') + '|' + delta);
  var claveIdx = 'REENUM_JSON_IDX';

  var raices = [];
  try { raices.push(DriveApp.getFolderById(DRIVE_FOLDER_ID_ENDPOINTS)); }
  catch (e) { Logger.log('[Reenumeración] JSON Drive: carpeta Endpoints no accesible (' + e.message + ').'); }
  try {
    var jsonRaiz = DriveApp.getFolderById(DRIVE_FOLDER_ID_JSON);
    var nombresExtra = ['Anomalías', 'Otros'];
    for (var n = 0; n < nombresExtra.length; n++) {
      var itN = jsonRaiz.getFoldersByName(nombresExtra[n]);
      if (itN.hasNext()) raices.push(itN.next());
    }
  } catch (e2) { Logger.log('[Reenumeración] JSON Drive: carpeta JSON no accesible (' + e2.message + ').'); }

  var carpetas = [];
  for (var r = 0; r < raices.length; r++) _listarCarpetasOrdenadas_(raices[r], carpetas);

  var idxInicio = parseInt(props.getProperty(claveIdx) || '0', 10);
  if (idxInicio >= carpetas.length) idxInicio = 0;
  var inicio = Date.now();
  var reRaiz = /^T-(\d+)(\s[\s\S]*)$/;  // archivos: «T-05  S-02 P.I-07-L 13-09-2026 12.26 - Clan - clans.json»
  var reCarpeta = /^T-(\d+)$/;           // carpetas de temporada dentro de la carpeta del clan
  var cambiados = 0, saltadosNegativo = 0;

  for (var i = idxInicio; i < carpetas.length; i++) {
    var carpeta = carpetas[i];
    var it = carpeta.getFiles();
    while (it.hasNext()) {
      var f = it.next();
      if (!reRaiz.test(f.getName())) continue;
      var rf = _reenumRenombrarItem_(f, reRaiz, delta, runId);
      if (rf === 1) cambiados++; else if (rf === -1) saltadosNegativo++;
      if (_reenumSinTiempo_(inicio)) {
        Logger.log('[Reenumeración] JSON Drive: presupuesto agotado (renombrados en esta pasada: ' + cambiados + '). Se reintenta en la próxima continuación.');
        _reenumProgreso_('JSON Drive', idxInicio, i - idxInicio, carpetas.length, 'carpetas');
        props.setProperty(claveIdx, String(i)); // esta carpeta se vuelve a mirar; los ya marcados se saltan
        return false;
      }
    }
    if (reCarpeta.test(carpeta.getName())) {
      var rc = _reenumRenombrarItem_(carpeta, reCarpeta, delta, runId);
      if (rc === 1) cambiados++; else if (rc === -1) saltadosNegativo++;
    }
    props.setProperty(claveIdx, String(i + 1));
  }
  props.deleteProperty(claveIdx);
  _reenumProgreso_('JSON Drive', idxInicio, carpetas.length - idxInicio, carpetas.length, 'carpetas');
  Logger.log('[Reenumeración] JSON Drive: ' + carpetas.length + ' carpeta(s) recorridas (renombrados en esta pasada: ' + cambiados + ', sin renombrar por quedar negativos: ' + saltadosNegativo + ') (T-NN += ' + delta + ').');
  return true;
}

// _listarCarpetasOrdenadas_(carpeta, salida): PF260; agrega la carpeta y, en profundidad, sus subcarpetas ordenadas por ID (el orden no cambia al renombrar).
function _listarCarpetasOrdenadas_(carpeta, salida) {
  salida.push(carpeta);
  var hijas = [];
  var it = carpeta.getFolders();
  while (it.hasNext()) hijas.push(it.next());
  hijas.sort(function (a, b) { var x = a.getId(), y = b.getId(); return x < y ? -1 : (x > y ? 1 : 0); });
  for (var i = 0; i < hijas.length; i++) _listarCarpetasOrdenadas_(hijas[i], salida);
}

// _reenumRenombrarItem_(item, regex, delta, runId): PF260; renombra un archivo o carpeta sumando delta al número de temporada (grupo 1 de regex; grupo 2 = resto del nombre). Devuelve 1 si lo renombró, 0 si ya estaba hecho, -1 si el número quedaría negativo.
function _reenumRenombrarItem_(item, regex, delta, runId) {
  var nombre = item.getName();
  var m = regex.exec(nombre);
  if (!m) return 0;
  var ok = 'REENUM:' + runId + ':OK';
  var pre = 'REENUM:' + runId + ':ANTES:';
  var desc = item.getDescription() || '';
  if (desc === ok) return 0;
  if (desc.indexOf(pre) === 0) {
    // Se cortó entre renombrar y marcar: si el nombre ya no es el que se anotó, ya estaba renombrado.
    if (nombre !== desc.substring(pre.length)) { item.setDescription(ok); return 0; }
  } else {
    item.setDescription(pre + nombre);
  }
  var nuevoNumero = Number(m[1]) + delta;
  if (nuevoNumero < 0) { item.setDescription(''); return -1; }
  item.setName('T-' + _pad2_(nuevoNumero) + (m[2] || ''));
  item.setDescription(ok);
  return 1;
}

// _reenumerarHistorialGuerraGrupalCSV(): PF257; suma REENUM_DELTA_MESES a TemporadaInterna (columna 3) de HistorialGuerra_Grupal.csv, que vive en la carpeta Grupal (no en CSV/Informes); lectura y escritura con las funciones de 20_HistorialGuerraJugador.gs.
function _reenumerarHistorialGuerraGrupalCSV() {
  var deltaMeses = Number(PropertiesService.getScriptProperties().getProperty('REENUM_DELTA_MESES'));
  var colTemp = HISTORIAL_GUERRA_GRUPAL_ENCABEZADOS.indexOf('TemporadaInterna');
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { Logger.log('[Reenumeración] HistorialGuerra_Grupal.csv: no se obtuvo el lock; se reintenta en la próxima continuación.'); return false; }
  try {
    var texto = _loadHistorialGuerraGrupalCSV();
    if (!texto) { Logger.log('[Reenumeración] HistorialGuerra_Grupal.csv: no existe todavía, se omite.'); return true; }
    var filas = _parseCSV(texto);
    if (!filas || filas.length < 2) { Logger.log('[Reenumeración] HistorialGuerra_Grupal.csv: vacío, se omite.'); return true; }
    var n = 0;
    for (var i = 1; i < filas.length; i++) {
      if (filas[i].length <= colTemp) continue;
      var v = String(filas[i][colTemp]).trim();
      if (v === '' || !isFinite(Number(v))) continue;
      filas[i][colTemp] = Number(v) + deltaMeses;
      n++;
    }
    _saveHistorialGuerraGrupalCSV(_encodeCSV(filas));
    Logger.log('[Reenumeración] HistorialGuerra_Grupal.csv: terminado (TemporadaInterna += ' + deltaMeses + ').');
    _reenumProgreso_('HistorialGuerra_Grupal.csv', 0, n, filas.length - 1, 'filas');
    return true;
  } finally {
    lock.releaseLock();
  }
}

// _reenumerarHoja(...): suma REENUM_DELTA_MESES a Temporada en la hoja; filaInicio (FIX 09-sep-2026: T_Lista tiene datos desde la fila 3); sin presupuesto propio. [→ Contexto_Base_Web.md §47B029]
function _reenumerarHoja(sheetName, colMap, totalCols, colTemporada, filaInicio) {
  var deltaMeses = Number(PropertiesService.getScriptProperties().getProperty('REENUM_DELTA_MESES'));
  var primeraFila = filaInicio || 2;

  var ss = _getSs();
  var sh = ss.getSheetByName(sheetName);
  if (!sh) { Logger.log('[Reenumeración] Hoja ' + sheetName + ' no encontrada, se omite.'); return; }

  var lastRow = sh.getLastRow();
  if (lastRow < primeraFila) { Logger.log('[Reenumeración] Hoja ' + sheetName + ' sin filas de datos, se omite.'); return; }

  var numFilas = lastRow - primeraFila + 1;
  // PF258 (25-oct-2026): se lee y se escribe SOLO la columna Temporada. Antes se reescribía la hoja entera (totalCols columnas) y una celda de otra
  // columna con un valor fuera de su lista desplegable (T_Asistencia, U3) hacía fallar setValues por la validación de datos; además reescribir todo
  // convertía en valores fijos cualquier fórmula de las demás columnas. totalCols se conserva en la firma, pero ya no se usa.
  var rango = sh.getRange(primeraFila, colTemporada, numFilas, 1);
  var columna = rango.getValues();
  for (var i = 0; i < columna.length; i++) {
    var actual = Number(columna[i][0]) || 0;
    columna[i][0] = actual + deltaMeses;
  }
  rango.setValues(columna);

  Logger.log('[Reenumeración] Hoja ' + sheetName + ': terminado (Temporada += ' + deltaMeses + ').');
  _reenumProgreso_('Hoja ' + sheetName, 0, columna.length, columna.length, 'filas');
}

// _reenumerarCalendario2Hoja(): caso especial de _reenumerarHoja(); Calendario_2 no tiene mapa CC; Temporada en la columna 3. [→ Contexto_Base_Web.md §47B030]
function _reenumerarCalendario2Hoja() {
  var deltaMeses = Number(PropertiesService.getScriptProperties().getProperty('REENUM_DELTA_MESES'));

  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.CALENDARIO2);
  if (!sh) { Logger.log('[Reenumeración] Hoja ' + CFG.SHEETS.CALENDARIO2 + ' no encontrada, se omite.'); return; }

  var lastRow = sh.getLastRow();
  if (lastRow < 2) { Logger.log('[Reenumeración] Hoja ' + CFG.SHEETS.CALENDARIO2 + ' sin filas de datos, se omite.'); return; }

  var COL_TEMPORADA_CAL2 = 3;
  // PF258 (25-oct-2026): solo la columna Temporada (ver _reenumerarHoja: evita la validación de datos de otras columnas y no convierte fórmulas en valores).
  var rangoTemp = sh.getRange(2, COL_TEMPORADA_CAL2, lastRow - 1, 1);
  var data = rangoTemp.getValues();
  for (var i = 0; i < data.length; i++) {
    var actual = Number(data[i][0]) || 0;
    data[i][0] = actual + deltaMeses;
  }
  rangoTemp.setValues(data);

  Logger.log('[Reenumeración] Hoja ' + CFG.SHEETS.CALENDARIO2 + ': terminado (Temporada += ' + deltaMeses + ').');
  _reenumProgreso_('Hoja ' + CFG.SHEETS.CALENDARIO2, 0, data.length, data.length, 'filas');
}

// _reenumerarNombreInformeTexto_(nombre, deltaMeses): PF270; función pura. Suma deltaMeses al número de temporada de cada ficha «T<n>» que va seguida de «S<m>» o «_PI<m>» y precedida por inicio, espacio o «_» (por ejemplo «Reparacion_Domingo_T5S4 …» o «…_T2_PI34_T3_PI27 …»). No toca fechas ni otros números. Devuelve {nombre, cambios, negativos}.
function _reenumerarNombreInformeTexto_(nombre, deltaMeses) {
  var cambios = 0, negativos = 0;
  var nuevo = String(nombre || '').replace(/(^|[ _])T(\d+)(?=S\d|_PI\d)/g, function (todo, pre, num) {
    var n = Number(num) + deltaMeses;
    if (n < 0) { negativos++; return todo; }
    cambios++;
    return pre + 'T' + n;
  });
  return { nombre: nuevo, cambios: cambios, negativos: negativos };
}

// _reenumerarNombresInformes_(): PF270; renombra los archivos de CSV/Informes y CSV/Tampermonkey cuyo nombre lleva la temporada interna (informes de reparación de domingo y sus respaldos). El contenido no cambia.
// Sin sumar dos veces: marca en la descripción del archivo («REENUM:<corrida>:ANTES:<nombre viejo>» y luego «…:OK»), igual que _reenumRenombrarItem_ (PF260). Son pocos archivos, se hace entero en una pasada.
function _reenumerarNombresInformes_() {
  var props = PropertiesService.getScriptProperties();
  var delta = Number(props.getProperty('REENUM_DELTA_MESES'));
  var runId = props.getProperty('REENUM_RUN_ID') ||
    (props.getProperty('REENUM_NUEVA_REF') + '|' + props.getProperty('REENUM_OFFSET_VIEJO') + '|' + delta);
  var ok = 'REENUM:' + runId + ':OK', pre = 'REENUM:' + runId + ':ANTES:';
  var subcarpetas = ['Informes', 'Tampermonkey'];
  var vistos = 0, renombrados = 0, yaHechos = 0, negativos = 0;
  for (var s = 0; s < subcarpetas.length; s++) {
    var carpeta = _getCsvSubcarpeta_(subcarpetas[s], false);
    if (!carpeta) { Logger.log('[Reenumeración] Nombres de informes: no existe CSV/' + subcarpetas[s] + ', se omite.'); continue; }
    var it = carpeta.getFiles();
    while (it.hasNext()) {
      var f = it.next(), nombre = f.getName();
      var desc = f.getDescription() || '';
      if (desc === ok) { vistos++; yaHechos++; continue; }
      if (desc.indexOf(pre) === 0 && nombre !== desc.substring(pre.length)) { f.setDescription(ok); vistos++; yaHechos++; continue; } // se cortó entre renombrar y marcar
      var r = _reenumerarNombreInformeTexto_(nombre, delta);
      if (r.cambios === 0 && r.negativos === 0) continue;
      vistos++;
      if (r.negativos > 0) { negativos++; continue; }
      if (desc.indexOf(pre) !== 0) f.setDescription(pre + nombre);
      f.setName(r.nombre);
      f.setDescription(ok);
      try { _csvCacheBorrar_(nombre); } catch (eCache) { /* sin caché que borrar */ }
      renombrados++;
    }
  }
  Logger.log('[Reenumeración] Nombres de informes: ' + vistos + ' archivo(s) con temporada en el nombre (renombrados ahora: ' + renombrados + ', ya hechos: ' + yaHechos + ', sin tocar por quedar negativos: ' + negativos + ') (T += ' + delta + ').');
  _reenumProgreso_('Nombres de informes', yaHechos, renombrados, vistos, 'archivos');
  return true;
}

// _reenumerarTokensSemanasTexto_(texto, deltaMeses): PF268; función pura. En una lista «T3_S1,T3_S2» suma deltaMeses al número de temporada de cada ficha; lo que no tenga esa forma queda igual. Devuelve {texto, cambiados, saltados} (saltados = fichas que quedarían con temporada negativa).
function _reenumerarTokensSemanasTexto_(texto, deltaMeses) {
  var s = String(texto === null || texto === undefined ? '' : texto);
  var cambiados = 0, saltados = 0;
  if (s === '') return { texto: s, cambiados: 0, saltados: 0 };
  var partes = s.split(',').map(function (tok) {
    var t = tok.trim();
    var m = /^T(\d+)_S(\d+)$/i.exec(t);
    if (!m) return tok;
    var nuevo = Number(m[1]) + deltaMeses;
    if (nuevo < 0) { saltados++; return tok; }
    cambiados++;
    return tok.replace(t, 'T' + nuevo + '_S' + m[2]);
  });
  return { texto: partes.join(','), cambiados: cambiados, saltados: saltados };
}

// _reenumerarTokensSemanasTorneos_(): PF268; las columnas «Semanas» de T_Lista, S_Lista y CR_Lista (y sus Backup_*.csv) guardan fichas «T<n>_S<m>» con la temporada INTERNA
// (_parseSemanasSorteo, _extraerIsosDesdeSemanasCsv en 26_Torneos_Core.gs). Sin sumarles el delta, esas fichas apuntarían a otra semana con la numeración nueva. Reanudable: marca por destino
// (REENUM_TOK_<nombre> = id de la corrida), así que un reintento no suma dos veces. Va al FINAL de PASOS_REENUMERAR_TEMPORADAS para no mover los índices de los pasos anteriores.
function _reenumerarTokensSemanasTorneos_() {
  var props = PropertiesService.getScriptProperties();
  var delta = Number(props.getProperty('REENUM_DELTA_MESES'));
  var runId = props.getProperty('REENUM_RUN_ID') ||
    (props.getProperty('REENUM_NUEVA_REF') + '|' + props.getProperty('REENUM_OFFSET_VIEJO') + '|' + delta);
  var destinos = [
    { tipo: 'hoja', nombre: CFG.SHEETS.T_LISTA,  col: TL.SEMANAS, fila: 3 },
    { tipo: 'csv',  nombre: 'Backup_T_Lista.csv',  col: TL.SEMANAS },
    { tipo: 'hoja', nombre: CFG.SHEETS.S_LISTA,  col: SL.SEMANAS, fila: 3 },
    { tipo: 'csv',  nombre: 'Backup_S_Lista.csv',  col: SL.SEMANAS },
    { tipo: 'hoja', nombre: CFG.SHEETS.CR_LISTA, col: CR.SEMANAS, fila: 4 },
    { tipo: 'csv',  nombre: 'Backup_CR_Lista.csv', col: CR.SEMANAS }
  ];
  for (var d = 0; d < destinos.length; d++) {
    var dest = destinos[d];
    var clave = 'REENUM_TOK_' + dest.nombre;
    if (props.getProperty(clave) === runId) continue; // ya hecho en esta corrida
    var cambiados = 0, saltados = 0;
    if (dest.tipo === 'hoja') {
      var sh = _getSs().getSheetByName(dest.nombre);
      if (!sh || sh.getLastRow() < dest.fila) {
        Logger.log('[Reenumeración] Fichas «Semanas» de ' + dest.nombre + ': hoja ausente o sin datos, se omite.');
      } else {
        var rango = sh.getRange(dest.fila, dest.col, sh.getLastRow() - dest.fila + 1, 1);
        var valores = rango.getValues();
        for (var i = 0; i < valores.length; i++) {
          var r = _reenumerarTokensSemanasTexto_(valores[i][0], delta);
          if (r.cambiados > 0) { valores[i][0] = r.texto; cambiados += r.cambiados; }
          saltados += r.saltados;
        }
        if (cambiados > 0) rango.setValues(valores); // solo esta columna (PF258: no se reescribe el resto de la hoja)
      }
    } else {
      var csvText = _loadCSVFromDrive(dest.nombre);
      var parsed = csvText ? _parseCSV(csvText) : null;
      if (!parsed || parsed.length < 2) {
        Logger.log('[Reenumeración] Fichas «Semanas» de ' + dest.nombre + ': no existe o está vacío, se omite.');
      } else {
        for (var j = 1; j < parsed.length; j++) {
          if (parsed[j].length < dest.col) continue;
          var rc = _reenumerarTokensSemanasTexto_(parsed[j][dest.col - 1], delta);
          if (rc.cambiados > 0) { parsed[j][dest.col - 1] = rc.texto; cambiados += rc.cambiados; }
          saltados += rc.saltados;
        }
        if (cambiados > 0) _saveCSVToDrive(dest.nombre, _encodeCSV(parsed));
      }
    }
    props.setProperty(clave, runId);
    Logger.log('[Reenumeración] Fichas «Semanas» de ' + dest.nombre + ': terminado (T += ' + delta + ')' + (saltados ? ', ' + saltados + ' sin tocar por quedar negativas' : '') + '.');
    _reenumProgreso_('Fichas «Semanas» de ' + dest.nombre + ' (destino ' + (d + 1) + ' de ' + destinos.length + ')', 0, cambiados, cambiados, 'fichas');
  }
  return true;
}

// _reenumerarCorreccionesGuerraCSV(): en Correcciones_Guerra.csv Temporada es parte de la clave del overlay (desde 29-sep-2026); reconstruye cada clave. [→ Contexto_Base_Web.md §47B031]
function _reenumerarCorreccionesGuerraCSV() {
  var deltaMeses = Number(PropertiesService.getScriptProperties().getProperty('REENUM_DELTA_MESES'));

  // FIX (29-sep-2026, Fase 15 tanda 1): se usa el mapa POR CLAN (claves de 4
  // partes "temporada|semana|clantag|tag"); la vista sumada perdería las filas
  // por clan al reescribir el CSV.
  var mapaViejo = _cargarOverlayCorreccionesGuerraPorClan();
  var claves = Object.keys(mapaViejo);
  if (!claves.length) {
    Logger.log('[Reenumeración] Correcciones_Guerra.csv: no existe o está vacío, se omite.');
    return true;
  }

  var mapaNuevo = {};
  for (var i = 0; i < claves.length; i++) {
    var partes = claves[i].split('|');
    var temporadaNueva = Number(partes[0]) + deltaMeses;
    var claveNueva = temporadaNueva + '|' + partes[1] + '|' + partes[2] + '|' + partes[3];
    mapaNuevo[claveNueva] = mapaViejo[claves[i]];
  }

  _guardarOverlayCorreccionesGuerra(mapaNuevo);
  Logger.log('[Reenumeración] Correcciones_Guerra.csv: terminado (Temporada += ' + deltaMeses + ').');
  _reenumProgreso_('Correcciones_Guerra.csv (claves)', 0, claves.length, claves.length, 'claves');
  return true;
}

// _finalizarReenumeracion(): último paso; activa la nueva Ref y el Offset de RoyaleAPI y refresca Extra y Calendario. [→ Contexto_Base_Web.md §47B032]
function _finalizarReenumeracion() {
  var props = PropertiesService.getScriptProperties();
  var deltaMeses    = Number(props.getProperty('REENUM_DELTA_MESES'));
  var nuevaRefStr   = props.getProperty('REENUM_NUEVA_REF');
  var offsetViejo   = Number(props.getProperty('REENUM_OFFSET_VIEJO'));
  var offsetNuevo   = offsetViejo - deltaMeses;

  props.setProperty('CFG_REF_ACTIVO', nuevaRefStr);
  _limpiarMemoSemanasTemporada_(); // PF091: la Ref cambió; se descarta el memo de semanas por temporada
  props.setProperty('CFG_OFFSET_ROYALEAPI', String(offsetNuevo));

  // PF264: lo que guarda la numeración vieja y no es hoja ni archivo. Se hace una sola vez por corrida (marca REENUM_PROPS_NUMERACION_HECHO), por si este paso se reintenta.
  var runIdFin = props.getProperty('REENUM_RUN_ID') || (nuevaRefStr + '|' + offsetViejo + '|' + deltaMeses);
  if (props.getProperty('REENUM_PROPS_NUMERACION_HECHO') !== runIdFin) {
    // (a) Índice en caché del cruce de meta (22_ControlCalendario.gs, PF144): sus claves 'T|S|P' apuntan a archivos que acaban de cambiar de nombre; subir la versión lo descarta.
    props.setProperty('CRUCE_META_IDX_V', String((Number(props.getProperty('CRUCE_META_IDX_V')) || 0) + 1));
    // (b) NUEVOS_CIERRE_SEMANA_T<n> (14_Nuevos_RoyaleAPI.gs): la semana cerrada de cada temporada; pasa a la temporada con el número nuevo para no cerrarla otra vez.
    var todas = props.getProperties(), movidas = [];
    Object.keys(todas).forEach(function (k) {
      var m = /^NUEVOS_CIERRE_SEMANA_T(\d+)$/.exec(k);
      if (m) movidas.push({ viejo: k, nuevo: 'NUEVOS_CIERRE_SEMANA_T' + (Number(m[1]) + deltaMeses), valor: todas[k] });
    });
    movidas.forEach(function (x) { props.deleteProperty(x.viejo); });
    movidas.forEach(function (x) { props.setProperty(x.nuevo, x.valor); });
    props.setProperty('REENUM_PROPS_NUMERACION_HECHO', runIdFin);
    Logger.log('[Reenumeración] Índice de cruce de meta descartado y ' + movidas.length + ' marca(s) NUEVOS_CIERRE_SEMANA_T<n> pasadas a la numeración nueva (T += ' + deltaMeses + ').');
  }

  // Refresco inmediato en pantalla, sin esperar el próximo runAll/runUpdate.
  updateExtraSheet();
  runCalendario(); // ya llama a updateCalendario2() y resaltarDiaActual() internamente

  Logger.log('[Reenumeración] Ref activo actualizado a ' + nuevaRefStr +
             ' | Offset RoyaleAPI actualizado de ' + offsetViejo + ' a ' + offsetNuevo +
             ' | Extra y Calendario refrescados.');
}