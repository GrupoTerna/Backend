// ==============================================================================
// 41_Web_ActualizarRoster.gs
// Actualización manual pedida desde la web por un admin (creado 05-oct-2026). Hasta el 22-oct-2026 corría runPendientesYMensajes(); desde esa fecha corre la CADENA CORTA (Clanes, Directorio, Nuevos y Guerra) y, si otra ejecución tiene el candado, espera su turno en vez de rechazar. [→ Contexto_Base_Web.md §PF166]
// ==============================================================================
//
// Permiso 'Actualizar roster', acciones POST/GET, estados, reglas para proteger la API y la captura de guerra, y AVISOS 1-5 (sin probar en Apps Script real; AVISO 5 PENDIENTE DE DEFINIR: invalidar la cache de webAdminContenido). [→ Contexto_Base_Web.md §41B002]
//
// FLUJO (PF166): la web pide -> estado 'pendiente' + disparador de un solo uso (WEB_ACTROSTER_HANDLER) -> ese handler intenta tomar el
// candado global de ejecución. Si no puede (runGuerra u otra tarea lo tiene), el estado sigue 'pendiente' con el mensaje «Esperando turno»
// y el handler se reprograma cada WEB_ACTROSTER_TURNO_REINTENTO_MS hasta WEB_ACTROSTER_TURNO_MAX_MS. Si lo toma, pasa a 'ejecutando' y
// corre los pasos de _webActRosterPasos_() con _ejecutarPorTandas() (continuaciones en WEB_ACTROSTER_HANDLER_CONTINUAR).
// ==============================================================================

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 28-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano: ninguna (la actualización la pide un admin desde la web y la corre un disparador de un solo uso)
//  Parte 2 — Funciones que no se corren a mano
//    - Acciones web: iniciar la actualización y consultar su estado
//    - Ejecución por disparador: arranque con reintentos de turno, tandas de la cadena (_webActualizarRosterContinuar justo después de su principal) y recalentado de la web
//    - Pasos de la cadena: tipo de actualización, lista de pasos y sus nombres
//    - Permiso y estado de la solicitud
//    - Bloqueo, candado y textos para el admin
//    - Cierre de la solicitud: cachés, estado final y limpieza de la cadena
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

var WEB_ACTROSTER_PROP_ESTADO = 'WEB_ACTROSTER_ESTADO';
var WEB_ACTROSTER_HANDLER = '_webActualizarRosterEjecutar';             // arranque y reintentos de turno
var WEB_ACTROSTER_HANDLER_CONTINUAR = '_webActualizarRosterContinuar';  // tandas de la cadena (las programa _ejecutarPorTandas)
var WEB_ACTROSTER_ID_TANDAS = 'ACTROSTER';                              // prefijo de ACTROSTER_PASO/ACTROSTER_REINTENTO y nombre con el que se toma el candado global
var WEB_ACTROSTER_ESPERA_MS = 3 * 60 * 1000;               // tiempo de espera entre el fin de una actualización y el inicio de la siguiente
var WEB_ACTROSTER_TURNO_MAX_MS = 10 * 60 * 1000;           // cuánto espera un turno (candado ocupado) antes de rendirse
var WEB_ACTROSTER_TURNO_REINTENTO_MS = 30 * 1000;          // cada cuánto reintenta tomar el candado mientras espera
var WEB_ACTROSTER_PENDIENTE_MAX_MS = 12 * 60 * 1000;       // un 'pendiente' más viejo que esto se da por fallido (mayor que TURNO_MAX)
var WEB_ACTROSTER_EJECUTANDO_MAX_MS = 15 * 60 * 1000;      // un 'ejecutando' más viejo que esto se da por fallido (la cadena puede usar varias tandas)
var WEB_ACTROSTER_ARRANQUE_MS = 5 * 1000;                  // retraso del disparador de un solo uso
var WEB_ACTROSTER_CACHES_A_BORRAR = ['web_ingresos_recientes_v1', 'web_roster_v1']; // §PF180: lo que lee Ingresos recientes de directorio.html (cacheado 60 s); se borra al terminar para que la recarga del botón «Actualizar» no reciba datos de hasta 60 s antes

// §PF181: la misma cola de turno sirve para regenerar solo Pendientes y Mensajes de guerra (boton «Regenerar ahora» de guerra.html): tipo 'mensajes' = los mismos pasos que runPendientesYMensajes() manual (clanes frescos de la API, Pendientes, Mensajes, indice).
var WEB_ACTROSTER_NOMBRES_PASOS_MENSAJES = [
  'Clanes: pedir a la API datos frescos → datos de clanes cargados',
  'Hoja Pendientes: actualizar → hoja Pendientes al día',
  'Hoja Mensajes: generar a partir de Pendientes → hoja Mensajes al día',
  'Índice de contenido: actualizar tras Pendientes → índice al día'
];

var WEB_ACTROSTER_NOMBRES_PASOS = [
  'Clanes: pedir a la API los datos básicos de los clanes, sin /players → datos de clanes cargados',
  'Hoja Directorio: actualizar → hoja Directorio al día',
  'Nuevos (formato y purgado): aplicar → hoja Nuevos con su formato y purgada',
  'Nuevos (columnas fijas): refrescar → columnas fijas de Nuevos al día',
  'Nuevos (orden y formato condicional): aplicar → hoja Nuevos ordenada y con su formato condicional',
  'Hoja Guerra: actualizar → hoja Guerra al día (puede necesitar varias tandas)'
];

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ---------------------------------------------------------------------------
// Acciones web
// ---------------------------------------------------------------------------

// Inicia de forma asíncrona la actualización manual (valida sesión, permiso y que se pueda iniciar). Si otra ejecución tiene el candado, la solicitud queda en cola. [→ Contexto_Base_Web.md §41B003]
function _webAdminActualizarRoster(token, tipo) {
  var acceso = _webActRosterExigirFuncion_(token);
  if (!acceso.ok) return acceso;
  var admin = acceso.admin;

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return { ok: false, error: 'El sistema está ocupado en este momento. Intenta de nuevo en unos segundos.' };
  }
  try {
    var ahora = Date.now();
    var est = _webActRosterEstadoVigente_(ahora);
    var bloqueo = _webActRosterBloqueo_(est, ahora);
    if (bloqueo.bloqueado) {
      return { ok: false, error: bloqueo.motivo, bloqueo: { motivo: bloqueo.motivo, esperaSeg: bloqueo.esperaSeg } };
    }

    // PF166: si otra tarea tiene el candado, la solicitud se acepta igual y espera su turno.
    var otra = _webActRosterEjecucionEnCurso_(ahora);
    var tipoSol = _webActRosterTipo_(tipo); // §PF181
    var nombreAccion = tipoSol === 'mensajes' ? 'la regeneración de Pendientes y Mensajes' : 'la actualización';
    var nuevo = {
      id: Utilities.formatDate(new Date(ahora), 'UTC', 'yyyyMMddHHmmss') + '-' + Math.floor(Math.random() * 1000),
      estado: 'pendiente',
      tipo: tipoSol,
      solicitadoPor: String(admin.nomMulti || admin.nombre || 'Admin'),
      solicitadoTs: ahora,
      inicioTs: 0,
      finTs: 0,
      intentosTurno: 0,
      mensaje: otra
        ? 'Solicitada. El sistema está ejecutando ' + _webActRosterNombreTarea_(otra) + '; ' + nombreAccion + ' empezará sola cuando termine.'
        : 'Solicitada. Empieza en unos segundos.'
    };
    _webActRosterGuardarEstado_(nuevo);

    try {
      _borrarTriggersDeContinuacion(WEB_ACTROSTER_HANDLER);
      ScriptApp.newTrigger(WEB_ACTROSTER_HANDLER).timeBased().after(WEB_ACTROSTER_ARRANQUE_MS).create();
    } catch (eTrig) {
      Logger.log('[ActRoster] No se pudo programar el disparador: ' + eTrig);
      nuevo.estado = 'error';
      nuevo.finTs = Date.now();
      nuevo.mensaje = 'No se pudo programar la actualización. Intenta de nuevo; si se repite, avisa al administrador.';
      _webActRosterGuardarEstado_(nuevo);
      return { ok: false, error: nuevo.mensaje };
    }

    Logger.log('[ActRoster] Solicitud ' + nuevo.id + ' (' + tipoSol + ') registrada por ' + nuevo.solicitadoPor + (otra ? ' (candado ocupado por ' + otra + ': queda en cola)' : '') + '.');
    return {
      ok: true,
      estado: 'pendiente',
      tipo: tipoSol,
      id: nuevo.id,
      solicitadoLima: _webActRosterFechaLima_(nuevo.solicitadoTs),
      enCola: !!otra,
      mensaje: nuevo.mensaje
    };
  } finally {
    lock.releaseLock();
  }
}

// Estado de la última actualización pedida desde la web y si se puede iniciar otra ahora. [→ Contexto_Base_Web.md §41B004]
function _webAdminEstadoActualizacion(token) {
  var acceso = _webActRosterExigirFuncion_(token);
  if (!acceso.ok) return acceso;

  var ahora = Date.now();
  var est = _webActRosterEstadoVigente_(ahora);
  var bloqueo = _webActRosterBloqueo_(est, ahora);
  var otra = _webActRosterEjecucionEnCurso_(ahora);

  var salida = {
    ok: true,
    estado: est ? est.estado : 'ninguna',
    tipo: est ? _webActRosterTipo_(est.tipo) : null, // §PF181: 'roster' o 'mensajes'
    id: est ? est.id : null,
    solicitadoPor: est ? est.solicitadoPor : null,
    solicitadoLima: est && est.solicitadoTs ? _webActRosterFechaLima_(est.solicitadoTs) : null,
    inicioLima: est && est.inicioTs ? _webActRosterFechaLima_(est.inicioTs) : null,
    finLima: est && est.finTs ? _webActRosterFechaLima_(est.finTs) : null,
    duracionSeg: est && est.inicioTs && est.finTs ? Math.round((est.finTs - est.inicioTs) / 1000) : null,
    mensaje: est ? est.mensaje : 'Todavía no se ha pedido ninguna actualización manual.',
    puedeIniciar: !bloqueo.bloqueado,
    motivoBloqueo: bloqueo.bloqueado ? bloqueo.motivo : null,
    esperaSeg: bloqueo.esperaSeg || 0,
    webRecalentada: est && typeof est.webRecalentada === 'boolean' ? est.webRecalentada : null,
    // PF166: tarea ajena que tiene el candado ahora (la solicitud esperaría su turno) y avance de la cadena propia.
    ocupadoPor: otra && otra !== WEB_ACTROSTER_ID_TANDAS ? _webActRosterNombreTarea_(otra) : null,
    paso: null,
    pasosTotal: _webActRosterNombresPasos_(est && est.tipo).length,
    pasoNombre: null,
    tiempos: null
  };
  if (est && est.estado === 'ejecutando') {
    var pasoHecho = parseInt(PropertiesService.getScriptProperties().getProperty(WEB_ACTROSTER_ID_TANDAS + '_PASO') || '0', 10) || 0;
    salida.paso = Math.min(pasoHecho + 1, salida.pasosTotal);
    salida.pasoNombre = _webActRosterNombresPasos_(est.tipo)[Math.min(pasoHecho, salida.pasosTotal - 1)] || null;
  }
  // NUEVO (05-oct-2026): horas de actualizacion para mostrarlas junto al boton. Un fallo aqui no debe romper el estado.
  try { salida.tiempos = _tiemposActualizacionWeb_(); }
  catch (eTiempos) { Logger.log('[ActRoster] No se pudieron armar las horas de actualizacion: ' + eTiempos.message); }
  return salida;
}

// ---------------------------------------------------------------------------
// Ejecucion (la dispara el activador de un solo uso)
// ---------------------------------------------------------------------------

// Handler del disparador de un solo uso (arranque y reintentos de turno): toma el candado global o, si está ocupado, se reprograma; al tomarlo lanza la cadena. [→ Contexto_Base_Web.md §41B005, PF166]
function _webActualizarRosterEjecutar() {
  _borrarTriggersDeContinuacion(WEB_ACTROSTER_HANDLER);

  var est = _webActRosterLeerEstado_();
  if (!est || est.estado !== 'pendiente') {
    Logger.log('[ActRoster] El disparador arrancó pero no hay solicitud pendiente (estado: ' + (est ? est.estado : 'ninguno') + '). No se hace nada.');
    return;
  }

  var ahora = Date.now();
  if (CFG.VENTANA_GUERRA_BLOQUEAR_OTROS && _estadoVentanaGuerra_(new Date(ahora)).protegida) {
    _webActRosterCerrar_(est, 'omitido', _webActRosterTextoVentana_() + ' Intenta de nuevo más tarde.');
    return;
  }

  if (!_adquirirLockEjecucion(WEB_ACTROSTER_ID_TANDAS)) {
    var esperadoMs = ahora - est.solicitadoTs;
    var otra = _webActRosterEjecucionEnCurso_(ahora);
    if (esperadoMs < WEB_ACTROSTER_TURNO_MAX_MS) {
      est.intentosTurno = (est.intentosTurno || 0) + 1;
      est.mensaje = 'Esperando turno: el sistema está ejecutando ' + _webActRosterNombreTarea_(otra || 'otra tarea') + '. Empieza sola cuando termine.';
      _webActRosterGuardarEstado_(est);
      try {
        ScriptApp.newTrigger(WEB_ACTROSTER_HANDLER).timeBased().after(WEB_ACTROSTER_TURNO_REINTENTO_MS).create();
      } catch (eTrig) {
        Logger.log('[ActRoster] No se pudo reprogramar el reintento de turno: ' + eTrig);
        _webActRosterCerrar_(est, 'error', 'No se pudo seguir esperando el turno. Intenta de nuevo; si se repite, avisa al administrador.');
        return;
      }
      Logger.log('[ActRoster] Candado ocupado por ' + (otra || '?') + ': reintento ' + est.intentosTurno + ' en ' + Math.round(WEB_ACTROSTER_TURNO_REINTENTO_MS / 1000) + ' s.');
      return;
    }
    _webActRosterCerrar_(est, 'omitido', 'No hubo turno en ' + Math.round(WEB_ACTROSTER_TURNO_MAX_MS / 60000) + ' minutos: el sistema siguió ocupado con ' +
      _webActRosterNombreTarea_(otra || 'otra tarea') + '. Intenta de nuevo más tarde.');
    return;
  }

  est.estado = 'ejecutando';
  est.inicioTs = Date.now();
  est.mensaje = _webActRosterTipo_(est.tipo) === 'mensajes'
    ? 'Regenerando Pendientes y Mensajes de guerra...'
    : 'Actualizando clanes, Directorio, Nuevos y Guerra...';
  _webActRosterGuardarEstado_(est);
  Logger.log('[ActRoster] INICIO de la solicitud ' + est.id + ' (' + _webActRosterTipo_(est.tipo) + ', pedida por ' + est.solicitadoPor + ', esperó ' + Math.round((est.inicioTs - est.solicitadoTs) / 1000) + ' s).');

  var props = PropertiesService.getScriptProperties();
  props.setProperty(WEB_ACTROSTER_ID_TANDAS + '_PASO', '0');
  props.deleteProperty(WEB_ACTROSTER_ID_TANDAS + '_REINTENTO');
  _webActualizarRosterContinuar();
}

// Una tanda de la cadena: la llama el handler de arranque y los disparadores de continuación que programa _ejecutarPorTandas(). Cierra el estado al terminar, abortar o fallar. [→ Contexto_Base_Web.md §PF166]
function _webActualizarRosterContinuar() {
  var t0 = Date.now();
  var props = PropertiesService.getScriptProperties();

  var est = _webActRosterLeerEstado_();
  if (!est || est.estado !== 'ejecutando') {
    Logger.log('[ActRoster] Continuación sin solicitud en ejecución (estado: ' + (est ? est.estado : 'ninguno') + '). Se descarta; no se toca el candado.');
    _borrarTriggersDeContinuacion(WEB_ACTROSTER_HANDLER_CONTINUAR);
    return;
  }

  // Si la cadena perdió el candado (venció y otra tarea lo tomó), no se sigue escribiendo hojas encima de esa tarea.
  var infoLock = _webActRosterInfoCandado_();
  if (!infoLock || infoLock.fn !== WEB_ACTROSTER_ID_TANDAS) {
    Logger.log('[ActRoster] El candado ya no es de esta cadena (' + (infoLock ? infoLock.fn : 'libre') + '). Se corta sin liberarlo.');
    _webActRosterLimpiarCadena_(false);
    _webActRosterCerrar_(est, 'omitido', 'La actualización perdió su turno porque otra tarea tomó el sistema. Intenta de nuevo.');
    return;
  }

  var tipo = _webActRosterTipo_(est.tipo); // §PF181
  var nombresPasos = _webActRosterNombresPasos_(tipo);
  if (tipo === 'roster') SUPRIMIR_PLAYERS_TEMPORAL = true; // variable global en memoria: se pone en cada tanda (ver runGuerraRapido); Pendientes/Mensajes no usan /players
  var completo;
  try {
    completo = _ejecutarPorTandas(WEB_ACTROSTER_ID_TANDAS, _webActRosterPasos_(tipo), CFG.RUNGUERRARAPIDO_PRESUPUESTO_MS,
      WEB_ACTROSTER_HANDLER_CONTINUAR, nombresPasos);
  } catch (e) {
    SUPRIMIR_PLAYERS_TEMPORAL = false;
    Logger.log('[ActRoster] ERROR en la solicitud ' + est.id + ': ' + e + (e && e.stack ? ' | ' + e.stack : ''));
    _webActRosterLimpiarCadena_(true);
    _webActRosterCerrar_(est, 'error', (tipo === 'mensajes' ? 'La regeneración falló' : 'La actualización falló') + '. Intenta de nuevo; si se repite, avisa al administrador.');
    return;
  }

  if (completo && tipo === 'mensajes') {
    // §PF181: si Pendientes abortó (faltó /currentriverrace de algún clan Terna en día de guerra) NO se generaron mensajes nuevos: se conserva lo anterior y se avisa.
    var abortoTs = Number(props.getProperty('PENDIENTES_ABORT_TS')) || 0;
    _webActRosterInvalidarCachesWeb_(tipo);
    _liberarLockEjecucion();
    if (abortoTs >= est.inicioTs) {
      _webActRosterCerrar_(est, 'ok_parcial', 'No se pudieron regenerar: faltaron datos de guerra de la API. Se conservan los mensajes anteriores; intenta de nuevo en unos minutos.');
    } else {
      _webActRosterCerrar_(est, 'ok', 'Pendientes y Mensajes de guerra regenerados.');
    }
    return;
  }

  if (completo) {
    SUPRIMIR_PLAYERS_TEMPORAL = false;
    // Recalentar la cache de la web ANTES de cerrar el estado (sigue en 'ejecutando'), para que cuando el frontend vea 'ok' ya encuentre los datos nuevos (AVISO 4).
    est.mensaje = 'Datos actualizados. Actualizando la web...';
    _webActRosterGuardarEstado_(est);
    _webActRosterInvalidarCachesWeb_(tipo);
    est.webRecalentada = _webActRosterRecalentarWeb_(t0);
    _liberarLockEjecucion();
    _webActRosterCerrar_(est, 'ok', 'Clanes, Directorio, Nuevos y Guerra actualizados.' +
      (est.webRecalentada ? '' : ' La web puede tardar unos minutos en mostrar los datos nuevos.'));
    return;
  }

  // No completo: o quedó una continuación programada (la propiedad de paso sigue) o _ejecutarPorTandas() abortó y la borró (ventana protegida).
  var pasoRestante = props.getProperty(WEB_ACTROSTER_ID_TANDAS + '_PASO');
  if (pasoRestante === null) {
    SUPRIMIR_PLAYERS_TEMPORAL = false;
    _webActRosterCerrar_(est, 'omitido', _webActRosterTextoVentana_() + ' Intenta de nuevo más tarde.');
    return;
  }
  est.mensaje = (tipo === 'mensajes' ? 'Regenerando... (' : 'Actualizando... (') + (parseInt(pasoRestante, 10) || 0) + ' de ' + nombresPasos.length + ' pasos hechos)';
  _webActRosterGuardarEstado_(est);
  Logger.log('[ActRoster] Tanda terminada con la cadena a medias (paso ' + pasoRestante + '/' + nombresPasos.length + '); sigue en la continuación.');
}

// Recalienta la cache de guerra.html con los datos recién escritos si queda margen de tiempo EN ESTA EJECUCIÓN; nunca lanza error; true si se guardó. inicioEjecucionTs = inicio de la tanda actual (PF166: antes era el inicio de toda la solicitud). [→ Contexto_Base_Web.md §41B006, PF166]
function _webActRosterRecalentarWeb_(inicioEjecucionTs) {
  try {
    if (typeof _calentarCacheGuerraEnVivo_ !== 'function') {
      Logger.log('[ActRoster] _calentarCacheGuerraEnVivo_ no está disponible: no se recalienta la web.');
      return false;
    }
    var restanteMs = CFG.PLATAFORMA_LIMITE_EJECUCION_MS - (Date.now() - inicioEjecucionTs);
    if (restanteMs < CFG.RUNGUERRA_SYNC_CSV_MARGEN_MIN_MS) {
      Logger.log('[ActRoster] Recalentado de la web SALTADO: quedan solo ' + Math.round(restanteMs / 1000) + ' s en esta ejecución.');
      return false;
    }
    var ttl = _estadoVentanaGuerra_(new Date()).enVentana
      ? WEB_GUERRA_VIVO_TTL_CALENTADO_VENTANA_SEG
      : WEB_GUERRA_VIVO_TTL_CALENTADO_FUERA_SEG;
    return _calentarCacheGuerraEnVivo_(ttl) === true;
  } catch (e) {
    Logger.log('[ActRoster] No se pudo recalentar la cache de la web: ' + e.message);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Pasos de la cadena
// ---------------------------------------------------------------------------

// §PF181: 'mensajes' solo si se pidió exactamente así; cualquier otro valor (o ninguno) es la cadena corta de roster de siempre.
function _webActRosterTipo_(valor) {
  return String(valor || '').trim() === 'mensajes' ? 'mensajes' : 'roster';
}

// Pasos de la cadena corta (PF166): los mismos 6 primeros de runGuerraRapido (Clanes, Directorio, Nuevos x3, Guerra) y NADA más: sin Control, Control_2, Pendientes, Mensajes ni Índice. Se arma al llamarla (no al cargar el archivo) para no depender del orden de carga de los .gs. [→ Contexto_Base_Web.md §PF166]
function _webActRosterPasos_(tipo) {
  if (_webActRosterTipo_(tipo) === 'mensajes') return _webActRosterPasosMensajes_();
  return [
    function () {
      SUPRIMIR_PLAYERS_TEMPORAL = true; // el Directorio de esta cadena no pide /players (igual que runGuerraRapido)
      forzarRosterFrescoAhora();
      capturarApiClanes_(CFG.CLANES_PROGRESO_MAX_EDAD_MS, 'actualizarRosterWeb paso 0');
    },
    function () { updateDirectorioSheet(); },
    function () {
      try { _refrescarColumnasFijasNuevos_Paso1_FormatoYPurgado(); }
      catch (eNuevos1) { Logger.log('[ActRoster] _refrescarColumnasFijasNuevos_Paso1_FormatoYPurgado() falló: ' + eNuevos1.message); }
    },
    function () {
      try { _refrescarColumnasFijasNuevos_Paso2_ColumnasFijas(); }
      catch (eNuevos2) { Logger.log('[ActRoster] _refrescarColumnasFijasNuevos_Paso2_ColumnasFijas() falló: ' + eNuevos2.message); }
    },
    function () {
      try { _refrescarColumnasFijasNuevos_Paso3_OrdenYFormato(); }
      catch (eNuevos3) { Logger.log('[ActRoster] _refrescarColumnasFijasNuevos_Paso3_OrdenYFormato() falló: ' + eNuevos3.message); }
    },
    function () { return updateGuerraSheet(); } // false = incompleta: _ejecutarPorTandas() reintenta el mismo paso en la continuación
  ];
}

// §PF181: pasos de la regeneracion de Pendientes y Mensajes (mismos cuerpos que runPendientesYMensajes() manual y _pendientesYMensajesNucleo_(false)); NO toca Directorio, Nuevos ni Guerra.
function _webActRosterPasosMensajes_() {
  return [
    function () {
      forzarRosterFrescoAhora();
      capturarApiClanes_(CFG.CLANES_PROGRESO_MAX_EDAD_MS, 'regenerarMensajesWeb paso 0');
    },
    function () { updatePendientesSheet(); },
    function () { runGenerarMensajes(); },
    function () { _actualizarIndiceTrasPendientes_(); }
  ];
}

function _webActRosterNombresPasos_(tipo) {
  return _webActRosterTipo_(tipo) === 'mensajes' ? WEB_ACTROSTER_NOMBRES_PASOS_MENSAJES : WEB_ACTROSTER_NOMBRES_PASOS;
}

// ---------------------------------------------------------------------------
// Permiso y estado de la solicitud
// ---------------------------------------------------------------------------

/** Sesion valida + Funcion 'Actualizar roster' (releida de la hoja). Devuelve { ok:true, admin } o { ok:false, error }. */
function _webActRosterExigirFuncion_(token) {
  var msgSesion = 'Sesión inválida o vencida. Vuelve a iniciar sesión.';
  if (!_webAuthValidar(token)) return { ok: false, error: msgSesion };
  var admin = _webAuthObtenerAdmin(token);
  if (!admin) return { ok: false, error: msgSesion };
  var fresco = _webBuscarAdminPorCelular(admin.celular);
  if (!fresco || !_webAdminTieneFuncion(fresco.funciones, WEB_FUNCION_ACTUALIZAR_ROSTER)) {
    return { ok: false, error: 'No tienes permiso para actualizar el roster.' };
  }
  return { ok: true, admin: admin };
}

// Lee el estado y pasa a 'error' el que quedó trabado ('pendiente' más allá de la espera de turno o 'ejecutando' más allá del máximo de la cadena). [→ Contexto_Base_Web.md §41B007, PF166]
function _webActRosterEstadoVigente_(ahora) {
  var est = _webActRosterLeerEstado_();
  if (!est) return null;
  var cambio = false;
  var liberar = false;
  if (est.estado === 'pendiente' && (ahora - est.solicitadoTs) > WEB_ACTROSTER_PENDIENTE_MAX_MS) {
    est.estado = 'error';
    est.finTs = ahora;
    est.mensaje = 'La actualización no llegó a empezar. Intenta de nuevo; si se repite, avisa al administrador.';
    cambio = true;
  } else if (est.estado === 'ejecutando' && (ahora - est.inicioTs) > WEB_ACTROSTER_EJECUTANDO_MAX_MS) {
    est.estado = 'error';
    est.finTs = ahora;
    est.mensaje = 'La actualización se cortó por tiempo. Revisa los datos e intenta de nuevo.';
    cambio = true;
    liberar = true;
  }
  if (cambio) {
    _webActRosterGuardarEstado_(est);
    _webActRosterLimpiarCadena_(liberar);
  }
  return est;
}

function _webActRosterLeerEstado_() {
  try {
    var raw = PropertiesService.getScriptProperties().getProperty(WEB_ACTROSTER_PROP_ESTADO);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    Logger.log('[ActRoster] Estado guardado ilegible, se ignora: ' + e.message);
    return null;
  }
}

function _webActRosterGuardarEstado_(est) {
  PropertiesService.getScriptProperties().setProperty(WEB_ACTROSTER_PROP_ESTADO, JSON.stringify(est));
}

// ---------------------------------------------------------------------------
// Bloqueo, candado y textos para el admin
// ---------------------------------------------------------------------------

// Decide si se puede iniciar ahora: devuelve {bloqueado, motivo, esperaSeg}; orden: ventana protegida, otra solicitud propia, tiempo de espera. PF166: que OTRA tarea tenga el candado YA NO bloquea (la solicitud espera su turno). [→ Contexto_Base_Web.md §41B008, PF166]
function _webActRosterBloqueo_(est, ahora) {
  if (CFG.VENTANA_GUERRA_BLOQUEAR_OTROS && _estadoVentanaGuerra_(new Date(ahora)).protegida) {
    return { bloqueado: true, motivo: _webActRosterTextoVentana_(), esperaSeg: 0 };
  }
  if (est && (est.estado === 'pendiente' || est.estado === 'ejecutando')) {
    return { bloqueado: true, esperaSeg: 0,
      motivo: 'Ya hay una actualización en curso, pedida por ' + (est.solicitadoPor || 'otro admin') + '. Espera a que termine.' };
  }
  if (est && est.solicitadoTs && est.estado !== 'omitido') {
    // PF166: la espera se cuenta desde que terminó (la cadena puede durar más que la espera misma), o desde que se pidió si no hay fin.
    var desde = est.finTs || est.solicitadoTs;
    var faltaMs = WEB_ACTROSTER_ESPERA_MS - (ahora - desde);
    if (faltaMs > 0) {
      var seg = Math.ceil(faltaMs / 1000);
      return { bloqueado: true, esperaSeg: seg,
        motivo: 'Se actualizó hace poco. Podrás volver a actualizar en ' + seg + ' s.' };
    }
  }
  return { bloqueado: false, motivo: '', esperaSeg: 0 };
}

/** Texto para cuando la cadena no empezó o se cortó por la ventana protegida. */
function _webActRosterTextoVentana_() {
  var fmt = function (minUtc) {
    var m = (((minUtc - 300) % 1440) + 1440) % 1440; // Lima = UTC-5
    var h = Math.floor(m / 60), mm = m % 60;
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ':' + (mm < 10 ? '0' + mm : mm) + (h < 12 ? ' a.m.' : ' p.m.');
  };
  var ini = CFG.VENTANA_GUERRA_INI_UTC_MIN - (CFG.VENTANA_GUERRA_PRE_MARGEN_MIN || 0);
  return 'No disponible entre las ' + fmt(ini) + ' y las ' + fmt(CFG.VENTANA_GUERRA_FIN_UTC_MIN) +
    ' (hora Lima): en ese rato el sistema solo captura la guerra.';
}

/** Datos del candado global vigente ({fn, inicio}) o null si no hay ninguno o ya venció. */
function _webActRosterInfoCandado_() {
  try {
    var raw = PropertiesService.getScriptProperties().getProperty('EJECUCION_EN_CURSO');
    if (!raw) return null;
    var info = JSON.parse(raw);
    if ((Date.now() - info.inicio) < CFG.LOCK_MAX_DURACION_MS) return info;
  } catch (e) { /* propiedad corrupta: se ignora */ }
  return null;
}

/** Nombre de la ejecucion pesada que tiene el candado global vigente, o '' si no hay ninguna. */
function _webActRosterEjecucionEnCurso_(ahora) {
  try {
    var raw = PropertiesService.getScriptProperties().getProperty('EJECUCION_EN_CURSO');
    if (!raw) return '';
    var info = JSON.parse(raw);
    if ((ahora - info.inicio) < CFG.LOCK_MAX_DURACION_MS) return String(info.fn || 'otra ejecucion');
  } catch (e) { /* propiedad corrupta: se ignora */ }
  return '';
}

/** Nombre legible (para el admin) de la tarea que tiene el candado. Los nombres en mayúsculas son los que deja _refrescarLockEjecucion() en las cadenas por tandas. */
function _webActRosterNombreTarea_(fn) {
  var nombres = {
    runGuerra: 'la actualización de guerra',
    runGuerraCola: 'el respaldo de guerra',
    runGuerraRapido: 'la actualización rápida de guerra',
    RUNGUERRARAPIDO: 'la actualización rápida de guerra',
    runUpdate: 'la actualización periódica',
    RUNUPDATE: 'la actualización periódica',
    runAll: 'la actualización completa',
    RUNALL: 'la actualización completa',
    runPendientesYMensajes: 'Pendientes y Mensajes',
    ACTROSTER: 'otra actualización manual'
  };
  return nombres[fn] || ('otra tarea (' + String(fn) + ')');
}

/** 'dd/MM/yyyy HH:mm:ss' en hora de Lima. */
function _webActRosterFechaLima_(ms) {
  return Utilities.formatDate(new Date(ms), 'America/Lima', 'dd/MM/yyyy HH:mm:ss');
}

// ---------------------------------------------------------------------------
// Cierre de la solicitud
// ---------------------------------------------------------------------------

// §PF180: borra las cachés de 60 s que lee Ingresos recientes (webIngresosRecientes y webRoster) al terminar la cadena en 'ok'. §PF181: con tipo 'mensajes' borra en cambio las de webAdminContenido de las categorías generadas (Mensaje de Guerra, Celular, Etiqueta de miembro). Nunca lanza error.
function _webActRosterInvalidarCachesWeb_(tipo) {
  try {
    var claves = WEB_ACTROSTER_CACHES_A_BORRAR;
    if (_webActRosterTipo_(tipo) === 'mensajes') {
      claves = TIEMPOS_CATEGORIAS_MENSAJES_GENERADOS.map(function (c) { return 'web_admin_contenido_v1_' + c; });
    }
    CacheService.getScriptCache().removeAll(claves);
  } catch (e) {
    Logger.log('[ActRoster] No se pudieron borrar las caches web: ' + e.message);
  }
}

/** Cierra la solicitud con un estado final ('ok', 'omitido', 'error'), la guarda y la deja en el registro. */
function _webActRosterCerrar_(est, estado, mensaje) {
  est.finTs = Date.now();
  est.estado = estado;
  est.mensaje = mensaje;
  _webActRosterGuardarEstado_(est);
  Logger.log('[ActRoster] FIN de la solicitud ' + est.id + ' -> ' + estado + (est.inicioTs ? ' (' + Math.round((est.finTs - est.inicioTs) / 1000) + ' s).' : ' (no llegó a ejecutarse).'));
}

/** Borra el avance y los disparadores de la cadena; con liberarCandado=true libera también el candado global, pero SOLO si es de esta cadena. */
function _webActRosterLimpiarCadena_(liberarCandado) {
  var props = PropertiesService.getScriptProperties();
  props.deleteProperty(WEB_ACTROSTER_ID_TANDAS + '_PASO');
  props.deleteProperty(WEB_ACTROSTER_ID_TANDAS + '_REINTENTO');
  try {
    _borrarTriggersDeContinuacion(WEB_ACTROSTER_HANDLER);
    _borrarTriggersDeContinuacion(WEB_ACTROSTER_HANDLER_CONTINUAR);
  } catch (e) { /* sin accion */ }
  if (liberarCandado) {
    var info = _webActRosterInfoCandado_();
    if (info && info.fn === WEB_ACTROSTER_ID_TANDAS) _liberarLockEjecucion();
  }
}
