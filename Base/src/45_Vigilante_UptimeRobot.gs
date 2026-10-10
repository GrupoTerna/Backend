// ==============================================================================
// 45_Vigilante_UptimeRobot.gs
// Vigilante de UptimeRobot con respaldo automático: activa pingProxyRender solo mientras UptimeRobot siga caído (creado 05-oct-2026). [→ Contexto_Base_Web.md §45B001]
// ==============================================================================

// Cómo funciona (enganche en runGuerra(), chequeo cada 10 min, histéresis), propiedades de configuración, funciones manuales y AVISOS 1-3 (sin probar contra la API real; docblock de pingProxyRender() desactualizado). [→ Contexto_Base_Web.md §45B002]
// ==============================================================================

var VIG_UR_API_URL = 'https://api.uptimerobot.com/v2/getMonitors';
var VIG_UR_PROP_ESTADO = 'UPTIMEROBOT_VIG_ESTADO';
var VIG_UR_PROP_API_KEY = 'UPTIMEROBOT_API_KEY';
var VIG_UR_PROP_MONITOR_ID = 'UPTIMEROBOT_MONITOR_ID';

var VIG_UR_CHECK_CADA_MS = 10 * 60 * 1000;        // cada cuanto se consulta la API de UptimeRobot
var VIG_UR_PING_CADA_MS = 9 * 60 * 1000;          // cada cuanto se pingea el proxy mientras el respaldo esta activo (< 15 min de Render)
var VIG_UR_OK_PARA_DESACTIVAR = 2;                // chequeos buenos seguidos para apagar el respaldo
var VIG_UR_FALLOS_API_MAX = 3;                    // fallos seguidos de la API de UptimeRobot para activar el respaldo por precaucion
var VIG_UR_ULTIMO_CHEQUEO_MAX_MS = 15 * 60 * 1000; // si el ultimo chequeo de UptimeRobot es mas viejo que esto (o 3x su intervalo), se considera caido
var VIG_UR_PING_LENTO_MS = 8000;                  // un ping que tarda mas que esto indica que Render estaba dormido

// Valor inicial del estado guardado. [→ Contexto_Base_Web.md §45B003]
function _vigUrEstadoInicial_() {
  return {
    fallbackActivo: false,   // true = el vigilante esta pingeando el proxy
    desde: 0,                // ms epoch desde que el respaldo esta activo (0 si no lo esta)
    motivo: '',              // texto corto de por que esta activo / ultimo resultado
    urStatus: null,          // ultimo status de UptimeRobot visto (0,1,2,8,9) o null
    ultimoChequeo: 0,        // ms epoch del ultimo intento de chequeo a UptimeRobot
    ultimoChequeoOk: 0,      // ms epoch del ultimo chequeo que SI consiguio respuesta valida
    chequeosBuenos: 0,       // chequeos buenos seguidos (para la histeresis)
    fallosApi: 0,            // fallos seguidos al consultar la API de UptimeRobot
    ultimoPing: 0,           // ms epoch del ultimo ping de respaldo
    ultimoPingMs: 0,         // duracion del ultimo ping de respaldo
    ultimoPingDormido: false,// true si ese ping tardo tanto que Render estaba dormido
    avisoSinClave: false     // para avisar solo una vez que falta UPTIMEROBOT_API_KEY
  };
}

function _vigUrLeerEstado_() {
  var base = _vigUrEstadoInicial_();
  try {
    var raw = PropertiesService.getScriptProperties().getProperty(VIG_UR_PROP_ESTADO);
    if (!raw) return base;
    var guardado = JSON.parse(raw);
    for (var k in guardado) { if (guardado.hasOwnProperty(k)) base[k] = guardado[k]; }
  } catch (e) {
    Logger.log('[VigUR] Estado guardado ilegible, se reinicia: ' + e.message);
  }
  return base;
}

function _vigUrGuardarEstado_(est) {
  PropertiesService.getScriptProperties().setProperty(VIG_UR_PROP_ESTADO, JSON.stringify(est));
}

// Punto de enganche para runGuerra(); nunca lanza; no hace nada dentro de la ventana protegida 4:00-4:59 a.m. Lima. [→ Contexto_Base_Web.md §45B004]
function _vigilarUptimeRobotSeguro_() {
  try {
    if (_estadoVentanaGuerra_(new Date()).protegida) return;
    _vigilarUptimeRobot_(false);
  } catch (e) {
    Logger.log('[VigUR] Excepcion no controlada (se ignora, no afecta a runGuerra): ' + e);
  }
}

// Lógica principal; forzar=true ignora el throttle de chequeo y de ping (uso manual). [→ Contexto_Base_Web.md §45B005]
function _vigilarUptimeRobot_(forzar) {
  var props = PropertiesService.getScriptProperties();
  var apiKey = props.getProperty(VIG_UR_PROP_API_KEY);
  var est = _vigUrLeerEstado_();
  var ahora = Date.now();

  if (!apiKey) {
    if (!est.avisoSinClave) {
      Logger.log('[VigUR] Falta la propiedad ' + VIG_UR_PROP_API_KEY + ' (Configuracion del proyecto -> Propiedades de la secuencia ' +
        'de comandos). Sin ella el vigilante de UptimeRobot no funciona y el respaldo de ping no se activara solo.');
      est.avisoSinClave = true;
      _vigUrGuardarEstado_(est);
    }
    return est;
  }
  if (est.avisoSinClave) est.avisoSinClave = false;

  var tocaChequear = forzar || (ahora - est.ultimoChequeo) >= VIG_UR_CHECK_CADA_MS;
  if (tocaChequear) {
    est = _vigUrChequear_(est, apiKey, props.getProperty(VIG_UR_PROP_MONITOR_ID), ahora);
  }

  if (est.fallbackActivo && (forzar || (ahora - est.ultimoPing) >= VIG_UR_PING_CADA_MS)) {
    var t0 = Date.now();
    pingProxyRender();
    est.ultimoPing = Date.now();
    est.ultimoPingMs = est.ultimoPing - t0;
    est.ultimoPingDormido = est.ultimoPingMs >= VIG_UR_PING_LENTO_MS;
    Logger.log('[VigUR] Ping de respaldo al proxy hecho en ' + est.ultimoPingMs + ' ms' +
      (est.ultimoPingDormido ? ' (tardo mucho: Render estaba dormido, UptimeRobot no lo estaba cuidando)' : '') + '.');
  }

  _vigUrGuardarEstado_(est);
  return est;
}

// Consulta la API de UptimeRobot y actualiza el estado (activa/desactiva el respaldo); devuelve el estado. [→ Contexto_Base_Web.md §45B006]
function _vigUrChequear_(est, apiKey, monitorId, ahora) {
  est.ultimoChequeo = ahora;
  var res = _vigUrConsultarMonitor_(apiKey, monitorId);

  if (res.errorApi) {
    est.fallosApi = (est.fallosApi || 0) + 1;
    Logger.log('[VigUR] No se pudo consultar UptimeRobot (' + est.fallosApi + ' seguido(s)): ' + res.errorApi);
    if (!est.fallbackActivo && est.fallosApi >= VIG_UR_FALLOS_API_MAX) {
      est.fallbackActivo = true;
      est.desde = ahora;
      est.chequeosBuenos = 0;
      est.motivo = 'No se puede consultar UptimeRobot (' + est.fallosApi + ' fallos seguidos: ' + res.errorApi + '). Respaldo por precaucion.';
      Logger.log('[VigUR] RESPALDO ACTIVADO: ' + est.motivo);
    }
    return est;
  }

  est.fallosApi = 0;
  est.ultimoChequeoOk = ahora;
  est.urStatus = res.status;

  if (res.sano) {
    est.chequeosBuenos = (est.chequeosBuenos || 0) + 1;
    if (est.fallbackActivo) {
      if (est.chequeosBuenos >= VIG_UR_OK_PARA_DESACTIVAR) {
        Logger.log('[VigUR] RESPALDO DESACTIVADO: UptimeRobot volvio a funcionar (' + res.detalle + '), ' + est.chequeosBuenos +
          ' chequeos buenos seguidos. Estuvo activo desde ' + new Date(est.desde).toISOString() + '.');
        est.fallbackActivo = false;
        est.desde = 0;
        est.motivo = 'UptimeRobot OK (' + res.detalle + ')';
      } else {
        Logger.log('[VigUR] UptimeRobot parece recuperado (' + res.detalle + '), se espera 1 chequeo mas antes de apagar el respaldo.');
      }
    } else {
      est.motivo = 'UptimeRobot OK (' + res.detalle + ')';
    }
    return est;
  }

  // UptimeRobot NO esta cuidando el proxy.
  est.chequeosBuenos = 0;
  if (!est.fallbackActivo) {
    est.fallbackActivo = true;
    est.desde = ahora;
    est.motivo = res.detalle;
    Logger.log('[VigUR] RESPALDO ACTIVADO: ' + res.detalle + '. Se pingeara el proxy cada ' + Math.round(VIG_UR_PING_CADA_MS / 60000) +
      ' min hasta que UptimeRobot vuelva.');
  } else {
    est.motivo = res.detalle;
    Logger.log('[VigUR] UptimeRobot sigue sin cuidar el proxy: ' + res.detalle + '. El respaldo continua activo.');
  }
  return est;
}

// Pide el monitor del proxy a UptimeRobot; devuelve {errorApi, sano, status, detalle}. [→ Contexto_Base_Web.md §45B007]
function _vigUrConsultarMonitor_(apiKey, monitorId) {
  var payload = { api_key: apiKey, format: 'json', response_times: 1, response_times_limit: 1 };
  if (monitorId) payload.monitors = String(monitorId);

  var resp;
  try {
    resp = UrlFetchApp.fetch(VIG_UR_API_URL, {
      method: 'post',
      payload: payload,
      headers: { 'Cache-Control': 'no-cache' },
      muteHttpExceptions: true
    });
  } catch (e) {
    return { errorApi: 'excepcion de red: ' + e.message };
  }

  var codigo = resp.getResponseCode();
  if (codigo !== 200) {
    return { errorApi: 'HTTP ' + codigo + (codigo === 429 ? ' (limite de solicitudes de UptimeRobot)' : '') };
  }

  var json;
  try { json = JSON.parse(resp.getContentText()); }
  catch (e2) { return { errorApi: 'respuesta no es JSON' }; }

  if (!json || json.stat !== 'ok') {
    var msg = json && json.error ? (json.error.type + ': ' + (json.error.message || '')) : 'stat distinto de ok';
    return { errorApi: msg };
  }

  var monitores = json.monitors || [];
  var m = null;
  if (monitorId) {
    m = monitores[0] || null;
  } else {
    var hostProxy = _vigUrHost_(CFG.API_BASE);
    for (var i = 0; i < monitores.length; i++) {
      if (_vigUrHost_(monitores[i].url) === hostProxy) { m = monitores[i]; break; }
    }
  }

  if (!m) {
    return { errorApi: null, sano: false, status: null,
      detalle: 'UptimeRobot no tiene ningun monitor para ' + _vigUrHost_(CFG.API_BASE) + ' (borrado o URL distinta)' };
  }

  var status = Number(m.status);
  var nombre = m.friendly_name || m.id;
  if (status !== 2) {
    var nombres = { 0: 'pausado', 1: 'sin chequear todavia', 8: 'parece caido', 9: 'caido' };
    return { errorApi: null, sano: false, status: status,
      detalle: 'Monitor "' + nombre + '" de UptimeRobot en estado ' + status + ' (' + (nombres[status] || 'desconocido') + ')' };
  }

  // status 2 (up): comprobar que el ultimo chequeo sea reciente, si la API entrego la fecha.
  var edadMs = _vigUrEdadUltimoChequeoMs_(m);
  if (edadMs !== null) {
    var intervaloMs = Number(m.interval) > 0 ? Number(m.interval) * 1000 : 0;
    var maxMs = Math.max(VIG_UR_ULTIMO_CHEQUEO_MAX_MS, intervaloMs * 3);
    if (edadMs > maxMs) {
      return { errorApi: null, sano: false, status: status,
        detalle: 'Monitor "' + nombre + '" figura up pero su ultimo chequeo fue hace ' + Math.round(edadMs / 60000) +
          ' min (maximo tolerado ' + Math.round(maxMs / 60000) + ' min)' };
    }
    return { errorApi: null, sano: true, status: status,
      detalle: 'monitor "' + nombre + '" up, ultimo chequeo hace ' + Math.round(edadMs / 60000) + ' min' };
  }
  return { errorApi: null, sano: true, status: status, detalle: 'monitor "' + nombre + '" up (la API no entrego la hora del ultimo chequeo)' };
}

/** Edad en ms del ultimo chequeo segun response_times[0].datetime (unix en segundos), o null si no viene. */
function _vigUrEdadUltimoChequeoMs_(m) {
  try {
    var rt = m.response_times;
    if (!rt || !rt.length) return null;
    var dt = Number(rt[0].datetime);
    if (!dt || isNaN(dt)) return null;
    if (dt < 100000000000) dt = dt * 1000; // segundos -> ms
    return Math.max(0, Date.now() - dt);
  } catch (e) { return null; }
}

/** Host de una URL (sin esquema ni ruta), en minusculas. */
function _vigUrHost_(url) {
  var m = String(url || '').toLowerCase().match(/^(?:https?:\/\/)?([^\/:?#]+)/);
  return m ? m[1] : '';
}

// ---------------------------------------------------------------------------
// Funciones manuales y de lectura
// ---------------------------------------------------------------------------

/** Fuerza un chequeo ahora mismo (e, si el respaldo queda activo, un ping) y deja el resultado en el log. */
function vigilarUptimeRobotAhora() {
  var est = _vigilarUptimeRobot_(true);
  Logger.log('[VigUR] Resultado manual: respaldo ' + (est.fallbackActivo ? 'ACTIVO' : 'inactivo') +
    ' | status UptimeRobot=' + est.urStatus + ' | ' + est.motivo);
}

/** Imprime el estado guardado. */
function estadoVigilanteUptimeRobot() {
  Logger.log('[VigUR] Estado: ' + JSON.stringify(getEstadoVigilanteUptimeRobot_(), null, 2));
}

/** Borra el estado guardado (el siguiente disparo de runGuerra vuelve a chequear de cero). */
function reiniciarVigilanteUptimeRobot() {
  PropertiesService.getScriptProperties().deleteProperty(VIG_UR_PROP_ESTADO);
  Logger.log('[VigUR] Estado borrado.');
}

// Estado del vigilante como objeto simple con fechas ISO (para el panel admin). [→ Contexto_Base_Web.md §45B008]
function getEstadoVigilanteUptimeRobot_() {
  var est = _vigUrLeerEstado_();
  var iso = function (ms) { return ms ? new Date(ms).toISOString() : null; };
  return {
    claveConfigurada: !!PropertiesService.getScriptProperties().getProperty(VIG_UR_PROP_API_KEY),
    fallbackActivo: !!est.fallbackActivo,
    desde: iso(est.desde),
    motivo: est.motivo || '',
    urStatus: est.urStatus,
    ultimoChequeo: iso(est.ultimoChequeo),
    ultimoChequeoOk: iso(est.ultimoChequeoOk),
    fallosApi: est.fallosApi || 0,
    ultimoPing: iso(est.ultimoPing),
    ultimoPingMs: est.ultimoPingMs || 0,
    ultimoPingDormido: !!est.ultimoPingDormido
  };
}

// ---------------------------------------------------------------------------
// FUNCIÓN TEMPORAL: pegar la clave en API_KEY, ejecutar UNA vez y BORRAR esta función (o vaciar las comillas) para no dejar la clave escrita en el código. [→ Contexto_Base_Web.md §45B009]
// ---------------------------------------------------------------------------
function configurarUptimeRobotTemporal() {
  var API_KEY = '';      // <- pegar aqui la clave de UptimeRobot (read-only o de monitor especifico)
  var MONITOR_ID = '';   // <- opcional: id numerico del monitor del proxy. Dejar vacio para buscarlo por la URL.

  var props = PropertiesService.getScriptProperties();
  if (!API_KEY) { Logger.log('[VigUR] Falta pegar la clave en API_KEY dentro de configurarUptimeRobotTemporal().'); return; }
  props.setProperty(VIG_UR_PROP_API_KEY, API_KEY.trim());
  if (MONITOR_ID) props.setProperty(VIG_UR_PROP_MONITOR_ID, String(MONITOR_ID).trim());
  else props.deleteProperty(VIG_UR_PROP_MONITOR_ID);
  props.deleteProperty(VIG_UR_PROP_ESTADO); // empezar de cero

  var leida = props.getProperty(VIG_UR_PROP_API_KEY) || '';
  Logger.log('[VigUR] Guardada. Clave leida de vuelta: ' + (leida ? leida.substring(0, 4) + '...' + leida.substring(leida.length - 3) +
    ' (' + leida.length + ' caracteres)' : 'VACIA (no se guardo)') +
    ' | monitor id: ' + (props.getProperty(VIG_UR_PROP_MONITOR_ID) || '(se buscara por URL)') +
    '. Ahora ejecuta vigilarUptimeRobotAhora() y despues borra esta funcion.');
}