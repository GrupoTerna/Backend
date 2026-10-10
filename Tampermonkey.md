// ==UserScript==
// @name         Familia Terna - Corrección de Guerra + Miembros Nuevos + Verificar Semana (RoyaleAPI)
// @namespace    familia-terna-correccion-guerra
// @version      3.0
// @description  Corrección de guerra (Ataques/Fame/Barcos de clanes Terna), detección de miembros nuevos (historial en otro clan) y verificación de la semana en curso contra /war/race (cuarto flujo independiente, deja discrepancias pendientes de aprobación manual) desde RoyaleAPI. Corrección de guerra: PRIMERO lee las 4 páginas "War Log" (fuente principal, con Barcos, sin pegar nada a mano), usa "War Analytics" SOLO de respaldo para los clanes cuyo Log no cargó, y SOLO para los jugadores que sigan sin cubrirse recurre al método anterior (perfil por perfil). v2.3: los tokens ya no van escritos en el script; se guardan en Tampermonkey (botón 🔑 del panel) y un 401 del backend se reporta como tal. v2.4: los tokens se piden en un formulario dentro de la página (no se cierra al cambiar de pestaña) y los 3 botones muestran «Cargando». v2.5: si Cloudflare pide verificación, el proceso se queda en espera (sin recargar ni saltar jugadores), te avisa con notificación/sonido/título parpadeante y continúa solo al resolverla. v2.6: un 401 ya no borra el token guardado (un solo rechazo puntual dejaba todos los envíos siguientes con token vacío), los lotes que fallan se conservan en cola en vez de perderse, y tras repetidos rechazos/fallos el proceso se pausa solo en vez de seguir sin poder guardar. v2.7: botón 🩺 que prueba la URL y cada token (sin tocar datos) y limpia lo que se pega en el formulario de tokens (comillas, «NOMBRE=», espacios invisibles). v2.8 (pedido usuario): el panel ahora se puede redimensionar a voluntad arrastrando su esquina inferior derecha (como cualquier ventana), y el tamaño elegido se recuerda entre páginas aunque el script navegue constantemente. Además, la verificación de Cloudflare ya NO reproduce sonido ni muestra notificación de escritorio — el aviso queda solo en el título de la pestaña (parpadeante) y el banner rojo en pantalla. v2.9 (pedido usuario, Fase 15a del plan): el Log pasa a ser la fuente principal y Analytics queda solo de respaldo (se visita únicamente si el Log de algún clan no cargó); si un jugador aparece en el Log de 2 o más clanes Terna la misma semana, ataques/fame/barcos se SUMAN antes de enviarlos (antes la segunda fila pisaba a la primera); y el Perfil ya no reenvía semanas que Log/Analytics aportaron en la misma corrida. v3.0 (pedido usuario, Fase 15 tanda 2): el script DEJA DE SUMAR entre clanes; cada fila de Log/Analytics se envía por separado con su clanTag (una fila por jugador, semana y clan) y el backend hace la suma para Control/Control_2. Las filas del Perfil siguen saliendo sin clanTag.
// @author       Familia Terna
// @match        https://royaleapi.com/*
// @icon         https://royaleapi.com/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// @connect      script.google.com
// @connect      script.googleusercontent.com
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // =========================================================================
  // CONFIGURACIÓN — EDITAR ANTES DE USAR
  // =========================================================================
  var WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbwxTdbddzujbus0e5JT8cDcSHrOB6i-txjdjTu6_cbUGIYmNsF0P8MF71eFmH8_3MKfiw/exec';

  // FIX (20-sep-2026, pedido usuario: "hubo cambios en Base.md y sus tokens,
  // ahora cuando ejecuto Tampermonkey me dice que el backend no responde con
  // un JSON válido"). Causa encontrada: los 4 tokens de este script
  // (CORRECCION_GUERRA_TOKEN, NUEVOS_ROYALEAPI_TOKEN, HISTORIAL_GUERRA_TOKEN,
  // VERIFICAR_RIVERRACE_TOKEN) se rotaron en el backend (Bk-1 de
  // Plan_Fases.md) y este archivo seguía con los valores viejos escritos a
  // mano. Con un token viejo, el backend responde JSON válido
  // {error:'No autorizado', code:401} (ver doGet()/doPost() en
  // 08_Web_Endpoints.gs) -- pero el script solo miraba `data.ok`, así que lo
  // trataba como "sin JSON válido" (mensaje engañoso, y además reintentaba
  // 3 veces algo que nunca iba a funcionar).
  // Ahora los tokens YA NO están escritos en este archivo (además de
  // resolver las rotaciones futuras sin editar el script, evita que el valor
  // vuelva a quedar expuesto cada vez que se comparte este archivo, el mismo
  // problema que originó la rotación). Se guardan en el almacenamiento de
  // Tampermonkey (GM_setValue) y se piden una sola vez: al pulsar "Iniciar"
  // si faltan, cuando el backend responde 401, o a demanda con el botón 🔑
  // del panel. El valor vigente de cada uno está en Apps Script ▸
  // Configuración del proyecto ▸ Propiedades del script.
  var TOKENS_INFO = {
    cg:        { propiedad: 'CORRECCION_GUERRA_TOKEN',   etiqueta: 'Corrección de Guerra' },
    nuevos:    { propiedad: 'NUEVOS_ROYALEAPI_TOKEN',    etiqueta: 'Miembros nuevos' },
    historial: { propiedad: 'HISTORIAL_GUERRA_TOKEN',    etiqueta: 'Histórico de Guerra' },
    race:      { propiedad: 'VERIFICAR_RIVERRACE_TOKEN', etiqueta: 'Verificar semana en curso' }
  };

  function _claveToken(id) { return 'cg_token_' + id; }

  function leerToken(id) {
    return String(GM_getValue(_claveToken(id), '') || '');
  }

  function invalidarToken(id) {
    GM_deleteValue(_claveToken(id));
  }

  /**
   * tokensFaltantes(ids)
   * De la lista de ids, los que todavía no tienen token guardado.
   */
  function tokensFaltantes(ids) {
    return ids.filter(function (id) { return !leerToken(id); });
  }

  /**
   * _limpiarTokenPegado(v)
   * FIX (21-sep-2026): un token copiado de Apps Script o del código puede traer
   * cosas que no son parte del valor y el backend lo compara EXACTO (`!==`):
   * espacios invisibles (nbsp, zero-width), comillas alrededor, un «;» o «,»
   * final, o el prefijo «NOMBRE_DE_LA_PROPERTY=». Se quitan al guardar.
   */
  function _limpiarTokenPegado(v) {
    v = String(v || '').replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '').trim();
    v = v.replace(/^[A-Z_]+\s*[=:]\s*/, '');
    v = v.replace(/^['"`\u201C\u201D\u2018\u2019]+/, '').replace(/['"`\u201C\u201D\u2018\u2019;,]+$/, '');
    return v.trim();
  }

  function _escHtml(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /**
   * mostrarFormularioTokens(ids, motivo, alTerminar)
   * FIX (20-sep-2026, pedido usuario: "presiono la llave pero cuando volteo
   * a la página de Apps Script a copiar el token, la ventanita de
   * Tampermonkey se cierra, solo dura como 3 segundos"). Los prompt() son
   * diálogos del navegador y se cierran solos al cambiar de pestaña, así que
   * no daba tiempo de copiar 4 valores. Ahora es un formulario dentro de la
   * propia página (no bloqueante): se queda abierto mientras vas a Apps
   * Script a copiar y solo se cierra con Guardar o Cancelar. Un campo vacío
   * conserva el valor que ya hubiera guardado.
   * `alTerminar` se llama sin argumentos al cerrar (Guardar o Cancelar);
   * quien llama decide con tokensFaltantes() si quedó todo listo.
   */
  function mostrarFormularioTokens(ids, motivo, alTerminar) {
    var previo = document.getElementById('cg-tokens-overlay');
    if (previo && previo.parentNode) previo.parentNode.removeChild(previo);

    var ov = document.createElement('div');
    ov.id = 'cg-tokens-overlay';
    ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.65);' +
      'z-index:1000000;display:flex;align-items:center;justify-content:center;';

    var html =
      '<div style="background:#111;color:#eee;font:13px/1.45 monospace;border:1px solid #555;border-radius:8px;' +
        'padding:16px;width:460px;max-width:92vw;max-height:88vh;overflow-y:auto;box-shadow:0 8px 30px rgba(0,0,0,.6);">' +
      '<div style="font-weight:bold;font-size:14px;margin-bottom:6px;">🔑 Tokens del backend</div>' +
      (motivo ? '<div style="color:#f0b429;margin-bottom:8px;">' + _escHtml(motivo) + '</div>' : '') +
      '<div style="color:#aaa;margin-bottom:10px;">Copia cada valor desde Apps Script ▸ Configuración del proyecto ▸ ' +
        'Propiedades del script. Esta ventana no se cierra sola: puedes cambiar de pestaña y volver. ' +
        'Se guardan solo en este navegador (Tampermonkey), no dentro del script.</div>';
    for (var i = 0; i < ids.length; i++) {
      var info = TOKENS_INFO[ids[i]];
      var hay = !!leerToken(ids[i]);
      html +=
        '<div style="margin-bottom:10px;">' +
          '<div style="font-weight:bold;">' + _escHtml(info.etiqueta) + '</div>' +
          '<div style="color:#888;font-size:11px;">' + _escHtml(info.propiedad) + '</div>' +
          '<input type="text" data-token-id="' + ids[i] + '" autocomplete="off" spellcheck="false" placeholder="' +
            (hay ? 'Ya hay uno guardado — vacío = conservarlo' : 'Pega aquí el valor') + '" ' +
            'style="width:100%;box-sizing:border-box;padding:6px;margin-top:3px;background:#222;color:#eee;' +
            'border:1px solid #555;border-radius:4px;font:12px monospace;">' +
        '</div>';
    }
    html +=
      '<div style="display:flex;gap:8px;margin-top:6px;">' +
        '<button id="cg-tokens-guardar" style="flex:1;padding:8px;background:#2b7a2b;color:#fff;border:0;border-radius:4px;cursor:pointer;">Guardar</button>' +
        '<button id="cg-tokens-cancelar" style="flex:1;padding:8px;background:#555;color:#fff;border:0;border-radius:4px;cursor:pointer;">Cancelar</button>' +
      '</div></div>';
    ov.innerHTML = html;

    // RoyaleAPI tiene atajos de teclado a nivel de documento: se cortan acá
    // para que escribir/pegar en los campos no dispare nada de la página.
    ['keydown', 'keyup', 'keypress'].forEach(function (tipo) {
      ov.addEventListener(tipo, function (e) { e.stopPropagation(); });
    });

    function cerrar() { if (ov.parentNode) ov.parentNode.removeChild(ov); }

    ov.querySelector('#cg-tokens-guardar').onclick = function () {
      var campos = ov.querySelectorAll('input[data-token-id]');
      for (var k = 0; k < campos.length; k++) {
        var v = _limpiarTokenPegado(campos[k].value);
        if (v) GM_setValue(_claveToken(campos[k].getAttribute('data-token-id')), v);
      }
      cerrar();
      if (alTerminar) alTerminar();
    };
    ov.querySelector('#cg-tokens-cancelar').onclick = function () {
      cerrar();
      if (alTerminar) alTerminar();
    };

    document.body.appendChild(ov);
    var primero = ov.querySelector('input[data-token-id]');
    if (primero) setTimeout(function () { primero.focus(); }, 50);
  }


  // -------------------------------------------------------------------------
  // DIAGNÓSTICO DE CONEXIÓN (FIX 21-sep-2026, botón 🩺 del panel)
  // Pedido: "ya ingresé manualmente cada token pero sigue fallando". Sin ver
  // el mensaje exacto no se sabe si falla un token, la URL del Web App o el
  // despliegue, así que este botón lo prueba todo de una vez. Manda a cada
  // endpoint un envío VACÍO: el backend lo rechaza con «Sin ... en el payload»
  // ANTES de tocar ninguna hoja (comprobado en Base.md: _aplicarCorreccionesGuerra,
  // _aplicarImportacionNuevos, _aplicarHistorialGuerra y
  // _procesarVerificacionRiverRace), pero solo después de validar el token, así
  // que la respuesta distingue: token válido / token rechazado (401) / el
  // backend ni siquiera devuelve JSON (URL vieja, despliegue caído, Property
  // faltante). Solo deja una línea en el log de Drive de cada botón.
  // -------------------------------------------------------------------------
  var DIAG_PRUEBAS = {
    cg:        { accion: 'corregirGuerra',        cuerpo: { correcciones: [] } },
    nuevos:    { accion: 'importarNuevos',        cuerpo: { candidatos: [] } },
    historial: { accion: 'historialGuerra',       cuerpo: { candidatos: [] } },
    race:      { accion: 'verificarSemanaActual', cuerpo: { participantes: [] } }
  };

  function _clasificarPrueba(status, texto) {
    var data = null;
    try { data = JSON.parse(texto); } catch (e) { data = null; }
    if (data === null || typeof data !== 'object') {
      var plano = String(texto || '')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
      return { ok: false, texto: 'HTTP ' + status + ' — el backend no devolvió JSON' + (plano ? ': «' + plano + '»' : '') };
    }
    if (data.code === 401) return { ok: false, texto: 'Token RECHAZADO (401 No autorizado)' };
    if (data.error) return { ok: true, texto: 'Token válido (el backend respondió: ' + data.error + ')' };
    if (data.ok === true) return { ok: true, texto: 'Token válido' };
    return { ok: false, texto: 'Respuesta inesperada: ' + JSON.stringify(data).slice(0, 150) };
  }

  function _describirTokenGuardado(id) {
    var t = leerToken(id);
    if (!t) return 'sin token guardado';
    var raro = /[^A-Za-z0-9_\-]/.test(t) ? ' ⚠ contiene caracteres poco comunes' : '';
    return 'guardado: ' + t.length + ' caracteres, empieza «' + t.slice(0, 2) + '», termina «' + t.slice(-2) + '»' + raro;
  }

  function _probarEndpoint(id, callback) {
    if (!leerToken(id)) { callback({ ok: false, texto: 'No hay token guardado: pégalo con el botón 🔑' }); return; }
    var prueba = DIAG_PRUEBAS[id];
    GM_xmlhttpRequest({
      method: 'POST',
      url: WEBAPP_URL + '?accion=' + prueba.accion + '&token=' + encodeURIComponent(leerToken(id)),
      data: JSON.stringify(prueba.cuerpo),
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000,
      onload: function (res) { callback(_clasificarPrueba(res.status, res.responseText)); },
      onerror: function (e) { callback({ ok: false, texto: 'Error de red: ' + JSON.stringify(e) }); },
      ontimeout: function () { callback({ ok: false, texto: 'Sin respuesta en 60 s (el backend está lento o no responde)' }); }
    });
  }

  function probarConexion() {
    var previo = document.getElementById('cg-diag-overlay');
    if (previo && previo.parentNode) previo.parentNode.removeChild(previo);

    var ids = Object.keys(TOKENS_INFO);
    var resultados = {};
    var ov = document.createElement('div');
    ov.id = 'cg-diag-overlay';
    ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.65);' +
      'z-index:1000000;display:flex;align-items:center;justify-content:center;';

    function render() {
      var html =
        '<div style="background:#111;color:#eee;font:13px/1.45 monospace;border:1px solid #555;border-radius:8px;' +
          'padding:16px;width:520px;max-width:94vw;max-height:88vh;overflow-y:auto;box-shadow:0 8px 30px rgba(0,0,0,.6);">' +
        '<div style="font-weight:bold;font-size:14px;margin-bottom:6px;">🩺 Diagnóstico de conexión</div>' +
        '<div style="color:#aaa;margin-bottom:10px;">URL del Web App: …' + _escHtml(WEBAPP_URL.slice(-30)) +
          '<br>Cada prueba es un envío vacío: no modifica datos (deja una línea en el log de Drive).</div>';
      for (var i = 0; i < ids.length; i++) {
        var r = resultados[ids[i]];
        html += '<div style="margin-bottom:10px;">' +
          '<div style="font-weight:bold;">' + (r ? (r.ok ? '✔ ' : '✖ ') : '⏳ ') + _escHtml(TOKENS_INFO[ids[i]].etiqueta) + '</div>' +
          '<div style="color:#888;font-size:11px;">' + _escHtml(TOKENS_INFO[ids[i]].propiedad) + ' — ' + _escHtml(_describirTokenGuardado(ids[i])) + '</div>' +
          '<div style="color:' + (r ? (r.ok ? '#7fd17f' : '#ff8a80') : '#aaa') + ';">' + (r ? _escHtml(r.texto) : 'probando…') + '</div>' +
          '</div>';
      }
      var hechas = ids.filter(function (id) { return resultados[id]; });
      if (hechas.length === ids.length) {
        var todasOk = ids.every(function (id) { return resultados[id] && resultados[id].ok; });
        var todasHtml = ids.every(function (id) { return resultados[id] && /no devolvió JSON|Error de red|Sin respuesta/.test(resultados[id].texto); });
        html += '<div style="margin:6px 0 10px;color:#f0b429;">' +
          (todasOk
            ? 'Todo en orden: la URL y los 4 tokens responden bien. Si el proceso sigue fallando, el problema está en otra parte: copia la línea de error del registro del panel.'
            : todasHtml
            ? 'Ninguna prueba llegó al backend: el problema no es un token sino la URL del Web App (¿nueva implementación?), el despliegue o la red.'
            : 'Los ✖ indican qué token corregir (🔑) o qué otra cosa revisar.') + '</div>';
      }
      html += '<button id="cg-diag-cerrar" style="width:100%;padding:8px;background:#555;color:#fff;border:0;border-radius:4px;cursor:pointer;">Cerrar</button></div>';
      ov.innerHTML = html;
      ['keydown', 'keyup', 'keypress'].forEach(function (tipo) {
        ov.addEventListener(tipo, function (e) { e.stopPropagation(); });
      });
      var bc = ov.querySelector('#cg-diag-cerrar');
      if (bc) bc.onclick = function () { if (ov.parentNode) ov.parentNode.removeChild(ov); };
    }

    render();
    document.body.appendChild(ov);
    ids.forEach(function (id) {
      _probarEndpoint(id, function (r) { resultados[id] = r; render(); });
    });
  }

  /**
   * asegurarTokens(ids, motivo, callback)
   * Si ya están todos guardados, callback(true) de inmediato. Si falta
   * alguno, muestra el formulario SOLO con los que faltan y, al cerrarlo,
   * callback(true) si quedaron todos guardados o callback(false) si no.
   */
  function asegurarTokens(ids, motivo, callback) {
    var faltan = tokensFaltantes(ids);
    if (faltan.length === 0) { callback(true); return; }
    mostrarFormularioTokens(faltan, motivo, function () {
      callback(tokensFaltantes(ids).length === 0);
    });
  }

  /**
   * editarTokens()
   * Botón 🔑 del panel: abre el formulario con los 4 tokens. Los campos que
   * se dejen vacíos conservan el valor que ya había.
   */
  function editarTokens() {
    mostrarFormularioTokens(Object.keys(TOKENS_INFO), '', null);
  }

  /**
   * _interpretarRespuesta(res, tokenId, prefijoError, callback)
   * Punto único donde se lee la respuesta del backend. Distingue tres casos
   * que antes se mezclaban:
   *   1) El cuerpo NO es JSON (p. ej. una página HTML de error de Apps
   *      Script): callback(err, null), con un texto que lo dice.
   *   2) JSON válido con code 401 (token rechazado): callback(err, data)
   *      -- el token guardado se CONSERVA (ver FIX 21-sep-2026 más abajo) y
   *      se pasa `data` para que quien
   *      llama pueda reconocer el 401 (data.code === 401) y volver a pedir
   *      el token.
   *   3) Cualquier otro JSON: callback(null, data).
   */
  function _interpretarRespuesta(res, tokenId, prefijoError, callback) {
    var texto = (res && res.responseText) || '';
    var data;
    try {
      data = JSON.parse(texto);
    } catch (e) {
      var pareceHtml = /^\s*</.test(texto);
      callback(prefijoError + ' (HTTP ' + (res && res.status) + '; ' +
        (pareceHtml
          ? 'el backend devolvió una página HTML, no JSON: abre la URL del Web App en el navegador para ver el mensaje real'
          : 'el cuerpo no es JSON') + '): ' + e.message, null);
      return;
    }
    if (data && data.code === 401) {
      // FIX (21-sep-2026, registro del usuario): antes se hacía
      // invalidarToken(tokenId) aquí. Un único 401 a mitad de una corrida
      // (16:14:52) borraba el token guardado y, desde ese momento, TODOS los
      // envíos siguientes salían con token vacío y fallaban con 401 (16:15:00,
      // 16:15:12, 16:15:27...): un rechazo puntual se volvía una cascada. Ahora
      // el token se conserva; quien decide qué hacer es _postBackend() (un
      // reintento y, si persiste, pausa + formulario) o conReintentoPorToken()
      // (al iniciar, formulario).
      var inf = TOKENS_INFO[tokenId];
      callback('El backend rechazó el token de "' + inf.etiqueta + '" (401 No autorizado). El token guardado se conserva; ' +
        'si cambió en Apps Script, pulsa 🔑 y pega el valor actual de ' + inf.propiedad + '.', data);
      return;
    }
    callback(null, data);
  }

  /**
   * conReintentoPorToken(tokenId, fnPedir, callback)
   * Ejecuta fnPedir(cb). Si el backend responde 401, pide el token de nuevo
   * (formulario) y repite UNA sola vez; si el usuario cancela, o si el segundo
   * intento también da 401, entrega el error tal cual a `callback`.
   */
  function conReintentoPorToken(tokenId, fnPedir, callback) {
    var usado = leerToken(tokenId);
    fnPedir(function (err, data) {
      if (data && data.code === 401) {
        // FIX (21-sep-2026): el token rechazado ya no se borra, así que el
        // formulario se muestra siempre (con «ya hay uno guardado») y solo se
        // repite la solicitud si el usuario pegó un valor DISTINTO al
        // rechazado; repetirla con el mismo valor sería inútil.
        mostrarFormularioTokens([tokenId], 'El backend rechazó el token guardado (401 No autorizado).', function () {
          var ahora = leerToken(tokenId);
          if (ahora && ahora !== usado) { fnPedir(callback); return; }
          callback(err, data);
        });
        return;
      }
      callback(err, data);
    });
  }

  // -------------------------------------------------------------------------
  // ENVÍOS (POST) AL BACKEND — FIX 21-sep-2026
  // Registro del usuario: tras un 401 puntual todo lo que seguía fallaba, el lote
  // de Log (551 jugadores) "se pierde", y cada perfil seguía enviando contra un
  // backend que no respondía (HTTP 404 con HTML). Ahora todos los POST pasan por
  // _postBackend():
  //  - un 401 se repite UNA vez tras REINTENTO_401_MS (con el mismo token);
  //  - un JSON con `error` (p. ej. {error:..., code:500}) cuenta como FALLO. Antes
  //    solo se revisaba `err` de red/JSON: un 500 del backend llegaba como si
  //    fuera éxito y el lote se descartaba en silencio;
  //  - si el 401 persiste, o hay FALLOS_ENVIO_MAX fallos seguidos, se pide una
  //    PAUSA: el proceso se detiene en el siguiente paso (los irAlSiguiente*),
  //    con el motivo en el registro, y se puede reanudar con el botón.
  // Lo pendiente se conserva en el estado (ver los callers), así que pausar no
  // pierde nada.
  // -------------------------------------------------------------------------
  var _fallosEnvioSeguidos = 0;
  var _pausaSolicitada = null; // { motivo, tokenId } mientras haya una pausa pedida

  function _solicitarPausa(tokenId, motivo) {
    if (_pausaSolicitada) return;
    _pausaSolicitada = { motivo: motivo, tokenId: tokenId };
    if (tokenId) {
      mostrarFormularioTokens([tokenId],
        'El proceso quedó en pausa: ' + motivo + ' Pega el valor actual y luego pulsa Reanudar en el panel.',
        function () { pintarPanel(); });
    }
  }

  /**
   * _pausaPendiente(estado, guardarFn, logFn)
   * Si hay una pausa pedida, deja el estado en 'pausado' (persistido) y
   * devuelve true: el caller debe cortar ahí y NO navegar.
   */
  function _pausaPendiente(estado, guardarFn, logFn) {
    if (!_pausaSolicitada) return false;
    estado.estado = 'pausado';
    logFn(estado, '⏸ Proceso en pausa: ' + _pausaSolicitada.motivo + ' Cuando esté resuelto, pulsa Reanudar.');
    guardarFn(estado);
    pintarPanel();
    return true;
  }

  function _reanudarPausas() {
    _pausaSolicitada = null;
    _fallosEnvioSeguidos = 0;
  }

  function _registrarResultadoEnvio(err, data, tokenId) {
    if (!err) { _fallosEnvioSeguidos = 0; return; }
    _fallosEnvioSeguidos++;
    if (data && data.code === 401) {
      _solicitarPausa(tokenId, 'el backend rechazó el token de "' + TOKENS_INFO[tokenId].etiqueta + '" (401) también al reintentar.');
    } else if (_fallosEnvioSeguidos >= FALLOS_ENVIO_MAX) {
      _solicitarPausa(null, _fallosEnvioSeguidos + ' envíos seguidos fallaron (último: ' + err + ').');
    }
  }

  function _postBackend(accion, tokenId, cuerpo, prefijoError, prefijoRed, callback) {
    var reintento401 = false;
    function enviar() {
      var url = WEBAPP_URL + '?accion=' + accion + '&token=' + encodeURIComponent(leerToken(tokenId));
      GM_xmlhttpRequest({
        method: 'POST',
        url: url,
        data: cuerpo,
        headers: { 'Content-Type': 'application/json' },
        onload: function (res) {
          _interpretarRespuesta(res, tokenId, prefijoError, function (err, data) {
            if (data && data.code === 401 && !reintento401) {
              reintento401 = true;
              setTimeout(enviar, REINTENTO_401_MS);
              return;
            }
            if (!err && data && data.error) {
              err = 'El backend respondió con error' + (data.code ? ' (' + data.code + ')' : '') + ': ' + data.error;
            }
            _registrarResultadoEnvio(err, data, tokenId);
            callback(err, data);
          });
        },
        onerror: function (e) {
          var msg = prefijoRed + JSON.stringify(e);
          _registrarResultadoEnvio(msg, null, tokenId);
          callback(msg, null);
        }
      });
    }
    enviar();
  }

  // FIX (15-sep-2026, pedido usuario: "las cuentas solían enviarse a
  // Tampermonkey en grupos (creo que de 4) porque ahora parece que envía de
  // uno en uno y demora más"). Causa encontrada: el umbral del histórico de
  // Guerra era por REGISTROS acumulados (40), no por JUGADORES. Cuando cada
  // jugador traía ~10 semanas, 40 registros equivalían a ~4 jugadores por
  // request — de ahí el "grupos de 4" que el usuario recuerda. Pero a
  // medida que el histórico de cada cuenta creció (hoy un backfill de
  // perfil puede traer 40+ semanas de una sola cuenta), UN SOLO jugador ya
  // supera el umbral por sí mismo, así que _flushHistorialSiHaceFalta()
  // termina disparando un request por cada jugador: exactamente el "de uno
  // en uno" reportado. Ahora el criterio principal vuelve a ser por
  // JUGADORES acumulados, y los registros quedan solo como tope duro de
  // seguridad para no armar un POST gigante cuando varias cuentas traen
  // historial muy largo.
  var LOTE_ENVIO_MIN_JUGADORES_HISTORIAL = 4;      // criterio PRINCIPAL: nunca se manda un lote con menos de 4 jugadores (salvo forzar=true al cerrar fase)
  var LOTE_ENVIO_MAX_REGISTROS_HISTORIAL = 400;    // tope duro de seguridad: si se acumulan tantos registros, se manda igual aunque no haya 4 jugadores

  var CLOUDFLARE_WAIT_MS = 15000;
  var TABLE_WAIT_MS = 12000;
  var POLL_INTERVAL_MS = 400;
  var PAUSA_ENTRE_JUGADORES_MS = 1500;

  // NUEVO — método rápido por página de Analytics (ver sección
  // "MÉTODO RÁPIDO — WAR ANALYTICS" más abajo).
  var ANALYTICS_TABLE_WAIT_MS = 15000;   // igual de generoso que TABLE_WAIT_MS, por si Cloudflare también aparece acá
  var PAUSA_ENTRE_CLANES_MS = 1500;

  // FIX (20-sep-2026): tope de espera de las solicitudes de lista al backend
  // (Corrección de Guerra, Miembros nuevos, Verificar semana). Sin tope, si
  // Apps Script no respondía, el panel se quedaba en «Cargando…» para
  // siempre. Un Web App lento puede tardar 10-30 s; 90 s ya es "no responde".
  var LISTA_TIMEOUT_MS = 90000;

  // FIX (21-sep-2026): envíos al backend (ver _postBackend()).
  var REINTENTO_401_MS = 3000;          // espera antes de repetir UNA vez un envío rechazado con 401
  var FALLOS_ENVIO_MAX = 3;             // envíos seguidos fallidos (cualquier causa) tras los cuales el proceso se pausa solo
  var HISTORIAL_ESPERA_MAX_MS = 120000; // tope de espera por la respuesta del histórico antes de navegar a la siguiente página

  // FIX (15-ago-2026, pedido usuario: "se demora más de una hora cada
  // corrida... para los nuevos"). Causa principal encontrada: tanto
  // procesarJugadorActual() como procesarCandidatoActual() mandaban UN
  // request HTTP al backend (Apps Script Web App) por cada jugador/
  // candidato que tuviera algo que enviar — y la navegación al siguiente
  // perfil esperaba esa respuesta antes de seguir. Un Web App de Apps
  // Script suele tardar varios segundos por llamada (lee/escribe Sheets,
  // JSON y CSV de Drive en cada corrección), así que con 100-300
  // candidatos ese tiempo de red, sumado uno atrás de otro, terminaba
  // siendo una parte enorme de la corrida total — sobre todo en "Nuevos",
  // que a diferencia de la corrección de guerra NO tiene un método rápido
  // de Analytics posible (un candidato, por definición, no está en
  // ninguno de tus 4 clanes Terna, así que su historial nunca puede
  // leerse desde tus propias páginas de Analytics — su perfil individual
  // es la ÚNICA fuente posible). Ahora se agrupan varios jugadores/
  // candidatos por request en vez de mandar uno por uno: el envío final
  // (terminar()/terminarNuevos()) igual manda cualquier resto pendiente al
  // terminar, así que no se pierde nada por bajar la frecuencia de envío.
  var LOTE_ENVIO_MIN_JUGADORES = 8;   // corrección de guerra
  var LOTE_ENVIO_MIN_CANDIDATOS = 8;  // miembros nuevos

  // =========================================================================
  // ESTADO PERSISTENTE — CORRECCIÓN DE GUERRA (SIN CAMBIOS)
  // =========================================================================
  // v2 (bump de versión, 1.2): agrega la fase 'analytics' — un estado v1
  // guardado de una corrida anterior no tiene esa forma, así que se usa una
  // clave nueva para no intentar reanudar un estado incompatible a medias.
  // v3 (bump de versión, 1.3): agrega la fase 'log' (entre 'analytics' y
  // 'perfiles') y el campo coberturaPorTag — mismo motivo que el bump
  // v1->v2: un estado v2 a medio correr no tiene esa forma nueva.
  // v4 (bump de versión, 2.9, 29-sep-2026): cambia el ORDEN de las fases (ahora
  // riverrace -> log -> [analytics solo de respaldo] -> perfiles) y agrega los
  // campos logClanesOk y semanasCubiertas — un estado v3 a medio correr tiene
  // la fase 'analytics' antes que 'log' y no traería esos campos, así que se
  // usa una clave nueva (el estado v3 viejo se borra al arrancar).
  var STATE_KEY = 'cg_estado_v4';

  function cargarEstado() {
    var raw = GM_getValue(STATE_KEY, null);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }
  function guardarEstado(estado) {
    GM_setValue(STATE_KEY, JSON.stringify(estado));
  }
  function borrarEstado() {
    GM_deleteValue(STATE_KEY);
  }

  /**
   * estadoInicial(jugadores, clanesTerna, clanTagsTerna, coberturaPorTag)
   * ORDEN desde v2.9 (29-sep-2026): riverrace -> LOG (principal) -> analytics
   * (solo respaldo, únicamente para clanes cuyo Log no cargó) -> perfiles. La
   * numeración de abajo es la histórica y ya no indica el orden.
   * Tres fases:
   *   1) 'analytics' — recorre las 4 páginas .../war/analytics (una por
   *      clan Terna, clanTagsTerna) y de ahí saca Ataques+Fame de TODOS los
   *      jugadores que aparecen en esa tabla (miembros actuales y pasados),
   *      sin visitar un solo perfil. Muy rápido, pero NO trae Barcos y solo
   *      muestra las semanas más recientes.
   *   2) 'log' (v1.3) — recorre las 4 páginas .../war/log (una por clan
   *      Terna) y de ahí saca Ataques+Fame+Barcos de TODAS las guerras que
   *      RoyaleAPI conserva para ese clan — más profundo que Analytics y el
   *      único de los tres métodos que trae Barcos sin visitar un perfil.
   *   3) 'perfiles' — el método YA EXISTENTE (visita cada perfil y lee
   *      "Clan Wars 2 History"), pero acotado SOLO a los jugadores de
   *      `jugadores` que ni Analytics ni Log hayan podido cubrir (p. ej.
   *      alguien que se reincorporó hace muy poco, o cuyas páginas de
   *      Analytics/Log fallaron).
   * Si clanTagsTerna no llega (backend viejo, sin el campo), se arranca
   * directo en fase 'perfiles' — comportamiento 100% igual al de antes.
   * coberturaPorTag (v1.3) trae, por jugador, las semanas "134-4" que ya
   * están guardadas en Correcciones_Guerra.csv — se usa en la fase
   * 'perfiles' para no reenviar una semana que ya está guardada.
   */
  /**
   * construirIndiceJugadoresPorTag(jugadores)
   * PUNTO 2 — se necesita para poder poner `nombre` en cada registro del
   * histórico cuando el dato sale de Analytics/Log (esas dos fuentes solo
   * traen el `tag` de cada fila, nunca el nombre — ver parsearTablaAnalytics()/
   * parsearParticipantesLog()). `jugadores` ya viene con {tag, nombre, clan,
   * royaleApiUrl} desde el backend (_obtenerListaCorreccionGuerra()), así
   * que este índice es gratis (sin request extra).
   */
  function construirIndiceJugadoresPorTag(jugadores) {
    var idx = {};
    for (var i = 0; i < jugadores.length; i++) idx[jugadores[i].tag] = jugadores[i];
    return idx;
  }

  /**
   * estadoInicial(jugadores, clanesTerna, clanTagsTerna, coberturaPorTag, modoBackfill, temporadaRoyaleApiActual, semanaActual)
   * PUNTO 2/3 (nuevo parámetro `modoBackfill` y campos `historial*`) y
   * PUNTO 2 — River Race (nuevos parámetros `temporadaRoyaleApiActual`/
   * `semanaActual`, ver comentario de la fase 'riverrace' más abajo).
   */
  function estadoInicial(jugadores, clanesTerna, clanTagsTerna, coberturaPorTag, modoBackfill, temporadaRoyaleApiActual, semanaActual) {
    var hayClanTags = Array.isArray(clanTagsTerna) && clanTagsTerna.length > 0;
    // River Race (Sección 2.4/3.1 del consolidado) solo se puede ejecutar si
    // el backend mandó una temporada/semana actual válida (no null — puede
    // venir null si _getCtx() marcó el periodIndex como sospechoso, ver
    // _obtenerListaCorreccionGuerra() en Base.md) Y hay clanTagsTerna para
    // saber qué 4 páginas visitar. Si falta cualquiera de las dos cosas, se
    // salta directo a 'analytics' (o 'perfiles' si tampoco hay clanTagsTerna)
    // — el histórico simplemente se queda sin el dato de la semana en curso
    // esta corrida, sin bloquear el resto del flujo.
    var hayDatosRiverRace = hayClanTags &&
      temporadaRoyaleApiActual !== null && temporadaRoyaleApiActual !== undefined &&
      semanaActual !== null && semanaActual !== undefined;
    var faseInicial = hayDatosRiverRace ? 'riverrace' : (hayClanTags ? 'log' : 'perfiles');
    return {
      estado: 'corriendo',
      fase: faseInicial,

      // --- Fase 0: River Race (semana en curso, Sección 2.4/3.1) ---
      // Corre SIEMPRE primero (si hay datos), sin importar modoBackfill: es
      // la única fuente para la semana que Analytics/Log todavía no pueden
      // mostrar porque no ha cerrado.
      riverraceIndiceClan: 0,
      riverraceTotalClanesOk: 0,
      riverraceTotalClanesError: 0,
      temporadaRoyaleApiActual: temporadaRoyaleApiActual || null,
      semanaActual: semanaActual || null,

      // --- Fase 1: Analytics ---
      clanTagsTerna: clanTagsTerna || [],
      analyticsIndiceClan: 0,
      analyticsCorrecciones: [],       // acumulador sin enviar, se vacía por lote (mismo patrón que `correcciones`)
      analyticsTagsEncontrados: [],    // tags (con '#') ya cubiertos por Analytics — se excluyen de la fase 2
      analyticsTotalClanesOk: 0,
      analyticsTotalClanesError: 0,

      // --- Fase 1.5: Log (river-race log del clan) ---
      // Más profundo que Analytics (llega a temporadas más viejas) y SÍ
      // trae Barcos (Analytics no tiene esa columna). Mismo patrón de
      // acumulación/lote que Analytics.
      logIndiceClan: 0,
      logCorrecciones: [],
      logTagsEncontrados: [],
      logTotalClanesOk: 0,
      logTotalClanesError: 0,
      // v2.9: tags de clan cuyo Log SÍ entregó filas (los demás pasan a Analytics de respaldo).
      logClanesOk: [],
      // v2.9: { tag: ['134-4', ...] } semanas que Log o Analytics ya aportaron en ESTA
      // corrida; la fase 'perfiles' no las reenvía (el perfil no debe pisar al Log).
      semanasCubiertas: {},

      // semanas (formato RoyaleAPI "134-4") ya guardadas en
      // Correcciones_Guerra.csv por jugador, tal como las manda el backend
      // en listaCorreccionGuerra. Se usa en la fase 'perfiles' para no
      // reenviar una semana que ya está guardada, aunque se vuelva a
      // visitar ese perfil.
      coberturaPorTag: coberturaPorTag || {},

      // --- Fase 2: perfil por perfil (jugadores TODAVÍA no cubiertos ni
      //     por Analytics ni por Log) ---
      jugadoresOriginal: jugadores,    // lista completa, sin filtrar — se guarda para poder recalcular el pendiente al pasar de fase
      jugadores: jugadores,            // en fase 'perfiles' esto se recorta al terminar la fase 1
      clanesTerna: clanesTerna,
      indice: 0,
      intentosPaginaActual: 0,
      correcciones: [],
      totalAplicadas: 0,
      log: [],

      // --- PUNTO 2 (histórico de Guerra por jugador, consolidado Sección 5/8) ---
      // jugadorPorTag: índice tag -> {tag, nombre, clan, royaleApiUrl}, para
      // poder poner `nombre` en los registros que salen de Analytics/Log
      // (que solo traen el tag). Se construye una sola vez acá.
      jugadorPorTag: construirIndiceJugadoresPorTag(jugadores),
      // historialAcumulado: { tag: { tag, nombre, clan, registros:[...] } } —
      // se vacía por lote con _tomarLoteHistorial(). historialTotalRegistros
      // cuenta registros (no jugadores) y desde el FIX del 15-sep-2026 solo
      // se usa como TOPE DURO: quien decide cuándo mandar un lote es la
      // cantidad de jugadores distintos acumulados
      // (_contarJugadoresHistorial(), ver _flushHistorialSiHaceFalta()).
      historialAcumulado: {},
      historialTotalRegistros: 0,
      historialTotalEnviados: 0,

      // --- PUNTO 3 (backfill vs. recurrente, Sección 4 del consolidado) ---
      // modoBackfill=true: la fase 'perfiles' visita TODOS los jugadores de
      // jugadoresOriginal (no solo los que Analytics/Log no cubrieron) —
      // "Backfill único, la primera vez: ... además el Perfil de cada
      // miembro activo actual". Se pide con un confirm() explícito al
      // arrancar (ver iniciarProcesoCorreccion()) en vez de auto-detectarlo:
      // el backend todavía no expone qué tags ya tienen el campo
      // backfillPerfilHecho=true de su JSON individual (P1 del consolidado)
      // — automatizar esa detección se deja pendiente a propósito, no hay
      // que asumir un mecanismo que no está confirmado (ver Sección 10 del
      // consolidado: "no debo asumir una respuesta por mi cuenta").
      modoBackfill: !!modoBackfill
    };
  }

  function log(estado, msg) {
    var linea = '[' + new Date().toLocaleTimeString() + '] ' + msg;
    console.log('[CorreccionGuerra] ' + msg);
    estado.log.push(linea);
    if (estado.log.length > 200) estado.log.shift();
    pintarPanel();
  }

  // =========================================================================
  // ESTADO PERSISTENTE — MIEMBROS NUEVOS (NUEVO)
  // =========================================================================
  // v2 (bump de versión, 27-ago-2026, punto 3.1 del
  // Consolidado_Cambios_Pendientes_Guerra.md): agrega el campo
  // coberturaPorTag — mismo motivo que los bumps de STATE_KEY más arriba
  // (cg_estado_v2/v3): un estado v1 guardado de una corrida anterior no
  // tiene ese campo, así que se usa una clave nueva para no intentar
  // reanudar un estado incompatible a medias.
  var STATE_KEY_NUEVOS = 'nuevos_estado_v2';

  function cargarEstadoNuevos() {
    var raw = GM_getValue(STATE_KEY_NUEVOS, null);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }
  function guardarEstadoNuevos(estado) {
    GM_setValue(STATE_KEY_NUEVOS, JSON.stringify(estado));
  }
  function borrarEstadoNuevos() {
    GM_deleteValue(STATE_KEY_NUEVOS);
  }

  /**
   * estadoInicialNuevos(candidatos, clanesTerna, coberturaPorTag)
   * FIX (27-ago-2026, punto 3.1 del Consolidado_Cambios_Pendientes_Guerra.md):
   * nuevo parámetro coberturaPorTag — mismo campo/formato que ya recibe
   * estadoInicial() para Corrección de Guerra (mapa { "#TAG": ["134-4", ...] }
   * con las semanas que Guerra/Backup_Guerra.csv ya tiene guardadas para
   * cada Tag). Se usa en procesarCandidatoActual() para no reenviar al
   * backend semanas que el punto 3 (_migrarNuevosAHistorico()) o el punto 4
   * (_cerrarSemanaActualNuevos()) ya migraron al histórico real.
   */
  function estadoInicialNuevos(candidatos, clanesTerna, coberturaPorTag) {
    return {
      estado: 'corriendo',
      candidatos: candidatos,      // [{tag, nombre, clan, royaleApiUrl}]
      clanesTerna: clanesTerna,
      coberturaPorTag: coberturaPorTag || {},
      indice: 0,
      intentosPaginaActual: 0,
      pendientesEnvio: [],         // acumulador SIN enviar: [{tag, registros:[...]}]
      totalNuevosDetectados: 0,    // candidatos procesados este run (nuevos O ya trackeados que se actualizan) — NO es lo mismo que filas nuevas en la hoja, ver totalFilasNuevas
      totalFilasNuevas: 0,         // FIX (15-ago-2026): suma real de resp.filasNuevas devuelto por el backend en cada lote — esto sí es "cuántas filas se agregaron a la hoja", a diferencia de totalNuevosDetectados (que también cuenta actualizaciones a candidatos ya trackeados)
      totalFilasEliminadas: 0,     // idem con resp.filasEliminadas (candidatos que volvieron a la familia)
      log: []
    };
  }

  function logNuevos(estado, msg) {
    var linea = '[' + new Date().toLocaleTimeString() + '] ' + msg;
    console.log('[Nuevos] ' + msg);
    estado.log.push(linea);
    if (estado.log.length > 200) estado.log.shift();
    pintarPanel();
  }

  // =========================================================================
  // ESTADO PERSISTENTE — VERIFICAR SEMANA EN CURSO (fase `race`, NUEVO)
  // =========================================================================
  // Cuarto flujo, independiente de Corrección de Guerra (cg_estado_v3, con
  // sus fases riverrace/analytics/log/perfiles) y de Miembros Nuevos
  // (nuevos_estado_v1) — ver Consolidado_Verificar_Semana_Race.md, Sección 2.
  // IMPORTANTE: no confundir con la fase 'riverrace' de arriba (cg_estado_v3)
  // — esa es de la feature hermana (histórico de Guerra por jugador,
  // 24_HistorialGuerraJugador.gs) y ya corre sola en cada corrida normal de
  // Corrección de Guerra. Este flujo es OTRA cosa: botón propio, estado
  // propio, nunca escribe directo en Guerra/Control_2 (solo dejar
  // discrepancias pendientes de aprobación manual, ver
  // aprobarCorreccionesRiverRacePendientes() en el backend).
  var STATE_KEY_RACE = 'cg_estado_race_v1';

  function cargarEstadoRace() {
    var raw = GM_getValue(STATE_KEY_RACE, null);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }
  function guardarEstadoRace(estado) {
    GM_setValue(STATE_KEY_RACE, JSON.stringify(estado));
  }
  function borrarEstadoRace() {
    GM_deleteValue(STATE_KEY_RACE);
  }

  /**
   * estadoInicialRace(jugadores, clanesTerna, clanTagsTerna)
   * Reusa la misma lista que ya pide Corrección de Guerra (accion=
   * listaCorreccionGuerra) -- ya trae clanesTerna/clanTagsTerna, que es todo
   * lo que este flujo necesita para saber qué 4 páginas /war/race visitar.
   * No hace falta un endpoint GET nuevo solo para esto. `jugadores` se usa
   * nada más para poder mandar `nombre` junto al `tag` en el payload
   * (informativo -- el backend matchea todo por tag).
   */
  function estadoInicialRace(jugadores, clanesTerna, clanTagsTerna) {
    return {
      estado: 'corriendo',
      fase: 'race', // constante -- un solo flujo, sin sub-fases (a diferencia de cg_estado_v3)
      clanesTerna: clanesTerna || [],
      clanTagsTerna: clanTagsTerna || [],
      raceIndiceClan: 0,
      raceTotalClanesOk: 0,
      raceTotalClanesError: 0,
      raceTagsEncontrados: [],       // informativo para el panel, mismo criterio que analyticsTagsEncontrados/logTagsEncontrados
      jugadorPorTag: construirIndiceJugadoresPorTag(jugadores || []),
      // Los ~100 jugadores de las 4 páginas entran cómodos en un solo
      // request (a diferencia de Analytics/Log/Historial, que sí necesitan
      // batching): se acumulan acá y se mandan de una sola vez al terminar
      // el recorrido de los 4 clanes -- ver terminarRace().
      participantesAcumulados: [],
      totalDiscrepancias: 0,  // se completa con resp.discrepancias al terminar
      totalProcesados: 0,     // se completa con resp.procesados al terminar
      log: []
    };
  }

  function logRace(estado, msg) {
    var linea = '[' + new Date().toLocaleTimeString() + '] ' + msg;
    console.log('[VerificarSemanaRace] ' + msg);
    estado.log.push(linea);
    if (estado.log.length > 200) estado.log.shift();
    pintarPanel();
  }

  // =========================================================================
  // COMUNICACIÓN CON EL BACKEND — CORRECCIÓN DE GUERRA
  // FIX (20-sep-2026): el token ya no es una constante del script (ver
  // bloque de tokens al inicio) y la respuesta se lee con
  // _interpretarRespuesta(), que reconoce el 401 y el HTML.
  // =========================================================================
  function pedirListaJugadores(callback) {
    var url = WEBAPP_URL + '?accion=listaCorreccionGuerra&token=' + encodeURIComponent(leerToken('cg'));
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      timeout: LISTA_TIMEOUT_MS,
      onload: function (res) {
        _interpretarRespuesta(res, 'cg', 'Respuesta inválida del backend', callback);
      },
      onerror: function (err) {
        callback('Error de red pidiendo la lista de jugadores: ' + JSON.stringify(err), null);
      },
      ontimeout: function () {
        callback('El backend no respondió en ' + (LISTA_TIMEOUT_MS / 1000) + ' s pidiendo la lista de jugadores (puede estar lento o caído).', null);
      }
    });
  }

  /**
   * pedirListaJugadoresConCargando(prefijo, titulo)
   * FIX (20-sep-2026, pedido usuario: "ponle mensajes de Cargando a los 3
   * botones, solo el segundo me da ese mensaje"). Solo Nuevos mostraba
   * «Cargando…» al pulsar Iniciar; Corrección de Guerra y Verificar semana
   * se quedaban con el botón como si no hubiera pasado nada hasta que
   * llegaba la lista. Devuelve una función pedir(callback) que primero pinta
   * el mensaje en la sección `prefijo` ('cg' | 'race') y luego pide la lista,
   * lista para pasarse a conReintentoPorToken() (que la vuelve a llamar, y
   * por lo tanto vuelve a mostrar el mensaje, si tiene que reintentar tras
   * pedir un token nuevo).
   */
  function pedirListaJugadoresConCargando(prefijo, titulo) {
    return function (callback) {
      mostrarCargando(prefijo, titulo, 'Cargando lista de jugadores y clanes (puede tardar hasta un minuto)...');
      pedirListaJugadores(callback);
    };
  }

  function enviarCorrecciones(correcciones, callback) {
    _postBackend('corregirGuerra', 'cg', JSON.stringify({ correcciones: correcciones }),
      'Respuesta inválida del backend al enviar correcciones', 'Error de red enviando correcciones: ', callback);
  }

  // =========================================================================
  // PUNTO 2 — HISTÓRICO DE GUERRA POR JUGADOR (NUEVO)
  // Traduce lo que Analytics/Log/Perfil YA parsean (mismas funciones de
  // siempre: parsearTablaAnalytics()/combinarFameYAtaques(),
  // parsearParticipantesLog(), leerFilasClanWars2()) al formato "registro"
  // del consolidado (Sección 5) y lo manda por un canal aparte, en paralelo
  // al flujo de Correcciones_Guerra.csv — sin tocar ni bloquear ese flujo.
  // =========================================================================

  /**
   * _agregarRegistroHistorial(estado, tag, nombre, clan, registro)
   * Acumula en estado.historialAcumulado, agrupado por tag (mismo shape que
   * espera _aplicarHistorialGuerra() del backend: {tag, nombre, clan,
   * registros:[...]}). Si el mismo tag ya tiene una entrada (normal: un
   * jugador aparece en varias semanas), se agrega el registro al array
   * existente y se refresca `clan` con el dato más reciente (útil para el
   * nombre de archivo del JSON individual, que usa "clan actual").
   */
  function _agregarRegistroHistorial(estado, tag, nombre, clan, registro) {
    if (!tag) return;
    if (!estado.historialAcumulado[tag]) {
      estado.historialAcumulado[tag] = { tag: tag, nombre: nombre || '', clan: clan || '', registros: [] };
    } else {
      if (nombre && !estado.historialAcumulado[tag].nombre) estado.historialAcumulado[tag].nombre = nombre;
      if (clan) estado.historialAcumulado[tag].clan = clan;
    }
    estado.historialAcumulado[tag].registros.push(registro);
    estado.historialTotalRegistros++;
  }

  /**
   * _contarJugadoresHistorial(estado)
   * Cuántos jugadores DISTINTOS hay acumulados ahora mismo en
   * estado.historialAcumulado (las claves son tags, así que un jugador con
   * 40 semanas cuenta 1, no 40). Es la granularidad que usa
   * _flushHistorialSiHaceFalta() desde el FIX del 15-sep-2026.
   */
  function _contarJugadoresHistorial(estado) {
    if (!estado || !estado.historialAcumulado) return 0;
    return Object.keys(estado.historialAcumulado).length;
  }

  function _tomarLoteHistorial(estado) {
    var lote = Object.keys(estado.historialAcumulado).map(function (t) { return estado.historialAcumulado[t]; });
    estado.historialAcumulado = {};
    estado.historialTotalRegistros = 0;
    return lote;
  }

  function enviarHistorialGuerra(candidatos, callback) {
    _postBackend('historialGuerra', 'historial', JSON.stringify({ candidatos: candidatos }),
      'Respuesta inválida del backend al enviar historial de guerra', 'Error de red enviando historial de guerra: ', callback);
  }

  // FIX (21-sep-2026): el histórico se enviaba "fire-and-forget": si la página
  // navegaba antes de que llegara la respuesta, el callback nunca corría, así que
  // ni se registraba el resultado (en el registro del usuario no aparece ninguna
  // línea de confirmación de los lotes de [HistorialGuerra]) ni se podía
  // reintentar un fallo. Ahora (1) cada lote enviado queda anotado como "en vuelo"
  // hasta que responde, (2) antes de navegar se espera (con tope
  // HISTORIAL_ESPERA_MAX_MS) a que respondan, y (3) un lote que falla, o que no
  // responde a tiempo, vuelve a la cola (estado.historialAcumulado) para
  // reenviarse. Reenviar es seguro: el backend guarda cada registro por
  // (tag, temporada, semana) con reglas de prioridad, no lo duplica.
  var _historialLotesEnVuelo = [];

  function _reintegrarLoteHistorial(estado, lote) {
    for (var i = 0; i < lote.length; i++) {
      var c = lote[i];
      var ex = estado.historialAcumulado[c.tag];
      if (!ex) {
        estado.historialAcumulado[c.tag] = c;
      } else {
        ex.registros = c.registros.concat(ex.registros);
        if (!ex.nombre && c.nombre) ex.nombre = c.nombre;
      }
      estado.historialTotalRegistros += c.registros.length;
    }
  }

  function _esperarHistorialEnVuelo(estado, continuar) {
    if (_historialLotesEnVuelo.length === 0) { continuar(); return; }
    var inicio = Date.now();
    var iv = setInterval(function () {
      if (_historialLotesEnVuelo.length === 0) { clearInterval(iv); continuar(); return; }
      if (Date.now() - inicio >= HISTORIAL_ESPERA_MAX_MS) {
        clearInterval(iv);
        var sinRespuesta = _historialLotesEnVuelo.splice(0, _historialLotesEnVuelo.length);
        for (var k = 0; k < sinRespuesta.length; k++) _reintegrarLoteHistorial(estado, sinRespuesta[k].lote);
        guardarEstado(estado);
        log(estado, '⚠ [HistorialGuerra] Sin respuesta tras ' + Math.round(HISTORIAL_ESPERA_MAX_MS / 1000) +
          ' s: ' + sinRespuesta.length + ' lote(s) vuelven a la cola para reenviarse.');
        continuar();
      }
    }, 300);
  }

  /**
   * _flushHistorialSiHaceFalta(estado, forzar)
   * A diferencia de los lotes de Correcciones_Guerra.csv (que SÍ bloquean
   * la navegación al siguiente clan/perfil hasta tener respuesta — ver
   * procesarJugadorActual()), este envío es fire-and-forget: no se espera
   * la respuesta antes de seguir. Es seguro porque GM_xmlhttpRequest corre
   * del lado de la extensión del navegador, no de la pestaña — sigue en
   * curso aunque la página navegue antes de que llegue la respuesta. Se
   * eligió así a propósito para no arriesgar la lógica ya afinada (y con
   * varios FIX históricos) del flujo principal de corrección: el histórico
   * de Guerra es un canal aparte, y si un lote puntual se pierde por un
   * error de red, la próxima corrida vuelve a leer las mismas páginas y
   * reconstruye los mismos registros sin intervención manual.
   *
   * @param {boolean} forzar - true en los puntos de cierre de fase
   *   (cerrarFaseLog/avanzarAFasePerfiles/terminar): manda lo que haya
   *   acumulado aunque no llegue al umbral, para no dejar nada sin enviar
   *   al terminar la corrida.
   */
  function _flushHistorialSiHaceFalta(estado, forzar) {
    if (estado.historialTotalRegistros === 0) return;

    // FIX (15-sep-2026): criterio de corte por JUGADORES acumulados, no por
    // registros (ver comentario de LOTE_ENVIO_MIN_JUGADORES_HISTORIAL más
    // arriba). `forzar` sigue mandando lo que haya al cerrar cada fase, así
    // que juntar de a 4 no deja nada sin enviar al terminar la corrida.
    if (!forzar) {
      var jugadoresAcumulados = _contarJugadoresHistorial(estado);
      var alcanzaPorJugadores = jugadoresAcumulados >= LOTE_ENVIO_MIN_JUGADORES_HISTORIAL;
      var alcanzaPorTopeDuro = estado.historialTotalRegistros >= LOTE_ENVIO_MAX_REGISTROS_HISTORIAL;
      if (!alcanzaPorJugadores && !alcanzaPorTopeDuro) return;
    }

    var lote = _tomarLoteHistorial(estado);
    guardarEstado(estado);
    log(estado, '  → [HistorialGuerra] Enviando lote de ' + lote.length + ' jugador(es)' +
      (forzar ? ' (cierre de fase)' : '') + '…');
    var enVuelo = { lote: lote };
    _historialLotesEnVuelo.push(enVuelo);
    enviarHistorialGuerra(lote, function (err, resp) {
      var pos = _historialLotesEnVuelo.indexOf(enVuelo);
      if (pos === -1) return; // ya se dio por sin respuesta y se re-encoló (ver _esperarHistorialEnVuelo)
      _historialLotesEnVuelo.splice(pos, 1);
      if (err || !resp || !resp.ok) {
        _reintegrarLoteHistorial(estado, lote);
        guardarEstado(estado);
        log(estado, '⚠ [HistorialGuerra] ' + (err || (resp && resp.error) || 'respuesta inválida del backend') +
          ' (lote de ' + lote.length + ' jugador(es) vuelve a la cola: se reenvía con el próximo lote).');
      } else {
        estado.historialTotalEnviados = (estado.historialTotalEnviados || 0) + (resp.registrosGuardados || 0);
        log(estado, '  ✔ [HistorialGuerra] Backend actualizado: ' + (resp.registrosGuardados || 0) +
          ' registro(s) de ' + (resp.procesados || 0) + ' jugador(es) (total acumulado: ' + estado.historialTotalEnviados + ').');
        if (resp.errores && resp.errores.length) {
          log(estado, '  ⚠ [HistorialGuerra] ' + resp.errores.length + ' jugador(es) con error individual: ' +
            resp.errores.map(function (e2) { return e2.tag + ' (' + e2.error + ')'; }).join('; '));
        }
        guardarEstado(estado);
      }
    });
  }

  // =========================================================================
  // COMUNICACIÓN CON EL BACKEND — MIEMBROS NUEVOS (NUEVO)
  // =========================================================================
  function pedirListaCandidatosNuevos(callback) {
    var url = WEBAPP_URL + '?accion=listaNuevosRoyaleAPI&token=' + encodeURIComponent(leerToken('nuevos'));
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      timeout: LISTA_TIMEOUT_MS,
      onload: function (res) {
        _interpretarRespuesta(res, 'nuevos', 'Respuesta inválida del backend', callback);
      },
      onerror: function (err) {
        callback('Error de red pidiendo la lista de candidatos: ' + JSON.stringify(err), null);
      },
      ontimeout: function () {
        callback('El backend no respondió en ' + (LISTA_TIMEOUT_MS / 1000) + ' s pidiendo la lista de candidatos (puede estar lento o caído).', null);
      }
    });
  }

  // FIX (16-sep-2026, pedido usuario: el backend a veces devuelve HTML en
  // vez de JSON de forma intermitente -- "ese problema de intermitencia
  // viene desde hace días" -- y hasta ahora Tampermonkey se rendía al
  // primer fallo con un alert, sin reintentar ni mostrar ningún indicio de
  // que ya se hizo click en "Iniciar". Se agrega un reintento automático
  // (espera fija entre intentos, no backoff exponencial: los fallos vistos
  // son de corta duración -- timeout/cuota puntual de Apps Script, no una
  // caída sostenida) antes de darse por vencido, con un mensaje de
  // "Cargando"/"Reintentando" en la sección mientras tanto (ver
  // mostrarCargando() más arriba). Si los 3 intentos fallan, se comporta
  // igual que antes: el callback recibe el error y iniciarProcesoNuevos()
  // muestra el alert de siempre.
  //
  // FIX (20-sep-2026): el mensaje "no respondió con JSON válido" se
  // mostraba también cuando el backend SÍ respondía JSON válido pero con
  // 401 (token rotado) o con un error propio ({error:..., code:500}). Ahora:
  //  - un 401 NO se reintenta (es determinista: repetirlo 3 veces no lo
  //    arregla); se entrega tal cual y conReintentoPorToken() vuelve a
  //    pedir el token;
  //  - el texto del reintento dice qué pasó de verdad: cuerpo que no es
  //    JSON / HTML vs. error devuelto por el backend.
  var NUEVOS_MAX_REINTENTOS = 3;
  var NUEVOS_REINTENTO_ESPERA_MS = 2500;

  function pedirListaCandidatosNuevosConReintento(callback, intento, motivoAnterior) {
    intento = intento || 1;
    mostrarCargando('nuevos', 'Buscar miembros nuevos',
      intento === 1
        ? 'Cargando lista de candidatos...'
        : (motivoAnterior || 'Backend no respondió bien') + ', reintentando (' + intento + '/' + NUEVOS_MAX_REINTENTOS + ')...');
    pedirListaCandidatosNuevos(function (err, data) {
      var fallo = err || !data || !data.ok;
      var tokenRechazado = !!(data && data.code === 401);
      if (fallo && !tokenRechazado && intento < NUEVOS_MAX_REINTENTOS) {
        var motivo = err
          ? 'Backend no respondió bien'
          : ('Backend respondió con error (' + ((data && (data.error || data.code)) || 'sin detalle') + ')');
        setTimeout(function () {
          pedirListaCandidatosNuevosConReintento(callback, intento + 1, motivo);
        }, NUEVOS_REINTENTO_ESPERA_MS);
        return;
      }
      callback(err, data);
    });
  }

  function enviarNuevos(candidatosDetectados, callback) {
    _postBackend('importarNuevos', 'nuevos', JSON.stringify({ candidatos: candidatosDetectados }),
      'Respuesta inválida del backend al enviar nuevos', 'Error de red enviando nuevos: ', callback);
  }

  // =========================================================================
  // COMUNICACIÓN CON EL BACKEND — VERIFICAR SEMANA EN CURSO (NUEVO)
  // =========================================================================
  function enviarVerificacionRace(participantes, callback) {
    _postBackend('verificarSemanaActual', 'race', JSON.stringify({ participantes: participantes }),
      'Respuesta inválida del backend al verificar semana en curso', 'Error de red verificando semana en curso: ', callback);
  }

  // =========================================================================
  // LECTURA DE LA PÁGINA DE ROYALEAPI (COMPARTIDO)
  // =========================================================================
  // -------------------------------------------------------------------------
  // CLOUDFLARE (FIX 20-sep-2026, pedido usuario: "a veces sale una página de
  // verificación de Cloudflare pero el código no logra marcar esa casilla...
  // cada 30 personas aprox se detiene y vuelve a salir esa página").
  // Qué pasaba: esperar() vencía a los 15 s porque nunca aparecía el botón o
  // la tabla (la página real no había cargado: estaba la verificación), y
  // entonces procesarJugadorActual()/procesarCandidatoActual() recargaban la
  // página (lo que vuelve a disparar la verificación), lo intentaban 3 veces
  // y SALTABAN al jugador; en Analytics/Log/Race se saltaba el clan entero.
  // La casilla de Cloudflare vive en un iframe de otro dominio pensado para
  // distinguir personas de automatismos: este script NO intenta marcarla.
  // Lo que hace ahora es (1) reconocer que está la verificación, (2) NO contar
  // ese tiempo contra el timeout ni recargar ni saltar nada, (3) avisarte
  // (título de la pestaña parpadeante y banner rojo en pantalla — ver FIX
  // 21-sep-2026 más abajo: se quitaron el sonido y la notificación de
  // escritorio que había antes, a pedido explícito) para que la resuelvas
  // aunque estés en otra pestaña o ventana, y (4) continuar solo apenas
  // desaparece. Como TODOS los flujos esperan con esperar(), el arreglo
  // cubre Corrección de Guerra (con sus 4 fases), Nuevos y Verificar semana.
  // -------------------------------------------------------------------------
  var _cfEnDesafio = false;
  var _cfIvTitulo = null;
  var CF_PREFIJO_TITULO = '⚠ VERIFICACIÓN CLOUDFLARE — ';

  /**
   * _textoBodySinPanel(limite)
   * Texto visible de la página SIN contar los elementos que agrega este
   * script (panel, formulario de tokens, banner). Devuelve null si supera
   * `limite` caracteres (una página real, no una pantalla de verificación).
   */
  function _textoBodySinPanel(limite) {
    if (!document.body) return '';
    var total = '';
    var hijos = document.body.children;
    for (var i = 0; i < hijos.length; i++) {
      var c = hijos[i];
      if (c.id === 'cg-panel' || c.id === 'cg-tokens-overlay' || c.id === 'cg-cf-banner') continue;
      total += ' ' + (c.innerText || '');
      if (total.length > limite) return null;
    }
    return total;
  }

  /**
   * hayDesafioCloudflare()
   * true si la página actual es una verificación/bloqueo de Cloudflare.
   * Tres señales: título de la pantalla de verificación, elementos propios
   * del desafío, o (solo en páginas diminutas) su texto característico. NO se
   * usa el <script> /cdn-cgi/challenge-platform/ porque Cloudflare también lo
   * inyecta en páginas normales.
   */
  function hayDesafioCloudflare() {
    try {
      if (/just a moment|un momento|attention required|checking your browser|security check|comprobaci[oó]n de seguridad|verificaci[oó]n de seguridad/i.test(document.title || '')) return true;
      if (document.querySelector('#challenge-form, #challenge-stage, #challenge-running, #cf-challenge-running, #cf-please-wait, .cf-turnstile, [id^="cf-chl-widget"], iframe[src*="challenges.cloudflare.com"]')) return true;
      // Filtro barato: una pantalla de verificación tiene muy pocos elementos;
      // así el texto solo se lee en páginas diminutas y no en las reales.
      if (document.getElementsByTagName('*').length < 400) {
        var texto = _textoBodySinPanel(3000);
        if (texto !== null && /verify(ing)? you are human|verifica(r|ndo)? que eres (un )?(humano|ser humano)|needs to review the security of your connection|checking if the site connection is secure|comprobando si la conexi[oó]n/i.test(texto)) return true;
      }
    } catch (e) { /* nunca romper el flujo por una falla de detección */ }
    return false;
  }

  /**
   * _avisarDesafioCloudflare()
   * FIX (21-sep-2026, pedido usuario): antes esta función también disparaba
   * una notificación de escritorio (GM_notification) y tres pitidos
   * (_beepCloudflare(), Web Audio) cada CF_REAVISO_MS mientras durara la
   * verificación. Ambos se quitaron a pedido explícito — el aviso ahora es
   * SOLO visual: el título de la pestaña parpadea y aparece un banner rojo
   * fijo en la página, ambos ya suficientes para notar la verificación
   * aunque estés en otra pestaña (el título cambia igual) sin sonido ni
   * notificaciones del sistema.
   */
  function _avisarDesafioCloudflare() {
    if (_cfEnDesafio) return;
    _cfEnDesafio = true;

    var visible = false;
    _cfIvTitulo = setInterval(function () {
      visible = !visible;
      var base = String(document.title || '').split(CF_PREFIJO_TITULO).join('');
      document.title = (visible ? CF_PREFIJO_TITULO : '') + base;
    }, 1000);

    if (document.body && !document.getElementById('cg-cf-banner')) {
      var b = document.createElement('div');
      b.id = 'cg-cf-banner';
      b.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:1000001;background:#b00020;color:#fff;' +
        'font:bold 14px/1.4 monospace;text-align:center;padding:10px;';
      b.textContent = '⚠ Cloudflare pide verificación: marca la casilla para continuar. El proceso está en espera y seguirá solo.';
      document.body.appendChild(b);
    }
  }

  /**
   * _terminarAvisoCloudflare()
   * Apaga título parpadeante y banner cuando la verificación ya no está.
   */
  function _terminarAvisoCloudflare() {
    if (!_cfEnDesafio) return;
    _cfEnDesafio = false;
    if (_cfIvTitulo) { clearInterval(_cfIvTitulo); _cfIvTitulo = null; }
    try { document.title = String(document.title || '').split(CF_PREFIJO_TITULO).join(''); } catch (e) {}
    var b = document.getElementById('cg-cf-banner');
    if (b && b.parentNode) b.parentNode.removeChild(b);
  }

  /**
   * esperar(condicionFn, timeoutMs)
   * Igual que antes (resuelve con el valor de condicionFn o null al vencer
   * timeoutMs), con una diferencia: mientras haya una verificación de
   * Cloudflare en pantalla, el tiempo NO corre y se avisa al usuario; al
   * desaparecer, la cuenta regresiva del timeout arranca de cero para darle
   * a la página real el tiempo completo de cargar.
   */
  function esperar(condicionFn, timeoutMs) {
    return new Promise(function (resolve) {
      var transcurrido = 0;
      var venciaDesafio = false;
      var iv = setInterval(function () {
        var r;
        try { r = condicionFn(); } catch (e) { r = null; }
        if (r) { _terminarAvisoCloudflare(); clearInterval(iv); resolve(r); return; }

        if (hayDesafioCloudflare()) {
          venciaDesafio = true;
          _avisarDesafioCloudflare();
          return; // el tiempo de la verificación no cuenta contra el timeout
        }
        if (venciaDesafio) {
          venciaDesafio = false;
          transcurrido = 0;
          _terminarAvisoCloudflare();
        }

        transcurrido += POLL_INTERVAL_MS;
        if (transcurrido >= timeoutMs) { clearInterval(iv); resolve(null); }
      }, POLL_INTERVAL_MS);
    });
  }

  function buscarBotonClanWars2() {
    var candidatos = document.querySelectorAll('button, a, div[role="button"], span[role="button"]');
    for (var i = 0; i < candidatos.length; i++) {
      var el = candidatos[i];
      var texto = (el.textContent || '').trim().toLowerCase();
      var pareceBotonCorrecto = texto.indexOf('load') >= 0 && texto.indexOf('clan wars 2') >= 0;
      if (pareceBotonCorrecto && el.offsetParent !== null) return el;
    }
    return null;
  }

  function buscarTablaClanWars2() {
    var tablas = document.querySelectorAll('table');
    var patronSemana = /^\d+-\d+$/;
    for (var i = 0; i < tablas.length; i++) {
      var filas = tablas[i].querySelectorAll('tbody tr');
      if (filas.length === 0) continue;
      var primeraCelda = filas[0].querySelector('td');
      if (primeraCelda && patronSemana.test((primeraCelda.textContent || '').trim())) return tablas[i];
    }
    return null;
  }

  /**
   * detectarColumnasCompleto(tabla)
   * Igual que detectarColumnas() (Corrección de Guerra), pero además ubica
   * la columna Fecha y la columna Boat Attacks. Por defecto de posición fija
   * (0-based): S=0, Fecha=1, R=2, L=3, C=4(clan), Ataques(decks)=5, Fame=6,
   * ?=7, Barcos=8, ?=9 — igual orden que ya usa detectarColumnas() para
   * decks/fame, extendido con fecha y barcos.
   */
  function detectarColumnasCompleto(tabla) {
    var ths = tabla.querySelectorAll('thead th, thead td');
    var idx = { fecha: -1, clan: -1, decks: -1, fame: -1, barcos: -1 };
    for (var i = 0; i < ths.length; i++) {
      var texto = ((ths[i].getAttribute('title') || '') + ' ' +
                   (ths[i].getAttribute('aria-label') || '') + ' ' +
                   (ths[i].textContent || '')).toLowerCase();
      if (idx.fecha  === -1 && texto.indexOf('date') >= 0) idx.fecha = i;
      if (idx.clan   === -1 && (texto.indexOf('clan') >= 0 && texto.indexOf('wars') < 0)) idx.clan = i;
      if (idx.decks  === -1 && texto.indexOf('deck') >= 0) idx.decks = i;
      if (idx.fame   === -1 && texto.indexOf('fame') >= 0) idx.fame = i;
      if (idx.barcos === -1 && texto.indexOf('boat') >= 0) idx.barcos = i;
    }
    if (idx.fecha  === -1) idx.fecha  = 1;
    if (idx.clan   === -1) idx.clan   = 4;
    if (idx.decks  === -1) idx.decks  = 5;
    if (idx.fame   === -1) idx.fame   = 6;
    if (idx.barcos === -1) idx.barcos = 8;
    return idx;
  }

  // FIX (15-ago-2026, pedido usuario: agregar Barcos a Correcciones_Guerra.csv).
  // Antes esta función solo pedía decksUsedIdx/fameIdx a detectarColumnasCompleto()
  // — la columna de Barcos ("Boat Attacks") YA se detecta ahí (idx.barcos,
  // usada desde antes por leerHistorialCompleto() para el flujo de
  // "Nuevos"), simplemente no se exponía acá. Ahora se expone también
  // barcosIdx.
  function detectarColumnas(tabla) {
    var c = detectarColumnasCompleto(tabla);
    return { decksUsedIdx: c.decks, fameIdx: c.fame, barcosIdx: c.barcos };
  }

  function leerFilasClanWars2(tabla, clanesTerna) {
    var cols = detectarColumnas(tabla);
    var filas = tabla.querySelectorAll('tbody tr');
    var resultado = [];
    for (var i = 0; i < filas.length; i++) {
      var celdas = filas[i].querySelectorAll('td');
      if (celdas.length < 5) continue;
      var sTexto = (celdas[0].textContent || '').trim();
      var partes = sTexto.split('-');
      if (partes.length !== 2) continue;
      var temporadaRoyaleApi = parseInt(partes[0], 10);
      var semana = parseInt(partes[1], 10);
      if (!temporadaRoyaleApi || !semana) continue;
      var clanTexto = (celdas[4].textContent || '').trim();
      var esTerna = clanesTerna.some(function (nombreTerna) {
        var norm = function (s) { return s.toLowerCase().replace(/[^a-z0-9]/g, ''); };
        return norm(clanTexto).indexOf(norm(nombreTerna)) >= 0 || norm(nombreTerna).indexOf(norm(clanTexto)) >= 0;
      });
      if (!esTerna) continue;
      var ataques = parseInt((celdas[cols.decksUsedIdx] && celdas[cols.decksUsedIdx].textContent || '').trim(), 10);
      var fame = parseInt((celdas[cols.fameIdx] && celdas[cols.fameIdx].textContent || '').trim(), 10);
      if (isNaN(ataques) || isNaN(fame)) continue;
      // FIX (15-ago-2026): Barcos, igual criterio que leerHistorialCompleto()
      // — celda vacía (semana sin ese dato todavía) se manda como undefined,
      // NUNCA como 0, para que el backend (_aplicarCorreccionesGuerra(),
      // 10_CorreccionGuerra.gs) sepa distinguir "sin dato" de "0 barcos" y
      // no pise un valor ya guardado con un 0 falso.
      var barcosTxt = (celdas[cols.barcosIdx] && celdas[cols.barcosIdx].textContent || '').trim();
      var barcos = barcosTxt === '' ? undefined : parseInt(barcosTxt, 10);
      if (barcos !== undefined && isNaN(barcos)) barcos = undefined;
      resultado.push({ temporadaRoyaleApi: temporadaRoyaleApi, semana: semana, clan: clanTexto, ataquesSemana: ataques, fame: fame, barcos: barcos });
    }
    return resultado;
  }

  /**
   * limpiarTextoClan(texto)
   * FIX (04-ago-2026): en RoyaleAPI, la celda de "Clan" del historial trae a
   * veces contenido extra pegado al nombre del clan (tooltip/texto oculto,
   * capturado igual por .textContent aunque no se vea en pantalla) —
   * reportado por el usuario como "la columna Clan trae el clan y la fecha
   * juntos". Se descarta todo lo que venga después del nombre real del clan,
   * ya sea separado por un salto de línea o directamente por el patrón de
   * fecha ISO ("YYYY-MM-DD..."). Mismo criterio que _sanitizarClanNuevos()
   * del lado del Apps Script (20_Nuevos_RoyaleAPI.gs) — doble resguardo.
   */
  function limpiarTextoClan(texto) {
    var s = String(texto || '');
    s = s.split(/\r?\n/)[0];
    s = s.replace(/\s+\d{4}-\d{2}-\d{2}[\s\S]*$/, '');
    return s.trim();
  }

  /**
   * leerHistorialCompleto(tabla)
   * NUEVO — a diferencia de leerFilasClanWars2(), NO filtra por clan (se
   * necesita ver también las filas del clan anterior, si lo hubo) y además
   * lee Fecha y Barcos. Devuelve TODAS las filas de la tabla, en el mismo
   * orden en que aparecen (más reciente primero, según confirmó el
   * usuario), con la fecha ya normalizada a texto "YYYY-MM-DD".
   *
   * FIX (06-ago-2026): cada registro también trae `temporada` (texto
   * "134-4", tal cual la muestra la primera columna de la tabla de
   * RoyaleAPI) — se usa solo del lado del backend para el archivo temporal
   * de depuración, nunca se escribe en la hoja "Nuevos".
   */
  function leerHistorialCompleto(tabla) {
    var cols = detectarColumnasCompleto(tabla);
    var filas = tabla.querySelectorAll('tbody tr');
    var resultado = [];
    for (var i = 0; i < filas.length; i++) {
      var celdas = filas[i].querySelectorAll('td');
      if (celdas.length < 5) continue;

      // FIX (06-ago-2026): la primera columna de la tabla ("S" en RoyaleAPI,
      // celdas[0]) trae la Temporada-Semana como texto "134-4" — antes esta
      // función nunca la leía (solo la usaba leerFilasClanWars2(), la rama
      // de Corrección de Guerra), así que se perdía por completo para el
      // flujo de "Nuevos". Pedido explícito del usuario: esta Temporada
      // debe viajar en cada registro y guardarse en el archivo temporal de
      // depuración del backend (Tag|Temporada|Fecha|Clan|Ataques|Fame|
      // Barcos, ver _guardarSnapshotDebugImportacionNuevos(),
      // 08_Nuevos_RoyaleAPI.gs) — NO se escribe en la hoja "Nuevos" (esa
      // hoja solo tiene Clan/Ataques/Fame/Barcos por fecha), únicamente en
      // el temporal, para hacer más fácil auditar qué semana real de
      // RoyaleAPI originó cada fila.
      var temporadaTexto = (celdas[0] && celdas[0].textContent || '').trim();
      if (!/^\d+-\d+$/.test(temporadaTexto)) temporadaTexto = '';

      var fechaTexto = (celdas[cols.fecha] && celdas[cols.fecha].textContent || '').trim();
      // Normalizar a YYYY-MM-DD si ya viene así; si RoyaleAPI muestra otro
      // formato, se intenta parsear con Date() como respaldo.
      var fechaISO = null;
      if (/^\d{4}-\d{2}-\d{2}/.test(fechaTexto)) {
        fechaISO = fechaTexto.slice(0, 10);
      } else if (fechaTexto) {
        var dParse = new Date(fechaTexto);
        if (!isNaN(dParse.getTime())) {
          var yyyy = dParse.getFullYear();
          var mm = String(dParse.getMonth() + 1).padStart(2, '0');
          var dd = String(dParse.getDate()).padStart(2, '0');
          fechaISO = yyyy + '-' + mm + '-' + dd;
        }
      }
      if (!fechaISO) continue;

      // FIX (04-ago-2026): limpiarTextoClan() descarta cualquier fecha u
      // otro dato pegado al nombre del clan (ver comentario de la función).
      var clanTexto = limpiarTextoClan((celdas[cols.clan] && celdas[cols.clan].textContent || '').trim());

      var ataquesTxt = (celdas[cols.decks]  && celdas[cols.decks].textContent  || '').trim();
      var fameTxt    = (celdas[cols.fame]   && celdas[cols.fame].textContent   || '').trim();
      var barcosTxt  = (celdas[cols.barcos] && celdas[cols.barcos].textContent || '').trim();

      var ataques = ataquesTxt === '' ? '' : (parseInt(ataquesTxt, 10) || 0);
      var fame    = fameTxt    === '' ? '' : (parseInt(fameTxt, 10)    || 0);
      var barcos  = barcosTxt  === '' ? '' : (parseInt(barcosTxt, 10)  || 0);

      resultado.push({ temporada: temporadaTexto, fecha: fechaISO, clan: clanTexto, ataques: ataques, fame: fame, barcos: barcos });
    }
    return resultado;
  }

  /**
   * esClanTerna(nombreClan, clanesTerna)
   * Mismo criterio de comparación flexible que ya usa leerFilasClanWars2().
   */
  function esClanTerna(nombreClan, clanesTerna) {
    var norm = function (s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); };
    var n = norm(nombreClan);
    return clanesTerna.some(function (nombreTerna) {
      var nt = norm(nombreTerna);
      return n.indexOf(nt) >= 0 || nt.indexOf(n) >= 0;
    });
  }

  // =========================================================================
  // MÉTODO RÁPIDO — WAR ANALYTICS (NUEVO, v1.2)
  // =========================================================================
  // Página https://royaleapi.com/clan/{TAG}/war/analytics de cada clan
  // Terna. Sin abrir un solo perfil, trae dos tablas con Ataques/Fame de
  // TODOS los jugadores que pasaron por ese clan (miembros actuales y
  // pasados), semana por semana:
  //   - "Contribution"  (columna 5 = "C"): Fame por semana.
  //   - "Decks Used"    (columna 5 = "D"): Ataques por semana.
  // Ambas comparten el mismo layout de columnas: Player | M | R | P | C-o-D
  // | <semana más reciente> | <semana anterior> | ... (encabezado tipo
  // "134-4" = Temporada 134, Semana 4 — mismo formato que ya usa
  // leerFilasClanWars2() para la tabla de "Clan Wars 2 History" del perfil).
  // =========================================================================

  function construirUrlAnalytics(tagClan) {
    return 'https://royaleapi.com/clan/' + String(tagClan).replace('#', '') + '/war/analytics';
  }

  /**
   * buscarTablasAnalytics()
   * Identifica las dos tablas por la 5ª columna de su encabezado ("C" o
   * "D") en vez de por texto de una sección/heading — más robusto ante
   * cambios de maquetación, y evita depender de encontrar un heading exacto
   * "Contribution"/"Decks Used" en el DOM.
   */
  function buscarTablasAnalytics() {
    var tablas = document.querySelectorAll('table');
    var tablaFame = null, tablaAtaques = null;
    for (var i = 0; i < tablas.length; i++) {
      var ths = tablas[i].querySelectorAll('thead th, thead td');
      if (ths.length < 6) continue;
      var primeraCol = (ths[0].textContent || '').trim().toLowerCase();
      if (primeraCol.indexOf('player') !== 0) continue;
      var quintaCol = (ths[4].textContent || '').trim().toUpperCase();
      if (quintaCol === 'C' && !tablaFame) tablaFame = tablas[i];
      else if (quintaCol === 'D' && !tablaAtaques) tablaAtaques = tablas[i];
    }
    if (tablaFame && tablaAtaques) return { fame: tablaFame, ataques: tablaAtaques };
    return null;
  }

  /**
   * asegurarToggleMiembrosActualesApagado()
   * "Current members only" debe estar APAGADO para que la tabla incluya
   * también a quienes ya no son miembros activos (p. ej. alguien que se
   * reincorporó hace poco y necesita su historial previo). Por defecto el
   * toggle ya viene apagado (confirmado por el usuario), así que esta
   * función es solo un resguardo: si lo encuentra ENCENDIDO, lo apaga. No
   * recarga la página (confirmado: es 100% client-side).
   *
   * FIX (14-ago-2026, pedido usuario): la página de Analytics tiene DOS
   * toggles "Current members only" independientes — uno para la tabla de
   * Fame ("Contribution") y otro para la de Ataques ("Decks Used"). La
   * versión anterior hacía `return` apenas encontraba el PRIMERO (estuviera
   * prendido o ya apagado), así que el segundo (Ataques) nunca se
   * revisaba/apagaba. Ahora se recorren TODOS los candidatos que matcheen
   * "current members only" y se apaga cada uno que esté encendido, en vez
   * de cortar en el primer match.
   *
   * Se re-consulta el DOM (querySelectorAll) después de cada click en vez
   * de reusar el NodeList original: si el click dispara un re-render de esa
   * tabla, los nodos del toggle restante podrían quedar obsoletos/perder su
   * referencia. numIntentos pone un techo de seguridad para nunca quedar en
   * loop infinito si, por algún motivo, un toggle no llegara a apagarse con
   * el click.
   *
   * @returns {number} cantidad de toggles que se apagaron en esta llamada.
   */
  function asegurarToggleMiembrosActualesApagado() {
    var totalApagados = 0;
    var numIntentos = 0;
    var MAX_INTENTOS = 10; // resguardo: nunca debería necesitar más de 2 (Fame + Ataques)

    while (numIntentos < MAX_INTENTOS) {
      numIntentos++;
      var candidatos = document.querySelectorAll('button[role="switch"], input[type="checkbox"], [role="switch"]');
      var seEncontroEncendido = false;

      for (var i = 0; i < candidatos.length; i++) {
        var el = candidatos[i];
        var contenedor = el.closest ? el.closest('div') : el.parentElement;
        var textoCercano = ((contenedor && contenedor.textContent) || '').toLowerCase();
        if (textoCercano.indexOf('current members only') === -1) continue;
        var encendido = (el.getAttribute && el.getAttribute('aria-checked') === 'true') || el.checked === true;
        if (!encendido) continue; // este toggle puntual ya está apagado, se sigue revisando el resto

        el.click();
        totalApagados++;
        seEncontroEncendido = true;
        break; // se sale del for para re-consultar el DOM (posible re-render) antes de seguir
      }

      if (!seEncontroEncendido) break; // pasada completa sin ningún toggle encendido: listo
    }

    return totalApagados; // 0 si ya estaban ambos apagados (o no se encontró ninguno)
  }

  /**
   * parsearTablaAnalytics(tabla)
   * Devuelve { tag: { "temporadaRoyaleApi-semana": valorNumerico, ... }, ... }.
   * El tag de cada jugador se saca del href del link de su nombre
   * (/player/TAG/...) — esta tabla NO muestra el tag como texto. Si una fila
   * no trae ese link (caso raro), se descarta esa fila entera: sin tag no
   * hay forma confiable de cruzarla con el Directorio.
   */
  function parsearTablaAnalytics(tabla) {
    var ths = tabla.querySelectorAll('thead th, thead td');
    var semanas = []; // { idx: índice de columna (0-based, incluye toda la fila td), temporadaRoyaleApi, semana }
    for (var c = 5; c < ths.length; c++) {
      var texto = (ths[c].textContent || '').replace(/\s+/g, '');
      var partes = texto.split('-');
      if (partes.length !== 2) continue;
      var temporadaRoyaleApi = parseInt(partes[0], 10);
      var semana = parseInt(partes[1], 10);
      if (!temporadaRoyaleApi || !semana) continue;
      semanas.push({ idx: c, temporadaRoyaleApi: temporadaRoyaleApi, semana: semana });
    }

    var resultado = {};
    var filas = tabla.querySelectorAll('tbody tr');
    for (var i = 0; i < filas.length; i++) {
      var celdas = filas[i].querySelectorAll('td');
      if (celdas.length < 6) continue;

      var link = celdas[0].querySelector('a[href*="/player/"]');
      if (!link) continue;
      var m = (link.getAttribute('href') || '').match(/\/player\/([A-Z0-9]+)/i);
      if (!m) continue;
      var tag = '#' + m[1].toUpperCase();

      var porSemana = resultado[tag] || {};
      for (var s = 0; s < semanas.length; s++) {
        var sem = semanas[s];
        if (sem.idx >= celdas.length) continue;
        var txt = (celdas[sem.idx].textContent || '').trim();
        if (txt === '') continue; // semana en blanco (todavía no jugaba ahí, o semana futura)
        var val = parseInt(txt, 10);
        if (isNaN(val)) continue;
        porSemana[sem.temporadaRoyaleApi + '-' + sem.semana] = val;
      }
      resultado[tag] = porSemana;
    }
    return resultado;
  }

  /**
   * combinarFameYAtaques(mapaFame, mapaAtaques)
   * Une los dos mapas de parsearTablaAnalytics() en el mismo formato que
   * espera enviarCorrecciones(): solo se genera una corrección para
   * (tag, semana) cuando AMBOS valores (fame y ataques) están presentes —
   * igual criterio que ya exige _aplicarCorreccionesGuerra() del backend
   * (isNaN() descarta la fila si falta cualquiera de los dos).
   */
  function combinarFameYAtaques(mapaFame, mapaAtaques) {
    var correcciones = [];
    var tagsEncontrados = {};
    var todosLosTags = {};
    for (var t in mapaFame) todosLosTags[t] = true;
    for (var t2 in mapaAtaques) todosLosTags[t2] = true;

    for (var tag in todosLosTags) {
      tagsEncontrados[tag] = true; // aparecer en CUALQUIERA de las dos tablas ya cuenta como "encontrado" (cubre la roster de este clan)
      var semanasFame = mapaFame[tag] || {};
      var semanasAtaques = mapaAtaques[tag] || {};
      for (var clave in semanasFame) {
        if (!(clave in semanasAtaques)) continue;
        var partes = clave.split('-');
        correcciones.push({
          tag: tag,
          temporadaRoyaleApi: parseInt(partes[0], 10),
          semana: parseInt(partes[1], 10),
          ataquesSemana: semanasAtaques[clave],
          fame: semanasFame[clave]
        });
      }
    }
    return { correcciones: correcciones, tagsEncontrados: tagsEncontrados };
  }

  // =========================================================================
  // MÉTODO INTERMEDIO — WAR LOG (NUEVO)
  // =========================================================================
  // Página https://royaleapi.com/clan/{TAG}/war/log de cada clan Terna. A
  // diferencia de Analytics (que solo muestra unas pocas semanas recientes),
  // esta página lista TODAS las guerras (River Race) que RoyaleAPI conserva
  // para ese clan, cada una con su tabla de "Participants": Ataques, Barcos
  // y Fame por jugador — el único de los 3 métodos que trae Barcos sin tener
  // que abrir un perfil.
  // =========================================================================

  var LOG_TABLE_WAIT_MS = 15000;      // igual de generoso que ANALYTICS_TABLE_WAIT_MS
  var LOG_MAX_INTENTOS_CARGA = 40;    // techo de seguridad para el loop de "cargar más"
  var LOG_PAUSA_TRAS_CLICK_MS = 900;

  function construirUrlLog(tagClan) {
    return 'https://royaleapi.com/clan/' + String(tagClan).replace('#', '') + '/war/log';
  }

  /**
   * _registrarSemanasCubiertas(estado, correcciones)
   * v2.9: anota por jugador cada semana "134-4" que Log o Analytics aportaron
   * en ESTA corrida, para que la fase 'perfiles' no la reenvíe y pise el valor
   * del Log con el del perfil (el perfil muestra un solo clan por semana).
   */
  function _registrarSemanasCubiertas(estado, correcciones) {
    if (!estado.semanasCubiertas) estado.semanasCubiertas = {};
    for (var i = 0; i < correcciones.length; i++) {
      var c = correcciones[i];
      var etiqueta = c.temporadaRoyaleApi + '-' + c.semana;
      var lista = estado.semanasCubiertas[c.tag] || (estado.semanasCubiertas[c.tag] = []);
      if (lista.indexOf(etiqueta) === -1) lista.push(etiqueta);
    }
  }

  /**
   * _prepararCorreccionesPorClan(filas, estado)
   * v3.0 (reemplaza a _consolidarCorreccionesPorSemana() de v2.9, que SUMABA
   * entre clanes): el backend ya guarda una fila por (temporada, semana,
   * clanTag, tag) y él mismo suma para Control/Control_2 (18_CorreccionGuerra.gs,
   * _cargarOverlayCorreccionesGuerra()). Por eso aquí NO se suma nada: cada
   * fila de Log/Analytics sale tal cual con su clanTag. Solo se quitan
   * repetidos exactos de la misma clave (misma semana y mismo clan del mismo
   * jugador), quedándose con el último. Una fila sin clanTag (estado guardado
   * por una versión anterior a v3.0 que quedó a medias) se envía sin clanTag,
   * como siempre. Si el mismo jugador suma más de 16 ataques entre clanes en
   * una semana, SOLO se avisa en el registro (antes se bloqueaba el envío):
   * la fila se guarda igual y se revisa a mano en Correcciones_Guerra.csv.
   */
  function _prepararCorreccionesPorClan(filas, estado) {
    var porClave = {}, orden = [];
    for (var i = 0; i < filas.length; i++) {
      var f = filas[i];
      var clave = f.tag + '|' + f.temporadaRoyaleApi + '|' + f.semana + '|' + (f.clanTag || '');
      if (!(clave in porClave)) orden.push(clave);
      porClave[clave] = f;
    }
    var salida = [], totalPorSemana = {}, clanesPorSemana = {};
    for (var k = 0; k < orden.length; k++) {
      var r = porClave[orden[k]];
      var fila = { tag: r.tag, temporadaRoyaleApi: r.temporadaRoyaleApi, semana: r.semana,
        ataquesSemana: r.ataquesSemana, fame: r.fame, barcos: r.barcos };
      if (r.clanTag) fila.clanTag = r.clanTag;
      salida.push(fila);
      var cs = r.tag + '|' + r.temporadaRoyaleApi + '|' + r.semana;
      totalPorSemana[cs] = (totalPorSemana[cs] || 0) + (Number(r.ataquesSemana) || 0);
      clanesPorSemana[cs] = (clanesPorSemana[cs] || 0) + 1;
    }
    var enVarios = 0;
    for (var cs2 in clanesPorSemana) {
      if (clanesPorSemana[cs2] < 2) continue;
      enVarios++;
      if (totalPorSemana[cs2] > 16) {
        var pp = cs2.split('|');
        log(estado, '  ⚠ REVISAR A MANO: ' + pp[0] + ' semana ' + pp[1] + '-' + pp[2] + ' sale en ' + clanesPorSemana[cs2] +
          ' clanes y la suma de ataques da ' + totalPorSemana[cs2] + ' (máximo 16). Se envía igual, una fila por clan; revisar en Correcciones_Guerra.csv.');
      }
    }
    if (enVarios > 0) {
      log(estado, '  ℹ ' + enVarios + ' semana(s) de jugadores en 2 o más clanes Terna: se envían una fila por clan (el backend suma para Control).');
    }
    return salida;
  }

  /**
   * _saltarClanesConLogOk(estado)
   * v2.9: Analytics es solo respaldo — se salta cualquier clan cuyo Log sí
   * entregó filas.
   */
  function _saltarClanesConLogOk(estado) {
    var ok = estado.logClanesOk || [];
    while (estado.analyticsIndiceClan < estado.clanTagsTerna.length &&
           ok.indexOf(estado.clanTagsTerna[estado.analyticsIndiceClan]) !== -1) {
      estado.analyticsIndiceClan++;
    }
    guardarEstado(estado);
  }

  /**
   * encontrarBotonCargarMasLog()
   * Mismo patrón que buscarBotonClanWars2() (fase de perfiles): busca un
   * elemento clicable visible cuyo texto sugiera "cargar más historial".
   * PUNTO A AJUSTAR si RoyaleAPI usa otro texto/mecanismo (ej. scroll
   * infinito sin botón — en ese caso esta función simplemente nunca
   * encuentra nada y cargarTodoElLog() se queda con lo que ya cargó el
   * scroll, sin romper nada).
   */
  function encontrarBotonCargarMasLog() {
    var candidatos = document.querySelectorAll('button, a, div[role="button"], span[role="button"]');
    for (var i = 0; i < candidatos.length; i++) {
      var el = candidatos[i];
      var texto = (el.textContent || '').trim().toLowerCase();
      var parece = texto.indexOf('load') >= 0 || texto.indexOf('more') >= 0 || texto.indexOf('cargar') >= 0;
      if (parece && el.offsetParent !== null) return el;
    }
    return null;
  }

  /**
   * cargarTodoElLog(estado, tagClan)
   * Baja hasta el final de la página y clickea "cargar más" (si existe) en
   * un loop, hasta que dos vueltas seguidas no agreguen tablas nuevas (o se
   * llegue al techo de seguridad) — mismo criterio de "esperar a que se
   * estabilice" que ya usa el resto del proyecto para contenido dinámico.
   */
  async function cargarTodoElLog(estado, tagClan) {
    var intentos = 0;
    var sinCambioSeguidos = 0;
    var totalTablasAntes = -1;

    while (intentos < LOG_MAX_INTENTOS_CARGA) {
      intentos++;
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise(function (resolve) { setTimeout(resolve, 500); });

      var boton = encontrarBotonCargarMasLog();
      if (boton) {
        boton.click();
        await new Promise(function (resolve) { setTimeout(resolve, LOG_PAUSA_TRAS_CLICK_MS); });
      }

      var totalTablasAhora = document.querySelectorAll('table').length;
      if (totalTablasAhora === totalTablasAntes) {
        sinCambioSeguidos++;
        if (sinCambioSeguidos >= 2) break;
      } else {
        sinCambioSeguidos = 0;
      }
      totalTablasAntes = totalTablasAhora;

      if (!boton && sinCambioSeguidos >= 1) break; // sin botón y sin crecimiento: nada más que cargar
    }

    log(estado, '  … Log de ' + tagClan + ': carga completa tras ' + intentos + ' intento(s).');
  }

  /**
   * encontrarEncabezadosSemanaLog()
   * Devuelve [{el, temporadaRoyaleApi, semana}], EN ORDEN DE DOCUMENTO.
   * FIX v1.5 (confirmado con diagnóstico contra el DOM real del usuario,
   * no ya con el PDF de ejemplo ni con web_fetch): el intento anterior
   * (v1.3) asumía que "Clan War Season 135" y "Week 1" eran dos nodos
   * "hoja" separados y consecutivos — FALSO. En el DOM real vienen los
   * DOS juntos en UN SOLO nodo hoja (un <div>), con el texto completo
   * "Clan War Season 135 Week 1". Los nodos "Week" sueltos que sí existen
   * por separado (confirmado por el diagnóstico: varios <th>/<span> con
   * texto exactamente "Week") pertenecen a la tabla de RESUMEN de arriba
   * de la página (columnas Week/Rank/Boat/Trophy) y no tienen el número de
   * semana en su propio texto — por eso el patrón exige que "Week" venga
   * seguido de un número en el MISMO nodo, lo que los descarta de forma
   * natural sin necesidad de emparejar nada.
   */
  function encontrarEncabezadosSemanaLog() {
    var patronCombinado = /^\s*Clan\s+War\s+Season\s+(\d+)\s+Week\s+(\d+)\s*$/i;
    var candidatos = document.querySelectorAll('body *');
    var out = [];

    // DIAGNÓSTICO (mantener hasta confirmar que v1.5 funciona en las 4
    // clanes): igual que antes, si por algún motivo no se encuentra nada
    // con el patrón combinado, se junta una muestra de cualquier elemento
    // que mencione "week" para poder seguir ajustando sin adivinar.
    var diagWeekCandidatos = [];

    for (var i = 0; i < candidatos.length; i++) {
      var el = candidatos[i];
      if (el.children && el.children.length > 0) continue; // solo nodos "hoja"
      var texto = (el.textContent || '').trim();
      if (texto === '') continue;

      var m = texto.match(patronCombinado);
      if (m) {
        out.push({ el: el, temporadaRoyaleApi: parseInt(m[1], 10), semana: parseInt(m[2], 10) });
        continue;
      }

      if (diagWeekCandidatos.length < 8 && /week/i.test(texto) && texto.length < 60) {
        diagWeekCandidatos.push(
          el.tagName + (el.children.length > 0 ? '(contenedor)' : '(hoja)') + ': "' + texto + '"'
        );
      }
    }

    // out ya queda en orden de documento porque querySelectorAll('body *')
    // devuelve los nodos en orden de documento y se recorren en ese orden.
    out.diagSeasonMarkers = out.length;   // ahora season y week son el mismo marcador combinado
    out.diagWeekMarkers = out.length;
    out.diagWeekCandidatos = diagWeekCandidatos;
    return out;
  }

  /**
   * parsearParticipantesLog()
   * Recorre TODAS las tablas de la página, se queda solo con las de
   * "Participants" (segunda celda de encabezado empieza con "Participants",
   * CONFIRMADO contra el HTML real de /war/log — no ya un PDF de ejemplo —
   * la fila de encabezado trae: "#" | "Participants: 83" | 782 | 0 | 127650,
   * es decir 5 celdas, igual cantidad que cada fila de datos), les asocia
   * la semana del encabezado "Clan War Season N Week M" más cercano ANTES
   * de esa tabla en el documento, y lee cada fila:
   *   celda[1] = nombre (con link a /player/TAG/...) | celda[2] = Ataques |
   *   celda[3] = Barcos | celda[4] = Fame.
   * CONFIRMADO con datos reales (fila de ejemplo: "1 | Sebas JAS | 16 | 0 |
   * 3100"). Igual criterio "tag desde el href, nunca desde el nombre
   * visible" que ya usa parsearTablaAnalytics()/leerFilasClanWars2(), para
   * no confundir cuentas con nombres repetidos (hay varias en este mismo
   * clan).
   * No filtra por clan: el listado de "Participants" de la página de un
   * clan Terna siempre corresponde a ESE clan, a diferencia de la tabla de
   * perfil (que sí mezcla varios clanes y necesita filtro).
   */
  function parsearParticipantesLog() {
    var encabezados = encontrarEncabezadosSemanaLog(); // orden de documento
    var tablas = document.querySelectorAll('table');
    var correcciones = [];
    var tagsEncontrados = {};

    // DIAGNÓSTICO (15-ago-2026) — mientras el selector de Log no está
    // confirmado con el DOM real, se cuenta en qué paso se pierde cada
    // tabla, para verlo en el log del panel sin tener que abrir devtools.
    var diag = {
      tablasTotal: tablas.length,
      seasonMarkers: encabezados.diagSeasonMarkers || 0,
      weekMarkers: encabezados.diagWeekMarkers || 0,
      encabezadosEmparejados: encabezados.length,
      tablasSinFilaHead: 0,
      tablasHeaderNoParticipants: 0,
      tablasParticipantsSinSemana: 0,
      tablasParticipantsConSemana: 0,
      filasSinValueBg: 0,
      filasSinLinkPlayer: 0,
      filasConLinkNaN: 0,
      // Para ver un ejemplo real del texto que SÍ se está encontrando en la
      // 2da celda del header, cuando no matchea "Participants".
      ejemplosHeaderSegundaCelda: [],
      weekCandidatos: encabezados.diagWeekCandidatos || []
    };

    function comparePos(elA, elB) {
      var pos = elA.compareDocumentPosition(elB);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1; // elA antes que elB
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    }

    for (var t = 0; t < tablas.length; t++) {
      var tabla = tablas[t];
      var filaHead = tabla.querySelector('thead tr, tr');
      if (!filaHead) { diag.tablasSinFilaHead++; continue; }
      var celdasHead = filaHead.querySelectorAll('th, td');
      if (celdasHead.length < 2) { diag.tablasSinFilaHead++; continue; }
      var textoSegunda = (celdasHead[1].textContent || '').trim();
      if (!/^participants/i.test(textoSegunda)) {
        diag.tablasHeaderNoParticipants++;
        if (diag.ejemplosHeaderSegundaCelda.length < 5 && textoSegunda) {
          diag.ejemplosHeaderSegundaCelda.push(textoSegunda);
        }
        continue; // no es tabla de participantes
      }

      var semanaAsociada = null;
      for (var h = 0; h < encabezados.length; h++) {
        if (comparePos(encabezados[h].el, tabla) <= 0) semanaAsociada = encabezados[h];
        else break; // encabezados[] ya está en orden documento
      }
      if (!semanaAsociada) { diag.tablasParticipantsSinSemana++; continue; } // sin semana asociada: se descarta (sin forma confiable de saber a cuál pertenece)
      diag.tablasParticipantsConSemana++;

      var filas = tabla.querySelectorAll('tbody tr');
      for (var f = 0; f < filas.length; f++) {
        var fila = filas[f];

        // FIX v1.9 (confirmado con diagnóstico contra el DOM real): cada
        // fila NO tiene 5 <td> como se asumía originalmente — solo tiene 2
        // (.rank y .player_name). Ataques, Barcos y Fame están adentro del
        // segundo <td>, como <div class="value_bg XXX">valor</div>, con
        // XXX = decks_used (Ataques) | boat_attacks (Barcos) | fame (Fame).
        // Ejemplo real: <div class="value_bg decks_used">16</div>
        //               <div class="value_bg boat_attacks">0</div>
        //               <div class="value_bg fame">3000</div>
        var link = fila.querySelector('a[href*="/player/"]');
        if (!link) { diag.filasSinLinkPlayer++; continue; } // sin link al perfil: sin tag confiable, se descarta la fila
        var m = (link.getAttribute('href') || '').match(/\/player\/([A-Z0-9]+)/i);
        if (!m) { diag.filasConLinkNaN++; continue; }
        var tag = '#' + m[1].toUpperCase();

        var elAtaques = fila.querySelector('.value_bg.decks_used');
        var elBarcos = fila.querySelector('.value_bg.boat_attacks');
        var elFame = fila.querySelector('.value_bg.fame');
        if (!elAtaques || !elFame) {
          diag.filasSinValueBg++;
          if (diag.ejemploFilaDescartada === undefined) {
            diag.ejemploFilaDescartada = 'sin .value_bg.decks_used o .value_bg.fame | outerHTML: ' +
              (fila.outerHTML || '').slice(0, 2000);
          }
          continue;
        }

        var ataques = parseInt((elAtaques.textContent || '').trim(), 10);
        var fame = parseInt((elFame.textContent || '').trim(), 10);
        if (isNaN(ataques) || isNaN(fame)) continue;
        var barcosTxt = elBarcos ? (elBarcos.textContent || '').trim() : '';
        var barcos = barcosTxt === '' ? undefined : parseInt(barcosTxt, 10);
        if (barcos !== undefined && isNaN(barcos)) barcos = undefined;

        correcciones.push({
          tag: tag,
          temporadaRoyaleApi: semanaAsociada.temporadaRoyaleApi,
          semana: semanaAsociada.semana,
          ataquesSemana: ataques,
          fame: fame,
          barcos: barcos
        });
        tagsEncontrados[tag] = true;
      }
    }
    return { correcciones: correcciones, tagsEncontrados: tagsEncontrados, diag: diag };
  }

  /**
   * procesarClanLogActual(estado)
   * Un paso de la fase 'log': si la página actual no es la de Log del clan
   * esperado, navega ahí; si ya está ahí, espera a que cargue alguna tabla,
   * carga todo el historial disponible (cargarTodoElLog), parsea y avanza al
   * siguiente clan (o pasa a 'perfiles' si ya se recorrieron los 4).
   */
  async function procesarClanLogActual(estado) {
    var tagClan = estado.clanTagsTerna[estado.logIndiceClan];
    if (!tagClan) { cerrarFaseLog(estado); return; }

    log(estado, '[Log] Clan ' + (estado.logIndiceClan + 1) + '/' + estado.clanTagsTerna.length + ': ' + tagClan);

    var hayTabla = await esperar(function () { return document.querySelector('table'); }, LOG_TABLE_WAIT_MS);
    if (!hayTabla) {
      log(estado, '  ⚠ No cargó ninguna tabla de Log para ' + tagClan + ' a tiempo. Se salta este clan (sus jugadores quedan cubiertos por Analytics si ya lo estaban, o por el método de perfil).');
      estado.logTotalClanesError++;
      estado.logIndiceClan++;
      guardarEstado(estado);
      setTimeout(function () { irAlSiguienteClanLog(estado); }, PAUSA_ENTRE_CLANES_MS);
      return;
    }

    await cargarTodoElLog(estado, tagClan);

    var resultado = parsearParticipantesLog();
    // v3.0: cada fila lleva el clanTag del clan cuyo Log se está leyendo (el backend guarda una fila por clan).
    for (var ctL = 0; ctL < resultado.correcciones.length; ctL++) resultado.correcciones[ctL].clanTag = tagClan;
    estado.logCorrecciones = estado.logCorrecciones.concat(resultado.correcciones);
    _registrarSemanasCubiertas(estado, resultado.correcciones);
    // PUNTO 2 — mismo criterio que en Analytics, pero Log SÍ trae Barcos.
    var clanNombreLog = estado.clanesTerna[estado.logIndiceClan] || tagClan;
    for (var liHist = 0; liHist < resultado.correcciones.length; liHist++) {
      var corrL = resultado.correcciones[liHist];
      var jInfoL = estado.jugadorPorTag[corrL.tag];
      _agregarRegistroHistorial(estado, corrL.tag, jInfoL ? jInfoL.nombre : '', clanNombreLog, {
        temporadaRoyaleApi: corrL.temporadaRoyaleApi,
        semana: corrL.semana,
        clan: clanNombreLog,
        ataques: corrL.ataquesSemana,
        fame: corrL.fame,
        barcos: (corrL.barcos === undefined ? null : corrL.barcos),
        fuente: 'log',
        cerrada: true
      });
    }
    _flushHistorialSiHaceFalta(estado, false);
    for (var tagEnc in resultado.tagsEncontrados) {
      if (estado.logTagsEncontrados.indexOf(tagEnc) === -1) estado.logTagsEncontrados.push(tagEnc);
    }
    if (resultado.correcciones.length === 0) {
      // v2.9: una tabla sin filas legibles cuenta como fallo del Log de ese clan (Analytics lo respalda).
      estado.logTotalClanesError++;
      log(estado, '  ⚠ El Log de ' + tagClan + ' cargó pero no se pudo leer ninguna fila. Este clan pasará a Analytics de respaldo.');
    } else {
      estado.logTotalClanesOk++;
      if (!estado.logClanesOk) estado.logClanesOk = [];
      if (estado.logClanesOk.indexOf(tagClan) === -1) estado.logClanesOk.push(tagClan);
      log(estado, '  ✔ ' + Object.keys(resultado.tagsEncontrados).length + ' jugador(es) leído(s), ' +
        resultado.correcciones.length + ' semana(s) con Ataques+Fame+Barcos vía Log.');
    }

    estado.logIndiceClan++;
    guardarEstado(estado);
    setTimeout(function () { irAlSiguienteClanLog(estado); }, PAUSA_ENTRE_CLANES_MS);
  }

  function irAlSiguienteClanLog(estado) {
    if (estado.estado !== 'corriendo') { pintarPanel(); return; }
    if (_pausaPendiente(estado, guardarEstado, log)) return;
    var siguienteTag = estado.clanTagsTerna[estado.logIndiceClan];
    if (!siguienteTag) { cerrarFaseLog(estado); return; }
    _esperarHistorialEnVuelo(estado, function () { location.href = construirUrlLog(siguienteTag); });
  }

  // =========================================================================
  // MÉTODO RIVER RACE — SEMANA EN CURSO (NUEVO, Sección 2.4/3.1 del consolidado)
  // Utilidades de lectura confirmadas contra el DOM real de
  // https://royaleapi.com/clan/{tag}/war/race (20/21-ago-2026). Reutiliza el
  // mismo patrón de parseo que Log — RoyaleAPI usa las mismas clases
  // `value_bg decks_used/boat_attacks/fame`, más una cuarta,
  // `value_bg decks_used_today` (delta diario, NO se usa para el histórico —
  // Sección 2.4: solo se guardan los 3 acumulados).
  //
  // ENGANCHADO como fase 0 (`estado.fase === 'riverrace'`), la PRIMERA que
  // corre (antes que Analytics) cuando hay datos válidos. `temporadaRoyaleApi`
  // /`semana` de la semana en curso NO salen de esta página (no los expone en
  // su DOM, a diferencia de Analytics/Log) — el backend los calcula en
  // tiempo real vía _getCtx() (mismo cálculo que alimenta Extra!A2/B2) y los
  // manda ya listos en `data.temporadaRoyaleApiActual`/`data.semanaActual`
  // (ver `_obtenerListaCorreccionGuerra()`, Base.md). Si vienen null (backend
  // marcó el periodIndex como sospechoso, o versión vieja sin este campo),
  // la fase se salta entera y se arranca directo en 'analytics' — el resto
  // del flujo no depende de esto.
  // =========================================================================

  function construirUrlRiverRace(tagClan) {
    return 'https://royaleapi.com/clan/' + String(tagClan).replace('#', '') + '/war/race';
  }

  /**
   * buscarTablaRiverRace()
   * Confirmado contra el DOM real: hay una sola tabla de participantes por
   * página (a diferencia de Log, que tiene una por semana), con clase
   * `cw2_participant_flex_table sortable_participant`. No hace falta ningún
   * mecanismo de "cargar más" (es una sola semana, la que está en curso).
   */
  function buscarTablaRiverRace() {
    return document.querySelector('table.cw2_participant_flex_table.sortable_participant');
  }

  /**
   * parsearParticipantesRiverRace(temporadaRoyaleApi, semana)
   * Mismo patrón exacto que parsearParticipantesLog() (mismas clases
   * `.value_bg.decks_used/.boat_attacks/.fame`, mismo regex de tag), pero:
   *   - Una sola tabla, no una por semana (no hay `semanaAsociada` que
   *     resolver por posición en el documento).
   *   - Recibe `temporadaRoyaleApi`/`semana` como parámetros porque esta
   *     página no los expone en el DOM (ver nota del bloque) — quien llame
   *     a esta función es responsable de proveerlos ya resueltos.
   *   - Cada registro sale con `fuente: 'riverrace'`, `cerrada: false`
   *     (Sección 3.1: "mientras la semana esté en curso, el registro se
   *     marca... cerrada: false").
   *   - Se ignora `decks_used_today` (delta diario) a propósito.
   *   - `not_current_member` (clase de la fila) es informativo nada más —
   *     no se usa para filtrar: un jugador que dejó el clan a mitad de
   *     semana igual tiene un acumulado válido de esa semana en curso.
   */
  function parsearParticipantesRiverRace(temporadaRoyaleApi, semana, clanActual) {
    var registros = [];
    var tagsEncontrados = {};
    var tabla = buscarTablaRiverRace();
    if (!tabla) return { registros: registros, tagsEncontrados: tagsEncontrados };

    var filas = tabla.querySelectorAll('tbody tr');
    for (var f = 0; f < filas.length; f++) {
      var fila = filas[f];
      var link = fila.querySelector('a[href*="/player/"]');
      if (!link) continue; // sin link al perfil: sin tag confiable, se descarta la fila
      var m = (link.getAttribute('href') || '').match(/\/player\/([A-Z0-9]+)/i);
      if (!m) continue;
      var tag = '#' + m[1].toUpperCase();

      var elAtaques = fila.querySelector('.value_bg.decks_used');
      var elBarcos = fila.querySelector('.value_bg.boat_attacks');
      var elFame = fila.querySelector('.value_bg.fame');
      if (!elAtaques || !elFame) continue;

      var ataques = parseInt((elAtaques.textContent || '').trim(), 10);
      var fame = parseInt((elFame.textContent || '').trim(), 10);
      if (isNaN(ataques) || isNaN(fame)) continue;
      var barcosTxt = elBarcos ? (elBarcos.textContent || '').trim() : '';
      var barcos = barcosTxt === '' ? null : parseInt(barcosTxt, 10);
      if (barcos !== null && isNaN(barcos)) barcos = null;

      registros.push({
        tag: tag,
        temporadaRoyaleApi: temporadaRoyaleApi,
        semana: semana,
        clan: clanActual,
        ataques: ataques,
        fame: fame,
        barcos: barcos,
        fuente: 'riverrace',
        cerrada: false
      });
      tagsEncontrados[tag] = true;
    }
    return { registros: registros, tagsEncontrados: tagsEncontrados };
  }

  /**
   * procesarClanRiverRaceActual(estado)
   * Análoga a procesarClanAnalyticsActual(), pero más simple: una sola tabla,
   * sin toggle de "miembros actuales" ni pausas de re-render. Alimenta
   * DIRECTO el acumulador de histórico (_agregarRegistroHistorial) — River
   * Race no existe como concepto en Correcciones_Guerra.csv, así que no hay
   * un `estado.riverraceCorrecciones` paralelo que enviar por ese canal.
   */
  async function procesarClanRiverRaceActual(estado) {
    var tagClan = estado.clanTagsTerna[estado.riverraceIndiceClan];
    if (!tagClan) { avanzarAFaseLogPrincipal(estado); return; }

    log(estado, '[River Race] Clan ' + (estado.riverraceIndiceClan + 1) + '/' + estado.clanTagsTerna.length + ': ' + tagClan);

    var tabla = await esperar(buscarTablaRiverRace, TABLE_WAIT_MS);
    if (!tabla) {
      log(estado, '  ⚠ No cargó la tabla de River Race para ' + tagClan + ' a tiempo. Se salta este clan (la semana en curso de sus jugadores queda sin dato provisional hasta la próxima corrida).');
      estado.riverraceTotalClanesError++;
      estado.riverraceIndiceClan++;
      guardarEstado(estado);
      setTimeout(function () { irAlSiguienteClanRiverRace(estado); }, PAUSA_ENTRE_CLANES_MS);
      return;
    }

    var clanNombreRiverRace = estado.clanesTerna[estado.riverraceIndiceClan] || tagClan;
    var resultadoRR = parsearParticipantesRiverRace(estado.temporadaRoyaleApiActual, estado.semanaActual, clanNombreRiverRace);
    for (var rrHist = 0; rrHist < resultadoRR.registros.length; rrHist++) {
      var regRR = resultadoRR.registros[rrHist];
      var jInfoRR = estado.jugadorPorTag[regRR.tag];
      _agregarRegistroHistorial(estado, regRR.tag, jInfoRR ? jInfoRR.nombre : '', regRR.clan, regRR);
    }
    _flushHistorialSiHaceFalta(estado, false);

    estado.riverraceTotalClanesOk++;
    log(estado, '  ✔ ' + Object.keys(resultadoRR.tagsEncontrados).length + ' jugador(es) leído(s) — semana en curso (Temporada ' +
      estado.temporadaRoyaleApiActual + ', Semana ' + estado.semanaActual + '), provisional.');

    estado.riverraceIndiceClan++;
    guardarEstado(estado);
    setTimeout(function () { irAlSiguienteClanRiverRace(estado); }, PAUSA_ENTRE_CLANES_MS);
  }

  function irAlSiguienteClanRiverRace(estado) {
    if (estado.estado !== 'corriendo') { pintarPanel(); return; }
    if (_pausaPendiente(estado, guardarEstado, log)) return;
    var siguienteTag = estado.clanTagsTerna[estado.riverraceIndiceClan];
    if (!siguienteTag) { avanzarAFaseLogPrincipal(estado); return; }
    _esperarHistorialEnVuelo(estado, function () { location.href = construirUrlRiverRace(siguienteTag); });
  }

  /**
   * avanzarAFaseLogPrincipal(estado)
   * v2.9: cierra la fase 'riverrace' (fuerza el flush de lo que haya quedado
   * acumulado, aunque no llegue al umbral por lote) y arranca 'log', la
   * fuente principal. Antes (v2.8 y anteriores) esta función se llamaba
   * avanzarAFaseAnalytics() y arrancaba Analytics.
   */
  function avanzarAFaseLogPrincipal(estado) {
    if (estado.estado !== 'corriendo') { pintarPanel(); return; }
    estado.fase = 'log';
    estado.logIndiceClan = 0;
    log(estado, '[River Race] Fase terminada: ' + estado.riverraceTotalClanesOk + ' clan(es) OK, ' +
      estado.riverraceTotalClanesError + ' con error. Sigue el Log (' +
      estado.clanTagsTerna.length + ' clan(es)); Analytics solo si algún Log falla.');
    _flushHistorialSiHaceFalta(estado, true);
    guardarEstado(estado);
    irAlSiguienteClanLog(estado);
  }

  /**

   * procesarClanAnalyticsActual(estado)
   * Un paso de la fase 'analytics': si la página actual no es la de
   * Analytics del clan esperado, navega ahí; si ya está ahí, espera las dos
   * tablas, se asegura de que el toggle esté apagado, parsea y acumula, y
   * avanza al siguiente clan (o pasa a la fase 'perfiles' si ya se
   * recorrieron los 4).
   */
  async function procesarClanAnalyticsActual(estado) {
    var tagClan = estado.clanTagsTerna[estado.analyticsIndiceClan];
    if (!tagClan) { avanzarAFasePerfiles(estado); return; }

    log(estado, '[Analytics] Clan ' + (estado.analyticsIndiceClan + 1) + '/' + estado.clanTagsTerna.length + ': ' + tagClan);

    var tablas = await esperar(buscarTablasAnalytics, ANALYTICS_TABLE_WAIT_MS);
    if (!tablas) {
      log(estado, '  ⚠ No cargaron las tablas de Analytics para ' + tagClan + ' a tiempo. Se salta este clan (sus jugadores se cubrirán por el método de perfil).');
      estado.analyticsTotalClanesError++;
      estado.analyticsIndiceClan++;
      guardarEstado(estado);
      setTimeout(function () { irAlSiguienteClanAnalytics(estado); }, PAUSA_ENTRE_CLANES_MS);
      return;
    }

    asegurarToggleMiembrosActualesApagado();
    // El toggle es client-side e instantáneo (confirmado por el usuario) —
    // igual se da un respiro corto por si la tabla se re-renderiza.
    await new Promise(function (resolve) { setTimeout(resolve, 300); });
    // Se releen las tablas por si el toggle disparó un re-render (nuevas
    // instancias de <table> en el DOM).
    tablas = buscarTablasAnalytics() || tablas;

    var mapaFame = parsearTablaAnalytics(tablas.fame);
    var mapaAtaques = parsearTablaAnalytics(tablas.ataques);
    var combinado = combinarFameYAtaques(mapaFame, mapaAtaques);
    // v3.0: cada fila lleva el clanTag del clan cuyo Analytics se está leyendo.
    for (var ctA = 0; ctA < combinado.correcciones.length; ctA++) combinado.correcciones[ctA].clanTag = tagClan;

    estado.analyticsCorrecciones = estado.analyticsCorrecciones.concat(combinado.correcciones);
    _registrarSemanasCubiertas(estado, combinado.correcciones);
    // PUNTO 2 — traduce lo ya parseado a "registro" del histórico. Analytics
    // no trae Barcos (Sección 2.1 del consolidado) → barcos: null. `clan` se
    // toma del nombre del clan que se está visitando (misma posición de
    // índice que clanTagsTerna — confirmado: CFG.TERNA_TAGS y
    // _getNombresClanesTernaOrdenados() van en el mismo orden, ver
    // 03_Config.gs/comentario en Base.md).
    var clanNombreAnalytics = estado.clanesTerna[estado.analyticsIndiceClan] || tagClan;
    for (var ciHist = 0; ciHist < combinado.correcciones.length; ciHist++) {
      var corrA = combinado.correcciones[ciHist];
      var jInfoA = estado.jugadorPorTag[corrA.tag];
      _agregarRegistroHistorial(estado, corrA.tag, jInfoA ? jInfoA.nombre : '', clanNombreAnalytics, {
        temporadaRoyaleApi: corrA.temporadaRoyaleApi,
        semana: corrA.semana,
        clan: clanNombreAnalytics,
        ataques: corrA.ataquesSemana,
        fame: corrA.fame,
        barcos: null,
        fuente: 'analytics',
        cerrada: true
      });
    }
    _flushHistorialSiHaceFalta(estado, false);
    for (var tagEnc in combinado.tagsEncontrados) {
      if (estado.analyticsTagsEncontrados.indexOf(tagEnc) === -1) estado.analyticsTagsEncontrados.push(tagEnc);
    }
    estado.analyticsTotalClanesOk++;
    log(estado, '  ✔ ' + Object.keys(combinado.tagsEncontrados).length + ' jugador(es) leído(s), ' +
      combinado.correcciones.length + ' semana(s) con Ataques+Fame completos.');

    estado.analyticsIndiceClan++;
    guardarEstado(estado);
    setTimeout(function () { irAlSiguienteClanAnalytics(estado); }, PAUSA_ENTRE_CLANES_MS);
  }

  function irAlSiguienteClanAnalytics(estado) {
    if (estado.estado !== 'corriendo') { pintarPanel(); return; }
    if (_pausaPendiente(estado, guardarEstado, log)) return;
    _saltarClanesConLogOk(estado); // v2.9: Analytics es solo respaldo de los clanes sin Log
    var siguienteTag = estado.clanTagsTerna[estado.analyticsIndiceClan];
    if (!siguienteTag) { avanzarAFasePerfiles(estado); return; }
    _esperarHistorialEnVuelo(estado, function () { location.href = construirUrlAnalytics(siguienteTag); });
  }

  /**
   * cerrarFaseLog(estado)
   * v2.9: cierra la fase 'log'. Si el Log de TODOS los clanes entregó filas,
   * Analytics se salta por completo y se pasa a 'perfiles'. Si el de alguno
   * falló, corre 'analytics' solo para esos clanes (_saltarClanesConLogOk()).
   * El envío al backend ya no ocurre aquí sino en avanzarAFasePerfiles(), para
   * consolidar en UN solo lote las filas de Log y de Analytics.
   */
  function cerrarFaseLog(estado) {
    var ok = estado.logClanesOk || [];
    var sinLog = estado.clanTagsTerna.filter(function (t) { return ok.indexOf(t) === -1; });
    log(estado, '[Log] Fase terminada: ' + estado.logTotalClanesOk + ' clan(es) OK, ' +
      estado.logTotalClanesError + ' con error. ' + (estado.logTagsEncontrados || []).length +
      ' jugador(es) cubiertos por Log.');
    _flushHistorialSiHaceFalta(estado, true);
    if (sinLog.length === 0) {
      guardarEstado(estado);
      avanzarAFasePerfiles(estado);
      return;
    }
    estado.fase = 'analytics';
    estado.analyticsIndiceClan = 0;
    log(estado, '[Analytics] Respaldo para ' + sinLog.length + ' clan(es) sin datos de Log: ' + sinLog.join(', ') + '.');
    guardarEstado(estado);
    irAlSiguienteClanAnalytics(estado);
  }

  /**
   * avanzarAFasePerfiles(estado)
   * Cierra 'log' (o el respaldo 'analytics'): consolida y envía en un solo lote
   * las correcciones acumuladas de Log y Analytics (_prepararCorreccionesPorClan()),
   * recorta `jugadores` a SOLO los que no aparecieron ni en Log ni en Analytics, y
   * arranca (o salta) la fase 'perfiles' — respaldo final, sin cambios en su
   * propio funcionamiento interno salvo que ya no reenvía semanas de esta corrida.
   */
  function avanzarAFasePerfiles(estado) {
    estado.fase = 'perfiles';

    var cubiertos = (estado.analyticsTagsEncontrados || []).concat(estado.logTagsEncontrados || []);
    var pendientesTotal = estado.modoBackfill
      ? estado.jugadoresOriginal.slice() // PUNTO 3: backfill visita el perfil de TODOS, cubiertos o no (Sección 4: "Perfil de cada miembro activo actual")
      : estado.jugadoresOriginal.filter(function (j) { return cubiertos.indexOf(j.tag) === -1; });
    estado.jugadores = pendientesTotal;
    estado.indice = 0;

    log(estado, '[Perfiles] ' + (estado.logTagsEncontrados || []).length + ' jugador(es) cubiertos por Log y ' +
      (estado.analyticsTagsEncontrados || []).length + ' por Analytics. ' + pendientesTotal.length + ' jugador(es) pasan a Perfil' +
      (estado.modoBackfill ? ' (modo BACKFILL: se visita a TODOS, no solo a los no cubiertos).' : ' (solo los que ni Log ni Analytics cubrieron).'));
    _flushHistorialSiHaceFalta(estado, true);
    guardarEstado(estado);

    function continuarConPerfiles() {
      if (pendientesTotal.length === 0) {
        log(estado, '[Perfiles] No hay jugadores pendientes — se salta esta fase por completo.');
        terminar(estado);
        return;
      }
      irAlSiguientePerfil(estado);
    }

    var pendientesEnvio = (estado.logCorrecciones || []).concat(estado.analyticsCorrecciones || []);
    if (pendientesEnvio.length > 0) {
      estado.logCorrecciones = [];
      estado.analyticsCorrecciones = [];
      var loteLog = _prepararCorreccionesPorClan(pendientesEnvio, estado);
      guardarEstado(estado);
      if (loteLog.length === 0) { continuarConPerfiles(); return; }
      enviarCorrecciones(loteLog, function (err, resp) {
        if (err) {
          // FIX (21-sep-2026): el lote no se descarta; vuelve a la cola y se reenvía con el próximo envío.
          estado.correcciones = loteLog.concat(estado.correcciones);
          log(estado, '⚠ ' + err + ' (el lote de Log/Analytics NO se pudo enviar: queda en cola y se reenvía con el próximo lote).');
        } else {
          estado.totalAplicadas += (resp.aplicadas || 0);
          log(estado, '  ✔ Backend actualizado con Log/Analytics: ' + resp.aplicadas + ' corrección(es) (total: ' + estado.totalAplicadas + ').');
          if (resp.revisarManual && resp.revisarManual.length) {
            for (var rmI = 0; rmI < resp.revisarManual.length; rmI++) log(estado, '  ⚠ REVISAR A MANO (backend): ' + resp.revisarManual[rmI]);
          }
        }
        guardarEstado(estado);
        continuarConPerfiles();
      });
    } else {
      continuarConPerfiles();
    }
  }

  // =========================================================================
  // FLUJO PRINCIPAL — CORRECCIÓN DE GUERRA (SIN CAMBIOS)
  // =========================================================================
  async function procesarJugadorActual(estado) {
    var jugador = estado.jugadores[estado.indice];
    if (!jugador) { await terminar(estado); return; }

    log(estado, 'Procesando ' + (estado.indice + 1) + '/' + estado.jugadores.length + ': ' + jugador.nombre + ' (' + jugador.tag + ')');

    var boton = await esperar(buscarBotonClanWars2, CLOUDFLARE_WAIT_MS);
    if (!boton) {
      log(estado, '⚠ No apareció el botón "Clan Wars 2 History" a tiempo. Reintentando esta página...');
      estado.intentosPaginaActual = (estado.intentosPaginaActual || 0) + 1;
      guardarEstado(estado);
      if (estado.intentosPaginaActual >= 3) {
        log(estado, '⛔ 3 intentos fallidos con ' + jugador.tag + '. Se salta este jugador.');
        estado.intentosPaginaActual = 0;
        estado.indice++;
        guardarEstado(estado);
        setTimeout(function () { irAlSiguientePerfil(estado); }, PAUSA_ENTRE_JUGADORES_MS);
        return;
      }
      location.reload();
      return;
    }
    estado.intentosPaginaActual = 0;

    boton.click();
    var tabla = await esperar(buscarTablaClanWars2, TABLE_WAIT_MS);
    if (!tabla) {
      log(estado, '⚠ La tabla de Clan Wars 2 History no cargó para ' + jugador.tag + '. Se salta este jugador.');
      estado.indice++;
      guardarEstado(estado);
      setTimeout(function () { irAlSiguientePerfil(estado); }, PAUSA_ENTRE_JUGADORES_MS);
      return;
    }

    var filas = leerFilasClanWars2(tabla, estado.clanesTerna);
    // PUNTO 2 — a diferencia de Analytics/Log, acá `clan` viene POR FILA
    // (leerFilasClanWars2() ya lo trae, es la única de las tres fuentes que
    // indica con certeza en qué clan estuvo el jugador esa semana puntual —
    // Sección 2.3 del consolidado). Se registran TODAS las filas leídas acá
    // (no solo `nuevasOActualizadas`): coberturaPorTag solo evita reenvíos a
    // Correcciones_Guerra.csv, es un concepto distinto de la cobertura del
    // histórico.
    for (var pfHist = 0; pfHist < filas.length; pfHist++) {
      _agregarRegistroHistorial(estado, jugador.tag, jugador.nombre, filas[pfHist].clan, {
        temporadaRoyaleApi: filas[pfHist].temporadaRoyaleApi,
        semana: filas[pfHist].semana,
        clan: filas[pfHist].clan,
        ataques: filas[pfHist].ataquesSemana,
        fame: filas[pfHist].fame,
        barcos: (filas[pfHist].barcos === undefined ? null : filas[pfHist].barcos),
        fuente: 'perfil',
        cerrada: true
      });
    }
    _flushHistorialSiHaceFalta(estado, false);
    // FIX (patch fase Log): antes de reenviar una semana leída del perfil,
    // se descarta si esa semana (tag + temporada-semana) ya está guardada
    // en Correcciones_Guerra.csv según coberturaPorTag (viene del backend
    // en listaCorreccionGuerra) — evita reenvíos innecesarios al backend
    // para semanas que ya llegaron por Analytics/Log en corridas previas.
    var coberturaJugador = (estado.coberturaPorTag && estado.coberturaPorTag[jugador.tag]) || [];
    // v2.9: semanas que Log/Analytics ya aportaron en ESTA corrida — el perfil no las pisa.
    var cubiertasCorrida = (estado.semanasCubiertas && estado.semanasCubiertas[jugador.tag]) || [];
    var nuevasOActualizadas = 0, yaEnCsv = 0, yaEnCorrida = 0;
    for (var i = 0; i < filas.length; i++) {
      var etiqueta = filas[i].temporadaRoyaleApi + '-' + filas[i].semana;
      if (cubiertasCorrida.indexOf(etiqueta) >= 0) { yaEnCorrida++; continue; } // ya llegó por Log/Analytics en esta corrida
      if (coberturaJugador.indexOf(etiqueta) >= 0) { yaEnCsv++; continue; } // ya está en el CSV: no se reenvía
      // FIX (15-ago-2026): se agrega barcos (undefined si esa semana no
      // trae el dato) al objeto de corrección — ver comentario en
      // leerFilasClanWars2() más arriba y en _aplicarCorreccionesGuerra(),
      // 10_CorreccionGuerra.gs (barcos es opcional/preservado, nunca se
      // manda como 0 falso).
      estado.correcciones.push({ tag: jugador.tag, temporadaRoyaleApi: filas[i].temporadaRoyaleApi, semana: filas[i].semana, ataquesSemana: filas[i].ataquesSemana, fame: filas[i].fame, barcos: filas[i].barcos });
      nuevasOActualizadas++;
    }
    log(estado, '  → ' + filas.length + ' semana(s) de clanes Terna encontradas (' +
      nuevasOActualizadas + ' nueva(s), ' + yaEnCsv + ' ya en el CSV y ' + yaEnCorrida + ' ya vinieron por Log/Analytics en esta corrida — sin reenviar).');

    estado.indice++;
    guardarEstado(estado);

    // FIX (15-ago-2026): antes se mandaba un request por cada jugador con
    // correcciones (>0). Ahora se espera a juntar LOTE_ENVIO_MIN_JUGADORES
    // antes de gastar un viaje de red — el resto pendiente al llegar al
    // último jugador lo manda terminar() igual, así que no se pierde nada.
    if (estado.correcciones.length >= LOTE_ENVIO_MIN_JUGADORES) {
      var loteAEnviar = estado.correcciones.slice();
      estado.correcciones = [];
      guardarEstado(estado);
      enviarCorrecciones(loteAEnviar, function (err, resp) {
        if (err) {
          log(estado, '⚠ ' + err + ' (se reintentará junto al próximo lote).');
          estado.correcciones = loteAEnviar.concat(estado.correcciones);
          guardarEstado(estado);
        } else {
          estado.totalAplicadas += (resp.aplicadas || 0);
          log(estado, '  ✔ Backend actualizado: ' + resp.aplicadas + ' corrección(es) aplicada(s) (total acumulado: ' + estado.totalAplicadas + ').');
          guardarEstado(estado);
        }
        setTimeout(function () { irAlSiguientePerfil(estado); }, PAUSA_ENTRE_JUGADORES_MS);
      });
    } else {
      setTimeout(function () { irAlSiguientePerfil(estado); }, PAUSA_ENTRE_JUGADORES_MS);
    }
  }

  function irAlSiguientePerfil(estado) {
    if (estado.estado !== 'corriendo') { pintarPanel(); return; }
    if (_pausaPendiente(estado, guardarEstado, log)) return;
    var siguiente = estado.jugadores[estado.indice];
    if (!siguiente) { terminar(estado); return; }
    _esperarHistorialEnVuelo(estado, function () { location.href = siguiente.royaleApiUrl; });
  }

  async function terminar(estado) {
    _flushHistorialSiHaceFalta(estado, true);
    // FIX (21-sep-2026): antes se declaraba "terminado" sin esperar la respuesta
    // del histórico y, si el último envío de correcciones fallaba, ese lote se
    // perdía (ya se había vaciado la cola). Ahora se espera la respuesta y, si
    // algo falla, se conserva y el proceso queda en 'pausado': al pulsar
    // Reanudar se vuelve a llamar a terminar() y se reintenta.
    _esperarHistorialEnVuelo(estado, function () {
      if (estado.historialTotalRegistros > 0) {
        estado.estado = 'pausado';
        log(estado, '⚠ Quedan ' + estado.historialTotalRegistros + ' registro(s) de histórico sin confirmar en el backend. ' +
          'Corrige el problema (token/URL) y pulsa Reanudar para reenviarlos.');
        guardarEstado(estado);
        pintarPanel();
        return;
      }
      if (estado.correcciones.length > 0) {
        var pendientes = estado.correcciones.slice();
        estado.correcciones = [];
        guardarEstado(estado);
        enviarCorrecciones(pendientes, function (err, resp) {
          if (err) {
            estado.correcciones = pendientes.concat(estado.correcciones);
            estado.estado = 'pausado';
            log(estado, '⚠ ' + err + ' — quedan ' + pendientes.length + ' correcciones sin enviar. ' +
              'Corrige el problema y pulsa Reanudar para reintentar.');
            guardarEstado(estado);
            pintarPanel();
            return;
          }
          estado.totalAplicadas += (resp.aplicadas || 0);
          estado.estado = 'terminado';
          log(estado, '✔ Último lote enviado (' + (resp.aplicadas || 0) + ' correcciones).');
          log(estado, '✅ Corrección terminada. Total de correcciones aplicadas: ' + estado.totalAplicadas + '.');
          guardarEstado(estado);
          // FIX (15-ago-2026, bug: el panel se quedaba en "Corriendo" para
          // siempre al terminar): log() repinta leyendo el estado YA guardado,
          // así que hace falta un repintado explícito DESPUÉS de guardar.
          pintarPanel();
        });
      } else {
        estado.estado = 'terminado';
        log(estado, '✅ Corrección terminada. Total de correcciones aplicadas: ' + estado.totalAplicadas + '.');
        guardarEstado(estado);
        pintarPanel(); // mismo motivo que el FIX de arriba
      }
    });
  }

  // =========================================================================
  // FLUJO PRINCIPAL — MIEMBROS NUEVOS (NUEVO)
  // =========================================================================
  async function procesarCandidatoActual(estado) {
    var candidato = estado.candidatos[estado.indice];
    if (!candidato) { await terminarNuevos(estado); return; }

    logNuevos(estado, 'Revisando ' + (estado.indice + 1) + '/' + estado.candidatos.length + ': ' + candidato.nombre + ' (' + candidato.tag + ')');

    var boton = await esperar(buscarBotonClanWars2, CLOUDFLARE_WAIT_MS);
    if (!boton) {
      logNuevos(estado, '⚠ No apareció el botón "Clan Wars 2 History" a tiempo. Reintentando esta página...');
      estado.intentosPaginaActual = (estado.intentosPaginaActual || 0) + 1;
      guardarEstadoNuevos(estado);
      if (estado.intentosPaginaActual >= 3) {
        logNuevos(estado, '⛔ 3 intentos fallidos con ' + candidato.tag + '. Se salta.');
        estado.intentosPaginaActual = 0;
        estado.indice++;
        guardarEstadoNuevos(estado);
        setTimeout(function () { irAlSiguienteCandidato(estado); }, PAUSA_ENTRE_JUGADORES_MS);
        return;
      }
      location.reload();
      return;
    }
    estado.intentosPaginaActual = 0;

    boton.click();
    var tabla = await esperar(buscarTablaClanWars2, TABLE_WAIT_MS);
    if (!tabla) {
      logNuevos(estado, '⚠ La tabla de historial no cargó para ' + candidato.tag + '. Se salta.');
      estado.indice++;
      guardarEstadoNuevos(estado);
      setTimeout(function () { irAlSiguienteCandidato(estado); }, PAUSA_ENTRE_JUGADORES_MS);
      return;
    }

    var historial = leerHistorialCompleto(tabla); // más reciente primero

    // FIX (27-ago-2026, punto 3.1 del Consolidado_Cambios_Pendientes_Guerra.md):
    // antes de enviar, se descarta cualquier registro cuya semana (etiqueta
    // "134-4", ver leerHistorialCompleto() más arriba) ya esté guardada en
    // Guerra/Backup_Guerra.csv según coberturaPorTag — mismo campo/mismo
    // patrón que ya usa la fase 'perfiles' de Corrección de Guerra (ver más
    // arriba en este archivo). Evita reenviar al backend semanas que el
    // punto 3 (_migrarNuevosAHistorico()) o el punto 4
    // (_cerrarSemanaActualNuevos()) ya migraron al histórico real.
    // IMPORTANTE: a diferencia de `registros` (filtrado, ver abajo),
    // `ultima`/`penultima`/`antepenultima` siguen leyendo de `historial` SIN
    // filtrar -- decidir si el candidato sigue contando como "nuevo"
    // necesita las últimas 3 semanas REALES, no las que faltan enviar al
    // backend (son dos preguntas distintas, se mantienen separadas a
    // propósito).
    var coberturaJugador = (estado.coberturaPorTag && estado.coberturaPorTag[candidato.tag]) || [];
    var historialAEnviar = [];
    var yaEnHistorico = 0;
    for (var hFilt = 0; hFilt < historial.length; hFilt++) {
      var etiquetaHist = historial[hFilt].temporada;
      if (etiquetaHist && coberturaJugador.indexOf(etiquetaHist) >= 0) { yaEnHistorico++; continue; }
      historialAEnviar.push(historial[hFilt]);
    }

    // FIX (06-ago-2026): antes se recortaba a las 5 filas más recientes
    // ANTES de enviar ("historial.slice(0, 5)"), así que si la hoja
    // "Nuevos" ya tenía más de 5 columnas de fecha (ver
    // _asegurarBloquesParaFechas(), 20_Nuevos_RoyaleAPI.gs), las columnas
    // más antiguas de un jugador nunca podían completarse — jamás se
    // mandaba suficiente historial para llegar hasta ellas. Ahora se manda
    // TODO el historial que la tabla trae cargado (sin recorte artificial,
    // salvo el filtro de coberturaPorTag de arriba); el backend alinea cada
    // registro por su fecha real contra las columnas que existan, sean 5 o
    // 20, y descarta en silencio cualquier fecha que no tenga columna.
    // REGISTROS_MAX_ENVIO es solo un tope de seguridad — no debería
    // alcanzarse nunca en la práctica, ya que RoyaleAPI no muestra tantas
    // filas en esta tabla.
    var REGISTROS_MAX_ENVIO = 60;
    var registros = historialAEnviar.slice(0, REGISTROS_MAX_ENVIO);

    var ultima = historial[0], penultima = historial[1], antepenultima = historial[2];

    // FIX (06-ago-2026): el requisito pasa de "última y/o penúltima semana"
    // a "últimas 3 semanas" — pedido explícito del usuario.
    var esNuevo =
      (ultima         && !esClanTerna(ultima.clan, estado.clanesTerna)) ||
      (penultima      && !esClanTerna(penultima.clan, estado.clanesTerna)) ||
      (antepenultima  && !esClanTerna(antepenultima.clan, estado.clanesTerna));

    // FIX (06-ago-2026): antes solo se mandaban datos cuando esNuevo=true,
    // así que un candidato que YA tiene fila en Nuevos (candidato.yaEnNuevos,
    // ver _obtenerListaCandidatosNuevos() en 20_Nuevos_RoyaleAPI.gs) dejaba
    // de recibir actualizaciones en cuanto pasaban unas semanas y ya no
    // calificaba como "nuevo" — su cuadrícula quedaba congelada para
    // siempre. Ahora se manda igual si ya está trackeado.
    if (esNuevo || candidato.yaEnNuevos) {
      estado.pendientesEnvio.push({ tag: candidato.tag, registros: registros });
      estado.totalNuevosDetectados++;
      logNuevos(estado, '  🆕 ' + candidato.nombre + ' cuenta como NUEVO (última: ' +
        (ultima ? ultima.clan : '—') +
        (penultima ? ', penúltima: ' + penultima.clan : '') +
        (antepenultima ? ', antepenúltima: ' + antepenultima.clan : '') + '). ' +
        registros.length + ' registro(s) en cola para enviar' +
        (yaEnHistorico ? ' (' + yaEnHistorico + ' ya en el histórico — sin reenviar)' : '') + '.');
    } else {
      logNuevos(estado, '  — No cuenta como nuevo (últimas 3 semanas ya son de un clan Terna).');
    }

    estado.indice++;
    guardarEstadoNuevos(estado);

    // FIX (15-ago-2026, causa principal de "se demora más de una hora...
    // para los nuevos"): antes se mandaba un request al backend por CADA
    // candidato que calificara como nuevo (o ya trackeado) — la mayoría de
    // los candidatos, en la práctica. Cada request a un Web App de Apps
    // Script suele tardar varios segundos (lee/escribe hojas, JSON y CSV de
    // Drive), y la navegación al siguiente perfil esperaba esa respuesta
    // antes de seguir — con 100-300 candidatos, eso solo ya podía sumar
    // decenas de minutos. Ahora se espera a juntar
    // LOTE_ENVIO_MIN_CANDIDATOS antes de gastar un viaje de red. El resto
    // pendiente al llegar al último candidato lo manda terminarNuevos()
    // igual, así que no se pierde nada por bajar la frecuencia de envío.
    if (estado.pendientesEnvio.length >= LOTE_ENVIO_MIN_CANDIDATOS) {
      var loteAEnviar = estado.pendientesEnvio.slice();
      estado.pendientesEnvio = [];
      guardarEstadoNuevos(estado);
      enviarNuevos(loteAEnviar, function (err, resp) {
        // FIX (06-ago-2026): antes solo se revisaba `err` (fallo de RED).
        // Un error del BACKEND (p. ej. una excepción dentro de
        // _aplicarImportacionNuevos(), 20_Nuevos_RoyaleAPI.gs) responde
        // igual con HTTP 200 y { ok:false, error:'...', code:500} —
        // GM_xmlhttpRequest lo entrega en onload SIN `err`, así que antes
        // se leía como si fuera un éxito y el lote completo se descartaba
        // en silencio, sin avisar nada (esto explica reportes de "no trae
        // ningún dato" pese a que el userscript no mostraba ningún ⚠).
        // Ahora también se revisa `resp.ok`.
        if (err || !resp || !resp.ok) {
          var motivo = err || (resp && resp.error) || 'respuesta inválida del backend';
          logNuevos(estado, '⚠ ' + motivo + ' (se reintentará junto al próximo lote).');
          estado.pendientesEnvio = loteAEnviar.concat(estado.pendientesEnvio);
          guardarEstadoNuevos(estado);
        } else {
          logNuevos(estado, '  ✔ Backend actualizado: ' + (resp.procesados || 0) + ' jugador(es) procesado(s), ' +
            (resp.filasNuevas || 0) + ' fila(s) nueva(s)' +
            (resp.filasEliminadas ? ', ' + resp.filasEliminadas + ' fila(s) borrada(s) (volvieron a la familia)' : '') + '.');
          estado.totalFilasNuevas = (estado.totalFilasNuevas || 0) + (resp.filasNuevas || 0);
          estado.totalFilasEliminadas = (estado.totalFilasEliminadas || 0) + (resp.filasEliminadas || 0);
          // FIX (06-ago-2026): errores individuales de UN candidato (ver
          // try/catch por tag en _aplicarImportacionNuevos()) ya no abortan
          // el lote entero, pero sí se reportan acá para que queden a la
          // vista en el panel en vez de perderse en el log de Apps Script.
          if (resp.errores && resp.errores.length) {
            logNuevos(estado, '  ⚠ ' + resp.errores.length + ' jugador(es) con error individual: ' +
              resp.errores.map(function (e2) { return e2.tag + ' (' + e2.error + ')'; }).join('; '));
          }
          guardarEstadoNuevos(estado);
        }
        setTimeout(function () { irAlSiguienteCandidato(estado); }, PAUSA_ENTRE_JUGADORES_MS);
      });
    } else {
      setTimeout(function () { irAlSiguienteCandidato(estado); }, PAUSA_ENTRE_JUGADORES_MS);
    }
  }

  function irAlSiguienteCandidato(estado) {
    if (estado.estado !== 'corriendo') { pintarPanel(); return; }
    if (_pausaPendiente(estado, guardarEstadoNuevos, logNuevos)) return;
    var siguiente = estado.candidatos[estado.indice];
    if (!siguiente) { terminarNuevos(estado); return; }
    location.href = siguiente.royaleApiUrl;
  }

  async function terminarNuevos(estado) {
    estado.estado = 'terminado';
    if (estado.pendientesEnvio.length > 0) {
      var pendientes = estado.pendientesEnvio.slice();
      estado.pendientesEnvio = [];
      guardarEstadoNuevos(estado);
      enviarNuevos(pendientes, function (err, resp) {
        // FIX (06-ago-2026): mismo chequeo de resp.ok que en el envío por
        // lotes normal (ver comentario en procesarCandidatoActual()).
        if (err || !resp || !resp.ok) {
          // FIX (21-sep-2026): antes este último lote se perdía si fallaba.
          // Ahora se conserva y queda 'pausado': Reanudar vuelve a llamar a
          // terminarNuevos() y lo reintenta.
          estado.pendientesEnvio = pendientes.concat(estado.pendientesEnvio);
          estado.estado = 'pausado';
          logNuevos(estado, '⚠ ' + (err || (resp && resp.error) || 'respuesta inválida del backend') +
            ' — quedan ' + pendientes.length + ' candidato(s) sin enviar. Corrige el problema y pulsa Reanudar para reintentar.');
          guardarEstadoNuevos(estado);
          pintarPanel();
          return;
        } else {
          logNuevos(estado, '✔ Último lote enviado (' + (resp.procesados || 0) + ' jugador(es), ' +
            (resp.filasNuevas || 0) + ' fila(s) nueva(s)' +
            (resp.filasEliminadas ? ', ' + resp.filasEliminadas + ' fila(s) borrada(s)' : '') + ').');
          estado.totalFilasNuevas = (estado.totalFilasNuevas || 0) + (resp.filasNuevas || 0);
          estado.totalFilasEliminadas = (estado.totalFilasEliminadas || 0) + (resp.filasEliminadas || 0);
        }
        // FIX (15-ago-2026, pedido usuario: "detectó 23 pero en Sheets solo
        // aparecen 9 filas"): totalNuevosDetectados cuenta CUALQUIER
        // candidato enviado este run (nuevos Y también los que ya tenían
        // fila y solo se les refrescó el dato — ver comentario en
        // procesarCandidatoActual()), así que NO equivale a "filas nuevas
        // en la hoja". Se agrega totalFilasNuevas (suma real de
        // resp.filasNuevas que manda el backend en cada lote) para que el
        // resumen final no confunda "procesados" con "agregados".
        logNuevos(estado, '✅ Búsqueda de nuevos terminada. Candidatos procesados: ' + estado.totalNuevosDetectados +
          ' (filas nuevas en la hoja: ' + estado.totalFilasNuevas +
          (estado.totalFilasEliminadas ? ', filas borradas: ' + estado.totalFilasEliminadas : '') + ').');
        guardarEstadoNuevos(estado);
        pintarPanel(); // FIX (15-ago-2026) — mismo motivo que en terminar()
      });
    } else {
      logNuevos(estado, '✅ Búsqueda de nuevos terminada. Candidatos procesados: ' + estado.totalNuevosDetectados +
        ' (filas nuevas en la hoja: ' + estado.totalFilasNuevas +
        (estado.totalFilasEliminadas ? ', filas borradas: ' + estado.totalFilasEliminadas : '') + ').');
      guardarEstadoNuevos(estado);
      pintarPanel(); // FIX (15-ago-2026) — mismo motivo que en terminar()
    }
  }

  // =========================================================================
  // VERIFICAR SEMANA EN CURSO (fase `race`, NUEVO) — lectura de /war/race
  // =========================================================================
  // Mismo patrón de recorrido "clan por clan" que Analytics/Log/riverrace
  // (Consolidado_Verificar_Semana_Race.md, Sección 6), pero MÁS SIMPLE:
  // - Sin paginación (P4 del consolidado, confirmado 21-ago-2026: /war/race
  //   no tiene botón "cargar más", la tabla se ve completa de entrada).
  // - Misma tabla que ya usa la fase 'riverrace' (arriba, cg_estado_v3) --
  //   MISMA página, pero un flujo TOTALMENTE independiente: éste nunca
  //   manda nada a historialGuerra, y a diferencia de 'riverrace' sí
  //   necesita `decks_used_today` (que 'riverrace' ignora a propósito, ver
  //   su comentario). Se clona la función de parseo en vez de reusarla para
  //   que este flujo no dependa del código de la feature hermana (Sección 2
  //   del consolidado: "no se mezcla con ellos").
  // - Sin lote intermedio: los ~100 jugadores de las 4 páginas se acumulan
  //   en memoria y se mandan en un solo request al terminar (Sección 7 del
  //   consolidado: el backend espera "las 4 páginas ya aplanadas en un solo
  //   array").
  // =========================================================================

  function construirUrlRace(tagClan) {
    return 'https://royaleapi.com/clan/' + String(tagClan).replace('#', '') + '/war/race';
  }

  /**
   * buscarTablaRace()
   * Misma tabla que ya usa buscarTablaRiverRace() (misma página, DOM ya
   * confirmado): table.cw2_participant_flex_table.sortable_participant.
   */
  function buscarTablaRace() {
    return document.querySelector('table.cw2_participant_flex_table.sortable_participant');
  }

  /**
   * parsearParticipantesRace(estado, clanActual)
   * Lee `decks_used_today` (el delta diario, que 'riverrace' ignora a
   * propósito) en vez de `decks_used` (acumulado semanal de ataques, que
   * este flujo no necesita -- Sección 3 del consolidado: ataquesHoy =
   * decksHoy viene directo de acá, sin restar nada). `fame`/`boat_attacks`
   * sí son los acumulados de la semana (fameSemana/barcosSemana), tal como
   * los necesita _procesarVerificacionRiverRace() del backend para poder
   * restarles lo ya registrado en Guerra.
   * Devuelve { registros, tagsEncontrados } -- cada registro ya en la forma
   * exacta que espera el backend: {tag, nombre, clan, decksHoy, fameSemana,
   * barcosSemana}.
   */
  function parsearParticipantesRace(estado, clanActual) {
    var registros = [];
    var tagsEncontrados = {};
    var tabla = buscarTablaRace();
    if (!tabla) return { registros: registros, tagsEncontrados: tagsEncontrados };

    var filas = tabla.querySelectorAll('tbody tr');
    for (var f = 0; f < filas.length; f++) {
      var fila = filas[f];
      var link = fila.querySelector('a[href*="/player/"]');
      if (!link) continue; // sin link al perfil: sin tag confiable, se descarta la fila
      var m = (link.getAttribute('href') || '').match(/\/player\/([A-Z0-9]+)/i);
      if (!m) continue;
      var tag = '#' + m[1].toUpperCase();

      var elHoy = fila.querySelector('.value_bg.decks_used_today');
      var elFame = fila.querySelector('.value_bg.fame');
      var elBarcos = fila.querySelector('.value_bg.boat_attacks');
      if (!elHoy || !elFame) continue; // sin ataques de hoy o sin fame: fila incompleta, se descarta

      var decksHoy = parseInt((elHoy.textContent || '').trim(), 10);
      var fameSemana = parseInt((elFame.textContent || '').trim(), 10);
      if (isNaN(decksHoy) || isNaN(fameSemana)) continue;
      var barcosTxt = elBarcos ? (elBarcos.textContent || '').trim() : '';
      var barcosSemana = barcosTxt === '' ? 0 : parseInt(barcosTxt, 10);
      if (isNaN(barcosSemana)) barcosSemana = 0;

      var jInfo = estado.jugadorPorTag[tag];
      registros.push({
        tag: tag,
        nombre: jInfo ? jInfo.nombre : '',
        clan: clanActual,
        decksHoy: decksHoy,
        fameSemana: fameSemana,
        barcosSemana: barcosSemana
      });
      tagsEncontrados[tag] = true;
    }
    return { registros: registros, tagsEncontrados: tagsEncontrados };
  }

  /**
   * procesarClanRaceActual(estado)
   * Un paso del recorrido: espera la tabla, parsea, acumula en
   * estado.participantesAcumulados (SIN enviar todavía -- se manda todo
   * junto al terminar, ver terminarRace()) y avanza al siguiente clan.
   */
  async function procesarClanRaceActual(estado) {
    var tagClan = estado.clanTagsTerna[estado.raceIndiceClan];
    if (!tagClan) { terminarRace(estado); return; }

    logRace(estado, 'Clan ' + (estado.raceIndiceClan + 1) + '/' + estado.clanTagsTerna.length + ': ' + tagClan);

    var tabla = await esperar(buscarTablaRace, TABLE_WAIT_MS);
    if (!tabla) {
      logRace(estado, '  ⚠ No cargó la tabla de River Race para ' + tagClan + ' a tiempo. Se salta este clan.');
      estado.raceTotalClanesError++;
      estado.raceIndiceClan++;
      guardarEstadoRace(estado);
      setTimeout(function () { irAlSiguienteClanRace(estado); }, PAUSA_ENTRE_CLANES_MS);
      return;
    }

    var clanNombreRace = estado.clanesTerna[estado.raceIndiceClan] || tagClan;
    var resultado = parsearParticipantesRace(estado, clanNombreRace);
    estado.participantesAcumulados = estado.participantesAcumulados.concat(resultado.registros);
    for (var t in resultado.tagsEncontrados) {
      if (estado.raceTagsEncontrados.indexOf(t) === -1) estado.raceTagsEncontrados.push(t);
    }

    estado.raceTotalClanesOk++;
    logRace(estado, '  ✔ ' + Object.keys(resultado.tagsEncontrados).length + ' jugador(es) leído(s).');

    estado.raceIndiceClan++;
    guardarEstadoRace(estado);
    setTimeout(function () { irAlSiguienteClanRace(estado); }, PAUSA_ENTRE_CLANES_MS);
  }

  function irAlSiguienteClanRace(estado) {
    if (estado.estado !== 'corriendo') { pintarPanel(); return; }
    if (_pausaPendiente(estado, guardarEstadoRace, logRace)) return;
    var siguienteTag = estado.clanTagsTerna[estado.raceIndiceClan];
    if (!siguienteTag) { terminarRace(estado); return; }
    location.href = construirUrlRace(siguienteTag);
  }

  /**
   * terminarRace(estado)
   * Cierra el flujo: manda TODO lo acumulado en un solo request a
   * accion=verificarSemanaActual (Sección 7 del consolidado) -- a
   * diferencia de Corrección de Guerra/Historial, acá no hace falta lotear
   * durante el recorrido porque son ~100 jugadores como mucho (4 clanes).
   * El backend NUNCA escribe directo sobre Guerra/Control_2 con esto -- solo
   * calcula discrepancias y las deja pendientes de aprobación manual (ver
   * aprobarCorreccionesRiverRacePendientes(), 25_CorreccionRiverRace.gs).
   */
  function terminarRace(estado) {
    estado.estado = 'terminado';
    if (estado.participantesAcumulados.length === 0) {
      logRace(estado, '✅ Verificación terminada -- sin jugadores leídos (revisar errores arriba).');
      guardarEstadoRace(estado);
      pintarPanel();
      return;
    }
    var participantes = estado.participantesAcumulados;
    guardarEstadoRace(estado);
    logRace(estado, 'Enviando ' + participantes.length + ' jugador(es) al backend para comparar contra Guerra...');
    enviarVerificacionRace(participantes, function (err, resp) {
      if (err || !resp || !resp.ok) {
        logRace(estado, '⚠ ' + (err || (resp && resp.error) || 'respuesta inválida del backend') +
          ' -- nada se guardó como pendiente. La próxima corrida vuelve a intentar desde cero.');
      } else {
        estado.totalProcesados = resp.procesados || 0;
        estado.totalDiscrepancias = resp.discrepancias || 0;
        logRace(estado, '✅ Verificación terminada: ' + estado.totalProcesados + ' jugador(es) comparado(s), ' +
          estado.totalDiscrepancias + ' discrepancia(s) nueva(s) dejada(s) pendiente(s) de aprobación' +
          (resp.yaResueltas ? ' (' + resp.yaResueltas + ' con fila ya resuelta, no sobreescrita -- ver log del backend)' : '') +
          (resp.omitidos ? ', ' + resp.omitidos + ' omitido(s) por dato inválido' : '') + '.');
      }
      guardarEstadoRace(estado);
      pintarPanel();
    });
  }

  // =========================================================================
  // PANEL FLOTANTE (UI) — extendido con la sección de "Nuevos"
  // =========================================================================
  var panelEl = null;

  // FIX (21-sep-2026, pedido usuario: "que el tamaño de la ventana se pueda
  // ajustar a voluntad, igual que cualquier pestaña"). El panel ahora se
  // puede redimensionar arrastrando su esquina inferior derecha (CSS
  // resize:both, igual que cualquier <textarea> del navegador), sin límite
  // fijo salvo un mínimo (para no poder achicarlo hasta desaparecer) y un
  // máximo generoso (para no poder sacarlo de la pantalla). Como el script
  // navega a una página nueva todo el tiempo (cada jugador/clan es una
  // navegación distinta), el panel se recrea en cada carga — sin guardar el
  // tamaño, cualquier ajuste manual se perdería en la siguiente página. Por
  // eso el tamaño elegido se guarda en Tampermonkey (GM_setValue) con un
  // ResizeObserver y se restaura acá al crear el panel.
  var PANEL_SIZE_KEY = 'cg_panel_size_v1';

  function _leerTamanoPanelGuardado() {
    try {
      var v = JSON.parse(GM_getValue(PANEL_SIZE_KEY, '') || 'null');
      if (v && typeof v.w === 'number' && typeof v.h === 'number' && v.w > 0 && v.h > 0) return v;
    } catch (e) { /* valor corrupto o inexistente: se ignora, el panel usa su tamaño por defecto */ }
    return null;
  }

  function _guardarTamanoPanel(w, h) {
    try { GM_setValue(PANEL_SIZE_KEY, JSON.stringify({ w: w, h: h })); } catch (e) { /* no crítico */ }
  }

  function crearPanel() {
    if (panelEl) return panelEl;
    panelEl = document.createElement('div');
    panelEl.id = 'cg-panel';
    panelEl.style.cssText =
      'position:fixed;bottom:16px;right:16px;width:360px;height:480px;' +
      'min-width:260px;min-height:160px;max-width:95vw;max-height:95vh;' +
      'background:#111;color:#eee;font:12px/1.4 monospace;border:1px solid #444;' +
      'border-radius:8px;box-shadow:0 4px 18px rgba(0,0,0,.5);z-index:999999;' +
      'display:flex;flex-direction:column;overflow:auto;resize:both;';

    // Tamaño recordado de una navegación anterior (si lo hay) — se aplica
    // ANTES de agregar al DOM para que no se note un "salto" de tamaño.
    var guardado = _leerTamanoPanelGuardado();
    if (guardado) {
      panelEl.style.width = guardado.w + 'px';
      panelEl.style.height = guardado.h + 'px';
    }

    document.body.appendChild(panelEl);

    // Persistir cualquier cambio de tamaño (arrastrar la esquina) para que
    // sobreviva a la próxima navegación. ResizeObserver es estándar en todos
    // los navegadores donde corre Tampermonkey; si por algún motivo no
    // existiera, el panel sigue siendo redimensionable, solo que el tamaño
    // no se recordaría entre páginas.
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function () {
        _guardarTamanoPanel(Math.round(panelEl.offsetWidth), Math.round(panelEl.offsetHeight));
      });
      ro.observe(panelEl);
    }

    return panelEl;
  }

  function seccionHtml(titulo, estado, prefijo, itemsLabel) {
    if (!estado) {
      return '<div id="' + prefijo + '-seccion" style="padding:10px;border-top:1px solid #333;">' +
        '<div style="font-weight:bold;margin-bottom:6px;">' + titulo + '</div>' +
        '<button id="' + prefijo + '-btn-iniciar" style="width:100%;padding:8px;background:#2b7a2b;color:#fff;border:0;border-radius:4px;cursor:pointer;">▶ Iniciar</button>' +
        '</div>';
    }
    // Corrección de Guerra ahora tiene 3 fases (estado.fase): 'analytics' y
    // 'log' muestran progreso por CLAN, no por jugador — recién al pasar a
    // 'perfiles' vuelve al progreso de siempre.
    var faseActual = estado.fase; // 'analytics' | 'log' | 'perfiles' | 'race' | undefined (Nuevos)
    var esFasePorClan = faseActual === 'analytics' || faseActual === 'log' || faseActual === 'race';
    var indiceClanCampo = faseActual === 'analytics' ? 'analyticsIndiceClan' : faseActual === 'race' ? 'raceIndiceClan' : 'logIndiceClan';
    var tagsEncontradosCampo = faseActual === 'analytics' ? 'analyticsTagsEncontrados' : faseActual === 'race' ? 'raceTagsEncontrados' : 'logTagsEncontrados';

    var total = esFasePorClan
      ? estado.clanTagsTerna.length
      : (estado.jugadores ? estado.jugadores.length : estado.candidatos.length);
    var indiceActual = esFasePorClan ? estado[indiceClanCampo] : estado.indice;
    var pct = total ? Math.round((indiceActual / total) * 100) : 0;
    var actual = esFasePorClan
      ? estado.clanTagsTerna[estado[indiceClanCampo]]
      : (estado.jugadores || estado.candidatos)[estado.indice];
    var estadoTexto = estado.estado === 'corriendo' ? '⏳ Corriendo' : estado.estado === 'pausado' ? '⏸ Pausado' : '✅ Terminado';
    var contador = estado.totalDiscrepancias !== undefined
      ? ('Discrepancias pendientes: ' + estado.totalDiscrepancias + ' (comparados: ' + estado.totalProcesados + ')')
      : estado.totalAplicadas !== undefined
      ? ('Correcciones aplicadas: ' + estado.totalAplicadas)
      : ('Filas nuevas: ' + (estado.totalFilasNuevas || 0) + ' (procesados: ' + estado.totalNuevosDetectados + ')');
    var etiquetaFase = faseActual === 'analytics' ? ' — Analytics (respaldo)'
      : faseActual === 'log' ? ' — Log'
      : faseActual === 'perfiles' ? ' — Perfiles' : '';

    return '<div id="' + prefijo + '-seccion" style="padding:10px;border-top:1px solid #333;">' +
      '<div style="font-weight:bold;display:flex;justify-content:space-between;margin-bottom:6px;">' +
        '<span>' + titulo + etiquetaFase + '</span><span>' + estadoTexto + '</span>' +
      '</div>' +
      '<div style="background:#333;border-radius:4px;overflow:hidden;height:8px;margin-bottom:6px;">' +
        '<div style="background:#2b7a2b;height:8px;width:' + pct + '%;"></div>' +
      '</div>' +
      (esFasePorClan
        ? '<div>' + indiceActual + ' / ' + total + ' clan(es) (' + pct + '%)</div>' +
          (actual ? '<div>Actual: ' + actual + '</div>' : '') +
          '<div>Jugadores cubiertos hasta ahora: ' + estado[tagsEncontradosCampo].length + '</div>'
        : '<div>' + indiceActual + ' / ' + total + ' ' + itemsLabel + ' (' + pct + '%)</div>' +
          (actual ? '<div>Actual: ' + actual.nombre + ' (' + actual.tag + ')</div>' : '')
      ) +
      '<div>' + contador + '</div>' +
      '<div style="margin-top:8px;display:flex;gap:6px;">' +
        (estado.estado === 'corriendo'
          ? '<button id="' + prefijo + '-btn-pausar" style="flex:1;padding:6px;background:#a06a00;color:#fff;border:0;border-radius:4px;cursor:pointer;">⏸ Pausar</button>'
          : estado.estado === 'pausado'
          ? '<button id="' + prefijo + '-btn-reanudar" style="flex:1;padding:6px;background:#2b7a2b;color:#fff;border:0;border-radius:4px;cursor:pointer;">▶ Reanudar</button>'
          : '') +
        '<button id="' + prefijo + '-btn-reiniciar" style="flex:1;padding:6px;background:#7a2b2b;color:#fff;border:0;border-radius:4px;cursor:pointer;">↺ Reiniciar</button>' +
      '</div>' +
      '<div style="margin-top:8px;max-height:120px;overflow-y:auto;font-size:11px;color:#aaa;">' +
        estado.log.slice(-25).map(function (l) { return '<div>' + l.replace(/</g, '&lt;') + '</div>'; }).join('') +
      '</div>' +
    '</div>';
  }

  /**
   * mostrarCargando(prefijo, titulo, mensaje)
   * FIX (16-sep-2026, pedido usuario: "que aparezca algo tipo Cargando
   * porque no sale nada ahora" -- mientras pedirListaCandidatosNuevos()
   * está en vuelo, o reintentando tras un fallo transitorio del backend
   * -- ver docblock de pedirListaCandidatosNuevosConReintento() más abajo
   * -- la sección se quedaba mostrando el botón "Iniciar" sin ningún
   * indicio de que ya se hizo click, hasta que llegaba la respuesta o el
   * alert de error final).
   * Reemplaza el contenido de la sección (identificada por su id
   * "<prefijo>-seccion", ver seccionHtml()) con un mensaje de carga simple.
   * Es puramente visual: no toca el estado persistido (GM_setValue), así
   * que se sobrescribe solo apenas pintarPanel() vuelva a correr (al
   * llegar la respuesta real, al fallar definitivamente, o en el próximo
   * reintento con un mensaje distinto).
   * @param {string} prefijo  'cg' | 'nuevos' | 'race'.
   * @param {string} titulo   Mismo título que se le pasa a seccionHtml().
   * @param {string} mensaje  Texto a mostrar junto al ícono de carga.
   */
  function mostrarCargando(prefijo, titulo, mensaje) {
    var sec = document.getElementById(prefijo + '-seccion');
    if (!sec) return;
    sec.innerHTML =
      '<div style="font-weight:bold;margin-bottom:6px;">' + titulo + '</div>' +
      '<div style="color:#aaa;">⏳ ' + mensaje + '</div>';
  }

  function pintarPanel() {
    var el = crearPanel();
    var estadoCG = cargarEstado();
    var estadoNuevos = cargarEstadoNuevos();
    var estadoRace = cargarEstadoRace();

    // Si ninguno de los tres procesos está corriendo/activo, mostrar solo
    // los tres botones de "Iniciar" (comportamiento equivalente al original,
    // extendido con la tercera sección).
    // FIX (20-sep-2026): el encabezado lleva ahora el botón 🔑 (editar los
    // tokens guardados en Tampermonkey, ver editarTokens()).
    el.innerHTML =
      '<div style="padding:10px;font-weight:bold;background:#222;display:flex;justify-content:space-between;align-items:center;">' +
        '<span>Familia Terna — RoyaleAPI</span>' +
        '<span>' +
          '<button id="cg-btn-diag" title="Probar la conexión y cada token (no modifica datos)" style="padding:2px 8px;margin-right:6px;background:#333;color:#eee;border:1px solid #555;border-radius:4px;cursor:pointer;">🩺</button>' +
          '<button id="cg-btn-tokens" title="Actualizar los tokens guardados" style="padding:2px 8px;background:#333;color:#eee;border:1px solid #555;border-radius:4px;cursor:pointer;">🔑</button>' +
        '</span>' +
      '</div>' +
      seccionHtml('Corrección de Guerra', estadoCG, 'cg', 'jugadores') +
      seccionHtml('Buscar miembros nuevos', estadoNuevos, 'nuevos', 'candidatos') +
      seccionHtml('Verificar Semana en Curso', estadoRace, 'race', 'jugadores');

    // --- Tokens: listener ---
    var btk = document.getElementById('cg-btn-tokens');
    if (btk) btk.onclick = editarTokens;
    var bdg = document.getElementById('cg-btn-diag');
    if (bdg) bdg.onclick = probarConexion;

    // --- Corrección de Guerra: listeners ---
    var b = document.getElementById('cg-btn-iniciar');
    if (b) b.onclick = iniciarProcesoCorreccion;
    var bp = document.getElementById('cg-btn-pausar');
    if (bp) bp.onclick = function () { estadoCG.estado = 'pausado'; guardarEstado(estadoCG); pintarPanel(); };
    var br = document.getElementById('cg-btn-reanudar');
    if (br) br.onclick = function () {
      _reanudarPausas();
      estadoCG.estado = 'corriendo'; guardarEstado(estadoCG);
      if (estadoCG.fase === 'riverrace') irAlSiguienteClanRiverRace(estadoCG);
      else if (estadoCG.fase === 'analytics') irAlSiguienteClanAnalytics(estadoCG);
      else if (estadoCG.fase === 'log') irAlSiguienteClanLog(estadoCG);
      else irAlSiguientePerfil(estadoCG);
    };
    var bx = document.getElementById('cg-btn-reiniciar');
    if (bx) bx.onclick = function () {
      if (confirm('¿Reiniciar la Corrección de Guerra desde cero?')) { borrarEstado(); pintarPanel(); }
    };

    // --- Nuevos: listeners ---
    var bn = document.getElementById('nuevos-btn-iniciar');
    if (bn) bn.onclick = iniciarProcesoNuevos;
    var bnp = document.getElementById('nuevos-btn-pausar');
    if (bnp) bnp.onclick = function () { estadoNuevos.estado = 'pausado'; guardarEstadoNuevos(estadoNuevos); pintarPanel(); };
    var bnr = document.getElementById('nuevos-btn-reanudar');
    if (bnr) bnr.onclick = function () { _reanudarPausas(); estadoNuevos.estado = 'corriendo'; guardarEstadoNuevos(estadoNuevos); irAlSiguienteCandidato(estadoNuevos); };
    var bnx = document.getElementById('nuevos-btn-reiniciar');
    if (bnx) bnx.onclick = function () {
      if (confirm('¿Reiniciar la búsqueda de miembros nuevos desde cero?')) { borrarEstadoNuevos(); pintarPanel(); }
    };

    // --- Verificar Semana en Curso: listeners ---
    var brc = document.getElementById('race-btn-iniciar');
    if (brc) brc.onclick = iniciarProcesoRace;
    var brp = document.getElementById('race-btn-pausar');
    if (brp) brp.onclick = function () { estadoRace.estado = 'pausado'; guardarEstadoRace(estadoRace); pintarPanel(); };
    var brr = document.getElementById('race-btn-reanudar');
    if (brr) brr.onclick = function () {
      _reanudarPausas();
      estadoRace.estado = 'corriendo'; guardarEstadoRace(estadoRace);
      irAlSiguienteClanRace(estadoRace);
    };
    var brx = document.getElementById('race-btn-reiniciar');
    if (brx) brx.onclick = function () {
      if (confirm('¿Reiniciar la Verificación de Semana en Curso desde cero?')) { borrarEstadoRace(); pintarPanel(); }
    };
  }

  function iniciarProcesoCorreccion() {
    if (WEBAPP_URL.indexOf('PEGA_AQUI') >= 0) {
      alert('Antes de iniciar, edita el userscript y pega tu URL de Web App en WEBAPP_URL.');
      return;
    }
    // FIX (20-sep-2026): Corrección de Guerra usa 2 tokens (CORRECCION_GUERRA_TOKEN
    // para la lista y las correcciones, HISTORIAL_GUERRA_TOKEN para el
    // histórico). Se piden ANTES de empezar, así un token faltante no
    // aparece a mitad de la corrida.
    asegurarTokens(['cg', 'historial'],
      'Corrección de Guerra necesita estos tokens para pedir la lista, enviar las correcciones y el histórico.',
      function (ok) {
        if (!ok) {
          alert('Falta un token: sin él el backend rechaza las solicitudes. Vuelve a pulsar Iniciar y pégalo en el formulario (o usa el botón 🔑 del panel).');
          pintarPanel();
          return;
        }
        // PUNTO 3 (Sección 4 del consolidado): "Backfill único, la primera vez"
        // vs. corridas recurrentes. Se pregunta explícitamente en vez de
        // auto-detectarlo — el backend todavía no expone qué tags ya tienen
        // backfillPerfilHecho=true (P1), así que no hay de dónde inferirlo sin
        // asumir. El usuario elige cada corrida; para el uso normal (recurrente)
        // solo hay que aceptar el default (Cancelar = NO backfill).
        var modoBackfill = confirm(
          '¿Es esta la corrida de BACKFILL inicial del histórico de Guerra?\n\n' +
          'Aceptar = SÍ, backfill: se visita el Perfil de TODOS los miembros activos (más lento, trae más historial).\n' +
          'Cancelar = NO, corrida recurrente normal: Perfil solo para quienes Log/Analytics no cubran.'
        );
        conReintentoPorToken('cg', pedirListaJugadoresConCargando('cg', 'Corrección de Guerra'), function (err, data) {
          if (err || !data || !data.ok) {
            alert('No se pudo obtener la lista de jugadores: ' + (err || (data && data.error) || 'respuesta vacía'));
            pintarPanel(); // FIX (20-sep-2026): saca el mensaje «Cargando…» y vuelve a mostrar el botón Iniciar
            return;
          }
          var estado = estadoInicial(data.jugadores, data.clanesTerna, data.clanTagsTerna, data.coberturaPorTag, modoBackfill,
            data.temporadaRoyaleApiActual, data.semanaActual);
          guardarEstado(estado);
          log(estado, 'Lista obtenida: ' + data.jugadores.length + ' jugador(es) activo(s) en clanes Terna.' +
            (modoBackfill ? ' Modo BACKFILL activado.' : ''));
          if (estado.fase === 'riverrace') {
            log(estado, 'Empezando por la semana en curso: River Race (' + estado.clanTagsTerna.length +
              ' clan(es)) — Temporada ' + estado.temporadaRoyaleApiActual + ', Semana ' + estado.semanaActual + '.');
            irAlSiguienteClanRiverRace(estado);
          } else if (estado.fase === 'log') {
            log(estado, 'Empezando por el Log: ' + estado.clanTagsTerna.length + ' página(s) de War Log (una por clan; Analytics solo de respaldo).' +
              (data.clanTagsTerna && data.clanTagsTerna.length && (data.temporadaRoyaleApiActual === null || data.temporadaRoyaleApiActual === undefined) ?
                ' (Se saltó River Race esta corrida: el backend no mandó temporada/semana válida.)' : ''));
            irAlSiguienteClanLog(estado);
          } else {
            log(estado, 'El backend no envió clanTagsTerna (versión anterior) — se usa directo el método de perfil por perfil.');
            irAlSiguientePerfil(estado);
          }
        });
      });
  }

  function iniciarProcesoNuevos() {
    if (WEBAPP_URL.indexOf('PEGA_AQUI') >= 0) {
      alert('Antes de iniciar, edita el userscript y pega tu URL de Web App en WEBAPP_URL.');
      return;
    }
    // FIX (20-sep-2026): token de Nuevos pedido antes de arrancar (ver
    // asegurarTokens()). Si el backend lo rechaza (401) más adelante,
    // conReintentoPorToken() lo vuelve a pedir una vez.
    asegurarTokens(['nuevos'], 'Buscar miembros nuevos necesita este token.', function (ok) {
      if (!ok) {
        alert('Falta el token de Miembros nuevos: sin él el backend rechaza las solicitudes. Vuelve a pulsar Iniciar y pégalo en el formulario (o usa el botón 🔑 del panel).');
        pintarPanel();
        return;
      }
      // FIX (16-sep-2026): antes se llamaba directo a pedirListaCandidatosNuevos()
      // -- sin indicio visual de carga ni reintento ante un fallo transitorio
      // del backend. Ver docblock de pedirListaCandidatosNuevosConReintento()
      // y de mostrarCargando(), ambas más arriba.
      conReintentoPorToken('nuevos', pedirListaCandidatosNuevosConReintento, function (err, data) {
        if (err || !data || !data.ok) {
          alert('No se pudo obtener la lista de candidatos: ' + (err || (data && data.error) || 'respuesta vacía'));
          // FIX (16-sep-2026): sin este repintado, la sección se quedaba
          // colgada en el último mensaje de mostrarCargando() ("Reintentando...")
          // tras el fallo final, sin volver a mostrar el botón "Iniciar".
          pintarPanel();
          return;
        }
        var estado = estadoInicialNuevos(data.candidatos, data.clanesTerna, data.coberturaPorTag);
        guardarEstadoNuevos(estado);
        logNuevos(estado, 'Lista obtenida: ' + data.candidatos.length + ' candidato(s) (Miembro, no-admin) a revisar.');
        irAlSiguienteCandidato(estado);
      });
    });
  }

  /**
   * iniciarProcesoRace()
   * Reusa accion=listaCorreccionGuerra (mismo endpoint que ya usa
   * Corrección de Guerra) -- ya trae clanesTerna/clanTagsTerna, que es todo
   * lo que este flujo necesita para saber qué 4 páginas /war/race visitar.
   * No hace falta pedir confirm() de backfill ni nada parecido -- este
   * flujo siempre trabaja con la semana en curso, sin modos.
   * FIX (20-sep-2026): usa 2 tokens: el de Corrección de Guerra (para pedir
   * la lista de clanes) y el de Verificar semana (para enviar el resultado).
   * También muestra «Cargando…» mientras llega la lista (antes no decía nada).
   */
  function iniciarProcesoRace() {
    if (WEBAPP_URL.indexOf('PEGA_AQUI') >= 0) {
      alert('Antes de iniciar, edita el userscript y pega tu URL de Web App en WEBAPP_URL.');
      return;
    }
    asegurarTokens(['cg', 'race'],
      'Verificar semana en curso pide la lista de clanes con el token de Corrección de Guerra y envía el resultado con el de Verificar semana.',
      function (ok) {
        if (!ok) {
          alert('Falta un token: sin él el backend rechaza las solicitudes. Vuelve a pulsar Iniciar y pégalo en el formulario (o usa el botón 🔑 del panel).');
          pintarPanel();
          return;
        }
        conReintentoPorToken('cg', pedirListaJugadoresConCargando('race', 'Verificar Semana en Curso'), function (err, data) {
          if (err || !data || !data.ok) {
            alert('No se pudo obtener la lista de clanes: ' + (err || (data && data.error) || 'respuesta vacía'));
            pintarPanel();
            return;
          }
          if (!data.clanTagsTerna || !data.clanTagsTerna.length) {
            alert('El backend no envió clanTagsTerna -- no se puede verificar la semana en curso sin saber qué clanes visitar.');
            pintarPanel();
            return;
          }
          var estado = estadoInicialRace(data.jugadores, data.clanesTerna, data.clanTagsTerna);
          guardarEstadoRace(estado);
          logRace(estado, 'Lista obtenida: ' + estado.clanTagsTerna.length + ' clan(es) Terna a visitar.');
          irAlSiguienteClanRace(estado);
        });
      });
  }

  // =========================================================================
  // ARRANQUE — al cargar cualquier página de royaleapi.com
  // =========================================================================
  try { GM_deleteValue('cg_estado_v3'); } catch (e) {} // v2.9: estado de la versión anterior (orden de fases distinto), ya no reanudable
  var estadoActualCG = cargarEstado();
  var estadoActualNuevos = cargarEstadoNuevos();
  var estadoActualRace = cargarEstadoRace();
  pintarPanel();

  // Solo UNO de los dos procesos puede estar "corriendo" navegando a la vez
  // (comparten la pestaña del navegador). Si ambos quedaran en 'corriendo'
  // por algún motivo, se prioriza Corrección de Guerra y Nuevos queda a la
  // espera de que el usuario le dé "Reanudar" manualmente tras terminar el
  // otro.
  if (estadoActualCG && estadoActualCG.estado === 'corriendo' && estadoActualCG.fase === 'riverrace') {
    var tagClanEsperadoRR = estadoActualCG.clanTagsTerna[estadoActualCG.riverraceIndiceClan];
    if (!tagClanEsperadoRR) {
      avanzarAFaseLogPrincipal(estadoActualCG);
    } else if (location.href.indexOf(String(tagClanEsperadoRR).replace('#', '')) === -1 ||
               location.href.indexOf('/war/race') === -1) {
      location.href = construirUrlRiverRace(tagClanEsperadoRR);
    } else {
      procesarClanRiverRaceActual(estadoActualCG);
    }
  } else if (estadoActualCG && estadoActualCG.estado === 'corriendo' && estadoActualCG.fase === 'analytics') {
    _saltarClanesConLogOk(estadoActualCG); // v2.9: Analytics es solo respaldo de los clanes sin Log
    var tagClanEsperado = estadoActualCG.clanTagsTerna[estadoActualCG.analyticsIndiceClan];
    if (!tagClanEsperado) {
      avanzarAFasePerfiles(estadoActualCG);
    } else if (location.href.indexOf(String(tagClanEsperado).replace('#', '')) === -1 ||
               location.href.indexOf('/war/analytics') === -1) {
      location.href = construirUrlAnalytics(tagClanEsperado);
    } else {
      procesarClanAnalyticsActual(estadoActualCG);
    }
  } else if (estadoActualCG && estadoActualCG.estado === 'corriendo' && estadoActualCG.fase === 'log') {
    var tagClanEsperadoLog = estadoActualCG.clanTagsTerna[estadoActualCG.logIndiceClan];
    if (!tagClanEsperadoLog) {
      cerrarFaseLog(estadoActualCG);
    } else if (location.href.indexOf(String(tagClanEsperadoLog).replace('#', '')) === -1 ||
               location.href.indexOf('/war/log') === -1) {
      location.href = construirUrlLog(tagClanEsperadoLog);
    } else {
      procesarClanLogActual(estadoActualCG);
    }
  } else if (estadoActualCG && estadoActualCG.estado === 'corriendo') {
    var jugadorEsperado = estadoActualCG.jugadores[estadoActualCG.indice];
    if (jugadorEsperado && location.href.indexOf(jugadorEsperado.tag.replace('#', '')) === -1 &&
        location.href.indexOf(jugadorEsperado.royaleApiUrl) === -1) {
      location.href = jugadorEsperado.royaleApiUrl;
    } else if (jugadorEsperado) {
      procesarJugadorActual(estadoActualCG);
    } else {
      terminar(estadoActualCG);
    }
  } else if (estadoActualNuevos && estadoActualNuevos.estado === 'corriendo') {
    var candidatoEsperado = estadoActualNuevos.candidatos[estadoActualNuevos.indice];
    if (candidatoEsperado && location.href.indexOf(candidatoEsperado.tag.replace('#', '')) === -1 &&
        location.href.indexOf(candidatoEsperado.royaleApiUrl) === -1) {
      location.href = candidatoEsperado.royaleApiUrl;
    } else if (candidatoEsperado) {
      procesarCandidatoActual(estadoActualNuevos);
    } else {
      terminarNuevos(estadoActualNuevos);
    }
  } else if (estadoActualRace && estadoActualRace.estado === 'corriendo') {
    // Verificar Semana en Curso (fase `race`) -- cuarto flujo, prioridad más
    // baja: solo navega la pestaña si ninguno de los otros dos (Corrección
    // de Guerra / Nuevos) está corriendo en este momento.
    var tagClanEsperadoRace = estadoActualRace.clanTagsTerna[estadoActualRace.raceIndiceClan];
    if (!tagClanEsperadoRace) {
      terminarRace(estadoActualRace);
    } else if (location.href.indexOf(String(tagClanEsperadoRace).replace('#', '')) === -1 ||
               location.href.indexOf('/war/race') === -1) {
      location.href = construirUrlRace(tagClanEsperadoRace);
    } else {
      procesarClanRaceActual(estadoActualRace);
    }
  }
})();