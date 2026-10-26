// ==============================================================================
// 00_Main.gs
// Punto de entrada del proyecto. Funciones manuales/orquestación por temática: control de
// ejecucion, actualizacion de datos, sincronizacion, calendario/formato, mensajeria, torneos,
// reparaciones puntuales, y el motor interno de locks/tandas que las hace posible.
// ==============================================================================

// ----- Variables y constantes -----

// CONTEXTO: VENTANA DE GUERRA PROTEGIDA 4:00-4:59 a.m. Lima. En esa hora solo corre runGuerra() ligera; ninguna otra ejecución pesada empieza ni continúa (desde 20 min antes). [→ Contexto_Base_Web.md §B001]

// CONTEXTO: VERSIONES PROGRAMADA / MANUAL (runPendientesYMensajes, runGuerraRapido y, desde el 17-oct-2026, runUpdate). Programada = lee checkpoint sin API (runUpdateProgramado sigue pidiendo /players); Manual (SIN sufijo desde el 17-oct-2026) = roster fresco + API. [→ Contexto_Base_Web.md §B002]

// FIX (22-ago-2026): "runGuerraRapido se cancela por excederse en el [→ Contexto_Base_Web.md §B003]
var PASOS_RUNGUERRARAPIDO = [
  function () {
    // CAMBIO (05-oct-2026, pedido usuario): este primer paso depende de la VERSION con la que arranco la cadena [→ Contexto_Base_Web.md §B004]
    SUPRIMIR_PLAYERS_TEMPORAL = true;
    if (PropertiesService.getScriptProperties().getProperty('RUNGUERRARAPIDO_SIN_API') === '1') {
      _fetchClanesBasicoSinApi();
    } else {
      forzarRosterFrescoAhora();
      capturarApiClanes_(CFG.CLANES_PROGRESO_MAX_EDAD_MS, 'runGuerraRapido paso 0');
    }
  },
  // Directorio (sin /players) — roster 100% fresco desde aquí en adelante.
  function () { updateDirectorioSheet(); },
  // FIX (20-ago-2026, pedido usuario): "expulsé miembros, corrí [→ Contexto_Base_Web.md §B005]
  function () {
    try { _refrescarColumnasFijasNuevos_Paso1_FormatoYPurgado(); }
    catch (eNuevos1) { Logger.log('[PASOS_RUNGUERRARAPIDO] _refrescarColumnasFijasNuevos_Paso1_FormatoYPurgado() falló: ' + eNuevos1.message); }
  },
  function () {
    try { _refrescarColumnasFijasNuevos_Paso2_ColumnasFijas(); }
    catch (eNuevos2) { Logger.log('[PASOS_RUNGUERRARAPIDO] _refrescarColumnasFijasNuevos_Paso2_ColumnasFijas() falló: ' + eNuevos2.message); }
  },
  function () {
    try { _refrescarColumnasFijasNuevos_Paso3_OrdenYFormato(); }
    catch (eNuevos3) { Logger.log('[PASOS_RUNGUERRARAPIDO] _refrescarColumnasFijasNuevos_Paso3_OrdenYFormato() falló: ' + eNuevos3.message); }
  },
  // FIX (02-sep-2026): se agrega `return` — updateGuerraSheet() ahora puede [→ Contexto_Base_Web.md §B006]
  function () { return updateGuerraSheet(); },      // Hoja Guerra
  function () { updateControlSheet(); },     // Hoja Control
  function () {
    try { actualizarControl2(); }
    catch (eCtrl2) { Logger.log('[PASOS_RUNGUERRARAPIDO] actualizarControl2() falló: ' + eCtrl2.message); }
  },
  function () { updatePendientesSheet(); },  // Hoja Pendientes
  function () { runGenerarMensajes(); },     // Hoja Mensajes (reconstruida desde Pendientes)
  // FIX (desfase Menú/Mensajes): runGenerarMensajes() regenera Mensajes, [→ Contexto_Base_Web.md §B007]
  function () { _actualizarMenuDinamico(); },
];

var NOMBRES_PASOS_RUNGUERRARAPIDO = [
  'Clanes básico (sin /players)',
  'Directorio',
  'Nuevos (formato y purgado)',
  'Nuevos (columnas fijas)',
  'Nuevos (orden y formato condicional)',
  'Guerra',
  'Control',
  'Control_2',
  'Pendientes',
  'Mensajes',
  'Índice de contenido (mensajes dinámicos)',
];

var PASOS_RUNALL = [
  // FIX (06-ago-2026): _limpiarHojasCardsObsoletas() se agrega aquí, mismo [→ Contexto_Base_Web.md §B008]
  function () { _renombrarHojasHistorialLegacy(); },
  function () { setupAllSheets(); },
  // Se suma _limpiarHojaMenuObsoleta(): borra la hoja Menú (reemplazada por el [→ Contexto_Base_Web.md §B009]
  function () { _limpiarHojaTerrenoLimpio(); _limpiarHojasCardsObsoletas(); _limpiarHojaMenuObsoleta(); _limpiarHojaTRequisitosObsoleta(); },
  // _restaurarNuevosSiNoExiste() (14_Nuevos_RoyaleAPI.gs) va en este paso: [→ Contexto_Base_Web.md §B010]
  function () {
    importarDirectorioDesdeCSV(); importarAcumulativosDesdeCSV(); importarBackupCelulares(); importarIndiceDesdeCSV(); importarTListaDesdeCSV(); importarSListaDesdeCSV(); importarCRListaDesdeCSV(); importarExtraDesdeCSV();
    // FIX (02-sep-2026, reportado por el usuario -- "T_Control, T_Asistencia [→ Contexto_Base_Web.md §B011]
    importarTAsistenciaDesdeCSV();
    importarTResolucionesDesdeCSV();
    importarSAsistenciaDesdeCSV();
  },
  function () {
    // GUARD (05-ago-2026): se envuelve la restauración opcional con [→ Contexto_Base_Web.md §B012]
    if (typeof _restaurarNuevosSiNoExiste === 'function') {
      try { _restaurarNuevosSiNoExiste(); }
      catch (e) { Logger.log('[PASOS_RUNALL] _restaurarNuevosSiNoExiste() falló: ' + e.message); }
    } else {
      Logger.log('[PASOS_RUNALL] AVISO: _restaurarNuevosSiNoExiste no está definida en este momento de ejecución (revisar si 14_Nuevos_RoyaleAPI.gs está guardado/actualizado en este proyecto, o si se está ejecutando una versión de Biblioteca vieja).');
    }
  },
  // FIX (22-ago-2026): _refrescarColumnasFijasNuevos() iba metida en el [→ Contexto_Base_Web.md §B013]
  function () {
    if (typeof _refrescarColumnasFijasNuevos_Paso1_FormatoYPurgado === 'function') {
      try { _refrescarColumnasFijasNuevos_Paso1_FormatoYPurgado(); }
      catch (e1) { Logger.log('[PASOS_RUNALL] _refrescarColumnasFijasNuevos_Paso1_FormatoYPurgado() falló: ' + e1.message); }
    }
  },
  function () {
    if (typeof _refrescarColumnasFijasNuevos_Paso2_ColumnasFijas === 'function') {
      try { _refrescarColumnasFijasNuevos_Paso2_ColumnasFijas(); }
      catch (e2) { Logger.log('[PASOS_RUNALL] _refrescarColumnasFijasNuevos_Paso2_ColumnasFijas() falló: ' + e2.message); }
    }
  },
  function () {
    if (typeof _refrescarColumnasFijasNuevos_Paso3_OrdenYFormato === 'function') {
      try { _refrescarColumnasFijasNuevos_Paso3_OrdenYFormato(); }
      catch (e3) { Logger.log('[PASOS_RUNALL] _refrescarColumnasFijasNuevos_Paso3_OrdenYFormato() falló: ' + e3.message); }
    }
  },
  // FIX (15-ago-2026): _fetchAllClanData() y guardarApiDump() iban en el [→ Contexto_Base_Web.md §B014]
  function () { return _fetchAllClanData(); },
  function () { guardarApiDump(); },
  // FIX (03-ago-2026): _restaurarControl2SiNoExiste() se saca del paso [→ Contexto_Base_Web.md §B015]
  function () { _restaurarControl2SiNoExiste(); },
  // Extra y Clan van en pasos SEPARADOS (antes iban juntos en una sola [→ Contexto_Base_Web.md §B016]
  function () { updateExtraSheet(); },
  function () { updateClanSheet(); },
  // Cards/Cards_2 van ANTES de Directorio: generarUrlMazo() (llamado al [→ Contexto_Base_Web.md §B017]
  function () { updateCardsSheet(); },
  function () { updateCards2Sheet(); },
  // NUEVO (27-sep-2026, pedido del usuario): battlelog + upcomingchests, uno [→ Contexto_Base_Web.md §B018]
  function () { return _descargarBattlelogYCofresParaTodos(); },
  // FASE 5(a) del plan de fases (23-sep-2026, pedido del usuario): Insignias [→ Contexto_Base_Web.md §B019]
  function () { updateInsigniasSheet(); },
  function () { updateInsignias2Sheet(); },
  // 24-sep-2026 (pedido usuario): Camino de Leyendas en su propio CSV [→ Contexto_Base_Web.md §B020]
  function () { updateCaminoLeyendasSheet(); },
  // 24-sep-2026 (pedido usuario): Logros (catálogo) y Logros_2 (por jugador) en [→ Contexto_Base_Web.md §B021]
  function () { updateLogrosSheet(); },
  function () { updateLogros2Sheet(); },
  // 24-sep-2026 (pedido usuario): los 5 contadores de la cabecera de [→ Contexto_Base_Web.md §B022]
  function () { updatePerfilWebSheet(); },
  // 24-sep-2026 (pedido usuario): progress{} (modos rotativos -- Táctica [→ Contexto_Base_Web.md §B023]
  function () { updateProgresoEventosSheet(); },
  function () { updateDirectorioSheet(); },
  // FIX (20-ago-2026): corregido el tag del log (decía "[PASOS_RUNUPDATE]" [→ Contexto_Base_Web.md §B024]
  function () {
    if (typeof _refrescarColumnasFijasNuevos_Paso1_FormatoYPurgado === 'function') {
      try { _refrescarColumnasFijasNuevos_Paso1_FormatoYPurgado(); }
      catch (e1) { Logger.log('[PASOS_RUNALL] _refrescarColumnasFijasNuevos_Paso1_FormatoYPurgado() falló: ' + e1.message); }
    }
  },
  function () {
    if (typeof _refrescarColumnasFijasNuevos_Paso2_ColumnasFijas === 'function') {
      try { _refrescarColumnasFijasNuevos_Paso2_ColumnasFijas(); }
      catch (e2) { Logger.log('[PASOS_RUNALL] _refrescarColumnasFijasNuevos_Paso2_ColumnasFijas() falló: ' + e2.message); }
    }
  },
  function () {
    if (typeof _refrescarColumnasFijasNuevos_Paso3_OrdenYFormato === 'function') {
      try { _refrescarColumnasFijasNuevos_Paso3_OrdenYFormato(); }
      catch (e3) { Logger.log('[PASOS_RUNALL] _refrescarColumnasFijasNuevos_Paso3_OrdenYFormato() falló: ' + e3.message); }
    }
  },
  // Torneos (T_Lista/T_Asistencia/T_Control, ver 26_Torneos_Core.gs): va después [→ Contexto_Base_Web.md §B025]
  function () { return procesarTorneos(); },
  // FIX (09-sep-2026, pedido usuario -- "_continuarProcesarSorteos() / [→ Contexto_Base_Web.md §B026]
  function () { return procesarSorteos(); },
  // Guerra y Guerra_Logs van en pasos SEPARADOS (mismo motivo que [→ Contexto_Base_Web.md §B027]
  function () { return updateGuerraSheet(); },
  function () { updateGuerraLogsSheet(); },
  // FASE 11 (punto 4 del Consolidado_Cambios_Pendientes_Guerra.md): cierre [→ Contexto_Base_Web.md §B028]
  function () {
    try { _cerrarSemanaActualNuevos(); }
    catch (eCierreNuevos) { Logger.log('[PASOS_RUNALL] _cerrarSemanaActualNuevos() falló: ' + eCierreNuevos.message); }
  },
  // FIX (20-ago-2026, pedido usuario): se agrega actualizarControl2() aquí, [→ Contexto_Base_Web.md §B029]
  function () { updateControlSheet(); },
  function () { updateVistasDerivadas(); },
  function () {
    try { actualizarControl2(); }
    catch (e) { Logger.log('[PASOS_RUNALL] actualizarControl2() falló: ' + e.message); }
  },
  // Plantillas va ANTES de _pendientesYMensajesNucleo_(): generarTodosMensajes() [→ Contexto_Base_Web.md §B030]
  function () { syncPlantillasDesdeDrive(); },
  // FIX (22-ago-2026, parte 2): runPendientesYMensajes() + runCalendario() [→ Contexto_Base_Web.md §B031]
  function () { _pendientesYMensajesNucleo_(); },
  function () { runCalendario(); },
  // Menú (parte Dinámico) va DESPUÉS de runPendientesYMensajes, porque [→ Contexto_Base_Web.md §B032]
  function () { _actualizarMenuDinamico(); },
  // FIX (22-ago-2026, parte 2): actualizarDropdownCatDisp() + [→ Contexto_Base_Web.md §B033]
  function () { sincronizarAdministradores(); },
  function () { actualizarDropdownCatDisp(); },
  // FIX (22-ago-2026, parte 2): actualizarIndiceSheet() +
  // _reordenarYOcultarHojasSegunIndice() separados, mismo criterio.
  function () { actualizarIndiceSheet(); },
  function () { _reordenarYOcultarHojasSegunIndice(); },
  // FASE (01/08/2026): limpia enlaces accidentales en columnas Nombre/ [→ Contexto_Base_Web.md §B034]
  function () { return limpiarLinksAccidentalesDeNombres(); },
  // El respaldo CSV completo (syncAllCSV() + respaldarHojasRestantesCSV()) [→ Contexto_Base_Web.md §B035]
  function () { syncDirectorioCSV(); syncClanCSV(); },
  // FIX (02-sep-2026): se agrega `return` — syncAcumulativosCSV() ahora es [→ Contexto_Base_Web.md §B036]
  function () { return syncAcumulativosCSV(); },
  // FIX (16-ago-2026): _syncGuerraCSV(shGuerra) + exportarBackupCelulares() [→ Contexto_Base_Web.md §B037]
  function () {
    var ss = _getSs();
    var shGuerra = ss.getSheetByName(CFG.SHEETS.GUERRA);
    if (shGuerra) _syncGuerraCSV(shGuerra);
    Logger.log('[Backup] syncAllCSV (parte 1/2): Directorio + Clan + Guerra + Acumulativos sincronizados.');
  },
  function () {
    exportarBackupCelulares();
    Logger.log('[Backup] syncAllCSV (parte 2/2): celulares (JSON) sincronizado.');
  },
  function () { respaldarIndiceYProtegidasCSV(); },
  function () { return respaldarHojasDerivadasCSV(); },
  // FIX (22-ago-2026, parte 2): aplicarFormatoGlobal() + aplicarClipGlobal() [→ Contexto_Base_Web.md §B038]
  function () { aplicarFormatoGlobal(); },
  function () { aplicarClipGlobal(); },
  function () { _aplicarTablasYGridlines(); },
  // FIX (20-ago-2026, pedido usuario): se reemplaza autoajustarAnchoColumnas() [→ Contexto_Base_Web.md §B039]
  function () { restaurarAnchosColumnasFijos(); },
  // FIX (18-sep-2026, pedido usuario -- "Conflictos, T_Resoluciones, Grupo [→ Contexto_Base_Web.md §B040]
  function () { return autoajustarHojasSinAnchosGuardados(); },
];

// Descripciones cortas alineadas 1 a 1 con PASOS_RUNALL (mismo orden, 42 [→ Contexto_Base_Web.md §B041]
var NOMBRES_PASOS_RUNALL = [
  'Renombrar hojas de historial legacy',
  'Setup de todas las hojas',
  'Limpiar hojas obsoletas (Terreno limpio / Cards)',
  'Importar CSV (Directorio, Acumulativos, celulares, Clan, Índice, T_Lista)',
  // FIX (22-ago-2026): esta entrada ya NO incluye "columnas fijas" — [→ Contexto_Base_Web.md §B042]
  'Restaurar hojas manuales (Nuevos)',
  // FIX (22-ago-2026): 3 entradas nuevas, corresponden a las 3 partes en [→ Contexto_Base_Web.md §B043]
  'Nuevos: formato y purgado',
  'Nuevos: columnas fijas',
  'Nuevos: orden y formato condicional',
  'Fetch de datos de la API de clanes',
  // FIX (15-ago-2026): nombre nuevo, corresponde al paso de guardarApiDump()
  // recién separado del fetch de arriba (ver PASOS_RUNALL).
  'Guardar dump de API (ApiDump)',
  'Restaurar Control_2 si no existe',
  'Actualizar hoja Extra',
  'Actualizar hoja Clan',
  'Actualizar hoja Cards',
  'Actualizar hoja Cards_2',
  // 27-sep-2026: corresponde al paso _descargarBattlelogYCofresParaTodos()
  // de PASOS_RUNALL, recién agregado (ver comentario FIX ahí).
  'Battlelog + UpcomingChests (por jugador, atado al interruptor de players)',
  // FASE 5(a) del plan de fases (23-sep-2026): 2 entradas nuevas, [→ Contexto_Base_Web.md §B044]
  'Actualizar hoja Insignias',
  'Actualizar hoja Insignias_2',
  // 24-sep-2026: corresponde al paso updateCaminoLeyendasSheet() de PASOS_RUNALL.
  'Actualizar CSV Camino de Leyendas',
  // 24-sep-2026: corresponden a updateLogrosSheet()/updateLogros2Sheet() de PASOS_RUNALL.
  'Actualizar CSV Logros',
  'Actualizar CSV Logros_2',
  // 24-sep-2026: corresponde al paso updatePerfilWebSheet() de PASOS_RUNALL.
  'Actualizar CSV Perfil (XP y torre del rey)',
  // 24-sep-2026: corresponde al paso updateProgresoEventosSheet() de PASOS_RUNALL.
  'Actualizar CSV Progreso en eventos rotativos',
  'Actualizar hoja Directorio',
  // FIX (22-ago-2026): 3 entradas nuevas (segunda vez que se divide
  // _refrescarColumnasFijasNuevos() en PASOS_RUNALL, ver arriba).
  'Nuevos: formato y purgado (2da pasada)',
  'Nuevos: columnas fijas (2da pasada)',
  'Nuevos: orden y formato condicional (2da pasada)',
  'Procesar Torneos (T_Lista/T_Asistencia/T_Control)',
  // FIX (09-sep-2026): antes 2 entradas sueltas ('Sincronizar requisitos de [→ Contexto_Base_Web.md §B045]
  'Procesar Sorteos (S_Lista + requisitos + participantes calificados)',
  'Actualizar hoja Guerra',
  'Actualizar hoja Guerra_Logs',
  // FASE 11 (punto 4 del Consolidado): entrada nueva, corresponde al paso [→ Contexto_Base_Web.md §B046]
  'Nuevos: cierre semanal hacia el histórico',
  // FIX (22-ago-2026): entradas separadas en 3 (antes una sola "Actualizar [→ Contexto_Base_Web.md §B047]
  'Actualizar hoja Control',
  'Actualizar vistas derivadas (Inactivos/Vetados/Multicuentas/Historial/Ascensos)',
  'Actualizar hoja Control_2',
  'Sincronizar Plantillas desde Drive',
  'Pendientes y Mensajes',
  'Actualizar Calendario',
  'Actualizar índice de contenido (dinámico)',
  'Actualizar dropdown Cat_disp',
  'Sincronizar Administradores',
  'Actualizar hoja Índice',
  'Reordenar y ocultar hojas según Índice',
  'Limpiar enlaces accidentales en nombres',
  'Backup CSV: Directorio + Clan',
  'Backup CSV: Acumulativos',
  // FIX (16-ago-2026): entrada nueva, corresponde al paso de [→ Contexto_Base_Web.md §B048]
  'Backup CSV: Guerra',
  'Backup CSV: celulares',
  'Backup CSV: Índice y protegidas',
  'Backup CSV: hojas derivadas',
  'Aplicar formato global',
  'Aplicar CLIP global',
  'Aplicar tablas y gridlines',
  // FIX (20-ago-2026): entrada actualizada -- este paso ahora llama a [→ Contexto_Base_Web.md §B049]
  'Restaurar anchos de columna fijos',
  // FIX (18-sep-2026): entrada nueva, corresponde al paso de [→ Contexto_Base_Web.md §B050]
  'Autoajustar hojas sin anchos guardados',
];

var PASOS_RUNUPDATE = [
  // FIX (15-ago-2026): ver comentario equivalente en PASOS_RUNALL — [→ Contexto_Base_Web.md §B051]
  function () { return _fetchAllClanData(); },
  // PF091 etapa 4 (17-oct-2026): en la version programada se omite: la captura que dejo el checkpoint ya escribio los JSON de
  // clans y currentriverrace, y reescribirlos desde el checkpoint solo les cambiaria la hora del nombre sin datos nuevos.
  function () {
    if (PropertiesService.getScriptProperties().getProperty('RUNUPDATE_SIN_API') === '1') {
      Logger.log('[ApiDump] OMITIDO en la version programada de runUpdate: los JSON de clans y currentriverrace ya los escribio la captura que dejo el checkpoint.');
    } else {
      guardarApiDump();
    }
  },
  // Ver comentario equivalente en PASOS_RUNALL: Extra y Clan van separados
  // para dar un punto de control de presupuesto entre ambos.
  function () { updateExtraSheet(); },
  function () { updateClanSheet(); },
  // Ver comentario equivalente en PASOS_RUNALL: Cards/Cards_2 deben [→ Contexto_Base_Web.md §B052]
  function () { updateCardsSheet(); },
  function () { updateCards2Sheet(); },
  // FASE 5(a) del plan de fases (23-sep-2026): ver comentario completo en [→ Contexto_Base_Web.md §B053]
  function () { updateInsigniasSheet(); },
  function () { updateInsignias2Sheet(); },
  // 24-sep-2026 (pedido usuario): Camino de Leyendas en su propio CSV [→ Contexto_Base_Web.md §B054]
  function () { updateCaminoLeyendasSheet(); },
  // 24-sep-2026 (pedido usuario): Logros (catálogo) y Logros_2 (por jugador) en [→ Contexto_Base_Web.md §B055]
  function () { updateLogrosSheet(); },
  function () { updateLogros2Sheet(); },
  // 24-sep-2026 (pedido usuario): los 5 contadores de la cabecera de [→ Contexto_Base_Web.md §B056]
  function () { updatePerfilWebSheet(); },
  // 24-sep-2026 (pedido usuario): progress{} (modos rotativos -- Táctica [→ Contexto_Base_Web.md §B057]
  function () { updateProgresoEventosSheet(); },
  function () { updateDirectorioSheet(); },
  // FIX (20-ago-2026, pedido usuario): FALTABA POR COMPLETO en [→ Contexto_Base_Web.md §B058]
  function () {
    if (typeof _refrescarColumnasFijasNuevos_Paso1_FormatoYPurgado === 'function') {
      try { _refrescarColumnasFijasNuevos_Paso1_FormatoYPurgado(); }
      catch (e1) { Logger.log('[PASOS_RUNUPDATE] _refrescarColumnasFijasNuevos_Paso1_FormatoYPurgado() falló: ' + e1.message); }
    }
  },
  function () {
    if (typeof _refrescarColumnasFijasNuevos_Paso2_ColumnasFijas === 'function') {
      try { _refrescarColumnasFijasNuevos_Paso2_ColumnasFijas(); }
      catch (e2) { Logger.log('[PASOS_RUNUPDATE] _refrescarColumnasFijasNuevos_Paso2_ColumnasFijas() falló: ' + e2.message); }
    }
  },
  function () {
    if (typeof _refrescarColumnasFijasNuevos_Paso3_OrdenYFormato === 'function') {
      try { _refrescarColumnasFijasNuevos_Paso3_OrdenYFormato(); }
      catch (e3) { Logger.log('[PASOS_RUNUPDATE] _refrescarColumnasFijasNuevos_Paso3_OrdenYFormato() falló: ' + e3.message); }
    }
  },
  // Torneos (T_Lista/T_Asistencia/T_Control, ver 26_Torneos_Core.gs): ver [→ Contexto_Base_Web.md §B059]
  function () { return procesarTorneos(); },
  // FIX (09-sep-2026): ver el comentario FIX completo en PASOS_RUNALL, mismo [→ Contexto_Base_Web.md §B060]
  function () { return procesarSorteos(); },
  // Ver comentario equivalente en PASOS_RUNALL: Guerra y Guerra_Logs van [→ Contexto_Base_Web.md §B061]
  function () { return updateGuerraSheet(); },
  function () { updateGuerraLogsSheet(); },
  // Ver comentario equivalente en PASOS_RUNALL (justo después de [→ Contexto_Base_Web.md §B062]
  function () {
    try { _cerrarSemanaActualNuevos(); }
    catch (eCierreNuevos) { Logger.log('[PASOS_RUNUPDATE] _cerrarSemanaActualNuevos() falló: ' + eCierreNuevos.message); }
  },
  // FIX (20-ago-2026, pedido usuario): se agrega actualizarControl2() aquí — [→ Contexto_Base_Web.md §B063]
  function () { updateControlSheet(); },
  function () {
    try { actualizarControl2(); }
    catch (e) { Logger.log('[PASOS_RUNUPDATE] actualizarControl2() falló: ' + e.message); }
  },
  // FASE 4 (05-ago-2026, plan de migración Plantillas -> Menú): igual que [→ Contexto_Base_Web.md §B064]
  function () { syncPlantillasDesdeDrive(); },
  // PF091 (17-oct-2026): en la version programada (bandera RUNUPDATE_SIN_API) no se vuelve a pasar por la captura.
  function () { _pendientesYMensajesNucleo_(PropertiesService.getScriptProperties().getProperty('RUNUPDATE_SIN_API') === '1'); },
  // FIX (23-ago-2026, pedido usuario): "escribí una nota en el calendario, [→ Contexto_Base_Web.md §B065]
  function () {
    try { updateCalendario2(); }
    catch (eCal2) { Logger.log('[PASOS_RUNUPDATE] updateCalendario2() falló: ' + eCal2.message); }
  },
  // Menú (parte Dinámico) sigue yendo DESPUÉS de runPendientesYMensajes [→ Contexto_Base_Web.md §B066]
  function () { _actualizarMenuDinamico(); },
  // FIX (22-ago-2026, parte 2): separados, mismo criterio que en PASOS_RUNALL. [→ Contexto_Base_Web.md §B067]
  function () { sincronizarAdministradores(); },
  function () { actualizarDropdownCatDisp(); },
  function () { actualizarIndiceSheet(); },
  function () { _reordenarYOcultarHojasSegunIndice(); },
  function () { updateVistasDerivadas(); },
  // FASE (01/08/2026): ver comentario equivalente en PASOS_RUNALL — limpia [→ Contexto_Base_Web.md §B068]
  function () { return limpiarLinksAccidentalesDeNombres(); },
  // FIX (22-ago-2026, parte 2): syncAllCSV() llamaba de un tirón a [→ Contexto_Base_Web.md §B069]
  function () { syncDirectorioCSV(); syncClanCSV(); },
  // FIX (02-sep-2026): se agrega `return`, mismo motivo que en PASOS_RUNALL [→ Contexto_Base_Web.md §B070]
  function () { return syncAcumulativosCSV(); },
  function () {
    var ss = _getSs();
    var shGuerra = ss.getSheetByName(CFG.SHEETS.GUERRA);
    if (shGuerra) _syncGuerraCSV(shGuerra);
    Logger.log('[Backup] syncAllCSV (parte 1/2, vía PASOS_RUNUPDATE): Directorio + Clan + Guerra + Acumulativos sincronizados.');
  },
  function () {
    exportarBackupCelulares();
    Logger.log('[Backup] syncAllCSV (parte 2/2, vía PASOS_RUNUPDATE): celulares (JSON) sincronizado.');
  },
  // FIX (22-ago-2026, parte 2): las 4 llamadas finales iban en un solo paso,
  // mismo criterio de la barrida general.
  function () { aplicarClipGlobal(); },
  function () { _restaurarFiltros(); },
  function () { _limpiarBordesFilasVacias(); },
  function () { _aplicarBordesComentarios(); },
];

/**
 * runSyncCSV() - Sincroniza todos los CSV con Drive.
 */
/**
 * PASOS_RUNSYNCCSV — mismo desglose que ya usa PASOS_RUNALL para el [→ Contexto_Base_Web.md §B071]
 */
var PASOS_RUNSYNCCSV = [
  function () { syncDirectorioCSV(); syncClanCSV(); },
  // FIX (02-sep-2026): se agrega `return`, mismo motivo que en PASOS_RUNALL/ [→ Contexto_Base_Web.md §B072]
  function () { return syncAcumulativosCSV(); },
  // FIX (16-ago-2026): mismo desdoblamiento aplicado en PASOS_RUNALL (ver [→ Contexto_Base_Web.md §B073]
  function () {
    var ss = _getSs();
    var shGuerra = ss.getSheetByName(CFG.SHEETS.GUERRA);
    if (shGuerra) _syncGuerraCSV(shGuerra);
    Logger.log('[Backup] syncAllCSV (parte 1/2): Directorio + Clan + Guerra + Acumulativos sincronizados.');
  },
  function () {
    exportarBackupCelulares();
    Logger.log('[Backup] syncAllCSV (parte 2/2): celulares (JSON) sincronizado.');
  },
  // PF146 (21-oct-2026): antes este paso era UN solo respaldarIndiceYProtegidasCSV() (5 respaldos de 15-52 s cada uno, ~200 s
  // sin poder cortarse; el 21-oct a las 7:51 la corrida llego a 361 s). Ahora cada respaldo es un paso, para que
  // _ejecutarPorTandas revise el presupuesto entre uno y otro. Las claves son las de PROTEGIDAS_CSV_CLAVES (05_Backup_CSV.gs).
  // La cadena pasa de 7 a 14 pasos. [→ Contexto_Base_Web.md §PF146]
  function () { respaldarIndiceYProtegidasCSV('INDICE'); },
  function () { respaldarIndiceYProtegidasCSV('VETADOS'); },
  function () { respaldarIndiceYProtegidasCSV('T_LISTA'); },
  function () { respaldarIndiceYProtegidasCSV('S_LISTA'); },
  function () { respaldarIndiceYProtegidasCSV('CR_LISTA'); },
  function () { respaldarIndiceYProtegidasCSV('T_ASISTENCIA'); },
  function () { respaldarIndiceYProtegidasCSV('S_ASISTENCIA'); },
  function () { respaldarIndiceYProtegidasCSV('EXTRA'); },
  function () { return respaldarHojasDerivadasCSV(); },
  // NUEVO (2-oct-2026, pregunta 51, hoja Battlelogs; decision de la usuaria): [→ Contexto_Base_Web.md §B074]
  function () {
    if (typeof actualizarHojaBattlelogs !== 'function') {
      Logger.log('[PASOS_RUNSYNCCSV] actualizarHojaBattlelogs() no existe (falta 07_Battlelogs_Hoja.gs). Se omite el paso.');
      return;
    }
    try { actualizarHojaBattlelogs(); }
    catch (eBlh) { Logger.log('[PASOS_RUNSYNCCSV] actualizarHojaBattlelogs() falló: ' + eBlh.message); }
  },
];

// ----- Funciones manuales / punto de entrada -----

// Define todas las funciones ejecutables por el usuario o por triggers automáticos. [→ Contexto_Base_Web.md §B075]

// CONTROL DE EJECUCIÓN: lock auto-expirable + continuación por tandas [→ Contexto_Base_Web.md §B076]


// SECCIÓN 1: FUNCIONES MANUALES (entry points del usuario y de triggers) [→ Contexto_Base_Web.md §B077]

// PUNTOS DE ENTRADA PRINCIPALES (orden de lectura recomendado) [→ Contexto_Base_Web.md §B078]

/**
 * cancelarEjecucion() - Función PÚBLICA para detener manualmente runAll()/ [→ Contexto_Base_Web.md §B079]
 */
function cancelarEjecucion() {
  _borrarTriggersDeContinuacion('_continuarRunAll');
  _borrarTriggersDeContinuacion('_continuarRunUpdate');
  // FIX (22-ago-2026): runGuerraRapido() ahora también usa el motor de [→ Contexto_Base_Web.md §B080]
  _borrarTriggersDeContinuacion('_continuarRunGuerraRapido');

  var props = PropertiesService.getScriptProperties();
  var pasoRunAll    = props.getProperty('RUNALL_PASO');
  var pasoRunUpdate = props.getProperty('RUNUPDATE_PASO');
  var pasoRunGuerraRapido = props.getProperty('RUNGUERRARAPIDO_PASO');
  props.deleteProperty('RUNALL_PASO');
  props.deleteProperty('RUNUPDATE_PASO');
  props.deleteProperty('RUNALL_REINTENTO');
  props.deleteProperty('RUNUPDATE_REINTENTO');
  props.deleteProperty('RUNGUERRARAPIDO_PASO');
  props.deleteProperty('RUNGUERRARAPIDO_REINTENTO');
  // NUEVO (05-oct-2026): bandera de la version programada de runGuerraRapido y candado propio de la version
  // programada de Pendientes/Mensajes.
  props.deleteProperty('RUNGUERRARAPIDO_SIN_API');
  props.deleteProperty('RUNGUERRARAPIDO_SIN_API_TS');
  // PF091 (17-oct-2026): bandera de la version programada de runUpdate.
  props.deleteProperty('RUNUPDATE_SIN_API');
  props.deleteProperty('RUNUPDATE_SIN_API_TS');
  props.deleteProperty('PYM_PROGRAMADO_EN_CURSO');

  // Borra también el progreso de /players guardado en Drive (ver [→ Contexto_Base_Web.md §B081]
  _borrarProgresoPlayers();
  // FIX (06-ago-2026): idem para el checkpoint de clanes/currentriverrace.
  _borrarProgresoClanes();
  // NUEVO (27-sep-2026): idem para el checkpoint de battlelog+upcomingchests [→ Contexto_Base_Web.md §B082]
  _borrarProgresoBattlelogChests();

  _liberarLockEjecucion();

  Logger.log('[Cancelar] Ejecución cancelada manualmente.' +
    (pasoRunAll    ? ' RUNALL_PASO eliminado (estaba en ' + pasoRunAll + ').' : '') +
    (pasoRunUpdate ? ' RUNUPDATE_PASO eliminado (estaba en ' + pasoRunUpdate + ').' : '') +
    (pasoRunGuerraRapido ? ' RUNGUERRARAPIDO_PASO eliminado (estaba en ' + pasoRunGuerraRapido + ').' : '') +
    ' Triggers de continuación borrados. Progreso de /players, de clanes y de battlelog/upcomingchests borrado. Lock liberado. Ya puedes ejecutar runAll()/runUpdate()/runGuerraRapido() desde cero.');
}

// demolerTodoElSpreadsheet() — MOVIDA desde 48_Herramientas_Debug.gs a este archivo, justo [→ Contexto_Base_Web.md §B083]

function demolerTodoElSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log('Iniciando la limpieza del terreno (Modo Blindado)...');

  // FIX (11-sep-2026, pedido del usuario -- "T_Lista/S_Lista quedan vacías [→ Contexto_Base_Web.md §B084]
  try {
    Logger.log('[Demoler] Borrando checkpoint de continuación de runAll()/runUpdate() (forzar que la próxima corrida empiece desde el primer paso)...');
    var propsCheckpoint = PropertiesService.getScriptProperties();
    propsCheckpoint.deleteProperty('RUNALL_PASO');
    propsCheckpoint.deleteProperty('RUNALL_REINTENTO');
    propsCheckpoint.deleteProperty('RUNUPDATE_PASO');
    propsCheckpoint.deleteProperty('RUNUPDATE_REINTENTO');
    propsCheckpoint.deleteProperty('RUNUPDATE_SIN_API');     // PF091 (17-oct-2026)
    propsCheckpoint.deleteProperty('RUNUPDATE_SIN_API_TS');
    Logger.log('[Demoler] Checkpoint de runAll()/runUpdate() borrado.');
  } catch (e) {
    Logger.log('[Demoler] AVISO: no se pudo borrar el checkpoint de runAll()/runUpdate() (' + e.message + '). Se continúa igual.');
  }

  // FIX (12-ago-2026, pedido del usuario): "Visibilidad/Tipo/Edición de la [→ Contexto_Base_Web.md §B085]
  try {
    Logger.log('[Demoler] Respaldando Índice (Visibilidad/Tipo/Edición) antes de borrar...');
    respaldarIndiceYProtegidasCSV();
    Logger.log('[Demoler] Respaldo de Índice completado.');
  } catch (e) {
    // Si el respaldo falla (ej. hoja Índice no existe todavía, primera vez [→ Contexto_Base_Web.md §B086]
    Logger.log('[Demoler] AVISO: no se pudo respaldar Índice antes de demoler (' + e.message + '). Se continúa igual.');
  }

  // FIX (14-ago-2026, pedido usuario): "expulsé miembros del clan y tras [→ Contexto_Base_Web.md §B087]
  try {
    Logger.log('[Demoler] Borrando checkpoints de clanes/jugadores en Drive (forzar datos 100% frescos en el próximo runAll)...');
    _borrarProgresoClanes();
    _borrarProgresoPlayers();
    Logger.log('[Demoler] Checkpoints borrados.');
  } catch (e) {
    Logger.log('[Demoler] AVISO: no se pudieron borrar los checkpoints de clanes/jugadores (' + e.message + '). Se continúa igual — runAll() los recreará si hace falta.');
  }

  // 1. Verificamos si ya existe la hoja temporal para no chocar si lo corres dos veces
  var hojaTemporal = ss.getSheetByName('Terreno_Limpio');
  if (!hojaTemporal) {
    hojaTemporal = ss.insertSheet('Terreno_Limpio');
  }

  // 2. Obligamos a que la hoja temporal sea la activa.
  // (Borrar la hoja que Sheets tiene en primer plano a veces causa el crasheo)
  ss.setActiveSheet(hojaTemporal);

  // 3. Extraemos SOLO LOS NOMBRES de las hojas.
  // No guardamos los objetos completos para que no se "caduquen".
  var nombresHojas = [];
  var hojas = ss.getSheets();
  for (var i = 0; i < hojas.length; i++) {
    nombresHojas.push(hojas[i].getName());
  }

  // 4. Iteramos y borramos buscando por nombre fresco en cada vuelta
  for (var j = 0; j < nombresHojas.length; j++) {
    var nombre = nombresHojas[j];

    if (nombre !== 'Terreno_Limpio') {
      try {
        var hojaParaBorrar = ss.getSheetByName(nombre);
        if (hojaParaBorrar) {
          ss.deleteSheet(hojaParaBorrar);
          Logger.log('Hoja eliminada exitosamente: ' + nombre);
        }
      } catch(e) {
        // Si hay algún error fantasma, lo reporta pero NO detiene la ejecución
        Logger.log('Ignorado - No se pudo borrar la hoja: ' + nombre + ' | Detalle: ' + e.message);
      }
    }
  }

  Logger.log('¡Demolición completada al 100%! Tu archivo está en blanco y listo para ejecutar runAll().');
}

// FORZAR ROSTER 100% FRESCO (14-ago-2026, pedido usuario) [→ Contexto_Base_Web.md §B088]
function forzarRosterFrescoAhora() {
  try {
    // FIX (02-oct-2026): el checkpoint de clanes se INVALIDA (no se borra)
    // para conservar un respaldo de roster si la API falla justo después.
    _invalidarProgresoClanes();
    _borrarProgresoPlayers();
    Logger.log('[Utilidades] forzarRosterFrescoAhora: checkpoints de clanes/jugadores invalidados. La próxima corrida pedirá datos 100% frescos a la API.');
  } catch (e) {
    Logger.log('[Utilidades] forzarRosterFrescoAhora: ERROR al borrar checkpoints — ' + e.message);
  }
}

/**
 * _pendientesYMensajesNucleo_(sinApi) [→ Contexto_Base_Web.md §B089]
 */
function _pendientesYMensajesNucleo_(sinApi) {
  if (sinApi !== true) capturarApiClanes_(CFG.CLANES_PROGRESO_MAX_EDAD_MS, 'pendientesYMensajesNucleo');  // Asegura el cache básico actualizado (Pendientes/Mensajes no usan /players)
  updatePendientesSheet();   // Reconstruye Pendientes desde Guerra + cache
  runGenerarMensajes();      // Reconstruye Mensajes desde Pendientes
}

/**
 * _actualizarIndiceTrasPendientes_() [→ Contexto_Base_Web.md §B090]
 */
function _actualizarIndiceTrasPendientes_() {
  if (typeof PENDIENTES_ABORTADO_POR_API !== 'undefined' && PENDIENTES_ABORTADO_POR_API) {
    Logger.log('[Indice] Pendientes aborto por falta de datos de la API: no hay mensajes nuevos, se omite actualizar el indice.');
    return;
  }
  try {
    _actualizarMenuDinamico();
  } catch (e) {
    Logger.log('[Indice] ERROR al actualizar el indice tras Pendientes/Mensajes: ' + e.message + '. La web y el bot siguen viendo el indice anterior.');
  }
}

/**
 * runPendientesYMensajesProgramado() - VERSION PARA EL DISPARADOR (05-oct-2026, pedido usuario). [→ Contexto_Base_Web.md §B091]
 */
function runPendientesYMensajesProgramado() {
  var t0 = Date.now();
  var props = PropertiesService.getScriptProperties();

  // 1) Otra ejecucion pesada activa (candado global vigente): no se compite con ella.
  try {
    var rawGlobal = props.getProperty('EJECUCION_EN_CURSO');
    if (rawGlobal) {
      var infoG = JSON.parse(rawGlobal);
      var antG = Date.now() - infoG.inicio;
      if (antG < CFG.LOCK_MAX_DURACION_MS) {
        Logger.log('[runPendientesYMensajesProgramado] OMITIDO: hay otra ejecucion en curso (' + infoG.fn +
          ', iniciada hace ' + Math.round(antG / 1000) + 's). Se reintenta en el proximo disparo.');
        return;
      }
    }
  } catch (eG) { /* propiedad corrupta: se ignora, el candado propio protege de todos modos */ }

  // 2) Candado propio (no es EJECUCION_EN_CURSO): evita que dos disparos de ESTA funcion se solapen.
  if (!_adquirirLockPYMProgramado_()) return;
  try {
    // 3) Datos de clanes: solo del checkpoint, sin API.
    if (!_fetchClanesBasicoSinApi()) {
      Logger.log('[runPendientesYMensajesProgramado] ABORTADO: no hay un checkpoint de clanes utilizable. ' +
        'No se toco Pendientes ni Mensajes; se reintenta en el proximo disparo.');
      return;
    }

    // 4) Sin captura nueva desde la ultima corrida exitosa: nada que recalcular.
    var tsCaptura = CLANES_SIN_API_TS_CARGADO;
    var tsUltimo = Number(props.getProperty('PYM_PROGRAMADO_ULTIMO_TS')) || 0;
    if (tsCaptura > 0 && tsCaptura === tsUltimo) {
      Logger.log('[runPendientesYMensajesProgramado] Sin captura nueva desde la ultima vez (captura de ' +
        _horaLimaCortaMs_(tsCaptura) + ' Lima). Sin accion.');
      return;
    }

    Logger.log('=== runPendientesYMensajesProgramado INICIO (sin API) ===');
    _pendientesYMensajesNucleo_(true);
    _actualizarIndiceTrasPendientes_();  // NUEVO 05-oct-2026 (AVISO 7): consolida los mensajes en el indice que lee la web

    // Solo se marca como procesada si Pendientes no aborto (ver PENDIENTES_ABORTADO_POR_API, 17_GuerraSheet.gs).
    if (PENDIENTES_ABORTADO_POR_API) {
      Logger.log('[runPendientesYMensajesProgramado] Pendientes aborto por falta de datos de guerra: NO se marca la captura como procesada.');
    } else {
      props.setProperty('PYM_PROGRAMADO_ULTIMO_TS', String(tsCaptura));
    }
    Logger.log('=== runPendientesYMensajesProgramado FIN (' + Math.round((Date.now() - t0) / 1000) + 's) ===');
  } finally {
    _liberarLockPYMProgramado_();
  }
}

/**
 * runPendientesYMensajes() - VERSION PARA CORRER A MANO, SIN SUFIJO (17-oct-2026, pedido usuario; antes se llamaba
 * runPendientesYMensajesManual() y esta era solo su alias). Fuerza el roster fresco y usa la API. Devuelve true si
 * corrio y false si no pudo empezar (ventana protegida u otra ejecucion): 41_Web_ActualizarRoster.gs usa ese valor.
 * NO debe tener activador: el del disparador es runPendientesYMensajesProgramado(). [→ Contexto_Base_Web.md §PF091]
 */
function runPendientesYMensajes() {
  if (!_adquirirLockEjecucion('runPendientesYMensajes')) return false;
  try {
    Logger.log('=== runPendientesYMensajes INICIO (manual: roster fresco, con API) ===');
    forzarRosterFrescoAhora();
    _pendientesYMensajesNucleo_(false);
    _actualizarIndiceTrasPendientes_();  // NUEVO 05-oct-2026 (AVISO 7)
    Logger.log('=== runPendientesYMensajes FIN ===');
    return true;
  } finally {
    _liberarLockEjecucion();
  }
}

/** Candado propio de runPendientesYMensajesProgramado(): auto-expira a los CFG.LOCK_MAX_DURACION_MS. */
function _adquirirLockPYMProgramado_() {
  var mini = LockService.getScriptLock();
  if (!mini.tryLock(5000)) {
    Logger.log('[runPendientesYMensajesProgramado] No se pudo verificar el candado propio (lock corto ocupado). Se omite este disparo.');
    return false;
  }
  try {
    var props = PropertiesService.getScriptProperties();
    var raw = props.getProperty('PYM_PROGRAMADO_EN_CURSO');
    if (raw) {
      try {
        var ant = Date.now() - JSON.parse(raw).inicio;
        if (ant < CFG.LOCK_MAX_DURACION_MS) {
          Logger.log('[runPendientesYMensajesProgramado] Ya hay otra corrida de esta misma funcion (hace ' + Math.round(ant / 1000) + 's). Se omite este disparo.');
          return false;
        }
        Logger.log('[runPendientesYMensajesProgramado] Candado propio vencido (hace ' + Math.round(ant / 1000) + 's): se asume una corrida cortada y se libera.');
      } catch (e) { /* propiedad corrupta: se sobrescribe */ }
    }
    props.setProperty('PYM_PROGRAMADO_EN_CURSO', JSON.stringify({ inicio: Date.now() }));
    return true;
  } finally {
    mini.releaseLock();
  }
}

function _liberarLockPYMProgramado_() {
  try { PropertiesService.getScriptProperties().deleteProperty('PYM_PROGRAMADO_EN_CURSO'); } catch (e) {}
}

/** Hora corta de Lima (dd/MM HH:mm:ss) para los logs de las versiones programadas. */
function _horaLimaCortaMs_(ms) {
  return Utilities.formatDate(new Date(ms), 'America/Lima', 'dd/MM HH:mm:ss');
}

/**
 * runGuerraRapidoProgramado() - VERSION PARA EL DISPARADOR (05-oct-2026, pedido usuario). [→ Contexto_Base_Web.md §B093]
 */
function runGuerraRapidoProgramado() {
  var props = PropertiesService.getScriptProperties();

  // 1) Datos de clanes: solo del checkpoint, sin API. Se lee ANTES de pedir el candado global: si no hay nada
  //    que hacer, esta funcion ni lo toca (no puede demorar ni cancelar a runGuerra()).
  if (!_fetchClanesBasicoSinApi()) {
    Logger.log('[runGuerraRapidoProgramado] ABORTADO: no hay un checkpoint de clanes utilizable. ' +
      'No se toco ninguna hoja; se reintenta en el proximo disparo.');
    return;
  }

  // 2) Sin captura nueva desde la ultima cadena completada con exito: no se hace nada (mismo criterio que
  //    runPendientesYMensajesProgramado()). La hora de captura procesada se guarda al TERMINAR la cadena.
  var tsCaptura = CLANES_SIN_API_TS_CARGADO;
  var tsUltimo = Number(props.getProperty('RUNGUERRARAPIDO_PROGRAMADO_ULTIMO_TS')) || 0;
  if (tsCaptura > 0 && tsCaptura === tsUltimo) {
    Logger.log('[runGuerraRapidoProgramado] Sin captura nueva desde la ultima vez (captura de ' +
      _horaLimaCortaMs_(tsCaptura) + ' Lima). Sin accion.');
    return;
  }

  // 3) Candado global (esta cadena escribe Guerra, Control, etc.): bloqueado en la ventana protegida.
  if (!_adquirirLockEjecucion('runGuerraRapido')) return;
  SUPRIMIR_PLAYERS_TEMPORAL = true;
  props.setProperty('RUNGUERRARAPIDO_SIN_API', '1');
  props.setProperty('RUNGUERRARAPIDO_SIN_API_TS', String(tsCaptura));
  props.setProperty('RUNGUERRARAPIDO_PASO', '0');
  _continuarRunGuerraRapido();
}

/**
 * runGuerraRapido() - VERSION PARA CORRER A MANO, SIN SUFIJO (17-oct-2026, pedido usuario; antes se llamaba
 * runGuerraRapidoManual() y esta era solo su alias). NO debe tener activador: el del disparador es
 * runGuerraRapidoProgramado(). [→ Contexto_Base_Web.md §PF091]
 */
function runGuerraRapido() {
  if (!_adquirirLockEjecucion('runGuerraRapido')) return;
  var props = PropertiesService.getScriptProperties();
  props.deleteProperty('RUNGUERRARAPIDO_SIN_API');
  props.setProperty('RUNGUERRARAPIDO_PASO', '0');
  _continuarRunGuerraRapido();
}

/**
 * _continuarRunGuerraRapido() - punto de entrada tanto de las dos versiones de runGuerraRapido [→ Contexto_Base_Web.md §B095]
 */
function _continuarRunGuerraRapido() {
  var props = PropertiesService.getScriptProperties();
  var paso = parseInt(props.getProperty('RUNGUERRARAPIDO_PASO') || '0', 10);
  var sinApi = props.getProperty('RUNGUERRARAPIDO_SIN_API') === '1';
  Logger.log((paso === 0 ? '=== runGuerraRapido INICIO' : '=== runGuerraRapido CONTINÚA desde el paso ' + (paso + 1) + '/' + PASOS_RUNGUERRARAPIDO.length) +
    (sinApi ? ' [programada, sin API]' : ' [manual, roster fresco]') + ' ===');
  // SUPRIMIR_PLAYERS_TEMPORAL es una variable global en memoria (no se [→ Contexto_Base_Web.md §B096]
  SUPRIMIR_PLAYERS_TEMPORAL = true;
  try {
    var completo = _ejecutarPorTandas('RUNGUERRARAPIDO', PASOS_RUNGUERRARAPIDO, CFG.RUNGUERRARAPIDO_PRESUPUESTO_MS, '_continuarRunGuerraRapido', NOMBRES_PASOS_RUNGUERRARAPIDO);
    if (completo) {
      SUPRIMIR_PLAYERS_TEMPORAL = false;
      // Version programada: se marca la captura como procesada (salvo que Pendientes haya abortado por falta de
      // datos de guerra: PENDIENTES_ABORT_TS lo pone/borra updatePendientesSheet() en cada corrida).
      if (sinApi) {
        var tsProc = props.getProperty('RUNGUERRARAPIDO_SIN_API_TS');
        if (tsProc && !props.getProperty('PENDIENTES_ABORT_TS')) props.setProperty('RUNGUERRARAPIDO_PROGRAMADO_ULTIMO_TS', tsProc);
        else Logger.log('[runGuerraRapido] Pendientes abortó por falta de datos: NO se marca la captura como procesada, se reintenta.');
      }
      props.deleteProperty('RUNGUERRARAPIDO_SIN_API');
      props.deleteProperty('RUNGUERRARAPIDO_SIN_API_TS');
      _liberarLockEjecucion();
      Logger.log('=== runGuerraRapido FIN ===');
    }
    // Si no está completo, el lock NO se libera y SUPRIMIR_PLAYERS_TEMPORAL [→ Contexto_Base_Web.md §B097]
  } catch (e) {
    SUPRIMIR_PLAYERS_TEMPORAL = false;
    props.deleteProperty('RUNGUERRARAPIDO_PASO');
    props.deleteProperty('RUNGUERRARAPIDO_SIN_API');
    props.deleteProperty('RUNGUERRARAPIDO_SIN_API_TS');
    _borrarTriggersDeContinuacion('_continuarRunGuerraRapido');
    _liberarLockEjecucion();
    Logger.log('[runGuerraRapido] ERROR: ' + e.message + ' — lock liberado.');
    throw e;
  }
}

/**
 * runAll() - Setup inicial y primera carga completa. [→ Contexto_Base_Web.md §B098]
 */
function runAll() {
  if (!_adquirirLockEjecucion('runAll')) return;
  PropertiesService.getScriptProperties().setProperty('RUNALL_PASO', '0');
  // PF091 etapa 4 (17-oct-2026, decision de Claude): runAll() es manual (no tiene activador), asi que, como las otras manuales sin
  // sufijo, fuerza el roster fresco: invalida el checkpoint de clanes (no lo borra, queda de respaldo si la API falla) y borra el
  // progreso de /players.
  forzarRosterFrescoAhora();
  _continuarRunAll();
}

/**
 * _continuarRunAll() - punto de entrada tanto de runAll() como del trigger [→ Contexto_Base_Web.md §B099]
 */
function _continuarRunAll() {
  var paso = parseInt(PropertiesService.getScriptProperties().getProperty('RUNALL_PASO') || '0', 10);
  Logger.log(paso === 0 ? '=== Sistema Clanes INICIO ===' : '=== Sistema Clanes CONTINÚA desde el paso ' + (paso + 1) + '/' + PASOS_RUNALL.length + ' ===');
  try {
    var completo = _ejecutarPorTandas('RUNALL', PASOS_RUNALL, CFG.RUNALL_PRESUPUESTO_MS, '_continuarRunAll', NOMBRES_PASOS_RUNALL);
    if (completo) {
      // FASE 21 (01/08/2026): el progreso de /players (Drive) ya NO se [→ Contexto_Base_Web.md §B100]
      _borrarProgresoPlayers();
      // FIX (06-ago-2026): mismo criterio que _borrarProgresoPlayers() — [→ Contexto_Base_Web.md §B101]
      // PF091 etapa 4 (17-oct-2026): YA NO se borra el checkpoint de clanes al terminar (lo dejo recien capturado runAll() y lo leen
      // las versiones programadas); la frescura de la proxima corrida la garantiza forzarRosterFrescoAhora() al empezar.
      // NUEVO (27-sep-2026): mismo criterio que las 2 líneas de arriba — [→ Contexto_Base_Web.md §B102]
      _borrarProgresoBattlelogChests();
      _liberarLockEjecucion();
      Logger.log('=== Sistema Clanes FIN ===');
    }
    // Si no está completo, el lock NO se libera: _ejecutarPorTandas ya
    // refrescó su timestamp y programó la continuación automática.
  } catch (e) {
    PropertiesService.getScriptProperties().deleteProperty('RUNALL_PASO');
    _borrarTriggersDeContinuacion('_continuarRunAll');
    _liberarLockEjecucion();
    Logger.log('[runAll] ERROR: ' + e.message + ' — lock liberado.');
    throw e;
  }
}

/**
 * runUpdateProgramado() - VERSION PARA EL DISPARADOR (17-oct-2026, pedido usuario; PF091). Mismo patron que
 * runGuerraRapidoProgramado(): lee los clanes SOLO del checkpoint que dejo la captura (edad maxima
 * CLANES_SIN_API_MAX_EDAD_MS) y NO pide /clans ni /currentriverrace a la API. /players SI se sigue pidiendo (es otro trabajo,
 * por tandas). Si no hay checkpoint utilizable, avisa y no corre (se reintenta en el proximo disparo). Si no hubo captura nueva
 * desde la ultima cadena completada con exito, no hace nada. Al terminar NO borra el checkpoint de clanes (lo siguen leyendo
 * las otras versiones programadas); solo borra el progreso de /players. [→ Contexto_Base_Web.md §PF091]
 */
function runUpdateProgramado() {
  var props = PropertiesService.getScriptProperties();

  // 1) Datos de clanes: solo del checkpoint, sin API. Se lee ANTES de pedir el candado global: si no hay nada que hacer,
  //    esta funcion ni lo toca (no puede demorar ni cancelar a runGuerra()).
  if (!_fetchClanesBasicoSinApi()) {
    Logger.log('[runUpdateProgramado] ABORTADO: no hay un checkpoint de clanes utilizable. ' +
      'No se toco ninguna hoja; se reintenta en el proximo disparo.');
    return;
  }

  // 2) Sin captura nueva desde la ultima cadena completada con exito: no se hace nada (mismo criterio que
  //    runGuerraRapidoProgramado()). La hora de captura procesada se guarda al TERMINAR la cadena.
  var tsCaptura = CLANES_SIN_API_TS_CARGADO;
  var tsUltimo = Number(props.getProperty('RUNUPDATE_PROGRAMADO_ULTIMO_TS')) || 0;
  if (tsCaptura > 0 && tsCaptura === tsUltimo) {
    Logger.log('[runUpdateProgramado] Sin captura nueva desde la ultima vez (captura de ' +
      _horaLimaCortaMs_(tsCaptura) + ' Lima). Sin accion.');
    return;
  }

  // 3) Candado global (esta cadena escribe casi todas las hojas): bloqueado en la ventana protegida.
  if (!_adquirirLockEjecucion('runUpdate')) { _reintentarDiarioSiCandadoOcupado_('_reintentarRunUpdateProgramado'); return; } // PF281
  props.setProperty('RUNUPDATE_SIN_API', '1');
  props.setProperty('RUNUPDATE_SIN_API_TS', String(tsCaptura));
  props.setProperty('RUNUPDATE_PASO', '0');
  _continuarRunUpdate();
}

/**
 * runUpdate() - VERSION PARA CORRER A MANO, SIN SUFIJO (17-oct-2026, pedido usuario; antes era la que usaba el activador diario,
 * que ahora apunta a runUpdateProgramado()). Fuerza el roster fresco (forzarRosterFrescoAhora()) y pide los clanes a la API a
 * traves de capturarApiClanes_(), ademas de /players. NO debe tener activador. Al terminar ya no borra el checkpoint de clanes
 * (etapa 4, 17-oct-2026). [→ Contexto_Base_Web.md §B103]
 */
function runUpdate() {
  if (!_adquirirLockEjecucion('runUpdate')) return;
  var props = PropertiesService.getScriptProperties();
  props.deleteProperty('RUNUPDATE_SIN_API');
  props.deleteProperty('RUNUPDATE_SIN_API_TS');
  props.setProperty('RUNUPDATE_PASO', '0');
  forzarRosterFrescoAhora();
  _continuarRunUpdate();
}

/**
 * _continuarRunUpdate() - punto de entrada de las dos versiones de runUpdate (manual y programada) y de su trigger
 * de continuación automática (ver _continuarRunAll() para el mismo patrón).
 */
function _continuarRunUpdate() {
  var props = PropertiesService.getScriptProperties();
  var paso = parseInt(props.getProperty('RUNUPDATE_PASO') || '0', 10);
  var sinApi = props.getProperty('RUNUPDATE_SIN_API') === '1';
  Logger.log((paso === 0 ? '=== Actualización periódica INICIO' : '=== Actualización periódica CONTINÚA desde el paso ' + (paso + 1) + '/' + PASOS_RUNUPDATE.length) +
    (sinApi ? ' [programada, sin /clans ni /currentriverrace]' : ' [manual, roster fresco]') + ' ===');
  try {
    var completo = _ejecutarPorTandas('RUNUPDATE', PASOS_RUNUPDATE, CFG.RUNUPDATE_PRESUPUESTO_MS, '_continuarRunUpdate');
    if (completo) {
      // Ver comentario equivalente en _continuarRunAll(): el progreso de [→ Contexto_Base_Web.md §B104]
      _borrarProgresoPlayers();
      if (sinApi) {
        // Version programada: se marca la captura como procesada (salvo que Pendientes haya abortado por falta de datos de
        // guerra: PENDIENTES_ABORT_TS lo pone/borra updatePendientesSheet() en cada corrida). El checkpoint de clanes NO se
        // borra: lo leen runPendientesYMensajesProgramado() y runGuerraRapidoProgramado() hasta la siguiente captura.
        var tsProc = props.getProperty('RUNUPDATE_SIN_API_TS');
        if (tsProc && !props.getProperty('PENDIENTES_ABORT_TS')) props.setProperty('RUNUPDATE_PROGRAMADO_ULTIMO_TS', tsProc);
        else Logger.log('[runUpdate] Pendientes abortó por falta de datos: NO se marca la captura como procesada, se reintenta.');
        props.deleteProperty('RUNUPDATE_SIN_API');
        props.deleteProperty('RUNUPDATE_SIN_API_TS');
      }
      // PF091 etapa 4 (17-oct-2026): la manual tampoco borra ya el checkpoint de clanes (ver el comentario equivalente en
      // _continuarRunAll()): lo capturo recien con forzarRosterFrescoAhora() + capturarApiClanes_() y las programadas lo leen.
      _liberarLockEjecucion();
      Logger.log('=== Actualización periódica FIN ===');
    }
  } catch (e) {
    props.deleteProperty('RUNUPDATE_PASO');
    props.deleteProperty('RUNUPDATE_SIN_API');
    props.deleteProperty('RUNUPDATE_SIN_API_TS');
    _borrarTriggersDeContinuacion('_continuarRunUpdate');
    _liberarLockEjecucion();
    Logger.log('[runUpdate] ERROR: ' + e.message + ' — lock liberado.');
    throw e;
  }
}

/**
 * runSorteos() - Corrida INDEPENDIENTE del módulo de sorteos, fuera de [→ Contexto_Base_Web.md §B105]
 */
var PASOS_RUNSORTEOS = [
  function () {
    var idsResueltos = procesarSListaNuevasFilas(_getSs());
    if (idsResueltos.length > 0) {
      Logger.log('[Sorteos] Resuelto Organizador/Tag_org/Clan/ClanTag en ' + idsResueltos.length + ' fila(s) de S_Lista: ' + idsResueltos.join(', '));
    }
  },
  function () { sincronizarRequisitosSorteo(); },
  function () { actualizarDocParticipantesCalificados(); },
];

var NOMBRES_PASOS_RUNSORTEOS = [
  'Resolver Organizador/Tag_org/Clan/ClanTag en S_Lista',
  'Sincronizar requisitos de sorteo',
  'Actualizar Doc de participantes calificados',
];

function runSorteos() {
  if (!_adquirirLockEjecucion('runSorteos')) return;
  PropertiesService.getScriptProperties().setProperty('RUNSORTEOS_PASO', '0');
  _continuarProcesarSorteos();
}

/**
 * _continuarProcesarSorteos() - punto de entrada tanto de runSorteos() como [→ Contexto_Base_Web.md §B106]
 */
function _continuarProcesarSorteos() {
  var paso = parseInt(PropertiesService.getScriptProperties().getProperty('RUNSORTEOS_PASO') || '0', 10);
  Logger.log(paso === 0 ? '=== Sorteos INICIO ===' : '=== Sorteos CONTINÚA desde el paso ' + (paso + 1) + '/' + PASOS_RUNSORTEOS.length + ' ===');
  try {
    var completo = _ejecutarPorTandas('RUNSORTEOS', PASOS_RUNSORTEOS, CFG.RUNSORTEOS_PRESUPUESTO_MS, '_continuarProcesarSorteos', NOMBRES_PASOS_RUNSORTEOS);
    if (completo) {
      _liberarLockEjecucion();
      Logger.log('=== Sorteos FIN ===');
    }
    // Si no está completo, el lock NO se libera: _ejecutarPorTandas ya
    // refrescó su timestamp y programó la continuación automática.
  } catch (e) {
    PropertiesService.getScriptProperties().deleteProperty('RUNSORTEOS_PASO');
    _borrarTriggersDeContinuacion('_continuarProcesarSorteos');
    _liberarLockEjecucion();
    Logger.log('[runSorteos] ERROR: ' + e.message + ' — lock liberado.');
    throw e;
  }
}

/**
 * runSincronizarContactos() - Sincroniza Google Contacts con el Directorio.
 */
function runSincronizarContactos() {
  if (_bloquearSiReenumerando_('runSincronizarContactos')) return; // PF260
  // VENTANA DE GUERRA PROTEGIDA (05-oct-2026): se penso que este disparo diario caia a las 4:xx a.m. Lima (atHour(9) [→ Contexto_Base_Web.md §B107]
  if (CFG.VENTANA_GUERRA_BLOQUEAR_OTROS && _estadoVentanaGuerra_().protegida) {
    Logger.log('[Contactos] OMITIDO: ventana de guerra protegida (4:00-5:00 a.m. Lima). Se ejecuta en su proximo horario.');
    return;
  }
  Logger.log('[Contactos] Iniciando sincronización...');
  SincronizarContactosNube();
  Logger.log('[Contactos] Completado.');
}

/**
 * runSyncCSV() - Sincroniza todos los CSV con Drive. [→ Contexto_Base_Web.md §B108]
 */
function runSyncCSV() {
  if (!_adquirirLockEjecucion('runSyncCSV')) { _reintentarDiarioSiCandadoOcupado_('_reintentarRunSyncCSV'); return; } // PF281
  PropertiesService.getScriptProperties().setProperty('RUNSYNCCSV_PASO', '0');
  _continuarRunSyncCSV();
}

/**
 * _continuarRunSyncCSV() - punto de entrada tanto de runSyncCSV() como del [→ Contexto_Base_Web.md §B109]
 */
function _continuarRunSyncCSV() {
  var paso = parseInt(PropertiesService.getScriptProperties().getProperty('RUNSYNCCSV_PASO') || '0', 10);
  Logger.log(paso === 0 ? '[CSV] Iniciando sincronización...' : '[CSV] CONTINÚA desde el paso ' + (paso + 1) + '/' + PASOS_RUNSYNCCSV.length);
  try {
    var completo = _ejecutarPorTandas('RUNSYNCCSV', PASOS_RUNSYNCCSV, CFG.RUNSYNCCSV_PRESUPUESTO_MS, '_continuarRunSyncCSV');
    if (completo) {
      _liberarLockEjecucion();
      Logger.log('[CSV] Completado.');
    }
    // Si no está completo, el lock NO se libera: _ejecutarPorTandas ya
    // refrescó su timestamp y programó la continuación automática.
  } catch (e) {
    PropertiesService.getScriptProperties().deleteProperty('RUNSYNCCSV_PASO');
    _borrarTriggersDeContinuacion('_continuarRunSyncCSV');
    _liberarLockEjecucion();
    Logger.log('[runSyncCSV] ERROR: ' + e.message + ' — lock liberado.');
    throw e;
  }
}

/**
 * runActualizarIndiceManual() - Botón manual para ejecutar, de una sola vez [→ Contexto_Base_Web.md §B110]
 */
function runActualizarIndiceManual() {
  if (!_adquirirLockEjecucion('runActualizarIndiceManual')) return;
  try {
    Logger.log('[Índice] Actualización manual: iniciando...');
    actualizarIndiceSheet();
    _reordenarYOcultarHojasSegunIndice();
    respaldarIndiceYProtegidasCSV();
    Logger.log('[Índice] Actualización manual: completa (Índice actualizado, pestañas reordenadas/ocultadas según Visibilidad, respaldo en CSV).');
  } catch (e) {
    Logger.log('[Índice] Actualización manual: ERROR: ' + e.message);
    throw e;
  } finally {
    _liberarLockEjecucion();
  }
}

/**
 * runDirectorio() - Actualización manual solo del Directorio y sus vistas.
 */
function runDirectorio() {
  Logger.log('=== Actualización Directorio INICIO ===');
  _fetchAllClanData();
  updateDirectorioSheet();
  updateVistasDerivadas();
  syncDirectorioCSV();
  exportarBackupCelulares();
  Logger.log('=== Actualización Directorio FIN ===');
}

/**
 * runGuerra() - Actualización de guerra. [→ Contexto_Base_Web.md §B111]
 */
function runGuerra() {
  var now     = new Date();
  var horaUtc = now.getUTCHours();
  var minUtc  = now.getUTCMinutes();

  // FIX (02-sep-2026): runGuerra() es monolítica (no usa _ejecutarPorTandas(), [→ Contexto_Base_Web.md §B112]
  var _tRunGuerra0 = Date.now();

  var enVentanaGuerra = _estadoVentanaGuerra_(now).enVentana;
  var props = PropertiesService.getScriptProperties();
  var claveHora = Utilities.formatDate(now, 'UTC', 'yyyyMMddHH');

  // NUEVO (05-oct-2026, pedido del usuario): vigilante de UptimeRobot (45_Vigilante_UptimeRobot.gs). Si UptimeRobot… [→ Contexto_Base_Web.md §B113]
  _vigilarUptimeRobotSeguro_();

  // Fuera de la ventana: trabajo completo 1 vez por hora UTC. Se compara con la última hora hecha en vez de
  // "minuto < 10", que dependía de en qué minuto exacto caía el disparo.
  var esPrimerDisparoDeHora = false;
  if (!enVentanaGuerra) {
    if (props.getProperty('RUNGUERRA_ULTIMA_HORA') === claveHora) {
      Logger.log('=== runGuerra: fuera de la ventana 4-5am y ya se hizo el trabajo de esta hora, sin acción. ===');
      return;
    }
    esPrimerDisparoDeHora = true;
  }

  Logger.log('=== Actualización Guerra INICIO | UTC ' + horaUtc + ':' + minUtc +
             ' | Ventana ligera (4-5am): ' + enVentanaGuerra + ' ===');

  if (!_adquirirLockEjecucion('runGuerra')) return;
  // PF073: la hora se marca antes del trabajo (evita corridas simultáneas), pero si el trabajo falla se restaura la marca previa para que el siguiente disparo reintente en vez de esperar a la hora siguiente. [→ Contexto_Base_Web.md §PF073]
  var _marcaHoraPrevia = props.getProperty('RUNGUERRA_ULTIMA_HORA');
  var _trabajoHoraCompleto = false;
  try {
    if (!enVentanaGuerra) props.setProperty('RUNGUERRA_ULTIMA_HORA', claveHora);

    if (enVentanaGuerra) {
      _runGuerraVentanaLigera_(_tRunGuerra0);
      return; // el finally libera el candado
    }

    // Guerra/Guerra_Logs/Control/Pendientes no leen perfiles de /players [→ Contexto_Base_Web.md §B114]
    capturarApiClanes_(CFG.CLANES_PROGRESO_MAX_EDAD_MS_GUERRA, 'hora');
    updateGuerraSheet();
    updateGuerraLogsSheet();
    updateControlSheet();
    updatePendientesSheet();

    // FASE 11 (punto 4 del Consolidado_Cambios_Pendientes_Guerra.md, 14_Nuevos_RoyaleAPI.gs): [→ Contexto_Base_Web.md §B115]
    try { _cerrarSemanaActualNuevos(); }
    catch (eCierreNuevos) { Logger.log('[runGuerra] _cerrarSemanaActualNuevos() falló: ' + eCierreNuevos.message); }

    // PF143 (21-oct-2026): el respaldo a Backup_Guerra.csv y el calentamiento del caché (Dashboard + guerra.json, roster.json, home.json, torneos.json) ya NO corren aquí. Con Guerra + Control + Pendientes (180-230 s) más ese tramo (100-180 s) la corrida pasaba de 360 s y la plataforma la cortaba casi cada hora. Se programa una continuación con su propio presupuesto de 6 min. [→ Contexto_Base_Web.md §PF143]
    var _colaProgramada = false;
    try {
      props.setProperty('RUNGUERRA_COLA_PENDIENTE', claveHora);
      props.deleteProperty('RUNGUERRA_COLA_INTENTOS');
      _programarContinuacion('_continuarRunGuerraCola');
      _colaProgramada = true;
      Logger.log('[runGuerra] Respaldo CSV y calentamiento del caché pasan a la continuación _continuarRunGuerraCola (arranca en ~10 s, con su propio presupuesto).');
    } catch (eCola) {
      Logger.log('[runGuerra] No se pudo programar _continuarRunGuerraCola: ' + eCola.message + '. Se hace el respaldo y el calentamiento aquí, como antes.');
    }
    if (!_colaProgramada) {
      try { _runGuerraColaHoraria_(_tRunGuerra0); }
      catch (eColaEnLinea) { Logger.log('[runGuerra] El tramo final (respaldo CSV y caché) falló: ' + eColaEnLinea.message); }
    }

    _trabajoHoraCompleto = true;
    Logger.log('=== Actualización Guerra FIN (actualización horaria) ===');
  } finally {
    if (!enVentanaGuerra && !_trabajoHoraCompleto) {
      try {
        if (_marcaHoraPrevia) props.setProperty('RUNGUERRA_ULTIMA_HORA', _marcaHoraPrevia);
        else props.deleteProperty('RUNGUERRA_ULTIMA_HORA');
        Logger.log('[runGuerra] El trabajo de la hora no terminó: se restauró la marca de hora para reintentar en el próximo disparo.');
      } catch (eMarca) {
        Logger.log('[runGuerra] No se pudo restaurar la marca de hora: ' + eMarca.message);
      }
    }
    _liberarLockEjecucion();
  }
}

/**
 * _runGuerraColaHoraria_(t0) - Tramo final de la actualización horaria de guerra (PF143, 21-oct-2026): respaldo a Backup_Guerra.csv y
 * calentamiento del caché de guerra.html (Dashboard y publicaciones estáticas). Antes estaba al final de runGuerra(); ahora lo ejecuta
 * _continuarRunGuerraCola() en una ejecución nueva (o runGuerra(), solo si no pudo programar la continuación). t0 = inicio de la
 * ejecución que lo llama, para respetar el margen contra el límite duro de la plataforma. No depende de variables en memoria de
 * runGuerra(): _syncGuerraCSV() recibe la hoja y _calentarCacheGuerraEnVivo_() lee todo por su cuenta. [→ Contexto_Base_Web.md §PF143]
 */
function _runGuerraColaHoraria_(t0) {
  var msTranscurridos = Date.now() - t0;
  var msLimiteParaSyncCsv = CFG.PLATAFORMA_LIMITE_EJECUCION_MS - CFG.RUNGUERRA_SYNC_CSV_MARGEN_MIN_MS;
  if (msTranscurridos > msLimiteParaSyncCsv) {
    Logger.log('[runGuerra] _syncGuerraCSV() SALTADO esta hora: ya van ' +
      Math.round(msTranscurridos / 1000) + 's de corrida, sin margen suficiente ' +
      '(' + Math.round(msLimiteParaSyncCsv / 1000) + 's) antes del límite duro de la plataforma. ' +
      'Se reintenta en el próximo disparo horario.');
  } else {
    var shGuerraBackup = _getSs().getSheetByName(CFG.SHEETS.GUERRA);
    if (shGuerraBackup) _syncGuerraCSV(shGuerraBackup);
  }

  try {
    var msRestantesCalentar = CFG.PLATAFORMA_LIMITE_EJECUCION_MS - (Date.now() - t0);
    if (msRestantesCalentar < CFG.RUNGUERRA_SYNC_CSV_MARGEN_MIN_MS) {
      Logger.log('[runGuerra] Calentamiento del caché de guerra.html SALTADO: quedan solo ' +
        Math.round(msRestantesCalentar / 1000) + 's de presupuesto.');
    } else {
      _calentarCacheGuerraEnVivo_(WEB_GUERRA_VIVO_TTL_CALENTADO_FUERA_SEG);
    }
  } catch (eCalentar) {
    Logger.log('[runGuerra] _calentarCacheGuerraEnVivo_() falló: ' + eCalentar.message);
  }
}

/**
 * _continuarRunGuerraCola() - Handler de la continuación que programa runGuerra() al terminar Pendientes (PF143, 21-oct-2026).
 * Corre _runGuerraColaHoraria_() en una ejecución nueva de 6 min. Reglas:
 *  - Una sola vez por programación: borra su propio activador al empezar, así que si la plataforma la corta no se repite en bucle;
 *    el siguiente runGuerra() horario vuelve a programarla.
 *  - Si entra la ventana de guerra protegida (4:00-5:00 a. m. Lima y su margen previo) no corre y descarta la tarea.
 *  - Si hay otra ejecución con el candado, reintenta cada CFG.RUNGUERRA_COLA_REINTENTO_MS hasta CFG.RUNGUERRA_COLA_REINTENTOS_MAX veces
 *    y luego se descarta (la próxima hora vuelve a intentarlo).
 * [→ Contexto_Base_Web.md §PF143]
 */
function _continuarRunGuerraCola() {
  if (_bloquearSiReenumerando_('_continuarRunGuerraCola')) return; // PF260
  var props = PropertiesService.getScriptProperties();
  _borrarTriggersDeContinuacion('_continuarRunGuerraCola');
  if (!props.getProperty('RUNGUERRA_COLA_PENDIENTE')) {
    Logger.log('[runGuerraCola] Sin tarea pendiente (ya se hizo o se descartó). No se hace nada.');
    return;
  }
  if (CFG.VENTANA_GUERRA_BLOQUEAR_OTROS && _estadoVentanaGuerra_().protegida) {
    Logger.log('[runGuerraCola] ABORTADA: la ventana de guerra protegida está activa. Se descarta; el próximo runGuerra() horario la vuelve a programar.');
    props.deleteProperty('RUNGUERRA_COLA_PENDIENTE');
    props.deleteProperty('RUNGUERRA_COLA_INTENTOS');
    return;
  }
  if (!_adquirirLockEjecucion('runGuerraCola')) {
    var intentos = Number(props.getProperty('RUNGUERRA_COLA_INTENTOS')) || 0;
    if (intentos < CFG.RUNGUERRA_COLA_REINTENTOS_MAX) {
      props.setProperty('RUNGUERRA_COLA_INTENTOS', String(intentos + 1));
      ScriptApp.newTrigger('_continuarRunGuerraCola').timeBased().after(CFG.RUNGUERRA_COLA_REINTENTO_MS).create();
      Logger.log('[runGuerraCola] Hay otra ejecución en curso: se reintenta en ' + Math.round(CFG.RUNGUERRA_COLA_REINTENTO_MS / 1000) +
        ' s (intento ' + (intentos + 1) + ' de ' + CFG.RUNGUERRA_COLA_REINTENTOS_MAX + ').');
    } else {
      Logger.log('[runGuerraCola] Se agotaron los reintentos con otra ejecución en curso. Se descarta; la próxima hora vuelve a intentarlo.');
      props.deleteProperty('RUNGUERRA_COLA_PENDIENTE');
      props.deleteProperty('RUNGUERRA_COLA_INTENTOS');
    }
    return;
  }
  var t0 = Date.now();
  try {
    props.deleteProperty('RUNGUERRA_COLA_PENDIENTE'); // antes del trabajo: si la plataforma corta esta ejecución, no se repite en bucle
    props.deleteProperty('RUNGUERRA_COLA_INTENTOS');
    Logger.log('[runGuerraCola] INICIO (respaldo CSV + calentamiento del caché)');
    _runGuerraColaHoraria_(t0);
    Logger.log('[runGuerraCola] FIN (' + Math.round((Date.now() - t0) / 1000) + ' s)');
  } finally {
    _liberarLockEjecucion();
  }
}

/**
 * capturarApiClanes_(maxEdadMs, origen) - FUNCION DE CAPTURA (17-oct-2026, pedido usuario; PF091). Es lo UNICO que pide a la API
 * /clans/{tag} y /clans/{tag}/currentriverrace de los 5 clanes y guarda el resultado (checkpoint Cache_Clanes_Progreso.json,
 * que escribe _fetchClanesBasico() solo si llegaron los 5 clanes completos). No toca hojas, Dashboard, Web, Pendientes ni
 * Mensajes: eso se hace despues, con lo que esta funcion deja guardado. La llaman runGuerra() (fuera de la ventana,
 * 1 vez por hora UTC) y _runGuerraVentanaLigera_() (de 4:00 a 4:59 a. m. Lima, cada 5 min). No toma candado propio: corre
 * dentro del de runGuerra(), asi que la ventana protegida no la bloquea. maxEdadMs = cuanto puede tener el checkpoint para
 * reutilizarlo en vez de pedir a la API (en la ventana, 90 s: con disparos de 5 min nunca se reutiliza).
 * Devuelve lo mismo que _fetchClanesBasico(). [→ Contexto_Base_Web.md §PF091]
 */
function capturarApiClanes_(maxEdadMs, origen) {
  var t0 = Date.now();
  Logger.log('[Captura] INICIO (' + (origen || 'sin origen') + ', edad maxima del checkpoint ' + Math.round(maxEdadMs / 1000) + ' s)');
  var datos = _fetchClanesBasico(maxEdadMs);
  // PF091 (17-oct-2026): primera consulta de cada clan y periodo (todas las corridas, tambien la ventana: solo una propiedad
  // de script) y, FUERA de la ventana, los JSON de clans y currentriverrace con las mismas respuestas (sin API).
  _registrarPrimeraConsultaDesdeCaptura_();
  // PF194 (23-oct-2026): foto de la fama acumulada de cada clan (propios y rivales) para poder mostrar la fama de HOY en el pronóstico de guerra. Solo una propiedad de script; si falla, la captura sigue. [→ Contexto_Base_Web.md §PF194]
  try { _pronosticoRegistrarFotoDia_(); }
  catch (eFotoDia) { Logger.log('[Captura] No se pudo guardar la foto diaria de fama: ' + eFotoDia.message); }
  if (origen !== 'ventana') _guardarJsonClanesDesdeCaptura_();
  Logger.log('[Captura] FIN (' + (origen || 'sin origen') + ', ' + Math.round((Date.now() - t0) / 1000) + ' s)');
  return datos;
}

/**
 * _runGuerraVentanaLigera_(t0) [→ Contexto_Base_Web.md §B118]
 */
function _runGuerraVentanaLigera_(t0) {
  capturarApiClanes_(CFG.CLANES_PROGRESO_MAX_EDAD_MS_GUERRA_VENTANA, 'ventana');
  var resultadoGuerra = updateGuerraSheet();

  if (CFG.RUNGUERRA_VENTANA_SYNC_CSV) {
    if (resultadoGuerra === false) {
      Logger.log('[runGuerra][ventana] CSV omitido: la restauración de la hoja Guerra quedó incompleta; se reintenta en la próxima corrida.');
    } else {
      var msUsados = Date.now() - t0;
      var msLimite = CFG.PLATAFORMA_LIMITE_EJECUCION_MS - CFG.RUNGUERRA_SYNC_CSV_MARGEN_MIN_MS;
      if (msUsados > msLimite) {
        Logger.log('[runGuerra][ventana] _syncGuerraCSV() SALTADO: ya van ' + Math.round(msUsados / 1000) +
          's, sin margen (' + Math.round(msLimite / 1000) + 's). La hoja Guerra ya quedó actualizada; el CSV se pone al día en la próxima corrida.');
      } else {
        var shG = _getSs().getSheetByName(CFG.SHEETS.GUERRA);
        if (shG) _syncGuerraCSV(shG);
      }
    }
  }
  Logger.log('=== Actualización Guerra FIN (ventana ligera 4-5am, ' + Math.round((Date.now() - t0) / 1000) + 's) ===');
}

/**
 * runGenerarMensajes() - Genera todos los mensajes de WhatsApp.
 */
function runGenerarMensajes() {
  // FIX (02-oct-2026): si Pendientes abortó por API caída, no se regeneran
  // mensajes a partir de una hoja desactualizada.
  var abortTs = 0;
  try { abortTs = Number(PropertiesService.getScriptProperties().getProperty('PENDIENTES_ABORT_TS')) || 0; } catch (eA) {}
  var abortReciente = abortTs > 0 && (Date.now() - abortTs) < 30 * 60 * 1000;
  if ((typeof PENDIENTES_ABORTADO_POR_API !== 'undefined' && PENDIENTES_ABORTADO_POR_API) || abortReciente) {
    Logger.log('[Mensajes] OMITIDO: Pendientes no se actualizó por falla de la API en esta corrida.');
    return;
  }
  Logger.log('[Mensajes] Generando mensajes...');
  generarTodosMensajes();
  Logger.log('[Mensajes] Completado.');
}

/**
 * runCalendario() - Genera el calendario del mes actual.
 */
function runCalendario() {
  Logger.log('[Calendario] Generando calendario del mes actual...');
  GenerarCalendario();
  Logger.log('[Calendario] Completado.');
}

/**
 * runResaltarDia() - Resalta el día actual en el Calendario.
 */
function runResaltarDia() {
  if (_bloquearSiReenumerando_('runResaltarDia')) return; // PF260
  Logger.log('[Calendario] Resaltando día actual...');

  // FIX (13-ago-2026, pedido del usuario): "el calendario trae la fecha [→ Contexto_Base_Web.md §B119]
  capturarApiClanes_(CFG.CLANES_PROGRESO_MAX_EDAD_MS, 'runResaltarDia');
  resaltarDiaActual();
  Logger.log('[Calendario] Completado.');
}

/**
 * runSyncPlantillas() - Sincroniza las plantillas (Google Docs de Drive) hacia el índice de contenido.
 */
function runSyncPlantillas() {
  Logger.log('[Plantillas] Iniciando sincronización...');
  syncPlantillasDesdeDrive();
  Logger.log('[Plantillas] Completado.');
}

/**
 * runFormato() - Aplica formato global bajo demanda o por trigger diario.
 */
function runFormato() {
  if (_bloquearSiReenumerando_('runFormato')) return; // PF260
  Logger.log('[Formato] Ejecutando aplicarFormatoGlobal...');
  aplicarFormatoGlobal();
  Logger.log('[Formato] Completado.');
}

/**
 * runRepararTelefonos() - Ejecutar manualmente UNA VEZ para corregir el bug [→ Contexto_Base_Web.md §B120]
 */
function runRepararTelefonos() {
  Logger.log('[Reparación] Iniciando reparación de formato de teléfonos...');
  repararFormatoTelefonos();
  Logger.log('[Reparación] Completado.');
}

/**
 * runRepararRazon() - Ejecutar manualmente UNA VEZ para limpiar valores [→ Contexto_Base_Web.md §B121]
 */
function runRepararRazon() {
  Logger.log('[Reparación] Iniciando reparación de la columna Razón...');
  repararRazonInvalida();
  Logger.log('[Reparación] Completado.');
}

/**
 * runLimpiarHistorialDuplicado() - Ejecutar manualmente cuando se necesite [→ Contexto_Base_Web.md §B122]
 */
function runLimpiarHistorialDuplicado() {
  Logger.log('[Limpieza Historial] Iniciando...');
  limpiarDuplicadosHistorial();
  Logger.log('[Limpieza Historial] Completado.');
}

/**
 * runRenombrarHistorialLegacy() - Ejecutar manualmente UNA VEZ para migrar [→ Contexto_Base_Web.md §B123]
 */
function runRenombrarHistorialLegacy() {
  Logger.log('[Setup] Renombrado manual Ascensos/Historial: iniciando...');
  _renombrarHojasHistorialLegacy();
  Logger.log('[Setup] Renombrado manual Ascensos/Historial: completado.');
}

/**
 * repararEncabezadosDuplicadosControl() [→ Contexto_Base_Web.md §B124]
 */
function repararEncabezadosDuplicadosControl() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.CONTROL);
  if (!sh) { Logger.log('[Fase 6] Hoja ' + CFG.SHEETS.CONTROL + ' no encontrada.'); return []; }

  var COL_INICIO_GRID = 17; // FIX (03-ago-2026): 18 -> 17 (Jugador eliminada)
  var corregidas = [];
  var col = COL_INICIO_GRID;

  for (var m = 0; m < CONTROL_METRICAS.length; m++) {
    var metrica = CONTROL_METRICAS[m];
    var colExtrasInicio = col + (metrica.ancho - metrica.extras.length);

    for (var e = 0; e < metrica.extras.length; e++) {
      var colExtra = colExtrasInicio + e;
      var valorEsperado = metrica.extras[e];
      var celdaArriba = sh.getRange(2, colExtra);
      var celdaFila3  = sh.getRange(3, colExtra);

      var valorArriba = String(celdaArriba.getValue() || '').trim();
      var valorFila3  = String(celdaFila3.getValue() || '').trim();

      var tocada = false;

      if (valorFila3 !== valorEsperado) {
        celdaFila3.setValue(valorEsperado);
        tocada = true;
      }
      // Solo borra "arriba" si tiene justo el rótulo esperado (evita tocar
      // una celda con contenido inesperado, para revisión manual puntual).
      if (valorArriba === valorEsperado) {
        celdaArriba.setValue('');
        tocada = true;
      }

      if (tocada) corregidas.push(celdaFila3.getA1Notation() + ' ("' + valorEsperado + '")');
    }

    col += metrica.ancho;
  }

  if (corregidas.length > 0) {
    Logger.log('[Fase 6] repararEncabezadosDuplicadosControl(): rótulo reubicado en fila 3 (arriba en blanco) en: ' +
               corregidas.join(', ') + '.');
  } else {
    Logger.log('[Fase 6] repararEncabezadosDuplicadosControl(): nada que corregir (ya estaba en el estado correcto).');
  }

  return corregidas;
}

/**
 * repararResumenExtrasControl() [→ Contexto_Base_Web.md §B125]
 */
function repararResumenExtrasControl() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.CONTROL);
  if (!sh) { Logger.log('[Resumen] Hoja ' + CFG.SHEETS.CONTROL + ' no encontrada.'); return []; }

  var COL_INICIO_GRID = 17; // FIX (03-ago-2026): 18 -> 17 (Jugador eliminada)
  var corregidas = [];
  var col = COL_INICIO_GRID;

  for (var m = 0; m < CONTROL_METRICAS.length; m++) {
    var metrica = CONTROL_METRICAS[m];
    var extras = metrica.extras;
    var colExtrasInicio = col + (metrica.ancho - extras.length);

    if (extras.length > 1) {
      var primeraCelda = sh.getRange(2, colExtrasInicio);
      var mergesActuales = primeraCelda.getMergedRanges();
      var yaOk = String(primeraCelda.getValue() || '').trim() === 'Resumen' &&
                 mergesActuales.length > 0 &&
                 mergesActuales[0].getNumColumns() === extras.length;

      if (!yaOk) {
        var rango = sh.getRange(2, colExtrasInicio, 1, extras.length);
        var mergesPrevios = rango.getMergedRanges();
        for (var mp = 0; mp < mergesPrevios.length; mp++) mergesPrevios[mp].breakApart();

        rango.merge()
          .setValue('Resumen')
          .setBackground(CFG.COLORES.HEADER_BG)
          .setFontColor(CFG.COLORES.HEADER_FG)
          .setFontWeight('bold')
          .setHorizontalAlignment('center')
          .setVerticalAlignment('middle');
        corregidas.push(rango.getA1Notation() + ' ("Resumen", combinada)');
      }
    } else if (extras.length === 1) {
      var celda = sh.getRange(2, colExtrasInicio);
      if (String(celda.getValue() || '').trim() !== 'Resumen') {
        celda.setValue('Resumen')
          .setBackground(CFG.COLORES.HEADER_BG)
          .setFontColor(CFG.COLORES.HEADER_FG)
          .setFontWeight('bold')
          .setHorizontalAlignment('center')
          .setVerticalAlignment('middle');
        corregidas.push(celda.getA1Notation() + ' ("Resumen", sin combinar)');
      }
    }

    col += metrica.ancho;
  }

  if (corregidas.length > 0) {
    Logger.log('[Resumen] repararResumenExtrasControl(): "Resumen" escrito en: ' + corregidas.join(', ') + '.');
  } else {
    Logger.log('[Resumen] repararResumenExtrasControl(): nada que corregir (ya estaba en el estado correcto).');
  }

  return corregidas;
}

/**
 * installTriggers() - ALIAS de activarTodosLosActivadores() (08_Activadores.gs). Conservado para no romper llamadas [→ Contexto_Base_Web.md §B126]
 */
function installTriggers() {
  activarTodosLosActivadores();
}

/**
 * removeTriggers() - ALIAS de desactivarTodosLosActivadores() (08_Activadores.gs). OJO, cambio de comportamiento [→ Contexto_Base_Web.md §B127]
 */
function removeTriggers() {
  desactivarTodosLosActivadores();
}

/**
 * iniciarTorneoEnVivo(inicio) [→ Contexto_Base_Web.md §B128]
 */
function iniciarTorneoEnVivo(inicio) {
  iniciarActualizacionTorneoEnVivo(inicio);
}

/**
 * detenerTorneoEnVivo() [→ Contexto_Base_Web.md §B129]
 */
function detenerTorneoEnVivo() {
  detenerActualizacionTorneoEnVivo();
}

// ----- Funciones internas / helpers ----- [→ Contexto_Base_Web.md §B130]

// SECCIÓN 2: FUNCIONES INTERNAS (helpers — no pensadas para correr a mano; [→ Contexto_Base_Web.md §B131]

// RESTO DE FUNCIONES [→ Contexto_Base_Web.md §B132]
/**
 * _estadoVentanaGuerra_(ahora) [→ Contexto_Base_Web.md §B133]
 */
function _estadoVentanaGuerra_(ahora) {
  var d = ahora || new Date();
  var m = d.getUTCHours() * 60 + d.getUTCMinutes();
  var ini = CFG.VENTANA_GUERRA_INI_UTC_MIN, fin = CFG.VENTANA_GUERRA_FIN_UTC_MIN;
  var pre = CFG.VENTANA_GUERRA_PRE_MARGEN_MIN || 0;
  return {
    enVentana: (m >= ini && m < fin),
    protegida: (m >= ini - pre && m < fin)
  };
}

/**
 * _liberarLockSiNoEsRunGuerra_() [→ Contexto_Base_Web.md §B134]
 */
function _liberarLockSiNoEsRunGuerra_() {
  try {
    var props = PropertiesService.getScriptProperties();
    var raw = props.getProperty('EJECUCION_EN_CURSO');
    var info = raw ? JSON.parse(raw) : null;
    if (info && info.fn === 'runGuerra') return;
    props.deleteProperty('EJECUCION_EN_CURSO');
  } catch (e) { /* propiedad corrupta: se deja como esta */ }
}

// _reenumeracionEnCurso_(): PF260 (25-oct-2026); true si hay una reenumeración de temporadas sin terminar (REENUM_PASO guardado). Mientras sea true NO debe correr nada que lea o escriba numeración propia: una corrida a medias mezclaría la numeración vieja y la nueva.
function _reenumeracionEnCurso_() {
  return PropertiesService.getScriptProperties().getProperty('REENUM_PASO') !== null;
}

// _bloquearSiReenumerando_(nombreFn): PF260; devuelve true (y lo anota en el log) si hay reenumeración en curso; el llamador debe salir sin hacer nada. No toma ni libera ningún lock.
function _bloquearSiReenumerando_(nombreFn) {
  if (!_reenumeracionEnCurso_()) return false;
  Logger.log('[Reenumeración] ' + nombreFn + '(): NO se ejecuta, hay una reenumeración de temporadas en curso (REENUM_PASO = ' +
    PropertiesService.getScriptProperties().getProperty('REENUM_PASO') + '). Se retoma sola cuando termine.');
  return true;
}

// PF281 (26-oct-2026): motivo por el que _adquirirLockEjecucion() devolvió false en ESTA ejecución: 'ocupado' (lock corto ocupado u otra ejecución en curso: vale la pena reintentar) o 'otro' (reenumeración o ventana de guerra: no se reintenta). Vacío si no fue rechazada.
var LOCK_ULTIMO_RECHAZO_ = '';

function _adquirirLockEjecucion(nombreFn) {
  LOCK_ULTIMO_RECHAZO_ = '';
  // PF260: con una reenumeración en curso solo pueden tomar el lock las funciones de la propia reenumeración (runGuerra incluida: escribiría con numeración mezclada).
  if (nombreFn !== 'runReenumerarTemporadas' && nombreFn !== 'reanudarReenumerarTemporadas' && _bloquearSiReenumerando_(nombreFn)) { LOCK_ULTIMO_RECHAZO_ = 'otro'; return false; }
  // VENTANA DE GUERRA PROTEGIDA (05-oct-2026): fuera de runGuerra() nada puede empezar desde
  // CFG.VENTANA_GUERRA_PRE_MARGEN_MIN minutos antes de las 4:00 a.m. Lima hasta las 5:00 a.m.
  if (nombreFn !== 'runGuerra' && CFG.VENTANA_GUERRA_BLOQUEAR_OTROS && _estadoVentanaGuerra_().protegida) {
    Logger.log('[Lock] ' + nombreFn + '(): NO se inicia, esta dentro de la ventana de guerra protegida (' +
      Math.floor(CFG.VENTANA_GUERRA_INI_UTC_MIN / 60 - 5) + ':00-' + Math.floor(CFG.VENTANA_GUERRA_FIN_UTC_MIN / 60 - 5) +
      ':00 Lima, mas ' + CFG.VENTANA_GUERRA_PRE_MARGEN_MIN + ' min de margen previo). Solo runGuerra() puede correr ahora; ' +
      'reintentar despues de las 5:00 a.m.');
    LOCK_ULTIMO_RECHAZO_ = 'otro';
    return false;
  }
  var miniLock = LockService.getScriptLock();
  if (!miniLock.tryLock(5000)) {
    Logger.log('[Lock] ' + nombreFn + '(): no se pudo verificar el estado de ejecución (lock corto ocupado). Se cancela esta ejecución.');
    LOCK_ULTIMO_RECHAZO_ = 'ocupado';
    return false;
  }
  try {
    var props = PropertiesService.getScriptProperties();
    var raw = props.getProperty('EJECUCION_EN_CURSO');
    var ahora = Date.now();
    if (raw) {
      try {
        var info = JSON.parse(raw);
        var antiguedad = ahora - info.inicio;
        if (antiguedad < CFG.LOCK_MAX_DURACION_MS) {
          Logger.log('[Lock] ' + nombreFn + '(): ya hay otra ejecución en curso (' + info.fn + ', iniciada hace ' + Math.round(antiguedad / 1000) + 's). Se cancela esta ejecución para evitar duplicados.');
          LOCK_ULTIMO_RECHAZO_ = 'ocupado';
          return false;
        }
        Logger.log('[Lock] ' + nombreFn + '(): se encontró un lock vencido de ' + info.fn + ' (iniciado hace ' + Math.round(antiguedad / 1000) + 's, > ' + (CFG.LOCK_MAX_DURACION_MS / 1000) + 's). Se asume una ejecución colgada/cortada por timeout y se libera automáticamente.');
      } catch (e) {
        // Propiedad corrupta: se ignora y se sobreescribe.
      }
    }
    props.setProperty('EJECUCION_EN_CURSO', JSON.stringify({ fn: nombreFn, inicio: ahora }));
    return true;
  } finally {
    miniLock.releaseLock();
  }
}

function _refrescarLockEjecucion(nombreFn) {
  PropertiesService.getScriptProperties().setProperty('EJECUCION_EN_CURSO', JSON.stringify({ fn: nombreFn, inicio: Date.now() }));
}

function _liberarLockEjecucion() {
  PropertiesService.getScriptProperties().deleteProperty('EJECUCION_EN_CURSO');
}

function _borrarTriggersDeContinuacion(nombreHandler) {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === nombreHandler) ScriptApp.deleteTrigger(triggers[i]);
  }
}

function _programarContinuacion(nombreHandler) {
  _borrarTriggersDeContinuacion(nombreHandler);
  ScriptApp.newTrigger(nombreHandler).timeBased().after(10 * 1000).create();
}

/**
 * _reintentarDiarioSiCandadoOcupado_(handlerReintento) - PF281 (26-oct-2026). Los diarios que toman el candado (runUpdateProgramado, runSyncCSV)
 * se cancelaban sin reintento si el candado estaba ocupado (el 25-oct runUpdateProgramado perdió su corrida porque una ráfaga de doPost de correcciones
 * tenía el candado de script). Si el rechazo fue por candado ocupado (LOCK_ULTIMO_RECHAZO_ === 'ocupado'), programa UNA ejecución única a
 * CFG.DIARIO_REINTENTO_MS por medio de un handler propio (_reintentarRunUpdateProgramado / _reintentarRunSyncCSV; nunca el mismo handler del
 * activador diario, porque _borrarTriggersDeContinuacion() lo borraría). Máximo CFG.DIARIO_REINTENTO_MAX intentos por día (Lima) y por handler.
 * No reintenta si el rechazo fue por reenumeración o ventana de guerra. Nunca lanza error. [→ Contexto_Base_Web.md §PF281]
 */
function _reintentarDiarioSiCandadoOcupado_(handlerReintento) {
  try {
    if (LOCK_ULTIMO_RECHAZO_ !== 'ocupado') return;
    var props = PropertiesService.getScriptProperties();
    var clave = 'REINTENTO_DIARIO_' + handlerReintento;
    var hoy = Utilities.formatDate(new Date(), 'America/Lima', 'yyyyMMdd');
    var n = 0;
    try {
      var g = JSON.parse(props.getProperty(clave) || 'null');
      if (g && g.dia === hoy) n = Number(g.n) || 0;
    } catch (eJson) { n = 0; }
    if (n >= CFG.DIARIO_REINTENTO_MAX) {
      Logger.log('[Reintento diario] ' + handlerReintento + ': se agotaron los ' + CFG.DIARIO_REINTENTO_MAX + ' reintentos de hoy con el candado ocupado. Se vuelve a intentar en el próximo horario.');
      return;
    }
    props.setProperty(clave, JSON.stringify({ dia: hoy, n: n + 1 }));
    _borrarTriggersDeContinuacion(handlerReintento);
    ScriptApp.newTrigger(handlerReintento).timeBased().after(CFG.DIARIO_REINTENTO_MS).create();
    Logger.log('[Reintento diario] ' + handlerReintento + ': el candado estaba ocupado; se reintenta en ' + Math.round(CFG.DIARIO_REINTENTO_MS / 60000) + ' min (intento ' + (n + 1) + ' de ' + CFG.DIARIO_REINTENTO_MAX + ').');
  } catch (e) {
    Logger.log('[Reintento diario] ' + handlerReintento + ': no se pudo programar el reintento: ' + e.message);
  }
}

/** Handler del reintento de runUpdateProgramado (PF281). Borra su propio activador y vuelve a llamar a la función diaria. */
function _reintentarRunUpdateProgramado() {
  _borrarTriggersDeContinuacion('_reintentarRunUpdateProgramado');
  runUpdateProgramado();
}

/** Handler del reintento de runSyncCSV (PF281). Borra su propio activador y vuelve a llamar a la función diaria. */
function _reintentarRunSyncCSV() {
  _borrarTriggersDeContinuacion('_reintentarRunSyncCSV');
  runSyncCSV();
}

/**
 * _ejecutarPorTandas(idEjecucion, pasos, presupuestoMs, props) [→ Contexto_Base_Web.md §B135]
 */
var INICIO_TANDA_MS_ = 0; // PF263: instante en que empezó la ejecución actual de _ejecutarPorTandas(); lo usa _reenumSinTiempo_() (47_Migraciones.gs) para repartir los 6 min entre los pasos de una misma tanda
function _ejecutarPorTandas(idEjecucion, pasos, presupuestoMs, nombreHandlerContinuacion, nombresPasos) {
  INICIO_TANDA_MS_ = Date.now();
  var props = PropertiesService.getScriptProperties();

  // VENTANA DE GUERRA PROTEGIDA (05-oct-2026): una continuacion programada antes de la ventana no debe [→ Contexto_Base_Web.md §B136]
  // PF260: una cadena que NO es la reenumeración se descarta mientras haya reenumeración en curso; y la reenumeración NUNCA se aborta por la ventana de guerra
  // (abortar borraba REENUM_PASO y obligaba a empezar de cero, sumando el delta dos veces).
  if (idEjecucion !== 'REENUM' && _reenumeracionEnCurso_()) {
    Logger.log('[' + idEjecucion + '] DESCARTADA: hay una reenumeración de temporadas en curso. La próxima corrida normal empieza de cero cuando termine.');
    props.deleteProperty(idEjecucion + '_PASO');
    props.deleteProperty(idEjecucion + '_REINTENTO');
    props.deleteProperty(idEjecucion + '_SIN_API');
    props.deleteProperty(idEjecucion + '_SIN_API_TS');
    _borrarTriggersDeContinuacion(nombreHandlerContinuacion);
    return false;
  }
  if (idEjecucion !== 'REENUM' && CFG.VENTANA_GUERRA_BLOQUEAR_OTROS && _estadoVentanaGuerra_().protegida) {
    Logger.log('[' + idEjecucion + '] ABORTADA: la ventana de guerra protegida (4:00-5:00 a.m. Lima, mas ' +
      CFG.VENTANA_GUERRA_PRE_MARGEN_MIN + ' min previos) esta activa. Se descarta el avance y la continuacion ' +
      'pendiente; la proxima corrida normal empieza de cero despues de las 5:00 a.m.');
    props.deleteProperty(idEjecucion + '_PASO');
    props.deleteProperty(idEjecucion + '_REINTENTO');
    props.deleteProperty(idEjecucion + '_SIN_API');
    props.deleteProperty(idEjecucion + '_SIN_API_TS');
    _borrarTriggersDeContinuacion(nombreHandlerContinuacion);
    _liberarLockSiNoEsRunGuerra_();
    return false;
  }

  var inicioTanda = Date.now();
  var paso = parseInt(props.getProperty(idEjecucion + '_PASO') || '0', 10);
  var reintentoMismoPaso = props.getProperty(idEjecucion + '_REINTENTO') === '1';

  // IMPORTANTE: CACHE_CLAN_DATA es una variable global en memoria (no se [→ Contexto_Base_Web.md §B137]
  // PF091 (17-oct-2026): en una cadena PROGRAMADA (bandera <ID>_SIN_API) el cache se reconstruye del checkpoint aunque el paso se
  // reintente o sea el 0 (runUpdateProgramado: su primer paso, _fetchAllClanData(), pediria la API si el checkpoint tiene mas de 45 min).
  var cadenaSinApi = props.getProperty(idEjecucion + '_SIN_API') === '1';
  if (((paso > 0 && !reintentoMismoPaso) || cadenaSinApi) &&
      (typeof CACHE_CLAN_DATA === 'undefined' || CACHE_CLAN_DATA === null)) {
    // CAMBIO (05-oct-2026): si la cadena es de una version PROGRAMADA (bandera <ID>_SIN_API = 1), el cache se [→ Contexto_Base_Web.md §B138]
    if (props.getProperty(idEjecucion + '_SIN_API') === '1') {
      Logger.log('[' + idEjecucion + '] Reanudando en el paso ' + (paso + 1) + ' (version programada): se reconstruye el cache de clanes desde el checkpoint de Drive, SIN API.');
      if (!_fetchClanesBasicoSinApi()) {
        Logger.log('[' + idEjecucion + '] ABORTADA: ya no hay un checkpoint de clanes utilizable para reanudar sin API. ' +
          'Se descarta el avance; la proxima corrida programada empieza de cero.');
        props.deleteProperty(idEjecucion + '_PASO');
        props.deleteProperty(idEjecucion + '_REINTENTO');
        props.deleteProperty(idEjecucion + '_SIN_API');
        props.deleteProperty(idEjecucion + '_SIN_API_TS');
        _borrarTriggersDeContinuacion(nombreHandlerContinuacion);
        _liberarLockSiNoEsRunGuerra_();
        return false;
      }
    } else {
      Logger.log('[' + idEjecucion + '] Reanudando en el paso ' + (paso + 1) + ': cache de clanes vacío (ejecución nueva), se reconstruye la parte básica antes de continuar.');
      capturarApiClanes_(CFG.CLANES_PROGRESO_MAX_EDAD_MS, 'tandas');
    }
  }

  // PF274 (25-oct-2026): internamente `paso` es el ÍNDICE (desde 0) y es lo que se guarda en <ID>_PASO; en los textos del registro se muestra el NÚMERO (paso + 1),
  // así «paso 29/29» es el último. Tras completar el paso `paso` (índice), quedan hechos `paso` pasos. [→ Contexto_Base_Web.md §PF274]
  while (paso < pasos.length) {
  Logger.log('[' + idEjecucion + '] Ejecutando paso ' + (paso + 1) + '/' + pasos.length +
    (nombresPasos && nombresPasos[paso] ? ': ' + nombresPasos[paso] : ''));
  var resultado = pasos[paso]();

    if (resultado === false) {
      Logger.log('[' + idEjecucion + '] Paso ' + (paso + 1) + '/' + pasos.length + ' quedó incompleto (presupuesto interno agotado, ej. /players). ' +
                 'Se reintenta el MISMO paso en la próxima continuación, retomando el progreso ya guardado.');
      props.setProperty(idEjecucion + '_PASO', String(paso));
      props.setProperty(idEjecucion + '_REINTENTO', '1');
      _refrescarLockEjecucion(idEjecucion);
      _programarContinuacion(nombreHandlerContinuacion);
      return false;
    }

    props.deleteProperty(idEjecucion + '_REINTENTO');
    paso++;
    props.setProperty(idEjecucion + '_PASO', String(paso));
    _refrescarLockEjecucion(idEjecucion);

    if (paso < pasos.length && (Date.now() - inicioTanda) > presupuestoMs) {
      Logger.log('[' + idEjecucion + '] Presupuesto de tiempo agotado tras completar el paso ' + paso + '/' + pasos.length + '. Se programa continuación automática en 10s.');
      _programarContinuacion(nombreHandlerContinuacion);
      return false;
    }
  }

  props.deleteProperty(idEjecucion + '_PASO');
  props.deleteProperty(idEjecucion + '_REINTENTO');
  _borrarTriggersDeContinuacion(nombreHandlerContinuacion);
  return true;
}

function onEditTrigger(e) {
  if (!e || !e.range) return;

  var sh     = e.source.getActiveSheet();
  var shName = sh.getName();
  var col    = e.range.getColumn();
  var row    = e.range.getRow();

  if (row < 2) return;

  // FIX (05-ago-2026): estas 3 comparaciones usaban DC.COMENTARIO (55), [→ Contexto_Base_Web.md §B139]
  if (shName === CFG.SHEETS.DIRECTORIO && col === IC.COMENTARIO) {
    moverComentarioFila(sh, row);
  }

  if (shName === CFG.SHEETS.DIRECTORIO && col === IC.RAZON) {
    sincronizarRazonHaciaVetados(sh, row);
  }

  // FIX (25-ago-2026): antes col === 10 (número mágico). Vetados.Razón [→ Contexto_Base_Web.md §B140]
  if (shName === CFG.SHEETS.VETADOS && col === VC.RAZON) {
    sincronizarRazonHaciaDirectorio(sh, row);
  }

  // Admin/Cat_disp (12/07/2026): Directorio y Administradores ya NO [→ Contexto_Base_Web.md §B141]
  var esEdicionAdminCatDisp =
    (shName === CFG.SHEETS.DIRECTORIO && col === IC.ADMIN) ||
    (shName === CFG.SHEETS.ADMINISTRADORES && (col === AC.ADMIN || col === AC.CAT_DISP));
  if (esEdicionAdminCatDisp) {
    sincronizarEdicionAdminCatDisp(sh, row);
  }
}