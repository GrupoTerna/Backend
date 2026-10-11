// ==============================================================================
// 38_Web_Endpoints.gs
// Routers web globales de Apps Script (doGet/doPost). Cada accion delega a la
// funcion de su dominio; este archivo solo enruta + implementa dashboard y contactos, que no
// tenian un dominio propio.
// ==============================================================================

// AVISOS ABIERTOS (28-sep-2026, Fase 3): VERIFICAR en guerra.html el orden Líder/Colíderes/Veteranos/Miembros (Fase 3b, _ordenRango); PENDIENTE DE DEFINIR Fase 3a (cuentas sin ceros); PRUEBA PENDIENTE en Apps Script real de sesionVencida:true (_webMarcarSesionVencida, 03-oct-2026). [→ Contexto_Base_Web.md §38B001]

// ----- Variables y constantes -----

// Texto de cabecera de 09_API_ClashRoyale.gs que quedó pegado aquí: cache de API en Drive (carpetas, nombre de archivo T-/S-/P.I-, un archivo vigente por /players) y endpoint seguro de contactos (doGet). [→ Contexto_Base_Web.md §38B002]

// Token de seguridad del endpoint de contactos: vive en Script Properties vía _scriptToken() (B-35, 15-sep-2026); sin literal de respaldo en el código (19-sep-2026). [→ Contexto_Base_Web.md §38B003]
var CONTACTOS_TOKEN = _scriptToken('CONTACTOS_TOKEN');

// Token del dashboard de administradores (?dashboard=1): solo en Script Properties; el valor anterior se expuso en el repo (B-29), ya no hay literal; se rota editando la Property. [→ Contexto_Base_Web.md §38B004]
var DASHBOARD_TOKEN = _scriptToken('DASHBOARD_TOKEN');

// Token de corrección de guerra (Tampermonkey): GET ?accion=listaCorreccionGuerra, POST corregirGuerra; movido a Script Properties (B-35). [→ Contexto_Base_Web.md §38B005]
var CORRECCION_GUERRA_TOKEN = _scriptToken('CORRECCION_GUERRA_TOKEN');

// Rate limit básico de acciones web* (CacheService): tope GLOBAL por minuto, no por IP, porque Apps Script no expone la IP del cliente; WEB_MEMBER_TOKEN es visible en el JS del sitio (30-ago-2026). [→ Contexto_Base_Web.md §38B006]
var WEB_RATE_LIMIT_MAX_POR_MINUTO = 180; // FIX B-30 (18-sep-2026): tope subido de 90 a 180 por minuto. [→ Contexto_Base_Web.md §38B007]

// FIX B-30: contador aparte (tope 240/min) para pedidos con sessionToken de admin válido, para que el tráfico público no bloquee el panel. [→ Contexto_Base_Web.md §38B008]
var WEB_RATE_LIMIT_ADMIN_MAX_POR_MINUTO = 240;

// _webRateLimitExcedido(sessionTokenValido): true si se superó el tope web* en la ventana de 60 s; bucket propio 'WEBRLADM_' para admin válido; si CacheService falla, deja pasar; no valida el token. [→ Contexto_Base_Web.md §38B009]
function _webRateLimitExcedido(sessionTokenValido) {
  try {
    var cache = CacheService.getScriptCache();
    var ventana = Math.floor(Date.now() / 60000); // bucket de 60s
    var prefijo = sessionTokenValido ? 'WEBRLADM_' : 'WEBRL_';
    var tope = sessionTokenValido ? WEB_RATE_LIMIT_ADMIN_MAX_POR_MINUTO : WEB_RATE_LIMIT_MAX_POR_MINUTO;
    var key = prefijo + ventana;
    var actual = Number(cache.get(key) || 0);
    if (actual >= tope) return true;
    cache.put(key, String(actual + 1), 70); // TTL 70s: un poco más que la ventana, por las dudas
    return false;
  } catch (e) {
    Logger.log('[WebRateLimit] Error verificando límite, se deja pasar el pedido: ' + e.message);
    return false;
  }
}

// _webRespuesta429(): error 429 con la misma forma que las respuestas 401/500 de doGet(). [→ Contexto_Base_Web.md §38B010]
function _webRespuesta429() {
  return ContentService
    .createTextOutput(JSON.stringify({ error: 'Demasiados pedidos. Probá de nuevo en un minuto.', code: 429 }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Rate limit específico del login de admin (webLogin, doPost): por Celular, no por IP, para frenar fuerza bruta dirigida (30-ago-2026). [→ Contexto_Base_Web.md §38B011]
var WEB_LOGIN_RATE_LIMIT_MAX = 5;          // intentos máximos por celular...
var WEB_LOGIN_RATE_LIMIT_VENTANA_SEG = 300; // ...en esta ventana (5 min)

// _webLoginRateLimitExcedido(celular): true si se superaron los intentos de login del celular en la ventana; cuenta cada intento (exitoso o no); clave fija si el celular viene vacío; si CacheService falla, deja pasar. [→ Contexto_Base_Web.md §38B012]
function _webLoginRateLimitExcedido(celular) {
  try {
    var cache = CacheService.getScriptCache();
    var celularKey = soloDigitos(celular) || '_sin_celular_';
    var ventana = Math.floor(Date.now() / (WEB_LOGIN_RATE_LIMIT_VENTANA_SEG * 1000));
    var key = 'WEBLOGINRL_' + celularKey + '_' + ventana;
    var actual = Number(cache.get(key) || 0);
    if (actual >= WEB_LOGIN_RATE_LIMIT_MAX) return true;
    cache.put(key, String(actual + 1), WEB_LOGIN_RATE_LIMIT_VENTANA_SEG + 10); // TTL un poco mayor que la ventana
    return false;
  } catch (e) {
    Logger.log('[WebLoginRateLimit] Error verificando límite, se deja pasar el pedido: ' + e.message);
    return false;
  }
}

// _webRespuesta429Login(): igual que _webRespuesta429() con mensaje propio de intentos de login. [→ Contexto_Base_Web.md §38B013]
function _webRespuesta429Login() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: false, error: 'Demasiados intentos de inicio de sesión. Espera unos minutos e intenta de nuevo.', code: 429 }))
    .setMimeType(ContentService.MimeType.JSON);
}

// _webMarcarSesionVencida(resultado, sessionToken, esAdminValido): agrega sesionVencida:true (copia superficial) cuando llega un sessionToken no vacío e inválido; no toca errores ni no-objetos; se aplica en doGet() después de las cachés (03-oct-2026, tanda 3). [→ Contexto_Base_Web.md §38B014]
function _webMarcarSesionVencida(resultado, sessionToken, esAdminValido) {
  try {
    if (!sessionToken) return resultado;
    if (!resultado || typeof resultado !== 'object' || Array.isArray(resultado)) return resultado;
    if (resultado.error) return resultado;
    var valido = (typeof esAdminValido === 'boolean') ? esAdminValido : !!_webAuthValidar(sessionToken);
    if (valido) return resultado;
    var copia = {};
    for (var k in resultado) {
      if (Object.prototype.hasOwnProperty.call(resultado, k)) copia[k] = resultado[k];
    }
    copia.sesionVencida = true;
    return copia;
  } catch (err) {
    Logger.log('[Web] _webMarcarSesionVencida: ' + err.toString());
    return resultado;
  }
}

// ----- Funciones manuales / punto de entrada -----

// Endpoint seguro de contactos (doGet sin ?dashboard): JSON con tag, nombre y teléfono de activos Terna con celular, protegido por CONTACTOS_TOKEN; lo consume admingrupoterna@gmail.com. [→ Contexto_Base_Web.md §38B015]

// doGet(e): handler GET del Web App; sin ?dashboard=1 devuelve contactos (CONTACTOS_TOKEN), con ?dashboard=1 el dashboard HTML (DASHBOARD_TOKEN). [→ Contexto_Base_Web.md §38B016]
function doGet(e) {
  // Verificación del webhook de WhatsApp (Meta hace este GET una vez): devuelve hub.challenge si hub.verify_token coincide con Script Properties. [→ Contexto_Base_Web.md §38B017]
  if (e && e.parameter && e.parameter['hub.mode'] === 'subscribe') {
    var verifyToken = PropertiesService.getScriptProperties().getProperty('WHATSAPP_VERIFY_TOKEN');
    if (e.parameter['hub.verify_token'] === verifyToken) {
      return ContentService.createTextOutput(e.parameter['hub.challenge']);
    }
    return ContentService.createTextOutput('Verify token incorrecto');
  }

  // Modo ?dashboard=json (24-ago-2026): mismo token y fuente que el dashboard HTML pero devuelve JSON crudo; se resuelve antes del modo HTML. [→ Contexto_Base_Web.md §38B018]
  if (e && e.parameter && e.parameter.dashboard === 'json') {
    if (e.parameter.token !== DASHBOARD_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_getDatosDashboard()))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  if (e && e.parameter && e.parameter.dashboard) {
    if (e.parameter.token !== DASHBOARD_TOKEN) {
      return HtmlService.createHtmlOutput('<p style="font-family:sans-serif;padding:24px">🔒 No autorizado.</p>');
    }
    try {
      return HtmlService.createHtmlOutput(_generarDashboardHtml())
        .setTitle('Dashboard - Familia Terna')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
    } catch (err) {
      Logger.log('[Web] Error interno generando el dashboard: ' + err.toString());
      return HtmlService.createHtmlOutput('<p style="font-family:sans-serif;padding:24px">⚠️ Ocurrió un error generando el dashboard. Revisa los logs del proyecto para el detalle.</p>');
    }
  }

  // Endpoint de corrección de guerra (Tampermonkey, 18_CorreccionGuerra.gs): va antes del token de contactos porque usa CORRECCION_GUERRA_TOKEN. [→ Contexto_Base_Web.md §38B019]
  if (e && e.parameter && e.parameter.accion === 'listaCorreccionGuerra') {
    if (e.parameter.token !== CORRECCION_GUERRA_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_obtenerListaCorreccionGuerra({ soloClanes: e.parameter.modo === 'clanes' }))) // PF041: modo=clanes lo usa Verificar semana en curso [→ Contexto_Base_Web.md §PF041]
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
 // Endpoint de candidatos "Nuevos" (Tampermonkey) — ver 14_Nuevos_RoyaleAPI.gs.
  // Mismo patrón que listaCorreccionGuerra, con su propio token.
  if (e && e.parameter && e.parameter.accion === 'listaNuevosRoyaleAPI') {
    if (e.parameter.token !== NUEVOS_ROYALEAPI_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_obtenerListaCandidatosNuevos()))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // Portal web público (37_Web_API.gs), acciones GET web*: se resuelven antes del token de contactos; un solo chequeo de rate limit aquí arriba, con bucket aparte si hay sessionToken de admin válido (FIX B-30). [→ Contexto_Base_Web.md §38B020]
  if (e && e.parameter && typeof e.parameter.accion === 'string' && e.parameter.accion.indexOf('web') === 0) {
    var esAdminValidoGet = !!(e.parameter.sessionToken && _webAuthValidar(e.parameter.sessionToken));
    if (_webRateLimitExcedido(esAdminValidoGet)) return _webRespuesta429();
  }
  if (e && e.parameter && e.parameter.accion === 'webRoster') {
    if (e.parameter.token !== WEB_MEMBER_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webRoster()))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 0 (24-ago-2026): webClanInfo, info real de los 4 clanes Terna (_webClanInfo). [→ Contexto_Base_Web.md §38B021]
  if (e && e.parameter && e.parameter.accion === 'webClanInfo') {
    if (e.parameter.token !== WEB_MEMBER_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webClanInfo()))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FIX 30-ago-2026 (seguridad): webGuerraEnVivo, endpoint público de guerra.html con WEB_MEMBER_TOKEN para dejar de usar DASHBOARD_TOKEN; misma fuente _getDatosDashboard(). CORRECCIÓN 28-sep-2026: sessionToken opcional; sin sesión admin los pendientes salen sin nomMulti ni prestamo. [→ Contexto_Base_Web.md §38B022]
  if (e && e.parameter && e.parameter.accion === 'webGuerraEnVivo') {
    if (e.parameter.token !== WEB_MEMBER_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webMarcarSesionVencida(_webGuerraEnVivo({ esAdmin: _webAuthValidar(e.parameter.sessionToken) }), e.parameter.sessionToken, esAdminValidoGet)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // webGuerraPendientes (NUEVO 08-oct-2026): solo la lista de pendientes, para que guerra.html lea lo demás del archivo estático (GitHub) y un admin con sesión complete nomMulti/prestamo sin bajar los ~920 KB de webGuerraEnVivo. Mismo token público; sin sesión admin válida sale la versión de visitante.
  if (e && e.parameter && e.parameter.accion === 'webGuerraPendientes') {
    if (e.parameter.token !== WEB_MEMBER_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      var resPend = _webGuerraEnVivo({ esAdmin: _webAuthValidar(e.parameter.sessionToken) });
      return ContentService
        .createTextOutput(JSON.stringify(_webMarcarSesionVencida({ pendientes: (resPend && resPend.pendientes) || [] }, e.parameter.sessionToken, esAdminValidoGet)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // webPronosticoGuerra (19-sep-2026): techo de fame de cada clan con los mazos que le quedan (21_Pronostico_Guerra.gs); mismo token público que webGuerraEnVivo. [→ Contexto_Base_Web.md §38B023]
  if (e && e.parameter && e.parameter.accion === 'webPronosticoGuerra') {
    if (e.parameter.token !== WEB_MEMBER_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webPronosticoGuerra()))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // CAMBIO 28-sep-2026 (Fase 5b A): webPerfil acepta sessionToken opcional; con sesión válida una cuenta de Inactivos sale 'Inactivo', si no 'Sin registro con nosotros'. [→ Contexto_Base_Web.md §38B024]
  if (e && e.parameter && e.parameter.accion === 'webPerfil') {
    if (e.parameter.token !== WEB_MEMBER_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webMarcarSesionVencida(_webPerfilJugador(e.parameter.tag, { esAdmin: _webAuthValidar(e.parameter.sessionToken) }), e.parameter.sessionToken, esAdminValidoGet)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 1 (24-ago-2026): webTorneos, listado y ganadores del más reciente. CAMBIO 28-sep-2026 (Fase 5b D, A9): se pasa {esAdmin} para decidir si el Tag de un participante oculto sale real o null. [→ Contexto_Base_Web.md §38B025]
  if (e && e.parameter && e.parameter.accion === 'webTorneos') {
    if (e.parameter.token !== WEB_MEMBER_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webMarcarSesionVencida(_webTorneos({ esAdmin: _webAuthValidar(e.parameter.sessionToken) }), e.parameter.sessionToken, esAdminValidoGet)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 9 (30-ago-2026): webHistorialTorneos, top 3 de cada torneo (salón de la fama); mismo {esAdmin} que webTorneos (Fase 5b D, A9). [→ Contexto_Base_Web.md §38B026]
  if (e && e.parameter && e.parameter.accion === 'webHistorialTorneos') {
    if (e.parameter.token !== WEB_MEMBER_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webMarcarSesionVencida(_webHistorialTorneos({ esAdmin: _webAuthValidar(e.parameter.sessionToken) }), e.parameter.sessionToken, esAdminValidoGet)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 10 (30-ago-2026): webRankings, top 10 de donadores/racha/torneos/victorias (_webRankings). [→ Contexto_Base_Web.md §38B027]
  if (e && e.parameter && e.parameter.accion === 'webRankings') {
    if (e.parameter.token !== WEB_MEMBER_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webRankings()))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 10 (30-ago-2026): webAniversarios, aniversarios en la Familia (_webAniversarios). [→ Contexto_Base_Web.md §38B028]
  if (e && e.parameter && e.parameter.accion === 'webAniversarios') {
    if (e.parameter.token !== WEB_MEMBER_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAniversarios()))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 10 (30-ago-2026): webCompararJugadores (tag1/tag2); sessionToken opcional desde el 28-sep-2026 (Fase 5b A). [→ Contexto_Base_Web.md §38B029]
  if (e && e.parameter && e.parameter.accion === 'webCompararJugadores') {
    if (e.parameter.token !== WEB_MEMBER_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webMarcarSesionVencida(_webCompararJugadores(e.parameter.tag1, e.parameter.tag2, { esAdmin: _webAuthValidar(e.parameter.sessionToken) }), e.parameter.sessionToken, esAdminValidoGet)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 25 (02-sep-2026): webHistorialGuerraComparador, historial diario de Ataques y Fame de los dos Tags; sessionToken opcional (Fase 5b A3), sin sesión admin el lado inactivo sale vacío. [→ Contexto_Base_Web.md §38B030]
  if (e && e.parameter && e.parameter.accion === 'webHistorialGuerraComparador') {
    if (e.parameter.token !== WEB_MEMBER_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webMarcarSesionVencida(_webHistorialGuerraComparador(e.parameter.tag1, e.parameter.tag2, { esAdmin: _webAuthValidar(e.parameter.sessionToken) }), e.parameter.sessionToken, esAdminValidoGet)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 13 (07-sep-2026): webGuerraLog, histórico Temporada→Semana→Rank/Boat/Trophy desde Guerra_Logs (fallback Backup_Guerra_Logs.csv, FIX 15-sep-2026); tag opcional, uno no Terna devuelve clanes:[] (_webGuerraLog, 17_GuerraSheet.gs). [→ Contexto_Base_Web.md §38B031]
  if (e && e.parameter && e.parameter.accion === 'webGuerraLog') {
    if (e.parameter.token !== WEB_MEMBER_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webGuerraLog(e.parameter.tag)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // webGuerraPuestosDia (19-sep-2026): puesto de cada clan Terna al cierre de cada día Jue-Dom de la última semana en Guerra_Logs; el día en curso queda en 0 y guerra.html lo toma de webPronosticoGuerra. [→ Contexto_Base_Web.md §38B032]
  if (e && e.parameter && e.parameter.accion === 'webGuerraPuestosDia') {
    if (e.parameter.token !== WEB_MEMBER_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webGuerraPuestosDia()))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 10 (30-ago-2026): webEstadisticasCartas, top 10 de cartas más usadas; depende de PLAYERS_API_ENABLED (puede devolver top10 vacío). [→ Contexto_Base_Web.md §38B033]
  if (e && e.parameter && e.parameter.accion === 'webEstadisticasCartas') {
    if (e.parameter.token !== WEB_MEMBER_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webEstadisticasCartas()))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 6 (28-ago-2026): webIngresosRecientes, reemplaza la sección Torneos de index.html; sessionToken opcional (Fase 5b B): sin sesión admin no salen esRivalTemporada ni clanRivalDetectado. [→ Contexto_Base_Web.md §38B034]
  if (e && e.parameter && e.parameter.accion === 'webIngresosRecientes') {
    if (e.parameter.token !== WEB_MEMBER_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webMarcarSesionVencida(_webIngresosRecientes({ esAdmin: _webAuthValidar(e.parameter.sessionToken) }), e.parameter.sessionToken, esAdminValidoGet)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 8 (30-ago-2026): webAscensosRecientes, solo Ascensos (nunca Degradaciones ni cambios de cuentas Administradoras). [→ Contexto_Base_Web.md §38B035]
  if (e && e.parameter && e.parameter.accion === 'webAscensosRecientes') {
    if (e.parameter.token !== WEB_MEMBER_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAscensosRecientes()))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 7 (29-ago-2026): webTorneosJugador, torneos de un jugador (botón Ver Torneos); sessionToken opcional (Fase 5b A3), una cuenta inactiva sin sesión admin responde torneos:[]. [→ Contexto_Base_Web.md §38B036]
  if (e && e.parameter && e.parameter.accion === 'webTorneosJugador') {
    if (e.parameter.token !== WEB_MEMBER_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webMarcarSesionVencida(_webTorneosJugador(e.parameter.tag, { esAdmin: _webAuthValidar(e.parameter.sessionToken) }), e.parameter.sessionToken, esAdminValidoGet)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // NUEVO 27-sep-2026: webCofresJugador, ciclo de cofres de un jugador. CAMBIO 29-sep-2026: lee el JSON de Drive (una descarga por Tag y por día, Lima), no la API en vivo; un no admin solo ve miembros activos; admin con panel de permisos puede mandar forzar=1 (AVISO A8, 37_Web_API.gs). [→ Contexto_Base_Web.md §38B037]
  if (e && e.parameter && e.parameter.accion === 'webCofresJugador') {
    if (e.parameter.token !== WEB_MEMBER_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webMarcarSesionVencida(_webCofresJugador(e.parameter.tag, _webOpcionesCofresBattlelog(e.parameter)), e.parameter.sessionToken, esAdminValidoGet)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // NUEVO 27-sep-2026: webBattlelogJugador, batallas recientes de un jugador. El comentario original decía que llamaba en vivo a la API; desde el 29-sep-2026 lee el JSON de Drive igual que webCofresJugador (ver nota en el .md). [→ Contexto_Base_Web.md §38B038]
  if (e && e.parameter && e.parameter.accion === 'webBattlelogJugador') {
    if (e.parameter.token !== WEB_MEMBER_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webMarcarSesionVencida(_webBattlelogJugador(e.parameter.tag, _webOpcionesCofresBattlelog(e.parameter)), e.parameter.sessionToken, esAdminValidoGet)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  if (e && e.parameter && e.parameter.accion === 'webAdminBuscarMiembro') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminBuscarMiembro(e.parameter.sessionToken, e.parameter.tag)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FIX 09-sep-2026: webAdminBuscarMiembroSugerencias (parámetro q), sugerencias por nombre/Nom_Multi/Tag; sesión validada dentro. [→ Contexto_Base_Web.md §38B039]
  if (e && e.parameter && e.parameter.accion === 'webAdminBuscarMiembroSugerencias') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminBuscarMiembroSugerencias(e.parameter.sessionToken, e.parameter.q)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 2 (04-sep-2026): webHistorialGuerraJugador, historial completo de guerra de un jugador, solo admin (20_HistorialGuerraJugador.gs); parámetro opcional limite (semanas más recientes), re-aplicado 19-sep-2026. [→ Contexto_Base_Web.md §38B040]
  if (e && e.parameter && e.parameter.accion === 'webHistorialGuerraJugador') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webHistorialGuerraJugador(e.parameter.sessionToken, e.parameter.tag, e.parameter.limite)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FIX 03-sep-2026 (punto 17): webMisCuentas, lista de cuentas del admin; sesión validada dentro de _webMisCuentas(). [→ Contexto_Base_Web.md §38B041]
  if (e && e.parameter && e.parameter.accion === 'webMisCuentas') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webMisCuentas(e.parameter.sessionToken)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 2 (24-ago-2026): webAdminCategorias, visor SOLO LECTURA del contenido por categoría (Menú/Mensajes se reconstruyen en cada corrida, no hay guardado). [→ Contexto_Base_Web.md §38B042]
  if (e && e.parameter && e.parameter.accion === 'webAdminCategorias') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminCategorias(e.parameter.sessionToken)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  if (e && e.parameter && e.parameter.accion === 'webAdminContenido') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminContenido(e.parameter.sessionToken, e.parameter.categoria)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FIX 05-sep-2026: webAportesInactivos, panel 'Aportes de Inactivos a la Guerra' de guerra.html; sesión validada dentro; a propósito NO va en _getDatosDashboard/webGuerraEnVivo porque quién es Inactivo es información de gestión interna. [→ Contexto_Base_Web.md §38B043]
  if (e && e.parameter && e.parameter.accion === 'webAportesInactivos') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAportesInactivos(e.parameter.sessionToken)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FIX 03-sep-2026: webAdminContenidoDocHtml, HTML del Doc para pintarlo en un <div> propio (el iframe /preview pagina con márgenes); SOLO LECTURA (_webAdminContenidoDocHtml, 37_Web_API.gs). [→ Contexto_Base_Web.md §38B044]
  if (e && e.parameter && e.parameter.accion === 'webAdminContenidoDocHtml') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminContenidoDocHtml(e.parameter.sessionToken, e.parameter.docId)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 3 (25-ago-2026): webAdminTorneosHoy, gestión de torneos desde el panel. FASE 24 (02-sep-2026): 'Ver ganadores' pasó a webAdminGanadoresTorneoDetalle (solo admin, con Tag). [→ Contexto_Base_Web.md §38B045]
  if (e && e.parameter && e.parameter.accion === 'webAdminTorneosHoy') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminTorneosHoy(e.parameter.sessionToken)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FIX 11-sep-2026: webAdminSemanasRecientes, selector de semanas con backend real (_webAdminSemanasRecientes). FIX 16-sep-2026: parámetro opcional todasSemanasVigente ('1' solo para el selector de CR_Lista). [→ Contexto_Base_Web.md §38B046]
  if (e && e.parameter && e.parameter.accion === 'webAdminSemanasRecientes') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminSemanasRecientes(e.parameter.sessionToken, e.parameter.todasSemanasVigente)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // NUEVO 07-oct-2026: webAdminSemanasDeTemporada, todas las semanas de una temporada con su rango de fechas (parámetro temporada), para el selector de CR_Lista. [→ Contexto_Base_Web.md §38B047]
  if (e && e.parameter && e.parameter.accion === 'webAdminSemanasDeTemporada') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminSemanasDeTemporada(e.parameter.sessionToken, e.parameter.temporada)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // NUEVO 12-sep-2026: webAdminRequisitosClanes, requisitos por clan del torneo más reciente de T_Lista para precargar admin.html. FIX 12-sep-2026: parámetro opcional id (caso Modificar). [→ Contexto_Base_Web.md §38B048]
  if (e && e.parameter && e.parameter.accion === 'webAdminRequisitosClanes') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminRequisitosClanes(e.parameter.sessionToken, e.parameter.id)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // NUEVO 16-sep-2026: webAdminUltimoRegistro (categoria 'Torneo'|'Sorteo'), precarga Organizador/Cuenta organizadora/Comentario del último registro; Cambio de Rango reutiliza webCRListaListar/webCRListaFilaPorId. [→ Contexto_Base_Web.md §38B049]
  if (e && e.parameter && e.parameter.accion === 'webAdminUltimoRegistro') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminUltimoRegistroTorneoOSorteo(e.parameter.sessionToken, e.parameter.categoria)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // NUEVO 12-sep-2026: webAdminClanesFamilia, los 4 clanes de la Familia para quitar CLANES_REQUISITOS hardcodeado de admin.html. [→ Contexto_Base_Web.md §38B050]
  if (e && e.parameter && e.parameter.accion === 'webAdminClanesFamilia') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminClanesFamilia(e.parameter.sessionToken)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // NUEVO 18-sep-2026: webAdminListaMiembrosClan, miembros ACTIVOS de un clan para 'Buscar en Directorio' de Registrar miembro nuevo; requiere esa Función. [→ Contexto_Base_Web.md §38B051]
  if (e && e.parameter && e.parameter.accion === 'webAdminListaMiembrosClan') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminListaMiembrosClan(e.parameter.sessionToken, e.parameter.clan)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // NUEVO 13-sep-2026: enrutamiento de webCRListaListar / webCRListaFilaPorId / webCRListaPropuestas (Cambio de Rango, Fase 7); las funciones existían pero doGet no las reconocía y fallaban en silencio. [→ Contexto_Base_Web.md §38B052]
  if (e && e.parameter && e.parameter.accion === 'webCRListaListar') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webCRListaListar(e.parameter.sessionToken)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  if (e && e.parameter && e.parameter.accion === 'webCRListaFilaPorId') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webCRListaFilaPorId(e.parameter.sessionToken, e.parameter.id)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  if (e && e.parameter && e.parameter.accion === 'webCRListaPropuestas') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webCRListaPropuestas(e.parameter.sessionToken, e.parameter.idAscenso, e.parameter.idDescenso)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // NUEVO 13-sep-2026: webAdminVigenteListar, parámetro categoria 'Torneo'|'Sorteo' en el query string. [→ Contexto_Base_Web.md §38B053]
  if (e && e.parameter && e.parameter.accion === 'webAdminVigenteListar') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminVigenteListar(e.parameter.sessionToken, e.parameter.categoria)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // NUEVO 12-sep-2026 (sección 5.4): webAdminRequisitosClanesSorteo, gemela de webAdminRequisitosClanes para Sorteos, con id opcional. [→ Contexto_Base_Web.md §38B054]
  if (e && e.parameter && e.parameter.accion === 'webAdminRequisitosClanesSorteo') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminRequisitosClanesSorteo(e.parameter.sessionToken, e.parameter.id)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // NUEVO 12-sep-2026 (sección 5.4): webAdminSorteosHoy, puebla el selector 'Modificar' del panel de Sorteos. [→ Contexto_Base_Web.md §38B055]
  if (e && e.parameter && e.parameter.accion === 'webAdminSorteosHoy') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminSorteosHoy(e.parameter.sessionToken)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 24 (02-sep-2026): webAdminGanadoresTorneoDetalle, ganadores del más reciente con Tag (solo admin) para descalificaciones y desempates. [→ Contexto_Base_Web.md §38B056]
  if (e && e.parameter && e.parameter.accion === 'webAdminGanadoresTorneoDetalle') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminGanadoresTorneoDetalle(e.parameter.sessionToken)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 4 (26-ago-2026): webAdminVerificarTag, Paso 1 del registro de miembro nuevo (verifica el Tag contra la API); GET porque no escribe. [→ Contexto_Base_Web.md §38B057]
  if (e && e.parameter && e.parameter.accion === 'webAdminVerificarTag') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminVerificarTag(e.parameter.sessionToken, e.parameter.tag)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 4: lista de Nom_Multi existentes para el <select> del Paso 2 del
  // registro — ver _webAdminNomMultisExistentes() en 37_Web_API.gs.
  if (e && e.parameter && e.parameter.accion === 'webAdminNomMultisExistentes') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminNomMultisExistentes(e.parameter.sessionToken)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FIX 05-sep-2026: webAdminNomMultisAdmins, Nom_Multi solo de ADMINS para '¿Quién organizó el torneo?'. [→ Contexto_Base_Web.md §38B058]
  if (e && e.parameter && e.parameter.accion === 'webAdminNomMultisAdmins') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminNomMultisAdmins(e.parameter.sessionToken)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FIX 12-sep-2026: webAdminCuentasDeNomMulti, cuentas de un Nom_Multi con Clan/ClanTag desde Directorio ('¿Con cuál cuenta organizó?'). [→ Contexto_Base_Web.md §38B059]
  if (e && e.parameter && e.parameter.accion === 'webAdminCuentasDeNomMulti') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminCuentasDeNomMulti(e.parameter.sessionToken, e.parameter.nomMulti)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 7 (29-ago-2026): webAdminCuentasInactivas, tarjeta de cuentas inactivas en Inicio/Clanes, solo con sesión de admin. [→ Contexto_Base_Web.md §38B060]
  if (e && e.parameter && e.parameter.accion === 'webAdminCuentasInactivas') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminCuentasInactivas(e.parameter.sessionToken)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 7 (29-ago-2026): webAdminOtrasCuentas, botón 'Ver otras cuentas' del perfil, solo admins. [→ Contexto_Base_Web.md §38B061]
  if (e && e.parameter && e.parameter.accion === 'webAdminOtrasCuentas') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminOtrasCuentas(e.parameter.sessionToken, e.parameter.tag)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 3 (plan de cambios web): webAdminParticipacionHoyGuerra, cuentas reservadas vs disponibles por clan Terna y un mismo Tag atacando en más de un clan; GET, sesión de admin. [→ Contexto_Base_Web.md §38B062]
  if (e && e.parameter && e.parameter.accion === 'webAdminParticipacionHoyGuerra') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminParticipacionHoyGuerra(e.parameter.sessionToken)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 8 (30-ago-2026): webSorteoCalificados, autocompleta la Ruleta de Sorteo con los calificados según la fila más reciente de cada clan en S_Lista; GET, sesión de admin. [→ Contexto_Base_Web.md §38B063]
  if (e && e.parameter && e.parameter.accion === 'webSorteoCalificados') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webSorteoCalificados(e.parameter.sessionToken)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 6: webAdminBuscarInfiltrado, coincidencias de un Tag contra Directorio/Inactivos/Vetados, clanes rivales de la temporada y lista manual de conflicto (15_DeteccionInfiltrados.gs); GET, sesión de admin. [→ Contexto_Base_Web.md §38B064]
  if (e && e.parameter && e.parameter.accion === 'webAdminBuscarInfiltrado') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminBuscarInfiltrado(e.parameter.sessionToken, e.parameter.tag)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // FASE 7 Parte B (06-sep-2026): webAdminAscensosEditables, últimos registros de Historial_A/D con Autor y Comentario (24_Historial_Ascensos.gs); GET, sesión de admin. [→ Contexto_Base_Web.md §38B065]
  if (e && e.parameter && e.parameter.accion === 'webAdminAscensosEditables') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminAscensosEditables(e.parameter.sessionToken)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // NUEVO 05-oct-2026 (Fase 9 e): webAdminNoticiasSemana, resumen de una semana (parámetro lunesIso); GET solo lectura, sesión de admin (40_Web_Noticias.gs). [→ Contexto_Base_Web.md §38B066]
  if (e && e.parameter && e.parameter.accion === 'webAdminNoticiasSemana') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminNoticiasSemana(e.parameter.sessionToken, e.parameter.lunesIso)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // PANEL DE PERMISOS (19-sep-2026): webAdminMisPermisos (cualquier admin con sesión) y webPermisosListar (solo el Celular de la Script Property PANEL_PERMISOS_CELULAR); ambas GET. [→ Contexto_Base_Web.md §38B067]
  if (e && e.parameter && e.parameter.accion === 'webAdminMisPermisos') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminMisPermisos(e.parameter.sessionToken)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  if (e && e.parameter && e.parameter.accion === 'webPermisosListar') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webPermisosListar(e.parameter.sessionToken)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // NUEVO (05-oct-2026): estado de la actualizacion manual de roster pedida desde la web. GET, SOLO LECTURA, requiere
  // sesion de admin con la Funcion 'Actualizar roster'. Ver _webAdminEstadoActualizacion() en 41_Web_ActualizarRoster.gs.
  if (e && e.parameter && e.parameter.accion === 'webAdminEstadoActualizacion') {
    try {
      return ContentService
        .createTextOutput(JSON.stringify(_webAdminEstadoActualizacion(e.parameter.sessionToken)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      Logger.log('[Web] Error interno: ' + err.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // 1. Validar token
  if (!e || !e.parameter || e.parameter.token !== CONTACTOS_TOKEN) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var contactos = _generarJsonContactos();
    return ContentService
      .createTextOutput(JSON.stringify(contactos, null, 2))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    Logger.log('[Web] Error interno: ' + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// testContactosEndpoint(): prueba manual, imprime el JSON de contactos en el Logger. [→ Contexto_Base_Web.md §38B068]
function testContactosEndpoint() {
  var contactos = _generarJsonContactos();
  Logger.log('[Test] Total contactos: ' + contactos.length);
  Logger.log(JSON.stringify(contactos, null, 2));
}

// testDashboardEndpoint(): prueba manual de la generación del dashboard sin pasar por el Web App (descarta un despliegue desactualizado). [→ Contexto_Base_Web.md §38B069]
function testDashboardEndpoint() {
  var datos = _getDatosDashboard();
  Logger.log('[Test] Temporada ' + datos.ctx.temporada + ' | Semana ' + (datos.ctx.sectionIndex + 1) +
             ' | Día ' + datos.ctx.diaLetra + ' | esDiaGuerra: ' + datos.ctx.esDiaGuerra);
  Logger.log('[Test] Clanes con datos de guerra hoy: ' + Object.keys(datos.guerraPorClan).length);
  Logger.log('[Test] Pendientes de atacar: ' + datos.pendientes.length);
  Logger.log('[Test] Clanes en resumen de Directorio: ' + Object.keys(datos.resumenClanes).length);
  Logger.log('[Test] Miembros nuevos: ' + datos.nuevos.length);

  var html = _generarDashboardHtml();
  Logger.log('[Test] HTML generado OK (' + html.length + ' caracteres).');
}

// testTamanioGuerraEnVivo(): NUEVO 08-oct-2026, diagnostico (solo Logger.log, no cambia resultados); mide cuanto tarda y cuanto pesa el JSON de webGuerraEnVivo, y cuanto aporta cada clave de primer nivel, para ver si el 404 del redirect 'echo' es por tamaño de respuesta.
function testTamanioGuerraEnVivo() {
  // 08-oct-2026: la pagina manda sessionToken (esAdmin puede ser true), asi que se mide tambien esa variante; la 2da pasada puede salir de cache.
  [false, true].forEach(function (admin) {
    Logger.log('[Tamaño] ===== esAdmin: ' + admin + ' =====');
    _testTamanioGuerraEnVivoUna_(admin);
  });
}
function _testTamanioGuerraEnVivoUna_(admin) {
  var t0 = Date.now();
  var datos = _webGuerraEnVivo({ esAdmin: admin });
  var ms = Date.now() - t0;
  var json = JSON.stringify(datos);
  Logger.log('[Tamaño] webGuerraEnVivo: ' + ms + ' ms | ' + json.length + ' caracteres (~' + Math.round(json.length / 1024) + ' KB)');
  var partes = [];
  Object.keys(datos || {}).forEach(function (k) {
    var n = JSON.stringify(datos[k] === undefined ? null : datos[k]).length;
    partes.push({ k: k, n: n });
  });
  partes.sort(function (a, b) { return b.n - a.n; });
  partes.slice(0, 8).forEach(function (x) {
    Logger.log('[Tamaño]   ' + x.k + ': ' + Math.round(x.n / 1024) + ' KB (' + Math.round(100 * x.n / json.length) + '%)');
  });
  var vd = datos && datos.valoresDiariosPorSemana;
  if (vd) {
    var inact = 0, total = 0;
    Object.keys(vd).forEach(function (t) { Object.keys(vd[t]).forEach(function (sem) { Object.keys(vd[t][sem]).forEach(function (cl) {
      (vd[t][sem][cl] || []).forEach(function (f) { total++; if (f && f.activo === false) inact++; });
    }); }); });
    Logger.log('[Tamaño] valoresDiariosPorSemana: ' + total + ' filas, ' + inact + ' de inactivos');
  }
}

// doPost(e): router POST del Web App (webhook de Cloud API de WhatsApp, acciones web* del portal y endpoints Tampermonkey); el envío real a graph.facebook.com necesita token y Phone Number ID. El bot hoy está inactivo (sin chip), código conservado. [→ Contexto_Base_Web.md §38B070]
function doPost(e) {
  // Portal web público (login, gestión de miembro; ver 37_Web_API.gs) se resuelve ANTES que los demás accion=. Rate limit de POST web* (30-ago-2026; FIX B-30, 18-sep-2026): se aplica antes de cualquier webXxx; el sessionToken viaja en el body JSON, se intenta parsear para contar en el bucket admin; si no es JSON (ej. webLogin) cuenta como público. [→ Contexto_Base_Web.md §38B071]
  if (e && e.parameter && typeof e.parameter.accion === 'string' && e.parameter.accion.indexOf('web') === 0) {
    var esAdminValidoPost = false;
    try {
      var payloadRL = JSON.parse(e.postData.contents);
      esAdminValidoPost = !!(payloadRL && payloadRL.sessionToken && _webAuthValidar(payloadRL.sessionToken));
    } catch (eRL) {
      esAdminValidoPost = false;
    }
    if (_webRateLimitExcedido(esAdminValidoPost)) return _webRespuesta429();
  }
  if (e && e.parameter && e.parameter.accion === 'webLogin') {
    try {
      var payloadLogin = JSON.parse(e.postData.contents);
      // Rate limit específico de login (30-ago-2026): por Celular y no por IP, porque el tope global compartido igual permitía probar decenas de combinaciones por minuto; ver _webLoginRateLimitExcedido(). [→ Contexto_Base_Web.md §38B072]
      if (_webLoginRateLimitExcedido(payloadLogin && payloadLogin.celular)) {
        return _webRespuesta429Login();
      }
      // FASE 5 (26-ago-2026): el login manda Celular+Clave en vez de una única password; ver _webAuthLogin() en 37_Web_API.gs. [→ Contexto_Base_Web.md §38B073]
      return ContentService
        .createTextOutput(JSON.stringify(_webAuthLogin(payloadLogin && payloadLogin.celular, payloadLogin && payloadLogin.clave)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (errLogin) {
      Logger.log('[Web] Error interno: ' + errLogin.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FIX B-27 (18-sep-2026): webAuthLogout; sessionToken en el body; no valida la sesión porque _webAuthLogout() responde ok:true aunque ya haya vencido (ver 37_Web_API.gs). [→ Contexto_Base_Web.md §38B074]
  if (e && e.parameter && e.parameter.accion === 'webAuthLogout') {
    try {
      var payloadLogout = JSON.parse(e.postData.contents);
      return ContentService
        .createTextOutput(JSON.stringify(_webAuthLogout(payloadLogout && payloadLogout.sessionToken)))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (errLogout) {
      Logger.log('[Web] Error interno: ' + errLogout.toString());
      // Aunque falle el parseo del body, el cliente trata la sesión como cerrada. [→ Contexto_Base_Web.md §38B075]
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  if (e && e.parameter && e.parameter.accion === 'webAdminGuardarGestion') {
    try {
      var payloadGestion = JSON.parse(e.postData.contents);
      var resultadoGestion = _webAdminGuardarGestion(payloadGestion && payloadGestion.sessionToken, payloadGestion && payloadGestion.datos);
      return ContentService
        .createTextOutput(JSON.stringify(resultadoGestion))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (errGestion) {
      Logger.log('[Web] Error interno: ' + errGestion.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 4 (26-ago-2026): webAdminRegistrarNuevo, Paso 2 (guardar; el Tag ya se verificó en el Paso 1 con webAdminVerificarTag, GET); ver _webAdminRegistrarNuevo() en 37_Web_API.gs; sessionToken y datos en el body. [→ Contexto_Base_Web.md §38B076]
  if (e && e.parameter && e.parameter.accion === 'webAdminRegistrarNuevo') {
    try {
      var payloadRegNuevo = JSON.parse(e.postData.contents);
      var resultadoRegNuevo = _webAdminRegistrarNuevo(payloadRegNuevo && payloadRegNuevo.sessionToken, payloadRegNuevo && payloadRegNuevo.datos);
      return ContentService
        .createTextOutput(JSON.stringify(resultadoRegNuevo))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (errRegNuevo) {
      Logger.log('[Web] Error interno: ' + errRegNuevo.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 4: webAdminVetar; datos = { tag, razon, comentario }; ver _webAdminVetar() en 37_Web_API.gs. [→ Contexto_Base_Web.md §38B077]
  if (e && e.parameter && e.parameter.accion === 'webAdminVetar') {
    try {
      var payloadVetar = JSON.parse(e.postData.contents);
      var resultadoVetar = _webAdminVetar(payloadVetar && payloadVetar.sessionToken, payloadVetar && payloadVetar.datos);
      return ContentService
        .createTextOutput(JSON.stringify(resultadoVetar))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (errVetar) {
      Logger.log('[Web] Error interno: ' + errVetar.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // NUEVO (05-oct-2026): webAdminActualizarRoster (POST { sessionToken }); responde ok:true, estado:'pendiente' y el trabajo corre en un disparador de un solo uso; el front consulta con GET webAdminEstadoActualizacion; exige la Función 'Actualizar roster'; ver 41_Web_ActualizarRoster.gs. [→ Contexto_Base_Web.md §38B078]
  if (e && e.parameter && e.parameter.accion === 'webAdminActualizarRoster') {
    try {
      var payloadActRoster = JSON.parse(e.postData.contents);
      var resultadoActRoster = _webAdminActualizarRoster(payloadActRoster && payloadActRoster.sessionToken);
      return ContentService
        .createTextOutput(JSON.stringify(resultadoActRoster))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (errActRoster) {
      Logger.log('[Web] Error interno: ' + errActRoster.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 7 (Parte B, 06-sep-2026): webAdminEditarAutorAscenso, edita el Autor de un registro de Historial_A/D; datos = { id, autorNuevo } con id = Tag+'|'+FechaISO; ver 24_Historial_Ascensos.gs. [→ Contexto_Base_Web.md §38B079]
  if (e && e.parameter && e.parameter.accion === 'webAdminEditarAutorAscenso') {
    try {
      var payloadEditAutorAsc = JSON.parse(e.postData.contents);
      var resultadoEditAutorAsc = _webAdminEditarAutorAscenso(
        payloadEditAutorAsc && payloadEditAutorAsc.sessionToken,
        payloadEditAutorAsc && payloadEditAutorAsc.datos
      );
      return ContentService
        .createTextOutput(JSON.stringify(resultadoEditAutorAsc))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (errEditAutorAsc) {
      Logger.log('[Web] Error interno: ' + errEditAutorAsc.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // PANEL DE PERMISOS (19-sep-2026, pedido de Diana): webPermisosGuardar guarda Funciones y Cat_disp de UN administrador; datos = { id, funciones, categorias }; solo el Celular de la Script Property PANEL_PERMISOS_CELULAR; ver _webPermisosGuardar() en 37_Web_API.gs. [→ Contexto_Base_Web.md §38B080]
  if (e && e.parameter && e.parameter.accion === 'webPermisosGuardar') {
    try {
      var payloadPermisos = JSON.parse(e.postData.contents);
      var resultadoPermisos = _webPermisosGuardar(payloadPermisos && payloadPermisos.sessionToken, payloadPermisos && payloadPermisos.datos);
      return ContentService
        .createTextOutput(JSON.stringify(resultadoPermisos))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (errPermisos) {
      Logger.log('[Web] Error interno: ' + errPermisos.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 3 (25-ago-2026): webAdminTorneoRegistrar (link nuevo) y modificar fecha/hora del de hoy; sessionToken en el body. Historial de fixes (05, 11 y 12-sep-2026) sobre qué campos reenvía hacia _webAdminTorneoRegistrar/_Modificar (tagTorneoPrincipal, autor, semanas, requisitos, comentario, tagOrg/clanOrg/clanTagOrg, premios); detalle en el .md. [→ Contexto_Base_Web.md §38B081]
  if (e && e.parameter && e.parameter.accion === 'webAdminTorneoRegistrar') {
    try {
      var payloadTReg = JSON.parse(e.postData.contents);
      var resultadoTReg = _webAdminTorneoRegistrar(
        payloadTReg && payloadTReg.sessionToken,
        payloadTReg && payloadTReg.link,
        payloadTReg && payloadTReg.fecha,
        payloadTReg && payloadTReg.hora,
        payloadTReg && payloadTReg.tagTorneoPrincipal,
        payloadTReg && payloadTReg.autor,
        payloadTReg && payloadTReg.semanas,
        payloadTReg && payloadTReg.requisitos,
        payloadTReg && payloadTReg.comentario,
        payloadTReg && payloadTReg.tagOrg,
        payloadTReg && payloadTReg.clanOrg,
        payloadTReg && payloadTReg.clanTagOrg
      );
      return ContentService
        .createTextOutput(JSON.stringify(resultadoTReg))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (errTReg) {
      Logger.log('[Web] Error interno: ' + errTReg.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FIX (05-sep-2026): webAdminTorneoPlanificarGuardar, mismo patrón que Registrar pero carga Fecha+Premios con anticipación, sin link real; ver _webAdminTorneoPlanificarGuardar() en 37_Web_API.gs. [→ Contexto_Base_Web.md §38B082]
  if (e && e.parameter && e.parameter.accion === 'webAdminTorneoPlanificarGuardar') {
    try {
      var payloadTPlan = JSON.parse(e.postData.contents);
      var resultadoTPlan = _webAdminTorneoPlanificarGuardar(
        payloadTPlan && payloadTPlan.sessionToken,
        payloadTPlan && payloadTPlan.fecha,
        payloadTPlan && payloadTPlan.hora,
        payloadTPlan && payloadTPlan.premios,
        payloadTPlan && payloadTPlan.tagTorneoPrincipal,
        payloadTPlan && payloadTPlan.autor,
        payloadTPlan && payloadTPlan.semanas,
        payloadTPlan && payloadTPlan.requisitos,
        payloadTPlan && payloadTPlan.comentario,
        payloadTPlan && payloadTPlan.tagOrg,
        payloadTPlan && payloadTPlan.clanOrg,
        payloadTPlan && payloadTPlan.clanTagOrg
      );
      return ContentService
        .createTextOutput(JSON.stringify(resultadoTPlan))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (errTPlan) {
      Logger.log('[Web] Error interno: ' + errTPlan.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FIX (12-sep-2026, consolidado 5.2/5.3): webAdminTorneoModificar reenvía también payload.link (opción 'Ingresar link' de #tSelectHoy en admin.html), y en ese caso delega a _registrarTorneoDesdeBot() en vez de _modificarFechaHoraTorneo(). [→ Contexto_Base_Web.md §38B083]
  if (e && e.parameter && e.parameter.accion === 'webAdminTorneoModificar') {
    try {
      var payloadTMod = JSON.parse(e.postData.contents);
      var resultadoTMod = _webAdminTorneoModificar(
        payloadTMod && payloadTMod.sessionToken,
        payloadTMod && payloadTMod.id,
        payloadTMod && payloadTMod.fecha,
        payloadTMod && payloadTMod.hora,
        payloadTMod && payloadTMod.tagTorneoPrincipal,
        payloadTMod && payloadTMod.semanas,
        payloadTMod && payloadTMod.comentario,
        payloadTMod && payloadTMod.requisitos,
        payloadTMod && payloadTMod.autor,
        payloadTMod && payloadTMod.premios,
        payloadTMod && payloadTMod.tagOrg,
        payloadTMod && payloadTMod.clanOrg,
        payloadTMod && payloadTMod.clanTagOrg,
        payloadTMod && payloadTMod.link
      );
      return ContentService
        .createTextOutput(JSON.stringify(resultadoTMod))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (errTMod) {
      Logger.log('[Web] Error interno: ' + errTMod.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // NUEVO (12-sep-2026, consolidado 5.4): webAdminSorteoRegistrar, mismo patrón que webAdminTorneoRegistrar pero para S_Lista (sin link; idSorteoPrincipal en vez de tagTorneoPrincipal); ver _webAdminSorteoRegistrar(). [→ Contexto_Base_Web.md §38B084]
  if (e && e.parameter && e.parameter.accion === 'webAdminSorteoRegistrar') {
    try {
      var payloadSReg = JSON.parse(e.postData.contents);
      var resultadoSReg = _webAdminSorteoRegistrar(
        payloadSReg && payloadSReg.sessionToken,
        payloadSReg && payloadSReg.fecha,
        payloadSReg && payloadSReg.hora,
        payloadSReg && payloadSReg.idSorteoPrincipal,
        payloadSReg && payloadSReg.autor,
        payloadSReg && payloadSReg.semanas,
        payloadSReg && payloadSReg.requisitos,
        payloadSReg && payloadSReg.comentario,
        payloadSReg && payloadSReg.tagOrg,
        payloadSReg && payloadSReg.clanOrg,
        payloadSReg && payloadSReg.clanTagOrg
      );
      return ContentService
        .createTextOutput(JSON.stringify(resultadoSReg))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (errSReg) {
      Logger.log('[Web] Error interno: ' + errSReg.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // NUEVO (12-sep-2026, consolidado 5.4): webAdminSorteoPlanificarGuardar, mismo patrón que webAdminTorneoPlanificarGuardar pero para S_Lista; ver _webAdminSorteoPlanificarGuardar(). [→ Contexto_Base_Web.md §38B085]
  if (e && e.parameter && e.parameter.accion === 'webAdminSorteoPlanificarGuardar') {
    try {
      var payloadSPlan = JSON.parse(e.postData.contents);
      var resultadoSPlan = _webAdminSorteoPlanificarGuardar(
        payloadSPlan && payloadSPlan.sessionToken,
        payloadSPlan && payloadSPlan.fecha,
        payloadSPlan && payloadSPlan.hora,
        payloadSPlan && payloadSPlan.premios,
        payloadSPlan && payloadSPlan.idSorteoPrincipal,
        payloadSPlan && payloadSPlan.autor,
        payloadSPlan && payloadSPlan.semanas,
        payloadSPlan && payloadSPlan.requisitos,
        payloadSPlan && payloadSPlan.comentario,
        payloadSPlan && payloadSPlan.tagOrg,
        payloadSPlan && payloadSPlan.clanOrg,
        payloadSPlan && payloadSPlan.clanTagOrg
      );
      return ContentService
        .createTextOutput(JSON.stringify(resultadoSPlan))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (errSPlan) {
      Logger.log('[Web] Error interno: ' + errSPlan.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // NUEVO (12-sep-2026, consolidado 5.4): webAdminSorteoModificar, mismo patrón que webAdminTorneoModificar pero para S_Lista y sin modo 'Ingresar link'; ver _webAdminSorteoModificar(). [→ Contexto_Base_Web.md §38B086]
  if (e && e.parameter && e.parameter.accion === 'webAdminSorteoModificar') {
    try {
      var payloadSMod = JSON.parse(e.postData.contents);
      var resultadoSMod = _webAdminSorteoModificar(
        payloadSMod && payloadSMod.sessionToken,
        payloadSMod && payloadSMod.id,
        payloadSMod && payloadSMod.fecha,
        payloadSMod && payloadSMod.hora,
        payloadSMod && payloadSMod.idSorteoPrincipal,
        payloadSMod && payloadSMod.semanas,
        payloadSMod && payloadSMod.comentario,
        payloadSMod && payloadSMod.requisitos,
        payloadSMod && payloadSMod.autor,
        payloadSMod && payloadSMod.premios,
        payloadSMod && payloadSMod.tagOrg,
        payloadSMod && payloadSMod.clanOrg,
        payloadSMod && payloadSMod.clanTagOrg
      );
      return ContentService
        .createTextOutput(JSON.stringify(resultadoSMod))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (errSMod) {
      Logger.log('[Web] Error interno: ' + errSMod.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE 24 (02-sep-2026): webAdminTorneoResolucionGuardar registra/actualiza una resolución manual (descalificación o desempate) sobre una cuenta del torneo más reciente; datos = { idTorneo, tag, tipoResolucion, puestoFinal, motivo }; ver _webAdminTorneoResolucionGuardar() en 37_Web_API.gs. [→ Contexto_Base_Web.md §38B087]
  if (e && e.parameter && e.parameter.accion === 'webAdminTorneoResolucionGuardar') {
    try {
      var payloadTRes = JSON.parse(e.postData.contents);
      var resultadoTRes = _webAdminTorneoResolucionGuardar(
        payloadTRes && payloadTRes.sessionToken,
        payloadTRes && payloadTRes.datos
      );
      return ContentService
        .createTextOutput(JSON.stringify(resultadoTRes))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (errTRes) {
      Logger.log('[Web] Error interno: ' + errTRes.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // NUEVO (13-sep-2026, Fase 7 del plan de Cambio de Rango): webCRListaGuardar faltaba enrutarse en doPost; sessionToken y datos en el body, datos = { idExistente, fecha, hora, semanas, organizador, tagOrg, clanOrg, clanTagOrg, comentario, ascenso, descenso }; ver _webCRListaGuardar() en 37_Web_API.gs. [→ Contexto_Base_Web.md §38B088]
  if (e && e.parameter && e.parameter.accion === 'webCRListaGuardar') {
    try {
      var payloadCRG = JSON.parse(e.postData.contents);
      var resultadoCRG = _webCRListaGuardar(
        payloadCRG && payloadCRG.sessionToken,
        payloadCRG && payloadCRG.datos
      );
      return ContentService
        .createTextOutput(JSON.stringify(resultadoCRG))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (errCRG) {
      Logger.log('[Web] Error interno: ' + errCRG.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // webCRListaGenerarPropuestas es POST porque escribe (Historial_A/D), a diferencia de webCRListaPropuestas (GET, solo calcula); sessionToken/idAscenso/idDescenso en el body. [→ Contexto_Base_Web.md §38B089]
  if (e && e.parameter && e.parameter.accion === 'webCRListaGenerarPropuestas') {
    try {
      var payloadCRGP = JSON.parse(e.postData.contents);
      var resultadoCRGP = _webCRListaGenerarPropuestas(
        payloadCRGP && payloadCRGP.sessionToken,
        payloadCRGP && payloadCRGP.idAscenso,
        payloadCRGP && payloadCRGP.idDescenso
      );
      return ContentService
        .createTextOutput(JSON.stringify(resultadoCRGP))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (errCRGP) {
      Logger.log('[Web] Error interno: ' + errCRGP.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // NUEVO (13-sep-2026): webAdminVigenteGuardar; POST porque escribe Extra!Torneo_Vigente_ID/Sorteo_Vigente_ID (webAdminVigenteListar, GET, solo lee); sessionToken/categoria/id en el body; ver _webAdminVigenteGuardar() en 37_Web_API.gs. [→ Contexto_Base_Web.md §38B090]
  if (e && e.parameter && e.parameter.accion === 'webAdminVigenteGuardar') {
    try {
      var payloadVIG = JSON.parse(e.postData.contents);
      var resultadoVIG = _webAdminVigenteGuardar(
        payloadVIG && payloadVIG.sessionToken,
        payloadVIG && payloadVIG.categoria,
        payloadVIG && payloadVIG.id
      );
      return ContentService
        .createTextOutput(JSON.stringify(resultadoVIG))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (errVIG) {
      Logger.log('[Web] Error interno: ' + errVIG.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // NUEVO (14-sep-2026): webAdminMarcarVistoEnGrupo cierra el contrato pendiente 'Marcar visto en el grupo' de admin.html (08-sep-2026); POST porque escribe Grupo_Verificado; sessionToken/tag/nombre en el body, sin envolver en datos; ver _webAdminMarcarVistoEnGrupo() en 37_Web_API.gs. [→ Contexto_Base_Web.md §38B091]
  if (e && e.parameter && e.parameter.accion === 'webAdminMarcarVistoEnGrupo') {
    try {
      var payloadMVG = JSON.parse(e.postData.contents);
      var resultadoMVG = _webAdminMarcarVistoEnGrupo(
        payloadMVG && payloadMVG.sessionToken,
        payloadMVG && payloadMVG.tag,
        payloadMVG && payloadMVG.nombre
      );
      return ContentService
        .createTextOutput(JSON.stringify(resultadoMVG))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (errMVG) {
      Logger.log('[Web] Error interno: ' + errMVG.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE (10-sep-2026, consolidado de pendientes §1 puntos 4 y 6): webAdminSorteoResolucionGuardar registra/actualiza la resolución final de UN ganador de sorteo (Califica/No califica + Razón + Premio) en S_Asistencia; datos = { idSorteo, tag, nombre, premio, resultado, razon, permitirSinTag }; ver _webAdminSorteoResolucionGuardar() en 37_Web_API.gs. [→ Contexto_Base_Web.md §38B092]
  if (e && e.parameter && e.parameter.accion === 'webAdminSorteoResolucionGuardar') {
    try {
      var payloadSRes = JSON.parse(e.postData.contents);
      var resultadoSRes = _webAdminSorteoResolucionGuardar(
        payloadSRes && payloadSRes.sessionToken,
        payloadSRes && payloadSRes.datos
      );
      return ContentService
        .createTextOutput(JSON.stringify(resultadoSRes))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (errSRes) {
      Logger.log('[Web] Error interno: ' + errSRes.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // FASE (12-sep-2026, consolidado de pendientes, punto 1): el botón 'Exportar' de sorteo.html genera el docx al instante en vez de esperar runUpdate(); solo sessionToken en el body (resuelve el sorteo más reciente); ver _webAdminSorteoActualizarDocGanadores() en 37_Web_API.gs. [→ Contexto_Base_Web.md §38B093]
  if (e && e.parameter && e.parameter.accion === 'webAdminSorteoActualizarDocGanadores') {
    try {
      var payloadSDoc = JSON.parse(e.postData.contents);
      var resultadoSDoc = _webAdminSorteoActualizarDocGanadores(
        payloadSDoc && payloadSDoc.sessionToken
      );
      return ContentService
        .createTextOutput(JSON.stringify(resultadoSDoc))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (errSDoc) {
      Logger.log('[Web] Error interno: ' + errSDoc.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Endpoint de corrección de guerra (Tampermonkey, ver 18_CorreccionGuerra.gs): se resuelve ANTES de parsear el payload de Meta (que llega sin query string), así que solo entra con ?accion=corregirGuerra&token=... [→ Contexto_Base_Web.md §38B094]
  if (e && e.parameter && e.parameter.accion === 'corregirGuerra') {
    if (e.parameter.token !== CORRECCION_GUERRA_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      var payload = JSON.parse(e.postData.contents);
      var resultado = _aplicarCorreccionesGuerra(payload && payload.correcciones);
      // FIX (13-ago-2026): log en Drive por botón (_logTampermonkeyADrive(), 05_Backup_CSV.gs); resultado.avisoControl2 (si actualizarControl2() falló a mitad) ahora también viaja en la respuesta, antes solo quedaba en Logger.log. [→ Contexto_Base_Web.md §38B095]
      _logTampermonkeyADrive('CorreccionGuerra', resultado,
        resultado && resultado.avisoControl2 ? resultado.avisoControl2 : null);
      return ContentService
        .createTextOutput(JSON.stringify(resultado))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (errCorreccion) {
      _logTampermonkeyADrive('CorreccionGuerra', null, errCorreccion.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // Endpoint de importación 'Nuevos' (Tampermonkey); ver 14_Nuevos_RoyaleAPI.gs. [→ Contexto_Base_Web.md §38B096]
  if (e && e.parameter && e.parameter.accion === 'importarNuevos') {
    if (e.parameter.token !== NUEVOS_ROYALEAPI_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      var payloadNuevos = JSON.parse(e.postData.contents);
      var resultadoNuevos = _aplicarImportacionNuevos(payloadNuevos && payloadNuevos.candidatos);
      // FIX (13-ago-2026): log en Drive por botón; ver _logTampermonkeyADrive() (05_Backup_CSV.gs). [→ Contexto_Base_Web.md §38B097]
      _logTampermonkeyADrive('ImportarNuevos', resultadoNuevos, null);
      return ContentService
        .createTextOutput(JSON.stringify(resultadoNuevos))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (errNuevos) {
      _logTampermonkeyADrive('ImportarNuevos', null, errNuevos.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
    // Endpoint del histórico de Guerra por jugador (Tampermonkey); ver 20_HistorialGuerraJugador.gs; mismo patrón de token + payload por lotes que 'importarNuevos'. [→ Contexto_Base_Web.md §38B098]
  if (e && e.parameter && e.parameter.accion === 'historialGuerra') {
    if (e.parameter.token !== HISTORIAL_GUERRA_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      var payloadHG = JSON.parse(e.postData.contents);
      var resultadoHG = _aplicarHistorialGuerra(payloadHG && payloadHG.candidatos);
      _logTampermonkeyADrive('HistorialGuerra', resultadoHG, null);
      return ContentService
        .createTextOutput(JSON.stringify(resultadoHG))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (errHG) {
      _logTampermonkeyADrive('HistorialGuerra', null, errHG.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  // Endpoint 'Verificar Semana en Curso' (fase race, Tampermonkey; ver 19_CorreccionRiverRace.gs): nunca escribe directo sobre Guerra/Control_2, solo deja discrepancias pendientes de aprobación manual (aprobarCorreccionesRiverRacePendientes()). [→ Contexto_Base_Web.md §38B099]
  if (e && e.parameter && e.parameter.accion === 'verificarSemanaActual') {
    if (e.parameter.token !== VERIFICAR_RIVERRACE_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'No autorizado', code: 401 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    try {
      var payloadRace = JSON.parse(e.postData.contents);
      var resultadoRace = _procesarVerificacionRiverRace(payloadRace && payloadRace.participantes);
      _logTampermonkeyADrive('VerificarSemanaActual', resultadoRace, null);
      return ContentService
        .createTextOutput(JSON.stringify(resultadoRace))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (errRace) {
      _logTampermonkeyADrive('VerificarSemanaActual', null, errRace.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Ocurrió un error interno. Si el problema persiste, avisa al administrador.', code: 500 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  try {
    var body = JSON.parse(e.postData.contents);
    var msg  = _extraerMensajeMeta(body);
    if (!msg) return ContentService.createTextOutput('OK'); // evento sin mensaje (status, etc.)

    var resultado = _procesarMensajeEntrante(msg.telefono, msg.texto);
    _enviarRespuestaBot(msg.telefono, resultado);

    return ContentService.createTextOutput('OK');
  } catch (err) {
    Logger.log('[Bot] Error en doPost: ' + err.message);
    return ContentService.createTextOutput('OK'); // Meta reintenta si no respondes 200
  }
}

// ----- Funciones internas / helpers -----

// _normalizarClanTagContactos(tag): normaliza ClanTag (sin '#', sin espacios, mayúsculas) igual que normalizarClanTag() de 16_ContactsSync.gs; está duplicada porque la original es un closure local dentro de SincronizarContactosNube(). [→ Contexto_Base_Web.md §38B100]
function _normalizarClanTagContactos(tag) {
  return String(tag || '').replace(/#/g, '').trim().toUpperCase();
}

// _leerMapaCodigosClanContactos(): lee (sin escribir) CLAN_CODIGOS_MAP de las Propiedades del Script, que mantiene SincronizarContactosNube() (16_ContactsSync.gs); nunca asigna códigos nuevos (evita condición de carrera); devuelve undefined para clanes aún sin código. [→ Contexto_Base_Web.md §38B101]
function _leerMapaCodigosClanContactos() {
  var props = PropertiesService.getScriptProperties();
  var raw = props.getProperty('CLAN_CODIGOS_MAP');
  return raw ? JSON.parse(raw) : {};
}

// _generarJsonContactos(): lista de contactos activos Terna con celular { tag, nombre, jugador, clan, clan_tag, codigo_clan, prefijo, celular, telefono_completo }; codigo_clan puede ser null; lee Directorio en formato DC (60 columnas) con _leerDirectorioFisicoComoDC() y cae a Backup_Directorio.csv (FIX 15-sep-2026, barrido web->CSV). Detalle de fixes en el .md. [→ Contexto_Base_Web.md §38B102]
function _generarJsonContactos() {
  var ss = _getSs();
  var sh = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);

  var data;
  if (sh && sh.getLastRow() >= 2) {
    data = _leerDirectorioFisicoComoDC(ss);
  } else {
    var lecturaDirContactos = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.DIRECTORIO, 'Backup_Directorio.csv', DIR_TOTAL_COLS);
    data = (lecturaDirContactos.origen === 'csv') ? lecturaDirContactos.filas : [];
  }
  if (!data || !data.length) return [];

  var lista = [];

  // FIX: mapa de códigos de clan leído UNA vez antes del loop. [→ Contexto_Base_Web.md §38B103]
  var mapaCodigosClan = _leerMapaCodigosClanContactos();

  for (var i = 0; i < data.length; i++) {
    var estado  = String(data[i][DC.ESTADO   - 1] || '');
    var clanTag = String(data[i][DC.CLAN_TAG - 1] || '');
    var cel     = String(data[i][DC.CELULAR  - 1] || '').trim();

    if (estado !== 'Activo') continue;
    if (CFG.TERNA_TAGS.indexOf(clanTag) < 0) continue;
    if (!cel) continue;

    var prefijo   = String(data[i][DC.PREFIJO - 1] || CFG.PREFIJO_DEFAULT || '51').replace(/\D/g, '');
    var celLimpio = cel.replace(/\D/g, '');

    // FIX: codigo_clan de cada ClanTag (null si el clan aún no tiene código). [→ Contexto_Base_Web.md §38B104]
    var codigoClan = clanTag
      ? (mapaCodigosClan[_normalizarClanTagContactos(clanTag)] || null)
      : null;

    lista.push({
      tag:               String(data[i][DC.TAG     - 1] || ''),
      nombre:            String(data[i][DC.NOMBRE  - 1] || ''),
      jugador:           String(data[i][DC.JUGADOR - 1] || ''),
      clan:              String(data[i][DC.CLAN    - 1] || ''),
      clan_tag:          clanTag,
      codigo_clan:       codigoClan,
      prefijo:           prefijo,
      celular:           celLimpio,
      telefono_completo: '+' + prefijo + celLimpio
    });
  }

  // Ordena por clan (orden de TERNA_TAGS) y luego por nombre. [→ Contexto_Base_Web.md §38B105]
  lista.sort(function(a, b) {
    var oA = CFG.TERNA_TAGS.indexOf(
      _getClanTagByName(a.clan));
    var oB = CFG.TERNA_TAGS.indexOf(
      _getClanTagByName(b.clan));
    if (oA !== oB) return oA - oB;
    return String(a.nombre).localeCompare(String(b.nombre));
  });

  return lista;
}

// C) DASHBOARD DE ADMINISTRADORES (doGet ?dashboard=1): HTML de solo lectura para celular, lee las hojas ya actualizadas (Guerra/Pendientes/Directorio) sin llamar a la API de Clash Royale. [→ Contexto_Base_Web.md §38B106]

// _getDatosDashboard(): arma el objeto del dashboard (ctx, guerraPorClan, diasSemanaGuerra, pendientes, resumenClanes, valoresDiarios*, controlTemporada*, temporadasDisponibles, nuevos, tiempos); lista completa de campos y fixes (05, 07, 09, 10-sep y 05-oct-2026) en el .md. [→ Contexto_Base_Web.md §38B107]
function _getDatosDashboard() {
  // 19-sep-2026 (webGuerraEnVivo tardaba 28-39 s): durante esta función Backup_Guerra.csv y Guerra_Logs se leen una sola vez (memo por ejecución, se limpia siempre al salir); ver _guerraMemoIniciar_() en 22_ControlCalendario.gs. [→ Contexto_Base_Web.md §38B108]
  _guerraMemoIniciar_();
  _DASH_MEMO = {};
  try {
    return _getDatosDashboardCalcular_();
  } finally {
    _guerraMemoTerminar_();
    _DASH_MEMO = null;
    _DASH_T = null;
  }
}

// _DASH_MEMO / _getMinGClanMapsDash_(): 19-sep-2026, calcula _getMinGClanMaps() UNA vez por ejecución del dashboard (antes lo leía por cada temporada); fuera del dashboard llama directo. [→ Contexto_Base_Web.md §38B109]
var _DASH_MEMO = null;

function _getMinGClanMapsDash_() {
  if (_DASH_MEMO) {
    if (!_DASH_MEMO.minG) _DASH_MEMO.minG = _getMinGClanMaps();
    return _DASH_MEMO.minG;
  }
  return _getMinGClanMaps();
}

// _nombreClanDesdeHojaClanDash_(clanTag): solo dentro del dashboard; lee la hoja Clan una vez por ejecución (Tag -> Nombre); '' si no está. [→ Contexto_Base_Web.md §38B110]
function _nombreClanDesdeHojaClanDash_(clanTag) {
  try {
    if (!_DASH_MEMO.nombresClan) {
      var mapa = {};
      var sh = _getSs().getSheetByName(CFG.SHEETS.CLAN);
      if (sh && sh.getLastRow() >= 2) {
        var data = sh.getRange(2, 1, sh.getLastRow() - 1, CC.NOMBRE).getValues();
        for (var i = 0; i < data.length; i++) {
          var tag    = cleanTag(String(data[i][CC.CLAN_TAG - 1] || '').trim());
          var nombre = String(data[i][CC.NOMBRE - 1] || '').trim();
          if (tag && nombre) mapa[tag] = nombre;
        }
      }
      _DASH_MEMO.nombresClan = mapa;
    }
    return _DASH_MEMO.nombresClan[cleanTag(clanTag)] || '';
  } catch (e) {
    return '';
  }
}

// _leerDirectorioDashboard_(ss): 19-sep-2026, como _leerDirectorioFisicoComoDC() pero sin getRichTextValues() de Links (era lo lento); arma directo las URLs de RoyaleAPI y CWStats desde el Tag; solo lectura. [→ Contexto_Base_Web.md §38B111]
function _leerDirectorioDashboard_(ss) {
  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  if (!shDir || shDir.getLastRow() < 2) return [];
  var numFilas      = shDir.getLastRow() - 1;
  var dirFisico     = shDir.getRange(2, 1, numFilas, DIR_SHEET_COLS).getValues();
  var playersPorTag = _leerHojaComoMapaPorTag(ss, CFG.SHEETS.PLAYERS, PC.TAG - 1, PLAYERS_TOTAL_COLS);
  var linksPorTag   = _leerHojaComoMapaPorTag(ss, CFG.SHEETS.LINKS, LC.TAG - 1, LINKS_TOTAL_COLS);
  var resultado = [];
  for (var i = 0; i < dirFisico.length; i++) {
    var tag  = String(dirFisico[i][IC.TAG - 1] || '').trim().toUpperCase();
    var fila = _reconstruirFilaDCDesdeFisico(dirFisico[i], playersPorTag[tag], linksPorTag[tag]);
    var linksFila = linksPorTag[tag];
    if (linksFila) {
      var tagSinHash = cleanTag(String(fila[DC.TAG - 1] || tag).trim());
      if (tagSinHash) {
        if (String(linksFila[LC.ROYALE_API - 1] || '').trim() !== '') {
          fila[DC.ROYALE_API - 1] = 'https://royaleapi.com/player/' + tagSinHash + '/';
        }
        if (String(linksFila[LC.CW_STATS - 1] || '').trim() !== '') {
          fila[DC.CW_STATS - 1] = 'https://cwstats.com/player/' + tagSinHash + '/';
        }
      }
    }
    resultado.push(fila);
  }
  return resultado;
}

// _dashTiempoIniciar_() / _dashTiempoMarca_() / _dashTiempoFin_(): 19-sep-2026, cronómetro por etapas de _getDatosDashboardCalcular_(); una línea [Dashboard] con ms por etapa; no cambia resultados. [→ Contexto_Base_Web.md §38B112]
function _dashTiempoIniciar_() {
  var ahora = Date.now();
  return { t0: ahora, ult: ahora, partes: [], acum: {} };
}

// _DASH_T / _dashAcum_(etiqueta, desde): 19-sep-2026, suma ms y veces por etiqueta dentro de las etapas; se imprime como `detalle` en la línea [Dashboard]; solo mide. [→ Contexto_Base_Web.md §38B113]
var _DASH_T = null;

function _dashAcum_(etiqueta, desde) {
  if (!_DASH_T) return;
  var a = _DASH_T.acum[etiqueta] || { ms: 0, n: 0 };
  a.ms += (Date.now() - desde);
  a.n++;
  _DASH_T.acum[etiqueta] = a;
}
function _dashTiempoMarca_(t, etiqueta) {
  var ahora = Date.now();
  t.partes.push(etiqueta + '=' + (ahora - t.ult));
  t.ult = ahora;
}
function _dashTiempoFin_(t) {
  var detalle = Object.keys(t.acum).map(function (k) { return k + '=' + t.acum[k].ms + 'ms/' + t.acum[k].n + 'x'; });
  _diagGuerraVivo_('[Dashboard] build=B3 total=' + (Date.now() - t.t0) + 'ms | ' + t.partes.join(' | ') +
                   (detalle.length ? ' || detalle: ' + detalle.join(' | ') : ''));
}

// _diagGuerraVivo_(texto) / verDiagnosticoGuerraVivo(): 19-sep-2026, diagnóstico de webGuerraEnVivo por Logger.log, console.log y lista corta en CacheService (15 líneas, 6 h); 'caché HIT' no entra a la lista; la última línea [Dashboard] tiene clave propia; nunca lanza error; no cambia resultados. [→ Contexto_Base_Web.md §38B114]
var DIAG_GUERRA_VIVO_KEY      = 'diag_guerra_vivo_v1';
var DIAG_GUERRA_VIVO_DASH_KEY = 'diag_guerra_vivo_dash_v1';

function _diagGuerraVivo_(texto) {
  var tz = Session.getScriptTimeZone() || 'America/Lima';
  var linea = Utilities.formatDate(new Date(), tz, 'dd/MM HH:mm:ss') + ' ' + texto;
  try { Logger.log(linea); } catch (e1) { /* nada que hacer */ }
  try { console.log(linea); } catch (e2) { /* nada que hacer */ }
  try {
    var cache = CacheService.getScriptCache();
    // La medición completa de la última recalculada tiene su propia clave. [→ Contexto_Base_Web.md §38B115]
    if (String(texto).indexOf('[Dashboard]') === 0) cache.put(DIAG_GUERRA_VIVO_DASH_KEY, linea, 21600);
    // Los 'caché HIT' son decenas por hora y llenaban la lista; no se guardan aquí. [→ Contexto_Base_Web.md §38B116]
    if (String(texto).indexOf('caché HIT') !== -1) return;
    var previas = cache.get(DIAG_GUERRA_VIVO_KEY);
    var lista = previas ? previas.split('\n') : [];
    lista.unshift(linea);
    cache.put(DIAG_GUERRA_VIVO_KEY, lista.slice(0, 15).join('\n'), 21600);
  } catch (e3) { /* caché no disponible: se omite */ }
}

function verDiagnosticoGuerraVivo() {
  var cache = CacheService.getScriptCache();
  var dash = cache.get(DIAG_GUERRA_VIVO_DASH_KEY);
  var txt  = cache.get(DIAG_GUERRA_VIVO_KEY);
  var salida = [];
  if (dash) salida.push('Última medición [Dashboard]:\n' + dash);
  if (txt)  salida.push('Últimas líneas, sin "caché HIT" (la más reciente primero):\n' + txt);
  Logger.log(salida.length ? salida.join('\n\n')
                           : 'Sin registros todavía: abre guerra.html una vez (o espera a que venza la caché de 5 min) y vuelve a ejecutar esta función.');
}

// _getDatosDashboardCalcular_(): cuerpo original de _getDatosDashboard(), separado el 19-sep-2026 solo para envolverlo con la memo por ejecución de Backup_Guerra.csv; su lógica no cambió. [→ Contexto_Base_Web.md §38B117]
function _getDatosDashboardCalcular_() {
  var _tDash = _dashTiempoIniciar_();
  _DASH_T = _tDash;
  var ss  = _getSs();
  var ctx = _getCtx();
  _dashTiempoMarca_(_tDash, 'ctx');

  // Guerra de HOY por clan. FIX 09-sep-2026: `totalHoy` ya no cuenta filas de la hoja Guerra sino los Activos de Directorio (se fija más abajo, igual que resumenClanes); ataques/fame/barcos/atacaron siguen siendo datos reales de hoy. [→ Contexto_Base_Web.md §38B118]
  var guerraPorClan = {};
  var shGuerra = ss.getSheetByName(CFG.SHEETS.GUERRA);
  var dataGuerra;
  // 19-sep-2026: `true` solo si dataGuerra salió de la hoja viva; permite reusar la lectura en _construirIngresosRecientesUnificado() sin leer Guerra dos veces (con el CSV de respaldo no se reusa). [→ Contexto_Base_Web.md §38B119]
  var dataGuerraDeHoja = false;
  if (shGuerra && shGuerra.getLastRow() >= 2) {
    dataGuerra = shGuerra.getRange(2, 1, shGuerra.getLastRow() - 1, GUERRA_TOTAL_COLS).getValues();
    dataGuerraDeHoja = true;
    // 19-sep-2026: mismas filas y rango que _getDatosGuerraDesdeHojaParaControl() (22_ControlCalendario.gs); se comparten para no releer la hoja. [→ Contexto_Base_Web.md §38B120]
    if (_GUERRA_MEMO_ACTIVO) _GUERRA_HOJA_MEMO = dataGuerra;
  } else {
    // FASE 15-sep-2026 (fallback web->CSV): Backup_Guerra.csv se arma posicionalmente con el mismo orden GC que la hoja (_syncGuerraCSV(), 05_Backup_CSV.gs); los campos usados son numéricos o texto, no hace falta reconstruir Date. [→ Contexto_Base_Web.md §38B121]
    var lecturaGuerraDash = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.GUERRA, 'Backup_Guerra.csv', GUERRA_TOTAL_COLS);
    dataGuerra = lecturaGuerraDash.filas;
  }
  // FIX 05-oct-2026 (resultados del domingo congelados): fuera de día de guerra (lun-mié) TODOS los clanes se agregan desde el último día de guerra jugado, hasta que empiece la del jueves; si ese domingo no tiene filas en la temporada vigente, se usa el último día con datos de temporadas anteriores. En día de guerra solo cuenta hoy. [→ Contexto_Base_Web.md §38B122]
  var guerraTempObjetivo = String(ctx.temporada);
  var guerraPIdxObjetivo = ctx.periodIndex;
  var guerraCongelada = false;
  var guerraCongeladaLetra = null;   // J/V/S/D del dia mostrado mientras esta congelado (null en dia de guerra)
  var guerraFilasObjetivo = dataGuerra; // filas de las que se suma el periodo objetivo
  if (dataGuerra && !ctx.esDiaGuerra) {
    guerraCongelada = true;
    // 2da versión (05-oct-2026): la hoja Guerra solo trae la temporada vigente; el CSV se lee únicamente si la hoja no tiene un día de guerra útil de la temporada vigente. [→ Contexto_Base_Web.md §38B123]
    var elegido = _elegirPeriodoGuerraCongelado_(dataGuerra, null, ctx);
    var csvPorTemp = null;
    if (!elegido || !elegido.valido || String(elegido.temporada) !== String(ctx.temporada)) {
      try { csvPorTemp = _leerGuerraCsvAgrupado_().porTemporada; }
      catch (eCsvCong) { Logger.log('[Guerra de hoy] No se pudo leer Backup_Guerra.csv para el congelado: ' + eCsvCong.message); }
      if (csvPorTemp) elegido = _elegirPeriodoGuerraCongelado_(dataGuerra, csvPorTemp, ctx);
    }
    if (elegido) {
      guerraTempObjetivo    = String(elegido.temporada);
      guerraPIdxObjetivo    = elegido.periodIndex;
      guerraCongeladaLetra  = elegido.letra;
      if (guerraTempObjetivo !== String(ctx.temporada) && csvPorTemp) guerraFilasObjetivo = csvPorTemp[guerraTempObjetivo] || [];
    }
  }
  if (guerraFilasObjetivo) {
    for (var i = 0; i < guerraFilasObjetivo.length; i++) {
      var pIdx = Number(guerraFilasObjetivo[i][GC.PERIOD_IDX - 1]) || 0;
      // FIX 04-sep-2026: faltaba filtrar por TEMPORADA además de PERIOD_IDX (se reinicia cada temporada), lo que inflaba ataques/fame/barcos con filas de temporadas anteriores. [→ Contexto_Base_Web.md §38B124]
      if (pIdx !== guerraPIdxObjetivo) continue; // Solo el día de hoy (o, en entrenamiento, el último día de guerra jugado)
      if (String(guerraFilasObjetivo[i][GC.TEMPORADA - 1] || '') !== guerraTempObjetivo) continue; // Solo la temporada actual (o la del último día de guerra)

      var clanNombreG = String(guerraFilasObjetivo[i][GC.CLAN - 1] || 'Sin clan');
      if (!guerraPorClan[clanNombreG]) {
        guerraPorClan[clanNombreG] = { ataques: 0, fame: 0, barcos: 0, atacaron: 0, totalHoy: 0 };
      }
      var g = guerraPorClan[clanNombreG];
      var ataqHoyG = Number(guerraFilasObjetivo[i][GC.ATAQUES_HOY - 1]) || 0;
      g.ataques += ataqHoyG;
      g.fame    += Number(guerraFilasObjetivo[i][GC.FAME   - 1]) || 0;
      g.barcos  += Number(guerraFilasObjetivo[i][GC.BARCOS - 1]) || 0;
      if (ataqHoyG > 0) g.atacaron++;
      // `totalHoy` ya no se incrementa aquí; se sobreescribe más abajo con el conteo real de Activos de Directorio. [→ Contexto_Base_Web.md §38B125]
    }
  }

  // NUEVO 05-oct-2026: marca `metaCruzada` por clan en 'Guerra de hoy'; solo en día de guerra, nunca jueves ni coliseo; usa SOLO _cruceMetaDesdeGuerraLogs_() (en memoria, sin JSON de Drive ni cache de API); campo aditivo, solo `true`; si falla se ignora. VERIFICAR el tiempo de ?dashboard=json tras desplegar. [→ Contexto_Base_Web.md §38B126]
  if (ctx.esDiaGuerra && Number(ctx.periodIndex) % 7 > 3) { // 07-oct-2026: viernes a domingo se evalúan con Guerra_Logs (criterio unificado con _diasOpcionalesClanSemana_()). [→ Contexto_Base_Web.md §38B127]
    try {
      if (!_esPeriodoDeColiseo_(ctx.temporada, ctx.periodIndex)) {
        Object.keys(guerraPorClan).forEach(function (clanNombreM) {
          if (_cruceMetaDesdeGuerraLogs_(clanNombreM, ctx.periodIndex, ctx.temporada) === true) guerraPorClan[clanNombreM].metaCruzada = true;
        });
      }
    } catch (eMeta) {
      Logger.log('[Guerra de hoy] No se pudo evaluar meta cruzada: ' + eMeta.message);
    }
  }

  // ---- Pendientes de atacar (ya calculado por updatePendientesSheet()) ----
  var pendientes = [];
  var shPend = ss.getSheetByName(CFG.SHEETS.PENDIENTES);
  var dataPend;
  if (shPend && shPend.getLastRow() >= 2) {
    // Pendientes tiene 10 columnas reales (N°|Tag|Nombre|Nom_Multi|Préstamo|Clan|Faltantes|Celular|WSP|RoyaleAPI); este bloque solo usa las primeras 7. [→ Contexto_Base_Web.md §38B128]
    dataPend = shPend.getRange(2, 1, shPend.getLastRow() - 1, 7).getValues();
  } else {
    // FASE 15-sep-2026 (fallback web->CSV): Backup_Pendientes.csv ya existe (balde genérico de hojas derivadas, lectura posicional) y está en el mismo orden que la hoja; solo faltaba conectar este fallback; totalCols=7 recorta igual que getRange(...,7). [→ Contexto_Base_Web.md §38B129]
    var lecturaPend = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.PENDIENTES, 'Backup_Pendientes.csv', 7);
    dataPend = lecturaPend.filas;
  }
  if (dataPend) {
    for (var j = 0; j < dataPend.length; j++) {
      var tagP = String(dataPend[j][1] || '').trim();
      if (!tagP) continue;
      pendientes.push({
        tag:       tagP,
        nombre:    String(dataPend[j][2] || ''),
        nomMulti:  String(dataPend[j][3] || ''),
        prestamo:  String(dataPend[j][4] || ''),
        clan:      String(dataPend[j][5] || ''),
        faltantes: Number(dataPend[j][6]) || 0
      });
    }
  }

  _dashTiempoMarca_(_tDash, 'guerraHoy+pendientes');

  // Fechas reales de los 4 días de guerra (Jue-Dom). FIX 28-ago/04-sep-2026: se calculan de forma determinista desde ctx.ref/ctx.temporada (calcDiaGuerraIdx(), 04_Formato_Comun.gs), sin depender de que exista fila en Guerra; el frontend sigue resaltando HOY por la letra. [→ Contexto_Base_Web.md §38B130]
  var basePeriodIndexGuerra = ctx.sectionIndex * 7 + 3; // Jueves de esta sección
  var diasSemanaGuerra = [];
  for (var dOff = 0; dOff < 4; dOff++) {
    var pIdxBuscado  = basePeriodIndexGuerra + dOff;
    var letraBuscada = periodIdxToLetra(pIdxBuscado);
    var fechaCalc    = calcDiaGuerraIdx(ctx.ref, ctx.temporada, pIdxBuscado);
    diasSemanaGuerra.push({
      letra: letraBuscada,
      fecha: (fechaCalc && !isNaN(fechaCalc.getTime())) ? fechaCalc.toISOString() : null
    });
  }

  // ---- Directorio: resumen de activos por clan ----
  var resumenClanes = {};
  var dataDir = null;
  // FIX 10-sep-2026 (columna Rango en guerra.html) y AMPLIADO 15-sep-2026: se arma un mapa Tag -> {rango, royaleApi, cwStats} con todos los tags de Directorio para completar `pendientes` (Pendientes no tiene Rango); URLs vía _webUrlPerfilExterno(); sin link la celda queda sin ícono. [→ Contexto_Base_Web.md §38B131]
  var infoDirPorTagDir = {};
  var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
  // FASE 15-sep-2026 (fallback web->CSV, como _webRosterCalcular() en 37_Web_API.gs): si Directorio no está disponible se usa Backup_Directorio.csv (formato DC de 60 columnas) y se reconstruyen DC.VIGENCIA/DC.FECHA_ING como Date con _parseSpanishDate(). [→ Contexto_Base_Web.md §38B132]
  if (shDir && shDir.getLastRow() >= 2) {
    // Fase C1 (16/07/2026): la hoja física de Directorio tiene 29 columnas (orden IC); se usa _leerDirectorioFisicoComoDC() (11_DirectorioSheet.gs) para obtener el formato DC de 60 columnas con los campos de Players. [→ Contexto_Base_Web.md §38B133]
    var _tDirLec = Date.now();
    dataDir = _leerDirectorioDashboard_(ss); // 19-sep-2026: sin getRichTextValues() de Links, ver su docblock
    _dashAcum_('dir.lectura', _tDirLec);
  } else {
    var lecturaDirDash = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.DIRECTORIO, 'Backup_Directorio.csv', DIR_TOTAL_COLS);
    if (lecturaDirDash.origen === 'csv') {
      dataDir = lecturaDirDash.filas.map(function (fila) {
        var f = fila.slice();
        var vig = _parseSpanishDate(f[DC.VIGENCIA - 1]);
        if (vig instanceof Date && !isNaN(vig.getTime())) f[DC.VIGENCIA - 1] = vig;
        var fIng = _parseSpanishDate(f[DC.FECHA_ING - 1]);
        if (fIng instanceof Date && !isNaN(fIng.getTime())) f[DC.FECHA_ING - 1] = fIng;
        return f;
      });
    } else {
      dataDir = null;
    }
  }
  if (dataDir) {
    for (var k = 0; k < dataDir.length; k++) {
      var fila = dataDir[k];
      var tagDirK = String(fila[DC.TAG - 1] || '').trim().toUpperCase();
      if (tagDirK) {
        infoDirPorTagDir[tagDirK] = {
          rango:     String(fila[DC.RANGO - 1] || ''),
          royaleApi: _webUrlPerfilExterno(fila[DC.ROYALE_API - 1], 'royaleapi.com', 'player'),
          cwStats:   _webUrlPerfilExterno(fila[DC.CW_STATS   - 1], 'cwstats.com',   'player')
        };
      }
      if (String(fila[DC.ESTADO - 1] || '').trim() !== 'Activo') continue;
      var clanNombreD = String(fila[DC.CLAN - 1] || 'Sin clan');
      resumenClanes[clanNombreD] = (resumenClanes[clanNombreD] || 0) + 1;
    }
  }
  _dashTiempoMarca_(_tDash, 'directorio');
  // Mismo FIX: con infoDirPorTagDir ya armado se completa cada pendiente con Rango/RoyaleAPI/CWStats por Tag (mayúsculas); si el tag no está queda '' y guerra.html muestra '—' o sin ícono. [→ Contexto_Base_Web.md §38B134]
  pendientes.forEach(function (p) {
    var infoP = infoDirPorTagDir[String(p.tag || '').trim().toUpperCase()] || {};
    p.rango     = infoP.rango     || '';
    p.royaleApi = infoP.royaleApi || '';
    p.cwStats   = infoP.cwStats   || '';
  });

  // FIX 09-sep-2026: con resumenClanes ya calculado se fija totalHoy de cada clan al conteo de Activos de Directorio; un clan sin filas hoy en Guerra no aparece en la tarjeta (eso no cambia). [→ Contexto_Base_Web.md §38B135]
  Object.keys(guerraPorClan).forEach(function (clanNombreG) {
    if (resumenClanes.hasOwnProperty(clanNombreG)) {
      guerraPorClan[clanNombreG].totalHoy = resumenClanes[clanNombreG];
    }
  });

  // Lista de temporadas con datos de guerra (más reciente primero), calculada aquí arriba porque _getValoresDiariosSelectores() también la necesita; ver _getTemporadasDisponibles(). [→ Contexto_Base_Web.md §38B136]
  var temporadasDisponibles = _getTemporadasDisponibles(ctx);
  _dashTiempoMarca_(_tDash, 'temporadasCSV');

  // 'Valores diarios' (antes 'Cuadrícula de Activos (Semana Actual)'). FIX 09-sep-2026: selector año -> temporada(mes) -> semana sobre TODAS las temporadas disponibles; reemplaza controlActivosSemanaActual/semanasControlActivosDisponibles/controlActivosPorSemana; reusa dataDir. [→ Contexto_Base_Web.md §38B137]
  var valoresDiariosSelectores = dataDir ? _getValoresDiariosSelectores(ctx, temporadasDisponibles) : null;
  var valoresDiariosPorSemana  = dataDir
    ? _getValoresDiariosPorSemana(dataDir, ctx, valoresDiariosSelectores)
    : {};

  // Panel 'tipo hoja Control_2' (valores SEMANALES de toda la temporada, frente a 'Valores diarios'); ver _getControlTemporadaPorClan(); reusa dataDir. [→ Contexto_Base_Web.md §38B138]
  _dashTiempoMarca_(_tDash, 'valoresDiarios');
  var controlTemporada = dataDir ? _getControlTemporadaPorClan(ss, ctx, dataDir, ctx.temporada) : { semanas: [], porClan: {} };
  _dashTiempoMarca_(_tDash, 'control2Vigente');

  // FIX 07-sep-2026: cuadrícula Control_2 completa de cada temporada ANTERIOR a la vigente (la vigente ya viaja en controlTemporadaSemanas/PorClan); ver _getControlTemporadaPorTemporada(). [→ Contexto_Base_Web.md §38B139]
  var controlTemporadaPorTemporada = dataDir
    ? _getControlTemporadaPorTemporada(ss, ctx, dataDir, temporadasDisponibles)
    : {};

  // FIX 09-sep-2026: agrupa temporadasDisponibles por año -> temporada(mes) para el selector de Valores semanales (sin nivel de semana); ver _getControlTemporadaSelectores(); no requiere dataDir. [→ Contexto_Base_Web.md §38B140]
  _dashTiempoMarca_(_tDash, 'control2Historico');
  var controlTemporadaSelectores = _getControlTemporadaSelectores(ctx, temporadasDisponibles);

  // Panel 'Ingresos recientes'. FIX 01-sep-2026: Inicio y Guerra comparten _construirIngresosRecientesUnificado() (37_Web_API.gs); universo 100% Directorio, enriquecido con Tampermonkey; se reusan dataDir/ctx. 19-sep-2026: se le pasa la lectura de Guerra ya hecha y el cronómetro. [→ Contexto_Base_Web.md §38B141]
  var nuevos = _construirIngresosRecientesUnificado(dataDir, ctx, dataGuerraDeHoja ? dataGuerra : null, _tDash).map(function (c) {
    return {
      tag:       c.tag,
      nombre:    c.nombre,
      clan:      c.clan,
      fechaIng:  c.fechaIngresoISO,
      royaleApi: c.royaleApi,
      cwstats:   c.cwstats
    };
  });

  _dashTiempoMarca_(_tDash, 'ingresos');
  _dashTiempoFin_(_tDash);

  // NUEVO 05-oct-2026: horas de actualización para la web (42_Web_TiemposActualizacion.gs); el try/catch evita romper la web si se sube este archivo antes que el de tiempos (ReferenceError). [→ Contexto_Base_Web.md §38B142]
  var tiemposAct = null;
  try { tiemposAct = _tiemposActualizacionWeb_(Date.now()); }
  catch (eTiempos) { Logger.log('[Dashboard] No se pudieron armar las horas de actualizacion: ' + eTiempos.message); }

  return {
    ctx:                        ctx,
    guerraPorClan:              guerraPorClan,
    guerraCongeladaLetra:       guerraCongeladaLetra, // NUEVO 05-oct-2026: J/V/S/D del día de las tarjetas congeladas (null en día de guerra). [→ Contexto_Base_Web.md §38B143]
    diasSemanaGuerra:           diasSemanaGuerra,
    pendientes:                 pendientes,
    resumenClanes:              resumenClanes,
    valoresDiariosSelectores:   valoresDiariosSelectores,
    valoresDiariosPorSemana:    valoresDiariosPorSemana,
    controlTemporadaSemanas:    controlTemporada.semanas,
    controlTemporadaPorClan:    controlTemporada.porClan,
    temporadasDisponibles:      temporadasDisponibles,
    controlTemporadaPorTemporada: controlTemporadaPorTemporada,
    controlTemporadaSelectores: controlTemporadaSelectores,
    nuevos:                     nuevos,
    tiempos:                    tiemposAct
  };
}

// _webAportesInactivos(token): endpoint 'webAportesInactivos' (router en doGet); valida la sesión de admin dentro (patrón de 37_Web_API.gs); token inválido -> { ok:false, error } sin tocar Inactivos ni Guerra. [→ Contexto_Base_Web.md §38B144]
function _webAportesInactivos(token) {
  if (!_webAuthValidar(token)) return { ok: false, error: 'Sesión inválida o vencida. Vuelve a iniciar sesión.' };
  var ss  = _getSs();
  var ctx = _getCtx();
  return { ok: true, aportesInactivos: _getAportesInactivosSemanaActual(ss, ctx) };
}

// _MESES_ES_ / _MESES_ABREV_ES_ (FIX 09-sep-2026): nombres de mes en español fijos, índice 0-based, sin depender de Intl (evita el punto final de 'sept.'). [→ Contexto_Base_Web.md §38B145]
var _MESES_ES_ = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
var _MESES_ABREV_ES_ = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];

// _fmtFechaCortaSemana(d): 'DD MES' en mayúsculas (ej. '07 SEP') para las etiquetas de semana del selector de Valores diarios. [→ Contexto_Base_Web.md §38B146]
function _fmtFechaCortaSemana(d) {
  if (!d || isNaN(d.getTime())) return '—';
  var dd = ('0' + d.getDate()).slice(-2);
  return dd + ' ' + _MESES_ABREV_ES_[d.getMonth()];
}

// _elegirPeriodoGuerraCongelado_(dataGuerra, csvPorTemporada, ctx) — NUEVO 05-oct-2026: elige el último día de guerra jugado (hoja vigente + Backup_Guerra.csv), prefiriendo el último día con ATAQUES REALES; función pura, devuelve {temporada, periodIndex, letra, valido} o null. [→ Contexto_Base_Web.md §38B147]
function _elegirPeriodoGuerraCongelado_(dataGuerra, csvPorTemporada, ctx) {
  var periodos = {};
  var acum = function (filas) {
    for (var i = 0; i < filas.length; i++) {
      var p = Number(filas[i][GC.PERIOD_IDX - 1]) || 0;
      if (!esDiaGuerraIdx(p)) continue;
      var t = Number(filas[i][GC.TEMPORADA - 1]) || 0;
      if (!t || t > Number(ctx.temporada)) continue;
      if (t === Number(ctx.temporada) && p > ctx.periodIndex) continue; // solo periodos ya ocurridos
      var k = t + '|' + p;
      var x = periodos[k] || (periodos[k] = { temp: t, pIdx: p, ataques: 0 });
      x.ataques += Number(filas[i][GC.ATAQUES_HOY - 1]) || 0;
    }
  };
  if (dataGuerra) acum(dataGuerra);
  if (csvPorTemporada) {
    Object.keys(csvPorTemporada).forEach(function (t) {
      if (Number(t) < Number(ctx.temporada)) acum(csvPorTemporada[t]);
    });
  }
  var mejorValido = null, mejorCualquiera = null;
  Object.keys(periodos).forEach(function (k) {
    var x = periodos[k];
    var esMejor = function (a) { return !a || x.temp > a.temp || (x.temp === a.temp && x.pIdx > a.pIdx); };
    if (esMejor(mejorCualquiera)) mejorCualquiera = x;
    if (x.ataques > 0 && esMejor(mejorValido)) mejorValido = x;
  });
  var el = mejorValido || mejorCualquiera;
  return el ? { temporada: el.temp, periodIndex: el.pIdx, letra: periodIdxToLetra(el.pIdx), valido: !!mejorValido } : null;
}

// _getInfoTemporada(temporada): FIX 09-sep-2026; cada temporada tiene un único mes (su primer lunes), y el año del selector es el de ese primer lunes (una que arranca en diciembre queda bajo diciembre); devuelve {temporada, anio, mes, mesLabel, label} o null. [→ Contexto_Base_Web.md §38B148]
function _getInfoTemporada(temporada) {
  var pl = primerLunesTemporada(CFG.REF_DEFAULT, Number(temporada));
  if (!pl || isNaN(pl.getTime())) return null;
  var mes = pl.getMonth();
  return {
    temporada: Number(temporada),
    anio:      pl.getFullYear(),
    mes:       mes,
    mesLabel:  _MESES_ES_[mes],
    label:     'Temporada ' + temporada + ' (' + _MESES_ES_[mes] + ')'
  };
}

// _getRangoFechasSemana(temporada, sectionIndex): lunes..domingo real de una semana de temporada (primer lunes + sectionIndex*7 días) para las etiquetas del selector; devuelve {inicio, fin} o null. [→ Contexto_Base_Web.md §38B149]
function _getRangoFechasSemana(temporada, sectionIndex) {
  var pl = primerLunesTemporada(CFG.REF_DEFAULT, Number(temporada));
  if (!pl || isNaN(pl.getTime())) return null;
  var inicio = new Date(pl.getTime());
  inicio.setDate(inicio.getDate() + (Number(sectionIndex) || 0) * 7);
  var fin = new Date(inicio.getTime());
  fin.setDate(fin.getDate() + 6);
  return { inicio: inicio, fin: fin };
}

// _getUltimaSemanaJugada(ctx): sectionIndex de la última semana cuya guerra ya arrancó en la temporada vigente; en entrenamiento es ctx.sectionIndex - 1; -1 si aún no hubo ningún día de guerra. [→ Contexto_Base_Web.md §38B150]
function _getUltimaSemanaJugada(ctx) {
  return ctx.esDiaGuerra ? ctx.sectionIndex : (ctx.sectionIndex - 1);
}

// _getSemanasTemporada(ctx, temporada): FIX 09-sep-2026; semanas DISPONIBLES con su etiqueta de fechas; vigente: hasta _getUltimaSemanaJugada(); anterior: todas (1..lunes del mes). [→ Contexto_Base_Web.md §38B151]
function _getSemanasTemporada(ctx, temporada) {
  var esVigente = String(temporada) === String(ctx.temporada);
  // FIX 05-oct-2026: una temporada tiene tantas semanas como lunes tiene el mes de su primer lunes (4 o 5); el tope se aplica también a la vigente para no generar una semana inexistente. [→ Contexto_Base_Web.md §38B152]
  var plTope = primerLunesTemporada(CFG.REF_DEFAULT, Number(temporada));
  var numSemanas = (plTope && !isNaN(plTope.getTime())) ? (lunesEnMes(plTope.getFullYear(), plTope.getMonth()) || 0) : 0;
  var maxIdx;
  if (esVigente) {
    maxIdx = _getUltimaSemanaJugada(ctx);
    if (numSemanas > 0) maxIdx = Math.min(maxIdx, numSemanas - 1);
  } else {
    maxIdx = numSemanas - 1;
  }
  var semanas = [];
  for (var s = 0; s <= maxIdx; s++) {
    var rango = _getRangoFechasSemana(temporada, s);
    var etiquetaFechas = rango ? (_fmtFechaCortaSemana(rango.inicio) + ' – ' + _fmtFechaCortaSemana(rango.fin)) : '';
    semanas.push({ sectionIndex: s, label: 'S' + (s + 1) + (etiquetaFechas ? ' (' + etiquetaFechas + ')' : '') });
  }
  return semanas;
}

// _getValoresDiariosSelectores(ctx, temporadasDisponibles): FIX 09-sep-2026; arma los 3 niveles (año, temporada, semana) de Valores diarios; omite la vigente si aún no jugó ninguna semana; porDefecto = lo más reciente disponible. [→ Contexto_Base_Web.md §38B153]
function _getValoresDiariosSelectores(ctx, temporadasDisponibles) {
  var temporadasPorAnio = {};
  var semanasPorTemporada = {};
  var aniosSet = {};
  var porDefecto = null;

  for (var i = 0; i < temporadasDisponibles.length; i++) {
    var temporada = temporadasDisponibles[i];
    var semanas = _getSemanasTemporada(ctx, temporada);
    if (!semanas.length) continue; // temporada vigente aún sin ninguna semana jugada -- se omite del selector

    var info = _getInfoTemporada(temporada);
    if (!info) continue;

    semanasPorTemporada[temporada] = semanas;
    aniosSet[info.anio] = true;
    if (!temporadasPorAnio[info.anio]) temporadasPorAnio[info.anio] = [];
    temporadasPorAnio[info.anio].push({ temporada: temporada, mes: info.mes, mesLabel: info.mesLabel, label: info.label });

    // La primera temporada de la lista con al menos una semana jugada es la combinación año/temporada/semana más reciente (el default pedido). [→ Contexto_Base_Web.md §38B154]
    if (!porDefecto) {
      porDefecto = { anio: info.anio, temporada: temporada, sectionIndex: semanas[semanas.length - 1].sectionIndex };
    }
  }

  var anios = Object.keys(aniosSet).map(Number).sort(function (a, b) { return b - a; });
  Object.keys(temporadasPorAnio).forEach(function (anio) {
    temporadasPorAnio[anio].sort(function (a, b) { return b.temporada - a.temporada; });
  });

  return { anios: anios, temporadasPorAnio: temporadasPorAnio, semanasPorTemporada: semanasPorTemporada, porDefecto: porDefecto };
}

// _getParticipantesGuerraTemporada_(temporada, temporadaReal): NUEVO 08-oct-2026 (pedido usuario: puntaje honesto por clan); quienes PARTICIPARON en una temporada, sacados de las filas de Guerra (hoja si es la vigente, Backup_Guerra.csv si es histórica), no del Directorio actual. Devuelve { TAG_MAYUS: { tag, nombre, clan, semanas: {sIdx:true} } } (clan/nombre = los de la ultima fila vista). Quien no tiene filas en esa temporada no aparece (entro despues, ya se habia ido, o estuvo en la 2 y la 4 pero no en la 3).
function _getParticipantesGuerraTemporada_(temporada, temporadaReal) {
  var res = {};
  var filas = [];
  try {
    if (String(temporada) === String(temporadaReal)) {
      var sh = _getSs().getSheetByName(CFG.SHEETS.GUERRA);
      if (!sh || sh.getLastRow() < 2) return res;
      if (_GUERRA_MEMO_ACTIVO && _GUERRA_HOJA_MEMO) {
        filas = _GUERRA_HOJA_MEMO;
      } else {
        filas = sh.getRange(2, 1, sh.getLastRow() - 1, GUERRA_TOTAL_COLS).getValues();
        if (_GUERRA_MEMO_ACTIVO) _GUERRA_HOJA_MEMO = filas;
      }
    } else {
      var csv = _leerGuerraCsvAgrupado_();
      filas = (csv.porTemporada && csv.porTemporada[String(temporada)]) || [];
    }
  } catch (e) {
    Logger.log('[Participantes Guerra] T' + temporada + ': ' + e.message);
    return res;
  }
  for (var i = 0; i < filas.length; i++) {
    var f = filas[i];
    if (String(f[GC.TEMPORADA - 1] || '') !== String(temporada)) continue;
    var tag = String(f[GC.TAG - 1] || '').trim().toUpperCase();
    if (!tag) continue;
    var pIdx = Number(f[GC.PERIOD_IDX - 1] || 0);
    if (!esDiaGuerraIdx(pIdx)) continue; // mismo criterio que _procesarFilasGuerraParaControl()
    var sIdx = Math.max(Number(f[GC.SEMANA - 1] || 1) - 1, 0);
    var p = res[tag];
    if (!p) p = res[tag] = { tag: tag, nombre: '', clan: '', semanas: {} };
    p.semanas[sIdx] = true;
    var nom = String(f[GC.NOMBRE - 1] || '').trim();
    var cl  = String(f[GC.CLAN - 1] || '').trim();
    if (nom) p.nombre = nom;
    if (cl)  p.clan = cl;
  }
  return res;
}

// _getControlActivosGridPorTemporada(dataDir, temporada, temporadaReal, semanas, ctxVigente): FIX 09-sep-2026; cuadrícula J/V/S/D de TODAS las semanas de UNA temporada en un solo cálculo vía _getDatosGuerraParaControl(); lista todos los Activos (0/0/0/0) salvo semanas previas a su ingreso (FIX 10-sep); orden por rango y nombre (28-sep, Fase 3b); fila con `rango`. [→ Contexto_Base_Web.md §38B155]
function _getControlActivosGridPorTemporada(dataDir, temporada, temporadaReal, semanas, ctxVigente) {
  // Tag -> {nombre, clan, fechaIngreso} solo Estado=Activo. FIX 10-sep-2026: se guarda fechaIngreso (DC.FECHA_ING) y cada semana excluye a quien no había ingresado para su fin; sin fecha se lista siempre (fail-safe). [→ Contexto_Base_Web.md §38B156]
  var activos = {};
  for (var i = 0; i < dataDir.length; i++) {
    var fila = dataDir[i];
    if (String(fila[DC.ESTADO - 1] || '').trim() !== 'Activo') continue;
    var tagA = String(fila[DC.TAG - 1] || '').trim().toUpperCase();
    if (!tagA) continue;
    var fechaIngA = fila[DC.FECHA_ING - 1];
    activos[tagA] = {
      nombre: String(fila[DC.NOMBRE - 1] || tagA),
      clan:   String(fila[DC.CLAN - 1] || 'Sin clan'),
      rango:  String(fila[DC.RANGO - 1] || ''), // FIX 28-sep-2026 (Fase 3b): para ordenar por rango
      fechaIngreso: (fechaIngA instanceof Date && !isNaN(fechaIngA.getTime())) ? fechaIngA : null
    };
  }
  var resultado = {};
  if (!semanas.length) return resultado;

  // NUEVO 08-oct-2026: el roster sale de quienes PARTICIPARON en la temporada (activos o no). Temporada vigente: ademas siguen los Activos (regla de ingreso de siempre). Temporada pasada: un Activo sin filas en esa temporada NO aparece. Cada fila lleva `activo`. [→ Contexto_Base_Web.md §38B155]
  var participantes = _getParticipantesGuerraTemporada_(temporada, temporadaReal);
  var esVigenteRoster = String(temporada) === String(temporadaReal);
  var universo = {};
  Object.keys(participantes).forEach(function (t) {
    var pa = participantes[t];
    universo[t] = activos[t]
      ? { nombre: activos[t].nombre, clan: activos[t].clan, rango: activos[t].rango, fechaIngreso: activos[t].fechaIngreso, activo: true }
      : { nombre: pa.nombre || t, clan: pa.clan || 'Sin clan', rango: '', fechaIngreso: null, activo: false };
  });
  if (esVigenteRoster) {
    Object.keys(activos).forEach(function (t) {
      if (!universo[t]) universo[t] = { nombre: activos[t].nombre, clan: activos[t].clan, rango: activos[t].rango, fechaIngreso: activos[t].fechaIngreso, activo: true };
    });
  }
  if (Object.keys(universo).length === 0) return resultado;

  var guerraData = _getDatosGuerraParaControl({ temporada: temporada }, temporadaReal); // { tag: { sIdx: { dia_0..dia_3 } } }
  var LETRAS = ['j', 'v', 's', 'd'];

  // FIX 05-oct-2026: un día YA TERMINADO en el que nadie tiene ataques es un día sin registro y se trata como vacío (null) para todos; el día en curso no se toca (ver _diasSinRegistroReal()). [→ Contexto_Base_Web.md §38B157]
  var esTemporadaVigente = String(temporada) === String(temporadaReal);
  var hoySIdx = (ctxVigente && ctxVigente.sectionIndex !== undefined && ctxVigente.sectionIndex !== null) ? Number(ctxVigente.sectionIndex) : null;
  function _semanaYaTerminada(sIdx) {
    if (!esTemporadaVigente) return true;
    if (hoySIdx === null) return false; // sin contexto no se aplica la regla (fail-safe)
    if (sIdx < hoySIdx) return true;
    return sIdx === hoySIdx && !ctxVigente.esDiaGuerra; // entrenamiento: la guerra de esa semana aun no empieza
  }
  function _diasSinRegistroReal(sIdx) {
    var sinRegistro = [false, false, false, false];
    if (!_semanaYaTerminada(sIdx)) return sinRegistro;
    for (var d = 0; d < 4; d++) {
      var hayActividad = false, hayFilas = false;
      var tagsG = Object.keys(guerraData);
      for (var k = 0; k < tagsG.length && !hayActividad; k++) {
        var sg = guerraData[tagsG[k]] && guerraData[tagsG[k]][sIdx];
        var dd = sg ? sg['dia_' + d] : null;
        if (!dd) continue;
        hayFilas = true;
        // Solo cuentan los ATAQUES: puntaje y barcos del día son diferencias de acumulados y pueden salir positivos tras reiniciarse el contador semanal (caso real T5 S4, 05-oct-2026). [→ Contexto_Base_Web.md §38B158]
        if ((Number(dd.ataques) || 0) > 0) hayActividad = true;
      }
      if (hayFilas && !hayActividad) {
        sinRegistro[d] = true;
        Logger.log('[Valores diarios] T' + temporada + ' S' + (sIdx + 1) + ' dia ' + LETRAS[d].toUpperCase() + ': filas en 0 para todos -> se trata como dia sin registro.');
      }
    }
    return sinRegistro;
  }

  semanas.forEach(function (semana) {
    var sIdx = semana.sectionIndex;
    var diasSinRegistro = _diasSinRegistroReal(sIdx);
    var opcMemoSemana = {}; // NUEVO 05-oct-2026: días opcionales (meta ya cruzada) por clan para ESTA semana. [→ Contexto_Base_Web.md §38B159]
    // Fin (23:59:59.999) de ESTA semana, para comparar contra fechaIngreso. [→ Contexto_Base_Web.md §38B160]
    var rangoSemana = _getRangoFechasSemana(temporada, sIdx);
    var finSemanaMs = null;
    if (rangoSemana) {
      var finSemana = new Date(rangoSemana.fin.getTime());
      finSemana.setHours(23, 59, 59, 999);
      finSemanaMs = finSemana.getTime();
    }
    var porClan = {};
    Object.keys(universo).forEach(function (tag) {
      var a = universo[tag];
      var gdSemana = guerraData[tag] && guerraData[tag][sIdx];
      // NUEVO 08-oct-2026: sin filas esa semana, solo se lista a un Activo de la temporada vigente (regla de ingreso de siempre); en cualquier otro caso (inactivo, o temporada pasada) = no estuvo esa semana, no aparece. [→ Contexto_Base_Web.md §38B161]
      if (!gdSemana) {
        if (!(esVigenteRoster && a.activo)) return;
        if (a.fechaIngreso && finSemanaMs !== null && a.fechaIngreso.getTime() > finSemanaMs) return;
      }
      var fila = {
        tag: tag, nombre: a.nombre, rango: a.rango, activo: a.activo,
        j: 0, v: 0, s: 0, d: 0, total: 0,
        puntaje: { j: 0, v: 0, s: 0, d: 0, total: 0 },
        barcos:  { j: 0, v: 0, s: 0, d: 0, total: 0 }
      };
      var totalAtq = 0, totalPje = 0, totalBar = 0;
      var diasPresente = 0;
      for (var d = 0; d < 4; d++) {
        var dData = (gdSemana && !diasSinRegistro[d]) ? gdSemana['dia_' + d] : null;
        // FIX 05-oct-2026: día SIN registro (dData null) = no estaba en el clan o el día no se juega -> null (vacío); día CON registro y 0 ataques sigue siendo 0. [→ Contexto_Base_Web.md §38B162]
        if (!dData) {
          fila[LETRAS[d]] = null;
          fila.puntaje[LETRAS[d]] = null;
          fila.barcos[LETRAS[d]]  = null;
          continue;
        }
        diasPresente++;
        var atq = Number(dData.ataques) || 0;
        var pje = Number(dData.puntaje) || 0;
        var bar = Number(dData.barcos)  || 0;
        fila[LETRAS[d]] = atq;
        fila.puntaje[LETRAS[d]] = pje;
        fila.barcos[LETRAS[d]]  = bar;
        totalAtq += atq; totalPje += pje; totalBar += bar;
      }
      // Sin ningun dia presente en la semana -> Total tambien vacio.
      fila.total = diasPresente ? totalAtq : null;
      fila.puntaje.total = diasPresente ? totalPje : null;
      fila.barcos.total  = diasPresente ? totalBar : null;
      // NUEVO 05-oct-2026: días de ESTA semana en que el clan ya había cruzado la meta (atacar era opcional); campo aditivo `opc` (ej. ['s','d']); se calcula solo con Guerra_Logs. [→ Contexto_Base_Web.md §38B163]
      var opcDias = _diasOpcionalesClanSemana_(a.clan, temporada, sIdx, opcMemoSemana);
      if (opcDias.length) fila.opc = opcDias;
      if (!porClan[a.clan]) porClan[a.clan] = [];
      porClan[a.clan].push(fila);
    });
    Object.keys(porClan).forEach(function (clanNombre) {
      // FIX 28-sep-2026 (Fase 3b): orden por rango (líder > colíder > veterano > miembro, _ordenRango()) y luego nombre; antes por total de Ataques. [→ Contexto_Base_Web.md §38B164]
      porClan[clanNombre].sort(function (a, b) { return (b.activo ? 1 : 0) - (a.activo ? 1 : 0) || _ordenRango(a.rango) - _ordenRango(b.rango) || a.nombre.localeCompare(b.nombre); }); // activos primero, inactivos al final
    });
    resultado[sIdx] = porClan;
  });

  return resultado;
}

// _getValoresDiariosPorSemana(dataDir, ctx, selectores): recorre las temporadas de selectores.semanasPorTemporada y arma su cuadrícula con _getControlActivosGridPorTemporada() (una lectura por temporada); devuelve { [temporada]: { [sectionIndex]: grid } }. [→ Contexto_Base_Web.md §38B165]
function _getValoresDiariosPorSemana(dataDir, ctx, selectores) {
  var resultado = {};
  if (!selectores) return resultado;
  Object.keys(selectores.semanasPorTemporada).forEach(function (temporada) {
    resultado[temporada] = _getControlActivosGridPorTemporada(dataDir, Number(temporada), ctx.temporada, selectores.semanasPorTemporada[temporada], ctx);
  });
  return resultado;
}

// _diasOpcionalesClanSemana_(clan, temporada, sIdx, memo) — NUEVO 05-oct-2026: letras (v/s/d) de los días en que el clan ya había cruzado la meta; jueves y coliseo nunca; solo _cruceMetaDesdeGuerraLogs_() (memoizado); sin dato no se marca. [→ Contexto_Base_Web.md §38B166]
function _diasOpcionalesClanSemana_(clan, temporada, sIdx, memo) {
  var k = String(clan || '');
  if (memo.hasOwnProperty(k)) return memo[k];
  var res = [];
  try {
    if (!memo.hasOwnProperty('__coliseo')) memo['__coliseo'] = _esPeriodoDeColiseo_(temporada, sIdx * 7 + 4);
    if (!memo['__coliseo'] && k) {
      var letras = ['j', 'v', 's', 'd'];
      for (var d = 1; d < 4; d++) {
        if (_cruceMetaDesdeGuerraLogs_(k, sIdx * 7 + 3 + d, temporada) === true) res.push(letras[d]);
      }
    }
  } catch (e) {
    Logger.log('[Valores diarios] No se pudo evaluar meta cruzada (' + k + ', T' + temporada + ' S' + (sIdx + 1) + '): ' + e.message);
    res = [];
  }
  memo[k] = res;
  return res;
}

// _getControlTemporadaPorClan(ss, ctx, dataDirParam, temporadaReal): FIX 05-sep-2026; cuadrícula 'Tipo Control_2' (valores SEMANALES) por clan; usa los datos crudos de Supercell (hoja Guerra/Backup_Guerra.csv) SIN el overlay de correcciones de RoyaleAPI; públicas, lista todos los Activos; FIX 10-sep (excluye ingresos posteriores a la temporada); FIX 07-sep (parámetro temporadaReal para elegir hoja vs CSV). Detalle en el .md. [→ Contexto_Base_Web.md §38B167]
function _getControlTemporadaPorClan(ss, ctx, dataDirParam, temporadaReal) {
  if (temporadaReal === undefined || temporadaReal === null) {
    temporadaReal = _getCtx().temporada;
  }

  // FIX 05-oct-2026: el número de columnas de semanas es numSemanasTemporada (4 o 5), ya no 5 fijas, para no mostrar una 'Sem 5' inexistente. [→ Contexto_Base_Web.md §38B168]
  var MAX_SEMANAS_GRID = 5;

  var dataDir = dataDirParam;
  if (!dataDir) {
    // FASE 15-sep-2026 (fallback web->CSV): misma lógica que en _webRosterCalcular() y _getDatosDashboard(); hoy los callers ya resuelven dataDir, esta rama rara vez corre. [→ Contexto_Base_Web.md §38B169]
    var shDir = ss.getSheetByName(CFG.SHEETS.DIRECTORIO);
    if (shDir && shDir.getLastRow() >= 2) {
      dataDir = _leerDirectorioFisicoComoDC(ss);
    } else {
      var lecturaDirClan = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.DIRECTORIO, 'Backup_Directorio.csv', DIR_TOTAL_COLS);
      if (lecturaDirClan.origen === 'csv') {
        dataDir = lecturaDirClan.filas.map(function (fila) {
          var f = fila.slice();
          var vig = _parseSpanishDate(f[DC.VIGENCIA - 1]);
          if (vig instanceof Date && !isNaN(vig.getTime())) f[DC.VIGENCIA - 1] = vig;
          var fIng = _parseSpanishDate(f[DC.FECHA_ING - 1]);
          if (fIng instanceof Date && !isNaN(fIng.getTime())) f[DC.FECHA_ING - 1] = fIng;
          return f;
        });
      } else {
        return { semanas: [], porClan: {} };
      }
    }
  }

  var activos = dataDir.filter(function (fila) {
    return String(fila[DC.ESTADO - 1] || '').trim() === 'Activo';
  });

  var _c2t = Date.now();
  var guerraData          = _getDatosGuerraParaControl(ctx, temporadaReal); // hoja Guerra/Backup_Guerra.csv — datos crudos de la API de Supercell, SIN overlay de RoyaleAPI
  var numSemanasTemporada = Math.min(lunesEnMes(ctx.mesEfectivoAnio, ctx.mesEfectivoMes) || 4, MAX_SEMANAS_GRID);
  _dashAcum_('c2.guerraData', _c2t);
  _c2t = Date.now();
  var minGPorNombreClan   = _getMinGClanMapsDash_().byNombre; // 19-sep-2026: memo por ejecución del dashboard
  _dashAcum_('c2.minG', _c2t);
  _c2t = Date.now();

  // FIX 10-sep-2026: se omite la fila de quien tenga DC.FECHA_ING posterior al fin de la temporada; sin fecha se lista (fail-safe); complementa 'estuvoPresenteEstaSemana'. [→ Contexto_Base_Web.md §38B170]
  var plTemporada     = primerLunesTemporada(CFG.REF_DEFAULT, ctx.temporada);
  var finTemporadaMs  = null;
  if (plTemporada && !isNaN(plTemporada.getTime())) {
    var finTemporada = new Date(plTemporada.getTime());
    finTemporada.setDate(finTemporada.getDate() + (numSemanasTemporada * 7) - 1);
    finTemporada.setHours(23, 59, 59, 999);
    finTemporadaMs = finTemporada.getTime();
  }

  // NUEVO 08-oct-2026: universo = participantes de ESTA temporada (activos o no) + Activos si es la vigente; temporada pasada sin filas = no aparece. [→ Contexto_Base_Web.md §38B170]
  var participantes   = _getParticipantesGuerraTemporada_(ctx.temporada, temporadaReal);
  var esVigenteC2     = String(ctx.temporada) === String(temporadaReal);
  var universo = [];
  var vistos = {};
  activos.forEach(function (fila) {
    var t = String(fila[DC.TAG - 1] || '').trim();
    if (!t) return;
    var tU = t.toUpperCase();
    if (!esVigenteC2 && !participantes[tU]) return;
    vistos[tU] = true;
    universo.push({ fila: fila, activo: true });
  });
  Object.keys(participantes).forEach(function (tU) {
    if (vistos[tU]) return;
    var pa = participantes[tU];
    var f = [];
    f[DC.TAG - 1]    = pa.tag;
    f[DC.NOMBRE - 1] = pa.nombre || pa.tag;
    f[DC.CLAN - 1]   = pa.clan || 'Sin clan';
    f[DC.RANGO - 1]  = '';
    universo.push({ fila: f, activo: false });
  });
  if (universo.length === 0) return { semanas: [], porClan: {} };

  var porClan = {};
  // NUEVO 05-oct-2026 (umbral del verde semanal): días opcionales (meta ya cruzada) por clan y semana, vía _diasOpcionalesClanSemana_(), un memo por semana. [→ Contexto_Base_Web.md §38B171]
  var opcMemoPorSemana = {};

  for (var i = 0; i < universo.length; i++) {
    var jug = universo[i].fila;
    var esActivoJug = universo[i].activo;
    var tagJug = String(jug[DC.TAG - 1] || '').trim();
    if (!tagJug) continue;
    var fechaIngJug  = jug[DC.FECHA_ING - 1];
    var fechaIngreso = (fechaIngJug instanceof Date && !isNaN(fechaIngJug.getTime())) ? fechaIngJug : null;
    // Solo un Activo sin participacion en la temporada vigente se filtra por fecha de ingreso; quien participo siempre se lista.
    if (esActivoJug && !participantes[tagJug.toUpperCase()] && fechaIngreso && finTemporadaMs !== null && fechaIngreso.getTime() > finTemporadaMs) continue;
    var clanNombre = String(jug[DC.CLAN - 1] || 'Sin clan');
    var gd = guerraData[tagJug];

    var ataquesSem = [], puntajeSem = [], barcosSem = [];
    var ataqSemTotales = [], puntSemTotales = [], barcoSemTotales = [];
    var opcPresentes = 0; // NUEVO (05-oct-2026): dias opcionales sumados de las semanas presentes.
    var opcSem = []; // NUEVO (05-oct-2026): cantidad de dias opcionales de cada semana (paralelo a ataquesSem).

    for (var sem = 0; sem < numSemanasTemporada; sem++) {
      var semData = gd ? gd[sem] : null;
      var inicioSemanaPeriodIndex = (sem * 7) + 3;
      if (inicioSemanaPeriodIndex > ctx.periodIndex) {
        // Semana futura: en blanco (null, FIX 05-oct-2026: antes 0).
        ataquesSem.push(null); puntajeSem.push(null); barcosSem.push(null); opcSem.push(0);
        continue;
      }

      var ataquesArr = [], puntajeArr = [], barcosArr = [];
      for (var d = 0; d < 4; d++) {
        var dData = semData ? semData['dia_' + d] : null;
        if (dData) {
          ataquesArr.push(Number(dData.ataques) || 0);
          puntajeArr.push(Number(dData.puntaje) || 0);
          barcosArr.push(Number(dData.barcos) || 0);
        }
      }

      // Sin ningún día registrado esta semana = no estuvo en el clan; a propósito SIN overlay de RoyaleAPI (datos crudos de Supercell, como 'Tipo Control'). [→ Contexto_Base_Web.md §38B172]
      var estuvoPresenteEstaSemana = ataquesArr.length > 0;
      if (!estuvoPresenteEstaSemana) {
        // FIX 05-oct-2026: no estuvo en el clan esa semana -> vacío (null); 0 solo si estuvo y no atacó. [→ Contexto_Base_Web.md §38B173]
        ataquesSem.push(null); puntajeSem.push(null); barcosSem.push(null); opcSem.push(0);
        continue;
      }

      var tsxAta   = ataquesArr.length ? ataquesArr.reduce(function (a, b) { return a + b; }, 0) : 0;
      var tsxPunt  = puntajeArr.length ? puntajeArr.reduce(function (a, b) { return a + b; }, 0) : 0;
      var tsxBarco = barcosArr.length  ? barcosArr.reduce(function (a, b) { return a + b; }, 0)  : 0;

      ataquesSem.push(tsxAta);
      puntajeSem.push(tsxPunt);
      barcosSem.push(tsxBarco);
      if (!opcMemoPorSemana[sem]) opcMemoPorSemana[sem] = {};
      var nOpcSem = _diasOpcionalesClanSemana_(clanNombre, ctx.temporada, sem, opcMemoPorSemana[sem]).length;
      opcSem.push(nOpcSem);
      opcPresentes += nOpcSem; // solo semanas en que el jugador estuvo: se descuentan del denominador del %

      // Desde 05-oct-2026 el loop recorre 1..numSemanasTemporada: una semana 5 en una temporada de 4 no existe ni se cuenta. [→ Contexto_Base_Web.md §38B174]
      ataqSemTotales.push(Number(tsxAta) || 0);
      puntSemTotales.push(Number(tsxPunt) || 0);
      barcoSemTotales.push(Number(tsxBarco) || 0);
    }

    // % de Ataques: denominador dinámico (16 * semanas con presencia real), igual que actualizarControl2()/_getAgregadosAscensoPorTag(). [→ Contexto_Base_Web.md §38B175]
    var ataqTotal     = ataqSemTotales.length ? ataqSemTotales.reduce(function (a, b) { return a + b; }, 0) : 0;
    // FIX 05-oct-2026: el denominador descuenta 4 por cada día opcional (16 * semanas - 4 * días opcionales), igual que el Control y el umbral del verde de guerra.html; tope 100%. [→ Contexto_Base_Web.md §38B176]
    var denomAtaques  = 16 * ataqSemTotales.length - 4 * opcPresentes;
    var ataqPct       = denomAtaques > 0 ? Math.min(Math.round((ataqTotal / denomAtaques) * 100), 100) : 0;

    var puntProm = puntSemTotales.length
      ? puntSemTotales.reduce(function (a, b) { return a + b; }, 0) / puntSemTotales.length
      : 0;
    var minGJugador = minGPorNombreClan[clanNombre] || CFG.MIN_G_DEFAULT;
    var puntPct     = minGJugador > 0 ? Math.round(Math.min(puntProm / minGJugador, 1) * 100) : 0;

    var barcoTotal = barcoSemTotales.length ? barcoSemTotales.reduce(function (a, b) { return a + b; }, 0) : 0;

    // FIX 05-oct-2026: sin ninguna semana presente, Total/Prom/% quedan vacíos (null), no 0/0%. [→ Contexto_Base_Web.md §38B177]
    if (!ataqSemTotales.length)  { ataqTotal = null; ataqPct = null; }
    if (!puntSemTotales.length)  { puntProm = null; puntPct = null; }
    if (!barcoSemTotales.length) { barcoTotal = null; }

    if (!porClan[clanNombre]) porClan[clanNombre] = [];
    porClan[clanNombre].push({
      tag:    tagJug,
      nombre: String(jug[DC.NOMBRE - 1] || tagJug),
      rango:  String(jug[DC.RANGO - 1] || ''), // FIX 28-sep-2026 (Fase 3b): para ordenar por rango
      activo: esActivoJug, // NUEVO 08-oct-2026
      ataques: { semanas: ataquesSem, total: ataqTotal, pct: ataqPct, opc: opcSem }, // opc: dias opcionales por semana (NUEVO 05-oct-2026)
      puntaje: { semanas: puntajeSem, prom: puntProm === null ? null : Math.round(puntProm), pct: puntPct },
      barcos:  { semanas: barcosSem, total: barcoTotal } // sin "pct" — Control_2 tampoco tiene Barcos %
    });
  }

  _dashAcum_('c2.bucleJugadores', _c2t);
  Object.keys(porClan).forEach(function (clanNombre) {
    // FIX 28-sep-2026 (Fase 3b): mismo orden que la cuadrícula diaria (rango, luego nombre).
    porClan[clanNombre].sort(function (a, b) { return (b.activo ? 1 : 0) - (a.activo ? 1 : 0) || _ordenRango(a.rango) - _ordenRango(b.rango) || a.nombre.localeCompare(b.nombre); });
  });

  var semanas = [];
  for (var s = 1; s <= numSemanasTemporada; s++) semanas.push('Sem ' + s);

  return { semanas: semanas, porClan: porClan };
}

// _getTemporadasDisponibles(ctxReal): FIX 07-sep-2026; temporadas con datos de guerra (distintas de Backup_Guerra.csv + la vigente siempre), de más reciente a más antigua. [→ Contexto_Base_Web.md §38B178]
function _getTemporadasDisponibles(ctxReal) {
  var set = {};
  set[String(ctxReal.temporada)] = true;

  try {
    // 19-sep-2026: lectura y parseo de Backup_Guerra.csv pasó a _leerGuerraCsvAgrupado_() (22_ControlCalendario.gs), una sola vez dentro del dashboard; mismo resultado. [→ Contexto_Base_Web.md §38B179]
    var csvGuerraTemp = _leerGuerraCsvAgrupado_();
    Object.keys(csvGuerraTemp.porTemporada).forEach(function (t) {
      if (t) set[t] = true;
    });
  } catch (e) {
    Logger.log('[Cuadrícula Temporada] Error leyendo Backup_Guerra.csv para listar temporadas disponibles: ' + e.message);
  }

  return Object.keys(set).map(Number).sort(function (a, b) { return b - a; });
}

// _getControlTemporadaSelectores(ctx, temporadasDisponibles): FIX 09-sep-2026; agrupa por año -> temporada(mes) para Valores semanales (sin nivel de semana); la vigente siempre se incluye y es el porDefecto. [→ Contexto_Base_Web.md §38B180]
function _getControlTemporadaSelectores(ctx, temporadasDisponibles) {
  var temporadasPorAnio = {};
  var aniosSet = {};

  temporadasDisponibles.forEach(function (temporada) {
    var info = _getInfoTemporada(temporada);
    if (!info) return;
    aniosSet[info.anio] = true;
    if (!temporadasPorAnio[info.anio]) temporadasPorAnio[info.anio] = [];
    temporadasPorAnio[info.anio].push({ temporada: temporada, mes: info.mes, mesLabel: info.mesLabel, label: info.label });
  });

  var anios = Object.keys(aniosSet).map(Number).sort(function (a, b) { return b - a; });
  Object.keys(temporadasPorAnio).forEach(function (anio) {
    temporadasPorAnio[anio].sort(function (a, b) { return b.temporada - a.temporada; });
  });

  var infoVigente = _getInfoTemporada(ctx.temporada);
  var porDefecto = infoVigente ? { anio: infoVigente.anio, temporada: Number(ctx.temporada) } : null;

  return { anios: anios, temporadasPorAnio: temporadasPorAnio, porDefecto: porDefecto };
}

// _getControlTemporadaPorTemporada(ss, ctxReal, dataDir, temporadas): FIX 07-sep-2026; shape {semanas, porClan} por cada temporada distinta a la vigente, reusando _getControlTemporadaPorClan() sobre un ctx clonado (_clonarCtxParaTemporada()). [→ Contexto_Base_Web.md §38B181]
function _getControlTemporadaPorTemporada(ss, ctxReal, dataDir, temporadas) {
  var resultado = {};
  temporadas.forEach(function (temporada) {
    if (String(temporada) === String(ctxReal.temporada)) return; // la vigente ya viaja aparte
    var ctxTemporada = _clonarCtxParaTemporada(ctxReal, temporada);
    // FIX 07-sep-2026: se pasa ctxReal.temporada explícito (ver _getControlTemporadaPorClan()). [→ Contexto_Base_Web.md §38B182]
    resultado[temporada] = _getControlTemporadaPorClan(ss, ctxTemporada, dataDir, ctxReal.temporada);
  });
  return resultado;
}

// _getAportesInactivosSemanaActual(ss, ctx): FIX 05-sep-2026; aportes de inactivos de la semana vigente agrupados por Tag+Clan (un inactivo puede aportar a 2+ clanes el mismo día) con ataques, puntaje y barcos (delta diario por Tag+Clan, propio, no _procesarFilasGuerraParaControl()); solo tags de Inactivos con ataques > 0. Detalle en el .md. [→ Contexto_Base_Web.md §38B183]
function _getAportesInactivosSemanaActual(ss, ctx) {
  // FIX 15-sep-2026: si Inactivos no está disponible se usa Backup_Inactivos.csv (formato DC de 60 columnas), indexando con IC.* para la hoja y con DC.* para el CSV, sin mezclar esquemas. [→ Contexto_Base_Web.md §38B184]
  var shInactivos = ss.getSheetByName(CFG.SHEETS.INACTIVOS);
  var tagsInactivos = {}; // TAG (mayúsculas) -> Nombre (fallback si la fila de Guerra no trae Nombre)

  if (shInactivos && shInactivos.getLastRow() >= 2) {
    var dataInactivos = shInactivos.getRange(2, 1, shInactivos.getLastRow() - 1, INACTIVOS_TOTAL_COLS).getValues();
    for (var ii = 0; ii < dataInactivos.length; ii++) {
      var tagInact = String(dataInactivos[ii][IC.TAG - 1] || '').trim().toUpperCase();
      if (!tagInact) continue;
      tagsInactivos[tagInact] = String(dataInactivos[ii][IC.NOMBRE - 1] || tagInact);
    }
  } else {
    // Hoja no disponible: Backup_Inactivos.csv, formato DC; se indexa con DC.TAG/DC.NOMBRE, nunca con IC.*. [→ Contexto_Base_Web.md §38B185]
    var lecturaInactivosAportes = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.INACTIVOS, 'Backup_Inactivos.csv', DIR_TOTAL_COLS);
    if (lecturaInactivosAportes.origen === 'csv') {
      var dataInactivosCsv = lecturaInactivosAportes.filas;
      for (var jj = 0; jj < dataInactivosCsv.length; jj++) {
        var tagInactCsv = String(dataInactivosCsv[jj][DC.TAG - 1] || '').trim().toUpperCase();
        if (!tagInactCsv) continue;
        tagsInactivos[tagInactCsv] = String(dataInactivosCsv[jj][DC.NOMBRE - 1] || tagInactCsv);
      }
    }
  }
  if (Object.keys(tagsInactivos).length === 0) return {};

  // FASE 15-sep-2026 (fallback web->CSV): mismo criterio que el bloque de Guerra de _getDatosDashboard(); campos numéricos o texto plano. [→ Contexto_Base_Web.md §38B186]
  var shGuerra = ss.getSheetByName(CFG.SHEETS.GUERRA);
  var dataGuerra;
  if (shGuerra && shGuerra.getLastRow() >= 2) {
    dataGuerra = shGuerra.getRange(2, 1, shGuerra.getLastRow() - 1, GUERRA_TOTAL_COLS).getValues();
  } else {
    var lecturaGuerraAportes = _obtenerFilasConFallbackCSV(ss, CFG.SHEETS.GUERRA, 'Backup_Guerra.csv', GUERRA_TOTAL_COLS);
    dataGuerra = lecturaGuerraAportes.filas;
  }
  if (!dataGuerra || dataGuerra.length === 0) return {};

  var basePIdx = ctx.sectionIndex * 7 + 3; // Jueves de la semana vigente (offset 0)

  // grupos[clanNombre][tag] = { nombre, dias:[{ataques,puntaje,barcos} x4] }
  var grupos = {};

  // Acumulado de Fame/Barcos por periodo indexado por Tag+Clan; se resuelve a delta diario en la segunda pasada. [→ Contexto_Base_Web.md §38B187]
  var fameByKeyPeriod   = {}; // 'TAG|Clan' -> { periodIndex: fameAcumulado }
  var barcosByKeyPeriod = {}; // 'TAG|Clan' -> { periodIndex: barcosAcumulado }

  for (var g = 0; g < dataGuerra.length; g++) {
    var fila = dataGuerra[g];
    if (String(fila[GC.TEMPORADA - 1] || '') !== String(ctx.temporada)) continue;
    var semanaFila = Number(fila[GC.SEMANA - 1] || 1) - 1;
    if (semanaFila !== ctx.sectionIndex) continue; // Solo la semana vigente

    var tagFila = String(fila[GC.TAG - 1] || '').trim().toUpperCase();
    if (!tagFila || !tagsInactivos.hasOwnProperty(tagFila)) continue;

    var pIdxFila = Number(fila[GC.PERIOD_IDX - 1] || 0);
    var dOff = pIdxFila - basePIdx; // 0=Jueves, 1=Viernes, 2=Sábado, 3=Domingo
    if (dOff < 0 || dOff > 3) continue; // Filas fuera de Jue-Dom (no debería haber, por las dudas)

    var clanFila   = String(fila[GC.CLAN - 1] || 'Sin clan');
    var nombreFila = String(fila[GC.NOMBRE - 1] || '') || tagsInactivos[tagFila];
    var ataquesDia = Number(fila[GC.ATAQUES_HOY - 1]) || 0;
    var fameFila   = Number(fila[GC.FAME   - 1]) || 0;
    var barcosFila = Number(fila[GC.BARCOS - 1]) || 0;

    if (!grupos[clanFila]) grupos[clanFila] = {};
    if (!grupos[clanFila][tagFila]) {
      grupos[clanFila][tagFila] = {
        nombre: nombreFila,
        dias: [
          { ataques: 0, puntaje: 0, barcos: 0 },
          { ataques: 0, puntaje: 0, barcos: 0 },
          { ataques: 0, puntaje: 0, barcos: 0 },
          { ataques: 0, puntaje: 0, barcos: 0 }
        ]
      };
    }
    var registro = grupos[clanFila][tagFila];
    if (ataquesDia > registro.dias[dOff].ataques) registro.dias[dOff].ataques = ataquesDia; // por si hubiera algún duplicado suelto
    if (nombreFila) registro.nombre = nombreFila; // se queda con el nombre más reciente visto

    // GC.FAME/GC.BARCOS son acumulados de TODA la semana (no del día); aquí solo se registra el acumulado del periodo, el delta se calcula después. [→ Contexto_Base_Web.md §38B188]
    var claveTC = tagFila + '|' + clanFila;
    if (!fameByKeyPeriod[claveTC])   fameByKeyPeriod[claveTC]   = {};
    if (!barcosByKeyPeriod[claveTC]) barcosByKeyPeriod[claveTC] = {};
    fameByKeyPeriod[claveTC][pIdxFila]   = fameFila;
    barcosByKeyPeriod[claveTC][pIdxFila] = Math.max(barcosByKeyPeriod[claveTC][pIdxFila] || 0, barcosFila);
  }

  // Segunda pasada: Puntaje/Barcos del día = acumulado de hoy - acumulado de ayer por Tag+Clan; en el jueves 'ayer' es 0 (el contador se reinicia cada semana de guerra). [→ Contexto_Base_Web.md §38B189]
  Object.keys(grupos).forEach(function (clanNombre) {
    Object.keys(grupos[clanNombre]).forEach(function (tag) {
      var registro = grupos[clanNombre][tag];
      var claveTC  = tag + '|' + clanNombre;
      for (var d = 0; d < 4; d++) {
        var pIdxHoy  = basePIdx + d;
        var pIdxAyer = pIdxHoy - 1;

        var fameHoy   = (fameByKeyPeriod[claveTC]   && fameByKeyPeriod[claveTC][pIdxHoy])    || 0;
        var fameAyer  = (fameByKeyPeriod[claveTC]   && fameByKeyPeriod[claveTC][pIdxAyer])   || 0;
        registro.dias[d].puntaje = Math.min(Math.max(fameHoy - fameAyer, 0), 900);

        var barcosHoy  = (barcosByKeyPeriod[claveTC] && barcosByKeyPeriod[claveTC][pIdxHoy])  || 0;
        var barcosAyer = (barcosByKeyPeriod[claveTC] && barcosByKeyPeriod[claveTC][pIdxAyer]) || 0;
        registro.dias[d].barcos = Math.max(barcosHoy - barcosAyer, 0);
      }
    });
  });

  var resultado = {};
  Object.keys(grupos).forEach(function (clanNombre) {
    var lista = Object.keys(grupos[clanNombre]).map(function (tag) {
      var r = grupos[clanNombre][tag];
      var total = r.dias[0].ataques + r.dias[1].ataques + r.dias[2].ataques + r.dias[3].ataques;
      var puntaje = {
        j: r.dias[0].puntaje, v: r.dias[1].puntaje, s: r.dias[2].puntaje, d: r.dias[3].puntaje
      };
      puntaje.total = puntaje.j + puntaje.v + puntaje.s + puntaje.d;
      var barcos = {
        j: r.dias[0].barcos, v: r.dias[1].barcos, s: r.dias[2].barcos, d: r.dias[3].barcos
      };
      barcos.total = barcos.j + barcos.v + barcos.s + barcos.d;
      return {
        tag:     tag,
        nombre:  r.nombre,
        j:       r.dias[0].ataques,
        v:       r.dias[1].ataques,
        s:       r.dias[2].ataques,
        d:       r.dias[3].ataques,
        total:   total,
        puntaje: puntaje,
        barcos:  barcos
      };
    }).filter(function (r) { return r.total > 0; }); // Sin aportes reales de ataques esta semana, no se muestra

    if (lista.length > 0) {
      lista.sort(function (a, b) { return b.total - a.total; });
      resultado[clanNombre] = lista;
    }
  });

  return resultado;
}

// _escapeHtmlDash(s): escapa texto dinámico antes de insertarlo en el HTML del dashboard. [→ Contexto_Base_Web.md §38B190]
function _escapeHtmlDash(s) {
  return String(s === null || s === undefined ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// _getNombreClanDump(clanTag): nombre del clan desde cache o API (retrocompatibilidad). Desde 19-sep/02-oct-2026 también usa la hoja Clan dentro del dashboard y el último checkpoint de clanes en Drive antes de la API. [→ Contexto_Base_Web.md §38B191]
function _getNombreClanDump(clanTag) {
  var cached = _getClanCache(clanTag);
  if (cached && cached.info && cached.info.name) return cached.info.name;
  // 19-sep-2026 (c2.minG = 5,3 s): dentro de _getDatosDashboard() (_DASH_MEMO activo) el nombre del clan sale de la hoja Clan en vez de una llamada HTTP por clan; si no está, camino de siempre (API). [→ Contexto_Base_Web.md §38B192]
  if (_DASH_MEMO) {
    var nombreHoja = _nombreClanDesdeHojaClanDash_(clanTag);
    if (nombreHoja) return nombreHoja;
  }
  // FIX 02-oct-2026: antes de la API se usa el nombre del último checkpoint de clanes en Drive (leído una vez por ejecución), para no devolver el TAG como nombre si la API falla (500/525). [→ Contexto_Base_Web.md §38B193]
  if (_NOMBRES_CLAN_CHECKPOINT === null) {
    _NOMBRES_CLAN_CHECKPOINT = {};
    var cp = _cargarProgresoClanesSinEdad();
    if (cp) {
      for (var k in cp) {
        if (cp[k] && cp[k].info && cp[k].info.name) _NOMBRES_CLAN_CHECKPOINT[cleanTag(k)] = cp[k].info.name;
      }
    }
  }
  if (_NOMBRES_CLAN_CHECKPOINT[cleanTag(clanTag)]) return _NOMBRES_CLAN_CHECKPOINT[cleanTag(clanTag)];
  var info = _apiGet('/clans/' + encodeTag(clanTag));
  if (info && info.name) return info.name;
  return cleanTag(clanTag);
}

// FIX (02-oct-2026): memo por ejecución { tagLimpio: nombre } leído del checkpoint de clanes.
var _NOMBRES_CLAN_CHECKPOINT = null;

// _getClanTagByName(clanName): tag de un clan por nombre, para ordenar por TERNA_TAGS; '' si no existe. [→ Contexto_Base_Web.md §38B194]
function _getClanTagByName(clanName) {
  if (!CACHE_CLAN_DATA) return '';
  for (var tag in CACHE_CLAN_DATA) {
    var info = CACHE_CLAN_DATA[tag] && CACHE_CLAN_DATA[tag].info;
    if (info && String(info.name || '') === clanName) return tag;
  }
  return '';
}

// _generarDashboardHtml(): arma la página HTML completa del dashboard (mobile-first, sin dependencias externas) desde _getDatosDashboard(). [→ Contexto_Base_Web.md §38B195]
function _generarDashboardHtml() {
  var d   = _getDatosDashboard();
  var ctx = d.ctx;
  var e   = _escapeHtmlDash;

  var etapaTexto  = ctx.esDiaGuerra ? 'GUERRA' : 'ENTRENAMIENTO';
  var etapaColor  = ctx.esDiaGuerra ? '#e53935' : '#1e88e5';
  var diaNombre   = diaLetraANombre(ctx.diaLetra);

  // ---- Bloque: Estado de guerra por clan ----
  var clanesOrdenNombres = Object.keys(d.guerraPorClan).sort();
  var htmlGuerra = '';
  if (clanesOrdenNombres.length === 0) {
    htmlGuerra = '<p class="vacio">Sin datos de guerra para hoy todavía.</p>';
  } else {
    clanesOrdenNombres.forEach(function(clanNombre) {
      var g = d.guerraPorClan[clanNombre];
      var barcosHtml = g.barcos > 0
        ? '<span class="badge badge-alerta">⚠️ ' + g.barcos + ' barco(s)</span>'
        : '';
      htmlGuerra +=
        '<div class="card">' +
          '<div class="card-titulo">' + e(clanNombre) + '</div>' +
          '<div class="card-fila"><span>Atacaron hoy</span><b>' + g.atacaron + ' / ' + g.totalHoy + '</b></div>' +
          '<div class="card-fila"><span>Ataques usados</span><b>' + g.ataques + '</b></div>' +
          '<div class="card-fila"><span>Medallas del día</span><b>' + g.fame.toLocaleString('es-PE') + '</b></div>' +
          (barcosHtml ? '<div class="card-fila">' + barcosHtml + '</div>' : '') +
        '</div>';
    });
  }

  // ---- Bloque: Pendientes de atacar ----
  var htmlPendientes;
  if (!ctx.esDiaGuerra) {
    htmlPendientes = '<p class="vacio">Hoy es día de entrenamiento — no hay ataques de guerra pendientes.</p>';
  } else if (d.pendientes.length === 0) {
    htmlPendientes = '<p class="vacio">🎉 Nadie tiene ataques pendientes.</p>';
  } else {
    var pendPorClan = {};
    d.pendientes.forEach(function(p) {
      if (!pendPorClan[p.clan]) pendPorClan[p.clan] = [];
      pendPorClan[p.clan].push(p);
    });
    htmlPendientes = Object.keys(pendPorClan).sort().map(function(clanNombre) {
      var filas = pendPorClan[clanNombre].map(function(p) {
        return '<div class="lista-fila"><span>' + e(p.nombre) + '</span>' +
               '<b class="faltan">' + p.faltantes + ' ataque(s)</b></div>';
      }).join('');
      return '<div class="card"><div class="card-titulo">' + e(clanNombre) + '</div>' + filas + '</div>';
    }).join('');
  }

  // ---- Bloque: Resumen de Directorio ----
  var clanesResumen = Object.keys(d.resumenClanes).sort();
  var totalActivos  = clanesResumen.reduce(function(acc, c) { return acc + d.resumenClanes[c]; }, 0);
  var htmlResumen = '<div class="card">' +
    clanesResumen.map(function(clanNombre) {
      return '<div class="card-fila"><span>' + e(clanNombre) + '</span><b>' + d.resumenClanes[clanNombre] + '</b></div>';
    }).join('') +
    '<div class="card-fila total"><span>Total activos</span><b>' + totalActivos + '</b></div>' +
  '</div>';

  // ---- Bloque: Miembros nuevos (con links RoyaleAPI / CWStats) ----
  var htmlNuevos;
  if (d.nuevos.length === 0) {
    htmlNuevos = '<p class="vacio">No hay miembros nuevos por revisar.</p>';
  } else {
    htmlNuevos = d.nuevos.map(function(n) {
      // FIX 08-oct-2026: n.fechaIng puede llegar como texto (lectura desde Backup_Directorio.csv) y formatDate solo acepta Date; se convierte con _parseSpanishDate() y, si no es una fecha valida, se muestra tal cual.
      var fIngDate = (n.fechaIng instanceof Date) ? n.fechaIng : (n.fechaIng ? _parseSpanishDate(n.fechaIng) : null);
      var fechaTxt = (fIngDate instanceof Date && !isNaN(fIngDate.getTime()))
        ? Utilities.formatDate(fIngDate, Session.getScriptTimeZone() || 'America/Lima', 'dd/MM/yyyy')
        : (n.fechaIng ? String(n.fechaIng) : '—');
      return '<div class="card">' +
        '<div class="card-titulo">' + e(n.nombre) + ' <span class="tag-chip">' + e(n.tag) + '</span></div>' +
        '<div class="card-fila"><span>Clan</span><b>' + e(n.clan) + '</b></div>' +
        '<div class="card-fila"><span>Ingresó</span><b>' + fechaTxt + '</b></div>' +
        '<div class="links-fila">' +
          '<a class="btn-link" href="' + n.royaleApi + '" target="_blank" rel="noopener">RoyaleAPI</a>' +
          '<a class="btn-link" href="' + n.cwstats + '" target="_blank" rel="noopener">CWStats</a>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  var actualizado = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Lima', 'dd/MM/yyyy HH:mm');

  return '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">' +
'<meta name="viewport" content="width=device-width, initial-scale=1">' +
'<title>Dashboard - Familia Terna</title>' +
'<style>' +
'  * { box-sizing: border-box; }' +
'  body { margin:0; padding:0; background:#f2f2f5; font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif; color:#222; }' +
'  header { background:#1a1a2e; color:#fff; padding:20px 16px 24px; text-align:center; }' +
'  header h1 { margin:0 0 6px; font-size:20px; }' +
'  header .sub { font-size:13px; opacity:0.85; }' +
'  .etapa-badge { display:inline-block; margin-top:10px; padding:5px 14px; border-radius:999px; font-weight:bold; font-size:13px; color:#fff; }' +
'  main { max-width:640px; margin:-16px auto 0; padding:0 12px 32px; }' +
'  section { margin-top:20px; }' +
'  section h2 { font-size:15px; text-transform:uppercase; letter-spacing:0.5px; color:#555; margin:0 0 10px 4px; }' +
'  .card { background:#fff; border-radius:12px; padding:14px 16px; margin-bottom:10px; box-shadow:0 1px 3px rgba(0,0,0,0.08); }' +
'  .card-titulo { font-weight:bold; font-size:15px; margin-bottom:8px; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }' +
'  .card-fila { display:flex; justify-content:space-between; padding:4px 0; font-size:14px; border-bottom:1px solid #f0f0f0; }' +
'  .card-fila:last-child { border-bottom:none; }' +
'  .card-fila.total { font-weight:bold; border-top:2px solid #eee; margin-top:4px; padding-top:8px; }' +
'  .lista-fila { display:flex; justify-content:space-between; padding:6px 0; font-size:14px; border-bottom:1px solid #f5f5f5; }' +
'  .lista-fila:last-child { border-bottom:none; }' +
'  .faltan { color:#e53935; }' +
'  .badge { display:inline-block; padding:3px 10px; border-radius:999px; font-size:12px; font-weight:bold; }' +
'  .badge-alerta { background:#ffebee; color:#c62828; }' +
'  .tag-chip { font-weight:normal; font-size:12px; color:#777; background:#f0f0f0; padding:2px 8px; border-radius:999px; }' +
'  .links-fila { display:flex; gap:8px; margin-top:10px; }' +
'  .btn-link { flex:1; text-align:center; padding:8px 0; border-radius:8px; background:#1a1a2e; color:#fff; text-decoration:none; font-size:13px; font-weight:bold; }' +
'  .vacio { color:#777; font-size:14px; background:#fff; border-radius:12px; padding:16px; text-align:center; }' +
'  footer { text-align:center; font-size:12px; color:#999; padding:20px 0 8px; }' +
'</style></head><body>' +
'<header>' +
  '<h1>👑 Dashboard Familia Terna</h1>' +
  '<div class="sub">Temporada ' + ctx.temporada + ' · Semana ' + (ctx.sectionIndex + 1) + ' · ' + diaNombre + '</div>' +
  '<span class="etapa-badge" style="background:' + etapaColor + '">' + etapaTexto + '</span>' +
'</header>' +
'<main>' +
  '<section><h2>⚔️ Estado de guerra hoy</h2>' + htmlGuerra + '</section>' +
  '<section><h2>⏳ Pendientes de atacar</h2>' + htmlPendientes + '</section>' +
  '<section><h2>👥 Miembros activos por clan</h2>' + htmlResumen + '</section>' +
  '<section><h2>🆕 Miembros nuevos</h2>' + htmlNuevos + '</section>' +
'</main>' +
'<footer>Actualizado: ' + actualizado + '</footer>' +
'</body></html>';
}