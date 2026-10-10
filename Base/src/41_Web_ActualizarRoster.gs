// ==============================================================================
// 41_Web_ActualizarRoster.gs
// Actualización manual del roster, Pendientes y Mensajes de guerra pedida desde la web por un admin (equivale a runPendientesYMensajesManual(); creado 05-oct-2026). [→ Contexto_Base_Web.md §41B001]
// ==============================================================================
//
// Permiso 'Actualizar roster', acciones POST/GET, estados, reglas para proteger la API y la captura de guerra, y AVISOS 1-5 (sin probar en Apps Script real; AVISO 5 PENDIENTE DE DEFINIR: invalidar la cache de webAdminContenido). [→ Contexto_Base_Web.md §41B002]
// ==============================================================================

var WEB_ACTROSTER_PROP_ESTADO = 'WEB_ACTROSTER_ESTADO';
var WEB_ACTROSTER_HANDLER = '_webActualizarRosterEjecutar';
var WEB_ACTROSTER_ESPERA_MS = 3 * 60 * 1000;        // tiempo de espera entre un inicio y el siguiente
var WEB_ACTROSTER_PENDIENTE_MAX_MS = 5 * 60 * 1000; // un 'pendiente' mas viejo que esto se da por fallido
var WEB_ACTROSTER_ARRANQUE_MS = 5 * 1000;           // retraso del disparador de un solo uso

// ---------------------------------------------------------------------------
// Acciones web
// ---------------------------------------------------------------------------

// Inicia de forma asíncrona la actualización manual (valida sesión, permiso y que se pueda iniciar). [→ Contexto_Base_Web.md §41B003]
function _webAdminActualizarRoster(token) {
  var acceso = _webActRosterExigirFuncion_(token);
  if (!acceso.ok) return acceso;
  var admin = acceso.admin;

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return { ok: false, error: 'El sistema esta ocupado en este momento. Intenta de nuevo en unos segundos.' };
  }
  try {
    var ahora = Date.now();
    var est = _webActRosterEstadoVigente_(ahora);
    var bloqueo = _webActRosterBloqueo_(est, ahora);
    if (bloqueo.bloqueado) {
      return { ok: false, error: bloqueo.motivo, bloqueo: { motivo: bloqueo.motivo, esperaSeg: bloqueo.esperaSeg } };
    }

    var nuevo = {
      id: Utilities.formatDate(new Date(ahora), 'UTC', 'yyyyMMddHHmmss') + '-' + Math.floor(Math.random() * 1000),
      estado: 'pendiente',
      solicitadoPor: String(admin.nomMulti || admin.nombre || 'Admin'),
      solicitadoTs: ahora,
      inicioTs: 0,
      finTs: 0,
      mensaje: 'Solicitada. Empieza en unos segundos.'
    };
    _webActRosterGuardarEstado_(nuevo);

    try {
      _borrarTriggersDeContinuacion(WEB_ACTROSTER_HANDLER);
      ScriptApp.newTrigger(WEB_ACTROSTER_HANDLER).timeBased().after(WEB_ACTROSTER_ARRANQUE_MS).create();
    } catch (eTrig) {
      Logger.log('[ActRoster] No se pudo programar el disparador: ' + eTrig);
      nuevo.estado = 'error';
      nuevo.finTs = Date.now();
      nuevo.mensaje = 'No se pudo programar la actualizacion. Intenta de nuevo; si se repite, avisa al administrador.';
      _webActRosterGuardarEstado_(nuevo);
      return { ok: false, error: nuevo.mensaje };
    }

    Logger.log('[ActRoster] Solicitud ' + nuevo.id + ' registrada por ' + nuevo.solicitadoPor + '.');
    return {
      ok: true,
      estado: 'pendiente',
      id: nuevo.id,
      solicitadoLima: _webActRosterFechaLima_(nuevo.solicitadoTs),
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

  var salida = {
    ok: true,
    estado: est ? est.estado : 'ninguna',
    id: est ? est.id : null,
    solicitadoPor: est ? est.solicitadoPor : null,
    solicitadoLima: est && est.solicitadoTs ? _webActRosterFechaLima_(est.solicitadoTs) : null,
    inicioLima: est && est.inicioTs ? _webActRosterFechaLima_(est.inicioTs) : null,
    finLima: est && est.finTs ? _webActRosterFechaLima_(est.finTs) : null,
    duracionSeg: est && est.inicioTs && est.finTs ? Math.round((est.finTs - est.inicioTs) / 1000) : null,
    mensaje: est ? est.mensaje : 'Todavia no se ha pedido ninguna actualizacion manual.',
    puedeIniciar: !bloqueo.bloqueado,
    motivoBloqueo: bloqueo.bloqueado ? bloqueo.motivo : null,
    esperaSeg: bloqueo.esperaSeg || 0,
    webRecalentada: est && typeof est.webRecalentada === 'boolean' ? est.webRecalentada : null,
    tiempos: null
  };
  // NUEVO (05-oct-2026): horas de actualizacion para mostrarlas junto al boton. Un fallo aqui no debe romper el estado.
  try { salida.tiempos = _tiemposActualizacionWeb_(); }
  catch (eTiempos) { Logger.log('[ActRoster] No se pudieron armar las horas de actualizacion: ' + eTiempos.message); }
  return salida;
}

// ---------------------------------------------------------------------------
// Ejecucion (la dispara el activador de un solo uso)
// ---------------------------------------------------------------------------

// Handler del disparador de un solo uso: corre runPendientesYMensajesManual() y deja el resultado en el estado. [→ Contexto_Base_Web.md §41B005]
function _webActualizarRosterEjecutar() {
  _borrarTriggersDeContinuacion(WEB_ACTROSTER_HANDLER);

  var est = _webActRosterLeerEstado_();
  if (!est || est.estado !== 'pendiente') {
    Logger.log('[ActRoster] El disparador arranco pero no hay solicitud pendiente (estado: ' + (est ? est.estado : 'ninguno') + '). No se hace nada.');
    return;
  }

  est.estado = 'ejecutando';
  est.inicioTs = Date.now();
  est.mensaje = 'Actualizando roster, Pendientes y Mensajes...';
  _webActRosterGuardarEstado_(est);
  Logger.log('[ActRoster] INICIO de la solicitud ' + est.id + ' (pedida por ' + est.solicitadoPor + ').');

  var resultado;
  try {
    var corrio = runPendientesYMensajesManual();
    if (corrio === false) {
      resultado = { estado: 'omitido', mensaje: _webActRosterMotivoNoInicio_() + ' Intenta de nuevo mas tarde.' };
    } else if (typeof PENDIENTES_ABORTADO_POR_API !== 'undefined' && PENDIENTES_ABORTADO_POR_API) {
      resultado = { estado: 'ok_parcial', mensaje: 'Se consulto la API, pero Pendientes no se recalculo: faltaron datos de guerra de algun clan. ' +
        'Se conservo la informacion anterior y no se generaron mensajes nuevos.' };
    } else {
      resultado = { estado: 'ok', mensaje: 'Roster, Pendientes y Mensajes actualizados.' };
    }
  } catch (e) {
    Logger.log('[ActRoster] ERROR en la solicitud ' + est.id + ': ' + e + (e && e.stack ? ' | ' + e.stack : ''));
    resultado = { estado: 'error', mensaje: 'La actualizacion fallo. Intenta de nuevo; si se repite, avisa al administrador.' };
  }

  // NUEVO (05-oct-2026, ver AVISO 4): si se actualizo algo, recalentar la cache de la web ANTES de cerrar el estado
  // (sigue en 'ejecutando'), para que cuando el frontend vea 'ok' y vuelva a pedir los datos ya encuentre los nuevos.
  est.webRecalentada = false;
  if (resultado.estado === 'ok' || resultado.estado === 'ok_parcial') {
    est.mensaje = 'Datos actualizados. Actualizando la web...';
    _webActRosterGuardarEstado_(est);
    est.webRecalentada = _webActRosterRecalentarWeb_(est.inicioTs);
    if (!est.webRecalentada) resultado.mensaje += ' La web puede tardar unos minutos en mostrar los datos nuevos.';
  }

  est.finTs = Date.now();
  est.estado = resultado.estado;
  est.mensaje = resultado.mensaje;
  _webActRosterGuardarEstado_(est);
  Logger.log('[ActRoster] FIN de la solicitud ' + est.id + ' -> ' + est.estado + ' (' +
    Math.round((est.finTs - est.inicioTs) / 1000) + ' s).');
}

// Recalienta la cache de guerra.html con los datos recién escritos si queda margen de tiempo; nunca lanza error; true si se guardó. [→ Contexto_Base_Web.md §41B006]
function _webActRosterRecalentarWeb_(inicioTs) {
  try {
    if (typeof _calentarCacheGuerraEnVivo_ !== 'function') {
      Logger.log('[ActRoster] _calentarCacheGuerraEnVivo_ no esta disponible: no se recalienta la web.');
      return false;
    }
    var restanteMs = CFG.LOCK_MAX_DURACION_MS - (Date.now() - inicioTs);
    if (restanteMs < CFG.RUNGUERRA_SYNC_CSV_MARGEN_MIN_MS) {
      Logger.log('[ActRoster] Recalentado de la web SALTADO: quedan solo ' + Math.round(restanteMs / 1000) + ' s de presupuesto.');
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
// Helpers internos
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

// Lee el estado y pasa a 'error' el que quedó trabado ('pendiente' sin arrancar o 'ejecutando' más allá del límite del candado). [→ Contexto_Base_Web.md §41B007]
function _webActRosterEstadoVigente_(ahora) {
  var est = _webActRosterLeerEstado_();
  if (!est) return null;
  var cambio = false;
  if (est.estado === 'pendiente' && (ahora - est.solicitadoTs) > WEB_ACTROSTER_PENDIENTE_MAX_MS) {
    est.estado = 'error';
    est.finTs = ahora;
    est.mensaje = 'La actualizacion no llego a empezar. Intenta de nuevo; si se repite, avisa al administrador.';
    cambio = true;
  } else if (est.estado === 'ejecutando' && (ahora - est.inicioTs) > CFG.LOCK_MAX_DURACION_MS) {
    est.estado = 'error';
    est.finTs = ahora;
    est.mensaje = 'La actualizacion se corto por tiempo. Revisa los datos e intenta de nuevo.';
    cambio = true;
  }
  if (cambio) {
    _webActRosterGuardarEstado_(est);
    try { _borrarTriggersDeContinuacion(WEB_ACTROSTER_HANDLER); } catch (e) { /* sin accion */ }
  }
  return est;
}

// Decide si se puede iniciar ahora: devuelve {bloqueado, motivo, esperaSeg}; orden: ventana protegida, otra solicitud, otra ejecución pesada, tiempo de espera. [→ Contexto_Base_Web.md §41B008]
function _webActRosterBloqueo_(est, ahora) {
  if (CFG.VENTANA_GUERRA_BLOQUEAR_OTROS && _estadoVentanaGuerra_(new Date(ahora)).protegida) {
    return { bloqueado: true, motivo: _webActRosterTextoVentana_(), esperaSeg: 0 };
  }
  if (est && (est.estado === 'pendiente' || est.estado === 'ejecutando')) {
    return { bloqueado: true, esperaSeg: 0,
      motivo: 'Ya hay una actualizacion en curso, pedida por ' + (est.solicitadoPor || 'otro admin') + '. Espera a que termine.' };
  }
  var otra = _webActRosterEjecucionEnCurso_(ahora);
  if (otra) {
    return { bloqueado: true, esperaSeg: 0,
      motivo: 'El sistema esta ejecutando otra tarea (' + otra + '). Intenta de nuevo en unos minutos.' };
  }
  if (est && est.solicitadoTs && est.estado !== 'omitido') {
    var faltaMs = WEB_ACTROSTER_ESPERA_MS - (ahora - est.solicitadoTs);
    if (faltaMs > 0) {
      var seg = Math.ceil(faltaMs / 1000);
      return { bloqueado: true, esperaSeg: seg,
        motivo: 'Se actualizo hace poco. Podras volver a actualizar en ' + seg + ' s.' };
    }
  }
  return { bloqueado: false, motivo: '', esperaSeg: 0 };
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

/** Texto para cuando runPendientesYMensajesManual() no empezo (ventana protegida u otra ejecucion). */
function _webActRosterMotivoNoInicio_() {
  var ahora = Date.now();
  if (CFG.VENTANA_GUERRA_BLOQUEAR_OTROS && _estadoVentanaGuerra_(new Date(ahora)).protegida) return _webActRosterTextoVentana_();
  var otra = _webActRosterEjecucionEnCurso_(ahora);
  if (otra) return 'El sistema estaba ejecutando otra tarea (' + otra + ').';
  return 'No se pudo iniciar la actualizacion.';
}

/** "No disponible entre las 3:40 y las 5:00 a.m. (hora Lima)", calculado desde la configuracion de la ventana. */
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

/** 'dd/MM/yyyy HH:mm:ss' en hora de Lima. */
function _webActRosterFechaLima_(ms) {
  return Utilities.formatDate(new Date(ms), 'America/Lima', 'dd/MM/yyyy HH:mm:ss');
}