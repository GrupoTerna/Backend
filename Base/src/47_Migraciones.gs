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
  function () { _finalizarReenumeracion(); },
];

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

  var COL_CATEGORIA = 12; // columna L
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

  Logger.log('[Reenumeración] Ref vieja: ' + refVieja.toDateString() +
             ' | Ref nueva: ' + refNueva.toDateString() +
             ' | deltaMeses: ' + deltaMeses +
             ' (se sumará a toda Temporada guardada; offset RoyaleAPI se ajustará en -' + deltaMeses + ').');

  _continuarReenumerarTemporadas();
}

// =============================================================================
// PUNTO 2 (Consolidado_Cambios_Pendientes_Guerra.md): detección automática SOLO SUGERENCIA de la temporada más antigua con presencia Terna; nunca dispara la reenumeración. [→ Contexto_Base_Web.md §47B022]
// =============================================================================

// detectarTemporadaMasAntiguaConPresenciaTerna(): manual, solo sugerencia; cruza Backup_Guerra.csv y la hoja Nuevos; nunca modifica datos. [→ Contexto_Base_Web.md §47B023]
function detectarTemporadaMasAntiguaConPresenciaTerna() {
  var nombresTerna = _getNombresClanesTernaOrdenados();

  var fechaGuerra = _buscarFechaMasAntiguaTernaEnBackupGuerra(nombresTerna);
  var fechaNuevos = _buscarFechaMasAntiguaTernaEnNuevos(nombresTerna);

  var candidatos = [];
  if (fechaGuerra) candidatos.push({ fecha: fechaGuerra, fuente: 'Backup_Guerra.csv' });
  if (fechaNuevos) candidatos.push({ fecha: fechaNuevos, fuente: 'hoja Nuevos (historial RoyaleAPI)' });

  if (!candidatos.length) {
    Logger.log('[Detección Reenumeración] No se encontró ninguna fila/bloque con presencia confirmada ' +
      'de un clan Terna, ni en Backup_Guerra.csv ni en la hoja Nuevos. Nada que sugerir.');
    return;
  }

  candidatos.sort(function (a, b) { return a.fecha.getTime() - b.fecha.getTime(); });
  var elegido = candidatos[0];
  var tz = Session.getScriptTimeZone() || 'GMT-5';
  var fechaStr = Utilities.formatDate(elegido.fecha, tz, 'yyyy-MM-dd');

  var props = PropertiesService.getScriptProperties();
  props.setProperty('REENUM_SUGERENCIA_FECHA', fechaStr);
  props.setProperty('REENUM_SUGERENCIA_FUENTE', elegido.fuente);

  var detalleOtras = '';
  if (candidatos.length > 1) {
    detalleOtras = ' Otra(s) fuente(s) evaluada(s): ' + candidatos.slice(1).map(function (c) {
      return c.fuente + ' (' + Utilities.formatDate(c.fecha, tz, 'yyyy-MM-dd') + ')';
    }).join(', ') + '.';
  }

  Logger.log('[Detección Reenumeración] Fecha más antigua con presencia Terna: ' + fechaStr +
    ' (determinada por: ' + elegido.fuente + ').' + detalleOtras +
    ' Esta función SOLO sugiere -- no reenumera nada. Para aplicar, correr ' +
    'ejecutarReenumeracionSugerida() (usa esta fecha automáticamente) o ' +
    'runReenumerarTemporadas(\'YYYY-MM-DD\') con la fecha que prefieras.');
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

// _continuarReenumerarTemporadas(): entrada de runReenumerarTemporadas() y del trigger de continuación; no llamar para iniciar una corrida nueva (no adquiere el lock). [→ Contexto_Base_Web.md §47B027]
function _continuarReenumerarTemporadas() {
  var paso = parseInt(PropertiesService.getScriptProperties().getProperty('REENUM_PASO') || '0', 10);
  Logger.log(paso === 0 ? '[Reenumeración] INICIO' : '[Reenumeración] CONTINÚA desde el paso ' + paso + '/' + PASOS_REENUMERAR_TEMPORADAS.length);
  try {
    var completo = _ejecutarPorTandas('REENUM', PASOS_REENUMERAR_TEMPORADAS, CFG.RUNUPDATE_PRESUPUESTO_MS, '_continuarReenumerarTemporadas');
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
    PropertiesService.getScriptProperties().deleteProperty('REENUM_PASO');
    _borrarTriggersDeContinuacion('_continuarReenumerarTemporadas');
    _liberarLockEjecucion();
    Logger.log('[Reenumeración] ERROR: ' + e.message + ' — lock liberado. NADA se confirmó como terminado; revisar qué pasos sí llegaron a escribirse antes de reintentar.');
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
      Logger.log('[Reenumeración] ' + filename + ': presupuesto interno agotado tras la fila ' +
                 (i + 1) + '/' + filas.length + '. Se reintenta el mismo paso en la próxima continuación.');
      return false;
    }
  }

  _saveCSVToDrive(filename, _encodeCSV([encabezado].concat(filas)));
  props.deleteProperty(claveIdx);
  Logger.log('[Reenumeración] ' + filename + ': ' + filas.length + ' fila(s) actualizadas (Temporada += ' + deltaMeses + ').');
  return true;
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
  var data = sh.getRange(primeraFila, 1, numFilas, totalCols).getValues();
  for (var i = 0; i < data.length; i++) {
    var actual = Number(data[i][colTemporada - 1]) || 0;
    data[i][colTemporada - 1] = actual + deltaMeses;
  }
  sh.getRange(primeraFila, 1, numFilas, totalCols).setValues(data);

  Logger.log('[Reenumeración] Hoja ' + sheetName + ': ' + data.length + ' fila(s) actualizadas (Temporada += ' + deltaMeses + ').');
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
  var data = sh.getRange(2, 1, lastRow - 1, 6).getValues();
  for (var i = 0; i < data.length; i++) {
    var actual = Number(data[i][COL_TEMPORADA_CAL2 - 1]) || 0;
    data[i][COL_TEMPORADA_CAL2 - 1] = actual + deltaMeses;
  }
  sh.getRange(2, 1, lastRow - 1, 6).setValues(data);

  Logger.log('[Reenumeración] Hoja ' + CFG.SHEETS.CALENDARIO2 + ': ' + data.length + ' fila(s) actualizadas (Temporada += ' + deltaMeses + ').');
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
  Logger.log('[Reenumeración] Correcciones_Guerra.csv: ' + claves.length + ' clave(s) reenumeradas (Temporada += ' + deltaMeses + ').');
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

  // Refresco inmediato en pantalla, sin esperar el próximo runAll/runUpdate.
  updateExtraSheet();
  runCalendario(); // ya llama a updateCalendario2() y resaltarDiaActual() internamente

  Logger.log('[Reenumeración] Ref activo actualizado a ' + nuevaRefStr +
             ' | Offset RoyaleAPI actualizado de ' + offsetViejo + ' a ' + offsetNuevo +
             ' | Extra y Calendario refrescados.');
}