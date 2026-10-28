// 42_Web_TiemposActualizacion.gs
// Horas de actualización que debe mostrar la web (creado 05-oct-2026, pedido del usuario). [→ Contexto_Base_Web.md §42B001]
//
// Qué horas hay (web, API de clanes, mensajes), objeto de _tiemposActualizacionWeb_(), función manual y AVISOS ABIERTOS (4 pendientes de definir). [→ Contexto_Base_Web.md §42B002]

// ORDEN DE ESTE ARCHIVO (regla 0.9 de la skill; 27-oct-2026): primero las constantes y variables globales; luego, por partes:
//  Parte 1 — Funciones que se corren a mano
//    - Tiempos de actualización: ver en el registro
//  Parte 2 — Funciones que no se corren a mano
//    - Tiempos de actualización: registrar (los llaman la API de clanes y los mensajes)
//    - Tiempos de actualización: armar el objeto para la web
// Dentro de cada tema, en el orden en que se espera ejecutarlas. Al reordenar no se cambió el código de ninguna función.

var TIEMPOS_PROP_API = 'TIEMPOS_API_CLANES';

var TIEMPOS_PROP_MENSAJES = 'TIEMPOS_MENSAJES';

// Categorias de la hoja Mensajes que reconstruye generarTodosMensajes() (el resto sale de plantillas de Drive y su
// "hora de elaboracion" no aplica). El frontend las usa para decidir si muestra la hora junto al contenido.
var TIEMPOS_CATEGORIAS_MENSAJES_GENERADOS = ['Mensaje de Guerra', 'Celular', 'Etiqueta de miembro'];

// =============================================================================
// PARTE 1 — FUNCIONES QUE SE CORREN A MANO
// =============================================================================

// ----- Tiempos de actualización: ver en el registro -----

/** Manual: imprime el objeto completo en el log. */
function verTiemposActualizacion() {
  Logger.log(JSON.stringify(_tiemposActualizacionWeb_(), null, 2));
}

// =============================================================================
// PARTE 2 — FUNCIONES QUE NO SE CORREN A MANO
// =============================================================================

// ----- Tiempos de actualización: registrar (los llaman la API de clanes y los mensajes) -----

// Registro (lo llaman el bot, nunca la web)

// Registra la consulta a la API de clanes; nunca lanza error. [→ Contexto_Base_Web.md §42B003]
function _registrarConsultaApiClanes_(completa) {
  try {
    var props = PropertiesService.getScriptProperties();
    var ahora = Date.now();
    var previo = _tiemposLeerProp_(TIEMPOS_PROP_API) || {};
    var nuevo = {
      intentoTs: ahora,
      completa: completa === true,
      completaTs: completa === true ? ahora : (Number(previo.completaTs) || 0)
    };
    props.setProperty(TIEMPOS_PROP_API, JSON.stringify(nuevo));
  } catch (e) {
    Logger.log('[Tiempos] No se pudo registrar la consulta a la API: ' + e.message);
  }
}

// Registra la hora de elaboración de los mensajes; nunca lanza error. [→ Contexto_Base_Web.md §42B004]
function _registrarGeneracionMensajes_(ts, cantidad) {
  try {
    PropertiesService.getScriptProperties().setProperty(
      TIEMPOS_PROP_MENSAJES,
      JSON.stringify({ ts: Number(ts) || Date.now(), cantidad: Number(cantidad) || 0 })
    );
  } catch (e) {
    Logger.log('[Tiempos] No se pudo registrar la elaboracion de mensajes: ' + e.message);
  }
}

// ----- Tiempos de actualización: armar el objeto para la web -----

// Lectura (la usan los endpoints web)

// Arma el objeto completo de horas; nunca lanza error, deja en null lo que no pudo armar. [→ Contexto_Base_Web.md §42B005]
function _tiemposActualizacionWeb_(generadoTs) {
  var gen = Number(generadoTs) || Date.now();
  return {
    generadoTs: gen,
    generadoLima: _tiemposFechaLima_(gen),
    api: _tiemposApiWeb_(),
    mensajes: _tiemposMensajesWeb_()
  };
}

/** Bloque api.* del objeto de horas. */
function _tiemposApiWeb_() {
  var salida = {
    ultimaConsultaTs: null, ultimaConsultaLima: null,
    completa: null,
    ultimaCompletaTs: null, ultimaCompletaLima: null,
    origen: null
  };
  try {
    var reg = _tiemposLeerProp_(TIEMPOS_PROP_API);
    var intento = reg ? (Number(reg.intentoTs) || 0) : 0;
    var completaTs = reg ? (Number(reg.completaTs) || 0) : 0;
    var completa = reg ? (reg.completa === true) : null;
    var origen = intento ? 'registro' : null;

    // Respaldo mientras no haya registro: hora del checkpoint de clanes en Drive (solo existe si la ultima captura
    // fue completa y no lo borro runAll()/runUpdate()).
    if (!intento && typeof _leerProgresoClanesConEdad_ === 'function') {
      var cp = _leerProgresoClanesConEdad_();
      if (cp && cp.ts > 0) {
        intento = cp.ts;
        completaTs = cp.ts;
        completa = true;
        origen = 'respaldo';
      }
    }

    if (intento) {
      salida.ultimaConsultaTs = intento;
      salida.ultimaConsultaLima = _tiemposFechaLima_(intento);
      salida.completa = completa;
      salida.origen = origen;
    }
    if (completaTs) {
      salida.ultimaCompletaTs = completaTs;
      salida.ultimaCompletaLima = _tiemposFechaLima_(completaTs);
    }
  } catch (e) {
    Logger.log('[Tiempos] No se pudo leer la hora de la API: ' + e.message);
  }
  return salida;
}

/** Bloque mensajes.* del objeto de horas. Se usa tambien en _webAdminContenido() (37_Web_API.gs). */
function _tiemposMensajesWeb_() {
  var salida = { generadosTs: null, generadosLima: null, cantidad: null, origen: null };
  try {
    var reg = _tiemposLeerProp_(TIEMPOS_PROP_MENSAJES);
    var ts = reg ? (Number(reg.ts) || 0) : 0;
    var cantidad = reg ? (Number(reg.cantidad) || 0) : null;
    var origen = ts ? 'registro' : null;

    // Respaldo mientras no haya registro: columna Fecha de la primera fila de la hoja Mensajes (todas las filas de una
    // misma generacion llevan la misma hora).
    if (!ts && typeof MC !== 'undefined' && typeof CFG !== 'undefined' && CFG.SHEETS && CFG.SHEETS.MENSAJES) {
      var sh = _getSs().getSheetByName(CFG.SHEETS.MENSAJES);
      if (sh && sh.getLastRow() >= 2) {
        var v = sh.getRange(2, MC.FECHA).getValue();
        if (v instanceof Date && !isNaN(v.getTime())) {
          ts = v.getTime();
          origen = 'respaldo';
        }
      }
    }

    if (ts) {
      salida.generadosTs = ts;
      salida.generadosLima = _tiemposFechaLima_(ts);
      salida.cantidad = cantidad;
      salida.origen = origen;
    }
  } catch (e) {
    Logger.log('[Tiempos] No se pudo leer la hora de los mensajes: ' + e.message);
  }
  return salida;
}

/** true si la categoria es de las que reconstruye generarTodosMensajes() (la hora de elaboracion le aplica). */
function _tiemposCategoriaEsGenerada_(categoria) {
  return TIEMPOS_CATEGORIAS_MENSAJES_GENERADOS.indexOf(String(categoria || '').trim()) !== -1;
}

// Helpers internos

function _tiemposLeerProp_(nombre) {
  try {
    var raw = PropertiesService.getScriptProperties().getProperty(nombre);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    Logger.log('[Tiempos] Propiedad ' + nombre + ' ilegible, se ignora: ' + e.message);
    return null;
  }
}

/** 'dd/MM/yyyy HH:mm:ss' en hora de Lima; null si ms no es una hora valida. */
function _tiemposFechaLima_(ms) {
  var n = Number(ms);
  if (!n || n <= 0) return null;
  return Utilities.formatDate(new Date(n), 'America/Lima', 'dd/MM/yyyy HH:mm:ss');
}
